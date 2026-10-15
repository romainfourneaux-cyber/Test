// Moteur de la bataille (tower defense à double sens, à la manière de Legion TD 2) : sans DOM, testable sous Node.
// Une route relie ton château (à gauche) au château du seigneur rival (à droite). Tes tours visent ses troupes ;
// ses tours visent les tiennes. Chaque camp envoie des troupes contre le château d'en face.
// Les questions ne sont jamais posées pendant une vague : le temps ne presse jamais l'élève.
// Mêlée (depuis le 15/10/2026, demande de Romain) : quand une de tes troupes et une troupe adverse se rencontrent sur la
// route, elles s'arrêtent, se font face et échangent des coups jusqu'à ce que l'une tombe ; la survivante reprend sa
// marche. Les tours continuent de tirer. Le moteur émet des effets (choc, coup, chute) que le rendu dessine ; il ignore
// le réglage « Sang dans les combats », que seul le rendu lit.
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};

  var LARGEUR = 1000, HAUTEUR = 660;

  // Tours. portee en px, cadence en tirs/s, degats par tir ; zone > 0 : dégâts de zone ; ralentit : aura.
  // Palissade : les emplacements sont à 58 px du milieu de la route et la file ennemie à 9 px de ce milieu ;
  // avec 85 px de portée, la palissade touche la file ennemie depuis chaque emplacement, des deux côtés de la route.
  var TOURS = {
    archers:   { nom: "Tour d'archers", icone: "archer", cout: 30, portee: 135, cadence: 1.1, degats: 1.3, projectile: "fleche", vitesse: 560 },
    piquiers:  { nom: "Palissade de piquiers", icone: "piquier", cout: 25, portee: 85, cadence: 1.4, degats: 0.6, projectile: "aucun", ralentit: 0.5 },
    baliste:   { nom: "Baliste", icone: "fleches", cout: 50, portee: 210, cadence: 0.45, degats: 5.5, projectile: "carreau", vitesse: 720 },
    catapulte: { nom: "Trébuchet", icone: "catapulte", cout: 60, portee: 190, cadence: 0.33, degats: 4, zone: 48, projectile: "pierre", vitesse: 300 }
  };
  // Troupes que tu envoies contre le rival. revenu : or gagné en plus à chaque vague suivante (comme dans Legion TD).
  // Chaque troupe a son usage : fantassins pas chers et nombreux ; cavaliers rapides qui rapportent le plus de revenu ;
  // tour de siège lente et très solide, qui frappe le plus fort et passe là où les autres tombent.
  // Pour le même or, les troupes à débloquer frappent au moins aussi fort que les fantassins et rapportent au moins autant.
  // degats : coups portés au château d'en face quand la troupe l'atteint ; coup : dégâts d'un coup au corps à corps ;
  // charge : le premier coup de chaque mêlée part plus vite et frappe double (cavaliers).
  // Mêlée réglée le 15/10/2026 avec atelier/outils/simuler-bataille.js (docs/JOURNAL.md, Décisions) : tes troupes, payées
  // avec l'or du conseil, valent mieux une à une que la piétaille adverse (points de vie relevés : 6 → 8, 9 → 12, 70 → 80),
  // mais le rival en aligne bien plus et ses hommes d'armes et son champion tiennent la route.
  var TROUPES = {
    fantassins: { nom: "Fantassins", icone: "epeiste", cout: 15, pv: 8, vitesse: 44, degats: 1, revenu: 1, nombre: 3, coup: 3 },
    cavaliers:  { nom: "Cavaliers", icone: "cavalier", cout: 30, pv: 12, vitesse: 78, degats: 3, revenu: 3, nombre: 2, coup: 3.5, charge: true },
    belier:     { nom: "Tour de siège", icone: "engin", cout: 45, pv: 80, vitesse: 26, degats: 10, revenu: 3, nombre: 1, coup: 5 }
  };
  // Troupes du seigneur rival.
  var ENNEMIS = {
    pietaille: { nom: "Piétaille", icone: "lances", pv: 5, vitesse: 46, degats: 1, coup: 0.8 },
    cavaliers: { nom: "Cavaliers", icone: "cavalier", pv: 8, vitesse: 80, degats: 2, coup: 1.2, charge: true },
    hommes:    { nom: "Hommes d'armes", icone: "heaume", pv: 16, vitesse: 34, degats: 2, coup: 1.6 },
    champion:  { nom: "Champion anglais", icone: "epeiste", pv: 34, vitesse: 30, degats: 5, coup: 3 }
  };
  var TOURS_RIVALES = { archers: { portee: 120, cadence: 0.6, degats: 1, projectile: "fleche", vitesse: 560 }, baliste: { portee: 180, cadence: 0.3, degats: 3.5, projectile: "carreau", vitesse: 720 } };
  var AMELIORATION = { facteur: 0.6, coutRatio: 0.8, max: 3 };
  // Vagues du seigneur rival (réglées avec atelier/outils/simuler-bataille.js) : base + parVague × numéro de vague + le
  // renfort du niveau (RIVAL) ; points de vie × (pv du niveau + pvVague × vague) ; ecartSortie : secondes entre deux
  // sorties (moins 0,05 par vague, 0,4 au plus).
  var VAGUES = { base: 4, parVague: 2, pvVague: 0.07, ecartSortie: 1.05 };
  // Le seigneur rival selon le niveau de la province (0 à 4 ; la défense du domaine prend le niveau de la campagne).
  // renfort : troupes de plus à chaque vague ; pv : points de vie de ses troupes (×) ; tirs : dégâts de ses tours (×) ;
  // cadence : leurs tirs par seconde (×) ; coup : ses coups au corps à corps (×) ; toursDepart : tours qu'il bâtit avant la première vague ; toursVague : tours
  // de plus à chaque vague suivante.
  var RIVAL = [
    { renfort: 0, pv: 1, tirs: 1, cadence: 1, coup: 1, toursDepart: 0, toursVague: 1 },
    { renfort: 0, pv: 1.1, tirs: 1.08, cadence: 1, coup: 1, toursDepart: 0, toursVague: 1 },
    { renfort: 1, pv: 1.2, tirs: 1.16, cadence: 1, coup: 1, toursDepart: 1, toursVague: 1 },
    { renfort: 1, pv: 1.3, tirs: 1.24, cadence: 1, coup: 1, toursDepart: 1, toursVague: 1 },
    { renfort: 2, pv: 1.4, tirs: 1.32, cadence: 1, coup: 1, toursDepart: 2, toursVague: 2 }
  ];
  // Défense du domaine (carte « domaine », ou options.defense) : le rival y vient en force, en plus de son niveau.
  // renfort : troupes de plus à chaque vague ; pv, coup : × sur les points de vie et les coups de ses troupes.
  var DEFENSE = { renfort: 0, pv: 1, coup: 1 };
  // Mêlée. contact : écart le long de la route (px) où deux troupes adverses libres s'engagent ; ecart : distance où elles
  // se battent ; cadence : secondes entre deux coups ; premierCoup : délai du premier coup (chargeCoup pour une charge, qui
  // frappe « charge » fois plus fort) ; coteCombat : décalage sur le côté de la route pendant le combat (les files de
  // marche sont à 9 px du milieu). Une troupe libre passe à côté d'une mêlée en cours et va chercher la suivante : les
  // combats s'égrènent le long de la route, une paire à la fois par troupe.
  var MELEE = { contact: 20, ecart: 16, cadence: 0.8, premierCoup: 0.35, chargeCoup: 0.12, charge: 2, coteCombat: 6 };
  // Effets : durée de vie (s). Un soldat tombé reste couché DUREE_CHUTE secondes avant de s'effacer ; TOMBES : plafond des
  // soldats tombés gardés à l'écran (le plus ancien part le premier).
  var DUREE_EFFET = 1.2, DUREE_CHUTE = 6, TOMBES = 40;
  // Or du conseil de guerre : BONUS_SERIE en plus au troisième succès d'affilée ; une erreur coûte orPerduErreur
  // (OR_PERDU par défaut ; config.js, orPerduErreur), pris sur l'or de la bataille, jamais en dessous de zéro.
  var BONUS_SERIE = 10, OR_PERDU = 6;

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
  // options : { vagues, orDepart, pvChateau, pvRival, niveau (0..4), bonusDegats (0..0.3), arsenal: {tours, troupes},
  //             orParReponse, orPerduErreur, defense (par défaut : la carte est celle du domaine) }
  function creer(carte, options) {
    var o = options || {};
    var route = preparerRoute(carte.route);
    var p = {
      route: route, carte: carte, niveau: o.niveau || 0, defense: o.defense != null ? !!o.defense : carte.id === "domaine",
      vague: 0, vagues: o.vagues || 4, phase: "preparation", fin: null,
      or: o.orDepart != null ? o.orDepart : 60, revenu: 25,
      chateau: { pv: o.pvChateau || 20, max: o.pvChateau || 20 },
      rival: { pv: o.pvRival || 20, max: o.pvRivalMax || o.pvRival || 20 },
      bonusDegats: o.bonusDegats || 0,
      arsenal: o.arsenal || { tours: { archers: 1, piquiers: 1 }, troupes: { fantassins: 1 } },
      tours: [], toursRivales: [], unites: [], projectiles: [], effets: [],
      envois: [], fileRivale: [], fileAmie: [], minuterieRivale: 0, minuterieAmie: 0,
      modificateurs: o.espion ? { espion: true } : {}, orParReponse: o.orParReponse || 12,
      orPerduErreur: typeof o.orPerduErreur === "number" && o.orPerduErreur >= 0 ? o.orPerduErreur : OR_PERDU, serie: 0, temps: 0,
      // tues, pertes : soldats tombés (sous les tirs ou au corps à corps) ; fuites, arrivees : troupes qui ont atteint le
      // château d'en face ; rivaux : troupes adverses entrées en jeu ; duels : rencontres au corps à corps
      stats: { tues: 0, fuites: 0, degatsRival: 0, envoyes: 0, pertes: 0, arrivees: 0, rivaux: 0, duels: 0 }
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
  // Retire jusqu'à n or de la bataille en cours, jamais en dessous de zéro. Renvoie ce qui a été retiré.
  function perdreOr(p, n) { var r = Math.max(0, Math.min(p.or, n)); p.or -= r; return r; }

  // Réponse au conseil de guerre. Juste : orParReponse, plus BONUS_SERIE au 3e succès d'affilée (puis la série repart).
  // Fausse (première réponse ou « Seconde chance » ratée) : orPerduErreur en moins, pris sur l'or de cette bataille,
  // jamais en dessous de zéro ; rien d'autre n'est perdu. Renvoie { or : +gain ou −perte, eclat : 3e succès d'affilée }.
  function repondre(p, juste) {
    if (juste) {
      p.serie++;
      var eclat = p.serie >= 3, gain = p.orParReponse + (eclat ? BONUS_SERIE : 0);
      if (eclat) p.serie = 0;
      p.or += gain;
      return { or: gain, eclat: eclat };
    }
    p.serie = 0;
    return { or: -perdreOr(p, p.orPerduErreur), eclat: false };
  }

  // Réglage du seigneur rival pour cette bataille (RIVAL, selon le niveau de la province).
  function rival(p) { return RIVAL[Math.max(0, Math.min(RIVAL.length - 1, p.niveau | 0))]; }

  // Composition d'une vague rivale : grossit avec le numéro de vague et le niveau de la province.
  function composerVague(p) {
    var w = p.vague, n = p.niveau;
    var file = [];
    var nb = VAGUES.base + VAGUES.parVague * w + rival(p).renfort + (p.defense ? DEFENSE.renfort : 0);
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

  // Le rival bâtit ses tours avant chaque vague : toursDepart avant la première, toursVague avant chacune des suivantes.
  function rivalConstruit(p) {
    var nb = p.vague === 0 ? rival(p).toursDepart : rival(p).toursVague;
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
    p.stats.rivaux += p.fileRivale.length;
    p.fileAmie = p.envois.slice();
    p.stats.envoyes += p.envois.length;
    p.envois = [];
    p.minuterieRivale = 0.6; p.minuterieAmie = 0.3;
    return true;
  }

  // adversaire : la troupe d'en face en mêlée (ou null) ; recharge : secondes avant son prochain coup ; premier : son
  // prochain coup est celui d'une charge ; frappe : heure (p.temps) de son dernier coup, pour le geste du rendu.
  function creerUnite(p, camp, type) {
    var d = camp === "rival" ? ENNEMIS[type] : TROUPES[type], r = rival(p), def = camp === "rival" && p.defense;
    var echelle = camp === "rival" ? (r.pv + VAGUES.pvVague * p.vague) * (def ? DEFENSE.pv : 1) : bonusArsenal(p, "troupes", type);
    var pv = d.pv * echelle;
    var v = d.vitesse * (p.modificateurs.pluie ? 0.8 : 1);
    var coup = (d.coup || 1) * (camp === "rival" ? r.coup * (def ? DEFENSE.coup : 1) : 1);
    var u = { camp: camp, type: type, pv: pv, max: pv, vitesse: v, degats: d.degats, coup: coup, charge: !!d.charge,
      s: camp === "rival" ? p.route.longueur : 0, cote: camp === "rival" ? -9 : 9, ralenti: 0, vivant: true, pas: Math.random() * 6,
      adversaire: null, recharge: 0, premier: false, frappe: -1 };
    var pos = surRoute(p.route, u.s, u.cote); u.x = pos.x; u.y = pos.y; u.angle = pos.angle;
    p.unites.push(u);
    return u;
  }

  function effet(p, genre, x, y, extra) {
    var e = { genre: genre, x: x, y: y, age: 0 };
    if (extra) for (var k in extra) e[k] = extra[k];
    p.effets.push(e);
    return e;
  }

  function degatsTour(p, t) {
    var d = t.rivale ? TOURS_RIVALES[t.type] : TOURS[t.type];
    var base = d.degats * (1 + AMELIORATION.facteur * (t.niveau - 1));
    if (!t.rivale) base *= bonusArsenal(p, "tours", t.type) * (1 + p.bonusDegats) * (p.modificateurs.flechesNeuves && t.type === "archers" ? 1.5 : 1);
    else base *= rival(p).tirs;
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

  // Sens du regard d'une troupe (1 : vers l'est, −1 : vers l'ouest) : vers son adversaire en mêlée, sinon vers où elle marche.
  function regard(u) {
    if (u.adversaire) return u.adversaire.x >= u.x ? 1 : -1;
    var c = Math.cos(u.angle || 0) * (u.camp === "rival" ? -1 : 1);
    return c < -0.2 ? -1 : c > 0.2 ? 1 : u.camp === "rival" ? -1 : 1;
  }

  // Un coup reçu (tir, palissade ou corps à corps). melee : le coup vient d'une mêlée. Une troupe qui tombe laisse un
  // effet « chute » (elle reste couchée DUREE_CHUTE secondes, puis s'efface), au plus TOMBES à la fois.
  function blesser(p, u, d, melee) {
    if (!u.vivant) return;
    u.pv -= d;
    if (u.pv <= 0) {
      u.vivant = false;
      // place pour le nouveau : seuls les TOMBES − 1 soldats tombés les plus récents restent
      for (var i = p.effets.length - 1, chutes = 0; i >= 0; i--) {
        if (p.effets[i].genre === "chute" && ++chutes >= TOMBES) p.effets.splice(i, 1);
      }
      effet(p, "chute", u.x, u.y, { camp: u.camp, type: u.type, regard: regard(u), melee: !!melee, duree: DUREE_CHUTE });
      if (u.camp === "rival") { p.stats.tues++; p.or += 1; } else p.stats.pertes++;
    }
  }

  // ---------- mêlée ----------
  // Parmi les troupes libres des deux camps à moins de MELEE.contact l'une de l'autre le long de la route, la paire la
  // plus proche s'engage d'abord ; une troupe ne se bat que contre une seule autre à la fois. Effets : « choc » quand une
  // paire s'engage, « coup » à chaque coup porté (sur la troupe touchée ; dir : sens du coup, 1 vers l'est).
  var libresAmies = [], libresRivales = [], paires = [];
  function engager(p, a, r) {
    a.adversaire = r; r.adversaire = a;
    a.premier = a.charge; a.recharge = a.charge ? MELEE.chargeCoup : MELEE.premierCoup;
    r.premier = r.charge; r.recharge = r.charge ? MELEE.chargeCoup : MELEE.premierCoup;
    p.stats.duels++;
    effet(p, "choc", (a.x + r.x) / 2, (a.y + r.y) / 2, { charge: a.charge || r.charge });
  }
  function frapper(p, u, c) {
    var d = u.coup * (u.premier ? MELEE.charge : 1);
    effet(p, "coup", c.x, c.y, { camp: c.camp, dir: c.x >= u.x ? 1 : -1, fort: u.premier || d >= 3 });
    u.premier = false; u.recharge = MELEE.cadence; u.frappe = p.temps;
    blesser(p, c, d, true);
  }
  function etapeMelee(p, dt) {
    var i, j, u, a, r, g;
    libresAmies.length = 0; libresRivales.length = 0; paires.length = 0;
    for (i = 0; i < p.unites.length; i++) {
      u = p.unites[i];
      if (!u.vivant) continue;
      if (u.adversaire && !u.adversaire.vivant) u.adversaire = null; // l'adversaire est tombé : la troupe repart
      if (!u.adversaire) (u.camp === "rival" ? libresRivales : libresAmies).push(u);
    }
    for (i = 0; i < libresAmies.length; i++) {
      a = libresAmies[i];
      for (j = 0; j < libresRivales.length; j++) {
        r = libresRivales[j]; g = r.s - a.s;
        if (g <= MELEE.contact && g >= -MELEE.contact) paires.push([Math.abs(g), a, r]);
      }
    }
    if (paires.length > 1) paires.sort(function (x, y) { return x[0] - y[0]; });
    for (i = 0; i < paires.length; i++) if (!paires[i][1].adversaire && !paires[i][2].adversaire) engager(p, paires[i][1], paires[i][2]);
    for (i = 0; i < p.unites.length; i++) {
      u = p.unites[i];
      if (!u.vivant || !u.adversaire || !u.adversaire.vivant) continue;
      u.recharge -= dt;
      if (u.recharge <= 0) frapper(p, u, u.adversaire);
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
      t.recharge = 1 / (d.cadence * (t.rivale ? rival(p).cadence : 1));
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

  // Côté de la route : la file de marche (±9 px), ou plus près du milieu en mêlée (face à face).
  function versCote(u, dt) {
    var voulu = (u.camp === "rival" ? -1 : 1) * (u.adversaire ? MELEE.coteCombat : 9), pas = 24 * dt;
    u.cote = Math.abs(voulu - u.cote) <= pas ? voulu : u.cote + (voulu > u.cote ? pas : -pas);
  }

  function etapeUnites(p, dt) {
    p.unites.forEach(function (u) {
      if (!u.vivant) return;
      var v = u.vitesse * (u.ralenti > 0 ? (1 - TOURS.piquiers.ralentit) : 1);
      u.ralenti = Math.max(0, u.ralenti - dt);
      var sens = u.camp === "rival" ? -1 : 1, avance;
      if (u.adversaire) {
        // en mêlée : les deux troupes se rapprochent jusqu'à l'écart de combat, puis piétinent sur place
        var ecart = sens * (u.adversaire.s - u.s);
        avance = ecart > MELEE.ecart ? Math.min(v * dt, (ecart - MELEE.ecart) / 2) : 0;
        u.pas += dt * 1.5;
      } else {
        avance = v * dt;
        u.pas += avance / 9;
      }
      u.s += sens * avance;
      versCote(u, dt);
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
        p.stats.arrivees++;
        effet(p, "breche", u.x, u.y, { camp: "rival", degats: u.degats });
      }
    });
    p.unites = p.unites.filter(function (u) { return u.vivant; });
  }

  function etapeFiles(p, dt) {
    p.minuterieRivale -= dt; p.minuterieAmie -= dt;
    if (p.fileRivale.length && p.minuterieRivale <= 0) { creerUnite(p, "rival", p.fileRivale.shift()); p.minuterieRivale = VAGUES.ecartSortie - Math.min(0.4, 0.05 * p.vague); }
    if (p.fileAmie.length && p.minuterieAmie <= 0) { creerUnite(p, "joueur", p.fileAmie.shift()); p.minuterieAmie = 0.55; }
  }

  // Avance la simulation de dt secondes. Renvoie la phase en cours.
  function etape(p, dt) {
    p.temps += dt;
    p.effets.forEach(function (e) { e.age += dt; });
    p.effets = p.effets.filter(function (e) { return e.age < (e.duree || DUREE_EFFET); });
    if (p.phase !== "vague") return p.phase;
    etapeFiles(p, dt);
    etapeMelee(p, dt);
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
    while (p.phase === "vague" && garde++ < 40000) etape(p, pas || 0.05);
    return p.phase;
  }

  JEU.batailleMoteur = {
    LARGEUR: LARGEUR, HAUTEUR: HAUTEUR, TOURS: TOURS, TROUPES: TROUPES, ENNEMIS: ENNEMIS, TOURS_RIVALES: TOURS_RIVALES, AMELIORATION: AMELIORATION,
    VAGUES: VAGUES, RIVAL: RIVAL, DEFENSE: DEFENSE, MELEE: MELEE, DUREE_EFFET: DUREE_EFFET, DUREE_CHUTE: DUREE_CHUTE, TOMBES: TOMBES, BONUS_SERIE: BONUS_SERIE, OR_PERDU: OR_PERDU,
    creer: creer, poserTour: poserTour, ameliorerTour: ameliorerTour, coutAmelioration: coutAmelioration, envoyer: envoyer, gagnerOr: gagnerOr,
    perdreOr: perdreOr, repondre: repondre,
    lancerVague: lancerVague, etape: etape, jouerVague: jouerVague, surRoute: surRoute, preparerRoute: preparerRoute,
    emplacementLibre: emplacementLibre, niveauArsenal: niveauArsenal, porteeTour: porteeTour, degatsTour: degatsTour
  };
})(typeof window !== "undefined" ? window : globalThis);
