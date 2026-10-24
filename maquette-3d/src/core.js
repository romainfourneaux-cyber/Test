// Utilitaires partagés par tous les modules de la maquette.
// Convention : x vers le sud, z vers l'ouest, y vers le haut, unités en mètres (voir spec.js).
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Matériaux "coupables" : quand un plan de coupe (renderer.clippingPlanes) tranche
// un volume fermé, ses faces arrière deviennent visibles ; on les peint d'une
// couleur unie (poché d'architecte). Le volume doit être fermé (box, extrusion).
// ---------------------------------------------------------------------------
export function cappedMaterial(params = {}, capColor = '#8a8a8a', Kind = THREE.MeshStandardMaterial) {
  const m = new Kind({ side: THREE.DoubleSide, ...params });
  m.userData.capColor = new THREE.Color(capColor);
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uCap = { value: m.userData.capColor };
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform vec3 uCap;\nvoid main() {')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n  if (!gl_FrontFacing) { gl_FragColor = vec4(uCap, 1.0); }');
  };
  m.customProgramCacheKey = () => 'cap' + capColor;
  return m;
}

// Registre de matériaux nommés, rempli par materials.js (initMaterials).
export const MAT = {};
const fallback = new Map();
export function mat(name) {
  if (MAT[name]) return MAT[name];
  if (!fallback.has(name)) {
    console.warn('[maquette] matériau manquant :', name);
    fallback.set(name, cappedMaterial({ color: '#ff00ff', roughness: 0.8 }, '#aa00aa'));
  }
  return fallback.get(name);
}
const asMat = (m) => (typeof m === 'string' ? mat(m) : m);

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
// Boîte alignée sur les axes, définie par ses coins. m : nom/matériau ou tableau de 6
// (ordre three.js : +x, -x, +y, -y, +z, -z).
export function box(x0, y0, z0, x1, y1, z1, m, { cast = true, receive = true, name } = {}) {
  const sx = Math.abs(x1 - x0), sy = Math.abs(y1 - y0), sz = Math.abs(z1 - z0);
  if (sx < 1e-4 || sy < 1e-4 || sz < 1e-4) return new THREE.Group();
  const g = new THREE.BoxGeometry(sx, sy, sz);
  boxUV(g, sx, sy, sz);
  const material = Array.isArray(m) ? m.map(asMat) : asMat(m);
  const mesh = new THREE.Mesh(g, material);
  mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  mesh.castShadow = cast; mesh.receiveShadow = receive;
  if (name) mesh.name = name;
  return mesh;
}

// UV en mètres (1 unité UV = 1 m) pour que les textures aient une échelle réelle.
function boxUV(g, sx, sy, sz) {
  const uv = g.attributes.uv;
  // 6 faces x 4 sommets : +x,-x (z,y), +y,-y (x,z), +z,-z (x,y)
  const dims = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
  for (let f = 0; f < 6; f++) {
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * dims[f][0], uv.getY(k) * dims[f][1]);
    }
  }
  uv.needsUpdate = true;
}

// Prisme vertical : polygone en plan [[x,z],...] extrudé de y0 à y1.
export function prismY(pts, y0, y1, m, opts = {}) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);           // shape (x,-z) dans le plan XY -> plan XZ, extrusion vers +y
  g.translate(0, y0, 0);
  worldUV(g);
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.castShadow = opts.cast ?? true; mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}

// Prisme selon x : polygone dans le plan (z,y) [[z,y],...] extrudé de x0 à x1.
export function prismX(pts, x0, x1, m, opts = {}) {
  const shape = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false });
  // shape dans XY (x=z, y=y), extrusion vers +z  ->  on veut extrusion vers +x
  g.rotateY(Math.PI / 2);            // (X,Y,Z) -> (Z,Y,-X) : la forme x devient -z... corrigé ci-dessous
  g.scale(1, 1, -1);
  g.translate(x0, 0, 0);
  fixWinding(g);
  worldUV(g);
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.castShadow = opts.cast ?? true; mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}

// Prisme selon z : polygone dans le plan (x,y) [[x,y],...] extrudé de z0 à z1.
export function prismZ(pts, z0, z1, m, opts = {}) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false });
  g.translate(0, 0, z0);
  worldUV(g);
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.castShadow = opts.cast ?? true; mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}

function fixWinding(g) {
  // après un scale négatif, on inverse l'ordre des triangles pour garder des normales sortantes
  const idx = g.index;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i + 1); idx.setX(i + 1, idx.getX(i + 2)); idx.setX(i + 2, a); }
    idx.needsUpdate = true;
  } else {
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i += 3) {
      for (const att of [p, n, uv]) {
        if (!att) continue;
        for (let c = 0; c < att.itemSize; c++) {
          const t = att.array[(i + 1) * att.itemSize + c];
          att.array[(i + 1) * att.itemSize + c] = att.array[(i + 2) * att.itemSize + c];
          att.array[(i + 2) * att.itemSize + c] = t;
        }
      }
    }
    p.needsUpdate = true;
  }
  g.computeVertexNormals();
}

// UV triplanaires grossières en coordonnées monde (mètres) : utile pour textures d'enduit / placo.
export function worldUV(g) {
  g.computeVertexNormals();
  const p = g.attributes.position, n = g.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); }
    else if (ax >= az) { u = p.getZ(i); v = p.getY(i); }
    else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u; uv[i * 2 + 1] = v;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

export function cylinderY(x, z, y0, y1, r, m, seg = 24, opts = {}) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, seg);
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.position.set(x, (y0 + y1) / 2, z);
  mesh.castShadow = opts.cast ?? true; mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}

