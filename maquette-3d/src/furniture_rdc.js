// Mobilier du rez-de-chaussée + faïences murales des pièces humides.
// Repère (voir spec.js) : x vers le SUD, z vers l'OUEST, y vers le haut ; mètres ; sol fini RDC y = 0.
// Tout est construit en volumes fermés (box / extrusions / révolutions) pour un poché propre en coupe.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { box, prismX, prismY, prismZ, cylinderY, tube, grp, add, mat, cappedMaterial, worldUV } from './core.js';

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
const asM = (m) => (typeof m === 'string' ? mat(m) : m);
const darker = (hex, k = 0.7) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const MC = new Map();
// matériau local "coupable" (poché = teinte assombrie)
function M(key, params, cap) {
  if (!MC.has(key)) MC.set(key, cappedMaterial({ roughness: 0.85, ...params }, cap || darker(params.color || '#bbbbbb', 0.72)));
  return MC.get(key);
}

function meshOf(geo, m, { cast = true, receive = true } = {}) {
  const o = new THREE.Mesh(geo, asM(m));
  o.castShadow = cast; o.receiveShadow = receive;
  return o;
}
// boîte à arêtes arrondies (coussins, matelas, assises)
function rbox(x0, y0, z0, x1, y1, z1, r, m, seg = 3) {
  const sx = x1 - x0, sy = y1 - y0, sz = z1 - z0;
  const rr = Math.max(1e-3, Math.min(r, sx / 2 - 1e-3, sy / 2 - 1e-3, sz / 2 - 1e-3));
  const o = meshOf(new RoundedBoxGeometry(sx, sy, sz, seg, rr), m);
  o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return o;
}
// révolution autour de y : profil fermé [[r, h], ...] parcouru matière à gauche
function lathe(profile, x, y, z, m, seg = 28) {
  const o = meshOf(new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), seg), m);
  o.position.set(x, y, z);
  return o;
}
function discZ(cx, cy, z0, z1, r, m, seg = 32) {
  const g = new THREE.CylinderGeometry(r, r, z1 - z0, seg); g.rotateX(Math.PI / 2);
  const o = meshOf(g, m); o.position.set(cx, cy, (z0 + z1) / 2);
  return o;
}
function discX(cy, cz, x0, x1, r, m, seg = 24) {
  const g = new THREE.CylinderGeometry(r, r, x1 - x0, seg); g.rotateZ(Math.PI / 2);
  const o = meshOf(g, m); o.position.set((x0 + x1) / 2, cy, cz);
  return o;
}
// extrusion verticale d'une forme dessinée en coordonnées (x, -z)
function shapeY(shape, y0, y1, m, curveSegments = 12) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments });
  g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); worldUV(g);
  return meshOf(g, m);
}
// rectangle à coins arrondis (x0..x1, z0..z1), sens trigo dans le plan (x, -z)
function rrPath(p, x0, z0, x1, z1, r) {
  const X0 = x0, X1 = x1, Y0 = -z1, Y1 = -z0;
  r = Math.max(1e-3, Math.min(r, (X1 - X0) / 2 - 1e-4, (Y1 - Y0) / 2 - 1e-4));
  p.moveTo(X0 + r, Y0);
  p.lineTo(X1 - r, Y0); p.absarc(X1 - r, Y0 + r, r, -Math.PI / 2, 0, false);
  p.lineTo(X1, Y1 - r); p.absarc(X1 - r, Y1 - r, r, 0, Math.PI / 2, false);
  p.lineTo(X0 + r, Y1); p.absarc(X0 + r, Y1 - r, r, Math.PI / 2, Math.PI, false);
  p.lineTo(X0, Y0 + r); p.absarc(X0 + r, Y0 + r, r, Math.PI, 1.5 * Math.PI, false);
  return p;
}
const rrShape = (...a) => rrPath(new THREE.Shape(), ...a);
function rrRing(outer, inner, y0, y1, m) {
  const s = rrShape(...outer);
  s.holes.push(rrPath(new THREE.Path(), ...inner));
  return shapeY(s, y0, y1, m, 10);
}
// forme en "D" (cuvette suspendue) : mur en xw, nez en xf, axe zc, largeur w
function dShape(xw, xf, zc, w) {
  const r = w / 2, xs = xf - r, s = new THREE.Shape();
  s.moveTo(xw, -zc - r);
  s.lineTo(xs, -zc - r);
  s.absarc(xs, -zc, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(xw, -zc + r);
  s.lineTo(xw, -zc - r);
  return s;
}

// ---------------------------------------------------------------------------
// Textures procédurales (canvas)
// ---------------------------------------------------------------------------
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

let TX = null;
function textures() {
  if (TX) return TX;
  // tissage (lin) en niveaux de gris clairs, teinté par la couleur du matériau
  const weave = canvasTex(256, 256, (g, w, h) => {
    const r = rng(91);
    g.fillStyle = '#ececec'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 2) { const v = (208 + r() * 44) | 0; g.fillStyle = `rgba(${v},${v},${v},0.6)`; g.fillRect(i, 0, 1, h); }
    for (let j = 0; j < h; j += 2) { const v = (208 + r() * 44) | 0; g.fillStyle = `rgba(${v},${v},${v},0.45)`; g.fillRect(0, j, w, 1); }
    for (let k = 0; k < 320; k++) { const v = (196 + r() * 55) | 0; g.fillStyle = `rgba(${v},${v},${v},0.55)`; g.fillRect(r() * w, r() * h, 4 + r() * 16, 1); }
  });
  weave.repeat.set(5, 5);
  // rotin / jonc tressé
  const rattan = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#d9bf95'; g.fillRect(0, 0, w, h);
    const r = rng(17);
    for (let j = 0; j < h; j += 8) for (let i = 0; i < w; i += 8) {
      const odd = ((i + j) / 8) % 2;
      g.fillStyle = odd ? 'rgba(120,85,45,0.35)' : 'rgba(255,240,210,0.25)';
      g.fillRect(i + 1, j + 1, odd ? 6 : 7, odd ? 7 : 6);
      g.fillStyle = `rgba(90,60,30,${0.15 + r() * 0.15})`;
      g.fillRect(i, j, 8, 1);
    }
  });
  rattan.repeat.set(6, 6);
  // miroir : dégradé clair (reflet de la pièce) + reflet diagonal, sans dépendre de l'environnement
  const mirrorCanvas = (horizontal) => (g, w, h) => {
    const grad = horizontal ? g.createLinearGradient(0, 0, w, 0) : g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f3f4f2'); grad.addColorStop(0.45, '#dde2e2'); grad.addColorStop(1, '#bfc7c9');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.beginPath(); g.moveTo(w * 0.15, 0); g.lineTo(w * 0.35, 0); g.lineTo(w * 0.05, h); g.lineTo(0, h); g.lineTo(0, h * 0.6); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.beginPath(); g.moveTo(w * 0.45, 0); g.lineTo(w * 0.52, 0); g.lineTo(w * 0.22, h); g.lineTo(w * 0.15, h); g.closePath(); g.fill();
  };
  const mirrorDisc = canvasTex(128, 128, mirrorCanvas(true));
  const mirrorTall = canvasTex(64, 256, mirrorCanvas(false));
  for (const t of [mirrorDisc, mirrorTall]) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  mirrorTall.repeat.set(1 / 0.44, 1 / 1.64);
  TX = { weave, rattan, mirrorDisc, mirrorTall };
  return TX;
}

