// Mesure de la répartition des questions par famille de matières : le vrai tirage du jeu (JEU.recit.suite), avec les
// vrais cours, suivi.js et a-retravailler.js. Batailles (4 vagues de 3), conseils (8 vrai ou faux), événements (3),
// avec une sauvegarde neuve ou des notions déjà vues, sans répondre ou en répondant juste 7 fois sur 10.
// Usage : node atelier/outils/mesurer-tirage.js [nombre de parties par situation, 200 par défaut]
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const RACINE = path.join(__dirname, "..", "..");

// hasard reproductible (mulberry32)
function graine(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function contexte(seed) {
  const stock = {};
  const MathR = Object.create(Math); MathR.random = graine(seed);
  const ctx = { console, Buffer, Math: MathR, Date, btoa: globalThis.btoa, atob: globalThis.atob,
    localStorage: { getItem: k => (k in stock ? stock[k] : null), setItem: (k, v) => { stock[k] = String(v); }, removeItem: k => { delete stock[k]; } } };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  ["noyau", "brouillage", "calendrier", "sauvegarde", "leitner", "progression", "questions", "rappels", "recit"].forEach(m => {
    vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "js", m + ".js"), "utf8"), ctx, { filename: m + ".js" });
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

const N = +(process.argv[2] || 200);
const t0 = Date.now();
let tempsTirage = [];
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
