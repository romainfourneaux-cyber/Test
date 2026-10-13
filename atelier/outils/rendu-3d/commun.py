# -*- coding: utf-8 -*-
"""Module commun des générateurs d'images pré-calculées (Blender en module Python, rendu Cycles sur CPU).

Tout ce qui doit être identique d'une image à l'autre vit ici, pour que terrains, châteaux, tours et
troupes s'accordent : la lumière (soleil du nord-ouest, fin d'après-midi), les caméras (vue de dessus
pour les terrains, vue de trois quarts inclinée de 40° pour les sprites), les réglages de rendu,
les matières (textures Poly Haven CC0), les couleurs et emblèmes des camps, l'enregistrement des images
et la mise à jour du manifeste jeu/assets/images/td/sprites.js.

Repères du monde : +X vers l'est (droite de l'écran), +Y vers le nord (haut de l'écran en vue de dessus),
+Z vers le haut. Unité : le mètre.
"""
import json
import math
import os
import random
import re
import sys
import time

BPY_CHEMIN = os.environ.get("BPY_CHEMIN", "/tmp/bpy-env")
if BPY_CHEMIN not in sys.path:
    sys.path.insert(0, BPY_CHEMIN)

import bpy  # noqa: E402
import bmesh  # noqa: E402
from mathutils import Vector, Matrix, Euler  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

# ---------------------------------------------------------------- chemins
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, "..", "..", ".."))
SOURCES = os.path.join(RACINE, "atelier", "sources-3d")
CACHE = os.path.join(SOURCES, "_cache")
TD = os.path.join(RACINE, "jeu", "assets", "images", "td")
CAMPAGNE = os.path.join(RACINE, "jeu", "assets", "images", "campagne")
MANIFESTE = os.path.join(TD, "sprites.js")
ICONES = os.path.join(RACINE, "jeu", "assets", "icones", "game-icons.js")
for _d in (CACHE, TD, CAMPAGNE):
    os.makedirs(_d, exist_ok=True)

# ---------------------------------------------------------------- conventions du jeu
ECHELLE = 2                  # on rend tout au double de la taille logique (canevas 1000 × 660 affiché jusqu'à 2×)
INCLINAISON = 40             # caméra des sprites : 40° sous l'horizontale (vue de trois quarts)
PX_PAR_M_TERRAIN = 10        # terrain : 10 px logiques par mètre (carte de 100 m × 66 m)

# Lumière : la même partout. Soleil venu du nord-ouest (haut-gauche de l'écran), 45° au-dessus de l'horizon,
# lumière chaude de fin d'après-midi ; ciel doux, un peu bleu, pour déboucher les ombres.
SOLEIL_AZIMUT = 315          # d'où vient le soleil, en degrés depuis le nord, sens des aiguilles d'une montre
SOLEIL_ELEVATION = 45
SOLEIL_COULEUR = (1.0, 0.84, 0.64)
SOLEIL_FORCE = 4.2
SOLEIL_ANGLE = 3.0           # diamètre apparent en degrés : ombres un peu douces
CIEL_ZENITH = (0.36, 0.50, 0.78)
CIEL_HORIZON = (0.86, 0.80, 0.70)
CIEL_SOL = (0.20, 0.19, 0.13)
CIEL_FORCE = 0.85

# Camps : couleurs (sRGB), emblème Game-icons, matières des places fortes.
CAMPS = {
    "france": {"champ": "#24407a", "meuble": "#e2c272", "embleme": "lys",
               "pierre": "yellow_stone_wall", "teinte_pierre": "#e4dccb", "toit": "roof_slates_02", "teinte_toit": "#5d6f92"},
    "angleterre": {"champ": "#9b1f1f", "meuble": "#e2c272", "embleme": "lion",
                   "pierre": "castle_wall_varriation", "teinte_pierre": "#9c9890", "toit": "clay_roof_tiles", "teinte_toit": "#7a3f2c"},
    "omeyyades": {"champ": "#e9e1cc", "meuble": "#2f6b52", "embleme": "tour",
                  "pierre": "yellow_stone_wall", "teinte_pierre": "#d29a5a", "mur": "clay_plaster", "teinte_toit": "#b08850"},
}


# ---------------------------------------------------------------- outils divers
def journal(*morceaux):
    print("[rendu-3d]", *morceaux, flush=True)


