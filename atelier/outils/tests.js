// Tests de logique (Node) : calendrier, états des cours, Leitner, brouillage, migration et import, campagne, moteur de bataille,
// règles du validateur pour suivi.js.
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
verifier("Migration 1 → 4 : rien de perdu", conserve && m.schema === 4);
verifier("Migration 1 → 4 : file des rappels vide", JSON.stringify(m.rappels) === JSON.stringify({ compteur: 0, file: [] }), m.rappels);
verifier("Migration 1 → 4 : campagne neuve et musique", m.campagne && m.campagne.conquises.length === 0 && m.campagne.arsenal.tours.archers === 1 && m.reglages.musique === true);
verifier("Migration 1 → 2 : nouveaux champs", m.reglages && m.reglages.son === true && m.stats.bonnes === 3 && m.stats.total === 4 && typeof m.questionsVues === "object");
const sansSchema = J.sauvegarde.migrer({ cours: {}, notions: {} });
verifier("Sauvegarde sans numéro de schéma traitée comme schéma 1", sansSchema.schema === 4 && sansSchema.ressources.sceaux === 0);

// export puis import : même partie
J.sauvegarde.remplacer(m);
const txt = J.sauvegarde.texteExport();
J.sauvegarde.importer(txt);
verifier("Export puis import : même partie", JSON.stringify(J.sauvegarde.etat()) === JSON.stringify(JSON.parse(txt)));
// un fichier qui n'est pas une sauvegarde est refusé, et la partie en cours ne bouge pas
const refuse = t => { try { J.sauvegarde.importer(t); return false; } catch (e) { return true; } };
const avantImport = JSON.stringify(J.sauvegarde.etat());
verifier("Import d'un fichier étranger refusé, partie intacte", refuse('{"name":"mon-projet","version":"1.0.0"}') && refuse("[]") && refuse("pas du JSON") && JSON.stringify(J.sauvegarde.etat()) === avantImport);

// migration 2 → 3 → 4 : la campagne s'ajoute, puis la file des rappels ; le reste ne bouge pas
const v2 = JSON.parse(JSON.stringify(m)); delete v2.campagne; delete v2.rappels; v2.schema = 2; delete v2.reglages.musique;
const m3 = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v2)));
verifier("Migration 2 → 4 : rien de perdu", ["cours", "notions", "ressources", "batiments", "stats"].every(k => JSON.stringify(m3[k]) === JSON.stringify(v2[k])) && m3.schema === 4 && m3.campagne.provinces.gue.pv === 16 && m3.rappels.file.length === 0);
// migration 3 → 4 : seule la file des rappels s'ajoute, tout le reste est identique
const v3 = JSON.parse(JSON.stringify(m)); delete v3.rappels; v3.schema = 3;
v3.campagne.conquises = ["gue"]; v3.campagne.royaume.savoir = 5; v3.questionsVues = { "methode-frise-q3": 2 };
const m4 = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v3)));
verifier("Migration 3 → 4 : rien de perdu, file des rappels ajoutée",
  Object.keys(v3).filter(k => k !== "schema").every(k => JSON.stringify(m4[k]) === JSON.stringify(v3[k])) && m4.schema === 4 &&
  JSON.stringify(m4.rappels) === JSON.stringify({ compteur: 0, file: [] }), Object.keys(m4));
verifier("Sauvegarde d'un schéma plus récent (5) refusée", (() => { try { J.sauvegarde.migrer({ schema: 5, creeLe: "2026-10-15T10:00:00", notions: {}, ressources: {} }); return false; } catch (e) { return true; } })());

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

// sauvegarde : la file est gardée (export, import) ; à la séance suivante, les rappels en attente passent en tête
verifier("Sauvegarde neuve : schéma 4, file des rappels vide", JR.sauvegarde.nouvelle().schema === 4 && JSON.stringify(JR.sauvegarde.nouvelle().rappels) === JSON.stringify({ compteur: 0, file: [] }));
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
verifier("Tirage avec les vrais cours : un lot de 3 en moins de 5 ms (médiane)", tempsV[Math.floor(tempsV.length / 2)] < 5, tempsV[Math.floor(tempsV.length / 2)].toFixed(2) + " ms");

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
const d2 = duel("cavaliers", "hommes");
let gC = 0;
while (d2.r.pv === d2.r.max && gC++ < 400) MM.etape(d2.p, 0.025);
verifier("Mêlée : la charge des cavaliers frappe vite et double au premier coup", Math.abs(d2.r.max - d2.r.pv - MM.MELEE.charge * MM.TROUPES.cavaliers.coup) < 1e-9 && gC <= Math.ceil(MM.MELEE.chargeCoup / 0.025) + 1,
  { coup: d2.r.max - d2.r.pv, etapes: gC });
const d3 = duel("fantassins", "champion", p => { p.vague = 3; });
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

console.log("\n" + ok + " réussis, " + ko + " en échec.");
process.exit(ko ? 1 : 0);
