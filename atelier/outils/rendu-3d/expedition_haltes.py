# -*- coding: utf-8 -*-
"""Famille « haltes » du mode Expéditions : médaillons des haltes, écussons des portes, sceaux de cire.

Images (jeu/assets/images/expedition/, manifeste images.js, cahier atelier/conception/expeditions-graphismes.md § 3.2) :
  - dix médaillons de 64 unités (fichier 128 px) : halte-escarmouche, halte-embuscade, halte-bivouac, halte-marchand,
    halte-ev-marchands, halte-ev-defi, halte-ev-mercenaires, halte-ev-incendie, halte-ev-espion, halte-ev-archives ;
    un objet par médaillon, rendu de trois quarts (45°) et posé dans le rondel commun (cadre d'or, champ de parchemin) ;
    aucune figure humaine, aucune couleur de camp (l'embuscade porte le rubrique du jeu) ;
  - neuf écussons de porte de 28 unités (56 px) : porte-<matière> × 6, porte-bourse, porte-parchemin, porte-vivres ;
  - deux sceaux de 40 unités (80 px) : sceau-reussie (cire bleue de France au lys), sceau-cedes (plomb à l'écu brisé).
Lancer : cd /home/user/Test && python3 atelier/outils/rendu-3d/expedition_haltes.py [noms d'images | medaillons | portes | sceaux]
Sans argument : tout, puis la planche atelier/captures/planche-expedition-haltes.png et la vérification du budget.
--loupe : planche de lisibilité (chaque médaillon à 56 px, et le même agrandi 3 ×) atelier/captures/planche-expedition-haltes-56.png.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expedition_commun as E  # noqa: E402
import commun as C  # noqa: E402
import campagne as Ca  # noqa: E402
import places as P  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

ECHANTILLONS = 48            # médaillons (cahier § 4) ; écussons 32
ACIER = "#9a9ea4"            # lames, fers, cerclages : gris clair, rugosité 0,4 (pas de ciel en miroir)
FER_SOMBRE = "#3a3630"       # lanterne, ferrures
VERTS_FOURRE = ("#2f4423", "#3f5a2c")
CHAUME = "#c8b46a"
TORCHIS = "#c9ab80"
CIRE_LETTRE = ("#8c2f39", "#4a1218", "#c9707a")   # cachet d'une lettre : rubrique


# ---------------------------------------------------------------- petits outils
def pivot_rot(nom, objets, rot=(0.0, 0.0, 0.0), loc=(0, 0, 0)):
    """Repère vide tourné de (rx, ry, rz) degrés (ordre XYZ) et déplacé ; les objets sans parent s'y rattachent."""
    p = C.lier(bpy.data.objects.new(nom, None))
    for o in objets:
        if o.parent is None and o is not p:
            o.parent = p
    p.rotation_euler = tuple(math.radians(a) for a in rot)
    p.location = loc
    return p


def racine(objets, k=1.0, dy=0.0, dx=0.0):
    """Repère racine qui agrandit toute la composition de k et la recule de dy (m) : l'objet doit remplir le champ du
    rondel (rayon 1,8 m) sans en sortir, et se centrer sur l'image (le haut d'un objet monte vers le nord à 45°)."""
    r = C.lier(bpy.data.objects.new("racine", None))
    for o in objets:
        if o.parent is None and o is not r:
            o.parent = r
    r.scale = (k, k, k)
    r.location = (dx, dy, 0.0)
    return objets + [r]


def orienter(ob, direction, origine):
    """Oriente un objet construit le long de +Z (pied à l'origine) pour qu'il suive « direction » depuis « origine »."""
    d = Vector(direction).normalized()
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = d.to_track_quat("Z", "Y")
    ob.location = origine
    return ob


def tige(nom, a, b, rayon, mat, segments=10, rayon_bout=None):
    """Cylindre (ou tronc de cône) entre deux points."""
    a, b = Vector(a), Vector(b)
    ob = C.cylindre(nom, rayon, (b - a).length, (0, 0, 0), mat, segments=segments, rayon_haut=rayon_bout)
    return orienter(ob, b - a, a)


def mats_armes():
    return {"lame": C.mat_metal("lame", ACIER, rugosite=0.4), "fer": C.mat_metal("fer", "#7d7a74", rugosite=0.5),
            "or": E.mat_or_poli("garde_or"), "cuir": E.mat_cuir("poignee", "#8a5a30"), "bois": E.mat_bois("hampe", "#5a3e22"),
            "sombre": C.mat_metal("fer_sombre", FER_SOMBRE, rugosite=0.62, metal=0.8)}


def epee(nom, m, loc=(0, 0, 0), penche=0.0, lacet=0.0, longueur=1.05):
    """Épée plantée dans le sol, pointe en bas : lame effilée, garde d'or, poignée de cuir, pommeau. penche : degrés
    autour de Y (le haut part vers +X si positif)."""
    w = 0.07
    bm = bmesh.new()
    pts = [(0, 0), (-w * 0.35, 0.12), (-w, 0.3), (-w, longueur), (w, longueur), (w, 0.3), (w * 0.35, 0.12)]
    bm.faces.new([bm.verts.new((x, 0.0, z)) for x, z in pts])
    lame = C.objet_maillage(nom + "_lame", bm, m["lame"])
    so = lame.modifiers.new("ep", "SOLIDIFY")
    so.thickness = 0.03
    so.offset = 0.0
    garde = C.boite(nom + "_garde", 0.42, 0.07, 0.06, (0, 0, longueur), m["or"])
    C.biseau(garde, 0.015)
    poignee = C.cylindre(nom + "_poignee", 0.05, 0.3, (0, 0, longueur + 0.06), m["cuir"], segments=12)
    pommeau = C.sphere(nom + "_pommeau", 0.085, (0, 0, longueur + 0.06 + 0.3 + 0.055), m["or"], subdiv=2)
    objets = [lame, garde, poignee, pommeau]
    p = pivot_rot(nom + "_pivot", objets, (0.0, penche, lacet), loc)
    return objets + [p]


