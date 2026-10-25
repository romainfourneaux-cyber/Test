// Vidéo de la visite guidée (src/tour.js) ou de la visite avec personnage (src/person.js) :
// rendu image par image puis encodage MP4 (H.264).
// Usage : node tools/video.mjs [--kind guidee|personnage] [--w 1280] [--h 720] [--fps 25] [--samples 1] [--lamps 0|1]
//                              [--from 0] [--to <durée>] [--out renders/video] [--name visite-guidee] [--part k/n] [--noencode]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync, spawnSync } from 'node:child_process';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const W = +(args.w || 1280), H = +(args.h || 720), FPS = +(args.fps || 25), SAMPLES = +(args.samples || 1);
const OUT = path.resolve(ROOT, args.out || 'renders/video');
const KIND = args.kind || 'guidee';
const NAME = args.name || (KIND === 'personnage' ? 'visite-personnage' : 'visite-guidee');
const FRAMES_DIR = path.join(OUT, `${NAME}-images`);
fs.mkdirSync(FRAMES_DIR, { recursive: true });

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
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
  const rel = route.request().url().split('three@0.170.0/')[1];
  route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/three', rel)) });
});
await page.goto(`http://localhost:${server.address().port}/render.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
const info = await page.evaluate(async ({ W, H, lamps, kind }) => {
  const app = window.__app;
  if (kind === 'personnage') {
    const { createPersonTour } = await import('./src/person.js');
    const { drawPersonOverlay } = await import('./src/person-hud.js');
    for (const [f, w, file] of [['Barlow', 400, 'Barlow-400'], ['Barlow', 600, 'Barlow-600'], ['Barlow Condensed', 600, 'BarlowCondensed-600']]) {
      const ff = new FontFace(f, `url(./tools/fonts/${file}.woff2)`, { weight: String(w) });
      document.fonts.add(await ff.load());
    }
    window.__tour = await createPersonTour({ THREE: app.THREE, app });
    window.__draw = drawPersonOverlay;
  } else {
    const { createTour } = await import('./src/tour.js');
    window.__tour = createTour({ THREE: app.THREE, app });
  }
  app.resize(W, H);
  app.setAO(false);
  window.__lamps = lamps;
  // voile de fondu composé dans un canevas 2D
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
  window.__c2 = c2;
  return { duration: window.__tour.duration, doors: window.__tour.doorActions.map((d) => d.id) };
}, { W, H, lamps: args.lamps === '1', kind: KIND });
const tFrom = +(args.from || 0), tTo = Math.min(+(args.to || info.duration), info.duration);
const all = [];
for (let i = Math.round(tFrom * FPS); i <= Math.round(tTo * FPS); i++) all.push(i);
let frames = all;
if (args.part) { const [k, n] = String(args.part).split('/').map(Number); frames = all.filter((i) => i % n === k - 1); }
console.log(`durée ${info.duration.toFixed(1)} s, portes : ${info.doors.join(', ')} ; ${frames.length} images à rendre`);

const t0 = Date.now();
for (const [n, i] of frames.entries()) {
  const file = path.join(FRAMES_DIR, `f${String(i).padStart(5, '0')}.jpg`);
  if (fs.existsSync(file) && !args.force) continue;
  const data = await page.evaluate(({ t, samples }) => {
    const app = window.__app, tour = window.__tour;
    tour.seek(t);
    // lampes intérieures coupées (beaucoup plus rapide en WebGL logiciel) ; la lumière du jour suffit
    if (!window.__lamps && app.state.lamps) { app.state.lamps = false; app.applyVisibility(); }
    app.renderCurrent({ frames: samples });
    const c2 = window.__c2, g = c2.getContext('2d');
    g.drawImage(app.renderer.domElement, 0, 0, c2.width, c2.height);
    if (window.__draw) window.__draw(g, tour.overlay(t), { THREE: app.THREE, camera: app.camera, W: c2.width, H: c2.height, scale: c2.width / 1280 });
    const a = tour.fade(t);
    if (a > 0) { g.fillStyle = `rgba(14,16,18,${a})`; g.fillRect(0, 0, c2.width, c2.height); }
    return c2.toDataURL('image/jpeg', 0.93);
  }, { t: i / FPS, samples: SAMPLES });
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  if (n % 25 === 0) {
    const el = (Date.now() - t0) / 1000, per = el / (n + 1);
    console.log(`image ${i} (${n + 1}/${frames.length}) — ${per.toFixed(2)} s/image, reste ~${((frames.length - n - 1) * per / 60).toFixed(1)} min`);
  }
}
if (errors.length) console.log('--- erreurs ---\n' + [...new Set(errors)].slice(0, 20).join('\n'));
await browser.close();
server.close();

if (!args.noencode && !args.part) {
  const mp4 = path.join(OUT, `${NAME}.mp4`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(Math.round(tFrom * FPS)),
    '-i', path.join(FRAMES_DIR, 'f%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', mp4], { stdio: 'inherit' });
  if (r.status === 0) console.log(mp4, `${(fs.statSync(mp4).size / 1e6).toFixed(1)} Mo`);
}
