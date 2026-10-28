# -*- coding: utf-8 -*-
"""Famille « route » du mode Expéditions : les quatre médaillons des gardiens (cahier § 3.1).

Images (jeu/assets/images/expedition/, manifeste images.js, cahier atelier/conception/expeditions-graphismes.md) :
  - gardien-angleterre, gardien-omeyyades : gardien de la semaine. Écu en amande aux armes du camp penché contre un
    poteau, heaume (Angleterre) ou casque conique à nasal (Omeyyades) posé sur le poteau et ceint d'un tortil tressé
    aux deux couleurs du camp, pennon du camp sur une courte hampe.
  - grand-angleterre, grand-omeyyades : Grand Gardien. Même composition, écu plus grand, bannière entière à épi d'or
    à la place du pennon, un second écu plus petit à l'arrière. Pas de couronne, aucun emblème religieux.
Chaque médaillon fait 88 unités (fichier 176 px), ancre au centre ; rondel commun de rayon 34 (R_GARDIEN du SVG), même
lumière et même caméra que les haltes (scene_vignette à 45°). Les camps restent des puissances politiques : écus et
bannières seulement, aucune figure, aucun visage.
L'écran (ecran-expedition.js, medaillonGardien) pose l'image sur le médaillon de 72 px quand le gardien n'a pas de
portrait ; le Grand Gardien garde son portrait quand il en a un.
Lancer : cd /home/user/Test && python3 atelier/outils/rendu-3d/expedition_gardiens.py [noms d'images]
Sans argument : les quatre, puis la planche atelier/captures/planche-expedition-gardiens.png (échelles 0,5, 1 et 2, à
côté de halte-escarmouche) et la vérification du budget. --planche seul : la planche sans rendu.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expedition_commun as E  # noqa: E402
import commun as C  # noqa: E402
import figurines as F  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

ECHANTILLONS = 48
RAYON_SOL = 4.5                   # sol-capteur : plus large que le champ (2,8 m), car la composition est recentrée vers le sud ;
                                  # l'ombre est de toute façon coupée au champ intérieur par rendre_rondel
ACIER_CLAIR = "#b4b9c1"           # heaume anglais : acier clair, il se lit sur le parchemin (revue des haltes du 28/10)
ACIER_OMEYYADE = "#9a9ea4"        # casque omeyyade : acier un peu plus gris, le tortil ivoire et vert fait le camp
BOIS_POTEAU = "#5a3e22"
# les deux couleurs du tortil : albédos « tissu » des étoffes du camp (le rendu retombe sur les couleurs héraldiques)
TORTIL = {"angleterre": ("#b3262a", "#e2c272"), "omeyyades": ("#ece4cf", "#357659")}
RAPPORT_ECU = 0.535               # largeur / longueur de l'écu en amande (texture 256 × 480 de figurines.texture_ecu)
PIED_ECU = 0.72                   # l'origine de figurines.ecu_amande est à 72 % de la hauteur depuis la pointe


# ---------------------------------------------------------------- petits outils
def mats(camp):
    """Matières d'un gardien : bois du poteau et des hampes, acier du casque, noir de la fente, deux étoffes du tortil."""
    c1, c2 = TORTIL[camp]
    return {"bois": E.mat_bois("poteau_bois", BOIS_POTEAU),
            "acier": C.mat_metal("acier_casque", ACIER_OMEYYADE if camp == "omeyyades" else ACIER_CLAIR, rugosite=0.5),
            "fer": C.mat_metal("fer_casque", "#6f6a62", rugosite=0.5),
            "noir": E.mat_encre("noir_fente"),
            "tortil1": C.mat_tissu("tortil_1", c1, rugosite=0.85),
            "tortil2": C.mat_tissu("tortil_2", c2, rugosite=0.85)}


def racine(objets, k=1.0, dx=0.0, dy=0.0):
    """Repère racine : agrandit toute la composition de k et la décale de (dx, dy) m pour la centrer dans le champ."""
    r = C.lier(bpy.data.objects.new("racine", None))
    for o in objets:
        if o.parent is None and o is not r:
            o.parent = r
    r.scale = (k, k, k)
    r.location = (dx, dy, 0.0)
    return objets + [r]


