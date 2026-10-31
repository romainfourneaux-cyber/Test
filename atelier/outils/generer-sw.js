// Génère jeu/sw.js, le service worker de la version web installable (tablette Android, Chrome).
// La liste des fichiers à mettre en cache est relevée dans jeu/ (tout, sauf sw.js lui-même et les fichiers système
// de Windows ou macOS) ; le nom du cache porte le numéro de jeu/VERSION.txt. Rien n'est écrit à la main dans sw.js.
// Usage : node atelier/outils/generer-sw.js
// À relancer à chaque livraison (après le changement de numéro de version) et dès qu'un fichier entre ou sort de jeu/.
// tests.js vérifie que jeu/sw.js est bien celui que cet outil produirait.
"use strict";
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..", "..");
const JEU = path.join(RACINE, "jeu");
const SORTIE = path.join(JEU, "sw.js");
const PREFIXE = "le-domaine-"; // nom du cache : le-domaine-<version>
const EXCLUS = { "sw.js": true, "Thumbs.db": true, "desktop.ini": true, ".DS_Store": true };

// Tous les fichiers de jeu/, chemins relatifs avec des « / », triés. Même liste dans les tests.
function listerFichiers() {
  const liste = [];
  (function marcher(dossier, rel) {
    fs.readdirSync(dossier, { withFileTypes: true }).forEach(d => {
      const r = rel ? rel + "/" + d.name : d.name;
      if (d.name.charAt(0) === "." || EXCLUS[r]) return;
      if (d.isDirectory()) marcher(path.join(dossier, d.name), r);
      else if (d.isFile()) liste.push(r);
    });
  })(JEU, "");
  return liste.sort();
}

function version() { return fs.readFileSync(path.join(JEU, "VERSION.txt"), "utf8").trim(); }

function tailleTotale(liste) {
  return liste.reduce((t, f) => t + fs.statSync(path.join(JEU, f)).size, 0);
}

function generer() {
  const liste = listerFichiers();
  const v = version();
  return [
    "// Service worker du jeu : version web installable, pour jouer hors ligne sur une tablette Android (Chrome).",
    "// FICHIER GÉNÉRÉ par atelier/outils/generer-sw.js, ne pas le modifier à la main : node atelier/outils/generer-sw.js",
    "// Seul jeu/js/installation.js l'enregistre, et seulement en http(s). Jamais en file:// : le double-clic sur index.html",
    "// reste tel quel. Le jeu lui-même ne fait aucun appel réseau : ce fichier est le mécanisme d'installation du navigateur.",
    "// À l'installation, il met en cache tous les fichiers du jeu (" + liste.length + " fichiers). Ensuite, chaque demande est servie",
    "// depuis le cache ; le réseau n'est qu'un repli. Une nouvelle version porte un autre nom de cache : elle s'installe,",
    "// efface l'ancien cache et prend la main au chargement suivant (skipWaiting, clients.claim).",
    "\"use strict\";",
    "var VERSION = " + JSON.stringify(v) + ";",
    "var CACHE = " + JSON.stringify(PREFIXE) + " + VERSION;",
    "var RACINE = new URL(\"./\", self.location.href).href;",
    "var FICHIERS = [",
    liste.map(f => "  " + JSON.stringify(f)).join(",\n"),
    "];",
    "",
    "self.addEventListener(\"install\", function (e) {",
    "  e.waitUntil(caches.open(CACHE).then(function (cache) {",
    "    // cache: \"reload\" : on relit les fichiers sur le serveur, pas dans le cache HTTP, pour une vraie nouvelle version",
    "    return cache.addAll(FICHIERS.map(function (f) { return new Request(RACINE + f, { cache: \"reload\" }); }));",
    "  }).then(function () { return self.skipWaiting(); }));",
    "});",
    "",
    "self.addEventListener(\"activate\", function (e) {",
    "  e.waitUntil(caches.keys().then(function (noms) {",
    "    return Promise.all(noms.filter(function (n) { return n !== CACHE && n.indexOf(" + JSON.stringify(PREFIXE) + ") === 0; })",
    "      .map(function (n) { return caches.delete(n); }));",
    "  }).then(function () { return self.clients.claim(); }));",
    "});",
    "",
    "function pageAccueil() { return caches.match(RACINE + \"index.html\"); }",
    "function horsLigne() {",
    "  return new Response(\"Hors ligne : le jeu n'est pas encore installé sur cet appareil.\", { status: 503, headers: { \"Content-Type\": \"text/plain; charset=utf-8\" } });",
    "}",
    "",
    "self.addEventListener(\"fetch\", function (e) {",
    "  var req = e.request;",
    "  if (req.method !== \"GET\") return;",
    "  var url = new URL(req.url);",
    "  if (url.origin !== self.location.origin) return;",
    "  if (req.mode === \"navigate\") {",
    "    // Une page : celle du cache si elle y est (index.html, le-domaine.html). « ./ », l'adresse de départ du manifeste,",
    "    // reçoit l'accueil mis en cache. Une page jumelle absente du cache vient du réseau, sinon de l'accueil mis en cache.",
    "    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) {",
    "      if (r) return r;",
    "      if (/\\/$/.test(url.pathname)) return pageAccueil().then(function (p) { return p || fetch(req); });",
    "      return fetch(req).catch(function () { return pageAccueil(); });",
    "    }).then(function (r) { return r || horsLigne(); }));",
    "    return;",
    "  }",
    "  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) { return r || fetch(req); }));",
    "});",
    ""
  ].join("\n");
}

// Lecture d'un sw.js existant : sa liste de fichiers et sa version (pour les tests).
function lireListe(texte) {
  const m = texte.match(/var FICHIERS = \[([\s\S]*?)\];/);
  if (!m) return null;
  return m[1].split("\n").map(l => l.trim().replace(/,$/, "")).filter(Boolean).map(l => JSON.parse(l));
}
function lireVersion(texte) {
  const m = texte.match(/var VERSION = "([^"]+)";/);
  return m ? m[1] : null;
}

if (require.main === module) {
  const texte = generer();
  fs.writeFileSync(SORTIE, texte, "utf8");
  const liste = listerFichiers();
  const octets = tailleTotale(liste);
  console.log("jeu/sw.js écrit : cache " + PREFIXE + version() + ", " + liste.length + " fichiers, " + (octets / 1048576).toFixed(1) + " Mo.");
}

module.exports = { listerFichiers, version, generer, lireListe, lireVersion, tailleTotale, PREFIXE, SORTIE, JEU };
