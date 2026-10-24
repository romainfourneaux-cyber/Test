// Tests de logique (Node) : calendrier, états des cours, Leitner, brouillage, migration et import, campagne, moteur de bataille,
// règles du validateur pour suivi.js, personnages de la campagne (souverains, rivaux, rivalité, missives).
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
  ["noyau", "brouillage", "calendrier", "sauvegarde", "leitner", "progression", "questions", "rappels", "recit", "bataille-moteur", "cartes-bataille", "campagne"].forEach(m => {
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
verifier("Migration 1 → 5 : rien de perdu", conserve && m.schema === 5);
verifier("Migration 1 → 5 : file des rappels vide", JSON.stringify(m.rappels) === JSON.stringify({ compteur: 0, file: [] }), m.rappels);
verifier("Migration 1 → 5 : campagne neuve et musique", m.campagne && m.campagne.conquises.length === 0 && m.campagne.arsenal.tours.archers === 1 && m.reglages.musique === true);
verifier("Migration 1 → 2 : nouveaux champs", m.reglages && m.reglages.son === true && m.stats.bonnes === 3 && m.stats.total === 4 && typeof m.questionsVues === "object");
const sansSchema = J.sauvegarde.migrer({ cours: {}, notions: {} });
verifier("Sauvegarde sans numéro de schéma traitée comme schéma 1", sansSchema.schema === 5 && sansSchema.ressources.sceaux === 0);

// export puis import : même partie
J.sauvegarde.remplacer(m);
const txt = J.sauvegarde.texteExport();
J.sauvegarde.importer(txt);
verifier("Export puis import : même partie", JSON.stringify(J.sauvegarde.etat()) === JSON.stringify(JSON.parse(txt)));
// un fichier qui n'est pas une sauvegarde est refusé, et la partie en cours ne bouge pas
const refuse = t => { try { J.sauvegarde.importer(t); return false; } catch (e) { return true; } };
const avantImport = JSON.stringify(J.sauvegarde.etat());
verifier("Import d'un fichier étranger refusé, partie intacte", refuse('{"name":"mon-projet","version":"1.0.0"}') && refuse("[]") && refuse("pas du JSON") && JSON.stringify(J.sauvegarde.etat()) === avantImport);

// migration 2 → 3 → 4 → 5 : la campagne s'ajoute, puis la file des rappels, puis la mémoire des questions posées ; le reste ne bouge pas
const v2 = JSON.parse(JSON.stringify(m)); delete v2.campagne; delete v2.rappels; v2.schema = 2; delete v2.reglages.musique;
const m3 = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v2)));
verifier("Migration 2 → 5 : rien de perdu", ["cours", "notions", "ressources", "batiments", "stats"].every(k => JSON.stringify(m3[k]) === JSON.stringify(v2[k])) && m3.schema === 5 && m3.campagne.provinces.gue.pv === 16 && m3.rappels.file.length === 0);
// migration 3 → 5 : seules la file des rappels et la mémoire des questions posées s'ajoutent, tout le reste est identique
const v3 = JSON.parse(JSON.stringify(m)); delete v3.rappels; delete v3.posees; v3.schema = 3;
v3.campagne.conquises = ["gue"]; v3.campagne.royaume.savoir = 5; v3.questionsVues = { "methode-frise-q3": 2 };
const m4 = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v3)));
verifier("Migration 3 → 5 : rien de perdu, file des rappels et mémoire des questions posées ajoutées",
  Object.keys(v3).filter(k => k !== "schema").every(k => JSON.stringify(m4[k]) === JSON.stringify(v3[k])) && m4.schema === 5 &&
  JSON.stringify(m4.rappels) === JSON.stringify({ compteur: 0, file: [] }) && JSON.stringify(m4.posees) === JSON.stringify({ horloge: 0, questions: {} }), Object.keys(m4));
verifier("Sauvegarde d'un schéma plus récent (6) refusée", (() => { try { J.sauvegarde.migrer({ schema: 6, creeLe: "2026-10-15T10:00:00", notions: {}, ressources: {} }); return false; } catch (e) { return true; } })());

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
// cartes : la route va de porte à porte, le pied des places fortes ne bouge pas, aucun ruisseau ne touche un emplacement
const IDS_CARTES = ["domaine", "gue", "foret", "moulin", "col", "chateau"];
verifier("Cartes : la route part de la porte de ta place forte et finit à la porte de la place adverse", IDS_CARTES.every(id => {
  const c = J.cartesBataille.carte(id), P = J.cartesBataille.PORTES, d = c.places.depart, f = c.places.arrivee;
  const r0 = c.route[0], r1 = c.route[c.route.length - 1];
  return d[0] === 85 && f[0] === 915 && Math.hypot(r0[0] - d[0] - P.depart.dx, r0[1] - d[1] - P.depart.dy) < 0.5
    && Math.hypot(r1[0] - f[0] - P.arrivee.dx, r1[1] - f[1] - P.arrivee.dy) < 0.5;
}));
verifier("Cartes : la route se tient à 44 px au moins de chaque emplacement de tour", IDS_CARTES.every(id => {
  const c = J.cartesBataille.carte(id), r = MB.preparerRoute(c.route);
  return c.emplacements.concat(c.emplacementsRivaux).every(e => { for (let s = 0; s <= r.longueur; s += 2) { const q = MB.surRoute(r, s, 0); if (Math.hypot(q.x - e[0], q.y - e[1]) < 44) return false; } return true; });
}));
verifier("Cartes : le ruisseau de chaque carte (même élargi de 60 %, et le Grand Fleuve de 40 px) passe loin des tours", IDS_CARTES.every(id => {
  const c = J.cartesBataille.carte(id), rive = Math.max(c.rive, id === "gue" ? 20 : 0);
  const dSeg = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)); return Math.hypot(a[0] + t * dx - x, a[1] + t * dy - y); };
  return c.emplacements.concat(c.emplacementsRivaux).every(e => {
    let m = Infinity; for (let i = 1; i < c.riviere.length; i++) m = Math.min(m, dSeg(e[0], e[1], c.riviere[i - 1], c.riviere[i]));
    return m - 1.6 * rive >= 8;
  });
}));
verifier("Le Gué : une traversée à gué, sans pont", J.cartesBataille.carte("gue").ponts.filter(p => p.gue).length === 1);
verifier("Moteur : pertes et arrivées comptées pour le tableau de la mêlée", (() => {
  const q = MB.creer(carte, { pvRival: 999, arsenal: { tours: { archers: 1 }, troupes: { fantassins: 1 } } });
  q.or = 200; MB.envoyer(q, "fantassins"); MB.envoyer(q, "fantassins");
  let g = 0; while (q.phase !== "fin" && g++ < 3) MB.jouerVague(q, 0.05);
  return q.stats.arrivees + q.stats.pertes > 0 && q.stats.arrivees <= q.stats.envoyes;
})());
verifier("Pendant une vague, aucune pose possible", (() => { const q = MB.creer(carte, {}); MB.lancerVague(q); return !MB.poserTour(q, "archers", 0) && !MB.envoyer(q, "fantassins"); })());

// validateur : règles de suivi.js (seulement des cours, devoir source connu, note sans chiffre ni personne)
const { controler } = require("./controles.js");
const { chargerDonnees } = require("./valider.js");
const donneesVal = chargerDonnees();
function controleSuivi(cours) {
  const d = Object.assign({}, donneesVal, { suivi: { majLe: "2026-10-13", cours: cours } });
  return controler(d, atelier.debrouiller);
}
const suiviBon = controleSuivi({ "histoire-s08-1": { etat: "a-revoir", note: "Revois la différence entre domaine royal et grands fiefs.", source: "histoire-d1", le: "2026-10-13" } });
// (seuls les messages sur suivi.js comptent ici : les alertes de contenu des cours en cours d'écriture n'entrent pas en jeu)
const surSuivi = t => t.filter(x => x.indexOf("suivi") >= 0);
verifier("Validateur : une estimation correcte de suivi.js passe", suiviBon.erreurs.length === 0 && surSuivi(suiviBon.alertes).length === 0, { erreurs: suiviBon.erreurs, alertes: surSuivi(suiviBon.alertes) });
const suiviFaux = controleSuivi({
  "histoire-s02-2": { etat: "acquis", source: "histoire-d1" },
  "histoire-s07-2": { etat: "a-revoir", note: "Corrigé par M. Dupont : 1214.", source: "histoire-d99" },
  "histoire-s08-2": { etat: "acquis" }
});
const aErreur = (motif) => suiviFaux.erreurs.some(m => m.indexOf(motif) >= 0);
verifier("Validateur : suivi.js refuse une entrée qui n'est pas un cours", aErreur("histoire-s02-2 n'est pas un cours"));
verifier("Validateur : suivi.js refuse un devoir source inconnu ou absent", aErreur("inconnu pour histoire-s07-2") && aErreur("inconnu pour histoire-s08-2"));
verifier("Validateur : alerte sur une note avec un chiffre ou une personne", suiviFaux.alertes.some(m => m.indexOf("chiffre") >= 0) && suiviFaux.alertes.some(m => m.indexOf("personne") >= 0));
verifier("Validateur : un devoir sans périmètre, cité dans suivi.js, donne une erreur et pas un plantage", (() => {
  const devoirs = donneesVal.devoirs.map(dv => dv.id === "histoire-d1" ? Object.assign({}, dv, { perimetre: null }) : dv);
  const d = Object.assign({}, donneesVal, { devoirs: devoirs, suivi: { majLe: "2026-10-13", cours: { "histoire-s08-1": { etat: "acquis", source: "histoire-d1", le: "2026-10-13" } } } });
  try { return controler(d, atelier.debrouiller).erreurs.some(m => m.indexOf("périmètre invalide : histoire-d1") >= 0); }
  catch (e) { return false; }
})());

// équilibre : la palissade touche toujours la route, chaque troupe débloquée a son intérêt
const touteArmee = { tours: { archers: 1, piquiers: 1, baliste: 1, catapulte: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } };
verifier("Palissade : chaque emplacement touche la file ennemie", ["domaine", "gue", "foret", "moulin", "col", "chateau"].every(id => {
  const c = J.cartesBataille.carte(id), r = MB.preparerRoute(c.route);
  return c.emplacements.every(e => { for (let s = 0; s <= r.longueur; s += 5) { const q = MB.surRoute(r, s, -9); if (Math.hypot(q.x - e[0], q.y - e[1]) <= MB.TOURS.piquiers.portee) return true; } return false; });
}));
const coups = {};
Object.keys(MB.TROUPES).forEach(t => {
  const pt = MB.creer(J.cartesBataille.carte("moulin"), { niveau: 2, vagues: 4, pvChateau: 999, pvRival: 999, arsenal: touteArmee });
  pt.vague = 2; pt.or = 90;               // vague 3 : le rival a déjà 3 tours
  for (let k = 0; k < 2; k++) { pt.vague = k; MB.lancerVague(pt); pt.phase = "preparation"; pt.fileRivale = []; }
  pt.vague = 2; pt.or = 90;
  while (MB.envoyer(pt, t)) { /* tout l'or dans ce type */ }
  MB.jouerVague(pt, 0.05);
  coups[t] = pt.stats.degatsRival;
});
verifier("Troupes débloquées : pour 90 or, au moins autant de coups que les fantassins", coups.cavaliers >= coups.fantassins && coups.belier >= coups.fantassins, coups);
verifier("Troupes débloquées : au moins le revenu des fantassins pour le même or", ["cavaliers", "belier"].every(t => MB.TROUPES[t].revenu / MB.TROUPES[t].cout >= MB.TROUPES.fantassins.revenu / MB.TROUPES.fantassins.cout));

// campagne : articles, réparation de sauvegarde, bonus gardés si l'on quitte avant la première vague, récit de défense
const A = J.campagne.avecArticle;
verifier("Articles : du Gué, aux Oliveraies, à l'Empire omeyyade, au royaume d'Angleterre",
  A("Le Gué", "de") === "du Gué" && A("Les Oliveraies", "à") === "aux Oliveraies" && A("l'Empire omeyyade", "à") === "à l'Empire omeyyade" && A("le royaume d'Angleterre", "à") === "au royaume d'Angleterre",
  [A("Le Gué", "de"), A("Les Oliveraies", "à"), A("l'Empire omeyyade", "à"), A("le royaume d'Angleterre", "à")]);
let reparee = true;
try { [{ rival: null }, { provinces: null }, { arsenal: { tours: 3 } }].forEach(x => { const r = J.campagne.completer(x); if (!r.rival || r.rival.menace !== 0 || r.rival.defaites !== 0 || !r.provinces.gue || typeof r.arsenal.tours.archers !== "number") reparee = false; }); } catch (e) { reparee = false; }
verifier("Sauvegarde de campagne abîmée : réparée sans planter", reparee);
J.sauvegarde.remplacer(J.sauvegarde.nouvelle());
J.campagne.etat().bonus = { or: 40, espion: true };
J.campagne.apresBataille({ lieu: "foret", issue: "retraite", degatsRival: 0, entamee: false });
verifier("Quitter avant la première vague : bonus des mercenaires et de l'espion gardés", J.campagne.options(0).orDepart === 100 && J.campagne.options(0).espion === true && J.campagne.etat().provinces.foret.pv === 20);
J.campagne.apresBataille({ lieu: "foret", issue: "retraite", degatsRival: 0, entamee: true });
verifier("Bataille entamée : les bonus sont consommés", J.campagne.options(0).orDepart === 60 && !J.campagne.options(0).espion);
J.campagne.etat().rival.attaque = "omeyyades";
let cadresOk = true;
for (let i = 0; i < 50; i++) { const t = J.recit.cadre({ matiere: "histoire" }, "defense").texte; if (/anglais|\{/i.test(t)) cadresOk = false; }
verifier("Défense contre l'Empire omeyyade : le récit ne parle jamais des Anglais", cadresOk);
J.campagne.etat().rival.attaque = false;

// bataille : portée des tours adverses bien distincte de la tienne (crème #fbe9bd), écart de couleur CIE76 > 25
function lab(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(u => u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4));
  const X = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047, Y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], Z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
  const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const deltaE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const ecartsPortee = J.campagne.FRONTS.map(f => { const cp = J.campagne.CAMPS[f.camp]; return { camp: f.camp, portee: cp.portee, dE: cp.portee ? Math.round(deltaE(cp.portee, "#fbe9bd")) : 0 }; });
