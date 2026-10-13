# -*- coding: utf-8 -*-
"""Terrains des batailles, vus de dessus : plaine, forêt sombre tout autour, rivière, route et ponts.

Usage : python3 atelier/outils/rendu-3d/terrains.py [carte ...] [--essai | --zone x0,y0,x1,y1] [--sortie chemin.jpg]
  carte : domaine, gue, foret, moulin, col, chateau (par défaut : toutes)
  --essai : rendu rapide à la taille logique (1000 × 660), écrit dans --sortie (brouillon)
  --zone : seulement ce rectangle (px logiques), à la résolution finale, écrit dans --sortie (contrôle du détail)
Sorties : jeu/assets/images/td/terrain-<carte>.jpg, 2000 × 1320, JPEG (≤ 450 Ko).

La géométrie (route lissée, emplacements, rivière) est lue dans les fichiers du jeu (jeu/js/cartes-bataille.js)
par Node : le terrain colle exactement au tracé. Repère : 1 px logique = 10 cm ; x vers la droite, y vers le bas
pour les cartes du jeu ; dans Blender, X = x / 10, Y = (660 - y) / 10 (le nord en haut).
"""
import glob
import json
import math
import os
import random
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector, Matrix  # noqa: E402
from PIL import Image, ImageFilter  # noqa: E402

V = Vector
LARG, HAUT = 1000, 660                   # canevas logique
M = 0.1                                  # mètres par px logique
DEMI_ROUTE = 17                          # px logiques (route de 34 px)
RIVE = 13.5                              # demi-largeur de l'eau, px logiques
TAILLE_MASQUE = (2000, 1320)             # résolution des masques (celle du rendu final)

# Palette du terrain (teintes moyennes visées, sRGB) : prairie verte de fin d'été, terre brune, forêt sombre.
PALETTE = {
    "herbe": "#5b6631", "herbe_grasse": "#4c5f2a", "herbe_sombre": "#454d25", "herbe_seche": "#767046",
    "sous_bois": "#2a2a18", "terre": "#6f5a43", "orniere": "#45392d", "galets": "#6a604c", "vase": "#3b3226",
    "eau_bord": "#4a4f34", "eau_milieu": "#25433b", "eau_fond": "#132a2c",
}


# ---------------------------------------------------------------- géométrie lue dans le jeu
def lire_cartes():
    """Cartes du jeu (route lissée, emplacements, ponts, rivière) lues par Node dans jeu/js."""
    js = os.path.join(C.RACINE, "jeu", "js")
    code = ('const vm=require("vm"),fs=require("fs");const c={console,Math};c.window=c;vm.createContext(c);'
            '["bataille-moteur","cartes-bataille"].forEach(f=>vm.runInContext(fs.readFileSync(%s+"/"+f+".js","utf8"),c));'
            'const K=c.JEU.cartesBataille;console.log(JSON.stringify(Object.keys(K.LIEUX).map(id=>K.carte(id))))') % json.dumps(js)
    sortie = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True).stdout
    return {c["id"]: c for c in json.loads(sortie)}


def catmull(pts, pas=10):
    """Lissage Catmull-Rom (le même que celui du jeu) : passe par tous les points."""
    r = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(len(pts) - 1, i + 2)]
        for k in range(pas):
            t = k / pas
            t2, t3 = t * t, t * t * t
            r.append([0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                             + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)])
    r.append(list(pts[-1]))
    return r


def monde(x, y, z=0.0):
    return V((x * M, (HAUT - y) * M, z))


def dans_plaine(x, y):
    a, b = (x - 500) / 445, (y - 330) / 285
    return a * a + b * b < 0.86


def dist_ligne(x, y, ligne):
    m = 1e9
    for i in range(1, len(ligne)):
        ax, ay = ligne[i - 1]
        bx, by = ligne[i]
        dx, dy = bx - ax, by - ay
        l2 = dx * dx + dy * dy or 1
        t = max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / l2))
        m = min(m, math.hypot(ax + t * dx - x, ay + t * dy - y))
    return m


def intersections(l1, l2):
    """Points où deux polylignes se croisent, avec l'angle de l1 à cet endroit."""
    r = []
    for i in range(1, len(l1)):
        a, b = l1[i - 1], l1[i]
        for j in range(1, len(l2)):
            c, d = l2[j - 1], l2[j]
            den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
            if not den:
                continue
            t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den
            u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den
            if 0 <= t <= 1 and 0 <= u <= 1:
                r.append((a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), math.atan2(b[1] - a[1], b[0] - a[0])))
    return r


