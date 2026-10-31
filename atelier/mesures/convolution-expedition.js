// Réussite d'une expédition entière, par le calcul (atelier/conception/expeditions.md, 17.3), à partir des taux mesurés
// par atelier/mesures/jour0.js (fichiers atelier/mesures/jour0/*.json). Rien de ce dossier n'entre dans jeu/.
// Modèle : 3 semaines, 3 couches par semaine, une halte jouée par couche (types tirés dans la table 4.3 : escarmouche
// 55 / 35 / 25 %, embuscade 0 / 25 / 0 %), puis le gardien de la semaine ; la dernière semaine finit sur le Grand Gardien.
// Une bataille où les murs cèdent coûte un vivre ; escarmouche ou embuscade cédée ne se rejoue pas ; gardien et Grand
// Gardien se retentent tant qu'il reste des vivres (taux de la 1re tentative repris à chaque essai : prudent, puisque les
// coups portés restent). À 0 vivre, l'expédition s'arrête. Aucun vivre regagné (le bivouac s'essaie avec --repos).
// Lignes du rival : S1-2 : 0, S3-5 : 1, S6-8 : 2, S9-12 : 3, S13+ : 4 ; embuscade et Grand Gardien : + --embPlus et
// + --grandPlus (1 et 1 dans le cahier ; 1 et 0 retenus au jour 0), plafond 4, avec l'arsenal de la semaine (fichiers
// « -arsenal-1 »). Cartes : gue, foret, moulin, col, chateau selon la semaine ; le Grand Gardien sur la carte de la
// prochaine province du front (gue par défaut).
// Usage : node atelier/mesures/convolution-expedition.js [--departs 1,6] [--p 0.6,0.7,0.8,0.9] [--vivres 3,4,5]
//   [--esc 1v6|2v6|2v8] [--sansChampion] [--emb 2v10] [--gard 2v12] [--grand 3v16] [--carteGrand gue] [--decalage 0]
//   [--embPlus 1] [--grandPlus 1]
//   [--repos 0] [--dossier atelier/mesures/jour0] [--detail]
//   --embPlus, --grandPlus : lignes de plus pour l'embuscade et le Grand Gardien (1 dans le cahier, 0 = ligne de la semaine) ;
//   --decalage : config.expedition.difficulte (−1, 0, +1) ajouté à chaque ligne ; --repos q : à chaque semaine, chance q
//   qu'un bivouac de 3e couche rende un vivre (au plus 5) ; --detail : les taux de chaque nœud.
"use strict";
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
function option(nom, defaut) { const i = args.indexOf("--" + nom); return i >= 0 ? args[i + 1] : defaut; }
const DOSSIER = path.resolve(option("dossier", path.join(__dirname, "jour0")));
const DEPARTS = option("departs", "1,6").split(",").map(Number);
const PS = option("p", "0.6,0.7,0.8,0.9").split(",").map(Number);
const VIVRES = option("vivres", "3,4,5").split(",").map(Number);
const ESC = option("esc", "1v6"), SANS_CHAMPION = args.indexOf("--sansChampion") >= 0;
const EMB = option("emb", "2v10"), GARD = option("gard", "2v12"), GRAND = option("grand", "3v16");
const CARTE_GRAND = option("carteGrand", "gue");
// Ligne du rival de l'embuscade et du Grand Gardien : ligne de la semaine + EMB_PLUS / GRAND_PLUS (1 dans le cahier de
// conception, 0 pour l'essai « à la ligne de la semaine »), plafond 4 ; l'arsenal reste celui de la semaine.
const EMB_PLUS = parseInt(option("embPlus", "1"), 10), GRAND_PLUS = parseInt(option("grandPlus", "1"), 10);
const DECALAGE = parseInt(option("decalage", "0"), 10);
const REPOS = Number(option("repos", "0"));
const DETAIL = args.indexOf("--detail") >= 0;
const SEMAINES = 3, VIVRES_MAX = 5;
const CARTES = ["gue", "foret", "moulin", "col", "chateau"];
const COUCHES = [{ esc: 0.55, emb: 0 }, { esc: 0.35, emb: 0.25 }, { esc: 0.25, emb: 0 }];

