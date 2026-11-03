# -*- coding: utf-8 -*-
"""Décors propres à chaque terrain de bataille (importé par terrains.py).

Chaque carte garde son tracé (route, emplacements, places fortes), mais reçoit un décor qui lui est propre, pour que
le nom du lieu se lise sur le terrain :
  domaine  : la prairie et la forêt d'origine ;
  gue      : une des traversées se fait à gué, sur des galets, sans pont ; ruisseau plus large ;
  foret    : le sous-bois mange la clairière, de grands arbres isolés dans la prairie ;
  moulin   : un moulin à eau au bord du ruisseau, des champs en lanières bordés de haies ;
  col      : relief qui monte autour d'une clairière plus étroite (versant nord à l'ombre), éboulis et affleurements
             rocheux, pins ;
  chateau  : champs cultivés et haies autour de la forteresse, fossé sec et levée de terre au pied de ses murs.
Variantes « -sud » (front de l'Empire omeyyade) : herbe jaunie, sol ocre, piste plus claire et caillouteuse ;
chênes verts, pins et cyprès au lieu des chênes et des hêtres ; oliviers en rangs (Oliveraies), rochers et maquis
(Piémont), fleuve large de 40 px (Grand Fleuve).

Les modèles faits ici (moulin, pins et sapins, cyprès) sont modélisés par programme (CC0) ; les autres viennent de Poly
Haven (CC0).
"""
import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import commun as C
from mathutils import Vector

LARG, HAUT = 1000, 660

# Palette du front du sud (teintes moyennes visées, sRGB) : herbe jaunie de fin d'été (paille olive), sol ocre, piste
# claire et caillouteuse (L* d'environ 76 contre environ 49 pour l'herbe : écart ≥ 15 contrôlé par verifier.py).
PALETTE_SUD = {
    "herbe": "#7d7442", "herbe_grasse": "#69703c", "herbe_sombre": "#6a613a", "herbe_seche": "#958656",
    "pietinee": "#8a7e52", "sous_bois": "#4d4229", "bas_cote": "#6e683c",
    "terre": "#d0bc98", "terre_claire": "#dccaa8", "terre_tassee": "#b49e7c", "poussiere": "#d8c9a8",
    "terre_humide": "#9b8566", "orniere": "#8f7b60", "galets": "#a69e89", "banc": "#9d937b",
    "vase": "#5e5440", "flaque": "#7a7c70", "flaque_bord": "#4a4130", "paves": "#a39a8a",
    "eau_bord": "#5d5c3e", "eau_milieu": "#25372f", "eau_fond": "#1d2c26", "remous": "#9a9a80",
    "ciel_reflet": "#93a6aa",
}

# Couleurs des cultures et des abords (vert / sud).
CULTURES = {
    "vert": {"labour": "#7a644a", "ble": "#b39b5a", "pre": "#5f7330", "talus": "#4c5a2a", "fosse": "#3f4d24",
             "levee": "#8a7a58", "roche": "#7c776b", "oliveraie": "#9c8862"},
    "sud": {"labour": "#94785a", "ble": "#c4ab6c", "pre": "#78803f", "talus": "#6f6a3e", "fosse": "#5f5a38",
            "levee": "#ad9878", "roche": "#9a8d74", "oliveraie": "#a88e66"},
}

# Champs et oliveraies : polygones (px logiques) ; tout ce qui tombe près de la route, d'un emplacement de tour, de
# l'eau ou d'une place forte est rendu à l'herbe par terrains.py.
CHAMPS_MOULIN = [[(560, -20), (1020, -20), (1020, 205), (930, 215), (860, 205), (790, 175), (700, 150), (610, 140),
                  (560, 110)],
                 [(-20, 440), (110, 430), (175, 480), (215, 560), (230, 680), (-20, 680)]]
CHAMPS_CHATEAU = [[(370, -20), (800, -20), (790, 95), (700, 118), (600, 112), (500, 110), (400, 100)],
                  [(480, 580), (700, 560), (900, 570), (1020, 600), (1020, 680), (480, 680)],
                  [(-20, -20), (300, -20), (290, 90), (220, 120), (130, 160), (40, 200), (-20, 210)]]
OLIVERAIES_MOULIN = CHAMPS_MOULIN + [[(440, 575), (720, 560), (760, 680), (440, 680)]]

