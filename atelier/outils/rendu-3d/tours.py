# -*- coding: utf-8 -*-
"""Tours de défense posées sur les emplacements : archers, piquiers, baliste, catapulte (trébuchet), en trois niveaux
pour la France, et les tours rivales (archers, baliste) de l'Angleterre et des Omeyyades.

Usage : python3 atelier/outils/rendu-3d/tours.py [nom ...] [--dossier D]
  nom : par exemple tour-archers-france-1 (par défaut : toutes les tours du tableau TOURS)
  --dossier D : essai ; écrit les bandes dans D (avec leur point « tir » dans D/tir.json), sans toucher à jeu/
        python3 atelier/outils/rendu-3d/tours.py --installer D : écrit dans jeu/ les bandes d'un essai déjà regardé
        python3 atelier/outils/rendu-3d/tours.py --planche [chemin.png]
  planche de contrôle (sans rendu) : carte « moulin » en jeu à l'échelle 1 et 2, fenêtre de 640 px, tours agrandies.
        python3 atelier/outils/rendu-3d/tours.py --planche-bandes chemin.png [--source D]
  planche des bandes de tir : chaque tour, son image d'avant (jeu/ ou rien) puis ses images de tir sur l'herbe, ombre
  portée dessous, croix rouge à l'ancrage et croix jaune au point « tir » ; --source D lit un essai.
Bandes de tir (une image de plus par geste, rendues dans la même passe et avec la même graine que l'image 0, qui
remplace l'image d'avant) : trébuchet 4 images (armé, mi-course, verge verticale, lâché : fronde vide), baliste
3 (tendue, détendue, retour), archers 3 (repos, arc bandé, lâcher), piquiers 3 (repos, piques poussées, retour).
L'ombre portée n'est pas refaite (une seule par tour : celle de l'image 0, déjà dans jeu/) ; la passe d'ombre de
l'image 0 donne aussi l'ombre de contact, reprise telle quelle par les images suivantes. Manifeste : frames 3 ou 4 et
« tir » : [x, y] (px logiques depuis le coin haut-gauche), point de départ du trait relevé sur la scène 3D : pierre
dans la fronde au moment du lâcher, pointe du carreau, arc de l'archer, fers des piques poussées.
Sorties : jeu/assets/images/td/tour-<type>-<camp>-<niveau>.png, 70 × 84 px logiques (rendu 140 × 168),
ancrage = bas-centre moins 12 px (le centre de l'emplacement) ; ombre portée à part : ombre-tour-....png ; entrées du
manifeste sprites.js ; masques des toits de France dans le cache (controle-toits-<nom>.png, relus par verifier.py).

Règles de lecture (contrôlées) : chaque niveau change le profil du HAUT de la silhouette ; le type se lit à son
occupant (archer agrandi dont le buste et l'arc dépassent du parapet, piquiers et leurs piques, baliste, verge du
trébuchet) ; la couleur du camp couvre au moins 12 % des pixels opaques (tenture de 12 × 20 px logiques sur le
parapet + flamme de toit) ; 2 px rendus transparents au moins sur tous les bords.
Silhouette par camp : France tour ronde (ardoises bleutées aux niveaux 2 et 3), Angleterre tour carrée normande
à hourd et toit de tuiles rouges, Omeyyades tour carrée à merlons pyramidés (porte en arc outrepassé haute et étroite,
une seule archère, haute et décalée : aucune « figure » de façade), drapeaux verts à la tour ivoire.
Baliste : agrandie (bras de frêne clair en X, envergure ≥ 55 % de la largeur du sprite, soit ≥ 38 px logiques), tournée
vers le bas de l'écran ; au niveau 3, plate-forme de combat découverte au sommet d'une tour à mâchicoulis (la baliste
reste le haut de la silhouette, bannière à l'arrière, pas de toit). Plates-formes de pierre dallées (occlusion 0,4),
boulets et munitions en pierre grise rugueuse. Niveau 3 des archers : tourelle et cône abaissés de 20 %.
Piquiers : piquiers agrandis (× 1,5) debout sur une banquette de 0,3 m (casques et épaules au-dessus des pieux), et un
éventail de piques dressées presque à la verticale (±12°) : 5 au niveau 1, 7 au niveau 2, 9 au niveau 3, longues de
4,5 m (≈ 2,2 × la palissade), hampe de frêne clair (L* rendue ≥ 70, contrôlée), fer d'acier clair de 0,3 m ; le plus
bas des fers dépasse les pieux d'au moins 10 px logiques. Les piques qu'aucun piquier ne tient sont liées à un râtelier.
Toits de France : ardoise gris-bleu (commun.CAMPS) ; saturation médiane rendue des toits ≤ 0,32, contrôlée sur un
rendu de masques (toits, hampes, fers) fait après le sprite.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402  (commun d'abord : il rend bpy importable)
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

import figurines as F  # noqa: E402
import places as P  # noqa: E402
import engins as E  # noqa: E402

V = Vector
LARGEUR, HAUTEUR, ANCRE = 70, 84, 12      # px logiques
PX_PAR_M = 8.0                            # un peu sous l'échelle du terrain (10 px/m) : marge en haut pour le niveau 3
SEUIL_CAMP = 0.12
CY = 0.6                                  # centre de la tour, un peu derrière le point d'ancrage
LACET = C.LACET_BATIMENTS
CAP = -28.0


LACET_BALISTE = -68.0                     # la baliste vise le bas de l'écran (un peu à droite) : ses bras s'étalent en largeur

# ---------------------------------------------------------------- bandes de tir
IMAGES_TOUR = {"archers": 3, "piquiers": 3, "baliste": 3, "catapulte": 4}
# trébuchet, images 1 à 3 : (angle de la verge au-dessus de l'horizontale vers l'arrière, fronde (dx, dz), pierre) ;
# l'image 0 garde l'angle de repos du niveau et la fronde pendante
TREBUCHET_TIR = ((68, (-0.9, -1.25), True), (88, (-1.55, 0.15), True), (118, (0.55, -1.5), False))
BALISTE_TIR = ({"tension": 1.0, "carreau": True}, {"tension": 0.0, "carreau": False}, {"tension": 0.55, "carreau": False})
PIQUES_TIR = (0.0, 1.0, 0.45)             # piques poussées : part de PIQUE_POUSSEE
PIQUE_POUSSEE = 24.0                      # degrés : les piques tenues penchent vers l'avant
IMAGE_TIR = {"archers": 1, "piquiers": 1, "baliste": 0, "catapulte": 2}   # image où relever le point « tir »


def trebuchet_tir(k, repos):
    """Arguments de engins.trebuchet pour l'image k de la bande (0 : armé, angle de repos du niveau)."""
    if k == 0:
        return {"bras_angle": repos}
    a, fronde, pierre = TREBUCHET_TIR[k - 1]
    return {"bras_angle": a, "fronde": fronde, "pierre": pierre}


def mats_tour(camp):
    m = P.matieres(camp, "intact", echelle_tex=0.8)
    m["or"] = C.mat_metal("or", "#c9a24a", rugosite=0.35)
    m["pieu"] = C.mat_ph("pieu", "rough_wood", echelle_m=0.8, cible="#7e6244", contraste=1.3, bosse=0.4)
    m["frene"] = E.frene()
    # boulets et munitions : la pierre grise de l'effet « pierre » (rugueuse, en relief), jamais blanche
    m["boulet"] = C.mat_ph("boulet", "rustic_stone_wall", echelle_m=0.6, cible="#8a8478", contraste=1.3, bosse=0.6,
                           rugosite=0.9)
    # dallage des plates-formes de pierre (balistes, trébuchets) : dalles grises à joints sombres, occlusion 0,4
    m["dalle"] = C.mat_ph("dalle", "castle_wall_slates", echelle_m=2.2, cible="#6d685d", contraste=1.15, bosse=0.4,
                          occlusion=0.4, rugosite=0.9, garde=0.1)
    if camp == "angleterre":
        m["terrasse"] = m["bois"]      # plate-formes de tour planchéiées (le plomb à l'ombre prend le bleu du ciel)
    return m


def archer(camp, loc, lacet=-12.0, echelle=1.5, phase=0.6, tir=0):
    """Archer agrandi (× 1,5 : lisible à la taille du jeu), de profil vers +X, arc levé ; tir : 0 repos, 1 arc bandé,
    2 lâcher."""
    objs, pv = F.soldat("archer%.1f%.1f" % (loc[0], loc[1]), camp, "archer", phase=phase, lacet=lacet, echelle=echelle,
                        recul_y=0.0, tir=tir)
    pv.location = loc
    return objs + [pv]


def flamme(camp, loc, hauteur_mat=2.6, longueur=1.9, hauteur=1.25, epi=False, cap=CAP):
    """Flamme de toit (deux fois la surface de l'ancien fanion)."""
    return C.drapeau("flamme", camp, hauteur_mat, longueur, hauteur, loc=loc, vent=1.0, epi=epi, cap=cap)


def tenture_tour(camp, loc, rot_z, largeur=1.5, hauteur=3.3, m=None):
    """Tenture de 12 × 20 px logiques (1,5 × 3,3 m à 8 px/m, vue inclinée) accrochée sous le parapet."""
    return C.tenture("tenture", camp, largeur, hauteur, loc=loc, rot_z=rot_z, graine=1, mat_tringle=m["bois"] if m else None)


