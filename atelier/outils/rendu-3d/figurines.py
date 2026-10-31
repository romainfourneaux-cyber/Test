# -*- coding: utf-8 -*-
"""Figurines : fantassins, cavaliers et chevaux modélisés par programme (squelette + modificateur Skin).

Chaque figurine est construite pour une phase de marche donnée (0 à 2π) : jambes, bras et léger
balancement du corps sont calculés ici, puis le corps est « habillé » (maille, surcot, casque, écu, arme).
Repère local : la figurine regarde vers +X (droite de l'écran), sa gauche est +Y, le haut +Z ; unité le mètre.

Règles tenues ici : aucune croix sur les surcots, écus et caparaçons (un seul grand emblème par pan) ; pas de
bleu chez les Anglais (maille gris chaud peu métallique, heaume d'acier gris chaud à fente de visée, gris clair pour les hommes d'armes) ; Omeyyades :
l'ivoire domine (surcot ivoire jusqu'au genou, manches ivoire, galon et ceinture verts, bouclier rond vert à bordure
ivoire et tour ivoire), casque conique d'acier sans rien dessus, sans turban ni aucun signe religieux.
Silhouettes distinctes : piétaille (lance à fanion), hommes d'armes (lourds, arme levée), champion (plus grand,
armure propre à chaque camp, arme tenue haut).
"""
import math

import bmesh
import bpy
from mathutils import Vector, Matrix

import commun as C

V = Vector


# ---------------------------------------------------------------- matières partagées (créées une fois par scène)
def matieres(camp):
    """Jeu de matières d'une figurine du camp (mis en cache dans la scène)."""
    cle = "mats_" + camp
    if cle in _cache_mats:
        return _cache_mats[cle]
    c = C.CAMPS[camp]
    sud = camp == "omeyyades"
    anglais = camp == "angleterre"
    m = {
        # maille gris chaud, peu métallique : ne renvoie plus le bleu du ciel
        "maille": C.mat_metal("maille_" + camp, "#968b7b", rugosite=0.6, maille=True, metal=0.55),
        # acier : sombre chez les Omeyyades ; un peu doré et moins miroir chez les Anglais (aucun reflet bleu)
        "acier": C.mat_metal("acier_" + camp, "#7d7f82" if sud else ("#b9a88e" if anglais else "#b4aea4"),
                             rugosite=0.35 if sud else (0.5 if anglais else 0.45), metal=0.75 if anglais else 1.0),
        "fer": C.mat_metal("fer_" + camp, "#4a4744", rugosite=0.5),
        "lame": C.mat_metal("lame_" + camp, "#c4b49a" if anglais else "#c9c4ba", rugosite=0.4 if anglais else 0.3,
                            metal=0.75 if anglais else 1.0),
        "or": C.mat_metal("or_" + camp, "#c9a24a", rugosite=0.4),
        "peau": C.mat_simple("peau_" + camp, "#b88a64" if sud else "#c8986f", rugosite=0.55),
        "cuir": C.mat_simple("cuir_" + camp, "#5a3a22", rugosite=0.7, bosse=0.2),
        "bois": C.mat_ph("bois_" + camp, "rough_wood", echelle_m=0.6, rugosite=0.8, bosse=0.2),
        # chausses : laine brune (Omeyyades) ou gris-brun (France, Angleterre), assez claires pour se lire sur l'herbe
        "chausses": C.mat_tissu("chausses_" + camp, "#6a4e34" if sud else "#6f6352"),
        "champ": C.mat_tissu("champ_" + camp, c["tissu"]),
        "meuble": C.mat_tissu("meuble_" + camp, c["meuble"]),
        "vert": C.mat_tissu("vert_" + camp, "#357659"),
        "ivoire": C.mat_tissu("ivoire_" + camp, "#ece4cf"),
        "rouge": C.mat_tissu("rouge_" + camp, "#b3262a"),
        # heaume : acier gris chaud, plus clair que la maille (pas de reflet bleu)
        "heaume": C.mat_metal("heaume_" + camp, "#958d82", rugosite=0.48, metal=0.8),
        # heaume des hommes d'armes anglais : acier gris clair (la maille reste sombre)
        "heaume_clair": C.mat_metal("heaume_clair_" + camp, "#ada594", rugosite=0.5, metal=0.6),
        "noir": C.mat_simple("noir_" + camp, "#14110e", rugosite=0.9),
        # Omeyyades : maille plus sombre des hommes d'armes, écailles d'acier sombre du champion
        "maille_sombre": C.mat_metal("maille_sombre_" + camp, "#5f5850", rugosite=0.6, maille=True, metal=0.55),
        "ecailles": mat_ecailles("ecailles_" + camp),
        # troupes : hampe de frêne clair (se lit sur l'herbe et sur la route), gambison de lin piqué ivoire (piétaille
        # anglaise), acier bruni sombre de la maille des hommes d'armes anglais (L* d'environ 35 au rendu)
        "frene": C.mat_simple("frene_" + camp, "#e2cfa8", rugosite=0.65, bosse=0.1, echelle_bosse=60),
        # lance couchée des cavaliers : frêne patiné, plus sobre (elle traverse tout le sprite)
        "frene_patine": C.mat_simple("frene_patine_" + camp, "#a88d64", rugosite=0.7, bosse=0.1, echelle_bosse=60),
        "gambison": mat_gambison("gambison_" + camp),
        "acier_sombre": C.mat_metal("acier_sombre_" + camp, "#67625b", rugosite=0.5, metal=0.5),
    }
    _cache_mats[cle] = m
    return m


_cache_mats = {}
C.CACHES.append(_cache_mats)