def bouclier_rond(nom, rayon=0.7, loc=(0, 0, 0), penche=18.0, lacet=0.0, m=None, mat=None):
    """Écu rond de planches cerclé de fer, umbo d'acier, debout face à la caméra (-Y), penché en arrière de « penche »."""
    m = m or mats_armes()
    corps = E.disque(nom, rayon, 0.06, (0, 0, 0), mat or E.mat_planches(nom + "_planches"), segments=64, biseau=0.02)
    cercle = E.tore(nom + "_cercle", rayon - 0.01, 0.035, (0, 0, 0.05), m["fer"], segments=64, cotes=8)
    umbo = C.sphere(nom + "_umbo", rayon * 0.2, (0, 0, 0.04), m["lame"], subdiv=2, echelle=(1, 1, 0.55))
    objets = [corps, cercle, umbo]
    p = pivot_rot(nom + "_pivot", objets, (90.0 - penche, 0.0, lacet), (loc[0], loc[1], loc[2] + rayon * math.cos(math.radians(penche)) + 0.02))
    return objets + [p]


def lance(nom, m, a, b, rayon=0.045, fer=0.3, fanion=None):
    """Lance de a à b (le fer au bout b) : hampe de bois, fer en feuille (cône aplati)."""
    a, b = Vector(a), Vector(b)
    d = (b - a).normalized()
    hampe = tige(nom + "_hampe", a, b - d * fer, rayon, m["bois"], segments=10, rayon_bout=rayon * 0.85)
    fe = C.cone(nom + "_fer", 0.075, fer, (0, 0, 0), m["lame"], segments=8)
    orienter(fe, d, b - d * fer)
    fe.scale = (1.0, 0.4, 1.0)
    return [hampe, fe]


def hallebarde(nom, m, a, b):
    """Hallebarde : hampe, pointe, fer de hache biseauté d'un côté, crochet de l'autre."""
    a, b = Vector(a), Vector(b)
    d = (b - a).normalized()
    objets = lance(nom, m, a, b, rayon=0.045, fer=0.32)
    hache = C.boite(nom + "_hache", 0.42, 0.03, 0.48, (0, 0, 0), m["lame"], base=False)
    C.biseau(hache, 0.012, segments=2)
    orienter(hache, d, b - d * 0.55)
    hache.location = b - d * 0.55 + Vector((0.2, 0, 0))
    crochet = C.boite(nom + "_crochet", 0.16, 0.025, 0.12, (0, 0, 0), m["lame"], base=False)
    orienter(crochet, d, b - d * 0.5)
    crochet.location = b - d * 0.5 - Vector((0.12, 0, 0))
    return objets + [hache, crochet]


def fanion(nom, loc=(0, 0, 0), hauteur_mat=1.6, longueur=0.75, hauteur=0.42, teinte=E.RUBRIQUE, cap=-28.0, dechire=0.3, graine=3,
           mat_hampe=None):
    """Pennon de toile unie sur une hampe courte, qui flotte vers +X (tourné de « cap » degrés vers la caméra) ; bout
    déchiré en dents irrégulières (dechire : part de la longueur arrachée)."""
    rnd = random.Random(graine)
    objets = [C.cylindre(nom + "_hampe", 0.03, hauteur_mat, (0, 0, 0), mat_hampe or E.mat_bois(nom + "_bois", "#4a3524"), segments=8)]
    bm = bmesh.new()
    nx, nz = 12, 4
    coupes = [dechire * rnd.uniform(0.2, 1.0) for _ in range(nz + 1)]
    grille = []
    for j in range(nz + 1):
        v = j / nz
        ligne = []
        for i in range(nx + 1):
            u = i / nx
            x = min(u, 1.0 - coupes[j] * (0.3 + 0.7 * v)) * longueur
            ond = math.sin(u * 6.0 + 0.4) * 0.07 * u + math.sin(u * 11.0) * 0.025 * u
            # pointe : la hauteur diminue vers le bout (triangle allongé)
            z = hauteur_mat - hauteur + v * hauteur * (1 - 0.55 * u) + 0.55 * u * hauteur * 0.5 - u * u * 0.06
            ligne.append(bm.verts.new((x, ond, z)))
        grille.append(ligne)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((grille[j][i], grille[j][i + 1], grille[j + 1][i + 1], grille[j + 1][i]))
            f.smooth = True
    toile = C.objet_maillage(nom + "_toile", bm, E.mat_toile(nom + "_t", teinte))
    toile.modifiers.new("ep", "SOLIDIFY").thickness = 0.015
    toile.location = (0.03, 0, 0)
    toile.rotation_euler.z = math.radians(cap)
    objets.append(toile)
    p = C.pivot(nom + "_pivot", objets, 0.0, loc)
    return objets + [p]