// tapis : motif complet étiré sur la face supérieure (UV en mètres -> repeat 1/longueur)
function rugTexture(kind, sx, sz) {
  const t = canvasTex(512, Math.round(512 * Math.min(1, sz / sx)) || 256, (g, w, h) => {
    const r = rng(kind.length * 31 + 7);
    if (kind === 'chambre') {
      g.fillStyle = '#ebe5da'; g.fillRect(0, 0, w, h);
      // laine bouclée
      for (let k = 0; k < 9000; k++) { const v = r(); g.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(150,135,115,0.10)'; g.fillRect(r() * w, r() * h, 2, 2); }
      // motif berbère discret (losanges)
      g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 2;
      const step = 46;
      for (let x = 30; x < w - 30; x += step) for (let y = 30; y < h - 30; y += step) {
        g.beginPath(); g.moveTo(x + step / 2, y + 6); g.lineTo(x + step - 6, y + step / 2); g.lineTo(x + step / 2, y + step - 6); g.lineTo(x + 6, y + step / 2); g.closePath(); g.stroke();
      }
      g.strokeStyle = 'rgba(176,120,92,0.55)'; g.lineWidth = 5; g.strokeRect(16, 16, w - 32, h - 32);
      g.strokeStyle = 'rgba(120,100,80,0.45)'; g.lineWidth = 2; g.strokeRect(26, 26, w - 52, h - 52);
    } else if (kind === 'runner') {
      g.fillStyle = '#d9d0c1'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 6000; k++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(90,80,70,0.10)'; g.fillRect(r() * w, r() * h, 2, 2); }
      const bands = [[0.06, '#8e9b86'], [0.10, '#b98468'], [0.90, '#b98468'], [0.94, '#8e9b86']];
      for (const [f, c] of bands) { g.fillStyle = c; g.fillRect(f * w - 4, 10, 8, h - 20); }
      g.strokeStyle = 'rgba(70,60,50,0.55)'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      for (let x = 0.16 * w; x < 0.85 * w; x += 22) { g.fillStyle = 'rgba(110,95,80,0.35)'; g.fillRect(x, h * 0.3, 3, h * 0.4); }
    } else if (kind === 'coco') {
      g.fillStyle = '#a9875b'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 14000; k++) { const v = r(); g.fillStyle = v > 0.5 ? 'rgba(220,190,140,0.25)' : 'rgba(60,40,20,0.22)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1); }
      g.strokeStyle = '#3d342b'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
    } else { // tapis de bain gaufré
      g.fillStyle = '#f1ede6'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 12) for (let y = 0; y < h; y += 12) { g.fillStyle = 'rgba(160,150,135,0.18)'; g.fillRect(x, y, 12, 2); g.fillRect(x, y, 2, 12); }
    }
  });
  t.repeat.set(1 / sx, 1 / sz);
  return t;
}

// petites œuvres encadrées (abstraites, couleurs douces)
function artTexture(kind, w, h) {
  const t = canvasTex(256, Math.round(256 * h / w), (g, W, H) => {
    g.fillStyle = '#f1ece3'; g.fillRect(0, 0, W, H);
    if (kind === 'paysage') {
      const bands = ['#dfd3bf', '#c9b493', '#a9b39b', '#8d9c8b', '#9eaab2'];
      bands.forEach((c, i) => {
        g.fillStyle = c; g.beginPath();
        const y0 = H * (0.45 + i * 0.1);
        g.moveTo(0, y0);
        for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 - 18 * Math.sin(x / W * Math.PI * (1.2 + i * 0.3) + i));
        g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
      });
      g.fillStyle = '#d49b7c'; g.beginPath(); g.arc(W * 0.7, H * 0.28, W * 0.09, 0, Math.PI * 2); g.fill();
    } else {
      g.fillStyle = '#c98f6f'; g.beginPath(); g.arc(W * 0.42, H * 0.62, W * 0.30, Math.PI, 2 * Math.PI); g.fill();
      g.fillStyle = '#9fae95'; g.beginPath(); g.arc(W * 0.64, H * 0.36, W * 0.16, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#4a4744'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * 0.12, H * 0.78); g.bezierCurveTo(W * 0.4, H * 0.68, W * 0.6, H * 0.9, W * 0.88, H * 0.74); g.stroke();
    }
    g.strokeStyle = '#ffffff'; g.lineWidth = 18; g.strokeRect(0, 0, W, H); // passe-partout
  });
  t.repeat.set(1 / w, 1 / h);
  return t;
}

// ---------------------------------------------------------------------------
// Matériaux locaux
// ---------------------------------------------------------------------------
let K = null;
function mats() {
  if (K) return K;
  const { weave, rattan, mirrorDisc, mirrorTall } = textures();
  const fab = (key, color, extra = {}) => M('fab-' + key, { color, map: weave, roughness: 0.97, ...extra });
  K = {
    oak: 'chene',
    oakDark: M('oakDark', { color: '#b89a76', map: mat('chene').map, roughness: 0.6 }, '#7a5c3d'),
    white: 'blancLaque',
    solid: M('solid', { color: '#f4f2ee', roughness: 0.28 }, '#d5d1ca'),
    ceram: 'ceramique',
    chrome: 'chrome',
    inox: 'inox',
    anth: 'ral7016',
    tile: 'carrelageMural',
    glass: 'verre',
    mirror: M('miroirDisque', { color: '#ffffff', map: mirrorDisc, roughness: 0.06, metalness: 0.15, envMapIntensity: 0.6 }, '#9aa3a6'),
    mirrorTall: M('miroirPied', { color: '#ffffff', map: mirrorTall, roughness: 0.06, metalness: 0.15, envMapIntensity: 0.6 }, '#9aa3a6'),
    placo: 'placo',
    gap: M('gap', { color: '#2c2824', roughness: 0.9 }, '#1d1a17'),
    resin: M('resin', { color: '#d9d5cd', roughness: 0.7 }, '#a9a49b'),
    paper: M('paper', { color: '#fbfaf6', roughness: 0.9 }, '#d6d3cb'),
    rattan: M('rattan', { color: '#ffffff', map: rattan, roughness: 0.9 }, '#8a6a45'),
    pot: M('potTerre', { color: '#c88f6c', roughness: 0.85 }, '#8c5c40'),
    potWhite: M('potBlanc', { color: '#ebe7df', roughness: 0.6 }, '#b9b3a8'),
    potGrey: M('potGris', { color: '#9c9890', roughness: 0.8 }, '#6e6a63'),
    soil: M('soil', { color: '#4b3b2c', roughness: 1.0 }),
    leaf: M('leaf', { color: '#5f7d4b', roughness: 0.8, flatShading: true }, '#3c5230'),
    leafOlive: M('leafOlive', { color: '#a3b392', roughness: 0.85, flatShading: true }, '#5b6a50'),
    trunk: M('trunk', { color: '#6e5a45', roughness: 0.9 }),
    brass: M('brass', { color: '#c2a46c', roughness: 0.35, metalness: 0.8 }, '#8a7245'),
    opal: M('opal', { color: '#fff8ec', emissive: '#ffe6bf', emissiveIntensity: 1.1, roughness: 0.4 }, '#e8dcc6'),
    shade: M('shade', { color: '#f1e9db', map: weave, emissive: '#ffdcaa', emissiveIntensity: 0.55, roughness: 0.95 }, '#d9cbb3'),
    amber: M('amber', { color: '#a8743d', roughness: 0.2, metalness: 0.1 }),
    // tissus
    linen: fab('lin', '#e7e0d3'),
    linenWhite: fab('linBlanc', '#f6f3ee'),
    sheet: fab('drap', '#fbfaf7'),
    sand: fab('sable', '#d8c8ad'),
    sage: fab('sauge', '#a9b59e'),
    terra: fab('terracotta', '#c99479'),
    rose: fab('rose', '#d3aa9c'),
    ochre: fab('ocre', '#d1ad74'),
    blueGrey: fab('bleuGris', '#93a3ae'),
    boucle: fab('boucle', '#ece6da'),
    curtain: fab('rideau', '#efe9de', { roughness: 1.0 }),
    towelWhite: fab('serviette', '#f4f1ec'),
    towelSage: fab('servietteSauge', '#aebaa4'),
    fab,
  };
  return K;
}

