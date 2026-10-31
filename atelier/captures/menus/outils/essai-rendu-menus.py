# -*- coding: utf-8 -*-
"""Essais de rendu des pièces des menus (bossette de laiton, sceau de case, cadre de cartouche à pans coupés,
coin doré, fanion, sangle de cuir). Tout est écrit dans le dossier d'essai (rien dans jeu/ ni dans le cache).
Lancer : python3 essai_menus.py [bossette sceaux cadre coin fanion sangle]"""
import math
import os
import sys
import time

sys.path.insert(0, "/home/user/Test/atelier/outils/rendu-3d")
import commun as C  # noqa: E402
import expedition_commun as E  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageFilter  # noqa: E402

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "rendus-essai")
os.makedirs(SORTIE, exist_ok=True)
PX_PAR_M = 10          # 10 unités logiques par mètre, comme les médaillons des expéditions
SURECH = 2
LAITON = "#b8933f"     # laiton : un peu plus jaune et plus sombre que l'or d'enluminure
FILS = 2               # fils de calcul : un autre rendu tourne en même temps


def scene_ui(w_u, h_u, echantillons=40, ombre=True, opaque=False):
    """Scène vue de dessus pour une pièce d'interface de w_u × h_u unités logiques, origine au centre ; lumière commune
    (soleil du nord-ouest) ; sol-capteur d'ombre (l'ombre portée tombe en bas à droite, dans l'alpha)."""
    C.reinitialiser()
    C.installer_lumiere(force_ciel=0.55)
    C.lumiere_appoint(0.45)
    C.camera_dessus(0.0, 0.0, w_u / PX_PAR_M, h_u / PX_PAR_M, hauteur_cam=40.0)
    if ombre and not opaque:
        C.sol_capteur(60.0, teinte=E.PARCHEMIN)
    s = C.reglages_rendu(w_u * C.ECHELLE * SURECH, h_u * C.ECHELLE * SURECH, echantillons=echantillons, transparent=not opaque)
    s.render.threads_mode = "FIXED"
    s.render.threads = FILS
    return s


def rendre(nom, opaque=False):
    t = time.time()
    img = C.rendre(os.path.join(SORTIE, "_brut-" + nom + ".png"))
    img = C._reduire(img, SURECH)
    if opaque:
        img = img.convert("RGB")
    chemin = os.path.join(SORTIE, nom + (".jpg" if opaque else ".png"))
    if opaque:
        img.save(chemin, quality=86, optimize=True)
    else:
        img.save(chemin, optimize=True)
    print("%s : %s, %d octets, %.1f s" % (nom, img.size, os.path.getsize(chemin), time.time() - t))
    return img


# ---------------------------------------------------------------- bossette de laiton (clou, bouton rond, curseur)
def bossette():
    scene_ui(40, 40, echantillons=48)
    m = E.mat_or("laiton", LAITON, rugosite=0.34, metal=0.9)
    m_bord = E.mat_or("laiton_bord", "#7a6232", rugosite=0.55, metal=0.8)
    r = 1.45
    objets = [E.disque("collerette", r, 0.10, (0, 0, 0), m_bord, segments=96, biseau=0.04),
              C.sphere("dome", r * 0.78, (0, 0, 0.06), m, subdiv=5, echelle=(1, 1, 0.42)),
              E.tore("cerne", r, 0.03, (0, 0, 0.05), E.mat_encre("encre_b"), segments=96, cotes=8)]
    return rendre("bossette-laiton")


# ---------------------------------------------------------------- sceaux de cire (case cochée, matière)
CIRES = {"sceau-case": (("#74202b", "#3d0f16", "#e2c272"), "lys"),
         "sceau-histoire": (("#6b2d5c", "#33122b", "#e2c272"), "lys"),
         "sceau-anglais": (("#2a7470", "#0f3533", "#e2c272"), "lys"),
         "sceau-acquis": (("#4f6b32", "#22300f", "#e2c272"), "lys"),
         "sceau-revoir": (("#9a4a32", "#4a1f12", "#e2c272"), None),
         "sceau-or": (("#b8923c", "#5e4514", "#f3e3b0"), "lys")}