# ---------------------------------------------------------------- formes
def tortil(nom, rayon, section, loc, mats_brins, tours=6, segments=144, cotes=10):
    """Tortil : deux brins d'étoffe tordus l'un autour de l'autre en couronne (le bourrelet des heaumes). Chaque brin
    tourne autour du cercle moyen (rayon, à la hauteur loc[2]) à la distance « section », en opposition de phase : les
    deux couleurs alternent tout autour. Renvoie les deux objets."""
    objets = []
    for i, mat in enumerate(mats_brins):
        bm = bmesh.new()
        anneaux = []
        for s in range(segments):
            a = 2 * math.pi * s / segments
            ph = tours * a + i * math.pi
            cr = rayon + section * math.cos(ph)
            cz = section * math.sin(ph)
            ca, sa = math.cos(a), math.sin(a)
            ring = []
            for j in range(cotes):
                b = 2 * math.pi * j / cotes
                r = cr + section * 0.98 * math.cos(b)
                ring.append(bm.verts.new((r * ca, r * sa, cz + section * 0.98 * math.sin(b))))
            anneaux.append(ring)
        for s in range(segments):
            a0, a1 = anneaux[s], anneaux[(s + 1) % segments]
            for j in range(cotes):
                f = bm.faces.new((a0[j], a1[j], a1[(j + 1) % cotes], a0[(j + 1) % cotes]))
                f.smooth = True
        ob = C.objet_maillage("%s_brin%d" % (nom, i + 1), bm, mat, lisse=True)
        ob.location = loc
        objets.append(ob)
    return objets


def heaume(nom, loc, rayon, m):
    """Grand heaume d'acier posé sur le poteau : cylindre, calotte bombée, fente de visée horizontale sombre devant
    (-Y) ; pas de renfort vertical (aucune croix)."""
    x, y, z = loc
    corps = C.cylindre(nom, rayon, 0.52, (x, y, z), m["acier"], segments=36)
    calotte = C.sphere(nom + "_calotte", rayon, (x, y, z + 0.52), m["acier"], subdiv=3, echelle=(1, 1, 0.5))
    fente = C.boite(nom + "_fente", rayon * 1.3, 0.05, 0.05, (x, y - rayon + 0.015, z + 0.4), m["noir"], base=False)
    return [corps, calotte, fente]


def casque_conique(nom, loc, rayon, m):
    """Casque conique à nasal (Omeyyades) : cercle de fer, calotte en sphère étirée, pointe en cône, nasal qui
    descend devant (-Y). Rien d'autre dessus : aucun turban, aucun signe."""
    x, y, z = loc
    cercle = C.cylindre(nom + "_cercle", rayon * 1.02, 0.09, (x, y, z), m["fer"], segments=36)
    calotte = C.sphere(nom + "_calotte", rayon, (x, y, z + 0.09), m["acier"], subdiv=3, echelle=(1, 1, 0.9))
    pointe = C.cone(nom + "_pointe", rayon * 0.62, 0.5, (x, y, z + 0.09 + rayon * 0.55), m["acier"], segments=36)
    nasal = C.boite(nom + "_nasal", 0.055, 0.04, 0.34, (x, y - rayon + 0.01, z - 0.3), m["acier"])
    return [cercle, calotte, pointe, nasal]


def ecu(nom, camp, longueur, pied=(0, 0), penche=24.0, lacet=0.0):
    """Écu en amande aux armes du camp (figurines.ecu_amande), debout face à la caméra, la pointe au sol en « pied »,
    penché en arrière de « penche » degrés (le haut part vers le nord), tourné de « lacet » degrés."""
    ob = F.ecu_amande(nom, camp, longueur=longueur, largeur=longueur * RAPPORT_ECU, bombe=0.05 * longueur)
    p = C.lier(bpy.data.objects.new(nom + "_pied", None))
    p.rotation_mode = "ZXY"                                    # d'abord face à -Y (lacet - 90°), puis penché
    p.rotation_euler = (-math.radians(penche), 0.0, math.radians(lacet - 90.0))
    p.location = (pied[0], pied[1], 0.0)
    ob.parent = p
    ob.location = (0.0, 0.0, PIED_ECU * longueur)
    return [ob, p]


