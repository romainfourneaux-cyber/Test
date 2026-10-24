// Simulateur d'équilibre de la bataille (atelier seulement, rien de ce fichier n'entre dans jeu/).
// Il fait jouer le vrai moteur (jeu/js/bataille-moteur.js) sous Node par un joueur scripté : à chaque vague, 3 questions
// du conseil de guerre, chacune juste avec la probabilité p (or gagné ou perdu selon les règles du moteur), puis l'or est
// dépensé en tours, améliorations et troupes (stratégie simple et raisonnable, la même pour tous les essais), et la vague
// est jouée. Pour chaque niveau de province (0 à 4, les deux fronts) et pour la défense du domaine, il affiche :
//  - les issues de la première bataille (victoire, tenu, retraite) et les coups moyens portés à la place forte adverse ;
//  - le nombre de batailles pour prendre la province (les coups restent d'une bataille à l'autre, comme dans le jeu) ;
//  - pour la défense (niveau = celui de la campagne, PROGRESSION du même niveau) : part des défenses tenues (dont celles
//    gagnées en abattant le château adverse), murs restants en moyenne, et quand la défense tient.
// Arsenal et jauges du royaume supposés à chaque niveau : voir PROGRESSION (un élève qui joue régulièrement).
// Usage : node atelier/outils/simuler-bataille.js [--graines 80] [--p 0.6,0.7,0.8,0.9] [--niveaux 0,1,2,3,4] [--moteur chemin] [--perte n]
// (environ 3 min avec les réglages par défaut, 10 min avec les trois stratégies ; 80 graines par province et par front,
// 160 défenses par niveau : à 40, le niveau 4 bouge encore de 5 points d'un tirage à l'autre ; lancer un processus par
// niveau avec --niveaux 0, --niveaux 1… va quatre fois plus vite sur quatre cœurs). Résultats et réglages du 15/10/2026,
// puis du 16/10/2026 (IA du seigneur rival : tours dès le début, garnison à sa porte, guetteurs) : docs/JOURNAL.md, Décisions.
//   --moteur : un autre fichier de moteur, par exemple une copie de l'ancien (git show f9939e2:jeu/js/bataille-moteur.js),
//              pour comparer avant et après ;
//   --perte : or perdu par erreur (par défaut celui de jeu/data/config.js, orPerduErreur, sinon celui du moteur ;
//             0 = règle d'avant le 15/10/2026) ;
//   --detail : batailles pour prendre chaque province, graine par graine ;
//   --trace : la 1re bataille de la 1re graine de chaque province du 1er front, vague par vague (ce que tu fais, ce que fait le rival) ;
//   --json : résultats en JSON (pour comparer deux réglages) ;
//   --regle "M.RIVAL[4].tirs = 1.4; M.DEFENSE.degats = 3" : essai d'un réglage du moteur (M), sans toucher au fichier ;
//   --troupes 0.75 : part de l'or dépensée en troupes avant les améliorations de tours ;
//   --seulement attaque (ou defense) : ne joue que les provinces (ou que la défense du domaine), pour aller plus vite ;
//   --comparer avant.json : écarts par niveau avec un essai enregistré par --json, mêmes graines (par exemple l'ancien
//              moteur : --moteur <copie de f9939e2> --perte 0 --json > avant.json) : batailles pour prendre la province
//              et coups portés à la 1re bataille (stratégie « equilibre ») ;
//   --strategies equilibre,rush,tortue : stratégies du joueur scripté (par défaut : equilibre seulement) :
//              equilibre : le joueur d'avant le 16/10/2026 (tours, puis troupes, puis améliorations, voir depenser) ;
//              rush : tout l'or en troupes dès la 1re vague (tour de siège comprise), jamais de tour ;
//              tortue : rien que des tours et des améliorations, jamais de troupe ;
//              attente (thésauriseur, revue du 16/10/2026) : des tours comme le joueur équilibré mais aucune troupe
//              pendant les premières vagues, l'or mis de côté, puis tout en troupes (tours de siège d'abord) à la
//              dernière vague. Cible : pas mieux que l'équilibré (avant la revue, 1,6 bataille au lieu de 4 au niveau 4).
//              Avec plusieurs stratégies, un tableau par stratégie, puis la comparaison (coups à la 1re vague, en part
//              de la solidité de la place forte, coups à la 1re bataille, batailles pour prendre, défense tenue).
//              Le seigneur rival réagit à ce que fait le joueur (jeu/js/bataille-moteur.js, rivalReagit et
//              rivalGuetteurs) : le tableau dit aussi ce qu'il a fait (tours bâties, gardes achetés, gardes rappelés par
//              ses guetteurs, troupes de renfort, en moyenne par bataille). Cibles du 16/10/2026 : la stratégie équilibrée
//              fait au moins aussi bien que rush et tortue ; la ruée ne porte pas plus d'un tiers de la solidité à la 1re
//              vague au niveau 0, moins aux niveaux suivants.
// Batailles de route (expéditions, jour 0 du 24/10/2026 : atelier/conception/expeditions.md 16.1 et 17.2, mesures dans
// atelier/conception/expeditions-mesures.md). Dès qu'une de ces options est donnée, le simulateur ne joue plus les
// provinces ni la défense du domaine : il joue une seule bataille de route par graine (2 × 80 batailles par niveau), avec
// l'arsenal de PROGRESSION[niveau] et le seigneur rival de la ligne RIVAL[niveau], et imprime par niveau la part des
// batailles tenues (les murs n'ont pas cédé), la part des éclatantes (le camp de route tombe), les murs restants et les
// coups portés. Sans ces options, rien ne change (à prouver par --comparer atelier/mesures/avant-expedition.json) :
//   --vagues n : vagues de la bataille (par défaut 4 en attaque, 3 en défense) ;
//   --pvRival n : solidité du camp de route (par défaut 16 en attaque, 12 en défense) ;
//   --mode attaque|defense : mode du moteur (option defense de M.creer ; par défaut attaque, defense si la carte est domaine) ;
//   --carte gue|foret|moulin|col|chateau|domaine : la carte ; par défaut, en attaque, la carte de la province du niveau sur
//              chaque front (80 graines par front, comme les provinces), en défense, domaine (160 graines) ;
//   --arsenal n : rangée de PROGRESSION (ton arsenal et tes jauges) si elle diffère du niveau du rival, par exemple
//              l'embuscade d'une semaine de ligne 1 jouée à la ligne 2 : --niveaux 2 --arsenal 1 ; avec un signe, un
//              écart au niveau (--arsenal -1 : à chaque niveau, l'arsenal de la rangée du dessous, borné à 0..4) ;
//   --sortie fichier.json : écrit aussi les résultats en JSON dans ce fichier (UTF-8), en plus des tableaux ;
//   --sansChampion : le champion adverse de la dernière vague est retiré de la file (dans le simulateur seulement, le
//              moteur n'est pas touché) : mesure de ce que coûte le champion dans une escarmouche à une vague ;
//   --comparer route.json : en mode route, écarts de tenue, d'éclatante, de coups et de murs avec un essai de route
//              enregistré par --json (par exemple avec et sans champion).
"use strict";
const fs = require("fs");
const path = require("path");
const RACINE = path.join(__dirname, "..", "..");

