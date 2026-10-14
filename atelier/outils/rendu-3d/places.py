# -*- coding: utf-8 -*-
"""Places fortes des deux bouts de la route : château de France, château anglais, forteresse omeyyade.

Usage : python3 atelier/outils/rendu-3d/places.py [camp ...] [--etats intact,abime,ruine] [--fumees]
  --fumees : sans rendu, seulement les points de fumée (champ « fumees » du manifeste)
Sorties : jeu/assets/images/td/place-<camp>-<etat>.png, 150 × 150 px logiques (rendu 300 × 300), et leur ombre
portée ombre-place-<camp>-<etat>.png (passe « sol », même point d'ancrage).

Implantation (décision « solution B », voir le compte rendu) : places fortes compactes (3,9 px/m, corps opaque
d'environ 100 × 95 px logiques) ; le point d'ancrage (ax 75, ay 88) est le CENTRE DE LA COUR : le bout de la route
arrive dans la place. Le jeu doit dessiner sous la place forte les unités à moins de 55 px du bout de la route
(ou trier tous les sprites par leur y d'ancrage) : elles entrent alors dans le château au lieu de marcher dessus.
Les bâtiments sont tournés de 32° (une face au soleil, une à l'ombre) ; la porte regarde l'arrivée de la route :
vers l'est-sud-est pour la France (la route part vers la droite), vers l'ouest-sud-ouest pour les rivaux ; un sentier
peint sur le terrain (terrains.py) relie la porte à la route.

France : calcaire gris-beige (p95 de luminance ≤ 0,45, joints et salissures marqués), quatre tours d'angle coiffées
d'ardoises et deux tours de porte, mâchicoulis, donjon à toit en croupe, grande porte à vantaux et herse levée.
Angleterre : pierre grise, donjon normand carré à toit de plomb gris en pavillon, tours rondes coiffées de tuiles,
châtelet carré. Omeyyades : soubassements de moellons sombres, murs de pisé désaturé coulés par banches (joints fins,
coulures sous les merlons), tours carrées à merlons pyramidés à arêtes vives, porte en arc outrepassé profonde
(claveaux alternés brique et ocre), deux tentures seulement (porte et tour maîtresse). Aucun édifice religieux.

États : « abîmé » = ce que l'élève doit voir d'un coup d'œil, même réduit à 96 px : la tour d'angle LA PLUS PROCHE de
la caméra (la plus basse à l'écran) a perdu son toit et son fût est coupé à 60 % (arête déchiquetée, chevrons brûlés),
la fumée qui en monte n'est plus cuite dans l'image : le jeu l'anime à partir des points « fumees » que ce
script écrit dans le manifeste (foyers sur les toits brûlés et les ruines, 1 à 3 par image) ; la courtine face caméra est ouverte sur plus d'un tiers de
sa longueur, avec un cône d'éboulis qui déborde vers le spectateur ; la pierre est noircie (environ 50 % plus sombre)
sur le tiers haut de la façade autour de la brèche et en haut de la tour cassée ; la grande bannière est remplacée par
une bannière déchirée, penchée ; 40 % des merlons sont tombés. France : la tour de porte de gauche a aussi perdu son
cône d'ardoises. Contrôle : à 96 px, au moins 12 % des pixels changent de plus de 0,1 entre « intact » et « abîmé »
(verifier.py). « ruine » = toutes les tours et tous les murs coupés de 30 à 70 % de leur
hauteur avec une arête déchiquetée (tours creuses), plus aucun merlon, deux brèches avec cônes d'éboulis qui débordent
vers l'extérieur, suie sur la cour et au-dessus des ouvertures, herbe sur les gravats, et une bannière déchirée aux
couleurs du camp sur un mât penché. Les trois camps suivent exactement les mêmes règles.
Couleurs du camp : tentures et bannières tournées vers la caméra (contrôle : au moins 10 % des pixels opaques).
Toits de France : ardoise gris-bleu (commun.CAMPS["france"]["teinte_toit"]), et non bleu roi ; l'azur saturé est réservé
aux bannières et aux tentures. Contrôle : saturation médiane des pixels de toit ≤ 0,32 (masque des toits rendu à part
et écrit dans le cache, relu par verifier.py).
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402  (commun d'abord : il rend bpy importable)
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector, Matrix  # noqa: E402

V = Vector
TAILLE = 150          # px logiques
ANCRE_X, ANCRE_Y = 75, 88    # point d'ancrage = centre de la cour (px logiques depuis le coin haut-gauche)
PX_PAR_M = 3.9        # échelle des places fortes (px logiques par mètre)
SEUIL_CAMP = 0.10     # part minimale des pixels opaques à la couleur du camp
SEUIL_TOITS = 0.32    # saturation médiane maximale des toits de France (ardoise, pas bleu roi)
FRAC_CASSEE = (0.5, 0.7)   # état abîmé : le fût de la tour cassée garde 50 à 70 % de sa hauteur (60 % en moyenne)
SUIE_FORCE = 0.9      # pierre noircie : mélange vers la suie (environ 50 % plus sombre au cœur de la zone, rendu)
SUIE = "#120e0b"      # couleur de la suie
LACET = C.LACET_BATIMENTS
CAP = -28 - LACET     # les drapeaux des bâtiments tournés flottent dans le même vent que partout ailleurs
# demi-côtés de l'enceinte (m, repère local avant la rotation de 32°) et seuil de la porte principale :
# (point au sol juste devant le seuil, direction vers l'extérieur). terrains.py s'en sert pour tracer le sentier qui
# relie la porte à la route.
ENCEINTES = {"france": (9.4, 6.2), "angleterre": (6.4, 9.2), "omeyyades": (6.6, 9.4)}
SAILLIE_PORTE = 3.02  # avancée du châtelet / de la tour-porte des rivaux devant la courtine ouest


def porte_locale(camp):
    """Seuil de la porte principale dans le repère local de la place (m) et direction vers l'extérieur."""
    X, Y = ENCEINTES[camp]
    if camp == "france":
        return (0.0, -Y - 1.21 - 0.8), (0.0, -1.0)
    return (-X - SAILLIE_PORTE - 0.8, 0.0), (-1.0, 0.0)


def porte_ecran(camp):
    """Seuil de la porte vu dans le jeu : (dx, dy) en px logiques depuis le point d'ancrage (y vers le bas) et direction
    unitaire (ux, uy) vers l'extérieur. Un point du sol (x, y) de la place tournée tombe à (x·k, -y·sin 40°·k) de l'ancre."""
    (x, y), (ux, uy) = porte_locale(camp)
    a = math.radians(LACET)
    s = math.sin(math.radians(C.INCLINAISON))

    def proj(px, py):
        rx, ry = px * math.cos(a) - py * math.sin(a), px * math.sin(a) + py * math.cos(a)
        return rx * PX_PAR_M, -ry * s * PX_PAR_M
    dx, dy = proj(x, y)
    vx, vy = proj(ux, uy)
    n = math.hypot(vx, vy) or 1.0
    return dx, dy, vx / n, vy / n


# ---------------------------------------------------------------- matières
def mat_suie(nom="suie", vertical=False):
    """Trace de suie (décalque) : brun-noir mat, opacité tirée d'un bruit et d'un fondu radial ; vertical : traînée qui
    monte au-dessus d'une ouverture, plus dense en bas (là où sortaient les flammes)."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    p.inputs["Base Color"].default_value = C.couleur("#1d1813")
    p.inputs["Roughness"].default_value = 1.0
    p.inputs["Specular IOR Level"].default_value = 0.1
    tc = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["UV"], sep.inputs[0])
    du = N("ShaderNodeMath"); du.operation = "SUBTRACT"; du.inputs[1].default_value = 0.5
    dv = N("ShaderNodeMath"); dv.operation = "SUBTRACT"; dv.inputs[1].default_value = 0.5 if not vertical else 0.15
    L(sep.outputs["X"], du.inputs[0]); L(sep.outputs["Y"], dv.inputs[0])
    cmb = N("ShaderNodeCombineXYZ")
    L(du.outputs[0], cmb.inputs["X"])
    if vertical:
        sy = N("ShaderNodeMath"); sy.operation = "MULTIPLY"; sy.inputs[1].default_value = 0.55
        L(dv.outputs[0], sy.inputs[0]); L(sy.outputs[0], cmb.inputs["Y"])
    else:
        L(dv.outputs[0], cmb.inputs["Y"])
    lg = N("ShaderNodeVectorMath"); lg.operation = "LENGTH"
    L(cmb.outputs["Vector"], lg.inputs[0])
    fondu = C._plage(nt, lg.outputs["Value"], 0.12, 0.5, 1.0, 0.0)
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 5.0
    nz.inputs["Detail"].default_value = 6.0
    L(tc.outputs["UV"], nz.inputs["Vector"])
    grain = C._plage(nt, nz.outputs["Factor"], 0.35, 0.62, 0.15, 1.0)
    a = N("ShaderNodeMath"); a.operation = "MULTIPLY"
    L(fondu, a.inputs[0]); L(grain, a.inputs[1])
    a2 = N("ShaderNodeMath"); a2.operation = "MULTIPLY"; a2.inputs[1].default_value = 0.88
    L(a.outputs[0], a2.inputs[0])
    L(a2.outputs[0], p.inputs["Alpha"])
    return m


def vers_monde(x, y):
    """Point du repère local de la place (avant la rotation de LACET degrés) vers le repère du monde."""
    a = math.radians(LACET)
    return x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)


def vers_local(dx, dy):
    """Direction du monde (ex. le vent) vers le repère local de la place."""
    a = -math.radians(LACET)
    return dx * math.cos(a) - dy * math.sin(a), dx * math.sin(a) + dy * math.cos(a)


def mat_noirci(base, zones, force=SUIE_FORCE):
    """Copie d'une matière de maçonnerie noircie par l'incendie (état abîmé) : la couleur glisse vers la suie dans des
    zones = [(x, y, rayon, z_bas, z_haut)] du repère local de la place (rayon horizontal en m ; la suie apparaît à partir
    de z_bas et atteint sa pleine force à z_haut, donc en haut des murs, là où montaient les flammes). Un bruit allongé
    à la verticale dessine des coulées. Pas de décalque plan : la suie suit exactement les arêtes cassées et les tours
    rondes, sans plan qui flotte devant une brèche."""
    m = base.copy()
    m.name = base.name + "_noirci"
    nt = m.node_tree
    N, L = nt.nodes.new, nt.links.new
    p = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    lien = next((l for l in nt.links if l.to_socket == p.inputs["Base Color"]), None)
    geo = N("ShaderNodeNewGeometry")
    sep = N("ShaderNodeSeparateXYZ")
    L(geo.outputs["Position"], sep.inputs[0])
    masque = None
    for (x, y, r, z0, z1) in zones:
        wx, wy = vers_monde(x, y)
        sub = N("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"
        sub.inputs[1].default_value = (wx, wy, 0.0)
        L(geo.outputs["Position"], sub.inputs[0])
        plat = N("ShaderNodeVectorMath"); plat.operation = "MULTIPLY"
        plat.inputs[1].default_value = (1.0, 1.0, 0.0)
        L(sub.outputs["Vector"], plat.inputs[0])
        lg = N("ShaderNodeVectorMath"); lg.operation = "LENGTH"
        L(plat.outputs["Vector"], lg.inputs[0])
        f_r = C._plage(nt, lg.outputs["Value"], r * 0.5, r, 1.0, 0.0)
        f_z = C._plage(nt, sep.outputs["Z"], z0, z1, 0.0, 1.0)
        mm = N("ShaderNodeMath"); mm.operation = "MULTIPLY"
        L(f_r, mm.inputs[0]); L(f_z, mm.inputs[1])
        if masque is None:
            masque = mm.outputs[0]
        else:
            mx = N("ShaderNodeMath"); mx.operation = "MAXIMUM"
            L(masque, mx.inputs[0]); L(mm.outputs[0], mx.inputs[1])
            masque = mx.outputs[0]
    # coulées : bruit étiré à la verticale (échelle 0,7 m en largeur, 3 m en hauteur)
    etire = N("ShaderNodeVectorMath"); etire.operation = "MULTIPLY"
    etire.inputs[1].default_value = (1.4, 1.4, 0.33)
    L(geo.outputs["Position"], etire.inputs[0])
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.0
    nz.inputs["Detail"].default_value = 4.0
    L(etire.outputs["Vector"], nz.inputs["Vector"])
    grain = C._plage(nt, nz.outputs["Factor"], 0.32, 0.62, 0.7, 1.0)
    fac = N("ShaderNodeMath"); fac.operation = "MULTIPLY"
    L(masque, fac.inputs[0]); L(grain, fac.inputs[1])
    fac2 = N("ShaderNodeMath"); fac2.operation = "MULTIPLY"; fac2.inputs[1].default_value = force
    L(fac.outputs[0], fac2.inputs[0])
    mix = N("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MIX"
    L(fac2.outputs[0], C._entree(mix, "Factor", "VALUE"))
    if lien is not None:
        L(lien.from_socket, C._entree(mix, "A", "RGBA"))
    else:
        C._entree(mix, "A", "RGBA").default_value = p.inputs["Base Color"].default_value
    C._entree(mix, "B", "RGBA").default_value = C.couleur(SUIE)
    L(C._sortie(mix, "RGBA"), p.inputs["Base Color"])
    return m


def noircir(m, zones, cles=("pierre", "mur", "clair", "brique", "terrasse"), force=SUIE_FORCE):
    """Remplace dans le jeu de matières m les maçonneries par leur version noircie (mêmes zones pour toutes) ; les
    alias (France : pierre = mur = clair) restent des alias."""
    faites = {}
    for k in cles:
        if k in m:
            src = m[k]
            if src.name not in faites:
                faites[src.name] = mat_noirci(src, zones, force)
            m[k] = faites[src.name]
    return m


def foyer(nom, x, y, z):
    """Foyer de fumée (repère local de la place, m) : un objet vide, jamais rendu. La fumée n'est plus cuite dans
    l'image (une colonne figée faisait décor en carton pendant que tout bouge) : le jeu la dessine et l'anime à partir des
    points « fumees » du manifeste (points_fumee, rendre_place)."""
    e = C.lier(bpy.data.objects.new("foyer_" + nom, None))
    e.location = (x, y, z)
    return [e]


def points_fumee():
    """Foyers de la scène vus par la caméra du sprite : [[x, y], ...] en px logiques depuis le coin haut-gauche de
    l'image (comme ax, ay), triés par nom. La place doit déjà être tournée (C.pivot) et la caméra posée."""
    from bpy_extras.object_utils import world_to_camera_view
    s = bpy.context.scene
    bpy.context.view_layer.update()
    res = []
    for ob in sorted(s.objects, key=lambda o: o.name):
        if ob.name.startswith("foyer_"):
            u, v, _ = world_to_camera_view(s, s.camera, ob.matrix_world.translation)
            res.append([round(u * TAILLE, 1), round((1 - v) * TAILLE, 1)])
    return res


