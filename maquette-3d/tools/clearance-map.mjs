// Cartes des largeurs de passage (src/clearance.js) en PNG, portes ouvertes comme pendant la visite.
// Usage : node tools/clearance-map.mjs [--out <dossier>] [--px 6]
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
const OUT = path.resolve(ROOT, args.out || 'renders/_clearance');
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
  const rel = route.request().url().split('three@0.170.0/')[1];
  route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/three', rel)) });
});
await page.goto(`http://localhost:${server.address().port}/render.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
const res = await page.evaluate(async ({ PX, doorsTo }) => {
  const { buildGrid, WALK_CFG } = await import('./src/walk.js');
  const C = await import('./src/clearance.js');
  const { floorAt } = await import('./src/tour.js');
  const app = window.__app;
  // portes ouvertes (valeurs "open" de joinery.js, multipliées si demandé)
  app.model.traverse((o) => {
    const d = o.userData.door; if (!d) return;
    const t = doorsTo[d.id] ?? 1, v = d.closed + (d.open - d.closed) * t;
    if (d.kind === 'hinge') o.rotation.y = v; else o.position.set(d.dir[0] * v, 0, d.dir[1] * v);
  });
  app.state.furniture = true; app.state.etage = true; app.state.roof = true; app.applyVisibility();
  const grid = await buildGrid(app.THREE, app.model, WALK_CFG);
  const zones = {
    rdc: C.flatFloor(grid, 0, 0.05, { x0: 0.2, x1: 8.4, z0: 0.2, z1: 5.1 }),
    etage: C.flatFloor(grid, 2.60, 0.05, { x0: 0.2, x1: 7.1, z0: 0.2, z1: 5.1 }),
    stair: C.stairFloor(grid, { x0: 3.2, x1: 7.32, z0: 0.34, z1: 1.30 }, (x, z) => floorAt(x, z, 'stair')),
  };
  const out = { stats: grid.stats, maps: {} };
  const colorOf = (w) => w >= C.CLEAR.ok ? [63, 154, 90] : w >= C.CLEAR.tight ? [232, 150, 46] : [210, 60, 47];
  for (const [name, fo] of Object.entries(zones)) {
    const m = C.analyse(grid, fo);
    const { nx, nz, cs, bx0, bz0 } = grid;
    // image : x vers la droite (nord -> sud), z vers le bas (est -> ouest)
    const cv = document.createElement('canvas'); cv.width = nx * PX; cv.height = nz * PX;
    const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      if (Number.isFinite(m.floor[k]) && !m.free[k]) { g.fillStyle = '#555'; g.fillRect(i * PX, j * PX, PX, PX); continue; }
      if (!m.free[k]) continue;
      const w = m.width[k], [r, gg, b] = colorOf(w);
      const a = Math.min(1, Math.max(0.15, (m.dist[k] - 0.05) / 0.12));
      g.fillStyle = `rgba(${r},${gg},${b},${a})`; g.fillRect(i * PX, j * PX, PX, PX);
    }
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.font = '11px sans-serif'; g.fillStyle = '#000';
    for (let x = 0; x <= 9; x += 0.5) { const px = ((x - bx0) / cs) * PX; g.beginPath(); g.moveTo(px, 0); g.lineTo(px, cv.height); g.strokeStyle = x % 1 ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.3)'; g.stroke(); if (!(x % 1)) g.fillText(`x${x}`, px + 2, 11); }
    for (let z = 0; z <= 6; z += 0.5) { const pz = ((z - bz0) / cs) * PX; g.beginPath(); g.moveTo(0, pz); g.lineTo(cv.width, pz); g.strokeStyle = z % 1 ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.3)'; g.stroke(); if (!(z % 1)) g.fillText(`z${z}`, 2, pz - 2); }
    // minima de largeur (cellules au cœur du passage)
    out.maps[name] = cv.toDataURL('image/png');
  }
  return out;
}, { PX: +(args.px || 6), doorsTo: { 'porte-ch2': 1 } });
console.log(JSON.stringify(res.stats));
for (const [k, v] of Object.entries(res.maps)) fs.writeFileSync(path.join(OUT, `largeurs-${k}.png`), Buffer.from(v.split(',')[1], 'base64'));
await browser.close(); server.close();
console.log('ok', OUT);
