# -*- coding: utf-8 -*-
"""Pièces des menus habillés (lot B, agent B4 ; conception atelier/conception/graphismes-menus.md, sections 3 et 11).

Peu d'images, réutilisées partout par jeu/css/menus.css : une bossette de laiton (clous du menu, boutons ronds, bouts
du rail), le bord de la sangle du menu (border-image), le fanion de l'onglet actif, cinq peaux de bouton (cartouches
dorés à coins rentrants : or, or enfoncé, parchemin, parchemin enfoncé, plomb), un coin doré, quatre sceaux de cire
(case cochée, acquis, à revoir, or), l'embout du rouleau de la galerie et le rail de laiton du chargement.

Toutes vues de dessus, même soleil du nord-ouest (commun.py), rendues au double de la taille logique (commun.ECHELLE),
fond transparent, ombre portée cuite dans l'image (en bas à droite), 2 px transparents au bord (sauf les bords faits
pour se répéter). Dossier : jeu/assets/images/menus/. Budget du dossier : 120 Ko.

Lancer avec le python3 du système (bpy est ajouté par commun.py) :
  cd /home/user/Test && python3 atelier/outils/rendu-3d/menus.py [famille ...] [--dossier D] [--planche]
Familles : laiton sangle fanion peaux coin sceaux rouleau rail (toutes si aucune n'est nommée).
--dossier : écrire ailleurs que dans jeu/ (essai). --planche : refaire seulement la planche de contrôle
(atelier/captures/planche-menus.png : chaque image à 1 × et 2 ×, sur parchemin et sur cuir).
"""
import colorsys
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import expedition_commun as E  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

DOSSIER = os.path.join(C.RACINE, "jeu", "assets", "images", "menus")
PLANCHE = os.path.join(C.RACINE, "atelier", "captures", "planche-menus.png")
PX_PAR_M = 10          # 10 unités logiques par mètre, comme les médaillons des expéditions
SURECH = 2             # rendu à 2 × la taille du fichier, puis réduit (Lanczos)
FILS = 2               # fils de calcul : d'autres agents mesurent en même temps
BUDGET = 120_000       # octets, tout le dossier
LAITON = "#b8933f"     # laiton : un peu plus jaune et plus sombre que l'or d'enluminure

# taille logique (unités) et poids visé (octets) de chaque fichier ; le fichier fait 2 × la taille logique
CATALOGUE = {
    "bossette-laiton": (40, 40, 9000), "sangle-bord": (64, 40, 9000), "fanion": (30, 34, 8000),
    "cartouche-or": (48, 32, 8000), "cartouche-or-appui": (48, 32, 8000), "cartouche-parchemin": (48, 32, 8000),
    "cartouche-parchemin-appui": (48, 32, 8000), "cartouche-plomb": (48, 32, 8000), "coin-dore": (46, 46, 9000),
    "sceau-case": (28, 28, 6000), "sceau-acquis": (28, 28, 6000), "sceau-revoir": (28, 28, 6000), "sceau-or": (28, 28, 6000),
    "embout-rouleau": (20, 40, 5000), "rail-laiton": (48, 16, 5000),
}
# images faites pour se répéter ou se raccorder par un bord : le contrôle des bords transparents ne vaut pas pour elles
BORDS_LIBRES = {"sangle-bord"}
SORTIE = DOSSIER


def scene_ui(w_u, h_u, echantillons=40, ombre=True):
    """Scène vue de dessus pour une pièce de w_u × h_u unités, origine au centre ; lumière commune (soleil du nord-ouest) ;
    sol-capteur d'ombre teinté de parchemin (l'ombre portée tombe en bas à droite, dans l'alpha)."""
    C.reinitialiser()
    C.installer_lumiere(force_ciel=0.55)
    C.lumiere_appoint(0.45)
    C.camera_dessus(0.0, 0.0, w_u / PX_PAR_M, h_u / PX_PAR_M, hauteur_cam=40.0)
    if ombre:
        C.sol_capteur(60.0, teinte=E.PARCHEMIN)
    s = C.reglages_rendu(w_u * C.ECHELLE * SURECH, h_u * C.ECHELLE * SURECH, echantillons=echantillons, transparent=True)
    s.render.threads_mode = "FIXED"
    s.render.threads = FILS
    return s


