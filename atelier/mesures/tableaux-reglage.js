// Tableaux Markdown des mesures du réglage du MVP des expéditions (atelier/mesures/reglage-mvp/*.json, écrits par
// atelier/outils/simuler-bataille.js --expedition --sortie). Rien de ce dossier n'entre dans jeu/.
// Usage : node atelier/mesures/tableaux-reglage.js [préfixe…] [--p 0.6,0.7,0.9] [--champ tenue|eclatante|murs|degats]
//   Sans préfixe : tous les essais du dossier. Un préfixe (base, diff+1, grand4v…) regroupe les fichiers « préfixe-sN.json ».
//   Une ligne par semaine et nœud, une colonne par justesse : tenue (éclatante).
"use strict";
const fs = require("fs");
const path = require("path");
const DOSSIER = path.join(__dirname, "reglage-mvp");
const args = process.argv.slice(2);
function option(nom, defaut) { const i = args.indexOf("--" + nom); return i >= 0 ? args[i + 1] : defaut; }
const PS = option("p", "0.6,0.7,0.9").split(",");
const CHAMP = option("champ", "tenue");
const prefixes = args.filter((a, i) => !/^--/.test(a) && !/^--/.test(args[i - 1] || ""));
const fichiers = fs.readdirSync(DOSSIER).filter(f => /-s\d+\.json$/.test(f)).sort();
const groupes = {};
fichiers.forEach(f => { const m = /^(.*)-s(\d+)\.json$/.exec(f); if (!prefixes.length || prefixes.indexOf(m[1]) >= 0) (groupes[m[1]] = groupes[m[1]] || []).push({ semaine: +m[2], f: path.join(DOSSIER, f) }); });
const NOMS = { escarmouche: "escarmouche", embuscade: "embuscade", gardien: "gardien", grand: "Grand Gardien" };
Object.keys(groupes).sort().forEach(g => {
  const lignes = [];
  let desc = "";
  groupes[g].sort((a, b) => a.semaine - b.semaine).forEach(x => {
    const e = JSON.parse(fs.readFileSync(x.f, "utf8"));
    desc = e.expedition.haltes + " · lignes " + e.expedition.ligneSemaine + " · difficulté " + e.expedition.difficulte + (e.expedition.essai ? " · essai « " + e.expedition.essai + " »" : "") + " · " + 2 * e.graines + " batailles par case";
    const premiere = e.resultats[PS.find(p => e.resultats[p])] || [];
    premiere.forEach(l => {
      const cellule = p => { const r = (e.resultats[p] || []).find(y => y.semaine === l.semaine && y.noeud === l.noeud); if (!r) return "—"; return CHAMP === "tenue" ? r.tenue + " % (" + r.eclatante + " %)" : CHAMP === "murs" ? r.murs + " % (" + r.mursTenue + " %)" : String(r[CHAMP]); };
      lignes.push("| S" + l.semaine + " | " + NOMS[l.noeud] + " | " + l.carte + " | " + l.niveau + " / " + l.arsenal + " | " + l.vagues + " / " + l.place + " | " + PS.map(cellule).join(" | ") + " |");
    });
  });
  console.log("\n### " + g + "\n\n" + desc + "\n");
  console.log("| Semaine | Nœud | Carte | Ligne du rival / arsenal | Vagues / camp | " + PS.map(p => "p " + p.replace(".", ",") + " : " + (CHAMP === "tenue" ? "tenue (éclatante)" : CHAMP === "murs" ? "murs (quand elle tient)" : CHAMP)).join(" | ") + " |");
  console.log("|---|---|---|---|---|" + PS.map(() => "---").join("|") + "|");
  lignes.forEach(l => console.log(l));
});
