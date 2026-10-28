// Images du mode Expéditions (la route des semaines), rendues en 3D (Blender, Cycles) par atelier/outils/rendu-3d/expedition_*.py.
// Fichier généré : ne pas modifier à la main (chaque script réécrit ses entrées).
// f : fichier, relatif à jeu/ ; w, h : taille logique (unités du parchemin de route 1000 × 320, ou px CSS) ; ax, ay : point
// d'ancrage dans l'image, en unités logiques depuis le coin haut-gauche (le jeu pose l'image en x = X - ax, y = Y - ay, largeur w,
// hauteur h). Les fichiers font 2 × la taille logique. coupe (cadre-page) : largeur des tranches de border-image, en unités.
// Une entrée absente = l'écran garde son dessin SVG (règle de la conception, atelier/conception/expeditions-graphismes.md).
window.JEU = window.JEU || {};
JEU.imagesExpedition = {
  "annee-fond": {"f": "assets/images/expedition/annee-fond.jpg", "w": 1000, "h": 104, "ax": 0, "ay": 0},
  "cadre-page": {"f": "assets/images/expedition/cadre-page.png", "w": 240, "h": 240, "ax": 0, "ay": 0, "coupe": 60},
  "carte-expedition": {"f": "assets/images/expedition/carte-expedition.jpg", "w": 320, "h": 190, "ax": 0, "ay": 0},
  "compagnie-espion": {"f": "assets/images/expedition/compagnie-espion.png", "w": 24, "h": 24, "ax": 12, "ay": 12},
  "compagnie-or": {"f": "assets/images/expedition/compagnie-or.png", "w": 24, "h": 24, "ax": 12, "ay": 12},
  "compagnie-plan": {"f": "assets/images/expedition/compagnie-plan.png", "w": 24, "h": 24, "ax": 12, "ay": 12},
  "compagnie-sac-plein": {"f": "assets/images/expedition/compagnie-sac-plein.png", "w": 24, "h": 28, "ax": 12, "ay": 26},
  "compagnie-sac-vide": {"f": "assets/images/expedition/compagnie-sac-vide.png", "w": 24, "h": 28, "ax": 12, "ay": 26},
  "halte-bivouac": {"f": "assets/images/expedition/halte-bivouac.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-brume": {"f": "assets/images/expedition/halte-brume.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-embuscade": {"f": "assets/images/expedition/halte-embuscade.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-escarmouche": {"f": "assets/images/expedition/halte-escarmouche.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-ev-archives": {"f": "assets/images/expedition/halte-ev-archives.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-ev-defi": {"f": "assets/images/expedition/halte-ev-defi.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-ev-espion": {"f": "assets/images/expedition/halte-ev-espion.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-ev-incendie": {"f": "assets/images/expedition/halte-ev-incendie.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-ev-marchands": {"f": "assets/images/expedition/halte-ev-marchands.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-ev-mercenaires": {"f": "assets/images/expedition/halte-ev-mercenaires.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "halte-marchand": {"f": "assets/images/expedition/halte-marchand.png", "w": 64, "h": 64, "ax": 32, "ay": 32},
  "porte-anglais": {"f": "assets/images/expedition/porte-anglais.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-bourse": {"f": "assets/images/expedition/porte-bourse.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-geographie": {"f": "assets/images/expedition/porte-geographie.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-histoire": {"f": "assets/images/expedition/porte-histoire.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-litterature": {"f": "assets/images/expedition/porte-litterature.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-parchemin": {"f": "assets/images/expedition/porte-parchemin.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-physique": {"f": "assets/images/expedition/porte-physique.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-svt": {"f": "assets/images/expedition/porte-svt.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "porte-vivres": {"f": "assets/images/expedition/porte-vivres.png", "w": 28, "h": 28, "ax": 14, "ay": 13},
  "route-fond": {"f": "assets/images/expedition/route-fond.jpg", "w": 1000, "h": 320, "ax": 0, "ay": 0},
  "sceau-cedes": {"f": "assets/images/expedition/sceau-cedes.png", "w": 40, "h": 40, "ax": 20, "ay": 20},
  "sceau-reussie": {"f": "assets/images/expedition/sceau-reussie.png", "w": 40, "h": 40, "ax": 20, "ay": 20}
};
