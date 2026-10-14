// Cartes des batailles : une route par lieu, tracée sur le terrain peint (1000 × 660, rivière d'ouest en est).
// Les emplacements de tours sont calculés le long de la route : les tiens à l'ouest, ceux du rival à l'est.
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};

  // Rivière du terrain peint (relevée sur l'image), pour les ponts et pour ne rien bâtir dans l'eau.
  var RIVIERE = [[0, 253], [125, 241], [250, 228], [375, 243], [500, 256], [600, 268], [690, 275], [750, 254], [810, 231], [900, 220], [1000, 212]];

  var LIEUX = {
    domaine: { nom: "Ton domaine", route: [[85, 360], [220, 450], [380, 470], [470, 380], [520, 255], [600, 160], [760, 170], [850, 260], [915, 330]] },
    gue: { nom: "Le Gué", route: [[85, 350], [250, 330], [420, 420], [560, 440], [640, 300], [700, 180], [850, 220], [915, 330]] },
    foret: { nom: "La Forêt de l'Ouest", route: [[85, 330], [180, 200], [330, 170], [430, 300], [470, 420], [600, 470], [720, 400], [760, 270], [840, 180], [915, 320]] },
    moulin: { nom: "Le Moulin du Val", route: [[85, 340], [200, 470], [330, 480], [360, 350], [300, 250], [380, 150], [520, 150], [600, 330], [700, 470], [840, 450], [915, 340]] },
    col: { nom: "La Tour du Col", route: [[85, 320], [160, 450], [290, 500], [420, 430], [520, 300], [560, 180], [680, 140], [800, 170], [860, 300], [800, 430], [880, 470], [915, 350]] },
    chateau: { nom: "La Forteresse anglaise", route: [[85, 330], [150, 190], [280, 150], [360, 260], [300, 380], [380, 490], [520, 500], [600, 380], [560, 250], [650, 160], [790, 160], [850, 280], [760, 400], [860, 480], [915, 340]] }
  };

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
  function emplacements(route) {
    var M = JEU.batailleMoteur;
    var r = M.preparerRoute(route);
    var cands = [];
    for (var s = 70; s < r.longueur - 70; s += 34) {
      [-1, 1].forEach(function (cote) {
        var p = M.surRoute(r, s, 58 * cote);
        if (!dansPlaine(p.x, p.y)) return;
        if (distLigne(p.x, p.y, route) < 46) return;
        if (distLigne(p.x, p.y, RIVIERE) < 34) return;
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

  // Ponts : là où la route croise la rivière.
  function ponts(route) {
    var r = [];
    for (var i = 1; i < route.length; i++) {
      for (var j = 1; j < RIVIERE.length; j++) {
        var x = intersection(route[i - 1], route[i], RIVIERE[j - 1], RIVIERE[j]);
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

  var cache = {};
  function carte(id) {
    if (cache[id]) return cache[id];
    var l = LIEUX[id];
    var route = lisser(l.route, 10);
    var e = emplacements(route);
    cache[id] = { id: id, nom: l.nom, route: route, emplacements: e.tiens, emplacementsRivaux: e.rivaux, ponts: ponts(route), riviere: RIVIERE };
    return cache[id];
  }

  JEU.cartesBataille = { LIEUX: LIEUX, RIVIERE: RIVIERE, carte: carte };
})(typeof window !== "undefined" ? window : globalThis);