def hourd_rond(nom, r, z, m, h=1.5, ouvertures=((-95, 60),)):
    """Hourd circulaire : plancher en encorbellement, garde-corps de planches, poteaux et ouvertures (angles°, largeur°)."""
    objs = []
    R = r + 0.4
    objs.append(C.cylindre(nom + "_plancher", R + 0.05, 0.14, (0, CY, z), m["bois"], segments=32))
    for k in range(12):
        a = 2 * math.pi * (k + 0.5) / 12
        objs.append(E.poutre(nom + "_corbeau%d" % k, V((r * math.cos(a), CY + r * math.sin(a), z - 0.5)),
                             V((R * math.cos(a), CY + R * math.sin(a), z + 0.05)), 0.16, m["bois"]))
    n = 20
    for k in range(n):
        a = 360.0 * (k + 0.5) / n
        libre = any(abs((a - o[0] + 180) % 360 - 180) < o[1] / 2 for o in ouvertures)
        ar = math.radians(a)
        larg = 2 * math.pi * R / n * 1.02
        hh = 0.75 if libre else h
        o = C.boite(nom + "_planche%d" % k, 0.08, larg, hh, (R * math.cos(ar), CY + R * math.sin(ar), z + 0.07), m["bois"])
        o.rotation_euler.z = ar
        objs.append(o)
        if k % 4 == 0:
            objs.append(C.boite(nom + "_poteau%d" % k, 0.14, 0.14, h + 0.1, ((R + 0.02) * math.cos(ar), CY + (R + 0.02) * math.sin(ar),
                                                                            z + 0.07), m["bois"]))
    return objs


# ---------------------------------------------------------------- tours d'archers
def archers_france(niveau, image=0):
    m = mats_tour("france")
    o = []
    if niveau == 1:
        r, h = 1.6, 4.6
        o.append(C.cylindre("talus", r * 1.2, 1.2, (0, CY, 0), m["pierre"], segments=28, rayon_haut=r))
        o.append(C.cylindre("fut", r, h, (0, CY, 0), m["pierre"], segments=28))
        o.append(C.cylindre("cordon", r + 0.14, 0.28, (0, CY, h - 0.6), m["pierre"], segments=28))
        o.append(C.cylindre("parapet", r + 0.05, 0.7, (0, CY, h), m["pierre"], segments=28, chapeau=False))
        o[-1].modifiers.new("ep", "SOLIDIFY").thickness = 0.35
        crn = C.creneaux_cercle("crn", r + 0.05, h + 0.7, m["pierre"], nombre=8, h=0.55, ep=0.35)
        crn.location = (0, CY, 0)
        o.append(crn)
        o += archer("france", (0.15, CY - 0.35, h - 0.05), tir=image)
        o += flamme("france", (0.75, CY + 0.85, h), hauteur_mat=2.7)
        o += tenture_tour("france", (-0.55, CY - r - 0.02, h - 0.25), math.radians(-20), m=m)
        porte_a = -60
    elif niveau == 2:
        r, h = 1.7, 4.4
        o.append(C.cylindre("talus", r * 1.2, 1.2, (0, CY, 0), m["pierre"], segments=28, rayon_haut=r))
        o.append(C.cylindre("fut", r, h, (0, CY, 0), m["pierre"], segments=28))
        o += hourd_rond("hourd", r, h, m, h=2.0, ouvertures=((-80, 80), (150, 40)))
        # toit d'ardoises bleutées, raide (≥ 45°), débord r + 0,45 (juste au-delà du hourd), épi doré et flamme au faîte
        o += P.cone_uv("toit", r + 0.45 + 0.1, 2.3, (0, CY, h + 2.05), m["toit"], epi=m["or"])
        o += archer("france", (0.3, CY - r - 0.1, h + 0.1), echelle=1.3, lacet=-25, tir=image)
        o += flamme("france", (0.0, CY, h + 2.05 + 2.3 + 0.05), hauteur_mat=1.0, longueur=1.7, hauteur=1.05)
        o += tenture_tour("france", (-0.5, CY - r - 0.05, h - 0.45), math.radians(-18), m=m)
        porte_a = -60
    else:
        r, h = 1.85, 5.0
        # talus évasé (et non un socle carré) + mâchicoulis + chemin de ronde crénelé + tourelle coiffée + deux échauguettes
        o.append(C.cylindre("talus", r * 1.22, 1.6, (0, CY, 0), m["pierre"], segments=28, rayon_haut=r))
        o.append(C.cylindre("fut", r, h, (0, CY, 0), m["pierre"], segments=28))
        o.append(P.corbeaux_cercle("mach", 0, CY, r, h - 0.85, m["pierre"], nombre=14))
        o.append(C.cylindre("parapet", r + 0.3, 1.0, (0, CY, h - 0.3), m["pierre"], segments=28, chapeau=False))
        o[-1].modifiers.new("ep", "SOLIDIFY").thickness = 0.4
        crn = C.creneaux_cercle("crn", r + 0.28, h + 0.7, m["pierre"], nombre=10, h=0.5, ep=0.38)
        crn.location = (0, CY, 0)
        o.append(crn)
        # tourelle et cône abaissés de 20 % (le niveau 3 masque moins les troupes qui passent derrière)
        o.append(C.cylindre("tourelle", 0.95, 1.2, (0.1, CY + 0.45, h), m["pierre"], segments=24))
        o += P.cone_uv("toit", 0.95 + 0.3, 2.24, (0.1, CY + 0.45, h + 1.2), m["toit"], epi=m["or"])
        for k, a in enumerate((195, -15)):
            ar = math.radians(a)
            ex, ey = (r + 0.25) * math.cos(ar), CY + (r + 0.25) * math.sin(ar)
            o.append(C.cylindre("ech%d_cul" % k, 0.05, 0.9, (ex, ey, h - 1.6), m["pierre"], segments=16, rayon_haut=0.58))
            o.append(C.cylindre("ech%d" % k, 0.58, 1.9, (ex, ey, h - 0.7), m["pierre"], segments=16))
            o += P.cone_uv("ech%d_toit" % k, 0.72, 1.6, (ex, ey, h + 1.2), m["toit"], segments=16)
        o += archer("france", (0.35, CY - r + 0.35, h + 0.05), echelle=1.4, tir=image)
        ar = math.radians(195)
        o += flamme("france", ((r + 0.25) * math.cos(ar), CY + (r + 0.25) * math.sin(ar), h + 1.2 + 1.6 + 0.05), hauteur_mat=1.1,
                    longueur=1.8, hauteur=1.1)
        o += tenture_tour("france", (-0.3, CY - r - 0.36, h - 0.5), math.radians(-12), largeur=1.8, hauteur=3.6, m=m)
        porte_a = -60
    # porte de bois décalée vers la droite, archères jamais dans son axe
    pa = math.radians(porte_a)
    o += P.porte_arc("porte", (r + 0.02) * math.cos(pa), CY + (r + 0.02) * math.sin(pa), 0.95, 1.8, m, rot_z=pa + math.pi / 2,
                     seuil=0.35)
    for k, (a, zr) in enumerate(((-128, 0.42), (-25, 0.7))):
        ar = math.radians(a)
        o.append(P.fente("arch%d" % k, (r + 0.02) * math.cos(ar), CY + (r + 0.02) * math.sin(ar), h * zr, ar, m["noir"]))
    return o


def archers_angleterre(niveau=1, image=0):
    """Tour carrée normande, hourd de bois, toit de tuiles rouges en pavillon ; archer dans l'ouverture du hourd."""
    m = mats_tour("angleterre")
    o = []
    cote, h = 3.2, 4.6
    o.append(C.boite("talus", cote * 1.12, cote * 1.12, 1.0, (0, 0, 0), m["pierre"]))
    f = C.boite("fut", cote, cote, h, (0, 0, 0), m["pierre"])
    C.biseau(f, 0.04)
    o.append(f)
    for k in (-1, 1):       # contreforts plats normands
        o.append(C.boite("contrefort_s%d" % k, 0.45, 0.3, h - 0.4, (k * cote * 0.32, -cote / 2 - 0.12, 0), m["pierre"]))
    # hourd carré en encorbellement, ouvert sur la face sud (archer) et la face ouest
    R = cote / 2 + 0.4
    o.append(C.boite("hourd_plancher", 2 * R, 2 * R, 0.14, (0, 0, h), m["bois"]))
    for k in range(5):
        t = -R + 2 * R * (k + 0.5) / 5
        for (x, y, ang) in ((t, -R, 0), (t, R, 0), (-R, t, 90), (R, t, 90)):
            o.append(E.poutre("corbeau%d_%d%d" % (k, int(x * 10), int(y * 10)), V((x * 0.75, y * 0.75, h - 0.5)), V((x, y, h + 0.05)),
                              0.15, m["bois"]))
    for (cx, cy, lx, ly, ouvert) in ((0, -R, 2 * R, 0.08, True), (0, R, 2 * R, 0.08, False),
                                     (-R, 0, 0.08, 2 * R, True), (R, 0, 0.08, 2 * R, False)):
        o.append(C.boite("hourd_bas_%d%d" % (int(cx * 10), int(cy * 10)), lx, ly, 0.75, (cx, cy, h + 0.07), m["bois"]))
        if not ouvert:
            o.append(C.boite("hourd_haut_%d%d" % (int(cx * 10), int(cy * 10)), lx, ly, 1.25, (cx, cy, h + 0.82), m["bois"]))
    for sx in (-1, 1):
        for sy in (-1, 1):
            o.append(C.boite("hourd_poteau%d%d" % (sx, sy), 0.16, 0.16, 2.1, (sx * R, sy * R, h + 0.07), m["bois"]))
    o.append(C.boite("hourd_poteau_s", 0.16, 0.16, 2.1, (-0.6, -R, h + 0.07), m["bois"]))
    o += P.cone_uv("toit", (2 * R + 0.4) * 0.7071, 2.3, (0, 0, h + 2.12), m["toit"], pans=4, rot=math.pi / 4)
    o += archer("angleterre", (0.35, -R + 0.15, h + 0.1), echelle=1.2, lacet=-25 - LACET, tir=image)
    o += flamme("angleterre", (0, 0, h + 2.12 + 2.3), hauteur_mat=1.1, longueur=1.9, hauteur=1.25, cap=CAP - LACET)
    # tenture de gueules au lion sur la face ouest (au soleil), porte sur la face sud
    o += C.tenture("tenture", "angleterre", 1.5, 3.3, loc=(-cote / 2 - 0.1, -0.2, h - 0.15), rot_z=-math.pi / 2, graine=1,
                   mat_tringle=m["bois"])
    o += P.porte_arc("porte", 0.35, -cote / 2 - 0.02, 0.95, 1.8, m, seuil=0.35)
    o.append(P.fente("arch", -0.75, -cote / 2 - 0.02, h * 0.6, -math.pi / 2, m["noir"]))
    C.pivot("tour", o, LACET, (0, CY, 0))
    return o