def hampe(nom, camp, loc, hauteur_mat, longueur, hauteur, cap, m, epi=False):
    """Pennon ou bannière du camp (commun.drapeau) sur une hampe de bois ; Omeyyades : couleurs inversées (tour ivoire
    sur champ vert, lisible sur le parchemin)."""
    return C.drapeau(nom, camp, hauteur_mat, longueur=longueur, hauteur=hauteur, loc=loc, cap=cap, epi=epi,
                     inverse=(camp == "omeyyades"), mat_mat=m["bois"], epaisseur_mat=0.05 if epi else 0.04, echelle_embleme=0.8)


def casque(nom, camp, loc, m, penche=-12.0):
    """Le couvre-chef du camp, ceint de son tortil, posé sur le poteau. Vu de trois quarts d'en haut, un casque droit
    ne montre guère que sa calotte : il est un peu penché en arrière (penche < 0 : le haut part vers le nord), ce qui
    présente sa face (fente de visée, nasal). Heaume anglais : le tortil est posé sur la calotte, comme sous un cimier ;
    casque conique omeyyade : le tortil ceint le cercle, la pointe en sort."""
    if camp == "omeyyades":
        objets = casque_conique(nom, (0, 0, 0), 0.36, m)
        objets += tortil(nom + "_tortil", 0.42, 0.075, (0, 0, 0.16), (m["tortil1"], m["tortil2"]))
    else:
        objets = heaume(nom, (0, 0, 0), 0.36, m)
        objets += tortil(nom + "_tortil", 0.3, 0.075, (0, 0, 0.52 + 0.1), (m["tortil1"], m["tortil2"]))
    p = C.lier(bpy.data.objects.new(nom + "_pose", None))
    for o in objets:
        o.parent = p
    p.rotation_euler = (math.radians(penche), 0.0, 0.0)
    p.location = loc
    return objets + [p]


# ---------------------------------------------------------------- compositions
def gardien(camp):
    """Gardien de la semaine : écu contre un poteau, casque au tortil sur le poteau, pennon à droite."""
    E.scene_vignette(E.GARDIEN, rayon_sol=RAYON_SOL)
    m = mats(camp)
    # le casque dépasse juste du haut de l'écu (comme la tête du médaillon SVG) ; le poteau est derrière la moitié droite
    # de l'écu, vers le centre du champ : le tortil ne mord pas la bande d'or, qui s'incurve vite en haut à gauche
    poteau, haut = (0.15, 0.6), 2.25 if camp == "omeyyades" else 2.15
    objets = [C.cylindre("poteau", 0.11, haut, (poteau[0], poteau[1], 0), m["bois"], segments=16)]
    objets += casque("casque", camp, (poteau[0], poteau[1], haut), m)
    objets += ecu("ecu", camp, 2.3, pied=(-0.15, -0.45), penche=14)
    objets += hampe("pennon", camp, (1.25, 0.25, 0), 2.2, 1.2, 0.72, -45, m)
    objets = racine(objets, 1.62, dx=-0.95, dy=-2.5)
    return E.rendre_rondel("gardien-" + camp, objets, taille=E.GARDIEN, rayon_u=E.R_GARDIEN, echantillons=ECHANTILLONS, contour=0.45)


def grand(camp):
    """Grand Gardien : écu plus grand, bannière entière à épi d'or, second écu plus petit à l'arrière."""
    E.scene_vignette(E.GARDIEN, rayon_sol=RAYON_SOL)
    m = mats(camp)
    poteau = (-0.35, 0.65)
    objets = [C.cylindre("poteau", 0.12, 2.4, (poteau[0], poteau[1], 0), m["bois"], segments=16)]
    objets += casque("casque", camp, (poteau[0], poteau[1], 2.4), m)
    objets += ecu("ecu", camp, 2.6, pied=(-0.2, -0.5), penche=20)
    objets += ecu("ecu2", camp, 1.6, pied=(-1.15, 0.85), penche=18, lacet=30)
    objets += hampe("banniere", camp, (1.2, 0.35, 0), 2.9, 1.8, 1.15, -60, m, epi=True)
    objets = racine(objets, 1.4, dx=-0.5, dy=-2.6)
    return E.rendre_rondel("grand-" + camp, objets, taille=E.GARDIEN, rayon_u=E.R_GARDIEN, echantillons=ECHANTILLONS, contour=0.45)