// ---------------------------------------------------------------------------
// Petits objets réutilisables
// ---------------------------------------------------------------------------
function plant(x, y, z, { potR = 0.08, potH = 0.13, pot = 'potWhite', h = 0.32, spread = 0.13, n = 6, seed = 3, leaf = 'leaf', blob = 0.07, trunkH = 0 } = {}) {
  const k = mats();
  const g = new THREE.Group();
  g.add(lathe([[0, 0], [potR * 0.78, 0], [potR, potH], [potR * 0.9, potH], [0, potH - 0.004]], x, y, z, k[pot], 24));
  g.add(cylinderY(x, z, y + potH - 0.02, y + potH - 0.006, potR * 0.88, k.soil, 20));
  const r = rng(seed);
  if (trunkH) {
    g.add(tube([x, y + potH - 0.01, z], [x + 0.02, y + trunkH, z - 0.01], 0.022, k.trunk, 10));
  }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.8;
    const rad = spread * (0.35 + r() * 0.65);
    const cy = y + (trunkH || potH) + (trunkH ? (r() - 0.3) * h * 0.6 : h * (0.35 + r() * 0.65));
    const cx = x + Math.cos(a) * rad, cz = z + Math.sin(a) * rad;
    const s = blob * (0.7 + r() * 0.6);
    const m = meshOf(new THREE.IcosahedronGeometry(s, 1), k[leaf]);
    m.position.set(cx, cy, cz);
    m.scale.set(1, 0.75 + r() * 0.5, 1);
    g.add(m);
    if (!trunkH) g.add(tube([x, y + potH - 0.01, z], [cx, cy - s * 0.5, cz], 0.004, k.leaf, 6));
    else g.add(tube([x + 0.02, y + trunkH - 0.1, z - 0.01], [cx, cy, cz], 0.007, k.trunk, 6));
  }
  return g;
}

// plante à grandes feuilles (type strelitzia) : tiges + feuilles ellipsoïdales aplaties
function bigPlant(x, y, z, { potR = 0.16, potH = 0.38, pot = 'potGrey', n = 10, seed = 9, aMin = 0, aMax = Math.PI * 2, stem = 0.75, leafLen = 0.42, leafW = 0.07 } = {}) {
  const k = mats();
  const g = new THREE.Group();
  g.add(lathe([[0, 0], [potR * 0.8, 0], [potR, potH], [potR * 0.92, potH], [0, potH - 0.004]], x, y, z, k[pot], 28));
  g.add(cylinderY(x, z, y + potH - 0.02, y + potH - 0.006, potR * 0.9, k.soil, 20));
  const r = rng(seed);
  const base = new THREE.Vector3(x, y + potH - 0.01, z);
  const leafGeo = new THREE.SphereGeometry(1, 12, 6);
  for (let i = 0; i < n; i++) {
    const a = aMin + (aMax - aMin) * (i + 0.5) / n + (r() - 0.5) * 0.35;
    const t = 0.06 + r() * 0.28;
    const L = stem * (0.55 + r() * 0.6);
    const d = new THREE.Vector3(Math.cos(a) * Math.sin(t), Math.cos(t), Math.sin(a) * Math.sin(t));
    const S = base.clone().addScaledVector(d, L);
    g.add(tube(base.toArray(), S.toArray(), 0.006, k.leaf, 6));
    const t2 = t + 0.30 + r() * 0.30;
    const d2 = new THREE.Vector3(Math.cos(a) * Math.sin(t2), Math.cos(t2), Math.sin(a) * Math.sin(t2));
    const ll = leafLen * (0.75 + r() * 0.45);
    const leaf = meshOf(leafGeo, k.leaf);
    leaf.scale.set(leafW * (0.8 + r() * 0.4), 0.008, ll / 2);
    leaf.position.copy(S).addScaledVector(d2, ll / 2);
    leaf.lookAt(S.clone().addScaledVector(d2, ll));
    g.add(leaf);
  }
  return g;
}

// pile de linge plié
function stack(parent, x0, z0, x1, z1, y, n, r, colors) {
  let yy = y;
  for (let i = 0; i < n; i++) {
    const h = 0.035 + r() * 0.025, dx = (r() - 0.5) * 0.02, dz = (r() - 0.5) * 0.02;
    add(parent, rbox(x0 + dx, yy, z0 + dz, x1 + dx, yy + h, z1 + dz, 0.012, colors[(r() * colors.length) | 0], 2));
    yy += h;
  }
  return yy;
}

// paire de chaussures orientée selon z (pointe vers +z si dir = +1)
function shoes(parent, x, y, zc, color, sole, dir = 1, kind = 'basket') {
  const L = 0.27, W = 0.09;
  const zHeel = zc - dir * L / 2, zToe = zc + dir * L / 2;
  const span = (a, b) => [Math.min(a, b), Math.max(a, b)];
  for (const dx of [0, W + 0.02]) {
    const xa = x + dx, xb = x + dx + W;
    const [s0, s1] = span(zHeel, zToe);
    add(parent, box(xa, y, s0, xb, y + 0.02, s1, sole));
    const [b0, b1] = span(zHeel + dir * 0.005, zToe - dir * 0.01);
    add(parent, rbox(xa + 0.004, y + 0.02, b0, xb - 0.004, y + (kind === 'botte' ? 0.08 : 0.09), b1, 0.03, color, 2));
    if (kind === 'botte') {
      const [a0, a1] = span(zHeel + dir * 0.005, zHeel + dir * 0.11);
      add(parent, rbox(xa + 0.004, y + 0.02, a0, xb - 0.004, y + 0.25, a1, 0.03, color, 2));
    }
  }
}

// vêtement suspendu (silhouette chemise/robe), plan vertical
//   alongZ = true : tringle selon z -> vêtement dans le plan (x, y), épaisseur selon z
function garment(parent, alongZ, a, b, rodY, len, wid, th, m, hanger) {
  const top = rodY - 0.035;
  const pts = [[-wid / 2, top - 0.07], [-0.07, top], [0.07, top], [wid / 2, top - 0.07], [wid / 2 * 0.9, top - len], [-wid / 2 * 0.9, top - len]];
  if (alongZ) {
    add(parent, prismZ(pts.map(([u, v]) => [a + u, v]), b - th / 2, b + th / 2, m));
    add(parent, box(a - wid * 0.45, top - 0.012, b - 0.006, a + wid * 0.45, top + 0.004, b + 0.006, hanger));
  } else {
    add(parent, prismX(pts.map(([u, v]) => [b + u, v]), a - th / 2, a + th / 2, m));
    add(parent, box(a - 0.006, top - 0.012, b - wid * 0.45, a + 0.006, top + 0.004, b + wid * 0.45, hanger));
  }
  add(parent, tube([a, top + 0.004, b], [a, rodY, b], 0.003, 'chrome', 6));
}

// lampe à poser (pied céramique + abat-jour lin éclairé)
function tableLamp(x, y, z, baseMat) {
  const k = mats();
  const g = new THREE.Group();
  g.add(lathe([[0, 0], [0.055, 0], [0.075, 0.05], [0.072, 0.15], [0.035, 0.21], [0.014, 0.235], [0.014, 0.25], [0, 0.25]], x, y, z, baseMat, 28));
  g.add(tube([x, y + 0.25, z], [x, y + 0.31, z], 0.006, 'inox', 8));
  g.add(lathe([[0.14, 0], [0.112, 0.2], [0.106, 0.2], [0.134, 0], [0.14, 0]], x, y + 0.22, z, k.shade, 32));
  return g;
}

