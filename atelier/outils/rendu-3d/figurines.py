# -*- coding: utf-8 -*-
"""Figurines : fantassins, cavaliers et chevaux modélisés par programme (squelette + modificateur Skin).

Chaque figurine est construite pour une phase de marche donnée (0 à 2π) : jambes, bras et léger
balancement du corps sont calculés ici, puis le corps est « habillé » (maille, surcot, casque, écu, arme).
Repère local : la figurine regarde vers +X (droite de l'écran), sa gauche est +Y, le haut +Z ; unité le mètre.

Règles tenues ici : aucune croix sur les surcots, écus et caparaçons (un seul grand emblème par pan) ; pas de
bleu chez les Anglais (maille gris chaud peu métallique, acier un peu doré) ; Omeyyades en haubert, casque
conique à nasal, bouclier rond, sans turban ni aucun signe religieux.
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
        "vert": C.mat_tissu("vert_" + camp, "#2f6b52"),
    }
    _cache_mats[cle] = m
    return m


_cache_mats = {}
C.CACHES.append(_cache_mats)


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
def pose_homme(phase, assis=False, bras_droit=(15, 55), bras_gauche=(35, 75), amplitude=17, penche=6.5, balancement=4):
    """Positions des articulations d'un homme de 1,80 m à la phase de marche donnée.

    Foulée souple : amplitude de 17° à la hanche, genou d'appui fléchi de 12°, genou en balancier jusqu'à 57°,
    buste penché de « penche » degrés vers l'avant (il avance, il ne recule pas).
    bras_* : (angle de l'épaule vers l'avant, flexion du coude) en degrés, avant le balancement de marche."""
    cuisse, tibia = 0.45, 0.44
    j = {}
    if assis:
        jambes = {+1: (70, 75), -1: (70, 75)}
        balance = 0
        penche = 0
    else:
        a = math.radians(amplitude)
        jambes = {}
        for cote, dec in ((+1, 0.0), (-1, math.pi)):
            th = a * math.cos(phase + dec)
            # genou plié pendant que la jambe passe vers l'avant ; légèrement fléchi en appui
            plie = math.radians(12 + 45 * max(0.0, math.sin(phase + dec + math.pi)))
            jambes[cote] = (math.degrees(th), math.degrees(plie))
        balance = math.sin(phase)
    pts = {}
    bas = 0.0
    for cote, (th, kb) in jambes.items():
        th, kb = math.radians(th), math.radians(kb)
        d1 = V((math.sin(th), 0, -math.cos(th)))
        d2 = V((math.sin(th - kb), 0, -math.cos(th - kb)))
        genou = d1 * cuisse
        cheville = genou + d2 * tibia
        pts[cote] = (genou, cheville)
        bas = min(bas, cheville.z)
    # le pied d'appui touche le sol (cheville à 8 cm) : c'est ce qui fait monter et descendre le corps
    hz = 0.08 - bas if not assis else 0.0
    for cote, (genou, cheville) in pts.items():
        h = V((0, 0.1 * cote, hz))
        j["hanche", cote] = h
        j["genou", cote] = h + genou
        j["cheville", cote] = h + cheville
        pied = j["cheville", cote] + V((0.17, 0.0, -0.05))
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
    for cote, (ep, coude) in ((-1, bras_droit), (+1, bras_gauche)):
        swing = -balancement * cote * math.sin(phase) if not assis else 0.0
        a1 = math.radians(ep + swing)
        a2 = math.radians(ep + swing + coude)
        epaule = buste(0.49, 0.03) + V((0, 0.22 * cote, 0))
        d1 = V((math.sin(a1), (0.12 if cote > 0 else 0.3) * cote, -math.cos(a1))).normalized()
        d2 = V((math.sin(a2), 0.05 * cote, -math.cos(a2))).normalized()
        j["epaule", cote] = epaule
        j["coude", cote] = epaule + d1 * 0.29
        j["main", cote] = j["coude", cote] + d2 * 0.26
        j["avant_bras", cote] = d2
    return j


def corps_homme(nom, j, mat_haut, mat_jambes, epaisseur=1.0, jambes=True):
    """Corps (torse + bras) et jambes, épaissis par Skin (cuisses et mollets pleins : pas de jambes en bâtons)."""
    e = epaisseur
    pts = [j["bassin"], j["taille"], j["poitrine"], j["cou"],
           j["epaule", -1], j["coude", -1], j["main", -1],
           j["epaule", +1], j["coude", +1], j["main", +1]]
    aretes = [(0, 1), (1, 2), (2, 3), (2, 4), (4, 5), (5, 6), (2, 7), (7, 8), (8, 9)]
    rayons = [0.145 * e, 0.135 * e, 0.175 * e, 0.075, 0.09 * e, 0.07 * e, 0.052, 0.09 * e, 0.07 * e, 0.052]
    objs = [_membre_skin(nom + "_torse", pts, aretes, rayons, mat_haut)]
    if jambes:
        pts = [j["bassin"],
               j["hanche", -1], j["genou", -1], j["cheville", -1], j["pied", -1],
               j["hanche", +1], j["genou", +1], j["cheville", +1], j["pied", +1]]
        aretes = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8)]
        rayons = [0.14 * e, 0.112 * e, 0.08 * e, 0.062, 0.052, 0.112 * e, 0.08 * e, 0.062, 0.052]
        objs.append(_membre_skin(nom + "_jambes", pts, aretes, rayons, mat_jambes))
    return objs


def surcot(nom, j, mat, longueur=0.68, largeur=1.0, evasement=0.07, haut=0.07):
    """Surcot (tabard, haubert) : tube de tissu évasé du haut du torse vers le genou.

    UV : u = 0,5 sur le devant (couture dans le dos), u = 0,25 sur le flanc droit (côté caméra) ; v = 1 en haut."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    z_haut = j["poitrine"].z + haut
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
        bande = np.array(C.rgb8(c["meuble"]), dtype=np.float32)
        im[-int(H * 0.09):, :] = bande
        if camp == "omeyyades":
            im[:int(H * 0.06), :] = bande
    Image.fromarray(im.astype(np.uint8)).save(chemin)
    return chemin


