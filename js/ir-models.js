/*
 * Radiants infrarouges comparés. Distances en mm, tirées des notices (URL en source).
 * montage : 'chaine' = suspendu (ecartPlafond = longueur de chaîne mini), 'plafond' = fixé au plafond (ecartPlafond = entretoise).
 * minSousAppareil : distance mini entre le dessous de l'appareil et le sol.
 * minLateral : distance mini aux murs ; minInflammable : distance mini de la face rayonnante aux matériaux inflammables.
 * null = valeur non trouvée dans la notice.
 */
window.IR_MODELES = {
  trotec: {
    nom: 'Trotec IR 1500 SC', forme: 'rond', L: 420, l: 420, h: 240, P: 1500, IP: 'IP34',
    montage: 'chaine', ecartPlafond: 500, minSousAppareil: 1800, minLateral: 1000, minInflammable: 1000,
    interieur: false, plafondBois: null,
    note: 'Conçu pour « surfaces extérieures couvertes ».',
    source: 'https://fr.trotec.com/fileadmin/downloads/Beheizung/ir1500sc_ir1510sc_ir2000sc/TRT-BA-IR1500SC_IR1510SC_IR2000SC-TC-006-FR.pdf',
  },
};