def sceaux(noms=("sceau-case", "sceau-histoire", "sceau-anglais", "sceau-acquis", "sceau-revoir", "sceau-or")):
    for nom in noms:
        teintes, icone = CIRES[nom]
        scene_ui(28, 28, echantillons=40)
        E.sceau_cire("sceau", rayon=1.1, epaisseur=0.22, teintes=teintes, icone=icone, graine=5)
        rendre(nom)


# ---------------------------------------------------------------- cadre de cartouche à pans coupés (border-image)
def anneau_pans(nom, w, h, bande, pan, ep, mat, z=0.0, biseau=0.0):
    """Cadre rectangulaire à pans coupés (largeur w, hauteur h, en m, centré), bande de « bande » m, épaisseur ep."""
    def contour(w2, h2, p):
        return [(-w2 + p, -h2), (w2 - p, -h2), (w2, -h2 + p), (w2, h2 - p), (w2 - p, h2), (-w2 + p, h2), (-w2, h2 - p), (-w2, -h2 + p)]
    ext = contour(w / 2, h / 2, pan)
    inter = contour(w / 2 - bande, h / 2 - bande, max(0.0, pan - bande * 0.41))
    bm = bmesh.new()
    vb = [bm.verts.new((x, y, 0)) for x, y in ext]
    vi = [bm.verts.new((x, y, 0)) for x, y in inter]
    for i in range(8):
        j = (i + 1) % 8
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
        b.segments = 4
        b.limit_method = "ANGLE"
        b.profile = 0.7
    return ob


def cadre(nom="cadre-or", teinte=E.OR_METAL, sombre="#6e5320"):
    W_U, H_U = 48, 32                      # toile ; tranches de 12 unités pour border-image
    scene_ui(W_U, H_U, echantillons=40)
    w, h = (W_U - 4) / PX_PAR_M, (H_U - 4) / PX_PAR_M   # 2 unités de marge (l'ombre et le bord transparent)
    m_or = E.mat_or(nom + "_or", teinte, rugosite=0.36, metal=0.85)
    m_fond = E.mat_or(nom + "_fond", sombre, rugosite=0.55, metal=0.7)
    enc = E.mat_encre(nom + "_encre")
    anneau_pans(nom + "_cerne", w, h, 0.07, 0.42, 0.10, enc)                       # liseré d'encre extérieur
    anneau_pans(nom + "_moulure", w - 0.10, h - 0.10, 0.42, 0.38, 0.16, m_or, biseau=0.12)  # moulure dorée
    anneau_pans(nom + "_gorge", w - 0.92, h - 0.92, 0.06, 0.20, 0.06, m_fond)      # gorge sombre intérieure
    anneau_pans(nom + "_filet", w - 1.04, h - 1.04, 0.05, 0.16, 0.05, enc)         # filet d'encre du bord de la face
    return rendre(nom)


# ---------------------------------------------------------------- coin doré (rinceau en relief, découpé dans l'icône du SVG actuel)
def coin():
    scene_ui(46, 46, echantillons=40)
    m_or = E.mat_or("coin_or", E.OR_METAL, rugosite=0.36, metal=0.85)
    enc = E.mat_encre("coin_encre")
    # équerre à volute : deux branches et un fleuron, en tubes et plaques (pas d'icône : forme propre au jeu)
    objets = []
    L, ep = 3.6, 0.32
    x0, y0 = -2.0, 2.0                      # coin haut-gauche (unités : m ; la toile fait 4,6 m)
    objets.append(C.boite("branche_h", L, ep, 0.14, (x0 + L / 2, y0, 0), m_or))
    objets.append(C.boite("branche_v", ep, L, 0.14, (x0, y0 - L / 2, 0), m_or))
    objets.append(E.tore("volute", 0.55, 0.11, (x0 + 0.9, y0 - 0.9, 0.05), m_or, segments=48, cotes=10))
    objets.append(C.sphere("bouton", 0.32, (x0 + 0.9, y0 - 0.9, 0.06), m_or, subdiv=4, echelle=(1, 1, 0.6)))
    objets.append(C.sphere("perle_h", 0.16, (x0 + L + 0.05, y0, 0.05), m_or, subdiv=3))
    objets.append(C.sphere("perle_v", 0.16, (x0, y0 - L - 0.05, 0.05), m_or, subdiv=3))
    objets.append(C.boite("filet_h", L - 0.6, 0.07, 0.05, (x0 + 0.4 + (L - 0.6) / 2, y0 - 0.32, 0), enc))
    objets.append(C.boite("filet_v", 0.07, L - 0.6, 0.05, (x0 + 0.32, y0 - 0.4 - (L - 0.6) / 2, 0), enc))
    return rendre("coin-dore")