def tete(nom, j, mats, casque="nasal", visage=True, bandeau=None):
    """Tête et casque : 'nasal' (casque conique à nasal et coiffe de mailles), 'conique' (casque pointu d'acier
    sombre, bandeau, nasal, camail ouvert sur le visage), 'heaume' (fermé). Le visage reste visible sous le nasal."""
    objs = []
    t = j["tete"]
    f = V((0.02, 0, 0))           # visage avancé : il dépasse de la coiffe
    if visage:
        objs.append(C.sphere(nom + "_visage", 0.1, t + f, mats["peau"], subdiv=3, echelle=(1.0, 0.9, 1.08)))
    if casque == "nasal":
        objs.append(C.cylindre(nom + "_casque_b", 0.113, 0.07, (t.x - 0.01, t.y, t.z + 0.0), mats["acier"], segments=20))
        objs.append(C.cone(nom + "_casque", 0.114, 0.17, (t.x - 0.01, t.y, t.z + 0.07), mats["acier"], segments=20))
        objs.append(C.boite(nom + "_nasal", 0.015, 0.025, 0.11, (t.x + 0.118, t.y, t.z - 0.07), mats["acier"]))
        objs.append(C.sphere(nom + "_coiffe", 0.105, (t.x - 0.075, t.y, t.z - 0.06), mats["maille"], subdiv=2, echelle=(0.85, 1.05, 1.0)))
        objs.append(C.cylindre(nom + "_gorgerin", 0.1, 0.11, (t.x - 0.045, t.y, t.z - 0.21), mats["maille"], segments=14, rayon_haut=0.085))
    elif casque == "conique":
        objs.append(C.cylindre(nom + "_casque_b", 0.113, 0.05, (t.x - 0.01, t.y, t.z + 0.02), mats["acier"], segments=20))
        objs.append(C.cone(nom + "_casque", 0.114, 0.22, (t.x - 0.01, t.y, t.z + 0.07), mats["acier"], segments=20))
        objs.append(C.cylindre(nom + "_bandeau", 0.118, 0.035, (t.x - 0.01, t.y, t.z + 0.035),
                               bandeau or mats["fer"], segments=20))
        objs.append(C.boite(nom + "_nasal", 0.015, 0.025, 0.1, (t.x + 0.118, t.y, t.z - 0.06), mats["acier"]))
        # camail ouvert sur le devant : la maille tombe derrière et sur les côtés
        objs.append(C.cylindre(nom + "_camail", 0.115, 0.16, (t.x - 0.075, t.y, t.z - 0.17), mats["maille"], segments=16,
                               rayon_haut=0.1))
    elif casque == "heaume":
        objs.append(C.cylindre(nom + "_heaume", 0.125, 0.26, (t.x, t.y, t.z - 0.12), mats["acier"], segments=20))
        objs.append(C.sphere(nom + "_heaume_h", 0.125, (t.x, t.y, t.z + 0.13), mats["acier"], subdiv=2, echelle=(1, 1, 0.45)))
        objs.append(C.boite(nom + "_fente", 0.02, 0.2, 0.018, (t.x + 0.12, t.y, t.z + 0.02), mats["fer"]))
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
        im[r > w / 2 - b] = fer
        if camp == "omeyyades":
            # anneau vert sous la bordure de fer
            im[(r > w / 2 - b * 2.4) & (r <= w / 2 - b)] = np.array(C.rgb8(c["meuble"]), dtype=np.float32)
    Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(chemin)
    return chemin


