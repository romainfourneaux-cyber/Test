// Banc d'essai automatique de la visite 3D (src/walk.js) dans Chromium headless (WebGL logiciel).
// Usage : node tools/walk-test.mjs [--w 1100] [--h 720] [--out renders/_visite] [--norender] [--noao] [--nomobile] [--app dev]
//         node tools/walk-test.mjs --spot ch2,palier   (capture seule de points de visite)
//
// Scénario : entrée en visite au sas -> on rejoint le pied de l'escalier -> montée au clavier jusqu'au palier
// -> tentative de chute latérale / dans la trémie -> redescente -> dégagement -> WC par la porte
// -> tentative de traverser un mur (doit être bloqué) -> chambre 2. Positions journalisées, 4-6 captures PNG,
// plans de collision (RDC / étage) et capture "téléphone" du HUD (joystick piloté au doigt via CDP).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire(import.meta.url);
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch { ({ chromium, devices } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const W = +(args.w || 1100), H = +(args.h || 720);
const OUT = path.resolve(ROOT, args.out || 'renders/_visite');
const RENDER = !args.norender;
const Q = args.app ? `&app=${args.app}` : '';
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
const errors = [];
async function openPage(ctxOpts, query) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) { const t = m.text(); if (!/GPU stall|ReadPixels|Automatic fallback/.test(t)) errors.push(`[${m.type()}] ${t}`); } });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
    const rel = route.request().url().split('three@0.170.0/')[1];
    const f = path.join(ROOT, 'node_modules/three', rel);
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(f) });
  });
  await page.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto(`http://localhost:${port}/tools/walk-test.html?${query}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
  return { ctx, page };
}

const log = [];
const results = [];
const check = (ok, what, detail = '') => { results.push({ ok, what, detail }); console.log(`${ok ? 'OK ' : 'ÉCHEC'}  ${what}${detail ? '  — ' + detail : ''}`); };
const fmt = (s) => `x=${s.x.toFixed(2)} z=${s.z.toFixed(2)} sol=${s.foot.toFixed(3)} œil=${s.eye.toFixed(2)} (${s.room})`;

// ===========================================================================
// 1. Ordinateur : clavier
// ===========================================================================
const { page } = await openPage({ viewport: { width: W, height: H } }, 'auto=1' + Q);
const info = await page.evaluate(() => ({ loaded: window.__app.loaded, proxy: !!window.__proxyStair }));
console.log('modules chargés :', info.loaded.join(', ') || '(aucun)', info.proxy ? '| escalier de SUBSTITUTION (stair.js absent)' : '');
if (args.noao) await page.evaluate(() => window.__app.setAO(false));

const state = () => page.evaluate(() => window.__walk.getState());
const step = (sec) => page.evaluate((s) => window.__step(s), sec);
async function snap(name) {
  if (!RENDER) return;
  const t0 = Date.now();
  const data = await page.evaluate(() => window.__render());
  const f = path.join(OUT, name + '.png');
  fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
  const s = await state();
  console.log(`  capture ${f} (${((Date.now() - t0) / 1000).toFixed(1)} s)  ${fmt(s)} cap=${s.yawDeg}° tangage=${s.pitchDeg}°`);
}
// Marche vers (tx,tz) en maintenant une touche ; le "regard" est ré-orienté vers la cible (comme à la souris).
async function walkTo(label, tx, tz, { key = 'KeyW', max = 15, tol = 0.07, pitch = 0, shift = false } = {}) {
  let s = await state();
  const t0 = s;
  if (shift) await page.keyboard.down('Shift');
  await page.keyboard.down(key);
  let t = 0, best = Infinity, stall = 0;
  const dir0 = [tx - s.x, tz - s.z];
  while (t < max) {
    // ré-orientation du regard vers la cible (comme un visiteur à la souris), sans demi-tour
    await page.evaluate(([x, z, p]) => { const w = window.__walk; const st = w.getState(); w.lookAt(x, st.eye + Math.tan(p) * Math.hypot(x - st.x, z - st.z), z); }, [tx, tz, pitch]);
    s = await step(0.1); t += 0.1;
    log.push({ t: +t.toFixed(2), label, ...s });
    const d = Math.hypot(tx - s.x, tz - s.z);
    if (d < tol || (tx - s.x) * dir0[0] + (tz - s.z) * dir0[1] <= 0) break;     // atteinte ou dépassée
    if (d < best - 0.01) { best = d; stall = 0; } else if ((stall += 0.1) >= 1.0) break;
  }
  await page.keyboard.up(key);
  if (shift) await page.keyboard.up('Shift');
  s = await step(0.4);
  log.push({ t: +t.toFixed(2), label: label + ' (arrêt)', ...s });
  console.log(`[${label}] ${t.toFixed(1)} s  ${fmt(t0)}  ->  ${fmt(s)}  bloqué=${s.blocked}`);
  return s;
}

// --spot <id>[,<id>] : simple capture d'un ou plusieurs points de visite, puis fin
if (args.spot) {
  for (const id of String(args.spot).split(',')) {
    await page.evaluate((i) => window.__walk.isActive() ? window.__walk.goTo(i, { instant: true }) : window.__walk.enter(i, { instant: true }), id);
    await step(0.1);
    console.log(id, fmt(await state()));
    await snap('spot-' + id);
  }
  if (errors.length) console.log([...new Set(errors)].slice(0, 20).join('\n'));
  await browser.close(); server.close(); process.exit(0);
}

// --- entrée au sas
let t0 = Date.now();
await page.evaluate(() => window.__walk.enter('sas'));
const stats = await page.evaluate(() => window.__walk.stats);
console.log(`précalcul : ${stats.ms} ms, ${stats.triangles} triangles, ${stats.meshesInBounds}/${stats.meshes} maillages, ${stats.cells} cellules (entrée totale ${Date.now() - t0} ms)`);
check(stats.ms < 3000, 'précalcul < 3 s', `${stats.ms} ms`);
let s = await step(1.6);
console.log('au sas :', fmt(s));
check(Math.abs(s.foot) < 0.03 && Math.abs(s.eye - 1.62) < 0.02, 'œil à 1,62 m au sas', fmt(s));
await snap('visite-1-sas');

// --- porte d'entrée fermée (mur Est, z = 0.34) : doit bloquer
s = await walkTo('sas -> porte d\'entrée fermée (doit bloquer)', 7.75, -1.0, { key: 'KeyW', max: 3 });
check(s.z > 0.34 + 0.12 && s.z < 0.34 + 0.30, 'menuiserie fermée bloquante (porte d\'entrée)', fmt(s));
// --- au pied de l'escalier (ligne de foulée z = 0.79)
s = await walkTo('sas -> pied escalier', 7.62, 0.79, { key: 'z' });   // touche "z" (clavier français)
// --- montée : volée droite vers le nord, puis tournant
s = await walkTo('montée volée droite', 5.75, 0.79, { key: 'KeyW', pitch: 0.12 });
check(s.foot > 0.8 && s.foot < 1.4, 'montée : on gravit les marches', fmt(s));
await page.evaluate(() => { const st = window.__walk.getState(); window.__walk.lookAt(3.4, st.eye + 0.35, 0.95); });
await snap('visite-2-escalier');
// tentative de chute latérale côté dégagement (pas à gauche = +z)
{
  const b = await state();
  await page.evaluate(() => window.__walk.lookAt(3.0, null, 0.79));
  await page.keyboard.down('KeyA'); const c = await step(2.0); await page.keyboard.up('KeyA');
  log.push({ label: 'pas latéral vers le jour', ...c });
  check(c.z < 1.21 && c.foot > b.foot - 0.2, 'pas de chute latérale depuis l\'escalier', `${fmt(b)} -> ${fmt(c)}`);
}
s = await walkTo('montée balancement', 3.68, 0.80, { key: 'ArrowUp' });
s = await walkTo('arrivée palier', 3.66, 2.25, { key: 'KeyW' });
check(Math.abs(s.foot - 2.6) < 0.03 && s.room === 'Palier', 'arrivée au palier (2,60)', fmt(s));
check(Math.abs(s.eye - (s.foot + 1.62)) < 0.02, 'œil à 1,62 m au palier', fmt(s));
// point de vue "palier" (regard vers l'arrivée d'escalier)
await page.evaluate(() => window.__walk.goTo('palier'));
s = await step(1.2);
await snap('visite-3-palier');
// tentative vers la chambre 2 au travers de la cloison E2 (x 4.10)
s = await walkTo('palier -> cloison E2 (doit bloquer)', 5.0, 2.0, { key: 'KeyW', max: 4 });
check(s.x < 4.10 && Math.abs(s.foot - 2.6) < 0.03, 'cloison du palier bloquante', fmt(s));
// --- redescente
s = await walkTo('redescente tournant', 3.68, 0.80, { key: 'KeyW' });
s = await walkTo('redescente volée', 7.55, 0.79, { key: 'KeyW', shift: true });
check(Math.abs(s.foot) < 0.03, 'redescente jusqu\'au RDC', fmt(s));

// --- dégagement : tentative de traverser la cloison vers la chambre (z = 2.186), doit bloquer
await page.evaluate(() => window.__walk.goTo('degagement'));
s = await step(2.2);
console.log('goTo dégagement :', fmt(s));
// vitesse de marche (1,3 m/s) puis Maj (2,6 m/s), en ligne droite dans le dégagement vers le WC
for (const [run, v0] of [[false, 1.3], [true, 2.6]]) {
  await page.evaluate(() => window.__walk.goTo('degagement', { instant: true }));
  await page.evaluate(() => window.__walk.lookAt(4.4, null, 1.72));
  if (run) await page.keyboard.down('Shift');
  await page.keyboard.down('KeyW'); await step(0.4);                 // pas fixe 1/30 s : 12 images
  const b = await state(); const c = await step(0.3);                // 9 images
  await page.keyboard.up('KeyW'); if (run) await page.keyboard.up('Shift');
  const v = Math.hypot(c.x - b.x, c.z - b.z) / 0.3;
  check(Math.abs(v - v0) < 0.1, run ? 'Maj : marche rapide 2,6 m/s' : 'vitesse de marche 1,3 m/s', `${v.toFixed(2)} m/s`);
  await step(0.5);
}
await page.evaluate(() => window.__walk.goTo('degagement', { instant: true }));
s = await walkTo('dégagement', 5.80, 1.70, { key: 'KeyW' });
s = await walkTo('dégagement -> console contre le mur (doit bloquer)', 5.80, 3.20, { key: 'KeyW', max: 3 });
check(s.z > 1.70 && s.z < 1.965 - 0.15 && s.room === 'Dégagement', 'mobilier bloquant (console du dégagement, z 1.965)', fmt(s));
// --- porte de la chambre ouverte à 90° : on passe
s = await walkTo('dégagement', 6.52, 1.72, { key: 'KeyW' });
s = await walkTo('dégagement -> chambre (porte ouverte)', 6.52, 2.95, { key: 'KeyW' });
check(s.z > 2.6 && s.room === 'Chambre', 'porte de chambre ouverte : passage', fmt(s));
s = await walkTo('chambre -> dégagement', 6.52, 1.72, { key: 'KeyW' });
// --- dégagement -> WC par la porte (ouverte à 80°)
s = await walkTo('dégagement -> WC (porte)', 4.62, 1.66, { key: 'ArrowUp' });
check(s.x < 5.0 && s.room === 'WC', 'entrée dans le WC par la porte', fmt(s));
s = await walkTo('WC', 4.22, 1.60, { key: 'KeyW' });
s = await walkTo('WC -> mur chambre (doit bloquer)', 4.22, 3.0, { key: 'KeyW', max: 3 });
check(s.z > 1.80 && s.z < 2.186 - 0.15 && s.room === 'WC', 'mur bloquant (cloison WC / chambre)', fmt(s));
// --- WC sur le seuil, regard vers l'alcôve sous l'escalier
await page.evaluate(() => window.__walk.goTo('wc'));
s = await step(2.0);
console.log('goTo WC :', fmt(s));
await snap('visite-4-wc-alcove');
// --- chambre 2 (étage)
await page.evaluate(() => window.__walk.goTo('ch2'));
s = await step(2.4);
console.log('goTo chambre 2 :', fmt(s));
check(Math.abs(s.foot - 2.6) < 0.03, 'point de visite chambre 2 à l\'étage', fmt(s));
await snap('visite-5-chambre2');
// tous les points de visite : posés sur un sol, corps libre
const spotsOk = await page.evaluate(async () => {
  const w = window.__walk, out = [];
  for (const sp of w.spots) { await w.goTo(sp.id, { instant: true }); const st = w.getState(); const p = w.probe(st.x, st.z, st.foot); out.push({ id: sp.id, ...st, free: p.free, d: Math.hypot(st.x - sp.pos[0], st.z - sp.pos[2]) }); }
  return out;
});
for (const p of spotsOk) check(p.free && p.d < 0.3 && Math.abs(p.foot - (p.id === 'palier' || p.id.startsWith('ch') && p.id !== 'chambre' ? 2.6 : 0)) < 0.05, `point de visite "${p.id}"`, `${fmt(p)} décalage=${p.d.toFixed(2)} m`);

// plans des collisions
for (const [name, y] of [['plan-collisions-rdc', 0], ['plan-collisions-etage', 2.6]]) {
  const data = await page.evaluate(([yy, path]) => window.__map(yy, path), [y, log.filter((l) => (y ? l.foot > 1.3 : l.foot <= 1.3)).map((l) => ({ x: l.x, z: l.z }))]);
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(data.split(',')[1], 'base64'));
}
await page.evaluate(() => window.__walk.exit());
check(!(await page.evaluate(() => window.__walk.isActive())) && !(await page.$('.wk-hud')), 'sortie : HUD retiré');

// ===========================================================================
// 2. Téléphone Android (tactile) : joystick + glisser pour regarder
// ===========================================================================
if (!args.nomobile) {
  const dev = devices['Pixel 7'] || devices['Pixel 5'];
  const { page: mp } = await openPage({ ...dev, deviceScaleFactor: 1 }, 'auto=1' + Q);
  await mp.evaluate(() => window.__app.setAO(false));
  await mp.evaluate(() => window.__walk.enter('degagement'));
  await mp.evaluate(() => window.__step(2.0));
  const cdp = await mp.context().newCDPSession(mp);
  const joyBox = await (await mp.$('.wk-joy')).boundingBox();
  check(!!joyBox && joyBox.width > 60, 'joystick affiché sur mobile', JSON.stringify(joyBox));
  const a = await mp.evaluate(() => window.__walk.getState());
  // pouce sur le joystick, poussé vers le haut (avancer), + un 2e doigt qui glisse sur la vue (regarder)
  const jx = joyBox.x + joyBox.width / 2, jy = joyBox.y + joyBox.height / 2;
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await touch('touchStart', [{ x: jx, y: jy, id: 1 }]);
  await touch('touchMove', [{ x: jx, y: jy - 50, id: 1 }]);
  const mid = await mp.evaluate(() => window.__step(1.0));
  await touch('touchEnd', []);
  const b = await mp.evaluate(() => window.__step(0.5));
  check(Math.hypot(b.x - a.x, b.z - a.z) > 0.8, 'joystick : on avance', `${fmt(a)} -> ${fmt(mid)} -> ${fmt(b)}`);
  const vw = dev.viewport.width, vh = dev.viewport.height;
  await touch('touchStart', [{ x: vw * 0.6, y: vh * 0.5, id: 2 }]);
  for (let i = 1; i <= 6; i++) await touch('touchMove', [{ x: vw * 0.6 + i * 20, y: vh * 0.5, id: 2 }]);
  await touch('touchEnd', []);
  const c = await mp.evaluate(() => window.__step(0.1));
  check(Math.abs(c.yawDeg - b.yawDeg) > 5, 'glisser au doigt : le regard tourne', `${b.yawDeg}° -> ${c.yawDeg}°`);
  await mp.evaluate(() => window.__walk.goTo('chambre', { instant: true }));
  await mp.evaluate(() => window.__step(0.1));
  if (RENDER) {
    await mp.evaluate(() => { window.__app.renderOnce(); });
    await mp.screenshot({ path: path.join(OUT, 'visite-6-mobile.png') });
    console.log('  capture', path.join(OUT, 'visite-6-mobile.png'));
  }
  // Échap / bouton : sortie
  await mp.click('.wk-exit');
  check(!(await mp.evaluate(() => window.__walk.isActive())) && !(await mp.$('.wk-joy')), 'bouton Quitter : sortie, joystick retiré');
}

fs.writeFileSync(path.join(OUT, 'walk-log.json'), JSON.stringify({ stats, results, log }, null, 1));
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} vérifications OK. Journal : ${path.join(OUT, 'walk-log.json')}`);
if (errors.length) { console.log('--- console ---'); console.log([...new Set(errors)].slice(0, 30).join('\n')); }
await browser.close();
server.close();
process.exit(bad.length ? 1 : 0);
