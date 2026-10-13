# -*- coding: utf-8 -*-
"""Places fortes des deux bouts de la route : château de France, château anglais, forteresse omeyyade.

Usage : python3 atelier/outils/rendu-3d/places.py [camp ...] [--etats intact,abime,ruine]
Sorties : jeu/assets/images/td/place-<camp>-<etat>.png, 150 × 150 px logiques (rendu 300 × 300),
ancrage = bas-centre moins 18 px : le bout de la route arrive devant la porte.

France : pierre calcaire claire, tours rondes et donjon coiffés d'ardoise, bannières d'azur à la fleur de lys.
Angleterre : pierre plus sombre, donjon normand carré à toit plat, tours rondes coiffées de tuiles brunes,
bannières de gueules au lion. Omeyyades : forteresse de pierre ocre et de terre (pisé), tours carrées à merlons
pointus, porte en arc outrepassé, bannières ivoire à la tour verte. Aucun édifice religieux.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402  (commun d'abord : il rend bpy importable)
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector, Matrix  # noqa: E402

V = Vector
TAILLE = 150          # px logiques
ANCRE = 18            # px logiques au-dessus du bas de l'image
PX_PAR_M = 5.4        # échelle des places fortes (px logiques par mètre)


# ---------------------------------------------------------------- matières
def matieres(camp, etat):
    """Pierre, pisé, toits, bois du camp ; les états abîmé et ruiné noircissent tout (suie)."""
    c = C.CAMPS[camp]
    suie = {"intact": 1.0, "abime": 0.8, "ruine": 0.66}[etat]
    m = {}
    if camp == "omeyyades":
        m["pierre"] = C.mat_ph("pierre", c["pierre"], echelle_m=4.0, teinte=c["teinte_pierre"], force_teinte=0.5,
                               valeur=1.05 * suie, saturation=0.8, bosse=0.35, salissure=0.25)
        m["mur"] = C.mat_ph("pise", c["mur"], echelle_m=3.0, teinte="#cfae84", force_teinte=0.55, valeur=1.18 * suie,
                            saturation=0.75, bosse=0.2, salissure=0.25)
        m["toit"] = m["mur"]
    else:
        clair = camp == "france"
        m["pierre"] = C.mat_ph("pierre", c["pierre"], echelle_m=4.0 if clair else 3.6, teinte=c["teinte_pierre"],
                               force_teinte=0.65 if clair else 0.35, saturation=0.7 if clair else 0.8,
                               valeur=(1.12 if clair else 0.95) * suie, bosse=0.35, salissure=0.3)
        m["mur"] = m["pierre"]
        m["toit"] = C.mat_ph("toit", c["toit"], echelle_m=3.2, teinte=c["teinte_toit"], force_teinte=0.7,
                             valeur=(0.95 if clair else 0.8) * suie, projection="UV", bosse=0.6, rugosite=0.55 if clair else 0.8)
    m["terrasse"] = (C.mat_simple("terrasse", "#d4c09a", rugosite=0.9, bosse=0.15, echelle_bosse=6) if camp == "omeyyades"
                     else C.mat_simple("plomb", "#6a6c70", rugosite=0.55, bosse=0.1, echelle_bosse=4))
    m["bois"] = C.mat_ph("bois", "medieval_wood", echelle_m=1.6, valeur=0.8, bosse=0.4)
    m["noir"] = C.mat_simple("ouverture", "#140e0a", rugosite=1.0)
    m["sol"] = C.mat_ph("cour", "dirt_aerial_02", echelle_m=6.0, valeur=0.9, bosse=0.2)
    m["fer"] = C.mat_metal("fer", "#3d3a38", rugosite=0.5)
    m["eboulis"] = m["pierre"]
    return m


# ---------------------------------------------------------------- éléments d'architecture
def cone_uv(nom, rayon, hauteur, loc, mat, segments=24, taille_tex=1.0, pans=None, rot=0.0):
    """Toit conique (ou pyramidal si pans=4) avec UV en mètres : les rangs d'ardoises tournent autour du cône."""
    n = pans or segments
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    pente = math.hypot(rayon, hauteur)
    sommet = bm.verts.new((0, 0, hauteur))
    base = []
    for k in range(n + 1):
        a = 2 * math.pi * k / n + rot
        base.append(bm.verts.new((rayon * math.cos(a), rayon * math.sin(a), 0)) if k < n else base[0])
    for k in range(n):
        f = bm.faces.new((base[k], base[k + 1], sommet))
        f.smooth = pans is None
        u0 = 2 * math.pi * rayon * k / n / taille_tex
        u1 = 2 * math.pi * rayon * (k + 1) / n / taille_tex
        for lp, uvv in zip(f.loops, ((u0, 0), (u1, 0), ((u0 + u1) / 2, pente / taille_tex))):
            lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.location = loc
    s = ob.modifiers.new("ep", "SOLIDIFY")
    s.thickness = 0.12
    return ob