def archers_omeyyades(niveau=1, image=0):
    """Tour carrée ocre (soubassement de moellons, pisé au-dessus), merlons pyramidés ; porte en arc outrepassé haute
    et étroite à vantaux de bois sur la face sud ; une seule archère, haute, sur la face ouest ; tenture verte."""
    m = mats_tour("omeyyades")
    o = []
    cote, h = 3.4, 5.6
    o += P.tour_carree("tour", 0, 0, cote, h, m, merlons="pointe", mat="mur", soubassement=("pierre", 2.5), archeres=None)
    o += P.porte_arc("porte", 0.45, -cote / 2 - 0.02, 0.9, 1.8, m, outrepasse=True, seuil=0.35)
    o.append(P.fente("arch", -cote / 2 - 0.02, 0.9, h * 0.72, math.pi, m["noir"]))
    o += archer("omeyyades", (0.3, -0.35, h - 0.05), lacet=-12 - LACET, tir=image)
    o += C.drapeau("flamme", "omeyyades", 2.6, 2.5, 1.65, loc=(0.9, 1.0, h), vent=1.0, cap=CAP - LACET, inverse=True)
    o += C.tenture("tenture", "omeyyades", 1.9, 3.8, loc=(-cote / 2 - 0.12, -0.3, h - 0.35), rot_z=-math.pi / 2, graine=1,
                   mat_tringle=m["bois"])
    o += C.tenture("tenture_s", "omeyyades", 1.3, 2.6, loc=(-0.85, -cote / 2 - 0.12, h - 0.35), rot_z=0.0, graine=2,
                   mat_tringle=m["bois"])
    C.pivot("tour", o, LACET, (0, CY, 0))
    return o


# ---------------------------------------------------------------- piques dressées (le type « piquiers » se lit à leurs pointes)
LONG_PIQUE = 4.5          # m : environ 2,2 fois la hauteur de la palissade (1,9 à 2,1 m)
FER_PIQUE = 0.3           # m : fer d'acier clair
RAYON_HAMPE = 0.05        # m : hampe un peu épaissie (1,6 px rendus) pour rester lisible à la taille du jeu
EVENTAIL = 12.0           # degrés : les piques s'ouvrent en éventail, de −12° (à gauche) à +12° (à droite)
RECUL_PIQUES = 4.0        # degrés : légère inclinaison vers le nord (les pointes ne viennent pas vers la caméra)
ECHELLE_PIQUIER = 1.5     # figurine agrandie : le casque et les épaules dépassent des pieux
BANQUETTE = 0.3           # m : banquette de planches derrière la palissade (les piquiers y montent)
# Piquiers (x, y, phase) et piques plantées dans le râtelier (x, y), en m depuis le centre de l'emplacement : 5 piques
# au niveau 1, 7 au niveau 2, 9 au niveau 3. Le râtelier reste à droite : la tourelle de guet occupe l'arrière gauche.
HOMMES = {1: ((-1.0, -0.35, 0.0), (0.15, -0.6, 1.3)),
          2: ((-1.2, -0.45, 0.0), (-0.1, -0.75, 1.3), (0.85, -0.35, 2.5)),
          3: ((-1.3, -0.5, 0.0), (-0.25, -0.85, 1.3), (0.75, -0.55, 2.5), (1.35, 0.1, 3.6))}
PLANTEES = {1: ((-0.35, 0.55), (0.45, 0.65), (1.05, 0.35)),
            2: ((0.05, 0.55), (0.55, 0.8), (1.05, 0.65), (1.5, 0.3)),
            3: ((-0.1, 0.45), (0.3, 0.8), (0.7, 0.95), (1.1, 0.8), (1.55, 0.7))}


def mats_pique():
    """Hampe de frêne clair (L* rendue ≥ 70 : elle se lit sur l'herbe et sur le bois sombre des pieux), fer d'acier
    clair en feuille, douille de fer sombre qui sépare le fer de la hampe."""
    hampe = C.mat_ph("frene_pique", "medieval_wood", echelle_m=1.0, cible="#f7eed6", contraste=0.6, bosse=0.1, rugosite=0.6)
    # acier peu métallique : un miroir renverrait le sol sombre (vue plongeante) et le fer paraîtrait noir
    fer = C.mat_metal("fer_pique", "#ebe8e2", rugosite=0.42, metal=0.25)
    douille = C.mat_metal("douille_pique", "#5e5953", rugosite=0.5)
    return hampe, fer, douille


def tige(nom, a, b, r0, r1, mat, segments=8):
    """Cylindre lisse (fermé aux deux bouts) de a à b, rayon r0 en a et r1 en b."""
    a, b = V(a), V(b)
    t = (b - a).normalized()
    u = t.orthogonal().normalized()
    w = t.cross(u).normalized()
    bm = bmesh.new()
    anneaux = []
    for p, r in ((a, r0), (b, r1)):
        anneaux.append([bm.verts.new(p + (u * math.cos(2 * math.pi * j / segments) + w * math.sin(2 * math.pi * j / segments)) * r)
                        for j in range(segments)])
    for j in range(segments):
        f = bm.faces.new((anneaux[0][j], anneaux[0][(j + 1) % segments], anneaux[1][(j + 1) % segments], anneaux[1][j]))
        f.smooth = True
    bm.faces.new(list(reversed(anneaux[0])))
    bm.faces.new(anneaux[1])
    return C.objet_maillage(nom, bm, mat)