def epee(nom, mats, main, direction, longueur=0.78):
    """Épée tenue à la main, lame suivant direction (pointe en avant et vers le bas : garde basse)."""
    d = V(direction).normalized()
    objs = []
    lame = C.boite(nom + "_lame", longueur, 0.06, 0.02, (0, 0, 0), mats["lame"], base=False)
    _orienter(lame, V(main) + d * (0.06 + longueur / 2), d)
    garde = C.boite(nom + "_garde", 0.035, 0.22, 0.035, (0, 0, 0), mats["fer"], base=False)
    _orienter(garde, V(main) + d * 0.055, d)
    pom = C.sphere(nom + "_pommeau", 0.025, V(main) - d * 0.08, mats["fer"], subdiv=1)
    objs += [lame, garde, pom]
    return objs


def lance(nom, mats, main, direction, longueur=2.6, recul=0.9, fanion=None, fer=0.26):
    """Lance (hampe de bois, fer en feuille) tenue à la main ; longueur totale, fer compris.
    fanion = camp pour un petit fanion (champ uni à bordure, sans meuble : rien qui ressemble à une croix)."""
    d = V(direction).normalized()
    a = V(main) - d * recul
    b = a + d * (longueur - fer)
    objs = [_tube(nom + "_hampe", [a, b], [0.03, 0.026], mats["bois"], segments=8)]
    fe = C.cone(nom + "_fer", 0.045, fer, (0, 0, 0), mats["lame"], segments=8)
    fe.rotation_mode = "QUATERNION"
    fe.rotation_quaternion = d.to_track_quat("Z", "Y")
    fe.location = b
    fe.scale = (1, 0.35, 1)
    objs.append(fe)
    if fanion:
        c = C.CAMPS[fanion]
        m = C.mat_tissu("fanion_" + fanion, c["tissu"])
        bm = bmesh.new()
        base = b - d * 0.1
        nx = 8
        haut_v, bas_v = [], []
        for i in range(nx + 1):
            u = i / nx
            p = base + V((-0.4 * u, 0.04 * math.sin(u * 6), -0.03 * u))
            haut_v.append(bm.verts.new(p))
            larg = 0.2 * (1 - 0.55 * u)
            bas_v.append(bm.verts.new(p - d * larg))
        for i in range(nx):
            f = bm.faces.new((bas_v[i], bas_v[i + 1], haut_v[i + 1], haut_v[i]))
            f.smooth = True
        ob = C.objet_maillage(nom + "_fanion", bm, m)
        ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.01
        objs.append(ob)
    return objs


def arc(nom, mats, main, echelle=1.0):
    """Arc long tenu à la main gauche, corde comprise."""
    pts = []
    for k in range(9):
        t = (k / 8 - 0.5) * 2
        pts.append(V(main) + V((0.13 * (1 - t * t), 0, t * 0.85)) * echelle)
    objs = [_tube(nom + "_arc", pts, [0.016] * 4 + [0.022] + [0.016] * 4, mats["bois"], segments=6)]
    objs.append(_tube(nom + "_corde", [pts[0], V(main) + V((-0.14, 0, 0)) * echelle, pts[-1]], [0.006] * 3, mats["fer"], segments=4))
    return objs