def fourre(nom, arbres, teintes=VERTS_FOURRE):
    """Houppiers sombres (campagne.houppier) : arbres = [(x, y, rayon), ...]."""
    col = Ca.houppier(nom, teintes)
    me = col.objects[0].data
    rnd = random.Random(11)
    objets = []
    for k, (x, y, r) in enumerate(arbres):
        ob = C.lier(bpy.data.objects.new("%s_%d" % (nom, k), me))
        ob.scale = (r * rnd.uniform(0.92, 1.08), r * rnd.uniform(0.92, 1.08), r * 0.95)
        ob.location = (x, y, r * 0.5)
        ob.rotation_euler.z = rnd.uniform(0, 6.28)
        objets.append(ob)
    return objets


def tonneau(nom, loc=(0, 0, 0), rayon=0.24, hauteur=0.55, m=None):
    """Petit tonneau debout, cerclé de deux bandes de fer."""
    m = m or mats_armes()
    corps = C.cylindre(nom, rayon, hauteur, loc, E.mat_bois(nom + "_bois", "#7a5a38"), segments=20)
    c1 = E.tore(nom + "_c1", rayon + 0.005, 0.018, (loc[0], loc[1], loc[2] + hauteur * 0.22), m["fer"], segments=32, cotes=6)
    c2 = E.tore(nom + "_c2", rayon + 0.005, 0.018, (loc[0], loc[1], loc[2] + hauteur * 0.78), m["fer"], segments=32, cotes=6)
    return [corps, c1, c2]


def coffre(nom, loc=(0, 0, 0), l=0.6, p=0.42, h=0.38, lacet=0.0, m=None):
    """Coffre de bois ferré : caisse, couvercle bombé (demi-cylindre), deux bandes de fer."""
    m = m or mats_armes()
    mb = E.mat_bois(nom + "_bois", "#5c3f24")
    caisse = C.boite(nom, l, p, h * 0.7, (0, 0, 0), mb)
    C.biseau(caisse, 0.015)
    couv = C.cylindre(nom + "_couvercle", p / 2.0, l, (0, 0, 0), mb, segments=24)
    couv.rotation_euler = (0, math.pi / 2, 0)
    couv.location = (-l / 2, 0, h * 0.7)
    couv.scale = (0.6, 1.0, 1.0)          # demi-hauteur du bombé (l'axe local Z devient X après la rotation ; X local = hauteur)
    objets = [caisse, couv]
    for k, x in enumerate((-l * 0.3, l * 0.3)):
        b = C.boite("%s_b%d" % (nom, k), 0.05, p + 0.02, h * 0.7 + 0.01, (x, 0, 0), m["sombre"])
        t = E.tore("%s_t%d" % (nom, k), p / 2.0 + 0.01, 0.025, (0, 0, 0), m["sombre"], segments=24, cotes=6)
        t.rotation_euler = (0, math.pi / 2, 0)
        t.location = (x, 0, h * 0.7)
        t.scale = (0.6, 1.0, 1.0)
        objets += [b, t]
    return objets + [pivot_rot(nom + "_pivot", objets, (0, 0, lacet), loc)]


def roue(nom, rayon=0.45, m=None, mat=None):
    """Roue à huit rais (dans le plan X-Y avant le pivot), cerclée de fer ; renvoie (objets, pivot) : le pivot est à l'axe."""
    m = m or mats_armes()
    mat = mat or E.mat_bois(nom + "_bois", "#6b4a2e")
    objets = [E.tore(nom + "_jante", rayon - 0.04, 0.045, (0, 0, 0), mat, segments=32, cotes=8),
              E.tore(nom + "_fer", rayon, 0.02, (0, 0, 0), m["fer"], segments=32, cotes=6),
              C.cylindre(nom + "_moyeu", 0.09, 0.14, (0, 0, -0.07), mat, segments=12)]
    for k in range(8):
        r = C.boite("%s_r%d" % (nom, k), 0.045, 0.045, rayon - 0.05, (0, 0, 0), mat)
        r.rotation_euler = (math.pi / 2, 0, math.radians(k * 45))
        objets.append(r)
    p = pivot_rot(nom + "_pivot", objets, (0, 90, 0), (0, 0, 0))
    return objets, p


def charrette(nom, loc=(0, 0, 0), lacet=22.0):
    """Charrette à bras : caisse de planches sur deux roues, brancards posés au sol vers la caméra, chargée de deux sacs
    et d'un coffre ferré."""
    m = mats_armes()
    mp = E.mat_planches(nom + "_planches", "#8a6a44")
    mb = E.mat_bois(nom + "_bois", "#5a3e22")
    l, p, h, zc = 1.25, 0.85, 0.42, 0.42
    fond = C.boite(nom + "_fond", l, p, 0.06, (0, 0, zc), mp)
    objets = [fond]
    for k, (dx, dy, lx, ly) in enumerate(((0, p / 2 - 0.03, l, 0.06), (0, -p / 2 + 0.03, l, 0.06), (l / 2 - 0.03, 0, 0.06, p), (-l / 2 + 0.03, 0, 0.06, p))):
        objets.append(C.boite("%s_bord%d" % (nom, k), lx, ly, h, (dx, dy, zc), mp))
    essieu = C.cylindre(nom + "_essieu", 0.04, l + 0.5, (0, 0, 0), mb, segments=8)
    essieu.rotation_euler = (0, math.pi / 2, 0)
    essieu.location = (-(l + 0.5) / 2, 0, zc - 0.05)
    objets.append(essieu)
    for k, x in enumerate((-l / 2 - 0.1, l / 2 + 0.1)):
        ro, pr = roue("%s_roue%d" % (nom, k), 0.46, m)
        pr.location = (x, 0, 0.46)
        objets += ro + [pr]
    for k, x in enumerate((-p * 0.38, p * 0.38)):
        objets.append(tige("%s_brancard%d" % (nom, k), (x, -p / 2, zc + 0.03), (x, -p / 2 - 1.05, 0.06), 0.03, mb, segments=8))
    objets += E.sac(nom + "_sac1", 0.27, 0.5, (-0.3, -0.12, zc + 0.06), lacet=20)
    objets += E.sac(nom + "_sac2", 0.24, 0.46, (0.08, -0.2, zc + 0.06), lacet=-40, mat=E.mat_toile(nom + "_jute2", "#b9a176"))
    objets += coffre(nom + "_coffre", (0.28, 0.18, zc + 0.06), 0.52, 0.38, 0.36, lacet=-8, m=m)
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