def mat_braises(nom="braises"):
    """Comble ou fond de tour incendié : charbon noir mat, piqué de braises orange qui rougeoient (émission masquée par
    un bruit) : à 96 px, quelques points orange suffisent à dire « ça brûle »."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    p.inputs["Base Color"].default_value = C.couleur("#1a1410")
    p.inputs["Roughness"].default_value = 1.0
    p.inputs["Specular IOR Level"].default_value = 0.1
    geo = N("ShaderNodeNewGeometry")
    # braises : filets irréguliers (bruit fin et distordu) regroupés en plaques (bruit large) ; pas de pois réguliers
    fin = N("ShaderNodeTexNoise")
    fin.inputs["Scale"].default_value = 2.4
    fin.inputs["Detail"].default_value = 6.0
    fin.inputs["Roughness"].default_value = 0.62
    fin.inputs["Distortion"].default_value = 0.9
    L(geo.outputs["Position"], fin.inputs["Vector"])
    large = N("ShaderNodeTexNoise")
    large.inputs["Scale"].default_value = 0.45
    large.inputs["Detail"].default_value = 2.0
    L(geo.outputs["Position"], large.inputs["Vector"])
    # (sans colonne de fumée cuite, les braises disent seules « ça brûle » : filets plus nombreux et plus vifs)
    f1 = C._plage(nt, fin.outputs["Factor"], 0.55, 0.67, 0.0, 1.0)
    f2 = C._plage(nt, large.outputs["Factor"], 0.4, 0.56, 0.25, 1.0)
    mm = N("ShaderNodeMath"); mm.operation = "MULTIPLY"
    L(f1, mm.inputs[0]); L(f2, mm.inputs[1])
    force = N("ShaderNodeMath"); force.operation = "MULTIPLY"; force.inputs[1].default_value = 4.0
    L(mm.outputs[0], force.inputs[0])
    p.inputs["Emission Color"].default_value = C.couleur("#d8400e")
    L(force.outputs[0], p.inputs["Emission Strength"])
    return m


def poutre(nom, a, b, ep, mat):
    """Poutre de section ep × ep entre deux points a et b (x, y, z)."""
    a, b = Vector(a), Vector(b)
    d = b - a
    o = C.boite(nom, ep, ep, d.length, a.to_tuple(), mat)
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    return o


def charpente_croupe(nom, cx, cy, lx, ly, z, hauteur, m, debord=0.3, graine=0, pas=0.85):
    """Toit en croupe (faîtage le long de X) qui a brûlé : arêtiers, faîtage et chevrons calcinés (un tiers tombés ou
    cassés) au-dessus d'un comble de braises."""
    rnd = random.Random(graine)
    objs = []
    ax, ay = lx / 2 + debord, ly / 2 + debord
    fa = max(0.0, ax - ay)
    zf = z + hauteur
    if "braises" not in m:
        m["braises"] = mat_braises()
    objs.append(C.boite(nom + "_comble", lx, ly, 0.12, (cx, cy, z), m["braises"]))
    objs.append(poutre(nom + "_faitage", (cx - fa, cy, zf), (cx + fa, cy, zf), 0.2, m["suie"]))
    for k, (sx, sy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        haut = Vector((cx + sx * fa, cy, zf))
        bas = Vector((cx + sx * ax, cy + sy * ay, z))
        if k == 0:                       # un arêtier rompu à mi-longueur
            haut = bas + (haut - bas) * 0.55
        objs.append(poutre("%s_aretier%d" % (nom, k), bas.to_tuple(), haut.to_tuple(), 0.2, m["suie"]))
    i = 0
    for sy in (-1, 1):
        x = cx - ax + pas
        while x < cx + ax - pas * 0.6:
            i += 1
            if rnd.random() < 0.33:
                x += pas
                continue
            xr = max(cx - fa, min(cx + fa, x))
            bas = Vector((x, cy + sy * ay, z))
            haut = Vector((xr, cy, zf))
            haut = bas + (haut - bas) * (rnd.uniform(0.4, 0.8) if rnd.random() < 0.35 else 1.0)
            objs.append(poutre("%s_chevron%d" % (nom, i), bas.to_tuple(), haut.to_tuple(), 0.15, m["suie"]))
            x += pas
    return objs


def charpente_brulee(nom, x0, x1, y0, y1, z, hauteur, m, reste=0.3, graine=0, mat_toit=None):
    """Toit à deux pans (faîtage le long de X) qui a brûlé (état abîmé) : il ne reste que la charpente calcinée (fermes
    en A tous les 0,9 m, un tiers tombées ou penchées, faîtage rompu) au-dessus d'un comble noir de suie et, au bout x1,
    un morceau du toit encore couvert sur reste × la longueur."""
    rnd = random.Random(graine)
    objs = []
    ym = (y0 + y1) / 2
    xc = x1 - (x1 - x0) * reste
    if "braises" not in m:
        m["braises"] = mat_braises()
    objs.append(C.boite(nom + "_comble", xc - x0, y1 - y0, 0.12, ((x0 + xc) / 2, ym, z), m["braises"]))
    pente = math.hypot(ym - y0, hauteur)
    ang = math.atan2(hauteur, ym - y0)
    xi = x0 + 0.35
    k = 0
    while xi < xc - 0.2:
        if rnd.random() > 0.3:
            for cote in (-1, 1):
                if rnd.random() < 0.15:
                    continue
                L = pente * (rnd.uniform(0.55, 1.0) if rnd.random() < 0.35 else 1.0)
                yb = y0 if cote < 0 else y1
                o = C.boite("%s_ferme%d_%d" % (nom, k, cote), 0.16, 0.16, L, (xi + rnd.uniform(-0.08, 0.08), yb, z), m["suie"])
                o.rotation_euler = (cote * (math.pi / 2 - ang) + rnd.uniform(-0.12, 0.12), rnd.uniform(-0.15, 0.15), 0.0)
                objs.append(o)
        xi += 0.9
        k += 1
    # faîtage rompu : deux tronçons, l'un affaissé
    lf = (xc - x0) * 0.45
    for j, (xa, dz, inc) in enumerate(((xc - lf, 0.0, 0.0), (x0 + 0.3, -0.9, 0.22))):
        o = C.boite("%s_faitage%d" % (nom, j), lf, 0.18, 0.18, (xa + lf / 2, ym, z + hauteur - 0.2 + dz), m["suie"])
        o.rotation_euler.y = inc
        objs.append(o)
    if reste > 0:
        objs.append(toit_deux_pans(nom + "_reste", xc, x1, y0, y1, z, hauteur, mat_toit or m["toit"]))
    return objs


def chevrons_brules(nom, x, y, z, r, m, graine=0, nombre=5):
    """Charpente brûlée qui dépasse d'une tour dont le toit a flambé."""
    rnd = random.Random(graine)
    objs = []
    for k in range(nombre):
        a = rnd.uniform(0, 6.28)
        o = C.boite(nom + "_chevron%d" % k, 0.13, 0.13, r * 1.5, (x + 0.45 * r * math.cos(a), y + 0.45 * r * math.sin(a), z),
                    m["suie"])
        o.rotation_euler = (rnd.uniform(-0.75, 0.75), rnd.uniform(-0.75, 0.75), a)
        objs.append(o)
    return objs


def matieres(camp, etat="intact", echelle_tex=1.0, valeur=1.0):
    """Pierre, pisé, toits, bois du camp ; abîmé et ruiné : un peu plus sombres (la suie est surtout portée par des
    décalques), gravats, herbe des gravats.

    echelle_tex : grossit le motif des pierres (places fortes à petite échelle : des pierres lisibles, pas un bruit gris).
    valeur : assombrit l'ensemble (bourgs de la carte de campagne, qui doivent se détacher d'une carte claire)."""
    c = C.CAMPS[camp]
    suie = {"intact": 1.0, "abime": 0.92, "ruine": 0.84}[etat] * valeur
    m = {}
    if camp == "omeyyades":
        # soubassements de moellons nettement plus sombres que le pisé ; pisé désaturé coulé par banches (commun.mat_pise)
        m["pierre"] = C.mat_ph("pierre", c["pierre"], echelle_m=2.2 * echelle_tex, cible=c["teinte_pierre"], contraste=1.45,
                               garde=0.12, valeur=suie, bosse=0.55, salissure=0.35, h_salissure=1.0, occlusion=0.6,
                               rugosite=0.9)
        m["mur"] = C.mat_pise("pise", valeur=suie, echelle_tex=echelle_tex)
        m["clair"] = C.mat_ph("pierre_claire", c["pierre"], echelle_m=1.6 * echelle_tex, cible="#bfa985", contraste=1.2,
                              garde=0.1, valeur=suie, bosse=0.3, occlusion=0.4)
        m["brique"] = C.mat_ph("brique", "rustic_stone_wall", echelle_m=1.2, cible="#8a4a32", contraste=1.1, garde=0.05,
                               valeur=suie, bosse=0.3, occlusion=0.4)
        m["terrasse"] = C.mat_ph("terrasse", "clay_plaster", echelle_m=3.0, cible="#7f6a4f", contraste=1.3, valeur=suie,
                                 bosse=0.2, occlusion=0.5)
        m["toit"] = m["mur"]
    else:
        clair = camp == "france"
        e = (1.0 if clair else 2.5) * echelle_tex
        # France : calcaire gris-beige (et non plus presque blanc), joints et pied des murs marqués
        m["pierre"] = C.mat_ph("pierre", c["pierre"], echelle_m=(2.0 if clair else 2.6) * e, cible=c["teinte_pierre"],
                               contraste=1.6 if clair else 0.85, garde=0.15 if clair else 0.1, valeur=suie,
                               bosse=0.45 if clair else 0.25, salissure=0.45, h_salissure=1.4, occlusion=0.45,
                               rugosite=0.88, var_rugosite=0.08)
        m["mur"] = m["pierre"]
        m["clair"] = m["pierre"]
        if clair:
            m["toit"] = C.mat_toit("toit", c["toit"], c["teinte_toit"], rang_m=0.32, largeur_m=0.36, echelle_m=2.4,
                                   valeur=suie)
        else:
            m["toit"] = C.mat_toit("toit", c["toit"], c["teinte_toit"], rang_m=0.34, largeur_m=0.3, echelle_m=3.0,
                                   rugosite=(0.75, 0.9), speculaire=0.2, valeur=suie)
        # plomb gris neutre (aucun bleu) : grandes feuilles marquées par leurs joints
        m["plomb"] = C.mat_toit("plomb", "roof_slates_02", c.get("plomb", "#7d7b78"), rang_m=1.1, largeur_m=0.75,
                                echelle_m=4.0, contraste=0.5, rugosite=(0.55, 0.65), speculaire=0.3, joint=0.7, var=0.05,
                                valeur=suie)
        m["terrasse"] = m["plomb"]
    m["bois"] = C.mat_ph("bois", "medieval_wood", echelle_m=1.6, cible="#7a5a3c", contraste=1.3, valeur=suie, bosse=0.4)
    m["vantail"] = C.mat_ph("vantail", "medieval_wood", echelle_m=1.2, cible="#80603f", contraste=1.4, valeur=suie,
                            bosse=0.5, projection="BOITE")
    m["noir"] = C.mat_simple("ouverture", "#1c140d", rugosite=1.0)
    m["sol"] = C.mat_ph("cour", "dirt_aerial_02", echelle_m=6.0, cible="#7b6a52", contraste=1.2, bosse=0.2)
    m["fer"] = C.mat_metal("fer", "#4d443a", rugosite=0.65, metal=0.6)
    m["eboulis"] = C.mat_ph("eboulis", c["pierre"], echelle_m=1.4, cible=(c.get("teinte_pierre") if camp != "omeyyades"
                                                                          else "#9a8670"),
                            contraste=1.5, garde=0.1, valeur=suie * 0.95, bosse=0.6, occlusion=0.6, rugosite=0.95)
    m["suie"] = C.mat_simple("suie_bois", "#2a221c", rugosite=1.0)
    m["suie_sol"] = mat_suie("suie_sol")
    m["suie_mur"] = mat_suie("suie_mur", vertical=True)
    m["herbe"] = C.mat_simple("herbe_gravats", "#5a6a2e", rugosite=0.95, bosse=0.6, echelle_bosse=25)
    return m


# ---------------------------------------------------------------- éléments d'architecture
def cone_uv(nom, rayon, hauteur, loc, mat, segments=24, pans=None, rot=0.0, epi=None, debord=0.0):
    """Toit conique (ou pyramidal si pans) avec UV en mètres : les rangs d'ardoises tournent autour du cône.
    epi : matière d'un épi de faîtage (petite flèche au sommet). debord : avancée de la base sous l'égout."""
    n = pans or segments
    rayon = rayon + debord
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
        u0 = 2 * math.pi * rayon * k / n
        u1 = 2 * math.pi * rayon * (k + 1) / n
        for lp, uvv in zip(f.loops, ((u0, 0), (u1, 0), ((u0 + u1) / 2, pente))):
            lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.location = loc
    s = ob.modifiers.new("ep", "SOLIDIFY")
    s.thickness = 0.12
    objs = [ob]
    if epi is not None:
        x, y, z = loc
        objs.append(C.cylindre(nom + "_epi", 0.05, 0.9, (x, y, z + hauteur - 0.1), epi, segments=8, rayon_haut=0.015))
        objs.append(C.sphere(nom + "_epi_b", 0.11, (x, y, z + hauteur + 0.18), epi, subdiv=2))
    return objs


def toit_croupe(nom, cx, cy, lx, ly, z, hauteur, mat, debord=0.35):
    """Toit en croupe (quatre pans, faîtage le long de X) avec UV en mètres le long de la pente."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    ax, ay = lx / 2 + debord, ly / 2 + debord
    fa = max(0.0, ax - ay)            # demi-longueur du faîtage
    p = [bm.verts.new(v) for v in ((cx - ax, cy - ay, z), (cx + ax, cy - ay, z), (cx + ax, cy + ay, z), (cx - ax, cy + ay, z),
                                   (cx - fa, cy, z + hauteur), (cx + fa, cy, z + hauteur))]
    pente = math.hypot(ay, hauteur)
    for quad, L in (((p[0], p[1], p[5], p[4]), 2 * ax), ((p[2], p[3], p[4], p[5]), 2 * ax)):
        f = bm.faces.new(quad)
        for lp, uvv in zip(f.loops, ((0, 0), (L, 0), (ax + fa, pente), (ax - fa, pente))):
            lp[uv].uv = uvv
    for tri, L in (((p[1], p[2], p[5]), 2 * ay), ((p[3], p[0], p[4]), 2 * ay)):
        f = bm.faces.new(tri)
        for lp, uvv in zip(f.loops, ((0, 0), (L, 0), (L / 2, math.hypot(ax - fa, hauteur)))):
            lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.15
    return ob


def toit_deux_pans(nom, x0, x1, y0, y1, z, hauteur, mat, debord=0.3):
    """Toit à deux pans (faîtage le long de X) avec UV en mètres, pignons fermés."""
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
        L = xb - xa
        for lp, uvv in zip(f.loops, ((0, 0), (L, 0), (L, pente), (0, pente))):
            lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.15
    return ob


def fente(nom, x, y, z, angle, mat, h=0.85, l=0.13):
    """Archère : fente étroite (encadrement creusé), posée sur une façade dont la normale extérieure fait « angle »."""
    o = C.boite(nom, l, 0.08, h, (x, y, z), mat)
    o.rotation_euler.z = angle + math.pi / 2
    return o


def meurtrieres(nom, x, y, r, mat, liste):
    """Archères sur le pourtour d'une tour ronde : liste de (angle en degrés, hauteur) — jamais dans l'axe de la porte."""
    objs = []
    for k, (a, z) in enumerate(liste):
        a = math.radians(a)
        objs.append(fente(nom + "_m%d" % k, x + r * math.cos(a), y + r * math.sin(a), z, a, mat))
    return objs


def corbeaux_cercle(nom, x, y, r, z, mat, nombre=14):
    """Couronne de mâchicoulis : corbeaux de pierre sous un parapet en encorbellement (tour ronde)."""
    bm = bmesh.new()
    for k in range(nombre):
        a = 2 * math.pi * (k + 0.5) / nombre
        geo = bmesh.ops.create_cube(bm, size=1.0)
        vs = geo["verts"]
        bmesh.ops.scale(bm, vec=(0.5, 0.22, 0.55), verts=vs)
        for v in vs:                    # corbeau en console : plus profond en haut
            if v.co.z < 0 and v.co.x > 0:
                v.co.x -= 0.22
        bmesh.ops.translate(bm, vec=(r + 0.12, 0, z + 0.27), verts=vs)
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, "Z"), verts=vs)
    ob = C.objet_maillage(nom, bm, mat)
    ob.location = (x, y, 0)
    return ob


def corbeaux_ligne(nom, a, b, z, mat, pas=0.9, saillie=0.35):
    """Mâchicoulis le long d'un mur a -> b, du côté extérieur (droite de a -> b)."""
    a, b = V((a[0], a[1], 0)), V((b[0], b[1], 0))
    d = b - a
    L = d.length
    n_ext = V((d.y, -d.x, 0)).normalized()
    ang = math.atan2(d.y, d.x)
    bm = bmesh.new()
    nb = max(1, int(L / pas))
    for k in range(nb):
        c = a + d * ((k + 0.5) / nb) + n_ext * (saillie / 2)
        geo = bmesh.ops.create_cube(bm, size=1.0)
        vs = geo["verts"]
        bmesh.ops.scale(bm, vec=(0.22, saillie, 0.5), verts=vs)
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, "Z"), verts=vs)
        bmesh.ops.translate(bm, vec=(c.x, c.y, z + 0.25), verts=vs)
    return C.objet_maillage(nom, bm, mat)


