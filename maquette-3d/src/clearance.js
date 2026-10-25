// Largeurs de passage : analyse de la grille d'occupation de walk.js (buildGrid).
//
// Pour un niveau de sol donné, une cellule est "praticable" si elle porte un sol à cette altitude et
// qu'aucune matière n'occupe la tranche [sol + lo, sol + hi] (le corps d'une personne debout ; un seuil
// ou un tapis ne gênent pas). On en tire :
//   - dist : distance de chaque cellule praticable à l'obstacle le plus proche (transformée exacte) ;
//   - width : "épaisseur locale" = diamètre du plus grand cercle libre qui contient la cellule.
//     C'est la largeur du passage à cet endroit : 0,48 m au pied d'un lit, 0,73 m dans une baie de porte,
//     la largeur de la pièce au milieu d'une pièce dégagée.
export const CLEAR = {
  lo: 0.10,       // en dessous : seuils, plinthes, tapis (on les enjambe)
  hi: 1.70,       // jusqu'aux épaules / à la tête
  ok: 0.90,       // ≥ 0,90 m : circulation confortable (largeur des circulations d'un logement accessible)
  tight: 0.60,    // < 0,60 m : pas de place (une personne de face fait ~0,50 m aux épaules)
};

export const widthClass = (w) => (w >= CLEAR.ok ? 'ok' : w >= CLEAR.tight ? 'tight' : 'block');
export const WIDTH_COLORS = { ok: '#3f9a5a', tight: '#e8962e', block: '#d23c2f' };
// affichage : au centimètre sous 10 cm (jeux), sinon arrondi à 5 cm (précision de la grille de 2,5 cm)
export const fmtWidth = (w) => `${(w < 0.1 ? w : Math.round(w * 20) / 20).toFixed(2).replace('.', ',')} m`;

// Masque praticable. floorOf(k) -> altitude du sol retenue pour la cellule k (ou NaN : non praticable).
export function freeMask(grid, floorOf, { lo = CLEAR.lo, hi = CLEAR.hi } = {}) {
  const { nx, nz, IV } = grid;
  const N = nx * nz;
  const free = new Uint8Array(N), floor = new Float32Array(N).fill(NaN);
  for (let k = 0; k < N; k++) {
    const h = floorOf(k);
    if (!Number.isFinite(h)) continue;
    floor[k] = h;
    let blocked = false;
    for (let q = IV.off[k]; q < IV.off[k + 1]; q += 2) {
      if (IV.data[q + 1] > h + lo && IV.data[q] < h + hi) { blocked = true; break; }
    }
    if (!blocked) free[k] = 1;
  }
  return { free, floor };
}

// Sol d'un niveau plat (RDC, étage) : le sol de la cellule le plus proche de h, à tol près
export function flatFloor(grid, h, tol = 0.05, rect = null) {
  const { nx, cs, bx0, bz0, FL } = grid;
  return (k) => {
    if (rect) {
      const x = bx0 + ((k % nx) + 0.5) * cs, z = bz0 + (Math.floor(k / nx) + 0.5) * cs;
      if (x < rect.x0 || x > rect.x1 || z < rect.z0 || z > rect.z1) return NaN;
    }
    let best = NaN, bd = tol;
    for (let q = FL.off[k]; q < FL.off[k + 1]; q++) {
      const d = Math.abs(FL.data[q] - h);
      if (d <= bd) { bd = d; best = FL.data[q]; }
    }
    return best;
  };
}

// Sol des marches : dans l'emprise rect, le plus haut sol de la cellule à moins d'une hauteur de marche
// de la hauteur attendue expect(x, z) (au droit d'un nez de marche : la marche du dessus ; le plancher
// de l'étage au-dessus de la volée n'est jamais pris pour une marche)
export function stairFloor(grid, rect, expect, tol = 0.19) {
  const { nx, cs, bx0, bz0, FL } = grid;
  return (k) => {
    const x = bx0 + ((k % nx) + 0.5) * cs, z = bz0 + (Math.floor(k / nx) + 0.5) * cs;
    if (x < rect.x0 || x > rect.x1 || z < rect.z0 || z > rect.z1) return NaN;
    const e = expect(x, z);
    let best = NaN;
    for (let q = FL.off[k]; q < FL.off[k + 1]; q++) {
      const f = FL.data[q];
      if (Math.abs(f - e) <= tol && !(f <= best)) best = f;
    }
    return best;
  };
}

