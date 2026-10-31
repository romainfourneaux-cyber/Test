/* Terre Gravée · maquette version 4. Script commun à toutes les pages (script classique, sans module).
   Trois moments interactifs : la lumière du mur, les pastilles de finition, la carte des lieux.
   Le reste est fonctionnel : menu, panier de démonstration (gardé dans le navigateur), filtres, fiche, formulaires simulés. */
(function () {
  "use strict";

  var CLE_PANIER = "tg-v4-panier";
  var NOMS_FINITION = { noir: "Noir", gris: "Gris", dore: "Doré" };
  var ACCORD_FINITION = { noir: "noire", gris: "grise", dore: "dorée" };
  var mouvementReduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function euros(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €"; }
  function remplacerAdresse(hash) {
    try { history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search); } catch (e) { /* fichier local : sans effet */ }
  }

  /* ---------- Menu mobile ---------- */
  var entete = $(".entete");
  var boutonMenu = $(".bouton-menu");
  if (entete && boutonMenu) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = entete.classList.toggle("menu-ouvert");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  /* ---------- Panier de démonstration ---------- */
  var memoirePanier = [];
  function lirePanier() {
    try {
      var brut = localStorage.getItem(CLE_PANIER);
      var lignes = brut ? JSON.parse(brut) : [];
      return Array.isArray(lignes) ? lignes : [];
    } catch (e) { return memoirePanier.slice(); }
  }
  function ecrirePanier(lignes) {
    memoirePanier = lignes.slice();
    try { localStorage.setItem(CLE_PANIER, JSON.stringify(lignes)); } catch (e) { /* stockage indisponible : le panier reste en mémoire */ }
    afficherPanier();
  }
  function ajouterAuPanier(article) {
    var lignes = lirePanier();
    var existante = lignes.filter(function (l) { return l.cle === article.cle; })[0];
    if (existante) { existante.qte = Math.min(99, existante.qte + article.qte); } else { lignes.push(article); }
    ecrirePanier(lignes);
    toast(article.nom + " ajouté au panier");
  }

  /* Le tiroir est une boîte de dialogue modale : pendant qu’il est ouvert, le reste de la page est inerte
     (le clavier reste dans le tiroir) ; à la fermeture, le focus revient au bouton d’origine. */
  var tiroir = $(".tiroir");
  var voile = $(".voile");
  var horsTiroir = $$(".lien-evitement, .bandeau-maquette, .entete, main, .pied, .barre-achat-mobile, .toast");
  var dernierFocus = null;
  function ouvrirPanier() {
    if (!tiroir) return;
    dernierFocus = document.activeElement;
    if (toastEl) toastEl.classList.remove("visible");
    horsTiroir.forEach(function (el) { el.setAttribute("inert", ""); });
    tiroir.removeAttribute("inert"); tiroir.setAttribute("aria-hidden", "false");
    tiroir.classList.add("ouvert"); if (voile) voile.classList.add("ouvert");
    var fermer = $(".tiroir__fermer", tiroir);
    if (fermer) {
      fermer.focus();
      if (document.activeElement !== fermer) requestAnimationFrame(function () { fermer.focus(); });
    }
  }
  function fermerPanier() {
    if (!tiroir || !tiroir.classList.contains("ouvert")) return;
    tiroir.classList.remove("ouvert"); if (voile) voile.classList.remove("ouvert");
    tiroir.setAttribute("inert", ""); tiroir.setAttribute("aria-hidden", "true");
    horsTiroir.forEach(function (el) { el.removeAttribute("inert"); });
    if (dernierFocus && dernierFocus.focus) dernierFocus.focus();
  }
  $$("[data-ouvrir-panier]").forEach(function (b) { b.addEventListener("click", ouvrirPanier); });
  $$("[data-fermer-panier]").forEach(function (b) { b.addEventListener("click", fermerPanier); });

  var FRAIS_PORT = 5;
  /* Offre de fin d’année : livraison offerte du vendredi 27 novembre au lundi 14 décembre 2026 inclus
     (dates proposées par la maquette, à confirmer par Romain ; mêmes dates dans build.py).
     Les dates sont comparées en heure locale : l’offre s’arrête le 15 décembre à 0 h. */
  var OFFRE_DEBUT = new Date(2026, 10, 27);
  var OFFRE_FIN = new Date(2026, 11, 15);
  function livraisonOfferte() {
    var maintenant = new Date();
    return maintenant >= OFFRE_DEBUT && maintenant < OFFRE_FIN;
  }
  /* Après l’offre, l’annonce de fin d’année de l’accueil (offre et date limite de Noël) est masquée. */
  if (new Date() >= OFFRE_FIN) $$(".annonce").forEach(function (el) { el.hidden = true; });
  function afficherPanier() {
    var lignes = lirePanier();
    var total = 0, nombre = 0;
    lignes.forEach(function (l) { total += l.prix * l.qte; nombre += l.qte; });
    $$(".compteur").forEach(function (c) { c.textContent = nombre; });
    $$("[data-ouvrir-panier].bouton-icone").forEach(function (b) {
      b.setAttribute("aria-label", "Ouvrir le panier, " + nombre + (nombre > 1 ? " articles" : " article"));
    });
    var liste = $(".tiroir__liste");
    if (!liste) return;
    liste.innerHTML = "";
    if (!lignes.length) {
      var vide = document.createElement("li");
      vide.className = "tiroir__vide";
      vide.innerHTML = "<p>Votre panier est vide.</p><a class=\"lien-fleche\" href=\"collection.html\">Voir la collection</a>";
      liste.appendChild(vide);
    }
    lignes.forEach(function (l, i) {
      var li = document.createElement("li");
      li.className = "ligne-panier";
      var image = document.createElement("img");
      image.src = l.image; image.alt = ""; image.width = 52; image.height = l.carre ? 52 : 104;
      if (l.carre) image.className = "carre";
      var milieu = document.createElement("div");
      var nom = document.createElement("strong"); nom.textContent = l.nom;
      milieu.appendChild(nom);
      (l.details || []).forEach(function (d) { var s = document.createElement("span"); s.textContent = d; milieu.appendChild(s); });
      var q = document.createElement("span"); q.textContent = "Quantité : " + l.qte; milieu.appendChild(q);
      var retirer = document.createElement("button"); retirer.type = "button"; retirer.textContent = "Retirer";
      retirer.setAttribute("aria-label", "Retirer " + l.nom + " du panier");
      retirer.addEventListener("click", function () { var ls = lirePanier(); ls.splice(i, 1); ecrirePanier(ls); var f = $(".tiroir__fermer"); if (f) f.focus(); });
      milieu.appendChild(retirer);
      var prix = document.createElement("span"); prix.className = "num"; prix.textContent = euros(l.prix * l.qte);
      li.appendChild(image); li.appendChild(milieu); li.appendChild(prix);
      liste.appendChild(li);
    });
    /* Livraison : 5 € par commande dès qu’une plaque s’expédie (le kit LED ne se vend pas seul) ;
       la carte cadeau part par e-mail ; 0 € pendant l’offre de fin d’année. */
    var aExpedier = lignes.some(function (l) { return String(l.cle || "").indexOf("carte-cadeau") !== 0; });
    var offre = livraisonOfferte();
    var port = aExpedier && !offre ? FRAIS_PORT : 0;
    var champ = function (sel, texte) { var el = $(sel); if (el) el.textContent = texte; };
    var texteNormal = $("[data-livraison-normale]"), texteOffre = $("[data-livraison-offerte]");
    if (texteNormal) texteNormal.hidden = offre;
    if (texteOffre) texteOffre.hidden = !offre;
    champ("[data-sous-total]", euros(total));
    champ("[data-livraison]", euros(port));
    champ("[data-total]", euros(total + port));
    var montants = $(".tiroir__montants"); if (montants) montants.hidden = !lignes.length;
  }
  afficherPanier();
  window.addEventListener("storage", function (e) { if (e.key === CLE_PANIER) afficherPanier(); });

  var toastEl = $(".toast");
  var minuteurToast = null;
  function toast(texte) {
    if (!toastEl) return;
    $(".toast__texte", toastEl).textContent = texte;
    toastEl.classList.add("visible");
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(function () { toastEl.classList.remove("visible"); }, 3600);
  }

  /* ---------- Pastilles de finition des cartes ---------- */
  function montrerFinition(carte, fin) {
    var image = $(".carte__visuel img", carte);
    var src = carte.getAttribute("data-img-" + fin);
    if (!image || !src) return false;
    image.src = src;
    image.srcset = carte.getAttribute("data-srcset-" + fin);
    image.alt = "Plaque " + carte.getAttribute("data-nom") + ", finition " + ACCORD_FINITION[fin];
    $$(".pastille", carte).forEach(function (p) { if (!p.disabled) p.setAttribute("aria-pressed", p.getAttribute("data-fin") === fin ? "true" : "false"); });
    return true;
  }
  $$(".carte .pastille").forEach(function (p) {
    p.addEventListener("click", function () { montrerFinition(p.closest(".carte"), p.getAttribute("data-fin")); });
  });

  /* ---------- Mur d’exposition : simulation du rétroéclairage ---------- */
  var mur = $("[data-mur]");
  if (mur) {
    var inter = $(".interrupteur", mur);
    var couleurs = $(".led-couleurs", mur);
    var texteInter = $(".interrupteur__texte", mur);
    inter.addEventListener("click", function () {
      var allume = mur.classList.toggle("est-allume");
      inter.setAttribute("aria-pressed", allume ? "true" : "false");
      texteInter.textContent = allume ? "Éteindre" : "Allumer le rétroéclairage";
      couleurs.hidden = !allume;
    });
    $$("button", couleurs).forEach(function (b) {
      b.addEventListener("click", function () {
        mur.style.setProperty("--led", b.getAttribute("data-couleur"));
        $$("button", couleurs).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
  }

  /* ---------- Collection : filtres par thème et « Voir en » ---------- */
  var grille = $("[data-grille-collection]");
  if (grille) {
    var cartes = $$(".carte", grille);
    var compte = $("[data-compte]");
    var filtre = "tout";
    var appliquerFiltre = function () {
      var n = 0;
      cartes.forEach(function (c) {
        var ok = filtre === "tout" || c.getAttribute("data-collection") === filtre;
        c.parentElement.hidden = !ok;
        if (ok) n++;
      });
      if (compte) compte.textContent = n + (n > 1 ? " articles" : " article");
      $$("[data-filtre]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === filtre ? "true" : "false"); });
    };
    $$("[data-filtre]").forEach(function (b) {
      b.addEventListener("click", function () {
        filtre = b.getAttribute("data-filtre");
        appliquerFiltre();
        remplacerAdresse(filtre === "tout" ? "" : filtre);
      });
    });
    $$("[data-voir-en]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.getAttribute("data-voir-en");
        cartes.forEach(function (c) { montrerFinition(c, fin); });
        $$("[data-voir-en]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    var lireHash = function () {
      var depart = (location.hash || "").replace("#", "");
      filtre = depart && $("[data-filtre=\"" + depart + "\"]") ? depart : "tout";
      appliquerFiltre();
    };
    window.addEventListener("hashchange", lireHash);
    lireHash();
  }

  /* ---------- Fiche produit ---------- */
  var fiche = $("[data-fiche]");
  if (fiche) {
    var prixBase = +fiche.getAttribute("data-prix");
    var prixLed = +fiche.getAttribute("data-prix-led") || 0;
    var scene = $(".galerie__scene", fiche);
    var caseLed = $("#option-led");
    var blocPosition = $("[data-position-led]");
    var selectPosition = $("#position-cable");
    var qte = $("#quantite");
    var affichePrix = $$("[data-prix-affiche]");
    var sortieFinition = $("#finition-choisie");

    var finitionCourante = function () {
      var r = $("input[name=finition]:checked", fiche);
      return r ? r.value : null;
    };
    var montrerScene = function (cle) {
      $$("[data-scene]", scene).forEach(function (s) { s.hidden = s.getAttribute("data-scene") !== cle; });
      $$(".vignette", fiche).forEach(function (v) { v.setAttribute("aria-pressed", v.getAttribute("data-vue") === cle ? "true" : "false"); });
    };
    var majPrix = function () {
      var total = prixBase + (caseLed && caseLed.checked ? prixLed : 0);
      affichePrix.forEach(function (el) { el.textContent = euros(total); });
      return total;
    };
    $$("input[name=finition]", fiche).forEach(function (r) {
      r.addEventListener("change", function () {
        montrerScene(r.value);
        if (sortieFinition) sortieFinition.textContent = NOMS_FINITION[r.value];
      });
    });
    $$(".vignette", fiche).forEach(function (v) {
      v.addEventListener("click", function () {
        var vue = v.getAttribute("data-vue");
        montrerScene(vue);
        var radio = $("input[name=finition][value=\"" + vue + "\"]", fiche);
        if (radio) { radio.checked = true; if (sortieFinition) sortieFinition.textContent = NOMS_FINITION[radio.value]; }
      });
    });
    if (caseLed) caseLed.addEventListener("change", function () { blocPosition.hidden = !caseLed.checked; majPrix(); });
    $$("[data-qte]").forEach(function (b) {
      b.addEventListener("click", function () {
        qte.value = Math.max(1, Math.min(9, (+qte.value || 1) + (+b.getAttribute("data-qte"))));
      });
    });
    var ajouter = function () {
      var fin = finitionCourante();
      var details = [];
      var cle = fiche.getAttribute("data-slug");
      var image = fiche.getAttribute("data-image");
      if (fin) {
        details.push("Finition " + ACCORD_FINITION[fin]); cle += "-" + fin;
        image = fiche.getAttribute("data-img-" + fin) || fiche.getAttribute("data-img-noir") || fiche.getAttribute("data-img-gris");
        if (!fiche.getAttribute("data-img-" + fin)) details.push("Photo de cette finition à venir");
      }
      if (caseLed && caseLed.checked) {
        details.push("Kit LED collé au dos, sortie du câble : " + selectPosition.value.toLowerCase());
        cle += "-led-" + selectPosition.value;
      }
      ajouterAuPanier({
        cle: cle, nom: fiche.getAttribute("data-nom"), details: details, prix: majPrix(), qte: Math.max(1, Math.min(9, +qte.value || 1)),
        image: image, carre: fiche.getAttribute("data-carre") === "1"
      });
    };
    $$("[data-ajouter]").forEach(function (b) { b.addEventListener("click", ajouter); });
    majPrix();

    /* Barre d’achat collante (téléphone) : visible dès que le prix est passé, sauf quand le bouton principal
       ou le pied de page sont à l’écran (elle ne cache ni l’un ni les mentions légales). */
    var barre = $(".barre-achat-mobile");
    var blocPrix = $(".achat__prix", fiche);
    var boutonPrincipal = $(".quantite-achat .btn", fiche);
    var piedPage = $(".pied");
    if (barre && blocPrix && boutonPrincipal && "IntersectionObserver" in window) {
      var etatBarre = { prixPasse: false, boutonVisible: false, piedVisible: false };
      var observateur = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (en) {
          if (en.target === blocPrix) etatBarre.prixPasse = !en.isIntersecting && en.boundingClientRect.top < 0;
          else if (en.target === boutonPrincipal) etatBarre.boutonVisible = en.isIntersecting;
          else if (en.target === piedPage) etatBarre.piedVisible = en.isIntersecting;
        });
        barre.classList.toggle("visible", etatBarre.prixPasse && !etatBarre.boutonVisible && !etatBarre.piedVisible);
      });
      observateur.observe(blocPrix); observateur.observe(boutonPrincipal);
      if (piedPage) observateur.observe(piedPage);
    }
  }

  /* ---------- Carte des lieux ---------- */
  var atlas = $("[data-atlas]");
  var panneau = $("#fiche-lieu");
  if (atlas && panneau) {
    var reperes = $$("[data-repere]", atlas);
    var intro = $("[data-fiche-intro]", panneau);
    var fermerFiche = $("[data-fermer-fiche]", panneau);
    var courant = null;

    var visibleDansFenetre = function (el) {
      var r = el.getBoundingClientRect();
      return r.top >= 60 && r.top < (window.innerHeight - 140);
    };
    var ouvrir = function (cle, source) {
      var article = $("[data-fiche-lieu=\"" + cle + "\"]", panneau);
      if (!article) return false;
      courant = cle;
      $$("[data-fiche-lieu]", panneau).forEach(function (a) { a.hidden = a !== article; });
      if (intro) intro.hidden = true;
      if (fermerFiche) fermerFiche.hidden = false;
      reperes.forEach(function (r) { r.setAttribute("aria-pressed", r.getAttribute("data-repere") === cle ? "true" : "false"); });
      remplacerAdresse(cle);
      if (source !== "chargement" && !visibleDansFenetre(article)) {
        article.scrollIntoView({ block: "nearest", behavior: mouvementReduit ? "auto" : "smooth" });
      }
      return true;
    };
    var fermer = function () {
      if (!courant) return;
      var ancien = courant;
      courant = null;
      $$("[data-fiche-lieu]", panneau).forEach(function (a) { a.hidden = true; });
      if (intro) intro.hidden = false;
      if (fermerFiche) fermerFiche.hidden = true;
      reperes.forEach(function (r) { r.setAttribute("aria-pressed", "false"); });
      remplacerAdresse("");
      var rep = $("[data-repere=\"" + ancien + "\"]", atlas);
      if (rep && panneau.contains(document.activeElement)) rep.focus();
    };
    reperes.forEach(function (r) {
      r.addEventListener("click", function () {
        var cle = r.getAttribute("data-repere");
        if (courant === cle) { fermer(); r.focus(); } else { ouvrir(cle, "clic"); }
      });
    });
    if (fermerFiche) fermerFiche.addEventListener("click", fermer);
    $$("[data-situer]").forEach(function (b) {
      b.addEventListener("click", function () {
        var cle = b.getAttribute("data-situer");
        ouvrir(cle, "chargement");
        var rep = $("[data-repere=\"" + cle + "\"]", atlas);
        atlas.scrollIntoView({ block: "start", behavior: mouvementReduit ? "auto" : "smooth" });
        if (rep) rep.focus({ preventScroll: true });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !courant) return;
      if (tiroir && tiroir.classList.contains("ouvert")) return;
      fermer();
    });
    /* Arrivée par un lien (accueil, fiche, qr.html) : la fiche s’ouvre. Sur téléphone, elle est sous la carte :
       on la fait entrer à l’écran. Sur ordinateur, elle est déjà visible à côté de la carte. */
    var ouvrirDepuisAdresse = function () {
      var cle = decodeURIComponent((location.hash || "").replace("#", ""));
      if (!cle || cle === courant || !ouvrir(cle, "chargement")) return;
      if (!(window.matchMedia && window.matchMedia("(max-width: 900px)").matches)) return;
      var article = $("[data-fiche-lieu=\"" + cle + "\"]", panneau);
      requestAnimationFrame(function () {
        if (article && !visibleDansFenetre(article)) article.scrollIntoView({ block: "nearest" });
      });
    };
    ouvrirDepuisAdresse();
    window.addEventListener("hashchange", ouvrirDepuisAdresse);
  }

  /* Échap ferme le panier, puis le menu */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (tiroir && tiroir.classList.contains("ouvert")) { fermerPanier(); return; }
    if (entete && entete.classList.contains("menu-ouvert")) {
      entete.classList.remove("menu-ouvert");
      if (boutonMenu) { boutonMenu.setAttribute("aria-expanded", "false"); boutonMenu.focus(); }
    }
  });

  /* ---------- Formulaires de démonstration ---------- */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".message-demo", f);
      if (msg) { msg.hidden = false; msg.focus(); }
    });
  });

  /* Rétractation en deux étapes : déclaration, puis confirmation */
  $$("form[data-retract]").forEach(function (f) {
    var etape1 = $("[data-retract-etape=\"1\"]", f);
    var etape2 = $("[data-retract-etape=\"2\"]", f);
    var resume = $("[data-retract-resume]", f);
    var msg = $(".message-demo", f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var nom = (f.elements.nom.value || "").trim();
      var commande = (f.elements.commande.value || "").trim();
      var articles = (f.elements.articles.value || "").trim();
      resume.textContent = "2. Vérifiez puis confirmez : " + nom + " renonce à la commande " + commande +
        (articles ? " (articles : " + articles + ")." : " (toute la commande).");
      etape1.hidden = true; etape2.hidden = false; resume.focus();
    });
    $("[data-retract-retour]", f).addEventListener("click", function () {
      etape2.hidden = true; etape1.hidden = false; msg.hidden = true;
      var premier = $("input", etape1); if (premier) premier.focus();
    });
    $("[data-retract-confirmer]", f).addEventListener("click", function () {
      etape2.hidden = true; msg.hidden = false; msg.focus();
    });
  });

  /* ---------- Copie de l’adresse e-mail ---------- */
  $$("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cible = document.getElementById(b.getAttribute("data-copier"));
      var texte = cible.textContent.trim();
      var selection = function () {
        var r = document.createRange(); r.selectNodeContents(cible);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "Sélectionnée : Ctrl+C pour copier";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(function () { b.textContent = "Copiée"; }, selection);
      } else { selection(); }
    });
  });
})();
