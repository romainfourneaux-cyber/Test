# -*- coding: utf-8 -*-
"""Famille « fonds » des images du mode Expéditions (cahier : atelier/conception/expeditions-graphismes.md, 3.1).

Quatre images, rendues avec le module commun (même soleil du nord-ouest, mêmes réglages Cycles, mêmes contrôles) :
  route-fond.jpg (2000 × 640, opaque) : la feuille de parchemin de la route des semaines, vue de dessus. Un plan de
    100 × 32 m finement subdivisé, déplacé par un bruit lent (ondulations de 5 cm qui accrochent le soleil), matière
    parchemin (grain 0,6, taches de 6 m), puis une patine : bords assombris et irréguliers, grain fin. Aucun dessin,
    aucun texte : les lettrines, filets, chemins et médaillons du SVG se posent dessus.
  annee-fond.jpg (2000 × 208, opaque) : la même feuille, une bande recadrée au milieu du rendu (pas un second rendu),
    patine plus légère : le fond du parchemin de l'année, sous les cases.
  cadre-page.png (480 × 480, alpha aux coins) : le cadre des fenêtres (page de semaine, porte, bivouac, marchand,
    Armorial, bilan) pour border-image, tranches de 60 unités (120 px) : filet d'encre, bande d'or bombée, filet
    d'encre à 3 m du bord, une perle d'or à chaque angle, le centre en parchemin nu rendu raccordable (le navigateur
    répète la tranche centrale).
  carte-expedition.jpg (640 × 380, opaque) : l'illustration de la carte « Partir en expédition » de la campagne : une
    route de terre qui serpente vers un petit bourg de France, une borne et une bannière au lys au départ, une
    charrette à l'arrêt, des houppiers ; vue de trois quarts à 40° comme les lieux de la carte, pas de ciel, aucun
    personnage.
Lancer : cd /home/user/Test && python3 atelier/outils/rendu-3d/expedition_fonds.py [route|annee|cadre|carte|planche]
  [--essai] (rendus réduits dans le cache, rien d'écrit dans jeu/).
La planche atelier/captures/planche-expedition-fonds.png pose sur chaque fond une maquette de ce que l'écran dessine
dessus (lettrines, chemins, médaillons, cases, fenêtre à cadre) : on la regarde avant de livrer.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expedition_commun as E  # noqa: E402
import commun as C  # noqa: E402
import terrains as T  # noqa: E402
import campagne as K  # noqa: E402
import engins as G  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

FAMILLE = "fonds"
IDS = ("route-fond", "annee-fond", "cadre-page", "carte-expedition")
ESSAI = False

# Feuille de route : 100 × 32 m vus de dessus à 20 px/m. Le rendu (soleil, ciel, AgX) d'un parchemin clair retombe vers
# #d1c8bc, gris et sombre à côté du parchemin du jeu, et l'exposition n'y change rien (AgX compresse les hautes lumières :
# #dfd8ce au mieux). Les nuances du rendu (ondulations, taches) sont donc recalées en post-traitement sur la teinte du
# SVG qu'elles remplacent : moyenne ROUTE_CIBLE, entre les deux bornes du dégradé du SVG (#f6eedb au centre, #e2d3ad).
ROUTE_M = (100.0, 32.0)
ROUTE_TEINTE = "#e9dcbd"        # albédo (sRGB) du parchemin rendu
ROUTE_CIBLE = "#eee2c6"         # moyenne visée après recalage
ROUTE_ONDULATION = 0.08         # amplitude des ondulations (m)
ROUTE_ECHELLE_OND = 3.0         # taille des ondulations (m)
CADRE_M = 24.0                  # feuille du cadre de page (m) : 480 px, 20 px/m ; tranches de 6 m
CADRE_RETRAIT = 3.0             # le milieu de la bande d'or à 3 m du bord
CADRE_COUPE = 60                # largeur des tranches de border-image (unités logiques)
CARTE = (320, 190, 6, 20)       # carte-expedition : w, h, px_par_m, ancre_bas (unités logiques)


def journal(*m):
    E.journal("[fonds]", *m)


# ---------------------------------------------------------------- la feuille de parchemin
def feuille(nom, largeur, hauteur, mat, amplitude=ROUTE_ONDULATION, echelle_m=ROUTE_ECHELLE_OND, pas=0.25, graine=11,
            origine=(0.0, 0.0)):
    """Plan largeur × hauteur (m), coin sud-ouest en origine, subdivisé tous les « pas » m et déplacé en z par un bruit
    lent : de faibles ondulations, comme une peau tendue, qui accrochent la lumière du nord-ouest."""
    nx, ny = max(2, int(round(largeur / pas))), max(2, int(round(hauteur / pas)))
    z = T.bruit(nx + 1, ny + 1, echelle_m / pas, graine, octaves=3) * amplitude
    z += T.bruit(nx + 1, ny + 1, echelle_m * 4 / pas, graine + 1, octaves=2) * amplitude * 0.6      # un bombé plus lent
    ox, oy = origine
    bm = bmesh.new()
    vs = []
    for j in range(ny + 1):
        vs.append([bm.verts.new((ox + i / nx * largeur, oy + j / ny * hauteur, float(z[j, i]))) for i in range(nx + 1)])
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
            f.smooth = True
    return C.objet_maillage(nom, bm, mat, lisse=True)


def rendre_feuille_route(W, H, echantillons=48):
    """Rendu RGB de la feuille de route (W × H px), sans patine."""
    E.scene_dessus(ROUTE_M[0], ROUTE_M[1], W, H, echantillons=echantillons, exposition=-0.1)
    feuille("feuille", ROUTE_M[0], ROUTE_M[1], E.mat_parchemin("parchemin_route", ROUTE_TEINTE, grain=0.6, echelle=6.0))
    return E.rendre_opaque("route-fond")


def recaler(img, cible, contraste=1.25, plafond=244):
    """Ramène la moyenne d'un rendu sur la teinte cible (gain par canal) et accentue un peu les nuances autour de la
    moyenne (contraste), sans dépasser plafond : les ondulations se lisent, aucun blanc brûlé."""
    a = np.array(img.convert("RGB"), dtype=np.float32)
    moy = a.reshape(-1, 3).mean(0)
    journal("rendu : moyenne #%02x%02x%02x, recalée sur %s" % (tuple(int(v) for v in moy) + (cible,)))
    c = np.array(C.rgb8(cible), dtype=np.float32)
    a = (a - moy) * contraste + moy
    a = a * (c / np.maximum(moy, 1.0))
    return Image.fromarray(np.clip(a, 0, plafond).astype(np.uint8))


def patine_chaude(img, force=0.35, graine=7, grain=0.04, bord=0.06):
    """La patine du module commun (bords assombris et irréguliers, grain fin), les bords virant franchement au brun
    chaud comme le dégradé du SVG (#e2d3ad) plutôt qu'au gris."""
    W, H = img.size
    a = np.array(img.convert("RGB"), dtype=np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    bx = np.minimum(xx, W - 1 - xx) / W
    by = np.minimum(yy, H - 1 - yy) / H
    n = T.bruit(W, H, max(8, W // 14), graine, octaves=4)
    d = np.minimum(bx * 2.2, by * 2.2 * (H / W) * 2.2) + 0.03 * n
    t = (1 - T.lisse01(0.0, bord * 3, d)) ** 1.3
    ombre = 1 - force * t
    g = 1 + grain * T.bruit(W, H, 3, graine + 1, octaves=2)
    teinte = np.array((1.0, 0.95, 0.84), dtype=np.float32)
    a = a * (ombre * g)[..., None] * (1 - (1 - teinte) * t[..., None])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def route_et_annee():
    """route-fond.jpg puis annee-fond.jpg (bande du même rendu)."""
    W, H = (500, 160) if ESSAI else (2000, 640)
    brut = recaler(rendre_feuille_route(W, H, echantillons=24 if ESSAI else 48), ROUTE_CIBLE)
    route = patine_chaude(brut, force=0.35, bord=0.045)
    C.controle_blancs(route, "route-fond")
    # la bande de l'année : les 208 px du milieu (104 unités), patine plus légère
    hb = H * 208 // 640
    y0 = (H - hb) // 2
    annee = patine_chaude(brut.crop((0, y0, W, y0 + hb)), force=0.25, graine=9, bord=0.045)
    C.controle_blancs(annee, "annee-fond")
    if ESSAI:
        route.save(os.path.join(C.CACHE, "essai-route-fond.jpg"), quality=86)
        annee.save(os.path.join(C.CACHE, "essai-annee-fond.jpg"), quality=86)
        return
    E.sauver("route-fond", route, max_ko=450)
    E.sauver("annee-fond", annee, max_ko=100)


# ---------------------------------------------------------------- le cadre de page (border-image)
def cadre_objets():
    """La feuille de 24 × 24 m et son cadre : filet d'encre, bande d'or bombée (0,5 m), filet d'encre, le milieu de la
    bande à 3 m du bord ; une perle d'or à chaque angle de la bande."""
    L = CADRE_M
    objets = [feuille("feuille", L, L, E.mat_parchemin("parchemin_cadre", "#efe3c6", grain=0.3, echelle=5.0),
                      amplitude=0.03, echelle_m=4.0, graine=23)]
    encre, or_ = E.mat_encre("encre_cadre"), E.mat_or("or_cadre", "#c8942c", rugosite=0.4, metal=0.8)
    r = CADRE_RETRAIT
    # les quatre côtés : (centre, longueur selon x, longueur selon y)
    def ceinture(nom, ecart, ep, h, mat, biseau=0.0):
        for k, (cx, cy, lx, ly) in enumerate(((L / 2, ecart, L - 2 * ecart + ep, ep), (L / 2, L - ecart, L - 2 * ecart + ep, ep),
                                               (ecart, L / 2, ep, L - 2 * ecart + ep), (L - ecart, L / 2, ep, L - 2 * ecart + ep))):
            ob = C.boite("%s_%d" % (nom, k), lx, ly, h, (cx, cy, 0.06), mat)
            if biseau:
                C.biseau(ob, biseau, segments=4)
            objets.append(ob)
    ceinture("filet_ext", r - 0.42, 0.1, 0.012, encre)
    ceinture("bande_or", r, 0.5, 0.16, or_, biseau=0.075)
    ceinture("filet_int", r + 0.42, 0.1, 0.012, encre)
    for cx in (r, L - r):
        for cy in (r, L - r):
            objets.append(C.sphere("perle_%d_%d" % (int(cx), int(cy)), 0.24, (cx, cy, 0.14), or_, subdiv=3))
    return objets


def tuile_raccordable(tuile):
    """Rend une tuile (PIL RGB) répétable sans couture : fondu vers sa copie décalée d'une demi-période près des bords."""
    a = np.array(tuile, dtype=np.float32)
    H, W = a.shape[:2]
    b = np.roll(np.roll(a, H // 2, 0), W // 2, 1)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.maximum(np.abs(xx - (W - 1) / 2) / (W / 2), np.abs(yy - (H - 1) / 2) / (H / 2))
    w = T.lisse01(0.3, 1.0, d)[..., None]
    return Image.fromarray(np.clip(a * (1 - w) + b * w, 0, 255).astype(np.uint8))


def patine_uniforme(img, force=0.14, marge_px=52, rampe_px=50):
    """Bords d'une feuille un peu assombris et bruns, sans irrégularité (les tranches de border-image se répètent)."""
    a = np.array(img.convert("RGB"), dtype=np.float32)
    H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, H - 1 - yy))
    t = 1 - T.lisse01(marge_px - rampe_px, marge_px, d)
    f = 1 - force * t
    teinte = np.array((1.0, 0.98, 0.94), dtype=np.float32)
    a = a * f[..., None] * (1 - (1 - teinte) * t[..., None])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def recaler_hors_cadre(img, cible, contraste=1.15):
    """Recale la feuille du cadre sur la teinte cible, mesurée sur le centre nu (le cadre d'or et d'encre suit le même
    gain : il reste un peu plus mat que l'or des médaillons, ce qui convient à un filet)."""
    a = np.array(img.convert("RGB"), dtype=np.float32)
    H, W = a.shape[:2]
    q = W // 4
    moy = a[q:-q, q:-q].reshape(-1, 3).mean(0)
    journal("cadre : centre rendu #%02x%02x%02x, recalé sur %s" % (tuple(int(v) for v in moy) + (cible,)))
    c = np.array(C.rgb8(cible), dtype=np.float32)
    a = (a - moy) * contraste + moy
    return Image.fromarray(np.clip(a * (c / np.maximum(moy, 1.0)), 0, 246).astype(np.uint8))


def masque_coins(taille, rayon):
    """Alpha d'une feuille aux coins arrondis (rayon en px), bord net."""
    m = Image.new("L", (taille, taille), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, taille - 1, taille - 1), radius=rayon, fill=255)
    return m


def cadre_page():
    """cadre-page.png : la feuille rendue de dessus à 2 ×, réduite, patinée, le centre rendu raccordable, coins arrondis."""
    px = 480
    surech = 1 if ESSAI else 2
    E.scene_dessus(CADRE_M, CADRE_M, px * surech, px * surech, echantillons=32 if ESSAI else 64, exposition=-0.1, appoint=0.5)
    cadre_objets()
    img = C.rendre(os.path.join(C.CACHE, "_rendu", "cadre-page.png"))
    img = C._reduire(img, surech).convert("RGB")
    img = img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=35, threshold=1))
    img = recaler_hors_cadre(img, "#f2e8cf")
    img = patine_uniforme(img, force=0.13, marge_px=34, rampe_px=30)
    coupe = CADRE_COUPE * C.ECHELLE
    centre = tuile_raccordable(img.crop((coupe, coupe, px - coupe, px - coupe)))
    img.paste(centre, (coupe, coupe))
    img = img.convert("RGBA")
    img.putalpha(masque_coins(px, 10))
    C.controle_blancs(img, "cadre-page", tolerance=0.006)
    if ESSAI:
        img.save(os.path.join(C.CACHE, "essai-cadre-page.png"))
        return
    E.sauver("cadre-page", img, extra={"coupe": CADRE_COUPE})


# ---------------------------------------------------------------- la carte « Partir en expédition »
PLAN_M = 140.0                  # côté du sol (m), centré sur (0, 25)
PLAN_CENTRE = (0.0, 25.0)
ROUTE_TRACE = [(0.5, -12.0), (1.8, -4.0), (-1.6, 3.0), (-4.2, 9.0), (-2.4, 14.5), (1.8, 19.0), (3.2, 23.0), (3.0, 27.0)]


def masque_route(taille=1024, largeur=3.2, graine=5):
    """Masque RGBA (R : terre de la route, G : bas-côté d'herbe sèche) du sol de la carte, en UV du plan."""
    s = PLAN_M / taille
    yy, xx = np.mgrid[0:taille, 0:taille].astype(np.float32)
    x = (xx + 0.5) * s - PLAN_M / 2 + PLAN_CENTRE[0]
    y = (yy + 0.5) * s - PLAN_M / 2 + PLAN_CENTRE[1]
    pts = K.chaikin(ROUTE_TRACE, 3)
    d = np.full(x.shape, 1e9, dtype=np.float32)
    for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
        vx, vy = bx - ax, by - ay
        l2 = vx * vx + vy * vy or 1e-6
        t = np.clip(((x - ax) * vx + (y - ay) * vy) / l2, 0, 1)
        d = np.minimum(d, np.hypot(x - (ax + t * vx), y - (ay + t * vy)))
    n = T.bruit(taille, taille, 40, graine, octaves=3)
    r = largeur / 2 * (1 + 0.18 * n)
    route = T.lisse01(r + 0.5, r - 0.4, d)
    bord = T.lisse01(r + 2.6, r + 0.3, d) * (0.55 + 0.45 * T.bruit(taille, taille, 25, graine + 1, octaves=2))
    arr = np.dstack([route, np.clip(bord, 0, 1), np.zeros_like(route), np.ones_like(route)])
    chemin = os.path.join(C.CACHE, "expedition-route-masque.png")
    Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA").transpose(Image.FLIP_TOP_BOTTOM).save(chemin)
    return chemin


def mat_pre_route(nom, masque_png):
    """Pré (photos Poly Haven teintées par la luminance) traversé par une route de terre et son bas-côté d'herbe sèche,
    masques lus en UV du plan ; relief tiré de la luminance de l'herbe."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    obj = tc.outputs["Object"]
    im = N("ShaderNodeTexImage")
    im.image = C.image(masque_png, non_couleur=True)
    im.extension = "EXTEND"
    L(tc.outputs["UV"], im.inputs["Vector"])
    sep = N("ShaderNodeSeparateColor")
    L(im.outputs["Color"], sep.inputs["Color"])
    route, bord = sep.outputs["Red"], sep.outputs["Green"]

    def photo(ident, taille, cible, contraste=1.25, garde=0.15):
        t = T._tex(nt, ident, "diff", obj, taille)
        return C.teinter_luminance(nt, t.outputs["Color"], ident, cible, contraste, garde), t
    herbe, th = photo("aerial_grass_rock", 14.0, "#5e6d36", 1.3)
    herbe2, _ = photo("rocky_terrain_02", 18.0, "#687440", 1.2)
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.0 / 22.0
    nz.inputs["Detail"].default_value = 3.0
    L(obj, nz.inputs["Vector"])
    sol = T._mix(nt, C._plage(nt, nz.outputs["Fac"], 0.35, 0.65, 0.0, 1.0), herbe, herbe2)
    sec, _ = photo("withered_grass", 6.0, "#8c875a", 1.2)
    terre, _ = photo("dirt_aerial_02", 6.0, "#a8906a", 1.0, 0.1)
    sol = T._mix(nt, bord, sol, sec)
    sol = T._mix(nt, route, sol, terre)
    L(sol, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.92
    p.inputs["Specular IOR Level"].default_value = 0.2
    bw = N("ShaderNodeRGBToBW")
    L(th.outputs["Color"], bw.inputs["Color"])
    b = N("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.35
    b.inputs["Distance"].default_value = 0.08
    L(bw.outputs["Val"], b.inputs["Height"])
    L(b.outputs["Normal"], p.inputs["Normal"])
    return m


def sol_carte(masque_png):
    """Le sol : un carré de PLAN_M m avec des UV (0..1), centré sur PLAN_CENTRE."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    h = PLAN_M / 2
    cx, cy = PLAN_CENTRE
    vs = [bm.verts.new(v) for v in ((cx - h, cy - h, 0), (cx + h, cy - h, 0), (cx + h, cy + h, 0), (cx - h, cy + h, 0))]
    f = bm.faces.new(vs)
    for lp, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = (u, v)
    return C.objet_maillage("sol", bm, mat_pre_route("pre_route", masque_png))


def borne(nom, loc, hauteur=1.5, rayon=0.34):
    """Borne de route : fût de pierre claire au sommet arrondi, posé sur un petit socle."""
    pierre = E.mat_pierre(nom + "_pierre", "#b8ad92")
    socle = C.boite(nom + "_socle", rayon * 2.6, rayon * 2.6, 0.22, loc, pierre)
    C.biseau(socle, 0.04, segments=2)
    fut = C.cylindre(nom + "_fut", rayon, hauteur - rayon, (loc[0], loc[1], loc[2] + 0.2), pierre, segments=16)
    tete = C.sphere(nom + "_tete", rayon, (loc[0], loc[1], loc[2] + 0.2 + hauteur - rayon), pierre, subdiv=3)
    return [socle, fut, tete]


def charrette(nom, loc, lacet=0.0, echelle=1.0):
    """Charrette à deux roues, à l'arrêt, brancards posés au sol, deux sacs dedans (longueur selon X avant lacet)."""
    planches, bois = E.mat_planches(nom + "_planches"), E.mat_bois(nom + "_bois")
    fer = C.mat_metal(nom + "_fer", "#4d443a", rugosite=0.65, metal=0.6)
    objets = [C.boite(nom + "_caisse", 2.3, 1.35, 0.6, (0, 0, 0.72), planches)]
    for k, dy in enumerate((-0.78, 0.66)):
        objets += G.roue("%s_roue%d" % (nom, k), (0.15, dy, 0.68), 0.68, bois, fer, ep=0.13)
    essieu = C.cylindre(nom + "_essieu", 0.06, 1.9, (0, 0, 0), bois, segments=8)
    essieu.rotation_euler = (math.pi / 2, 0, 0)
    essieu.location = (0.15, 0.95, 0.68)
    objets.append(essieu)
    for k, dy in enumerate((-0.5, 0.5)):
        br = C.cylindre("%s_brancard%d" % (nom, k), 0.05, 2.0, (0, 0, 0), bois, segments=8)
        br.rotation_euler = (0, -math.radians(110), 0)
        br.location = (-1.1, dy, 0.75)
        objets.append(br)
    objets += E.sac(nom + "_sac1", 0.42, 0.8, loc=(0.35, 0.15, 0.72), lacet=20)
    objets += E.sac(nom + "_sac2", 0.38, 0.72, loc=(-0.45, -0.1, 0.72), lacet=-35)
    p = C.pivot(nom + "_pivot", objets, lacet, loc)
    p.scale = (echelle, echelle, echelle)
    return objets + [p]


def arbre(nom, col, loc, rayon, mat_tronc):
    """Un feuillu : tronc court et houppier (instance de la collection de campagne.houppier)."""
    tronc = C.cylindre(nom + "_tronc", rayon * 0.16, rayon * 0.9, loc, mat_tronc, segments=10)
    e = bpy.data.objects.new(nom, None)
    e.instance_type = "COLLECTION"
    e.instance_collection = col
    e.location = (loc[0], loc[1], loc[2] + rayon * 0.9 + rayon * 0.45)
    e.scale = (rayon, rayon * 0.95, rayon * 0.85)
    e.rotation_euler.z = hash(nom) % 628 / 100.0
    e["sud"] = 0.0
    C.lier(e)
    return [tronc, e]


def carte_expedition():
    """carte-expedition.jpg : la route vers le bourg, de trois quarts à 40°, sans ciel."""
    w, h, ppm, ancre_bas = CARTE
    surech = 1 if ESSAI else E.SURECH
    E.scene_scene(w, h, ppm, ancre_bas, surech=surech, sol=False)
    k = C.ECHELLE * surech
    C.reglages_rendu(w * k, h * k, echantillons=32 if ESSAI else 48, transparent=False, exposition=-0.1)
    sol_carte(masque_route())
    # le bourg de France au bout de la route (échelle 0,6), le même que celui de la carte de campagne
    objs, lacet = K.bourg("france")
    pivot = C.pivot("bourg", objs, lacet, (3.0, 31.5, 0))
    pivot.scale = (0.6, 0.6, 0.6)
    # la borne et la bannière au lys au départ de la route, à gauche ; la charrette à l'arrêt, à droite
    borne("borne1", (-3.0, -3.5, 0))
    borne("borne2", (4.6, 18.5, 0), hauteur=1.3)
    C.drapeau("banniere", "france", 5.2, 3.0, 2.0, loc=(-5.6, -1.5, 0), vent=1.0, epi=True, echelle_embleme=0.66)
    charrette("charrette", (7.4, 1.0, 0), lacet=-62, echelle=1.3)
    feuillus = K.houppier("houppier", ("#2f4423", "#5c7338"))
    tronc = E.mat_bois("tronc", "#4a3522")
    for nom, loc, r in (("arbre1", (-13.0, 6.5, 0), 3.2), ("arbre2", (12.5, 11.0, 0), 2.8), ("arbre3", (-9.5, 24.0, 0), 2.6),
                        ("arbre4", (16.0, 30.0, 0), 2.4), ("arbre5", (-18.0, 36.0, 0), 2.9)):
        arbre(nom, feuillus, loc, r, tronc)
    img = C.rendre(os.path.join(C.CACHE, "_rendu", "carte-expedition.png"))
    img = C._reduire(img, surech).convert("RGB")
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=1))
    C.controle_blancs(img, "carte-expedition")
    if ESSAI:
        img.save(os.path.join(C.CACHE, "essai-carte-expedition.jpg"), quality=86)
        return
    E.sauver("carte-expedition", img, max_ko=160)


