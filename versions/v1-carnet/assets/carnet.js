/* Terre Gravée · maquette version 1 « Carnet de territoire »
   Script commun : thème, panier de démonstration, cartes produit, fiche, formulaires simulés,
   estimation de livraison et relief génératif (courbes de niveau dessinées une fois dans un canvas).
   Aucune requête réseau, aucun module : fonctionne en ouvrant les fichiers directement. */
(function () {
  "use strict";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function euros(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €"; }
  var ACCORD = { noir: "noire", gris: "grise", dore: "dorée" };
  var NOMS = { noir: "Noir", gris: "Gris", dore: "Doré" };

  function lire(cle) { try { return window.localStorage.getItem(cle); } catch (e) { return null; } }
  function ecrire(cle, val) { try { window.localStorage.setItem(cle, val); } catch (e) { /* stockage indisponible */ } }

  /* ---------- Thème clair / carte de nuit ---------- */
  var racine = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function themeActuel() {
    var t = racine.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return mq && mq.matches ? "dark" : "light";
  }
  function majBascule() {
    $$("[data-theme-bascule]").forEach(function (b) { b.setAttribute("aria-pressed", themeActuel() === "dark" ? "true" : "false"); });
  }
  $$("[data-theme-bascule]").forEach(function (b) {
    b.addEventListener("click", function () {
      var suivant = themeActuel() === "dark" ? "light" : "dark";
      racine.setAttribute("data-theme", suivant);
      ecrire("tg-v1-theme", suivant);
      majBascule();
      redessinerReliefs();
    });
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { majBascule(); redessinerReliefs(); });
  majBascule();

  /* ---------- Menu mobile ---------- */
  var entete = $(".entete");
  var boutonMenu = $("[data-menu]");
  var texteMenu = $("[data-menu-texte]");
  function etatMenu(ouvert) {
    entete.classList.toggle("menu-ouvert", ouvert);
    boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    if (texteMenu) texteMenu.textContent = ouvert ? "Fermer le menu" : "Ouvrir le menu";
  }
  if (entete && boutonMenu) {
    boutonMenu.addEventListener("click", function () { etatMenu(!entete.classList.contains("menu-ouvert")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && entete.classList.contains("menu-ouvert")) { etatMenu(false); boutonMenu.focus(); }
    });
  }

  /* ---------- Panier de démonstration ---------- */
  var CLE = "tg-v1-carnet-commande";
  var memoire = [];
  function lirePanier() {
    var brut = lire(CLE);
    if (brut === null) return memoire;
    try { var l = JSON.parse(brut); return Array.isArray(l) ? l : []; } catch (e) { return memoire; }
  }
  function ecrirePanier(lignes) {
    memoire = lignes;
    ecrire(CLE, JSON.stringify(lignes));
    afficherPanier();
  }
  function ajouter(article) {
    var lignes = lirePanier();
    var meme = lignes.filter(function (l) { return l.cle === article.cle; })[0];
    if (meme) { meme.qte = Math.min(9, meme.qte + article.qte); } else { lignes.push(article); }
    ecrirePanier(lignes);
    toast(article.nom + (article.court ? " (" + article.court + ")" : "") + " ajouté à la commande");
  }
  var dialog = $("#commande");
  function ouvrirCommande() {
    if (!dialog) return;
    masquerToast();
    if (typeof dialog.showModal === "function") { if (!dialog.open) dialog.showModal(); }
    else { dialog.setAttribute("open", ""); }
    var f = $("[data-fermer-commande]", dialog); if (f) f.focus();
  }
  function fermerCommande() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }
  $$("[data-ouvrir-commande]").forEach(function (b) { b.addEventListener("click", ouvrirCommande); });
  $$("[data-fermer-commande]").forEach(function (b) { b.addEventListener("click", fermerCommande); });
  if (dialog) dialog.addEventListener("click", function (e) { if (e.target === dialog) fermerCommande(); });

  function afficherPanier() {
    var lignes = lirePanier();
    var total = 0, nb = 0;
    lignes.forEach(function (l) { total += l.prix * l.qte; nb += l.qte; });
    $$("[data-compteur]").forEach(function (c) { c.textContent = nb; });
    var liste = $("[data-liste-commande]");
    if (!liste) return;
    liste.innerHTML = "";
    if (!lignes.length) {
      var vide = document.createElement("li");
      vide.className = "commande__vide";
      vide.innerHTML = "<p>Votre commande est vide.</p><p><a class=\"lien-fleche\" href=\"carte.html\">Choisir un lieu sur la carte</a></p>";
      liste.appendChild(vide);
    }
    lignes.forEach(function (l, i) {
      var li = document.createElement("li");
      li.className = "ligne-commande";
      var visuel;
      if (l.image) { visuel = document.createElement("img"); visuel.src = l.image; visuel.alt = ""; visuel.width = 52; visuel.height = 104; }
      else { visuel = document.createElement("span"); visuel.className = "ligne-commande__vide"; }
      var milieu = document.createElement("div");
      var nom = document.createElement("strong"); nom.textContent = l.nom; milieu.appendChild(nom);
      (l.details || []).forEach(function (d) { var s = document.createElement("span"); s.textContent = d; milieu.appendChild(s); });
      var pu = document.createElement("span"); pu.textContent = euros(l.prix) + " l’unité"; milieu.appendChild(pu);
      // Quantité modifiable dans le tiroir : − et +, total annoncé
      var qte = document.createElement("span"); qte.className = "ligne-commande__qte";
      var moins = document.createElement("button"); moins.type = "button"; moins.textContent = "−";
      moins.setAttribute("aria-label", "Retirer un exemplaire : " + l.nom);
      var sortie = document.createElement("output"); sortie.textContent = l.qte;
      var plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+";
      plus.setAttribute("aria-label", "Ajouter un exemplaire : " + l.nom);
      var changer = function (delta, bouton) {
        var ls = lirePanier(); if (!ls[i]) return;
        ls[i].qte = Math.max(1, Math.min(9, ls[i].qte + delta));
        ecrirePanier(ls); annoncer(ls[i].nom + " : quantité " + ls[i].qte + ".");
        var memeBouton = $$(".ligne-commande")[i]; if (memeBouton) { var b = memeBouton.querySelectorAll(".ligne-commande__qte button")[bouton]; if (b) b.focus(); }
      };
      moins.addEventListener("click", function () { changer(-1, 0); });
      plus.addEventListener("click", function () { changer(1, 1); });
      qte.appendChild(moins); qte.appendChild(sortie); qte.appendChild(plus);
      milieu.appendChild(qte);
      var retirer = document.createElement("button"); retirer.type = "button"; retirer.textContent = "Retirer"; retirer.className = "ligne-commande__retirer";
      retirer.setAttribute("aria-label", "Retirer " + l.nom + " de la commande");
      retirer.addEventListener("click", function () { var ls = lirePanier(); var n = ls[i] ? ls[i].nom : ""; ls.splice(i, 1); ecrirePanier(ls); annoncer(n + " retiré de la commande."); var f = $("[data-fermer-commande]"); if (f) f.focus(); });
      milieu.appendChild(retirer);
      var prix = document.createElement("span"); prix.className = "ligne-commande__prix"; prix.textContent = euros(l.prix * l.qte);
      li.appendChild(visuel); li.appendChild(milieu); li.appendChild(prix);
      liste.appendChild(li);
    });
    var t = $("[data-total-commande]"); if (t) t.textContent = euros(total);
  }
  function annoncer(texte) {
    var a = $("[data-annonce-commande]"); if (!a) return;
    var total = 0; lirePanier().forEach(function (l) { total += l.prix * l.qte; });
    a.textContent = texte + " Sous-total : " + euros(total) + ".";
  }
  afficherPanier();

  var toastEl = $(".toast"), minuteur = null;
  function toast(texte) {
    if (!toastEl) return;
    $("[data-toast-texte]", toastEl).textContent = texte;
    toastEl.classList.add("visible");
    clearTimeout(minuteur);
    minuteur = setTimeout(masquerToast, 4500);
  }
  function masquerToast() { if (toastEl) toastEl.classList.remove("visible"); }

  /* ---------- Cartes produit : finitions et photos manquantes ---------- */
  function montrerFinition(carte, fin) {
    var img = $(".carte__visuel img", carte);
    if (!img) return;
    var src = carte.getAttribute("data-src-" + fin);
    $$(".carte__vide", carte).forEach(function (v) { v.classList.toggle("visible", !src && v.getAttribute("data-vide") === fin); });
    if (src) {
      img.hidden = false;
      img.src = src;
      img.srcset = carte.getAttribute("data-srcset-" + fin);
      img.alt = "Plaque " + carte.getAttribute("data-nom") + ", finition " + ACCORD[fin];
    } else {
      img.hidden = true;
    }
    $$(".pastille[data-fin]", carte).forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-fin") === fin ? "true" : "false"); });
  }
  $$(".carte .pastille[data-fin]").forEach(function (p) {
    p.addEventListener("click", function () { montrerFinition(p.closest(".carte"), p.getAttribute("data-fin")); });
  });

  /* ---------- Collection : filtres, finition, classement ---------- */
  var grille = $("[data-grille]");
  if (grille) {
    var cartes = $$(".carte", grille);
    var ordre0 = cartes.slice();
    var compte = $("[data-compte]");
    var filtre = "tout";
    var appliquer = function () {
      var n = 0;
      cartes.forEach(function (c) {
        var ok = filtre === "tout" || c.getAttribute("data-collection") === filtre;
        c.hidden = !ok; if (ok) n++;
      });
      compte.textContent = n + (n > 1 ? " plaques" : " plaque");
      $$("[data-filtre]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === filtre ? "true" : "false"); });
    };
    $$("[data-filtre]").forEach(function (b) {
      b.addEventListener("click", function () {
        filtre = b.getAttribute("data-filtre");
        appliquer();
        try { history.replaceState(null, "", filtre === "tout" ? location.pathname : "#" + filtre); } catch (e) { /* fichier local */ }
      });
    });
    $$("[data-voir-en]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.getAttribute("data-voir-en");
        cartes.forEach(function (c) { if (c.querySelector(".pastille[data-fin]")) montrerFinition(c, fin); });
        $$("[data-voir-en]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    var tri = $("[data-tri]");
    if (tri) tri.addEventListener("change", function () {
      var l = ordre0.slice();
      if (tri.value === "nom") l.sort(function (a, b) { return a.getAttribute("data-tri").localeCompare(b.getAttribute("data-tri"), "fr"); });
      if (tri.value === "nord-sud") l.sort(function (a, b) { return (+b.getAttribute("data-lat")) - (+a.getAttribute("data-lat")); });
      l.forEach(function (c) { grille.appendChild(c); });
    });
    var depart = (location.hash || "").replace("#", "");
    if (depart && $("[data-filtre=\"" + depart + "\"]")) filtre = depart;
    appliquer();
  }

  /* ---------- Fiche produit ---------- */
  var fiche = $("[data-fiche]");
  if (fiche) {
    var type = fiche.getAttribute("data-type");
    var base = +fiche.getAttribute("data-prix");
    var prixLed = +fiche.getAttribute("data-prix-led") || 0;
    var caseLed = $("[data-option-led]");
    var suiteLed = $("[data-suite-led]");
    var caseCadeau = $("[data-option-cadeau]");
    var suiteCadeau = $("[data-suite-cadeau]");
    var champQte = $("[data-quantite]");
    var sortieFin = $("[data-finition-choisie]");

    var finCourante = function () { var r = $("input[name=finition]:checked", fiche); return r ? r.value : null; };
    var montrerScene = function (cle) {
      $$("[data-scene]", fiche).forEach(function (s) { s.hidden = s.getAttribute("data-scene") !== cle; });
      $$(".vignette", fiche).forEach(function (v) { v.setAttribute("aria-pressed", v.getAttribute("data-vue") === cle ? "true" : "false"); });
    };
    var qte = function () { return Math.max(1, Math.min(9, parseInt(champQte && champQte.value, 10) || 1)); };
    var unitaire = function () { return base + (caseLed && caseLed.checked ? prixLed : 0); };
    var majPrix = function () {
      $$("[data-prix-affiche]").forEach(function (el) { el.textContent = euros(unitaire()); });
      $$("[data-total-affiche]").forEach(function (el) { el.textContent = euros(unitaire() * qte()); });
    };
    $$("input[name=finition]", fiche).forEach(function (r) {
      r.addEventListener("change", function () { montrerScene(r.value); if (sortieFin) sortieFin.textContent = NOMS[r.value]; });
    });
    $$(".vignette", fiche).forEach(function (v) {
      v.addEventListener("click", function () {
        var vue = v.getAttribute("data-vue");
        montrerScene(vue);
        var radio = $("input[name=finition][value=\"" + vue + "\"]", fiche);
        if (radio) { radio.checked = true; if (sortieFin) sortieFin.textContent = NOMS[vue]; }
      });
    });
    if (caseLed) caseLed.addEventListener("change", function () { suiteLed.hidden = !caseLed.checked; majPrix(); });
    if (caseCadeau) caseCadeau.addEventListener("change", function () { suiteCadeau.hidden = !caseCadeau.checked; });
    $$("[data-qte]").forEach(function (b) {
      b.addEventListener("click", function () { champQte.value = Math.max(1, Math.min(9, qte() + (+b.getAttribute("data-qte")))); majPrix(); });
    });
    if (champQte) champQte.addEventListener("input", majPrix);

    $$("[data-ajouter]").forEach(function (b) {
      b.addEventListener("click", function () {
        var details = [], cle = fiche.getAttribute("data-slug"), court = "", image = fiche.getAttribute("data-image") || "";
        var fin = finCourante();
        if (type === "plaque" && fin) {
          details.push("Finition " + ACCORD[fin]); court = "finition " + ACCORD[fin]; cle += "-" + fin;
          image = fiche.getAttribute("data-img-" + fin) || "";
        }
        var sortie = $("input[name=sortie]:checked", fiche);
        if (type === "plaque" && caseLed && caseLed.checked && sortie) { details.push("Kit LED monté, câble " + sortie.value.toLowerCase()); cle += "-led-" + sortie.value; }
        if (type === "led" && sortie) { details.push("Sortie du câble : " + sortie.value.toLowerCase()); cle += "-" + sortie.value; }
        var envoi = $("input[name=envoi]:checked", fiche);
        if (envoi) { details.push("Envoi : " + envoi.value.toLowerCase()); cle += "-" + envoi.value; }
        var msg = $("[data-message-cadeau]", fiche);
        var estCadeau = (caseCadeau && caseCadeau.checked) || type === "carte";
        if (caseCadeau && caseCadeau.checked) details.push("Cadeau : prix masqués");
        if (estCadeau && msg && msg.value.trim()) { details.push("Message : « " + msg.value.trim().slice(0, 60) + (msg.value.trim().length > 60 ? "…" : "") + " »"); cle += "-msg" + msg.value.trim().length; }
        ajouter({ cle: cle, nom: fiche.getAttribute("data-nom"), details: details, prix: unitaire(), qte: qte(), image: image, court: court });
      });
    });
    majPrix();
  }

  /* ---------- Estimation des dates de livraison (2 à 4 jours ouvrés) ---------- */
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var FERIES = ["1-1", "5-1", "5-8", "7-14", "8-15", "11-1", "11-11", "12-25"];
  // Fériés mobiles : lundi de Pâques, Ascension, lundi de Pentecôte (calcul de Pâques, algorithme de Meeus)
  function paques(a) {
    var b = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), f = c % 4, g = Math.floor((c + 8) / 25);
    var h = Math.floor((c - g + 1) / 3), i = (19 * b + c - e - h + 15) % 30, k = Math.floor(d / 4), l = d % 4;
    var m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((b + 11 * i + 22 * m) / 451);
    var mois = Math.floor((i + m - 7 * n + 114) / 31), jour = ((i + m - 7 * n + 114) % 31) + 1;
    return new Date(a, mois - 1, jour);
  }
  var mobiles = {};
  function feriesMobiles(a) {
    if (!mobiles[a]) {
      var p = paques(a);
      mobiles[a] = [1, 39, 50].map(function (n) { var d = new Date(p.getTime()); d.setDate(d.getDate() + n); return (d.getMonth() + 1) + "-" + d.getDate(); });
    }
    return mobiles[a];
  }
  function ouvre(d) {
    var j = d.getDay(), cle = (d.getMonth() + 1) + "-" + d.getDate();
    return j !== 0 && j !== 6 && FERIES.indexOf(cle) < 0 && feriesMobiles(d.getFullYear()).indexOf(cle) < 0;
  }
  function plusOuvres(d, n) { var r = new Date(d.getTime()); while (n > 0) { r.setDate(r.getDate() + 1); if (ouvre(r)) n--; } return r; }
  function dateCourte(d) { return JOURS[d.getDay()] + " " + (d.getDate() === 1 ? "1er" : d.getDate()) + " " + MOIS[d.getMonth()]; }
  var auj = new Date();
  var d1 = plusOuvres(auj, 2), d2 = plusOuvres(auj, 4);
  var fourchette = "entre le " + dateCourte(d1) + " et le " + dateCourte(d2);
  $$("[data-estimation]").forEach(function (el) { el.textContent = "Estimation indicative pour une commande passée aujourd’hui\u00a0: livraison " + fourchette + "."; });
  $$("[data-estimation-texte]").forEach(function (el) { el.textContent = "Estimation indicative pour une commande passée aujourd’hui\u00a0: " + fourchette + "."; });

  /* ---------- Formulaires et boutons simulés ---------- */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof f.checkValidity === "function" && !f.checkValidity()) { if (f.reportValidity) f.reportValidity(); return; }
      var msg = $(".message-demo", f);
      if (msg) { msg.hidden = false; msg.focus(); }
    });
  });
  $$("[data-demo-bouton]").forEach(function (b) {
    b.addEventListener("click", function () { var m = b.parentElement.querySelector(".message-demo"); if (m) m.hidden = false; });
  });

  /* ---------- Rétractation : déclaration, puis confirmation (simulées) ---------- */
  $$("form[data-retract]").forEach(function (f) {
    var e1 = $("[data-retract-etape=\"1\"]", f), e2 = $("[data-retract-etape=\"2\"]", f);
    var resume = $("[data-retract-resume]", f), msg = $(".message-demo", f);
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!f.checkValidity()) { if (f.reportValidity) f.reportValidity(); return; }
      var v = function (n) { return (f.elements[n] && f.elements[n].value.trim()) || ""; };
      resume.textContent = "2. Vérifiez puis confirmez : rétractation de la commande " + v("commande") + " au nom de " + v("nom") +
        (v("articles") ? " (" + v("articles") + ")" : " (toute la commande)") + ". L’accusé de réception partira à " + v("email") + ".";
      e1.hidden = true; e2.hidden = false; msg.hidden = true; resume.focus();
    });
    $("[data-retract-retour]", f).addEventListener("click", function () { e2.hidden = true; e1.hidden = false; var c = $("input", e1); if (c) c.focus(); });
    $("[data-retract-confirmer]", f).addEventListener("click", function () { e2.hidden = true; msg.hidden = false; msg.focus(); });
  });

  /* ---------- Registre des avis : replié à trois sur mobile, avec un bouton pour tout afficher ---------- */
  var registre = $(".registre");
  var voirAvis = $("[data-registre-voir]");
  if (registre && voirAvis && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
    registre.classList.add("registre--replie");
    voirAvis.hidden = false;
    voirAvis.setAttribute("aria-expanded", "false");
    voirAvis.addEventListener("click", function () {
      var replie = registre.classList.toggle("registre--replie");
      voirAvis.setAttribute("aria-expanded", replie ? "false" : "true");
      voirAvis.textContent = replie ? voirAvis.getAttribute("data-texte") : "Afficher les trois plus récents";
    });
    voirAvis.setAttribute("data-texte", voirAvis.textContent);
  }

  /* ---------- Copier l’adresse e-mail ---------- */
  $$("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cible = document.getElementById(b.getAttribute("data-copier"));
      var texte = cible.textContent.trim();
      var selection = function () {
        var r = document.createRange(); r.selectNodeContents(cible);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "Adresse sélectionnée : Ctrl+C pour copier";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(function () { b.textContent = "Adresse copiée"; }, selection);
      } else { selection(); }
    });
  });

  /* ---------- Accueil : la table des lieux allume les repères de la mini-carte ---------- */
  $$(".index__ligne[data-lieu]").forEach(function (l) {
    var id = l.getAttribute("data-lieu");
    var rep = $(".atlas--mini .repere[data-lieu=\"" + id + "\"]");
    if (!rep) return;
    var on = function () { rep.classList.add("survol"); };
    var off = function () { rep.classList.remove("survol"); };
    l.addEventListener("mouseenter", on); l.addEventListener("mouseleave", off);
    l.addEventListener("focus", on); l.addEventListener("blur", off);
  });

  /* ---------- Relief génératif : courbes de niveau (marching squares) ---------- */
  var D = window.TG_CARTE;
  var reliefs = $$("canvas[data-relief]");
  var KX = 111.32 * Math.cos(43 * Math.PI / 180), KY = 111.2;

  function lisse(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function hash(i, j) { var h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return h - Math.floor(h); }
  function bruit(x, y) {
    var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    var a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }
  function fbm(x, y) { return 0.55 * bruit(x, y) + 0.3 * bruit(x * 2.1 + 5.2, y * 2.1 + 1.3) + 0.15 * bruit(x * 4.3 + 9.1, y * 4.3 + 3.7); }
  function distSeg(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    var t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
    var qx = ax + t * dx - px, qy = ay + t * dy - py;
    return Math.sqrt(qx * qx + qy * qy);
  }
  var rivKm = null;
  function altitude(lat, lon) {
    var x = lon * KX, y = lat * KY;
    var massif = lisse(43.09, 42.86, lat);
    var e = 230 + 260 * lisse(43.42, 43.12, lat) + 780 * massif;
    var dx = (lon - 0.38) * KX, dy = (lat - 43.12) * KY;
    e += 240 * Math.exp(-(dx * dx + dy * dy) / (2 * 15 * 15));
    for (var i = 0; i < D.pics.length; i++) {
      var p = D.pics[i];
      var px = (lon - p[1]) * KX, py = (lat - p[0]) * KY;
      var g = Math.exp(-(px * px + py * py) / (2 * p[3] * p[3]));
      if (g > 0.002) e += (p[2] - 900) * 0.8 * g;
    }
    if (!rivKm) rivKm = D.rivieres.map(function (r) { return r.map(function (pt) { return [pt[1] * KX, pt[0] * KY]; }); });
    var dmin = 99;
    for (var r = 0; r < rivKm.length; r++) {
      var pts = rivKm[r];
      for (var k = 0; k < pts.length - 1; k++) {
        var dd = distSeg(x, y, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]);
        if (dd < dmin) dmin = dd;
      }
    }
    e -= (180 + 620 * massif) * Math.exp(-(dmin * dmin) / (2 * 1.9 * 1.9));
    e += (70 + 300 * massif) * (fbm(x / 7.5, y / 7.5) - 0.5) * 2;
    return e;
  }

  function lignes(cadre, vb, nx, ny) {
    var x0 = vb[0], y0 = vb[1], sx = vb[2] / (nx - 1), sy = vb[3] / (ny - 1);
    var v = new Float32Array(nx * ny);
    for (var j = 0; j < ny; j++) {
      var lat = cadre.latMax - (y0 + j * sy) / cadre.s;
      for (var i = 0; i < nx; i++) {
        var lon = cadre.lonMin + (x0 + i * sx) / (cadre.k * cadre.s);
        v[j * nx + i] = altitude(lat, lon);
      }
    }
    var fines = [], fortes = [];
    for (var niv = 300; niv <= 3300; niv += 150) {
      var cible = (niv % 750 === 0) ? fortes : fines;
      for (var jj = 0; jj < ny - 1; jj++) {
        for (var ii = 0; ii < nx - 1; ii++) {
          var a = v[jj * nx + ii], b = v[jj * nx + ii + 1], c = v[(jj + 1) * nx + ii + 1], d = v[(jj + 1) * nx + ii];
          var cas = (a >= niv ? 8 : 0) | (b >= niv ? 4 : 0) | (c >= niv ? 2 : 0) | (d >= niv ? 1 : 0);
          if (cas === 0 || cas === 15) continue;
          var X = x0 + ii * sx, Y = y0 + jj * sy;
          var h = [X + sx * (niv - a) / (b - a), Y];
          var dr = [X + sx, Y + sy * (niv - b) / (c - b)];
          var bs = [X + sx * (niv - d) / (c - d), Y + sy];
          var g = [X, Y + sy * (niv - a) / (d - a)];
          switch (cas) {
            case 1: case 14: cible.push(g, bs); break;
            case 2: case 13: cible.push(bs, dr); break;
            case 3: case 12: cible.push(g, dr); break;
            case 4: case 11: cible.push(h, dr); break;
            case 5: cible.push(g, h, bs, dr); break;
            case 6: case 9: cible.push(h, bs); break;
            case 7: case 8: cible.push(g, h); break;
            case 10: cible.push(g, bs, h, dr); break;
          }
        }
      }
    }
    return { fines: fines, fortes: fortes };
  }

  function chemin(segs) {
    var p = new Path2D();
    for (var i = 0; i < segs.length; i += 2) { p.moveTo(segs[i][0], segs[i][1]); p.lineTo(segs[i + 1][0], segs[i + 1][1]); }
    return p;
  }

  var cache = {};
  function dessinerRelief(canvas) {
    if (!D || !canvas.getContext || typeof Path2D === "undefined") return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    var vb = canvas.getAttribute("data-vb").split(" ").map(Number);
    var cle = vb.join(",");
    if (!cache[cle]) {
      var nx = canvas.getAttribute("data-relief") === "heros" ? 190 : 230;
      var ny = Math.round(nx * vb[3] / vb[2]);
      var l = lignes(D.cadre, vb, nx, ny);
      cache[cle] = { fines: chemin(l.fines), fortes: chemin(l.fortes) };
    }
    var ch = cache[cle];
    var ctx = canvas.getContext("2d");
    // Même cadrage que les SVG : « slice » (couvre la boîte, centré) ou boîte aux proportions du viewBox
    var echelle = canvas.hasAttribute("data-slice") ? Math.max(canvas.width / vb[2], canvas.height / vb[3]) : canvas.width / vb[2];
    var ox = (canvas.width - vb[2] * echelle) / 2, oy = (canvas.height - vb[3] * echelle) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(echelle, 0, 0, echelle, ox - vb[0] * echelle, oy - vb[1] * echelle);
    var couleur = getComputedStyle(racine).getPropertyValue("--courbe").trim() || "#9C6B3A";
    var nuit = themeActuel() === "dark";
    ctx.strokeStyle = couleur;
    ctx.lineJoin = "round";
    var epais = canvas.getAttribute("data-relief") === "heros" ? 1.4 : 1;
    var trace = function (alphaFin, alphaFort) {
      ctx.globalAlpha = alphaFin; ctx.lineWidth = 0.6 * epais * dpr / echelle; ctx.stroke(ch.fines);
      ctx.globalAlpha = alphaFort; ctx.lineWidth = 1.15 * epais * dpr / echelle; ctx.stroke(ch.fortes);
    };
    if (canvas.getAttribute("data-relief") === "carte") {
      trace(nuit ? 0.22 : 0.2, nuit ? 0.3 : 0.28);
      ctx.save();
      ctx.clip(new Path2D(D.contour));
      trace(nuit ? 0.55 : 0.5, nuit ? 0.75 : 0.72);
      ctx.restore();
    } else {
      trace(nuit ? 0.5 : 0.5, nuit ? 0.72 : 0.72);
    }
    ctx.globalAlpha = 1;
  }
  function redessinerReliefs() { reliefs.forEach(dessinerRelief); }
  if (reliefs.length) {
    redessinerReliefs();
    var largeurs = reliefs.map(function (c) { return c.clientWidth + "x" + c.clientHeight; });
    var attente = null;
    window.addEventListener("resize", function () {
      clearTimeout(attente);
      attente = setTimeout(function () {
        reliefs.forEach(function (c, i) { var t = c.clientWidth + "x" + c.clientHeight; if (t !== largeurs[i]) { largeurs[i] = t; dessinerRelief(c); } });
      }, 150);
    });
  }
  window.TG_redessinerReliefs = redessinerReliefs;
})();
