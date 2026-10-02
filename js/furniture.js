/*
 * Mobilier Cèdre & Rondins (gamme RONDINS, rondins Ø 8,5 cm) + radiant Trotec IR 1500 SC.
 * Repère local (m) : x = largeur, y = hauteur, z = profondeur ; l'avant du meuble est côté +z.
 */
(function () {
  const R = 0.0425; // rayon des rondins
  let MAT;

  function log(g, x0, y0, z0, x1, y1, z1, r = R) {
    const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1);
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), MAT.log);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    m.castShadow = m.receiveShadow = true; g.add(m); return m;
  }
  function slat(g, w, h, d, x, y, z, rx = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MAT.slat);
    m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = m.receiveShadow = true; g.add(m); return m;
  }
  // Assise + dossier à lattes, accoudoirs en rondins
  function seatBlock(g, x0, x1, D, seatH, backH, arms) {
    const zf = D / 2 - 0.06, zb = -D / 2 + 0.08, w = x1 - x0;
    for (let z = zb + 0.06; z < zf; z += 0.075) slat(g, w, 0.02, 0.06, (x0 + x1) / 2, seatH, z);
    const tilt = -0.22, n = Math.max(3, Math.round(w / 0.085));
    for (let i = 0; i < n; i++) {
      const x = x0 + 0.04 + (i * (w - 0.08)) / (n - 1);
      slat(g, 0.06, backH - seatH, 0.022, x, (seatH + backH) / 2 + 0.02, zb - 0.02 - Math.sin(-tilt) * (backH - seatH) / 2, tilt);
    }
    log(g, x0, seatH - 0.05, zf, x1, seatH - 0.05, zf); log(g, x0, seatH - 0.05, zb, x1, seatH - 0.05, zb);
    if (arms) for (const x of [x0 - 0.05, x1 + 0.05]) {
      log(g, x, 0, zf, x, 0.62, zf); log(g, x, 0, zb, x, 0.62, zb);
      log(g, x, 0.62, zb - 0.05, x, 0.62, zf + 0.08, R * 1.1);
      log(g, x, 0.12, zb, x, 0.12, zf); log(g, x, seatH - 0.05, zb, x, seatH - 0.05, zf);
    }
  }

  const TYPES = {
    chaiseLongue: { nom: 'Chaise longue B17', L: 0.60, P: 1.81, H: 0.37, Hdos: 0.80, build(g) {
      const W = 0.6, L = 1.81;
      for (const x of [-W / 2 + R, W / 2 - R]) { log(g, x, 0.27, -L / 2, x, 0.27, L / 2); log(g, x, 0, -L / 2 + 0.15, x, 0.27, -L / 2 + 0.15); log(g, x, 0, L / 2 - 0.15, x, 0.27, L / 2 - 0.15); }
      log(g, -W / 2, 0.12, -L / 2 + 0.15, W / 2, 0.12, -L / 2 + 0.15); log(g, -W / 2, 0.12, L / 2 - 0.15, W / 2, 0.12, L / 2 - 0.15);
      for (let z = -0.25; z < L / 2 - 0.05; z += 0.08) slat(g, W - 0.04, 0.02, 0.065, 0, 0.33, z);
      for (let i = 0; i < 8; i++) { const t = i * 0.08; slat(g, W - 0.08, 0.02, 0.085, 0, 0.36 + t * 0.75, -0.3 - t * 0.66, 0.85); }
    }, seats: [{ x: 0, z: 0.1, pose: 'allonge' }], approach: [{ x: 0.75, z: 0.2 }, { x: -0.75, z: 0.2 }, { x: 0, z: 1.25 }] }, // côtés ou pied

    teteATete: { nom: 'Tête-à-tête B7 TT', L: 1.55, P: 0.71, H: 0.94, build(g) {
      seatBlock(g, -0.72, -0.18, 0.71, 0.36, 0.94, false); seatBlock(g, 0.18, 0.72, 0.71, 0.36, 0.94, false);
      for (const x of [-0.77, 0.77]) { log(g, x, 0, 0.3, x, 0.62, 0.3); log(g, x, 0, -0.27, x, 0.62, -0.27); log(g, x, 0.62, -0.32, x, 0.62, 0.38, R * 1.1); log(g, x, 0.31, -0.27, x, 0.31, 0.3); }
      slat(g, 0.36, 0.03, 0.5, 0, 0.6, 0.05); log(g, -0.16, 0, 0.25, -0.16, 0.6, 0.25); log(g, 0.16, 0, 0.25, 0.16, 0.6, 0.25); log(g, -0.16, 0, -0.2, -0.16, 0.6, -0.2); log(g, 0.16, 0, -0.2, 0.16, 0.6, -0.2);
    }, seats: [{ x: -0.45, z: 0.05, pose: 'assis' }, { x: 0.45, z: 0.05, pose: 'assis' }], approach: [{ x: -0.45, z: 0.8 }, { x: 0.45, z: 0.8 }] },

    fauteuilHaut: { nom: 'Fauteuil dossier haut B4A', L: 0.64, P: 0.71, H: 0.94, build(g) { seatBlock(g, -0.22, 0.22, 0.71, 0.36, 0.94, true); },
      seats: [{ x: 0, z: 0.05, pose: 'assis' }], approach: [{ x: 0, z: 0.8 }] },
    fauteuilBas: { nom: 'Fauteuil dossier bas B4', L: 0.64, P: 0.71, H: 0.71, build(g) { seatBlock(g, -0.22, 0.22, 0.71, 0.36, 0.71, true); },
      seats: [{ x: 0, z: 0.05, pose: 'assis' }], approach: [{ x: 0, z: 0.8 }] },
    canape2: { nom: 'Canapé 2 places B6', L: 1.20, P: 0.71, H: 0.71, build(g) { seatBlock(g, -0.53, 0.53, 0.71, 0.36, 0.71, true); },
      seats: [{ x: -0.27, z: 0.05, pose: 'assis' }, { x: 0.27, z: 0.05, pose: 'assis' }], approach: [{ x: -0.27, z: 0.8 }, { x: 0.27, z: 0.8 }] },
    canape3: { nom: 'Canapé 3 places B7', L: 1.80, P: 0.71, H: 0.71, build(g) { seatBlock(g, -0.79, 0.79, 0.71, 0.36, 0.71, true); },
      seats: [{ x: -0.55, z: 0.05, pose: 'assis' }, { x: 0, z: 0.05, pose: 'assis' }, { x: 0.55, z: 0.05, pose: 'assis' }], approach: [{ x: -0.55, z: 0.8 }, { x: 0, z: 0.8 }, { x: 0.55, z: 0.8 }] },
    table: { nom: 'Table rectangulaire B21B', L: 1.73, P: 0.79, H: 0.73, build(g) {
      for (let x = -0.8; x <= 0.8; x += 0.1) slat(g, 0.095, 0.035, 0.79, x, 0.71, 0);
      for (const x of [-0.7, 0.7]) { log(g, x, 0, -0.3, x, 0.69, -0.3); log(g, x, 0, 0.3, x, 0.69, 0.3); log(g, x, 0.66, -0.36, x, 0.66, 0.36); }
      log(g, -0.7, 0.2, 0, 0.7, 0.2, 0);
    }, seats: [], approach: [] },
    banc: { nom: 'Banc long B20B', L: 1.73, P: 0.24, H: 0.43, build(g) {
      slat(g, 1.73, 0.04, 0.24, 0, 0.41, 0);
      for (const x of [-0.7, 0.7]) { log(g, x, 0, -0.07, x, 0.39, -0.07); log(g, x, 0, 0.07, x, 0.39, 0.07); }
      log(g, -0.7, 0.15, 0, 0.7, 0.15, 0);
    }, seats: [{ x: -0.5, z: 0, pose: 'assis' }, { x: 0, z: 0, pose: 'assis' }, { x: 0.5, z: 0, pose: 'assis' }], approach: [{ x: -0.5, z: 0.55 }, { x: 0, z: 0.55 }, { x: 0.5, z: 0.55 }] },
    chaise: { nom: 'Chaise B3', L: 0.51, P: 0.54, H: 0.92, build(g) {
      for (let z = -0.2; z < 0.22; z += 0.07) slat(g, 0.45, 0.02, 0.06, 0, 0.45, z);
      for (const x of [-0.21, 0.21]) { log(g, x, 0, 0.22, x, 0.45, 0.22); log(g, x, 0, -0.22, x, 0.92, -0.22); }
      for (const y of [0.6, 0.75, 0.88]) log(g, -0.23, y, -0.22, 0.23, y, -0.22, R * 0.7);
    }, seats: [{ x: 0, z: 0, pose: 'assis' }], approach: [{ x: 0, z: 0.6 }] },
  };

  function ir(mats) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.24, 32, 1, true), mats.irBody);
    body.position.y = 0.12; g.add(body);
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.21, 32), mats.irBody); top.rotation.x = -Math.PI / 2; top.position.y = 0.24; g.add(top);
    const grill = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 32, 1, true), mats.irGlow); grill.position.y = 0.12; g.add(grill);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.21, 32), mats.irBody); bottom.rotation.x = Math.PI / 2; g.add(bottom);
    g.userData.glow = grill;
    return g;
  }

  window.FURNITURE = {
    TYPES,
    init(mats) { MAT = mats; },
    build(type) {
      const T = TYPES[type]; if (!T) throw new Error('Type de meuble inconnu : ' + type);
      const g = new THREE.Group(); T.build(g); g.userData.type = type; return g;
    },
    ir,
  };
})();
