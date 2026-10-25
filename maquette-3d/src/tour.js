// Visite guidée automatique : la caméra se promène dans la maquette et ouvre les portes.
//
//   const tour = createTour({ THREE, app });
//   tour.seek(t)            // place caméra + portes à l'instant t (s) — déterministe (vidéo)
//   tour.play() / stop()    // lecture temps réel dans la visionneuse (via app.onFrame)
//   tour.duration, tour.fade(t) (0..1 : voile noir des transitions)
//
// Le parcours est une suite de stations (x, z, regard, pause). Entre deux stations la caméra suit
// une spline lissée à vitesse de marche ; la hauteur d'œil suit le sol (marches comprises).
import { STAIR, LV } from './spec.js';

const EYE = 1.62;          // hauteur d'œil
const SPEED = 0.95;        // vitesse de marche (m/s), un peu vive pour la vidéo
const DOOR_TIME = 1.4;     // durée d'ouverture d'une porte (s)

// ---------------------------------------------------------------------------
// Sol sous la caméra : extérieur, RDC, marches de l'escalier, étage
// ---------------------------------------------------------------------------
const TREADS = (() => {
  const n = STAIR.nosings, out = [];
  for (let k = 1; k < n.length; k++) {
    const a = n[k - 1], b = n[k];
    let poly = [a[0], a[1], b[1], b[0]];
    if (k === 13) poly = [a[0], a[1], b[1], b[0], STAIR.outerCorner];
    out.push({ k, poly });
  }
  return out;
})();
function inPoly([x, z], poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
export function floorAt(x, z, level) {
  if (level === 'ext') return LV.ground;
  if (level === 'etage') return LV.slabTop;
  if (level === 'stair') {
    // élargit un peu les marches vers les limons pour la ligne de foulée
    const p = [x, Math.min(Math.max(z, 0.38), 1.28)];
    for (const t of TREADS) if (inPoly(p, t.poly)) return t.k * STAIR.rise;
    if (x > 7.30) return 0;
    if (z >= 1.29 || x < 3.25) return LV.slabTop;
    return 0;
  }
  return LV.rdc;
}

// ---------------------------------------------------------------------------
// Parcours : stations [x, z], niveau, point regardé [x, y, z], pause (s)
//   door : porte ouverte en arrivant à la station (début lead s avant l'arrivée)
//   cut  : fondu au noir avant cette station (saut de la SdB au pied de l'escalier)
// ---------------------------------------------------------------------------
export const STATIONS = [
  { p: [8.35, -5.2], level: 'ext', look: [7.75, 1.25, 0.0], hold: 1.0 },
  { p: [7.75, -1.45], level: 'ext', look: [7.75, 1.30, 0.5], hold: 0.3, door: { id: 'porte-entree', lead: 1.5 } },
  { p: [7.75, 0.62], level: 'rdc', look: [5.4, 1.85, 0.9], hold: 1.3, inside: true },
  { p: [7.55, 1.72], level: 'rdc', look: [4.0, 1.20, 1.55], hold: 0.4 },
  { p: [5.90, 1.72], level: 'rdc', look: [4.0, 1.25, 1.35], hold: 0.3, door: { id: 'porte-wc', lead: 1.6 } },
  // dans le WC : il faut entrer jusqu'à la cuvette pour voir l'alcôve derrière la cloison WC / escalier
  { p: [4.08, 1.64], level: 'rdc', look: [3.60, 1.45, 0.50], hold: 1.8 },
  { p: [4.02, 1.66], level: 'rdc', look: [3.75, 2.25, 0.75], hold: 1.6 },
  { p: [5.75, 1.82], level: 'rdc', look: [6.6, 1.25, 3.2], hold: 0.1 },
  { p: [6.50, 1.95], level: 'rdc', look: [5.6, 1.15, 3.8], hold: 0.3, door: { id: 'porte-chambre', lead: 1.4 } },
  { p: [6.45, 3.05], level: 'rdc', look: [4.8, 0.95, 3.2], hold: 1.1 },
  { p: [6.05, 4.45], level: 'rdc', look: [2.6, 1.20, 3.9], hold: 0.8 },
  { p: [3.60, 4.60], level: 'rdc', look: [1.2, 1.30, 3.6], hold: 1.3, door: { id: 'galandage-dressing', lead: 1.2 } },
  { p: [3.60, 2.95], level: 'rdc', look: [1.6, 1.20, 1.2], hold: 0.8, door: { id: 'coulissante-sdb', lead: 1.3 } },
  { p: [2.72, 2.12], level: 'rdc', look: [0.9, 1.25, 0.9], hold: 1.5 },
  { p: [7.62, 0.80], level: 'stair', look: [5.2, 1.90, 0.8], hold: 0.9, cut: true },
  { p: [6.40, 0.80], level: 'stair', look: [4.4, 2.40, 0.8], hold: 0 },
  { p: [5.20, 0.82], level: 'stair', look: [3.7, 3.10, 1.0], hold: 0 },
  { p: [4.38, 0.92], level: 'stair', look: [3.6, 3.70, 1.6], hold: 0 },
  { p: [3.78, 1.20], level: 'stair', look: [3.65, 4.10, 2.4], hold: 0 },
  { p: [3.65, 1.78], level: 'etage', look: [3.65, 5.30, 2.05], hold: 1.3 },
  { p: [3.65, 2.35], level: 'etage', look: [2.0, 3.60, 2.6], hold: 0.2, door: { id: 'porte-ch1', lead: 1.2 } },
  { p: [2.85, 2.58], level: 'etage', look: [1.4, 3.35, 1.0], hold: 1.1 },
  { p: [1.95, 2.66], level: 'etage', look: [1.6, 3.60, 5.0], hold: 1.1 },
  // chambre 2 : le vantail ouvert à 90° touche presque le lit 180 ; on l'ouvre en grand (~170°) pour passer
  { p: [3.65, 2.62], level: 'etage', look: [5.5, 3.60, 2.6], hold: 0.2, door: { id: 'porte-ch2', lead: 1.6, to: 170 / 90 } },
  { p: [4.62, 2.62], level: 'etage', look: [6.0, 3.35, 2.1], hold: 0.8 },
  { p: [4.80, 3.80], level: 'etage', look: [5.9, 3.40, 2.0], hold: 1.0 },
  { p: [5.00, 3.88], level: 'etage', look: [5.7, 3.65, 6.8], hold: 2.0 },
];

// ---------------------------------------------------------------------------
export function createTour({ THREE, app }) {
  const V3 = (a) => new THREE.Vector3(...a);
  // --- portes animables (joinery.js : userData.door)
  const doors = new Map();
  app.model.traverse((o) => { if (o.userData.door) doors.set(o.userData.door.id, o); });
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  function setDoor(id, t) {
    const o = doors.get(id); if (!o) return;
    const d = o.userData.door;
    const v = d.closed + (d.open - d.closed) * t;
    if (d.kind === 'hinge') o.rotation.y = v;
    else o.position.set(d.dir[0] * v, 0, d.dir[1] * v);
  }
  function resetDoors() {
    for (const o of doors.values()) {
      const d = o.userData.door;
      if (d.kind === 'hinge') o.rotation.y = d.default;
      else o.position.set(d.dir[0] * d.default, 0, d.dir[1] * d.default);
    }
  }

  // --- échantillonnage de la trajectoire par segments (spline Catmull-Rom centripète en plan)
  const P = STATIONS.map((s) => new THREE.Vector3(s.p[0], 0, s.p[1]));
  const segments = [];       // { i, len, samples:[{s, x, z, y}] }
  let t = 0;
  const timeline = [];       // par station : { tArrive, tLeave }
  for (let i = 0; i < STATIONS.length; i++) {
    const st = STATIONS[i];
    if (i > 0 && !st.cut) {
      // points de contrôle voisins (reflétés en début/fin de parcours et autour des coupures)
      const A = P[i - 1], B = P[i];
      const p0 = i >= 2 && !STATIONS[i - 1].cut ? P[i - 2] : A.clone().multiplyScalar(2).sub(B);
      const p3 = i + 1 < P.length && !STATIONS[i + 1].cut ? P[i + 1] : B.clone().multiplyScalar(2).sub(A);
      const curve = new THREE.CatmullRomCurve3([p0, A, B, p3], false, 'centripetal', 0.5);
      // la portion A -> B correspond à t ∈ [1/3, 2/3] (4 points de contrôle)
      const span = [];
      for (let j = 0; j <= 160; j++) span.push(curve.getPoint(1 / 3 + j / 480));
      let len = 0;
      const samples = [];
      const lvl = (k) => STATIONS[k].level;
      for (let j = 0; j < span.length; j++) {
        if (j > 0) len += span[j].distanceTo(span[j - 1]);
        const f = j / Math.max(1, span.length - 1);
        // niveau : escalier si l'une des extrémités est sur l'escalier
        const level = lvl(i - 1) === 'stair' || lvl(i) === 'stair' ? 'stair' : (f < 0.5 ? lvl(i - 1) : lvl(i));
        samples.push({ s: len, x: span[j].x, z: span[j].z, y: floorAt(span[j].x, span[j].z, level) });
      }
      smoothHeights(samples, 0.32);
      const dur = Math.max(0.6, len / SPEED);
      segments.push({ i, len, dur, samples, t0: t });
      t += dur;
    } else if (st.cut) {
      t += 0.9;                 // fondu au noir (0,45 s descente + 0,45 s montée)
    }
    timeline.push({ tArrive: t, tLeave: t + st.hold });
    t += st.hold;
  }
  const duration = t + 0.6;

  // actions de portes (temps absolus)
  const doorActions = STATIONS.map((st, i) => (st.door ? { id: st.door.id, to: st.door.to ?? 1, t0: timeline[i].tArrive - st.door.lead, t1: timeline[i].tArrive - st.door.lead + DOOR_TIME } : null)).filter(Boolean);
  // fondus
  const cuts = STATIONS.map((st, i) => (st.cut ? timeline[i].tArrive - 0.45 : null)).filter((v) => v != null);
  function fade(time) {
    let a = 0;
    a = Math.max(a, 1 - Math.min(1, time / 0.6));                       // ouverture au noir
    a = Math.max(a, Math.min(1, Math.max(0, (time - (duration - 0.6)) / 0.6)));  // fin
    for (const c of cuts) a = Math.max(a, 1 - Math.min(1, Math.abs(time - c) / 0.45));
    return a;
  }

  // --- position / regard à l'instant t
  const eyeOf = (i) => { const st = STATIONS[i]; return [st.p[0], floorAt(st.p[0], st.p[1], st.level) + EYE, st.p[1]]; };
  function stateAt(time) {
    // station courante ou segment courant
    for (let i = 0; i < STATIONS.length; i++) {
      const tl = timeline[i];
      if (time <= tl.tLeave || i === STATIONS.length - 1) {
        const seg = segments.find((sg) => sg.i === i);
        if (seg && time < tl.tArrive) {
          const u = Math.max(0, (time - seg.t0) / seg.dur);
          const k = easeInOut(u);
          const sm = sampleAt(seg.samples, k * seg.len);
          // regard : du point regardé à la station précédente vers celui de la station i
          const lookA = V3(STATIONS[i - 1].look), lookB = V3(STATIONS[i].look);
          return { pos: [sm.x, sm.y + EYE, sm.z], look: lookA.lerp(lookB, ease(Math.min(1, u * 1.15))).toArray(), i, inside: insideAt(i) };
        }
        if (time < tl.tArrive) {           // dans un fondu (coupure) : on reste sur la station précédente
          return { pos: eyeOf(i - 1), look: STATIONS[i - 1].look, i: i - 1, inside: insideAt(i - 1) };
        }
        return { pos: eyeOf(i), look: STATIONS[i].look, i, inside: insideAt(i) };
      }
    }
    return { pos: eyeOf(STATIONS.length - 1), look: STATIONS.at(-1).look, i: STATIONS.length - 1, inside: true };
  }
  function insideAt(i) { for (let k = i; k >= 0; k--) if (STATIONS[k].inside) return true; return false; }

  let lastInside = null;
  function seek(time) {
    const s = stateAt(time);
    if (s.inside !== lastInside) {
      app.setView(s.inside ? 'tour-int' : 'tour-ext', { animate: false });
      lastInside = s.inside;
    }
    // portes : fermées au départ, ouvertes au passage
    for (const id of doors.keys()) setDoor(id, 0);
    for (const a of doorActions) setDoor(a.id, a.to * ease((time - a.t0) / (a.t1 - a.t0)));
    app.camera.position.set(...s.pos);
    app.camera.lookAt(...s.look);
    app.camera.updateMatrixWorld();
    app.requestRender?.();
    return s;
  }

  // --- lecture temps réel (visionneuse)
  let playing = false, clock = 0, off = null, onEnd = null;
  function play({ from = 0, ended } = {}) {
    stop();
    playing = true; clock = from; onEnd = ended || null;
    lastInside = null;
    app.setControlsEnabled?.(false);
    seek(clock);
    off = app.onFrame((dt) => {
      if (!playing) return;
      clock += Math.min(dt, 0.1);
      seek(Math.min(clock, duration));
      if (clock >= duration) { const cb = onEnd; stop(); cb?.(); }
    });
  }
  function stop() {
    if (off) { off(); off = null; }
    if (playing) { playing = false; resetDoors(); lastInside = null; app.setControlsEnabled?.(true); app.requestRender?.(); }
  }

  return {
    duration, seek, play, stop, fade, resetDoors, setDoor,
    get playing() { return playing; }, get time() { return clock; },
    stations: STATIONS, timeline, doorActions,
  };
}

// ---------------------------------------------------------------------------
function sampleAt(samples, s) {
  if (s <= 0) return samples[0];
  for (let j = 1; j < samples.length; j++) {
    if (samples[j].s >= s) {
      const a = samples[j - 1], b = samples[j], f = (s - a.s) / Math.max(1e-6, b.s - a.s);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f };
    }
  }
  return samples.at(-1);
}
// moyenne glissante de la hauteur de sol sur une fenêtre (m) : montée régulière dans l'escalier
function smoothHeights(samples, win) {
  const ys = samples.map((p) => p.y);
  for (let j = 0; j < samples.length; j++) {
    let sum = 0, n = 0;
    for (let k = 0; k < samples.length; k++) {
      if (Math.abs(samples[k].s - samples[j].s) <= win / 2) { sum += ys[k]; n++; }
    }
    samples[j].y = sum / n;
  }
}
const easeInOut = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
