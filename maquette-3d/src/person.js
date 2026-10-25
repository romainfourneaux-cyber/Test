// Visite avec personnage : une silhouette (1,75 m) parcourt l'extension, la caméra la suit en vue
// plongeante (coupe horizontale à 1,25 m au-dessus de ses pieds) et le sol se colore selon la largeur
// de passage mesurée sur la maquette meublée (src/clearance.js) :
//   vert ≥ 0,90 m · orange 0,60–0,90 m · rouge < 0,60 m (on passe de biais, ou pas du tout).
//
//   const pt = await createPersonTour({ THREE, app });  // grilles d'occupation + analyses (< 1 s)
//   pt.seek(t)              // place personnage, portes, caméra, coupe à l'instant t — déterministe (vidéo)
//   pt.play() / pt.stop()   // lecture temps réel dans la visionneuse (via app.onFrame)
//   pt.overlay(t)           // { hud, labels } : étiquettes à projeter en 2D (vidéo : canevas, page : DOM)
//   pt.duration, pt.fade(t), pt.dispose()
//
// Le trajet entre deux stations est calculé (A*) dans l'espace libre de la grille, en restant au milieu
// des passages étroits ; la silhouette ralentit dans l'orange et passe de profil dans le rouge.
import { LV, ROOMS } from './spec.js';
import { buildGrid, WALK_CFG } from './walk.js';
import { floorAt } from './tour.js';
import * as C from './clearance.js';

export const CUT = 1.25;          // hauteur de coupe au-dessus des pieds
const SPEED = 0.9;                // marche (m/s)
const DOOR_TIME = 1.3;
const STRIDE = 1.30;              // longueur d'un cycle de marche (2 pas)
const DT = 1 / 30;                // pas de précalcul de la trajectoire
const MIN_D = 0.13;               // le centre du corps reste à ≥ 13 cm d'un obstacle (passage de profil)…
const MIN_D_SQUEEZE = 0.09;       // …ou, faute de mieux, 9 cm (on se faufile) ; en dessous : infranchissable
const GRID_CELL = 0.025;          // grille d'occupation plus fine que celle de la visite libre (cotes au cm près)

// Caméra : azimut (depuis +z vers +x), élévation, distance
const CAM = { az: 0.70, el: 0.98, d: 6.2 };

// ---------------------------------------------------------------------------
// Parcours. via : 'line' (droit) | 'auto' (A* dans la carte du niveau) ; map : carte utilisée.
//   face : point regardé pendant l'arrêt ; door : porte ouverte en arrivant (lead s avant) ;
//   doorHold : porte manœuvrée pendant l'arrêt ; cut : fondu au noir avant la station ; cam : réglage caméra
// ---------------------------------------------------------------------------
export const ROUTE = [
  { p: [7.55, -2.15], level: 'ext', hold: 0.8, face: [7.75, 0.4], cam: { az: 0.55, el: 0.95, d: 6.8 } },
  { p: [7.75, -1.25], level: 'ext', via: 'line', hold: 0.9, face: [7.75, 0.4], door: { id: 'porte-entree', lead: 0.3 } },
  { p: [7.72, 0.95], level: 'rdc', via: 'line', hold: 0.3, face: [5.5, 1.7] },
  { p: [5.85, 1.74], level: 'rdc', via: 'auto', hold: 0.5, face: [4.0, 1.7], door: { id: 'porte-wc', lead: 1.5 }, cam: { az: 0.45, el: 1.0, d: 5.6 } },
  { p: [4.45, 1.58], level: 'rdc', via: 'auto', hold: 1.4, face: [3.5, 1.75] },
  { p: [6.52, 1.86], level: 'rdc', via: 'auto', hold: 0.3, face: [6.52, 3.2], door: { id: 'porte-chambre', lead: 1.4 }, cam: { az: 0.80, el: 0.98, d: 6.2 } },
  { p: [6.45, 4.30], level: 'rdc', via: 'auto', hold: 0.4, face: [5.0, 4.75] },
  { p: [3.45, 4.62], level: 'rdc', via: 'auto', hold: 0.4, face: [2.0, 4.6], door: { id: 'galandage-dressing', lead: 1.2 }, cam: { az: 0.35, el: 1.0, d: 6.0 } },
  { p: [1.35, 4.30], level: 'rdc', via: 'auto', hold: 1.2, face: [0.6, 3.8] },
  { p: [2.72, 2.60], level: 'rdc', via: 'auto', hold: 0.3, face: [2.72, 1.6], door: { id: 'coulissante-sdb', lead: 1.2 } },
  { p: [2.25, 1.35], level: 'rdc', via: 'auto', hold: 1.4, face: [2.4, 0.5] },
  // montée : on reprend au pied de l'escalier
  { p: [7.62, 0.80], level: 'stair', cut: true, hold: 0.6, face: [6.0, 0.8], cam: { az: 1.05, el: 0.86, d: 6.0 } },
  { p: [6.40, 0.80], level: 'stair', via: 'line', hold: 0 },
  { p: [5.20, 0.82], level: 'stair', via: 'line', hold: 0 },
  { p: [4.38, 0.92], level: 'stair', via: 'line', hold: 0 },
  { p: [3.78, 1.20], level: 'stair', via: 'line', hold: 0 },
  { p: [3.65, 1.80], level: 'etage', via: 'line', hold: 0.4, face: [3.65, 3.0], cam: { az: 0.55, el: 0.98, d: 5.8 } },
  { p: [3.62, 2.55], level: 'etage', via: 'auto', hold: 0.3, face: [2.4, 2.6], door: { id: 'porte-ch1', lead: 1.3 } },
  { p: [1.75, 3.35], level: 'etage', via: 'auto', hold: 1.2, face: [1.6, 5.0], cam: { az: 0.30, el: 1.0, d: 6.0 } },
  { p: [3.66, 2.62], level: 'etage', via: 'auto', hold: 0.3, face: [5.0, 2.62], door: { id: 'porte-ch2', lead: 1.4 }, cam: { az: -0.35, el: 1.02, d: 5.6 } },
  // chambre 2 : vantail à 90° → 4 cm entre la porte et le lit, on est bloqué ; on l'ouvre en grand
  { p: [4.62, 2.70], level: 'etage', via: 'auto', hold: 3.4, face: [4.75, 3.6], doorHold: { id: 'porte-ch2', to: 170 / 90, delay: 1.7 }, block: true },
  { p: [4.85, 4.15], level: 'etage', via: 'auto', map: 'etageB', hold: 0.5, face: [6.2, 3.9], cam: { az: 0.75, el: 0.98, d: 6.0 } },
  { p: [5.55, 4.30], level: 'etage', via: 'auto', map: 'etageB', hold: 2.2, face: [5.55, 6.0] },
];

