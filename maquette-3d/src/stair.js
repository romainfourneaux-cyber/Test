// Escalier quart-tournant balancé MÉTALLIQUE (acier thermolaqué RAL 7016) + raccords avec les placos.
//
// Principe constructif modélisé (lisible en coupe dans la vue 'detail-raccord', x = 6.31) :
//  - 3 limons en tôle 12 mm (mural Est, mural Nord le long de P1, côté jour) + poteau-noyau 60x60 au tournant ;
//  - marches + contremarches en tôle pliée 5 mm (profil en Z) soudées entre limons : sous-face acier en zig-zag ;
//  - le limon mural Est est porté par la MAÇONNERIE à travers le doublage : tige M12 en scellement chimique (tamis,
//    bloc creux), entretoise tubulaire Ø25 qui traverse isolant + BA13, plot néoprène 5 mm, rondelle + écrou borgne.
//    Le limon ne touche jamais le placo : joint creux de 10 mm ; le perçage du BA13 est rebouché au mastic acrylique ;
//  - le limon Nord n'est PAS porté par la cloison P1 (angle soudé + cornière chevillée en rive de dalle) ;
//  - l'échiffre placo 72/48 sous le limon côté jour est une cloison INDÉPENDANTE de l'escalier (rail bas, rail haut
//    rampant, montants) arrêtée 10 mm sous le limon (bande résiliente) ; retour placo à x 5.27-5.34 sous les marches.
import * as THREE from 'three';
import { box, prismX, prismY, prismZ, tube, grp, add, mat, cappedMaterial } from './core.js';
import { LV, STAIR } from './spec.js';

// ---------------------------------------------------------------------------
// Constantes géométriques (m)
// ---------------------------------------------------------------------------
const R = STAIR.rise;              // 2.60 / 15
const TP = 0.005;                  // tôle pliée des marches / contremarches
const X_FOOT = 7.30;               // 1re contremarche (N0)
const ZE0 = 0.350, ZE1 = 0.362;    // limon mural Est (joint creux 10 mm avec le BA13 à z = 0.34)
const XN0 = 3.210, XN1 = 3.222;    // limon mural Nord (joint creux 10 mm avec P1 à x = 3.20)
const ZJ0 = 1.218, ZJ1 = 1.230;    // limon côté jour
const ZJC = (ZJ0 + ZJ1) / 2;
const NEWEL = { x0: 4.040, x1: 4.100, z0: 1.215, z1: 1.275 };   // poteau-noyau 60x60 (face +x au nu de la trémie x = 4.10)
const Z_LAND = 1.284;              // face de la contremarche palière (cornière de rive) ; rive de dalle à z = 1.29
const H_STR = 0.30;                // hauteur verticale des limons (~0.26 perpendiculairement à la pente)
const TOP_OFF = 0.05;              // dessus de limon = ligne de nez + 5 cm
const JOINT = 0.010;               // joints creux / résilients
const Y_PLATE = 0.008;             // platines de pied posées sur le carrelage
const PLACO_FACE_E = 0.34;         // nu du BA13 du doublage Est
const BLOC_FACE = 0.22;            // nu intérieur de la maçonnerie
// Échiffre (cloison 72/48)
const EZ0 = STAIR.echiffre.z0, EZ1 = STAIR.echiffre.z1;          // 1.21 - 1.28
const PL = 0.013;
const RAIL = 0.0012;               // épaisseur des profils galva (légèrement exagérée pour la lecture en coupe)
const X_DETAIL = 6.31;             // plan de la vue de détail

// ---------------------------------------------------------------------------
// Lignes de nez prolongées jusqu'aux faces intérieures des limons
// ---------------------------------------------------------------------------
const NS = STAIR.nosings;
function wallEnd(j) {               // extrémité côté mur
  const [[ax, az], [bx, bz]] = NS[j];
  if (j === 14) return [XN1, Z_LAND];
  if (j <= 12) { const t = (ZE1 - az) / (bz - az); return [ax + t * (bx - ax), ZE1]; }
  const t = (XN1 - ax) / (bx - ax); return [XN1, az + t * (bz - az)];
}
function jourEnd(j) {               // extrémité côté jour
  const [[ax, az], [bx, bz]] = NS[j];
  if (j === 14) return [bx, Z_LAND];
  if (j <= 12) { const t = (ZJ0 - az) / (bz - az); return [ax + t * (bx - ax), ZJ0]; }
  return [bx, bz];
}
const WE = NS.map((_, j) => wallEnd(j));
const JE = NS.map((_, j) => jourEnd(j));

