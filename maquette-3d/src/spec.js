// Référentiel géométrique de l'extension (plan "13 avril 2026", éch. 1/100).
// Toutes les valeurs ont été relevées sur les tracés vectoriels du PDF.
//
// Repère (mètres) :
//   x : axe plan "7,30"  -> 0 = face extérieure du pignon NORD, croît vers le SUD (vers le sas / maison)
//   z : axe plan "5,75"  -> 0 = face extérieure du mur EST,   croît vers l'OUEST (façade jardin)
//   y : hauteur          -> 0 = sol fini RDC
// Vu depuis l'ouest (caméra en z positif regardant vers -z), le nord est à gauche : comme la façade OUEST.

export const LV = {
  ground: -0.15,          // terrain fini
  rdc: 0.0,               // sol fini RDC
  rdcCeil: 2.40,          // sous-face plafond placo RDC
  slabTop: 2.60,          // sol fini étage
  sasRoofTop: 2.80,       // acrotère du sas (toit plat)
};

export const STAIR = {
  risers: 15,
  rise: 2.60 / 15,        // 17,3 cm
  going: 0.282,
  // Lignes de nez de marche N0..N14 (N0 = 1re contremarche, N14 = bord du palier haut).
  // Chaque ligne : [[x,z] côté mur (extérieur du tournant), [x,z] côté jour (intérieur)].
  nosings: [
    [[7.300, 0.37], [7.300, 1.21]],
    [[7.018, 0.37], [7.018, 1.21]],
    [[6.736, 0.37], [6.736, 1.21]],
    [[6.454, 0.37], [6.454, 1.21]],
    [[6.172, 0.37], [6.172, 1.21]],
    [[5.890, 0.37], [5.890, 1.21]],
    [[5.608, 0.37], [5.608, 1.21]],
    [[5.326, 0.37], [5.326, 1.21]],
    [[5.037, 0.37], [5.051, 1.21]],   // début des marches balancées
    [[4.722, 0.37], [4.802, 1.21]],
    [[4.385, 0.37], [4.575, 1.21]],
    [[4.029, 0.37], [4.367, 1.21]],
    [[3.616, 0.37], [4.177, 1.21]],
    [[3.230, 0.737], [4.070, 1.212]],
    [[3.230, 1.29], [4.070, 1.29]],    // arrivée : bord du palier étage
  ],
  // Le tournant : la marche 13 englobe l'angle (3.23 ; 0.37).
  outerCorner: [3.23, 0.37],
  wallStringerEast: { z0: 0.34, z1: 0.37 },      // limon mural le long du mur Est
  wallStringerNorth: { x0: 3.20, x1: 3.23 },     // limon mural le long de la cloison SdB/WC
  innerStringer: { z0: 1.21, z1: 1.24, x0: 4.07, x1: 7.30 }, // limon côté jour
  newel: { x0: 4.07, x1: 4.10, z0: 1.21, z1: 1.29 },        // poteau d'angle (noyau)
  // Échiffre placo côté dégagement (muret rampant) : ferme le dessous d'escalier entre x=5.27 et 7.30
  echiffre: { z0: 1.21, z1: 1.28, x0: 5.27, x1: 7.30 },
  // Trémie à l'étage
  tremie: { x0: 3.20, x1: 6.96, z0: 0.34, z1: 1.24, landingEdgeZ: 1.29, landingX1: 4.10 },
};

// Hauteur du dessus de la marche k (1..14), palier = 15
export const treadTop = (k) => k * STAIR.rise;

// Couches de murs
export const WALL = {
  extStruct: 0.22,  // bloc béton 20 + enduit Weber 2 cm
  doublage: 0.12,   // isolant 10 cm + BA13 (placo)
  partition: 0.07,  // cloison placo 72/48
};

// Toiture bi-pente, faîtage parallèle à x
export const ROOF = {
  ridgeZ: 2.875,
  slope: 0.33,            // ~18°
  ridgeTop: 5.97,         // dessus de faîtage
  thick: 0.32,            // épaisseur verticale complexe de toiture
  eaveOverhangZ: 0.40,    // débord d'égout au-delà de z=0 et z=5.75
  gableOverhangX: 0.40,   // débord de rive au-delà de x=0 et x=7.30
  x0: 0.0, x1: 7.30, z0: 0.0, z1: 5.75,
};
export const roofTop = (z) => ROOF.ridgeTop - ROOF.slope * Math.abs(z - ROOF.ridgeZ);
export const roofUnder = (z) => roofTop(z) - ROOF.thick;
// Plafond rampant placo de l'étage (sous la toiture)
export const rampant = (z) => roofUnder(z) - 0.03;

// Emprise
export const FOOT = {
  x0: 0, x1: 7.30,        // pignons extérieurs
  z0: 0, z1: 5.25,        // façade Est / façade Ouest (mur)
  zBalcony: 5.75,         // nez du balcon / avancée (posts)
  inner: { x0: 0.34, x1: 6.96, z0: 0.34, z1: 4.91 },  // faces placo
  struct: { x0: 0.22, x1: 7.08, z0: 0.22, z1: 5.03 }, // faces intérieures maçonnerie
};