// Points de mesure annotés (largeur relevée automatiquement sur la carte, sauf valeur imposée)
export const SPOTS = [
  { id: 'entree', level: 'rdc', p: [7.73, 0.18], r: 0.12, title: 'Porte d\'entrée', sub: 'passage libre, vantail ouvert' },
  { id: 'degagement', level: 'rdc', p: [6.30, 1.72], r: 0.45, title: 'Dégagement', sub: 'console / échiffre' },
  { id: 'wc', level: 'rdc', p: [4.45, 1.58], r: 0.30, title: 'WC', sub: 'devant la cuvette, porte ouverte' },
  { id: 'porte-chambre', level: 'rdc', p: [6.52, 2.22], r: 0.20, title: 'Porte chambre', sub: 'passage libre' },
  { id: 'pied-lit', level: 'rdc', p: [5.00, 4.72], r: 0.40, title: 'Pied du lit', sub: 'lit 180 / baie : de profil' },
  { id: 'cote-lit', level: 'rdc', p: [6.45, 3.60], r: 0.35, title: 'Côté lit', sub: 'lit / cloison du sas' },
  { id: 'fauteuil', level: 'rdc', p: [3.62, 3.95], r: 0.25, title: 'Fauteuil / lit', sub: 'côté dressing' },
  { id: 'galandage', level: 'rdc', p: [2.265, 4.60], r: 0.15, title: 'Galandage dressing', sub: 'porte coulissante ouverte' },
  { id: 'sdb', level: 'rdc', p: [2.72, 2.22], r: 0.20, title: 'Porte SdB', sub: 'coulissante ouverte' },
  { id: 'escalier', level: 'stair', p: [5.80, 0.79], r: 0.25, title: 'Escalier', sub: 'entre main courante et garde-corps' },
  { id: 'palier', level: 'etage', p: [3.65, 2.10], r: 0.30, title: 'Palier', sub: 'arrivée d\'escalier' },
  { id: 'ch1-porte', level: 'etage', p: [2.62, 2.75], r: 0.30, title: 'Entrée ch. 1', sub: 'porte ouverte / lit' },
  { id: 'ch1-ruelle', level: 'etage', p: [2.80, 1.50], r: 0.30, title: 'Ruelle du lit', sub: 'lit / cloison palier' },
  // vantail à 90° (poignée comprise) : x 4,18 -> 5,01 ; lit 180 : x 5,04 -> 6,94 (furniture_etage.js)
  { id: 'ch2-porte', level: 'etage', p: [5.02, 3.05], r: 0.10, w: 0.03, title: 'Porte ch. 2 ouverte à 90°', sub: '3 cm entre porte et lit : bloqué', block: true },
];

