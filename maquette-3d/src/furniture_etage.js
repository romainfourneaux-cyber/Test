// Mobilier de l'étage : chambre 1, chambre 2 (bureau dans l'alcôve), palier.
// Style : contemporain sobre — chêne clair, blanc, lin, touches de couleur douces (sauge, terracotta, ocre, bleu-gris).
// Tous les éléments sont des volumes fermés (box, rounded box, lathe fermé, extrusions) pour un poché propre en coupe.
// Repère : voir spec.js (x vers le sud, z vers l'ouest, y = 2.60 sol fini étage).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { box, prismY, cylinderY, tube, grp, add, mat, cappedMaterial } from './core.js';
import { LV, rampant } from './spec.js';

const Y0 = LV.slabTop; // sol fini étage (2.60)
const HAS_DOM = typeof document !== 'undefined';

// ---------------------------------------------------------------------------
// Matériaux locaux (tissus, céramiques, végétal…)
// ---------------------------------------------------------------------------
let M = null;
function mats() {
  if (M) return M;
  const C = (color, roughness, cap, extra = {}) => cappedMaterial({ color, roughness, ...extra }, cap);
  M = {
    drap: C('#f3f0ea', 0.95, '#d8d2c6'),           // linge de lit blanc lin
    drapGris: C('#e2ddd4', 0.95, '#c4bdb0'),       // retour de drap lin naturel
    lin: C('#d9cfbf', 0.97, '#b5aa98'),            // lin naturel (tête de lit ch. 1, rideaux)
    rideau: C('#ece6dc', 0.98, '#c9c0b2'),
    sauge: C('#a4af97', 0.95, '#7f8a73'),
    terracotta: C('#c69277', 0.95, '#9c6c55'),
    ocre: C('#d6b47e', 0.95, '#a98a5b'),
    bleuGris: C('#a7b4bd', 0.95, '#7f8d97'),
    bleuNuit: C('#5f6f7c', 0.9, '#45525c'),
    laine: C('#cfc6b7', 0.98, '#a89f90'),          // fauteuil bouclette
    socle: C('#3b3d3f', 0.7, '#222'),              // socles en retrait (ombre)
    ceramiqueMat: C('#ebe5da', 0.55, '#c8c0b2'),
    ceramiqueSauge: C('#b7bfa8', 0.5, '#8d967f'),
    terreCuite: C('#b98263', 0.85, '#8f5f45'),
    feuillage: C('#6d8458', 0.85, '#4b5e3c'),
    feuillageOlivier: C('#8a9a74', 0.85, '#617052'),
    tronc: C('#6b5a48', 0.9, '#4a3e32'),
    terreau: C('#4a3b2e', 1.0, '#33281f'),
    pampa: C('#e6d9bf', 1.0, '#bfae8c'),
    papier: C('#f4f1ea', 0.9, '#d9d3c7'),
    abatJour: C('#f1eadf', 0.9, '#cfc6b6', { emissive: '#ffd9a8', emissiveIntensity: 0.35 }),
    ampoule: mat('luminaire'),
    // miroir un peu plus clair que MAT.miroir (l'environnement de la scène est sombre)
    miroirClair: new THREE.MeshStandardMaterial({ color: '#d9e0e3', roughness: 0.12, metalness: 0.75, envMapIntensity: 2.2 }),
    livres: ['#c9b79c', '#8fa3b3', '#e6e0d4', '#b98b73', '#9aa98e', '#4a5054', '#d7c3a0'].map((c) => C(c, 0.8, '#777')),
  };
  return M;
}

// ---------------------------------------------------------------------------
// Primitives locales
// ---------------------------------------------------------------------------
const asMat = (m) => (typeof m === 'string' ? mat(m) : m);

function shadowed(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }

// Boîte à arêtes arrondies définie par ses coins (coussins, matelas, couettes…)
function rb(x0, y0, z0, x1, y1, z1, r, m, seg = 2) {
  const sx = x1 - x0, sy = y1 - y0, sz = z1 - z0;
  const rr = Math.max(0.002, Math.min(r, sx / 2 - 1e-4, sy / 2 - 1e-4, sz / 2 - 1e-4));
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(sx, sy, sz, seg, rr), asMat(m));
  mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return shadowed(mesh);
}
// Boîte arrondie par son centre, ses dimensions et une rotation (Euler XYZ)
function rbc([cx, cy, cz], [sx, sy, sz], r, m, [rx = 0, ry = 0, rz = 0] = [], seg = 2) {
  const rr = Math.max(0.002, Math.min(r, sx / 2 - 1e-4, sy / 2 - 1e-4, sz / 2 - 1e-4));
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(sx, sy, sz, seg, rr), asMat(m));
  mesh.position.set(cx, cy, cz);
  mesh.rotation.set(rx, ry, rz);
  return shadowed(mesh);
}
// Volume de révolution : profil fermé [[r,h],...] parcouru dans le sens trigonométrique (r à droite, h en haut)
function lathe(x, y, z, profile, m, seg = 24) {
  const g = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), seg);
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.position.set(x, y, z);
  return shadowed(mesh);
}
// Groupe orienté : contenu construit en repère local (avant = +z local), posé en (x, z) et tourné de rotY
function orient(x, z, rotY, ...children) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  children.forEach((c) => c && g.add(c));
  return g;
}
// Boule de feuillage organique (icosaèdre déformé, normales lissées)
function foliage(cx, cy, cz, r, m, seed = 1, squash = 1, detail = 2) {
  let g = new THREE.IcosahedronGeometry(r, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.16 * Math.sin(17 * x / r + seed) * Math.cos(13 * z / r + 2 * seed) + 0.08 * Math.sin(23 * y / r + 3 * seed);
    p.setXYZ(i, x * k, y * k * squash, z * k);
  }
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.position.set(cx, cy, cz);
  return shadowed(mesh);
}

