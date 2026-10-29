/* Terre Gravée · maquette version 1 · page « La carte des plaques »
   Repères en vrais boutons, panneau latéral (feuille du bas sur mobile), liste des lieux,
   filtres, calques et adresse par lieu (carte.html#slug). Script classique, sans dépendance. */
(function () {
  "use strict";
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var atlas = $("[data-carte]");
  var panneau = $("[data-panneau]");
  if (!atlas || !panneau) return;

  var accueil = $("[data-panneau-accueil]", panneau);
  var fiches = $$("[data-fiche-lieu]", panneau);
  var navVoisins = $("[data-panneau-nav]", panneau);
  var reperes = $$(".repere[data-lieu]", atlas);
  var boutonsListe = $$(".lieu[data-lieu]");
  var ordre = reperes.map(function (r) { return r.getAttribute("data-lieu"); });
  var mobile = window.matchMedia ? window.matchMedia("(max-width: 960px)") : { matches: false };
  var courant = null;
  var declencheur = null;

  function existe(id) { return ordre.indexOf(id) >= 0; }

  function ouvrir(id, source, focaliser) {
    if (!existe(id)) return;
    courant = id;
    if (source) declencheur = source;
    accueil.hidden = true;
    fiches.forEach(function (f) {
      var actif = f.getAttribute("data-fiche-lieu") === id;
      f.hidden = !actif;
      var img = $("img[data-vt]", f);
      if (img) img.style.viewTransitionName = actif ? img.getAttribute("data-vt") : "";
    });
    reperes.forEach(function (r) { r.setAttribute("aria-expanded", r.getAttribute("data-lieu") === id ? "true" : "false"); });
    boutonsListe.forEach(function (b) {
      if (b.getAttribute("data-lieu") === id) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    panneau.classList.add("ouvert");
    navVoisins.hidden = false;
    panneau.scrollTop = 0;
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* fichier local */ }
    if (focaliser) {
      var titre = $("[data-fiche-lieu=\"" + id + "\"] h2", panneau);
      if (titre) titre.focus({ preventScroll: !mobile.matches });
      if (!mobile.matches) {
        var haut = panneau.getBoundingClientRect().top;
        if (haut < 0 || haut > window.innerHeight * 0.6) panneau.scrollIntoView({ block: "start" });
      }
    }
  }

  function fermer() {
    if (!courant) return;
    courant = null;
    fiches.forEach(function (f) { f.hidden = true; });
    accueil.hidden = false;
    navVoisins.hidden = true;
    panneau.classList.remove("ouvert");
    reperes.forEach(function (r) { r.setAttribute("aria-expanded", "false"); });
    boutonsListe.forEach(function (b) { b.removeAttribute("aria-current"); });
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* fichier local */ }
    if (declencheur && document.body.contains(declencheur)) declencheur.focus();
  }

  reperes.forEach(function (r) {
    r.addEventListener("click", function () {
      var id = r.getAttribute("data-lieu");
      if (courant === id && !mobile.matches) { fermer(); return; }
      ouvrir(id, r, true);
    });
  });
  boutonsListe.forEach(function (b) {
    b.addEventListener("click", function () { ouvrir(b.getAttribute("data-lieu"), b, true); });
  });
  $$("[data-fermer-panneau]", panneau).forEach(function (b) { b.addEventListener("click", fermer); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && courant) {
      var d = document.getElementById("commande");
      if (d && d.open) return;
      fermer();
    }
  });
  $$("[data-lieu-voisin]", panneau).forEach(function (b) {
    b.addEventListener("click", function () {
      var visibles = ordre.filter(function (id) {
        var r = $(".repere[data-lieu=\"" + id + "\"]", atlas);
        return r && !r.classList.contains("estompe");
      });
      if (!visibles.length) return;
      var i = visibles.indexOf(courant);
      var n = visibles[(i + (+b.getAttribute("data-lieu-voisin")) + visibles.length) % visibles.length];
      ouvrir(n, $(".repere[data-lieu=\"" + n + "\"]", atlas), true);
    });
  });

  /* Filtres par catégorie : estompe les repères et masque les lignes de la liste */
  $$("[data-filtre-carte]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cat = b.getAttribute("data-filtre-carte");
      $$("[data-filtre-carte]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      reperes.forEach(function (r) {
        var ok = cat === "tout" || r.getAttribute("data-cat") === cat;
        r.classList.toggle("estompe", !ok);
      });
      $$("[data-liste-lieux] li").forEach(function (li) { li.hidden = !(cat === "tout" || li.getAttribute("data-cat") === cat); });
    });
  });

  /* Calques */
  $$("[data-calque]").forEach(function (c) {
    c.addEventListener("change", function () {
      atlas.classList.toggle("sans-" + c.getAttribute("data-calque"), !c.checked);
      if (c.getAttribute("data-calque") === "relief" && c.checked && window.TG_redessinerReliefs) window.TG_redessinerReliefs();
    });
  });

  /* Partager un lieu : copie l’adresse avec l’ancre */
  $$("[data-partager]", panneau).forEach(function (b) {
    var libelle = b.textContent;
    b.addEventListener("click", function () {
      var url = location.href.split("#")[0] + "#" + b.getAttribute("data-partager");
      var fini = function (t) { b.textContent = t; setTimeout(function () { b.textContent = libelle; }, 2600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { fini("Lien copié"); }, function () { fini("Copie impossible : " + url); });
      } else { fini("Lien : " + url); }
    });
  });

  /* Ouverture depuis l’adresse (carte.html#le-tourmalet) */
  function depuisAdresse(focaliser) {
    var id = decodeURIComponent((location.hash || "").replace("#", ""));
    if (existe(id)) ouvrir(id, $(".repere[data-lieu=\"" + id + "\"]", atlas), focaliser);
  }
  window.addEventListener("hashchange", function () { depuisAdresse(true); });
  depuisAdresse(false);
})();
