// Fiche technique "Raccord escalier métallique / placo" — 4 pages A4 portrait, prêtes à imprimer.
// Usage : node tools/fiche.mjs [--dir renders/final] [--out renders/final/Fiche-raccord-escalier-placo.pdf]
// Entrées : <dir>/detail-raccord.png (+ .callouts.json), <dir>/int-degagement.png, <dir>/coupe-escalier.png,
//           <dir>/fiche-data.json (mesures : {vitrageWc, hauteurAlcove, ...}) — tout est optionnel sauf la page de principe.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { STAIR } from '../src/spec.js';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const DIR = path.resolve(ROOT, args.dir || 'renders/final');
const OUT = path.resolve(ROOT, args.out || path.join(DIR, 'Fiche-raccord-escalier-placo.pdf'));
const has = (f) => fs.existsSync(path.join(DIR, f)) || (f.endsWith('.png') && fs.existsSync(path.join(DIR, f.replace(/\.png$/, '.jpg'))));
const dataUri = (f, mime = 'image/png') => {
  const j = f.replace(/\.png$/, '.jpg');
  if (mime === 'image/png' && fs.existsSync(j)) return `data:image/jpeg;base64,${fs.readFileSync(j).toString('base64')}`;
  return `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
};
const data = has('fiche-data.json') ? JSON.parse(fs.readFileSync(path.join(DIR, 'fiche-data.json'), 'utf8')) : {};

const FONTS = [['Barlow', 400], ['Barlow', 500], ['Barlow', 600], ['Barlow Condensed', 500], ['Barlow Condensed', 600]]
  .map(([f, w]) => `@font-face{font-family:'${f}';font-weight:${w};src:url(${dataUri(path.join(ROOT, 'tools/fonts', `${f.replace(' ', '')}-${w}.woff2`), 'font/woff2')}) format('woff2');}`)
  .join('\n');

// ---------------------------------------------------------------------------
// Schéma de principe en plan (SVG) : appuis de l'escalier et joints avec le placo
// ---------------------------------------------------------------------------
function planSvg() {
  const X0 = 2.95, X1 = 8.62, Z0 = -0.26, Z1 = 2.32, K = 118; // mètres -> px
  const W = (X1 - X0) * K, H = (Z1 - Z0) * K;
  const P = (x, z) => `${((x - X0) * K).toFixed(1)},${((z - Z0) * K).toFixed(1)}`;
  const rect = (x0, z0, x1, z1, cls) => `<rect class="${cls}" x="${((x0 - X0) * K).toFixed(1)}" y="${((z0 - Z0) * K).toFixed(1)}" width="${((x1 - x0) * K).toFixed(1)}" height="${((z1 - z0) * K).toFixed(1)}"/>`;
  const n = STAIR.nosings;
  const steps = [];
  for (let k = 1; k < n.length; k++) {
    const a = n[k - 1], b = n[k];
    let poly = [a[0], a[1], b[1], b[0]];
    if (k === 13) poly = [a[0], a[1], b[1], b[0], [3.23, 0.37]];
    steps.push(`<polygon class="step" points="${poly.map(([x, z]) => P(x, z)).join(' ')}"/>`);
  }
  const anchorsE = [];
  anchorsE.push(7.07, 6.31, 5.55, 4.78, 4.12, 3.29);   // positions modélisées (stair.js)
  return `<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="100%" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#7d7a74" stroke-width="1.4"/></pattern></defs>
  <style>
    .mac{fill:url(#hatch);stroke:#55524c;stroke-width:1}
    .iso{fill:#efd979;stroke:none}.pla{fill:#fff;stroke:#3c4144;stroke-width:.8}
    .clo{fill:#f6ecbf;stroke:#3c4144;stroke-width:.8}
    .step{fill:#dfe2e4;stroke:#383e42;stroke-width:1.2}
    .lim{fill:#383e42}.joint{stroke:#c0392b;stroke-width:3;stroke-dasharray:6 4;fill:none}
    .lbl{font:600 13px 'Barlow Condensed',sans-serif;fill:#22272a;letter-spacing:.03em}
    .sm{font:500 11px 'Barlow',sans-serif;fill:#555b5f}
  </style>
  ${rect(X0, -0.0, 8.5, 0.22, 'mac')}${rect(X0, 0.22, 8.28, 0.327, 'iso')}${rect(X0, 0.327, 8.28, 0.34, 'pla')}
  ${rect(3.13, 0.34, 3.20, Z1, 'clo')}
  ${rect(4.07, 1.24, 5.27, 1.31, 'clo')}
  ${rect(5.20, 1.31, 5.27, 2.186, 'clo')}
  ${rect(3.13, 2.186, 6.13, 2.256, 'clo')}
  ${rect(5.27, 1.21, 7.30, 1.28, 'clo')}
  ${rect(5.27, 0.34, 5.34, 1.21, 'clo')}
  ${steps.join('')}
  ${rect(3.23, 0.35, 7.30, 0.362, 'lim')}${rect(3.21, 0.35, 3.222, 1.29, 'lim')}${rect(4.10, 1.218, 7.30, 1.23, 'lim')}
  ${rect(4.045, 1.215, 4.105, 1.275, 'lim')}
  <line class="joint" x1="${((3.24 - X0) * K).toFixed(1)}" y1="${((0.385 - Z0) * K).toFixed(1)}" x2="${((7.30 - X0) * K).toFixed(1)}" y2="${((0.385 - Z0) * K).toFixed(1)}"/>
  <line class="joint" x1="${((3.245 - X0) * K).toFixed(1)}" y1="${((0.40 - Z0) * K).toFixed(1)}" x2="${((3.245 - X0) * K).toFixed(1)}" y2="${((1.29 - Z0) * K).toFixed(1)}"/>
  <line class="joint" x1="${((5.29 - X0) * K).toFixed(1)}" y1="${((1.195 - Z0) * K).toFixed(1)}" x2="${((7.28 - X0) * K).toFixed(1)}" y2="${((1.195 - Z0) * K).toFixed(1)}"/>
  ${anchorsE.map((x) => `<circle cx="${((x - X0) * K).toFixed(1)}" cy="${((0.17 - Z0) * K).toFixed(1)}" r="5.5" fill="#1f6fb2" stroke="#fff" stroke-width="1.5"/>`).join('')}
  <rect x="${((7.20 - X0) * K).toFixed(1)}" y="${((0.40 - Z0) * K).toFixed(1)}" width="12" height="12" fill="#2e8b57" stroke="#fff"/>
  <rect x="${((7.20 - X0) * K).toFixed(1)}" y="${((1.13 - Z0) * K).toFixed(1)}" width="12" height="12" fill="#2e8b57" stroke="#fff"/>
  <rect x="${((4.02 - X0) * K).toFixed(1)}" y="${((1.19 - Z0) * K).toFixed(1)}" width="12" height="12" fill="#2e8b57" stroke="#fff"/>
  <polygon points="${P(3.55, 1.38)} ${P(3.65, 1.22)} ${P(3.75, 1.38)}" fill="#d98b1d" stroke="#fff"/>
  <polygon points="${P(3.12, 0.95)} ${P(3.24, 0.85)} ${P(3.24, 1.05)}" fill="#d98b1d" stroke="#fff"/>
  <text class="lbl" x="${((5.55 - X0) * K)}" y="${((-0.12 - Z0) * K)}">MUR EST — BLOC 20 + DOUBLAGE ISOLANT + BA13</text>
  <text class="lbl" x="${((3.33 - X0) * K)}" y="${((2.24 - Z0) * K)}" transform="rotate(-90 ${((3.33 - X0) * K)} ${((2.24 - Z0) * K)})">CLOISON SdB / WC</text>
  <text class="sm" x="${((3.6 - X0) * K)}" y="${((1.85 - Z0) * K)}">WC</text>
  <text class="sm" x="${((5.85 - X0) * K)}" y="${((1.80 - Z0) * K)}">Dégagement</text>
  <text class="sm" x="${((7.55 - X0) * K)}" y="${((1.95 - Z0) * K)}">Sas</text>
  <text class="sm" x="${((5.45 - X0) * K)}" y="${((1.47 - Z0) * K)}">échiffre placo</text>
  <text class="sm" x="${((7.36 - X0) * K)}" y="${((0.86 - Z0) * K)}">départ</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Détail légendé (rendu 3D + repères projetés)
// ---------------------------------------------------------------------------
function detailFigure(name, { maxH = '120mm' } = {}) {
  if (!has(`${name}.png`)) return `<p class="miss">Rendu « ${name} » à générer.</p>`;
  const pngPath = path.join(DIR, `${name}.png`);
  const png = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : null;
  const meta = png ? { w: png.readUInt32BE(16), h: png.readUInt32BE(20) } : { w: 2000, h: 1293 }; // en-tête IHDR
  const raw = has(`${name}.callouts.json`) ? JSON.parse(fs.readFileSync(path.join(DIR, `${name}.callouts.json`), 'utf8')) : [];
  const co = raw.filter((c) => c.visible !== false && c.x > meta.w * 0.02 && c.x < meta.w * 0.98 && c.y > meta.h * 0.03 && c.y < meta.h * 0.97);
  // Repères rangés dans les marges gauche/droite de l'image, traits de rappel vers le point visé
  const W = meta.w, H = meta.h, R = H * 0.026, gap = R * 2.6;
  const items = co.map((c, i) => ({ ...c, n: i + 1, side: c.x < W * 0.5 ? 'L' : 'R' }));
  for (const side of ['L', 'R']) {
    const col = items.filter((c) => c.side === side).sort((p, q) => p.y - q.y);
    let prev = -Infinity;
    for (const c of col) { c.ly = Math.max(c.y, prev + gap, R * 1.4); prev = c.ly; }
    // si la colonne déborde en bas, on la remonte
    const over = (col.at(-1)?.ly ?? 0) - (H - R * 1.4);
    if (over > 0) for (const c of col) c.ly -= over;
    for (const c of col) c.lx = side === 'L' ? R * 1.6 : W - R * 1.6;
  }
  const svg = `<svg class="ov" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    ${items.map((c) => `<line x1="${c.lx + (c.side === 'L' ? R : -R)}" y1="${c.ly}" x2="${c.x}" y2="${c.y}" stroke="#c0392b" stroke-width="${H * 0.0028}"/>
      <circle cx="${c.x}" cy="${c.y}" r="${H * 0.006}" fill="#c0392b" stroke="#fff" stroke-width="${H * 0.002}"/>
      <circle cx="${c.lx}" cy="${c.ly}" r="${R}" fill="#c0392b" stroke="#fff" stroke-width="${H * 0.003}"/>
      <text x="${c.lx}" y="${c.ly + R * 0.38}" text-anchor="middle" font-family="Barlow Condensed" font-weight="600" font-size="${R * 1.15}" fill="#fff">${c.n}</text>`).join('')}
  </svg>`;
  const legend = co.length ? `<ol class="legend">${co.map((c) => `<li>${c.text}</li>`).join('')}</ol>` : '';
  const wmm = (parseFloat(maxH) * W / H).toFixed(1);
  return `<figure class="det"><div class="frame" style="width:min(100%, ${wmm}mm)"><img src="${dataUri(path.join(DIR, `${name}.png`))}">${svg}</div></figure>${legend}`;
}

const img = (f, cls = 'shot') => (has(f) ? `<img class="${cls}" src="${dataUri(path.join(DIR, f))}">` : '');
const vitrage = data.vitrageWc || 'à mesurer sur la maquette';
const alcove = data.hauteurAlcove || '';

const pageHead = (n, title, kicker) => `<header><div class="k">${kicker}</div><h1>${title}</h1><div class="pg">${n} / 4</div></header>`;
const foot = `<footer>Extension R+1 — fiche technique indicative, à valider par le métallier / bureau d'études et le plaquiste. Visuels non cotés.</footer>`;

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
${FONTS}
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Barlow', sans-serif; color: #22272a; font-size: 10.6pt; line-height: 1.42; }
.page { width: 210mm; height: 297mm; padding: 14mm 15mm 12mm; position: relative; page-break-after: always; display: flex; flex-direction: column; gap: 5mm; }
.page:last-child { page-break-after: auto; }
header { display: grid; grid-template-columns: 1fr auto; border-bottom: 0.5mm solid #383e42; padding-bottom: 3mm; }
header .k { grid-column: 1 / -1; font: 600 9pt 'Barlow Condensed'; letter-spacing: .14em; text-transform: uppercase; color: #6b7175; }
header h1 { margin: 1mm 0 0; font: 600 21pt/1.1 'Barlow Condensed'; letter-spacing: .01em; }
header .pg { align-self: end; font: 600 11pt 'Barlow Condensed'; color: #6b7175; }
h2 { margin: 0; font: 600 13pt 'Barlow Condensed'; letter-spacing: .03em; text-transform: uppercase; }
p { margin: 0; } .lead { font-size: 11.5pt; }
ul, ol { margin: 0; padding-left: 5mm; } li { margin: 0.6mm 0; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
table { width: 100%; border-collapse: collapse; font-size: 9.6pt; }
th, td { text-align: left; vertical-align: top; padding: 1.6mm 2mm; border-bottom: 0.25mm solid #d5d2cb; }
th { font: 600 9.5pt 'Barlow Condensed'; letter-spacing: .06em; text-transform: uppercase; color: #555b5f; }
.keys { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 6mm; font-size: 9.4pt; }
.keys span { display: inline-block; width: 3.4mm; height: 3.4mm; margin-right: 2mm; vertical-align: -0.6mm; }
.box { border: 0.3mm solid #383e42; padding: 3mm 4mm; background: #f6f4ef; }
.warn { border-left: 1.4mm solid #c0392b; background: #fbf1ee; padding: 3mm 4mm; }
.det { margin: 0; } .frame { position: relative; margin: 0 auto; } .frame img { width: 100%; display: block; border: 0.25mm solid #c9c6bf; }
.ov { position: absolute; inset: 0; width: 100%; height: 100%; }
.mk { position: absolute; transform: translate(-50%,-50%); width: 6mm; height: 6mm; border-radius: 50%; background: #c0392b; color: #fff;
      font: 600 9pt/6mm 'Barlow Condensed'; text-align: center; border: 0.5mm solid #fff; box-shadow: 0 0 0 0.25mm rgba(0,0,0,.25); }
.legend { columns: 2; column-gap: 8mm; font-size: 9.4pt; padding-left: 6mm; }
.shot { width: 100%; display: block; border: 0.25mm solid #c9c6bf; }
.shot.p4 { height: 64mm; object-fit: cover; object-position: 50% 45%; }
.steps { counter-reset: s; list-style: none; padding: 0; display: grid; gap: 2mm; }
.steps li { counter-increment: s; display: grid; grid-template-columns: 8mm 1fr; }
.steps li::before { content: counter(s); font: 600 13pt 'Barlow Condensed'; color: #383e42; }
footer { margin-top: auto; font-size: 8pt; color: #6b7175; border-top: 0.25mm solid #d5d2cb; padding-top: 2mm; }
.miss { color: #c0392b; }
</style></head><body>

<section class="page">
  ${pageHead(1, 'L\'escalier ne s\'appuie jamais sur le placo', 'Raccord escalier métallique / placo · principe')}
  <p class="lead">L'escalier en acier (limons en tôle, marches en tôle pliée, thermolaqué RAL 7016) est un ouvrage porteur.
  Les doublages et cloisons en plaques de plâtre sont des ouvrages de finition, non porteurs (DTU 25.41 et 25.42).
  Toutes les charges passent donc par la maçonnerie, la dalle et le dallage ; le placo est monté autour de l'escalier, avec un joint.</p>
  <div class="box">${planSvg()}
    <div class="keys" style="margin-top:2mm">
      <div><span style="background:#1f6fb2;border-radius:50%"></span>Ancrage dans le bloc à travers le doublage</div>
      <div><span style="background:#2e8b57"></span>Platine chevillée sur le dallage (pied, poteau-noyau)</div>
      <div><span style="background:#d98b1d"></span>Platine / cornière en rive de trémie (dalle d'étage)</div>
      <div><span style="border-top:0.8mm dashed #c0392b;height:0;margin-top:1.5mm"></span>Joint creux / bande résiliente 10 mm : aucune fixation dans le placo</div>
    </div>
  </div>
  <table>
    <tr><th>Élément</th><th>Ce qui le porte</th><th>Raccord avec le placo</th></tr>
    <tr><td>Limon le long du mur Est</td><td>Mur en blocs : tiges filetées M12 en scellement chimique tous les 0,60 à 0,80 m</td><td>Traverse le doublage par des entretoises acier ; joint creux de 10 mm</td></tr>
    <tr><td>Limon du tournant (cloison SdB / WC)</td><td>Angle soudé au limon Est + platine en rive de trémie</td><td>Aucune fixation dans la cloison ; joint creux de 10 mm</td></tr>
    <tr><td>Limon côté jour + poteau-noyau 60 x 60</td><td>Dallage (platines) et sous-face de la dalle d'étage</td><td>La cloison du WC et l'échiffre viennent buter avec une bande résiliente</td></tr>
    <tr><td>Arrivée au palier</td><td>Cornière chevillée en rive de trémie</td><td>Habillage placo de la rive arrêté sur la cornière</td></tr>
    <tr><td>Garde-corps, mains courantes</td><td>Limon et mur en blocs</td><td>Jamais vissés dans le placo seul</td></tr>
  </table>
  ${foot}
</section>

<section class="page">
  ${pageHead(2, 'Détail 1 · limon fixé au mur à travers le doublage', 'Raccord escalier métallique / placo')}
  ${detailFigure('detail-fixation', { maxH: '118mm' })}
  <ol class="steps">
    <li><div><b>Avant les doublages</b>, le métallier relève les murs bruts et fixe les positions d'ancrage sur ses plans d'atelier.</div></li>
    <li><div>Perçage du bloc, scellement chimique des tiges M12 <b>avec tamis</b> (bloc creux), en respectant l'évaluation technique de la cheville (profondeur, entraxes, distance aux bords).</div></li>
    <li><div>Pose des <b>entretoises acier</b> en appui sur le bloc : elles traversent isolant et BA13 et s'arrêtent 10 mm en retrait du nu du placo. Variante : platines murales.</div></li>
    <li><div>Le plaquiste découpe le doublage autour des entretoises et calfeutre au mastic acrylique (étanchéité à l'air).</div></li>
    <li><div>L'escalier est posé <b>après bandes et enduits</b> : plot néoprène 5 mm, rondelle, écrou borgne. Le limon prend appui sur l'entretoise, jamais sur le placo.</div></li>
    <li><div><b>Joint creux de 10 mm</b> entre limon et placo, laissé en ombre ou garni de mastic acrylique peignable. Pas de bande à joint au contact du métal : elle fissure à la première vibration.</div></li>
  </ol>
  ${foot}
</section>

<section class="page">
  ${pageHead(3, 'Détail 2 · échiffre et cloisons autour de l\'escalier', 'Raccord escalier métallique / placo')}
  ${detailFigure('detail-echiffre', { maxH: '105mm' })}
  <div class="cols">
    <div>
      <h2>Échiffre côté dégagement</h2>
      <ul>
        <li>Cloison 72/48 <b>indépendante</b> qui ferme le dessous d'escalier : rail bas chevillé sur la chape avec bande résiliente.</li>
        <li>Montants rapprochés, 0,40 à 0,50 m au lieu de 0,60 : ouvrage bas, exposé aux chocs.</li>
        <li>Rail haut découpé à la pente, arrêté 10 mm sous le limon sur bande résiliente.</li>
        <li>BA13 haute dureté ou 2 plaques côté circulation, cornière d'angle sur l'arête.</li>
        <li>Le garde-corps se fixe dans le limon, pas dans l'échiffre.</li>
        <li>Option : trappe de visite vers le placard sous l'escalier.</li>
      </ul>
    </div>
    <div>
      <h2>Cloisons du WC et de la SdB</h2>
      <ul>
        <li><b>Cloison SdB / WC</b> (tournant) : aucune fixation du limon ; montants doublés et plaque haute dureté côté escalier au droit des marches balancées.</li>
        <li><b>Cloison WC / escalier</b> : bute contre le poteau-noyau avec une bande résiliente.</li>
        <li>Laine minérale 45 mm dans l'âme ; idéalement cloisons 98/48 à 2 plaques par face pour limiter le bruit de pas d'un escalier métallique.</li>
        <li>Plaques hydrofuges (H1) dans la salle de bains, avec système d'étanchéité sous carrelage en zones douche et baignoire.</li>
        <li>Plots résilients à tous les appuis (mur, dalle, dallage) ; un revêtement sur les marches (caoutchouc, liège ou bois) réduit encore le bruit.</li>
      </ul>
    </div>
  </div>
  ${foot}
</section>

<section class="page">
  ${pageHead(4, 'Fenêtre du WC et phasage du chantier', 'Raccord escalier métallique / placo')}
  <div class="warn"><h2>Point d'attention : fenêtre du WC sous l'escalier</h2>
    <p style="margin-top:1.5mm">La fenêtre 0,60 x 0,70 (allège 1,40 m, haut 2,10 m sur la façade Est) se trouve sous les marches balancées
    et derrière le limon mural. Vitrage dégagé vu de l'intérieur : <b>${vitrage}</b>.${alcove ? ` Hauteur libre dans l'alcôve du WC : <b>${alcove}</b>.` : ''}
    <b>Un vantail ouvrant vers l'intérieur bute contre le limon (environ 1 cm devant le haut du dormant) : il ne peut pas s'ouvrir.</b></p>
    <ul style="margin-top:1.5mm">
      <li><b>A.</b> Abaisser la fenêtre (par exemple allège 1,05 m, hauteur 0,60 m, haut à 1,65 m) : entièrement sous le limon, ouvrable.</li>
      <li><b>B.</b> Garder la position en châssis fixe (le WC est ventilé par la VMC), vitrage dépoli.</li>
      <li><b>C.</b> Limon côté mur en crémaillère sous les marches au lieu d'un limon plat : vitrage plus dégagé, ouverture à vérifier.</li>
    </ul>
  </div>
  ${img('coupe-escalier.png', 'shot p4')}
  <h2>Phasage</h2>
  <ol class="steps">
    <li><div>Gros œuvre : trémie avec chevêtre, dallage, enduit extérieur.</div></li>
    <li><div>Relevé du métallier sur murs bruts, plans d'atelier validés (ancrages, réservations).</div></li>
    <li><div>Ancrages et entretoises dans le bloc, avant tout doublage.</div></li>
    <li><div>Doublages, cloisons avec renforts au droit de l'escalier, rails de l'échiffre.</div></li>
    <li><div>Bandes, enduits, première couche de peinture.</div></li>
    <li><div>Pose de l'escalier thermolaqué sur plots résilients, réglages.</div></li>
    <li><div>Fermeture de l'échiffre, joints creux et mastic, cornières d'angle.</div></li>
    <li><div>Carrelage avec joint souple en pied de limon et d'échiffre, peinture de finition.</div></li>
  </ol>
  <p style="font-size:9pt;color:#555b5f">Les sections des limons, les ancrages et le garde-corps (hauteur ≥ 0,90 m au droit du nez de marche, vides ≤ 11 cm selon NF P01-012)
  sont à dimensionner par le métallier ou un bureau d'études.</p>
  ${foot}
</section>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await page.pdf({ path: OUT, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
if (args.png) {
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.screenshot({ path: OUT.replace(/\.pdf$/, '-apercu.png'), fullPage: true });
}
await browser.close();
console.log(OUT);