// Joue du pignon nord prolongée jusqu'au nez de balcon
export const JOUE_NORD = { x0: 0.0, x1: 0.22, z0: 5.25, z1: 5.75 };
// Poteaux 20x20 en rive de balcon, enduits Weber 001 sur les deux niveaux (choix client)
export const POSTS = [
  { x0: 3.66, x1: 3.86, z0: 5.55, z1: 5.75 },
  { x0: 7.10, x1: 7.30, z0: 5.55, z1: 5.75 },
];
export const BALCONY = { x0: 0.22, x1: 7.30, z0: 5.25, z1: 5.75, y0: 2.40, y1: 2.60 };

// Sas d'entrée (liaison maison) - toit plat
export const SAS = {
  outer: { x0: 7.30, x1: 8.50, z0: 0.0, z1: 3.50 },
  inner: { x0: 7.03, x1: 8.28, z0: 0.34, z1: 3.16 },
  westWall: { z0: 3.16, zs: 3.28, z1: 3.50 },   // doublage 3.16-3.28, maçonnerie 3.28-3.50
  southWall: { x0: 8.28, x1: 8.50 },
  passage: { z0: 1.005, z1: 1.805 },            // vers la maison existante
};

// Pièces (faces placo) - utile pour le mobilier
export const ROOMS = {
  sdb: { name: 'Salle de bains', level: 'rdc', x0: 0.34, x1: 3.13, z0: 0.34, z1: 2.186, alcoveBain: { x0: 0.34, x1: 2.23, z0: 2.186, z1: 2.69 } },
  dressing: { name: 'Dressing', level: 'rdc', x0: 0.34, x1: 2.23, z0: 2.76, z1: 4.91 },
  chambre: { name: 'Chambre', level: 'rdc', x0: 2.30, x1: 6.96, z0: 2.256, z1: 4.91 },
  wc: { name: 'WC', level: 'rdc', x0: 3.20, x1: 5.20, z0: 1.31, z1: 2.186,
        alcove: { x0: 3.20, x1: 4.07, z0: 0.37, z1: 1.31 },        // sous les dernières marches
        niche: { x0: 4.07, x1: 5.27, z0: 0.37, z1: 1.21 } },        // dessous d'escalier bas
  degagement: { name: 'Dégagement', level: 'rdc', x0: 5.27, x1: 7.03, z0: 1.24, z1: 2.186 },
  sas: { name: 'Sas', level: 'rdc', x0: 7.03, x1: 8.28, z0: 0.34, z1: 3.16 },
  ch1: { name: 'Chambre 1', level: 'etage', x0: 0.34, x1: 3.13, z0: 0.34, z1: 4.91 },
  ch2: { name: 'Chambre 2', level: 'etage', x0: 4.17, x1: 6.96, z0: 1.31, z1: 4.91, alcove: { x0: 3.20, x1: 4.17, z0: 3.137, z1: 4.91 } },
  palier: { name: 'Palier', level: 'etage', x0: 3.20, x1: 4.10, z0: 1.29, z1: 3.067 },
};

// Cloisons placo 72/48 (boîtes [x0,x1]x[z0,z1]) — hauteur gérée par building.js
export const PARTITIONS_RDC = [
  { id: 'P1-sdb-wc', x0: 3.13, x1: 3.20, z0: 0.34, z1: 2.186 },
  { id: 'P2a-mur-B', x0: 3.13, x1: 6.132, z0: 2.186, z1: 2.256 },          // jusqu'au tableau porte chambre
  { id: 'P2b-mur-B', x0: 6.912, x1: 7.03, z0: 2.186, z1: 2.256 },
  { id: 'P3-dressing', x0: 2.23, x1: 2.30, z0: 2.186, z1: 4.31 },
  { id: 'P3b-dressing', x0: 2.23, x1: 2.30, z0: 4.86, z1: 4.91 },
  { id: 'P4-bain-dressing', x0: 0.34, x1: 2.23, z0: 2.69, z1: 2.76 },
  { id: 'P5-chambre-sas', x0: 6.96, x1: 7.03, z0: 2.256, z1: 3.16 },
  { id: 'P6-wc-porte', x0: 5.20, x1: 5.27, z0: 1.31, z1: 2.186 },          // percée par la porte WC
  { id: 'P7-wc-escalier', x0: 4.07, x1: 5.27, z0: 1.24, z1: 1.31 },
];
export const PARTITIONS_ETAGE = [
  { id: 'E1-ch1', x0: 3.13, x1: 3.20, z0: 0.34, z1: 4.91 },               // percée porte ch1
  { id: 'E2-ch2', x0: 4.10, x1: 4.17, z0: 1.24, z1: 3.137 },              // percée porte ch2
  { id: 'E3-fond-palier', x0: 3.20, x1: 4.10, z0: 3.067, z1: 3.137 },
  { id: 'E4-tremie', x0: 4.17, x1: 6.96, z0: 1.24, z1: 1.31 },
];

