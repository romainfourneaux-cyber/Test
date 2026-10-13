# -*- coding: utf-8 -*-
"""Tours de défense posées sur les emplacements, en trois niveaux (France) et en version rivale (niveau 1).

Usage : python3 atelier/outils/rendu-3d/tours.py [nom ...]
  nom : par exemple tour-archers-france-1 (par défaut : toutes les tours du tableau TOURS)
Sorties : jeu/assets/images/td/tour-<type>-<camp>-<niveau>.png, 70 × 84 px logiques (rendu 140 × 168),
ancrage = bas-centre moins 12 px (le centre de l'emplacement).

Archers : tour de pierre crénelée avec un archer au sommet ; niveau 2 plus haute, à hourds de bois ;
niveau 3 sur soubassement, coiffée d'un toit, avec bannière. Pour les Omeyyades : tour carrée de pierre ocre
à merlons pointus. (Piquiers, baliste et trébuchet : voir les fonctions du même nom.)
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402  (commun d'abord : il rend bpy importable)
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import figurines as F  # noqa: E402
import places as P  # noqa: E402

V = Vector
LARGEUR, HAUTEUR, ANCRE = 70, 84, 12      # px logiques
PX_PAR_M = 9.0                            # proche de l'échelle du terrain (10 px/m) : tours et arbres s'accordent


def archer_au_sommet(camp, z, x=0.0, y=0.0, lacet=-30.0, echelle=1.15):
    """Un archer debout sur la plate-forme (plus grand que nature, pour rester lisible)."""
    objs, pivot = F.soldat("archer%.1f" % x, camp, "archer", phase=0.6, lacet=lacet, echelle=echelle)
    pivot.location = (x, y, z)
    return objs


def tour_archers(camp, niveau):
    """Tour d'archers d'un camp, niveau 1 à 3."""
    m = P.matieres(camp, "intact")
    o = []
    sud = camp == "omeyyades"
    if sud:
        cote = 3.0 + 0.3 * niveau
        h = 4.6 + 1.1 * niveau
        o += P.tour_carree("tour", 0, 0.6, cote, h, m, merlons="pointe")
        z = h
        o += P.porte_arc("porte", 0, 0.6 - cote / 2 - 0.02, 1.0, 1.9, m, outrepasse=True)
    else:
        r = 1.45 + 0.15 * niveau
        h = {1: 5.4, 2: 5.0, 3: 4.9}[niveau]
        if niveau == 3:
            # soubassement carré de pierre
            o.append(C.boite("socle", 2 * r + 1.0, 2 * r + 1.0, 0.7, (0, 0.6, 0), m["pierre"]))
            C.biseau(o[-1], 0.05)
        base_z = 0.7 if niveau == 3 else 0.0
        talus = C.cylindre("talus", r * 1.15, 1.1, (0, 0.6, base_z), m["pierre"], segments=28, rayon_haut=r)
        fut = C.cylindre("fut", r, h, (0, 0.6, base_z), m["pierre"], segments=28)
        o += [talus, fut]
        o += P.meurtrieres("m", 0, 0.6, r + 0.02, base_z + h * 0.45, m["noir"], nombre=3)
        o.append(C.boite("porte", 0.9, 0.2, 1.7, (0, 0.6 - r + 0.02, base_z), m["bois"]))
        z = base_z + h
        if niveau == 1:
            o.append(C.cylindre("cordon", r + 0.15, 0.3, (0, 0.6, z - 0.6), m["pierre"], segments=28))
            o.append(C.creneaux_cercle("crn", r + 0.02, z, m["pierre"], nombre=9, h=0.6, ep=0.35))
        elif niveau == 2:
            # hourds : galerie de bois en encorbellement
            o.append(C.cylindre("hourd", r + 0.35, 1.2, (0, 0.6, z - 0.2), m["bois"], segments=28))
            o.append(P.cone_uv("hourd_toit", r + 0.6, 0.9, (0, 0.6, z + 1.0), m["toit"] if "toit" in m else m["bois"], segments=28))
            for k in range(10):
                a = 2 * math.pi * k / 10
                o.append(C.boite("corbeau%d" % k, 0.25, 0.2, 0.35, ((r + 0.15) * math.cos(a), 0.6 + (r + 0.15) * math.sin(a), z - 0.55),
                                 m["bois"]))
        else:
            o.append(C.cylindre("machicoulis", r + 0.3, 0.9, (0, 0.6, z - 0.3), m["pierre"], segments=28))
            o.append(P.cone_uv("toit", r + 0.6, 1.4 * r, (0, 0.6, z + 0.6), m["toit"]))
    # l'archer : sur la plate-forme ouverte (niveau 1 et tours carrées), à une fenêtre sinon
    if niveau == 1 or sud:
        o += archer_au_sommet(camp, z - 0.15, x=0.1, y=0.5)
    else:
        o += archer_au_sommet(camp, z - 0.55 if niveau == 2 else z - 0.3, x=0.0, y=0.6 - (1.75 + 0.15 * niveau) * 0.55, lacet=-60)
    # bannière : sur la plate-forme (niveau 1, tours carrées), au sommet du toit sinon
    if niveau == 1 or sud:
        o += C.drapeau("ban", camp, 1.6, 1.3, 0.85, loc=(-0.9, 0.9, z), vent=1.0)
    elif niveau == 2:
        o += C.drapeau("ban", camp, 1.5, 1.4, 0.9, loc=(0.0, 0.6, z + 1.85), vent=1.0)
    else:
        o += C.drapeau("ban", camp, 1.0, 1.4, 0.85, loc=(0.0, 0.6, z + 0.6 + 1.4 * (1.45 + 0.15 * niveau) - 0.1), vent=1.0)
    return o


TOURS = {}
for _n in (1, 2, 3):
    TOURS["tour-archers-france-%d" % _n] = (lambda n=_n: tour_archers("france", n))
TOURS["tour-archers-angleterre-1"] = lambda: tour_archers("angleterre", 1)
TOURS["tour-archers-omeyyades-1"] = lambda: tour_archers("omeyyades", 1)


def rendre_tour(nom, surech=2, echantillons=64):
    W, H = LARGEUR * C.ECHELLE, HAUTEUR * C.ECHELLE
    C.reinitialiser()
    C.installer_lumiere()
    C.lumiere_appoint(1.0)
    C.camera_trois_quarts(W * surech, H * surech, PX_PAR_M * C.ECHELLE * surech, ANCRE * C.ECHELLE * surech)
    C.sol_capteur(30)
    objs = TOURS[nom]()
    img = C.rendre_sprite(nom, W, H, objs, surech=surech, echantillons=echantillons, contour=0.5)
    chemin, src = C.chemin_td(nom + ".png")
    C.sauver_png(img, chemin)
    C.maj_manifeste({nom: C.entree(src, LARGEUR, HAUTEUR, LARGEUR // 2, HAUTEUR - ANCRE)})
    return chemin


def main(args):
    for nom in (args or list(TOURS)):
        rendre_tour(nom)


if __name__ == "__main__":
    main(sys.argv[1:])
