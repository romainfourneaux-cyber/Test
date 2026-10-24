// Abords de l'extension — visuel d'architecte inspiré du photo-montage du client (façade Ouest :
// pelouse, terrasse bois, haie taillée vert-jaune, grands arbres en arrière-plan, soleil d'après-midi).
// La maison existante n'est PAS modélisée (le client ne veut voir que l'extension et son sas).
//
//   abords (level 'site', kind 'site')            masqué dans les vues de détail rapprochées
//   ├─ sol-proche     socle engazonné ~15 x 16,5 m, terrasse bois + marche, gravier, massif, allée et
//   │                 patio dallés, haie, arbustes, graminées
//   ├─ sol-lointain   couronne de pelouse jusqu'à ~60 x 60 m + sol d'horizon      (masqué en fond "studio")
//   ├─ arbres         arbres d'arrière-plan (nord, nord-est, est, sud-est, ouest lointain) (idem)
//   └─ mobilier-jardin  table, 2 chaises, 2 pots (kind 'mobilier' : suit le bouton « Mobilier »)
//
// Le terrain est un ensemble de volumes FERMÉS (socle percé + couronne), sans recouvrement avec les
// fondations du bâtiment : les coupes (plans de coupe) montrent un poché de terre propre.
// Géométrie fusionnée par matériau (≈ 25 appels de dessin, ≈ 40 000 triangles) : fluide sur téléphone.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { grp, mat, cappedMaterial, worldUV, MAT } from './core.js';
import { LV, FOOT, SAS, POSTS } from './spec.js';

// ---------------------------------------------------------------------------
// Implantation (repère spec.js : x vers le sud, z vers l'ouest, y vers le haut)
// ---------------------------------------------------------------------------
const G = LV.ground;                 // -0.15 : terrain fini
const BOT = -0.45;                   // sous-face du socle (= sous-face des fondations)
export const SITE = {
  deck: { x0: -0.60, x1: 8.90, z0: FOOT.z1, z1: 8.30, top: -0.02, nose: 0.015 },   // terrasse bois
  step: { x0: 4.36, x1: 6.36, z0: 8.30, z1: 8.72, top: -0.085 },                     // marche vers la pelouse (axe de la baie)
  landing: { x0: 6.95, x1: 8.55, z0: -1.25, z1: 0.0, top: -0.02 },                   // palier dallé devant la porte du sas
  stones: { x0: 7.15, x1: 8.35, depth: 0.50, gap: 0.14, n: 5, top: G + 0.02 },       // allée en pas japonais vers l'est
  patio: { x0: SAS.outer.x0, x1: SAS.outer.x1, z0: SAS.outer.z1, z1: FOOT.z1, top: -0.02 },
  gravel: 0.40,                                                                       // bande de gravier le long des murs
  bed: { x0: 0.40, x1: 6.95, z0: -1.00, z1: -0.40 },                                  // massif de graminées, façade Est
  hedge: { x0: 8.98, x1: 9.58, z0: 5.05, z1: 8.60, h: 1.05 },                         // haie taillée vert-jaune (bord sud)
  socle: { x0: -3.0, x1: 12.0, z0: -6.0, z1: 10.5 },
  lawn: { x0: -26.0, x1: 34.0, z0: -27.0, z1: 33.0 },                                 // ~60 x 60 m centré sur le bâtiment
};

// Vues (src/app.js VIEWS) où l'on masque des éléments
const STUDIO_VIEWS = ['axo-rdc', 'coupe-escalier', 'etage'];                          // fond studio : socle seul
const DETAIL_VIEWS = ['detail-raccord', 'detail-echiffre', 'detail-fixation'];       // gros plans intérieurs : rien

// Arbres d'arrière-plan : [x, z, type, hauteur, largeur, teinte]
//   type : 'r' feuillu arrondi, 'c' colonnaire, 'p' conifère, 'h' lisière lointaine (simplifié)
//   placés pour ne masquer ni « Façade jardin » (depuis le nord-ouest) ni « Façade entrée » (depuis le sud-est)
export const TREES = [
  // est (derrière le bâtiment dans la vue jardin)
  [-4.5, -17.5, 'r', 11, 7.5, 0], [1.5, -21.5, 'r', 13, 8.5, 1], [7.5, -17.0, 'c', 12.5, 3.6, 2],
  [12.0, -23.5, 'r', 12, 8.5, 0], [17.5, -18.5, 'r', 10, 7.0, 1], [5.5, -27.0, 'r', 14, 9.5, 3],
  [-1.0, -25.5, 'p', 12, 4.6, 4], [22.5, -24.0, 'r', 12.5, 8.5, 0], [10.5, -14.0, 'r', 8.5, 6.0, 1],
  // nord-est
  [-12.0, -12.5, 'r', 12, 8.0, 3], [-17.5, -6.0, 'c', 14, 4.2, 2], [-8.5, -21.0, 'r', 10.5, 7.5, 0], [-20.0, -16.0, 'p', 13, 5.0, 4],
  // nord (fond de la vue « Façade entrée »)
  [-14.5, 2.5, 'r', 11, 7.5, 1], [-19.5, 9.5, 'r', 13, 8.5, 0], [-12.5, 9.0, 'r', 15, 8.0, 3], [-17.0, -2.0, 'c', 15, 4.5, 2], [-13.5, 15.0, 'p', 11, 4.4, 4], [-22.5, -0.5, 'r', 12, 8.0, 3],
  // ouest lointain (derrière la terrasse dans la vue « Façade entrée », dans le dos de la vue jardin)
  [-6.0, 26.0, 'r', 12, 8.0, 0], [3.5, 30.0, 'c', 13, 4.0, 2], [-15.0, 22.5, 'r', 11, 7.5, 1], [12.0, 29.0, 'r', 11, 8.0, 3],
  // sud-est (à droite de la vue jardin, comme sur la photo)
  [24.5, -6.5, 'r', 13, 9.0, 1], [29.5, -13.0, 'r', 12, 8.0, 0], [20.5, -11.5, 'p', 11, 4.5, 4], [30.0, -1.0, 'r', 11.5, 8.0, 3],
  // sud lointain (vue aérienne)
  [30.0, 14.0, 'r', 12, 8.5, 0], [22.0, 24.0, 'r', 11, 7.5, 1],
  // lisière lointaine au-delà de la pelouse (ferme l'horizon)
  [-8.0, -38.0, 'h', 14, 10, 3], [6.0, -40.0, 'h', 15, 11, 0], [20.0, -37.0, 'h', 13, 10, 1], [34.0, -32.0, 'h', 14, 10, 3],
  [-24.0, -30.0, 'h', 14, 10, 0], [-35.0, -14.0, 'h', 15, 11, 1], [-36.0, 4.0, 'h', 13, 10, 3], [-33.0, 20.0, 'h', 14, 10, 0],
  [40.0, -18.0, 'h', 14, 10, 0], [42.0, -2.0, 'h', 13, 10, 1], [-16.0, -36.0, 'h', 13, 10, 1], [13.0, -42.0, 'h', 14, 11, 3],
  [27.0, -36.0, 'h', 12, 9, 0], [-1.0, -44.0, 'h', 15, 11, 1], [-30.0, -24.0, 'h', 13, 10, 3], [-40.0, 12.0, 'h', 14, 10, 1],
];