const args = process.argv.slice(2);
function option(nom, defaut) { const i = args.indexOf("--" + nom); return i >= 0 ? args[i + 1] : defaut; }
const GRAINES = parseInt(option("graines", "80"), 10);
const PS = option("p", "0.6,0.7,0.8,0.9").split(",").map(Number);
const MOTEUR = option("moteur", path.join(RACINE, "jeu", "js", "bataille-moteur.js"));
const JSON_SORTIE = args.indexOf("--json") >= 0, DETAIL = args.indexOf("--detail") >= 0, TRACE = args.indexOf("--trace") >= 0;
const NIVEAUX = option("niveaux", "0,1,2,3,4").split(",").map(Number);
const SEULEMENT = option("seulement", null);
const STRATEGIES = option("strategies", "equilibre").split(",").map(s => s.trim()).filter(Boolean);
STRATEGIES.forEach(s => { if (["equilibre", "rush", "tortue", "attente"].indexOf(s) < 0) { console.error("Stratégie inconnue : " + s + " (equilibre, rush, tortue ou attente)"); process.exit(1); } });
// (un fichier écrit par « > » dans Windows PowerShell est en UTF-16 : il est lu aussi)
function lireJSON(f) { const o = fs.readFileSync(f); return JSON.parse(o[0] === 0xFF && o[1] === 0xFE ? o.toString("utf16le", 2) : o.toString("utf8").replace(/^\uFEFF/, "")); }
const COMPARER = option("comparer", null) ? lireJSON(option("comparer")) : null;
// Mode route (batailles d'expédition) : seulement si une de ces options est donnée ; sinon ROUTE est null et rien ne change.
const ROUTE = (function () {
  if (!["vagues", "pvRival", "mode", "carte", "arsenal", "sansChampion"].some(k => args.indexOf("--" + k) >= 0)) return null;
  const carte = option("carte", null);
  const mode = option("mode", carte === "domaine" ? "defense" : "attaque");
  if (mode !== "attaque" && mode !== "defense") { console.error("Mode inconnu : " + mode + " (attaque ou defense)"); process.exit(1); }
  const r = {
    carte: carte, mode: mode,
    vagues: parseInt(option("vagues", mode === "defense" ? "3" : "4"), 10),
    pvRival: parseInt(option("pvRival", mode === "defense" ? "12" : "16"), 10),
    arsenal: option("arsenal", null) === null ? null : parseInt(option("arsenal"), 10),
    arsenalRelatif: /^[+-]/.test(option("arsenal", "")),
    sansChampion: args.indexOf("--sansChampion") >= 0
  };
  if (!(r.vagues >= 1) || !(r.pvRival >= 1)) { console.error("--vagues et --pvRival demandent un entier d'au moins 1"); process.exit(1); }
  if (r.arsenal !== null && !r.arsenalRelatif && !(r.arsenal >= 0 && r.arsenal <= 4)) { console.error("--arsenal : une rangée de PROGRESSION, de 0 à 4, ou un écart signé (-1, +1)"); process.exit(1); }
  if (r.arsenal !== null && r.arsenalRelatif && !(r.arsenal >= -4 && r.arsenal <= 4)) { console.error("--arsenal : écart de -4 à +4"); process.exit(1); }
  return r;
})();
// Rangée de PROGRESSION d'une bataille de route au niveau donné (--arsenal absolu ou relatif, sinon le niveau).
function rangArsenal(niveau) {
  if (!ROUTE || ROUTE.arsenal === null) return niveau;
  return ROUTE.arsenalRelatif ? Math.max(0, Math.min(4, niveau + ROUTE.arsenal)) : ROUTE.arsenal;
}
const SORTIE_FICHIER = option("sortie", null);