def rendre(nom):
    t = time.time()
    brut = os.path.join(C.CACHE, "menus-brut-" + nom + ".png")
    img = C._reduire(C.rendre(brut), SURECH)
    w, h, _ = CATALOGUE[nom]
    if img.size != (w * C.ECHELLE, h * C.ECHELLE):
        raise SystemExit("%s : taille %s au lieu de %s" % (nom, img.size, (w * C.ECHELLE, h * C.ECHELLE)))
    chemin = os.path.join(SORTIE, nom + ".png")
    img.save(chemin, optimize=True)
    # au-delà du poids visé, l'image passe en 256 couleurs avec son alpha (de petites pièces : la teinte ne bouge pas)
    if os.path.getsize(chemin) > CATALOGUE[nom][2]:
        img.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(chemin, optimize=True)
    C.journal("%s : %s, %d octets, %.1f s" % (nom, img.size, os.path.getsize(chemin), time.time() - t))
    return Image.open(chemin).convert("RGBA")


# ---------------------------------------------------------------- 1. bossette de laiton (clou, bouton rond, bouts du rail)
def bossette():
    scene_ui(40, 40, echantillons=48)
    m = E.mat_or("laiton", LAITON, rugosite=0.34, metal=0.9)
    m_bord = E.mat_or("laiton_bord", "#7a6232", rugosite=0.55, metal=0.8)
    r = 1.45
    E.disque("collerette", r, 0.10, (0, 0, 0), m_bord, segments=96, biseau=0.04)
    C.sphere("dome", r * 0.78, (0, 0, 0.06), m, subdiv=5, echelle=(1, 1, 0.42))
    E.tore("cerne", r, 0.03, (0, 0, 0.05), E.mat_encre("encre_b"), segments=96, cotes=8)
    return rendre("bossette-laiton")


# ---------------------------------------------------------------- 2. bord de la sangle du menu (border-image, haut et bas)
def sangle_bord():
    """Filet doré en relief, rang de points de couture, sillon gaufré ; en haut et en bas de la toile (10 unités chacun),
    le milieu transparent (le cuir vient de cuir.png). Période horizontale de 8 unités : la bande se répète sans raccord."""
    W_U, H_U = CATALOGUE["sangle-bord"][:2]
    scene_ui(W_U, H_U, echantillons=40, ombre=False)
    m_or = E.mat_or("sb_or", E.OR_METAL, rugosite=0.38, metal=0.85)
    fil = E.mat_teinte("sb_fil", "#b89a62", rugosite=0.8)          # couture moins claire que l'essai (#d9c08a)
    sillon = E.mat_teinte("sb_sillon", "#1e130b", rugosite=0.9)
    cuir = E.mat_cuir("sb_cuir", "#4a2c17")
    w = W_U / PX_PAR_M + 0.4            # un peu plus large que la toile : pas de bout visible
    h2 = H_U / PX_PAR_M / 2
    for sens in (1, -1):
        yb = sens * (h2 - 0.05)
        C.boite("cuir_%d" % sens, w, 0.95, 0.04, (0, sens * (h2 - 0.5), 0), cuir)
        C.boite("filet_%d" % sens, w, 0.16, 0.10, (0, yb - sens * 0.14, 0.02), m_or)
        C.boite("sillon_%d" % sens, w, 0.05, 0.02, (0, yb - sens * 0.85, 0.04), sillon)
        for k in range(8):
            x = -W_U / PX_PAR_M / 2 + 0.4 + k * 0.8
            C.boite("point_%d_%d" % (sens, k), 0.42, 0.075, 0.05, (x, yb - sens * 0.5, 0.05), fil, rot_z=math.radians(8))
    return rendre("sangle-bord")