def fer_feuille(nom, base, d, longueur, largeur, mat):
    """Fer de pique en feuille : losange allongé à facettes (elles accrochent le soleil), large face tournée vers la
    caméra (axe de largeur horizontal, le long de X)."""
    d = V(d).normalized()
    a = (V((1, 0, 0)) - d * d.x).normalized()
    b = d.cross(a).normalized()
    bm = bmesh.new()
    base = V(base)
    c = base + d * (longueur * 0.32)
    v0 = bm.verts.new(base)
    pointe = bm.verts.new(base + d * longueur)
    tour = [bm.verts.new(c + a * largeur / 2), bm.verts.new(c - b * largeur * 0.16), bm.verts.new(c - a * largeur / 2),
            bm.verts.new(c + b * largeur * 0.16)]
    for k in range(4):
        bm.faces.new((v0, tour[(k + 1) % 4], tour[k]))
        bm.faces.new((pointe, tour[k], tour[(k + 1) % 4]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return C.objet_maillage(nom, bm, mat)


def pique(nom, talon, d, mp, longueur=LONG_PIQUE):
    """Pique dressée : hampe de frêne clair du talon jusqu'au fer, douille sombre, fer d'acier clair en feuille."""
    hampe, fer, douille = mp
    d = V(d).normalized()
    talon = V(talon)
    base_fer = talon + d * (longueur - FER_PIQUE)
    return [tige(nom + "_hampe", talon, base_fer, RAYON_HAMPE, RAYON_HAMPE * 0.85, hampe),
            tige(nom + "_douille", base_fer - d * 0.08, base_fer + d * 0.02, RAYON_HAMPE * 1.2, RAYON_HAMPE * 1.1, douille),
            fer_feuille(nom + "_fer", base_fer, d, FER_PIQUE, 0.19, fer)]


def piquier_tour(nom, camp, loc, lacet=-10.0, echelle=ECHELLE_PIQUIER, phase=0.0, pique=0.0):
    """Piquier debout sur la banquette (figurine de figurines.py : maille, surcot du camp, casque à nasal, visage), mains
    serrées devant la poitrine sur la hampe. Renvoie (objets, position de la main droite dans le monde) : la pique est
    posée ensuite, talon sur la banquette, passant par cette main. pique (0 à 1) : bras tendus, la pique poussée."""
    mats = F.matieres(camp)
    j = F.pose_homme(phase, bras_droit=(18 + 34 * pique, 92 - 48 * pique), bras_gauche=(34 + 28 * pique, 70 - 38 * pique),
                     amplitude=3, penche=2 + 8 * pique)
    objs = []
    objs += F.corps_homme(nom, j, mats["maille"], mats["chausses"])
    m_sur = C.mat_tissu("surcot_" + camp, C.CAMPS[camp]["tissu"], image_png=F.texture_surcot(camp))
    objs.append(F.surcot(nom + "_surcot", j, m_sur, longueur=0.6))
    objs += F.tete(nom, j, mats, "nasal")
    pv = C.pivot(nom + "_pv", objs, lacet, loc)
    pv.scale = (echelle, echelle, echelle)
    main = V(loc) + Matrix.Rotation(math.radians(lacet), 3, "Z") @ (V(j["main", -1]) * echelle)
    return objs + [pv], main


def eventail_piques(niveau, zb, m, camp="france", pousse=0.0):
    """Piquiers et piques du niveau : toutes les piques (tenues ou plantées) forment un seul éventail presque vertical,
    ordonné de gauche à droite de −12° à +12°, longues de 4,5 m (≈ 2,2 × la palissade). Les piques plantées sont liées
    à un râtelier (deux poteaux et une traverse). m : matières de la tour. Renvoie (objets, z du plus bas des fers).
    pousse (0 à 1, bande de tir) : les piques tenues penchent vers l'avant (vers l'est et un peu vers la caméra) de
    PIQUE_POUSSEE degrés au plus ; celles du râtelier ne bougent pas."""
    mp = mats_pique()
    rnd = random.Random(7 + niveau)
    o, elements = [], []
    for k, (x, y, ph) in enumerate(HOMMES[niveau]):
        objs, main = piquier_tour("piquier%d" % k, camp, (x, CY + y, zb), phase=ph, pique=pousse)
        o += objs
        elements.append(("main", main))
    for (x, y) in PLANTEES[niveau]:
        elements.append(("talon", V((x, CY + y, zb))))
    elements.sort(key=lambda e: e[1].x)
    n = len(elements)
    plantees, fers = [], []
    for k, (genre, p) in enumerate(elements):
        a = math.radians(-EVENTAIL + 2 * EVENTAIL * k / (n - 1) + rnd.uniform(-1.5, 1.5))
        rec = math.radians(RECUL_PIQUES + rnd.uniform(-1.5, 1.5))
        if genre == "main" and pousse:
            a += math.radians(PIQUE_POUSSEE * pousse)
            rec -= math.radians(0.3 * PIQUE_POUSSEE * pousse)
        d = V((math.sin(a), math.sin(rec), math.cos(a) * math.cos(rec))).normalized()
        talon = p - d * ((p.z - zb) / d.z) if genre == "main" else p
        o += pique("pique%d" % k, talon, d, mp)
        fers.append((talon + d * (LONG_PIQUE - FER_PIQUE)).z)
        if genre == "talon":
            plantees.append(talon + d * (1.5 / d.z))         # point de la hampe à 1,5 m : la traverse du râtelier
    if plantees:
        ym = sum(p.y for p in plantees) / len(plantees)
        g = V((min(p.x for p in plantees) - 0.25, ym, zb + 1.5))
        dr = V((max(p.x for p in plantees) + 0.25, ym, zb + 1.5))
        o.append(E.poutre("ratelier_traverse", g, dr, 0.1, m["bois"]))
        for k, bout in enumerate((g, dr)):
            o.append(E.poutre("ratelier_poteau%d" % k, V((bout.x, bout.y, zb)), bout + V((0, 0, 0.1)), 0.11, m["bois"]))
    return o, min(fers)


# ---------------------------------------------------------------- piquiers : palissade de pieux
def piquiers_france(niveau, image=0):
    m = mats_tour("france")
    o = []
    r = 2.0 + 0.15 * niveau
    if niveau >= 2:
        # motte de terre (niveau 2) puis soubassement de pierre (niveau 3) sous la palissade
        motte = C.cylindre("motte", r + 0.6, 0.5, (0, CY, 0), m["sol"], segments=32, rayon_haut=r + 0.3)
        o.append(motte)
    z0 = 0.5 if niveau >= 2 else 0.0
    if niveau == 3:
        o.append(C.cylindre("soub", r + 0.25, 0.8, (0, CY, z0), m["pierre"], segments=32))
        z0 += 0.8
    h_pal = 1.9 if niveau == 1 else 2.1
    o += E.palissade("pal", 0, CY, r, h_pal, m, graine=niveau, ouverture=(-60, 30), z0=z0)
    # banquette de planches derrière les pieux, puis piquiers et piques dressées en éventail (le type se lit à leurs
    # pointes claires : au moins 10 px logiques au-dessus des pieux)
    o.append(C.cylindre("banquette", r - 0.2, BANQUETTE, (0, CY, z0), m["bois"], segments=32))
    zb = z0 + BANQUETTE
    piq, z_fers = eventail_piques(niveau, zb, m, pousse=PIQUES_TIR[image])
    o += piq
    depasse = (z_fers - (z0 + h_pal * 1.08 + 0.42)) * math.cos(math.radians(C.INCLINAISON)) * PX_PAR_M
    C.journal("piquiers niveau %d : %d piques, le plus bas des fers dépasse les pieux de %.1f px logiques"
              % (niveau, len(HOMMES[niveau]) + len(PLANTEES[niveau]), depasse))
    if niveau >= 2:
        # tourelle de guet de bois (niveau 2) ; coiffée d'ardoises (niveau 3)
        tx, ty = -1.2, CY + 1.0
        hz = z0 + (2.5 if niveau == 2 else 2.4)
        for sx in (-1, 1):
            for sy in (-1, 1):
                o.append(E.poutre("guet_pied%d%d" % (sx, sy), V((tx + sx * 0.7, ty + sy * 0.7, z0)), V((tx + sx * 0.55, ty + sy * 0.55, hz)),
                                  0.14, m["bois"]))
        o.append(C.boite("guet_plancher", 1.5, 1.5, 0.12, (tx, ty, hz), m["bois"]))
        for (cx, cy, lx, ly) in ((tx, ty - 0.72, 1.5, 0.08), (tx - 0.72, ty, 0.08, 1.5), (tx + 0.72, ty, 0.08, 1.5)):
            o.append(C.boite("guet_garde%d%d" % (int(cx * 10), int(cy * 10)), lx, ly, 0.8, (cx, cy, hz + 0.1), m["bois"]))
        if niveau == 3:
            o += P.cone_uv("guet_toit", 1.25, 1.6, (tx, ty, hz + 1.6), m["toit"], pans=4, rot=math.pi / 4)
            for sx in (-1, 1):
                for sy in (-1, 1):
                    o.append(C.boite("guet_poteau%d%d" % (sx, sy), 0.1, 0.1, 1.6, (tx + sx * 0.66, ty + sy * 0.66, hz + 0.05), m["bois"]))
            o += flamme("france", (tx, ty, hz + 1.6 + 1.6), hauteur_mat=0.9, longueur=1.7, hauteur=1.0)
        else:
            o += flamme("france", (tx + 0.6, ty + 0.6, hz), hauteur_mat=2.4)
    else:
        o += flamme("france", (-1.4, CY + 1.0, z0), hauteur_mat=3.4)
    # tenture du camp sur la palissade, côté caméra
    o += C.tenture("tenture", "france", 1.8, 1.75 + 0.5 * min(1, niveau - 1), loc=(-0.6, CY - r - 0.18, z0 + 1.95),
                   rot_z=math.radians(-12), graine=1, mat_tringle=m["bois"], pointe=0.12)
    return o


# ---------------------------------------------------------------- baliste
def baliste_tour(camp, niveau, image=0):
    """Baliste française en trois niveaux. La baliste est agrandie (envergure des bras ≥ 55 % de la largeur du sprite,
    frêne clair) et reste toujours le sommet de la silhouette : niveau 1 plate-forme de bois, niveau 2 soubassement de
    pierre crénelé, niveau 3 tour de pierre à mâchicoulis et plate-forme de combat découverte, bannière à l'arrière."""
    m = mats_tour(camp)
    o = []
    if niveau == 1:
        # plate-forme de bois sur quatre poteaux contreventés, échelle
        hz = 2.2
        for sx in (-1, 1):
            for sy in (-1, 1):
                o.append(E.poutre("pied%d%d" % (sx, sy), V((sx * 1.5, CY + sy * 1.5, 0)), V((sx * 1.4, CY + sy * 1.4, hz)), 0.2, m["bois"]))
        for sy in (-1, 1):
            o.append(E.poutre("croix%d_a" % sy, V((-1.45, CY + sy * 1.45, 0.2)), V((1.45, CY + sy * 1.45, hz - 0.2)), 0.1, m["bois"]))
        for sx in (-1, 1):
            o.append(E.poutre("croix%d_b" % sx, V((sx * 1.45, CY - 1.45, hz - 0.2)), V((sx * 1.45, CY + 1.45, 0.2)), 0.1, m["bois"]))
        o.append(C.boite("plateforme", 3.4, 3.4, 0.18, (0, CY, hz), m["bois"]))
        for (cx, cy, lx, ly) in ((0, CY + 1.65, 3.4, 0.08), (-1.65, CY, 0.08, 3.4), (1.65, CY, 0.08, 3.4)):
            o.append(C.boite("garde%d%d" % (int(cx * 10), int(cy * 10)), lx, ly, 0.5, (cx, cy, hz + 0.18), m["bois"]))
        o.append(E.poutre("echelle_a", V((-1.0, CY - 2.2, 0)), V((-1.0, CY - 1.6, hz)), 0.07, m["bois"]))
        o.append(E.poutre("echelle_b", V((-0.5, CY - 2.2, 0)), V((-0.5, CY - 1.6, hz)), 0.07, m["bois"]))
        z = hz + 0.18
        o += E.baliste("bal", (0.0, CY + 0.1, z), m, echelle=1.45, lacet=LACET_BALISTE, arc=1.5, **BALISTE_TIR[image])
        o += C.tenture("tenture", camp, 1.5, 2.2, loc=(0.6, CY - 1.72, hz + 0.1), rot_z=0.0, graine=1, mat_tringle=m["bois"])
        o += flamme(camp, (-1.5, CY + 1.4, z), hauteur_mat=2.6)
    elif niveau == 2:
        # soubassement de pierre crénelé, dallage, baliste plus grande
        cote, hz = 3.8, 2.8
        o.append(C.boite("soub_talus", cote * 1.1, cote * 1.1, 0.9, (0, CY, 0), m["pierre"]))
        o.append(C.boite("soub", cote, cote, hz, (0, CY, 0), m["pierre"]))
        o.append(C.boite("dallage", cote - 0.1, cote - 0.1, 0.05, (0, CY, hz), m["dalle"]))
        bm = bmesh.new()
        d = cote / 2
        coins = [(-d, CY - d), (d, CY - d), (d, CY + d), (-d, CY + d)]
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], hz, h=0.55, ep=0.35, pas=0.95)
        o.append(C.objet_maillage("crn", bm, m["pierre"]))
        o += E.baliste("bal", (0.0, CY + 0.1, hz), m, echelle=1.5, lacet=LACET_BALISTE, arc=1.5, **BALISTE_TIR[image])
        o += C.tenture("tenture", camp, 1.9, 1.7, loc=(-0.6, CY - d - 0.1, hz - 0.1), rot_z=0.0, graine=1, mat_tringle=m["bois"])
        o += flamme(camp, (-1.5, CY + 1.4, hz), hauteur_mat=3.0)
        o += P.porte_arc("porte", 0.9, CY - d - 0.02, 0.9, 1.7, m, seuil=0.35)
    else:
        # tour de pierre à mâchicoulis, plate-forme de combat découverte (parapet crénelé) : la baliste au sommet,
        # une bannière à l'arrière (pas de toit qui la cacherait)
        cote, hz = 3.9, 4.2
        o.append(C.boite("soub_talus", cote * 1.14, cote * 1.14, 1.2, (0, CY, 0), m["pierre"]))
        o.append(C.boite("soub", cote, cote, hz, (0, CY, 0), m["pierre"]))
        d = cote / 2
        for k, (a, b) in enumerate((((-d, CY - d), (d, CY - d)), ((-d, CY + d), (-d, CY - d)))):
            o.append(P.corbeaux_ligne("mach%d" % k, a, b, hz - 0.75, m["pierre"], pas=0.75))
        o.append(C.boite("parapet_sol", cote + 0.6, cote + 0.6, 0.35, (0, CY, hz - 0.35), m["pierre"]))
        o.append(C.boite("dallage", cote + 0.4, cote + 0.4, 0.05, (0, CY, hz), m["dalle"]))
        bm = bmesh.new()
        d2 = cote / 2 + 0.25
        coins = [(-d2, CY - d2), (d2, CY - d2), (d2, CY + d2), (-d2, CY + d2)]
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], hz, h=0.6, ep=0.35, pas=0.9)
        o.append(C.objet_maillage("crn", bm, m["pierre"]))
        o += E.baliste("bal", (0.0, CY + 0.15, hz + 0.05), m, echelle=1.6, lacet=LACET_BALISTE, arc=1.5, **BALISTE_TIR[image])
        o += C.drapeau("banniere", camp, 3.2, 2.2, 1.45, loc=(-1.75, CY + 1.75, hz), vent=1.0, epi=True, cap=CAP,
                       mat_mat=m["bois"])
        o += C.tenture("tenture", camp, 1.9, 2.3, loc=(-0.6, CY - d - 0.42, hz - 0.85), rot_z=0.0, graine=1,
                       mat_tringle=m["bois"])
        o += P.porte_arc("porte", 1.0, CY - d - 0.02, 0.95, 1.8, m, seuil=0.35)
        for k, (x, zr) in enumerate(((1.1, 0.62), (-1.2, 0.3))):
            o.append(P.fente("arch%d" % k, x, CY - d - 0.02, hz * zr, -math.pi / 2, m["noir"]))
    return o


