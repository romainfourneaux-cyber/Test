// Mesures du tirage des questions : le vrai tirage du jeu (JEU.recit.suite), avec les vrais cours, suivi.js et
// a-retravailler.js.
//  1. Familles de matières : batailles (4 vagues de 3), conseils (8 vrai ou faux), événements (3), avec une sauvegarde
//     neuve ou des notions déjà vues, sans répondre ou en répondant juste 7 fois sur 10 : part de chaque famille.
//  2. Répétitions (15/10/2026, « elles reviennent souvent ») : des séances de 100 questions jouées comme dans le jeu
//     (l'événement du jour, puis batailles de 4 vagues de 3 questions et conseils de 8 vrai ou faux, « Seconde chance »
//     comprises), par un élève simulé dont la réussite dépend du niveau de la question ; six séances de suite avec la même
//     sauvegarde (le jeu rouvert un jour plus tard à chaque fois). Pour la 1re séance (sauvegarde neuve) et la 6e (après
//     5 séances) : questions reposées dans la séance (hors « Seconde chance »), reposées à moins de 60 questions, même
//     notion deux fois en 10 questions, niveaux posés face au niveau conseillé, réussite, durée d'un tirage.
//  3. Expéditions (24/10/2026, atelier/conception/expeditions.md 17.4) : --expedition : des expéditions simulées sur six
//     séances par les trois mêmes élèves, départ S1 puis S6 (--departs), avec le vrai déroulé de jeu/js/expedition.js :
//     route à graine, haltes choisies au hasard parmi celles qu'on peut atteindre, lots de 3 avec le quota de la semaine
//     (deux vagues en escarmouche et embuscade, deux au gardien, trois au Grand Gardien), événements de route (archives
//     comprises), question de porte sur la famille du conseiller, marchand, veillée du bivouac (notions à revoir) ; les
//     batailles sont supposées tenues (ici, seul le tirage compte). Tous les fichiers de jeu/data/cours et jeu/data/anglais
//     sont chargés, indexés ou non, pour mesurer les semaines minces dès maintenant. Pour chaque départ et chaque élève :
//     part des questions de la fenêtre de l'acte selon le quota (cible : ≥ 60 % quand le quota est 2, ≥ 30 % quand il est 1),
//     part de chaque famille (12 à 30 %), notions à revoir face à leur part parmi les fiches (1,5 à 2 fois), questions
//     reposées à moins de 60 (hors Seconde chance), même notion deux fois en 10 questions, réussite (≈ 73 % pour l'élève
//     moyen), durée d'un tirage avec quota (modules chargés hors bac à sable vm : médiane < 3 ms, maximum < 10 ms).
// Usage : node atelier/outils/mesurer-tirage.js [parties par situation, 200 par défaut] [--familles | --repetitions]
//         [--graines 16] [--seances 6] [--js dossier] [--avant dossier]
//         node atelier/outils/mesurer-tirage.js --expedition [--departs 1,6] [--graines 8] [--seances 6] [--front angleterre]
//   --js : charger les modules du jeu (jeu/js/*.js) depuis un autre dossier, par exemple une copie de l'ancien code
//          (git show <commit>:jeu/js/recit.js > dossier/recit.js, etc. : noyau, brouillage, calendrier, sauvegarde,
//          leitner, progression, questions, rappels, recit) ;
//   --avant : répétitions mesurées aussi avec les modules de ce dossier, et un seul tableau « avant / après » (mêmes
//          cours, mêmes élèves simulés). Mesures du 15/10/2026 : docs/JOURNAL.md, rubrique Décisions.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const RACINE = path.join(__dirname, "..", "..");

const ARGS = process.argv.slice(2);
function option(nom, defaut) { const i = ARGS.indexOf("--" + nom); return i >= 0 ? ARGS[i + 1] : defaut; }
const DOSSIER_JS = option("js", path.join(RACINE, "jeu", "js"));
const MODULES = ["noyau", "brouillage", "calendrier", "sauvegarde", "leitner", "progression", "questions", "rappels", "recit"];

// hasard reproductible (mulberry32)
function graine(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Date du jeu décalée de « jours » jours (une séance par jour pour la répétition espacée).
function dateDecalee(jours) {
  const ms = jours * 86400000;
  function D(...a) { return a.length ? new Date(...a) : new Date(Date.now() + ms); }
  D.now = () => Date.now() + ms; D.UTC = Date.UTC; D.parse = Date.parse; D.prototype = Date.prototype;
  return D;
}

// Un jeu chargé comme au double-clic sur index.html : modules, données, puis la sauvegarde (stock = le localStorage,
// gardé d'une séance à l'autre).
function contexte(seed, stock, jours, dossierJs) {
  stock = stock || {};
  const MathR = Object.create(Math); MathR.random = graine(seed);
  const ctx = { console, Buffer, Math: MathR, Date: jours ? dateDecalee(jours) : Date, btoa: globalThis.btoa, atob: globalThis.atob,
    localStorage: { getItem: k => (k in stock ? stock[k] : null), setItem: (k, v) => { stock[k] = String(v); }, removeItem: k => { delete stock[k]; } } };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  MODULES.forEach(m => {
    vm.runInContext(fs.readFileSync(path.join(dossierJs || DOSSIER_JS, m + ".js"), "utf8"), ctx, { filename: m + ".js" });
  });
  ["config", "planning", "devoirs", "index-cours", "a-retravailler", "suivi"].forEach(f => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", f + ".js"), "utf8"), ctx));
  ctx.JEU.donnees.indexCours.forEach(id => {
    const dossier = /^anglais-/.test(id) ? "anglais" : "cours";
    const f = path.join(RACINE, "jeu", "data", dossier, id + ".js");
    if (fs.existsSync(f)) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: id + ".js" });
  });
  ctx.JEU.sauvegarde.charger();
  return ctx;
}