// ---------------------------------------------------------------------------
// Textures procédurales (tapis, affiches)
// ---------------------------------------------------------------------------
function canvasTex(w, h, draw) {
  if (!HAS_DOM) return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function rand(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Tapis en laine : fond chiné + double filet en bordure
function rugTexture(lenU, lenV, { base, line, line2, seed = 3 }) {
  const ppm = 220; // pixels par mètre
  const W = Math.round(lenU * ppm), H = Math.round(lenV * ppm);
  return canvasTex(W, H, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    const r = rand(seed);
    for (let i = 0; i < W * H / 22; i++) {
      const v = r() < 0.5 ? 0 : 255;
      g.fillStyle = `rgba(${v},${v},${v},${0.035 + r() * 0.04})`;
      g.fillRect(r() * W, r() * H, 1 + r() * 3, 1);
    }
    const ring = (inset, wPx, col) => {
      g.strokeStyle = col; g.lineWidth = wPx;
      g.strokeRect(inset, inset, W - 2 * inset, H - 2 * inset);
    };
    ring(0.10 * ppm, 0.025 * ppm, line);
    ring(0.15 * ppm, 0.008 * ppm, line2 || line);
  });
}

// Affiche abstraite douce (pas de texte) : formes simples sur papier
function artTexture(seed, palette) {
  return canvasTex(512, 640, (g, W, H) => {
    g.fillStyle = '#f5f1e8'; g.fillRect(0, 0, W, H);
    const r = rand(seed);
    const [a, b, c] = palette;
    const m = 70; // passe-partout
    g.fillStyle = '#ece5d7'; g.fillRect(m, m, W - 2 * m, H - 2 * m);
    g.save(); g.beginPath(); g.rect(m, m, W - 2 * m, H - 2 * m); g.clip();
    if (seed % 3 === 0) {
      // arche + soleil
      g.fillStyle = a; g.beginPath();
      g.moveTo(m + 60, H - m); g.lineTo(m + 60, H * 0.52); g.arc(W / 2, H * 0.52, W / 2 - m - 60, Math.PI, 0); g.lineTo(W - m - 60, H - m); g.fill();
      g.fillStyle = b; g.beginPath(); g.arc(W * 0.62, H * 0.30, 46, 0, Math.PI * 2); g.fill();
      g.fillStyle = c; g.fillRect(m, H - m - 70, W - 2 * m, 70);
    } else if (seed % 3 === 1) {
      // collines superposées
      for (let k = 0; k < 3; k++) {
        g.fillStyle = [a, b, c][k];
        g.beginPath(); g.moveTo(m, H - m);
        const y0 = H * (0.45 + 0.13 * k);
        for (let x = m; x <= W - m; x += 8) g.lineTo(x, y0 + 30 * Math.sin((x / W) * (3 + k) + r() * 0.2 + k));
        g.lineTo(W - m, H - m); g.closePath(); g.fill();
      }
      g.fillStyle = '#f7f3ea'; g.beginPath(); g.arc(W * 0.35, H * 0.27, 40, 0, Math.PI * 2); g.fill();
    } else {
      // composition de demi-cercles et bandes
      g.fillStyle = a; g.beginPath(); g.arc(W / 2, H * 0.62, 150, Math.PI, 0); g.fill();
      g.fillStyle = b; g.beginPath(); g.arc(W / 2, H * 0.62, 150, 0, Math.PI); g.fill();
      g.fillStyle = c; g.fillRect(W * 0.30, H * 0.18, W * 0.40, 26);
      g.strokeStyle = '#4b4f52'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * 0.3, H * 0.86); g.lineTo(W * 0.7, H * 0.86); g.stroke();
    }
    g.restore();
  });
}

function rug(x0, z0, x1, z1, opts) {
  const t = rugTexture(x1 - x0, z1 - z0, opts);
  const m = cappedMaterial({ color: t ? '#ffffff' : opts.base, map: t, roughness: 1.0 }, opts.cap || '#9d9484');
  const g = new THREE.BoxGeometry(x1 - x0, 0.008, z1 - z0);
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set((x0 + x1) / 2, Y0 + 0.0005 + 0.004, (z0 + z1) / 2);
  mesh.receiveShadow = true; mesh.castShadow = false;
  return mesh;
}