def baliste_rivale(camp, image=0):
    """Baliste rivale (niveau 1) : sur une plate-forme de pierre du camp (tour carrée basse, tournée de 32°)."""
    m = mats_tour(camp)
    o = []
    sud = camp == "omeyyades"
    cote, hz = 3.6, 2.8
    if sud:
        o += P.tour_carree("soub", 0, 0, cote, hz, m, merlons="pointe", mat="mur", soubassement=("pierre", 2.5), archeres=None)
    else:
        o += P.tour_carree("soub", 0, 0, cote, hz, m, archeres=None)
    o.append(C.boite("dallage", cote - 0.25, cote - 0.25, 0.05, (0, 0, hz + 0.04), m["dalle"]))
    o += E.baliste("bal", (0.0, 0.1, hz), m, echelle=1.45, lacet=LACET_BALISTE - LACET, arc=1.5, **BALISTE_TIR[image])
    o += C.tenture("tenture", camp, 2.1, 1.65, loc=(-cote / 2 - 0.14, -0.2, hz - 0.05), rot_z=-math.pi / 2, graine=1,
                   mat_tringle=m["bois"], pointe=0.12)
    o += C.tenture("tenture_s", camp, 2.0, 1.65, loc=(-0.3, -cote / 2 - 0.14, hz - 0.05), rot_z=0.0, graine=2,
                   mat_tringle=m["bois"], pointe=0.12)
    o += C.drapeau("flamme", camp, 3.2, 2.6, 1.7, loc=(-1.2, 1.2, hz), vent=1.0, cap=CAP - LACET,
                   inverse=bool(C.CAMPS[camp].get("inverse")))
    C.pivot("tour", o, LACET, (0, CY, 0))
    return o


# ---------------------------------------------------------------- catapulte (trébuchet)
def tas_boulets(nom, x, y, z, m, n=4):
    """Petit tas de boulets de pierre grise (munitions du trébuchet)."""
    pos = [(0, 0, 0), (0.5, 0.05, 0), (0.25, 0.42, 0), (0.25, 0.15, 0.38), (-0.45, 0.2, 0)][:n]
    return [C.sphere("%s%d" % (nom, k), 0.26, (x + px, y + py, z + 0.24 + pz), m["boulet"], subdiv=2) for k, (px, py, pz) in enumerate(pos)]