// ---------------------------------------------------------------------------
export async function createPersonTour({ THREE, app, onProgress } = {}) {
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  // --- portes
  const doors = new Map();
  app.model.traverse((o) => { if (o.userData.door) doors.set(o.userData.door.id, o); });
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  function setDoor(id, t) {
    const o = doors.get(id); if (!o) return;
    const d = o.userData.door, v = d.closed + (d.open - d.closed) * t;
    if (d.kind === 'hinge') o.rotation.y = v; else o.position.set(d.dir[0] * v, 0, d.dir[1] * v);
  }
  function resetDoors() {
    for (const o of doors.values()) {
      const d = o.userData.door;
      if (d.kind === 'hinge') o.rotation.y = d.default; else o.position.set(d.dir[0] * d.default, 0, d.dir[1] * d.default);
    }
  }

  // --- grilles : portes dans l'état "passage" (A : porte ch2 à 90°, B : ouverte en grand)
  const vis = { furniture: app.state.furniture, etage: app.state.etage, roof: app.state.roof };
  Object.assign(app.state, { furniture: true, etage: true, roof: true });
  app.applyVisibility();
  const doorTo = {};
  for (const st of ROUTE) if (st.door) doorTo[st.door.id] = st.door.to ?? 1;
  for (const id of doors.keys()) setDoor(id, doorTo[id] ?? 0);
  const cfg = { ...WALK_CFG, cell: GRID_CELL };
  const gridA = await buildGrid(THREE, app.model, cfg, (p) => onProgress?.(p * 0.4));
  setDoor('porte-ch2', 170 / 90);
  const gridB = await buildGrid(THREE, app.model, cfg, (p) => onProgress?.(0.4 + p * 0.4));
  resetDoors();
  Object.assign(app.state, vis);
  app.applyVisibility();

  const RECT_RDC = { x0: 0.20, x1: 8.40, z0: -0.05, z1: 5.00 };   // seuils compris
  const RECT_ET = { x0: 0.30, x1: 7.00, z0: 0.30, z1: 4.95 };
  const RECT_ST = { x0: 3.20, x1: 7.32, z0: 0.34, z1: 1.30 };
  const maps = {
    rdc: C.analyse(gridA, C.flatFloor(gridA, LV.rdc, 0.05, RECT_RDC)),
    etage: C.analyse(gridA, C.flatFloor(gridA, LV.slabTop, 0.05, RECT_ET)),
    etageB: C.analyse(gridB, C.flatFloor(gridB, LV.slabTop, 0.05, RECT_ET)),
    stair: C.analyse(gridA, C.stairFloor(gridA, RECT_ST, (x, z) => floorAt(x, z, 'stair'))),
  };
  const grid = gridA;   // même géométrie de grille pour A et B
  // zones atteignables depuis le parcours (les poches fermées, l'intérieur des meubles... restent neutres)
  for (const [k, m] of Object.entries(maps)) {
    const lv = k === 'etageB' ? 'etage' : k;
    const seeds = ROUTE.filter((s) => s.level === lv).map((s) => s.p);
    if (k === 'stair') seeds.push([5.8, 0.8]);
    m.reach = reachable(grid, m, seeds, 0.10);
  }
  onProgress?.(0.95);

  // --- trajet : A* par tronçon, lissage, échantillonnage tous les 2 cm
  const legs = [];   // par station i>0 : { pts:[{x,z}], map }
  for (let i = 1; i < ROUTE.length; i++) {
    const a = ROUTE[i - 1], b = ROUTE[i];
    if (b.cut) { legs[i] = null; continue; }
    const mapName = b.map || (b.level === 'stair' || a.level === 'stair' ? 'stair' : b.level === 'ext' || a.level === 'ext' ? null : b.level);
    let pts;
    if (b.via === 'auto' && maps[mapName]) {
      pts = planPath(grid, maps[mapName], a.p, b.p);
      if (!pts) { console.warn('trajet introuvable', a.p, b.p); pts = [a.p, b.p]; }
    } else pts = [a.p, b.p];
    legs[i] = { pts: resample(pts, 0.02), map: mapName };
  }

  // largeur au point (x, z) d'un niveau donné : à l'arrêt, épaisseur locale ; en marche, corde libre
  // perpendiculaire au mouvement (t = direction)
  const mapOrder = (lvl, mapName) => {
    const order = mapName ? [mapName] : [];
    if (lvl === 'stair') order.push('stair', 'rdc', 'etage');
    else if (lvl === 'etage') order.push('etage');
    else if (lvl === 'rdc') order.push('rdc');
    return order;
  };
  function widthAt(x, z, lvl, mapName, t = null) {
    if (lvl === 'stair') {          // pied et haut de volée : sol du sas / du palier
      const y = stairY(x, z);
      if (y < 0.05) { lvl = 'rdc'; mapName = null; } else if (y > 2.55) { lvl = 'etage'; mapName = null; }
    }
    for (const n of mapOrder(lvl, mapName)) {
      const m = maps[n]; if (!m) continue;
      const lt = C.sampleMap(grid, m, 'width', x, z, 0.10);
      if (!(lt > 0)) continue;
      if (!t) return lt;
      // corde perpendiculaire bornée : ≥ 2 × distance à l'obstacle (cercle libre autour du corps),
      // ≤ épaisseur locale (qui, elle, surestime les baies percées dans une cloison mince)
      const ch = C.chordWidth(grid, m, x, z, t[0], t[1], { spread: 0, alt: n === 'stair' ? [] : [maps.stair] });
      const d2 = 2 * C.sampleMap(grid, m, 'dist', x, z, 0.10);
      return Math.min(lt, Math.max(Number.isFinite(ch) ? ch : lt, d2));
    }
    return NaN;
  }
  // hauteur des marches ; au-delà du nez de la dernière marche (z > 1,29), palier de l'étage
  const stairY = (x, z) => (z >= 1.29 && x < 4.17 ? LV.slabTop : floorAt(x, z, 'stair'));
  const footY = (x, z, lvl) => {
    if (lvl === 'ext') return z > 0.20 ? LV.rdc : LV.ground;
    if (lvl === 'stair') return stairY(x, z);
    return lvl === 'etage' ? LV.slabTop : LV.rdc;
  };

  // --- chronologie : marche à vitesse variable (ralentit dans les passages étroits) + arrêts
  const K = [];   // images-clés { t, x, z, y, yRaw, w, lvl, st, seg, moving }
  const timeline = [];
  let t = 0, seg = 0;
  const speedFor = (w) => (!Number.isFinite(w) || w >= C.CLEAR.ok ? SPEED : w >= C.CLEAR.tight ? SPEED * 0.72 : SPEED * 0.42);
  for (let i = 0; i < ROUTE.length; i++) {
    const st = ROUTE[i];
    if (st.cut) { t += 0.9; seg++; }
    const leg = legs[i];
    if (leg) {
      const P = leg.pts, n = P.length;
      const lvlAt = (j) => {
        const a = ROUTE[i - 1].level, b = st.level;
        if (a === 'stair' || b === 'stair') return 'stair';
        if (a === 'ext' || b === 'ext') return P[j][1] < 0.02 ? 'ext' : 'rdc';   // seuil de la porte d'entrée
        return j < n / 2 ? a : b;
      };
      const tan = (j) => { const a = P[Math.max(0, j - 2)], b = P[Math.min(n - 1, j + 2)]; return [b[0] - a[0], b[1] - a[1]]; };
      const ws = P.map((p, j) => widthAt(p[0], p[1], lvlAt(j), leg.map, tan(j)));
      const raw = P.map((p, j) => footY(p[0], p[1], lvlAt(j)));
      const ys = smooth1(raw, 12);           // ~0,24 m : montée régulière dans l'escalier
      const vs = smooth1(ws.map(speedFor), 14);
      const L = (n - 1) * 0.02;
      for (let j = 0; j < n; j++) {
        if (j > 0) {
          const s = j * 0.02, ramp = Math.min(1, 0.3 + 0.7 * Math.min(s, L - s) / 0.45);
          t += 0.02 / (vs[j] * Math.max(0.3, ramp));
        }
        K.push({ t, x: P[j][0], z: P[j][1], y: ys[j], yRaw: raw[j], w: ws[j], lvl: lvlAt(j), st: i, seg, moving: true });
      }
    } else {
      K.push({ t, x: st.p[0], z: st.p[1], y: footY(st.p[0], st.p[1], st.level), yRaw: footY(st.p[0], st.p[1], st.level), w: widthAt(st.p[0], st.p[1], st.level, st.map), lvl: st.level, st: i, seg, moving: false });
    }
    timeline.push({ tArrive: t, tLeave: t + st.hold });
    if (st.hold > 0) {
      const last = K[K.length - 1];
      t += st.hold;
      K.push({ ...last, t, moving: false });
    }
  }
  const duration = t + 0.8;

  // portes (temps absolus) ; une porte peut avoir plusieurs actions successives
  const doorActions = [];
  ROUTE.forEach((st, i) => {
    if (st.door) doorActions.push({ id: st.door.id, from: 0, to: st.door.to ?? 1, t0: timeline[i].tArrive - st.door.lead });
    if (st.doorHold) doorActions.push({ id: st.doorHold.id, from: null, to: st.doorHold.to, t0: timeline[i].tArrive + st.doorHold.delay });
  });
  for (const a of doorActions) {
    a.t1 = a.t0 + DOOR_TIME * (a.from === null ? 1.2 : 1);
    if (a.from === null) { const prev = doorActions.filter((b) => b.id === a.id && b.t0 < a.t0).at(-1); a.from = prev ? prev.to : 0; }
  }
  const cuts = ROUTE.map((st, i) => (st.cut ? timeline[i].tArrive - 0.45 : null)).filter((v) => v != null);
  function fade(time) {
    let a = Math.max(1 - Math.min(1, time / 0.6), Math.min(1, Math.max(0, (time - (duration - 0.6)) / 0.6)));
    for (const c of cuts) a = Math.max(a, 1 - Math.min(1, Math.abs(time - c) / 0.45));
    return a;
  }

  // --- échantillonnage régulier (DT) + grandeurs lissées (cap, profil, caméra, coupe)
  const NS = Math.ceil(duration / DT) + 1;
  const S = { x: new Float32Array(NS), z: new Float32Array(NS), y: new Float32Array(NS), w: new Float32Array(NS), seg: new Int16Array(NS), st: new Int16Array(NS), lvl: [], dist: new Float32Array(NS), speed: new Float32Array(NS) };
  {
    let k = 0;
    for (let n = 0; n < NS; n++) {
      const tt = n * DT;
      while (k < K.length - 2 && K[k + 1].t <= tt) k++;
      const a = K[k], b = K[Math.min(K.length - 1, k + 1)];
      const f = b.t > a.t && a.seg === b.seg ? Math.min(1, Math.max(0, (tt - a.t) / (b.t - a.t))) : (tt >= b.t ? 1 : 0);
      const pick = f < 0.5 ? a : b;
      S.x[n] = a.x + (b.x - a.x) * f; S.z[n] = a.z + (b.z - a.z) * f; S.y[n] = a.y + (b.y - a.y) * f;
      S.w[n] = Number.isFinite(pick.w) ? pick.w : 9;
      S.seg[n] = pick.seg; S.st[n] = pick.st; S.lvl[n] = pick.lvl;
    }
    for (let n = 1; n < NS; n++) {
      const dd = S.seg[n] === S.seg[n - 1] ? Math.hypot(S.x[n] - S.x[n - 1], S.z[n] - S.z[n - 1]) : 0;
      S.dist[n] = S.dist[n - 1] + dd; S.speed[n] = dd / DT;
    }
    S.speed[0] = S.speed[1] || 0;
  }
  const gs = (arr, sigma) => gaussSeg(arr, S.seg, sigma / DT);
  // cap : direction du mouvement, ou vers le point regardé à l'arrêt
  const yawRaw = new Float32Array(NS);
  {
    let prev = 0;
    for (let n = 0; n < NS; n++) {
      const a = Math.max(0, n - 3), b = Math.min(NS - 1, n + 3);
      const dx = S.x[b] - S.x[a], dz = S.z[b] - S.z[a];
      let y = prev;
      if (Math.hypot(dx, dz) > 0.02 && S.seg[a] === S.seg[b]) y = Math.atan2(dx, dz);
      else {
        const st = ROUTE[S.st[n]];
        if (st.face) y = Math.atan2(st.face[0] - S.x[n], st.face[1] - S.z[n]);
      }
      // déroulé (pas de saut de 2π)
      while (y - prev > Math.PI) y -= 2 * Math.PI;
      while (y - prev < -Math.PI) y += 2 * Math.PI;
      yawRaw[n] = y; prev = y;
    }
  }
  const yaw = gs(yawRaw, 0.16);
  const amp = gs(Float32Array.from(S.speed, (v) => Math.min(1, v / 0.55)), 0.12);
  const twistRaw = Float32Array.from(S.w, (w, n) => (S.speed[n] > 0.05 || w < C.CLEAR.tight ? Math.min(1, Math.max(0, (0.64 - w) / 0.10)) : 0));
  const twist = gs(twistRaw, 0.25);
  const climbRaw = new Float32Array(NS);
  for (let n = 1; n < NS; n++) climbRaw[n] = S.speed[n] > 0.05 ? Math.max(-1, Math.min(1, ((S.y[n] - S.y[n - 1]) / DT) / Math.max(0.1, S.speed[n]) / 0.6)) : 0;
  const climb = gs(climbRaw, 0.2);
  // caméra
  const camSet = []; { let cur = CAM; ROUTE.forEach((st) => { if (st.cam) cur = { ...CAM, ...st.cam }; camSet.push(cur); }); }
  const camAz = gs(Float32Array.from(S.st, (i) => camSet[i].az), 1.1);
  const camEl = gs(Float32Array.from(S.st, (i) => camSet[i].el), 1.1);
  const camD = gs(Float32Array.from(S.st, (i) => camSet[i].d), 1.1);
  const lookX = new Float32Array(NS), lookZ = new Float32Array(NS);
  for (let n = 0; n < NS; n++) { lookX[n] = S.x[n] + Math.sin(yaw[n]) * 0.35 * amp[n]; lookZ[n] = S.z[n] + Math.cos(yaw[n]) * 0.35 * amp[n]; }
  const tgX = gs(lookX, 0.55), tgZ = gs(lookZ, 0.55), tgY = gs(S.y, 0.5);
  const cutY = gs(S.y, 0.35);

  // --- silhouette
  const fig = createFigure(THREE);
  fig.root.visible = false;
  app.scene.add(fig.root);

  // --- coupe propre aux calques (mêmes valeurs que la coupe de la maquette)
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), CUT);

  // --- sols colorés (texture par niveau, cellules de 5 cm filtrées bilinéairement)
  const overlay = new THREE.Group();
  overlay.name = 'largeurs-de-passage';
  overlay.visible = false;
  app.scene.add(overlay);
  const unAO = app.excludeFromAO?.(overlay);
  const heat = {};
  for (const [name, y] of [['rdc', LV.rdc], ['etage', LV.slabTop], ['etageB', LV.slabTop]]) {
    heat[name] = heatPlane(THREE, grid, maps[name], y + 0.022, cutPlane);
    overlay.add(heat[name]);
  }
  heat.etageB.material.opacity = 0;
  const stairHeat = stairCells(THREE, grid, maps.stair, cutPlane);
  overlay.add(stairHeat);

  // --- trace des pas (ruban coloré selon la largeur)
  const trail = trailMesh(THREE, K, cutPlane);
  overlay.add(trail.mesh);

  // --- points de mesure
  // cote d'un point de mesure : la plus petite largeur relevée sur le trajet à proximité, sinon
  // l'épaisseur locale minimale autour du point
  const grp = (l) => (l === 'stair' ? 'stair' : l === 'etage' ? 'etage' : 'rdc');
  const spots = SPOTS.map((sp) => {
    const m = maps[sp.level === 'stair' ? 'stair' : sp.level];
    let w = sp.w;
    if (w == null) {
      const near = K.filter((k) => k.moving && Number.isFinite(k.w) && grp(k.lvl) === sp.level && Math.hypot(k.x - sp.p[0], k.z - sp.p[1]) <= sp.r + 0.25);
      w = near.length ? Math.min(...near.map((k) => k.w)) : minWidthAround(grid, m, sp.p[0], sp.p[1], sp.r);
    }
    const y = sp.level === 'stair' ? floorAt(sp.p[0], sp.p[1], 'stair') : sp.level === 'etage' ? LV.slabTop : LV.rdc;
    return { ...sp, w, cls: sp.block ? 'block' : C.widthClass(w), y };
  });
  const pathMin = K.filter((k) => k.moving && Number.isFinite(k.w)).reduce((m, k) => Math.min(m, k.w), 9);

  // --- état à l'instant t
  const idx = (time) => { const f = Math.min(NS - 1, Math.max(0, time / DT)); const n = Math.floor(f); return [n, Math.min(NS - 1, n + 1), f - n]; };
  const lerpA = (arr, i0, i1, f) => arr[i0] + (arr[i1] - arr[i0]) * f;
  function stateAt(time) {
    const [i0, i1, f] = idx(time);
    const L = (a) => lerpA(a, i0, i1, f);
    return {
      x: L(S.x), z: L(S.z), y: L(S.y), w: S.w[f < 0.5 ? i0 : i1], lvl: S.lvl[f < 0.5 ? i0 : i1], st: S.st[i0],
      yaw: L(yaw), amp: L(amp), twist: L(twist), climb: L(climb), dist: L(S.dist),
      cam: { az: L(camAz), el: L(camEl), d: L(camD), tx: L(tgX), ty: L(tgY), tz: L(tgZ) }, cut: L(cutY) + CUT,
    };
  }

  function roomAt(x, z, lvl) {
    if (lvl === 'stair') return 'Escalier';
    if (lvl === 'ext') return 'Allée d\'entrée';
    const want = lvl === 'etage' ? 'etage' : 'rdc';
    for (const r of Object.values(ROOMS)) {
      if (r.level !== want) continue;
      for (const q of [r, r.alcove, r.niche, r.alcoveBain]) if (q && x >= q.x0 - 0.04 && x <= q.x1 + 0.04 && z >= q.z0 - 0.04 && z <= q.z1 + 0.04) return r.name;
    }
    return want === 'etage' ? 'Étage' : 'Rez-de-chaussée';
  }

  let active = false;
  function seek(time) {
    const s = stateAt(time);
    if (!active) {
      active = true;
      app.setView('tour-perso', { animate: false });
      fig.root.visible = true; overlay.visible = true;
    }
    // portes
    for (const id of doors.keys()) setDoor(id, 0);
    for (const a of doorActions) if (time >= a.t0) setDoor(a.id, a.from + (a.to - a.from) * ease((time - a.t0) / (a.t1 - a.t0)));
    // coupe horizontale
    app.applyClip([{ n: [0, -1, 0], c: s.cut }]);
    cutPlane.constant = s.cut;
    // sols : bascule ch2 (porte à 90° -> grande ouverture)
    const ch2 = doorActions.find((a) => a.id === 'porte-ch2' && a.to > 1);
    const kB = ch2 ? ease((time - ch2.t0) / (ch2.t1 - ch2.t0)) : 0;
    heat.etage.material.opacity = 1 - kB; heat.etageB.material.opacity = kB;
    trail.show(time);
    // silhouette
    fig.pose(s, time);
    // caméra
    const { az, el, d, tx, ty, tz } = s.cam;
    const tg = V3(tx, ty + 0.85, tz);
    app.camera.position.set(tx + d * Math.cos(el) * Math.sin(az), ty + 0.85 + d * Math.sin(el), tz + d * Math.cos(el) * Math.cos(az));
    app.camera.lookAt(tg);
    app.camera.updateMatrixWorld();
    app.requestRender?.();
    return s;
  }

  // étiquettes et bandeau : positions 3D + textes ; alpha selon la proximité du personnage
  function overlayAt(time) {
    const s = stateAt(time);
    const lvlGroup = (l) => (l === 'stair' ? 'stair' : l === 'etage' ? 'etage' : 'rdc');
    const g = lvlGroup(s.lvl);
    let labels = [];
    for (const sp of spots) {
      const sameLevel = sp.level === g || (g === 'stair' && sp.level !== 'rdc' && s.y > 1.2) || (sp.level === 'stair' && g !== 'etage');
      if (!sameLevel) continue;
      const dd = Math.hypot(sp.p[0] - s.x, sp.p[1] - s.z);
      let a = Math.min(1, Math.max(0, (2.3 - dd) / 0.5));
      if (sp.id === 'ch2-porte') {         // n'apparaît que pendant le blocage, tant que la porte est à 90°
        const i = ROUTE.findIndex((r) => r.block);
        const t0 = timeline[i].tArrive - 0.6, t1 = doorActions.find((x) => x.id === 'porte-ch2' && x.to > 1).t0 + 0.5;
        a = Math.min(Math.min(1, Math.max(0, (time - t0) / 0.4)), Math.min(1, Math.max(0, (t1 + 0.6 - time) / 0.4)));
      }
      if (a <= 0.01) continue;
      labels.push({ id: sp.id, x: sp.p[0], y: sp.y + 0.05, z: sp.p[1], w: sp.w, cls: sp.cls, title: sp.title, sub: sp.sub, text: C.fmtWidth(sp.w), alpha: a, d: sp.id === 'ch2-porte' ? -1 : dd });
    }
    labels = labels.sort((p, q) => p.d - q.d).slice(0, 3);     // les 3 plus proches
    const room = roomAt(s.x, s.z, s.lvl);
    let w = s.w < 8 ? s.w : NaN, blocked = false;
    // arrêt devant la porte de la chambre 2 : passage bloqué tant qu'elle n'est pas ouverte en grand
    const st = ROUTE[s.st], tl = timeline[s.st];
    if (st?.block && st.doorHold && time >= tl.tArrive - 0.2 && time < tl.tArrive + st.doorHold.delay + DOOR_TIME) { w = 0.03; blocked = true; }
    return {
      hud: { room, w, cls: Number.isFinite(w) ? C.widthClass(w) : 'ok', text: Number.isFinite(w) ? C.fmtWidth(w) + (blocked ? ' · bloqué' : '') : '—', profile: !blocked && s.twist > 0.5 },
      labels,
      person: { x: s.x, y: s.y + 1.9, z: s.z },
    };
  }

  // --- lecture temps réel (visionneuse)
  let playing = false, clock = 0, off = null, onEnd = null, onTick = null;
  function play({ from = 0, ended, tick } = {}) {
    stop();
    playing = true; clock = from; onEnd = ended || null; onTick = tick || null;
    app.setControlsEnabled?.(false);
    seek(clock); onTick?.(clock);
    off = app.onFrame((dt) => {
      if (!playing) return;
      clock = Math.min(duration, clock + Math.min(dt, 0.1));
      seek(clock); onTick?.(clock);
      if (clock >= duration) { const cb = onEnd; stop(); cb?.(); }
    });
  }
  function stop() {
    if (off) { off(); off = null; }
    if (playing) playing = false;
    if (active) {
      active = false;
      resetDoors();
      fig.root.visible = false; overlay.visible = false;
      app.setControlsEnabled?.(true);
      app.requestRender?.();
    }
  }
  function dispose() {
    stop();
    app.scene.remove(fig.root, overlay);
    unAO?.();
    fig.dispose(); overlay.traverse((o) => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } });
  }

  // Plan vu de dessus d'un niveau : portes en position de passage (porte ch2 à 90°), trace complète,
  // personnage masqué. Renvoie les étiquettes du niveau (la caméra est réglée par l'appelant).
  function planView(level) {
    stop();
    app.setView('tour-perso', { animate: false });
    for (const id of doors.keys()) setDoor(id, doorTo[id] ?? 0);
    const c = (level === 'etage' ? LV.slabTop : LV.rdc) + CUT;
    app.applyClip([{ n: [0, -1, 0], c }]);
    cutPlane.constant = c;
    heat.etage.material.opacity = 1; heat.etageB.material.opacity = 0;
    trail.show(level === 'etage' ? duration : timeline[ROUTE.findIndex((r) => r.cut)].tArrive);
    fig.root.visible = false; overlay.visible = true;
    app.requestRender?.();
    const labels = spots.filter((sp) => sp.level === level || (level === 'rdc' && sp.level === 'stair'))
      .map((sp) => ({ id: sp.id, x: sp.p[0], y: sp.y + 0.05, z: sp.p[1], w: sp.w, cls: sp.cls, title: sp.title, sub: sp.sub, text: C.fmtWidth(sp.w), alpha: 1 }));
    return { labels, hud: null };
  }

  return {
    duration, seek, play, stop, fade, dispose, overlay: overlayAt, stateAt, planView,
    get playing() { return playing; }, get time() { return clock; },
    route: ROUTE, timeline, doorActions, spots, maps, grid, pathMin,
    figure: fig.root,
  };
}

