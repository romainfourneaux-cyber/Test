# -*- coding: utf-8 -*-
"""Engins et ouvrages de bois : baliste, trébuchet, palissade de pieux, tour de siège sur roues.

Fonctions de construction (pas de rendu ici) utilisées par tours.py et unites.py. Repère : +X vers la droite
de l'écran (les engins visent l'est), +Y vers le nord, +Z vers le haut ; unité le mètre. Tout est modélisé
par programme (CC0), avec les textures de bois Poly Haven (CC0).
"""
import math
import random

import bmesh
import bpy
from mathutils import Vector, Matrix

import commun as C

V = Vector


def bois(nom="bois_engin", cible="#7a5a3c", echelle=1.4):
    return C.mat_ph(nom, "medieval_wood", echelle_m=echelle, cible=cible, contraste=1.3, bosse=0.4)


def poutre(nom, a, b, ep, mat, ep2=None):
    """Poutre de section carrée (ep × ep2) entre deux points."""
    a, b = V(a), V(b)
    d = b - a
    L = d.length
    o = C.boite(nom, L, ep, ep2 or ep, (0, 0, 0), mat, base=False)
    dn = d.normalized()
    y = V((0, 0, 1)).cross(dn)
    if y.length < 1e-4:
        y = V((0, 1, 0))
    y.normalize()
    z = dn.cross(y).normalized()
    m = Matrix((dn, y, z)).transposed().to_4x4()
    m.translation = (a + b) / 2
    o.matrix_world = m
    return o


def roue(nom, centre, rayon, mat, mat_fer=None, rayons=8, ep=0.18, axe="y"):
    """Roue de bois cerclée de fer (dans le plan X-Z, axe le long de Y)."""
    objs = []
    jante = C.cylindre(nom + "_jante", rayon, ep, (0, 0, 0), mat_fer or mat, segments=24)
    jante.rotation_euler = (math.pi / 2, 0, 0)
    jante.location = (centre[0], centre[1] + ep / 2, centre[2])
    objs.append(jante)
    moyeu = C.cylindre(nom + "_moyeu", rayon * 0.82, ep + 0.04, (0, 0, 0), mat, segments=24)
    moyeu.rotation_euler = (math.pi / 2, 0, 0)
    moyeu.location = (centre[0], centre[1] + (ep + 0.04) / 2 + 0.005, centre[2])
    objs.append(moyeu)
    return objs


def plancher(nom, x, y, z, lx, ly, mat, ep=0.16):
    return C.boite(nom, lx, ly, ep, (x, y, z), mat)


# ---------------------------------------------------------------- baliste
def frene(nom="frene"):
    """Frêne clair (bras et fût des balistes) : se détache en clair sur la pierre et le bois sombre, à la taille du jeu."""
    return C.mat_ph(nom, "medieval_wood", echelle_m=1.0, cible="#c4aa7c", contraste=1.1, bosse=0.3)


def baliste(nom, loc, mats, echelle=1.0, lacet=0.0, arc=1.0):
    """Baliste sur affût : arbrier (fût), deux bras arqués en frêne clair, cordes sombres, carreau en place, chevalet à
    trois pieds. arc : allonge les bras (silhouette en X lisible : envergure ≥ 55 % de la largeur du sprite).
    Le fût vise +X avant rotation (lacet)."""
    e = echelle
    x0, y0, z0 = loc
    objs = []
    b, fer = mats["bois"], mats["fer"]
    clair = mats.get("frene") or b
    corde = C.mat_simple("corde", "#3b2f22", rugosite=0.9)
    # chevalet
    pied = [(-0.5, -0.5), (-0.5, 0.5), (0.6, 0.0)]
    tete = V((0, 0, 1.0 * e))
    for k, (px, py) in enumerate(pied):
        objs.append(poutre(nom + "_pied%d" % k, V((px * e, py * e, 0)), tete, 0.12 * e, b))
    # arbrier incliné vers le haut et l'avant
    arr, av = V((-1.3 * e, 0, 0.9 * e)), V((1.2 * e, 0, 1.25 * e))
    objs.append(poutre(nom + "_fut", arr, av, 0.2 * e, clair, 0.16 * e))
    # bras (arc) : deux demi-arcs dans le plan horizontal, à l'avant, recourbés vers l'arrière (silhouette en X)
    tete_bras = av + V((-0.3 * e, 0, 0.05 * e))
    for cote in (-1, 1):
        pts = [tete_bras + V((-0.5 * e * t * t * arc, cote * 1.15 * e * t * arc, 0.12 * e * t)) for t in (0.0, 0.35, 0.7, 1.0)]
        for k in range(3):
            objs.append(poutre(nom + "_bras%d_%d" % (cote, k), pts[k], pts[k + 1], 0.15 * e * (1.0 - 0.2 * k), clair))
        objs.append(poutre(nom + "_corde%d" % cote, pts[-1], arr + V((0.7 * e, 0, 0.12 * e)), 0.035 * e, corde))
    objs.append(C.boite(nom + "_cadre", 0.35 * e, 0.7 * e, 0.5 * e, tete_bras, fer, base=False))
    # carreau
    objs.append(poutre(nom + "_carreau", arr + V((0.7 * e, 0, 0.16 * e)), av + V((0.5 * e, 0, 0.12 * e)), 0.05 * e, b))
    objs.append(C.boite(nom + "_treuil", 0.3 * e, 0.6 * e, 0.3 * e, arr + V((0.15 * e, 0, 0)), b, base=False))
    pv = C.pivot(nom + "_pv", objs, lacet, (x0, y0, z0))
    return objs + [pv]


