// Validateur complet (Node) : contrôles 1 à 11 de docs/FORMAT_DONNEES.md, notes de suivi.js et personnages.js compris,
// et même numéro de version dans jeu/VERSION.txt et jeu/index.html.
// Usage : node atelier/outils/valider.js
// Sortie : lignes ERREUR et ALERTE ; code de sortie 1 s'il y a au moins une erreur.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { controler, sourceSuivi, estSourceTheme, estSourceProgramme } = require("./controles.js");
const { debrouiller } = require("./brouillage.js");

const RACINE = path.join(__dirname, "..", "..");
const DATA = path.join(RACINE, "jeu", "data");
const EXTRACTIONS = path.join(RACINE, "atelier", "extractions");

function chargerDonnees() {
  const d = { config: null, planning: null, devoirs: null, indexCours: null, aRetravailler: [], suivi: null, personnages: null, cours: {}, anglais: {}, erreursChargement: [] };
  function executer(fichier) {
    const ctx = {
      JEU: {
        enregistrer(type, obj) {
          switch (type) {
            case "config": d.config = obj; break;
            case "planning": d.planning = obj; break;
            case "devoirs": d.devoirs = obj; break;
            case "index-cours": d.indexCours = obj; break;
            case "a-retravailler": d.aRetravailler = obj; break;
            case "suivi": d.suivi = obj; break;
            case "cours": d.cours[obj.id] = obj; break;
            case "anglais": d.anglais[obj.id] = obj; break;
            case "personnages": d.personnages = obj; break;
            default: d.erreursChargement.push(path.relative(RACINE, fichier) + " : type inconnu " + type);
          }
        }
      }
    };
    try {
      vm.runInNewContext(fs.readFileSync(fichier, "utf8"), ctx, { filename: fichier });
    } catch (e) {
      d.erreursChargement.push(path.relative(RACINE, fichier) + " : " + e.message);
    }
  }
  ["config", "planning", "devoirs", "index-cours", "a-retravailler", "suivi"].forEach(n => {
    const f = path.join(DATA, n + ".js");
    if (fs.existsSync(f)) executer(f); else d.erreursChargement.push("jeu/data/" + n + ".js manquant");
  });
  // personnages de la campagne (facultatif : sans lui, un « seigneur rival » sans nom sur chaque front)
  const fp = path.join(DATA, "personnages.js");
  if (fs.existsSync(fp)) executer(fp); else d.personnagesAbsent = true;
  ["cours", "anglais"].forEach(dossier => {
    const rep = path.join(DATA, dossier);
    if (!fs.existsSync(rep)) return;
    fs.readdirSync(rep).filter(f => f.endsWith(".js")).forEach(f => executer(path.join(rep, f)));
  });
  return d;
}