def toit_deux_pans(nom, x0, x1, y0, y1, z, hauteur, mat, taille_tex=1.0, debord=0.3):
    """Toit à deux pans (faîtage le long de X) avec UV en mètres."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    xa, xb = x0 - debord, x1 + debord
    ya, yb = y0 - debord, y1 + debord
    ym = (y0 + y1) / 2
    p = [bm.verts.new(v) for v in ((xa, ya, z), (xb, ya, z), (xb, ym, z + hauteur), (xa, ym, z + hauteur),
                                   (xa, yb, z), (xb, yb, z))]
    pente = math.hypot(ym - ya, hauteur)
    for quad in ((p[0], p[1], p[2], p[3]), (p[5], p[4], p[3], p[2])):
        f = bm.faces.new(quad)
        L = (xb - xa) / taille_tex
        for lp, uvv in zip(f.loops, ((0, 0), (L, 0), (L, pente / taille_tex), (0, pente / taille_tex))):
            lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.15
    return ob


def meurtrieres(nom, x, y, r, z, mat, nombre=3, debut=-1.9, pas=0.9, rond=True, h=0.9):
    """Archères (fentes sombres) sur le pourtour d'une tour, côté caméra."""
    objs = []
    for k in range(nombre):
        a = debut + k * pas
        px, py = x + r * math.cos(a), y + r * math.sin(a)
        o = C.boite(nom + "_m%d" % k, 0.12, 0.08, h, (px, py, z), mat)
        o.rotation_euler.z = a + math.pi / 2
        objs.append(o)
    return objs


def tour_ronde(nom, x, y, r, h, m, toit=True, etat="intact", graine=0, archeres=True):
    """Tour ronde : talus à la base, fût, cordon, puis toit conique (ou merlons si pas de toit)."""
    rnd = random.Random(graine)
    objs = []
    if etat == "ruine":
        h *= rnd.uniform(0.45, 0.7)
        toit = False
    objs.append(C.cylindre(nom + "_talus", r * 1.16, 1.4, (x, y, 0), m["pierre"], segments=28, rayon_haut=r))
    fut = C.cylindre(nom + "_fut", r, h, (x, y, 0), m["pierre"], segments=28)
    objs.append(fut)
    if etat != "ruine":
        objs.append(C.cylindre(nom + "_cordon", r + 0.18, 0.35, (x, y, h - 0.9), m["pierre"], segments=28))
    if toit and not (etat == "abime" and rnd.random() < 0.5):
        objs.append(C.cylindre(nom + "_attique", r + 0.12, 0.7, (x, y, h - 0.55), m["pierre"], segments=28))
        objs.append(cone_uv(nom + "_toit", r + 0.45, r * 2.1, (x, y, h + 0.1), m["toit"]))
    else:
        objs.append(C.creneaux_cercle(nom + "_crn", r + 0.05, h, m["pierre"], nombre=max(8, int(r * 5)), h=0.6, ep=0.4))
        if etat == "abime" and toit:
            # charpente brûlée : quelques chevrons noircis
            for k in range(5):
                a = rnd.uniform(0, 6.28)
                o = C.boite(nom + "_chevron%d" % k, 0.12, 0.12, r * 1.8, (x + 0.4 * math.cos(a), y + 0.4 * math.sin(a), h), m["noir"])
                o.rotation_euler = (rnd.uniform(-0.6, 0.6), rnd.uniform(-0.6, 0.6), a)
                objs.append(o)
    if archeres and etat != "ruine":
        objs += meurtrieres(nom, x, y, r + 0.02, h * 0.45, m["noir"], nombre=3)
    return objs