// ---------------------------------------------------------------------------
// Silhouette articulée (1,75 m), face vers +z en repère local
// ---------------------------------------------------------------------------
function createFigure(THREE) {
  const mats = {
    top: new THREE.MeshStandardMaterial({ color: '#cf5427', roughness: 0.72 }),
    pants: new THREE.MeshStandardMaterial({ color: '#2f3a46', roughness: 0.8 }),
    skin: new THREE.MeshStandardMaterial({ color: '#e0bf9f', roughness: 0.6 }),
    shoe: new THREE.MeshStandardMaterial({ color: '#23262a', roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: '#3a2b22', roughness: 0.8 }),
  };
  const geos = [];
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { geos.push(geo); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
  const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14);
  const root = new THREE.Group(); root.name = 'personnage';
  const body = new THREE.Group(); root.add(body);
  // bassin + tronc
  const hips = new THREE.Group(); hips.position.y = 0.92; body.add(hips);
  const pelvis = mesh(new THREE.SphereGeometry(1, 18, 12), mats.pants, 0, 0.02, 0); pelvis.scale.set(0.175, 0.11, 0.12); hips.add(pelvis);
  const torso = mesh(capsule(0.14, 0.32), mats.top, 0, 0.31, 0); torso.scale.set(1.52, 1, 0.86); hips.add(torso);
  const neck = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.10, 12), mats.skin, 0, 0.60, 0); hips.add(neck);
  const head = mesh(new THREE.SphereGeometry(0.105, 22, 16), mats.skin, 0, 0.725, 0.005); head.scale.set(0.95, 1.08, 1.05); hips.add(head);
  const hair = mesh(new THREE.SphereGeometry(0.108, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mats.hair, 0, 0.735, -0.008); hair.scale.set(0.97, 1.05, 1.08); hips.add(hair);
  const nose = mesh(new THREE.SphereGeometry(0.022, 10, 8), mats.skin, 0, 0.715, 0.11); hips.add(nose);
  // jambes
  const legs = [-1, 1].map((sd) => {
    const hip = new THREE.Group(); hip.position.set(sd * 0.095, 0, 0); hips.add(hip);
    hip.add(mesh(capsule(0.068, 0.30), mats.pants, 0, -0.22, 0));
    const knee = new THREE.Group(); knee.position.y = -0.44; hip.add(knee);
    knee.add(mesh(capsule(0.052, 0.32), mats.pants, 0, -0.20, 0));
    const foot = mesh(new THREE.BoxGeometry(0.095, 0.07, 0.25), mats.shoe, 0, -0.385, 0.05); knee.add(foot);
    return { hip, knee };
  });
  // bras
  const arms = [-1, 1].map((sd) => {
    const sh = new THREE.Group(); sh.position.set(sd * 0.205, 0.50, 0); sh.rotation.z = sd * 0.07; hips.add(sh);
    sh.add(mesh(capsule(0.046, 0.22), mats.top, 0, -0.15, 0));
    const el = new THREE.Group(); el.position.y = -0.30; sh.add(el);
    el.add(mesh(capsule(0.04, 0.19), mats.skin, 0, -0.13, 0));
    el.add(mesh(new THREE.SphereGeometry(0.045, 12, 10), mats.skin, 0, -0.27, 0.005));
    return { sh, el };
  });

  function pose(s, time) {
    root.position.set(s.x, s.y, s.z);
    root.rotation.y = s.yaw + s.twist * 1.25;      // de profil dans les passages < 0,60 m
    const ph = (s.dist / STRIDE) * Math.PI * 2, a = s.amp;
    const lift = Math.max(0, s.climb);
    for (const [k, L] of legs.entries()) {
      const p = ph + k * Math.PI;
      L.hip.rotation.x = -a * (0.42 * Math.sin(p) + 0.28 * lift);
      L.knee.rotation.x = a * (0.10 + 0.70 * Math.max(0, Math.cos(p)) + 0.45 * lift * Math.max(0, Math.cos(p)));
    }
    for (const [k, A] of arms.entries()) {
      const p = ph + k * Math.PI;
      A.sh.rotation.x = a * 0.38 * Math.sin(p);
      A.el.rotation.x = -0.18 - a * 0.25 * Math.max(0, -Math.sin(p));
    }
    // respiration à l'arrêt, oscillation verticale en marche
    hips.position.y = 0.92 + a * 0.022 * Math.cos(2 * ph) - a * 0.012 + (1 - a) * 0.004 * Math.sin(time * 2.4);
    torso.rotation.x = 0.05 * a + 0.08 * lift;
  }
  function dispose() { geos.forEach((g) => g.dispose()); Object.values(mats).forEach((m) => m.dispose()); }
  return { root, pose, dispose };
}

