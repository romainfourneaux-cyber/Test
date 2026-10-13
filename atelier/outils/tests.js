// Tests de logique (Node) : calendrier, états des cours, Leitner, brouillage, migration, campagne et moteur de bataille.
// Usage : node atelier/outils/tests.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const RACINE = path.join(__dirname, "..", "..");

function contexte() {
  const stock = {};
  const ctx = { console, Buffer, btoa: globalThis.btoa, atob: globalThis.atob,
    localStorage: { getItem: k => (k in stock ? stock[k] : null), setItem: (k, v) => { stock[k] = String(v); }, removeItem: k => { delete stock[k]; } } };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  ["noyau", "brouillage", "calendrier", "sauvegarde", "leitner", "progression", "questions", "recit", "bataille-moteur", "cartes-bataille", "campagne"].forEach(m => {
    vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "js", m + ".js"), "utf8"), ctx, { filename: m + ".js" });
  });
  ["config", "planning", "devoirs", "suivi"].forEach(f => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", f + ".js"), "utf8"), ctx));
  return ctx;
}

let ok = 0, ko = 0;
function verifier(nom, cond, detail) {
  if (cond) { ok++; console.log("OK     " + nom); }
  else { ko++; console.log("ÉCHEC  " + nom + (detail !== undefined ? " → " + JSON.stringify(detail) : "")); }
}

const J = contexte().JEU;
const D = (s) => J.util.lireDate(s);

// calendrier
verifier("S1 le lundi 31/08/2026", J.calendrier.semaine(D("2026-08-31")).numero === 1);
verifier("S7 le 13/10/2026", J.calendrier.semaine(D("2026-10-13")).numero === 7);
verifier("S7 du 12 au 18 octobre", J.calendrier.semaine(D("2026-10-18")).numero === 7 && J.calendrier.semaine(D("2026-10-19")).numero === 8);
verifier("S34 le 19/04/2027", J.calendrier.semaine(D("2027-04-19")).numero === 34);
const apres = J.calendrier.semaine(D("2027-06-15"));
verifier("S34 conservée au-delà, révision libre", apres.numero === 34 && apres.revisionLibre === true, apres.numero);
verifier("Libellé S7", J.calendrier.libelle(J.calendrier.semaine(D("2026-10-13"))) === "Semaine 7 · du 12 au 18 octobre 2026", J.calendrier.libelle(J.calendrier.semaine(D("2026-10-13"))));
const cfgPause = Object.assign({}, J.donnees.config, { pauses: ["2026-10-19"] });
verifier("Une pause garde le numéro puis décale", J.calendrier.semaine(D("2026-10-20"), cfgPause).numero === 7 && J.calendrier.semaine(D("2026-10-27"), cfgPause).numero === 8);

// états des cours : estimés par le chroniqueur (data/suivi.js), plus d'épreuve de validation
J.sauvegarde.charger();
const etat = J.sauvegarde.etat();
J.donnees.cours["histoire-s07-2"] = { id: "histoire-s07-2", fiches: [{ id: "histoire-s07-2-f1" }], questions: [] };
J.donnees.cours["histoire-s08-1"] = { id: "histoire-s08-1", fiches: [], questions: [] };
J.progression.oublier();
verifier("Cours de S1 à S6 présumé acquis", J.progression.etatCours("histoire-s01-1", etat) === "presume");
verifier("Cours avec fichier : en cours", J.progression.etatCours("histoire-s07-2", etat) === "ouvert" && J.progression.etatCours("histoire-s08-1", etat) === "ouvert");
verifier("Cours sans fichier : dans la brume", J.progression.etatCours("geographie-s07-1", etat) === "brume");
J.donnees.suivi = { cours: { "histoire-s07-2": { etat: "a-revoir", note: "test" }, "histoire-s08-1": { etat: "acquis" } } };
J.progression.oublier();
verifier("Le suivi du chroniqueur fixe acquis et à revoir", J.progression.etatCours("histoire-s07-2", etat) === "a-revoir" && J.progression.etatCours("histoire-s08-1", etat) === "acquis");
verifier("Les fiches d'un cours à revoir sortent en priorité", J.progression.fichesARevoir().indexOf("histoire-s07-2-f1") >= 0);
etat.cours["histoire-s08-2"] = { etat: "valide", le: "2026-10-01T10:00:00", score: 1 };
J.progression.oublier();
verifier("Un cours validé par une ancienne épreuve reste acquis", J.progression.etatCours("histoire-s08-2", etat) === "acquis");
delete etat.cours["histoire-s08-2"];
J.donnees.suivi = { cours: {} };
J.progression.oublier();