// Abscisse développée le long du contour mural (face intérieure des limons Est puis Nord)
const S_CORNER = X_FOOT - XN1;
const sWall = (x, z) => (z <= ZE1 + 1e-6 && x >= XN1 ? X_FOOT - x : S_CORNER + (z - ZE1));

// Fonctions linéaires par morceaux (avec extrapolation linéaire aux extrémités)
function pwl(table) {
  const t = [...table].sort((a, b) => a[0] - b[0]);
  return (u) => {
    let i = 0;
    if (u <= t[0][0]) i = 0; else if (u >= t[t.length - 1][0]) i = t.length - 2;
    else while (i < t.length - 2 && u > t[i + 1][0]) i++;
    const [u0, v0] = t[i], [u1, v1] = t[i + 1];
    return v0 + (v1 - v0) * (u - u0) / (u1 - u0);
  };
}
// Lissage par moyenne glissante (balancement régulier des limons et mains courantes)
function smooth(f, w, n = 10) {
  return (u) => { let s = 0; for (let i = 0; i <= n; i++) s += f(u - w + (2 * w * i) / n); return s / (n + 1); };
}

// Hauteur de nez côté mur, fonction de l'abscisse développée s
const S_LAND = sWall(XN1, 1.29);
const noseWallRaw = pwl([
  ...WE.slice(0, 14).map(([x, z], j) => [sWall(x, z), (j + 1) * R]),
  [S_LAND, LV.slabTop],
]);
const noseWall = (s) => (s >= S_LAND ? LV.slabTop : noseWallRaw(s));
// Hauteur de nez côté jour, fonction de x (ligne z = 1.218 puis noyau)
const noseJour = pwl([
  ...JE.slice(0, 13).map(([x], j) => [x, (j + 1) * R]),
  [NS[13][1][0], 14 * R],
]);
const topWall = smooth((s) => noseWall(s) + TOP_OFF, 0.05);
const topJour = smooth((x) => noseJour(x) + TOP_OFF, 0.04);
const botJour = (x) => Math.max(topJour(x) - H_STR, Y_PLATE);
const botWallE = (x) => Math.max(topWall(X_FOOT - x) - H_STR, Y_PLATE);
// Dessus de l'échiffre : 10 mm sous le limon côté jour
const echTop = (x) => topJour(x) - H_STR - JOINT;

// ---------------------------------------------------------------------------
// Matériaux locaux
// ---------------------------------------------------------------------------
let LM = null;
function localMats() {
  if (LM) return LM;
  LM = {
    galva: cappedMaterial({ color: '#b9bec1', roughness: 0.38, metalness: 0.7 }, '#6c757b'),      // ossature / entretoises
    tige: cappedMaterial({ color: '#d3d7da', roughness: 0.3, metalness: 0.85 }, '#d8dcdf'),        // tige filetée zinguée
    resine: cappedMaterial({ color: '#b39c6e', roughness: 0.85 }, '#a68f5f'),                       // scellement chimique + tamis
    // poché de coupe (faces arrière seules) : compense, dans le plan de la vue de détail, les faces coplanaires
    // isolant / maçonnerie / BA13 de building.js qui masquent le poché d'origine. Invisible hors coupe (noyé dans le doublage).
    neoprene: cappedMaterial({ color: '#1e2022', roughness: 0.95 }, '#0c0d0e'),
    mastic: cappedMaterial({ color: '#f6f4ef', roughness: 0.65 }, '#e2ddd2'),                       // mastic acrylique
    bande: cappedMaterial({ color: '#34373a', roughness: 0.95 }, '#1c1e20'),                        // bande résiliente
    lampe: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff0d8', emissiveIntensity: 2.2, roughness: 0.5 }),
  };
  return LM;
}