// ---------------------------------------------------------------------------
// Calques : sols colorés, cellules de l'escalier, trace
// ---------------------------------------------------------------------------
const RGB = { ok: [63, 160, 92], tight: [240, 150, 40], block: [222, 52, 40] };
const ALPHA = { ok: 0.40, tight: 0.58, block: 0.78 };

function cellRGBA(m, k) {
  if (!m.free[k] || !m.reach[k]) return null;
  const w = m.width[k], cls = C.widthClass(w);
  const a = ALPHA[cls] * Math.min(1, Math.max(0, (m.dist[k] - 0.03) / 0.10));
  return [...RGB[cls], a];
}

function heatPlane(THREE, grid, m, y, cutPlane) {
  const { nx, nz, cs, bx0, bz0 } = grid;
  const data = new Uint8Array(nx * nz * 4);
  for (let k = 0; k < nx * nz; k++) {
    const c = cellRGBA(m, k);
    if (!c) continue;
    data[k * 4] = c[0]; data[k * 4 + 1] = c[1]; data[k * 4 + 2] = c[2]; data[k * 4 + 3] = Math.round(c[3] * 255);
  }
  // couleurs étendues sous les cellules transparentes voisines (pas de liseré sombre au filtrage)
  for (let pass = 0; pass < 2; pass++) {
    const src = data.slice();
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      if (src[k * 4 + 3] || (src[k * 4] | src[k * 4 + 1] | src[k * 4 + 2])) continue;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
        const q = jj * nx + ii;
        if (src[q * 4] | src[q * 4 + 1] | src[q * 4 + 2]) { data[k * 4] = src[q * 4]; data[k * 4 + 1] = src[q * 4 + 1]; data[k * 4 + 2] = src[q * 4 + 2]; break; }
      }
    }
  }
  const tex = new THREE.DataTexture(data, nx, nz, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  const X0 = bx0, X1 = bx0 + nx * cs, Z0 = bz0, Z1 = bz0 + nz * cs;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([X0, y, Z0, X0, y, Z1, X1, y, Z1, X1, y, Z0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1, 1, 0], 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: [cutPlane],
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, toneMapped: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  return mesh;
}

function stairCells(THREE, grid, m, cutPlane) {
  const { nx, nz, cs, bx0, bz0 } = grid;
  const pos = [], col = [];
  for (let k = 0; k < nx * nz; k++) {
    const c = cellRGBA(m, k);
    if (!c || c[3] < 0.02) continue;
    const i = k % nx, j = Math.floor(k / nx), x = bx0 + i * cs, z = bz0 + j * cs, y = m.floor[k] + 0.006;
    const q = [[x, z], [x, z + cs], [x + cs, z + cs], [x, z], [x + cs, z + cs], [x + cs, z]];
    for (const [px, pz] of q) { pos.push(px, y, pz); col.push(c[0] / 255, c[1] / 255, c[2] / 255, c[3]); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col.map((v, n) => (n % 4 === 3 ? v : srgbToLinear(v))), 4));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: [cutPlane],
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, toneMapped: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  return mesh;
}

function trailMesh(THREE, K, cutPlane) {
  const pts = K.filter((k) => k.moving);
  const pos = [], col = [], times = [];
  const W = 0.035;
  for (let n = 1; n < pts.length; n++) {
    const a = pts[n - 1], b = pts[n];
    if (a.seg !== b.seg || Math.hypot(b.x - a.x, b.z - a.z) > 0.2) continue;
    const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1, px = (-dz / l) * W, pz = (dx / l) * W;
    const ya = a.yRaw + 0.03, yb = b.yRaw + 0.03;
    const c = RGB[Number.isFinite(b.w) ? C.widthClass(b.w) : 'ok'].map((v) => srgbToLinear(v / 255));
    const quad = [[a.x - px, ya, a.z - pz], [a.x + px, ya, a.z + pz], [b.x + px, yb, b.z + pz], [a.x - px, ya, a.z - pz], [b.x + px, yb, b.z + pz], [b.x - px, yb, b.z - pz]];
    for (const v of quad) { pos.push(...v); col.push(...c); }
    times.push(b.t);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, clippingPlanes: [cutPlane], toneMapped: false,
    polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6, transparent: true, opacity: 0.95, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 3;
  function show(time) {
    let lo = 0, hi = times.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (times[mid] <= time) lo = mid + 1; else hi = mid; }
    geo.setDrawRange(0, lo * 6);
  }
  return { mesh, show };
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

// ---------------------------------------------------------------------------
// Outils sur la grille
// ---------------------------------------------------------------------------
const cellOf = (g, x, z) => [Math.floor((x - g.bx0) / g.cs), Math.floor((z - g.bz0) / g.cs)];

// cellules praticables reliées aux germes par des cellules à ≥ minD d'un obstacle
function reachable(grid, m, seeds, minD) {
  const { nx, nz } = grid;
  const R = new Uint8Array(nx * nz), core = new Uint8Array(nx * nz);
  const stack = [];
  for (const [x, z] of seeds) {
    const k = nearestFree(grid, m, x, z, minD);
    if (k >= 0 && !core[k]) { core[k] = 1; stack.push(k); }
  }
  while (stack.length) {
    const k = stack.pop(), i = k % nx, j = (k - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
      const q = jj * nx + ii;
      if (!core[q] && m.free[q] && m.dist[q] >= minD) { core[q] = 1; stack.push(q); }
    }
  }
  // + la frange (cellules praticables à moins de minD, voisines du cœur)
  const n = Math.round(0.2 / grid.cs);
  for (let k = 0; k < nx * nz; k++) {
    if (!core[k]) continue;
    R[k] = 1;
    const i = k % nx, j = (k - i) / nx;
    for (let dj = -n; dj <= n; dj++) for (let di = -n; di <= n; di++) {
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
      const q = jj * nx + ii; if (m.free[q]) R[q] = 1;
    }
  }
  return R;
}

function nearestFree(grid, m, x, z, minD) {
  const { nx, nz } = grid;
  const [ci, cj] = cellOf(grid, x, z);
  for (let r = 0; r < Math.round(0.6 / grid.cs); r++) {
    let best = -1, bd = Infinity;
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= nx || j >= nz) continue;
      const k = j * nx + i;
      if (m.free[k] && m.dist[k] >= minD && di * di + dj * dj < bd) { bd = di * di + dj * dj; best = k; }
    }
    if (best >= 0) return best;
  }
  return -1;
}