// Teintes (sRGB) : houppiers de printemps ensoleillés, conifère sombre, haie vert-jaune
const TREE_COLORS = ['#5a7d34', '#6b8c3a', '#4f7038', '#62803f', '#34503a'];

// ---------------------------------------------------------------------------
// Outils : hasard déterministe, bruit
// ---------------------------------------------------------------------------
function rng(seed = 1) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash3(i, j, k, s) {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 1274126177) ^ Math.imul(s + 7, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise3(x, y, z, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => hash3(xi + a, yi + b, zi + d, s);
  const L = (a, b, t) => a + (b - a) * t;
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v),
    L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const fbm = (x, y, z, s = 0) => 0.6 * noise3(x, y, z, s) + 0.3 * noise3(2.07 * x, 2.07 * y, 2.07 * z, s + 1) + 0.1 * noise3(4.3 * x, 4.3 * y, 4.3 * z, s + 2);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------------------
// Fusion par matériau
// ---------------------------------------------------------------------------
class Buckets {
  constructor() { this.map = new Map(); }
  add(key, material, ...geos) {
    let b = this.map.get(key);
    if (!b) { b = { material, geos: [] }; this.map.set(key, b); }
    b.geos.push(...geos.filter(Boolean));
  }
  flush(parent, { cast = true, receive = true } = {}) {
    for (const [key, b] of this.map) {
      const m = b.material;
      const keep = ['position', 'normal'];
      if (m.map || m.normalMap) keep.push('uv');
      if (m.vertexColors) keep.push('color');
      let geos = b.geos.map((g) => {
        if (keep.includes('uv') && !g.attributes.uv) worldUV(g);
        if (!g.attributes.normal) g.computeVertexNormals();
        if (keep.includes('color') && !g.attributes.color) paint(g, new THREE.Color(1, 1, 1));
        for (const n of Object.keys(g.attributes)) if (!keep.includes(n)) g.deleteAttribute(n);
        g.morphAttributes = {};
        g.clearGroups();
        return g;
      });
      if (geos.some((g) => g.index) && !geos.every((g) => g.index)) geos = geos.map((g) => (g.index ? g.toNonIndexed() : g));
      const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
      if (!merged) { console.warn('[abords] fusion impossible :', key); continue; }
      merged.computeBoundingSphere();
      merged.computeBoundingBox();
      const mesh = new THREE.Mesh(merged, m);
      mesh.name = key;
      mesh.castShadow = cast; mesh.receiveShadow = receive;
      parent.add(mesh);
      geos.forEach((g) => { if (g !== merged) g.dispose(); });
    }
    this.map.clear();
  }
}

// Boîte par ses coins, UV en mètres (coordonnées monde)
function boxG(x0, y0, z0, x1, y1, z1) {
  const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  worldUV(g);
  return g;
}

// Dalle horizontale : polygone [[x,z],...] percé de trous, extrudé de y0 à y1 (volume fermé)
function slabG(outer, holes, y0, y1) {
  const shape = new THREE.Shape(outer.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  worldUV(g);
  return g;
}
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

// Géométrie placée par une matrice (repère local -> monde)
function placed(g, x, y, z, rotY = 0) {
  g.applyMatrix4(new THREE.Matrix4().makeRotationY(rotY).setPosition(x, y, z));
  return g;
}

// Couleurs de sommets : base x ombrage vertical (dessous plus sombre) x variation douce
function paint(g, base, { y0 = 0, y1 = 1, dark = 0.62, light = 1.06, jitter = 0.0, seed = 0, tip = null } = {}) {
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = clamp01((y - y0) / Math.max(1e-3, y1 - y0));
    const k = (dark + (light - dark) * Math.pow(t, 0.85)) * (1 + jitter * (noise3(x * 1.7, y * 1.7, z * 1.7, seed) - 0.5) * 2);
    if (tip) c.copy(base).lerp(tip, t); else c.copy(base);
    col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// ---------------------------------------------------------------------------
// Matériaux locaux
// ---------------------------------------------------------------------------
// Bruit de valeur 3D en GLSL (feuillage : tavelure sans UV, à partir de la position monde)
const NOISE_GLSL = `
float sfH( vec3 p ) { p = fract( p * 0.1031 ); p += dot( p, p.zyx + 31.32 ); return fract( ( p.x + p.y ) * p.z ); }
float sfN( vec3 x ) {
  vec3 i = floor( x ); vec3 f = fract( x ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( mix( sfH( i ), sfH( i + vec3( 1.0, 0.0, 0.0 ) ), f.x ), mix( sfH( i + vec3( 0.0, 1.0, 0.0 ) ), sfH( i + vec3( 1.0, 1.0, 0.0 ) ), f.x ), f.y ),
              mix( mix( sfH( i + vec3( 0.0, 0.0, 1.0 ) ), sfH( i + vec3( 1.0, 0.0, 1.0 ) ), f.x ), mix( sfH( i + vec3( 0.0, 1.0, 1.0 ) ), sfH( i + vec3( 1.0, 1.0, 1.0 ) ), f.x ), f.y ), f.z );
}
`;
const f3 = (v) => Number(v).toFixed(3);

// Feuillage : couleurs de sommets + tavelure (touffes de feuilles, atténuée au loin pour éviter le scintillement)
function foliageMaterial(cap, { leaf = 9, clump = 2.2, fade = 28, amount = 1, rough = 0.86 } = {}) {
  const m = cappedMaterial({ color: '#ffffff', vertexColors: true, roughness: rough, metalness: 0 }, cap);
  const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey;
  m.onBeforeCompile = function (shader, r) {
    prev.call(this, shader, r);
    shader.vertexShader = 'varying vec3 vFolW;\n' + shader.vertexShader.replace('#include <worldpos_vertex>',
      '#include <worldpos_vertex>\n\tvFolW = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    shader.fragmentShader = 'varying vec3 vFolW;\n' + NOISE_GLSL + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
	{
		float fc = sfN( vFolW * ${f3(clump)} );
		float fl = sfN( vFolW * ${f3(leaf)} + 17.0 );
		float fk = clamp( 1.0 - length( vViewPosition ) / ${f3(fade)}, 0.0, 1.0 ) * ${f3(amount)};
		diffuseColor.rgb *= mix( 0.74, 1.12, smoothstep( 0.2, 0.8, fc ) ) * mix( 0.93, mix( 0.66, 1.15, fl ), fk );
	}`);
  };
  m.customProgramCacheKey = () => prevKey() + `|fol${leaf}/${clump}/${fade}/${amount}`;
  return m;
}

// Pelouse : texture 'herbe' du registre, échantillonnée deux fois (échelles / rotations différentes, mélange
// piloté par un bruit à grande échelle) + variation de teinte en plaques : plus de répétition visible.
function lawnMaterial() {
  const base = mat('herbe');
  if (!base.map || !base.isMeshStandardMaterial) return base;
  const cap = base.userData?.capColor ? '#' + base.userData.capColor.getHexString() : '#5d4a37';
  const m = cappedMaterial({ color: base.color.clone(), map: base.map, roughness: base.roughness ?? 1, metalness: 0 }, cap);
  const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey;
  m.onBeforeCompile = function (shader, r) {
    prev.call(this, shader, r);
    shader.vertexShader = 'varying vec2 vLawnW;\n' + shader.vertexShader.replace('#include <worldpos_vertex>',
      '#include <worldpos_vertex>\n\tvLawnW = ( modelMatrix * vec4( transformed, 1.0 ) ).xz;');
    shader.fragmentShader = `varying vec2 vLawnW;
float lwH( vec2 p ) { vec3 q = fract( vec3( p.xyx ) * 0.1031 ); q += dot( q, q.yzx + 33.33 ); return fract( ( q.x + q.y ) * q.z ); }
float lwN( vec2 p ) { vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( lwH( i ), lwH( i + vec2( 1.0, 0.0 ) ), f.x ), mix( lwH( i + vec2( 0.0, 1.0 ) ), lwH( i + vec2( 1.0, 1.0 ) ), f.x ), f.y ); }
` + shader.fragmentShader.replace('#include <map_fragment>', `
#ifdef USE_MAP
	{
		vec2 lwB = mat2( 0.8, 0.6, -0.6, 0.8 ) * vMapUv * 0.61 + vec2( 0.31, 0.57 );
		float lwM = smoothstep( 0.32, 0.68, lwN( vLawnW * 0.23 + 3.1 ) );
		vec4 lwT = mix( texture2D( map, vMapUv ), texture2D( map, lwB ), lwM );
		float lwA = 0.62 * lwN( vLawnW * 0.09 ) + 0.38 * lwN( vLawnW * 0.31 + 7.3 );
		diffuseColor *= lwT;
		float lwL = dot( diffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
		diffuseColor.rgb = mix( vec3( lwL ), diffuseColor.rgb, 0.7 ) * 0.9;
		diffuseColor.rgb *= mix( vec3( 0.84, 0.88, 0.84 ), vec3( 1.10, 1.07, 0.92 ), lwA );
	}
#endif`);
  };
  m.customProgramCacheKey = () => prevKey() + '|lawn';
  return m;
}

// Paillage du massif (texture procédurale)
function mulchMaterial() {
  if (typeof document === 'undefined') return mat('terre');
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#3f3126'; g.fillRect(0, 0, S, S);
  const R = rng(91);
  for (let i = 0; i < 2400; i++) {
    g.fillStyle = `hsl(${20 + R() * 14},${26 + R() * 18}%,${17 + R() * 22}%)`;
    g.save(); g.translate(R() * S, R() * S); g.rotate(R() * Math.PI);
    g.fillRect(-4 - R() * 4, -1 - R() * 1.5, 7 + R() * 8, 2 + R() * 3); g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.repeat.set(1 / 0.7, 1 / 0.7);
  return cappedMaterial({ color: '#ffffff', map: t, roughness: 1 }, '#4a3b2e');
}

// ---------------------------------------------------------------------------
// Végétation
// ---------------------------------------------------------------------------
// Lobe de houppier : icosphère aplatie, déformée par un bruit doux (normales lissées)
function lobeG(c, r, { detail = 1, seed = 0, rough = 0.2, rotY = 0 } = {}) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const cs = Math.cos(rotY), sn = Math.sin(rotY);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let k = 1 + rough * (fbm(x * 1.25 + seed * 3.7, y * 1.25 + seed, z * 1.25 - seed * 1.3, seed) - 0.5) * 2.2;
    if (y < 0) k *= 1 - 0.16 * -y;                 // dessous un peu plus plat
    x *= k * r[0]; y *= k * r[1]; z *= k * r[2];
    p.setXYZ(i, c[0] + x * cs - z * sn, c[1] + y, c[2] + x * sn + z * cs);
  }
  g.computeVertexNormals();
  return g;
}

// Cylindre (tronc / branche) entre deux points
function stickG(a, b, r0, r1, seg = 6) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const g = new THREE.CylinderGeometry(r1, r0, A.distanceTo(B), seg, 1, false);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  g.deleteAttribute('uv');
  return g;
}

// Arbre : renvoie { leaves:[geo], bark:[geo] }
function treeG([x, z, type, h, w, tint], seed) {
  const R = rng(seed * 97 + 13);
  const leaves = [], bark = [];
  const base = new THREE.Color(TREE_COLORS[tint % TREE_COLORS.length]);
  const y0 = G - 0.05;
  const detail = type === 'h' ? 1 : 1;
  if (type === 'p') {
    // conifère : 4 étages de cônes déformés
    const rT = 0.06 + h * 0.006;
    bark.push(stickG([x, y0, z], [x, y0 + h * 0.45, z], rT, rT * 0.6, 6));
    const tiers = 5;
    for (let t = 0; t < tiers; t++) {
      const yb = y0 + h * (0.12 + t * 0.165), ht = h * (0.32 - t * 0.03);
      const rad = (w / 2) * (1 - t * 0.17) * (0.92 + R() * 0.16);
      let g = new THREE.ConeGeometry(rad, ht, 11, 3, false);
      g.deleteAttribute('normal'); g.deleteAttribute('uv');
      g = mergeVertices(g);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
        const k = 1 + 0.3 * (fbm(px * 1.6 + seed, py * 1.6 + t, pz * 1.6, seed) - 0.5) * 2;
        p.setXYZ(i, x + px * k, yb + ht / 2 + py, z + pz * k);
      }
      g.computeVertexNormals();
      leaves.push(g);
    }
    leaves.forEach((g, i) => paint(g, base, { y0: y0 + h * 0.1, y1: y0 + h, dark: 0.6, light: 1.0, jitter: 0.08, seed: seed + i }));
    return { leaves, bark };
  }
  if (type === 'c') {
    // colonnaire (charme fastigié / peuplier) : lobes empilés
    const rT = 0.06 + h * 0.006;
    const cb = y0 + h * 0.18;
    bark.push(stickG([x, y0, z], [x, y0 + h * 0.62, z], rT, rT * 0.55, 6));
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const yc = cb + (h - (cb - y0)) * t * 0.92;
      const rr = (w / 2) * (0.62 + 0.38 * Math.sin(Math.PI * Math.min(1, t * 1.08)));
      const off = (R() - 0.5) * 0.25 * w;
      leaves.push(lobeG([x + off * 0.5, yc, z + off * 0.5], [rr, rr * 1.35, rr * 0.92], { detail, seed: seed + i, rough: 0.2, rotY: R() * 6.28 }));
    }
    leaves.forEach((g, i) => paint(g, base, { y0: cb, y1: y0 + h, dark: 0.66, light: 1.04, jitter: 0.08, seed: seed + i }));
    return { leaves, bark };
  }
  // feuillu arrondi (et lisière simplifiée 'h') : noyau + lobes aplatis répartis sur l'enveloppe
  const simple = type === 'h';
  const cBase = y0 + h * (0.17 + R() * 0.05), cTop = y0 + h;
  const cy = (cBase + cTop) / 2, ry = (cTop - cBase) / 2, rx = w / 2;
  const rT = 0.08 + h * 0.008;
  const fork = [x + (R() - 0.5) * 0.25, cBase + ry * 0.35, z + (R() - 0.5) * 0.25];
  bark.push(stickG([x, y0, z], fork, rT, rT * 0.72, simple ? 5 : 7));
  leaves.push(lobeG([x, cy + ry * 0.02, z], [rx * 0.74, ry * 0.8, rx * 0.74], { detail, seed, rough: 0.14, rotY: R() * 6.28 }));
  const n = simple ? 5 : 11 + Math.floor(R() * 4);
  for (let k = 0; k < n; k++) {
    // direction sur la sphère, lobe posé à ~60 % du rayon ; un lobe sur trois forme la couronne basse
    const a = (k / n) * Math.PI * 2 * 2.618 + R() * 0.8;
    const sy = k % 3 === 1 ? -0.62 + R() * 0.25 : -0.3 + R() * 1.1;
    const cr = Math.sqrt(Math.max(0, 1 - sy * sy));
    const d = 0.56 + R() * 0.12;
    const cx = x + Math.cos(a) * cr * rx * d, cz = z + Math.sin(a) * cr * rx * d;
    const cyy = cy + sy * ry * d;
    const s = 0.34 + R() * 0.1;
    leaves.push(lobeG([cx, cyy, cz], [rx * s, rx * s * 0.78, rx * s], { detail, seed: seed * 7 + k, rough: 0.16, rotY: R() * 6.28 }));
    if (!simple && k % 3 === 0) bark.push(stickG(fork, [x + (cx - x) * 0.55, cyy - rx * s * 0.3, z + (cz - z) * 0.55], rT * 0.5, rT * 0.22, 5));
  }
  leaves.forEach((g, i) => paint(g, base, { y0: cBase, y1: cTop, dark: 0.56, light: 1.08, jitter: 0.1, seed: seed + i }));
  return { leaves, bark };
}