# ---------------------------------------------------------------- trébuchet
def trebuchet(nom, loc, mats, echelle=1.0, contrepoids=True, lacet=0.0, bras_angle=35.0):
    """Trébuchet : deux montants en A sur une semelle, axe, verge (bras) inclinée, contrepoids (caisse) ou cordes de
    traction (perrière), fronde pendante. La verge lance vers +X."""
    e = echelle
    objs = []
    b, fer = mats["bois"], mats["fer"]
    corde = C.mat_simple("corde", "#7a6548", rugosite=0.9)
    h = 3.2 * e
    for cote in (-1, 1):
        y = 0.7 * cote * e
        objs.append(poutre(nom + "_semelle%d" % cote, V((-1.8 * e, y, 0.12 * e)), V((1.8 * e, y, 0.12 * e)), 0.24 * e, b))
        objs.append(poutre(nom + "_mont_a%d" % cote, V((-1.4 * e, y, 0.2 * e)), V((0, y, h)), 0.2 * e, b))
        objs.append(poutre(nom + "_mont_b%d" % cote, V((1.4 * e, y, 0.2 * e)), V((0, y, h)), 0.2 * e, b))
        objs.append(poutre(nom + "_traverse%d" % cote, V((-0.75 * e, y, 1.5 * e)), V((0.75 * e, y, 1.5 * e)), 0.14 * e, b))
    for x in (-1.6 * e, 1.6 * e):
        objs.append(poutre(nom + "_entretoise%d" % int(x * 10), V((x, -0.75 * e, 0.12 * e)), V((x, 0.75 * e, 0.12 * e)), 0.2 * e, b))
    objs.append(poutre(nom + "_axe", V((0, -0.9 * e, h)), V((0, 0.9 * e, h)), 0.12 * e, fer))
    # verge : le grand bras monte vers l'arrière-haut (armé), le petit bras porte le contrepoids
    a = math.radians(bras_angle)
    d = V((-math.cos(a), 0, math.sin(a)))
    long_b, court_b = 4.6 * e, 1.3 * e
    pivot = V((0, 0, h))
    bout = pivot + d * long_b
    objs.append(poutre(nom + "_verge", pivot - d * court_b, bout, 0.2 * e, b, 0.24 * e))
    if contrepoids:
        cp = pivot - d * court_b
        objs.append(C.boite(nom + "_contrepoids", 1.0 * e, 1.0 * e, 1.0 * e, cp + V((0, 0, -0.9 * e)), b))
        objs.append(poutre(nom + "_attache", cp, cp + V((0, 0, -0.4 * e)), 0.08 * e, fer))
        for k in range(3):
            objs.append(C.boite(nom + "_cerclage%d" % k, 1.04 * e, 1.04 * e, 0.06 * e, cp + V((0, 0, -0.85 * e + k * 0.32 * e)), fer))
    else:
        cp = pivot - d * court_b
        for k in range(4):
            yy = (k - 1.5) * 0.18 * e
            objs.append(poutre(nom + "_corde%d" % k, cp + V((0, yy, 0)), V((cp.x - 0.3 * e + 0.2 * k * e, yy, 0.05)), 0.03 * e, corde))
    # fronde pendante et pierre
    objs.append(poutre(nom + "_fronde", bout, bout + V((0.3 * e, 0, -1.6 * e)), 0.03 * e, corde))
    objs.append(C.sphere(nom + "_pierre", 0.28 * e, bout + V((0.3 * e, 0, -1.75 * e)), mats["pierre"], subdiv=2))
    pv = C.pivot(nom + "_pv", objs, lacet, loc)
    return objs + [pv]


