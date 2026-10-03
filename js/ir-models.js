/*
 * Radiants infrarouges comparés. Distances en mm, tirées des notices (URL en source).
 * montage : 'chaine' = suspendu (ecartPlafond = longueur de chaîne mini), 'plafond' = fixé au plafond (ecartPlafond = entretoise).
 * minSousAppareil : distance mini entre le dessous de l'appareil et le sol.
 * minLateral : distance mini aux murs ; minInflammable : distance mini de la face rayonnante aux matériaux inflammables.
 * hPose : hauteur de pose (fixation au plafond) recommandée par le fabricant, comparée à la hauteur sous plafond.
 * Pose murale : murOK, murL/murH/murP (largeur, hauteur, saillie), murSol (dessous ↔ sol), murHaut (dessus ↔ plafond),
 *   murCotes, murAvant (objets devant), murInflammable. plafondOK:false = montage au plafond interdit.
 * null = valeur non trouvée dans la notice.
 */
window.IR_MODELES = {
  ecosun600: {
    nom: 'Fenix ECOSUN 600 U (panneau plafond)', forme: 'panneau', L: 1192, l: 592, h: 30, P: 600, IP: 'IP44',
    montage: 'plafond', ecartPlafond: 0, hPose: 2500, minSousAppareil: null, minLateral: 100, minInflammable: 100,
    murOK: true, murL: 1192, murH: 592, murP: 30, murSol: 50, murHaut: 100, murCotes: 100, murAvant: 100, murInflammable: 100,
    interieur: true, plafondBois: true,
    note: 'Notice : pose verticale au mur (pose d\'origine) ou horizontale au plafond, pose horizontale au plafond sur cadre, « can be installed on flammable materials », 10 cm des objets inflammables, h = 2,5 m pour 300/600 W, 0,6 m entre panneaux. Ambiance max 30 °C : à valider pour une grotte chaude. Atmosphère saline : validation écrite du fabricant à demander.',
    source: 'https://flexel.co.uk/wp-content/uploads/2020/10/ECOSUN-U-Instructions.pdf',
  },
  ecosun300: {
    nom: 'Fenix ECOSUN 300 U (panneau plafond)', forme: 'panneau', L: 592, l: 592, h: 30, P: 300, IP: 'IP44',
    montage: 'plafond', ecartPlafond: 0, hPose: 2500, minSousAppareil: null, minLateral: 100, minInflammable: 100,
    murOK: true, murL: 592, murH: 592, murP: 30, murSol: 50, murHaut: 100, murCotes: 100, murAvant: 100, murInflammable: 100,
    interieur: true, plafondBois: true,
    note: 'Mêmes conditions que le 600 U ; puissance totale 6 × 300 W = 1,8 kW, probablement juste pour une grotte chaude de ~28 m².',
    source: 'https://flexel.co.uk/wp-content/uploads/2020/10/ECOSUN-U-Instructions.pdf',
  },
  redwell: {
    nom: 'Redwell WE 600 (panneau, IP65 en fixe)', forme: 'panneau', L: 1006, l: 606, h: 18, P: 600, IP: 'IP65',
    montage: 'plafond', ecartPlafond: 40, hPose: null, minSousAppareil: null, minLateral: 200, minInflammable: 500,
    murOK: true, murL: 1006, murH: 606, murP: 40, murSol: 200, murHaut: 200, murCotes: 200, murAvant: 500, murInflammable: 500,
    interieur: true, plafondBois: null,
    note: 'Notice : 50 cm devant, 20 cm sur les côtés, 4 cm d\'écart (pattes). Notice de montage plafond séparée non trouvée : support bois à faire confirmer par Redwell. Installateur qualifié exigé en ERP.',
    source: 'https://redwell.com/wp-content/uploads/anleitung-09-2025_low.pdf',
  },
  vitramo: {
    nom: 'Vitramo VH06262 (panneau plafond)', forme: 'panneau', L: 618, l: 618, h: 26, P: 810, IP: 'IP30',
    montage: 'plafond', ecartPlafond: 0, hPose: null, minSousAppareil: 1800, minLateral: 300, minInflammable: 600, murOK: false,
    interieur: true, plafondBois: true,
    note: 'Plafond bois admis (support 85 °C en continu). Mais IP30 et « ne pas exposer à l\'humidité » : déconseillé en atmosphère saline.',
    source: 'https://www.infrarotheizung-vitramo.de/files/downloads/datenblaetter/VH06262%20Datenblatt%20Vitramo%20Infrarotheizung.pdf',
  },
  dimplexIRX: {
    nom: 'Dimplex IRX60/120E (mural, quartz, lueur rouge-orangé)', forme: 'panneau', couleur: 'noir', lueur: 0xff3000, L: 768, l: 92, h: 100, P: 1200, IP: 'IP24',
    plafondOK: false, montage: 'mur', ecartPlafond: 0, minSousAppareil: null, minLateral: null, minInflammable: null,
    murOK: true, murL: 768, murH: 100, murP: 92, murSol: 1800, murHaut: 400, murCotes: 300, murAvant: null, murInflammable: null,
    interieur: true, plafondBois: false,
    note: 'Notice : pose murale horizontale uniquement (plafond interdit), 1,80 m du sol, 400 mm au plafond, 300 mm sur les côtés, raccordement fixe, 600/1200 W, « warm glow of medium wave infra-red », usage intérieur ou extérieur. Distance aux combustibles NON chiffrée (« keep away ») : à faire préciser par écrit par Dimplex. IP24 : protégé des projections, pas de la poussière de sel.',
    source: 'https://product-portal.gdhv.com/sites/default/files/IRX60120E%20Instructions%20-%20Issue%201.pdf',
  },
  trotec2050: {
    nom: 'Trotec IR 2050 (mural, halogène)', lueur: 0xff7a1a, forme: 'panneau', couleur: 'noir', L: 630, l: 165, h: 105, P: 2000, IP: 'IP65',
    plafondOK: false, montage: 'mur', ecartPlafond: 0, minSousAppareil: null, minLateral: null, minInflammable: null,
    murOK: true, murL: 630, murH: 105, murP: 165, murSol: 1800, murHaut: 500, murCotes: 500, murAvant: 500, murInflammable: 1000,
    interieur: false, plafondBois: false,
    note: 'Notice : montage mural uniquement, horizontal, 1,80 m du sol, 50 cm vers le haut, les côtés et l\'avant, 1 m de la face rayonnante aux inflammables. Usage extérieur ; interdit en « atmosphères agressives ».',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir2050_ir3050/TRT-BA-IR2050-IR3050-TC-007-FR.pdf',
  },
  trotec2570s: {
    nom: 'Trotec IR 2570 S (réglette murale, quartz)', lueur: 0xff7a1a, forme: 'panneau', couleur: 'noir', L: 900, l: 90, h: 200, P: 2500, IP: 'IP34',
    plafondOK: false, montage: 'mur', ecartPlafond: 0, minSousAppareil: null, minLateral: null, minInflammable: null,
    murOK: true, murL: 900, murH: 200, murP: 90, murSol: 1800, murHaut: 700, murCotes: 1000, murAvant: 1000, murInflammable: 1000,
    interieur: false, plafondBois: false,
    note: 'Notice : montage mural uniquement, horizontal, 70 cm vers le haut, 1,80 m vers le bas, 1 m sur les côtés et vers l\'avant. Usage extérieur couvert ; interdit en « atmosphères agressives » et à l\'humidité.',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir2570s/TRT-BA-IR2570S-TC-004-FR.pdf',
  },
  trotec2000c: {
    nom: 'Trotec IR 2000 C (plafond, halogène)', lueur: 0xff9a2a, forme: 'panneau', couleur: 'noir', L: 690, l: 385, h: 110, P: 2000, IP: 'IP55',
    montage: 'chaine', ecartPlafond: 300, minSousAppareil: 1800, minLateral: 1000, minInflammable: 1800, murOK: false,
    interieur: false, plafondBois: null,
    note: 'Notice : 30 cm vers le haut, 1,80 m vers le bas, 1 m sur les côtés et vers l\'avant, 1,80 m de la face rayonnante aux matériaux inflammables. Usage « extérieur couvert », interdit en « atmosphères agressives » et à l\'humidité.',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir2000c_irs2010/TRT-BA-IR2000C-IRS2010-TC-004-FR.pdf',
  },
  trotec: {
    nom: 'Trotec IR 1500 SC', lueur: 0xff5a1e, forme: 'rond', L: 420, l: 420, h: 240, P: 1500, IP: 'IP34',
    montage: 'chaine', ecartPlafond: 500, minSousAppareil: 1800, minLateral: 1000, minInflammable: 1000, murOK: false,
    interieur: false, plafondBois: null,
    note: 'Conçu pour « surfaces extérieures couvertes ».',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir1500sc_ir1510sc_ir2000sc/TRT-BA-IR1500SC_IR1510SC_IR2000SC-TC-006-FR.pdf',
  },
};
