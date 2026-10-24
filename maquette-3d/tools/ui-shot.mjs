// Capture de la page interactive (index.html) en taille téléphone et ordinateur, pour contrôle visuel.
// Usage : node tools/ui-shot.mjs [--out renders/_ui] [--hash coupe-escalier] [--wait 20000]
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
const OUT = path.resolve(ROOT, args.out || 'renders/_ui');
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
// La page publiée n'a ni doctype ni <head> : on l'enveloppe comme le fait la plateforme.
const wrap = (body) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const p = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  if (p.endsWith('index.html')) { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(wrap(fs.readFileSync(p, 'utf8'))); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const errors = [];
for (const [name, vp, mobile] of [['telephone', { width: 390, height: 844 }, true], ['ordinateur', { width: 1366, height: 820 }, false]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
    userAgent: mobile ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36' : undefined });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${name}: [pageerror] ${e.message}`));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
    const rel = route.request().url().split('three@0.170.0/')[1];
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/three', rel)) });
  });
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto(`http://localhost:${port}/index.html${args.hash ? '#' + args.hash : ''}`);
  await page.waitForSelector('#loading.done', { timeout: 240000 });
  await page.waitForTimeout(+(args.wait || 15000));
  await page.screenshot({ path: path.join(OUT, `${name}.png`), timeout: 300000 });
  console.log(path.join(OUT, `${name}.png`));
  await ctx.close();
}
if (errors.length) console.log('--- erreurs ---\n' + [...new Set(errors)].join('\n'));
await browser.close();
server.close();