# ---------------------------------------------------------------- palissade
def palissade(nom, cx, cy, rayon, hauteur, mats, nb=None, graine=0, ouverture=None, z0=0.0):
    """Cercle de pieux taillés en pointe, liés par une lisse ; ouverture = (angle°, largeur°) laissée libre."""
    rnd = random.Random(graine)
    objs = []
    nb = nb or int(2 * math.pi * rayon / 0.3)
    bm = bmesh.new()
    for k in range(nb):
        a = 2 * math.pi * k / nb
        if ouverture and abs((math.degrees(a) - ouverture[0] + 180) % 360 - 180) < ouverture[1] / 2:
            continue
        hh = hauteur * rnd.uniform(0.88, 1.08)
        r = 0.13 * rnd.uniform(0.85, 1.1)
        geo = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=7, radius1=r, radius2=r, depth=hh)
        bmesh.ops.translate(bm, vec=(0, 0, hh / 2), verts=geo["verts"])
        pointe = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=True, segments=7, radius1=r, radius2=0.0, depth=0.42)
        bmesh.ops.translate(bm, vec=(0, 0, hh + 0.21), verts=pointe["verts"])
        vs = list(geo["verts"]) + list(pointe["verts"])
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(rnd.uniform(-0.05, 0.05), 3, "X"), verts=vs)
        bmesh.ops.translate(bm, vec=(cx + rayon * math.cos(a), cy + rayon * math.sin(a), z0), verts=vs)
    ob = C.objet_maillage(nom + "_pieux", bm, mats["pieu"])
    for f in ob.data.polygons:
        f.use_smooth = True
    objs.append(ob)
    lisse = C.cylindre(nom + "_lisse", rayon + 0.14, 0.14, (cx, cy, z0 + hauteur * 0.62), mats["bois"], segments=40, chapeau=False)
    lisse.modifiers.new("ep", "SOLIDIFY").thickness = 0.08
    objs.append(lisse)
    return objs