const FAMILLE = { histoire: "Histoire", geographie: "Géographie", svt: "SVT", physique: "Physique-chimie", litterature: "Français", lecture: "Français", langue: "Français", anglais: "Anglais" };
const FAMS = ["Histoire", "Géographie", "SVT", "Physique-chimie", "Français", "Anglais"];

function nouveauCompte() { return { n: 0, fam: {}, mat: {}, triples: 0, triplesLots: 0, rappels: 0, rev: 0, revFam: {} }; }

// une bataille : 4 vagues de 3 questions (exclusions de la bataille, comme bataille.js)
function bataille(J, cpt, opts) {
  const posees = [];
  for (let v = 0; v < 4; v++) {
    const ids = posees.map(q => q.id), fiches = posees.map(q => q.fiche);
    // comme jeu/js/bataille.js : niveaux 1 à 3 en bataille
    const tirer = () => J.recit.suite(3, { exclure: ids, filtre: q => fiches.indexOf(q.fiche) < 0, completer: true });
    const lot = J.questions.avecNiveaux ? J.questions.avecNiveaux(J.questions.NIVEAUX_BATAILLE, tirer) : tirer();
    compter(J, cpt, lot, opts);
    lot.forEach(q => posees.push(q));
  }
}
function conseil(J, cpt, opts) { compter(J, cpt, J.recit.suite(8, { types: ["vrai_faux"] }), opts); }
function evenement(J, cpt, opts) { compter(J, cpt, J.recit.suite(opts.ev || 3), opts); }

function compter(J, cpt, lot, opts) {
  const aRev = J.progression.fichesARevoir();
  const fams = lot.map(q => FAMILLE[q.matiere] || q.matiere);
  lot.forEach((q, i) => {
    const f = fams[i];
    cpt.n++; cpt.fam[f] = (cpt.fam[f] || 0) + 1; cpt.mat[q.matiere] = (cpt.mat[q.matiere] || 0) + 1;
    if (q.rappel) cpt.rappels++;
    if (aRev.indexOf(q.fiche) >= 0) { cpt.rev++; cpt.revFam[f] = (cpt.revFam[f] || 0) + 1; }
    // séquence globale (lots consécutifs compris)
    cpt.seq = (cpt.seq || []); cpt.seq.push(f);
    const s = cpt.seq, L = s.length;
    if (L >= 3 && s[L - 1] === s[L - 2] && s[L - 2] === s[L - 3]) { cpt.triples++; if (i >= 2) cpt.triplesLots++; }
  });
  if (opts.repondre) lot.forEach(q => J.questions.enregistrerReponse(q, J.Math.random() < opts.taux));
}

// sauvegarde « déjà bien jouée » : 70 % des fiches vues, boîtes variées, dates passées
function sauvegardeVue(J, rnd) {
  const e = J.sauvegarde.nouvelle();
  const tf = J.questions.toutesFiches();
  const maint = Date.now();
  Object.keys(tf).forEach(fid => {
    if (rnd() < 0.7) {
      const boite = 1 + Math.floor(rnd() * 5);
      const ilya = Math.floor(rnd() * 20);
      const d = new Date(maint - ilya * 86400000);
      e.notions[fid] = { boite: boite, vue: J.util.horodatage(d), ok: boite + 1, ko: rnd() < 0.3 ? 1 : 0 };
    }
  });
  return e;
}

function tableau(titre, cpt) {
  const lignes = [titre + " (" + cpt.n + " questions)"];
  FAMS.forEach(f => { if (cpt.fam[f]) lignes.push("  " + f.padEnd(16) + (100 * cpt.fam[f] / cpt.n).toFixed(1).padStart(5) + " %   à revoir : " + (100 * (cpt.revFam[f] || 0) / cpt.n).toFixed(1).padStart(5) + " %"); });
  const fr = ["litterature", "lecture", "langue"].map(m => m + " " + (100 * (cpt.mat[m] || 0) / cpt.n).toFixed(1) + " %").join(", ");
  lignes.push("  dont Français : " + fr);
  lignes.push("  à revoir (toutes familles) : " + (100 * cpt.rev / cpt.n).toFixed(1) + " % ; rappels : " + cpt.rappels + " ; triples consécutifs : " + cpt.triples + " (dont dans un même lot : " + cpt.triplesLots + ")");
  return lignes.join("\n");
}

