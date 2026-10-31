# -*- coding: utf-8 -*-
"""Module commun des générateurs d'images pré-calculées (Blender en module Python, rendu Cycles sur CPU).

Tout ce qui doit être identique d'une image à l'autre vit ici, pour que terrains, châteaux, tours et
troupes s'accordent : la lumière (soleil du nord-ouest, fin d'après-midi), les caméras (vue de dessus
pour les terrains, vue de trois quarts inclinée de 40° pour les sprites), les réglages de rendu,
les matières (textures Poly Haven CC0), les couleurs et emblèmes des camps, l'enregistrement des images,
les contrôles automatiques (bords transparents, part de couleur du camp, pas de bleu chez les Anglais)
et la mise à jour du manifeste jeu/assets/images/td/sprites.js.

Repères du monde : +X vers l'est (droite de l'écran), +Y vers le nord (haut de l'écran en vue de dessus),
+Z vers le haut. Unité : le mètre.
"""
import colorsys
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
REFUS = os.path.join(CACHE, "_refus")
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
LACET_BATIMENTS = 32         # bâtiments carrés tournés de 32° (une face au soleil, une à l'ombre, comme dans AoE II)

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
# Appoint des sprites (débouchage côté caméra) : rapport soleil / débouchage d'environ 3 pour 1.
APPOINT_FORCE = 0.62
APPOINT_TEINTE = (0.85, 0.92, 1.05)
# Bâtiments de pisé (Omeyyades) : leurs faces vues ne reçoivent le soleil que de biais ; sans débouchage froid et avec
# un ciel atténué, la face à l'ombre est au moins 2,5 fois plus sombre que la face au soleil (mesuré sur un cube de
# contrôle : 0,19 contre 0,077 de luminance), au lieu de 1,5 fois (effet « carton »). Même soleil, même direction.
CIEL_PISE, APPOINT_PISE = 0.5, 0.0
# Lumière de contour des troupes : chaude, venue du haut et de l'arrière-gauche, sans ombre portée.
CONTOUR_FORCE = 1.9
CONTOUR_TEINTE = (1.0, 0.86, 0.66)
# Ombres des sprites : même teinte que les ombres d'arbres du terrain (vert-brun très sombre).
OMBRE_COULEUR = (20, 28, 12)
OMBRE_FORCE = 0.7

# Camps : couleurs (sRGB), emblème, matières des places fortes.
#   champ / meuble : couleurs héraldiques (bannières) ; tissu : albédo des tabards et écus (plus clair que le champ,
#   pour que le rendu retombe sur la couleur du camp) ; inverse : tentures à couleurs inversées (Omeyyades :
#   tour ivoire sur champ vert, car l'ivoire disparaît sur l'ocre).
#   teinte_toit de France : ardoise gris-bleu (et non bleu roi) ; mesuré sur les places fortes : saturation médiane rendue
#   des toits 0,26 (#55657f donnait 0,49, #5b6470 donnait 0,33 ; plafond 0,32). L'azur saturé reste aux bannières.
CAMPS = {
    "france": {"champ": "#24407a", "meuble": "#e2c272", "embleme": "lys", "tissu": "#3358a8", "contour": "#14234a",
               "pierre": "yellow_stone_wall", "teinte_pierre": "#a39a86", "toit": "roof_slates_02", "teinte_toit": "#5d636b"},
    "angleterre": {"champ": "#9b1f1f", "meuble": "#e2c272", "embleme": "lion", "tissu": "#b3262a", "contour": "#5a1010",
                   "pierre": "castle_wall_varriation", "teinte_pierre": "#aa9f8b", "toit": "clay_roof_tiles",
                   "teinte_toit": "#8a5a45", "plomb": "#857b70"},
    "omeyyades": {"champ": "#e9e1cc", "meuble": "#2f6b52", "embleme": "tour", "tissu": "#ece4cf", "contour": "#1d3f31",
                  "inverse": True, "vert_tissu": "#357659", "pierre": "yellow_stone_wall", "teinte_pierre": "#8c7b65", "mur": "clay_plaster",
                  "teinte_mur": "#c6b297", "teinte_toit": "#9a8462"},
}