// Cadre chêne + affiche, construit à plat (face avant vers +z local) puis plaqué contre un mur.
//   wall : 'x+' (mur x = plane, affiche tournée vers +x), 'x-', 'z+', 'z-' ; a = centre le long du mur, yc = centre vertical
function artFrame({ wall, plane, a, yc, w, h, seed, palette }) {
  const g = new THREE.Group();
  const d = 0.03, f = 0.022;
  // cadre : 4 baguettes
  g.add(box(-w / 2, -h / 2, 0, w / 2, -h / 2 + f, d, 'chene'), box(-w / 2, h / 2 - f, 0, w / 2, h / 2, d, 'chene'),
    box(-w / 2, -h / 2 + f, 0, -w / 2 + f, h / 2 - f, d, 'chene'), box(w / 2 - f, -h / 2 + f, 0, w / 2, h / 2 - f, d, 'chene'));
  const t = artTexture(seed, palette);
  const pm = cappedMaterial({ color: '#ffffff', map: t, roughness: 0.9 }, '#d9d3c7');
  const art = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * f, h - 2 * f, 0.012), pm);
  art.position.set(0, 0, 0.008);
  art.castShadow = true; art.receiveShadow = true;
  g.add(art);
  const o = new THREE.Group();
  o.add(g);
  if (wall === 'x+') { o.position.set(plane, yc, a); o.rotation.y = Math.PI / 2; }
  else if (wall === 'x-') { o.position.set(plane, yc, a); o.rotation.y = -Math.PI / 2; }
  else if (wall === 'z+') { o.position.set(a, yc, plane); }
  else { o.position.set(a, yc, plane); o.rotation.y = Math.PI; }
  return o;
}

// ---------------------------------------------------------------------------
// Meubles (repère local : largeur selon x centrée sur 0, profondeur selon z, avant vers +z)
// ---------------------------------------------------------------------------

// Lit (W = largeur du cadre : 1.46 pour 140, 1.86 pour 180) : tête de lit à z = 0, pied vers +z.
function bed({ W = 1.46, head = 'channel', headMat, headH = 1.06, baseMat = 'chene', throwMat, cushions = [] }) {
  const m = mats();
  const g = new THREE.Group();
  const hb = 0.07;                 // épaisseur tête de lit
  const L = 2.01;                  // longueur du sommier
  const zf = hb + L;               // pied du lit
  const hw = W / 2 + 0.02;
  // tête de lit
  if (head === 'channel') {
    const n = 5, gap = 0.006, cw = (2 * hw - (n - 1) * gap) / n;
    for (let i = 0; i < n; i++) {
      const xa = -hw + i * (cw + gap);
      g.add(rb(xa, Y0 + 0.04, 0.0, xa + cw, Y0 + headH, hb, 0.035, headMat));
    }
    g.add(box(-hw + 0.03, Y0, 0.01, hw - 0.03, Y0 + 0.05, hb - 0.02, m.socle));
  } else {
    g.add(rb(-hw, Y0 + 0.03, 0.0, hw, Y0 + headH, hb, 0.04, headMat, 3));
    g.add(box(-hw + 0.03, Y0, 0.01, hw - 0.03, Y0 + 0.04, hb - 0.02, m.socle));
  }
  // sommier (cadre) sur socle en retrait -> effet "flottant"
  g.add(box(-W / 2 + 0.14, Y0, hb + 0.15, W / 2 - 0.14, Y0 + 0.09, zf - 0.15, m.socle));
  g.add(rb(-W / 2, Y0 + 0.09, hb, W / 2, Y0 + 0.29, zf, 0.012, baseMat));
  // matelas + drap
  g.add(rb(-(W / 2 - 0.03), Y0 + 0.29, hb + 0.01, W / 2 - 0.03, Y0 + 0.51, hb + 0.01 + 2.0, 0.04, m.drap));
  // couette (retombe sur les côtés et au pied), revers de drap
  g.add(rb(-W / 2 - 0.012, Y0 + 0.27, 0.72, W / 2 + 0.012, Y0 + 0.565, zf + 0.015, 0.05, m.drap, 3));
  g.add(rb(-W / 2 - 0.016, Y0 + 0.50, 0.70, W / 2 + 0.016, Y0 + 0.59, 0.98, 0.035, m.drapGris, 3));
  // plaid en travers du pied de lit
  if (throwMat) g.add(rb(-W / 2 - 0.022, Y0 + 0.30, zf - 0.50, W / 2 + 0.022, Y0 + 0.582, zf - 0.08, 0.03, throwMat, 2));
  // oreillers 50x70 inclinés contre la tête de lit
  for (const s of [-1, 1]) {
    g.add(rbc([s * Math.max(0.35, W / 2 - 0.51), Y0 + 0.725, 0.235], [0.66, 0.46, 0.15], 0.065, m.drap, [-0.35, 0, 0], 3));
  }
  // coussins déco
  cushions.forEach(({ x, w = 0.45, h = 0.45, z = 0.41, y = 0.70, mat: cm, tilt = -0.28 }) => {
    g.add(rbc([x, Y0 + y, z], [w, h, 0.13], 0.055, cm, [tilt, 0, 0], 3));
  });
  return g;
}

// Table de chevet : caisson chêne + tiroir + niche ouverte. floating = suspendue (pas de pieds)
function nightstand({ w = 0.44, d = 0.38, h = 0.50, floating = false, front = 'blancLaque' }) {
  const m = mats();
  const g = new THREE.Group();
  const yb = floating ? Y0 + h - 0.22 : Y0 + 0.15;   // dessous du caisson
  const t = 0.018;
  g.add(
    box(-w / 2, yb, 0, w / 2, yb + t, d, 'chene'),                       // fond
    box(-w / 2, Y0 + h - t, 0, w / 2, Y0 + h, d, 'chene'),               // dessus
    box(-w / 2, yb + t, 0, -w / 2 + t, Y0 + h - t, d, 'chene'),          // côtés
    box(w / 2 - t, yb + t, 0, w / 2, Y0 + h - t, d, 'chene'),
    box(-w / 2 + t, yb + t, 0, w / 2 - t, Y0 + h - t, 0.012, 'chene'),   // dos
  );
  // tiroir (jeu de 3 mm autour de la façade)
  const yd0 = Math.max(yb + t + 0.003, Y0 + h - t - 0.15);
  g.add(box(-w / 2 + t + 0.003, yd0, 0.014, w / 2 - t - 0.003, Y0 + h - t - 0.003, d - 0.004, front));
  g.add(box(-0.05, Y0 + h - t - 0.035, d - 0.004, 0.05, Y0 + h - t - 0.027, d + 0.006, 'noir'));
  if (!floating) {
    for (const sx of [-1, 1]) for (const sz of [0.04, d - 0.04]) g.add(cylinderY(sx * (w / 2 - 0.04), sz, Y0, yb, 0.012, 'noir', 12));
  }
  // livre dans la niche
  if (yd0 - (yb + t) > 0.06) g.add(box(-w / 2 + 0.05, yb + t, 0.06, w / 2 - 0.09, yb + t + 0.028, d - 0.07, m.livres[1]));
  return g;
}