// Leitner
const e2 = J.sauvegarde.nouvelle();
J.leitner.noter(e2, "x-f1", true, D("2026-10-13T10:00:00"));
verifier("Bonne réponse : boîte 2", e2.notions["x-f1"].boite === 2);
for (let i = 0; i < 5; i++) J.leitner.noter(e2, "x-f1", true, D("2026-10-13T10:00:00"));
verifier("Plafond à la boîte 5", e2.notions["x-f1"].boite === 5);
verifier("Boîte 5 : à revoir après 16 jours", !J.leitner.aRevoir(e2.notions["x-f1"], D("2026-10-28T10:00:00")) && J.leitner.aRevoir(e2.notions["x-f1"], D("2026-10-29T10:00:00")));
J.leitner.noter(e2, "x-f1", false, D("2026-10-13T10:00:00"));
verifier("Erreur : retour en boîte 1, rien d'autre de perdu", e2.notions["x-f1"].boite === 1 && e2.notions["x-f1"].ok === 6 && e2.notions["x-f1"].ko === 1);
const cands = Array.from({ length: 20 }, (_, i) => ({ fiche: "c-f" + i, cours: "c", recent: i }));
const t = J.leitner.tirer(cands, e2, 10, {});
verifier("Tirage : 10 notions distinctes", t.length === 10 && new Set(t.map(x => x.fiche)).size === 10);

// brouillage aller-retour, et identité des deux copies
const textes = ["Tracer l'axe du temps", JSON.stringify({ vrai: false, correction: "Faux : élève, œuvre, « guillemets » — 50 %" }), JSON.stringify([[0, 1], [2, 3]])];
verifier("Brouillage aller-retour", textes.every(s => J.debrouiller(J.brouiller(s)) === s));
verifier("Le texte brouillé ne contient plus la réponse", !J.brouiller("Tracer l'axe du temps").includes("axe"));
const atelier = require("./brouillage.js");
verifier("Même brouillage côté jeu et côté atelier", atelier.brouiller(textes[1]) === J.brouiller(textes[1]));

// migration d'une sauvegarde de schéma 1
const v1 = {
  schema: 1, creeLe: "2026-10-13T18:00:00", majLe: "2026-10-13T18:30:00",
  cours: { "methode-frise": { etat: "valide", le: "2026-10-13T18:20:00", score: 0.875 } },
  notions: { "methode-frise-f1": { boite: 3, vue: "2026-10-13T18:20:00", ok: 3, ko: 1 } },
  ressources: { sceaux: 12, routes: 0, remedes: 4, alambics: 2, parchemins: 0, alliances: 0 },
  batiments: ["tour-de-guet"], devoirs: { "histoire-d1": { envoye: "2026-11-06" } },
  signalements: [{ le: "2026-10-13T18:25:00", question: "methode-frise-q3", motif: "clarte", texte: "?" }],
  dernierExport: null
};
const m = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v1)));
const conserve = ["cours", "notions", "ressources", "batiments", "devoirs", "signalements", "creeLe"].every(k => JSON.stringify(m[k]) === JSON.stringify(v1[k]));
verifier("Migration 1 → 3 : rien de perdu", conserve && m.schema === 3);
verifier("Migration 1 → 3 : campagne neuve et musique", m.campagne && m.campagne.conquises.length === 0 && m.campagne.arsenal.tours.archers === 1 && m.reglages.musique === true);
verifier("Migration 1 → 2 : nouveaux champs", m.reglages && m.reglages.son === true && m.stats.bonnes === 3 && m.stats.total === 4 && typeof m.questionsVues === "object");
const sansSchema = J.sauvegarde.migrer({ cours: {}, notions: {} });
verifier("Sauvegarde sans numéro de schéma traitée comme schéma 1", sansSchema.schema === 3 && sansSchema.ressources.sceaux === 0);

// export puis import : même partie
J.sauvegarde.remplacer(m);
const txt = J.sauvegarde.texteExport();
J.sauvegarde.importer(txt);
verifier("Export puis import : même partie", JSON.stringify(J.sauvegarde.etat()) === JSON.stringify(JSON.parse(txt)));

// migration 2 → 3 : la campagne s'ajoute, le reste ne bouge pas
const v2 = JSON.parse(JSON.stringify(m)); delete v2.campagne; v2.schema = 2; delete v2.reglages.musique;
const m3 = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v2)));
verifier("Migration 2 → 3 : rien de perdu", ["cours", "notions", "ressources", "batiments", "stats"].every(k => JSON.stringify(m3[k]) === JSON.stringify(v2[k])) && m3.schema === 3 && m3.campagne.provinces.gue.pv === 16);