// ---------- chargement des modules du jeu ----------
// Chaque fichier est une fonction appelée avec une fausse fenêtre (et non dans un bac à sable vm : les accès aux globales
// y sont dix fois plus lents). Math.random y est remplacé par un tirage à graine : mêmes batailles d'un essai à l'autre.
let tirage = Math.random;
function charger() {
  const stock = {};
  const fenetre = { console, localStorage: { getItem: k => (k in stock ? stock[k] : null), setItem: (k, v) => { stock[k] = String(v); }, removeItem: k => { delete stock[k]; } } };
  const math = Object.create(Math);
  math.random = () => tirage();
  ["noyau", "sauvegarde", "bataille-moteur", "cartes-bataille", "campagne"].forEach(m => {
    const f = m === "bataille-moteur" ? MOTEUR : path.join(RACINE, "jeu", "js", m + ".js");
    new Function("window", "globalThis", "Math", fs.readFileSync(f, "utf8"))(fenetre, fenetre, math);
  });
  new Function("JEU", fs.readFileSync(path.join(RACINE, "jeu", "data", "config.js"), "utf8"))(fenetre.JEU);
  return fenetre.JEU;
}
const J = charger();
const M = J.batailleMoteur, C = J.campagne, CB = J.cartesBataille;
if (option("regle", null)) new Function("M", option("regle"))(M);
if (ROUTE && ROUTE.carte && !CB.LIEUX[ROUTE.carte]) { console.error("Carte inconnue : " + ROUTE.carte + " (" + Object.keys(CB.LIEUX).join(", ") + ")"); process.exit(1); }
const CONFIG = J.donnees.config || {};
const PERTE = option("perte", null) !== null ? Number(option("perte")) : typeof CONFIG.orPerduErreur === "number" ? CONFIG.orPerduErreur : (M.OR_PERDU || 0);
const BONUS_SERIE = 10; // ancien moteur (sans M.repondre) : même règle que jeu/js/bataille.js avant le 15/10/2026