# ---------------------------------------------------------------- 3. fanion de l'onglet actif
def _anneau_poly(nom, ext, inter, ep, mat, z=0.0, biseau=0.0):
    """Bande plate entre deux contours fermés de même nombre de points, extrudée de ep."""
    bm = bmesh.new()
    vb = [bm.verts.new((x, y, 0)) for x, y in ext]
    vi = [bm.verts.new((x, y, 0)) for x, y in inter]
    n = len(vb)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((vb[i], vb[j], vi[j], vi[i]))
    res = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    for v in [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += ep
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = C.objet_maillage(nom, bm, mat)
    ob.location = (0, 0, z)
    if biseau:
        b = ob.modifiers.new("biseau", "BEVEL")
        b.width = biseau
        b.segments = 3
        b.limit_method = "ANGLE"
    return ob


def fanion():
    """Étoffe rubrique à queue d'aronde, grille fine ondulée (plis doux), bordure dorée en relief, losange d'or au centre,
    barreau de laiton en haut ; l'ombre portée est cuite dans l'image (la feuille n'y met aucun filter)."""
    W_U, H_U = CATALOGUE["fanion"][:2]
    scene_ui(W_U, H_U, echantillons=48)
    w2, haut, bas, encoche = 0.98, 1.30, -1.38, -0.72
    # étoffe : grille u × v projetée sur la queue d'aronde (bords droits, encoche nette), ondulée en z
    nu, nv = 36, 40
    bm = bmesh.new()
    rang = []
    for j in range(nv + 1):
        v = j / nv
        ligne = []
        for i in range(nu + 1):
            u = i / nu
            yb = bas + (encoche - bas) * (1 - abs(2 * u - 1))
            x = -w2 + 2 * w2 * u
            y = haut - v * (haut - yb)
            z = 0.05 + 0.045 * math.sin(2 * math.pi * (u * 1.6 + 0.15)) * (0.35 + 0.65 * v) + 0.02 * math.sin(2 * math.pi * v * 1.3)
            ligne.append(bm.verts.new((x, y, z)))
        rang.append(ligne)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((rang[j][i], rang[j + 1][i], rang[j + 1][i + 1], rang[j][i + 1]))
    for f in bm.faces:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    m_tissu = C.mat_tissu("fanion_tissu", "#8c2f39", rugosite=0.95, brillance=0.15)
    for n in m_tissu.node_tree.nodes:   # pas d'éclat blanc sur la crête d'un pli
        if n.type == "BSDF_PRINCIPLED":
            n.inputs["Specular IOR Level"].default_value = 0.08
    etoffe = C.objet_maillage("etoffe", bm, m_tissu, lisse=True)
    sol = etoffe.modifiers.new("epaisseur", "SOLIDIFY")
    sol.thickness = 0.03
    # bordure dorée (bande de 0,11 m sur le bord) et filet intérieur, posés au-dessus des plis
    def contour(d):
        k = d * 1.9  # l'encoche se rentre plus (angle aigu)
        return [(-w2 + d, haut - d), (w2 - d, haut - d), (w2 - d, bas + d * 1.2), (0.0, encoche + k), (-w2 + d, bas + d * 1.2)]
    m_or = E.mat_or("fanion_or", E.OR_METAL, rugosite=0.36, metal=0.85)
    _anneau_poly("bordure", contour(0.0), contour(0.12), 0.035, m_or, z=0.10, biseau=0.012)
    _anneau_poly("filet", contour(0.22), contour(0.255), 0.02, m_or, z=0.10)
    # losange d'or au centre, cerné d'encre
    ly = 0.22
    los = [(0, ly + 0.42), (0.27, ly), (0, ly - 0.42), (-0.27, ly)]
    bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y, 0)) for x, y in los])
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += 0.06
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    lo = C.objet_maillage("losange", bm, m_or)
    lo.location = (0, 0, 0.11)
    b = lo.modifiers.new("biseau", "BEVEL")
    b.width = 0.05
    b.segments = 3
    _anneau_poly("losange_cerne", [(0, ly + 0.47), (0.31, ly), (0, ly - 0.47), (-0.31, ly)], los, 0.03, E.mat_encre("fanion_encre"), z=0.10)
    # franges d'or au bas des deux queues
    for cote in (-1, 1):
        for k in range(7):
            t = (k + 0.5) / 7
            x = cote * w2 * (1 - t)
            y = bas + (encoche - bas) * t
            C.sphere("frange_%d_%d" % (cote, k), 0.045, (x, y - 0.03, 0.11), m_or, subdiv=2)
    # barreau de laiton (hampe couchée) et ses deux pommeaux
    m_l = E.mat_or("fanion_laiton", LAITON, rugosite=0.32, metal=0.9)
    barre = C.cylindre("barreau", 0.10, 2 * w2 + 0.16, (-(w2 + 0.08), haut + 0.07, 0.16), m_l, segments=24)
    barre.rotation_euler = (0.0, math.radians(90), 0.0)
    for cote in (-1, 1):
        C.sphere("pommeau_%d" % cote, 0.12, (cote * (w2 + 0.1), haut + 0.07, 0.16), m_l, subdiv=3)
    return rendre("fanion")