def tour_carree(nom, x, y, cote, h, m, merlons="carre", etat="intact", graine=0, toit=None, mat="pierre"):
    """Tour carrée : talus, fût, parapet crénelé (merlons droits ou pointus), toit pyramidal en option."""
    rnd = random.Random(graine)
    objs = []
    if etat == "ruine":
        h *= rnd.uniform(0.5, 0.75)
        toit = None
    objs.append(C.boite(nom + "_talus", cote * 1.12, cote * 1.12, 1.2, (x, y, 0), m[mat]))
    fut = C.boite(nom + "_fut", cote, cote, h, (x, y, 0), m[mat])
    C.biseau(fut, 0.04)
    objs.append(fut)
    objs.append(C.boite(nom + "_corniche", cote + 0.3, cote + 0.3, 0.3, (x, y, h - 0.3), m[mat]))
    objs.append(C.boite(nom + "_terrasse", cote - 0.2, cote - 0.2, 0.06, (x, y, h), m["terrasse"]))
    if toit:
        objs.append(cone_uv(nom + "_toit", (cote + 0.7) * 0.72, cote * 0.9, (x, y, h), m["toit"], pans=4, rot=math.pi / 4))
    else:
        bm = bmesh.new()
        d = cote / 2 + 0.1
        coins = [(x - d, y - d), (x + d, y - d), (x + d, y + d), (x - d, y + d)]
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], h, h=0.65 if merlons == "carre" else 0.6, ep=0.4,
                             pas=0.95, forme=merlons)
        objs.append(C.objet_maillage(nom + "_crn", bm, m[mat]))
    if etat != "ruine":
        # archères en façade (côté caméra : -Y)
        for k in (-1, 1):
            objs.append(C.boite(nom + "_arch%d" % k, 0.12, 0.06, 0.95, (x + k * cote * 0.22, y - cote / 2 - 0.02, h * 0.5), m["noir"]))
    return objs


def courtine(nom, a, b, h, ep, m, etat="intact", merlons="carre", breche=None, mat="mur"):
    """Mur d'enceinte de a à b (points x, y) : talus, mur, chemin de ronde crénelé côté extérieur (-normale)."""
    a, b = V((a[0], a[1], 0)), V((b[0], b[1], 0))
    d = b - a
    L = d.length
    ang = math.atan2(d.y, d.x)
    milieu = (a + b) / 2
    objs = []
    morceaux = [(0.0, 1.0)]
    if breche:
        morceaux = [(0.0, breche[0]), (breche[1], 1.0)]
    for i, (t0, t1) in enumerate(morceaux):
        if t1 - t0 < 0.02:
            continue
        c = a + d * ((t0 + t1) / 2)
        l = L * (t1 - t0)
        hh = h if etat != "ruine" else h * random.Random(hash(nom) + i).uniform(0.45, 0.7)
        objs.append(C.boite(nom + "_talus%d" % i, l, ep * 1.5, 1.0, (c.x, c.y, 0), m[mat], rot_z=ang))
        mur = C.boite(nom + "_mur%d" % i, l, ep, hh, (c.x, c.y, 0), m[mat], rot_z=ang)
        C.biseau(mur, 0.03)
        objs.append(mur)
        if etat != "ruine":
            bm = bmesh.new()
            n = V((-d.y, d.x, 0)).normalized()       # normale vers l'intérieur (gauche de a -> b)
            dec = -n * (ep / 2 - 0.18)
            p0 = a + d * t0 + dec
            p1 = a + d * t1 + dec
            C.creneaux_ligne(bm, (p0.x, p0.y), (p1.x, p1.y), hh, h=0.6, ep=0.36, pas=1.0, forme=merlons)
            objs.append(C.objet_maillage(nom + "_crn%d" % i, bm, m[mat]))
    return objs


