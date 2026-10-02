/* Grotte de sel — visionneuse 3D, contrôles des dégagements et simulation de circulation. */
(function () {
  'use strict';
  const M = window.SKP_MODEL, L = window.LAYOUT;
  const OX = 9000, OY = 4000, OZ = 2570; // origine scène (mm) : centre du plan, sol bas
  const P = (x, y, z) => new THREE.Vector3((x - OX) / 1000, (z - OZ) / 1000, -(y - OY) / 1000);
  const toPlan = (v) => ({ x: v.x * 1000 + OX, y: -v.z * 1000 + OY });
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------------ scène
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  $('view').appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x14161a);
  const persp = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
  const ortho = new THREE.OrthographicCamera(-8, 8, 4, -4, 0.1, 100);
  let camera = persp;
  const controls = new THREE.OrbitControls(persp, renderer.domElement);
  controls.enableDamping = true; controls.target.set(0, 0.5, 0);
  persp.position.set(-3, 11, 9);

  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x3a332c, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(-6, 14, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 6, bottom: -6, far: 40 }); scene.add(sun);

  // ------------------------------------------------------------------ matériaux
  const TX = TEXTURES.build();
  const std = (map, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }, o));
  Object.values(TX).forEach((t) => { t.encoding = THREE.sRGBEncoding; });
  const MAT = {
    stone: std(TX.stone), brick: std(TX.brick), tile: std(TX.tiles, { roughness: 0.7 }), screed: std(TX.screed), step: std(TX.step),
    plaster: std(TX.plaster), wood: std(TX.wood), saltCrust: std(TX.saltCrust),
    salt: std(TX.saltBricks, { emissive: 0xffffff, emissiveMap: TX.saltBricks, emissiveIntensity: 0.85, roughness: 0.6 }),
    log: std(TX.cedar, { side: THREE.FrontSide }), slat: std(TX.cedar, { side: THREE.FrontSide }),
    irBody: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide }),
    irGlow: new THREE.MeshStandardMaterial({ color: 0x331100, emissive: 0xff3a00, emissiveIntensity: 0.0, wireframe: true }),
    rail: new THREE.MeshStandardMaterial({ color: 0xd8dadc, metalness: 0.9, roughness: 0.25 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe3ea, transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide }),
  };
  FURNITURE.init(MAT);

  // ------------------------------------------------------------------ géométrie SketchUp
  const V = M.vertices; // mm
  function newell(loop) {
    const n = [0, 0, 0];
    for (let i = 0; i < loop.length; i++) {
      const a = V[loop[i]], b = V[loop[(i + 1) % loop.length]];
      n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    const l = Math.hypot(...n) || 1; return n.map((c) => c / l);
  }
  const ell = (x, y) => Math.hypot((x - 10191) / 4900, (y - 1842) / 4400);

  // Classement des faces -> matériau (zones repérées sur le modèle)
  function classify(c, n) {
    if (Math.abs(n[2]) > 0.9) {
      const z = c[2];
      if (z >= 4300) return 'plaster';
      if (c[0] > 8280 && c[0] < 9900 && c[1] > 3530 && c[1] < 4280 && z > 2560) return 'step';
      if (z >= 2860) return 'tile';
      if (z >= 2700) return 'step';
      return 'screed';
    }
    if (Math.hypot(c[0] - 10491, c[1] - 2196) < 470) return 'stone'; // pilier
    const e = ell(c[0], c[1]);
    if (c[0] > 10250 && c[1] > 1900 && e > 0.96 && e < 1.07) return e < 1.016 ? 'salt:courbe' : 'plaster';
    if (c[0] > 10700 && c[1] > 1680 && c[1] < 1850 && c[2] < 4400) return Math.abs(c[1] - 1842) < 3 ? 'salt:sud' : 'plaster';
    if (c[0] > 10040 && c[0] < 10320 && c[1] > 1840 && c[2] < 4400) return Math.abs(c[0] - 10311) < 3 ? 'salt:facade' : 'plaster';
    if (c[0] > 7980 && c[0] < 8500 && c[2] > 4000) return 'wood';
    if (c[0] > 8280 && c[0] < 9880 && c[1] > 3530 && c[1] < 4280 && c[2] < 2880) return 'step';
    return 'stone';
  }

  const buckets = {}; const floorFaces = []; const wallTris = []; const wallTops = []; const saltFaces = { courbe: [], sud: [], facade: [] };
  M.faces.forEach((f) => {
    const loop = f.loops[0]; const n = newell(loop);
    const pts = loop.map((i) => V[i]);
    const c = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length);
    let cls = classify(c, n);
    if (cls.startsWith('salt:')) { const w = cls.slice(5); saltFaces[w].push(pts); cls = L.mursSel.includes(w) ? 'salt' : 'plaster'; }
    // repère 2D du plan de la face
    const nz = new THREE.Vector3(...n);
    const u = Math.abs(n[2]) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-n[1], n[0], 0).normalize();
    const v = new THREE.Vector3().crossVectors(nz, u);
    const flatH = Math.abs(n[2]) > 0.9;
    const c2 = pts.map((p) => new THREE.Vector2(p[0] * u.x + p[1] * u.y + p[2] * u.z, p[0] * v.x + p[1] * v.y + p[2] * v.z));
    let tris; try { tris = THREE.ShapeUtils.triangulateShape(c2, []); } catch (e) { return; }
    const b = buckets[cls] || (buckets[cls] = { pos: [], uv: [] });
    tris.forEach((t) => t.forEach((k) => {
      const p = pts[k]; const w = P(...p); b.pos.push(w.x, w.y, w.z);
      if (flatH) b.uv.push(p[0] / 1000, p[1] / 1000);
      else b.uv.push((p[0] * u.x + p[1] * u.y) / 1000, p[2] / 1000);
    }));
    if (flatH && c[2] <= 2900) floorFaces.push({ z: c[2], poly: pts.map((p) => [p[0], p[1]]) });
    else if (flatH && c[2] >= 4300) wallTops.push(pts.map((p) => [p[0], p[1]]));
    else if (!flatH) tris.forEach((t) => wallTris.push(t.map((k) => pts[k])));
  });

  const modelGroup = new THREE.Group(); scene.add(modelGroup);
  for (const [cls, b] of Object.entries(buckets)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    const m = MAT[cls]; const s = (m.map && m.map.userData.meters) || 1;
    g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv.map((x) => x / s), 2));
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.castShadow = cls !== 'salt'; mesh.userData.cls = cls; modelGroup.add(mesh);
  }
  // arêtes du modèle
  const ePos = []; M.edges.forEach(([a, b]) => { const pa = P(...V[a]), pb = P(...V[b]); ePos.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z); });
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(ePos, 3));
  const edgeLines = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.35 }));
  scene.add(edgeLines);

  // ------------------------------------------------------------------ voûtes / plafonds (hypothèses LAYOUT.voutes)
  const ceilings = new THREE.Group(); scene.add(ceilings);
  function vaultZ(vt, y) { const yc = (vt.y0 + vt.y1) / 2, a = (vt.y1 - vt.y0) / 2; const t = Math.min(1, Math.abs(y - yc) / a); return vt.naissance + (vt.cle - vt.naissance) * Math.sqrt(1 - t * t); }
  function vault(vt, mat, metersU) {
    const nx = 24, ny = 40, pos = [], uv = [], idx = [];
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const x = vt.x0 + (vt.x1 - vt.x0) * i / nx, y = vt.y0 + (vt.y1 - vt.y0) * j / ny, z = vaultZ(vt, y);
      const p = P(x, y, z); pos.push(p.x, p.y, p.z); uv.push(x / 1000 / metersU, j * (vt.y1 - vt.y0) * 1.3 / ny / 1000 / metersU);
    }
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const a = i * (ny + 1) + j, b = a + ny + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setIndex(idx);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; ceilings.add(m);
  }
  vault(L.voutes.salleA, MAT.brick, TX.brick.userData.meters);
  vault(L.voutes.grotte, MAT.saltCrust, TX.saltCrust.userData.meters);
  { const c = L.voutes.liaison; const w = (c.x1 - c.x0) / 1000, d = (c.y1 - c.y0) / 1000;
    const g = new THREE.PlaneGeometry(w, d); const m = new THREE.Mesh(g, MAT.wood); m.rotation.x = Math.PI / 2;
    m.position.copy(P((c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, c.z)); ceilings.add(m);
    for (let x = c.x0 + 300; x < c.x1; x += 600) { const j = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, d), MAT.wood); j.position.copy(P(x, (c.y0 + c.y1) / 2, c.z - 80)); ceilings.add(j); } }
  function ceilingAt(x, y) {
    for (const k of ['salleA', 'grotte']) { const v = L.voutes[k]; if (x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1) return vaultZ(v, y); }
    const c = L.voutes.liaison; if (x >= c.x0 && x <= c.x1 && y >= c.y0 && y <= c.y1) return c.z;
    return NaN;
  }

  // ------------------------------------------------------------------ grille d'analyse (10 cm)
  const CELL = 100, GX0 = 2850, GY0 = 0, NX = 126, NY = 66;
  const idx = (i, j) => j * NX + i;
  const cellX = (i) => GX0 + (i + 0.5) * CELL, cellY = (j) => GY0 + (j + 0.5) * CELL;
  const toCell = (x, y) => [Math.floor((x - GX0) / CELL), Math.floor((y - GY0) / CELL)];
  function pip(pt, poly) { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ins = !ins; } return ins; }
  const floorH = new Float32Array(NX * NY).fill(NaN), wall = new Uint8Array(NX * NY), furn = new Uint8Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const p = [cellX(i), cellY(j)]; let h = NaN;
    for (const f of floorFaces) if ((isNaN(h) || f.z > h) && pip(p, f.poly)) h = f.z;
    floorH[idx(i, j)] = h;
    for (const t of wallTops) if (pip(p, t)) { wall[idx(i, j)] = 1; break; }
  }
  // faces verticales -> obstacles dans la bande 0,15–1,80 m au-dessus du sol local
  for (const t of wallTris) {
    const zmin = Math.min(...t.map((p) => p[2])), zmax = Math.max(...t.map((p) => p[2]));
    for (let k = 0; k < 3; k++) {
      const a = t[k], b = t[(k + 1) % 3], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 40) + 1;
      for (let s = 0; s <= n; s++) {
        const x = a[0] + (b[0] - a[0]) * s / n, y = a[1] + (b[1] - a[1]) * s / n; const [i, j] = toCell(x, y);
        if (i < 0 || j < 0 || i >= NX || j >= NY) continue; const h = floorH[idx(i, j)];
        if (isNaN(h)) continue; if (zmax > h + 180 && zmin < h + 1800) wall[idx(i, j)] = 1; // > 18 cm : plus une marche
      }
    }
  }

  // ------------------------------------------------------------------ portes
  const doors = [];
  L.portes.forEach((d) => {
    const [ci, cj] = toCell(d.x, d.y); const h = floorH[idx(ci, cj)] || 2870;
    const root = new THREE.Group(); root.position.copy(P(d.x, d.y, h)); scene.add(root);
    const W = d.largeur / 1000, n = d.vantaux, lw = W / n, H = 2.1;
    const leaves = [];
    for (let k = 0; k < n; k++) {
      const pivot = new THREE.Group(); const side = n === 1 ? -1 : (k === 0 ? -1 : 1);
      // pivot sur le montant ; le vantail s'étend vers le centre
      const along = d.axe === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, -1);
      pivot.position.copy(along.clone().multiplyScalar(side * W / 2));
      const leaf = new THREE.Group();
      const frameM = new THREE.MeshStandardMaterial({ color: d.couleur, metalness: 0.5, roughness: 0.4 });
      const fr = (w, h2, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h2, 0.05), frameM); m.position.set(x, y, 0); leaf.add(m); };
      fr(0.06, H, 0.03, H / 2); fr(0.06, H, lw - 0.03, H / 2); fr(lw, 0.06, lw / 2, 0.03); fr(lw, 0.08, lw / 2, H - 0.04); fr(lw, 0.05, lw / 2, 1.05);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(lw - 0.1, H - 0.12), MAT.glass); gl.position.set(lw / 2, H / 2, 0); leaf.add(gl);
      leaf.scale.x = -side; // s'étend vers le centre
      if (d.axe === 'y') leaf.rotation.y = Math.PI / 2 * 1;
      pivot.add(leaf); root.add(pivot);
      leaves.push({ pivot, side });
    }
    doors.push({ cfg: d, root, leaves, open: 0, target: 0, h });
  });
  function updateDoors(dt) {
    doors.forEach((d) => {
      d.open += Math.sign(d.target - d.open) * Math.min(Math.abs(d.target - d.open), dt * 1.6);
      d.leaves.forEach(({ pivot, side }) => {
        // rotation autour de la verticale : sens donné par 'ouvre' (+1/-1 vers +perp)
        const a = d.open * Math.PI / 2 * d.cfg.ouvre;
        pivot.rotation.y = d.cfg.axe === 'x' ? side * a : -side * a;
      });
    });
  }

  // ------------------------------------------------------------------ mobilier
  const furnGroup = new THREE.Group(); scene.add(furnGroup);
  const items = []; const seats = [];
  function floorAt(x, y) { const [i, j] = toCell(x, y); const h = floorH[idx(Math.max(0, Math.min(NX - 1, i)), Math.max(0, Math.min(NY - 1, j)))]; return isNaN(h) ? 2570 : h; }
  L.mobilier.forEach((f, k) => {
    const T = FURNITURE.TYPES[f.type]; const g = FURNITURE.build(f.type);
    const h = floorAt(f.x, f.y); g.position.copy(P(f.x, f.y, h)); g.rotation.y = f.rot * Math.PI / 180;
    g.userData = { info: f.nom + ' — ' + Math.round(T.L * 100) + ' × ' + Math.round(T.P * 100) + ' × ' + Math.round(T.H * 100) + ' cm', kind: 'meuble' };
    furnGroup.add(g);
    const a = f.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    // local (x, z) [m] -> plan (mm) : avant (+z local) = direction -Y plan tournée de rot
    const loc2plan = (lx, lz) => ({ x: f.x + 1000 * (lx * ca + lz * sa), y: f.y + 1000 * (lx * sa - lz * ca) });
    const corners = [[-T.L / 2, -T.P / 2], [T.L / 2, -T.P / 2], [T.L / 2, T.P / 2], [-T.L / 2, T.P / 2]].map(([x, z]) => loc2plan(x, z));
    const poly = corners.map((c) => [c.x, c.y]);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) if (pip([cellX(i), cellY(j)], poly)) furn[idx(i, j)] = 1;
    const it = { cfg: f, T, g, poly, h, k, zone: f.x > 10311 ? 'grotte' : 'salle' }; items.push(it);
    T.seats.forEach((s, si) => { const p = loc2plan(s.x, s.z), ap = loc2plan(T.approach[si].x, T.approach[si].z); seats.push({ item: it, x: p.x, y: p.y, pose: s.pose, rot: f.rot, approach: ap, zone: it.zone, taken: false }); });
  });

  // ------------------------------------------------------------------ rampes (mains courantes)
  const railGroup = new THREE.Group(); scene.add(railGroup);
  const stairProfile = (x) => (x < 9066 ? 2870 : x < 9336 ? 2720 : 2570); // nez de marches relevés sur le modèle
  L.rampes.forEach((r) => {
    const pts = []; for (let x = r.x0; x <= r.x1; x += 50) pts.push(P(x, r.y, Math.max(stairProfile(Math.min(x, 9336)), stairProfile(x)) + 900));
    // lissage de la rampe sur la ligne des nez
    const nose = (x) => (x <= 9066 ? 2870 : x >= 9336 ? 2570 : 2870 - (x - 9066) / 270 * 300);
    const curve = new THREE.CatmullRomCurve3(pts.map((p, i) => { const x = r.x0 + i * 50; return P(x, r.y, nose(x) + 900); }));
    railGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.02, 10), MAT.rail));
    for (let x = r.x0 + 100; x <= r.x1; x += 600) { const a = P(x, r.y, stairProfile(x)), b = P(x, r.y, nose(x) + 900); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, b.y - a.y, 8), MAT.rail); m.position.set(a.x, (a.y + b.y) / 2, a.z); railGroup.add(m); }
  });

  // ------------------------------------------------------------------ murs de sel : éclairage
  const saltLights = new THREE.Group(); scene.add(saltLights);
  L.mursSel.forEach((w) => {
    const fs = saltFaces[w]; if (!fs.length) return;
    const all = fs.flat(); const cx = all.reduce((s, p) => s + p[0], 0) / all.length, cy = all.reduce((s, p) => s + p[1], 0) / all.length;
    const toward = new THREE.Vector2(11800 - cx, 3500 - cy).normalize();
    const l = new THREE.PointLight(0xff9a50, 1.6, 6, 2); l.position.copy(P(cx + toward.x * 600, cy + toward.y * 600, 3500)); saltLights.add(l);
  });

  // ------------------------------------------------------------------ radiants IR + volumes de sécurité
  const irGroup = new THREE.Group(); scene.add(irGroup); const irs = [];
  L.ir.forEach((c) => {
    const ceil = ceilingAt(c.x, c.y); const fl = floorAt(c.x, c.y);
    const top = (isNaN(ceil) ? 5070 : ceil) - c.chaine; const bottom = top - 240;
    const g = FURNITURE.ir(MAT); g.position.copy(P(c.x, c.y, bottom)); irGroup.add(g);
    const chainLen = c.chaine / 1000; const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, chainLen, 4), MAT.rail);
    ch.position.copy(P(c.x, c.y, top + c.chaine / 2)); irGroup.add(ch);
    const vol = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.8, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x33cc66, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
    vol.position.copy(P(c.x, c.y, bottom - 900)); irGroup.add(vol);
    const light = new THREE.PointLight(0xff5a1e, 0, 3.5, 2); light.position.copy(P(c.x, c.y, bottom - 100)); irGroup.add(light);
    g.userData = { info: c.nom + ' — Trotec IR 1500 SC Ø42 × h24 cm, 1500 W', kind: 'ir' };
    irs.push({ cfg: c, g, vol, light, ceil, fl, top, bottom });
  });

  // ------------------------------------------------------------------ champ de distance (dégagements)
  const blockedStatic = (k) => wall[k] || isNaN(floorH[k]);
  const dist = new Float32Array(NX * NY);
  function computeDist() {
    const INF = 1e9;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const k = idx(i, j); let seed = blockedStatic(k) || furn[k];
      if (!seed) for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NX || b >= NY) { seed = 1; break; } const h2 = floorH[idx(a, b)]; if (isNaN(h2) || Math.abs(h2 - floorH[k]) > 160) { seed = 1; break; } }
      dist[k] = seed ? 0 : INF;
    }
    const D = CELL, DD = CELL * Math.SQRT2;
    for (let pass = 0; pass < 2; pass++) {
      const fw = pass === 0;
      for (let jj = 0; jj < NY; jj++) for (let ii = 0; ii < NX; ii++) {
        const i = fw ? ii : NX - 1 - ii, j = fw ? jj : NY - 1 - jj, k = idx(i, j); if (dist[k] === 0) continue;
        const nb = fw ? [[-1, 0, D], [0, -1, D], [-1, -1, DD], [1, -1, DD]] : [[1, 0, D], [0, 1, D], [1, 1, DD], [-1, 1, DD]];
        for (const [di, dj, w] of nb) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NX || b >= NY) continue; const v = dist[idx(a, b)] + w; if (v < dist[k]) dist[k] = v; }
      }
    }
  }
  computeDist();
  // largeur de passage en un point = diamètre du plus grand cercle libre qui contient ce point (résolution 10 cm)
  const wmap = new Float32Array(NX * NY);
  for (let k = 0; k < NX * NY; k++) {
    const d = dist[k]; if (d <= 0) continue; const w = 2 * d - CELL, r = Math.floor(d / CELL), ci = k % NX, cj = Math.floor(k / NX);
    for (let j = Math.max(0, cj - r); j <= Math.min(NY - 1, cj + r); j++) for (let i = Math.max(0, ci - r); i <= Math.min(NX - 1, ci + r); i++) {
      if ((i - ci) ** 2 + (j - cj) ** 2 > r * r) continue; const n = idx(i, j); if (wmap[n] < w) wmap[n] = w;
    }
  }
  const widthAt = (k) => Math.max(0, wmap[k]);

  // carte couleur des dégagements
  const clearGroup = new THREE.Group(); scene.add(clearGroup);
  {
    const geo = new THREE.PlaneGeometry(CELL / 1000 * 0.96, CELL / 1000 * 0.96); geo.rotateX(-Math.PI / 2);
    const cells = []; for (let k = 0; k < NX * NY; k++) if (!isNaN(floorH[k]) && !blockedStatic(k) && !furn[k]) cells.push(k);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.7, depthWrite: false }), cells.length);
    const mtx = new THREE.Matrix4(), col = new THREE.Color();
    cells.forEach((k, n) => {
      const i = k % NX, j = Math.floor(k / NX); mtx.setPosition(P(cellX(i), cellY(j), floorH[k] + 15)); mesh.setMatrixAt(n, mtx);
      const w = widthAt(k); col.set(w < 900 ? 0xe03131 : w < 1400 ? 0xf59f00 : 0x2f9e44); mesh.setColorAt(n, col);
    });
    clearGroup.add(mesh); clearGroup.visible = false;
  }

  // ------------------------------------------------------------------ A* + lissage
  const RBODY = 230; // demi-largeur d'épaule (mm)
  const passable = (k) => !isNaN(floorH[k]) && !blockedStatic(k) && !furn[k] && dist[k] >= RBODY;
  function nearestPassable(x, y) {
    const [ci, cj] = toCell(x, y); let best = null, bd = 1e9;
    for (let r = 0; r < 25 && !best; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
      if (i < 0 || j < 0 || i >= NX || j >= NY) continue; const k = idx(i, j); if (!passable(k)) continue;
      const d = Math.hypot(cellX(i) - x, cellY(j) - y); if (d < bd) { bd = d; best = [i, j]; }
    }
    return best;
  }
  function astar(x0, y0, x1, y1) {
    const s = nearestPassable(x0, y0), t = nearestPassable(x1, y1); if (!s || !t) return null;
    const S = idx(...s), Tt = idx(...t); const g = new Float32Array(NX * NY).fill(Infinity), from = new Int32Array(NX * NY).fill(-1), closed = new Uint8Array(NX * NY);
    const open = [[0, S]]; g[S] = 0; const H = (k) => Math.hypot((k % NX) - t[0], Math.floor(k / NX) - t[1]) * CELL;
    while (open.length) {
      let bi = 0; for (let q = 1; q < open.length; q++) if (open[q][0] < open[bi][0]) bi = q;
      const [, k] = open.splice(bi, 1)[0]; if (closed[k]) continue; closed[k] = 1; if (k === Tt) break;
      const i = k % NX, j = Math.floor(k / NX);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NX || b >= NY) continue;
        const n = idx(a, b); if (closed[n] || !passable(n) || Math.abs(floorH[n] - floorH[k]) > 160) continue;
        if (di && dj && (!passable(idx(i + di, j)) || !passable(idx(i, j + dj)))) continue;
        const pen = dist[n] < 500 ? (500 - dist[n]) / 500 * 1.5 : 0;
        const ng = g[k] + (di && dj ? CELL * Math.SQRT2 : CELL) * (1 + pen);
        if (ng < g[n]) { g[n] = ng; from[n] = k; open.push([ng + H(n), n]); }
      }
    }
    if (from[Tt] < 0 && S !== Tt) return null;
    const path = []; for (let k = Tt; k >= 0; k = from[k]) { path.push(k); if (k === S) break; }
    path.reverse(); return path;
  }
  function los(a, b) {
    const ia = a % NX, ja = Math.floor(a / NX), ib = b % NX, jb = Math.floor(b / NX); const n = Math.max(Math.abs(ib - ia), Math.abs(jb - ja)) * 2;
    let prev = a;
    for (let s = 1; s <= n; s++) { const i = Math.round(ia + (ib - ia) * s / n), j = Math.round(ja + (jb - ja) * s / n), k = idx(i, j); if (!passable(k) || Math.abs(floorH[k] - floorH[prev]) > 160) return false; prev = k; }
    return true;
  }
  function route(x0, y0, x1, y1) {
    const p = astar(x0, y0, x1, y1); if (!p) return null;
    const out = [p[0]]; let cur = 0;
    while (cur < p.length - 1) { let nxt = p.length - 1; while (nxt > cur + 1 && !los(p[cur], p[nxt])) nxt--; out.push(p[nxt]); cur = nxt; }
    const pts = out.map((k) => ({ x: cellX(k % NX), y: cellY(Math.floor(k / NX)) }));
    pts.push({ x: x1, y: y1 }); pts.raw = p; return pts;
  }

  // ------------------------------------------------------------------ contrôles
  const checks = [];
  const add = (cat, titre, statut, valeur, ref, note) => checks.push({ cat, titre, statut, valeur, ref, note });
  const fmt = (mm) => (mm / 1000).toFixed(2).replace('.', ',') + ' m';
  function runChecks() {
    checks.length = 0;
    // Escalier (valeurs lues sur le modèle SketchUp)
    const stW = 4272 - 3542, riser1 = 2870 - 2720, riser2 = 2720 - 2570, giron = 9336 - 9066;
    add('Escalier', 'Largeur de l\'escalier (entre parois)', stW >= 900 ? 'OK' : 'NOK', fmt(stW), '≥ 0,90 m (1 UP) ; ERP existant PMR : 1,00 m entre mains courantes', 'Avec 2 mains courantes, passage réel ≈ ' + fmt(stW - 2 * 60) + '. Élargir l\'emmarchement à ≥ 1,00 m ou réserver l\'accès à un flux alterné.');
    add('Escalier', 'Hauteur des marches', Math.max(riser1, riser2) <= 170 ? 'OK' : 'NOK', riser1 / 10 + ' cm et ' + riser2 / 10 + ' cm', '≤ 17 cm (ERP existant) / ≤ 16 cm (neuf)');
    add('Escalier', 'Giron', giron >= 280 ? 'OK' : 'NOK', giron / 10 + ' cm', '≥ 28 cm', 'Allonger la marche intermédiaire de 1 cm minimum (28 cm).');
    add('Escalier', 'Mains courantes', L.rampes.length >= 2 ? 'OK' : 'A VOIR', L.rampes.length + ' modélisée(s), h = 0,90 m, prolongées de ~0,30 m', 'Obligatoire des 2 côtés à partir de 3 marches ; ici 2 marches + chute latérale de 30 cm sur l\'avancée → recommandées des 2 côtés', 'Prévoir aussi : nez de marche contrastés antidérapants, contremarches contrastées 1re/dernière, bande d\'éveil de vigilance en haut (0,50 m avant la 1re marche).');
    add('Escalier', 'Avancée haute (palier étroit) avec chute latérale', 'A VOIR', 'Avancée de ' + fmt(9066 - 8283) + ' × ' + fmt(stW) + ', chute 30 cm de chaque côté', 'Pas de garde-corps exigé < 1 m de chute', 'Les mains courantes servent de protection : à prolonger sur toute l\'avancée (fait dans la 3D).');
    // Porte de grotte
    const dW = 4274 - 3470, gap = 10054 - 9336;
    add('Grotte', 'Largeur de la porte de la grotte', dW >= 800 ? 'OK' : 'NOK', fmt(dW) + ' (passage utile ≈ ' + fmt(dW - 30) + ')', 'Local < 20 pers. : 0,80 m toléré (CO) ; PMR ERP existant : 0,77 m utile');
    const gD = doors.find((d) => d.cfg.id === 'grotte');
    add('Grotte', 'Recul entre dernière marche et porte de la grotte', gD && gD.cfg.ouvre > 0 ? 'OK' : 'NOK', fmt(gap), 'Le vantail (' + fmt(dW) + ') ne doit pas balayer l\'escalier', gD && gD.cfg.ouvre > 0 ? 'Porte ouvrant vers l\'intérieur de la grotte : ne gêne pas l\'escalier. Si elle ouvre vers l\'escalier, le vantail déborde de ' + fmt(dW - gap) + '.' : 'Inverser le sens d\'ouverture.');
    add('Accessibilité', 'Accès PMR à la grotte', 'NOK', 'Dénivelé ' + fmt(2870 - 2570) + ' franchi uniquement par 2 marches', 'Rampe ≤ 5 % → ' + fmt(300 / 0.05) + ' de long + paliers', 'Pas la place pour une rampe : élévateur PMR ou demande de dérogation (motif : bâti existant / contraintes techniques).');
    const nSeatsCave = seats.filter((s) => s.zone === 'grotte').length;
    add('Grotte', 'Effectif et nombre de sorties', nSeatsCave < 20 ? 'OK' : 'NOK', nSeatsCave + ' places assises/allongées', '< 20 pers. : 1 dégagement suffit');
    // Dégagements le long du parcours
    const cs0 = seats.find((s) => s.zone === 'grotte'); const pA = cs0 && route(L.simulation.entree.x, L.simulation.entree.y, cs0.approach.x, cs0.approach.y);
    if (pA) {
      let minW = 1e9, minK = -1, minW2 = 1e9, minK2 = -1;
      for (const k of pA.raw) { const x = cellX(k % NX); if (Math.hypot(x - L.simulation.entree.x, cellY(Math.floor(k / NX)) - L.simulation.entree.y) < 900) continue; /* seuil de porte exclu */ const w = widthAt(k); if (w < minW) { minW = w; minK = k; } const inStair = x > 8200 && x < 10450; /* escalier + porte : mesurés à part, sur cotes du modèle */ if (!inStair && w < minW2) { minW2 = w; minK2 = k; } }
      const where = (k) => '(X ' + Math.round(cellX(k % NX)) + ', Y ' + Math.round(cellY(Math.floor(k / NX))) + ')';
      add('Dégagements', 'Largeur mini du cheminement entrée → grotte (hors escalier et porte)', minW2 >= 900 ? 'OK' : 'NOK', '≈ ' + fmt(minW2) + ' ' + where(minK2), '≥ 0,90 m (1 UP)', 'Calcul sur grille de 10 cm entre murs, mobilier et bords de niveau (précision ± 10 cm). Afficher le calque « Carte des dégagements » pour localiser.');
    } else add('Dégagements', 'Cheminement entrée → grotte', 'NOK', 'aucun chemin trouvé', '');
    // Cercle de giration Ø1,50 dans la grotte
    let best = null; for (let k = 0; k < NX * NY; k++) { const x = cellX(k % NX); if (x < 10400 || !passable(k)) continue; if (!best || dist[k] > dist[best]) best = k; }
    const okCircle = best !== null && dist[best] - CELL / 2 >= 750;
    add('Accessibilité', 'Espace de manœuvre Ø 1,50 m dans la grotte', okCircle ? 'OK' : 'NOK', best !== null ? 'Ø libre max ≈ ' + fmt(2 * dist[best] - CELL) : '—', 'Ø 1,50 m');
    if (best !== null) { turning.position.copy(P(cellX(best % NX), cellY(Math.floor(best / NX)), floorH[best] + 20)); turning.visible = okCircle; }
    // IR
    irs.forEach((r) => {
      const name = r.cfg.nom; const below = r.bottom - r.fl, above = r.cfg.chaine;
      const [ci, cj] = toCell(r.cfg.x, r.cfg.y); let wd = 1e9;
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const k = idx(i, j); if (wall[k] || isNaN(floorH[k])) { const d = Math.hypot(cellX(i) - r.cfg.x, cellY(j) - r.cfg.y); if (d < wd) wd = d; } }
      const side = wd - 210 - CELL / 2;
      let fd = 1e9, fname = '';
      items.forEach((it) => { const xs = it.poly.map((p) => p[0]), ys = it.poly.map((p) => p[1]); const dx = Math.max(Math.min(...xs) - r.cfg.x, 0, r.cfg.x - Math.max(...xs)), dy = Math.max(Math.min(...ys) - r.cfg.y, 0, r.cfg.y - Math.max(...ys)); const dz = Math.max(0, r.bottom - (it.h + it.T.H * 1000)); const d = Math.hypot(Math.max(0, Math.hypot(dx, dy) - 210), dz); if (d < fd) { fd = d; fname = it.cfg.nom; } });
      const ok = below >= 1800 && above >= 500 && side >= 1000 && fd >= 1000;
      r.vol.material.color.set(ok ? 0x33cc66 : 0xe03131); r.ok = ok;
      add('Radiants IR', name + ' : hauteurs de pose', below >= 1800 && above >= 500 ? 'OK' : 'NOK', fmt(below) + ' sous l\'appareil, ' + fmt(above) + ' au-dessus (hauteur libre ' + (isNaN(r.ceil) ? '?' : fmt(r.ceil - r.fl)) + ')', 'Notice Trotec : ≥ 1,80 m vers le bas et ≥ 0,50 m vers le haut → hauteur libre mini 2,54 m');
      add('Radiants IR', name + ' : distance latérale aux murs', side >= 1000 ? 'OK' : 'NOK', fmt(side), '≥ 1,00 m');
      add('Radiants IR', name + ' : distance au mobilier en cèdre (inflammable)', fd >= 1000 ? 'OK' : 'NOK', fmt(fd) + ' (' + fname + ')', '≥ 1,00 m de la face rayonnante');
    });
    add('Radiants IR', 'Usage prévu par le fabricant', 'A VOIR', 'IP34, conçu pour « surfaces extérieures couvertes »', 'Notice Trotec IR 1500 SC', 'Atmosphère saline (corrosion) + ERP : valider avec le fabricant/bureau de contrôle ; alternative : panneaux rayonnants plafond/mur à faible distance de sécurité, raccordés en fixe sur circuit dédié 10 A.');
    // Voûte et murs de sel (hypothèse photos)
    const vg = L.voutes.grotte; const hSud = vaultZ(vg, 1842 + 1) - 2570, hMid = vaultZ(vg, (vg.y0 + vg.y1) / 2) - 2570;
    add('Murs de sel', 'Mur de sel sud (2,00 m) sous la voûte', hSud >= 2000 ? 'OK' : 'A VOIR', 'voûte à ' + fmt(hSud) + ' au droit du mur (hypothèse : voûte naissant au sol, clé ' + fmt(hMid) + ')', 'Le SketchUp dessine des murs droits de 2,00 m', 'Relever le profil réel de la voûte (photos salle 2) : un mur de 2 m ne tient pas en rive d\'une voûte naissant au sol → mur cintré/ dégressif ou recul du mur.');
    add('Murs de sel', 'Rétro-éclairage', 'A VOIR', L.mursSel.join(' + '), 'Recul technique derrière les briques pour LED', 'Le mur courbe laisse un vide technique à l\'angle nord-est (accès maintenance, alimentation TBTS IP65 conseillée en atmosphère saline).');
    renderChecks();
  }

  function renderChecks() {
    const box = $('checks'); box.innerHTML = '';
    const counts = { OK: 0, NOK: 0, 'A VOIR': 0 };
    let cat = '';
    checks.forEach((c) => {
      counts[c.statut]++;
      if (c.cat !== cat) { cat = c.cat; const h = document.createElement('h3'); h.textContent = cat; box.appendChild(h); }
      const d = document.createElement('div'); d.className = 'chk ' + c.statut.replace(' ', '');
      d.innerHTML = `<span class="tag">${c.statut}</span><b>${c.titre}</b><div class="val">${c.valeur}</div><div class="ref">Réf. : ${c.ref}</div>${c.note ? `<div class="note">${c.note}</div>` : ''}`;
      box.appendChild(d);
    });
    $('summary').innerHTML = `<span class="tag OK">${counts.OK} OK</span> <span class="tag NOK">${counts.NOK} NOK</span> <span class="tag AVOIR">${counts['A VOIR']} à voir</span>`;
  }

  const turning = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.75, 64), new THREE.MeshBasicMaterial({ color: 0x4dabf7, side: THREE.DoubleSide }));
  turning.rotation.x = -Math.PI / 2; scene.add(turning);

  // ------------------------------------------------------------------ simulation des curistes
  const agentsGroup = new THREE.Group(); scene.add(agentsGroup);
  const COLORS = [0x4dabf7, 0xf06595, 0x82c91e, 0xfab005, 0x9775fa, 0x20c997, 0xff922b, 0x15aabf];
  let agents = [], simT = 0, running = false, evac = null, sessionEnd = 0;
  function makeAgent(col) {
    const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.3, 14), m); body.position.y = 0.65; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), new THREE.MeshStandardMaterial({ color: 0xf1c7a5 })); head.position.y = 1.5; head.castShadow = true; g.add(head);
    const towel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.22), new THREE.MeshStandardMaterial({ color: 0xffffff })); towel.position.y = 1.05; g.add(towel);
    agentsGroup.add(g); return g;
  }
  function planToWorld(x, y) { return P(x, y, floorAt(x, y)); }
  function startSession() {
    resetSim();
    const n = Math.min(L.simulation.effectif, seats.filter((s) => s.zone === 'grotte').length);
    const caveSeats = seats.filter((s) => s.zone === 'grotte').slice(0, n);
    const waitSeats = seats.filter((s) => s.zone === 'salle');
    const e = L.simulation.entree;
    for (let i = 0; i < n; i++) {
      const g = makeAgent(COLORS[i % COLORS.length]); g.visible = false;
      const ws = waitSeats[i % waitSeats.length], cs = caveSeats[i];
      const plan = [
        { at: i * 5, do: 'spawn', x: e.x, y: e.y },
        { do: 'go', x: ws.approach.x, y: ws.approach.y, label: 'vers l\'accueil' },
        { do: 'sit', seat: ws, until: 45 + i * 4, label: 'attente / vestiaire' },
        { do: 'go', x: cs.approach.x, y: cs.approach.y, label: 'vers la grotte' },
        { do: 'sit', seat: cs, until: 'session', label: 'séance' },
        { do: 'go', x: e.x, y: e.y, label: 'sortie' },
        { do: 'leave' },
      ];
      agents.push({ g, plan, step: 0, pos: { x: e.x, y: e.y }, path: null, wait: 0, state: 'attente', id: i, delay: i * 2.5 });
    }
    sessionEnd = 1e9; running = true; simT = 0; $('btnSession').textContent = '⏸ Pause';
  }
  function resetSim() { agents.forEach((a) => agentsGroup.remove(a.g)); agents = []; simT = 0; evac = null; running = false; doors.forEach((d) => { d.target = 0; }); $('btnSession').textContent = '▶ Séance'; setIR(false); $('simInfo').textContent = ''; }
  function setIR(on) { irs.forEach((r) => { MAT.irGlow.emissiveIntensity = on ? 1.2 : 0; r.light.intensity = on ? 1.2 : 0; }); }
  function startEvac() {
    if (!agents.length) startSession();
    evac = { t0: simT, done: false };
    const ex = L.simulation.entree;
    agents.forEach((a) => { if (a.step >= a.plan.length || a.plan[a.step].do === 'leave') return; a.plan = a.plan.slice(0, a.step).concat([{ do: 'go', x: ex.x, y: ex.y, label: 'ÉVACUATION', speed: 1.3 }, { do: 'leave' }]); a.g.visible = true; a.path = null; a.sitting = null; standUp(a); a.taken = null; });
    running = true;
  }
  function standUp(a) { a.g.rotation.set(0, a.g.rotation.y, 0); a.g.scale.set(1, 1, 1); }
  function sitDown(a, s) {
    const h = floorAt(s.x, s.y); a.g.position.copy(P(s.x, s.y, h)); a.g.rotation.set(0, s.rot * Math.PI / 180 + Math.PI, 0);
    if (s.pose === 'allonge') { a.g.position.y += 0.45; a.g.rotation.x = 0; a.g.rotateX(Math.PI / 2 - 0.35); a.g.position.add(new THREE.Vector3(0, 0, 0)); }
    else { a.g.scale.set(1, 0.72, 1); a.g.position.y += 0.02; }
  }
  function stepSim(dt) {
    simT += dt;
    let seated = 0, active = 0;
    agents.forEach((a) => {
      if (a.step >= a.plan.length) return; const t = a.plan[a.step]; active++;
      if (t.do === 'spawn') { if (simT >= t.at) { a.g.visible = true; a.pos = { x: t.x, y: t.y }; a.step++; } return; }
      if (t.do === 'go') {
        if (!a.path) { a.path = route(a.pos.x, a.pos.y, t.x, t.y) || [{ x: t.x, y: t.y }]; a.pi = 1; standUp(a); a.state = t.label; }
        const tgt = a.path[Math.min(a.pi, a.path.length - 1)]; const dx = tgt.x - a.pos.x, dy = tgt.y - a.pos.y, d = Math.hypot(dx, dy);
        const sp = (t.speed || 1.0) * 1000 * dt;
        if (d <= sp) { a.pos = { x: tgt.x, y: tgt.y }; a.pi++; if (a.pi >= a.path.length) { a.step++; a.path = null; } }
        else { a.pos.x += dx / d * sp; a.pos.y += dy / d * sp; a.g.rotation.y = Math.atan2(dx, -dy) + Math.PI; }
        const w = planToWorld(a.pos.x, a.pos.y); a.g.position.lerp(w, Math.min(1, dt * 12)); a.g.position.x = w.x; a.g.position.z = w.z;
        return;
      }
      if (t.do === 'sit') {
        if (!a.sitting) { sitDown(a, t.seat); a.sitting = t.seat; a.state = t.label; }
        if (t.until === 'session') { seated++; if (simT >= sessionEnd + a.id * 2) { a.sitting = null; standUp(a); a.pos = { x: t.seat.approach.x, y: t.seat.approach.y }; a.step++; } }
        else if (simT >= t.until) { a.sitting = null; standUp(a); a.pos = { x: t.seat.approach.x, y: t.seat.approach.y }; a.step++; }
        return;
      }
      if (t.do === 'leave') { a.g.visible = false; a.step++; }
    });
    const n = agents.length;
    if (n && seated === n && sessionEnd > 1e8) { sessionEnd = simT + 40; setIR(true); }
    if (simT > sessionEnd) setIR(false);
    // portes : ouverture à l'approche
    doors.forEach((d) => { d.target = agents.some((a) => a.g.visible && !a.sitting && Math.hypot(a.pos.x - d.cfg.x, a.pos.y - d.cfg.y) < 1300) ? 1 : 0; });
    let info = `t = ${simT.toFixed(0)} s`;
    if (seated === n && n) info += ` — séance en cours (${Math.max(0, sessionEnd - simT).toFixed(0)} s restantes, équivaut à 20 min) — radiants IR allumés`;
    if (evac) {
      const remaining = agents.filter((a) => a.step < a.plan.length).length;
      if (!remaining && !evac.done) { evac.done = true; evac.T = simT - evac.t0; }
      info = evac.done ? `Évacuation terminée en ${evac.T.toFixed(0)} s (marche 1,3 m/s, sans file d'attente)` : `ÉVACUATION en cours : ${(simT - evac.t0).toFixed(0)} s, ${remaining} personne(s) restante(s)`;
    } else if (n && !active) info = 'Séance terminée — toutes les personnes sont sorties.';
    $('simInfo').textContent = info;
    $('agentsList').innerHTML = agents.map((a) => `<li style="--c:#${COLORS[a.id % COLORS.length].toString(16).padStart(6, '0')}">Curiste ${a.id + 1} : ${a.step >= a.plan.length ? 'sorti' : a.state}</li>`).join('');
  }

  // ------------------------------------------------------------------ interface
  const views = {
    ensemble: () => { useCam(persp); persp.position.set(-2.5, 10.5, 9); controls.target.set(0.5, 0, 0); setCeil(false); },
    plan: () => { useCam(ortho); ortho.position.set(0.3, 30, 0); ortho.up.set(0, 0, -1); controls.target.set(0.3, 0, 0); ortho.lookAt(0.3, 0, 0); setCeil(false); },
    grotte: () => { useCam(persp); persp.position.copy(P(10500, 3870, 2570 + 1600)); controls.target.copy(P(13200, 3600, 2570 + 900)); setCeil(true); },
    escalier: () => { useCam(persp); persp.position.copy(P(6500, 3900, 2870 + 1650)); controls.target.copy(P(10200, 3900, 2570 + 900)); setCeil(true); },
    salle: () => { useCam(persp); persp.position.copy(P(9300, 2300, 2570 + 1700)); controls.target.copy(P(4500, 4300, 2870 + 600)); setCeil(true); },
  };
  function useCam(c) { camera = c; controls.object = c; c.up.set(0, 1, 0); if (c === ortho) c.up.set(0, 0, -1); controls.enableRotate = c !== ortho; resize(); }
  function setCeil(v) { ceilings.visible = v; $('tCeil').checked = v; }
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => views[b.dataset.view]()));
  const bind = (id, fn) => $(id).addEventListener('change', (e) => fn(e.target.checked));
  bind('tCeil', (v) => (ceilings.visible = v));
  bind('tEdges', (v) => (edgeLines.visible = v));
  bind('tFurn', (v) => (furnGroup.visible = v));
  bind('tIR', (v) => (irGroup.visible = v));
  bind('tSafe', (v) => irs.forEach((r) => (r.vol.visible = v)));
  bind('tRails', (v) => (railGroup.visible = v));
  bind('tClear', (v) => { clearGroup.visible = v; $('legendClear').style.display = v ? 'block' : 'none'; });
  bind('tTurn', (v) => (turning.visible = v));
  bind('tSalt', (v) => { MAT.salt.emissiveIntensity = v ? 0.85 : 0.05; saltLights.visible = v; });
  $('btnSession').addEventListener('click', () => { if (!agents.length) startSession(); else { running = !running; $('btnSession').textContent = running ? '⏸ Pause' : '▶ Reprendre'; } });
  $('btnEvac').addEventListener('click', startEvac);
  $('btnReset').addEventListener('click', resetSim);
  $('btnPrint').addEventListener('click', () => window.print());
  $('speed').addEventListener('input', (e) => { $('speedVal').textContent = '×' + e.target.value; });
  $('btnPanel').addEventListener('click', () => document.body.classList.toggle('nopanel'));

  // info au clic
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('click', (ev) => {
    const r = renderer.domElement.getBoundingClientRect(); mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera); const hit = ray.intersectObjects([furnGroup, irGroup, modelGroup], true)[0];
    const tip = $('tip'); if (!hit) { tip.style.display = 'none'; return; }
    let o = hit.object; while (o && !o.userData.info && o.parent) o = o.parent;
    const pl = toPlan(hit.point); const z = Math.round(hit.point.y * 1000 + OZ);
    tip.innerHTML = (o && o.userData.info ? '<b>' + o.userData.info + '</b><br>' : '') + `X ${Math.round(pl.x)} · Y ${Math.round(pl.y)} · Z ${z} mm`;
    tip.style.left = ev.clientX + 12 + 'px'; tip.style.top = ev.clientY + 12 + 'px'; tip.style.display = 'block';
  });

  function resize() {
    const el = $('view'), w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h);
    persp.aspect = w / h; persp.updateProjectionMatrix();
    const s = 7.2, a = w / h; ortho.left = -s * a / 1; ortho.right = s * a; ortho.top = s; ortho.bottom = -s;
    if (a < 1.6) { ortho.left = -6.6; ortho.right = 6.6; ortho.top = 6.6 / a; ortho.bottom = -6.6 / a; }
    ortho.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // ------------------------------------------------------------------ boucle
  const clock = new THREE.Clock();
  function loop() {
    const dt = Math.min(0.05, clock.getDelta());
    if (running) { const sp = +$('speed').value; const sub = Math.ceil(sp); for (let i = 0; i < sub; i++) stepSim(dt * sp / sub); }
    updateDoors(dt * (running ? +$('speed').value : 1));
    MAT.salt.emissiveIntensity = $('tSalt').checked ? 0.8 + 0.08 * Math.sin(performance.now() / 1500) : 0.05;
    controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop);
  }
  runChecks(); resize(); views.ensemble(); loop();
  window.GROTTE = { scene, route, checks, views, startSession, startEvac, irs, seats, items, floorH, dist, NX, NY, cellX, cellY, widthAt, setSpeed: (v) => { $('speed').value = v; } };
})();
