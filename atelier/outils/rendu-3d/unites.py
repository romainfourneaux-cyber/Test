# -*- coding: utf-8 -*-
"""Troupes du champ de bataille : bandes de 4 images de marche, tournées vers la droite.

Usage : python3 atelier/outils/rendu-3d/unites.py [nom ...] [--images N]
  nom : par exemple unite-fantassins-france (par défaut : toutes les troupes du tableau UNITES)
  --images N : ne rendre que les N premières images de la marche (essais rapides)
Sorties : jeu/assets/images/td/unite-<type>-<camp>.png (+ entrées du manifeste sprites.js).
Ancrage : bas-centre moins 4 px logiques (le point de la route est sous les pieds).
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import figurines as F  # noqa: E402

IMAGES = 4  # images de la marche

# nom -> (fabrique, taille logique d'une image, ancrage bas en px logiques, px logiques par mètre)
UNITES = {
    "unite-fantassins-france": (lambda ph: F.soldat("f", "france", "fantassin", ph), 40, 4, 19.0),
    "unite-cavaliers-france": (lambda ph: F.cavalier("c", "france", ph), 40, 4, 12.5),
    "unite-pietaille-angleterre": (lambda ph: F.soldat("p", "angleterre", "pietaille", ph), 40, 4, 19.0),
    "unite-cavaliers-angleterre": (lambda ph: F.cavalier("c", "angleterre", ph), 40, 4, 12.5),
    "unite-hommes-angleterre": (lambda ph: F.soldat("h", "angleterre", "homme_armes", ph), 40, 4, 18.0),
    "unite-champion-angleterre": (lambda ph: F.soldat("k", "angleterre", "champion", ph, echelle=1.08), 48, 4, 19.0),
    "unite-pietaille-omeyyades": (lambda ph: F.soldat("p", "omeyyades", "pietaille", ph), 40, 4, 19.0),
    "unite-cavaliers-omeyyades": (lambda ph: F.cavalier("c", "omeyyades", ph, lourd=False), 40, 4, 12.5),
    "unite-hommes-omeyyades": (lambda ph: F.soldat("h", "omeyyades", "homme_armes", ph), 40, 4, 18.0),
    "unite-champion-omeyyades": (lambda ph: F.soldat("k", "omeyyades", "champion", ph, echelle=1.08), 48, 4, 19.0),
}


def rendre_unite(nom, nb_images=IMAGES, surech=2):
    fabrique, taille, ancre, ppm = UNITES[nom]
    px = taille * C.ECHELLE                   # taille finale d'une image (2 × logique)
    images = []
    for k in range(nb_images):
        phase = 2 * math.pi * k / IMAGES
        C.reinitialiser()
        C.installer_lumiere()
        C.lumiere_appoint()
        C.camera_trois_quarts(px * surech, px * surech, ppm * C.ECHELLE * surech, ancre * C.ECHELLE * surech)
        C.sol_capteur(12)
        objs, pivot = fabrique(phase)
        images.append(C.rendre_sprite("%s-%d" % (nom, k), px, px, objs, surech=surech, echantillons=64))
    img = C.bande(images)
    chemin, src = C.chemin_td(nom + ".png")
    C.sauver_png(img, chemin)
    C.maj_manifeste({nom: C.entree(src, taille, taille, taille // 2, taille - ancre, nb_images)})
    return chemin


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