// plus petite largeur de passage autour d'un point (cellules au cœur du passage)
function minWidthAround(grid, m, x, z, r) {
  const { nx, nz, cs } = grid;
  const [ci, cj] = cellOf(grid, x, z), n = Math.ceil(r / cs);
  let w = Infinity;
  for (let dj = -n; dj <= n; dj++) for (let di = -n; di <= n; di++) {
    if ((di * di + dj * dj) * cs * cs > r * r) continue;
    const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= nx || j >= nz) continue;
    const k = j * nx + i;
    if (m.free[k] && m.reach[k] && m.dist[k] >= MIN_D_SQUEEZE && m.width[k] < w) w = m.width[k];
  }
  return Number.isFinite(w) ? w : NaN;
}

// A* 8-connexe : coût majoré près des obstacles (on marche au milieu des passages étroits)
function planPath(grid, m, from, to) {
  // passage normal, sinon on cherche la plus grande marge possible jusqu'à MIN_D_SQUEEZE
  let r = astar(grid, m, from, to, MIN_D);
  if (!r) {
    let lo = MIN_D_SQUEEZE, hi = MIN_D;
    if (!astar(grid, m, from, to, lo)) return null;
    for (let it = 0; it < 6; it++) { const mid = (lo + hi) / 2; if (astar(grid, m, from, to, mid)) lo = mid; else hi = mid; }
    r = astar(grid, m, from, to, lo);
  }
  return r;
}