# ---------------------------------------------------------------- bords de la sangle (border-image, haut et bas)
def sangle_bord():
    """Bord de la sangle du menu : filet doré en relief, rang de points de couture, sillon gaufré ; le haut et le bas de la
    toile (10 unités chacun), le milieu transparent : le cuir vient de cuir.png. Période horizontale de 8 unités."""
    W_U, H_U = 64, 40
    scene_ui(W_U, H_U, echantillons=40, ombre=False)
    m_or = E.mat_or("sb_or", E.OR_METAL, rugosite=0.38, metal=0.85)
    fil = E.mat_teinte("sb_fil", "#d9c08a", rugosite=0.8)
    sillon = E.mat_teinte("sb_sillon", "#1e130b", rugosite=0.9)
    cuir = E.mat_cuir("sb_cuir", "#4a2c17")
    w = W_U / PX_PAR_M + 0.4            # un peu plus large que la toile : pas de bout visible
    h2 = H_U / PX_PAR_M / 2
    for sens in (1, -1):
        yb = sens * (h2 - 0.05)          # le bord
        C.boite("cuir_%d" % sens, w, 0.95, 0.04, (0, sens * (h2 - 0.5), 0), cuir)          # le bord de la sangle (un peu plus clair)
        C.boite("filet_%d" % sens, w, 0.16, 0.10, (0, yb - sens * 0.14, 0.02), m_or)      # filet doré
        C.boite("sillon_%d" % sens, w, 0.05, 0.02, (0, yb - sens * 0.85, 0.04), sillon)    # sillon gaufré
        for k in range(8):                                                                 # points de couture
            x = -W_U / PX_PAR_M / 2 + 0.4 + k * 0.8
            C.boite("point_%d_%d" % (sens, k), 0.42, 0.075, 0.05, (x, yb - sens * 0.5, 0.05), fil, rot_z=math.radians(8))
    return rendre("sangle-bord")


# ---------------------------------------------------------------- peau de bouton (cadre + face) pour border-image ... fill
PEAUX = {"cartouche-or": ("or", "#c9a24a", 0.0), "cartouche-or-appui": ("or", "#9a7a2e", -0.07),
         "cartouche-parchemin": ("parchemin", "#f1e4c3", 0.0), "cartouche-parchemin-appui": ("parchemin", "#d9c79c", -0.07),
         "cartouche-plomb": ("plomb", "#a19f97", 0.0)}


def peau(nom):
    """Bouton entier vu de dessus, 48 × 32 unités : liseré d'encre, moulure dorée (ou de plomb) à pans coupés, face en
    coussin (or satiné, parchemin, plomb mat). Tranches de 12 unités : le milieu est uni (étiré sans se voir)."""
    genre, teinte, enfonce = PEAUX[nom]
    W_U, H_U = 48, 32
    scene_ui(W_U, H_U, echantillons=40)
    w, h = (W_U - 3) / PX_PAR_M, (H_U - 3) / PX_PAR_M
    if genre == "plomb":
        m_cadre = E.mat_or(nom + "_cadre", "#7d7f86", rugosite=0.55, metal=0.7)
        m_face = E.mat_teinte(nom + "_face", teinte, rugosite=0.85)
    else:
        m_cadre = E.mat_or(nom + "_cadre", E.OR_METAL, rugosite=0.36, metal=0.85)
        m_face = (E.mat_or(nom + "_face", teinte, rugosite=0.5, metal=0.6) if genre == "or"
                  else E.mat_parchemin(nom + "_face", teinte, grain=0.25, echelle=9.0, fibres=False))
    enc = E.mat_encre(nom + "_encre")
    anneau_pans(nom + "_cerne", w, h, 0.07, 0.36, 0.12, enc)
    anneau_pans(nom + "_moulure", w - 0.10, h - 0.10, 0.34, 0.32, 0.18, m_cadre, biseau=0.11)
    anneau_pans(nom + "_filet", w - 0.78, h - 0.78, 0.05, 0.14, 0.05, enc, z=0.0)
    # la face : plaque en coussin (biseau large), un peu sous la moulure ; plus bas et plus sombre quand le bouton est enfoncé
    fw, fh = w - 0.86, h - 0.86
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= fw
        v.co.y *= fh
        v.co.z = (v.co.z + 0.5) * 0.12
    face = C.objet_maillage(nom + "_face", bm, m_face)
    face.location = (0, 0, enfonce)
    b = face.modifiers.new("coussin", "BEVEL")
    b.width = 0.22
    b.segments = 5
    b.profile = 0.5
    return rendre(nom)