// Ouvertures. plane = position du dormant dans l'épaisseur du mur (axe normal au mur).
// Menuiseries extérieures RAL 7016, pose en applique intérieure (dormant dans le doublage).
export const OPENINGS = [
  // --- RDC façade Ouest (z = 5.25) ---
  { id: 'rdc-dressing', wall: 'W', level: 'rdc', kind: 'porte-fenetre-1v', a0: 1.185, a1: 2.185, y0: 0.0, y1: 2.10, plane: [4.91, 5.03] },
  { id: 'rdc-chambre', wall: 'W', level: 'rdc', kind: 'baie-coulissante-2v', a0: 4.26, a1: 6.46, y0: 0.0, y1: 2.10, plane: [4.91, 5.03] },
  // --- Étage façade Ouest ---
  { id: 'et-ch1', wall: 'W', level: 'etage', kind: 'baie-coulissante-2v', a0: 0.785, a1: 2.585, y0: 2.60, y1: 4.70, plane: [4.91, 5.03] },
  { id: 'et-ch2', wall: 'W', level: 'etage', kind: 'baie-coulissante-2v', a0: 4.46, a1: 6.26, y0: 2.60, y1: 4.70, plane: [4.91, 5.03] },
  // --- RDC pignon Nord (x = 0) : SdB ---
  { id: 'rdc-sdb', wall: 'N', level: 'rdc', kind: 'fenetre-1v', a0: 1.744, a1: 2.544, y0: 0.90, y1: 2.15, plane: [0.22, 0.34] },
  // --- RDC façade Est (z = 0) : WC (sous l'escalier) ---
  { id: 'rdc-wc', wall: 'E', level: 'rdc', kind: 'fenetre-1v', a0: 3.35, a1: 3.95, y0: 1.40, y1: 2.10, plane: [0.22, 0.34] },
  // --- Sas ---
  { id: 'sas-entree', wall: 'E', level: 'rdc', kind: 'porte-entree', a0: 7.307, a1: 8.183, y0: 0.0, y1: 2.10, plane: [0.22, 0.34] },
  { id: 'sas-ouest', wall: 'SAS-W', level: 'rdc', kind: 'fenetre-fixe-haute', a0: 7.49, a1: 8.09, y0: 0.0, y1: 2.10, plane: [3.38, 3.50] },
  { id: 'sas-maison', wall: 'SAS-S', level: 'rdc', kind: 'porte-interieure', a0: 1.005, a1: 1.805, y0: 0.0, y1: 2.04, plane: [8.28, 8.50] },
  // --- RDC pignon Sud, chambre -> patio ---
  { id: 'rdc-chambre-sud', wall: 'S', level: 'rdc', kind: 'porte-fenetre-1v', a0: 4.065, a1: 4.665, y0: 0.0, y1: 2.10, plane: [7.18, 7.30] },
];

export const VELUX = { x0: 3.26, x1: 4.04, z0: 1.52, z1: 2.48, side: 'E' }; // projection en plan, pan Est

// Portes intérieures (PP83 : vantail 0.83, H 2.04)
export const DOORS = [
  { id: 'porte-wc', level: 'rdc', wallAxis: 'x', plane: [5.20, 5.27], a0: 1.358, a1: 2.138, hingeAt: 2.138, opensToward: -1, openAngleDeg: 80 },
  { id: 'porte-chambre', level: 'rdc', wallAxis: 'z', plane: [2.186, 2.256], a0: 6.132, a1: 6.912, hingeAt: 6.912, opensToward: +1, openAngleDeg: 90 },
  { id: 'coulissante-sdb', level: 'rdc', wallAxis: 'z', plane: [2.186, 2.256], a0: 2.30, a1: 3.13, sliding: true, slideSide: +1, panelAt: [2.513, 3.363] },
  { id: 'galandage-dressing', level: 'rdc', wallAxis: 'x', plane: [2.23, 2.30], a0: 4.31, a1: 4.86, pocket: true },
  { id: 'porte-ch1', level: 'etage', wallAxis: 'x', plane: [3.13, 3.20], a0: 2.213, a1: 3.043, hingeAt: 3.043, opensToward: -1, openAngleDeg: 90 },
  { id: 'porte-ch2', level: 'etage', wallAxis: 'x', plane: [4.10, 4.17], a0: 2.213, a1: 3.043, hingeAt: 3.043, opensToward: +1, openAngleDeg: 90 },
];

// Équipements sanitaires relevés sur le plan
export const SANITAIRES = {
  douche: { x0: 0.34, x1: 1.24, z0: 0.34, z1: 1.54 },
  baignoire: { x0: 0.335, x1: 1.986, z0: 1.944, z1: 2.695 },
  doubleVasque: { x0: 1.83, x1: 3.13, z0: 0.34, z1: 0.89, vasques: [[2.13, 0.615], [2.83, 0.615]] },
  wc: { bati: { x0: 3.20, x1: 3.39, z0: 1.56, z1: 1.93 }, cuvette: { x0: 3.39, x1: 3.84, z0: 1.61, z1: 1.88 } },
};

// Couleurs de référence
export const COLORS = {
  ral7016: '#383E42',   // gris anthracite
  weber001: '#ECE6D8',  // enduit Weber 001 "blanc cassé"
  placo: '#F3F2EE',
};
