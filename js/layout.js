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
    // Alcôve sud : seul le sol est dessiné dans le SketchUp. HYPOTHÈSE : murs contre roche + voûte en berceau qui suit l'arc d'entrée
    // (naissance 1,81 m, clé 2,48 m au-dessus du sol, relevés sur l'arc du SketchUp). À relever sur place.
    alcove: { x0: 5473, x1: 7991, y0: 84, y1: 1751, sol: 2870, naissance: 4680, cle: 5350 },
  },
  // Grotte : plafond PLAT en bois (lames + solives) ; z = sous-face des solives (hauteur libre = z - sol)
  plafonds: [
    { nom: 'Salle haute (H 2,50 m, plan annoté)', x0: 2953, x1: 8283, y0: 1751, y1: 6291, z: 2870 + 2500 },
    { nom: 'Partie basse (H 2,50 m)', x0: 8283, x1: 10054, y0: 1842, y1: 6242, z: 2570 + 2500 },
  ],

  // ---------- Ouvertures constatées sur place mais dessinées pleines dans le SketchUp ----------
  ouvertures: [
    { nom: 'Passage alcôve sud ↔ salle haute (ouvert sur place)', x0: 5473, x1: 7991, y0: 1740, y1: 1910 },
  ],

  // ---------- Arcs en claveaux de pierre (photos) : demi-ellipses, naissance et clé au-dessus du sol (mm) ----------
  // fond de la partie basse : arc sur toute la largeur, remplissage enduit rosé, porte du frigidarium au centre
  arcs: [
    { nom: 'Arc du mur du fond (partie basse)', plan: 'x', pos: 10054, face: -1, y0: 1842, y1: 6242, sol: 2570, naissance: 900, cle: 2500, ep: 330, remplissage: 0xe7b393 },
    { nom: 'Arc de l\'arche d\'entrée (côté grotte)', plan: 'x', pos: 3103, face: 1, y0: 1751, y1: 6291, sol: 2870, naissance: 0, cle: 2472, ep: 300, sansDebord: true },
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
    // Entrée : arche vitrée en plein cintre sur toute la largeur du pignon (SketchUp : y 1751 → 6291, clé à 2,47 m), cadre alu champagne,
    // double porte centrale de 1,94 m à haut cintré + 2 parties fixes. Vitrage clair (le film décoratif teinté est retiré).
    // La barre antipanique est côté salle carrelée (photo) : la salle carrelée évacue par la grotte vers l'issue de secours de l'alcôve.
    { id: 'entree', nom: 'Arche vitrée cintrée du pignon ouest (accès)', x: 3028, y: 4071, largeur: 1940, vantaux: 2, axe: 'y', ouvre: 1, couleur: 0xb9a77a, sortie: true,
      arche: { y0: 1751, y1: 6291, sol: 2870, cle: 5342 }, antipanique: 'ouest' },
    // Issue de secours au fond de l'alcôve (photo) : arc maçonné qui suit la voûte, ensemble alu gris clair à panneaux pleins :
    // 2 vantaux (le vantail ouest, actif, porte la barre antipanique et ouvre vers la ruelle) + 2 parties fixes. Cotes ESTIMÉES d'après la photo :
    // ensemble 1,80 m, vantaux 0,75 m, fixes 0,15 m, haut à 0,28 m sous la voûte. À relever.
    { id: 'secours', nom: 'Issue de secours cintrée (fond de l\'alcôve)', x: 6732, y: 84, largeur: 1500, vantaux: 2, axe: 'x', ouvre: 1, couleur: 0xd3d6d8, sortie: true, cintree: true,
      fixes: 150, sousVoute: 280, actif: 0, estime: true },
    { id: 'frigidarium', nom: 'Porte vitrée alu gris grotte → frigidarium', x: 10182, y: 3872, largeur: 800, vantaux: 1, axe: 'y', ouvre: 1, couleur: 0x9da3a8 },
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
    // Partie basse : 1 canapé B6 KD de chaque côté de l'escalier, contre le bord du niveau haut, face aux poêles de sauna
    { type: 'canape2', x: 8658, y: 5156, rot: 90, nom: 'Canapé B6 KD — bas nord, face au poêle' },
    { type: 'canape2', x: 8658, y: 2793, rot: 90, nom: 'Canapé B6 KD — bas sud, face au poêle' },
    // Alcôve sud : 2 × B20B le long des petits côtés (cote 1,67 m notée sur le plan)
    { type: 'banc', x: 5600, y: 917, rot: 90, nom: 'Banc long B20B — alcôve ouest' },
  ],

  // ---------- CHAUFFAGE : 2 poêles de sauna au fond de la partie basse, contre le mur de la porte du frigidarium,
  // de part et d'autre de la porte, au plus près des murs de sel. Les radiants IR ne sont plus installés (pose « aucun »).
  chauffage: 'poeles',
  poele: {
    // MODÈLE PROVISOIRE : cotes et distances à remplacer par celles de la notice du modèle retenu (null = à renseigner)
    // Puissance : 2 × 6 kW = 12 kW (bilan paroi par paroi du 12/10/2026, docs/BILAN_THERMIQUE.md) ; 15 à 18 kW si l'air neuf est pris dehors sans récupération
    nom: 'Poêle de sauna électrique (modèle à choisir)', P: 6000, L: 500, Pr: 400, H: 800,
    distPlafond: null, distArriere: null, distCotes: null, distAvant: null, gardeCorps: true,
    volMin: null, volMax: null, thermostat: 'régulation maison : thermostat d\'ambiance qui pilote les contacteurs des 2 poêles', source: '',
  },
  poeles: [
    { x: 9754, y: 5690, face: 'O', murX: 10054, nom: 'Poêle nord (entre la porte et le mur de sel nord)' },
    { x: 9754, y: 2394, face: 'O', murX: 10054, nom: 'Poêle sud (entre le mur de sel sud et la porte)' },
  ],

  // ---------- Déshumidificateur mural (à la place du banc B20B est de l'alcôve) ----------
  // Trotec DH 60 (appareil déjà utilisé et connu de l'exploitation) : mural, 1253 × 651 × 255 mm, 70 kg, 38 L/24 h à 20 °C / 60 %,
  // 90 à 104 L/24 h maxi (conditions non précisées), 5–40 °C, 1,52 kW, 7,5 A (démarrage 30 A), 54 dB(A) à 3 m, condensats Ø 10 mm.
  // Dégagements pris sur la notice du DH 35 de la même gamme (30 cm dessus et dessous, 20 cm sur les côtés, 50 cm devant) : à vérifier sur la notice DH 60.
  // Capacité à 35 °C / 45 % ESTIMÉE ≈ 58 L/24 h (rapport 30/60 ÷ 20/60 ≈ 1,8 relevé sur les appareils de piscine, puis × 0,85).
  // Paroi = mur est de l'alcôve (y 84 → 1751, cote 1,67 m du plan papier). hMur = naissance de la voûte de l'alcôve à 1,81 m (SketchUp).
  // Alternatives étudiées : Microwell DRY 500 Silver (1245 × 642 × 300, 66 L/24 h à 30/60, 44 dB(A) à 1 m), Dantherm CDP 50.
  deshumidificateur: { x: 7863, y: 917, face: 'O', murX: 7991, paroi: { y0: 84, y1: 1751 }, hMur: 1810, zBas: 850,
    nom: 'Déshumidificateur Trotec DH 60 (alcôve est, à la place du banc B20B)', L: 1253, Pr: 255, H: 651,
    degLat: 200, degHaut: 300, degBas: 300, degAvant: 500,
    debit_L_j: 38, debitCond: '20 °C / 60 % HR', debit35_L_j: 58, debit35Estime: true, besoin_L_j: 36, besoinPointe_L_j: 58, tMin: 5, tMax: 40,
    bruit: '54 dB(A) à 3 m', chaleur_W: 3000,
    elec: '230 V mono, 7,5 A (démarrage 30 A), 1,52 kW : circuit dédié 16 A + différentiel 30 mA, interrupteur hors de la salle',
    condensats: 'raccord Ø 10 mm vers un siphon des eaux usées, ou pompe de relevage (option)',
    source: 'https://www.danthermgroup.com/products/trotec-dh-60' },

  // ---------- Suspensions : 6 lustres industriels « loft » finition rouille (ManoMano 14035860) ----------
  // Abat-jour cylindrique en métal Ø 33 × H 35 cm, chaîne réglable 50 cm, douille E27 100 W max (fiche ManoMano). Forme modélisée : cage cylindrique.
  // Positions : les 6 repères ⊕ du plan annoté, recalés entre les solives (solives est-ouest, axes y0 + 250 + 500 k) ; en partie basse, au-dessus des canapés,
  // à plus de 0,5 m des poêles. chaine = longueur gardée (mm) : 130 mm pour garder 2,10 m sous l'abat-jour (lames à 2,62 m).
  suspension: { nom: 'Suspension industrielle loft rouille (ManoMano 14035860)', D: 330, H: 350, chaine: 130, chaineMax: 500, IP: 'IP20', douille: 'E27, 100 W max',
    ampoule: 'LED filament E27 2200 K conseillée', source: 'https://www.manomano.fr/p/suspension-lustre-abat-jour-en-metal-loft-style-lampe-chandelier-industriel-vintage-pendentif-lumiere-e27-rouille-14035860' },
  suspensions: [
    { x: 3960, y: 2751, nom: 'Suspension salle haute sud-ouest' },
    { x: 6520, y: 2751, nom: 'Suspension salle haute sud-est' },
    { x: 3960, y: 5251, nom: 'Suspension salle haute nord-ouest' },
    { x: 6520, y: 5251, nom: 'Suspension salle haute nord-est' },
    { x: 8783, y: 2842, nom: 'Suspension partie basse sud (au-dessus du canapé)' },
    { x: 8783, y: 5342, nom: 'Suspension partie basse nord (au-dessus du canapé)' },
  ],

  // ---------- Frigidarium : ambiance froide et humide (projet) ----------
  // Fumée au sol, lumière plutôt bleue, et vue en contrebas sur la rivière par l'arc sud (ouvert dans le SketchUp : x 12913 → 15091,
  // allège à 2340, clé à 3544). Niveau de la rivière SUPPOSÉ à 3,5 m sous le sol du frigidarium (z = -930), à relever.
  frigidarium: { x0: 10330, couleur: 0x3f86ff,
    lumieres: [[12300, 4300, 2820, 0.7], [13400, 3500, 2820, 0.7], [14400, 2700, 2820, 0.65], [13000, 4200, 3900, 0.4]],
    arc: [[12913, 2340], [12927, 2652], [13019, 2932], [13190, 3184], [13423, 3379], [13701, 3502], [14002, 3544], [14303, 3502], [14580, 3379], [14813, 3184], [14984, 2932], [15079, 2644], [15091, 2340]],
    riviere: { z: -930, x0: 8500, x1: 20000, yBerge: 600, yLoin: -7500 } },

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
    thsl: [
      { x: 4500, y: 6141, face: 'S', nom: 'THSL mur nord 1 (au-dessus des B17)' },
      { x: 5800, y: 6141, face: 'S', nom: 'THSL mur nord 2 (au-dessus des B17)' },
      { x: 7180, y: 6141, face: 'S', nom: 'THSL mur nord 3 (au-dessus des B17)' },
      { x: 6000, y: 1901, face: 'N', nom: 'THSL mur sud 1 (après les fauteuils)' },
      { x: 7180, y: 1901, face: 'N', nom: 'THSL mur sud 2' },
      { x: 10054, y: 5157, face: 'O', nom: 'THSL partie basse, mur de la porte, nord' },
    ],
  },

  // ---------- Rampes (mains courantes) d'escalier ----------
  // Mains courantes arrêtées au droit de la dernière marche (nez à x 9336) : prolongées de 0,30 m, elles barraient le passage
  // vers les canapés et les poêles (le prolongement d'une marche ne doit pas créer d'obstacle aux circulations horizontales).
  rampes: [
    { x0: 8283, x1: 9366, y: 3582, nom: 'Main courante côté sud' },
    { x0: 8283, x1: 9366, y: 4232, nom: 'Main courante côté nord' },
  ],

  // ---------- Simulation ----------
  simulation: { secours: { x: 6732, y: 450 },
    entree: { x: 3250, y: 4071 },           // arrivée des curistes : derrière la porte ouest
    effectif: 18,                            // nb de curistes par séance (≤ nb d'assises de la grotte)
  },
};