# ---------------------------------------------------------------- planche de contrôle
OR, OR_CLAIR, OR_SOMBRE, ENCRE, RUBRIQUE = C.rgb8(E.OR), C.rgb8(E.OR_CLAIR), C.rgb8(E.OR_SOMBRE), C.rgb8(E.ENCRE), C.rgb8(E.RUBRIQUE)


def _pointille(d, a, b, pas=9, trait=2, fill=ENCRE, largeur=2):
    """Trait pointillé de a à b (les chemins du SVG : trait 2,4, tirets 2 et 7)."""
    ax, ay = a
    bx, by = b
    l = math.hypot(bx - ax, by - ay) or 1
    ux, uy = (bx - ax) / l, (by - ay) / l
    t = 0.0
    while t < l:
        d.line((ax + ux * t, ay + uy * t, ax + ux * min(l, t + trait), ay + uy * min(l, t + trait)), fill=fill, width=largeur)
        t += pas


def maquette_route(fond):
    """Pose sur le fond (à l'échelle logique, 1000 × 320) ce que carteSVG dessine : lettrines, dates, filets, chemins,
    médaillons (dont halte-brume rendu), gardien, bannière « Cette semaine », voile de brume."""
    im = fond.convert("RGBA")
    d = ImageDraw.Draw(im, "RGBA")
    gras, texte, petit = E._police(32), E._police(15), E._police(13)
    BANDE = 320
    for i, (sem, etat) in enumerate((("S6", "courante"), ("S7", "avenir"), ("S8", "avenir"))):
        bx = 20 + i * BANDE
        if i:
            _pointille(d, (bx - 8, 12), (bx - 8, 308), pas=8, trait=3, fill=OR + (150,), largeur=1)
        coul = (125, 118, 105) if etat != "courante" else RUBRIQUE
        d.text((bx + 8, 14), sem, fill=coul, font=gras)
        d.text((bx + 62, 26), "du 5 au 11 octobre 2026", fill=(90, 74, 54), font=petit)
        d.line((bx + 6, 50, bx + BANDE - 16, 50), fill=OR + (180,), width=1)
        if etat != "courante":
            d.rectangle((bx + 2, 56, bx + BANDE - 10, 316), fill=C.rgb8(E.FOND) + (107,))
    # chemins et médaillons de la semaine courante
    noeuds = [(118, 180, "depart"), (210, 130, "halte"), (210, 230, "halte"), (300, 180, "halte"), (300, 100, "halte"), (390, 130, "halte"),
              (390, 230, "halte"), (470, 180, "gardien")]
    aretes = ((0, 1, "pris"), (0, 2, "possible"), (1, 3, "ordinaire"), (1, 4, "ordinaire"), (2, 3, "ordinaire"), (3, 5, "ordinaire"), (3, 6, "ordinaire"),
              (4, 5, "ordinaire"), (5, 7, "ordinaire"), (6, 7, "ordinaire"))
    for a, b, et in aretes:
        pa, pb = noeuds[a][:2], noeuds[b][:2]
        if et == "pris":
            d.line(pa + pb, fill=OR_SOMBRE, width=5)
            d.line(pa + pb, fill=OR_CLAIR, width=2)
        else:
            _pointille(d, pa, pb, fill=ENCRE + (240 if et == "possible" else 140,))
    brume = Image.open(os.path.join(E.DOSSIER, "halte-brume.png")).convert("RGBA").resize((64, 64), Image.LANCZOS) \
        if os.path.exists(os.path.join(E.DOSSIER, "halte-brume.png")) else None
    for x, y, genre in noeuds:
        if genre == "depart":
            d.ellipse((x - 22, y - 22, x + 22, y + 22), fill=C.rgb8("#24407a"), outline=OR, width=3)
            d.text((x - 24, y + 30), "Départ", fill=ENCRE, font=petit)
            continue
        r = 34 if genre == "gardien" else 24
        d.ellipse((x - r, y - r, x + r, y + r), fill=OR, outline=ENCRE, width=2)
        d.ellipse((x - r + 6, y - r + 6, x + r - 6, y + r - 6), fill=C.rgb8(E.PARCHEMIN_CLAIR), outline=ENCRE, width=1)
        if genre == "gardien":
            d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=C.rgb8("#9b1f1f"))
            d.text((x - 26, y + r + 4), "Gardien", fill=ENCRE, font=petit)
        else:
            d.line((x - 10, y - 10, x + 10, y + 10), fill=ENCRE, width=3)
            d.line((x - 10, y + 10, x + 10, y - 10), fill=ENCRE, width=3)
            d.text((x - 34, y + r + 4), "Escarmouche", fill=ENCRE, font=petit)
    # les semaines suivantes : médaillons vides et brume
    for i in (1, 2):
        bx = 20 + i * BANDE
        for x, y in ((bx + 80, 130), (bx + 80, 230), (bx + 170, 180), (bx + 260, 130), (bx + 260, 230)):
            if brume:
                im.alpha_composite(brume, (x - 32, y - 32))
                d = ImageDraw.Draw(im, "RGBA")
            else:
                d.ellipse((x - 24, y - 24, x + 24, y + 24), fill=OR, outline=ENCRE, width=2)
    # bannière « Cette semaine » de la troisième bande
    bx = 20 + 2 * BANDE + BANDE - 22
    d.line((bx, 8, bx, 46), fill=ENCRE, width=2)
    d.polygon(((bx - 2, 10), (bx - 136, 10), (bx - 128, 19), (bx - 136, 28), (bx - 2, 28)), fill=RUBRIQUE, outline=ENCRE)
    d.text((bx - 126, 11), "Cette semaine", fill=(255, 243, 208), font=texte)
    return im