// Boîte arrondie subdivisée et "taillée" (haie) : bords arrondis, fruit (dessus plus étroit), bosses légères
function hedgeG({ x0, x1, z0, z1, h }, seed = 3) {
  const W = x1 - x0, L = z1 - z0, y0 = G - 0.12, H = h + 0.12;
  let g = new THREE.BoxGeometry(W, H, L, 6, 9, Math.ceil(L / 0.09));
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const hx = W / 2, hy = H / 2, hz = L / 2, r = 0.13;
  const v = new THREE.Vector3(), q = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i));
    q.set(Math.max(-hx + r, Math.min(hx - r, v.x)), Math.max(-hy + r, Math.min(hy - r, v.y)), Math.max(-hz + r, Math.min(hz - r, v.z)));
    d.subVectors(v, q);
    const len = d.length();
    if (len > 1e-6) { d.multiplyScalar(1 / len); v.copy(q).addScaledVector(d, r); }
    const wx = x0 + hx, wz = z0 + hz;
    const ty = (v.y + hy) / H;                          // 0 au pied, 1 au dessus
    v.x *= 1 - 0.09 * ty;                              // fruit de taille
    const n = fbm((wx + v.x) * 2.6, (v.y + y0 + hy) * 2.6, (wz + v.z) * 2.6, seed) - 0.5;
    const n2 = noise3((wx + v.x) * 7.5, (v.y + y0 + hy) * 7.5, (wz + v.z) * 7.5, seed + 5) - 0.5;
    v.addScaledVector(d, 0.05 * n + 0.018 * n2);
    p.setXYZ(i, wx + v.x, y0 + hy + v.y, wz + v.z);
  }
  g.computeVertexNormals();
  return g;
}