// Largeur libre d'un passage traversé au point (x, z) dans la direction (tx, tz) : plus petite corde
// libre passant par le point, à ±spread degrés de la perpendiculaire au mouvement. Dans une baie de
// porte : l'ouverture ; dans un couloir : sa largeur ; dans une pièce dégagée : grande.
// alt : cartes voisines dont les cellules praticables ne bornent pas la corde (volée d'escalier vue du
// palier ou du sas : le vide de la trémie n'est pas un obstacle pour qui en sort).
export function chordWidth(grid, map, x, z, tx, tz, { spread = 35, step = 5, max = 2.5, alt = [] } = {}) {
  const { nx, nz, cs, bx0, bz0 } = grid;
  const L = Math.hypot(tx, tz) || 1;
  const px = -tz / L, pz = tx / L;
  const free = (xx, zz) => {
    const i = Math.floor((xx - bx0) / cs), j = Math.floor((zz - bz0) / cs);
    return i >= 0 && j >= 0 && i < nx && j < nz && map.free[j * nx + i] === 1;
  };
  // départ : centre de la cellule praticable la plus proche
  if (!free(x, z)) {
    const ci = Math.floor((x - bx0) / cs), cj = Math.floor((z - bz0) / cs), n = Math.ceil(0.10 / cs);
    let bd = Infinity, bx = NaN, bz = NaN;
    for (let dj = -n; dj <= n; dj++) for (let di = -n; di <= n; di++) {
      const i = ci + di, j = cj + dj;
      if (i < 0 || j < 0 || i >= nx || j >= nz || !map.free[j * nx + i]) continue;
      if (di * di + dj * dj < bd) { bd = di * di + dj * dj; bx = bx0 + (i + 0.5) * cs; bz = bz0 + (j + 0.5) * cs; }
    }
    if (!Number.isFinite(bx)) return NaN;
    x = bx; z = bz;
  }
  const h = cs * 0.25;
  const pass = (xx, zz) => {
    if (free(xx, zz)) return true;
    if (!alt.length) return false;
    const i = Math.floor((xx - bx0) / cs), j = Math.floor((zz - bz0) / cs);
    return i >= 0 && j >= 0 && i < nx && j < nz && alt.some((a) => a.free[j * nx + i] === 1);
  };
  const ray = (dx, dz) => { for (let t = h; t < max; t += h) if (!pass(x + dx * t, z + dz * t)) return t - h * 0.5 + cs * 0.5; return max; };
  let best = Infinity;
  for (let a = -spread; a <= spread; a += step) {
    const r = (a * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
    const dx = px * c - pz * sn, dz = px * sn + pz * c;
    const w = ray(dx, dz) + ray(-dx, -dz);
    if (w < best) best = w;
  }
  return best;
}

// Transformée de distance euclidienne exacte (Felzenszwalb & Huttenlocher), en mètres :
// distance entre centres de cellules (une cellule est marquée bloquée dès qu'un obstacle la touche :
// la surface de l'obstacle est en moyenne à mi-cellule).
export function distanceMap(grid, free) {
  const { nx, nz, cs } = grid;
  const INF = 1e12;
  const D = new Float64Array(nx * nz);
  for (let k = 0; k < D.length; k++) D[k] = free[k] ? INF : 0;
  const n = Math.max(nx, nz);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), zz = new Float64Array(n + 1);
  function dt1(len) {
    let k = 0; v[0] = 0; zz[0] = -INF; zz[1] = INF;
    for (let q = 1; q < len; q++) {
      let s;
      for (;;) {
        s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        if (s <= zz[k]) { k--; if (k < 0) { k = 0; break; } } else break;
      }
      k++; v[k] = q; zz[k] = s; zz[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < len; q++) {
      while (zz[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) f[j] = D[j * nx + i];
    dt1(nz);
    for (let j = 0; j < nz; j++) D[j * nx + i] = d[j];
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) f[i] = D[j * nx + i];
    dt1(nx);
    for (let i = 0; i < nx; i++) D[j * nx + i] = d[i];
  }
  const out = new Float32Array(nx * nz);
  for (let k = 0; k < out.length; k++) out[k] = free[k] ? Math.sqrt(D[k]) * cs : 0;
  return out;
}

// Épaisseur locale : chaque cellule reçoit le diamètre du plus grand disque libre qui la contient
export function widthMap(grid, free, dist, cap = 2.4) {
  const { nx, nz, cs } = grid;
  const W = new Float32Array(nx * nz);
  // disques triés du plus grand au plus petit : une cellule déjà couverte par un plus grand est ignorée
  // un disque contenu dans celui d'une cellule voisine (dist voisine ≥ dist + pas) est inutile :
  // il ne reste que les centres proches de l'axe médian des espaces libres
  const order = [];
  for (let k = 0; k < free.length; k++) {
    if (!free[k] || dist[k] <= 0) continue;
    const i = k % nx, j = (k - i) / nx, d = dist[k] + cs * 0.999;
    if ((i > 0 && dist[k - 1] >= d) || (i < nx - 1 && dist[k + 1] >= d) || (j > 0 && dist[k - nx] >= d) || (j < nz - 1 && dist[k + nx] >= d)) continue;
    order.push(k);
  }
  order.sort((a, b) => dist[b] - dist[a]);
  for (const k of order) {
    const r = Math.min(dist[k], cap / 2), w = 2 * r;
    const ci = k % nx, cj = Math.floor(k / nx), n = Math.floor(r / cs + 0.5);
    for (let dj = -n; dj <= n; dj++) {
      const j = cj + dj; if (j < 0 || j >= nz) continue;
      for (let di = -n; di <= n; di++) {
        const i = ci + di; if (i < 0 || i >= nx) continue;
        if ((di * di + dj * dj) * cs * cs > (r + cs * 0.5) * (r + cs * 0.5)) continue;
        const q = j * nx + i;
        if (free[q] && W[q] < w) W[q] = w;
      }
    }
  }
  return W;
}

// Analyse complète d'une zone
export function analyse(grid, floorOf, opts) {
  const { free, floor } = freeMask(grid, floorOf, opts);
  const dist = distanceMap(grid, free);
  const width = widthMap(grid, free, dist);
  return { free, floor, dist, width };
}

// Valeur interpolée au plus près d'un point (x, z) : on prend la cellule praticable la plus proche
export function sampleMap(grid, map, field, x, z, search = 0.08) {
  const { nx, nz, cs, bx0, bz0 } = grid;
  const ci = Math.floor((x - bx0) / cs), cj = Math.floor((z - bz0) / cs), n = Math.ceil(search / cs);
  let best = NaN, bd = Infinity;
  for (let dj = -n; dj <= n; dj++) {
    const j = cj + dj; if (j < 0 || j >= nz) continue;
    for (let di = -n; di <= n; di++) {
      const i = ci + di; if (i < 0 || i >= nx) continue;
      const k = j * nx + i;
      if (!map.free[k]) continue;
      const dd = di * di + dj * dj;
      if (dd < bd) { bd = dd; best = map[field][k]; }
    }
  }
  return best;
}
