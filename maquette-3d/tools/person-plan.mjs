// Plans des circulations (src/person.js) : vue de dessus de chaque niveau, sol coloré selon la largeur
// de passage, trace du personnage et cotes des passages étroits.
// Usage : node tools/person-plan.mjs [--w 2400] [--h 1500] [--frames 8] [--out renders/final] [--json-only]
import http from 'node:http';
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
const W = +(args.w || 2400), H = +(args.h || 1500), FRAMES = +(args.frames || 8);
const OUT = path.resolve(ROOT, args.out || 'renders/final');
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text()); });
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
  const rel = route.request().url().split('three@0.170.0/')[1];
  route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/three', rel)) });
});
await page.goto(`http://localhost:${server.address().port}/render.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
await page.evaluate(async ({ W, H }) => {
  const app = window.__app;
  const { createPersonTour } = await import('./src/person.js');
  const { drawPersonOverlay } = await import('./src/person-hud.js');
  for (const [f, w, file] of [['Barlow', 400, 'Barlow-400'], ['Barlow', 600, 'Barlow-600'], ['Barlow Condensed', 600, 'BarlowCondensed-600']]) {
    const ff = new FontFace(f, `url(./tools/fonts/${file}.woff2)`, { weight: String(w) });
    document.fonts.add(await ff.load());
  }
  window.__pt = await createPersonTour({ THREE: app.THREE, app });
  window.__draw = drawPersonOverlay;
  app.resize(W, H);
}, { W, H });
// cotes relevées (tableau du PDF)
const spots = await page.evaluate(() => window.__pt.spots.map((s) => ({ id: s.id, level: s.level, title: s.title, sub: s.sub, w: s.w, cls: s.cls })));
fs.writeFileSync(path.join(OUT, 'circulations.json'), JSON.stringify({ spots, pathMin: await page.evaluate(() => window.__pt.pathMin) }, null, 1));
for (const level of args['json-only'] ? [] : ['rdc', 'etage']) {
  const data = await page.evaluate(({ level, W, H, frames }) => {
    const app = window.__app, pt = window.__pt, cam = app.camera;
    const ov = pt.planView(level);
    // vue de dessus quasi orthographique (téléobjectif lointain), nord à gauche, Est en haut
    const cx = 4.15, cz = 2.55, y = (level === 'etage' ? 2.6 : 0);
    cam.fov = 1.6; cam.near = 200; cam.far = 600;
    const span = 9.6 / (W / H);              // hauteur visible pour ~9,6 m de large
    const dist = (Math.max(span, 6.0) / 2) / Math.tan((cam.fov * Math.PI) / 360);
    cam.up.set(0, 0, -1);
    cam.position.set(cx, y + dist, cz);
    cam.lookAt(cx, y, cz);
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    app.setAO(true);
    app.renderCurrent({ frames, ao: true });
    const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
    const g = c2.getContext('2d');
    g.drawImage(app.renderer.domElement, 0, 0, W, H);
    window.__draw(g, ov, { THREE: app.THREE, camera: cam, W, H, scale: W / 1600, hud: false });
    cam.up.set(0, 1, 0);
    return c2.toDataURL('image/jpeg', 0.92);
  }, { level, W, H, frames: FRAMES });
  const f = path.join(OUT, `circulations-${level}.jpg`);
  fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
  console.log(f);
}
await browser.close(); server.close();
