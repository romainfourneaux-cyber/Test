// Liste, pour une matière ou un cours, toutes les questions avec leur contexte : thème du cours (titre du planning), fiche
// (notion, titre, page), type, niveau, source, énoncé, choix et réponse en clair. Un bloc par question, pour relire vite
// (audit des questions bizarres, fiche de relecture). Lit les sources en clair de atelier/contenu/ (réponses non brouillées)
// et jeu/data/planning.js (titres des cours). Ne modifie rien.
// Usage : node atelier/outils/lister-questions.js <préfixe> [--theme] [--suspects] > fichier.txt
//   préfixe   : histoire, geographie, svt, physique, litterature, lecture, langue, anglais, methode,
//               ou un identifiant de cours (histoire-s01-1), ou « tout ».
//   --theme   : seulement les questions de thème (source { theme, titre, editeur, url }, règle du 25/10/2026).
//   --suspects : seulement les questions dont l'énoncé, les choix ou la forme ressemblent à une catégorie de la grille
//               (atelier/relecture/grille-audit-questions.md), avec la catégorie repérée. C'est un filet, pas un verdict :
//               l'auditeur tranche en lisant.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RACINE = path.join(__dirname, "..", "..");
const SOURCES = path.join(RACINE, "atelier", "contenu");

function lirePlanning() {
  const parId = {};
  const ctx = { JEU: { enregistrer(type, obj) { if (type === "planning") obj.forEach(e => { parId[e.id] = e; }); } } };
  try { vm.runInNewContext(fs.readFileSync(path.join(RACINE, "jeu", "data", "planning.js"), "utf8"), ctx); } catch (e) { /* sans planning : titres des fichiers */ }
  return parId;
}

function estTheme(src) { return !!(src && typeof src === "object" && src.theme !== undefined); }