# ---------------------------------------------------------------- 4. peaux des boutons : cartouches à coins rentrants
def contour_rentrant(w2, h2, r, b=0.0, n=8):
    """Contour d'un rectangle à coins rentrants (quart de cercle creusé de rayon r centré sur chaque coin), rentré de b
    (bords décalés de b, arcs de rayon r + b), sens trigonométrique ; n + 1 points par coin."""
    rad = r + b
    d = math.degrees(math.asin(b / rad)) if b else 0.0
    pts = []
    for cx, cy, a0 in ((w2, -h2, 90), (w2, h2, 180), (-w2, h2, 270), (-w2, -h2, 0)):
        for k in range(n + 1):
            a = math.radians(a0 + 90 - d - (90 - 2 * d) * k / n)
            pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return pts


def anneau_rentrant(nom, w, h, r, b1, b2, ep, mat, z=0.0, biseau=0.0, n=8):
    ob = _anneau_poly(nom, contour_rentrant(w / 2, h / 2, r, b1, n), contour_rentrant(w / 2, h / 2, r, b2, n), ep, mat, z=z)
    if biseau:
        bv = ob.modifiers.new("biseau", "BEVEL")
        bv.width = biseau
        bv.segments = 4
        bv.limit_method = "ANGLE"
        bv.profile = 0.7
    return ob


