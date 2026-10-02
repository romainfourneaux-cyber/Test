/* Textures procédurales (canvas) calées sur les teintes des photos du chantier. */
(function () {
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function canvas(n) { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d')]; }
  function noise(g, n, r, alpha, cols) {
    for (let i = 0; i < n * n / 6; i++) {
      g.fillStyle = cols[Math.floor(r() * cols.length)]; g.globalAlpha = alpha * r();
      const s = 1 + r() * 3; g.fillRect(r() * n, r() * n, s, s);
    }
    g.globalAlpha = 1;
  }
  function tex(c, meters) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.userData = { meters }; return t;
  }

  // Moellons gris-bleu, joints chaux orangée (salle carrelée)
  function stone() {
    const n = 512, [c, g] = canvas(n), r = rng(7);
    g.fillStyle = '#d49a6d'; g.fillRect(0, 0, n, n); noise(g, n, r, 0.5, ['#c4855a', '#e2b086', '#b97c52']);
    let y = 0;
    while (y < n) {
      const h = 22 + r() * 30; let x = -r() * 40;
      while (x < n) {
        const w = 40 + r() * 70, shade = 120 + r() * 50;
        g.fillStyle = `rgb(${shade - 25},${shade - 8},${shade + 8})`;
        g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2 - 4, h / 2 - 4, (r() - 0.5) * 0.2, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(40,50,60,0.35)'; g.lineWidth = 2; g.stroke();
        for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(255,255,255,${0.08 * r()})`; g.fillRect(x + r() * w, y + r() * h, 6, 3); }
        x += w + 4 + r() * 10;
      }
      y += h + 4;
    }
    return tex(c, 1.6);
  }

  // Voûte brique rouge badigeonnée (salle carrelée)
  function brick() {
    const n = 512, [c, g] = canvas(n), r = rng(11);
    g.fillStyle = '#e6ddd0'; g.fillRect(0, 0, n, n);
    const bh = 18, bw = 64;
    for (let row = 0; row * bh < n; row++) {
      const off = (row % 2) * bw / 2;
      for (let x = -off; x < n; x += bw) {
        const k = r(); g.fillStyle = k < 0.55 ? `rgb(${160 + r() * 40},${70 + r() * 25},${50 + r() * 20})` : `rgb(${215 + r() * 30},${205 + r() * 30},${190 + r() * 30})`;
        g.fillRect(x + 2, row * bh + 2, bw - 4, bh - 4);
      }
    }
    noise(g, n, r, 0.6, ['#ffffff', '#cfc6b8', '#8a5a40']);
    return tex(c, 1.3);
  }

  // Dallage pierre beige (salle carrelée)
  function tiles() {
    const n = 512, [c, g] = canvas(n), r = rng(3);
    g.fillStyle = '#b8aa98'; g.fillRect(0, 0, n, n);
    const tw = 256, th = 128;
    for (let y = 0; y < n; y += th) for (let x = (y / th % 2) * tw / 2 - tw; x < n; x += tw) {
      const v = 205 + r() * 25; g.fillStyle = `rgb(${v},${v - 10},${v - 25})`; g.fillRect(x + 3, y + 3, tw - 6, th - 6);
    }
    noise(g, n, r, 0.4, ['#a99a86', '#e8dccb', '#c2b39f']);
    return tex(c, 1.2);
  }

  function flat(base, cols, meters, seed, alpha) {
    const n = 256, [c, g] = canvas(n), r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, n, n); noise(g, n, r, alpha, cols); return tex(c, meters);
  }

  // Croûte de sel sur voûte (photos salle 2) : blanc cristallin + taches grises
  function saltCrust() {
    const n = 512, [c, g] = canvas(n), r = rng(21);
    g.fillStyle = '#d9d6d0'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = r() < 0.5 ? `rgba(90,95,100,${0.15 + r() * 0.3})` : `rgba(255,255,255,${0.3 + r() * 0.5})`;
      g.beginPath(); g.ellipse(r() * n, r() * n, 6 + r() * 40, 3 + r() * 12, r() * 3, 0, 7); g.fill();
    }
    noise(g, n, r, 0.8, ['#ffffff', '#bdb9b2', '#7d7f80']);
    return tex(c, 1.5);
  }

  // Briques de sel de l'Himalaya rétro-éclairées (20×10 cm)
  function saltBricks() {
    const n = 512, [c, g] = canvas(n), r = rng(5);
    g.fillStyle = '#5a2a12'; g.fillRect(0, 0, n, n);
    const bw = 102, bh = 51;
    for (let row = 0; row * bh < n; row++) {
      const off = (row % 2) * bw / 2;
      for (let x = -off; x < n; x += bw) {
        const y = row * bh, k = r();
        const grd = g.createRadialGradient(x + bw / 2, y + bh / 2, 2, x + bw / 2, y + bh / 2, bw * 0.7);
        grd.addColorStop(0, `rgb(255,${200 + k * 45},${150 + k * 70})`);
        grd.addColorStop(1, `rgb(${220 + k * 30},${110 + k * 50},${50 + k * 40})`);
        g.fillStyle = grd; g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
        for (let v = 0; v < 4; v++) { g.strokeStyle = `rgba(255,255,255,${0.15 * r()})`; g.beginPath(); g.moveTo(x + r() * bw, y + 2); g.lineTo(x + r() * bw, y + bh - 2); g.stroke(); }
      }
    }
    return tex(c, 1.0);
  }

  function cedar() {
    const n = 256, [c, g] = canvas(n), r = rng(9);
    g.fillStyle = '#e3c590'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(150,100,50,${0.1 + r() * 0.2})`; g.lineWidth = 1 + r() * 2; const y = r() * n; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(n / 3, y + r() * 8 - 4, 2 * n / 3, y + r() * 8 - 4, n, y); g.stroke(); }
    return tex(c, 0.6);
  }

  // Plafond en lames de bois brun (photos de la partie basse)
  function planks() {
    const n = 512, [c, g] = canvas(n), r = rng(29);
    const lw = n / 4; // lames de 12,5 cm pour une texture de 0,5 m
    for (let x = 0; x < n; x += lw) {
      const v = 80 + r() * 30; g.fillStyle = `rgb(${v + 25},${v},${v - 25})`; g.fillRect(x, 0, lw, n);
      for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(40,25,10,${0.08 + r() * 0.15})`; g.lineWidth = 1 + r() * 2; const xx = x + r() * lw; g.beginPath(); g.moveTo(xx, 0); g.bezierCurveTo(xx + r() * 6 - 3, n / 3, xx + r() * 6 - 3, 2 * n / 3, xx, n); g.stroke(); }
      g.fillStyle = 'rgba(20,12,5,0.8)'; g.fillRect(x, 0, 3, n);
    }
    return tex(c, 0.5);
  }

  window.TEXTURES = {
    build() {
      return {
        stone: stone(), brick: brick(), planks: planks(), tiles: tiles(), saltCrust: saltCrust(), saltBricks: saltBricks(), cedar: cedar(),
        screed: flat('#55534f', ['#3f3d3a', '#6b6862', '#4a4744'], 2.0, 13, 0.9),
        plaster: flat('#cfc8bc', ['#bdb5a8', '#ddd7cc'], 2.0, 17, 0.5),
        wood: flat('#6b4a2f', ['#563a24', '#7d5a3c', '#4a311e'], 1.0, 19, 0.9),
        step: flat('#cdbfa9', ['#b9ab95', '#ded2c0'], 1.0, 23, 0.6),
      };
    },
  };
})();