function texteSource(src) {
  if (!src) return "(aucune)";
  if (estTheme(src)) return "THÈME « " + src.theme + " » · " + [src.titre, src.editeur].filter(Boolean).join(", ") + (src.url ? " · " + src.url : "");
  return String(src.fichier || "?").replace(/^.*\//, "") + (src.page ? ", p. " + src.page : "");
}

// fiches d'un cours : id -> { notion, titre, page } (une séquence d'anglais a des mots, des règles et des phrases)
function fichesDe(c) {
  const f = {};
  (c.fiches || []).forEach(x => { f[x.id] = { notion: x.notion, titre: x.titre, source: x.source }; });
  (c.vocabulaire || []).forEach(x => { f[x.id] = { notion: x.en + " : " + x.fr, titre: "mot de vocabulaire", source: x.source }; });
  (c.structures || []).forEach(x => { f[x.id] = { notion: x.regle, titre: "règle", source: x.source }; });
  (c.phrases || []).forEach(x => { f[x.id] = { notion: x.en + " : " + x.fr, titre: "phrase", source: x.source }; });
  return f;
}

const LETTRES = "ABCDEFGH";
function lignesReponse(q) {
  const l = [], r = q.reponse;
  switch (q.type) {
    case "qcm":
      l.push("choix : " + (q.choix || []).map((c, i) => LETTRES[i] + ") " + c).join("  |  "));
      l.push("réponse : " + r);
      break;
    case "qcm_multiple":
      l.push("choix : " + (q.choix || []).map((c, i) => LETTRES[i] + ") " + c).join("  |  "));
      l.push("réponses : " + (Array.isArray(r) ? r.join("  |  ") : r));
      break;
    case "vrai_faux":
      if (q.corrections && q.corrections.length) l.push("corrections proposées : " + q.corrections.join("  |  "));
      l.push("réponse : " + (r && r.vrai ? "VRAI" : "FAUX" + (r && r.correction ? " → " + r.correction : "")));
      break;
    case "association":
      l.push("gauche : " + (q.gauche || []).join("  |  "));
      l.push("droite : " + (q.droite || []).join("  |  "));
      l.push("paires : " + (Array.isArray(r) ? r.map(p => (q.gauche || [])[p[0]] + " → " + (q.droite || [])[p[1]]).join("  ;  ") : r));
      break;
    case "ordre":
      l.push("éléments : " + (q.elements || []).join("  |  "));
      l.push("ordre juste : " + (Array.isArray(r) ? r.map(i => (q.elements || [])[i]).join("  <  ") : r));
      break;
    case "trou":
      l.push("texte : " + (q.texte || ""));
      if (q.banque) l.push("banque : " + q.banque.join("  |  "));
      l.push("mots attendus : " + (Array.isArray(r) ? r.map(x => Array.isArray(x) ? x.join(" / ") : x).join("  ;  ") : r));
      break;
    default:
      l.push("données : " + JSON.stringify({ schema: q.schema, etiquettes: q.etiquettes, consigne: q.consigne, etapes: q.etapes }));
      l.push("réponse : " + JSON.stringify(r));
  }
  return l;
}

// ---------- filet des questions suspectes (catégories de la grille) ----------
const RX_SUSPECTS = [
  ["document", /\b(le document|ce document|du document|le texte|ce texte|du texte|ce passage|cet extrait|l'extrait|dans l'extrait|cette carte|la carte|ce graphique|le graphique|ce tableau|le tableau|cette photo|la photo|ce schéma|le schéma|cette image|l'image|le dessin|décrit par|décrite par|selon le corrigé|le corrigé|l'auteur du texte|le narrateur du texte|la légende)\b/i],
  ["experience", /\b(l'expérience|de l'expérience|dans la première partie|dans la deuxième partie|dans la seconde partie|on chauffe|on verse|on observe|on place|la manipulation)\b/i],
  ["arithmetique", /\b(combien d'années|combien de siècles|combien de temps|pendant combien|quel âge|quelle durée|dure combien|écart entre)\b/i],
  ["trivia", /\b(au maximum|au minimum|jusqu'à \d|\d+ ?(cm|mm|kg|g|km\/h|km|mètres?|centimètres?|kilos?|kilomètres?|tonnes?)\b)/i],
  ["distracteurs", /\b(exactement \d|le temps s'arrête|un type de nuage|rien du tout|n'importe quoi|par magie|magique|aucune idée|jamais rien|des bonbons)\b/i],
  ["consigne", /\b(respecter|souligne[rz]?|surligne[rz]?|recopie[rz]?|rédige[rz]?|nombre de lignes|la consigne|exercice \d|réponds en|répondre en|en une phrase|en quelques lignes)\b/i],
  ["comparaison", /\b(plus (petit|grand|long|court|vieux|récent|ancien|gros|vaste) qu|moins (petit|grand|long|court|vaste) qu)/i],
  ["lecture-spoil", /\b(meurt|mort|tué|tue|à la fin du livre|à la fin de l'histoire|finalement|au dernier chapitre|chapitre \d+|page \d+)\b/i],
  ["lecture-zoologie", /\b(taille|poids|pèse|pèsent|mesure|espèce|mammifère|se nourrit|se nourrissent|longueur|envergure|plumage|fourrure)\b/i]
];
function motsNorm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter(Boolean); }
function suspects(q, cid, autres) {
  const trouve = [];
  const corps = [q.enonce, q.texte].concat(q.choix || [], q.corrections || [], q.gauche || [], q.droite || [], q.elements || []).filter(Boolean).join(" \n ");
  RX_SUSPECTS.forEach(([cat, rx]) => {
    if (/^lecture-/.test(cat) && !/^lecture-/.test(cid)) return;
    if (cat === "distracteurs") { if ((q.choix || []).concat(q.corrections || []).some(c => rx.test(c))) trouve.push(cat); return; }
    if (rx.test(corps)) trouve.push(cat);
  });
  if (q.type === "trou" && motsNorm(String(q.texte || "").replace(/_+/g, " ")).length < 6) trouve.push("trou-sans-contexte");
  // quasi-doublon : même début d'énoncé (6 mots) ou vocabulaire commun à 80 % avec une autre question du cours
  const m = motsNorm(q.enonce + " " + (q.texte || "")), s = new Set(m);
  autres.forEach(a => {
    if (a.id === q.id) return;
    const ma = motsNorm(a.enonce + " " + (a.texte || ""));
    const sa = new Set(ma); let commun = 0; sa.forEach(x => { if (s.has(x)) commun++; });
    const jaccard = commun / (new Set([...s, ...sa]).size || 1);
    if ((m.length >= 6 && m.slice(0, 6).join(" ") === ma.slice(0, 6).join(" ")) || jaccard >= 0.8) trouve.push("doublon(" + a.id + ")");
  });
  return trouve;
}

// ---------- programme ----------
const args = process.argv.slice(2);
const prefixe = args.find(a => !a.startsWith("--"));
const seulementTheme = args.includes("--theme"), seulementSuspects = args.includes("--suspects");
if (!prefixe) {
  console.error("Usage : node atelier/outils/lister-questions.js <préfixe> [--theme] [--suspects]   (préfixe : histoire, geographie, svt, physique, litterature, lecture, langue, anglais, methode, un identifiant de cours, ou tout)");
  process.exit(2);
}
const planning = lirePlanning();
const fichiers = fs.readdirSync(SOURCES).filter(f => f.endsWith(".js")).map(f => f.replace(/\.js$/, ""))
  .filter(id => prefixe === "tout" || id === prefixe || id.startsWith(prefixe + "-")).sort();
if (!fichiers.length) { console.error("Aucun cours dans atelier/contenu/ pour « " + prefixe + " »."); process.exit(2); }

const bilan = []; let total = 0, totalTheme = 0, listees = 0;
fichiers.forEach(id => {
  const c = require(path.join(SOURCES, id + ".js"));
  const p = planning[id];
  const theme = p ? p.titre + " (S" + p.semaine + ", " + p.matiere + ")" : (c.titre || id) + (c.badge ? " (Griffon de " + c.badge + ")" : "");
  const fiches = fichesDe(c);
  const qs = c.questions || [];
  const nbTheme = qs.filter(q => estTheme(q.source)).length;
  total += qs.length; totalTheme += nbTheme;
  bilan.push({ id, questions: qs.length, theme: nbTheme, fiches: Object.keys(fiches).length, nonCouvert: (c.nonCouvert || []).length });
  let enTete = false;
  qs.forEach(q => {
    if (seulementTheme && !estTheme(q.source)) return;
    const susp = seulementSuspects ? suspects(q, id, qs) : [];
    if (seulementSuspects && !susp.length) return;
    if (!enTete) {
      enTete = true;
      console.log("\n######## " + id + " · " + theme + " · " + qs.length + " questions (" + nbTheme + " de thème), " + Object.keys(fiches).length + " fiches" +
        ((c.nonCouvert || []).length ? " · non couvert : " + c.nonCouvert.join(" ; ") : ""));
    }
    const f = fiches[q.fiche] || { notion: "(fiche inconnue)", titre: "", source: null };
    listees++;
    console.log("\n=== " + q.id + " · " + q.type + " · niveau " + (q.niveau == null ? "?" : q.niveau) + (estTheme(q.source) ? " · QUESTION DE THÈME" : ""));
    console.log("thème : " + theme);
    console.log("fiche : " + q.fiche + " · " + (f.notion || "") + (f.titre ? " · « " + f.titre + " »" : "") + (f.source && f.source.page ? " (p. " + f.source.page + ")" : ""));
    console.log("source : " + texteSource(q.source));
    if (susp.length) console.log("suspect : " + susp.join(", "));
    console.log("Q : " + (q.enonce || ""));
    lignesReponse(q).forEach(l => console.log(l));
    if (q.explication) console.log("explication : " + q.explication);
    if (q.indice) console.log("indice : " + q.indice);
  });
});
console.log("\n######## Bilan : " + fichiers.length + " cours, " + total + " questions (" + totalTheme + " de thème), " + listees + " listées" +
  (seulementTheme ? " (filtre --theme)" : "") + (seulementSuspects ? " (filtre --suspects)" : "") + ".");
bilan.forEach(b => console.log("  " + b.id + " : " + b.questions + " questions, " + b.theme + " de thème (" + (b.questions ? Math.round(100 * b.theme / b.questions) : 0) + " %), " + b.fiches + " fiches, " + b.nonCouvert + " points non couverts"));