def mat_degrade(nom, haut, bas, metal=0.6, rugosite=0.5, h=1.0):
    """Face d'or ou de parchemin : dégradé vertical (clair en haut, plus sombre en bas), comme une face bombée. Le dégradé
    est vertical seulement : le milieu de la peau s'étire en largeur sans que rien ne se voie."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["Object"], sep.inputs[0])
    mr = N("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -h / 2
    mr.inputs["From Max"].default_value = h / 2
    L(sep.outputs["Y"], mr.inputs["Value"])
    mix = N("ShaderNodeMix")
    mix.data_type = "RGBA"
    L(mr.outputs["Result"], C._entree(mix, "Factor", "VALUE"))
    C._entree(mix, "A", "RGBA").default_value = C.couleur(bas)
    C._entree(mix, "B", "RGBA").default_value = C.couleur(haut)
    L(C._sortie(mix, "RGBA"), p.inputs["Base Color"])
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rugosite
    return m


# (haut de la face, bas de la face, métal, rugosité, enfoncement, teinte du cadre, rugosité du cadre, métal du cadre)
# Réglages de l'essai corrigés : parchemin plus chaud (l'essai tirait sur le gris), arêtes des coins moins vives
# (cadre moins poli, biseau plus étroit), plomb mat (critique : il ne doit pas se lire comme de l'argent).
PEAUX = {"cartouche-or": ("#f4d06a", "#a8791d", 0.65, 0.42, 0.0, E.OR_METAL, 0.46, 0.8),
         "cartouche-or-appui": ("#d0ad55", "#93702a", 0.65, 0.5, -0.06, E.OR_METAL, 0.5, 0.8),   # assez clair pour l'encre (4,5 : 1)
         "cartouche-parchemin": ("#f5d999", "#d8b06a", 0.0, 0.85, 0.0, E.OR_METAL, 0.46, 0.8),
         "cartouche-parchemin-appui": ("#dcb874", "#b88f4e", 0.0, 0.9, -0.06, E.OR_METAL, 0.5, 0.8),
         "cartouche-plomb": ("#b1aea6", "#8b8880", 0.05, 0.9, 0.0, "#7b7c80", 0.75, 0.45)}


def peau(nom):
    """Bouton entier vu de dessus, 48 × 32 unités : liseré d'encre, moulure dorée (ou de plomb) à coins rentrants, filet
    d'encre, face bombée. Tranches de 12 unités pour border-image : tout le cadre y tient, le milieu est uni."""
    haut, bas, metal, rug, enfonce, cadre, rug_c, metal_c = PEAUX[nom]
    W_U, H_U = CATALOGUE[nom][:2]
    scene_ui(W_U, H_U, echantillons=40)
    w, h, r = (W_U - 4.4) / PX_PAR_M, (H_U - 4.4) / PX_PAR_M, 0.5
    enc = E.mat_encre(nom + "_encre")
    m_cadre = E.mat_or(nom + "_cadre", cadre, rugosite=rug_c, metal=metal_c)
    anneau_rentrant(nom + "_cerne", w, h, r, 0.0, 0.08, 0.12, enc)
    anneau_rentrant(nom + "_moulure", w, h, r, 0.06, 0.40, 0.18, m_cadre, biseau=0.06)
    anneau_rentrant(nom + "_filet", w, h, r, 0.40, 0.45, 0.08, enc)
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0)) for x, y in contour_rentrant(w / 2, h / 2, r, 0.43)]
    f = bm.faces.new(vs)
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += 0.1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    face = C.objet_maillage(nom + "_face", bm, mat_degrade(nom + "_f", haut, bas, metal, rug, h=h - 0.8))
    face.location = (0, 0, enfonce)
    return rendre(nom)


# ---------------------------------------------------------------- 5. coin doré (équerre, volute, petit fleuron)
def coin():
    scene_ui(46, 46, echantillons=40)
    m_or = E.mat_or("coin_or", E.OR_METAL, rugosite=0.38, metal=0.85)
    enc = E.mat_encre("coin_encre")
    L, ep = 3.5, 0.30
    x0, y0 = -1.95, 1.95                    # coin haut-gauche (la toile fait 4,6 m)
    C.boite("branche_h", L, ep, 0.14, (x0 + L / 2, y0, 0), m_or)
    C.boite("branche_v", ep, L, 0.14, (x0, y0 - L / 2, 0), m_or)
    E.tore("volute", 0.55, 0.11, (x0 + 0.9, y0 - 0.9, 0.05), m_or, segments=48, cotes=10)
    C.sphere("bouton", 0.30, (x0 + 0.9, y0 - 0.9, 0.06), m_or, subdiv=4, echelle=(1, 1, 0.6))
    # fleuron : trois feuilles en amande qui partent de la volute, vers l'intérieur de la feuille
    for k, (ang, long, larg) in enumerate(((-45, 0.42, 0.15), (-12, 0.30, 0.11), (-78, 0.30, 0.11))):
        a = math.radians(ang)
        d = 0.55 + 0.12 + long
        fe = C.sphere("feuille_%d" % k, 1.0, (x0 + 0.9 + d * math.cos(a), y0 - 0.9 + d * math.sin(a), 0.03), m_or, subdiv=3,
                      echelle=(long, larg, 0.07))
        fe.rotation_euler.z = a
    C.sphere("perle_h", 0.15, (x0 + L + 0.05, y0, 0.05), m_or, subdiv=3)
    C.sphere("perle_v", 0.15, (x0, y0 - L - 0.05, 0.05), m_or, subdiv=3)
    C.boite("filet_h", L - 0.7, 0.06, 0.05, (x0 + 0.45 + (L - 0.7) / 2, y0 - 0.32, 0), enc)
    C.boite("filet_v", 0.06, L - 0.7, 0.05, (x0 + 0.32, y0 - 0.45 - (L - 0.7) / 2, 0), enc)
    return rendre("coin-dore")