// ---------- outils texte ----------
function motsDe(texte) {
  return String(texte).toLowerCase().replace(/[’']/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/).filter(Boolean);
}
function ngrammes(mots, n) {
  const s = new Set();
  for (let i = 0; i + n <= mots.length; i++) s.add(mots.slice(i, i + n).join(" "));
  return s;
}
function textesDe(obj, acc) {
  acc = acc || [];
  if (typeof obj === "string") acc.push(obj);
  else if (Array.isArray(obj)) obj.forEach(x => textesDe(x, acc));
  else if (obj && typeof obj === "object") {
    Object.keys(obj).forEach(k => { if (!["svg", "r", "id", "fiche", "source", "schema", "prerequis"].includes(k)) textesDe(obj[k], acc); });
  }
  return acc;
}
function nombresDe(texte) {
  return (String(texte).match(/\d+(?:[.,]\d+)?/g) || []).filter(x => x.replace(/\D/g, "").length >= 2);
}

function lireRegistre() {
  const f = path.join(RACINE, "atelier", "registre.json");
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return []; }
}

// Estimations de jeu/data/suivi.js : [[id du cours, estimation]], et celles qui portent une note.
function estimationsSuivi(d) {
  const c = d.suivi && d.suivi.cours;
  return c && typeof c === "object" ? Object.entries(c).filter(([, x]) => x && typeof x === "object") : [];
}
function notesSuivi(d) {
  return estimationsSuivi(d).filter(([, x]) => typeof x.note === "string" && x.note.trim()).map(([cid, x]) => [cid, x.note]);
}

// Nombres des cours d'un périmètre (extractions des cours inscrits au registre) : un nombre du cours n'est pas propre au devoir.
function nombresDesCours(registre, perimetre) {
  const texte = registre.filter(x => x.type === "cours" && (x.cours || []).some(c => perimetre.includes(c)) && x.extraction)
    .map(x => { try { return fs.readFileSync(path.join(EXTRACTIONS, x.extraction), "utf8"); } catch (e) { return ""; } }).join("\n");
  return new Set(nombresDe(texte));
}

// 8. anti-recopie : aucune suite de 12 mots identique entre les cours du jeu et les extractions.
function antiRecopie(d, E) {
  if (!fs.existsSync(EXTRACTIONS)) return;
  const sources = fs.readdirSync(EXTRACTIONS).filter(f => f.endsWith(".txt"));
  const grammes = new Map();
  sources.forEach(f => {
    ngrammes(motsDe(fs.readFileSync(path.join(EXTRACTIONS, f), "utf8")), 12).forEach(g => grammes.set(g, f));
  });
  const tous = Object.assign({}, d.cours, d.anglais);
  Object.keys(tous).forEach(cid => {
    textesDe(tous[cid]).forEach(t => {
      ngrammes(motsDe(t), 12).forEach(g => {
        if (grammes.has(g)) E("[8] suite de 12 mots recopiée de « " + grammes.get(g) + " » dans " + cid + " : « " + g + " »");
      });
    });
  });
  // personnages.js : faits et répliques reformulés, rien de recopié
  if (d.personnages) textesPersonnages(d).forEach(t => {
    const g = [...ngrammes(motsDe(t), 12)].find(x => grammes.has(x));
    if (g) E("[8] suite de 12 mots recopiée de « " + grammes.get(g) + " » dans personnages.js : « " + g + " »");
  });
  // notes de suivi.js : affichées à l'élève, elles ne recopient ni un livret ni un corrigé (une ligne par note suffit)
  notesSuivi(d).forEach(([cid, note]) => {
    const g = [...ngrammes(motsDe(note), 12)].find(x => grammes.has(x));
    if (g) E("[8] suite de 12 mots recopiée de « " + grammes.get(g) + " » dans la note de suivi de " + cid + " : « " + g + " »");
  });
}

// 9. anti-spoil : énoncés de devoirs inscrits au registre (type « enonce », cours = [id du devoir],
//    extraction = nom du fichier dans atelier/extractions).
function antiSpoil(d, E, A) {
  const registre = lireRegistre().filter(r => r.type === "enonce");
  registre.forEach(r => {
    const fx = path.join(EXTRACTIONS, r.extraction || "");
    if (!r.extraction || !fs.existsSync(fx)) { A("[9] extraction introuvable pour l'énoncé " + r.chemin); return; }
    const enonce = fs.readFileSync(fx, "utf8");
    const g8 = ngrammes(motsDe(enonce), 8);
    const nbEnonce = new Set(nombresDe(enonce));
    (r.cours || []).forEach(devoirId => {
      const dv = (d.devoirs || []).find(x => x.id === devoirId);
      if (!dv) { A("[9] devoir inconnu au registre : " + devoirId); return; }
      // textes des cours sources, pour distinguer un nombre du cours d'un nombre propre au devoir
      const nbCours = nombresDesCours(lireRegistre(), dv.perimetre);
      dv.perimetre.forEach(cid => {
        const c = d.cours[cid] || d.anglais[cid];
        if (!c) return;
        (c.questions || []).forEach(q => {
          const t = textesDe(q).join(" ") + " " + (() => { try { return debrouiller(q.r); } catch (e) { return ""; } })();
          ngrammes(motsDe(t), 8).forEach(g => { if (g8.has(g)) E("[9] " + q.id + " recoupe l'énoncé de " + devoirId + " : « " + g + " »"); });
          nombresDe(t).forEach(n => {
            if (nbEnonce.has(n) && !nbCours.has(n)) E("[9] " + q.id + " reprend le nombre " + n + " de l'énoncé de " + devoirId);
            else if (nbEnonce.has(n)) A("[9] " + q.id + " contient " + n + ", présent dans l'énoncé de " + devoirId + " et dans le cours");
          });
        });
      });
    });
  });
}

// 9 (suite). Notes de suivi.js : comparées à TOUS les énoncés et corrigés inscrits au registre (pas seulement
// au devoir source), pour qu'une note ne reprenne ni une tournure, ni un nombre, ni une réponse attendue d'un devoir.
function antiSpoilSuivi(d, E, A) {
  const notes = notesSuivi(d);
  if (!notes.length) return;
  const registre = lireRegistre();
  registre.filter(r => r.type === "enonce" || r.type === "corrige").forEach(r => {
    const genre = r.type === "enonce" ? "l'énoncé" : "le corrigé";
    const fx = path.join(EXTRACTIONS, r.extraction || "");
    if (!r.extraction || !fs.existsSync(fx)) { if (r.type === "corrige") A("[9] extraction introuvable pour le corrigé " + r.chemin); return; }
    const texte = fs.readFileSync(fx, "utf8");
    const g8 = ngrammes(motsDe(texte), 8);
    const nbDevoir = new Set(nombresDe(texte));
    const perimetre = [].concat(...(r.cours || []).map(id => ((d.devoirs || []).find(x => x.id === id) || {}).perimetre || []));
    const nbCours = nombresDesCours(registre, perimetre);
    const nom = (r.cours || []).join(", ") || r.chemin;
    notes.forEach(([cid, note]) => {
      const g = [...ngrammes(motsDe(note), 8)].find(x => g8.has(x));
      if (g) E("[9] la note de suivi de " + cid + " recoupe " + genre + " de " + nom + " : « " + g + " »");
      nombresDe(note).forEach(n => {
        if (nbDevoir.has(n) && !nbCours.has(n)) E("[9] la note de suivi de " + cid + " reprend le nombre " + n + " de " + genre + " de " + nom);
        else if (nbDevoir.has(n)) A("[9] la note de suivi de " + cid + " contient " + n + ", présent dans " + genre + " de " + nom + " et dans le cours");
      });
    });
  });
}

// Textes de personnages.js montrés à l'élève (noms, titres, faits, humeurs, répliques), sans les crédits des portraits.
function textesPersonnages(d) {
  const P = d.personnages || {}, t = [];
  (P.personnages || []).forEach(p => {
    if (!p) return;
    [p.nom, p.titre].forEach(x => { if (typeof x === "string") t.push(x); });
    (p.faits || []).forEach(f => { if (f && typeof f.texte === "string") t.push(f.texte); });
    Object.values(p.repliques || {}).forEach(l => (Array.isArray(l) ? l : []).forEach(x => { if (typeof x === "string") t.push(x); }));
  });
  Object.values(P.humeurs || {}).forEach(h => Object.values(h || {}).forEach(x => { if (typeof x === "string") t.push(x); }));
  Object.values(P.repliques || {}).forEach(c => Object.values(c || {}).forEach(l => (Array.isArray(l) ? l : []).forEach(x => { if (x && typeof x.texte === "string") t.push(x.texte); })));
  (P.changement || []).forEach(x => { if (typeof x === "string") t.push(x); });
  return t;
}

// 9 (suite). personnages.js : ni tournure (8 mots) ni nombre propre à un devoir (énoncés et corrigés du registre).
function antiSpoilPersonnages(d, E, A) {
  if (!d.personnages) return;
  const textes = textesPersonnages(d);
  const registre = lireRegistre();
  registre.filter(r => r.type === "enonce" || r.type === "corrige").forEach(r => {
    const fx = path.join(EXTRACTIONS, r.extraction || "");
    if (!r.extraction || !fs.existsSync(fx)) return;
    const texte = fs.readFileSync(fx, "utf8");
    const g8 = ngrammes(motsDe(texte), 8), nbDevoir = new Set(nombresDe(texte));
    const perimetre = [].concat(...(r.cours || []).map(id => ((d.devoirs || []).find(x => x.id === id) || {}).perimetre || []));
    const nbCours = nombresDesCours(registre, perimetre);
    const nom = (r.cours || []).join(", ") || r.chemin;
    textes.forEach(t => {
      const g = [...ngrammes(motsDe(t), 8)].find(x => g8.has(x));
      if (g) E("[9] personnages.js recoupe le devoir " + nom + " : « " + g + " »");
      nombresDe(t).forEach(n => { if (nbDevoir.has(n) && !nbCours.has(n)) E("[9] personnages.js reprend le nombre " + n + " du devoir " + nom); });
    });
  });
}

// 10 (suite). personnages.js : chaque source existe dans DEPOT/, chaque portrait dans jeu/ (120 Ko au plus, sinon
// ALERTE), avec sa ligne de crédit dans jeu/CREDITS.md (nom du fichier et adresse de l'œuvre).
function fichiersPersonnages(d, E, A) {
  if (d.personnagesAbsent) { A("[10] jeu/data/personnages.js absent : pas de souverain, et un « seigneur rival » sans nom sur chaque front"); return; }
  if (!d.personnages || !Array.isArray(d.personnages.personnages)) return;
  let credits = "";
  try { credits = fs.readFileSync(path.join(RACINE, "jeu", "CREDITS.md"), "utf8"); } catch (e) { E("[10] jeu/CREDITS.md illisible"); }
  d.personnages.personnages.forEach(p => {
    if (!p) return;
    const ou = "personnage " + p.id;
    [p.source].concat((p.faits || []).map(f => f && f.source)).forEach(src => {
      if (src && typeof src.fichier === "string" && !fs.existsSync(path.join(RACINE, "DEPOT", src.fichier))) E("[10] " + ou + " : source introuvable dans DEPOT/ (" + src.fichier + ")");
    });
    const r = p.portrait;
    if (r && typeof r.fichier === "string") {
      const f = path.join(RACINE, "jeu", r.fichier);
      if (!fs.existsSync(f)) E("[10] " + ou + " : portrait introuvable (jeu/" + r.fichier + ")");
      else if (fs.statSync(f).size > 120 * 1024) A("[10] " + ou + " : portrait de plus de 120 Ko (" + Math.round(fs.statSync(f).size / 1024) + " Ko)");
      if (credits && (!credits.includes(path.basename(r.fichier)) || (r.url && !credits.includes(r.url)))) E("[10] " + ou + " : crédit absent de jeu/CREDITS.md (fichier " + path.basename(r.fichier) + " et adresse " + r.url + ")");
    }
  });
}

// 7 (suite). Une estimation de suivi.js dont la source est un fichier : il doit avoir été déposé (chemin relatif à DEPOT/).
function sourcesSuivi(d, E) {
  estimationsSuivi(d).forEach(([cid, x]) => {
    if (sourceSuivi(x.source, d.devoirs) === "fichier" && !fs.existsSync(path.join(RACINE, "DEPOT", x.source))) {
      E("[7] suivi : fichier source introuvable dans DEPOT/ pour " + cid + " (" + x.source + ")");
    }
  });
}

// 5 (suite). Le contenu d'un cours vient des fichiers déposés : chaque source citée (fiche, question, schéma)
// doit exister dans DEPOT/. ALERTE seulement : le cours reste jouable, mais Romain doit déposer le fichier.
// Une source de thème ({ theme, titre, editeur, url }, contrôle 11) ou de programme ({ programme, titre, editeur, url },
// fiche de programme du 28/10/2026) n'est pas un fichier déposé : rien à chercher.
function sourcesDeposees(d, A) {
  const tous = Object.assign({}, d.cours, d.anglais);
  Object.keys(tous).sort().forEach(cid => {
    const c = tous[cid], manquants = {};
    ["fiches", "questions", "schemas", "vocabulaire", "structures", "phrases"].forEach(k => (c[k] || []).forEach(x => {
      const f = x && x.source && !estSourceTheme(x.source) && !estSourceProgramme(x.source) && x.source.fichier;
      if (f && !fs.existsSync(path.join(RACINE, "DEPOT", f))) manquants[f] = (manquants[f] || 0) + 1;
    }));
    Object.keys(manquants).forEach(f => A("[5] source absente de DEPOT/ : " + f + " (citée " + manquants[f] + " fois dans " + cid + ")"));
  });
}

// Le numéro de jeu/VERSION.txt et celui que le jeu affiche (JEU.version dans jeu/index.html) sont les mêmes.
function versionsAlignees(E) {
  let v = "", html = "";
  try { v = fs.readFileSync(path.join(RACINE, "jeu", "VERSION.txt"), "utf8").trim(); } catch (e) { /* signalé plus bas */ }
  try { html = fs.readFileSync(path.join(RACINE, "jeu", "index.html"), "utf8"); } catch (e) { /* signalé plus bas */ }
  const m = /JEU\.version\s*=\s*"([^"]*)"/.exec(html);
  if (!v) E("[1] jeu/VERSION.txt absent ou vide");
  else if (!m) E("[1] JEU.version introuvable dans jeu/index.html");
  else if (m[1] !== v) E("[1] jeu/VERSION.txt (" + v + ") et JEU.version de jeu/index.html (" + m[1] + ") diffèrent : mets le même numéro aux deux endroits");
}

