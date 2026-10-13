// Moteur de la bataille (tower defense à double sens, à la manière de Legion TD 2) : sans DOM, testable sous Node.
// Une route relie ton château (à gauche) au château du seigneur rival (à droite). Tes tours visent ses troupes ;
// ses tours visent les tiennes. Chaque camp envoie des troupes contre le château d'en face.
// Les questions ne sont jamais posées pendant une vague : le temps ne presse jamais l'élève.
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};

  var LARGEUR = 1000, HAUTEUR = 660;

  // Tours. portee en px, cadence en tirs/s, degats par tir ; zone > 0 : dégâts de zone ; ralentit : aura.
  var TOURS = {
    archers:   { nom: "Tour d'archers", icone: "archer", cout: 30, portee: 135, cadence: 1.1, degats: 1.3, projectile: "fleche", vitesse: 560 },
    piquiers:  { nom: "Palissade de piquiers", icone: "piquier", cout: 25, portee: 62, cadence: 1.4, degats: 0.6, projectile: "aucun", ralentit: 0.5 },
    baliste:   { nom: "Baliste", icone: "fleches", cout: 50, portee: 210, cadence: 0.45, degats: 5.5, projectile: "carreau", vitesse: 720 },
    catapulte: { nom: "Trébuchet", icone: "catapulte", cout: 60, portee: 190, cadence: 0.33, degats: 4, zone: 48, projectile: "pierre", vitesse: 300 }
  };
  // Troupes que tu envoies contre le rival. revenu : or gagné en plus à chaque vague suivante (comme dans Legion TD).
  var TROUPES = {
    fantassins: { nom: "Fantassins", icone: "epeiste", cout: 15, pv: 6, vitesse: 44, degats: 1, revenu: 1, nombre: 3 },
    cavaliers:  { nom: "Cavaliers", icone: "cavalier", cout: 30, pv: 9, vitesse: 78, degats: 2, revenu: 2, nombre: 2 },
    belier:     { nom: "Tour de siège", icone: "engin", cout: 55, pv: 40, vitesse: 26, degats: 6, revenu: 3, nombre: 1 }
  };
  // Troupes du seigneur rival.
  var ENNEMIS = {
    pietaille: { nom: "Piétaille", icone: "lances", pv: 5, vitesse: 46, degats: 1 },
    cavaliers: { nom: "Cavaliers", icone: "cavalier", pv: 8, vitesse: 80, degats: 2 },
    hommes:    { nom: "Hommes d'armes", icone: "heaume", pv: 16, vitesse: 34, degats: 2 },
    champion:  { nom: "Champion du rival", icone: "epeiste", pv: 34, vitesse: 30, degats: 5 }
  };
  var TOURS_RIVALES = { archers: { portee: 120, cadence: 0.6, degats: 1, projectile: "fleche", vitesse: 560 }, baliste: { portee: 180, cadence: 0.3, degats: 3.5, projectile: "carreau", vitesse: 720 } };
  var AMELIORATION = { facteur: 0.6, coutRatio: 0.8, max: 3 };

  // ---------- géométrie de la route ----------
  function preparerRoute(points) {
    var cumul = [0];
    for (var i = 1; i < points.length; i++) {
      var dx = points[i][0] - points[i - 1][0], dy = points[i][1] - points[i - 1][1];
      cumul.push(cumul[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    return { points: points, cumul: cumul, longueur: cumul[cumul.length - 1] };
  }

  // Point de la route à la distance s depuis ton château, décalé de « cote » px sur le côté (deux files).
  function surRoute(route, s, cote) {
    var c = route.cumul, p = route.points;
    s = Math.max(0, Math.min(route.longueur, s));
    var i = 1;
    while (i < c.length - 1 && c[i] < s) i++;
    var t = (s - c[i - 1]) / ((c[i] - c[i - 1]) || 1);
    var dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p[i - 1][0] + dx * t - dy / l * (cote || 0), y: p[i - 1][1] + dy * t + dx / l * (cote || 0), angle: Math.atan2(dy, dx) };
  }

  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

  // ---------- partie ----------
  // carte : { route: [[x,y]...], emplacements: [[x,y]...] (les tiens), emplacementsRivaux: [[x,y]...] }
  // options : { vagues, orDepart, pvChateau, pvRival, niveau (0..4), bonusDegats (0..0.3), arsenal: {tours, troupes} }
  function creer(carte, options) {
    var o = options || {};
    var route = preparerRoute(carte.route);
    var p = {
      route: route, carte: carte, niveau: o.niveau || 0,
      vague: 0, vagues: o.vagues || 4, phase: "preparation", fin: null,
      or: o.orDepart != null ? o.orDepart : 60, revenu: 25,
      chateau: { pv: o.pvChateau || 20, max: o.pvChateau || 20 },
      rival: { pv: o.pvRival || 20, max: o.pvRivalMax || o.pvRival || 20 },
      bonusDegats: o.bonusDegats || 0,
      arsenal: o.arsenal || { tours: { archers: 1, piquiers: 1 }, troupes: { fantassins: 1 } },
      tours: [], toursRivales: [], unites: [], projectiles: [], effets: [],
      envois: [], fileRivale: [], fileAmie: [], minuterieRivale: 0, minuterieAmie: 0,
      modificateurs: o.espion ? { espion: true } : {}, orParReponse: o.orParReponse || 12, temps: 0, stats: { tues: 0, fuites: 0, degatsRival: 0, envoyes: 0 }
    };
    return p;
  }

  function niveauArsenal(p, genre, type) {
    var t = p.arsenal[genre] || {};
    return t[type] || 0;
  }

  // Bonus d'arsenal : chaque niveau au-delà de 1 ajoute 15 % de dégâts (tours) ou de points de vie (troupes).
  function bonusArsenal(p, genre, type) { return 1 + 0.15 * Math.max(0, niveauArsenal(p, genre, type) - 1); }

  function emplacementLibre(p, i) { return !p.tours.some(function (t) { return t.emplacement === i; }); }

  function poserTour(p, type, i) {
    var d = TOURS[type];
    if (!d || p.phase !== "preparation" || !niveauArsenal(p, "tours", type)) return false;
    if (i < 0 || i >= p.carte.emplacements.length || !emplacementLibre(p, i) || p.or < d.cout) return false;
    p.or -= d.cout;
    var e = p.carte.emplacements[i];
    p.tours.push({ type: type, emplacement: i, x: e[0], y: e[1], niveau: 1, recharge: 0, investi: d.cout, angle: 0 });
    return true;
  }

  function coutAmelioration(t) { return Math.round(TOURS[t.type].cout * AMELIORATION.coutRatio * t.niveau); }

  function ameliorerTour(p, i) {
    var t = p.tours.filter(function (x) { return x.emplacement === i; })[0];
    if (!t || p.phase !== "preparation" || t.niveau >= AMELIORATION.max) return false;
    var c = coutAmelioration(t);
    if (p.or < c) return false;
    p.or -= c; t.niveau++; t.investi += c;
    return true;
  }

  function envoyer(p, type) {
    var d = TROUPES[type];
    if (!d || p.phase !== "preparation" || !niveauArsenal(p, "troupes", type) || p.or < d.cout) return false;
    p.or -= d.cout;
    for (var k = 0; k < (d.nombre || 1); k++) p.envois.push(type);
    p.revenu += d.revenu;
    return true;
  }

  function gagnerOr(p, n) { p.or += n; }

  // Composition d'une vague rivale : grossit avec le numéro de vague et le niveau de la province.
  function composerVague(p) {
    var w = p.vague, n = p.niveau;
    var file = [];
    var nb = 4 + 2 * w + Math.floor(n / 2);
    for (var i = 0; i < nb; i++) {
      var r = (i * 7 + w * 3) % 10;
      if (w >= 2 && r < 2 + n) file.push("hommes");
      else if (w >= 1 && r < 5) file.push("cavaliers");
      else file.push("pietaille");
    }
    if (w === p.vagues - 1) file.push("champion");
    if (p.modificateurs.espion && file.length) file.splice(file.indexOf("hommes") >= 0 ? file.indexOf("hommes") : file.length - 1, 1);
    return file;
  }

  // Le rival bâtit une tour de plus à chaque vague à partir de la deuxième (deux par vague dans son château).
  function rivalConstruit(p) {
    var nb = (p.vague === 0 ? p.niveau >= 2 ? 1 : 0 : 1) + (p.niveau >= 4 ? 1 : 0);
    var libres = p.carte.emplacementsRivaux.map(function (e, i) { return i; }).filter(function (i) {
      return !p.toursRivales.some(function (t) { return t.emplacement === i; });
    });
    for (var k = 0; k < nb && libres.length; k++) {
      var i = libres.shift();
      var e = p.carte.emplacementsRivaux[i];
      var type = (p.toursRivales.length + p.niveau) % 3 === 2 ? "baliste" : "archers";
      p.toursRivales.push({ type: type, emplacement: i, x: e[0], y: e[1], niveau: 1, recharge: 0, rivale: true, angle: Math.PI });
    }
  }

  function lancerVague(p) {
    if (p.phase !== "preparation" || p.fin) return false;
    p.phase = "vague";
    rivalConstruit(p);
    p.fileRivale = composerVague(p);
    p.fileAmie = p.envois.slice();
    p.stats.envoyes += p.envois.length;
    p.envois = [];
    p.minuterieRivale = 0.6; p.minuterieAmie = 0.3;
    return true;
  }

  function creerUnite(p, camp, type) {
    var d = camp === "rival" ? ENNEMIS[type] : TROUPES[type];
    var echelle = camp === "rival" ? 1 + 0.1 * p.niveau + 0.07 * p.vague : bonusArsenal(p, "troupes", type);
    var pv = d.pv * echelle;
    var v = d.vitesse * (p.modificateurs.pluie ? 0.8 : 1);
    var u = { camp: camp, type: type, pv: pv, max: pv, vitesse: v, degats: d.degats, s: camp === "rival" ? p.route.longueur : 0, cote: camp === "rival" ? -9 : 9, ralenti: 0, vivant: true, pas: Math.random() * 6 };
    var pos = surRoute(p.route, u.s, u.cote); u.x = pos.x; u.y = pos.y; u.angle = pos.angle;
    p.unites.push(u);
    return u;
  }

  function effet(p, genre, x, y, extra) {
    var e = { genre: genre, x: x, y: y, age: 0 };
    if (extra) Object.keys(extra).forEach(function (k) { e[k] = extra[k]; });
    p.effets.push(e);
  }

  function degatsTour(p, t) {
    var d = t.rivale ? TOURS_RIVALES[t.type] : TOURS[t.type];
    var base = d.degats * (1 + AMELIORATION.facteur * (t.niveau - 1));
    if (!t.rivale) base *= bonusArsenal(p, "tours", t.type) * (1 + p.bonusDegats) * (p.modificateurs.flechesNeuves && t.type === "archers" ? 1.5 : 1);
    else base *= 1 + 0.08 * p.niveau;
    return base;
  }

  function porteeTour(p, t) {
    var d = t.rivale ? TOURS_RIVALES[t.type] : TOURS[t.type];
    var r = d.portee;
    if (t.rivale && p.modificateurs.brouillard) r *= 0.7;
    return r;
  }

  // Cible : l'unité adverse à portée la plus avancée vers son but.
  function cible(p, t) {
    var visee = t.rivale ? "joueur" : "rival";
    var r = porteeTour(p, t), meilleure = null, score = -1;
    p.unites.forEach(function (u) {
      if (!u.vivant || u.camp !== visee) return;
      if (dist(t, u) > r) return;
      var avance = visee === "rival" ? p.route.longueur - u.s : u.s;
      if (avance > score) { score = avance; meilleure = u; }
    });
    return meilleure;
  }

  function blesser(p, u, d) {
    if (!u.vivant) return;
    u.pv -= d;
    if (u.pv <= 0) {
      u.vivant = false;
      effet(p, "chute", u.x, u.y, { camp: u.camp });
      if (u.camp === "rival") { p.stats.tues++; p.or += 1; }
    }
  }

  function etapeTours(p, dt, liste) {
    liste.forEach(function (t) {
      var d = t.rivale ? TOURS_RIVALES[t.type] : TOURS[t.type];
      t.recharge -= dt;
      if (d.ralentit) {
        // palissade : ralentit et blesse un peu tout ce qui passe à portée
        p.unites.forEach(function (u) {
          if (u.vivant && u.camp === "rival" && dist(t, u) <= porteeTour(p, t)) { u.ralenti = 0.15; if (t.recharge <= 0) { blesser(p, u, degatsTour(p, t)); effet(p, "pique", u.x, u.y); } }
        });
        if (t.recharge <= 0) t.recharge = 1 / d.cadence;
        return;
      }
      if (t.recharge > 0) return;
      var u = cible(p, t);
      if (!u) return;
      t.recharge = 1 / d.cadence;
      t.angle = Math.atan2(u.y - t.y, u.x - t.x);
      var duree = dist(t, u) / d.vitesse;
      p.projectiles.push({ genre: d.projectile, x0: t.x, y0: t.y - 18, cible: u, cx: u.x, cy: u.y, t: 0, duree: Math.max(0.12, duree), degats: degatsTour(p, t), zone: d.zone || 0, camp: t.rivale ? "rival" : "joueur" });
    });
  }

  function etapeProjectiles(p, dt) {
    p.projectiles = p.projectiles.filter(function (pr) {
      pr.t += dt;
      if (pr.cible.vivant) { pr.cx = pr.cible.x; pr.cy = pr.cible.y; }
      if (pr.t < pr.duree) return true;
      if (pr.zone) {
        effet(p, "impact", pr.cx, pr.cy, { rayon: pr.zone });
        p.unites.forEach(function (u) { if (u.vivant && u.camp === "rival" && dist(u, { x: pr.cx, y: pr.cy }) <= pr.zone) blesser(p, u, pr.degats); });
      } else if (pr.cible.vivant) {
        blesser(p, pr.cible, pr.degats);
        effet(p, "touche", pr.cx, pr.cy);
      }
      return false;
    });
  }

  function etapeUnites(p, dt) {
    p.unites.forEach(function (u) {
      if (!u.vivant) return;
      var v = u.vitesse * (u.ralenti > 0 ? (1 - TOURS.piquiers.ralentit) : 1);
      u.ralenti = Math.max(0, u.ralenti - dt);
      u.s += (u.camp === "rival" ? -v : v) * dt;
      u.pas += dt * v / 9;
      var pos = surRoute(p.route, u.s, u.cote); u.x = pos.x; u.y = pos.y; u.angle = pos.angle;
      if (u.camp === "rival" && u.s <= 0) {
        u.vivant = false;
        p.chateau.pv = Math.max(0, p.chateau.pv - u.degats);
        p.stats.fuites++;
        effet(p, "breche", u.x, u.y, { camp: "joueur", degats: u.degats });
      } else if (u.camp === "joueur" && u.s >= p.route.longueur) {
        u.vivant = false;
        p.rival.pv = Math.max(0, p.rival.pv - u.degats);
        p.stats.degatsRival += u.degats;
        effet(p, "breche", u.x, u.y, { camp: "rival", degats: u.degats });
      }
    });
    p.unites = p.unites.filter(function (u) { return u.vivant; });
  }

  function etapeFiles(p, dt) {
    p.minuterieRivale -= dt; p.minuterieAmie -= dt;
    if (p.fileRivale.length && p.minuterieRivale <= 0) { creerUnite(p, "rival", p.fileRivale.shift()); p.minuterieRivale = 1.05 - Math.min(0.4, 0.05 * p.vague); }
    if (p.fileAmie.length && p.minuterieAmie <= 0) { creerUnite(p, "joueur", p.fileAmie.shift()); p.minuterieAmie = 0.55; }
  }

  // Avance la simulation de dt secondes. Renvoie la phase en cours.
  function etape(p, dt) {
    p.temps += dt;
    p.effets.forEach(function (e) { e.age += dt; });
    p.effets = p.effets.filter(function (e) { return e.age < 1.2; });
    if (p.phase !== "vague") return p.phase;
    etapeFiles(p, dt);
    etapeUnites(p, dt);
    etapeTours(p, dt, p.tours);
    etapeTours(p, dt, p.toursRivales);
    etapeProjectiles(p, dt);
    if (p.rival.pv <= 0) return terminer(p, "victoire");
    if (p.chateau.pv <= 0) return terminer(p, "retraite");
    if (!p.fileRivale.length && !p.fileAmie.length && !p.unites.length && !p.projectiles.length) {
      p.vague++;
      p.modificateurs = {};
      if (p.vague >= p.vagues) return terminer(p, "tenu");
      p.phase = "preparation";
      p.or += p.revenu;
    }
    return p.phase;
  }

  // victoire : château rival tombé ; tenu : toutes les vagues repoussées ; retraite : tes murs ont cédé.
  // Dans les trois cas, rien de ce qui est gagné n'est perdu.
  function terminer(p, issue) {
    p.phase = "fin"; p.fin = issue;
    p.projectiles = [];
    return p.phase;
  }

  // Joue une vague complète d'un coup (tests et équilibrage).
  function jouerVague(p, pas) {
    lancerVague(p);
    var garde = 0;
    while (p.phase === "vague" && garde++ < 20000) etape(p, pas || 0.05);
    return p.phase;
  }

  JEU.batailleMoteur = {
    LARGEUR: LARGEUR, HAUTEUR: HAUTEUR, TOURS: TOURS, TROUPES: TROUPES, ENNEMIS: ENNEMIS, TOURS_RIVALES: TOURS_RIVALES, AMELIORATION: AMELIORATION,
    creer: creer, poserTour: poserTour, ameliorerTour: ameliorerTour, coutAmelioration: coutAmelioration, envoyer: envoyer, gagnerOr: gagnerOr,
    lancerVague: lancerVague, etape: etape, jouerVague: jouerVague, surRoute: surRoute, preparerRoute: preparerRoute,
    emplacementLibre: emplacementLibre, niveauArsenal: niveauArsenal, porteeTour: porteeTour, degatsTour: degatsTour
  };
})(typeof window !== "undefined" ? window : globalThis);
