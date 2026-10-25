// PDF A4 paysage "Circulations et largeurs de passage" : plan RDC, plan étage, tableau des passages mesurés.
// Prérequis : node tools/person-plan.mjs (images circulations-*.jpg + circulations.json dans renders/final)
// Usage : node tools/circulations-pdf.mjs [--dir renders/final] [--out renders/final/Circulations-largeurs-de-passage.pdf]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const DIR = path.resolve(ROOT, args.dir || 'renders/final');
const OUT = path.resolve(ROOT, args.out || path.join(DIR, 'Circulations-largeurs-de-passage.pdf'));
const data = JSON.parse(fs.readFileSync(path.join(DIR, 'circulations.json'), 'utf8'));

const COLORS = { ok: '#3f9a5a', tight: '#e8962e', block: '#d23c2f' };
const VERDICT = { ok: 'Confortable', tight: 'Étroit', block: 'Pas de place' };
const fmt = (w) => `${(w < 0.1 ? w : Math.round(w * 20) / 20).toFixed(2).replace('.', ',')} m`;

// Pistes d'amélioration (texte), par point de mesure
const PISTES = {
  entree: 'Baie maçonnée de 0,88 m : dormant et vantail ouvert ne laissent ≈ 0,70 m. Pour ≥ 0,80 m, baie de 1,00 m (porte de 90).',
  degagement: 'Console de 22 cm de profondeur : console de 15 cm → ≈ 0,75 m ; sans console 0,90 m.',
  wc: 'La porte ouvre vers l\'intérieur : sa poignée arrive à 0,59 m de la cloison (≈ 0,70 m si on la pousse jusqu\'au mur). L\'ouvrir vers le dégagement, ou coulissante / galandage (≈ 0,85 m).',
  'porte-chambre': 'Normal pour une porte de 83 (passage utile ≈ 0,73 m). Porte de 93 : ≈ 0,83 m.',
  'pied-lit': 'Seule la longueur du lit compte (2,17 m hors tout avec la tête de lit) : cadre de 2,05 m hors tout ≈ 0,58 m. Lit 160 : même longueur, pas de gain.',
  'cote-lit': 'Entre le lit et le banc contre le pignon Sud : correct ; sans banc 1,21 m.',
  fauteuil: 'Fauteuil posé en biais : c\'est le seul passage vers le dressing. Fauteuil parallèle à la cloison du dressing → ≈ 0,80 m.',
  galandage: 'Baie de 0,55 m seulement : galandage pour porte de 83 (baie ≈ 0,73 m) à étudier, la cloison fait 2,1 m de long.',
  sdb: 'Porte coulissante ouverte : passage correct.',
  escalier: 'Emmarchement 0,84 m entre limons ; 0,75 m entre main courante et garde-corps : courant en maison individuelle.',
  palier: 'Palier de 0,90 m entre cloisons, 0,88 m entre chambranles ; 0,81 m en haut de l\'escalier (main courante) : correct.',
  'ch1-porte': 'Porte ouverte (78°) : 0,35 m entre sa poignée et le pied du lit, on entre de profil. Porte coulissante à galandage (pas de débattement).',
  'ch1-ruelle': 'Ruelle du lit côté cloison : juste suffisante (0,70 m conseillé pour faire le lit).',
  'ch2-porte': 'À 90° le vantail arrive à 3 cm du lit : on ne peut pas entrer. Paumelles côté nord : le vantail se range vers la tête de lit (dégage le chevet de 0,44 m) et le passage fait 0,80 m. Ou galandage.',
};

// Contrôle indépendant : largeur recalculée à partir des cotes du modèle (spec.js, mobilier, menuiseries),
// et éléments qui limitent le passage
const CONTROLE = {
  entree: [0.678, 'dormant / vantail ouvert à 90°'],
  degagement: [0.685, 'plateau de la console / échiffre placo'],
  wc: [0.593, 'cloison WC-escalier / poignée de la porte (80°)'],
  'porte-chambre': [0.725, 'jambage / vantail ouvert à 90°'],
  'pied-lit': [0.462, 'couette / poignée de la baie coulissante'],
  'cote-lit': [0.83, 'bord du lit / banc'],
  fauteuil: [0.429, 'accoudoir du fauteuil / bord du lit'],
  galandage: [0.508, 'chant du panneau ouvert / huisserie'],
  sdb: [0.815, 'cloison du dressing / habillage du tableau'],
  escalier: [0.776, 'main courante murale / main courante du garde-corps'],
  palier: [0.876, 'chambranles des portes ch. 1 et ch. 2'],
  'ch1-porte': [0.347, 'poignée de la porte (78°) / couette'],
  'ch1-ruelle': [0.608, 'bord du lit / cloison du palier'],
  'ch2-porte': [0.026, 'chant du vantail à 90° / plaid du lit'],
};
const cm = (w) => `${w.toFixed(2).replace('.', ',')} m`;

const img = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(DIR, f)).toString('base64');
const FONTS = [['Barlow', 400], ['Barlow', 600], ['Barlow Condensed', 600]]
  .map(([f, w]) => `@font-face{font-family:'${f}';font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'tools/fonts', `${f.replace(' ', '')}-${w}.woff2`)).toString('base64')}) format('woff2');}`)
  .join('\n');