// Lampe à poser : pied céramique + abat-jour lin légèrement lumineux
function tableLamp(x, yTop, z, baseMat) {
  const m = mats();
  const g = new THREE.Group();
  g.add(lathe(x, yTop, z, [[0, 0], [0.055, 0], [0.075, 0.07], [0.07, 0.15], [0.035, 0.22], [0.012, 0.25], [0, 0.25]], baseMat, 24));
  g.add(cylinderY(x, z, yTop + 0.25, yTop + 0.30, 0.005, 'noir', 8));
  // abat-jour : coque cylindrique ouverte (profil fermé : extérieur en montant, intérieur en descendant)
  g.add(lathe(x, yTop + 0.26, z, [[0.125, 0], [0.105, 0.20], [0.101, 0.20], [0.121, 0]], m.abatJour, 32));
  g.add(lathe(x, yTop + 0.30, z, [[0, 0], [0.03, 0], [0.03, 0.06], [0, 0.06]], m.ampoule, 12));
  return g;
}

// Suspension (dôme céramique blanc mat) : câble depuis le rampant
function pendant(x, z, yBottom) {
  const m = mats();
  const g = new THREE.Group();
  const yc = rampant(z);
  const hS = 0.14;
  g.add(cylinderY(x, z, yc - 0.03, yc + 0.03, 0.05, 'blancLaque', 20));                 // patère (noyée dans le rampant)
  g.add(tube([x, yBottom + hS, z], [x, yc - 0.02, z], 0.0025, 'noir', 6));                // câble
  g.add(lathe(x, yBottom, z, [[0.13, 0], [0.125, 0.045], [0.10, 0.095], [0.05, 0.13], [0.012, 0.14],
    [0.012, 0.134], [0.047, 0.124], [0.095, 0.091], [0.119, 0.044], [0.124, 0]], m.ceramiqueMat, 32));
  g.add(lathe(x, yBottom + 0.035, z, [[0, 0], [0.025, 0.005], [0.035, 0.035], [0.025, 0.065], [0, 0.07]], m.ampoule, 16));
  return g;
}

// Chaise de bureau : piètement chêne, assise et dossier rembourrés
function chair(seatMat) {
  const g = new THREE.Group();
  const ys = Y0 + 0.45;
  for (const sx of [-1, 1]) {
    g.add(tube([sx * 0.205, Y0 + 0.004, 0.205], [sx * 0.18, ys, 0.18], 0.014, 'chene', 10));      // pieds avant
    g.add(tube([sx * 0.205, Y0 + 0.004, -0.22], [sx * 0.18, ys, -0.18], 0.014, 'chene', 10));      // pieds arrière
    g.add(tube([sx * 0.18, ys, -0.18], [sx * 0.175, Y0 + 0.83, -0.235], 0.012, 'chene', 10)); // montants de dossier
  }
  g.add(box(-0.18, ys - 0.03, -0.17, 0.18, ys, 0.17, 'chene'));                           // ceinture
  g.add(rb(-0.225, ys, -0.215, 0.225, ys + 0.05, 0.225, 0.02, seatMat));                   // assise
  g.add(rbc([0, Y0 + 0.75, -0.228], [0.43, 0.20, 0.035], 0.015, seatMat, [-0.16, 0, 0]));   // dossier
  return g;
}

// Fauteuil bouclette (lounge) : assise basse, accoudoirs ronds, pieds chêne
function armchair(fabric, cushionMat) {
  const g = new THREE.Group();
  const yb = Y0 + 0.14;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cylinderY(sx * 0.27, sz * 0.26, Y0, yb + 0.01, 0.018, 'chene', 12));
  g.add(rb(-0.35, yb, -0.33, 0.35, yb + 0.12, 0.34, 0.05, fabric));                     // socle
  g.add(rb(-0.27, yb + 0.10, -0.24, 0.27, yb + 0.28, 0.33, 0.07, fabric, 3));           // coussin d'assise
  g.add(rb(-0.35, yb + 0.08, -0.33, -0.25, yb + 0.47, 0.30, 0.05, fabric, 3));          // accoudoirs
  g.add(rb(0.25, yb + 0.08, -0.33, 0.35, yb + 0.47, 0.30, 0.05, fabric, 3));
  g.add(rbc([0, yb + 0.48, -0.26], [0.70, 0.62, 0.15], 0.07, fabric, [-0.17, 0, 0], 3)); // dossier
  if (cushionMat) g.add(rbc([0.05, yb + 0.47, -0.13], [0.40, 0.36, 0.12], 0.05, cushionMat, [-0.3, 0.1, 0], 3));
  return g;
}

