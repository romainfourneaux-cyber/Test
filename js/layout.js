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
    // Salle carrelée (voûte brique) : arc relevé sur le pignon ouest du modèle
    salleA: { x0: 3103, x1: 7996, y0: 1901, y1: 6141, naissance: 3513, cle: 5350 },
    // Frigidarium : voûte encroûtée de sel (photos de la salle du fond), naissance au sol
    frigidarium: { x0: 10054, x1: 15241, y0: 1842, y1: 6242, naissance: 2570, cle: 5070 },
    // Grotte (partie basse) : plafond bois plat, hauteur des murs du modèle
    grotte: { x0: 8283, x1: 10054, y0: 1842, y1: 6242, z: 5070 },
  },

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
    // Salle haute voûtée : 3 × B4A KD le long du mur sud, 1 × B4A KD au nord près de la porte
    { type: 'fauteuilHaut', x: 4150, y: 2300, rot: 180, nom: 'Fauteuil B4A KD — salle haute sud 1' },
    { type: 'fauteuilHaut', x: 5250, y: 2300, rot: 180, nom: 'Fauteuil B4A KD — salle haute sud 2' },
    { type: 'fauteuilHaut', x: 6350, y: 2300, rot: 180, nom: 'Fauteuil B4A KD — salle haute sud 3' },
    { type: 'fauteuilHaut', x: 3650, y: 5650, rot: 0, nom: 'Fauteuil B4A KD — salle haute nord' },
    // Salle haute : 6 × B17 côte à côte, tête au mur nord, pieds vers l'allée centrale
    { type: 'chaiseLongue', x: 4400, y: 5200, rot: 0, nom: 'Chaise longue B17 n°1' },
    { type: 'chaiseLongue', x: 5050, y: 5200, rot: 0, nom: 'Chaise longue B17 n°2' },
    { type: 'chaiseLongue', x: 5700, y: 5200, rot: 0, nom: 'Chaise longue B17 n°3' },
    { type: 'chaiseLongue', x: 6350, y: 5200, rot: 0, nom: 'Chaise longue B17 n°4' },
    { type: 'chaiseLongue', x: 7000, y: 5200, rot: 0, nom: 'Chaise longue B17 n°5' },
    { type: 'chaiseLongue', x: 7650, y: 5200, rot: 0, nom: 'Chaise longue B17 n°6' },
    // Partie basse : 4 × B6 KD (canapé 2 places), 2 de chaque côté de l'escalier, face à face
    { type: 'canape2', x: 8640, y: 2760, rot: 90, nom: 'Canapé B6 KD — bas sud-ouest' },
    { type: 'canape2', x: 9700, y: 2760, rot: 270, nom: 'Canapé B6 KD — bas sud-est' },
    { type: 'canape2', x: 8640, y: 5150, rot: 90, nom: 'Canapé B6 KD — bas nord-ouest' },
    { type: 'canape2', x: 9700, y: 5150, rot: 270, nom: 'Canapé B6 KD — bas nord-est' },
    // Alcôve sud : 2 × B20B le long des petits côtés (cote 1,67 m notée sur le plan)
    { type: 'banc', x: 5600, y: 917, rot: 90, nom: 'Banc long B20B — alcôve ouest' },
    { type: 'banc', x: 7860, y: 917, rot: 270, nom: 'Banc long B20B — alcôve est' },
  ],

  // ---------- Radiants infrarouges Trotec IR 1500 SC (Ø420 × h240, chaîne 50 cm) — repères ⊕ du plan ----------
  ir: [
    { x: 3970, y: 2970, chaine: 500, nom: 'IR salle haute sud-ouest' },
    { x: 6660, y: 2840, chaine: 500, nom: 'IR salle haute sud-est' },
    { x: 6390, y: 5040, chaine: 500, nom: 'IR salle haute nord-est' },
    { x: 3950, y: 5170, chaine: 500, nom: 'IR salle haute nord-ouest' },
    { x: 9170, y: 2800, chaine: 500, nom: 'IR partie basse sud' },
    { x: 9170, y: 5150, chaine: 500, nom: 'IR partie basse nord' },
  ],

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