const LEVEL = { rdc: 'RDC', stair: 'Escalier', etage: 'Étage' };
const rows = data.spots.map((s) => `<tr>
  <td class="lv">${LEVEL[s.level]}</td>
  <td><b>${s.title}</b><br><span class="sub">${s.sub}</span></td>
  <td class="w" style="color:${s.cls === 'ok' ? '#22272a' : COLORS[s.cls]}">${fmt(s.w)}</td>
  <td class="k">${CONTROLE[s.id] ? `<b>${cm(CONTROLE[s.id][0])}</b><br><span class="sub">${CONTROLE[s.id][1]}</span>` : ''}</td>
  <td><span class="pill" style="background:${COLORS[s.cls]}"></span>${VERDICT[s.cls]}</td>
  <td class="p">${PISTES[s.id] || ''}</td></tr>`).join('\n');

const band = (t, c, n) => `<div class="band"><div><div class="t">${t}</div><div class="c">${c}</div></div>
  <div class="r">Extension R+1 — visuel d'architecte, non coté, non contractuel<br>
  <span class="sw" style="background:${COLORS.ok}"></span>≥ 0,90 m confortable <span class="sw" style="background:${COLORS.tight}"></span>0,60–0,90 m étroit
  <span class="sw" style="background:${COLORS.block}"></span>&lt; 0,60 m pas de place &nbsp; <span class="n">${n} / 3</span></div></div>`;

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
  ${FONTS}
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Barlow', 'Segoe UI', Helvetica, Arial, sans-serif; color: #22272a; }
  .page { width: 297mm; height: 210mm; position: relative; page-break-after: always; overflow: hidden; background: #fff; }
  .page:last-child { page-break-after: auto; }
  .img { position: absolute; left: 0; top: 0; width: 297mm; height: 192mm; object-fit: cover; }
  .band { position: absolute; left: 0; right: 0; bottom: 0; height: 18mm; display: grid; grid-template-columns: 1fr auto; align-items: center;
          gap: 8mm; padding: 0 10mm; border-top: 0.4mm solid #383e42; background: #f6f4ef; }
  .t { font: 600 15pt 'Barlow Condensed', sans-serif; letter-spacing: 0.02em; }
  .c { font-size: 9pt; color: #555b5f; margin-top: 1mm; }
  .r { text-align: right; font-size: 8pt; color: #555b5f; line-height: 1.5; }
  .sw { display: inline-block; width: 3mm; height: 3mm; vertical-align: -0.4mm; margin: 0 1mm 0 3mm; border-radius: 0.6mm; }
  .n { font-weight: 600; color: #22272a; }
  .sheet { position: absolute; left: 12mm; right: 12mm; top: 10mm; bottom: 24mm; }
  h2 { font: 600 17pt 'Barlow Condensed', sans-serif; margin: 0 0 1.5mm; letter-spacing: 0.02em; }
  .lead { font-size: 9pt; color: #555b5f; margin: 0 0 3mm; line-height: 1.4; }
  table { width: 100%; border-collapse: collapse; font-size: 8.4pt; line-height: 1.28; }
  th { text-align: left; font: 600 8pt 'Barlow Condensed', sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #555b5f;
       border-bottom: 0.4mm solid #383e42; padding: 1.2mm 2mm; }
  td { border-bottom: 0.2mm solid #d9d6cf; padding: 1.25mm 2mm; vertical-align: top; }
  td.lv { color: #555b5f; width: 15mm; }
  td.w { font: 600 11pt 'Barlow Condensed', sans-serif; white-space: nowrap; width: 18mm; }
  td.p { color: #3d4246; }
  td.k { width: 36mm; }
  .sub { color: #6b7074; font-size: 7.8pt; }
  .pill { display: inline-block; width: 2.6mm; height: 2.6mm; border-radius: 0.6mm; margin-right: 1.5mm; vertical-align: -0.3mm; }
</style></head><body>
<section class="page"><img class="img" src="${img('circulations-rdc.jpg')}">
${band('Circulations — rez-de-chaussée', 'Sol coloré selon la largeur de passage mesurée sur la maquette meublée, portes ouvertes ; trait : parcours du personnage (1,75 m). Coupe à 1,25 m.', 1)}</section>
<section class="page"><img class="img" src="${img('circulations-etage.jpg')}">
${band('Circulations — étage', 'Porte de la chambre 2 ouverte à 90° : 3 cm entre le vantail et le lit, l\'accès à la chambre est bloqué. Coupe à 1,25 m au-dessus du plancher.', 2)}</section>
<section class="page"><div class="sheet">
  <h2>Passages mesurés et pistes</h2>
  <p class="lead">Largeur libre entre obstacles de 0,10 à 1,70 m au-dessus du sol (meubles, poignées et vantails ouverts compris ; rideaux exclus car souples), relevée sur une grille de 2,5 cm :
  précision ≈ ± 3 cm, valeurs arrondies à 5 cm. Contrôle : la même largeur recalculée au centimètre à partir des cotes du modèle, avec les deux éléments
  qui la limitent (écart avec la mesure : 3,5 cm au plus). Repères : une personne de face fait ≈ 0,50 m aux épaules ; 0,90 m est une circulation confortable.</p>
  <table><thead><tr><th>Niveau</th><th>Lieu</th><th>Mesure</th><th>Contrôle</th><th>Verdict</th><th>Piste</th></tr></thead><tbody>
  ${rows}
  </tbody></table>
</div>
${band('Synthèse des passages', 'Les points rouges sont ceux où l\'on passe de profil, ou pas du tout.', 3)}</section>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: OUT, format: 'A4', landscape: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log(OUT);