// ---------------------------------------------------------------------------
// SALLE DE BAINS
// ---------------------------------------------------------------------------
function salleDeBains(fai) {
  const k = mats();
  const g = grp('sdb-mobilier', 'rdc', 'mobilier');
  const T = 0.01; // épaisseur faïence

  // --- Faïences (murs Nord et Est jusqu'à 2.10, pourtour bain) ---
  add(fai,
    box(0.35, 0, 0.34, 3.13, 2.10, 0.34 + T, k.tile),               // mur Est complet : douche + crédence vasques
    box(0.34, 0, 0.35, 0.34 + T, 2.10, 1.744, k.tile),               // pignon Nord : douche jusqu'à la fenêtre
    box(0.34, 0, 1.744, 0.34 + T, 0.90, 2.544, k.tile),              // sous l'allège de la fenêtre (derrière le tablier)
    box(0.34, 0, 2.544, 0.34 + T, 2.10, 2.68, k.tile),               // trumeau après la fenêtre
    box(0.35, 0, 2.68, 2.22, 2.10, 2.69, k.tile),                    // cloison bain / dressing
    box(2.22, 0, 2.186, 2.23, 2.10, 2.68, k.tile),                   // retour cloison dressing (alcôve bain)
  );

  // --- Douche extra-plate 90 x 120, paroi fixe, colonne ---
  add(g,
    box(0.35, 0, 0.35, 1.24, 0.03, 1.54, k.resin),                   // receveur résine
    box(0.39, 0.03, 0.44, 0.45, 0.033, 1.46, k.inox),                // caniveau linéaire
    box(0.36, 0.03, 1.534, 1.18, 2.00, 1.542, k.glass),              // paroi verre fixe (côté baignoire)
    box(0.35, 0.03, 1.528, 0.368, 2.00, 1.548, k.chrome),            // profilé mural
    box(0.36, 0.03, 1.530, 1.18, 0.045, 1.546, k.chrome),            // profilé bas
    tube([1.10, 1.98, 1.538], [1.10, 1.98, 0.35], 0.008, k.chrome, 10), // barre de stabilisation
  );
  // colonne thermostatique sur le mur Est
  const cx = 0.79, zw = 0.35;
  add(g,
    tube([0.61, 1.05, 0.405], [0.97, 1.05, 0.405], 0.028, k.chrome, 20),
    tube([0.66, 1.05, zw], [0.66, 1.05, 0.40], 0.011, k.chrome, 10),
    tube([0.92, 1.05, zw], [0.92, 1.05, 0.40], 0.011, k.chrome, 10),
    discX(1.05, 0.405, 0.585, 0.61, 0.033, k.chrome),
    discX(1.05, 0.405, 0.97, 0.995, 0.033, k.chrome),
    tube([cx, 1.07, 0.405], [cx, 2.03, 0.405], 0.011, k.chrome, 12),
    tube([cx, 1.86, zw], [cx, 1.86, 0.405], 0.008, k.chrome, 8),
    tube([cx, 2.03, 0.405], [cx, 2.03, 0.70], 0.011, k.chrome, 12),
    cylinderY(cx, 0.70, 2.005, 2.02, 0.125, k.chrome, 40),         // pomme de tête Ø 25
    tube([cx + 0.07, 1.30, 0.42], [cx + 0.07, 1.50, 0.425], 0.014, k.chrome, 12),   // douchette
    cylinderY(cx + 0.07, 0.425, 1.50, 1.53, 0.035, k.chrome, 20),
    box(0.36, 1.24, 0.35, 0.62, 1.252, 0.47, k.inox),                // tablette d'angle
    cylinderY(0.42, 0.41, 1.252, 1.44, 0.026, k.towelWhite, 14),     // flacons
    cylinderY(0.49, 0.42, 1.252, 1.40, 0.024, k.sage, 14),
    cylinderY(0.56, 0.41, 1.252, 1.37, 0.028, k.potGrey, 14),
  );

  // --- Baignoire encastrée, tablier carrelé + plage côté cloison ---
  const tubOut = [0.42, 2.00, 1.92, 2.62, 0.22];
  const tubIn = [0.48, 2.06, 1.86, 2.56, 0.18];
  add(g,
    rrRing([0.35, 1.944, 1.986, 2.68, 0.005], tubOut, 0, 0.55, k.tile),   // tablier + plage carrelés
    rrRing(tubOut, tubIn, 0.14, 0.56, k.ceram),                            // cuve acrylique
    shapeY(rrShape(...tubIn), 0.10, 0.16, k.ceram),                        // fond de cuve
    cylinderY(0.62, 2.31, 0.16, 0.166, 0.03, k.chrome, 20),                // bonde
    box(1.986, 0, 1.944, 2.22, 0.55, 2.68, k.tile),                        // plage carrelée
    // bec mural + mitigeur sur la cloison
    tube([0.80, 0.74, 2.68], [0.80, 0.74, 2.50], 0.014, k.chrome, 14),
    discZ(0.80, 0.74, 2.67, 2.68, 0.032, k.chrome),
    discZ(1.00, 0.74, 2.64, 2.68, 0.026, k.chrome),
    tube([1.00, 0.74, 2.645], [1.06, 0.765, 2.645], 0.006, k.chrome, 8),
  );
  // plage : serviettes roulées, bougie, plante
  add(g,
    discX(0.605, 2.07, 2.00, 2.20, 0.055, k.towelWhite),
    discX(0.605, 2.20, 2.00, 2.20, 0.055, k.towelSage),
    discX(0.705, 2.135, 2.01, 2.19, 0.05, k.towelWhite),
    cylinderY(2.10, 2.40, 0.55, 0.63, 0.04, k.potWhite, 20),
    plant(2.10, 0.55, 2.58, { potR: 0.065, potH: 0.12, pot: 'pot', h: 0.22, spread: 0.08, n: 5, seed: 11, blob: 0.055 }),
  );

  // --- Meuble double vasque suspendu (chêne) ---
  const fz = 0.86;
  add(g,
    box(1.84, 0.30, 0.35, 3.12, 0.76, fz, k.oak),
    box(1.842, 0.302, fz, 3.118, 0.758, fz + 0.002, k.gap),           // ombre des joints de façade
  );
  for (const [xa, xb] of [[1.845, 2.476], [2.484, 3.115]]) {
    for (const [ya, yb] of [[0.305, 0.522], [0.530, 0.735]]) {
      add(g, box(xa, ya, fz + 0.002, xb, yb, fz + 0.022, k.oak));
      add(g, box(xa + 0.12, yb - 0.004, fz + 0.012, xb - 0.12, yb + 0.004, fz + 0.024, k.gap)); // prise de main
    }
  }
  add(g, box(1.83, 0.76, 0.35, 3.13, 0.79, 0.89, k.solid));           // plan en solid surface
  for (const vx of [2.13, 2.83]) {
    add(g,
      lathe([[0, 0], [0.10, 0], [0.16, 0.018], [0.195, 0.065], [0.205, 0.13], [0.193, 0.13], [0.183, 0.07], [0.15, 0.033], [0.09, 0.022], [0, 0.022]], vx, 0.79, 0.615, k.ceram, 40),
      cylinderY(vx, 0.615, 0.811, 0.815, 0.025, k.chrome, 20),
      // robinetterie murale
      tube([vx, 1.05, 0.35], [vx, 1.05, 0.53], 0.011, k.chrome, 12),
      discZ(vx, 1.05, 0.35, 0.358, 0.03, k.chrome),
      discZ(vx, 1.14, 0.35, 0.39, 0.02, k.chrome),
      tube([vx, 1.14, 0.385], [vx + 0.06, 1.15, 0.385], 0.005, k.chrome, 8),
      // miroir rond Ø 60 cerclé de chêne
      discZ(vx, 1.52, 0.35, 0.365, 0.31, k.oak, 48),
      discZ(vx, 1.52, 0.365, 0.371, 0.295, k.mirror, 48),
      // applique globe opale au-dessus
      discZ(vx, 1.96, 0.35, 0.36, 0.035, k.chrome),
      tube([vx, 1.96, 0.36], [vx, 1.96, 0.43], 0.007, k.chrome, 8),
    );
    const globe = meshOf(new THREE.SphereGeometry(0.06, 20, 14), k.opal, { cast: false });
    globe.position.set(vx, 1.96, 0.475);
    add(g, globe);
  }
  // accessoires sur le plan
  add(g,
    cylinderY(2.48, 0.45, 0.79, 0.92, 0.03, k.potWhite, 18),
    cylinderY(2.48, 0.45, 0.92, 0.94, 0.012, k.chrome, 10),
    plant(1.93, 0.79, 0.47, { potR: 0.05, potH: 0.09, pot: 'potGrey', h: 0.16, spread: 0.05, n: 4, seed: 5, blob: 0.045 }),
  );

  // --- Sèche-serviettes sur la cloison x = 3.13 (z 1.27-1.73) ---
  const xr0 = 3.075, xr1 = 3.095;
  add(g,
    box(3.07, 0.30, 1.27, 3.10, 1.50, 1.30, k.anth),
    box(3.07, 0.30, 1.70, 3.10, 1.50, 1.73, k.anth),
  );
  for (const yb of [0.38, 1.40]) for (const zb of [1.285, 1.715]) add(g, box(3.10, yb, zb - 0.01, 3.13, yb + 0.02, zb + 0.01, k.anth));
  for (let i = 0; i < 16; i++) {
    const y = 0.36 + i * 0.07;
    add(g, box(xr0, y, 1.30, xr1, y + 0.02, 1.70, k.anth));
  }
  // serviette sauge drapée sur le barreau y 1.27
  add(g,
    box(3.058, 0.86, 1.36, 3.072, 1.31, 1.64, k.towelSage),
    box(3.097, 1.04, 1.36, 3.11, 1.31, 1.64, k.towelSage),
    box(3.058, 1.29, 1.36, 3.11, 1.312, 1.64, k.towelSage),
  );

  // --- Tapis de bain devant la douche ---
  add(g, box(1.34, 0, 0.98, 1.94, 0.012, 1.52, M('tapisBain', { color: '#ffffff', map: rugTexture('bain', 0.6, 0.54), roughness: 1 })));
  return g;
}

