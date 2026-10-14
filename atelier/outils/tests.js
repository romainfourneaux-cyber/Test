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
// un fichier qui n'est pas une sauvegarde est refusé, et la partie en cours ne bouge pas
const refuse = t => { try { J.sauvegarde.importer(t); return false; } catch (e) { return true; } };
const avantImport = JSON.stringify(J.sauvegarde.etat());
verifier("Import d'un fichier étranger refusé, partie intacte", refuse('{"name":"mon-projet","version":"1.0.0"}') && refuse("[]") && refuse("pas du JSON") && JSON.stringify(J.sauvegarde.etat()) === avantImport);

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
verifier("Validateur : une estimation correcte de suivi.js passe", suiviBon.erreurs.length === 0 && suiviBon.alertes.length === 0, suiviBon);
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

// une séquence d'anglais « à revoir » met ses éléments en priorité
J.donnees.anglais["anglais-essai"] = { id: "anglais-essai", ordre: 99, matiere: "anglais", vocabulaire: [{ id: "ang-v1" }], structures: [{ id: "ang-s1" }], phrases: [{ id: "ang-p1" }] };
J.donnees.suivi = { cours: { "anglais-essai": { etat: "a-revoir" } } };
J.progression.oublier();
const far = J.progression.fichesARevoir();
verifier("Une séquence d'anglais à revoir met ses éléments en priorité", ["ang-v1", "ang-s1", "ang-p1"].every(x => far.indexOf(x) >= 0), far);
delete J.donnees.anglais["anglais-essai"]; J.donnees.suivi = { cours: {} }; J.progression.oublier();

console.log("\n" + ok + " réussis, " + ko + " en échec.");
process.exit(ko ? 1 : 0);
