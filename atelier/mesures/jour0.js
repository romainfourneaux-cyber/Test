// Jour 0 des expéditions (atelier/conception/expeditions.md, 16.1) : rejoue toutes les mesures des batailles de route avec
// atelier/outils/simuler-bataille.js et range les résultats dans atelier/mesures/jour0/ (un .txt lisible et un .json par
// mesure). Rien de ce dossier n'entre dans jeu/. Lecture des résultats : atelier/conception/expeditions-mesures.md.
// Usage : node atelier/mesures/jour0.js [--paralleles 3] [--graines 80] [--seulement esc-1v6,gard-2v12-gue]
//   (environ 10 minutes avec 3 processus en parallèle ; --seulement ne rejoue que les mesures nommées, ou celles dont le
//   nom commence ainsi). Puis : node atelier/mesures/convolution-expedition.js (réussite d'une expédition entière).
"use strict";
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const RACINE = path.join(__dirname, "..", "..");
const SIM = path.join(RACINE, "atelier", "outils", "simuler-bataille.js");
const DOSSIER = path.join(__dirname, "jour0");
const args = process.argv.slice(2);
function option(nom, defaut) { const i = args.indexOf("--" + nom); return i >= 0 ? args[i + 1] : defaut; }
const PARALLELES = Math.max(1, parseInt(option("paralleles", "3"), 10));
const GRAINES = option("graines", "80");
const SEULEMENT = option("seulement", null) ? option("seulement").split(",") : null;

// Les cartes de la route tournent avec la semaine : gue (S1, S6), foret (S2, S7), moulin (S3, S8), col (S4, S9), chateau (S5, S10).
const CARTES = ["gue", "foret", "moulin", "col", "chateau"];
const TOUS = "0,1,2,3,4", SANS_ZERO = "1,2,3,4";
const mesures = [];
function ajouter(nom, opts, niveaux) { mesures.push({ nom: nom, opts: opts, niveaux: niveaux || TOUS }); }

