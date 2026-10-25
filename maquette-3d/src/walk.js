// Visite à la première personne dans la maquette ("visite 3D").
//
// Module autonome : il ne dépend que de l'instance THREE passée en paramètre et de spec.js (noms des pièces).
//
//   const walk = createWalk({ THREE, camera, renderer, scene, model, domElement, controls });
//   await walk.enter('sas');      // précalcule les grilles de collision puis entre en visite
//   walk.goTo('wc');              // transition douce vers un point de visite
//   walk.update(dt);              // à appeler à chaque image si autoUpdate:false (sinon boucle interne)
//   walk.exit(); walk.dispose();
//
// Collisions / suivi du sol : à la première entrée, tous les triangles des maillages visibles du modèle
// (hors kind 'eclairage' et objets userData.walkIgnore) sont "rastérisés" dans une grille 2D (pas 5 cm)
// couvrant l'extension et le sas. Chaque cellule garde :
//   - les intervalles d'altitude occupés par de la matière (toute orientation, verre compris) ;
//   - les altitudes des faces horizontales tournées vers le haut (sols, marches, paliers).
// Une seule grille sert aux deux niveaux : on cherche le sol autour de l'altitude courante des pieds
// (montée max STEP_UP, descente max MAX_DROP : on ne tombe ni dans la trémie ni d'un limon), puis on vérifie
// qu'aucune matière n'occupe le volume du corps (cylindre de rayon RADIUS, de KNEE à HEAD au-dessus du sol).
// Aucune hypothèse sur la forme des marches : marches pleines, tôles, contremarches ouvertes, balancées.
import { ROOMS } from './spec.js';

// ---------------------------------------------------------------------------
// Réglages
// ---------------------------------------------------------------------------
export const WALK_CFG = {
  eye: 1.62,          // hauteur d'œil au-dessus du sol (m)
  walk: 1.3,          // vitesse de marche (m/s)
  run: 2.6,           // avec Maj
  radius: 0.20,       // rayon du corps (m)
  footR: 0.10,        // rayon de recherche du sol sous les pieds
  stepUp: 0.24,       // hauteur franchissable en montée (marche 17,3 cm + seuils)
  maxDrop: 0.40,      // descente max sans "tomber" (au-delà : bloqué, ex. bord de trémie)
  knee: 0.30,         // la matière sous ce niveau (au-dessus du sol) ne bloque pas (marche suivante)
  head: 1.76,         // haut du crâne
  cell: 0.05,         // pas de la grille (m)
  smallMesh: 0.40,    // maillage plus petit (en plan) : pris par sa boîte englobante
  bounds: { x0: -0.6, x1: 9.0, z0: -0.6, z1: 6.2 },   // emprise de la grille (repère spec.js)
  yMin: -0.4, yMax: 4.6,      // tranche utile : sol RDC ... tête au palier (2,60 + 1,76) ; la toiture au-dessus est ignorée
  turnSpeed: 1.7,     // flèches gauche/droite (rad/s)
  mouseSens: 0.0022,  // verrouillage du pointeur (rad/px)
  eyeSmooth: 0.075,   // lissage vertical de l'œil (s) : marches sans à-coups
  accel: 12,          // réactivité de la vitesse (1/s)
  fovMin: 64, fovMax: 90, hfov: 74,   // champ : vertical mini 64°, horizontal visé 74° (portrait)
};

// Points de visite : pos = point au sol [x, ySol, z], look = point visé.
export const WALK_SPOTS = [
  { id: 'sas', label: 'Entrée · sas', pos: [7.80, 0, 1.55], look: [4.6, 1.35, 1.30] },                 // vers le dégagement et le départ d'escalier
  { id: 'degagement', label: 'Dégagement', pos: [6.65, 0, 1.72], look: [4.9, 1.30, 1.45] },
  { id: 'wc', label: 'WC', pos: [5.20, 0, 1.78], look: [3.40, 1.10, 1.15] },            // sur le seuil, vers l'alcôve sous l'escalier
  { id: 'sdb', label: 'Salle de bains', pos: [2.72, 0, 1.78], look: [0.70, 1.20, 0.95] },
  { id: 'chambre', label: 'Chambre', pos: [6.35, 0, 2.80], look: [3.70, 1.20, 4.70] },
  { id: 'dressing', label: 'Dressing', pos: [1.70, 0, 4.30], look: [0.55, 1.30, 3.00] },
  { id: 'palier', label: 'Palier étage', pos: [3.65, 2.6, 2.35], look: [3.72, 2.95, 0.45] },   // regard vers l'arrivée d'escalier
  { id: 'ch1', label: 'Chambre 1', pos: [2.80, 2.6, 2.05], look: [1.40, 3.45, 4.90] },   // entre lit et cloison, vers la baie
  { id: 'ch2', label: 'Chambre 2', pos: [5.00, 2.6, 4.40], look: [6.35, 3.45, 1.85] },     // depuis la baie, vers le lit
];