# Contrôle « couleur du camp » : fenêtre de teinte (degrés), saturation et valeur minimales (HSV des pixels rendus).
TEINTES_CAMP = {
    "france": ((198, 242), 0.25, 0.10),
    "angleterre": ((342, 22), 0.33, 0.12),
    "omeyyades": ((118, 185), 0.18, 0.10),
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


def pivot(nom, objets, lacet_deg=0.0, loc=(0, 0, 0)):
    """Rattache des objets (sans parent) à un repère vide tourné de lacet_deg autour de Z (bâtiments de biais)."""
    p = lier(bpy.data.objects.new(nom, None))
    for o in objets:
        if o.parent is None and o is not p:
            o.parent = p
    p.rotation_euler = (0, 0, math.radians(lacet_deg))
    p.location = loc
    return p


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


def _soleil_sans_ombre(nom, force, teinte, vers, angle=30):
    lum = bpy.data.lights.new(nom, "SUN")
    lum.energy = force
    lum.color = teinte
    lum.angle = math.radians(angle)
    try:
        lum.cycles.cast_shadow = False
    except Exception:
        pass
    try:
        lum.use_shadow = False
    except Exception:
        pass
    ob = lier(bpy.data.objects.new(nom, lum))
    ob.rotation_euler = Vector(vers).normalized().to_track_quat("Z", "Y").to_euler()
    return ob


def lumiere_batiment(camp):
    """Lumière d'un sprite de bâtiment : soleil et ciel communs, débouchage côté caméra ; pisé omeyyade : ciel atténué
    et pas de débouchage (voir CIEL_PISE)."""
    if camp == "omeyyades":
        installer_lumiere(force_ciel=CIEL_PISE)
        if APPOINT_PISE:
            lumiere_appoint(APPOINT_PISE)
    else:
        installer_lumiere()
        lumiere_appoint()


def lumiere_appoint(force=APPOINT_FORCE, teinte=APPOINT_TEINTE):
    """Lumière d'appoint des sprites seulement : venue de la caméra (sud, 48° de haut), sans ombre portée.

    Le soleil du nord-ouest laisse dans l'ombre la face tournée vers la caméra ; cet appoint doux et un peu froid
    la débouche (rapport soleil / débouchage d'environ 3 pour 1), sans changer la direction des ombres."""
    t = math.radians(INCLINAISON + 8)
    return _soleil_sans_ombre("appoint", force, teinte, (0.25, -math.cos(t), math.sin(t)))


def lumiere_contour(force=CONTOUR_FORCE, teinte=CONTOUR_TEINTE):
    """Lumière de contour des troupes : chaude, rasante, venue du haut et de l'arrière-gauche, sans ombre portée.

    Elle allume un liseré clair sur le haut des figures (casques, épaules, croupe des chevaux), qui les détache
    des fonds sombres (forêt, planches des ponts)."""
    return _soleil_sans_ombre("contour", force, teinte, (-0.45, 0.85, 0.42), angle=12)


def reglages_rendu(largeur, hauteur, echantillons=64, transparent=True, look="AgX - Medium High Contrast",
                   filtre=1.2, seuil_adaptatif=0.02, exposition=0.0):
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
    s.view_settings.exposure = exposition
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


def cadrer(cam_ob, largeur_px, hauteur_px, px_par_m, ancre_x_px, ancre_y_px):
    """Cadre la caméra de trois quarts : l'origine du monde tombe sur le pixel (ancre_x_px, ancre_y_px) compté
    depuis le coin haut-gauche d'une image de largeur_px × hauteur_px, à px_par_m pixels par mètre."""
    cam = cam_ob.data
    grand = max(largeur_px, hauteur_px)
    cam.ortho_scale = grand / px_par_m
    cam.sensor_fit = "AUTO"
    cam.shift_x = (largeur_px / 2.0 - ancre_x_px) / grand
    cam.shift_y = (ancre_y_px - hauteur_px / 2.0) / grand
    cam_ob["cadre"] = [largeur_px, hauteur_px, px_par_m, ancre_x_px, ancre_y_px]
    s = bpy.context.scene
    s.render.resolution_x = int(largeur_px)
    s.render.resolution_y = int(hauteur_px)
    return cam_ob


def camera_trois_quarts(largeur_px, hauteur_px, px_par_m, ancre_bas_px, inclinaison=INCLINAISON, ancre_x_px=None):
    """Caméra orthographique tournée vers le nord, inclinée de 40° sous l'horizontale.

    L'origine du monde (0, 0, 0) tombe à ancre_bas_px pixels au-dessus du bord bas de l'image (au centre
    horizontal, ou à ancre_x_px depuis la gauche) : c'est le point d'ancrage du sprite dans le jeu."""
    cam = bpy.data.cameras.new("camera_3q")
    cam.type = "ORTHO"
    cam.clip_start = 1.0
    cam.clip_end = 600.0
    ob = lier(bpy.data.objects.new("camera_3q", cam))
    t = math.radians(inclinaison)
    regard = Vector((0.0, math.cos(t), -math.sin(t)))
    ob.location = -regard * 250.0
    ob.rotation_euler = (math.pi / 2 - t, 0.0, 0.0)
    bpy.context.scene.camera = ob
    cadrer(ob, largeur_px, hauteur_px, px_par_m, largeur_px / 2.0 if ancre_x_px is None else ancre_x_px,
           hauteur_px - ancre_bas_px)
    return ob


def sol_capteur(taille=60.0, teinte="#4a5230"):
    """Sol invisible qui ne garde que les ombres (shadow catcher) ; sa teinte d'herbe renvoie un peu de lumière verte
    sous les bases des bâtiments et des figurines, comme le pré du terrain."""
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


def mat_simple(nom, teinte, rugosite=0.7, metal=0.0, emission=None, bosse=0.0, echelle_bosse=40.0, speculaire=0.5):
    """Matière unie (teinte sRGB '#rrggbb' ou tuple linéaire), avec un léger grain si bosse > 0."""
    m, nt, p = nouveau_materiau(nom)
    p.inputs["Base Color"].default_value = couleur(teinte) if isinstance(teinte, str) else tuple(teinte)[:3] + (1,)
    p.inputs["Roughness"].default_value = rugosite
    p.inputs["Metallic"].default_value = metal
    p.inputs["Specular IOR Level"].default_value = speculaire
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
    nt.links.new(bruit.outputs["Factor"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return b


def moyenne_ph(ident):
    """Couleur moyenne (sRGB 0-255) de la carte diffuse d'une texture, mise en cache."""
    cle = ("moy", ident)
    if cle not in _moyennes:
        a = np.array(Image.open(tex_ph(ident, "diff")).convert("RGB").resize((128, 128)), dtype=np.float32)
        _moyennes[cle] = a.reshape(-1, 3).mean(0)
    return _moyennes[cle]


_moyennes = {}


def calibrer(nt, sortie_couleur, ident, cible):
    """Multiplie une texture pour que sa couleur moyenne devienne la teinte cible (sRGB '#rrggbb') : les nuances
    de la photo restent, l'ensemble prend la couleur voulue (herbe d'un vert franc, terre brune...)."""
    moy = moyenne_ph(ident)
    c = couleur(cible)
    facteurs = [c[i] / max(1e-4, srgb_lin(moy[i] / 255.0)) for i in range(3)]
    vm = nt.nodes.new("ShaderNodeVectorMath")
    vm.operation = "MULTIPLY"
    nt.links.new(sortie_couleur, vm.inputs[0])
    vm.inputs[1].default_value = facteurs
    return vm.outputs["Vector"]


def teinter_luminance(nt, sortie_couleur, ident, cible, contraste=1.0, garde_teinte=0.25):
    """Teinte par la luminance : couleur cible × (luminosité locale / luminosité moyenne) ^ contraste.

    Garde le grain de la photo sans ses couleurs parasites (cailloux bleutés dans l'herbe...) ;
    garde_teinte remet une part de la photo calibrée pour ne pas tout aplatir."""
    moy = moyenne_ph(ident)
    lum_moy = sum(k * srgb_lin(moy[i] / 255.0) for i, k in enumerate((0.2126, 0.7152, 0.0722)))
    bw = nt.nodes.new("ShaderNodeRGBToBW")
    nt.links.new(sortie_couleur, bw.inputs["Color"])
    div = nt.nodes.new("ShaderNodeMath"); div.operation = "DIVIDE"
    nt.links.new(bw.outputs["Val"], div.inputs[0])
    div.inputs[1].default_value = max(1e-4, lum_moy)
    pw = nt.nodes.new("ShaderNodeMath"); pw.operation = "POWER"
    nt.links.new(div.outputs[0], pw.inputs[0])
    pw.inputs[1].default_value = contraste
    vm = nt.nodes.new("ShaderNodeVectorMath"); vm.operation = "SCALE"
    vm.inputs[0].default_value = couleur(cible)[:3]
    nt.links.new(pw.outputs[0], vm.inputs["Scale"])
    if garde_teinte <= 0:
        return vm.outputs["Vector"]
    cal = calibrer(nt, sortie_couleur, ident, cible)
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"
    _entree(mx, "Factor", "VALUE").default_value = garde_teinte
    nt.links.new(vm.outputs["Vector"], _entree(mx, "A", "RGBA"))
    nt.links.new(cal, _entree(mx, "B", "RGBA"))
    return _sortie(mx, "RGBA")


def tex_ph(ident, carte):
    """Chemin d'une carte (diff, nor_gl, rough, disp) d'une texture Poly Haven téléchargée."""
    dossier = os.path.join(SOURCES, ident)
    motif = "(diff|diffuse)" if carte == "diff" else re.escape(carte)      # certaines textures disent « diffuse »
    for f in sorted(os.listdir(dossier)):
        if re.search(r"_%s_\dk\.(jpg|png)$" % motif, f):
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


def _multiplier(nt, sortie_couleur, facteur):
    """Couleur × facteur (prise de nœud scalaire) : salissure, occlusion, banches..."""
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    _entree(mul, "Factor", "VALUE").default_value = 1.0
    nt.links.new(sortie_couleur, _entree(mul, "A", "RGBA"))
    cr = nt.nodes.new("ShaderNodeCombineColor")
    for k in ("Red", "Green", "Blue"):
        nt.links.new(facteur, cr.inputs[k])
    nt.links.new(cr.outputs["Color"], _entree(mul, "B", "RGBA"))
    return _sortie(mul, "RGBA")


def _plage(nt, entree, de0, de1, a0, a1):
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = de0
    mr.inputs["From Max"].default_value = de1
    mr.inputs["To Min"].default_value = a0
    mr.inputs["To Max"].default_value = a1
    nt.links.new(entree, mr.inputs["Value"])
    return mr.outputs["Result"]


def mat_ph(nom, ident, echelle_m=None, teinte=None, force_teinte=0.0, saturation=1.0, valeur=1.0,
           rugosite=0.85, bosse=0.35, projection="BOITE", mosaique=1.0, salissure=0.0, lits=0.0,
           cible=None, contraste=1.0, garde=0.25, h_salissure=1.0, occlusion=0.0, banches=None, speculaire=0.5,
           coulures=0.0, var_rugosite=0.0):
    """Matière tirée d'une texture Poly Haven.

    projection "BOITE" : projection triplanaire en coordonnées objet (bâtiments sans UV), relief tiré de la
    luminance (les joints sombres s'enfoncent) ; "UV" : UV de l'objet, carte de normales.
    echelle_m : taille réelle d'un motif (par défaut celle de la fiche Poly Haven), divisée par mosaique.
    cible : teinte sRGB visée pour l'albédo moyen (teinte par la luminance, contraste = accentuation du grain).
    salissure : pied des murs plus sombre sur h_salissure mètres (hauteur dans le monde : les corniches restent propres).
    occlusion : creux et angles rentrants assombris (nœud d'occlusion ambiante de Cycles, sur 1 m).
    banches : {"h": 0.85, "l": 2.2, "var": 0.07, "joint": 0.6} : murs de pisé coulés par banches (joints horizontaux
    tous les h mètres, verticaux tous les l mètres, valeur variant de ±var d'une banche à l'autre).
    coulures : traînées sombres verticales (pluie, sous les merlons), plus fortes vers le haut de chaque objet.
    var_rugosite : la rugosité varie de ± cette valeur selon un bruit (le mur n'a plus l'aspect d'un plastique uni)."""
    m, nt, p = nouveau_materiau(nom)
    N = nt.nodes.new
    L = nt.links.new
    taille = (echelle_m or taille_ph(ident)) / mosaique
    tc = N("ShaderNodeTexCoord")
    geo = N("ShaderNodeNewGeometry")
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
    if cible:
        sortie_couleur = teinter_luminance(nt, diff.outputs["Color"], ident, cible, contraste, garde)
        if valeur != 1.0:
            vv = N("ShaderNodeValue"); vv.outputs[0].default_value = valeur
            sortie_couleur = _multiplier(nt, sortie_couleur, vv.outputs[0])
    else:
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
            lum = max(0.05, 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])
            _entree(mx, "B", "RGBA").default_value = tuple(min(1.0, v * 0.45 / lum) for v in c[:3]) + (1,)
            sortie_couleur = _sortie(mx, "RGBA")
    sepw = N("ShaderNodeSeparateXYZ")
    L(geo.outputs["Position"], sepw.inputs[0])
    joints = None
    if banches:
        # coordonnée le long du mur (x + y objet) et hauteur dans le monde
        sepo = N("ShaderNodeSeparateXYZ")
        L(tc.outputs["Object"], sepo.inputs[0])
        som = N("ShaderNodeMath"); som.operation = "ADD"
        L(sepo.outputs["X"], som.inputs[0]); L(sepo.outputs["Y"], som.inputs[1])
        cmb = N("ShaderNodeCombineXYZ")
        L(som.outputs[0], cmb.inputs["X"]); L(sepw.outputs["Z"], cmb.inputs["Y"])
        br = N("ShaderNodeTexBrick")
        br.offset = 0.5
        br.offset_frequency = 2
        L(cmb.outputs["Vector"], br.inputs["Vector"])
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Brick Width"].default_value = banches.get("l", 2.2)
        br.inputs["Row Height"].default_value = banches.get("h", 0.85)
        br.inputs["Mortar Size"].default_value = banches.get("ep", 0.035)
        br.inputs["Mortar Smooth"].default_value = 0.4
        br.inputs["Bias"].default_value = 0.0
        v = banches.get("var", 0.07)
        br.inputs["Color1"].default_value = (1 - v, 1 - v, 1 - v, 1)
        br.inputs["Color2"].default_value = (1 + v, 1 + v, 1 + v, 1)
        j = banches.get("joint", 0.62)
        br.inputs["Mortar"].default_value = (j, j, j, 1)
        bw = N("ShaderNodeRGBToBW")
        L(br.outputs["Color"], bw.inputs["Color"])
        sortie_couleur = _multiplier(nt, sortie_couleur, bw.outputs["Val"])
        joints = br.outputs["Factor"]
    if lits > 0:
        mz = N("ShaderNodeMath"); mz.operation = "PINGPONG"; mz.inputs[1].default_value = 0.425
        L(sepw.outputs["Z"], mz.inputs[0])
        sortie_couleur = _multiplier(nt, sortie_couleur, _plage(nt, mz.outputs[0], 0.0, 0.04, 1.0 - lits, 1.0))
    if salissure > 0:
        # pied des murs plus sombre (terre, mousse, rejaillissement de la pluie), hauteur mesurée dans le monde
        sortie_couleur = _multiplier(nt, sortie_couleur, _plage(nt, sepw.outputs["Z"], 0.0, h_salissure, 1.0 - salissure, 1.0))
    if coulures > 0:
        # bruit étiré à la verticale (traînées fines, longues de 2 à 3 m), pondéré par la hauteur relative dans l'objet
        mpc = N("ShaderNodeMapping")
        mpc.inputs["Scale"].default_value = (7.0, 7.0, 0.45)
        L(tc.outputs["Object"], mpc.inputs["Vector"])
        nzc = N("ShaderNodeTexNoise")
        nzc.inputs["Scale"].default_value = 1.0
        nzc.inputs["Detail"].default_value = 3.0
        L(mpc.outputs["Vector"], nzc.inputs["Vector"])
        trainee = _plage(nt, nzc.outputs["Factor"], 0.5, 0.72, 0.0, 1.0)
        sepg = N("ShaderNodeSeparateXYZ")
        L(tc.outputs["Generated"], sepg.inputs[0])
        haut = _plage(nt, sepg.outputs["Z"], 0.35, 1.0, 0.0, 1.0)
        mc = N("ShaderNodeMath"); mc.operation = "MULTIPLY"
        L(trainee, mc.inputs[0]); L(haut, mc.inputs[1])
        sortie_couleur = _multiplier(nt, sortie_couleur, _plage(nt, mc.outputs[0], 0.0, 1.0, 1.0, 1.0 - coulures))
    if occlusion > 0:
        ao = N("ShaderNodeAmbientOcclusion")
        ao.inputs["Distance"].default_value = 1.0
        ao.samples = 8
        sortie_couleur = _multiplier(nt, sortie_couleur, _plage(nt, ao.outputs["AO"], 0.0, 1.0, 1.0 - occlusion, 1.0))
    L(sortie_couleur, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rugosite
    if var_rugosite > 0:
        nzr = N("ShaderNodeTexNoise")
        nzr.inputs["Scale"].default_value = 1.5
        nzr.inputs["Detail"].default_value = 4.0
        L(tc.outputs["Object"], nzr.inputs["Vector"])
        L(_plage(nt, nzr.outputs["Factor"], 0.3, 0.7, rugosite - var_rugosite, min(1.0, rugosite + var_rugosite)),
          p.inputs["Roughness"])
    p.inputs["Specular IOR Level"].default_value = speculaire
    if bosse > 0:
        if projection == "BOITE":
            bw = N("ShaderNodeRGBToBW")
            L(diff.outputs["Color"], bw.inputs["Color"])
            hauteur = bw.outputs["Val"]
            if joints is not None:
                # les joints de banche s'enfoncent un peu
                mj = N("ShaderNodeMath"); mj.operation = "MULTIPLY_ADD"
                L(joints, mj.inputs[0]); mj.inputs[1].default_value = -0.6
                L(hauteur, mj.inputs[2])
                hauteur = mj.outputs[0]
            b = N("ShaderNodeBump")
            b.inputs["Strength"].default_value = bosse
            b.inputs["Distance"].default_value = 0.012 * taille
            L(hauteur, b.inputs["Height"])
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


def mat_pise(nom, valeur=1.0, echelle_tex=1.0):
    """Pisé ocre d'al-Andalus : terre damée désaturée (saturation rendue d'environ 0,32), coulée par banches (joints
    sombres et fins tous les 0,85 m, peu d'écart de teinte d'une banche à l'autre), coulures sombres sous les merlons,
    rugosité variable, occlusion forte (0,6) pour que la face à l'ombre soit franchement plus sombre que la face au soleil."""
    c = CAMPS["omeyyades"]
    return mat_ph(nom, c["mur"], echelle_m=3.0 * echelle_tex, cible=c["teinte_mur"], contraste=1.35, garde=0.08,
                  valeur=valeur, bosse=0.35, salissure=0.4, h_salissure=1.3, occlusion=0.6, rugosite=0.88,
                  var_rugosite=0.1, coulures=0.38,
                  banches={"h": 0.85, "l": 2.2, "var": 0.03, "joint": 0.55, "ep": 0.03})


def mat_toit(nom, ident, cible, rang_m=0.28, largeur_m=0.32, echelle_m=2.4, contraste=1.25, rugosite=(0.55, 0.85),
             speculaire=0.25, joint=0.55, var=0.12, valeur=1.0):
    """Toit d'ardoises ou de tuiles posé sur des UV en mètres (cone_uv, toit_deux_pans) : la photo Poly Haven
    donne le grain, des rangs procéduraux (rang_m de haut) dessinent les anneaux d'ardoises bien lisibles.
    Rugosité ramenée entre deux bornes (pas de paillettes blanches), spéculaire réduit."""
    m, nt, p = nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    mp = N("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / echelle_m, 1 / echelle_m, 1)
    L(tc.outputs["UV"], mp.inputs["Vector"])
    diff = N("ShaderNodeTexImage")
    diff.image = image(tex_ph(ident, "diff"))
    L(mp.outputs["Vector"], diff.inputs["Vector"])
    coul = teinter_luminance(nt, diff.outputs["Color"], ident, cible, contraste, 0.15)
    br = N("ShaderNodeTexBrick")
    br.offset = 0.5
    br.offset_frequency = 2
    L(tc.outputs["UV"], br.inputs["Vector"])
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Brick Width"].default_value = largeur_m
    br.inputs["Row Height"].default_value = rang_m
    br.inputs["Mortar Size"].default_value = rang_m * 0.12
    br.inputs["Mortar Smooth"].default_value = 0.5
    br.inputs["Bias"].default_value = 0.0
    br.inputs["Color1"].default_value = (1 - var, 1 - var, 1 - var, 1)
    br.inputs["Color2"].default_value = (1 + var * 0.6, 1 + var * 0.6, 1 + var * 0.6, 1)
    br.inputs["Mortar"].default_value = (joint, joint, joint, 1)
    bw = N("ShaderNodeRGBToBW")
    L(br.outputs["Color"], bw.inputs["Color"])
    coul = _multiplier(nt, coul, bw.outputs["Val"])
    if valeur != 1.0:
        vv = N("ShaderNodeValue"); vv.outputs[0].default_value = valeur
        coul = _multiplier(nt, coul, vv.outputs[0])
    L(coul, p.inputs["Base Color"])
    try:
        rg = N("ShaderNodeTexImage")
        rg.image = image(tex_ph(ident, "rough"), non_couleur=True)
        L(mp.outputs["Vector"], rg.inputs["Vector"])
        src = rg.outputs["Color"]
    except FileNotFoundError:
        bw2 = N("ShaderNodeRGBToBW")
        L(diff.outputs["Color"], bw2.inputs["Color"])
        src = bw2.outputs["Val"]
    L(_plage(nt, src, 0.0, 1.0, rugosite[0], rugosite[1]), p.inputs["Roughness"])
    p.inputs["Specular IOR Level"].default_value = speculaire
    # relief : rangs en creux (bord inférieur de chaque rang) + normales de la photo
    b = N("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.7
    b.inputs["Distance"].default_value = 0.03
    inv = N("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    L(br.outputs["Factor"], inv.inputs[1])
    L(inv.outputs[0], b.inputs["Height"])
    try:
        nor = N("ShaderNodeTexImage")
        nor.image = image(tex_ph(ident, "nor_gl"), non_couleur=True)
        L(mp.outputs["Vector"], nor.inputs["Vector"])
        nm = N("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = 0.6
        L(nor.outputs["Color"], nm.inputs["Color"])
        L(nm.outputs["Normal"], b.inputs["Normal"])
    except FileNotFoundError:
        pass
    L(b.outputs["Normal"], p.inputs["Normal"])
    return m


def mat_metal(nom, teinte="#8f8a82", rugosite=0.38, maille=False, echelle_maille=0.012, metal=1.0):
    """Acier (casques, lames) ; maille=True : cotte de mailles (anneaux simulés par un relief de Voronoï).

    La maille est un gris chaud peu métallique (metallic 0,6, rugosité 0,55) : elle ne renvoie plus le ciel bleu."""
    m, nt, p = nouveau_materiau(nom)
    p.inputs["Base Color"].default_value = couleur(teinte)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rugosite
    if maille:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        vo = nt.nodes.new("ShaderNodeTexVoronoi")
        vo.feature = "DISTANCE_TO_EDGE"
        vo.inputs["Scale"].default_value = 1.0 / echelle_maille
        nt.links.new(tc.outputs["Object"], vo.inputs["Vector"])
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = 0.5
        b.inputs["Distance"].default_value = 0.004
        nt.links.new(vo.outputs["Distance"], b.inputs["Height"])
        nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = tuple(v * 0.45 for v in couleur(teinte)[:3]) + (1,)
        ramp.color_ramp.elements[1].position = 0.18
        ramp.color_ramp.elements[1].color = couleur(teinte)
        nt.links.new(vo.outputs["Distance"], ramp.inputs["Factor"])
        nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    return m


def mat_tissu(nom, teinte, rugosite=0.9, image_png=None, brillance=0.3, translucide=0.0):
    """Tissu (tabards, caparaçons, bannières) : velouté léger ; image_png : motif héraldique plaqué en UV.

    translucide : part de lumière qui traverse l'étoffe (un drapeau vu à contre-jour s'allume, comme un vrai)."""
    m, nt, p = nouveau_materiau(nom)
    p.inputs["Roughness"].default_value = rugosite
    p.inputs["Specular IOR Level"].default_value = 0.3
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
        src = im.outputs["Color"]
        nt.links.new(src, p.inputs["Base Color"])
    else:
        p.inputs["Base Color"].default_value = couleur(teinte) if isinstance(teinte, str) else teinte
        src = None
    _grain(nt, p, 0.15, 300.0)
    if translucide > 0:
        out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
        tr = nt.nodes.new("ShaderNodeBsdfTranslucent")
        if src is not None:
            nt.links.new(src, tr.inputs["Color"])
        else:
            tr.inputs["Color"].default_value = p.inputs["Base Color"].default_value
        mx = nt.nodes.new("ShaderNodeMixShader")
        mx.inputs[0].default_value = translucide
        nt.links.new(p.outputs[0], mx.inputs[1])
        nt.links.new(tr.outputs[0], mx.inputs[2])
        nt.links.new(mx.outputs[0], out.inputs["Surface"])
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



def _chaikin(pts, n=2, ferme=True):
    """Adoucit une ligne brisée (coupe des coins de Chaikin)."""
    for _ in range(n):
        q = []
        m = len(pts)
        for i in range(m if ferme else m - 1):
            a, b = pts[i], pts[(i + 1) % m]
            q.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            q.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        if not ferme:
            q = [pts[0]] + q + [pts[-1]]
        pts = q
    return pts


def masque_lion(largeur):
    """Lion passant gardant (armes d'Angleterre : de gueules aux lions passants gardants d'or), dessiné ici même (CC0),
    à la manière des armoriaux : corps long et mince (taille à 60 % de la hauteur du poitrail), tête de face assez
    petite avec deux oreilles, crinière en six mèches de flamme recourbées le long de l'encolure, patte antérieure dextre
    levée, pattes à trois griffes crochues, queue en S dressée au-dessus du dos, terminée par une touffe à trois lobes
    ramenée vers le dos. Tourné vers la gauche (dextre), comme en héraldique. Pas de traits de visage (ni yeux ni bouche :
    ils tireraient le dessin vers le dessin animé).
    Renvoie un masque PIL 'L' de largeur × (0,65 × largeur)."""
    sur = 4
    W = largeur * sur
    k = W / 200.0
    H = int(round(130 * k))
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)

    def P(pts):
        return [(x * k, y * k) for x, y in pts]

    def bezier(pts, n=16):
        """Courbe de Bézier (quadratique ou cubique) échantillonnée."""
        r = []
        for i in range(n + 1):
            t = i / n
            u = 1 - t
            if len(pts) == 3:
                a, b, c = pts
                r.append((u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]))
            else:
                a, b, c, e = pts
                r.append((u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * e[0],
                          u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * e[1]))
        return r

    def trait(pts, w0, w1, pointe=False):
        """Bande effilée le long d'une courbe (largeur w0 au départ, w1 à la fin) : membres, mèches, queue."""
        n = len(pts)
        g, dr = [], []
        for i in range(n):
            a, b = pts[max(0, i - 1)], pts[min(n - 1, i + 1)]
            tx, ty = b[0] - a[0], b[1] - a[1]
            l = math.hypot(tx, ty) or 1.0
            nx, ny = -ty / l, tx / l
            t = i / (n - 1)
            w = (w0 + (w1 - w0) * t) / 2
            if pointe:
                w = w0 / 2 * (1 - t) ** 0.75
            g.append((pts[i][0] + nx * w, pts[i][1] + ny * w))
            dr.append((pts[i][0] - nx * w, pts[i][1] - ny * w))
        d.polygon(P(g + dr[::-1]), fill=255)
        for (x, y), w in ((pts[0], w0), (pts[-1], 0 if pointe else w1)):
            if w > 0:
                d.ellipse(P([(x - w / 2, y - w / 2), (x + w / 2, y + w / 2)]), fill=255)

    def patte(cx, cy):
        """Pied et trois griffes crochues tournées vers l'avant (la gauche)."""
        d.ellipse(P([(cx - 6.5, cy - 4.2), (cx + 6.0, cy + 4.2)]), fill=255)
        for j in range(3):
            x = cx - 5.5 + j * 4.4
            y = cy + 2.0 + j * 0.5
            trait(bezier([(x + 1.0, y), (x - 2.6, y + 0.6), (x - 3.4, y + 4.4)], 6), 2.8, 0.0, pointe=True)

    # corps : poitrail haut, taille fine (environ 60 % du poitrail), croupe ronde
    corps = [(50, 52), (62, 44), (80, 44), (96, 49), (110, 54), (124, 53), (140, 46), (156, 44), (168, 48), (175, 58),
             (173, 70), (164, 78), (148, 79), (132, 76), (118, 73), (104, 74), (90, 77), (76, 82), (62, 82), (52, 76),
             (46, 64)]
    d.polygon(P(_chaikin(corps, 3)), fill=255)
    d.ellipse(P([(48, 44), (84, 84)]), fill=255)                                            # épaule
    d.ellipse(P([(140, 45), (177, 80)]), fill=255)                                          # cuisse
    # pattes : antérieure dextre levée vers l'avant, les autres en marche
    trait(bezier([(58, 72), (46, 86), (32, 85)]), 12, 8)
    patte(27, 85)
    trait(bezier([(74, 78), (72, 94), (70, 105)]), 12, 8)
    patte(66, 108)
    trait(bezier([(140, 68), (130, 90), (126, 105)]), 15, 8)
    patte(122, 108)
    trait(bezier([(162, 66), (175, 88), (166, 105)]), 16, 8)
    patte(162, 108)
    # queue en S dressée au-dessus du dos, touffe à trois lobes ramenée vers le dos (vers la gauche)
    trait(bezier([(172, 54), (198, 44), (166, 26), (182, 10)], 26), 6.0, 3.6)
    for base, ctrl, bout, w in (((182, 10), (176, 2), (166, 4), 7.0), ((182, 10), (170, 10), (164, 16), 6.5),
                                ((182, 10), (180, 18), (172, 22), 6.0)):
        trait(bezier([base, ctrl, bout], 10), w, 0.0, pointe=True)
    # encolure, puis six mèches de flamme recourbées le long de l'encolure (trois dessus, trois dessous)
    d.polygon(P(_chaikin([(30, 36), (48, 34), (64, 42), (66, 64), (50, 70), (32, 62)], 2)), fill=255)
    for base, c1, c2, bout, w in (((34, 32), (36, 18), (48, 12), (58, 18), 11), ((44, 34), (48, 22), (62, 20), (70, 28), 11),
                                  ((54, 38), (60, 30), (74, 30), (80, 38), 10), ((36, 60), (34, 70), (40, 78), (48, 80), 10),
                                  ((46, 64), (46, 74), (54, 80), (62, 80), 10), ((56, 66), (58, 74), (66, 78), (72, 76), 9)):
        trait(bezier([base, c1, c2, bout], 16), w, 0.0, pointe=True)
    # tête de face (gardant), assez petite, deux oreilles ; un fin trait en creux la détache de la crinière, et un
    # autre sépare chaque mèche (comme la gravure d'un armorial : visible dès 48 px, fondu aux petites tailles)
    for base, c1, c2, bout in (((40, 30), (44, 20), (54, 18), (60, 22)), ((50, 34), (55, 27), (64, 26), (72, 31)),
                               ((42, 64), (42, 72), (48, 77), (54, 78)), ((52, 66), (53, 73), (59, 77), (66, 77))):
        pts = bezier([base, c1, c2, bout], 12)
        d.line(P(pts), fill=0, width=max(1, int(1.4 * k)))
    d.arc(P([(17.0, 29.0), (47.0, 66.0)]), -75, 75, fill=0, width=max(1, int(1.5 * k)))
    d.ellipse(P([(19, 31), (45, 59)]), fill=255)
    d.ellipse(P([(22, 45), (42, 64)]), fill=255)                                            # museau
    for ox in (22, 42):
        d.polygon(P([(ox - 4.5, 35), (ox - 1, 24), (ox + 4.5, 34)]), fill=255)
    return im.resize((largeur, int(round(H / sur))), Image.LANCZOS)


def masque_embleme(nom, taille=512, marge=0.0):
    """Masque (PIL 'L') d'un emblème : le lion est dessiné ici (masque_lion, plus large que haut, centré dans un
    carré) ; les autres sont des icônes Game-icons (règle de remplissage « non nul », sens des sous-chemins)."""
    if nom == "lion":
        lion = masque_lion(taille)
        carre = Image.new("L", (taille, taille), 0)
        carre.paste(lion, (0, (taille - lion.size[1]) // 2))
        return carre
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
                   usure=0.25, inverse=False, cerne=True, larg_bordure=0.07, champ=None, meuble=None):
    """Image héraldique d'un camp (champ + emblème), mise en cache en PNG ; renvoie le chemin.

    taille_embleme : part du plus petit côté occupée par l'emblème (le lion, plus large que haut, prend
    jusqu'à 1,45 fois cette taille en largeur, sans dépasser 86 % de l'image).
    decalage : position de l'emblème (fraction de la largeur/hauteur) par rapport au centre.
    inverse : champ et meuble échangés (tentures omeyyades : tour ivoire sur champ vert).
    cerne : liseré sombre autour de l'emblème (le lion reste net sur le gueules à petite taille).
    bordure : bordure de la couleur du meuble (ou du champ si inverse).
    champ, meuble : couleurs imposées ('#rrggbb'), par exemple l'albédo « tissu » plus clair des étoffes rendues."""
    c = CAMPS[camp]
    nom = nom or "blason-%s-%dx%d-%d%s%s" % (camp, largeur, hauteur, int(taille_embleme * 100), "-b" if bordure else "",
                                             "-i" if inverse else "")
    chemin = os.path.join(CACHE, nom + ".png")
    champ = np.array(rgb8(champ or (c["meuble"] if inverse else c["champ"])), dtype=np.float32)
    meuble = np.array(rgb8(meuble or (c["champ"] if inverse else c["meuble"])), dtype=np.float32)
    sombre = np.array(rgb8(c["contour"]), dtype=np.float32)
    rng = np.random.default_rng(sum(ord(ch) for ch in nom) & 0xffff)
    # champ légèrement nuancé (teinture à la main, toile)
    yy, xx = np.mgrid[0:hauteur, 0:largeur]
    nuance = 1.0 + usure * 0.12 * (np.sin(xx / largeur * 7.0 + rng.uniform(0, 6)) * np.sin(yy / hauteur * 5.0 + rng.uniform(0, 6)))
    nuance += rng.normal(0, 0.02 * usure, (hauteur, largeur))
    img = np.clip(champ[None, None, :] * nuance[..., None], 0, 255)
    t = int(min(largeur, hauteur) * taille_embleme)
    if c["embleme"] == "lion":
        lw = min(int(t * 1.45), int(largeur * 0.86))
        masque = np.array(masque_lion(lw), dtype=np.float32) / 255.0
    else:
        masque = np.array(masque_embleme(c["embleme"], t), dtype=np.float32) / 255.0
    mh, mw = masque.shape
    plein = np.zeros((hauteur, largeur), dtype=np.float32)
    x0 = int((largeur - mw) / 2 + decalage[0] * largeur)
    y0 = int((hauteur - mh) / 2 + decalage[1] * hauteur)
    xa, ya = max(0, x0), max(0, y0)
    xb, yb = min(largeur, x0 + mw), min(hauteur, y0 + mh)
    plein[ya:yb, xa:xb] = masque[ya - y0:yb - y0, xa - x0:xb - x0]
    if cerne:
        r = max(3, int(min(largeur, hauteur) * 0.018)) | 1
        ep = np.array(Image.fromarray((plein * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(r)), dtype=np.float32) / 255
        img = img * (1 - ep[..., None]) + sombre[None, None, :] * ep[..., None]
    img = img * (1 - plein[..., None]) + meuble[None, None, :] * plein[..., None]
    if bordure:
        b = max(3, int(min(largeur, hauteur) * larg_bordure))
        img[:b, :] = meuble; img[-b:, :] = meuble; img[:, :b] = meuble; img[:, -b:] = meuble
    Image.fromarray(img.astype(np.uint8), "RGB").save(chemin)
    return chemin


def planche_blasons(chemin, tailles=(8, 12, 16, 24, 48)):
    """Contrôle : lys, lion et tour côte à côte à leur taille d'affichage (drapeaux de tour, écus, bannières)."""
    camps = list(CAMPS)
    W = 40 + sum(int(t * 1.5) + 16 for t in tailles) * 1
    can = Image.new("RGB", (W, 40 + len(camps) * 70), (128, 128, 128))
    y = 20
    for camp in camps:
        x = 20
        src = Image.open(texture_blason(camp, 384, 256, taille_embleme=0.62)).convert("RGB")
        for t in tailles:
            im = src.resize((int(t * 1.5), t), Image.LANCZOS)
            can.paste(im, (x, y))
            x += int(t * 1.5) + 16
        y += 70
    can = can.resize((can.size[0] * 3, can.size[1] * 3), Image.NEAREST)
    can.save(chemin)
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


def creneaux_cercle(nom, rayon, z, mat, nombre=10, h=0.55, ep=0.35, plein=0.55, manque=0.0, graine=0):
    """Merlons répartis sur un cercle (haut d'une tour ronde) ; manque : part de merlons tombés (état abîmé)."""
    rnd = random.Random(graine)
    bm = bmesh.new()
    larg = 2 * math.pi * rayon / nombre * plein
    for k in range(nombre):
        if manque and rnd.random() < manque:
            continue
        a = 2 * math.pi * k / nombre
        geo = bmesh.ops.create_cube(bm, size=1.0)
        vs = geo["verts"]
        bmesh.ops.scale(bm, vec=(ep, larg, h), verts=vs)
        bmesh.ops.translate(bm, vec=(rayon - ep / 2, 0, z + h / 2), verts=vs)
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, "Z"), verts=vs)
    return objet_maillage(nom, bm, mat)


def _merlon_pointe(bm, lx, ly, hp, hpy):
    """Merlon d'al-Andalus à arêtes vives : prisme lx × ly × hp coiffé d'une pyramide de hpy de haut (la base de la
    pyramide est exactement le haut du prisme : pas de biseau, pas de subdivision, l'ombre de chaque pan est franche)."""
    x, y = lx / 2, ly / 2
    bas = [bm.verts.new(v) for v in ((-x, -y, 0), (x, -y, 0), (x, y, 0), (-x, y, 0))]
    haut = [bm.verts.new(v) for v in ((-x, -y, hp), (x, -y, hp), (x, y, hp), (-x, y, hp))]
    sommet = bm.verts.new((0, 0, hp + hpy))
    bm.faces.new(bas[::-1])
    for k in range(4):
        bm.faces.new((bas[k], bas[(k + 1) % 4], haut[(k + 1) % 4], haut[k]))
        bm.faces.new((haut[k], haut[(k + 1) % 4], sommet))
    return bas + haut + [sommet]


def creneaux_ligne(bm, a, b, z, h=0.55, ep=0.35, pas=0.9, plein=0.55, forme="carre", manque=0.0, rnd=None):
    """Ajoute à bm des merlons le long du segment a -> b (x, y) à la hauteur z.

    forme "carre" : merlons droits ; "pointe" : merlons d'al-Andalus, prisme de 0,62 × 0,5 × 0,5 m coiffé d'une pyramide
    de 0,42 m (hauteur ≥ 0,6 × la largeur), arêtes vives ; créneaux plus larges que les merlons (pas de 1,3 m).
    manque : part des merlons tombés (état abîmé), tirée avec rnd."""
    a, b = Vector((a[0], a[1], 0)), Vector((b[0], b[1], 0))
    L = (b - a).length
    nb = max(1, int(L / pas))
    d = (b - a).normalized()
    ang = math.atan2(d.y, d.x)
    larg = L / nb * plein
    rnd = rnd or random.Random(int(L * 100))
    for k in range(nb):
        if manque and rnd.random() < manque:
            continue
        c = a + d * (L * (k + 0.5) / nb)
        if forme == "pointe":
            lx = min(0.62, larg * 1.1)
            vs = _merlon_pointe(bm, lx, 0.5, 0.5, max(0.42, 0.68 * lx))
        else:
            geo = bmesh.ops.create_cube(bm, size=1.0)
            vs = geo["verts"]
            bmesh.ops.scale(bm, vec=(larg, ep, h), verts=vs)
            bmesh.ops.translate(bm, vec=(0, 0, h / 2), verts=vs)
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, "Z"), verts=vs)
        bmesh.ops.translate(bm, vec=(c.x, c.y, z), verts=vs)


def drapeau(nom, camp, hauteur_mat, longueur=1.6, hauteur=1.0, loc=(0, 0, 0), vent=1.0, phase=0.0, mat_mat=None,
            echelle_embleme=0.62, epaisseur_mat=0.05, cap=-28.0, epi=False, inverse=False, dechire=0.0, boucle=False,
            ampleur=1.0):
    """Mât + drapeau aux couleurs du camp, qui flotte vers l'est-sud-est (vers la droite de l'écran).

    Le drapeau est presque dans le plan vertical X-Z, légèrement tourné vers la caméra (cap en degrés) ; étoffe un peu
    translucide : vu à contre-jour, il s'allume comme un vrai. Omeyyades : bordure verte. epi : boule dorée en tête de mât.
    dechire : part de la longueur arrachée au bout du drapeau, en dents irrégulières (bannière d'une place en ruine).
    Bannière animée (bande d'images) : boucle = les deux ondes ont des fréquences entières (phase de 0 à 2π : la bande
    boucle sans saut) ; ampleur multiplie l'ondulation de l'étoffe (1 : celle des bannières cuites)."""
    objets = []
    mat_mat = mat_mat or mat_simple("bois_mat", "#4a3524", rugosite=0.8)
    objets.append(cylindre(nom + "_mat", epaisseur_mat, hauteur_mat + 0.25, loc=loc, mat=mat_mat, segments=8))
    if epi:
        objets.append(sphere(nom + "_epi", epaisseur_mat * 2.6, (loc[0], loc[1], loc[2] + hauteur_mat + 0.3),
                             mat_metal("or_epi", "#c9a24a", rugosite=0.35), subdiv=2))
    omey = camp == "omeyyades"
    if inverse:
        tex = texture_blason(camp, 384, 256, taille_embleme=echelle_embleme, inverse=True,
                             champ=CAMPS[camp].get("vert_tissu"), nom="drapeau-%s-%d-i" % (camp, int(echelle_embleme * 100)))
    else:
        tex = texture_blason(camp, 384, 256, taille_embleme=echelle_embleme, bordure=omey, champ=CAMPS[camp]["tissu"],
                             nom="drapeau-%s-%d%s" % (camp, int(echelle_embleme * 100), "-b" if omey else ""))
    if omey and not inverse:
        # bordure verte : on recolore la bordure (couleur du champ par défaut) en vert
        im = np.array(Image.open(tex).convert("RGB"), dtype=np.float32)
        b = max(3, int(256 * 0.11))
        vert = np.array(rgb8(CAMPS[camp]["meuble"]), dtype=np.float32)
        im[:b, :] = vert; im[-b:, :] = vert; im[:, :b] = vert; im[:, -b:] = vert
        Image.fromarray(im.astype(np.uint8)).save(tex)
    bm = bmesh.new()
    nx, nz = 16, 8
    uv = bm.loops.layers.uv.new("UVMap")
    grille = []
    rnd_d = random.Random(int(longueur * 1000 + hauteur * 100))
    coupes = [dechire * rnd_d.uniform(0.15, 1.0) if dechire else 0.0 for _ in range(nz + 1)]
    for j in range(nz + 1):
        ligne = []
        for i in range(nx + 1):
            u, v = i / nx, j / nz
            x = min(u, 1.0 - coupes[j]) * longueur
            ond = (math.sin(u * 5.0 + phase) * 0.12 * vent * u
                   + math.sin(u * 9.0 + phase * (2.0 if boucle else 1.7)) * 0.04 * vent * u) * ampleur
            z = hauteur_mat - hauteur + v * hauteur - u * u * 0.12 * vent
            ligne.append(bm.verts.new((x, ond, z)))
        grille.append(ligne)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((grille[j][i], grille[j][i + 1], grille[j + 1][i + 1], grille[j + 1][i]))
            f.smooth = True
            for lp, (di, dj) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                lp[uv].uv = ((i + di) / nx, (j + dj) / nz)
    m = mat_tissu(nom + "_tissu", CAMPS[camp]["champ"], image_png=tex, translucide=0.35)
    ob = objet_maillage(nom + "_drapeau", bm, m)
    ob.location = (loc[0] + epaisseur_mat, loc[1], loc[2])
    ob.rotation_euler.z = math.radians(cap)
    s = ob.modifiers.new("epaisseur", "SOLIDIFY")
    s.thickness = 0.02
    objets.append(ob)
    return objets


def tenture(nom, camp, largeur, hauteur, loc=(0, 0, 0), rot_z=0.0, pointe=0.18, plis=0.05, mat_tringle=None,
            echelle_embleme=None, graine=0):
    """Tenture verticale aux armes du camp, accrochée par une tringle à un parapet, face à -Y (vers la caméra avant
    rotation). loc = milieu de la tringle ; la toile pend de largeur × hauteur (m), le bas taillé en pointe.

    Omeyyades : champ vert à la tour ivoire (couleurs inversées), car l'ivoire disparaît sur l'ocre des murs."""
    c = CAMPS[camp]
    inv = bool(c.get("inverse"))
    if echelle_embleme is None:
        echelle_embleme = 0.56 if inv else 0.72
    tex = texture_blason(camp, 256, 448, taille_embleme=echelle_embleme, bordure=True, inverse=inv,
                         decalage=(0.0, -0.08), larg_bordure=0.06, champ=c.get("vert_tissu") if inv else c["tissu"],
                         nom="tenture-%s-%d%s" % (camp, int(echelle_embleme * 100), "-i" if inv else ""))
    rnd = random.Random(graine)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    nx, nz = 8, 14
    ph = rnd.uniform(0, 6)
    grille = []
    for j in range(nz + 1):
        ligne = []
        for i in range(nx + 1):
            u, v = i / nx, j / nz             # v = 0 en haut
            x = (u - 0.5) * largeur
            z = -v * hauteur
            if j == nz:
                z -= pointe * hauteur * (1 - abs(2 * u - 1))
            y = -0.06 - plis * math.sin(u * math.pi * 3 + ph) * (0.4 + 0.6 * v)
            ligne.append(bm.verts.new((x, y, z)))
        grille.append(ligne)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((grille[j + 1][i], grille[j + 1][i + 1], grille[j][i + 1], grille[j][i]))
            f.smooth = True
            for lp, (di, dj) in zip(f.loops, ((0, 1), (1, 1), (1, 0), (0, 0))):
                lp[uv].uv = ((i + di) / nx, 1 - (j + dj) / nz)
    m = mat_tissu(nom + "_toile", c["champ"], image_png=tex, brillance=0.2)
    ob = objet_maillage(nom + "_toile", bm, m)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.03
    tr = cylindre(nom + "_tringle", 0.05, largeur + 0.3, (0, 0, 0), mat_tringle or mat_simple("tringle", "#3b2a1c"), segments=8)
    tr.rotation_euler = (0, math.pi / 2, 0)
    tr.location = (-(largeur + 0.3) / 2, -0.08, 0.02)
    p = lier(bpy.data.objects.new(nom + "_tenture", None))
    ob.parent = p
    tr.parent = p
    p.location = loc
    p.rotation_euler = (0, 0, rot_z)
    return [ob, tr, p]


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


def _rampe_bords(H, W, marge, rampe, cotes=(1, 1, 1, 1)):
    """Masque 0..1 nul sur les « marge » pixels du bord, qui remonte à 1 sur « rampe » pixels (haut, bas, gauche, droite)."""
    m = np.ones((H, W), dtype=np.float32)
    x = np.arange(W, dtype=np.float32)
    y = np.arange(H, dtype=np.float32)
    h, b, g, d = cotes
    if g:
        m *= np.clip((x - marge) / rampe, 0, 1)[None, :]
    if d:
        m *= np.clip((W - 1 - x - marge) / rampe, 0, 1)[None, :]
    if h:
        m *= np.clip((y - marge) / rampe, 0, 1)[:, None]
    if b:
        m *= np.clip((H - 1 - y - marge) / rampe, 0, 1)[:, None]
    return m


class RefusRendu(RuntimeError):
    """Image refusée par un contrôle automatique (bord touché, couleur du camp trop rare, bleu chez les Anglais)."""


def _refuser(img, nom, message):
    """Refuse l'image (exception). Avec RENDU_ESSAI=1 dans l'environnement, se contente d'un avertissement (mise au point)."""
    os.makedirs(REFUS, exist_ok=True)
    chemin = os.path.join(REFUS, nom + ".png")
    img.save(chemin)
    if os.environ.get("RENDU_ESSAI"):
        journal("REFUS (essai, image gardée) %s : %s" % (nom, message))
        return
    raise RefusRendu("%s refusé : %s (image gardée dans %s)" % (nom, message, os.path.relpath(chemin, RACINE)))


def controle_bords(img, nom, marge=2, seuil=8):
    """Refuse une image dont la bordure de « marge » pixels a un alpha supérieur à seuil (ombre comprise) :
    un sprite ne doit jamais être coupé ni déborder sur l'image voisine d'une bande."""
    a = np.array(img)[..., 3]
    cotes = {"haut": a[:marge, :], "bas": a[-marge:, :], "gauche": a[:, :marge], "droite": a[:, -marge:]}
    fautes = {k: int(v.max()) for k, v in cotes.items() if v.max() > seuil}
    if fautes:
        _refuser(img, nom, "bord touché " + ", ".join("%s (alpha %d)" % kv for kv in fautes.items()))


def _hsv(img):
    a = np.array(img.convert("RGBA"), dtype=np.float32) / 255.0
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx = np.max(a[..., :3], axis=-1)
    mn = np.min(a[..., :3], axis=-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60.0
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return h, s, mx, al


def part_teinte(img, fenetre, s_min, v_min, alpha_min=0.5):
    """Part des pixels opaques dont la teinte (degrés) tombe dans la fenêtre, avec saturation et valeur minimales."""
    h, s, v, al = _hsv(img)
    opaque = al >= alpha_min
    h0, h1 = fenetre
    dans = (h >= h0) & (h <= h1) if h0 <= h1 else (h >= h0) | (h <= h1)
    ok = opaque & dans & (s >= s_min) & (v >= v_min)
    return float(ok.sum()) / max(1, int(opaque.sum()))


def part_couleur_camp(img, camp):
    fenetre, s_min, v_min = TEINTES_CAMP[camp]
    return part_teinte(img, fenetre, s_min, v_min)


def controle_camp(img, nom, camp, seuil):
    """Refuse un bâtiment dont la couleur du camp couvre moins que seuil (part des pixels opaques)."""
    p = part_couleur_camp(img, camp)
    journal("%s : couleur du camp %s sur %.1f %% des pixels opaques (seuil %.0f %%)" % (nom, camp, p * 100, seuil * 100))
    if p < seuil:
        _refuser(img, nom, "couleur du camp %.1f %% < %.0f %%" % (p * 100, seuil * 100))
    return p


def part_blancs(img, seuil=235, alpha_min=128):
    """Part des pixels opaques dont les trois canaux dépassent seuil (blanc brûlé : plâtre, plastique, neige)."""
    a = np.array(img.convert("RGBA"))
    opaque = a[..., 3] >= alpha_min
    blanc = opaque & (a[..., :3].min(axis=-1) > seuil)
    return float(blanc.sum()) / max(1, int(opaque.sum()))


def controle_blancs(img, nom, tolerance=0.003):
    """Refuse un sprite dont plus de 0,3 % des pixels opaques ont leurs trois canaux au-dessus de 235."""
    p = part_blancs(img)
    if p > tolerance:
        _refuser(img, nom, "blancs brûlés sur %.2f %% des pixels opaques (> %.1f %%)" % (p * 100, tolerance * 100))
    return p


def part_couleur_troupe(img, camp):
    """Couleur du camp pour une troupe : bleu ou rouge du camp ; Omeyyades : ivoire (saturation < 0,3, valeur > 0,6,
    teinte 20-70°) ou vert (teinte 118-185°). Mesurée sur l'image réduite à la taille logique (ce que voit l'élève)."""
    w, h = img.size
    petit = img.convert("RGBa").resize((max(1, w // ECHELLE), max(1, h // ECHELLE)), Image.LANCZOS).convert("RGBA")
    if camp != "omeyyades":
        return part_couleur_camp(petit, camp)
    hh, s, v, al = _hsv(petit)
    opaque = al >= 0.5
    ivoire = (s < 0.3) & (v > 0.6) & (hh >= 20) & (hh <= 70)
    vert = (hh >= 118) & (hh <= 185) & (s >= 0.18) & (v >= 0.10)
    return float((opaque & (ivoire | vert)).sum()) / max(1, int(opaque.sum()))


def controle_troupe(img, nom, camp, seuil):
    """Refuse une image de troupe dont la couleur du camp couvre moins que seuil (à la taille logique)."""
    p = part_couleur_troupe(img, camp)
    journal("%s : couleur du camp %s sur %.1f %% (taille logique, seuil %.0f %%)" % (nom, camp, p * 100, seuil * 100))
    if p < seuil:
        _refuser(img, nom, "couleur du camp %.1f %% < %.0f %%" % (p * 100, seuil * 100))
    return p


def controle_sans_bleu(img, nom, tolerance=0.002):
    """Camp anglais : aucun bleu (teinte 200-240°, saturation > 0,15) pour ne pas évoquer la France.
    Les pixels presque noirs (valeur < 0,15, liseré et accentuation) n'ont pas de couleur perçue : ils ne comptent pas.
    Tolérance : 0,2 % des pixels opaques (deux ou trois pixels sombres d'anticrénelage par image de troupe)."""
    p = part_teinte(img, (200, 240), 0.15, 0.15, alpha_min=0.8)
    journal("%s : bleu %.3f %% des pixels opaques" % (nom, p * 100))
    if p > tolerance:
        _refuser(img, nom, "bleu sur %.2f %% des pixels" % (p * 100))
    return p


def eteindre_bleus(img, nom):
    """Camp anglais (bandes de geste et de tir) : l'acier tourné vers le ciel y renvoie le bleu du ciel. Les pixels
    bleus (teinte 195-245°, saturation > 0,12) sont ramenés au gris chaud de la maille (valeur gardée) : pas de bleu chez
    les Anglais, sans toucher au reste de l'image. Le nombre de pixels changés est noté au journal."""
    a = np.array(img.convert("RGBA"), dtype=np.float32)
    h, sat, v, al = _hsv(img)
    m = (h >= 195) & (h <= 245) & (sat > 0.12) & (al > 0.02)
    n = int(m.sum())
    if n:
        vv = v[m] * 255.0
        a[..., :3][m] = np.stack([vv, vv * 0.97, vv * 0.94], axis=-1)
        journal("%s : %d pixels bleutés (reflet du ciel sur l'acier) ramenés au gris chaud" % (nom, n))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


def rendre_sprite(nom, largeur_px, hauteur_px, objets, ombre=True, contour=0.55, epaisseur_contour=1, surech=2,
                  echantillons=64, echantillons_ombre=24, force_ombre=OMBRE_FORCE, couleur_ombre=OMBRE_COULEUR, net=0.6,
                  ombre_separee=False, marge_ombre=(0.6, 0.4), flou_contact=0.04, force_contact=0.6, pres=0.12,
                  controle=True, ombre_partagee=None):
    """Rend un sprite à fond transparent, puis le réduit d'un facteur surech. Renvoie (sprite, ombre_portée ou None).

    largeur_px, hauteur_px : taille finale (2 × la taille logique). La caméra (camera_trois_quarts, à la taille
    suréchantillonnée) et le sol-capteur doivent déjà être dans la scène.
    objets : objets du sujet (cachés à la caméra pendant la passe d'ombre).
    ombre_separee (tours, places fortes) : l'ombre portée entière est rendue sur une toile agrandie (+60 % à droite,
    +40 % en bas, même point d'ancrage) et rendue à part (le jeu la dessine dans une passe « sol » sous tous les
    sprites) ; le sprite ne garde que l'occlusion de contact (flou de 4 %).
    Sinon (troupes) : ombre douce dans le sprite, limitée au voisinage du sujet et effacée avant les bords.
    contour : opacité d'un liseré sombre d'épaisseur_contour pixels rendus, pour la lisibilité sur l'herbe.
    controle : refuse l'image si sa bordure de 2 px n'est pas transparente.
    ombre_partagee (bandes de tours) : dictionnaire ; vide, il reçoit le calque d'ombre de contact de cette image ;
    rempli, ce calque est repris tel quel et la passe d'ombre n'est pas refaite (le pied de l'ouvrage ne bouge pas d'une
    image à l'autre : seul l'occupant change)."""
    s = bpy.context.scene
    W, H = largeur_px * surech, hauteur_px * surech
    reglages_rendu(W, H, echantillons=echantillons, transparent=True)
    cam = s.camera
    cadre = list(cam["cadre"])
    tmp = os.path.join(CACHE, "_rendu")
    os.makedirs(tmp, exist_ok=True)
    capteurs = [o for o in s.objects if o.is_shadow_catcher]
    for c in capteurs:
        c.visible_camera = False
    sujet = rendre(os.path.join(tmp, nom + "-sujet.png"))
    alpha_sujet = np.array(sujet)[..., 3]
    calque = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ombre_portee = None
    reprise = ombre_partagee is not None and "calque" in ombre_partagee
    if ombre and capteurs and not reprise:
        for c in capteurs:
            c.visible_camera = True
        caches = []
        for o in objets:
            if o.visible_camera:
                o.visible_camera = False
                caches.append(o)
        s.cycles.samples = echantillons_ombre
        if ombre_separee:
            # taille logique entière (round(1,6 w), round(1,4 h)) : le fichier fait exactement 2 × cette taille
            wl, hl = largeur_px // ECHELLE, hauteur_px // ECHELLE
            W2 = int(round(wl * (1 + marge_ombre[0]))) * ECHELLE * surech
            H2 = int(round(hl * (1 + marge_ombre[1]))) * ECHELLE * surech
            cadrer(cam, W2, H2, cadre[2], cadre[3], cadre[4])
        om = rendre(os.path.join(tmp, nom + "-ombre.png"))
        if ombre_separee:
            cadrer(cam, *cadre)
        for o in caches:
            o.visible_camera = True
        for c in capteurs:
            c.visible_camera = False
        s.cycles.samples = echantillons
        a = np.array(om, dtype=np.float32)[..., 3] / 255.0
        if ombre_separee:
            H2, W2 = a.shape
            # ombre portée entière (passe « sol ») : seulement effacée contre les bords de sa toile
            a2 = np.clip(a * force_ombre * _rampe_bords(H2, W2, 2 * surech, 10 * surech), 0, 1)
            oi = np.zeros((H2, W2, 4), dtype=np.uint8)
            oi[..., 0], oi[..., 1], oi[..., 2] = couleur_ombre
            oi[..., 3] = (a2 * 255).astype(np.uint8)
            ombre_portee = _reduire(Image.fromarray(oi, "RGBA").filter(ImageFilter.GaussianBlur(surech * 0.8)), surech)
            a = a[:H, :W]
            rayon = flou_contact
            force = force_contact
        else:
            rayon = pres
            force = force_ombre
        proche = np.array(Image.fromarray(alpha_sujet.astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(min(W, H) * rayon)), dtype=np.float32) / 255.0
        m = np.clip(proche * 6.0, 0, 1) * _rampe_bords(H, W, 3 * surech, 8 * surech)
        a = np.clip(a * m * force, 0, 1)
        ombre_img = np.zeros((H, W, 4), dtype=np.uint8)
        ombre_img[..., 0], ombre_img[..., 1], ombre_img[..., 2] = couleur_ombre
        ombre_img[..., 3] = (a * 255).astype(np.uint8)
        calque = Image.fromarray(ombre_img, "RGBA").filter(ImageFilter.GaussianBlur(surech * 0.8))
    sujet_r = _reduire(sujet, surech)
    if net:
        rgb = sujet_r.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=int(net * 100), threshold=1))
        sujet_r = Image.merge("RGBA", (*rgb.split(), sujet_r.split()[3]))
    if reprise:
        final = ombre_partagee["calque"].copy()
    else:
        final = _reduire(calque, surech)
        if ombre_partagee is not None:
            ombre_partagee["calque"] = final.copy()
    if contour:
        a = sujet_r.split()[3]
        ep = a.filter(ImageFilter.MaxFilter(2 * epaisseur_contour + 1))
        trait = Image.new("RGBA", sujet_r.size, (22, 16, 10, 0))
        trait.putalpha(ep.point(lambda v: int(v * contour)))
        final.alpha_composite(trait)
    final.alpha_composite(sujet_r)
    if controle:
        controle_bords(final, nom)
        controle_blancs(final, nom)
    return final, ombre_portee


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


def sauver_jpg(img, chemin, qualite=80, max_ko=440, plancher=72, masque_debruit=None):
    """JPEG le plus fidèle possible sous max_ko kilo-octets DÉCIMAUX (440 Ko = 440 000 octets, sous la limite du contrat
    de 450 000 octets ; mêmes unités que le budget de 9 Mo) : recherche par dichotomie de la plus haute qualité entre
    plancher (72, pas de blocs visibles sur la canopée) et qualite ; si même le plancher dépasse, un léger débruitage
    limité au masque_debruit (la forêt, tableau 0..1) allège le fichier sans toucher la plaine, puis on recommence."""
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    limite = max_ko * 1000
    rgb = img.convert("RGB")
    essais = [rgb]
    if masque_debruit is not None:
        doux = rgb.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
        m = Image.fromarray((np.clip(masque_debruit, 0, 1) * 255).astype(np.uint8), "L").resize(rgb.size)
        essais.append(Image.composite(doux, rgb, m))

    def taille(im, q):
        im.save(chemin, quality=q, optimize=True, progressive=True, subsampling="4:2:0")
        return os.path.getsize(chemin)

    choix = None
    for k, im in enumerate(essais):
        if taille(im, qualite) <= limite:
            choix = (k, im, qualite)
            break
        if taille(im, plancher) > limite:
            continue
        bas, haut = plancher, qualite          # bas : tient sous la limite ; haut : dépasse
        while haut - bas > 1:
            q = (bas + haut) // 2
            if taille(im, q) <= limite:
                bas = q
            else:
                haut = q
        choix = (k, im, bas)
        break
    if choix is None:
        choix = (len(essais) - 1, essais[-1], plancher)
    k, im, q = choix
    octets = taille(im, q)
    if octets > limite:
        journal("ATTENTION : %s fait %d octets (> %d) à la qualité plancher %d" % (os.path.basename(chemin), octets, limite, q))
    journal("écrit %s (%d octets, qualité %d%s)" % (os.path.relpath(chemin, RACINE), octets, q, ", forêt débruitée" if k else ""))
    return chemin


# ---------------------------------------------------------------- manifeste jeu/assets/images/td/sprites.js
ENTETE_MANIFESTE = (
    "// Images pré-calculées du champ de bataille et de la campagne (rendu 3D Blender, Cycles).\n"
    "// Fichier généré par atelier/outils/rendu-3d/ : ne pas modifier à la main (chaque script réécrit ses entrées).\n"
    "// w, h : taille logique d'une image (px du canevas 1000 × 660) ; ax, ay : point d'ancrage dans l'image,\n"
    "// en px logiques depuis le coin haut-gauche ; frames : nombre d'images côte à côte (bande horizontale).\n"
    "// Les entrées « ombre-... » sont les ombres portées des tours et des places fortes : même point d'ancrage que\n"
    "// le sprite, à dessiner dans une passe « sol », sous tous les sprites (après le terrain).\n"
    "// face : sens d'une bande de troupe (\"gauche\" pour les camps rivaux, rendus tournés vers la gauche ; absent : vers la\n"
    "// droite). Le jeu ne retourne une bande que si la troupe marche dans l'autre sens.\n"
    "// fumees (places fortes) : [[x, y], ...] en px logiques depuis le coin haut-gauche de l'image, foyers d'où le jeu\n"
    "// fait monter la fumée animée d'une place abîmée ou en ruine (aucune fumée n'est cuite dans les images ; vide si intacte).\n"
    "// unite-<type>-<camp>-chute et -coup : bandes de geste (4 images), mêmes w, h, ax, ay et face que la marche ; chute :\n"
    "// genoux qui plient, buste renversé, au sol, couché (arme à côté) ; coup : armer, frapper, suivi, revenir (cavaliers :\n"
    "// lance couchée, poussée, cheval qui se cabre un peu, retour). Repli : la marche si la bande manque.\n"
    "// tour-* : bande de tir, image 0 = repos (seule image lue par un code qui ne connaît pas les bandes) ; trébuchet 4\n"
    "// images (armé, mi-course, verge verticale, lâché), baliste, archers et piquiers 3 ; tir : [x, y] en px logiques\n"
    "// depuis le coin haut-gauche, point de départ du trait (pierre au lâcher, pointe du carreau, arc, fers des piques).\n"
    "// lieu-* : hampe : [x, y], pied du mât de la bannière ; lieu-*-nu : le même bourg sans sa bannière, à compléter par\n"
    "// drapeau-<camp> (6 images d'une étoffe qui flotte, ancrage au pied du mât) posé sur la hampe.\n"
    "// effet-cratere : 2 images (0 : herbe, 1 : route) ; effet-effondrement : 8 images (nuage et pierres d'une place qui tombe).\n"
)


def lire_manifeste():
    if not os.path.exists(MANIFESTE):
        return {}
    with open(MANIFESTE, encoding="utf-8") as f:
        txt = f.read()
    m = re.search(r"JEU\.SPRITES\s*=\s*(\{.*\})\s*;", txt, re.S)
    return json.loads(m.group(1)) if m else {}


def maj_manifeste(entrees, retirer=()):
    """Fusionne des entrées {nom: {src, w, h, ax, ay, frames}} dans le manifeste et le réécrit (ordre alphabétique)."""
    tout = lire_manifeste()
    tout.update(entrees)
    for k in retirer:
        tout.pop(k, None)
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


def sauver_sprite(nom, img, ombre_img, w, h, ax, ay, frames=1):
    """Écrit le sprite (et son ombre portée s'il y en a une) dans jeu/assets/images/td/ et met le manifeste à jour."""
    chemin, src = chemin_td(nom + ".png")
    sauver_png(img, chemin)
    entrees = {nom: entree(src, w, h, ax, ay, frames)}
    if ombre_img is not None:
        cho, srco = chemin_td("ombre-" + nom + ".png")
        sauver_png(ombre_img, cho)
        entrees["ombre-" + nom] = entree(srco, ombre_img.size[0] // ECHELLE, ombre_img.size[1] // ECHELLE, ax, ay, 1)
    maj_manifeste(entrees)
    return chemin


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
