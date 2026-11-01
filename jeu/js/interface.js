// Interface : écrans, navigation, clavier, notifications, rendu des questions, accueil, cours, réglages.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var ui = JEU.ui = {};

  // ---------- fabrication d'éléments ----------
  function el(tag, attrs, enfants) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "texte") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    });
    (enfants || []).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  ui.el = el;
  ui.$ = function (sel) { return document.querySelector(sel); };
  // Tablette tactile (31/10/2026) : vrai sur un écran qui n'a ni souris ni survol (Android, au doigt). Les raccourcis
  // clavier restent actifs ; seules leurs indications s'effacent (classe astuce-clavier, jeu.css) et deux consignes
  // disent « touche » au lieu de « clique ».
  ui.tactile = false;
  try { ui.tactile = !!(racine.matchMedia && racine.matchMedia("(hover: none) and (pointer: coarse)").matches); } catch (e) { ui.tactile = false; }
  // Indication de touche en fin de bouton, « (Entrée) » : un span que la feuille de style cache sur une tablette.
  ui.astuce = function (t) { return el("span", { class: "astuce-clavier", texte: " (" + t + ")" }); };
  ui.verbeClic = function () { return ui.tactile ? "touche" : "clique"; };
  // Garde du double toucher (revue tablette, 31/10/2026) : au doigt, une réponse touchée deux fois de suite affiche la
  // question suivante sous le doigt, et le second toucher y répondait sans qu'elle soit lue (or perdu, fausse réponse
  // notée), ou sautait l'explication d'une erreur. Un toucher qui arrive moins de GARDE_TOUCHER ms après l'affichage
  // d'une question, d'un panneau d'erreur, d'une carte du conseil ou d'une fenêtre de halte d'expédition (carte de
  // faveur, Repos, Veillée ; ui.nouvelAffichage) est donc ignoré, s'il tombe dedans. La souris et le clavier ne
  // changent pas.
  var GARDE_TOUCHER = 350, affichageLe = 0, dernierPointeur = "";
  ui.GARDE_TOUCHER = GARDE_TOUCHER;
  ui.nouvelAffichage = function () { affichageLe = Date.now(); };
  document.addEventListener("pointerdown", function (ev) { dernierPointeur = ev.pointerType || ""; }, true);
  document.addEventListener("click", function (ev) {
    if ((ev.pointerType || dernierPointeur) !== "touch" || Date.now() - affichageLe >= GARDE_TOUCHER) return;
    if (!ev.target || !ev.target.closest || !ev.target.closest(".question, .panneau-erreur, .scene-conseil, .exp-calque")) return;
    ev.stopPropagation(); ev.preventDefault();
  }, true);

  // ---------- écrans ----------
  // Changement d'écran sans cuir nu (lot B, 31/10/2026 ; plan graphismes-animations-plan.md, B1.1). L'ancien écran sort
  // (140 ms, une légère descente) pendant que le nouveau entre déjà, depuis l'opacité 0,3 : aucune image ne montre le cuir
  // seul. Pour sortir, l'ancien écran est déjà caché pour le jeu et la feuille de style (attribut hidden : il ne pèse plus
  // sur la mise en page du nouveau), mais la classe « sortie » le garde visible, en position fixe là où on le voyait, sans
  // le sortir du DOM (rien n'est recalculé dedans : ni styles, ni mise en page). Le nouvel écran défile tout de suite en
  // haut : l'ancien ne bouge pas pour autant. Un écran rappelé alors qu'il est déjà là est redessiné sur place
  // (ui.redessiner). Animations coupées : les écrans sautent, comme avant. Rien n'est lu dans la mise en page après une
  // écriture : la seule lecture (la place de l'ancien écran) se fait avant de toucher au DOM.
  var ecranCourant = null, SORTIE_MS = 140, sorties = []; // sorties : { s, style, fin, minuterie }
  function finirSortie(o) {
    clearTimeout(o.minuterie);
    var i = sorties.indexOf(o);
    if (i >= 0) sorties.splice(i, 1);
    var s = o.s;
    s.removeEventListener("animationend", o.fin);
    s.hidden = true;
    s.classList.remove("sortie", "entree");
    s.style.cssText = o.style;
    s.inert = false;
    s.removeAttribute("aria-hidden");
  }
  // Place de l'écran affiché, notée juste avant que le menu ne revienne (fin d'une partie) : la sortie part de là où on
  // voyait l'écran, sans sauter de la hauteur du menu. Oubliée à l'image suivante. (Au début d'une partie, rien à noter :
  // l'écran de la partie entre sans sortie de l'écran d'avant, voir ui.afficher.)
  var placeNotee = null;
  function noterPlace() {
    var s = ecranCourant ? document.getElementById("ecran-" + ecranCourant) : null;
    if (!s || s.hidden || !(JEU.anim && JEU.anim.actif())) return;
    placeNotee = { s: s, r: s.getBoundingClientRect() };
    if (racine.requestAnimationFrame) racine.requestAnimationFrame(function () { placeNotee = null; });
  }
  // Pose la sortie de l'écran s (affiché) : renvoie faux si elle n'a pas lieu (écran invisible, pas de place).
  function lancerSortie(s) {
    var parent = s.parentNode, r = placeNotee && placeNotee.s === s ? placeNotee.r : s.getBoundingClientRect();
    placeNotee = null;
    if (!parent || !r.width || !r.height || r.bottom <= 0 || r.top >= racine.innerHeight) return false;
    var haut = parent.getBoundingClientRect().top + racine.scrollY; // le haut de <main> une fois la page remontée
    var o = { s: s, style: s.style.cssText, minuterie: null };
    s.hidden = true;
    s.classList.remove("entree");
    s.classList.add("sortie");
    s.style.left = r.left + "px"; s.style.top = r.top + "px"; s.style.width = r.width + "px";
    // la part de l'écran qui passerait sur le menu (page défilée) est coupée
    if (r.top < haut) s.style.clipPath = "inset(" + Math.round(haut - r.top) + "px 0 0 0)";
    s.inert = true;
    s.setAttribute("aria-hidden", "true");
    // la sortie se termine à la fin de son animation : elle ne part qu'à la première image peinte du nouvel écran, qui peut
    // tarder (un écran lourd à peindre) ; une minuterie de secours la termine de toute façon
    o.fin = function (ev) { if (ev.target === s) finirSortie(o); };
    s.addEventListener("animationend", o.fin);
    o.minuterie = setTimeout(function () { finirSortie(o); }, SORTIE_MS + 600);
    sorties.push(o);
    return true;
  }
  // Au premier toucher, clic ou touche, ce qui s'efface encore (écran qui sort, fenêtre qui se ferme) s'en va d'un coup :
  // la réponse donnée aussitôt à la première question d'une bataille n'attend pas qu'un grand calque translucide soit
  // composé (perf.js, Event Timing en 1920 × 1080 : 128 ms avec la sortie en cours, 88 ms sans).
  ["pointerdown", "keydown"].forEach(function (t) {
    document.addEventListener(t, function () {
      if (sorties.length) sorties.slice().forEach(finirSortie);
      if (minuterieModale) cacherModale();
    }, true);
  });
  ui.afficher = function (nom, arg) {
    if (JEU.partie && JEU.partie.enCours && nom !== "partie") {
      ui.toast("Termine ou quitte la partie en cours d'abord.");
      return;
    }
    // une sortie encore en cours se termine tout de suite (deux changements rapprochés, retour vers l'écran qui sortait)
    sorties.slice().forEach(finirSortie);
    var s = document.getElementById("ecran-" + nom);
    if (nom === ecranCourant && !s.hidden) return ui.redessiner(nom, arg);
    var ancien = ecranCourant ? document.getElementById("ecran-" + ecranCourant) : null;
    // une partie (bataille, conseil, événement) entre sans sortie de l'écran d'avant : sa première question ne doit pas
    // attendre qu'un grand calque translucide soit défait (intégration du lot B, perf.js en 1920 × 1080 : jusqu'à 256 ms
    // de la touche à la question suivante avec la sortie, 88 ms au plus sans). L'écran de la partie se pose d'un coup, en
    // pleine opacité (aucune image de cuir nu), avec un léger glissé (feuille de style, #ecran-partie.entree).
    if (!(nom !== "partie" && ancien && ancien !== s && !ancien.hidden && JEU.anim && JEU.anim.actif() && lancerSortie(ancien))) ancien = null;
    Array.prototype.forEach.call(document.querySelectorAll("main > .ecran"), function (x) {
      if (x !== s && !x.hidden) { x.hidden = true; x.classList.remove("entree"); }
    });
    s.hidden = false;
    ecranCourant = nom;
    Array.prototype.forEach.call(document.querySelectorAll("#menu button"), function (b) {
      b.classList.toggle("actif", b.getAttribute("data-ecran") === nom);
    });
    ui.clavier = null;
    // le bouton du menu ne garde pas le focus : les touches vont au jeu
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#menu")) document.activeElement.blur();
    var rendu = ui.ecrans[nom];
    if (rendu) rendu(s, arg);
    window.scrollTo(0, 0);
    // l'écran sort de display: none : son animation d'entrée part d'elle-même, sans relire la mise en page
    s.classList.add("entree");
    // régulateur des écrans (lot C, anim.js) : sur un écran à ambiance, il relève quelques secondes l'écart entre images
    if (JEU.anim && JEU.anim.surveiller) JEU.anim.surveiller(nom);
  };
  // Redessin sur place d'un écran déjà affiché (route des expéditions, arsenal fermé, conquête, écran rappelé) : ni
  // sortie, ni entrée, ni défilement. Le rendu reçoit { surPlace: true } (contrat avec l'habillage des menus, B4 : pas de
  // cascade d'entrée). Un écran qui n'est pas affiché est montré normalement (ui.afficher).
  ui.redessiner = function (nom, arg) {
    var s = document.getElementById("ecran-" + nom);
    if (!s || nom !== ecranCourant || s.hidden) return ui.afficher(nom, arg);
    if (JEU.partie && JEU.partie.enCours && nom !== "partie") return;
    ui.clavier = null;
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#menu")) document.activeElement.blur();
    var o = { surPlace: true };
    if (arg && typeof arg === "object") Object.keys(arg).forEach(function (k) { if (k !== "surPlace") o[k] = arg[k]; });
    var rendu = ui.ecrans[nom];
    if (rendu) rendu(s, o);
  };
  ui.ecrans = {};
  ui.ecranCourant = function () { return ecranCourant; };

  // ---------- clavier ----------
  // ui.clavier : fonction(touche) de l'écran actif ; renvoie true si la touche est utilisée.
  // Un bouton atteint avec Tab garde son action propre à Entrée et Espace : le raccourci de l'écran ne la lui vole pas.
  // Après un clic de souris, Entrée reste le raccourci de l'écran (Valider, Continuer, Lancer la vague…).
  // On note d'où vient le focus au moment où il arrive : à cet instant, :focus-visible est faux après un clic
  // et vrai après Tab. Au moment d'une touche, c'est trop tard : Chromium le rend vrai même pour un bouton cliqué.
  // Un focus posé par le jeu juste après un clic (un panneau redessiné) compte aussi comme venu de la souris.
  var focusClavier = false, sourisRecente = false;
  document.addEventListener("pointerdown", function () { focusClavier = false; sourisRecente = true; }, true);
  document.addEventListener("keydown", function () { sourisRecente = false; }, true);
  document.addEventListener("focusin", function (ev) {
    try { focusClavier = !sourisRecente && !!(ev.target && ev.target.matches && ev.target.matches(":focus-visible")); } catch (e) { focusClavier = false; }
  });
  // Vrai si le focus actuel a été donné au clavier (Tab, ou focus posé par le jeu juste après une touche).
  ui.focusAuClavier = function () { return focusClavier; };
  function boutonAuClavier(t) {
    if (!focusClavier || !t || t === document.body || !t.matches) return false;
    return t.matches("button, a[href]");
  }
  document.addEventListener("keydown", function (ev) {
    // dans un champ, seules Entrée (valider) et Échap (fermer, quitter) vont au jeu
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName) && ev.key !== "Enter" && ev.key !== "Escape") return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ui.modaleOuverte()) {
      if (ev.key === "Escape") { ui.fermerModale(); ev.preventDefault(); }
      return;
    }
    if ((ev.key === "Enter" || ev.key === " ") && boutonAuClavier(ev.target)) return;
    if (ui.clavier && ui.clavier(ev.key, ev)) { ev.preventDefault(); return; }
    if (ev.key === "Escape" && JEU.partie && JEU.partie.enCours) { ev.preventDefault(); ui.proposerQuitter(); }
  });

  // ---------- notifications ----------
  // genre : classe en plus (« tribut » : en haut à droite) ; duree : ms d'affichage (1,6 s par défaut). Le toast
  // garde son genre en s'effaçant (il ne saute pas d'un coin à l'autre de l'écran).
  var minuterieToast = null;
  ui.toast = function (texte, genre, duree) {
    var t = document.getElementById("toast");
    t.textContent = texte;
    t.className = "toast visible " + (genre || "");
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(function () { t.className = "toast " + (genre || ""); }, duree || 1600);
  };

  // Sceau qui s'imprime (350 ms), sans retarder la question suivante : il est posé une image après elle
  // (JEU.anim.apresImage). Un nouveau sceau remplace celui qui est encore affiché : deux bonnes réponses rapprochées ne
  // les impriment jamais l'un sur l'autre. La cire est rendue en 3D (assets/images/reponses/tampon-cire.png) et le mot
  // est écrit en lettres d'or dans l'empreinte, sur deux lignes s'il a deux mots. genre « perte » : l'or qu'une erreur
  // coûte en bataille (plomb, chiffre rouge clair). Le « +12 or » reste dans un span (bataille.js en fait partir l'or).
  // ou (facultatif) : { x : abscisse en % de la fenêtre, pres : élément à ne pas couvrir } : le conseil pose « Sage
  // décision » là où la carte est partie (72 %), à droite de la carte suivante, jamais sur son texte. Sans « ou » :
  // au centre de l'écran (bataille).
  ui.tampon = function (texte, sous, genre, ou) {
    var poser = function () {
      Array.prototype.forEach.call(document.querySelectorAll(".tampon"), function (x) { x.remove(); });
      var t = document.createElement("div");
      t.className = "tampon" + (genre ? " " + genre : "");
      var mots = String(texte).split(" "), coupe = mots.length > 1 ? Math.ceil(mots.length / 2) : 0;
      var mot = coupe ? U.echapper(mots.slice(0, coupe).join(" ")) + "<br>" + U.echapper(mots.slice(coupe).join(" ")) : U.echapper(texte);
      var classe = coupe ? " class='deux'" : String(texte).length > 6 ? " class='long'" : ""; // un mot long (« Dommage ») tient dans la cire
      t.innerHTML = "<i class='tampon-cire'><b" + classe + ">" + mot + "</b></i>" + (sous ? "<span>" + U.echapper(sous) + "</span>" : "");
      var p = ou ? ui.placeTampon(ou) : null; // lu une image après la réponse : hors du chemin vers la question suivante
      if (p) { t.style.left = p.x + "px"; t.style.top = p.y + "px"; t.classList.add("place"); }
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, 760);
    };
    if (JEU.anim && JEU.anim.apresImage) JEU.anim.apresImage(poser); else poser();
  };
  // Centre du tampon (px, fenêtre) : à « x » % de la largeur, à mi-hauteur du haut de « pres » (un élément ou un
  // rectangle : la carte suivante), poussé hors de « pres » du côté où il est, sinon de l'autre côté, sinon dessous
  // (le bilan, aussi large que la scène), sinon sur son coin haut. ou.point : un centre déjà calculé. R : rayon du
  // tampon (feuille de style : 144 px de cire). Où qu'il se pose, le centre reste à BORD px des bords de la fenêtre : le
  // sceau frappe à l'échelle 1,8 (72 × 1,8 = 130 px de rayon) et ne déborde pas (chasse aux bugs du lot B : à côté du
  // bilan, il sortait de 31 px en 1280 × 800) ; un côté n'est libre que si le centre y tient à BORD px du bord.
  ui.placeTampon = function (ou) {
    if (ou.point) return ou.point;
    var R = 76, BORD = 140, l = racine.innerWidth, x = l * (ou.x == null ? 50 : ou.x) / 100, y = racine.innerHeight * 0.42;
    var pres = typeof ou.pres === "function" ? ou.pres() : ou.pres;
    var r = pres && pres.getBoundingClientRect ? (pres.isConnected ? pres.getBoundingClientRect() : null) : pres;
    if (r && r.width) {
      var droite = r.left + r.width, aDroite = x >= r.left + r.width / 2;
      var placeD = droite + 8 + R <= l - BORD, placeG = r.left - 8 - R >= BORD;
      y = r.top + Math.min(r.height / 2, 110);
      if (aDroite && placeD) x = Math.min(Math.max(x, droite + 8 + R), l - BORD);
      else if (!aDroite && placeG) x = Math.max(Math.min(x, r.left - 8 - R), BORD);
      else if (placeD) x = droite + 8 + R;
      else if (placeG) x = r.left - 8 - R;
      else if (r.top + r.height + 2 * R + 30 <= racine.innerHeight) { x = Math.min(Math.max(x, BORD), l - BORD); y = r.top + r.height + R + 4; } // dessous
      else { x = Math.min(Math.max(aDroite ? droite - R * 0.55 : r.left + R * 0.55, BORD), l - BORD); y = r.top + R * 0.45; } // sur son coin haut
    }
    return { x: Math.round(x), y: Math.round(Math.max(R, y)) };
  };

  // ---------- fenêtre modale ----------
  // Entrée et sortie (lot B, B1.2) : le voile se fond en 150 ms et la boîte passe de 0,96 à 1 ; à la fermeture, la boîte
  // s'efface en 120 ms (classe « ferme » sur #modale, rendue inerte : ni clic, ni touche, ni focus). Pour le jeu, la
  // fenêtre est fermée dès le début de l'effacement, et ce qui la suit (retourModale : une bataille après une missive)
  // part tout de suite, sans attendre. Une fenêtre qui s'ouvre pendant l'effacement le termine d'un coup.
  var retourModale = null, minuterieModale = null, ecouteModale = false;
  function cacherModale() {
    clearTimeout(minuterieModale); minuterieModale = null;
    var m = document.getElementById("modale");
    m.hidden = true; m.classList.remove("ferme"); m.inert = false;
  }
  // l'effacement finit à la fin de l'animation du voile (elle ne part qu'à l'image suivante, qui peut tarder si ce qui
  // suit la fenêtre est lourd à peindre) ; minuterie de secours
  function effacerModale(m) {
    if (!ecouteModale) {
      ecouteModale = true;
      m.addEventListener("animationend", function (ev) { if (ev.target === m && m.classList.contains("ferme")) cacherModale(); });
    }
    m.classList.add("ferme"); m.inert = true;
    minuterieModale = setTimeout(cacherModale, 700);
  }
  // classe : habillage particulier de la boîte (« missive-boite »), retiré à la fenêtre suivante
  ui.ouvrirModale = function (titre, contenu, fermeture, classe) {
    var m = document.getElementById("modale");
    if (minuterieModale) cacherModale();
    var boite = m.querySelector(".modale-boite");
    boite.className = "modale-boite" + (classe ? " " + classe : "");
    boite.innerHTML = "";
    boite.appendChild(el("button", { class: "modale-fermer", "aria-label": "Fermer", onclick: ui.fermerModale, texte: "×" }));
    if (titre) boite.appendChild(el("h2", { texte: titre }));
    boite.appendChild(contenu);
    m.hidden = false;
    retourModale = fermeture || null;
    var f = boite.querySelector("input, textarea, button:not(.modale-fermer)");
    if (f) f.focus();
  };
  // Tab reste dans la fenêtre ouverte (le jeu derrière n'est plus atteignable au clavier).
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Tab" || !ui.modaleOuverte()) return;
    var boite = document.querySelector("#modale .modale-boite");
    var f = Array.prototype.filter.call(boite.querySelectorAll("button, input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])"), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var premier = f[0], dernier = f[f.length - 1];
    if (!boite.contains(document.activeElement)) { ev.preventDefault(); premier.focus(); }
    else if (ev.shiftKey && document.activeElement === premier) { ev.preventDefault(); dernier.focus(); }
    else if (!ev.shiftKey && document.activeElement === dernier) { ev.preventDefault(); premier.focus(); }
  }, true);
  ui.fermerModale = function () {
    var m = document.getElementById("modale");
    if (!m.hidden && !m.classList.contains("ferme")) {
      // le bouton qui avait le focus le perd : une seconde touche Entrée ne le relance pas pendant l'effacement
      var a = document.activeElement;
      if (a && a !== document.body && m.contains(a) && a.blur) a.blur();
      if (JEU.anim && JEU.anim.actif()) effacerModale(m);
      else cacherModale();
    }
    var r = retourModale; retourModale = null;
    if (r) r();
  };
  ui.modaleOuverte = function () { var m = document.getElementById("modale"); return !m.hidden && !m.classList.contains("ferme"); };

  // ---------- missive : une lettre scellée (personnages de la campagne, 16/10/2026) ----------
  // o : { entete, lettres: [{ medaillon (HTML), nom, sous, texte, camp }], bouton, sceau (HTML), apres }
  // Une à trois lettres dans la même fenêtre, un seul bouton (« Relever le défi » ou « Continuer »). Entrée (bouton
  // qui a le focus), Échap, la croix ou un clic à côté la ferment, et apres() suit dans tous les cas. Tab reste dans
  // la fenêtre. Aucun délai : rien ne se ferme tout seul. Un clic ou une Entrée dans les 350 premières ms ne compte pas
  // (un double clic sur la carte ne saute pas la lettre). Une partie qui commence (bataille, conseil, événement) ferme
  // la missive sans suite : une missive ne se glisse jamais entre deux questions.
  var missiveDepuis = 0;
  function maintenant() { return (racine.performance || Date).now(); }
  ui.ouvrirMissive = function (o) {
    var bouton = el("button", { class: "bouton principal missive-bouton", onclick: function () { if (maintenant() - missiveDepuis >= 350) ui.fermerModale(); } }, [
      document.createTextNode(o.bouton || "Continuer"), el("span", { class: "touche-texte", texte: " (Entrée)" })]);
    var lettres = (o.lettres || []).map(function (l) {
      return el("article", { class: "lettre" + (l.camp ? " camp-" + l.camp : "") }, [
        el("span", { class: "lettre-medaillon", html: l.medaillon || "" }),
        el("div", { class: "lettre-corps" }, [
          el("h3", { class: "lettre-qui", texte: l.nom || "" }),
          l.sous ? el("p", { class: "lettre-sous", texte: l.sous }) : null,
          el("p", { class: "lettre-texte", texte: l.texte || "" })
        ])
      ]);
    });
    var boite = el("div", { class: "missive" }, [
      el("p", { class: "missive-entete", texte: o.entete || "Une missive" }),
      el("div", { class: "missive-lettres" }, lettres),
      el("div", { class: "missive-pied" }, [o.sceau ? el("span", { class: "missive-sceau", html: o.sceau }) : null, bouton])
    ]);
    missiveDepuis = maintenant();
    ui.ouvrirModale(null, boite, o.apres || null, "missive-boite");
    bouton.focus();
  };
  ui.missiveOuverte = function () {
    var b = document.querySelector("#modale .modale-boite");
    return ui.modaleOuverte() && !!b && b.classList.contains("missive-boite");
  };
  // sansSuite : la missive se ferme sans lancer ce qui devait suivre (une partie commence déjà)
  ui.fermerMissive = function (sansSuite) {
    if (!ui.missiveOuverte()) return;
    if (sansSuite) retourModale = null;
    ui.fermerModale();
  };
  // clic à côté de la missive juste après son ouverture : ignoré (voir plus haut)
  document.addEventListener("click", function (ev) {
    if (ev.target && ev.target.id === "modale" && ui.missiveOuverte() && maintenant() - missiveDepuis < 350) { ev.stopPropagation(); ev.preventDefault(); }
  }, true);

  // Confirmation dans la page (les boîtes confirm() et alert() sont bloquées sur la version web).
  ui.confirmer = function (question, texteOui, siOui, texteNon) {
    var oui = el("button", { class: "bouton principal", texte: texteOui || "Oui" });
    var non = el("button", { class: "bouton", texte: texteNon || "Non, je reste" });
    var boite = el("div", { class: "confirmation" }, [el("p", { texte: question }), el("div", { class: "actions" }, [oui, non])]);
    oui.addEventListener("click", function () { ui.fermerModale(); siOui(); });
    non.addEventListener("click", ui.fermerModale);
    ui.ouvrirModale(null, boite);
    oui.focus();
  };
  ui.message = function (titre, texte) {
    var ok = el("button", { class: "bouton principal", onclick: ui.fermerModale, texte: "Compris" });
    ui.ouvrirModale(titre, el("div", { class: "confirmation" }, [el("p", { texte: texte }), el("div", { class: "actions" }, [ok])]));
  };

  // ---------- bandeau : ressources ----------
  // Les médaillons sont bâtis une fois ; ensuite seuls les nombres qui changent sont remplacés (une bonne réponse ne
  // fait pas redessiner tout le bandeau). Les boutons du son et de la musique ne changent que si leur état change.
  ui.majRessources = function () {
    var etat = JEU.sauvegarde.etat();
    var zone = document.getElementById("ressources");
    var cles = Object.keys(JEU.RESSOURCES);
    if (zone.getAttribute("data-cles") !== cles.join() || zone.children.length !== cles.length) {
      zone.innerHTML = "";
      cles.forEach(function (k) {
        var r = JEU.RESSOURCES[k];
        zone.appendChild(el("span", { class: "ressource", "data-res": k, title: r.nom + " (" + JEU.MATIERES[r.matiere].nom + ")", style: "--teinte:" + JEU.MATIERES[r.matiere].couleur }, [
          el("span", { class: "medaillon", html: JEU.icones.ressource(k, 20) }),
          el("b", { texte: String(etat.ressources[k] || 0) })
        ]));
      });
      zone.setAttribute("data-cles", cles.join());
    } else cles.forEach(function (k, i) {
      var b = zone.children[i].querySelector("b"), t = String(etat.ressources[k] || 0);
      if (b && b.textContent !== t) b.textContent = t;
    });
    var bl = document.getElementById("blason-bandeau");
    if (bl && bl.getAttribute("data-nom") !== etat.reglages.nomDomaine) { bl.innerHTML = JEU.icones.blason(etat.reglages.nomDomaine, 30); bl.setAttribute("data-nom", etat.reglages.nomDomaine); }
    var nom = document.getElementById("nom-domaine");
    if (nom) nom.textContent = etat.reglages.nomDomaine || "Le domaine";
    var son = document.getElementById("bouton-son");
    var mus = document.getElementById("bouton-musique");
    var mOn = etat.reglages.musique !== false, sOn = !!etat.reglages.son;
    if (mus && mus.getAttribute("data-etat") !== String(mOn)) { mus.setAttribute("data-etat", String(mOn)); mus.innerHTML = JEU.icones.icone("musique", 22); mus.classList.toggle("coupe", !mOn); mus.title = mOn ? "Couper la musique" : "Remettre la musique"; mus.setAttribute("aria-pressed", mOn ? "true" : "false"); }
    if (son && son.getAttribute("data-etat") !== String(sOn)) { son.setAttribute("data-etat", String(sOn)); son.innerHTML = JEU.icones.icone(sOn ? "son" : "sans-son", 22); son.title = sOn ? "Couper les bruitages" : "Remettre les bruitages"; son.setAttribute("aria-pressed", sOn ? "true" : "false"); }
  };

  // ---------- questions ----------
  // Pose une question dans « zone ». fini(juste, reponseJoueur) est appelé une seule fois.
  // options : { sansIndice }
  // Lot B (31/10/2026) : la réponse donnée est gardée (derniere) pour que panneauErreur montre, hors bataille, la question
  // avec ta réponse en rouge et la bonne en or. Bonne réponse hors bataille : le rectangle de la réponse choisie est
  // relevé ici (la page n'a pas changé depuis le geste : aucune mise en page forcée) et JEU.anim.frapper y pose le sceau
  // une image plus tard. En bataille (zone .td-question), rien de plus : le sceau « Juste » de bataille.js suffit.
  var derniere = null; // { q, rj, zone, carte, corps, bataille } : la dernière question répondue
  ui.poserQuestion = function (q, zone, fini, options) {
    options = options || {};
    zone.innerHTML = "";
    ui.questionCourante = q;
    var deja = false, bataille = !!(zone.closest && zone.closest(".td-question"));
    function repondre(rj) {
      if (deja) return;
      deja = true;
      ui.clavier = null;
      if (JEU.anim && JEU.anim.laisserPasser) JEU.anim.laisserPasser(); // lot C : les gerbes en vol sautent l'image de la réponse
      var juste = JEU.questions.corriger(q, rj);
      derniere = { q: q, rj: rj, zone: zone, carte: carte, corps: corps, bataille: bataille };
      if (juste && !bataille && corps && JEU.anim && JEU.anim.frapper && JEU.anim.actif()) {
        var cible = (q.type === "qcm" || q.type === "vrai_faux" ? boutonsReponse(q, rj, corps).choisis[0] : null) || corps.querySelector(".valider") || carte;
        if (cible) JEU.anim.frapper(cible.getBoundingClientRect());
      }
      fini(juste, rj);
    }
    var m = JEU.MATIERES[q.matiere] || { nom: "", couleur: "#8a7f70" };
    if (options.recit) zone.appendChild(ui.recit(options.recit));
    var carte = el("div", { class: "question", style: "--teinte:" + m.couleur }, [
      el("div", { class: "question-entete" }, [
        el("span", { class: "pastille", texte: m.nom }),
        el("span", { class: "notion", texte: (JEU.questions.fiche(q.fiche) || { fiche: {} }).fiche.notion || "" })
      ]),
      el("p", { class: "enonce", texte: q.enonce || "" })
    ]);
    zone.appendChild(carte);
    var corps = el("div", { class: "reponses" });
    carte.appendChild(corps);
    var rendu = RENDUS[q.type];
    if (!rendu) { repondre(null); return; }
    rendu(q, corps, repondre);
    var pied = el("div", { class: "question-pied" });
    if (q.indice && !options.sansIndice) {
      pied.appendChild(el("button", { class: "lien", onclick: function () { JEU.mentor.dire(q.indice, "indice"); }, texte: "Un indice, chroniqueur ?" }));
    }
    carte.appendChild(pied);
    ui.nouvelAffichage();
    JEU.mesure.questionAffichee();
  };

  // Bandeau de récit : le personnage qui pose la question, et la situation. etiquette (facultative) : « Seconde chance »
  // pour une question ratée qui revient un peu plus tard (rappels.js). Pas de classe « rappel » sur le bandeau : elle
  // est déjà prise par l'encadré de l'accueil (rappel d'export), dont la mise en page déformerait le bandeau.
  // repere (facultatif, recit.js) : la semaine et la matière du cours (« Semaine 4 · Histoire · Cours 5 »), sur la ligne
  // du nom pour ne pas ajouter de hauteur au bandeau (la colonne de bataille est juste en 1366 × 768).
  // semaine (facultatif, recit.js, 24/10/2026) : { numero, libelle, titre, route } ; le titre du cours va en infobulle du
  // repère, et le repère passe en relief (classe recit-semaine) quand route vaut true : la question vient de la semaine de
  // l'acte d'une expédition. En campagne, route est faux : le ruban dit la semaine sans relief.
  ui.recit = function (r) {
    var carte = el("div", { class: "recit" + (r.etiquette ? " seconde-chance" : "") }, [
      el("span", { class: "recit-portrait", html: JEU.icones.icone(r.icone, 34) }),
      el("div", {}, [
        el("b", { class: "recit-nom" }, [r.nom, r.etiquette ? el("span", { class: "etiquette-rappel", texte: r.etiquette }) : null,
          r.repere ? el("span", { class: "recit-repere", texte: r.repere }) : null]),
        el("p", { class: "recit-texte", texte: r.texte })
      ])
    ]);
    if (r.semaine && r.repere) {
      var ruban = carte.querySelector(".recit-repere");
      if (ruban) { if (r.semaine.titre) ruban.title = r.semaine.titre; if (r.semaine.route) ruban.classList.add("recit-semaine"); }
    }
    return carte;
  };

  function boutonChoix(n, texte, action) {
    return el("button", { class: "choix", "data-n": n, onclick: action }, [el("span", { class: "touche", texte: String(n) }), el("span", { texte: texte })]);
  }

  function boutonValider(action) {
    return el("button", { class: "bouton principal valider", onclick: action }, ["Valider", ui.astuce("Entrée")]);
  }

  var RENDUS = {
    qcm: function (q, corps, repondre) {
      // choix mélangés à chaque affichage : dans les fichiers, la bonne réponse est souvent écrite en premier
      var choix = U.melanger(q.choix.slice());
      choix.forEach(function (c, i) { corps.appendChild(boutonChoix(i + 1, c, function () { repondre(c); })); });
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= choix.length) { repondre(choix[n - 1]); return true; }
        return false;
      };
    },
    qcm_multiple: function (q, corps, repondre) {
      var choisis = [];
      corps.appendChild(el("p", { class: "consigne", texte: "Plusieurs réponses possibles." }));
      var choix = U.melanger(q.choix.slice()); // mélangés à chaque affichage, comme pour le QCM simple
      var boutons = choix.map(function (c, i) {
        var b = boutonChoix(i + 1, c, function () { basculer(i); });
        corps.appendChild(b);
        return b;
      });
      function basculer(i) {
        var c = choix[i];
        var k = choisis.indexOf(c);
        if (k >= 0) choisis.splice(k, 1); else choisis.push(c);
        boutons[i].classList.toggle("coche", k < 0);
      }
      corps.appendChild(boutonValider(function () { repondre(choisis.slice()); }));
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= choix.length) { basculer(n - 1); return true; }
        if (k === "Enter") { repondre(choisis.slice()); return true; }
        return false;
      };
    },
    vrai_faux: function (q, corps, repondre) {
      function etape2() {
        corps.innerHTML = "";
        if (!q.corrections || !q.corrections.length) { repondre({ vrai: false, correction: null }); return; }
        corps.appendChild(el("p", { class: "consigne", texte: "Faux, oui. Quelle est la bonne correction ?" }));
        var corr = U.melanger(q.corrections);
        corr.forEach(function (c, i) { corps.appendChild(boutonChoix(i + 1, c, function () { repondre({ vrai: false, correction: c }); })); });
        ui.clavier = function (k) {
          var n = parseInt(k, 10);
          if (n >= 1 && n <= corr.length) { repondre({ vrai: false, correction: corr[n - 1] }); return true; }
          return false;
        };
      }
      function choisir(v) {
        if (v) { repondre({ vrai: true, correction: null }); return; }
        if (q.reponse.vrai) { repondre({ vrai: false, correction: null }); return; }
        etape2();
      }
      corps.appendChild(boutonChoix(1, "Vrai", function () { choisir(true); }));
      corps.appendChild(boutonChoix(2, "Faux", function () { choisir(false); }));
      ui.clavier = function (k) {
        if (k === "1" || k === "ArrowRight") { choisir(true); return true; }
        if (k === "2" || k === "ArrowLeft") { choisir(false); return true; }
        return false;
      };
    },
    ordre: function (q, corps, repondre) {
      var suite = [];
      corps.appendChild(el("p", { class: "consigne", texte: (ui.tactile ? "Touche" : "Clique") + " les éléments dans le bon ordre (" + ui.verbeClic() + " à nouveau pour retirer)." }));
      var liste = el("div", { class: "ordre" });
      corps.appendChild(liste);
      var boutons = q.elements.map(function (t, i) {
        var b = boutonChoix(i + 1, t, function () { basculer(i); });
        liste.appendChild(b);
        return b;
      });
      function basculer(i) {
        var k = suite.indexOf(i);
        if (k >= 0) suite.splice(k, 1); else suite.push(i);
        boutons.forEach(function (b, j) {
          var r = suite.indexOf(j);
          b.classList.toggle("coche", r >= 0);
          b.querySelector(".touche").textContent = r >= 0 ? "#" + (r + 1) : String(j + 1);
        });
        valider.disabled = suite.length !== q.elements.length;
      }
      var valider = boutonValider(function () { repondre(suite.slice()); });
      valider.disabled = true;
      corps.appendChild(valider);
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= q.elements.length) { basculer(n - 1); return true; }
        if (k === "Enter" && !valider.disabled) { repondre(suite.slice()); return true; }
        return false;
      };
    },
    association: function (q, corps, repondre) {
      var paires = [];      // [[g, d]]
      var gaucheChoisie = null;
      corps.appendChild(el("p", { class: "consigne", texte: (ui.tactile ? "Touche" : "Clique") + " un élément à gauche, puis celui qui lui correspond à droite." }));
      var grille = el("div", { class: "association" });
      var colG = el("div", { class: "colonne" }), colD = el("div", { class: "colonne" });
      grille.appendChild(colG); grille.appendChild(colD); corps.appendChild(grille);
      var bG = q.gauche.map(function (t, i) { var b = el("button", { class: "choix", onclick: function () { choisirG(i); } }, [el("span", { class: "touche", texte: String(i + 1) }), el("span", { texte: t })]); colG.appendChild(b); return b; });
      var bD = q.droite.map(function (t, j) { var b = el("button", { class: "choix", onclick: function () { choisirD(j); } }, [el("span", { class: "touche", texte: "·" }), el("span", { texte: t })]); colD.appendChild(b); return b; });
      function maj() {
        bG.forEach(function (b, i) {
          var p = paires.filter(function (x) { return x[0] === i; })[0];
          b.className = "choix" + (p ? " paire paire" + paires.indexOf(p) : "") + (gaucheChoisie === i ? " selection" : "");
        });
        bD.forEach(function (b, j) {
          var p = paires.filter(function (x) { return x[1] === j; })[0];
          b.className = "choix" + (p ? " paire paire" + paires.indexOf(p) : "");
          b.querySelector(".touche").textContent = p ? String(p[0] + 1) : "·";
        });
        var complet = paires.length === q.gauche.length;
        // dernier appariement : on prévient l'écran (la bataille amène alors « Valider » en vue)
        if (complet && valider.disabled && typeof CustomEvent === "function") corps.dispatchEvent(new CustomEvent("paires-completes", { bubbles: true }));
        valider.disabled = !complet;
      }
      function choisirG(i) {
        paires = paires.filter(function (x) { return x[0] !== i; });
        gaucheChoisie = i; maj();
      }
      function choisirD(j) {
        if (gaucheChoisie === null) {
          paires = paires.filter(function (x) { return x[1] !== j; }); maj(); return;
        }
        paires = paires.filter(function (x) { return x[1] !== j && x[0] !== gaucheChoisie; });
        paires.push([gaucheChoisie, j]);
        gaucheChoisie = null; maj();
      }
      var valider = boutonValider(function () { repondre(paires.slice()); });
      corps.appendChild(valider);
      maj();
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= q.gauche.length) { choisirG(n - 1); return true; }
        if (k === "Enter" && !valider.disabled) { repondre(paires.slice()); return true; }
        return false;
      };
    },
    trou: function (q, corps, repondre) {
      var morceaux = q.texte.split("___");
      var p = el("p", { class: "texte-trous" });
      var champs = [];
      morceaux.forEach(function (m, i) {
        p.appendChild(document.createTextNode(m));
        if (i < morceaux.length - 1) {
          var c;
          if (q.banque && q.banque.length) {
            c = el("select", { class: "trou" }, [el("option", { value: "", texte: "…" })].concat(q.banque.map(function (w) { return el("option", { value: w, texte: w }); })));
          } else {
            c = el("input", { class: "trou", type: "text", autocomplete: "off", spellcheck: "false" });
          }
          champs.push(c);
          p.appendChild(c);
        }
      });
      corps.appendChild(p);
      function envoyer() { repondre(champs.map(function (c) { return c.value; })); }
      corps.appendChild(boutonValider(envoyer));
      if (champs[0]) setTimeout(function () { champs[0].focus(); }, 0);
      ui.clavier = function (k) { if (k === "Enter") { envoyer(); return true; } return false; };
    }
  };

  // Panneau d'erreur : la bonne réponse, deux phrases d'explication, Continuer, la fiche, signaler.
  // Association : la bonne réponse en liste, une paire par ligne. L'explication n'est pas montrée si elle ne fait que
  // redire la bonne réponse (mêmes paires, « : » au lieu de « → »).
  function sansPonctuation(t) { return String(t || "").toLowerCase().replace(/[→:;,.!?«»"'’()\s-]+/g, " ").trim(); }
  function repeteReponse(q) {
    if (!q.explication) return false;
    var e = sansPonctuation(q.explication);
    if (e === sansPonctuation(JEU.questions.texteReponse(q))) return true;
    if (q.type !== "association" || !q.reponse) return false;
    // toutes les paires de la bonne réponse se retrouvent dans l'explication, et elle ne dit rien de plus
    var paires = q.reponse.map(function (p) { return sansPonctuation(q.gauche[p[0]] + " " + q.droite[p[1]]); });
    var reste = e;
    for (var i = 0; i < paires.length; i++) {
      if (reste.indexOf(paires[i]) < 0) return false;
      reste = reste.replace(paires[i], " ");
    }
    return reste.replace(/\s+/g, "").length < 4;
  }
  ui.repeteReponse = repeteReponse; // pour l'essai de bout en bout

  // Les boutons d'une réponse : choisis (la réponse du joueur), bons (ceux de la bonne réponse), faux (à une mauvaise
  // place : ordre, association). Texte d'un bouton de choix : son dernier span (le premier est la touche).
  function texteBouton(b) { return b.lastElementChild ? b.lastElementChild.textContent : b.textContent; }
  function boutonsReponse(q, rj, corps) {
    var res = { choisis: [], bons: [], faux: [] }, r = q.reponse;
    if (!corps || r == null) return res;
    var bs = Array.prototype.slice.call(corps.querySelectorAll("button.choix"));
    if (q.type === "qcm") bs.forEach(function (b) { var t = texteBouton(b); if (t === rj) res.choisis.push(b); if (t === r) res.bons.push(b); });
    else if (q.type === "qcm_multiple") bs.forEach(function (b) { var t = texteBouton(b); if ((rj || []).indexOf(t) >= 0) res.choisis.push(b); if (r.indexOf(t) >= 0) res.bons.push(b); });
    else if (q.type === "vrai_faux" && rj) {
      var corrections = bs.length > 0 && texteBouton(bs[0]) !== "Vrai"; // seconde étape : les corrections à la place de Vrai / Faux
      bs.forEach(function (b) {
        var t = texteBouton(b);
        if (corrections) { if (t === rj.correction) res.choisis.push(b); if (t === r.correction) res.bons.push(b); }
        else { if (t === (rj.vrai ? "Vrai" : "Faux")) res.choisis.push(b); if (t === (r.vrai ? "Vrai" : "Faux")) res.bons.push(b); }
      });
    } else if (q.type === "ordre") {
      // chaque élément au bon rang (bon) ou non (faux), selon le rang que le joueur lui a donné
      Array.prototype.forEach.call(corps.querySelectorAll(".ordre .choix"), function (b, j) {
        (Array.isArray(rj) && rj.indexOf(j) === r.indexOf(j) ? res.bons : res.faux).push(b);
      });
    } else if (q.type === "association") {
      var col = corps.querySelector(".association .colonne");
      if (col) Array.prototype.forEach.call(col.querySelectorAll(".choix"), function (b, i) {
        var p = (rj || []).filter(function (x) { return x[0] === i; })[0];
        (p && r.some(function (x) { return x[0] === p[0] && x[1] === p[1]; }) ? res.bons : res.faux).push(b);
      });
    }
    res.choisis.forEach(function (b) { if (res.bons.indexOf(b) < 0) res.faux.push(b); });
    return res;
  }
  ui.boutonsReponse = boutonsReponse;

  // Réponse montrée (hors bataille) : la question reste, ses commandes sont désactivées ; ta réponse rougit et tremble,
  // la bonne passe en vert-or avec un petit sceau, les autres choix s'effacent à demi. Renvoie vrai si la bonne réponse
  // se lit entière sur les boutons (le panneau ne la répète pas).
  function montrerReponse(q, d) {
    var carte = d.carte, m = boutonsReponse(q, d.rj, d.corps);
    carte.classList.add("montree");
    Array.prototype.forEach.call(carte.querySelectorAll("button, select, input"), function (b) { b.disabled = true; });
    m.bons.forEach(function (b) { b.classList.add("bonne-montree"); });
    m.faux.forEach(function (b) { b.classList.add("choisie-fausse"); if (JEU.anim) JEU.anim.secouer(b); });
    if (q.type === "qcm" || q.type === "vrai_faux" || q.type === "qcm_multiple") Array.prototype.forEach.call(d.corps.querySelectorAll("button.choix"), function (b) {
      if (m.bons.indexOf(b) < 0 && m.faux.indexOf(b) < 0) b.classList.add("ecartee");
    });
    if (q.type === "trou") Array.prototype.forEach.call(d.corps.querySelectorAll(".trou"), function (c, i) {
      var a = q.reponse[i], ok = (Array.isArray(a) ? a : [a]).some(function (x) { return U.normaliser(x) === U.normaliser(c.value); });
      c.classList.add(ok ? "trou-juste" : "trou-faux");
    });
    var r = q.reponse;
    return m.bons.length > 0 && (q.type === "qcm" || q.type === "qcm_multiple" || (q.type === "vrai_faux" && (r.vrai || !r.correction || m.bons[0].textContent.indexOf(r.correction) >= 0)));
  }

  // Ta réponse, écrite (panneau d'erreur de la bataille, qui remplace la question) ; association : le nombre de paires
  // justes seulement (chaque définition n'est écrite qu'une fois dans le panneau : les paires ratées sont marquées dans
  // la bonne réponse).
  function texteJoueur(q, rj) {
    switch (q.type) {
      case "qcm": return String(rj == null ? "" : rj);
      case "qcm_multiple": return rj && rj.length ? rj.join(" ; ") : "aucune case cochée";
      case "vrai_faux": return rj ? (rj.vrai ? "Vrai." : "Faux." + (rj.correction ? " " + rj.correction : "")) : "";
      case "ordre": return (rj || []).map(function (i) { return q.elements[i]; }).join(" → ");
      case "trou": return (rj || []).map(function (v) { return v || "…"; }).join(", ");
    }
    return "";
  }
  // La bonne réponse écrite ; une correction qui commence déjà par « Faux » n'est pas précédée d'un second « Faux. ».
  function texteBonne(q) {
    var r = q.reponse;
    if (q.type === "vrai_faux" && r && !r.vrai && /^Faux\b/.test(r.correction || "")) return r.correction;
    return JEU.questions.texteReponse(q);
  }
  function pairesJustes(q, rj) {
    return q.reponse.map(function (p) { return (rj || []).some(function (x) { return x[0] === p[0] && x[1] === p[1]; }); });
  }

  // Après une réponse montrée : le panneau entier dans la fenêtre si possible, sans faire passer l'énoncé sous le bandeau.
  // Le panneau se déplie encore (transformé) : sa hauteur vraie est offsetHeight, son haut à 8 px près.
  function garderEnVue(panneau, haut) {
    var r = panneau.getBoundingClientRect(), bas = racine.innerHeight - 10;
    r = { top: r.top, bottom: r.top + 8 + panneau.offsetHeight };
    if (r.bottom <= bas) return;
    var b = document.getElementById("bandeau"), hb = b ? b.getBoundingClientRect().bottom : 0;
    var marge = haut ? haut.getBoundingClientRect().top - hb - 8 : r.top - hb - 8;
    var dy = Math.min(r.bottom - bas, Math.max(0, marge));
    if (dy > 0) racine.scrollBy(0, dy);
  }
  // options (facultatif, 24/10/2026) : { sansFiche } : pas de bouton « Voir la fiche » (Grand Gardien d'une expédition : les
  // fiches ratées attendent le bilan, comme pour un boss).
  // Lot B (31/10/2026, décision 2.1.4 du plan) : hors bataille, la question reste au-dessus (réponse montrée, voir
  // montrerReponse) et le panneau se déplie dessous, en parchemin à filet brique et lettrine rouge. En bataille (colonne
  // étroite, énoncé contrôlé à 1366 × 768), le panneau remplace la question comme avant, mais montre ta réponse barrée
  // de rouge au-dessus de la bonne réponse en or. options.garder (conseil.js) : la scène est gardée telle quelle (le
  // conseil a marqué lui-même ses boutons) ; options.reponse : ta réponse, quand poserQuestion ne l'a pas vue.
  ui.panneauErreur = function (q, zone, suite, options) {
    options = options || {};
    var d = derniere && derniere.q === q && derniere.zone === zone ? derniere : null;
    var bataille = d ? d.bataille : !!(zone.closest && zone.closest(".td-question"));
    var montre = !bataille && !!(options.garder || (d && d.carte && d.carte.isConnected));
    var surBoutons = montre && d && !options.garder ? montrerReponse(q, d) : false;
    if (!montre) zone.innerHTML = "";
    var rj = options.reponse !== undefined ? options.reponse : d ? d.rj : undefined;
    var f = JEU.questions.fiche(q.fiche);
    var justes = bataille && q.type === "association" && rj !== undefined ? pairesJustes(q, rj) : null;
    var bonne = q.type === "association" && q.reponse && q.reponse.length
      ? el("div", { class: "bonne" }, [el("b", { texte: "La bonne réponse :" }), el("ul", { class: "paires" }, q.reponse.map(function (p, k) {
        return el("li", { class: justes && !justes[k] ? "ratee" : null }, [el("b", { texte: q.gauche[p[0]] }), document.createTextNode(" → " + q.droite[p[1]])]);
      }))])
      : surBoutons ? null
      : el("p", { class: "bonne" }, [el("b", { texte: "La bonne réponse : " }), document.createTextNode(texteBonne(q))]);
    var tienne = null;
    if (bataille && rj !== undefined) {
      tienne = justes
        ? el("p", { class: "ta-reponse" }, [el("b", { texte: "Tes paires justes : " }), document.createTextNode(justes.filter(Boolean).length + " sur " + justes.length + " (les autres sont marquées en rouge)")])
        : el("p", { class: "ta-reponse" }, [el("b", { texte: "Ta réponse : " }), el("s", { texte: texteJoueur(q, rj) })]);
    }
    var panneau = el("div", { class: "panneau-erreur" + (montre ? " sous-question" : "") }, [
      el("p", { class: "verdict" }, [el("span", { class: "lettrine", texte: "P" }), "as tout à fait."]),
      tienne,
      bonne,
      repeteReponse(q) ? null : el("p", { class: "explication", texte: q.explication || "" }),
      el("div", { class: "actions" }, [
        el("button", { class: "bouton principal", onclick: continuer }, ["Continuer", ui.astuce("Entrée")]),
        f && !options.sansFiche ? el("button", { class: "bouton", onclick: function () { JEU.codex.ouvrirFiche(q.fiche); }, texte: "Voir la fiche" }) : null,
        el("button", { class: "lien signaler", onclick: function () { JEU.signalement.ouvrir(q); }, texte: "Signaler une erreur" })
      ])
    ]);
    zone.appendChild(panneau);
    ui.nouvelAffichage();
    if (montre) {
      panneau.querySelector(".bouton.principal").focus({ preventScroll: true });
      var haut = zone.querySelector(".question .enonce, .carte-conseil .affirmation, .affirmation");
      if (racine.requestAnimationFrame) racine.requestAnimationFrame(function () { if (panneau.isConnected) garderEnVue(panneau, haut); });
    } else panneau.querySelector(".bouton.principal").focus();
    var fait = false;
    // question restée affichée (hors bataille) : la page, défilée pour l'explication ou pour « Valider », revient en haut,
    // comme à l'entrée d'un écran ; le récit de la question suivante et la barre de partie ne passent pas sous le bandeau
    function continuer() { if (fait) return; fait = true; ui.clavier = null; if (montre) racine.scrollTo(0, 0); suite(); }
    ui.clavier = function (k) { if (k === "Enter" || k === " ") { continuer(); return true; } return false; };
    JEU.sons.jouer("erreur");
  };

  // ---------- partie en cours (bataille, conseil, événement) ----------
  ui.commencerPartie = function (titre, quitter) {
    ui.fermerMissive(true); // jamais de missive pendant une partie (16/10/2026)
    JEU.partie = { enCours: true, titre: titre, quitter: quitter, derniere: null };
    JEU.mesure.debut = null;
    document.body.classList.add("en-partie");
    ui.afficher("partie");
    var s = document.getElementById("ecran-partie");
    s.innerHTML = "";
    var barre = el("div", { class: "barre-partie" }, [
      el("h2", { texte: titre }),
      el("button", { class: "lien signaler", id: "signaler-derniere", hidden: true, onclick: function () { if (JEU.partie.derniere) JEU.signalement.ouvrir(JEU.partie.derniere); }, texte: "Signaler la question précédente" }),
      el("button", { class: "bouton discret", id: "bouton-quitter", onclick: ui.proposerQuitter }, ["Quitter", ui.astuce("Échap")])
    ]);
    s.appendChild(barre);
    var zone = el("div", { class: "zone-partie" });
    s.appendChild(zone);
    return zone;
  };
  // Quitter une partie : confirmation dans la page, puis retour à l'écran d'origine.
  ui.proposerQuitter = function () {
    if (!JEU.partie) return;
    var quitter = JEU.partie.quitter;
    ui.confirmer("Quitter la partie ? Tu gardes tout ce que tu as déjà gagné.", "Quitter", function () {
      if (JEU.partie && JEU.partie.surQuitter) JEU.partie.surQuitter();
      ui.finirPartie(); if (quitter) quitter();
    });
  };
  ui.noterDerniere = function (q) {
    if (!JEU.partie) return;
    JEU.partie.derniere = q;
    var b = document.getElementById("signaler-derniere");
    if (b) b.hidden = false;
  };
  ui.finirPartie = function () {
    JEU.partie = null;
    if (JEU.musique) JEU.musique.humeur("paix");
    noterPlace(); // le menu va revenir : la sortie de l'écran de la partie part de là où on le voyait
    document.body.classList.remove("en-partie");
    ui.clavier = null;
    ui.majRessources();
  };

  // ---------- accueil ----------
  function envoye(d, etat) { return !!(etat.devoirs[d.id] && etat.devoirs[d.id].envoye); }
  function prochainsDevoirs(semaine, etat) {
    return JEU.donnees.devoirs.filter(function (d) { return typeof d.semaine === "number" && d.semaine >= semaine && !envoye(d, etat); })
      .sort(function (a, b) { return a.semaine - b.semaine; });
  }
  // Devoirs sans semaine (grammaire : un devoir par badge Griffon, fait au rythme de l'élève), pas encore envoyés.
  function devoirsSansSemaine(etat) {
    return JEU.donnees.devoirs.filter(function (d) { return typeof d.semaine !== "number" && !envoye(d, etat); });
  }

  ui.ecrans.accueil = function (s) {
    var etat = JEU.sauvegarde.etat();
    var sem = JEU.calendrier.semaine(new Date());
    var devoirs = prochainsDevoirs(sem.numero, etat);
    var prochain = devoirs.length ? devoirs.filter(function (d) { return d.semaine === devoirs[0].semaine; }) : [];
    prochain = prochain.concat(devoirsSansSemaine(etat));
    s.innerHTML = "";
    var nbBat = etat.batiments.length;
    var st = JEU.domaine.stade(nbBat);
    var idx = JEU.domaine.STADES.indexOf(st);
    var valides = JEU.progression.totalAcquis(etat); // même compte que l'écran Cours
    var vues = Object.keys(etat.notions).length;
    s.appendChild(el("div", { class: "accueil-scene" }, [
      el("div", { class: "scene-fond tapisserie", title: "Tapisserie « Le cerf aux abois », vers 1495-1515 (The Met, domaine public)" }),
      el("div", { class: "titre-domaine" }, [
        el("div", { class: "blason-grand", html: JEU.icones.blason(etat.reglages.nomDomaine, 84) }),
        el("div", {}, [
          el("h1", { texte: etat.reglages.nomDomaine || "Le domaine" }),
          el("p", { class: "sous-titre", texte: st.nom + " · " + nbBat + " bâtiment" + (nbBat > 1 ? "s" : "") })
        ])
      ])
    ]));
    s.appendChild(el("div", { class: "cartouches" }, [
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("sablier", 20) + " Calendrier" }), el("p", { class: "grand", texte: JEU.calendrier.libelle(sem) })]),
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("parchemin-plume", 20) + " Prochain devoir" }),
        prochain.length ? el("ul", { class: "liste-simple" }, prochain.map(function (d) {
          return el("li", { texte: d.intitule + (typeof d.semaine === "number" ? " · semaine " + d.semaine : " · à ton rythme") });
        })) : el("p", { texte: "Aucun devoir à venir." })]),
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("trophee", 20) + " Chronique" }),
        el("p", { class: "stats" }, [el("b", { texte: String(valides) }), document.createTextNode(" cours acquis · "),
          el("b", { texte: String(vues) }), document.createTextNode(" notion" + (vues > 1 ? "s" : "") + " vue" + (vues > 1 ? "s" : ""))])])
    ]));
    if (JEU.sauvegarde.exportEnRetard()) {
      s.appendChild(el("div", { class: "rappel" }, [
        el("span", { texte: "Ton dernier export a plus de 7 jours. Exporte ta partie pour que ton père puisse la relire." }),
        el("button", { class: "bouton", onclick: function () { JEU.sauvegarde.exporter(); ui.toast("Partie exportée."); ui.afficher("accueil"); }, texte: "Exporter" })
      ]));
    }
    if (JEU.donnees.erreurs.length || (JEU.donnees.coursAbsents || []).length) {
      s.appendChild(el("p", { class: "note", texte: "Certains fichiers de cours n'ont pas pu être chargés : ces cours restent dans la brume." }));
    }
    var jouer = el("button", { class: "bouton principal enorme", onclick: function () { ui.afficher("jouer"); }, html: JEU.icones.icone("jouer", 34) + "<span>Jouer</span>" });
    s.appendChild(el("div", { class: "centre" }, [jouer]));
    // Au clavier, Entrée lance le jeu. Sur une tablette (pas de clavier), pas de focus : il faisait défiler la page pour
    // montrer le bouton, et le menu passait sous le bandeau dès l'ouverture (à moitié en 1280 × 800, en entier en 1024 × 768).
    // preventScroll (lot C) : le focus ne fait jamais défiler la page, le menu reste visible à l'ouverture
    if (!ui.tactile) setTimeout(function () { jouer.focus({ preventScroll: true }); }, 0);
    ui.clavier = function (k) { if (k === "Enter") { ui.afficher("jouer"); return true; } return false; };
  };

  // L'écran « jouer » (la campagne) est dans ecran-campagne.js.

  // ---------- liste des cours ----------
  var ongletCours = "histoire";
  var LIBELLES = { presume: "Présumé acquis", acquis: "Acquis", "a-revoir": "À revoir", ouvert: "En cours", avenir: "Contenu à venir", brume: "Dans la brume" };

  ui.ecrans.cours = function (s) {
    var etat = JEU.sauvegarde.etat();
    var sem = JEU.calendrier.semaine(new Date());
    s.innerHTML = "";
    s.appendChild(el("h1", { texte: "Les cours" }));
    s.appendChild(el("p", { class: "note", texte: "Le chroniqueur estime d'après tes devoirs corrigés si un cours est acquis ou à revoir. Les notions à revoir reviennent plus souvent dans tes batailles et au conseil. Le calendrier n'est qu'un repère : tu avances à ton rythme." }));
    var onglets = el("div", { class: "onglets", role: "tablist" });
    var liste = ["methode"].concat(JEU.ORDRE_MATIERES);
    liste.forEach(function (m) {
      var nom = m === "methode" ? "Savoir-faire" : JEU.MATIERES[m].nom;
      onglets.appendChild(el("button", { class: "onglet" + (m === ongletCours ? " actif" : ""), role: "tab",
        style: "--teinte:" + (m === "methode" ? "#b08d3a" : JEU.MATIERES[m].couleur),
        onclick: function () { ongletCours = m; ui.ecrans.cours(s); }, texte: nom }));
    });
    s.appendChild(onglets);
    var zone = el("div", { class: "liste-cours" });
    s.appendChild(zone);
    if (ongletCours === "methode") return rendreMethodes(zone, etat);
    if (ongletCours === "anglais") return rendreAnglais(zone, etat);
    if (ongletCours === "langue") return rendreLangue(zone, etat);
    zone.appendChild(lignePosition(ongletCours, etat));
    var parSemaine = {};
    JEU.donnees.planning.filter(function (p) { return p.matiere === ongletCours; }).forEach(function (p) {
      (parSemaine[p.semaine] = parSemaine[p.semaine] || []).push(p);
    });
    Object.keys(parSemaine).map(Number).sort(function (a, b) { return a - b; }).forEach(function (w) {
      var bloc = el("div", { class: "semaine-bloc" + (w === sem.numero ? " courante" : "") }, [el("h3", { texte: "Semaine " + w + (w === sem.numero ? " · cette semaine" : "") })]);
      parSemaine[w].sort(function (a, b) { return a.ordre - b.ordre; }).forEach(function (p) { bloc.appendChild(ligneEntree(p, etat)); });
      zone.appendChild(bloc);
    });
    var courante = zone.querySelector(".courante");
    // le titre de la semaine et son fanion s'arrêtent sous le bandeau collant, quelle que soit sa hauteur (deux ou trois
    // lignes en largeur étroite) ; la sangle du menu, elle, défile avec la page
    if (courante) setTimeout(function () {
      var b = document.getElementById("bandeau");
      courante.style.scrollMarginTop = (b ? b.offsetHeight : 0) + 12 + "px";
      courante.scrollIntoView({ block: "start" });
    }, 0);
  };

  function ligneEntree(p, etat) {
    if (p.type === "revision") {
      return el("div", { class: "ligne-cours revision" }, [el("span", { texte: p.titre }), el("span", { class: "etat", texte: "Révision" })]);
    }
    if (p.type === "devoir") {
      return el("div", { class: "ligne-cours devoir" }, [el("span", { texte: p.titre }), el("span", { class: "etat", texte: "Devoir" })]);
    }
    var st = JEU.progression.etatCours(p.id, etat);
    var ligne = el("div", { class: "ligne-cours etat-" + st });
    ligne.appendChild(el("span", { class: st === "brume" ? "titre-brume" : "", texte: p.titre }));
    ligne.appendChild(etiquetteCours(p.id, st));
    return ligne;
  }

  // Compte neutre de l'onglet (le même que l'accueil) : aucune avance ni aucun retard sur le calendrier.
  function lignePosition(onglet, etat, phrase) {
    var pos = JEU.progression.position(onglet, etat);
    var morceaux = [pos.acquis + " acquis"];
    if (pos.presumes) morceaux.push(pos.presumes + (pos.presumes > 1 ? " présumés acquis" : " présumé acquis"));
    if (pos.aRevoir) morceaux.push(pos.aRevoir + " à revoir");
    if (pos.enCours) morceaux.push(pos.enCours + " en cours");
    var texte = pos.total ? "Sur " + pos.total + " cours : " + morceaux.join(", ") + "." : "";
    if (phrase) texte = phrase + (texte ? " " + texte : "");
    return el("p", { class: "position", texte: texte });
  }

  // État du cours, en lecture seule, avec la remarque du chroniqueur s'il y en a une.
  function etiquetteCours(id, st) {
    var est = JEU.progression.estimation(id);
    var t = LIBELLES[st] || st;
    if (st === "presume" && !JEU.donnees.cours[id]) t += " · contenu à venir";
    return el("span", { class: "etat " + st, title: est && est.note ? est.note : "", texte: t + (est && est.note && st === "a-revoir" ? " · " + est.note : "") });
  }

  function rendreMethodes(zone, etat) {
    var ms = JEU.progression.methodes();
    zone.appendChild(lignePosition("methode", etat, "Les savoir-faire sont ouverts d'emblée et reviennent dans toutes tes batailles."));
    if (!ms.length) zone.appendChild(el("p", { texte: "Contenu à venir." }));
    ms.forEach(function (c) {
      var st = JEU.progression.etatCours(c.id, etat);
      zone.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
        el("span", {}, [el("span", { class: "pastille", style: "--teinte:" + JEU.MATIERES[c.matiere].couleur, texte: JEU.MATIERES[c.matiere].nom }), document.createTextNode(" " + c.titre)]),
        etiquetteCours(c.id, st)
      ]));
    });
  }

  function rendreAnglais(zone, etat) {
    var seq = JEU.progression.sequencesAnglais();
    zone.appendChild(lignePosition("anglais", etat, "Chaque séquence s'ouvre dès que son contenu est prêt."));
    if (!seq.length) zone.appendChild(el("p", { texte: "Contenu à venir : les séquences d'anglais n'ont pas encore été déposées." }));
    seq.forEach(function (c) {
      var st = JEU.progression.etatCours(c.id, etat);
      zone.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
        el("span", { class: st === "brume" ? "titre-brume" : "", texte: c.titre }),
        etiquetteCours(c.id, st)
      ]));
    });
  }

  // Grammaire et conjugaison : pas de semaines, les cours sont rangés sous leur badge Griffon (seulement les badges qui
  // ont au moins un cours), dans l'ordre du badge. Chaque cours s'ouvre dès que son contenu est prêt.
  function rendreLangue(zone, etat) {
    var groupes = JEU.progression.groupesLangue();
    zone.appendChild(lignePosition("langue", etat, "Tes cours de grammaire et de conjugaison sont rangés par badge Griffon. Chacun s'ouvre dès que son contenu est prêt."));
    if (!groupes.length) zone.appendChild(el("p", { texte: "Contenu à venir : les cours de grammaire n'ont pas encore été déposés." }));
    groupes.forEach(function (g) {
      var bloc = el("div", { class: "semaine-bloc badge-bloc", "data-badge": g.badge }, [el("h3", { texte: g.nom })]);
      g.cours.forEach(function (c) {
        var st = JEU.progression.etatCours(c.id, etat);
        bloc.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
          el("span", { class: st === "brume" ? "titre-brume" : "", texte: c.titre || c.id }),
          etiquetteCours(c.id, st)
        ]));
      });
      zone.appendChild(bloc);
    });
  }

  // ---------- réglages ----------
  ui.ecrans.reglages = function (s) {
    var etat = JEU.sauvegarde.etat();
    s.innerHTML = "";
    s.appendChild(el("h1", { texte: "Réglages et sauvegarde" }));
    var nom = el("input", { type: "text", value: etat.reglages.nomDomaine || "", maxlength: "40" });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Nom du domaine" }), nom,
      el("button", { class: "bouton", onclick: function () {
        etat.reglages.nomDomaine = nom.value.trim() || "Le domaine"; JEU.sauvegarde.enregistrer(); ui.majRessources(); ui.toast("Nom enregistré.");
      }, texte: "Enregistrer" })
    ]));
    var fichier = el("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: function () {
      var f = fichier.files[0];
      if (!f) return;
      var lecteur = new FileReader();
      lecteur.onload = function () {
        ui.confirmer("Importer cette sauvegarde ? Elle remplace la partie en cours.", "Importer", function () {
          // importer() ne lance que des messages en français, écrits pour l'élève ; la partie en cours reste alors intacte.
          try { JEU.sauvegarde.importer(lecteur.result); } catch (e) { ui.message("Import impossible", e.message); return; }
          JEU.progression.oublier();
          ui.appliquerReglages();
          ui.majRessources();
          ui.toast("Sauvegarde importée.");
          ui.afficher("accueil");
        });
      };
      lecteur.readAsText(f);
      fichier.value = ""; // le même fichier pourra être choisi de nouveau
    } });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Sauvegarde" }),
      el("p", { texte: "Ta partie est enregistrée dans ce navigateur. Exporte-la chaque semaine : ton père la dépose dans DEPOT\\sauvegardes." }),
      el("p", { class: "note", texte: etat.dernierExport ? "Dernier export : " + etat.dernierExport.replace("T", " à ") : "Aucun export pour l'instant." }),
      el("div", { class: "actions" }, [
        el("button", { class: "bouton principal", onclick: function () { JEU.sauvegarde.exporter(); ui.toast("Partie exportée."); ui.ecrans.reglages(s); }, texte: "Exporter" }),
        el("button", { class: "bouton", onclick: function () { fichier.click(); }, texte: "Importer" }), fichier
      ]),
      el("p", { class: "note", texte: "Signalements en attente : " + etat.signalements.length + ". Ils partent avec l'export." })
    ]));
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Devoirs envoyés" }),
      el("p", { class: "note", texte: "Coche un devoir quand tu l'as envoyé, avec la date, comme sur le plan des devoirs papier." }),
      listeDevoirs(etat)
    ]));
    var animCase = el("input", { type: "checkbox", "data-reglage": "animations", checked: etat.reglages.animations !== false, onchange: function () {
      etat.reglages.animations = animCase.checked; JEU.sauvegarde.enregistrer(); ui.appliquerAnimations();
      ambCase.disabled = !animCase.checked;
    } });
    // Ambiance (lot C, 01/11/2026 ; absent d'une ancienne sauvegarde : actif) : ce qui bouge sans raison de jeu. Animations
    // décoché coupe aussi l'ambiance : la case est alors grisée, sans changer sa valeur.
    // Le régulateur des écrans a pu couper l'ambiance pour la séance (l'appareil peinait) : une note le dit, et recocher la
    // case est un geste voulu, qui rend l'ambiance et une nouvelle mesure au régulateur (chasse aux bugs du lot C).
    var regEcrans = JEU.anim && JEU.anim.regulateur;
    var ambNote = regEcrans && regEcrans.coupe && etat.reglages.ambiance !== false && etat.reglages.animations !== false ?
      el("p", { class: "note", texte: "L'ambiance est coupée pour cette séance : l'appareil peinait. Décoche puis recoche « Ambiance » pour la rallumer." }) : null;
    var ambCase = el("input", { type: "checkbox", "data-reglage": "ambiance", checked: etat.reglages.ambiance !== false, disabled: etat.reglages.animations === false, onchange: function () {
      etat.reglages.ambiance = ambCase.checked; JEU.sauvegarde.enregistrer();
      if (ambCase.checked && regEcrans && regEcrans.coupe) { regEcrans.reinitialiser(); if (ambNote) ambNote.remove(); }
      ui.appliquerAnimations(); // les écrans à ambiance se redessinent quand on y revient
    } });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Animations" }),
      el("label", {}, [animCase, el("span", { texte: " Animations (sceaux, pièces d'or, gestes des soldats, changements d'écran)" })]),
      el("label", { class: "reglage-ambiance" }, [ambCase, el("span", { texte: " Ambiance (nuages, fumées, oiseaux, drapeaux)" })]),
      ambNote,
      el("p", { class: "note", texte: "À décocher si l'ordinateur rame ou si le mouvement gêne. « Ambiance » ne coupe que les décors qui bougent ; « Animations » coupe tout. Le jeu reste aussi rapide dans tous les cas." })
    ]));
    // sang dans les combats (absent d'une ancienne sauvegarde : actif)
    var sangCase = el("input", { type: "checkbox", "data-reglage": "sang", checked: etat.reglages.sang !== false, onchange: function () {
      etat.reglages.sang = sangCase.checked; JEU.sauvegarde.enregistrer();
    } });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Combats" }),
      el("label", {}, [sangCase, el("span", { texte: " Sang dans les combats" })]),
      el("p", { class: "note", texte: "Coché : un peu de sang quand un soldat est blessé au corps à corps ou tombe, et les soldats tombés restent quelques secondes au sol. Décoché : pas de sang du tout, les soldats tombés s'effacent vite dans un peu de poussière." })
    ]));
    // missives des personnages de la campagne (16/10/2026 ; absent d'une ancienne sauvegarde : actif)
    var rivauxCase = el("input", { type: "checkbox", "data-reglage": "rivaux", checked: etat.reglages.rivaux !== false, onchange: function () {
      etat.reglages.rivaux = rivauxCase.checked; JEU.sauvegarde.enregistrer();
      if (!rivauxCase.checked && JEU.campagne && JEU.campagne.oublierMissives) JEU.campagne.oublierMissives();
    } });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Campagne" }),
      el("label", {}, [rivauxCase, el("span", { texte: " Messages des rivaux" })]),
      el("p", { class: "note", texte: "Coché : ton souverain et tes rivaux t'écrivent de temps en temps (avant une bataille sur deux, après une bataille, quand une province tombe). Décoché : plus de lettres ; leurs médaillons et la rivalité restent sur la carte." })
    ]));
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Crédits" }),
      el("p", { texte: "Icônes de Game-icons.net (Lorc, Delapouite et d'autres auteurs, licence CC BY 3.0). Tapisseries, œuvres et portraits des souverains du Metropolitan Museum of Art (domaine public, CC0). Polices Cinzel et Crimson Text (SIL Open Font License). Sons, musique, textures, cartes et blasons créés pour ce jeu (CC0). Détail dans CREDITS.md." }),
      el("p", { class: "note", texte: "Version " + (JEU.version || "") })
    ]));
  };

  function listeDevoirs(etat) {
    var liste = el("div", { class: "liste-devoirs" });
    // devoirs datés par semaine d'abord, puis ceux de grammaire (sans semaine : un par badge Griffon)
    function rang(d) { return typeof d.semaine === "number" ? d.semaine : 99; }
    JEU.donnees.devoirs.slice().sort(function (a, b) { return rang(a) - rang(b); }).forEach(function (d) {
      var info = etat.devoirs[d.id];
      var date = el("input", { type: "date", value: info && info.envoye ? info.envoye : U.jour() });
      var cb = el("input", { type: "checkbox", checked: !!(info && info.envoye), onchange: maj });
      function maj() {
        if (cb.checked) etat.devoirs[d.id] = { envoye: date.value || U.jour() };
        else delete etat.devoirs[d.id];
        JEU.sauvegarde.enregistrer();
      }
      date.addEventListener("change", function () { if (cb.checked) maj(); });
      liste.appendChild(el("div", { class: "ligne-devoir" }, [el("label", {}, [cb, el("span", { texte: (typeof d.semaine === "number" ? " S" + d.semaine + " · " : " ") + d.intitule })]), date]));
    });
    return liste;
  }

  ui.appliquerAnimations = function () {
    var actif = !!(JEU.anim && JEU.anim.actif());
    document.body.classList.toggle("sans-anim", !actif);
    // ambiance coupée (réglage « Ambiance », Animations coupées ou régulateur des écrans, lot C) : nuages, fumées, oiseaux,
    // drapeaux, poussières et villageois s'arrêtent sur place (feuilles de style, body.sans-ambiance)
    document.body.classList.toggle("sans-ambiance", !(JEU.anim && JEU.anim.ambiance && JEU.anim.ambiance()));
    // animations coupées : ce qui s'efface encore (écran qui sort, fenêtre qui se ferme) part tout de suite (chasse aux
    // bugs du lot B : sans animation, aucun animationend, et l'ancien écran restait opaque jusqu'à la minuterie de secours)
    if (!actif) { sorties.slice().forEach(finirSortie); if (minuterieModale) cacherModale(); }
  };
  // la préférence du système change pendant la partie : la classe suit (JEU.anim.actif() la relit à chaque appel)
  try { racine.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function () { ui.appliquerAnimations(); }); } catch (e) { /* navigateur ancien */ }

  // Après un import : la musique et les animations suivent tout de suite les réglages de la sauvegarde.
  // (L'import est confirmé par un clic : le navigateur autorise alors le son.)
  ui.appliquerReglages = function () {
    if (JEU.musique) { if (JEU.musique.actif()) JEU.musique.demarrer(); else JEU.musique.arreter(); }
    ui.appliquerAnimations();
  };

  // Les polices sont toutes chargées dès l'ouverture, et non à leur premier emploi (en pleine bataille, ou sur la
  // carte) : aucun texte ne change de police, et la page n'est pas remise en forme, pendant une partie.
  try { if (document.fonts && document.fonts.forEach) document.fonts.forEach(function (f) { f.load().catch(function () { /* police absente : repli */ }); }); } catch (e) { /* navigateur ancien */ }

  // ---------- mesure du temps entre une réponse et la question suivante ----------
  JEU.mesure = {
    debut: null, valeurs: [],
    reponseDonnee: function () { this.debut = (racine.performance || Date).now(); },
    questionAffichee: function () {
      if (this.debut == null) return;
      this.valeurs.push((racine.performance || Date).now() - this.debut);
      this.debut = null;
    }
  };

  // ---------- habillage des menus (lot B, B4, 31/10/2026 ; jeu/css/menus.css) ----------
  // L'onde au toucher : un anneau d'or s'ouvre sous le doigt (340 ms) sur ce qui se touche dans les menus (menu, boutons
  // du bandeau, onglets, boutons, cases, tomes, fiches du Codex, cartes de la campagne). Jamais sur une réponse, le
  // panneau d'erreur, le conseil ni la bataille : rien ne s'ajoute entre la réponse et la question suivante. Un seul
  // élément pour tout le jeu, créé au premier appui ; aucune lecture de mise en page (la place vient de l'événement) ;
  // lancé à l'image suivante par l'API Web Animations. Doigt ou stylet seulement ; rien sans animations.
  var onde = null, ondeAnim = null;
  var CIBLES_ONDE = "#menu button, #bandeau button, .onglet, .bouton, .codex-entete, .vignette, label, .carte-jeu";
  var HORS_ONDE = "#ecran-partie, .question, .panneau-erreur, .scene-conseil, .td-cadre, .choix";
  document.addEventListener("pointerdown", function (ev) {
    if (ev.pointerType !== "touch" && ev.pointerType !== "pen") return;
    if (!(JEU.anim && JEU.anim.actif()) || (JEU.partie && JEU.partie.enCours)) return;
    var t = ev.target;
    if (!t || !t.closest || !t.closest(CIBLES_ONDE) || t.closest(HORS_ONDE)) return;
    var x = ev.clientX, y = ev.clientY;
    (racine.requestAnimationFrame || setTimeout)(function () {
      if (!onde) {
        onde = document.createElement("div");
        onde.className = "onde";
        onde.setAttribute("aria-hidden", "true");
        document.body.appendChild(onde);
      }
      if (ondeAnim) ondeAnim.cancel();
      if (!onde.animate) return;
      var p = "translate(" + x + "px, " + y + "px) ";
      ondeAnim = onde.animate([{ transform: p + "scale(.25)", opacity: 1 }, { transform: p + "scale(1)", opacity: 0 }], { duration: 340, easing: "ease-out" });
    });
  }, { capture: true, passive: true });
})(typeof window !== "undefined" ? window : globalThis);