function brouillageIdentique(E) {
  const a = path.join(RACINE, "jeu", "js", "brouillage.js"), b = path.join(RACINE, "atelier", "outils", "brouillage.js");
  if (!fs.existsSync(a) || !fs.existsSync(b) || fs.readFileSync(a, "utf8") !== fs.readFileSync(b, "utf8")) {
    E("[4] jeu/js/brouillage.js et atelier/outils/brouillage.js doivent être identiques");
  }
}

function valider() {
  const d = chargerDonnees();
  const res = controler(d, debrouiller);
  const E = m => res.erreurs.push(m), A = m => res.alertes.push(m);
  brouillageIdentique(E);
  versionsAlignees(E);
  sourcesSuivi(d, E);
  sourcesDeposees(d, A);
  antiRecopie(d, E);
  antiSpoil(d, E, A);
  antiSpoilSuivi(d, E, A);
  antiSpoilPersonnages(d, E, A);
  fichiersPersonnages(d, E, A);
  return { res, d };
}

if (require.main === module) {
  const { res, d } = valider();
  res.erreurs.forEach(m => console.log("ERREUR " + m));
  res.alertes.forEach(m => console.log("ALERTE " + m));
  const nbQ = Object.values(d.cours).reduce((s, c) => s + (c.questions || []).length, 0);
  const nbF = Object.values(d.cours).reduce((s, c) => s + (c.fiches || []).length, 0);
  console.log("Bilan : " + res.erreurs.length + " erreur(s), " + res.alertes.length + " alerte(s) · " +
    Object.keys(d.cours).length + " cours, " + nbF + " fiches, " + nbQ + " questions · planning " + (d.planning || []).length + " entrées, " + (d.devoirs || []).length + " devoirs.");
  process.exit(res.erreurs.length ? 1 : 0);
}
module.exports = { valider, chargerDonnees, sourcesDeposees, motsDe, ngrammes, textesPersonnages };
