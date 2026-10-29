/* Terre Gravée · maquette version 2 « Boutique qui convertit ».
   Script commun, classique (sans module) : il fonctionne en ouvrant les pages directement.
   Le panier est une démonstration : il vit dans ce navigateur et ne déclenche aucun paiement. */
(function () {
  "use strict";

  var TG = window.TG || { produits: {}, img: "", seuil: 130, remise: 0.1, prixLed: 15, prixPlaque: 65 };
  var P = TG.produits;
  var NBSP = "\u00a0";
  var NNBSP = "\u202f";
  var FIN_NOM = { noir: "Noir", gris: "Gris", dore: "Doré" };
  var FIN_ACC = { noir: "noire", gris: "grise", dore: "dorée" };
  var CABLES = ["Haut gauche", "Haut droite", "Bas gauche", "Bas droite"];

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  // typographie française : espace insécable avant « : », fine insécable avant « ? ! ; »
  function fr(t) { return String(t).replace(/ :/g, "\u00a0:").replace(/ ([?!;])/g, "\u202f$1"); }
  function esc(t) { return fr(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  function euros(n) {
    var entier = Math.abs(n - Math.round(n)) < 1e-9;
    var s = entier ? String(Math.round(n)) : n.toFixed(2);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(",") + NBSP + "€";
  }
  function valider(detail) {
    return "<span class=\"note-maq note-maq--valider\">" + (detail ? esc(detail) + NBSP + ": " : "") + "proposition à valider</span>";
  }
  function icone(chemin) {
    return "<svg class=\"ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"" + chemin + "\"/></svg>";
  }
  var ICO_PLUS = "M12 5v14M5 12h14";
  var ICO_CROIX = "M6 6l12 12M18 6 6 18";
  var ICO_FLECHE = "M5 12h14M13 6l6 6-6 6";

  /* ---------- stockage local, toujours sous try/catch ---------- */
  var memoire = {};
  function lire(cle, defaut) {
    try {
      var v = window.localStorage.getItem(cle);
      if (v !== null) return JSON.parse(v);
    } catch (e) { /* stockage indisponible */ }
    return Object.prototype.hasOwnProperty.call(memoire, cle) ? memoire[cle] : defaut;
  }
  function ecrire(cle, val) {
    memoire[cle] = val;
    try { window.localStorage.setItem(cle, JSON.stringify(val)); } catch (e) { /* le panier reste en mémoire */ }
  }

  /* ---------- annonces pour les lecteurs d’écran ---------- */
  var zoneAnnonce = $("[data-annonce]");
  function annoncer(t) {
    if (!zoneAnnonce) return;
    zoneAnnonce.textContent = "";
    setTimeout(function () { zoneAnnonce.textContent = t; }, 60);
  }

  /* ---------- menu mobile ---------- */
  var entete = $("[data-entete]");
  var boutonMenu = $("[data-menu]");
  if (entete && boutonMenu) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = entete.classList.toggle("menu-ouvert");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && entete.classList.contains("menu-ouvert")) {
        entete.classList.remove("menu-ouvert");
        boutonMenu.setAttribute("aria-expanded", "false");
        boutonMenu.focus();
      }
    });
  }

  /* ---------- images ---------- */
  function cheminPlaque(slug, fin) {
    var p = P[slug];
    return p && p.fins && p.fins[fin] ? TG.img + p.fins[fin] : null;
  }
  function finAvecPhoto(slug, pref) {
    var p = P[slug];
    if (!p || !p.fins) return pref;
    if (p.fins[pref]) return pref;
    var ordre = ["noir", "gris", "dore"];
    for (var i = 0; i < ordre.length; i++) if (p.fins[ordre[i]]) return ordre[i];
    return pref;
  }
  function imgPlaqueHTML(slug, fin, sizes, extra) {
    var p = P[slug];
    var src = cheminPlaque(slug, fin);
    if (!src) return "<div class=\"plaque-vide\" role=\"img\" aria-label=\"Photo de " + esc(p.nom) + " en finition " + FIN_ACC[fin] + " à venir\"><span class=\"plaque-vide__mot\">Photo à venir</span><span class=\"plaque-vide__fin\">Finition " + FIN_ACC[fin] + "</span><span class=\"note-maq note-maq--fournir\">à fournir" + NBSP + ": photo</span></div>";
    var d = (p.dims && p.dims[fin]) || [440, 870];
    return "<img src=\"" + src + "\" srcset=\"" + p.srcset[fin] + "\" sizes=\"" + (sizes || "200px") + "\" width=\"" + d[0] + "\" height=\"" + d[1] + "\" alt=\"Plaque murale " + esc(p.nom) + ", finition " + FIN_ACC[fin] + "\" decoding=\"async\"" + (extra || "") + ">";
  }

  /* ---------- panier ---------- */
  var CLE_PANIER = "tg-v2-panier";
  function lignes() { var l = lire(CLE_PANIER, []); return Array.isArray(l) ? l : []; }
  function cleLigne(a) {
    return [a.type, a.slug, a.fin || "", a.led ? "led" : "", a.cable || "", a.montant || "", a.envoi || "", a.nomDest || "", a.message || ""].join("|");
  }
  function nomArticle(a) {
    if (a.type === "led") return "Kit LED";
    if (a.type === "carte") return "Carte cadeau";
    return P[a.slug] ? P[a.slug].nom : a.slug;
  }
  function detailsArticle(a) {
    var d = [];
    if (a.type === "plaque") {
      d.push("Finition " + FIN_ACC[a.fin]);
      if (a.led) d.push("Kit LED monté, câble " + (a.cable || "Bas droite").toLowerCase());
    }
    if (a.type === "led") d.push("Sortie du câble" + NBSP + ": " + (a.cable || "Bas droite").toLowerCase());
    if (a.type === "carte") {
      d.push("Vaut " + (a.montant === 80 ? "une plaque et son kit LED" : "une plaque au choix"));
      d.push(a.envoi === "imprimer" ? "À imprimer" : "Envoi immédiat par e-mail");
      if (a.nomDest) d.push("Pour " + a.nomDest);
    }
    return d;
  }
  function enregistrer(l) {
    ecrire(CLE_PANIER, l);
    rendrePanier();
    if (majFicheLivraison) majFicheLivraison();
  }
  function fusionner(l, article) {
    article.cle = cleLigne(article);
    var ex = null;
    for (var i = 0; i < l.length; i++) if (l[i].cle === article.cle) ex = l[i];
    if (ex) ex.qte = Math.min(99, ex.qte + article.qte); else l.push(article);
    return l;
  }
  function ajouter(articles, ouvrir) {
    if (!Array.isArray(articles)) articles = [articles];
    var l = lignes();
    articles.forEach(function (a) { fusionner(l, a); });
    enregistrer(l);
    var noms = articles.map(function (a) { return nomArticle(a) + (a.fin ? ", finition " + FIN_ACC[a.fin] : ""); });
    annoncer(noms.join(" ; ") + (articles.length > 1 ? " : ajoutés au panier." : " : ajouté au panier."));
    $$(".bouton-panier").forEach(function (b) {
      b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse");
    });
    if (ouvrir !== false) ouvrirPanier();
  }
  function totaux(l) {
    var t = { sous: 0, physique: 0, plaques: 0, articles: 0 };
    l.forEach(function (a) {
      var m = a.prix * a.qte;
      t.sous += m; t.articles += a.qte;
      if (a.type !== "carte") t.physique += m;
      if (a.type === "plaque") t.plaques += a.qte;
    });
    t.groupes = Math.floor(t.plaques / 3);
    t.remise = Math.round(t.groupes * 3 * TG.prixPlaque * TG.remise * 100) / 100;
    t.total = t.sous - t.remise;
    t.physiqueNet = t.physique - t.remise;
    return t;
  }
  function majJauge(el, montant) {
    if (!el) return;
    var p = Math.max(0, Math.min(100, montant / TG.seuil * 100));
    el.style.setProperty("--p", p + "%");
    el.setAttribute("data-plein", p >= 100 ? "1" : "0");
  }
  function messageLivraison(montant) {
    if (montant <= 0) return "Livraison offerte dès " + euros(TG.seuil) + " d’articles livrés, soit deux plaques.";
    if (montant >= TG.seuil) return "La livraison est offerte pour cette commande.";
    return "Plus que " + euros(TG.seuil - montant) + " pour la livraison offerte.";
  }

  var dialogue = $("#panier");
  var focusAvant = null;
  function ouvrirPanier() {
    if (!dialogue) return;
    focusAvant = document.activeElement;
    rendrePanier();
    if (typeof dialogue.showModal === "function") {
      if (!dialogue.open) dialogue.showModal();
    } else {
      dialogue.setAttribute("open", "");
    }
    var f = $("[data-fermer-panier]", dialogue);
    if (f) f.focus();
  }
  function fermerPanier() {
    if (!dialogue) return;
    if (typeof dialogue.close === "function" && dialogue.open) dialogue.close();
    else { dialogue.removeAttribute("open"); if (focusAvant && focusAvant.focus) focusAvant.focus(); }
  }
  if (dialogue) {
    dialogue.addEventListener("close", function () { if (focusAvant && focusAvant.focus) focusAvant.focus(); });
    dialogue.addEventListener("click", function (e) { if (e.target === dialogue) fermerPanier(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && dialogue.hasAttribute("open")) fermerPanier(); });
  }
  $$("[data-ouvrir-panier]").forEach(function (b) { b.addEventListener("click", ouvrirPanier); });
  $$("[data-fermer-panier]").forEach(function (b) { b.addEventListener("click", fermerPanier); });

  // vignette allégée (assets/img) avec ses dimensions réelles, sinon l’original
  function vignette(rel, alt) {
    var v = (TG.vignettes && TG.vignettes[rel]) || [TG.img + rel, 100, 100];
    return "<img src=\"" + v[0] + "\" alt=\"" + esc(alt || "") + "\" width=\"" + v[1] + "\" height=\"" + v[2] + "\" decoding=\"async\">";
  }
  function visuelLigne(a) {
    if (a.type === "led") return "<span class=\"ligne-panier__img ligne-panier__img--photo\">" + vignette("led/led-img0.webp") + "</span>";
    if (a.type === "carte") return "<span class=\"ligne-panier__img ligne-panier__img--photo\">" + vignette("misc/carte-cadeau.webp") + "</span>";
    var src = cheminPlaque(a.slug, a.fin);
    if (!src) return "<span class=\"ligne-panier__img ligne-panier__img--vide\">photo à venir</span>";
    var d = P[a.slug].dims[a.fin];
    return "<span class=\"ligne-panier__img\"><img src=\"" + src + "\" alt=\"\" width=\"" + d[0] + "\" height=\"" + d[1] + "\"></span>";
  }

  function rendrePanier() {
    var l = lignes();
    var t = totaux(l);
    $$("[data-panier-compteur]").forEach(function (c) { c.textContent = t.articles; });
    $$(".bouton-panier").forEach(function (b) { b.classList.toggle("est-rempli", t.articles > 0); });
    var liste = $("[data-panier-liste]");
    if (!liste) return;
    liste.innerHTML = "";
    if (!l.length) {
      var vide = document.createElement("li");
      vide.className = "panier__vide";
      vide.innerHTML = "<p>Votre panier est vide.</p><p><a class=\"lien-fleche\" href=\"collection.html\">Voir les plaques" + icone(ICO_FLECHE) + "</a></p><p class=\"petit\">Vous hésitez" + NNBSP + "? <a href=\"quiz.html\">Le quiz</a> recommande une plaque en quatre questions.</p>";
      liste.appendChild(vide);
    }
    l.forEach(function (a, i) {
      var li = document.createElement("li");
      li.className = "ligne-panier";
      var details = detailsArticle(a).map(function (d) { return "<span>" + esc(d) + "</span>"; }).join("");
      li.innerHTML = visuelLigne(a) +
        "<div class=\"ligne-panier__info\"><strong>" + esc(nomArticle(a)) + "</strong>" + details +
        "<div class=\"ligne-panier__outils\"><div class=\"quantite quantite--petite\" role=\"group\" aria-label=\"Quantité de " + esc(nomArticle(a)) + "\"><button type=\"button\" data-moins aria-label=\"Retirer un exemplaire\">−</button><span aria-live=\"polite\">" + a.qte + "</span><button type=\"button\" data-plus aria-label=\"Ajouter un exemplaire\">+</button></div>" +
        "<button type=\"button\" class=\"ligne-panier__retirer\" data-retirer>" + icone(ICO_CROIX) + "Retirer<span class=\"sr\"> " + esc(nomArticle(a)) + "</span></button></div></div>" +
        "<span class=\"ligne-panier__prix\">" + euros(a.prix * a.qte) + "</span>";
      $("[data-moins]", li).addEventListener("click", function () {
        var ls = lignes(); if (!ls[i]) return;
        ls[i].qte -= 1; if (ls[i].qte < 1) ls.splice(i, 1);
        enregistrer(ls); focusPanier();
      });
      $("[data-plus]", li).addEventListener("click", function () {
        var ls = lignes(); if (!ls[i]) return;
        ls[i].qte = Math.min(99, ls[i].qte + 1); enregistrer(ls); focusPanier("[data-plus]", i);
      });
      $("[data-retirer]", li).addEventListener("click", function () {
        var ls = lignes(); var nom = nomArticle(ls[i]); ls.splice(i, 1); enregistrer(ls);
        annoncer(nom + " retiré du panier."); focusPanier();
      });
      liste.appendChild(li);
    });

    var sousTotal = $("[data-sous-total]"); if (sousTotal) sousTotal.textContent = euros(t.sous);
    var ligneRemise = $("[data-ligne-remise]");
    if (ligneRemise) { ligneRemise.hidden = t.remise <= 0; $("[data-remise]").textContent = "−" + euros(t.remise); }
    var port = $("[data-port]");
    var portConnu = true;
    if (port) {
      if (!l.length) port.textContent = "—";
      else if (t.physique <= 0) port.textContent = "Sans frais" + NBSP + ": envoi par e-mail";
      else if (t.physiqueNet >= TG.seuil) port.textContent = "Offerte";
      else { port.textContent = "Selon poids et destination"; portConnu = false; }
    }
    var tot = $("[data-total-panier]");
    if (tot) tot.textContent = euros(t.total) + (portConnu ? "" : " + port");
    var msg = $("[data-livraison-msg]");
    if (msg) msg.textContent = messageLivraison(t.physiqueNet);
    majJauge($("[data-panier-livraison] [data-jauge]"), t.physiqueNet);
    rendreSuggestions(l, t);
  }
  function focusPanier(sel, i) {
    var cible = null;
    if (sel !== undefined && i !== undefined) { var li = $$(".ligne-panier")[i]; if (li) cible = $(sel, li); }
    if (!cible) cible = $("[data-fermer-panier]");
    if (cible) cible.focus();
  }

  function rendreSuggestions(l, t) {
    var zone = $("[data-panier-suggestions]");
    if (!zone) return;
    zone.innerHTML = "";
    var indexSansLed = -1;
    for (var i = 0; i < l.length; i++) if (l[i].type === "plaque" && !l[i].led) { indexSansLed = i; break; }
    if (indexSansLed >= 0) {
      var a = l[indexSansLed];
      var opts = CABLES.map(function (c) { return "<option" + (c === "Bas droite" ? " selected" : "") + ">" + c + "</option>"; }).join("");
      var div = document.createElement("div");
      div.className = "suggestion";
      div.innerHTML = "<p class=\"suggestion__etiquette\">Compatible avec votre plaque</p>" +
        "<div class=\"suggestion__tete\">" + vignette("led/led-img1.webp", "Exemple réel" + NBSP + ": Le Pic du Midi rétroéclairé en vert") + "<p>Kit LED monté au dos de " + esc(P[a.slug].nom) + " par l’atelier, +" + euros(TG.prixLed) + (a.qte > 1 ? " par plaque" : "") + ".</p></div>" +
        "<div class=\"suggestion__actions\"><label class=\"sr\" for=\"sugg-cable\">Sortie du câble</label><select id=\"sugg-cable\">" + opts + "</select><button type=\"button\" class=\"btn btn--ligne\">" + icone(ICO_PLUS) + "Ajouter le kit</button></div>";
      $("button", div).addEventListener("click", function () {
        var ls = lignes(); var cible = ls[indexSansLed]; if (!cible) return;
        ls.splice(indexSansLed, 1);
        cible.led = true; cible.cable = $("select", div).value; cible.prix = TG.prixPlaque + TG.prixLed;
        fusionner(ls, cible);
        enregistrer(ls);
        annoncer("Kit LED ajouté à " + P[cible.slug].nom + ".");
        focusPanier();
      });
      zone.appendChild(div);
    }
    if (t.plaques > 0 && t.plaques % 3 !== 0) {
      var manque = 3 - (t.plaques % 3);
      var d2 = document.createElement("div");
      d2.className = "suggestion";
      d2.innerHTML = "<p class=\"suggestion__etiquette\">Triptyque</p><p>Ajoutez " + manque + (manque > 1 ? " plaques" : " plaque") + NBSP + ": trois plaques forment un Triptyque, −10" + NBSP + "% sur les trois.</p><p>" + valider("remise de 10" + NBSP + "%") + "</p><div class=\"suggestion__actions\"><a class=\"btn btn--ligne\" href=\"triptyque.html\">Composer un Triptyque</a><a class=\"lien-fleche\" href=\"collection.html\">Voir les plaques</a></div>";
      zone.appendChild(d2);
    } else if (t.groupes > 0) {
      var d3 = document.createElement("p");
      d3.className = "petit";
      d3.innerHTML = "Triptyque appliqué" + NBSP + ": −" + euros(t.remise) + " sur vos plaques. " + valider("remise de 10" + NBSP + "%");
      zone.appendChild(d3);
    }
  }

  // options cadeau du panier, mémorisées
  var CLE_CADEAU = "tg-v2-cadeau";
  var cadeauPrix = $("[data-panier-cadeau]"), cadeauMsg = $("[data-panier-message]");
  if (cadeauPrix && cadeauMsg) {
    var c0 = lire(CLE_CADEAU, {}) || {};
    cadeauPrix.checked = !!c0.masquer;
    cadeauMsg.value = c0.message || "";
    var memCadeau = function () { ecrire(CLE_CADEAU, { masquer: cadeauPrix.checked, message: cadeauMsg.value }); };
    cadeauPrix.addEventListener("change", memCadeau);
    cadeauMsg.addEventListener("input", memCadeau);
  }

  /* ---------- cartes produit : pastilles et ajout rapide ---------- */
  function majCarte(carte, fin) {
    var slug = carte.getAttribute("data-slug");
    var p = P[slug];
    if (!p || !p.fins || !(fin in p.fins)) return;
    var img = $("[data-img]", carte), vide = $("[data-vide]", carte);
    if (p.fins[fin]) {
      if (img) { img.src = TG.img + p.fins[fin]; img.srcset = p.srcset[fin]; img.alt = "Plaque murale " + p.nom + ", finition " + FIN_ACC[fin]; img.hidden = false; }
      if (vide) vide.hidden = true;
    } else if (vide) {
      if (img) img.hidden = true;
      vide.hidden = false;
      var f = $("[data-vide-fin]", vide); if (f) f.textContent = "Finition " + FIN_ACC[fin];
      vide.setAttribute("aria-label", "Photo de " + p.nom + " en finition " + FIN_ACC[fin] + " à venir");
    }
    $$(".pastille", carte).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-fin") === fin ? "true" : "false"); });
    carte.setAttribute("data-fin", fin);
    var sr = $("[data-ajout-sr]", carte);
    if (sr) sr.textContent = " " + p.nom + ", finition " + FIN_ACC[fin] + ", au panier";
  }
  function finCarte(carte) {
    var f = carte.getAttribute("data-fin");
    if (f) return f;
    var b = $(".pastille[aria-pressed=\"true\"]", carte);
    return b ? b.getAttribute("data-fin") : "noir";
  }
  document.addEventListener("click", function (e) {
    var past = e.target.closest ? e.target.closest(".carte .pastille[data-fin]") : null;
    if (past) { majCarte(past.closest(".carte"), past.getAttribute("data-fin")); return; }
    var ajout = e.target.closest ? e.target.closest("[data-ajout-carte]") : null;
    if (ajout) {
      var carte = ajout.closest(".carte");
      var slug = carte.getAttribute("data-slug");
      ajout.classList.add("est-ajoute");
      setTimeout(function () { ajout.classList.remove("est-ajoute"); }, 1400);
      ajouter({ type: "plaque", slug: slug, fin: finCarte(carte), led: false, cable: "", prix: TG.prixPlaque, qte: 1 });
      return;
    }
    var cc = e.target.closest ? e.target.closest("[data-ajout-carte-cadeau]") : null;
    if (cc) {
      ajouter({ type: "carte", slug: "carte-cadeau", montant: 65, envoi: "email", nomDest: "", message: "", prix: 65, qte: 1 });
    }
  });

  /* ---------- accueil : finition du héros ---------- */
  var imgHeros = $("[data-heros-img]");
  if (imgHeros) {
    $$("[data-heros-fin]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.getAttribute("data-heros-fin");
        var p = P["le-pic-du-midi"];
        imgHeros.src = TG.img + p.fins[fin]; imgHeros.srcset = p.srcset[fin];
        imgHeros.alt = "Plaque murale " + p.nom + ", finition " + FIN_ACC[fin];
        $$("[data-heros-fin]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
  }

  /* ---------- boutique : filtres, finition, tri ---------- */
  var grille = $("[data-grille]");
  if (grille) {
    var ordre0 = Array.prototype.slice.call(grille.children);
    var cartes = $$(".carte", grille);
    var promos = $$("[data-promo]", grille);
    var compte = $("[data-compte]");
    var filtre = "tout", tri = "atelier";
    var appliquer = function () {
      var n = 0;
      cartes.forEach(function (c) {
        var ok = filtre === "tout" || c.getAttribute("data-collection") === filtre;
        c.hidden = !ok; if (ok) n++;
      });
      promos.forEach(function (p) { p.hidden = filtre !== "tout" || tri !== "atelier"; });
      if (compte) compte.textContent = n + (n > 1 ? " articles" : " article");
      $$("[data-filtre]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === filtre ? "true" : "false"); });
    };
    var trier = function () {
      var liste;
      if (tri === "atelier") liste = ordre0.slice();
      else {
        liste = cartes.slice();
        liste.sort(function (a, b) {
          if (tri === "nom") return a.getAttribute("data-tri").localeCompare(b.getAttribute("data-tri"), "fr");
          if (tri === "best") return (+b.getAttribute("data-best")) - (+a.getAttribute("data-best")) || (+a.getAttribute("data-ordre")) - (+b.getAttribute("data-ordre"));
          return (+b.getAttribute("data-avis")) - (+a.getAttribute("data-avis")) || (+a.getAttribute("data-ordre")) - (+b.getAttribute("data-ordre"));
        });
        liste = liste.concat(promos);
      }
      liste.forEach(function (el) { grille.appendChild(el); });
      appliquer();
    };
    $$("[data-filtre]").forEach(function (b) {
      b.addEventListener("click", function () {
        filtre = b.getAttribute("data-filtre");
        appliquer();
        try { history.replaceState(null, "", filtre === "tout" ? location.pathname : "#" + filtre); } catch (e) { /* navigation locale */ }
      });
    });
    $$("[data-voir-en]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.getAttribute("data-voir-en");
        cartes.forEach(function (c) { majCarte(c, fin); });
        $$("[data-voir-en]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        annoncer("Toutes les plaques affichées en finition " + FIN_ACC[fin] + ".");
      });
    });
    var selectTri = $("#tri");
    if (selectTri) selectTri.addEventListener("change", function () { tri = selectTri.value; trier(); });
    var depuisHash = function () {
      var h = (location.hash || "").replace("#", "");
      if (h && $("[data-filtre=\"" + h + "\"]")) { filtre = h; appliquer(); }
    };
    window.addEventListener("hashchange", depuisHash);
    depuisHash();
    appliquer();
  }

  /* ---------- dates de livraison estimées ---------- */
  var FERIES = ["2026-11-01", "2026-11-11", "2026-12-25", "2027-01-01", "2027-03-29", "2027-05-01", "2027-05-06", "2027-05-08", "2027-05-17", "2027-07-14", "2027-08-15", "2027-11-01", "2027-11-11", "2027-12-25"];
  function deux(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + deux(d.getMonth() + 1) + "-" + deux(d.getDate()); }
  function plusOuvres(depart, n) {
    var x = new Date(depart.getTime());
    while (n > 0) {
      x.setDate(x.getDate() + 1);
      var j = x.getDay();
      if (j !== 0 && j !== 6 && FERIES.indexOf(iso(x)) < 0) n--;
    }
    return x;
  }
  function jourFr(d) {
    try { return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); }
    catch (e) { return iso(d); }
  }
  $$("[data-estimation]").forEach(function (el) {
    var auj = new Date();
    el.textContent = "Si la plaque part aujourd’hui" + NBSP + ": livraison entre le " + jourFr(plusOuvres(auj, 2)) + " et le " + jourFr(plusOuvres(auj, 4)) + " (2 à 4 jours ouvrés, à titre indicatif).";
  });

  /* ---------- fiche produit ---------- */
  var majFicheLivraison = null;
  var fiche = $("[data-fiche]");
  if (fiche) {
    var type = fiche.getAttribute("data-type");
    var slug = fiche.getAttribute("data-slug");
    var base = +fiche.getAttribute("data-prix");
    var produit = P[slug];
    var caseLed = $("[data-option-led]", fiche);
    var blocCable = $("[data-bloc-cable]", fiche);
    var champQte = $("#qte", fiche);
    var finCourante = function () { var r = $("input[name=finition]:checked", fiche); return r ? r.value : null; };
    var cableCourant = function () { var r = $("input[name=cable]:checked", fiche); return r ? r.value : "Bas droite"; };
    var montant = function () { var r = $("input[name=montant]:checked", fiche); return r ? +r.value : base; };
    var unitaire = function () {
      if (type === "carte") return montant();
      return base + (caseLed && caseLed.checked ? TG.prixLed : 0);
    };
    var quantite = function () { return champQte ? Math.max(1, Math.min(9, parseInt(champQte.value, 10) || 1)) : 1; };
    var totalFiche = function () { return unitaire() * quantite(); };

    majFicheLivraison = function () {
      var el = $("[data-livraison-fiche]");
      if (!el) return;
      var t = totaux(lignes());
      var apres = t.physiqueNet + (type === "carte" ? 0 : totalFiche());
      if (t.physiqueNet >= TG.seuil) el.textContent = "Votre panier a déjà la livraison offerte.";
      else if (apres >= TG.seuil) el.textContent = "Avec cet article, la livraison est offerte (dès " + euros(TG.seuil) + ").";
      else el.textContent = "Livraison offerte dès " + euros(TG.seuil) + " d’articles livrés" + NBSP + ": avec cet article, il manquera " + euros(TG.seuil - apres) + ".";
      majJauge($(".livraison-fiche [data-jauge]"), apres);
    };
    var majPrix = function () {
      var t = euros(totalFiche());
      $$("[data-total]").forEach(function (el) { el.textContent = t; });
      var etiquetteLed = $("[data-barre-led]");
      if (etiquetteLed) etiquetteLed.hidden = !(caseLed && caseLed.checked);
      if (type === "carte") {
        var pu = $("[data-prix-unitaire]"); if (pu) pu.textContent = euros(unitaire());
        var ap = $("[data-carte-apercu-montant]"); if (ap) ap.textContent = euros(unitaire());
      }
      majFicheLivraison();
    };
    var montrerVue = function (cle) {
      $$("[data-scene]", fiche).forEach(function (s) { s.hidden = s.getAttribute("data-scene") !== cle; });
      $$(".vignette", fiche).forEach(function (v) { v.setAttribute("aria-pressed", v.getAttribute("data-vue") === cle ? "true" : "false"); });
    };
    var choisirFin = function (fin, garderVue) {
      var r = $("input[name=finition][value=\"" + fin + "\"]", fiche);
      if (!r) return;
      r.checked = true;
      var nom = $("[data-fin-nom]", fiche); if (nom) nom.textContent = FIN_NOM[fin];
      if (!garderVue) montrerVue(fin);
      $$("[data-barre-fin]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-barre-fin") === fin ? "true" : "false"); });
      var imgEch = $("[data-echelle-img]", fiche);
      if (imgEch && produit) {
        var src = cheminPlaque(slug, fin);
        var gPhoto = $("[data-echelle-photo]", fiche), gVide = $("[data-echelle-vide]", fiche);
        if (src) { imgEch.setAttribute("href", src); gPhoto.style.display = ""; gVide.style.display = "none"; }
        else { gPhoto.style.display = "none"; gVide.style.display = ""; }
      }
    };
    $$("input[name=finition]", fiche).forEach(function (r) { r.addEventListener("change", function () { choisirFin(r.value); }); });
    $$(".vignette", fiche).forEach(function (v) {
      v.addEventListener("click", function () {
        var cle = v.getAttribute("data-vue");
        if (FIN_NOM[cle]) choisirFin(cle); else montrerVue(cle);
      });
    });
    $$("[data-barre-fin]").forEach(function (b) {
      b.addEventListener("click", function () { choisirFin(b.getAttribute("data-barre-fin")); annoncer("Finition " + FIN_ACC[b.getAttribute("data-barre-fin")] + " choisie."); });
    });
    if (caseLed) caseLed.addEventListener("change", function () { if (blocCable) blocCable.hidden = !caseLed.checked; majPrix(); });
    $$("[data-qte]", fiche).forEach(function (b) {
      b.addEventListener("click", function () {
        champQte.value = Math.max(1, Math.min(9, quantite() + (+b.getAttribute("data-qte"))));
        majPrix();
      });
    });
    if (champQte) champQte.addEventListener("input", majPrix);
    $$("input[name=montant]", fiche).forEach(function (r) { r.addEventListener("change", majPrix); });
    var champNom = $("[data-carte-nom]", fiche);
    if (champNom) champNom.addEventListener("input", function () {
      var ap = $("[data-carte-apercu-nom]"); if (ap) ap.textContent = champNom.value.trim() ? "Pour " + champNom.value.trim() : "Pour vous";
    });

    var articleFiche = function () {
      if (type === "led") return { type: "led", slug: "led", cable: cableCourant(), prix: TG.prixLed, qte: quantite() };
      if (type === "carte") {
        var env = $("input[name=envoi]:checked", fiche);
        var msg = $("[data-carte-message]", fiche);
        return { type: "carte", slug: "carte-cadeau", montant: montant(), envoi: env ? env.value : "email", nomDest: champNom ? champNom.value.trim() : "", message: msg ? msg.value.trim() : "", prix: montant(), qte: 1 };
      }
      var led = !!(caseLed && caseLed.checked);
      return { type: "plaque", slug: slug, fin: finCourante(), led: led, cable: led ? cableCourant() : "", prix: unitaire(), qte: quantite() };
    };
    $$("[data-ajouter]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = articleFiche();
        var cad = $("[data-cadeau-message]", fiche), cadPrix = $("[data-cadeau-prix]", fiche);
        if (cad && (cad.value.trim() || (cadPrix && cadPrix.checked))) {
          var c = lire(CLE_CADEAU, {}) || {};
          if (cad.value.trim()) c.message = cad.value.trim();
          if (cadPrix && cadPrix.checked) c.masquer = true;
          ecrire(CLE_CADEAU, c);
          if (cadeauPrix) cadeauPrix.checked = !!c.masquer;
          if (cadeauMsg) cadeauMsg.value = c.message || "";
        }
        ajouter(a);
      });
    });

    var barre = $("[data-barre]");
    var boutonPrincipal = $(".achat [data-ajouter]", fiche);
    if (barre && boutonPrincipal) {
      // La barre apparaît dès que le bouton principal n’est pas à l’écran, au-dessus comme au-dessous :
      // sur téléphone, le prix et l’action sont donc visibles dès le premier écran.
      var majBarre = function (visibleBouton) { barre.classList.toggle("visible", !visibleBouton); };
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entrees) {
          entrees.forEach(function (en) { majBarre(en.isIntersecting); });
        }, { threshold: 0 }).observe(boutonPrincipal);
      } else {
        var attente = false;
        var mesurer = function () {
          attente = false;
          var r = boutonPrincipal.getBoundingClientRect();
          majBarre(r.bottom > 0 && r.top < window.innerHeight);
        };
        window.addEventListener("scroll", function () {
          if (!attente) { attente = true; window.requestAnimationFrame(mesurer); }
        }, { passive: true });
        window.addEventListener("resize", mesurer);
        mesurer();
      }
    }
    majPrix();
  }

  /* ---------- quiz ---------- */
  var quiz = $("[data-quiz]");
  if (quiz) initQuiz(quiz);

  function initQuiz(form) {
    var CLE_QUIZ = "tg-v2-quiz";
    var cles = ["piece", "mur", "theme", "lumiere"];
    var questions = $$(".quiz__question", form);
    var boutonsEtapes = $$("[data-aller]", form);
    var retour = $("[data-quiz-retour]", form), suivant = $("[data-quiz-suivant]", form), erreur = $("[data-quiz-erreur]", form);
    var zoneRes = $("[data-quiz-resultat]");
    var etape = 0;
    form.classList.add("est-js");
    questions.forEach(function (q) { q.setAttribute("tabindex", "-1"); });

    var valeur = function (cle) { var r = $("input[name=" + cle + "]:checked", form); return r ? r.value : null; };
    var libelle = function (cle) { var r = $("input[name=" + cle + "]:checked", form); return r ? $("strong", r.closest(".choix")).textContent : ""; };
    var reponses = function () { var o = {}; cles.forEach(function (c) { o[c] = valeur(c); }); return o; };
    var memo = lire(CLE_QUIZ, {}) || {};
    if (memo.rep) cles.forEach(function (c) {
      var r = memo.rep[c] && $("input[name=" + c + "][value=\"" + memo.rep[c] + "\"]", form);
      if (r) r.checked = true;
    });

    var majEtapes = function () {
      var premierVide = cles.length;
      for (var i = 0; i < cles.length; i++) if (!valeur(cles[i])) { premierVide = i; break; }
      boutonsEtapes.forEach(function (b, i) {
        var faite = !!valeur(cles[i]);
        b.classList.toggle("est-faite", faite);
        b.setAttribute("aria-current", i === etape ? "step" : "false");
        b.disabled = i === etape || i > premierVide;
        var rep = $("[data-rep]", b); if (rep) rep.textContent = libelle(cles[i]);
      });
      retour.disabled = etape === 0;
      suivant.innerHTML = (etape === cles.length - 1 ? "Voir ma plaque" : "Question suivante") + icone(ICO_FLECHE);
    };
    var montrer = function (i, focus) {
      etape = i;
      questions.forEach(function (q, k) { q.classList.toggle("est-active", k === i); });
      erreur.hidden = true;
      majEtapes();
      if (focus) questions[i].focus({ preventScroll: true });
    };
    var sauver = function (res) { ecrire(CLE_QUIZ, { rep: reponses(), res: res || memo.res || null }); };

    // Avance automatique : seulement après un choix au doigt ou à la souris. Au clavier, les flèches
    // changent la réponse sans changer de question ; on passe à la suite avec « Question suivante ».
    var viaPointeur = false, minuteur = null;
    form.addEventListener("pointerdown", function (e) { viaPointeur = !!(e.target.closest && e.target.closest(".choix")); });
    form.addEventListener("keydown", function () { viaPointeur = false; });
    var allerEnHaut = function () { form.scrollIntoView({ block: "start" }); };
    $$("input[type=radio]", form).forEach(function (r) {
      r.addEventListener("change", function () {
        erreur.hidden = true; sauver(); majEtapes();
        if (viaPointeur && r.name === cles[etape] && etape < cles.length - 1) {
          var depuis = etape;
          clearTimeout(minuteur);
          minuteur = setTimeout(function () { if (etape === depuis) { montrer(depuis + 1, true); allerEnHaut(); } }, 280);
        }
        viaPointeur = false;
      });
    });
    suivant.addEventListener("click", function () {
      clearTimeout(minuteur);
      if (!valeur(cles[etape])) { erreur.hidden = false; return; }
      if (etape < cles.length - 1) { montrer(etape + 1, true); allerEnHaut(); }
      else afficherResultat(calculer(reponses()), false);
    });
    retour.addEventListener("click", function () { clearTimeout(minuteur); if (etape > 0) montrer(etape - 1, true); });
    boutonsEtapes.forEach(function (b, i) { b.addEventListener("click", function () { montrer(i, true); }); });

    var TAGS = {
      "le-pic-du-midi": { t: ["sommets", "bagneres"], p: ["salon", "bureau"] },
      "le-tourmalet": { t: ["sommets", "velo"], p: ["bureau", "entree"] },
      "le-montaigu": { t: ["sommets"], p: ["chambre"] },
      "le-cirque-de-gavarnie": { t: ["sommets"], p: ["salon", "exterieur"] },
      "le-pont-despagne": { t: ["sommets"], p: ["entree", "chambre"] },
      "la-tour-des-jacobins": { t: ["patrimoine", "bagneres"], p: ["entree", "bureau"] },
      "le-chateau-de-mauvezin": { t: ["patrimoine"], p: ["salon", "exterieur"] },
      "labbaye-de-lescaladieu": { t: ["patrimoine"], p: ["chambre"] },
      "lisard": { t: ["faune"], p: ["salon", "exterieur"] },
      "lours": { t: ["faune"], p: ["salon", "bureau"] },
      "le-cerf": { t: ["faune"], p: ["entree", "salon"] },
      "la-marmotte": { t: ["faune"], p: ["chambre"] }
    };
    var ORDRE = Object.keys(TAGS);
    var FIN_MUR = { clair: "noir", gris: "dore", fonce: "dore", bois: "noir", nsp: "noir" };
    var RAISONS_PIECE = {
      salon: "Pour un salon : 60 × 30 cm, la plaque trouve sa place au-dessus d’un canapé ou d’un buffet.",
      chambre: "Pour une chambre : un sujet calme, qu’on regarde volontiers en fin de journée.",
      bureau: "Pour un bureau : un repère de montagne à regarder entre deux tâches.",
      entree: "Pour une entrée : la plaque accueille les invités et se pose sans perçage.",
      exterieur: { t: "Dehors : l’aluminium thermolaqué s’utilise aussi en extérieur.", note: "<span class=\"note-maq note-maq--fournir\">à confirmer" + NBSP + ": fixation conseillée en extérieur</span>" },
      offrir: "Pour offrir : si vous doutez, la carte cadeau laisse la personne choisir."
    };
    var RAISONS_MUR = {
      clair: "Sur un mur clair, la finition noire donne le plus de contraste à la découpe.",
      gris: "Sur du gris ou du béton, le doré réchauffe le mur.",
      fonce: "Sur un mur foncé, le doré ressort nettement.",
      bois: "Sur du bois ou de la pierre, le noir dessine une silhouette nette.",
      nsp: "Mur inconnu : le noir est la finition la plus facile à placer."
    };
    var RAISONS_THEME = {
      sommets: "Vous aimez les sommets et les grands sites.",
      patrimoine: "Vous aimez les vieilles pierres et l’histoire locale.",
      faune: "Vous aimez les animaux des Pyrénées.",
      velo: "Vous aimez le vélo : le col du Tourmalet culmine à 2" + " " + "115 m.",
      bagneres: "Vous êtes attaché à Bagnères-de-Bigorre.",
      nsp: "Vous n’avez pas tranché : voici l’une des plaques marquées « meilleure vente » sur le site actuel."
    };

    function calculer(r) {
      if (r.piece === "offrir" && r.theme === "nsp") {
        return { slug: "carte-cadeau", carte: true, alts: ["le-pic-du-midi", "lisard"], r: r };
      }
      var scores = ORDRE.map(function (s, i) {
        var tg = TAGS[s], sc = 0;
        if (tg.t.indexOf(r.theme) >= 0) sc += 10;
        if (r.theme === "nsp" && P[s].best) sc += 6;
        if (tg.p.indexOf(r.piece) >= 0) sc += 3;
        if (P[s].best) sc += 1;
        return { s: s, sc: sc, i: i };
      });
      scores.sort(function (a, b) { return b.sc - a.sc || a.i - b.i; });
      var choix = scores[0].s;
      // La finition suit le mur, même si sa photo manque : l’emplacement « photo à venir » s’affiche alors.
      var finVoulue = FIN_MUR[r.mur] || "noir";
      var fin = finVoulue;
      var led = r.lumiere === "oui" && r.piece !== "exterieur";
      var alts = [scores[1].s, scores[2].s];
      return { slug: choix, fin: fin, finVoulue: finVoulue, led: led, alts: alts, r: r };
    }

    function pourquoi(res) {
      var r = res.r, l = [];
      if (res.partage) return ["Cette sélection vous a été envoyée par lien.", "Refaites le quiz pour une recommandation adaptée à votre mur."];
      if (res.carte) return ["C’est pour offrir et vous ne connaissez pas ses goûts : la personne choisit elle-même sa plaque.", "La carte part tout de suite par e-mail, ou vous l’imprimez."];
      if (RAISONS_PIECE[r.piece]) l.push(RAISONS_PIECE[r.piece]);
      if (RAISONS_MUR[r.mur]) l.push(RAISONS_MUR[r.mur]);
      if (!cheminPlaque(res.slug, res.fin)) l.push("La photo de " + P[res.slug].nom + " en finition " + FIN_ACC[res.fin] + " est à venir : cette finition est bien vendue.");
      if (RAISONS_THEME[r.theme]) l.push(RAISONS_THEME[r.theme]);
      if (r.lumiere === "oui" && r.piece === "exterieur") l.push("Dehors, nous ne proposons pas le kit LED d’office : son usage extérieur reste à confirmer avec l’atelier.");
      else if (r.lumiere === "oui") l.push("Vous voulez de la lumière : le kit LED est monté au dos par l’atelier, +" + euros(TG.prixLed) + ".");
      else if (r.lumiere === "non") l.push("Sans lumière, les ombres de la découpe font le travail grâce au décalage des fixations.");
      else l.push("Le kit LED reste en option : cochez-le ci-dessous si l’idée vous plaît.");
      return l;
    }

    // Même gabarit que les cartes de la boutique : cartel, nom, note, prix, pastilles, bouton.
    var ETOILE = "<svg viewBox=\"0 0 20 20\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.6l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z\"/></svg>";
    function ligneAvisAlt(p) {
      if (!p.nbAvis) return "<p class=\"carte__avis carte__avis--vide\">Pas encore d’avis</p>";
      var cinq = ETOILE + ETOILE + ETOILE + ETOILE + ETOILE;
      var note = String(p.moyenne.toFixed(1)).replace(".", ",");
      return "<p class=\"carte__avis\"><span class=\"etoiles\" style=\"--n:" + (p.moyenne / 5 * 100) + "%\" aria-hidden=\"true\"><span class=\"etoiles__fond\">" + cinq + "</span><span class=\"etoiles__plein\">" + cinq + "</span></span><span class=\"carte__note\">" + note + "</span><span class=\"attenue\">(" + p.nbAvis + " avis)</span><span class=\"sr\">Note " + note + " sur 5, " + p.nbAvis + " avis</span></p>";
    }
    function carteAlt(slug, fin) {
      var p = P[slug];
      if (slug === "carte-cadeau") return "";
      var manque = ["noir", "gris", "dore"].filter(function (f) { return !p.fins[f]; });
      var img = cheminPlaque(slug, fin) ? imgPlaqueHTML(slug, fin, "(max-width: 699px) 44vw, 250px", " loading=\"lazy\" data-img") : "";
      var vide = "";
      if (manque.length) {
        var fv = cheminPlaque(slug, fin) ? manque[0] : fin;
        vide = "<div class=\"plaque-vide\" role=\"img\" aria-label=\"Photo de " + esc(p.nom) + " en finition " + FIN_ACC[fv] + " à venir\" data-vide" + (cheminPlaque(slug, fin) ? " hidden" : "") + "><span class=\"plaque-vide__mot\">Photo à venir</span><span class=\"plaque-vide__fin\" data-vide-fin>Finition " + FIN_ACC[fv] + "</span><span class=\"note-maq note-maq--fournir\">à fournir" + NBSP + ": photo</span></div>";
      }
      if (!img) {
        var fImg = finAvecPhoto(slug, "noir");
        img = imgPlaqueHTML(slug, fImg, "(max-width: 699px) 44vw, 250px", " loading=\"lazy\" data-img hidden");
      }
      var pastilles = ["noir", "gris", "dore"].map(function (f) {
        var lib = FIN_NOM[f] + (p.fins[f] ? "" : ", photo à venir");
        return "<button type=\"button\" class=\"pastille pastille--" + f + (p.fins[f] ? "" : " pastille--manque") + "\" data-fin=\"" + f + "\" aria-pressed=\"" + (f === fin) + "\" title=\"" + lib + "\"><span class=\"sr\">" + lib + "</span></button>";
      }).join("");
      return "<li class=\"carte\" data-slug=\"" + slug + "\" data-fin=\"" + fin + "\"><div class=\"carte__visuel\"><a href=\"produit-" + slug + ".html\" tabindex=\"-1\" aria-hidden=\"true\"><div class=\"plaque\" data-plaque>" + img + vide + "</div></a></div>" +
        "<div class=\"carte__corps\"><p class=\"carte__cartel\">" + esc(p.cartel) + "</p><h4 class=\"carte__nom\"><a href=\"produit-" + slug + ".html\">" + esc(p.nom) + "</a></h4>" + ligneAvisAlt(p) +
        "<div class=\"carte__bas\"><span class=\"carte__prix\">" + euros(p.prix) + "</span><div class=\"pastilles\" role=\"group\" aria-label=\"Finition de " + esc(p.nom) + "\">" + pastilles + "</div></div>" +
        "<button type=\"button\" class=\"btn-ajout\" data-ajout-carte>" + icone(ICO_PLUS) + "Ajouter<span class=\"sr\" data-ajout-sr> " + esc(p.nom) + ", finition " + FIN_ACC[fin] + ", au panier</span></button></div></li>";
    }

    var resultatCourant = null;
    function afficherResultat(res, depuisLien) {
      resultatCourant = res;
      var visuel = $("[data-res-visuel]"), titre = $("[data-res-titre]"), options = $("[data-res-options]");
      var liste = $("[data-res-pourquoi]"), total = $("[data-res-total]"), fiche = $("[data-res-fiche]");
      var ledZone = $("[data-res-led-option]"), alts = $("[data-res-alternatives]"), lien = $("[data-res-lien]");
      var port = $("[data-res-port]");
      port.textContent = "TTC, hors frais de port";
      $("[data-res-surtitre]").textContent = depuisLien ? "Résultat partagé" : "Notre recommandation";
      var calcTotal;
      if (res.carte) {
        visuel.innerHTML = "<figure class=\"carte-visuel carte-visuel--petit\"><img src=\"" + TG.img + "misc/carte-cadeau.webp\" width=\"720\" height=\"720\" alt=\"Carte cadeau Terre Gravée, couleur cuivre\"></figure>";
        titre.textContent = "La carte cadeau";
        options.textContent = euros(65) + ", une plaque au choix, envoi immédiat par e-mail";
        ledZone.innerHTML = "";
        calcTotal = function () { return 65; };
        port.textContent = "TTC, sans frais de port" + NBSP + ": envoi par e-mail";
        fiche.href = "produit-carte-cadeau.html";
      } else {
        var p = P[res.slug];
        var html = "<figure class=\"cotes\"><div class=\"plaque\">" + imgPlaqueHTML(res.slug, res.fin, "(max-width: 900px) 40vw, 200px") + "</div><span class=\"cote cote--h\"><span>30 cm</span></span><span class=\"cote cote--v\"><span>60 cm</span></span></figure>";
        if (res.led) html += "<p class=\"resultat__led\">" + vignette("led/led-img1.webp") + "<span>Exemple réel de rétroéclairage : Le Pic du Midi en vert.</span></p>";
        visuel.innerHTML = html;
        titre.textContent = p.nom;
        var majOptions = function () { options.textContent = "Finition " + FIN_ACC[res.fin] + (res.led ? " · kit LED monté, câble " + res.cable.toLowerCase() : "") + " · " + p.cartel; };
        res.cable = res.cable || "Bas droite";
        var opts = CABLES.map(function (c) { return "<option" + (c === res.cable ? " selected" : "") + ">" + c + "</option>"; }).join("");
        ledZone.innerHTML = "<div class=\"led-option-res\"><label class=\"coche\"><input type=\"checkbox\" data-res-led" + (res.led ? " checked" : "") + "> <span><strong>Kit LED monté par l’atelier, +" + euros(TG.prixLed) + "</strong><br><span class=\"petit\">Ruban RGB, télécommande, alimentation USB (adaptateur non fourni).</span></span></label></div>" +
          "<div class=\"champ\" data-res-cable" + (res.led ? "" : " hidden") + "><label for=\"res-cable\">Sortie du câble</label><select id=\"res-cable\">" + opts + "</select></div>";
        var caseRes = $("[data-res-led]"), selRes = $("#res-cable");
        caseRes.addEventListener("change", function () { res.led = caseRes.checked; $("[data-res-cable]").hidden = !res.led; majOptions(); majTotal(); majLien(); });
        selRes.addEventListener("change", function () { res.cable = selRes.value; majOptions(); });
        calcTotal = function () { return TG.prixPlaque + (res.led ? TG.prixLed : 0); };
        fiche.href = "produit-" + res.slug + ".html";
        majOptions();
      }
      // une raison est un texte, ou { t: texte, note: étiquette de maquette déjà en HTML }
      liste.innerHTML = pourquoi(res).map(function (x) {
        var o = typeof x === "string" ? { t: x } : x;
        return "<li>" + esc(o.t) + (o.note ? " " + o.note : "") + "</li>";
      }).join("");
      var majTotal = function () { total.textContent = euros(calcTotal()); };
      var majLien = function () {
        var base = location.href.split("#")[0];
        lien.value = base + "#r=" + (res.carte ? "carte-cadeau" : res.slug + "-" + res.fin + (res.led ? "-led" : ""));
        try { history.replaceState(null, "", "#r=" + (res.carte ? "carte-cadeau" : res.slug + "-" + res.fin + (res.led ? "-led" : ""))); } catch (e) { /* navigation locale */ }
      };
      majTotal(); majLien();
      var htmlAlts = res.alts.map(function (s) { return carteAlt(s, res.carte ? "noir" : res.fin); }).join("");
      if (!res.carte) {
        var trio = [res.slug].concat(res.alts).map(function (s) { return s + "-" + res.fin; });
        htmlAlts += "<li class=\"tuile-promo tuile-promo--trip\"><div class=\"trip__mini\" aria-hidden=\"true\">" +
          [res.slug].concat(res.alts).map(function (s) { return "<div class=\"plaque\">" + imgPlaqueHTML(s, res.fin, "50px") + "</div>"; }).join("") +
          "</div><p class=\"surtitre\">Les trois ensemble</p><h4 class=\"tuile-promo__titre\">Votre plaque et ses deux pistes en Triptyque</h4><p><strong>" + euros(3 * TG.prixPlaque * (1 - TG.remise)) + "</strong> les trois.</p><p class=\"petit\">" + valider("remise de 10" + NBSP + "%") + "</p><a class=\"lien-fleche\" href=\"triptyque.html#t=" + trio.join(",") + "\">Voir le Triptyque" + icone(ICO_FLECHE) + "</a></li>";
      }
      alts.innerHTML = htmlAlts;
      form.hidden = true;
      zoneRes.hidden = false;
      if (!depuisLien) sauver({ slug: res.slug, fin: res.fin, led: res.led });
      zoneRes.focus({ preventScroll: true });
      zoneRes.scrollIntoView({ block: "start" });
    }
    $("[data-res-ajouter]").addEventListener("click", function () {
      var res = resultatCourant; if (!res) return;
      if (res.carte) ajouter({ type: "carte", slug: "carte-cadeau", montant: 65, envoi: "email", nomDest: "", message: "", prix: 65, qte: 1 });
      else ajouter({ type: "plaque", slug: res.slug, fin: res.fin, led: !!res.led, cable: res.led ? res.cable : "", prix: TG.prixPlaque + (res.led ? TG.prixLed : 0), qte: 1 });
    });
    $("[data-res-modifier]").addEventListener("click", function () {
      form.hidden = false; zoneRes.hidden = true;
      montrer(0, true); form.scrollIntoView({ block: "start" });
    });
    $("[data-res-recommencer]").addEventListener("click", function () {
      $$("input[type=radio]", form).forEach(function (r) { r.checked = false; });
      zoneRes.hidden = true; form.hidden = false; ecrire(CLE_QUIZ, {});
      try { history.replaceState(null, "", location.pathname); } catch (e) { /* navigation locale */ }
      montrer(0, true); form.scrollIntoView({ block: "start" });
    });

    // résultat partagé par lien : quiz.html#r=le-pic-du-midi-noir-led
    montrer(0, false);
    var lireLien = function () {
      var h = (location.hash || "").match(/^#r=([a-z-]+)$/);
      if (!h) return;
      var lien = $("[data-res-lien]");
      if (lien && lien.value.split("#")[1] === location.hash.slice(1)) return;
      var code = h[1];
      if (code === "carte-cadeau") afficherResultat({ slug: "carte-cadeau", carte: true, partage: true, alts: ["le-pic-du-midi", "lisard"], r: {} }, true);
      else {
        var led = /-led$/.test(code);
        code = code.replace(/-led$/, "");
        var m = code.match(/^(.*)-(noir|gris|dore)$/);
        if (m && TAGS[m[1]]) {
          var memes = ORDRE.filter(function (s) { return s !== m[1] && P[s].collection === P[m[1]].collection; });
          afficherResultat({ slug: m[1], fin: m[2], finVoulue: m[2], led: led, partage: true, alts: memes.slice(0, 2), r: {} }, true);
        }
      }
    };
    lireLien();
    window.addEventListener("hashchange", lireLien);
  }

  /* ---------- composeur de Triptyque ---------- */
  var compo = $("[data-triptyque]");
  if (compo) initTriptyque(compo);

  function initTriptyque(zone) {
    var places = [null, null, null];
    var finsPrevues = ["noir", "noir", "noir"];
    var finsChoisies = [false, false, false];
    var actif = 0;
    var emps = $$("[data-emplacement]", zone);
    var pioches = $$("[data-pioche]", zone);
    var caseMeme = $("[data-trip-meme]", zone), caseLed = $("[data-trip-led]", zone), blocCable = $("[data-trip-cable]", zone);
    var sortieTotal = $("[data-trip-total]", zone), detail = $("[data-trip-detail]", zone), aide = $("[data-trip-aide]", zone);
    var boutonAjout = $("[data-trip-ajouter]", zone), boutonPartage = $("[data-trip-partager]", zone), cible = $("[data-trip-cible]", zone);

    var code = function () { return places.map(function (p) { return p ? p.slug + "-" + p.fin : ""; }).filter(Boolean).join(","); };
    var rendre = function () {
      emps.forEach(function (el, i) {
        var s = places[i];
        var b = $("[data-choisir-emplacement]", el), nom = $("[data-emplacement-nom]", el);
        b.setAttribute("aria-pressed", i === actif ? "true" : "false");
        if (s) {
          b.classList.add("est-rempli");
          b.innerHTML = imgPlaqueHTML(s.slug, s.fin, "(max-width: 900px) 28vw, 180px");
          nom.textContent = P[s.slug].nom;
          b.setAttribute("aria-label", "Lieu " + (i + 1) + " : " + P[s.slug].nom + ", finition " + FIN_ACC[s.fin] + ". Sélectionner pour changer");
        } else {
          b.classList.remove("est-rempli");
          b.innerHTML = "<span class=\"emplacement__vide\">Lieu " + (i + 1) + "<br><small>Choisissez dans la liste</small></span>";
          nom.textContent = "À choisir";
          b.setAttribute("aria-label", "Lieu " + (i + 1) + " : à choisir");
        }
        var fin = s ? s.fin : finsPrevues[i];
        $$("[data-emp-fin]", el).forEach(function (pb) { pb.setAttribute("aria-pressed", pb.getAttribute("data-emp-fin") === fin ? "true" : "false"); });
      });
      pioches.forEach(function (pb) {
        var rangs = [];
        places.forEach(function (p, i) { if (p && p.slug === pb.getAttribute("data-pioche")) rangs.push(i + 1); });
        pb.classList.toggle("est-choisie", rangs.length > 0);
        if (rangs.length) pb.setAttribute("data-rang", rangs.join("·")); else pb.removeAttribute("data-rang");
      });
      var n = places.filter(Boolean).length;
      var led = caseLed && caseLed.checked;
      var tot = 3 * TG.prixPlaque * (1 - TG.remise) + (led ? 3 * TG.prixLed : 0);
      sortieTotal.textContent = euros(tot);
      detail.textContent = "3 × " + euros(TG.prixPlaque) + " = " + euros(3 * TG.prixPlaque) + ", remise de 10" + NBSP + "%" + NBSP + ": −" + euros(3 * TG.prixPlaque * TG.remise) + (led ? ", kits LED +" + euros(3 * TG.prixLed) : "");
      boutonAjout.disabled = n < 3;
      aide.textContent = n < 3 ? "Choisissez encore " + (3 - n) + (3 - n > 1 ? " lieux." : " lieu.") : "Votre Triptyque est prêt.";
      if (cible) cible.textContent = "le lieu " + (actif + 1);
      if (blocCable) blocCable.hidden = !led;
      try { history.replaceState(null, "", code() ? "#t=" + code() : location.pathname); } catch (e) { /* navigation locale */ }
    };
    var prochainVide = function (depuis) {
      for (var k = 1; k <= 3; k++) { var j = (depuis + k) % 3; if (!places[j]) return j; }
      return depuis;
    };
    pioches.forEach(function (pb) {
      pb.addEventListener("click", function () {
        var slug = pb.getAttribute("data-pioche");
        // Sans finition choisie pour ce lieu, on prend une finition qui a une photo (Le Cerf en gris, comme dans la boutique).
        var base = finsPrevues[actif];
        var explicite = finsChoisies[actif] || (caseMeme && caseMeme.checked);
        var fin = explicite ? base : finAvecPhoto(slug, base);
        places[actif] = { slug: slug, fin: fin };
        annoncer(P[slug].nom + " placé en lieu " + (actif + 1) + ".");
        actif = prochainVide(actif);
        rendre();
      });
    });
    emps.forEach(function (el, i) {
      $("[data-choisir-emplacement]", el).addEventListener("click", function () { actif = i; rendre(); });
      $$("[data-emp-fin]", el).forEach(function (pb) {
        pb.addEventListener("click", function () {
          var f = pb.getAttribute("data-emp-fin");
          var cibles = caseMeme && caseMeme.checked ? [0, 1, 2] : [i];
          cibles.forEach(function (k) { finsPrevues[k] = f; finsChoisies[k] = true; if (places[k]) places[k].fin = f; });
          rendre();
        });
      });
    });
    if (caseMeme) caseMeme.addEventListener("change", function () {
      if (!caseMeme.checked) return;
      var f = places[actif] ? places[actif].fin : finsPrevues[actif];
      [0, 1, 2].forEach(function (k) { finsPrevues[k] = f; finsChoisies[k] = true; if (places[k]) places[k].fin = f; });
      rendre();
    });
    if (caseLed) caseLed.addEventListener("change", rendre);
    $$("[data-pioche-filtre]", zone).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-pioche-filtre");
        pioches.forEach(function (pb) { pb.parentElement.hidden = !(f === "tout" || pb.getAttribute("data-collection") === f); });
        $$("[data-pioche-filtre]", zone).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    var charger = function (txt) {
      var items = txt.split(",");
      items.forEach(function (it, i) {
        if (i > 2) return;
        var m = it.match(/^(.*)-(noir|gris|dore)$/);
        if (m && P[m[1]] && P[m[1]].collection !== "accessoires") { places[i] = { slug: m[1], fin: m[2] }; finsPrevues[i] = m[2]; finsChoisies[i] = true; }
      });
      actif = 0;
      for (var k = 0; k < 3; k++) { if (!places[k]) { actif = k; break; } }
    };
    $$("[data-idee]", zone).forEach(function (b) {
      b.addEventListener("click", function () { places = [null, null, null]; charger(b.getAttribute("data-idee")); rendre(); annoncer("Idée chargée : " + b.textContent + "."); });
    });
    boutonAjout.addEventListener("click", function () {
      var led = caseLed && caseLed.checked;
      var cableR = $("input[name=cable-trip]:checked", zone);
      var cable = cableR ? cableR.value : "Bas droite";
      ajouter(places.map(function (p) { return { type: "plaque", slug: p.slug, fin: p.fin, led: led, cable: led ? cable : "", prix: TG.prixPlaque + (led ? TG.prixLed : 0), qte: 1 }; }));
    });
    boutonPartage.addEventListener("click", function () {
      copier(location.href.split("#")[0] + (code() ? "#t=" + code() : ""), boutonPartage);
    });
    var lireLienTrip = function () {
      var h = (location.hash || "").match(/^#t=([a-z,-]+)$/);
      if (!h || h[1] === code()) return;
      places = [null, null, null];
      charger(h[1]);
      rendre();
    };
    lireLienTrip();
    window.addEventListener("hashchange", lireLienTrip);
    rendre();
  }

  /* ---------- copier ---------- */
  function copier(texte, bouton, cibleSelection) {
    var libelle = bouton.getAttribute("data-libelle") || bouton.lastChild.textContent;
    bouton.setAttribute("data-libelle", libelle);
    var ok = function () { bouton.lastChild.textContent = "Copié"; setTimeout(function () { bouton.lastChild.textContent = libelle; }, 2000); annoncer("Copié dans le presse-papiers."); };
    var repli = function () {
      if (cibleSelection) {
        if (cibleSelection.select) cibleSelection.select();
        else { var r = document.createRange(); r.selectNodeContents(cibleSelection); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      }
      bouton.lastChild.textContent = bouton.getAttribute("data-repli") || (cibleSelection ? "Texte sélectionné, copiez-le" : "Copiez l’adresse de la page");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(ok, repli);
    } else repli();
  }
  $$("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () { var el = document.getElementById(b.getAttribute("data-copier")); copier(el.textContent.trim(), b, el); });
  });
  $$("[data-copier-champ]").forEach(function (b) {
    b.addEventListener("click", function () { var el = document.getElementById(b.getAttribute("data-copier-champ")); copier(el.value, b, el); });
  });

  /* ---------- formulaires de démonstration : rien n’est envoyé ---------- */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var requis = $$("[required]", f);
      for (var i = 0; i < requis.length; i++) {
        if (!requis[i].checkValidity()) { if (requis[i].reportValidity) requis[i].reportValidity(); return; }
      }
      var msg = $(".message-demo", f);
      if (msg) { msg.hidden = false; msg.textContent = msg.textContent; }
    });
  });

  /* ---------- notes jaunes de maquette : masquables pour juger le rendu réel ---------- */
  var CLE_NOTES = "tg-v2-notes";
  var majBoutonsNotes = function () {
    var masquees = document.documentElement.classList.contains("sans-notes");
    $$("[data-notes]").forEach(function (b) { b.setAttribute("aria-pressed", masquees ? "true" : "false"); });
  };
  $$("[data-notes]").forEach(function (b) {
    b.addEventListener("click", function () {
      var masquees = document.documentElement.classList.toggle("sans-notes");
      try { window.localStorage.setItem(CLE_NOTES, masquees ? "masquees" : "visibles"); } catch (e) { /* préférence non mémorisée */ }
      majBoutonsNotes();
      annoncer(masquees ? "Notes de maquette masquées." : "Notes de maquette affichées.");
    });
  });
  majBoutonsNotes();

  /* ---------- aperçu « votre charte » : palette de Romain sur toute la maquette ---------- */
  var CLE_CHARTE = "tg-v2-charte";
  var majCharte = function (active, memoriser) {
    document.documentElement.classList.toggle("charte", active);
    if (memoriser) { try { window.localStorage.setItem(CLE_CHARTE, active ? "romain" : "v2"); } catch (e) { /* préférence non mémorisée */ } }
    $$("[data-charte]").forEach(function (b) { b.setAttribute("aria-pressed", active ? "true" : "false"); });
  };
  $$("[data-charte]").forEach(function (b) {
    b.addEventListener("click", function () {
      var active = !document.documentElement.classList.contains("charte");
      majCharte(active, true);
      annoncer(active ? "Palette de votre charte appliquée à la maquette." : "Palette de la version 2 rétablie.");
    });
  });
  $$("[data-charte-quitter]").forEach(function (b) {
    b.addEventListener("click", function () {
      majCharte(false, true);
      annoncer("Palette de la version 2 rétablie.");
      var lien = $(".bandeau-maq__liens a");
      if (lien) lien.focus();
    });
  });
  majCharte(document.documentElement.classList.contains("charte"), false);

  /* ---------- qr.html : quiz en un clic ---------- */
  var clic = $("[data-clic]");
  if (clic) {
    var choixClic = $$("[data-clic-choix]", clic), resClic = $$("[data-clic-res]", clic), attente = $("[data-clic-attente]", clic);
    choixClic.forEach(function (b) {
      b.addEventListener("click", function () {
        var cle = b.getAttribute("data-clic-choix");
        choixClic.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var cible = null;
        resClic.forEach(function (r) { var ok = r.getAttribute("data-clic-res") === cle; r.hidden = !ok; if (ok) cible = r; });
        if (attente) attente.hidden = true;
        annoncer("Plaque proposée" + NBSP + ": " + b.getAttribute("data-clic-nom") + ". Elle s’affiche sous les réponses, avec son bouton d’ajout au panier.");
        if (cible) {
          var haut = cible.getBoundingClientRect().top;
          if (haut > window.innerHeight - 160) {
            var doux = window.matchMedia && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            cible.scrollIntoView({ block: "nearest", behavior: doux ? "smooth" : "auto" });
          }
        }
      });
    });
  }

  /* ---------- champ fichier en français ---------- */
  $$(".fichier__input").forEach(function (champ) {
    var nom = $("[data-fichier-nom]", champ.parentNode);
    champ.addEventListener("change", function () {
      if (nom) nom.textContent = champ.files && champ.files.length ? champ.files[0].name : "Aucun fichier choisi";
    });
  });

  /* ---------- Noël : après la date limite proposée, la carte cadeau prend le relais ---------- */
  var dateCle = $(".date-cle__date");
  if (dateCle && new Date() > new Date(2026, 11, 14, 23, 59)) {
    dateCle.innerHTML = "La date conseillée est passée. <strong>Offrez la carte cadeau</strong>";
  }

  rendrePanier();
})();