// campagne : rien ne se perd, les coups portés restent, une victoire conquiert
J.sauvegarde.remplacer(J.sauvegarde.nouvelle());
const C = J.campagne, E = J.sauvegarde.etat();
E.ressources = { sceaux: 3, routes: 9, remedes: 0, alambics: 4, parchemins: 0, alliances: 0 };
verifier("Arsenal : débloquer la baliste prend 10 ressources aux réserves les plus fournies", C.ameliorerArsenal("tours", "baliste") && C.etat().arsenal.tours.baliste === 1 && C.totalRessources() === 6 && E.ressources.sceaux >= 1);
verifier("Arsenal : refus si les réserves manquent, sans rien retirer", !C.ameliorerArsenal("tours", "catapulte") && C.totalRessources() === 6);
const avantRes = JSON.stringify(E.ressources);
C.apresBataille({ lieu: "gue", issue: "retraite", degatsRival: 5 });
verifier("Retraite : les coups portés restent, aucune ressource perdue", C.etat().provinces.gue.pv === 11 && C.totalRessources() >= 6 && C.etat().conquises.length === 0);
C.apresBataille({ lieu: "gue", issue: "tenu", degatsRival: 11 });
verifier("Château à zéro : la province est conquise", C.etat().conquises.indexOf("gue") >= 0 && C.prochaineProvince().province.id === "foret");
C.etat().rival.attaque = "omeyyades";
const avantDef = C.totalRessources();
C.apresBataille({ lieu: "domaine", issue: "retraite", degatsRival: 0 });
verifier("Défense ratée : rien de perdu, l'adversaire campe encore", C.etat().rival.attaque === "omeyyades" && C.totalRessources() === avantDef && C.etat().conquises.length === 1);
C.etat().dernierJour = "2026-10-12";
const nj = C.nouveauJour(D("2026-10-14T09:00:00"));
verifier("Nouveau jour : tribut des provinces conquises", nj && nj.tributs.routes === 2);
verifier("Nouveau jour : pas de second tribut le même jour", C.nouveauJour(D("2026-10-14T18:00:00")) === null);
const jauges0 = JSON.stringify(C.etat().royaume);
verifier("Les jauges du royaume partent de zéro et donnent des bonus", JSON.parse(jauges0).tresor === 0 && C.options(0).orDepart === 60);
C.etat().royaume.tresor = 30; C.etat().royaume.garde = 4;
verifier("Bonus des jauges plafonnés", C.options(0).orDepart === 120 && Math.abs(C.options(0).bonusDegats - 0.1) < 1e-9);

// moteur de bataille : sans questions pendant les vagues, issue toujours atteinte
const MB = J.batailleMoteur, carte = J.cartesBataille.carte("gue");
verifier("Carte du Gué : des emplacements des deux côtés", carte.emplacements.length >= 6 && carte.emplacementsRivaux.length >= 3);
const pb = MB.creer(carte, { niveau: 0, pvRival: 16, arsenal: { tours: { archers: 1 }, troupes: { fantassins: 1 } } });
verifier("Poser une tour coûte son prix", MB.poserTour(pb, "archers", 0) && pb.or === 30 && !MB.poserTour(pb, "archers", 0));
verifier("Tour verrouillée dans l'arsenal : refusée", !MB.poserTour(pb, "baliste", 1));
verifier("Envoyer des fantassins : trois soldats, revenu en hausse", MB.envoyer(pb, "fantassins") && pb.envois.length === 3 && pb.revenu === 26);
MB.gagnerOr(pb, 40); MB.poserTour(pb, "archers", 1);
let garde = 0;
while (pb.phase !== "fin" && garde++ < 10) { MB.poserTour(pb, "archers", garde + 1); MB.jouerVague(pb, 0.05); }
verifier("Une bataille se termine toujours", pb.phase === "fin" && ["victoire", "tenu", "retraite"].indexOf(pb.fin) >= 0, pb.fin);
verifier("Pendant une vague, aucune pose possible", (() => { const q = MB.creer(carte, {}); MB.lancerVague(q); return !MB.poserTour(q, "archers", 0) && !MB.envoyer(q, "fantassins"); })());

console.log("\n" + ok + " réussis, " + ko + " en échec.");
process.exit(ko ? 1 : 0);