# ---------------------------------------------------------------- champs de distance et bruits (numpy)
def champ_distance(ligne, W, H, rayon):
    """Distance (px logiques) de chaque pixel d'une grille W × H à une polyligne, côté signé et abscisse curviligne.

    Calcul segment par segment, limité au voisinage (rayon en px logiques) : au-delà, la distance vaut rayon."""
    s = W / LARG
    d = np.full((H, W), float(rayon), dtype=np.float32)
    lat = np.zeros((H, W), dtype=np.float32)
    absc = np.zeros((H, W), dtype=np.float32)
    cumul = 0.0
    for i in range(1, len(ligne)):
        ax, ay = ligne[i - 1][0] * s, ligne[i - 1][1] * s
        bx, by = ligne[i][0] * s, ligne[i][1] * s
        dx, dy = bx - ax, by - ay
        l2 = dx * dx + dy * dy
        if l2 < 1e-9:
            continue
        L = math.sqrt(l2)
        R = rayon * s
        x0, x1 = int(max(0, min(ax, bx) - R)), int(min(W, max(ax, bx) + R + 1))
        y0, y1 = int(max(0, min(ay, by) - R)), int(min(H, max(ay, by) + R + 1))
        if x0 >= x1 or y0 >= y1:
            cumul += L / s
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        xx += 0.5
        yy += 0.5
        t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / l2, 0, 1)
        qx, qy = ax + t * dx - xx, ay + t * dy - yy
        dist = np.sqrt(qx * qx + qy * qy) / s
        cote = ((dx * (yy - ay) - dy * (xx - ax)) / L) / s
        zone = d[y0:y1, x0:x1]
        mieux = dist < zone
        zone[mieux] = dist[mieux]
        lat[y0:y1, x0:x1][mieux] = cote[mieux]
        absc[y0:y1, x0:x1][mieux] = (cumul + t * L / s)[mieux]
        cumul += L / s
    return d, lat, absc


def bruit(W, H, echelle_px, graine, octaves=4, persistance=0.5):
    """Bruit fractal lissé (valeurs ~ -1..1), échelle = taille des plus grosses taches en pixels de la grille."""
    rng = np.random.default_rng(graine)
    tot = np.zeros((H, W), dtype=np.float32)
    amp, somme = 1.0, 0.0
    e = echelle_px
    for o in range(octaves):
        gw, gh = max(2, int(W / e) + 3), max(2, int(H / e) + 3)
        g = rng.uniform(-1, 1, (gh, gw)).astype(np.float32)
        im = Image.fromarray(g, "F").resize((int(gw * e), int(gh * e)), Image.BICUBIC)
        a = np.array(im, dtype=np.float32)
        ox, oy = rng.integers(0, max(1, a.shape[1] - W)), rng.integers(0, max(1, a.shape[0] - H))
        tot += amp * a[oy:oy + H, ox:ox + W]
        somme += amp
        amp *= persistance
        e = max(2.0, e / 2)
    return tot / somme