def catapulte_france(niveau, image=0):
    m = mats_tour("france")
    mt = dict(m, pierre=m["boulet"])          # la pierre de la fronde est un boulet gris, pas la pierre des murs
    o = []
    if niveau == 1:
        # perrière (trébuchet à traction) sur un plancher de bois
        o.append(C.boite("plancher", 4.2, 2.6, 0.25, (0, CY, 0), m["bois"]))
        o += E.trebuchet("treb", (0.1, CY, 0.25), mt, echelle=0.85, contrepoids=False, lacet=-10, **trebuchet_tir(image, 40))
        o += C.tenture("tenture", "france", 1.5, 1.9, loc=(-1.4, CY - 1.4, 2.15), rot_z=0.0, graine=1, mat_tringle=m["bois"],
                       pointe=0.1)
        for k, sx in enumerate((-2.2, -0.6)):
            o.append(C.boite("tenture_pieu%d" % k, 0.1, 0.1, 2.2, (sx, CY - 1.4, 0), m["bois"]))
        o += flamme("france", (1.7, CY + 1.2, 0.25), hauteur_mat=3.4)
        o += tas_boulets("boulet", 1.4, CY - 0.8, 0.25, m, n=3)
    elif niveau == 2:
        # trébuchet à contrepoids sur une plate-forme de pierre
        o.append(C.boite("soub", 4.4, 2.8, 1.2, (0, CY, 0), m["pierre"]))
        o.append(C.boite("dallage", 4.3, 2.7, 0.05, (0, CY, 1.2), m["dalle"]))
        o += E.trebuchet("treb", (0.1, CY, 1.2), mt, echelle=0.95, contrepoids=True, lacet=-10, **trebuchet_tir(image, 38))
        o += tas_boulets("boulet", 1.5, CY - 0.9, 1.2, m, n=4)
        o += C.tenture("tenture", "france", 1.8, 1.05, loc=(-1.0, CY - 1.45, 1.12), rot_z=0.0, graine=1, mat_tringle=m["bois"],
                       pointe=0.15)
        o += flamme("france", (1.8, CY + 1.1, 1.2), hauteur_mat=3.6, longueur=2.3, hauteur=1.5)
    else:
        # grand trébuchet sur bastion de pierre crénelé, abri couvert d'ardoises pour les servants, épi et flamme
        cote = 4.6
        o.append(C.boite("soub_talus", cote + 0.4, cote * 0.62 + 0.4, 0.8, (0, CY, 0), m["pierre"]))
        o.append(C.boite("soub", cote, cote * 0.62, 1.8, (0, CY, 0), m["pierre"]))
        bm = bmesh.new()
        dx, dy = cote / 2, cote * 0.31
        coins = [(-dx, CY - dy), (dx, CY - dy), (dx, CY + dy), (-dx, CY + dy)]
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], 1.8, h=0.55, ep=0.35, pas=0.9)
        o.append(C.objet_maillage("crn", bm, m["pierre"]))
        o.append(C.boite("dallage", cote - 0.1, cote * 0.62 - 0.1, 0.05, (0, CY, 1.8), m["dalle"]))
        o += E.trebuchet("treb", (0.3, CY, 1.8), mt, echelle=1.05, contrepoids=True, lacet=-10, **trebuchet_tir(image, 36))
        o += tas_boulets("boulet", 1.6, CY - 0.7, 1.8, m, n=5)
        o.append(C.boite("abri", 1.4, 1.4, 1.5, (-1.7, CY + 1.1, 1.8), m["bois"]))
        o += P.cone_uv("abri_toit", 1.2, 1.4, (-1.7, CY + 1.1, 3.3), m["toit"], pans=4, rot=math.pi / 4, epi=m["or"])
        o += flamme("france", (-1.7, CY + 1.1, 3.3 + 1.4 + 0.1), hauteur_mat=1.2, longueur=1.8, hauteur=1.15)
        # toit de l'abri en ardoise (et non plus bleu roi) : la couleur du camp vient d'une grande flamme à l'angle droit
        # du bastion (comme au niveau 2, la verge ne la cache pas) et d'une tenture plus large sur le front
        o += flamme("france", (2.0, CY + dy - 0.25, 1.8), hauteur_mat=3.4, longueur=2.2, hauteur=1.4)
        o += C.tenture("tenture", "france", 2.3, 1.15, loc=(-1.0, CY - dy - 0.1, 1.75), rot_z=0.0, graine=1, mat_tringle=m["bois"],
                       pointe=0.12)
    return o


TOURS = {}
for _n in (1, 2, 3):
    TOURS["tour-archers-france-%d" % _n] = (lambda k=0, n=_n: archers_france(n, k), "france")
    TOURS["tour-piquiers-france-%d" % _n] = (lambda k=0, n=_n: piquiers_france(n, k), "france")
    TOURS["tour-baliste-france-%d" % _n] = (lambda k=0, n=_n: baliste_tour("france", n, k), "france")
    TOURS["tour-catapulte-france-%d" % _n] = (lambda k=0, n=_n: catapulte_france(n, k), "france")
TOURS["tour-archers-angleterre-1"] = (lambda k=0: archers_angleterre(1, k), "angleterre")
TOURS["tour-archers-omeyyades-1"] = (lambda k=0: archers_omeyyades(1, k), "omeyyades")
TOURS["tour-baliste-angleterre-1"] = (lambda k=0: baliste_rivale("angleterre", k), "angleterre")
TOURS["tour-baliste-omeyyades-1"] = (lambda k=0: baliste_rivale("omeyyades", k), "omeyyades")


def cadrage_auto(objs, marge_px=4.0):
    """Recule (vers le nord) tout l'ouvrage si sa base déborde sous le bas de l'image : on mesure la silhouette projetée
    (vue inclinée de 40°) de tous les maillages évalués. Le centre de l'emplacement reste sous l'ouvrage (recul de quelques
    décimètres au plus). Renvoie le recul appliqué (m) et la hauteur libre restante en haut (px logiques)."""
    dg = bpy.context.evaluated_depsgraph_get()
    t = math.radians(C.INCLINAISON)
    bas, haut = 1e9, -1e9
    for o in bpy.context.scene.objects:
        if o.type != "MESH" or o.is_shadow_catcher:
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        mw = o.matrix_world
        for v in me.vertices:
            p = mw @ v.co
            e = p.z * math.cos(t) + p.y * math.sin(t)
            bas, haut = min(bas, e), max(haut, e)
        ev.to_mesh_clear()
    limite_bas = -(ANCRE - marge_px) / PX_PAR_M
    recul = 0.0
    if bas < limite_bas:
        recul = (limite_bas - bas) / math.sin(t)
        for o in bpy.context.scene.objects:
            if o.parent is None and o.type not in ("CAMERA", "LIGHT") and not o.is_shadow_catcher:
                o.location.y += recul
        haut += recul * math.sin(t)
    libre = (HAUTEUR - ANCRE) - haut * PX_PAR_M
    C.journal("cadrage : recul %.2f m, marge en haut %.1f px logiques" % (recul, libre))
    return recul, libre


# ---------------------------------------------------------------- contrôles par masques de matières
PLAFOND_TOITS = 0.32      # saturation HSV médiane des toits de France (ardoise gris-bleu, pas bleu roi) ; verifier.py
L_HAMPES_MIN = 70.0       # L* médiane des hampes de piques (frêne clair)
GROUPES_MASQUE = {"toit": 0, "frene_pique": 1, "fer_pique": 2}   # racine du nom de matière -> canal (R, V, B)


def masques_matieres(nom, largeur_px, hauteur_px, surech=2):
    """Après le rendu du sprite (même scène, même caméra) : rendu de contrôle à 4 échantillons, sans débruitage ni look,
    où les toits sont rouges, les hampes de piques vertes, les fers bleus et tout le reste noir (les matières à opacité
    variable restent transparentes). Renvoie un tableau (h, w, 3) 0..1 à la taille du sprite. Écrit le masque des toits
    dans le cache (controle-toits-<nom>.png, relu par verifier.py) s'il y a des toits. Remplace les matières de la scène :
    à appeler en dernier."""
    from PIL import Image
    import numpy as np
    s = bpy.context.scene

    def emission(n, rgb):
        mat, nt, p = C.nouveau_materiau(n)
        nt.nodes.remove(p)
        e = nt.nodes.new("ShaderNodeEmission")
        e.inputs["Color"].default_value = tuple(rgb) + (1.0,)
        sortie = next(x for x in nt.nodes if x.type == "OUTPUT_MATERIAL")
        nt.links.new(e.outputs[0], sortie.inputs["Surface"])
        return mat
    couleurs = {}
    for racine, canal in GROUPES_MASQUE.items():
        rgb = [0.0, 0.0, 0.0]
        rgb[canal] = 1.0
        couleurs[racine] = emission("_masque_" + racine, rgb)
    noir = emission("_masque_noir", (0.0, 0.0, 0.0))
    vide, nt_v, p_v = C.nouveau_materiau("_masque_vide")
    nt_v.nodes.remove(p_v)
    tr = nt_v.nodes.new("ShaderNodeBsdfTransparent")
    nt_v.links.new(tr.outputs[0], next(x for x in nt_v.nodes if x.type == "OUTPUT_MATERIAL").inputs["Surface"])
    vus = set()
    for ob in s.objects:
        if ob.type != "MESH" or not ob.visible_camera:
            continue
        for slot in ob.material_slots:
            mat = slot.material
            if mat is None or mat.name.startswith("_masque"):
                continue
            racine = mat.name.split(".")[0]
            if racine in couleurs:
                slot.material = couleurs[racine]
                vus.add(racine)
            elif P._est_transparent(mat):
                slot.material = vide
            else:
                slot.material = noir
    c = s.cycles
    c.samples = 4
    c.use_denoising = False
    c.use_adaptive_sampling = False
    s.view_settings.view_transform = "Standard"
    s.view_settings.look = "None"
    s.render.resolution_x, s.render.resolution_y = largeur_px * surech, hauteur_px * surech
    im = C.rendre(os.path.join(C.CACHE, "_rendu", nom + "-masques.png"))
    a = np.array(im.convert("RGBa").resize((largeur_px, hauteur_px), Image.LANCZOS), dtype=np.float32)[..., :3] / 255.0
    chemin_toits = os.path.join(C.CACHE, "controle-toits-%s.png" % nom)
    if "toit" in vus:
        Image.fromarray((a[..., 0] * 255).astype(np.uint8)).save(chemin_toits)
    elif os.path.exists(chemin_toits):
        os.remove(chemin_toits)            # plus de toit sur ce sprite : pas de vieux masque relu par verifier.py
    return a