def heaume(nom, loc=(0, 0, 0), rayon=0.21, m=None):
    """Heaume d'acier posé : cylindre, calotte bombée, fente de vision sombre devant (-Y)."""
    m = m or mats_armes()
    corps = C.cylindre(nom, rayon, 0.3, loc, m["lame"], segments=32)
    calotte = C.sphere(nom + "_calotte", rayon, (loc[0], loc[1], loc[2] + 0.3), m["lame"], subdiv=3, echelle=(1, 1, 0.45))
    fente = C.boite(nom + "_fente", rayon * 1.3, 0.04, 0.035, (loc[0], loc[1] - rayon + 0.01, loc[2] + 0.19), E.mat_encre(nom + "_noir"), base=False)
    return [corps, calotte, fente]


def lanterne(nom, loc=(0, 0, 0), hauteur=1.0, rayon=0.28, lacet=0.0, ouverte=True):
    """Lanterne sourde : socle et toit de fer sombre, quatre montants, flamme dedans (visible entre les montants),
    anneau de portage."""
    m = mats_armes()
    ms = m["sombre"]
    objets = [E.disque(nom + "_socle", rayon, 0.08, (0, 0, 0), ms, segments=32, biseau=0.015),
              E.disque(nom + "_plafond", rayon, 0.06, (0, 0, hauteur - 0.26), ms, segments=32, biseau=0.015),
              C.cone(nom + "_toit", rayon * 0.95, 0.2, (0, 0, hauteur - 0.2), ms, segments=32),
              E.tore(nom + "_anse", rayon * 0.38, 0.022, (0, 0, hauteur), ms, segments=32, cotes=6)]
    objets[-1].rotation_euler = (math.pi / 2, 0, 0)
    objets[-1].location = (0, 0, hauteur + rayon * 0.3)
    for k in range(4):
        a = math.radians(45 + k * 90)
        objets.append(C.boite("%s_m%d" % (nom, k), 0.06, 0.06, hauteur - 0.26, (rayon * 0.86 * math.cos(a), rayon * 0.86 * math.sin(a), 0.06), ms, rot_z=a))
    if ouverte:
        objets.append(C.cylindre(nom + "_flamme", rayon * 0.62, hauteur - 0.34, (0, 0, 0.08), E.mat_flamme(nom + "_f", "#ffb347", force=3.2, alpha=1.0), segments=24))
    else:
        objets.append(C.cylindre(nom + "_verre", rayon * 0.62, hauteur - 0.34, (0, 0, 0.08), E.mat_flamme(nom + "_f", "#c98a3a", force=1.2, alpha=1.0), segments=24))
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


def lettre(nom, loc=(0, 0, 0), l=0.9, p=0.62, lacet=18.0, cachet=True):
    """Lettre pliée (parchemin plat, pli médian), cachet de cire rubrique."""
    corps = C.boite(nom, l, p, 0.035, (0, 0, 0), E.mat_parchemin(nom + "_p", grain=0.3))
    C.biseau(corps, 0.008)
    pli = C.boite(nom + "_pli", l * 0.96, 0.012, 0.012, (0, 0, 0.03), E.mat_encre(nom + "_e", "#8a7a5c"))
    objets = [corps, pli]
    if cachet:
        objets += E.sceau_cire(nom + "_cachet", rayon=0.13, epaisseur=0.035, teintes=CIRE_LETTRE, icone=None, loc=(0.02, 0.0, 0.035), anneau=False)
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


def dague(nom, m, loc=(0, 0, 0), lacet=-35.0, longueur=0.55):
    """Dague couchée : lame, garde, poignée (le long de +X avant lacet, posée à plat)."""
    w = 0.06
    bm = bmesh.new()
    pts = [(longueur, 0), (longueur - 0.12, -w * 0.5), (0.0, -w), (0.0, w), (longueur - 0.12, w * 0.5)]
    bm.faces.new([bm.verts.new((x, y, 0.0)) for x, y in pts])
    lame = C.objet_maillage(nom + "_lame", bm, m["lame"])
    lame.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
    garde = C.boite(nom + "_garde", 0.05, 0.3, 0.05, (0, 0, 0), m["or"], base=False)
    poignee = C.cylindre(nom + "_poignee", 0.038, 0.24, (0, 0, 0), m["cuir"], segments=10)
    poignee.rotation_euler = (0, -math.pi / 2, 0)
    poignee.location = (-0.02, 0, 0)
    pommeau = C.sphere(nom + "_pommeau", 0.055, (-0.28, 0, 0), m["or"], subdiv=1)
    objets = [lame, garde, poignee, pommeau]
    return objets + [pivot_rot(nom + "_pivot", objets, (0, 0, lacet), (loc[0], loc[1], loc[2] + 0.03))]