// ---------------------------------------------------------------------------
// WC + alcôve sous escalier + niche basse
// ---------------------------------------------------------------------------
function wc(fai, str) {
  const k = mats();
  const g = grp('wc-mobilier', 'rdc', 'mobilier');

  // --- Coffrage placo du bâti-support (structure), faïence en façade ---
  add(str, box(3.20, 0, 1.31, 3.40, 1.10, 2.186, k.placo));
  add(fai,
    box(3.40, 0, 1.31, 3.41, 1.10, 2.186, k.tile),
    box(3.20, 0, 1.30, 3.41, 1.10, 1.31, k.tile),                       // retour côté alcôve
    box(3.35, 0.80, 0.34, 3.95, 1.40, 0.35, k.tile),                    // crédence du lave-mains (sous l'appui)
  );
  add(g, box(3.20, 1.10, 1.30, 3.43, 1.13, 2.186, k.oak));             // tablette chêne sur coffrage

  // --- Cuvette suspendue (abattant fermé) ---
  const zc = 1.745;
  add(g,
    shapeY(dShape(3.41, 3.78, zc, 0.28), 0.25, 0.31, k.ceram, 20),
    shapeY(dShape(3.41, 3.84, zc, 0.36), 0.31, 0.385, k.ceram, 20),
    shapeY(dShape(3.43, 3.845, zc, 0.36), 0.385, 0.40, k.ceram, 20),    // abattant
    shapeY(dShape(3.45, 3.84, zc, 0.345), 0.40, 0.414, k.ceram, 20),
    box(3.41, 0.392, zc - 0.13, 3.44, 0.41, zc - 0.09, k.chrome),       // charnières
    box(3.41, 0.392, zc + 0.09, 3.44, 0.41, zc + 0.13, k.chrome),
  );
  // plaque de commande double touche (anthracite / inox)
  add(g,
    box(3.41, 0.86, zc - 0.125, 3.417, 1.02, zc + 0.125, k.anth),
    box(3.417, 0.90, zc - 0.10, 3.421, 0.98, zc - 0.005, k.inox),
    box(3.417, 0.90, zc + 0.005, 3.421, 0.98, zc + 0.10, k.inox),
  );
  // dérouleur sur la cloison (z = 2.186) + rouleau
  add(g,
    box(3.62, 0.665, 2.11, 3.635, 0.695, 2.186, k.chrome),
    discX(0.68, 2.12, 3.635, 3.755, 0.006, k.chrome),
    discX(0.68, 2.12, 3.64, 3.745, 0.056, k.paper),
  );
  // balai
  add(g,
    lathe([[0, 0], [0.045, 0], [0.047, 0.30], [0.043, 0.30], [0, 0.29]], 3.51, 0, 2.09, k.potWhite, 24),
    tube([3.51, 0.29, 2.09], [3.51, 0.44, 2.09], 0.009, k.anth, 10),
  );
  // tablette : cadre posé, plante, rouleaux, diffuseur
  const frame = new THREE.Group();
  frame.add(box(-0.0125, 0, -0.17, 0.0125, 0.46, 0.17, k.oak));
  frame.add(box(0.0125, 0.035, -0.135, 0.016, 0.425, 0.135, M('artWc', { color: '#ffffff', map: artTexture('abstrait', 0.27, 0.39), roughness: 0.9 })));
  frame.position.set(3.255, 1.13, 1.93);
  frame.rotation.z = 0.075;
  add(g, frame);
  add(g,
    plant(3.31, 1.13, 1.50, { potR: 0.055, potH: 0.10, pot: 'pot', h: 0.20, spread: 0.06, n: 5, seed: 23, blob: 0.05 }),
    cylinderY(3.30, 2.10, 1.13, 1.23, 0.055, k.paper, 20),
    cylinderY(3.30, 2.10, 1.23, 1.33, 0.055, k.paper, 20),
    cylinderY(3.30, 1.68, 1.13, 1.23, 0.032, k.amber, 16),
  );
  for (let i = 0; i < 5; i++) add(g, tube([3.30, 1.22, 1.68], [3.27 + i * 0.015, 1.42, 1.66 + (i % 2) * 0.03], 0.0025, k.trunk, 4));

  // --- Lave-mains compact dans l'alcôve, contre le mur Est (fenêtre au-dessus, allège 1.40) ---
  const lo = [3.46, 0.35, 3.84, 0.57, 0.02], li = [3.49, 0.38, 3.81, 0.54, 0.035];
  add(g,
    rrRing(lo, li, 0.70, 0.85, k.ceram),
    shapeY(rrShape(...li), 0.70, 0.765, k.ceram),
    cylinderY(3.65, 0.46, 0.765, 0.768, 0.018, k.chrome, 16),
    box(3.48, 0.42, 0.35, 3.82, 0.69, 0.55, k.oak),                         // petit meuble chêne suspendu
    box(3.48, 0.555, 0.55, 3.82, 0.559, 0.553, k.gap),
    // robinet mural
    tube([3.65, 0.95, 0.35], [3.65, 0.95, 0.45], 0.009, k.chrome, 10),
    discZ(3.65, 0.95, 0.35, 0.357, 0.024, k.chrome),
    discZ(3.65, 1.02, 0.35, 0.38, 0.017, k.chrome),
    tube([3.65, 1.02, 0.378], [3.70, 1.025, 0.378], 0.005, k.chrome, 8),
    cylinderY(3.535, 0.37, 0.85, 0.95, 0.025, k.potWhite, 16),            // savon liquide
    cylinderY(3.535, 0.37, 0.95, 0.975, 0.006, k.chrome, 8),
    // patère + essuie-mains
    discZ(3.29, 1.10, 0.34, 0.375, 0.012, k.chrome, 12),
    box(3.22, 0.70, 0.358, 3.36, 1.09, 0.374, k.towelWhite),
  );

  // --- Niche basse sous les marches (x 4.07-5.27) : étagère chêne + paniers ---
  const sx0 = 4.12, sx1 = 4.46;
  add(g,
    box(sx0, 0, 0.42, sx1, 1.10, 0.44, k.oak),
    box(sx0, 0, 1.14, sx1, 1.10, 1.16, k.oak),
  );
  for (const y of [0.04, 0.40, 0.76, 1.08]) add(g, box(sx0, y, 0.44, sx1, y + 0.02, 1.14, k.oak));
  for (const [za, zb] of [[0.46, 0.78], [0.80, 1.12]]) {
    add(g, rbox(sx0 + 0.02, 0.06, za, sx1 - 0.03, 0.31, zb, 0.02, k.rattan, 2));
  }
  const r = rng(5);
  stack(g, sx0 + 0.04, 0.48, sx1 - 0.05, 0.76, 0.42, 4, r, [k.towelWhite, k.towelSage, k.linen]);
  stack(g, sx0 + 0.04, 0.82, sx1 - 0.05, 1.10, 0.42, 3, r, [k.towelWhite, k.sand]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) add(g, cylinderY(sx0 + 0.10 + j * 0.13, 0.55 + i * 0.12, 0.78, 0.88, 0.055, k.paper, 18));
  add(g, rbox(sx0 + 0.03, 0.78, 0.93, sx1 - 0.04, 0.95, 1.12, 0.01, k.linen, 2));
  // boîtes de rangement au fond de la niche
  add(g,
    rbox(4.62, 0, 0.46, 5.00, 0.30, 0.80, 0.015, k.linen, 2),
    rbox(4.62, 0, 0.84, 5.00, 0.30, 1.16, 0.015, k.sand, 2),
  );
  return g;
}

