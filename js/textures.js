/* Textures procédurales (canvas) calées sur les teintes des photos du chantier.
 * Chaque texture porte userData.meters (taille réelle d'un motif) et, pour certaines, userData.bump (carte de relief). */
(function () {
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function canvas(n) { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d')]; }
  function noise(g, n, r, alpha, cols, density = 6, size = 3) {
    for (let i = 0; i < n * n / density; i++) {
      g.fillStyle = cols[Math.floor(r() * cols.length)]; g.globalAlpha = alpha * r();
      const s = 1 + r() * size; g.fillRect(r() * n, r() * n, s, s);
    }
    g.globalAlpha = 1;
  }
  function tex(c, meters, bump, bumpScale = 0.3) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.userData = { meters };
    if (bump) { const b = new THREE.CanvasTexture(bump); b.wrapS = b.wrapT = THREE.RepeatWrapping; b.anisotropy = 8; t.userData.bump = b; t.userData.bumpScale = bumpScale; }
    return t;
  }
  // dessine fn(dx, dy) aux 9 positions décalées de ±n : motif raccordable sur les bords
  function wrap(n, x, y, w, h, fn) {
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) {
      if (x + dx > n || x + w + dx < 0 || y + dy > n || y + h + dy < 0) continue;
      fn(dx, dy);
    }
  }
  // contour irrégulier d'une pierre (super-ellipse bruitée)
  function stonePath(g, cx, cy, rx, ry, r) {
    const k = 14, pts = [];
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const e = 0.42; // exposant < 1 : formes plus carrées, comme des moellons
      const j = 0.9 + r() * 0.16;
      pts.push([cx + rx * j * Math.sign(c) * Math.pow(Math.abs(c), e), cy + ry * j * Math.sign(s) * Math.pow(Math.abs(s), e)]);
    }
    g.beginPath(); g.moveTo((pts[0][0] + pts[k - 1][0]) / 2, (pts[0][1] + pts[k - 1][1]) / 2);
    for (let i = 0; i < k; i++) { const p = pts[i], q = pts[(i + 1) % k]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    g.closePath();
  }

  // Maçonnerie de moellons de schiste gris-bleu, plats et allongés, noyés dans un mortier de chaux orangé (photos du chantier)
  function stone() {
    const n = 1024, [c, g] = canvas(n), [cb, gb] = canvas(n), r = rng(7);
    g.fillStyle = '#d4a688'; g.fillRect(0, 0, n, n); noise(g, n, r, 0.5, ['#c3947a', '#e3bda3', '#b5866b', '#eccdb6'], 2, 2);
    gb.fillStyle = '#404040'; gb.fillRect(0, 0, n, n); noise(gb, n, r, 0.4, ['#2a2a2a', '#5a5a5a'], 3, 2);
    // assises irrégulières de 3 à 7 cm de mortier entre des pierres de 4 à 12 cm de haut (texture = 1,8 m)
    const rows = []; let tot = 0; while (tot < n) { const h = 32 + r() * 46; rows.push(h); tot += h; }
    const k = n / tot; let y = 0;
    rows.forEach((h0) => {
      const h = h0 * k; let x = r() * 40; const x0 = x;
      while (x < n + x0 - 30) {
        let w = 55 + r() * 120; if (x + w > n + x0 - 12) w = n + x0 - x - 8;
        const hh = h * (0.5 + r() * 0.35), cy = y + h / 2 + (r() - 0.5) * (h - hh) * 0.6, cx = x + w / 2, rx = w / 2 - 3 - r() * 6, ry = hh / 2;
        const base = 92 + r() * 46, tint = r();
        const col = tint < 0.7 ? [base - 6, base + 4, base + 16] : tint < 0.9 ? [base + 10, base + 8, base + 4] : [base + 40, base + 38, base + 34];
        const seed = Math.floor(r() * 1e9), ang = (r() - 0.5) * 0.12;
        if (r() < 0.12) { x += w * 0.6; continue; } // plage de mortier sans pierre
        wrap(n, cx - rx, cy - ry, 2 * rx, 2 * ry, (dx, dy) => {
          const rr = rng(seed);
          g.save(); g.translate(cx + dx, cy + dy); g.rotate(ang); stonePath(g, 0, 0, rx, ry, rr); g.clip();
          g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; g.fillRect(-rx - 4, -ry - 4, 2 * rx + 8, 2 * ry + 8);
          const lg = g.createLinearGradient(0, -ry, 0, ry); lg.addColorStop(0, 'rgba(255,255,255,0.16)'); lg.addColorStop(0.6, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,0,0.25)');
          g.fillStyle = lg; g.fillRect(-rx - 4, -ry - 4, 2 * rx + 8, 2 * ry + 8);
          for (let i = 0; i < 5; i++) { g.strokeStyle = `rgba(${rr() < 0.5 ? '20,25,35' : '170,180,190'},${0.1 + rr() * 0.12})`; g.lineWidth = 1 + rr() * 1.5; const yy = (rr() - 0.5) * ry * 1.6; g.beginPath(); g.moveTo(-rx, yy); g.lineTo(rx, yy + (rr() - 0.5) * 4); g.stroke(); } // feuilletage du schiste
          for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${rr() < 0.5 ? '15,20,30' : '210,215,220'},${0.04 + rr() * 0.07})`; g.fillRect((rr() - 0.5) * 2 * rx, (rr() - 0.5) * 2 * ry, 1 + rr() * 3, 1 + rr() * 2); }
          g.restore();
          g.save(); g.translate(cx + dx, cy + dy); g.rotate(ang); stonePath(g, 0, 0, rx, ry, rng(seed)); g.strokeStyle = 'rgba(90,55,30,0.18)'; g.lineWidth = 1.2; g.stroke(); g.restore();
          gb.save(); gb.translate(cx + dx, cy + dy); gb.rotate(ang); stonePath(gb, 0, 0, rx, ry, rng(seed)); gb.clip();
          const rg = gb.createRadialGradient(0, 0, 2, 0, 0, Math.max(rx, ry) * 1.05); rg.addColorStop(0, '#e8e8e8'); rg.addColorStop(0.75, '#cfcfcf'); rg.addColorStop(1, '#8a8a8a');
          gb.fillStyle = rg; gb.fillRect(-rx - 4, -ry - 4, 2 * rx + 8, 2 * ry + 8); gb.restore();
        });
        x += w + 8 + r() * 16;
      }
      y += h;
    });
    return tex(c, 1.8, cb, 0.16);
  }

  // Voûte brique rouge badigeonnée
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

  // Carrelage beige 30 × 30 cm avec bandes de carreaux gris anthracite (photo de la salle haute) : motif de 1,8 m
  function tiles() {
    const n = 1024, [c, g] = canvas(n), [cb, gb] = canvas(n), r = rng(3);
    g.fillStyle = '#8c8174'; g.fillRect(0, 0, n, n); gb.fillStyle = '#404040'; gb.fillRect(0, 0, n, n);
    const t = n / 6, j = 2;
    for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) {
      const band = i === 0 || k === 0, x = i * t, y = k * t;
      if (band) { const v = 70 + r() * 18; g.fillStyle = `rgb(${v},${v + 2},${v + 6})`; } else { const v = 214 + r() * 16; g.fillStyle = `rgb(${v + 4},${v - 6},${v - 22})`; }
      g.fillRect(x + j, y + j, t - 2 * j, t - 2 * j);
      for (let q = 0; q < 10; q++) { g.fillStyle = band ? `rgba(200,205,210,${0.04 + r() * 0.06})` : `rgba(${r() < 0.5 ? '160,135,105' : '250,240,225'},${0.06 + r() * 0.1})`; g.beginPath(); g.ellipse(x + r() * t, y + r() * t, 8 + r() * 40, 4 + r() * 16, r() * 3, 0, 7); g.fill(); }
      gb.fillStyle = '#d0d0d0'; gb.fillRect(x + j, y + j, t - 2 * j, t - 2 * j);
    }
    noise(g, n, r, 0.3, ['#8f8270', '#efe4d3', '#6f6456'], 6, 2);
    return tex(c, 1.8, cb, 0.25);
  }

  function flat(base, cols, meters, seed, alpha) {
    const n = 256, [c, g] = canvas(n), r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, n, n); noise(g, n, r, alpha, cols); return tex(c, meters);
  }

  // Voûte salpêtrée du frigidarium (photo) : pierre et enduit gris, larges plaques blanches de sel, coulures rouille
  function saltCrust() {
    const n = 1024, [c, g] = canvas(n), [cb, gb] = canvas(n), r = rng(21);
    g.fillStyle = '#8f8d88'; g.fillRect(0, 0, n, n); gb.fillStyle = '#808080'; gb.fillRect(0, 0, n, n);
    noise(g, n, r, 0.3, ['#6f6e6a', '#a8a6a0', '#7d7b76'], 5, 3);
    for (let i = 0; i < 160; i++) {
      const x = r() * n, y = r() * n, a = 20 + r() * 110, b = 10 + r() * 45, t = (r() - 0.5) * 0.8, al = 0.35 + r() * 0.5;
      wrap(n, x - a, y - a, 2 * a, 2 * a, (dx, dy) => {
        const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, a); gr.addColorStop(0, `rgba(250,250,247,${al})`); gr.addColorStop(0.6, `rgba(240,240,236,${al * 0.7})`); gr.addColorStop(1, 'rgba(240,240,236,0)');
        g.save(); g.translate(x + dx, y + dy); g.rotate(t); g.scale(1, b / a); g.translate(-(x + dx), -(y + dy)); g.fillStyle = gr; g.fillRect(x + dx - a, y + dy - a, 2 * a, 2 * a); g.restore();
        gb.save(); gb.translate(x + dx, y + dy); gb.rotate(t); gb.scale(1, b / a); gb.translate(-(x + dx), -(y + dy)); const gg = gb.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, a); gg.addColorStop(0, 'rgba(255,255,255,0.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); gb.fillStyle = gg; gb.fillRect(x + dx - a, y + dy - a, 2 * a, 2 * a); gb.restore();
      });
    }
    for (let i = 0; i < 14; i++) { const x = r() * n, y = r() * n, l = 40 + r() * 120; g.strokeStyle = `rgba(190,110,50,${0.15 + r() * 0.25})`; g.lineWidth = 2 + r() * 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 10, y + l); g.stroke(); }
    noise(g, n, r, 0.14, ['#ffffff', '#5e5c58'], 8, 2); noise(gb, n, r, 0.15, ['#ffffff', '#000000'], 10, 2);
    return tex(c, 2.0, cb, 0.15);
  }

  // Briques de sel de l'Himalaya rétro-éclairées (20 × 10 cm) : roses, saumon, ambre et blanches, veines cristallines
  function saltBricks() {
    const n = 1024, [c, g] = canvas(n), [cb, gb] = canvas(n), r = rng(5);
    g.fillStyle = '#4a200c'; g.fillRect(0, 0, n, n); gb.fillStyle = '#202020'; gb.fillRect(0, 0, n, n);
    const PAL = [[255, 214, 188], [250, 182, 145], [243, 150, 102], [226, 118, 62], [255, 236, 220], [238, 160, 120], [214, 104, 52]];
    const bw = 204.8, bh = 102.4, j = 3; // 5 briques × 10 rangs par mètre
    for (let row = 0; row < n / bh; row++) {
      const off = (row % 2) * bw / 2;
      for (let x = -off; x < n; x += bw) {
        const y = row * bh, col = PAL[Math.floor(r() * PAL.length)], v = 0.92 + r() * 0.12;
        const cc = col.map((q) => Math.min(255, Math.round(q * v)));
        const seed = Math.floor(r() * 1e9);
        wrap(n, x, y, bw, bh, (dx, dy) => {
          const rr = rng(seed), X = x + dx + j, Y = y + dy + j, W = bw - 2 * j, H = bh - 2 * j;
          g.fillStyle = `rgb(${cc[0]},${cc[1]},${cc[2]})`; g.fillRect(X, Y, W, H);
          // cœur plus lumineux (lumière qui traverse le sel)
          const rg = g.createRadialGradient(X + W * (0.35 + rr() * 0.3), Y + H * (0.35 + rr() * 0.3), 4, X + W / 2, Y + H / 2, W * 0.65);
          rg.addColorStop(0, 'rgba(255,248,236,0.75)'); rg.addColorStop(0.55, 'rgba(255,220,190,0.18)'); rg.addColorStop(1, 'rgba(120,40,10,0.35)');
          g.fillStyle = rg; g.fillRect(X, Y, W, H);
          g.save(); g.beginPath(); g.rect(X, Y, W, H); g.clip();
          // veines et plans de clivage
          for (let v2 = 0; v2 < 7; v2++) {
            const lt = rr() < 0.55; g.strokeStyle = lt ? `rgba(255,250,240,${0.18 + rr() * 0.3})` : `rgba(140,50,15,${0.12 + rr() * 0.22})`; g.lineWidth = 1 + rr() * (lt ? 5 : 3);
            const sx = X + rr() * W, sy = Y + rr() * H; g.beginPath(); g.moveTo(sx, sy); g.bezierCurveTo(sx + (rr() - 0.5) * W, sy + (rr() - 0.5) * H, sx + (rr() - 0.5) * W, sy + (rr() - 0.5) * H, sx + (rr() - 0.5) * W * 1.2, sy + (rr() - 0.5) * H * 1.2); g.stroke();
          }
          for (let i = 0; i < 140; i++) { g.fillStyle = rr() < 0.6 ? `rgba(255,255,255,${0.05 + rr() * 0.15})` : `rgba(120,40,10,${0.05 + rr() * 0.12})`; g.fillRect(X + rr() * W, Y + rr() * H, 1 + rr() * 5, 1 + rr() * 5); }
          g.restore();
          // arêtes légèrement assombries
          g.strokeStyle = 'rgba(90,30,8,0.35)'; g.lineWidth = 2; g.strokeRect(X + 1, Y + 1, W - 2, H - 2);
          // relief : surface brute de sciage
          gb.fillStyle = '#c4c4c4'; gb.fillRect(X, Y, W, H);
          const rb = rng(seed + 3); for (let i = 0; i < 120; i++) { gb.fillStyle = `rgba(${rb() < 0.5 ? '0,0,0' : '255,255,255'},${0.08 + rb() * 0.12})`; gb.fillRect(X + rb() * W, Y + rb() * H, 2 + rb() * 8, 2 + rb() * 5); }
        });
      }
    }
    return tex(c, 1.0, cb, 0.2);
  }

  function cedar() {
    const n = 512, [c, g] = canvas(n), r = rng(9);
    g.fillStyle = '#ddbd86'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '150,100,50' : '120,75,35'},${0.08 + r() * 0.22})`; g.lineWidth = 1 + r() * 2.5; const y = r() * n; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(n / 3, y + r() * 10 - 5, 2 * n / 3, y + r() * 10 - 5, n, y); g.stroke(); }
    for (let i = 0; i < 6; i++) { const x = r() * n, y = r() * n; g.fillStyle = 'rgba(110,65,30,0.45)'; g.beginPath(); g.ellipse(x, y, 4 + r() * 6, 3 + r() * 4, 0, 0, 7); g.fill(); }
    noise(g, n, r, 0.25, ['#f0d7a8', '#b88e57'], 8, 2);
    return tex(c, 0.6);
  }

  // Plafond en lames de bois brun (photos de la partie basse), rainures entre lames
  function planks() {
    const n = 1024, [c, g] = canvas(n), [cb, gb] = canvas(n), r = rng(29);
    const lw = n / 4; // lames de 12,5 cm pour une texture de 0,5 m
    gb.fillStyle = '#c0c0c0'; gb.fillRect(0, 0, n, n);
    for (let x = 0; x < n; x += lw) {
      const v = 150 + r() * 32; g.fillStyle = `rgb(${v + 22},${v - 18},${v - 62})`; g.fillRect(x, 0, lw, n);
      for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(110,65,25,${0.06 + r() * 0.16})`; g.lineWidth = 1 + r() * 3; const xx = x + r() * lw; g.beginPath(); g.moveTo(xx, 0); g.bezierCurveTo(xx + r() * 8 - 4, n / 3, xx + r() * 8 - 4, 2 * n / 3, xx, n); g.stroke(); }
      for (let i = 0; i < 2; i++) { const yy = r() * n; g.fillStyle = 'rgba(110,60,25,0.55)'; g.beginPath(); g.ellipse(x + 20 + r() * (lw - 40), yy, 6 + r() * 8, 10 + r() * 14, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(60,35,15,0.7)'; g.fillRect(x, 0, 4, n);
      gb.fillStyle = '#202020'; gb.fillRect(x, 0, 6, n);
    }
    return tex(c, 0.5, cb, 0.4);
  }


  // Lames vinyle Florafloor « People » Élégance Fix 55 (échantillon) : chêne brun chaud, veinage serré sombre, lames de 1219,4 × 177,8 mm.
  // Motif de 2,439 m (2 lames) × 1,067 m (6 rangs) : la texture est déclarée sur 2,439 m et répétée 2,286 fois en y.
  function lvtPeople() {
    const W = 2048, H = 922, c = document.createElement('canvas'), cb = document.createElement('canvas'); c.width = cb.width = W; c.height = cb.height = H;
    const g = c.getContext('2d'), gb = cb.getContext('2d'), r = rng(61), rh = H / 6, pl = W / 2;
    gb.fillStyle = '#c8c8c8'; gb.fillRect(0, 0, W, H);
    for (let row = 0; row < 6; row++) {
      const y0 = row * rh, off = ((row * 0.37 + r() * 0.2) % 1) * pl; // joints décalés d'au moins 30 cm d'un rang à l'autre
      for (let k = -1; k < 2; k++) {
        const x0 = off + k * pl, seed = Math.floor(r() * 1e9), rr = rng(seed), v = 0.86 + rr() * 0.24;
        const base = [Math.round(122 * v), Math.round(90 * v), Math.round(60 * v)];
        g.save(); g.beginPath(); g.rect(x0, y0, pl, rh); g.clip();
        g.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`; g.fillRect(x0, y0, pl, rh);
        // zones plus claires ou plus foncées le long de la lame
        for (let i = 0; i < 6; i++) { const gx = x0 + rr() * pl, gw = 120 + rr() * 300; const gr = g.createLinearGradient(gx - gw, 0, gx + gw, 0); const a = rr() < 0.5 ? `rgba(70,40,15,${0.12 + rr() * 0.12})` : `rgba(215,170,110,${0.1 + rr() * 0.12})`; gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, a); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(gx - gw, y0, 2 * gw, rh); }
        // veinage : traits serrés presque parallèles, quelques arcs « cathédrale »
        for (let i = 0; i < 150; i++) {
          const yy = y0 + rr() * rh, len = 80 + rr() * 520, xs = x0 + rr() * pl; g.strokeStyle = `rgba(${rr() < 0.75 ? '45,28,14' : '200,160,110'},${0.12 + rr() * 0.3})`; g.lineWidth = 0.6 + rr() * 1.6;
          g.beginPath(); g.moveTo(xs, yy); g.bezierCurveTo(xs + len / 3, yy + (rr() - 0.5) * 6, xs + 2 * len / 3, yy + (rr() - 0.5) * 6, xs + len, yy + (rr() - 0.5) * 4); g.stroke();
        }
        for (let i = 0; i < 2; i++) { const cx = x0 + 150 + rr() * (pl - 300), cy = y0 + rh * (0.3 + rr() * 0.4); g.strokeStyle = `rgba(50,30,15,${0.25 + rr() * 0.2})`; g.lineWidth = 1.2; for (let q = 0; q < 6; q++) { g.beginPath(); g.ellipse(cx, cy, 60 + q * 26 + rr() * 10, 10 + q * 7, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); } }
        if (rr() < 0.35) { const kx = x0 + rr() * pl, ky = y0 + rh * (0.2 + rr() * 0.6); g.fillStyle = 'rgba(55,32,15,0.55)'; g.beginPath(); g.ellipse(kx, ky, 7 + rr() * 6, 4 + rr() * 3, 0, 0, 7); g.fill(); }
        g.restore();
        // joint d'about et joints longitudinaux (léger chanfrein)
        g.fillStyle = 'rgba(35,22,12,0.55)'; g.fillRect(((x0 % W) + W) % W - 1, y0, 2, rh);
        gb.fillStyle = '#6a6a6a'; gb.fillRect(((x0 % W) + W) % W - 1, y0, 2, rh);
      }
      g.fillStyle = 'rgba(35,22,12,0.5)'; g.fillRect(0, y0, W, 2); gb.fillStyle = '#6a6a6a'; gb.fillRect(0, y0, W, 2);
    }
    noise(g, 1024, r, 0.12, ['#3a2410', '#d8b080'], 2, 2);
    const t = tex(c, 2.4388, cb, 0.12); const ry = 2.4388 / 1.0668; t.repeat.set(1, ry); t.userData.bump.repeat.set(1, ry); return t;
  }

  // Fumée au sol : nappes cotonneuses sur fond transparent, raccordables
  function fog() {
    const n = 512, [c, g] = canvas(n), r = rng(41);
    for (let i = 0; i < 38; i++) {
      const x = r() * n, y = r() * n, rad = 30 + r() * 80, a = 0.25 + r() * 0.4;
      wrap(n, x - rad, y - rad, 2 * rad, 2 * rad, (dx, dy) => { const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x + dx - rad, y + dy - rad, 2 * rad, 2 * rad); });
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  // Rivière : eau vert-bleu, reflets étirés dans le sens du courant, écume
  function water() {
    const n = 512, [c, g] = canvas(n), r = rng(43);
    const bg = g.createLinearGradient(0, 0, 0, n); bg.addColorStop(0, '#1d4b5a'); bg.addColorStop(0.5, '#2b6170'); bg.addColorStop(1, '#1d4b5a'); g.fillStyle = bg; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 420; i++) {
      const x = r() * n, y = r() * n, l = 20 + r() * 90, w = 1 + r() * 3, lt = r() < 0.6;
      wrap(n, x, y - w, l, 2 * w, (dx, dy) => { g.strokeStyle = lt ? `rgba(200,235,240,${0.08 + r() * 0.25})` : `rgba(8,30,40,${0.1 + r() * 0.25})`; g.lineWidth = w; g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + l / 2, y + dy + (r() - 0.5) * 6, x + dx + l, y + dy); g.stroke(); });
    }
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(240,250,250,${0.1 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * n, r() * n, 3 + r() * 10, 1 + r() * 3, 0, 0, 7); g.fill(); }
    return tex(c, 3.0);
  }

  // Faïence murale brun-rouge 20 × 20 cm, joints clairs (salle carrelée, photo de l'arche côté entrée)
  function faience() {
    const n = 512, [c, g] = canvas(n), r = rng(51), t = n / 5;
    g.fillStyle = '#d9c7b4'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) { const v = 0.85 + r() * 0.2; g.fillStyle = `rgb(${Math.round(128 * v)},${Math.round(52 * v)},${Math.round(40 * v)})`; g.fillRect(i * t + 3, k * t + 3, t - 6, t - 6); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(i * t + 6, k * t + 6, t - 30, 8); }
    return tex(c, 1.0);
  }

  window.TEXTURES = {
    build() {
      return {
        stone: stone(), brick: brick(), planks: planks(), tiles: tiles(), lvt: lvtPeople(), saltCrust: saltCrust(), saltBricks: saltBricks(), cedar: cedar(),
        screed: flat('#55534f', ['#3f3d3a', '#6b6862', '#4a4744'], 2.0, 13, 0.9),
        plaster: flat('#cfc8bc', ['#bdb5a8', '#ddd7cc'], 2.0, 17, 0.5),
        wood: flat('#b08452', ['#9a6f42', '#c4985f', '#8d6239'], 1.0, 19, 0.8),
        step: flat('#cdbfa9', ['#b9ab95', '#ded2c0'], 1.0, 23, 0.6),
      };
    },
    fog, water, faience,
  };
})();
