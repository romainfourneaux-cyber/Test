// Compile les sources en clair de atelier/contenu/<id>.js vers jeu/data/cours/<id>.js
// (ou jeu/data/anglais/<id>.js pour une séquence d'anglais) : la réponse en clair « reponse »
// devient « r », brouillée avec atelier/outils/brouillage.js.
// Usage : node atelier/outils/compiler-cours.js [id ...]   (sans argument : tout compiler)
"use strict";
const fs = require("fs");
const path = require("path");
const { brouiller } = require("./brouillage.js");

const RACINE = path.join(__dirname, "..", "..");
const SOURCES = path.join(RACINE, "atelier", "contenu");

function compiler(id) {
  const fichier = path.join(SOURCES, id + ".js");
  delete require.cache[require.resolve(fichier)];
  const src = JSON.parse(JSON.stringify(require(fichier)));
  if (src.id !== id) throw new Error(id + " : l'identifiant du fichier ne correspond pas (" + src.id + ")");
  (src.questions || []).forEach(q => {
    if (!("reponse" in q)) throw new Error(q.id + " : réponse manquante");
    q.r = brouiller(JSON.stringify(q.reponse));
    delete q.reponse;
    if (q.poids == null) q.poids = 1;
  });
  const anglais = /^anglais-/.test(id);
  const dossier = path.join(RACINE, "jeu", "data", anglais ? "anglais" : "cours");
  const entete = "// " + (src.titre || id) + "\n// Généré par atelier/outils/compiler-cours.js depuis atelier/contenu/" + id + ".js. Ne pas modifier à la main.\n";
  fs.writeFileSync(path.join(dossier, id + ".js"), entete + "JEU.enregistrer(\"" + (anglais ? "anglais" : "cours") + "\", " + JSON.stringify(src, null, 1) + ");\n", "utf8");
  return { id, fiches: (src.fiches || []).length, questions: (src.questions || []).length, bonus: (src.bonus || []).length };
}

if (require.main === module) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(SOURCES).filter(f => f.endsWith(".js")).map(f => f.replace(/\.js$/, ""));
  ids.forEach(id => {
    const r = compiler(id);
    console.log(r.id + " : " + r.fiches + " fiches, " + r.questions + " questions, " + r.bonus + " bonus");
  });
}
module.exports = { compiler };