def pupitre(nom, loc=(0, 0, 0), lacet=0.0, pente=35.0):
    """Pupitre incliné : pied, colonne, tablette penchée vers la caméra avec son rebord ; livre ouvert dessus
    (pages de parchemin, reliure de cuir), à la même pente."""
    mb = E.mat_bois(nom + "_bois", "#5c3f24")
    objets = [E.disque(nom + "_pied", 0.36, 0.07, (0, 0, 0), mb, segments=32, biseau=0.02),
              C.cylindre(nom + "_colonne", 0.09, 0.95, (0, 0, 0.07), mb, segments=16),
              C.cylindre(nom + "_bague", 0.14, 0.06, (0, 0, 0.95), mb, segments=16)]
    plateau = [C.boite(nom + "_tablette", 0.95, 0.75, 0.05, (0, 0, 0), mb, base=False),
               C.boite(nom + "_rebord", 0.95, 0.06, 0.1, (0, -0.37, -0.02), mb)]
    C.biseau(plateau[0], 0.01)
    cuir = E.mat_cuir(nom + "_cuir", "#5a2e1c")
    livre = [C.boite(nom + "_reliure", 0.8, 0.56, 0.035, (0, 0.02, 0.025), cuir)]
    mp = E.mat_parchemin(nom + "_pages", grain=0.25)
    for k, x in enumerate((-0.2, 0.2)):
        pg = C.boite("%s_pages%d" % (nom, k), 0.37, 0.52, 0.045, (x, 0.02, 0.06), mp)
        C.biseau(pg, 0.006, segments=2)
        livre.append(pg)
    livre.append(C.boite(nom + "_dos", 0.03, 0.54, 0.05, (0, 0.02, 0.06), cuir))
    menc = E.mat_encre(nom + "_enc")
    for k, y in enumerate((-0.15, -0.05, 0.05, 0.15)):       # lignes d'écriture (fins traits d'encre), sans lettres
        for x in (-0.2, 0.2):
            livre.append(C.boite("%s_l%d%d" % (nom, k, int(x > 0)), 0.26, 0.012, 0.004, (x, y + 0.02, 0.105), menc, base=False))
    haut = pivot_rot(nom + "_plateau", plateau + livre, (pente, 0, 0), (0, 0.0, 1.05))
    objets += plateau + livre + [haut]
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


def grenier(nom, loc=(0, 0, 0), lacet=-30.0):
    """Grenier de torchis sur un soubassement de pierre, toit de chaume ; flammes qui sortent du toit, fumée."""
    l, p = 1.5, 1.1
    mt = C.mat_ph(nom + "_torchis", "clay_plaster", echelle_m=2.0, cible=TORCHIS, contraste=1.2, garde=0.15, rugosite=0.9, bosse=0.35)
    socle = C.boite(nom + "_socle", l + 0.1, p + 0.1, 0.25, (0, 0, 0), E.mat_pierre(nom + "_pierre"))
    murs = C.boite(nom + "_murs", l, p, 0.85, (0, 0, 0.25), mt)
    porte = C.boite(nom + "_porte", 0.4, 0.04, 0.6, (0.25, -p / 2 - 0.01, 0.25), E.mat_bois(nom + "_bois", "#3d2a18"))
    chaume = E.mat_toile(nom + "_chaume", CHAUME)
    toit = P.toit_deux_pans(nom + "_toit", -l / 2, l / 2, -p / 2, p / 2, 1.1, 0.7, chaume, debord=0.18)
    objets = [socle, murs, porte, toit]
    mf, mf2 = E.mat_flamme(nom + "_fl", "#ff6a14", force=3.2, alpha=0.95), E.mat_flamme(nom + "_fl2", "#ffb03a", force=4.5, alpha=0.95)
    for k, (x, y, z, r, kz, m) in enumerate(((-0.3, 0.05, 1.45, 0.3, 2.6, mf), (0.3, -0.1, 1.4, 0.26, 2.3, mf), (0.0, 0.1, 1.55, 0.2, 2.9, mf2), (0.6, 0.05, 1.3, 0.18, 2.0, mf), (-0.6, 0.0, 1.3, 0.16, 1.9, mf), (0.15, -0.35, 1.25, 0.14, 2.0, mf2))):
        objets.append(C.sphere("%s_f%d" % (nom, k), r, (x, y, z), m, subdiv=2, echelle=(1, 1, kz)))
    mfu = E.mat_fumee(nom + "_fumee", "#6f675c", alpha=0.6)
    for k, (x, y, z, r) in enumerate(((0.3, 0.3, 2.2, 0.32), (0.62, 0.45, 2.45, 0.26), (-0.2, 0.4, 2.35, 0.22))):
        objets.append(C.sphere("%s_s%d" % (nom, k), r, (x, y, z), mfu, subdiv=2, echelle=(1.3, 1.0, 0.8)))
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