# ---------------------------------------------------------------- soldats complets
def soldat(nom, camp, role, phase=0.0, lacet=-22.0, echelle=1.0, recul_y=0.1):
    """Construit un soldat et renvoie ses objets (déjà orientés et posés à l'origine).

    role : 'fantassin' (épée + écu en amande), 'pietaille' (lance + écu rond ou en amande),
    'homme_armes' (lourd), 'champion' (lourd, plus grand), 'archer' (arc, buste dressé).
    recul_y : la figurine est un peu reculée (vers le nord) pour que ses pieds ne descendent pas sous l'ancrage."""
    mats = matieres(camp)
    sud = camp == "omeyyades"
    if role == "fantassin":
        j = pose_homme(phase, bras_droit=(25, 30), bras_gauche=(18, 78))
    elif role == "pietaille":
        j = pose_homme(phase, bras_droit=(35, 45), bras_gauche=(18, 78))
    elif role == "archer":
        j = pose_homme(phase, bras_droit=(80, 95), bras_gauche=(88, 5), amplitude=4, penche=2)
    else:
        j = pose_homme(phase, bras_droit=(25, 35), bras_gauche=(18, 78), amplitude=15)
    objs = []
    lourd = role in ("homme_armes", "champion")
    jambes = mats["maille"] if lourd else mats["chausses"]
    objs += corps_homme(nom, j, mats["maille"], jambes, epaisseur=1.12 if lourd else 1.0)
    tex = texture_surcot(camp)
    m_sur = C.mat_tissu("surcot_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    if sud:
        # haubert gris visible jusqu'au genou, surcot ivoire plus court, ceinture et galon verts
        objs.append(surcot(nom + "_haubert", j, mats["maille"], longueur=0.66, largeur=1.02, evasement=0.04, haut=0.05))
        objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.45, largeur=1.07, evasement=0.03))
        ceint = mats["vert"]
    else:
        if role != "archer":
            objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.68 if not lourd else 0.7,
                               largeur=1.08 if lourd else 1.0))
        else:
            objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.5, largeur=1.02, evasement=0.04))
        ceint = mats["cuir"]
    zc = j["taille"].z - 0.05 if sud else j["bassin"].z + 0.0
    xc = j["taille"].x + 0.01 if sud else j["bassin"].x + 0.01
    ceinture = C.cylindre(nom + "_ceinture", 0.168 * (1.1 if lourd else 1.0), 0.05, (xc, j["taille"].y, zc), ceint, segments=16)
    ceinture.scale = (0.95, 1.22, 1)
    objs.append(ceinture)
    casque = {"fantassin": "nasal", "pietaille": "conique" if sud else "nasal", "archer": "conique" if sud else "nasal",
              "homme_armes": "conique" if sud else "heaume", "champion": "conique" if sud else "heaume"}[role]
    objs += tete(nom, j, mats, casque, visage=casque != "heaume", bandeau=mats["vert"] if sud else None)
    # bottes
    for cote in (-1, 1):
        objs.append(_tube(nom + "_botte%d" % cote, [j["cheville", cote] + V((0, 0, 0.1)), j["cheville", cote], j["pied", cote]],
                          [0.064, 0.06, 0.05], mats["cuir"], segments=8))
    # armes et écu
    md, mg = j["main", -1], j["main", +1]
    if role in ("fantassin", "champion", "homme_armes"):
        objs += epee(nom, mats, md, V((0.75, -0.1, -0.4)), longueur=0.82 if role == "champion" else 0.74)
    if role == "pietaille":
        # lance tenue devant soi, pointe haute, talon devant les jambes (elle ne les croise plus)
        objs += lance(nom, mats, md, V((0.36, -0.05, 1.0)), longueur=1.95, recul=0.5)
    if role == "archer":
        objs += arc(nom, mats, mg, echelle=1.0)
    if role != "archer":
        if sud:
            ecu = ecu_rond(nom + "_ecu", camp, rayon=0.32 if role != "champion" else 0.36, mats=mats)
            ecu[0].location = mg + V((0.05, -0.02, 0.02))
            ecu[0].rotation_euler = (0, 0, math.radians(-20))
            objs += ecu
        else:
            ecu = ecu_amande(nom + "_ecu", camp, longueur=0.9 if lourd else 0.84)
            ecu.location = mg + V((0.03, -0.02, 0.0))
            ecu.rotation_euler = (0, 0, math.radians(-20))
            objs.append(ecu)
    # orientation commune : un peu tournée vers la caméra
    pv = bpy.data.objects.new(nom + "_pivot", None)
    C.lier(pv)
    for o in objs:
        if o.parent is None:
            o.parent = pv
    pv.rotation_euler = (0, 0, math.radians(lacet))
    pv.scale = (echelle, echelle, echelle)
    pv.location = (0, recul_y, 0)
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
ENCOLURE = [(0.45, 1.38, 0.17, 0.3), (0.62, 1.6, 0.14, 0.23), (0.76, 1.82, 0.11, 0.16), (0.86, 1.98, 0.09, 0.12)]
TETE_CHEVAL = [(0.82, 2.03, 0.075, 0.09), (0.92, 2.02, 0.095, 0.13), (1.04, 1.88, 0.085, 0.11), (1.16, 1.72, 0.07, 0.08),
               (1.22, 1.63, 0.062, 0.068)]