// Bureau : plateau chêne 3 cm, pieds chêne, tiroir blanc sous plateau (repère monde, avant côté "side")
function desk(x0, z0, x1, z1, { drawer = true } = {}) {
  const g = new THREE.Group();
  const yt = Y0 + 0.75;
  g.add(box(x0, yt - 0.03, z0, x1, yt, z1, 'chene'));
  const lx = [x0 + 0.03, x1 - 0.065], lz = [z0 + 0.03, z1 - 0.065];
  for (const a of lx) for (const b of lz) g.add(box(a, Y0, b, a + 0.035, yt - 0.03, b + 0.035, 'chene'));
  if (drawer) {
    const cz = (z0 + z1) / 2;
    g.add(box(x0 + 0.07, yt - 0.13, cz - 0.30, x1 - 0.07, yt - 0.03, cz + 0.30, 'blancLaque'));
  }
  return g;
}

// Lampe de bureau articulée noire (bras simple)
function deskLamp(x, z, yTop, dx, dz) {
  const g = new THREE.Group();
  const hx = x + dx, hz = z + dz;
  g.add(cylinderY(x, z, yTop, yTop + 0.018, 0.07, 'noir', 20));
  g.add(tube([x, yTop + 0.018, z], [x + dx * 0.25, yTop + 0.36, z + dz * 0.25], 0.006, 'noir', 8));
  g.add(tube([x + dx * 0.25, yTop + 0.36, z + dz * 0.25], [hx, yTop + 0.42, hz], 0.006, 'noir', 8));
  g.add(lathe(hx, yTop + 0.30, hz, [[0.075, 0], [0.03, 0.12], [0.012, 0.13], [0.012, 0.124], [0.025, 0.114], [0.069, 0]], 'noir', 24));
  g.add(lathe(hx, yTop + 0.33, hz, [[0, 0], [0.03, 0], [0.03, 0.02], [0, 0.02]], mats().ampoule, 12));
  return g;
}

// Pile de livres (repère monde), le long de x
function books(x, z, yTop, list, rotY = 0) {
  const m = mats();
  const g = new THREE.Group();
  let y = yTop;
  list.forEach(([w, d, h, ci], i) => {
    const b = box(-w / 2, y, -d / 2, w / 2, y + h, d / 2, m.livres[ci % m.livres.length]);
    b.rotation.y = (i % 2 ? 0.08 : -0.05);
    g.add(b);
    y += h;
  });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

// Livres debout sur une étagère (le long de z), dos tournés vers +x
function shelfBooks(x0, x1, yb, zStart, list) {
  const m = mats();
  const g = new THREE.Group();
  let z = zStart;
  list.forEach(([t, h, ci]) => { g.add(box(x0, yb, z, x1 - (ci % 3) * 0.012, yb + h, z + t, m.livres[ci % m.livres.length])); z += t + 0.002; });
  return g;
}

// Lame de feuille (ellipsoïde aplati) : base en (bx,by,bz), inclinée de "tilt" vers l'azimut "az"
function blade(bx, by, bz, h, w, t, tilt, az, m) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), m);
  mesh.scale.set(w / 2, h / 2, t / 2);
  mesh.rotation.order = 'YXZ';
  mesh.rotation.set(tilt, az, 0);
  const dir = [Math.sin(az) * Math.sin(tilt), Math.cos(tilt), Math.cos(az) * Math.sin(tilt)];
  mesh.position.set(bx + dir[0] * h / 2, by + dir[1] * h / 2, bz + dir[2] * h / 2);
  return shadowed(mesh);
}

// Pot + petite plante : 'sansevieria' (lames verticales) ou 'touffe' (feuillage rond)
function smallPlant(x, yb, z, s = 1, potMat, kind = 'sansevieria') {
  const m = mats();
  const g = new THREE.Group();
  g.add(lathe(x, yb, z, [[0, 0], [0.045 * s, 0], [0.055 * s, 0.10 * s], [0.05 * s, 0.10 * s], [0.042 * s, 0.01 * s], [0, 0.01 * s]], potMat || m.ceramiqueMat, 20));
  g.add(cylinderY(x, z, yb + 0.07 * s, yb + 0.088 * s, 0.046 * s, m.terreau, 16));
  if (kind === 'sansevieria') {
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4, rr = (0.008 + 0.004 * (i % 3)) * s;
      g.add(blade(x + Math.sin(a) * rr, yb + 0.07 * s, z + Math.cos(a) * rr, (0.20 + 0.035 * ((i * 7) % 5)) * s, 0.034 * s, 0.006 * s, 0.10 + 0.05 * (i % 3), a, m.feuillage));
    }
  } else {
    const r = rand(17);
    for (let i = 0; i < 9; i++) {
      const a = r() * 6.28, d = r() * 0.05 * s;
      g.add(foliage(x + Math.cos(a) * d, yb + (0.10 + r() * 0.08) * s, z + Math.sin(a) * d, (0.03 + r() * 0.015) * s, m.feuillage, i + 0.7, 0.8, 1));
    }
  }
  return g;
}