def etal(nom, loc=(0, 0, 0), lacet=-18.0):
    """Étal de marchand : table sur deux tréteaux, auvent rayé ocre et ivoire sur quatre perches, sac et tonneau."""
    m = mats_armes()
    mp = E.mat_planches(nom + "_planches", "#8a6a44")
    mb = E.mat_bois(nom + "_bois", "#5a3e22")
    l, p, zt = 1.6, 0.7, 0.82
    objets = [C.boite(nom + "_table", l, p, 0.06, (0, 0, zt), mp)]
    for k, x in enumerate((-l / 2 + 0.25, l / 2 - 0.25)):
        for s in (-1, 1):
            objets.append(tige("%s_tret%d%d" % (nom, k, s + 1), (x, s * 0.3, 0), (x, s * 0.08, zt), 0.03, mb, segments=8))
        objets.append(C.boite("%s_trav%d" % (nom, k), 0.05, 0.64, 0.04, (x, 0, 0.3), mb))
    rayee = P.texture_rayee("rayee-marchand", "#b5772b", "#efe6d2", n=8)
    toile = E.mat_toile(nom + "_toile", E.TOILE, rayures_png=rayee)
    objets += P.auvent(nom + "_auvent", 0.0, 0.42, 2.1, l + 0.3, 1.15, toile)
    for k, x in enumerate((-l / 2 - 0.05, l / 2 + 0.05)):
        objets.append(C.cylindre("%s_perche%d" % (nom, k), 0.045, 2.1, (x, 0.42, 0), C.mat_simple("perche", "#5a4128"), segments=6))
    objets += E.sac(nom + "_sac", 0.3, 0.58, (-0.55, -0.55, 0), lacet=15)
    objets += tonneau(nom + "_tonneau", (0.6, -0.5, 0), 0.22, 0.5, m)
    # marchandises sur la table : une pièce d'étoffe roulée et trois pommes
    rouleau = C.cylindre(nom + "_etoffe", 0.09, 0.5, (0, 0, 0), E.mat_toile(nom + "_etoffe_t", "#6b2d5c"), segments=16)
    rouleau.rotation_euler = (0, math.pi / 2, 0)
    rouleau.location = (-0.55, -0.1, zt + 0.06 + 0.09)
    objets.append(rouleau)
    mpom = C.mat_simple(nom + "_pomme", "#9b3a2a", rugosite=0.5)
    for k, (x, y) in enumerate(((0.3, -0.12), (0.45, 0.05), (0.38, 0.2))):
        objets.append(C.sphere("%s_pomme%d" % (nom, k), 0.065, (x, y, zt + 0.06 + 0.06), mpom, subdiv=2))
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


# ---------------------------------------------------------------- les dix médaillons
def halte_escarmouche():
    """Deux épées croisées plantées dans le champ, devant un écu rond de bois posé de biais. Aucune couleur de camp."""
    E.scene_vignette(rayon_sol=1.8)
    m = mats_armes()
    objets = epee("epee1", m, (-0.37, -0.3, -0.08), penche=38, lacet=6) + epee("epee2", m, (0.37, -0.25, -0.08), penche=-38, lacet=-6)
    objets += bouclier_rond("ecu", 0.62, (0.05, 0.3, 0), penche=16, lacet=-10, m=m, mat=E.mat_planches("ecu_planches", "#9a7a50"))
    objets = racine(objets, 1.5, -0.15)
    return E.rendre_rondel("halte-escarmouche", objets, echantillons=ECHANTILLONS)


def halte_embuscade():
    """Fourré sombre, deux lances couchées en travers, pennon rubrique déchiré sur une hampe courte."""
    E.scene_vignette(rayon_sol=1.8)
    m = mats_armes()
    objets = fourre("fourre", [(-0.6, 0.45, 0.62), (0.4, 0.6, 0.58), (-0.1, 0.95, 0.5)])
    objets += lance("lance1", m, (-1.1, -0.6, 0.05), (0.9, 0.3, 0.75), rayon=0.045, fer=0.34)
    objets += lance("lance2", m, (-0.9, 0.25, 0.55), (1.05, -0.65, 0.06), rayon=0.045, fer=0.34)
    objets += fanion("pennon", (0.9, -0.35, 0), hauteur_mat=1.75, longueur=0.95, hauteur=0.52, cap=-32, dechire=0.3)
    objets[-1].rotation_euler.y = math.radians(10)
    objets = racine(objets, 1.4, -0.3)
    return E.rendre_rondel("halte-embuscade", objets, echantillons=ECHANTILLONS)


def halte_bivouac():
    """Tente de toile et feu de camp devant à droite, une bûche de réserve."""
    E.scene_vignette(rayon_sol=1.8)
    objets = E.tente("tente", 2.0, 1.75, 1.5, loc=(-0.35, 0.3, 0), lacet=-28)
    objets += E.feu("feu", loc=(0.8, -0.5, 0), rayon=0.38, hauteur=0.7)
    buche = C.cylindre("buche", 0.07, 0.55, (0, 0, 0), E.mat_bois("buche_bois", "#4a3018"), segments=10)
    buche.rotation_euler = (0, math.pi / 2, math.radians(25))
    buche.location = (0.45, -1.0, 0.07)
    objets.append(buche)
    objets = racine(objets, 1.2, -0.2, 0.1)
    return E.rendre_rondel("halte-bivouac", objets, echantillons=ECHANTILLONS)


def halte_marchand():
    """Étal : table sur tréteaux, auvent rayé, sac et tonneau."""
    E.scene_vignette(rayon_sol=1.8)
    objets = etal("etal", (0.0, -0.25, 0), lacet=-16)
    objets = racine(objets, 1.2, -0.35)
    return E.rendre_rondel("halte-marchand", objets, echantillons=ECHANTILLONS)


def halte_ev_marchands():
    """Charrette à bras chargée de sacs et d'un coffre ferré."""
    E.scene_vignette(rayon_sol=1.8)
    objets = charrette("charrette", (0.05, -0.05, 0), lacet=34)
    objets = racine(objets, 1.35, 0.1)
    return E.rendre_rondel("halte-ev-marchands", objets, echantillons=ECHANTILLONS)