// Escarmouche : attaque, 1 vague et camp de 6 (table 7.2), variante 2 vagues et camp de 8 ; avec et sans le champion.
ajouter("esc-1v6", ["--vagues", "1", "--pvRival", "6", "--mode", "attaque"]);
ajouter("esc-1v6-sans-champion", ["--vagues", "1", "--pvRival", "6", "--mode", "attaque", "--sansChampion"]);
ajouter("esc-2v8", ["--vagues", "2", "--pvRival", "8", "--mode", "attaque"]);
ajouter("esc-2v8-sans-champion", ["--vagues", "2", "--pvRival", "8", "--mode", "attaque", "--sansChampion"]);
CARTES.forEach(c => ajouter("esc-1v6-" + c, ["--vagues", "1", "--pvRival", "6", "--mode", "attaque", "--carte", c]));
["gue", "foret", "moulin"].forEach(c => {
  ajouter("esc-1v6-" + c + "-sans-champion", ["--vagues", "1", "--pvRival", "6", "--mode", "attaque", "--carte", c, "--sansChampion"]);
  ajouter("esc-2v8-" + c, ["--vagues", "2", "--pvRival", "8", "--mode", "attaque", "--carte", c]);
});
// Solidités voisines de l'escarmouche (levier), sur la carte par défaut.
[4, 5, 8].forEach(pv => ajouter("esc-1v" + pv, ["--vagues", "1", "--pvRival", String(pv), "--mode", "attaque"]));
// Embuscade : défense, 2 vagues, camp de 10, ligne de la semaine + 1 (donc arsenal du niveau − 1 pour la convolution).
ajouter("emb-2v10-domaine", ["--vagues", "2", "--pvRival", "10", "--mode", "defense"]);
CARTES.forEach(c => ajouter("emb-2v10-" + c, ["--vagues", "2", "--pvRival", "10", "--mode", "defense", "--carte", c]));
["gue", "foret", "moulin"].forEach(c => ajouter("emb-2v10-" + c + "-arsenal-1", ["--vagues", "2", "--pvRival", "10", "--mode", "defense", "--carte", c, "--arsenal", "-1"], SANS_ZERO));
[8, 12].forEach(pv => ajouter("emb-2v" + pv + "-gue-arsenal-1", ["--vagues", "2", "--pvRival", String(pv), "--mode", "defense", "--carte", "gue", "--arsenal", "-1"], SANS_ZERO));
// Gardien : défense, 2 vagues, camp de 12, ligne de la semaine.
ajouter("gard-2v12-domaine", ["--vagues", "2", "--pvRival", "12", "--mode", "defense"]);
CARTES.forEach(c => ajouter("gard-2v12-" + c, ["--vagues", "2", "--pvRival", "12", "--mode", "defense", "--carte", c]));
[10, 14, 16].forEach(pv => ajouter("gard-2v" + pv + "-gue", ["--vagues", "2", "--pvRival", String(pv), "--mode", "defense", "--carte", "gue"]));
// Grand Gardien : défense, 3 vagues, camp de 16, ligne + 1 (plafond 4), sur la carte de la prochaine province (gue au début).
ajouter("grand-3v16-domaine", ["--vagues", "3", "--pvRival", "16", "--mode", "defense"], SANS_ZERO);
ajouter("grand-3v16-gue", ["--vagues", "3", "--pvRival", "16", "--mode", "defense", "--carte", "gue"], SANS_ZERO);
["gue", "foret", "moulin"].forEach(c => ajouter("grand-3v16-" + c + "-arsenal-1", ["--vagues", "3", "--pvRival", "16", "--mode", "defense", "--carte", c, "--arsenal", "-1"], SANS_ZERO));
[12, 14, 20].forEach(pv => ajouter("grand-3v" + pv + "-gue-arsenal-1", ["--vagues", "3", "--pvRival", String(pv), "--mode", "defense", "--carte", "gue", "--arsenal", "-1"], SANS_ZERO));

const aFaire = mesures.filter(m => !SEULEMENT || SEULEMENT.some(s => m.nom === s || m.nom.indexOf(s) === 0));
if (!aFaire.length) { console.error("Aucune mesure ne correspond à --seulement"); process.exit(1); }
if (!fs.existsSync(DOSSIER)) fs.mkdirSync(DOSSIER);
const t0 = Date.now();
let enCours = 0, index = 0, erreurs = 0;
function suivant() {
  while (enCours < PARALLELES && index < aFaire.length) {
    const m = aFaire[index++];
    const argv = [SIM, "--graines", GRAINES, "--niveaux", m.niveaux, "--sortie", path.join(DOSSIER, m.nom + ".json")].concat(m.opts);
    const debut = Date.now();
    enCours++;
    const sortie = fs.openSync(path.join(DOSSIER, m.nom + ".txt"), "w");
    const ps = spawn(process.execPath, argv, { stdio: ["ignore", sortie, "inherit"] });
    ps.on("close", code => {
      fs.closeSync(sortie);
      enCours--;
      if (code !== 0) erreurs++;
      console.log((code === 0 ? "ok    " : "ERREUR") + " " + m.nom.padEnd(32) + Math.round((Date.now() - debut) / 1000) + " s  (node atelier/outils/simuler-bataille.js --niveaux " + m.niveaux + " " + m.opts.join(" ") + ")");
      if (index >= aFaire.length && enCours === 0) {
        console.log("\n" + aFaire.length + " mesures, " + erreurs + " erreur(s), " + Math.round((Date.now() - t0) / 1000) + " s. Résultats dans " + path.relative(RACINE, DOSSIER) + "/");
        process.exit(erreurs ? 1 : 0);
      }
      suivant();
    });
  }
}
console.log(aFaire.length + " mesures à jouer, " + PARALLELES + " à la fois, " + GRAINES + " graines…");
suivant();