# ---------------------------------------------------------------- ruines : arêtes déchiquetées, brèches, gravats, suie
def ruban_dechire(nom, pts, hauteurs, ep, mat, ferme=False, z0=0.0):
    """Maçonnerie ruinée : ruban vertical le long de pts (x, y), sommet à la hauteur hauteurs[i] au-dessus de z0 (arête
    déchiquetée), épaissi de ep par un Solidify centré (le dessus du mur, ses dents et l'intérieur des tours creuses se
    voient)."""
    bm = bmesh.new()
    bas = [bm.verts.new((x, y, z0)) for x, y in pts]
    haut = [bm.verts.new((x, y, z0 + h)) for (x, y), h in zip(pts, hauteurs)]
    n = len(pts)
    for i in range(n if ferme else n - 1):
        j = (i + 1) % n
        bm.faces.new((bas[i], bas[j], haut[j], haut[i]))
    ob = C.objet_maillage(nom, bm, mat)
    so = ob.modifiers.new("ep", "SOLIDIFY")
    so.thickness = ep
    so.offset = 0.0
    so.use_even_offset = True
    return ob


def profil_dechire(n, h, frac=(0.3, 0.7), graine=0, ferme=False, breches=(), plein=False):
    """Hauteurs d'une arête cassée : niveau qui varie lentement entre frac[0] et frac[1] de h, dents irrégulières
    (± 0,35 m, quelques entailles plus profondes) ; breches : intervalles (t0, t1) où le mur tombe presque au sol.
    plein : le mur garde sa hauteur h hors des brèches (état abîmé), seules les lèvres de la brèche sont déchiquetées."""
    rnd = random.Random(graine)
    ph = [rnd.uniform(0, 2 * math.pi) for _ in range(3)]
    res = []
    for i in range(n):
        t = i / n if ferme else i / max(1, n - 1)
        if ferme:
            onde = 0.55 * math.sin(2 * math.pi * t + ph[0]) + 0.3 * math.sin(4 * math.pi * t + ph[1]) + 0.15 * math.sin(
                6 * math.pi * t + ph[2])
        else:
            onde = 0.55 * math.sin(2 * math.pi * t * 0.8 + ph[0]) + 0.3 * math.sin(2 * math.pi * t * 2.3 + ph[1]) + 0.15 * math.sin(
                2 * math.pi * t * 4.1 + ph[2])
        niveau = frac[0] + (frac[1] - frac[0]) * (0.5 + 0.5 * onde)
        hh = h if plein else h * niveau + rnd.uniform(-0.35, 0.35) - (rnd.uniform(0.3, 0.9) if rnd.random() < 0.15 else 0.0)
        for (t0, t1) in breches:
            bord = 0.09
            if t0 - bord < t < t1 + bord:
                if t0 <= t <= t1:
                    f = 1.0
                else:
                    f = 1 - min(abs(t - t0), abs(t - t1)) / bord
                bas = 0.35 + rnd.uniform(0.0, 0.3)
                hh = hh * (1 - f) + bas * f + (rnd.uniform(-0.3, 0.3) if 0 < f < 1 else 0.0)
        res.append(max(0.3, hh))
    return res


def points_segment(a, b, pas=0.32):
    n = max(2, int(math.hypot(b[0] - a[0], b[1] - a[1]) / pas))
    return [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(n + 1)]


def points_cercle(x, y, r, pas=0.32):
    n = max(20, int(2 * math.pi * r / pas))
    return [(x + r * math.cos(2 * math.pi * k / n), y + r * math.sin(2 * math.pi * k / n)) for k in range(n)]


def points_carre(x, y, demi, pas=0.32):
    coins = [(x - demi, y - demi), (x + demi, y - demi), (x + demi, y + demi), (x - demi, y + demi)]
    pts = []
    for k in range(4):
        pts += points_segment(coins[k], coins[(k + 1) % 4], pas)[:-1]
    return pts


def touffes_herbe(nom, pts, m, graine=0):
    """Touffes d'herbe sur les gravats (petites boules bosselées vert sombre)."""
    rnd = random.Random(graine)
    objs = []
    for k, (x, y, z) in enumerate(pts):
        r = rnd.uniform(0.18, 0.32)
        objs.append(C.sphere(nom + "_herbe%d" % k, r, (x, y, z + r * 0.3), m["herbe"], subdiv=2,
                             echelle=(1.3, 1.1, 0.6)))
    return objs


def cone_eboulis(nom, centre, exterieur, largeur, m, graine=0, herbe=True, hauteur=0.9):
    """Cône d'éboulis au pied d'une brèche : monticule bosselé qui déborde vers l'extérieur (direction « exterieur »,
    vecteur unitaire x, y), blocs épars, quelques touffes d'herbe."""
    rnd = random.Random(graine)
    ux, uy = exterieur
    cx, cy = centre[0] + ux * 0.9, centre[1] + uy * 0.9
    objs = []
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
    for v in bm.verts:
        v.co *= 1 + rnd.uniform(-0.12, 0.12)
    mont = C.objet_maillage(nom + "_mont", bm, m["eboulis"])
    mont.scale = (largeur * 0.55, 1.8, hauteur)
    mont.location = (cx, cy, -0.2)
    mont.rotation_euler.z = math.atan2(-ux, uy)
    objs.append(mont)
    vx, vy = -uy, ux                         # le long du mur
    for k in range(int(10 + largeur * 4)):
        dl = rnd.uniform(-0.6, 0.6) * largeur
        de = rnd.uniform(-0.6, 2.8)
        s = rnd.uniform(0.25, 0.6)
        o = C.boite(nom + "_bloc%d" % k, s, s * rnd.uniform(0.7, 1.3), s * 0.7,
                    (centre[0] + vx * dl + ux * de, centre[1] + vy * dl + uy * de, rnd.uniform(-0.05, 0.25) * (2.6 - de) / 2.6),
                    m["eboulis"])
        o.rotation_euler = (rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), rnd.uniform(0, 3))
        objs.append(o)
    if herbe:
        objs += touffes_herbe(nom, [(cx + vx * rnd.uniform(-0.4, 0.4) * largeur + ux * rnd.uniform(-0.5, 1.0),
                                     cy + vy * rnd.uniform(-0.4, 0.4) * largeur + uy * rnd.uniform(-0.5, 1.0),
                                     hauteur * 0.55) for _ in range(5)], m, graine + 1)
    return objs