function astar(grid, m, from, to, minD) {
  const { nx, nz, cs, bx0, bz0 } = grid;
  const s = nearestFree(grid, m, from[0], from[1], minD), g = nearestFree(grid, m, to[0], to[1], minD);
  if (s < 0 || g < 0) return null;
  const N = nx * nz, G = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const gi = g % nx, gj = (g - gi) / nx;
  const hfun = (k) => { const i = k % nx, j = (k - i) / nx; return Math.hypot(i - gi, j - gj) * cs; };
  const pen = (k) => { const d = m.dist[k]; const u = Math.min(1, Math.max(0, (0.45 - d) / 0.30)); return 1 + 3 * u * u; };
  const heap = new MinHeap();
  G[s] = 0; heap.push(s, hfun(s));
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  while (heap.size) {
    const k = heap.pop();
    if (closed[k]) continue;
    if (k === g) break;
    closed[k] = 1;
    const i = k % nx, j = (k - i) / nx;
    for (const [di, dj, c] of NB) {
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
      const q = jj * nx + ii;
      if (closed[q] || !m.free[q] || m.dist[q] < minD) continue;
      const ng = G[k] + c * cs * pen(q);
      if (ng < G[q]) { G[q] = ng; came[q] = k; heap.push(q, ng + hfun(q)); }
    }
  }
  if (!Number.isFinite(G[g])) return null;
  const cells = [];
  for (let k = g; k >= 0; k = came[k]) cells.push(k);
  cells.reverse();
  let pts = cells.map((k) => [bx0 + ((k % nx) + 0.5) * cs, bz0 + (Math.floor(k / nx) + 0.5) * cs]);
  pts[0] = [...from]; pts[pts.length - 1] = [...to];
  pts = resample(pts, 0.05);
  const d0 = pts.map((p) => C.sampleMap(grid, m, 'dist', p[0], p[1], 0.06));
  // lissage laplacien sous contrainte (on ne rapproche pas le trajet des obstacles)
  const dAt = (p) => C.sampleMap(grid, m, 'dist', p[0], p[1], 0.06);
  for (let it = 0; it < 40; it++) {
    for (let n = 1; n < pts.length - 1; n++) {
      const q = [(pts[n - 1][0] + pts[n + 1][0]) / 2, (pts[n - 1][1] + pts[n + 1][1]) / 2];
      const nv = [pts[n][0] + (q[0] - pts[n][0]) * 0.5, pts[n][1] + (q[1] - pts[n][1]) * 0.5];
      const d = dAt(nv);
      if (Number.isFinite(d) && d >= Math.min(d0[n], 0.40) * 0.92) pts[n] = nv;
    }
  }
  return pts;
}

