// Images pré-calculées du champ de bataille et de la campagne (rendu 3D Blender, Cycles).
// Fichier généré par atelier/outils/rendu-3d/ : ne pas modifier à la main (chaque script réécrit ses entrées).
// w, h : taille logique d'une image (px du canevas 1000 × 660) ; ax, ay : point d'ancrage dans l'image,
// en px logiques depuis le coin haut-gauche ; frames : nombre d'images côte à côte (bande horizontale).
// Les entrées « ombre-... » sont les ombres portées des tours et des places fortes : même point d'ancrage que
// le sprite, à dessiner dans une passe « sol », sous tous les sprites (après le terrain).
window.JEU = window.JEU || {};
JEU.SPRITES = {
  "place-angleterre-intact": {"src": "assets/images/td/place-angleterre-intact.png", "w": 150, "h": 150, "ax": 75, "ay": 132, "frames": 1},
  "place-france-intact": {"src": "assets/images/td/place-france-intact.png", "w": 150, "h": 150, "ax": 75, "ay": 132, "frames": 1},
  "place-omeyyades-intact": {"src": "assets/images/td/place-omeyyades-intact.png", "w": 150, "h": 150, "ax": 75, "ay": 132, "frames": 1},
  "tour-archers-angleterre-1": {"src": "assets/images/td/tour-archers-angleterre-1.png", "w": 70, "h": 84, "ax": 35, "ay": 72, "frames": 1},
  "tour-archers-france-1": {"src": "assets/images/td/tour-archers-france-1.png", "w": 70, "h": 84, "ax": 35, "ay": 72, "frames": 1},
  "tour-archers-france-2": {"src": "assets/images/td/tour-archers-france-2.png", "w": 70, "h": 84, "ax": 35, "ay": 72, "frames": 1},
  "tour-archers-france-3": {"src": "assets/images/td/tour-archers-france-3.png", "w": 70, "h": 84, "ax": 35, "ay": 72, "frames": 1},
  "tour-archers-omeyyades-1": {"src": "assets/images/td/tour-archers-omeyyades-1.png", "w": 70, "h": 84, "ax": 35, "ay": 72, "frames": 1},
  "unite-cavaliers-angleterre": {"src": "assets/images/td/unite-cavaliers-angleterre.png", "w": 40, "h": 40, "ax": 20, "ay": 36, "frames": 4},
  "unite-fantassins-france": {"src": "assets/images/td/unite-fantassins-france.png", "w": 40, "h": 40, "ax": 20, "ay": 36, "frames": 4},
  "unite-pietaille-omeyyades": {"src": "assets/images/td/unite-pietaille-omeyyades.png", "w": 40, "h": 40, "ax": 20, "ay": 36, "frames": 4}
};