# ---------------------------------------------------------------- 6. sceaux de cire (case cochée, états des cours)
# (cire, ombre, reflet de la plaque), icône, emblème posé en plaque ; teinte attendue du centre à 22 px (degrés)
SCEAUX = {"sceau-case": (("#74202b", "#3d0f16", "#e2c272"), "lys", True, (340, 20)),
          "sceau-acquis": (("#2f7424", "#123508", "#efdc98"), "lys", True, (90, 130)),     # critique : vert franc
          "sceau-revoir": (("#b0402a", "#4e140a", "#e2c272"), None, False, (0, 20)),        # critique : brique, sans emblème
          "sceau-or": (("#b8923c", "#5e4514", "#f3e3b0"), "lys", True, (30, 50))}


def sceaux(noms=tuple(SCEAUX)):
    for nom in noms:
        teintes, icone, embleme, _ = SCEAUX[nom]
        scene_ui(28, 28, echantillons=40)
        E.sceau_cire("sceau", rayon=1.1, epaisseur=0.22, teintes=teintes, icone=icone, graine=5, embleme=embleme)
        rendre(nom)


# ---------------------------------------------------------------- 7. embout du rouleau (bâton tourné, debout)
def rouleau():
    """Bâton de bois tourné vu de dessus, debout dans la toile (20 × 40 unités), pommeau doré en haut et en bas. La feuille
    le pose en border-image vertical (tranches de 12 unités en haut et en bas, milieu étiré : le fût est uni en hauteur)."""
    W_U, H_U = CATALOGUE["embout-rouleau"][:2]
    scene_ui(W_U, H_U, echantillons=40)
    bois = E.mat_bois("rouleau_bois", "#7a4e2a")
    m_or = E.mat_or("rouleau_or", E.OR_METAL, rugosite=0.36, metal=0.85)
    long = H_U / PX_PAR_M - 2.5
    fut = C.cylindre("fut", 0.36, long, (0, -long / 2, 0.30), bois, segments=32)
    fut.rotation_euler = (math.radians(-90), 0.0, 0.0)
    for sens in (1, -1):
        y = sens * (long / 2 + 0.02)
        bague = C.cylindre("bague_%d" % sens, 0.50, 0.16, (0, y - 0.08 * (1 + sens), 0.30), m_or, segments=32)
        bague.rotation_euler = (math.radians(-90), 0.0, 0.0)
        C.sphere("pommeau_%d" % sens, 0.40, (0, y + sens * 0.26, 0.30), m_or, subdiv=4, echelle=(1, 0.72, 0.9))
    return rendre("embout-rouleau")


# ---------------------------------------------------------------- 8. rail de laiton (chargement, curseur)
def rail():
    """Rainure en ovale allongé : rebord de laiton cerné d'encre, fond creusé sombre. La feuille le pose en border-image
    horizontal (tranches de 8 unités à gauche et à droite, milieu étiré : le rail est uni en largeur)."""
    W_U, H_U = CATALOGUE["rail-laiton"][:2]
    scene_ui(W_U, H_U, echantillons=40)
    w, h = (W_U - 4.4) / PX_PAR_M, (H_U - 4.4) / PX_PAR_M
    m_l = E.mat_or("rail_laiton", LAITON, rugosite=0.38, metal=0.88)
    fond = E.mat_teinte("rail_fond", "#24160b", rugosite=0.8)

    def ovale(w2, h2, n=12):
        r = h2
        pts = []
        for k in range(n + 1):
            a = math.radians(-90 + 180 * k / n)
            pts.append((w2 - r + r * math.cos(a), r * math.sin(a)))
        for k in range(n + 1):
            a = math.radians(90 + 180 * k / n)
            pts.append((-w2 + r + r * math.cos(a), r * math.sin(a)))
        return pts
    _anneau_poly("rail_cerne", ovale(w / 2, h / 2), ovale(w / 2 - 0.07, h / 2 - 0.07), 0.12, E.mat_encre("rail_encre"))
    _anneau_poly("rail_rebord", ovale(w / 2 - 0.05, h / 2 - 0.05), ovale(w / 2 - 0.30, h / 2 - 0.30), 0.16, m_l, biseau=0.05)
    bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y, 0)) for x, y in ovale(w / 2 - 0.28, h / 2 - 0.28)])
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += 0.03
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    C.objet_maillage("rail_fond", bm, fond)
    return rendre("rail-laiton")