# ---------------------------------------------------------------- cartouche à coins rentrants (version 2)
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
    ext = contour_rentrant(w / 2, h / 2, r, b1, n)
    inter = contour_rentrant(w / 2, h / 2, r, b2, n)
    bm = bmesh.new()
    vb = [bm.verts.new((x, y, 0)) for x, y in ext]
    vi = [bm.verts.new((x, y, 0)) for x, y in inter]
    m = len(vb)
    for i in range(m):
        j = (i + 1) % m
        bm.faces.new((vb[i], vb[j], vi[j], vi[i]))
    res = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    for v in [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += ep
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = C.objet_maillage(nom, bm, mat)
    ob.location = (0, 0, z)
    if biseau:
        bv = ob.modifiers.new("biseau", "BEVEL")
        bv.width = biseau
        bv.segments = 4
        bv.limit_method = "ANGLE"
        bv.profile = 0.7
    return ob


def mat_degrade(nom, haut, bas, metal=0.6, rugosite=0.5, h=1.0):
    """Face d'or ou de parchemin : dégradé vertical (clair en haut, plus sombre en bas), comme une face bombée."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord"); sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["Object"], sep.inputs[0])
    mr = N("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -h / 2; mr.inputs["From Max"].default_value = h / 2
    L(sep.outputs["Y"], mr.inputs["Value"])
    mix = N("ShaderNodeMix"); mix.data_type = "RGBA"
    L(mr.outputs["Result"], C._entree(mix, "Factor", "VALUE"))
    C._entree(mix, "A", "RGBA").default_value = C.couleur(bas)
    C._entree(mix, "B", "RGBA").default_value = C.couleur(haut)
    L(C._sortie(mix, "RGBA"), p.inputs["Base Color"])
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rugosite
    return m


PEAUX2 = {"cartouche2-or": ("#e9cd7c", "#a07c2c", 0.65, 0.42, 0.0, E.OR_METAL),
          "cartouche2-or-appui": ("#b8953f", "#7e5f1f", 0.65, 0.5, -0.06, E.OR_METAL),
          "cartouche2-parchemin": ("#fff1cf", "#ead29c", 0.0, 0.85, 0.0, E.OR_METAL),
          "cartouche2-parchemin-appui": ("#e9d3a2", "#cfb47c", 0.0, 0.9, -0.06, E.OR_METAL),
          "cartouche2-plomb": ("#b9b7b0", "#8d8b84", 0.2, 0.8, 0.0, "#7d7f86")}


def peau2(nom):
    haut, bas, metal, rug, enfonce, cadre = PEAUX2[nom]
    W_U, H_U = 48, 32
    scene_ui(W_U, H_U, echantillons=40)
    w, h, r = (W_U - 3) / PX_PAR_M, (H_U - 3) / PX_PAR_M, 0.5
    enc = E.mat_encre(nom + "_encre")
    m_cadre = E.mat_or(nom + "_cadre", cadre, rugosite=0.36 if cadre == E.OR_METAL else 0.55, metal=0.85 if cadre == E.OR_METAL else 0.7)
    anneau_rentrant(nom + "_cerne", w, h, r, 0.0, 0.08, 0.12, enc)
    anneau_rentrant(nom + "_moulure", w, h, r, 0.06, 0.40, 0.18, m_cadre, biseau=0.09)
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


ESSAIS = {"peaux2": lambda: [peau2(n) for n in PEAUX2], "parch2": lambda: [peau2(n) for n in ("cartouche2-parchemin", "cartouche2-parchemin-appui")], "peaux": lambda: [peau(n) for n in PEAUX], "sangle": sangle_bord, "bossette": bossette, "sceaux": sceaux, "cadre": cadre, "coin": coin}

if __name__ == "__main__":
    for a in (sys.argv[1:] or ["bossette", "sceaux", "cadre"]):
        ESSAIS[a]()