def controles_masques(img, nom, masques):
    """Toits de France : saturation médiane ≤ 0,32 (refus sinon). Piques : L* médiane des hampes ≥ 70 (refus sinon),
    nombre de pixels de fer (lisibilité des pointes)."""
    import numpy as np
    rgba = np.array(img.convert("RGBA"), dtype=np.float64) / 255.0
    opaque = rgba[..., 3] >= 0.5
    rgb = rgba[..., :3]
    if "france" in nom:
        sel = (masques[..., 0] > 0.5) & opaque
        if sel.sum() >= 30:
            mx, mn = rgb.max(-1), rgb.min(-1)
            sat = float(np.median(((mx - mn) / np.maximum(mx, 1e-6))[sel]))
            C.journal("%s : saturation médiane des toits %.2f sur %d px (plafond %.2f)" % (nom, sat, int(sel.sum()), PLAFOND_TOITS))
            if sat > PLAFOND_TOITS:
                C._refuser(img, nom, "toits trop saturés (%.2f > %.2f)" % (sat, PLAFOND_TOITS))
    sel = (masques[..., 1] > 0.6) & opaque
    if sel.sum() >= 10:
        lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
        y = (lin * np.array([0.2126, 0.7152, 0.0722])).sum(-1)
        ls = np.where(y > 0.008856, np.cbrt(y), 7.787 * y + 16 / 116) * 116 - 16
        lmed = float(np.median(ls[sel]))
        fers = int(((masques[..., 2] > 0.5) & opaque).sum())
        C.journal("%s : hampes des piques L* médiane %.0f sur %d px (minimum %.0f) ; fers %d px rendus"
                  % (nom, lmed, int(sel.sum()), L_HAMPES_MIN, fers))
        if lmed < L_HAMPES_MIN:
            C._refuser(img, nom, "hampes des piques trop sombres (L* %.0f < %.0f)" % (lmed, L_HAMPES_MIN))


def point_tir(typ):
    """Point de départ du trait dans la scène construite (monde), ou None : pierre dans la fronde (trébuchet), pointe du
    carreau (baliste), milieu de l'arc (archers), milieu des fers des piques (piquiers)."""
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()

    def sommets(o):
        oe = o.evaluated_get(dg)
        me = oe.to_mesh()
        vs = [(oe.matrix_world @ v.co, v.co.copy()) for v in me.vertices]
        oe.to_mesh_clear()
        return vs
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if typ == "catapulte":
        o = next((o for o in objs if o.name.startswith("treb_pierre")), None)
        return o.matrix_world.translation.copy() if o else None
    if typ == "baliste":
        o = next((o for o in objs if o.name.startswith("bal_carreau")), None)
        if not o:
            return None
        vs = sommets(o)
        xmax = max(l.x for _, l in vs)
        bout = [w for w, l in vs if l.x > xmax - 1e-4]
        return sum(bout, V()) / len(bout)
    noms = ("_arc",) if typ == "archers" else ("_fer",)
    pts = []
    for o in objs:
        if any(o.name.endswith(n) or (n + ".") in o.name for n in noms) and \
                o.name.startswith("pique" if typ == "piquiers" else "archer"):
            pts += [w for w, _ in sommets(o)]
    return sum(pts, V()) / len(pts) if pts else None


def ecran(p, W, H):
    """Point du monde -> px logiques depuis le coin haut-gauche de l'image (caméra de la scène)."""
    from bpy_extras.object_utils import world_to_camera_view
    s = bpy.context.scene
    q = world_to_camera_view(s, s.camera, p)
    return [round(q.x * W, 1), round((1 - q.y) * H, 1)]


def rendre_tour(nom, surech=2, echantillons=64, dossier=None):
    """Bande de tir de la tour : IMAGES_TOUR images (même scène, même graine), contrôles sur chaque image (bords,
    couleur du camp, pas de bleu chez les Anglais ; masques des toits et des hampes sur l'image 0)."""
    import json
    fabrique, camp = TOURS[nom]
    typ = nom.split("-")[1]
    n = IMAGES_TOUR[typ]
    W, H = LARGEUR * C.ECHELLE, HAUTEUR * C.ECHELLE
    images, partage, tir, ombre0 = [], {}, None, None
    for k in range(n):
        C.reinitialiser()
        C.lumiere_batiment(camp)
        C.camera_trois_quarts(W * surech, H * surech, PX_PAR_M * C.ECHELLE * surech, ANCRE * C.ECHELLE * surech)
        C.sol_capteur(40)
        objs = fabrique(k)
        _, libre = cadrage_auto(objs)
        if libre < 1.0:
            C.journal("%s-%d : marge en haut de %.1f px logiques seulement" % (nom, k, libre))
        if k == IMAGE_TIR[typ]:
            p = point_tir(typ)
            tir = ecran(p, LARGEUR, HAUTEUR) if p is not None else None
        ident = "%s-%d" % (nom, k)
        img, ombre = C.rendre_sprite(ident, W, H, objs, surech=surech, echantillons=echantillons, contour=0.55,
                                     epaisseur_contour=1, ombre_separee=True, ombre_partagee=partage)
        if k == 0:
            ombre0 = ombre
        C.controle_camp(img, ident, camp, SEUIL_CAMP)
        if camp == "angleterre":
            img = C.eteindre_bleus(img, ident)
            C.controle_sans_bleu(img, ident)
        if k == 0:
            controles_masques(img, nom, masques_matieres(nom, W, H, surech))   # remplace les matières : en dernier
        images.append(img)
    if len(images) != n or tir is None:
        raise C.RefusRendu("%s : %d images (attendu %d), point « tir » %s" % (nom, len(images), n, tir))
    C.journal("%s : %d images, point « tir » %s (px logiques)" % (nom, n, tir))
    bande = C.bande(images)
    if dossier:
        os.makedirs(dossier, exist_ok=True)
        bande.save(os.path.join(dossier, nom + ".png"), optimize=True)
        if ombre0 is not None:
            ombre0.save(os.path.join(dossier, "ombre-" + nom + ".png"))
        chemin_tir = os.path.join(dossier, "tir.json")
        tirs = json.load(open(chemin_tir)) if os.path.exists(chemin_tir) else {}
        tirs[nom] = tir
        json.dump(tirs, open(chemin_tir, "w"), indent=1)
        C.journal("essai écrit dans %s (manifeste inchangé)" % dossier)
        return os.path.join(dossier, nom + ".png")
    return ecrire_tour(nom, bande, n, tir)


