/*
 * AMÉNAGEMENT — fichier à modifier pour déplacer / ajouter les équipements.
 * Coordonnées en mm, dans le repère du SketchUp (X vers l'est, Y vers le nord, Z vers le haut).
 * Pour retrouver une coordonnée : dans SketchUp, survoler un point -> la barre d'état affiche X/Y.
 * rot = orientation en degrés (0 = l'avant du meuble regarde vers -Y / le sud ; 90 = l'est ; 180 = le nord ; 270 = l'ouest).
 * Pour une chaise longue, « l'avant » = le côté des pieds.
 * Le sol est calculé automatiquement (le meuble se pose sur la surface du modèle).
 *
 * Organisation des locaux (plan annoté docs/plan_annote.jpg) :
 *   - GROTTE DE SEL, chaude et sèche = salle haute voûtée (X 3103 → 8283, H 2,5 m) + partie basse (X 8283 → 10054)
 *     avec les 2 murs de sel rétro-éclairés (nord et sud de la partie basse).
 *   - Alcôve sud (Y < 1751) : 2 bancs B20B.
 *   - FRIGIDARIUM = salle du fond derrière la porte vitrée blanche (X > 10311), froide et humide, vue sur la rivière (arc du tunnel).
 */
window.LAYOUT = {
  // ---------- Volumes non dessinés dans le SketchUp (hypothèses à corriger après relevé) ----------
  voutes: {
    // Frigidarium : voûte encroûtée de sel (photos de la salle du fond), naissance au sol
    frigidarium: { x0: 10054, x1: 15241, y0: 1842, y1: 6242, naissance: 2570, cle: 5070 },
  },
  // Grotte : plafond PLAT en bois (lames + solives) ; z = sous-face des solives (hauteur libre = z - sol)
  plafonds: [
    { nom: 'Salle haute (H 2,50 m, plan annoté)', x0: 2953, x1: 8283, y0: 1751, y1: 6291, z: 2870 + 2500 },
    { nom: 'Partie basse (H 2,50 m)', x0: 8283, x1: 10054, y0: 1842, y1: 6242, z: 2570 + 2500 },
  ],

  // ---------- Murs de sel rétro-éclairés de la grotte ----------
  // Implantation validée sur croquis (murs nord et sud de la partie basse, toute la longueur),
  // avec 10 cm de vide technique derrière chaque mur pour les LED.
  mursSel: [
    { nom: 'Mur de sel nord', x0: 8300, x1: 10040, y0: 6040, y1: 6140, h: 2000 },
    { nom: 'Mur de sel sud', x0: 8300, x1: 10040, y0: 1944, y1: 2044, h: 2000 },
  ],

  // ---------- Portes (animées pendant la simulation) ----------
  // L'accès se fait par la double porte vitrée cintrée du pignon ouest (le mur côté alcôve sud est plein dans le SketchUp).
  portes: [
    { id: 'entree', nom: 'Porte vitrée cintrée pignon ouest (accès)', x: 3028, y: 4071, largeur: 1940, vantaux: 2, axe: 'y', ouvre: 1, couleur: 0xb9a77a },
    { id: 'frigidarium', nom: 'Porte vitrée blanche grotte → frigidarium', x: 10182, y: 3872, largeur: 800, vantaux: 1, axe: 'y', ouvre: 1, couleur: 0xf2f2f2 },
  ],

  // ---------- Mobilier Cèdre & Rondins — d'après le plan annoté (docs/plan_annote.jpg) ----------
  mobilier: [
    // Salle haute : 3 × B4A KD groupés côté porte le long du mur sud, 1 × B4A KD au nord à côté de la porte
    { type: 'fauteuilHaut', x: 3450, y: 2300, rot: 180, nom: 'Fauteuil B4A KD — sud 1' },
    { type: 'fauteuilHaut', x: 4120, y: 2300, rot: 180, nom: 'Fauteuil B4A KD — sud 2' },
    { type: 'fauteuilHaut', x: 4790, y: 2300, rot: 180, nom: 'Fauteuil B4A KD — sud 3' },
    { type: 'fauteuilHaut', x: 3550, y: 5700, rot: 0, nom: 'Fauteuil B4A KD — nord' },
    // Salle haute : 6 × B17 côte à côte, tête au mur nord, de la porte jusqu'au bord du niveau haut (« au ras de la porte »)
    { type: 'chaiseLongue', x: 4340, y: 5216, rot: 0, nom: 'Chaise longue B17 n°1' },
    { type: 'chaiseLongue', x: 5050, y: 5216, rot: 0, nom: 'Chaise longue B17 n°2' },
    { type: 'chaiseLongue', x: 5760, y: 5216, rot: 0, nom: 'Chaise longue B17 n°3' },
    { type: 'chaiseLongue', x: 6470, y: 5216, rot: 0, nom: 'Chaise longue B17 n°4' },
    { type: 'chaiseLongue', x: 7180, y: 5216, rot: 0, nom: 'Chaise longue B17 n°5' },
    { type: 'chaiseLongue', x: 7890, y: 5216, rot: 0, nom: 'Chaise longue B17 n°6' },
    // Partie basse : 1 chaise longue B17 de chaque côté de l'escalier, parallèle aux murs de sel, pieds vers la porte
    // (remplace les 4 canapés B6 KD ; B17 = 1,81 m pour 1,77 m de profondeur dans le SketchUp)
    { type: 'chaiseLongue', x: 9168, y: 5156, rot: 90, nom: 'Chaise longue B17 — bas nord (mur de sel nord)' },
    { type: 'chaiseLongue', x: 9168, y: 2793, rot: 90, nom: 'Chaise longue B17 — bas sud (mur de sel sud)' },
    // Alcôve sud : 2 × B20B le long des petits côtés (cote 1,67 m notée sur le plan)
    { type: 'banc', x: 5600, y: 917, rot: 90, nom: 'Banc long B20B — alcôve ouest' },
    { type: 'banc', x: 7860, y: 917, rot: 270, nom: 'Banc long B20B — alcôve est' },
  ],

  // ---------- Radiants IR : repères ⊕ du plan annoté ; modèle par défaut (liste dans js/ir-models.js) ----------
  irModele: 'ecosun600',
  ir: [
    { x: 3973, y: 2981, nom: 'IR salle haute sud-ouest' },
    { x: 6658, y: 2856, nom: 'IR salle haute sud-est' },
    { x: 6382, y: 5041, nom: 'IR salle haute nord-est' },
    { x: 3948, y: 5179, nom: 'IR salle haute nord-ouest' },
    { x: 9126, y: 3069, nom: 'IR partie basse sud' },
    { x: 9322, y: 5222, nom: 'IR partie basse nord' },
  ],

  // ---------- Radiants en pose MURALE (choix « Pose : au mur » dans le panneau) ----------
  // face = sens du rayonnement vers la pièce (N, S, E, O). Hors murs de sel et hors porte.
  irMur: {
    // implantation par défaut (panneaux)
    defaut: [
      { x: 5050, y: 6141, face: 'S', nom: 'IR mur nord 1 (au-dessus des B17)' },
      { x: 7100, y: 6141, face: 'S', nom: 'IR mur nord 2 (au-dessus des B17)' },
      { x: 6500, y: 1901, face: 'N', nom: 'IR mur sud (après les fauteuils)' },
      { x: 3103, y: 5600, face: 'E', nom: 'IR pignon ouest, à côté de la porte' },
      { x: 10054, y: 5157, face: 'O', nom: 'IR partie basse, mur de la porte, nord' },
      { x: 10054, y: 2757, face: 'O', nom: 'IR partie basse, mur de la porte, sud' },
    ],
    // implantation calculée pour le Trotec IR 2050 (50 cm sur les côtés, 1 m devant aux inflammables)
    trotec2050: [
      { x: 4500, y: 6141, face: 'S', nom: 'IR 2050 mur nord 1 (au-dessus des B17)' },
      { x: 5800, y: 6141, face: 'S', nom: 'IR 2050 mur nord 2 (au-dessus des B17)' },
      { x: 7180, y: 6141, face: 'S', nom: 'IR 2050 mur nord 3 (au-dessus des B17)' },
      { x: 6000, y: 1901, face: 'N', nom: 'IR 2050 mur sud 1 (après les fauteuils)' },
      { x: 7180, y: 1901, face: 'N', nom: 'IR 2050 mur sud 2' },
      { x: 10054, y: 5157, face: 'O', nom: 'IR 2050 partie basse, mur de la porte, nord' },
    ],
    // mêmes emplacements pour le Dimplex IRX (300 mm sur les côtés)
    dimplexIRX: [
      { x: 4500, y: 6141, face: 'S', nom: 'IRX mur nord 1 (au-dessus des B17)' },
      { x: 5800, y: 6141, face: 'S', nom: 'IRX mur nord 2 (au-dessus des B17)' },
      { x: 7180, y: 6141, face: 'S', nom: 'IRX mur nord 3 (au-dessus des B17)' },
      { x: 6000, y: 1901, face: 'N', nom: 'IRX mur sud 1 (après les fauteuils)' },
      { x: 7180, y: 1901, face: 'N', nom: 'IRX mur sud 2' },
      { x: 10054, y: 5157, face: 'O', nom: 'IRX partie basse, mur de la porte, nord' },
    ],
  },

  // ---------- Rampes (mains courantes) d'escalier ----------
  rampes: [
    { x0: 8283, x1: 9636, y: 3582, nom: 'Main courante côté sud' },
    { x0: 8283, x1: 9636, y: 4232, nom: 'Main courante côté nord' },
  ],

  // ---------- Simulation ----------
  simulation: {
    entree: { x: 3250, y: 4071 },           // arrivée des curistes : derrière la porte ouest
    effectif: 18,                            // nb de curistes par séance (≤ nb d'assises de la grotte)
  },
};