THEMES = {
    "domaine": {},
    "gue": {"gue": True},
    "foret": {"plaine": (418, 262), "lisiere": 0.5, "seuil_foret": (0.6, 0.74), "isoles": 8, "sous_bois_dense": True},
    "moulin": {"moulin": 744, "champs": {"angle": -14.0, "zones": CHAMPS_MOULIN}, "haies": True},
    "col": {"plaine": (405, 232), "lisiere": 0.32, "relief": (10.0, 2.5), "rochers": 46, "affleurements": 14,
            "essence": "pins"},
    "chateau": {"champs": {"angle": 6.0, "zones": CHAMPS_CHATEAU}, "haies": True, "fosse": True},
    "gue-sud": {"climat": "sud", "rive": 20.0, "cypres": 10},
    "foret-sud": {"climat": "sud", "plaine": (418, 262), "lisiere": 0.5, "seuil_foret": (0.62, 0.76), "isoles": 6,
                  "sous_bois_dense": True,
                  "essence": "pins_sud"},
    "moulin-sud": {"climat": "sud", "moulin": 744, "oliveraies": {"angle": -14.0, "zones": OLIVERAIES_MOULIN}},
    "col-sud": {"climat": "sud", "plaine": (405, 232), "lisiere": 0.32, "relief": (9.0, 2.5), "rochers": 60,
                "affleurements": 15, "maquis": 40},
    "chateau-sud": {"climat": "sud", "champs": {"angle": 6.0, "zones": CHAMPS_CHATEAU[:2]},
                    "oliveraies": {"angle": 6.0, "zones": CHAMPS_CHATEAU[2:]}, "fosse": True, "cypres": 12},
}


def theme(id_terrain):
    """(identifiant de la carte du jeu, décor) pour un terrain : « col-sud » → ("col", décor du Piémont)."""
    base = id_terrain[:-4] if id_terrain.endswith("-sud") else id_terrain
    t = dict(THEMES.get(id_terrain, {}))
    t.setdefault("climat", "vert")
    return base, t


def palette(t, defaut):
    return PALETTE_SUD if t.get("climat") == "sud" else defaut


# ---------------------------------------------------------------- masques (numpy, grille 2000 × 1320)
def masque_polygones(polys, W, H, flou_px=0.0):
    """Masque 0..1 de l'union de polygones (px logiques), adouci de flou_px (px logiques)."""
    s = W / LARG
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)
    for p in polys:
        d.polygon([(x * s, y * s) for x, y in p], fill=255)
    if flou_px > 0:
        im = im.filter(ImageFilter.GaussianBlur(flou_px * s))
    return np.array(im, dtype=np.float32) / 255.0


def lanieres(x, y, angle_deg, graine, largeur=(26.0, 44.0)):
    """Champs en lanières : numéro de lanière et coordonnée en travers, pour un angle donné (lanières parallèles à
    cet angle). Renvoie (numéro, distance au bord le plus proche de la lanière, culture 0..2 par lanière)."""
    a = math.radians(angle_deg)
    v = -x * math.sin(a) + y * math.cos(a)          # coordonnée en travers des lanières
    rnd = random.Random(graine)
    bords = [-1200.0]
    while bords[-1] < 1400:
        bords.append(bords[-1] + rnd.uniform(*largeur))
    bords = np.array(bords, dtype=np.float32)
    k = np.clip(np.searchsorted(bords, v) - 1, 0, len(bords) - 2)
    d_bord = np.minimum(v - bords[k], bords[k + 1] - v)
    cultures = np.array([rnd.choices((0, 1, 2), (0.38, 0.38, 0.24))[0] for _ in range(len(bords))], dtype=np.int32)
    return k, d_bord, cultures[k]


def contour_points(poly, pas):
    """Points régulièrement espacés le long du contour fermé d'un polygone."""
    res = []
    for i in range(len(poly)):
        (ax, ay), (bx, by) = poly[i], poly[(i + 1) % len(poly)]
        L = math.hypot(bx - ax, by - ay)
        n = max(1, int(L / pas))
        for k in range(n):
            t = k / n
            res.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    return res


def dans_polygone(x, y, poly):
    dedans = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-9) + xi:
            dedans = not dedans
        j = i
    return dedans


def grille_rangs(poly, angle_deg, pas, graine, jitter=3.0):
    """Points d'une plantation en rangs (oliviers) dans un polygone, rangs orientés selon l'angle."""
    rnd = random.Random(graine)
    a = math.radians(angle_deg)
    ca, sa = math.cos(a), math.sin(a)
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    R = math.hypot(max(xs) - min(xs), max(ys) - min(ys))
    res = []
    n = int(R / pas) + 2
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            u, v = i * pas + (pas / 2 if j % 2 else 0), j * pas * 0.92
            x = cx + u * ca - v * sa + rnd.uniform(-jitter, jitter)
            y = cy + u * sa + v * ca + rnd.uniform(-jitter, jitter)
            if dans_polygone(x, y, poly):
                res.append((x, y))
    return res