// Touffe de graminées (lames fines tournées vers l'extérieur) + épis optionnels
function tuftG(x, z, { n = 18, h = 0.65, spread = 0.75, y = G - 0.02, seed = 1, base = '#4f6a2a', tip = '#c9c08a', plume = null } = {}) {
  const R = rng(seed);
  const out = [];
  const cb = new THREE.Color(base), ct = new THREE.Color(tip), cp = plume ? new THREE.Color(plume) : null;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const az = R() * Math.PI * 2, tilt = Math.pow(R(), 0.8) * spread;
    const len = h * (0.65 + R() * 0.45);
    const r0 = 0.006 + R() * 0.004;
    const g = new THREE.ConeGeometry(r0, len, 3, 1, false);
    g.deleteAttribute('uv');
    g.translate(0, len / 2, 0);
    g.scale(2.1, 1, 0.55);                                  // lame en ruban
    g.rotateY(az + Math.PI / 2);
    const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az));
    const qn = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const ox = (R() - 0.5) * 0.08, oz = (R() - 0.5) * 0.08;
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x + ox, y, z + oz), qn, new THREE.Vector3(1, 1, 1)));
    paint(g, cb, { y0: y, y1: y + len * dir.y, dark: 0.75, light: 1.0, tip: ct });
    out.push(g);
    if (cp && i % 3 === 0) {
      let e = new THREE.IcosahedronGeometry(1, 0);
      e.deleteAttribute('uv'); e.deleteAttribute('normal');
      e = mergeVertices(e);
      e.scale(0.03, 0.1, 0.03);
      e.translate(0, len + 0.05, 0);
      e.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x + ox, y, z + oz), qn, new THREE.Vector3(1, 1, 1)));
      e.computeVertexNormals();
      paint(e, cp, { y0: 0, y1: 1, dark: 1, light: 1 });
      out.push(e);
    }
  }
  return out;
}