def srgb_lin(c):
    """Composante sRGB (0-1) vers linéaire."""
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def couleur(hexa, alpha=1.0):
    """'#24407a' -> (r, g, b, a) linéaires pour Blender."""
    hexa = hexa.lstrip("#")
    r, g, b = (int(hexa[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return (srgb_lin(r), srgb_lin(g), srgb_lin(b), alpha)


def rgb8(hexa):
    hexa = hexa.lstrip("#")
    return tuple(int(hexa[i:i + 2], 16) for i in (0, 2, 4))


def melanger(c1, c2, t):
    return tuple(a + (b - a) * t for a, b in zip(c1, c2))


# ---------------------------------------------------------------- scène
CACHES = []   # dictionnaires de données Blender à vider quand la scène est remise à zéro


def reinitialiser():
    """Scène vide (sans le cube, la lampe et la caméra du fichier de démarrage)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in CACHES:
        c.clear()
    s = bpy.context.scene
    s.unit_settings.system = "METRIC"
    return s


def lier(obj, collection=None):
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def objet_maillage(nom, bm, mat=None, lisse=False):
    """Crée un objet à partir d'un bmesh (qui est libéré)."""
    me = bpy.data.meshes.new(nom)
    bm.to_mesh(me)
    bm.free()
    if lisse:
        for p in me.polygons:
            p.use_smooth = True
    ob = bpy.data.objects.new(nom, me)
    if mat is not None:
        me.materials.append(mat)
    return lier(ob)


def direction_soleil():
    """Vecteur unitaire du sol vers le soleil."""
    az, el = math.radians(SOLEIL_AZIMUT), math.radians(SOLEIL_ELEVATION)
    return Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))


def installer_lumiere(force_soleil=SOLEIL_FORCE, force_ciel=CIEL_FORCE):
    """Soleil commun + ciel dégradé (zénith bleu, horizon chaud, halo du côté du soleil)."""
    s = bpy.context.scene
    lum = bpy.data.lights.new("soleil", "SUN")
    lum.energy = force_soleil
    lum.color = SOLEIL_COULEUR
    lum.angle = math.radians(SOLEIL_ANGLE)
    ob = lier(bpy.data.objects.new("soleil", lum))
    ob.rotation_euler = direction_soleil().to_track_quat("Z", "Y").to_euler()

    w = bpy.data.worlds.new("ciel")
    s.world = w
    try:
        w.use_nodes = True
    except Exception:
        pass
    nt = w.node_tree
    nt.nodes.clear()
    N = nt.nodes.new
    tc = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    # hauteur dans le ciel -> dégradé horizon / zénith
    haut = N("ShaderNodeMath"); haut.operation = "POWER"; haut.inputs[1].default_value = 0.6
    clamp = N("ShaderNodeClamp")
    nt.links.new(sep.outputs["Z"], clamp.inputs["Value"])
    nt.links.new(clamp.outputs[0], haut.inputs[0])
    deg = N("ShaderNodeMix"); deg.data_type = "RGBA"
    nt.links.new(haut.outputs[0], _entree(deg, "Factor", "VALUE"))
    _entree(deg, "A", "RGBA").default_value = CIEL_HORIZON + (1,)
    _entree(deg, "B", "RGBA").default_value = CIEL_ZENITH + (1,)
    # sous l'horizon : le sol (rebond doux)
    sous = N("ShaderNodeMath"); sous.operation = "LESS_THAN"; sous.inputs[1].default_value = 0.0
    nt.links.new(sep.outputs["Z"], sous.inputs[0])
    sol = N("ShaderNodeMix"); sol.data_type = "RGBA"
    nt.links.new(sous.outputs[0], _entree(sol, "Factor", "VALUE"))
    nt.links.new(_sortie(deg, "RGBA"), _entree(sol, "A", "RGBA"))
    _entree(sol, "B", "RGBA").default_value = CIEL_SOL + (1,)
    # halo chaud du côté du soleil
    d = direction_soleil()
    pv = N("ShaderNodeVectorMath"); pv.operation = "DOT_PRODUCT"
    pv.inputs[1].default_value = (d.x, d.y, d.z)
    nt.links.new(tc.outputs["Generated"], pv.inputs[0])
    halo = N("ShaderNodeMath"); halo.operation = "POWER"; halo.inputs[1].default_value = 6.0
    cl2 = N("ShaderNodeClamp")
    nt.links.new(pv.outputs["Value"], cl2.inputs["Value"])
    nt.links.new(cl2.outputs[0], halo.inputs[0])
    halo_f = N("ShaderNodeMath"); halo_f.operation = "MULTIPLY"; halo_f.inputs[1].default_value = 0.5
    nt.links.new(halo.outputs[0], halo_f.inputs[0])
    mh = N("ShaderNodeMix"); mh.data_type = "RGBA"; mh.blend_type = "ADD"
    nt.links.new(halo_f.outputs[0], _entree(mh, "Factor", "VALUE"))
    nt.links.new(_sortie(sol, "RGBA"), _entree(mh, "A", "RGBA"))
    _entree(mh, "B", "RGBA").default_value = (1.0, 0.75, 0.45, 1)
    bg = N("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = force_ciel
    nt.links.new(_sortie(mh, "RGBA"), bg.inputs["Color"])
    out = N("ShaderNodeOutputWorld")
    nt.links.new(bg.outputs[0], out.inputs["Surface"])
    return ob


def lumiere_appoint(force=1.1, teinte=(0.92, 0.95, 1.0)):
    """Lumière d'appoint des sprites seulement : venue de la caméra (sud, 40° de haut), sans ombre portée.

    Le soleil du nord-ouest laisse dans l'ombre la face tournée vers la caméra ; cet appoint doux la débouche,
    comme le réflecteur d'un photographe, sans changer la direction des ombres (toujours vers le bas-droite)."""
    lum = bpy.data.lights.new("appoint", "SUN")
    lum.energy = force
    lum.color = teinte
    lum.angle = math.radians(30)
    try:
        lum.cycles.cast_shadow = False
    except Exception:
        lum.use_shadow = False
    ob = lier(bpy.data.objects.new("appoint", lum))
    t = math.radians(INCLINAISON + 8)
    vers = Vector((0.25, -math.cos(t), math.sin(t))).normalized()
    ob.rotation_euler = vers.to_track_quat("Z", "Y").to_euler()
    return ob


def reglages_rendu(largeur, hauteur, echantillons=64, transparent=True, look="AgX - Medium High Contrast",
                   filtre=1.2, seuil_adaptatif=0.02):
    """Cycles sur CPU, débruitage OpenImageDenoise, fond transparent pour les sprites."""
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    c = s.cycles
    c.device = "CPU"
    c.samples = echantillons
    c.use_adaptive_sampling = True
    c.adaptive_threshold = seuil_adaptatif
    c.use_denoising = True
    try:
        c.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    c.max_bounces = 6
    c.diffuse_bounces = 3
    c.glossy_bounces = 2
    c.transmission_bounces = 4
    c.transparent_max_bounces = 24
    c.volume_bounces = 0
    c.sample_clamp_indirect = 6.0
    c.filter_width = filtre
    c.use_light_tree = True
    s.render.threads_mode = "AUTO"
    s.render.use_persistent_data = True
    s.render.resolution_x = int(largeur)
    s.render.resolution_y = int(hauteur)
    s.render.resolution_percentage = 100
    s.render.film_transparent = transparent
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA"
    s.render.image_settings.color_depth = "8"
    s.view_settings.view_transform = "AgX"
    s.view_settings.look = look
    s.view_settings.exposure = 0.0
    s.view_settings.gamma = 1.0
    return s


def camera_dessus(cx, cy, largeur_m, hauteur_m, hauteur_cam=150.0):
    """Caméra orthographique qui regarde droit vers le bas (terrains), le nord en haut de l'image."""
    cam = bpy.data.cameras.new("camera_dessus")
    cam.type = "ORTHO"
    cam.ortho_scale = max(largeur_m, hauteur_m)
    cam.clip_start = 1.0
    cam.clip_end = hauteur_cam + 50
    ob = lier(bpy.data.objects.new("camera_dessus", cam))
    ob.location = (cx, cy, hauteur_cam)
    ob.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = ob
    return ob


def camera_trois_quarts(largeur_px, hauteur_px, px_par_m, ancre_bas_px, inclinaison=INCLINAISON):
    """Caméra orthographique tournée vers le nord, inclinée de 40° sous l'horizontale.

    L'origine du monde (0, 0, 0) tombe au centre horizontal de l'image, à ancre_bas_px pixels au-dessus
    du bord bas : c'est le point d'ancrage du sprite dans le jeu."""
    cam = bpy.data.cameras.new("camera_3q")
    cam.type = "ORTHO"
    grand = max(largeur_px, hauteur_px)
    cam.ortho_scale = grand / px_par_m
    cam.sensor_fit = "AUTO"
    cam.shift_y = (hauteur_px / 2.0 - ancre_bas_px) / grand
    cam.clip_start = 1.0
    cam.clip_end = 600.0
    ob = lier(bpy.data.objects.new("camera_3q", cam))
    t = math.radians(inclinaison)
    regard = Vector((0.0, math.cos(t), -math.sin(t)))
    ob.location = -regard * 250.0
    ob.rotation_euler = (math.pi / 2 - t, 0.0, 0.0)
    bpy.context.scene.camera = ob
    return ob


def sol_capteur(taille=60.0, teinte="#5d6b3a"):
    """Sol invisible qui ne garde que les ombres (shadow catcher) ; sa teinte d'herbe renvoie un peu de lumière verte."""
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=taille / 2)
    ob = objet_maillage("sol_ombres", bm, mat_simple("sol_herbe", teinte, rugosite=1.0))
    ob.is_shadow_catcher = True
    return ob


# ---------------------------------------------------------------- matières
def _entree(noeud, nom, typ=None):
    for s in noeud.inputs:
        if s.name == nom and (typ is None or s.type == typ) and s.enabled:
            return s
    for s in noeud.inputs:
        if s.name == nom and (typ is None or s.type == typ):
            return s
    raise KeyError(nom)


def _sortie(noeud, typ):
    for s in noeud.outputs:
        if s.type == typ and s.enabled:
            return s
    for s in noeud.outputs:
        if s.type == typ:
            return s
    raise KeyError(typ)


def nouveau_materiau(nom):
    m = bpy.data.materials.new(nom)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    if p is None:
        nt.nodes.clear()
        p = nt.nodes.new("ShaderNodeBsdfPrincipled")
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(p.outputs[0], out.inputs["Surface"])
    return m, nt, p


def mat_simple(nom, teinte, rugosite=0.7, metal=0.0, emission=None, bosse=0.0, echelle_bosse=40.0):
    """Matière unie (teinte sRGB '#rrggbb' ou tuple linéaire), avec un léger grain si bosse > 0."""
    m, nt, p = nouveau_materiau(nom)
    p.inputs["Base Color"].default_value = couleur(teinte) if isinstance(teinte, str) else tuple(teinte)[:3] + (1,)
    p.inputs["Roughness"].default_value = rugosite
    p.inputs["Metallic"].default_value = metal
    if emission:
        p.inputs["Emission Color"].default_value = couleur(emission)
        p.inputs["Emission Strength"].default_value = 1.0
    if bosse > 0:
        _grain(nt, p, bosse, echelle_bosse)
    return m


def _grain(nt, p, force, echelle):
    bruit = nt.nodes.new("ShaderNodeTexNoise")
    bruit.inputs["Scale"].default_value = echelle
    bruit.inputs["Detail"].default_value = 6.0
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = force
    b.inputs["Distance"].default_value = 0.02
    nt.links.new(bruit.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return b


def tex_ph(ident, carte):
    """Chemin d'une carte (diff, nor_gl, rough, disp) d'une texture Poly Haven téléchargée."""
    dossier = os.path.join(SOURCES, ident)
    for f in sorted(os.listdir(dossier)):
        if re.search(r"_%s_\dk\.(jpg|png)$" % re.escape(carte), f):
            return os.path.join(dossier, f)
    raise FileNotFoundError(ident + " " + carte + " (lancer telecharger_sources.py)")


def taille_ph(ident):
    """Taille réelle (m) couverte par une texture Poly Haven, d'après sa fiche."""
    try:
        with open(os.path.join(SOURCES, ident, "info.json"), encoding="utf-8") as f:
            return json.load(f)["dimensions"][0] / 1000.0
    except Exception:
        return 2.0


_images = {}
CACHES.append(_images)


def image(chemin, non_couleur=False):
    cle = (chemin, non_couleur)
    if cle not in _images:
        im = bpy.data.images.load(chemin, check_existing=True)
        if non_couleur:
            im.colorspace_settings.name = "Non-Color"
        _images[cle] = im
    return _images[cle]


def mat_ph(nom, ident, echelle_m=None, teinte=None, force_teinte=0.0, saturation=1.0, valeur=1.0,
           rugosite=0.85, bosse=0.35, projection="BOITE", mosaique=1.0, salissure=0.0):
    """Matière tirée d'une texture Poly Haven.

    projection "BOITE" : projection triplanaire en coordonnées objet (bâtiments sans UV), relief tiré de la
    luminance (les joints sombres s'enfoncent) ; "UV" : UV de l'objet, carte de normales.
    echelle_m : taille réelle d'un motif (par défaut celle de la fiche Poly Haven), divisée par mosaique."""
    m, nt, p = nouveau_materiau(nom)
    N = nt.nodes.new
    L = nt.links.new
    taille = (echelle_m or taille_ph(ident)) / mosaique
    tc = N("ShaderNodeTexCoord")
    mp = N("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / taille, 1 / taille, 1 / taille)
    if projection == "BOITE":
        L(tc.outputs["Object"], mp.inputs["Vector"])
    else:
        L(tc.outputs["UV"], mp.inputs["Vector"])
    diff = N("ShaderNodeTexImage")
    diff.image = image(tex_ph(ident, "diff"))
    if projection == "BOITE":
        diff.projection = "BOX"
        diff.projection_blend = 0.25
    L(mp.outputs["Vector"], diff.inputs["Vector"])
    hsv = N("ShaderNodeHueSaturation")
    hsv.inputs["Saturation"].default_value = saturation
    hsv.inputs["Value"].default_value = valeur
    L(diff.outputs["Color"], hsv.inputs["Color"])
    sortie_couleur = hsv.outputs["Color"]
    if teinte:
        mx = N("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"
        _entree(mx, "Factor", "VALUE").default_value = force_teinte
        L(sortie_couleur, _entree(mx, "A", "RGBA"))
        c = couleur(teinte)
        # multiplier par une teinte normalisée pour garder la luminosité
        lum = max(0.05, 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])
        _entree(mx, "B", "RGBA").default_value = tuple(min(1.0, v * 0.45 / lum) for v in c[:3]) + (1,)
        sortie_couleur = _sortie(mx, "RGBA")
    if salissure > 0:
        # pied des murs plus sombre (terre, mousse, rejaillissement de la pluie) sur le premier mètre et demi
        sep = N("ShaderNodeSeparateXYZ")
        L(tc.outputs["Object"], sep.inputs[0])
        mr = N("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = 0.0
        mr.inputs["From Max"].default_value = 1.6
        mr.inputs["To Min"].default_value = 1.0 - salissure
        mr.inputs["To Max"].default_value = 1.0
        L(sep.outputs["Z"], mr.inputs["Value"])
        mul = N("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
        _entree(mul, "Factor", "VALUE").default_value = 1.0
        L(sortie_couleur, _entree(mul, "A", "RGBA"))
        cr = N("ShaderNodeCombineColor")
        for k in ("Red", "Green", "Blue"):
            L(mr.outputs["Result"], cr.inputs[k])
        L(cr.outputs["Color"], _entree(mul, "B", "RGBA"))
        sortie_couleur = _sortie(mul, "RGBA")
    L(sortie_couleur, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rugosite
    if bosse > 0:
        if projection == "BOITE":
            bw = N("ShaderNodeRGBToBW")
            L(diff.outputs["Color"], bw.inputs["Color"])
            b = N("ShaderNodeBump")
            b.inputs["Strength"].default_value = bosse
            b.inputs["Distance"].default_value = 0.012 * taille
            L(bw.outputs["Val"], b.inputs["Height"])
            L(b.outputs["Normal"], p.inputs["Normal"])
        else:
            try:
                nor = N("ShaderNodeTexImage")
                nor.image = image(tex_ph(ident, "nor_gl"), non_couleur=True)
                L(mp.outputs["Vector"], nor.inputs["Vector"])
                nm = N("ShaderNodeNormalMap")
                nm.inputs["Strength"].default_value = bosse
                L(nor.outputs["Color"], nm.inputs["Color"])
                L(nm.outputs["Normal"], p.inputs["Normal"])
            except FileNotFoundError:
                pass
    return m


def mat_metal(nom, teinte="#9a9a98", rugosite=0.38, maille=False, echelle_maille=0.012):
    """Acier (casques, lames) ; maille=True : cotte de mailles (anneaux simulés par un relief de Voronoï)."""
    m, nt, p = nouveau_materiau(nom)
    p.inputs["Base Color"].default_value = couleur(teinte)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = rugosite
    if maille:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        vo = nt.nodes.new("ShaderNodeTexVoronoi")
        vo.feature = "DISTANCE_TO_EDGE"
        vo.inputs["Scale"].default_value = 1.0 / echelle_maille
        nt.links.new(tc.outputs["Object"], vo.inputs["Vector"])
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = 0.6
        b.inputs["Distance"].default_value = 0.004
        nt.links.new(vo.outputs["Distance"], b.inputs["Height"])
        nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
        # les creux de la maille sont plus sombres
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = tuple(v * 0.35 for v in couleur(teinte)[:3]) + (1,)
        ramp.color_ramp.elements[1].position = 0.18
        ramp.color_ramp.elements[1].color = couleur(teinte)
        nt.links.new(vo.outputs["Distance"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    return m


def mat_tissu(nom, teinte, rugosite=0.9, image_png=None, brillance=0.3):
    """Tissu (tabards, caparaçons, bannières) : velouté léger ; image_png : motif héraldique plaqué en UV."""
    m, nt, p = nouveau_materiau(nom)
    p.inputs["Roughness"].default_value = rugosite
    try:
        p.inputs["Sheen Weight"].default_value = brillance
        p.inputs["Sheen Tint"].default_value = (1, 1, 1, 1)
    except KeyError:
        pass
    if image_png:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        im = nt.nodes.new("ShaderNodeTexImage")
        im.image = image(image_png)
        im.extension = "EXTEND"
        nt.links.new(tc.outputs["UV"], im.inputs["Vector"])
        nt.links.new(im.outputs["Color"], p.inputs["Base Color"])
    else:
        p.inputs["Base Color"].default_value = couleur(teinte) if isinstance(teinte, str) else teinte
    _grain(nt, p, 0.15, 300.0)
    return m


# ---------------------------------------------------------------- emblèmes (tracés Game-icons, CC BY 3.0)
def _chemins_icone(nom):
    with open(ICONES, encoding="utf-8") as f:
        txt = f.read()
    m = re.search(r'"%s"\s*:\s*"((?:[^"\\]|\\.)*)"' % re.escape(nom), txt)
    if not m:
        raise KeyError("icône inconnue : " + nom)
    corps = m.group(1).encode("utf-8").decode("unicode_escape")
    return re.findall(r'\sd="([^"]+)"', corps)


def _sous_chemins(d, pas_courbe=24):
    """Interprète un attribut d SVG (M L H V C S Q T A Z, absolus et relatifs) en polygones."""
    i, n = 0, len(d)
    polys, cour = [], []
    x = y = x0 = y0 = 0.0
    dernier_ctrl = None
    cmd = None

    def espaces():
        nonlocal i
        while i < n and d[i] in " ,\t\n\r":
            i += 1

    def nombre():
        nonlocal i
        espaces()
        m = re.compile(r"[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?").match(d, i)
        if not m:
            raise ValueError("nombre attendu à %d" % i)
        i = m.end()
        return float(m.group(0))

    def drapeau():
        nonlocal i
        espaces()
        c = d[i]
        i += 1
        return c == "1"

    def fermer():
        nonlocal cour
        if len(cour) > 2:
            polys.append(cour)
        cour = []

    while True:
        espaces()
        if i >= n:
            break
        if d[i].isalpha():
            cmd = d[i]
            i += 1
        rel = cmd.islower()
        C = cmd.upper()
        if C == "Z":
            fermer()
            x, y = x0, y0
            dernier_ctrl = None
            continue
        if C == "M":
            fermer()
            nx, ny = nombre(), nombre()
            x, y = (x + nx, y + ny) if rel else (nx, ny)
            x0, y0 = x, y
            cour = [(x, y)]
            cmd = "l" if rel else "L"
            dernier_ctrl = None
            continue
        if C == "L":
            nx, ny = nombre(), nombre()
            x, y = (x + nx, y + ny) if rel else (nx, ny)
            cour.append((x, y)); dernier_ctrl = None
        elif C == "H":
            nx = nombre(); x = x + nx if rel else nx
            cour.append((x, y)); dernier_ctrl = None
        elif C == "V":
            ny = nombre(); y = y + ny if rel else ny
            cour.append((x, y)); dernier_ctrl = None
        elif C in "CS":
            if C == "C":
                x1, y1 = nombre(), nombre()
                if rel:
                    x1, y1 = x + x1, y + y1
            else:
                if dernier_ctrl and dernier_ctrl[0] == "C":
                    x1, y1 = 2 * x - dernier_ctrl[1], 2 * y - dernier_ctrl[2]
                else:
                    x1, y1 = x, y
            x2, y2, ex, ey = nombre(), nombre(), nombre(), nombre()
            if rel:
                x2, y2, ex, ey = x + x2, y + y2, x + ex, y + ey
            for k in range(1, pas_courbe + 1):
                t = k / pas_courbe; u = 1 - t
                cour.append((u ** 3 * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * ex,
                             u ** 3 * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * ey))
            dernier_ctrl = ("C", x2, y2)
            x, y = ex, ey
        elif C in "QT":
            if C == "Q":
                x1, y1 = nombre(), nombre()
                if rel:
                    x1, y1 = x + x1, y + y1
            else:
                if dernier_ctrl and dernier_ctrl[0] == "Q":
                    x1, y1 = 2 * x - dernier_ctrl[1], 2 * y - dernier_ctrl[2]
                else:
                    x1, y1 = x, y
            ex, ey = nombre(), nombre()
            if rel:
                ex, ey = x + ex, y + ey
            for k in range(1, pas_courbe + 1):
                t = k / pas_courbe; u = 1 - t
                cour.append((u * u * x + 2 * u * t * x1 + t * t * ex, u * u * y + 2 * u * t * y1 + t * t * ey))
            dernier_ctrl = ("Q", x1, y1)
            x, y = ex, ey
        elif C == "A":
            rx, ry, phi = abs(nombre()), abs(nombre()), nombre()
            grand, sens = drapeau(), drapeau()
            ex, ey = nombre(), nombre()
            if rel:
                ex, ey = x + ex, y + ey
            cour.extend(_arc(x, y, rx, ry, phi, grand, sens, ex, ey))
            x, y = ex, ey
            dernier_ctrl = None
        else:
            raise ValueError("commande SVG non gérée : " + cmd)
    fermer()
    return polys


def _arc(x1, y1, rx, ry, phi, grand, sens, x2, y2):
    """Arc elliptique SVG -> points (paramétrisation par le centre, norme SVG F.6.5)."""
    if rx == 0 or ry == 0:
        return [(x2, y2)]
    p = math.radians(phi)
    cp, sp = math.cos(p), math.sin(p)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = cp * dx + sp * dy, -sp * dx + cp * dy
    lam = (x1p ** 2) / (rx ** 2) + (y1p ** 2) / (ry ** 2)
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    co = math.sqrt(max(0.0, num / den)) if den else 0.0
    if grand == sens:
        co = -co
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cx = cp * cxp - sp * cyp + (x1 + x2) / 2
    cy = sp * cxp + cp * cyp + (y1 + y2) / 2

    def ang(ux, uy, vx, vy):
        a = math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
        return a
    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not sens and dt > 0:
        dt -= 2 * math.pi
    elif sens and dt < 0:
        dt += 2 * math.pi
    pas = max(4, int(abs(dt) / (math.pi / 24)))
    pts = []
    for k in range(1, pas + 1):
        t = t1 + dt * k / pas
        xe, ye = rx * math.cos(t), ry * math.sin(t)
        pts.append((cp * xe - sp * ye + cx, sp * xe + cp * ye + cy))
    return pts


def masque_embleme(nom, taille=512, marge=0.0):
    """Masque (PIL 'L') d'une icône Game-icons, règle de remplissage « non nul » (sens des sous-chemins)."""
    sur = 4
    T = taille * sur
    k = T / 512.0 * (1 - 2 * marge)
    dec = T * marge
    enroulement = np.zeros((T, T), dtype=np.int16)
    for d in _chemins_icone(nom):
        for poly in _sous_chemins(d):
            aire = sum(poly[j][0] * poly[j - 1][1] - poly[j - 1][0] * poly[j][1] for j in range(len(poly)))
            im = Image.new("L", (T, T), 0)
            ImageDraw.Draw(im).polygon([(dec + px * k, dec + py * k) for px, py in poly], fill=255)
            enroulement += np.where(np.array(im) > 127, 1 if aire > 0 else -1, 0).astype(np.int16)
    plein = (enroulement != 0).astype(np.uint8) * 255
    return Image.fromarray(plein, "L").resize((taille, taille), Image.LANCZOS)


def texture_blason(camp, largeur=256, hauteur=384, taille_embleme=0.62, bordure=False, nom=None, decalage=(0.0, 0.0),
                   usure=0.25):
    """Image héraldique d'un camp (champ + emblème), mise en cache en PNG ; renvoie le chemin.

    decalage : position de l'emblème (fraction de la largeur/hauteur) par rapport au centre."""
    c = CAMPS[camp]
    nom = nom or "blason-%s-%dx%d-%d%s" % (camp, largeur, hauteur, int(taille_embleme * 100), "-b" if bordure else "")
    chemin = os.path.join(CACHE, nom + ".png")
    champ = np.array(rgb8(c["champ"]), dtype=np.float32)
    meuble = np.array(rgb8(c["meuble"]), dtype=np.float32)
    rng = np.random.default_rng(hash(nom) & 0xffff)
    # champ légèrement nuancé (teinture à la main, toile)
    yy, xx = np.mgrid[0:hauteur, 0:largeur]
    nuance = 1.0 + usure * 0.12 * (np.sin(xx / largeur * 7.0 + rng.uniform(0, 6)) * np.sin(yy / hauteur * 5.0 + rng.uniform(0, 6)))
    nuance += rng.normal(0, 0.02 * usure, (hauteur, largeur))
    img = np.clip(champ[None, None, :] * nuance[..., None], 0, 255)
    t = int(min(largeur, hauteur) * taille_embleme)
    masque = np.array(masque_embleme(c["embleme"], t), dtype=np.float32) / 255.0
    x0 = int((largeur - t) / 2 + decalage[0] * largeur)
    y0 = int((hauteur - t) / 2 + decalage[1] * hauteur)
    zone = img[y0:y0 + t, x0:x0 + t]
    zone[:] = zone * (1 - masque[..., None]) + meuble[None, None, :] * masque[..., None]
    if bordure:
        b = max(2, int(min(largeur, hauteur) * 0.06))
        img[:b, :] = meuble; img[-b:, :] = meuble; img[:, :b] = meuble; img[:, -b:] = meuble
    Image.fromarray(img.astype(np.uint8), "RGB").save(chemin)
    return chemin


# ---------------------------------------------------------------- géométrie
def boite(nom, dx, dy, dz, loc=(0, 0, 0), mat=None, rot_z=0.0, base=True):
    """Pavé dx × dy × dz ; base=True : posé sur loc (z = bas), sinon centré."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(dx, dy, dz), verts=bm.verts)
    if base:
        bmesh.ops.translate(bm, vec=(0, 0, dz / 2), verts=bm.verts)
    ob = objet_maillage(nom, bm, mat)
    ob.location = loc
    ob.rotation_euler.z = rot_z
    return ob


def cylindre(nom, rayon, hauteur, loc=(0, 0, 0), mat=None, segments=24, rayon_haut=None, chapeau=True):
    """Cylindre (ou tronc de cône si rayon_haut) posé sur loc, flancs lisses."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=chapeau, cap_tris=False, segments=segments, radius1=rayon,
                          radius2=rayon if rayon_haut is None else rayon_haut, depth=hauteur)
    bmesh.ops.translate(bm, vec=(0, 0, hauteur / 2), verts=bm.verts)
    for f in bm.faces:
        f.smooth = abs(f.normal.z) < 0.7
    ob = objet_maillage(nom, bm, mat)
    ob.location = loc
    aretes_vives(ob)
    return ob


def cone(nom, rayon, hauteur, loc=(0, 0, 0), mat=None, segments=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=True, segments=segments, radius1=rayon, radius2=0.0,
                          depth=hauteur)
    bmesh.ops.translate(bm, vec=(0, 0, hauteur / 2), verts=bm.verts)
    for f in bm.faces:
        f.smooth = True
    ob = objet_maillage(nom, bm, mat)
    ob.location = loc
    aretes_vives(ob)
    return ob


def sphere(nom, rayon, loc=(0, 0, 0), mat=None, subdiv=3, echelle=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=rayon)
    bmesh.ops.scale(bm, vec=echelle, verts=bm.verts)
    for f in bm.faces:
        f.smooth = True
    ob = objet_maillage(nom, bm, mat)
    ob.location = loc
    return ob


def aretes_vives(ob, angle=35):
    """Ombrage lisse sur les courbes, arêtes nettes au-delà de l'angle."""
    m = ob.modifiers.new("aretes", "EDGE_SPLIT")
    m.split_angle = math.radians(angle)
    return m


def biseau(ob, largeur=0.03, segments=1):
    """Petit chanfrein : les arêtes accrochent la lumière comme sur une vraie maquette."""
    m = ob.modifiers.new("biseau", "BEVEL")
    m.width = largeur
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(40)
    return m


def creneaux_cercle(nom, rayon, z, mat, nombre=10, h=0.55, ep=0.35, plein=0.55):
    """Merlons répartis sur un cercle (haut d'une tour ronde)."""
    bm = bmesh.new()
    larg = 2 * math.pi * rayon / nombre * plein
    for k in range(nombre):
        a = 2 * math.pi * k / nombre
        geo = bmesh.ops.create_cube(bm, size=1.0)
        vs = geo["verts"]
        bmesh.ops.scale(bm, vec=(ep, larg, h), verts=vs)
        bmesh.ops.translate(bm, vec=(rayon - ep / 2, 0, z + h / 2), verts=vs)
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, "Z"), verts=vs)
    return objet_maillage(nom, bm, mat)


def creneaux_ligne(bm, a, b, z, h=0.55, ep=0.35, pas=0.9, plein=0.55, forme="carre"):
    """Ajoute à bm des merlons le long du segment a -> b (x, y) à la hauteur z.

    forme "carre" : merlons droits ; "pointe" : merlons à chapeau pyramidal (style des forteresses d'al-Andalus)."""
    a, b = Vector((a[0], a[1], 0)), Vector((b[0], b[1], 0))
    L = (b - a).length
    nb = max(1, int(L / pas))
    d = (b - a).normalized()
    ang = math.atan2(d.y, d.x)
    larg = L / nb * plein
    for k in range(nb):
        c = a + d * (L * (k + 0.5) / nb)
        geo = bmesh.ops.create_cube(bm, size=1.0)
        vs = geo["verts"]
        bmesh.ops.scale(bm, vec=(larg, ep, h), verts=vs)
        bmesh.ops.translate(bm, vec=(0, 0, h / 2), verts=vs)
        if forme == "pointe":
            haut = [v for v in vs if v.co.z > h * 0.75]
            # chapeau : on pince le dessus en pyramide basse
            for v in haut:
                v.co.x *= 0.15
                v.co.y *= 0.4
                v.co.z += h * 0.45
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, "Z"), verts=vs)
        bmesh.ops.translate(bm, vec=(c.x, c.y, z), verts=vs)


def drapeau(nom, camp, hauteur_mat, longueur=1.6, hauteur=1.0, loc=(0, 0, 0), vent=1.0, phase=0.0, mat_mat=None,
            echelle_embleme=0.62, epaisseur_mat=0.05):
    """Mât + drapeau aux couleurs du camp, qui flotte vers l'est (vers la droite de l'écran).

    Le drapeau est dans le plan vertical X-Z, face à la caméra des sprites ; ondulations le long du vent."""
    objets = []
    mat_mat = mat_mat or mat_simple("bois_mat", "#4a3524", rugosite=0.8)
    objets.append(cylindre(nom + "_mat", epaisseur_mat, hauteur_mat + 0.25, loc=loc, mat=mat_mat, segments=8))
    tex = texture_blason(camp, 384, 256, taille_embleme=echelle_embleme)
    bm = bmesh.new()
    nx, nz = 16, 8
    uv = bm.loops.layers.uv.new("UVMap")
    grille = []
    for j in range(nz + 1):
        ligne = []
        for i in range(nx + 1):
            u, v = i / nx, j / nz
            x = u * longueur
            ond = math.sin(u * 5.0 + phase) * 0.12 * vent * u + math.sin(u * 9.0 + phase * 1.7) * 0.04 * vent * u
            z = hauteur_mat - hauteur + v * hauteur - u * u * 0.12 * vent
            ligne.append(bm.verts.new((x, ond, z)))
        grille.append(ligne)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((grille[j][i], grille[j][i + 1], grille[j + 1][i + 1], grille[j + 1][i]))
            f.smooth = True
            for lp, (di, dj) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                lp[uv].uv = ((i + di) / nx, (j + dj) / nz)
    m = mat_tissu(nom + "_tissu", CAMPS[camp]["champ"], image_png=tex)
    ob = objet_maillage(nom + "_drapeau", bm, m)
    ob.location = (loc[0] + epaisseur_mat, loc[1], loc[2])
    s = ob.modifiers.new("epaisseur", "SOLIDIFY")
    s.thickness = 0.02
    objets.append(ob)
    return objets


# ---------------------------------------------------------------- rendu et images
def rendre(chemin):
    """Rend la scène dans chemin (PNG) et renvoie l'image PIL."""
    s = bpy.context.scene
    s.render.filepath = chemin
    t = time.time()
    bpy.ops.render.render(write_still=True)
    journal("rendu %s (%.1f s)" % (os.path.basename(chemin), time.time() - t))
    return Image.open(chemin).convert("RGBA")


def _reduire(img, facteur):
    """Réduction propre d'une image RGBA (alpha prémultiplié, filtre de Lanczos)."""
    if facteur == 1:
        return img
    w, h = img.size
    return img.convert("RGBa").resize((w // facteur, h // facteur), Image.LANCZOS).convert("RGBA")


def rendre_sprite(nom, largeur_px, hauteur_px, objets, ombre=True, contour=0.55, surech=2, echantillons=64,
                  echantillons_ombre=24, force_ombre=0.85, couleur_ombre=(14, 16, 22), net=0.6):
    """Rend un sprite à fond transparent avec son ombre de contact douce, puis le réduit d'un facteur surech.

    largeur_px, hauteur_px : taille finale (2 × la taille logique). La caméra et le sol-capteur doivent
    déjà être dans la scène (camera_trois_quarts appelée avec la taille *suréchantillonnée*).
    objets : objets du sujet (cachés à la caméra pendant la passe d'ombre).
    contour : opacité d'un liseré sombre d'un demi-pixel logique, pour la lisibilité sur l'herbe (0 = aucun)."""
    s = bpy.context.scene
    W, H = largeur_px * surech, hauteur_px * surech
    reglages_rendu(W, H, echantillons=echantillons, transparent=True)
    tmp = os.path.join(CACHE, "_rendu")
    os.makedirs(tmp, exist_ok=True)
    capteurs = [o for o in s.objects if o.is_shadow_catcher]
    # passe 1 : le sujet seul (le sol reste là pour la lumière renvoyée, mais invisible à la caméra)
    for c in capteurs:
        c.visible_camera = False
    sujet = rendre(os.path.join(tmp, nom + "-sujet.png"))
    calque = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if ombre and capteurs:
        # passe 2 : l'ombre seule (sujet invisible à la caméra mais toujours là pour porter ombre)
        for c in capteurs:
            c.visible_camera = True
        caches = []
        for o in objets:
            if o.visible_camera:
                o.visible_camera = False
                caches.append(o)
        s.cycles.samples = echantillons_ombre
        om = rendre(os.path.join(tmp, nom + "-ombre.png"))
        for o in caches:
            o.visible_camera = True
        a = np.array(om, dtype=np.float32)[..., 3] / 255.0
        # l'ombre s'efface près des bords du cadre et loin du sujet (jamais coupée net)
        m = np.ones((H, W), dtype=np.float32)
        bord = max(2, int(0.06 * min(W, H)))
        rampe = np.clip(np.arange(W, dtype=np.float32) / bord, 0, 1)
        m *= np.minimum(rampe, rampe[::-1])[None, :]
        rampe = np.clip(np.arange(H, dtype=np.float32) / (bord * 0.6), 0, 1)
        m *= np.minimum(rampe, rampe[::-1])[:, None]
        pres = np.array(Image.fromarray((np.array(sujet)[..., 3]).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(min(W, H) * 0.12)), dtype=np.float32) / 255.0
        m *= np.clip(pres * 6.0, 0, 1)
        a = np.clip(a * m * force_ombre, 0, 1)
        ombre_img = np.zeros((H, W, 4), dtype=np.uint8)
        ombre_img[..., 0], ombre_img[..., 1], ombre_img[..., 2] = couleur_ombre
        ombre_img[..., 3] = (a * 255).astype(np.uint8)
        calque = Image.fromarray(ombre_img, "RGBA").filter(ImageFilter.GaussianBlur(surech * 0.8))
        for c in capteurs:
            c.visible_camera = False
        s.cycles.samples = echantillons
    sujet_r = _reduire(sujet, surech)
    if net:
        rgb = sujet_r.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=int(net * 100), threshold=1))
        sujet_r = Image.merge("RGBA", (*rgb.split(), sujet_r.split()[3]))
    final = _reduire(calque, surech)
    if contour:
        a = sujet_r.split()[3]
        ep = a.filter(ImageFilter.MaxFilter(3))
        trait = Image.new("RGBA", sujet_r.size, (22, 16, 10, 0))
        trait.putalpha(ep.point(lambda v: int(v * contour)))
        final.alpha_composite(trait)
    final.alpha_composite(sujet_r)
    return final


def bande(images):
    """Colle des images de même taille en une bande horizontale."""
    w, h = images[0].size
    b = Image.new("RGBA", (w * len(images), h), (0, 0, 0, 0))
    for k, im in enumerate(images):
        b.alpha_composite(im, (k * w, 0))
    return b


def sauver_png(img, chemin):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    img.save(chemin, optimize=True)
    journal("écrit %s (%d Ko)" % (os.path.relpath(chemin, RACINE), os.path.getsize(chemin) // 1024))
    return chemin


def sauver_jpg(img, chemin, qualite=80, max_ko=450):
    """JPEG le plus fidèle possible sous max_ko (la qualité baisse par pas de 3 si besoin)."""
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    rgb = img.convert("RGB")
    q = qualite
    while True:
        rgb.save(chemin, quality=q, optimize=True, progressive=True, subsampling="4:2:0")
        ko = os.path.getsize(chemin) / 1024
        if ko <= max_ko or q <= 50:
            break
        q -= 3
    journal("écrit %s (%d Ko, qualité %d)" % (os.path.relpath(chemin, RACINE), ko, q))
    return chemin


# ---------------------------------------------------------------- manifeste jeu/assets/images/td/sprites.js
ENTETE_MANIFESTE = (
    "// Images pré-calculées du champ de bataille et de la campagne (rendu 3D Blender, Cycles).\n"
    "// Fichier généré par atelier/outils/rendu-3d/ : ne pas modifier à la main (chaque script réécrit ses entrées).\n"
    "// w, h : taille logique d'une image (px du canevas 1000 × 660) ; ax, ay : point d'ancrage dans l'image,\n"
    "// en px logiques depuis le coin haut-gauche ; frames : nombre d'images côte à côte (bande horizontale).\n"
)


def lire_manifeste():
    if not os.path.exists(MANIFESTE):
        return {}
    with open(MANIFESTE, encoding="utf-8") as f:
        txt = f.read()
    m = re.search(r"JEU\.SPRITES\s*=\s*(\{.*\})\s*;", txt, re.S)
    return json.loads(m.group(1)) if m else {}


def maj_manifeste(entrees):
    """Fusionne des entrées {nom: {src, w, h, ax, ay, frames}} dans le manifeste et le réécrit (ordre alphabétique)."""
    tout = lire_manifeste()
    tout.update(entrees)
    lignes = []
    for cle in sorted(tout):
        lignes.append("  %s: %s" % (json.dumps(cle), json.dumps(tout[cle], ensure_ascii=False, separators=(", ", ": "))))
    txt = ENTETE_MANIFESTE + "window.JEU = window.JEU || {};\nJEU.SPRITES = {\n" + ",\n".join(lignes) + "\n};\n"
    with open(MANIFESTE, "w", encoding="utf-8") as f:
        f.write(txt)
    journal("manifeste : %d entrées" % len(tout))


def entree(src_relatif, w, h, ax, ay, frames=1):
    """Entrée du manifeste ; src relatif à jeu/ (ex. 'assets/images/td/tour-archers-france-1.png')."""
    return {"src": src_relatif, "w": w, "h": h, "ax": ax, "ay": ay, "frames": frames}


def chemin_td(fichier):
    return os.path.join(TD, fichier), "assets/images/td/" + fichier


def chemin_campagne(fichier):
    return os.path.join(CAMPAGNE, fichier), "assets/images/campagne/" + fichier


def graine(texte):
    """Graine stable tirée d'un nom (les rendus sont reproductibles)."""
    h = 0
    for ch in texte:
        h = (h * 131 + ord(ch)) & 0xFFFFFFFF
    random.seed(h)
    return h