class MinHeap {
  constructor() { this.k = []; this.p = []; }
  get size() { return this.k.length; }
  push(k, p) {
    const K = this.k, P = this.p; let i = K.length; K.push(k); P.push(p);
    while (i > 0) { const j = (i - 1) >> 1; if (P[j] <= p) break; K[i] = K[j]; P[i] = P[j]; i = j; }
    K[i] = k; P[i] = p;
  }
  pop() {
    const K = this.k, P = this.p, top = K[0], lk = K.pop(), lp = P.pop();
    if (K.length) {
      let i = 0; const n = K.length;
      for (;;) {
        let c = 2 * i + 1; if (c >= n) break;
        if (c + 1 < n && P[c + 1] < P[c]) c++;
        if (P[c] >= lp) break;
        K[i] = K[c]; P[i] = P[c]; i = c;
      }
      K[i] = lk; P[i] = lp;
    }
    return top;
  }
}

// rééchantillonnage d'une polyligne à pas constant
function resample(pts, step) {
  const out = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let s = step - carry;
    while (s <= L) { const f = s / L; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); s += step; }
    carry = L - (s - step);
  }
  const last = pts[pts.length - 1], o = out[out.length - 1];
  if (Math.hypot(last[0] - o[0], last[1] - o[1]) > step * 0.3) out.push(last); else out[out.length - 1] = last;
  return out;
}

// moyenne glissante (demi-fenêtre h échantillons)
function smooth1(arr, h) {
  const out = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - h); k <= Math.min(arr.length - 1, i + h); k++) if (Number.isFinite(arr[k])) { s += arr[k]; n++; }
    out[i] = n ? s / n : arr[i];
  }
  return out;
}

// lissage gaussien par tronçons continus (pas de mélange de part et d'autre d'une coupure)
function gaussSeg(arr, seg, sigma) {
  const n = arr.length, out = new Float32Array(n), r = Math.ceil(sigma * 2.5);
  const w = []; for (let k = -r; k <= r; k++) w.push(Math.exp(-(k * k) / (2 * sigma * sigma)));
  for (let i = 0; i < n; i++) {
    let s = 0, ws = 0;
    for (let k = -r; k <= r; k++) {
      const j = i + k; if (j < 0 || j >= n || seg[j] !== seg[i]) continue;
      s += arr[j] * w[k + r]; ws += w[k + r];
    }
    out[i] = s / ws;
  }
  return out;
}
