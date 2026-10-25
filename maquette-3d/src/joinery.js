// Menuiseries : fenêtres / portes extérieures alu RAL 7016, portes intérieures laquées blanc,
// fenêtre de toit (pan Est) et garde-corps verre du balcon Ouest.
// Les trous sont faits par building.js : ce module ne pose que les menuiseries.
import * as THREE from 'three';
import { box, prismX, prismZ, prismY, cylinderY, tube, grp, add } from './core.js';
import { LV, OPENINGS, DOORS, VELUX, ROOF, roofTop, FOOT, SAS, POSTS, JOUE_NORD } from './spec.js';

const AL = 'ral7016';      // profilés alu laqués anthracite
const F = 0.06;            // face vue du dormant (60 mm)

// Verre : pas d'ombre portée
function glassify(o) {
  o.userData.noShadow = true;
  o.traverse((m) => { if (m.isMesh) { m.userData.noShadow = true; m.castShadow = false; m.receiveShadow = false; } });
  return o;
}

// ---------------------------------------------------------------------------
// Repère local d'une ouverture de façade
//   u : le long du mur, 0 = a0 ; y : hauteur absolue ;
//   w : profondeur, 0 = bord EXTÉRIEUR du plan de pose, croît vers l'intérieur (w = D : bord intérieur).
//   Le nu extérieur de la façade est à w = -ext.
// ---------------------------------------------------------------------------
const WALLS = {
  E: { along: 'x', ext: -1, face: FOOT.z0 },
  W: { along: 'x', ext: +1, face: FOOT.z1 },
  'SAS-W': { along: 'x', ext: +1, face: SAS.westWall.z1 },
  N: { along: 'z', ext: -1, face: FOOT.x0 },
  S: { along: 'z', ext: +1, face: FOOT.x1 },
  'SAS-S': { along: 'z', ext: +1, face: SAS.outer.x1 },
};

function openingFrame(o) {
  const wd = WALLS[o.wall];
  const [p0, p1] = o.plane;
  const pe = wd.ext > 0 ? p1 : p0;
  const D = p1 - p0;
  const ext = Math.max(0, wd.ext > 0 ? wd.face - p1 : p0 - wd.face);
  const N = (w) => pe - wd.ext * w;
  const A = (u) => o.a0 + u;
  const P3 = (u, y, w) => (wd.along === 'x' ? [A(u), y, N(w)] : [N(w), y, A(u)]);
  const B = (u0, y0, w0, u1, y1, w1, m) => {
    const [xa, , za] = P3(u0, 0, w0), [xb, , zb] = P3(u1, 0, w1);
    return box(Math.min(xa, xb), Math.min(y0, y1), Math.min(za, zb), Math.max(xa, xb), Math.max(y0, y1), Math.max(za, zb), m);
  };
  // profil (w,y) extrudé le long du mur de u0 à u1
  const prof = (pts, u0, u1, m) => {
    const q = pts.map(([w, y]) => [N(w), y]);
    return wd.along === 'x' ? prismX(q, A(u0), A(u1), m) : prismZ(q, A(u0), A(u1), m);
  };
  // vecteurs monde des directions +u et +w
  const vU = wd.along === 'x' ? [1, 0, 0] : [0, 0, 1];
  const vW = wd.along === 'x' ? [0, 0, -wd.ext] : [-wd.ext, 0, 0];
  return { o, W: o.a1 - o.a0, H: o.y1 - o.y0, y0: o.y0, y1: o.y1, D, ext, B, P3, prof, vU, vW };
}

// Cadre rectangulaire (4 profils) dans le plan u/y, épaisseur w0..w1
function ring(f, u0, u1, y0, y1, w0, w1, { l, r, t, b }, m) {
  return [
    f.B(u0, y0, w0, u0 + l, y1, w1, m),
    f.B(u1 - r, y0, w0, u1, y1, w1, m),
    f.B(u0 + l, y1 - t, w0, u1 - r, y1, w1, m),
    f.B(u0 + l, y0, w0, u1 - r, y0 + b, w1, m),
  ];
}
const pane = (f, u0, u1, y0, y1, w0, w1, m = 'verre') => glassify(f.B(u0, y0, w0, u1, y1, w1, m));

// Béquille inox : rosace sur la face au point p (normale sortante nrm), levier horizontal vers dir
function bequille(p, nrm, dir, m = 'inox') {
  const P = new THREE.Vector3(...p), Nn = new THREE.Vector3(...nrm), Dd = new THREE.Vector3(...dir);
  const at = (k, j, v = 0) => P.clone().addScaledVector(Nn, k).addScaledVector(Dd, j).add(new THREE.Vector3(0, v, 0)).toArray();
  return [
    tube(at(-0.001, 0), at(0.008, 0), 0.025, m, 20),
    tube(at(0.008, 0), at(0.052, 0), 0.0085, m, 12),
    tube(at(0.052, -0.01), at(0.058, 0.13, -0.004), 0.0095, m, 12),
  ];
}
const neg = (v) => v.map((c) => -c);