// Lisière boisée lointaine (55-75 m) : masses de houppiers posées au sol, sans troncs, qui ferment
// l'horizon tout autour (la brume du ciel les fond dans le lointain). Une ouverture au sud-ouest
// (axe du jardin) laisse filer la pelouse.
function woodlandG(cx, cz, seed = 5) {
  const R = rng(seed);
  const out = [];
  const N = 46;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (R() - 0.5) * 0.08;
    // ouverture vers l'ouest-sud-ouest (x > 0, z > 0) : la pelouse file vers l'horizon
    const ad = Math.atan2(Math.sin(a - 0.75), Math.cos(a - 0.75));
    if (Math.abs(ad) < 0.42) continue;
    const rad = 58 + 14 * noise3(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0.5, seed) + R() * 6;
    const x = cx + Math.cos(a) * rad, z = cz + Math.sin(a) * rad;
    const h = 11 + R() * 7, w = 9 + R() * 5;
    const c = new THREE.Color(TREE_COLORS[i % 4]);
    for (let k = 0; k < 3; k++) {
      const ox = (R() - 0.5) * w * 0.6, oz = (R() - 0.5) * w * 0.6;
      const r = w * (0.36 + R() * 0.12), ry = h * (0.32 + R() * 0.1);
      const yc = G + ry * 0.9 + k * h * 0.12;
      const g = lobeG([x + ox, yc, z + oz], [r, ry, r], { detail: 1, seed: seed * 31 + i * 3 + k, rough: 0.22, rotY: R() * 6.28 });
      paint(g, c, { y0: G, y1: G + h, dark: 0.5, light: 1.0, jitter: 0.12, seed: i + k });
      out.push(g);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------
export function buildSite() {
  const S = SITE;
  const root = grp('abords', 'site', 'site');
  root.userData.hideInView = DETAIL_VIEWS;
  const near = grp('sol-proche', 'site', 'site');
  const far = grp('sol-lointain', 'site', 'site');
  far.userData.hideInView = STUDIO_VIEWS;
  const trees = grp('arbres', 'site', 'site');
  trees.userData.hideInView = STUDIO_VIEWS;
  const furn = grp('mobilier-jardin', 'site', 'mobilier');
  root.add(near, far, trees, furn);

  // --- Matériaux ---
  const mLawn = lawnMaterial();
  const mTerre = mat('terre');
  const mDeck = mat('terrasse');
  const mStone = mat('dallageExt');
  const g0 = mat('gravier');
  const mGravel = g0.map ? cappedMaterial({ color: '#9d9890', map: g0.map, roughness: 1 }, '#7d7468') : g0;
  const mSteel = mat('ral7016');
  const mCrepi = mat('crepi');
  const mJoint = cappedMaterial({ color: '#6f6a62', roughness: 1 }, '#5a564f');
  const mMulch = mulchMaterial();
  const mBark = cappedMaterial({ color: '#6a6058', roughness: 0.95 }, '#4a4038');
  const mHedge = foliageMaterial('#6f7a2a', { leaf: 15, clump: 4.0, fade: 30, amount: 1.0 });
  const mTree = foliageMaterial('#3d5228', { leaf: 7, clump: 1.6, fade: 30, amount: 0.9 });
  const mShrub = foliageMaterial('#2f4524', { leaf: 16, clump: 4.5, fade: 22, amount: 0.9 });
  const mGrass = cappedMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.8 }, '#5f6d3a');
  const mPot = cappedMaterial({ color: '#43484b', roughness: 0.78 }, '#2c3032');
  const mTeak = MAT.chene?.map
    ? cappedMaterial({ color: '#c39a72', map: MAT.chene.map, roughness: 0.62 }, '#7b5a3c')
    : cappedMaterial({ color: '#a37a52', roughness: 0.62 }, '#7b5a3c');

  const B = new Buckets();

  // =========================================================================
  // 1. Terrain : socle engazonné percé (bâtiment + aménagements) + couronne + horizon
  // =========================================================================
  const holeMain = [
    [-0.40, -0.40], [S.bed.x0, -0.40], [S.bed.x0, S.bed.z0], [S.bed.x1, S.bed.z0],
    [S.landing.x0, S.landing.z0], [S.landing.x1, S.landing.z0], [S.landing.x1, -0.40], [S.deck.x1, -0.40],
    [S.deck.x1, S.deck.z1], [S.step.x1, S.deck.z1], [S.step.x1, S.step.z1], [S.step.x0, S.step.z1],
    [S.step.x0, S.deck.z1], [S.deck.x0, S.deck.z1], [S.deck.x0, S.deck.z0], [-0.40, S.deck.z0],
  ];
  // la bande du massif touche le palier : point en double à supprimer (bed.x1 === landing.x0)
  const holeMainClean = holeMain.filter((p, i, a) => { const q = a[(i + a.length - 1) % a.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6; });
  const stones = [];
  for (let i = 0; i < S.stones.n; i++) {
    const z1 = S.landing.z0 - S.stones.gap - i * (S.stones.depth + S.stones.gap);
    stones.push({ x0: S.stones.x0, x1: S.stones.x1, z0: z1 - S.stones.depth, z1 });
  }
  const so = S.socle;
  const socle = slabG(rect(so.x0, so.z0, so.x1, so.z1), [holeMainClean, ...stones.map((s) => rect(s.x0, s.z0, s.x1, s.z1))], BOT, G);
  const socleMesh = new THREE.Mesh(socle, [mLawn, mTerre]);
  socleMesh.name = 'pelouse-socle'; socleMesh.receiveShadow = true; socleMesh.castShadow = false;
  near.add(socleMesh);

  const lw = S.lawn;
  const ring = slabG(rect(lw.x0, lw.z0, lw.x1, lw.z1), [rect(so.x0, so.z0, so.x1, so.z1)], BOT, G);
  const ringMesh = new THREE.Mesh(ring, [mLawn, mTerre]);
  ringMesh.name = 'pelouse-couronne'; ringMesh.receiveShadow = true; ringMesh.castShadow = false;
  ringMesh.userData.walkIgnore = true;
  far.add(ringMesh);

  // sol d'horizon (disque plat de 300 m au-delà de la pelouse) : pas de bord du monde à hauteur d'œil
  {
    const cx = (lw.x0 + lw.x1) / 2, cz = (lw.z0 + lw.z1) / 2;
    const shape = new THREE.Shape();
    shape.absarc(cx, -cz, 300, 0, Math.PI * 2, false);
    shape.holes.push(new THREE.Path(rect(lw.x0, lw.z0, lw.x1, lw.z1).map(([x, z]) => new THREE.Vector2(x, -z))));
    const g = new THREE.ShapeGeometry(shape, 64);
    g.rotateX(-Math.PI / 2);
    g.translate(0, G, 0);
    worldUV(g);
    const m = new THREE.Mesh(g, mLawn);
    m.name = 'sol-horizon'; m.receiveShadow = false; m.castShadow = false; m.userData.walkIgnore = true; m.userData.noShadow = true;
    far.add(m);
  }

  // =========================================================================
  // 2. Terrasse bois (sous la loggia) : platelage, nez débordant, marche vers la pelouse
  // =========================================================================
  const D = S.deck, nz = D.nose, tk = 0.025;
  B.add('terrasse', mDeck,
    boxG(D.x0, G, D.z0, D.x1, D.top - tk, D.z1),                                      // corps (planche de rive)
    boxG(D.x0 - nz, D.top - tk, D.z0, D.x1 + nz, D.top, D.z1 + nz),                   // platelage, nez débordant
    boxG(S.step.x0, G, S.step.z0, S.step.x1, S.step.top - tk, S.step.z1),             // marche
    boxG(S.step.x0 - nz, S.step.top - tk, S.step.z0, S.step.x1 + nz, S.step.top, S.step.z1 + nz),
  );
  // pied des poteaux enduits : prolongés à travers le platelage (pas de jour sous les poteaux)
  for (const p of POSTS) B.add('pied-poteaux', mCrepi, boxG(p.x0, G, p.z0, p.x1, 0.0, p.z1));

  // =========================================================================
  // 3. Côté Est : bande de gravier, bordures acier, massif, palier et allée dallés
  // =========================================================================
  const gw = S.gravel, gTop = G + 0.01;
  B.add('gravier', mGravel,
    boxG(-gw, BOT, -gw, S.landing.x0, gTop, 0),                    // le long du mur Est (jusqu'au palier)
    boxG(-gw, BOT, 0, 0, gTop, D.z0),                              // le long du pignon Nord
    boxG(S.landing.x1, BOT, -gw, D.x1, gTop, 0),                   // angle sud-est
    boxG(SAS.outer.x1, BOT, 0, D.x1, gTop, D.z0),                  // le long du mur Sud du sas / patio
  );
  B.add('paillage', mMulch, boxG(S.bed.x0, BOT, S.bed.z0, S.bed.x1, gTop, S.bed.z1));
  // bordures acier 6 mm (dépassent de 2,5 cm)
  const e = 0.003, eTop = G + 0.025, eBot = G - 0.15;
  B.add('bordures', mSteel,
    boxG(-gw - e, eBot, -gw, -gw + e, eTop, D.z0),                 // gravier Nord / pelouse
    boxG(-gw, eBot, -gw - e, S.bed.x0, eTop, -gw + e),             // angle nord-est
    boxG(S.bed.x0, eBot, -gw - e, S.bed.x1, eTop, -gw + e),        // gravier / massif
    boxG(S.bed.x0, eBot, S.bed.z0 - e, S.bed.x1, eTop, S.bed.z0 + e),  // massif / pelouse
    boxG(S.bed.x0 - e, eBot, S.bed.z0, S.bed.x0 + e, eTop, -gw),
    boxG(D.x1 - e, eBot, -gw, D.x1 + e, eTop, D.z0),               // gravier Sud / pelouse
    boxG(S.landing.x1, eBot, -gw - e, D.x1, eTop, -gw + e),
  );
  // dalles 3 cm sur lit (joints sombres), nez de 1,5 cm sur les rives libres
  const paving = (r, nx, nzz, { top, over = [0, 0, 0, 0] }) => {
    // over : débord [x0, x1, z0, z1]
    const x0 = r.x0 - over[0], x1 = r.x1 + over[1], z0 = r.z0 - over[2], z1 = r.z1 + over[3];
    B.add('dalles-lit', mStone, boxG(r.x0, BOT, r.z0, r.x1, top - 0.036, r.z1));
    B.add('dalles-joints', mJoint, boxG(r.x0 + 0.012, top - 0.036, r.z0 + 0.012, r.x1 - 0.012, top - 0.03, r.z1 - 0.012));
    const j = 0.004, sx = (x1 - x0) / nx, sz = (z1 - z0) / nzz;
    for (let i = 0; i < nx; i++) for (let k = 0; k < nzz; k++) {
      B.add('dalles', mStone, boxG(x0 + i * sx + (i ? j : 0), top - 0.03, z0 + k * sz + (k ? j : 0), x0 + (i + 1) * sx - (i < nx - 1 ? j : 0), top, z0 + (k + 1) * sz - (k < nzz - 1 ? j : 0)));
    }
  };
  paving(S.landing, 2, 2, { top: S.landing.top, over: [0.015, 0.015, 0.015, 0] });
  paving(S.patio, 2, 3, { top: S.patio.top, over: [0, 0.015, 0, 0] });
  for (const s of stones) B.add('dalles', mStone, boxG(s.x0, BOT, s.z0, s.x1, S.stones.top, s.z1));

  B.flush(near);

  // =========================================================================
  // 4. Végétation basse : haie vert-jaune, buis, graminées (massif Est), arbres d'arrière-plan
  // =========================================================================
  const V = new Buckets();
  {
    const hg = hedgeG(S.hedge, 11);
    paint(hg, new THREE.Color('#9fae3a'), { y0: G, y1: G + S.hedge.h, dark: 0.66, light: 1.08, jitter: 0.07, seed: 4 });
    V.add('haie', mHedge, hg);
  }
  const boxwood = (x, z, r, seed) => {
    const g = lobeG([x, G + r * 0.78, z], [r, r * 0.86, r], { detail: 2, seed, rough: 0.09, rotY: seed });
    paint(g, new THREE.Color('#41602c'), { y0: G, y1: G + r * 1.7, dark: 0.62, light: 1.05, jitter: 0.06, seed });
    V.add('buis', mShrub, g);
  };
  const bz = (S.bed.z0 + S.bed.z1) / 2;
  boxwood(0.85, bz, 0.30, 21); boxwood(3.65, bz - 0.04, 0.27, 22); boxwood(6.55, bz, 0.33, 23);
  // graminées (Pennisetum) avec épis clairs
  const grassX = [1.50, 2.20, 2.90, 4.40, 5.10, 5.80];
  grassX.forEach((x, i) => V.add('graminees', mGrass, ...tuftG(x, bz + (i % 2 ? -0.07 : 0.07), {
    n: 34, h: 0.58 + (i % 3) * 0.05, spread: 0.85, seed: 40 + i, base: '#56702c', tip: '#b9ae74', plume: '#c9bc9c',
  })));
  V.flush(near);

  // arbres
  const T = new Buckets();
  TREES.forEach((t, i) => {
    const { leaves, bark } = treeG(t, i + 1);
    T.add(t[2] === 'p' ? 'conifere' : 'houppiers', mTree, ...leaves);
    T.add('troncs', mBark, ...bark);
  });
  T.add('lisiere', mTree, ...woodlandG((S.lawn.x0 + S.lawn.x1) / 2, (S.lawn.z0 + S.lawn.z1) / 2));
  T.flush(trees);
  trees.traverse((o) => { if (o.isMesh) o.userData.walkIgnore = true; });

  // =========================================================================
  // 5. Mobilier de jardin : 2 pots, table + 2 chaises (hors de l'axe des baies)
  // =========================================================================
  const F = new Buckets();
  const pot = (x, z, h, rTop, rBot, seed, plant) => {
    const y0 = D.top;
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 22, 1, false); g.deleteAttribute('uv');
    g.translate(x, y0 + h / 2, z);
    F.add('pots', mPot, g);
    const s = new THREE.CylinderGeometry(rTop - 0.025, rTop - 0.025, 0.012, 22, 1, false);
    s.translate(x, y0 + h + 0.002, z);
    F.add('terreau', mTerre, s);
    if (plant === 'grass') {
      F.add('graminees-pot', mGrass, ...tuftG(x, z, { n: 46, h: 0.95, spread: 0.7, y: y0 + h, seed, base: '#4c6a2c', tip: '#b7b37a', plume: '#cdb9a0' }));
    } else {
      // olivier en pot : tronc noueux, houppier gris-vert
      const yb = y0 + h;
      // (hauteur totale < 1,60 m : pas coupé par l'axonométrie du RDC)
      F.add('troncs-pot', mBark, stickG([x, yb - 0.05, z], [x + 0.04, yb + 0.32, z - 0.03], 0.04, 0.032, 6),
        stickG([x + 0.04, yb + 0.32, z - 0.03], [x - 0.02, yb + 0.6, z + 0.02], 0.032, 0.022, 6));
      const ol = new THREE.Color('#7f9068');
      [[0, 0.74, 0, 0.27], [0.16, 0.67, 0.09, 0.2], [-0.15, 0.69, -0.08, 0.21], [0.04, 0.86, -0.03, 0.18]].forEach(([dx, dy, dz, r], k) => {
        const lg = lobeG([x + dx, yb + dy, z + dz], [r, r * 0.8, r], { detail: 2, seed: seed + k, rough: 0.2, rotY: k });
        paint(lg, ol, { y0: yb + 0.45, y1: yb + 1.0, dark: 0.7, light: 1.05, jitter: 0.08, seed: seed + k });
        F.add('olivier', mShrub, lg);
      });
    }
  };
  pot(3.22, 5.52, 0.55, 0.25, 0.19, 61, 'grass');    // trumeau entre porte du dressing et poteau
  pot(6.80, 5.52, 0.55, 0.25, 0.19, 62, 'olive');    // trumeau entre la baie de la chambre et le poteau sud

  // table carrée 80 x 80 + 2 chaises, au sud de la terrasse (devant le patio, hors axe des baies)
  const tx = 8.10, tz = 6.95, yd = D.top;
  const leg = 0.035;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    F.add('acier', mSteel, boxG(tx + sx * 0.36 - leg / 2, yd, tz + sz * 0.36 - leg / 2, tx + sx * 0.36 + leg / 2, yd + 0.70, tz + sz * 0.36 + leg / 2));
  }
  F.add('acier', mSteel, boxG(tx - 0.38, yd + 0.66, tz - 0.38, tx + 0.38, yd + 0.70, tz + 0.38));
  for (let i = 0; i < 6; i++) {
    const z0 = tz - 0.40 + i * (0.80 / 6) + 0.004, z1 = tz - 0.40 + (i + 1) * (0.80 / 6) - 0.004;
    F.add('teck', mTeak, boxG(tx - 0.40, yd + 0.70, z0, tx + 0.40, yd + 0.735, z1));
  }
  const chair = (cx, cz, face) => {
    // face = +1 : l'assise regarde vers +z (dossier côté -z)
    const parts = [];
    const L = (x0, y0, z0, x1, y1, z1, m) => parts.push([boxG(x0, y0, z0, x1, y1, z1), m]);
    const hw = 0.23, sd = 0.23, ys = 0.44, l = 0.03;
    for (const sx of [-1, 1]) {
      L(sx * hw - l / 2, 0, sd - l / 2 - 0.02, sx * hw + l / 2, ys, sd + l / 2 - 0.02, 'acier');          // pieds avant
      L(sx * hw - l / 2, 0, -sd - l / 2, sx * hw + l / 2, 0.86, -sd + l / 2, 'acier');                       // montants arrière
      L(sx * hw - l / 2, ys - 0.03, -sd, sx * hw + l / 2, ys, sd - 0.02, 'acier');                           // longerons
    }
    for (let i = 0; i < 5; i++) {
      const z0 = -sd + i * 0.092 + 0.004, z1 = z0 + 0.084;
      L(-hw - 0.01, ys, z0, hw + 0.01, ys + 0.022, z1, 'teck');                                              // lattes d'assise
    }
    for (const yb of [0.56, 0.68, 0.79]) L(-hw, yb, -sd - 0.012, hw, yb + 0.07, -sd + 0.012, 'teck');      // dossier
    for (const [g, m] of parts) {
      placed(g, cx, yd, cz, face > 0 ? 0 : Math.PI);
      worldUV(g);
      F.add(m, m === 'acier' ? mSteel : mTeak, g);
    }
  };
  chair(tx, tz - 0.62, +1);
  chair(tx, tz + 0.62, -1);
  F.flush(furn);
  furn.traverse((o) => { o.userData.level = 'site'; o.userData.kind = 'mobilier'; });

  return root;
}