// ---------------------------------------------------------------------------
// DÉGAGEMENT : console + miroir sur le mur B, tapis de couloir
// ---------------------------------------------------------------------------
function degagement() {
  const k = mats();
  const g = grp('degagement-mobilier', 'rdc', 'mobilier');
  const zw = 2.186;
  // console : plateau chêne sur piétement acier fin RAL 7016 (écho de l'escalier)
  add(g, box(5.34, 0.79, 1.965, 6.02, 0.82, zw - 0.004, k.oak));
  for (const x of [5.355, 5.99]) {
    for (const z of [1.975, 2.163]) add(g, box(x, 0, z, x + 0.015, 0.79, z + 0.015, k.anth));
    add(g, box(x, 0.10, 1.975, x + 0.015, 0.115, 2.178, k.anth));
    add(g, box(x, 0.775, 1.975, x + 0.015, 0.79, 2.178, k.anth));
  }
  add(g, box(5.37, 0.115, 1.98, 5.99, 0.135, 2.17, k.oak));            // tablette basse
  add(g, rbox(5.42, 0.135, 1.995, 5.78, 0.32, 2.165, 0.02, k.rattan, 2));
  // objets
  add(g,
    box(5.42, 0.82, 2.03, 5.66, 0.85, 2.16, k.sand),
    box(5.44, 0.85, 2.04, 5.64, 0.875, 2.15, k.blueGrey),
    lathe([[0, 0], [0.045, 0], [0.085, 0.045], [0.08, 0.045], [0.04, 0.008], [0, 0.008]], 5.79, 0.82, 2.08, k.potGrey, 28),
    lathe([[0, 0], [0.05, 0], [0.065, 0.10], [0.05, 0.22], [0.02, 0.27], [0.016, 0.27], [0.012, 0.25], [0, 0.25]], 5.93, 0.82, 2.10, k.potWhite, 28),
  );
  for (let i = 0; i < 4; i++) {
    const a = -0.5 + i * 0.33;
    add(g, tube([5.93, 1.07, 2.10], [5.93 + Math.sin(a) * 0.16, 1.48 + (i % 2) * 0.08, 2.10 - 0.03 + i * 0.012], 0.004, k.trunk, 5));
  }
  // miroir rond Ø 60, cerclage acier
  add(g,
    discZ(5.68, 1.48, zw - 0.012, zw, 0.31, k.anth, 48),           // reste derrière le plan de coupe z = 2.17
    discZ(5.68, 1.48, zw - 0.0155, zw - 0.006, 0.296, k.mirror, 48),
  );
  // tapis de couloir 0.55 x 1.50
  add(g, box(5.42, 0, 1.38, 6.92, 0.010, 1.93, M('runner', { color: '#ffffff', map: rugTexture('runner', 1.5, 0.55), roughness: 1 })));
  return g;
}

// ---------------------------------------------------------------------------
// SAS : paillasson, banc-coffre à chaussures (mur Ouest), patères, plante
// ---------------------------------------------------------------------------
function sas() {
  const k = mats();
  const g = grp('sas-mobilier', 'rdc', 'mobilier');
  // paillasson coco encastré visuellement devant la porte d'entrée
  add(g, box(7.42, 0, 0.36, 8.08, 0.012, 0.92, M('coco', { color: '#ffffff', map: rugTexture('coco', 0.66, 0.56), roughness: 1 })));

  // banc à chaussures contre le mur Ouest (z = 3.16) : 3 casiers ouverts, assise + coussin
  const x0 = 7.08, x1 = 7.98, z0 = 2.80, z1 = 3.15;
  add(g,
    box(x0 + 0.02, 0, z0 + 0.04, x1 - 0.02, 0.06, z1, k.gap),                  // socle en retrait
    box(x0, 0.06, z0, x1, 0.08, z1, k.oak),
    box(x0, 0.24, z0, x1, 0.26, z1, k.oak),
    box(x0, 0.42, z0 - 0.01, x1, 0.45, z1, k.oak),                              // assise
    box(x0, 0.08, z1 - 0.012, x1, 0.42, z1, k.oak),                             // dos
  );
  for (const x of [x0, 7.37, 7.67, x1 - 0.02]) add(g, box(x, 0.08, z0, x + 0.02, 0.42, z1, k.oak));
  add(g, rbox(x0 + 0.02, 0.45, z0 + 0.01, x1 - 0.02, 0.51, z1 - 0.01, 0.02, k.sage, 3));
  const zc = (z0 + z1) / 2;
  shoes(g, x0 + 0.04, 0.08, zc, k.towelWhite, k.potGrey, -1);
  shoes(g, 7.41, 0.08, zc, M('cuir', { color: '#8a5a3b', roughness: 0.55 }), k.gap, -1);
  shoes(g, 7.71, 0.08, zc, k.blueGrey, k.towelWhite, -1);
  shoes(g, x0 + 0.04, 0.26, zc, M('cuirNoir', { color: '#2b2a29', roughness: 0.5 }), k.gap, -1);
  shoes(g, 7.71, 0.26, zc, k.sand, k.oakDark, -1);
  add(g, rbox(7.41, 0.26, z0 + 0.03, 7.65, 0.41, z1 - 0.02, 0.02, k.rattan, 2));   // panier (bonnets, gants)

  // patères au-dessus du banc, sur le trumeau du mur Ouest (x 7.03-7.49, avant le châssis fixe)
  add(g, box(7.06, 1.66, 3.142, 7.46, 1.76, 3.16, k.oak));
  for (const x of [7.24, 7.42]) add(g, discZ(x, 1.71, 3.085, 3.142, 0.011, k.anth, 12));
  // sac cabas en lin (patère 1) + écharpe (patère 2) : silhouettes fines, la vue int-degagement reste dégagée
  add(g,
    rbox(7.11, 1.08, 3.096, 7.37, 1.46, 3.140, 0.012, k.linen, 2),
    tube([7.15, 1.455, 3.118], [7.24, 1.70, 3.10], 0.006, k.linen, 6),
    tube([7.33, 1.455, 3.118], [7.24, 1.70, 3.10], 0.006, k.linen, 6),
    box(7.395, 1.02, 3.062, 7.445, 1.69, 3.074, k.terra),                         // écharpe
  );
  // plante (type strelitzia, ~1 m) dans l'angle Sud-Ouest, au bout du banc : hors du champ de la vue int-degagement
  add(g, bigPlant(8.13, 0, 3.00, { potR: 0.12, potH: 0.32, n: 9, seed: 41, aMin: Math.PI * 0.95, aMax: Math.PI * 1.5, stem: 0.42, leafLen: 0.30, leafW: 0.055 }));
  return g;
}

