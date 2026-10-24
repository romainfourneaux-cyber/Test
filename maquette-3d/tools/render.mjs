// Rendu headless des vues de la maquette en PNG.
// Usage : node tools/render.mjs [--views ext-ouest,coupe-escalier] [--w 1800] [--h 1200] [--out renders]
//         [--cam "px,py,pz,tx,ty,tz,fov"] [--clip "nx,ny,nz,c[;nx,ny,nz,c]"] [--name custom] [--noao]
//         [--page render-dev.html] [--callouts]
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
const W = +(args.w || 1800), H = +(args.h || 1200);
const OUT = path.resolve(ROOT, args.out || 'renders');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) { const t = m.text(); if (!/GPU stall|ReadPixels|Automatic fallback/.test(t)) { errors.push(`[${m.type()}] ${t}`); } } });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
  const rel = route.request().url().split('three@0.170.0/')[1];
  const f = path.join(ROOT, 'node_modules/three', rel);
  route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(f) });
});
await page.goto(`http://localhost:${port}/${args.page || 'render.html'}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const loaded = await page.evaluate(() => window.__app.loaded);
console.log('modules chargés :', loaded.join(', ') || '(aucun)');
if (args.noao) await page.evaluate(() => window.__app.setAO(false));

let jobs = [];
if (args.cam) {
  const [px, py, pz, tx, ty, tz, fov] = String(args.cam).split(',').map(Number);
  const clip = args.clip ? String(args.clip).split(';').map((s) => { const [a, b, c, d] = s.split(',').map(Number); return { n: [a, b, c], c: d }; }) : [];
  jobs.push({ name: args.name || 'custom', def: { label: 'custom', pos: [px, py, pz], target: [tx, ty, tz], fov: fov || 50, bg: args.bg || 'studio', clip, interior: !!args.interior } });
} else {
  const all = await page.evaluate(() => Object.keys(window.__views));
  const list = args.views ? String(args.views).split(',') : all;
  jobs = list.map((n) => ({ name: n }));
}
for (const j of jobs) {
  const t0 = Date.now();
  const data = await page.evaluate(async ({ name, def, W, H }) => {
    if (def) window.__views[name] = def;
    return await window.__app.snapshot(name, W, H);
  }, { name: j.name, def: j.def, W, H });
  const file = path.join(OUT, `${j.name}.png`);
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  if (args.callouts) {
    const pts = await page.evaluate((name) => window.__app.projectCallouts ? window.__app.projectCallouts(name) : [], j.name);
    fs.writeFileSync(path.join(OUT, `${j.name}.callouts.json`), JSON.stringify(pts, null, 1));
  }
  console.log(`${file}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
if (errors.length) { console.log('--- console ---'); console.log([...new Set(errors)].slice(0, 40).join('\n')); }
await browser.close();
server.close();