const SCEN = [
  { nom: "Bataille, sauvegarde neuve", partie: bataille, vue: false, repondre: false },
  { nom: "Bataille, notions déjà vues", partie: bataille, vue: true, repondre: false },
  { nom: "Conseil (vrai_faux), sauvegarde neuve", partie: conseil, vue: false, repondre: false },
  { nom: "Conseil (vrai_faux), notions déjà vues", partie: conseil, vue: true, repondre: false },
  { nom: "Événement (3), sauvegarde neuve", partie: evenement, vue: false, repondre: false },
  { nom: "Événement (3), notions déjà vues", partie: evenement, vue: true, repondre: false },
  { nom: "Jeu suivi (batailles, conseils, événements, réponses justes à 70 %), sauvegarde neuve", partie: "mix", vue: false, repondre: true },
  { nom: "Jeu suivi, notions déjà vues", partie: "mix", vue: true, repondre: true }
];

function mesurerFamilles(N) {
  const t0 = Date.now();
  const tempsTirage = [];
  SCEN.forEach((s, k) => {
    const cpt = nouveauCompte();
    for (let g = 0; g < 4; g++) {
      const ctx = contexte(1000 * k + g + 1);
      const J = ctx.JEU; J.Math = ctx.Math;
      const rnd = graine(77 + g);
      J.sauvegarde.remplacer(s.vue ? sauvegardeVue(J, rnd) : J.sauvegarde.nouvelle());
      J.progression.oublier();
      const opts = { repondre: s.repondre, taux: 0.7 };
      for (let i = 0; i < N / 4; i++) {
        const debut = process.hrtime.bigint();
        if (s.partie === "mix") { const r = i % 4; if (r === 0 || r === 1) bataille(J, cpt, opts); else if (r === 2) conseil(J, cpt, opts); else evenement(J, cpt, opts); }
        else s.partie(J, cpt, opts);
        tempsTirage.push(Number(process.hrtime.bigint() - debut) / 1e6);
        if (!s.vue && !s.repondre) { J.sauvegarde.remplacer(J.sauvegarde.nouvelle()); }
      }
    }
    console.log(tableau(s.nom, cpt) + "\n");
  });
  tempsTirage.sort((a, b) => a - b);
  console.log("Durée d'une partie complète de tirages (ms) : médiane " + tempsTirage[Math.floor(tempsTirage.length / 2)].toFixed(2) + ", max " + tempsTirage[tempsTirage.length - 1].toFixed(2) + " ; total " + (Date.now() - t0) + " ms");
}

// ---------- 2. répétitions sur des séances de 100 questions ----------
// Élèves simulés : probabilité de répondre juste aux niveaux 1, 2 et 3 (mêmes profils que la mesure du niveau conseillé,
// docs/JOURNAL.md, 15/10/2026).
const PROFILS = [
  { nom: "élève moyen", p: [0.88, 0.75, 0.55] },
  { nom: "élève fort", p: [0.95, 0.88, 0.75] },
  { nom: "élève en difficulté", p: [0.75, 0.60, 0.40] }
];
const LONGUEUR = 100;

// Une séance : le jeu vient d'être ouvert. L'événement du jour (3 questions), puis bataille, bataille, conseil, et ainsi
// de suite jusqu'à 100 questions (la dernière partie est quittée en route). Chaque partie suit sa boucle du jeu : une
// bataille tire 3 questions au début de chaque vague (jeu/js/bataille.js), le conseil 8 vrai ou faux d'un coup
// (conseil.js), l'événement les siennes (campagne.js) ; après une erreur, les questions qui restent sont replacées
// (rappels.replacer), si bien que les « Seconde chance » reviennent à leur place.
function jouerSeance(J, rnd, p, temps) {
  const seq = [];
  const Q = J.questions;
  let partie = "";
  const fini = () => seq.length >= LONGUEUR;
  const tirer = f => { const t0 = process.hrtime.bigint(); const r = f(); temps.push(Number(process.hrtime.bigint() - t0) / 1e6); return r; };
  const enBataille = f => (Q.avecNiveaux ? Q.avecNiveaux(Q.NIVEAUX_BATAILLE, f) : f());
  const aRevoir = new Set(J.progression.fichesARevoir());
  function repondre(q) {
    const conseille = Q.niveauConseille();
    const juste = rnd() < p[q.niveau - 1];
    Q.enregistrerReponse(q, juste);
    seq.push({ id: q.id, fiche: q.fiche, rappel: !!q.rappel, niveau: q.niveau, conseille: conseille, juste: juste, partie: partie, aRevoir: aRevoir.has(q.fiche) });
    return juste;
  }
  function suiteSimple(qs, opts) {
    for (let i = 0; i < qs.length && !fini(); ) {
      const juste = repondre(qs[i]);
      i++;
      if (!juste) J.rappels.replacer(qs, i, qs.length, opts);
    }
  }
  function bataille() {
    partie = "bataille";
    const tirerQuestions = (n, posees) => {
      const ids = posees.map(q => q.id), fiches = posees.map(q => q.fiche);
      return tirer(() => enBataille(() => J.recit.suite(n, { exclure: ids, filtre: q => fiches.indexOf(q.fiche) < 0, completer: true })));
    };
    let questions = tirerQuestions(3, []), iQ = 0;
    for (let v = 0; v < 4 && !fini(); v++) {
      const poseesVague = iQ;
      if (v > 0) questions = questions.concat(tirerQuestions(3, questions));
      while (iQ < Math.min(questions.length, poseesVague + 3) && !fini()) {
        const juste = repondre(questions[iQ]);
        iQ++;
        if (!juste) enBataille(() => J.rappels.replacer(questions, iQ, poseesVague + 3));
      }
    }
  }
  function conseil() {
    partie = "conseil";
    suiteSimple(tirer(() => J.recit.suite(8, { types: ["vrai_faux"] })), { types: ["vrai_faux"] });
  }
  function evenement() {
    partie = "evenement";
    suiteSimple(tirer(() => J.recit.suite(3)));
  }
  evenement();
  while (!fini()) { bataille(); if (!fini()) bataille(); if (!fini()) conseil(); }
  return seq;
}