// Anneau / tube creux d'axe z (volume fermé)
function ringZ(x, y, z0, z1, rOut, rIn, m, seg = 20) {
  const s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const h = new THREE.Path(); h.absarc(0, 0, rIn, 0, Math.PI * 2, true); s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: seg });
  g.translate(x, y, z0);
  const mesh = new THREE.Mesh(g, typeof m === 'string' ? mat(m) : m);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
// Écrou hexagonal d'axe quelconque (a -> b)
const hexNut = (a, b, r, m) => tube(a, b, r, m, 6);

// Polygone (x,y) le long d'une fonction "dessus" entre xa et xb (bas = fonction ou constante)
function bandXY(xa, xb, top, bot, step = 0.02) {
  const xs = [];
  for (let x = xa; x < xb - 1e-6; x += step) xs.push(x);
  xs.push(xb);
  const b = typeof bot === 'function' ? bot : () => bot;
  return [...xs.map((x) => [x, top(x)]), ...xs.slice().reverse().map((x) => [x, b(x)])];
}

// ---------------------------------------------------------------------------
// Fixation traversante du limon mural Est (vue de détail)
//   x : position le long du mur, y : hauteur de l'axe
//   end : 'limon' (plot + limon + écrou borgne) ou 'console' (rosace de main courante)
// ---------------------------------------------------------------------------
function throughFixing(x, y, { inLintel = false, end = 'limon' } = {}) {
  const M = localMats();
  const g = new THREE.Group();
  g.name = 'fixation-traversante';
  const zEmb = BLOC_FACE - 0.12;                                         // scellement noyé 12 cm
  if (!inLintel) g.add(tube([x, y, zEmb], [x, y, BLOC_FACE], 0.011, M.resine, 16));   // tamis Ø20 + résine (bloc creux)
  else g.add(tube([x, y, zEmb + 0.01], [x, y, BLOC_FACE], 0.0075, M.resine, 16));     // résine seule (linteau béton)
  const zSpacerEnd = end === 'limon' ? ZE0 - 0.005 : PLACO_FACE_E + 0.003;
  g.add(ringZ(x, y, BLOC_FACE, zSpacerEnd, 0.0125, 0.0068, M.galva));    // entretoise Ø25 en appui sur la maçonnerie
  g.add(ringZ(x, y, PLACO_FACE_E - 0.004, PLACO_FACE_E + 0.0015, 0.019, 0.0126, M.mastic)); // mastic acrylique
  if (end === 'limon') {
    g.add(tube([x, y, zEmb - 0.004], [x, y, ZE1 + 0.017], 0.006, M.tige, 16));         // tige filetée M12
    g.add(ringZ(x, y, ZE0 - 0.005, ZE0, 0.020, 0.0065, M.neoprene));                   // plot résilient 5 mm
    g.add(ringZ(x, y, ZE1, ZE1 + 0.0025, 0.012, 0.0065, 'ral7016'));                   // rondelle
    g.add(hexNut([x, y, ZE1 + 0.0025], [x, y, ZE1 + 0.0115], 0.0105, 'ral7016'));      // écrou borgne (6 pans)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 16, 10), mat('ral7016'));
    dome.position.set(x, y, ZE1 + 0.0115); dome.castShadow = true;
    g.add(dome);
  } else {
    g.add(tube([x, y, zEmb - 0.004], [x, y, PLACO_FACE_E + 0.009], 0.005, M.tige, 16)); // goujon M10
  }
  return g;
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------
export function buildStair() {
  const M = localMats();
  const root = grp('escalier', 'rdc', 'escalier');
  const acier = grp('escalier-acier', 'rdc', 'escalier');
  const fix = grp('escalier-fixations', 'rdc', 'escalier');
  const ech = grp('echiffre-placo', 'rdc', 'escalier');
  const gc = grp('garde-corps', 'rdc', 'escalier');

  // ---- 1. Marches (tôle 5 mm) et contremarches (profil en Z) ---------------------------
  for (let k = 1; k <= 14; k++) {
    const a0 = WE[k - 1], b0 = JE[k - 1], a1 = WE[k], b1 = JE[k];
    const poly = [a0, b0, b1, a1];
    if (k === 13) poly.push([XN1, ZE1]);                 // la marche 13 englobe l'angle
    const tread = prismY(poly, k * R - TP, k * R, 'ral7016');
    tread.name = `marche-${k}`;
    add(acier, tread);
    // contremarche k sous le nez N(k-1), épaisseur prise côté marche k
    const dx = b0[0] - a0[0], dz = b0[1] - a0[1], L = Math.hypot(dx, dz);
    let nx = -dz / L, nz = dx / L;
    const cx = (a1[0] + b1[0]) / 2 - a0[0], cz = (a1[1] + b1[1]) / 2 - a0[1];
    if (nx * cx + nz * cz < 0) { nx = -nx; nz = -nz; }
    const riser = prismY([a0, b0, [b0[0] + nx * TP, b0[1] + nz * TP], [a0[0] + nx * TP, a0[1] + nz * TP]],
      k === 1 ? 0.002 : (k - 1) * R - TP, k * R, 'ral7016');
    riser.name = `contremarche-${k}`;
    add(acier, riser);
  }
  // Contremarche palière = cornière de rive chevillée dans la rive de dalle (z = 1.29)
  add(acier,
    box(XN1, 14 * R - TP, Z_LAND, NEWEL.x0, LV.slabTop, Z_LAND + 0.005, 'ral7016', { name: 'cornière-palier' }),
    box(XN1, LV.slabTop - 0.025, Z_LAND + 0.005, NEWEL.x0, LV.slabTop - 0.02, Z_LAND + 0.045, 'ral7016'), // aile sous carrelage
  );
  for (const xb of [3.36, 3.63, 3.90]) add(fix, hexNut([xb, 2.51, Z_LAND - 0.004], [xb, 2.51, Z_LAND], 0.011, M.galva));

  // ---- 2. Limons en tôle 12 mm -------------------------------------------------------------
  // Limon mural Est (z 0.350-0.362) du pied (x = 7.30) à l'angle (soudé au limon Nord)
  const eastPoly = bandXY(XN0, X_FOOT, (x) => topWall(X_FOOT - x), botWallE);
  const limE = prismZ(eastPoly, ZE0, ZE1, 'ral7016'); limE.name = 'limon-mural-est';
  // Limon mural Nord (x 3.210-3.222) le long de P1, jusqu'à la rive du palier
  const northPts = [];
  for (let z = ZE0; z < Z_LAND - 1e-6; z += 0.02) northPts.push(z);
  northPts.push(Z_LAND);
  const nTop = (z) => Math.min(topWall(sWall(XN1, Math.max(z, ZE1))), LV.slabTop + 0.02);
  const nBot = (z) => topWall(sWall(XN1, Math.max(z, ZE1))) - H_STR;
  const northPoly = [...northPts.map((z) => [z, nTop(z)]), ...northPts.slice().reverse().map((z) => [z, nBot(z)])];
  const limN = prismX(northPoly, XN0, XN1, 'ral7016'); limN.name = 'limon-mural-nord';
  // Limon côté jour (z 1.218-1.230) du noyau au pied
  const jourPoly = bandXY(NEWEL.x1, X_FOOT, topJour, botJour);
  const limJ = prismZ(jourPoly, ZJ0, ZJ1, 'ral7016'); limJ.name = 'limon-jour';
  add(acier, limE, limN, limJ);

  // Poteau-noyau 60x60 (du dallage, platine noyée sous chape, jusqu'au niveau du palier)
  add(acier, box(NEWEL.x0, -0.048, NEWEL.z0, NEWEL.x1, LV.slabTop, NEWEL.z1, 'ral7016', { name: 'poteau-noyau' }));
  add(fix, box(NEWEL.x0 - 0.07, -0.06, NEWEL.z0 - 0.07, NEWEL.x1 + 0.07, -0.048, NEWEL.z1 + 0.07, 'ral7016'));
  for (const [ddx, ddz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const px = (NEWEL.x0 + NEWEL.x1) / 2 + ddx * 0.07, pz = (NEWEL.z0 + NEWEL.z1) / 2 + ddz * 0.07;
    add(fix, hexNut([px, -0.048, pz], [px, -0.040, pz], 0.011, M.galva));
  }
  // ancrage latéral du noyau dans la rive de dalle (encoche x = 4.10, z 1.24-1.29)
  for (const yb of [2.45, 2.54]) add(fix, hexNut([NEWEL.x0 - 0.008, yb, 1.257], [NEWEL.x0, yb, 1.257], 0.011, M.galva));

  // Platines de pied (sur carrelage, 2 chevilles chacune)
  const footPlate = (z0, z1) => {
    add(fix, box(7.13, 0, z0, 7.29, Y_PLATE, z1, 'ral7016'));
    for (const xb of [7.165, 7.255]) {
      const zc = z1 - 0.022;
      add(fix, hexNut([xb, Y_PLATE, zc], [xb, Y_PLATE + 0.008, zc], 0.010, M.galva));
    }
  };
  footPlate(0.343, 0.44);
  footPlate(1.16, 1.272);

  // ---- 3. Fixations traversantes du limon Est (tous les ~0.8 m, une dans le plan x = 6.31) --
  const fixXs = [7.07, X_DETAIL, 5.55, 4.78, 4.12, 3.29];
  const fixY = (x) => topWall(X_FOOT - x) - H_STR / 2;
  for (const x of fixXs) add(fix, throughFixing(x, fixY(x), { inLintel: x < 3.35 }));

  // ---- 4. Échiffre placo 72/48 indépendante (z 1.21-1.28, x 5.27 -> pied) ---------------------
  const EX0 = 5.27;
  let EX1 = EX0;
  while (EX1 < X_FOOT && echTop(EX1 + 0.005) > 0.035) EX1 += 0.005;
  const ezA = EZ0 + PL, ezB = EZ1 - PL;                       // faces internes des plaques
  add(ech,
    prismZ(bandXY(EX0, EX1, echTop, 0), EZ0, ezA, 'placo'),
    prismZ(bandXY(EX0, EX1, echTop, 0), ezB, EZ1, 'placo'),
  );
  // rails (U galva) : rail bas au sol, rail haut rampant sous le limon
  add(ech,
    box(EX0, 0, ezA, EX1, RAIL, ezB, M.galva),
    box(EX0, 0, ezA, EX1, 0.030, ezA + RAIL, M.galva),
    box(EX0, 0, ezB - RAIL, EX1, 0.030, ezB, M.galva),
    prismZ(bandXY(EX0, EX1, echTop, (x) => echTop(x) - RAIL), ezA, ezB, M.galva),
    prismZ(bandXY(EX0, EX1, echTop, (x) => echTop(x) - 0.030), ezA, ezA + RAIL, M.galva),
    prismZ(bandXY(EX0, EX1, echTop, (x) => echTop(x) - 0.030), ezB - RAIL, ezB, M.galva),
  );
  // montants C48 (âme côté sud) — un montant centré sur x = 6.31
  const studs = [EX0 + 0.0175, 5.79, X_DETAIL, 6.83].filter((x) => echTop(x + 0.0175) > 0.12);
  const SW = 0.0175;
  for (const xs of studs) {
    const yt = echTop(xs + SW) - RAIL;
    add(ech,
      box(xs - SW, RAIL, ezA, xs + SW, yt, ezA + RAIL, M.galva),
      box(xs - SW, RAIL, ezB - RAIL, xs + SW, yt, ezB, M.galva),
      box(xs + SW - RAIL, RAIL, ezA, xs + SW, yt, ezB, M.galva),
    );
  }
  // âme (laine minérale 45) entre montants
  const bays = [];
  let cur = EX0;
  for (const xs of studs) { if (xs - SW > cur + 0.01) bays.push([cur, xs - SW]); cur = xs + SW; }
  if (EX1 > cur + 0.01) bays.push([cur, EX1]);
  for (const [xa, xb] of bays) {
    add(ech, prismZ(bandXY(xa, xb, (x) => echTop(x) - RAIL, RAIL), ezA + RAIL, ezB - RAIL, 'cloisonAme'));
  }
  // bande résiliente dans le joint de 10 mm sous le limon
  add(ech, prismZ(bandXY(EX0, EX1, (x) => echTop(x) + JOINT, echTop), ZJC - 0.010, ZJC + 0.010, M.bande));

  // Retour placo x 5.27-5.34 (ferme le placard sous l'escalier côté niche du WC), z 0.34 -> 1.21
  // dessus 10 mm sous la sous-face acier : marche 8 (x < 5.311), marche 7 (x > 5.311), limon Est (z < 0.372)
  const RX0 = 5.27, RX1 = 5.34, RSTEP = 5.311;
  const yT8 = 8 * R - TP - JOINT, yT7 = 7 * R - TP - JOINT;
  const yUnderE = Math.min(botWallE(RX0), botWallE(RX1)) - JOINT;
  const retourLayer = (x0, x1, m) => {
    const pts = [];
    if (x1 <= RSTEP) pts.push([x0, 0], [x1, 0], [x1, yT8], [x0, yT8]);
    else if (x0 >= RSTEP) pts.push([x0, 0], [x1, 0], [x1, yT7], [x0, yT7]);
    else pts.push([x0, 0], [x1, 0], [x1, yT7], [RSTEP, yT7], [RSTEP, yT8], [x0, yT8]);
    add(ech,
      prismZ(pts, ZE1 + JOINT, EZ0, m),
      box(x0, 0, PLACO_FACE_E, x1, yUnderE, ZE1 + JOINT, m),
    );
  };
  retourLayer(RX0, RX0 + PL, 'placo');
  retourLayer(RX0 + PL, RX1 - PL, 'cloisonAme');
  retourLayer(RX1 - PL, RX1, 'placo');
  add(ech, box(RX0 + 0.004, yT8, ZE1 + JOINT, RSTEP - 0.004, yT8 + JOINT * 0.8, EZ0, M.bande));

  // ---- 5. Garde-corps côté jour (x 7.30 -> 5.27) ------------------------------------------
  const GX0 = 7.27, GX1 = 5.31;
  const hrY = (x) => noseJour(x) + 0.90;                       // axe de la main courante (0.90 au-dessus des nez)
  const nb = Math.ceil((GX0 - GX1) / 0.118);
  const pitch = (GX0 - GX1) / nb;
  for (let i = 0; i <= nb; i++) {
    const x = GX0 - i * pitch;
    const w = i === 0 || i === nb ? 0.020 : 0.007;             // poteaux d'extrémité plats 40x14, barreaux 14x14
    add(gc, box(x - w, topJour(x) - 0.004, ZJC - 0.007, x + w, hrY(x), ZJC + 0.007, 'ral7016'));
  }
  add(gc, tube([GX0 + 0.02, hrY(GX0 + 0.02), ZJC], [GX1 - 0.02, hrY(GX1 - 0.02), ZJC], 0.021, 'ral7016', 20));
  for (const xe of [GX0 + 0.02, GX1 - 0.02]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.021, 20, 12), mat('ral7016'));
    cap.position.set(xe, hrY(xe), ZJC); cap.scale.set(0.35, 1, 1); cap.castShadow = true;
    add(gc, cap);
  }

  // ---- 6. Main courante murale Ø42 (mur Est puis cloison P1) sur consoles --------------------
  const OFF = 0.066;                                           // axe à 45 mm du parement + rayon 21
  const zH = PLACO_FACE_E + OFF, xH = 3.20 + OFF, RC = 0.10;
  const xHStart = 7.25, zHEnd = 1.56;
  const hW = smooth((s) => noseWall(s), 0.12);
  const pts = [];
  const sC0 = X_FOOT - (xH + RC), sC1 = sWall(XN1, zH + RC);
  for (let x = xHStart; x > xH + RC + 1e-6; x -= 0.03) pts.push([x, zH, X_FOOT - x]);
  for (let i = 0; i <= 8; i++) {
    const a = (Math.PI / 2) * (i / 8);
    pts.push([xH + RC - RC * Math.sin(a), zH + RC - RC * Math.cos(a), sC0 + (sC1 - sC0) * (i / 8)]);
  }
  for (let z = zH + RC + 0.03; z < zHEnd; z += 0.03) pts.push([xH, z, sWall(XN1, z)]);
  pts.push([xH, zHEnd, sWall(XN1, zHEnd)]);
  const yHand = (s) => hW(Math.min(s, S_LAND)) + 0.90;
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z, s]) => new THREE.Vector3(x, yHand(s), z)), false, 'centripetal');
  const hr = new THREE.Mesh(new THREE.TubeGeometry(curve, 360, 0.021, 14, false), mat('ral7016'));
  hr.castShadow = true; hr.receiveShadow = true; hr.name = 'main-courante-murale';
  add(gc, hr);
  // retours en extrémité vers le mur + rosaces
  const yS = yHand(X_FOOT - xHStart), yE = yHand(S_LAND + 1);
  for (const [a, b] of [[[xHStart, yS, zH], [xHStart, yS, PLACO_FACE_E + 0.006]], [[xH, yE, zHEnd], [3.206, yE, zHEnd]]]) {
    add(gc, tube(a, b, 0.021, 'ral7016', 16));
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.021, 16, 10), mat('ral7016'));
    s.position.set(...a); add(gc, s);
  }
  add(gc, tube([xHStart, yS, PLACO_FACE_E], [xHStart, yS, PLACO_FACE_E + 0.006], 0.032, 'ral7016', 24));
  add(gc, tube([3.20, yE, zHEnd], [3.206, yE, zHEnd], 0.032, 'ral7016', 24));
  add(fix, throughFixing(xHStart, yS, { end: 'console' }));
  // consoles : mur Est = goujon à travers le doublage (même entretoise) ; P1/E1 = renfort dans la cloison
  const bracket = (x, z, s, wallAxis) => {
    const y = yHand(s), ya = y - 0.075;
    if (wallAxis === 'z') {
      add(gc,
        tube([x, ya, PLACO_FACE_E], [x, ya, PLACO_FACE_E + 0.006], 0.030, 'ral7016', 24),
        tube([x, ya, PLACO_FACE_E + 0.006], [x, ya, zH], 0.007, 'ral7016', 12),
        tube([x, ya, zH], [x, y - 0.018, zH], 0.007, 'ral7016', 12),
      );
      add(fix, throughFixing(x, ya, { end: 'console' }));
    } else {
      add(gc,
        tube([3.20, ya, z], [3.206, ya, z], 0.030, 'ral7016', 24),
        tube([3.206, ya, z], [xH, ya, z], 0.007, 'ral7016', 12),
        tube([xH, ya, z], [xH, y - 0.018, z], 0.007, 'ral7016', 12),
      );
    }
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 12, 8), mat('ral7016'));
    k.position.set(wallAxis === 'z' ? x : xH, ya, wallAxis === 'z' ? zH : z);
    add(gc, k);
  };
  for (const x of [6.62, 5.86, 5.10, 4.34, 3.58]) bracket(x, zH, X_FOOT - x, 'z');
  bracket(xH, 1.12, sWall(XN1, 1.12), 'x');

  // ---- 7. Applique murale de la cage d'escalier (étage, mur Est) ------------------------------
  const app = grp('applique-escalier', 'etage', 'eclairage');
  add(app,
    box(5.44, 4.10, PLACO_FACE_E, 5.56, 4.30, 0.40, 'ral7016'),
    box(5.45, 4.300, PLACO_FACE_E + 0.008, 5.55, 4.303, 0.392, M.lampe),
    box(5.45, 4.097, PLACO_FACE_E + 0.008, 5.55, 4.100, 0.392, M.lampe),
  );
  const l1 = new THREE.PointLight('#ffe2b8', 2.6, 6, 1.6); l1.position.set(5.5, 4.0, 0.5);
  app.add(l1);

  add(root, acier, fix, ech, gc, app);

  // ---- 8. Repères pour la fiche technique -------------------------------------------------------
  const xd = X_DETAIL + 0.003;
  const yF = fixY(X_DETAIL);
  const barX = (() => { for (let i = 0; i <= nb; i++) { const x = GX0 - i * pitch; if (x < X_DETAIL) return GX0 - (i - 1) * pitch; } return GX0; })();
  root.userData.callouts = [
    { view: 'detail-raccord', text: 'Bloc béton 20 cm enduit (mur Est)', pos: [xd, 0.98, 0.12] },
    { view: 'detail-raccord', text: 'Doublage : isolant 100 mm + BA13', pos: [xd, 0.98, 0.29] },
    { view: 'detail-raccord', text: 'Tige filetée M12 + scellement chimique avec tamis (bloc creux), ancrage 12 cm', pos: [xd, yF, 0.15] },
    { view: 'detail-raccord', text: 'Entretoise acier Ø25 traversant le doublage : le limon s\'appuie sur la maçonnerie', pos: [xd, yF + 0.0115, 0.28] },
    { view: 'detail-raccord', text: 'Plot résilient néoprène 5 mm + rondelle + écrou borgne', pos: [xd, yF + 0.014, ZE1 + 0.008] },
    { view: 'detail-raccord', text: 'Perçage du BA13 rebouché au mastic acrylique', pos: [xd, yF - 0.017, PLACO_FACE_E] },
    { view: 'detail-raccord', text: 'Joint creux 10 mm limon / placo', pos: [xd, yF + 0.10, (PLACO_FACE_E + ZE0) / 2] },
    { view: 'detail-raccord', text: 'Limon mural tôle 12 mm RAL 7016', pos: [xd, yF - 0.09, ZE1] },
    { view: 'detail-raccord', text: 'Marche + contremarche en tôle pliée 5 mm (profil Z)', pos: [xd, 4 * R - 0.0025, 0.80] },
    { view: 'detail-raccord', text: 'Limon côté jour tôle 12 mm', pos: [xd, topJour(X_DETAIL) - 0.10, ZJ1] },
    { view: 'detail-raccord', text: 'Bande résiliente + joint 10 mm sous le limon', pos: [xd, echTop(X_DETAIL) + 0.005, ZJC + 0.010] },
    { view: 'detail-raccord', text: 'Échiffre placo 72/48 sur ossature indépendante (rail haut rampant, montant à 0,52 m)', pos: [xd, 0.28, EZ1] },
    { view: 'detail-raccord', text: 'Montant acier galvanisé C48', pos: [xd, 0.18, (ezA + ezB) / 2] },
    { view: 'detail-raccord', text: 'Garde-corps : barreaux acier ≤ 11 cm, main courante Ø42 à 0,90 m', pos: [barX, 1.0, ZJC] },
    { view: 'detail-raccord', text: 'Dallage béton + chape + carrelage', pos: [xd, -0.03, 0.75] },
    { view: 'int-wc', text: 'Limon mural Est devant le vitrage du WC (joint creux 10 mm)', pos: [3.65, fixY(3.65), ZE1] },
    { view: 'int-wc', text: 'Sous-face acier en zig-zag (tôle pliée)', pos: [3.75, 12 * R - 0.01, 0.80] },
    { view: 'int-wc', text: 'Poteau-noyau acier 60×60 — cloison P7 en butée', pos: [NEWEL.x0, 1.40, NEWEL.z1] },
    { view: 'int-wc', text: 'Limon Nord : joint creux 10 mm avec la cloison P1 (non porteuse)', pos: [XN1, 2.10, 1.00] },
    { view: 'int-degagement', text: 'Échiffre placo indépendante, joint 10 mm sous le limon', pos: [6.40, echTop(6.40) - 0.20, EZ1] },
    { view: 'int-degagement', text: 'Garde-corps barreaudage acier RAL 7016', pos: [6.70, hrY(6.70) - 0.30, ZJC] },
    { view: 'int-degagement', text: 'Main courante murale Ø42 sur consoles', pos: [5.86, yHand(X_FOOT - 5.86), zH] },
  ];
  return root;
}

// ---------------------------------------------------------------------------
// Grandeurs utiles (mesures du compte rendu ; exportées pour contrôle)
// ---------------------------------------------------------------------------
export const stairMetrics = {
  topWallAtX: (x) => topWall(X_FOOT - x),
  bottomWallAtX: (x) => botWallE(x),
  topJourAtX: topJour,
  bottomJourAtX: botJour,
  noseJourAtX: noseJour,
  noseWallAtX: (x) => noseWall(X_FOOT - x),
  echiffreTopAtX: echTop,
  wallEnds: WE, jourEnds: JE,
};
