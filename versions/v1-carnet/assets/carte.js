/* Terre Gravée · maquette version 1 · page « La carte des plaques »
   Repères en vrais boutons, grappes sur petit écran, panneau latéral (feuille du bas modale sur mobile),
   liste des lieux, filtres, calques et adresse par lieu (carte.html#slug). Script classique, sans dépendance. */
(function () {
  "use strict";
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var atlas = $("[data-carte]");
  var panneau = $("[data-panneau]");
  if (!atlas || !panneau) return;

  var accueil = $("[data-panneau-accueil]", panneau);
  var fiches = $$("[data-fiche-lieu]", panneau);
  var fichesGrappe = $$("[data-fiche-grappe]", panneau);
  var navVoisins = $("[data-panneau-nav]", panneau);
  var reperes = $$(".repere[data-lieu]", atlas);
  var grappes = $$(".grappe[data-grappe]", atlas);
  var boutonsListe = $$(".lieu[data-lieu]");
  var ordre = reperes.map(function (r) { return r.getAttribute("data-lieu"); });
  var mobile = window.matchMedia ? window.matchMedia("(max-width: 960px)") : { matches: false };
  var courant = null;      // lieu ouvert (slug ou « faune »)
  var grappeOuverte = null;
  var declencheur = null;

  function existe(id) { return ordre.indexOf(id) >= 0; }

  /* ---------- Feuille du bas modale (≤ 960 px) : focus gardé dans la feuille, reste de la page inerte ---------- */
  var inertes = [];
  function rendreModal(actif) {
    inertes.forEach(function (el) { el.inert = false; el.removeAttribute("inert"); });
    inertes = [];
    if (actif && mobile.matches) {
      var garder = function (el) { return el === panneau || el.contains(panneau); };
      var marquer = function (parent) {
        Array.prototype.forEach.call(parent.children, function (el) {
          if (el === panneau || el.tagName === "SCRIPT" || el.tagName === "DIALOG") return;
          if (garder(el)) { marquer(el); return; }
          el.inert = true; el.setAttribute("inert", ""); inertes.push(el);
        });
      };
      marquer(document.body);
      panneau.setAttribute("role", "dialog");
      panneau.setAttribute("aria-modal", "true");
      document.documentElement.classList.add("feuille-ouverte");
    } else {
      panneau.removeAttribute("role");
      panneau.removeAttribute("aria-modal");
      document.documentElement.classList.remove("feuille-ouverte");
    }
  }

  /* ---------- Panneau desktop : hauteur limitée à l’espace visible pour garder le pied (prix, boutons) à l’écran ---------- */
  var enteteH = function () { var e = $(".entete"); return e ? e.getBoundingClientRect().height : 72; };
  function ajusterPanneau() {
    if (mobile.matches) { panneau.style.maxHeight = ""; return; }
    var haut = Math.max(panneau.getBoundingClientRect().top, enteteH() + 16);
    panneau.style.maxHeight = Math.max(420, window.innerHeight - haut - 12) + "px";
  }
  var attente = false;
  window.addEventListener("scroll", function () {
    if (attente) return;
    attente = true;
    window.requestAnimationFrame(function () { attente = false; ajusterPanneau(); });
  }, { passive: true });
  window.addEventListener("resize", ajusterPanneau);
  ajusterPanneau();

  function majEtats(id, grappe) {
    reperes.forEach(function (r) { r.setAttribute("aria-expanded", r.getAttribute("data-lieu") === id ? "true" : "false"); });
    grappes.forEach(function (g) { g.setAttribute("aria-expanded", g.getAttribute("data-grappe") === grappe ? "true" : "false"); });
    boutonsListe.forEach(function (b) {
      if (id && b.getAttribute("data-lieu") === id) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }

  function afficher(fiche) {
    accueil.hidden = true;
    fiches.concat(fichesGrappe).forEach(function (f) {
      var actif = f === fiche;
      f.hidden = !actif;
      var img = $("img[data-vt]", f);
      if (img) img.style.viewTransitionName = actif ? img.getAttribute("data-vt") : "";
    });
    panneau.classList.add("ouvert");
    panneau.scrollTop = 0;
    var titre = $("h2", fiche);
    if (titre && titre.id) panneau.setAttribute("aria-labelledby", titre.id);
    rendreModal(true);
    ajusterPanneau();
    return titre;
  }

  function focaliserTitre(titre) {
    if (!titre) return;
    titre.focus({ preventScroll: !mobile.matches });
    if (!mobile.matches) {
      var haut = panneau.getBoundingClientRect().top;
      if (haut < 0 || haut > window.innerHeight * 0.6) { panneau.scrollIntoView({ block: "start" }); ajusterPanneau(); }
    }
  }

  function ouvrir(id, source, focaliser) {
    if (!existe(id)) return;
    courant = id; grappeOuverte = null;
    if (source) declencheur = source;
    var titre = afficher($("[data-fiche-lieu=\"" + id + "\"]", panneau));
    majEtats(id, null);
    navVoisins.hidden = false;
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* fichier local */ }
    if (focaliser) focaliserTitre(titre);
  }

  function ouvrirGrappe(cle, source) {
    var fiche = $("[data-fiche-grappe=\"" + cle + "\"]", panneau);
    if (!fiche) return;
    courant = null; grappeOuverte = cle;
    if (source) declencheur = source;
    var titre = afficher(fiche);
    majEtats(null, cle);
    navVoisins.hidden = true;
    focaliserTitre(titre);
  }

  function fermer() {
    if (!courant && !grappeOuverte) return;
    courant = null; grappeOuverte = null;
    fiches.concat(fichesGrappe).forEach(function (f) { f.hidden = true; });
    accueil.hidden = false;
    navVoisins.hidden = true;
    panneau.classList.remove("ouvert");
    panneau.removeAttribute("aria-labelledby");
    rendreModal(false);
    majEtats(null, null);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* fichier local */ }
    if (declencheur && document.body.contains(declencheur) && declencheur.offsetParent !== null) declencheur.focus();
  }

  reperes.forEach(function (r) {
    r.addEventListener("click", function () {
      var id = r.getAttribute("data-lieu");
      if (courant === id && !mobile.matches) { fermer(); return; }
      ouvrir(id, r, true);
    });
  });
  grappes.forEach(function (g) {
    g.addEventListener("click", function () { ouvrirGrappe(g.getAttribute("data-grappe"), g); });
  });
  boutonsListe.forEach(function (b) {
    b.addEventListener("click", function () {
      // Depuis le choix d’une grappe, le retour se fait sur la grappe
      var source = b.closest("[data-fiche-grappe]") ? declencheur : b;
      ouvrir(b.getAttribute("data-lieu"), source, true);
    });
  });
  var commencer = $("[data-commencer]", panneau);
  if (commencer) commencer.addEventListener("click", function () {
    var premier = ordre.filter(function (id) { var r = $(".repere[data-lieu=\"" + id + "\"]", atlas); return r && !r.classList.contains("estompe"); })[0];
    if (premier) ouvrir(premier, commencer, true);
  });
  $$("[data-fermer-panneau]", panneau).forEach(function (b) { b.addEventListener("click", fermer); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (courant || grappeOuverte)) {
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
  mobile.addEventListener && mobile.addEventListener("change", function () { rendreModal(!!(courant || grappeOuverte)); ajusterPanneau(); });

  /* ---------- Filtres : les repères estompés ne sont plus cliquables ni focalisables ---------- */
  function estomper(el, oui) {
    el.classList.toggle("estompe", oui);
    if (oui) { el.setAttribute("tabindex", "-1"); el.setAttribute("aria-disabled", "true"); }
    else { el.removeAttribute("tabindex"); el.removeAttribute("aria-disabled"); }
  }
  $$("[data-filtre-carte]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cat = b.getAttribute("data-filtre-carte");
      $$("[data-filtre-carte]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      reperes.concat(grappes).forEach(function (r) { estomper(r, !(cat === "tout" || r.getAttribute("data-cat") === cat)); });
      $$("[data-liste-lieux] li").forEach(function (li) { li.hidden = !(cat === "tout" || li.getAttribute("data-cat") === cat); });
    });
  });

  /* ---------- Calques ---------- */
  $$("[data-calque]").forEach(function (c) {
    c.addEventListener("change", function () {
      atlas.classList.toggle("sans-" + c.getAttribute("data-calque"), !c.checked);
      if (c.getAttribute("data-calque") === "relief" && c.checked && window.TG_redessinerReliefs) window.TG_redessinerReliefs();
    });
  });

  /* ---------- Partager un lieu : copie l’adresse avec l’ancre ---------- */
  $$("[data-partager]", panneau).forEach(function (b) {
    var libelle = b.textContent, aria = b.getAttribute("aria-label");
    b.addEventListener("click", function () {
      var url = location.href.split("#")[0] + "#" + b.getAttribute("data-partager");
      var fini = function (t) {
        b.textContent = t; b.setAttribute("aria-label", t);
        setTimeout(function () { b.textContent = libelle; b.setAttribute("aria-label", aria); }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { fini("Lien copié"); }, function () { fini("Copie impossible"); });
      } else { fini("Copie impossible"); }
    });
  });

  /* ---------- Ouverture depuis l’adresse (carte.html#le-tourmalet) ---------- */
  function depuisAdresse(focaliser) {
    var id = decodeURIComponent((location.hash || "").replace("#", ""));
    if (existe(id)) ouvrir(id, $(".repere[data-lieu=\"" + id + "\"]", atlas), focaliser);
  }
  window.addEventListener("hashchange", function () { depuisAdresse(true); });
  depuisAdresse(false);
})();
