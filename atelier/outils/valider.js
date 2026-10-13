// Validateur complet (Node) : contrôles 1 à 9 de docs/FORMAT_DONNEES.md.
// Usage : node atelier/outils/valider.js
// Sortie : lignes ERREUR et ALERTE ; code de sortie 1 s'il y a au moins une erreur.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { controler } = require("./controles.js");
const { debrouiller } = require("./brouillage.js");

const RACINE = path.join(__dirname, "..", "..");
const DATA = path.join(RACINE, "jeu", "data");
const EXTRACTIONS = path.join(RACINE, "atelier", "extractions");

function chargerDonnees() {
  const d = { config: null, planning: null, devoirs: null, indexCours: null, aRetravailler: [], cours: {}, anglais: {}, erreursChargement: [] };
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
            case "cours": d.cours[obj.id] = obj; break;
            case "anglais": d.anglais[obj.id] = obj; break;
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
  ["config", "planning", "devoirs", "index-cours", "a-retravailler"].forEach(n => {
    const f = path.join(DATA, n + ".js");
    if (fs.existsSync(f)) executer(f); else d.erreursChargement.push("jeu/data/" + n + ".js manquant");
  });
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
      const coursTexte = lireRegistre().filter(x => x.type === "cours" && (x.cours || []).some(c => dv.perimetre.includes(c)) && x.extraction)
        .map(x => { try { return fs.readFileSync(path.join(EXTRACTIONS, x.extraction), "utf8"); } catch (e) { return ""; } }).join("\n");
      const nbCours = new Set(nombresDe(coursTexte));
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
  antiRecopie(d, E);
  antiSpoil(d, E, A);
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
module.exports = { valider, chargerDonnees, motsDe, ngrammes };
