// Matériaux et textures procédurales (aucune image externe).
import * as THREE from 'three';
import { MAT, cappedMaterial } from './core.js';
import { COLORS } from './spec.js';

// RNG déterministe
function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { repeat = 1, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Bruit "grain" (enduit, placo) -> carte de relief en niveaux de gris
function grainCanvas(size, seed, { dots = 9000, rmax = 1.6, base = 128, amp = 60 } = {}) {
  const [c, g] = canvas(size);
  g.fillStyle = `rgb(${base},${base},${base})`;
  g.fillRect(0, 0, size, size);
  const r = rng(seed);
  for (let i = 0; i < dots; i++) {
    const v = Math.round(base + (r() - 0.5) * 2 * amp);
    g.fillStyle = `rgb(${v},${v},${v})`;
    const rad = 0.4 + r() * rmax;
    g.beginPath(); g.arc(r() * size, r() * size, rad, 0, Math.PI * 2); g.fill();
  }
  return c;
}

// Teinte légèrement nuancée (évite l'aplat parfait)
function tintedCanvas(size, seed, color, variation = 6, blobs = 400) {
  const [c, g] = canvas(size);
  g.fillStyle = color; g.fillRect(0, 0, size, size);
  const r = rng(seed);
  const base = new THREE.Color(color);
  for (let i = 0; i < blobs; i++) {
    const k = (r() - 0.5) * variation / 255;
    const col = base.clone().offsetHSL(0, 0, k);
    g.fillStyle = `#${col.getHexString()}`;
    g.globalAlpha = 0.25;
    const rad = 4 + r() * 22;
    g.beginPath(); g.arc(r() * size, r() * size, rad, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  return c;
}

// Parquet chêne : lames 0.18 x 1.2 m, texture couvrant 1.2 x 1.2 m
function parquetCanvas(seed = 3) {
  const S = 1024; const [c, g] = canvas(S);
  const r = rng(seed);
  const plankW = S / (1.2 / 0.18); // ~ 6.67 lames
  const n = Math.ceil(S / plankW);
  for (let i = 0; i < n; i++) {
    let y = -r() * S;
    while (y < S) {
      const len = S * (0.45 + r() * 0.55);
      const h = 30 + r() * 10, s = 38 + r() * 10, l = 58 + r() * 10;
      g.fillStyle = `hsl(${h},${s}%,${l}%)`;
      g.fillRect(i * plankW, y, plankW, len);
      // veinage
      g.globalAlpha = 0.18;
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = r() > 0.5 ? '#6b4a2b' : '#c9a97f';
        g.lineWidth = 0.6 + r() * 1.4;
        const x = i * plankW + r() * plankW;
        g.beginPath(); g.moveTo(x, y);
        g.bezierCurveTo(x + (r() - 0.5) * 8, y + len * 0.3, x + (r() - 0.5) * 8, y + len * 0.6, x + (r() - 0.5) * 6, y + len);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = 'rgba(60,40,20,0.55)';
      g.fillRect(i * plankW, y, plankW, 1.5);
      y += len;
    }
    g.fillStyle = 'rgba(60,40,20,0.5)';
    g.fillRect(i * plankW, 0, 1.5, S);
  }
  return c;
}

// Carrelage : carreaux carrés/rectangulaires avec joints
function tileCanvas({ seed = 5, color = '#d9d4cb', joint = '#b9b3a8', tilesX = 2, tilesY = 2, jointPx = 3, variation = 5, veins = false } = {}) {
  const S = 1024; const [c, g] = canvas(S);
  const r = rng(seed);
  const tw = S / tilesX, th = S / tilesY;
  const base = new THREE.Color(color);
  for (let i = 0; i < tilesX; i++) for (let j = 0; j < tilesY; j++) {
    const col = base.clone().offsetHSL(0, 0, (r() - 0.5) * variation / 100);
    g.fillStyle = `#${col.getHexString()}`;
    g.fillRect(i * tw, j * th, tw, th);
    // micro-nuances type grès cérame
    for (let k = 0; k < 220; k++) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '90,85,80'},${0.03 + r() * 0.04})`;
      const rad = 2 + r() * 14;
      g.beginPath(); g.arc(i * tw + r() * tw, j * th + r() * th, rad, 0, Math.PI * 2); g.fill();
    }
    if (veins) {
      g.strokeStyle = 'rgba(150,145,140,0.25)'; g.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        g.beginPath(); g.moveTo(i * tw + r() * tw, j * th);
        g.bezierCurveTo(i * tw + r() * tw, j * th + th * 0.3, i * tw + r() * tw, j * th + th * 0.7, i * tw + r() * tw, j * th + th);
        g.stroke();
      }
    }
  }
  g.fillStyle = joint;
  for (let i = 0; i <= tilesX; i++) g.fillRect(i * tw - jointPx / 2, 0, jointPx, S);
  for (let j = 0; j <= tilesY; j++) g.fillRect(0, j * th - jointPx / 2, S, jointPx);
  return c;
}

// Bois (planches parallèles) : bardage, terrasse, chêne massif
function woodCanvas({ seed = 7, hue = 30, sat = 40, light = 52, boards = 6, gap = 0, gapColor = '#2b2520', lengthwise = true } = {}) {
  const S = 1024; const [c, g] = canvas(S);
  const r = rng(seed);
  const bw = S / boards;
  for (let i = 0; i < boards; i++) {
    g.fillStyle = `hsl(${hue + (r() - 0.5) * 6},${sat + (r() - 0.5) * 8}%,${light + (r() - 0.5) * 8}%)`;
    g.fillRect(i * bw, 0, bw, S);
    g.globalAlpha = 0.16;
    for (let k = 0; k < 22; k++) {
      g.strokeStyle = r() > 0.5 ? `hsl(${hue},${sat}%,${light - 22}%)` : `hsl(${hue},${sat}%,${light + 15}%)`;
      g.lineWidth = 0.5 + r() * 1.6;
      const x = i * bw + r() * bw;
      g.beginPath(); g.moveTo(x, 0);
      g.bezierCurveTo(x + (r() - 0.5) * 10, S * 0.33, x + (r() - 0.5) * 10, S * 0.66, x + (r() - 0.5) * 6, S);
      g.stroke();
    }
    g.globalAlpha = 1;
    if (gap) { g.fillStyle = gapColor; g.fillRect(i * bw, 0, gap, S); }
  }
  if (!lengthwise) {
    const [c2, g2] = canvas(S);
    g2.translate(S / 2, S / 2); g2.rotate(Math.PI / 2); g2.drawImage(c, -S / 2, -S / 2);
    return c2;
  }
  return c;
}

function grassCanvas(seed = 11) {
  const S = 1024; const [c, g] = canvas(S);
  g.fillStyle = '#5f8a3a'; g.fillRect(0, 0, S, S);
  const r = rng(seed);
  for (let i = 0; i < 26000; i++) {
    const h = 78 + r() * 30, s = 35 + r() * 30, l = 24 + r() * 26;
    g.strokeStyle = `hsl(${h},${s}%,${l}%)`;
    g.lineWidth = 1 + r() * 1.2;
    const x = r() * S, y = r() * S, a = (r() - 0.5) * 0.8, len = 3 + r() * 7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); g.stroke();
  }
  // pâquerettes
  for (let i = 0; i < 140; i++) {
    g.fillStyle = r() > 0.25 ? 'rgba(255,255,250,0.9)' : 'rgba(240,215,60,0.9)';
    g.beginPath(); g.arc(r() * S, r() * S, 1.6, 0, Math.PI * 2); g.fill();
  }
  return c;
}

function gravelCanvas(seed = 13) {
  const S = 1024; const [c, g] = canvas(S);
  g.fillStyle = '#b8b0a2'; g.fillRect(0, 0, S, S);
  const r = rng(seed);
  for (let i = 0; i < 16000; i++) {
    const l = 50 + r() * 35;
    g.fillStyle = `hsl(${30 + r() * 15},${8 + r() * 10}%,${l}%)`;
    g.beginPath(); g.ellipse(r() * S, r() * S, 1.5 + r() * 3, 1 + r() * 2.5, r() * 3, 0, Math.PI * 2); g.fill();
  }
  return c;
}

// Couverture : tuile plate / ardoise anthracite (rangs horizontaux, joints décalés)
function roofCanvas(seed = 17) {
  const S = 1024; const [c, g] = canvas(S);
  const r = rng(seed);
  g.fillStyle = '#3a3d40'; g.fillRect(0, 0, S, S);
  const rows = 6, cols = 5; // sur 1.2 m : rang ~0.2 m, tuile ~0.24 m
  const rh = S / rows, cw = S / cols;
  for (let j = 0; j < rows; j++) {
    const off = (j % 2) * cw / 2;
    for (let i = -1; i <= cols; i++) {
      const l = 22 + r() * 7;
      g.fillStyle = `hsl(205,6%,${l}%)`;
      g.fillRect(i * cw + off + 1, j * rh + 1, cw - 2, rh - 2);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(i * cw + off, j * rh + rh - 5, cw, 5); // ombre de recouvrement
    }
  }
  return c;
}

function normalFromHeight(srcCanvas, strength = 2.0) {
  const w = srcCanvas.width, h = srcCanvas.height;
  const src = srcCanvas.getContext('2d').getImageData(0, 0, w, h).data;
  const [c, g] = canvas(w, h);
  const out = g.createImageData(w, h);
  const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
    const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
    const n = new THREE.Vector3(-dx, -dy, 1).normalize();
    const k = (y * w + x) * 4;
    out.data[k] = (n.x * 0.5 + 0.5) * 255; out.data[k + 1] = (n.y * 0.5 + 0.5) * 255; out.data[k + 2] = (n.z * 0.5 + 0.5) * 255; out.data[k + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  return c;
}

export function initMaterials() {
  // --- Enduit Weber 001 blanc cassé (façades) ---
  const crepiH = grainCanvas(512, 21, { dots: 14000, rmax: 1.4, amp: 70 });
  const crepiN = tex(normalFromHeight(crepiH, 2.2), { srgb: false });
  crepiN.repeat.set(2, 2);
  const crepiC = tex(tintedCanvas(512, 22, COLORS.weber001, 5, 300));
  crepiC.repeat.set(0.5, 0.5);
  MAT.crepi = cappedMaterial({ color: '#ffffff', map: crepiC, normalMap: crepiN, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.96 }, '#8e8c88');

  // --- Placo peint (murs) / plafonds ---
  const placoN = tex(normalFromHeight(grainCanvas(256, 31, { dots: 2500, rmax: 1, amp: 25 }), 1.0), { srgb: false });
  MAT.placo = cappedMaterial({ color: COLORS.placo, normalMap: placoN, normalScale: new THREE.Vector2(0.08, 0.08), roughness: 0.92 }, '#d4cfc4');
  MAT.placoPlafond = cappedMaterial({ color: '#f7f6f3', roughness: 0.95 }, '#d4cfc4');
  MAT.placoBrut = cappedMaterial({ color: '#e7e8ea', roughness: 0.9 }, '#d4cfc4'); // plaque BA13 non peinte (rendu chantier)
  MAT.isolant = cappedMaterial({ color: COLORS.placo, roughness: 0.92 }, '#e8cf62');           // laine minérale (vue en coupe)
  MAT.cloisonAme = cappedMaterial({ color: COLORS.placo, roughness: 0.92 }, '#efe0a0');        // âme de cloison 72/48
  MAT.bloc = cappedMaterial({ color: '#b5b2ac', roughness: 0.9 }, '#8e8c88');
  MAT.dalle = cappedMaterial({ color: '#c9c6bf', roughness: 0.9 }, '#7f7c76');
  MAT.chape = cappedMaterial({ color: '#c9c6bf', roughness: 0.9 }, '#9b978f');

  // --- Sols ---
  const tileC = tex(tileCanvas({ seed: 41, color: '#d8d3c9', joint: '#bdb6aa', tilesX: 2, tilesY: 2, jointPx: 3, variation: 3 }));
  tileC.repeat.set(1 / 1.2, 1 / 1.2); // 60x60 cm
  MAT.carrelageSol = cappedMaterial({ color: '#ffffff', map: tileC, roughness: 0.55 }, '#a8a297');
  const parquetC = tex(parquetCanvas(43));
  parquetC.repeat.set(1 / 1.2, 1 / 1.2);
  MAT.parquet = cappedMaterial({ color: '#ffffff', map: parquetC, roughness: 0.6 }, '#8a6a45');
  const wallTile = tex(tileCanvas({ seed: 47, color: '#e9e6e0', joint: '#d2cdc4', tilesX: 2, tilesY: 4, jointPx: 2, variation: 2, veins: true }));
  wallTile.repeat.set(1 / 1.2, 1 / 1.2); // 60 x 30
  MAT.carrelageMural = cappedMaterial({ color: '#ffffff', map: wallTile, roughness: 0.35 }, '#bdb7ad');

  // --- Menuiseries / métal ---
  MAT.ral7016 = cappedMaterial({ color: COLORS.ral7016, roughness: 0.42, metalness: 0.35 }, '#25292c');
  MAT.alu = cappedMaterial({ color: '#8d9296', roughness: 0.35, metalness: 0.7 }, '#666b6f');
  MAT.chrome = cappedMaterial({ color: '#d7dadd', roughness: 0.12, metalness: 1.0 }, '#9aa0a5');
  MAT.inox = cappedMaterial({ color: '#b9bcbf', roughness: 0.3, metalness: 0.9 }, '#8a8e92');
  MAT.verre = new THREE.MeshPhysicalMaterial({ color: '#cfe3e6', roughness: 0.04, metalness: 0.0, transparent: true, opacity: 0.22, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false });
  MAT.verreDepoli = new THREE.MeshPhysicalMaterial({ color: '#eef3f3', roughness: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  MAT.verreGardeCorps = new THREE.MeshPhysicalMaterial({ color: '#dcebea', roughness: 0.05, transparent: true, opacity: 0.18, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false });
  MAT.miroir = new THREE.MeshStandardMaterial({ color: '#dfe6ea', roughness: 0.02, metalness: 1.0 });

  // --- Bois ---
  const oakC = tex(woodCanvas({ seed: 51, hue: 33, sat: 42, light: 60, boards: 5 }));
  oakC.repeat.set(1 / 1.0, 1 / 1.0);
  MAT.chene = cappedMaterial({ color: '#ffffff', map: oakC, roughness: 0.55 }, '#9b7650');
  const bardC = tex(woodCanvas({ seed: 53, hue: 27, sat: 46, light: 44, boards: 8, gap: 2, gapColor: '#3a2a1c' }));
  bardC.repeat.set(1 / 1.0, 1 / 1.0);
  MAT.boisBardage = cappedMaterial({ color: '#ffffff', map: bardC, roughness: 0.75 }, '#6e4f33');
  const deckC = tex(woodCanvas({ seed: 57, hue: 26, sat: 30, light: 46, boards: 7, gap: 4, gapColor: '#2b231c', lengthwise: false }));
  deckC.repeat.set(1 / 1.0, 1 / 1.0);
  MAT.terrasse = cappedMaterial({ color: '#ffffff', map: deckC, roughness: 0.8 }, '#5e4632');
  MAT.blancLaque = cappedMaterial({ color: '#f6f5f1', roughness: 0.35 }, '#cfcac0');
  MAT.rive = cappedMaterial({ color: '#f4f3ef', roughness: 0.6 }, '#cfcac0');

  // --- Toiture ---
  const roofC = tex(roofCanvas(61));
  roofC.repeat.set(1 / 1.2, 1 / 1.2);
  MAT.toiture = cappedMaterial({ color: '#ffffff', map: roofC, roughness: 0.7, metalness: 0.05 }, '#6d5a45');
  MAT.charpente = cappedMaterial({ color: '#c8a77c', roughness: 0.8 }, '#a9845a');
  MAT.etancheite = cappedMaterial({ color: '#6f7174', roughness: 0.85 }, '#555759');

  // --- Site ---
  const grassC = tex(grassCanvas(71)); grassC.repeat.set(1 / 3, 1 / 3);
  MAT.herbe = cappedMaterial({ color: '#ffffff', map: grassC, roughness: 1.0 }, '#5d4a37');
  const gravelC = tex(gravelCanvas(73)); gravelC.repeat.set(1 / 1.5, 1 / 1.5);
  MAT.gravier = cappedMaterial({ color: '#ffffff', map: gravelC, roughness: 1.0 }, '#7d7468');
  MAT.terre = cappedMaterial({ color: '#7b6650', roughness: 1.0 }, '#5d4a37');
  MAT.dallageExt = cappedMaterial({ color: '#cfc8bb', roughness: 0.85 }, '#9d968a');

  // --- Divers ---
  MAT.ceramique = cappedMaterial({ color: '#fbfbfa', roughness: 0.12 }, '#dcdad5');
  MAT.luminaire = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff1d6', emissiveIntensity: 2.2, roughness: 0.5 });
  MAT.noir = cappedMaterial({ color: '#1d1f21', roughness: 0.5 }, '#111');
  return MAT;
}
