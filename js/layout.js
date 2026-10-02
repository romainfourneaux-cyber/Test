/*
 * AMÉNAGEMENT — fichier à modifier pour déplacer / ajouter les équipements.
 * Coordonnées en mm, dans le repère du SketchUp (X vers l'est, Y vers le nord, Z vers le haut).
 * Pour retrouver une coordonnée : dans SketchUp, survoler un point -> la barre d'état affiche X/Y.
 * rot = orientation en degrés (0 = l'avant du meuble regarde vers -Y / le sud ; 90 = l'est ; 180 = le nord ; 270 = l'ouest).
 * Pour une chaise longue, « l'avant » = le côté des pieds.
 * Le sol est calculé automatiquement (le meuble se pose sur la surface du modèle).
 */
window.LAYOUT = {
  // ---------- Hypothèses de volumes non dessinés dans le SketchUp (à corriger après relevé) ----------
  voutes: {
    // Salle carrelée (voûte brique) : arc relevé sur le pignon ouest du modèle
    salleA: { x0: 3103, x1: 7996, y0: 1901, y1: 6141, naissance: 3513, cle: 5350 },
    // Grotte : voûte encroûtée de sel (photos salle 2) — naissance au sol, clé = hauteur des murs latéraux du modèle
    grotte: { x0: 10054, x1: 15241, y0: 1842, y1: 6242, naissance: 2570, cle: 5070 },
    // Zone de liaison basse : plafond bois plat
    liaison: { x0: 8283, x1: 10054, y0: 1842, y1: 6242, z: 5070 },
  },

  // Murs de sel rétro-éclairés : choisir 2 parmi 'courbe', 'sud' (mur avec l'arc du tunnel), 'facade' (mur de la porte)
  mursSel: ['courbe', 'sud'],

  // ---------- Portes (animées pendant la simulation) ----------
  // L'accès se fait par la double porte vitrée cintrée du pignon ouest (le mur côté alcôve sud est plein dans le SketchUp).
  portes: [
    { id: 'entree', nom: 'Porte vitrée cintrée pignon ouest (accès)', x: 3028, y: 4071, largeur: 1940, vantaux: 2, axe: 'y', ouvre: 1, couleur: 0xb9a77a },
    { id: 'grotte', nom: 'Porte de la grotte (vitrée blanche)', x: 10182, y: 3872, largeur: 800, vantaux: 1, axe: 'y', ouvre: 1, couleur: 0xf2f2f2 },
  ],

  // ---------- Mobilier Cèdre & Rondins (dimensions catalogue) ----------
  mobilier: [
    // Grotte : chaises longues parallèles, pieds vers le mur de sel courbe (3 en éventail = 30 cm entre elles, trop serré)
    { type: 'chaiseLongue', x: 13050, y: 2750, rot: 90, nom: 'Chaise longue B17 n°1' },
    { type: 'chaiseLongue', x: 12750, y: 4000, rot: 90, nom: 'Chaise longue B17 n°2' },
    { type: 'teteATete', x: 11000, y: 5250, rot: 45, nom: 'Tête-à-tête B7 TT' },
    { type: 'fauteuilHaut', x: 11350, y: 2450, rot: 180, nom: 'Fauteuil dossier haut B4A' },
    // Salle carrelée (accueil / tisanerie) — hors débattement de la porte d'accès
    { type: 'canape3', x: 4700, y: 5760, rot: 0, nom: 'Canapé 3 places B7' },
    { type: 'canape2', x: 6750, y: 5760, rot: 0, nom: 'Canapé 2 places B6' },
    { type: 'table', x: 5300, y: 3400, rot: 0, nom: 'Table rectangulaire B21B' },
    { type: 'banc', x: 5300, y: 2760, rot: 180, nom: 'Banc long B20B' },
    { type: 'banc', x: 5300, y: 4040, rot: 0, nom: 'Banc long B20B' },
    { type: 'chaise', x: 6500, y: 3400, rot: 270, nom: 'Chaise B3' },
  ],

  // ---------- Radiants infrarouges Trotec IR 1500 SC (Ø420 × h240, chaîne 50 cm) ----------
  ir: [
    { x: 11800, y: 4040, chaine: 500, nom: 'IR grotte 1' },
    { x: 13600, y: 3380, chaine: 500, nom: 'IR grotte 2' },
    { x: 4500, y: 4021, chaine: 500, nom: 'IR salle 1' },
    { x: 6700, y: 4650, chaine: 500, nom: 'IR salle 2' },
  ],

  // ---------- Rampes (mains courantes) d'escalier ----------
  rampes: [
    { x0: 8283, x1: 9636, y: 3582, nom: 'Main courante côté sud' },
    { x0: 8283, x1: 9636, y: 4232, nom: 'Main courante côté nord' },
  ],

  // ---------- Simulation ----------
  simulation: {
    entree: { x: 3250, y: 4071 },           // arrivée des curistes : derrière la porte ouest
    effectif: 5,                             // nb de curistes par séance (≤ nb d'assises de la grotte)
  },
};
