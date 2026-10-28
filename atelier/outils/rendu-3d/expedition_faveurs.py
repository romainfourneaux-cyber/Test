# -*- coding: utf-8 -*-
"""Famille « faveurs » du mode Expéditions : médaillons des six faveurs (deux rangs) et les six couches de l'Armorial.

Images (jeu/assets/images/expedition/, manifeste images.js, cahier atelier/conception/expeditions-graphismes.md § 3.3) :
  - douze médaillons de 64 unités (fichier 128 px) : faveur-<id>-1 (cerclage de bronze, faveur commune) et faveur-<id>-2
    (cerclage d'argent, faveur rare) pour annales, eclaireurs, simples, engrenages, ballade, lettres. L'objet est rendu
    une seule fois (sprite et ombre portée), puis posé dans les deux cadres ; le champ du rondel est teinté à 12 % de la
    matière du conseiller (champ_teinte) et un objet au moins porte franchement cette teinte, lisible à 34 px ;
  - six couches de l'Armorial de 100 × 110 unités (fichier 200 × 220) : armorial-ecu (l'écu seul : champ de parchemin,
    bordure d'or, liseré d'encre, traits des quartiers) et cinq émaux armorial-<quartier> (une plaque de couleur seule,
    sur fond transparent, même caméra) que le jeu superpose à l'écu avec l'opacité du rang.
  Les cinq icônes de la compagnie (compagnie-*) sont du même catalogue : expedition_haltes.py les a rendues ; ce script
  ne les refait que sur demande (« compagnie »), en appelant la fonction de ce module-là.
Lancer : cd /home/user/Test && python3 atelier/outils/rendu-3d/expedition_faveurs.py [noms d'images | faveurs | armorial | compagnie]
Sans argument : tout, puis la planche atelier/captures/planche-expedition-faveurs.png, la loupe
planche-expedition-faveurs-56.png (chaque médaillon à 34 et 56 px, l'écu composé à 72 et 150 px) et la vérification du budget.
Note sur l'écu : les deux quartiers du bas du SVG (QUARTIERS_ECU de ecran-expedition.js) finissent tous deux à x = 70 ;
l'écu rendu est symétrique (les deux demi-écus se rejoignent à x = 50), conforme au cahier (« demi-écus bas gauche et bas droit »).
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expedition_commun as E  # noqa: E402
import commun as C  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

ECHANTILLONS = 48                 # médaillons et écu (cahier § 4)
ACIER_BLEU = "#3f6690"            # fer bleui des Engrenages (la teinte de la physique)
LAITON = "#c9a24a"
CIRE_SARCELLE = ("#2a7470", "#153c3a", "#7fb8b3")       # cachet des Lettres de crédit : la teinte de l'anglais
PARCHEMIN_OBJET = "#dccba0"        # parchemin des objets (carte, lettre, rouleau) : un peu plus sombre que le champ

# faveur : (matière, fonction de construction)
MATIERE_FAVEUR = {"annales": "histoire", "eclaireurs": "geographie", "simples": "svt", "engrenages": "physique",
                  "ballade": "litterature", "lettres": "anglais"}


# ---------------------------------------------------------------- petits outils (les mêmes que dans expedition_haltes.py)
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
    """Repère racine qui agrandit toute la composition de k et la déplace de (dx, dy) m : l'objet doit remplir le champ
    du rondel (rayon 1,8 m) sans en sortir, et se centrer sur l'image (un objet haut monte vers le nord à 45°)."""
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