def porte_arc(nom, x, y, largeur, hauteur, m, outrepasse=False, rot_z=0.0, profondeur=0.5):
    """Ouverture de porte (arc brisé ou outrepassé) creusée dans une façade tournée vers -Y : un volume sombre
    en forme d'arc, un vantail de bois et, pour l'arc outrepassé, un encadrement saillant (alfiz)."""
    bm = bmesh.new()
    pts = []
    r = largeur / 2
    if outrepasse:
        # arc outrepassé : cercle prolongé sous les impostes
        cz = hauteur - r * 1.05
        for k in range(25):
            a = math.radians(-35 + (180 + 70) * k / 24)
            pts.append((r * 1.12 * math.cos(a), cz + r * 1.12 * math.sin(a)))
        pts = [(r, 0)] + [(min(r, max(-r, px)), pz) if pz < cz else (px, pz) for px, pz in pts] + [(-r, 0)]
    else:
        for k in range(13):
            a = math.radians(180 * k / 12)
            px = r * math.cos(a)
            pz = hauteur - r + r * math.sin(a) * 1.25
            pts.append((px, pz))
        pts = [(r, 0)] + pts + [(-r, 0)]
    avant = [bm.verts.new((px, -0.02, pz)) for px, pz in pts]
    arriere = [bm.verts.new((px, profondeur, pz)) for px, pz in pts]
    bm.faces.new(avant[::-1])
    bm.faces.new(arriere)
    for k in range(len(pts)):
        bm.faces.new((avant[k], avant[(k + 1) % len(pts)], arriere[(k + 1) % len(pts)], arriere[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = C.objet_maillage(nom + "_baie", bm, m["noir"])
    ob.location = (x, y, 0)
    ob.rotation_euler.z = rot_z
    objs = [ob]
    # vantail de bois, un peu en retrait
    v = C.boite(nom + "_vantail", largeur * 0.92, 0.12, hauteur * 0.62, (x, y + 0.25, 0), m["bois"])
    v.rotation_euler.z = rot_z
    objs.append(v)
    if outrepasse:
        # alfiz : encadrement rectangulaire en relief autour de l'arc
        for (dx, dz, sx, sz) in ((0, hauteur + 0.35, largeur + 1.0, 0.25), (-(largeur / 2 + 0.38), hauteur / 2 + 0.2, 0.25, hauteur + 0.6),
                                 ((largeur / 2 + 0.38), hauteur / 2 + 0.2, 0.25, hauteur + 0.6)):
            o = C.boite(nom + "_alfiz", sx, 0.15, sz, (x + dx, y - 0.08, dz - sz / 2), m["pierre"])
            o.rotation_euler.z = rot_z
            objs.append(o)
    return objs


def eboulis(nom, centre, rayon, nombre, m, graine=1):
    """Tas de pierres tombées (états abîmé et ruiné)."""
    rnd = random.Random(graine)
    objs = []
    for k in range(nombre):
        a = rnd.uniform(0, 2 * math.pi)
        d = rayon * math.sqrt(rnd.random())
        s = rnd.uniform(0.25, 0.6)
        o = C.boite(nom + "_%d" % k, s, s * rnd.uniform(0.7, 1.3), s * 0.7,
                    (centre[0] + d * math.cos(a), centre[1] + d * math.sin(a), 0), m["eboulis"])
        o.rotation_euler = (rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), rnd.uniform(0, 3))
        objs.append(o)
    return objs


def cour(nom, x0, x1, y0, y1, m):
    """Sol de la cour (terre battue) à l'intérieur de l'enceinte."""
    return [C.boite(nom, x1 - x0, y1 - y0, 0.06, ((x0 + x1) / 2, (y0 + y1) / 2, 0), m["sol"])]


# ---------------------------------------------------------------- les trois places fortes
def chateau_france(etat="intact"):
    m = matieres("france", etat)
    o = []
    X, Y0, Y1 = 8.6, 1.4, 12.6            # enceinte : x de -X à X, y de Y0 (façade) à Y1 (fond)
    o += cour("cour", -X, X, Y0, Y1, m)
    breche = (0.25, 0.55) if etat != "intact" else None
    o += courtine("c_av_g", (-X, Y0), (-2.8, Y0), 6.2, 1.0, m, etat)
    o += courtine("c_av_d", (2.8, Y0), (X, Y0), 6.2, 1.0, m, etat, breche=breche if etat == "ruine" else None)
    o += courtine("c_fond", (X, Y1), (-X, Y1), 6.6, 1.0, m, etat)
    o += courtine("c_g", (-X, Y1), (-X, Y0), 6.4, 1.0, m, etat)
    o += courtine("c_d", (X, Y0), (X, Y1), 6.4, 1.0, m, etat, breche=breche)
    for i, (x, y) in enumerate(((-X, Y0), (X, Y0), (-X, Y1), (X, Y1))):
        o += tour_ronde("t%d" % i, x, y, 2.0, 9.5 if y == Y0 else 10.5, m, etat=etat, graine=i)
    # châtelet d'entrée : deux tours en fer à cheval et la porte
    for i, x in enumerate((-2.75, 2.75)):
        o += tour_ronde("p%d" % i, x, Y0 - 0.3, 1.4, 8.4, m, etat=etat, graine=10 + i, archeres=False)
    o.append(C.boite("porte_corps", 4.2, 2.6, 7.0 if etat != "ruine" else 4.5, (0, Y0 + 0.3, 0), m["pierre"]))
    o += porte_arc("porte", 0, Y0 - 1.0, 1.9, 3.6, m)
    if etat != "ruine":
        bm = bmesh.new()
        C.creneaux_ligne(bm, (-2.0, Y0 - 0.85), (2.0, Y0 - 0.85), 7.0, h=0.6, ep=0.36, pas=1.0)
        o.append(C.objet_maillage("porte_crn", bm, m["pierre"]))
    # logis le long du fond
    if etat != "ruine":
        o.append(C.boite("logis", 9.0, 3.2, 4.8, (-2.6, Y1 - 2.2, 0), m["pierre"]))
        o.append(toit_deux_pans("logis_toit", -7.1, 1.9, Y1 - 3.8, Y1 - 0.6, 4.8, 2.6, m["toit"]))
    # donjon carré aux tourelles d'angle, toit d'ardoise en pavillon
    dx, dy, cote = 2.4, 7.6, 6.4
    h_donjon = 14.0 if etat == "intact" else (12.0 if etat == "abime" else 8.5)
    o.append(C.boite("donjon_talus", cote + 0.8, cote + 0.8, 1.6, (dx, dy, 0), m["pierre"]))
    dj = C.boite("donjon", cote, cote, h_donjon, (dx, dy, 0), m["pierre"])
    C.biseau(dj, 0.05)
    o.append(dj)
    if etat != "ruine":
        o.append(C.boite("donjon_corniche", cote + 0.5, cote + 0.5, 0.5, (dx, dy, h_donjon - 0.5), m["pierre"]))
        if etat == "intact":
            o.append(cone_uv("donjon_toit", (cote + 0.4) * 0.72, 4.4, (dx, dy, h_donjon), m["toit"], pans=4, rot=math.pi / 4))
        for k, (sx, sy) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
            tx, ty = dx + sx * cote / 2, dy + sy * cote / 2
            o.append(C.cylindre("echauguette%d" % k, 0.75, 2.6, (tx, ty, h_donjon - 2.2), m["pierre"], segments=16))
            if etat == "intact" or k % 2:
                o.append(cone_uv("echauguette_toit%d" % k, 0.95, 2.0, (tx, ty, h_donjon + 0.4), m["toit"], segments=16))
        for k in (-1, 0, 1):
            o.append(C.boite("donjon_fenetre%d" % k, 0.5, 0.06, 1.1, (dx + k * 1.8, dy - cote / 2 - 0.02, h_donjon * 0.62), m["noir"]))
    # bannières
    if etat != "ruine":
        o += C.drapeau("ban_donjon", "france", 3.4, 2.5, 1.55, loc=(dx, dy, h_donjon + (4.4 if etat == "intact" else 0.3)), vent=1.0)
        o += C.drapeau("ban_t0", "france", 2.4, 1.6, 1.0, loc=(-X, Y0, 9.5 + 2.3 * 2.0 + 0.1), vent=1.0, phase=1.3)
        o += C.drapeau("ban_t1", "france", 2.4, 1.6, 1.0, loc=(X, Y1, 10.5 + 2.3 * 2.0 + 0.1), vent=1.0, phase=2.1)
    if etat != "intact":
        o += eboulis("ebl", (X + 0.5, (Y0 + Y1) / 2), 2.5, 22 if etat == "ruine" else 12, m, graine=3)
        o += eboulis("ebl2", (-X - 0.8, Y0 + 2), 1.8, 14 if etat == "ruine" else 6, m, graine=5)
    return o


def chateau_angleterre(etat="intact"):
    m = matieres("angleterre", etat)
    o = []
    X, Y0, Y1 = 8.4, 1.6, 12.4
    o += cour("cour", -X, X, Y0, Y1, m)
    breche = (0.3, 0.6) if etat != "intact" else None
    o += courtine("c_av_g", (-X, Y0), (-2.6, Y0), 6.0, 1.1, m, etat, breche=breche if etat == "ruine" else None)
    o += courtine("c_av_d", (2.6, Y0), (X, Y0), 6.0, 1.1, m, etat)
    o += courtine("c_fond", (X, Y1), (-X, Y1), 6.4, 1.1, m, etat)
    o += courtine("c_g", (-X, Y1), (-X, Y0), 6.2, 1.1, m, etat, breche=breche)
    o += courtine("c_d", (X, Y0), (X, Y1), 6.2, 1.1, m, etat)
    for i, (x, y) in enumerate(((-X, Y0), (X, Y0), (-X, Y1), (X, Y1))):
        o += tour_ronde("t%d" % i, x, y, 2.1, 9.0 if y == Y0 else 10.0, m, etat=etat, graine=20 + i)
    # châtelet carré massif à créneaux
    o += tour_carree("chatelet", 0, Y0 + 0.2, 5.0, 8.6, m, etat=etat, graine=7)
    o += porte_arc("porte", 0, Y0 - 2.35, 2.0, 3.8, m)
    # herse
    if etat == "intact":
        for k in range(5):
            o.append(C.boite("herse%d" % k, 0.06, 0.06, 2.0, (-0.8 + k * 0.4, Y0 - 2.3, 1.6), m["fer"]))
    # donjon normand : grand carré à contreforts, toit plat crénelé, tourelles d'angle carrées
    dx, dy, cote = -1.8, 7.8, 7.2
    h_donjon = 15.0 if etat == "intact" else (12.5 if etat == "abime" else 8.0)
    o.append(C.boite("donjon_talus", cote + 0.9, cote + 0.9, 1.6, (dx, dy, 0), m["pierre"]))
    dj = C.boite("donjon", cote, cote, h_donjon, (dx, dy, 0), m["pierre"])
    C.biseau(dj, 0.05)
    o.append(dj)
    for k in (-1, 0, 1):        # contreforts plats de façade
        o.append(C.boite("contrefort%d" % k, 0.7, 0.4, h_donjon - 0.6, (dx + k * cote * 0.42, dy - cote / 2 - 0.15, 0), m["pierre"]))
    o.append(C.boite("donjon_terrasse", cote - 0.2, cote - 0.2, 0.06, (dx, dy, h_donjon), m["terrasse"]))
    if etat != "ruine":
        bm = bmesh.new()
        d = cote / 2 + 0.05
        coins = [(dx - d, dy - d), (dx + d, dy - d), (dx + d, dy + d), (dx - d, dy + d)]
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], h_donjon, h=0.7, ep=0.42, pas=1.0)
        o.append(C.objet_maillage("donjon_crn", bm, m["pierre"]))
        for k, (sx, sy) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
            o += tour_carree("tourelle%d" % k, dx + sx * (cote / 2 - 0.6), dy + sy * (cote / 2 - 0.6), 1.5, h_donjon + 2.2, m,
                             etat=etat, graine=30 + k)
        for k in (-1, 1):
            o.append(C.boite("donjon_fenetre%d" % k, 0.45, 0.06, 1.2, (dx + k * 1.4, dy - cote / 2 - 0.36, h_donjon * 0.6), m["noir"]))
    # grande salle à toit de tuiles contre le flanc droit
    if etat != "ruine":
        o.append(C.boite("salle", 4.0, 6.5, 4.2, (5.0, 8.6, 0), m["pierre"]))
        t = toit_deux_pans("salle_toit", 3.0, 7.0, 5.35, 11.85, 4.2, 2.4, m["toit"])
        o.append(t)
        t.rotation_euler.z = 0
    if etat != "ruine":
        o += C.drapeau("ban_donjon", "angleterre", 3.6, 2.5, 1.55, loc=(dx - cote / 2 + 0.6, dy - cote / 2 + 0.6, h_donjon + 2.2), vent=1.0)
        o += C.drapeau("ban_t1", "angleterre", 2.4, 1.6, 1.0, loc=(X, Y0, 9.0 + 2.3 * 2.1 + 0.1), vent=1.0, phase=1.1)
        o += C.drapeau("ban_t2", "angleterre", 2.4, 1.6, 1.0, loc=(-X, Y1, 10.0 + 2.3 * 2.1 + 0.1), vent=1.0, phase=2.4)
    if etat != "intact":
        o += eboulis("ebl", (-X - 0.6, (Y0 + Y1) / 2), 2.5, 22 if etat == "ruine" else 12, m, graine=8)
        o += eboulis("ebl2", (X + 0.6, Y0 + 3), 1.8, 14 if etat == "ruine" else 6, m, graine=9)
    return o


