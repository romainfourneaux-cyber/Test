/* Terre Gravée · maquette version 3 « Showroom immersif ».
   Script commun : couleur LED, panier de démonstration, galerie, vitrine, configurateur.
   Le panier vit dans le navigateur : aucun paiement, aucun envoi. */
(function () {
  "use strict";

  var D = window.TG3 || { plaques: [], couleurs: [], finitions: [], img: "" };
  var CLE_PANIER = "tg3-panier";
  var CLE_LED = "tg3-led";
  var NB = " ";

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function euros(n) { return String(n) + NB + "€"; }

  var COUL = {}; D.couleurs.forEach(function (c) { COUL[c.id] = c; });
  var FIN = {}; D.finitions.forEach(function (f) { FIN[f.id] = f; });
  var PLQ = {}; D.plaques.forEach(function (p) { PLQ[p.s] = p; });
  var MURS = { platre: 1, beton: 1, brique: 1, bois: 1 };
  var CABLES = {}; (D.cables || []).forEach(function (c) { CABLES[c.id] = c.n; });
  var reduit = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var survolFin = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);

  /* ---------- Stockage local (toujours protégé) ---------- */
  function lireJSON(cle, defaut) {
    try { var v = window.localStorage.getItem(cle); return v === null ? defaut : JSON.parse(v); } catch (e) { return defaut; }
  }
  function ecrireJSON(cle, v) {
    try { window.localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ }
  }

  /* ---------- Configuration partageable : #le-pic-du-midi-dore-bleu ---------- */
  function lireHash(brut) {
    var h = String(brut || "").replace(/^#/, "").toLowerCase();
    if (!h || h.length > 80 || !/^[a-z0-9-]+$/.test(h)) return null;
    var slug = null;
    D.plaques.forEach(function (p) {
      if ((h === p.s || h.indexOf(p.s + "-") === 0) && (!slug || p.s.length > slug.length)) slug = p.s;
    });
    if (!slug) return null;
    /* couleur = kit LED dans la configuration ; « nuit » = aperçu de nuit seulement */
    var cfg = { slug: slug, fin: null, led: null, mur: null, nuit: false };
    h.slice(slug.length + 1).split("-").forEach(function (t) {
      if (!t) return;
      if (FIN[t]) cfg.fin = t;
      else if (COUL[t]) cfg.led = t;
      else if (MURS[t]) cfg.mur = t;
      else if (t === "nuit") cfg.nuit = true;
    });
    return cfg;
  }
  function chaineHash(cfg) {
    return cfg.slug + "-" + cfg.fin + (cfg.led ? "-" + cfg.led : "") + (cfg.nuit ? "-nuit" : "") + (cfg.mur ? "-" + cfg.mur : "");
  }
  function ecrireHash(cfg) {
    var h = chaineHash(cfg);
    try { history.replaceState(null, "", "#" + h); } catch (e) { /* navigation locale */ }
    return h;
  }
  function urlSansHash() { return String(location.href).split("#")[0]; }
  function srcPlaque(slug, fin, taille) { return D.img + "p/" + slug + "-" + fin + "-" + taille + ".webp"; }
  function srcVignette(slug, fin) {
    var v = "v/" + slug + "-" + fin + "-100.webp";
    return (D.vignettes || []).indexOf(v) >= 0 ? "assets/img/" + v : srcPlaque(slug, fin, 440);
  }
  function aPhoto(slug, fin) { var p = PLQ[slug]; return !!(p && p.p.indexOf(fin) >= 0); }
  function premiereFinition(slug, preferee) {
    if (aPhoto(slug, preferee)) return preferee;
    var p = PLQ[slug]; return p && p.p.length ? p.p[0] : "noir";
  }
  function resumeConfig(slug, fin, led, qte) {
    var p = PLQ[slug]; if (!p) return "";
    var prix = D.prixPlaque + (led ? D.prixLed : 0);
    var texte = p.n + " · " + FIN[fin].n + (led ? " · kit LED (" + COUL[led].n.toLowerCase() + ")" : "");
    if (qte && qte > 1) return texte + " : " + qte + " × " + euros(prix) + " = " + euros(prix * qte);
    return texte + " : " + euros(prix);
  }

  /* ---------- Couleur LED : accent de tout le site ---------- */
  function ledCourante() { var v = document.documentElement.getAttribute("data-led"); return COUL[v] ? v : "bleu"; }
  function appliquerLed(id, memoriser) {
    var c = COUL[id]; if (!c) return;
    var r = document.documentElement;
    r.style.setProperty("--led", c.hex);
    r.style.setProperty("--led-rgb", c.rgb);
    r.setAttribute("data-led", id);
    $$("[data-couleur-led]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-couleur-led") === id ? "true" : "false"); });
    $$("[data-nom-couleur]").forEach(function (el) { el.textContent = c.n.toLowerCase(); });
    if (memoriser) { try { window.localStorage.setItem(CLE_LED, id); } catch (e) { /* rien */ } }
    var ev; try { ev = new CustomEvent("tg3:led", { detail: id }); } catch (e) { ev = null; }
    if (ev) document.dispatchEvent(ev);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-couleur-led]") : null;
    if (b) appliquerLed(b.getAttribute("data-couleur-led"), true);
  });
  appliquerLed(ledCourante(), false);

  function avecTransition(fn) {
    if (document.startViewTransition && !reduit) {
      try { document.startViewTransition(fn); return; } catch (e) { /* repli */ }
    }
    fn();
  }

  /* ---------- Annonces et toast ---------- */
  var annonce = $("#annonce");
  function annoncer(t) { if (annonce) { annonce.textContent = ""; setTimeout(function () { annonce.textContent = t; }, 30); } }
  var toastEl = $(".toast");
  var minuteur = null;
  function toast(texte, avecPanier) {
    if (!toastEl) return;
    $(".toast__texte", toastEl).textContent = texte;
    $(".toast button", toastEl).hidden = !avecPanier;
    toastEl.classList.add("visible");
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { toastEl.classList.remove("visible"); }, 3600);
  }

  /* ---------- Copie ---------- */
  function copier(texte, bouton, libelleOk) {
    var initial = bouton ? bouton.getAttribute("data-libelle") || bouton.textContent : "";
    if (bouton && !bouton.getAttribute("data-libelle")) bouton.setAttribute("data-libelle", initial);
    function fini(msg) {
      if (bouton) { bouton.textContent = msg; setTimeout(function () { bouton.textContent = initial; }, 2600); }
      toast(msg, false);
    }
    function repli() {
      var zone = document.createElement("textarea");
      zone.value = texte; zone.setAttribute("readonly", ""); zone.style.position = "fixed"; zone.style.opacity = "0";
      document.body.appendChild(zone); zone.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(zone);
      fini(ok ? (libelleOk || "Copié") : "Copie impossible : sélectionnez le texte");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(libelleOk || "Copié"); }, repli);
    } else { repli(); }
  }
  $$("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cible = document.getElementById(b.getAttribute("data-copier"));
      if (cible) copier(cible.textContent.trim(), b, "Adresse copiée");
    });
  });
  function partager(titre, texte, url, bouton) {
    if (navigator.share) {
      navigator.share({ title: titre, text: texte, url: url }).catch(function () { /* partage annulé */ });
    } else { copier(url, bouton, "Lien copié, collez-le dans un message"); }
  }

  /* ---------- Menu mobile ---------- */
  var entete = $(".entete");
  var boutonMenu = $(".bouton-menu");
  function fermerMenu(rendreFocus) {
    if (!entete || !entete.classList.contains("menu-ouvert")) return;
    entete.classList.remove("menu-ouvert");
    boutonMenu.setAttribute("aria-expanded", "false");
    if (rendreFocus) boutonMenu.focus();
  }
  if (entete && boutonMenu) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = entete.classList.toggle("menu-ouvert");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermerMenu(true); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { fermerMenu(false); }); });
  }

  /* ---------- Panier de démonstration ---------- */
  var memoirePanier = [];
  function lirePanier() { var v = lireJSON(CLE_PANIER, null); return Array.isArray(v) ? v : memoirePanier; }
  function ecrirePanier(l) { memoirePanier = l; ecrireJSON(CLE_PANIER, l); afficherPanier(); }
  function ajouterAuPanier(a) {
    var lignes = lirePanier();
    var meme = null;
    lignes.forEach(function (l) { if (l.cle === a.cle) meme = l; });
    if (meme) meme.qte = Math.min(20, meme.qte + a.qte); else lignes.push(a);
    ecrirePanier(lignes);
    toast(a.nom + " ajouté au panier", true);
  }
  var dlg = $("#panier");
  function ouvrirPanier() {
    if (!dlg) return;
    if (toastEl) toastEl.classList.remove("visible");
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute("open", ""); }
  }
  function fermerPanier() { if (!dlg) return; if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
  $$("[data-ouvrir-panier]").forEach(function (b) { b.addEventListener("click", ouvrirPanier); });
  $$("[data-fermer-panier]").forEach(function (b) { b.addEventListener("click", fermerPanier); });
  if (dlg) dlg.addEventListener("click", function (e) { if (e.target === dlg) fermerPanier(); });
  if (toastEl) $(".toast button", toastEl).addEventListener("click", ouvrirPanier);

  function el(tag, cls, texte) { var n = document.createElement(tag); if (cls) n.className = cls; if (texte !== undefined) n.textContent = texte; return n; }
  function afficherPanier() {
    var lignes = lirePanier();
    var total = 0, nombre = 0;
    lignes.forEach(function (l) { total += (+l.prix || 0) * (+l.qte || 0); nombre += (+l.qte || 0); });
    $$(".compteur").forEach(function (c) { c.textContent = nombre; });
    var liste = $(".panier__liste");
    if (!liste) return;
    liste.innerHTML = "";
    if (!lignes.length) {
      var vide = el("div", "panier__vide");
      vide.appendChild(el("p", "", "Votre panier est vide."));
      var a = el("a", "lien-fleche", "Voir la galerie"); a.href = "collection.html";
      vide.appendChild(a);
      liste.appendChild(vide);
    }
    var sansLed = null;
    lignes.forEach(function (l, i) {
      var li = el("div", "ligne-panier");
      var img = document.createElement("img");
      img.alt = ""; img.width = 52; img.height = 104; img.loading = "lazy";
      if (l.image) img.src = l.image;
      var mil = el("div");
      mil.appendChild(el("strong", "", l.nom));
      (l.details || []).forEach(function (d) { mil.appendChild(el("span", "", d)); });
      mil.appendChild(el("span", "", "Quantité : " + l.qte));
      var retirer = el("button", "", "Retirer"); retirer.type = "button";
      retirer.setAttribute("aria-label", "Retirer " + l.nom + " du panier");
      retirer.setAttribute("data-retirer", String(i));
      retirer.addEventListener("click", function () {
        var ls = lirePanier(); ls.splice(i, 1); ecrirePanier(ls);
        /* garder la place au clavier : le « Retirer » suivant, sinon le titre du panier */
        var suivants = $$("[data-retirer]", liste);
        var cible = suivants[Math.min(i, suivants.length - 1)] || $("#titre-panier");
        if (cible) cible.focus();
        annoncer(l.nom + " retiré du panier");
      });
      mil.appendChild(retirer);
      li.appendChild(img); li.appendChild(mil); li.appendChild(el("span", "num", euros((+l.prix || 0) * (+l.qte || 0))));
      liste.appendChild(li);
      if (l.slug && PLQ[l.slug] && !l.led && !sansLed) sansLed = l;
    });
    if (sansLed) {
      var s = el("div", "panier__suggestion");
      s.appendChild(el("strong", "", "Accessoire compatible avec votre plaque"));
      s.appendChild(el("span", "attenue", "Le kit LED (15\u00a0€) se monte au dos de la plaque par l’atelier, avant l’envoi. Il reste facultatif."));
      var lien = el("a", "lien-fleche", "Configurer " + sansLed.nom + " avec le kit LED (+15\u00a0€)");
      lien.href = "produit-" + sansLed.slug + ".html#" + sansLed.slug + "-" + (sansLed.fin || "noir") + "-" + ledCourante();
      s.appendChild(lien);
      liste.appendChild(s);
    }
    var t = $(".panier__total strong"); if (t) t.textContent = euros(total);
  }
  afficherPanier();

  /* ---------- Formulaires de démonstration ---------- */
  /* Validation en français, sans bulles natives (novalidate), liée aux champs par aria-describedby. */
  var nErreur = 0;
  function erreurDe(champ) {
    if (champ.type === "checkbox") return champ.checked ? "" : (champ.getAttribute("data-erreur-vide") || "Cochez cette case.");
    var v = String(champ.value || "").trim();
    if (!v) return champ.getAttribute("data-erreur-vide") || "Ce champ est obligatoire.";
    if (champ.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return champ.getAttribute("data-erreur-format") || "Adresse e-mail non valide.";
    return "";
  }
  function marquerChamp(champ, texte) {
    var id = champ.getAttribute("data-erreur-id");
    if (!id) { id = "erreur-" + (++nErreur); champ.setAttribute("data-erreur-id", id); }
    var p = document.getElementById(id);
    if (!p) {
      p = el("p", "erreur-champ"); p.id = id;
      var bloc = champ.closest(".champ") || champ.parentNode;
      bloc.appendChild(p);
    }
    var desc = (champ.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x && x !== id; });
    if (texte) {
      p.textContent = texte; p.hidden = false;
      champ.setAttribute("aria-invalid", "true");
      desc.push(id);
    } else {
      p.textContent = ""; p.hidden = true;
      champ.removeAttribute("aria-invalid");
    }
    if (desc.length) champ.setAttribute("aria-describedby", desc.join(" ")); else champ.removeAttribute("aria-describedby");
  }
  $$("form[data-demo]").forEach(function (f) {
    var requis = $$("[required]", f);
    requis.forEach(function (c) {
      c.addEventListener(c.type === "checkbox" ? "change" : "input", function () {
        if (c.getAttribute("aria-invalid") === "true") marquerChamp(c, erreurDe(c));
      });
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".message-demo", f);
      var premier = null;
      requis.forEach(function (c) {
        var t = erreurDe(c);
        marquerChamp(c, t);
        if (t && !premier) premier = c;
      });
      if (premier) { if (msg) msg.hidden = true; premier.focus(); return; }
      if (msg) { msg.hidden = false; msg.focus(); }
    });
  });

  /* Champ fichier stylé : nom du fichier choisi */
  $$("input[type=file][data-nom-fichier]").forEach(function (i) {
    var cible = document.getElementById(i.getAttribute("data-nom-fichier"));
    i.addEventListener("change", function () {
      var f = i.files && i.files[0];
      if (cible) cible.textContent = f ? "Fichier choisi : " + f.name + ". En maquette, il n’est pas envoyé." : "Aucun fichier choisi.";
    });
  });

  /* Rétractation : emplacement de la future fonction */
  $$("[data-retractation]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Maquette : fonction à brancher. En ligne, elle permettra de se rétracter pendant tout le délai légal.", false);
    });
  });

  /* Avis de l'accueil : trois avis puis un bouton, sur téléphone (tout reste dans la page) */
  var listeAvis = $("[data-avis-repliables]");
  var deplier = $("[data-deplier-avis]");
  if (listeAvis && deplier) {
    listeAvis.setAttribute("data-replie", "");
    deplier.hidden = false;
    deplier.addEventListener("click", function () {
      listeAvis.removeAttribute("data-replie");
      deplier.setAttribute("aria-expanded", "true");
      deplier.hidden = true;
      var quatrieme = $$("li figure", listeAvis)[3];
      if (quatrieme) { quatrieme.setAttribute("tabindex", "-1"); quatrieme.focus(); }
    });
  }

  /* ---------- Inclinaison 3D légère des niches ---------- */
  if (survolFin && !reduit) {
    $$(".niche").forEach(function (n) {
      var cadre = null;
      n.addEventListener("pointermove", function (e) {
        if (cadre) return;
        cadre = requestAnimationFrame(function () {
          cadre = null;
          var r = n.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          n.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
          n.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
        });
      });
      n.addEventListener("pointerleave", function () { n.style.removeProperty("--rx"); n.style.removeProperty("--ry"); });
    });
  }

  /* ---------- Emplacement de plaque : photo ou « photo à venir » ---------- */
  function majSilhouette(nuit, p, sizes) {
    if (!nuit || !p) return;
    var s = p.sil, t = p.t[s];
    if (nuit.getAttribute("data-sil") === p.s + "-" + s) return;
    nuit.setAttribute("data-sil", p.s + "-" + s);
    nuit.className = "plaque__nuit sil-" + s;
    nuit.width = t[0]; nuit.height = t[1];
    nuit.srcset = srcPlaque(p.s, s, 440) + " 440w, " + srcPlaque(p.s, s, 880) + " 880w";
    nuit.src = srcPlaque(p.s, s, 440);
    if (sizes) nuit.sizes = sizes;
    nuit.alt = "Plaque " + p.n + " rétroéclairée, simulation";
  }
  function majEmplacement(slot, slug, fin, sizes) {
    if (!slot) return;
    var p = PLQ[slug]; if (!p) return;
    var plq = $(".plaque:not(.plaque--vide)", slot);
    var vide = $(".plaque--vide", slot);
    if (aPhoto(slug, fin)) {
      var img = $("img.plaque__jour", plq);
      var t = p.t[fin];
      img.width = t[0]; img.height = t[1];
      img.srcset = srcPlaque(slug, fin, 440) + " 440w, " + srcPlaque(slug, fin, 880) + " 880w";
      img.src = srcPlaque(slug, fin, 440);
      if (sizes) img.sizes = sizes;
      img.alt = "Plaque " + p.n + ", finition " + FIN[fin].a;
      majSilhouette($("img.plaque__nuit", plq), p, sizes);
      plq.className = "plaque fin-" + fin;
      plq.hidden = false;
      if (vide) vide.hidden = true;
    } else {
      plq.hidden = true;
      if (vide) {
        vide.hidden = false;
        var txt = $("[data-texte-vide]", vide);
        if (txt) txt.textContent = p.n + " en finition " + FIN[fin].a + " : photo à venir";
        vide.setAttribute("aria-label", "Photo de la plaque " + p.n + " en finition " + FIN[fin].a + " à venir");
      }
    }
  }

  /* ---------- Bascules jour / nuit génériques ---------- */
  $$("[data-bascule-nuit]").forEach(function (b) {
    var cible = document.querySelector(b.getAttribute("data-bascule-nuit"));
    if (!cible) return;
    b.addEventListener("click", function () {
      var nuit = b.getAttribute("aria-pressed") !== "true";
      avecTransition(function () {
        cible.classList.toggle("est-nuit", nuit);
        b.setAttribute("aria-pressed", nuit ? "true" : "false");
      });
      var lbl = $("[data-libelle-bascule]", b);
      if (lbl) lbl.textContent = nuit ? b.getAttribute("data-texte-nuit") : b.getAttribute("data-texte-jour");
      annoncer(nuit ? "Rétroéclairage allumé, simulation" : "Lumière du jour");
    });
  });

  /* ---------- Cartes : pastilles de finition ---------- */
  function montrerFinitionCarte(carte, fin) {
    var slug = carte.getAttribute("data-slug");
    if (!PLQ[slug]) return;
    majEmplacement($(".emplacement", carte), slug, fin);
    $$(".pastille", carte).forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-fin") === fin ? "true" : "false"); });
    var essai = $("[data-lien-essai]", carte);
    if (essai) essai.href = "essayer.html#" + slug + "-" + fin;
    var fiche = $$("a[data-lien-fiche]", carte);
    fiche.forEach(function (a) { a.href = "produit-" + slug + ".html#" + slug + "-" + fin; });
  }
  $$(".carte .pastille").forEach(function (p) {
    p.addEventListener("click", function () { montrerFinitionCarte(p.closest(".carte"), p.getAttribute("data-fin")); });
  });

  /* ---------- Galerie : filtres et finition globale ---------- */
  var grille = $("[data-grille]");
  if (grille) {
    var cartes = $$(".carte", grille);
    var compte = $("[data-compte]");
    var filtre = "tout";
    var appliquer = function () {
      var n = 0;
      cartes.forEach(function (c) {
        var ok = filtre === "tout" || c.getAttribute("data-collection") === filtre;
        c.hidden = !ok; if (ok) n++;
      });
      if (compte) compte.textContent = n + (n > 1 ? " objets affichés" : " objet affiché");
      $$("[data-groupe]", grille).forEach(function (g) { g.hidden = !$$(".carte", g).some(function (c) { return !c.hidden; }); });
      $$("[data-filtre]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === filtre ? "true" : "false"); });
    };
    $$("[data-filtre]").forEach(function (b) {
      b.addEventListener("click", function () {
        filtre = b.getAttribute("data-filtre");
        appliquer();
        try { history.replaceState(null, "", filtre === "tout" ? urlSansHash() : "#" + filtre); } catch (e) { /* rien */ }
      });
    });
    $$("[data-voir-en]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.getAttribute("data-voir-en");
        cartes.forEach(function (c) { if (c.getAttribute("data-slug") && PLQ[c.getAttribute("data-slug")]) montrerFinitionCarte(c, fin); });
        $$("[data-voir-en]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        annoncer("Toutes les plaques affichées en finition " + FIN[fin].a);
      });
    });
    var depart = String(location.hash || "").replace("#", "");
    if (/^[a-z]+$/.test(depart) && $("[data-filtre=\"" + depart + "\"]")) filtre = depart;
    appliquer();
  }

  /* ---------- Vitrine (accueil, kit LED) ---------- */
  $$("[data-vitrine]").forEach(function (v) {
    var select = $("[data-modele]", v);
    var slot = $(".emplacement", v);
    var inter = $("[data-interrupteur]", v);
    var resume = $("[data-resume]", v);
    var lienFiche = $("[data-lien-fiche]", v);
    var lienEssai = $("[data-lien-essai]", v);
    var sizes = slot ? ($("img.plaque__jour", slot) || {}).sizes : "";
    var etat = { slug: v.getAttribute("data-slug"), fin: v.getAttribute("data-fin") || "noir", allume: false, touche: false };
    var radios = $$("input[type=radio][data-fin-vitrine]", v);
    function maj() {
      majEmplacement(slot, etat.slug, etat.fin, sizes);
      if (select && select.value !== etat.slug) select.value = etat.slug;
      radios.forEach(function (r) { r.checked = r.value === etat.fin; });
      var p = PLQ[etat.slug];
      /* l'allumage est un aperçu : le prix reste celui de la plaque seule, le kit est indiqué à part */
      if (resume && p) resume.textContent = p.n + ", finition " + FIN[etat.fin].a + " : " + euros(D.prixPlaque) +
        (etat.allume && !v.hasAttribute("data-allume") ? " (" + euros(D.prixPlaque + D.prixLed) + " avec le kit LED)" : "");
      /* jamais de couleur dans ces liens : la fiche s'ouvre sans kit LED présélectionné */
      var h = etat.slug + "-" + etat.fin;
      if (lienFiche) lienFiche.href = "produit-" + etat.slug + ".html#" + h;
      if (lienEssai) lienEssai.href = "essayer.html#" + h;
    }
    function allumer(on, anime) {
      etat.allume = on;
      v.classList.toggle("allumage", !!anime && on);
      v.classList.toggle("est-nuit", on);
      if (inter) inter.setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (select) select.addEventListener("change", function () { etat.slug = select.value; etat.fin = premiereFinition(etat.slug, etat.fin); maj(); });
    $$("[data-modele-pas]", v).forEach(function (b) {
      b.addEventListener("click", function () {
        var i = 0; D.plaques.forEach(function (p, k) { if (p.s === etat.slug) i = k; });
        var n = D.plaques.length;
        etat.slug = D.plaques[(i + (+b.getAttribute("data-modele-pas")) + n) % n].s;
        etat.fin = premiereFinition(etat.slug, etat.fin);
        maj();
        annoncer(PLQ[etat.slug].n);
      });
    });
    radios.forEach(function (r) { r.addEventListener("change", function () { if (r.checked) { etat.fin = r.value; maj(); } }); });
    var deja = false;
    if (inter) inter.addEventListener("click", function () {
      deja = true;
      var on = inter.getAttribute("aria-pressed") !== "true";
      avecTransition(function () { allumer(on, false); });
      maj();
    });
    document.addEventListener("tg3:led", function () { maj(); });
    maj();
    if (v.hasAttribute("data-allumage")) {
      /* le moment signature se joue quand la vitrine est à l'écran, pas hors champ */
      var lancer = function () { if (deja) return; deja = true; if (reduit) allumer(true, false); else allumer(true, true); maj(); };
      if ("IntersectionObserver" in window) {
        var obs = new IntersectionObserver(function (entrees) {
          entrees.forEach(function (en) {
            if (en.isIntersecting && en.intersectionRatio >= 0.5) { obs.disconnect(); setTimeout(lancer, reduit ? 0 : 350); }
          });
        }, { threshold: [0, 0.5, 1] });
        obs.observe($(".scene", v) || v);
      } else { setTimeout(lancer, reduit ? 0 : 900); }
    } else if (v.hasAttribute("data-allume")) { allumer(true, false); }
  });

  /* ---------- Fiche produit : configurateur ---------- */
  var fiche = $("[data-fiche]");
  if (fiche) {
    var slug = fiche.getAttribute("data-slug");
    var nom = fiche.getAttribute("data-nom");
    var scene = $(".scene--fiche");
    var slotFiche = $(".vue--sim .emplacement", scene);
    var sizesFiche = slotFiche ? ($("img.plaque__jour", slotFiche) || {}).sizes : "";
    var slotPhoto = $(".vue--photo .emplacement-photo", scene);
    var optionsLed = $("[data-options-led]", fiche);
    var noteNuit = $("[data-note-nuit]");
    var noteFinitions = $("[data-note-finitions]");
    var qteInput = $("#quantite");
    var etatF = { fin: fiche.getAttribute("data-fin"), led: false, cable: "bd", vue: "sim", nuit: false };

    var montrerVue = function (v) {
      etatF.vue = v;
      $$(".vue", scene).forEach(function (x) { x.hidden = x.getAttribute("data-vue") !== v; });
      $$(".vue-bouton").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-vue") === v ? "true" : "false"); });
      var barre = $(".scene__barre", scene); if (barre) barre.hidden = v !== "sim";
      var et = $(".etiquette-sim", scene); if (et) et.hidden = v !== "sim";
    };
    var ambiance = function (nuit) {
      etatF.nuit = nuit;
      scene.classList.toggle("est-nuit", nuit);
      $$("[data-ambiance]").forEach(function (b) { b.setAttribute("aria-pressed", (b.getAttribute("data-ambiance") === "nuit") === nuit ? "true" : "false"); });
      if (noteNuit) noteNuit.hidden = !(nuit && !etatF.led);
      if (noteFinitions) noteFinitions.hidden = !nuit;
    };
    var qte = function () { return Math.max(1, Math.min(9, parseInt(qteInput ? qteInput.value : "1", 10) || 1)); };
    var majFiche = function (ecrire) {
      majEmplacement(slotFiche, slug, etatF.fin, sizesFiche);
      if (slotPhoto) {
        var ok = aPhoto(slug, etatF.fin);
        var im = $("img", slotPhoto), vd = $(".photo-vide", slotPhoto);
        if (ok) {
          var t = PLQ[slug].t[etatF.fin];
          im.width = t[0]; im.height = t[1];
          im.srcset = srcPlaque(slug, etatF.fin, 440) + " 440w, " + srcPlaque(slug, etatF.fin, 880) + " 880w";
          im.src = srcPlaque(slug, etatF.fin, 880);
          im.alt = "Photo de la plaque " + nom + ", finition " + FIN[etatF.fin].a;
        }
        im.hidden = !ok; if (vd) vd.hidden = ok;
        var vb = $(".vue-bouton[data-vue=photo] .vue-bouton__img img");
        if (vb && ok) vb.src = srcVignette(slug, etatF.fin);
        var lb = $(".vue-bouton[data-vue=photo] .vue-bouton__texte");
        if (lb) lb.textContent = "Photo, finition " + FIN[etatF.fin].a;
      }
      $$("input[name=finition]", fiche).forEach(function (r) { r.checked = r.value === etatF.fin; });
      var sortieFin = $("#finition-choisie"); if (sortieFin) sortieFin.textContent = FIN[etatF.fin].n;
      $$("input[name=led]", fiche).forEach(function (r) { r.checked = (r.value === "avec") === etatF.led; });
      if (optionsLed) optionsLed.hidden = !etatF.led;
      $$("input[name=cable]", fiche).forEach(function (r) { r.checked = r.value === etatF.cable; });
      var sortieCable = $("#cable-choisi"); if (sortieCable) sortieCable.textContent = CABLES[etatF.cable] || "";
      var led = etatF.led ? ledCourante() : null;
      var unit = D.prixPlaque + (etatF.led ? D.prixLed : 0);
      $$("[data-prix]").forEach(function (x) { x.textContent = euros(unit); });
      var txt = resumeConfig(slug, etatF.fin, led, qte());
      $$("[data-resume]").forEach(function (x) { x.textContent = txt; });
      if (noteNuit) noteNuit.hidden = !(etatF.nuit && !etatF.led);
      var h = slug + "-" + etatF.fin + (led ? "-" + led : "");
      $$("[data-lien-essai]", document).forEach(function (a) { if (a.closest("[data-fiche]") || a.hasAttribute("data-lien-essai-fiche")) a.href = "essayer.html#" + h; });
      if (ecrire) ecrireHash({ slug: slug, fin: etatF.fin, led: led });
      return h;
    };

    // Configuration reçue par lien
    var recu = lireHash(location.hash);
    if (recu && recu.slug === slug) {
      if (recu.fin) etatF.fin = recu.fin;
      if (recu.led) { etatF.led = true; appliquerLed(recu.led, false); }
    }
    majFiche(false);
    montrerVue("sim");
    ambiance(etatF.led || !!(recu && recu.slug === slug && recu.nuit));

    $$("input[name=finition]", fiche).forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) { etatF.fin = r.value; if (etatF.vue !== "photo") montrerVue("sim"); majFiche(true); } });
    });
    $$("input[name=led]", fiche).forEach(function (r) {
      r.addEventListener("change", function () {
        if (!r.checked) return;
        etatF.led = r.value === "avec";
        montrerVue("sim");
        avecTransition(function () { ambiance(etatF.led); majFiche(true); });
        annoncer(etatF.led ? "Kit LED ajouté à la configuration, 15 euros" : "Sans rétroéclairage");
      });
    });
    $$("input[name=cable]", fiche).forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) { etatF.cable = r.value; majFiche(false); } });
    });
    $$("[data-ambiance]").forEach(function (b) {
      b.addEventListener("click", function () { montrerVue("sim"); var n = b.getAttribute("data-ambiance") === "nuit"; avecTransition(function () { ambiance(n); }); });
    });
    $$(".vue-bouton").forEach(function (b) { b.addEventListener("click", function () { montrerVue(b.getAttribute("data-vue")); }); });
    var activerLedDepuisNote = $("[data-activer-led]");
    if (activerLedDepuisNote) activerLedDepuisNote.addEventListener("click", function () {
      etatF.led = true; ambiance(true); majFiche(true);
      var avec = $("input[name=led][value=avec]", fiche); if (avec) avec.focus();
      annoncer("Kit LED ajouté à la configuration, 15 euros");
    });
    document.addEventListener("tg3:led", function () { majFiche(etatF.led); });
    $$("[data-qte]").forEach(function (b) {
      b.addEventListener("click", function () { qteInput.value = Math.max(1, Math.min(9, qte() + (+b.getAttribute("data-qte")))); majFiche(false); });
    });
    if (qteInput) qteInput.addEventListener("change", function () { qteInput.value = qte(); majFiche(false); });

    var ajouterFiche = function () {
      var details = ["Finition " + FIN[etatF.fin].a];
      var cle = slug + "-" + etatF.fin;
      if (etatF.led) { details.push("Kit LED monté, câble " + (CABLES[etatF.cable] || "").toLowerCase()); cle += "-led-" + etatF.cable; }
      var cadeau = $("#option-cadeau");
      if (cadeau && cadeau.checked) {
        details.push("Commande cadeau");
        var msg = $("#message-cadeau"); if (msg && msg.value.trim()) details.push("Message : " + msg.value.trim().slice(0, 80));
        var masque = $("#masquer-prix"); if (masque && masque.checked) details.push("Prix masqué sur le bon de livraison");
        cle += "-cadeau";
      }
      ajouterAuPanier({
        cle: cle, slug: slug, nom: nom, fin: etatF.fin, led: etatF.led ? ledCourante() : null, cable: etatF.led ? etatF.cable : null,
        details: details, prix: D.prixPlaque + (etatF.led ? D.prixLed : 0), qte: qte(),
        image: aPhoto(slug, etatF.fin) ? srcVignette(slug, etatF.fin) : ""
      });
    };
    $$("[data-ajouter]").forEach(function (b) { b.addEventListener("click", ajouterFiche); });
    $$("[data-copier-config]").forEach(function (b) {
      b.addEventListener("click", function () { var h = majFiche(true); copier(urlSansHash() + "#" + h, b, "Lien de la configuration copié"); });
    });
    $$("[data-partager]").forEach(function (b) {
      b.addEventListener("click", function () {
        var h = majFiche(true);
        var led = etatF.led ? ledCourante() : null;
        partager("Terre Gravée · " + nom, "Qu’en penses-tu ? " + resumeConfig(slug, etatF.fin, led, 1), urlSansHash() + "#" + h, b);
      });
    });

    var barre = $(".barre-mobile");
    var bouton = $(".achat-ligne .btn", fiche);
    if (barre && bouton && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entrees) {
        var en = entrees[0];
        barre.classList.toggle("visible", !en.isIntersecting && en.boundingClientRect.top < 0);
      }).observe(bouton);
    }
  }

  /* ---------- Kit LED et carte cadeau : ajout direct ---------- */
  var ficheLed = $("[data-fiche-led]");
  if (ficheLed) {
    $$("[data-ajouter-led]").forEach(function (b) {
      b.addEventListener("click", function () {
        ajouterAuPanier({ cle: "led-seul", nom: "Kit LED", details: ["Envoyé seul, à poser vous-même"], prix: D.prixLed, qte: 1, image: "assets/img/led/led-img2-440.webp" });
      });
    });
  }
  var ficheCarte = $("[data-fiche-carte]");
  if (ficheCarte) {
    $$("[data-ajouter-carte]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = $("input[name=format]:checked", ficheCarte);
        var f = r ? r.value : "email";
        var details = [f === "email" ? "Envoi immédiat par e-mail" : "À imprimer chez vous"];
        var dest = $("#destinataire"); if (dest && dest.value.trim()) details.push("Pour : " + dest.value.trim().slice(0, 40));
        ajouterAuPanier({ cle: "carte-" + f + "-" + Date.now(), nom: "Carte cadeau", details: details, prix: 65, qte: 1, image: "assets/img/misc/carte-cadeau-240.webp" });
      });
    });
  }

  /* ---------- Outils partagés avec le visualiseur ---------- */
  window.TG3.outils = {
    euros: euros, lireHash: lireHash, ecrireHash: ecrireHash, chaineHash: chaineHash, urlSansHash: urlSansHash, srcPlaque: srcPlaque, srcVignette: srcVignette, aPhoto: aPhoto,
    premiereFinition: premiereFinition, resumeConfig: resumeConfig, ledCourante: ledCourante, appliquerLed: appliquerLed,
    ajouterAuPanier: ajouterAuPanier, toast: toast, annoncer: annoncer, copier: copier, partager: partager,
    avecTransition: avecTransition, majSilhouette: majSilhouette, reduit: reduit, PLQ: PLQ, FIN: FIN, COUL: COUL, CABLES: CABLES
  };
})();