// Olivier en pot (≈ 1,65 m) : tronc + branches + houppier de petites touffes
function oliveTree(x, z) {
  const m = mats();
  const g = new THREE.Group();
  g.add(lathe(x, Y0, z, [[0, 0], [0.13, 0], [0.16, 0.36], [0.15, 0.36], [0.122, 0.02], [0, 0.02]], m.terreCuite, 28));
  g.add(cylinderY(x, z, Y0 + 0.30, Y0 + 0.33, 0.142, m.terreau, 24));
  const k = [x + 0.03, Y0 + 0.95, z - 0.02];              // fourche
  g.add(tube([x, Y0 + 0.30, z], k, 0.024, m.tronc, 10));
  const r = rand(29);
  const ends = [[-0.14, 1.30, 0.10], [0.16, 1.36, -0.10], [0.02, 1.52, 0.02], [-0.10, 1.42, -0.14], [0.14, 1.22, 0.14]];
  ends.forEach(([dx, dy, dz]) => g.add(tube(k, [x + dx, Y0 + dy, z + dz], 0.010, m.tronc, 6)));
  for (let i = 0; i < 38; i++) {
    const e = ends[i % ends.length];
    const a = r() * 6.28, b = r() * 2 - 1, d = 0.06 + r() * 0.13;
    const px = x + e[0] * 0.8 + Math.cos(a) * d * Math.sqrt(1 - b * b);
    const pz = z + e[2] * 0.8 + Math.sin(a) * d * Math.sqrt(1 - b * b);
    const py = Y0 + e[1] + b * d * 0.6;
    g.add(foliage(px, py, pz, 0.045 + r() * 0.035, i % 3 ? m.feuillageOlivier : m.feuillage, i * 1.3 + 0.2, 0.8, 2));
  }
  return g;
}

// Rideau en lin plissé (vague), suspendu à une tringle : volume fermé extrudé verticalement
function curtain(xa, xb, zc, y0, y1) {
  const m = mats();
  const n = Math.max(8, Math.round((xb - xa) / 0.012));
  const A = 0.032, lam = 0.11, th = 0.012;
  const front = [], back = [];
  for (let i = 0; i <= n; i++) {
    const x = xa + (xb - xa) * i / n;
    const zz = zc + A * Math.sin(2 * Math.PI * (x - xa) / lam);
    front.push([x, zz - th / 2]); back.push([x, zz + th / 2]);
  }
  const mesh = prismY([...front, ...back.reverse()], y0, y1, m.rideau);
  mesh.userData.noCollide = true;     // tissu souple : ne bloque pas le passage
  return mesh;
}
function curtainRail(xa, xb, z, y) {
  const g = new THREE.Group();
  g.add(tube([xa, y, z], [xb, y, z], 0.01, 'noir', 10));
  for (const x of [xa + 0.05, xb - 0.05]) g.add(box(x - 0.01, y - 0.012, z, x + 0.01, y + 0.012, 4.91, 'noir'));
  return g;
}

// ---------------------------------------------------------------------------
// Pièces
// ---------------------------------------------------------------------------
function chambre1() {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'chambre-1';
  const xc = 1.58;            // axe du lit 180 (tête contre le mur bas Est z = 0.34, sous le rampant)
  // Lit 180x200 : x 0.63 -> 2.53, z 0.34 -> 2.42 ; hors du débattement de la porte (pivot x 3.13 / z 3.04, vantail 0.83)
  g.add(orient(xc, 0.34, 0, bed({
    W: 1.86, head: 'channel', headMat: m.lin, headH: 1.06, baseMat: 'chene', throwMat: m.sauge,
    cushions: [{ x: -0.36, mat: m.terracotta }, { x: 0.36, mat: m.sauge, tilt: -0.24 }, { x: 0, w: 0.52, h: 0.28, z: 0.50, y: 0.64, mat: m.drapGris }],
  })));
  // Chevets dos au mur Est : tablette suspendue étroite côté pignon, chevet sur pieds côté porte
  g.add(orient(0.48, 0.35, 0, nightstand({ w: 0.26, d: 0.30, h: 0.50, floating: true })));
  g.add(orient(2.78, 0.35, 0, nightstand({ w: 0.44, d: 0.38, h: 0.50 })));
  // objets sur les chevets
  g.add(books(0.48, 0.50, Y0 + 0.50, [[0.15, 0.20, 0.02, 0]], 0.2));
  g.add(lathe(2.88, Y0 + 0.50, 0.55, [[0, 0], [0.035, 0], [0.045, 0.06], [0.03, 0.14], [0.018, 0.16], [0.016, 0.16], [0.026, 0.14], [0.04, 0.06], [0.03, 0.01], [0, 0.01]], m.ceramiqueSauge, 20));
  g.add(books(2.68, 0.52, Y0 + 0.50, [[0.16, 0.22, 0.03, 2]], -0.2));
  // Suspensions de chevet (descendent du rampant)
  g.add(pendant(0.48, 0.58, Y0 + 1.22), pendant(2.78, 0.62, Y0 + 1.22));
  // Affiche au-dessus de la tête de lit (sur le mur bas Est, sous le rampant)
  g.add(artFrame({ wall: 'z+', plane: 0.34, a: xc, yc: Y0 + 1.45, w: 0.90, h: 0.50, seed: 3, palette: ['#c99377', '#d8b673', '#a5b09a'] }));

  // Armoire contre le pignon Nord (x = 0.34), z 2.55-4.25 : portes coulissantes chêne, caisson blanc, H 2.12
  const az0 = 2.55, az1 = 4.25, ax1 = 0.92, hA = 2.12, azm = (az0 + az1) / 2;
  g.add(
    box(0.37, Y0, az0 + 0.03, ax1 - 0.03, Y0 + 0.06, az1 - 0.03, m.socle),
    box(0.35, Y0 + 0.06, az0, ax1, Y0 + hA, az1, 'blancLaque'),
    box(ax1, Y0 + 0.065, az0 + 0.005, ax1 + 0.02, Y0 + hA - 0.005, azm + 0.015, 'chene'),
    box(ax1 + 0.02, Y0 + 0.065, azm - 0.015, ax1 + 0.04, Y0 + hA - 0.005, az1 - 0.005, 'chene'),
    box(ax1 + 0.02, Y0 + 0.80, az0 + 0.035, ax1 + 0.032, Y0 + 1.40, az0 + 0.047, 'noir'),
    box(ax1 + 0.04, Y0 + 0.80, az1 - 0.047, ax1 + 0.052, Y0 + 1.40, az1 - 0.035, 'noir'),
  );

  // Bureau contre la cloison du palier (x = 3.13), chaise, lampe, objets
  g.add(desk(2.58, 3.35, 3.12, 4.55));
  g.add(orient(2.38, 3.95, Math.PI / 2, chair(m.sauge)));
  g.add(deskLamp(3.02, 4.42, Y0 + 0.75, -0.14, -0.10));
  g.add(box(2.68, Y0 + 0.75, 3.74, 2.98, Y0 + 0.765, 4.06, 'alu'));                // ordinateur fermé
  g.add(books(2.98, 4.20, Y0 + 0.75, [[0.24, 0.17, 0.03, 3], [0.22, 0.16, 0.025, 1], [0.21, 0.15, 0.02, 6]], 0.1));
  g.add(smallPlant(3.00, Y0 + 0.75, 3.50, 1.1, m.terreCuite, 'sansevieria'));
  g.add(artFrame({ wall: 'x-', plane: 3.13, a: 3.95, yc: Y0 + 1.50, w: 0.50, h: 0.62, seed: 4, palette: ['#a7b4bd', '#d9cfbf', '#c69277'] }));

  // Fauteuil de lecture près de la baie, entre l'armoire et le bureau
  g.add(orient(1.62, 4.28, 0.9 * Math.PI, armchair(m.laine, m.ocre)));

  // Tapis au pied du lit (hors débattement de la porte : x <= 2.25)
  g.add(rug(0.98, 1.40, 2.25, 3.30, { base: '#e4ddd0', line: '#c69277', line2: '#b9ad99', seed: 5 }));

  // Rideaux lin de part et d'autre de la baie (x 0.785-2.585)
  g.add(curtain(0.40, 0.84, 4.855, Y0 + 0.01, Y0 + 2.21), curtain(2.53, 2.96, 4.855, Y0 + 0.01, Y0 + 2.21));
  g.add(curtainRail(0.37, 2.99, 4.86, Y0 + 2.225));
  return g;
}