def forteresse_omeyyade(etat="intact"):
    m = matieres("omeyyades", etat)
    o = []
    X, Y0, Y1 = 9.0, 1.6, 12.2
    o += cour("cour", -X, X, Y0, Y1, m)
    breche = (0.3, 0.62) if etat != "intact" else None
    # enceinte de pisé à merlons pointus, tours carrées de pierre
    o += courtine("c_av_g", (-X, Y0), (-2.6, Y0), 6.4, 1.2, m, etat, merlons="pointe")
    o += courtine("c_av_d", (2.6, Y0), (X, Y0), 6.4, 1.2, m, etat, merlons="pointe", breche=breche if etat == "ruine" else None)
    o += courtine("c_fond", (X, Y1), (-X, Y1), 6.8, 1.2, m, etat, merlons="pointe")
    o += courtine("c_g", (-X, Y1), (-X, Y0), 6.6, 1.2, m, etat, merlons="pointe", breche=breche)
    o += courtine("c_d", (X, Y0), (X, Y1), 6.6, 1.2, m, etat, merlons="pointe")
    for i, (x, y) in enumerate(((-X, Y0), (X, Y0), (-X, Y1), (X, Y1))):
        o += tour_carree("t%d" % i, x, y, 3.4, 9.0 if y == Y0 else 9.8, m, merlons="pointe", etat=etat, graine=40 + i)
    # tours intermédiaires sur les flancs
    for i, x in enumerate((-X, X)):
        o += tour_carree("tm%d" % i, x, (Y0 + Y1) / 2, 2.6, 8.0, m, merlons="pointe", etat=etat, graine=50 + i)
    # tour-porte carrée, arc outrepassé et encadrement
    o += tour_carree("porte_tour", 0, Y0 + 0.3, 5.2, 9.2, m, merlons="pointe", etat=etat, graine=60)
    o += porte_arc("porte", 0, Y0 - 2.32, 2.0, 3.9, m, outrepasse=True)
    # grande tour maîtresse (large et trapue), au toit plat crénelé
    dx, dy, cote = -2.6, 8.2, 7.4
    h_t = 13.0 if etat == "intact" else (11.0 if etat == "abime" else 7.5)
    o += tour_carree("maitresse", dx, dy, cote, h_t, m, merlons="pointe", etat=etat, graine=61)
    if etat != "ruine":
        for k in (-1, 1):
            o.append(C.boite("maitresse_baie%d" % k, 0.55, 0.06, 1.3, (dx + k * 1.6, dy - cote / 2 - 0.03, h_t * 0.6), m["noir"]))
    # maisons à toit plat dans la cour
    if etat != "ruine":
        for i, (x, y, sx, sy, h) in enumerate(((4.4, 9.4, 5.0, 3.6, 4.0), (5.2, 5.2, 3.2, 2.6, 3.2))):
            b = C.boite("maison%d" % i, sx, sy, h, (x, y, 0), m["mur"])
            C.biseau(b, 0.05)
            o.append(b)
            o.append(C.boite("maison%d_rebord" % i, sx + 0.2, sy + 0.2, 0.25, (x, y, h - 0.05), m["pierre"]))
            o.append(C.boite("maison%d_terrasse" % i, sx - 0.1, sy - 0.1, 0.06, (x, y, h + 0.15), m["terrasse"]))
            o.append(C.boite("maison%d_porte" % i, 0.8, 0.06, 1.6, (x - sx * 0.2, y - sy / 2 - 0.03, 0), m["noir"]))
        o += C.drapeau("ban_maitresse", "omeyyades", 3.6, 2.5, 1.55, loc=(dx, dy, h_t + 0.4), vent=1.0)
        o += C.drapeau("ban_porte", "omeyyades", 2.6, 1.7, 1.0, loc=(1.6, Y0 + 0.3, 9.2 + 0.4), vent=1.0, phase=1.7)
    if etat != "intact":
        o += eboulis("ebl", (-X - 0.6, (Y0 + Y1) / 2 - 1), 2.5, 22 if etat == "ruine" else 12, m, graine=11)
        o += eboulis("ebl2", (X + 0.6, Y0 + 2), 1.8, 14 if etat == "ruine" else 6, m, graine=12)
    return o


