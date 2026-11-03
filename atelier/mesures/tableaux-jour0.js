// Tableaux Markdown à partir des mesures du jour 0 (atelier/mesures/jour0/*.json), pour expeditions-mesures.md.
// Usage : node atelier/mesures/tableaux-jour0.js <mesure> [<mesure>…] [--champs tenue,eclatante,degats,murs] [--p 0.6,0.7,0.8,0.9]
//   Une ligne par niveau, une colonne par p et par champ. Avec plusieurs mesures, un tableau par mesure.
//   --compare a,b : un seul tableau, champ « tenue » (ou --champ x) de chaque mesure côte à côte, par niveau et par p.
"use strict";
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
function option(nom, defaut) { const i = args.indexOf("--" + nom); return i >= 0 ? args[i + 1] : defaut; }
const DOSSIER = path.join(__dirname, "jour0");
const PS = option("p", "0.6,0.7,0.8,0.9").split(",");
const CHAMPS = option("champs", "tenue,eclatante,degats,murs").split(",");
const NOMS = { tenue: "tenue", eclatante: "éclatante", degats: "coups", murs: "murs", mursTenue: "murs (tenue)", vague1: "coups 1re vague", retraite: "retraite", tues: "tués", pertes: "pertes" };
const POURCENT = { tenue: 1, eclatante: 1, murs: 1, mursTenue: 1, retraite: 1 };
function lireJSON(f) { const o = fs.readFileSync(f); return JSON.parse(o[0] === 0xFF && o[1] === 0xFE ? o.toString("utf16le", 2) : o.toString("utf8").replace(/^﻿/, "")); }
const charger = nom => lireJSON(path.join(DOSSIER, nom + ".json"));
const fmt = (l, k) => (l && l[k] != null ? (POURCENT[k] ? l[k] + " %" : String(l[k]).replace(".", ",")) : "—");
const mesures = args.filter((a, i) => a.indexOf("--") !== 0 && (i === 0 || args[i - 1].indexOf("--") !== 0));
if (option("compare", null)) {
  const noms = option("compare").split(","), champ = option("champ", "tenue");
  const js = noms.map(charger), niveaux = js[0].resultats[PS[0]].map(l => l.niveau);
  console.log("| niveau | " + PS.map(p => noms.map(n => "p " + p.replace(".", ",") + " · " + n).join(" | ")).join(" | ") + " |");
  console.log("|---|" + PS.map(() => noms.map(() => "---").join("|")).join("|") + "|");
  niveaux.forEach(n => console.log("| " + n + " | " + PS.map(p => js.map(j => fmt((j.resultats[p] || []).find(l => l.niveau === n), champ)).join(" | ")).join(" | ") + " |"));
  process.exit(0);
}
mesures.forEach(nom => {
  const j = charger(nom), r = j.route;
  console.log("\n" + nom + " : " + r.mode + ", " + r.vagues + " vague(s), camp de " + r.pvRival + ", carte " + (r.carte || (r.mode === "defense" ? "domaine" : "des provinces du niveau")) + (r.arsenal != null ? ", arsenal " + r.arsenal : "") + (r.sansChampion ? ", sans champion" : "") + ", " + j.graines + " graines");
  console.log("| niveau | " + PS.map(p => "p " + p.replace(".", ",") + " : " + CHAMPS.map(c => NOMS[c] || c).join(" / ")).join(" | ") + " |");
  console.log("|---|" + PS.map(() => "---").join("|") + "|");
  const niveaux = j.resultats[PS[0]].map(l => l.niveau);
  niveaux.forEach(n => console.log("| " + n + " | " + PS.map(p => { const l = (j.resultats[p] || []).find(x => x.niveau === n); return CHAMPS.map(c => fmt(l, c)).join(" / "); }).join(" | ") + " |"));
});
