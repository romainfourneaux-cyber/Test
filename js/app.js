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

  const hemi = new THREE.HemisphereLight(0xfff1e0, 0x3a332c, 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(-6, 14, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 6, bottom: -6, far: 40 }); scene.add(sun);

  // ------------------------------------------------------------------ matériaux
  const TX = TEXTURES.build();
  const std = (map, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }, map && map.userData.bump ? { bumpMap: map.userData.bump, bumpScale: map.userData.bumpScale || 0.3 } : {}, o));
  Object.values(TX).forEach((t) => { t.encoding = THREE.sRGBEncoding; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
  const MAT = {
    stone: std(TX.stone), brick: std(TX.brick), tile: std(TX.tiles, { roughness: 0.7 }), screed: std(TX.screed), step: std(TX.step),
    lvt: std(TX.lvt, { roughness: 0.55 }), plaster: std(TX.plaster), render: std(TX.plaster, { color: 0x9d9992 }), wood: std(TX.wood), planks: std(TX.planks), saltCrust: std(TX.saltCrust),
    salt: std(TX.saltBricks, { emissive: 0xffb27a, emissiveMap: TX.saltBricks, emissiveIntensity: 0.85, roughness: 0.6 }),
    log: std(TX.cedar, { side: THREE.FrontSide }), slat: std(TX.cedar, { side: THREE.FrontSide }),
    irBody: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide }),
    irPanel: new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.5 }),
    irFace: new THREE.MeshStandardMaterial({ color: 0xe8e8e6, emissive: 0xff3a00, emissiveIntensity: 0.0, side: THREE.DoubleSide }),
    irGlow: new THREE.MeshStandardMaterial({ color: 0x331100, emissive: 0xff3a00, emissiveIntensity: 0.0, wireframe: true }),
    rail: new THREE.MeshStandardMaterial({ color: 0xd8dadc, metalness: 0.9, roughness: 0.25 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe3ea, transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide }),
    glassClear: new THREE.MeshStandardMaterial({ color: 0xeef6f7, transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb9a77a, metalness: 0.6, roughness: 0.35 }),
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
      if (z >= 2860) return L.sols && L.sols.salleHaute ? 'lvt' : 'tile'; // salle haute + alcôve
      if (z >= 2700) return 'step';
      return 'screed';
    }
    if (Math.hypot(c[0] - 10491, c[1] - 2196) < 470) return 'stone'; // pilier
    const e = ell(c[0], c[1]);
    if (c[0] > 10250 && c[1] > 1900 && e > 0.96 && e < 1.07) return 'render'; // mur courbe du frigidarium (enduit ciment gris, photo)
    if (c[0] > 10700 && c[1] > 1680 && c[1] < 1850 && c[2] < 4400) return 'render'; // mur sud (arc du tunnel, vue rivière)
    if (c[0] > 10040 && c[0] < 10320 && c[1] > 1840 && c[2] < 4400) return c[0] < 10100 ? 'stone' : 'render'; // mur du fond : moellons côté grotte, enduit côté frigidarium
    if (c[0] > 7980 && c[0] < 8500 && c[2] > 4000) return 'wood';
    if (c[0] > 8280 && c[0] < 9880 && c[1] > 3530 && c[1] < 4280 && c[2] < 2880) return 'step';
    return 'stone';
  }

  const buckets = {}; const floorFaces = []; const wallTris = []; const wallTops = []; 
  M.faces.forEach((f) => {
    const loop = f.loops[0]; const n = newell(loop);
    const pts = loop.map((i) => V[i]);
    const c = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length);
    // ouvertures signalées sur place mais pleines dans le SketchUp (LAYOUT.ouvertures) : on retire les faces du mur
    if ((L.ouvertures || []).some((o) => c[0] > o.x0 && c[0] < o.x1 && c[1] > o.y0 && c[1] < o.y1 && (Math.abs(n[2]) < 0.9 || c[2] > 2900))) return;
    let cls = classify(c, n);
    // repère 2D du plan de la face
    const nz = new THREE.Vector3(...n);
    const u = Math.abs(n[2]) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-n[1], n[0], 0).normalize();
    const v = new THREE.Vector3().crossVectors(nz, u);
    const flatH = Math.abs(n[2]) > 0.9;
    const c2 = pts.map((p) => new THREE.Vector2(p[0] * u.x + p[1] * u.y + p[2] * u.z, p[0] * v.x + p[1] * v.y + p[2] * v.z));
    let tris; try { tris = THREE.ShapeUtils.triangulateShape(c2, []); } catch (e) { return; }
    const b = buckets[cls] || (buckets[cls] = { pos: [], uv: [] });
    const arE = (L.portes.find((d) => d.arche) || {}).arche;
    const inArch = (y, z) => arE && z > arE.sol && ((y - (arE.y0 + arE.y1) / 2) / ((arE.y1 - arE.y0) / 2)) ** 2 + ((z - arE.sol) / (arE.cle - arE.sol)) ** 2 < 0.995;
    const rtris = arE && c[0] < 3110 && Math.abs(n[2]) < 0.9 ? tris.filter((t) => !inArch((pts[t[0]][1] + pts[t[1]][1] + pts[t[2]][1]) / 3, (pts[t[0]][2] + pts[t[1]][2] + pts[t[2]][2]) / 3)) : tris;
    rtris.forEach((t) => t.forEach((k) => {
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
  function vault(vt, mat, metersU, cut) {
    const nx = cut ? 96 : 24, ny = cut ? 80 : 40, pos = [], uv = [], idx = [];
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const x = vt.x0 + (vt.x1 - vt.x0) * i / nx, y = vt.y0 + (vt.y1 - vt.y0) * j / ny, z = vaultZ(vt, y);
      const p = P(x, y, z); pos.push(p.x, p.y, p.z); uv.push(x / 1000 / metersU, j * (vt.y1 - vt.y0) * 1.3 / ny / 1000 / metersU);
    }
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      if (cut) { const xm = vt.x0 + (vt.x1 - vt.x0) * (i + 0.5) / nx, ym = vt.y0 + (vt.y1 - vt.y0) * (j + 0.5) / ny; if (cut(xm, ym, vaultZ(vt, ym))) continue; }
      const a = i * (ny + 1) + j, b = a + ny + 1; idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry(); g.setIndex(idx);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; ceilings.add(m);
  }
  // frigidarium : la voûte (hypothèse : berceau naissant au sol) est percée au droit de l'arc sud qui donne sur la rivière (lunette),
  // et fermée au-dessus du mur courbe (tympan) pour ne pas laisser de vide entre le haut du mur et la voûte
  const fArc = (L.frigidarium && L.frigidarium.arc) || null;
  const arcTop = (x) => { if (!fArc) return -1e9; for (let i = 1; i < fArc.length; i++) { const [xa, za] = fArc[i - 1], [xb, zb] = fArc[i]; if (x >= xa && x <= xb) return za + (zb - za) * (x - xa) / (xb - xa); } return -1e9; };
  const vF = L.voutes.frigidarium;
  vault(vF, MAT.saltCrust, TX.saltCrust.userData.meters, (x, y, z) => z < arcTop(x) + 40 && y < (vF.y0 + vF.y1) / 2);
  if (fArc) { // lunette : intrados de l'arc prolongé jusqu'à la voûte
    const yEnd = (z) => { const v = vF, a = (v.y1 - v.y0) / 2, c = (z - v.naissance) / (v.cle - v.naissance); return c <= 0 ? v.y0 : (v.y0 + v.y1) / 2 - a * Math.sqrt(Math.max(0, 1 - c * c)); };
    const pos = [], uv = [], sm = TX.saltCrust.userData.meters;
    for (let i = 1; i < fArc.length; i++) {
      const [xa, za] = fArc[i - 1], [xb, zb] = fArc[i], q = [[xa, 1842, za], [xb, 1842, zb], [xb, yEnd(zb) + 30, zb], [xa, yEnd(za) + 30, za]];
      [0, 1, 2, 0, 2, 3].forEach((k) => { const w = P(...q[k]); pos.push(w.x, w.y, w.z); uv.push(q[k][0] / 1000 / sm, (q[k][1] + q[k][2]) / 1000 / sm); });
    }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); lg.computeVertexNormals();
    ceilings.add(new THREE.Mesh(lg, MAT.saltCrust));
  }
  { // tympan au-dessus du mur courbe (quart d'ellipse centré 10191 / 1842, rayons 4900 × 4400), du haut du mur (4340) à la voûte
    const pos = [], uv = [], sm = TX.saltCrust.userData.meters, N = 48;
    for (let i = 0; i < N; i++) {
      const pt = (k) => { const t = k / N * Math.PI / 2; return [10191 + 4900 * Math.cos(t), 1842 + 4400 * Math.sin(t)]; };
      const [xa, ya] = pt(i), [xb, yb] = pt(i + 1), za = vaultZ(vF, ya) + 20, zb = vaultZ(vF, yb) + 20;
      if (za <= 4340 && zb <= 4340) continue;
      const q = [[xa, ya, 4340], [xb, yb, 4340], [xb, yb, Math.max(4340, zb)], [xa, ya, Math.max(4340, za)]];
      [0, 1, 2, 0, 2, 3].forEach((k) => { const w = P(...q[k]); pos.push(w.x, w.y, w.z); uv.push((q[k][0] + q[k][1]) / 1000 / sm, q[k][2] / 1000 / sm); });
    }
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); tg.computeVertexNormals();
    ceilings.add(new THREE.Mesh(tg, MAT.saltCrust));
  }
  let alcoveArc = null; const dehorsGroup = new THREE.Group(); scene.add(dehorsGroup); // extérieur : ruelle, rivière (masqué en vue maquette)
  // ------------------------------------------------------------------ salle carrelée derrière l'arche d'entrée (vue à travers le vitrage clair)
  {
    const A = (L.portes.find((d) => d.arche) || {}).arche;
    if (A) {
      const x0 = 2953 - 4200, x1 = 2953, y0 = A.y0 - 300, y1 = A.y1 + 300, z0 = A.sol, z1 = A.sol + 2900, FT = TEXTURES.faience(); FT.encoding = THREE.sRGBEncoding;
      const fai = std(FT), sol = MAT.tile, g = new THREE.Group(); g.userData.info = 'Salle carrelée (accès, 26 °C / 75 % HR)';
      const plane = (w, h, mat, pos, ry, rx, sm) => { const pg = new THREE.PlaneGeometry(w, h); const u = pg.attributes.uv; for (let k = 0; k < u.count; k++) u.setXY(k, u.getX(k) * w / sm, u.getY(k) * h / sm); const m = new THREE.Mesh(pg, mat); m.position.copy(pos); m.rotation.set(rx || 0, ry || 0, 0); m.receiveShadow = true; g.add(m); };
      const W = (x1 - x0) / 1000, D = (y1 - y0) / 1000, H = (z1 - z0) / 1000;
      plane(W, D, sol, P((x0 + x1) / 2, (y0 + y1) / 2, z0 - 2), 0, -Math.PI / 2, 1.8);
      plane(W, D, MAT.plaster, P((x0 + x1) / 2, (y0 + y1) / 2, z1), 0, Math.PI / 2, 2); const plafSC = g.children[g.children.length - 1]; g.remove(plafSC); plafSC.position.copy(P((x0 + x1) / 2, (y0 + y1) / 2, z1)); ceilings.add(plafSC);
      plane(D, H, fai, P(x0, (y0 + y1) / 2, (z0 + z1) / 2), Math.PI / 2, 0, 1);
      plane(W, H, fai, P((x0 + x1) / 2, y0, (z0 + z1) / 2), 0, 0, 1);
      plane(W, H, fai, P((x0 + x1) / 2, y1, (z0 + z1) / 2), Math.PI, 0, 1);
      // face ouest du pignon : faïence autour de l'arche (le pignon du SketchUp reste en dessous)
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo((A.y0 - y0) / 1000, 0);
      const yc = (A.y0 + A.y1) / 2, ra = (A.y1 - A.y0) / 2, rb = A.cle - A.sol;
      for (let i = 40; i >= 0; i--) { const t = Math.PI * i / 40; sh.lineTo((yc + ra * Math.cos(t) - y0) / 1000, (rb * Math.sin(t)) / 1000); }
      sh.lineTo((y1 - y0) / 1000, 0); sh.lineTo((y1 - y0) / 1000, H); sh.lineTo(0, H); sh.lineTo(0, 0);
      const fg = new THREE.ShapeGeometry(sh); const fu = fg.attributes.uv; for (let k = 0; k < fu.count; k++) fu.setXY(k, fu.getX(k), fu.getY(k));
      const fm = new THREE.Mesh(fg, fai); fm.rotation.y = Math.PI / 2; fm.position.copy(P(2950, y0, z0)); g.add(fm);
      const lamp = new THREE.PointLight(0xffe2c0, 0.9, 7, 2); lamp.position.copy(P(x0 + 1800, yc, z1 - 300)); g.add(lamp);
      const lamp2 = new THREE.PointLight(0xffe2c0, 0.6, 5, 2); lamp2.position.copy(P(x1 - 900, yc, z1 - 400)); g.add(lamp2);
      scene.add(g);
    }
  }

  // ------------------------------------------------------------------ arcs en claveaux de pierre (LAYOUT.arcs) et remplissage enduit
  const MAT_CLAVEAU = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, bumpMap: TX.stone.userData.bump, bumpScale: 0.25, side: THREE.DoubleSide });
  (L.arcs || []).forEach((A) => {
    const uc = (A.y0 + A.y1) / 2, half = (A.y1 - A.y0) / 2;
    let aI, bI; if (A.sansDebord) { aI = half; bI = A.cle - A.naissance; } else { aI = half - 60 - A.ep; bI = A.cle - A.naissance - A.ep; }
    const aO = aI + A.ep, bO = bI + A.ep, W = (u, v, off) => P(A.pos + A.face * off, u, A.sol + v);
    const N = Math.round(Math.PI * (aI + bI) / 2 / 190), pos = [], col = [], uv = [], rr = rng0(A.pos);
    for (let i = 0; i < N; i++) {
      const t0 = Math.PI * (i + 0.05) / N, t1 = Math.PI * (i + 0.95) / N;
      const q = [[aI, bI, t0], [aO, bO, t0], [aO, bO, t1], [aI, bI, t1]].map(([ra, rb, t]) => [uc + ra * Math.cos(t), A.naissance + rb * Math.sin(t)]);
      if (q.some(([u]) => u < A.y0 + 20 || u > A.y1 - 20)) continue;
      const v = 0.75 + rr() * 0.4, cc = new THREE.Color(0.30 * v, 0.33 * v, 0.38 * v);
      [0, 1, 2, 0, 2, 3].forEach((k) => { const w = W(q[k][0], q[k][1], 6); pos.push(w.x, w.y, w.z); col.push(cc.r, cc.g, cc.b); uv.push(q[k][0] / 1800, q[k][1] / 1800); });
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, MAT_CLAVEAU); m.userData.info = A.nom; scene.add(m);
    if (A.remplissage) { // enduit sous l'intrados, découpé pour la porte qui s'y trouve
      const dr = L.portes.find((d) => d.axe === 'y' && Math.abs(d.x - A.pos) < 300), sh = new THREE.Shape(), X = (u) => (u - A.y0) / 1000;
      sh.moveTo(X(uc - aI), 0);
      if (dr) { const ya = dr.y - dr.largeur / 2 - 40, yb = dr.y + dr.largeur / 2 + 40; sh.lineTo(X(ya), 0); sh.lineTo(X(ya), 2.16); sh.lineTo(X(yb), 2.16); sh.lineTo(X(yb), 0); }
      sh.lineTo(X(uc + aI), 0);
      for (let i = 0; i <= 40; i++) { const t = Math.PI * i / 40; sh.lineTo(X(uc + aI * Math.cos(t)), (A.naissance + bI * Math.sin(t)) / 1000); }
      const fg = new THREE.ShapeGeometry(sh); const fu = fg.attributes.uv; for (let k = 0; k < fu.count; k++) fu.setXY(k, fu.getX(k) / 2, fu.getY(k) / 2);
      const fm = new THREE.Mesh(fg, std(TX.plaster, { color: A.remplissage })); fm.position.copy(P(A.pos + A.face * 4, A.y0, A.sol)); fm.rotation.y = Math.PI / 2; fm.receiveShadow = true; fm.userData.info = A.nom + ' — remplissage enduit'; scene.add(fm);
    }
  });
  function rng0(seed) { let q = Math.floor(seed) >>> 0; return () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296); }
  // mur du fond de la partie basse au-dessus de la cloison du SketchUp (4,34 m) : moellons côté grotte jusqu'au plafond, enduit côté frigidarium jusqu'à la voûte
  {
    const pb = L.plafonds.find((c) => c.x1 === 10054); const zt = pb ? pb.z + 130 : 5200;
    const wg = new THREE.PlaneGeometry(4.4, (zt - 4300) / 1000); const wu = wg.attributes.uv; for (let k = 0; k < wu.count; k++) wu.setXY(k, wu.getX(k) * 4.4 / TX.stone.userData.meters, wu.getY(k) * (zt - 4300) / 1000 / TX.stone.userData.meters);
    const wm = new THREE.Mesh(wg, MAT.stone); wm.rotation.y = Math.PI / 2; wm.position.copy(P(10052, 4042, (4300 + zt) / 2)); scene.add(wm);
    const vF0 = L.voutes.frigidarium, sh = new THREE.Shape(); sh.moveTo(0, 0);
    for (let i = 0; i <= 40; i++) { const y = vF0.y0 + (vF0.y1 - vF0.y0) * i / 40; sh.lineTo((y - vF0.y0) / 1000, Math.max(0, vaultZ(vF0, y) + 30 - 4300) / 1000); }
    sh.lineTo((vF0.y1 - vF0.y0) / 1000, 0);
    const fm = new THREE.Mesh(new THREE.ShapeGeometry(sh), MAT.render); fm.rotation.y = Math.PI / 2; fm.position.copy(P(10322, vF0.y0, 4300)); scene.add(fm);
  }

  // alcôve sud : murs et voûte en berceau suivant l'arc d'entrée (non dessinés dans le SketchUp, hypothèse LAYOUT.voutes.alcove)
  if (L.voutes.alcove) {
    const a = L.voutes.alcove, xc = (a.x0 + a.x1) / 2, ra = (a.x1 - a.x0) / 2, sm = TX.stone.userData.meters;
    const arcZ = (x) => a.naissance + (a.cle - a.naissance) * Math.sqrt(Math.max(0, 1 - ((x - xc) / ra) ** 2)); alcoveArc = arcZ;
    const nx = 32, ny = 12, pos = [], uv = [], ix = [];
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const x = a.x0 + (a.x1 - a.x0) * i / nx, y = a.y0 + (a.y1 - a.y0) * j / ny, q = P(x, y, arcZ(x)); pos.push(q.x, q.y, q.z); uv.push(x / 1000 / sm, y / 1000 / sm);
    }
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const k = i * (ny + 1) + j, k2 = k + ny + 1; ix.push(k, k2, k + 1, k2, k2 + 1, k + 1); }
    const vg = new THREE.BufferGeometry(); vg.setIndex(ix); vg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); vg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); vg.computeVertexNormals();
    ceilings.add(new THREE.Mesh(vg, MAT.stone));
    const wall = (x, ya, yb) => { // mur est ou ouest, du sol à la naissance
      const w = (yb - ya) / 1000, h = (a.naissance - a.sol) / 1000; const g = new THREE.PlaneGeometry(w, h); const u = g.attributes.uv; for (let q = 0; q < u.count; q++) u.setXY(q, u.getX(q) * w / sm, u.getY(q) * h / sm);
      const m = new THREE.Mesh(g, MAT.stone); m.rotation.y = Math.PI / 2; m.position.copy(P(x, (ya + yb) / 2, (a.sol + a.naissance) / 2)); m.receiveShadow = true; m.userData.info = 'Alcôve — mur contre roche (hypothèse, non dessiné dans le SketchUp)'; scene.add(m);
    };
    wall(a.x0, a.y0, a.y1); wall(a.x1, a.y0, a.y1);
    // mur du fond, découpé pour l'issue de secours cintrée (LAYOUT.portes, cintree) : le haut de la porte suit la voûte à 40 mm près
    const dS = (L.portes || []).find((d) => d.cintree), sh = new THREE.Shape(); sh.moveTo(0, 0);
    if (dS) {
      const ex = (dS.fixes || 0) + 20, xa = dS.x - dS.largeur / 2 - ex, xb = dS.x + dS.largeur / 2 + ex, sv = (dS.sousVoute || 40) - 20; // baie maçonnée
      sh.lineTo((xa - a.x0) / 1000, 0);
      for (let i = 0; i <= 16; i++) { const x = xa + (xb - xa) * i / 16; sh.lineTo((x - a.x0) / 1000, (arcZ(x) - sv - a.sol) / 1000); }
      sh.lineTo((xb - a.x0) / 1000, 0);
      // dégagement extérieur derrière la porte (couloir sombre)
      const cg = new THREE.PlaneGeometry((xb - xa) / 1000 + 0.6, (a.cle - a.sol) / 1000); const cor = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: 0x8d9a86, emissive: 0x7d8a78, emissiveIntensity: 0.55, roughness: 1 })); // ruelle en plein jour
      cor.position.copy(P(dS.x, a.y0 - 900, (a.sol + a.cle) / 2)); dehorsGroup.add(cor);
      const cf = new THREE.Mesh(new THREE.PlaneGeometry((xb - xa) / 1000 + 0.6, 0.9), MAT.screed); cf.rotation.x = -Math.PI / 2; cf.position.copy(P(dS.x, a.y0 - 450, a.sol)); dehorsGroup.add(cf);
      // BAES « sortie de secours » en drapeau sous la voûte, devant la porte
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const cx2 = cv.getContext('2d');
      cx2.fillStyle = '#0a8f3c'; cx2.fillRect(0, 0, 256, 96); cx2.strokeStyle = '#fff'; cx2.fillStyle = '#fff'; cx2.lineWidth = 7; cx2.lineCap = 'round';
      cx2.strokeRect(170, 14, 50, 68); cx2.beginPath(); cx2.arc(118, 22, 8, 0, 7); cx2.fill();
      cx2.beginPath(); cx2.moveTo(112, 34); cx2.lineTo(100, 58); cx2.lineTo(84, 82); cx2.moveTo(100, 58); cx2.lineTo(124, 70); cx2.lineTo(130, 86); cx2.moveTo(112, 34); cx2.lineTo(134, 46); cx2.lineTo(150, 40); cx2.moveTo(110, 38); cx2.lineTo(90, 48); cx2.stroke();
      cx2.beginPath(); cx2.moveTo(30, 48); cx2.lineTo(66, 48); cx2.moveTo(52, 34); cx2.lineTo(66, 48); cx2.lineTo(52, 62); cx2.stroke();
      const bt = new THREE.CanvasTexture(cv); bt.encoding = THREE.sRGBEncoding;
      const baes = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.05), [MAT.irPanel, MAT.irPanel, MAT.irPanel, MAT.irPanel, new THREE.MeshStandardMaterial({ map: bt, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: 0.9 }), new THREE.MeshStandardMaterial({ map: bt, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: 0.9 })]);
      baes.position.copy(P(dS.x, a.y0 + 380, a.cle - 130)); baes.userData.info = 'BAES « sortie de secours » en drapeau'; scene.add(baes);
    }
    sh.lineTo(ra * 2 / 1000, 0);
    for (let i = nx; i >= 0; i--) { const x = a.x0 + (a.x1 - a.x0) * i / nx; sh.lineTo((x - a.x0) / 1000, (arcZ(x) - a.sol) / 1000); }
    const fg = new THREE.ShapeGeometry(sh); const fu = fg.attributes.uv; for (let q = 0; q < fu.count; q++) fu.setXY(q, fu.getX(q) / sm, fu.getY(q) / sm);
    const fond = new THREE.Mesh(fg, MAT.stone); fond.position.copy(P(a.x0, a.y0, a.sol)); fond.receiveShadow = true; fond.userData.info = 'Alcôve — mur du fond contre roche (hypothèse)'; scene.add(fond);
  }
  // plafonds plats en bois de la grotte : lames + solives apparentes (photos de la partie basse)
  L.plafonds.forEach((c) => {
    const w = (c.x1 - c.x0) / 1000, d = (c.y1 - c.y0) / 1000, s = TX.planks.userData.meters;
    const g = new THREE.PlaneGeometry(w, d); const uv = g.attributes.uv; for (let q = 0; q < uv.count; q++) uv.setXY(q, uv.getX(q) * w / s, uv.getY(q) * d / s);
    const m = new THREE.Mesh(g, MAT.planks); m.rotation.x = Math.PI / 2; m.position.copy(P((c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, c.z + 120)); ceilings.add(m);
    // solives dans le sens de la longueur (est-ouest), entraxe 50 cm (photos de la partie basse)
    for (let y = c.y0 + 250; y < c.y1; y += 500) { const j = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.075), MAT.wood); j.position.copy(P((c.x0 + c.x1) / 2, y, c.z + 60)); j.castShadow = true; ceilings.add(j); }
  });
  // c.z = sous-face des solives = hauteur libre
  function ceilingAt(x, y) {
    for (const c of L.plafonds) if (x >= c.x0 && x <= c.x1 && y >= c.y0 && y <= c.y1) return c.z;
    const v = L.voutes.frigidarium; if (x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1) return vaultZ(v, y);
    return NaN;
  }

  // ------------------------------------------------------------------ grille d'analyse (10 cm)
  const CELL = 100, GX0 = 2850, GY0 = 0, NX = 126, NY = 66;
  const idx = (i, j) => j * NX + i;
  const fmt0 = (mm) => (mm / 1000).toFixed(2).replace('.', ',') + ' m';
  const floorAt0 = (x, y) => { const k = idx(Math.floor((x - GX0) / CELL), Math.floor((y - GY0) / CELL)); return isNaN(floorH[k]) ? 2570 : floorH[k]; };
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

  // ------------------------------------------------------------------ murs de sel rétro-éclairés (LAYOUT.mursSel)
  const saltGroup = new THREE.Group(); scene.add(saltGroup); const saltLights = new THREE.Group(); scene.add(saltLights);
  L.mursSel.forEach((w) => {
    const cx = (w.x0 + w.x1) / 2, cy = (w.y0 + w.y1) / 2, W = (w.x1 - w.x0) / 1000, D = (w.y1 - w.y0) / 1000, H = w.h / 1000;
    const [ci, cj] = toCell(cx, cy); const fl = floorAt0(cx, cy);
    const geo = new THREE.BoxGeometry(W, H, D); const uv = geo.attributes.uv; const s = TX.saltBricks.userData.meters;
    const dims = [[D, H], [D, H], [W, D], [W, D], [W, H], [W, H]];
    for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const q = f * 4 + v; uv.setXY(q, uv.getX(q) * dims[f][0] / s, uv.getY(q) * dims[f][1] / s); }
    const m = new THREE.Mesh(geo, MAT.salt); m.position.copy(P(cx, cy, fl + w.h / 2)); m.userData.info = w.nom + ' — briques de sel rétro-éclairées, ' + fmt0(w.x1 - w.x0) + ' × ' + fmt0(w.h); saltGroup.add(m);
    const toward = Math.sign(4000 - cy);
    const l = new THREE.PointLight(0xff9a50, 1.4, 4, 2); l.position.copy(P(cx, cy + toward * 700, fl + 1300)); saltLights.add(l);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const x = cellX(i), y = cellY(j); if (x >= w.x0 && x <= w.x1 && y >= w.y0 - 50 && y <= w.y1 + 50) wall[idx(i, j)] = 1; }
  });

  // ------------------------------------------------------------------ portes
  // menuiserie à haut cintré (ou droit) : panneau (vitrage ou plein) + cadre ; u le long du mur (m), top(u) = hauteur du haut (m)
  const MAT_PANNEAU = new THREE.MeshStandardMaterial({ color: 0xe6e9eb, roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide });
  function menuiserie(u0, u1, top, frameM, fill, opts = {}) {
    const g = new THREE.Group(), N = 20, c = 0.05;
    const sh = new THREE.Shape(); sh.moveTo(u0 + c, c); sh.lineTo(u1 - c, c);
    for (let i = N; i >= 0; i--) { const u = u0 + c + (u1 - u0 - 2 * c) * i / N; sh.lineTo(u, Math.max(c + 0.01, top(u) - c)); }
    g.add(new THREE.Mesh(new THREE.ShapeGeometry(sh), fill));
    const box = (w, hh, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.06), frameM); m.position.set(x, y, 0); m.castShadow = true; g.add(m); };
    const hA = top(u0 + c / 2), hB = top(u1 - c / 2);
    if (hA > 0.06) box(c, hA, u0 + c / 2, hA / 2);
    if (hB > 0.06) box(c, hB, u1 - c / 2, hB / 2);
    box(u1 - u0, c, (u0 + u1) / 2, c / 2);
    const pts = []; for (let i = 0; i <= N; i++) { const u = u0 + (u1 - u0) * i / N; pts.push(new THREE.Vector3(u, Math.max(c / 2, top(u) - c / 2), 0)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N * 2, c / 2, 6), frameM));
    if (opts.antipanique) {
      const z = opts.antipanique * 0.075, bar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, u1 - u0 - 0.24, 12), MAT.rail); bar.rotation.z = Math.PI / 2; bar.position.set((u0 + u1) / 2, 1.0, z); g.add(bar);
      for (const bx of [u0 + 0.1, u1 - 0.1]) { const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.07, 0.075), MAT.rail); s2.position.set(bx, 1.0, z * 0.55); g.add(s2); }
    }
    return g;
  }
  const doors = [];
  L.portes.forEach((d) => {
    const [ci, cj] = toCell(d.x, d.y);
    const h = d.arche ? d.arche.sol : d.cintree && L.voutes.alcove ? L.voutes.alcove.sol : (floorH[idx(ci, cj)] || 2870);
    const root = new THREE.Group(); root.position.copy(P(d.x, d.y, h)); scene.add(root);
    const W = d.largeur / 1000, n = d.vantaux, lw = W / n;
    const frameM = d.arche ? MAT.alu : new THREE.MeshStandardMaterial({ color: d.couleur, metalness: 0.5, roughness: 0.4 });
    // hauteur du haut de la menuiserie selon la position le long du mur (mm) : arche d'entrée, voûte de l'alcôve, sinon 2,10 m
    let topAt = () => 2.1;
    if (d.arche) { const A = d.arche, yc = (A.y0 + A.y1) / 2, ra = (A.y1 - A.y0) / 2, rb = A.cle - A.sol; topAt = (q) => (rb * Math.sqrt(Math.max(0, 1 - ((q - yc) / ra) ** 2)) - 20) / 1000; }
    else if (d.cintree && alcoveArc) { const sv = d.sousVoute || 40; topAt = (q) => (alcoveArc(q) - sv - L.voutes.alcove.sol) / 1000; }
    const fill = d.arche ? MAT.glassClear : d.cintree ? MAT_PANNEAU : MAT.glass;
    const base = d.axe === 'x' ? d.x : d.y;
    const along = d.axe === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, -1);
    const leaves = [];
    for (let k = 0; k < n; k++) {
      // pivot sur le montant ; le vantail s'étend vers le centre ; planAt(u) = coordonnée de plan du point du vantail à u m du montant
      const pivot = new THREE.Group(); const side = n === 1 ? -1 : (k === 0 ? -1 : 1);
      pivot.position.copy(along.clone().multiplyScalar(side * W / 2));
      const planAt = (u) => base + side * (W / 2 - u) * 1000;
      const bar = d.antipanique === 'ouest' ? -1 : d.cintree && k === (d.actif || 0) ? -1 : 0;
      const leaf = menuiserie(0, lw, (u) => topAt(planAt(u)), frameM, fill, { antipanique: bar });
      leaf.scale.x = -side; if (d.axe === 'y') leaf.rotation.y = Math.PI / 2;
      pivot.add(leaf); root.add(pivot);
      leaves.push({ pivot, side, fixe: d.actif !== undefined && k !== d.actif });
    }
    // parties fixes : entrée = de la naissance de l'arche aux montants de la double porte ; issue de secours = d.fixes de chaque côté
    const fixes = [];
    if (d.arche) fixes.push([d.arche.y0, d.y - d.largeur / 2], [d.y + d.largeur / 2, d.arche.y1]);
    if (d.fixes) fixes.push([base - d.largeur / 2 - d.fixes, base - d.largeur / 2], [base + d.largeur / 2, base + d.largeur / 2 + d.fixes]);
    fixes.forEach(([pa, pb]) => {
      const g = menuiserie(0, (pb - pa) / 1000, (u) => topAt(pa + u * 1000), frameM, fill);
      if (d.axe === 'x') g.position.copy(P(pa, d.y, h)); else { g.position.copy(P(d.x, pa, h)); g.rotation.y = Math.PI / 2; }
      g.userData.info = d.nom + ' — partie fixe'; scene.add(g);
    });
    doors.push({ cfg: d, root, leaves, open: 0, target: 0, h });
  });
  function updateDoors(dt) {
    doors.forEach((d) => {
      d.open += Math.sign(d.target - d.open) * Math.min(Math.abs(d.target - d.open), dt * 1.6);
      d.leaves.forEach(({ pivot, side, fixe }) => {
        if (fixe) return; // vantail semi-fixe (verrou haut et bas)
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
    const it = { cfg: f, T, g, poly, h, k, zone: f.x > 10311 ? 'frigidarium' : f.y < 1751 ? 'alcove' : 'grotte' }; items.push(it);
    T.seats.forEach((s, si) => { const p = loc2plan(s.x, s.z), ap = loc2plan(T.approach[si].x, T.approach[si].z); seats.push({ item: it, x: p.x, y: p.y, pose: s.pose, rot: f.rot, approach: ap, approaches: T.approach.map((q) => loc2plan(q.x, q.z)), zone: it.zone, taken: false }); });
  });

  // ------------------------------------------------------------------ poêles de sauna (LAYOUT.poeles)
  const poeleGroup = new THREE.Group(); scene.add(poeleGroup); const poeles = [];
  const MAT_POELE = { acier: new THREE.MeshStandardMaterial({ color: 0x232325, metalness: 0.35, roughness: 0.55 }),
    pierre: new THREE.MeshStandardMaterial({ color: 0x45423f, roughness: 0.95 }),
    braise: new THREE.MeshStandardMaterial({ color: 0x220800, emissive: 0xff4a10, emissiveIntensity: 0 }) };
  if (L.chauffage === 'poeles') (L.poeles || []).forEach((c) => {
    const md = L.poele; const nrm = { N: [0, 1], S: [0, -1], E: [1, 0], O: [-1, 0] }[c.face || 'O'];
    const W = md.L, D = md.Pr, H = md.H; const fl = floorAt(c.x, c.y);
    const along = nrm[0] === 0; // face nord/sud : largeur selon X
    const box = { x0: c.x - (along ? W : D) / 2, x1: c.x + (along ? W : D) / 2, y0: c.y - (along ? D : W) / 2, y1: c.y + (along ? D : W) / 2, z0: fl, z1: fl + H };
    const g = new THREE.Group();
    const corps = new THREE.Mesh(new THREE.BoxGeometry(W / 1000, H * 0.78 / 1000, D / 1000), MAT_POELE.acier); corps.position.y = H * 0.39 / 1000; corps.castShadow = true; g.add(corps);
    // façade à fentes verticales : les résistances rougeoient derrière quand le poêle chauffe
    for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(W / 1000 * 0.045, H * 0.5 / 1000, 0.004), MAT_POELE.braise); f.position.set(((i + 0.5) / 7 - 0.5) * W / 1000 * 0.78, H * 0.42 / 1000, D / 2000 + 0.003); g.add(f); }
    const panier = new THREE.Mesh(new THREE.BoxGeometry(W / 1000 + 0.01, 0.03, D / 1000 + 0.01), MAT_POELE.acier); panier.position.y = H * 0.78 / 1000; g.add(panier);
    const rs = rng0(c.x + c.y); // tas de pierres de sauna (péridotite)
    for (let i = 0; i < 46; i++) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035 + rs() * 0.03, 0), MAT_POELE.pierre); const u = rs() - 0.5, v = rs() - 0.5; st.position.set(u * W / 1000 * 0.85, H * 0.8 / 1000 + (0.5 - Math.max(Math.abs(u), Math.abs(v))) * 0.16 + rs() * 0.03, v * D / 1000 * 0.85); st.rotation.set(rs() * 3, rs() * 3, rs() * 3); st.scale.y = 0.75; g.add(st); }
    if (md.gardeCorps) { // garde-corps en bois autour du poêle (exigé en sauna collectif)
      const gc = 0.1, hh = 0.9, w2 = W / 1000 + 2 * gc, d2 = D / 1000 + gc;
      for (const [x, z, sx, sz] of [[0, D / 2000 + gc, w2, 0.04], [-w2 / 2, gc / 2, 0.04, d2], [w2 / 2, gc / 2, 0.04, d2]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.05, sz), MAT.slat); r.position.set(x, hh, z); g.add(r); const r2 = r.clone(); r2.position.y = hh / 2; g.add(r2); }
    }
    g.position.copy(P(c.x, c.y, fl)); g.rotation.y = Math.atan2(nrm[0], -nrm[1]); poeleGroup.add(g);
    const light = new THREE.PointLight(0xff5a20, 0, 3, 2); light.position.copy(P(c.x + nrm[0] * 500, c.y + nrm[1] * 500, fl + 500)); poeleGroup.add(light);
    g.userData = { info: c.nom + ' — ' + md.nom + ', ' + md.P / 1000 + ' kW, ' + W / 10 + ' × ' + D / 10 + ' × ' + H / 10 + ' cm', kind: 'poele' };
    // emprise au sol (avec garde-corps) = obstacle de circulation
    const m = md.gardeCorps ? 100 : 0; const ob = { x0: box.x0 - (along ? m : (nrm[0] < 0 ? m : 0)), x1: box.x1 + (along ? m : (nrm[0] > 0 ? m : 0)), y0: box.y0 - (along ? (nrm[1] < 0 ? m : 0) : m), y1: box.y1 + (along ? (nrm[1] > 0 ? m : 0) : m) };
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const x = cellX(i), y = cellY(j); if (x >= ob.x0 && x <= ob.x1 && y >= ob.y0 && y <= ob.y1) furn[idx(i, j)] = 1; }
    poeles.push({ cfg: c, g, box, n: nrm, fl, light });
  });
  // déshumidificateur (LAYOUT.deshumidificateur) : posé au sol, ou au mur si zBas est renseigné
  let deshum = null;
  if (L.deshumidificateur) {
    const c = L.deshumidificateur; const nrm = { N: [0, 1], S: [0, -1], E: [1, 0], O: [-1, 0] }[c.face || 'O']; const fl = floorAt(c.x, c.y);
    const along = nrm[0] === 0; const W = c.L, D = c.Pr, H = c.H, zb = c.zBas || 0;
    const box = { x0: c.x - (along ? W : D) / 2, x1: c.x + (along ? W : D) / 2, y0: c.y - (along ? D : W) / 2, y1: c.y + (along ? D : W) / 2, z0: fl + zb, z1: fl + zb + H };
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(W / 1000, H / 1000, D / 1000), new THREE.MeshStandardMaterial({ color: 0xc9ced3, metalness: 0.6, roughness: 0.3 })); b.position.y = (zb + H / 2) / 1000; b.castShadow = true; g.add(b);
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(W / 1000 * 0.8, H / 1000 * 0.35), new THREE.MeshStandardMaterial({ color: 0x495057 })); gr.position.set(0, (zb + H * 0.7) / 1000, D / 2000 + 0.002); g.add(gr);
    const ec = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0x0b7285, emissive: 0x15aabf, emissiveIntensity: 0.8 })); ec.position.set(0, (zb + H * 0.35) / 1000, D / 2000 + 0.003); g.add(ec);
    if (c.degLat !== undefined) { // volume à laisser libre (notice) : côtés, dessus, dessous
      const lat = c.degLat || 0, hau = c.degHaut || 0, bas = c.degBas || 0;
      const zg = new THREE.BoxGeometry((W + 2 * lat) / 1000, (H + hau + bas) / 1000, D / 1000);
      const z = new THREE.LineSegments(new THREE.EdgesGeometry(zg), new THREE.LineBasicMaterial({ color: 0x15aabf }));
      z.position.y = (zb - bas + (H + hau + bas) / 2) / 1000; z.userData.tech = true; g.add(z);
    }
    // habillage bois à claire-voie (LAYOUT.deshumidificateur.habillage) : repère local x le long du mur, y vertical, z vers la pièce (dos au mur en z = -D/2)
    let caisson = null;
    if (c.habillage) {
      const hb = c.habillage, ep = hb.ep, Wc = W + 2 * (hb.jeuLat + ep), Hc = H + hb.jeuHaut + hb.jeuBas + 2 * ep, Dc = D + hb.jeuAvant + ep;
      const yb = zb - hb.jeuBas - ep, zBack = -D / 2, pas = hb.lame / (1 - hb.vide), mb = std(TX.cedar, { color: hb.couleur || 0xb07a4c, side: THREE.FrontSide });
      const cg = new THREE.Group(); const bx = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w / 1000, h / 1000, d / 1000), mb); m.position.set(x / 1000, y / 1000, z / 1000); m.castShadow = true; m.receiveShadow = true; cg.add(m); };
      // côtés (pleins ou à claire-voie)
      for (const sx of [-1, 1]) {
        if (hb.faces.cotes) { for (let zz = zBack + pas / 2; zz < zBack + Dc - ep; zz += pas) bx(ep, Hc, hb.lame, sx * (Wc / 2 - ep / 2), yb + Hc / 2, zz); bx(ep, Hc, ep, sx * (Wc / 2 - ep / 2), yb + Hc / 2, zBack + Dc - ep / 2); }
        else bx(ep, Hc, Dc, sx * (Wc / 2 - ep / 2), yb + Hc / 2, zBack + Dc / 2);
      }
      // dessus et dessous : lames parallèles au mur
      for (const [on, yy] of [[hb.faces.dessus, yb + Hc - ep / 2], [hb.faces.dessous, yb + ep / 2]]) {
        if (!on) { bx(Wc - 2 * ep, ep, Dc, 0, yy, zBack + Dc / 2); continue; }
        for (let zz = zBack + hb.lame / 2; zz <= zBack + Dc - hb.lame / 2 + 1; zz += pas) bx(Wc - 2 * ep, ep, hb.lame, 0, yy, Math.min(zz, zBack + Dc - hb.lame / 2));
      }
      // façade démontable : cadre + lames horizontales
      const zf = zBack + Dc - ep / 2;
      bx(Wc - 2 * ep, hb.lame, ep, 0, yb + ep + hb.lame / 2, zf); bx(Wc - 2 * ep, hb.lame, ep, 0, yb + Hc - ep - hb.lame / 2, zf);
      if (hb.faces.avant) for (let yy = yb + ep + hb.lame + pas - hb.lame / 2; yy < yb + Hc - ep - hb.lame - hb.lame / 2; yy += pas) bx(Wc - 2 * ep, hb.lame, ep, 0, yy, zf);
      else bx(Wc - 2 * ep, Hc - 2 * ep - 2 * hb.lame, ep, 0, yb + Hc / 2, zf);
      cg.userData.info = 'Habillage bois du déshumidificateur — ' + hb.essence + ', ' + Math.round(Wc) / 10 + ' × ' + Math.round(Hc) / 10 + ' × ' + Math.round(Dc) / 10 + ' cm, claire-voie ' + Math.round(hb.vide * 100) + ' %';
      g.add(cg);
      // emprise en plan du caisson (repère SketchUp) et hauteurs
      const ux = along ? [1, 0] : [0, 1]; // direction le long du mur
      const back = { x: c.x - nrm[0] * D / 2, y: c.y - nrm[1] * D / 2 }, front = { x: back.x + nrm[0] * Dc, y: back.y + nrm[1] * Dc };
      const xs = [back.x - ux[0] * Wc / 2, back.x + ux[0] * Wc / 2, front.x - ux[0] * Wc / 2, front.x + ux[0] * Wc / 2], ys = [back.y - ux[1] * Wc / 2, back.y + ux[1] * Wc / 2, front.y - ux[1] * Wc / 2, front.y + ux[1] * Wc / 2];
      caisson = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), z0: fl + yb, z1: fl + yb + Hc, Wc, Hc, Dc, hb };
    }
    g.position.copy(P(c.x, c.y, fl)); g.rotation.y = Math.atan2(nrm[0], -nrm[1]); poeleGroup.add(g);
    g.userData = { info: c.nom + ' — ' + W / 10 + ' × ' + D / 10 + ' × ' + H / 10 + ' cm' + (zb ? ', mural, bas à ' + (zb / 1000).toFixed(2).replace('.', ',') + ' m du sol' : '') + (caisson ? ', sous habillage bois' : ''), kind: 'deshum' };
    // emprise : obstacle de circulation (un appareil mural sous 2 m reste un obstacle à hauteur de corps)
    const emp = caisson || box;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const x = cellX(i), y = cellY(j); if (x >= emp.x0 && x <= emp.x1 && y >= emp.y0 && y <= emp.y1) furn[idx(i, j)] = 1; }
    deshum = { cfg: c, box, fl, along, caisson, emp };
  }
  const setPoeles = (on) => { MAT_POELE.braise.emissiveIntensity = on ? (pres ? 0.9 : 1.4) : 0; poeles.forEach((p) => { p.light.intensity = on ? 1.6 : 0; }); };

  // ------------------------------------------------------------------ suspensions industrielles (LAYOUT.suspensions)
  const suspGroup = new THREE.Group(); scene.add(suspGroup); const suspLights = new THREE.Group(); suspLights.visible = false; scene.add(suspLights); const susps = [];
  const MAT_ROUILLE = new THREE.MeshStandardMaterial({ color: 0x7b3f1e, roughness: 0.8, metalness: 0.55 });
  const MAT_BULBE = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffa040, emissiveIntensity: 0.15, transparent: true, opacity: 0.85, roughness: 0.1 });
  if (L.suspension) (L.suspensions || []).forEach((c) => {
    const md = L.suspension, R = md.D / 2000, Hs = md.H / 1000, ch = (md.chaine || 0) / 1000;
    const zc = ceilingAt(c.x, c.y), plaf = (isNaN(zc) ? 5070 : zc) + 120; // fixation sur les lames, entre les solives
    const g = new THREE.Group(); g.position.copy(P(c.x, c.y, plaf));
    const rosace = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.03, 24), MAT_ROUILLE); rosace.position.y = -0.015; g.add(rosace);
    const nl = Math.max(2, Math.round(ch / 0.028));
    for (let i = 0; i < nl; i++) { const lk = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0025, 6, 12), MAT_ROUILLE); lk.scale.set(1, 1.6, 1); lk.position.y = -0.03 - (i + 0.5) * ch / nl; lk.rotation.y = i % 2 ? Math.PI / 2 : 0; g.add(lk); }
    const top = -0.03 - ch; // haut de l'abat-jour
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, R, 0.05, 32, 1, true), MAT_ROUILLE); cap.position.y = top - 0.025; g.add(cap);
    const capTop = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), MAT_ROUILLE); capTop.rotation.x = -Math.PI / 2; capTop.position.y = top; g.add(capTop);
    for (const fy of [0.05, 0.5, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.006, 6, 40), MAT_ROUILLE); ring.rotation.x = Math.PI / 2; ring.position.y = top - 0.05 - (Hs - 0.05) * fy; g.add(ring); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, Hs - 0.05, 6), MAT_ROUILLE); bar.position.set(Math.cos(a) * R, top - 0.05 - (Hs - 0.05) / 2, Math.sin(a) * R); g.add(bar); }
    const douille = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 16), MAT_ROUILLE); douille.position.y = top - 0.08; g.add(douille);
    const bulbe = new THREE.Mesh(new THREE.SphereGeometry(0.032, 20, 14), MAT_BULBE); bulbe.scale.set(1, 1.35, 1); bulbe.position.y = top - 0.15; g.add(bulbe);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.userData = { info: c.nom + ' — ' + md.nom + ', Ø ' + md.D / 10 + ' × ' + md.H / 10 + ' cm, chaîne ' + (md.chaine / 10) + ' cm, ' + md.douille, kind: 'suspension' };
    suspGroup.add(g);
    const pl = new THREE.PointLight(0xffb36b, 0.75, 5.5, 2); pl.position.copy(P(c.x, c.y, plaf + (top - 0.15) * 1000)); suspLights.add(pl);
    const bas = plaf + (top - Hs) * 1000; // cote du bas de l'abat-jour (mm)
    susps.push({ cfg: c, bas, fl: floorAt(c.x, c.y), plaf, R: md.D / 2 });
  });

  // ------------------------------------------------------------------ frigidarium : fumée au sol, lumière bleue, rivière en contrebas (LAYOUT.frigidarium)
  const frigo = L.frigidarium || null; const frigoGroup = new THREE.Group(); scene.add(frigoGroup); const fogLayers = [], frigoLights = []; let waterTex = null;
  if (frigo) {
    // fumée : nappes translucides animées, posées sur le sol du frigidarium (cellules de 10 cm de la grille d'analyse)
    const pos = [], uv = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const x = cellX(i), y = cellY(j), h = floorH[idx(i, j)]; if (isNaN(h) || x < frigo.x0) continue;
      const cs = [[x - 50, y - 50], [x + 50, y - 50], [x + 50, y + 50], [x - 50, y + 50]];
      [0, 1, 2, 0, 2, 3].forEach((k) => { const q = P(cs[k][0], cs[k][1], h); pos.push(q.x, q.y, q.z); uv.push(cs[k][0] / 2500, cs[k][1] / 2500); });
    }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const fogTex = TEXTURES.fog();
    [[0.03, 0.30], [0.09, 0.24], [0.16, 0.18], [0.24, 0.13], [0.33, 0.08], [0.43, 0.04]].forEach(([dy, op], i) => {
      const t = fogTex.clone(); t.needsUpdate = true; t.repeat.set(1 + i * 0.17, 1 + i * 0.11); t.offset.set(i * 0.37, i * 0.21);
      const m = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ map: t, color: 0x5a86c8, transparent: true, opacity: op * 1.3, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      m.position.y = dy; m.renderOrder = 2; m.userData.info = 'Fumée au sol (frigidarium)'; frigoGroup.add(m);
      fogLayers.push({ t, vx: (i % 2 ? -1 : 1) * (0.010 + i * 0.004), vy: 0.005 * ((i % 3) - 1) });
    });
    // lumière bleue : au ras du sol (éclaire la fumée) et vers la voûte encroûtée de sel
    frigo.lumieres.forEach(([x, y, z, k]) => { const l = new THREE.PointLight(frigo.couleur, k, 2.8, 1.5); l.position.copy(P(x, y, z)); l.userData.k = k; frigoLights.push(l); frigoGroup.add(l); });
    // arc sud : vitrage fixe et rivière en contrebas
    if (frigo.arc) {
      const a0 = frigo.arc[0], shp = new THREE.Shape(frigo.arc.map(([x, z]) => new THREE.Vector2((x - a0[0]) / 1000, (z - a0[1]) / 1000)));
      const gl = new THREE.Mesh(new THREE.ShapeGeometry(shp), MAT.glass); gl.position.copy(P(a0[0], 1767, a0[1])); gl.userData.info = 'Arc sud du frigidarium — vitrage fixe (hypothèse), vue sur la rivière'; frigoGroup.add(gl);
    }
    const rv = frigo.riviere;
    if (rv) {
      waterTex = TEXTURES.water(); waterTex.encoding = THREE.sRGBEncoding; const W = (rv.x1 - rv.x0) / 1000, D = (rv.yBerge - rv.yLoin) / 1000; waterTex.repeat.set(W / 3, D / 3);
      const water = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: waterTex, color: 0x7fa3a8, roughness: 0.12, metalness: 0.25, emissive: 0x3f7f8c, emissiveMap: waterTex, emissiveIntensity: 0.75 }));
      water.rotation.x = -Math.PI / 2; water.position.copy(P((rv.x0 + rv.x1) / 2, (rv.yBerge + rv.yLoin) / 2, rv.z)); water.userData.info = 'Rivière en contrebas (niveau supposé)'; dehorsGroup.add(water);
      const rock = std(TX.stone, { color: 0x6c7276, emissive: 0x262e32, emissiveIntensity: 1 }), galet = new THREE.MeshStandardMaterial({ color: 0x3b3e3c, emissive: 0x111513, roughness: 0.9 });
      const quad = (pts, mat) => { // 4 points plan (x, y, z) mm
        const g = new THREE.BufferGeometry(), v = pts.map((q) => P(...q)); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 1, 2, 0, 2, 3].flatMap((k) => [v[k].x, v[k].y, v[k].z]), 3));
        const sm = TX.stone.userData.meters; g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 2, 0, 2, 3].flatMap((k) => [pts[k][0] / 1000 / sm, (pts[k][2] + pts[k][1] * 0.3) / 1000 / sm]), 2)); g.computeVertexNormals();
        const m = new THREE.Mesh(g, mat); dehorsGroup.add(m); return m;
      };
      quad([[rv.x0, 1692, 2340], [rv.x1, 1692, 2340], [rv.x1, rv.yBerge, rv.z], [rv.x0, rv.yBerge, rv.z]], rock); // berge sous le bâtiment (mur de quai)
      quad([[rv.x0, rv.yLoin, rv.z], [rv.x1, rv.yLoin, rv.z], [rv.x1, rv.yLoin - 2500, rv.z + 6000], [rv.x0, rv.yLoin - 2500, rv.z + 6000]], std(TX.stone, { color: 0x4c5c46, emissive: 0x1a2a18, emissiveIntensity: 1 })); // rive opposée, végétation
      const ciel = new THREE.Mesh(new THREE.PlaneGeometry(W, 12), new THREE.MeshBasicMaterial({ color: 0xbcd0d8 })); ciel.position.copy(P((rv.x0 + rv.x1) / 2, rv.yLoin - 2600, rv.z + 9000)); ceilings.add(ciel); // jour au-dessus de la rive
      const rr = (() => { let q = 77; return () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296); })();
      for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 + rr() * 0.5, 1), galet); const near = rr() < 0.6; b.position.copy(P(rv.x0 + rr() * (rv.x1 - rv.x0), near ? rv.yBerge - rr() * 900 : rv.yLoin + rr() * 900, rv.z + 80)); b.scale.y = 0.55; b.rotation.set(rr() * 3, rr() * 3, rr() * 3); dehorsGroup.add(b); }
    }
  }
  function animFrigo(dt) { if (!frigoGroup.visible) return; fogLayers.forEach((f) => { f.t.offset.x += f.vx * dt; f.t.offset.y += f.vy * dt; }); if (waterTex) waterTex.offset.x -= 0.06 * dt; }

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


  // ------------------------------------------------------------------ radiants IR (modèle + pose au choix) + volumes de sécurité
  const irGroup = new THREE.Group(); scene.add(irGroup); let irs = [];
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } } };
  let irKey = store.get('grotte.ir'); if (!IR_MODELES[irKey]) irKey = L.irModele && IR_MODELES[L.irModele] ? L.irModele : Object.keys(IR_MODELES)[0];
  let irPose = ['mur', 'plafond', 'aucun'].includes(store.get('grotte.pose')) ? store.get('grotte.pose') : (L.chauffage === 'poeles' ? 'aucun' : 'plafond');
  const irM = () => IR_MODELES[irKey];
  const NORM = { N: [0, 1], S: [0, -1], E: [1, 0], O: [-1, 0] }; // direction du rayonnement (vers la pièce)
  function buildIR() {
    irGroup.clear(); irs = []; const md = irM(); if (irPose === 'aucun') return;
    MAT.irFace.color.setHex(md.lueur ? 0x1a0400 : 0xe8e8e6); // verre sombre pour les lampes, face blanche pour les panneaux
    const list = irPose === 'mur' ? (L.irMur[irKey] || L.irMur.defaut) : L.ir;
    list.forEach((c) => {
      const nn0 = irPose === 'mur' ? NORM[c.face] : [0, 0];
      // sol et plafond lus 30 cm devant le mur (au pied du mur, la grille tombe sur l'épaisseur du mur)
      const fl = floorAt(c.x + nn0[0] * 300, c.y + nn0[1] * 300); const ceil = ceilingAt(c.x + nn0[0] * 300, c.y + nn0[1] * 300);
      let box, g, gapTop = 0, top, bottom, n = null;
      if (irPose === 'mur') {
        // appareil plaqué au mur, largeur le long du mur, calé le plus haut permis par la notice (plus loin du mobilier)
        n = NORM[c.face]; const W = md.murL || md.L, H = md.murH || md.l, D = md.murP || md.h;
        bottom = fl + Math.max(md.murSol || 0, (ceil - fl) - (md.murHaut || 0) - H); top = bottom + H;
        const cx = c.x + n[0] * D / 2, cy = c.y + n[1] * D / 2;
        const along = n[0] === 0; // mur est-ouest : largeur selon X
        box = { x0: cx - (along ? W : D) / 2, x1: cx + (along ? W : D) / 2, y0: cy - (along ? D : W) / 2, y1: cy + (along ? D : W) / 2, z0: bottom, z1: top };
        g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(W / 1000, H / 1000, D / 1000), md.couleur === 'noir' ? MAT.irBody : MAT.irPanel); g.add(b);
        const face = new THREE.Mesh(new THREE.PlaneGeometry(W / 1000 * 0.92, H / 1000 * 0.8), MAT.irFace); face.position.z = D / 2000 + 0.002; g.add(face);
        g.position.copy(P(cx, cy, bottom + H / 2)); g.rotation.y = Math.atan2(n[0], -n[1]);
      } else {
        gapTop = md.ecartPlafond || 0; top = (isNaN(ceil) ? 5070 : ceil) - gapTop; bottom = top - md.h;
        box = { x0: c.x - md.L / 2, x1: c.x + md.L / 2, y0: c.y - md.l / 2, y1: c.y + md.l / 2, z0: bottom, z1: top };
        if (md.forme === 'rond') g = FURNITURE.ir(MAT);
        else {
          g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(md.L / 1000, md.h / 1000, md.l / 1000), md.couleur === 'noir' ? MAT.irBody : MAT.irPanel); b.position.y = md.h / 2000; g.add(b);
          const face = new THREE.Mesh(new THREE.PlaneGeometry(md.L / 1000 * 0.94, md.l / 1000 * 0.94), MAT.irFace); face.rotation.x = Math.PI / 2; face.position.y = -0.001; g.add(face);
        }
        g.position.copy(P(c.x, c.y, bottom));
        if (gapTop > 20) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, gapTop / 1000, 4), MAT.rail); ch.position.copy(P(c.x, c.y, top + gapTop / 2)); irGroup.add(ch); }
      }
      irGroup.add(g);
      // volume de sécurité : distance aux matériaux inflammables devant la face rayonnante
      const dI = Math.max(50, (irPose === 'mur' ? md.murInflammable : md.minInflammable) || 0);
      let vol;
      const vm = new THREE.MeshBasicMaterial({ color: 0x33cc66, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
      if (irPose === 'mur') { const vb = { x0: box.x0 - (n[0] ? 0 : 0), x1: box.x1, y0: box.y0, y1: box.y1 }; const ext = (a0, a1, d) => [Math.min(a0, a0 + d), Math.max(a1, a1 + d)];
        const [vx0, vx1] = n[0] ? (n[0] > 0 ? [box.x1, box.x1 + dI] : [box.x0 - dI, box.x0]) : [vb.x0, vb.x1]; const [vy0, vy1] = n[1] ? (n[1] > 0 ? [box.y1, box.y1 + dI] : [box.y0 - dI, box.y0]) : [vb.y0, vb.y1]; void ext;
        vol = new THREE.Mesh(new THREE.BoxGeometry((vx1 - vx0) / 1000, (box.z1 - box.z0 + dI) / 1000, (vy1 - vy0) / 1000), vm); vol.position.copy(P((vx0 + vx1) / 2, (vy0 + vy1) / 2, (box.z0 - dI / 2 + box.z1) / 2));
      } else { const rr = Math.max(md.L, md.l) / 2000 + dI / 1000; vol = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, dI / 1000, 32, 1, true), vm); vol.position.copy(P(c.x, c.y, bottom - dI / 2)); }
      vol.visible = $('tSafe').checked; irGroup.add(vol);
      const light = new THREE.PointLight(0xff5a1e, 0, 3.5, 2); light.position.copy(P(c.x + (n ? n[0] * 300 : 0), c.y + (n ? n[1] * 300 : 0), bottom - 100)); irGroup.add(light);
      g.userData = { info: c.nom + ' — ' + md.nom + ', ' + md.P + ' W, ' + md.IP + (irPose === 'mur' ? ', pose murale' : ', pose plafond'), kind: 'ir' };
      irs.push({ cfg: c, g, vol, light, ceil, fl, top, bottom, gapTop, box, n });
    });
  }
  buildIR();


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
    // accès à chaque place : le côté le plus proche qui est relié à l'entrée
    seats.forEach((st) => { const cands = st.approaches.slice().sort((a, b) => Math.hypot(a.x - st.x, a.y - st.y) - Math.hypot(b.x - st.x, b.y - st.y)); const ok = cands.find((c) => route(L.simulation.entree.x, L.simulation.entree.y, c.x, c.y) && Math.hypot(nearestPassable(c.x, c.y) ? 0 : 1e9, 0) === 0 && (() => { const np = nearestPassable(c.x, c.y); return np && Math.hypot(cellX(np[0]) - c.x, cellY(np[1]) - c.y) < 400 && Math.abs(floorH[idx(np[0], np[1])] - floorAt(st.x, st.y)) < 100; })()); if (ok) st.approach = ok; });
    // Escalier (valeurs lues sur le modèle SketchUp)
    const stW = 4272 - 3542, riser1 = 2870 - 2720, riser2 = 2720 - 2570, giron = 9336 - 9066;
    add('Escalier', 'Largeur de l\'escalier (entre parois)', stW >= 900 ? 'OK' : 'NOK', fmt(stW), '≥ 0,90 m (1 UP) ; ERP existant PMR : 1,00 m entre mains courantes', 'Avec 2 mains courantes, passage réel ≈ ' + fmt(stW - 2 * 60) + '. Élargir l\'emmarchement à ≥ 1,00 m ou réserver l\'accès à un flux alterné.');
    add('Escalier', 'Hauteur des marches', Math.max(riser1, riser2) <= 170 ? 'OK' : 'NOK', riser1 / 10 + ' cm et ' + riser2 / 10 + ' cm', '≤ 17 cm (ERP existant) / ≤ 16 cm (neuf)');
    add('Escalier', 'Giron', giron >= 280 ? 'OK' : 'NOK', giron / 10 + ' cm', '≥ 28 cm', 'Allonger la marche intermédiaire de 1 cm minimum (28 cm).');
    add('Escalier', 'Mains courantes', L.rampes.length >= 2 ? 'OK' : 'A VOIR', L.rampes.length + ' modélisée(s), h = 0,90 m, arrêtées ' + fmt(Math.max(...L.rampes.map((r) => r.x1)) - 9336) + ' après le nez de la dernière marche', 'Obligatoire des 2 côtés à partir de 3 marches ; ici 2 marches + chute latérale de 30 cm sur l\'avancée → recommandées des 2 côtés', 'En bas, pas de prolongement horizontal d\'une marche : il barrait le passage vers les canapés et les poêles, et le texte ne l\'impose pas quand il crée un obstacle aux circulations horizontales (à faire valider). Prévoir aussi : nez de marche contrastés antidérapants, contremarches contrastées 1re/dernière, bande d\'éveil de vigilance en haut (0,50 m avant la 1re marche).');
    add('Escalier', 'Avancée haute (palier étroit) avec chute latérale', 'A VOIR', 'Avancée de ' + fmt(9066 - 8283) + ' × ' + fmt(stW) + ', chute 30 cm de chaque côté', 'Pas de garde-corps exigé < 1 m de chute', 'Les mains courantes servent de protection : à prolonger sur toute l\'avancée (fait dans la 3D).');
    // Porte de grotte
    const dW = 4274 - 3470, gap = 10054 - 9336;
    add('Grotte', 'Largeur de la porte grotte → frigidarium', dW >= 800 ? 'OK' : 'NOK', fmt(dW) + ' (passage utile ≈ ' + fmt(dW - 30) + ')', 'Local < 20 pers. : 0,80 m toléré (CO) ; PMR ERP existant : 0,77 m utile');
    const gD = doors.find((d) => d.cfg.id === 'frigidarium');
    add('Grotte', 'Recul entre dernière marche et porte du frigidarium', gD && gD.cfg.ouvre > 0 ? 'OK' : 'NOK', fmt(gap), 'Le vantail (' + fmt(dW) + ') ne doit pas balayer l\'escalier', gD && gD.cfg.ouvre > 0 ? 'Porte ouvrant côté frigidarium : ne gêne pas l\'escalier. Si elle ouvre vers l\'escalier, le vantail déborde de ' + fmt(dW - gap) + '.' : 'Inverser le sens d\'ouverture.');
    add('Accessibilité', 'Accès PMR à la grotte', 'NOK', 'Dénivelé ' + fmt(2870 - 2570) + ' franchi uniquement par 2 marches', 'Rampe ≤ 5 % → ' + fmt(300 / 0.05) + ' de long + paliers', 'Pas la place pour une rampe : élévateur PMR ou demande de dérogation (motif : bâti existant / contraintes techniques).');
    const nSeatsCave = seats.filter((s) => s.zone === 'grotte').length;
    const sorties = L.portes.filter((d) => d.sortie);
    add('Grotte', 'Effectif et nombre de sorties', nSeatsCave < 20 ? (nSeatsCave >= 18 && sorties.length < 2 ? 'A VOIR' : 'OK') : (sorties.length >= 2 ? 'A VOIR' : 'NOK'), nSeatsCave + ' places assises/allongées + personnel ; ' + sorties.length + ' sortie(s) : ' + sorties.map((d) => d.nom.replace(/ \(.*\)$/, '') + ' ' + fmt(d.largeur)).join(' + '), '< 20 pers. : 1 dégagement suffit ; de 20 à 50 : 2 dégagements, dont un peut être accessoire', sorties.length >= 2 ? 'Avec l\'issue de secours de l\'alcôve, la grotte a 2 dégagements dans des directions opposées.' : (nSeatsCave >= 18 ? 'À la limite des 20 personnes avec l\'accompagnant : plafonner l\'effectif affiché à 19 personnes, personnel compris.' : ''));
    const dSec = L.portes.find((d) => d.cintree && d.sortie);
    if (dSec && L.simulation.secours) {
      const sc = L.simulation.secours; let wMin = 1e9, far = null, farL = 0;
      seats.filter((st) => st.zone === 'grotte').forEach((st) => { const pth = route(st.approach.x, st.approach.y, sc.x, sc.y); if (!pth) return; let l = 0; for (let i = 1; i < pth.length; i++) l += Math.hypot(pth[i].x - pth[i - 1].x, pth[i].y - pth[i - 1].y); if (l > farL) { farL = l; far = st; }
        for (const k of pth.raw) { const x = cellX(k % NX), yy = cellY(Math.floor(k / NX)); if (x > 8200 && x < 9700 && yy > 3450 && yy < 4350) continue; if (Math.hypot(x - st.approach.x, yy - st.approach.y) < 400 || Math.hypot(x - sc.x, yy - sc.y) < 300) continue; wMin = Math.min(wMin, widthAt(k)); } });
      const lwS = dSec.largeur / dSec.vantaux, libre = lwS - 50;
      add('Dégagements', 'Issue de secours de l\'alcôve', dSec.estime ? 'A VOIR' : libre >= 800 ? 'OK' : 'NOK', 'ensemble alu cintré sous la voûte : ' + dSec.vantaux + ' vantaux de ' + fmt(lwS) + (dSec.fixes ? ' + 2 fixes de ' + fmt(dSec.fixes) : '') + (dSec.estime ? ' (cotes estimées sur photo)' : '') + ' ; vantail actif ≈ ' + fmt(libre) + ' de passage libre ; ouvre vers la ruelle ; cheminement ≥ ' + fmt(wMin) + ' depuis toutes les places, ' + fmt(farL) + ' depuis la plus éloignée', 'Grotte < 20 personnes : porte ≥ 0,80 m (0,90 m pour 1 UP), barre antipanique, BAES, ouverture sans clé', 'Mesurer le vantail actif. S\'il laisse moins de 0,80 m, équiper aussi le 2e vantail d\'une barre antipanique (passage ≈ ' + fmt(dSec.largeur - 100) + '). Garder le passage libre entre le déshumidificateur et le banc.');
      const dEnt = L.portes.find((d) => d.arche);
      if (dEnt && dEnt.antipanique === 'ouest') {
        const e = L.simulation.entree, pth = route(e.x, e.y, sc.x, sc.y); let wT = 1e9, lT = 0;
        if (pth) { for (let i = 1; i < pth.length; i++) lT += Math.hypot(pth[i].x - pth[i - 1].x, pth[i].y - pth[i - 1].y); for (const k of pth.raw) { const x = cellX(k % NX), yy = cellY(Math.floor(k / NX)); if (Math.hypot(x - e.x, yy - e.y) < 500 || Math.hypot(x - sc.x, yy - sc.y) < 300) continue; wT = Math.min(wT, widthAt(k)); } }
        add('Dégagements', 'Traversée de la grotte par l\'évacuation de la salle carrelée', pth ? (wT >= 900 ? 'A VOIR' : 'NOK') : 'NOK', 'barre antipanique de l\'arche d\'entrée côté salle carrelée (photo) : chemin arche → issue de secours de ' + fmt(lT) + ', largeur mini ≈ ' + fmt(wT), '≥ 0,90 m, ou la largeur imposée par l\'effectif de la salle carrelée ; chemin toujours libre ; portes ouvrables sans clé pendant l\'ouverture au public', 'À confirmer avec le bureau de contrôle : l\'effectif de la salle carrelée et le fait que la grotte serve de dégagement. Le mobilier sur ce chemin (fauteuils, banc, déshumidificateur) doit rester hors du passage.');
      }
    }
    // Dégagements le long du parcours
    let worst = null;
    seats.filter((s) => s.zone === 'grotte').forEach((st) => {
      const pA = route(L.simulation.entree.x, L.simulation.entree.y, st.approach.x, st.approach.y);
      if (!pA) { worst = { w: -1, st }; return; }
      let minW = 1e9, minK = -1;
      for (const k of pA.raw) {
        const x = cellX(k % NX), yy = cellY(Math.floor(k / NX));
        if (Math.hypot(x - L.simulation.entree.x, yy - L.simulation.entree.y) < 900) continue; /* seuil de porte */
        if (x > 8200 && x < 9700 && yy > 3450 && yy < 4350) continue; /* escalier : mesuré à part */
        if (Math.hypot(x - st.approach.x, yy - st.approach.y) < 400) continue; /* accès final à l'assise */
        const w = widthAt(k); if (w < minW) { minW = w; minK = k; }
      }
      if (!worst || (worst.w >= 0 && minW < worst.w)) worst = { w: minW, k: minK, st };
    });
    if (worst && worst.w >= 0) {
      const where = (k) => '(X ' + Math.round(cellX(k % NX)) + ', Y ' + Math.round(cellY(Math.floor(k / NX))) + ')';
      add('Dégagements', 'Largeur mini des cheminements porte → chaque place', worst.w >= 900 ? 'OK' : 'NOK', '≈ ' + fmt(worst.w) + ' ' + where(worst.k) + ', vers « ' + worst.st.item.cfg.nom + ' »', '≥ 0,90 m (1 UP)', 'Calcul sur grille de 10 cm entre murs, mobilier et bords de niveau (± 10 cm). Calque « Carte des dégagements » pour localiser.');
    } else add('Dégagements', 'Cheminements porte → places', 'NOK', worst ? 'aucun chemin vers « ' + worst.st.item.cfg.nom + ' »' : '—', 'Toutes les places doivent être accessibles');
    // Cercle de giration Ø1,50 dans la grotte
    let best = null; for (let k = 0; k < NX * NY; k++) { const x = cellX(k % NX); if (x < 3103 || x > 10054 || cellY(Math.floor(k / NX)) < 1901 || !passable(k)) continue; if (!best || dist[k] > dist[best]) best = k; }
    const okCircle = best !== null && dist[best] - CELL / 2 >= 750;
    add('Accessibilité', 'Espace de manœuvre Ø 1,50 m dans la grotte', okCircle ? 'OK' : 'NOK', best !== null ? 'Ø libre max ≈ ' + fmt(2 * dist[best] - CELL) : '—', 'Ø 1,50 m');
    if (best !== null) { turning.position.copy(P(cellX(best % NX), cellY(Math.floor(best / NX)), floorH[best] + 20)); turning.visible = okCircle; }
    const boxDist = (a, b) => Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.y0 - b.y1, b.y0 - a.y1), Math.max(0, a.z0 - b.z1, b.z0 - a.z1));
    if (irPose !== 'aucun') {
    // IR
    const md = irM(); const mur = irPose === 'mur';
    const poseOK = mur ? md.murOK : md.plafondOK !== false;
    const ref = (v) => (v === null || v === undefined ? 'non indiqué par la notice' : '≥ ' + fmt(v));
    const st = (v, m) => (m === null || m === undefined ? 'A VOIR' : v >= m ? 'OK' : 'NOK');
    if (!mur && md.hPose) { let dmin = 1e9; irs.forEach((p, i) => irs.forEach((q, j) => { if (j > i) dmin = Math.min(dmin, Math.hypot(p.cfg.x - q.cfg.x, p.cfg.y - q.cfg.y) - Math.max(md.L, md.l)); })); add('Radiants IR', 'Distance entre panneaux', dmin >= 600 ? 'OK' : 'NOK', fmt(dmin), '≥ 0,60 m (notice Fenix)'); }
    irs.forEach((r) => {
      const name = r.cfg.nom; const hLibre = r.ceil - r.fl;
      // distance aux murs (hors mur porteur en pose murale) depuis l'emprise de l'appareil
      let side = 1e9;
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
        const k = idx(i, j); if (!(wall[k] || isNaN(floorH[k]))) continue; const x = cellX(i), y = cellY(j);
        if (mur) { const nn = (x - r.cfg.x) * r.n[0] + (y - r.cfg.y) * r.n[1]; if (nn < 150) continue; }
        const d = Math.hypot(Math.max(0, r.box.x0 - x, x - r.box.x1), Math.max(0, r.box.y0 - y, y - r.box.y1)) - CELL / 2; if (d < side) side = d;
      }
      let fd = 1e9, fname = '';
      items.forEach((it) => { const xs = it.poly.map((p) => p[0]), ys = it.poly.map((p) => p[1]); const fb = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), z0: it.h, z1: it.h + (it.T.Hdos || it.T.H) * 1000 }; const d = boxDist(r.box, fb); if (d < fd) { fd = d; fname = it.cfg.nom; } });
      let sH, refH, sL, sF, refF, refL;
      if (mur) {
        const sous = r.bottom - r.fl, dessus = r.ceil - r.top;
        sH = sous >= (md.murSol || 0) && dessus >= (md.murHaut || 0) ? 'OK' : 'NOK';
        add('Radiants IR', name + ' : hauteur de pose murale', sH, fmt(sous) + ' sous l\'appareil, ' + fmt(dessus) + ' jusqu\'au plafond (hauteur libre ' + fmt(hLibre) + ')', md.nom + ' au mur : sol ' + ref(md.murSol) + ', plafond ' + ref(md.murHaut) + ' ; calé au plus haut permis');
        sL = st(side, md.murCotes); refL = ref(md.murCotes) + ' sur les côtés';
        const inco = md.murInflammable === null || md.murInflammable === undefined; const fmin = Math.max(md.murInflammable || 0, md.murAvant || 0); sF = st(fd, inco ? null : fmin); refF = inco ? 'distance aux combustibles non chiffrée par la notice' : ref(fmin) + ' devant (objets et matériaux inflammables)';
      } else {
        const below = r.bottom - r.fl;
        if (md.hPose) sH = hLibre >= md.hPose - 5 ? 'OK' : 'NOK';
        else if (md.minSousAppareil !== null && md.minSousAppareil !== undefined) sH = below >= md.minSousAppareil && r.gapTop >= (md.ecartPlafond || 0) ? 'OK' : 'NOK';
        else sH = 'A VOIR';
        add('Radiants IR', name + ' : hauteur de pose', sH, fmt(below) + ' sous l\'appareil, ' + fmt(r.gapTop) + ' au plafond (hauteur libre ' + fmt(hLibre) + ')', md.nom + ' : ' + (md.hPose ? 'hauteur de pose ' + fmt(md.hPose) : 'sous l\'appareil ' + ref(md.minSousAppareil)) + ', au plafond ' + (md.ecartPlafond ? '≥ ' + fmt(md.ecartPlafond) : 'fixation sur cadre'));
        sL = st(side, md.minLateral); refL = ref(md.minLateral);
        sF = st(fd, md.minInflammable); refF = ref(md.minInflammable) + ' de la face rayonnante';
      }
      add('Radiants IR', name + ' : distance aux murs', sL, fmt(side), refL);
      add('Radiants IR', name + ' : distance au mobilier en cèdre', sF, fmt(fd) + ' (' + fname + ')', refF);
      r.ok = poseOK && sH === 'OK' && sL !== 'NOK' && sF !== 'NOK'; r.vol.material.color.set(r.ok ? 0x33cc66 : 0xe03131);
    });
    const ipEau = +(md.IP.match(/IP[\dX](\d)/) || [0, 0])[1];
    const supportOK = mur ? true : md.plafondBois !== false;
    add('Radiants IR', 'Modèle : ' + md.nom + (mur ? ' (pose murale)' : ' (pose plafond)'), poseOK && md.interieur && supportOK && ipEau >= 4 ? ((mur ? md.murInflammable !== null && md.murInflammable !== undefined : md.plafondBois) ? 'OK' : 'A VOIR') : 'NOK',
      md.P + ' W, ' + md.IP + ', ' + (md.interieur ? 'usage intérieur prévu' : md.interieur === null ? 'usage intérieur non indiqué' : 'usage intérieur non prévu (notice : extérieur couvert)') + ', ' + (poseOK ? 'pose ' + (mur ? 'murale' : 'plafond') + ' autorisée' : 'pose ' + (mur ? 'murale' : 'au plafond') + ' NON autorisée par la notice') + (mur ? '' : ', plafond bois : ' + (md.plafondBois === true ? 'autorisé' : md.plafondBois === false ? 'non autorisé' : 'non précisé')),
      'Pose autorisée, usage intérieur, IP x4 mini — notice : ' + md.source, md.note || '');
    }
    // Poêles de sauna
    if (poeles.length) {
      const pm = L.poele; const refP = (v) => (v === null || v === undefined ? 'à reprendre dans la notice du modèle retenu' : '≥ ' + fmt(v));
      const stP = (v, m) => (m === null || m === undefined ? 'A VOIR' : v >= m ? 'OK' : 'NOK');
      poeles.forEach((p) => {
        const nm = p.cfg.nom; const ceil = ceilingAt(p.cfg.x + p.n[0] * 300, p.cfg.y + p.n[1] * 300);
        const dPl = ceil - p.box.z1;
        add('Poêles de sauna', nm + ' : distance au plafond bois', stP(dPl, pm.distPlafond), fmt(dPl) + ' du dessus du poêle au plafond (hauteur libre ' + fmt(ceil - p.fl) + ')', 'Notice : ' + refP(pm.distPlafond));
        // devant : mobilier en cèdre
        let fd = 1e9, fname = '';
        items.forEach((it) => { const xs = it.poly.map((q) => q[0]), ys = it.poly.map((q) => q[1]); const fb = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), z0: it.h, z1: it.h + (it.T.Hdos || it.T.H) * 1000 }; const d = boxDist(p.box, fb); if (d < fd) { fd = d; fname = it.cfg.nom; } });
        add('Poêles de sauna', nm + ' : distance au banc en cèdre devant', stP(fd, pm.distAvant), fmt(fd) + ' (' + fname + ')', 'Notice : ' + refP(pm.distAvant) + ' devant', 'Espace pour les jambes entre le banc et le garde-corps du poêle : ' + fmt(fd - (pm.gardeCorps ? 100 : 0)) + '.');
        // côtés : murs de sel et tableau de porte (calcul exact) ; arrière : mur porteur (plan du mur donné dans layout : murX / murY)
        const rect = (r) => Math.hypot(Math.max(0, p.box.x0 - r.x1, r.x0 - p.box.x1), Math.max(0, p.box.y0 - r.y1, r.y0 - p.box.y1));
        let side = Math.min(...L.mursSel.map((w) => rect(w)));
        const door = doors.find((d) => d.cfg.id === 'frigidarium');
        if (door) { const half = door.cfg.largeur / 2; side = Math.min(side, rect({ x0: door.cfg.x, x1: door.cfg.x, y0: door.cfg.y - half, y1: door.cfg.y + half })); }
        const back = p.cfg.murX !== undefined ? Math.abs(p.cfg.murX - (p.n[0] < 0 ? p.box.x1 : p.box.x0)) : Math.abs(p.cfg.murY - (p.n[1] < 0 ? p.box.y1 : p.box.y0));
        add('Poêles de sauna', nm + ' : distance sur les côtés (mur de sel, tableau de porte)', stP(side, pm.distCotes), fmt(side), 'Notice : ' + refP(pm.distCotes) + ' sur les côtés', 'Côté mur de sel : vérifier aussi la tenue des LED de rétro-éclairage à la chaleur.');
        add('Poêles de sauna', nm + ' : distance au mur arrière', stP(back, pm.distArriere), fmt(back), 'Notice : ' + refP(pm.distArriere));
        // porte du frigidarium voisine
        if (door) { const dy = Math.max(0, Math.max(p.box.y0, door.cfg.y - door.cfg.largeur / 2) - Math.min(p.box.y1, door.cfg.y + door.cfg.largeur / 2)); add('Poêles de sauna', nm + ' : écart avec la porte du frigidarium', dy >= 300 ? 'OK' : 'A VOIR', fmt(dy) + ' entre le poêle et l\'ouverture de la porte', 'Pas de poêle dans le passage ; garde-corps conseillé côté porte', 'Vitrage de la porte trempé obligatoire (choc thermique à côté des poêles), double vitrage conseillé.'); }
      });
      const Ptot = poeles.length * pm.P / 1000;
      add('Poêles de sauna', 'Puissance installée', Ptot >= 12 && Ptot <= 18 ? 'OK' : 'A VOIR', poeles.length + ' × ' + pm.P / 1000 + ' kW = ' + Ptot + ' kW pour ≈ 85 m³ (grotte + alcôve) à 35 °C', 'Bilan paroi par paroi : besoin en régime établi 3,0 / 4,9 / 7,5 kW (bas / central / haut) ; 12 kW conseillés avec l\'air neuf de la pièce d\'entrée ou une double flux, 15 à 18 kW si l\'air neuf est pris dehors sans récupération', 'La puissance sert à la mise en chauffe de la roche : garder la grotte chauffée en permanence (réduit de nuit ≥ 30 °C). Valider par un essai de co-chauffage avant de commander (docs/BILAN_THERMIQUE.md).');
      add('Poêles de sauna', 'Plage de volume du fabricant', pm.volMax ? (84.9 / poeles.length <= pm.volMax ? 'OK' : 'NOK') : 'A VOIR', '≈ 85 m³ pour ' + poeles.length + ' poêles, chauffés depuis la partie basse (19,5 m³) vers la salle haute (55 m³) et l\'alcôve ouverte (10,5 m³)', 'Notice : ' + (pm.volMax ? pm.volMin + ' à ' + pm.volMax + ' m³ par poêle' : 'plage de volume à reprendre'), 'Les deux poêles sont au fond de la partie basse : la salle haute (55 m³) sera chauffée par l\'air chaud qui remonte, prévoir un brassage ou vérifier l\'homogénéité.');
      add('Poêles de sauna', 'Régulation à 35 °C', pm.thermostat ? 'A VOIR' : 'A VOIR', pm.thermostat || 'plage du régulateur à vérifier', 'Consigne 35 °C, sonde d\'ambiance dans la salle haute (pas dans le panache au-dessus des poêles)', pm.thermostat ? 'Régulation maison possible, à condition de garder la sécurité : sur beaucoup de poêles, le limiteur de surchauffe à réarmement manuel est dans le boîtier sonde du régulateur d\'origine. Sans ce régulateur, ajouter un limiteur homologué par poêle, sonde au-dessus du poêle à l\'emplacement de la notice, en série sur les contacteurs, plus une minuterie de coupure. Schéma à faire valider par le bureau de contrôle.' : 'Beaucoup de régulateurs de sauna démarrent à 40 ou 50 °C');
    }
    // Déshumidificateur
    if (deshum) {
      const c = deshum.cfg;
      const ouvert = (L.ouvertures || []).some((o) => o.x0 <= 5473 && o.x1 >= 7991);
      add('Déshumidificateur', 'Emplacement : alcôve sud (à la place du banc B20B est)', ouvert ? 'OK' : 'NOK', ouvert ? 'alcôve ouverte sur la salle haute sur 2,52 m (constaté sur place ; le SketchUp dessine un mur plein)' : 'alcôve fermée par un mur plein dans le SketchUp', 'Le déshumidificateur doit traiter l\'air de la grotte', ouvert ? 'Volume traité : grotte ≈ 74 m³ + alcôve ≈ 10,5 m³ ≈ 85 m³. Mettre à jour le SketchUp.' : 'Ouvrir ou gainer.');
      const W = c.L, top = (c.zBas || 0) + c.H;
      if (c.paroi && !deshum.along) {
        const m1 = (c.y - W / 2) - c.paroi.y0, m2 = c.paroi.y1 - (c.y + W / 2), lp = c.paroi.y1 - c.paroi.y0;
        add('Déshumidificateur', 'Cotes en largeur sur le mur est de l\'alcôve', Math.min(m1, m2) >= (c.degLat || 0) ? 'OK' : 'NOK', fmt(W) + ' + 2 × ' + fmt(c.degLat || 0) + ' = ' + fmt(W + 2 * (c.degLat || 0)) + ' sur ' + fmt(lp) + ' ; marges ' + fmt(m1) + ' et ' + fmt(m2), 'Notice : ' + fmt(c.degLat || 0) + ' libres de chaque côté', 'Profondeur ' + fmt(c.Pr) + ' contre le mur.');
      }
      if (c.zBas) {
        const sousPl = c.hMur - top;
        add('Déshumidificateur', 'Hauteur de pose (mural)', c.zBas >= (c.degBas || 0) && sousPl >= (c.degHaut || 0) ? 'OK' : 'NOK', 'bas à ' + fmt(c.zBas) + ', haut à ' + fmt(top) + ', ' + fmt(sousPl) + ' sous ' + fmt(c.hMur), 'Notice : pose murale obligatoire (ni au sol, ni contre le plafond) ; ≥ ' + fmt(c.degBas || 0) + ' sous l\'appareil, ≥ ' + fmt(c.degHaut || 0) + ' au-dessus', 'Hauteur prise à la naissance de l\'arc d\'entrée de l\'alcôve (1,81 m dans le SketchUp). Relever la hauteur réelle contre le mur est : si elle atteint 2,50 m, remonter l\'appareil (bas vers 1,45 m) pour dégager le passage.');
      }
      const cs = deshum.caisson;
      if (cs && c.paroi && !deshum.along) {
        const hb = cs.hb, lp = c.paroi.y1 - c.paroi.y0, m1 = (c.y - cs.Wc / 2) - c.paroi.y0, m2 = c.paroi.y1 - (c.y + cs.Wc / 2), topC = cs.z1 - deshum.fl, basC = cs.z0 - deshum.fl;
        add('Déshumidificateur', 'Habillage bois : encombrement', m1 >= 0 && m2 >= 0 && topC <= c.hMur ? 'OK' : 'NOK', 'caisson ' + fmt(cs.Wc) + ' de large × ' + fmt(cs.Hc) + ' de haut × ' + fmt(cs.Dc) + ' de saillie, de ' + fmt(basC) + ' à ' + fmt(topC) + ' du sol ; il reste ' + fmt(m1) + ' et ' + fmt(m2) + ' de part et d\'autre sur le mur de ' + fmt(lp), 'Tenir sur le mur est et sous la naissance de la voûte (' + fmt(c.hMur) + ')', 'Jeux intérieurs : ' + fmt(hb.jeuLat) + ' sur les côtés, ' + fmt(hb.jeuHaut) + ' dessus, ' + fmt(hb.jeuBas) + ' dessous, ' + fmt(hb.jeuAvant) + ' devant ; planches de ' + hb.ep + ' mm.');
        const debit = c.debitAir_m3h || 1165, req = debit / 3600 / 2; // section libre (m²) pour 2 m/s
        const aF = hb.faces.avant ? (cs.Wc - 2 * hb.ep) * (cs.Hc - 2 * hb.ep - 2 * hb.lame) * hb.vide / 1e6 : 0, aT = (cs.Wc - 2 * hb.ep) * cs.Dc * hb.vide / 1e6;
        const surf = { avant: aF, dessus: hb.faces.dessus ? aT : 0, dessous: hb.faces.dessous ? aT : 0, cotes: hb.faces.cotes ? 2 * cs.Hc * cs.Dc * hb.vide / 1e6 : 0 };
        const asp = hb.aspiration || 'avant', souf = hb.soufflage || 'dessus', meme = asp === souf;
        const aA = surf[asp] / (meme ? 2 : 1), aS = surf[souf] / (meme ? 2 : 1), m2f = (v) => v.toFixed(2).replace('.', ',') + ' m²';
        const okFlux = aA >= req && aS >= req;
        add('Déshumidificateur', 'Habillage bois : passage de l\'air et entretien', okFlux && !meme && hb.fluxVerifie ? 'OK' : okFlux ? 'A VOIR' : 'NOK', 'aspiration par ' + asp + ' : ' + m2f(aA) + ' libres ; soufflage par ' + souf + ' : ' + m2f(aS) + ' libres (claire-voie ' + Math.round(hb.vide * 100) + ' %)', '≥ ' + m2f(req) + ' libres pour chaque flux (' + debit + ' m³/h à 2 m/s), aspiration et soufflage séparés pour éviter le court-circuit, façade démontable pour le filtre et l\'hygrostat', (hb.fluxNote || 'Faces d\'aspiration et de soufflage à confirmer sur la notice du DH 60.') + (hb.jeuLat < (c.degLat || 0) ? ' Les jeux intérieurs sont plus petits que les dégagements de la notice (' + fmt(c.degLat) + ' sur les côtés) : à valider avec Trotec, la façade démontable servant d\'accès.' : ''));
        add('Déshumidificateur', 'Habillage bois : réaction au feu (ERP)', 'A VOIR', hb.essence + ', planches de ' + hb.ep + ' mm', hb.feuExigence || 'Règlement de sécurité ERP (AM) : classement de réaction au feu des habillages', hb.feuNote || '');
      }
      let fd = 1e9, fname = '';
      items.filter((it) => it.zone === 'alcove').forEach((it) => { const xs = it.poly.map((q) => q[0]), ys = it.poly.map((q) => q[1]); const d = Math.hypot(Math.max(0, deshum.emp.x0 - Math.max(...xs), Math.min(...xs) - deshum.emp.x1), Math.max(0, deshum.emp.y0 - Math.max(...ys), Math.min(...ys) - deshum.emp.y1)); if (d < fd) { fd = d; fname = it.cfg.nom; } });
      if (fd < 1e9) add('Déshumidificateur', 'Passage devant l\'appareil', fd >= 900 ? 'OK' : 'A VOIR', fmt(fd) + ' libres jusqu\'au ' + fname, 'Accès pour l\'entretien des filtres et circulation dans l\'alcôve', 'Distance aux poêles : plus de 2 m, soufflage orienté vers la grotte.');
      add('Déshumidificateur', 'Température de fonctionnement', c.tMax ? (c.tMax >= 35 ? (c.plageNote ? 'A VOIR' : 'OK') : 'NOK') : 'A VOIR', c.tMax ? (c.tMin ? c.tMin + ' à ' : 'jusqu\'à ') + c.tMax + ' °C (tableau de la notice)' : 'plage à vérifier sur la notice', '35 °C en séance ; hors séance, la grotte doit rester au-dessus de ' + (c.tMin || 15) + ' °C pour que l\'appareil continue de déshumidifier', c.tMax ? c.plageNote ? c.plageNote + ' Faire confirmer par écrit le fonctionnement continu à 35 °C.' : 'Plage couverte en séance (35 °C) comme chauffage coupé.' : '');
      const pointe = c.besoinPointe_L_j || c.besoin_L_j, couv = c.debit35_L_j && pointe ? c.debit35_L_j / pointe : 0;
      const capSt = !c.debit35_L_j || !c.besoin_L_j ? 'A VOIR' : couv >= 0.95 ? (c.debit35Estime ? 'A VOIR' : 'OK') : c.debit35_L_j >= c.besoin_L_j ? 'A VOIR' : 'NOK';
      add('Déshumidificateur', 'Capacité', capSt, c.debit_L_j ? c.debit_L_j + ' L/24 h à ' + c.debitCond + (c.debit35_L_j ? ', soit ≈ ' + c.debit35_L_j + ' L/24 h à 35 °C / 45 % (' + (c.debit35_L_j / 24).toFixed(1).replace('.', ',') + ' kg/h)' : '') + (c.debit35Estime ? ' (estimation)' : '') + (c.bruit_dBA ? ' ; ' + c.bruit_dBA + ' dB(A) à 1 m' : '') : 'à dimensionner', 'Besoin en séance ≈ ' + (c.besoin_L_j || '?') + ' L/24 h (1,0 à 1,6 kg/h, 12 à 14 curistes, consigne 45 % HR)' + (c.besoinPointe_L_j ? ' ; pointe ≈ ' + c.besoinPointe_L_j + ' L/24 h (2,4 kg/h) avec l\'air neuf de la pièce d\'entrée à 26 °C / 75 %' : ''), (couv ? 'Couvre ' + Math.round(couv * 100) + ' % de la pointe' + (c.debit35Estime ? ' d\'après l\'estimation : faire confirmer par Trotec le débit à 35 °C / 45 %' : '') + '. ' : '') + (capSt === 'OK' ? '' : 'Pour la pointe : air neuf pris dehors (double flux) ou au frigidarium, ou appareil plus gros. ') + (c.chaleur_W ? 'Chaleur rejetée dans la grotte ≈ ' + (c.chaleur_W / 1000).toFixed(1).replace('.', ',') + ' kW (autant de moins pour les poêles).' : ''));
      if (c.bruit) add('Déshumidificateur', 'Bruit dans une salle de détente', 'A VOIR', c.bruit, 'Ambiance calme pendant les séances (≈ 35 dB(A))', 'Appareil de chantier ou de local technique : prévoir un fonctionnement sur hygrostat, un réglage en vitesse réduite si possible, ou un caisson acoustique ventilé. Le Microwell DRY 500 fait 44 dB(A) à 1 m.');
      if (c.degAvant) add('Déshumidificateur', 'Dégagement devant l\'appareil', fd >= c.degAvant ? 'OK' : 'NOK', fmt(fd) + ' jusqu\'au mobilier le plus proche', 'Notice : ' + fmt(c.degAvant) + ' libres devant (aspiration et soufflage)');
      add('Déshumidificateur', 'Évacuation des condensats et alimentation', 'A VOIR', 'Condensats ' + (c.condensats || 'à raccorder') + ' ; ' + (c.elec || 'prise dédiée'), 'Fonctionnement continu sans bac à vider ; amener une évacuation en pente dans l\'alcôve');
    }
    // Éclairage : suspensions
    if (susps.length) {
      const sm = L.suspension; const hmin = Math.min(...susps.map((u) => u.bas - u.fl)); const umin = susps.find((u) => u.bas - u.fl === hmin);
      add('Éclairage', 'Hauteur libre sous les suspensions', hmin >= 2100 ? 'OK' : 'NOK', fmt(hmin) + ' sous l\'abat-jour le plus bas (' + umin.cfg.nom + '), chaîne gardée ' + fmt(sm.chaine), '≥ 2,10 m pour passer et se relever sans se cogner', 'Avec la chaîne entière (' + fmt(sm.chaineMax) + '), le bas descendrait à ' + fmt(umin.plaf - sm.chaineMax - 30 - sm.H - umin.fl) + ' : chaîne à raccourcir à la pose.');
      let dmin = 1e9, pn = '';
      susps.forEach((u) => poeles.forEach((p) => { const d = Math.hypot(Math.max(0, p.box.x0 - u.cfg.x, u.cfg.x - p.box.x1), Math.max(0, p.box.y0 - u.cfg.y, u.cfg.y - p.box.y1)) - u.R; if (d < dmin) { dmin = d; pn = u.cfg.nom; } }));
      if (poeles.length) add('Éclairage', 'Distance des suspensions aux poêles', dmin >= 500 ? 'OK' : 'NOK', fmt(dmin) + ' en plan (' + pn + ')', 'Hors zone 1 de la NF C 15-100 partie 7-703 : 0,50 m autour du poêle, du sol au plafond', 'Hors du panache d\'air chaud au-dessus des poêles.');
      add('Éclairage', 'Luminaires dans un local équipé de poêles de sauna', 'A VOIR', sm.IP + ', ' + sm.douille + ', câble textile ou PVC d\'origine', 'NF C 15-100 partie 7-703, si le bureau de contrôle l\'applique : IPX4 minimum ; au-dessus de 1 m (zone 3), matériel tenant 125 °C et câbles 170 °C (silicone)', 'Ce modèle n\'est pas prévu pour ces conditions : faire trancher le bureau de contrôle, ou recâbler en silicone avec des douilles céramique. ' + sm.ampoule + ' (pas d\'ampoule de 100 W sous le plafond bois). La finition rouille est une peinture sur acier, qui s\'oxydera en air salin.');
    }
    // Frigidarium : arc sur la rivière, fumée
    if (frigo && frigo.arc) {
      add('Frigidarium', 'Arc sud ouvert sur la rivière en contrebas', 'A VOIR', 'ouverture 2,18 m × 1,20 m : allège 0,23 m sous le sol fini, clé à 0,97 m au-dessus', 'Protection contre la chute : vitrage fixe feuilleté résistant aux chocs ou garde-corps (NF P 01-012)', 'Modélisé avec un vitrage fixe. Sans vitrage, l\'air humide de la rivière entre dans le frigidarium. Niveau de la rivière supposé à 3,5 m en contrebas.');
      add('Frigidarium', 'Fumée au sol', 'A VOIR', 'nappe de 0 à 0,45 m, éclairage bleu', 'Compatible avec la détection incendie, le sol et la grotte voisine', 'Une fumée de scène (glycol) peut déclencher les détecteurs : préférer une brumisation à l\'eau ou à ultrasons, ou isoler la détection. Le sol devient humide : carrelage antidérapant R11, marches balisées. La fumée coule vers le bas : avec la porte ouverte, elle entre dans la partie basse au même niveau (2,57) et mouille les murs de sel. Porte à fermeture automatique, extraction côté frigidarium.');
    }
    // Sols
    if (L.sols && L.sols.salleHaute) {
      const sh = L.sols.salleHaute;
      add('Sols', 'Sol de la salle haute et de l\'alcôve : ' + sh.nom, 'A VOIR', sh.version + ' ; ' + sh.feu + ', classe ' + sh.usage + ', ' + sh.upec, 'Réaction au feu des sols de locaux ERP : DFL-s2 / M4 (AM 7) ; sol non glissant pieds nus ; support sec sans remontée d\'humidité', 'Les notices Florafloor demandent une pièce entre 15 et 27 °C, sinon colle PU bi-composants obligatoire : faire valider par écrit par ESTIVAL l\'usage à 35 °C (≥ 30 °C la nuit), le sel et le lavage humide. Dalle contre la roche : mesures CM, barrière époxy anti-remontées sous Avis Technique, ragréage P3. Pose et prise de la colle chauffage coupé (15–27 °C), remontée progressive vers 35 °C. Glissance : seule la classe DS (à sec, chaussé) est déclarée ; essai pieds nus sur sol mouillé (NF EN 16165 annexe A) à comparer à la classe PN de la NF P05-011 (2024). Périphérie au mastic silicone sanitaire ; aspirer le sel à sec avant tout lavage.');
    }
    // Murs de sel / ambiances
    add('Murs de sel', 'Implantation des 2 murs de sel', 'OK', L.mursSel.map((w) => w.nom + ' ' + fmt(w.x1 - w.x0) + ' × ' + fmt(w.h)).join(' ; '), 'Croquis du 02/10/2026 : murs nord et sud de la partie basse');
    add('Murs de sel', 'Rétro-éclairage', 'A VOIR', '10 cm de vide technique derrière chaque mur', 'LED TBTS, IP65 conseillé', 'Prévoir une trappe ou un démontage pour la maintenance des LED.');
    add('Ambiances', 'Grotte chaude et sèche contiguë au frigidarium froid et humide', 'A VOIR', 'Séparation : porte vitrée 0,80 m', 'Le sel est hygroscopique', 'L\'air humide du frigidarium fait suinter et ronger les briques de sel : porte à fermeture automatique avec joints, grotte en légère dépression (extraction 5 à 10 % au-dessus du soufflage), jamais en surpression : la vapeur partirait dans le vide du plafond et vers le frigidarium.');
    add('Thermique et humidité', 'Plafond bois sans isolant sous la route', 'NOK', 'premier poste de pertes (0,9 à 2,4 kW) ; la voûte au-dessus des lames est à 18–23 °C en hiver', 'Point de rosée de la grotte : 21,3 °C à 35 °C / 45 % HR', 'Condensation cachée dans le vide (bois, solives, éventuelles poutrelles acier sous la chaussée). Sonder la voûte, traiter les infiltrations, puis isolant non sensible à l\'eau + pare-vapeur continu (Sd ≥ 100 m) + lames bois, vide fermé.');
    add('Thermique et humidité', 'Origine de l\'air neuf', 'A VOIR', 'pièce d\'entrée à 26 °C / 75 % : déjà 45 % HR une fois chauffé à 35 °C ; grotte existante à 52 % HR et 40 °C (point de rosée 28 °C), ce qui confirme ce cas', 'Consigne 40–45 % HR en séance, < 75 % en permanence (déliquescence du sel)', 'Prendre l\'air dehors par une double flux (récupération 75 %), à défaut au frigidarium ; débit hygiénique à faire fixer par le bureau de contrôle.');
    add('Thermique et humidité', 'Régime de chauffe', 'A VOIR', 'roche et sel très inertes : 8 à 10 kW pendant 1 à 3 jours après un arrêt', 'Chauffage permanent, réduit de nuit ≥ 30 °C', 'Laisser refroidir un air à 21 °C de point de rosée fait condenser les parois à chaque arrêt. À 35 °C d\'air, la température ressentie est ≈ 31–32 °C (parois à 27–29 °C).');
    const lowDepth = 10054 - 8283;
    items.filter((it) => it.cfg.x > 8283 && it.cfg.x < 10054 && it.cfg.y > 1751).forEach((it) => {
      const xs = it.poly.map((p) => p[0]), ys = it.poly.map((p) => p[1]);
      const over = Math.max(0, 8283 - Math.min(...xs)) + Math.max(0, Math.max(...xs) - 10054);
      const salt = L.mursSel.reduce((m, w) => Math.max(m, Math.min(Math.max(...ys), w.y1) - Math.max(Math.min(...ys), w.y0) > 0 ? 1 : 0), 0);
      add('Partie basse', it.cfg.nom, over > 5 || salt ? 'NOK' : 'OK', over > 5 ? 'dépasse de ' + Math.round(over / 10) + ' cm (profondeur SketchUp ' + fmt(lowDepth) + ' entre le bord du niveau haut et le mur de la porte)' : 'tient dans la partie basse', it.T.nom + ' : ' + Math.round(it.T.P * 100) + ' × ' + Math.round(it.T.L * 100) + ' cm', over > 5 ? 'À mesurer sur place : le plan papier semble plus profond. Sinon, pose en diagonale (côté nord seulement, 3 cm de marge).' : '');
    });
    const alc = 1751 - 84;
    add('Alcôve', 'Bancs B20B dans l\'alcôve', alc >= 1730 ? 'OK' : 'NOK', 'banc 1,73 m pour ' + fmt(alc) + ' disponibles', 'Cote 1,67 notée sur le plan', 'Il manque ' + fmt(1730 - alc) + ' : banc recoupé ou posé en biais. L\'alcôve est fermée côté grotte dans le SketchUp (mur plein).');
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
    const e = L.simulation.entree;
    // les premiers arrivés vont au plus loin, pour ne pas croiser les suivants
    const caveSeats = seats.filter((s) => s.zone === 'grotte' && route(e.x, e.y, s.approach.x, s.approach.y)).sort((a, b) => Math.hypot(b.x - e.x, b.y - e.y) - Math.hypot(a.x - e.x, a.y - e.y));
    const n = Math.min(L.simulation.effectif, caveSeats.length);
    for (let i = 0; i < n; i++) {
      const g = makeAgent(COLORS[i % COLORS.length]); g.visible = false;
      const cs = caveSeats[i];
      const plan = [
        { at: i * 3, do: 'spawn', x: e.x, y: e.y },
        { do: 'go', x: cs.approach.x, y: cs.approach.y, label: 'vers sa place' },
        { do: 'sit', seat: cs, until: 'session', label: 'séance (chaud/sec)' },
        { do: 'go', x: e.x, y: e.y, label: 'sortie' },
        { do: 'leave' },
      ];
      agents.push({ g, plan, step: 0, pos: { x: e.x, y: e.y }, path: null, wait: 0, state: 'attente', id: i, delay: i * 2.5 });
    }
    sessionEnd = 1e9; running = true; simT = 0; $('btnSession').textContent = '⏸ Pause';
  }
  function resetSim() { agents.forEach((a) => agentsGroup.remove(a.g)); agents = []; simT = 0; evac = null; running = false; doors.forEach((d) => { d.target = 0; }); $('btnSession').textContent = '▶ Séance'; setIR(false); $('simInfo').textContent = ''; }
  function setIR(on) {
    setPoeles(on);
    // lueur visible seulement pour les émetteurs qui en ont une (lampes quartz/halogène/carbone) ; les panneaux restent sans lumière
    const lu = irM().lueur;
    MAT.irGlow.emissiveIntensity = on && lu ? 1.2 : 0; MAT.irFace.emissive.setHex(lu || 0x000000); MAT.irFace.emissiveIntensity = on && lu ? 0.9 : 0;
    irs.forEach((r) => { r.light.color.setHex(lu || 0xff5a1e); r.light.intensity = on && lu ? 1.4 : 0; });
  }
  function startEvac() {
    if (!agents.length) startSession();
    evac = { t0: simT, done: false };
    // chacun rejoint la sortie la plus proche en longueur de parcours : porte d'entrée ou issue de secours de l'alcôve
    const exits = [L.simulation.entree].concat(L.simulation.secours ? [L.simulation.secours] : []);
    const plen = (pth) => { let l = 0; for (let i = 1; i < pth.length; i++) l += Math.hypot(pth[i].x - pth[i - 1].x, pth[i].y - pth[i - 1].y); return l; };
    agents.forEach((a) => { if (a.step >= a.plan.length || a.plan[a.step].do === 'leave') return;
      const from = a.sitting ? a.sitting.approach : a.pos; let ex = exits[0], best = 1e12;
      exits.forEach((e) => { const pth = route(from.x, from.y, e.x, e.y); if (pth && plen(pth) < best) { best = plen(pth); ex = e; } });
      a.plan = a.plan.slice(0, a.step).concat([{ do: 'go', x: ex.x, y: ex.y, label: ex === L.simulation.entree ? 'ÉVACUATION → entrée' : 'ÉVACUATION → issue de secours', speed: 1.3 }, { do: 'leave' }]); a.g.visible = true; a.path = null; a.sitting = null; standUp(a); a.taken = null; });
    running = true;
  }
  function standUp(a) { a.g.rotation.set(0, a.g.rotation.y, 0); a.g.scale.set(1, 1, 1); }
  function sitDown(a, s) {
    const h = floorAt(s.x, s.y); a.g.position.copy(P(s.x, s.y, h)); a.g.rotation.set(0, s.rot * Math.PI / 180 + Math.PI, 0);
    if (s.pose === 'allonge') {
      // pieds au bout de la chaise longue, corps incliné vers le dossier (côté -z local)
      const r = s.rot * Math.PI / 180, fx = s.x + 750 * Math.sin(r), fy = s.y - 750 * Math.cos(r);
      a.g.position.copy(P(fx, fy, h + 380)); a.g.rotation.set(0, r, 0); a.g.rotateX(-(Math.PI / 2 - 0.3));
    }
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
        if (!a.sitting) { sitDown(a, t.seat); a.sitting = t.seat; a.state = t.label; a.sitT = simT; }
        if (t.dur) { if (simT >= a.sitT + t.dur) { a.sitting = null; standUp(a); a.pos = { x: t.seat.approach.x, y: t.seat.approach.y }; a.step++; } return; }
        if (t.until === 'session') { if (a.sitting) seated++; if (simT >= sessionEnd + a.id * 2) { a.sitting = null; standUp(a); a.pos = { x: t.seat.approach.x, y: t.seat.approach.y }; a.step++; } }
        else if (simT >= t.until) { a.sitting = null; standUp(a); a.pos = { x: t.seat.approach.x, y: t.seat.approach.y }; a.step++; }
        return;
      }
      if (t.do === 'leave') { a.g.visible = false; a.step++; }
    });
    const n = agents.length;
    if (n && seated === n && sessionEnd > 1e8) { sessionEnd = simT + 40; setIR(true); }
    if (simT > sessionEnd && !$('tIROn').checked) setIR(false);
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
    ensemble: () => { useCam(persp); persp.position.set(-2.5, 10.5, 9); controls.target.set(0.5, 0, 0); setCeil(false); dehorsGroup.visible = false; },
    plan: () => { useCam(ortho); ortho.position.set(0.3, 30, 0); ortho.up.set(0, 0, -1); controls.target.set(0.3, 0, 0); ortho.lookAt(0.3, 0, 0); setCeil(false); dehorsGroup.visible = false; },
    grotte: () => { useCam(persp); persp.position.copy(P(9900, 3300, 2570 + 1650)); controls.target.copy(P(8600, 6000, 2570 + 900)); setCeil(true); dehorsGroup.visible = $('tFrigo').checked; },
    frigidarium: () => { useCam(persp); persp.position.copy(P(10700, 4400, 2570 + 1600)); controls.target.copy(P(14000, 1900, 2570 + 700)); setCeil(true); dehorsGroup.visible = $('tFrigo').checked; },
    escalier: () => { useCam(persp); persp.position.copy(P(6500, 3900, 2870 + 1650)); controls.target.copy(P(10200, 3900, 2570 + 900)); setCeil(true); dehorsGroup.visible = $('tFrigo').checked; },
    alcove: () => { useCam(persp); persp.position.copy(P(5500, 3600, 2870 + 1550)); controls.target.copy(P(7800, 900, 2870 + 1000)); setCeil(true); dehorsGroup.visible = $('tFrigo').checked; },
    salle: () => { useCam(persp); persp.position.copy(P(9300, 2300, 2570 + 1700)); controls.target.copy(P(4500, 4300, 2870 + 600)); setCeil(true); dehorsGroup.visible = $('tFrigo').checked; },
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
  bind('tSusp', (v) => { suspGroup.visible = v; suspLights.visible = v && pres; });
  bind('tFrigo', (v) => { frigoGroup.visible = v; dehorsGroup.visible = v; });
  bind('tClear', (v) => { clearGroup.visible = v; $('legendClear').style.display = v ? 'block' : 'none'; });
  bind('tTurn', (v) => (turning.visible = v));
  bind('tIROn', (v) => setIR(v));
  bind('tSalt', (v) => { MAT.salt.emissiveIntensity = v ? 0.85 : 0.05; saltLights.visible = v; });
  const sel = $('irModel');
  Object.entries(IR_MODELES).forEach(([k, m]) => { const o = document.createElement('option'); o.value = k; o.textContent = m.nom; sel.appendChild(o); });
  sel.value = irKey;
  const poseSel = $('irPose'); poseSel.value = irPose;
  const refreshIR = () => { buildIR(); runChecks(); setIR($('tIROn').checked || (running && agents.length > 0 && sessionEnd < 1e8 && simT < sessionEnd)); };
  sel.addEventListener('change', () => { irKey = sel.value; store.set('grotte.ir', irKey); refreshIR(); });
  poseSel.addEventListener('change', () => { irPose = poseSel.value; store.set('grotte.pose', irPose); refreshIR(); });
  $('btnSession').addEventListener('click', () => { if (!agents.length) startSession(); else { running = !running; $('btnSession').textContent = running ? '⏸ Pause' : '▶ Reprendre'; } });
  $('btnEvac').addEventListener('click', startEvac);
  $('btnReset').addEventListener('click', resetSim);
  $('btnPrint').addEventListener('click', () => window.print());
  $('speed').addEventListener('input', (e) => { $('speedVal').textContent = '×' + e.target.value; });
  $('btnPanel').addEventListener('click', () => document.body.classList.toggle('nopanel'));

  // ------------------------------------------------------------------ mode présentation (communication) : ambiance, halo, vues, photo HD, visite guidée
  const presLights = new THREE.Group(); presLights.visible = false; scene.add(presLights);
  const MAT_LED = new THREE.MeshStandardMaterial({ color: 0xfff3e0, emissive: 0xffd9ae, emissiveIntensity: 2.4 });
  // spots LED encastrés : 1 au pied de l'escalier, 1 dans l'alcôve ; 2 spots sans luminaire visible donnent les ombres sous les suspensions
  [[8783, 3842, 0, 1], [6730, 900, 0, 1], [3960, 5251, 1, 0], [6520, 2751, 1, 0]].forEach(([x, y, sh, fixture]) => {
    const zc = ceilingAt(x, y), z = isNaN(zc) ? L.voutes.alcove.cle - 20 : zc + 114;
    const sp = new THREE.SpotLight(0xffc690, 1.5, 7, 1.0, 0.9, 2); sp.position.copy(P(x, y, z - 25)); sp.target.position.copy(P(x, y, z - 3000));
    if (sh) { sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0004; sp.shadow.camera.near = 0.1; }
    presLights.add(sp, sp.target);
    if (sh) { sp.intensity = 0.9; sp.angle = 1.15; sp.position.copy(P(x, y, z - 520)); } // ombres portées sous deux suspensions
    if (fixture) { const led = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.014, 24), MAT_LED); led.position.copy(P(x, y, z - 7)); ceilings.add(led); }
  });
  let composer = null, renderPass = null, bloomPass = null, pres = false;
  function initComposer() {
    if (composer || !THREE.EffectComposer || !THREE.UnrealBloomPass) return;
    const sz = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio();
    const rt = renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget ? new THREE.WebGLMultisampleRenderTarget(sz.x * pr, sz.y * pr, { format: THREE.RGBAFormat }) : undefined;
    composer = new THREE.EffectComposer(renderer, rt);
    [composer.renderTarget1, composer.renderTarget2].forEach((t) => { t.texture.encoding = THREE.sRGBEncoding; });
    renderPass = new THREE.RenderPass(scene, camera); composer.addPass(renderPass);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(sz.x, sz.y), 0.32, 0.45, 0.9); composer.addPass(bloomPass);
    composer.setPixelRatio(pr); composer.setSize(sz.x, sz.y);
  }
  function render() { if (pres && composer) { renderPass.camera = camera; composer.render(); } else renderer.render(scene, camera); }
  const TECH = ['tEdges', 'tSafe', 'tTurn', 'tClear', 'tIR'], presSaved = {};
  const setChk = (id, v) => { if ($(id).checked !== v) { $(id).checked = v; $(id).dispatchEvent(new Event('change')); } };
  function setPresentation(on) {
    if (on === pres) return; pres = on; if (on) initComposer();
    if (on) TECH.forEach((id) => { presSaved[id] = $(id).checked; setChk(id, false); }); else TECH.forEach((id) => setChk(id, !!presSaved[id]));
    setChk('tSalt', true); setChk('tIROn', on || running); setChk('tCeil', true);
    poeleGroup.traverse((o) => { if (o.userData.tech) o.visible = !on; });
    presLights.visible = on; suspLights.visible = on; MAT_BULBE.emissiveIntensity = on ? 3.0 : 0.15; sun.intensity = on ? 0 : 0.55; sun.castShadow = !on;
    hemi.intensity = on ? 0.12 : 0.55; renderer.toneMappingExposure = on ? 0.95 : 1.1;
    saltLights.children.forEach((l) => { l.intensity = on ? 1.1 : 1.4; }); frigoLights.forEach((l) => { l.intensity = l.userData.k * (on ? 1.2 : 1); });
    scene.fog = on ? new THREE.FogExp2(0x1a110b, 0.028) : null; scene.background.setHex(on ? 0x0b0907 : 0x14161a);
    persp.fov = on ? 60 : 50; persp.updateProjectionMatrix();
    document.body.classList.toggle('pres', on); document.body.classList.toggle('nopanel', on); $('presBar').hidden = !on;
    $('btnPres').textContent = on ? 'Quitter la présentation' : 'Mode présentation';
    if (!on) stopVisite();
    resize();
  }
  // vues de communication (repère SketchUp, mm ; hauteur des yeux ≈ 1,55 m)
  const COM_VIEWS = {
    entree: { nom: 'Entrée', pos: [3350, 4071, 2870 + 1600], tgt: [9000, 4000, 2570 + 1000] },
    detente: { nom: 'Détente', pos: [7850, 2450, 2870 + 1500], tgt: [4200, 5300, 2870 + 450] },
    sel: { nom: 'Murs de sel', pos: [7350, 2900, 2870 + 1450], tgt: [9350, 6100, 2570 + 1050] },
    poeles: { nom: 'Poêles', pos: [7800, 4000, 2870 + 1500], tgt: [10054, 4000, 2570 + 850] },
    alcove: { nom: 'Alcôve', pos: [5900, 3500, 2870 + 1500], tgt: [7000, 700, 2870 + 1000] },
    frigidarium: { nom: 'Frigidarium', pos: [10700, 5200, 2570 + 1450], tgt: [14200, 2200, 2570 + 350] },
    riviere: { nom: 'Vue rivière', pos: [14000, 3000, 2570 + 1350], tgt: [14000, -1800, 2570 - 2600] },
    maquette: { nom: 'Maquette', pos: [3600, -3800, 2570 + 8200], tgt: [8200, 3700, 2570], noCeil: true },
  };
  function comView(k) { const v = COM_VIEWS[k]; stopVisite(); useCam(persp); persp.position.copy(P(...v.pos)); controls.target.copy(P(...v.tgt)); setCeil(!v.noCeil); dehorsGroup.visible = !v.noCeil; }
  // visite guidée : la caméra suit un chemin lissé de l'entrée jusqu'aux murs de sel
  const VISITE = [
    [[3250, 4071, 4470], [6200, 4071, 3950]], [[4300, 3950, 4450], [7000, 3500, 3900]], [[5600, 3700, 4430], [7100, 1100, 3800]],
    [[6800, 3950, 4430], [9800, 5500, 3550]], [[7850, 4000, 4420], [10054, 4000, 3350]], [[8900, 3800, 4180], [9750, 2150, 3450]],
    [[9250, 4300, 4150], [9800, 5900, 3450]], [[8100, 3000, 4480], [3800, 5000, 3300]],
  ];
  const visPos = new THREE.CatmullRomCurve3(VISITE.map((k) => P(...k[0]))), visTgt = new THREE.CatmullRomCurve3(VISITE.map((k) => P(...k[1])));
  let visite = null; const VISITE_S = 48;
  function startVisite() { useCam(persp); setCeil(true); visite = { t0: performance.now() }; controls.enabled = false; ['btnVisite', 'pbVisite'].forEach((id) => { $(id).textContent = '■ Arrêter la visite'; }); }
  function stopVisite() { if (!visite) return; visite = null; controls.enabled = true; ['btnVisite', 'pbVisite'].forEach((id) => { $(id).textContent = '▶ Visite guidée'; }); }
  function stepVisite() {
    if (!visite) return; let t = (performance.now() - visite.t0) / 1000 / VISITE_S; if (t >= 1) { stopVisite(); return; }
    t = t * t * (3 - 2 * t); persp.position.copy(visPos.getPoint(t)); controls.target.copy(visTgt.getPoint(Math.min(1, t + 0.02)));
  }
  // photo HD : rendu 3840 × 2160 de la vue courante, téléchargée en JPEG
  function photoHD(name, W = 3840, H = 2160) {
    const pr = renderer.getPixelRatio();
    renderer.setPixelRatio(1); renderer.setSize(W, H, false); if (composer) { composer.setPixelRatio(1); composer.setSize(W, H); }
    setAspect(W, H); controls.update(); render();
    const url = renderer.domElement.toDataURL('image/jpeg', 0.92);
    renderer.setPixelRatio(pr); resize();
    try { const a = document.createElement('a'); a.href = url; a.download = (name || 'grotte-de-sel-aquensis') + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* téléchargement bloqué (aperçu intégré) */ }
    return url;
  }
  const viewsBox = $('comViews'), pbViews = $('presViews');
  Object.entries(COM_VIEWS).forEach(([k, v]) => [viewsBox, pbViews].forEach((box) => { const b = document.createElement('button'); b.textContent = v.nom; b.addEventListener('click', () => { if (!pres) setPresentation(true); comView(k); }); box.appendChild(b); }));
  $('btnPres').addEventListener('click', () => { setPresentation(!pres); if (pres) comView('entree'); });
  $('pbExit').addEventListener('click', () => setPresentation(false));
  ['btnPhoto', 'pbPhoto'].forEach((id) => $(id).addEventListener('click', () => photoHD()));
  ['btnVisite', 'pbVisite'].forEach((id) => $(id).addEventListener('click', () => { if (visite) stopVisite(); else { if (!pres) setPresentation(true); startVisite(); } }));

  // info au clic
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('click', (ev) => {
    const r = renderer.domElement.getBoundingClientRect(); mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera); const hit = ray.intersectObjects([furnGroup, irGroup, saltGroup, modelGroup], true)[0];
    const tip = $('tip'); if (!hit) { tip.style.display = 'none'; return; }
    let o = hit.object; while (o && !o.userData.info && o.parent) o = o.parent;
    const pl = toPlan(hit.point); const z = Math.round(hit.point.y * 1000 + OZ);
    tip.innerHTML = (o && o.userData.info ? '<b>' + o.userData.info + '</b><br>' : '') + `X ${Math.round(pl.x)} · Y ${Math.round(pl.y)} · Z ${z} mm`;
    tip.style.left = ev.clientX + 12 + 'px'; tip.style.top = ev.clientY + 12 + 'px'; tip.style.display = 'block';
  });

  function setAspect(w, h) {
    persp.aspect = w / h; persp.updateProjectionMatrix();
    const s = 7.2, a = w / h; ortho.left = -s * a / 1; ortho.right = s * a; ortho.top = s; ortho.bottom = -s;
    if (a < 1.6) { ortho.left = -6.6; ortho.right = 6.6; ortho.top = 6.6 / a; ortho.bottom = -6.6 / a; }
    ortho.updateProjectionMatrix();
  }
  function resize() {
    const el = $('view'), w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h);
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    setAspect(w, h);
  }
  window.addEventListener('resize', resize);

  // ------------------------------------------------------------------ boucle
  const clock = new THREE.Clock();
  function loop() {
    const dt = Math.min(0.05, clock.getDelta());
    if (running) { const sp = +$('speed').value; const sub = Math.ceil(sp); for (let i = 0; i < sub; i++) stepSim(dt * sp / sub); }
    updateDoors(dt * (running ? +$('speed').value : 1));
    MAT.salt.emissiveIntensity = $('tSalt').checked ? (pres ? 0.5 : 0.8) + 0.06 * Math.sin(performance.now() / 1500) : 0.05;
    stepVisite(); animFrigo(dt); controls.update(); render(); requestAnimationFrame(loop);
  }
  runChecks(); resize(); views.ensemble();
  if (window.PRESENTATION || location.hash === '#presentation') { setPresentation(true); comView('entree'); }
  loop();
  window.GROTTE = { scene, route, checks, views, comView, setPresentation, photoHD, startVisite, startSession, startEvac, irs, seats, items, floorH, dist, NX, NY, cellX, cellY, widthAt, setSpeed: (v) => { $('speed').value = v; } };
})();