def maquette_annee(fond):
    """Les cases du parchemin de l'année (27 × 34, à partir de x = 20), la frontière, le repère du relais."""
    im = fond.convert("RGBA")
    d = ImageDraw.Draw(im, "RGBA")
    police = E._police(15)
    for i in range(34):
        cx, y0, w, h = 22 + i * 28, 44, 27, 34
        brume = i >= 8
        d.rounded_rectangle((cx, y0, cx + w, y0 + h), radius=2, fill=C.rgb8("#cfc7b6" if brume else "#f3e4b6" if 5 <= i < 8 else "#f7efdc"),
                            outline=C.rgb8("#9a927f") if brume else ENCRE, width=1)
        if i in (0, 5, 6, 7):
            d.rounded_rectangle((cx - 2, y0 - 2, cx + w + 2, y0 + h + 2), radius=3, outline=OR_CLAIR if i == 5 else OR, width=3 if i == 5 else 2)
        d.text((cx + 6 if i < 9 else cx + 3, y0 + 8), str(i + 1), fill=(125, 118, 105) if brume else ENCRE, font=police)
    x = 22 + 8 * 28 - 5
    _pointille(d, (x, 20), (x, 100), pas=6, trait=3, fill=RUBRIQUE, largeur=2)
    d.text((x + 6, 84), "Frontière", fill=RUBRIQUE, font=police)
    d.polygon(((x - 15, 16), (x - 130, 16), (x - 122, 24), (x - 130, 32), (x - 15, 32)), fill=RUBRIQUE, outline=ENCRE)
    d.text((x - 122, 17), "Cette semaine", fill=(255, 243, 208), font=police)
    return im