// Cylindre entre deux points quelconques (tubes, mains courantes)
export function tube(a, b, r, m, seg = 16) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  const mesh = new THREE.Mesh(g, asMat(m));
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// Mur (boîte) percé d'ouvertures rectangulaires.
// axis 'x' : le mur court le long de x (épaisseur selon z, [n0,n1]) ; axis 'z' : le long de z (épaisseur selon x).
// a0..a1 = étendue le long du mur, y0..y1 = hauteur ; holes = [{a0,a1,y0,y1}]
export function wallWithHoles({ axis, a0, a1, n0, n1, y0, y1, holes = [], m }) {
  const grp = new THREE.Group();
  const hs = holes
    .map((h) => ({ a0: Math.max(a0, h.a0), a1: Math.min(a1, h.a1), y0: Math.max(y0, h.y0), y1: Math.min(y1, h.y1) }))
    .filter((h) => h.a1 > h.a0 + 1e-4 && h.y1 > h.y0 + 1e-4)
    .sort((p, q) => p.a0 - q.a0);
  // découpe en bandes verticales aux bords des trous
  const cuts = new Set([a0, a1]);
  hs.forEach((h) => { cuts.add(h.a0); cuts.add(h.a1); });
  const xs = [...cuts].sort((p, q) => p - q);
  for (let i = 0; i < xs.length - 1; i++) {
    const s0 = xs[i], s1 = xs[i + 1];
    if (s1 - s0 < 1e-4) continue;
    const mid = (s0 + s1) / 2;
    const inHoles = hs.filter((h) => h.a0 <= mid && mid <= h.a1).sort((p, q) => p.y0 - q.y0);
    let cur = y0;
    const spans = [];
    for (const h of inHoles) { if (h.y0 > cur) spans.push([cur, h.y0]); cur = Math.max(cur, h.y1); }
    if (cur < y1) spans.push([cur, y1]);
    for (const [b0, b1] of spans) {
      grp.add(axis === 'x' ? box(s0, b0, n0, s1, b1, n1, m) : box(n0, b0, s0, n1, b1, s1, m));
    }
  }
  return grp;
}

// Mur pignon : polygone vertical (dans le plan z,y) extrudé en x, percé d'ouvertures (z,y).
// On découpe le polygone en bandes verticales en z, chaque bande étant un prisme.
export function gableWithHoles({ x0, x1, profile, holes = [], m }) {
  // profile(z) -> [ybas, yhaut] ; zs = bornes ; holes = [{a0,a1,y0,y1}] en z/y
  const grp = new THREE.Group();
  const { z0, z1, yBot, yTop } = profile;
  const cuts = new Set([z0, z1, ...profile.breaks]);
  holes.forEach((h) => { cuts.add(h.a0); cuts.add(h.a1); });
  const zs = [...cuts].filter((v) => v >= z0 && v <= z1).sort((p, q) => p - q);
  for (let i = 0; i < zs.length - 1; i++) {
    const s0 = zs[i], s1 = zs[i + 1];
    if (s1 - s0 < 1e-4) continue;
    const mid = (s0 + s1) / 2;
    const inHoles = holes.filter((h) => h.a0 <= mid && mid <= h.a1).sort((p, q) => p.y0 - q.y0);
    const b0 = yBot(mid);
    const tops = [yTop(s0), yTop(s1)];
    let cur = b0;
    for (const h of inHoles) {
      if (h.y0 > cur) grp.add(prismX([[s0, cur], [s1, cur], [s1, h.y0], [s0, h.y0]], x0, x1, m));
      cur = Math.max(cur, h.y1);
    }
    // dernier morceau jusqu'au rampant (trapèze)
    if (Math.min(...tops) > cur + 1e-4) grp.add(prismX([[s0, cur], [s1, cur], [s1, tops[1]], [s0, tops[0]]], x0, x1, m));
  }
  return grp;
}

// Étiquetage pour les filtres d'affichage
//   level : 'rdc' | 'etage' | 'toit' | 'site'
//   kind  : 'structure' | 'plafond' | 'menuiserie' | 'escalier' | 'mobilier' | 'eclairage' | 'site'
export function tag(obj, level, kind) {
  obj.userData.level = level;
  obj.userData.kind = kind;
  obj.traverse((o) => { if (o !== obj) { o.userData.level ??= level; o.userData.kind ??= kind; } });
  return obj;
}

export function grp(name, level, kind) {
  const g = new THREE.Group();
  g.name = name;
  g.userData.level = level; g.userData.kind = kind;
  return g;
}

// Ajoute des enfants et propage les tags
export function add(parent, ...children) {
  for (const c of children) {
    if (!c) continue;
    parent.add(c);
    c.traverse((o) => { o.userData.level ??= parent.userData.level; o.userData.kind ??= parent.userData.kind; });
  }
  return parent;
}

// Lumière d'ambiance intérieure (plafonnier) : point light chaude + diffuseur émissif
export function ceilingLight(x, y, z, { intensity = 2.0, distance = 6, color = '#ffe2b8', disk = 0.12 } = {}) {
  const g = new THREE.Group();
  const l = new THREE.PointLight(color, intensity, distance, 1.6);
  l.position.set(x, y - 0.08, z);
  l.castShadow = false;
  g.add(l);
  const d = new THREE.Mesh(new THREE.CylinderGeometry(disk, disk, 0.025, 24), mat('luminaire'));
  d.position.set(x, y - 0.0125, z);
  g.add(d);
  g.userData.kind = 'eclairage';
  return g;
}

export { THREE };
