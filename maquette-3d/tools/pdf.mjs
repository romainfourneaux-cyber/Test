// Assemble les rendus en un PDF A4 paysage, une vue par page (prêt à imprimer).
// Usage : node tools/pdf.mjs [--dir renders/final] [--out renders/final/Maquette-extension.pdf]
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
const OUT = path.resolve(ROOT, args.out || path.join(DIR, 'Maquette-extension-R+1.pdf'));

// Ordre et légendes des planches
const PAGES = [
  ['ext-ouest', 'Façade jardin (Ouest)', 'Enduit Weber 001 blanc cassé, menuiseries aluminium RAL 7016, garde-corps verre, poteaux et poutre de rive enduits.'],
  ['ext-est', 'Façade entrée (Est)', 'Sas d\'entrée en toit plat, petite fenêtre du WC sous l\'escalier, fenêtre de toit au-dessus du palier.'],
  ['axo-rdc', 'Rez-de-chaussée meublé', 'Suite parentale (chambre, dressing, salle de bains), WC, dégagement, sas et départ d\'escalier. Coupe à 1,60 m.'],
  ['coupe-escalier', 'Coupe sur l\'escalier et le WC', 'Escalier métallique quart-tournant de 15 marches en tôle pliée RAL 7016. Le WC se prolonge en alcôve sous les dernières marches ; échiffre placo côté dégagement.'],
  ['int-degagement', 'Depuis le sas', 'Départ d\'escalier le long du mur Est, garde-corps acier sur échiffre placo, porte du WC au fond, porte de la chambre à gauche.'],
  ['int-wc', 'Intérieur du WC', 'Jonction WC / escalier : alcôve sous les marches balancées, lave-mains, fenêtre 60 x 70 en partie masquée par le limon.'],
  ['etage', 'Étage meublé', 'Deux chambres sous rampants, palier éclairé par la fenêtre de toit, trémie d\'escalier fermée par cloisons placo.'],
];

const img = (f) => { const j = f.replace(/\.png$/, '.jpg'); return fs.existsSync(j) ? 'data:image/jpeg;base64,' + fs.readFileSync(j).toString('base64') : 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'); };
const FONTS = [['Barlow', 400], ['Barlow', 600], ['Barlow Condensed', 600]]
  .map(([f, w]) => `@font-face{font-family:'${f}';font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'tools/fonts', `${f.replace(' ', '')}-${w}.woff2`)).toString('base64')}) format('woff2');}`)
  .join('\n');
const pages = PAGES.filter(([k]) => fs.existsSync(path.join(DIR, `${k}.png`)) || fs.existsSync(path.join(DIR, `${k}.jpg`)));
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>
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
  .r { text-align: right; font-size: 8pt; color: #555b5f; line-height: 1.45; }
  .sw { display: inline-block; width: 3mm; height: 3mm; vertical-align: -0.4mm; margin: 0 1mm 0 3mm; border: 0.2mm solid #999; }
  .n { font-weight: 600; color: #22272a; }
</style></head><body>
${pages.map(([k, t, c], i) => `<section class="page">
  <img class="img" src="${img(path.join(DIR, `${k}.png`))}">
  <div class="band">
    <div><div class="t">${t}</div><div class="c">${c}</div></div>
    <div class="r">Extension R+1 — visuel d'architecte, non coté, non contractuel<br>
      <span class="sw" style="background:#ece6d8"></span>Enduit Weber 001
      <span class="sw" style="background:#383e42"></span>Menuiseries RAL 7016
      <span class="sw" style="background:#c9d9e6"></span>Doublages placo &nbsp; <span class="n">${i + 1} / ${pages.length}</span></div>
  </div>
</section>`).join('\n')}
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: OUT, format: 'A4', landscape: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log(OUT, `(${pages.length} pages)`);