// Pièces pour le libellé "vous êtes ici" (rectangles en plan, par niveau)
function roomRects() {
  const out = [];
  for (const r of Object.values(ROOMS)) {
    out.push({ name: r.name, level: r.level, x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1 });
    for (const k of ['alcove', 'niche', 'alcoveBain']) if (r[k]) out.push({ name: r.name, level: r.level, ...r[k] });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Grille de collision
// ---------------------------------------------------------------------------
function collectMeshes(model) {
  const out = [];
  (function rec(o, ignored) {
    if (!o.visible) return;
    const ud = o.userData || {};
    if (ud.kind === 'eclairage' || ud.walkIgnore || ud.noCollide) ignored = true;
    if (ud.walkCollide === true) ignored = false;
    if (!ignored && o.isMesh && o.geometry?.attributes?.position) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      if (mats.some((m) => m && m.visible !== false)) out.push(o);
    }
    for (const c of o.children) rec(c, ignored);
  })(model, false);
  return out;
}

function signatureOf(meshes) {
  let s = meshes.length, h = 0;
  for (const m of meshes) h = (h * 31 + m.id) | 0;
  return s + ':' + h;
}

export async function buildGrid(THREE, model, cfg, onProgress) {
  const t0 = performance.now();
  const { x0: bx0, z0: bz0, x1: bx1, z1: bz1 } = cfg.bounds;
  const cs = cfg.cell;
  const nx = Math.ceil((bx1 - bx0) / cs), nz = Math.ceil((bz1 - bz0) / cs);
  const N = nx * nz;
  const iv = new Array(N);   // intervalles occupés [a0,b0,a1,b1,...] triés
  const fl = new Array(N);   // altitudes de sols
  const TOL = 0.012;

  const addIv = (k, a, b) => {
    const L = iv[k];
    if (L === undefined) { iv[k] = [a, b]; return; }
    const n = L.length;
    let i = 0;
    while (i < n && L[i + 1] < a - TOL) i += 2;
    if (i === n) { L.push(a, b); return; }
    if (L[i] > b + TOL) { L.splice(i, 0, a, b); return; }
    let nb = b > L[i + 1] ? b : L[i + 1];
    if (a < L[i]) L[i] = a;
    let j = i + 2;
    while (j < n && L[j] <= nb + TOL) { if (L[j + 1] > nb) nb = L[j + 1]; j += 2; }
    L[i + 1] = nb;
    if (j > i + 2) L.splice(i + 2, j - i - 2);
  };
  const addFl = (k, y) => {
    const L = fl[k];
    if (L === undefined) { fl[k] = [y]; return; }
    for (let i = 0; i < L.length; i++) if (Math.abs(L[i] - y) < 0.006) { if (y > L[i]) L[i] = y; return; }
    L.push(y);
  };

  // Découpe de polygone (Sutherland-Hodgman) dans le plan xz, y transporté
  const B = [0, 1, 2, 3].map(() => [new Float64Array(16), new Float64Array(16), new Float64Array(16)]);
  const EPS = 1e-7;
  function clip(n, src, dst, useZ, bound, keepGreater) {
    const [sx, sy, sz] = src, [dx, dy, dz] = dst;
    const sv = useZ ? sz : sx;
    let m = 0;
    for (let i = 0; i < n; i++) {
      const j = i === 0 ? n - 1 : i - 1;
      const dc = keepGreater ? sv[i] - bound : bound - sv[i];
      const dp = keepGreater ? sv[j] - bound : bound - sv[j];
      const cin = dc >= -EPS, pin = dp >= -EPS;
      if (cin !== pin) {
        const t = dp / (dp - dc);
        dx[m] = sx[j] + (sx[i] - sx[j]) * t; dy[m] = sy[j] + (sy[i] - sy[j]) * t; dz[m] = sz[j] + (sz[i] - sz[j]) * t; m++;
      }
      if (cin) { dx[m] = sx[i]; dy[m] = sy[i]; dz[m] = sz[i]; m++; }
    }
    return m;
  }

  // up : face de sol (tournée vers le haut) ; plane : pente < 60° -> altitude évaluée sur le plan du triangle
  function rasterTri(ax, ay, az, bx, by, bz, cx, cy, cz, up, plane, gx, gz) {
    const minX = Math.min(ax, bx, cx), maxX = Math.max(ax, bx, cx);
    const minZ = Math.min(az, bz, cz), maxZ = Math.max(az, bz, cz);
    const minY = Math.min(ay, by, cy), maxY = Math.max(ay, by, cy);
    if (maxX < bx0 || minX > bx1 || maxZ < bz0 || minZ > bz1 || maxY < cfg.yMin || minY > cfg.yMax) return;
    let i0 = Math.floor((minX - bx0) / cs), i1 = Math.floor((maxX - bx0) / cs);
    let j0 = Math.floor((minZ - bz0) / cs), j1 = Math.floor((maxZ - bz0) / cs);
    if (i0 < 0) i0 = 0; if (j0 < 0) j0 = 0; if (i1 > nx - 1) i1 = nx - 1; if (j1 > nz - 1) j1 = nz - 1;
    if (i0 === i1 && j0 === j1) {
      const k = j0 * nx + i0;
      addIv(k, minY, maxY);
      if (up) addFl(k, maxY);
      return;
    }
    const T = B[0];
    T[0][0] = ax; T[1][0] = ay; T[2][0] = az;
    T[0][1] = bx; T[1][1] = by; T[2][1] = bz;
    T[0][2] = cx; T[1][2] = cy; T[2][2] = cz;
    const flat = maxY - minY < 1e-4;
    const hxz = (Math.abs(gx) + Math.abs(gz)) * cs * 0.5;
    for (let i = i0; i <= i1; i++) {
      const xa = bx0 + i * cs;
      let n = clip(3, B[0], B[1], false, xa, true);
      if (!n) continue;
      n = clip(n, B[1], B[2], false, xa + cs, false);
      if (!n) continue;
      const P = B[2];
      let pz0 = Infinity, pz1 = -Infinity, py0 = Infinity, py1 = -Infinity;
      for (let q = 0; q < n; q++) {
        const zq = P[2][q], yq = P[1][q];
        if (zq < pz0) pz0 = zq; if (zq > pz1) pz1 = zq;
        if (yq < py0) py0 = yq; if (yq > py1) py1 = yq;
      }
      let ja = Math.floor((pz0 - bz0) / cs), jb = Math.floor((pz1 - bz0) / cs);
      if (ja < j0) ja = j0; if (jb > j1) jb = j1;
      if (plane) {
        // polygone convexe contenu dans la tranche : chaque bande z de [pz0,pz1] le coupe ;
        // l'altitude sur la cellule est bornée par le plan évalué sur le rectangle de la cellule.
        const xc = xa + cs * 0.5;
        for (let j = ja; j <= jb; j++) {
          let y0 = py0, y1 = py1;
          if (!flat) {
            const yc = ay + gx * (xc - ax) + gz * (bz0 + (j + 0.5) * cs - az);
            if (yc - hxz > y0) y0 = yc - hxz;
            if (yc + hxz < y1) y1 = yc + hxz;
            if (y0 > y1) { const m = Math.min(Math.max(yc, py0), py1); y0 = y1 = m; }
          }
          const k = j * nx + i;
          addIv(k, y0, y1);
          if (up) addFl(k, y1);
        }
        continue;
      }
      for (let j = ja; j <= jb; j++) {
        const za = bz0 + j * cs;
        let m = clip(n, B[2], B[3], true, za, true);
        if (!m) continue;
        m = clip(m, B[3], B[1], true, za + cs, false);
        if (!m) continue;
        const Q = B[1][1];
        let y0 = Infinity, y1 = -Infinity;
        for (let q = 0; q < m; q++) { if (Q[q] < y0) y0 = Q[q]; if (Q[q] > y1) y1 = Q[q]; }
        const k = j * nx + i;
        addIv(k, y0, y1);
        if (up) addFl(k, y1);
      }
    }
  }

  model.updateMatrixWorld(true);
  const meshes = collectMeshes(model);
  const signature = signatureOf(meshes);
  const M = new THREE.Matrix4(), MI = new THREE.Matrix4(), bb = new THREE.Box3();
  let tris = 0, used = 0, boxed = 0, slice = performance.now();
  const yieldNow = () => new Promise((r) => setTimeout(r, 0));

  for (let mi = 0; mi < meshes.length; mi++) {
    const mesh = meshes[mi];
    const geo = mesh.geometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    const pos = geo.attributes.position, index = geo.index;
    const inst = mesh.isInstancedMesh ? mesh.count : 1;
    for (let n = 0; n < inst; n++) {
      if (mesh.isInstancedMesh) { mesh.getMatrixAt(n, MI); M.multiplyMatrices(mesh.matrixWorld, MI); } else M.copy(mesh.matrixWorld);
      bb.copy(geo.boundingBox).applyMatrix4(M);
      if (bb.max.x < bx0 || bb.min.x > bx1 || bb.max.z < bz0 || bb.min.z > bz1 || bb.max.y < cfg.yMin || bb.min.y > cfg.yMax) continue;
      used++;
      // Petits objets (chaussures, plantes, coussins, poignées, barreaux...) : leur boîte englobante suffit
      // (erreur < leur taille) et évite de rastériser des milliers de petits triangles.
      if (bb.max.x - bb.min.x <= cfg.smallMesh && bb.max.z - bb.min.z <= cfg.smallMesh) {
        let i0 = Math.floor((bb.min.x - bx0) / cs), i1 = Math.floor((bb.max.x - bx0) / cs);
        let j0 = Math.floor((bb.min.z - bz0) / cs), j1 = Math.floor((bb.max.z - bz0) / cs);
        if (i0 < 0) i0 = 0; if (j0 < 0) j0 = 0; if (i1 > nx - 1) i1 = nx - 1; if (j1 > nz - 1) j1 = nz - 1;
        const thin = bb.max.y - bb.min.y <= 0.08;     // carreau, tapis, seuil : reste un sol
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { addIv(j * nx + i, bb.min.y, bb.max.y); if (thin) addFl(j * nx + i, bb.max.y); }
        boxed++;
        continue;
      }
      const e = M.elements;
      const flip = M.determinant() < 0 ? -1 : 1;
      const total = index ? index.count : pos.count;
      const start = Math.max(0, geo.drawRange.start);
      const end = Math.min(total, geo.drawRange.start + (Number.isFinite(geo.drawRange.count) ? geo.drawRange.count : total));
      const ia = index ? index.array : null;
      const pa = pos.isInterleavedBufferAttribute ? null : pos.array;
      const gx = (v) => (pa ? pa[v * 3] : pos.getX(v)), gy = (v) => (pa ? pa[v * 3 + 1] : pos.getY(v)), gz = (v) => (pa ? pa[v * 3 + 2] : pos.getZ(v));
      for (let t = start; t + 2 < end; t += 3) {
        const va = ia ? ia[t] : t, vb = ia ? ia[t + 1] : t + 1, vc = ia ? ia[t + 2] : t + 2;
        let x = gx(va), y = gy(va), z = gz(va);
        const ax = e[0] * x + e[4] * y + e[8] * z + e[12], ay = e[1] * x + e[5] * y + e[9] * z + e[13], az = e[2] * x + e[6] * y + e[10] * z + e[14];
        x = gx(vb); y = gy(vb); z = gz(vb);
        const bx = e[0] * x + e[4] * y + e[8] * z + e[12], by = e[1] * x + e[5] * y + e[9] * z + e[13], bz = e[2] * x + e[6] * y + e[10] * z + e[14];
        x = gx(vc); y = gy(vc); z = gz(vc);
        const cx = e[0] * x + e[4] * y + e[8] * z + e[12], cy = e[1] * x + e[5] * y + e[9] * z + e[13], cz = e[2] * x + e[6] * y + e[10] * z + e[14];
        // normale (pour reconnaître les sols)
        const ux = bx - ax, uy = by - ay, uz = bz - az, wx = cx - ax, wy = cy - ay, wz = cz - az;
        const nX = uy * wz - uz * wy, nY = uz * wx - ux * wz, nZ = ux * wy - uy * wx;
        const len = Math.hypot(nX, nY, nZ);
        if (len < 1e-14) continue;
        const ny = nY / len;
        const up = flip * ny > 0.9;
        const plane = Math.abs(ny) > 0.5;
        rasterTri(ax, ay, az, bx, by, bz, cx, cy, cz, up, plane, plane ? -nX / nY : 0, plane ? -nZ / nY : 0);
        tris++;
      }
      if (performance.now() - slice > 45) {
        onProgress?.(mi / meshes.length);
        await yieldNow();
        slice = performance.now();
      }
    }
  }

  // Compactage en tableaux typés (CSR)
  const pack = (arr) => {
    const off = new Int32Array(N + 1);
    let tot = 0;
    for (let k = 0; k < N; k++) { off[k] = tot; tot += arr[k] ? arr[k].length : 0; }
    off[N] = tot;
    const data = new Float32Array(tot);
    for (let k = 0; k < N; k++) if (arr[k]) data.set(arr[k], off[k]);
    return { off, data };
  };
  const IV = pack(iv), FL = pack(fl);
  return {
    nx, nz, cs, bx0, bz0, IV, FL, signature,
    stats: { meshes: meshes.length, meshesInBounds: used, meshesAsBox: boxed, triangles: tris, cells: N, ms: Math.round(performance.now() - t0) },
  };
}

// ---------------------------------------------------------------------------
// Styles du HUD (injectés une fois)
// ---------------------------------------------------------------------------
const CSS = `
.wk-hud{position:fixed;inset:0;z-index:6;outline:none;pointer-events:none;font-family:var(--font-body,'Barlow','Segoe UI',Roboto,Helvetica,Arial,sans-serif);color:var(--ink,#22272a);-webkit-user-select:none;user-select:none}
.wk-hud button{pointer-events:auto;font:inherit;color:inherit;cursor:pointer}
.wk-glass{background:var(--paper-glass,rgba(243,241,236,.86));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line,rgba(34,39,42,.14))}
.wk-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));display:flex;gap:8px;align-items:flex-start;justify-content:space-between}
.wk-title{padding:7px 12px 8px;min-width:0}
.wk-kicker{display:block;font-family:var(--font-display,'Barlow Condensed','Arial Narrow',sans-serif);font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft,#5c6266)}
.wk-where{display:block;font-family:var(--font-display,'Barlow Condensed','Arial Narrow',sans-serif);font-weight:600;font-size:19px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wk-exit{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:8px 14px;border:1px solid var(--accent,#383e42);background:var(--accent,#383e42);color:var(--accent-ink,#f3f1ec)!important;font-family:var(--font-display,'Barlow Condensed','Arial Narrow',sans-serif)!important;font-weight:600;font-size:15px;letter-spacing:.04em}
.wk-exit svg{width:14px;height:14px}
.wk-rail{position:absolute;top:calc(env(safe-area-inset-top,0px) + 72px);left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;pointer-events:auto}
.wk-rail::-webkit-scrollbar{display:none}
.wk-chip{flex:none;font-family:var(--font-display,'Barlow Condensed','Arial Narrow',sans-serif)!important;font-weight:600;font-size:14px;letter-spacing:.04em;padding:7px 11px}
.wk-chip[aria-current="true"]{background:var(--accent,#383e42);color:var(--accent-ink,#f3f1ec);border-color:var(--accent,#383e42)}
.wk-exit:focus-visible,.wk-chip:focus-visible{outline:2px solid var(--placo,#8fa9bc);outline-offset:2px}
.wk-hint{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);transform:translateX(-50%);max-width:calc(100% - 32px);padding:7px 12px;font-size:13px;line-height:1.35;text-align:center;transition:opacity .6s}
.wk-hint.wk-off{opacity:0}
.wk-hud.wk-touch .wk-hint{left:auto;right:max(16px,env(safe-area-inset-right,0px));transform:none;max-width:calc(100% - 190px);text-align:right;bottom:calc(env(safe-area-inset-bottom,0px) + 34px)}
.wk-joy{position:absolute;left:calc(max(16px,env(safe-area-inset-left,0px)) + 6px);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:120px;height:120px;border-radius:50%;background:rgba(34,39,42,.16);border:1.5px solid rgba(255,255,255,.6);box-shadow:0 0 0 1px rgba(34,39,42,.18);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);pointer-events:auto;touch-action:none;display:none;-webkit-touch-callout:none}
.wk-hud.wk-touch .wk-joy{display:block}
.wk-knob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(243,241,236,.85);box-shadow:0 1px 4px rgba(0,0,0,.25);transition:transform .12s ease-out}
.wk-joy.wk-on .wk-knob{transition:none}
.wk-cross{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 0 0 1px rgba(0,0,0,.35);display:none}
.wk-hud.wk-locked .wk-cross{display:block}
.wk-busy{position:absolute;inset:0;display:none;place-items:center}
.wk-hud.wk-loading .wk-busy{display:grid}
.wk-busy>div{padding:12px 18px;font-family:var(--font-display,'Barlow Condensed','Arial Narrow',sans-serif);letter-spacing:.08em;text-transform:uppercase;font-size:14px;color:var(--ink-soft,#5c6266)}
.wk-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:640px){.wk-where{font-size:17px}.wk-exit{font-size:14px;padding:8px 12px}.wk-rail{top:calc(env(safe-area-inset-top,0px) + 66px)}}
@media (prefers-reduced-motion:reduce){.wk-hint,.wk-knob{transition:none}}
`;

// ---------------------------------------------------------------------------
// createWalk
// ---------------------------------------------------------------------------
export function createWalk({
  THREE, camera, renderer, scene, model, domElement,
  controls = null,            // OrbitControls de l'app : neutralisés pendant la visite
  spots = WALK_SPOTS,
  ui = true,                  // HUD (bouton quitter, points de visite, joystick, aide)
  hudParent = document.body,
  autoUpdate = true,          // boucle requestAnimationFrame interne ; false si l'app appelle update(dt)
  exposure = null,            // exposition imposée pendant la visite (null = inchangée)
  cfg: cfgOverride = {},
  onExit = null, onSpot = null, onRoom = null,
} = {}) {
  const cfg = { ...WALK_CFG, ...cfgOverride };
  domElement = domElement || renderer?.domElement;
  const rooms = roomRects();
  const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;

  let grid = null, gridPromise = null;
  let active = false, entering = false, aborted = false;
  const st = {
    x: 0, z: 0, foot: 0, eyeY: cfg.eye, yaw: 0, pitch: 0, vx: 0, vz: 0,
    spot: null, room: '', blocked: 0, lastBlockT: -1, time: 0,
  };
  const pressed = new Map();   // touche physique (code) -> action
  const keys = { has: (a) => { for (const v of pressed.values()) if (v === a) return true; return false; } };
  let run = false;
  const joy = { id: null, x: 0, y: 0, cx: 0, cy: 0, r: 44 };
  const look = { id: null, x: 0, y: 0, moved: 0, type: '' };
  let locked = false, lastUnlock = 0;
  let trans = null;
  let saved = null;
  let raf = 0, lastT = 0;
  let hud = null, styleEl = null, hintTimer = 0;
  const listeners = [];
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); listeners.push([t, ev, fn, opt]); };

  // ------------------------------------------------------------- grille
  function currentSignature() { model.updateMatrixWorld(true); return signatureOf(collectMeshes(model)); }
  function prepare({ force = false } = {}) {
    if (gridPromise && !force) {
      return gridPromise.then((g) => (g.signature === currentSignature() ? g : prepare({ force: true })));
    }
    gridPromise = buildGrid(THREE, model, cfg, (p) => setBusy(`Préparation de la visite… ${Math.round(p * 100)} %`))
      .then((g) => { grid = g; return g; });
    return gridPromise;
  }

  const cellOf = (x, z) => [Math.floor((x - grid.bx0) / grid.cs), Math.floor((z - grid.bz0) / grid.cs)];

  // Sol le plus haut atteignable autour de (x,z) depuis l'altitude des pieds `foot`
  function floorAt(x, z, foot, lo = foot - cfg.maxDrop, hi = foot + cfg.stepUp) {
    const { nx, nz, cs, bx0, bz0, FL } = grid;
    const r = cfg.footR, n = Math.ceil(r / cs) + 1;
    const [ci, cj] = cellOf(x, z);
    let best = -Infinity;
    for (let dj = -n; dj <= n; dj++) {
      const j = cj + dj; if (j < 0 || j >= nz) continue;
      const pz = bz0 + (j + 0.5) * cs - z;
      for (let di = -n; di <= n; di++) {
        const i = ci + di; if (i < 0 || i >= nx) continue;
        const px = bx0 + (i + 0.5) * cs - x;
        if (px * px + pz * pz > r * r) continue;
        const k = j * nx + i;
        for (let q = FL.off[k]; q < FL.off[k + 1]; q++) {
          const f = FL.data[q];
          if (f >= lo && f <= hi && f > best) best = f;
        }
      }
    }
    return best === -Infinity ? NaN : best;
  }

  // Le volume du corps (rayon radius, de h+knee à h+head) est-il libre ?
  function bodyFree(x, z, h, radius = cfg.radius) {
    const { nx, nz, cs, bx0, bz0, IV } = grid;
    const n = Math.ceil(radius / cs) + 1;
    const lo = h + cfg.knee, hi = h + cfg.head;
    const [ci, cj] = cellOf(x, z);
    for (let dj = -n; dj <= n; dj++) {
      const j = cj + dj;
      const pz = bz0 + (j + 0.5) * cs - z;
      for (let di = -n; di <= n; di++) {
        const i = ci + di;
        const px = bx0 + (i + 0.5) * cs - x;
        if (px * px + pz * pz > radius * radius) continue;
        if (i < 0 || j < 0 || i >= nx || j >= nz) return false;
        const k = j * nx + i;
        for (let q = IV.off[k]; q < IV.off[k + 1]; q += 2) {
          if (IV.data[q] <= hi && IV.data[q + 1] >= lo) return false;
        }
      }
    }
    return true;
  }

  // Sol "proche de yGuess" (pour poser un point de visite)
  function floorNear(x, z, yGuess) {
    return floorAt(x, z, yGuess, yGuess - 0.35, yGuess + 0.2);   // pas sur un lit ni sur une marche voisine
  }

  // Position libre la plus proche d'un point de visite (spirale), avec un sol proche de yGuess
  function findFree(x, z, yGuess, depth = 0) {
    for (let r = 0; r <= 1.2001; r += 0.05) {
      const steps = r === 0 ? 1 : Math.max(8, Math.round((TAU * r) / 0.05));
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * TAU;
        const px = x + r * Math.cos(a), pz = z + r * Math.sin(a);
        const h = floorNear(px, pz, yGuess);
        if (Number.isFinite(h) && bodyFree(px, pz, h)) return { x: px, z: pz, foot: h };
      }
    }
    // pas de sol à ce niveau (ex. étage masqué) : on se pose sur le sol inférieur
    const below = floorAt(x, z, yGuess, cfg.yMin, yGuess - 0.3);
    if (depth < 2 && Number.isFinite(below)) return findFree(x, z, below, depth + 1);
    return { x, z, foot: yGuess };
  }

  function tryMove(dx, dz) {
    const nx = st.x + dx, nz = st.z + dz;
    const h = floorAt(nx, nz, st.foot);
    if (!Number.isFinite(h)) return false;
    if (!bodyFree(nx, nz, h)) {
      // coincé (géométrie modifiée sous nos pieds) : on autorise à s'en extraire
      if (bodyFree(st.x, st.z, st.foot)) return false;
    }
    st.x = nx; st.z = nz; st.foot = h;
    return true;
  }

  function move(dx, dz) {
    const d = Math.hypot(dx, dz);
    if (d < 1e-6) return;
    const n = Math.max(1, Math.ceil(d / 0.025));
    const sx = dx / n, sz = dz / n;
    for (let s = 0; s < n; s++) {
      if (tryMove(sx, sz)) continue;
      // glissement le long des parois (murs alignés sur les axes)
      const okX = Math.abs(sx) > 1e-7 && tryMove(sx, 0);
      const okZ = !okX && Math.abs(sz) > 1e-7 && tryMove(0, sz);
      if (!okX) st.vx *= 0.5;
      if (!okZ) st.vz *= 0.5;
      if (!okX && !okZ) { st.blocked++; st.lastBlockT = st.time; break; }
    }
  }

  // ------------------------------------------------------------- caméra
  function fitFov() {
    const a = camera.aspect || 1;
    const hf = (cfg.hfov * Math.PI) / 180;
    let v = (2 * Math.atan(Math.tan(hf / 2) / a) * 180) / Math.PI;
    v = Math.min(cfg.fovMax, Math.max(cfg.fovMin, v));
    if (Math.abs(camera.fov - v) > 0.05 || camera.near !== 0.05) {
      camera.fov = v; camera.near = 0.05; camera.updateProjectionMatrix();
    }
  }
  function applyCamera(x = st.x, y = st.eyeY, z = st.z, yaw = st.yaw, pitch = st.pitch) {
    camera.position.set(x, y, z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    camera.updateMatrixWorld();
  }
  const yawPitchTo = (fx, fy, fz, tx, ty, tz) => {
    const dx = tx - fx, dy = ty - fy, dz = tz - fz;
    return [Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz))];
  };
  const clampPitch = (p) => Math.max(-1.4, Math.min(1.4, p));
  const wrap = (a) => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;

  function spotById(id) { return spots.find((s) => s.id === id) || spots[0]; }

  function resolveSpot(sp) {
    const [x, y, z] = sp.pos;
    const p = findFree(x, z, y);
    const [yaw, pitch] = yawPitchTo(p.x, p.foot + cfg.eye, p.z, ...sp.look);
    return { ...p, yaw, pitch };
  }

  function startTransition(target, dur) {
    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    trans = {
      t: 0, dur: reduceMotion ? Math.min(dur, 0.35) : dur,
      from: { ...from, yaw: e.y, pitch: e.x },
      to: { x: target.x, y: target.foot + cfg.eye, z: target.z, yaw: target.yaw, pitch: target.pitch },
      target,
    };
    st.vx = st.vz = 0;
  }

  function stepTransition(dt) {
    trans.t += dt;
    const k = Math.min(1, trans.t / trans.dur);
    const s = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const f = trans.from, to = trans.to;
    const dyaw = wrap(to.yaw - f.yaw);
    // léger arc vertical quand on change de niveau ou qu'on traverse la maison
    const lift = Math.min(0.6, Math.hypot(to.x - f.x, to.z - f.z) * 0.08) * Math.sin(Math.PI * s);
    applyCamera(f.x + (to.x - f.x) * s, f.y + (to.y - f.y) * s + lift, f.z + (to.z - f.z) * s, f.yaw + dyaw * s, f.pitch + (to.pitch - f.pitch) * s);
    if (k >= 1) {
      const t = trans.target;
      st.x = t.x; st.z = t.z; st.foot = t.foot; st.eyeY = t.foot + cfg.eye; st.yaw = t.yaw; st.pitch = t.pitch;
      trans = null;
      applyCamera();
      updateRoom(true);
    }
  }

  // ------------------------------------------------------------- pièce courante
  function roomAt(x, z, foot) {
    const lvl = foot > 1.3 ? 'etage' : 'rdc';
    if (foot > 0.12 && foot < 2.5 && x > 3.2 && x < 7.31 && z > 0.33 && z < 1.3) return 'Escalier';
    for (const r of rooms) if (r.level === lvl && x >= r.x0 - 0.04 && x <= r.x1 + 0.04 && z >= r.z0 - 0.04 && z <= r.z1 + 0.04) return r.name;
    return lvl === 'rdc' ? 'Rez-de-chaussée' : 'Étage';
  }
  function updateRoom(force = false) {
    const name = roomAt(st.x, st.z, st.foot);
    if (name !== st.room || force) {
      st.room = name;
      if (hud) hud.where.textContent = name;
      onRoom?.(name);
    }
  }

  // ------------------------------------------------------------- HUD
  function setBusy(text) {
    if (!hud) return;
    hud.root.classList.toggle('wk-loading', !!text);
    if (text) hud.busy.textContent = text;
  }
  function showHint(text, ms = 6500) {
    if (!hud) return;
    hud.hint.textContent = text;
    hud.hint.classList.remove('wk-off');
    clearTimeout(hintTimer);
    if (ms) hintTimer = setTimeout(() => hud?.hint.classList.add('wk-off'), ms);
  }
  const isTouch = () => typeof matchMedia === 'function' && (matchMedia('(any-pointer: coarse)').matches || matchMedia('(pointer: coarse)').matches);
  const hintText = () => (hud?.root.classList.contains('wk-touch')
    ? 'Glisser pour regarder · joystick pour marcher'
    : locked
      ? 'Souris : regarder · ZQSD / WASD ou ↑↓ : marcher · ←→ : tourner · Maj : plus vite · Échap : libérer la souris'
      : 'Cliquer pour regarder à la souris (ou glisser) · ZQSD / WASD ou ↑↓ : marcher · ←→ : tourner · Maj : plus vite · Échap : quitter');

  function buildHud() {
    if (!ui || hud) return;
    if (!document.getElementById('wk-style')) {
      styleEl = document.createElement('style');
      styleEl.id = 'wk-style';
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);
    }
    const root = document.createElement('div');
    root.className = 'wk-hud';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Visite 3D');
    root.innerHTML = `
      <div class="wk-top">
        <div class="wk-title wk-glass" aria-live="polite"><span class="wk-kicker">Visite 3D · vous êtes</span><span class="wk-where">…</span></div>
        <button type="button" class="wk-exit" aria-label="Quitter la visite (Échap)"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="2" fill="none"/></svg>Quitter</button>
      </div>
      <div class="wk-rail" role="toolbar" aria-label="Points de visite"></div>
      <div class="wk-hint wk-glass" role="note"></div>
      <div class="wk-joy" role="group" aria-label="Joystick de déplacement : faire glisser le pouce pour marcher" aria-roledescription="joystick"><div class="wk-knob"></div></div>
      <div class="wk-cross" aria-hidden="true"></div>
      <div class="wk-busy" role="status"><div class="wk-glass">Préparation de la visite…</div></div>`;
    const q = (s) => root.querySelector(s);
    hud = { root, where: q('.wk-where'), rail: q('.wk-rail'), hint: q('.wk-hint'), joy: q('.wk-joy'), knob: q('.wk-knob'), busy: q('.wk-busy > div'), chips: {} };
    spots.forEach((sp, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'wk-chip wk-glass'; b.textContent = sp.label;
      b.title = `${sp.label} (touche ${i + 1})`;
      b.addEventListener('click', () => goTo(sp.id));
      hud.rail.appendChild(b); hud.chips[sp.id] = b;
    });
    q('.wk-exit').addEventListener('click', () => exit());
    if (isTouch()) root.classList.add('wk-touch');
    // joystick
    const J = hud.joy;
    J.addEventListener('pointerdown', (e) => {
      if (joy.id !== null) return;
      e.preventDefault(); e.stopPropagation();
      joy.id = e.pointerId;
      const r = J.getBoundingClientRect();
      joy.cx = r.left + r.width / 2; joy.cy = r.top + r.height / 2; joy.r = r.width * 0.37;
      J.setPointerCapture?.(e.pointerId);
      J.classList.add('wk-on');
      joyMove(e);
    });
    J.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) { e.preventDefault(); joyMove(e); } });
    const joyEnd = (e) => {
      if (e.pointerId !== joy.id) return;
      joy.id = null; joy.x = joy.y = 0;
      J.classList.remove('wk-on');
      hud.knob.style.transform = '';
    };
    J.addEventListener('pointerup', joyEnd);
    J.addEventListener('pointercancel', joyEnd);
    J.addEventListener('contextmenu', (e) => e.preventDefault());
    hudParent.appendChild(root);
  }
  function joyMove(e) {
    let dx = (e.clientX - joy.cx) / joy.r, dy = (e.clientY - joy.cy) / joy.r;
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    hud.knob.style.transform = `translate(${dx * joy.r}px, ${dy * joy.r}px)`;
    const dead = 0.12, mm = Math.min(1, m);
    const s = mm < dead ? 0 : (mm - dead) / (1 - dead) / (mm || 1);
    joy.x = dx * s; joy.y = dy * s;
  }
  function markSpot(id) {
    if (!hud) return;
    for (const [k, b] of Object.entries(hud.chips)) b.setAttribute('aria-current', String(k === id));
    hud.chips[id]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
  function removeHud() {
    clearTimeout(hintTimer);
    hud?.root.remove();
    hud = null;
  }

  // ------------------------------------------------------------- entrées
  const KEYMAP_CODE = {
    KeyW: 'fwd', KeyS: 'back', KeyA: 'left', KeyD: 'right',     // positions physiques : ZQSD sur AZERTY, WASD sur QWERTY
    ArrowUp: 'fwd', ArrowDown: 'back', ArrowLeft: 'turnL', ArrowRight: 'turnR',
    PageUp: 'lookUp', PageDown: 'lookDown',
  };
  const KEYMAP_KEY = { z: 'fwd', w: 'fwd', s: 'back', q: 'left', a: 'left', d: 'right' };
  function actionOf(e) { return KEYMAP_CODE[e.code] || KEYMAP_KEY[(e.key || '').toLowerCase()]; }
  const typing = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '') || e.target?.isContentEditable;

  function onKeyDown(e) {
    if (!active || typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    run = e.shiftKey;
    if (e.key === 'Escape') {
      if (!locked && performance.now() - lastUnlock > 350) { e.preventDefault(); exit(); }
      return;
    }
    if (/^[1-9]$/.test(e.key) && spots[+e.key - 1]) { goTo(spots[+e.key - 1].id); return; }
    const a = actionOf(e);
    if (a) { pressed.set(e.code || e.key, a); e.preventDefault(); }
  }
  function onKeyUp(e) {
    run = e.shiftKey;
    pressed.delete(e.code || e.key);
  }
  function clearInput() { pressed.clear(); run = false; joy.x = joy.y = 0; }

  function onPointerDown(e) {
    if (!active || locked) return;
    if (e.pointerType === 'touch' && hud && !hud.root.classList.contains('wk-touch')) { hud.root.classList.add('wk-touch'); showHint(hintText()); }
    if (look.id !== null) return;
    look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; look.moved = 0; look.type = e.pointerType;
    domElement.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!active || locked || e.pointerId !== look.id || trans) return;
    const dx = e.clientX - look.x, dy = e.clientY - look.y;
    look.x = e.clientX; look.y = e.clientY;
    look.moved += Math.abs(dx) + Math.abs(dy);
    // "attraper la scène" : la vue suit le doigt (1:1 avec le champ de vision)
    const k = ((camera.fov * Math.PI) / 180) / Math.max(1, domElement.clientHeight);
    st.yaw += dx * k;
    st.pitch = clampPitch(st.pitch + dy * k);
  }
  function onPointerUp(e) {
    if (e.pointerId !== look.id) return;
    const click = look.moved < 6 && look.type === 'mouse';
    look.id = null;
    if (click && active && !locked && domElement.requestPointerLock) {
      try {
        const p = domElement.requestPointerLock();
        p?.catch?.(() => showHint('Verrouillage de la souris indisponible : glisser pour regarder.'));
      } catch { /* iframe sans allow-pointer-lock */ }
    }
  }
  function onLockChange() {
    const was = locked;
    locked = document.pointerLockElement === domElement;
    if (was && !locked) lastUnlock = performance.now();
    hud?.root.classList.toggle('wk-locked', locked);
    if (active) showHint(hintText(), locked ? 4500 : 6500);
  }
  function onMouseMove(e) {
    if (!active || !locked || trans) return;
    st.yaw -= (e.movementX || 0) * cfg.mouseSens;
    st.pitch = clampPitch(st.pitch - (e.movementY || 0) * cfg.mouseSens);
  }

  function addListeners() {
    on(window, 'keydown', onKeyDown);
    on(window, 'keyup', onKeyUp);
    on(window, 'blur', clearInput);
    on(document, 'visibilitychange', clearInput);
    on(domElement, 'pointerdown', onPointerDown);
    on(domElement, 'pointermove', onPointerMove);
    on(domElement, 'pointerup', onPointerUp);
    on(domElement, 'pointercancel', onPointerUp);
    on(document, 'pointerlockchange', onLockChange);
    on(document, 'mousemove', onMouseMove);
  }
  function removeListeners() {
    for (const [t, ev, fn, opt] of listeners.splice(0)) t.removeEventListener(ev, fn, opt);
  }

  // ------------------------------------------------------------- boucle
  function update(dt = 1 / 60) {
    if (!active || !grid) return;
    dt = Math.min(Math.max(dt, 0), 0.1);
    st.time += dt;
    fitFov();
    if (trans) { stepTransition(dt); return; }

    const turn = (keys.has('turnL') ? 1 : 0) - (keys.has('turnR') ? 1 : 0);
    if (turn) st.yaw += turn * cfg.turnSpeed * dt;
    const tilt = (keys.has('lookUp') ? 1 : 0) - (keys.has('lookDown') ? 1 : 0);
    if (tilt) st.pitch = clampPitch(st.pitch + tilt * cfg.turnSpeed * 0.6 * dt);

    let f = (keys.has('fwd') ? 1 : 0) - (keys.has('back') ? 1 : 0) - joy.y;
    let r = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0) + joy.x;
    const m = Math.hypot(f, r);
    if (m > 1) { f /= m; r /= m; }
    const speed = run ? cfg.run : cfg.walk;
    const sy = Math.sin(st.yaw), cy = Math.cos(st.yaw);
    // avant = (-sin yaw, -cos yaw) ; droite = (cos yaw, -sin yaw)
    const tvx = (-sy * f + cy * r) * speed, tvz = (-cy * f - sy * r) * speed;
    const a = 1 - Math.exp(-cfg.accel * dt);
    st.vx += (tvx - st.vx) * a; st.vz += (tvz - st.vz) * a;
    if (Math.abs(st.vx) < 1e-4 && Math.abs(st.vz) < 1e-4) { st.vx = st.vz = 0; }
    else move(st.vx * dt, st.vz * dt);

    const ty = st.foot + cfg.eye;
    st.eyeY += (ty - st.eyeY) * (1 - Math.exp(-dt / cfg.eyeSmooth));
    if (Math.abs(ty - st.eyeY) > 0.6) st.eyeY = ty;     // téléportation / grand écart : pas de lissage
    applyCamera();
    updateRoom();
  }

  function loop(t) {
    if (!active) return;
    const dt = lastT ? (t - lastT) / 1000 : 1 / 60;
    lastT = t;
    update(dt);
    raf = requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------- entrée / sortie
  async function enter(spotId = spots[0].id, { instant = false } = {}) {
    if (active) return goTo(spotId, { instant });
    if (entering) return entering;
    entering = (async () => {
      buildHud();
      setBusy('Préparation de la visite…');
      // laisser le navigateur afficher le message avant le calcul
      await new Promise((r) => setTimeout(r, 30));
      aborted = false;
      try { await prepare(); } catch (err) { removeHud(); throw err; }
      if (aborted) { removeHud(); return; }               // "Quitter" pendant la préparation
      setBusy(null);
      saved = {
        pos: camera.position.clone(), quat: camera.quaternion.clone(), order: camera.rotation.order,
        fov: camera.fov, near: camera.near, exposure: renderer?.toneMappingExposure,
        controlsEnabled: controls?.enabled, controlsUpdate: controls ? controls.update : null,
      };
      if (controls) {
        controls.enabled = false;
        // OrbitControls.update() ré-oriente la caméra vers sa cible : neutralisé pendant la visite
        controls.update = () => false;
      }
      if (exposure != null && renderer) renderer.toneMappingExposure = exposure;
      active = true;
      clearInput();
      addListeners();
      fitFov();
      const sp = spotById(spotId);
      const target = resolveSpot(sp);
      st.spot = sp.id; markSpot(sp.id);
      if (instant) {
        Object.assign(st, { x: target.x, z: target.z, foot: target.foot, eyeY: target.foot + cfg.eye, yaw: target.yaw, pitch: target.pitch });
        applyCamera(); updateRoom(true);
      } else {
        startTransition(target, 1.3);
        if (hud) hud.where.textContent = sp.label;
      }
      onSpot?.(sp);
      showHint(hintText());
      // le bouton qui a lancé la visite ne doit pas garder le focus (Espace le relancerait)
      if (hud) { hud.root.tabIndex = -1; hud.root.focus({ preventScroll: true }); }
      else if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur?.();
      if (autoUpdate) { lastT = 0; raf = requestAnimationFrame(loop); }
    })();
    try { await entering; } finally { entering = false; }
  }

  function goTo(spotId, { instant = false } = {}) {
    if (!active) return enter(spotId, { instant });
    const sp = spotById(spotId);
    const target = resolveSpot(sp);
    st.spot = sp.id; markSpot(sp.id);
    onSpot?.(sp);
    if (instant) {
      trans = null;
      Object.assign(st, { x: target.x, z: target.z, foot: target.foot, eyeY: target.foot + cfg.eye, yaw: target.yaw, pitch: target.pitch, vx: 0, vz: 0 });
      applyCamera(); updateRoom(true);
      return Promise.resolve();
    }
    const d = Math.hypot(target.x - camera.position.x, target.foot + cfg.eye - camera.position.y, target.z - camera.position.z);
    startTransition(target, 0.7 + Math.min(1.1, d / 5));
    if (hud) hud.where.textContent = sp.label;
    return Promise.resolve();
  }

  function exit() {
    if (!active) {
      if (entering) { aborted = true; removeHud(); onExit?.(); }
      return;
    }
    active = false;
    cancelAnimationFrame(raf); raf = 0;
    trans = null;
    removeListeners();
    if (document.pointerLockElement === domElement) document.exitPointerLock?.();
    locked = false;
    clearInput();
    look.id = null; joy.id = null;
    removeHud();
    if (saved) {
      // on garde la position de la visite (l'app choisit ensuite sa vue) ; on rétablit l'optique
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      camera.rotation.order = saved.order;
      camera.fov = saved.fov; camera.near = saved.near; camera.updateProjectionMatrix();
      if (exposure != null && renderer) renderer.toneMappingExposure = saved.exposure;
      if (controls) {
        controls.update = saved.controlsUpdate;
        if (controls.update === Object.getPrototypeOf(controls).update) delete controls.update;
        controls.enabled = saved.controlsEnabled ?? true;
        controls.target?.copy(camera.position).addScaledVector(fwd, 2.0);
        controls.update?.();
      }
      saved = null;
    }
    onExit?.();
  }

  function dispose() {
    exit();
    grid = null; gridPromise = null;
    document.getElementById('wk-style')?.remove();
    styleEl = null;
  }

  // ------------------------------------------------------------- outils (tests, débogage)
  function lookAt(x, y, z) {
    const [yaw, pitch] = yawPitchTo(st.x, st.eyeY, st.z, x, y ?? st.eyeY, z);
    st.yaw = yaw; st.pitch = clampPitch(pitch);
    if (active && !trans) applyCamera();
  }
  function probe(x, z, yGuess = 0) {
    if (!grid) return null;
    const h = floorNear(x, z, yGuess);
    return { floor: Number.isFinite(h) ? h : null, free: Number.isFinite(h) ? bodyFree(x, z, h) : false };
  }
  function getState() {
    return {
      x: +st.x.toFixed(3), z: +st.z.toFixed(3), foot: +st.foot.toFixed(3), eye: +st.eyeY.toFixed(3),
      yawDeg: +((st.yaw * 180) / Math.PI).toFixed(1), pitchDeg: +((st.pitch * 180) / Math.PI).toFixed(1),
      room: st.room, spot: st.spot, blocked: st.blocked, moving: Math.hypot(st.vx, st.vz) > 0.05, transition: !!trans,
    };
  }

  return {
    enter, exit, update, goTo, dispose, prepare, lookAt, probe, getState,
    isActive: () => active,
    spots,
    get stats() { return grid?.stats || null; },
    get config() { return cfg; },
    invalidate() { gridPromise = null; grid = active ? grid : null; },
  };
}