// Poignée de fenêtre (crémone) côté intérieur, levier vers le bas (fermé)
function cremone(f, u, y, w) {
  return [
    f.B(u - 0.015, y - 0.045, w, u + 0.015, y + 0.045, w + 0.012, AL),
    f.B(u - 0.009, y - 0.15, w + 0.012, u + 0.009, y + 0.014, w + 0.030, AL),
  ];
}
// Poignée de coulissant (prise verticale)
function poigneeCoulissant(f, u, y, w) {
  return [
    f.B(u - 0.013, y - 0.10, w, u + 0.013, y + 0.10, w + 0.010, AL),
    f.B(u - 0.009, y - 0.075, w + 0.010, u + 0.009, y + 0.06, w + 0.032, AL),
  ];
}

// ---------------------------------------------------------------------------
// Appui (fenêtre à allège) / seuil (plain-pied)
// ---------------------------------------------------------------------------
function appui(f) {
  const { W, y0, ext } = f;
  const e = ext + 0.04; // débord de 4 cm devant l'enduit
  const pts = [
    [0.004, y0 - 0.002], [0.004, y0 + 0.018], [-e, y0 + 0.004], [-e, y0 - 0.042],
    [-e + 0.010, y0 - 0.042], [-e + 0.010, y0 - 0.010], [-ext + 0.01, y0 - 0.010], [-ext + 0.01, y0 - 0.002],
  ];
  return [f.prof(pts, -0.012, W + 0.012, AL)];
}
function seuil(f, inner) {
  const { W, y0, ext, D } = f;
  const out = [];
  const yb = y0 - (y0 < 0.5 ? 0.06 : 0.02);
  // seuil alu extérieur : couvre le tableau maçonné jusqu'à 2,5 cm devant l'enduit
  out.push(f.B(0, yb, -(ext + 0.025), W, y0 + 0.004, 0.002, AL));
  out.push(f.B(0, y0 + 0.004, -(ext + 0.025), W, y0 + 0.008, -(ext + 0.012), AL)); // petit rejingot avant
  if (inner) {
    // tableau intérieur profond (pose au nu extérieur) : seuil intérieur + habillage placo des tableaux
    const d = inner.depth;
    out.push(f.B(0, y0 - 0.015, D, W, y0 + 0.006, D + d, inner.floor));
    out.push(f.B(0, y0 + 0.006, D, 0.013, f.y1, D + d, 'placo'));
    out.push(f.B(W - 0.013, y0 + 0.006, D, W, f.y1, D + d, 'placo'));
    out.push(f.B(0.013, f.y1 - 0.013, D, W - 0.013, f.y1, D + d, 'placo'));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Types de menuiseries extérieures
// ---------------------------------------------------------------------------
function casement(f, { hinge = 'a0', plainPied = false } = {}) {
  const { W, y0, y1, D } = f;
  const out = [];
  const fb = plainPied ? 0.025 : F;
  out.push(...ring(f, 0, W, y0, y1, 0, D, { l: F, r: F, t: F, b: fb }, AL));
  // ouvrant à recouvrement (8 mm sur le dormant), traverse basse plus haute
  const so = 0.008, sf = 0.062 + so, sb = (plainPied ? 0.135 : 0.10) + so;
  const u0 = F - so, u1 = W - F + so, v0 = y0 + fb - so, v1 = y1 - F + so;
  const w0 = 0.018, w1 = 0.094;
  out.push(...ring(f, u0, u1, v0, v1, w0, w1, { l: sf, r: sf, t: sf, b: sb }, AL));
  // parclose intérieure (léger ressaut autour du vitrage)
  out.push(...ring(f, u0 + sf, u1 - sf, v0 + sb, v1 - sf, 0.068, 0.088, { l: 0.012, r: 0.012, t: 0.012, b: 0.012 }, AL));
  out.push(pane(f, u0 + sf - 0.012, u1 - sf + 0.012, v0 + sb - 0.012, v1 - sf + 0.012, 0.044, 0.068));
  const uh = hinge === 'a0' ? u1 - sf / 2 : u0 + sf / 2;
  const yh = plainPied ? y0 + 1.05 : (v0 + v1) / 2 + 0.04;
  out.push(...cremone(f, uh, yh, w1));
  return out;
}

function slider(f) {
  const { W, y0, y1, D } = f;
  const out = [];
  const fb = 0.03; // rail bas de plain-pied
  out.push(...ring(f, 0, W, y0, y1, 0, D, { l: F, r: F, t: F, b: fb }, AL));
  // doubles rails visibles sur la traverse basse
  out.push(f.B(F, y0 + fb, 0.030, W - F, y0 + fb + 0.012, 0.036, AL));
  out.push(f.B(F, y0 + fb, 0.082, W - F, y0 + fb + 0.012, 0.088, AL));
  const c = W / 2;
  const v0 = y0 + fb - 0.008, v1 = y1 - F + 0.012;
  // vantail intérieur côté a0, vantail extérieur côté a1 ; montants de chicane qui se recouvrent au centre
  const S = [
    { u0: F - 0.012, u1: c + 0.012, w0: 0.064, w1: 0.106, l: 0.072, r: 0.068 },
    { u0: c - 0.012, u1: W - F + 0.012, w0: 0.014, w1: 0.056, l: 0.068, r: 0.072 },
  ];
  for (const s of S) {
    out.push(...ring(f, s.u0, s.u1, v0, v1, s.w0, s.w1, { l: s.l, r: s.r, t: 0.078, b: 0.105 }, AL));
    const wm = (s.w0 + s.w1) / 2;
    out.push(pane(f, s.u0 + s.l - 0.012, s.u1 - s.r + 0.012, v0 + 0.105 - 0.012, v1 - 0.078 + 0.012, wm - 0.012, wm + 0.012));
  }
  const yh = y0 + 1.05;
  out.push(...poigneeCoulissant(f, c - 0.028, yh, S[0].w1));
  out.push(...poigneeCoulissant(f, c + 0.036, yh, S[1].w1));
  return out;
}

function fixedFull(f) {
  const { W, y0, y1, D } = f;
  const out = [];
  const fb = 0.025;
  out.push(...ring(f, 0, W, y0, y1, 0, D, { l: F, r: F, t: F, b: fb }, AL));
  // cadre de parclose + traverse basse de soubassement
  const u0 = F - 0.005, u1 = W - F + 0.005, v0 = y0 + fb - 0.005, v1 = y1 - F + 0.005;
  out.push(...ring(f, u0, u1, v0, v1, 0.02, 0.095, { l: 0.022, r: 0.022, t: 0.022, b: 0.085 }, AL));
  out.push(pane(f, u0 + 0.01, u1 - 0.01, v0 + 0.07, v1 - 0.01, 0.045, 0.069));
  return out;
}

function entryDoor(f, { hinge = 'a1' } = {}) {
  const { W, y0, y1, D } = f;
  const out = [];
  const fb = 0.025;
  out.push(...ring(f, 0, W, y0, y1, 0, D, { l: F, r: F, t: F, b: fb }, AL));
  const u0 = F - 0.008, u1 = W - F + 0.008, v0 = y0 + fb + 0.004, v1 = y1 - F + 0.008;
  const w0 = 0.008, w1 = 0.082;
  const latchA0 = hinge === 'a1';
  const leaf = [];
  // vantail plein RAL 7016 avec bande vitrée verticale (verre dépoli) côté paumelles
  const gw = 0.12;
  const gu0 = latchA0 ? u1 - 0.13 - gw : u0 + 0.13, gu1 = gu0 + gw;
  const gy0 = y0 + 0.28, gy1 = y1 - F - 0.24;
  leaf.push(f.B(u0, v0, w0, gu0, v1, w1, AL));
  leaf.push(f.B(gu1, v0, w0, u1, v1, w1, AL));
  leaf.push(f.B(gu0, v0, w0, gu1, gy0, w1, AL));
  leaf.push(f.B(gu0, gy1, w0, gu1, v1, w1, AL));
  // fin cadre inox autour de la bande vitrée (côté extérieur)
  leaf.push(...ring(f, gu0 - 0.006, gu1 + 0.006, gy0 - 0.006, gy1 + 0.006, w0 - 0.003, w0 + 0.002, { l: 0.006, r: 0.006, t: 0.006, b: 0.006 }, 'inox'));
  leaf.push(pane(f, gu0, gu1, gy0, gy1, 0.032, 0.058, 'verreDepoli'));
  // barre de tirage inox (extérieur, côté serrure)
  const up = latchA0 ? u0 + 0.11 : u1 - 0.11;
  const wb = -0.062;
  leaf.push(tube(f.P3(up, y0 + 0.45, wb), f.P3(up, y0 + 1.75, wb), 0.016, 'inox', 20));
  for (const yy of [y0 + 0.60, y0 + 1.60]) leaf.push(tube(f.P3(up, yy, wb), f.P3(up, yy, w0), 0.009, 'inox', 12));
  // cylindre de serrure (rosace extérieure)
  leaf.push(tube(f.P3(up, y0 + 1.02, w0), f.P3(up, y0 + 1.02, w0 - 0.008), 0.018, 'inox', 16));
  // béquille intérieure
  const uq = latchA0 ? u0 + 0.065 : u1 - 0.065;
  leaf.push(...bequille(f.P3(uq, y0 + 1.05, w1), f.vW, latchA0 ? f.vU : neg(f.vU)));
  // paumelles (porte ouvrant vers l'extérieur)
  const uhg = latchA0 ? u1 - 0.004 : u0 + 0.004;
  for (const yy of [y0 + 0.25, y0 + 1.05, y0 + 1.80]) {
    const [x, , z] = f.P3(uhg, 0, w0 - 0.008);
    out.push(cylinderY(x, z, yy, yy + 0.12, 0.010, AL, 12));
  }
  // pivot sur l'axe des paumelles ; ouverture vers l'extérieur (côté w négatif)
  const [hx, , hz] = f.P3(uhg, 0, w0 - 0.008);
  const [lx, , lz] = f.P3(latchA0 ? u0 : u1, 0, w0 - 0.008);
  const [ex, , ez] = f.P3(uhg, 0, w0 - 1.008);
  const phi = wrapAngle(angXZ(ex - hx, ez - hz) - angXZ(lx - hx, lz - hz));
  const pivot = pivotGroup(leaf, hx, hz);
  pivot.name = 'vantail-porte-entree';
  pivot.userData.door = { id: 'porte-entree', kind: 'hinge', closed: 0, open: phi, default: 0 };
  out.push(pivot);
  return out;
}

// Porte intérieure du sas vers la maison (fermée), huisserie dans l'épaisseur du mur
function sasHouseDoor(f) {
  const { W, y0, y1, D } = f;
  const out = [];
  const L = 0.015, cw = 0.065, ct = 0.012;
  // huisserie / ébrasement blanc sur toute l'épaisseur
  out.push(f.B(0, y0, 0, L, y1, D, 'blancLaque'));
  out.push(f.B(W - L, y0, 0, W, y1, D, 'blancLaque'));
  out.push(f.B(L, y1 - L, 0, W - L, y1, D, 'blancLaque'));
  // chambranles côté sas
  out.push(f.B(-cw, y0, D, 0, y1 + cw, D + ct, 'blancLaque'));
  out.push(f.B(W, y0, D, W + cw, y1 + cw, D + ct, 'blancLaque'));
  out.push(f.B(0, y1, D, W, y1 + cw, D + ct, 'blancLaque'));
  // butée de porte et vantail
  out.push(f.B(L, y0, D - 0.075, W - L, y1 - L, D - 0.065, 'blancLaque'));
  const wv0 = D - 0.058, wv1 = D - 0.018;
  out.push(f.B(L + 0.003, y0 + 0.008, wv0, W - L - 0.003, y1 - L - 0.003, wv1, 'blancLaque'));
  // béquille côté sas (serrure côté a0)
  out.push(...bequille(f.P3(L + 0.065, y0 + 1.05, wv1), f.vW, f.vU));
  return out;
}

// ---------------------------------------------------------------------------
// Menuiseries extérieures (OPENINGS)
// ---------------------------------------------------------------------------
const EXT_OPTS = {
  'rdc-dressing': { hinge: 'a1' },
  'rdc-chambre-sud': { hinge: 'a0', inner: { depth: 0.22, floor: 'chene' } },
  'rdc-sdb': { hinge: 'a0' },
  'rdc-wc': { hinge: 'a1' },
  'sas-entree': { hinge: 'a1' },
  'sas-ouest': { inner: { depth: 0.22, floor: 'carrelageSol' } },
};

function buildOpening(o) {
  const f = openingFrame(o);
  const opt = EXT_OPTS[o.id] || {};
  const floorLevel = o.level === 'etage' ? LV.slabTop : LV.rdc;
  const plainPied = Math.abs(o.y0 - floorLevel) < 0.02;
  const out = [];
  switch (o.kind) {
    case 'porte-fenetre-1v': out.push(...casement(f, { hinge: opt.hinge, plainPied: true })); break;
    case 'fenetre-1v': out.push(...casement(f, { hinge: opt.hinge, plainPied })); break;
    case 'baie-coulissante-2v': out.push(...slider(f)); break;
    case 'fenetre-fixe-haute': out.push(...fixedFull(f)); break;
    case 'porte-entree': out.push(...entryDoor(f, { hinge: opt.hinge })); break;
    case 'porte-interieure': return sasHouseDoor(f);
    default: console.warn('[menuiseries] type inconnu', o.kind); return [];
  }
  if (plainPied) out.push(...seuil(f, opt.inner));
  else out.push(...appui(f));
  return out;
}

// ---------------------------------------------------------------------------
// Portes intérieures (DOORS)
// ---------------------------------------------------------------------------
// Largeur des chambranles par face (f0 : côté plane[0], f1 : côté plane[1]) et par côté [a0, a1],
// réduite là où un mur en retour est proche.
const CASING = {
  'porte-wc': { f0: [0.045, 0.045], f1: [0.06, 0.045] },
  'porte-chambre': { f0: [0.06, 0.06], f1: [0.06, 0.045] },
  'porte-ch1': { f0: [0.06, 0.06], f1: [0.06, 0.022] },
  'porte-ch2': { f0: [0.06, 0.022], f1: [0.06, 0.06] },
  'galandage-dressing': { f0: [0.06, 0.045], f1: [0.06, 0.045] },
};
const LEAF = { w: 0.83, h: 2.04, t: 0.04 };
const CT = 0.012; // épaisseur chambranle
const LIN = 0.015; // épaisseur huisserie (ébrasement)

// Ouvrants animables (visite guidée) : les pièces mobiles sont regroupées autour de leur axe.
//   userData.door = { id, kind: 'hinge'|'slide', closed, open, default, dir? }
//   hinge : rotation Y du pivot (rad) ; slide : décalage (m) le long de dir = [dx, dz]
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const angXZ = (x, z) => Math.atan2(x, z);
function pivotGroup(parts, px, pz) {
  const pivot = new THREE.Group();
  pivot.position.set(px, 0, pz);
  const inner = new THREE.Group();
  inner.position.set(-px, 0, -pz);
  parts.forEach((m) => inner.add(m));
  pivot.add(inner);
  return pivot;
}
function slideGroup(parts) {
  const g = new THREE.Group();
  parts.forEach((m) => g.add(m));
  return g;
}

function doorKit(d) {
  const yb = d.level === 'etage' ? LV.slabTop : LV.rdc;
  const toXZ = (a, n) => (d.wallAxis === 'x' ? [n, a] : [a, n]);
  const P3 = (a, y, n) => { const [x, z] = toXZ(a, n); return [x, y, z]; };
  const Bx = (a0, y0, n0, a1, y1, n1, m) => {
    const [xa, za] = toXZ(a0, n0), [xb, zb] = toXZ(a1, n1);
    return box(Math.min(xa, xb), Math.min(y0, y1), Math.min(za, zb), Math.max(xa, xb), Math.max(y0, y1), Math.max(za, zb), m);
  };
  const vec = (da, dn) => { const [x, z] = toXZ(da, dn); return [x, 0, z]; };
  return { yb, toXZ, P3, Bx, vec };
}

// Huisserie : ébrasement dans l'épaisseur + chambranles sur les deux faces
function huisserie(d, k, { jambs = [true, true], hTop = 2.04 } = {}) {
  const { yb, Bx } = k;
  const [p0, p1] = d.plane;
  const out = [];
  const yt = yb + hTop;
  if (jambs[0]) out.push(Bx(d.a0, yb, p0, d.a0 + LIN, yt, p1, 'blancLaque'));
  if (jambs[1]) out.push(Bx(d.a1 - LIN, yb, p0, d.a1, yt, p1, 'blancLaque'));
  out.push(Bx(d.a0, yt - LIN, p0, d.a1, yt, p1, 'blancLaque'));
  const cas = CASING[d.id];
  if (cas) {
    for (const [side, n0, n1] of [['f0', p0 - CT, p0], ['f1', p1, p1 + CT]]) {
      const [c0, c1] = cas[side];
      out.push(Bx(d.a0 - c0, yb, n0, d.a0, yt + Math.min(c0, c1, 0.06), n1, 'blancLaque'));
      out.push(Bx(d.a1, yb, n0, d.a1 + c1, yt + Math.min(c0, c1, 0.06), n1, 'blancLaque'));
      out.push(Bx(d.a0, yt, n0, d.a1, yt + Math.min(c0, c1, 0.06), n1, 'blancLaque'));
    }
  }
  return out;
}

function hingedDoor(d) {
  const k = doorKit(d);
  const { yb, toXZ, P3 } = k;
  const out = huisserie(d, k);
  const [p0, p1] = d.plane;
  const ot = d.opensToward;
  const nf = ot > 0 ? p1 : p0;               // face côté ouverture
  const latchA = d.hingeAt === d.a1 ? d.a0 : d.a1;
  const cs = Math.sign(latchA - d.hingeAt);  // direction paumelles -> serrure le long du mur
  const th = (d.openAngleDeg ?? 90) * Math.PI / 180;
  // en (a, n) : c = (cs, 0) ; nrm = (0, ot). Le vantail est construit FERMÉ puis pivoté.
  const H = [d.hingeAt, nf + ot * CT];       // axe de rotation au nu du chambranle
  const dv = [cs, 0];                        // direction du vantail fermé
  const tv = [0, -ot];                       // épaisseur du vantail (vers la baie)
  const pt = (s, t) => [H[0] + s * dv[0] + t * tv[0], H[1] + s * dv[1] + t * tv[1]];
  const L = LEAF.w, T = LEAF.t;
  const leaf = [];
  const foot = [pt(0, 0), pt(L, 0), pt(L, T), pt(0, T)].map(([a, n]) => toXZ(a, n));
  leaf.push(prismY(foot, yb + 0.005, yb + 0.005 + LEAF.h, 'blancLaque'));
  // béquilles inox des deux côtés, levier vers les paumelles
  const tW = k.vec(tv[0], tv[1]), dW = k.vec(-dv[0], -dv[1]);
  const [qa0, qn0] = pt(L - 0.065, 0), [qa1, qn1] = pt(L - 0.065, T);
  leaf.push(...bequille(P3(qa0, yb + 1.05, qn0), neg(tW), dW));
  leaf.push(...bequille(P3(qa1, yb + 1.05, qn1), tW, dW));
  // paumelles inox (fixes, sur l'axe)
  const [hx, hz] = toXZ(...pt(0, -0.004));
  for (const yy of [0.18, 1.0, 1.82]) out.push(cylinderY(hx, hz, yb + yy, yb + yy + 0.10, 0.0075, 'inox', 12));
  // angle monde correspondant à l'ouverture th
  const [cx, cz] = toXZ(cs, 0), [ox, oz] = toXZ(cs * Math.cos(th), ot * Math.sin(th));
  const phi = wrapAngle(angXZ(ox, oz) - angXZ(cx, cz));
  const [px, pz] = toXZ(H[0], H[1]);
  const pivot = pivotGroup(leaf, px, pz);
  pivot.name = `vantail-${d.id}`;
  pivot.rotation.y = phi;
  pivot.userData.door = { id: d.id, kind: 'hinge', closed: 0, open: phi, default: phi };
  out.push(pivot);
  return out;
}

// Coulissante en applique côté chambre (SdB) : panneau + rail alu
function slidingSdb(d) {
  const k = doorKit(d);
  const { yb, Bx, P3 } = k;
  const out = [];
  const [p0, p1] = d.plane;
  const [pa0, pa1] = d.panelAt;
  const s = d.slideSide ?? 1;
  const n0 = p1, n1 = p1 + 0.04; // panneau côté chambre
  // ébrasement côté cloison P1 (a1) + linteau ; le côté a0 est la cloison du dressing
  out.push(Bx(d.a1 - LIN, yb, p0, d.a1, yb + 2.04, p1, 'blancLaque'));
  out.push(Bx(d.a0, yb + 2.04 - LIN, p0, d.a1, yb + 2.04, p1, 'blancLaque'));
  // panneau 0.85 x 2.04 (+ chariots et poignées) : groupe coulissant
  const mov = [];
  mov.push(Bx(pa0, yb + 0.008, n0 + 0.002, pa1, yb + 2.048, n1, 'blancLaque'));
  // rail alu en applique au-dessus de la baie (course = 2 x panneau)
  const r0 = d.a0 + 0.005, r1 = s > 0 ? d.a1 + 0.86 : d.a0 - 0.86;
  out.push(Bx(Math.min(r0, r1), yb + 2.055, n0, Math.max(r0, r1), yb + 2.115, n0 + 0.055, 'alu'));
  out.push(Bx(Math.min(r0, r1), yb + 2.050, n0 + 0.045, Math.max(r0, r1), yb + 2.120, n0 + 0.055, 'alu'));
  // chariots
  for (const a of [pa0 + 0.10, pa1 - 0.14]) mov.push(Bx(a, yb + 2.046, n0 + 0.012, a + 0.04, yb + 2.058, n0 + 0.030, 'noir'));
  // butées en bout de rail
  for (const a of [Math.min(r0, r1) + 0.01, Math.max(r0, r1) - 0.03]) out.push(Bx(a, yb + 2.035, n0 + 0.01, a + 0.02, yb + 2.055, n0 + 0.04, 'alu'));
  // guide au sol
  out.push(Bx(d.a1 + 0.02, yb, n1 + 0.002, d.a1 + 0.06, yb + 0.012, n1 + 0.018, 'alu'));
  // poignées : barre inox côté chambre, cuvette côté SdB, près du chant libre (côté a0)
  const ap = pa0 + 0.07;
  mov.push(tube(P3(ap, yb + 0.88, n1 + 0.045), P3(ap, yb + 1.22, n1 + 0.045), 0.011, 'inox', 14));
  for (const yy of [0.93, 1.17]) mov.push(tube(P3(ap, yb + yy, n1), P3(ap, yb + yy, n1 + 0.045), 0.007, 'inox', 10));
  mov.push(Bx(pa0 + 0.035, yb + 0.95, n0 + 0.0005, pa0 + 0.06, yb + 1.15, n0 + 0.0025, 'inox'));
  mov.push(Bx(pa0 + 0.04, yb + 0.955, n0 - 0.0005, pa0 + 0.055, yb + 1.145, n0 + 0.0015, 'noir'));
  const sg = slideGroup(mov);
  sg.name = `vantail-${d.id}`;
  const dirW = k.vec(s, 0);
  // fermé : panneau devant la baie (a0 - 1,5 cm) ; ouvert : en bout de rail
  sg.userData.door = { id: d.id, kind: 'slide', dir: [dirW[0], dirW[2]], closed: (d.a0 - 0.015) - pa0, open: (r1 - 0.85) - pa0, default: 0 };
  out.push(sg);
  return out;
}

// Porte à galandage du dressing : panneau escamoté dans la cloison, chant visible + poignée cuvette
function galandage(d) {
  const k = doorKit(d);
  const { yb, Bx } = k;
  const out = [];
  const [p0, p1] = d.plane;
  const mid = (p0 + p1) / 2, ht = 0.0175;
  // huisserie : jambage opposé + linteau ; côté poche : deux lèvres de part et d'autre de la fente
  out.push(Bx(d.a1 - LIN, yb, p0, d.a1, yb + 2.04, p1, 'blancLaque'));
  out.push(Bx(d.a0, yb + 2.04 - LIN, p0, d.a1, yb + 2.04, p1, 'blancLaque'));
  out.push(Bx(d.a0, yb, p0, d.a0 + 0.012, yb + 2.04 - LIN, mid - ht - 0.002, 'blancLaque'));
  out.push(Bx(d.a0, yb, mid + ht + 0.002, d.a0 + 0.012, yb + 2.04 - LIN, p1, 'blancLaque'));
  // chambranles
  const cas = CASING[d.id];
  for (const [side, n0, n1] of [['f0', p0 - CT, p0], ['f1', p1, p1 + CT]]) {
    const [c0, c1] = cas[side];
    const ch = Math.min(c0, c1);
    out.push(Bx(d.a0 - c0, yb, n0, d.a0, yb + 2.04 + ch, n1, 'blancLaque'));
    out.push(Bx(d.a1, yb, n0, d.a1 + c1, yb + 2.04 + ch, n1, 'blancLaque'));
    out.push(Bx(d.a0, yb + 2.04, n0, d.a1, yb + 2.04 + ch, n1, 'blancLaque'));
  }
  // panneau escamoté (dépasse de 2,5 cm dans le passage)
  const W = d.a1 - d.a0 + 0.02;
  const e1 = d.a0 + 0.025;
  const mov = [];
  mov.push(Bx(e1 - W, yb + 0.006, mid - ht, e1, yb + 2.03, mid + ht, 'blancLaque'));
  // poignée cuvette sur le chant (tirette)
  mov.push(Bx(e1, yb + 0.96, mid - 0.009, e1 + 0.002, yb + 1.12, mid + 0.009, 'inox'));
  mov.push(Bx(e1 + 0.0005, yb + 0.975, mid - 0.005, e1 + 0.0025, yb + 1.105, mid + 0.005, 'noir'));
  const sg = slideGroup(mov);
  sg.name = `vantail-${d.id}`;
  const dirW = k.vec(1, 0);
  sg.userData.door = { id: d.id, kind: 'slide', dir: [dirW[0], dirW[2]], closed: (d.a1 - 0.005) - e1, open: 0, default: 0 };
  out.push(sg);
  return out;
}

// ---------------------------------------------------------------------------
// Fenêtre de toit (pan Est)
// ---------------------------------------------------------------------------
function buildVelux() {
  const g = grp('fenetre-de-toit', 'toit', 'menuiserie');
  const V = VELUX;
  const a = Math.atan(ROOF.slope);
  const L = (V.z1 - V.z0) / Math.cos(a);
  const hw = (V.x1 - V.x0) / 2;
  const piv = new THREE.Group();
  piv.name = 'velux';
  // repère local : x en travers, y = normale (0 = dessus de couverture), z = le long de la pente (0 = bas)
  piv.position.set((V.x0 + V.x1) / 2, roofTop(V.z0), V.z0);
  piv.rotation.x = -a;
  const b = (x0, y0, z0, x1, y1, z1, m) => box(x0, y0, z0, x1, y1, z1, m);
  const lring = (x0, x1, z0, z1, y0, y1, fs, fb, ft, m) => [
    b(x0, y0, z0, x0 + fs, y1, z1, m), b(x1 - fs, y0, z0, x1, y1, z1, m),
    b(x0 + fs, y0, z0, x1 - fs, y1, z0 + fb, m), b(x0 + fs, y0, z1 - ft, x1 - fs, y1, z1, m),
  ];
  // dormant : partie intérieure blanche (dans l'épaisseur du toit), relevé extérieur anthracite
  add(g, piv);
  piv.add(...lring(-hw, hw, 0, L, -0.14, 0.0, 0.05, 0.05, 0.05, 'blancLaque'));
  piv.add(...lring(-hw, hw, 0, L, 0.0, 0.035, 0.05, 0.05, 0.05, AL));
  // ouvrant : intérieur blanc, capotage alu anthracite
  const sx = hw - 0.035, sz0 = 0.035, sz1 = L - 0.035;
  piv.add(...lring(-sx, sx, sz0, sz1, 0.015, 0.042, 0.055, 0.06, 0.09, 'blancLaque'));
  piv.add(...lring(-sx - 0.006, sx + 0.006, sz0 - 0.006, sz1 + 0.006, 0.042, 0.078, 0.06, 0.055, 0.10, AL));
  // vitrage
  const gl = b(-sx + 0.05, 0.048, sz0 + 0.05, sx - 0.05, 0.066, sz1 - 0.085, 'verre');
  piv.add(glassify(gl));
  // barre de manœuvre (en haut, côté intérieur)
  piv.add(b(-sx + 0.06, -0.004, sz1 - 0.085, sx - 0.06, 0.016, sz1 - 0.035, 'blancLaque'));
  // raquette d'étanchéité : bavette basse, joues latérales, couvre-joint haut
  const fw = 0.09;
  piv.add(b(-hw - fw, 0.001, -0.17, hw + fw, 0.012, 0.0, AL));
  piv.add(b(-hw - fw, -0.010, -0.18, hw + fw, 0.012, -0.17, AL));
  piv.add(b(-hw - fw, 0.001, 0.0, -hw, 0.020, L, AL));
  piv.add(b(hw, 0.001, 0.0, hw + fw, 0.020, L, AL));
  piv.add(b(-hw - fw, 0.001, L, hw + fw, 0.030, L + 0.13, AL));
  piv.add(b(-hw - fw, 0.020, L - 0.01, hw + fw, 0.036, L + 0.03, AL));
  piv.traverse((o) => { o.userData.level ??= 'toit'; o.userData.kind ??= 'menuiserie'; });
  return g;
}

// ---------------------------------------------------------------------------
// Garde-corps verre du balcon Ouest (sabot + verre feuilleté + main courante U)
// ---------------------------------------------------------------------------
function buildGardeCorps() {
  const g = grp('garde-corps-balcon', 'etage', 'menuiserie');
  const y0 = LV.slabTop, yTop = y0 + 1.0;
  const zf = 5.75;               // nez de dalle
  const zg = zf - 0.056;         // axe du verre
  const runs = [[JOUE_NORD.x1, POSTS[0].x0], [POSTS[0].x1, POSTS[1].x0]];
  for (const [x0, x1] of runs) {
    // sabot (profil de pied) posé en rive, face avant au nu du nez de dalle
    add(g, box(x0, y0 - 0.035, zf - 0.112, x1, y0 + 0.095, zf + 0.002, AL));
    // verre feuilleté en panneaux de ~1,15 m
    const n = Math.max(1, Math.round((x1 - x0) / 1.15));
    const pw = (x1 - x0 - 0.02) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 + 0.01 + i * pw + (i ? 0.005 : 0), bb = x0 + 0.01 + (i + 1) * pw - (i < n - 1 ? 0.005 : 0);
      add(g, glassify(box(a, y0 + 0.05, zg - 0.009, bb, yTop - 0.03, zg + 0.009, 'verreGardeCorps')));
    }
    // main courante en U
    add(g,
      box(x0, yTop - 0.012, zg - 0.021, x1, yTop, zg + 0.021, AL),
      box(x0, yTop - 0.042, zg - 0.021, x1, yTop - 0.012, zg - 0.013, AL),
      box(x0, yTop - 0.042, zg + 0.013, x1, yTop - 0.012, zg + 0.021, AL),
    );
  }
  return g;
}

// ---------------------------------------------------------------------------
export function buildJoinery() {
  const root = new THREE.Group();
  root.name = 'menuiseries';
  root.userData.kind = 'menuiserie';
  const groups = {
    rdc: grp('menuiseries-rdc', 'rdc', 'menuiserie'),
    etage: grp('menuiseries-etage', 'etage', 'menuiserie'),
  };
  for (const o of OPENINGS) {
    const g = grp(o.id, o.level, 'menuiserie');
    add(g, ...buildOpening(o));
    add(groups[o.level] || groups.rdc, g);
  }
  for (const d of DOORS) {
    const g = grp(d.id, d.level, 'menuiserie');
    if (d.sliding) add(g, ...slidingSdb(d));
    else if (d.pocket) add(g, ...galandage(d));
    else add(g, ...hingedDoor(d));
    add(groups[d.level] || groups.rdc, g);
  }
  root.add(groups.rdc, groups.etage, buildVelux(), buildGardeCorps());
  return root;
}