def mat_gambison(nom, teinte="#cdbf9f", couture="#94856a"):
    """Gambison de lin piqué : ivoire chaud, piqûres verticales un peu plus sombres (ondes le long de Z, coordonnées
    d'objet) et léger relief des boudins de rembourrage."""
    m, nt, p = C.nouveau_materiau(nom)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    onde = nt.nodes.new("ShaderNodeTexWave")
    onde.wave_type = "BANDS"
    onde.bands_direction = "X"
    onde.inputs["Scale"].default_value = 9.0
    onde.inputs["Distortion"].default_value = 0.0
    nt.links.new(tc.outputs["Object"], onde.inputs["Vector"])
    mr = C._plage(nt, onde.outputs["Fac"], 0.0, 0.25, 1.0, 0.0)
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    fac = nt.nodes.new("ShaderNodeMath")
    fac.operation = "MULTIPLY"
    fac.inputs[1].default_value = 0.55
    nt.links.new(mr, fac.inputs[0])
    nt.links.new(fac.outputs[0], C._entree(mx, "Factor", "VALUE"))
    C._entree(mx, "A", "RGBA").default_value = C.couleur(teinte)
    C._entree(mx, "B", "RGBA").default_value = C.couleur(couture)
    nt.links.new(C._sortie(mx, "RGBA"), p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.92
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.35
    b.inputs["Distance"].default_value = 0.01
    nt.links.new(onde.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


def mat_ecailles(nom):
    """Broigne d'écailles d'acier sombre (champion omeyyade) : rangées d'écailles décalées (texture de briques fine),
    joints presque noirs, métal peu brillant."""
    m, nt, p = C.nouveau_materiau(nom)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.offset = 0.5
    br.offset_frequency = 2
    nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Brick Width"].default_value = 0.05
    br.inputs["Row Height"].default_value = 0.035
    br.inputs["Mortar Size"].default_value = 0.006
    br.inputs["Color1"].default_value = C.couleur("#4a4d50")
    br.inputs["Color2"].default_value = C.couleur("#3b3e42")
    br.inputs["Mortar"].default_value = C.couleur("#121314")
    nt.links.new(br.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Metallic"].default_value = 0.75
    p.inputs["Roughness"].default_value = 0.45
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.6
    b.inputs["Distance"].default_value = 0.004
    nt.links.new(br.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


# ---------------------------------------------------------------- outils de maillage
def _membre_skin(nom, points, aretes, rayons, mat, racine=0, niveaux=2):
    """Maillage organique : un squelette de points reliés, épaissi par le modificateur Skin puis lissé."""
    me = bpy.data.meshes.new(nom)
    me.from_pydata([tuple(p) for p in points], aretes, [])
    ob = C.lier(bpy.data.objects.new(nom, me))
    sk = ob.modifiers.new("peau", "SKIN")
    sk.use_smooth_shade = True
    sk.branch_smoothing = 0.6
    donnees = me.skin_vertices[0].data
    for i, r in enumerate(rayons):
        donnees[i].radius = (r, r) if not isinstance(r, tuple) else r
    donnees[racine].use_root = True
    sub = ob.modifiers.new("lisse", "SUBSURF")
    sub.levels = niveaux
    sub.render_levels = niveaux
    me.materials.append(mat)
    return ob


def _tube(nom, chemin, rayons, mat, segments=10, ferme=True):
    """Tube lisse le long d'une suite de points (lances, cous, queues) ; rayons : un par point."""
    bm = bmesh.new()
    anneaux = []
    for k, p in enumerate(chemin):
        p = V(p)
        if k < len(chemin) - 1:
            t = (V(chemin[k + 1]) - p).normalized()
        else:
            t = (p - V(chemin[k - 1])).normalized()
        a = t.orthogonal().normalized()
        b = t.cross(a).normalized()
        anneau = []
        for j in range(segments):
            ang = 2 * math.pi * j / segments
            anneau.append(bm.verts.new(p + (a * math.cos(ang) + b * math.sin(ang)) * rayons[k]))
        anneaux.append(anneau)
    for k in range(len(anneaux) - 1):
        for j in range(segments):
            f = bm.faces.new((anneaux[k][j], anneaux[k][(j + 1) % segments], anneaux[k + 1][(j + 1) % segments], anneaux[k + 1][j]))
            f.smooth = True
    if ferme:
        bm.faces.new(list(reversed(anneaux[0])))
        bm.faces.new(anneaux[-1])
    return C.objet_maillage(nom, bm, mat)


def _orienter(ob, origine, direction, haut=V((0, 0, 1))):
    """Place un objet modélisé le long de +X à origine, son axe X suivant direction."""
    d = V(direction).normalized()
    y = haut.cross(d)
    if y.length < 1e-4:
        y = V((0, 1, 0))
    y.normalize()
    z = d.cross(y).normalized()
    m = Matrix((d, y, z)).transposed().to_4x4()
    m.translation = V(origine)
    ob.matrix_world = m
    return ob


# ---------------------------------------------------------------- squelette humain et marche
def pose_homme(phase, assis=False, bras_droit=(15, 55), bras_gauche=(35, 75), amplitude=17, penche=6.5, balancement=4,
               genou=None, jambes_fixes=None):
    """Positions des articulations d'un homme de 1,80 m à la phase de marche donnée.

    Foulée souple : amplitude de 17° à la hanche, genou d'appui fléchi de 12°, genou en balancier jusqu'à 57°,
    buste penché de « penche » degrés vers l'avant (il avance, il ne recule pas).
    bras_* : (angle de l'épaule vers l'avant, flexion du coude) en degrés, avant le balancement de marche.
    genou : (flexion minimale, flexion ajoutée en balancier) en degrés, pour une marche plus naturelle (troupes) : le
    genou n'est jamais tendu (15 à 25° en appui), la jambe arrière plie déjà au décollement du pied (cycle avancé de
    0,6 rad), la jambe qui passe vers l'avant plie jusqu'à environ 55°. None : ancienne foulée (tours, engins).
    bras_* à trois valeurs (épaule, coude, écart) : l'écart (degrés) ouvre le bras sur le côté (bras jetés d'un homme
    qui tombe). jambes_fixes : {côté: (cuisse, genou)} en degrés, jambes figées (chute, garde) au lieu de la foulée."""
    cuisse, tibia = 0.45, 0.44
    marche_fine = genou is not None
    j = {}
    if assis:
        jambes = {+1: (70, 75), -1: (70, 75)}
        balance = 0
        penche = 0
    elif jambes_fixes:
        jambes = dict(jambes_fixes)
        balance = 0.0
    else:
        a = math.radians(amplitude)
        jambes = {}
        for cote, dec in ((+1, 0.0), (-1, math.pi)):
            th = a * math.cos(phase + dec)
            # genou plié pendant que la jambe passe vers l'avant ; légèrement fléchi en appui
            if genou is None:
                plie = math.radians(12 + 45 * max(0.0, math.sin(phase + dec + math.pi)))
            else:
                plie = math.radians(genou[0] + genou[1] * max(0.0, math.sin(phase + dec + math.pi + 0.6)))
            jambes[cote] = (math.degrees(th), math.degrees(plie))
        balance = math.sin(phase)
    pts = {}
    bas = 0.0
    pieds = {}
    for cote, (th, kb) in jambes.items():
        th, kb = math.radians(th), math.radians(kb)
        d1 = V((math.sin(th), 0, -math.cos(th)))
        d2 = V((math.sin(th - kb), 0, -math.cos(th - kb)))
        genou = d1 * cuisse
        cheville = genou + d2 * tibia
        pts[cote] = (genou, cheville)
        bas = min(bas, cheville.z)
        # troupes : le pied de la jambe arrière suit en partie le tibia (appui sur la pointe, talon levé) au lieu de
        # rester à plat en l'air comme un pied « botté » posé sur une marche
        phi = th - kb
        if marche_fine and not assis and th < 0 and phi < 0:
            r = 0.8 * phi
            pieds[cote] = V((0.17 * math.cos(r) + 0.05 * math.sin(r), 0, 0.17 * math.sin(r) - 0.05 * math.cos(r)))
    # le pied d'appui touche le sol (cheville à 8 cm) : c'est ce qui fait monter et descendre le corps
    hz = 0.08 - bas if not assis else 0.0
    for cote, (genou, cheville) in pts.items():
        h = V((0, 0.1 * cote, hz))
        j["hanche", cote] = h
        j["genou", cote] = h + genou
        j["cheville", cote] = h + cheville
        pied = j["cheville", cote] + pieds.get(cote, V((0.17, 0.0, -0.05)))
        pied.z = max(0.025, pied.z) if not assis else pied.z
        j["pied", cote] = pied
    roulis = 0.012 * balance
    k = math.tan(math.radians(penche))   # avance du buste par mètre au-dessus du bassin

    def buste(dz, dx=0.0):
        return V((dx + k * dz, roulis, hz + dz))
    j["bassin"] = buste(0.06)
    j["taille"] = buste(0.2, 0.01)
    j["poitrine"] = buste(0.40, 0.03)
    j["cou"] = buste(0.56, 0.04)
    j["tete"] = buste(0.70, 0.05)
    for cote, bras in ((-1, bras_droit), (+1, bras_gauche)):
        ep, coude = bras[0], bras[1]
        ecart = math.radians(bras[2]) * cote if len(bras) > 2 else 0.0
        swing = -balancement * cote * math.sin(phase) if not assis else 0.0
        a1 = math.radians(ep + swing)
        a2 = math.radians(ep + swing + coude)
        epaule = buste(0.49, 0.03) + V((0, 0.22 * cote, 0))
        d1 = V((math.sin(a1), (0.12 if cote > 0 else 0.3) * cote, -math.cos(a1))).normalized()
        d2 = V((math.sin(a2), 0.05 * cote, -math.cos(a2))).normalized()
        if ecart:
            rx = Matrix.Rotation(ecart, 3, "X")       # bras ouvert sur le côté (vers +Y à gauche, -Y à droite)
            d1, d2 = rx @ d1, rx @ d2
        j["epaule", cote] = epaule
        j["coude", cote] = epaule + d1 * 0.29
        j["main", cote] = j["coude", cote] + d2 * 0.26
        j["avant_bras", cote] = d2
    return j


def corps_homme(nom, j, mat_haut, mat_jambes, epaisseur=1.0, jambes=True, galbe=False):
    """Corps (torse + bras) et jambes, épaissis par Skin (cuisses et mollets pleins : pas de jambes en bâtons).

    galbe (troupes) : jambes 25 % plus fines, avec un vrai dessin de jambe : cuisse qui s'affine vers le genou, genou
    marqué (rétréci), mollet renflé à l'arrière du tibia, cheville fine. Sans galbe : ancien tube (tours, engins)."""
    e = epaisseur
    pts = [j["bassin"], j["taille"], j["poitrine"], j["cou"],
           j["epaule", -1], j["coude", -1], j["main", -1],
           j["epaule", +1], j["coude", +1], j["main", +1]]
    aretes = [(0, 1), (1, 2), (2, 3), (2, 4), (4, 5), (5, 6), (2, 7), (7, 8), (8, 9)]
    rayons = [0.145 * e, 0.135 * e, 0.175 * e, 0.075, 0.09 * e, 0.07 * e, 0.052, 0.09 * e, 0.07 * e, 0.052]
    objs = [_membre_skin(nom + "_torse", pts, aretes, rayons, mat_haut)]
    if jambes and galbe:
        pts, aretes, rayons = [j["bassin"]], [], [0.13 * e]
        for cote in (-1, 1):
            h, g, c, p = j["hanche", cote], j["genou", cote], j["cheville", cote], j["pied", cote]
            tibia = c - g
            arriere = V((-tibia.z, 0, tibia.x)).normalized() * -1   # perpendiculaire au tibia, vers l'arrière
            if arriere.x > 0:
                arriere = -arriere
            mi_cuisse = h.lerp(g, 0.5)
            mollet = g.lerp(c, 0.3) + arriere * 0.018
            i0 = len(pts)
            pts += [h, mi_cuisse, g, mollet, c, p]
            rayons += [0.084 * e, 0.074 * e, 0.054 * e, 0.058, 0.04, 0.036]
            aretes += [(0, i0), (i0, i0 + 1), (i0 + 1, i0 + 2), (i0 + 2, i0 + 3), (i0 + 3, i0 + 4), (i0 + 4, i0 + 5)]
        objs.append(_membre_skin(nom + "_jambes", pts, aretes, rayons, mat_jambes))
    elif jambes:
        pts = [j["bassin"],
               j["hanche", -1], j["genou", -1], j["cheville", -1], j["pied", -1],
               j["hanche", +1], j["genou", +1], j["cheville", +1], j["pied", +1]]
        aretes = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8)]
        rayons = [0.14 * e, 0.112 * e, 0.08 * e, 0.062, 0.052, 0.112 * e, 0.08 * e, 0.062, 0.052]
        objs.append(_membre_skin(nom + "_jambes", pts, aretes, rayons, mat_jambes))
    return objs


def surcot(nom, j, mat, longueur=0.68, largeur=1.0, evasement=0.07, haut=0.07, z_haut=None):
    """Surcot (tabard, haubert) : tube de tissu évasé du haut du torse vers le genou ; z_haut : départ imposé (jupe).

    UV : u = 0,5 sur le devant (couture dans le dos), u = 0,25 sur le flanc droit (côté caméra) ; v = 1 en haut."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    z_haut = j["poitrine"].z + haut if z_haut is None else z_haut
    seg, etages = 24, 6
    anneaux = []
    for k in range(etages + 1):
        t = k / etages
        z = z_haut - longueur * t
        evase = max(0.0, t - 0.45) / 0.55
        rx = (0.14 + 0.01 * t + evasement * evase) * largeur
        ry = (0.205 - 0.03 * min(t, 0.45) / 0.45 + (evasement - 0.01) * evase) * largeur
        ft = min(1.0, (j["poitrine"].z - z) / max(0.01, j["poitrine"].z - j["bassin"].z))
        ft = max(0.0, ft)
        cx = j["poitrine"].x * (1 - ft) + j["bassin"].x * ft + 0.01
        cy = j["poitrine"].y * (1 - ft) + j["bassin"].y * ft
        anneau = []
        for s in range(seg + 1):
            a = -math.pi + 2 * math.pi * s / seg
            onde = 1.0 + 0.04 * math.sin(a * 5 + k) * t
            anneau.append(bm.verts.new((cx + rx * math.cos(a) * onde, cy + ry * math.sin(a) * onde, z)))
        anneaux.append(anneau)
    for k in range(etages):
        for s in range(seg):
            f = bm.faces.new((anneaux[k][s], anneaux[k][s + 1], anneaux[k + 1][s + 1], anneaux[k + 1][s]))
            f.smooth = True
            for lp, (ds, dk) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                lp[uv].uv = ((s + ds) / seg, 1 - (k + dk) / etages)
    ob = C.objet_maillage(nom, bm, mat)
    so = ob.modifiers.new("ep", "SOLIDIFY")
    so.thickness = 0.015
    return ob


def texture_surcot(camp, nom=None, embleme=0.95, galon=True):
    """Surcot aux armes : champ du camp, grand emblème sur la poitrine (vers le flanc vu de la caméra),
    galon du bas (or pour la France et l'Angleterre, vert pour les Omeyyades) ; ni croix ni écriture."""
    import numpy as np
    from PIL import Image
    c = C.CAMPS[camp]
    nom = nom or "surcot-" + camp
    chemin = C.os.path.join(C.CACHE, nom + ".png")
    W, H = 512, 256
    base = C.texture_blason(camp, W, H, taille_embleme=embleme * 0.59, nom=nom + "-base", decalage=(-0.13, -0.17),
                            usure=0.3, champ=c["tissu"])
    im = np.array(Image.open(base).convert("RGB"), dtype=np.float32)
    if galon:
        # galon du bas : 9 % de la hauteur, soit 6 cm sur un surcot de 0,68 m (vert pour les Omeyyades)
        bande = np.array(C.rgb8(c["meuble"] if camp != "omeyyades" else c["vert_tissu"]), dtype=np.float32)
        im[-int(H * 0.09):, :] = bande
    Image.fromarray(im.astype(np.uint8)).save(chemin)
    return chemin


def texture_rayures(nom, c1, c2, n=8, vertical=True):
    """Toile à bandes (panneaux de la jupe du champion omeyyade, fanions) : bandes alternées c1 / c2."""
    import numpy as np
    from PIL import Image
    chemin = C.os.path.join(C.CACHE, nom + ".png")
    W, H = 256, 128
    im = np.zeros((H, W, 3), dtype=np.uint8)
    for k in range(n):
        if vertical:
            im[:, k * W // n:(k + 1) * W // n] = C.rgb8(c1 if k % 2 == 0 else c2)
        else:
            im[k * H // n:(k + 1) * H // n, :] = C.rgb8(c1 if k % 2 == 0 else c2)
    Image.fromarray(im).save(chemin)
    return chemin


def cape(nom, j, mat, longueur=0.6, largeur=1.0):
    """Court manteau sur les épaules et le dos (demi-tube derrière le buste, du cou jusqu'aux reins)."""
    bm = bmesh.new()
    z0 = j["cou"].z - 0.02
    seg, etages = 14, 5
    anneaux = []
    for k in range(etages + 1):
        t = k / etages
        z = z0 - longueur * t
        cx = j["poitrine"].x - 0.02 - 0.05 * t
        rx = (0.17 + 0.05 * t) * largeur
        ry = (0.24 + 0.04 * t) * largeur
        anneau = []
        for s in range(seg + 1):
            a = math.pi * 0.45 + math.pi * 1.1 * s / seg       # de l'épaule gauche à l'épaule droite, par le dos
            anneau.append(bm.verts.new((cx + rx * math.cos(a), j["poitrine"].y + ry * math.sin(a), z)))
        anneaux.append(anneau)
    for k in range(etages):
        for s in range(seg):
            f = bm.faces.new((anneaux[k][s], anneaux[k][s + 1], anneaux[k + 1][s + 1], anneaux[k + 1][s]))
            f.smooth = True
    ob = C.objet_maillage(nom + "_cape", bm, mat)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
    return ob


def tete(nom, j, mats, casque="nasal", visage=True, bandeau=None, visage_net=False):
    """Tête et casque : 'nasal' (casque conique à nasal et coiffe de mailles), 'conique' (casque pointu d'acier
    sombre, bandeau, nasal, camail ouvert sur le visage), 'heaume' (fermé), 'chapel' (chapel de fer : calotte et
    large bord, coiffe de mailles ; piétaille anglaise). Le visage reste visible sous le nasal.

    visage_net (troupes) : visage avancé et un peu plus large, coiffe et camail reculés vers la nuque : de profil et de
    trois quarts, une tache couleur peau se lit sous le casque (sans elle, la tête se résume au casque)."""
    objs = []
    t = j["tete"]
    f = V((0.045, 0, -0.02)) if visage_net else V((0.02, 0, 0))     # visage avancé : il dépasse de la coiffe
    recul = 0.025 if visage_net else 0.0                              # coiffe et camail repoussés vers la nuque
    nez = 0.14 if visage_net else 0.118
    if visage:
        objs.append(C.sphere(nom + "_visage", 0.1, t + f, mats["peau"], subdiv=3,
                             echelle=(0.95, 1.0, 1.12) if visage_net else (1.0, 0.9, 1.08)))
    if casque == "nasal":
        objs.append(C.cylindre(nom + "_casque_b", 0.113, 0.07, (t.x - 0.01, t.y, t.z + 0.0), mats["acier"], segments=20))
        objs.append(C.cone(nom + "_casque", 0.114, 0.17, (t.x - 0.01, t.y, t.z + 0.07), mats["acier"], segments=20))
        objs.append(C.boite(nom + "_nasal", 0.015, 0.025, 0.11, (t.x + nez, t.y, t.z - 0.07), mats["acier"]))
        objs.append(C.sphere(nom + "_coiffe", 0.105, (t.x - 0.075 - recul, t.y, t.z - 0.06), mats["maille"], subdiv=2,
                             echelle=(0.8 if visage_net else 0.85, 1.05, 1.0)))
        objs.append(C.cylindre(nom + "_gorgerin", 0.1, 0.11, (t.x - 0.045 - recul, t.y, t.z - 0.21), mats["maille"], segments=14,
                               rayon_haut=0.085))
    elif casque == "chapel":
        # chapel de fer : calotte basse et bord large un peu tombant (silhouette de fantassin léger, tête plus large et
        # plus basse que le casque conique) ; coiffe de mailles derrière le visage
        # acier gris (celui des heaumes) : plus sombre que le gambison ivoire, il se lit comme un casque et non comme
        # un bonnet de toile
        objs.append(C.sphere(nom + "_calotte", 0.122, (t.x - 0.01, t.y, t.z + 0.03), mats["heaume"], subdiv=2,
                             echelle=(1.0, 1.0, 0.78)))
        objs.append(C.cylindre(nom + "_bord", 0.2, 0.045, (t.x - 0.01, t.y, t.z + 0.0), mats["heaume"], segments=28,
                               rayon_haut=0.13))
        objs.append(C.sphere(nom + "_coiffe", 0.105, (t.x - 0.075 - recul, t.y, t.z - 0.06), mats["maille"], subdiv=2,
                             echelle=(0.8, 1.05, 1.0)))
        objs.append(C.cylindre(nom + "_gorgerin", 0.1, 0.11, (t.x - 0.045 - recul, t.y, t.z - 0.21), mats["maille"], segments=14,
                               rayon_haut=0.085))
    elif casque in ("conique", "conique_ferme"):
        objs.append(C.cylindre(nom + "_casque_b", 0.113, 0.05, (t.x - 0.01, t.y, t.z + 0.02), mats["acier"], segments=20))
        objs.append(C.cone(nom + "_casque", 0.114, 0.22, (t.x - 0.01, t.y, t.z + 0.07), mats["acier"], segments=20))
        # bande du casque : fer (ou dorée pour le champion) ; jamais d'étoffe sur le casque (pas de lecture « turban »)
        objs.append(C.cylindre(nom + "_bandeau", 0.118, 0.035, (t.x - 0.01, t.y, t.z + 0.035),
                               bandeau or mats["fer"], segments=20))
        objs.append(C.boite(nom + "_nasal", 0.015, 0.025, 0.1, (t.x + nez, t.y, t.z - 0.06), mats["acier"]))
        maille = mats["maille_sombre"] if casque == "conique_ferme" else mats["maille"]
        # camail : ouvert sur le devant (la maille tombe derrière et sur les côtés), ou fermé jusqu'au nez
        objs.append(C.cylindre(nom + "_camail", 0.115, 0.16, (t.x - 0.075 - recul, t.y, t.z - 0.17), maille, segments=16,
                               rayon_haut=0.1))
        if casque == "conique_ferme":
            objs.append(C.cylindre(nom + "_ventaille", 0.112, 0.13, (t.x + 0.0, t.y, t.z - 0.17), maille, segments=16,
                                   rayon_haut=0.105))
    elif casque == "heaume":
        # heaume d'acier (gris chaud, plus clair que la maille), fente de visée horizontale sombre, sans renfort vertical
        h = mats["heaume"]
        objs.append(C.cylindre(nom + "_heaume", 0.125, 0.26, (t.x, t.y, t.z - 0.12), h, segments=20))
        objs.append(C.sphere(nom + "_heaume_h", 0.125, (t.x, t.y, t.z + 0.13), h, subdiv=2, echelle=(1, 1, 0.45)))
        objs.append(C.boite(nom + "_fente", 0.03, 0.2, 0.03, (t.x + 0.118, t.y, t.z + 0.01), mats["noir"]))
    return objs


def plumet(nom, j, mats, couleur="rouge"):
    """Plumet étroit sur le heaume (champion anglais) : torsade rouge et or à la base, plume rouge recourbée vers l'arrière."""
    t = j["tete"]
    base = V((t.x - 0.01, t.y, t.z + 0.19))
    objs = []
    for k in range(6):
        a = 2 * math.pi * k / 6
        objs.append(C.sphere(nom + "_torse%d" % k, 0.035, base + V((0.1 * math.cos(a), 0.1 * math.sin(a), 0.0)),
                             mats[couleur] if k % 2 else mats["or"], subdiv=1))
    chemin = [base, base + V((-0.02, 0, 0.08)), base + V((-0.08, 0, 0.15)), base + V((-0.16, 0, 0.17)), base + V((-0.22, 0, 0.13))]
    objs.append(_tube(nom + "_plume", chemin, [0.03, 0.032, 0.028, 0.02, 0.006], mats[couleur], segments=8))
    return objs


def masse(nom, mats, main, direction, longueur=0.62):
    """Masse d'armes à ailettes tenue à la main (manche de bois, tête de fer)."""
    d = V(direction).normalized()
    a = V(main) - d * 0.12
    b = a + d * longueur
    objs = [_tube(nom + "_manche", [a, b], [0.022, 0.02], mats["bois"], segments=8)]
    objs.append(C.sphere(nom + "_tete_masse", 0.07, b, mats["fer"], subdiv=2, echelle=(1, 1, 1.25)))
    for k in range(4):
        ail = C.boite(nom + "_ailette%d" % k, 0.02, 0.1, 0.12, (0, 0, 0), mats["fer"], base=False)
        _orienter(ail, b, d)
        ail.rotation_euler.rotate_axis("X", k * math.pi / 4)
        objs.append(ail)
    return objs


def ecu_amande(nom, camp, longueur=0.86, largeur=0.46, bombe=0.07):
    """Écu en amande (normand) aux armes du camp, modélisé à plat (face vers +X), le haut vers +Z."""
    tex = texture_ecu(camp, "amande")
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    nu, nv = 10, 16
    grille = []
    for jv in range(nv + 1):
        v = jv / nv                      # 0 en bas (pointe), 1 en haut
        z = (v - 0.72) * longueur
        if v > 0.72:                     # haut arrondi
            w = largeur / 2 * math.sqrt(max(0.0, 1 - ((v - 0.72) / 0.28) ** 2 * 0.35))
        else:                            # pointe effilée
            w = largeur / 2 * (math.sin(v / 0.72 * math.pi / 2) ** 0.8)
        ligne = []
        for iu in range(nu + 1):
            u = iu / nu
            y = (u - 0.5) * 2 * w
            x = bombe * (1 - ((u - 0.5) * 2) ** 2)
            ligne.append(bm.verts.new((x, y, z)))
        grille.append(ligne)
    for jv in range(nv):
        for iu in range(nu):
            f = bm.faces.new((grille[jv][iu], grille[jv][iu + 1], grille[jv + 1][iu + 1], grille[jv + 1][iu]))
            f.smooth = True
            for lp, (du, dv) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                # u = 0 côté -Y ; vue de face (depuis +X), -Y est à droite : on retourne u pour lire l'emblème à l'endroit
                lp[uv].uv = (1 - (iu + du) / nu, (jv + dv) / nv)
    m = C.mat_tissu("ecu_" + camp, C.CAMPS[camp]["tissu"], rugosite=0.6, image_png=tex, brillance=0.0)
    ob = C.objet_maillage(nom, bm, m)
    so = ob.modifiers.new("ep", "SOLIDIFY")
    so.thickness = 0.025
    so.offset = -1
    return ob


def ecu_rond(nom, camp, rayon=0.3, bombe=0.08, mats=None):
    """Bouclier rond bombé aux armes du camp, avec umbo de métal (face vers +X)."""
    tex = texture_ecu(camp, "rond")
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    na, nr = 32, 6
    centre = bm.verts.new((bombe, 0, 0))
    anneaux = []
    for k in range(1, nr + 1):
        r = rayon * k / nr
        x = bombe * (1 - (k / nr) ** 2)
        anneaux.append([bm.verts.new((x, r * math.cos(2 * math.pi * a / na), r * math.sin(2 * math.pi * a / na))) for a in range(na)])

    def uvp(v):
        return (0.5 - v.co.y / (2 * rayon), 0.5 + v.co.z / (2 * rayon))
    for a in range(na):
        f = bm.faces.new((centre, anneaux[0][a], anneaux[0][(a + 1) % na]))
        f.smooth = True
        for lp in f.loops:
            lp[uv].uv = uvp(lp.vert)
    for k in range(nr - 1):
        for a in range(na):
            f = bm.faces.new((anneaux[k][a], anneaux[k + 1][a], anneaux[k + 1][(a + 1) % na], anneaux[k][(a + 1) % na]))
            f.smooth = True
            for lp in f.loops:
                lp[uv].uv = uvp(lp.vert)
    m = C.mat_tissu("ecurond_" + camp, C.CAMPS[camp]["tissu"], rugosite=0.6, image_png=tex, brillance=0.0)
    ob = C.objet_maillage(nom, bm, m)
    so = ob.modifiers.new("ep", "SOLIDIFY")
    so.thickness = 0.025
    so.offset = -1
    objs = [ob]
    if mats:
        um = C.sphere(nom + "_umbo", 0.05, (bombe + 0.005, 0, 0), mats["acier"], subdiv=2, echelle=(0.6, 1, 1))
        um.parent = ob
        objs.append(um)
    return objs


def texture_ecu(camp, forme):
    """Texture d'écu : champ (albédo « tissu » du camp) + grand emblème, bordure de fer sombre (mise en cache)."""
    import numpy as np
    from PIL import Image
    nom = "ecu-%s-%s" % (camp, forme)
    chemin = C.os.path.join(C.CACHE, nom + ".png")
    c = C.CAMPS[camp]
    # champ à l'albédo « tissu » (plus clair que la couleur héraldique) : le rendu retombe sur la couleur du camp
    if forme == "amande":
        base = C.texture_blason(camp, 256, 480, taille_embleme=0.86, nom=nom + "-base", decalage=(0.0, -0.12), champ=c["tissu"])
    elif camp == "omeyyades":
        # bouclier vert (#357659) à la tour ivoire : le vert et l'ivoire du camp, lisibles sur la route
        base = C.texture_blason(camp, 384, 384, taille_embleme=0.58, nom=nom + "-base", inverse=True, champ=c["vert_tissu"],
                                meuble="#ece4cf")
    else:
        base = C.texture_blason(camp, 384, 384, taille_embleme=0.62, nom=nom + "-base", champ=c["tissu"])
    im = np.array(Image.open(base).convert("RGB"), dtype=np.float32)
    h, w = im.shape[:2]
    b = max(3, int(min(w, h) * 0.045))
    fer = np.array((70, 62, 52), dtype=np.float32)
    if forme == "amande":
        im[:, :b] = fer; im[:, -b:] = fer; im[:b, :] = fer
    else:
        yy, xx = np.mgrid[0:h, 0:w]
        r = np.sqrt((xx - w / 2) ** 2 + (yy - h / 2) ** 2)
        if camp == "omeyyades":
            # bordure ivoire de 4 cm (12,5 % du rayon d'un bouclier de 0,32 m), liseré de fer très fin
            im[r > w / 2 * (1 - 0.125)] = np.array(C.rgb8("#ece4cf"), dtype=np.float32)
            im[r > w / 2 - 3] = fer
        else:
            im[r > w / 2 - b] = fer
    Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(chemin)
    return chemin


def epee(nom, mats, main, direction, longueur=0.78, largeur=0.06, garde_l=0.22):
    """Épée tenue à la main, lame suivant direction (pointe en avant et vers le bas : garde basse)."""
    d = V(direction).normalized()
    objs = []
    lame = C.boite(nom + "_lame", longueur, largeur, 0.02, (0, 0, 0), mats["lame"], base=False)
    _orienter(lame, V(main) + d * (0.06 + longueur / 2), d)
    garde = C.boite(nom + "_garde", 0.035, garde_l, 0.035, (0, 0, 0), mats["fer"], base=False)
    _orienter(garde, V(main) + d * 0.055, d)
    pom = C.sphere(nom + "_pommeau", 0.025, V(main) - d * 0.08, mats["fer"], subdiv=1)
    objs += [lame, garde, pom]
    return objs


def lance(nom, mats, main, direction, longueur=2.6, recul=0.9, fanion=None, fer=0.26, taille_fanion=1.0, hampe=None,
          rayon=0.03, largeur_fer=0.045, sous_fer=0.1):
    """Lance (hampe de bois, fer en feuille) tenue à la main ; longueur totale, fer compris.
    fanion = camp pour un petit fanion (champ uni à bordure, sans meuble : rien qui ressemble à une croix).
    hampe : matière de la hampe (par défaut le bois sombre ; les troupes prennent le frêne clair de mat_frene())."""
    d = V(direction).normalized()
    a = V(main) - d * recul
    b = a + d * (longueur - fer)
    objs = [_tube(nom + "_hampe", [a, b], [rayon, rayon * 0.87], hampe or mats["bois"], segments=8)]
    fe = C.cone(nom + "_fer", largeur_fer, fer, (0, 0, 0), mats["lame"], segments=8)
    fe.rotation_mode = "QUATERNION"
    fe.rotation_quaternion = d.to_track_quat("Z", "Y")
    fe.location = b
    fe.scale = (1, 0.35, 1)
    objs.append(fe)
    if fanion:
        c = C.CAMPS[fanion]
        if fanion == "omeyyades":
            m = C.mat_tissu("fanion_" + fanion, "#ece4cf", image_png=texture_rayures("fanion-omeyyades", "#ece4cf", "#357659",
                                                                                      n=2, vertical=False))
        else:
            m = C.mat_tissu("fanion_" + fanion, c["tissu"])
        bm = bmesh.new()
        uvl = bm.loops.layers.uv.new("UVMap")
        base = b - d * sous_fer
        nx = 8
        haut_v, bas_v = [], []
        for i in range(nx + 1):
            u = i / nx
            p = base + V((-0.45 * u * taille_fanion, 0.04 * math.sin(u * 6), -0.03 * u))
            haut_v.append(bm.verts.new(p))
            larg = 0.22 * taille_fanion * (1 - 0.55 * u)
            bas_v.append(bm.verts.new(p - d * larg))
        for i in range(nx):
            f = bm.faces.new((bas_v[i], bas_v[i + 1], haut_v[i + 1], haut_v[i]))
            f.smooth = True
            for lp, uvv in zip(f.loops, ((i / nx, 0.0), ((i + 1) / nx, 0.0), ((i + 1) / nx, 1.0), (i / nx, 1.0))):
                lp[uvl].uv = uvv
        ob = C.objet_maillage(nom + "_fanion", bm, m)
        ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.01
        objs.append(ob)
    return objs


def arc(nom, mats, main, echelle=1.0, tire=None):
    """Arc long tenu à la main gauche, corde comprise. tire : point où la main droite tient la corde (arc bandé : les
    branches plient davantage et une flèche est encochée) ; None : corde au repos."""
    pts = []
    pli = 0.2 if tire is not None else 0.13
    for k in range(9):
        t = (k / 8 - 0.5) * 2
        pts.append(V(main) + V((pli * (1 - t * t), 0, t * (0.8 if tire is not None else 0.85))) * echelle)
    objs = [_tube(nom + "_arc", pts, [0.016] * 4 + [0.022] + [0.016] * 4, mats["bois"], segments=6)]
    milieu = V(tire) if tire is not None else V(main) + V((-0.14, 0, 0)) * echelle
    objs.append(_tube(nom + "_corde", [pts[0], milieu, pts[-1]], [0.006] * 3, mats["fer"], segments=4))
    if tire is not None:
        d = (V(main) - milieu).normalized()
        objs.append(_tube(nom + "_fleche", [milieu, milieu + d * 0.95 * echelle], [0.012, 0.012], mats["bois"], segments=5))
    return objs


def texture_ecartele(camp, nom=None, lin="#d6c9ac"):
    """Surcot écartelé (piétaille anglaise) : quartiers 1 et 4 au rouge du camp, 2 et 3 en lin ivoire ; ni croix ni
    meuble. UV du surcot : u = 0,5 au milieu du devant, u = 0,25 sur le flanc droit (côté caméra), v = 1 en haut ;
    le flanc vu porte donc un quartier rouge en haut (poitrine) et ivoire en bas (jupe)."""
    import numpy as np
    from PIL import Image
    c = C.CAMPS[camp]
    nom = nom or "ecartele-" + camp
    chemin = C.os.path.join(C.CACHE, nom + ".png")
    W, H = 256, 128
    im = np.zeros((H, W, 3), dtype=np.uint8)
    rouge, clair = C.rgb8(c["tissu"]), C.rgb8(lin)
    im[:H // 2, :W // 2] = rouge
    im[H // 2:, :W // 2] = clair
    im[:H // 2, W // 2:] = clair
    im[H // 2:, W // 2:] = rouge
    Image.fromarray(im).save(chemin)
    return chemin


# ---------------------------------------------------------------- gestes : chute et coup (bandes « -chute » et « -coup »)
# Chute en 4 images : genoux qui plient, buste renversé, au sol, couché (arme posée à côté). La figurine tombe d'une
# pièce vers l'arrière (à l'opposé de l'ennemi) : sa racine tourne autour des pieds, puis elle est reposée sur le sol
# (son point le plus bas touche le sol). Le corps reste d'un seul tenant : aucun membre ne se détache.
# Une ligne : (bascule en degrés, jambes {côté: (cuisse, genou)}, penche du buste, bras droit, bras gauche,
#              arme de la main droite « main » ou « sol », élévation d'une lance tenue en degrés)
CHUTE = (
    (16, {-1: (40, 80), +1: (30, 72)}, -10, (100, 25, 18), (45, 40, 22), "main", 78),
    (50, {-1: (55, 95), +1: (44, 86)}, -18, (122, 18, 36), (68, 35, 38), "main", 66),
    (82, {-1: (34, 58), +1: (22, 42)}, -4, (8, 12, 62), (14, 24, 22), "main", 0),
    (90, {-1: (16, 24), +1: (9, 15)}, 0, (6, 10, 80), (8, 18, 16), "sol", 0),
)
# En tombant, le corps tourne un peu vers le fond de la scène (degrés autour de la verticale, par image) : couché, il
# barre l'image en biais et tient dans sa largeur.
LACET_CHUTE = (0, -8, -14, -16)
# Coup en 4 images : armer, frapper, suivi, revenir. Épée et masse : (bras droit, angle de l'arme depuis la verticale
# descendante, vers l'avant, en degrés ; penche du buste ; jambes en garde). Le pied avant (droit) ne quitte pas
# l'ancrage : la figurine frappe sur place, sans glisser.
COUP_ARME = (
    ((116, 40, 24), 210, 0, {-1: (14, 22), +1: (-12, 20)}),
    ((22, 5, 6), 84, 12, {-1: (26, 34), +1: (-20, 14)}),
    ((6, 10, 6), 54, 9, {-1: (24, 32), +1: (-18, 14)}),
    ((34, 36, 8), 70, 4, {-1: (16, 24), +1: (-12, 18)}),
)
# l'arme armée part sur le côté de la caméra (y négatif) : levée derrière l'épaule, elle ne se cache pas derrière la tête
Y_ARME = (-0.32, -0.08, -0.08, -0.1)
# Lance de la piétaille : (bras droit, élévation de la lance en degrés, recul ajouté de la main sur la hampe, penche,
# jambes) : ramener la lance, frapper d'estoc, suivre, revenir.
COUP_LANCE = (
    ((10, 78, 5), 66, 0.25, 0, {-1: (14, 22), +1: (-12, 20)}),
    ((48, 28, 4), 60, 0.2, 10, {-1: (26, 34), +1: (-20, 14)}),
    ((44, 30, 4), 57, 0.2, 8, {-1: (24, 32), +1: (-18, 14)}),
    ((30, 55, 4), 66, 0.1, 4, {-1: (16, 24), +1: (-12, 18)}),
)


def direction_arme(angle, y=-0.08):
    """Direction d'une arme dans le plan X-Z de la figurine : angle depuis la verticale descendante, positif vers
    l'avant (0 : pointe en bas, 90 : vers l'avant, 180 : vers le haut, au-delà : derrière la tête)."""
    a = math.radians(angle)
    return V((math.sin(a), y, -math.cos(a))).normalized()


def poser_racine(racine, objets, echelle=1.0):
    """Repose la figurine sur le sol : le point le plus bas des maillages évalués d'objets (enfants de racine) est ramené
    à z = 0 (le sol, où le capteur d'ombre est posé). La racine est enfant d'un pivot sans rotation hors du plan."""
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    bas = None
    for o in objets:
        if o.type != "MESH":
            continue
        oe = o.evaluated_get(dg)
        me = oe.to_mesh()
        mw = oe.matrix_world
        for v in me.vertices:
            z = (mw @ v.co).z
            bas = z if bas is None or z < bas else bas
        oe.to_mesh_clear()
    if bas is not None:
        racine.location.z -= bas / echelle
        bpy.context.view_layer.update()
    return bas


def basculer(racine, angle_y=0.0, angle_x=0.0, centre=(0, 0, 0)):
    """Rotation rigide de la racine autour d'un point (repère du parent) : angle_y tourne autour de l'axe Y (positif :
    la tête part vers l'avant, +X), angle_x autour de l'axe X (positif : le haut part vers -Y, vers la caméra)."""
    c = V(centre)
    m = Matrix.Translation(c) @ Matrix.Rotation(math.radians(angle_x), 4, "X") @ \
        Matrix.Rotation(math.radians(angle_y), 4, "Y") @ Matrix.Translation(-c)
    racine.matrix_basis = m @ racine.matrix_basis


# ---------------------------------------------------------------- soldats complets
def soldat(nom, camp, role, phase=0.0, lacet=-22.0, echelle=1.0, recul_y=0.1, fine=None, plafond=None, chute=None,
           coup=None, tir=None):
    """Construit un soldat et renvoie ses objets (déjà orientés et posés à l'origine).

    role : 'fantassin' (épée + écu en amande), 'pietaille' (lance à fanion + écu), 'homme_armes' (lourd),
    'champion' (lourd, plus grand, armure propre, arme tenue haut), 'archer' (arc, buste dressé).
    Omeyyades : piétaille en surcot ivoire jusqu'au genou et manches ivoire ; hommes d'armes en maille sombre à camail
    fermé, surcot ivoire, grand bouclier rond, épée levée ; champion en broigne d'écailles d'acier sombre, jupe à
    panneaux vert et ivoire, court manteau vert, bande de casque dorée, masse tenue haut.
    Angleterre et France : hommes d'armes et champion en heaume d'acier à fente de visée ; le champion anglais lève
    l'épée et porte un plumet rouge étroit sur une torsade rouge et or.
    recul_y : la figurine est un peu reculée (vers le nord) pour que ses pieds ne descendent pas sous l'ancrage.

    fine (par défaut : toutes les troupes, mais pas les archers des tours) : anatomie des troupes, contre l'effet
    « jouet en plastique » : jambes galbées 25 % plus fines avec genou et mollet, genou jamais tendu (16° en appui,
    jusqu'à 46° en balancier ; pied arrière sur la pointe), bottes 30 % plus petites, visage dégagé sous le casque des piétons, épées plus courtes
    et plus fines (environ 0,55 × la hauteur de la figure à l'écran), hampes de frêne clair.
    Angleterre (fine) : la piétaille porte un chapel de fer, un gambison de lin ivoire, un surcot écartelé ivoire et
    gueules, un petit écu (0,7 m) et une lance de frêne dressée presque verticale dont le fer et le grand fanion
    dépassent nettement du casque ; les hommes d'armes sont en acier bruni sombre, plus épais (1,2), épée levée :
    deux silhouettes différentes, et non deux nuances de rouge.
    plafond (piétaille anglaise) : hauteur à l'écran, en mètres au-dessus de l'ancrage, où placer la pointe de la lance
    (bord haut de l'image moins une marge) : la lance de 2,6 m monte aussi haut que l'image le permet ; si son talon
    devait entrer dans le sol, elle est raccourcie d'autant.
    chute (0 à 3) : image de la bande de chute (table CHUTE) ; coup (0 à 3) : image de la bande de coup (COUP_ARME,
    COUP_LANCE). Les deux gardent l'échelle, le lacet et le recul de la marche : même taille et même ancrage en jeu.
    tir (archer des tours) : None ou 0 = repos, 1 = arc bandé (main droite à la joue, flèche encochée), 2 = lâcher (main
    droite rejetée en arrière, corde droite)."""
    if fine is None:
        fine = role != "archer"
    mats = matieres(camp)
    sud = camp == "omeyyades"
    anglais = camp == "angleterre"
    lourd = role in ("homme_armes", "champion")
    genou = (16, 30) if fine else None
    if role == "fantassin":
        bd, bg, amp, pen = (25, 30), (18, 78), 17, 6.5
    elif role == "pietaille" and anglais and fine:
        # main droite avancée à hauteur de hanche : la lance est tenue droite devant le corps
        bd, bg, amp, pen = (26, 60), (18, 78), 17, 6.5
    elif role == "pietaille":
        bd, bg, amp, pen = (35, 45), (18, 78), 17, 6.5
    elif role == "archer":
        bd, bg, amp, pen = (80, 95), (88, 5), 4, 2
    elif role == "champion" and sud:
        bd, bg, amp, pen = (128, 32), (20, 80), 15, 6.5
    elif role == "champion":
        bd, bg, amp, pen = (120, 25), (20, 80), 15, 6.5
    elif role == "homme_armes" and (sud or (anglais and fine)):
        bd, bg, amp, pen = (118, 40), (20, 80), 15, 6.5
    else:
        bd, bg, amp, pen = (25, 35), (18, 78), 15, 6.5
    lance_en_main = role == "pietaille"
    jf, bal = None, 4
    d_arme, elev_lance, recul_lance = None, None, 0.0
    ligne_chute = CHUTE[chute] if chute is not None else None
    if ligne_chute:
        bascule, jf, pen, bd, bg, arme_ou, elev_lance = ligne_chute
        bal = 0
        if role == "champion" and chute == 1:
            bd = (100, 20, 40)                    # le champion est plus grand : son bras jeté reste dans l'image
        if lance_en_main and chute >= 1:
            arme_ou = "sol"                       # la lance échappe des mains dès que l'homme bascule
        elif lance_en_main:
            bd, elev_lance = (30, 50, 10), 60     # touché : la lance penche en avant, la main ne se lève pas
    elif coup is not None:
        bal = 0
        if lance_en_main:
            bd, elev_lance, recul_lance, pen, jf = COUP_LANCE[coup]
        else:
            bd, angle, pen, jf = COUP_ARME[coup]
            if role == "champion" and coup == 0:
                bd, angle = (106, 40, 22), 198         # le champion est plus grand : il arme un peu plus bas
            elif role == "champion" and coup == 3:
                angle = 60                             # et sa longue lame revient plus bas (elle reste dans l'image)
            d_arme = direction_arme(angle, Y_ARME[coup])
    if role == "archer" and tir == 1:
        bd = (-70, 160)                           # coude en arrière, main droite à la joue : la corde est tirée
    elif role == "archer" and tir == 2:
        bd = (-80, -60)                           # la flèche est partie : la main droite file vers l'arrière
    j = pose_homme(phase, bras_droit=bd, bras_gauche=bg, amplitude=amp, penche=pen, genou=genou, jambes_fixes=jf,
                   balancement=bal)
    if ligne_chute and not lance_en_main:
        d_arme = V(j["avant_bras", -1])             # l'arme lâchée prolonge l'avant-bras (prise qui se défait)
    objs = []
    tex = texture_surcot(camp)
    m_sur = C.mat_tissu("surcot_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    # hommes d'armes anglais : maille et heaume d'acier bruni sombre ; corps plus épais
    lourd_anglais = fine and anglais and role == "homme_armes"
    mt = dict(mats)
    if lourd_anglais:
        # maille d'acier bruni sombre, mais heaume d'acier gris clair : à l'échelle du jeu, un heaume sombre se lit comme
        # une tête noire sans visage
        mt["maille"] = mats["maille_sombre"]
        mt["heaume"] = mats["heaume_clair"]
    elif fine and anglais and role == "champion":
        mt["heaume"] = mats["heaume_clair"]      # même heaume gris clair que les hommes d'armes
    ep_corps = (1.2 if lourd_anglais else 1.12) if lourd else 1.0
    if sud:
        if role == "champion":
            haut, jambes = mats["ecailles"], mats["maille_sombre"]
        elif role == "homme_armes":
            haut, jambes = mats["maille_sombre"], mats["maille_sombre"]
        else:
            haut, jambes = mats["ivoire"], mats["chausses"]          # manches ivoire
        objs += corps_homme(nom, j, haut, jambes, epaisseur=ep_corps, galbe=fine)
        if role == "champion":
            jupe = C.mat_tissu("jupe_" + camp, "#ece4cf", image_png=texture_rayures("panneaux-omeyyades", "#ece4cf", "#357659", n=10))
            objs.append(surcot(nom + "_broigne", j, mats["ecailles"], longueur=0.4, largeur=1.12, evasement=0.03))
            objs.append(surcot(nom + "_jupe", j, jupe, longueur=0.4, largeur=1.18, evasement=0.07, z_haut=j["bassin"].z + 0.1))
            objs.append(cape(nom, j, mats["vert"], longueur=0.62, largeur=1.1))
        else:
            # surcot ivoire jusqu'au genou (galon vert de 6 cm) par-dessus la maille ou la tunique
            objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.68, largeur=1.08 if lourd else 1.0))
        ceint = mats["vert"]
    else:
        pietaille_anglaise = fine and anglais and role == "pietaille"
        jambes = mt["maille"] if lourd else mats["chausses"]
        haut = mats["gambison"] if pietaille_anglaise else mt["maille"]
        objs += corps_homme(nom, j, haut, jambes, epaisseur=ep_corps, galbe=fine)
        if pietaille_anglaise:
            m_ec = C.mat_tissu("ecartele_" + camp, C.CAMPS[camp]["tissu"], image_png=texture_ecartele(camp))
            objs.append(surcot(nom + "_surcot", j, m_ec, longueur=0.64, largeur=1.0))
        elif role != "archer":
            objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.68 if not lourd else 0.7,
                               largeur=(1.12 if lourd_anglais else 1.08) if lourd else 1.0))
        else:
            objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.5, largeur=1.02, evasement=0.04))
        ceint = mats["cuir"]
    zc = j["taille"].z - 0.05 if sud else j["bassin"].z + 0.0
    xc = j["taille"].x + 0.01 if sud else j["bassin"].x + 0.01
    ceinture = C.cylindre(nom + "_ceinture", 0.168 * ep_corps, 0.06 if sud else 0.05, (xc, j["taille"].y, zc),
                          ceint, segments=16)
    ceinture.scale = (0.95, 1.22, 1)
    objs.append(ceinture)
    if sud:
        casque = "conique_ferme" if role == "homme_armes" else "conique"
    elif fine and anglais and role == "pietaille":
        casque = "chapel"
    else:
        casque = "heaume" if lourd else "nasal"
    objs += tete(nom, j, mt, casque, visage=casque != "heaume", bandeau=mats["or"] if (sud and role == "champion") else None,
                 visage_net=fine and casque in ("nasal", "conique", "chapel"))
    if role == "champion" and not sud:
        objs += plumet(nom, j, mats, "rouge")
    # bottes (troupes : 30 % plus petites, la tige monte un peu plus haut sur le mollet)
    rb = [0.045, 0.042, 0.035] if fine else [0.064, 0.06, 0.05]
    for cote in (-1, 1):
        objs.append(_tube(nom + "_botte%d" % cote, [j["cheville", cote] + V((0, 0, 0.12 if fine else 0.1)), j["cheville", cote],
                                                    j["pied", cote]], rb, mats["cuir"], segments=8))
    # armes (troupes : lames plus courtes et plus fines, garde plus étroite)
    md, mg = j["main", -1], j["main", +1]
    lame = {"largeur": 0.05, "garde_l": 0.17} if fine else {}

    def arme(main, d=None):
        """Arme de la main droite (épée ou masse) ; d : direction (None : celle de la marche)."""
        o = []
        if role == "fantassin" or (role == "homme_armes" and not sud and not lourd_anglais):
            o += epee(nom, mats, main, d if d is not None else (V((0.62, -0.1, -0.55)) if fine else V((0.75, -0.1, -0.4))),
                      longueur=0.56 if fine else 0.74, **lame)
        elif role == "homme_armes":
            o += epee(nom, mats, main, d if d is not None else V((0.3, -0.08, 1.0)), longueur=0.62 if fine else 0.76,
                      **lame)                                                                  # épée levée
        elif role == "champion" and sud:
            o += masse(nom, mats, main, d if d is not None else V((0.35, -0.06, 0.9)), longueur=0.66)   # masse tenue haut
        elif role == "champion":
            o += epee(nom, mats, main, d if d is not None else V((0.75, -0.06, 0.8)), longueur=0.72 if fine else 0.88,
                      **lame)                                                                  # grande épée levée
        return o
    arme_au_sol = bool(ligne_chute) and arme_ou == "sol"
    if not arme_au_sol:
        objs += arme(md, d_arme)
    hampe = mats["frene"] if fine else None
    if role == "pietaille" and elev_lance is not None:
        # geste (coup) ou chute (lance encore en main) : même lance que la marche, inclinée selon la table
        longueur_l = 2.6 if anglais and fine else 1.95
        if not arme_au_sol:
            e_l = math.radians(elev_lance)
            d_l = V((math.cos(e_l), -0.05, math.sin(e_l))).normalized()
            recul = (1.25 if anglais and fine else 0.5) + recul_lance
            recul = min(recul, (md.z - 0.05) / max(0.05, d_l.z))      # le talon ne rentre jamais dans le sol
            if anglais and fine:
                objs += lance(nom, mats, md, d_l, longueur=longueur_l, recul=recul, fanion=camp, taille_fanion=1.35,
                              hampe=hampe, rayon=0.034, fer=0.22, largeur_fer=0.05, sous_fer=0.02)
            else:
                objs += lance(nom, mats, md, d_l, longueur=longueur_l, recul=recul, fanion=camp, taille_fanion=0.9,
                              hampe=hampe)
    elif role == "pietaille" and anglais and fine:
        # lance de frêne dressée (12° vers l'avant), talon juste au-dessus du sol ; grand fanion de gueules
        d = V((0.12, 0.0, 1.0)).normalized()
        longueur = 2.6
        t, lac = math.radians(C.INCLINAISON), math.radians(lacet)

        def v_ecran(p):
            """Hauteur à l'écran (m au-dessus de l'ancrage) d'un point du repère de la figurine (caméra inclinée)."""
            y_monde = (p.x * math.sin(lac) + p.y * math.cos(lac)) * echelle + recul_y
            return p.z * echelle * math.cos(t) + y_monde * math.sin(t)
        recul_max = (md.z - 0.04) / d.z                      # talon à 4 cm du sol au plus bas
        if plafond is None:
            recul = min(recul_max, longueur - 1.5)
        else:
            vers_pointe = (plafond - v_ecran(md)) / (v_ecran(md + d) - v_ecran(md))
            recul = min(recul_max, longueur - vers_pointe)
            longueur = vers_pointe + recul
        objs += lance(nom, mats, md, d, longueur=longueur, recul=recul, fanion=camp, taille_fanion=1.35, hampe=hampe,
                      rayon=0.034, fer=0.22, largeur_fer=0.05, sous_fer=0.02)
    elif role == "pietaille":
        # lance tenue devant soi, pointe haute, talon devant les jambes ; petit fanion aux couleurs du camp
        objs += lance(nom, mats, md, V((0.36, -0.05, 1.0)), longueur=1.95, recul=0.5, fanion=camp, taille_fanion=0.9,
                      hampe=hampe)
    if role == "archer":
        objs += arc(nom, mats, mg, echelle=1.0, tire=j["main", -1] if tir == 1 else None)
    if role != "archer":
        if sud:
            r = {"pietaille": 0.33, "homme_armes": 0.42, "champion": 0.44}.get(role, 0.33)
            ecu = ecu_rond(nom + "_ecu", camp, rayon=r, mats=mats)
            ecu[0].location = mg + V((0.06, -0.03, 0.04))
            ecu[0].rotation_euler = (0, 0, math.radians(-22))
            objs += ecu
        else:
            if fine and anglais and role == "pietaille":
                ecu = ecu_amande(nom + "_ecu", camp, longueur=0.7, largeur=0.4)        # petit écu de piéton
            else:
                ecu = ecu_amande(nom + "_ecu", camp, longueur=0.9 if lourd else 0.84)
            ecu.location = mg + V((0.03, -0.02, 0.0))
            ecu.rotation_euler = (0, 0, math.radians(-20))
            objs.append(ecu)
    # orientation commune : un peu tournée vers la caméra
    pv = bpy.data.objects.new(nom + "_pivot", None)
    C.lier(pv)
    racine = pv
    if ligne_chute:
        # la figurine bascule d'une pièce vers l'arrière autour de ses pieds, puis est reposée sur le sol
        racine = C.lier(bpy.data.objects.new(nom + "_racine", None))
        racine.parent = pv
    for o in objs:
        if o.parent is None:
            o.parent = racine
    pv.rotation_euler = (0, 0, math.radians(lacet))
    pv.scale = (echelle, echelle, echelle)
    pv.location = (0, recul_y, 0)
    if ligne_chute:
        basculer(racine, angle_y=-bascule)
        racine.matrix_basis = Matrix.Rotation(math.radians(LACET_CHUTE[chute]), 4, "Z") @ racine.matrix_basis
        poser_racine(racine, objs, echelle)
        if arme_au_sol:
            # arme posée à plat à côté de la main droite, un peu vers la caméra (elle ne passe pas sous le corps)
            main = racine.matrix_basis @ V(md)
            if role == "pietaille":
                # lance tombée en travers, sous le corps (à 50° de l'horizontale à l'écran : une lance de 2,6 m ne
                # tient pas à plat dans une image de 40 px), milieu de la hampe sous le bassin
                d_sol = V((0.88, -0.47, 0.0)).normalized()
                longueur_l = 2.6 if anglais and fine else 1.95
                centre = racine.matrix_basis @ V(j["bassin"])
                pose = V((centre.x + 0.1, centre.y - 0.15, 0.04))
                sol = lance(nom + "_sol", mats, pose, d_sol, longueur=longueur_l, recul=longueur_l * 0.5, fanion=camp,
                            taille_fanion=1.35 if anglais and fine else 0.9, hampe=hampe)
            else:
                d_sol = V((0.55, -0.83, 0.0)).normalized()
                pose = V((main.x + 0.05, main.y - 0.12, 0.07 if (role == "champion" and sud) else 0.036))
                sol = arme(pose, d_sol)
            for o in sol:
                if o.parent is None:
                    o.parent = pv
            objs += sol
    return objs, pv


# ---------------------------------------------------------------- chevaux
def _loft(nom, centres, ry, rz, mat, segments=16, bouts=True, niveaux=1):
    """Volume lissé : une ellipse (demi-largeur ry, demi-hauteur rz) à chaque point d'un chemin.

    L'axe « rz » est la perpendiculaire au chemin dans le plan vertical (X-Z) ; « ry » est le côté (Y)."""
    bm = bmesh.new()
    anneaux = []
    n = len(centres)
    for k, p in enumerate(centres):
        p = V(p)
        a = V(centres[max(0, k - 1)])
        b = V(centres[min(n - 1, k + 1)])
        t = (b - a).normalized()
        cote = V((0, 1, 0))
        dessus = t.cross(cote).normalized() * -1
        if dessus.z < 0:
            dessus = -dessus
        anneau = []
        for s in range(segments):
            ang = 2 * math.pi * s / segments
            anneau.append(bm.verts.new(p + cote * (ry[k] * math.cos(ang)) + dessus * (rz[k] * math.sin(ang))))
        anneaux.append(anneau)
    for k in range(n - 1):
        for s in range(segments):
            f = bm.faces.new((anneaux[k][s], anneaux[k][(s + 1) % segments], anneaux[k + 1][(s + 1) % segments], anneaux[k + 1][s]))
            f.smooth = True
    if bouts:
        for anneau, inverse in ((anneaux[0], True), (anneaux[-1], False)):
            c = bm.verts.new(sum((v.co for v in anneau), V()) / len(anneau))
            for s in range(segments):
                tri = (anneau[s], anneau[(s + 1) % segments], c)
                f = bm.faces.new(tri[::-1] if not inverse else tri)
                f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = C.objet_maillage(nom, bm, mat)
    if niveaux:
        sub = ob.modifiers.new("lisse", "SUBSURF")
        sub.levels = niveaux
        sub.render_levels = niveaux
    return ob


# profil du cheval : x le long du corps, centre (z), demi-largeur, demi-hauteur
CORPS_CHEVAL = [(-0.98, 1.22, 0.10, 0.12), (-0.9, 1.24, 0.22, 0.26), (-0.7, 1.23, 0.28, 0.33), (-0.45, 1.18, 0.27, 0.31),
                (-0.15, 1.15, 0.28, 0.33), (0.15, 1.15, 0.29, 0.36), (0.42, 1.2, 0.26, 0.36), (0.64, 1.2, 0.2, 0.3),
                (0.76, 1.15, 0.1, 0.16)]
# encolure allongée de 20 % (depuis la base du garrot) et affinée sous la nuque : la tête se détache de l'encolure
ENCOLURE = [(0.45, 1.38, 0.17, 0.3), (0.654, 1.644, 0.14, 0.23), (0.822, 1.908, 0.11, 0.16), (0.942, 2.1, 0.085, 0.112)]
# tête : nuque étroite, ganaches larges, chanfrein, bout du nez un peu renflé
TETE_CHEVAL = [(0.902, 2.15, 0.07, 0.085), (1.002, 2.14, 0.098, 0.135), (1.122, 2.0, 0.085, 0.11), (1.242, 1.84, 0.068, 0.08),
               (1.302, 1.75, 0.064, 0.072)]


def _lisse01(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def _dir(a):
    """Direction dans le plan X-Z, a = angle depuis la verticale descendante (positif vers l'avant, +X)."""
    return V((math.sin(a), 0, -math.cos(a)))


def pose_cheval(phase, amplitude=24):
    """Articulations des jambes d'un cheval au pas (allure à quatre temps : postérieur gauche, antérieur gauche,
    postérieur droit, antérieur droit). Chaque jambe est à l'appui 62 % du temps (le sabot recule au sol), puis se lève
    nettement et revient vers l'avant : sur 4 images, une jambe différente est levée à chaque fois.

    Anatomie (et non des piliers droits) : antérieur = avant-bras, genou (carpe), canon presque vertical, boulet, paturon
    incliné de 32° vers l'avant ; au lever, le genou avance et le canon se replie vers l'arrière (environ 100°).
    Postérieur = jambe qui descend vers l'arrière jusqu'au jarret (29°), canon presque vertical, paturon incliné ; au
    lever, le jarret se ferme et le sabot se retourne vers l'arrière."""
    u_cycle = (phase / (2 * math.pi)) % 1.0
    j = {"bob": 0.03 * math.cos(4 * math.pi * u_cycle), "tete": 0.04 * math.sin(4 * math.pi * u_cycle + 0.6)}
    decal = {("post", +1): 0.0, ("ant", +1): 0.25, ("post", -1): 0.5, ("ant", -1): 0.75}
    A = math.radians(amplitude)
    appui = 0.62
    paturon = math.radians(32)
    for (av, cote), d in decal.items():
        u = (u_cycle - d) % 1.0
        if u < appui:
            swing = A * (1 - 2 * u / appui)
            leve = 0.0
        else:
            w = (u - appui) / (1 - appui)
            swing = -A + 2 * A * _lisse01(w)
            leve = math.sin(math.pi * w)
        if av == "ant":
            haut = V((0.56, 0.15 * cote, 1.02))                    # coude
            a1 = swing + 0.35 * leve                               # avant-bras : le genou monte vers l'avant
            genou = haut + _dir(a1) * 0.42
            a2 = a1 - math.radians(4 + 100 * leve)                 # canon replié vers l'arrière au lever
            boulet = genou + _dir(a2) * 0.3
            a3 = a2 + paturon * (1 - leve) - math.radians(25) * leve
            sabot = boulet + _dir(a3) * 0.16
        else:
            haut = V((-0.6, 0.16 * cote, 1.08))                    # grasset
            a1 = swing - 0.5 + 0.35 * leve                         # jambe : vers l'arrière jusqu'au jarret
            genou = haut + _dir(a1) * 0.48                         # (le « genou » du postérieur est le jarret)
            a2 = swing + 0.08 - 0.45 * leve                        # canon presque vertical
            boulet = genou + _dir(a2) * 0.36
            a3 = a2 + paturon * (1 - leve) - math.radians(30) * leve
            sabot = boulet + _dir(a3) * 0.16
        j[av, cote] = (haut, genou, boulet, sabot)
    # posé au sol : le sabot le plus bas touche z = 0,04 ; le corps suit
    bas = min(j[k][3].z for k in decal)
    j["dz"] = 0.04 - bas + j["bob"]
    for k in decal:
        j[k] = tuple(p + V((0, 0, 0.04 - bas + j["bob"])) for p in j[k])
    return j


# Jambes d'un cheval qui tombe, dans le repère du cheval debout (la racine l'abaisse et le couche ensuite) :
# mode -> (avant-bras ou jambe, canon, paturon) en degrés depuis la verticale descendante, positif vers l'avant ;
# None : jambes de la marche. « genoux » : antérieurs repliés, le cheval tombe sur les genoux ; « replie » : les quatre
# jambes repliées sous le ventre ; « flanc » : jambes à demi pliées et détendues (cheval couché sur le flanc).
JAMBES_CHUTE = {
    "genoux": {"ant": (24, -100, -70), "post": None},
    "replie": {"ant": (78, -98, -80), "post": (52, -92, -70)},
    "flanc": {"ant": (58, -35, -10), "post": (14, -70, -40)},
}


def pose_cheval_chute(mode):
    """Articulations d'un cheval qui s'affaisse (JAMBES_CHUTE) ; les deux jambes d'une paire ne plient pas tout à fait
    pareil (± 6°)."""
    j = pose_cheval(0.0)
    angles = JAMBES_CHUTE[mode]
    for (av, cote) in (("ant", 1), ("ant", -1), ("post", 1), ("post", -1)):
        a = angles[av]
        if a is None:
            continue
        haut = j[av, cote][0]
        dec = 6 if cote > 0 else -6
        a1, a2, a3 = (math.radians(x + dec) for x in a)
        l1, l2, l3 = (0.42, 0.3, 0.16) if av == "ant" else (0.48, 0.36, 0.16)
        genou = haut + _dir(a1) * l1
        boulet = genou + _dir(a2) * l2
        j[av, cote] = (haut, genou, boulet, boulet + _dir(a3) * l3)
    return j


# Cavaliers, bande de coup : (élévation de la lance en degrés, buste penché en avant, cheval cabré en degrés, phase
# des jambes) : lance couchée, poussée (pointe basse, buste en avant), cheval qui se cabre un peu, retour.
COUP_CAVALIER = ((4, 0, 0, 0.0), (-5, 12, 0, 0.5 * math.pi), (5, 4, 5, math.pi), (14, 0, 0, 1.5 * math.pi))
# Cavaliers, bande de chute : (jambes du cheval, roulis du cheval en degrés (le dos part vers la caméra, les jambes vers
# le nord), tangage (positif : la tête plonge), cavalier « selle » (tangage, roulis vers la caméra) ou « sol » (ligne
# de CHUTE de l'homme à terre))
CHUTE_CAVALIER = (("genoux", 0, 12, ("selle", -14, 8)), ("replie", 10, 3, ("selle", -10, 52)),
                  ("flanc", 55, 0, ("sol", 2)), ("flanc", 84, 0, ("sol", 3)))


def _profil(liste, dz=0.0, gonfle=0.0):
    c = [V((x, 0, z + dz)) for (x, z, ry, rz) in liste]
    return c, [ry + gonfle for (x, z, ry, rz) in liste], [rz + gonfle for (x, z, ry, rz) in liste]


def mat_robe_pommelee(nom, robe, tache):
    """Robe gris pommelé : fond clair semé de pommelures plus sombres (cellules de Voronoï adoucies)."""
    m, nt, p = C.nouveau_materiau(nom)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vo = nt.nodes.new("ShaderNodeTexVoronoi")
    vo.inputs["Scale"].default_value = 9.0
    nt.links.new(tc.outputs["Object"], vo.inputs["Vector"])
    mr = C._plage(nt, vo.outputs["Distance"], 0.18, 0.42, 0.0, 1.0)
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    nt.links.new(mr, C._entree(mx, "Factor", "VALUE"))
    C._entree(mx, "A", "RGBA").default_value = C.couleur(robe)
    C._entree(mx, "B", "RGBA").default_value = C.couleur(tache)
    nt.links.new(C._sortie(mx, "RGBA"), p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.55
    return m


def mat_tete_cheval(nom, robe, liste=None, museau=None, x_museau=1.19):
    """Tête du cheval : robe, liste claire le long du chanfrein (faces tournées vers l'avant et le haut, normale
    d'objet) et bout du nez d'une autre teinte (au-delà de x_museau, coordonnées d'objet du cheval) : de trois quarts,
    la tête se lit comme une tête et non comme le prolongement sombre de l'encolure."""
    m, nt, p = C.nouveau_materiau(nom)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sortie = None
    base = C.couleur(robe)
    if liste:
        dp = nt.nodes.new("ShaderNodeVectorMath")
        dp.operation = "DOT_PRODUCT"
        dp.inputs[1].default_value = (0.66, 0.0, 0.75)
        nt.links.new(tc.outputs["Normal"], dp.inputs[0])
        f1 = C._plage(nt, dp.outputs["Value"], 0.84, 0.93, 0.0, 1.0)
        mx1 = nt.nodes.new("ShaderNodeMix")
        mx1.data_type = "RGBA"
        nt.links.new(f1, C._entree(mx1, "Factor", "VALUE"))
        C._entree(mx1, "A", "RGBA").default_value = base
        C._entree(mx1, "B", "RGBA").default_value = C.couleur(liste)
        sortie = C._sortie(mx1, "RGBA")
    if museau:
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Object"], sep.inputs[0])
        f2 = C._plage(nt, sep.outputs["X"], x_museau, x_museau + 0.07, 0.0, 1.0)
        mx2 = nt.nodes.new("ShaderNodeMix")
        mx2.data_type = "RGBA"
        nt.links.new(f2, C._entree(mx2, "Factor", "VALUE"))
        if sortie is not None:
            nt.links.new(sortie, C._entree(mx2, "A", "RGBA"))
        else:
            C._entree(mx2, "A", "RGBA").default_value = base
        C._entree(mx2, "B", "RGBA").default_value = C.couleur(museau)
        sortie = C._sortie(mx2, "RGBA")
    if sortie is not None:
        nt.links.new(sortie, p.inputs["Base Color"])
    else:
        p.inputs["Base Color"].default_value = base
    p.inputs["Roughness"].default_value = 0.5
    return m


def cheval(nom, j, robe="#6b4428", criniere="#2a1b12", balzanes=(("ant", -1), ("post", 1)), chanfrein=None, pommele=None,
           jambes=None, liste=None, museau=None):
    """Cheval (volumes lissés) + jambes, crinière et queue ; balzanes claires ; chanfrein : matière d'une plaque de tête
    (chevaux caparaçonnés) ; pommele : couleur des pommelures (robe gris pommelé) ; jambes : couleur du bas des jambes
    (bai : jambes noires sous le genou et le jarret) ; liste, museau : teintes de la liste et du bout du nez.
    Jambes articulées : genou (carpe) plat et plus large que le canon, jarret avec sa pointe vers l'arrière, boulet,
    paturon incliné ; avant-bras et jambe musclés qui s'affinent. Un œil sombre de chaque côté de la tête."""
    m_robe = mat_robe_pommelee("robe_" + nom, robe, pommele) if pommele else C.mat_simple("robe_" + nom, robe, rugosite=0.5,
                                                                                          bosse=0.04)
    m_tete = mat_tete_cheval("tete_" + nom, robe, liste, museau)
    if jambes:
        m_jambe = C.mat_simple("jambe_" + nom, jambes, rugosite=0.55)
    else:
        m_jambe = C.mat_simple("jambe_" + nom, C.melanger(C.couleur(robe), (0.02, 0.015, 0.01, 1), 0.5), rugosite=0.55)
    m_balz = C.mat_simple("balzane_" + nom, "#d9cfbd", rugosite=0.7)
    m_crin = C.mat_simple("crin_" + nom, criniere, rugosite=0.8, bosse=0.3, echelle_bosse=120)
    m_sabot = C.mat_simple("sabot_" + nom, "#2b2420", rugosite=0.6)
    m_oeil = C.mat_simple("oeil_" + nom, "#0d0a08", rugosite=0.25)
    dz = j["dz"] - 0.04
    # cheval couché (chute) : encolure et tête abaissées vers l'avant, d'autant plus loin du garrot (encolure tendue)
    abaisse = j.get("encolure_basse", 0.0)

    def bas(x, z):
        return z - abaisse * max(0.0, x - 0.45)
    enc = [(x, bas(x, z), ry, rz) for (x, z, ry, rz) in ENCOLURE]
    tet = [(x, bas(x, z), ry, rz) for (x, z, ry, rz) in TETE_CHEVAL]
    objs = []
    c, ry, rz = _profil(CORPS_CHEVAL, dz)
    objs.append(_loft(nom + "_corps", c, ry, rz, m_robe, segments=18))
    c, ry, rz = _profil(enc, dz + j["tete"] * 0.5)
    objs.append(_loft(nom + "_encolure", c, ry, rz, m_robe, segments=14))
    c, ry, rz = _profil(tet, dz + j["tete"])
    objs.append(_loft(nom + "_tete", c, ry, rz, m_tete, segments=14))
    if chanfrein is not None:
        c, ry, rz = _profil(tet[1:4], dz + j["tete"], gonfle=0.018)
        objs.append(_loft(nom + "_chanfrein", c, ry, rz, chanfrein, segments=12))
    else:
        for cote in (-1, 1):
            objs.append(C.sphere(nom + "_oeil%d" % cote, 0.024, (1.035, 0.088 * cote, bas(1.035, 2.125) + dz + j["tete"]), m_oeil,
                                 subdiv=2))
    for (av, cote) in (("ant", 1), ("ant", -1), ("post", 1), ("post", -1)):
        h, g, b, s = j[av, cote]
        mj = m_balz if (av, cote) in balzanes else m_jambe
        if av == "ant":
            haut_muscle = h + V((0.04, 0, 0.28))
            objs.append(_tube(nom + "_bras%d" % cote, [haut_muscle, h, h.lerp(g, 0.45), g], [0.13, 0.095, 0.07, 0.048],
                              m_robe, segments=10))
            # genou (carpe) : plat devant, plus large que le canon
            objs.append(C.sphere(nom + "_genou%d" % cote, 0.05, g, mj, subdiv=2, echelle=(1.2, 0.95, 1.15)))
        else:
            haut_muscle = h + V((0.05, 0, 0.28))
            objs.append(_tube(nom + "_cuisse%d" % cote, [haut_muscle, h, h.lerp(g, 0.5), g], [0.17, 0.12, 0.085, 0.05],
                              m_robe, segments=10))
            # jarret et sa pointe, en saillie vers l'arrière
            objs.append(C.sphere(nom + "_jarret%d" % cote, 0.05, g, mj, subdiv=2, echelle=(1.1, 0.9, 1.15)))
            objs.append(C.sphere(nom + "_pointe%d" % cote, 0.034, g + V((-0.055, 0, 0.045)), mj, subdiv=2))
        objs.append(_tube(nom + "_canon%d%s" % (cote, av), [g, b], [0.043, 0.04], mj, segments=8))
        objs.append(C.sphere(nom + "_boulet%d%s" % (cote, av), 0.05, b, mj, subdiv=2))
        objs.append(_tube(nom + "_paturon%d%s" % (cote, av), [b, s], [0.04, 0.037], mj, segments=8))
        objs.append(C.cylindre(nom + "_sabot%d%s" % (cote, av), 0.056, 0.085, (s.x + 0.01, s.y, s.z - 0.045), m_sabot, segments=10,
                               rayon_haut=0.046))
    e = [V((x, 0, z + dz + j["tete"] * 0.5)) for (x, z, ry, rz) in enc]
    cr = [e[0] + V((-0.12, 0, 0.24)), e[1] + V((-0.1, 0, 0.18)), e[2] + V((-0.08, 0, 0.13)), e[3] + V((-0.05, 0, 0.1))]
    objs.append(_tube(nom + "_criniere", cr, [0.05, 0.065, 0.06, 0.04], m_crin, segments=8))
    nuque = V((0.98, 0, bas(0.98, 2.22) + dz + j["tete"]))
    for cote in (-1, 1):
        o = C.cone(nom + "_oreille%d" % cote, 0.03, 0.11, nuque + V((-0.02, 0.05 * cote, -0.02)), m_robe, segments=6)
        o.rotation_euler = (0.25 * cote, -0.3, 0)
        objs.append(o)
    q0 = V((-0.96, 0, 1.3 + dz))
    objs.append(_tube(nom + "_queue", [q0, q0 + V((-0.12, 0, -0.12)), q0 + V((-0.16, 0, -0.42)), q0 + V((-0.14, 0, -0.68))],
                      [0.05, 0.075, 0.085, 0.04], m_crin, segments=8))
    return objs


def _jupe(bm, uv, profil, dz, hauteur_bas, ondulation, u0, u1, na=22):
    """Pan de housse : épouse le dos puis tombe presque droit jusqu'à l'ourlet (hauteur_bas)."""
    anneaux = []
    for ix, (x, z, ry, rz) in enumerate(profil):
        z += dz
        anneau = []
        for k in range(na + 1):
            a = math.pi * k / na                 # 0 = flanc gauche (+Y), π = flanc droit (-Y)
            ca, sa = math.cos(a), math.sin(a)
            yy = (ry + 0.05) * ca
            zz = z + (rz + 0.05) * sa
            if sa < 0.75:
                chute = (0.75 - sa) / 0.75
                zz = (z + (rz + 0.05) * 0.75) * (1 - chute) + hauteur_bas * chute
                yy = math.copysign(ry + 0.05 + 0.05 * chute, ca)
            ond = ondulation * math.sin(x * 16 + k * 0.7) * (1 - sa)
            anneau.append(bm.verts.new((x, yy + math.copysign(ond, yy), zz)))
        anneaux.append(anneau)
    n = len(profil)
    for ix in range(n - 1):
        for k in range(na):
            f = bm.faces.new((anneaux[ix][k], anneaux[ix + 1][k], anneaux[ix + 1][k + 1], anneaux[ix][k + 1]))
            f.smooth = True
            for lp, (di, dk) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                lp[uv].uv = (u0 + (u1 - u0) * (ix + di) / (n - 1), (k + dk) / na)
    return anneaux


def caparacon(nom, camp, j, hauteur_bas=0.85, ondulation=0.03):
    """Caparaçon aux armes du camp en deux pans séparés (arrière : croupe et flancs ; avant : poitrail), arrêtés à
    0,85 m du sol : les canons des jambes restent visibles. Encolure et tête découvertes (chanfrein à part)."""
    tex = texture_caparacon(camp)
    m = C.mat_tissu("caparacon_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    m_uni = C.mat_tissu("caparacon_uni_" + camp, C.CAMPS[camp]["tissu"])
    dz = j["dz"] - 0.04
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    arriere = [p for p in CORPS_CHEVAL if -0.95 <= p[0] <= 0.15]
    anneaux = _jupe(bm, uv, arriere, dz, hauteur_bas + dz * 0.5, ondulation, 0.0, 1.0)
    arr = anneaux[0]
    cc = bm.verts.new(sum((v.co for v in arr), V()) / len(arr) + V((-0.06, 0, 0)))
    for k in range(len(arr) - 1):
        f = bm.faces.new((arr[k + 1], arr[k], cc))
        f.smooth = True
        for lp in f.loops:
            lp[uv].uv = (0.0, 0.5)
    ob = C.objet_maillage(nom + "_caparacon", bm, m)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
    sub = ob.modifiers.new("lisse", "SUBSURF")
    sub.levels = sub.render_levels = 1
    objs = [ob]
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    avant = [(0.24, 1.16, 0.29, 0.35), (0.42, 1.2, 0.26, 0.36), (0.64, 1.2, 0.2, 0.3), (0.76, 1.15, 0.12, 0.18)]
    _jupe(bm, uv, avant, dz, hauteur_bas + 0.08 + dz * 0.5, ondulation, 0.0, 1.0)
    ob2 = C.objet_maillage(nom + "_poitrail", bm, m_uni)
    ob2.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
    objs.append(ob2)
    return objs


def texture_caparacon(camp):
    """Housse : champ du camp (albédo « tissu »), UN grand emblème par flanc (au moins 60 % de la hauteur du pan),
    galon de la couleur du meuble en bas. Pas de petites charges répétées (qui se liraient comme des croix)."""
    import numpy as np
    from PIL import Image
    nom = "caparacon-" + camp
    chemin = C.os.path.join(C.CACHE, nom + ".png")
    W, H = 512, 512
    c = C.CAMPS[camp]
    img = np.zeros((H, W, 3), dtype=np.float32)
    img[:] = C.rgb8(c["tissu"])
    meuble = np.array(C.rgb8(c["meuble"]), dtype=np.float32)
    sombre = np.array(C.rgb8(c["contour"]), dtype=np.float32)
    # v (UV, de bas en haut de l'image) : 0 = ourlet gauche, 0,5 = dos, 1 = ourlet droit. Un pan fait 0,5 en v (256 px).
    t = int(0.5 * H * 0.68)
    if c["embleme"] == "lion":
        lw = int(t * 1.5)
        em = np.array(C.masque_lion(lw), dtype=np.float32) / 255.0
    else:
        em = np.array(C.masque_embleme(c["embleme"], t), dtype=np.float32) / 255.0
    from PIL import ImageFilter
    # flanc droit (vu de la caméra) : l'image y paraît retournée verticalement ; le lion y regarde la tête du cheval
    for v_centre, e in ((0.27, em), (0.73, em[::-1, ::-1])):
        eh, ew = e.shape
        cy = int((1 - v_centre) * H) - eh // 2
        cx = int(0.52 * W) - ew // 2
        ep = np.array(Image.fromarray((e * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)), dtype=np.float32) / 255
        zone = img[cy:cy + eh, cx:cx + ew]
        zone[:] = zone * (1 - ep[..., None]) + sombre * ep[..., None]
        zone[:] = zone * (1 - e[..., None]) + meuble * e[..., None]
    b = 18
    img[:b, :] = meuble
    img[-b:, :] = meuble
    Image.fromarray(img.astype(np.uint8)).save(chemin)
    return chemin


def texture_housse(camp):
    """Housse de selle longue : champ du camp (ivoire chez les Omeyyades) bordé de la couleur secondaire (vert) sur
    l'ourlet et les deux bords ; Angleterre : gueules au lion d'or (texture du caparaçon)."""
    if camp != "omeyyades":
        return texture_caparacon(camp)
    import numpy as np
    from PIL import Image
    chemin = C.os.path.join(C.CACHE, "housse-%s.png" % camp)
    W, H = 512, 512
    img = np.zeros((H, W, 3), dtype=np.float32)
    img[:] = C.rgb8("#ece4cf")
    vert = np.array(C.rgb8(C.CAMPS[camp]["vert_tissu"]), dtype=np.float32)
    b = int(H * 0.08)
    img[:b, :] = vert
    img[-b:, :] = vert
    img[:, :int(W * 0.06)] = vert
    img[:, -int(W * 0.06):] = vert
    # tour verte sur chaque flanc (petite, au-dessus de l'ourlet)
    t = int(H * 0.2)
    em = np.array(C.masque_embleme("tour", t), dtype=np.float32) / 255.0
    for v_centre, e in ((0.3, em), (0.7, em[::-1, :])):
        cy = int((1 - v_centre) * H) - t // 2
        cx = int(0.5 * W) - t // 2
        zone = img[cy:cy + t, cx:cx + t]
        zone[:] = zone * (1 - e[..., None]) + vert * e[..., None]
    Image.fromarray(img.astype(np.uint8)).save(chemin)
    return chemin


def housse(nom, camp, j, hauteur_bas=0.92, debut=-0.78, fin=0.2, poitrail=False, ondulation=0.025):
    """Housse de selle longue (cavalerie anglaise et omeyyade) : un pan qui épouse le dos autour de la selle et tombe
    jusqu'à hauteur_bas du sol (les jambes du cheval restent visibles) ; poitrail : un second pan sur la poitrine.
    Elle couvre au moins un quart de la silhouette du cheval : la couleur du camp se lit sur la route."""
    tex = texture_housse(camp)
    m = C.mat_tissu("housse_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    dz = j["dz"] - 0.04
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    profil = [p for p in CORPS_CHEVAL if debut <= p[0] <= fin]
    _jupe(bm, uv, profil, dz, hauteur_bas + dz * 0.5, ondulation, 0.0, 1.0)
    ob = C.objet_maillage(nom + "_housse", bm, m)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
    sub = ob.modifiers.new("lisse", "SUBSURF")
    sub.levels = sub.render_levels = 1
    objs = [ob]
    if poitrail:
        bm = bmesh.new()
        uv = bm.loops.layers.uv.new("UVMap")
        avant = [(0.3, 1.17, 0.29, 0.35), (0.46, 1.2, 0.26, 0.36), (0.64, 1.2, 0.2, 0.3), (0.76, 1.15, 0.12, 0.18)]
        _jupe(bm, uv, avant, dz, hauteur_bas + 0.06 + dz * 0.5, ondulation, 0.0, 1.0)
        ob2 = C.objet_maillage(nom + "_poitrail", bm, C.mat_tissu("poitrail_" + camp, C.CAMPS[camp]["tissu"]))
        ob2.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
        objs.append(ob2)
    return objs


def cavalier(nom, camp, phase=0.0, lacet=-35.0, echelle=1.0, lourd=False, recul_y=0.62, chute=None, coup=None):
    """Cheval + cavalier assis, lance couchée et écu.

    lourd : caparaçon complet en deux pans et chanfrein (cavalerie de France seulement). Angleterre : cheval bai
    (#4a2c1c) aux crins et aux jambes noirs, liste claire et bout du nez plus clair, grande housse de gueules (ourlet à
    0,9 m, pan de poitrail), fanion rouge à la lance. Omeyyades : cheval gris pommelé au bout du nez sombre, longue
    housse ivoire bordée de vert (ourlet à 0,95 m). Cheval tourné de 35° vers la caméra. Lance de frêne patiné ;
    visage du cavalier dégagé sous le casque (sauf le heaume de la cavalerie lourde).
    coup (0 à 3) : COUP_CAVALIER ; chute (0 à 3) : CHUTE_CAVALIER (le cheval s'affaisse puis se couche sur le flanc, le
    dos vers la caméra ; le cavalier glisse et tombe devant lui ; la lance tombe à terre). Cheval et cavalier restent
    entiers : aucun membre ne se détache."""
    mats = matieres(camp)
    sud = camp == "omeyyades"
    geste = COUP_CAVALIER[coup] if coup is not None else None
    ch = CHUTE_CAVALIER[chute] if chute is not None else None
    if ch:
        jc = pose_cheval_chute(ch[0])
        if chute >= 2:
            jc["encolure_basse"] = 0.55 if chute == 2 else 0.9   # encolure tendue vers l'avant, tête au sol
    elif geste:
        jc = pose_cheval(geste[3])
    else:
        jc = pose_cheval(phase)
    objs = []
    if lourd:
        objs += cheval(nom + "_ch", jc, robe="#6b4428", criniere="#1e140e", chanfrein=mats["acier"], jambes="#2a1c14")
        objs += caparacon(nom, camp, jc)
    elif sud:
        objs += cheval(nom + "_ch", jc, robe="#b9b3a8", criniere="#5a544c", pommele="#8e877c", balzanes=(),
                       museau="#4e4842")
        objs += housse(nom, camp, jc, hauteur_bas=0.95, debut=-0.72, fin=0.2)
    else:
        objs += cheval(nom + "_ch", jc, robe="#4a2c1c", criniere="#120c09", balzanes=(("post", 1),), jambes="#16110d",
                       liste="#d8cdb8", museau="#7a5e48")
        objs += housse(nom, camp, jc, hauteur_bas=0.9, debut=-0.8, fin=0.2, poitrail=True)
    selle_z = 1.13 + jc["dz"] - 0.04 + 0.36
    objs.append(C.boite(nom + "_selle", 0.42, 0.36, 0.1, (-0.02, 0, selle_z - 0.04), mats["cuir"]))
    objs.append(C.boite(nom + "_troussequin", 0.06, 0.3, 0.16, (-0.22, 0, selle_z), mats["cuir"]))
    a_terre = bool(ch) and ch[3][0] == "sol"
    if a_terre:
        # cavalier tombé devant son cheval : même homme, posé comme un fantassin à terre (table CHUTE)
        lc = CHUTE[ch[3][1]]
        j = pose_homme(0.0, bras_droit=lc[3], bras_gauche=lc[4], penche=lc[2], jambes_fixes=lc[1], balancement=0)
    else:
        # cavalier : torse droit sur la selle, jambes de part et d'autre ; bras droit serre la lance sous l'aisselle
        j = pose_homme(0.0, assis=True, bras_droit=(25, 70), bras_gauche=(35, 65))
        dec = V((-0.02, 0, selle_z + 0.02))
        for k in list(j.keys()):
            if isinstance(j[k], Vector) and k not in (("avant_bras", 1), ("avant_bras", -1)):
                j[k] = j[k] + dec
        for cote in (-1, 1):
            j["hanche", cote] = j["bassin"] + V((0.0, 0.13 * cote, -0.04))
            j["genou", cote] = j["hanche", cote] + V((0.36, 0.17 * cote, -0.16))
            j["cheville", cote] = j["genou", cote] + V((-0.05, 0.03 * cote, -0.42))
            j["pied", cote] = j["cheville", cote] + V((0.15, 0, -0.03))
    homme = []
    homme += corps_homme(nom + "_h", j, mats["ivoire"] if sud else mats["maille"], mats["maille"] if lourd else mats["chausses"],
                         epaisseur=1.05, galbe=True)
    tex = texture_surcot(camp)
    m_sur = C.mat_tissu("surcot_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    homme.append(surcot(nom + "_surcot", j, m_sur, longueur=0.42, largeur=1.15))
    homme += tete(nom + "_h", j, mats, "conique" if sud else ("heaume" if lourd else "nasal"), visage=not lourd,
                  visage_net=not lourd)
    for cote in (-1, 1):
        homme.append(_tube(nom + "_botte%d" % cote, [j["cheville", cote] + V((0, 0, 0.12)), j["cheville", cote], j["pied", cote]],
                           [0.044, 0.041, 0.034], mats["cuir"], segments=8))
    md, mg = j["main", -1], j["main", +1]
    # lance couchée sous le bras, à droite de la tête du cheval (côté caméra), relevée de 14° (geste : table COUP_CAVALIER)
    lance_sol = bool(ch) and chute >= 1
    if not lance_sol:
        if ch:
            d_l = V((1.0, -0.1, math.tan(math.radians(34))))       # la lance se relève quand le cheval s'affaisse
        elif geste:
            d_l = V((1.0, -0.1, math.tan(math.radians(geste[0]))))
        else:
            d_l = V((1.0, -0.1, 0.25))
        homme += lance(nom, mats, md + V((0, -0.08, 0)), d_l, longueur=2.7, recul=1.15, fanion=camp,
                       taille_fanion=1.4, hampe=mats["frene_patine"])
    # écu au bras gauche, porté bas contre le flanc gauche du cavalier : il ne masque plus la tête du cheval
    if sud:
        e = ecu_rond(nom + "_ecu", camp, rayon=0.28, mats=mats)
        e[0].location = j["coude", 1] + V((-0.05, 0.12, -0.12))
        e[0].rotation_euler = (0, 0, math.radians(70))
        homme += e
    else:
        e = ecu_amande(nom + "_ecu", camp, longueur=0.74, largeur=0.4)
        e.location = j["coude", 1] + V((-0.05, 0.12, -0.05))
        e.rotation_euler = (0, 0, math.radians(70))
        homme.append(e)
    pv = bpy.data.objects.new(nom + "_pivot", None)
    C.lier(pv)
    pv.rotation_euler = (0, 0, math.radians(lacet))
    pv.scale = (echelle, echelle, echelle)
    pv.location = (-0.12 * echelle, recul_y, 0)
    if not (ch or geste):
        for o in objs + homme:
            if o.parent is None:
                o.parent = pv
        return objs + homme, pv
    # gestes : le cheval (et le cavalier en selle) sur une racine qui tangue ou roule ; l'homme à terre sur la sienne
    r_cheval = C.lier(bpy.data.objects.new(nom + "_racine_cheval", None))
    r_cheval.parent = pv
    r_homme = C.lier(bpy.data.objects.new(nom + "_racine_homme", None))
    r_homme.parent = pv if a_terre else r_cheval
    for o in objs:
        if o.parent is None:
            o.parent = r_cheval
    for o in homme:
        if o.parent is None:
            o.parent = r_homme
    sabots_post = (jc["post", 1][3] + jc["post", -1][3]) / 2
    siege = V((-0.02, 0, selle_z))
    if geste:
        if geste[1]:
            basculer(r_homme, angle_y=geste[1], centre=siege)          # buste en avant : la poussée
        if geste[2]:
            basculer(r_cheval, angle_y=-geste[2], centre=sabots_post)  # cabré : l'avant monte (tangage arrière)
        return objs + homme, pv
    _, roulis, tangage, cav = ch
    if tangage:
        basculer(r_cheval, angle_y=tangage, centre=sabots_post)
    if roulis:
        basculer(r_cheval, angle_x=roulis, centre=(0, 0, 1.0))          # couché sur le flanc : dos vers la caméra
    if not a_terre:
        basculer(r_homme, angle_y=cav[1], angle_x=cav[2], centre=siege)  # il glisse de la selle, vers la caméra
    poser_racine(r_cheval, objs + ([] if a_terre else homme), echelle)
    if a_terre:
        # l'homme à terre devant le cheval (côté caméra), sur le dos, le long du flanc, tête vers celle du cheval
        lc = CHUTE[ch[3][1]]
        basculer(r_homme, angle_y=-lc[0])
        r_homme.matrix_basis = Matrix.Translation(V((-0.2, -0.78, 0.0))) @ Matrix.Rotation(math.radians(168), 4, "Z") @ \
            r_homme.matrix_basis
        poser_racine(r_homme, homme, echelle)
    sol = []
    if lance_sol:
        # la lance tombe à terre, à plat, sous le cheval couché (ses deux bouts dépassent à peine : à 40 px, une lance de
        # 2,7 m posée à côté ne tiendrait pas dans l'image)
        pose = V((0.05, 0.15, 0.04))
        sol = lance(nom + "_sol", mats, pose, V((1.0, 0.05, 0.0)), longueur=2.7, recul=1.35, fanion=camp, taille_fanion=1.4,
                    hampe=mats["frene_patine"])
        for o in sol:
            if o.parent is None:
                o.parent = pv
    return objs + homme + sol, pv
