/*
 * Radiants infrarouges comparés. Distances en mm, tirées des notices (URL en source).
 * montage : 'chaine' = suspendu (ecartPlafond = longueur de chaîne mini), 'plafond' = fixé au plafond (ecartPlafond = entretoise).
 * minSousAppareil : distance mini entre le dessous de l'appareil et le sol.
 * minLateral : distance mini aux murs ; minInflammable : distance mini de la face rayonnante aux matériaux inflammables.
 * hPose : hauteur de pose (fixation au plafond) recommandée par le fabricant, comparée à la hauteur sous plafond.
 * null = valeur non trouvée dans la notice.
 */
window.IR_MODELES = {
  ecosun600: {
    nom: 'Fenix ECOSUN 600 U (panneau plafond)', forme: 'panneau', L: 1192, l: 592, h: 30, P: 600, IP: 'IP44',
    montage: 'plafond', ecartPlafond: 0, hPose: 2500, minSousAppareil: null, minLateral: 100, minInflammable: 100,
    interieur: true, plafondBois: true,
    note: 'Notice : pose horizontale au plafond sur cadre, « can be installed on flammable materials », 10 cm des objets inflammables, h = 2,5 m pour 300/600 W, 0,6 m entre panneaux. Ambiance max 30 °C : à valider pour une grotte chaude. Atmosphère saline : validation écrite du fabricant à demander.',
    source: 'https://flexel.co.uk/wp-content/uploads/2020/10/ECOSUN-U-Instructions.pdf',
  },
  ecosun300: {
    nom: 'Fenix ECOSUN 300 U (panneau plafond)', forme: 'panneau', L: 592, l: 592, h: 30, P: 300, IP: 'IP44',
    montage: 'plafond', ecartPlafond: 0, hPose: 2500, minSousAppareil: null, minLateral: 100, minInflammable: 100,
    interieur: true, plafondBois: true,
    note: 'Mêmes conditions que le 600 U ; puissance totale 6 × 300 W = 1,8 kW, probablement juste pour une grotte chaude de ~28 m².',
    source: 'https://flexel.co.uk/wp-content/uploads/2020/10/ECOSUN-U-Instructions.pdf',
  },
  redwell: {
    nom: 'Redwell WE 600 (panneau, IP65 en fixe)', forme: 'panneau', L: 1006, l: 606, h: 18, P: 600, IP: 'IP65',
    montage: 'plafond', ecartPlafond: 40, hPose: null, minSousAppareil: null, minLateral: 200, minInflammable: 500,
    interieur: true, plafondBois: null,
    note: 'Notice : 50 cm devant, 20 cm sur les côtés, 4 cm d\'écart (pattes). Notice de montage plafond séparée non trouvée : support bois à faire confirmer par Redwell. Installateur qualifié exigé en ERP.',
    source: 'https://redwell.com/wp-content/uploads/anleitung-09-2025_low.pdf',
  },
  vitramo: {
    nom: 'Vitramo VH06262 (panneau plafond)', forme: 'panneau', L: 618, l: 618, h: 26, P: 810, IP: 'IP30',
    montage: 'plafond', ecartPlafond: 0, hPose: null, minSousAppareil: 1800, minLateral: 300, minInflammable: 600,
    interieur: true, plafondBois: true,
    note: 'Plafond bois admis (support 85 °C en continu). Mais IP30 et « ne pas exposer à l\'humidité » : déconseillé en atmosphère saline.',
    source: 'https://www.infrarotheizung-vitramo.de/files/downloads/datenblaetter/VH06262%20Datenblatt%20Vitramo%20Infrarotheizung.pdf',
  },
  trotec2000c: {
    nom: 'Trotec IR 2000 C (plafond, halogène)', forme: 'panneau', couleur: 'noir', L: 690, l: 385, h: 110, P: 2000, IP: 'IP55',
    montage: 'chaine', ecartPlafond: 300, minSousAppareil: 1800, minLateral: 1000, minInflammable: 1800,
    interieur: false, plafondBois: null,
    note: 'Notice : 30 cm vers le haut, 1,80 m vers le bas, 1 m sur les côtés et vers l\'avant, 1,80 m de la face rayonnante aux matériaux inflammables. Usage « extérieur couvert », interdit en « atmosphères agressives » et à l\'humidité.',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir2000c_irs2010/TRT-BA-IR2000C-IRS2010-TC-004-FR.pdf',
  },
  trotec: {
    nom: 'Trotec IR 1500 SC', forme: 'rond', L: 420, l: 420, h: 240, P: 1500, IP: 'IP34',
    montage: 'chaine', ecartPlafond: 500, minSousAppareil: 1800, minLateral: 1000, minInflammable: 1000,
    interieur: false, plafondBois: null,
    note: 'Conçu pour « surfaces extérieures couvertes ».',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir1500sc_ir1510sc_ir2000sc/TRT-BA-IR1500SC_IR1510SC_IR2000SC-TC-006-FR.pdf',
  },
};