FAMILLES = {"laiton": bossette, "sangle": sangle_bord, "fanion": fanion, "peaux": lambda: [peau(n) for n in PEAUX],
            "coin": coin, "sceaux": sceaux, "rouleau": rouleau, "rail": rail}


# ---------------------------------------------------------------- contrôles
def teinte_moyenne(img, taille):
    """Teinte (degrés), saturation et clarté (TSL) moyennes de la cire d'un sceau, réduit à sa taille d'emploi (Lanczos) :
    les mêmes mesures que la critique (graphismes-menus.md, section 3)."""
    p = img.convert("RGBa").resize((taille, taille), Image.LANCZOS).convert("RGBA")
    a = np.asarray(p, dtype=np.float64) / 255.0
    m = a[..., 3] > 0.9
    rgb = a[..., :3][m].mean(axis=0)
    h, l, s = colorsys.rgb_to_hls(*rgb)
    return h * 360.0, s, l


def controler():
    """Bords transparents, blancs brûlés, poids et budget ; milieu uni des peaux ; teintes des sceaux à 22 px."""
    fautes, total = [], 0
    for nom, (w, h, vise) in CATALOGUE.items():
        chemin = os.path.join(SORTIE, nom + ".png")
        if not os.path.exists(chemin):
            fautes.append(nom + " : absent")
            continue
        img = Image.open(chemin).convert("RGBA")
        poids = os.path.getsize(chemin)
        total += poids
        if poids > vise * 1.25:
            fautes.append("%s : %d octets (visé %d)" % (nom, poids, vise))
        a = np.asarray(img)
        if nom not in BORDS_LIBRES:
            bord = max(a[:2, :, 3].max(), a[-2:, :, 3].max(), a[:, :2, 3].max(), a[:, -2:, 3].max())
            if bord > 16:   # 16 : la pénombre du sol-capteur, invisible
                fautes.append("%s : bord touché (alpha %d)" % (nom, bord))
        p = C.part_blancs(img)
        if p > 0.01:
            fautes.append("%s : blancs brûlés %.1f %%" % (nom, p * 100))
        if nom.startswith("cartouche"):
            # milieu (hors tranches de 12 unités = 24 px) : chaque rangée doit être unie en largeur (l'étirement ne se voit pas)
            m = a[24:-24, 24:-24, :3].astype(np.float64)
            ecart = float(np.abs(m - m.mean(axis=1, keepdims=True)).max()) / 255.0
            hsv = np.array([colorsys.rgb_to_hsv(*(px / 255.0)) for px in m.reshape(-1, 3)])
            eh = float(np.ptp(hsv[:, 0])) if hsv[:, 1].mean() > 0.15 else 0.0
            C.journal("%s : écart en largeur %.3f, écart de teinte %.3f" % (nom, ecart, eh))
            if ecart > 0.04 or eh > 0.02:
                fautes.append("%s : milieu pas uni (largeur %.3f, teinte %.3f)" % (nom, ecart, eh))
            if a[24:-24, 24:-24, 3].min() < 250:
                fautes.append("%s : milieu transparent" % nom)
        if nom in SCEAUX:
            h_deg, s, lum = teinte_moyenne(img, 22)
            lo, hi = SCEAUX[nom][3]
            dans = (lo <= h_deg <= hi) if lo < hi else (h_deg >= lo or h_deg <= hi)
            C.journal("%s à 22 px : teinte %.0f°, saturation %.2f, clarté %.2f" % (nom, h_deg, s, lum))
            if not dans or s < 0.3:
                fautes.append("%s : teinte %.0f° (attendu %d à %d), saturation %.2f" % (nom, h_deg, lo, hi, s))
    acq = os.path.join(SORTIE, "sceau-acquis.png")
    rev = os.path.join(SORTIE, "sceau-revoir.png")
    if os.path.exists(acq) and os.path.exists(rev):
        la = teinte_moyenne(Image.open(acq), 22)[2]
        lr = teinte_moyenne(Image.open(rev), 22)[2]
        if lr - la < 0.05:
            fautes.append("à revoir pas assez plus clair que acquis (%.2f contre %.2f)" % (lr, la))
    C.journal("dossier : %d octets (budget %d)" % (total, BUDGET))
    if total > BUDGET:
        fautes.append("budget dépassé : %d octets" % total)
    return fautes