function ligne(semaine) { return semaine <= 2 ? 0 : semaine <= 5 ? 1 : semaine <= 8 ? 2 : semaine <= 12 ? 3 : 4; }
const borne = n => Math.max(0, Math.min(4, n));
function lireJSON(f) { const o = fs.readFileSync(f); return JSON.parse(o[0] === 0xFF && o[1] === 0xFE ? o.toString("utf16le", 2) : o.toString("utf8").replace(/^﻿/, "")); }
const cache = {};
function fichier(nom) {
  if (!(nom in cache)) {
    const f = path.join(DOSSIER, nom + ".json");
    if (!fs.existsSync(f)) { console.error("Mesure absente : " + path.relative(process.cwd(), f) + " (lance d'abord node atelier/mesures/jour0.js)"); process.exit(1); }
    cache[nom] = lireJSON(f);
  }
  return cache[nom];
}
// Taux de tenue (murs intacts) d'un nœud, en 0..1, lu dans le fichier de mesure au niveau donné.
function tenue(nom, niveau, p) {
  const lignes = fichier(nom).resultats[String(p)];
  if (!lignes) { console.error(nom + " : pas de mesure à p = " + p); process.exit(1); }
  const l = lignes.find(x => x.niveau === niveau);
  if (!l) { console.error(nom + " : pas de mesure au niveau " + niveau); process.exit(1); }
  return l.tenue / 100;
}
// Les quatre nœuds d'une semaine de ligne L (déjà décalée), sur sa carte.
function noeuds(semaine, L, p, avecGrand) {
  const carte = CARTES[(semaine - 1) % 5];
  // un nœud joué à la ligne L + 1 avec l'arsenal de la ligne L se lit dans le fichier « -arsenal-1 » au niveau L + 1
  const decale = (prefixe, c, plus) => (plus && L < 4 ? tenue(prefixe + "-" + c + "-arsenal-1", borne(L + 1), p) : tenue(prefixe + "-" + c, L, p));
  return {
    esc: tenue("esc-" + ESC + "-" + carte + (SANS_CHAMPION ? "-sans-champion" : ""), L, p),
    emb: decale("emb-" + EMB, carte, EMB_PLUS),
    gard: tenue("gard-" + GARD + "-" + carte, L, p),
    grand: avecGrand ? decale("grand-" + GRAND, CARTE_GRAND, GRAND_PLUS) : null
  };
}
// Convolution : distribution des vivres, nœud après nœud. Rend { reussite, premierGardien, vivresMoyens }.
function expedition(depart, p, vivres) {
  let d = new Array(VIVRES_MAX + 1).fill(0); d[vivres] = 1;
  const couche = perte => { // une couche : une seule halte jouée, qui coûte un vivre avec la chance « perte »
    const n = new Array(VIVRES_MAX + 1).fill(0);
    for (let v = 1; v <= VIVRES_MAX; v++) { n[v - 1] += d[v] * perte; n[v] += d[v] * (1 - perte); }
    n[0] += d[0]; d = n;
  };
  const gardien = t => { // retenté tant qu'il reste des vivres
    const n = new Array(VIVRES_MAX + 1).fill(0);
    for (let v = 1; v <= VIVRES_MAX; v++) {
      let reste = d[v];
      for (let k = 0; k < v; k++) { n[v - k] += d[v] * Math.pow(1 - t, k) * t; reste -= d[v] * Math.pow(1 - t, k) * t; }
      n[0] += Math.max(0, reste);
    }
    n[0] += d[0]; d = n;
  };
  const repos = () => { // un vivre rendu avec la chance REPOS, jamais au-delà du maximum
    if (!REPOS) return;
    const n = new Array(VIVRES_MAX + 1).fill(0);
    for (let v = 1; v <= VIVRES_MAX; v++) { const w = Math.min(VIVRES_MAX, v + 1); n[w] += d[v] * REPOS; n[v] += d[v] * (1 - REPOS); }
    n[0] += d[0]; d = n;
  };
  let premierGardien = null;
  for (let i = 0; i < SEMAINES; i++) {
    const s = depart + i, L = borne(ligne(s) + DECALAGE), nd = noeuds(s, L, p, i === SEMAINES - 1);
    // la halte de la couche est une escarmouche (part esc) ou une embuscade (part emb), jamais les deux : la chance de
    // perdre un vivre est la somme des deux parts fois la chance que les murs cèdent
    COUCHES.forEach((c, j) => { couche(c.esc * (1 - nd.esc) + c.emb * (1 - nd.emb)); if (j === 2) repos(); });
    gardien(i === SEMAINES - 1 ? nd.grand : nd.gard);
    if (i === 0) premierGardien = 1 - d[0];
  }
  return { reussite: 1 - d[0], premierGardien: premierGardien, vivresMoyens: d.reduce((s, x, v) => s + x * v, 0) };
}

const pc = x => Math.round(100 * x) + " %";
console.log("Réussite d'une expédition de " + SEMAINES + " semaines (calcul 17.3) · escarmouche " + ESC + (SANS_CHAMPION ? " sans champion" : "") + ", embuscade " + EMB + " (ligne + " + EMB_PLUS + "), gardien " + GARD + ", Grand Gardien " + GRAND + " (ligne + " + GRAND_PLUS + ") sur " + CARTE_GRAND +
  (DECALAGE ? " · difficulté " + (DECALAGE > 0 ? "+" : "") + DECALAGE : "") + (REPOS ? " · repos au bivouac " + REPOS : "") + " · mesures : " + path.relative(process.cwd(), DOSSIER));
console.log("| Expédition | p | " + VIVRES.map(v => v + " vivres").join(" | ") + " | premier gardien franchi (3 vivres) |");
console.log("|---|---|" + VIVRES.map(() => "---").join("|") + "|---|");
DEPARTS.forEach(dep => {
  PS.forEach(p => {
    const r = VIVRES.map(v => expedition(dep, p, v));
    console.log("| S" + dep + " → S" + (dep + SEMAINES - 1) + " | " + p + " | " + r.map(x => pc(x.reussite)).join(" | ") + " | " + pc(expedition(dep, p, 3).premierGardien) + " |");
  });
});
if (DETAIL) {
  console.log("\nTaux de tenue de chaque nœud (part des batailles où les murs tiennent), semaine par semaine :");
  console.log("| Semaine | ligne | carte | p | escarmouche | embuscade (ligne + " + EMB_PLUS + ") | gardien | Grand Gardien (ligne + " + GRAND_PLUS + ", " + CARTE_GRAND + ") |");
  console.log("|---|---|---|---|---|---|---|---|");
  DEPARTS.forEach(dep => {
    for (let i = 0; i < SEMAINES; i++) {
      const s = dep + i, L = borne(ligne(s) + DECALAGE);
      PS.forEach(p => { const nd = noeuds(s, L, p, i === SEMAINES - 1); console.log("| S" + s + " | " + L + " | " + CARTES[(s - 1) % 5] + " | " + p + " | " + pc(nd.esc) + " | " + pc(nd.emb) + " | " + pc(nd.gard) + " | " + (nd.grand === null ? "—" : pc(nd.grand)) + " |"); });
    }
  });
}