function chambre2() {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'chambre-2';
  const xc = 5.99;            // axe du lit (tête contre la cloison de trémie z = 1.31)
  // Lit 180x200 : x 5.04 -> 6.94, z 1.31 -> 3.39 ; contre le pignon Sud pour rester hors du débattement de la porte (x <= 5.00)
  g.add(orient(xc, 1.31, 0, bed({
    W: 1.86, head: 'panel', headMat: m.bleuGris, headH: 1.10, baseMat: m.lin, throwMat: m.ocre,
    cushions: [{ x: -0.29, mat: m.bleuNuit }, { x: 0.30, mat: m.terracotta, tilt: -0.24 }, { x: 0.0, w: 0.50, h: 0.30, z: 0.50, y: 0.65, mat: m.sauge }],
  })));
  // Un seul chevet (côté porte) : le lit 180 occupe la largeur jusqu'au pignon Sud
  g.add(orient(4.79, 1.32, 0, nightstand({ w: 0.42, d: 0.38, h: 0.50, front: 'chene' })));
  g.add(tableLamp(4.73, Y0 + 0.50, 1.47, m.ceramiqueSauge));
  g.add(books(4.90, 1.60, Y0 + 0.50, [[0.13, 0.18, 0.02, 5]], 0.1));
  g.add(artFrame({ wall: 'z+', plane: 1.31, a: xc, yc: Y0 + 1.52, w: 0.80, h: 0.56, seed: 1, palette: ['#a7b4bd', '#c9b79c', '#9aa98e'] }));

  // Bureau dans l'alcôve, contre la cloison x = 3.20 ; étagère au-dessus
  g.add(desk(3.205, 3.50, 3.75, 4.70, { drawer: false }));
  g.add(orient(3.93, 4.10, -Math.PI / 2, chair(m.bleuGris)));
  g.add(deskLamp(3.30, 4.55, Y0 + 0.75, 0.14, -0.08));
  g.add(books(3.48, 3.75, Y0 + 0.75, [[0.30, 0.21, 0.015, 2], [0.28, 0.20, 0.012, 1]], 0.15));
  g.add(lathe(3.30, Y0 + 0.75, 4.05, [[0, 0], [0.04, 0], [0.04, 0.10], [0.036, 0.10], [0.036, 0.006], [0, 0.006]], m.terreCuite, 18)); // pot à crayons
  g.add(box(3.205, Y0 + 1.33, 3.62, 3.43, Y0 + 1.355, 4.58, 'chene'));             // étagère
  g.add(shelfBooks(3.22, 3.40, Y0 + 1.355, 3.66, [[0.03, 0.24, 0], [0.025, 0.22, 3], [0.035, 0.25, 1], [0.02, 0.21, 5], [0.03, 0.23, 2], [0.028, 0.20, 6]]));
  g.add(smallPlant(3.31, Y0 + 1.355, 4.42, 0.9, m.ceramiqueMat, 'touffe'));
  g.add(lathe(3.31, Y0 + 1.355, 4.12, [[0, 0], [0.04, 0], [0.05, 0.08], [0.025, 0.16], [0.022, 0.16], [0.045, 0.08], [0.035, 0.006], [0, 0.006]], m.ceramiqueSauge, 18));

  // Armoire chêne contre le pignon Sud (x = 6.96), hors baie : z 3.55-4.88, H 2.25 (rampant à 2.36)
  const wx0 = 6.345, wz0 = 3.55, wz1 = 4.88, hW = 2.25, zm = (wz0 + wz1) / 2;
  g.add(
    box(6.40, Y0, wz0 + 0.03, 6.92, Y0 + 0.06, wz1 - 0.03, m.socle),
    box(6.365, Y0 + 0.06, wz0, 6.95, Y0 + hW, wz1, 'chene'),
    box(wx0, Y0 + 0.065, wz0 + 0.003, 6.365, Y0 + hW - 0.005, zm - 0.002, 'chene'),
    box(wx0, Y0 + 0.065, zm + 0.002, 6.365, Y0 + hW - 0.005, wz1 - 0.003, 'chene'),
    box(wx0 - 0.012, Y0 + 0.85, zm - 0.04, wx0, Y0 + 1.45, zm - 0.028, 'noir'),
    box(wx0 - 0.012, Y0 + 0.85, zm + 0.028, wx0, Y0 + 1.45, zm + 0.04, 'noir'),
  );

  // Tapis au pied du lit (hors débattement de porte et de l'armoire)
  g.add(rug(4.65, 3.45, 6.30, 4.62, { base: '#dfe1dc', line: '#8fa3b3', line2: '#b9b2a4', seed: 9, cap: '#9aa0a0' }));
  // Olivier en pot devant la partie fixe de la baie
  g.add(oliveTree(4.45, 4.40));
  // Rideaux de la baie (x 4.46-6.26)
  g.add(curtain(4.19, 4.56, 4.855, Y0 + 0.01, Y0 + 2.21), curtain(5.98, 6.33, 4.855, Y0 + 0.01, Y0 + 2.21));
  g.add(curtainRail(4.18, 6.335, 4.86, Y0 + 2.225));
  return g;
}