def arc_tore(nom, rayon, s0, s1, a0, a1, mat, segments=40, cotes=12, loc=(0, 0, 0)):
    """Portion de tore à plat (autour de Z) de l'angle a0 à a1 (degrés), section qui va de s0 à s1 (cor, anse de panier),
    bouts fermés."""
    bm = bmesh.new()
    anneaux = []
    for i in range(segments + 1):
        t = i / segments
        a = math.radians(a0 + (a1 - a0) * t)
        s = s0 + (s1 - s0) * t
        ca, sa = math.cos(a), math.sin(a)
        ring = []
        for j in range(cotes):
            b = 2 * math.pi * j / cotes
            r = rayon + s * math.cos(b)
            ring.append(bm.verts.new((r * ca, r * sa, s * math.sin(b))))
        anneaux.append(ring)
    for i in range(segments):
        r0, r1 = anneaux[i], anneaux[i + 1]
        for j in range(cotes):
            f = bm.faces.new((r0[j], r1[j], r1[(j + 1) % cotes], r0[(j + 1) % cotes]))
            f.smooth = True
    bm.faces.new(anneaux[0][::-1])
    bm.faces.new(anneaux[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = C.objet_maillage(nom, bm, mat, lisse=True)
    ob.location = loc
    return ob


def prisme(nom, pts, y0, ep, mat, biseau=0.0):
    """Plaque plane debout dans le plan X-Z (points (x, z)), face avant en y0 (vers la caméra, -Y), épaisseur ep vers +Y."""
    bm = bmesh.new()
    avant = [bm.verts.new((x, y0, z)) for x, z in pts]
    arriere = [bm.verts.new((x, y0 + ep, z)) for x, z in pts]
    bm.faces.new(avant)
    bm.faces.new(arriere[::-1])
    n = len(pts)
    for i in range(n):
        bm.faces.new((avant[i], avant[(i + 1) % n], arriere[(i + 1) % n], arriere[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = C.objet_maillage(nom, bm, mat)
    if biseau > 0:
        C.biseau(ob, biseau, segments=2)
    return ob


def decaler_contour(pts, d):
    """Polygone convexe décalé vers l'intérieur de d (négatif : vers l'extérieur), sommets déplacés le long de la bissectrice."""
    n = len(pts)
    aire = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
    s = 1.0 if aire > 0 else -1.0

    def normale(a, b):
        dx, dy = b[0] - a[0], b[1] - a[1]
        l = math.hypot(dx, dy) or 1.0
        return (-dy / l * s, dx / l * s)
    out = []
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        n1, n2 = normale(p0, p1), normale(p1, p2)
        mx, my = n1[0] + n2[0], n1[1] + n2[1]
        ml = math.hypot(mx, my) or 1.0
        k = d / max(0.3, ml / 2.0)
        out.append((p1[0] + mx / ml * k, p1[1] + my / ml * k))
    return out


def couper(pts, f):
    """Garde la part du polygone où f(x, z) >= 0 (f affine) : découpe de Sutherland-Hodgman par un demi-plan."""
    out = []
    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        fa, fb = f(*a), f(*b)
        if fa >= 0:
            out.append(a)
        if (fa >= 0) != (fb >= 0):
            t = fa / (fa - fb)
            out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return out


def bande_xz(p, q, largeur):
    """Quadrilatère fin le long du segment p -> q (points (x, z)) : trait d'encre d'un écu."""
    dx, dz = q[0] - p[0], q[1] - p[1]
    l = math.hypot(dx, dz) or 1.0
    nx, nz = -dz / l * largeur / 2, dx / l * largeur / 2
    return [(p[0] + nx, p[1] + nz), (q[0] + nx, q[1] + nz), (q[0] - nx, q[1] - nz), (p[0] - nx, p[1] - nz)]


def centrer(img, seuil=8):
    """Recentre le contenu (boîte de l'alpha) au milieu de l'image, au pixel près."""
    a = np.array(img)[..., 3]
    ys, xs = np.nonzero(a > seuil)
    if not len(xs):
        return img
    dx = int(round((img.size[0] - 1) / 2.0 - (xs.min() + xs.max()) / 2.0))
    dy = int(round((img.size[1] - 1) / 2.0 - (ys.min() + ys.max()) / 2.0))
    if dx == 0 and dy == 0:
        return img
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (dx, dy))
    return out


def trait(nom, longueur, loc, lacet=0.0, largeur=0.014, epaisseur=0.005, mat=None):
    """Petit trait d'encre couché (ligne d'écriture, route d'une carte) : boîte fine le long de X avant le lacet."""
    return C.boite(nom, longueur, largeur, epaisseur, loc, mat or E.mat_encre(nom + "_e"), rot_z=math.radians(lacet))


def polyligne(nom, pts, z, largeur=0.03, mat=None):
    """Suite de traits d'encre posés à la hauteur z entre des points (x, y) : la route tracée sur une carte."""
    m = mat or E.mat_encre(nom + "_e")
    objets = []
    for k in range(len(pts) - 1):
        (ax, ay), (bx, by) = pts[k], pts[k + 1]
        l = math.hypot(bx - ax, by - ay)
        objets.append(trait("%s_%d" % (nom, k), l + largeur, ((ax + bx) / 2, (ay + by) / 2, z), math.degrees(math.atan2(by - ay, bx - ax)), largeur, 0.006, m))
    return objets


# ---------------------------------------------------------------- objets des faveurs
def coussin(nom, l, p, h_avant, pente, mat, marge=0.1):
    """Coussin en coin (dessus incliné de « pente » degrés vers la caméra) sur lequel un livre se lit : prisme à six sommets."""
    t = math.tan(math.radians(pente))
    w, d = l / 2 + marge, p / 2 + marge
    bm = bmesh.new()
    bas = [bm.verts.new(v) for v in ((-w, -d, 0), (w, -d, 0), (w, d, 0), (-w, d, 0))]
    haut = [bm.verts.new(v) for v in ((-w, -d, h_avant), (w, -d, h_avant), (w, d, h_avant + 2 * d * t), (-w, d, h_avant + 2 * d * t))]
    bm.faces.new(bas[::-1])
    bm.faces.new(haut)
    for i in range(4):
        bm.faces.new((bas[i], bas[(i + 1) % 4], haut[(i + 1) % 4], haut[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = C.objet_maillage(nom, bm, mat)
    C.biseau(ob, 0.05, segments=3)
    return ob


def livre_ouvert(nom, loc=(0, 0, 0), lacet=0.0, pente=18.0, l=1.4, p=0.95, cuir="#4a2342", teinte=E.MATIERES["histoire"]):
    """Livre d'annales ouvert sur un coussin pourpre en coin (relevé vers la caméra) : reliure de cuir, deux blocs de
    pages en V léger, lignes d'écriture sans lettres, signet de la teinte de la matière qui pend par-devant."""
    mc = E.mat_cuir(nom + "_cuir", cuir)
    mp = E.mat_parchemin(nom + "_pages", "#f1e6c8", grain=0.25)
    menc = E.mat_encre(nom + "_enc")
    couv = C.boite(nom + "_couv", l, p, 0.05, (0, 0, 0), mc)
    C.biseau(couv, 0.012)
    objets = [couv, C.boite(nom + "_dos", 0.05, p - 0.02, 0.06, (0, 0, 0.05), E.mat_cuir(nom + "_dos_c", "#2e1529"))]
    z_pages = 0.05 + 0.05 + 0.02
    for k, s in enumerate((-1, 1)):
        pg = C.boite("%s_pg%d" % (nom, k), l / 2 - 0.06, p - 0.08, 0.1, (0, 0, 0), mp, base=False)
        C.biseau(pg, 0.01, segments=2)
        pg.rotation_euler.y = math.radians(-6 * s)
        pg.location = (s * (l / 4 + 0.01), 0.0, z_pages)
        objets.append(pg)
        for j, y in enumerate((-0.27, -0.16, -0.05, 0.06, 0.17, 0.28)):
            ln = trait("%s_l%d%d" % (nom, k, j), (l / 2 - 0.06) * 0.68, (0, 0, 0), 0.0, 0.016, 0.004, menc)
            ln.rotation_euler.y = math.radians(-6 * s)
            ln.location = (s * (l / 4 + 0.01), y, z_pages + 0.05 + 0.004)
            objets.append(ln)
    ms = E.mat_toile(nom + "_signet", teinte)
    x_sig = l / 4 + 0.1
    objets.append(C.boite(nom + "_sig1", 0.13, p / 2 + 0.02, 0.014, (x_sig, -p / 4 + 0.02, z_pages + 0.05 + 0.012), ms))
    objets.append(C.boite(nom + "_sig2", 0.13, 0.014, z_pages + 0.07, (x_sig, -p / 2 - 0.012, 0.0), ms))
    h_coussin = 0.12
    pv = pivot_rot(nom + "_pivot", objets, (pente, 0.0, 0.0), (0, 0, h_coussin + math.sin(math.radians(pente)) * p / 2))
    cous = coussin(nom + "_coussin", l, p, h_coussin - 0.02, pente, E.mat_toile(nom + "_velours", teinte))
    cp = math.cos(math.radians(pente))
    queue = C.boite(nom + "_sig3", 0.13, 0.36, 0.014, (x_sig + 0.03, -p / 2 * cp - 0.2, 0.0), ms, rot_z=math.radians(10))
    objets += [pv, cous, queue]
    return objets + [C.pivot(nom + "_racine", [pv, cous, queue], lacet, loc)]


def encrier_plume(nom, loc=(0, 0, 0), direction=(0.5, -0.25, 1.0), longueur=0.95):
    """Encrier de plomb et plume d'oie plantée dedans (fût étroit en bas, barbes larges en haut, aplaties)."""
    objets = [C.cylindre(nom, 0.13, 0.18, loc, E.mat_plomb(nom + "_plomb"), segments=18),
              C.cylindre(nom + "_encre", 0.1, 0.01, (loc[0], loc[1], loc[2] + 0.18), E.mat_encre(nom + "_e", "#1e1812"), segments=18)]
    d = Vector(direction).normalized()
    haut = Vector(loc) + Vector((0, 0, 0.1)) + d * longueur
    mb = C.mat_simple(nom + "_barbes", "#a99a7c", rugosite=0.8, speculaire=0.3)
    plume = tige(nom + "_plume", (loc[0], loc[1], loc[2] + 0.1), haut, 0.014, mb, segments=10, rayon_bout=0.1)
    plume.scale = (1.0, 0.25, 1.0)
    pointe = C.cone(nom + "_pointe", 0.1, 0.2, (0, 0, 0), mb, segments=10)
    orienter(pointe, d, haut)
    pointe.scale = (1.0, 0.25, 1.0)
    return objets + [plume, pointe]


def carte_deroulee(nom, loc=(0, 0, 0), lacet=0.0, l=1.8, p=1.2, teinte="#c9b283"):
    """Carte déroulée à plat : feuille de parchemin (plus sombre que le champ) entre deux demi-rouleaux, une route à
    l'encre, deux bourgs (disques) et trois monts (petits cônes d'encre)."""
    mp = E.mat_parchemin(nom + "_p", teinte, grain=0.4)
    feuille = C.boite(nom, l, p, 0.02, (0, 0, 0), mp)
    objets = [feuille]
    for k, x in enumerate((-l / 2, l / 2)):
        rl = C.cylindre("%s_rl%d" % (nom, k), 0.08, p, (0, 0, 0), mp, segments=20)
        rl.rotation_euler = (math.pi / 2, 0, 0)
        rl.location = (x, p / 2, 0.08)
        objets.append(rl)
    menc = E.mat_encre(nom + "_enc")
    objets += polyligne(nom + "_route", [(-0.68, -0.4), (-0.32, -0.12), (0.05, -0.22), (0.32, 0.2), (0.7, 0.34)], 0.024, 0.05, menc)
    for k, (x, y) in enumerate(((-0.68, -0.4), (0.32, 0.2))):
        objets.append(E.disque("%s_b%d" % (nom, k), 0.09, 0.012, (x, y, 0.02), menc, segments=16))
    for k, (x, y) in enumerate(((-0.25, 0.3), (-0.05, 0.38), (0.15, 0.28))):
        objets.append(C.cone("%s_m%d" % (nom, k), 0.08, 0.05, (x, y, 0.02), menc, segments=8))
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


def compas(nom, loc=(0, 0, 0), lacet=0.0, ecart=0.22, hauteur=0.48):
    """Compas de laiton ouvert, debout sur ses deux pointes."""
    m = E.mat_or_poli(nom + "_laiton")
    objets = [C.sphere(nom + "_tete", 0.07, (0, 0, hauteur), m, subdiv=2)]
    for k, s in enumerate((-1, 1)):
        objets.append(tige("%s_b%d" % (nom, k), (0, 0, hauteur - 0.02), (s * ecart, 0.0, 0.0), 0.036, m, segments=10, rayon_bout=0.01))
    objets.append(E.tore(nom + "_anneau", 0.06, 0.015, (0, 0, hauteur + 0.09), m, segments=20, cotes=6))
    objets[-1].rotation_euler = (math.pi / 2, 0, 0)
    return objets + [pivot_rot(nom + "_pivot", objets, (0, 0, lacet), loc)]


def cor(nom, loc=(0, 0, 0), rot=(0, 0, 0), rayon=0.34, teinte=E.MATIERES["geographie"]):
    """Cor de chasse ocre : corne courbe qui s'évase (portion de tore à section décroissante), pavillon et embouchure de laiton."""
    mc = C.mat_simple(nom + "_corne", teinte, rugosite=0.45, speculaire=0.5, bosse=0.15, echelle_bosse=60.0)
    ml = E.mat_or_poli(nom + "_laiton")
    a0, a1 = -15.0, 225.0
    s0 = rayon * 0.34
    objets = [arc_tore(nom, rayon, s0, s0 * 0.3, a0, a1, mc, segments=44, cotes=14)]
    for a, r, s in ((a0, s0 * 1.05, 0.02), (a1, s0 * 0.36, 0.014)):
        t = E.tore("%s_v%d" % (nom, int(a)), r, s, (rayon * math.cos(math.radians(a)), rayon * math.sin(math.radians(a)), 0), ml, segments=24, cotes=6)
        t.rotation_euler = (math.pi / 2, 0, math.radians(a))
        objets.append(t)
    return objets + [pivot_rot(nom + "_pivot", objets, rot, loc)]


def panier(nom, loc=(0, 0, 0), rayon=0.5, hauteur=0.4, graine=4):
    """Panier d'osier bas, cerclé, à anse, débordant de brins verts ; quelques fleurs pâles sur des tiges."""
    rnd = random.Random(graine)
    mo = C.mat_simple(nom + "_osier", "#b08a4f", rugosite=0.9, speculaire=0.3, bosse=0.5, echelle_bosse=70.0)
    mb = C.mat_simple(nom + "_brun", "#6f4f2a", rugosite=0.85)
    corps = C.cylindre(nom, rayon, hauteur, (0, 0, 0), mo, segments=36, rayon_haut=rayon * 1.08)
    objets = [corps]
    for k, zr in enumerate((0.08, 0.5, 0.95)):
        objets.append(E.tore("%s_c%d" % (nom, k), rayon + (rayon * 0.08) * zr + 0.005, 0.022, (0, 0, hauteur * zr), mb, segments=40, cotes=6))
    anse = arc_tore(nom + "_anse", rayon * 1.02, 0.03, 0.03, 0.0, 180.0, mb, segments=30, cotes=8)
    anse.rotation_euler = (math.pi / 2, 0, math.radians(-25))
    anse.location = (0, 0, hauteur * 0.95)
    objets.append(anse)
    verts = (C.mat_simple(nom + "_v1", "#4f6b32", rugosite=0.85), C.mat_simple(nom + "_v2", "#61793a", rugosite=0.85),
             C.mat_simple(nom + "_v3", "#3d5626", rugosite=0.85))
    for k in range(26):
        a, r = rnd.uniform(0, 6.283), rnd.uniform(0, rayon * 0.95) ** 0.8 * rayon ** 0.2
        z = hauteur + 0.08 + 0.28 * (1 - (r / rayon) ** 2) + rnd.uniform(-0.04, 0.06)
        objets.append(C.sphere("%s_h%d" % (nom, k), rnd.uniform(0.09, 0.16), (r * math.cos(a), r * math.sin(a), z), verts[k % 3], subdiv=2,
                               echelle=(1.0, 1.0, rnd.uniform(0.7, 1.0))))
    for k in range(9):
        a = rnd.uniform(0, 6.283)
        r = rnd.uniform(rayon * 0.3, rayon * 0.9)
        base = Vector((r * math.cos(a), r * math.sin(a), hauteur + 0.2))
        d = Vector((math.cos(a) * 0.5 + rnd.uniform(-0.3, 0.3), math.sin(a) * 0.5 + rnd.uniform(-0.3, 0.3), 1.0))
        f = C.cone("%s_f%d" % (nom, k), 0.055, rnd.uniform(0.32, 0.46), (0, 0, 0), verts[(k + 1) % 3], segments=8)
        orienter(f, d, base)
        f.scale = (1.0, 0.45, 1.0)
        objets.append(f)
    mt = C.mat_simple(nom + "_tige", "#5a7a34", rugosite=0.8)
    mfl = C.mat_simple(nom + "_fleur", "#d9c98a", rugosite=0.7)
    for k in range(4):
        a = rnd.uniform(0, 6.283)
        r = rnd.uniform(0.0, rayon * 0.6)
        base = Vector((r * math.cos(a), r * math.sin(a), hauteur + 0.2))
        haut = base + Vector((rnd.uniform(-0.15, 0.15), rnd.uniform(-0.1, 0.1), rnd.uniform(0.45, 0.6)))
        objets.append(tige("%s_t%d" % (nom, k), base, haut, 0.014, mt, segments=6))
        objets.append(C.sphere("%s_fl%d" % (nom, k), 0.05, haut, mfl, subdiv=1, echelle=(1.3, 1.3, 0.7)))
    return objets + [C.pivot(nom + "_pivot", objets, 0.0, loc)]


def fiole(nom, loc=(0, 0, 0), rayon=0.12, hauteur=0.36):
    """Fiole de verre bouchée de liège : verre vert d'eau, satiné ; col étroit."""
    mv = C.mat_simple(nom + "_verre", "#7fa58a", rugosite=0.18, speculaire=0.8)
    objets = [C.cylindre(nom, rayon, hauteur, loc, mv, segments=24),
              C.cylindre(nom + "_epaule", rayon, 0.07, (loc[0], loc[1], loc[2] + hauteur), mv, segments=24, rayon_haut=rayon * 0.45),
              C.cylindre(nom + "_col", rayon * 0.45, 0.1, (loc[0], loc[1], loc[2] + hauteur + 0.07), mv, segments=16),
              C.cylindre(nom + "_bouchon", rayon * 0.4, 0.07, (loc[0], loc[1], loc[2] + hauteur + 0.16), C.mat_simple(nom + "_liege", "#8a6a3a", rugosite=0.9), segments=12, rayon_haut=rayon * 0.5)]
    C.biseau(objets[0], 0.02, segments=2)
    return objets


def engrenage(nom, rayon=0.6, dents=12, epaisseur=0.1, mat=None, mat_moyeu=None, phase=0.0):
    """Roue dentée à plat (axe Z) : disque, dents en boîtes autour, moyeu ; renvoie (objets, pivot au centre)."""
    mat = mat or E.mat_planches(nom + "_bois", "#7a5a3a")
    disque = E.disque(nom, rayon, epaisseur, (0, 0, -epaisseur / 2), mat, segments=48, biseau=0.015)
    objets = [disque]
    pas = 2 * math.pi * rayon / dents
    prof = min(0.16, pas * 0.55)
    for k in range(dents):
        a = 2 * math.pi * k / dents + math.radians(phase)
        d = C.boite("%s_d%d" % (nom, k), prof, pas * 0.46, epaisseur, (0, 0, 0), mat, base=False)
        C.biseau(d, 0.012)
        d.rotation_euler.z = a
        d.location = ((rayon + prof / 2 - 0.01) * math.cos(a), (rayon + prof / 2 - 0.01) * math.sin(a), 0)
        objets.append(d)
    moyeu = C.cylindre(nom + "_moyeu", rayon * 0.22, epaisseur + 0.06, (0, 0, -epaisseur / 2 - 0.03), mat_moyeu or C.mat_metal(nom + "_fer", "#55585e", rugosite=0.5), segments=20)
    objets.append(moyeu)
    for k in range(4):
        a = math.radians(45 + 90 * k)
        tr = C.boite("%s_t%d" % (nom, k), rayon * 0.3, rayon * 0.2, epaisseur + 0.004, (0, 0, 0), E.mat_encre(nom + "_trou", "#1a140e"), base=False)
        tr.rotation_euler.z = a
        tr.location = (rayon * 0.58 * math.cos(a), rayon * 0.58 * math.sin(a), 0)
        objets.append(tr)
    p = pivot_rot(nom + "_pivot", objets, (0, 0, 0), (0, 0, 0))
    return objets, p


def cle(nom, loc=(0, 0, 0), lacet=0.0, longueur=0.72):
    """Clé à écrou (à fourche) couchée, en fer bleui."""
    m = C.mat_metal(nom + "_fer", E.MATIERES["physique"], rugosite=0.42, metal=0.9)
    objets = [C.boite(nom, longueur * 0.68, 0.085, 0.035, (0, 0, 0), m)]
    C.biseau(objets[0], 0.01)
    objets.append(C.cylindre(nom + "_oeil", 0.09, 0.035, (-longueur * 0.34, 0, 0), m, segments=20))
    x = longueur * 0.34
    objets.append(C.boite(nom + "_tete", 0.1, 0.24, 0.035, (x, 0, 0), m))
    for s in (-1, 1):
        objets.append(C.boite("%s_f%d" % (nom, s + 1), 0.14, 0.07, 0.035, (x + 0.1, s * 0.085, 0), m))
    return objets + [pivot_rot(nom + "_pivot", objets, (0, 0, lacet), loc)]


def luth(nom, loc=(0, 0, 0), rot=(0, 0, 0), echelle=1.0):
    """Luth : caisse bombée de bois roux (la teinte de la littérature), table de bois miel à rosace, manche, chevillier
    replié, cinq cordes claires ; construit à plat (table vers +Z, manche vers +Y), puis tourné par rot (degrés)."""
    mr = E.mat_bois(nom + "_caisse", E.MATIERES["litterature"], echelle=0.6)
    mt = C.mat_simple(nom + "_table", "#b07c3a", rugosite=0.5, speculaire=0.5)
    menc = E.mat_encre(nom + "_enc", "#2a1c12")
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
    for v in bm.verts:
        x, y, z = v.co
        y2 = y * 0.95 - 0.12 * (1 - y) * 0.5          # poire : plus large vers le bas (-Y)
        v.co = (x * 0.31 * (1 + 0.1 * (1 - y)), y2 * 0.42, min(z, 0.03) * 0.15)
    for f in bm.faces:
        f.smooth = True
    caisse = C.objet_maillage(nom + "_caisse", bm, mr, lisse=True)
    caisse.location = (0, 0, 0.15)
    table = C.cylindre(nom + "_table", 1.0, 0.012, (0, 0, 0.15 + 0.03 * 0.15), mt, segments=40)
    table.scale = (0.31, 0.42, 1.0)
    table.location = (0, -0.03, 0.15 + 0.0045)
    rosace = E.disque(nom + "_rosace", 0.085, 0.006, (0, 0.04, 0.15 + 0.0045 + 0.012), menc, segments=20)
    chevalet = C.boite(nom + "_chevalet", 0.22, 0.03, 0.025, (0, -0.22, 0.15 + 0.0045 + 0.012), menc)
    manche = C.boite(nom + "_manche", 0.1, 0.46, 0.05, (0, 0.42 + 0.2, 0.15 - 0.02), mr)
    touche = C.boite(nom + "_touche", 0.1, 0.46, 0.012, (0, 0.42 + 0.2, 0.15 + 0.03), menc)
    chev = C.boite(nom + "_chevillier", 0.1, 0.22, 0.05, (0, 0, 0), E.mat_bois(nom + "_chev", "#4a2a16"), base=False)
    chev.rotation_euler.x = math.radians(-70)
    chev.location = (0, 0.42 + 0.46 + 0.04, 0.15 - 0.06)
    objets = [caisse, table, rosace, chevalet, manche, touche, chev]
    mco = C.mat_simple(nom + "_cordes", "#efe6c8", rugosite=0.4)
    for k in range(5):
        x = -0.04 + 0.02 * k
        objets.append(tige("%s_co%d" % (nom, k), (x, -0.22, 0.15 + 0.03), (x * 0.8, 0.42 + 0.44, 0.15 + 0.045), 0.009, mco, segments=5))
    for k in range(4):
        objets.append(C.cylindre("%s_ch%d" % (nom, k), 0.016, 0.07, (0, 0, 0), menc, segments=6))
        objets[-1].rotation_euler = (0, math.pi / 2, 0)
        objets[-1].location = (-0.09 if k % 2 else 0.02, 0.42 + 0.46 + 0.06 + 0.04 * (k // 2), 0.15 - 0.02 + 0.05 * (k // 2))
    p = pivot_rot(nom + "_pivot", objets, rot, loc)
    p.scale = (echelle, echelle, echelle)
    return objets + [p]


def rouleau_deroule(nom, loc=(0, 0, 0), lacet=0.0, l=1.1, p=0.7):
    """Rouleau de parchemin déroulé à plat, encore enroulé au bord du fond."""
    mp = E.mat_parchemin(nom + "_p", PARCHEMIN_OBJET, grain=0.4)
    feuille = C.boite(nom, l, p, 0.015, (0, 0, 0), mp)
    rl = C.cylindre(nom + "_rl", 0.065, l, (0, 0, 0), mp, segments=20)
    rl.rotation_euler = (0, math.pi / 2, 0)
    rl.location = (-l / 2, p / 2 - 0.03, 0.065)
    return [feuille, rl] + [C.pivot(nom + "_pivot", [feuille, rl], lacet, loc)]


def lettre_scellee(nom, loc=(0, 0, 0), lacet=0.0, l=1.0, p=0.7):
    """Lettre pliée au cachet de cire sarcelle, ruban de la même teinte noué autour."""
    mp = E.mat_parchemin(nom + "_p", "#e4d6b0", grain=0.3)
    corps = C.boite(nom, l, p, 0.04, (0, 0, 0), mp)
    C.biseau(corps, 0.01)
    pli = C.boite(nom + "_pli", l * 0.96, 0.014, 0.008, (0, 0, 0.04), E.mat_encre(nom + "_e", "#8a7a5c"))
    mr = E.mat_toile(nom + "_ruban", E.MATIERES["anglais"])
    ruban = C.boite(nom + "_ruban", 0.085, p + 0.06, 0.014, (0.12, 0, 0.04), mr)
    ruban2 = C.boite(nom + "_ruban2", l + 0.06, 0.085, 0.014, (0, 0.05, 0.04), mr)
    objets = [corps, pli, ruban, ruban2]
    objets += E.sceau_cire(nom + "_cachet", rayon=0.17, epaisseur=0.045, teintes=CIRE_SARCELLE, icone=None, loc=(0.12, 0.05, 0.054), anneau=True, graine=3)
    return objets + [C.pivot(nom + "_pivot", objets, lacet, loc)]


# ---------------------------------------------------------------- les six faveurs
def faveur_annales():
    """Annales (chroniqueur, histoire) : livre d'annales ouvert et relevé, signet pourpre, encrier et plume."""
    E.scene_vignette(rayon_sol=1.8)
    objets = livre_ouvert("livre", (-0.12, 0.1, 0), lacet=-10, pente=20)
    objets += encrier_plume("encrier", (0.98, -0.5, 0), direction=(0.3, -0.12, 1.0), longueur=1.15)
    return racine(objets, 1.6, -0.3, -0.05)


def faveur_eclaireurs():
    """Éclaireurs (cartographe, géographie) : carte déroulée, compas de laiton debout dessus, cor de chasse ocre posé contre."""
    E.scene_vignette(rayon_sol=1.8)
    objets = carte_deroulee("carte", (-0.1, 0.3, 0), lacet=-6, l=2.1, p=1.35)
    objets += compas("compas", (-0.6, 0.35, 0.02), lacet=25, ecart=0.3, hauteur=0.8)
    # grand cor dressé en croissant, le pavillon vers la caméra, l'embouchure au sol
    objets += cor("cor", (0.55, -0.45, 0.42), rot=(55, 0, 20), rayon=0.5)
    return racine(objets, 1.25, -0.3, 0.0)


def faveur_simples():
    """Simples (herboriste, SVT) : panier d'osier débordant de brins verts, fiole de verre bouchée."""
    E.scene_vignette(rayon_sol=1.8)
    objets = panier("panier", (-0.25, 0.15, 0), rayon=0.55, hauteur=0.45)
    objets += fiole("fiole", (0.9, -0.5, 0), rayon=0.16, hauteur=0.5)
    return racine(objets, 1.45, -0.3, 0.0)


def faveur_engrenages():
    """Engrenages (maître d'œuvre, physique) : grande roue dentée de bois et petite roue de fer bleui qui s'engrènent,
    debout et penchées en arrière ; clé à fourche bleue couchée devant."""
    E.scene_vignette(rayon_sol=1.8)
    penche = 14.0
    r1, r2 = 0.66, 0.44
    n1 = 12
    pas = 2 * math.pi * r1 / n1
    n2 = max(6, int(round(2 * math.pi * r2 / pas)))
    r2 = pas * n2 / (2 * math.pi)
    prof = min(0.16, pas * 0.55)
    # les deux roues reposent au sol, la petite plus bas : dans le plan des roues, l'axe des centres descend de r1 - r2 ;
    # une dent de la grande pointe vers la petite, qui lui présente un creux (phases)
    d = r1 + r2 + prof
    dx = math.sqrt(max(0.01, d * d - (r1 - r2) ** 2))
    phi = math.degrees(math.atan2(-(r1 - r2), dx))
    o1, p1 = engrenage("roue_bois", r1, n1, 0.12, phase=phi)
    o2, p2 = engrenage("roue_fer", r2, n2, 0.1, mat=C.mat_metal("fer_bleui", ACIER_BLEU, rugosite=0.4, metal=0.9),
                       mat_moyeu=C.mat_metal("moyeu_bleu", "#2b4668", rugosite=0.45), phase=phi + 180.0 + 180.0 / n2)
    x1 = -dx * 0.55
    sp, cp = math.sin(math.radians(penche)), math.cos(math.radians(penche))
    # debout : la roue à plat tourne de 90° - penche autour de X (elle fait face à la caméra, penchée en arrière)
    p1.rotation_euler = (math.radians(90 - penche), 0, 0)
    p1.location = (x1, 0.0, (r1 + prof) * cp)
    p2.rotation_euler = (math.radians(90 - penche), 0, 0)
    p2.location = (x1 + dx, -(r1 - r2) * sp, (r2 + prof) * cp)
    objets = o1 + [p1] + o2 + [p2]
    objets += cle("cle", (0.15, -0.95, 0.0), lacet=-22, longueur=0.95)
    return racine(objets, 1.12, -0.35, 0.0)


def faveur_ballade():
    """Ballade consolante (ménestrel, littérature) : luth de bois roux couché sur un rouleau de parchemin déroulé."""
    E.scene_vignette(rayon_sol=1.8)
    objets = rouleau_deroule("rouleau", (0.1, 0.15, 0), lacet=-12, l=1.6, p=1.05)
    # presque à plat sur le rouleau (le manche vers le bout enroulé), la caisse vers la caméra
    objets += luth("luth", (-0.1, -0.2, 0.015 + 0.6 * math.sin(math.radians(10))), rot=(10, 0, -28), echelle=1.35)
    return racine(objets, 1.4, -0.25, 0.0)


def faveur_lettres():
    """Lettres de crédit (interprète, anglais) : lettre scellée de cire sarcelle, ruban, pile de pièces d'or et pièces éparses."""
    E.scene_vignette(rayon_sol=1.8)
    objets = lettre_scellee("lettre", (-0.25, 0.05, 0), lacet=14, l=1.1, p=0.76)
    objets += E.pile_pieces("pile", 7, 0.17, 0.035, loc=(0.78, -0.3, 0), graine=5)
    objets += E.pile_pieces("eparses", 1, 0.17, 0.035, loc=(0.5, -0.72, 0), graine=2)
    objets += E.pile_pieces("eparses2", 2, 0.17, 0.035, loc=(1.05, -0.68, 0), graine=8)
    return racine(objets, 1.3, -0.2, 0.0)


FAVEURS = {"annales": faveur_annales, "eclaireurs": faveur_eclaireurs, "simples": faveur_simples,
           "engrenages": faveur_engrenages, "ballade": faveur_ballade, "lettres": faveur_lettres}


def rendre_faveur(ident):
    """Rend l'objet d'une faveur une fois (sprite + ombre, comme E.rendre_rondel) et le pose dans les deux cadres :
    bronze (rang 1, commune) et argent (rang 2, rare), champ teinté de la matière. Enregistre les deux images."""
    objets = FAVEURS[ident]()
    px = E.VIGNETTE * C.ECHELLE
    sprite, ombre = C.rendre_sprite("faveur-" + ident, px, px, objets, ombre=True, contour=0.45, surech=E.SURECH, echantillons=ECHANTILLONS,
                                    ombre_separee=True, couleur_ombre=E.OMBRE_PARCHEMIN, force_ombre=0.55, net=0.5, controle=False)
    champ = E.champ_teinte(E.MATIERES[MATIERE_FAVEUR[ident]])
    chemins = []
    for rang, anneau in ((1, "bronze"), (2, "argent")):
        nom = "faveur-%s-%d" % (ident, rang)
        final = E.cadre_rondel(anneau, parchemin=champ).copy()
        if ombre is not None:
            om = ombre.crop((0, 0, px, px))
            a = np.array(om.split()[3], dtype=np.float32) / 255.0 * E.masque_disque(px, (E.R_HALTE - E.BANDE_CADRE) * C.ECHELLE - 1, 2.0)
            om.putalpha(Image.fromarray((a * 255).astype(np.uint8), "L"))
            final.alpha_composite(om)
        final.alpha_composite(sprite)
        E.controler(final, nom)
        chemins.append(E.sauver(nom, final))
    return chemins


# ---------------------------------------------------------------- l'Armorial : écu et cinq émaux
ECU_L, ECU_H = 8.8, 10.0                 # mètres : 88 unités de large (x de 6 à 94), 100 de haut vus à 12° (≈ 98 unités)
ARMORIAL_ANCRE = (50.0, 106.0)           # la pointe de l'écu tombe à 106 unités du haut (4 unités de marge en bas)
QUARTIERS = ("vivres", "bourse", "murs", "banniere", "ouverture")


def U(u):
    """Abscisse SVG (0..100) -> x en mètres (l'écu va de 6 à 94)."""
    return (u - 50.0) / 100.0 * ECU_L / 0.88


def V(v):
    """Ordonnée SVG (6 en haut, 110 à la pointe) -> z en mètres (la pointe à 0, le haut à ECU_H)."""
    return (110.0 - v) / 104.0 * ECU_H


def plan_armorial():
    """Construit l'écu et ses cinq plaques d'émail dans la scène courante ; renvoie (objets de l'écu, {quartier: plaque})."""
    contour = E.contour_ecu(ECU_L, ECU_H, n=18)
    objets = []
    # de l'arrière vers l'avant : liseré d'encre un peu plus grand (le trait de 2,5 unités du SVG), écu d'or (sa bande
    # reste visible sur 0,37 m autour du champ), fin cerne d'encre, champ de parchemin
    objets.append(prisme("lisere", decaler_contour(contour, -0.14), 0.0, 0.32, E.mat_encre("lisere_encre")))
    objets.append(prisme("or", contour, -0.04, 0.3, E.mat_or("ecu_or"), biseau=0.02))
    objets.append(prisme("cerne_champ", decaler_contour(contour, 0.37), -0.05, 0.012, E.mat_encre("cerne_encre")))
    objets.append(prisme("champ", decaler_contour(contour, 0.42), -0.06, 0.03, E.mat_parchemin("ecu_parchemin", E.PARCHEMIN_CLAIR, grain=0.45, echelle=3.0)))
    # séparations des quartiers : traits d'encre couchés sur le champ (croix et losange)
    interieur = decaler_contour(contour, 0.46)
    bas = min(z for _, z in interieur)
    menc = E.mat_encre("traits_encre")
    traits = [bande_xz((U(10.4), V(50)), (U(89.6), V(50)), 0.1), bande_xz((0.0, V(10.4)), (0.0, bas), 0.1)]
    loz = [(U(50), V(36)), (U(64), V(60)), (U(50), V(84)), (U(36), V(60))]
    for k in range(4):
        traits.append(bande_xz(loz[k], loz[(k + 1) % 4], 0.1))
    for k, t in enumerate(traits):
        objets.append(prisme("trait%d" % k, t, -0.075, 0.015, menc))
    # les cinq plaques d'émail, découpées dans le champ intérieur
    plaques = {}
    formes = {
        "vivres": couper(couper(interieur, lambda x, z: -x), lambda x, z: z - V(50)),
        "bourse": couper(couper(interieur, lambda x, z: x), lambda x, z: z - V(50)),
        "murs": couper(couper(interieur, lambda x, z: -x), lambda x, z: V(50) - z),
        "banniere": couper(couper(interieur, lambda x, z: x), lambda x, z: V(50) - z),
        "ouverture": loz,
    }
    for q in QUARTIERS:
        pts = formes[q]
        y0 = -0.11 if q == "ouverture" else -0.09
        plaques[q] = prisme("email_" + q, pts, y0, 0.03, E.mat_teinte("email_" + q, E.ARMORIAL[q], rugosite=0.38), biseau=0.01)
    return objets, plaques


def armorial(noms=None):
    """Rend les six couches avec la même caméra : l'écu (plaques cachées) puis chaque plaque seule."""
    noms = noms or ["armorial-ecu"] + ["armorial-" + q for q in QUARTIERS]
    E.scene_vignette((100, 110), inclinaison=12, px_par_m=10, ancre=ARMORIAL_ANCRE, rayon_sol=None, appoint=1.0)
    ecu, plaques = plan_armorial()
    tous = ecu + list(plaques.values())
    chemins = []
    for nom in noms:
        q = nom.replace("armorial-", "")
        for o in tous:
            o.hide_render = True
        visibles = ecu if q == "ecu" else [plaques[q]]
        for o in visibles:
            o.hide_render = False
        img = E.rendre_vignette(nom, visibles, (100, 110), echantillons=ECHANTILLONS, contour=0.45 if q == "ecu" else 0.35, ombre=False)
        chemins.append(E.sauver(nom, img))
    return chemins


# ---------------------------------------------------------------- loupe : les images à leur taille d'écran
def composer_ecu(man, rangs, taille):
    """L'écu composé comme le fera l'écran : écu puis émaux avec l'opacité du rang (0,08 sans rang, 0,35 + 0,65 r / max)."""
    maxi = {"vivres": 2, "bourse": 3, "murs": 2, "ouverture": 1, "banniere": 2}

    def charger(k):
        return Image.open(os.path.join(C.RACINE, "jeu", man[k]["f"])).convert("RGBA")
    base = charger("armorial-ecu")
    for q in QUARTIERS:
        k = "armorial-" + q
        if k not in man:
            continue
        r = rangs.get(q, 0)
        op = 0.35 + 0.65 * r / maxi[q] if r else 0.08
        pl = charger(k)
        a = pl.split()[3].point(lambda v: int(v * op))
        pl.putalpha(a)
        base.alpha_composite(pl)
    w = taille
    h = int(round(taille * 1.1))
    return base.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA")


def loupe():
    """Chaque faveur à 34 px (compagnie) et 56 px (carte), agrandie 3 × sans lissage ; l'écu composé à 72 et 150 px
    (sans rang, rangs mêlés, tous les rangs) ; les icônes de la compagnie à 24 px."""
    man = E.lire_manifeste()
    police, petite = E._police(14), E._police(11)
    cw, ch = 34 + 56 + 56 * 3 + 60, 56 * 3 + 40
    cols = 3
    faveurs = [k for k in E.catalogue("faveurs") if k.startswith("faveur-") and k in man]
    lignes = (len(faveurs) + cols - 1) // cols
    ecus = "armorial-ecu" in man
    H = 16 + lignes * (ch + 12) + (190 + 40 if ecus else 0) + 110 + 40
    can = Image.new("RGB", (16 + cols * (cw + 12), H), C.rgb8(E.PARCHEMIN))
    d = ImageDraw.Draw(can)
    for n, k in enumerate(faveurs):
        e = man[k]
        im = Image.open(os.path.join(C.RACINE, "jeu", e["f"])).convert("RGBA")
        x, y = 16 + (n % cols) * (cw + 12), 16 + (n // cols) * (ch + 12)
        d.rectangle((x, y, x + cw, y + ch), outline=(170, 150, 110))
        p34 = im.convert("RGBa").resize((34, 34), Image.LANCZOS).convert("RGBA")
        p56 = im.convert("RGBa").resize((56, 56), Image.LANCZOS).convert("RGBA")
        can.paste(p34, (x + 8, y + 8), p34)
        can.paste(p56, (x + 8 + 34 + 12, y + 8), p56)
        zoom = p56.resize((56 * 3, 56 * 3), Image.NEAREST)
        can.paste(zoom, (x + 8 + 34 + 12 + 56 + 16, y + 8), zoom)
        d.text((x + 8, y + ch - 20), "%s : 34 px, 56 px, × 3" % k, fill=C.rgb8(E.ENCRE), font=petite)
    y = 16 + lignes * (ch + 12)
    if ecus:
        x = 16
        for rangs, titre in (({}, "sans rang"), ({"vivres": 1, "bourse": 2, "ouverture": 1}, "rangs mêlés"), ({"vivres": 2, "bourse": 3, "murs": 2, "ouverture": 1, "banniere": 2}, "complet")):
            for t in (72, 150):
                im = composer_ecu(man, rangs, t)
                can.paste(im, (x, y + 8 + (165 - im.size[1])), im)
                d.text((x, y + 8 + 170), "%s %d px" % (titre, t), fill=C.rgb8(E.ENCRE), font=petite)
                x += im.size[0] + 18
        y += 190 + 40
    x = 16
    for k in ("compagnie-sac-plein", "compagnie-sac-vide", "compagnie-or", "compagnie-plan", "compagnie-espion"):
        if k not in man:
            continue
        e = man[k]
        im = Image.open(os.path.join(C.RACINE, "jeu", e["f"])).convert("RGBA")
        pt = im.convert("RGBa").resize((e["w"], e["h"]), Image.LANCZOS).convert("RGBA")
        can.paste(pt, (x, y + 8), pt)
        zoom = pt.resize((e["w"] * 3, e["h"] * 3), Image.NEAREST)
        can.paste(zoom, (x + e["w"] + 10, y + 8), zoom)
        d.text((x, y + 8 + 90), k.replace("compagnie-", ""), fill=C.rgb8(E.ENCRE), font=petite)
        x += e["w"] * 4 + 40
    d.text((16, H - 24), "Famille « faveurs » à la taille d'écran (compagnie 34 px, cartes 56 px, écu 72 et 150 px) et agrandie 3 fois, sans lissage", fill=C.rgb8(E.RUBRIQUE), font=police)
    chemin = os.path.join(E.CAPTURES, "planche-expedition-faveurs-56.png")
    can.save(chemin)
    E.journal("loupe : " + os.path.relpath(chemin, C.RACINE))
    return chemin


# ---------------------------------------------------------------- lancement
def main(args):
    quoi = [a for a in args if not a.startswith("--")]
    tout = not quoi and not ("--loupe" in args or "--planche" in args)
    for ident in FAVEURS:
        if tout or "faveurs" in quoi or ident in quoi or ("faveur-" + ident) in quoi or any(q.startswith("faveur-" + ident + "-") for q in quoi):
            rendre_faveur(ident)
    couches = [q for q in quoi if q.startswith("armorial-")]
    if tout or "armorial" in quoi:
        armorial()
    elif couches:
        armorial(couches)
    comp = [q for q in quoi if q.startswith("compagnie-")]
    if "compagnie" in quoi or comp:
        import expedition_haltes as H
        for nom in (comp or list(H.COMPAGNIE)):
            E.sauver(nom, H.compagnie(nom))
    if "--sans-planche" not in args:
        E.planche("faveurs")
        loupe()
    if tout or quoi:
        E.verifier_budget()


if __name__ == "__main__":
    main(sys.argv[1:])