def ecrire_tour(nom, bande, n, tir):
    """Écrit la bande dans jeu/ (l'ombre portée d'avant est gardée) ; manifeste : frames, « tir »."""
    if bande.size != (n * LARGEUR * C.ECHELLE, HAUTEUR * C.ECHELLE):
        raise C.RefusRendu("%s : taille %s pour %d images" % (nom, bande.size, n))
    for k in range(n):
        C.controle_bords(bande.crop((k * LARGEUR * C.ECHELLE, 0, (k + 1) * LARGEUR * C.ECHELLE, HAUTEUR * C.ECHELLE)),
                         "%s-%d" % (nom, k))
    C.sauver_sprite(nom, bande, None, LARGEUR, HAUTEUR, LARGEUR // 2, HAUTEUR - ANCRE, n)
    e = C.lire_manifeste()[nom]
    e["tir"] = list(tir)
    C.maj_manifeste({nom: e})
    return C.chemin_td(nom + ".png")[0]


def installer(dossier):
    """Installe dans jeu/ les bandes d'un essai déjà regardé (même code, même graine : mêmes images)."""
    import json
    from PIL import Image
    tirs = json.load(open(os.path.join(dossier, "tir.json")))
    for nom, tir in sorted(tirs.items()):
        chemin = os.path.join(dossier, nom + ".png")
        if os.path.exists(chemin):
            ecrire_tour(nom, Image.open(chemin).convert("RGBA"), IMAGES_TOUR[nom.split("-")[1]], tir)
    C.journal("tours installées depuis %s : %d" % (dossier, len(tirs)))


def planche_bandes(sortie, source=None):
    """Planche des bandes de tir : pour chaque tour, l'image d'avant (si --source : celle de jeu/) puis les images de la
    bande, à 2 × la taille logique, sur l'herbe du moulin, ombre portée de jeu/ dessous ; croix rouge = ancrage, croix
    jaune = point « tir »."""
    import json
    from PIL import Image, ImageDraw
    import planche as PL
    man = C.lire_manifeste()
    tirs = json.load(open(os.path.join(source, "tir.json"))) if source else {}
    terrain = Image.open(os.path.join(C.TD, "terrain-moulin.jpg")).convert("RGBA")
    herbe = terrain.crop(coin_herbe(terrain, 140, 168))
    f = PL.police(15, True)
    lignes = []
    for nom in ORDRE_PLANCHE:
        e = man.get(nom)
        if not e:
            continue
        chemin = os.path.join(source, nom + ".png") if source else os.path.join(C.RACINE, "jeu", e["src"])
        if not os.path.exists(chemin):
            continue
        neuf = Image.open(chemin).convert("RGBA")
        n = neuf.size[0] // (2 * LARGEUR)
        avant = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA") if source else None
        tir = tirs.get(nom) if source else e.get("tir")
        lignes.append((nom, e, avant, neuf, n, tir))
    case_w, case_h = 2 * LARGEUR, 2 * HAUTEUR
    L = 60 + 5 * (case_w + 10) + 300
    H = 40 + len(lignes) * (case_h + 34)
    pl = Image.new("RGBA", (L, H), (40, 34, 28, 255))
    d = ImageDraw.Draw(pl)
    d.text((10, 10), "Bandes de tir des tours (2 × la taille logique) ; croix rouge : ancrage ; croix jaune : point « tir »"
           + (" ; première case : l'image d'avant" if source else ""), fill=(240, 228, 200, 255), font=f)
    y = 40
    om = {}
    for nom, e, avant, neuf, n, tir in lignes:
        d.text((10, y), "%s  (%d images, tir %s)" % (nom, n, tir), fill=(230, 220, 195, 255), font=f)
        y += 22
        cases = ([avant.crop((0, 0, case_w, case_h))] if avant is not None else []) + \
            [neuf.crop((k * case_w, 0, (k + 1) * case_w, case_h)) for k in range(n)]
        o = None
        if "ombre-" + nom in man:
            eo = man["ombre-" + nom]
            o = Image.open(os.path.join(C.RACINE, "jeu", eo["src"])).convert("RGBA")
        x = 10
        for i, c in enumerate(cases):
            fond = herbe.resize((case_w, case_h)).convert("RGBA")
            if o is not None:
                fond.alpha_composite(o.crop((0, 0, case_w, case_h)))
            fond.alpha_composite(c)
            pl.alpha_composite(fond, (x, y))
            ax, ay = x + 2 * e["ax"], y + 2 * e["ay"]
            d.line((ax - 5, ay, ax + 5, ay), fill=(255, 60, 60, 255))
            d.line((ax, ay - 5, ax, ay + 5), fill=(255, 60, 60, 255))
            if tir and (avant is None or i > 0):
                tx, ty = x + 2 * tir[0], y + 2 * tir[1]
                d.line((tx - 5, ty - 5, tx + 5, ty + 5), fill=(255, 230, 60, 255))
                d.line((tx - 5, ty + 5, tx + 5, ty - 5), fill=(255, 230, 60, 255))
            x += case_w + 10
        y += case_h + 12
    os.makedirs(os.path.dirname(os.path.abspath(sortie)), exist_ok=True)
    pl.convert("RGB").save(sortie, optimize=True)
    C.journal("planche des bandes de tir écrite : %s" % sortie)
    return sortie


# ---------------------------------------------------------------- planche de contrôle (PIL seulement, pas de rendu)
ORDRE_PLANCHE = ([n for t in ("archers", "piquiers", "baliste", "catapulte") for n in
                  ("tour-%s-france-%d" % (t, k) for k in (1, 2, 3))] +
                 ["tour-archers-angleterre-1", "tour-baliste-angleterre-1", "tour-archers-omeyyades-1",
                  "tour-baliste-omeyyades-1"])
DOSSIER_PLANCHE = "/tmp/claude-0/-home-user-Test/fc3329d7-53e7-59eb-8f72-fa95fe7d4108/scratchpad/graphismes"


def coin_herbe(img, w, h):
    """Boîte (x0, y0, x1, y1) d'un morceau d'herbe uni de la plaine (w × h px de l'image) : la fenêtre la plus verte et la
    plus régulière, sans route ni rivière ni arbre (écart-type de la luminosité le plus faible parmi les fenêtres vertes)."""
    import numpy as np
    a = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    H, W = a.shape[:2]
    best, boite = 1e9, (0, 0, w, h)
    for y in range(int(H * 0.2), int(H * 0.8) - h, h // 2):
        for x in range(int(W * 0.15), int(W * 0.85) - w, w // 2):
            z = a[y:y + h, x:x + w]
            r, g, b = z[..., 0].mean(), z[..., 1].mean(), z[..., 2].mean()
            if not (g > r * 1.05 and g > b * 1.3 and g > 0.25):
                continue
            ecart = float(z.mean(-1).std())
            if ecart < best:
                best, boite = ecart, (x, y, x + w, y + h)
    return boite


def planche(sortie=None, carte_id="moulin"):
    """Planche des tours : (a) la carte « moulin » telle qu'en jeu à l'échelle 1 (1000 × 660), les 12 tours de France
    sur les emplacements du joueur, les 4 tours rivales sur les emplacements rivaux, les places fortes aux bouts de la
    route ; (b) la même vue à l'échelle 2 (images pleine définition), recadrée ; (c) les 16 tours dans une fenêtre de
    640 px (échelle 0,64), agrandies × 2 ; (d) chaque tour agrandie (PNG × 2, soit 4 × la taille logique) sur gris neutre,
    croix rouge au point d'ancrage. Ombres portées dessinées d'abord (passe « sol »), puis sprites triés par y."""
    from PIL import Image, ImageDraw
    import planche as PL           # montage des planches (lecture seule : on réutilise poser et panneau_sprites)
    import verifier as VF          # géométrie des cartes lue dans jeu/js par Node
    sortie = sortie or os.path.join(DOSSIER_PLANCHE, "planche-tours.png")
    carte = VF.cartes()[carte_id]
    man = C.lire_manifeste()
    emp, riv, route = carte["emplacements"], carte["emplacementsRivaux"], carte["route"]
    france = [n for n in ORDRE_PLANCHE if "france" in n]
    rivales = [n for n in ORDRE_PLANCHE if "france" not in n]
    poses = list(zip(france, emp)) + list(zip(rivales, riv))
    pl = carte.get("places") or {"depart": route[0], "arrivee": route[-1]}      # pied des places (la route part des portes)
    poses += [("place-france-intact", pl["depart"]), ("place-angleterre-intact", pl["arrivee"])]
    terrain = os.path.join(C.TD, "terrain-%s.jpg" % carte_id)

    def vue(largeur):
        fond = Image.open(terrain).convert("RGBA")
        fond = fond.resize((largeur, largeur * 660 // 1000), Image.LANCZOS)
        for nom, (x, y) in poses:
            if "ombre-" + nom in man:
                PL.poser(fond, "ombre-" + nom, x, y)
        for nom, (x, y) in sorted(poses, key=lambda p: p[1][1]):
            PL.poser(fond, nom, x, y)
        return fond
    v1 = vue(1000)
    v2 = vue(2000)
    xs = [p[0] for _, p in poses[:16]]
    ys = [p[1] for _, p in poses[:16]]
    cx = min(max(int((sum(xs) / len(xs)) * 2) - 500, 0), 1000)
    cy = min(max(int((sum(ys) / len(ys)) * 2) - 330, 0), 660)
    zoom2 = v2.crop((cx, cy, cx + 1000, cy + 660))
    # (c) fenêtre de 640 px : échelle 0,64 des px logiques, sur un morceau d'herbe de la plaine, agrandie × 2
    herbe = Image.open(terrain).convert("RGBA")
    herbe = herbe.crop(coin_herbe(herbe, 160, 192))
    cases = []
    for nom in ORDRE_PLANCHE:
        if nom not in man:
            continue
        e = man[nom]
        case = herbe.resize((round(80 * 0.64), round(96 * 0.64)), Image.LANCZOS)
        for n in ("ombre-" + nom, nom):
            if n not in man:
                continue
            en = man[n]
            im = Image.open(os.path.join(C.RACINE, "jeu", en["src"])).convert("RGBa")
            k = 0.64 / 2
            im = im.resize((max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))), Image.LANCZOS).convert("RGBA")
            case.alpha_composite(im, (round((40 - en["ax"]) * 0.64), round((84 - en["ay"]) * 0.64)))
        cases.append(case.resize((case.size[0] * 2, case.size[1] * 2), Image.NEAREST))
    bande640 = Image.new("RGBA", (sum(c.size[0] + 8 for c in cases) + 8, cases[0].size[1] + 16), (60, 60, 60, 255))
    x = 8
    for c in cases:
        bande640.alpha_composite(c, (x, 8))
        x += c.size[0] + 8
    # (d) chaque tour agrandie
    LARG = 2000
    detail = PL.panneau_sprites(ORDRE_PLANCHE, LARG, zoom=2)
    f = PL.police(22, gras=True)
    titres = ["(a) « %s » en jeu, échelle 1 (1000 × 660)" % carte_id, "(b) la même vue à l'échelle 2 (pleine définition), recadrée",
              "(c) fenêtre de 640 px (échelle 0,64), agrandie × 2 : archers, piquiers, baliste, trébuchet (niveaux 1-2-3), "
              "puis Angleterre et Omeyyades", "(d) chaque tour à 4 × la taille logique (croix rouge : point d'ancrage)"]
    h = 40 + 660 + 40 + bande640.size[1] + 40 + detail.size[1] + 10
    p = Image.new("RGBA", (LARG, h), (40, 38, 34, 255))
    d = ImageDraw.Draw(p)
    d.text((10, 8), titres[0], fill=(235, 225, 200, 255), font=f)
    d.text((1010, 8), titres[1], fill=(235, 225, 200, 255), font=f)
    p.alpha_composite(v1, (0, 40))
    p.alpha_composite(zoom2, (1000, 40))
    y = 40 + 660
    d.text((10, y + 8), titres[2], fill=(235, 225, 200, 255), font=f)
    p.alpha_composite(bande640, (0, y + 40))
    y += 40 + bande640.size[1]
    d.text((10, y + 8), titres[3], fill=(235, 225, 200, 255), font=f)
    p.alpha_composite(detail, (0, y + 40))
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    p.convert("RGB").save(sortie, optimize=True)
    C.journal("planche écrite : %s (%d × %d)" % (sortie, p.size[0], p.size[1]))
    return sortie


def main(args):
    if args and args[0] == "--planche":
        planche(args[1] if len(args) > 1 else None)
        return
    if args and args[0] == "--planche-bandes":
        planche_bandes(args[1], args[args.index("--source") + 1] if "--source" in args else None)
        return
    if args and args[0] == "--installer":
        installer(args[1])
        return
    dossier = None
    if "--dossier" in args:
        i = args.index("--dossier")
        dossier = args[i + 1]
        args = args[:i] + args[i + 2:]
    for nom in (args or list(TOURS)):
        rendre_tour(nom, dossier=dossier)


if __name__ == "__main__":
    main(sys.argv[1:])
