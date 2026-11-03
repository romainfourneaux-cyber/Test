// Génère les sons courts du jeu (jeu/assets/sons/*.wav) par synthèse. Créés pour ce projet, versés au domaine public (CC0).
// Usage : node atelier/outils/generer-sons.js
"use strict";
const fs = require("fs");
const path = require("path");
const TAUX = 22050;
const DOSSIER = path.join(__dirname, "..", "..", "jeu", "assets", "sons");

function wav(echantillons) {
  const n = echantillons.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(TAUX, 24);
  buf.writeUInt32LE(TAUX * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  echantillons.forEach((v, i) => buf.writeInt16LE(Math.max(-1, Math.min(1, v)) * 32000 | 0, 44 + i * 2));
  return buf;
}
let graine = 12345;
function bruit() { graine = (graine * 1103515245 + 12345) & 0x7fffffff; return graine / 0x3fffffff - 1; }
function piste(duree, f) { const n = Math.round(duree * TAUX), t = []; for (let i = 0; i < n; i++) t.push(f(i / TAUX)); return t; }
function mixer(...pistes) {
  const n = Math.max(...pistes.map(p => p.length));
  return Array.from({ length: n }, (_, i) => pistes.reduce((s, p) => s + (p[i] || 0), 0));
}
function decale(p, s) { return new Array(Math.round(s * TAUX)).fill(0).concat(p); }
const sin = (f, t) => Math.sin(2 * Math.PI * f * t);

function coup(force) {
  return piste(0.18 + 0.12 * force, t => {
    const env = Math.exp(-t * (28 - 10 * force));
    return env * (0.55 * bruit() * Math.exp(-t * 60) + (0.7 + 0.3 * force) * sin(90 - 30 * t, t));
  });
}
const sons = {
  "coup": coup(0),
  "coup-puissant": mixer(coup(1), decale(coup(0.6), 0.06)),
  "sceau": piste(0.22, t => Math.exp(-t * 22) * (0.8 * sin(220 - 300 * t, t) + 0.2 * bruit() * Math.exp(-t * 90))),
  "construction": mixer(coup(0.3), decale(coup(0.3), 0.16), decale(piste(0.08, t => 0.3 * bruit() * Math.exp(-t * 80)), 0.32)),
  "validation": mixer(...[523.25, 659.25, 783.99, 1046.5].map((f, k) => decale(piste(0.35, t => 0.32 * Math.min(1, t * 80) * Math.exp(-t * 6) * (sin(f, t) + 0.3 * sin(2 * f, t))), k * 0.09))),
  "erreur": mixer(piste(0.16, t => 0.35 * Math.min(1, t * 60) * Math.exp(-t * 10) * sin(330, t)), decale(piste(0.2, t => 0.35 * Math.min(1, t * 60) * Math.exp(-t * 9) * sin(262, t)), 0.13))
};
fs.mkdirSync(DOSSIER, { recursive: true });
Object.keys(sons).forEach(n => { fs.writeFileSync(path.join(DOSSIER, n + ".wav"), wav(sons[n])); console.log(n + ".wav", sons[n].length, "échantillons"); });