// Compte d'une séance. tout : toutes les questions posées depuis la sauvegarde neuve (séances précédentes comprises),
// la séance étudiée à la fin, à partir de l'indice debut.
function compterSeance(tout, debut) {
  const r = { n: 0, rappels: 0, repSeance: 0, rep60: 0, fiche10: 0, distinctes: 0, justes: 0, aRevoir: 0, aRevoirApres2: 0,
    niv: { bataille: [0, 0, 0], autre: [0, 0, 0] }, conseilleBataille: 0, nivBataille: 0, nb: 0, na: 0, maxQuestion: 0, maxFiche: 0 };
  const vuesSeance = {}, parQuestion = {}, parFiche = {}, justesFiche = {};
  for (let i = debut; i < tout.length; i++) {
    const x = tout[i];
    r.n++; if (x.juste) r.justes++;
    // niveaux : questions ordinaires seulement (une « Seconde chance » garde le niveau de la question ratée)
    if (x.rappel) { /* rien */ } else if (x.partie === "bataille") { r.niv.bataille[x.niveau - 1]++; r.conseilleBataille += x.conseille; r.nivBataille += x.niveau; r.nb++; }
    else { r.niv.autre[x.niveau - 1]++; r.na++; }
    if (x.aRevoir) { r.aRevoir++; if (!x.rappel && (justesFiche[x.fiche] || 0) >= 2) r.aRevoirApres2++; }
    if (x.juste) justesFiche[x.fiche] = (justesFiche[x.fiche] || 0) + 1;
    parFiche[x.fiche] = (parFiche[x.fiche] || 0) + 1;
    if (x.rappel) { r.rappels++; vuesSeance[x.id] = true; continue; }
    parQuestion[x.id] = (parQuestion[x.id] || 0) + 1;
    if (vuesSeance[x.id]) r.repSeance++;
    vuesSeance[x.id] = true;
    for (let k = Math.max(0, i - 60); k < i; k++) if (tout[k].id === x.id) { r.rep60++; break; }
    for (let k = Math.max(0, i - 10); k < i; k++) if (tout[k].fiche === x.fiche) { r.fiche10++; break; }
  }
  r.distinctes = Object.keys(vuesSeance).length;
  r.maxQuestion = Math.max(0, ...Object.values(parQuestion));
  r.maxFiche = Math.max(0, ...Object.values(parFiche));
  return r;
}

const G_REP = parseInt(option("graines", "16"), 10), S_REP = parseInt(option("seances", "6"), 10);
function mesurerRepetitions(dossierJs, version) {
  const G = G_REP, S = S_REP;
  const t0 = Date.now(), temps = [];
  const lignes = [];
  PROFILS.forEach((profil, ip) => {
    const parSeance = Array.from({ length: S }, () => []);
    for (let g = 0; g < G; g++) {
      const stock = {}, tout = [];
      const rnd = graine(7919 * (g + 1) + ip);
      for (let s = 0; s < S; s++) {
        const ctx = contexte(100003 * (g + 1) + 101 * s + ip, stock, s, dossierJs); // le jeu rouvert, un jour plus tard
        const J = ctx.JEU;
        if (s === 0) { J.sauvegarde.remplacer(J.sauvegarde.nouvelle()); J.sauvegarde.enregistrer(); }
        const debut = tout.length;
        jouerSeance(J, rnd, profil.p, temps).forEach(x => tout.push(x));
        parSeance[s].push(compterSeance(tout, debut));
      }
    }
    [0, S - 1].forEach(s => {
      const R = parSeance[s], moy = f => R.reduce((a, r) => a + f(r), 0) / R.length;
      const nb = moy(r => r.nb) || 1, autres = moy(r => r.na) || 1;
      const pc = (x, d) => Math.round(100 * x / d);
      lignes.push({
        profil: profil.nom, seance: s === 0 ? "sauvegarde neuve" : "après " + s + (s > 1 ? " séances" : " séance"), version: version,
        repSeance: moy(r => r.repSeance), rep60: moy(r => r.rep60), fiche10: moy(r => r.fiche10), rappels: moy(r => r.rappels),
        distinctes: moy(r => r.distinctes), maxQuestion: Math.max(...R.map(r => r.maxQuestion)), maxFiche: moy(r => r.maxFiche),
        aRevoir: moy(r => r.aRevoir), aRevoirApres2: moy(r => r.aRevoirApres2),
        reussite: pc(moy(r => r.justes), moy(r => r.n)),
        nivB: [0, 1, 2].map(k => pc(moy(r => r.niv.bataille[k]), nb)), nivA: [0, 1].map(k => pc(moy(r => r.niv.autre[k]), autres)),
        nivMoyen: moy(r => r.nivBataille) / nb, conseille: moy(r => r.conseilleBataille) / nb
      });
    });
  });
  temps.sort((a, b) => a - b);
  return { lignes: lignes, temps: temps, duree: Date.now() - t0 };
}