def halte_ev_defi():
    """Pas d'armes : poteau coiffé d'un heaume, deux lances croisées derrière, écu de bois pendu au poteau."""
    E.scene_vignette(rayon_sol=1.8)
    m = mats_armes()
    objets = [C.cylindre("poteau", 0.09, 1.75, (0, 0.05, 0), E.mat_bois("poteau_bois", "#5a3e22"), segments=12)]
    objets += heaume("heaume", (0, 0.05, 1.75), 0.26, m)
    objets += lance("lance1", m, (-0.8, 0.5, 0.0), (0.55, 0.42, 2.25), rayon=0.05, fer=0.32)
    objets += lance("lance2", m, (0.8, 0.5, 0.0), (-0.55, 0.42, 2.25), rayon=0.05, fer=0.32)
    objets += bouclier_rond("ecu", 0.5, (0.0, -0.12, 0.5), penche=6, lacet=0, m=m, mat=E.mat_planches("ecu_planches", "#9a7a50"))
    for o in objets:
        o.location.y -= 0.35 if o.parent is None else 0.0
    objets = racine(objets, 1.12, -0.4)
    return E.rendre_rondel("halte-ev-defi", objets, echantillons=ECHANTILLONS)


def halte_ev_mercenaires():
    """Écu rond de bois posé droit, deux hallebardes croisées derrière, bourse de cuir devant."""
    E.scene_vignette(rayon_sol=1.8)
    m = mats_armes()
    objets = hallebarde("hal1", m, (-0.85, 0.45, 0.0), (0.6, 0.38, 2.3)) + hallebarde("hal2", m, (0.85, 0.45, 0.0), (-0.6, 0.38, 2.3))
    objets += bouclier_rond("ecu", 0.6, (0.0, -0.05, 0), penche=14, lacet=6, m=m)
    objets += E.sac("bourse", 0.2, 0.36, (0.62, -0.62, 0), mat=E.mat_cuir("bourse_cuir", "#6a4426"), lacet=30)
    for o in objets:
        o.location.y -= 0.3 if o.parent is None else 0.0
    objets = racine(objets, 1.1, -0.4)
    return E.rendre_rondel("halte-ev-mercenaires", objets, echantillons=ECHANTILLONS)


def halte_ev_incendie():
    """Grenier au toit de chaume, flammes et fumée ; pas de personnage."""
    E.scene_vignette(rayon_sol=1.8)
    objets = grenier("grenier", (0.0, -0.3, 0), lacet=-30)
    objets = racine(objets, 1.0, -0.5)
    return E.rendre_rondel("halte-ev-incendie", objets, echantillons=ECHANTILLONS)


def halte_ev_espion():
    """Lanterne sourde, lettre au cachet de cire, dague posée en travers."""
    E.scene_vignette(rayon_sol=1.8)
    m = mats_armes()
    objets = lanterne("lanterne", (-0.55, 0.15, 0), hauteur=1.05, rayon=0.27, lacet=20)
    objets += lettre("lettre", (0.5, -0.35, 0), 0.9, 0.62, lacet=16)
    objets += dague("dague", m, (0.66, -0.45, 0.035), lacet=-40, longueur=0.78)
    objets = racine(objets, 1.5, -0.1)
    return E.rendre_rondel("halte-ev-espion", objets, echantillons=ECHANTILLONS)


def halte_ev_archives():
    """Pupitre incliné, livre ouvert, deux rouleaux au pied, encrier et plume."""
    E.scene_vignette(rayon_sol=1.8)
    objets = pupitre("pupitre", (-0.25, 0.1, 0), lacet=-12)
    objets += E.rouleau("rouleau1", 0.7, 0.1, (0.6, -0.5, 0), lacet=15, ruban=E.RUBRIQUE)
    objets += E.rouleau("rouleau2", 0.62, 0.09, (0.72, -0.15, 0), lacet=-20, ruban=None)
    encrier = C.cylindre("encrier", 0.1, 0.14, (-0.95, -0.55, 0), E.mat_encre("encrier_mat", "#1e1812"), segments=16)
    plume = C.cone("plume", 0.03, 0.42, (0, 0, 0), E.mat_parchemin("plume_mat", "#f1e8d0", grain=0.1), segments=8)
    orienter(plume, (0.35, -0.2, 1.0), (-0.95, -0.55, 0.12))
    plume.scale = (1, 0.4, 1)
    objets += [encrier, plume]
    objets = racine(objets, 1.4, -0.3)
    return E.rendre_rondel("halte-ev-archives", objets, echantillons=ECHANTILLONS)


MEDAILLONS = {
    "halte-escarmouche": halte_escarmouche, "halte-embuscade": halte_embuscade, "halte-bivouac": halte_bivouac,
    "halte-marchand": halte_marchand, "halte-ev-marchands": halte_ev_marchands, "halte-ev-defi": halte_ev_defi,
    "halte-ev-mercenaires": halte_ev_mercenaires, "halte-ev-incendie": halte_ev_incendie, "halte-ev-espion": halte_ev_espion,
    "halte-ev-archives": halte_ev_archives,
}

# ---------------------------------------------------------------- écussons des portes
# écusson du SVG (ecussonPorte) : 22 × 24 unités, centre à (x, y + 1) ; l'image fait 28 × 28, ancre (14, 13)
PORTES = {
    "porte-histoire": (E.MATIERES["histoire"], "chroniqueur"),
    "porte-geographie": (E.MATIERES["geographie"], "routes"),
    "porte-svt": (E.MATIERES["svt"], "remedes"),
    "porte-physique": (E.MATIERES["physique"], "alambics"),
    "porte-litterature": (E.MATIERES["litterature"], "parchemin-plume"),
    "porte-anglais": (E.MATIERES["anglais"], "alliances"),
    "porte-bourse": (E.PORTES["bourse"], "tresor"),
    "porte-parchemin": (E.PORTES["parchemin"], "parchemins"),
    "porte-vivres": (E.PORTES["vivres"], "recolte"),
}
PORTE_LARG, PORTE_HAUT, PORTE_PENCHE = 1.85, 2.1, 14.0
PORTE_ANCRE = (14.0, 25.4)          # pied de l'écusson dans l'image (unités) : l'écu est centré sur la toile
PORTE_AY = 13                       # ancre du manifeste : le centre de l'image tombe sur (x, y + 1), le centre de l'écu du SVG