def place_moulin(x_vise, riviere, rive_px):
    """Position du moulin : maison sur la rive nord du ruisseau, au point du cours le plus proche de x_vise, roue
    dans l'eau. Renvoie un dict (px logiques) : centre de la maison, angle du cours (radians, repère du jeu), normale
    vers la maison, centre de la roue."""
    best = None
    for i in range(1, len(riviere)):
        (ax, ay), (bx, by) = riviere[i - 1], riviere[i]
        if min(ax, bx) <= x_vise <= max(ax, bx) and bx != ax:
            t = (x_vise - ax) / (bx - ax)
            best = (ax + t * (bx - ax), ay + t * (by - ay), math.atan2(by - ay, bx - ax))
            break
    if best is None:
        best = (x_vise, riviere[len(riviere) // 2][1], 0.0)
    px, py, a = best
    nx, ny = math.sin(a), -math.cos(a)          # normale vers le nord (y vers le haut de l'écran)
    if ny > 0:
        nx, ny = -nx, -ny
    prof = 46.0                                  # profondeur de la maison (px) ; longueur 66 px
    d_maison = rive_px + 15 + prof / 2           # la roue se voit entre le mur et l'eau
    hx, hy = px + nx * d_maison, py + ny * d_maison
    rx, ry = px + nx * (rive_px - 1), py + ny * (rive_px - 1)
    return {"x": hx, "y": hy, "angle": a, "nx": nx, "ny": ny, "roue": (rx, ry), "long": 66.0, "prof": prof,
            "porte": (hx + nx * (prof / 2 + 4), hy + ny * (prof / 2 + 4))}


def masque_moulin(m, x, y, marge):
    """Emprise du moulin (maison et roue) avec une marge (px logiques), sur les grilles x, y (px logiques)."""
    ca, sa = math.cos(m["angle"]), math.sin(m["angle"])
    res = np.zeros_like(x)
    for (cx, cy, L, P) in ((m["x"], m["y"], m["long"], m["prof"]), (m["roue"][0], m["roue"][1], 40.0, 14.0)):
        u = (x - cx) * ca + (y - cy) * sa
        v = -(x - cx) * sa + (y - cy) * ca
        res = np.maximum(res, ((np.abs(u) <= L / 2 + marge) & (np.abs(v) <= P / 2 + marge)).astype(np.float32))
    return res


# ---------------------------------------------------------------- objets Blender
def _monde(x, y, z=0.0):
    from mathutils import Vector
    return Vector((x * 0.1, (HAUT - y) * 0.1, z))


def construire_moulin(m, climat, z_sol):
    """Moulin à eau : maison de pierre (6,6 × 4,6 m) au toit à deux pans (ardoise au nord, tuiles au sud), roue à aubes
    de 4 m dont les aubes du bas trempent dans le courant, appentis de planches. Repère du jeu en entrée (px logiques)."""
    import bpy
    import bmesh
    import places as P
    objs = []
    sud = climat == "sud"
    mur = C.mat_ph("moulin_mur", "clay_plaster" if sud else "rustic_stone_wall", echelle_m=1.6,
                   cible="#c9b28e" if sud else "#9a907c", contraste=1.15, bosse=0.4, occlusion=0.3)
    toit = C.mat_toit("moulin_toit", "clay_roof_tiles" if sud else "roof_slates_02", "#a0674c" if sud else "#5e646b",
                      rang_m=0.3 if sud else 0.26)
    bois = C.mat_ph("moulin_bois", "medieval_wood", echelle_m=1.4, cible="#5e4a34", contraste=1.2, bosse=0.4)
    bois_clair = C.mat_ph("moulin_bois_c", "weathered_planks", echelle_m=2.0, cible="#8a7458", contraste=1.15, bosse=0.3)
    L, Pf = m["long"] * 0.1, m["prof"] * 0.1
    z0 = z_sol(m["x"], m["y"])
    rz = -m["angle"]
    centre = _monde(m["x"], m["y"], z0)
    # maison : murs, toit à deux pans (faîtage le long du cours), cheminée
    parts = [C.boite("moulin_corps", L, Pf, 3.4, (0, 0, 0), mur)]
    parts.append(P.toit_deux_pans("moulin_toit", -L / 2, L / 2, -Pf / 2, Pf / 2, 3.4, 2.1, toit, debord=0.4))
    parts.append(C.boite("moulin_chem", 0.7, 0.7, 1.6, (L * 0.3, Pf * 0.18, 4.4), mur))
    # appentis de planches du côté de la route
    parts.append(C.boite("moulin_appentis", 2.2, 1.6, 2.2, (-L / 2 - 1.0, -0.6, 0), bois_clair))
    parts.append(P.toit_deux_pans("moulin_toit_app", -L / 2 - 2.1, -L / 2 + 0.1, -1.4, 0.2, 2.2, 0.6, toit, debord=0.2))
    piv = bpy.data.objects.new("moulin", None)
    C.lier(piv)
    for o in parts:
        o.parent = piv
    piv.location = centre
    piv.rotation_euler.z = rz
    objs.append(piv)
    # roue à aubes : jante double, rayons, 16 aubes ; son axe va de la maison vers le ruisseau
    rx, ry = m["roue"]
    zr = -0.6                                        # roue en dessous : les aubes du bas trempent dans le courant
    R = 2.0
    roue = bpy.data.objects.new("moulin_roue", None)
    C.lier(roue)
    morceaux = []
    for cote in (-0.45, 0.45):
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=False, radius=R, segments=32)
        ob = C.objet_maillage("roue_jante%.0f" % (cote * 10), bm, bois)
        ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.14
        ob.rotation_euler = (math.pi / 2, 0, 0)
        ob.location = (0, cote, 0)
        morceaux.append(ob)
        # rayons
        for k in range(8):
            a = k * math.pi / 8
            r = C.boite("roue_rayon%d_%.0f" % (k, cote * 10), 2 * R, 0.1, 0.1, (0, cote, 0), bois, base=False)
            r.rotation_euler = (0, a, 0)
            morceaux.append(r)
    for k in range(16):
        a = k * 2 * math.pi / 16
        au = C.boite("roue_aube%d" % k, 0.5, 1.05, 0.06, (R * math.cos(a), 0, R * math.sin(a)), bois_clair, base=False)
        au.rotation_euler = (0, -a, 0)
        morceaux.append(au)
    axe = C.cylindre("roue_axe", 0.12, 2.4, (0, -0.8, 0), bois, segments=10)
    axe.rotation_euler = (-math.pi / 2, 0, 0)
    morceaux.append(axe)
    for o in morceaux:
        o.parent = roue
    roue.location = _monde(rx, ry, zr + R)
    # le plan de la roue suit le courant : l'axe local Y (axe de la roue) pointe vers la maison
    roue.rotation_euler.z = rz
    objs.append(roue)
    return objs


def mat_aiguilles(nom, teinte, valeur=1.0):
    """Feuillage de conifère : vert sombre bleuté, grain d'aiguilles (bruit fin en relief), touffes plus claires. La
    couleur est multipliée par l'attribut « clarte » des sommets (cœur sombre, bouts des branches et haut plus clairs)
    quand le maillage en porte un."""
    m, nt, p = C.nouveau_materiau(nom)
    N, Lk = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 3.0
    nz.inputs["Detail"].default_value = 8.0
    Lk(tc.outputs["Object"], nz.inputs["Vector"])
    ramp = N("ShaderNodeValToRGB")
    c0 = C.couleur(teinte)
    ramp.color_ramp.elements[0].color = tuple(min(1, v * 0.85 * valeur) for v in c0[:3]) + (1,)
    ramp.color_ramp.elements[1].color = tuple(min(1, v * 1.9 * valeur) for v in c0[:3]) + (1,)
    Lk(nz.outputs["Factor"], ramp.inputs["Factor"])
    attr = N("ShaderNodeAttribute")
    attr.attribute_name = "clarte"
    mx = N("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = "MULTIPLY"
    C._entree(mx, "Factor", "VALUE").default_value = 1.0
    Lk(ramp.outputs["Color"], C._entree(mx, "A", "RGBA"))
    Lk(attr.outputs["Color"], C._entree(mx, "B", "RGBA"))
    Lk(C._sortie(mx, "RGBA"), p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.85
    p.inputs["Specular IOR Level"].default_value = 0.25
    fin = N("ShaderNodeTexNoise")
    fin.inputs["Scale"].default_value = 60.0
    fin.inputs["Detail"].default_value = 4.0
    Lk(tc.outputs["Object"], fin.inputs["Vector"])
    b = N("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.9
    b.inputs["Distance"].default_value = 0.08
    Lk(fin.outputs["Factor"], b.inputs["Height"])
    Lk(b.outputs["Normal"], p.inputs["Normal"])
    return m


def collection_pin(nom, teinte="#2b3a26", graine=3, hauteur=8.5, rayon=2.0, etages=16):
    """Conifère de montagne (sapin, pin) modélisé ici (CC0) : tronc, cœur conique plein et bosselé, 16 étages de
    branches courtes et denses, chacune faite de trois touffes d'aiguilles bosselées qui retombent un peu au bout, étages
    décalés de l'angle d'or (aucun couloir vide d'un étage à l'autre), flèche fine au sommet. Vu de dessus : une rosette
    sombre et ronde, à bord festonné, plus claire au bout des branches (attribut « clarte » lu par la matière), et non
    plus une étoile de lames ; son ombre portée dessine le cône."""
    import bpy
    import bmesh
    from mathutils import Matrix, noise
    col = bpy.data.collections.new(nom)
    rnd = random.Random(graine)
    ecorce = C.mat_simple(nom + "_ecorce", "#4b3a2a", rugosite=0.9)
    aig = mat_aiguilles(nom + "_aig", teinte)
    tronc = C.cylindre(nom + "_tronc", 0.17, hauteur * 0.9, (0, 0, 0), ecorce, segments=8, rayon_haut=0.04)
    for c in list(tronc.users_collection):
        c.objects.unlink(tronc)
    col.objects.link(tronc)
    bm = bmesh.new()
    clarte = bm.loops.layers.color.new("clarte")
    h0 = hauteur * 0.16

    def touffe(cx, cy, cz, r, ax, etire, plat, lum):
        """Une touffe : icosphère bosselée, étirée le long de la branche (angle ax), aplatie."""
        res = bmesh.ops.create_icosphere(bm, subdivisions=2 if r > 0.32 else 1, radius=r)
        vs = res["verts"]
        dec = Vector((rnd.uniform(0, 80), rnd.uniform(0, 80), rnd.uniform(0, 80)))
        ca, sa = math.cos(ax), math.sin(ax)
        for v in vs:
            x, y, z = v.co
            x, y, z = x * etire, y, z * plat
            v.co = Vector((cx + x * ca - y * sa, cy + x * sa + y * ca, cz + z))
            v.co += (v.co - Vector((cx, cy, cz))) * 0.2 * noise.noise(v.co * (2.4 / max(r, 0.1)) + dec)
        faces = {f for v in vs for f in v.link_faces}
        for f in faces:
            f.smooth = True
            for lp in f.loops:
                k = lum * rnd.uniform(0.92, 1.08)
                lp[clarte] = (k, k, k, 1.0)

    # cœur conique plein (pas de trou au milieu de la rosette)
    res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=True, segments=14, radius1=rayon * 0.5, radius2=0.05,
                                depth=hauteur - h0 - 0.3)
    dec = Vector((rnd.uniform(0, 50), rnd.uniform(0, 50), 0))
    for v in res["verts"]:
        v.co.z += h0 + (hauteur - h0 - 0.3) / 2
        v.co.x *= 1 + 0.25 * noise.noise(v.co * 1.3 + dec)
        v.co.y *= 1 + 0.25 * noise.noise(v.co * 1.3 + dec + Vector((7, 3, 1)))
    for f in {f for v in res["verts"] for f in v.link_faces}:
        f.smooth = True
        for lp in f.loops:
            lp[clarte] = (0.6, 0.6, 0.6, 1.0)
    angle0 = rnd.uniform(0, math.pi)
    for k in range(etages):
        t = k / (etages - 1)
        z0 = h0 + (hauteur - h0 - 0.9) * t + rnd.uniform(-0.06, 0.06)
        L = rayon * (1 - t) ** 0.92 * rnd.uniform(0.92, 1.05) + 0.3
        n = 6 + int(round(8 * (1 - t)))
        for j in range(n):
            a = angle0 + k * 2.39996 + j * 2 * math.pi / n + rnd.uniform(-0.18, 0.18)
            Lb = L * rnd.uniform(0.85, 1.1)
            for f_, taille, lum in ((0.3, 1.0, 0.72), (0.53, 0.95, 0.85), (0.77, 0.88, 1.0), (1.0, 0.75, 1.2)):
                rr = Lb * f_
                r_t = (0.2 + 0.15 * (1 - t)) * (rayon / 2.0) * taille * rnd.uniform(0.85, 1.15)
                tombe = 0.16 * Lb * f_ * f_
                touffe(rr * math.cos(a), rr * math.sin(a), z0 - tombe, r_t, a, 1.75, 0.55,
                       lum * (0.9 + 0.2 * t))
    # flèche au sommet
    for k in range(3):
        touffe(rnd.uniform(-0.04, 0.04), rnd.uniform(-0.04, 0.04), hauteur - 0.75 + k * 0.32, 0.2 - k * 0.05,
               rnd.uniform(0, 3), 1.0, 1.4, 1.15)
    me = bpy.data.meshes.new(nom + "_branches")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(aig)
    ob = bpy.data.objects.new(nom + "_branches", me)
    col.objects.link(ob)
    return col


def collection_cypres(nom, teinte="#2e3d24", graine=5, hauteur=10.0, rayon=1.4):
    """Cyprès de Provence modélisé ici (CC0) : fuseau dense et sombre (le plus large au tiers de la hauteur, pointe
    effilée), fait d'un cœur plein et de touffes d'aiguilles bosselées serrées sur sa surface. Vu de dessus : une rosette
    ronde et sombre de 25 à 35 px, plus claire du côté du soleil ; son ombre portée est un long fuseau large, et non un
    bâton. (Le feuillu tree_small_02 étiré, utilisé avant, restait un tronc maigre aux branches clairsemées.)"""
    import bpy
    import bmesh
    from mathutils import noise
    col = bpy.data.collections.new(nom)
    rnd = random.Random(graine)
    aig = mat_aiguilles(nom + "_aig", teinte)
    bm = bmesh.new()
    clarte = bm.loops.layers.color.new("clarte")
    z0 = 0.4

    def profil(t):
        """Rayon du fuseau à la hauteur relative t (0 en bas du feuillage, 1 à la pointe)."""
        return rayon * (math.sin(math.pi * min(1.0, t * 1.45)) if t < 0.345 else (1 - (t - 0.345) / 0.655) ** 0.85)
    # cœur plein
    anneaux = []
    for k in range(13):
        t = k / 12
        r = max(0.04, 0.82 * profil(t))
        z = z0 + (hauteur - z0) * t
        anneaux.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for a in
                        [i * 2 * math.pi / 12 for i in range(12)]])
    for k in range(12):
        for i in range(12):
            f = bm.faces.new((anneaux[k][i], anneaux[k][(i + 1) % 12], anneaux[k + 1][(i + 1) % 12], anneaux[k + 1][i]))
            f.smooth = True
            for lp in f.loops:
                lp[clarte] = (0.62, 0.62, 0.62, 1.0)
    # touffes sur la surface
    for k in range(170):
        t = rnd.random() ** 0.9
        a = rnd.uniform(0, 2 * math.pi)
        r = profil(t) * rnd.uniform(0.78, 1.02)
        z = z0 + (hauteur - z0) * t
        r_t = (0.26 + 0.16 * (1 - t)) * (rayon / 1.4) * rnd.uniform(0.85, 1.15)
        res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r_t)
        dec = Vector((rnd.uniform(0, 80), rnd.uniform(0, 80), rnd.uniform(0, 80)))
        cx, cy = r * math.cos(a), r * math.sin(a)
        for v in res["verts"]:
            x, y, zz = v.co
            v.co = Vector((cx + x, cy + y, z + zz * 1.5))
            v.co += (v.co - Vector((cx, cy, z))) * 0.2 * noise.noise(v.co * (2.4 / r_t) + dec)
        lum = (0.82 + 0.3 * t) * rnd.uniform(0.92, 1.08)
        for f in {f for v in res["verts"] for f in v.link_faces}:
            f.smooth = True
            for lp in f.loops:
                lp[clarte] = (lum, lum, lum, 1.0)
    me = bpy.data.meshes.new(nom + "_feuillage")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(aig)
    ob = bpy.data.objects.new(nom + "_feuillage", me)
    col.objects.link(ob)
    ecorce = C.mat_simple(nom + "_ecorce", "#4b3a2a", rugosite=0.9)
    tronc = C.cylindre(nom + "_tronc", 0.14, 1.2, (0, 0, 0), ecorce, segments=8)
    for c in list(tronc.users_collection):
        c.objects.unlink(tronc)
    col.objects.link(tronc)
    return col