// Tirage à graine (mulberry32) : mêmes batailles d'un essai à l'autre.
function alea(graine) {
  let a = graine >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- ce que l'élève a probablement débloqué quand il attaque la province de niveau n ----------
// (arsenal acheté avec les ressources du domaine, jauges du royaume montées au conseil, remparts)
const PROGRESSION = [
  { tours: { archers: 1, piquiers: 1, baliste: 0, catapulte: 0 }, troupes: { fantassins: 1, cavaliers: 0, belier: 0 }, jauges: 0, remparts: 0 },
  { tours: { archers: 1, piquiers: 1, baliste: 1, catapulte: 0 }, troupes: { fantassins: 1, cavaliers: 1, belier: 0 }, jauges: 2, remparts: 0 },
  { tours: { archers: 1, piquiers: 1, baliste: 1, catapulte: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 }, jauges: 4, remparts: 0 },
  { tours: { archers: 2, piquiers: 2, baliste: 2, catapulte: 1 }, troupes: { fantassins: 2, cavaliers: 2, belier: 1 }, jauges: 6, remparts: 1 },
  { tours: { archers: 3, piquiers: 2, baliste: 2, catapulte: 2 }, troupes: { fantassins: 2, cavaliers: 2, belier: 2 }, jauges: 8, remparts: 1 }
];
// rang : rangée de PROGRESSION (par défaut celle du niveau ; le mode route peut en prendre une autre, --arsenal).
function optionsBataille(niveau, rang) {
  J.sauvegarde.remplacer(J.sauvegarde.nouvelle());
  const c = C.etat(), pr = PROGRESSION[rang == null ? niveau : rang];
  c.arsenal.tours = Object.assign({}, pr.tours); c.arsenal.troupes = Object.assign({}, pr.troupes); c.arsenal.remparts = pr.remparts;
  ["tresor", "peuple", "garde", "savoir"].forEach(k => { c.royaume[k] = pr.jauges; });
  const o = C.options(niveau);
  o.orPerduErreur = PERTE;
  return o;
}

// ---------- le joueur scripté ----------
// Couverture : pour chaque type de tour, nombre de points de la route (tous les 10 px) à portée de chaque emplacement.
const couvertures = {};
function couverture(carteId, carte, type) {
  const cle = carteId + "/" + type;
  if (couvertures[cle]) return couvertures[cle];
  const r = M.preparerRoute(carte.route), portee = M.TOURS[type].portee;
  const pts = [];
  for (let s = 0; s <= r.longueur; s += 10) pts.push(M.surRoute(r, s, -9));
  return (couvertures[cle] = carte.emplacements.map(e => pts.filter(q => Math.hypot(q.x - e[0], q.y - e[1]) <= portee).length));
}
const ORDRE_TOURS = ["archers", "baliste", "piquiers", "catapulte"];
const PART_TROUPES = Number(option("troupes", "0.75"));
// belierDesLeDebut : la tour de siège dès la 1re vague (stratégie rush) ; sinon dès la 2e, comme avant.
function acheterTroupes(p, budget, belierDesLeDebut) {
  for (;;) {
    const choix = ["belier", "cavaliers", "fantassins"].filter(t => M.niveauArsenal(p, "troupes", t) > 0 && (t !== "belier" || p.vague >= 1 || belierDesLeDebut))
      .find(t => M.TROUPES[t].cout <= Math.min(budget, p.or));
    if (!choix || !M.envoyer(p, choix)) return;
    budget -= M.TROUPES[choix].cout;
  }
}
// Des tours jusqu'à « cible » (types en alternance, sur l'emplacement libre qui couvre le plus de route).
function poserTours(p, carteId, carte, cible) {
  const dispo = ORDRE_TOURS.filter(t => M.niveauArsenal(p, "tours", t) > 0);
  while (p.tours.length < cible) {
    const type = dispo[p.tours.length % dispo.length];
    if (p.or < M.TOURS[type].cout) break;
    const cov = couverture(carteId, carte, type);
    let meilleur = -1;
    cov.forEach((n, i) => { if (M.emplacementLibre(p, i) && (meilleur < 0 || n > cov[meilleur])) meilleur = i; });
    if (meilleur < 0 || !M.poserTour(p, type, meilleur)) break;
  }
}
// Avant chaque vague : des tours jusqu'à 2 + numéro de vague (types en alternance, sur l'emplacement qui couvre le plus
// de route), PART_TROUPES de l'or qui reste en troupes (tour de siège dès la 2e vague, puis cavaliers, puis fantassins),
// puis des améliorations (la moins chère d'abord), puis le reste en troupes.
function depenser(p, carteId, carte) {
  const cible = Math.min(carte.emplacements.length, 2 + p.vague);
  poserTours(p, carteId, carte, cible);
  acheterTroupes(p, Math.floor(p.or * PART_TROUPES));
  if (p.tours.length >= cible) {
    for (;;) {
      const t = p.tours.filter(x => x.niveau < M.AMELIORATION.max).sort((a, b) => M.coutAmelioration(a) - M.coutAmelioration(b))[0];
      if (!t || p.or < M.coutAmelioration(t) || !M.ameliorerTour(p, t.emplacement)) break;
    }
  }
  acheterTroupes(p, Infinity);
}
// Rush : tout l'or en troupes, dès la 1re vague, la plus chère d'abord (tour de siège, cavaliers, fantassins).
function depenserRush(p) { acheterTroupes(p, Infinity, true); }
// Tortue : des tours sur chaque emplacement libre (types en alternance, celui qui couvre le plus de route d'abord), puis
// des améliorations (la moins chère d'abord) ; jamais de troupe.
function depenserTortue(p, carteId, carte) {
  const dispo = ORDRE_TOURS.filter(t => M.niveauArsenal(p, "tours", t) > 0);
  for (;;) {
    const type = dispo[p.tours.length % dispo.length];
    if (p.tours.length >= carte.emplacements.length || p.or < M.TOURS[type].cout) break;
    const cov = couverture(carteId, carte, type);
    let meilleur = -1;
    cov.forEach((n, i) => { if (M.emplacementLibre(p, i) && (meilleur < 0 || n > cov[meilleur])) meilleur = i; });
    if (meilleur < 0 || !M.poserTour(p, type, meilleur)) break;
  }
  for (;;) {
    const t = p.tours.filter(x => x.niveau < M.AMELIORATION.max).sort((a, b) => M.coutAmelioration(a) - M.coutAmelioration(b))[0];
    if (!t || p.or < M.coutAmelioration(t) || !M.ameliorerTour(p, t.emplacement)) break;
  }
}
// Attente (thésauriseur) : les tours du joueur équilibré (2 + numéro de vague), aucune troupe et l'or mis de côté
// pendant les premières vagues ; à la dernière vague, tout l'or en troupes (tour de siège d'abord).
function depenserAttente(p, carteId, carte) {
  if (p.vague < p.vagues - 1) { poserTours(p, carteId, carte, Math.min(carte.emplacements.length, 2 + p.vague)); return; }
  acheterTroupes(p, Infinity, true);
}
const DEPENSES = { equilibre: depenser, rush: depenserRush, tortue: depenserTortue, attente: depenserAttente };

// Or d'une réponse : celui du moteur s'il sait le faire (M.repondre), sinon l'ancienne règle de bataille.js.
function repondre(p, juste, etat) {
  if (M.repondre) return M.repondre(p, juste);
  if (juste) { etat.serie++; p.or += p.orParReponse + (etat.serie >= 3 ? BONUS_SERIE : 0); if (etat.serie >= 3) etat.serie = 0; }
  else { etat.serie = 0; p.or = Math.max(0, p.or - PERTE); }
  return null;
}

// Nouvelles du front (comme dans jeu/js/bataille.js) : à partir de la 2e vague, 45 % de chances d'un événement.
function nouvelles(p, r) {
  if (p.vague === 0 || r() > 0.45) return;
  const k = ["brouillard", "pluie", "flechesNeuves", "renfort"][Math.floor(r() * 4)];
  if (k === "renfort") { p.chateau.pv = Math.min(p.chateau.max + 3, p.chateau.pv + 3); p.chateau.max = Math.max(p.chateau.max, p.chateau.pv); }
  else p.modificateurs[k] = true;
}

// Une bataille, jouée vague par vague. Rend l'issue, les coups portés (en tout et à la 1re vague), les murs restants et ce
// que le seigneur rival a fait (tours bâties en cours de bataille, gardes ajoutés à sa garnison, troupes de renfort).
function jouerBataille(carteId, o, pJuste, graine, strategie, trace) {
  const r = alea(graine);
  tirage = r;
  const carte = CB.carte(carteId);
  const p = M.creer(carte, o);
  const etat = { serie: 0 }, depense = DEPENSES[strategie || "equilibre"];
  const toursAuDepart = p.toursRivales.length;
  let garde = 0, vague1 = null;
  while (p.phase !== "fin" && garde++ < 20) {
    for (let i = 0; i < 3; i++) repondre(p, r() < pJuste, etat);
    nouvelles(p, r);
    depense(p, carteId, carte);
    const avant = TRACE && trace ? { vague: p.vague + 1, or: p.or, envois: p.envois.length, tours: p.tours.length, coups: p.stats.degatsRival, sorties: p.stats.sorties || 0, journal: p.ia ? p.ia.journal.length : 0 } : null;
    if (ROUTE && ROUTE.sansChampion) {
      // même déroulement que M.jouerVague, le champion ôté de la file adverse entre le lancement et le premier pas
      M.lancerVague(p);
      const iCh = p.fileRivale.indexOf("champion");
      if (iCh >= 0) { p.fileRivale.splice(iCh, 1); p.stats.rivaux--; }
      let pas = 0;
      while (p.phase === "vague" && pas++ < 40000) M.etape(p, 0.025);
    } else M.jouerVague(p, 0.025);
    if (vague1 === null) vague1 = p.stats.degatsRival;
    if (avant) trace.push("   vague " + avant.vague + " : tu envoies " + avant.envois + " soldats, tu as " + avant.tours + " tours, tu gardes " + avant.or + " or ; garnison " + (p.garnison ? p.garnison.taille : "—") +
      ", sorties " + ((p.stats.sorties || 0) - avant.sorties) + ", coups portés " + (p.stats.degatsRival - avant.coups) + " ; rival : " + (p.ia ? p.ia.journal.slice(avant.journal).map(j => j.posture + " " + JSON.stringify(j.actions)).join(" ; ") : "—") + (p.ia ? " (trésor " + p.ia.or + ")" : ""));
  }
  const ia = { tours: p.toursRivales.length - toursAuDepart, gardes: 0, renforts: 0, rappels: 0 };
  ((p.ia && p.ia.journal) || []).forEach(j => j.actions.forEach(a => {
    if (a.genre === "garde") ia.gardes += a.nombre; else if (a.genre === "renfort") ia.renforts += a.nombre; else if (a.genre === "rappel") ia.rappels += a.nombre;
  }));
  return { issue: p.fin, degats: p.stats.degatsRival, vague1: vague1 || 0, murs: Math.max(0, p.chateau.pv) / o.pvChateau, stats: p.stats, ia: ia };
}

// ---------- essais ----------
function attaque(niveau, pJuste, strategie) {
  const res = { victoire: 0, tenu: 0, retraite: 0, degats: 0, batailles: 0, maxBatailles: 0, prises: 0, n: 0, tues: 0, pertes: 0,
    vague1: 0, part1: 0, fortes1: 0, sorties: 0, iaTours: 0, iaGardes: 0, iaRenforts: 0, iaRappels: 0 };
  C.FRONTS.forEach((f, iF) => {
    const prov = f.provinces[niveau];
    for (let g = 0; g < GRAINES; g++) {
      let pv = prov.pv, n = 0;
      while (pv > 0 && n < 12) {
        const o = optionsBataille(niveau);
        o.vagues = 4; o.pvRival = pv; o.pvRivalMax = prov.pv;
        const tr = TRACE && g === 0 && iF === 0 && n === 0 ? [] : null;
        const b = jouerBataille(prov.carte, o, pJuste, 1000 * g + 97 * niveau + 31 * iF + 7 * n + 1, strategie, tr);
        if (tr) console.log(" " + strategie + ", p = " + pJuste + ", " + prov.nom + " (niveau " + niveau + "), 1re bataille, graine 0 : " + b.issue + ", " + b.degats + " coups\n" + tr.join("\n"));
        if (n === 0) {
          res[b.issue]++; res.degats += b.degats; res.n++; res.tues += b.stats.tues; res.pertes += b.stats.pertes;
          res.vague1 += b.vague1; res.part1 += b.vague1 / prov.pv; if (b.vague1 > prov.pv / 3) res.fortes1++;
          res.sorties += b.stats.sorties || 0; res.iaTours += b.ia.tours; res.iaGardes += b.ia.gardes; res.iaRenforts += b.ia.renforts; res.iaRappels += b.ia.rappels;
        }
        pv = b.issue === "victoire" ? 0 : Math.max(0, pv - b.degats);
        n++;
        if (!b.stats.envoyes && !b.degats) { n = 12; break; } // aucune troupe envoyée (tortue) : la province ne tombera jamais
      }
      if (pv <= 0) { res.prises++; res.batailles += n; res.maxBatailles = Math.max(res.maxBatailles, n); }
      if (DETAIL) (res.detail = res.detail || {})[prov.id] = ((res.detail[prov.id] || "") + " " + (pv <= 0 ? n : "x")).trim();
    }
  });
  return res;
}
function defense(niveau, pJuste, strategie) {
  const res = { victoire: 0, tenu: 0, retraite: 0, degats: 0, n: 0, murs: 0, mursTenue: 0 };
  for (let g = 0; g < 2 * GRAINES; g++) {
    const o = optionsBataille(niveau);
    o.vagues = 3; o.pvRival = 12; o.pvRivalMax = 12;
    const b = jouerBataille("domaine", o, pJuste, 5000 * g + 13 * niveau + 3, strategie);
    res[b.issue]++; res.degats += b.degats; res.n++; res.murs += b.murs; if (b.issue !== "retraite") res.mursTenue += b.murs;
  }
  return res;
}

// Bataille de route (mode ROUTE) : une seule bataille par graine, 2 × GRAINES par niveau (80 par carte de front en
// attaque sans --carte ; 160 sur la carte donnée, ou sur le domaine en défense). Les graines sont celles des provinces
// (1re bataille) ou de la défense du domaine, selon le cas.
function route(niveau, pJuste, strategie) {
  const res = { victoire: 0, tenu: 0, retraite: 0, degats: 0, n: 0, murs: 0, mursTenue: 0, vague1: 0, tues: 0, pertes: 0,
    sorties: 0, iaTours: 0, iaGardes: 0, iaRenforts: 0, iaRappels: 0, cartes: [] };
  const cartes = ROUTE.carte ? [ROUTE.carte] : ROUTE.mode === "defense" ? ["domaine"] : C.FRONTS.map(f => f.provinces[niveau].carte);
  res.cartes = cartes;
  const parCarte = Math.round(2 * GRAINES / cartes.length);
  cartes.forEach((carte, iC) => {
    for (let g = 0; g < parCarte; g++) {
      const o = optionsBataille(niveau, rangArsenal(niveau));
      o.vagues = ROUTE.vagues; o.pvRival = ROUTE.pvRival; o.pvRivalMax = ROUTE.pvRival; o.defense = ROUTE.mode === "defense";
      const tr = TRACE && g === 0 && iC === 0 ? [] : null;
      const b = jouerBataille(carte, o, pJuste, cartes.length > 1 ? 1000 * g + 97 * niveau + 31 * iC + 1 : 5000 * g + 13 * niveau + 3, strategie, tr);
      if (tr) console.log(" " + strategie + ", p = " + pJuste + ", route " + carte + " (niveau " + niveau + "), graine 0 : " + b.issue + ", " + b.degats + " coups\n" + tr.join("\n"));
      res[b.issue]++; res.degats += b.degats; res.n++; res.murs += b.murs; if (b.issue !== "retraite") res.mursTenue += b.murs;
      res.vague1 += b.vague1; res.tues += b.stats.tues; res.pertes += b.stats.pertes; res.sorties += b.stats.sorties || 0;
      res.iaTours += b.ia.tours; res.iaGardes += b.ia.gardes; res.iaRenforts += b.ia.renforts; res.iaRappels += b.ia.rappels;
    }
  });
  return res;
}

const pc = (a, n) => n ? Math.round(100 * a / n) : null;
const r2 = (a, n) => n ? Math.round(100 * a / n) / 100 : null;
const t0 = Date.now();
const sortie = { graines: GRAINES, perte: PERTE, moteur: path.relative(RACINE, MOTEUR), resultats: {}, strategies: {} };
if (ROUTE) sortie.route = { vagues: ROUTE.vagues, pvRival: ROUTE.pvRival, mode: ROUTE.mode, carte: ROUTE.carte, arsenal: ROUTE.arsenal === null ? null : (ROUTE.arsenalRelatif ? (ROUTE.arsenal >= 0 ? "+" : "") + ROUTE.arsenal : ROUTE.arsenal), sansChampion: ROUTE.sansChampion };
const descRoute = ROUTE ? "bataille de route : " + ROUTE.mode + ", " + ROUTE.vagues + " vague" + (ROUTE.vagues > 1 ? "s" : "") + ", camp de " + ROUTE.pvRival +
  ", carte " + (ROUTE.carte || (ROUTE.mode === "defense" ? "domaine" : "de la province du niveau, deux fronts")) +
  (ROUTE.arsenal !== null ? ", arsenal " + (ROUTE.arsenalRelatif ? "du niveau " + (ROUTE.arsenal >= 0 ? "+ " : "− ") + Math.abs(ROUTE.arsenal) : "de la rangée " + ROUTE.arsenal) : "") + (ROUTE.sansChampion ? ", sans champion" : "") : "";
if (!JSON_SORTIE && ROUTE) console.log("Moteur : " + sortie.moteur + " · or perdu par erreur : " + PERTE + " · " + 2 * GRAINES + " batailles par niveau · " + descRoute +
  (STRATEGIES.length > 1 || STRATEGIES[0] !== "equilibre" ? " · stratégies : " + STRATEGIES.join(", ") : ""));
else if (!JSON_SORTIE) console.log("Moteur : " + sortie.moteur + " · or perdu par erreur : " + PERTE + " · " + GRAINES + " graines par province (deux fronts), " + 2 * GRAINES + " défenses par niveau" +
  (STRATEGIES.length > 1 || STRATEGIES[0] !== "equilibre" ? " · stratégies : " + STRATEGIES.join(", ") : ""));
// avec --seulement, la partie qui n'a pas été jouée s'affiche « — » (et non « null % » ou « NaN »)
const pct = x => (x === null || x === undefined ? "—" : x + " %"), val = x => (x === null || x === undefined ? "—" : String(x));
// Mode route : un tableau par stratégie (tenue, éclatante, murs, coups), puis les écarts avec un essai de route comparé.
function sortieRoute(pJuste, strategie) {
  const lignes = NIVEAUX.map(niveau => {
    const a = route(niveau, pJuste, strategie);
    return {
      niveau: niveau, arsenal: rangArsenal(niveau), carte: a.cartes.join("/"), tenue: pc(a.victoire + a.tenu, a.n), eclatante: pc(a.victoire, a.n), tenu: pc(a.tenu, a.n), retraite: pc(a.retraite, a.n),
      degats: r2(a.degats, a.n), vague1: r2(a.vague1, a.n), murs: pc(a.murs, a.n), mursTenue: pc(a.mursTenue, a.victoire + a.tenu),
      tues: a.n ? Math.round(10 * a.tues / a.n) / 10 : null, pertes: a.n ? Math.round(10 * a.pertes / a.n) / 10 : null, sorties: r2(a.sorties, a.n),
      iaTours: r2(a.iaTours, a.n), iaGardes: r2(a.iaGardes, a.n), iaRenforts: r2(a.iaRenforts, a.n), iaRappels: r2(a.iaRappels, a.n), n: a.n
    };
  });
  if (strategie === "equilibre") sortie.resultats[pJuste] = lignes;
  (sortie.strategies[strategie] = sortie.strategies[strategie] || {})[pJuste] = lignes;
  if (JSON_SORTIE) return;
  console.log("\np = " + pJuste + " (réponses justes)" + (STRATEGIES.length > 1 || strategie !== "equilibre" ? " · stratégie " + strategie : "") + " · " + descRoute);
  console.log("niv | carte          | tenue (éclatante) | tenu  retraite | murs restants (quand elle tient) | coups portés (1re vague) | ennemis tués / tes pertes | sorties · rival : tours, gardes, rappelés, renforts");
  lignes.forEach(l => console.log(
    " " + l.niveau + "  | " + l.carte.padEnd(14) + " | " + pct(l.tenue).padStart(6) + " (" + pct(l.eclatante).padStart(5) + ")   | " + pct(l.tenu).padStart(5) + " " + pct(l.retraite).padStart(6) + "   | " +
    (pct(l.murs) + " (" + pct(l.mursTenue) + ")").padStart(32) + " | " + (val(l.degats) + " (" + val(l.vague1) + ")").padStart(24) + " | " + val(l.tues).padStart(8) + " / " + val(l.pertes).padEnd(6) +
    " | " + val(l.sorties) + " · " + val(l.iaTours) + ", " + val(l.iaGardes) + ", " + val(l.iaRappels) + ", " + val(l.iaRenforts)));
  const moy = k => Math.round(10 * lignes.reduce((s, l) => s + (l[k] || 0), 0) / lignes.length) / 10;
  console.log("moy |                | " + (moy("tenue") + " %").padStart(6) + " (" + (moy("eclatante") + " %").padStart(5) + ")   |                | " + (moy("murs") + " %").padStart(32) + " | " + String(moy("degats")).padStart(24));
  const ref = strategie === "equilibre" && COMPARER && COMPARER.route && COMPARER.resultats[pJuste];
  if (!ref) return;
  const pts = (x, y) => (x == null || y == null ? "—" : (y >= x ? "+" : "−") + Math.abs(y - x) + " pt");
  const ecart = (x, y) => x && y != null ? (y >= x ? "+" : "−") + Math.abs(Math.round(100 * (y / x - 1))) + " %" : "—";
  console.log("écarts avec " + option("comparer") + " (" + [COMPARER.route.mode, COMPARER.route.vagues + " vague(s)", "camp " + COMPARER.route.pvRival, COMPARER.route.carte || "carte par défaut", COMPARER.route.sansChampion ? "sans champion" : "avec champion"].join(", ") + ") : tenue ; éclatante ; coups portés ; murs restants");
  lignes.forEach(l => {
    const r = ref.find(x => x.niveau === l.niveau);
    if (r) console.log(" " + l.niveau + "  | " + pct(r.tenue) + " → " + pct(l.tenue) + " (" + pts(r.tenue, l.tenue) + ") ; " + pct(r.eclatante) + " → " + pct(l.eclatante) + " (" + pts(r.eclatante, l.eclatante) + ") ; " +
      val(r.degats) + " → " + val(l.degats) + " (" + ecart(r.degats, l.degats) + ") ; " + pct(r.murs) + " → " + pct(l.murs) + " (" + pts(r.murs, l.murs) + ")");
  });
}
PS.forEach(pJuste => {
  if (ROUTE) {
    STRATEGIES.forEach(strategie => sortieRoute(pJuste, strategie));
    if (JSON_SORTIE || STRATEGIES.length < 2) return;
    console.log("\np = " + pJuste + " · comparaison des stratégies, par niveau : tenue (éclatante) ; coups portés ; murs restants");
    NIVEAUX.forEach((niveau, i) => console.log(" " + niveau + "  | " + STRATEGIES.map(s => { const l = sortie.strategies[s][pJuste][i]; return s + " " + pct(l.tenue) + " (" + pct(l.eclatante) + ") ; " + val(l.degats) + " ; " + pct(l.murs); }).join(" | ")));
    return;
  }
  STRATEGIES.forEach(strategie => {
    const lignes = [];
    NIVEAUX.forEach(niveau => {
      const vide = { victoire: 0, tenu: 0, retraite: 0, degats: 0, batailles: 0, maxBatailles: 0, prises: 0, n: 0, tues: 0, pertes: 0, murs: 0, mursTenue: 0,
        vague1: 0, part1: 0, fortes1: 0, sorties: 0, iaTours: 0, iaGardes: 0, iaRenforts: 0, iaRappels: 0 };
      const a = SEULEMENT === "defense" ? vide : attaque(niveau, pJuste, strategie), d = SEULEMENT === "attaque" ? vide : defense(niveau, pJuste, strategie);
      if (DETAIL) console.log(strategie + ", niveau " + niveau + ", batailles pour prendre, graine par graine : " + JSON.stringify(a.detail));
      lignes.push({
        niveau: niveau, victoire: pc(a.victoire, a.n), tenu: pc(a.tenu, a.n), retraite: pc(a.retraite, a.n),
        degats: r2(a.degats, a.n), pv: C.FRONTS.map(f => f.provinces[niveau].pv).join("/"),
        batailles: a.prises ? Math.round(100 * a.batailles / a.prises) / 100 : null, maxBatailles: a.maxBatailles, prises: pc(a.prises, 2 * GRAINES),
        tues: a.n ? Math.round(10 * a.tues / a.n) / 10 : null, pertes: a.n ? Math.round(10 * a.pertes / a.n) / 10 : null,
        vague1: r2(a.vague1, a.n), part1: pc(a.part1, a.n), fortes1: pc(a.fortes1, a.n), sorties: r2(a.sorties, a.n),
        iaTours: r2(a.iaTours, a.n), iaGardes: r2(a.iaGardes, a.n), iaRenforts: r2(a.iaRenforts, a.n), iaRappels: r2(a.iaRappels, a.n),
        defenseTenue: pc(d.victoire + d.tenu, d.n), defenseVictoire: pc(d.victoire, d.n), defenseMurs: pc(d.murs, d.n),
        defenseMursTenue: pc(d.mursTenue, d.victoire + d.tenu)
      });
    });
    if (strategie === "equilibre") sortie.resultats[pJuste] = lignes;
    (sortie.strategies[strategie] = sortie.strategies[strategie] || {})[pJuste] = lignes;
    if (JSON_SORTIE) return;
    console.log("\np = " + pJuste + " (réponses justes)" + (STRATEGIES.length > 1 || strategie !== "equilibre" ? " · stratégie " + strategie : ""));
    console.log("niv | pv     | victoire tenu retraite | coups 1re bataille | batailles pour prendre (max) | ennemis tués / tes pertes | défense tenue (dont victoire), murs restants (quand elle tient)");
    lignes.forEach(l => console.log(
      " " + l.niveau + "  | " + l.pv.padEnd(6) + " | " + pct(l.victoire).padStart(7) + " " + pct(l.tenu).padStart(5) + " " + pct(l.retraite).padStart(6) + "   | " +
      val(l.degats).padStart(18) + " | " + (SEULEMENT === "defense" ? "—" : String(l.batailles === null ? "jamais" : l.batailles)).padStart(18) + (SEULEMENT === "defense" ? "" : " (" + l.maxBatailles + ")" + (l.prises < 100 ? " prises " + l.prises + " %" : "")) +
      " | " + val(l.tues).padStart(8) + " / " + val(l.pertes) + " | " + pct(l.defenseTenue) + " (" + pct(l.defenseVictoire) + "), " + pct(l.defenseMurs) + " (" + pct(l.defenseMursTenue) + ")"));
    const moy = k => Math.round(10 * lignes.reduce((s, l) => s + (l[k] || 0), 0) / lignes.length) / 10;
    const moyA = k => (SEULEMENT === "defense" ? "—" : String(moy(k))), moyAp = k => (SEULEMENT === "defense" ? "—" : moy(k) + " %"), moyD = k => (SEULEMENT === "attaque" ? "—" : moy(k) + " %");
    console.log("moy |        | " + moyAp("victoire").padStart(7) + " " + moyAp("tenu").padStart(5) + " " + moyAp("retraite").padStart(6) + "   | " + moyA("degats").padStart(18) + " | " + moyA("batailles").padStart(18) + "     |                       | " + moyD("defenseTenue") + ", murs " + moyD("defenseMurs"));
    if (SEULEMENT !== "defense") {
      console.log("1re bataille : coups à la 1re vague (part de la solidité ; batailles où elle dépasse un tiers) · sorties de la garnison · le rival en cours de bataille : tours bâties, gardes ajoutés à sa garnison, gardes rappelés par ses guetteurs (toutes vagues), troupes de renfort");
      lignes.forEach(l => console.log(" " + l.niveau + "  | " + val(l.vague1).padStart(5) + " (" + pct(l.part1) + " ; " + pct(l.fortes1) + ") · " + val(l.sorties) + " sorties · " + val(l.iaTours) + " tours, " + val(l.iaGardes) + " gardes, " + val(l.iaRappels) + " rappelés, " + val(l.iaRenforts) + " renforts"));
    }
    const ref = strategie === "equilibre" && COMPARER && COMPARER.resultats[pJuste];
    if (!ref || SEULEMENT === "defense") return;
    const ecart = (x, y) => x && y != null ? (y >= x ? "+" : "−") + Math.abs(Math.round(100 * (y / x - 1))) + " %" : "—";
    console.log("écarts avec " + option("comparer") + " (" + (COMPARER.moteur || "?") + ", or perdu " + COMPARER.perte + ") : batailles pour prendre ; coups à la 1re bataille" +
      (COMPARER.graines !== GRAINES ? " (attention : " + COMPARER.graines + " graines dans l'essai comparé, " + GRAINES + " ici : les moyennes ne portent pas sur les mêmes batailles)" : ""));
    lignes.forEach(l => {
      const r = ref.find(x => x.niveau === l.niveau);
      if (r) console.log(" " + l.niveau + "  | " + r.batailles + " → " + l.batailles + " (" + ecart(r.batailles, l.batailles) + ") ; " + r.degats + " → " + l.degats + " (" + ecart(r.degats, l.degats) + ")");
    });
  });
  // comparaison des stratégies : la stratégie équilibrée doit faire au moins aussi bien que rush et tortue
  if (JSON_SORTIE || STRATEGIES.length < 2) return;
  console.log("\np = " + pJuste + " · comparaison des stratégies, par niveau : coups à la 1re vague (part de la solidité) ; coups à la 1re bataille ; batailles pour prendre (prises en 12) ; défense tenue");
  NIVEAUX.forEach((niveau, i) => {
    console.log(" " + niveau + "  | " + STRATEGIES.map(s => {
      const l = sortie.strategies[s][pJuste][i];
      return s + " " + val(l.vague1) + " (" + pct(l.part1) + ") ; " + val(l.degats) + " ; " + (l.batailles === null ? "jamais" : l.batailles) + (l.prises < 100 ? " (" + pct(l.prises) + ")" : "") + " ; " + pct(l.defenseTenue);
    }).join(" | "));
  });
});
if (SORTIE_FICHIER) fs.writeFileSync(SORTIE_FICHIER, JSON.stringify(sortie));
if (JSON_SORTIE) console.log(JSON.stringify(sortie));
else console.log("\n(" + Math.round((Date.now() - t0) / 1000) + " s)");
