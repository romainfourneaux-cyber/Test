// Écran de la campagne (menu « Campagne ») : carte des deux fronts (royaume d'Angleterre à l'ouest,
// Empire omeyyade au sud), alerte d'attaque, conseil du royaume, arsenal, événement du jour, jauges et chronique.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  // Position de chaque lieu (pied du bourg) sur le fond de carte rendu en 3D (1000 × 530) : le domaine dans les champs
  // de l'ouest ; le front de l'ouest (royaume d'Angleterre) sur les terres vertes du nord, au-dessus de l'escarpement ;
  // le front du sud (Empire omeyyade) sur les terres sèches du sud, entre l'escarpement et le fleuve.
  // Les noms sont sous les lieux : deux lieux voisins trop proches en largeur pour leurs noms sont décalés en hauteur
  // (col et château), pour que deux étiquettes restent séparées de 8 px au moins (contrôle dans perf.js), et chaque
  // nom est plus près de son lieu que de tout autre. Aucun bourg ni aucun nom n'est posé sur l'eau : le Gué est sur la
  // rive ouest de la rivière, le Moulin du Val sur la berge sud de son ruisseau. La Citadelle du Sud est remontée au
  // pied de l'escarpement, loin du fleuve, son nom dessous (au-dessus du bourg, il tombait entre elle et le Grand
  // Fleuve) ; les noms du Grand Fleuve et de la Forteresse omeyyade sont au-dessus de leur lieu : aucun ne se lit dans
  // le prolongement de celui de la Citadelle.
  var POSITIONS = {
    domaine: [122, 258],
    gue: [244, 116], foret: [404, 100], moulin: [585, 178], col: [712, 87], chateau: [870, 141],
    piemont: [262, 380], oliveraie: [418, 404], fleuve: [566, 366], citadelle: [740, 380], forteresse: [868, 356]
  };
  // En repli (médaillons, plus grands que les bourgs), les noms gardent leur ancienne place : celui de la Citadelle
  // au-dessus (dessous, il tomberait dans le fleuve), les autres dessous.
  var NOM_DESSUS = { fleuve: true, forteresse: true }, NOM_DESSUS_REPLI = { forteresse: true };
  function nomDessus(id, repli) { return !!(repli ? NOM_DESSUS_REPLI : NOM_DESSUS)[id]; }
  var L = 1000, H = 530;
  function camp(c) { return JEU.campagne.CAMPS[c]; }
  // Image décrite dans sprites.js, sauf si elle a déjà manqué (fichier absent ou illisible) : on dessine alors
  // directement le repli (ancien fond sépia, médaillon), sans montrer d'image cassée.
  var manquees = {};
  function image(nom) { var s = JEU.SPRITES && JEU.SPRITES[nom]; return s && !manquees[s.src] ? s : null; }
  // Bourg d'une province prise : trois variantes du bourg de France, alternées le long de chaque front (deux lieux
  // voisins n'ont jamais le même) ; le domaine garde la première.
  function variante(p) {
    var k = ((p.niveau || 0) + (p.front === "omeyyades" ? 2 : 1)) % 3 + 1;
    return k > 1 && image("lieu-france-" + k) ? "france-" + k : "france";
  }

  // Chemins en pointillés d'un lieu au suivant. Les noms sont sous les lieux : le chemin ondule au-dessus d'eux.
  // Le premier tronçon quitte le domaine sans couper son nom (point de contrôle propre à chaque front).
  // Un tronçon qui mène à un lieu dans la brume est plus pâle : on devine le chemin, sans qu'il barre la nappe.
  var DEPARTS = { angleterre: [132, 126], omeyyades: [292, 256] };
  function route(frontId, ids, brume) {
    var net = "", pale = "";
    for (var i = 1; i < ids.length; i++) {
      var a = POSITIONS[ids[i - 1]], b = POSITIONS[ids[i]];
      var q = i === 1 && DEPARTS[frontId] ? DEPARTS[frontId] : [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 22];
      var d = "M" + a.join(" ") + " Q" + q[0] + " " + q[1] + " " + b[0] + " " + b[1] + " ";
      if (brume[ids[i]]) pale += d; else net += d;
    }
    function trace(d, opacite) {
      return d ? "<g opacity='" + opacite + "'><path d='" + d + "' fill='none' stroke='#2e2419' stroke-width='9' stroke-linecap='round' opacity='.55'/>" +
        "<path d='" + d + "' fill='none' stroke='#efe2bc' stroke-width='4' stroke-dasharray='2 12' stroke-linecap='round'/></g>" : "";
    }
    return trace(pale, ".35") + trace(net, "1");
  }

  // Brouillard de guerre : sous chaque nappe de brume (et entre deux lieux voisins encore dans la brume, pour un voile
  // continu qui se retire province par province), le terrain est voilé et désaturé. Copie du fond 3D passée au gris
  // clair, découpée par un masque fait des nappes elles-mêmes.
  function voileBrume(c, brume, fond) {
    var nappe = image("lieu-brume");
    if (!fond || !nappe) return "";
    var C = JEU.campagne, poses = [];
    C.FRONTS.forEach(function (f) {
      var ids = ["domaine"].concat(f.provinces.map(function (p) { return p.id; }));
      ids.forEach(function (id, i) {
        if (!brume[id]) return;
        var p = POSITIONS[id];
        poses.push([p[0], p[1], 1.15]);
        if (i > 0 && brume[ids[i - 1]]) { var q = POSITIONS[ids[i - 1]]; poses.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 8, 0.95]); }
      });
    });
    if (!poses.length) return "";
    var m = "<mask id='masqueBrume' maskUnits='userSpaceOnUse' x='0' y='0' width='" + L + "' height='" + H + "'>" +
      poses.map(function (p) {
        var w = nappe.w * p[2], h = nappe.h * p[2];
        return "<image href='" + nappe.src + "' x='" + (p[0] - nappe.ax * p[2]) + "' y='" + (p[1] - nappe.ay * p[2]) + "' width='" + w + "' height='" + h + "'/>";
      }).join("") + "</mask>";
    // nappes intermédiaires (entre deux lieux dans la brume) : dessinées aussi, plus pâles
    var entre = poses.filter(function (p) { return p[2] < 1; }).map(function (p) {
      return "<image class='nappe-entre' href='" + nappe.src + "' x='" + (p[0] - nappe.ax * p[2]) + "' y='" + (p[1] - nappe.ay * p[2]) + "' width='" + nappe.w * p[2] + "' height='" + nappe.h * p[2] + "' opacity='.7'/>";
    }).join("");
    return "<defs>" + m + "</defs><image class='voile-brume' href='" + fond.src + "' x='0' y='0' width='" + L + "' height='" + H +
      "' preserveAspectRatio='none' filter='url(#grisBrume)' mask='url(#masqueBrume)'/>" + entre;
  }

  // ---------- carte vivante (lot B, 31/10/2026 ; plan atelier/conception/graphismes-animations-plan.md, B3) ----------
  // Ambiance (JEU.anim.ambiance) : fumées du domaine et des bourgs pris, nappes de brume qui dérivent, vol d'oiseaux,
  // bannières qui flottent, eau qui scintille. Cérémonie de conquête, cachet et lueur de l'événement du jour :
  // JEU.anim.actif(). Ce qui bouge en continu est dans un calque HTML posé sur le dessin (.vie-carte, même cadre, positions
  // en %) et n'anime que transform et opacity : le compositeur le fait seul, sans rien demander au fil principal. Mesuré au
  // ralenti 4 × : tout ce qui force une image du fil principal (une animation de stroke-dashoffset, un minuteur qui change
  // un style) y fait recalculer le style de chaque élément animé (0,1 ms chacun) et repeindre la carte (5 à 28 ms). D'où :
  // aucun minuteur ni stroke-dashoffset ; l'eau scintille par l'opacité, les bannières changent d'image par une animation
  // en steps() ; et le moins d'éléments animés possible (une nappe de brume par front, trois fumées, un vol d'oiseaux en
  // trois éléments). Les boucles s'arrêtent d'elles-mêmes quand l'écran est caché. Lumière du jour : une teinte fixe.
  var vie = null; // pendant carteSVG : { ambiance, drapeaux, recents, fond, bannieres, fumees, nappes, etiquettes } (ui.ecrans.jouer)
  var DUREE_CEREMONIE = 1350; // la missive du rival attend la fin de la cérémonie (comptée depuis son début)
  // cheminée des trois bourgs de France, en px logiques depuis le coin haut-gauche de l'image (relevée sur les rendus) ;
  // fument le domaine et les deux dernières provinces prises
  var CHEMINEES = { "france": [22, 49], "france-2": [20, 44], "france-3": [20, 46] };
  // l'eau, relevée sur fond-campagne.jpg (ligne médiane des pixels d'eau, lissée), dans le sens du courant : la rivière de
  // sa source au fleuve, le ruisseau du Moulin jusqu'à elle, le fleuve d'est en ouest ; chaque trait a son cadre serré
  // (x, y, largeur, hauteur) : le compositeur ne recompose que là
  var EAU = {
    riviere: "M351 24C349 27 344 36 341 42C338 48 336 55 333 62C331 69 328 75 326 82C323 89 322 95 320 102C319 109 316 115 314 122C312 129 311 135 310 142C309 149 311 156 308 162C306 168 299 175 294 180C289 185 283 188 278 192C272 196 265 201 260 206C255 211 250 216 247 222C243 228 241 234 237 240C234 246 229 250 225 256C220 262 215 268 212 274C208 280 207 288 204 294C200 300 197 306 192 312C188 318 181 322 176 328C172 334 167 340 164 346C161 352 160 359 159 366C158 373 158 379 158 386C158 393 160 399 160 406C160 413 160 420 159 426C159 432 156 439 155 442",
    ruisseau: "M694 56C691 57 684 61 678 64C672 67 665 72 658 75C651 79 645 82 638 85C631 88 625 92 618 95C611 99 605 103 598 106C591 108 583 109 576 110C569 112 561 114 554 116C547 119 541 123 534 126C527 129 519 132 512 134C505 136 497 137 490 138C483 140 475 142 468 144C461 145 453 147 446 148C439 150 431 151 424 152C417 154 409 154 402 155C395 156 387 158 380 160C373 161 365 163 358 164C351 165 343 166 336 165C329 163 318 157 314 156",
    fleuve: "M972 470C968 469 957 469 950 467C943 464 937 457 930 454C923 451 915 451 908 450C901 449 893 448 886 446C879 444 871 438 864 437C857 436 849 436 842 437C835 439 829 444 822 448C815 451 807 456 800 458C793 459 785 458 778 459C771 460 763 464 756 465C749 467 741 469 734 469C727 468 719 466 712 462C705 459 700 453 694 449C688 445 681 442 674 438C667 435 661 433 654 429C647 425 641 419 634 415C627 412 619 410 612 408C605 406 597 404 590 404C583 404 575 405 568 407C561 409 553 413 546 416C539 419 531 423 524 424C517 425 509 425 502 425C495 426 487 426 480 428C473 429 465 432 458 435C451 438 445 444 438 447C431 450 423 450 416 451C409 453 401 453 394 456C387 459 379 465 372 466C365 468 357 464 350 463C343 462 335 463 328 460C321 458 315 454 308 450C301 447 293 443 286 441C279 438 271 436 264 436C257 437 249 439 242 443C235 446 229 453 222 456C215 458 207 457 200 457C193 457 185 457 178 457C171 457 163 458 156 458C149 459 141 459 134 459C127 459 119 458 112 459C105 460 97 460 90 462C83 463 75 467 68 469C61 471 53 474 46 475C39 476 28 474 24 474"
  };
  var EAU_CADRES = { riviere: [150, 18, 206, 430], ruisseau: [308, 50, 392, 122], fleuve: [18, 396, 960, 86] };
  var EAU_TIRETS = { riviere: "3 16 1.5 22", ruisseau: "2 14 1 18", fleuve: "5 19 2 27 3 23" };
  // Images de la carte vivante (bourgs avec et sans bannière, bandes des bannières, nappe de brume), demandées et décodées
  // au chargement du jeu (règle du projet : tout est chargé au lancement) : la première carte n'attend ni lecture ni
  // décodage. Gardées dans le module.
  var prechargees = [];
  (function () {
    if (typeof Image === "undefined" || !JEU.SPRITES) return;
    Object.keys(JEU.SPRITES).filter(function (n) { return /^(lieu|drapeau)-/.test(n); }).forEach(function (n) {
      var im = new Image();
      im.src = JEU.SPRITES[n].src;
      prechargees.push(im);
      if (im.decode) im.decode().catch(function () { /* image absente : la carte prend son repli */ });
    });
  })();
  function ambianceActive() { return !!(JEU.anim && JEU.anim.ambiance && JEU.anim.ambiance()); }
  function animActive() { return !!(JEU.anim && JEU.anim.actif && JEU.anim.actif()); }
  function drapeauxPrets() { return ["france", "angleterre", "omeyyades"].every(function (k) { return !!image("drapeau-" + k); }); }
  function pc(v, total) { return Math.round(v / total * 10000) / 100 + "%"; }
  function cadre(x, y, w, h) { return "left:" + pc(x, L) + ";top:" + pc(y, H) + ";width:" + pc(w, L) + ";height:" + pc(h, H) + ";"; }

  // Lumière du jour : aube dorée avant 10 h (de l'est), plein jour, soir cuivré à partir de 18 h (de l'ouest) ; multipliée
  // sur le terrain, sous les routes, les bourgs et les noms. Aucune animation.
  var LUMIERES = {
    aube: { x1: 1, x2: 0, de: "#efb088", a: "#fff4ea", op: 0.16 },
    jour: { x1: 0, x2: 1, de: "#f6dfae", a: "#ffffff", op: 0.12 },
    soir: { x1: 0, x2: 1, de: "#cf8048", a: "#f3d2b2", op: 0.2 }
  };
  function moment(heure) { return heure < 10 ? "aube" : heure < 18 ? "jour" : "soir"; }
  function lumiereSVG(heure) {
    var m = moment(heure), l = LUMIERES[m];
    return "<defs><linearGradient id='lumiereC' x1='" + l.x1 + "' y1='0' x2='" + l.x2 + "' y2='.5'><stop offset='0' stop-color='" + l.de + "'/>" +
      "<stop offset='1' stop-color='" + l.a + "'/></linearGradient></defs><rect class='lumiere-jour " + m + "' width='" + L + "' height='" + H +
      "' fill='url(#lumiereC)' opacity='" + l.op + "' style='mix-blend-mode:multiply' pointer-events='none'/>";
  }
  // Eau qui scintille : des reflets clairs en pointillés le long de la rivière, du ruisseau et du fleuve, chacun dans son
  // petit SVG du calque de vie, qui s'allume et s'éteint à son rythme (opacité de l'élément entier : le compositeur seul ;
  // une animation dans le dessin le ferait repeindre à chaque image). Le calque passe au-dessus des noms : un masque fixe
  // efface les reflets sous chaque nom et chaque ligne dessous (largeur estimée d'après le nombre de lettres).
  function eauHTML(etiquettes) {
    return ["riviere", "ruisseau", "fleuve"].map(function (k, i) {
      var b = EAU_CADRES[k], id = "masqueEau-" + k;
      var trous = etiquettes.filter(function (e) { return e.x + e.w / 2 > b[0] && e.x - e.w / 2 < b[0] + b[2] && e.y + 7 > b[1] && e.y - 17 < b[1] + b[3]; });
      var masque = trous.length ? "<defs><mask id='" + id + "' maskUnits='userSpaceOnUse' x='" + b[0] + "' y='" + b[1] + "' width='" + b[2] + "' height='" + b[3] + "'>" +
        "<rect x='" + b[0] + "' y='" + b[1] + "' width='" + b[2] + "' height='" + b[3] + "' fill='#fff'/>" + trous.map(function (e) {
          return "<rect x='" + Math.round(e.x - e.w / 2) + "' y='" + Math.round(e.y - 17) + "' width='" + Math.round(e.w) + "' height='24' fill='#000'/>";
        }).join("") + "</mask></defs>" : "";
      return "<svg class='eau-vive e" + i + "' style='" + cadre(b[0], b[1], b[2], b[3]) + "' viewBox='" + b.join(" ") + "' preserveAspectRatio='none'>" + masque +
        "<path d='" + EAU[k] + "'" + (masque ? " mask='url(#" + id + ")'" : "") + " fill='none' stroke='#f3f7ee' stroke-linecap='round' stroke-width='" + (k === "fleuve" ? 2.1 : 1.5) +
        "' stroke-dasharray='" + EAU_TIRETS[k] + "'/></svg>";
    }).join("");
  }

  // Ce qu'un lieu dessiné par noeud() apporte au calque de vie : sa bannière, sa fumée, sa nappe de brume.
  function noterVie(id, lieu, campLieu, x0, y0, sp, nu) {
    if (nu) vie.bannieres.push({ id: id, camp: campLieu, x: x0 + nu.hampe[0], y: y0 + nu.hampe[1] });
    if (!vie.ambiance) return;
    var ch = CHEMINEES[lieu];
    if (ch && (id === "domaine" || vie.recents.indexOf(id) >= 0)) vie.fumees.push([x0 + ch[0], y0 + ch[1]]);
    var p = lieu === "brume" && JEU.campagne.province(id);
    if (p) vie.nappes.push({ front: p.front, x: x0, y: y0, w: sp.w, h: sp.h });
  }
  // Bannière d'un bourg : la bande de six images dans une fenêtre d'une image, ancrée au pied du mât (sa hampe). phase :
  // 0, 1 ou 2, pour que deux bannières voisines ne flottent pas ensemble.
  function banniereHTML(b, classe, phase) {
    var d = image("drapeau-" + b.camp);
    return "<span class='drapeau-carte p" + phase + (classe ? " " + classe : "") + "' data-lieu='" + b.id + "' data-camp='" + b.camp + "' style='" +
      cadre(b.x - d.ax, b.y - d.ay, d.w, d.h) + "transform-origin:" + pc(d.ax, d.w) + " " + pc(d.ay, d.h) + "'>" +
      "<img src='" + d.src + "' alt='' draggable='false' style='width:" + (d.frames || 1) * 100 + "%'></span>";
  }

  // Un bourg perd sa bannière flottante (bande ou bourg sans bannière absent) : il reprend son image à bannière cuite.
  function oterBanniere(carte, id) {
    var b = carte.querySelector(".drapeau-carte[data-lieu='" + id + "']"), im = carte.querySelector(".noeud[data-lieu='" + id + "'] image.lieu[data-cuit]");
    if (b) b.remove();
    if (im) { im.setAttribute("href", im.getAttribute("data-cuit")); im.removeAttribute("data-cuit"); }
  }

  // Le calque de vie, posé sur le dessin de la carte : nappes de brume, fumées, bannières, oiseaux ; puis la cérémonie de
  // conquête s'il y en a une. Rien sans ambiance ni cérémonie.
  function vieCarte(carte, v, conquete, suite) {
    var h = v.ambiance && v.fond ? eauHTML(v.etiquettes) : "", nappe = image("lieu-brume");
    // brume : les nappes d'un même front dérivent ensemble (le même vent), dans une bande de toute la largeur ; deux
    // fronts, deux éléments animés
    var fronts = {};
    if (v.ambiance && nappe) v.nappes.forEach(function (n) { (fronts[n.front] = fronts[n.front] || []).push(n); });
    Object.keys(fronts).forEach(function (fr, g) {
      var ns = fronts[fr], y0 = Math.min.apply(null, ns.map(function (n) { return n.y; })), y1 = Math.max.apply(null, ns.map(function (n) { return n.y + n.h; }));
      h += "<span class='brumes-vives' style='top:" + pc(y0, H) + ";height:" + pc(y1 - y0, H) + (g % 2 ? ";animation-direction:alternate-reverse" : "") + "'>" +
        ns.map(function (n) {
          return "<img class='nappe-vive' src='" + nappe.src + "' alt='' draggable='false' style='left:" + pc(n.x, L) + ";top:" + pc(n.y - y0, y1 - y0) + ";width:" + pc(n.w, L) + ";height:" + pc(n.h, y1 - y0) + "'>";
        }).join("") + "</span>";
    });
    if (v.ambiance) v.fumees.forEach(function (f, i) {
      h += "<span class='fumee-carte' style='left:" + pc(f[0], L) + ";top:" + pc(f[1], H) + ";--d:" + (-((i * 1.7) % 4.8)).toFixed(1) + "s'><i></i><i></i></span>";
    });
    v.bannieres.forEach(function (b, i) { h += banniereHTML(b, b.id === conquete ? "leve" : "", i % 3); });
    if (v.ambiance) h += "<span class='oiseaux-carte'><i class='aile-a'></i><i class='aile-b'></i></span>";
    if (!h && !conquete) { if (suite) suite(); return null; }
    var div = document.createElement("div");
    div.className = "vie-carte" + (v.ambiance ? " ambiance" : "");
    div.setAttribute("aria-hidden", "true");
    div.innerHTML = h;
    carte.appendChild(div);
    if (div.querySelector(".nappe-vive")) carte.classList.add("brume-vive");
    // une bande de bannière qui ne se charge pas : les bourgs de ce camp reprennent leur bannière cuite (retenu pour la suite)
    Array.prototype.forEach.call(div.querySelectorAll(".drapeau-carte img"), function (im) {
      im.addEventListener("error", function () {
        manquees[im.getAttribute("src")] = true;
        var camp = im.parentNode.getAttribute("data-camp");
        Array.prototype.forEach.call(carte.querySelectorAll(".drapeau-carte[data-camp='" + camp + "']"), function (b) { oterBanniere(carte, b.getAttribute("data-lieu")); });
      });
    });
    if (conquete) ceremonie(carte, div, conquete, suite); else if (suite) suite();
    return div;
  }

  // Province prise à la dernière bataille (campagne.derniereConquete, champ facultatif posé par JEU.campagne.apresBataille) :
  // lue une fois et effacée ; fêtée seulement si les animations sont actives et la province bien prise.
  function prendreConquete(c) {
    if (c.derniereConquete === undefined) return null;
    var id = c.derniereConquete;
    delete c.derniereConquete;
    JEU.sauvegarde.enregistrer();
    return typeof id === "string" && POSITIONS[id] && c.conquises.indexOf(id) >= 0 && animActive() ? id : null;
  }
  // Cérémonie de conquête (1,2 s après l'entrée de l'écran, une seule fois) : la bannière adverse tombe (70°, 400 ms), le
  // bourg adverse se fond dans celui de France, dont la bannière se lève ; un anneau d'or s'élargit et s'efface ; la brume
  // du lieu suivant se lève ; éclat d'or et son du sceau quand la bannière touche le sol ; la ligne de la chronique arrive
  // en dernier. Les temps sont dans la feuille de style (retards des animations) ; les éléments sont retirés à la fin.
  function ceremonie(carte, div, id, suite) {
    var C = JEU.campagne, p = C.province(id), f = p && C.front(p.front), pos = POSITIONS[id];
    if (!f || !pos) { if (suite) suite(); return; }
    var x = pos[0], y = pos[1], h = "", avant = "";
    var nuAdv = image("lieu-" + f.camp + "-nu"), cuitAdv = image("lieu-" + f.camp);
    var avecBanniere = !!(nuAdv && nuAdv.hampe && image("drapeau-" + f.camp) && div.querySelector(".drapeau-carte.leve"));
    var ancien = avecBanniere ? nuAdv : cuitAdv;
    if (ancien) avant = "<img class='bourg-ancien' src='" + ancien.src + "' alt='' draggable='false' style='" + cadre(x - ancien.ax, y - ancien.ay, ancien.w, ancien.h) + "'>";
    if (avecBanniere) h += banniereHTML({ id: id + "-adverse", camp: f.camp, x: x - nuAdv.ax + nuAdv.hampe[0], y: y - nuAdv.ay + nuAdv.hampe[1] }, "tombe", 0);
    var sp = image("lieu-france") || { w: 80, h: 80 }, rx = sp.w * 0.62, ry = sp.w * 0.36, cy = y - sp.h * 0.2;
    h += "<span class='anneau-conquete' style='" + cadre(x - rx, cy - ry, 2 * rx, 2 * ry) + "'></span>";
    // la brume se lève sur le lieu suivant du front, et entre lui et celui d'après (voile continu de voileBrume)
    var nappe = image("lieu-brume"), suivante = C.prochaineProvince(f.id);
    if (nappe && suivante && suivante.front === f) {
      var q = POSITIONS[suivante.province.id], ap = f.provinces[suivante.niveau + 1], r = ap && POSITIONS[ap.id];
      if (q) h += "<img class='nappe-leve' src='" + nappe.src + "' alt='' draggable='false' style='" + cadre(q[0] - nappe.ax, q[1] - nappe.ay, nappe.w, nappe.h) + "'>";
      if (q && r && image("fond-campagne")) {
        var m = [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2 + 8], k = 0.95;
        h += "<img class='nappe-leve entre' src='" + nappe.src + "' alt='' draggable='false' style='" + cadre(m[0] - nappe.ax * k, m[1] - nappe.ay * k, nappe.w * k, nappe.h * k) + "'>";
      }
    }
    // posés tout de suite, immobiles (l'ancien bourg couvre le nouveau, la bannière de France attend) ; la cérémonie part
    // une image après le premier dessin de l'écran (classe « fete ») : rien ne se joue avant d'être vu, même si l'écran
    // tarde à se peindre
    div.insertAdjacentHTML("afterbegin", avant);
    div.insertAdjacentHTML("beforeend", h);
    var lancer = JEU.anim && JEU.anim.apresImage ? JEU.anim.apresImage : function (g) { setTimeout(g, 0); };
    lancer(function () {
      if (!div.isConnected) { if (suite) suite(); return; }
      div.classList.add("fete");
      setTimeout(function () {
        if (!div.isConnected) return;
        if (JEU.sons) JEU.sons.jouer("sceau");
        var b = div.getBoundingClientRect();
        if (JEU.anim && JEU.anim.eclat && b.width) JEU.anim.eclat(b.left + x / L * b.width, b.top + (y - 24) / H * b.height, "or", 12);
      }, 650);
      if (suite) setTimeout(suite, DUREE_CEREMONIE);
      setTimeout(function () {
        Array.prototype.forEach.call(div.querySelectorAll(".bourg-ancien, .drapeau-carte.tombe, .anneau-conquete, .nappe-leve"), function (n) { n.remove(); });
        var b = div.querySelector(".drapeau-carte.leve");
        if (b) b.classList.remove("leve");
        div.classList.remove("fete");
      }, 2200);
    });
  }

  // Événement du jour : un ruban dans le coin bas de la carte mène à sa carte de jeu (sous la carte, souvent hors de la
  // vue) ; sur cette carte, un cachet « Aujourd'hui » en cire rendue, frappé une fois par jour, la première fois qu'elle
  // se montre (gardé dans le module : rien dans la sauvegarde). Sans animations : ruban et cachet posés, sans frappe.
  function rubanJour(ev) {
    var el = JEU.ui.el;
    return el("button", { type: "button", class: "ruban-jour", title: "Voir l'événement du jour", onclick: function () {
      var k = document.querySelector("#ecran-jouer .carte-jeu.evenement");
      if (!k) return;
      k.scrollIntoView({ block: "center", behavior: animActive() ? "smooth" : "auto" });
      k.focus({ preventScroll: true });
    } }, [el("b", { texte: "Aujourd'hui" }), el("span", { texte: ev.titre }),
      el("i", { "aria-hidden": "true", html: "<svg viewBox='0 0 12 12' width='12' height='12'><path d='M2 4l4 4 4-4' fill='none' stroke='currentColor' stroke-width='2'/></svg>" })]);
  }
  function cachetJour() {
    return JEU.ui.el("span", { class: "cachet-jour", html: "<img src='assets/images/reponses/tampon-cire.png' alt='' draggable='false'><b>Aujourd'hui</b>" });
  }
  var cachetFrappe = null; // jour où le cachet a déjà été frappé
  function frapperCachet(carteJeu) {
    var jour = U.jour();
    if (!carteJeu || cachetFrappe === jour) return;
    function frapper() {
      if (cachetFrappe === jour) return;
      cachetFrappe = jour;
      var c = carteJeu.querySelector(".cachet-jour");
      if (!c || !animActive()) return;
      c.classList.add("frappe");
      if (JEU.sons) JEU.sons.jouer("sceau");
    }
    if (typeof IntersectionObserver === "undefined") { frapper(); return; }
    var obs = new IntersectionObserver(function (es) {
      if (!carteJeu.isConnected) { obs.disconnect(); return; }
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      obs.disconnect();
      frapper();
    }, { threshold: 0.6 });
    obs.observe(carteJeu);
  }

  function carteSVG(c, v) {
    vie = v || null;
    var C = JEU.campagne, france = camp("joueur"), fond = image("fond-campagne");
    var brume = {}; // lieux pas encore ouverts : ni pris, ni visés
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id);
      f.provinces.forEach(function (p) { brume[p.id] = c.conquises.indexOf(p.id) < 0 && !(cible && cible.province.id === p.id); });
    });
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='carte-svg' role='img' aria-label='Carte de la campagne : deux fronts'>" +
      "<defs><filter id='sepiaC'><feColorMatrix type='matrix' values='.45 .4 .15 0 .05  .38 .4 .14 0 .04  .25 .3 .12 0 .02  0 0 0 1 0'/></filter>" +
      "<radialGradient id='vigC' cx='.5' cy='.5' r='.7'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='" + (fond ? ".3" : ".6") + "'/></radialGradient>" +
      "<filter id='ombreC'><feDropShadow dx='2' dy='4' stdDeviation='3' flood-color='#000' flood-opacity='.55'/></filter>" +
      // terrain sous la brume : flou (vu à travers la brume : champs et chemins sans arêtes nettes), presque sans
      // couleur, éclairci
      "<filter id='grisBrume' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='3'/><feColorMatrix type='saturate' values='.12'/>" +
      "<feComponentTransfer><feFuncR type='linear' slope='.7' intercept='.27'/><feFuncG type='linear' slope='.7' intercept='.27'/><feFuncB type='linear' slope='.7' intercept='.26'/></feComponentTransfer></filter></defs>" +
      // fond rendu en 3D (relief, forêts, champs, escarpement, fleuve), posé sur l'ancien fond peint passé au sépia :
      // si l'image 3D manque, elle est retirée (voir surveillerImages) et l'ancien fond reste
      "<image href='assets/images/terrain-domaine.jpg' x='0' y='-65' width='1000' height='660' preserveAspectRatio='xMidYMid slice' filter='url(#sepiaC)'/>" +
      (fond ? "<image class='fond-3d' href='" + fond.src + "' x='0' y='0' width='" + L + "' height='" + H + "' preserveAspectRatio='none'/>" : "") +
      voileBrume(c, brume, fond) +
      "<rect width='" + L + "' height='" + H + "' fill='url(#vigC)'/>" +
      (fond ? lumiereSVG(new Date().getHours()) : "");
    if (vie) vie.fond = !!fond;
    C.FRONTS.forEach(function (f) { s += route(f.id, ["domaine"].concat(f.provinces.map(function (p) { return p.id; })), brume); });
    // titres des fronts, en haut et en bas, à l'intérieur du cadre de parchemin
    C.FRONTS.forEach(function (f, i) {
      var adv = camp(f.camp);
      var y = i === 0 ? 40 : H - 30;
      s += "<g>" + JEU.icones.dans(adv.embleme, 556, y - 20, 24, adv.couleurs[0] === "#e9e1cc" ? "#2f6b52" : adv.couleurs[0]) +
        "<text x='548' y='" + y + "' class='titre-front' text-anchor='end'>" + U.echapper(f.nom) + " · " + U.echapper(C.maj1(adv.nom)) + "</text></g>";
    });
    var attaque = c.rival.attaque;
    s += noeud(POSITIONS.domaine, "lys", france.couleurs, "lys", "Ton domaine", attaque ? "attaqué par " + camp(C.front(attaque).camp).peuple : "", "domaine", attaque ? "attaque" : "tien", "france");
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id), adv = camp(f.camp);
      f.provinces.forEach(function (p) {
        var conquise = c.conquises.indexOf(p.id) >= 0;
        var etat = conquise ? "tien" : cible && cible.province.id === p.id ? "cible" : "brume";
        var sous = conquise ? "prise" : etat === "cible" ? "place forte " + c.provinces[p.id].pv + " / " + p.pv : "";
        var coul = conquise ? france.couleurs : adv.couleurs;
        // bourg du camp qui tient le lieu ; dans la brume, une nappe de brume
        var lieu = conquise ? variante(p) : etat === "brume" ? "brume" : f.camp;
        s += noeud(POSITIONS[p.id], p.icone, coul, conquise ? "lys" : adv.embleme, p.nom, sous, p.id, etat, lieu);
      });
    });
    vie = null;
    return s + "</svg>";
  }

  // Un lieu de la carte : le bourg rendu en 3D (avec la bannière de son camp), son nom et une ligne sous le nom.
  // L'ancien médaillon (icône du lieu, bannière plantée) est le repli : dessiné seul sans sprites.js, ou caché sous
  // le bourg et montré si l'image du bourg manque. L'ombre portée ne touche que le texte et le médaillon : le bourg
  // a déjà la sienne, rendue au sol.
  // Place du nom et de la ligne dessous : sous le bas du lieu (bourg, nappe de brume ou médaillon de repli), ou
  // au-dessus pour les lieux de NOM_DESSUS (NOM_DESSUS_REPLI avec le médaillon). Recalculée si l'image du bourg
  // manque (repli).
  // NOMS : lignes de base du nom (17 px) et de la ligne dessous (18 px), depuis le bas du lieu (ou depuis son haut, en
  // remontant). MEDAILLON : haut et bas du médaillon de repli (rayon 50 avec le halo, bannière comprise), depuis le
  // pied du lieu.
  var NOMS = { nom: 21, sous: 41, dessusNom: 26, dessusSeul: 6, dessusSous: 6 };
  var MEDAILLON = { haut: -56, bas: 50 };
  function lignesNoms(haut, bas, dessus, avecSous) {
    if (dessus) return { nom: haut - (avecSous ? NOMS.dessusNom : NOMS.dessusSeul), sous: haut - NOMS.dessusSous };
    return { nom: bas + NOMS.nom, sous: bas + NOMS.sous };
  }
  function placeNoms(g, x, y, haut, bas, dessus) {
    var n = g.querySelector(".nom-lieu"), so = g.querySelector(".sous-lieu"), l = lignesNoms(haut, bas, dessus, !!so);
    if (n) n.setAttribute("y", l.nom);
    if (so) so.setAttribute("y", l.sous);
  }

  function noeud(pos, icone, coul, embleme, nom, sous, id, etat, lieu) {
    var x = pos[0], y = pos[1], sp = image("lieu-" + lieu);
    // bannière qui flotte (lot B) : le bourg rendu sans sa bannière (lieu-…-nu), la bande drapeau-<camp> posée sur sa hampe
    // par le calque de vie ; sans ambiance ni cérémonie, ou si une image manque : le bourg à bannière cuite
    var campLieu = lieu.split("-")[0], nu = sp && vie && vie.drapeaux && lieu !== "brume" ? image("lieu-" + lieu + "-nu") : null;
    if (nu && !(nu.hampe && image("drapeau-" + campLieu))) nu = null;
    var s = "<g class='noeud " + etat + (sp ? "" : " repli") + "' data-lieu='" + id + "' data-x='" + x + "' data-y='" + y + "' tabindex='" + (etat === "cible" || etat === "attaque" ? "0" : "-1") + "'>";
    var halo = etat === "cible" || etat === "attaque" ? " fill='none' stroke='" + (etat === "attaque" ? "#d0644a" : "#e2c272") + "' stroke-width='4'" : null;
    // halo : un trait d'or (ou rouge) posé sur un trait sombre, lisible sur l'herbe claire comme sur le sable du sud
    function anneauHalo(forme, attributs) {
      return "<g class='halo'><" + forme + attributs + " fill='none' stroke='#1c120a' stroke-width='7' opacity='.5'/><" + forme + " class='halo-or'" + attributs + halo + "/></g>";
    }
    var medaillon = "<g class='repli-lieu' filter='url(#ombreC)'" + (sp ? " style='display:none'" : "") + ">" +
      "<circle class='lieu' cx='" + x + "' cy='" + y + "' r='40' fill='#b08d3a' stroke='#2e2419' stroke-width='3'/>" +
      "<circle cx='" + x + "' cy='" + y + "' r='33' fill='" + (etat === "brume" ? "#6f6658" : coul[0]) + "'/>" +
      JEU.icones.dans(icone, x - 23, y - 23, 46, etat === "brume" ? "#bfb39a" : coul[1]) +
      // bannière plantée, avec l'emblème du camp qui tient le lieu
      (etat !== "brume" ? "<g transform='translate(" + (x + 18) + "," + (y - 50) + ")'><path d='M0 0v38' stroke='#2e2419' stroke-width='3'/><path d='M2 2h26l-7 9 7 9H2z' fill='" + coul[0] + "' stroke='#2e2419' stroke-width='1.5'/>" + JEU.icones.dans(embleme, 5, 3, 15, coul[1]) + "</g>" : "") +
      "</g>";
    var bas, haut; // bas et haut du lieu : le nom vient dessous (ou dessus)
    if (sp) {
      // halo posé au sol autour du bourg, aplati et remonté : il ne touche pas le nom
      if (halo) s += anneauHalo("ellipse", " cx='" + x + "' cy='" + (y - sp.h * 0.2) + "' rx='" + sp.w * 0.58 + "' ry='" + sp.w * 0.34 + "'");
      s += medaillon + "<image class='lieu" + (lieu === "brume" ? " nappe" : "") + "' href='" + (nu || sp).src + "'" + (nu ? " data-cuit='" + sp.src + "'" : "") +
        " x='" + (x - sp.ax) + "' y='" + (y - sp.ay) + "' width='" + sp.w + "' height='" + sp.h + "'/>";
      if (vie) noterVie(id, lieu, campLieu, x - sp.ax, y - sp.ay, sp, nu);
      // nappe de brume : le nom se cale sur le bas visible de la nuée (« bas » dans sprites.js), pas sur son cadre
      bas = y + (sp.bas !== undefined ? sp.bas : sp.h - sp.ay);
      haut = y + (sp.haut !== undefined ? sp.haut : -sp.ay);
    } else {
      if (halo) s += anneauHalo("circle", " cx='" + x + "' cy='" + y + "' r='50'");
      s += medaillon;
      bas = y + MEDAILLON.bas; haut = y + MEDAILLON.haut;
    }
    var l = lignesNoms(haut, bas, nomDessus(id, !sp), !!sous);
    // place des noms, pour le masque de l'eau du calque de vie (largeurs estimées : Cinzel gras 17 px, Crimson gras 18 px)
    if (vie) { vie.etiquettes.push({ x: x, y: l.nom, w: nom.length * 10.5 + 14 }); if (sous) vie.etiquettes.push({ x: x, y: l.sous, w: sous.length * 8.8 + 14 }); }
    s += "<g filter='url(#ombreC)'><text x='" + x + "' y='" + l.nom + "' class='nom-lieu'>" + U.echapper(nom) + "</text>";
    if (sous) s += "<text x='" + x + "' y='" + l.sous + "' class='sous-lieu'>" + U.echapper(sous) + "</text>";
    return s + "</g></g>";
  }

  // Une image de la carte qui ne se charge pas est retirée : l'ancien fond sépia, ou le médaillon du lieu, la remplace.
  // L'échec est retenu : la carte suivante dessine directement le repli.
  function surveillerImages(carte) {
    // nappes du voile de brume (masque et nappes entre deux lieux) : si l'image manque, le voile disparaît
    Array.prototype.forEach.call(carte.querySelectorAll("mask image, image.nappe-entre"), function (im) {
      im.addEventListener("error", function () {
        manquees[im.getAttribute("href")] = true;
        Array.prototype.forEach.call(carte.querySelectorAll(".voile-brume, .nappe-entre, #masqueBrume"), function (v) { v.remove(); });
      });
    });
    Array.prototype.forEach.call(carte.querySelectorAll("image.fond-3d, image.lieu"), function (im) {
      im.addEventListener("error", function () {
        var src = im.getAttribute("href");
        manquees[src] = true;
        // bourg sans bannière absent (lot B) : le bourg à bannière cuite le remplace, sans bannière flottante
        var cuit = im.getAttribute("data-cuit");
        if (cuit && !manquees[cuit] && im.parentNode) { oterBanniere(carte, im.parentNode.getAttribute("data-lieu")); return; }
        var g = im.parentNode, repli = g && g.querySelector(".repli-lieu");
        if (repli) {
          // repli : le médaillon (rayon 50 avec le halo) remplace le bourg ; le nom passe sous le médaillon
          repli.style.display = "";
          g.classList.add("repli");
          var x = +g.getAttribute("data-x"), y = +g.getAttribute("data-y");
          placeNoms(g, x, y, y + MEDAILLON.haut, y + MEDAILLON.bas, nomDessus(g.getAttribute("data-lieu"), true));
          var h = g.querySelector(".halo");
          if (h) h.outerHTML = "<g class='halo'><circle cx='" + x + "' cy='" + y + "' r='50' fill='none' stroke='#1c120a' stroke-width='7' opacity='.5'/>" +
            "<circle class='halo-or' cx='" + x + "' cy='" + y + "' r='50' fill='none' stroke='" + h.querySelector(".halo-or").getAttribute("stroke") + "' stroke-width='4'/></g>";
        }
        im.remove();
        if (im.classList.contains("fond-3d") || im.classList.contains("nappe"))
          Array.prototype.forEach.call(carte.querySelectorAll(".voile-brume, .nappe-entre, #masqueBrume"), function (v) { v.remove(); });
      });
    });
  }

  // ---------- personnages (16/10/2026) : médaillons, sceaux de cire, missives, fiches ----------
  // Ton souverain a un portrait (œuvre du domaine public, jeu/assets/images/personnages/) ; un rival « titre seul »
  // a un médaillon héraldique : silhouette couronnée, sans visage, sur les armes de son camp (de gueules au lion d'or
  // pour l'Angleterre, ivoire et vert à la tour pour l'Empire omeyyade), avec l'écu du camp suspendu dessous.
  // Aucun symbole religieux.
  var ARMES = {
    joueur: { champ: "#24407a", clair: "#4467ad", meuble: "lys", teinte: "#e2c272", silhouette: "#0f1a33", couronne: "fleurons" },
    angleterre: { champ: "#9b1f1f", clair: "#c4413a", meuble: "lion", teinte: "#e2c272", silhouette: "#2a1410", couronne: "fleurons" },
    omeyyades: { champ: "#e9e1cc", clair: "#fbf7ea", meuble: "tour", teinte: "#2f6b52", silhouette: "#1f4234", couronne: "creneaux" }
  };
  var CIRES = { joueur: ["#2d4f94", "#14284f", "#9db2df"], angleterre: ["#a32626", "#561010", "#e8907e"], omeyyades: ["#2f6b52", "#14382a", "#8fcaab"] };
  var nSvg = 0;
  var COURONNES = {
    fleurons: "<path d='M39.5 37V27.5l4 3.6 3-7.1 3.5 6.2 3.5-6.2 3 7.1 4-3.6V37z'/><circle cx='39.5' cy='27' r='1.5'/><circle cx='46.5' cy='23.6' r='1.5'/><circle cx='53.5' cy='23.6' r='1.5'/><circle cx='60.5' cy='27' r='1.5'/>",
    creneaux: "<path d='M39.5 37V26.5h5v3.7h3v-3.7h5v3.7h3v-3.7h5V37z'/>",
    tortil: "<path d='M40 37.2v-4.4h20v4.4z'/><circle cx='42.5' cy='30.8' r='2.1'/><circle cx='50' cy='30.4' r='2.1'/><circle cx='57.5' cy='30.8' r='2.1'/>"
  };
  function medaillonHeraldique(camp, generique) {
    var a = ARMES[camp] || ARMES.angleterre, k = "mh" + (++nSvg);
    var ecu = "M39 70h22v9c0 9-6 14.5-11 17-5-2.5-11-8-11-17z";
    return "<svg viewBox='0 0 100 100' class='medaillon-svg' aria-hidden='true'>" +
      "<defs><radialGradient id='" + k + "g' cx='.4' cy='.3' r='.78'><stop offset='0' stop-color='" + a.clair + "'/><stop offset='1' stop-color='" + a.champ + "'/></radialGradient>" +
      "<clipPath id='" + k + "c'><circle cx='50' cy='50' r='39.6'/></clipPath>" +
      "<pattern id='" + k + "p' width='8' height='8' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><path d='M0 0H8M0 0V8' stroke='" + a.teinte + "' stroke-width='.7' opacity='.3'/></pattern></defs>" +
      "<circle cx='50' cy='50' r='48' fill='#b08d3a' stroke='#2e2419' stroke-width='2'/>" +
      "<circle cx='50' cy='50' r='44.4' fill='none' stroke='#2e2419' stroke-width='1.8' stroke-dasharray='.1 3.4' stroke-linecap='round'/>" +
      "<circle cx='50' cy='50' r='40.6' fill='url(#" + k + "g)' stroke='#2e2419' stroke-width='1.6'/>" +
      "<g clip-path='url(#" + k + "c)'><rect width='100' height='100' fill='url(#" + k + "p)'/>" +
      "<g fill='" + a.silhouette + "'><ellipse cx='50' cy='46' rx='10.4' ry='12.4'/><path d='M45.2 54h9.6v11h-9.6z'/><path d='M15 100c1-19 13-31 29.5-34.5h11C72 69 84 81 85 100z'/></g>" +
      "<g fill='#e2c272' stroke='#5a3e12' stroke-width='1.1' stroke-linejoin='round'>" + COURONNES[generique ? "tortil" : a.couronne] + "</g></g>" +
      "<path d='" + ecu + "' fill='" + a.champ + "' stroke='#2e2419' stroke-width='1.8'/>" +
      "<path d='" + ecu + "' fill='none' stroke='#e2c272' stroke-width='1' transform='translate(50 81) scale(.84) translate(-50 -81)'/>" +
      JEU.icones.dans(a.meuble, 42.5, 72.5, 15, a.teinte) + "</svg>";
  }
  // Médaillon d'un personnage (HTML) : portrait dans un cerclage d'or, ou médaillon héraldique.
  function medaillon(p, taille) {
    var t = "--t:" + (taille || 60) + "px";
    if (p && p.portrait && p.portrait.fichier)
      return "<span class='medaillon-perso portrait' style='" + t + "'><img src='" + U.echapper(p.portrait.fichier) + "' alt='' draggable='false' data-camp='" + U.echapper(p.camp) + "'></span>";
    return "<span class='medaillon-perso heraldique' style='" + t + "'>" + medaillonHeraldique(p ? p.camp : "angleterre", !!(p && p.generique)) + "</span>";
  }
  // Un portrait qui ne se charge pas laisse la place au médaillon héraldique de son camp (sans image cassée).
  function surveillerPortraits(zone) {
    if (!zone) return;
    Array.prototype.forEach.call(zone.querySelectorAll(".medaillon-perso.portrait img"), function (im) {
      function repli() {
        var sp = im.parentNode;
        if (!sp) return;
        sp.className = "medaillon-perso heraldique";
        sp.innerHTML = medaillonHeraldique(im.getAttribute("data-camp") || "joueur", false);
      }
      if (im.complete && im.naturalWidth === 0) repli(); else im.addEventListener("error", repli);
    });
  }
  // Sceau de cire au bas d'une missive, à l'emblème du camp qui écrit.
  function sceau(camp) {
    var c = CIRES[camp] || CIRES.joueur, k = "sc" + (++nSvg), pts = [];
    for (var i = 0; i < 40; i++) {
      var a = i / 40 * 2 * Math.PI, r = 33 + 2 * Math.sin(i * 2.6) + 1.3 * Math.cos(i * 1.7);
      pts.push((40 + r * Math.cos(a)).toFixed(1) + " " + (40 + r * Math.sin(a)).toFixed(1));
    }
    var meuble = (ARMES[camp] || ARMES.joueur).meuble;
    return "<svg viewBox='0 0 80 80' class='sceau-cire' aria-hidden='true'><defs><radialGradient id='" + k + "' cx='.38' cy='.32' r='.75'>" +
      "<stop offset='0' stop-color='" + c[2] + "'/><stop offset='.45' stop-color='" + c[0] + "'/><stop offset='1' stop-color='" + c[1] + "'/></radialGradient></defs>" +
      "<path d='M" + pts.join(" L") + "Z' fill='url(#" + k + ")' stroke='" + c[1] + "' stroke-width='1.2'/>" +
      "<circle cx='40' cy='40' r='23.5' fill='none' stroke='" + c[1] + "' stroke-width='2.6' opacity='.75'/>" +
      "<circle cx='39.3' cy='39.3' r='23.5' fill='none' stroke='" + c[2] + "' stroke-width='.8' opacity='.55'/>" +
      JEU.icones.dans(meuble, 25.2, 25.2, 29, c[2], " opacity='.6'") + JEU.icones.dans(meuble, 26, 26, 29, c[1]) + "</svg>";
  }

  function titreDe(p) {
    var C = JEU.campagne;
    return [p.titre ? C.maj1(p.titre) : null, p.dates].filter(Boolean).join(", ");
  }
  function sousLettre(l) {
    var C = JEU.campagne;
    if (l.camp === "joueur") return l.situation === "changement" ? "Nouvelles de la cour" : "Ton souverain" + (titreDe(l.qui) ? " · " + titreDe(l.qui) : "");
    var f = C.front(l.front);
    return (f ? f.nom : "Un rival") + " · rivalité " + C.niveauRivalite(C.rivalite(l.front)).nom;
  }
  var ENTETES = { presentation: "Missives des cours voisines", defi: "Un défi", attaque: "Une missive de guerre", changement: "Nouvelles de la cour",
    province: "Une missive du rival", victoire: "Une missive du rival", tenu: "Une missive du rival", retraite: "Une missive du rival" };
  // m : { lettres, bouton, situation } (JEU.campagne.prendreMissives ou missiveAvantBataille). apres : ce qui suit.
  function ouvrirMissive(m, apres) {
    JEU.ui.ouvrirMissive({
      // plusieurs lettres de camps différents (réaction du rival et nouveau souverain) : un en-tête commun
      entete: m.situation !== "presentation" && m.lettres.some(function (l) { return l.camp !== m.lettres[0].camp; }) ? "Des nouvelles du royaume" : ENTETES[m.situation] || "Une missive",
      lettres: m.lettres.map(function (l) { return { medaillon: medaillon(l.qui, 78), nom: l.qui.nom, sous: sousLettre(l), texte: l.texte, camp: l.camp }; }),
      bouton: m.bouton, sceau: sceau(m.lettres[0].camp), apres: apres
    });
    surveillerPortraits(document.getElementById("modale"));
    JEU.sons.jouer("sceau");
  }

  // Lancer une bataille depuis la campagne : une fois sur deux, le rival lance d'abord son défi ; la bataille suit
  // quand la missive se ferme (Relever le défi, Entrée, Échap ou la croix).
  function lancerBataille(lieu) {
    if (JEU.partie || JEU.ui.modaleOuverte()) return;
    var m = JEU.campagne.missiveAvantBataille(lieu);
    if (m) ouvrirMissive(m, function () { JEU.bataille.lancer(lieu); });
    else JEU.bataille.lancer(lieu);
  }

  // Défi du rival du front avant le Grand Gardien d'une expédition (une bataille sur deux, « Messages des rivaux » actif) :
  // la missive est demandée et montrée ici, par l'écran de campagne, jamais entre deux questions ; apres() lance la bataille
  // quand elle se ferme, ou tout de suite s'il n'y a pas de lettre. lieu : la prochaine province du front (sinon rien).
  function defiAvantRoute(lieu, apres) {
    var m = lieu && JEU.campagne.missiveAvantBataille ? JEU.campagne.missiveAvantBataille(lieu) : null;
    if (m) ouvrirMissive(m, apres); else apres();
  }

  // Fiche d'un personnage (Codex et clic sur un médaillon) : titre et dates imprimés dans le cours, faits des cours
  // ouverts avec leur source, crédit du portrait.
  function fichePersonnage(p) {
    var el = JEU.ui.el, C = JEU.campagne;
    var role = p.camp === "joueur" ? "Souverain que tu sers dans la campagne" :
      "Ton rival · " + ((C.FRONTS.filter(function (f) { return f.camp === p.camp; })[0] || {}).nom || "");
    var carte = el("article", { class: "fiche-perso camp-" + p.camp }, [
      el("div", { class: "fp-tete" }, [el("span", { html: medaillon(p, 104) }), el("div", {}, [
        el("h3", { texte: p.nom }),
        titreDe(p) ? el("p", { class: "fp-titre", texte: titreDe(p) }) : null,
        el("p", { class: "note", texte: role })
      ])])
    ]);
    var faits = C.faitsVisibles(p);
    if (faits.length) carte.appendChild(el("ul", { class: "fp-faits" }, faits.map(function (x) {
      return el("li", {}, [document.createTextNode(x.texte), x.source ? el("span", { class: "fiche-source", texte: " (" + String(x.source.fichier).replace(/^.*\//, "") + ", page " + x.source.page + ")" }) : null]);
    })));
    if (p.generique) carte.appendChild(el("p", { class: "note", texte: "Aucun de tes cours ouverts ne nomme ce rival : c'est « un seigneur rival », sans nom ni visage." }));
    else if (p.titreSeul) carte.appendChild(el("p", { class: "note", texte: "Ton cours ne donne pas son nom : il n'a que son titre et ses armes, pas de visage." }));
    if (p.portrait) carte.appendChild(el("p", { class: "fiche-source", texte: "Portrait : « " + p.portrait.oeuvre + " », " + p.portrait.artiste + ", " + p.portrait.date + ". " + p.portrait.institution + ", " + p.portrait.licence + "." }));
    return carte;
  }
  function ouvrirFichePersonnage(p) {
    if (!p) return;
    JEU.ui.ouvrirModale(null, JEU.ui.el("div", { class: "fiche-perso-modale" }, [fichePersonnage(p)]));
    surveillerPortraits(document.getElementById("modale"));
  }

  // Bandeau de la cour, de part et d'autre du titre : ton souverain à gauche, les deux rivaux à droite (médaillon,
  // jauge de rivalité). Un clic ouvre la fiche.
  function cour(c) {
    var el = JEU.ui.el, C = JEU.campagne, chef = C.souverain(c);
    var gauche = chef
      ? el("button", { class: "cour-chip cour-souverain", title: "Fiche de " + chef.nom, onclick: function () { ouvrirFichePersonnage(chef); } }, [
        el("span", { html: medaillon(chef, 62) }),
        el("span", { class: "cc-texte" }, [el("small", { texte: "Ton souverain" }), el("b", { texte: chef.nom }), titreDe(chef) ? el("i", { texte: titreDe(chef) }) : null])])
      : el("div", { class: "cour-chip cour-souverain" }, [el("span", { class: "medaillon-perso heraldique", style: "--t:62px", html: medaillonHeraldique("joueur", false) }),
        el("span", { class: "cc-texte" }, [el("small", { texte: "Ton camp" }), el("b", { texte: "Royaume de France" })])]);
    var droite = el("div", { class: "cour-rivaux" }, C.FRONTS.map(function (f) {
      var p = C.rivalDe(f.id, c), v = C.rivalite(f.id, c), n = C.niveauRivalite(v);
      return el("button", { class: "cour-chip cour-rival niveau-" + n.id, "data-front": f.id, title: C.humeur(f.id, c) + " (rivalité " + v + " sur 100)", onclick: function () { ouvrirFichePersonnage(p); } }, [
        el("span", { html: medaillon(p, 38) }),
        el("span", { class: "cc-texte" }, [el("b", { texte: p.nom }), el("span", { class: "cc-jauge" }, [
          el("span", { class: "jr-barre rivalite-barre" }, [el("span", { style: "width:" + v + "%" })]), el("i", { texte: n.nom })])])
      ]);
    }));
    return el("div", { class: "cour-campagne" }, [gauche, droite]);
  }

  // Rivaux dans le cartouche du bas : médaillon, jauge de rivalité, humeur, provinces prises.
  function lignesRivaux(c) {
    var el = JEU.ui.el, C = JEU.campagne;
    return C.FRONTS.map(function (f) {
      var p = C.rivalDe(f.id, c), v = C.rivalite(f.id, c);
      var pris = f.provinces.filter(function (x) { return c.conquises.indexOf(x.id) >= 0; }).length;
      return el("div", { class: "ligne-rival", "data-front": f.id }, [
        el("button", { class: "lr-medaillon", title: "Fiche : " + p.nom, onclick: function () { ouvrirFichePersonnage(p); }, html: medaillon(p, 54) }),
        el("div", {}, [
          el("p", { class: "lr-nom" }, [el("b", { texte: p.nom }), el("span", { texte: " · " + f.nom + " (" + camp(f.camp).nom + ")" })]),
          el("div", { class: "lr-rivalite" }, [el("span", { texte: "Rivalité" }), el("span", { class: "jr-barre rivalite-barre" }, [el("span", { style: "width:" + v + "%" })]),
            el("b", { texte: v + " / 100" })]),
          el("p", { class: "note lr-humeur", texte: C.humeur(f.id, c) }),
          el("p", { class: "note", texte: pris + " province" + (pris > 1 ? "s" : "") + " prise" + (pris > 1 ? "s" : "") + " sur " + f.provinces.length + "." })
        ])
      ]);
    });
  }

  // La ligne « Expéditions » du cartouche des rivaux (JEU.expedition.resume()).
  function ligneExpeditions(rx) {
    if (!rx.frontiere) return "Expéditions : " + JEU.expedition.TEXTES.depart.attente;
    var relais = rx.relais.length ? rx.relais[rx.relais.length - 1] : 1;
    return "Expéditions : " + rx.accomplies + " accomplie" + (rx.accomplies > 1 ? "s" : "") + ", relais ouverts jusqu'à la semaine " + relais + ", renommée " + rx.renomTotal + " (" + rx.renom + " à dépenser).";
  }

  // Missives en attente, montrées en arrivant sur la carte (jamais pendant une partie, jamais par-dessus une autre
  // fenêtre : elles attendent alors la visite suivante).
  function afficherMissives(annonce) {
    if (JEU.partie || JEU.ui.modaleOuverte()) return annonce;
    var m = JEU.campagne.prendreMissives();
    if (m && m.silencieux) return (annonce ? annonce + " " : "") + "Les années passent : " + m.changement.nom + " est maintenant ton souverain.";
    if (m) ouvrirMissive(m, null);
    return annonce;
  }

  // Après la cérémonie de conquête : la missive du rival, si l'élève est encore sur la carte, hors partie.
  function missivesApresCeremonie() {
    if (JEU.ui.ecranCourant() !== "jouer" || JEU.partie) return;
    var a = afficherMissives(null);
    if (a) JEU.ui.toast(a, "tribut", 5000);
  }

  JEU.ui.ecrans.jouer = function (s) {
    var el = JEU.ui.el;
    var C = JEU.campagne;
    var jour = C.nouveauJour();
    var c = C.etat();
    var etat = JEU.sauvegarde.etat();
    var ev = C.evenementDuJour();
    var conquete = prendreConquete(c); // cérémonie de conquête à jouer (lot B), ou null
    s.innerHTML = "";
    s.appendChild(el("h1", { class: "titre-ecran", texte: "La campagne" }));
    s.appendChild(el("p", { class: "sous-titre-campagne", html: JEU.icones.icone("lys", 22) + " Royaume de France <span>contre</span> deux rivaux" }));
    var zoneCour = cour(c);
    s.appendChild(zoneCour);
    surveillerPortraits(zoneCour);

    var annonce = null;
    if (jour) {
      var t = Object.keys(jour.tributs).map(function (r) { return "+" + jour.tributs[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); });
      // en haut à droite, sous le bandeau : le message ne cache aucun nom de la carte
      if (t.length) annonce = "Tes provinces t'ont versé leur tribut : " + t.join(", ") + ".";
      JEU.ui.majRessources();
    }

    var attaquant = c.rival.attaque ? camp(C.front(c.rival.attaque).camp) : null;
    if (attaquant) {
      s.appendChild(el("div", { class: "alerte-rival" }, [
        el("span", { class: "ar-banniere", html: JEU.icones.icone(attaquant.embleme, 52) }),
        el("div", {}, [el("h2", { texte: C.maj1(attaquant.armee) + " marche sur ton domaine !" }), el("p", { texte: "Ses troupes approchent par la route. Défends tes murs : tu ne perdras rien, quoi qu'il arrive." })]),
        el("button", { class: "bouton principal", onclick: function () { lancerBataille("domaine"); }, html: "<span class='touche'>1</span> Défendre le domaine" })
      ]));
    }

    // carte vivante (lot B) : l'ambiance et les bannières flottantes, ou la cérémonie seule
    var amb = ambianceActive();
    var v = { ambiance: amb, drapeaux: (amb || !!conquete) && drapeauxPrets(), recents: c.conquises.slice(-2), bannieres: [], fumees: [], nappes: [], etiquettes: [] };
    var carte = el("div", { class: "carte-campagne", html: carteSVG(c, v) });
    surveillerImages(carte);
    vieCarte(carte, v, conquete, conquete ? missivesApresCeremonie : null);
    if (ev) carte.appendChild(rubanJour(ev));
    s.appendChild(carte);
    Array.prototype.forEach.call(carte.querySelectorAll(".noeud.cible, .noeud.attaque"), function (n) {
      function go() { lancerBataille(n.getAttribute("data-lieu")); }
      n.addEventListener("click", go);
      n.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.stopPropagation(); go(); } });
    });

    var options = [];
    if (attaquant) options.push({ titre: "Défendre le domaine", texte: C.maj1(attaquant.nom) + " attaque. Pose tes tours sur la route de ton domaine.", icone: "rempart", action: function () { lancerBataille("domaine"); } });
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id), adv = camp(f.camp);
      if (cible) options.push({ titre: "Attaquer : " + cible.province.nom, texte: f.nom + ", contre " + adv.nom + ". Place forte : " + c.provinces[cible.province.id].pv + " / " + cible.province.pv + ". Les coups portés restent acquis.", icone: "assaut", action: function () { lancerBataille(cible.province.id); } });
    });
    if (!C.prochaineProvince()) options.push({ titre: "Les deux fronts sont tenus", texte: "Toutes les provinces sont à toi. Défends ton domaine et tiens ton conseil.", icone: "couronne", action: function () { JEU.ui.toast("Toutes les provinces sont prises !"); } });
    options.push({ titre: "Conseil du royaume", texte: "Tes conseillers t'apportent leurs affaires. Juge juste et le royaume grandit.", icone: "conseil", action: function () { JEU.conseil.lancer(); } });
    // expéditions (24/10/2026) : la route des semaines, un mode à part (jeu/js/expedition.js, écran jeu/js/ecran-expedition.js)
    var rx = JEU.expedition && JEU.ui.ecrans.expedition ? JEU.expedition.resume() : null;
    if (rx && rx.enCours) options.push({ titre: "Reprendre l'expédition · semaine " + rx.semaine + ", " + (rx.halte === 1 ? "1re" : rx.halte + "e") + " halte", texte: "La compagnie t'attend sur la route des semaines. Vivres " + rx.vivres + " sur " + rx.vivresMax + ", or de route " + rx.or + ".", icone: "relais", action: function () { JEU.ui.afficher("expedition"); } });
    else if (rx && rx.frontiere) options.push({ titre: "Partir en expédition", texte: "La route des semaines : trois semaines du programme à traverser, des faveurs à gagner, un gardien par semaine. Renommée : " + rx.renom + ".", icone: "relais", action: function () { JEU.ui.afficher("expedition"); } });
    else if (rx) options.push({ titre: "Partir en expédition", texte: JEU.expedition.TEXTES.depart.attente, icone: "relais", action: function () { JEU.ui.toast(JEU.expedition.TEXTES.depart.attente); } });
    options.push({ titre: "Arsenal", texte: "Débloque et améliore tes tours, tes troupes et tes remparts avec tes ressources.", icone: "caserne", action: ouvrirArsenal });
    if (ev) options.push({ titre: ev.titre, texte: ev.texte, icone: ev.icone, action: function () { JEU.campagne.jouerEvenement(); }, evenement: true });

    var grille = el("div", { class: "grille-jeux" });
    options.forEach(function (o, i) {
      grille.appendChild(el("button", { class: "carte-jeu" + (o.evenement ? " evenement" : ""), onclick: o.action }, [
        el("span", { class: "touche", texte: String(i + 1) }),
        o.evenement ? cachetJour() : null,
        el("span", { class: "illustration ill-" + o.icone }, [el("span", { class: "icone-jeu", html: JEU.icones.icone(o.icone, 44) })]),
        el("h2", { texte: o.titre }), el("p", { texte: o.texte })
      ]));
    });
    s.appendChild(grille);
    if (ev) frapperCachet(grille.querySelector(".carte-jeu.evenement"));

    // royaume et rivalité
    var jz = el("div", { class: "jauges-royaume" });
    JEU.conseil.jauges(jz);
    var conquises = c.conquises.length;
    s.appendChild(el("div", { class: "bas-campagne" }, [
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("royaume", 20) + " Ton royaume" }), jz,
        el("p", { class: "note", texte: Object.keys(C.JAUGES).map(function (k) { return C.JAUGES[k].effet(c.royaume[k]); }).join(" · ") })]),
      el("div", { class: "cartouche rival" }, [
        el("h3", { html: JEU.icones.icone("defi", 20) + " Les fronts et tes rivaux" }),
        el("div", { class: "lignes-rivaux" }, lignesRivaux(c)),
        el("p", { texte: c.rival.defaites + " attaque" + (c.rival.defaites > 1 ? "s" : "") + " repoussée" + (c.rival.defaites > 1 ? "s" : "") + "." }),
        rx ? el("p", { class: "note ligne-expeditions", texte: ligneExpeditions(rx) }) : null,
        el("div", { class: "menace" }, [el("span", { texte: "Menace" }), el("span", { class: "jr-barre" }, [el("span", { style: "width:" + Math.min(100, c.rival.attaque ? 100 : c.rival.menace * 50) + "%" })])]),
        c.chronique.length ? el("ul", { class: "chronique" }, c.chronique.slice(0, 5).map(function (x, k) { return el("li", { class: k === 0 && conquete ? "neuve" : null, texte: x.texte }); })) : el("p", { class: "note", texte: "La chronique des campagnes est encore vierge." })
      ])
    ]));

    JEU.ui.clavier = function (k) {
      var n = parseInt(k, 10);
      if (n >= 1 && n <= options.length) { options[n - 1].action(); return true; }
      return false;
    };
    if (conquete) {
      // la cérémonie d'abord ; la missive du rival vient à sa fin (missivesApresCeremonie)
      if (annonce) JEU.ui.toast(annonce, "tribut", 5000);
      return;
    }
    annonce = afficherMissives(annonce);
    if (annonce) JEU.ui.toast(annonce, "tribut", 5000);
  };

  // ---------- arsenal : gestion de l'armée ----------
  var EFFETS = {
    archers: "Tir rapide, portée moyenne.", piquiers: "Ralentit et blesse tout ce qui passe.", baliste: "Gros dégâts, très longue portée.",
    catapulte: "Dégâts de zone sur les groupes.", fantassins: "Trois soldats par envoi, pas chers.", cavaliers: "Deux cavaliers rapides : ils rapportent le plus de revenu.", belier: "Lente et très solide : passe là où les autres tombent et frappe le château le plus fort."
  };

  function ouvrirArsenal() {
    var el = JEU.ui.el, C = JEU.campagne, M = JEU.batailleMoteur;
    var boite = el("div", { class: "arsenal" });
    function rendu() {
      var c = C.etat();
      // au clavier, après un achat, le focus reste sur la même ligne (ou passe à la suivante qu'on peut acheter)
      var rang = -1;
      Array.prototype.forEach.call(boite.querySelectorAll(".ligne-arsenal"), function (l, k) { if (l.contains(document.activeElement)) rang = k; });
      boite.innerHTML = "";
      boite.appendChild(el("p", { class: "note", texte: "Tes réserves : " + C.totalRessources() + " ressources. Le prix est pris dans tes réserves les plus fournies. Chaque niveau au-delà du premier ajoute 15 % de force." }));
      [["tours", "Tours", M.TOURS], ["troupes", "Troupes", M.TROUPES]].forEach(function (g) {
        boite.appendChild(el("h3", { texte: g[1] }));
        C.ARSENAL.filter(function (a) { return a.genre === g[0]; }).forEach(function (a) {
          var n = c.arsenal[a.genre][a.type] || 0, prix = C.prixArsenal(a), d = g[2][a.type];
          var etoiles = "";
          for (var k = 1; k <= C.NIVEAU_MAX; k++) etoiles += k <= n ? "◆" : "◇";
          boite.appendChild(el("div", { class: "ligne-arsenal" + (n ? "" : " verrouille") }, [
            el("span", { class: "td-ic", html: JEU.icones.icone(d.icone, 34) }),
            el("div", {}, [el("b", { texte: d.nom + " " }), el("span", { class: "etoiles", texte: etoiles }), el("p", { class: "note", texte: EFFETS[a.type] })]),
            prix == null ? el("span", { class: "etat", texte: "Au maximum" }) :
              el("button", { class: "bouton petit" + (n ? "" : " principal"), disabled: C.totalRessources() < prix, onclick: function () {
                if (C.ameliorerArsenal(a.genre, a.type)) { JEU.sons.jouer("construction"); JEU.ui.majRessources(); JEU.ui.toast(n ? "Amélioré !" : "Débloqué !"); rendu(); }
              }, texte: (n ? "Améliorer" : "Débloquer") + " · " + prix })
          ]));
        });
      });
      var pr = C.prixRemparts();
      boite.appendChild(el("h3", { texte: "Remparts" }));
      boite.appendChild(el("div", { class: "ligne-arsenal" }, [
        el("span", { class: "td-ic", html: JEU.icones.icone("rempart", 34) }),
        el("div", {}, [el("b", { texte: "Murailles du château " + "◆◆◆".slice(0, c.arsenal.remparts) + "◇◇◇".slice(0, 3 - c.arsenal.remparts) }), el("p", { class: "note", texte: "+4 de solidité pour ton château à chaque niveau." })]),
        pr == null ? el("span", { class: "etat", texte: "Au maximum" }) :
          el("button", { class: "bouton petit", disabled: C.totalRessources() < pr, onclick: function () { if (C.renforcerRemparts()) { JEU.sons.jouer("construction"); JEU.ui.majRessources(); rendu(); } }, texte: "Renforcer · " + pr })
      ]));
      if (rang >= 0) remettreFocus(rang);
    }
    function remettreFocus(rang) {
      var lignes = boite.querySelectorAll(".ligne-arsenal");
      for (var k = 0; k < lignes.length; k++) {
        var b = lignes[(rang + k) % lignes.length].querySelector("button:not([disabled])");
        if (b) { b.focus(); return; }
      }
      var fermer = document.querySelector("#modale .modale-fermer"); // plus rien à acheter : le bouton Fermer
      if (fermer) fermer.focus();
    }
    rendu();
    JEU.ui.ouvrirModale("L'arsenal", boite, function () { if (JEU.ui.ecranCourant() === "jouer") JEU.ui.afficher("jouer"); });
  }

  JEU.ecranCampagne = { ouvrirArsenal: ouvrirArsenal, carteSVG: carteSVG,
    // personnages (16/10/2026)
    medaillon: medaillon, medaillonHeraldique: medaillonHeraldique, sceau: sceau, surveillerPortraits: surveillerPortraits,
    fichePersonnage: fichePersonnage, ouvrirFichePersonnage: ouvrirFichePersonnage, ouvrirMissive: ouvrirMissive, lancerBataille: lancerBataille,
    defiAvantRoute: defiAvantRoute };
})(typeof window !== "undefined" ? window : globalThis);