def piquier(nom, camp, loc, phase=0.0, lacet=-10.0, echelle=1.25, pique=(0.45, -0.1, 1.0)):
    """Piquier debout, pique dressée (figurine de figurines.py, sans écu)."""
    import figurines as F
    mats = F.matieres(camp)
    j = F.pose_homme(phase, bras_droit=(30, 70), bras_gauche=(40, 60), amplitude=3, penche=2)
    objs = []
    objs += F.corps_homme(nom, j, mats["maille"], mats["chausses"])
    tex = F.texture_surcot(camp)
    m_sur = C.mat_tissu("surcot_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    objs.append(F.surcot(nom + "_surcot", j, m_sur, longueur=0.6))
    sud = camp == "omeyyades"
    objs += F.tete(nom, j, mats, "conique" if sud else "nasal", bandeau=mats["vert"] if sud else None)
    objs += F.lance(nom, mats, j["main", -1], V(pique), longueur=3.6, recul=1.2)
    pv = C.pivot(nom + "_pv", objs, lacet, loc)
    pv.scale = (echelle, echelle, echelle)
    return objs + [pv]


# ---------------------------------------------------------------- tour de siège (unité « bélier » de la France)
def tour_de_siege(nom, camp, phase=0.0, lacet=-28.0):
    """Tour de siège sur quatre roues : plancher bas, trois étages de bois, faces avant et côté couvertes de peaux,
    pont-levis relevé à l'étage, couronnement crénelé de planches, flamme du camp, tenture sur le flanc.
    La phase fait tourner les roues et balancer un peu la tour (avance cahotante)."""
    mats = {"bois": bois("bois_siege", "#7d5c3d"), "fer": C.mat_metal("fer_siege", "#4a4540", rugosite=0.55, metal=0.8),
            "peau": C.mat_ph("peaux", "brown_mud", echelle_m=1.2, cible="#8a6a4a", contraste=1.2, bosse=0.5),
            "sombre": bois("bois_sombre", "#5a4029")}
    objs = []
    L, Lg, H = 3.0, 2.6, 5.4
    bob = 0.03 * math.sin(2 * phase)
    tilt = 0.012 * math.sin(phase)
    rr = 0.55
    for sx in (-1, 1):
        for sy in (-1, 1):
            c = V((sx * (L / 2 - 0.35), sy * (Lg / 2 + 0.1), rr))
            objs += roue(nom + "_roue%d%d" % (sx + 1, sy + 1), c, rr, mats["bois"], mats["fer"])
            for k in range(4):     # rais (tournent avec la phase)
                a = phase * 0.9 + k * math.pi / 4
                d = V((math.cos(a), 0, math.sin(a))) * rr * 0.8
                objs.append(poutre(nom + "_rai%d%d%d" % (sx + 1, sy + 1, k), c - d + V((0, sy * 0.12, 0)), c + d + V((0, sy * 0.12, 0)),
                                   0.06, mats["sombre"]))
    base = rr + 0.15 + bob
    corps = []
    corps.append(plancher(nom + "_chassis", 0, 0, base, L, Lg, mats["sombre"], ep=0.25))
    for k, z in enumerate((base + 1.6, base + 3.2)):
        corps.append(plancher(nom + "_etage%d" % k, 0, 0, z, L - 0.1, Lg - 0.1, mats["bois"]))
    for sx in (-1, 1):
        for sy in (-1, 1):
            corps.append(poutre(nom + "_poteau%d%d" % (sx + 1, sy + 1), V((sx * L / 2, sy * Lg / 2, base)),
                                V((sx * (L / 2 - 0.2), sy * (Lg / 2 - 0.2), base + H)), 0.2, mats["bois"]))
    # parois de planches (arrière, côté nord) et de peaux (avant, côté sud vu de la caméra)
    corps.append(C.boite(nom + "_paroi_av", 0.08, Lg - 0.2, H - 0.4, (L / 2 - 0.05, 0, base + 0.2), mats["peau"]))
    corps.append(C.boite(nom + "_paroi_sud", L - 0.3, 0.08, H - 0.4, (0, -Lg / 2 + 0.05, base + 0.2), mats["bois"]))
    corps.append(C.boite(nom + "_paroi_nord", L - 0.3, 0.08, H - 0.4, (0, Lg / 2 - 0.05, base + 0.2), mats["bois"]))
    corps.append(C.boite(nom + "_paroi_ar", 0.08, Lg - 0.2, H - 0.4, (-L / 2 + 0.05, 0, base + 0.2), mats["bois"]))
    for k in range(4):            # liteaux qui tiennent les peaux
        corps.append(C.boite(nom + "_liteau%d" % k, 0.1, Lg - 0.1, 0.08, (L / 2 + 0.02, 0, base + 0.8 + k * 1.2), mats["sombre"]))
    # pont-levis relevé contre la face avant, à l'étage
    corps.append(C.boite(nom + "_pont", 0.14, 1.5, 2.2, (L / 2 + 0.12, 0, base + 3.0), mats["sombre"]))
    corps.append(poutre(nom + "_chaine", V((L / 2 + 0.15, 0.6, base + 5.1)), V((L / 2 - 0.3, 0.6, base + H + 0.3)), 0.03, mats["fer"]))
    # couronnement : merlons de planches
    bm = bmesh.new()
    d = (L / 2, Lg / 2)
    coins = [(-d[0], -d[1]), (d[0], -d[1]), (d[0], d[1]), (-d[0], d[1])]
    for k in range(4):
        C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], base + H - 0.2, h=0.6, ep=0.12, pas=0.7)
    corps.append(C.objet_maillage(nom + "_crn", bm, mats["bois"]))
    corps.append(plancher(nom + "_haut", 0, 0, base + H - 0.25, L, Lg, mats["bois"]))
    # couleurs du camp : grande tenture sur le flanc sud (vu de la caméra) et flamme au sommet
    corps += C.tenture(nom + "_tenture", camp, 1.8, 3.0, loc=(-0.2, -Lg / 2 - 0.08, base + H - 0.4), rot_z=0.0, graine=3,
                       mat_tringle=mats["sombre"])
    corps += C.drapeau(nom + "_flamme", camp, 1.6, 1.5, 1.0, loc=(-L / 2 + 0.3, Lg / 2 - 0.3, base + H - 0.2), vent=1.0,
                       phase=phase, cap=-28 - lacet)
    pc = C.pivot(nom + "_corps", corps, 0.0)
    pc.rotation_euler = (0, tilt, 0)
    objs += corps + [pc]
    pv = C.pivot(nom + "_pv", objs, lacet, (0.0, 1.9, 0.0))
    return objs + [pv], pv