// ---------------------------------------------------------------------------
// CHAMBRE
// ---------------------------------------------------------------------------
function chambre() {
  const k = mats();
  const g = grp('chambre-mobilier', 'rdc', 'mobilier');
  const zw = 2.256;                 // face du mur B côté chambre
  const bx0 = 3.85, bx1 = 5.75;     // lit 180 x 200 (cadre 190), axe x = 4.80

  // tête de lit : panneau chêne + 3 coussins capitonnés lin
  add(g, box(bx0, 0, zw + 0.004, bx1, 1.10, zw + 0.034, k.oak));
  for (let i = 0; i < 3; i++) {
    const a = bx0 + 0.03 + i * ((bx1 - bx0 - 0.06) / 3), b = a + (bx1 - bx0 - 0.06) / 3 - 0.01;
    add(g, rbox(a, 0.50, zw + 0.034, b, 1.07, zw + 0.10, 0.035, k.sand, 3));
  }
  // sommier / cadre chêne, socle en retrait
  add(g,
    box(3.98, 0, 2.45, 5.62, 0.10, 4.26, k.gap),
    box(bx0 + 0.01, 0.10, zw + 0.034, bx1 - 0.01, 0.32, 4.40, k.oak),
    rbox(3.90, 0.32, 2.37, 5.70, 0.54, 4.37, 0.03, k.sheet, 3),                 // matelas 180 + drap
    rbox(bx0, 0.42, 2.95, bx1, 0.585, 4.43, 0.04, k.linenWhite, 3),              // couette
    rbox(bx0 - 0.005, 0.55, 2.95, bx1 + 0.005, 0.605, 3.20, 0.02, k.linen, 3),   // revers
    rbox(bx0 - 0.012, 0.40, 3.86, bx1 + 0.012, 0.612, 4.25, 0.015, k.terra, 2),  // plaid
  );
  // oreillers
  add(g,
    rbox(3.97, 0.54, 2.38, 4.77, 0.86, 2.53, 0.06, k.linenWhite, 3),
    rbox(4.83, 0.54, 2.38, 5.63, 0.86, 2.53, 0.06, k.linenWhite, 3),
    rbox(4.00, 0.54, 2.52, 4.74, 0.72, 2.72, 0.06, k.linen, 3),
    rbox(4.86, 0.54, 2.52, 5.60, 0.72, 2.72, 0.06, k.linen, 3),
    rbox(4.56, 0.55, 2.72, 5.04, 0.78, 2.85, 0.05, k.sage, 3),
  );
  // chevets chêne sur pieds + lampes
  const chevet = (x0, z0, w = 0.40) => {
    const x1 = x0 + w, z1 = z0 + 0.38;
    for (const [lx, lz] of [[x0 + 0.03, z0 + 0.03], [x1 - 0.05, z0 + 0.03], [x0 + 0.03, z1 - 0.05], [x1 - 0.05, z1 - 0.05]]) add(g, box(lx, 0, lz, lx + 0.02, 0.20, lz + 0.02, k.oak));
    add(g,
      box(x0, 0.20, z0, x1, 0.50, z1, k.oak),
      box(x0 + 0.01, 0.235, z1, x1 - 0.01, 0.465, z1 + 0.002, k.gap),
      box(x0 + 0.012, 0.237, z1 + 0.002, x1 - 0.012, 0.463, z1 + 0.016, k.oak),
      box(x0 + 0.17, 0.43, z1 + 0.016, x1 - 0.17, 0.44, z1 + 0.026, k.anth),
    );
  };
  chevet(3.41, 2.32);              // reste hors du rail de la coulissante SdB (z <= 2.30)
  chevet(5.79, 2.30, 0.34);        // s'arrête avant la baie de la porte chambre (x 6.13)
  add(g, tableLamp(3.61, 0.50, 2.50, k.potWhite), tableLamp(5.97, 0.50, 2.48, M('ceramBleu', { color: '#9eb0b5', roughness: 0.35 })));
  add(g,
    box(3.44, 0.50, 2.38, 3.57, 0.53, 2.58, k.blueGrey),          // livre
    box(5.81, 0.50, 2.36, 5.89, 0.52, 2.52, k.ochre),
  );
  // tableau au-dessus du lit
  add(g,
    box(4.35, 1.36, zw, 5.25, 1.96, zw + 0.03, k.oak),
    box(4.375, 1.385, zw + 0.03, 5.225, 1.935, zw + 0.033, M('artLit', { color: '#ffffff', map: artTexture('paysage', 0.85, 0.55), roughness: 0.9 })),
  );
  // tapis laine sous les 2/3 du lit
  add(g, box(3.62, 0, 3.05, 6.06, 0.012, 4.72, M('tapisChambre', { color: '#ffffff', map: rugTexture('chambre', 2.44, 1.67), roughness: 1 })));

  // coin lecture (entre la porte SdB et l'accès dressing) : fauteuil orienté vers la baie + lampadaire
  const chair = new THREE.Group();
  const leg = (x, z) => chair.add(tube([x, 0, z], [x * 0.96, 0.20, z * 0.96], 0.016, k.oak, 10));
  leg(0.30, 0.31); leg(0.30, -0.31); leg(-0.32, 0.31); leg(-0.32, -0.31);
  chair.add(box(-0.37, 0.18, -0.37, 0.36, 0.25, 0.37, k.oak));
  chair.add(rbox(-0.30, 0.25, -0.31, 0.38, 0.41, 0.31, 0.045, k.boucle, 3));
  chair.add(rbox(-0.38, 0.25, -0.40, 0.36, 0.58, -0.30, 0.04, k.boucle, 3));
  chair.add(rbox(-0.38, 0.25, 0.30, 0.36, 0.58, 0.40, 0.04, k.boucle, 3));
  const back = new THREE.Group();
  back.add(rbox(-0.08, 0, -0.30, 0.08, 0.56, 0.30, 0.05, k.boucle, 3));
  back.position.set(-0.30, 0.28, 0);
  back.rotation.z = 0.20;
  chair.add(back);
  chair.add(rbox(-0.22, 0.41, -0.18, -0.10, 0.70, 0.18, 0.05, k.terra, 3));      // coussin
  chair.position.set(2.90, 0, 3.68);
  chair.rotation.y = -Math.PI / 4;           // assise tournée vers la baie Ouest (x+, z+)
  add(g, chair);
  add(g,
    cylinderY(2.52, 3.02, 0, 0.025, 0.14, k.anth, 32),
    tube([2.52, 0.025, 3.02], [2.52, 1.42, 3.02], 0.011, k.anth, 10),
    lathe([[0.21, 0], [0.18, 0.26], [0.174, 0.26], [0.204, 0], [0.21, 0]], 2.52, 1.36, 3.02, k.shade, 36),
  );
  // banc chêne + coussin contre le pignon Sud (entre porte chambre ouverte et porte-fenêtre)
  add(g,
    box(6.58, 0.40, 3.14, 6.94, 0.44, 3.98, k.oak),
    box(6.60, 0, 3.17, 6.92, 0.40, 3.20, k.oak),
    box(6.60, 0, 3.92, 6.92, 0.40, 3.95, k.oak),
    rbox(6.60, 0.44, 3.17, 6.92, 0.50, 3.95, 0.02, k.linen, 3),
    rbox(6.62, 0, 3.42, 6.90, 0.25, 3.76, 0.02, k.rattan, 2),
    rbox(6.64, 0.50, 3.70, 6.90, 0.56, 3.92, 0.01, k.ochre, 2),
  );
  // rideaux lin (ouverts, en tas de part et d'autre de la baie)
  add(g, tube([3.92, 2.33, 4.855], [6.82, 2.33, 4.855], 0.010, k.anth, 10));
  for (const x of [3.94, 6.80]) add(g, box(x - 0.01, 2.31, 4.855, x + 0.01, 2.35, 4.91, k.anth));
  const curtain = (xa, xb) => {
    const front = [], backPts = [];
    const n = Math.round((xb - xa) / 0.02);
    for (let i = 0; i <= n; i++) {
      const x = xa + (xb - xa) * i / n;
      const zf = 4.815 + 0.032 * Math.sin((x - xa) / 0.11 * Math.PI * 2);
      front.push([x, zf]); backPts.push([x, zf + 0.022]);
    }
    return [...front, ...backPts.reverse()];
  };
  add(g, prismY(curtain(3.96, 4.42), 0.015, 2.31, k.curtain), prismY(curtain(6.33, 6.79), 0.015, 2.31, k.curtain));
  return g;
}