def decalque(nom, centre, largeur, hauteur, mat, rot_z=0.0, vertical=True):
    """Plan fin portant une trace (suie) : vertical, face vers -Y avant rotation (posé devant une façade), ou au sol."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    w, h = largeur / 2, hauteur
    if vertical:
        co = [(-w, 0, 0), (w, 0, 0), (w, 0, h), (-w, 0, h)]
    else:
        co = [(-w, -h / 2, 0), (w, -h / 2, 0), (w, h / 2, 0), (-w, h / 2, 0)]
    f = bm.faces.new([bm.verts.new(c) for c in co])
    for lp, uvv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.location = centre
    ob.rotation_euler.z = rot_z
    ob.visible_shadow = False
    return ob


def suie_cour(nom, zones, m, graine=0):
    """Traces de suie au sol de la cour (incendie) : zones = [(x, y, taille)]."""
    rnd = random.Random(graine)
    return [decalque(nom + "%d" % k, (x, y, 0.09), t, t * rnd.uniform(0.7, 1.0), m["suie_sol"], rot_z=rnd.uniform(0, 3),
                     vertical=False) for k, (x, y, t) in enumerate(zones)]


def banniere_dechiree(nom, camp, loc, m, inclinaison=(0.32, -0.18), hauteur_mat=5.6, longueur=2.6, hauteur=1.7,
                      dechire=0.4, vent=0.55, echelle_embleme=0.62):
    """Bannière déchirée aux couleurs du camp, sur un mât penché : planté dans les gravats (place en ruine) ou au faîte
    du donjon (place abîmée, à la place de la grande bannière)."""
    objs = C.drapeau(nom, camp, hauteur_mat, longueur, hauteur, loc=(0, 0, 0), vent=vent, cap=CAP, dechire=dechire,
                     mat_mat=m["bois"], inverse=bool(C.CAMPS[camp].get("inverse")), echelle_embleme=echelle_embleme)
    pv = C.lier(bpy.data.objects.new(nom + "_pv", None))
    for o in objs:
        o.parent = pv
    pv.location = loc
    pv.rotation_euler = (inclinaison[0], inclinaison[1], 0.0)
    return objs + [pv]


def tour_ronde(nom, x, y, r, h, m, toit=True, etat="intact", graine=0, archeres=None, h_toit=None, machicoulis=True,
               epi=True, flamme=None, cassee=False, brulee=False):
    """Tour ronde : talus évasé, fût, mâchicoulis et parapet, puis toit conique raide (2,3 × le rayon, épi de faîtage)
    ou merlons. archeres : liste (angle°, hauteur relative 0..1) ; par défaut, deux archères décalées.
    État « ruine » (ou cassee=True) : tour creuse dont le haut est arraché (ruine : reste de 30 à 70 % de la hauteur ;
    cassee : FRAC_CASSEE, 60 % en moyenne), arête déchiquetée, gravats au fond, charpente brûlée qui dépasse.
    brulee=True : le toit a flambé (plus de cône ; parapet aux merlons à moitié tombés, chevrons calcinés).
    État « abîmé » : 40 % des merlons tombés."""
    objs = []
    objs.append(C.cylindre(nom + "_talus", r * 1.2, 1.5, (x, y, 0), m["pierre"], segments=28, rayon_haut=r))
    if etat == "ruine" or cassee:
        frac = (0.3, 0.7) if etat == "ruine" else FRAC_CASSEE
        pts = points_cercle(x, y, r - 0.3)
        objs.append(ruban_dechire(nom + "_ruine", pts, profil_dechire(len(pts), h, frac, graine, ferme=True), 0.6,
                                  m["pierre"], ferme=True))
        h_bas = h * frac[0]
        objs.append(C.cylindre(nom + "_gravats", r - 0.45, 0.6 if etat == "ruine" else h_bas - 1.0, (x, y, 0), m["eboulis"],
                               segments=16))
        if cassee:
            if "braises" not in m:
                m["braises"] = mat_braises()
            objs.append(C.cylindre(nom + "_braises", r - 0.5, 0.1, (x, y, h_bas - 1.0), m["braises"], segments=16))
        if cassee and toit:
            objs += chevrons_brules(nom, x, y, h_bas, r, m, graine=graine)
        return objs
    if brulee:
        toit = False
    objs.append(C.cylindre(nom + "_fut", r, h, (x, y, 0), m["pierre"], segments=28))
    manque = (0.55 if brulee else 0.4) if etat == "abime" else 0.0
    if machicoulis:
        objs.append(corbeaux_cercle(nom + "_mach", x, y, r, h - 0.85, m["pierre"], nombre=max(10, int(r * 7))))
        objs.append(C.cylindre(nom + "_parapet", r + 0.3, 1.0, (x, y, h - 0.3), m["pierre"], segments=28, chapeau=False))
        objs[-1].modifiers.new("ep", "SOLIDIFY").thickness = 0.45
        if brulee and "braises" not in m:
            m["braises"] = mat_braises()
        sol = m["braises"] if brulee else (m["terrasse"] if "terrasse" in m else m["pierre"])
        objs.append(C.cylindre(nom + "_sol", r + 0.05, 0.1, (x, y, h - 0.05), sol, segments=28))
        haut = h + 0.7
    if brulee:
        if not machicoulis:          # tour sans mâchicoulis (Angleterre) : comble de braises au ras du fût
            if "braises" not in m:
                m["braises"] = mat_braises()
            objs.append(C.cylindre(nom + "_sol", r - 0.05, 0.1, (x, y, h - 0.05), m["braises"], segments=28))
            haut = h
        objs += chevrons_brules(nom, x, y, h - 0.2, r, m, graine=graine + 3, nombre=6)
    else:
        objs.append(C.cylindre(nom + "_cordon", r + 0.15, 0.3, (x, y, h - 0.5), m["pierre"], segments=28))
        haut = h
    if toit:
        ht = h_toit or 2.3 * (r + 0.3)
        objs += cone_uv(nom + "_toit", r + 0.3, ht, (x, y, haut - 0.05), m["toit"], debord=0.0,
                        epi=m.get("or") if epi else None)
    else:
        crn = C.creneaux_cercle(nom + "_crn", r + 0.28, haut, m["pierre"], nombre=max(8, int(r * 5)), h=0.6, ep=0.4,
                                manque=manque, graine=graine)
        crn.location = (x, y, 0)
        objs.append(crn)
    for k, (a, zr) in enumerate(archeres if archeres is not None else ((235, 0.42), (300, 0.62))):
        a = math.radians(a)
        objs.append(fente(nom + "_m%d" % k, x + (r + 0.02) * math.cos(a), y + (r + 0.02) * math.sin(a), h * zr, a,
                          m["noir"]))
    return objs


def tour_carree(nom, x, y, cote, h, m, merlons="carre", etat="intact", graine=0, toit=None, mat="pierre",
                archeres="centre", soubassement=None, cassee=False):
    """Tour carrée : talus, fût, corniche, parapet crénelé (merlons droits ou pyramidés), toit pyramidal en option.

    archeres : 'centre' (une seule fente haute, décalée), 'cote' (sur la face ouest), None.
    soubassement : (matière, hauteur) — Omeyyades : moellons jusqu'à 2,5 m, pisé au-dessus.
    État « ruine » (ou cassee) : tour creuse arrachée de 30 à 70 % (arête déchiquetée) ; « abîmé » : 40 % des merlons
    tombés."""
    rnd = random.Random(graine)
    objs = []
    objs.append(C.boite(nom + "_talus", cote * 1.1, cote * 1.1, 1.0, (x, y, 0), m["pierre"]))
    if etat == "ruine" or cassee:
        frac = (0.3, 0.7) if etat == "ruine" else FRAC_CASSEE
        pts = points_carre(x, y, cote / 2 - 0.35)
        hs = profil_dechire(len(pts), h, frac, graine, ferme=True)
        if soubassement:
            mb, hb = soubassement
            objs.append(ruban_dechire(nom + "_soub", pts, [min(hb, v) for v in hs], 0.72, m[mb], ferme=True))
            objs.append(ruban_dechire(nom + "_ruine", pts, [max(0.05, v - hb) for v in hs], 0.7, m[mat], ferme=True, z0=hb))
        else:
            objs.append(ruban_dechire(nom + "_ruine", pts, hs, 0.7, m[mat], ferme=True))
        h_bas = h * frac[0]
        objs.append(C.boite(nom + "_gravats", cote - 1.0, cote - 1.0, 0.6 if etat == "ruine" else h_bas - 1.0, (x, y, 0),
                            m["eboulis"]))
        if cassee:
            if "braises" not in m:
                m["braises"] = mat_braises()
            objs.append(C.boite(nom + "_braises", cote - 1.1, cote - 1.1, 0.1, (x, y, h_bas - 1.0), m["braises"]))
            # solives calcinées de la terrasse effondrée
            objs += chevrons_brules(nom, x, y, h_bas, cote / 2, m, graine=graine, nombre=4)
        return objs
    if soubassement:
        mb, hb = soubassement
        objs.append(C.boite(nom + "_soub", cote + 0.06, cote + 0.06, min(hb, h), (x, y, 0), m[mb]))
        if h > hb:
            f = C.boite(nom + "_fut", cote, cote, h - hb, (x, y, hb), m[mat])
            C.biseau(f, 0.04)
            objs.append(f)
    else:
        fut = C.boite(nom + "_fut", cote, cote, h, (x, y, 0), m[mat])
        C.biseau(fut, 0.04)
        objs.append(fut)
    objs.append(C.boite(nom + "_corniche", cote + 0.3, cote + 0.3, 0.3, (x, y, h - 0.3), m["pierre"] if merlons == "carre" else m[mat]))
    objs.append(C.boite(nom + "_terrasse", cote - 0.2, cote - 0.2, 0.06, (x, y, h), m["terrasse"]))
    if toit:
        objs += cone_uv(nom + "_toit", (cote + 0.5) * 0.7071, max(cote * 0.95, 2.0), (x, y, h), m["toit"], pans=4,
                        rot=math.pi / 4, epi=m.get("or"))
    else:
        bm = bmesh.new()
        d = cote / 2 + 0.1
        coins = [(x - d, y - d), (x + d, y - d), (x + d, y + d), (x - d, y + d)]
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], h, h=0.65, ep=0.4, pas=0.95 if merlons == "carre" else 1.3,
                             forme=merlons, manque=0.4 if etat == "abime" else 0.0, rnd=rnd)
        objs.append(C.objet_maillage(nom + "_crn", bm, m["pierre"] if merlons == "carre" else m[mat]))
    if archeres:
        if archeres == "centre":     # une seule fente, haute et décalée (face sud)
            objs.append(fente(nom + "_arch", x + cote * 0.18, y - cote / 2 - 0.02, h * 0.68, -math.pi / 2, m["noir"]))
        elif archeres == "cote":     # sur la face ouest
            objs.append(fente(nom + "_arch", x - cote / 2 - 0.02, y + cote * 0.12, h * 0.66, math.pi, m["noir"]))
    return objs


def trous_boulins(nom, a, b, h, ep, m, graine=0, pas_x=1.0):
    """Trous de boulin du pisé : une rangée sur un joint de banche sur deux (tous les 1,7 m), espacement irrégulier
    (40 % sautés, décalage de ± 0,15 m), petits (0,12 × 0,1 m), brun sombre, peu profonds (0,05 m)."""
    rnd = random.Random(graine)
    a, b = V((a[0], a[1], 0)), V((b[0], b[1], 0))
    d = b - a
    L = d.length
    ang = math.atan2(d.y, d.x)
    n = V((-d.y, d.x, 0)).normalized()
    bm = bmesh.new()
    z = 1.7
    while z < h - 0.9:
        nx = int(L / pas_x)
        for i in range(nx):
            if rnd.random() < 0.4:
                continue
            t = (i + 0.5 + rnd.uniform(-0.15, 0.15) / pas_x) / max(1, nx)
            if not 0.03 < t < 0.97:
                continue
            c = a + d * t - n * (ep / 2 + 0.005)
            geo = bmesh.ops.create_cube(bm, size=1.0)
            vs = geo["verts"]
            bmesh.ops.scale(bm, vec=(0.12, 0.05, 0.1), verts=vs)
            bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, "Z"), verts=vs)
            bmesh.ops.translate(bm, vec=(c.x, c.y, z + 0.05), verts=vs)
        z += 1.7
    return [C.objet_maillage(nom + "_boulins", bm, C.mat_simple("boulin", "#4a3622", rugosite=1.0))]


def courtine(nom, a, b, h, ep, m, etat="intact", merlons="carre", breche=None, mat="mur", machicoulis=False, graine=0,
             eboulis=True):
    """Mur d'enceinte de a à b (points x, y) : talus, mur, chemin de ronde crénelé côté extérieur (droite de a -> b).

    breche : (t0, t1) le long du mur : le mur y tombe presque au sol (lèvres déchiquetées) et un cône d'éboulis déborde
    vers l'extérieur. « abîmé » : 40 % des merlons tombés ; « ruine » : mur coupé de 30 à 70 % de sa hauteur (arête
    déchiquetée), plus aucun merlon."""
    rnd = random.Random(graine * 31 + 7)
    a, b = V((a[0], a[1], 0)), V((b[0], b[1], 0))
    d = b - a
    L = d.length
    ang = math.atan2(d.y, d.x)
    n_ext = V((d.y, -d.x, 0)).normalized()
    objs = [C.boite(nom + "_talus", L, ep * 1.5, 1.0, ((a + b) / 2).to_tuple(), m["pierre"], rot_z=ang)]
    breches = [breche] if breche else []
    if etat == "ruine" or breches:
        pts = points_segment((a.x, a.y), (b.x, b.y))
        hs = profil_dechire(len(pts), h, (0.3, 0.7), graine * 13 + 5, breches=breches, plein=etat != "ruine")
        objs.append(ruban_dechire(nom + "_mur", pts, hs, ep, m[mat]))
    else:
        mur = C.boite(nom + "_mur", L, ep, h, ((a + b) / 2).to_tuple(), m[mat], rot_z=ang)
        C.biseau(mur, 0.03)
        objs.append(mur)
    if breches and eboulis:
        t = (breche[0] + breche[1]) / 2
        c = a + d * t
        objs += cone_eboulis(nom + "_ebl", (c.x, c.y), (n_ext.x, n_ext.y), L * (breche[1] - breche[0]) + 1.6, m,
                             graine=graine, herbe=etat == "ruine" or rnd.random() < 0.5)
    if etat == "ruine":
        return objs
    morceaux = [(0.0, 1.0)]
    if breche:
        morceaux = [(0.0, breche[0] - 0.09), (breche[1] + 0.09, 1.0)]
    for i, (t0, t1) in enumerate(morceaux):
        if t1 - t0 < 0.04:
            continue
        if merlons == "pointe":
            objs += trous_boulins(nom + "%d" % i, a + d * t0, a + d * t1, h, ep, m, graine=graine * 13 + i)
        bm = bmesh.new()
        dec = n_ext * (ep / 2 - 0.2)
        p0 = a + d * t0 + dec
        p1 = a + d * t1 + dec
        l = L * (t1 - t0)
        if machicoulis:
            objs.append(corbeaux_ligne(nom + "_mach%d" % i, (p0.x, p0.y), (p1.x, p1.y), h - 0.7, m["pierre"]))
            bm2 = bmesh.new()
            geo = bmesh.ops.create_cube(bm2, size=1.0)
            bmesh.ops.scale(bm2, vec=(l, 0.45, 0.7), verts=geo["verts"])
            bmesh.ops.rotate(bm2, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, "Z"), verts=geo["verts"])
            q = (p0 + p1) / 2 + n_ext * 0.3
            bmesh.ops.translate(bm2, vec=(q.x, q.y, h - 0.35), verts=geo["verts"])
            objs.append(C.objet_maillage(nom + "_parapet%d" % i, bm2, m["pierre"]))
            p0, p1 = p0 + n_ext * 0.3, p1 + n_ext * 0.3
        C.creneaux_ligne(bm, (p0.x, p0.y), (p1.x, p1.y), h, h=0.6, ep=0.36, pas=1.0 if merlons == "carre" else 1.35,
                         forme=merlons, manque=0.4 if etat == "abime" else 0.0, rnd=rnd)
        objs.append(C.objet_maillage(nom + "_crn%d" % i, bm, m["pierre"] if merlons == "carre" else m[mat]))
    return objs


def porte_arc(nom, x, y, largeur, hauteur, m, outrepasse=False, rot_z=0.0, herse=False, encadrement=True, seuil=0.7,
              alterne=None, profondeur=0.0, fentes=0):
    """Porte dans une façade tournée vers -Y (avant rotation rot_z autour de (x, y)) : vantaux de bois cloutés en retrait
    dans un encadrement de pierre claire (claveaux), seuil de pierre éclairé, herse levée en option.
    outrepasse : arc outrepassé haut et étroit (hauteur ≥ 1,6 × largeur), dans un alfiz.
    alterne : (matière 1, matière 2) : claveaux alternés (brique et pierre ocre, à la manière d'al-Andalus).
    profondeur : retrait supplémentaire des vantaux (porte bien en creux, embrasure visible).
    fentes : nombre de fentes de jour sombres entre les planches des vantaux."""
    objs = []
    r = largeur / 2

    def contour(marge=0.0):
        rr = r + marge
        pts = []
        if outrepasse:
            cz = hauteur - rr * 1.05 + marge * 0.2
            for k in range(29):
                a = math.radians(-38 + (180 + 76) * k / 28)
                pts.append((rr * 1.14 * math.cos(a), cz + rr * 1.14 * math.sin(a)))
            pts = [(rr, 0)] + [(max(-rr, min(rr, px)) if pz < cz else px, pz) for px, pz in pts] + [(-rr, 0)]
        else:
            for k in range(17):
                a = math.radians(180 * k / 16)
                pts.append((rr * math.cos(a), hauteur - r + marge + rr * math.sin(a) * 1.25))
            pts = [(rr, 0)] + pts + [(-rr, 0)]
        return pts

    def plaque(nom_p, pts, y0, y1, mat):
        bm = bmesh.new()
        av = [bm.verts.new((px, y0, pz)) for px, pz in pts]
        ar = [bm.verts.new((px, y1, pz)) for px, pz in pts]
        bm.faces.new(av[::-1])
        bm.faces.new(ar)
        for k in range(len(pts)):
            bm.faces.new((av[k], av[(k + 1) % len(pts)], ar[(k + 1) % len(pts)], ar[k]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        ob = C.objet_maillage(nom_p, bm, mat)
        return ob

    groupe = []
    yv = -0.04 + profondeur
    # vantaux (bois clair, planches verticales), en retrait derrière le nu de l'encadrement
    groupe.append(plaque(nom + "_vantaux", contour(0.0), yv, yv + 0.16, m["vantail"]))
    if profondeur > 0:
        # embrasure : le tableau de la baie, en creux et dans l'ombre
        ext = contour(0.08)
        inn = contour(0.0)
        bm = bmesh.new()
        av = [bm.verts.new((px, -0.18, pz)) for px, pz in ext]
        ar = [bm.verts.new((px, yv + 0.02, pz)) for px, pz in inn]
        for k in range(len(ext) - 1):
            bm.faces.new((av[k], av[k + 1], ar[k + 1], ar[k]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        groupe.append(C.objet_maillage(nom + "_embrasure", bm, m["mur"] if "mur" in m else m["pierre"]))
    # joint central et pentures de fer
    groupe.append(C.boite(nom + "_joint", 0.05, 0.02, hauteur * 0.92, (0, yv - 0.01, 0), m["noir"]))
    for k, zz in enumerate((0.25, 0.55)):
        groupe.append(C.boite(nom + "_penture%d" % k, largeur * 0.9, 0.03, 0.09, (0, yv - 0.02, hauteur * zz), m["fer"]))
    for k in range(fentes):
        xx = -r * 0.62 + k * r * 1.24 / max(1, fentes - 1) if fentes > 1 else r * 0.4
        groupe.append(C.boite(nom + "_jour%d" % k, 0.035, 0.02, hauteur * 0.5, (xx, yv - 0.012, hauteur * 0.12), m["noir"]))
    if herse:
        # herse levée : seul son bas, à pointes, dépasse sous l'arc
        hz = hauteur - r * 0.9
        for k in range(7):
            xx = -r * 0.85 + k * r * 1.7 / 6
            groupe.append(C.boite(nom + "_herse_v%d" % k, 0.07, 0.07, r * 0.75, (xx, -0.1, hz), m["fer"]))
            groupe.append(C.cone(nom + "_herse_p%d" % k, 0.05, 0.16, (xx, -0.1, hz - 0.15), m["fer"], segments=4))
            groupe[-1].rotation_euler.x = math.pi
            groupe[-1].location.z = hz + 0.01
        groupe.append(C.boite(nom + "_herse_h", largeur * 0.92, 0.07, 0.07, (0, -0.1, hz + 0.12), m["fer"]))
    if encadrement:
        # claveaux : un anneau de pierre claire autour de l'arc, en saillie de 0,15 m (alternés si demandé)
        ext = contour(0.42)
        inn = contour(0.0)
        bm = bmesh.new()
        n = len(inn)
        av_e = [bm.verts.new((px, -0.19, pz)) for px, pz in ext]
        av_i = [bm.verts.new((px, -0.19, pz)) for px, pz in inn]
        ar_e = [bm.verts.new((px, 0.05, pz)) for px, pz in ext]
        ar_i = [bm.verts.new((px, 0.05, pz)) for px, pz in inn]
        for k in range(1, n - 2):
            idx = ((k - 1) // 2) % 2 if alterne else 0
            for f in (bm.faces.new((av_e[k], av_e[k + 1], av_i[k + 1], av_i[k])),
                      bm.faces.new((av_i[k], av_i[k + 1], ar_i[k + 1], ar_i[k])),
                      bm.faces.new((ar_e[k + 1], av_e[k + 1], av_e[k], ar_e[k]))):
                f.material_index = idx
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        cl = C.objet_maillage(nom + "_claveaux", bm, alterne[0] if alterne else m["clair"])
        if alterne:
            cl.data.materials.append(alterne[1])
        groupe.append(cl)
        groupe.append(C.boite(nom + "_seuil", largeur + 0.9, seuil, 0.14, (0, -0.3 * seuil / 0.7, 0), m["clair"]))
        if outrepasse:
            # alfiz : encadrement rectangulaire en relief autour de l'arc
            for (dx, dz, sx, sz) in ((0, hauteur + 0.55, largeur + 1.4, 0.28),
                                     (-(largeur / 2 + 0.6), (hauteur + 0.7) / 2, 0.28, hauteur + 0.7),
                                     ((largeur / 2 + 0.6), (hauteur + 0.7) / 2, 0.28, hauteur + 0.7)):
                groupe.append(C.boite(nom + "_alfiz", sx, 0.16, sz, (dx, -0.12, dz - sz / 2), m["clair"]))
    p = C.lier(bpy.data.objects.new(nom + "_porte", None))
    for o in groupe:
        o.parent = p
    p.location = (x, y, 0)
    p.rotation_euler.z = rot_z
    return groupe + [p]


def eboulis(nom, centre, rayon, nombre, m, graine=1):
    """Tas de pierres tombées (états abîmé et ruiné)."""
    rnd = random.Random(graine)
    objs = []
    for k in range(nombre):
        a = rnd.uniform(0, 2 * math.pi)
        d = rayon * math.sqrt(rnd.random())
        s = rnd.uniform(0.3, 0.8)
        o = C.boite(nom + "_%d" % k, s, s * rnd.uniform(0.7, 1.3), s * 0.7,
                    (centre[0] + d * math.cos(a), centre[1] + d * math.sin(a), 0), m["eboulis"])
        o.rotation_euler = (rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), rnd.uniform(0, 3))
        objs.append(o)
    return objs


def cour(nom, x0, x1, y0, y1, m):
    """Sol de la cour (terre battue) à l'intérieur de l'enceinte."""
    return [C.boite(nom, x1 - x0, y1 - y0, 0.06, ((x0 + x1) / 2, (y0 + y1) / 2, 0), m["sol"])]


def accessoires_cour(nom, pts, m, graine=0):
    """Vie de la cour : tonneaux, caisses, charrette, tas de foin (la cour n'est plus une boîte vide)."""
    rnd = random.Random(graine)
    objs = []
    foin = C.mat_simple("foin", "#b39a5a", rugosite=1.0, bosse=0.6, echelle_bosse=30)
    for k, (x, y, sorte) in enumerate(pts):
        if sorte == "tonneaux":
            for i in range(3):
                objs.append(C.cylindre(nom + "_tonneau%d_%d" % (k, i), 0.38, 0.9, (x + (i % 2) * 0.8, y + (i // 2) * 0.8, 0),
                                       m["bois"], segments=12))
        elif sorte == "caisses":
            for i in range(3):
                objs.append(C.boite(nom + "_caisse%d_%d" % (k, i), 0.8, 0.8, 0.7, (x + i * 0.9, y + rnd.uniform(-0.2, 0.2), 0),
                                    m["bois"], rot_z=rnd.uniform(-0.3, 0.3)))
        elif sorte == "foin":
            o = C.sphere(nom + "_foin%d" % k, 1.0, (x, y, 0.2), foin, subdiv=2, echelle=(1.3, 1.0, 0.75))
            objs.append(o)
        elif sorte == "puits":
            objs.append(C.cylindre(nom + "_puits%d" % k, 0.9, 0.9, (x, y, 0), m["pierre"], segments=16))
            objs.append(C.cylindre(nom + "_puits_eau%d" % k, 0.7, 0.92, (x, y, 0), m["noir"], segments=16))
            for sx in (-0.75, 0.75):
                objs.append(C.boite(nom + "_puits_mont%d_%d" % (k, int(sx * 10)), 0.12, 0.12, 2.0, (x + sx, y, 0), m["bois"]))
            objs.append(C.boite(nom + "_puits_trav%d" % k, 1.7, 0.12, 0.12, (x, y, 1.95), m["bois"]))
    return objs


def texture_rayee(nom, c1, c2, n=8):
    """Toile rayée (auvents) : bandes alternées c1 / c2."""
    import numpy as np
    from PIL import Image
    chemin = os.path.join(C.CACHE, nom + ".png")
    W, H = 256, 128
    im = np.zeros((H, W, 3), dtype=np.uint8)
    for k in range(n):
        im[:, k * W // n:(k + 1) * W // n] = C.rgb8(c1 if k % 2 == 0 else c2)
    Image.fromarray(im).save(chemin)
    return chemin


def auvent(nom, x, y, z, larg, prof, mat, rot_z=0.0):
    """Auvent de toile tendu (pente vers l'avant, -Y) sur deux perches."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    p = [bm.verts.new(v) for v in ((-larg / 2, 0, 0), (larg / 2, 0, 0), (larg / 2, -prof, -0.5), (-larg / 2, -prof, -0.5))]
    f = bm.faces.new(p)
    for lp, uvv in zip(f.loops, ((0, 1), (1, 1), (1, 0), (0, 0))):
        lp[uv].uv = uvv
    ob = C.objet_maillage(nom, bm, mat)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.03
    perches = []
    for sx in (-larg / 2 + 0.1, larg / 2 - 0.1):
        perches.append(C.cylindre(nom + "_perche%d" % int(sx * 10), 0.05, z - 0.5, (sx, -prof + 0.05, -(z - 0.0)),
                                  C.mat_simple("perche", "#5a4128"), segments=6))
    pv = C.lier(bpy.data.objects.new(nom + "_pv", None))
    ob.parent = pv
    for q in perches:
        q.parent = pv
    pv.location = (x, y, z)
    pv.rotation_euler.z = rot_z
    return [ob, pv] + perches


def auvent_tuiles(nom, x, y, z, larg, prof, m, rot_z=0.0):
    """Petit auvent de tuiles vernissées vertes (tejaroz) sur deux consoles de bois, face vers -Y avant rotation."""
    if "tuiles_vertes" not in m:
        m["tuiles_vertes"] = C.mat_toit("tuiles_vertes", "clay_roof_tiles", "#2c6a4e", rang_m=0.22, largeur_m=0.2,
                                        echelle_m=2.0, rugosite=(0.45, 0.6), speculaire=0.3)
    ob = toit_deux_pans(nom, -larg / 2, larg / 2, -prof, prof, 0.0, 0.55, m["tuiles_vertes"], debord=0.1)
    # on ne garde que le pan avant : le pan arrière est noyé dans le mur
    ob.location = (0, 0, 0)
    pv = C.lier(bpy.data.objects.new(nom + "_pv", None))
    ob.parent = pv
    pv.location = (x, y, z)
    pv.rotation_euler.z = rot_z
    return [ob, pv]


def tentures_et_bannieres(camp, poses, m):
    """Tentures (largeur, hauteur, loc, rot_z) aux couleurs du camp."""
    objs = []
    for k, (lg, ht, loc, rz) in enumerate(poses):
        objs += C.tenture("tenture%d" % k, camp, lg, ht, loc=loc, rot_z=rz, graine=k, mat_tringle=m["bois"])
    return objs


def bloc_ruine(nom, cx, cy, lx, ly, h, mat, m, graine=0, frac=(0.3, 0.65), ep=0.6):
    """Bâtiment rectangulaire en ruine (donjon, logis, maison) : murs creux arrachés à une arête déchiquetée, gravats
    au fond."""
    e = ep / 2
    coins = [(cx - lx / 2 + e, cy - ly / 2 + e), (cx + lx / 2 - e, cy - ly / 2 + e), (cx + lx / 2 - e, cy + ly / 2 - e),
             (cx - lx / 2 + e, cy + ly / 2 - e)]
    pts = []
    for k in range(4):
        pts += points_segment(coins[k], coins[(k + 1) % 4])[:-1]
    objs = [ruban_dechire(nom, pts, profil_dechire(len(pts), h, frac, graine, ferme=True), ep, mat, ferme=True)]
    objs.append(C.boite(nom + "_gravats", lx - 2 * ep, ly - 2 * ep, 0.5, (cx, cy, 0), m["eboulis"]))
    return objs


def poutres_brulees(nom, pts, m, graine=0):
    """Poutres calcinées tombées dans la cour (place en ruine)."""
    rnd = random.Random(graine)
    objs = []
    for k, (x, y) in enumerate(pts):
        o = C.boite(nom + "%d" % k, rnd.uniform(2.0, 3.4), 0.22, 0.22, (x, y, 0.1), m["suie"])
        o.rotation_euler = (rnd.uniform(-0.15, 0.15), rnd.uniform(-0.25, 0.1), rnd.uniform(0, 3.1))
        objs.append(o)
    return objs


# ---------------------------------------------------------------- les trois places fortes
# Repère local de chaque place : cour centrée sur l'origine (= point d'ancrage), enceinte alignée sur les axes ;
# le tout est ensuite tourné de 32° (LACET). Faces vues : sud (après rotation : sud-est, à droite) et ouest (après
# rotation : sud-ouest, à gauche). Les brèches sont ouvertes dans ces murs vus, pour que l'état se lise.
def chateau_france(etat="intact"):
    m = matieres("france", etat, echelle_tex=1.3)
    m["or"] = C.mat_metal("or", "#c9a24a", rugosite=0.35)
    o = []
    ruine = etat == "ruine"
    abime = etat == "abime"
    X, Y = ENCEINTES["france"]
    # abîmé : l'assaut a porté sur l'angle avant (le plus proche de la caméra) : tour t0 cassée, tour de porte de gauche
    # sans toit, brèche dans la courtine sud de gauche (face caméra) entre les deux
    breche_sud_g = (0.36, 0.68)
    if abime:
        xb = -X + (X - 2.6) * sum(breche_sud_g) / 2
        noircir(m, [(xb, -Y, 4.2, 2.8, 4.6),            # tiers haut de la courtine autour de la brèche
                    (-X, -Y, 3.1, 2.6, 4.4),           # haut du fût cassé de la tour avant
                    (-X, -Y + 3.4, 3.6, 2.8, 4.8),     # courtine ouest, contre la tour cassée
                    (-2.9, -Y - 0.6, 2.4, 5.6, 7.6),   # haut de la tour de porte dont le toit a brûlé
                    (1.2, Y - 2.3, 5.0, 2.6, 4.6),     # haut des murs du logis, dont le toit a brûlé
                    (-4.2, 1.6, 6.4, 8.6, 12.4),       # tiers haut du donjon, dont le grand toit a brûlé
                    (6.2, -Y, 3.8, 2.8, 4.6),          # courtine à droite de la porte, côté d'où vient l'ennemi
                    # sans la colonne de fumée cuite (le jeu l'anime), l'incendie se lit à la suie : haut de la tour
                    # avant droite et de la tour de porte de droite, léchés par les flammes
                    (X, -Y, 3.0, 5.4, 8.6),
                    (2.9, -Y - 0.6, 2.3, 5.8, 8.8)])
    o += cour("cour", -X, X, -Y, Y, m)
    # courtines à mâchicoulis ; porte sur la face sud (vers l'est-sud-est une fois tournée : la route part à droite)
    o += courtine("c_sud_g", (-X, -Y), (-2.6, -Y), 6.4, 1.0, m, etat, machicoulis=True,
                  breche=breche_sud_g if abime else None, graine=1)
    o += courtine("c_sud_d", (2.6, -Y), (X, -Y), 6.4, 1.0, m, etat, machicoulis=True,
                  breche=(0.3, 0.68) if ruine else None, graine=2)
    o += courtine("c_est", (X, -Y), (X, Y), 6.6, 1.0, m, etat, machicoulis=True, graine=3)
    o += courtine("c_nord", (X, Y), (-X, Y), 6.8, 1.0, m, etat, machicoulis=True, graine=4)
    o += courtine("c_ouest", (-X, Y), (-X, -Y), 6.6, 1.0, m, etat, machicoulis=True, breche=(0.3, 0.6) if ruine else None,
                  graine=5)
    # quatre tours d'angle coiffées d'ardoises, de hauteurs variées (± 20 %) ; abîmé : la tour avant (t0, la plus basse
    # à l'écran) a perdu son toit, son fût est coupé à 60 % (charpente brûlée) et il en monte de la fumée
    for i, (x, y, r, h, arch) in enumerate(((-X, -Y, 2.1, 9.0, ((200, 0.45), (250, 0.7))),
                                            (X, -Y, 1.9, 10.6, ((285, 0.5), (330, 0.72))),
                                            (-X, Y, 2.0, 11.8, ((190, 0.6),)),
                                            (X, Y, 2.2, 8.6, ((0, 0.5),)))):
        o += tour_ronde("t%d" % i, x, y, r, h, m, etat=etat, graine=i, archeres=arch, toit=True,
                        h_toit=2.0 * (r + 0.3), cassee=abime and i == 0)
    if abime:
        o += foyer("tour", -X, -Y, 9.0 * 0.62)           # fût cassé de la tour avant
        o += foyer("donjon", -4.2, 1.6, 14.5 + 1.2)        # comble du donjon, dont le grand toit a brûlé
    # châtelet : deux tours de porte et la grande porte (vantaux, herse levée) ; abîmé : le cône d'ardoises de la tour de
    # gauche a brûlé
    for i, x in enumerate((-2.9, 2.9)):
        o += tour_ronde("p%d" % i, x, -Y - 0.6, 1.6, 9.4 + 0.6 * i, m, etat=etat, graine=10 + i,
                        archeres=((245 if x < 0 else 295, 0.6),), brulee=abime and i == 0)
    if ruine:
        o += bloc_ruine("porte_corps", 0, -Y + 0.2, 4.4, 2.8, 7.6, m["pierre"], m, graine=12, frac=(0.45, 0.7))
    else:
        o.append(C.boite("porte_corps", 4.4, 2.8, 7.6, (0, -Y + 0.2, 0), m["pierre"]))
    m_porte = m
    if abime:          # vantaux calcinés par le feu mis à la porte
        m_porte = dict(m, vantail=C.mat_ph("vantail_brule", "medieval_wood", echelle_m=1.2, cible="#2b2119", contraste=1.5,
                                           bosse=0.5, projection="BOITE"))
    o += porte_arc("porte", 0, -Y - 1.21, 3.0, 5.0, m_porte, herse=not ruine)
    if not ruine:
        o.append(corbeaux_ligne("porte_mach", (-2.0, -Y - 1.2), (2.0, -Y - 1.2), 6.9, m["pierre"]))
        bm = bmesh.new()
        C.creneaux_ligne(bm, (-2.1, -Y - 1.45), (2.1, -Y - 1.45), 7.6, h=0.6, ep=0.36, pas=1.0,
                         manque=0.4 if etat == "abime" else 0.0, rnd=random.Random(3))
        o.append(C.objet_maillage("porte_crn", bm, m["pierre"]))
        o.append(C.boite("porte_parapet", 4.6, 0.5, 0.7, (0, -Y - 1.45, 6.9), m["pierre"]))
    # logis le long du mur nord, toit d'ardoise à deux pans, cheminées
    if ruine:
        o += bloc_ruine("logis", 2.6, Y - 2.3, 9.5, 3.4, 5.0, m["pierre"], m, graine=13, frac=(0.3, 0.6))
    else:
        o.append(C.boite("logis", 9.5, 3.4, 5.0, (2.6, Y - 2.3, 0), m["pierre"]))
        if abime:
            # le toit du logis a brûlé : charpente calcinée, un bout d'ardoises à l'est ; une seconde colonne de fumée
            # monte au-dessus de l'arrière du château, où elle se détache du terrain
            o += charpente_brulee("logis_toit", -2.15, 7.35, Y - 4.0, Y - 0.6, 5.0, 3.0, m, reste=0.28, graine=13)
            o += foyer("logis", 1.2, Y - 2.3, 5.6)
        else:
            o.append(toit_deux_pans("logis_toit", -2.15, 7.35, Y - 4.0, Y - 0.6, 5.0, 3.0, m["toit"]))
        o.append(C.boite("logis_chem", 0.7, 0.7, 2.6, (5.5, Y - 1.6, 6.2), m["pierre"]))
        for k in range(3):
            o.append(C.boite("logis_fen%d" % k, 0.5, 0.06, 1.0, (0.2 + k * 2.6, Y - 4.03, 2.4), m["noir"]))
    # donjon carré (au fond, à gauche), toit en croupe raide à faîtage, deux lucarnes, cheminées
    dx, dy, cote = -4.2, 1.6, 6.0
    h_donjon = 14.5
    o.append(C.boite("donjon_talus", cote + 0.9, cote + 0.9, 1.8, (dx, dy, 0), m["pierre"]))
    if ruine:
        o += bloc_ruine("donjon", dx, dy, cote, cote, h_donjon, m["pierre"], m, graine=14, frac=(0.4, 0.68), ep=0.9)
    else:
        dj = C.boite("donjon", cote, cote, h_donjon, (dx, dy, 0), m["pierre"])
        C.biseau(dj, 0.05)
        o.append(dj)
        o.append(C.boite("donjon_corniche", cote + 0.5, cote + 0.5, 0.5, (dx, dy, h_donjon - 0.5), m["pierre"]))
        for k, (a, b) in enumerate((((dx - cote / 2, dy - cote / 2), (dx + cote / 2, dy - cote / 2)),
                                    ((dx - cote / 2, dy + cote / 2), (dx - cote / 2, dy - cote / 2)))):
            o.append(corbeaux_ligne("donjon_mach%d" % k, a, b, h_donjon - 1.2, m["pierre"]))
        if abime:
            # le grand toit a brûlé : charpente calcinée sur un comble de braises ; les lucarnes sont tombées
            o += charpente_croupe("donjon_toit", dx, dy, cote + 0.2, cote - 0.6, h_donjon, 6.2, m, debord=0.3, graine=14)
        else:
            o.append(toit_croupe("donjon_toit", dx, dy, cote + 0.2, cote - 0.6, h_donjon, 6.2, m["toit"], debord=0.3))
            for k, sx in enumerate((-1.3, 1.3)):         # lucarnes sur le pan sud, en saillie sur l'égout
                ly = dy - cote / 2 + 0.55
                o.append(C.boite("lucarne%d" % k, 1.1, 1.1, 1.9, (dx + sx, ly, h_donjon - 0.3), m["pierre"]))
                o += cone_uv("lucarne_toit%d" % k, 0.95, 1.1, (dx + sx, ly, h_donjon + 1.6), m["toit"], pans=4,
                             rot=math.pi / 4)
                o.append(C.boite("lucarne_fen%d" % k, 0.5, 0.06, 0.8, (dx + sx, ly - 0.57, h_donjon + 0.4), m["noir"]))
            o += [C.cylindre("donjon_epi_m", 0.05, 1.2, (dx + s * 1.2, dy, h_donjon + 6.1), m["or"], segments=8)
                  for s in (-1, 1)]
        for k, sx in enumerate((-2.0, 2.2)):
            o.append(C.boite("donjon_chem%d" % k, 0.8, 0.8, 3.4, (dx + sx, dy + 0.9, h_donjon + 3.0), m["pierre"]))
        for k, (sx, sy) in enumerate(((-1, -1), (1, -1), (-1, 1))):
            tx, ty = dx + sx * cote / 2, dy + sy * cote / 2
            o.append(C.cylindre("echauguette%d" % k, 0.75, 2.8, (tx, ty, h_donjon - 2.4), m["pierre"], segments=16))
            if abime and sy < 0:        # abîmé : les deux échauguettes de devant ont perdu leur toit
                o += chevrons_brules("echauguette%d" % k, tx, ty, h_donjon + 0.2, 0.75, m, graine=20 + k, nombre=3)
            else:
                o += cone_uv("echauguette_toit%d" % k, 0.95, 1.7, (tx, ty, h_donjon + 0.35), m["toit"], segments=16)
        for k in (-1, 1):
            o.append(C.boite("donjon_fenetre%d" % k, 0.5, 0.06, 1.2, (dx + k * 1.5, dy - cote / 2 - 0.02, h_donjon * 0.6), m["noir"]))
    # couleurs du camp : deux grandes tentures sur la porte, grande bannière au faîte du donjon, flamme de tour
    if not ruine:
        o += tentures_et_bannieres("france", [(3.0, 6.4, (-2.9, -Y - 2.25, 8.8), 0.0), (3.0, 6.4, (2.9, -Y - 2.25, 9.4), 0.0),
                                              (3.0, 5.6, (-X - 1.05, -0.3, 6.2), -math.pi / 2)], m)
        if abime:
            o += banniere_dechiree("ban_donjon", "france", (dx, dy, h_donjon + 6.0), m, inclinaison=(0.2, -0.3),
                                   hauteur_mat=3.6, longueur=4.6, hauteur=3.0, dechire=0.35, vent=0.7)
        else:
            o += C.drapeau("ban_donjon", "france", 3.6, 4.4, 2.9, loc=(dx, dy, h_donjon + 6.2), vent=1.0, epi=True, cap=CAP)
        o += C.drapeau("ban_t1", "france", 2.6, 2.0, 1.3, loc=(-X, Y, 11.8 + 0.7 + 2.0 * 2.3), vent=1.0, phase=1.3, cap=CAP)
    else:
        o += banniere_dechiree("ban_ruine", "france", (-1.5, -2.2, 0.0), m)
    # suie : au-dessus de la porte et des fenêtres, sur la cour ; poutres calcinées
    if etat != "intact":
        o.append(decalque("suie_porte", (0, -Y - 1.48, 3.6 if not ruine else 2.6), 3.6, 4.2, m["suie_mur"]))
        o += suie_cour("suie_cour", [(1.5, -1.0, 3.2), (-1.0, 2.6, 2.4)] + ([(4.5, 1.5, 3.0), (-6.0, -3.0, 2.2)] if ruine else []),
                       m, graine=4)
        if not ruine:
            for k in (-1, 1):
                o.append(decalque("suie_fen%d" % k, (dx + k * 1.5, dy - cote / 2 - 0.06, h_donjon * 0.6 + 0.4), 1.6, 2.6,
                                  m["suie_mur"]))
    if ruine:
        o += poutres_brulees("poutre", [(2.0, -2.0), (-1.0, 0.8), (4.8, 2.4)], m, graine=7)
        o += foyer("donjon", -4.2, 1.6, 6.5) + foyer("logis", 3.4, Y - 2.3, 2.4) + foyer("cour", 2.0, -2.0, 0.6)
    else:
        o += accessoires_cour("cour", [(4.0, -2.5, "tonneaux"), (-1.0, -3.0, "foin"), (6.0, 0.5, "caisses")], m)
    return o


def chateau_angleterre(etat="intact"):
    m = matieres("angleterre", etat, echelle_tex=1.0)
    m["or"] = C.mat_metal("or", "#b89b5a", rugosite=0.45, metal=0.8)
    o = []
    ruine = etat == "ruine"
    abime = etat == "abime"
    X, Y = ENCEINTES["angleterre"]           # enceinte plus profonde que large : la face ouest (porte) est longue
    # abîmé : tour avant t0 cassée (la plus basse à l'écran), brèche dans la courtine sud (face caméra), près d'elle
    breche_sud = (0.15, 0.6) if abime else (0.3, 0.6)
    if abime:
        xb = -X + 2 * X * sum(breche_sud) / 2
        noircir(m, [(xb, -Y, 4.2, 2.6, 4.4),            # tiers haut de la courtine autour de la brèche
                    (-X, -Y, 3.0, 2.8, 4.7),           # haut du fût cassé de la tour avant
                    (-X - 0.3, 0.0, 3.8, 5.4, 8.0),    # haut du châtelet, dont le toit a brûlé
                    (1.2, -Y + 2.6, 4.2, 2.2, 4.0),    # murs de la grande salle, dont le toit a brûlé
                    (1.6, 3.4, 6.0, 9.0, 12.6),        # tiers haut du donjon
                    # sans la colonne de fumée cuite (le jeu l'anime), l'incendie se lit à la suie : tour avant droite,
                    # courtine ouest au sud du châtelet
                    (X, -Y, 3.0, 4.6, 7.4),
                    (-X, -5.0, 3.2, 3.0, 5.0)])
    o += cour("cour", -X, X, -Y, Y, m)
    o += courtine("c_ouest_s", (-X, -2.7), (-X, -Y), 6.2, 1.1, m, etat, graine=1)
    o += courtine("c_ouest_n", (-X, Y), (-X, 2.7), 6.2, 1.1, m, etat, breche=(0.3, 0.65) if ruine else None, graine=2)
    o += courtine("c_sud", (-X, -Y), (X, -Y), 6.0, 1.1, m, etat, breche=breche_sud if etat != "intact" else None, graine=3)
    o += courtine("c_est", (X, -Y), (X, Y), 6.4, 1.1, m, etat, graine=4)
    o += courtine("c_nord", (X, Y), (-X, Y), 6.4, 1.1, m, etat, graine=5)
    for i, (x, y, r, h) in enumerate(((-X, -Y, 2.0, 9.4), (X, -Y, 2.1, 8.4), (-X, Y, 2.0, 10.2), (X, Y, 2.2, 9.6))):
        o += tour_ronde("t%d" % i, x, y, r, h, m, etat=etat, graine=20 + i, machicoulis=False,
                        archeres=((200 + 40 * i, 0.5),), epi=False, cassee=abime and i == 0,
                        brulee=abime and i == 1)      # abîmé : la tour avant droite a perdu son toit de tuiles
    if abime:
        o += foyer("tour", -X, -Y, 9.4 * 0.62)           # fût cassé de la tour avant
        o += foyer("chatelet", -X - 0.3, 0, 9.0 + 0.6)   # toit brûlé du châtelet
        o += foyer("tour_d", X, -Y, 8.4 + 0.4)             # tour avant droite, toit brûlé
    # châtelet carré massif à créneaux sur la face ouest ; porte vers l'ouest (vers l'arrivée de la route)
    o += tour_carree("chatelet", -X - 0.3, 0, 5.4, 9.0, m, etat=etat, graine=7, archeres=None, toit=etat == "intact")
    m_porte = m
    if abime:
        # le toit pyramidal du châtelet a brûlé (charpente sur un lit de braises) ; vantaux calcinés
        o += charpente_croupe("chatelet_toit", -X - 0.3, 0, 4.9, 4.9, 9.0, 4.4, m, debord=0.0, graine=7)
        m_porte = dict(m, vantail=C.mat_ph("vantail_brule", "medieval_wood", echelle_m=1.2, cible="#2b2119", contraste=1.5,
                                           bosse=0.5, projection="BOITE"))
    o += porte_arc("porte", -X - SAILLIE_PORTE, 0, 2.6, 4.4, m_porte, rot_z=-math.pi / 2, herse=not ruine)
    # donjon normand (au fond, à droite) : grand carré à contreforts plats, toit de plomb gris en pavillon bas
    dx, dy, cote = 1.6, 3.4, 6.6
    h_donjon = 14.5
    o.append(C.boite("donjon_talus", cote + 0.9, cote + 0.9, 1.8, (dx, dy, 0), m["pierre"]))
    if ruine:
        o += bloc_ruine("donjon", dx, dy, cote, cote, h_donjon, m["pierre"], m, graine=24, frac=(0.4, 0.68), ep=0.9)
    else:
        dj = C.boite("donjon", cote, cote, h_donjon, (dx, dy, 0), m["pierre"])
        C.biseau(dj, 0.05)
        o.append(dj)
    hc = h_donjon - 0.8 if not ruine else h_donjon * 0.4
    for k in (-1, 0, 1):        # contreforts plats sur les faces vues (sud et ouest)
        o.append(C.boite("contrefort_s%d" % k, 0.8, 0.45, hc, (dx + k * cote * 0.42, dy - cote / 2 - 0.2, 0), m["pierre"]))
        o.append(C.boite("contrefort_o%d" % k, 0.45, 0.8, hc, (dx - cote / 2 - 0.2, dy + k * cote * 0.42, 0), m["pierre"]))
    if not ruine:
        bm = bmesh.new()
        d = cote / 2 + 0.05
        coins = [(dx - d, dy - d), (dx + d, dy - d), (dx + d, dy + d), (dx - d, dy + d)]
        rnd = random.Random(5)
        for k in range(4):
            C.creneaux_ligne(bm, coins[k], coins[(k + 1) % 4], h_donjon, h=0.7, ep=0.42, pas=1.0,
                             manque=0.4 if etat == "abime" else 0.0, rnd=rnd)
        o.append(C.objet_maillage("donjon_crn", bm, m["pierre"]))
        # toit de plomb gris neutre en pavillon bas (pyramide), feuilles marquées par des joints
        if abime:          # le toit de plomb a fondu : charpente basse calcinée sur un lit de braises
            o += charpente_croupe("donjon_toit", dx, dy, cote - 0.5, cote - 0.5, h_donjon, 1.6, m, debord=0.0, graine=24)
        else:
            o += cone_uv("donjon_toit", (cote - 0.3) * 0.7071, 1.4, (dx, dy, h_donjon), m["plomb"], pans=4,
                         rot=math.pi / 4)
        for k, (sx, sy) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
            o += tour_carree("tourelle%d" % k, dx + sx * (cote / 2 - 0.6), dy + sy * (cote / 2 - 0.6), 1.6, h_donjon + 2.2, m,
                             etat=etat, graine=30 + k, archeres=None)
        for k in (-1, 1):
            o.append(C.boite("donjon_fenetre%d" % k, 0.45, 0.06, 1.2, (dx + k * 1.4, dy - cote / 2 - 0.42, h_donjon * 0.6), m["noir"]))
    # grande salle à toit de tuiles contre le mur sud
    if ruine:
        o += bloc_ruine("salle", 1.2, -Y + 2.6, 6.0, 3.6, 4.4, m["pierre"], m, graine=25, frac=(0.3, 0.6))
    else:
        o.append(C.boite("salle", 6.0, 3.6, 4.4, (1.2, -Y + 2.6, 0), m["pierre"]))
        if abime:          # toit de tuiles brûlé, un bout encore couvert à l'est ; seconde colonne de fumée
            o += charpente_brulee("salle_toit", -1.8, 4.2, -Y + 0.8, -Y + 4.4, 4.4, 2.6, m, reste=0.3, graine=25)
        else:
            o.append(toit_deux_pans("salle_toit", -1.8, 4.2, -Y + 0.8, -Y + 4.4, 4.4, 2.6, m["toit"]))
    # couleurs : tentures de gueules au lion sur le châtelet (face ouest) et le donjon, bannière au donjon, flamme de tour
    if not ruine:
        o += tentures_et_bannieres("angleterre", [(2.6, 5.2, (-X - 0.75, -5.0, 6.0), -math.pi / 2),
                                                  (2.6, 5.2, (-X - 0.75, 5.0, 6.0), -math.pi / 2),
                                                  (2.6, 3.4, (-X - 3.08, 0.0, 8.7), -math.pi / 2),
                                                  (3.0, 5.6, (dx + 0.3, dy - cote / 2 - 0.5, h_donjon - 1.4), 0.0)], m)
        if abime:
            o += banniere_dechiree("ban_donjon", "angleterre", (dx - cote / 2 + 0.6, dy - cote / 2 + 0.6, h_donjon + 2.0), m,
                                   inclinaison=(0.22, -0.34), hauteur_mat=3.6, longueur=3.8, hauteur=2.6, dechire=0.45,
                                   vent=0.7)
        else:
            o += C.drapeau("ban_donjon", "angleterre", 3.6, 4.2, 2.8,
                           loc=(dx - cote / 2 + 0.6, dy - cote / 2 + 0.6, h_donjon + 2.2), vent=1.0, cap=CAP)
        o += C.drapeau("ban_t1", "angleterre", 2.4, 2.0, 1.3, loc=(-X, Y, 10.2 + 2.3 * 2.3), vent=1.0, phase=1.1, cap=CAP)
    else:
        o += banniere_dechiree("ban_ruine", "angleterre", (-2.0, -2.0, 0.0), m)
    if etat != "intact":
        o.append(decalque("suie_porte", (-X - SAILLIE_PORTE - 0.25, 0, 3.4 if not ruine else 2.4), 3.0, 4.0, m["suie_mur"],
                          rot_z=-math.pi / 2))
        o += suie_cour("suie_cour", [(-2.0, 1.5, 3.0), (2.5, -3.5, 2.4)] + ([(-3.0, -5.5, 2.6), (3.0, 6.5, 2.2)] if ruine else []),
                       m, graine=6)
        if not ruine:
            for k in (-1, 1):
                o.append(decalque("suie_fen%d" % k, (dx + k * 1.4, dy - cote / 2 - 0.46, h_donjon * 0.6 + 0.4), 1.5, 2.6,
                                  m["suie_mur"]))
    if ruine:
        o += poutres_brulees("poutre", [(-2.5, -4.0), (2.0, 0.5), (-1.0, 5.5)], m, graine=8)
        o += foyer("donjon", 1.6, 3.4, 6.2) + foyer("salle", 1.2, -Y + 2.6, 2.0) + foyer("cour", -2.5, -4.0, 0.6)
    else:
        o += accessoires_cour("cour", [(-3.0, -5.5, "tonneaux"), (3.5, -4.0, "foin"), (-3.0, 5.0, "puits")], m)
    return o


def forteresse_omeyyade(etat="intact"):
    m = matieres("omeyyades", etat, echelle_tex=1.2)
    o = []
    ruine = etat == "ruine"
    abime = etat == "abime"
    X, Y = ENCEINTES["omeyyades"]
    # abîmé : tour avant t0 cassée (la plus basse à l'écran), brèche dans la courtine sud (face caméra) entre t0 et la
    # tour médiane, qui laisse voir la maison et son auvent
    breche_sud = (0.04, 0.6) if abime else (0.3, 0.62)
    if abime:
        xb = -X + 2 * X * sum(breche_sud) / 2
        noircir(m, [(xb, -Y, 4.4, 2.6, 4.6),            # tiers haut de la courtine autour de la brèche
                    (-X, -Y, 3.1, 2.6, 4.4),           # haut du fût cassé de la tour avant
                    (-2.4, -5.2, 3.6, 1.4, 3.2),       # murs de la maison incendiée derrière la brèche
                    (2.0, 3.8, 6.2, 6.0, 10.0),        # moitié haute de la tour maîtresse
                    (-X - 0.3, 0.0, 4.2, 5.4, 8.2),    # tiers haut de la tour-porte (l'assaillant vient de l'ouest)
                    (-X, -6.0, 3.6, 2.8, 4.6),         # courtine ouest, contre la tour cassée
                    (3.6, -Y, 3.6, 2.8, 4.8),          # courtine sud, à droite de la tour médiane (flèches enflammées)
                    (X, -Y, 3.0, 4.6, 6.8),            # tiers haut de la tour d'angle avant droite
                    # sans fumée cuite : suie sur les faces à l'ombre (est et sud ; le pisé éclairé, ivoire, compte
                    # comme couleur du camp), courtine est, tour d'angle arrière droite, face sud de la tour médiane
                    (X + 0.6, 0.0, 4.6, 2.6, 5.4),
                    (X, Y, 3.0, 4.4, 7.0),
                    (0.0, -Y - 1.2, 2.0, 3.6, 6.4),
                    (-X - 0.3, -2.7, 2.4, 3.4, 7.2),   # face sud de la tour-porte
                    (X - 0.8, Y - 0.8, 3.4, 2.8, 5.6)],  # angle intérieur nord-est (vu par-dessus la brèche)
                force=1.0)          # pisé clair : la suie doit le couvrir tout à fait pour se lire à 96 px
    o += cour("cour", -X, X, -Y, Y, m)
    # enceinte de pisé à merlons pyramidés, tours carrées à soubassement de moellons
    o += courtine("c_ouest_s", (-X, -2.9), (-X, -Y), 6.4, 1.2, m, etat, merlons="pointe", graine=1,
                  breche=(0.3, 0.75) if abime else None)   # abîmé : l'assaut venu de l'ouest a aussi ouvert ce mur
    o += courtine("c_ouest_n", (-X, Y), (-X, 2.9), 6.4, 1.2, m, etat, merlons="pointe", breche=(0.3, 0.65) if ruine else None,
                  graine=2)
    o += courtine("c_sud", (-X, -Y), (X, -Y), 6.6, 1.2, m, etat, merlons="pointe", breche=breche_sud if etat != "intact" else None,
                  graine=3)
    o += courtine("c_est", (X, -Y), (X, Y), 6.8, 1.2, m, etat, merlons="pointe", graine=4)
    o += courtine("c_nord", (X, Y), (-X, Y), 6.8, 1.2, m, etat, merlons="pointe", graine=5)
    for i, (x, y, h, arch) in enumerate(((-X, -Y, 8.8, "centre"), (X, -Y, 8.2, None), (-X, Y, 9.6, "cote"), (X, Y, 9.0, None))):
        o += tour_carree("t%d" % i, x, y, 3.3, h, m, merlons="pointe", etat=etat, graine=40 + i, mat="mur",
                         soubassement=("pierre", 2.5), archeres=arch, cassee=abime and i in (0, 1))
    if abime:
        o += foyer("tour", -X, -Y, 8.8 * 0.62)           # fût cassé de la tour avant
        o += foyer("tour_d", X, -Y, 8.2 * 0.62)          # fût cassé de la tour avant droite
    o += tour_carree("tm0", 0, -Y, 2.6, 7.8, m, merlons="pointe", etat=etat, graine=50, mat="mur",
                     soubassement=("pierre", 2.5), archeres="centre")
    # tour-porte carrée sur la face ouest : arc outrepassé profond, claveaux alternés brique et ocre, alfiz
    o += tour_carree("porte_tour", -X - 0.3, 0, 5.4, 9.4, m, merlons="pointe", etat=etat, graine=60, mat="mur",
                     soubassement=("pierre", 2.5), archeres=None)
    # vantaux peints en vert (couleur du camp), cloutés de fer
    m_porte = dict(m, vantail=C.mat_ph("vantail_vert", "medieval_wood", echelle_m=1.2, cible="#2f6a4c", contraste=1.2,
                                       bosse=0.5, projection="BOITE"))
    o += porte_arc("porte", -X - SAILLIE_PORTE, 0, 2.2, 4.4, m_porte, outrepasse=True, rot_z=-math.pi / 2,
                   alterne=(m["brique"], m["clair"]), profondeur=0.45, fentes=3)
    # grande tour maîtresse (large et trapue, au fond à droite), toit plat crénelé ; une seule baie, décalée
    dx, dy, cote = 2.0, 3.8, 6.4
    h_t = 13.0
    o += tour_carree("maitresse", dx, dy, cote, h_t, m, merlons="pointe", etat=etat, graine=61, mat="mur",
                     soubassement=("pierre", 2.5), archeres=None)
    if not ruine:
        o.append(C.boite("maitresse_baie", 0.6, 0.08, 1.2, (dx + 1.7, dy - cote / 2 - 0.03, h_t * 0.66), m["noir"]))
        o.append(C.boite("maitresse_baie_o", 0.08, 0.6, 1.2, (dx - cote / 2 - 0.03, dy - 1.2, h_t * 0.5), m["noir"]))
    # maisons à terrasse dans la cour : portes de bois, parapet, auvent de toile verte et ivoire
    for i, (x, y, sx, sy, h) in enumerate(((-2.4, -5.2, 4.4, 3.4, 3.8), (2.6, -5.6, 3.0, 2.8, 3.2))):
        if ruine:
            o += bloc_ruine("maison%d" % i, x, y, sx, sy, h, m["mur"], m, graine=70 + i, frac=(0.3, 0.6), ep=0.5)
            continue
        b = C.boite("maison%d" % i, sx, sy, h, (x, y, 0), m["mur"])
        C.biseau(b, 0.05)
        o.append(b)
        brulee = abime and i == 0
        if brulee:
            # abîmé : la terrasse de la maison derrière la brèche s'est effondrée dans l'incendie (solives calcinées
            # sur un lit de braises), de la fumée en monte
            if "braises" not in m:
                m["braises"] = mat_braises()
            o.append(C.boite("maison%d_braises" % i, sx - 0.4, sy - 0.4, 0.08, (x, y, h - 0.02), m["braises"]))
            rnd_m = random.Random(71)
            for k in range(5):
                xx = x - sx / 2 + 0.5 + k * (sx - 1.0) / 4
                o.append(poutre("maison%d_solive%d" % (i, k), (xx, y - sy / 2 + 0.2, h + 0.05),
                                (xx + rnd_m.uniform(-0.3, 0.3), y + sy / 2 - 0.2 - (rnd_m.uniform(0.5, 1.4) if k % 2 else 0),
                                 h + 0.05 - (rnd_m.uniform(0.3, 0.9) if k % 2 else 0)), 0.16, m["suie"]))
            o += foyer("maison", x + 0.4, y, h)
        else:
            o.append(C.boite("maison%d_terrasse" % i, sx - 0.1, sy - 0.1, 0.06, (x, y, h), m["terrasse"]))
        for j, (px, py, lx, ly) in enumerate(((x, y - sy / 2 + 0.1, sx, 0.2), (x, y + sy / 2 - 0.1, sx, 0.2),
                                              (x - sx / 2 + 0.1, y, 0.2, sy), (x + sx / 2 - 0.1, y, 0.2, sy))):
            if brulee and j in (0, 3):     # deux pans du parapet tombés avec la terrasse
                continue
            o.append(C.boite("maison%d_parapet" % i, lx, ly, 0.55, (px, py, h), m["mur"]))
        o.append(C.boite("maison%d_porte" % i, 0.9, 0.08, 1.8, (x - sx * 0.2, y - sy / 2 - 0.03, 0), m["vantail"]))
        o.append(C.boite("maison%d_linteau" % i, 1.2, 0.12, 0.18, (x - sx * 0.2, y - sy / 2 - 0.05, 1.8), m["bois"]))
    if not ruine:
        rayee = C.mat_tissu("auvent", "#e9e1cc", image_png=texture_rayee("auvent-omeyyades", "#2f6b52", "#e9e1cc"))
        if abime:          # l'auvent de la maison incendiée a brûlé : il ne reste que ses perches noircies
            for k, sx_ in enumerate((-1.2, 1.2)):
                o.append(C.cylindre("auvent0_perche%d" % k, 0.06, 2.0, (-2.4 + 0.6 + sx_, -5.2 - 1.7 - 1.45, 0), m["suie"],
                                    segments=6))
        else:
            o += auvent("auvent0", -2.4 + 0.6, -5.2 - 1.7, 2.6, 2.6, 1.5, rayee)
        o += auvent("auvent1", 2.6 - 0.3, -5.6 - 1.4, 2.2, 2.0, 1.3, rayee)
        # auvent de tuiles vertes vernissées au-dessus de la porte (couleur du camp, aucun signe religieux)
        o += auvent_tuiles("porte_tuiles", -X - SAILLIE_PORTE - 0.1, 0.0, 5.6, 4.4, 1.5, m, rot_z=-math.pi / 2)
        o += auvent_tuiles("baie_tuiles", dx + 1.7, dy - cote / 2 - 0.05, h_t * 0.66 + 1.5, 2.6, 1.1, m)
        # drapeaux verts à la tour ivoire (couleurs inversées : le vert se lit sur l'ocre)
        if abime:
            o += banniere_dechiree("ban_maitresse", "omeyyades", (dx - 1.6, dy - 1.6, h_t + 0.3), m,
                                   inclinaison=(0.12, -0.22), hauteur_mat=4.2, longueur=5.6, hauteur=3.8, dechire=0.15,
                                   vent=0.8)
        else:
            o += C.drapeau("ban_maitresse", "omeyyades", 4.2, 5.6, 3.8, loc=(dx - 1.6, dy - 1.6, h_t + 0.4), vent=1.0,
                           echelle_embleme=0.62, cap=CAP, inverse=True)
        o += C.drapeau("ban_tour", "omeyyades", 2.6, 3.2, 2.1, loc=(X, -Y, 8.2 + 0.4), vent=1.0, phase=1.7, cap=CAP,
                       inverse=True)
        if abime:              # abîmé : la tour t0 est cassée, son drapeau flotte encore, déchiré, sur le moignon
            o += banniere_dechiree("ban_t0", "omeyyades", (-X - 0.75, -Y - 0.75, 8.8 * FRAC_CASSEE[0] - 0.2), m,
                                   inclinaison=(0.16, -0.1), hauteur_mat=4.8, longueur=5.0, hauteur=3.4, dechire=0.18,
                                   vent=0.8)
        else:
            o += C.drapeau("ban_t0", "omeyyades", 2.8, 3.0, 2.0, loc=(-X, -Y, 8.8 + 0.4), vent=1.0, phase=0.6, cap=CAP,
                           inverse=True)
        o += C.drapeau("ban_tm0", "omeyyades", 2.4, 2.8, 1.9, loc=(0.0, -Y, 7.8 + 0.4), vent=1.0, phase=2.3, cap=CAP,
                       inverse=True)
        # deux tentures seulement, grandes : sur la tour-porte et sur la tour maîtresse
        o += tentures_et_bannieres("omeyyades", [(2.6, 5.0, (-X - 1.55, -2.85, 9.3), 0.0),
                                                 (4.0, 7.2, (dx - 0.6, dy - cote / 2 - 0.12, h_t - 0.5), 0.0)], m)
    else:
        o += banniere_dechiree("ban_ruine", "omeyyades", (-2.0, -1.5, 0.0), m)
    if etat != "intact":
        o.append(decalque("suie_porte", (-X - SAILLIE_PORTE - 0.3, 0, 3.6 if not ruine else 2.4), 2.8, 4.0, m["suie_mur"],
                          rot_z=-math.pi / 2))
        o += suie_cour("suie_cour", [(-2.0, 1.5, 3.0), (2.5, -2.0, 2.4)] + ([(-3.0, 6.0, 2.6), (3.5, 6.0, 2.2)] if ruine else []),
                       m, graine=9)
        if not ruine:
            o.append(decalque("suie_baie", (dx + 1.7, dy - cote / 2 - 0.07, h_t * 0.66 + 0.5), 1.6, 2.8, m["suie_mur"]))
    if ruine:
        o += poutres_brulees("poutre", [(-2.0, -3.0), (2.5, 1.0), (0.5, 6.0)], m, graine=10)
        o += foyer("maitresse", 2.0, 3.8, 5.8) + foyer("maison", -2.4, -5.2, 1.8) + foyer("cour", 2.5, 1.0, 0.6)
    else:
        o += accessoires_cour("cour", [(3.0, -1.5, "tonneaux"), (-3.5, 3.0, "puits")], m)
    return o


FABRIQUES = {"france": chateau_france, "angleterre": chateau_angleterre, "omeyyades": forteresse_omeyyade}


# ---------------------------------------------------------------- contrôle des toits (ardoise, pas bleu roi)
def _est_transparent(mat):
    """Matière à opacité variable (décalques de suie, fumée) : elle reste transparente dans le masque."""
    if not mat.node_tree:
        return False
    for n in mat.node_tree.nodes:
        if n.type == "BSDF_PRINCIPLED":
            a = n.inputs["Alpha"]
            return a.is_linked or a.default_value < 0.999
    return False


def masques_controle(nom, largeur_px, hauteur_px, surech=2, prefixes_toit=("toit",), prefixe_fumee="fumee"):
    """Après le rendu du sprite (même scène, même caméra), un rendu de contrôle à 4 échantillons, sans débruitage ni
    look : toits en rouge, fumée en vert (avec sa propre opacité), tout le reste en noir. Renvoie deux tableaux 0..1 à la
    taille du sprite : toits, fumée. Le masque des toits est écrit dans le cache (controle-toits-<nom>.png, relu par
    verifier.py pour la saturation des ardoises) s'il y a des toits."""
    from PIL import Image
    s = bpy.context.scene
    sortie = lambda nt: next(x for x in nt.nodes if x.type == "OUTPUT_MATERIAL")

    def emission(n, rgb, alpha_de=None):
        if alpha_de is None:
            m, nt, p = C.nouveau_materiau(n)
            nt.nodes.remove(p)
            e = nt.nodes.new("ShaderNodeEmission")
            e.inputs["Color"].default_value = rgb + (1.0,)
            nt.links.new(e.outputs[0], sortie(nt).inputs["Surface"])
            return m
        # même opacité que la matière d'origine (fumée) : copie de la matière, émission à la place du BSDF
        m = alpha_de.copy()
        m.name = n
        nt = m.node_tree
        p = next(x for x in nt.nodes if x.type == "BSDF_PRINCIPLED")
        lien = next((l for l in nt.links if l.to_socket == p.inputs["Alpha"]), None)
        e = nt.nodes.new("ShaderNodeEmission")
        e.inputs["Color"].default_value = rgb + (1.0,)
        tr = nt.nodes.new("ShaderNodeBsdfTransparent")
        mx = nt.nodes.new("ShaderNodeMixShader")
        if lien is not None:
            nt.links.new(lien.from_socket, mx.inputs[0])
        else:
            mx.inputs[0].default_value = p.inputs["Alpha"].default_value
        nt.links.new(tr.outputs[0], mx.inputs[1])
        nt.links.new(e.outputs[0], mx.inputs[2])
        nt.links.new(mx.outputs[0], sortie(nt).inputs["Surface"])
        return m
    rouge, noir = emission("_masque_toit", (1.0, 0.0, 0.0)), emission("_masque_noir", (0.0, 0.0, 0.0))
    vide, nt_v, p_v = C.nouveau_materiau("_masque_vide")
    nt_v.nodes.remove(p_v)
    tr = nt_v.nodes.new("ShaderNodeBsdfTransparent")
    nt_v.links.new(tr.outputs[0], sortie(nt_v).inputs["Surface"])
    verts = {}
    n_toit = 0
    for ob in s.objects:
        if ob.type != "MESH" or not ob.visible_camera:
            continue
        for slot in ob.material_slots:
            mat = slot.material
            if mat is None or mat.name.startswith("_masque"):
                continue
            racine = mat.name.split(".")[0]
            if racine in prefixes_toit:
                slot.material = rouge
                n_toit += 1
            elif racine.startswith(prefixe_fumee):
                if mat.name not in verts:
                    verts[mat.name] = emission("_masque_" + mat.name, (0.0, 1.0, 0.0), alpha_de=mat)
                slot.material = verts[mat.name]
            elif _est_transparent(mat):
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
    im = C.rendre(os.path.join(C.CACHE, "_rendu", nom + "-controle.png"))
    a = np.array(im.convert("RGBa").resize((largeur_px, hauteur_px), Image.LANCZOS), dtype=np.float32) / 255.0
    toits, fum = a[..., 0], a[..., 1]
    if n_toit:
        Image.fromarray((toits * 255).astype(np.uint8)).save(os.path.join(C.CACHE, "controle-toits-%s.png" % nom))
    return (toits if n_toit else None), fum


def part_camp_sans_fumee(img, camp, fum, seuil_fumee=0.5):
    """Couleur du camp sur le BÂTIMENT : la fumée dense (opacité > seuil_fumee) n'entre ni au numérateur ni au
    dénominateur (la fumée n'est pas le bâtiment, elle ne doit pas diluer les bannières)."""
    h, s_, v, al = C._hsv(img)
    fenetre, s_min, v_min = C.TEINTES_CAMP[camp]
    h0, h1 = fenetre
    dans = (h >= h0) & (h <= h1) if h0 <= h1 else (h >= h0) | (h <= h1)
    bat = (al >= 0.5) & (fum <= seuil_fumee)
    ok = bat & dans & (s_ >= s_min) & (v >= v_min)
    return float(ok.sum()) / max(1, int(bat.sum()))


def saturation_toits(img, masque):
    """Saturation HSV médiane des pixels de toit du sprite final (masque > 50 %, sprite opaque) et leur nombre."""
    h, s, v, al = C._hsv(img)
    sel = (np.asarray(masque) > 0.5) & (al >= 0.5)
    if sel.sum() < 30:
        return None, int(sel.sum())
    return float(np.median(s[sel])), int(sel.sum())


def rendre_place(camp, etat="intact", surech=2, echantillons=96, sans_rendu=False):
    px = TAILLE * C.ECHELLE
    C.reinitialiser()
    # Omeyyades : ciel atténué, sans débouchage : la face à l'ombre est au moins 2,5 fois plus sombre que l'autre
    C.lumiere_batiment(camp)
    C.camera_trois_quarts(px * surech, px * surech, PX_PAR_M * C.ECHELLE * surech, (TAILLE - ANCRE_Y) * C.ECHELLE * surech,
                          ancre_x_px=ANCRE_X * C.ECHELLE * surech)
    C.sol_capteur(90)
    objs = FABRIQUES[camp](etat)
    C.pivot("place", objs, LACET)
    nom = "place-%s-%s" % (camp, etat)
    fumees = points_fumee()
    if sans_rendu:
        ecrire_fumees(nom, fumees)
        return None
    img, ombre = C.rendre_sprite(nom, px, px, objs, surech=surech, echantillons=echantillons, echantillons_ombre=32,
                                 contour=0.5, epaisseur_contour=1, ombre_separee=True)
    if camp == "angleterre":
        C.controle_sans_bleu(img, nom)
    toits, fum = masques_controle(nom, px, px, surech)
    if etat != "ruine":
        p = part_camp_sans_fumee(img, camp, fum)
        C.journal("%s : couleur du camp %s sur %.1f %% du bâtiment (fumée exclue ; seuil %.0f %%)"
                  % (nom, camp, p * 100, SEUIL_CAMP * 100))
        if p < SEUIL_CAMP:
            C._refuser(img, nom, "couleur du camp %.1f %% < %.0f %%" % (p * 100, SEUIL_CAMP * 100))
    if camp == "france" and toits is not None:
        sat, n = saturation_toits(img, toits)
        if sat is not None:
            C.journal("%s : saturation médiane des toits %.2f sur %d px (plafond %.2f)" % (nom, sat, n, SEUIL_TOITS))
            if sat > SEUIL_TOITS:
                C._refuser(img, nom, "toits trop saturés (%.2f > %.2f)" % (sat, SEUIL_TOITS))
    C.sauver_sprite(nom, img, ombre, TAILLE, TAILLE, ANCRE_X, ANCRE_Y)
    ecrire_fumees(nom, fumees)
    return C.chemin_td(nom + ".png")[0]


def ecrire_fumees(nom, fumees):
    """Ajoute à l'entrée du manifeste le champ « fumees » ([[x, y], ...], px logiques depuis le coin haut-gauche) : là
    où le jeu fait monter la fumée animée d'une place abîmée ou en ruine (vide pour une place intacte)."""
    e = C.lire_manifeste().get(nom)
    if e is None:
        C.journal("%s absent du manifeste : points de fumée non écrits" % nom)
        return
    e["fumees"] = fumees
    C.maj_manifeste({nom: e})
    C.journal("%s : %d point(s) de fumée %s" % (nom, len(fumees), fumees))


def main(args):
    etats = ["intact", "abime", "ruine"]
    sans_rendu = "--fumees" in args
    args = [a for a in args if a != "--fumees"]
    if "--etats" in args:
        i = args.index("--etats")
        etats = args[i + 1].split(",")
        args = args[:i] + args[i + 2:]
    for camp in (args or list(FABRIQUES)):
        for etat in etats:
            rendre_place(camp, etat, sans_rendu=sans_rendu)


if __name__ == "__main__":
    main(sys.argv[1:])