function afficherRepetitions(mesures) {
  const f1 = x => x.toFixed(1).replace(".", ",");
  console.log("Répétitions sur des séances de " + LONGUEUR + " questions (" + G_REP + " élèves simulés par profil, moyennes par séance ; 1re séance avec une sauvegarde neuve, " + S_REP + "e après " + (S_REP - 1) + " séances)\n");
  console.log("| Élève | Séance | Version | Reposées à moins de 60 questions (hors Seconde chance) | Reposées dans la séance (plus de 60 questions après comprises) | Même notion 2 fois en 10 questions | Notion la plus posée (fois, Seconde chance comprises) | Questions différentes | Seconde chance | Notions à revoir posées (dont après 2 réussites dans la séance) | Réussite | Bataille : niveaux 1 / 2 / 3 (hors Seconde chance) | Bataille : niveau moyen / conseillé | Conseil et événement : niveaux 1 / 2 |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  const n = mesures[0].lignes.length;
  for (let i = 0; i < n; i++) mesures.forEach((m, k) => {
    const l = m.lignes[i];
    console.log("| " + [k ? "" : l.profil, k ? "" : l.seance, l.version, f1(l.rep60), f1(l.repSeance), f1(l.fiche10), f1(l.maxFiche), f1(l.distinctes), f1(l.rappels),
      f1(l.aRevoir) + " (" + f1(l.aRevoirApres2) + ")", l.reussite + " %", l.nivB.join(" / ") + " %", f1(l.nivMoyen) + " / " + f1(l.conseille), l.nivA.join(" / ") + " %"].join(" | ") + " |");
  });
  mesures.forEach(m => {
    const t = m.temps;
    console.log("\nDurée d'un tirage de lot (" + m.lignes[0].version + ", ms, dans le bac à sable vm de Node) : médiane " + t[Math.floor(t.length / 2)].toFixed(2) + ", 99e centile " + t[Math.floor(t.length * 0.99)].toFixed(2) +
      ", max " + t[t.length - 1].toFixed(2) + " (le premier tirage d'une séance prépare toutes les questions) ; mesure en " + m.duree + " ms");
  });
}

// ---------- 3. expéditions : la part de la semaine (cahier 17.4) ----------
// Le jeu chargé hors bac à sable (new Function, comme atelier/outils/simuler-bataille.js : les durées de tirage sont
// celles d'un vrai moteur JavaScript, pas celles d'un contexte vm), avec les modules de la route, toutes les données et
// tous les fichiers de cours des dossiers jeu/data/cours et jeu/data/anglais, indexés ou non.
const MODULES_EXPEDITION = MODULES.concat(["bataille-moteur", "cartes-bataille", "campagne", "expedition"]);
function contexteDirect(seed, stock, jours) {
  stock = stock || {};
  const MathR = Object.create(Math); MathR.random = graine(seed);
  const D = jours ? dateDecalee(jours) : Date;
  const fen = { console, Math: MathR, Date: D, localStorage: { getItem: k => (k in stock ? stock[k] : null), setItem: (k, v) => { stock[k] = String(v); }, removeItem: k => { delete stock[k]; } } };
  fen.window = fen; fen.globalThis = fen;
  MODULES_EXPEDITION.forEach(m => new Function("window", "globalThis", "Math", "Date", fs.readFileSync(path.join(DOSSIER_JS, m + ".js"), "utf8"))(fen, fen, MathR, D));
  const donnee = f => new Function("JEU", fs.readFileSync(f, "utf8"))(fen.JEU);
  ["config", "planning", "devoirs", "index-cours", "a-retravailler", "suivi"].forEach(f => donnee(path.join(RACINE, "jeu", "data", f + ".js")));
  ["cours", "anglais"].forEach(d => fs.readdirSync(path.join(RACINE, "jeu", "data", d)).filter(f => /\.js$/.test(f)).sort().forEach(f => donnee(path.join(RACINE, "jeu", "data", d, f))));
  fen.JEU.sauvegarde.charger();
  fen.JEU.Math = MathR;
  return fen;
}

const DEPARTS = option("departs", "1,6").split(",").map(Number);
const FRONT_EXP = option("front", "angleterre");
const G_EXP = parseInt(option("graines", "8"), 10);

// Une séance sur la route : l'expédition en cours est reprise (ou une nouvelle part du relais « depart »), puis les haltes
// s'enchaînent comme dans le jeu jusqu'à LONGUEUR questions (la halte en cours est finie). Chaque réponse passe par
// JEU.questions.enregistrerReponse et JEU.expedition.noterReponse, comme à l'écran. Les batailles sont tenues (éclatante
// deux fois sur cinq) : les vivres ne sont pas l'objet de la mesure. Rend la suite des questions posées, avec pour chacune
// le genre de lot (semaine : lot soumis au quota de l'acte ; porte, marchand, archives, veillee : quota propre), le quota de
// l'acte, et si la question vient de la fenêtre de l'acte.
function jouerSeanceExpedition(J, rnd, p, temps, depart, compte) {
  const X = J.expedition, Q = J.questions, seq = [];
  const fini = () => seq.length >= LONGUEUR;
  let acte = null, genre = "semaine", premier = true;
  const tirer = f => {
    const t0 = process.hrtime.bigint(); const r = f(); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    temps.push({ ms: ms, quota: !!(acte && acte.quota) && (genre === "semaine"), premier: premier }); premier = false;
    return r;
  };
  const enBataille = f => Q.avecNiveaux(Q.NIVEAUX_BATAILLE, f);
  const aRevoir = new Set(J.progression.fichesARevoir());
  function repondre(q, partie) {
    const conseille = Q.niveauConseille();
    const juste = rnd() < p[q.niveau - 1];
    Q.enregistrerReponse(q, juste);
    X.noterReponse(q, juste);
    const s = X.semaineDe(q.cours);
    seq.push({ id: q.id, fiche: q.fiche, rappel: !!q.rappel, niveau: q.niveau, conseille: conseille, juste: juste, partie: partie, aRevoir: aRevoir.has(q.fiche),
      genre: genre, quota: acte ? acte.quota : 0, semaine: acte ? acte.semaine : null, fenetre: !!(acte && acte.semaines.indexOf(s) >= 0), famille: FAMILLE[q.matiere] || q.matiere, matiere: q.matiere });
    return juste;
  }
  // un lot hors bataille : répondu dans l'ordre, les questions restantes replacées après une erreur (Seconde chance)
  function lot(qs, partie) {
    let bonnes = 0;
    for (let i = 0; i < qs.length; ) { const juste = repondre(qs[i], partie); if (juste) bonnes++; i++; if (!juste) J.rappels.replacer(qs, i, qs.length); }
    return bonnes;
  }
  function bataille(h) {
    const vagues = h.vagues || X.EXP.HALTES[h.type].vagues;
    let questions = tirer(() => X.tirage(3, [], h)), iQ = 0, bonnes = 0;
    X.marquerEntamee(h.id);
    for (let v = 0; v < vagues; v++) {
      const debutVague = iQ;
      if (v > 0) questions = questions.concat(tirer(() => X.tirage(3, questions, h)));
      while (iQ < Math.min(questions.length, debutVague + 3)) {
        const juste = repondre(questions[iQ], "bataille"); if (juste) bonnes++;
        iQ++;
        if (!juste) enBataille(() => J.rappels.replacer(questions, iQ, debutVague + 3));
      }
    }
    compte.batailles++;
    return X.apresBataille(h, { issue: rnd() < 0.4 ? "victoire" : "tenu", degatsRival: 0, bonnes: bonnes, total: iQ });
  }
  function porte(res) {
    if (!res || !res.porte) return;
    genre = "porte";
    const q = tirer(() => X.tirage(1, [], { type: "porte", famille: res.porte.conseiller }));
    const juste = lot(q, "autre") > 0;
    genre = "semaine";
    const offre = X.offrirFaveurs(res.porte, juste, res.porte.eclatante);
    if (offre && offre.cartes.length) X.prendreFaveur(offre.cartes[Math.floor(rnd() * offre.cartes.length)].id);
    compte.portes++;
  }
  function halte(h) {
    compte.haltes[h.type] = (compte.haltes[h.type] || 0) + 1;
    if (X.EXP.BATAILLES.indexOf(h.type) >= 0) { porte(bataille(h)); return; }
    if (h.type === "evenement") {
      const ev = h.ev, def = J.campagne.EVENEMENTS.filter(e => e.id === ev)[0];
      const n = def ? def.questions : X.EXP.QUESTIONS.archives;
      genre = ev === "archives" ? "archives" : "semaine";
      const bonnes = lot(tirer(() => X.tirage(n, [], h)), "autre");
      genre = "semaine";
      X.cloturerEvenement(h.id, ev, bonnes, n);
      return;
    }
    if (h.type === "marchand") {
      genre = "marchand";
      const juste = lot(tirer(() => X.tirage(1, [], { type: "marchand" })), "autre") > 0;
      genre = "semaine";
      X.ouvrirEtal(h.id, juste);
      X.fermerEtal(h.id);
      return;
    }
    if (h.type === "bivouac") {
      if (rnd() < 0.3) { X.bivouac("repos"); return; }
      X.bivouac("veillee");
      genre = "veillee";
      const bonnes = lot(tirer(() => X.tirage(X.EXP.QUESTIONS.bivouac, [], { type: "veillee" })), "autre");
      genre = "semaine";
      const r = X.finirVeillee(bonnes, X.EXP.QUESTIONS.bivouac);
      if (r && r.affinables.length) X.affiner(r.affinables[0].id);
      return;
    }
    X.terminerHalte(h.id);
  }
  X.reprendre();
  while (!fini()) {
    let e = X.enCours();
    if (!e) { e = X.commencer(depart, FRONT_EXP); compte.expeditions++; if (!e) break; if (e.offre) X.prendreFaveur(e.offre.cartes[0].id); }
    acte = X.acteCourant(e);
    const att = X.atteignables();
    if (!att.length) { X.finir("abandon"); continue; }
    const h = att[Math.floor(rnd() * att.length)];
    X.entrer(h.id);
    halte(h);
    if (!X.enCours()) compte.accomplies++;
  }
  return seq;
}

// Compte des questions d'un élève sur la route (toutes séances confondues), en plus de compterSeance.
function compterRoute(seq) {
  const r = { n: 0, fam: {}, quota: { 2: { n: 0, fen: 0, nSansRappel: 0, fenSansRappel: 0 }, 1: { n: 0, fen: 0, nSansRappel: 0, fenSansRappel: 0 }, 0: { n: 0, fen: 0, nSansRappel: 0, fenSansRappel: 0 } }, genres: {}, semaineN: 0, semaineARevoir: 0, veilleeARevoir: 0, veillees: 0 };
  seq.forEach(x => {
    r.n++; r.fam[x.famille] = (r.fam[x.famille] || 0) + 1; r.genres[x.genre] = (r.genres[x.genre] || 0) + 1;
    if (x.genre === "semaine") { const q = r.quota[Math.min(2, x.quota)]; q.n++; if (x.fenetre) q.fen++; if (!x.rappel) { q.nSansRappel++; if (x.fenetre) q.fenSansRappel++; r.semaineN++; if (x.aRevoir) r.semaineARevoir++; } }
    if (x.genre === "veillee" && !x.rappel) { r.veillees++; if (x.aRevoir) r.veilleeARevoir++; }
  });
  return r;
}

function mesurerExpeditions() {
  const t0 = Date.now(), S = S_REP, G = G_EXP;
  const resultats = [], temps = [];
  DEPARTS.forEach(depart => PROFILS.forEach((profil, ip) => {
    const parSeance = Array.from({ length: S }, () => []), routes = [], comptes = [], partsARevoir = [];
    for (let g = 0; g < G; g++) {
      const stock = {}, tout = [], compte = { expeditions: 0, accomplies: 0, batailles: 0, portes: 0, haltes: {} };
      const rnd = graine(104729 * (g + 1) + 7 * ip + depart);
      for (let s = 0; s < S; s++) {
        const J = contexteDirect(200003 * (g + 1) + 101 * s + ip + 13 * depart, stock, s).JEU; // le jeu rouvert, un jour plus tard
        if (s === 0) { J.sauvegarde.remplacer(J.sauvegarde.nouvelle()); J.sauvegarde.enregistrer(); }
        const cands = J.recit.candidats(), aRev = new Set(J.progression.fichesARevoir()), X = J.expedition;
        const semaines = X.semainesDepuis(depart, X.reglages().semaines), dedans = cands.filter(c => semaines.indexOf(X.semaineDe(c.cours)) >= 0);
        const part = L => (L.length ? L.filter(c => aRev.has(c.fiche)).length / L.length : 0), q = X.reglages().questionsSemaine / 3;
        partsARevoir.push({ toutes: part(cands), fenetre: part(dedans), attendue: q * part(dedans) + (1 - q) * part(cands) });
        const debut = tout.length;
        jouerSeanceExpedition(J, rnd, profil.p, temps, depart, compte).forEach(x => tout.push(x));
        parSeance[s].push(compterSeance(tout, debut));
      }
      routes.push(compterRoute(tout)); comptes.push(compte);
    }
    const moy = (R, f) => R.reduce((a, r) => a + f(r), 0) / R.length;
    const somme = (R, f) => R.reduce((a, r) => a + f(r), 0);
    const toutes = [].concat(...parSeance);
    const n = somme(routes, r => r.n);
    const fams = {}; routes.forEach(r => Object.keys(r.fam).forEach(f => { fams[f] = (fams[f] || 0) + r.fam[f]; }));
    const quota = {}; [2, 1, 0].forEach(k => { const q = { n: somme(routes, r => r.quota[k].n), fen: somme(routes, r => r.quota[k].fen), ns: somme(routes, r => r.quota[k].nSansRappel), fs: somme(routes, r => r.quota[k].fenSansRappel) }; quota[k] = q; });
    const aRevoirPosees = somme(toutes, r => r.aRevoir) / Math.max(1, somme(toutes, r => r.n)), aRevoirPart = partsARevoir.reduce((a, x) => a + x.toutes, 0) / partsARevoir.length;
    const aRevoirFenetre = partsARevoir.reduce((a, x) => a + x.fenetre, 0) / partsARevoir.length, aRevoirAttendue = partsARevoir.reduce((a, x) => a + x.attendue, 0) / partsARevoir.length;
    const aRevoirSemaine = somme(routes, r => r.semaineARevoir) / Math.max(1, somme(routes, r => r.semaineN));
    resultats.push({
      depart: depart, profil: profil.nom, n: n, questionsParSeance: somme(toutes, r => r.n) / toutes.length,
      quota: quota, fams: Object.keys(fams).sort().map(f => ({ famille: f, part: 100 * fams[f] / n })),
      aRevoirPosees: 100 * aRevoirPosees, aRevoirPart: 100 * aRevoirPart, ratioARevoir: aRevoirPart ? aRevoirPosees / aRevoirPart : null,
      aRevoirFenetre: 100 * aRevoirFenetre, aRevoirAttendue: 100 * aRevoirAttendue, aRevoirSemaine: 100 * aRevoirSemaine, ratioSemaine: aRevoirAttendue ? aRevoirSemaine / aRevoirAttendue : null,
      veilleeARevoir: somme(routes, r => r.veilleeARevoir), veillees: somme(routes, r => r.veillees),
      rep60: moy(toutes, r => r.rep60), fiche10: moy(toutes, r => r.fiche10), rappels: moy(toutes, r => r.rappels), maxFiche: moy(toutes, r => r.maxFiche),
      reussite: 100 * somme(toutes, r => r.justes) / Math.max(1, somme(toutes, r => r.n)),
      expeditions: somme(comptes, c => c.expeditions), accomplies: somme(comptes, c => c.accomplies), batailles: somme(comptes, c => c.batailles), portes: somme(comptes, c => c.portes),
      haltes: comptes.reduce((a, c) => { Object.keys(c.haltes).forEach(k => { a[k] = (a[k] || 0) + c.haltes[k]; }); return a; }, {})
    });
  }));
  const f1 = x => (x === null || x === undefined ? "—" : x.toFixed(1).replace(".", ","));
  const pcq = q => (q.n ? Math.round(100 * q.fen / q.n) + " % (" + (q.ns ? Math.round(100 * q.fs / q.ns) : 0) + " % hors Seconde chance ; " + q.n + " questions)" : "—");
  console.log("Expéditions simulées (" + G + " élèves simulés par profil et par départ, " + S + " séances d'environ " + LONGUEUR + " questions chacune, le jeu rouvert un jour plus tard à chaque séance ; haltes au hasard, batailles tenues, veillée au bivouac sept fois sur dix ; front " + FRONT_EXP + ")\n");
  console.log("| Départ | Élève | Questions | Fenêtre de l'acte, quota 2 (cible ≥ 60 %) | quota 1 (cible ≥ 30 %) | quota 0 | Familles (cible 12 à 30 % chacune) | À revoir dans les lots de semaine : posées / part attendue sans coup de pouce (cible 1,5 à 2 fois ; part des fiches à revoir dans les semaines de l'expédition, parmi toutes) | À revoir, toutes questions (archives et veillées comprises) | Veillée : à revoir | Reposées à moins de 60 (hors Seconde chance, par séance) | Même notion 2 fois en 10 (par séance) | Seconde chance (par séance) | Réussite | Expéditions commencées / accomplies | Haltes jouées |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  resultats.forEach(r => console.log("| S" + r.depart + " | " + r.profil + " | " + r.n + " | " + pcq(r.quota[2]) + " | " + pcq(r.quota[1]) + " | " + (r.quota[0].n ? r.quota[0].n + " questions" : "—") + " | " +
    r.fams.map(f => f.famille + " " + f1(f.part) + " %").join(", ") + " | " + f1(r.aRevoirSemaine) + " % / " + f1(r.aRevoirAttendue) + " % = ×" + (r.ratioSemaine === null ? "—" : r.ratioSemaine.toFixed(2).replace(".", ",")) + " (" + f1(r.aRevoirFenetre) + " % ; " + f1(r.aRevoirPart) + " %) | " +
    f1(r.aRevoirPosees) + " % = ×" + (r.ratioARevoir === null ? "—" : r.ratioARevoir.toFixed(2).replace(".", ",")) + " de leur part | " +
    (r.veillees ? Math.round(100 * r.veilleeARevoir / r.veillees) + " % de " + r.veillees : "—") + " | " + f1(r.rep60) + " | " + f1(r.fiche10) + " | " + f1(r.rappels) + " | " + Math.round(r.reussite) + " % | " + r.expeditions + " / " + r.accomplies + " | " +
    Object.keys(r.haltes).sort().map(k => k + " " + r.haltes[k]).join(", ") + " |"));
  const stats = T => { const t = T.map(x => x.ms).sort((a, b) => a - b); return t.length ? "médiane " + t[Math.floor(t.length / 2)].toFixed(2) + ", 99e centile " + t[Math.floor(t.length * 0.99)].toFixed(2) + ", max " + t[t.length - 1].toFixed(2) + " (" + t.length + " tirages)" : "—"; };
  console.log("\nDurée d'un tirage (ms, modules chargés hors bac à sable) : avec quota de semaine : " + stats(temps.filter(t => t.quota && !t.premier)) + " ; autres lots (porte, archives, veillée, marchand, acte sans quota) : " + stats(temps.filter(t => !t.quota && !t.premier)) +
    " ; premier tirage d'une séance (il prépare toutes les questions) : " + stats(temps.filter(t => t.premier)) + " ; mesure en " + (Date.now() - t0) + " ms");
}

// nombre de parties par situation : le premier nombre qui n'est pas la valeur d'une option (--graines 16 n'est pas N)
const AVEC_VALEUR = ["--graines", "--seances", "--js", "--avant", "--departs", "--front"];
const N = +(ARGS.find((a, i) => /^\d+$/.test(a) && AVEC_VALEUR.indexOf(ARGS[i - 1]) < 0) || 200);
if (ARGS.indexOf("--expedition") >= 0) { mesurerExpeditions(); process.exit(0); }
if (ARGS.indexOf("--repetitions") < 0) mesurerFamilles(N);
if (ARGS.indexOf("--familles") < 0) {
  if (ARGS.indexOf("--repetitions") < 0) console.log("");
  const avant = option("avant", null);
  const mesures = [];
  if (avant) mesures.push(mesurerRepetitions(avant, "avant"));
  mesures.push(mesurerRepetitions(DOSSIER_JS, avant ? "après" : path.relative(RACINE, DOSSIER_JS) || "jeu/js"));
  afficherRepetitions(mesures);
}