// ---------------------------------------------------------------------------
// DRESSING en L : pignon Nord (x = 0.34) + cloison bain (z = 2.76)
// ---------------------------------------------------------------------------
function dressing() {
  const k = mats();
  const g = grp('dressing-mobilier', 'rdc', 'mobilier');
  const TOP = 2.38;
  const r = rng(77);
  const pal = ['#f3f0ea', '#e2d8c6', '#2f3e55', '#c8b79b', '#9aa892', '#b9775b', '#4a4c4f', '#5a7090', '#a87c52', '#b8b8b4', '#e9e4dc', '#d6b9a9'];
  const cloth = pal.map((c, i) => k.fab('vet' + i, c));
  const pick = () => cloth[(r() * cloth.length) | 0];
  const hanger = k.oak;

  // ---- bras Nord : x 0.34-0.92, z 2.76-4.88 (façades vers +x) ----
  const NX0 = 0.34, NX1 = 0.92;
  for (const z of [3.34, 4.10, 4.86]) add(g, box(NX0, 0, z, NX1, TOP, z + 0.02, k.white));
  add(g,
    box(NX0, TOP - 0.02, 2.76, NX1, TOP, 4.88, k.white),
    box(NX0, 0, 2.76, NX1, TOP - 0.02, 3.34, k.white),                 // angle mort fermé
    box(NX0, 0, 3.36, NX1 - 0.03, 0.08, 4.86, k.gap),
    box(NX0, 0.08, 3.36, NX1, 0.10, 4.86, k.white),
  );
  // N1 : penderie longue (robes, manteaux)
  add(g,
    box(NX0, 1.98, 3.36, NX1, 2.00, 4.10, k.oak),
    tube([0.63, 1.90, 3.36], [0.63, 1.90, 4.10], 0.011, k.chrome, 10),
    rbox(0.40, 2.00, 3.40, 0.88, 2.25, 3.72, 0.015, k.linen, 2),
    rbox(0.40, 2.00, 3.76, 0.88, 2.22, 4.06, 0.015, k.rattan, 2),
  );
  for (let i = 0; i < 12; i++) {
    const z = 3.41 + i * 0.056;
    garment(g, true, 0.63, z, 1.90, 0.85 + r() * 0.42, 0.44, 0.03 + r() * 0.012, pick(), hanger);
  }
  // N2 : tiroirs + étagères (linge plié)
  for (const [ya, yb] of [[0.11, 0.29], [0.296, 0.476], [0.482, 0.662], [0.668, 0.848]]) {
    add(g, box(NX1, ya, 4.125, NX1 + 0.02, yb, 4.855, k.oak));
    add(g, box(NX1 + 0.02, (ya + yb) / 2 - 0.006, 4.40, NX1 + 0.03, (ya + yb) / 2 + 0.006, 4.58, k.anth));
  }
  for (const y of [0.85, 1.22, 1.55, 1.92]) {   // aucune tablette à cheval sur la coupe y = 1.60 (axo)
    add(g, box(NX0, y, 4.12, NX1, y + 0.02, 4.86, k.oak));
    stack(g, 0.42, 4.16, 0.86, 4.46, y + 0.02, 3 + ((r() * 3) | 0), r, cloth);
    if (y < 1.9) stack(g, 0.42, 4.52, 0.86, 4.82, y + 0.02, 2 + ((r() * 4) | 0), r, cloth);
    else add(g, rbox(0.42, y + 0.02, 4.52, 0.86, y + 0.24, 4.82, 0.015, k.rattan, 2));
  }

  // ---- bras Sud (contre la cloison bain z = 2.76) : x 0.92-2.22 (façades vers +z) ----
  const ZZ0 = 2.76, ZZ1 = 3.34;
  for (const x of [0.92, 1.60, 2.20]) add(g, box(x, 0, ZZ0, x + 0.02, TOP, ZZ1, k.white));
  add(g,
    box(0.92, TOP - 0.02, ZZ0, 2.22, TOP, ZZ1, k.white),
    box(0.94, 0, ZZ0, 2.20, 0.08, ZZ1 - 0.03, k.gap),
    box(0.92, 0.08, ZZ0, 2.22, 0.10, ZZ1, k.white),
  );
  // A : double penderie (chemises / pantalons)
  add(g,
    box(0.94, 2.08, ZZ0, 1.60, 2.10, ZZ1, k.oak),
    tube([0.94, 2.00, 3.05], [1.60, 2.00, 3.05], 0.011, k.chrome, 10),
    tube([0.94, 1.10, 3.05], [1.60, 1.10, 3.05], 0.011, k.chrome, 10),
    rbox(0.98, 2.10, 2.82, 1.56, 2.30, 3.28, 0.015, k.linen, 2),
  );
  for (let i = 0; i < 11; i++) {
    const x = 0.99 + i * 0.054;
    garment(g, false, x, 3.05, 2.00, 0.66 + r() * 0.12, 0.44, 0.028, pick(), hanger);
    if (i < 10) garment(g, false, x + 0.02, 3.05, 1.10, 0.55 + r() * 0.12, 0.40, 0.03, pick(), hanger);
  }
  // B : chaussures en bas, étagères au-dessus
  for (const y of [0.34, 0.60, 0.95, 1.30, 1.65, 2.00]) add(g, box(1.62, y, ZZ0, 2.20, y + 0.02, ZZ1, k.oak));
  const shoeCols = [k.towelWhite, M('cuirD', { color: '#6f4a33', roughness: 0.5 }), M('noirD', { color: '#252423', roughness: 0.5 }), k.sand, k.rose, k.blueGrey];
  shoes(g, 1.65, 0.10, 3.06, shoeCols[0], k.potGrey, 1);
  shoes(g, 1.92, 0.10, 3.06, shoeCols[1], k.gap, 1, 'botte');
  shoes(g, 1.65, 0.36, 3.06, shoeCols[2], k.gap, 1);
  shoes(g, 1.92, 0.36, 3.06, shoeCols[3], k.oakDark, 1);
  shoes(g, 1.65, 0.62, 3.06, shoeCols[4], k.towelWhite, 1);
  shoes(g, 1.92, 0.62, 3.06, shoeCols[5], k.towelWhite, 1);
  for (const y of [0.97, 1.32, 1.67]) {
    stack(g, 1.65, 2.82, 1.90, 3.26, y, 3 + ((r() * 3) | 0), r, cloth);
    stack(g, 1.93, 2.82, 2.17, 3.26, y, 2 + ((r() * 3) | 0), r, cloth);
  }
  add(g, rbox(1.65, 2.02, 2.82, 2.17, 2.26, 3.28, 0.015, k.rattan, 2));

  // pouf (hors débattement de la porte-fenêtre) + miroir sur pied appuyé contre la cloison
  add(g, lathe([[0, 0], [0.20, 0], [0.222, 0.025], [0.23, 0.20], [0.222, 0.385], [0.20, 0.41], [0, 0.41]], 1.55, 0, 3.68, k.rose, 36));
  const psy = new THREE.Group();
  psy.add(
    box(0, 0, -0.25, 0.025, 1.70, -0.22, k.oak), box(0, 0, 0.22, 0.025, 1.70, 0.25, k.oak),
    box(0, 1.67, -0.22, 0.025, 1.70, 0.22, k.oak), box(0, 0, -0.22, 0.025, 0.03, 0.22, k.oak),
    box(0.006, 0.03, -0.22, 0.02, 1.67, 0.22, k.mirrorTall),
  );
  psy.position.set(2.02, 0, 3.80);
  psy.rotation.z = -0.105;
  add(g, psy);
  return g;
}

// ---------------------------------------------------------------------------
export function buildFurnitureRdc() {
  const root = grp('mobilier-rdc', 'rdc', 'mobilier');
  const fai = grp('faiences-rdc', 'rdc', 'structure');       // finitions murales : restent visibles sans mobilier
  const str = grp('coffrages-rdc', 'rdc', 'structure');      // coffrage placo du bâti WC
  add(root, salleDeBains(fai), wc(fai, str), degagement(), sas(), chambre(), dressing());
  add(root, fai, str);
  return root;
}
