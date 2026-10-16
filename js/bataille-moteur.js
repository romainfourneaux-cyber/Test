// Moteur de la bataille (tower defense à double sens, à la manière de Legion TD 2) : sans DOM, testable sous Node.
// Une route relie ton château (à gauche) au château du seigneur rival (à droite). Tes tours visent ses troupes ;
// ses tours visent les tiennes. Chaque camp envoie des troupes contre le château d'en face.
// Les questions ne sont jamais posées pendant une vague : le temps ne presse jamais l'élève.
// Mêlée (depuis le 15/10/2026, demande de Romain) : quand une de tes troupes et une troupe adverse se rencontrent sur la
// route, elles s'arrêtent, se font face et échangent des coups jusqu'à ce que l'une tombe ; la survivante reprend sa
// marche. Les tours continuent de tirer. Le moteur émet des effets (choc, coup, chute) que le rendu dessine ; il ignore
// le réglage « Sang dans les combats », que seul le rendu lit.
// Seigneur rival (depuis le 16/10/2026, demande de Romain : « il ne crée pas de défense au début, on peut spammer les
// soldats dès la première manche ») : il a des tours devant sa porte dès le début et une garnison dont les gardes sortent
// au-devant de tes troupes quand elles approchent de sa porte ; tant qu'il lui reste des gardes, tes troupes arrivées à
// sa porte ne frappent pas ses murs, elles doivent d'abord vaincre la garnison. Il a son trésor, et entre deux vagues il
// regarde ce que tu as fait pour décider (rivalReagit) ; au départ d'une vague, ses guetteurs voient ton armée sortir
// (rivalGuetteurs). Tout est sans hasard : la même partie donne les mêmes décisions. Chaque décision est notée dans
// p.ia.journal (avec une phrase prête à afficher) et laisse un effet pour le rendu (tourRivale, alerte, sortie, rentree,
// porteOuverte).
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
  // coup : ses coups au corps à corps (×) ; assaut : points de vie de ses troupes quand il attaque ton domaine (× pv).
  // Depuis le 16/10/2026 (IA du rival) : toursDepart : tours d'archers déjà debout au début de la bataille (une au moins
  // à chaque niveau, la première devant sa porte) ; toursVague : tours qu'il bâtit de plus à chaque vague quand rien ne
  // le presse (posture « equilibre ») ; garnison : gardes de sa porte au début (la garnison se reforme à chaque vague) ;
  // garde : solidité et coups d'un garde (× ceux d'un homme d'armes) ; tresor : son or au début de la bataille ; impot :
  // son or de plus à chaque vague. Ses tours de plus, ses gardes de plus et ses renforts, c'est lui qui les paie
  // (rivalReagit) ; les gardes rappelés par ses guetteurs, non (rivalGuetteurs).
  // Réglé niveau par niveau avec atelier/outils/simuler-bataille.js (docs/JOURNAL.md, Décisions) : le 15/10/2026, chaque
  // province demandait 16 à 25 % de batailles de plus qu'avant la mêlée (f9939e2), à 7 comme à 8 bonnes réponses sur
  // 10 ; le 16/10/2026, avec la garnison, la porte gardée et l'IA, le réglage a été refait pour garder ces écarts au
  // joueur équilibré (ses troupes et ses tours plus faibles, la porte plus dure). Tout compte par seuils (un soldat tombe
  // en 6 ou en 7 flèches, un garde en 5 ou en 6 coups) : un petit changement peut faire un grand saut (au niveau 4,
  // « tirs » 1,58 au lieu de 1,62 : 11 points de moins), vérifie-le au simulateur.
  var RIVAL = [
    { renfort: 2, pv: 0.4, tirs: 0.3, coup: 0.35, toursDepart: 1, toursVague: 1, garnison: 1, garde: 1, tresor: 30, impot: 30, assaut: 5.2 },
    { renfort: 2, pv: 0.8, tirs: 0.7, coup: 0.4, toursDepart: 1, toursVague: 1, garnison: 1, garde: 1.1, tresor: 30, impot: 30, assaut: 2.8 },
    { renfort: 2, pv: 0.8, tirs: 0.7, coup: 0.4, toursDepart: 2, toursVague: 1, garnison: 1, garde: 1.2, tresor: 40, impot: 40, assaut: 2.6 },
    { renfort: 2, pv: 0.9, tirs: 0.7, coup: 0.4, toursDepart: 2, toursVague: 1, garnison: 1, garde: 1.3, tresor: 20, impot: 20, assaut: 3.5 },
    { renfort: 1, pv: 1.2, tirs: 1.62, coup: 1, toursDepart: 2, toursVague: 1, garnison: 1, garde: 1, tresor: 30, impot: 30, assaut: 3.3 }
  ];
  // Garnison de la porte rivale. type : les gardes sont des hommes d'armes (images déjà dessinées) ; zone : quand une de
  // tes troupes est à moins de « zone » px de la porte (le long de la route), un garde sort, un de plus par troupe dans la
  // zone, toutes les « ecart » secondes, tant qu'il en reste ; un garde ne s'éloigne jamais de la porte de plus de
  // zone + marge px ; sans troupe à toi dans la zone, il rentre (il compte de nouveau dans la garnison de cette vague).
  // attente : tant que la garnison tient (un garde dans la place ou dehors), une de tes troupes arrivée à sa porte
  // s'arrête à « attente » px devant et se bat ; elle ne frappe ses murs qu'une fois la garnison vaincue.
  // taille : gardes au plus dans sa garnison ; rappel : gardes rappelés au plus par ses guetteurs pour une vague ;
  // contreSiege : un garde frappe la tour de siège « contreSiege » fois plus fort (haches et torches contre le bois).
  var GARNISON = { type: "hommes", zone: 200, marge: 30, ecart: 0.4, attente: 6, taille: 8, rappel: 24, contreSiege: 3 };
  // Décisions du rival. Prix (son or) : une tour d'archers ou une baliste, un garde de plus dans sa garnison, une troupe de
  // renfort dans sa prochaine vague. Seuils : ratio (« surtout des troupes » : l'or des troupes envoyées à une vague vaut
  // au moins ratio fois l'or de tes défenses, tours et améliorations sur le champ de bataille, et au moins seuilTroupes) ;
  // « tortue » : tu as au moins ecartTours tours de plus que lui sur le champ de bataille et tu n'as pas envoyé plus de
  // seuilTortue or de troupes ; breche : coups portés à sa place forte en une seule vague qui le font aussi fortifier sa
  // porte ; gardesPorte : gardes achetés au plus par vague quand il fortifie sa porte ; orGarde : or gardé par toi au départ
  // de la vague qui le rend méfiant ; renfortMax : troupes de renfort au plus par vague ; porte : longueur de route (px)
  // devant sa porte que couvre une « tour de porte ». Guetteurs (rivalGuetteurs) : au départ d'une vague, si l'or de tes
  // troupes dépasse ratio fois celui de tes défenses de plus de « alerte », un garde rappelé pour cette vague par tranche
  // de parGarde or au-delà (au plus GARNISON.rappel, sans rien payer). Exemple : 18 fantassins (90 or) sans aucune tour,
  // (90 − 20) / 5 = 14 gardes rappelés ; 6 fantassins et deux tours (30 or contre 55), aucun.
  var PRIX_RIVAL = { archers: 30, baliste: 50, garde: 15, pietaille: 5, cavaliers: 10, hommes: 15 };
  var IA = { ratio: 1, seuilTroupes: 45, ecartTours: 2, seuilTortue: 15, breche: 8, gardesPorte: 1, orGarde: 45, renfortMax: 6, porte: 300, alerte: 20, parGarde: 5 };
  // Phrases du journal du rival (le rendu peut les afficher telles quelles ; « Ton rival » se remplace par son nom).
  // releve : phrase ajoutée quand il a dû racheter des gardes tombés.
  var TEXTES_RIVAL = {
    depart: "Ton rival t'attend : des tours gardent sa porte, et sa garnison est prête à sortir.",
    porte: "Ton rival a vu tes troupes foncer sur sa porte : il la fortifie.",
    armee: "Ton rival a compté tes tours : il lève des hommes d'armes pour sa prochaine vague.",
    mefiance: "Tu gardes de l'or : ton rival se méfie d'une grosse attaque et renforce sa garde.",
    equilibre: "Ton rival renforce ses défenses et son armée.",
    alerte: "Les guetteurs du rival ont vu ton armée sortir : il rappelle des gardes à sa porte.",
    releve: "Il paie de nouveaux gardes pour remplacer ceux que tu as abattus."
  };
  // Défense du domaine (carte « domaine », ou options.defense) : le rival y vient en force, pour que la défense inquiète un
  // peu (tenue environ 9 fois sur 10 à 8 bonnes réponses sur 10, murs entamés). Ses troupes ont « assaut » fois les points
  // de vie de son niveau (RIVAL) et chacune porte DEFENSE.degats fois ses coups à tes murs (un nombre entier : le rendu
  // affiche « −2 », « −4 »). Une défense perdue ne coûte rien (jeu/js/campagne.js, apresBataille).
  var DEFENSE = { degats: 2 };
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
      // château d'en face ; rivaux : troupes adverses en jeu ou sorties du jeu (un garde rentré à la porte n'y compte
      // plus) ; duels : rencontres au corps à corps ; sorties, rentrees, gardesTombes : gardes de la garnison sortis,
      // rentrés à la porte, tombés
      stats: { tues: 0, fuites: 0, degatsRival: 0, envoyes: 0, pertes: 0, arrivees: 0, rivaux: 0, duels: 0, sorties: 0, rentrees: 0, gardesTombes: 0 },
      // depenses : or dépensé pendant la préparation en cours (troupes, tours et améliorations ; soldats, et troupes
      // envoyées par type), ce que les guetteurs et le rival regardent ; rapport : ce que tu as fait à la vague jouée
      // (rivalReagit le lit)
      depenses: { troupes: 0, tours: 0, soldats: 0, types: {} }, rapport: null
    };
    rivalDepart(p);
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
    p.or -= d.cout; p.depenses.tours += d.cout;
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
    p.or -= c; t.niveau++; t.investi += c; p.depenses.tours += c;
    return true;
  }

  function envoyer(p, type) {
    var d = TROUPES[type];
    if (!d || p.phase !== "preparation" || !niveauArsenal(p, "troupes", type) || p.or < d.cout) return false;
    p.or -= d.cout; p.depenses.troupes += d.cout; p.depenses.soldats += d.nombre || 1;
    p.depenses.types[type] = (p.depenses.types[type] || 0) + 1;
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

  // Composition d'une vague rivale : grossit avec le numéro de vague et le niveau de la province ; les renforts payés par
  // le rival (rivalReagit) partent en tête, juste derrière les premiers soldats.
  function composerVague(p) {
    var w = p.vague, n = p.niveau;
    var file = [];
    var nb = VAGUES.base + VAGUES.parVague * w + rival(p).renfort;
    for (var i = 0; i < nb; i++) {
      var r = (i * 7 + w * 3) % 10;
      if (w >= 2 && r < 2 + n) file.push("hommes");
      else if (w >= 1 && r < 5) file.push("cavaliers");
      else file.push("pietaille");
    }
    var renforts = p.ia ? p.ia.renfort : [];
    for (var k = 0; k < renforts.length; k++) file.splice(Math.min(file.length, 1 + 2 * k), 0, renforts[k]);
    if (w === p.vagues - 1) file.push("champion");
    if (p.modificateurs.espion && file.length) file.splice(file.indexOf("hommes") >= 0 ? file.indexOf("hommes") : file.length - 1, 1);
    return file;
  }

  // ---------- le seigneur rival : défenses, garnison, trésor et décisions ----------
  // Couverture de chaque emplacement rival : points de la route (tous les 10 px, sur la file de tes troupes) à portée
  // d'une tour d'archers rivale ; « porte » : seulement sur les IA.porte derniers px, devant sa place forte. Calculée une
  // fois par bataille.
  function couvertureRivale(p) {
    if (p.couvRivale) return p.couvRivale;
    var r = p.route, portee = TOURS_RIVALES.archers.portee, c = [];
    p.carte.emplacementsRivaux.forEach(function (e, i) {
      var tout = 0, porte = 0;
      for (var s = 0; s <= r.longueur; s += 10) {
        var q = surRoute(r, s, 9), dx = q.x - e[0], dy = q.y - e[1];
        if (dx * dx + dy * dy <= portee * portee) { tout++; if (s >= r.longueur - IA.porte) porte++; }
      }
      c.push({ i: i, tout: tout, porte: porte });
    });
    return (p.couvRivale = c);
  }

  // Le rival bâtit une tour sur un de ses emplacements libres : vers « porte », celui qui couvre le plus la route devant sa
  // porte ; vers « route », celui qui en couvre le plus en tout (à égalité, le premier). Rend la tour, ou null.
  function rivalBatit(p, type, vers, effetVisible) {
    var libres = couvertureRivale(p).filter(function (c) { return !p.toursRivales.some(function (t) { return t.emplacement === c.i; }); });
    if (!libres.length) return null;
    libres.sort(function (a, b) {
      return vers === "porte" ? (b.porte - a.porte) || (b.tout - a.tout) || (a.i - b.i) : (b.tout - a.tout) || (b.porte - a.porte) || (a.i - b.i);
    });
    var i = libres[0].i, e = p.carte.emplacementsRivaux[i];
    var t = { type: type, emplacement: i, x: e[0], y: e[1], niveau: 1, recharge: 0, rivale: true, angle: Math.PI };
    p.toursRivales.push(t);
    if (effetVisible) effet(p, "tourRivale", e[0], e[1], { type: type, emplacement: i, duree: 2 });
    return t;
  }

  // Tes défenses sur le champ de bataille : l'or mis dans tes tours et leurs améliorations (ce que voit le rival).
  function defenses(p) {
    for (var i = 0, n = 0; i < p.tours.length; i++) n += p.tours[i].investi;
    return n;
  }

  function noter(p, posture, actions) {
    var j = { vague: p.vague, posture: posture, actions: actions, texte: TEXTES_RIVAL[posture] };
    p.ia.journal.push(j);
    return j;
  }

  // Au début de la bataille : RIVAL.toursDepart tours d'archers (la première couvre la route devant sa porte, les autres
  // le plus de route possible), une garnison de RIVAL.garnison gardes, RIVAL.tresor or dans son trésor.
  // p.garnison : base (gardes de sa garnison de départ, qui reviennent toujours), taille (gardes de sa garnison, achetés
  // compris), reserve (gardes encore dans la place pour cette vague), rappel (gardes rappelés par ses guetteurs pour cette
  // vague), tombes (gardes tombés pendant cette vague), tient (il lui reste un garde, dans la place ou dehors : ta troupe
  // arrivée à sa porte attend et se bat), vaincue (la garnison de cette vague est tombée : sa porte est ouverte).
  function rivalDepart(p) {
    var r = rival(p), actions = [];
    p.ia = { or: r.tresor, posture: "depart", renfort: [], journal: [], belierVu: false };
    p.garnison = { base: r.garnison, taille: r.garnison, reserve: r.garnison, rappel: 0, tombes: 0, minuterie: 0, tient: r.garnison > 0, vaincue: false };
    for (var k = 0; k < r.toursDepart; k++) {
      var t = rivalBatit(p, "archers", k === 0 ? "porte" : "route", false);
      if (t) actions.push({ genre: "tour", type: t.type, emplacement: t.emplacement });
    }
    actions.push({ genre: "garnison", nombre: r.garnison });
    noter(p, "depart", actions);
  }

  // Entre deux vagues (appelé quand une vague se termine) : le rival touche RIVAL.impot or ; il relève sa garnison (les
  // gardes de sa garnison de départ reviennent d'eux-mêmes ; ceux qu'il avait achetés en plus et que tu as abattus, il les
  // rachète d'abord, s'il en a les moyens ; les gardes rappelés par ses guetteurs, partis devant, tombent les premiers et
  // ne se remplacent pas) ; puis il regarde ce que tu as fait à la vague jouée (p.rapport) et choisit une posture :
  //  1. « porte » : tu as surtout envoyé des troupes (leur or ≥ IA.ratio × celui de tes défenses, tours et améliorations
  //     sur le champ de bataille, et ≥ IA.seuilTroupes), ou
  //     tu lui as fait mal (au moins IA.breche coups portés à sa place forte pendant la vague) : une tour devant sa porte
  //     (une baliste si tu as déjà envoyé une tour de siège, à partir du niveau 1), puis jusqu'à IA.gardesPorte gardes de
  //     plus dans sa garnison ;
  //  2. « armee » : tu te retranches (au moins IA.ecartTours tours de plus que lui, et pas plus de IA.seuilTortue or de
  //     troupes envoyées) : des hommes d'armes en renfort dans sa prochaine vague, plus solides que la piétaille ;
  //  3. « mefiance » : tu as gardé au moins IA.orGarde or : un garde de plus (il craint une grosse attaque), le reste gardé ;
  //  4. « equilibre » : RIVAL.toursVague tours de plus sur la route à chaque vague (jusqu'à RIVAL.toursDepart +
  //     RIVAL.toursVague × numéro de la vague, s'il en a les moyens), sinon des renforts.
  function rivalReagit(p) {
    var r = rival(p), ia = p.ia, g = p.garnison, rap = p.rapport || { troupes: 0, tours: 0, defenses: 0, belier: 0, orGarde: 0, degats: 0 };
    ia.or += r.impot;
    ia.renfort = [];
    if (rap.belier) ia.belierVu = true;
    var posture, actions = [];
    var perdus = Math.min(Math.max(0, g.tombes - g.rappel), Math.max(0, g.taille - g.base)), rachetes = 0;
    g.taille -= perdus;
    while (rachetes < perdus && ia.or >= PRIX_RIVAL.garde) { g.taille++; ia.or -= PRIX_RIVAL.garde; rachetes++; }
    if (perdus) actions.push({ genre: "releve", nombre: rachetes, perdus: perdus });
    if ((rap.troupes >= IA.ratio * rap.defenses && rap.troupes >= IA.seuilTroupes) || rap.degats >= IA.breche) posture = "porte";
    else if (p.tours.length >= p.toursRivales.length + IA.ecartTours && rap.troupes <= IA.seuilTortue) posture = "armee";
    else if (rap.orGarde >= IA.orGarde) posture = "mefiance";
    else posture = "equilibre";
    ia.posture = posture;
    function tour(vers) {
      var type = ia.belierVu && p.niveau >= 1 && ia.or >= PRIX_RIVAL.baliste ? "baliste" : "archers";
      if (ia.or < PRIX_RIVAL[type]) return false;
      var t = rivalBatit(p, type, vers, true);
      if (!t) return false;
      ia.or -= PRIX_RIVAL[type];
      actions.push({ genre: "tour", type: type, emplacement: t.emplacement });
      return true;
    }
    function gardes(max) {
      var n = 0;
      while (n < max && g.taille < GARNISON.taille && ia.or >= PRIX_RIVAL.garde) { g.taille++; ia.or -= PRIX_RIVAL.garde; n++; }
      if (n) actions.push({ genre: "garde", nombre: n });
    }
    function renforts(types) {
      var n = 0;
      while (ia.renfort.length < IA.renfortMax) {
        var type = types[ia.renfort.length % types.length];
        if (ia.or < PRIX_RIVAL[type]) break;
        ia.or -= PRIX_RIVAL[type]; ia.renfort.push(type); n++;
      }
      if (n) actions.push({ genre: "renfort", nombre: n, types: ia.renfort.slice() });
    }
    if (posture === "porte") { tour("porte"); gardes(IA.gardesPorte); }
    else if (posture === "armee") renforts(["hommes"]);
    else if (posture === "mefiance") gardes(1);
    else if (p.toursRivales.length < Math.min(r.toursDepart + r.toursVague * p.vague, p.carte.emplacementsRivaux.length)) {
      // (sans assez d'or, il économise)
      for (var k = 0; k < r.toursVague && p.toursRivales.length < r.toursDepart + r.toursVague * p.vague && tour("route"); k++) { /* une tour de plus */ }
    } else renforts(["pietaille", "cavaliers"]);
    g.reserve = g.taille; g.rappel = 0; g.tombes = 0;
    var j = noter(p, posture, actions);
    if (rachetes) j.texte += " " + TEXTES_RIVAL.releve;
  }

  // Au départ d'une vague, les guetteurs du rival voient ton armée sortir et tes tours : si l'or de tes troupes de cette
  // préparation dépasse IA.ratio fois celui de tes défenses (tours et améliorations) de plus de IA.alerte, il rappelle un
  // garde de plus pour cette vague par tranche de IA.parGarde or au-delà (au plus GARNISON.rappel ; des gens du pays,
  // qu'il ne paie pas). Une armée grosse face à des défenses maigres, c'est une ruée : sa porte s'y prépare. Les guetteurs
  // ne voient que ce qui se voit sur le champ de bataille, jamais tes réponses.
  function rivalGuetteurs(p) {
    var g = p.garnison, valeur = p.depenses.troupes - IA.ratio * defenses(p), n = 0;
    g.reserve = g.taille; g.tombes = 0; g.vaincue = false;
    while (n < GARNISON.rappel && valeur - IA.alerte >= IA.parGarde * (n + 1)) n++;
    g.rappel = n; g.reserve += n; g.tient = g.reserve > 0;
    if (n) {
      noter(p, "alerte", [{ genre: "rappel", nombre: n }]);
      var porte = surRoute(p.route, p.route.longueur, 0);
      effet(p, "alerte", porte.x, porte.y, { nombre: n, duree: 2 });
    }
  }

  function lancerVague(p) {
    if (p.phase !== "preparation" || p.fin) return false;
    p.phase = "vague";
    rivalGuetteurs(p);
    p.fileRivale = composerVague(p);
    p.stats.rivaux += p.fileRivale.length;
    p.fileAmie = p.envois.slice();
    p.stats.envoyes += p.envois.length;
    p.envois = [];
    // ce que tu as fait pour cette vague (lu par rivalReagit à la fin de la vague) ; degats : coups portés pendant la vague
    p.rapport = { vague: p.vague, troupes: p.depenses.troupes, tours: p.depenses.tours, defenses: defenses(p), types: p.depenses.types,
      belier: p.depenses.types.belier || 0, soldats: p.depenses.soldats, orGarde: p.or, toursJoueur: p.tours.length, degats: 0, avant: p.stats.degatsRival };
    p.depenses = { troupes: 0, tours: 0, soldats: 0, types: {} };
    p.minuterieRivale = 0.6; p.minuterieAmie = 0.3; p.garnison.minuterie = 0;
    return true;
  }

  // adversaire : la troupe d'en face en mêlée (ou null) ; recharge : secondes avant son prochain coup ; premier : son
  // prochain coup est celui d'une charge ; frappe : heure (p.temps) de son dernier coup, pour le geste du rendu.
  // garde : un garde de la garnison (camp rival, type GARNISON.type) : RIVAL.garde fois la solidité et les coups d'un homme
  // d'armes, quel que soit le numéro de la vague ou la défense du domaine ; il ne frappe jamais tes murs (degats 0).
  function creerUnite(p, camp, type, garde) {
    var d = camp === "rival" ? ENNEMIS[type] : TROUPES[type], r = rival(p), def = camp === "rival" && p.defense && !garde;
    var echelle = garde ? r.garde : camp === "rival" ? (r.pv + VAGUES.pvVague * p.vague) * (def ? r.assaut : 1) : bonusArsenal(p, "troupes", type);
    var pv = d.pv * echelle;
    var v = d.vitesse * (p.modificateurs.pluie ? 0.8 : 1);
    var coup = (d.coup || 1) * (garde ? r.garde : camp === "rival" ? r.coup : 1);
    var u = { camp: camp, type: type, pv: pv, max: pv, vitesse: v, degats: garde ? 0 : d.degats * (def ? DEFENSE.degats : 1), coup: coup, charge: !!d.charge,
      s: camp === "rival" ? p.route.longueur : 0, cote: camp === "rival" ? -9 : 9, ralenti: 0, vivant: true, pas: Math.random() * 6,
      adversaire: null, recharge: 0, premier: false, frappe: -1, garnison: !!garde };
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
  // (Corrigé le 16/10/2026 : 8 points de vie moins 5 coups de 1,6 laissaient 0,000000000000001 point à cause des arrondis
  // de l'ordinateur, et la troupe « morte » repartait ; moins d'un millième de point de vie, elle tombe.)
  function blesser(p, u, d, melee) {
    if (!u.vivant) return;
    u.pv -= d;
    if (u.pv < 1e-3) {
      u.pv = 0;
      u.vivant = false;
      // place pour le nouveau : seuls les TOMBES − 1 soldats tombés les plus récents restent
      for (var i = p.effets.length - 1, chutes = 0; i >= 0; i--) {
        if (p.effets[i].genre === "chute" && ++chutes >= TOMBES) p.effets.splice(i, 1);
      }
      effet(p, "chute", u.x, u.y, { camp: u.camp, type: u.type, regard: regard(u), melee: !!melee, duree: DUREE_CHUTE, garnison: u.garnison });
      if (u.camp === "rival") { p.stats.tues++; p.or += 1; if (u.garnison) { p.stats.gardesTombes++; p.garnison.tombes++; } } else p.stats.pertes++;
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
    var d = u.coup * (u.premier ? MELEE.charge : 1) * (u.garnison && c.type === "belier" ? GARNISON.contreSiege : 1);
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

  // Côté de la route : la file de marche (±9 px), ou plus près du milieu en mêlée (face à face).
  function versCote(u, dt) {
    var voulu = (u.camp === "rival" ? -1 : 1) * (u.adversaire ? MELEE.coteCombat : 9), pas = 24 * dt;
    u.cote = Math.abs(voulu - u.cote) <= pas ? voulu : u.cote + (voulu > u.cote ? pas : -pas);
  }

  // Un garde libre va au-devant de la troupe à toi la plus proche dans la zone de la porte (sans jamais s'éloigner de la
  // porte de plus de GARNISON.zone + GARNISON.marge px) et attend à l'écart de combat si elle se bat déjà ; sans troupe à
  // toi dans la zone, il rentre. Rend le sens de sa marche (−1 vers toi, 1 vers sa porte) et la distance voulue.
  function marcheGarde(p, u, v, dt) {
    var L = p.route.longueur, seuil = L - GARNISON.zone, cible = null, ecartCible = Infinity, i, a;
    for (i = 0; i < p.unites.length; i++) {
      a = p.unites[i];
      if (!a.vivant || a.camp !== "joueur" || a.s < seuil) continue;
      var e = Math.abs(a.s - u.s) + (a.adversaire ? 1000 : 0); // une troupe libre d'abord
      if (e < ecartCible) { ecartCible = e; cible = a; }
    }
    if (!cible) return { sens: 1, avance: v * dt };
    var sens = cible.s < u.s ? -1 : 1, reste = Math.abs(cible.s - u.s) - (cible.adversaire ? MELEE.ecart : 0);
    if (sens < 0) reste = Math.min(reste, u.s - (seuil - GARNISON.marge));
    return { sens: sens, avance: Math.max(0, Math.min(v * dt, reste)) };
  }

  function etapeUnites(p, dt) {
    p.unites.forEach(function (u) {
      if (!u.vivant) return;
      var v = u.vitesse * (u.ralenti > 0 ? (1 - TOURS.piquiers.ralentit) : 1);
      u.ralenti = Math.max(0, u.ralenti - dt);
      var sens = u.camp === "rival" ? -1 : 1, avance, recul = false;
      if (u.adversaire) {
        // en mêlée : les deux troupes se rapprochent jusqu'à l'écart de combat, puis piétinent sur place
        var ecart = sens * (u.adversaire.s - u.s);
        avance = ecart > MELEE.ecart ? Math.min(v * dt, (ecart - MELEE.ecart) / 2) : 0;
        u.pas += dt * 1.5;
      } else if (u.garnison) {
        var m = marcheGarde(p, u, v, dt);
        sens = m.sens; avance = m.avance; recul = sens > 0;
        u.pas += avance / 9;
      } else {
        avance = v * dt;
        u.pas += avance / 9;
      }
      u.s += sens * avance;
      // la garnison tient : ta troupe s'arrête devant sa porte (u.porte, pour le rendu) et attend qu'un garde sorte la
      // combattre ; elle ne frappe ses murs qu'une fois la garnison de cette vague vaincue
      u.porte = u.camp === "joueur" && p.garnison.tient && u.s >= p.route.longueur - GARNISON.attente;
      if (u.porte) u.s = p.route.longueur - GARNISON.attente;
      versCote(u, dt);
      // (un garde qui rentre regarde vers sa porte : son angle est celui de sa marche)
      var pos = surRoute(p.route, u.s, u.cote); u.x = pos.x; u.y = pos.y; u.angle = recul ? pos.angle + Math.PI : pos.angle;
      if (u.porte) return;
      if (u.garnison && recul && u.s >= p.route.longueur) {
        // le garde rentre à la porte : il compte de nouveau dans la garnison de cette vague
        u.vivant = false; u.rentre = true;
        p.garnison.reserve++;
        p.stats.rivaux--; p.stats.rentrees++;
        effet(p, "rentree", u.x, u.y, { camp: "rival" });
      } else if (u.camp === "rival" && u.s <= 0) {
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

  // Sorties de la garnison : tant que tes troupes dans la zone de la porte sont plus nombreuses que ses gardes dehors, un
  // garde sort (toutes les GARNISON.ecart secondes), s'il en reste dans la garnison de cette vague (p.garnison.reserve).
  // La garnison tient tant qu'il reste un garde, dans la place ou dehors ; quand elle tombe, effet « porteOuverte ».
  function etapeGarnison(p, dt) {
    var g = p.garnison, seuil = p.route.longueur - GARNISON.zone, menace = 0, dehors = 0;
    for (var i = 0; i < p.unites.length; i++) {
      var u = p.unites[i];
      if (!u.vivant) continue;
      if (u.camp === "joueur" && u.s >= seuil) menace++;
      else if (u.garnison) dehors++;
    }
    var tenait = g.tient;
    g.tient = g.reserve > 0 || dehors > 0;
    if (tenait && !g.tient && !g.vaincue) {
      g.vaincue = true;
      var porte = surRoute(p.route, p.route.longueur, 0);
      effet(p, "porteOuverte", porte.x, porte.y, { duree: 2 });
    }
    g.minuterie -= dt;
    if (g.reserve <= 0 || g.minuterie > 0 || menace <= dehors) return;
    var garde = creerUnite(p, "rival", GARNISON.type, true);
    g.reserve--; g.minuterie = GARNISON.ecart;
    p.stats.rivaux++; p.stats.sorties++;
    effet(p, "sortie", garde.x, garde.y, { camp: "rival" });
  }

  // Avance la simulation de dt secondes. Renvoie la phase en cours.
  function etape(p, dt) {
    p.temps += dt;
    p.effets.forEach(function (e) { e.age += dt; });
    p.effets = p.effets.filter(function (e) { return e.age < (e.duree || DUREE_EFFET); });
    if (p.phase !== "vague") return p.phase;
    etapeFiles(p, dt);
    etapeGarnison(p, dt);
    etapeMelee(p, dt);
    etapeUnites(p, dt);
    etapeTours(p, dt, p.tours);
    etapeTours(p, dt, p.toursRivales);
    etapeProjectiles(p, dt);
    if (p.rival.pv <= 0) return terminer(p, "victoire");
    if (p.chateau.pv <= 0) return terminer(p, "retraite");
    if (!p.fileRivale.length && !p.fileAmie.length && !p.unites.length && !p.projectiles.length) {
      if (p.rapport) p.rapport.degats = p.stats.degatsRival - p.rapport.avant;
      p.vague++;
      p.modificateurs = {};
      if (p.vague >= p.vagues) return terminer(p, "tenu");
      p.phase = "preparation";
      p.or += p.revenu;
      rivalReagit(p); // le rival décide pour la vague suivante : ses nouvelles tours se voient pendant ta préparation
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
    GARNISON: GARNISON, IA: IA, PRIX_RIVAL: PRIX_RIVAL, TEXTES_RIVAL: TEXTES_RIVAL, couvertureRivale: couvertureRivale, rivalReagit: rivalReagit,
    creer: creer, poserTour: poserTour, ameliorerTour: ameliorerTour, coutAmelioration: coutAmelioration, envoyer: envoyer, gagnerOr: gagnerOr,
    perdreOr: perdreOr, repondre: repondre,
    lancerVague: lancerVague, etape: etape, jouerVague: jouerVague, surRoute: surRoute, preparerRoute: preparerRoute,
    emplacementLibre: emplacementLibre, niveauArsenal: niveauArsenal, porteeTour: porteeTour, degatsTour: degatsTour
  };
})(typeof window !== "undefined" ? window : globalThis);
