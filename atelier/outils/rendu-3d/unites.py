# -*- coding: utf-8 -*-
"""Troupes du champ de bataille : bandes de 4 images de marche, tournées vers la droite.

Usage : python3 atelier/outils/rendu-3d/unites.py [nom ...] [--images N]
  nom : par exemple unite-fantassins-france (par défaut : toutes les troupes du tableau UNITES)
  --images N : ne rendre que les N premières images de la marche (essais rapides)
Sorties : jeu/assets/images/td/unite-<type>-<camp>.png (+ entrées du manifeste sprites.js).
Ancrage : bas-centre moins 4 px logiques (le point de la route est sous les pieds) ; chaque image garde au moins
2 px rendus transparents sur ses bords (contrôle automatique), pour ne jamais déborder sur sa voisine dans la bande.

Échelles : piétons 18 px/m, cavaliers 15 px/m (un cavalier reste plus haut qu'un piéton), tour de siège 12 px/m.
Éclairage : le soleil commun, l'appoint côté caméra et une lumière de contour chaude qui allume le haut des figures.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import figurines as F  # noqa: E402
import engins as E  # noqa: E402

IMAGES = 4  # images de la marche
PIETON, CAVALIER = 18.0, 15.0

# nom -> (fabrique, (largeur, hauteur) logiques d'une image, ancrage bas en px logiques, px logiques par mètre)
UNITES = {
    "unite-fantassins-france": (lambda ph: F.soldat("f", "france", "fantassin", ph), (40, 40), 4, PIETON),
    "unite-cavaliers-france": (lambda ph: F.cavalier("c", "france", ph, lourd=True), (40, 40), 4, CAVALIER),
    "unite-belier-france": (lambda ph: E.tour_de_siege("b", "france", ph), (56, 64), 4, 12.0),
    "unite-pietaille-angleterre": (lambda ph: F.soldat("p", "angleterre", "pietaille", ph), (40, 40), 4, PIETON),
    "unite-cavaliers-angleterre": (lambda ph: F.cavalier("c", "angleterre", ph), (40, 40), 4, CAVALIER),
    "unite-hommes-angleterre": (lambda ph: F.soldat("h", "angleterre", "homme_armes", ph), (40, 40), 4, PIETON),
    "unite-champion-angleterre": (lambda ph: F.soldat("k", "angleterre", "champion", ph, echelle=1.12), (48, 48), 4, PIETON),
    "unite-pietaille-omeyyades": (lambda ph: F.soldat("p", "omeyyades", "pietaille", ph), (40, 40), 4, PIETON),
    "unite-cavaliers-omeyyades": (lambda ph: F.cavalier("c", "omeyyades", ph), (40, 40), 4, CAVALIER),
    "unite-hommes-omeyyades": (lambda ph: F.soldat("h", "omeyyades", "homme_armes", ph), (40, 40), 4, PIETON),
    "unite-champion-omeyyades": (lambda ph: F.soldat("k", "omeyyades", "champion", ph, echelle=1.12), (48, 48), 4, PIETON),
}


def rendre_unite(nom, nb_images=IMAGES, surech=2):
    fabrique, (lw, lh), ancre, ppm = UNITES[nom]
    pw, ph = lw * C.ECHELLE, lh * C.ECHELLE           # taille finale d'une image (2 × logique)
    images = []
    for k in range(nb_images):
        phase = 2 * math.pi * k / IMAGES
        C.reinitialiser()
        C.installer_lumiere()
        C.lumiere_appoint()
        C.lumiere_contour()
        C.camera_trois_quarts(pw * surech, ph * surech, ppm * C.ECHELLE * surech, ancre * C.ECHELLE * surech)
        C.sol_capteur(14)
        objs, pivot = fabrique(phase)
        img, _ = C.rendre_sprite("%s-%d" % (nom, k), pw, ph, objs, surech=surech, echantillons=64,
                                 contour=0.8, epaisseur_contour=2, pres=0.10)
        if "angleterre" in nom:
            C.controle_sans_bleu(img, "%s-%d" % (nom, k))
        images.append(img)
    img = C.bande(images)
    C.sauver_sprite(nom, img, None, lw, lh, lw // 2, lh - ancre, nb_images)
    return C.chemin_td(nom + ".png")[0]


def main(args):
    nb = IMAGES
    if "--images" in args:
        i = args.index("--images")
        nb = int(args[i + 1])
        args = args[:i] + args[i + 2:]
    noms = args or list(UNITES)
    for nom in noms:
        rendre_unite(nom, nb)


if __name__ == "__main__":
    main(sys.argv[1:])