def lisse01(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- masques du terrain
def masques(carte, graine):
    """Calcule les masques (2000 × 1320) : route, ornières, eau, berges, forêt, clairières, variations d'herbe.

    Renvoie un dict de tableaux 0..1 et les polylignes utilisées."""
    W, H = TAILLE_MASQUE
    s = W / LARG
    route = carte["route"]
    riviere = catmull(carte["riviere"], 12)
    dr, lat, absc = champ_distance(route, W, H, 90)
    dv, latv, _ = champ_distance(riviere, W, H, 60)
    n1 = bruit(W, H, 60 * s, graine + 1)
    n2 = bruit(W, H, 12 * s, graine + 2, octaves=3)
    n3 = bruit(W, H, 220 * s, graine + 3, octaves=3)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    x, y = (xx + 0.5) / s, (yy + 0.5) / s
    # route : bord irrégulier, herbe qui mord sur la terre
    bord = DEMI_ROUTE + 1.8 * n2 + 1.2 * n1
    m_route = lisse01(bord + 2.5, bord - 2.5, dr)
    # ornières : deux sillons à ±6 px du milieu, plus un bourrelet central herbeux
    orn = np.exp(-((np.abs(lat) - 6.0) / 1.6) ** 2) * (0.75 + 0.25 * n2)
    m_orn = np.clip(orn, 0, 1) * lisse01(DEMI_ROUTE, DEMI_ROUTE - 4, dr)
    m_crete = np.exp(-(lat / 2.2) ** 2) * 0.45 * (0.6 + 0.4 * n1) * lisse01(DEMI_ROUTE, DEMI_ROUTE - 6, dr)
    # eau et berges : rive irrégulière (anses, avancées de terre), l'axe reste sur le tracé du jeu
    dvb = dv + 2.2 * n1 + 1.2 * n2
    m_eau = lisse01(RIVE + 0.5, RIVE - 1.5, dvb)
    m_prof = lisse01(RIVE - 1, 2, dvb)
    m_berge = lisse01(RIVE + 6 + 2 * n2, RIVE - 0.5, dvb)
    # plaine (ellipse du jeu) et clairières des deux places fortes
    a, b = (x - 500) / 445, (y - 330) / 285
    e = a * a + b * b
    m_foret = lisse01(0.86 + 0.02 + 0.05 * n1, 0.86 + 0.1 + 0.05 * n1, e)
    clair = np.zeros((H, W), dtype=np.float32)
    for (px, py) in (route[0], route[-1]):
        cx, cy = px, py - 48
        q = ((x - cx) / 84) ** 2 + ((y - cy) / 74) ** 2
        clair = np.maximum(clair, lisse01(1.05 + 0.25 * n2, 0.45, q) * np.clip(0.55 + 0.35 * n1, 0, 1))
    m_foret = m_foret * (1 - clair) * lisse01(DEMI_ROUTE + 8, DEMI_ROUTE + 20, dr) * lisse01(RIVE + 2, RIVE + 10, dv)
    # herbe : grandes taches plus sèches / plus grasses, herbe piétinée le long de la route
    m_var = np.clip(0.5 + 0.6 * n3 + 0.25 * n1, 0, 1)
    m_use = lisse01(DEMI_ROUTE + 14, DEMI_ROUTE, dr) * 0.8 + clair * 0.6
    return {
        "route": m_route, "ornieres": m_orn, "crete": m_crete, "eau": m_eau, "prof": m_prof, "berge": m_berge,
        "foret": m_foret, "clairiere": clair, "variation": m_var, "usure": np.clip(m_use, 0, 1),
        "dist_route": dr, "dist_riviere": dv, "dist_riviere_b": dvb, "riviere": riviere, "n1": n1, "n2": n2,
    }


def ecrire_masque(nom, canaux):
    """Écrit 4 canaux 0..1 dans un PNG RGBA du cache (lu par Blender en « Non-Color »)."""
    arr = np.stack([np.clip(c, 0, 1) for c in canaux], axis=-1)
    chemin = os.path.join(C.CACHE, nom + ".png")
    Image.fromarray((arr * 255 + 0.5).astype(np.uint8), "RGBA").save(chemin)
    return chemin


# ---------------------------------------------------------------- sol (relief + matière)
def hauteurs(mq, nx, ny):
    """Relief du sol (m) sur une grille nx × ny : ondulations douces, collines en forêt, lit de la rivière."""
    W, H = TAILLE_MASQUE

    def ech(a):
        return np.array(Image.fromarray(a.astype(np.float32), "F").resize((nx, ny), Image.BILINEAR), dtype=np.float32)
    n1, foret, dv, route = ech(mq["n1"]), ech(mq["foret"]), ech(mq["dist_riviere_b"]), ech(mq["route"])
    clair = ech(mq["clairiere"])
    h = 0.25 * n1 + 1.4 * foret * (0.5 + 0.5 * n1)
    lit = 0.85 * (1 - lisse01(8, RIVE + 3.5, dv))
    h = h * lisse01(RIVE, RIVE + 25, dv) - lit
    h = h * (1 - 0.7 * route) * (1 - 0.6 * clair)
    return h


def sol(mq, nom_masques, graine, nx=400, ny=264):
    """Maillage du sol (100 m × 66 m) avec relief, UV = coordonnées de la carte (0..1)."""
    h = hauteurs(mq, nx + 1, ny + 1)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    vs = []
    for j in range(ny + 1):
        ligne = []
        for i in range(nx + 1):
            ligne.append(bm.verts.new((i / nx * LARG * M, (1 - j / ny) * HAUT * M, float(h[j, i]))))
        vs.append(ligne)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((vs[j + 1][i], vs[j + 1][i + 1], vs[j][i + 1], vs[j][i]))
            f.smooth = True
            for lp, (di, dj) in zip(f.loops, ((0, 1), (1, 1), (1, 0), (0, 0))):
                lp[uv].uv = ((i + di) / nx, 1 - (j + dj) / ny)
    ob = C.objet_maillage("sol", bm, mat_sol(nom_masques))
    return ob, h


def _tex(nt, ident, carte, vecteur, taille, non_couleur=False):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = C.image(C.tex_ph(ident, carte), non_couleur=non_couleur)
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / taille, 1 / taille, 1 / taille)
    nt.links.new(vecteur, mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
    return n


def _mix(nt, fac, a, b, mode="MIX"):
    m = nt.nodes.new("ShaderNodeMix")
    m.data_type = "RGBA"
    m.blend_type = mode
    if isinstance(fac, float):
        C._entree(m, "Factor", "VALUE").default_value = fac
    else:
        nt.links.new(fac, C._entree(m, "Factor", "VALUE"))
    for nom, v in (("A", a), ("B", b)):
        if isinstance(v, tuple):
            C._entree(m, nom, "RGBA").default_value = v
        else:
            nt.links.new(v, C._entree(m, nom, "RGBA"))
    return C._sortie(m, "RGBA")


def _teinte(nt, couleur_in, hsv=(0.5, 1.0, 1.0)):
    n = nt.nodes.new("ShaderNodeHueSaturation")
    n.inputs["Hue"].default_value = hsv[0]
    n.inputs["Saturation"].default_value = hsv[1]
    n.inputs["Value"].default_value = hsv[2]
    nt.links.new(couleur_in, n.inputs["Color"])
    return n.outputs["Color"]


def mat_sol(noms):
    """Matière du sol : herbes mêlées, sol de forêt, terre battue et ornières de la route, berges boueuses.

    Chaque photo est recalée sur une teinte cible (calibrer) : la palette reste maîtrisée d'une carte à l'autre."""
    m, nt, p = C.nouveau_materiau("sol")
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    obj = tc.outputs["Object"]
    masques = []
    for nom in noms:
        im = N("ShaderNodeTexImage")
        im.image = C.image(nom, non_couleur=True)
        im.extension = "EXTEND"
        L(tc.outputs["UV"], im.inputs["Vector"])
        sep = N("ShaderNodeSeparateColor")
        L(im.outputs["Color"], sep.inputs["Color"])
        masques.append({"R": sep.outputs["Red"], "G": sep.outputs["Green"], "B": sep.outputs["Blue"], "A": im.outputs["Alpha"]})
    route, orn, crete, berge = masques[0]["R"], masques[0]["G"], masques[0]["B"], masques[0]["A"]
    foret, clair, var, usure = masques[1]["R"], masques[1]["G"], masques[1]["B"], masques[1]["A"]

    def photo(ident, taille, cible, contraste=1.3, garde=0.2):
        t = _tex(nt, ident, "diff", obj, taille)
        return C.teinter_luminance(nt, t.outputs["Color"], ident, cible, contraste, garde)
    # herbes : prairie d'un vert franc, taches plus grasses et plus sèches
    h1 = photo("aerial_grass_rock", 13.0, PALETTE["herbe"], 1.6, 0.12)
    h2 = photo("leafy_grass", 2.6, PALETTE["herbe_grasse"], 1.5, 0.15)
    h3 = photo("rocky_terrain_02", 24.0, PALETTE["herbe_sombre"], 1.4, 0.2)
    herbe = _mix(nt, var, h1, h2)
    herbe = _mix(nt, 0.25, herbe, h3)
    seche = photo("aerial_grass_rock", 13.0, PALETTE["herbe_seche"], 1.5, 0.15)
    herbe = _mix(nt, usure, herbe, seche)
    # sol de forêt (sombre, un peu vert : sous-bois)
    sf = photo("forest_ground_04", 3.2, PALETTE["sous_bois"])
    coul = _mix(nt, foret, herbe, sf)
    # terre battue (route, abords des places fortes)
    terre = _mix(nt, 0.35, photo("dirt_aerial_02", 9.0, PALETTE["terre"], 1.2, 0.35), photo("brown_mud", 1.8, PALETTE["terre"], 1.3, 0.3))
    boue = photo("brown_mud", 1.8, PALETTE["orniere"])
    terre_orn = _mix(nt, orn, terre, boue)
    terre_orn = _mix(nt, crete, terre_orn, herbe)
    coul = _mix(nt, clair, coul, _mix(nt, 0.55, terre, seche))
    coul = _mix(nt, route, coul, terre_orn)
    # berges : galets et vase humide
    berges = _mix(nt, 0.5, photo("river_small_rocks", 2.4, PALETTE["galets"]), photo("brown_mud", 1.8, PALETTE["vase"]))
    coul = _mix(nt, berge, coul, berges)
    L(coul, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.92
    # relief fin : normales de l'herbe et de la terre, ornières en creux
    nh = _tex(nt, "aerial_grass_rock", "nor_gl", obj, 13.0, non_couleur=True)
    nterre = _tex(nt, "dirt_aerial_02", "nor_gl", obj, 9.0, non_couleur=True)
    nmix = _mix(nt, route, nh.outputs["Color"], nterre.outputs["Color"])
    nm = N("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 1.3
    L(nmix, nm.inputs["Color"])
    bp = N("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.6
    bp.inputs["Distance"].default_value = 0.06
    neg = N("ShaderNodeMath")
    neg.operation = "MULTIPLY"
    neg.inputs[1].default_value = -1.0
    L(orn, neg.inputs[0])
    L(neg.outputs[0], bp.inputs["Height"])
    L(nm.outputs["Normal"], bp.inputs["Normal"])
    L(bp.outputs["Normal"], p.inputs["Normal"])
    return m


def eau(nom_masque, niveau=-0.3):
    """Plan d'eau : teinte selon la profondeur (vase claire au bord, vert sombre au milieu), rides et reflets du ciel."""
    m, nt, p = C.nouveau_materiau("eau")
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    im = N("ShaderNodeTexImage")
    im.image = C.image(nom_masque, non_couleur=True)
    im.extension = "EXTEND"
    L(tc.outputs["UV"], im.inputs["Vector"])
    sep = N("ShaderNodeSeparateColor")
    L(im.outputs["Color"], sep.inputs["Color"])
    prof = sep.outputs["Blue"]
    ramp = N("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.0, C.couleur(PALETTE["eau_bord"])
    els[1].position, els[1].color = 1.0, C.couleur(PALETTE["eau_fond"])
    e = els.new(0.35)
    e.color = C.couleur(PALETTE["eau_milieu"])
    L(prof, ramp.inputs["Fac"])
    # rides allongées dans le sens du courant (d'ouest en est)
    mp = N("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (0.35, 2.2, 1.0)
    L(tc.outputs["Object"], mp.inputs["Vector"])
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 3.0
    nz.inputs["Detail"].default_value = 6.0
    L(mp.outputs["Vector"], nz.inputs["Vector"])
    reflet = N("ShaderNodeMapRange")
    reflet.inputs["From Min"].default_value = 0.55
    reflet.inputs["From Max"].default_value = 0.75
    reflet.inputs["To Min"].default_value = 0.0
    reflet.inputs["To Max"].default_value = 0.12
    L(nz.outputs["Fac"], reflet.inputs["Value"])
    coul = _mix(nt, reflet.outputs["Result"], ramp.outputs["Color"], (0.45, 0.52, 0.5, 1))
    L(coul, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.08
    p.inputs["Specular IOR Level"].default_value = 0.6
    b = N("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.25
    b.inputs["Distance"].default_value = 0.02
    L(nz.outputs["Fac"], b.inputs["Height"])
    L(b.outputs["Normal"], p.inputs["Normal"])
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    co = [(0, 0), (LARG * M, 0), (LARG * M, HAUT * M), (0, HAUT * M)]
    f = bm.faces.new([bm.verts.new((x, y, niveau)) for x, y in co])
    for lp, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = (u, v)
    return C.objet_maillage("eau", bm, m)


# ---------------------------------------------------------------- pont de bois
def pont(nom, x, y, angle, mats, longueur=56, largeur=40, z=0.28):
    """Pont de planches (px logiques) centré sur (x, y), dans l'axe de la route (angle en radians, repère du jeu)."""
    objs = []
    c = monde(x, y)
    # dans Blender, l'axe Y est retourné : l'angle change de signe
    a = -angle
    L, Lg = longueur * M, largeur * M
    rnd = random.Random(int(x * 7 + y))
    n = int(L / 0.32)
    for k in range(n):
        u = -L / 2 + (k + 0.5) * L / n
        o = C.boite(nom + "_pl%d" % k, L / n - 0.035, Lg * rnd.uniform(0.96, 1.0), 0.09, (0, 0, 0), mats["planche"])
        o.location = c + V((math.cos(a) * u, math.sin(a) * u, z + rnd.uniform(-0.015, 0.015)))
        o.rotation_euler = (rnd.uniform(-0.02, 0.02), 0, a + rnd.uniform(-0.03, 0.03))
        objs.append(o)
    for cote in (-1, 1):
        off = V((-math.sin(a), math.cos(a), 0)) * (Lg / 2 - 0.08) * cote
        # longerons, garde-corps, poteaux
        o = C.boite(nom + "_long%d" % cote, L + 0.6, 0.22, 0.28, (0, 0, 0), mats["poutre"])
        o.location = c + off + V((0, 0, z - 0.26))
        o.rotation_euler.z = a
        objs.append(o)
        o = C.boite(nom + "_rampe%d" % cote, L * 0.92, 0.12, 0.12, (0, 0, 0), mats["poutre"])
        o.location = c + off * 1.02 + V((0, 0, z + 0.95))
        o.rotation_euler.z = a
        objs.append(o)
        for k in range(5):
            u = -L * 0.45 + k * L * 0.9 / 4
            o = C.boite(nom + "_pot%d_%d" % (cote, k), 0.16, 0.16, 1.15, (0, 0, 0), mats["poutre"])
            o.location = c + off * 1.02 + V((math.cos(a) * u, math.sin(a) * u, z - 0.05))
            objs.append(o)
        # piles dans l'eau
        for u in (-L * 0.18, L * 0.18):
            o = C.cylindre(nom + "_pile%d_%d" % (cote, int(u * 10)), 0.13, 1.4, (0, 0, 0), mats["poutre"], segments=8)
            o.location = c + off * 0.8 + V((math.cos(a) * u, math.sin(a) * u, -1.1))
            objs.append(o)
    return objs


# ---------------------------------------------------------------- végétation
def charger_modele(ident, nom_collection):
    """Importe un modèle glTF Poly Haven dans une collection cachée (pour l'instancier)."""
    avant = set(bpy.data.objects)
    f = glob.glob(os.path.join(C.SOURCES, ident, "*.gltf"))[0]
    bpy.ops.import_scene.gltf(filepath=f)
    nouveaux = [o for o in bpy.data.objects if o not in avant]
    col = bpy.data.collections.new(nom_collection)
    for o in nouveaux:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
        o.location = (0, 0, 0)
        o.rotation_euler = (0, 0, 0) if o.rotation_mode != "QUATERNION" else o.rotation_euler
    return col


def teinter_feuillage(col, teinte, force=0.35, valeur=1.0):
    """Rapproche les feuillages d'une teinte commune (vert d'été un peu chaud) sans perdre leurs nuances."""
    for o in col.objects:
        for m in o.data.materials if o.type == "MESH" else []:
            if m is None or "leav" not in m.name.lower() and "_leaves" not in m.name:
                continue
            nt = m.node_tree
            p = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
            if p is None or not p.inputs["Base Color"].is_linked:
                continue
            src = p.inputs["Base Color"].links[0].from_socket
            mx = nt.nodes.new("ShaderNodeMix")
            mx.data_type = "RGBA"
            mx.blend_type = "COLOR"
            C._entree(mx, "Factor", "VALUE").default_value = force
            nt.links.new(src, C._entree(mx, "A", "RGBA"))
            C._entree(mx, "B", "RGBA").default_value = C.couleur(teinte)
            hsv = nt.nodes.new("ShaderNodeHueSaturation")
            hsv.inputs["Value"].default_value = valeur
            nt.links.new(C._sortie(mx, "RGBA"), hsv.inputs["Color"])
            nt.links.new(hsv.outputs["Color"], p.inputs["Base Color"])


def instance(col, nom, loc, rot_z, echelle, inclinaison=(0.0, 0.0)):
    e = bpy.data.objects.new(nom, None)
    e.instance_type = "COLLECTION"
    e.instance_collection = col
    e.location = loc
    e.rotation_euler = (inclinaison[0], inclinaison[1], rot_z)
    e.scale = (echelle, echelle, echelle)
    return C.lier(e)


def poisson(zone_ok, espacement, graine, bornes, essais=30, maxi=4000):
    """Points répartis (échantillonnage de Poisson simplifié) dans une zone ; bornes en px logiques."""
    rnd = random.Random(graine)
    x0, y0, x1, y1 = bornes
    cell = espacement / math.sqrt(2)
    grille = {}
    pts = []
    tentatives = 0
    while tentatives < maxi * essais and len(pts) < maxi:
        tentatives += 1
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        if not zone_ok(x, y):
            continue
        gx, gy = int(x / cell), int(y / cell)
        ok = True
        for i in range(gx - 2, gx + 3):
            for j in range(gy - 2, gy + 3):
                q = grille.get((i, j))
                if q and (q[0] - x) ** 2 + (q[1] - y) ** 2 < espacement ** 2:
                    ok = False
                    break
            if not ok:
                break
        if ok:
            grille[(gx, gy)] = (x, y)
            pts.append((x, y))
    return pts


def vegetation(carte, mq, h_sol, graine):
    """Forêt dense hors de la plaine, quelques arbres isolés, buissons et rochers dans la plaine."""
    W, H = TAILLE_MASQUE
    s = W / LARG
    foret = mq["foret"]
    dr, dv = mq["dist_route"], mq["dist_riviere"]
    rnd = random.Random(graine)
    arbre_a = charger_modele("tree_small_02", "arbre_a")
    arbre_b = charger_modele("island_tree_02", "arbre_b")
    rochers = charger_modele("rock_moss_set_01", "rochers")
    for col in (arbre_a, arbre_b):
        teinter_feuillage(col, "#4f6b2a", force=0.3, valeur=0.92)
    ny, nx = h_sol.shape

    def z_sol(x, y):
        i = min(nx - 1, max(0, int(x / LARG * (nx - 1))))
        j = min(ny - 1, max(0, int(y / HAUT * (ny - 1))))
        return float(h_sol[j, i])

    def mval(arr, x, y):
        i = min(W - 1, max(0, int(x * s)))
        j = min(H - 1, max(0, int(y * s)))
        return float(arr[j, i])

    def hors_cadre(x, y):
        return x < 0 or y < 0 or x >= LARG or y >= HAUT

    def zone_foret(x, y):
        if hors_cadre(x, y):
            # au-delà du bord : forêt partout, sauf dans l'axe des places fortes
            return all(math.hypot(x - p[0], y - p[1] + 40) > 105 for p in (carte["route"][0], carte["route"][-1]))
        return mval(foret, x, y) > 0.5 + 0.2 * rnd.random()

    pts = poisson(zone_foret, 27, graine + 11, (-40, -40, LARG + 40, HAUT + 40))
    n = 0
    for (x, y) in pts:
        b = rnd.random() < 0.38
        col = arbre_b if b else arbre_a
        e = rnd.uniform(1.25, 1.75) if not b else rnd.uniform(1.05, 1.4)
        z = z_sol(min(LARG - 1, max(0, x)), min(HAUT - 1, max(0, y)))
        instance(col, "arbre%d" % n, monde(x, y, z - 0.05), rnd.uniform(0, 6.283), e, (rnd.uniform(-0.06, 0.06), rnd.uniform(-0.06, 0.06)))
        n += 1
    # sous-bois : buissons sous les arbres, pour fermer la canopée
    for k, (x, y) in enumerate(poisson(zone_foret, 19, graine + 16, (-20, -20, LARG + 20, HAUT + 20), maxi=1600)):
        z = z_sol(min(LARG - 1, max(0, x)), min(HAUT - 1, max(0, y)))
        instance(arbre_b, "sousbois%d" % k, monde(x, y, z - 0.05), rnd.uniform(0, 6.283), rnd.uniform(0.4, 0.62))
    # lisière : buissons bas entre la plaine et la forêt
    exclus = [tuple(p) for p in carte["emplacements"] + carte["emplacementsRivaux"]]

    def libre(x, y, marge_route=30, marge_emp=46, marge_eau=RIVE + 7):
        if hors_cadre(x, y):
            return False
        if mval(dr, x, y) < marge_route or mval(dv, x, y) < marge_eau or mval(mq["clairiere"], x, y) > 0.2:
            return False
        return all(math.hypot(x - ex, y - ey) > marge_emp for ex, ey in exclus)

    def lisiere(x, y):
        f = mval(foret, x, y) if not hors_cadre(x, y) else 1
        return 0.08 < f < 0.6 and libre(x, y)

    for k, (x, y) in enumerate(poisson(lisiere, 20, graine + 12, (0, 0, LARG, HAUT), maxi=160)):
        instance(arbre_b, "buisson%d" % k, monde(x, y, z_sol(x, y) - 0.05), rnd.uniform(0, 6.283), rnd.uniform(0.32, 0.5))
    # berges : touffes et petits arbres le long de l'eau (loin des ponts, de la route et des emplacements)
    def berge(x, y):
        return (not hors_cadre(x, y)) and RIVE + 3 < mval(dv, x, y) < RIVE + 14 and libre(x, y, 34, 50, RIVE + 3)
    for k, (x, y) in enumerate(poisson(berge, 26, graine + 17, (0, 0, LARG, HAUT), maxi=26)):
        instance(arbre_b, "rive%d" % k, monde(x, y, z_sol(x, y) - 0.05), rnd.uniform(0, 6.283), rnd.uniform(0.28, 0.55))
    # dans la plaine : quelques arbres isolés, buissons et rochers, jamais près des emplacements ni de la route
    def plaine(x, y):
        return (not hors_cadre(x, y)) and mval(foret, x, y) < 0.05 and libre(x, y, 36, 52)

    isoles = poisson(plaine, 130, graine + 13, (0, 0, LARG, HAUT), maxi=5)
    for k, (x, y) in enumerate(isoles):
        instance(arbre_a if k % 2 else arbre_b, "isole%d" % k, monde(x, y, z_sol(x, y) - 0.05), rnd.uniform(0, 6.283), rnd.uniform(0.9, 1.2))
    for k, (x, y) in enumerate(poisson(plaine, 70, graine + 14, (0, 0, LARG, HAUT), maxi=12)):
        instance(arbre_b, "touffe%d" % k, monde(x, y, z_sol(x, y) - 0.05), rnd.uniform(0, 6.283), rnd.uniform(0.25, 0.4))
    for k, (x, y) in enumerate(poisson(lambda x, y: plaine(x, y) or (not hors_cadre(x, y) and 0.2 < mval(foret, x, y) < 0.7),
                                       90, graine + 15, (0, 0, LARG, HAUT), maxi=7)):
        instance(rochers, "rocher%d" % k, monde(x, y, z_sol(x, y) - 0.25), rnd.uniform(0, 6.283), rnd.uniform(0.12, 0.2))
    C.journal("végétation : %d arbres, %d isolés" % (n, len(isoles)))


# ---------------------------------------------------------------- rendu d'une carte
def rendre_terrain(id_carte, essai=False, sortie=None, echantillons=48, zone=None):
    """Rend une carte. essai : taille logique (1000 × 660) ; zone (x0, y0, x1, y1 en px logiques) : seulement ce
    morceau, à la résolution finale (contrôle du détail et du poids JPEG sans tout rendre)."""
    cartes = lire_cartes()
    carte = cartes[id_carte]
    graine = C.graine("terrain-" + id_carte)
    mq = masques(carte, graine)
    m1 = ecrire_masque("masque-%s-1" % id_carte, [mq["route"], mq["ornieres"], mq["crete"], mq["berge"]])
    m2 = ecrire_masque("masque-%s-2" % id_carte, [mq["foret"], mq["clairiere"], mq["variation"], mq["usure"]])
    m3 = ecrire_masque("masque-%s-3" % id_carte, [mq["eau"], mq["eau"], mq["prof"], np.ones_like(mq["eau"])])
    C.reinitialiser()
    C.installer_lumiere()
    ob_sol, h = sol(mq, [m1, m2], graine)
    eau(m3)
    mats = {"planche": C.mat_ph("planche", "weathered_planks", echelle_m=2.0, valeur=0.95, bosse=0.4),
            "poutre": C.mat_ph("poutre", "medieval_wood", echelle_m=1.5, valeur=0.6, bosse=0.4)}
    for k, (x, y, a) in enumerate(intersections(carte["route"], mq["riviere"])):
        pont("pont%d" % k, x, y, a, mats)
    vegetation(carte, mq, h, graine)
    W, H = (LARG, HAUT) if essai else (LARG * C.ECHELLE, HAUT * C.ECHELLE)
    C.camera_dessus(LARG * M / 2, HAUT * M / 2, LARG * M, HAUT * M)
    C.reglages_rendu(W, H, echantillons=echantillons, transparent=False, filtre=1.0, exposition=-0.25)
    bpy.context.scene.cycles.transparent_max_bounces = 16
    if zone:
        r = bpy.context.scene.render
        r.use_border = True
        r.use_crop_to_border = True
        r.border_min_x, r.border_max_x = zone[0] / LARG, zone[2] / LARG
        r.border_min_y, r.border_max_y = 1 - zone[3] / HAUT, 1 - zone[1] / HAUT
        tmp = os.path.join(C.CACHE, "_rendu", "terrain-%s-zone.png" % id_carte)
        img = C.rendre(tmp).convert("RGB")
        chemin = sortie or os.path.join(C.CACHE, "terrain-%s-zone.jpg" % id_carte)
        C.sauver_jpg(img, chemin, qualite=80, max_ko=4000)
        return chemin
    tmp = os.path.join(C.CACHE, "_rendu", "terrain-%s%s.png" % (id_carte, "-essai" if essai else ""))
    img = C.rendre(tmp).convert("RGB")
    if essai:
        chemin = sortie or os.path.join(C.CACHE, "terrain-%s-essai.jpg" % id_carte)
        C.sauver_jpg(img, chemin, qualite=88, max_ko=2000)
        return chemin
    chemin, src = C.chemin_td("terrain-%s.jpg" % id_carte)
    C.sauver_jpg(img, chemin, qualite=80, max_ko=450)
    C.maj_manifeste({"terrain-" + id_carte: C.entree(src, LARG, HAUT, 0, 0)})
    return chemin


def main(args):
    essai = "--essai" in args
    args = [a for a in args if a != "--essai"]
    sortie = None
    zone = None
    if "--zone" in args:
        i = args.index("--zone")
        zone = [float(v) for v in args[i + 1].split(",")]
        args = args[:i] + args[i + 2:]
    if "--sortie" in args:
        i = args.index("--sortie")
        sortie = args[i + 1]
        args = args[:i] + args[i + 2:]
    for id_carte in (args or list(lire_cartes())):
        rendre_terrain(id_carte, essai=essai, sortie=sortie, zone=zone)


if __name__ == "__main__":
    main(sys.argv[1:])
