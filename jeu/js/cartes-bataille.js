// Cartes des batailles : une route par lieu (1000 × 660), de la porte de ta place forte (à l'ouest) à la porte de la
// place adverse (à l'est). Les emplacements de tours sont calculés le long de la route : les tiens à l'ouest, ceux du
// rival à l'est. Chaque carte a son ruisseau (hauteur et largeur propres), rendu dans le terrain 3D.
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};

  // Ruisseau de référence (celui des premiers terrains) : il sert seulement à garder les emplacements de tours tels
  // qu'ils ont toujours été calculés (aucun ne bouge d'une version à l'autre). Le ruisseau de chaque carte (riviere
  // dans LIEUX) passe toujours à bonne distance de ces emplacements (contrôlé par tests.js).
  var RIVIERE = [[0, 253], [125, 241], [250, 228], [375, 243], [500, 256], [600, 268], [690, 275], [750, 254], [810, 231], [900, 220], [1000, 212]];

  // route : tracé d'une place forte à l'autre (pied de chaque place forte aux deux bouts ; la route vraie part de leurs
  // portes, voir raccorder). riviere : axe du ruisseau de la carte ; rive : sa demi-largeur moyenne (px) ;
  // gue : numéro de la traversée (dans l'ordre de la route) passée à gué, sur des galets, sans pont ; sorties : points
  // de passage entre une porte et le tracé, pour que la route contourne la place forte au lieu de longer ses murs.
  // Fin des tracés (0.6.3) : la route arrive à la porte des rivaux dans l'axe de son seuil (ouest-sud-ouest), par un lacet
  // ouvert (virages d'au moins 45 px de rayon, jambes à plus de 110 px l'une de l'autre) au lieu d'une épingle ;
  // dessinés par arcs et segments (atelier, trace.py), un point tous les 25 à 30 px. Forêt et Forteresse anglaise : la
  // sortie de ta porte (sud-est) tourne en boucle large avant de rejoindre le tracé.
  var LIEUX = {
    domaine: { nom: "Ton domaine", route: [[85, 360], [220, 450], [380, 470], [470, 380], [520, 255], [564, 215], [592, 187], [611, 172], [633, 163], [656, 160], [666, 160], [697, 169], [720, 191], [728, 222], [728, 253], [728, 283], [728, 313], [735, 343], [755, 365], [783, 375], [813, 371], [838, 361], [864, 351], [889, 340], [915, 330]],
      riviere: RIVIERE, rive: 11 },
    gue: { nom: "Le Gué", route: [[85, 350], [250, 330], [420, 420], [560, 440], [640, 296], [648, 272], [656, 247], [664, 223], [672, 198], [687, 173], [712, 158], [741, 156], [768, 167], [787, 189], [793, 218], [793, 244], [793, 271], [793, 298], [799, 323], [817, 343], [842, 352], [869, 349], [892, 339], [915, 330]],
      riviere: [[0, 206], [130, 208], [260, 214], [380, 234], [500, 250], [600, 262], [690, 266], [760, 246], [830, 224], [910, 212], [1000, 204]], rive: 15, riveSud: 20, gue: 0 },
    foret: { nom: "La Forêt de l'Ouest", route: [[85, 330], [180, 200], [330, 170], [430, 300], [470, 420], [565, 459], [595, 462], [623, 452], [642, 430], [650, 401], [650, 372], [650, 344], [650, 315], [650, 287], [650, 258], [650, 230], [650, 201], [655, 175], [670, 154], [691, 139], [717, 134], [743, 139], [764, 154], [779, 176], [784, 201], [784, 231], [784, 261], [784, 291], [790, 317], [808, 337], [833, 346], [859, 342], [887, 331], [915, 320]],
      riviere: [[576, -20], [572, 50], [590, 130], [578, 210], [600, 290], [586, 370], [604, 450], [590, 540], [606, 690]], rive: 7.5,
      sorties: { depart: [[117, 363], [140, 376], [166, 376], [187, 362], [199, 339], [203, 316], [208, 294], [212, 271], [216, 248], [220, 226], [229, 203], [245, 185]], raccordDepart: 243.0 } },
    moulin: { nom: "Le Moulin du Val", route: [[85, 340], [200, 470], [330, 480], [360, 350], [300, 250], [380, 150], [520, 150], [600, 330], [635, 415], [649, 436], [664, 456], [687, 475], [717, 481], [745, 471], [765, 449], [776, 429], [787, 409], [802, 390], [822, 377], [845, 368], [869, 359], [892, 349], [915, 340]],
      riviere: [[0, 250], [125, 244], [250, 240], [375, 246], [500, 258], [600, 268], [690, 272], [750, 256], [810, 238], [900, 226], [1000, 220]], rive: 12 },
    col: { nom: "La Tour du Col", route: [[85, 320], [160, 450], [290, 500], [420, 430], [520, 300], [560, 180], [638, 157], [668, 157], [698, 165], [720, 187], [728, 217], [728, 246], [728, 275], [728, 304], [728, 333], [735, 363], [755, 385], [783, 395], [813, 391], [838, 381], [864, 371], [889, 360], [915, 350]],
      riviere: [[0, 186], [120, 198], [240, 212], [360, 230], [470, 250], [560, 262], [650, 254], [740, 244], [820, 246], [910, 240], [1000, 232]], rive: 7 },
    chateau: { nom: "La Forteresse anglaise", route: [[85, 330], [150, 190], [280, 150], [360, 260], [300, 380], [380, 490], [520, 500], [600, 380], [570, 248], [570, 218], [577, 191], [597, 171], [625, 163], [650, 163], [675, 163], [704, 171], [725, 193], [733, 222], [733, 247], [733, 272], [732, 297], [732, 322], [740, 351], [760, 373], [788, 383], [818, 379], [842, 369], [866, 360], [891, 350], [915, 340]],
      riviere: [[0, 250], [125, 240], [250, 230], [375, 242], [500, 254], [600, 266], [690, 272], [750, 252], [810, 230], [900, 220], [1000, 212]], rive: 10,
      sorties: { depart: [[117, 363], [140, 376], [166, 376], [187, 362], [199, 339], [204, 313], [209, 287], [214, 261], [219, 236], [227, 214], [243, 196], [264, 186], [287, 183], [310, 189], [329, 203]], raccordDepart: 381.1 } }
  };

  // Seuil de la porte de chaque place forte, depuis son pied (px logiques), et direction vers l'extérieur : relevés sur
  // les rendus (atelier/outils/rendu-3d/places.py, porte_ecran). France : porte au sud-est, face à l'écran. Camps
  // rivaux (Angleterre et Omeyyades, à moins d'un pixel l'un de l'autre) : porte à l'ouest-sud-ouest.
  var PORTES = { depart: { dx: 17, dy: 17.5, ux: 0.697, uy: 0.717 }, arrivee: { dx: -34.1, dy: 13.7, ux: -0.928, uy: 0.373 } };
  var SORTIE = 16, RACCORD = 72; // px : la route sort droit de la porte, puis rejoint le tracé 72 px plus loin

  // Lissage Catmull-Rom : une route souple plutôt qu'une ligne brisée.
  function lisser(pts, pas) {
    var r = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (var k = 0; k < pas; k++) {
        var t = k / pas, t2 = t * t, t3 = t2 * t;
        r.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    r.push(pts[pts.length - 1].slice());
    return r;
  }

  function distSegment(x, y, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
    var t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
    var px = a[0] + t * dx - x, py = a[1] + t * dy - y;
    return Math.sqrt(px * px + py * py);
  }
  function distLigne(x, y, ligne) {
    var m = Infinity;
    for (var i = 1; i < ligne.length; i++) m = Math.min(m, distSegment(x, y, ligne[i - 1], ligne[i]));
    return m;
  }
  function dansPlaine(x, y) { var a = (x - 500) / 445, b = (y - 330) / 285; return a * a + b * b < 0.86; }

  // Emplacements : de part et d'autre de la route, à bonne distance de la route, de l'eau et des autres.
  // riviere, riveMax : ruisseau de la carte et sa plus grande demi-largeur moyenne (variante du sud comprise) : aucun
  // emplacement à moins de 1,6 × riveMax + 8 px de son axe (le terrain 3D élargit l'eau jusqu'à 1,55 fois par endroits).
  function emplacements(route, riviere, riveMax) {
    var M = JEU.batailleMoteur;
    var r = M.preparerRoute(route);
    var cands = [];
    for (var s = 70; s < r.longueur - 70; s += 34) {
      [-1, 1].forEach(function (cote) {
        var p = M.surRoute(r, s, 58 * cote);
        if (!dansPlaine(p.x, p.y)) return;
        if (distLigne(p.x, p.y, route) < 46) return;
        if (distLigne(p.x, p.y, RIVIERE) < 34) return;
        if (riviere && distLigne(p.x, p.y, riviere) < 1.6 * riveMax + 8) return;
        if (Math.abs(p.x - 70) < 70 && Math.abs(p.y - 345) < 70) return;   // ton château
        if (Math.abs(p.x - 930) < 70 && Math.abs(p.y - 335) < 70) return;  // château rival
        cands.push([Math.round(p.x), Math.round(p.y)]);
      });
    }
    var garde = [];
    cands.forEach(function (c) {
      if (garde.every(function (g) { return Math.hypot(g[0] - c[0], g[1] - c[1]) > 64; })) garde.push(c);
    });
    // Puis on retire, sans en ajouter d'autres (les terrains rendus en 3D gardent l'herbe libre à chaque emplacement
    // calculé avant ce tri) : les emplacements trop hauts, dont la tour passerait sous le bandeau (une tour dépasse de
    // 69 px au-dessus de son pied, le bandeau descend jusqu'à 56 px : 69 + 56 = 125), et ceux collés à une place
    // forte (son image couvre environ 115 × 105 px autour de son pied).
    function libre(c) {
      if (c[1] < 125) return false;
      if (Math.abs(c[0] - 915) < 105 && Math.abs(c[1] - 335) < 95) return false;   // château rival
      if (Math.abs(c[0] - 85) < 105 && Math.abs(c[1] - 345) < 95) return false;    // ton château
      return true;
    }
    return {
      tiens: garde.filter(function (c) { return c[0] < 500 && libre(c); }),
      rivaux: garde.filter(function (c) { return c[0] > 560; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 6).filter(libre)
    };
  }

  // Traversées (ponts, ou gué) : là où la route croise le ruisseau de la carte.
  function ponts(route, riviere) {
    var r = [];
    for (var i = 1; i < route.length; i++) {
      for (var j = 1; j < riviere.length; j++) {
        var x = intersection(route[i - 1], route[i], riviere[j - 1], riviere[j]);
        if (x && r.some(function (q) { return Math.hypot(q.x - x[0], q.y - x[1]) < 3; })) continue;  // même traversée
        if (x) r.push({ x: x[0], y: x[1], angle: Math.atan2(route[i][1] - route[i - 1][1], route[i][0] - route[i - 1][0]) });
      }
    }
    return r;
  }
  function intersection(a, b, c, d) {
    var den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
    if (!den) return null;
    var t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
    var u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] : null;
  }

  // Route vraie : de la porte de ta place forte jusqu'à la porte de la place adverse. Elle sort droit de la porte
  // (SORTIE px), puis rejoint en douceur le tracé à RACCORD px du pied de la place ; les troupes entrent et sortent par
  // la porte, jamais à travers un mur.
  // sorties : points de passage facultatifs entre la porte et le tracé (la route contourne alors la place forte).
  // Le tracé est rejoint au premier point à plus de RACCORD px du pied (ou raccordDepart, raccordArrivee) qui soit hors
  // de l'emprise de la place.
  function raccorder(base, sorties) {
    function hors(p, pied) { return p[0] < pied[0] - 78 || p[0] > pied[0] + 78 || p[1] < pied[1] - 100 || p[1] > pied[1] + 58; }
    function tete(pts, pied, porte, extra, raccord) {
      var cumul = 0, j = 1;
      while (j < pts.length - 2 && (cumul < (raccord || RACCORD) || !hors(pts[j], pied))) { cumul += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); j++; }
      var d = [pied[0] + porte.dx, pied[1] + porte.dy], o = [d[0] + porte.ux * SORTIE, d[1] + porte.uy * SORTIE];
      var ctrl = [d, o].concat(extra || [], [pts[j], pts[j + 1]]);
      var lisse = lisser(ctrl, 8); // un tronçon de 8 points par paire de points : on garde tout sauf le dernier
      return lisse.slice(0, 8 * (ctrl.length - 2)).map(function (p) { return [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]; }).concat(pts.slice(j));
    }
    var s = sorties || {};
    var r = tete(base, base[0], PORTES.depart, s.depart, s.raccordDepart).reverse();
    return tete(r, base[base.length - 1], PORTES.arrivee, s.arrivee, s.raccordArrivee).reverse();
  }

  var cache = {};
  function carte(id) {
    if (cache[id]) return cache[id];
    var l = LIEUX[id];
    var base = lisser(l.route, 10);
    var e = emplacements(base, l.riviere, Math.max(l.rive || 11, l.riveSud || 0));
    var route = raccorder(base, l.sorties), riviere = l.riviere || RIVIERE;
    var ps = ponts(route, riviere);
    if (l.gue !== undefined && ps[l.gue]) ps[l.gue].gue = true;
    // places : pied de chaque place forte (point d'ancrage de son image) ; route : de porte à porte
    cache[id] = { id: id, nom: l.nom, route: route, places: { depart: base[0].slice(), arrivee: base[base.length - 1].slice() },
      emplacements: e.tiens, emplacementsRivaux: e.rivaux, ponts: ps, riviere: riviere, rive: l.rive || 11 };
    return cache[id];
  }

  JEU.cartesBataille = { LIEUX: LIEUX, RIVIERE: RIVIERE, PORTES: PORTES, carte: carte };
})(typeof window !== "undefined" ? window : globalThis);