function palier() {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'palier';
  // Console chêne sur piètement acier noir, contre la cloison du fond (z = 3.067)
  const x0 = 3.33, x1 = 3.97, z0 = 2.83, z1 = 3.06, yt = Y0 + 0.80;
  g.add(box(x0, yt - 0.03, z0, x1, yt, z1, 'chene'));
  g.add(box(x0 + 0.03, Y0 + 0.20, z0 + 0.02, x1 - 0.03, Y0 + 0.22, z1 - 0.01, 'chene'));
  for (const x of [x0 + 0.02, x1 - 0.04]) for (const z of [z0 + 0.01, z1 - 0.03]) g.add(box(x, Y0, z, x + 0.02, yt - 0.03, z + 0.02, 'noir'));
  // objets : vase + herbes sèches, coupe, livres, panier sous la console
  const vx = 3.47, vz = 2.93;
  g.add(lathe(vx, yt, vz, [[0, 0], [0.05, 0], [0.075, 0.10], [0.06, 0.20], [0.03, 0.27], [0.028, 0.30], [0.024, 0.30], [0.026, 0.27], [0.055, 0.20], [0.069, 0.10], [0.045, 0.008], [0, 0.008]], m.ceramiqueMat, 24));
  for (let i = 0; i < 8; i++) {
    const a = i * 0.79 + 0.3, s = 0.07 + 0.045 * (i % 3);
    const top = [vx + Math.cos(a) * s, yt + 0.58 + 0.07 * (i % 3), vz + Math.sin(a) * s * 0.45];
    g.add(tube([vx, yt + 0.22, vz], top, 0.0025, m.tronc, 5));
    g.add(foliage(top[0], top[1] + 0.045, top[2], 0.022, m.pampa, i + 0.5, 3.2));
  }
  g.add(lathe(3.87, yt, 2.95, [[0, 0], [0.035, 0], [0.08, 0.045], [0.075, 0.045], [0.032, 0.008], [0, 0.008]], m.terreCuite, 24));
  g.add(books(3.65, 2.94, yt, [[0.18, 0.14, 0.025, 4], [0.16, 0.13, 0.02, 2]], 0.15));
  g.add(lathe(3.65, Y0 + 0.22, 2.945, [[0, 0], [0.11, 0], [0.12, 0.20], [0.112, 0.20], [0.103, 0.01], [0, 0.01]], m.lin, 24)); // panier
  // Miroir rond cadre chêne au-dessus de la console
  const mz = 3.067, my = Y0 + 1.42, mx = (x0 + x1) / 2;
  const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 48), mat('chene'));
  frame.rotation.x = Math.PI / 2; frame.position.set(mx, my, mz - 0.01); shadowed(frame);
  const mir = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.006, 48), m.miroirClair);
  mir.rotation.x = Math.PI / 2; mir.position.set(mx, my, mz - 0.022); mir.castShadow = false;
  g.add(frame, mir);
  return g;
}

// ---------------------------------------------------------------------------
export function buildFurnitureEtage() {
  const root = grp('mobilier-etage', 'etage', 'mobilier');
  add(root, chambre1(), chambre2(), palier());
  return root;
}
