// Expéditions : la route des semaines, un mode à part lancé depuis la carte de campagne (roguelite : on part d'un relais,
// on traverse trois semaines du programme, la renommée gagnée paie l'Armorial qui rend la suivante un peu plus facile).
// Ce fichier porte toute la logique, sans DOM (testé sous Node) : génération de la route à graine, fenêtre et quota de
// chaque semaine, vivres, or de route, faveurs des conseillers, renommée, Armorial, bloc « expedition » de la sauvegarde.
// L'écran (parchemin, pages de semaine, portes, bilan) est dans ecran-expedition.js.
// Conception : atelier/conception/expeditions.md ; réglages mesurés le jour 0 : atelier/conception/expeditions-mesures.md.
// Règles fermes : aucun chrono ; une question ratée ne coûte jamais un vivre ; rien n'est jamais retiré au royaume ; les
// batailles de route passent par les options que le moteur lit déjà (bataille-moteur.js n'est pas touché).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  var VERSION_ROUTE = 1;
  var VIVRES_MAX = 5;
  // Réglages (jeu/data/config.js, bloc expedition, facultatif) : lus avec ces valeurs par défaut.
  var DEFAUTS = { semaines: 3, couches: 3, vivres: 3, questionsSemaine: 2, quotaPlein: 12, quotaDemi: 5, difficulte: 0, vitesse: 1, relaisLibres: false };

  // ---------- les nombres (cahier de conception, sections 4.3, 4.4, 7.1, 7.2, 8.2, 8.6, 10.1, 10.2 ; jour 0) ----------
  var EXP = {
    VIVRES_MAX: VIVRES_MAX,
    // 4.3 : part de chaque type de halte par couche (MVP : les parts du trésor et des archives vont à l'événement)
    TYPES_COUCHE: [
      { escarmouche: 55, evenement: 45 },
      { escarmouche: 35, embuscade: 25, evenement: 25, marchand: 15 },
      { escarmouche: 25, evenement: 20, marchand: 15, bivouac: 40 }
    ],
    // 4.4 : les portes (récompense annoncée) d'une escarmouche ; une embuscade porte toujours une faveur
    PORTES: { faveur: 55, bourse: 25, parchemin: 10, vivres: 10 },
    RARE: { escarmouche: 0.25, embuscade: 0.5, gardien: 1, grand: 1 },
    GAINS_PORTE: { bourse: [20, 40], parchemin: [10, 20], vivresPlein: 15, vivresEclatante: 15 }, // [simple, éclatante]
    // 7.1 : la ligne RIVAL du moteur suit la semaine ([dernière semaine, ligne] ; au-delà : 4)
    LIGNE_SEMAINE: [[2, 0], [5, 1], [8, 2], [12, 3]],
    // 7.2 et jour 0 (24/10/2026) : escarmouche en attaque à 2 vagues, camp de 6 ; embuscade en défense à la ligne + 1 ;
    // gardien et Grand Gardien en défense à la ligne de la semaine (le + 1 du Grand Gardien n'a pas été retenu).
    // or : or de route [tenue, éclatante]
    HALTES: {
      escarmouche: { mode: "attaque", vagues: 2, ligne: 0, place: 6, questions: 6, or: [10, 20] },
      embuscade: { mode: "defense", vagues: 2, ligne: 1, place: 10, questions: 6, or: [20, 35] },
      gardien: { mode: "defense", vagues: 2, ligne: 0, place: 12, questions: 6, or: [25, 25] },
      grand: { mode: "defense", vagues: 3, ligne: 0, place: 16, questions: 9, or: [25, 25] }
    },
    QUESTIONS: { evenement: 3, marchand: 1, bivouac: 3, archives: 3, porte: 1 },
    // 8.2 : les six faveurs du MVP, deux rangs (commune, rare), toutes par une option que M.creer lit déjà ou par l'état
    FAVEURS: {
      annales: { famille: "histoire", nom: "Annales", valeurs: [2, 3] },           // orParReponse
      eclaireurs: { famille: "geographie", nom: "Éclaireurs", valeurs: [1, 2] },   // espion (rang 2 : aussi la 2e vague, par le rendu)
      simples: { famille: "svt", nom: "Simples", valeurs: [1, 1] },                // +1 vivre ; rang 2 : +1 au maximum
      engrenages: { famille: "physique", nom: "Engrenages", valeurs: [0.08, 0.12] }, // bonusDegats
      ballade: { famille: "francais", nom: "Ballade consolante", valeurs: [2, 4] }, // orPerduErreur en moins
      lettres: { famille: "anglais", nom: "Lettres de crédit", valeurs: [15, 25] } // orDepart
    },
    RANG_MAX: 2,
    PLAFONDS: { orDepart: 180, orParReponse: 22, bonusDegats: 0.6, pvChateau: 40 },
    // 8.6 : le marchand du MVP
    MARCHAND: { prix: { faveur: 45, vivres: 40, plan: 15, rafraichir: 10 }, remise: 0.2, planOr: 25 },
    // 9 : or de route hors batailles
    OR_ROUTE: { bivouacPlein: 25, veillee: 4, veilleeSansFaveur: 25, marchands: 4, archives: 2, incendiePlein: 20, mercenaires: 40 },
    // 10.1 : renommée
    RENOM: { reponse: 1, halte: 4, cede: 2, parchemin: [10, 20], gardien: [15, 3], grand: [30, 5], complete: 20, orPour: 5, banniere: [0.1, 0.2] },
    // 10.2 : les cinq quartiers de l'Armorial du MVP (prix de chaque rang)
    ARMORIAL: {
      vivres: { nom: "Vivres de route", prix: [40, 110] },
      bourse: { nom: "Bourse du voyageur", prix: [25, 50, 90] },
      murs: { nom: "Murs chaulés", prix: [35, 75] },
      ouverture: { nom: "Faveur d'ouverture", prix: [80] },
      banniere: { nom: "Bannière", prix: [60, 140] }
    },
    // 9 : victoire sur le Grand Gardien
    VICTOIRE: { coups: 3, rivalite: 6, ressources: 8, rivaliteGardien: 2 },
    CARTES: ["gue", "foret", "moulin", "col", "chateau"],
    EVENEMENTS_ROUTE: ["marchands", "defi", "mercenaires", "incendie", "espion", "archives"],
    BATAILLES: ["escarmouche", "embuscade", "gardien", "grand"],
    HISTORIQUE_MAX: 20
  };
  // La matière dont le conseiller tient la porte d'une famille (le ménestrel pour le français, l'interprète pour l'anglais).
  var MATIERE_FAMILLE = { histoire: "histoire", geographie: "geographie", svt: "svt", physique: "physique", francais: "litterature", anglais: "anglais" };

  // ---------- textes de jeu (aucun fait de cours, aucun nom propre ; {N} : le conseiller, {S} : la semaine) ----------
  var TEXTES = {
    cadres: {
      route: [
        "{N} marche à tes côtés sur la route de la semaine {S}. « Avant la prochaine halte, seigneur, dis-moi ceci. »",
        "Les éclaireurs ont trouvé un camp à prendre. {N} te retient par la manche : « Une question, et je paie les hommes. »",
        "La compagnie fait halte au bord du chemin. {N} s'assied sur une borne : « Les terres de la semaine {S} ont leurs secrets. Voyons si tu les connais. »"
      ],
      embuscade: [
        "Des cris dans le bois : on vous tombe dessus ! {N} te tire par la manche : « Réponds, seigneur, et j'arme les chariots. »",
        "Les chariots se mettent en cercle. {N} te crie par-dessus le vacarme : « Une question de la semaine {S}, et les hommes tiendront. »",
        "Une flèche se plante dans la bâche. {N} garde son calme : « Ils sont nombreux. Réponds, et je fais payer les archers. »"
      ],
      gardien: [
        "{N} regarde la tour du gardien se découper sur la colline. « Il garde la semaine {S}. Montre-lui que tu la connais. »",
        "Le camp du seigneur rival barre la route. {N} déroule ses notes : « Avant l'assaut, seigneur, une question. »",
        "Les bannières adverses claquent au vent. {N} te glisse : « Toute la semaine {S} tient dans cette bataille. Réponds, et j'ouvre le coffre. »"
      ],
      bivouac: [
        "Le camp est dressé. {N} déplie ses notes de la semaine {S} à la lueur du feu : « Une question, et je te laisse dormir. »",
        "Les hommes se chauffent autour des braises. {N} s'approche : « La veillée commence par ceci, seigneur. »",
        "Un hibou appelle dans la nuit. {N} te tend une écuelle : « Avant de te reposer, dis-moi ce que tu retiens de la semaine {S}. »"
      ],
      marchand: [
        "{N} ouvre son étal sur la place du bourg : « Une bonne réponse, et je fais un prix. »",
        "Les toiles de l'étal battent au vent. {N} soupèse une bourse : « Montre-moi ce que tu sais de la semaine {S}, et les prix baissent. »",
        "{N} aligne ses marchandises : « Je ne vends qu'aux seigneurs instruits. Réponds d'abord. »"
      ],
      archives: [
        "Un vieux scribe ouvre ses registres. {N} lui répond : « Mon seigneur se souvient des semaines passées. Écoute. »",
        "La poussière des registres fait tousser {n}. « Voici une page des semaines d'avant la semaine {S}. Tu t'en souviens ? »",
        "Le scribe trempe sa plume. {N} te souffle : « Il note tout ce que tu sais encore des semaines passées. Réponds bien. »"
      ],
      porte: [
        "{N} t'attend à la sortie du camp, un présent sous le bras : « Ma faveur se mérite. Une question de mon art, seigneur. »",
        "{N} sort de la tente avec un coffret : « Sur la route de la semaine {S}, je n'offre mes dons qu'à qui répond juste. »",
        "{N} te rejoint sur le chemin : « Une question de ma matière, et tu choisiras parmi mes faveurs. »"
      ]
    },
    eclaireur: [
      "Nous traversons les terres de la semaine {S} : ses cours sont en tête.",
      "L'éclaireur revient : « Semaine {S}, seigneur. Ses leçons reviendront dans chaque conseil de guerre. »"
    ],
    fenetre: {
      pleine: "Les cours de la semaine {S} t'attendent sur la route.",
      elargie: "La semaine {S} est encore mince sur les registres : la route repasse aussi par {P}.",
      demi: "Peu de cours déposés pour la semaine {S} : une question sur trois en vient, le reste vient de tout le royaume.",
      vide: "La semaine {S} attend ses cours : la route puise dans tout le royaume.",
      sautee: "Semaine {S} traversée sans halte : ses cours ne sont pas encore déposés."
    },
    haltes: { escarmouche: "Escarmouche", embuscade: "Embuscade", evenement: "Événement", marchand: "Marchand", bivouac: "Bivouac", gardien: "Gardien de la semaine", grand: "Grand Gardien" },
    portes: { faveur: "Faveur {C}", bourse: "Bourse", parchemin: "Parchemin de renommée", vivres: "Vivres" },
    faveurs: {
      annales: ["+{V} or par bonne réponse au conseil de guerre.", "+{V} or par bonne réponse au conseil de guerre."],
      eclaireurs: ["La première vague adverse perd un homme d'armes.", "Les deux premières vagues adverses perdent un homme d'armes."],
      simples: ["+{V} vivre tout de suite.", "+{V} vivre tout de suite, et un sac de plus au maximum."],
      engrenages: ["Dégâts de tes tours +{V} %.", "Dégâts de tes tours +{V} %."],
      ballade: ["Une erreur coûte {V} or au lieu de {B} au conseil de guerre.", "Une erreur coûte {V} or au lieu de {B} au conseil de guerre."],
      lettres: ["+{V} or au début de chaque bataille de route.", "+{V} or au début de chaque bataille de route."]
    },
    rangs: ["commune", "rare", "épique"],
    themes: { histoire: "la mémoire", geographie: "les routes", svt: "les remèdes", physique: "les engins", francais: "le moral", anglais: "les alliances" },
    armorial: {
      vivres: "+{V} vivre au départ et au maximum.",
      bourse: "+{V} or au début de chaque bataille de route.",
      murs: "Ton château a +{V} de solidité dans les batailles de route.",
      ouverture: "Une faveur commune au choix parmi trois au départ de chaque expédition.",
      banniere: "Renommée +{V} % à la fin de chaque expédition."
    },
    marchand: {
      faveur: "Faveur : {F}", vivres: "Un sac de vivres", plan: "Un plan de bataille (+{V} or au début de la prochaine bataille de route)",
      rafraichir: "Rafraîchir l'étal", restant: "L'or de route qui te reste deviendra de la renommée au retour (un point pour cinq)."
    },
    evenements: {
      archives: { titre: "Les archives", icone: "parchemin-plume", texte: "Un vieux scribe du bailli garde les registres des semaines passées. Chaque bonne réponse vaut double renommée et un peu d'or de route.", questions: 3 },
      fin: {
        marchands: ["Le marché a été bon : +{O} or de route en plus des ressources.", "Les marchands repartent sans rien vendre. Rien n'est perdu."],
        defi: ["Ton champion l'emporte : le gardien de la semaine a perdu trois coups.", "Le duel reste indécis. Le gardien ne gagne rien."],
        mercenaires: ["Les mercenaires marchent avec la compagnie : +{O} or au début de la prochaine bataille de route.", "Les mercenaires passent leur chemin."],
        incendie: ["Le feu est éteint. Les villageois remplissent un sac de vivres pour la compagnie.", "Le feu est éteint, mais les villageois gardent leurs réserves. Rien n'est perdu."],
        incendiePlein: "Le feu est éteint. Les sacs sont déjà pleins : les villageois donnent {O} or de route.",
        espion: ["L'espion avoue : la première vague adverse de la prochaine bataille de route sera plus faible.", "L'espion se tait. Rien n'est perdu."],
        archives: ["Le scribe referme ses registres, satisfait : renommée doublée et +{O} or de route.", "Le scribe referme ses registres. Les semaines passées reviendront sur la route."]
      }
    },
    bivouac: { repos: "La compagnie dort d'une traite : un sac de vivres de plus.", reposPlein: "Les sacs sont pleins : les hommes vendent le surplus, +{O} or de route.",
      veillee: "La veillée rapporte +{O} or de route.", veilleeParfaite: "Sans faute à la veillée : une faveur s'affine.", veilleeParfaiteSansFaveur: "Sans faute à la veillée, et aucune faveur à affiner : +{O} or de route." },
    semaine: { titre: "Semaine {S}", franchie: "Semaine {S} franchie : le relais suivant est ouvert.", gardien: "Un seigneur rival garde la sortie de la semaine {S}.", grand: "{G} attend au bout de la route, devant la place que tu convoites." },
    depart: { souverain: "{souverain} te confie la route des semaines {A} à {B}. Reviens couvert de renommée.", sansSouverain: "Le royaume te confie la route des semaines {A} à {B}. Reviens couvert de renommée.",
      uneSemaine: "{souverain} te confie la route de la semaine {A}. Reviens couvert de renommée.", attente: "La route attend tes premiers cours." },
    bilan: {
      victoire: "Expédition accomplie", retour: "Retour au domaine", abandon: "Le camp est levé",
      chroniqueur: "Une expédition qui apprend n'est jamais perdue.",
      renom: "Renommée gagnée : {R} (tu en as {T}, {D} à dépenser).",
      orRestant: "L'or de route restant devient de la renommée : +{R}.",
      meilleures: "Tes meilleures matières sur cette route", relire: "À relire", graine: "Graine {G}"
    },
    chronique: {
      depart: "La compagnie part en expédition vers {F} : semaines {A} à {B}.",
      departUne: "La compagnie part en expédition vers {F} : semaine {A}.",
      franchie: "La compagnie a franchi la semaine {S} : le gardien a cédé.",
      victoire: "L'expédition des semaines {A} à {B} est accomplie. La compagnie rentre avec {R} points de renommée.",
      retour: "L'expédition s'est arrêtée à la semaine {S}, {H} halte. La compagnie rentre avec {R} points de renommée.",
      abandon: "La compagnie a levé le camp à la semaine {S} et rentre avec {R} points de renommée.",
      reparee: "La route de l'expédition n'a pas pu être relue : la compagnie rentre au domaine avec sa renommée.",
      armorial: "L'Armorial s'enrichit : {Q}."
    },
    fronts: { angleterre: "l'ouest", omeyyades: "le sud" }
  };

  // ---------- tirage à graine (mulberry32, le même que les simulateurs) ; jamais Math.random dans la génération ----------
  function alea(graine) {
    var a = graine >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  alea.entier = function (r, n) { return Math.floor(r() * n); };
  alea.choisir = function (r, liste) { return liste[Math.floor(r() * liste.length)]; };
  alea.melanger = function (r, liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  };
  // poids : un tableau de nombres (renvoie l'indice tiré) ou un objet { clé: poids } (renvoie la clé tirée)
  alea.pondere = function (r, poids) {
    var cles = Array.isArray(poids) ? null : Object.keys(poids);
    var valeurs = cles ? cles.map(function (k) { return poids[k]; }) : poids;
    var total = 0;
    valeurs.forEach(function (w) { total += Math.max(0, w || 0); });
    if (!total) return cles ? cles[0] : 0;
    var x = r() * total;
    for (var i = 0; i < valeurs.length; i++) { x -= Math.max(0, valeurs[i] || 0); if (x < 0) return cles ? cles[i] : i; }
    return cles ? cles[valeurs.length - 1] : valeurs.length - 1;
  };
  // Sous-graine : hash(graine, a, b, …) mélange des nombres ou des chaînes en un entier 32 bits.
  function hash(graine) {
    var h = ((graine >>> 0) ^ 0x9E3779B9) >>> 0;
    for (var k = 1; k < arguments.length; k++) {
      var v = arguments[k], n = 0;
      if (typeof v === "number") n = v | 0;
      else { var s = String(v); for (var i = 0; i < s.length; i++) n = (Math.imul(n, 31) + s.charCodeAt(i)) | 0; }
      h = Math.imul(h ^ n, 0x85EBCA6B) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35) >>> 0; h ^= h >>> 16;
    }
    return h >>> 0;
  }
  function borne(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function objet(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function nombre(x) { return typeof x === "number" && isFinite(x); }
  function hex(graine) { var h = (graine >>> 0).toString(16).toUpperCase(); while (h.length < 8) h = "0" + h; return h.slice(0, 4) + "-" + h.slice(4); }
  function ordinal(n) { return n === 1 ? "1re" : n + "e"; }
  function remplir(texte, valeurs) {
    return String(texte).replace(/\{([A-Za-z]+)\}/g, function (m, k) { return valeurs && valeurs[k] != null ? String(valeurs[k]) : m; });
  }

  // ---------- réglages ----------
  function reglages() {
    var c = (JEU.donnees.config && objet(JEU.donnees.config.expedition)) ? JEU.donnees.config.expedition : {};
    var r = {};
    Object.keys(DEFAUTS).forEach(function (k) {
      var v = c[k], d = DEFAUTS[k];
      r[k] = typeof d === "boolean" ? (typeof v === "boolean" ? v : d) : (nombre(v) ? v : d);
    });
    r.semaines = Math.max(1, Math.round(r.semaines));
    r.couches = Math.max(1, Math.round(r.couches));
    r.vivres = borne(Math.round(r.vivres), 1, VIVRES_MAX);
    r.questionsSemaine = borne(Math.round(r.questionsSemaine), 0, 3);
    r.quotaPlein = Math.max(1, Math.round(r.quotaPlein));
    r.quotaDemi = Math.max(1, Math.min(r.quotaPlein, Math.round(r.quotaDemi)));
    r.difficulte = borne(Math.round(r.difficulte), -4, 4);
    r.vitesse = [1, 2, 3].indexOf(r.vitesse) >= 0 ? r.vitesse : 1;
    return r;
  }

  // ---------- semaine d'un cours, frontière, relais ----------
  // Semaine d'un cours : celle de son entrée du planning ; null pour un cours de langue, une fiche méthode ou une séquence
  // d'anglais (les « compagnons de route », qui viennent par la troisième question). JEU.progression.semaineDe quand il
  // existe (contrat partagé avec le repère de semaine), sinon le même calcul ici.
  function semaineDe(coursId) {
    var P = JEU.progression;
    if (P && typeof P.semaineDe === "function") return P.semaineDe(coursId);
    if (!coursId || /^(methode|langue|anglais)-/.test(coursId)) return null;
    var e = P ? P.entree(coursId) : null;
    if (e && typeof e.semaine === "number") return e.semaine;
    var m = /^[a-z]+-s(\d\d)-\d+$/.exec(coursId);
    return m ? parseInt(m[1], 10) : null;
  }
  function coursOuverts() { return JEU.progression.coursAccessibles(); }
  // Semaines qui ont au moins un cours chargé, dans l'ordre.
  function semainesOuvertes() {
    var vues = {}, res = [];
    coursOuverts().forEach(function (id) { var s = semaineDe(id); if (s != null && s >= 1 && !vues[s]) { vues[s] = true; res.push(s); } });
    return res.sort(function (a, b) { return a - b; });
  }
  function frontiere() { var s = semainesOuvertes(); return s.length ? s[s.length - 1] : 0; }
  function coursDeSemaine(s) { return coursOuverts().filter(function (id) { return semaineDe(id) === s; }); }
  // Relais ouverts : S1, la semaine qui suit chaque semaine franchie, et le tronçon de l'année en cours (frontière − 2),
  // chacun ramené à la première semaine ouverte à partir de lui (une semaine sans cours n'est pas un départ), bornés à la
  // frontière ; avec relaisLibres, toutes les semaines ouvertes.
  function relais() {
    var f = frontiere();
    if (!f) return [];
    var ouvertes = semainesOuvertes(), cfg = reglages();
    if (cfg.relaisLibres) return ouvertes.slice();
    var cand = [1, Math.max(1, f - 2)].concat(etat().franchies.map(function (w) { return w + 1; }));
    var res = [];
    cand.forEach(function (w) {
      if (w > f) return;
      var o = ouvertes.filter(function (x) { return x >= w; })[0];
      if (o != null && res.indexOf(o) < 0) res.push(o);
    });
    return res.sort(function (a, b) { return a - b; });
  }
  function relaisDefaut() { var r = relais(); return r.length ? r[r.length - 1] : null; }
  // Les semaines d'une expédition qui part de « depart » : les nb premières semaines ouvertes à partir du relais.
  function semainesDepuis(depart, nb) { return semainesOuvertes().filter(function (s) { return s >= depart; }).slice(0, nb); }

  // ---------- fenêtre et quota d'un acte (3.3 : les semaines minces) ----------
  function candidatsDe(semaines) {
    if (!semaines.length) return [];
    return JEU.recit.candidats(function (q) { return semaines.indexOf(semaineDe(q.cours)) >= 0; });
  }
  function famillesDeCandidats(cands) {
    var vues = {}, res = [];
    cands.forEach(function (c) { var f = c.famille || JEU.recit.famille(c.matiere); if (f && !vues[f]) { vues[f] = true; res.push(f); } });
    return res;
  }
  // { semaine, semaines (la fenêtre), quota (questions sur 3), fiches (candidates), cas (pleine | elargie | demi | vide) }
  function fenetre(semaine) {
    var cfg = reglages(), plein = cfg.quotaPlein, demi = cfg.quotaDemi, quota = cfg.questionsSemaine;
    var fen = [semaine], cands = candidatsDe(fen), n = cands.length;
    if (n >= plein) return { semaine: semaine, semaines: fen, quota: quota, fiches: n, cas: "pleine", familles: famillesDeCandidats(cands) };
    for (var k = 1; k <= 2 && semaine - k >= 1; k++) {
      fen = [semaine - k].concat(fen);
      cands = candidatsDe(fen); n = cands.length;
      if (n >= plein) return { semaine: semaine, semaines: fen, quota: quota, fiches: n, cas: "elargie", familles: famillesDeCandidats(cands) };
    }
    if (n >= demi) return { semaine: semaine, semaines: fen, quota: quota ? Math.max(1, Math.floor(quota / 2)) : 0, fiches: n, cas: "demi", familles: famillesDeCandidats(cands) };
    return { semaine: semaine, semaines: [], quota: 0, fiches: n, cas: "vide", familles: [] };
  }
  function quotaDe(semaine) { return fenetre(semaine).quota; }
  // La phrase de la page de semaine pour une fenêtre (ou un acte de la route, qui porte les mêmes champs).
  function texteFenetre(f) {
    var autres = (f.semaines || []).filter(function (s) { return s !== f.semaine; });
    var P = autres.length > 1 ? "les semaines " + autres.join(" et ") : autres.length ? "la semaine " + autres[0] : "les semaines d'avant";
    return remplir(TEXTES.fenetre[f.cas] || TEXTES.fenetre.vide, { S: f.semaine, P: P });
  }

  // ---------- génération procédurale (4.2) ----------
  function faveursPossibles(famillesChargees) {
    return Object.keys(EXP.FAVEURS).filter(function (id) { return famillesChargees.indexOf(EXP.FAVEURS[id].famille) >= 0; });
  }
  function copierCtx(ctx) { return JSON.parse(JSON.stringify(ctx)); }
  function retype(h, type, ctx) {
    if (h.type === "embuscade") ctx.embuscades--;
    if (type === "embuscade") ctx.embuscades++;
    h.type = type;
    delete h.porte; delete h.ev; delete h.etal;
  }
  function tirerType(r, table, couche, ctx) {
    var poids = {};
    Object.keys(table).forEach(function (t) { poids[t] = table[t]; });
    if (ctx.embuscades >= 2 && poids.embuscade) poids.embuscade = 0; // G9 : deux embuscades au plus par expédition
    for (var essai = 0; essai < 10; essai++) {
      var t = alea.pondere(r, poids);
      if (t === "escarmouche" || !couche.some(function (h) { return h.type === t; })) return t;
    }
    return "escarmouche";
  }
  function droite(couche, ok) { for (var i = couche.length - 1; i >= 0; i--) if (ok(couche[i])) return couche[i]; return null; }
  function plat(couches) { return couches.reduce(function (a, c) { return a.concat(c); }, []); }
  // Corrections d'ordre fixe après le tirage des types (4.2, étape 3).
  function corrections(couches, ctx) {
    var n = couches.length, derniere = couches[n - 1], avant = couches[n - 2] || derniere, tous = plat(couches);
    if (!tous.some(function (h) { return h.type === "marchand"; })) {
      var m = droite(derniere, function (h) { return h.type !== "bivouac"; }) || droite(avant, function (h) { return h.type !== "bivouac"; });
      if (m) retype(m, "marchand", ctx);
    }
    if (!derniere.some(function (h) { return h.type === "bivouac"; })) {
      var b = droite(derniere, function (h) { return h.type !== "marchand"; });
      if (b) retype(b, "bivouac", ctx);
    }
    if (!plat(couches.slice(0, 2)).some(function (h) { return h.type === "escarmouche" || h.type === "embuscade"; })) retype(couches[0][0], "escarmouche", ctx);
    var emb = tous.filter(function (h) { return h.type === "embuscade"; });
    for (var i = 1; i < emb.length; i++) retype(emb[i], "escarmouche", ctx);
  }
  // Chemins entre deux couches voisines : un escalier monotone tiré à la graine, de la 1re halte de A à la dernière de B
  // (chaque pas va vers la droite, vers le bas ou en diagonale). Par construction, toute halte a un chemin entrant et un
  // chemin sortant et deux chemins ne se croisent jamais (jamais i < i' avec j > j') ; une halte mène à deux haltes au
  // plus et en reçoit deux au plus tant que c'est possible ; dès que la couche suivante a deux haltes, il y a un choix.
  function escalier(r, n1, n2) {
    for (var essai = 0; essai < 10; essai++) {
      var i = 0, j = 0, paires = [[0, 0]], sortants = [1], entrants = [1], droites = 0;
      while (i < n1 - 1 || j < n2 - 1) {
        var options = [];
        if (j < n2 - 1 && (sortants[i] || 0) < 2) options.push("droite");
        if (i < n1 - 1 && (entrants[j] || 0) < 2) options.push("bas");
        if (i < n1 - 1 && j < n2 - 1) options.push("diag");
        if (!options.length) options = j < n2 - 1 ? ["droite"] : ["bas"];
        var choix = options[alea.pondere(r, options.map(function (o) { return o === "diag" ? 1 : 2; }))];
        if (choix === "droite") { j++; droites++; } else if (choix === "bas") i++; else { i++; j++; }
        paires.push([i, j]);
        sortants[i] = (sortants[i] || 0) + 1; entrants[j] = (entrants[j] || 0) + 1;
      }
      if (n2 < 2 || droites > 0) return paires;
    }
    var p = [[0, 0], [0, 1]], a = 0, b = 1; // repli : un embranchement forcé en tête, puis la diagonale
    while (a < n1 - 1 || b < n2 - 1) { if (a < n1 - 1) a++; if (b < n2 - 1) b++; p.push([a, b]); }
    return p;
  }
  function indexDans(couche, id) { for (var i = 0; i < couche.length; i++) if (couche[i].id === id) return i; return -1; }
  // Ajouter le chemin i → j croiserait-il un chemin déjà tracé entre A et B ?
  function croise(A, B, i, j) {
    return A.some(function (h, i2) {
      return h.suivants.some(function (id) { var j2 = indexDans(B, id); return (i < i2 && j > j2) || (i > i2 && j < j2); });
    });
  }
  function relier(r, couches) {
    for (var k = 0; k + 1 < couches.length; k++) {
      var A = couches[k], B = couches[k + 1];
      A.forEach(function (h) { h.suivants = []; });
      escalier(r, A.length, B.length).forEach(function (pr) {
        var id = B[pr[1]].id;
        if (A[pr[0]].suivants.indexOf(id) < 0) A[pr[0]].suivants.push(id);
      });
      // G3 : une halte qui ne mène qu'à l'embuscade reçoit aussi la voisine de l'embuscade, si ce chemin ne croise rien
      A.forEach(function (h, i) {
        if (h.suivants.length !== 1) return;
        var j = indexDans(B, h.suivants[0]);
        if (j < 0 || B[j].type !== "embuscade") return;
        var pos = function (x, n) { return n === 1 ? 0.5 : x / (n - 1); };
        var voisines = [j - 1, j + 1].filter(function (x) { return x >= 0 && x < B.length; })
          .sort(function (a, b) { return Math.abs(pos(a, B.length) - pos(i, A.length)) - Math.abs(pos(b, B.length) - pos(i, A.length)) || a - b; });
        for (var v = 0; v < voisines.length; v++) {
          if (!croise(A, B, i, voisines[v])) { h.suivants.push(B[voisines[v]].id); break; }
        }
      });
      A.forEach(function (h) { h.suivants.sort(function (a, b) { return indexDans(B, a) - indexDans(B, b); }); });
    }
  }
  // Le conseiller d'une porte de faveur : la rotation des familles (jamais deux fois la même dans la semaine tant qu'il en
  // reste une non proposée) ; quand toutes ont été proposées, tirage pondéré (×1 si la famille a des cours dans la
  // fenêtre de l'acte, ×0,3 sinon, ×1,5 si elle a des notions à revoir).
  function prochainConseiller(r, ctx, proposees, fen, p) {
    var fams = ctx.rotation, n = fams.length;
    for (var k = 0; k < n; k++) {
      var f = fams[(ctx.rot + k) % n];
      if (proposees.indexOf(f) < 0) { ctx.rot = (ctx.rot + k + 1) % n; proposees.push(f); return f; }
    }
    var poids = fams.map(function (f) { return ((fen.familles || []).indexOf(f) >= 0 ? 1 : 0.3) * ((p.famillesARevoir || []).indexOf(f) >= 0 ? 1.5 : 1); });
    return fams[alea.pondere(r, poids)];
  }
  function prochainEvenement(ctx) {
    var ev = ctx.evenements[ctx.ev % ctx.evenements.length];
    ctx.ev++;
    return ev;
  }
  function faireGardien(r, s, o, p, ctx, proposees, fen) {
    var type = o.dernier ? "grand" : "gardien", def = EXP.HALTES[type];
    return { id: "s" + s + "g", type: type, semaine: s, place: def.place, vagues: def.vagues, suivants: [],
      carte: o.dernier && p.carteGrand ? p.carteGrand : EXP.CARTES[(s - 1) % EXP.CARTES.length],
      porte: { genre: "faveur", conseiller: prochainConseiller(r, ctx, proposees, fen, p), rare: true } };
  }
  // Portes, événements et étals d'un acte dont les types et les chemins sont fixés.
  function garnir(r, acte, p, ctx, proposees, fen) {
    var possibles = faveursPossibles(p.famillesChargees);
    plat(acte.couches).forEach(function (h) {
      if (h.type === "escarmouche" || h.type === "embuscade") {
        var genre = h.type === "embuscade" ? "faveur" : alea.pondere(r, EXP.PORTES);
        h.porte = { genre: genre };
        if (genre === "faveur") { h.porte.conseiller = prochainConseiller(r, ctx, proposees, fen, p); h.porte.rare = r() < EXP.RARE[h.type]; }
      } else if (h.type === "evenement") {
        if (!h.ev) h.ev = prochainEvenement(ctx);
      } else if (h.type === "marchand") {
        h.etal = { lignes: [possibles.length ? "faveur:" + alea.choisir(r, possibles) : "plan", "vivres", "plan", "rafraichir"].filter(function (l, i, t) { return t.indexOf(l) === i; }) };
      }
    });
    ctx.archives += plat(acte.couches).filter(function (h) { return h.ev === "archives"; }).length;
  }
  function tirerActe(r, s, a, p, ctx, o) {
    var fen = p.fenetres[s] || { semaines: [], quota: 0, fiches: 0, cas: "vide", familles: [] };
    var nb = o.cfg.couches, couches = [], proposees = [];
    for (var k = 0; k < nb; k++) {
      var n = r() < 0.45 ? 3 : 2;
      var table = EXP.TYPES_COUCHE[k === 0 ? 0 : (k === nb - 1 ? 2 : 1)];
      var couche = [];
      for (var i = 0; i < n; i++) {
        var type = tirerType(r, table, couche, ctx);
        couche.push({ id: "s" + s + "c" + (k + 1) + "h" + (i + 1), couche: k + 1, rang: i + 1, type: type, suivants: [] });
        if (type === "embuscade") ctx.embuscades++;
      }
      couches.push(couche);
    }
    // G8 : les archives garanties, dernière halte de la 1re couche de la 2e semaine (ou de la seule semaine)
    if (o.archives) {
      var ha = couches[0][couches[0].length - 1];
      couches[0].forEach(function (h) { if (h !== ha && h.type === "evenement") retype(h, "escarmouche", ctx); });
      retype(ha, "evenement", ctx); ha.ev = "archives";
    }
    corrections(couches, ctx);
    relier(r, couches);
    var acte = { semaine: s, semaines: fen.semaines.slice(), quota: fen.quota, fiches: fen.fiches, cas: fen.cas,
      carte: EXP.CARTES[(s - 1) % EXP.CARTES.length], couches: couches, gardien: null };
    garnir(r, acte, p, ctx, proposees, fen);
    acte.gardien = faireGardien(r, s, o, p, ctx, proposees, fen);
    couches[couches.length - 1].forEach(function (h) { h.suivants = [acte.gardien.id]; });
    return acte;
  }
  // La semaine de secours, fixe et valide : escarmouche + événement / marchand + embuscade (ou événement) / bivouac + escarmouche.
  function acteDeSecours(r, s, a, p, ctx, o) {
    var fen = p.fenetres[s] || { semaines: [], quota: 0, fiches: 0, cas: "vide", familles: [] };
    var proposees = [];
    function h(c, i, type) { return { id: "s" + s + "c" + c + "h" + i, couche: c, rang: i, type: type, suivants: [] }; }
    var c1 = [h(1, 1, "escarmouche"), h(1, 2, "evenement")];
    var c2 = [h(2, 1, "marchand"), h(2, 2, ctx.embuscades < 2 ? "embuscade" : "evenement")];
    var c3 = [h(3, 1, "bivouac"), h(3, 2, "escarmouche")];
    if (c2[1].type === "embuscade") ctx.embuscades++;
    c1[0].suivants = [c2[0].id]; c1[1].suivants = [c2[0].id, c2[1].id];
    c2[0].suivants = [c3[0].id, c3[1].id]; c2[1].suivants = [c3[1].id];
    c1[1].ev = (o.archives || ctx.archives === 0) ? "archives" : prochainEvenement(ctx);
    if (c2[1].type === "evenement") c2[1].ev = prochainEvenement(ctx);
    var acte = { semaine: s, semaines: fen.semaines.slice(), quota: fen.quota, fiches: fen.fiches, cas: fen.cas,
      carte: EXP.CARTES[(s - 1) % EXP.CARTES.length], couches: [c1, c2, c3], gardien: null, secours: true };
    garnir(r, acte, p, ctx, proposees, fen);
    acte.gardien = faireGardien(r, s, o, p, ctx, proposees, fen);
    c3.forEach(function (x) { x.suivants = [acte.gardien.id]; });
    return acte;
  }
  // Les garanties d'une semaine (4.3 : G1 à G7). Renvoie la liste des garanties manquantes (vide : la semaine est bonne).
  function controlerActe(acte) {
    var manques = [];
    if (!acte || !Array.isArray(acte.couches) || !acte.couches.length || !acte.gardien) return ["structure"];
    var couches = acte.couches, n = couches.length, tous = plat(couches), ids = {};
    tous.forEach(function (h) { ids[h.id] = h; });
    var marchands = tous.filter(function (h) { return h.type === "marchand"; });
    if (marchands.length !== 1 || marchands[0].couche < Math.min(2, n)) manques.push("G1");
    if (!couches[n - 1].some(function (h) { return h.type === "bivouac"; })) manques.push("G2");
    if (tous.filter(function (h) { return h.type === "embuscade"; }).length > 1) manques.push("G3");
    tous.forEach(function (h) { if (h.suivants.length === 1 && ids[h.suivants[0]] && ids[h.suivants[0]].type === "embuscade") manques.push("G3"); });
    if (!plat(couches.slice(0, 2)).some(function (h) { return h.type === "escarmouche" || h.type === "embuscade"; })) manques.push("G4");
    couches.forEach(function (c) {
      var vus = {};
      c.forEach(function (h) { if (h.type !== "escarmouche") { if (vus[h.type]) manques.push("G5"); vus[h.type] = true; } });
    });
    // G6 : un chemin tranquille (au plus une bataille) du départ au gardien
    var cout = {};
    couches[0].forEach(function (h) { cout[h.id] = h.type === "escarmouche" || h.type === "embuscade" ? 1 : 0; });
    for (var k = 0; k + 1 < n; k++) {
      couches[k].forEach(function (h) {
        h.suivants.forEach(function (id) {
          var g = ids[id]; if (!g) return;
          var c = cout[h.id] + (g.type === "escarmouche" || g.type === "embuscade" ? 1 : 0);
          if (cout[id] === undefined || c < cout[id]) cout[id] = c;
        });
      });
    }
    if (!couches[n - 1].some(function (h) { return cout[h.id] !== undefined && cout[h.id] <= 1; })) manques.push("G6");
    // G7 : entrants, sortants, cibles dans la couche suivante, aucun croisement
    for (k = 0; k < n; k++) {
      var A = couches[k], B = k + 1 < n ? couches[k + 1] : null, chemins = [];
      A.forEach(function (h, i) {
        if (!h.suivants.length) manques.push("G7");
        if (!B) { if (h.suivants.some(function (id) { return id !== acte.gardien.id; })) manques.push("G7"); return; }
        h.suivants.forEach(function (id) { var j = indexDans(B, id); if (j < 0) manques.push("G7"); else chemins.push([i, j]); });
      });
      if (B) B.forEach(function (g) { if (!A.some(function (h) { return h.suivants.indexOf(g.id) >= 0; })) manques.push("G7"); });
      for (var x = 0; x < chemins.length; x++) for (var y = 0; y < chemins.length; y++) if (chemins[x][0] < chemins[y][0] && chemins[x][1] > chemins[y][1]) manques.push("G7");
    }
    return manques.filter(function (m, i, t) { return t.indexOf(m) === i; });
  }
  function verifierActe(acte) { return controlerActe(acte).length === 0; }

  // generer(graine, p) → la route, écrite dans la sauvegarde et jamais recalculée.
  // p : { depart, semaines: [4, 5, 6], frontiere, front, fenetres: { 4: fenetre(4), … }, famillesChargees, famillesARevoir,
  //      carteGrand, sautees, config }
  function generer(graine, p) {
    var cfg = p.config || reglages();
    var r0 = alea(hash(graine, "expedition"));
    var fams = (p.famillesChargees && p.famillesChargees.length) ? p.famillesChargees : ["histoire"];
    var ctx = { rotation: alea.melanger(r0, fams), rot: 0, embuscades: 0, archives: 0,
      evenements: alea.melanger(r0, EXP.EVENEMENTS_ROUTE.filter(function (e) { return e !== "archives"; })), ev: 0 };
    var nb = p.semaines.length, acteArchives = Math.min(1, nb - 1);
    var actes = p.semaines.map(function (s, a) {
      var o = { dernier: a === nb - 1, archives: a === acteArchives, cfg: cfg };
      for (var essai = 0; essai < 20; essai++) {
        var copie = copierCtx(ctx);
        var acte = tirerActe(alea(hash(graine, s, essai)), s, a, p, copie, o);
        if (verifierActe(acte)) { ctx = copie; acte.essais = essai + 1; return acte; }
      }
      var c2 = copierCtx(ctx);
      var secours = acteDeSecours(alea(hash(graine, s, "secours")), s, a, p, c2, { dernier: o.dernier, archives: o.archives || ctx.archives === 0, cfg: cfg });
      ctx = c2; secours.essais = 21;
      return secours;
    });
    return { version: VERSION_ROUTE, graine: graine >>> 0, front: p.front, depart: p.depart, sautees: (p.sautees || []).slice(), actes: actes };
  }

  // ---------- état (bloc expedition de la sauvegarde, schéma 6) ----------
  function compteVide() {
    return { questions: 0, bonnes: 0, serie: 0, meilleureSerie: 0, parFamille: {}, parMatiere: {}, parSemaine: {}, renom: 0, renomHaltes: 0, fiches: [] };
  }
  function etatVide() {
    return {
      renom: 0, renomTotal: 0,
      armorial: { vivres: 0, bourse: 0, murs: 0, ouverture: 0, banniere: 0, saufConduit: 0, memoire: 0, forge: 0, monture: 0 },
      franchies: [],
      sermentsOuverts: false, serments: { garde: false, guetteur: false, vivres: false, marchand: false, hate: false, champion: false },
      titres: [], records: {}, reponsesParFamille: {}, historique: [], enCours: null
    };
  }
  function halteValide(h) { return objet(h) && typeof h.id === "string" && typeof h.type === "string" && Array.isArray(h.suivants); }
  function routeLisible(route) {
    return objet(route) && Array.isArray(route.actes) && route.actes.length > 0 && route.actes.every(function (a) {
      return objet(a) && nombre(a.semaine) && Array.isArray(a.couches) && a.couches.length && a.couches.every(function (c) { return Array.isArray(c) && c.length && c.every(halteValide); }) &&
        halteValide(a.gardien) && (a.gardien.type === "gardien" || a.gardien.type === "grand");
    });
  }
  // Complète ou répare le bloc (sauvegarde plus ancienne ou abîmée) sans toucher à ce qui est valable : une valeur absente,
  // nulle ou du mauvais genre reprend sa valeur neuve. Une expédition en cours illisible est close proprement : sa renommée,
  // créditée au fil de la route, est déjà acquise ; la chronique le dit en une ligne.
  function completer(x) {
    var v = etatVide();
    if (!objet(x)) return v;
    Object.keys(v).forEach(function (k) {
      if (x[k] === undefined) x[k] = v[k];
      else if (v[k] !== null && (x[k] === null || typeof x[k] !== typeof v[k] || Array.isArray(x[k]) !== Array.isArray(v[k]))) x[k] = v[k];
    });
    if (!nombre(x.renom) || x.renom < 0) x.renom = 0;
    if (!nombre(x.renomTotal) || x.renomTotal < x.renom) x.renomTotal = x.renom;
    x.renom = Math.floor(x.renom); x.renomTotal = Math.floor(x.renomTotal);
    Object.keys(v.armorial).forEach(function (k) {
      var max = EXP.ARMORIAL[k] ? EXP.ARMORIAL[k].prix.length : 9;
      if (!nombre(x.armorial[k]) || x.armorial[k] < 0) x.armorial[k] = 0; else x.armorial[k] = Math.min(max, Math.floor(x.armorial[k]));
    });
    x.franchies = x.franchies.filter(function (w, i, t) { return nombre(w) && w >= 1 && Math.floor(w) === w && t.indexOf(w) === i; }).sort(function (a, b) { return a - b; });
    if (typeof x.sermentsOuverts !== "boolean") x.sermentsOuverts = false;
    Object.keys(v.serments).forEach(function (k) { if (typeof x.serments[k] !== "boolean") x.serments[k] = false; });
    x.titres = x.titres.filter(function (t) { return typeof t === "string"; });
    Object.keys(x.records).forEach(function (k) { if (!objet(x.records[k])) delete x.records[k]; });
    Object.keys(x.reponsesParFamille).forEach(function (k) { if (!nombre(x.reponsesParFamille[k])) delete x.reponsesParFamille[k]; });
    x.historique = x.historique.filter(function (h) { return objet(h) && typeof h.issue === "string"; }).slice(0, EXP.HISTORIQUE_MAX);
    if (x.enCours !== null) completerEnCours(x);
    return x;
  }
  function completerEnCours(x) {
    var e = x.enCours, cfg = reglages();
    if (!objet(e) || !routeLisible(e.route) || !nombre(e.semaine) || !nombre(e.depart)) { clore(x, "retour", true); return; }
    var actes = e.route.actes;
    if (!actes.some(function (a) { return a.semaine === e.semaine; })) e.semaine = actes[0].semaine;
    if (!nombre(e.graine)) e.graine = 0;
    if (!JEU.campagne || !JEU.campagne.front(e.front)) e.front = "angleterre";
    if (!Array.isArray(e.semaines)) e.semaines = actes.map(function (a) { return a.semaine; });
    if (!nombre(e.ardeur)) e.ardeur = 0;
    if (!nombre(e.difficulte)) e.difficulte = cfg.difficulte;
    if ([1, 2, 3].indexOf(e.vitesse) < 0) e.vitesse = cfg.vitesse;
    if (!nombre(e.vivresMax) || e.vivresMax < 1) e.vivresMax = Math.max(cfg.vivres, nombre(e.vivres) ? e.vivres : 0);
    e.vivresMax = borne(Math.floor(e.vivresMax), 1, VIVRES_MAX);
    if (!nombre(e.vivres)) e.vivres = Math.min(cfg.vivres, e.vivresMax);
    e.vivres = borne(Math.floor(e.vivres), 0, e.vivresMax);
    ["or", "plan"].forEach(function (k) { if (!nombre(e[k]) || e[k] < 0) e[k] = 0; else e[k] = Math.floor(e[k]); });
    e.espion = e.espion === true;
    e.monture = e.monture === true;
    if (!Array.isArray(e.faveurs)) e.faveurs = [];
    var vues = {};
    e.faveurs = e.faveurs.filter(function (f) {
      var ok = objet(f) && EXP.FAVEURS[f.id] && nombre(f.rang) && f.rang >= 1 && !vues[f.id];
      if (ok) { vues[f.id] = true; f.rang = Math.min(EXP.RANG_MAX, Math.floor(f.rang)); }
      return ok;
    });
    if (!objet(e.places)) e.places = {};
    Object.keys(e.places).forEach(function (k) { if (!nombre(e.places[k]) || e.places[k] < 1) delete e.places[k]; });
    if (!objet(e.faits)) e.faits = {};
    Object.keys(e.faits).forEach(function (k) { if (typeof e.faits[k] !== "string") delete e.faits[k]; });
    if (!objet(e.etal)) e.etal = {};
    if (e.offre !== null && !(objet(e.offre) && Array.isArray(e.offre.cartes) && e.offre.cartes.length && e.offre.cartes.every(function (c) { return objet(c) && EXP.FAVEURS[c.id]; }))) e.offre = null;
    if (e.entamee !== null && typeof e.entamee !== "string") e.entamee = null;
    var cv = compteVide();
    if (!objet(e.compte)) e.compte = cv;
    Object.keys(cv).forEach(function (k) {
      if (typeof cv[k] === "number") { if (!nombre(e.compte[k])) e.compte[k] = 0; }
      else if (Array.isArray(cv[k])) { if (!Array.isArray(e.compte[k])) e.compte[k] = []; }
      else if (!objet(e.compte[k])) e.compte[k] = {};
    });
    // position : une halte de la semaine en cours (ou son gardien) ; sinon le départ de la semaine
    if (e.position !== null && !(typeof e.position === "string" && trouverHalte(e.position, e) && trouverHalte(e.position, e).acte.semaine === e.semaine)) e.position = null;
    if (e.entamee && !trouverHalte(e.entamee, e)) e.entamee = null;
  }

  function etat() {
    var s = JEU.sauvegarde.etat();
    s.expedition = completer(s.expedition);
    return s.expedition;
  }
  function enCours() { return etat().enCours; }
  function sauver() { JEU.sauvegarde.enregistrer(); }
  function noterChronique(texte) { if (JEU.campagne && JEU.campagne.noter && JEU.sauvegarde.etat()) JEU.campagne.noter(texte); }
  function acteCourant(e) {
    e = e || enCours();
    if (!e) return null;
    return e.route.actes.filter(function (a) { return a.semaine === e.semaine; })[0] || null;
  }
  function indexActe(e, semaine) { for (var i = 0; i < e.route.actes.length; i++) if (e.route.actes[i].semaine === semaine) return i; return -1; }
  // { halte, acte } pour un identifiant de halte ou de gardien, ou null.
  function trouverHalte(id, e) {
    e = e || enCours();
    if (!e || !id) return null;
    for (var a = 0; a < e.route.actes.length; a++) {
      var acte = e.route.actes[a];
      if (acte.gardien && acte.gardien.id === id) return { halte: acte.gardien, acte: acte };
      for (var k = 0; k < acte.couches.length; k++) for (var i = 0; i < acte.couches[k].length; i++) if (acte.couches[k][i].id === id) return { halte: acte.couches[k][i], acte: acte };
    }
    return null;
  }
  function rang(id, e) {
    e = e || enCours();
    if (!e) return 0;
    for (var i = 0; i < e.faveurs.length; i++) if (e.faveurs[i].id === id) return e.faveurs[i].rang;
    return 0;
  }
  function valeurFaveur(id, r) { return r > 0 ? EXP.FAVEURS[id].valeurs[Math.min(r, EXP.RANG_MAX) - 1] : 0; }
  function ligneSemaine(s) {
    for (var i = 0; i < EXP.LIGNE_SEMAINE.length; i++) if (s <= EXP.LIGNE_SEMAINE[i][0]) return EXP.LIGNE_SEMAINE[i][1];
    return 4;
  }

  // ---------- renommée (10.1) ----------
  // Barème d'une source : reponse, halte (4 + S), cede, parchemin / parchemin-eclatante, gardien (15 + 3S), grand (30 + 5S), complete.
  function renom(source, semaine) {
    var R = EXP.RENOM, S = semaine || 0;
    switch (source) {
      case "reponse": return R.reponse;
      case "halte": return R.halte + S;
      case "cede": return R.cede;
      case "parchemin": return R.parchemin[0];
      case "parchemin-eclatante": return R.parchemin[1];
      case "gardien": return R.gardien[0] + R.gardien[1] * S;
      case "grand": return R.grand[0] + R.grand[1] * S;
      case "complete": return R.complete;
      default: return 0;
    }
  }
  // Crédite tout de suite (disponible, total, compte de l'expédition) : rien n'est jamais repris.
  function crediter(x, e, n, haltes) {
    n = Math.max(0, Math.floor(n));
    if (!n) return 0;
    x.renom += n; x.renomTotal += n;
    if (e) { e.compte.renom += n; if (haltes) e.compte.renomHaltes += n; }
    return n;
  }

  // ---------- départ ----------
  function famillesChargees() { return famillesDeCandidats(JEU.recit.candidats()); }
  function famillesARevoir() {
    var Q = JEU.questions, vues = {}, res = [];
    (JEU.progression.fichesARevoir() || []).forEach(function (fid) {
      var fi = Q.fiche ? Q.fiche(fid) : null, cours = fi && fi.cours;
      if (!cours) { var m = /^(.*)-f\d+$/.exec(fid); cours = m ? m[1] : null; }
      var mat = cours ? U.matiereDe(cours) : (/^anglais-/.test(fid) ? "anglais" : null);
      var f = mat ? JEU.recit.famille(mat) : null;
      if (f && !vues[f]) { vues[f] = true; res.push(f); }
    });
    return res;
  }
  function nomFront(front) { return TEXTES.fronts[front] || "l'ouest"; }
  // Lance une expédition depuis un relais ouvert, vers un front. Renvoie l'expédition en cours, ou null (déjà une expédition
  // en cours, aucun cours chargé, relais fermé).
  function commencer(depart, front) {
    var x = etat();
    if (x.enCours) return null;
    var f = frontiere();
    if (!f) return null;
    var cfg = reglages(), ouverts = relais();
    if (depart == null) depart = relaisDefaut();
    if (ouverts.indexOf(depart) < 0) return null;
    if (!JEU.campagne.front(front)) front = JEU.campagne.FRONTS[0].id;
    var semaines = semainesDepuis(depart, cfg.semaines);
    if (!semaines.length) return null;
    var sautees = [];
    for (var s = depart; s <= semaines[semaines.length - 1]; s++) if (semaines.indexOf(s) < 0) sautees.push(s);
    var fenetres = {};
    semaines.forEach(function (w) { fenetres[w] = fenetre(w); });
    var graine = (Date.now() ^ (JEU.questions.posees().horloge * 2654435761)) >>> 0;
    var pp = JEU.campagne.prochaineProvince(front);
    var p = { depart: depart, semaines: semaines, frontiere: f, front: front, fenetres: fenetres, famillesChargees: famillesChargees(), famillesARevoir: famillesARevoir(),
      carteGrand: pp ? pp.province.carte : "chateau", sautees: sautees, config: cfg };
    var route = generer(graine, p);
    var arm = x.armorial;
    var vivresMax = Math.min(VIVRES_MAX, cfg.vivres + arm.vivres);
    x.enCours = {
      graine: graine, front: front, depart: depart, semaines: semaines, ardeur: 0, difficulte: cfg.difficulte, vitesse: cfg.vitesse,
      route: route, position: null, semaine: semaines[0], faits: {}, entamee: null,
      vivres: Math.min(vivresMax, cfg.vivres + arm.vivres), vivresMax: vivresMax, or: 0, plan: 0, espion: false, monture: arm.monture > 0,
      faveurs: [], places: {}, offre: null, etal: {}, compte: compteVide()
    };
    if (arm.ouverture > 0) offrirOuverture(x.enCours);
    var A = semaines[0], B = semaines[semaines.length - 1];
    noterChronique(remplir(semaines.length > 1 ? TEXTES.chronique.depart : TEXTES.chronique.departUne, { F: nomFront(front), A: A, B: B }));
    sauver();
    return x.enCours;
  }
  // La phrase du souverain à l'écran de départ, pour un relais donné (texte de jeu ; le nom vient de la campagne).
  function phraseDepart(depart) {
    var cfg = reglages(), semaines = semainesDepuis(depart, cfg.semaines);
    if (!semaines.length) return TEXTES.depart.attente;
    var chef = JEU.campagne.souverain ? JEU.campagne.souverain() : null;
    var v = { souverain: chef ? chef.nom : "Le royaume", A: semaines[0], B: semaines[semaines.length - 1] };
    if (semaines.length === 1) return remplir(TEXTES.depart.uneSemaine, v);
    return remplir(chef ? TEXTES.depart.souverain : TEXTES.depart.sansSouverain, v);
  }

  // ---------- la route : haltes atteignables, entrée ----------
  function atteignables() {
    var e = enCours(), acte = acteCourant(e);
    if (!e || !acte) return [];
    if (e.position === null) return acte.couches[0].slice();
    var t = trouverHalte(e.position, e);
    if (!t || t.acte !== acte) return acte.couches[0].slice();
    var h = t.halte;
    if (h === acte.gardien) return e.faits[h.id] === "reussi" || e.faits[h.id] === "eclatante" ? [] : [h];
    if (!e.faits[h.id]) return [h]; // entrée mais pas jouée (jeu fermé en route) : on la rejoue
    return h.suivants.map(function (id) { var x = trouverHalte(id, e); return x && x.halte; }).filter(Boolean);
  }
  // Entre dans une halte atteignable : renvoie { halte, acte } (ou null).
  function entrer(id) {
    var e = enCours();
    if (!e) return null;
    var ok = atteignables().some(function (h) { return h.id === id; });
    if (!ok) return null;
    e.position = id;
    sauver();
    return trouverHalte(id, e);
  }
  // Nombre de haltes jouées dans la semaine en cours (pour « 2e halte »), gardien compris.
  function haltesJouees(e) {
    var acte = acteCourant(e), n = 0;
    if (!acte) return 0;
    plat(acte.couches).forEach(function (h) { if (e.faits[h.id]) n++; });
    return n;
  }

  // ---------- tirage des questions (6.1) ----------
  function typeDe(halte) { return typeof halte === "string" ? halte : (halte && halte.type) || "evenement"; }
  function quotaARevoir(n) {
    var fiches = JEU.progression.fichesARevoir();
    if (!fiches.length) return null;
    return { nombre: n, filtre: function (q) { return fiches.indexOf(q.fiche) >= 0; } };
  }
  // Le quota d'un tirage : { nombre, filtre } (option quota de JEU.recit.suite) ou null.
  // halte : une halte de la route (type escarmouche, embuscade, gardien, grand, evenement), ou un descripteur
  // { type: "porte" | "marchand", famille } (question d'un conseiller : quota sur sa famille), { type: "archives" }
  // (semaines d'avant le relais ; depuis S1, les notions à revoir), { type: "veillee" } (notions à revoir).
  function quotaPour(halte, n, acte, e) {
    var type = typeDe(halte);
    if (halte && halte.ev === "archives") type = "archives";
    if (type === "porte" || type === "marchand") {
      var fam = halte.famille || (type === "marchand" ? "physique" : null);
      if (!fam) return null;
      return { nombre: n, filtre: function (q) { return JEU.recit.famille(q.matiere) === fam; } };
    }
    if (type === "archives") {
      var dep = e.depart;
      if (dep > 1) return { nombre: n, filtre: function (q) { var s = semaineDe(q.cours); return s != null && s < dep; } };
      return quotaARevoir(n);
    }
    if (type === "veillee") return quotaARevoir(n);
    if (!acte || !acte.quota || !acte.semaines.length) return null;
    var nombreQ = Math.min(n, Math.round(n * acte.quota / 3));
    if (!nombreQ) return null;
    var sem = acte.semaines;
    return { nombre: nombreQ, filtre: function (q) { return sem.indexOf(semaineDe(q.cours)) >= 0; } };
  }
  // n questions pour une halte, par le seul tirage du jeu (JEU.recit.suite) : exclusions de la partie (posees : questions déjà
  // posées dans cette halte), quota de l'acte, niveaux de bataille pour les batailles de route (1 à 3), 1 et 2 ailleurs.
  function tirage(n, posees, halte) {
    var e = enCours(), acte = acteCourant(e);
    posees = posees || [];
    var ids = posees.map(function (q) { return q.id; }), fiches = posees.map(function (q) { return q.fiche; });
    var options = { exclure: ids, filtre: function (q) { return fiches.indexOf(q.fiche) < 0; }, completer: true };
    var quota = e ? quotaPour(halte, n, acte, e) : null;
    if (quota) options.quota = quota;
    var f = function () { return JEU.recit.suite(n, options); };
    var Q = JEU.questions;
    return EXP.BATAILLES.indexOf(typeDe(halte)) >= 0 && Q.avecNiveaux ? Q.avecNiveaux(Q.NIVEAUX_BATAILLE, f) : f();
  }
  // Après chaque réponse sur la route (en plus de JEU.questions.enregistrerReponse, que l'écran appelle comme partout) :
  // +1 renommée par bonne réponse, compte par famille, matière et semaine, fiches ratées pour « À relire ».
  // Une erreur ne retire jamais rien : ni vivre, ni or de route, ni renommée.
  function noterReponse(q, juste) {
    var x = etat(), e = x.enCours;
    if (!e || !q) return null;
    var c = e.compte, fam = JEU.recit.famille(q.matiere), mat = q.matiere || "autre", s = semaineDe(q.cours);
    c.questions++;
    if (juste) { c.bonnes++; c.serie++; if (c.serie > c.meilleureSerie) c.meilleureSerie = c.serie; crediter(x, e, renom("reponse")); }
    else { c.serie = 0; if (q.fiche && c.fiches.indexOf(q.fiche) < 0) c.fiches.push(q.fiche); }
    [[c.parFamille, fam || "autre"], [c.parMatiere, mat], [c.parSemaine, s == null ? "autres" : String(s)]].forEach(function (p) {
      var o = p[0][p[1]] || (p[0][p[1]] = { posees: 0, bonnes: 0 });
      o.posees++; if (juste) o.bonnes++;
    });
    sauver();
    return c;
  }

  // ---------- batailles de route : options du moteur (15.2) et issue (apresBataille) ----------
  // Tout par des options que M.creer lit déjà, à partir de JEU.campagne.options(niveau) : moins les mercenaires de
  // l'événement du jour (c.bonus.or, qui restent à la campagne), jamais c.bonus.espion ; plus la ligne de la semaine, le
  // mode, les vagues, la solidité du camp de route, les faveurs et l'Armorial, avec leurs plafonds. Sans effet de bord :
  // le plan et l'espion de route sont consommés par apresBataille.
  function niveauDe(halte, acte, cfg) {
    var def = EXP.HALTES[typeDe(halte)] || EXP.HALTES.escarmouche;
    return borne(ligneSemaine(acte ? acte.semaine : 1) + def.ligne + (cfg || reglages()).difficulte, 0, 4);
  }
  function optionsBataille(halte) {
    var x = etat(), e = x.enCours, C = JEU.campagne, c = C.etat(), arm = x.armorial, cfg = reglages(), acte = acteCourant(e);
    var type = typeDe(halte), def = EXP.HALTES[type] || EXP.HALTES.escarmouche;
    var o = C.options(niveauDe(halte, acte, cfg));
    o.orDepart -= (c.bonus.or || 0);
    o.vagues = (halte && halte.vagues) || def.vagues;
    o.defense = def.mode === "defense";
    var place = (halte && halte.place) || def.place;
    o.pvRival = (e && halte && e.places[halte.id]) || place;
    o.pvRivalMax = place;
    var orPerdu = JEU.donnees.config && typeof JEU.donnees.config.orPerduErreur === "number" ? JEU.donnees.config.orPerduErreur : 6;
    o.orDepart = Math.min(EXP.PLAFONDS.orDepart, o.orDepart + 10 * arm.bourse + valeurFaveur("lettres", rang("lettres", e)) + (e ? e.plan : 0));
    o.pvChateau = Math.min(EXP.PLAFONDS.pvChateau, o.pvChateau + 2 * arm.murs);
    o.bonusDegats = Math.min(EXP.PLAFONDS.bonusDegats, o.bonusDegats + valeurFaveur("engrenages", rang("engrenages", e)));
    o.orParReponse = Math.min(EXP.PLAFONDS.orParReponse, o.orParReponse + valeurFaveur("annales", rang("annales", e)));
    o.orPerduErreur = Math.max(0, orPerdu - valeurFaveur("ballade", rang("ballade", e)));
    o.espion = !!(e && e.espion) || rang("eclaireurs", e) > 0; // l'espion de route ou les Éclaireurs, jamais c.bonus.espion
    return o;
  }
  function perdreVivre(e) { e.vivres = Math.max(0, e.vivres - 1); return e.vivres; }
  // +1 vivre jusqu'au maximum ; au maximum, de l'or de route à la place. Renvoie { vivre: 1 } ou { or: n }.
  function gagnerVivre(e, orSiPlein) {
    if (e.vivres < e.vivresMax) { e.vivres++; return { vivre: 1 }; }
    e.or += orSiPlein; return { or: orSiPlein };
  }
  function nomPorte(porte) {
    if (!porte) return "";
    if (porte.genre === "faveur") {
      var cons = JEU.recit.CONSEILLERS[MATIERE_FAMILLE[porte.conseiller] || "histoire"], nom = cons.nom;
      // « du ménestrel », « de la cartographe », « de l'herboriste » : l'article se contracte ou s'élide (JEU.campagne.avecArticle)
      var C = JEU.campagne && JEU.campagne.avecArticle ? JEU.campagne.avecArticle(nom, "de") : "de " + nom.charAt(0).toLowerCase() + nom.slice(1);
      return remplir(TEXTES.portes.faveur, { C: C }) + (porte.rare ? " (rare)" : "");
    }
    return TEXTES.portes[porte.genre] || "";
  }
  // Applique la porte simple d'une bataille (bourse, parchemin, vivres) ; une porte de faveur est rendue à l'écran, qui pose
  // la question du conseiller puis appelle offrirFaveurs.
  function appliquerPorte(x, e, porte, eclatante, res) {
    if (!porte) return;
    var G = EXP.GAINS_PORTE, i = eclatante ? 1 : 0;
    if (porte.genre === "bourse") { e.or += G.bourse[i]; res.or += G.bourse[i]; }
    else if (porte.genre === "parchemin") res.renom += crediter(x, e, renom(eclatante ? "parchemin-eclatante" : "parchemin"));
    else if (porte.genre === "vivres") {
      var g = gagnerVivre(e, G.vivresPlein);
      if (g.or) res.or += g.or; else res.vivre = (res.vivre || 0) + 1;
      if (eclatante) { e.or += G.vivresEclatante; res.or += G.vivresEclatante; }
    } else if (porte.genre === "faveur") res.porte = { genre: "faveur", conseiller: porte.conseiller, rare: !!porte.rare, eclatante: eclatante, halte: res.halte };
    res.nomPorte = nomPorte(porte);
  }
  // Issue d'une bataille de route. bilan : { issue: "victoire" | "tenu" | "retraite", degatsRival, bonnes, total, entamee }.
  // Quittée avant la première vague (entamee: false) : rien ne change, la halte reste à jouer.
  // Renvoie un résumé pour l'écran : { issue, cede, eclatante, vivres, vivrePerdu, or, renom, porte (faveur à jouer) | null,
  // nomPorte, franchie (semaine) | null, suivante (semaine) | null, fini (bilan de fin) | null }.
  function apresBataille(halte, bilan) {
    var x = etat(), e = x.enCours;
    if (!e || !halte) return null;
    var t = trouverHalte(halte.id, e), acte = t ? t.acte : acteCourant(e);
    halte = t ? t.halte : halte;
    var type = typeDe(halte), def = EXP.HALTES[type] || EXP.HALTES.escarmouche, S = acte ? acte.semaine : e.semaine;
    if (bilan && bilan.entamee === false) { e.entamee = null; sauver(); return { issue: "rien", halte: halte.id, vivres: e.vivres, or: 0, renom: 0, porte: null, franchie: null, suivante: null, fini: null }; }
    var cede = !bilan || bilan.issue === "retraite", eclatante = !!bilan && bilan.issue === "victoire";
    var res = { issue: bilan ? bilan.issue : "retraite", halte: halte.id, type: type, cede: cede, eclatante: eclatante, or: 0, renom: 0, porte: null, nomPorte: "", franchie: null, suivante: null, fini: null, vivrePerdu: false };
    e.entamee = null;
    e.plan = 0; e.espion = false; // consommés par cette bataille (le plan d'un événement de route, l'espion de route)
    var degats = bilan && nombre(bilan.degatsRival) ? Math.max(0, Math.floor(bilan.degatsRival)) : 0;
    if (type === "gardien" || type === "grand") {
      if (cede) {
        var reste = (e.places[halte.id] || halte.place || def.place) - degats;
        e.places[halte.id] = Math.max(1, reste); // les coups portés restent entre deux tentatives
        perdreVivre(e); res.vivrePerdu = true;
        res.renom += crediter(x, e, renom("cede"));
      } else {
        e.faits[halte.id] = eclatante ? "eclatante" : "reussi";
        delete e.places[halte.id];
        e.or += def.or[eclatante ? 1 : 0]; res.or += def.or[eclatante ? 1 : 0];
        res.renom += crediter(x, e, renom(type, S), true);
        if (x.franchies.indexOf(S) < 0) { x.franchies.push(S); x.franchies.sort(function (a, b) { return a - b; }); res.franchie = S; noterChronique(remplir(TEXTES.chronique.franchie, { S: S })); }
        if (JEU.campagne.monterRivalite && type === "gardien") JEU.campagne.monterRivalite(e.front, EXP.VICTOIRE.rivaliteGardien);
        if (type === "gardien") {
          appliquerPorte(x, e, halte.porte, eclatante, res); // la faveur rare du gardien : l'écran pose la question puis offre
          var i = indexActe(e, S);
          var suivant = e.route.actes[i + 1];
          if (suivant) { e.semaine = suivant.semaine; e.position = null; res.suivante = suivant.semaine; }
          else res.fini = finir("victoire");
        } else res.fini = finir("victoire"); // Grand Gardien : l'expédition est accomplie, les faveurs sont rendues
      }
    } else {
      e.faits[halte.id] = cede ? "echoue" : (eclatante ? "eclatante" : "reussi");
      if (cede) { perdreVivre(e); res.vivrePerdu = true; res.renom += crediter(x, e, renom("cede")); }
      else { e.or += def.or[eclatante ? 1 : 0]; res.or += def.or[eclatante ? 1 : 0]; res.renom += crediter(x, e, renom("halte", S), true); }
      appliquerPorte(x, e, halte.porte, eclatante && !cede, res); // porte simple quand même si les murs ont cédé
    }
    res.vivres = e.vivres;
    if (!res.fini && e.vivres <= 0) res.fini = finir("retour");
    sauver();
    return res;
  }
  // La première vague d'une bataille de route est lancée : fermer le jeu ou quitter compte alors comme une retraite.
  function marquerEntamee(id) { var e = enCours(); if (!e) return; e.entamee = id || e.position; sauver(); }
  // L'élève quitte une bataille de route (bouton Quitter) : après la première vague, −1 vivre, la halte reste à rejouer ;
  // avant, rien. Renvoie { vivrePerdu, vivres, fini }.
  function quitter(entamee) {
    var x = etat(), e = x.enCours;
    if (!e) return null;
    var res = { vivrePerdu: false, vivres: e.vivres, fini: null };
    if (entamee) { perdreVivre(e); res.vivrePerdu = true; res.vivres = e.vivres; if (e.vivres <= 0) res.fini = finir("retour"); }
    e.entamee = null;
    sauver();
    return res;
  }
  // À la reprise de la route (ouverture de l'écran) : une bataille entamée et sans bilan (jeu fermé en route) coûte un vivre.
  function reprendre() {
    var e = enCours();
    if (!e) return null;
    if (e.vivres <= 0) return { vivrePerdu: false, vivres: 0, fini: finir("retour") }; // sauvegarde arrêtée entre la perte et le bilan
    if (!e.entamee) return { vivrePerdu: false, vivres: e.vivres, fini: null };
    return quitter(true);
  }

  // ---------- les faveurs (8.5) ----------
  function faveursDisponibles(e) {
    return faveursPossibles(famillesChargees()).filter(function (id) { return rang(id, e) < EXP.RANG_MAX; });
  }
  function texteFaveur(id, r) {
    var F = EXP.FAVEURS[id];
    if (!F) return "";
    r = Math.max(1, Math.min(EXP.RANG_MAX, r || 1));
    var v = F.valeurs[r - 1], base = JEU.donnees.config && typeof JEU.donnees.config.orPerduErreur === "number" ? JEU.donnees.config.orPerduErreur : 6;
    var V = id === "engrenages" ? Math.round(v * 100) : id === "ballade" ? Math.max(0, base - v) : v;
    return remplir(TEXTES.faveurs[id][r - 1], { V: V, B: base });
  }
  function carteFaveur(e, id, rangForce) {
    var tenu = rang(id, e), r = Math.min(EXP.RANG_MAX, Math.max(tenu + 1, rangForce || 0));
    var F = EXP.FAVEURS[id], cons = JEU.recit.CONSEILLERS[MATIERE_FAMILLE[F.famille] || "histoire"];
    return { id: id, rang: r, affine: tenu > 0, nom: F.nom, famille: F.famille, conseiller: cons.nom, icone: cons.icone, rangNom: TEXTES.rangs[r - 1], texte: texteFaveur(id, r) };
  }
  // Familles de la moins jouée à la plus jouée depuis le début de l'expédition (à égalité, la moins réussie), sans « sauf ».
  function famillesMoinsJouees(e, sauf) {
    var c = e.compte.parFamille;
    return famillesChargees().filter(function (f) { return f !== sauf; }).sort(function (a, b) {
      var pa = c[a] || { posees: 0, bonnes: 0 }, pb = c[b] || { posees: 0, bonnes: 0 };
      return (pa.posees - pb.posees) || (pa.bonnes - pb.bonnes) || (a < b ? -1 : 1);
    });
  }
  // Après la question d'une porte de faveur : les cartes au choix. conseiller : la famille de la porte (ou la porte rendue
  // par apresBataille, qui porte sa rareté et sa halte) ; juste : la réponse
  // (3 cartes, sinon 2) ; eclatante : une carte de plus. options.rare force ou retire la rareté (sinon celle de la porte).
  // La 1re carte est la faveur du conseiller de la porte (rare : au rang rare directement) ; la dernière vient de la famille
  // la moins jouée de l'expédition, jamais celle de la porte. Enregistré dans enCours.offre : la reprise retrouve la même
  // offre. Aucune faveur disponible : +25 or de route et cartes vides.
  function offrirFaveurs(conseiller, juste, eclatante, options) {
    var x = etat(), e = x.enCours;
    if (!e) return null;
    options = options || {};
    if (objet(conseiller)) { // la porte rendue par apresBataille : { conseiller, rare, halte }
      options = { rare: typeof conseiller.rare === "boolean" ? conseiller.rare : options.rare, halte: conseiller.halte || options.halte };
      conseiller = conseiller.conseiller;
    }
    var halteId = options.halte || e.position || "porte";
    var t = trouverHalte(halteId, e);
    var rare = typeof options.rare === "boolean" ? options.rare : !!(t && t.halte.porte && t.halte.porte.rare);
    var r = alea(hash(e.graine, "faveurs", halteId));
    var dispo = faveursDisponibles(e), cartes = [], pris = {};
    function ajouter(id, rangForce) { if (id && !pris[id]) { pris[id] = true; cartes.push(carteFaveur(e, id, rangForce)); } }
    var duCons = dispo.filter(function (id) { return EXP.FAVEURS[id].famille === conseiller; });
    ajouter(duCons[0], rare ? EXP.RANG_MAX : 0);
    var ordre = famillesMoinsJouees(e, conseiller), troisieme = null;
    for (var i = 0; i < ordre.length && !troisieme; i++) troisieme = dispo.filter(function (id) { return EXP.FAVEURS[id].famille === ordre[i] && !pris[id]; })[0] || null;
    var voulu = (juste ? 3 : 2) + (eclatante ? 1 : 0);
    if (juste) {
      // les cartes du milieu : les familles suivantes de la moins jouée (à défaut, ce qui reste), la 3e carte en dernier
      var reste = alea.melanger(r, dispo.filter(function (id) { return !pris[id] && id !== troisieme; }));
      reste.sort(function (a, b) { return ordre.indexOf(EXP.FAVEURS[a].famille) - ordre.indexOf(EXP.FAVEURS[b].famille); });
      while (cartes.length < voulu - 1 && reste.length) ajouter(reste.shift(), 0);
    }
    ajouter(troisieme, 0);
    if (!juste && eclatante) { var r2 = dispo.filter(function (id) { return !pris[id]; }); ajouter(r2[0], 0); }
    if (!cartes.length) { e.or += EXP.OR_ROUTE.veilleeSansFaveur; e.offre = null; sauver(); return { halte: halteId, conseiller: conseiller, cartes: [], or: EXP.OR_ROUTE.veilleeSansFaveur }; }
    e.offre = { halte: halteId, conseiller: conseiller, cartes: cartes };
    sauver();
    return e.offre;
  }
  // La Faveur d'ouverture de l'Armorial : une commune au choix parmi trois, au départ (offre en attente avant la première halte).
  function offrirOuverture(e) {
    var r = alea(hash(e.graine, "ouverture"));
    var cartes = alea.melanger(r, faveursDisponibles(e)).slice(0, 3).map(function (id) { return carteFaveur(e, id, 0); });
    if (cartes.length) e.offre = { halte: "depart", conseiller: null, cartes: cartes };
  }
  function appliquerFaveur(e, id, r) {
    var f = null;
    for (var i = 0; i < e.faveurs.length; i++) if (e.faveurs[i].id === id) f = e.faveurs[i];
    var avant = f ? f.rang : 0;
    r = Math.min(EXP.RANG_MAX, Math.max(r, avant + 1));
    if (f) f.rang = r; else { f = { id: id, rang: r }; e.faveurs.push(f); }
    if (id === "simples") {
      if (avant === 0) gagnerVivre(e, EXP.OR_ROUTE.bivouacPlein);
      if (r >= 2 && avant < 2 && e.vivresMax < VIVRES_MAX) e.vivresMax++;
    }
    return f;
  }
  // Prend une carte de l'offre en attente. Renvoie la faveur tenue { id, rang } ou null.
  function prendreFaveur(id) {
    var e = enCours();
    if (!e || !e.offre) return null;
    var carte = e.offre.cartes.filter(function (c) { return c.id === id; })[0];
    if (!carte) return null;
    var f = appliquerFaveur(e, id, carte.rang);
    e.offre = null;
    sauver();
    return f;
  }
  // Affine d'un rang une faveur tenue (veillée sans faute). Renvoie la faveur ou null.
  function affiner(id) {
    var e = enCours();
    if (!e || rang(id, e) < 1 || rang(id, e) >= EXP.RANG_MAX) return null;
    var f = appliquerFaveur(e, id, rang(id, e) + 1);
    sauver();
    return f;
  }
  function faveursTenues() {
    var e = enCours();
    return e ? e.faveurs.map(function (f) { return carteFaveur(e, f.id, f.rang); }).map(function (c) { c.rang = rang(c.id, e); c.rangNom = TEXTES.rangs[c.rang - 1]; c.texte = texteFaveur(c.id, c.rang); return c; }) : [];
  }

  // ---------- haltes sans bataille : fin de halte, événements de route, bivouac, marchand ----------
  // Clôt une halte jouée (événement, marchand, bivouac) : sceau sur la route, renommée de halte (×2 pour les archives).
  function terminerHalte(id, options) {
    var x = etat(), e = x.enCours;
    if (!e) return null;
    var t = trouverHalte(id || e.position, e);
    if (!t || e.faits[t.halte.id]) return { renom: 0 };
    e.faits[t.halte.id] = "fait";
    var n = renom("halte", t.acte.semaine) * ((options && options.double) || t.halte.ev === "archives" ? 2 : 1);
    var res = { renom: crediter(x, e, n, true), halte: t.halte.id };
    sauver();
    return res;
  }
  // Gain de route d'un événement rejoué sur la route (5.2), appliqué une fois ; renvoie la phrase du bilan.
  // ev : marchands | defi | mercenaires | incendie | espion | archives ; bonnes, total : les réponses de l'événement.
  function cloturerEvenement(halteId, ev, bonnes, total) {
    var x = etat(), e = x.enCours;
    if (!e) return "";
    var t = trouverHalte(halteId || e.position, e);
    if (!t) return "";
    if (e.faits[t.halte.id]) return "";
    var F = TEXTES.evenements.fin, O = EXP.OR_ROUTE, texte = "", acte = t.acte;
    bonnes = bonnes || 0;
    if (ev === "marchands") { if (bonnes) { e.or += O.marchands * bonnes; texte = remplir(F.marchands[0], { O: O.marchands * bonnes }); } else texte = F.marchands[1]; }
    else if (ev === "defi") {
      if (bonnes >= 2) { var g = acte.gardien.id; e.places[g] = Math.max(1, (e.places[g] || acte.gardien.place) - EXP.VICTOIRE.coups); texte = F.defi[0]; }
      else texte = F.defi[1];
    } else if (ev === "mercenaires") { if (bonnes) { e.plan += O.mercenaires; texte = remplir(F.mercenaires[0], { O: O.mercenaires }); } else texte = F.mercenaires[1]; }
    else if (ev === "incendie") {
      if (bonnes >= 2) { var v = gagnerVivre(e, O.incendiePlein); texte = v.or ? remplir(F.incendiePlein, { O: v.or }) : F.incendie[0]; }
      else texte = F.incendie[1];
    } else if (ev === "espion") { if (bonnes) { e.espion = true; texte = F.espion[0]; } else texte = F.espion[1]; }
    else if (ev === "archives") { if (bonnes) { e.or += O.archives * bonnes; texte = remplir(F.archives[0], { O: O.archives * bonnes }); } else texte = F.archives[1]; }
    terminerHalte(t.halte.id, { double: ev === "archives" });
    sauver();
    return texte;
  }
  // Le bivouac : « repos » (+1 vivre, au maximum +25 or de route) ou « veillee » (3 questions, voir finirVeillee).
  function bivouac(choix) {
    var e = enCours();
    if (!e) return null;
    var halte = trouverHalte(e.position, e);
    if (choix === "veillee") { sauver(); return { choix: "veillee", questions: EXP.QUESTIONS.bivouac }; }
    var g = gagnerVivre(e, EXP.OR_ROUTE.bivouacPlein);
    var res = { choix: "repos", vivre: g.vivre || 0, or: g.or || 0, texte: g.or ? remplir(TEXTES.bivouac.reposPlein, { O: g.or }) : TEXTES.bivouac.repos };
    if (halte) res.renom = terminerHalte(halte.halte.id).renom;
    sauver();
    return res;
  }
  // Fin de la veillée : +4 or de route par bonne réponse ; sans faute, une faveur à affiner (liste rendue, l'écran appelle
  // affiner(id)) ou +25 or s'il n'y en a aucune.
  function finirVeillee(bonnes, total) {
    var e = enCours();
    if (!e) return null;
    var halte = trouverHalte(e.position, e);
    var O = EXP.OR_ROUTE, res = { or: O.veillee * (bonnes || 0), affinables: [], texte: "" };
    e.or += res.or;
    res.texte = remplir(TEXTES.bivouac.veillee, { O: res.or });
    if (bonnes >= (total || EXP.QUESTIONS.bivouac) && bonnes > 0) {
      res.affinables = e.faveurs.filter(function (f) { return f.rang < EXP.RANG_MAX; }).map(function (f) { return carteFaveur(e, f.id, f.rang + 1); });
      if (res.affinables.length) res.texte += " " + TEXTES.bivouac.veilleeParfaite;
      else { e.or += O.veilleeSansFaveur; res.or += O.veilleeSansFaveur; res.texte = remplir(TEXTES.bivouac.veilleeParfaiteSansFaveur, { O: O.veilleeSansFaveur }); }
    }
    if (halte) res.renom = terminerHalte(halte.halte.id).renom;
    sauver();
    return res;
  }
  // Le marchand : la question du maître d'œuvre ouvre l'étal (juste : −20 %). Renvoie l'étal { halte, remise, lignes: [{ ligne, prix, texte, dispo }] }.
  function prixLigne(e, et, ligne) {
    var base = EXP.MARCHAND.prix[ligne.split(":")[0]] || 0;
    return Math.round(base * (et.remise ? 1 - EXP.MARCHAND.remise : 1));
  }
  function vueEtal(e, halteId) {
    var et = e.etal[halteId];
    if (!et) return null;
    return { halte: halteId, remise: et.remise, or: e.or, restant: TEXTES.marchand.restant, lignes: et.lignes.map(function (l) {
      var genre = l.split(":")[0], id = l.split(":")[1], texte;
      if (genre === "faveur") texte = remplir(TEXTES.marchand.faveur, { F: EXP.FAVEURS[id] ? EXP.FAVEURS[id].nom + " (" + texteFaveur(id, rang(id, e) + 1) + ")" : "" });
      else texte = remplir(TEXTES.marchand[genre] || genre, { V: EXP.MARCHAND.planOr });
      var dispo = et.achetes.indexOf(l) < 0 && !(genre === "faveur" && rang(id, e) >= EXP.RANG_MAX) && !(genre === "vivres" && e.vivres >= e.vivresMax) && !(genre === "rafraichir" && et.rafraichi);
      return { ligne: l, genre: genre, prix: prixLigne(e, et, l), texte: texte, dispo: dispo };
    }) };
  }
  function ouvrirEtal(halteId, juste) {
    var e = enCours();
    if (!e) return null;
    var t = trouverHalte(halteId || e.position, e);
    if (!t || t.halte.type !== "marchand") return null;
    var id = t.halte.id;
    if (!e.etal[id]) e.etal[id] = { remise: !!juste, lignes: (t.halte.etal && t.halte.etal.lignes || ["vivres", "plan"]).slice(), rafraichi: false, achetes: [] };
    sauver();
    return vueEtal(e, id);
  }
  // Achète une ligne de l'étal ouvert : "faveur:<id>", "vivres", "plan", "rafraichir". Renvoie l'étal à jour, ou null si refusé.
  function acheter(ligne, halteId) {
    var e = enCours();
    if (!e) return null;
    var id = halteId || e.position, et = e.etal[id];
    if (!et) return null;
    var vue = vueEtal(e, id), l = vue.lignes.filter(function (x) { return x.ligne === ligne; })[0];
    if (!l || !l.dispo || e.or < l.prix) return null;
    e.or -= l.prix;
    var genre = l.genre, fid = ligne.split(":")[1];
    if (genre === "faveur") appliquerFaveur(e, fid, rang(fid, e) + 1);
    else if (genre === "vivres") gagnerVivre(e, 0);
    else if (genre === "plan") e.plan += EXP.MARCHAND.planOr;
    else if (genre === "rafraichir") {
      et.rafraichi = true;
      var r = alea(hash(e.graine, "etal", id)), possibles = faveursDisponibles(e);
      et.lignes = et.lignes.map(function (x) { return /^faveur:/.test(x) && possibles.length ? "faveur:" + alea.choisir(r, possibles) : x; });
      et.achetes = et.achetes.filter(function (x) { return !/^faveur:/.test(x); });
    }
    if (genre !== "vivres") et.achetes.push(ligne);
    sauver();
    return vueEtal(e, id);
  }
  function fermerEtal(halteId) {
    var e = enCours();
    if (!e) return null;
    return terminerHalte(halteId || e.position);
  }

  // ---------- fin d'expédition (9) ----------
  function meilleureMatiere(e) {
    var c = e.compte.parMatiere, meilleure = null, taux = -1;
    Object.keys(c).forEach(function (m) {
      if (!JEU.MATIERES[m] || c[m].posees < 3) return;
      var t = c[m].bonnes / c[m].posees;
      if (t > taux) { taux = t; meilleure = m; }
    });
    return meilleure;
  }
  function meilleuresMatieres(e) {
    var c = e.compte.parMatiere;
    return Object.keys(c).filter(function (m) { return JEU.MATIERES[m] && c[m].posees >= 2; })
      .sort(function (a, b) { return (c[b].bonnes / c[b].posees) - (c[a].bonnes / c[a].posees) || c[b].posees - c[a].posees; })
      .slice(0, 3).map(function (m) { return { matiere: m, nom: JEU.MATIERES[m].nom, bonnes: c[m].bonnes, posees: c[m].posees }; });
  }
  // Clôt l'expédition en cours : issue "victoire" (Grand Gardien vaincu), "retour" (plus de vivres) ou "abandon" (lever le camp).
  // L'or de route restant devient de la renommée (1 pour 5), la Bannière ajoute sa part, le record du relais ne descend
  // jamais, l'historique garde vingt expéditions. Renvoie le bilan.
  function finir(issue) { return clore(etat(), issue || "abandon", false); }
  function clore(x, issue, reparee) {
    var e = x.enCours;
    if (!e) return null;
    var C = JEU.campagne, s = JEU.sauvegarde.etat();
    var lisible = routeLisible(e.route) && objet(e.compte);
    if (!objet(e.compte)) e.compte = compteVide();
    var S = nombre(e.semaine) ? e.semaine : (nombre(e.depart) ? e.depart : 1);
    // halte atteinte : le rang de la dernière halte jouée dans la semaine (le gardien compte pour une de plus)
    var auGardien = lisible && e.position && trouverHalte(e.position, e) && trouverHalte(e.position, e).halte.type !== "evenement" && /g$/.test(e.position);
    var bilan = { issue: issue, renom: 0, orRestant: 0, banniere: 0, atteint: { semaine: S, noeud: e.position || null, halte: lisible ? haltesJouees(e) + (auGardien ? 1 : 0) : 0 }, meilleures: lisible ? meilleuresMatieres(e) : [], aRelire: (e.compte.fiches || []).slice(),
      graine: hex(nombre(e.graine) ? e.graine : 0), semaines: Array.isArray(e.semaines) ? e.semaines.slice() : [], depart: e.depart, front: e.front, ressources: null, textes: {} };
    var gagneAvant = e.compte.renom || 0;
    if (issue === "victoire" && lisible) {
      crediter(x, e, renom("complete"));
      if (x.franchies.indexOf(S) < 0) { x.franchies.push(S); x.franchies.sort(function (a, b) { return a - b; }); }
      var pp = C.prochaineProvince(e.front);
      if (pp) { var pr = C.etat().provinces[pp.province.id]; pr.pv = Math.max(1, pr.pv - EXP.VICTOIRE.coups); }
      if (C.monterRivalite) C.monterRivalite(e.front, EXP.VICTOIRE.rivalite);
      if (typeof C.reagir === "function") C.reagir(e.front, "victoire");
      var mm = meilleureMatiere(e);
      if (mm) { var res = JEU.MATIERES[mm].ressource; s.ressources[res] += EXP.VICTOIRE.ressources; bilan.ressources = { ressource: res, nombre: EXP.VICTOIRE.ressources, matiere: mm }; }
    }
    bilan.orRestant = crediter(x, e, Math.floor((nombre(e.or) ? e.or : 0) / EXP.RENOM.orPour));
    var rb = x.armorial.banniere;
    if (rb > 0) bilan.banniere = crediter(x, e, Math.round((e.compte.renom || 0) * EXP.RENOM.banniere[Math.min(rb, EXP.RENOM.banniere.length) - 1]));
    bilan.renom = e.compte.renom || 0;
    bilan.renomTotal = x.renomTotal; bilan.disponible = x.renom;
    // record du relais (jamais en baisse), historique, bonnes réponses par famille (pour plus tard)
    var cle = String(e.depart), rec = x.records[cle] || { semaine: 0, halte: 0, renom: 0, ardeur: 0 };
    var av = lisible && indexActe(e, S) >= 0 ? indexActe(e, S) : 0, avRec = Array.isArray(e.semaines) ? e.semaines.indexOf(rec.semaine) : -1;
    if (av > avRec || (av === avRec && bilan.atteint.halte > rec.halte)) { rec.semaine = S; rec.halte = bilan.atteint.halte; }
    rec.renom = Math.max(rec.renom || 0, bilan.renom); rec.ardeur = Math.max(rec.ardeur || 0, e.ardeur || 0);
    if (issue === "victoire") rec.accomplie = (rec.accomplie || 0) + 1;
    x.records[cle] = rec;
    Object.keys(e.compte.parFamille || {}).forEach(function (f) { x.reponsesParFamille[f] = (x.reponsesParFamille[f] || 0) + ((e.compte.parFamille[f] || {}).bonnes || 0); });
    x.historique.unshift({ le: U.jour(), graine: nombre(e.graine) ? e.graine : 0, front: e.front, depart: e.depart, semaines: bilan.semaines, atteint: { semaine: S, noeud: bilan.atteint.noeud }, issue: issue, renom: bilan.renom, ardeur: e.ardeur || 0 });
    if (x.historique.length > EXP.HISTORIQUE_MAX) x.historique.length = EXP.HISTORIQUE_MAX;
    var A = bilan.semaines[0] || S, B = bilan.semaines[bilan.semaines.length - 1] || S;
    var v = { S: S, A: A, B: B, R: bilan.renom, H: ordinal(Math.max(1, bilan.atteint.halte)) };
    noterChronique(remplir(reparee ? TEXTES.chronique.reparee : TEXTES.chronique[issue] || TEXTES.chronique.abandon, v));
    bilan.textes = { titre: TEXTES.bilan[issue] || TEXTES.bilan.abandon, chroniqueur: TEXTES.bilan.chroniqueur,
      renom: remplir(TEXTES.bilan.renom, { R: bilan.renom, T: x.renomTotal, D: x.renom }),
      orRestant: bilan.orRestant ? remplir(TEXTES.bilan.orRestant, { R: bilan.orRestant }) : "", graine: remplir(TEXTES.bilan.graine, { G: bilan.graine }) };
    bilan.renomAvantFin = gagneAvant;
    x.enCours = null;
    if (!reparee) sauver();
    return bilan;
  }

  // ---------- l'Armorial (10.2) ----------
  var armorial = {
    // Les quartiers avec leur rang, leur prochain prix (null : complet) et leur effet.
    quartiers: function () {
      var x = etat();
      return Object.keys(EXP.ARMORIAL).map(function (q) {
        var A = EXP.ARMORIAL[q], r = x.armorial[q] || 0, prochain = r < A.prix.length ? A.prix[r] : null;
        var V = q === "vivres" ? r + 1 : q === "bourse" ? 10 * (r + 1) : q === "murs" ? 2 * (r + 1) : q === "banniere" ? Math.round(100 * EXP.RENOM.banniere[Math.min(r, 1)]) : "";
        return { id: q, nom: A.nom, rang: r, rangs: A.prix.length, prix: prochain, texte: remplir(TEXTES.armorial[q], { V: V }), possible: prochain !== null && x.renom >= prochain };
      });
    },
    prix: function (q) { var x = etat(), A = EXP.ARMORIAL[q]; if (!A) return null; var r = x.armorial[q] || 0; return r < A.prix.length ? A.prix[r] : null; },
    // Un achat est définitif : il retire du disponible, jamais du total ; rien ne se perd.
    acheter: function (q) {
      var x = etat(), prix = armorial.prix(q);
      if (prix === null || x.renom < prix) return false;
      x.renom -= prix;
      x.armorial[q]++;
      noterChronique(remplir(TEXTES.chronique.armorial, { Q: EXP.ARMORIAL[q].nom }));
      sauver();
      return true;
    }
  };

  // ---------- durée estimée (12) et résumé pour l'écran ----------
  // Environ 20 questions et 4,4 vagues par semaine (haltes, portes, gardien), le Grand Gardien en ajoute 3 et une vague.
  function dureeEstimee(semaines, vitesse) {
    var n = Array.isArray(semaines) ? semaines.length : (semaines || 1), questions = 20 * n + 3, vagues = 4.4 * n + 1;
    return Math.round((questions * 18 + vagues * 50 / (vitesse || 1) + 120) / 60);
  }
  function resume() {
    var x = etat(), e = x.enCours;
    return { enCours: !!e, semaine: e ? e.semaine : null, halte: e ? haltesJouees(e) + 1 : null, vivres: e ? e.vivres : null, vivresMax: e ? e.vivresMax : null, or: e ? e.or : null,
      renom: x.renom, renomTotal: x.renomTotal, franchies: x.franchies.slice(), frontiere: frontiere(), relais: relais(), relaisDefaut: relaisDefaut(), accomplies: x.historique.filter(function (h) { return h.issue === "victoire"; }).length };
  }
  function vitesse(n) { var e = enCours(); if (e && [1, 2, 3].indexOf(n) >= 0) { e.vitesse = n; sauver(); } return e ? e.vitesse : reglages().vitesse; }

  JEU.expedition = {
    EXP: EXP, TEXTES: TEXTES, DEFAUTS: DEFAUTS, VERSION_ROUTE: VERSION_ROUTE, MATIERE_FAMILLE: MATIERE_FAMILLE,
    alea: alea, hash: hash, reglages: reglages,
    semaineDe: semaineDe, semainesOuvertes: semainesOuvertes, frontiere: frontiere, coursDeSemaine: coursDeSemaine, relais: relais, relaisDefaut: relaisDefaut, semainesDepuis: semainesDepuis,
    fenetre: fenetre, quotaDe: quotaDe, texteFenetre: texteFenetre, ligneSemaine: ligneSemaine,
    generer: generer, verifierActe: verifierActe, controlerActe: controlerActe, acteDeSecours: acteDeSecours, escalier: escalier,
    etatVide: etatVide, completer: completer, etat: etat, enCours: enCours, acteCourant: acteCourant, trouverHalte: trouverHalte,
    commencer: commencer, phraseDepart: phraseDepart, atteignables: atteignables, entrer: entrer, haltesJouees: haltesJouees,
    tirage: tirage, quotaPour: quotaPour, noterReponse: noterReponse,
    optionsBataille: optionsBataille, niveauDe: niveauDe, apresBataille: apresBataille, marquerEntamee: marquerEntamee, quitter: quitter, reprendre: reprendre,
    offrirFaveurs: offrirFaveurs, prendreFaveur: prendreFaveur, affiner: affiner, rang: rang, faveursTenues: faveursTenues, texteFaveur: texteFaveur, nomPorte: nomPorte,
    terminerHalte: terminerHalte, cloturerEvenement: cloturerEvenement, bivouac: bivouac, finirVeillee: finirVeillee, ouvrirEtal: ouvrirEtal, acheter: acheter, fermerEtal: fermerEtal,
    renom: renom, finir: finir, armorial: armorial, dureeEstimee: dureeEstimee, resume: resume, vitesse: vitesse, hex: hex, remplir: remplir
  };
})(typeof window !== "undefined" ? window : globalThis);
