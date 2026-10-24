// Gros œuvre + doublages placo + cloisons + planchers + toiture de l'extension et du sas.
import * as THREE from 'three';
import { box, prismX, prismY, wallWithHoles, gableWithHoles, grp, add, ceilingLight, mat } from './core.js';
import {
  LV, WALL, ROOF, roofTop, roofUnder, rampant, FOOT, JOUE_NORD, POSTS, BALCONY, SAS,
  PARTITIONS_RDC, OPENINGS, VELUX, STAIR,
} from './spec.js';

const PL = 0.013;           // épaisseur BA13
const op = (id) => OPENINGS.find((o) => o.id === id);
const hole = (o) => ({ a0: o.a0, a1: o.a1, y0: o.y0, y1: o.y1 });

// Doublage collé : isolant + parement placo. side = +1 si la pièce est du côté des coordonnées croissantes.
function doublage({ axis, a0, a1, n0, n1, y0, y1, holes, side }) {
  const g = new THREE.Group();
  const nPl0 = side > 0 ? n1 - PL : n0, nPl1 = side > 0 ? n1 : n0 + PL;
  const nIs0 = side > 0 ? n0 : n0 + PL, nIs1 = side > 0 ? n1 - PL : n1;
  g.add(wallWithHoles({ axis, a0, a1, n0: nIs0, n1: nIs1, y0, y1, holes, m: 'isolant' }));
  g.add(wallWithHoles({ axis, a0, a1, n0: nPl0, n1: nPl1, y0, y1, holes, m: 'placo' }));
  return g;
}

// Doublage de pignon (haut suivant le rampant)
function doublagePignon({ x0, x1, side, z0, z1, yBot, yTop, holes = [] }) {
  const g = new THREE.Group();
  const xPl0 = side > 0 ? x1 - PL : x0, xPl1 = side > 0 ? x1 : x0 + PL;
  const xIs0 = side > 0 ? x0 : x0 + PL, xIs1 = side > 0 ? x1 - PL : x1;
  const profile = { z0, z1, yBot, yTop, breaks: [ROOF.ridgeZ] };
  g.add(gableWithHoles({ x0: xIs0, x1: xIs1, profile, holes, m: 'isolant' }));
  g.add(gableWithHoles({ x0: xPl0, x1: xPl1, profile, holes, m: 'placo' }));
  return g;
}

// Cloison 72/48 : placo | âme | placo
function cloison({ axis, a0, a1, n0, n1, y0, y1, holes = [] }) {
  const g = new THREE.Group();
  g.add(wallWithHoles({ axis, a0, a1, n0, n1: n0 + PL, y0, y1, holes, m: 'placo' }));
  g.add(wallWithHoles({ axis, a0, a1, n0: n0 + PL, n1: n1 - PL, y0, y1, holes, m: 'cloisonAme' }));
  g.add(wallWithHoles({ axis, a0, a1, n0: n1 - PL, n1, y0, y1, holes, m: 'placo' }));
  return g;
}
// Cloison courant selon z (épaisseur en x) dont le haut suit le rampant
function cloisonRampante({ x0, x1, z0, z1, y0, holes = [] }) {
  const g = new THREE.Group();
  const profile = { z0, z1, yBot: () => y0, yTop: (z) => rampant(z), breaks: [ROOF.ridgeZ] };
  g.add(gableWithHoles({ x0, x1: x0 + PL, profile, holes, m: 'placo' }));
  g.add(gableWithHoles({ x0: x0 + PL, x1: x1 - PL, profile, holes, m: 'cloisonAme' }));
  g.add(gableWithHoles({ x0: x1 - PL, x1, profile, holes, m: 'placo' }));
  return g;
}