# ---------------------------------------------------------------- planche de contrôle
def planche():
    """Chaque image à 1 × (taille logique) et à 2 ×, sur parchemin clair et sur le cuir du jeu, avec son nom."""
    parch = Image.open(os.path.join(C.RACINE, "jeu", "assets", "images", "parchemin.png")).convert("RGB")
    cuir = Image.open(os.path.join(C.RACINE, "jeu", "assets", "images", "cuir.png")).convert("RGB")
    noms = list(CATALOGUE)
    col_w, ligne_h, marge = 330, 0, 16
    rangs = []
    for nom in noms:
        w, h, _ = CATALOGUE[nom]
        rangs.append(max(2 * h, 60) + 26)
    H = sum(rangs) + marge * 2
    W = col_w * 2 + marge * 3
    fond = Image.new("RGB", (W, H), (40, 28, 18))
    for x0, tex in ((marge, parch), (marge * 2 + col_w, cuir)):
        for yy in range(marge, H - marge, tex.size[1]):
            for xx in range(x0, x0 + col_w, tex.size[0]):
                fond.paste(tex.crop((0, 0, min(tex.size[0], x0 + col_w - xx), min(tex.size[1], H - marge - yy))), (xx, yy))
    d = ImageDraw.Draw(fond)
    y = marge + 4
    for nom, rh in zip(noms, rangs):
        chemin = os.path.join(SORTIE, nom + ".png")
        if os.path.exists(chemin):
            img = Image.open(chemin).convert("RGBA")
            w, h, _ = CATALOGUE[nom]
            un = img.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA")
            for x0, encre in ((marge, (46, 36, 25)), (marge * 2 + col_w, (238, 223, 182))):
                fond.paste(un, (x0 + 10, y + 18), un)
                fond.paste(img, (x0 + 30 + w, y + 18), img)
                d.text((x0 + 10, y + 2), "%s  (%d octets)" % (nom, os.path.getsize(chemin)), fill=encre)
        y += rh
    os.makedirs(os.path.dirname(PLANCHE), exist_ok=True)
    fond.save(PLANCHE, optimize=True)
    C.journal("planche : " + os.path.relpath(PLANCHE, C.RACINE))


def main(args):
    global SORTIE, PLANCHE
    if "--dossier" in args:
        i = args.index("--dossier")
        SORTIE = os.path.abspath(args[i + 1])
        del args[i:i + 2]
    os.makedirs(SORTIE, exist_ok=True)
    if SORTIE != DOSSIER:
        PLANCHE = os.path.join(SORTIE, "planche-menus.png")
    if "--planche" in args:
        planche()
        return 0
    familles = [a for a in args if not a.startswith("--")] or list(FAMILLES)
    t = time.time()
    for f in familles:
        FAMILLES[f]()
    C.journal("rendus : %.0f s" % (time.time() - t))
    planche()
    fautes = controler()
    for f in fautes:
        C.journal("CONTRÔLE : " + f)
    return 1 if fautes else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