def maquette_fenetre(cadre, largeur, hauteur, coupe_px=120, bord=60):
    """Simule border-image : tranches de coupe_px px du fichier affichées à « bord » px (coins), côtés et centre répétés
    (« round »), sur une fenêtre largeur × hauteur px, avec un texte de page dedans."""
    W = cadre.size[0]
    k = bord / coupe_px
    fen = Image.new("RGBA", (largeur, hauteur), (0, 0, 0, 0))

    def morceau(x0, y0, x1, y1, w, h):
        return cadre.crop((x0, y0, x1, y1)).resize((max(1, w), max(1, h)), Image.LANCZOS)
    c = coupe_px
    # centre : tuile répétée un nombre entier de fois
    tuile = cadre.crop((c, c, W - c, W - c))
    tw = max(1, round(tuile.size[0] * k))
    nx, ny = max(1, round((largeur - 2 * bord) / tw)), max(1, round((hauteur - 2 * bord) / tw))
    cw, ch = (largeur - 2 * bord) / nx, (hauteur - 2 * bord) / ny
    for j in range(ny):
        for i in range(nx):
            fen.alpha_composite(tuile.resize((int(math.ceil(cw)), int(math.ceil(ch))), Image.LANCZOS), (int(bord + i * cw), int(bord + j * ch)))
    # côtés
    for i in range(nx):
        x = int(bord + i * cw)
        fen.alpha_composite(morceau(c, 0, W - c, c, int(math.ceil(cw)), bord), (x, 0))
        fen.alpha_composite(morceau(c, W - c, W - c, W, int(math.ceil(cw)), bord), (x, hauteur - bord))
    for j in range(ny):
        y = int(bord + j * ch)
        fen.alpha_composite(morceau(0, c, c, W - c, bord, int(math.ceil(ch))), (0, y))
        fen.alpha_composite(morceau(W - c, c, W, W - c, bord, int(math.ceil(ch))), (largeur - bord, y))
    # coins
    for (x0, y0), (px_, py_) in (((0, 0), (0, 0)), ((W - c, 0), (largeur - bord, 0)), ((0, W - c), (0, hauteur - bord)), ((W - c, W - c), (largeur - bord, hauteur - bord))):
        fen.alpha_composite(morceau(x0, y0, x0 + c, y0 + c, bord, bord), (px_, py_))
    d = ImageDraw.Draw(fen)
    d.text((bord + 16, bord + 10), "Retour au domaine", fill=ENCRE, font=E._police(26))
    d.line((bord + 16, bord + 48, largeur - bord - 16, bord + 48), fill=OR, width=1)
    d.text((bord + 16, bord + 60), "Une expédition qui apprend n'est jamais perdue.", fill=(90, 74, 54), font=E._police(15))
    d.text((bord + 16, bord + 86), "Renommée gagnée : 74 (tu en as 74, 74 à dépenser).", fill=ENCRE, font=E._police(17))
    return fen