IMAGES = {"gardien-angleterre": lambda: gardien("angleterre"), "gardien-omeyyades": lambda: gardien("omeyyades"),
          "grand-angleterre": lambda: grand("angleterre"), "grand-omeyyades": lambda: grand("omeyyades")}


# ---------------------------------------------------------------- planche de contrôle
def planche(ids=tuple(IMAGES) + ("halte-escarmouche",), nom="planche-expedition-gardiens.png"):
    """Planche des gardiens à côté de halte-escarmouche : chaque image à l'échelle logique 0,5 (44 px, un écran étroit),
    1 (88 px, la route à 1366) et 2 (le fichier), sur le parchemin de route rendu. Renvoie le chemin."""
    man = E.lire_manifeste()
    fond = os.path.join(E.DOSSIER, "route-fond.jpg")
    police, petite = E._police(14), E._police(11)
    echelles = ((0.25, "× 0,5"), (0.5, "× 1"), (1.0, "× 2 (fichier)"))
    col, marge = 200, 16
    L = marge + col * len(ids) + 90
    hauteurs = [int(180 * s) + 30 for s, _ in echelles]
    H = marge + sum(hauteurs) + 60
    if os.path.exists(fond):
        f = Image.open(fond).convert("RGB")
        can = Image.new("RGB", (L, H))
        f = f.resize((L, 320), Image.LANCZOS)
        for y in range(0, H, 320):
            can.paste(f, (0, y))
    else:
        can = Image.new("RGB", (L, H), C.rgb8(E.PARCHEMIN))
    d = ImageDraw.Draw(can)
    y = marge
    for (s, lib), h in zip(echelles, hauteurs):
        d.text((marge, y + 4), lib, fill=C.rgb8(E.RUBRIQUE), font=police)
        for i, k in enumerate(ids):
            e = man.get(k)
            x = marge + 90 + i * col
            if not e:
                d.text((x, y + 10), "manque : " + k, fill=(120, 30, 40), font=petite)
                continue
            chemin = os.path.join(C.RACINE, "jeu", e["f"])
            im = Image.open(chemin).convert("RGBA")
            w, hh = max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))
            v = im.convert("RGBa").resize((w, hh), Image.LANCZOS).convert("RGBA")
            can.paste(v, (x, y + 4), v)
            if s == 1.0:
                d.text((x, y + hh + 8), k, fill=C.rgb8(E.ENCRE), font=petite)
                d.text((x, y + hh + 22), "%d × %d, %d Ko" % (e["w"], e["h"], os.path.getsize(chemin) // 1024), fill=(90, 74, 54), font=petite)
        y += h
    d.text((marge, H - 36), "Gardiens de la route : rondel de rayon 34 (72 px à l'écran) ; budget du dossier %d Ko / %d Ko" % (E.budget() // 1000, E.BUDGET_TOTAL // 1000),
           fill=C.rgb8(E.RUBRIQUE), font=police)
    os.makedirs(E.CAPTURES, exist_ok=True)
    chemin = os.path.join(E.CAPTURES, nom)
    can.save(chemin)
    E.journal("planche : " + os.path.relpath(chemin, C.RACINE))
    return chemin


def main(args):
    quoi = [a for a in args if not a.startswith("--")]
    tout = not quoi and "--planche" not in args
    for nom, f in IMAGES.items():
        if tout or nom in quoi or nom.split("-")[1] in quoi:
            E.sauver(nom, f())
    planche()
    if tout or quoi:
        E.verifier_budget()


if __name__ == "__main__":
    main(sys.argv[1:])