FABRIQUES = {"france": chateau_france, "angleterre": chateau_angleterre, "omeyyades": forteresse_omeyyade}


def rendre_place(camp, etat="intact", surech=2, echantillons=96):
    px = TAILLE * C.ECHELLE
    C.reinitialiser()
    C.installer_lumiere()
    C.lumiere_appoint(0.9)
    C.camera_trois_quarts(px * surech, px * surech, PX_PAR_M * C.ECHELLE * surech, ANCRE * C.ECHELLE * surech)
    C.sol_capteur(80)
    objs = FABRIQUES[camp](etat)
    nom = "place-%s-%s" % (camp, etat)
    img = C.rendre_sprite(nom, px, px, objs, surech=surech, echantillons=echantillons, echantillons_ombre=32,
                          contour=0.45, force_ombre=0.8)
    chemin, src = C.chemin_td(nom + ".png")
    C.sauver_png(img, chemin)
    C.maj_manifeste({nom: C.entree(src, TAILLE, TAILLE, TAILLE // 2, TAILLE - ANCRE)})
    return chemin


def main(args):
    etats = ["intact", "abime", "ruine"]
    if "--etats" in args:
        i = args.index("--etats")
        etats = args[i + 1].split(",")
        args = args[:i] + args[i + 2:]
    for camp in (args or list(FABRIQUES)):
        for etat in etats:
            rendre_place(camp, etat)


if __name__ == "__main__":
    main(sys.argv[1:])