verifier("Portée des tours adverses : couleur propre à chaque camp, loin du crème de tes tours (ΔE > 25)", ecartsPortee.every(e => /^#[0-9a-f]{6}$/i.test(e.portee || "") && e.dE > 25), ecartsPortee);
verifier("Portée des tours adverses : loin aussi de l'herbe (vert #5f7a3a) et du sable (#c8b27a) des terrains (ΔE > 25)", ecartsPortee.every(e => deltaE(e.portee, "#5f7a3a") > 25 && deltaE(e.portee, "#c8b27a") > 25), ecartsPortee);

// bataille : « verrouillé » accordé à chaque tour et chaque troupe
const JB = (() => { const ctx = contexte(); vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8"), ctx, { filename: "bataille.js" }); return ctx.JEU; })();
const accords = { archers: "verrouillée", piquiers: "verrouillée", baliste: "verrouillée", catapulte: "verrouillé", fantassins: "verrouillés", cavaliers: "verrouillés", belier: "verrouillée" };
verifier("Verrous accordés : le Trébuchet verrouillé, les Cavaliers verrouillés, la Tour de siège verrouillée",
  Object.keys(accords).every(k => JB.bataille.verrouille(k) === accords[k]) && Object.keys(JB.batailleMoteur.TOURS).concat(Object.keys(JB.batailleMoteur.TROUPES)).every(k => k in accords),
  Object.keys(accords).map(k => k + " : " + JB.bataille.verrouille(k)));

// une séquence d'anglais « à revoir » met ses éléments en priorité
J.donnees.anglais["anglais-essai"] = { id: "anglais-essai", ordre: 99, matiere: "anglais", vocabulaire: [{ id: "ang-v1" }], structures: [{ id: "ang-s1" }], phrases: [{ id: "ang-p1" }] };
J.donnees.suivi = { cours: { "anglais-essai": { etat: "a-revoir" } } };
J.progression.oublier();
const far = J.progression.fichesARevoir();
verifier("Une séquence d'anglais à revoir met ses éléments en priorité", ["ang-v1", "ang-s1", "ang-p1"].every(x => far.indexOf(x) >= 0), far);
delete J.donnees.anglais["anglais-essai"]; J.donnees.suivi = { cours: {} }; J.progression.oublier();

// ---------- rappels : une question ratée revient « un peu plus tard » (jeu/js/rappels.js) ----------
// Contexte neuf : seulement deux cours d'essai, en mémoire (un cours d'histoire de S7 et un cours de langue).
const JR = contexte().JEU;
JR.sauvegarde.charger();
const SRC = { fichier: "essai.pdf", page: 1 };
function coursEssai(id, n, extra) {
  const fiches = [], questions = [];
  for (let i = 1; i <= n; i++) {
    fiches.push({ id: id + "-f" + i, notion: "Notion " + i, titre: "Notion " + i, texte: "", source: SRC });
    questions.push({ id: id + "-q" + (2 * i - 1), fiche: id + "-f" + i, type: "qcm", niveau: 1, enonce: "Question " + i + " ?", choix: ["a", "b", "c", "d"], reponse: "a", explication: "a.", source: SRC });
    questions.push({ id: id + "-q" + (2 * i), fiche: id + "-f" + i, type: "vrai_faux", niveau: 1, enonce: "Affirmation " + i + ".", corrections: [], reponse: { vrai: true, correction: null }, explication: "Vrai.", source: SRC });
  }
  return Object.assign({ id: id, fiches: fiches, questions: questions, bonus: [], nonCouvert: [] }, extra || {});
}
JR.donnees.cours["histoire-s07-2"] = coursEssai("histoire-s07-2", 6);
JR.donnees.cours["langue-conj10"] = coursEssai("langue-conj10", 4, { matiere: "langue", titre: "Les modes du verbe", badge: "cuivre", ordre: 1 });
JR.questions.vider(); JR.progression.oublier();
const RP = JR.rappels;
const QR = id => JR.questions.questionsDuCours(id.replace(/-q\d+$/, "")).find(q => q.id === id);
const repondre = (q, juste) => JR.questions.enregistrerReponse(q, juste);
const neuve = () => { JR.sauvegarde.remplacer(JR.sauvegarde.nouvelle()); };
const H = n => QR("histoire-s07-2-q" + n);

verifier("Rappels : rappelApres vaut 3 dans config.js", JR.donnees.config.rappelApres === 3 && RP.apres() === 3);
neuve();
const qA = H(1);
repondre(qA, false);
const eA = RP.etat().file.find(x => x.id === qA.id);
verifier("Rappel : une erreur programme la même question après 3 autres", RP.etat().compteur === 1 && eA && eA.du === 4 && eA.cours === "histoire-s07-2" && RP.etat().file.length === 1, RP.etat());
const lot5 = [3, 5, 7, 9, 11].map(H);
const p0 = RP.placer(lot5.slice());
verifier("Rappel : jamais la question suivante, mais la 4e (après 3 autres), à la place d'une question ordinaire",
  p0.length === 5 && p0[3].id === qA.id && p0[3].rappel === true && p0.filter(q => q.rappel).length === 1 && p0[0].id !== qA.id && p0[4].id === lot5[3].id, p0.map(q => q.id));
verifier("Rappel : l'énoncé ne change pas, la copie est marquée", p0[3].enonce === qA.enonce && !qA.rappel);
repondre(H(3), true);
const p1 = RP.placer([5, 7, 9, 11].map(H));
verifier("Rappel : une réponse plus tard, il avance d'une place", p1[2].id === qA.id && p1.length === 4, p1.map(q => q.id));
verifier("Rappel : un lot trop court le laisse en attente pour le lot suivant", RP.placer([H(5)]).length === 1 && RP.placer([H(5)])[0].id === H(5).id && RP.enAttente().indexOf(qA.id) >= 0);
repondre(H(5), true); repondre(H(7), true);
verifier("Rappel : dû, il passe en tête du lot suivant", RP.placer([9, 11].map(H))[0].id === qA.id);
repondre(qA, false);
verifier("Rappel encore raté : reprogrammé de la même façon (une seule entrée)", RP.etat().file.length === 1 && RP.etat().file[0].du === RP.etat().compteur + 3, RP.etat());
repondre(qA, true);
verifier("Rappel réussi : il sort de la file", RP.etat().file.length === 0);

// position dans les lots d'une bataille : 3 questions tirées au début de chaque vague, avec les exclusions de la bataille
neuve();
const posees = [];
const tirerVague = n => { const ids = posees.map(q => q.id), fs = posees.map(q => q.fiche); return JR.recit.suite(n, { exclure: ids, filtre: q => fs.indexOf(q.fiche) < 0, completer: true }); };
const vague1 = tirerVague(3); posees.push(...vague1);
repondre(vague1[0], false); repondre(vague1[1], true); repondre(vague1[2], true);
const vague2 = tirerVague(3); posees.push(...vague2);
verifier("Bataille : la question ratée à la 1re question revient à la 2e place de la vague suivante (après 3 autres)",
  vague1.length === 3 && vague2.length === 3 && vague2[1].id === vague1[0].id && vague2[1].rappel && vague2[0].id !== vague1[0].id, [vague1.map(q => q.id), vague2.map(q => q.id)]);
verifier("Bataille : le rappel passe outre « une question par fiche » et « jamais deux fois la même question »",
  posees.filter(q => q.id === vague1[0].id).length === 2 && vague2.filter(q => !q.rappel).every(q => vague1.every(x => x.fiche !== q.fiche)));
repondre(vague2[0], true);
repondre(vague2[1], true);
verifier("Bataille : réussi au rappel, il ne revient plus", RP.enAttente().length === 0 && tirerVague(3).every(q => !q.rappel));

// conseil du royaume : 8 affirmations tirées d'un coup ; une erreur à la 1re la fait revenir à la 5e
neuve();
const lot8 = JR.recit.suite(8, { types: ["vrai_faux"] });
repondre(lot8[0], false);
RP.replacer(lot8, 1, lot8.length, { types: ["vrai_faux"] });
verifier("Conseil : une affirmation ratée revient dans le même conseil, après 3 autres, sans doublon",
  lot8.length === 8 && lot8[4].id === lot8[0].id && lot8[4].rappel && new Set(lot8.slice(1).map(q => q.id)).size === 7, lot8.map(q => q.id));
// une question qui n'est pas un vrai ou faux attend une bataille ou un événement
neuve();
const qQcm = QR("langue-conj10-q1");
repondre(qQcm, false); [3, 5, 7].forEach(n => repondre(H(n), true));
const lotVF = JR.recit.suite(4, { types: ["vrai_faux"] });
verifier("Conseil : un QCM raté n'y revient pas (vrai ou faux seulement), il attend", lotVF.every(q => q.id !== qQcm.id) && RP.enAttente().indexOf(qQcm.id) >= 0);
const lotTous = JR.recit.suite(3);
verifier("Événement : le QCM raté et déjà dû passe en tête", lotTous[0].id === qQcm.id && lotTous[0].rappel && lotTous.length === 3, lotTous.map(q => q.id));

// jamais deux fois de suite
neuve();
const qB = H(2);
repondre(qB, false);
RP.etat().file[0].du = RP.etat().compteur; // dû tout de suite, alors qu'on vient de la poser
const pB = RP.placer([1, 3, 5].map(H));
verifier("Rappel : jamais deux fois de suite (il attend une question)", pB[0].id !== qB.id && pB[1].id === qB.id, pB.map(q => q.id));
// douze rappels au plus : le plus ancien tombe
neuve();
const treize = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(H).concat([QR("langue-conj10-q1")]);
treize.forEach(q => repondre(q, false));
verifier("Rappels : douze au plus, le plus ancien tombe", RP.etat().file.length === 12 && RP.enAttente().indexOf(treize[0].id) < 0 && RP.enAttente().indexOf(treize[12].id) >= 0);
// question disparue (fichier de cours retiré) : le rappel s'efface sans bruit
neuve();
RP.etat().file.push({ id: "geographie-s07-1-q1", cours: "geographie-s07-1", du: 0 });
let sansBruit = true, pDisp;
try { pDisp = RP.placer([1, 3].map(H)); } catch (e) { sansBruit = false; }
verifier("Rappel d'une question disparue : effacé sans bruit", sansBruit && RP.etat().file.length === 0 && pDisp.length === 2 && pDisp.every(q => !q.rappel));
verifier("File des rappels abîmée : réparée sans planter", (() => {
  const r = RP.completer({ compteur: "x", file: [null, { id: "a" }, { id: "b", du: 2, cours: "c" }] });
  return r.compteur === 0 && r.file.length === 1 && r.file[0].id === "b" && RP.completer(null).file.length === 0;
})());
// récit : « Seconde chance », sans changer l'énoncé
neuve();
repondre(H(1), false); [3, 5, 7].forEach(n => repondre(H(n), true));
const copieR = RP.placer([9, 11].map(H))[0];
const cadreR = JR.recit.cadre(copieR, "preparation"), cadreN = JR.recit.cadre(H(9), "preparation"), cadreC = JR.recit.cadre(copieR, "savoir");
verifier("Récit : la question qui revient porte l'étiquette « Seconde chance », sans changer l'énoncé",
  copieR.rappel && copieR.enonce === H(1).enonce && cadreR.etiquette === "Seconde chance" && /tout à l'heure/.test(cadreR.texte) && !cadreN.etiquette && cadreC.etiquette === "Seconde chance", [cadreR, cadreC]);
verifier("Récit : jamais de pénalité ni de chrono dans les phrases de seconde chance", (() => {
  for (let i = 0; i < 40; i++) { const t = JR.recit.cadre(copieR, "evenement").texte; if (/tu perds|perdu|chrono|vite|pénalité/i.test(t)) return false; }
  return true;
})());

// récit : repère du cours (semaine, matière, numéro du cours) dans le cadre de chaque question, sans toucher l'énoncé
// (demande de Romain, 16/10/2026 : « tu vois les semaines défiler dans les questions et les batailles »)
(() => {
  const ctxW = contexte(), JW = ctxW.JEU;
  ["histoire-s04-1", "lecture-s04-1", "geographie-s01-2", "geographie-s01-1", "methode-frise", "langue-conj10"].forEach(id => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", "cours", id + ".js"), "utf8"), ctxW));
  vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", "anglais", "anglais-seq01.js"), "utf8"), ctxW);
  JW.sauvegarde.charger();
  const R = JW.recit.repere;
  verifier("Repère : « Semaine 4 · Histoire · Cours 5 » pour un cours du planning (semaine, matière, numéro du titre)", R("histoire-s04-1") === "Semaine 4 · Histoire · Cours 5", R("histoire-s04-1"));
  verifier("Repère : le numéro du cours quand le titre commence par le thème ; semaine et matière seules quand le titre n'en a pas",
    R("geographie-s01-2") === "Semaine 1 · Géographie · Cours 1" && R("lecture-s04-1") === "Semaine 4 · Lecture suivie" && R("geographie-s01-1") === "Semaine 1 · Géographie", [R("geographie-s01-2"), R("lecture-s04-1"), R("geographie-s01-1")]);
  verifier("Repère : badge Griffon pour la grammaire, « Savoir-faire » pour une fiche méthode, séquence pour l'anglais, rien pour un cours inconnu",
    R("langue-conj10") === "Grammaire · Griffon de cuivre" && R("methode-frise") === "Savoir-faire · Histoire" && R("anglais-seq01") === "Anglais · Séquence 1" && R("inconnu-s99-1") === "" && R("") === "", [R("langue-conj10"), R("methode-frise"), R("anglais-seq01")]);
  const q = JW.questions.questionsDuCours("histoire-s04-1")[0], enonce = q.enonce;
  const cadres = ["preparation", "defense", "evenement", "savoir"].map(c => JW.recit.cadre(q, c));
  verifier("Repère : porté par le cadre de récit en bataille, en événement et au conseil, sans changer l'énoncé ni la phrase du conseiller ; absent sans cours",
    cadres.every(c => c.repere === "Semaine 4 · Histoire · Cours 5" && c.texte.indexOf("Semaine") < 0 && c.nom === "Le chroniqueur") && q.enonce === enonce && !JW.recit.cadre({ matiere: "histoire" }, "defense").repere, cadres);
  const t0 = Date.now(); for (let i = 0; i < 1000; i++) JW.recit.cadre(q, "preparation"); const dt = Date.now() - t0;
  verifier("Repère : mémorisé par cours, mille cadres en moins de 100 ms (la question suivante n'attend rien)", dt < 100, dt);
  // affiché sur la ligne du nom du conseiller (bataille, événement : aucune hauteur de plus en 1366 × 768) et dans la carte du conseil
  const srcI = fs.readFileSync(path.join(RACINE, "jeu", "js", "interface.js"), "utf8"), srcC = fs.readFileSync(path.join(RACINE, "jeu", "js", "conseil.js"), "utf8"), css = fs.readFileSync(path.join(RACINE, "jeu", "css", "jeu.css"), "utf8");
  const iNom = srcI.indexOf('class: "recit-nom"'), iTexte = srcI.indexOf('class: "recit-texte"');
  verifier("Repère : affiché par ui.recit sur la ligne du nom (classe recit-repere, avant la phrase) et par la carte du conseil, avec sa règle CSS",
    iNom > 0 && iTexte > iNom && srcI.slice(iNom, iTexte).indexOf('class: "recit-repere", texte: r.repere') > 0 && /class: "recit-repere", texte: cadre\.repere/.test(srcC) && /\.recit-repere \{/.test(css) && /\.carte-conseil \.cc-tete \.recit-repere/.test(css), { iNom, iTexte });
})();

// sauvegarde : la file est gardée (export, import) ; à la séance suivante, les rappels en attente passent en tête
verifier("Sauvegarde neuve : schéma 5, file des rappels vide", JR.sauvegarde.nouvelle().schema === 5 && JSON.stringify(JR.sauvegarde.nouvelle().rappels) === JSON.stringify({ compteur: 0, file: [] }));
neuve();
repondre(H(1), false);
const fileAvant = JSON.stringify(JR.sauvegarde.etat().rappels);
const txtR = JR.sauvegarde.texteExport();
JR.sauvegarde.remplacer(JR.sauvegarde.nouvelle());
JR.sauvegarde.importer(txtR);
verifier("Export puis import : la file des rappels est gardée", JSON.stringify(JR.sauvegarde.etat().rappels) === fileAvant && JR.sauvegarde.etat().rappels.file.length === 1);
JR.sauvegarde.enregistrer();
JR.sauvegarde.charger(); // le jeu est rouvert : nouvelle séance
const eS = JR.sauvegarde.etat().rappels.file[0];
// ratée à la toute dernière réponse avant de fermer le jeu : due tout de suite, mais jamais la toute première question
const pS = RP.placer([3, 5, 7].map(H));
verifier("Séance suivante : ratée juste avant de fermer le jeu, elle revient en second, jamais tout de suite", eS && eS.du <= JR.sauvegarde.etat().rappels.compteur && pS[0].id === H(3).id && pS[1].id === H(1).id && pS[1].rappel, pS.map(q => q.id));
neuve();
repondre(H(1), false); repondre(H(9), true);
JR.sauvegarde.enregistrer();
JR.sauvegarde.charger();
verifier("Séance suivante : le rappel en attente est dû tout de suite et passe en tête", RP.placer([3, 5, 7].map(H))[0].id === H(1).id);
verifier("Rappels : une dernière question illisible dans la sauvegarde est oubliée sans planter", (() => {
  const r = RP.completer({ compteur: 2, file: [], derniere: 7 });
  return !("derniere" in r) && r.compteur === 2;
})());
// une question en attente ne sort jamais au tirage ordinaire, même quand toutes les questions de sa fiche attendent
// (choisirPourFiche reprend alors une question exclue) ; et jamais deux fois la même question dans un lot
let fuite = 0, doublon = 0;
for (let n = 0; n < 150; n++) {
  neuve();
  repondre(H(1), false); repondre(H(2), false); // les deux questions de la fiche histoire-s07-2-f1
  if (JR.recit.suite(3).some(q => !q.rappel && (q.id === H(1).id || q.id === H(2).id))) fuite++;
  neuve();
  const lotC = JR.recit.suite(3, { exclure: [H(2).id], filtre: q => q.fiche === "histoire-s07-2-f1", completer: true });
  if (new Set(lotC.map(q => q.id)).size !== lotC.length) doublon++;
}
verifier("Tirage : une question ratée en attente ne sort jamais comme une question ordinaire", fuite === 0, fuite);
verifier("Tirage : jamais deux fois la même question dans un lot (second tirage d'une vague compris)", doublon === 0, doublon);

// ---------- grammaire : la matière « langue », rangée par badges Griffon ----------
verifier("Grammaire : matière, ressource, quartier et couleur", JSON.stringify(JR.MATIERES.langue) === JSON.stringify({ nom: "Grammaire", ressource: "parchemins", quartier: "scriptorium", couleur: "#8c2f39" }));
verifier("Grammaire : rangée juste après la lecture suivie", JR.ORDRE_MATIERES.indexOf("langue") === JR.ORDRE_MATIERES.indexOf("lecture") + 1);
verifier("Grammaire : huit badges Griffon dans l'ordre", JR.BADGES_GRIFFON.map(b => b.id).join() === "bois,fer,cuivre,acier,bronze,titane,argent,or" &&
  JR.BADGES_GRIFFON.map(b => b.nom).join("|") === "Griffon de bois|Griffon de fer|Griffon de cuivre|Griffon d'acier|Griffon de bronze|Griffon de titane|Griffon d'argent|Griffon d'or");
verifier("Grammaire : mêmes badges dans le jeu et dans le validateur", JR.BADGES_GRIFFON.map(b => b.id).join() === require("./controles.js").BADGES.join());
verifier("Grammaire : le maître scribe conseille", JR.recit.conseiller("langue").nom === "Le maître scribe" && JR.recit.conseiller("langue").titre === "veille sur la langue du royaume");
const etatR = JR.sauvegarde.etat();
JR.progression.oublier();
verifier("Grammaire : un cours avec fichier est ouvert sans entrée de planning", JR.progression.etatCours("langue-conj10", etatR) === "ouvert" && !JR.progression.entree("langue-conj10"));
verifier("Grammaire : un cours sans fichier reste dans la brume", JR.progression.etatCours("langue-conj11", etatR) === "brume");
verifier("Grammaire : la matière se lit dans l'identifiant, même sans fichier", JR.util.matiereDe("langue-conj11") === "langue" && JR.util.matiereDe("langue-conj10") === "langue");
verifier("Grammaire : ses questions entrent dans le tirage", JR.progression.coursAccessibles(etatR).indexOf("langue-conj10") >= 0 && JR.recit.candidats().some(c => c.cours === "langue-conj10"));
JR.donnees.cours["langue-conj12"] = coursEssai("langue-conj12", 1, { matiere: "langue", titre: "Les homophones", badge: "cuivre", ordre: 3 });
JR.donnees.cours["langue-conj11"] = coursEssai("langue-conj11", 1, { matiere: "langue", titre: "Être et avoir", badge: "cuivre", ordre: 2 });
JR.donnees.cours["langue-nat06"] = coursEssai("langue-nat06", 1, { matiere: "langue", titre: "Le nom", badge: "fer", ordre: 1 });
JR.donnees.suivi = { cours: { "langue-conj11": { etat: "acquis", source: "langue-d1", le: "2026-10-15" }, "langue-conj12": { etat: "a-revoir", source: "langue-d1", le: "2026-10-15" } } };
JR.questions.vider(); JR.progression.oublier();
verifier("Grammaire : le suivi estime un cours de langue (acquis, à revoir)", JR.progression.etatCours("langue-conj11", etatR) === "acquis" && JR.progression.etatCours("langue-conj12", etatR) === "a-revoir");
const grp = JR.progression.groupesLangue();
verifier("Onglet Grammaire : groupé par badge (seulement les badges qui ont un cours), trié par ordre",
  grp.map(g => g.nom).join("|") === "Griffon de fer|Griffon de cuivre" && grp[1].cours.map(c => c.id).join() === "langue-conj10,langue-conj11,langue-conj12" && grp[0].cours[0].id === "langue-nat06",
  grp.map(g => g.nom + ":" + g.cours.map(c => c.id).join(",")));
const posL = JR.progression.position("langue", etatR);
verifier("Onglet Grammaire : compte des cours (acquis, à revoir, en cours)", posL.total === 4 && posL.acquis === 1 && posL.aRevoir === 1 && posL.enCours === 2, posL);
verifier("Grammaire : comptée dans le total des cours acquis", JR.progression.totalAcquis(etatR) === 1);
["histoire-s01-1", "histoire-s02-1", "histoire-s03-1"].forEach(id => { JR.donnees.cours[id] = coursEssai(id, 1); }); JR.progression.oublier();
// semaines des cours du planning accessibles : 7, 3, 2, 1 → médiane 2,5 ; entre eux, Griffon de cuivre (ordre 3, 2, 1) puis de fer
const ordreRecence = (() => { const r = JR.progression.recence(etatR); return Object.keys(r).sort((a, b) => r[a] - r[b]).join(); })();
verifier("Grammaire : pour la récence, un cours de langue prend la semaine médiane des cours du planning (plus « semaine en cours »), le badge et l'ordre les plus avancés d'abord",
  ordreRecence === "histoire-s07-2,histoire-s03-1,langue-conj12,langue-conj11,langue-conj10,langue-nat06,histoire-s02-1,histoire-s01-1", ordreRecence);
["histoire-s01-1", "histoire-s02-1", "histoire-s03-1"].forEach(id => { delete JR.donnees.cours[id]; }); JR.questions.vider();
JR.donnees.suivi = { cours: {} }; JR.progression.oublier();

// validateur : cours de langue hors planning, badge, devoir langue-d1, suivi
const { brouiller: brl } = atelier;
function coursLangueVal(id, extra) {
  const c = coursEssai(id, 1, Object.assign({ matiere: "langue", titre: "Essai", badge: "cuivre", ordre: 1 }, extra || {}));
  c.questions.forEach(q => { q.r = brl(JSON.stringify(q.reponse)); delete q.reponse; });
  return c;
}
function validerAvec(cours, extra) {
  const ids = Object.keys(cours);
  const d = Object.assign({}, donneesVal, { indexCours: donneesVal.indexCours.concat(ids), cours: Object.assign({}, donneesVal.cours, cours) }, extra || {});
  return controler(d, atelier.debrouiller);
}
const surId = (res, id) => res.erreurs.filter(x => x.indexOf(id) >= 0);
const valL = validerAvec({ "langue-conj13": coursLangueVal("langue-conj13") });
verifier("Validateur : un cours de langue sans entrée de planning est valide", surId(valL, "langue-conj13").length === 0, surId(valL, "langue-conj13"));
const valBad = validerAvec({ "langue-conj14": coursLangueVal("langue-conj14", { badge: "platine", ordre: 0 }), "langue-gram01": coursLangueVal("langue-gram01") });
verifier("Validateur : badge inconnu, ordre absent, identifiant de langue mal formé refusés",
  surId(valBad, "langue-conj14").some(x => /badge/.test(x)) && surId(valBad, "langue-conj14").some(x => /ordre/.test(x)) && surId(valBad, "langue-gram01").some(x => /mal formé/.test(x)), valBad.erreurs.filter(x => /langue/.test(x)));
verifier("Validateur : le devoir langue-d1 (semaine null) passe", donneesVal.devoirs.some(dv => dv.id === "langue-d1" && dv.semaine === null) &&
  controler(donneesVal, atelier.debrouiller).erreurs.filter(x => x.indexOf("langue-d1") >= 0).length === 0);
const valDv = controler(Object.assign({}, donneesVal, { devoirs: donneesVal.devoirs.concat([
  { id: "langue-d2", matiere: "langue", semaine: 5, intitule: "Essai", perimetre: ["langue-conj13"] },
  { id: "langue-d3", matiere: "langue", semaine: null, intitule: "Essai", perimetre: ["histoire-s01-1"] }]) }), atelier.debrouiller);
verifier("Validateur : devoir de langue avec une semaine, ou périmètre hors langue, refusés",
  valDv.erreurs.some(x => /semaine invalide : langue-d2/.test(x)) && valDv.erreurs.some(x => /périmètre de langue invalide : langue-d3/.test(x)), valDv.erreurs.filter(x => /langue/.test(x)));
const valSu = controleSuivi({ "langue-conj10": { etat: "acquis", source: "langue-d1", le: "2026-10-15" }, "langue-conj13": { etat: "a-revoir", source: "langue-d1", le: "2026-10-15" } });
verifier("Validateur : suivi.js accepte un cours de langue, et alerte hors du périmètre du devoir",
  valSu.erreurs.length === 0 && !surSuivi(valSu.alertes).some(x => /langue-conj10/.test(x)) && valSu.alertes.some(x => /langue-conj13 n'est pas dans le périmètre de langue-d1/.test(x)), { e: valSu.erreurs, a: surSuivi(valSu.alertes) });
const gp = require("./generer-planning.js");
verifier("Générateur du planning : il garde le devoir langue-d1 à chaque génération", (() => {
  const dv = gp.devoirs(gp.generer()).filter(x => x.id === "langue-d1");
  return dv.length === 1 && dv[0].semaine === null && dv[0].perimetre.join() === "langue-conj10,langue-conj11,langue-conj12";
})());

// ---------- équilibre du tirage entre les familles de matières (leitner.tirer, recit.suite) ----------
// Contexte neuf : huit fiches par matière ; le français (littérature, lecture suivie, grammaire) en a donc trois fois plus.
const JE = contexte().JEU;
JE.sauvegarde.charger();
const MATS_E = ["histoire", "geographie", "svt", "physique", "litterature", "lecture"];
MATS_E.forEach(m => { JE.donnees.cours[m + "-s07-1"] = coursEssai(m + "-s07-1", 8); });
JE.donnees.cours["langue-conj10"] = coursEssai("langue-conj10", 8, { matiere: "langue", titre: "Essai", badge: "cuivre", ordre: 1 });
JE.donnees.aRetravailler = []; JE.donnees.suivi = { cours: {} };
JE.questions.vider(); JE.progression.oublier();
const FAM_E = ["histoire", "geographie", "svt", "physique", "francais"];
const neuveE = () => { JE.sauvegarde.remplacer(JE.sauvegarde.nouvelle()); JE.progression.oublier(); };
// une longue suite de parties : batailles (4 vagues de 3), conseils (8 vrai ou faux), événements (3) ; taux : réussite
function jouerE(parties, taux) {
  const seq = [];
  for (let i = 0; i < parties; i++) {
    const lots = [];
    if (i % 4 < 2) {
      const posees = [];
      for (let v = 0; v < 4; v++) {
        const lot = JE.recit.suite(3, { exclure: posees.map(q => q.id), filtre: (fs => q => fs.indexOf(q.fiche) < 0)(posees.map(q => q.fiche)), completer: true });
        lot.forEach(q => { posees.push(q); seq.push(q); if (taux != null) JE.questions.enregistrerReponse(q, Math.random() < taux); });
      }
    } else {
      const lot = i % 4 === 2 ? JE.recit.suite(8, { types: ["vrai_faux"] }) : JE.recit.suite(3);
      lot.forEach(q => { seq.push(q); if (taux != null) JE.questions.enregistrerReponse(q, Math.random() < taux); });
    }
  }
  return seq;
}
const parts = (seq, cle) => { const p = {}; seq.forEach(q => { const k = cle(q); p[k] = (p[k] || 0) + 1 / seq.length; }); return p; };
const famE = q => JE.recit.famille(q.matiere);
const rond = p => Object.keys(p).map(k => k + " " + (100 * p[k]).toFixed(1)).join(", ");

verifier("Équilibre : les familles de matières (le français réunit littérature, lecture suivie et grammaire)",
  JE.recit.famille("litterature") === "francais" && JE.recit.famille("lecture") === "francais" && JE.recit.famille("langue") === "francais" &&
  JE.recit.famille("geographie") === "geographie" && JE.recit.famille("anglais") === "anglais");
neuveE(); JE.recit.oublierHistorique();
const seqE = jouerE(200);
const pE = parts(seqE, famE);
verifier("Équilibre : sans rien à revoir, chaque famille a 20 % des questions (± 3), le français pas plus qu'une autre",
  FAM_E.every(f => Math.abs((pE[f] || 0) - 0.2) <= 0.03), rond(pE));
const seqFr = seqE.filter(q => famE(q) === "francais"), pFr = parts(seqFr, q => q.matiere);
verifier("Équilibre : dans le français, un tiers chacun pour la littérature, la lecture suivie et la grammaire (± 5)",
  ["litterature", "lecture", "langue"].every(m => Math.abs((pFr[m] || 0) - 1 / 3) <= 0.05), rond(pFr));
const triplesE = s => s.filter((q, i) => i >= 2 && famE(q) === famE(s[i - 1]) && famE(s[i - 1]) === famE(s[i - 2])).length;
verifier("Équilibre : jamais trois fois de suite la même famille, ni dans un lot ni d'un lot à l'autre", triplesE(seqE) === 0, triplesE(seqE));
// en jouant (réponses justes 7 fois sur 10) : les « Seconde chance » gardent leur place ; un triple n'arrive que s'il en contient une
neuveE(); JE.recit.oublierHistorique();
const seqJ = jouerE(240, 0.7);
const triplesSansRappel = seqJ.filter((q, i) => i >= 2 && famE(q) === famE(seqJ[i - 1]) && famE(seqJ[i - 1]) === famE(seqJ[i - 2]) && !q.rappel && !seqJ[i - 1].rappel && !seqJ[i - 2].rappel).length;
verifier("Équilibre en jouant : trois fois la même famille seulement quand une « Seconde chance » à sa place l'impose",
  seqJ.some(q => q.rappel) && triplesSansRappel === 0, triplesSansRappel);
const pJ = parts(seqJ, famE);
verifier("Équilibre en jouant : chaque famille entre 15 et 25 %", FAM_E.every(f => (pJ[f] || 0) >= 0.15 && (pJ[f] || 0) <= 0.25), rond(pJ));

// les questions ratées passent d'abord, à leur place, même quand leur famille vient de sortir deux fois
neuveE(); JE.recit.oublierHistorique();
const deuxH = JE.recit.suite(2, { filtre: q => q.matiere === "histoire" });
const QE = id => JE.questions.questionsDuCours(id.replace(/-q\d+$/, "")).find(q => q.id === id);
const qRate = ["histoire-s07-1-q1", "histoire-s07-1-q3", "histoire-s07-1-q5"].map(QE).find(q => deuxH.every(x => x.fiche !== q.fiche));
JE.questions.enregistrerReponse(qRate, false);
JE.rappels.etat().file[0].du = JE.rappels.etat().compteur; JE.rappels.etat().derniere = "autre";
const lotR = JE.recit.suite(3);
verifier("Équilibre : une « Seconde chance » due passe en tête, même après deux questions de sa famille ; les suivantes changent de famille",
  deuxH.length === 2 && deuxH.every(q => famE(q) === "histoire") && lotR[0].id === qRate.id && lotR[0].rappel && famE(lotR[1]) !== "histoire" && famE(lotR[2]) !== "histoire",
  lotR.map(q => q.id + (q.rappel ? " (rappel)" : "")));

// à revoir : la famille sort plus souvent, au plus 1,5 fois plus ; dans la matière, ses notions à revoir passent devant
neuveE(); JE.recit.oublierHistorique();
JE.donnees.suivi = { cours: { "geographie-s07-1": { etat: "a-revoir", note: "essai", source: "geographie-d1", le: "2026-10-15" } } };
JE.progression.oublier();
const pRev = parts(jouerE(200), famE);
const autresRev = FAM_E.filter(f => f !== "geographie").map(f => pRev[f] || 0);
const rapportRev = (pRev.geographie || 0) / (autresRev.reduce((a, b) => a + b, 0) / autresRev.length);
verifier("À revoir : la famille qui a un cours à revoir sort plus souvent, mais au plus 1,5 fois plus que les autres (pas d'inondation)",
  rapportRev >= 1.3 && rapportRev <= 1.6 && (pRev.geographie || 0) <= 0.3, rond(pRev) + " ; rapport " + rapportRev.toFixed(2));
JE.donnees.suivi = { cours: {} }; JE.progression.oublier();
// dans une matière : 6 fiches sur 8 à retravailler, chacune sort plus souvent qu'une autre ; 1 sur 8 : elle prend la moitié des tirages
const candsL = Array.from({ length: 8 }, (_, i) => ({ fiche: "m-f" + i, cours: "m", recent: 0, famille: "m", matiere: "m" }));
const compterL = (aRetr, n) => { const c = {}; for (let i = 0; i < n; i++) JE.leitner.tirer(candsL, JE.sauvegarde.nouvelle(), 1, { aRetravailler: aRetr }).forEach(x => { c[x.fiche] = (c[x.fiche] || 0) + 1; }); return c; };
const six = ["m-f0", "m-f1", "m-f2", "m-f3", "m-f4", "m-f5"], cSix = compterL(six, 8000);
const parFicheSix = six.reduce((a, f) => a + (cSix[f] || 0), 0) / 6, parFicheAutres = ((cSix["m-f6"] || 0) + (cSix["m-f7"] || 0)) / 2;
verifier("À revoir : même nombreuses dans leur matière, les notions à revoir sortent chacune plus souvent que les autres (1,5 fois)",
  parFicheSix / parFicheAutres >= 1.3 && parFicheSix / parFicheAutres <= 1.7, (parFicheSix / parFicheAutres).toFixed(2));
const cUne = compterL(["m-f7"], 8000);
verifier("À revoir : une seule notion à revoir dans sa matière y garde la priorité (environ la moitié des tirages)",
  (cUne["m-f7"] || 0) / 8000 >= 0.45 && (cUne["m-f7"] || 0) / 8000 <= 0.62, (cUne["m-f7"] || 0) / 8000);

// avec les vrais cours du jeu (data/cours, data/suivi.js et data/a-retravailler.js tels qu'ils sont) : aucune famille oubliée
// Borne du temps d'un lot de 3 : 5 ms avec les 34 cours du 15/10/2026 (2 ms mesurés). Le tirage parcourt toutes les
// questions préparées des cours ouverts, son temps suit le contenu : la borne suit le nombre de questions préparées
// (5 ms par tranche de 2 000, 5 ms au moins), loin du budget de 100 ms entre une réponse et la question suivante, que
// perf.js mesure de bout en bout. 16/10/2026 : 65 cours, 3 474 questions préparées, 4 ms environ (borne 10 ms).
const borneTirage = J => { let n = 0; J.donnees.indexCours.forEach(id => J.questions.questionsParFiche(id).forEach(g => { n += g.questions.length; })); return Math.max(5, 5 * Math.ceil(n / 2000)); };
const ctxV = contexte(), JV = ctxV.JEU;
["index-cours", "a-retravailler"].forEach(f => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", f + ".js"), "utf8"), ctxV));
JV.donnees.indexCours.forEach(id => {
  const f = path.join(RACINE, "jeu", "data", /^anglais-/.test(id) ? "anglais" : "cours", id + ".js");
  try { vm.runInContext(fs.readFileSync(f, "utf8"), ctxV); } catch (e) { /* un cours illisible reste dans la brume, comme dans le jeu */ }
});
JV.sauvegarde.charger(); JV.sauvegarde.remplacer(JV.sauvegarde.nouvelle()); JV.progression.oublier();
const famV = q => JV.recit.famille(q.matiere), seqV = [], tempsV = [];
for (let i = 0; i < 150; i++) {
  const posees = [];
  for (let v = 0; v < 4; v++) {
    const t0 = process.hrtime.bigint();
    const lot = JV.recit.suite(3, { exclure: posees.map(q => q.id), filtre: (fs => q => fs.indexOf(q.fiche) < 0)(posees.map(q => q.fiche)), completer: true });
    if (i || v) tempsV.push(Number(process.hrtime.bigint() - t0) / 1e6); // le tout premier tirage prépare les questions
    lot.forEach(q => { posees.push(q); seqV.push(q); });
  }
}
const famillesV = Array.from(new Set(JV.recit.candidats().map(c => JV.recit.famille(c.matiere))));
const pV = parts(seqV, famV);
verifier("Tirage avec les vrais cours : chaque famille qui a des questions entre 14 et 30 % (géographie et français ne débordent plus)",
  famillesV.length >= 2 && famillesV.every(f => (pV[f] || 0) >= 0.14 && (pV[f] || 0) <= 0.3), rond(pV));
tempsV.sort((a, b) => a - b);
verifier("Tirage avec les vrais cours : un lot de 3 en moins de " + borneTirage(JV) + " ms (médiane ; borne suivant le nombre de questions)", tempsV[Math.floor(tempsV.length / 2)] < borneTirage(JV), tempsV[Math.floor(tempsV.length / 2)].toFixed(2) + " ms");

// ---------- anti-répétition : une question ne revient pas trop tôt (demande de Romain, 15/10/2026 : « elles reviennent souvent ») ----------
// Contexte neuf : cinq familles, un cours de 10 fiches chacune, 6 questions par fiche (niveaux 1, 1, 2, 2, 3 et 1 ; deux
// vrai ou faux par fiche) : 300 questions, 100 vrai ou faux.
const JA = contexte().JEU, QA = JA.questions, RA = JA.rappels;
JA.sauvegarde.charger();
function coursRiche(id, n) {
  const fiches = [], questions = [];
  let k = 0;
  const q = (f, type, niveau) => {
    k++;
    const base = { id: id + "-q" + k, fiche: f, type: type, niveau: niveau, enonce: "Question " + k + " ?", explication: "a.", source: SRC };
    return Object.assign(base, type === "vrai_faux" ? { corrections: [], reponse: { vrai: true, correction: null } } : { choix: ["a", "b", "c", "d"], reponse: "a" });
  };
  for (let i = 1; i <= n; i++) {
    const f = id + "-f" + i;
    fiches.push({ id: f, notion: "Notion " + i, titre: "Notion " + i, texte: "", source: SRC });
    questions.push(q(f, "qcm", 1), q(f, "vrai_faux", 1), q(f, "qcm", 2), q(f, "vrai_faux", 2), q(f, "qcm", 3), q(f, "qcm", 1));
  }
  return { id: id, fiches: fiches, questions: questions, bonus: [], nonCouvert: [] };
}
const FAM_A = ["histoire", "geographie", "svt", "physique", "francais"];
["histoire", "geographie", "svt", "physique", "litterature"].forEach(m => { JA.donnees.cours[m + "-s07-1"] = coursRiche(m + "-s07-1", 10); });
JA.donnees.aRetravailler = []; JA.donnees.suivi = { cours: {} };
QA.vider(); JA.progression.oublier();
// le jeu rouvert (nouvelle séance) : la sauvegarde est relue, les mémoires de la séance repartent de zéro
function seance(J) { J.sauvegarde.enregistrer(); J.sauvegarde.charger(); J.questions.oublierSeance(); J.recit.oublierHistorique(); J.questions.oublierReponses(); J.progression.oublier(); }
const neuveA = () => { JA.sauvegarde.remplacer(JA.sauvegarde.nouvelle()); seance(JA); };
// joue comme le jeu : bataille (4 vagues, 3 questions tirées au début de chaque vague, comme jeu/js/bataille.js),
// conseil (8 vrai ou faux), événement (3) ; après une erreur, les questions qui restent sont replacées (« Seconde chance »)
function jouerJeu(J, parties, juste, seulementBatailles, temps) {
  const Q = J.questions, seq = [];
  const rep = (q, partie) => { const ok = juste(q); seq.push({ id: q.id, fiche: q.fiche, rappel: !!q.rappel, niveau: q.niveau, matiere: q.matiere, partie: partie, ok: ok }); Q.enregistrerReponse(q, ok); return ok; };
  const tirer = f => { const t0 = process.hrtime.bigint(); const r = f(); if (temps) temps.push(Number(process.hrtime.bigint() - t0) / 1e6); return r; };
  for (let i = 0; i < parties; i++) {
    if (seulementBatailles || i % 4 < 2) {
      let questions = [], iQ = 0;
      for (let v = 0; v < 4; v++) {
        const debut = iQ, ids = questions.map(q => q.id), fs = questions.map(q => q.fiche);
        questions = questions.concat(tirer(() => Q.avecNiveaux(Q.NIVEAUX_BATAILLE, () => J.recit.suite(3, { exclure: ids, filtre: q => fs.indexOf(q.fiche) < 0, completer: true }))));
        while (iQ < Math.min(questions.length, debut + 3)) {
          const ok = rep(questions[iQ], "bataille"); iQ++;
          if (!ok) Q.avecNiveaux(Q.NIVEAUX_BATAILLE, () => J.rappels.replacer(questions, iQ, debut + 3));
        }
      }
    } else {
      const vf = i % 4 === 2, opts = vf ? { types: ["vrai_faux"] } : undefined;
      const qs = tirer(() => J.recit.suite(vf ? 8 : 3, opts));
      for (let k = 0; k < qs.length; ) { const ok = rep(qs[k], vf ? "conseil" : "evenement"); k++; if (!ok) J.rappels.replacer(qs, k, qs.length, opts); }
    }
  }
  return seq;
}
// questions ordinaires (hors « Seconde chance ») déjà posées parmi les fenetre(x) précédentes ; notion déjà posée parmi les n précédentes
const reposees = (seq, fenetre) => seq.filter((x, i) => !x.rappel && seq.slice(Math.max(0, i - fenetre(x)), i).some(y => y.id === x.id)).length;
const memeNotion = (seq, n) => seq.filter((x, i) => !x.rappel && seq.slice(Math.max(0, i - n), i).some(y => y.fiche === x.fiche)).length;

// mémoire des questions posées (schéma 5) : sauvegardée, exportée, relue, migrée, réparée
neuveA();
const qa1 = QA.questionsDeFiche("histoire-s07-1-f1")[0], qa2 = QA.questionsDeFiche("svt-s07-1-f2")[0];
QA.enregistrerReponse(qa1, true); QA.enregistrerReponse(qa2, false); QA.enregistrerReponse(qa1, true);
const memA = JSON.stringify(JA.sauvegarde.etat().posees);
verifier("Mémoire des questions posées : l'horloge compte les réponses, chaque question garde la dernière fois où elle a été posée",
  memA === JSON.stringify({ horloge: 3, questions: { [qa1.id]: 3, [qa2.id]: 2 } }) && JSON.stringify(JA.sauvegarde.nouvelle().posees) === JSON.stringify({ horloge: 0, questions: {} }), memA);
const txtA = JA.sauvegarde.texteExport();
JA.sauvegarde.remplacer(JA.sauvegarde.nouvelle());
JA.sauvegarde.importer(txtA);
const memImport = JSON.stringify(JA.sauvegarde.etat().posees);
seance(JA);
verifier("Mémoire des questions posées : gardée par l'export puis l'import, et relue telle quelle quand le jeu est rouvert", memImport === memA && JSON.stringify(JA.sauvegarde.etat().posees) === memA, [memImport, JSON.stringify(JA.sauvegarde.etat().posees)]);
const v4 = JSON.parse(JSON.stringify(JA.sauvegarde.etat())); delete v4.posees; v4.schema = 4; v4.questionsVues = { [qa1.id]: 3 };
const m5 = JA.sauvegarde.migrer(JSON.parse(JSON.stringify(v4)));
verifier("Migration 4 → 5 : rien de perdu, mémoire des questions posées ajoutée, vide",
  Object.keys(v4).filter(k => k !== "schema").every(k => JSON.stringify(m5[k]) === JSON.stringify(v4[k])) && m5.schema === 5 && JSON.stringify(m5.posees) === JSON.stringify({ horloge: 0, questions: {} }), Object.keys(m5));
verifier("Mémoire des questions posées abîmée : réparée sans planter ni rien perdre de lisible", (() => {
  const r = QA.completerPosees({ horloge: "x", questions: { a: 5, b: "z", c: 2 } }), r2 = QA.completerPosees({ horloge: 4, questions: [1, 2] });
  const vide = JSON.stringify({ horloge: 0, questions: {} });
  const e = JA.sauvegarde.nouvelle(); e.posees = 7; JA.sauvegarde.remplacer(e);
  QA.enregistrerReponse(qa1, true);
  return r.horloge === 5 && r.questions.a === 5 && r.questions.c === 2 && r2.horloge === 4 && JSON.stringify(r2.questions) === "{}" &&
    JSON.stringify(QA.completerPosees(null)) === vide && JSON.stringify(QA.completerPosees([])) === vide && e.posees.horloge === 1 && e.posees.questions[qa1.id] === 1;
})());
// revue du 15/10/2026 : une sauvegarde au schéma 5 dont la mémoire a « questions » en tableau (ou une horloge négative)
// n'était pas réparée en jeu : les dates étaient écrites dans le tableau, puis perdues à chaque enregistrement.
verifier("Mémoire des questions posées en tableau (sauvegarde au schéma 5 abîmée) : réparée au premier usage, les dates survivent à l'export et à l'import", (() => {
  const s = JA.sauvegarde.nouvelle(); s.posees = { horloge: 3, questions: [] };
  JA.sauvegarde.importer(JSON.stringify(s));
  QA.enregistrerReponse(qa1, true);
  const txt = JA.sauvegarde.texteExport();
  JA.sauvegarde.remplacer(JA.sauvegarde.nouvelle()); JA.sauvegarde.importer(txt);
  const relue = JA.sauvegarde.etat().posees;
  const n = JA.sauvegarde.nouvelle(); n.posees = { horloge: -4, questions: { [qa2.id]: 2 } }; JA.sauvegarde.remplacer(n);
  QA.enregistrerReponse(qa1, true);
  return !Array.isArray(relue.questions) && relue.horloge === 4 && relue.questions[qa1.id] === 4 && n.posees.horloge === 3 && n.posees.questions[qa1.id] === 3 && n.posees.questions[qa2.id] === 2;
})());
// ancienne sauvegarde : une question vue avant le schéma 5 (questionsVues, sans date) compte comme posée il y a longtemps
neuveA();
const fA = "physique-s07-1-f3", nivA1 = QA.questionsDeFiche(fA, [1]); // trois questions de niveau 1
nivA1.slice(0, 2).forEach(q => { JA.sauvegarde.etat().questionsVues[q.id] = 4; });
QA.oublierReponses(); for (let i = 0; i < 10; i++) QA.retenir(false); // niveau conseillé 1
const choixVu = QA.choisirPourFiche(fA, { fenetre: 60 });
verifier("Ancienne sauvegarde : une question vue avant (sans date) passe après une jamais vue du même niveau, et la fenêtre ne la bloque pas",
  nivA1.length === 3 && choixVu.id === nivA1[2].id && QA.dernierePose(nivA1[0].id, QA.posees(), JA.sauvegarde.etat().questionsVues) <= QA.posees().horloge - 60, choixVu.id);

// dans une fiche : rotation, et le niveau conseillé avant la nouveauté
neuveA();
QA.oublierReponses(); for (let i = 0; i < 10; i++) QA.retenir(false); // niveau conseillé 1 (il y reste : réponses fausses)
const tour = [];
for (let i = 0; i < 6; i++) { const q = QA.choisirPourFiche(fA); tour.push(q.id); QA.enregistrerReponse(q, false); }
verifier("Dans une fiche, les questions tournent : jamais posées d'abord, puis la plus anciennement posée (au niveau conseillé)",
  new Set(tour.slice(0, 3)).size === 3 && tour.slice(3).join() === tour.slice(0, 3).join() && tour.every(id => nivA1.some(q => q.id === id)), tour);
neuveA();
const fN = "svt-s07-1-f4";
QA.questionsDeFiche(fN, [1]).forEach(q => QA.enregistrerReponse(q, false)); // ses questions de niveau 1 ont déjà été posées
const niveauxTires = (n) => { const c = { 1: 0, 2: 0, 3: 0 }; for (let i = 0; i < n; i++) c[QA.avecNiveaux(QA.NIVEAUX_BATAILLE, () => QA.choisirPourFiche(fN)).niveau]++; return c; };
QA.oublierReponses(); for (let i = 0; i < 10; i++) QA.retenir(false);
const nivDiff = niveauxTires(30);
QA.oublierReponses(); for (let i = 0; i < 10; i++) QA.retenir(true);
const nivFort = niveauxTires(30);
QA.oublierReponses(); // au début d'une séance : 1,5
const nivDebut = niveauxTires(400);
verifier("Niveau : le niveau conseillé passe avant la question jamais vue (conseillé 1 : niveau 1 déjà posé plutôt que 2 ou 3 jamais vus ; 3 : niveau 3 ; 1,5 : niveaux 1 et 2 une fois sur deux, jamais 3)",
  nivDiff[1] === 30 && nivFort[3] === 30 && nivDebut[3] === 0 && nivDebut[1] >= 140 && nivDebut[2] >= 140, { nivDiff, nivFort, nivDebut });

// repos d'une notion
neuveA();
const r0 = JA.recit.suite(1)[0]; QA.enregistrerReponse(r0, true);
const apresJuste = []; for (let i = 0; i < 15; i++) { const q = JA.recit.suite(1)[0]; apresJuste.push(q); QA.enregistrerReponse(q, true); }
neuveA();
const r1 = JA.recit.suite(1)[0]; QA.enregistrerReponse(r1, false);
const apresFaux = []; for (let i = 0; i < 10; i++) { const q = JA.recit.suite(1)[0]; apresFaux.push(q); QA.enregistrerReponse(q, true); }
verifier("Repos d'une notion : réussie, elle ne ressort pas avant 15 questions ; ratée, pas avant 10, sauf sa « Seconde chance », 4e question après",
  apresJuste.length === 15 && apresJuste.every(q => q.fiche !== r0.fiche) && apresFaux.every((q, i) => i === 3 ? q.id === r1.id && q.rappel : q.fiche !== r1.fiche),
  { juste: apresJuste.filter(q => q.fiche === r0.fiche).length, faux: apresFaux.map(q => q.id + (q.rappel ? " (rappel)" : "")) });
neuveA();
const fR = "geographie-s07-1-f2", qsR = QA.questionsDeFiche(fR, [1, 2]);
JA.donnees.aRetravailler = [fR]; JA.progression.oublier();
QA.enregistrerReponse(qsR[0], true);
const prioUne = QA.aRevoirEnCours([fR]).length === 1;
QA.enregistrerReponse(qsR[1], true);
const prioDeux = QA.aRevoirEnCours([fR]).length === 0;
seance(JA);
verifier("Notion à revoir réussie deux fois dans la séance : elle perd sa priorité jusqu'à la séance suivante, où elle la retrouve",
  prioUne && prioDeux && QA.aRevoirEnCours([fR]).length === 1, { prioUne, prioDeux });
JA.donnees.aRetravailler = []; JA.progression.oublier();

// en jouant : quatre séances de batailles, conseils et événements, 7 réponses justes sur 10
neuveA();
let seqA = [];
for (let s = 0; s < 4; s++) { seqA = seqA.concat(jouerJeu(JA, 16, () => Math.random() < 0.7)); seance(JA); }
// fenêtre de chaque tirage : 60 en bataille et dans un événement (250 à 300 questions possibles), la moitié des vrai ou
// faux possibles au conseil (100 au plus, moins ceux qui attendent leur seconde chance) : 40 au moins
const fenA = x => x.partie === "conseil" ? 40 : 60;
verifier("Anti-répétition en jouant (4 séances de 140 questions) : aucune question ne revient à moins de 60 questions (40 au conseil), sauf en « Seconde chance »",
  seqA.length > 500 && seqA.some(x => x.rappel) && reposees(seqA, fenA) === 0, reposees(seqA, fenA));
verifier("Anti-répétition en jouant : jamais la même notion deux fois en 10 questions (hors « Seconde chance »)", memeNotion(seqA, 10) === 0, memeNotion(seqA, 10));
const famA = x => JA.recit.famille(x.matiere), pA = parts(seqA, famA);
verifier("Anti-répétition en jouant : chaque famille garde sa part (15 à 25 %)", FAM_A.every(f => (pA[f] || 0) >= 0.15 && (pA[f] || 0) <= 0.25), rond(pA));
const triplesA = seqA.filter((x, i) => i >= 2 && famA(x) === famA(seqA[i - 1]) && famA(seqA[i - 1]) === famA(seqA[i - 2]) && !x.rappel && !seqA[i - 1].rappel && !seqA[i - 2].rappel).length;
verifier("Anti-répétition en jouant : jamais trois fois de suite la même famille, sauf quand une « Seconde chance » l'impose", triplesA === 0, triplesA);
neuveA();
const seqS = jouerJeu(JA, 40, () => Math.random() < 0.7, true), ecartsS = [];
seqS.forEach((x, i) => { if (x.rappel || x.ok) return; const j = seqS.findIndex((y, k) => k > i && y.id === x.id); if (j > 0) ecartsS.push(j - i); });
verifier("« Seconde chance » à l'heure : en bataille, malgré la fenêtre et le repos des notions, chaque question ratée revient après 3 autres questions",
  ecartsS.length > 20 && ecartsS.every(e => e === 4), ecartsS.filter(e => e !== 4));
// à revoir : un cours entier à revoir, des séances de 100 questions environ
neuveA();
JA.donnees.suivi = { cours: { "geographie-s07-1": { etat: "a-revoir", note: "essai", source: "geographie-d1", le: "2026-10-15" } } }; JA.progression.oublier();
let seqRevA = [];
for (let s = 0; s < 12; s++) { seqRevA = seqRevA.concat(jouerJeu(JA, 12, () => Math.random() < 0.7)); seance(JA); }
const pRevA = parts(seqRevA.filter(x => !x.rappel), famA), autresRevA = FAM_A.filter(f => f !== "geographie").map(f => pRevA[f] || 0);
const rapportRevA = (pRevA.geographie || 0) / (autresRevA.reduce((a, b) => a + b, 0) / autresRevA.length);
verifier("À revoir, en jouant des séances de 100 questions : la famille à revoir sort toujours plus souvent, au plus 1,5 fois plus (1,2 à 1,7)",
  rapportRevA >= 1.2 && rapportRevA <= 1.7, rond(pRevA) + " ; rapport " + rapportRevA.toFixed(2));
JA.donnees.suivi = { cours: {} }; JA.progression.oublier();

// petit pool : un cours de 20 fiches, un vrai ou faux chacune ; le conseil en tire 8
const JP = contexte().JEU;
JP.sauvegarde.charger();
JP.donnees.cours["histoire-s07-2"] = coursEssai("histoire-s07-2", 20);
JP.donnees.aRetravailler = []; JP.donnees.suivi = { cours: {} }; JP.questions.vider(); JP.progression.oublier();
verifier("Fenêtre : 60 par défaut (config.js), jamais plus de la moitié des questions qui peuvent sortir",
  JP.donnees.config.fenetreQuestions === 60 && JP.questions.fenetre(1000) === 60 && JP.questions.fenetre(120) === 60 && JP.questions.fenetre(20) === 10 && JP.questions.fenetre(1) === 0);
function conseilsP(n, taux) {
  const seq = []; let pleins = true;
  for (let c = 0; c < n; c++) {
    const qs = JP.recit.suite(8, { types: ["vrai_faux"] });
    if (qs.length !== 8) pleins = false;
    for (let k = 0; k < qs.length; ) { const ok = Math.random() < taux; seq.push({ id: qs[k].id, fiche: qs[k].fiche, rappel: !!qs[k].rappel }); JP.questions.enregistrerReponse(qs[k], ok); k++; if (!ok) JP.rappels.replacer(qs, k, qs.length, { types: ["vrai_faux"] }); }
  }
  return { seq, pleins };
}
JP.sauvegarde.remplacer(JP.sauvegarde.nouvelle()); seance(JP);
const cJuste = conseilsP(15, 1);
verifier("Petit pool (20 vrai ou faux) : la fenêtre descend à 10, chaque conseil reste plein, et rien ne revient à moins de 10 questions",
  cJuste.pleins && reposees(cJuste.seq, () => 10) === 0, { pleins: cJuste.pleins, reposees: reposees(cJuste.seq, () => 10) });
JP.sauvegarde.remplacer(JP.sauvegarde.nouvelle()); seance(JP);
const cMoitie = conseilsP(15, 0.5);
verifier("Petit pool, une réponse sur deux fausse : le tirage ne bloque jamais (chaque conseil a ses 8 affirmations, « Seconde chance » comprises)",
  cMoitie.pleins && cMoitie.seq.some(x => x.rappel), cMoitie.pleins);

// vrais cours du jeu : en jouant 40 batailles, 7 réponses justes sur 10
const ctxR = contexte(), JRV = ctxR.JEU;
["index-cours", "a-retravailler"].forEach(f => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", f + ".js"), "utf8"), ctxR));
JRV.donnees.indexCours.forEach(id => {
  const f = path.join(RACINE, "jeu", "data", /^anglais-/.test(id) ? "anglais" : "cours", id + ".js");
  try { vm.runInContext(fs.readFileSync(f, "utf8"), ctxR); } catch (e) { /* un cours illisible reste dans la brume, comme dans le jeu */ }
});
JRV.sauvegarde.charger(); JRV.sauvegarde.remplacer(JRV.sauvegarde.nouvelle()); seance(JRV);
const tempsR = [], seqR = jouerJeu(JRV, 40, () => Math.random() < 0.7, true, tempsR);
tempsR.shift(); tempsR.sort((a, b) => a - b); // le tout premier tirage prépare les questions
verifier("Vrais cours, 40 batailles : aucune question ne revient à moins de 60 questions (hors « Seconde chance »), jamais la même notion deux fois en 10 questions",
  seqR.length >= 450 && reposees(seqR, () => 60) === 0 && memeNotion(seqR, 10) === 0, { reposees: reposees(seqR, () => 60), notion: memeNotion(seqR, 10) });
// mémoire remplie : exactement les questions posées (sauvegarde neuve). Avant la revue du 15/10/2026 : « plus de 300 »,
// au bord de ce que donnent 480 réponses (289 à 327 questions différentes selon le hasard) : le test échouait 1 fois sur 15.
const datees = Object.keys(JRV.sauvegarde.etat().posees.questions), poseesR = new Set(seqR.map(x => x.id));
verifier("Vrais cours, en jouant : un lot de 3 en moins de " + borneTirage(JRV) + " ms (médiane), mémoire des questions posées remplie (chaque question posée, et elles seules)",
  tempsR[Math.floor(tempsR.length / 2)] < borneTirage(JRV) && datees.length === poseesR.size && datees.length > 200 && datees.every(id => poseesR.has(id)),
  tempsR[Math.floor(tempsR.length / 2)].toFixed(2) + " ms ; " + datees.length + " datées, " + poseesR.size + " posées");

// ---------- bataille : mêlée, sang, or perdu sur erreur, niveaux 1 à 3 (demandes de Romain, 15/10/2026) ----------
const JM = contexte().JEU, MM = JM.batailleMoteur;
// route droite de 600 px : une troupe de chaque camp, qui marchent l'une vers l'autre
const routeDroite = { route: [[100, 300], [700, 300]], emplacements: [[200, 240]], emplacementsRivaux: [[600, 240]] };
function duel(typeA, typeR, avant) {
  const p = MM.creer(routeDroite, { pvRival: 999, pvChateau: 999, arsenal: { tours: {}, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } } });
  if (avant) avant(p);
  p.phase = "vague"; p.fileAmie = [typeA]; p.fileRivale = [typeR]; p.stats.envoyes = 1; p.stats.rivaux = 1;
  p.minuterieAmie = 0; p.minuterieRivale = 0;
  MM.etape(p, 0.025);
  const a = p.unites.find(u => u.camp === "joueur"), r = p.unites.find(u => u.camp === "rival");
  let g = 0;
  while (!a.adversaire && g++ < 2000) MM.etape(p, 0.025);
  return { p, a, r };
}
const d1 = duel("fantassins", "pietaille");
const engages = d1.a.adversaire === d1.r && d1.r.adversaire === d1.a && Math.abs(d1.r.s - d1.a.s) <= MM.MELEE.contact;
const sA = d1.a.s, sR = d1.r.s;
for (let k = 0; k < 8; k++) MM.etape(d1.p, 0.025);
const surPlace = Math.abs(d1.a.s - sA) <= MM.MELEE.contact / 2 && Math.abs(d1.r.s - sR) <= MM.MELEE.contact / 2 && d1.r.s - d1.a.s >= MM.MELEE.ecart - 0.01;
verifier("Mêlée : deux troupes adverses qui se rencontrent s'engagent, s'arrêtent et se font face", engages && surPlace && d1.p.stats.duels === 1,
  { engages, surPlace, ecart: d1.r.s - d1.a.s });
let gD = 0;
while (d1.a.vivant && d1.r.vivant && gD++ < 4000) MM.etape(d1.p, 0.025);
const chuteM = d1.p.effets.find(e => e.genre === "chute");
verifier("Mêlée : coups échangés jusqu'à la chute de l'une (fantassin contre piétaille : la piétaille tombe), comptée dans les ennemis arrêtés",
  !d1.r.vivant && d1.a.vivant && d1.p.stats.tues === 1 && d1.p.stats.pertes === 0 && d1.a.pv < d1.a.max &&
  d1.p.effets.some(e => e.genre === "choc") && d1.p.effets.filter(e => e.genre === "coup").length >= 2 &&
  chuteM && chuteM.melee && chuteM.type === "pietaille" && chuteM.camp === "rival" && (chuteM.regard === 1 || chuteM.regard === -1) && chuteM.duree === MM.DUREE_CHUTE,
  { stats: d1.p.stats, effets: d1.p.effets.map(e => e.genre) });
const sMort = d1.a.s;
for (let k = 0; k < 40; k++) MM.etape(d1.p, 0.025);
verifier("Mêlée : la survivante reprend sa marche (et revient dans sa file)", !d1.a.adversaire && d1.a.s - sMort > 30 && Math.abs(d1.a.cote - 9) < 0.01, { avance: d1.a.s - sMort, cote: d1.a.cote });
// (16/10/2026 : au niveau 0, ses hommes d'armes n'ont plus que 6,4 points de vie et la charge les abat d'un coup ; le
// duel se joue au niveau 2, où la charge se mesure entière)
const d2 = duel("cavaliers", "hommes", p => { p.niveau = 2; });
let gC = 0;
while (d2.r.pv === d2.r.max && gC++ < 400) MM.etape(d2.p, 0.025);
verifier("Mêlée : la charge des cavaliers frappe vite et double au premier coup", Math.abs(d2.r.max - d2.r.pv - MM.MELEE.charge * MM.TROUPES.cavaliers.coup) < 1e-9 && gC <= Math.ceil(MM.MELEE.chargeCoup / 0.025) + 1,
  { coup: d2.r.max - d2.r.pv, etapes: gC });
// (16/10/2026 : à la première province, la plus facile, son champion est réglé assez faible pour tomber devant un
// fantassin ; le duel se joue au niveau 2)
const d3 = duel("fantassins", "champion", p => { p.vague = 3; p.niveau = 2; });
let g3 = 0;
while (d3.a.vivant && d3.r.vivant && g3++ < 4000) MM.etape(d3.p, 0.025);
verifier("Mêlée : le champion adverse l'emporte sur un fantassin (perte comptée), puis reprend sa marche", !d3.a.vivant && d3.r.vivant && d3.p.stats.pertes === 1 && d3.p.stats.tues === 0 && (MM.etape(d3.p, 0.025), !d3.r.adversaire), d3.p.stats);
// le moteur ne lit pas le réglage du sang : mêmes effets, coupé ou non (c'est le rendu qui les dessine ou non)
function effetsDuel(sang) {
  JM.sauvegarde.remplacer(JM.sauvegarde.nouvelle()); JM.sauvegarde.etat().reglages.sang = sang;
  const d = duel("fantassins", "pietaille");
  let g = 0; while (d.r.vivant && g++ < 4000) MM.etape(d.p, 0.025);
  return d.p.effets.map(e => e.genre + "@" + e.x.toFixed(2)).join(" ");
}
verifier("Mêlée : le moteur émet les mêmes effets (choc, coups, chute), sang coupé ou non", effetsDuel(true) === effetsDuel(false) && /coup/.test(effetsDuel(false)));
// soldats tombés : au plus TOMBES à la fois, effacés après DUREE_CHUTE ; les autres effets durent DUREE_EFFET
const d4 = duel("fantassins", "pietaille");
for (let i = 0; i < MM.TOMBES + 5; i++) d4.p.effets.push({ genre: "chute", x: i, y: 0, age: 0, duree: MM.DUREE_CHUTE });
let g4 = 0; while (d4.r.vivant && g4++ < 4000) MM.etape(d4.p, 0.025);
const nbChutes = d4.p.effets.filter(e => e.genre === "chute").length, nouvelleGardee = d4.p.effets.some(e => e.genre === "chute" && e.type === "pietaille");
d4.p.phase = "preparation";
for (let k = 0; k < Math.round((MM.DUREE_EFFET + 0.1) / 0.05); k++) MM.etape(d4.p, 0.05);
const apresEffet = d4.p.effets.map(e => e.genre);
for (let k = 0; k < Math.round(MM.DUREE_CHUTE / 0.05); k++) MM.etape(d4.p, 0.05);
verifier("Soldats tombés : au plus " + MM.TOMBES + " à l'écran (le plus récent gardé), couchés " + MM.DUREE_CHUTE + " s puis effacés",
  nbChutes === MM.TOMBES && nouvelleGardee && apresEffet.length && apresEffet.every(x => x === "chute") && d4.p.effets.length === 0, { nbChutes, apresEffet: apresEffet.length, fin: d4.p.effets.length });
// une vraie vague avec mêlée : le tableau de la mêlée reste juste à chaque instant (chaque soldat est en marche, tombé ou arrivé)
const touteArmeeM = { tours: { archers: 1, piquiers: 1, baliste: 1, catapulte: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } };
const pv = MM.creer(J.cartesBataille.carte("gue"), { niveau: 2, orDepart: 400, pvRival: 999, arsenal: touteArmeeM });
MM.poserTour(pv, "archers", 0); MM.poserTour(pv, "baliste", 1);
["fantassins", "fantassins", "cavaliers", "belier", "fantassins"].forEach(t => MM.envoyer(pv, t));
let tableauJuste = true, gV = 0;
for (let w = 0; w < 3 && pv.phase === "preparation"; w++) {
  if (w) { pv.or = 200; ["fantassins", "cavaliers", "fantassins"].forEach(t => MM.envoyer(pv, t)); }
  MM.lancerVague(pv);
  while (pv.phase === "vague" && gV++ < 60000) {
    MM.etape(pv, 0.025);
    const amis = pv.unites.filter(u => u.vivant && u.camp === "joueur").length, rivaux = pv.unites.filter(u => u.vivant && u.camp === "rival").length;
    if (amis + pv.fileAmie.length + pv.stats.pertes + pv.stats.arrivees !== pv.stats.envoyes || rivaux + pv.fileRivale.length + pv.stats.tues + pv.stats.fuites !== pv.stats.rivaux) tableauJuste = false;
  }
}
verifier("Vague avec mêlée : tableau de la mêlée toujours juste (en marche + arrêtés + aux murs = troupes engagées, des deux côtés)",
  tableauJuste && pv.stats.duels > 0 && pv.stats.tues > 0 && pv.stats.envoyes > 0, pv.stats);
// or du conseil de guerre : juste +12 (et +10 au 3e succès d'affilée), faux −6 (première réponse ou « Seconde chance »),
// pris sur l'or de la bataille, jamais sous zéro ; rien d'autre ne bouge
const pg = MM.creer(routeDroite, { orDepart: 10 });
const repG = [MM.repondre(pg, true), MM.repondre(pg, true), MM.repondre(pg, true)];
const orApresSerie = pg.or;
const repF = MM.repondre(pg, false), orApresErreur = pg.or, serieApresErreur = pg.serie;
verifier("Or : +12 par bonne réponse, +10 de plus au 3e succès d'affilée", repG.map(r => r.or).join() === "12,12,22" && repG[2].eclat && orApresSerie === 56, repG);
verifier("Or : une erreur coûte 6 or (config.js, orPerduErreur) et casse la série", JM.donnees.config.orPerduErreur === 6 && MM.OR_PERDU === 6 && repF.or === -6 && orApresErreur === 50 && serieApresErreur === 0 && !repF.eclat, { repF, orApresErreur });
pg.or = 4;
const repPlancher = [MM.repondre(pg, false).or, pg.or, MM.repondre(pg, false).or, pg.or];
verifier("Or : jamais en dessous de zéro (4 or, deux erreurs : −4 puis rien)", repPlancher.join() === "-4,0,0,0", repPlancher);
const pg0 = MM.creer(routeDroite, { orDepart: 30, orPerduErreur: 0 }), pg6 = MM.creer(routeDroite, { orDepart: 30 });
MM.repondre(pg0, false); MM.repondre(pg6, false);
verifier("Or : orPerduErreur 0 coupe la perte ; absent, 6 par défaut", pg0.or === 30 && pg6.or === 24, [pg0.or, pg6.or]);
JM.sauvegarde.remplacer(JM.sauvegarde.nouvelle());
const ressourcesAvant = JSON.stringify(JM.sauvegarde.etat().ressources), campagneAvant = JSON.stringify(JM.campagne.etat());
const pgR = MM.creer(routeDroite, Object.assign(JM.campagne.options(0), { orPerduErreur: JM.donnees.config.orPerduErreur }));
for (let i = 0; i < 5; i++) MM.repondre(pgR, false);
verifier("Or : une erreur ne retire rien au royaume (ressources, campagne, provinces)", JSON.stringify(JM.sauvegarde.etat().ressources) === ressourcesAvant && JSON.stringify(JM.campagne.etat()) === campagneAvant && pgR.or === 30);

// seigneur rival réglé niveau par niveau (15/10/2026, atelier/outils/simuler-bataille.js) : tout passe par la table RIVAL,
// tes troupes ne changent pas ; défense du domaine : troupes adverses plus solides (assaut), coups aux murs doublés
// (16/10/2026, IA du rival : tours debout dès le début, tours bâties à chaque vague, garnison, solidité d'un garde, trésor)
const RV = MM.RIVAL, CLES_RIVAL = ["renfort", "pv", "tirs", "coup", "toursDepart", "toursVague", "garnison", "garde", "tresor", "impot", "assaut"];
verifier("Rival par niveau : une ligne par niveau de province (0 à 4), chaque réglage présent ; tes troupes n'ont pas changé",
  RV.length === 5 && RV.every(r => CLES_RIVAL.every(k => typeof r[k] === "number" && r[k] >= 0) && r.pv > 0 && r.tirs > 0 && r.coup > 0 && r.assaut >= 1 && r.garde > 0 &&
    r.toursDepart >= 1 && r.garnison >= 1 && ["renfort", "toursDepart", "toursVague", "garnison", "tresor", "impot"].every(k => Number.isInteger(r[k]))) &&
  JSON.stringify(["fantassins", "cavaliers", "belier"].map(t => [MM.TROUPES[t].pv, MM.TROUPES[t].coup])) === "[[8,3],[12,3.5],[80,5]]", RV);
// une piétaille adverse qui entre en jeu (vague 1), sans tours ni troupes à toi
function rivalEnJeu(niveau, carte, opts) {
  const p = MM.creer(carte || routeDroite, Object.assign({ niveau: niveau, pvRival: 999, pvChateau: 999 }, opts || {}));
  p.phase = "vague"; p.fileRivale = ["pietaille"]; p.stats.rivaux = 1; p.minuterieRivale = 0; p.minuterieAmie = 99;
  MM.etape(p, 0.025);
  return { p, u: p.unites.find(x => x.camp === "rival") };
}
const tourRivale = { rivale: true, type: "archers", niveau: 1 }, presque = (a, b) => Math.abs(a - b) < 1e-9;
const parNiveau = RV.map((r, n) => {
  const { p, u } = rivalEnJeu(n), E = MM.ENNEMIS.pietaille;
  return !p.defense && presque(u.max, E.pv * r.pv) && presque(u.coup, E.coup * r.coup) && u.degats === E.degats && presque(MM.degatsTour(p, tourRivale), MM.TOURS_RIVALES.archers.degats * r.tirs);
});
verifier("Rival par niveau : points de vie et coups de ses troupes, tirs de ses tours suivent la table", parNiveau.every(Boolean), parNiveau);
// depuis le 16/10/2026, ses tours de départ sont debout dès la préparation de la 1re vague, et il bâtit les suivantes à la
// fin de chaque vague (rivalReagit), avec son or : face à un joueur qui ne fait rien (ni troupes, ni tours, ni or gardé),
// il est dans sa posture « equilibre » et bâtit RIVAL.toursVague tours de plus
const vaguesNiveau = RV.map((r, n) => {
  const carte = JM.cartesBataille.carte("gue"), p = MM.creer(carte, { niveau: n, vagues: 4, pvRival: 999, pvChateau: 999, orDepart: 0 });
  const tours0 = p.toursRivales.length;
  MM.lancerVague(p);
  const file0 = p.fileRivale.length, toursLancement = p.toursRivales.length;
  p.fileRivale = []; p.stats.rivaux = 0; p.vague = 1; p.phase = "preparation";
  MM.rivalReagit(p);
  const tours1 = p.toursRivales.length, decision = p.ia.journal[p.ia.journal.length - 1], renforts = p.ia.renfort.length;
  MM.lancerVague(p);
  return tours0 === Math.min(r.toursDepart, carte.emplacementsRivaux.length) && toursLancement === tours0 && decision.posture === "equilibre" &&
    tours1 === Math.min(carte.emplacementsRivaux.length, r.toursDepart + r.toursVague) && p.toursRivales.length === tours1 &&
    file0 === MM.VAGUES.base + r.renfort && p.fileRivale.length === MM.VAGUES.base + MM.VAGUES.parVague + r.renfort + renforts;
});
verifier("Rival par niveau : renfort de chaque vague ; ses tours de départ debout avant la 1re vague, puis RIVAL.toursVague tours bâties après chaque vague quand rien ne le presse (rien n'est bâti au lancement d'une vague)", vaguesNiveau.every(Boolean), vaguesNiveau);
const pHors = MM.creer(routeDroite, { niveau: 9 }), pNeg = MM.creer(routeDroite, { niveau: -2 });
verifier("Rival par niveau : un niveau hors de la table prend le plus proche", presque(MM.degatsTour(pHors, tourRivale), RV[4].tirs) && presque(MM.degatsTour(pNeg, tourRivale), RV[0].tirs));
const dDom = rivalEnJeu(2, JM.cartesBataille.carte("domaine")), dGue = rivalEnJeu(2, JM.cartesBataille.carte("gue"));
const dForce = rivalEnJeu(2, routeDroite, { defense: true }), dNon = rivalEnJeu(2, JM.cartesBataille.carte("domaine"), { defense: false });
verifier("Défense du domaine : reconnue à sa carte (ou à options.defense) ; troupes adverses « assaut » fois plus solides, coups aux murs doublés, seulement là",
  dDom.p.defense && !dGue.p.defense && dForce.p.defense && !dNon.p.defense && Number.isInteger(MM.DEFENSE.degats) && MM.DEFENSE.degats === 2 &&
  presque(dDom.u.max, MM.ENNEMIS.pietaille.pv * RV[2].pv * RV[2].assaut) && dDom.u.degats === MM.ENNEMIS.pietaille.degats * MM.DEFENSE.degats &&
  presque(dGue.u.max, MM.ENNEMIS.pietaille.pv * RV[2].pv) && dGue.u.degats === MM.ENNEMIS.pietaille.degats && presque(dDom.u.coup, dGue.u.coup) &&
  presque(dNon.u.max, dGue.u.max), { domaine: [dDom.u.max, dDom.u.degats], gue: [dGue.u.max, dGue.u.degats] });
const brecheDom = rivalEnJeu(0, routeDroite, { defense: true });
let gBr = 0; while (!brecheDom.p.stats.fuites && gBr++ < 4000) MM.etape(brecheDom.p, 0.025);
const effetBreche = brecheDom.p.effets.find(e => e.genre === "breche");
verifier("Défense du domaine : une piétaille qui atteint tes murs y porte 2 coups (« −2 » à l'écran)",
  brecheDom.p.stats.fuites === 1 && brecheDom.p.chateau.pv === 997 && effetBreche && effetBreche.degats === 2, { pv: brecheDom.p.chateau.pv, effet: effetBreche });
// ---------- seigneur rival : défenses dès le début, garnison à sa porte, décisions (16/10/2026, demande de Romain :
// « il ne crée pas de défense au début, du coup on peut spammer les soldats dès la première manche ») ----------
const CARTES_RIVAL = ["gue", "foret", "moulin", "col", "chateau", "domaine"], GA = MM.GARNISON, IAR = MM.IA;
const departOk = [];
RV.forEach((r, n) => CARTES_RIVAL.forEach(id => {
  const carte = JM.cartesBataille.carte(id), p = MM.creer(carte, { niveau: n }), R = MM.preparerRoute(carte.route), t0 = p.toursRivales[0];
  // la première tour couvre la route devant sa porte (les IA.porte derniers px, sur la file de tes troupes)
  let couvrePorte = false;
  if (t0) for (let s = R.longueur - IAR.porte; s <= R.longueur; s += 5) { const q = MM.surRoute(R, s, 9); if (Math.hypot(q.x - t0.x, q.y - t0.y) <= MM.TOURS_RIVALES.archers.portee) couvrePorte = true; }
  const surEmplacements = p.toursRivales.every(t => { const e = carte.emplacementsRivaux[t.emplacement]; return e && e[0] === t.x && e[1] === t.y && t.type === "archers"; }) &&
    new Set(p.toursRivales.map(t => t.emplacement)).size === p.toursRivales.length;
  const avant = p.toursRivales.length;
  MM.lancerVague(p);
  departOk.push({ n, id, ok: avant === Math.min(r.toursDepart, carte.emplacementsRivaux.length) && avant >= 1 && couvrePorte && surEmplacements && p.toursRivales.length === avant &&
    p.garnison.taille === r.garnison && p.garnison.reserve === r.garnison && p.ia.journal[0].posture === "depart" && typeof p.ia.journal[0].texte === "string" && p.ia.or === r.tresor });
}));
verifier("IA du rival : à chaque niveau et sur chaque carte, des tours d'archers debout dès le début (la première couvre la route devant sa porte, sur ses emplacements ; plus nombreuses aux niveaux hauts), une garnison et son trésor, rien de bâti au lancement de la vague",
  departOk.every(x => x.ok) && RV.every((r, n) => n === 0 || (r.toursDepart >= RV[n - 1].toursDepart && r.garde >= RV[0].garde)) && RV[4].toursDepart > RV[0].toursDepart,
  departOk.filter(x => !x.ok));
// troupes à toi seules contre sa garnison, sur une route droite de 880 px (ni tours rivales, ni vague rivale)
const routeLongue = { route: [[60, 330], [940, 330]], emplacements: [[150, 250], [250, 250], [350, 250]], emplacementsRivaux: [[880, 250]] };
function contreGarnison(niveau, ordres, tours, garder) {
  const p = MM.creer(routeLongue, { niveau, pvRival: 999, pvChateau: 999, orDepart: 999, arsenal: { tours: { archers: 1, piquiers: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } } });
  p.toursRivales = [];
  (tours || []).forEach((t, i) => MM.poserTour(p, t, i));
  ordres.forEach(t => MM.envoyer(p, t));
  MM.lancerVague(p);
  p.stats.rivaux -= p.fileRivale.length; p.fileRivale = [];
  if (garder) { p.stats.envoyes -= p.fileAmie.length - garder; p.fileAmie = p.fileAmie.slice(0, garder); } // (garder : soldats gardés dans la file)
  const L = p.route.longueur, g = p.garnison;
  const obs = { reserve0: g.reserve, rappel: g.rappel, journal: p.ia.journal.slice(), dehorsMax: 0, plusLoin: 0, premiereSortie: null, degatsQuandTient: 0, porteVue: false,
    porteOuverte: false, effetSortie: false, effetRentree: false, reserveApresRentree: null, tableau: true, duree: 0 };
  let n = 0;
  while (p.phase === "vague" && n++ < 20000) {
    const tenait = g.tient, pv = p.rival.pv, rentrees = p.stats.rentrees;
    MM.etape(p, 0.025);
    if (p.stats.rentrees > rentrees && obs.reserveApresRentree === null) obs.reserveApresRentree = g.reserve;
    p.effets.forEach(e => { if (e.genre === "porteOuverte") obs.porteOuverte = true; if (e.genre === "sortie") obs.effetSortie = true; if (e.genre === "rentree") obs.effetRentree = true; });
    if (p.phase !== "vague") break;
    const gardes = p.unites.filter(u => u.vivant && u.garnison), amis = p.unites.filter(u => u.vivant && u.camp === "joueur");
    obs.dehorsMax = Math.max(obs.dehorsMax, gardes.length);
    gardes.forEach(u => { obs.plusLoin = Math.max(obs.plusLoin, L - u.s); });
    if (obs.premiereSortie === null && p.stats.sorties > 0) obs.premiereSortie = Math.max.apply(null, amis.map(u => u.s).concat([0]));
    if (tenait && p.rival.pv < pv) obs.degatsQuandTient += pv - p.rival.pv;
    if (amis.some(u => u.porte && Math.abs(u.s - (L - GA.attente)) < 1e-9)) obs.porteVue = true;
    if (amis.length + p.fileAmie.length + p.stats.pertes + p.stats.arrivees !== p.stats.envoyes ||
        p.unites.filter(u => u.vivant && u.camp === "rival").length + p.fileRivale.length + p.stats.tues + p.stats.fuites !== p.stats.rivaux) obs.tableau = false;
  }
  obs.duree = p.temps; obs.p = p; obs.L = L;
  return obs;
}
// 1. une ruée de 18 fantassins sans tours (90 or de troupes, 0 de défenses) : ses guetteurs rappellent des gardes
const gar1 = contreGarnison(0, ["fantassins", "fantassins", "fantassins", "fantassins", "fantassins", "fantassins"]);
const rappelAttendu = Math.min(GA.rappel, Math.floor((90 - IAR.alerte) / IAR.parGarde));
verifier("Garnison : ses gardes sortent quand tes troupes approchent de sa porte (pas avant), jamais plus que la garnison de la vague (rappelés compris), jamais à plus de zone + marge de sa porte",
  gar1.rappel === rappelAttendu && gar1.reserve0 === RV[0].garnison + rappelAttendu && gar1.premiereSortie >= gar1.L - GA.zone && gar1.dehorsMax >= 2 && gar1.dehorsMax <= gar1.reserve0 &&
  gar1.p.stats.sorties <= gar1.reserve0 + gar1.p.stats.rentrees && gar1.p.stats.gardesTombes <= gar1.reserve0 && gar1.plusLoin <= GA.zone + GA.marge + 1e-6 && gar1.effetSortie && gar1.tableau,
  { rappel: gar1.rappel, attendu: rappelAttendu, reserve0: gar1.reserve0, premiereSortie: gar1.premiereSortie, L: gar1.L, dehorsMax: gar1.dehorsMax, plusLoin: gar1.plusLoin, stats: gar1.p.stats });
// 2. sans ruée (deux tours, 45 or de troupes) : un seul garde ; tes troupes arrivées à sa porte attendent sans frapper ses
// murs tant que la garnison tient ; garnison vaincue : porte ouverte, et les murs prennent les coups
const gar2 = contreGarnison(0, ["fantassins", "fantassins", "fantassins"], ["archers", "piquiers"]);
verifier("Garnison : tant qu'il lui reste un garde, tes troupes arrivées à sa porte s'arrêtent devant et ne frappent pas ses murs ; garnison vaincue, porte ouverte (effet), puis les coups portent",
  gar2.rappel === 0 && gar2.reserve0 === RV[0].garnison && gar2.porteVue && gar2.degatsQuandTient === 0 && gar2.porteOuverte && gar2.p.stats.degatsRival > 0 && gar2.p.stats.gardesTombes === RV[0].garnison && gar2.tableau,
  { reserve0: gar2.reserve0, porteVue: gar2.porteVue, degatsQuandTient: gar2.degatsQuandTient, porteOuverte: gar2.porteOuverte, stats: gar2.p.stats });
// 3. un seul fantassin (un des trois de la troupe) contre le garde du niveau 2, plus solide : le garde gagne, puis rentre
// et compte de nouveau dans la garnison de la vague ; la vague se termine
const gar3 = contreGarnison(2, ["fantassins"], ["archers", "piquiers"], 1);
verifier("Garnison : un garde vainqueur, sans troupe à toi près de sa porte, rentre (effet) et compte de nouveau dans la garnison de la vague ; la vague se termine",
  gar3.p.stats.pertes === 1 && gar3.p.stats.rentrees >= 1 && gar3.effetRentree && gar3.reserveApresRentree === RV[2].garnison && gar3.p.phase === "preparation" && gar3.p.stats.degatsRival === 0 && gar3.tableau,
  { stats: gar3.p.stats, reserveApresRentree: gar3.reserveApresRentree, phase: gar3.p.phase });
// 4. la garnison se reforme à chaque vague ; les gardes achetés en plus et abattus, il les rachète avec son or (au moins
// sa garnison de départ revient toujours)
const pReleve = MM.creer(routeLongue, { niveau: 3, orDepart: 0 });
pReleve.garnison.taille = 3; pReleve.garnison.tombes = 3; pReleve.garnison.rappel = 0; pReleve.ia.or = 0; pReleve.vague = 1;
MM.rivalReagit(pReleve);
const jReleve = pReleve.ia.journal[pReleve.ia.journal.length - 1], aReleve = jReleve.actions.find(x => x.genre === "releve");
const pReleve2 = MM.creer(routeLongue, { niveau: 3, orDepart: 0 });
pReleve2.garnison.taille = 3; pReleve2.garnison.tombes = 3; pReleve2.garnison.rappel = 2; pReleve2.ia.or = 200; pReleve2.vague = 1;
MM.rivalReagit(pReleve2);
verifier("Garnison : elle se reforme à chaque vague ; les gardes achetés et abattus se rachètent (" + MM.PRIX_RIVAL.garde + " or chacun, s'il en a les moyens), les rappelés tombés d'abord ne se remplacent pas",
  aReleve && aReleve.perdus === 2 && aReleve.nombre === Math.floor(RV[3].impot / MM.PRIX_RIVAL.garde) && pReleve.garnison.taille === RV[3].garnison + aReleve.nombre &&
  pReleve.garnison.reserve === pReleve.garnison.taille && pReleve.garnison.tombes === 0 && /remplacer/.test(jReleve.texte) &&
  pReleve2.garnison.taille === 3 && pReleve2.garnison.reserve === 3 && pReleve2.ia.journal[pReleve2.ia.journal.length - 1].actions.some(x => x.genre === "releve" && x.perdus === 1 && x.nombre === 1),
  { releve: aReleve, taille: pReleve.garnison.taille, texte: jReleve.texte, taille2: pReleve2.garnison.taille });
// 5. ruée à la 1re vague au Gué (niveau 0, place forte de 16) contre la même bataille jouée équilibrée
function premiereVague(ordres, tours) {
  const p = MM.creer(JM.cartesBataille.carte("gue"), { niveau: 0, vagues: 4, pvRival: 16, pvRivalMax: 16, orDepart: 96, arsenal: { tours: { archers: 1, piquiers: 1 }, troupes: { fantassins: 1 } } });
  (tours || []).forEach(t => { const libre = JM.cartesBataille.carte("gue").emplacements.findIndex((e, i) => MM.emplacementLibre(p, i)); MM.poserTour(p, t, libre); });
  ordres.forEach(t => MM.envoyer(p, t));
  const nJ = p.ia.journal.length, toursRivales0 = p.toursRivales.map(t => t.emplacement), libres = MM.couvertureRivale(p).filter(c => toursRivales0.indexOf(c.i) < 0);
  MM.lancerVague(p);
  const alerte = p.ia.journal.slice(nJ).find(j => j.posture === "alerte"), effetAlerte = p.effets.some(e => e.genre === "alerte"), reserve = p.garnison.reserve;
  let tourVue = null, n = 0;
  while (p.phase === "vague" && n++ < 20000) { MM.etape(p, 0.025); p.effets.forEach(e => { if (e.genre === "tourRivale") tourVue = e; }); }
  const decision = p.ia.journal[p.ia.journal.length - 1];
  return { p, alerte, effetAlerte, reserve, coups: p.stats.degatsRival, decision, tourVue, libres };
}
const ruee = premiereVague(["fantassins", "fantassins", "fantassins", "fantassins", "fantassins", "fantassins"]);
const equi = premiereVague(["fantassins", "fantassins"], ["archers", "piquiers"]);
const tourRuee = ruee.decision.actions.find(x => x.genre === "tour");
const meilleurePorte = ruee.libres.slice().sort((a, b) => (b.porte - a.porte) || (b.tout - a.tout) || (a.i - b.i))[0];
verifier("IA du rival contre une ruée (tout l'or en troupes dès la 1re vague) : ses guetteurs rappellent des gardes (effet « alerte »), la ruée porte au plus un tiers de la solidité, puis il fortifie sa porte (une tour devant sa porte, effet « tourRivale ») ; une armée avec des tours ne déclenche rien",
  ruee.alerte && ruee.alerte.actions[0].nombre === Math.min(GA.rappel, Math.floor((90 - IAR.alerte) / IAR.parGarde)) && ruee.effetAlerte && ruee.reserve === RV[0].garnison + ruee.alerte.actions[0].nombre &&
  ruee.coups <= 16 / 3 && ruee.decision.posture === "porte" && tourRuee && tourRuee.emplacement === meilleurePorte.i && ruee.tourVue && ruee.tourVue.emplacement === tourRuee.emplacement &&
  !equi.alerte && equi.decision.posture !== "porte" && equi.reserve === RV[0].garnison,
  { alerte: ruee.alerte, coups: ruee.coups, decision: ruee.decision, porte: meilleurePorte, equilibre: equi.decision.posture, coupsEquilibre: equi.coups });
// 6. tortue : rien que des tours, aucune troupe : il lève des hommes d'armes pour sa prochaine vague
const pTortue = MM.creer(JM.cartesBataille.carte("gue"), { niveau: 1, vagues: 4, pvRival: 999, orDepart: 200, arsenal: { tours: { archers: 1, piquiers: 1, baliste: 1 }, troupes: { fantassins: 1 } } });
["archers", "baliste", "piquiers", "archers"].forEach((t, i) => MM.poserTour(pTortue, t, i));
MM.jouerVague(pTortue, 0.05);
const jTortue = pTortue.ia.journal[pTortue.ia.journal.length - 1], renfortsTortue = pTortue.ia.renfort.slice();
MM.lancerVague(pTortue);
verifier("IA du rival contre une tortue (que des tours, aucune troupe) : il lève des hommes d'armes, plus solides, qui partent dans sa vague suivante",
  jTortue.posture === "armee" && renfortsTortue.length > 0 && renfortsTortue.every(t => t === "hommes") &&
  pTortue.fileRivale.filter(t => t === "hommes").length === renfortsTortue.length && pTortue.fileRivale.length === MM.VAGUES.base + MM.VAGUES.parVague + RV[1].renfort + renfortsTortue.length,
  { journal: jTortue, renforts: renfortsTortue, file: pTortue.fileRivale });
// 6 bis. thésauriseur (revue du 16/10/2026) : deux tours à la 1re vague, puis rien pendant trois vagues en gardant son or,
// puis quatre tours de siège d'un coup à la dernière. Avant la revue, « mefiance » n'achetait qu'un garde, et les guetteurs
// ne comparaient l'armée qu'aux tours du joueur : la Forteresse anglaise tombait en 1,6 bataille au lieu de 4. Maintenant :
// à chaque vague d'or gardé, il fortifie sa porte (tour, garde) ; ses guetteurs comptent l'or gardé avec l'armée.
// garder : l'or s'accumule (60, 120, 180 au départ des vagues 1 à 3) ; sinon le même or n'arrive qu'à la 4e vague.
function thesauriseur(garder) {
  const p = MM.creer(JM.cartesBataille.carte("chateau"), { niveau: 4, vagues: 4, pvRival: 32, pvRivalMax: 32, pvChateau: 999, orDepart: 80,
    arsenal: { tours: { archers: 1, piquiers: 1, baliste: 1, catapulte: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } } });
  MM.poserTour(p, "archers", 0); MM.poserTour(p, "baliste", 1); // 80 or de défenses, et plus rien ensuite
  const decisions = [];
  for (let w = 0; w < 3; w++) {
    p.or = garder ? 60 * (w + 1) : 0;
    MM.jouerVague(p, 0.05);
    decisions.push(p.ia.journal[p.ia.journal.length - 1]);
  }
  p.or = 180;
  for (let k = 0; k < 4; k++) MM.envoyer(p, "belier");
  const toursAvant = p.toursRivales.length;
  MM.lancerVague(p);
  const alerte = p.ia.journal[p.ia.journal.length - 1];
  let n = 0;
  while (p.phase === "vague" && n++ < 40000) MM.etape(p, 0.05);
  return { p, decisions, rappel: p.garnison.rappel, alerte: alerte.posture === "alerte" ? alerte : null, toursAvant, coups: p.stats.degatsRival, phase: p.phase };
}
const theso = thesauriseur(true), sansTheso = thesauriseur(false);
const rappelSans = Math.min(GA.rappel, Math.floor((180 - 80 - IAR.alerte) / IAR.parGarde)), rappelAvec = Math.min(GA.rappel, Math.floor((180 + 180 - 80 - IAR.alerte) / IAR.parGarde));
verifier("IA du rival contre un thésauriseur (or gardé trois vagues, puis quatre tours de siège d'un coup) : à chaque vague d'or gardé il se méfie, fortifie sa porte (tour devant la porte, garde) ; " +
  "ses guetteurs comptent l'or gardé avec l'armée (plus de gardes rappelés que pour la même armée sans or gardé, " + rappelAvec + " contre " + rappelSans + ") ; la ruée préparée porte au plus un tiers de la solidité",
  theso.decisions.every(j => j.posture === "mefiance" && j.actions.some(a => a.genre === "tour")) && theso.decisions.slice(0, 2).every(j => j.actions.some(a => a.genre === "garde")) &&
  theso.p.toursRivales.length >= theso.toursAvant && theso.toursAvant === RV[4].toursDepart + 3 &&
  theso.alerte && theso.alerte.actions[0].orVu === 180 && theso.rappel === rappelAvec && theso.alerte.actions[0].nombre === rappelAvec &&
  sansTheso.alerte && sansTheso.alerte.actions[0].orVu === 0 && sansTheso.rappel === rappelSans && rappelAvec > rappelSans &&
  sansTheso.decisions.every(j => j.posture !== "mefiance") && theso.coups <= 32 / 3 && theso.phase !== "vague",
  { decisions: theso.decisions.map(j => j.posture + " " + JSON.stringify(j.actions)), rappel: theso.rappel, rappelSans: sansTheso.rappel, alerte: theso.alerte && theso.alerte.actions, coups: theso.coups, coupsSans: sansTheso.coups, phase: theso.phase });
// 7. tout est sans hasard : la même bataille, jouée avec deux tirages au hasard différents, donne les mêmes décisions
function batailleScriptee(alea) {
  const ctx = contexte();
  if (alea) vm.runInContext("Math.random = (function () { var a = 7; return function () { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();", ctx);
  const M2 = ctx.JEU.batailleMoteur, p = M2.creer(ctx.JEU.cartesBataille.carte("col"), { niveau: 3, vagues: 4, pvRival: 30, orDepart: 150,
    arsenal: { tours: { archers: 2, piquiers: 2, baliste: 2, catapulte: 1 }, troupes: { fantassins: 2, cavaliers: 2, belier: 1 } } });
  const ordres = [["cavaliers", "cavaliers", "fantassins", "fantassins", "fantassins"], ["archers"], ["belier", "fantassins"], []];
  for (let w = 0; w < 4 && p.phase === "preparation"; w++) {
    p.or += 60;
    ordres[w].forEach(t => { if (M2.TOURS[t]) M2.poserTour(p, t, p.tours.length); else M2.envoyer(p, t); });
    M2.jouerVague(p, 0.025);
  }
  return JSON.stringify({ journal: p.ia.journal, stats: p.stats, rival: p.rival, chateau: p.chateau, temps: Math.round(p.temps * 1000), tours: p.toursRivales.map(t => t.type + t.emplacement), garnison: p.garnison, fin: p.fin });
}
const scriptA = batailleScriptee(false), scriptB = batailleScriptee(true);
verifier("IA du rival : sans hasard, la même bataille jouée deux fois (tirages au hasard différents) donne les mêmes décisions, les mêmes combats et la même issue",
  scriptA === scriptB && JSON.parse(scriptA).journal.length >= 4, scriptA === scriptB ? null : { a: scriptA.slice(0, 400), b: scriptB.slice(0, 400) });
// 8. aucune vague bloquée : ruée, tortue et armée mêlée, à chaque niveau, sur les cinq cartes d'attaque et le domaine
const bloquees = [];
let vagueMax = 0;
RV.forEach((r, n) => CARTES_RIVAL.forEach(id => ["ruee", "tortue", "mixte"].forEach(style => {
  const p = MM.creer(JM.cartesBataille.carte(id), { niveau: n, vagues: 4, pvRival: 999, pvChateau: 999, orDepart: 120,
    arsenal: { tours: { archers: 1, piquiers: 1, baliste: 1, catapulte: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } } });
  for (let w = 0; w < 4 && p.phase === "preparation"; w++) {
    p.or += 90;
    if (style !== "ruee") for (let k = 0; k < 2; k++) MM.poserTour(p, ["archers", "piquiers", "baliste", "catapulte"][(w + k) % 4], p.tours.length);
    if (style !== "tortue") for (const t of ["belier", "cavaliers", "fantassins", "fantassins", "cavaliers"]) MM.envoyer(p, t);
    const t0 = p.temps;
    MM.jouerVague(p, 0.05);
    vagueMax = Math.max(vagueMax, p.temps - t0);
    if (p.phase === "vague" || p.temps - t0 > 400) bloquees.push({ n, id, style, w, duree: Math.round(p.temps - t0) });
  }
})));
verifier("IA du rival : aucune vague bloquée (ruée, tortue, armée mêlée ; niveaux 0 à 4 ; cinq cartes et le domaine) : chaque vague se termine en moins de 400 s",
  bloquees.length === 0, { bloquees: bloquees.slice(0, 5), vagueMax: Math.round(vagueMax) });
// 9. le tableau de la mêlée reste juste avec la garnison (gardes sortis, tombés, rentrés), sur une vraie vague rivale
const pvG = MM.creer(J.cartesBataille.carte("moulin"), { niveau: 2, orDepart: 300, pvRival: 999, arsenal: touteArmeeM });
let tableauGarnison = true, gG = 0;
for (let w = 0; w < 3 && pvG.phase === "preparation"; w++) {
  pvG.or += 150; ["cavaliers", "fantassins", "belier", "fantassins", "cavaliers"].forEach(t => MM.envoyer(pvG, t));
  MM.lancerVague(pvG);
  while (pvG.phase === "vague" && gG++ < 60000) {
    MM.etape(pvG, 0.025);
    const amis = pvG.unites.filter(u => u.vivant && u.camp === "joueur").length, rivaux = pvG.unites.filter(u => u.vivant && u.camp === "rival").length;
    if (amis + pvG.fileAmie.length + pvG.stats.pertes + pvG.stats.arrivees !== pvG.stats.envoyes || rivaux + pvG.fileRivale.length + pvG.stats.tues + pvG.stats.fuites !== pvG.stats.rivaux) tableauGarnison = false;
  }
}
verifier("Vague avec garnison : tableau de la mêlée toujours juste (gardes sortis, tombés et rentrés compris, des deux côtés)",
  tableauGarnison && pvG.stats.sorties > 0 && pvG.stats.gardesTombes > 0 && pvG.stats.duels > 0, pvG.stats);
// 10. chaque décision du rival a sa phrase (le rendu peut l'afficher telle quelle) et ses actions
const postures = new Set();
[ruee.p, equi.p, pTortue, pReleve].forEach(p => p.ia.journal.forEach(j => { postures.add(j.posture); if (typeof j.texte !== "string" || j.texte.indexOf(MM.TEXTES_RIVAL[j.posture]) !== 0 || !Array.isArray(j.actions)) postures.add("??" + j.posture); }));
verifier("IA du rival : chaque décision notée dans son journal a sa phrase prête à afficher (TEXTES_RIVAL) et ses actions",
  ["depart", "alerte", "porte", "armee", "equilibre"].every(x => postures.has(x)) && ![...postures].some(x => x.indexOf("??") === 0), [...postures]);
// le simulateur d'équilibre tourne encore (2 graines, deux niveaux) et rend des résultats lisibles
const simJ = JSON.parse(require("child_process").execFileSync(process.execPath, [path.join(__dirname, "simuler-bataille.js"), "--graines", "2", "--p", "0.8", "--niveaux", "0,4", "--json"], { encoding: "utf8" }));
const simL = simJ.resultats["0.8"] || [];
verifier("Simulateur d'équilibre : tourne et rend, par niveau, batailles pour prendre, coups portés et défense tenue",
  simL.length === 2 && simL.every(l => typeof l.batailles === "number" && typeof l.degats === "number" && typeof l.defenseTenue === "number" && typeof l.defenseMursTenue === "number"), simL);

// niveaux : la bataille tire les niveaux 1 à 3, le conseil et les événements 1 et 2 ; difficulté visée : 7 sur 10
const JN = contexte().JEU, QN = JN.questions;
JN.sauvegarde.charger();
const SRCN = { fichier: "essai.pdf", page: 1 };
JN.donnees.cours["histoire-s07-2"] = { id: "histoire-s07-2", fiches: [{ id: "histoire-s07-2-f1", notion: "N", titre: "N", texte: "", source: SRCN }], bonus: [], nonCouvert: [],
  questions: [1, 2, 3].map(n => ({ id: "histoire-s07-2-q" + n, fiche: "histoire-s07-2-f1", type: "qcm", niveau: n, enonce: "Q" + n + " ?", choix: ["a", "b", "c", "d"], reponse: "a", explication: "a.", source: SRCN })) };
QN.vider(); JN.progression.oublier();
QN.oublierReponses();
const niv = seq => { QN.oublierReponses(); seq.forEach(x => QN.retenir(x)); return QN.niveauConseille(); };
const un = (n, sur) => Array.from({ length: sur }, (_, i) => i < n);
verifier("Niveau conseillé : vise 7 réussites sur 10 (9/10 → 3, 8 → 2,5, 7 → 2, 6 → 1,5, 5 → 1 ; au début 1,5)",
  niv([]) === 1.5 && niv(un(9, 10)) === 3 && niv(un(8, 10)) === 2.5 && niv(un(7, 10)) === 2 && niv(un(6, 10)) === 1.5 && niv(un(5, 10)) === 1 && niv(un(10, 10)) === 3,
  [niv([]), niv(un(9, 10)), niv(un(8, 10)), niv(un(7, 10)), niv(un(6, 10)), niv(un(5, 10))]);
niv(un(10, 10)); // niveau conseillé 3
const horsBataille = new Set(), enBataille = new Set();
for (let i = 0; i < 60; i++) {
  horsBataille.add(QN.choisirPourFiche("histoire-s07-2-f1").niveau);
  enBataille.add(QN.avecNiveaux(QN.NIVEAUX_BATAILLE, () => QN.choisirPourFiche("histoire-s07-2-f1")).niveau);
}
let restaure = false;
try { QN.avecNiveaux([3], () => { throw new Error("essai"); }); } catch (e) { restaure = QN.choisirPourFiche("histoire-s07-2-f1").niveau <= 2; }
verifier("Niveaux : la bataille tire aussi le niveau 3 (le conseil et les événements jamais), et le réglage se referme même après une erreur",
  !horsBataille.has(3) && enBataille.has(3) && JSON.stringify(QN.NIVEAUX_BATAILLE) === "[1,2,3]" && restaure, { hors: [...horsBataille], bataille: [...enBataille], restaure });
const srcBataille = fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8");
verifier("Bataille : son tirage passe par avecNiveaux(NIVEAUX_BATAILLE) et son or par M.repondre", /avecNiveaux\(Q\.NIVEAUX_BATAILLE/.test(srcBataille) && /M\.repondre\(p, juste\)/.test(srcBataille) && !/BONUS_SERIE/.test(srcBataille));
// revue du 15/10/2026 : une question de niveau 3 ratée en bataille n'avait jamais sa « Seconde chance » (rappels.placer
// ne gardait que les niveaux 1 et 2) ; elle revient maintenant en bataille, et attend la bataille hors bataille
JN.sauvegarde.remplacer(JN.sauvegarde.nouvelle()); JN.progression.oublier(); JN.recit.oublierHistorique(); QN.oublierReponses();
const q3N = QN.questionsDeFiche("histoire-s07-2-f1", [3])[0];
QN.enregistrerReponse(q3N, false);
const rN = JN.rappels.etat(); rN.file[0].du = rN.compteur; rN.derniere = "autre";
const lotHors = JN.recit.suite(3), lotEn = QN.avecNiveaux(QN.NIVEAUX_BATAILLE, () => JN.recit.suite(3));
const ordinaires3 = QN.questionsDeFiche("histoire-s07-2-f1", [1, 2]);
const replaceHors = JN.rappels.replacer(ordinaires3.slice(), 0, 2), replaceEn = QN.avecNiveaux(QN.NIVEAUX_BATAILLE, () => JN.rappels.replacer(ordinaires3.slice(), 0, 2));
verifier("Seconde chance d'une question de niveau 3 : elle revient en bataille (tirage et replacement), jamais au conseil ni dans un événement, et attend dans la file",
  !lotHors.some(q => q.id === q3N.id) && lotEn[0].id === q3N.id && lotEn[0].rappel && !replaceHors.some(q => q.id === q3N.id) && replaceEn[0].id === q3N.id && replaceEn[0].rappel &&
  JN.rappels.enAttente().indexOf(q3N.id) >= 0 && /enBataille\(function \(\) \{ JEU\.rappels\.replacer\(/.test(srcBataille),
  { hors: lotHors.map(q => q.id), en: lotEn.map(q => q.id), replaceEn: replaceEn.map(q => q.id) });

// réglage « Sang dans les combats » : actif par défaut, gardé dans la sauvegarde, actif pour une ancienne sauvegarde sans lui
const ctxS = contexte(), JS = ctxS.JEU;
vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "js", "anim.js"), "utf8"), ctxS, { filename: "anim.js" });
JS.sauvegarde.remplacer(JS.sauvegarde.nouvelle());
const sangNeuf = JS.sauvegarde.etat().reglages.sang === true && JS.anim.sang() === true;
const vieille = JSON.parse(JSON.stringify(v1));
const vieilleMigree = JS.sauvegarde.migrer(JSON.parse(JSON.stringify(vieille)));
JS.sauvegarde.remplacer(vieilleMigree);
const sangAncien = !("sang" in vieilleMigree.reglages) && JS.anim.sang() === true &&
  ["cours", "notions", "ressources", "batiments", "devoirs", "signalements", "creeLe"].every(k => JSON.stringify(vieilleMigree[k]) === JSON.stringify(vieille[k]));
const v3s = JSON.parse(JSON.stringify(JS.sauvegarde.nouvelle())); delete v3s.rappels; delete v3s.reglages.sang; v3s.schema = 3; v3s.reglages.animations = false;
const m3s = JS.sauvegarde.migrer(JSON.parse(JSON.stringify(v3s)));
JS.sauvegarde.remplacer(m3s);
const sang3 = JSON.stringify(m3s.reglages) === JSON.stringify(v3s.reglages) && JS.anim.sang() === true;
verifier("Réglage du sang : actif par défaut, et actif pour une ancienne sauvegarde (schémas 1 et 3) sans qu'elle perde rien", sangNeuf && sangAncien && sang3, { sangNeuf, sangAncien, sang3 });
JS.sauvegarde.etat().reglages.sang = false;
const txtSang = JS.sauvegarde.texteExport();
JS.sauvegarde.importer(txtSang);
verifier("Réglage du sang : coupé, il le reste après export puis import", JS.sauvegarde.etat().reglages.sang === false && JS.anim.sang() === false);

// ---------- bataillons (16/10/2026, demande de Romain : « des bataillons au lieu de soldats ») ----------
// Le rendu (jeu/js/bataille.js) montre chaque troupe du moteur en formation de figurines ; le moteur ne change pas.
const BT = JB.bataille.bataillons, MBT = JB.batailleMoteur;
const typesMoteur = Object.keys(MBT.TROUPES).concat(Object.keys(MBT.ENNEMIS)).filter((t, i, a) => a.indexOf(t) === i);
const formesOk = typesMoteur.map(t => {
  const f = BT.formation(t), d = f.d, noyaux = f.places.filter(q => q.noyau).length;
  let ok = noyaux === 1 && f.places.every(q => q.echelle > 0 && q.type);
  if (t === "cavaliers") ok = ok && d.rangs.length === 2 && d.rangs.every(n => n >= 2 && n <= 3);
  else if (t === "champion") ok = ok && f.places[0].noyau && f.places[0].echelle > f.places[1].echelle && f.places.length - 1 >= 2 && f.places.length - 1 <= 6 && f.banniere > 0;
  else if (t === "belier") ok = ok && f.places[0].noyau && f.places.length - 1 >= 2 && f.places.length - 1 <= 4 && f.places.slice(1).every(q => q.a < 0) && !f.banniere;
  else ok = ok && d.rangs.length === 2 && d.rangs.every(n => n >= 3 && n <= 4) && f.banniere > 0;
  return { t, n: f.places.length, ok };
});
verifier("Bataillons : chaque troupe du moteur a sa formation (fantassins, piétaille, hommes d'armes : 2 rangs de 3 ou 4 ; cavaliers : 2 rangs de 2 ou 3 ; champion : grande figurine et sa garde ; tour de siège : l'engin et ses pousseurs), un seul porte-bannière",
  formesOk.every(x => x.ok) && BT.formation("type-inconnu").places.length >= 4, formesOk);
const deboutOk = typesMoteur.every(t => {
  const n = BT.formation(t).places.length;
  let avant = n;
  for (let k = 100; k >= 1; k--) { const d = BT.debout(n, k / 10, 10, true); if (d > avant || d < 1 || d > n) return false; avant = d; }
  return BT.debout(n, 10, 10, true) === n && BT.debout(n, 0, 10, false) === 0 && BT.debout(n, 0.01, 10, true) === 1;
});
verifier("Bataillons : les figurines tombent une à une avec les points de vie (toutes à pleine vie, au moins une tant que la troupe vit, aucune morte)", deboutOk);
const largeurOk = typesMoteur.every(t => {
  const f = BT.formation(t);
  return [-9, -MBT.MELEE.coteCombat, -2, 0, 2, MBT.MELEE.coteCombat, 9].every(c => { const cc = BT.cote(f, c); return f.places.every(q => Math.abs(cc + q.b) <= BT.BORD_ROUTE + 1e-9); });
});
verifier("Bataillons : toute la formation reste dans la largeur de la route (" + BT.BORD_ROUTE + " px du milieu au plus ; route de 30 à 38 px)", largeurOk && BT.BORD_ROUTE <= 14);
// mêlée : la ligne de front, à l'œil (BT.placer, moteur inchangé). Troupes d'essai : place sur la route (s), camp,
// adversaire ; leur bataillon n'a que sa formation. Étendue dessinée d'un bataillon le long de la route : de son milieu
// (s + cible) − derriere à + devant (tes troupes, tournées vers le château du rival), l'inverse pour le rival.
const routeM = MBT.preparerRoute(JB.cartesBataille.carte("gue").route), LM = routeM.longueur;
const troupeM = (camp, type, s, extra) => Object.assign({ camp, type, s, pv: 5, max: 5, vivant: true, adversaire: null, bat: { f: BT.formation(type) } }, extra || {});
const engagerM = (a, r) => { a.adversaire = r; r.adversaire = a; };
const etendueM = u => { const c = u.s + u.bat.cible, f = u.bat.f; return u.camp === "rival" ? [c - f.devant, c + f.derriere] : [c - f.derriere, c + f.devant]; };
const placerM = liste => { const ms = BT.placer({ route: routeM, temps: 1 }, liste); return { ms, ext: liste.map(etendueM) }; };
// deux bataillons ennemis l'un dans l'autre (hors de leur allonge) : chevauchement le long de la route, px
const melangeM = liste => { let pire = 0; liste.forEach((x, i) => liste.forEach((y, j) => { if (x.camp === "rival" || y.camp !== "rival") return;
  const ex = etendueM(x), ey = etendueM(y); pire = Math.max(pire, Math.min(ex[1], ey[1]) - Math.max(ex[0], ey[0])); })); return pire; };
// 1. chaque duel seul, aux distances du moteur (contact, combat, plus près, et « à l'envers » : un garde passé devant)
const pairesMelee = [];
Object.keys(MBT.TROUPES).forEach(a => Object.keys(MBT.ENNEMIS).forEach(r => [MBT.MELEE.contact, MBT.MELEE.ecart, MBT.MELEE.ecart - 4, -10].forEach(g => {
  const ua = troupeM("joueur", a, 500), ur = troupeM("rival", r, 500 + g);
  engagerM(ua, ur); placerM([ua, ur]);
  const ea = etendueM(ua), er = etendueM(ur);
  pairesMelee.push({ a, r, g, ecart: Math.round((er[0] - ea[1]) * 100) / 100, decal: Math.max(Math.abs(ua.bat.cible), Math.abs(ur.bat.cible)), slots: ua.bat.slot + ur.bat.slot });
})));
verifier("Bataillons en mêlée : premiers rangs face à face, jamais l'un dans l'autre (à l'œil, moteur inchangé : contact " + MBT.MELEE.contact + " px, combat " + MBT.MELEE.ecart + " px ; duel « à l'envers » remis dans le bon sens)",
  pairesMelee.every(x => Math.abs(x.ecart - BT.ECART_FRONTS) < 1e-6 && x.decal <= BT.DECAL_MELEE && x.slots === 0), pairesMelee.filter(x => !(Math.abs(x.ecart - BT.ECART_FRONTS) < 1e-6 && x.decal <= BT.DECAL_MELEE)));
// 2. mêlée nombreuse : trois duels au même endroit, deux troupes libres de chaque camp qui arrivent dessus
const melee3 = (() => {
  const J = [troupeM("joueur", "fantassins", 600), troupeM("joueur", "cavaliers", 606), troupeM("joueur", "fantassins", 596)];
  const R = [troupeM("rival", "pietaille", 616), troupeM("rival", "hommes", 610), troupeM("rival", "champion", 618)];
  J.forEach((u, k) => engagerM(u, R[k]));
  const libresJ = [troupeM("joueur", "fantassins", 612), troupeM("joueur", "cavaliers", 590)], libresR = [troupeM("rival", "pietaille", 604), troupeM("rival", "cavaliers", 640)];
  const tous = J.concat(R, libresJ, libresR), r = placerM(tous);
  const F = r.ms.length === 1 ? r.ms[0].F : NaN;
  return { melees: r.ms.length, melange: Math.round(melangeM(tous) * 100) / 100,
    cotes: J.concat(libresJ).every(u => etendueM(u)[1] <= F + 1e-6) && R.concat(libresR).every(u => etendueM(u)[0] >= F - 1e-6),
    deuxiemeLigne: J.filter(u => u.bat.slot > 0).length === 2 && R.filter(u => u.bat.slot > 0).length === 2,
    aLaFile: libresJ.concat(libresR).every(u => u.bat.file), decal: Math.max(...tous.map(u => Math.abs(u.bat.cible))) };
})();
verifier("Bataillons en mêlée nombreuse : une seule ligne de front, tes bataillons d'un côté, ceux du rival de l'autre, deuxième ligne derrière les premiers, troupes libres à la file, jamais l'un dans l'autre",
  melee3.melees === 1 && melee3.melange <= 0 && melee3.cotes && melee3.deuxiemeLigne && melee3.aLaFile && melee3.decal <= BT.DECAL_FILE, melee3);
// 3. devant la porte du rival : tes troupes arrêtées par sa garnison (u.porte) et un garde qui sort les combattre
const porteM = (() => {
  const att = [0, 1, 2, 3].map(() => troupeM("joueur", "fantassins", LM - MBT.GARNISON.attente, { porte: true }));
  const seules = [0, 1, 2].map(() => troupeM("joueur", "cavaliers", LM - MBT.GARNISON.attente, { porte: true }));
  placerM(seules);
  const libre = seules.every(u => { const e = etendueM(u); return e[1] <= LM - 1 && e[0] >= 0; }) && seules.every(u => u.bat.file);
  const files = seules.map(etendueM).sort((x, y) => y[0] - x[0]);
  const enFile = files.every((e, k) => k === 0 || e[1] <= files[k - 1][0] + 1e-6);
  const garde = troupeM("rival", "hommes", LM - 1, { garnison: true });
  engagerM(att[0], garde);
  placerM(att.concat([garde]));
  const eg = etendueM(garde);
  return { libre, enFile, garde: Math.round(eg[1] * 10) / 10, L: Math.round(LM * 10) / 10, melange: melangeM(att.concat([garde])), attente: att.slice(1).every(u => u.bat.file) };
})();
verifier("Bataillons devant la porte du rival : tes troupes arrêtées par sa garnison se rangent à la file devant la porte, le garde qui sort se bat hors de la porte, sans mélange",
  porteM.libre && porteM.enFile && porteM.garde <= porteM.L && porteM.melange <= 0 && porteM.attente, porteM);
const routeG = MBT.preparerRoute(JB.cartesBataille.carte("gue").route), ptB = { x: 0, y: 0 };
let ecartRoute = 0;
for (let s = -20; s <= routeG.longueur + 20; s += 7.3) [-12, 0, 9].forEach(c => { const a = MBT.surRoute(routeG, s, c), b = BT.pointRoute(routeG, s, c, ptB); ecartRoute = Math.max(ecartRoute, Math.hypot(a.x - b.x, a.y - b.y)); });
verifier("Bataillons : les figurines sont posées sur le tracé du moteur (même point que surRoute)", ecartRoute < 1e-9, ecartRoute);
// une vague jouée par le vrai moteur, suivie par le rendu à chaque pas (sans toile) : figurines debout = points de vie,
// le porte-bannière tombe le dernier, figurines sur la route, figurines couchées gardées et plafonnées
(function () {
  const p = MBT.creer(JB.cartesBataille.carte("gue"), { niveau: 2, arsenal: { tours: { archers: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } }, orDepart: 400 });
  ["fantassins", "fantassins", "cavaliers", "belier", "fantassins"].forEach(t => MBT.envoyer(p, t));
  p.vague = 2;
  MBT.lancerVague(p);
  const v = { partie: p, campAdverse: "angleterre", corps: [], vus: [], tempsRendu: 0 };
  const pts = []; for (let s = 0; s <= p.route.longueur; s += 1) pts.push(MBT.surRoute(p.route, s, 0));
  const horsRoute = (x, y) => { let d = Infinity; for (const q of pts) d = Math.min(d, Math.hypot(q.x - x, q.y - y)); return d; };
  const pb = { debout: 0, noyau: 0, route: 0, corpsMax: 0, vus: new Set(), finis: 0 }, morts = new Set();
  let n = 0;
  while (p.phase === "vague" && n++ < 6000) {
    MBT.etape(p, 1 / 60);
    BT.suivre(v, true, true);
    pb.corpsMax = Math.max(pb.corpsMax, v.corps.length);
    p.unites.forEach(u => {
      if (!u.bat || u.pv <= 0 || !u.vivant) return;
      pb.vus.add(u);
      const debout = u.bat.figs.filter(f => f.debout);
      if (debout.length !== BT.debout(u.bat.figs.length, u.pv, u.max, true)) pb.debout++;
      if (!u.bat.figs.some(f => f.noyau && f.debout)) pb.noyau++;
      if (n % 30 === 0) debout.forEach(f => { if (f.alpha > 0 && horsRoute(f.x, f.y) > BT.BORD_ROUTE + 2.5) pb.route++; });
    });
  }
  BT.suivre(v, true, true); BT.suivre(v, true, true);
  pb.vus.forEach(u => { if (u.pv <= 0) { morts.add(u); if (u.bat.debout === 0 && u.bat.mort) pb.finis++; } });
  verifier("Bataillons sur une vraie vague : figurines debout = points de vie, porte-bannière (champion, engin) jusqu'au bout, figurines sur la route, toutes les figurines d'une troupe abattue couchées, au plus " + BT.CORPS_MAX + " à la fois",
    p.phase !== "vague" && morts.size > 0 && pb.debout === 0 && pb.noyau === 0 && pb.route === 0 && pb.finis === morts.size && pb.corpsMax > 0 && pb.corpsMax <= BT.CORPS_MAX,
    { phase: p.phase, morts: morts.size, finis: pb.finis, debout: pb.debout, noyau: pb.noyau, horsRoute: pb.route, corpsMax: pb.corpsMax });
})();
// grosses vagues du vrai moteur sur les cinq cartes, suivies par le rendu : temps où deux bataillons ennemis se
// chevauchent le long de la route (figurines debout), adversaires d'un même duel ou non. Avant la ligne de front
// (16/10/2026), 44 % du temps de vague pour les non-adversaires (575 s sur 20 vagues).
(function () {
  const bilan = { secondes: 0, adversaires: 0, autres: 0, decalMax: 0 };
  ["gue", "foret", "col", "moulin", "chateau"].forEach((id, k) => {
    const p = MBT.creer(JB.cartesBataille.carte(id), { niveau: k % 5, arsenal: { tours: { archers: 1 }, troupes: { fantassins: 1, cavaliers: 1, belier: 1 } }, orDepart: 900 });
    ["fantassins", "fantassins", "cavaliers", "fantassins", "cavaliers", "belier", "fantassins", "fantassins", "cavaliers"].forEach(t => MBT.envoyer(p, t));
    p.vague = p.vagues - 1;
    MBT.lancerVague(p);
    const v = { partie: p, campAdverse: "angleterre", corps: [], vus: [], morts: [], tempsRendu: 0, carte: JB.cartesBataille.carte(id) };
    for (let n = 0; p.phase === "vague" && n < 12000; n++) {
      MBT.etape(p, 1 / 60);
      BT.suivre(v, true, true);
      bilan.secondes += 1 / 60;
      const bats = p.unites.filter(u => u.vivant && u.pv > 0 && u.bat).map(u => {
        let a = Infinity, b = -Infinity;
        u.bat.figs.forEach(f => { if (f.debout && f.vu && f.alpha > 0) { a = Math.min(a, f.s); b = Math.max(b, f.s); } });
        bilan.decalMax = Math.max(bilan.decalMax, Math.abs(u.bat.decal || 0));
        return { u, a, b };
      }).filter(x => x.a <= x.b);
      bats.forEach(x => { if (x.u.camp === "rival") return; bats.forEach(y => {
        if (y.u.camp !== "rival" || Math.min(x.b, y.b) - Math.max(x.a, y.a) <= 1) return;
        if (x.u.adversaire === y.u) bilan.adversaires += 1 / 60; else bilan.autres += 1 / 60;
      }); });
    }
  });
  const part = x => Math.round(x / bilan.secondes * 1000) / 10;
  verifier("Bataillons sur de grosses vagues (5 cartes) : les deux camps ne se mêlent presque plus (bataillons ennemis l'un dans l'autre moins de 6 % du temps, 44 % avant la ligne de front ; jamais les deux adversaires d'un duel), décalage à l'œil borné",
    part(bilan.autres) < 6 && part(bilan.adversaires) < 0.5 && bilan.decalMax <= BT.DECAL_PORTE + 1e-6,
    { secondes: Math.round(bilan.secondes), autres: part(bilan.autres) + " %", adversaires: part(bilan.adversaires) + " %", decalMax: Math.round(bilan.decalMax) });
})();
const srcB = fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8");
verifier("Bataillons : le rendu ne touche pas au moteur (aucune écriture de la place, des points de vie ou de l'adversaire d'une troupe dans bataille.js)",
  !/\bu\.(s|x|y|pv|max|cote|vivant|adversaire)\s*[-+*/]?=(?!=)/.test(srcB));

// ---------- personnages de la campagne, rivalité et missives (16/10/2026) ----------
(function () {
  const ctxP = contexte(), JP = ctxP.JEU;
  const lire = f => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", f), "utf8"), ctxP);
  lire("personnages.js"); lire("cours/histoire-s01-2.js"); lire("cours/histoire-s03-1.js");
  JP.sauvegarde.charger();
  const CP = JP.campagne, e = JP.sauvegarde.etat();
  const ORDRE = ["gue", "piemont", "foret", "oliveraie", "moulin", "fleuve", "col", "citadelle", "chateau", "forteresse"];
  const chefA = n => { CP.etat().conquises = ORDRE.slice(0, n); const s = CP.souverain(); return s ? s.id : null; };
  const chefs = [0, 2, 3, 5, 6, 10].map(chefA);
  verifier("Personnages : Clovis d'abord, Pépin le Bref à partir de 3 provinces prises, Charlemagne à partir de 6",
    chefs.join() === "clovis,clovis,pepin-le-bref,pepin-le-bref,charlemagne,charlemagne", chefs);
  CP.etat().conquises = [];
  const ra = CP.rivalDe("angleterre"), ro = CP.rivalDe("omeyyades");
  verifier("Rivaux : « Le roi d'Angleterre » et « L'émir de Cordoue », titres seuls, sans visage ni date",
    ra.id === "roi-angleterre" && ro.id === "emir-cordoue" && ra.titreSeul && ro.titreSeul && !ra.portrait && !ro.portrait && !ra.dates && !ro.dates, [ra.id, ro.id]);
  // brume : rien d'un cours dont le fichier n'est pas chargé
  const s012 = JP.donnees.cours["histoire-s01-2"], s031 = JP.donnees.cours["histoire-s03-1"];
  verifier("Brume : les faits d'un personnage ne se montrent qu'avec leur cours (l'émir : 2 faits, 1 sans le cours de la séance 4)",
    CP.faitsVisibles(ro).length === 2 && (delete JP.donnees.cours["histoire-s03-1"], CP.faitsVisibles(ro).length === 1));
  JP.donnees.cours["histoire-s03-1"] = s031;
  delete JP.donnees.cours["histoire-s01-2"];
  CP.etat().conquises = ORDRE.slice(0, 6);
  const sansCours = { chef: CP.souverain(), sud: CP.rivalDe("omeyyades"), ouest: CP.rivalDe("angleterre"), galerie: CP.galerie().souverains.length };
  verifier("Brume : sans le cours de la séance 2, ni souverain, ni galerie, et au sud « un seigneur rival » sans nom (le roi d'Angleterre suit son camp)",
    sansCours.chef === null && sansCours.galerie === 0 && sansCours.sud.generique === true && sansCours.sud.nom === "Un seigneur rival" && sansCours.ouest.id === "roi-angleterre",
    { chef: sansCours.chef && sansCours.chef.id, sud: sansCours.sud.nom });
  JP.donnees.cours["histoire-s01-2"] = s012;
  JP.donnees.personnages.personnages.push({ id: "roi-essai", nom: "Roi d'essai", camp: "joueur", seuil: 0, titre: "roi", dates: null, cours: "histoire-s08-1",
    source: { fichier: "cours/histoire/Essai.pdf", page: 1 }, faits: [], portrait: null });
  verifier("Brume : un souverain relié à un cours pas encore ouvert ne règne jamais, même seuil atteint, et n'est nulle part dans la galerie",
    CP.souverain().id === "charlemagne" && !CP.galerie().souverains.some(x => x.perso.id === "roi-essai"));
  JP.donnees.personnages.personnages.pop();
  const gal = CP.galerie();
  CP.etat().conquises = ORDRE.slice(0, 4);
  const gal4 = CP.galerie();
  verifier("Galerie : souverains rencontrés, celui qui règne, ceux qui viendront (avec le nombre de provinces qui manquent)",
    gal.souverains.map(x => x.etat).join() === "passe,passe,regne" && gal4.souverains.map(x => x.etat + x.reste).join() === "passe0,regne0,avenir2" && gal.rivaux.length === 2,
    gal4.souverains.map(x => x.etat + x.reste));

  // rivalité : elle monte quand tu gagnes contre un front, prends ses provinces, et quand il t'attaque ; jamais au-delà de 100
  e.campagne = CP.etatVide();
  const c = CP.etat();
  const r0 = [CP.rivalite("angleterre"), CP.rivalite("omeyyades")];
  CP.apresBataille({ lieu: "gue", front: "angleterre", issue: "victoire", degatsRival: 16 });
  const r1 = CP.rivalite("angleterre");
  CP.apresBataille({ lieu: "foret", front: "angleterre", issue: "retraite", degatsRival: 0 });
  const r2 = CP.rivalite("angleterre");
  CP.apresBataille({ lieu: "foret", front: "angleterre", issue: "tenu", degatsRival: 3 });
  const r3 = CP.rivalite("angleterre");
  c.rival.attaque = "omeyyades";
  CP.apresBataille({ lieu: "domaine", front: "omeyyades", issue: "tenu", degatsRival: 0 });
  const r4 = CP.rivalite("omeyyades");
  CP.apresBataille({ lieu: "piemont", front: "omeyyades", issue: "retraite", degatsRival: 0, entamee: false });
  const r5 = CP.rivalite("omeyyades");
  c.dernierJour = "2026-10-14"; c.rival.menace = 5; c.rival.attaque = false;
  const avantAttaque = { angleterre: CP.rivalite("angleterre"), omeyyades: CP.rivalite("omeyyades") };
  CP.nouveauJour(D("2026-10-15T10:00:00"));
  const fa = c.rival.attaque;
  verifier("Rivalité : 0 au départ, +15 pour une province prise, rien pour une retraite, +4 quand sa place forte tient, +10 pour son attaque repoussée, +8 quand il attaque, rien si l'on quitte avant la première vague",
    r0.join() === "0,0" && r1 === 15 && r2 === 15 && r3 === 19 && r4 === 10 && r5 === 10 && !!fa && CP.rivalite(fa) === avantAttaque[fa] + 8, { r1, r2, r3, r4, r5, fa });
  for (let i = 0; i < 12; i++) CP.monterRivalite("angleterre", 15);
  verifier("Rivalité : plafond à 100 ; niveaux courtoise (0 à 29), vive (30 à 64), acharnée (65 à 100)",
    CP.rivalite("angleterre") === 100 && [0, 29, 30, 64, 65, 100].map(v => CP.niveauRivalite(v).id).join() === "calme,calme,pique,pique,acharne,acharne");
  verifier("Humeur du rival : une phrase selon la rivalité, avec son nom", CP.humeur("angleterre") === "Le roi d'Angleterre ne parle plus que de toi à sa cour.", CP.humeur("angleterre"));

  // migration : une campagne d'avant le 16/10/2026 garde tout, et sa rivalité part de ses conquêtes
  const ancienne = CP.etatVide();
  delete ancienne.rivalite; delete ancienne.missives;
  ancienne.conquises = ["gue", "foret", "piemont"]; ancienne.royaume.savoir = 4; ancienne.provinces.moulin.pv = 9; ancienne.chronique = [{ le: "2026-10-13", texte: "Essai" }];
  const avantM = JSON.parse(JSON.stringify(ancienne));
  const rep = CP.completer(JSON.parse(JSON.stringify(ancienne)));
  verifier("Migration : une campagne sans rivalité garde tout ; rivalité tirée des conquêtes (15 par province prise sur le front), missives neuves (présentation à venir)",
    rep.rivalite.angleterre === 30 && rep.rivalite.omeyyades === 15 && rep.missives.presentees === false && rep.missives.chef === null && rep.missives.defi === false &&
    Object.keys(avantM).every(k => JSON.stringify(rep[k]) === JSON.stringify(avantM[k])), rep.rivalite);
  const abimee = CP.completer({ conquises: ["piemont"], rivalite: { angleterre: "beaucoup", omeyyades: 250 }, missives: { presentees: "oui", chef: 3, dernieres: [], defi: 1 } });
  verifier("Migration : rivalité et missives abîmées réparées (nombre manquant tiré des conquêtes, 0 à 100 ; booléens, chef, dernières répliques)",
    abimee.rivalite.angleterre === 0 && abimee.rivalite.omeyyades === 100 && abimee.missives.presentees === false && abimee.missives.chef === null &&
    !Array.isArray(abimee.missives.dernieres) && abimee.missives.defi === false && abimee.missives.apres === false, abimee);
  const s5 = JSON.parse(JSON.stringify(e)); delete s5.campagne.rivalite; delete s5.campagne.missives;
  const ms = JP.sauvegarde.migrer(s5), cs = CP.completer(ms.campagne);
  verifier("Migration : une sauvegarde au schéma actuel sans ces champs se relit sans changer de schéma ni rien perdre",
    ms.schema === JP.sauvegarde.SCHEMA && cs.conquises.join() === e.campagne.conquises.join() && typeof cs.rivalite.angleterre === "number" && JSON.stringify(ms.ressources) === JSON.stringify(e.ressources));
  JP.sauvegarde.enregistrer();
  const txtP = JP.sauvegarde.texteExport();
  JP.sauvegarde.importer(txtP);
  verifier("Export puis import : rivalité et missives gardées à l'identique", JSON.stringify(JP.sauvegarde.etat().campagne.rivalite) === JSON.stringify(JSON.parse(txtP).campagne.rivalite) &&
    JSON.stringify(CP.etat().missives) === JSON.stringify(JSON.parse(txtP).campagne.missives));

  // missives : quand elles viennent
  const e2 = JP.sauvegarde.etat();
  e2.campagne = CP.etatVide(); CP.oublierMissives(); delete e2.reglages.rivaux;
  const c3 = CP.etat();
  const p1 = CP.prendreMissives();
  verifier("Missives : à la première visite, ton souverain puis les deux rivaux se présentent (une seule fois)",
    !!p1 && p1.situation === "presentation" && p1.bouton === "Continuer" && p1.lettres.map(l => l.qui.id).join() === "clovis,roi-angleterre,emir-cordoue" && CP.prendreMissives() === null,
    p1 && p1.lettres.map(l => l.qui.id));
  const defis = [];
  for (let i = 0; i < 10; i++) defis.push(!!CP.missiveAvantBataille(i % 2 ? "piemont" : "gue"));
  verifier("Missives : un défi avant une bataille sur deux, jamais deux de suite", defis.join() === "true,false,true,false,true,false,true,false,true,false", defis);
  const d1 = CP.missiveAvantBataille("gue");
  CP.missiveAvantBataille("gue");
  c3.rival.attaque = "omeyyades";
  const d2 = CP.missiveAvantBataille("domaine");
  verifier("Missives : le défi vient du rival du front (pour une défense, celui qui attaque), avec le bouton « Relever le défi »",
    d1.bouton === "Relever le défi" && d1.lettres[0].qui.id === "roi-angleterre" && d1.situation === "defi" && d2.lettres[0].qui.id === "emir-cordoue" && d2.situation === "attaque");
  c3.rival.attaque = false;
  const suite = [];
  for (let i = 0; i < 300; i++) { c3.missives.defi = false; suite.push(CP.missiveAvantBataille(i % 3 ? "gue" : "piemont").lettres[0]); }
  const memeDeSuite = suite.filter((l, i) => i && l.camp === suite[i - 1].camp && l.texte === suite[i - 1].texte).length;
  const parCamp = {}; suite.forEach(l => { (parCamp[l.camp] = parCamp[l.camp] || []).push(l.texte); });
  const repetees = Object.keys(parCamp).reduce((n, k) => n + parCamp[k].filter((t, i) => i && t === parCamp[k][i - 1]).length, 0);
  verifier("Missives : jamais deux fois de suite la même réplique (300 défis tirés, par camp)", memeDeSuite === 0 && repetees === 0, { memeDeSuite, repetees });
  const bande = (camp, sit, niv) => JP.donnees.personnages.repliques[camp][sit].filter(x => !x.niveau || x.niveau === niv).map(x => x.texte);
  const tirages = niv => { c3.rivalite.angleterre = niv === "acharne" ? 80 : niv === "pique" ? 40 : 5; const t = []; for (let i = 0; i < 30; i++) { c3.missives.defi = false; t.push(CP.missiveAvantBataille("gue").lettres[0].texte); } return t; };
  verifier("Missives : les répliques suivent la rivalité (courtoise, vive, acharnée)",
    ["calme", "pique", "acharne"].every(n => tirages(n).every(t => bande("angleterre", "defi", n).indexOf(t) >= 0)));
  c3.rivalite.angleterre = 0;
  // après une bataille
  CP.oublierMissives(); c3.missives.apres = false; CP.prendreMissives();
  CP.apresBataille({ lieu: "gue", front: "angleterre", issue: "victoire", degatsRival: 16 });
  const a1 = CP.prendreMissives();
  CP.apresBataille({ lieu: "foret", front: "angleterre", issue: "tenu", degatsRival: 2 });
  const a2 = CP.prendreMissives();
  CP.apresBataille({ lieu: "foret", front: "angleterre", issue: "tenu", degatsRival: 2 });
  const a3 = CP.prendreMissives();
  CP.apresBataille({ lieu: "foret", front: "angleterre", issue: "retraite", degatsRival: 0 });
  const a4 = CP.prendreMissives();
  c3.rival.attaque = "omeyyades";
  CP.apresBataille({ lieu: "domaine", front: "omeyyades", issue: "tenu", degatsRival: 0 });
  const a5 = CP.prendreMissives();
  verifier("Missives : réaction du rival après chaque province prise et chaque attaque repoussée ; une fois sur deux quand sa place forte tient ou que tu recules",
    a1 && a1.lettres[0].situation === "province" && a2 && a2.lettres[0].situation === "tenu" && a3 === null && a4 && a4.lettres[0].situation === "retraite" &&
    a5 && a5.lettres[0].situation === "victoire" && a5.lettres[0].qui.id === "emir-cordoue", [a1, a2, a3, a4, a5].map(x => x && x.lettres[0].situation));
  c3.conquises = ["gue", "piemont"];
  CP.apresBataille({ lieu: "oliveraie", front: "omeyyades", issue: "victoire", degatsRival: 20 });
  const ch = CP.prendreMissives();
  verifier("Missives : à la 3e province, la réaction du rival puis « Les années passent : Pépin le Bref… », et la chronique le note",
    ch && ch.lettres.map(l => l.situation).join() === "province,changement" && ch.lettres[1].qui.id === "pepin-le-bref" && /^Les années passent/.test(ch.lettres[1].texte) &&
    c3.chronique.some(x => x.texte === "Pépin le Bref est maintenant ton souverain.") && CP.prendreMissives() === null, ch && ch.lettres.map(l => l.texte));
  c3.dernierJour = "2026-10-14"; c3.rival.menace = 5; c3.rival.attaque = false;
  CP.nouveauJour(D("2026-10-15T10:00:00"));
  const at = CP.prendreMissives();
  verifier("Missives : quand un rival attaque ton domaine, il l'annonce", at && at.lettres[0].situation === "attaque" && at.lettres[0].front === c3.rival.attaque);
  // messages des rivaux coupés (Réglages)
  e2.reglages.rivaux = false; c3.missives.defi = false;
  const rAvant = CP.rivalite("omeyyades");
  c3.conquises = ["gue", "piemont", "foret", "oliveraie", "moulin"];
  CP.apresBataille({ lieu: "fleuve", front: "omeyyades", issue: "victoire", degatsRival: 24 });
  const coupe = CP.prendreMissives();
  verifier("Messages des rivaux coupés : ni défi ni lettre, la rivalité monte quand même, et le nouveau souverain n'a qu'une ligne discrète",
    CP.missiveAvantBataille("gue") === null && CP.rivalite("omeyyades") === Math.min(100, rAvant + 15) && coupe && coupe.silencieux === true && coupe.changement.id === "charlemagne", coupe);
  e2.reglages.rivaux = true;
  // remplissage des marques et articles
  verifier("Répliques : {nom} et {province}, article en minuscule au milieu d'une phrase",
    CP.remplir("Tu m'as pris {province}.", { province: "Le Gué" }) === "Tu m'as pris le Gué." && CP.remplir("Perdre {province} !", { province: "La Tour du Col" }) === "Perdre la Tour du Col !" &&
    CP.remplir("{nom} t'observe.", { nom: "Le roi d'Angleterre" }) === "Le roi d'Angleterre t'observe." && CP.remplir("Voici {nom}.", { nom: "L'émir de Cordoue" }) === "Voici l'émir de Cordoue." &&
    CP.remplir("Salut, {nom} !", { nom: "Un seigneur rival" }) === "Salut, un seigneur rival !");

  // contrôle 10 du validateur (personnages.js)
  const CTRL = require("./controles.js");
  const planningP = JSON.parse(JSON.stringify(JP.donnees.planning)), parIdP = {};
  planningP.forEach(x => { parIdP[x.id] = x; });
  const indexP = ["histoire-s01-2", "histoire-s03-1"];
  const ctrl = P => { const er = [], al = []; CTRL.controlerPersonnages(P, parIdP, indexP, m => er.push(m), m => al.push(m)); return { er, al }; };
  const vrai = ctrl(JP.donnees.personnages);
  verifier("Validateur, contrôle 10 : personnages.js passe sans erreur", vrai.er.length === 0, vrai.er);
  const casse = (f) => { const P = JSON.parse(JSON.stringify(JP.donnees.personnages)); f(P); return ctrl(P).er; };
  const fautes = {
    campInconnu: casse(P => { P.personnages[0].camp = "byzance"; }),
    coursInconnu: casse(P => { P.personnages[0].cours = "histoire-s99-9"; }),
    revisionPasCours: casse(P => { P.personnages[0].cours = "histoire-s02-2"; }),
    souverainSansCours: casse(P => { P.personnages[1].cours = null; P.personnages[1].source = null; }),
    titreSeulAvecVisage: casse(P => { P.personnages[3].portrait = P.personnages[0].portrait; }),
    sansSource: casse(P => { delete P.personnages[2].source; }),
    licence: casse(P => { P.personnages[0].portrait.licence = "tous droits réservés"; }),
    creditIncomplet: casse(P => { delete P.personnages[0].portrait.url; }),
    tropPeu: casse(P => { P.repliques.angleterre.defi.splice(0, 1); }),
    niveauVide: casse(P => { P.repliques.omeyyades.tenu.forEach(x => { if (x.niveau === "pique") x.niveau = "calme"; }); }),
    religion: casse(P => { P.repliques.angleterre.defi[0].texte = "Que Dieu te garde, seigneur."; }),
    insulte: casse(P => { P.repliques.omeyyades.retraite[0].texte = "Quel minable tu fais !"; }),
    chiffre: casse(P => { P.repliques.angleterre.province[0].texte = "En 800, tu m'as pris {province}."; }),
    nomHistorique: casse(P => { P.repliques.angleterre.victoire[0].texte = "Charlemagne lui-même n'aurait pas fait mieux."; }),
    marque: casse(P => { P.repliques.angleterre.defi[1].texte = "Tu veux {province} ? Viens la prendre."; }),
    troisPhrases: casse(P => { P.repliques.omeyyades.attaque[0].texte = "Je viens. Je vois. Je gagne."; })
  };
  const rates = Object.keys(fautes).filter(k => !fautes[k].length);
  verifier("Validateur, contrôle 10 : refuse camp inconnu, cours inconnu ou qui n'est pas un cours, souverain sans cours, rival « titre seul » avec un visage, source absente, licence refusée, crédit incomplet, moins de 6 répliques ou de 2 par niveau, religion, insulte, chiffre, nom d'un personnage, marque inconnue, plus de deux phrases",
    rates.length === 0, rates);

  // jamais entre deux questions : les missives ne viennent que de l'écran de campagne, et une partie qui commence les ferme
  const src = n => fs.readFileSync(path.join(RACINE, "jeu", "js", n), "utf8");
  const appelants = fs.readdirSync(path.join(RACINE, "jeu", "js")).filter(f => /\.js$/.test(f) && /prendreMissives\(|missiveAvantBataille\(|ouvrirMissive\(/.test(src(f))).sort();
  verifier("Missives : demandées seulement par l'écran de campagne (préparées par campagne.js, montrées par interface.js) ; une partie qui commence ferme la missive sans suite",
    appelants.join() === "campagne.js,ecran-campagne.js" && /ui\.ouvrirMissive = function/.test(src("interface.js")) && /ui\.commencerPartie = function[^]*?ui\.fermerMissive\(true\)[^]*?JEU\.partie = \{/.test(src("interface.js")) &&
    /function afficherMissives[^]*?if \(JEU\.partie \|\| JEU\.ui\.modaleOuverte\(\)\) return/.test(src("ecran-campagne.js")), appelants);
})();

// ---------- le seigneur rival parle en bataille (16/10/2026) : ses décisions du moteur (p.ia.journal), au titre du rival du front ----------
(function () {
  const PR = JB.bataille.phraseRival, T = JB.batailleMoteur.TEXTES_RIVAL;
  const journal = [{ vague: 0, posture: "depart", texte: T.depart }, { vague: 0, posture: "alerte", texte: T.alerte },
    { vague: 1, posture: "mefiance", texte: T.mefiance }, { vague: 1, posture: "porte", texte: T.porte + " " + T.releve }];
  const dit = [PR(journal, 0, false, "Le roi d'Angleterre"), PR(journal, 0, true, "Le roi d'Angleterre"), PR(journal, 0, true, "L'émir de Cordoue"),
    PR(journal, 1, false, "L'émir de Cordoue"), PR([{ vague: 2, posture: "mefiance", texte: T.mefiance }], 2, false, "Un seigneur rival")];
  verifier("Rival en bataille : « Ton rival » remplacé par son titre (article en minuscule au milieu d'une phrase, « du rival » accordé), la dernière décision de la vague sans l'alerte, l'alerte à part, rien sinon",
    dit[0] === "Le roi d'Angleterre t'attend : des tours gardent sa porte, et sa garnison est prête à sortir." &&
    dit[1] === "Les guetteurs du roi d'Angleterre ont vu ton armée sortir : il rappelle des gardes à sa porte." &&
    dit[2] === "Les guetteurs de l'émir de Cordoue ont vu ton armée sortir : il rappelle des gardes à sa porte." &&
    dit[3] === "L'émir de Cordoue a vu tes troupes foncer sur sa porte : il la fortifie. Il paie de nouveaux gardes pour remplacer ceux que tu as abattus." &&
    dit[4] === "Tu gardes de l'or : un seigneur rival se méfie d'une grosse attaque, fortifie sa porte et renforce sa garde." &&
    PR(journal, 1, true, "Le roi d'Angleterre") === null && PR(journal, 3, false, "x") === null && PR([], 0, false, "x") === null && PR(null, 0, false, "x") === null, dit);
  // une vraie bataille du moteur : une phrase pour la 1re vague (départ) et pour chaque vague suivante (sa décision), jamais vide
  const pJ = JB.batailleMoteur.creer(JB.cartesBataille.carte("gue"), { niveau: 1, vagues: 4, pvRival: 999, pvChateau: 999, orDepart: 40 });
  const phrases = [PR(pJ.ia.journal, 0, false, "Le roi d'Angleterre")];
  for (let k = 0; k < 2; k++) { JB.batailleMoteur.jouerVague(pJ); if (pJ.phase === "preparation") phrases.push(PR(pJ.ia.journal, pJ.vague, false, "Le roi d'Angleterre")); }
  verifier("Rival en bataille : une phrase à la 1re vague et après chaque vague repoussée, toutes au titre du rival et sans « Ton rival »",
    phrases.length >= 2 && phrases.every(t => typeof t === "string" && /^Le roi d'Angleterre|le roi d'Angleterre|du roi d'Angleterre/.test(t) && !/[Tt]on rival|du rival/.test(t)), phrases);
  // place dans le rendu : en tête du conseil de guerre (avant la première question de la vague) et au départ de la vague ;
  // jamais dans questionSuivante (entre deux questions) ; le moteur n'est pas touché
  const src = fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8");
  const iPrep = src.indexOf("function preparation() {"), iQS = src.indexOf("function questionSuivante(scene) {"), iFinQS = src.indexOf("function orADepenser()"),
    iLancer = src.indexOf("function lancerVague() {"), iMot = src.indexOf("motDuRival(false)"), iAlerte = src.indexOf("motDuRival(true)");
  verifier("Rival en bataille : sa ligne vient en tête du conseil de guerre (avant la première question de la vague) et au départ de la vague, jamais entre deux questions",
    iPrep > 0 && iMot > iPrep && iMot < iQS && iMot < src.indexOf("questionSuivante(scene);", iPrep) && !/motDuRival|phraseRival|ia\.journal/.test(src.slice(iQS, iFinQS)) &&
    iAlerte > iLancer && iAlerte < src.indexOf("montrer(cadre); // l'élève regarde la vague", iLancer) && (src.match(/motDuRival\((true|false)\)/g) || []).length === 2 &&
    !/TEXTES_RIVAL\s*=/.test(src), { iPrep, iQS, iMot, iLancer, iAlerte });
})();

// ---------- contrat moteur → rendu : chaque effet que le moteur émet est dessiné (revue visuelle du 16/10/2026) ----------
// Le moteur signale ses événements par p.effets (effet(p, "genre", …)) ; le rendu (bataille.js) les dessine dans
// dessiner(). Un genre que le rendu ignore passe inaperçu à l'écran : la tour que le rival bâtissait entre deux vagues
// apparaissait d'un coup, sans poussière ni onde ; rien ne marquait l'alerte de ses guetteurs, une sortie de sa garnison
// ni sa porte qui s'ouvre. Le test lit les deux sources : tout genre émis doit être traité, et les marques au sol des
// effets de l'IA rivale (onde, anneau) sont dessinées dans la passe « sol » (sous les murs), la poussière avec les effets.
(() => {
  const srcM = fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille-moteur.js"), "utf8");
  const srcR = fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8");
  const emis = [...new Set([...srcM.matchAll(/effet\(p, "([a-zA-Z]+)"/g)].map(m => m[1]))];
  const dessine = new Set([...srcR.matchAll(/genre === "([a-zA-Z]+)"/g)].map(m => m[1]));
  const oublies = emis.filter(g => !dessine.has(g));
  verifier("Rendu : chaque effet émis par le moteur (" + emis.length + " genres) est dessiné par bataille.js", emis.length >= 12 && oublies.length === 0, { emis, oublies });
  const iSol = srcR.indexOf("// --- sol :"), iVol = srcR.indexOf("// --- volumes :"), sol = srcR.slice(iSol, iVol);
  verifier("Rendu : onde de la tour rivale neuve et de l'alerte, anneau de la porte ouverte au sol (sous les murs), et la tour neuve en fondu",
    iSol > 0 && iVol > iSol && /genre === "tourRivale"/.test(sol) && /genre === "alerte"/.test(sol) && /genre === "porteOuverte"/.test(sol) &&
    /onde\(ctx/.test(sol) && /anneau\(ctx/.test(sol) && /fonduTour\(tr, v\)/.test(sol) && /function fonduTour/.test(srcR) && /var NAISSANCE_TOUR = 0\.7/.test(srcR), { iSol, iVol });
})();

// ---------- expéditions (24/10/2026) : accroches facultatives dans recit.js, interface.js, campagne.js et bataille.js ----------
// Sans quota, sans extra, sans contexte, chaque fonction fait ce qu'elle faisait : le tirage est comparé à l'empreinte relevée
// avant les accroches (RNG à graine sur le Math du bac à sable, cours synthétiques des semaines 1 à 3) et au même source dont
// le bloc [quota] est retiré ; la bataille de route est jouée pour de vrai (moteur et rendu) sur un DOM factice.
(() => {
  const CTRL = require("./controles.js");
  // bac à sable à tirage reproductible : U.hasard, leitner.tirer et questions.choisirPourFiche tirent sur le Math du contexte
  function bacTirage(graine, sourceRecit) {
    const ctx = contexte(), J = ctx.JEU;
    if (sourceRecit) vm.runInContext(sourceRecit, ctx, { filename: "recit-essai.js" });
    const Mth = vm.runInContext("Math", ctx);
    let s = graine >>> 0;
    Mth.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    J.sauvegarde.charger();
    [1, 2, 3].forEach(w => ["histoire", "geographie", "svt", "physique", "litterature"].forEach(m => { const id = m + "-s0" + w + "-1"; J.donnees.cours[id] = coursRiche(id, 10); }));
    J.donnees.aRetravailler = []; J.donnees.suivi = { cours: {} };
    J.questions.vider(); J.progression.oublier();
    J.sauvegarde.remplacer(J.sauvegarde.nouvelle()); seance(J);
    return ctx;
  }
  const empreinte = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
  const justeDet = q => !!q.rappel || (q.id.length + q.id.charCodeAt(q.id.length - 1) + q.id.charCodeAt(q.id.length - 2)) % 5 !== 0;
  const jouerRef = J => { const seq = jouerJeu(J, 12, justeDet, false, null); return { n: seq.length, e: empreinte(seq.map(x => x.id + (x.rappel ? "*" : "")).join(",")) }; };
  const semaineDe = (J, q) => { const s = J.recit.semaineDuCours(q.cours); return s ? s.numero : null; };

  // --- régression : sans quota, le tirage d'aujourd'hui (empreintes relevées le 24/10/2026 avant les accroches, 12 parties) ---
  const REF = { "1329438721": { n: 105, e: "dee5a7c5" }, "7": { n: 105, e: "4ed67412" } };
  const apresAccroches = { "1329438721": jouerRef(bacTirage(1329438721).JEU), "7": jouerRef(bacTirage(7).JEU) };
  verifier("Expédition, tirage sans quota : identique au tirage d'avant les accroches (deux graines, 105 questions chacune, rappels compris)", JSON.stringify(apresAccroches) === JSON.stringify(REF), apresAccroches);
  const srcRecit = fs.readFileSync(path.join(RACINE, "jeu", "js", "recit.js"), "utf8");
  const sansQuota = srcRecit.replace(/\/\/ \[quota\][\s\S]*?\/\/ \[\/quota\]/, "var quota = null;");
  verifier("Expédition, tirage sans quota : le bloc [quota] … [/quota] du source retiré, même tirage encore", sansQuota !== srcRecit && JSON.stringify(jouerRef(bacTirage(7, sansQuota).JEU)) === JSON.stringify(REF["7"]));

  // --- quota de semaine ---
  const J = bacTirage(42).JEU, R = J.recit, Q = J.questions, sem = q => semaineDe(J, q);
  const quotaS1 = { nombre: 2, filtre: q => sem(q) === 1 };
  const lots = []; let posees = [];
  for (let i = 0; i < 30; i++) {
    const ids = posees.map(q => q.id), fiches = posees.map(q => q.fiche);
    const qs = Q.avecNiveaux(Q.NIVEAUX_BATAILLE, () => R.suite(3, { exclure: ids, filtre: q => fiches.indexOf(q.fiche) < 0, completer: true, quota: quotaS1 }));
    qs.forEach(q => Q.enregistrerReponse(q, true));
    lots.push(qs); posees = i % 4 === 3 ? [] : posees.concat(qs);
  }
  verifier("Quota : suite(3, { quota S1 }) donne 2 questions de la semaine 1 dans chacun de 30 lots de bataille (niveaux 1 à 3), de fiches distinctes, et la troisième vient souvent d'ailleurs",
    lots.every(l => l.length === 3 && l.filter(q => sem(q) === 1).length >= 2 && new Set(l.map(q => q.fiche)).size === 3 && l.every(q => q.niveau >= 1 && q.niveau <= 3)) && lots.filter(l => l.some(q => sem(q) !== 1)).length >= 12,
    { semaines: lots.map(l => l.map(sem)), autres: lots.filter(l => l.some(q => sem(q) !== 1)).length });
  const qs9 = R.suite(3, { quota: { nombre: 2, filtre: q => sem(q) === 9 } });
  verifier("Quota : 3 questions d'autres semaines quand la fenêtre n'a aucun cours (le tirage ne bloque jamais)", qs9.length === 3 && qs9.every(q => sem(q) !== 9) && new Set(qs9.map(q => q.id)).size === 3, qs9.map(sem));
  const qs3 = R.suite(3, { quota: { nombre: 3, filtre: q => sem(q) < 2 } });
  verifier("Quota : nombre 3 et filtre « semaine < 2 » : 3 questions de la semaine 1, de trois fiches", qs3.length === 3 && qs3.every(q => sem(q) === 1) && new Set(qs3.map(q => q.fiche)).size === 3, qs3.map(sem));
  const qsvt = R.suite(1, { quota: { nombre: 1, filtre: q => R.famille(q.matiere) === "svt" } });
  verifier("Quota : sur la famille « svt » (question d'un conseiller), une question de SVT", qsvt.length === 1 && qsvt[0].matiere === "svt", qsvt.map(q => q.matiere));
  const ratee = R.suite(1, { quota: { nombre: 1, filtre: q => sem(q) === 2 } })[0];
  Q.enregistrerReponse(ratee, false);
  for (let k = 0; k < 3; k++) R.suite(1, { quota: quotaS1 }).forEach(q => Q.enregistrerReponse(q, true));
  const avecRappel = R.suite(3, { quota: quotaS1 });
  verifier("Quota : une « Seconde chance » due est placée une seule fois (en tête du lot), le quota autour d'elle", avecRappel.length === 3 && avecRappel.filter(q => q.rappel).length === 1 && avecRappel[0].id === ratee.id && avecRappel[0].rappel === true &&
    new Set(avecRappel.map(q => q.id)).size === 3 && avecRappel.slice(1).filter(q => sem(q) === 1).length >= 1, avecRappel.map(q => q.id + (q.rappel ? "*" : "")));
  verifier("Quota : sans filtre ou avec nombre 0, l'option est ignorée (lot ordinaire de 3)", R.suite(3, { quota: { nombre: 0, filtre: () => false } }).length === 3 && R.suite(3, { quota: { nombre: 2 } }).length === 3);
  const JW = bacTirage(99).JEU, seqW = [];
  for (let i = 0; i < 40; i++) JW.recit.suite(3, { quota: { nombre: 2, filtre: q => semaineDe(JW, q) === 1 } }).forEach(q => { seqW.push({ id: q.id, rappel: !!q.rappel }); JW.questions.enregistrerReponse(q, true); });
  verifier("Quota : sur 40 lots (120 questions, 2 sur 3 de la semaine 1), aucune question reposée parmi les 60 précédentes", seqW.length === 120 && reposees(seqW, () => 60) === 0, reposees(seqW, () => 60));

  // --- cadre de route, {S}, r.semaine ---
  const ctxC = contexte(), JC = ctxC.JEU;
  ["histoire-s04-1", "methode-frise", "langue-conj10"].forEach(id => vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", "cours", id + ".js"), "utf8"), ctxC));
  vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", "anglais", "anglais-seq01.js"), "utf8"), ctxC);
  vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "data", "personnages.js"), "utf8"), ctxC);
  JC.sauvegarde.charger();
  const qH = JC.questions.questionsDuCours("histoire-s04-1")[0], qM = JC.questions.questionsDuCours("methode-frise")[0], qL = JC.questions.questionsDuCours("langue-conj10")[0], qA = JC.questions.questionsDuCours("anglais-seq01")[0];
  const cR = JC.recit.cadre(qH, "route", null, { semaine: 4, semaines: [4] });
  verifier("Cadre de route : r.semaine = { numero 4, libelle « Semaine 4 », route true, titre du cours } pour un cours de la semaine de l'acte ; repère et conseiller gardés",
    cR.semaine && cR.semaine.numero === 4 && cR.semaine.libelle === "Semaine 4" && cR.semaine.route === true && /Cours 5/.test(cR.semaine.titre) && cR.repere === "Semaine 4 · Histoire · Cours 5" && cR.nom === "Le chroniqueur" && cR.icone === "chroniqueur", cR);
  const cHors = JC.recit.cadre(qH, "gardien", null, { semaine: 6, semaines: [5, 6] }), cCamp = JC.recit.cadre(qH, "preparation"), cSeul = JC.recit.cadre(qH, "archives", null, { semaine: 4 });
  verifier("Cadre : route false hors de la fenêtre de l'acte et en campagne (sans extra) ; extra.semaine seule vaut fenêtre ; une question sans cours n'a pas de semaine",
    cHors.semaine.route === false && cHors.semaine.numero === 4 && cCamp.semaine && cCamp.semaine.route === false && cCamp.semaine.libelle === "Semaine 4" && cSeul.semaine.route === true &&
    !JC.recit.cadre({ matiere: "histoire" }, "route", null, { semaine: 4 }).semaine && JC.recit.semaineDuCours("inconnu-s99-1") === null, [cHors.semaine, cCamp.semaine]);
  const libelles = [[qL, "Griffon de cuivre"], [qM, "Fiche méthode"], [qA, "Anglais · séquence 1"]].map(([q, lib]) => { const c = JC.recit.cadre(q, "route", null, { semaine: 1, semaines: [1] }); return { lib, ok: !!c.semaine && c.semaine.numero === null && c.semaine.libelle === lib && c.semaine.route === false, vu: c.semaine }; });
  verifier("Cadre : cours sans semaine : « Griffon de cuivre » (grammaire), « Fiche méthode », « Anglais · séquence 1 », numero null, jamais en relief", libelles.every(x => x.ok), libelles);
  let avecS = 0; const textesS = [], sansExtra = [];
  for (let i = 0; i < 60; i++) { const t = JC.recit.cadre(qH, "route", null, { semaine: 4 }).texte; if (/semaine 4/.test(t)) avecS++; textesS.push(t); sansExtra.push(JC.recit.cadre(qH, "route").texte); }
  verifier("Cadre de route : avec extra.semaine le conseiller dit « semaine 4 » (une phrase sur deux environ) ; sans extra, jamais de {S}, de « { » ni de chiffre dans la phrase ; l'énoncé ne change pas",
    avecS >= 12 && avecS <= 48 && textesS.every(t => t.indexOf("{") < 0) && sansExtra.every(t => t.indexOf("{") < 0 && !/\d/.test(t)) && qH.enonce === JC.questions.questionsDuCours("histoire-s04-1")[0].enonce, { avecS });
  const cRap = JC.recit.cadre(Object.assign({}, qH, { rappel: true }), "embuscade", null, { semaine: 4 });
  verifier("Cadre de route : une question qui revient garde les phrases et l'étiquette « Seconde chance »", /tout à l'heure|seconde chance/i.test(cRap.texte) && cRap.etiquette === "Seconde chance" && cRap.semaine.route === true, cRap);
  const contextes = Object.keys(JC.recit.CONTEXTES_ROUTE), noms = (JC.donnees.personnages.personnages || []).filter(p => !p.titreSeul && p.nom).map(p => p.nom), fautes = [];
  contextes.forEach(c => {
    const l = JC.recit.PHRASES[c] || [];
    if (l.length < 3) fautes.push(c + " : " + l.length + " phrases");
    if (!l.some(t => t.indexOf("{S}") < 0)) fautes.push(c + " : aucune phrase sans {S}");
    if (!l.some(t => t.indexOf("{S}") >= 0)) fautes.push(c + " : aucune phrase avec {S}");
    l.forEach(t => {
      if (t.indexOf("{N}") < 0) fautes.push(c + " : sans {N} : " + t);
      if (/\d/.test(t)) fautes.push(c + " : chiffre : " + t);
      const m = CTRL.MOTS_INTERDITS.exec(t); if (m) fautes.push(c + " : mot interdit « " + m[2] + " » : " + t);
      if (/\bvite\b|chrono|dépêch|pénalité|tu perds/i.test(t)) fautes.push(c + " : hâte ou perte : " + t);
      (t.match(/\{[^}]*\}/g) || []).forEach(x => { if (x !== "{N}" && x !== "{S}") fautes.push(c + " : marque " + x); });
      noms.forEach(n => { if (t.indexOf(n) >= 0) fautes.push(c + " : nomme " + n); });
    });
  });
  verifier("Phrases de route (" + contextes.join(", ") + ") : {N} partout, trois phrases au moins par contexte, avec et sans {S}, ni chiffre, ni mot interdit du contrôle 10, ni hâte, ni nom d'un personnage",
    contextes.length === 8 && ["route", "embuscade", "gardien", "bivouac", "marchand", "archives", "porte", "cache"].every(c => JC.recit.CONTEXTES_ROUTE[c]) && JC.recit.PHRASES.tresor.length === 3 && fautes.length === 0, fautes);
  const srcI = fs.readFileSync(path.join(RACINE, "jeu", "js", "interface.js"), "utf8"), cssR = fs.readFileSync(path.join(RACINE, "jeu", "css", "jeu.css"), "utf8");
  verifier("Interface : ui.recit pose le titre du cours en infobulle et la classe recit-semaine (relief) quand r.semaine.route est vrai ; panneauErreur(q, zone, suite, options) sans « Voir la fiche » avec options.sansFiche ; règle CSS",
    /if \(r\.semaine\.route\) ruban\.classList\.add\("recit-semaine"\)/.test(srcI) && /ruban\.title = r\.semaine\.titre/.test(srcI) && /ui\.panneauErreur = function \(q, zone, suite, options\)/.test(srcI) && /f && !options\.sansFiche \? el\("button"/.test(srcI) && /\.recit-repere\.recit-semaine \{/.test(cssR));

  // --- DOM et interface factices : de quoi jouer un événement et une bataille sous Node ---
  function noeud(tag) {
    const e = { tag, enfants: [], attrs: {}, style: {}, classes: new Set(), textContent: "", innerHTML: "", isConnected: true, width: 0, height: 0, scrollTop: 0, scrollHeight: 0, clientHeight: 0, hidden: false,
      appendChild(c) { e.enfants.push(c); return c; }, insertBefore(c) { e.enfants.unshift(c); return c; }, removeChild(c) { e.enfants = e.enfants.filter(x => x !== c); return c; }, remove() {}, replaceChildren() { e.enfants = []; },
      setAttribute(k, v) { e.attrs[k] = v; }, getAttribute(k) { return k in e.attrs ? e.attrs[k] : null; }, removeAttribute(k) { delete e.attrs[k]; }, hasAttribute(k) { return k in e.attrs; },
      addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; }, focus() {}, blur() {}, click() {}, closest() { return null; }, matches() { return false; }, contains() { return false; },
      querySelector() { return noeud("div"); }, querySelectorAll() { return []; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
      getContext() { return ctx2d(); }, toDataURL() { return ""; },
      classList: { add(...c) { c.forEach(x => e.classes.add(x)); }, remove(...c) { c.forEach(x => e.classes.delete(x)); }, toggle(c, f) { const on = f === undefined ? !e.classes.has(c) : !!f; if (on) e.classes.add(c); else e.classes.delete(c); return on; }, contains(c) { return e.classes.has(c); } } };
    Object.defineProperty(e, "className", { get: () => [...e.classes].join(" "), set: v => { e.classes = new Set(String(v).split(/\s+/).filter(Boolean)); } });
    return e;
  }
  function ctx2d() { const g = { addColorStop() {}, width: 10 }; return new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => g), set: (t, k, v) => { t[k] = v; return true; } }); }
  // Interface factice : poserQuestion garde la réponse à donner (ui.repondre), panneauErreur garde la suite (ui.continuerErreur) ;
  // le journal note les questions, les cadres, les panneaux et l'ordre des cartes de récit (R) et des questions (Q).
  function uiFactice(ctx) {
    const J = ctx.JEU, journal = { questions: [], panneaux: [], recits: [], parties: [], toasts: [], ordre: "", ecrans: [] };
    let fini = null;
    const ui = {
      el(tag, attrs, enfants) {
        const e = noeud(tag);
        if (attrs) Object.keys(attrs).forEach(k => { const v = attrs[k]; if (v == null || v === false) return; if (k === "class") e.className = v; else if (k === "html") e.innerHTML = v; else if (k === "texte") e.textContent = v; else if (k.slice(0, 2) === "on") e["_" + k] = v; else e.attrs[k] = v; });
        (enfants || []).forEach(c => { if (c == null || c === false) return; e.appendChild(typeof c === "string" ? { nodeType: 3, textContent: c } : c); });
        return e;
      },
      commencerPartie(titre, quitter) { J.partie = { enCours: true, titre, quitter, derniere: null }; journal.parties.push(titre); return (ui.zone = noeud("div")); },
      proposerQuitter() { if (!J.partie) return; const q = J.partie.quitter; if (J.partie.surQuitter) J.partie.surQuitter(); ui.finirPartie(); if (q) q(); },
      finirPartie() { J.partie = null; ui.clavier = null; },
      poserQuestion(q, zone, f, options) { journal.questions.push({ q, recit: options && options.recit }); journal.ordre += "Q"; fini = f; ui.questionCourante = q; },
      enAttente() { return !!fini; },
      repondre(juste) { const f = fini; fini = null; if (!f) throw new Error("aucune question posée"); f(juste, null); },
      panneauErreur(q, zone, suite, options) { journal.panneaux.push({ q, options }); ui.continuerErreur = () => { ui.continuerErreur = null; suite(); }; },
      recit(r) { journal.recits.push(r); journal.ordre += "R"; const e = noeud("div"); e.recit = r; return e; },
      toast(t) { journal.toasts.push(t); }, tampon() {}, majRessources() {}, noterDerniere(q) { if (J.partie) J.partie.derniere = q; }, afficher(nom) { journal.ecrans.push(nom); }, focusAuClavier() { return false; },
      confirmer(t, b, f) { f(); }, clavier: null, continuerErreur: null
    };
    J.ui = ui;
    J.anim = { actif: () => false, apresImage: f => f(), centre: () => ({ x: 0, y: 0 }), eclat() {}, sang() {}, gain() {} };
    J.sons = { jouer() {} }; J.musique = { humeur() {} }; J.mentor = { feliciter() {}, dire() {} }; J.icones = { icone: () => "" };
    J.mesure = { debut: null, questionAffichee() {}, reponseDonnee() {} }; J.codex = { ouvrirFiche() {} }; J.signalement = { ouvrir() {} };
    ctx.document = { createElement: noeud, createTextNode: t => ({ nodeType: 3, textContent: t }), getElementById: () => null, querySelector: () => null, body: noeud("body"), activeElement: null };
    ctx.requestAnimationFrame = cb => { ctx.__image = cb; return 1; }; ctx.devicePixelRatio = 1; ctx.addEventListener = () => {}; ctx.removeEventListener = () => {};
    ctx.setTimeout = () => 0; ctx.clearTimeout = () => {};
    ctx.Image = function () { const im = this; Object.defineProperty(im, "src", { set(v) { im._src = v; if (im.onerror) im.onerror(); }, get() { return im._src; } }); };
    const Dt = vm.runInContext("Date", ctx), vrai = Dt.now; ctx.__decal = 0; Dt.now = () => vrai() + ctx.__decal;
    return journal;
  }
  // Répond à toutes les questions du conseil de guerre (juste(q) décide), continue après chaque panneau d'erreur, puis lance la vague.
  function conseilDeGuerre(ctx, juste) {
    const ui = ctx.JEU.ui, p = ctx.JEU.bataille.enCours;
    for (let garde = 0; ui.enAttente() && garde < 40; garde++) { ui.repondre(juste(ui.questionCourante)); if (ui.continuerErreur) ui.continuerErreur(); }
    ctx.__decal += 2000; // la garde de 700 ms sur l'Entrée qui finit la dernière question
    if (ui.clavier) ui.clavier("Enter");
    if (ui.clavier && p.phase === "preparation") ui.clavier("Enter"); // « il te reste de l'or » : une seconde fois
    return p.phase === "vague";
  }
  // Joue la bataille jusqu'au bout par la boucle d'animation du rendu (images de 50 ms), conseil de guerre compris.
  function jouerBataille(ctx, juste, maxImages) {
    const p = ctx.JEU.bataille.enCours; let t = 0, images = 0;
    while (p.phase !== "fin" && images < maxImages) {
      if (p.phase === "preparation" && !conseilDeGuerre(ctx, juste)) throw new Error("la vague n'a pas été lancée (phase " + p.phase + ")");
      t += 50; images++; ctx.__image(t);
    }
    return images;
  }

  // --- campagne : gains de rivalité, reagir exporté, jouerEvenement(ev, contexte) ---
  const ctxE = bacTirage(11), JE = ctxE.JEU, CE = JE.campagne, journalE = uiFactice(ctxE);
  verifier("Campagne : GAINS_RIVALITE.gardien = 2 et grandGardien = 6, les autres gains inchangés, reagir exporté",
    CE.GAINS_RIVALITE.gardien === 2 && CE.GAINS_RIVALITE.grandGardien === 6 && CE.GAINS_RIVALITE.province === 15 && CE.GAINS_RIVALITE.victoire === 10 && CE.GAINS_RIVALITE.tenu === 4 && CE.GAINS_RIVALITE.attaque === 8 && typeof CE.reagir === "function", CE.GAINS_RIVALITE);
  CE.etat().evenement = { id: "defi", jour: JE.util.jour(), fait: false };
  const campagneAvant = JSON.stringify(CE.etat()), traces = [];
  const ctxRouteEv = { tirage: n => { traces.push("tirage " + n); return JE.recit.suite(n, { quota: { nombre: 2, filtre: q => semaineDe(JE, q) === 2 } }); },
    cadre: q => Object.assign(JE.recit.cadre(q, "route", null, { semaine: 2, semaines: [2] }), { marque: "route" }),
    cloturer: (id, bonnes, total) => { traces.push("cloturer " + id + " " + bonnes + "/" + total); return "Les mercenaires suivent la compagnie."; }, retour: () => traces.push("retour") };
  CE.jouerEvenement(CE.EVENEMENTS.filter(e => e.id === "mercenaires")[0], ctxRouteEv);
  journalE.ui = JE.ui;
  JE.ui.repondre(true); JE.ui.repondre(false); JE.ui.continuerErreur();
  const bilanEv = JE.ui.zone.enfants[1] && JE.ui.zone.enfants[1].enfants[0];
  const texteBilan = bilanEv ? bilanEv.enfants.map(e => e.textContent).join(" | ") : "";
  JE.ui.clavier("Enter");
  verifier("Événement rejoué sur la route : questions du contexte (quota), cadre du contexte, cloturer(id, bonnes, total) donne la phrase du bilan, « Continuer la route », retour() ; ni c.bonus ni l'événement du jour ne bougent",
    traces.join(";") === "tirage 2;cloturer mercenaires 1/2;retour" && journalE.questions.length === 2 && journalE.questions.every(x => x.recit && x.recit.marque === "route" && x.recit.semaine && x.recit.semaine.route === (x.recit.semaine.numero === 2)) &&
    journalE.panneaux.length === 1 && /Les mercenaires suivent la compagnie\./.test(texteBilan) && /Continuer la route \(Entrée\)/.test(texteBilan) && JSON.stringify(CE.etat()) === campagneAvant &&
    CE.etat().bonus.or === undefined && CE.etat().evenement.fait === false && JE.partie === null && journalE.parties[0] === "Des mercenaires", { traces, texteBilan, bonus: CE.etat().bonus });
  // sans paramètre : l'événement du jour de la campagne, comme avant
  CE.jouerEvenement();
  JE.ui.repondre(true); JE.ui.repondre(true); JE.ui.repondre(true);
  verifier("Événement du jour sans paramètre : inchangé (le défi du champion joué, marqué fait, « Retour à la campagne »)",
    journalE.parties[1] === "Le défi du champion" && CE.etat().evenement.fait === true && journalE.questions.length === 5 && journalE.questions.slice(2).every(x => x.recit && !x.recit.marque) &&
    /Retour à la campagne \(Entrée\)/.test(JE.ui.zone.enfants[1].enfants[0].enfants.map(e => e.textContent).join(" | ")), journalE.parties);
  JE.ui.clavier("Enter");

  // --- bataille de route : lancer(lieu, contexte) sur le vrai moteur et le vrai rendu (DOM factice) ---
  const ctxB = bacTirage(2026), JB2 = ctxB.JEU, CB = JB2.campagne, journalB = uiFactice(ctxB);
  vm.runInContext(fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8"), ctxB, { filename: "bataille.js" });
  const apresVrai = CB.apresBataille, appelsApres = [];
  CB.apresBataille = function (b) { appelsApres.push(b); return apresVrai(b); };
  CB.etat().bonus = { or: 40, espion: true }; // les bonus de l'événement du jour : la route ne les consomme pas
  const optionsRoute = Object.assign(CB.options(2), { orDepart: 77, orPerduErreur: 4, orParReponse: 14, espion: false });
  const jr = { tirages: [], niveauxMax: [], vitesses: [], vagues: [], quitte: [], retours: 0, fin: null };
  const contexteRoute = { carte: "gue", titre: "Gardien de la semaine 3", front: "angleterre", niveau: 2, vagues: 2, defense: true, pvRival: 12, pvRivalMax: 12, options: optionsRoute, semaine: 3,
    sansFiche: true, vitesse: 3, nomRival: "Un seigneur rival", eclaireur: "Phrase de l'éclaireur pour l'essai.", eclaireurs: 2,
    tirage: (n, posees) => { jr.tirages.push(n); jr.niveauxMax.push(JB2.questions.niveauMax()); const ids = posees.map(q => q.id), fiches = posees.map(q => q.fiche);
      return JB2.recit.suite(n, { exclure: ids, filtre: q => fiches.indexOf(q.fiche) < 0, completer: true, quota: { nombre: 2, filtre: q => semaineDe(JB2, q) === 3 } }); },
    cadre: q => Object.assign(JB2.recit.cadre(q, "gardien", null, { semaine: 3, semaines: [3] }), { marque: "route" }),
    surVitesse: n => jr.vitesses.push(n), surVague: n => jr.vagues.push(n), surQuitter: e => jr.quitte.push(e), retour: () => { jr.retours++; },
    surFin: b => { jr.fin = b; return { titre: "Semaine franchie", texte: "Le gardien recule.", butin: "+25 or de route", bouton: "Reprendre la route (Entrée)" }; } };
  const campagneAvantB = JSON.stringify(CB.etat()), partiesAvant = JB2.sauvegarde.etat().stats.parties;
  let erreur = null, images = 0, p1 = null;
  try {
    JB2.bataille.lancer("s3g", contexteRoute);
    p1 = JB2.bataille.enCours;
    images = jouerBataille(ctxB, q => !/q(7|13)$/.test(q.id), 6000);
  } catch (e) { erreur = e && e.stack || String(e); }
  verifier("Bataille de route : lancée et jouée jusqu'au bilan sur le moteur et le rendu (DOM factice), sans erreur", !erreur && p1 && p1.phase === "fin" && images > 0 && images < 6000, erreur || { images, phase: p1 && p1.phase });
  verifier("Bataille de route : les options viennent du contexte (or de départ 77 sans les +40 de la campagne, erreur −4, réponse +14, niveau 2, carte du Gué, défense, 2 vagues, camp de 12)",
    p1 && p1.or !== undefined && optionsRoute.orDepart === 77 && p1.orPerduErreur === 4 && p1.orParReponse === 14 && p1.niveau === 2 && p1.carte.id === "gue" && p1.defense === true && p1.vagues === 2 && p1.rival.max === 12 && p1.stats && journalB.parties[0] === "Gardien de la semaine 3",
    p1 && { or: p1.or, perdu: p1.orPerduErreur, rep: p1.orParReponse, niveau: p1.niveau, carte: p1.carte.id, defense: p1.defense, vagues: p1.vagues, rival: p1.rival.max });
  const bilanB = journalB.ui = JB2.ui;
  const conseilB = JB2.ui.zone.enfants[1] && JB2.ui.zone.enfants[1].enfants[0];
  const texteFinB = conseilB ? conseilB.enfants.map(e => e.enfants.map(x => x.textContent).join(" | ")).join(" | ") : "";
  verifier("Bataille de route : surFin(bilan) reçoit le bilan (issue, vagues, murs, solidité du camp, réponses) à la place de C.apresBataille ; ses textes habillent l'écran de fin ; stats.parties compte la halte",
    jr.fin && ["tenu", "victoire", "retraite"].indexOf(jr.fin.issue) >= 0 && jr.fin.lieu === "s3g" && jr.fin.front === "angleterre" && typeof jr.fin.murs === "number" && typeof jr.fin.pvRival === "number" && jr.fin.pvRivalMax === 12 && jr.fin.total === 6 && jr.fin.bonnes >= 3 &&
    appelsApres.length === 0 && /Semaine franchie/.test(texteFinB) && /Le gardien recule\./.test(texteFinB) && /\+25 or de route/.test(texteFinB) && /Reprendre la route \(Entrée\)/.test(texteFinB) && JB2.sauvegarde.etat().stats.parties === partiesAvant + 1,
    { fin: jr.fin, apres: appelsApres.length, texteFinB });
  verifier("Bataille de route : la campagne n'a pas bougé (provinces, rival, bonus de l'événement du jour gardés : or 40, espion)", JSON.stringify(CB.etat()) === campagneAvantB && CB.etat().bonus.or === 40 && CB.etat().bonus.espion === true, CB.etat().bonus);
  verifier("Bataille de route : tirage(n, posees) du contexte pour chaque vague, aux niveaux 1 à 3 ; cadre(q) du contexte sur chaque question (ruban de la semaine 3 en relief pour 2 sur 3) ; panneau d'erreur avec { sansFiche: true }",
    jr.tirages.join() === "3,3" && jr.niveauxMax.every(n => n === 3) && journalB.questions.length === 6 && journalB.questions.every(x => x.recit && x.recit.marque === "route") &&
    journalB.questions.filter(x => x.recit.semaine && x.recit.semaine.route).length >= 4 && journalB.panneaux.length >= 1 && journalB.panneaux.every(x => x.options && x.options.sansFiche === true),
    { tirages: jr.tirages, niveaux: jr.niveauxMax, relief: journalB.questions.map(x => x.recit.semaine && x.recit.semaine.route), panneaux: journalB.panneaux.map(x => x.options) });
  const iEclaireur = journalB.recits.findIndex(r => r.texte === "Phrase de l'éclaireur pour l'essai.");
  verifier("Bataille de route : la phrase de l'éclaireur est une carte de récit avant la première question de la 1re vague, jamais entre deux questions ; surVague(0) puis surVague(1) ; le rival parle sous son titre",
    /^R+Q+(R+Q+)*R*$/.test(journalB.ordre) && iEclaireur >= 0 && journalB.ordre.indexOf("Q") > 0 && journalB.recits.slice(0, journalB.ordre.indexOf("Q")).some(r => r.texte === "Phrase de l'éclaireur pour l'essai.") &&
    jr.vagues.join() === "0,1" && journalB.recits.some(r => r.nom === "Un seigneur rival") && journalB.recits.filter(r => r.nom === "Un éclaireur" && r.texte === "Phrase de l'éclaireur pour l'essai.").length === 1,
    { ordre: journalB.ordre, iEclaireur, vagues: jr.vagues });
  JB2.ui.clavier("Enter");
  verifier("Bataille de route : « Entrée » au bilan appelle contexte.retour() (pas la carte de campagne), la partie est finie", jr.retours === 1 && JB2.partie === null && journalB.ecrans.length === 0, { retours: jr.retours, ecrans: journalB.ecrans });
  // quitter avant la première vague : surQuitter(false) ; après : surQuitter(true) ; jamais C.apresBataille
  JB2.bataille.lancer("s3g", contexteRoute);
  JB2.ui.proposerQuitter();
  JB2.bataille.lancer("s3g", contexteRoute);
  const lancee = conseilDeGuerre(ctxB, () => true);
  JB2.ui.proposerQuitter();
  verifier("Bataille de route : quitter avant la première vague donne surQuitter(false), après surQuitter(true) ; retour() à chaque fois ; C.apresBataille jamais appelée ; vitesse ×3 retenue du contexte",
    lancee && jr.quitte.join() === "false,true" && jr.retours === 3 && appelsApres.length === 0 && JB2.partie === null && jr.vagues.join() === "0,1,0", { quitte: jr.quitte, retours: jr.retours, lancee });
  // sans contexte : la bataille de campagne d'aujourd'hui (province du Gué), qui passe par C.apresBataille
  JB2.bataille.lancer("gue");
  const p2 = JB2.bataille.enCours;
  JB2.ui.proposerQuitter();
  verifier("Bataille de campagne sans contexte : inchangée (4 vagues, attaque, or de départ avec les +40 de l'événement, C.apresBataille à la retraite avec entamee false, retour à la carte)",
    p2 && p2.vagues === 4 && p2.defense === false && p2.carte.id === "gue" && p2.or === CB.options(1).orDepart && appelsApres.length === 1 && appelsApres[0].lieu === "gue" && appelsApres[0].issue === "retraite" && appelsApres[0].entamee === false &&
    journalB.ecrans.slice(-1)[0] === "jouer" && journalB.parties.slice(-1)[0] === "Bataille : Le Gué", { or: p2 && p2.or, attendu: CB.options(1).orDepart, apres: appelsApres });
  // le source : tout ce qui touche la campagne reste sous « sans contexte »
  const srcB = fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille.js"), "utf8");
  verifier("Bataille : dans le source, C.apresBataille n'est appelée que dans les branches sans contexte (deux appels), et bataille-moteur.js n'est pas touché par l'expédition",
    (srcB.match(/C\.apresBataille\(/g) || []).length === 2 && /else C\.apresBataille\(\{ lieu: lieu, front: frontId, issue: "retraite"/.test(srcB) && /\} else gains = C\.apresBataille\(b\);/.test(srcB) &&
    !/contexte|expedition|quota/i.test(fs.readFileSync(path.join(RACINE, "jeu", "js", "bataille-moteur.js"), "utf8")));
})();

console.log("\n" + ok + " réussis, " + ko + " en échec.");
process.exit(ko ? 1 : 0);