def planche_fonds():
    """atelier/captures/planche-expedition-fonds.png : chaque image à sa taille d'affichage avec la maquette de ce que le
    jeu dessine dessus, plus le fichier du cadre et la carte à 2 × ; les images manquantes sont listées."""
    man = E.lire_manifeste()
    largeur = 1400
    fond_sombre = (52, 36, 24)
    cellules = []           # (titre, image RGBA, légende)
    gras, petit = E._police(15), E._police(12)

    def charge(nom):
        e = man.get(nom)
        if not e:
            return None, None
        chemin = os.path.join(C.RACINE, "jeu", e["f"])
        if not os.path.exists(chemin):
            return None, None
        return Image.open(chemin).convert("RGBA"), e

    def legende(nom, e):
        return "%s : %d × %d, ancre %d, %d, %d Ko" % (nom, e["w"], e["h"], e["ax"], e["ay"], os.path.getsize(os.path.join(C.RACINE, "jeu", e["f"])) // 1024)
    im, e = charge("route-fond")
    if im:
        petit_fond = im.convert("RGB").resize((e["w"], e["h"]), Image.LANCZOS)
        cellules.append(("route-fond, à l'échelle logique (1000 × 320), sous une maquette du SVG de la route", maquette_route(petit_fond), legende("route-fond", e)))
        cellules.append(("route-fond nu, à 0,25", im.convert("RGB").resize((e["w"] // 2, e["h"] // 2), Image.LANCZOS).convert("RGBA"), ""))
    im, e = charge("annee-fond")
    if im:
        cellules.append(("annee-fond, à l'échelle logique (1000 × 104), sous une maquette des cases", maquette_annee(im.convert("RGB").resize((e["w"], e["h"]), Image.LANCZOS)), legende("annee-fond", e)))
    im, e = charge("cadre-page")
    if im:
        fichier = im.copy()
        d = ImageDraw.Draw(fichier, "RGBA")
        c = e.get("coupe", 60) * C.ECHELLE
        for v in (c, fichier.size[0] - c):
            d.line((v, 0, v, fichier.size[1]), fill=(140, 47, 57, 150), width=1)
            d.line((0, v, fichier.size[0], v), fill=(140, 47, 57, 150), width=1)
        cellules.append(("cadre-page, le fichier (480 × 480) et ses tranches de 120 px", fichier, legende("cadre-page", e)))
        cellules.append(("cadre-page en border-image : fenêtre de 760 × 300 px, bord 60 px, tranches répétées", maquette_fenetre(im, 760, 300, c, e.get("coupe", 60)), ""))
    im, e = charge("carte-expedition")
    if im:
        carte = im.convert("RGB").resize((e["w"], e["h"]), Image.LANCZOS).convert("RGBA")
        d = ImageDraw.Draw(carte, "RGBA")
        # le médaillon de l'icône de la carte (64 px, posé à cheval sur le bas de l'illustration)
        cx, cy = e["w"] // 2, e["h"] + 2
        d.ellipse((cx - 32, cy - 32, cx + 32, cy + 32), fill=(61, 33, 22), outline=OR, width=3)
        d.rectangle((0, 0, e["w"] - 1, e["h"] - 1), outline=ENCRE, width=2)
        cellules.append(("carte-expedition, à l'échelle logique (320 × 190) avec le médaillon de la carte", carte, legende("carte-expedition", e)))
        cellules.append(("carte-expedition, le fichier (640 × 380)", im, ""))
    absents = [k for k in IDS if k not in man or not os.path.exists(os.path.join(C.RACINE, "jeu", man[k]["f"]))]
    # mise en page : une cellule par ligne, deux côte à côte quand elles tiennent
    positions, x, y, h_ligne = [], 16, 16, 0
    for titre, img, leg in cellules:
        w, h = img.size
        if x + w > largeur - 16 and x > 16:
            x, y, h_ligne = 16, y + h_ligne + 16, 0
        positions.append((x, y))
        x += w + 24
        h_ligne = max(h_ligne, h + 40)
    H = y + h_ligne + 60
    can = Image.new("RGBA", (largeur, H), fond_sombre + (255,))
    d = ImageDraw.Draw(can, "RGBA")
    for (titre, img, leg), (x, y) in zip(cellules, positions):
        d.text((x, y), titre, fill=(240, 228, 200), font=gras)
        can.alpha_composite(img, (x, y + 20))
        if leg:
            d.text((x, y + 22 + img.size[1]), leg, fill=(200, 185, 150), font=petit)
    d.text((16, H - 32), "Famille « fonds » : %d images sur %d ; budget du dossier %d Ko / %d Ko%s" % (
        len(IDS) - len(absents), len(IDS), E.budget() // 1000, E.BUDGET_TOTAL // 1000, (" ; manquent : " + ", ".join(absents)) if absents else ""),
        fill=(240, 228, 200), font=gras)
    chemin = os.path.join(E.CAPTURES, "planche-expedition-%s.png" % FAMILLE)
    can.convert("RGB").save(chemin)
    journal("planche : " + os.path.relpath(chemin, C.RACINE))
    return chemin


def main(args):
    global ESSAI
    ESSAI = "--essai" in args
    quoi = [a for a in args if not a.startswith("--")] or ["tout"]
    tout = "tout" in quoi
    if tout or "route" in quoi or "annee" in quoi or "route-fond" in quoi or "annee-fond" in quoi:
        route_et_annee()
    if tout or "cadre" in quoi or "cadre-page" in quoi:
        cadre_page()
    if tout or "carte" in quoi or "carte-expedition" in quoi:
        carte_expedition()
    if not ESSAI:
        planche_fonds()
        E.verifier_budget()


if __name__ == "__main__":
    main(sys.argv[1:])