def porte(nom):
    teinte, icone = PORTES[nom]
    E.scene_vignette(E.PORTE, inclinaison=55, px_par_m=11, ancre=PORTE_ANCRE, rayon_sol=None)
    objets = E.ecusson("porte", PORTE_LARG, PORTE_HAUT, teinte, epaisseur=0.09, penche=PORTE_PENCHE, lisere=E.ENCRE)
    objets[1].location.z -= 0.04 * PORTE_HAUT           # liseré d'encre d'épaisseur égale en haut et sur les flancs
    a = math.radians(PORTE_PENCHE)
    zc, av = 0.62, 0.07                                  # pied de l'emblème sur l'écu (hauteur le long de l'écu), avancée
    loc = (0.0, zc * math.sin(a) - av * math.cos(a), zc * math.cos(a) + av * math.sin(a))
    objets.append(E.plaque_icone("embleme", icone, 1.15, "#fff8e4", epaisseur=0.03, loc=loc, penche=PORTE_PENCHE))
    img = E.rendre_vignette(nom, objets, E.PORTE, echantillons=32, contour=0.5, ombre=False)
    return img


# ---------------------------------------------------------------- sceaux
SCEAUX = {"sceau-reussie": (E.CIRE_JOUEUR, "lys"), "sceau-cedes": (E.CIRE_PLOMB, "ecu-brise")}


def sceau(nom):
    teintes, icone = SCEAUX[nom]
    E.scene_vignette(E.SCEAU, inclinaison=70, rayon_sol=None)
    objets = E.sceau_cire("sceau", rayon=E.D_SCEAU / 2.0 / E.PX_PAR_M, teintes=teintes, icone=icone, graine=5 if icone == "lys" else 9)
    return E.rendre_vignette(nom, objets, E.SCEAU, echantillons=ECHANTILLONS, contour=0.3, ombre=False)


# ---------------------------------------------------------------- planche de lisibilité à 56 px
def loupe():
    """Chaque image de la famille à sa taille d'écran courante (médaillon 56 px, écusson 22, sceau 32) et agrandie 3 ×."""
    man = E.lire_manifeste()
    ids = [k for k in E.catalogue("haltes") if k in man]
    tailles = {"halte": 56, "porte": 22, "sceau": 32}
    police, petite = E._police(14), E._police(11)
    cw, ch = 56 * 3 + 56 + 40, 56 * 3 + 40
    cols = 4
    lignes = (len(ids) + cols - 1) // cols
    can = Image.new("RGB", (16 + cols * (cw + 12), 16 + lignes * (ch + 12) + 30), C.rgb8(E.PARCHEMIN))
    d = ImageDraw.Draw(can)
    for n, k in enumerate(ids):
        e = man[k]
        im = Image.open(os.path.join(C.RACINE, "jeu", e["f"])).convert("RGBA")
        t = tailles[k.split("-")[0]]
        t = int(round(t * im.size[0] / (e["w"] * 2)))        # taille d'écran de l'image entière (les sceaux font 40 pour 34 de cire)
        petit = im.convert("RGBa").resize((t, t), Image.LANCZOS).convert("RGBA")
        zoom = petit.resize((t * 3, t * 3), Image.NEAREST)
        x, y = 16 + (n % cols) * (cw + 12), 16 + (n // cols) * (ch + 12)
        d.rectangle((x, y, x + cw, y + ch), outline=(170, 150, 110))
        can.paste(petit, (x + 8, y + 8), petit)
        can.paste(zoom, (x + 8 + 56 + 16, y + 8), zoom)
        d.text((x + 8, y + ch - 20), "%s : %d px, × 3" % (k, t), fill=C.rgb8(E.ENCRE), font=petite)
    d.text((16, can.size[1] - 24), "Famille « haltes » à la taille d'écran (1366 × 768) et agrandie 3 fois, sans lissage", fill=C.rgb8(E.RUBRIQUE), font=police)
    chemin = os.path.join(E.CAPTURES, "planche-expedition-haltes-56.png")
    can.save(chemin)
    E.journal("loupe : " + os.path.relpath(chemin, C.RACINE))
    return chemin


# ---------------------------------------------------------------- lancement
def main(args):
    quoi = [a for a in args if not a.startswith("--")]
    tout = not quoi
    for nom, f in MEDAILLONS.items():
        if tout or "medaillons" in quoi or nom in quoi or nom.replace("halte-", "") in quoi:
            E.sauver(nom, f())
    for nom in PORTES:
        if tout or "portes" in quoi or nom in quoi:
            E.sauver(nom, porte(nom), ay=PORTE_AY)
    for nom in SCEAUX:
        if tout or "sceaux" in quoi or nom in quoi:
            E.sauver(nom, sceau(nom))
    if "--sans-planche" not in args:
        E.planche("haltes")
    if "--loupe" in args or tout:
        loupe()
    E.verifier_budget()


if __name__ == "__main__":
    main(sys.argv[1:])