export function buildBuilding() {
  const root = new THREE.Group();
  root.name = 'batiment';

  // =========================================================================
  // 1. Fondations / dallage + sols finis RDC
  // =========================================================================
  const sols = grp('sols-rdc', 'rdc', 'structure');
  add(sols,
    box(0.0, -0.45, 0.0, 7.30, -0.06, 5.25, 'dalle'),                 // dallage extension
    box(0.0, -0.45, 5.25, 7.30, -0.17, 5.75, 'dalle'),                // semelle loggia
    box(7.30, -0.45, 0.0, 8.50, -0.06, 3.50, 'dalle'),                // dallage sas
    box(0.22, -0.06, 0.22, 8.28, -0.015, 5.03, 'chape'),
    // carrelage : SdB, WC, dessous d'escalier, dégagement, sas
    box(0.22, -0.015, 0.22, 8.28, 0.0, 2.221, 'carrelageSol'),
    box(7.03, -0.015, 2.221, 8.28, 0.0, 3.16, 'carrelageSol'),
    box(0.22, -0.015, 2.221, 2.265, 0.0, 2.725, 'carrelageSol'),
    // parquet : chambre + dressing
    box(2.265, -0.015, 2.221, 7.03, 0.0, 5.03, 'parquet'),
    box(0.22, -0.015, 2.725, 2.265, 0.0, 5.03, 'parquet'),
  );
  root.add(sols);

  // =========================================================================
  // 2. Maçonnerie extérieure (bloc 20 + enduit Weber 001)
  // =========================================================================
  const mac = grp('maconnerie', 'rdc', 'structure');
  const eaveTopE = roofUnder(WALL.extStruct) + 0.02;
  const eaveTopW = roofUnder(FOOT.struct.z1) + 0.02;
  // Mur Est (extension)
  add(mac, wallWithHoles({ axis: 'x', a0: 0.22, a1: 7.30, n0: 0, n1: 0.22, y0: 0, y1: eaveTopE, holes: [hole(op('rdc-wc'))], m: 'crepi' }));
  // Mur Est du sas (porte d'entrée)
  add(mac, wallWithHoles({ axis: 'x', a0: 7.30, a1: 8.50, n0: 0, n1: 0.22, y0: 0, y1: LV.sasRoofTop, holes: [hole(op('sas-entree'))], m: 'crepi' }));
  // Mur Ouest (façade jardin)
  add(mac, wallWithHoles({
    axis: 'x', a0: 0.22, a1: 7.30, n0: 5.03, n1: 5.25, y0: 0, y1: eaveTopW,
    holes: ['rdc-dressing', 'rdc-chambre', 'et-ch1', 'et-ch2'].map((id) => hole(op(id))), m: 'crepi',
  }));
  // Pignon Nord (avec la joue jusqu'au nez de balcon)
  const sdbWin = op('rdc-sdb');
  add(mac, gableWithHoles({
    x0: 0, x1: 0.22,
    profile: { z0: 0, z1: JOUE_NORD.z1, yBot: () => 0, yTop: (z) => roofUnder(z) + 0.03, breaks: [ROOF.ridgeZ] },
    holes: [{ a0: sdbWin.a0, a1: sdbWin.a1, y0: sdbWin.y0, y1: sdbWin.y1 }], m: 'crepi',
  }));
  // Pignon Sud : porte sur une poutre à 2.40 au droit du sas (z<3.16), plein pied au-delà
  const sudWin = op('rdc-chambre-sud');
  add(mac, gableWithHoles({
    x0: 7.08, x1: 7.30,
    profile: { z0: 0.22, z1: 5.25, yBot: (z) => (z < 3.16 ? LV.rdcCeil : 0), yTop: (z) => roofUnder(z) + 0.03, breaks: [ROOF.ridgeZ, 3.16] },
    holes: [{ a0: sudWin.a0, a1: sudWin.a1, y0: sudWin.y0, y1: sudWin.y1 }], m: 'crepi',
  }));
  // Joue Sud de la loggia (retour du pignon jusqu'au poteau) : uniquement la poutre de rive sous toiture
  // Sas : mur Ouest (fenêtre fixe toute hauteur) et mur Sud (contre la maison)
  const sasW = op('sas-ouest');
  add(mac, wallWithHoles({ axis: 'x', a0: 7.30, a1: 8.50, n0: SAS.westWall.zs, n1: SAS.westWall.z1, y0: 0, y1: LV.sasRoofTop, holes: [hole(sasW)], m: 'crepi' }));
  add(mac, wallWithHoles({ axis: 'z', a0: 0.22, a1: SAS.westWall.zs, n0: 8.30, n1: 8.50, y0: 0, y1: LV.sasRoofTop, holes: [{ a0: SAS.passage.z0, a1: SAS.passage.z1, y0: 0, y1: 2.04 }], m: 'crepi' }));
  root.add(mac);

  // =========================================================================
  // 3. Doublages placo (isolant 10 cm + BA13) — RDC
  // =========================================================================
  const dRdc = grp('doublages-rdc', 'rdc', 'structure');
  add(dRdc,
    doublage({ axis: 'x', a0: 0.22, a1: 8.28, n0: 0.22, n1: 0.34, y0: 0, y1: LV.rdcCeil, holes: [hole(op('rdc-wc')), hole(op('sas-entree'))], side: +1 }),
    doublage({ axis: 'z', a0: 0.34, a1: 4.91, n0: 0.22, n1: 0.34, y0: 0, y1: LV.rdcCeil, holes: [hole(sdbWin)], side: +1 }),
    doublage({ axis: 'x', a0: 0.22, a1: 7.08, n0: 4.91, n1: 5.03, y0: 0, y1: LV.rdcCeil, holes: [hole(op('rdc-dressing')), hole(op('rdc-chambre'))], side: -1 }),
    doublage({ axis: 'z', a0: 3.16, a1: 4.91, n0: 6.96, n1: 7.08, y0: 0, y1: LV.rdcCeil, holes: [hole(sudWin)], side: -1 }),
    // Sas : doublage mur Ouest + parement mur Sud
    doublage({ axis: 'x', a0: 7.03, a1: 8.28, n0: SAS.westWall.z0, n1: SAS.westWall.zs, y0: 0, y1: LV.rdcCeil, holes: [hole(sasW)], side: -1 }),
    wallWithHoles({ axis: 'z', a0: 0.34, a1: 3.16, n0: 8.28, n1: 8.30, y0: 0, y1: LV.rdcCeil, holes: [{ a0: SAS.passage.z0, a1: SAS.passage.z1, y0: 0, y1: 2.04 }], m: 'placo' }),
  );
  root.add(dRdc);

  // =========================================================================
  // 4. Cloisons placo 72/48 — RDC
  // =========================================================================
  const cRdc = grp('cloisons-rdc', 'rdc', 'structure');
  for (const p of PARTITIONS_RDC) {
    const alongX = (p.x1 - p.x0) >= (p.z1 - p.z0);
    const holes = [];
    if (p.id === 'P6-wc-porte') holes.push({ a0: 1.358, a1: 2.138, y0: 0, y1: 2.04 });
    add(cRdc, cloison(alongX
      ? { axis: 'x', a0: p.x0, a1: p.x1, n0: p.z0, n1: p.z1, y0: 0, y1: LV.rdcCeil, holes }
      : { axis: 'z', a0: p.z0, a1: p.z1, n0: p.x0, n1: p.x1, y0: 0, y1: LV.rdcCeil, holes }));
  }
  // Impostes au-dessus des baies sans cloison (SdB coulissante, porte chambre, dressing)
  add(cRdc,
    cloison({ axis: 'x', a0: 2.23, a1: 3.13, n0: 2.186, n1: 2.256, y0: 2.04, y1: LV.rdcCeil }),
    cloison({ axis: 'x', a0: 6.132, a1: 6.912, n0: 2.186, n1: 2.256, y0: 2.04, y1: LV.rdcCeil }),
    cloison({ axis: 'z', a0: 4.31, a1: 4.86, n0: 2.23, n1: 2.30, y0: 2.04, y1: LV.rdcCeil }),
  );
  root.add(cRdc);

  // =========================================================================
  // 5. Plancher intermédiaire (placo plafond + dalle + parquet) avec trémie
  // =========================================================================
  const pl = grp('plancher', 'etage', 'structure');
  const T = STAIR.tremie;
  const slabRects = [
    [0.22, 3.20, 0.22, 5.03],
    [3.20, T.landingX1, T.landingEdgeZ, 5.03],
    [T.landingX1, 7.08, T.z1, 5.03],
    [T.x1, 7.08, 0.22, T.z1],
    [3.20, T.x1, 0.22, 0.34],
  ];
  for (const [x0, x1, z0, z1] of slabRects) {
    add(pl, box(x0, LV.rdcCeil, z0, x1, LV.rdcCeil + PL, z1, 'placoPlafond'));
    add(pl, box(x0, LV.rdcCeil + PL, z0, x1, LV.slabTop - 0.02, z1, 'dalle'));
  }
  // Sols finis de l'étage : carrelage sur le palier (couloir), parquet dans les chambres
  const solEt = (x0, x1, z0, z1, m) => add(pl, box(x0, LV.slabTop - 0.02, z0, x1, LV.slabTop, z1, m));
  solEt(0.22, 3.165, 0.22, 5.03, 'parquet');                        // chambre 1 (jusqu'à l'axe de la cloison)
  solEt(3.165, 3.20, 1.29, 5.03, 'parquet');
  solEt(3.20, T.landingX1, T.landingEdgeZ, 3.10, 'carrelageSol');  // palier
  solEt(3.20, T.landingX1, 3.10, 5.03, 'parquet');                  // alcôve chambre 2
  solEt(T.landingX1, 7.08, T.z1, 5.03, 'parquet');                  // chambre 2
  solEt(T.x1, 7.08, 0.22, T.z1, 'parquet');
  solEt(3.165, T.x1, 0.22, 0.34, 'parquet');
  // habillage placo des rives de trémie
  add(pl,
    box(T.landingX1, LV.rdcCeil, T.z1, T.x1, LV.slabTop - 0.02, T.z1 + PL, 'placo'),
    box(T.x1 - PL, LV.rdcCeil, 0.34, T.x1, LV.slabTop - 0.02, T.z1, 'placo'),
    box(3.20, LV.rdcCeil, 0.34, 3.20 + PL, LV.slabTop - 0.02, T.landingEdgeZ, 'placo'),
  );
  root.add(pl);
  // Plafond du sas (sous toit plat) + toit plat
  const sasRoof = grp('toit-sas', 'toit', 'structure');
  add(sasRoof,
    box(7.08, LV.rdcCeil, 0.22, 8.30, LV.rdcCeil + PL, SAS.westWall.zs, 'placoPlafond'),
    box(7.08, LV.rdcCeil + PL, 0.22, 8.30, 2.62, SAS.westWall.zs, 'dalle'),
    box(7.30, 2.62, 0.22, 8.30, 2.66, SAS.westWall.zs, 'etancheite'),
    box(8.30, LV.rdcCeil, 0.0, 8.50, LV.sasRoofTop, SAS.westWall.z1, 'crepi'),     // acrotère sud (sur mur)
    box(7.30, 2.62, 0.0, 8.30, LV.sasRoofTop, 0.22, 'crepi'),                      // acrotère est
    box(7.30, 2.62, SAS.westWall.zs, 8.30, LV.sasRoofTop, SAS.westWall.z1, 'crepi'), // acrotère ouest
    box(8.28, LV.sasRoofTop, -0.02, 8.52, LV.sasRoofTop + 0.03, SAS.westWall.z1 + 0.02, 'alu'),
    box(7.28, LV.sasRoofTop, -0.02, 8.28, LV.sasRoofTop + 0.03, 0.24, 'alu'),
    box(7.28, LV.sasRoofTop, SAS.westWall.zs - 0.02, 8.28, LV.sasRoofTop + 0.03, SAS.westWall.z1 + 0.02, 'alu'),
  );
  root.add(sasRoof);

  // =========================================================================
  // 6. Étage : doublages, cloisons rampantes
  // =========================================================================
  const dEt = grp('doublages-etage', 'etage', 'structure');
  const y0e = LV.slabTop;
  add(dEt,
    doublage({ axis: 'x', a0: 0.22, a1: 7.08, n0: 0.22, n1: 0.34, y0: y0e, y1: rampant(0.34), side: +1 }),
    doublage({ axis: 'x', a0: 0.22, a1: 7.08, n0: 4.91, n1: 5.03, y0: y0e, y1: rampant(4.91), holes: [hole(op('et-ch1')), hole(op('et-ch2'))], side: -1 }),
    doublagePignon({ x0: 0.22, x1: 0.34, side: +1, z0: 0.34, z1: 4.91, yBot: () => y0e, yTop: (z) => rampant(z) }),
    doublagePignon({ x0: 6.96, x1: 7.08, side: -1, z0: 0.34, z1: 4.91, yBot: () => y0e, yTop: (z) => rampant(z) }),
  );
  root.add(dEt);

  const cEt = grp('cloisons-etage', 'etage', 'structure');
  add(cEt,
    cloisonRampante({ x0: 3.13, x1: 3.20, z0: 0.34, z1: 4.91, y0: y0e, holes: [{ a0: 2.213, a1: 3.043, y0: y0e, y1: y0e + 2.04 }] }),
    cloisonRampante({ x0: 4.10, x1: 4.17, z0: 1.24, z1: 3.137, y0: y0e, holes: [{ a0: 2.213, a1: 3.043, y0: y0e, y1: y0e + 2.04 }] }),
    cloison({ axis: 'x', a0: 3.20, a1: 4.10, n0: 3.067, n1: 3.137, y0: y0e, y1: rampant(3.137) }),
    cloison({ axis: 'x', a0: 4.17, a1: 6.96, n0: 1.24, n1: 1.31, y0: y0e, y1: rampant(1.24) }),
  );
  root.add(cEt);

  // =========================================================================
  // 7. Toiture bi-pente (couverture anthracite, sous-face bois, plafond rampant placo)
  // =========================================================================
  const toit = grp('toiture', 'toit', 'structure');
  const R = ROOF;
  const zE = R.z0 - R.eaveOverhangZ, zW = R.z1 + R.eaveOverhangZ;
  const xN = R.x0 - R.gableOverhangX, xS = R.x1 + R.gableOverhangX;
  const zr = R.ridgeZ;
  const cov = 0.035;
  const vel = VELUX;
  // pan Est (découpé autour du Velux)
  const panE = (x0, x1, za, zb) => {
    add(toit, prismX([[za, roofUnder(za)], [zb, roofUnder(zb)], [zb, roofTop(zb) - cov], [za, roofTop(za) - cov]], x0, x1, 'boisBardage'));
    add(toit, prismX([[za, roofTop(za) - cov], [zb, roofTop(zb) - cov], [zb, roofTop(zb)], [za, roofTop(za)]], x0, x1, 'toiture'));
  };
  panE(xN, vel.x0, zE, zr);
  panE(vel.x1, xS, zE, zr);
  panE(vel.x0, vel.x1, zE, vel.z0);
  panE(vel.x0, vel.x1, vel.z1, zr);
  // pan Ouest
  add(toit, prismX([[zr, roofUnder(zr)], [zW, roofUnder(zW)], [zW, roofTop(zW) - cov], [zr, roofTop(zr) - cov]], xN, xS, 'boisBardage'));
  add(toit, prismX([[zr, roofTop(zr) - cov], [zW, roofTop(zW) - cov], [zW, roofTop(zW)], [zr, roofTop(zr)]], xN, xS, 'toiture'));
  // faîtage
  add(toit, prismX([[zr - 0.16, roofTop(zr - 0.16) - 0.005], [zr, R.ridgeTop + 0.07], [zr + 0.16, roofTop(zr + 0.16) - 0.005]], xN - 0.01, xS + 0.01, 'toiture'));
  // rives (planches blanches sur les pignons) et bandeaux d'égout bois
  for (const xg of [xN - 0.03, xS]) {
    add(toit, prismX([[zE, roofUnder(zE) - 0.04], [zr, roofUnder(zr) - 0.04], [zr, R.ridgeTop + 0.02], [zE, roofTop(zE) + 0.02]], xg, xg + 0.03, 'rive'));
    add(toit, prismX([[zr, roofUnder(zr) - 0.04], [zW, roofUnder(zW) - 0.04], [zW, roofTop(zW) + 0.02], [zr, R.ridgeTop + 0.02]], xg, xg + 0.03, 'rive'));
  }
  add(toit,
    box(xN, roofUnder(zE) - 0.06, zE - 0.03, xS, roofTop(zE) + 0.01, zE, 'boisBardage'),
    box(xN, roofUnder(zW) - 0.06, zW, xS, roofTop(zW) + 0.01, zW + 0.03, 'boisBardage'),
  );
  // gouttières + descentes EP (alu gris)
  const gut = (z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, xS - xN + 0.1, 20, 1, true, 0, Math.PI), mat('alu'));
    m.rotation.z = Math.PI / 2; m.rotation.x = z < 1 ? Math.PI / 2 : -Math.PI / 2;
    m.position.set((xN + xS) / 2, roofTop(z) - 0.06, z + (z < 1 ? -0.08 : 0.08));
    m.castShadow = true;
    return m;
  };
  add(toit, gut(zE), gut(zW));
  const descente = (x, z, yTopD) => {
    const g2 = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, yTopD - LV.ground, 16), mat('alu'));
    m.position.set(x, (yTopD + LV.ground) / 2, z); m.castShadow = true;
    g2.add(m);
    return g2;
  };
  add(toit,
    descente(-0.06, 5.68, roofTop(zW) - 0.1),
    box(-0.10, roofTop(zW) - 0.14, 5.64, -0.02, roofTop(zW) - 0.06, zW + 0.06, 'alu'),
    descente(7.36, 5.68, roofTop(zW) - 0.1),
    box(7.32, roofTop(zW) - 0.14, 5.64, 7.40, roofTop(zW) - 0.06, zW + 0.06, 'alu'),
    descente(-0.06, 0.08, roofTop(zE) - 0.1),
    box(-0.10, roofTop(zE) - 0.14, zE - 0.06, -0.02, roofTop(zE) - 0.06, 0.12, 'alu'),
  );
  root.add(toit);

  // Plafond rampant placo (sous chevrons) — au-dessus de l'étage, percé pour le Velux
  const ramp = grp('plafond-rampant', 'toit', 'plafond');
  const rampE = (x0, x1, za, zb) => add(ramp, prismX([[za, rampant(za)], [zb, rampant(zb)], [zb, roofUnder(zb)], [za, roofUnder(za)]], x0, x1, 'placoPlafond'));
  rampE(0.22, vel.x0, 0.22, zr); rampE(vel.x1, 7.08, 0.22, zr);
  rampE(vel.x0, vel.x1, 0.22, vel.z0); rampE(vel.x0, vel.x1, vel.z1, zr);
  add(ramp, prismX([[zr, rampant(zr)], [5.03, rampant(5.03)], [5.03, roofUnder(5.03)], [zr, roofUnder(zr)]], 0.22, 7.08, 'placoPlafond'));
  // chevêtre du Velux : joues placo entre rampant et couverture
  const yb = (z) => rampant(z), yt = (z) => roofTop(z) - cov;
  add(ramp,
    prismX([[vel.z0, yb(vel.z0)], [vel.z1, yb(vel.z1)], [vel.z1, yt(vel.z1)], [vel.z0, yt(vel.z0)]], vel.x0 - PL, vel.x0, 'placo'),
    prismX([[vel.z0, yb(vel.z0)], [vel.z1, yb(vel.z1)], [vel.z1, yt(vel.z1)], [vel.z0, yt(vel.z0)]], vel.x1, vel.x1 + PL, 'placo'),
    box(vel.x0, yb(vel.z0), vel.z0 - PL, vel.x1, yt(vel.z0), vel.z0, 'placo'),
    box(vel.x0, yb(vel.z1), vel.z1, vel.x1, yt(vel.z1), vel.z1 + PL, 'placo'),
  );
  root.add(ramp);

  // =========================================================================
  // 8. Loggia / balcon Ouest : poteaux, dalle en porte-à-faux, bandeau
  // =========================================================================
  const log = grp('loggia', 'rdc', 'structure');
  add(log,
    box(BALCONY.x0, BALCONY.y0, BALCONY.z0, BALCONY.x1, BALCONY.y1 - 0.03, BALCONY.z1, 'crepi'),
    box(BALCONY.x0, BALCONY.y1 - 0.03, BALCONY.z0, BALCONY.x1, BALCONY.y1, BALCONY.z1 - 0.02, 'terrasse'),
  );
  for (const p of POSTS) {
    add(log, box(p.x0, 0, p.z0, p.x1, BALCONY.y0, p.z1, 'crepi'));
    const top = roofUnder(p.z1) + 0.02;
    // poteaux d'étage : enduits Weber 001 comme le RDC (demande client, pas de bardage bois)
    const pe = box(p.x0, BALCONY.y1, p.z0, p.x1, top, p.z1, 'crepi');
    pe.userData.level = 'etage';
    add(log, pe);
  }
  // poutre de rive sous débord (relie les poteaux, porte la toiture) : enduite également
  add(log, box(0.22, roofUnder(5.75) - 0.16, 5.55, 7.30, roofUnder(5.75) + 0.02, 5.75, 'crepi'));
  root.add(log);

  // =========================================================================
  // 9. Éclairage intérieur d'ambiance (plafonniers)
  // =========================================================================
  const ecl = grp('eclairage', 'rdc', 'eclairage');
  const yC = LV.rdcCeil;
  add(ecl,
    ceilingLight(1.75, yC, 1.25, { intensity: 3.5, distance: 5 }),
    ceilingLight(4.55, yC, 1.75, { intensity: 2.2, distance: 3.5 }),
    ceilingLight(6.15, yC, 1.72, { intensity: 2.2, distance: 3.5 }),
    ceilingLight(7.70, yC, 1.80, { intensity: 2.6, distance: 4 }),
    ceilingLight(4.60, yC, 3.60, { intensity: 4.0, distance: 6 }),
    ceilingLight(1.30, yC, 3.80, { intensity: 2.5, distance: 4 }),
  );
  root.add(ecl);
  const eclE = grp('eclairage-etage', 'etage', 'eclairage');
  add(eclE,
    ceilingLight(1.70, rampant(2.6) , 2.60, { intensity: 4.0, distance: 6 }),
    ceilingLight(5.40, rampant(2.9), 2.90, { intensity: 4.0, distance: 6 }),
    ceilingLight(3.65, rampant(2.9), 2.70, { intensity: 2.0, distance: 4 }),
  );
  root.add(eclE);

  return root;
}