def _lisse01(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def pose_cheval(phase, amplitude=24):
    """Articulations des jambes d'un cheval au pas (allure à quatre temps : postérieur gauche, antérieur gauche,
    postérieur droit, antérieur droit). Chaque jambe est à l'appui 62 % du temps (le sabot recule au sol), puis se lève
    nettement et revient vers l'avant : sur 4 images, une jambe différente est levée à chaque fois."""
    u_cycle = (phase / (2 * math.pi)) % 1.0
    j = {"bob": 0.03 * math.cos(4 * math.pi * u_cycle), "tete": 0.04 * math.sin(4 * math.pi * u_cycle + 0.6)}
    decal = {("post", +1): 0.0, ("ant", +1): 0.25, ("post", -1): 0.5, ("ant", -1): 0.75}
    A = math.radians(amplitude)
    appui = 0.62
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
            haut = V((0.56, 0.15 * cote, 1.02))
            k1 = math.radians(3 + 95 * leve)
            d1 = V((math.sin(swing + 0.15 * leve), 0, -math.cos(swing + 0.15 * leve)))
            genou = haut + d1 * 0.42
            d2 = V((math.sin(swing - k1), 0, -math.cos(swing - k1)))
            boulet = genou + d2 * 0.32
            d3 = V((math.sin(swing - k1 * 0.7 + 0.3), 0, -math.cos(swing - k1 * 0.7 + 0.3)))
            sabot = boulet + d3 * 0.17
        else:
            haut = V((-0.6, 0.16 * cote, 1.1))
            k1 = math.radians(48 + 45 * leve)   # jarret
            d1 = V((math.sin(swing - 0.25 + 0.2 * leve), 0, -math.cos(swing - 0.25 + 0.2 * leve)))
            jarret = haut + d1 * 0.5
            d2 = V((math.sin(swing - 0.25 + k1), 0, -math.cos(swing - 0.25 + k1)))
            boulet = jarret + d2 * 0.4
            d3 = V((math.sin(swing + 0.3 + 0.9 * leve), 0, -math.cos(swing + 0.3 + 0.9 * leve)))
            sabot = boulet + d3 * 0.17
            genou = jarret
        j[av, cote] = (haut, genou, boulet, sabot)
    # posé au sol : le sabot le plus bas touche z = 0,04 ; le corps suit
    bas = min(j[k][3].z for k in decal)
    j["dz"] = 0.04 - bas + j["bob"]
    for k in decal:
        j[k] = tuple(p + V((0, 0, 0.04 - bas + j["bob"])) for p in j[k])
    return j


def _profil(liste, dz=0.0, gonfle=0.0):
    c = [V((x, 0, z + dz)) for (x, z, ry, rz) in liste]
    return c, [ry + gonfle for (x, z, ry, rz) in liste], [rz + gonfle for (x, z, ry, rz) in liste]


def cheval(nom, j, robe="#6b4428", criniere="#2a1b12", balzanes=(("ant", -1), ("post", 1)), chanfrein=None):
    """Cheval bai (volumes lissés) + jambes, crinière et queue ; balzanes claires sur deux pieds ;
    chanfrein : matière d'une plaque de tête (chevaux caparaçonnés). Renvoie les objets."""
    m_robe = C.mat_simple("robe_" + nom, robe, rugosite=0.5, bosse=0.04)
    m_jambe = C.mat_simple("jambe_" + nom, C.melanger(C.couleur(robe), (0.02, 0.015, 0.01, 1), 0.5), rugosite=0.55)
    m_balz = C.mat_simple("balzane_" + nom, "#d9cfbd", rugosite=0.7)
    m_crin = C.mat_simple("crin_" + nom, criniere, rugosite=0.8, bosse=0.3, echelle_bosse=120)
    m_sabot = C.mat_simple("sabot_" + nom, "#2b2420", rugosite=0.6)
    dz = j["dz"] - 0.04
    objs = []
    c, ry, rz = _profil(CORPS_CHEVAL, dz)
    objs.append(_loft(nom + "_corps", c, ry, rz, m_robe, segments=18))
    c, ry, rz = _profil(ENCOLURE, dz + j["tete"] * 0.5)
    objs.append(_loft(nom + "_encolure", c, ry, rz, m_robe, segments=14))
    c, ry, rz = _profil(TETE_CHEVAL, dz + j["tete"])
    objs.append(_loft(nom + "_tete", c, ry, rz, m_robe, segments=12))
    if chanfrein is not None:
        c, ry, rz = _profil(TETE_CHEVAL[1:4], dz + j["tete"], gonfle=0.018)
        objs.append(_loft(nom + "_chanfrein", c, ry, rz, chanfrein, segments=12))
    for (av, cote) in (("ant", 1), ("ant", -1), ("post", 1), ("post", -1)):
        h, g, b, s = j[av, cote]
        h = h + V((0, 0, 0))
        haut_muscle = h + V((0.04 if av == "ant" else 0.0, 0, 0.28))
        if av == "ant":
            objs.append(_tube(nom + "_bras%d" % cote, [haut_muscle, h, g], [0.13, 0.1, 0.065], m_robe, segments=10))
        else:
            objs.append(_tube(nom + "_cuisse%d" % cote, [haut_muscle + V((0.05, 0, 0)), h, g], [0.17, 0.12, 0.065], m_robe, segments=10))
        mj = m_balz if (av, cote) in balzanes else m_jambe
        objs.append(_tube(nom + "_canon%d%s" % (cote, av), [g, b, s], [0.06, 0.05, 0.048], mj, segments=8))
        objs.append(C.sphere(nom + "_boulet%d%s" % (cote, av), 0.058, b, mj, subdiv=2))
        objs.append(C.cylindre(nom + "_sabot%d%s" % (cote, av), 0.062, 0.09, (s.x + 0.01, s.y, s.z - 0.045), m_sabot, segments=10,
                               rayon_haut=0.05))
    e = [V((x, 0, z + dz + j["tete"] * 0.5)) for (x, z, ry, rz) in ENCOLURE]
    cr = [e[0] + V((-0.12, 0, 0.24)), e[1] + V((-0.1, 0, 0.18)), e[2] + V((-0.08, 0, 0.13)), e[3] + V((-0.05, 0, 0.11))]
    objs.append(_tube(nom + "_criniere", cr, [0.05, 0.065, 0.06, 0.04], m_crin, segments=8))
    nuque = V((0.9, 0, 2.1 + dz + j["tete"]))
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


def tapis_selle(nom, camp, j):
    """Tapis de selle (cavalerie légère) : drap du camp bordé de la couleur du meuble, sous la selle."""
    c = C.CAMPS[camp]
    m = C.mat_tissu("tapis_" + camp, c["tissu"])
    dz = j["dz"] - 0.04
    bm = bmesh.new()
    profil = [p for p in CORPS_CHEVAL if -0.45 <= p[0] <= 0.15]
    na = 14
    anneaux = []
    for (x, z, ry, rz) in profil:
        z += dz
        an = []
        for k in range(na + 1):
            a = math.pi * k / na
            ca, sa = math.cos(a), math.sin(a)
            yy = (ry + 0.03) * ca
            zz = z + (rz + 0.03) * sa
            if sa < 0.8:
                chute = (0.8 - sa) / 0.8
                zz = (z + (rz + 0.03) * 0.8) * (1 - chute) + (z - 0.04) * chute
                yy = math.copysign(ry + 0.035, ca)
            an.append(bm.verts.new((x, yy, zz)))
        anneaux.append(an)
    for ix in range(len(profil) - 1):
        for k in range(na):
            f = bm.faces.new((anneaux[ix][k], anneaux[ix + 1][k], anneaux[ix + 1][k + 1], anneaux[ix][k + 1]))
            f.smooth = True
    ob = C.objet_maillage(nom + "_tapis", bm, m)
    ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.02
    # galon : liseré de la couleur du meuble au bas du tapis, sur le flanc vu de la caméra
    x0, x1 = profil[0][0], profil[-1][0]
    ga = C.boite(nom + "_galon_d", x1 - x0 + 0.04, 0.012, 0.05,
                 ((x0 + x1) / 2, -(max(p[2] for p in profil) + 0.05), min(p[1] for p in profil) + dz - 0.06),
                 C.mat_tissu("galon_" + camp, c["meuble"] if camp != "omeyyades" else "#2f6b52"))
    return [ob, ga]


def cavalier(nom, camp, phase=0.0, lacet=-35.0, echelle=1.0, lourd=False, recul_y=0.62):
    """Cheval + cavalier assis, lance couchée et écu.

    lourd : caparaçon complet en deux pans et chanfrein (cavalerie de France) ; sinon tapis de selle : l'anatomie du
    cheval se lit (robe baie, balzanes). Cheval tourné de 35° vers la caméra : il paraît moins long."""
    mats = matieres(camp)
    sud = camp == "omeyyades"
    jc = pose_cheval(phase)
    objs = []
    objs += cheval(nom + "_ch", jc, robe="#6b4428" if not sud else "#7a5232", criniere="#1e140e",
                   chanfrein=mats["acier"] if lourd else None)
    if lourd:
        objs += caparacon(nom, camp, jc)
    else:
        objs += tapis_selle(nom, camp, jc)
    selle_z = 1.13 + jc["dz"] - 0.04 + 0.36
    objs.append(C.boite(nom + "_selle", 0.42, 0.36, 0.1, (-0.02, 0, selle_z - 0.04), mats["cuir"]))
    objs.append(C.boite(nom + "_troussequin", 0.06, 0.3, 0.16, (-0.22, 0, selle_z), mats["cuir"]))
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
    objs += corps_homme(nom + "_h", j, mats["maille"], mats["maille"] if lourd else mats["chausses"], epaisseur=1.05)
    tex = texture_surcot(camp)
    m_sur = C.mat_tissu("surcot_" + camp, C.CAMPS[camp]["tissu"], image_png=tex)
    if sud:
        objs.append(surcot(nom + "_haubert", j, mats["maille"], longueur=0.5, largeur=1.15, evasement=0.04, haut=0.05))
        objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.36, largeur=1.18, evasement=0.03))
    else:
        objs.append(surcot(nom + "_surcot", j, m_sur, longueur=0.42, largeur=1.15))
    objs += tete(nom + "_h", j, mats, "conique" if sud else ("heaume" if lourd else "nasal"), visage=not lourd,
                 bandeau=mats["vert"] if sud else None)
    for cote in (-1, 1):
        objs.append(_tube(nom + "_botte%d" % cote, [j["cheville", cote] + V((0, 0, 0.12)), j["cheville", cote], j["pied", cote]],
                          [0.062, 0.058, 0.048], mats["cuir"], segments=8))
    md, mg = j["main", -1], j["main", +1]
    # lance couchée sous le bras, à droite de la tête du cheval (côté caméra), relevée de 14°
    objs += lance(nom, mats, md + V((0, -0.08, 0)), V((1.0, -0.1, 0.25)), longueur=2.7, recul=1.15, fanion=camp)
    # écu au bras gauche, porté bas contre le flanc gauche du cavalier : il ne masque plus la tête du cheval
    if sud:
        e = ecu_rond(nom + "_ecu", camp, rayon=0.28, mats=mats)
        e[0].location = j["coude", 1] + V((-0.05, 0.12, -0.12))
        e[0].rotation_euler = (0, 0, math.radians(70))
        objs += e
    else:
        e = ecu_amande(nom + "_ecu", camp, longueur=0.74, largeur=0.4)
        e.location = j["coude", 1] + V((-0.05, 0.12, -0.05))
        e.rotation_euler = (0, 0, math.radians(70))
        objs.append(e)
    pv = bpy.data.objects.new(nom + "_pivot", None)
    C.lier(pv)
    for o in objs:
        if o.parent is None:
            o.parent = pv
    pv.rotation_euler = (0, 0, math.radians(lacet))
    pv.scale = (echelle, echelle, echelle)
    pv.location = (-0.12 * echelle, recul_y, 0)
    return objs, pv
