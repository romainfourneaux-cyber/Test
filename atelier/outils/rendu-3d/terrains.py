# -*- coding: utf-8 -*-
"""Terrains des batailles, vus de dessus : plaine, forêt sombre tout autour, rivière, route et ponts.

Usage : python3 atelier/outils/rendu-3d/terrains.py [carte ...] [--essai | --zone x0,y0,x1,y1] [--sortie chemin.jpg]
                                                    [--apercu dossier] [--planche chemin.png]
  carte : domaine, gue, foret, moulin, col, chateau (par défaut : toutes, l'une après l'autre)
  --essai : rendu rapide à la taille logique (1000 × 660), écrit dans --sortie (brouillon)
  --zone : seulement ce rectangle (px logiques), à la résolution finale, écrit dans --sortie (contrôle du détail)
  --apercu : sans Blender, écrit dans le dossier un aperçu des masques et de la végétation prévue (contrôle rapide)
  --planche : sans Blender, planche de contrôle des 6 terrains déjà rendus (vues de jeu et détails à 2 ×)
Sorties : jeu/assets/images/td/terrain-<carte>.jpg, 2000 × 1320, JPEG (≤ 440 000 octets, qualité plancher 72).

La géométrie (route lissée, emplacements, rivière) est lue dans les fichiers du jeu (jeu/js/cartes-bataille.js)
par Node : le terrain colle exactement au tracé. Repère : 1 px logique = 10 cm ; x vers la droite, y vers le bas
pour les cartes du jeu ; dans Blender, X = x / 10, Y = (660 - y) / 10 (le nord en haut).

Route : piste de terre sèche et poussiéreuse, nettement plus claire que l'herbe (au moins 15 de L* d'écart, contrôlé
par verifier.py) ; largeur de 30 à 38 px qui ondule lentement, touffes d'herbe qui entament le bord, bas-côté d'herbe
plus haute discontinu (absent sur environ 40 % du tracé) ; ornières dont l'écart dérive lentement et qui s'effacent sur
30 à 40 % de la longueur, fondues en une seule bande centrale dans les virages serrés ; plaques de terre tassée plus
sombre et de poussière plus claire (± 8 % de L*, taches de 20 à 60 px), plaques humides à moins de 40 px de la rivière,
flaques qui reflètent le ciel ; elle se resserre sur le tablier des ponts. Aucun arbre ni aucune ombre d'arbre sur la
route (tronc à plus de 48 px de l'axe, ombre portée vérifiée).
Rivière : largeur variable, la ligne d'eau tombe à rive − 1 (largeur d'eau visible ≈ 2 × rive) ; eau qui absorbe fort
(le fond ne se voit que sur les 2-3 px du bord), vert-bleu sombre au milieu, reflet de ciel factice uniforme de 0,18 à
0,22, rides étirées dans le sens du courant ; banc de galets à l'intérieur des méandres, berge raide à l'extérieur,
liseré de vase discontinu (l'herbe descend jusqu'à l'eau par endroits), franges de joncs. Ponts : tablier de 28 px
(plus étroit que la route), long de 2 × la demi-largeur de l'eau + 40 px, garde-corps fins et clairs, deux chevalets de
pieux dans l'eau entourés d'un remous clair, rampes de terre et de pierre dans l'axe de la route.
Places fortes : clairière irrégulière (disque d'environ 76 px modulé de ± 25 % selon l'angle, fondu sur 26 px) autour
de chaque bout de route, à peine piétinée (60 % du masque) ; le même masque règle la densité des arbres ; le sol de
forêt n'apparaît que sous les cimes réellement posées ; jeunes arbres et buissons dans le fondu. Sentier de 14 px, de la
même terre que la route (ornières à 0,3), de la porte (position tirée de places.py) jusqu'à la route, seulement si la
porte est à plus de 25 px du bout de la route, coupé 6 px sous l'emprise du sprite (aucun bout ne dépasse) ; quelques
pavés (cobblestone_01, opacité 0,5) juste devant chaque porte.
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
from mathutils import Vector  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

import places as P  # noqa: E402

V = Vector
LARG, HAUT = 1000, 660                   # canevas logique
M = 0.1                                  # mètres par px logique
DEMI_ROUTE = 17                          # px logiques (route de 34 px)
LARG_PONT = 28                           # px logiques : tablier plus étroit que la route
RIVE = 13.0                              # demi-largeur moyenne de l'eau, px logiques
NIVEAU_EAU = -0.3                        # m
TAILLE_MASQUE = (2000, 1320)             # résolution des masques (celle du rendu final)
MARGE_TRONC_ROUTE = 48                   # px : aucun tronc d'arbre de forêt plus près de l'axe de la route
MARGE_SOUS_BOIS_ROUTE = 40               # px : idem pour le sous-bois

# Palette du terrain (teintes moyennes visées, sRGB) : prairie verte de fin d'été, piste de terre sèche et claire
# (L* d'environ 58, contre environ 40 pour l'herbe : la route se lit aussi sans voir les couleurs), forêt sombre.
PALETTE = {
    "herbe": "#5b6631", "herbe_grasse": "#4a5f2a", "herbe_sombre": "#454d25", "herbe_seche": "#767046",
    "pietinee": "#636b3c", "sous_bois": "#2a2a18", "bas_cote": "#48512a",
    "terre": "#9b8a6c", "terre_claire": "#b0a184", "terre_tassee": "#837358", "poussiere": "#b3a589",
    "terre_humide": "#7d6c53", "orniere": "#6a5a47", "galets": "#8f8873", "banc": "#7b7363",
    "vase": "#4a4132", "flaque": "#6f7468", "flaque_bord": "#3a3326", "paves": "#8d8676",
    "eau_bord": "#5b5a3a", "eau_milieu": "#24332c", "eau_fond": "#1c2a25", "remous": "#8c8f74",
    "ciel_reflet": "#8fa2a8",
}
LARG_SENTIER = 14                        # px logiques : sentier de la porte des places fortes
PORTE_MIN = 25                           # px : pas de sentier si la porte est à moins de 25 px du bout de la route
COUPE_SENTIER = 6                        # px : le sentier commence 6 px sous l'emprise du sprite (bout caché)


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


def intersections(l1, l2):
    """Points où deux polylignes se croisent, avec l'angle de l1 et celui de l2 à cet endroit."""
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
                r.append((a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), math.atan2(b[1] - a[1], b[0] - a[0]),
                          math.atan2(d[1] - c[1], d[0] - c[0])))
    return r


# ---------------------------------------------------------------- emprise des places fortes (solution B)
def boite_place(camps):
    """Boîte opaque (px logiques, relative au point d'ancrage) des sprites de places fortes déjà rendus : union sur
    les camps donnés. Repli : la boîte prévue (corps d'environ 105 × 100 px autour du centre de la cour)."""
    man = C.lire_manifeste()
    boite = None
    for camp in camps:
        e = man.get("place-%s-intact" % camp)
        if not e:
            continue
        chemin = os.path.join(C.RACINE, "jeu", e["src"])
        if not os.path.exists(chemin):
            continue
        a = np.array(Image.open(chemin).convert("RGBA"))[..., 3]
        ys, xs = np.nonzero(a > 128)
        k = e["w"] / a.shape[1]
        b = (xs.min() * k - e["ax"], ys.min() * k - e["ay"], xs.max() * k - e["ax"], ys.max() * k - e["ay"])
        boite = b if boite is None else (min(boite[0], b[0]), min(boite[1], b[1]), max(boite[2], b[2]), max(boite[3], b[3]))
    return boite or (-53.0, -75.0, 53.0, 33.0)


def emprises(carte):
    """Pour chaque bout de route : (x, y, boîte opaque, camps) ; à gauche la France, à droite les deux rivaux possibles."""
    d, f = carte["route"][0], carte["route"][-1]
    rivaux = ["angleterre", "omeyyades"]
    return [(d[0], d[1], boite_place(["france"]), ["france"]), (f[0], f[1], boite_place(rivaux), rivaux)]


def portes(carte):
    """Seuils des portes (x, y, ux, uy) en px logiques, pour chaque bout de route et chaque camp qui peut l'occuper."""
    res = []
    for (ex, ey, _, camps) in emprises(carte):
        for camp in camps:
            dx, dy, ux, uy = P.porte_ecran(camp)
            res.append((ex + dx, ey + dy, ux, uy, ex, ey, camp))
    return res


def empreinte_places(carte, W, H, retrait=0.0):
    """Emprise à l'écran (alpha > 0,5) des sprites de places fortes posés sur les deux bouts de route, sur une grille
    W × H ; pour le bout des rivaux, l'intersection des deux sprites possibles (caché sous l'un comme sous l'autre).
    retrait (px logiques) : emprise rognée d'autant vers l'intérieur."""
    s = W / LARG
    man = C.lire_manifeste()
    tot = np.zeros((H, W), dtype=np.float32)
    for (ex, ey, _, camps) in emprises(carte):
        bout = None
        for camp in camps:
            e = man.get("place-%s-intact" % camp)
            if not e or not os.path.exists(os.path.join(C.RACINE, "jeu", e["src"])):
                continue
            im = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA").split()[3]
            k = e["w"] * s / im.size[0]
            im = im.resize((max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))), Image.BILINEAR)
            calque = Image.new("L", (W, H), 0)
            calque.paste(im, (round((ex - e["ax"]) * s), round((ey - e["ay"]) * s)))
            a = (np.array(calque, dtype=np.float32) / 255.0 > 0.5).astype(np.float32)
            bout = a if bout is None else np.minimum(bout, a)
        if bout is not None:
            tot = np.maximum(tot, bout)
    if retrait > 0:
        n = int(round(retrait * s)) * 2 + 1
        tot = np.array(Image.fromarray((tot * 255).astype(np.uint8), "L").filter(ImageFilter.MinFilter(n)),
                       dtype=np.float32) / 255.0
    return tot


def sentiers(carte):
    """Sentiers de terre battue (polylignes, px logiques) : du seuil de la porte de chaque place forte (position tirée
    de places.py) jusqu'à la route, qu'il rejoint au plus court après être sorti droit de la porte.
    Seulement si la porte est à plus de PORTE_MIN px du bout de la route ; le tracé part de 20 px derrière le seuil (sous
    le sprite) pour que masques() le coupe sous l'emprise : aucun bout arrondi ne dépasse du château."""
    route = carte["route"]
    res = []
    for (gx, gy, ux, uy, ex, ey, camp) in portes(carte):
        if math.hypot(gx - ex, gy - ey) <= PORTE_MIN:
            C.journal("pas de sentier pour la porte de la place %s (à %.0f px du bout de la route)"
                      % (camp, math.hypot(gx - ex, gy - ey)))
            continue
        # point de jonction : sur la route, entre 55 et 150 px (le long du tracé) du bout, au plus court en pénalisant
        # un peu les jonctions lointaines
        cum = [0.0]
        for i in range(1, len(route)):
            cum.append(cum[-1] + math.dist(route[i - 1], route[i]))
        au_debut = math.hypot(route[0][0] - ex, route[0][1] - ey) < 1
        depuis_bout = cum if au_debut else [cum[-1] - c for c in cum]   # abscisse comptée depuis le bout de cette place
        # point de jonction : le point de la route le plus proche d'un point pris 10 px devant la porte, à plus de 40 px
        # du bout (le long du tracé) : le sentier sort droit de la porte puis va au plus court rejoindre la route
        # (souvent en passant derrière une tour, donc à moitié caché, comme une vraie avant-cour)
        fx, fy = gx + ux * 10, gy + uy * 10
        meilleur = None
        for i, (rx, ry) in enumerate(route):
            if depuis_bout[i] < 40:
                continue
            cout = math.hypot(rx - fx, ry - fy)
            if meilleur is None or cout < meilleur[0]:
                meilleur = (cout, i)
        if meilleur is None:
            continue
        jx, jy = route[meilleur[1]]
        # il part de 20 px derrière le seuil, sous le sprite (bout caché)
        res.append(catmull([(gx - ux * 20, gy - uy * 20), (gx, gy), (fx, fy), (jx, jy)], 12))
    return res


# ---------------------------------------------------------------- champs de distance et bruits (numpy)
def champ_distance(ligne, W, H, rayon):
    """Distance (px logiques) de chaque pixel d'une grille W × H à une polyligne, distance signée selon le côté,
    abscisse curviligne et angle de la tangente (repère du jeu). Calcul segment par segment, limité au voisinage.

    Le côté signé vaut ± la distance (et non la projection sur la normale du segment) : au-delà du bout d'un segment,
    la projection sautait d'un segment à l'autre et dessinait des stries transversales tous les 10 px sur la route."""
    s = W / LARG
    d = np.full((H, W), float(rayon), dtype=np.float32)
    lat = np.zeros((H, W), dtype=np.float32)
    absc = np.zeros((H, W), dtype=np.float32)
    ang = np.zeros((H, W), dtype=np.float32)
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
        cote = np.sign(dx * (yy - ay) - dy * (xx - ax))
        zone = d[y0:y1, x0:x1]
        mieux = dist < zone
        zone[mieux] = dist[mieux]
        lat[y0:y1, x0:x1][mieux] = (cote * dist)[mieux]
        absc[y0:y1, x0:x1][mieux] = (cumul + t * L / s)[mieux]
        ang[y0:y1, x0:x1][mieux] = math.atan2(dy, dx)
        cumul += L / s
    return d, lat, absc, ang


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


def bruit1d(t, echelle, graine):
    """Bruit lisse à une dimension (valeurs ~ -1..1) évalué en t (tableau), période caractéristique « echelle »."""
    rng = np.random.default_rng(graine)
    n = int(np.max(t) / echelle) + 4
    g = rng.uniform(-1, 1, n)
    u = t / echelle
    i = np.floor(u).astype(int)
    f = u - i
    f = f * f * (3 - 2 * f)
    return g[np.clip(i, 0, n - 1)] * (1 - f) + g[np.clip(i + 1, 0, n - 1)] * f


def bruit_angle(theta, graine):
    """Bruit périodique selon l'angle (valeurs ~ -1..1) : quelques harmoniques de phases tirées au hasard."""
    rng = np.random.default_rng(graine)
    tot = np.zeros_like(theta)
    for k, a in ((2, 0.55), (3, 0.35), (5, 0.22), (8, 0.12)):
        tot += a * np.sin(k * theta + rng.uniform(0, 2 * math.pi))
    return tot / 0.9


def lisse01(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def courbure(ligne):
    """Courbure signée (1/px) à chaque sommet d'une polyligne et abscisse curviligne."""
    p = np.array(ligne, dtype=np.float64)
    seg = np.diff(p, axis=0)
    l = np.hypot(seg[:, 0], seg[:, 1])
    s = np.concatenate([[0], np.cumsum(l)])
    a = np.unwrap(np.arctan2(seg[:, 1], seg[:, 0]))
    da = np.gradient(a)
    k = da / np.maximum(l, 1e-6)
    k = np.concatenate([k, [k[-1]]])
    k = np.convolve(k, np.ones(9) / 9, mode="same")
    return s, k


# ---------------------------------------------------------------- masques du terrain
def masques(carte, graine):
    """Calcule les masques (2000 × 1320) : route, ornières, flaques, sentiers, eau, berges, forêt, clairières...

    Renvoie un dict de tableaux 0..1 et la géométrie utilisée (ponts, emprises des places)."""
    W, H = TAILLE_MASQUE
    s = W / LARG
    route = carte["route"]
    riviere = catmull(carte["riviere"], 12)
    rng = np.random.default_rng(graine)
    dr, lat, absc, _ = champ_distance(route, W, H, 90)
    dv, latv, abscv, angv = champ_distance(riviere, W, H, 70)
    n1 = bruit(W, H, 60 * s, graine + 1)
    n2 = bruit(W, H, 12 * s, graine + 2, octaves=3)
    n3 = bruit(W, H, 220 * s, graine + 3, octaves=3)
    n150 = bruit(W, H, 150 * s, graine + 4, octaves=2)
    n150b = bruit(W, H, 150 * s, graine + 5, octaves=2)
    n40 = bruit(W, H, 40 * s, graine + 6, octaves=3)
    n6 = bruit(W, H, 6 * s, graine + 7, octaves=2)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    x, y = (xx + 0.5) / s, (yy + 0.5) / s

    def val(arr, px, py):
        return float(arr[min(H - 1, max(0, int(py * s))), min(W - 1, max(0, int(px * s)))])

    # ---- rivière : demi-largeur variable le long du cours, plus large à l'extérieur des méandres
    sv, kv = courbure(riviere)
    kpix = np.interp(abscv, sv, kv)
    rive = 11.0 + 6.0 * bruit1d(abscv, 180.0, graine + 8)
    exterieur = np.clip(-np.sign(kpix) * np.sign(latv), 0, 1)        # côté extérieur du virage
    interieur = np.clip(np.sign(kpix) * np.sign(latv), 0, 1)         # côté intérieur (eau lente, dépôts)
    virage = lisse01(0.0012, 0.006, np.abs(kpix))
    rive = rive + np.clip(np.abs(kpix) * 900.0, 0, 4.0) * (exterieur - 0.4)
    croisements = intersections(route, riviere)
    for (px, py, _, _) in croisements:
        pres = lisse01(30, 12, np.hypot(x - px, y - py))
        rive = rive * (1 - pres) + np.clip(rive, 10.0, 13.0) * pres
    rive = np.maximum(rive, 8.5)
    dvb = dv + 3.5 * n1 + 1.5 * n2
    # ligne d'eau à dvb = rive − 1 (hauteurs() y fait passer le niveau de l'eau) : largeur visible ≈ 2 × rive.
    # Eau qui absorbe fort : le fond (eau_bord) ne se voit que sur les 2-3 px du bord, puis vert-bleu sombre.
    m_eau = lisse01(rive, rive - 2.0, dvb)
    m_prof = 0.55 * lisse01(rive - 1.0, rive - 3.5, dvb) + 0.45 * lisse01(rive - 3.5, 0.3 * rive, dvb)
    # berges : banc de galets large à l'intérieur des méandres, berge raide et étroite (3-4 px) à l'extérieur,
    # herbe grasse partout ailleurs ; l'herbe mange la berge par endroits
    mange = lisse01(-0.2, 0.2, n40)
    larg_berge = 3.5 + 13.0 * interieur * virage + 1.5 * n2
    m_berge = lisse01(rive + larg_berge + 1.5, rive + larg_berge - 1.0, dvb)
    m_vase = lisse01(rive + 2.0 + 0.8 * n2, rive + 0.3, dvb)
    m_raide = exterieur * virage * lisse01(rive + 4.5, rive + 2.5, dvb)
    m_vase = np.maximum(m_vase, 0.8 * m_raide)
    # liseré de vase discontinu : l'herbe descend jusqu'à l'eau sur environ un tiers des rives (pas de cerne continu)
    m_vase *= 0.3 + 0.7 * lisse01(-0.3, 0.1, bruit(W, H, 30 * s, graine + 33, octaves=3))
    m_galets = 0.85 * m_berge * lisse01(0.2, 0.7, 0.5 * n40 + 0.3 * n2 + 0.8 * interieur * virage) * mange * (1 - m_vase)
    m_hgrasse = lisse01(rive + 15, rive + 6, dvb) * (1 - m_galets) * (1 - m_vase)
    m_nord = lisse01(rive - 5.5, rive - 1.5, dvb) * (latv < 0) * lisse01(0, 1, m_eau)
    dir_c = 0.5 + 0.5 * np.cos(angv)
    dir_s = 0.5 + 0.5 * np.sin(-angv)                               # repère Blender : y vers le haut

    # ---- ponts : tablier de 28 px, long de 2 × la demi-largeur de l'eau + 40 px ; deux chevalets de pieux dans l'eau
    ponts = []
    d_pont = np.full((H, W), 1e9, dtype=np.float32)
    m_remous = np.zeros((H, W), dtype=np.float32)
    for (px, py, a, a_riv) in croisements:
        r = max(10.0, val(rive, px, py))
        L = 2 * r + 40
        ca, sa = math.cos(a), math.sin(a)
        chevalets = [-0.45 * r, 0.45 * r]
        piles = []
        for u in chevalets:
            for v in (-LARG_PONT / 2 + 2.5, 0.0, LARG_PONT / 2 - 2.5):
                piles.append((px + ca * u - sa * v, py + sa * u + ca * v))
        ponts.append({"x": px, "y": py, "angle": a, "rive": r, "L": L, "largeur": LARG_PONT, "chevalets": chevalets})
        d_pont = np.minimum(d_pont, np.hypot(x - px, y - py))
        # remous clair autour des pieux, étiré vers l'aval (le courant va dans le sens de la polyligne de la rivière)
        cr, sr = math.cos(a_riv), math.sin(a_riv)
        for (qx, qy) in piles:
            ux_ = (x - qx) * cr + (y - qy) * sr - 2.5
            vy_ = -(x - qx) * sr + (y - qy) * cr
            m_remous = np.maximum(m_remous, np.exp(-((ux_ / 5.5) ** 2 + (vy_ / 2.2) ** 2)))
    m_remous *= m_eau

    # ---- route : bord irrégulier (qui se resserre sur le tablier des ponts), ornières qui dérivent et s'effacent,
    # flaques, touffes d'herbe qui entament le bord, plaques de terre tassée ou poussiéreuse, plaques humides près de l'eau
    serre = lisse01(55, 34, d_pont)
    # largeur de 30 à 38 px qui ondule lentement
    bord = DEMI_ROUTE - (DEMI_ROUTE - LARG_PONT / 2) * serre + (3.0 * n1 + 2.0 * n2) * (1 - serre)
    m_route = lisse01(bord + 2.5, bord - 2.5, dr)
    # touffes d'herbe (haute fréquence) qui reprennent la terre dans la bande bord − 3 … bord (+ 1 px de fondu)
    n3f = bruit(W, H, 3 * s, graine + 9, octaves=2)
    touffe = lisse01(0.4, 0.56, n6 + 0.4 * n3f) * lisse01(bord - 5.0, bord - 2.5, dr) * (1 - serre)
    m_route = m_route * (1 - touffe)
    # bas-côté d'herbe plus haute : discontinu (absent sur environ 40 % du tracé), deux fois plus léger
    m_verge = lisse01(bord + 0.8, bord + 2.2, dr) * lisse01(bord + 5.8, bord + 3.8, dr) * (1 - serre) \
        * 0.5 * lisse01(-0.1, 0.3, n40)
    m_verge = np.maximum(m_verge, 0.35 * touffe)
    # ornières : écart qui dérive lentement, intensité qui s'efface sur 30 à 40 % de la longueur ; dans les virages
    # serrés, les deux traces se fondent en une seule bande centrale (les charrettes coupent la corde)
    sr_, kr_ = courbure(route)
    fusion = lisse01(0.0075, 0.014, np.abs(np.interp(absc, sr_, kr_))).astype(np.float32)
    k1 = (6.0 + 2.5 * n150) * (1 - fusion)
    w1 = np.clip(1.6 + 0.6 * n2, 0.9, 2.4) * (1 + 0.9 * fusion)
    inten = lisse01(0.35, 0.6, 0.5 + 0.8 * n150) * (1 - 0.3 * fusion)
    orn = np.exp(-((np.abs(lat) - k1) / w1) ** 2) * inten
    orn2 = 0.35 * np.exp(-((np.abs(lat) - 9.5 - 0.8 * n1) / 1.3) ** 2) * np.clip(0.3 + 1.8 * n150b, 0, 1) * inten \
        * (1 - fusion)
    m_orn = np.clip(orn + orn2, 0, 1) * lisse01(bord, bord - 4, dr)
    m_crete = np.exp(-(lat / 2.2) ** 2) * 0.27 * np.clip(0.3 + 0.9 * n150b, 0, 1) * lisse01(bord, bord - 6, dr) \
        * inten * (1 - fusion)
    m_flaque = np.zeros((H, W), dtype=np.float32)
    m_bord_flaque = np.zeros((H, W), dtype=np.float32)
    longueur = float(absc.max())
    for k in range(int(rng.integers(3, 6))):
        a0 = rng.uniform(0.12, 0.88) * longueur
        lg = rng.uniform(3.0, 4.2)                      # flaque de 10 px de long au plus
        cote = rng.choice([-1, 1])
        f = np.exp(-((absc - a0) / lg) ** 2) * np.exp(-((lat - cote * k1) / (w1 + 0.4)) ** 2) + 0.22 * n6 + 0.1 * n2
        fl = lisse01(0.5, 0.64, f)
        m_flaque = np.maximum(m_flaque, fl)
        m_bord_flaque = np.maximum(m_bord_flaque, 0.55 * np.clip(lisse01(0.36, 0.48, f) - fl, 0, 1))
    loin_eau = (dv > rive + 15) * lisse01(bord, bord - 4, dr)
    m_flaque *= loin_eau
    m_bord_flaque *= loin_eau
    m_cailloux = lisse01(DEMI_ROUTE - 3, DEMI_ROUTE + 1, dr) * lisse01(DEMI_ROUTE + 6, DEMI_ROUTE + 2, dr) * lisse01(0.45, 0.75, n6)
    m_cailloux *= (1 - serre)
    # matière de la terre : ± 8 % de L* à l'échelle de 20 à 60 px (plaques tassées plus sombres, poussière plus claire)
    n_terre = 0.7 * bruit(W, H, 45 * s, graine + 30, octaves=2) + 0.3 * bruit(W, H, 20 * s, graine + 31, octaves=2)
    m_tassee = lisse01(0.04, 0.3, -n_terre)
    m_poussiere = lisse01(0.04, 0.3, n_terre)
    # plaques humides plus sombres à moins de 40 px de la rivière
    m_humide = lisse01(rive + 40, rive + 18, dv) * lisse01(-0.15, 0.2, bruit(W, H, 14 * s, graine + 32, octaves=3))

    # ---- sentiers : de la porte des places fortes à la route, 14 px, même terre que la route (ornières à 0,3), coupés
    # à 6 px sous l'emprise du sprite ; quelques pavés juste devant la porte
    d_sent = np.full((H, W), 60.0, dtype=np.float32)
    lat_sent = np.zeros((H, W), dtype=np.float32)
    for pts in sentiers(carte):
        ds, ls, _, _ = champ_distance(pts, W, H, 40)
        mieux = ds < d_sent
        d_sent[mieux] = ds[mieux]
        lat_sent[mieux] = ls[mieux]
    sous_place = empreinte_places(carte, W, H, COUPE_SENTIER)
    demi = LARG_SENTIER / 2
    m_sentier = lisse01(demi + 1.7, demi - 1.7, d_sent + 1.2 * n2) * (1 - lisse01(bord - 2, bord - 6, dr)) \
        * (1 - sous_place)
    orn_sent = 0.3 * np.exp(-((np.abs(lat_sent) - 3.0) / 1.1) ** 2) * lisse01(demi, demi - 2, d_sent) \
        * (1 - sous_place) * (1 - lisse01(bord - 2, bord - 6, dr))
    m_orn = np.maximum(m_orn, orn_sent)
    m_route = np.maximum(m_route, m_sentier)
    m_paves = np.zeros((H, W), dtype=np.float32)
    for (gx, gy, ux, uy, _, _, _) in portes(carte):
        cx, cy = gx + ux * 5, gy + uy * 5
        m_paves = np.maximum(m_paves, lisse01(9.5, 6.5, np.hypot(x - cx, y - cy) + 2.0 * n6 + 1.0 * n3f))
    m_route = np.maximum(m_route, m_paves)
    # les assombrissements ne s'empilent pas dans les ornières (déjà sombres) : l'axe de la route reste lisible
    # (valeur HSV ≥ 0,33 contrôlée par verifier.py), même là où ornière fondue, plaque tassée et plaque humide se croisent
    m_tassee *= 1 - 0.6 * m_orn
    m_humide *= m_route * (1 - 0.5 * m_orn)

    # ---- clairières des places fortes : disque irrégulier (≈ 76 px ± 25 % selon l'angle), fondu sur 26 px
    clair = np.zeros((H, W), dtype=np.float32)
    anneau = np.zeros((H, W), dtype=bool)             # 40 px de sol autour de chaque clairière (contrôle de verifier.py)
    boites = []
    centres = []
    for k, (ex, ey, bt, _) in enumerate(emprises(carte)):
        boites.append((ex + bt[0] - 14, ey + bt[1] - 14, ex + bt[2] + 14, ey + bt[3] + 14))
        cx, cy = ex + (bt[0] + bt[2]) / 2, ey + (bt[1] + bt[3]) / 2 + 6
        theta = np.arctan2(y - cy, x - cx)
        rr = 76.0 * (1 + 0.25 * bruit_angle(theta, graine + 20 + k))
        hx, hy = (bt[2] - bt[0]) / 2 + 12, (bt[3] - bt[1]) / 2 + 12
        r_boite = 1.0 / np.maximum(np.abs(np.cos(theta)) / hx, np.abs(np.sin(theta)) / hy)
        rr = np.maximum(rr, r_boite)
        d = np.hypot(x - cx, y - cy) + 3.0 * n2
        clair = np.maximum(clair, lisse01(rr + 13, rr - 13, d))
        anneau |= (d > rr) & (d < rr + 40)
        centres.append((cx, cy))

    # ---- plaine (ellipse du jeu, lisière à anses et avancées) ; forêt (densité des arbres) tenue loin de la route,
    # des emplacements de tours, de l'eau et des clairières (le même masque que celui des clairières)
    a, b = (x - 500) / 445, (y - 330) / 285
    e = a * a + b * b + 0.2 * n3 + 0.03 * n1
    m_foret0 = lisse01(0.88, 0.97, e)
    d_emp = np.full((H, W), 1e9, dtype=np.float32)
    for (ex, ey) in carte["emplacements"] + carte["emplacementsRivaux"]:
        d_emp = np.minimum(d_emp, np.hypot(x - ex, y - ey))
    m_foret = m_foret0 * lisse01(50, 66, d_emp) * (1 - clair) * lisse01(36, 56, np.minimum(dr, d_sent + 20)) \
        * lisse01(rive + 1, rive + 5, dv)
    # herbe : grandes taches plus sèches / plus grasses, herbe usée par plaques le long de la route (atténuée de 40 %)
    m_var = np.clip(0.5 + 0.6 * n3 + 0.25 * n1, 0, 1)
    m_use = lisse01(DEMI_ROUTE + 8, DEMI_ROUTE, dr) * np.clip(0.12 + 0.6 * n2, 0, 0.6)

    # ---- douves : seulement si la rivière passe au pied des murs (son axe à moins de 25 px de la boîte au sol)
    m_douve = np.zeros((H, W), dtype=np.float32)
    sols = []
    for (ex, ey, bt, _) in emprises(carte):
        sol = (ex + bt[0] + 6, ey - 30, ex + bt[2] - 6, ey + bt[3] - 2)
        sols.append(sol)
        dxs = np.maximum(np.maximum(sol[0] - x, x - sol[2]), 0)
        dys = np.maximum(np.maximum(sol[1] - y, y - sol[3]), 0)
        dsol = np.hypot(dxs, dys)
        proche = (dsol < 25) & (dv < 1.0)
        if proche.any():
            anneau_douve = lisse01(5, 7, dsol) * lisse01(17, 15, dsol)
            jj, ii = np.nonzero(proche)
            k = int(np.argmin(dsol[jj, ii]))
            px, py = (ii[k] + 0.5) / s, (jj[k] + 0.5) / s
            cx, cy = min(max(px, sol[0]), sol[2]), min(max(py, sol[1]), sol[3])
            lg = max(1.0, math.hypot(px - cx, py - cy))
            fosse = np.exp(-(np.abs((x - cx) * (py - cy) - (y - cy) * (px - cx)) / lg / 6) ** 2)
            fosse *= ((x - cx) * (px - cx) + (y - cy) * (py - cy) >= 0) * (np.hypot(x - cx, y - cy) <= lg + 4)
            m_douve = np.maximum(m_douve, np.maximum(anneau_douve, lisse01(0.4, 0.7, fosse)))
            C.journal("douve autour de la place forte en (%d, %d), reliée à la rivière" % (ex, ey))
    if m_douve.max() > 0:
        m_eau = np.maximum(m_eau, m_douve)
        m_prof = np.maximum(m_prof, m_douve * 0.5)

    return {
        "route": m_route, "ornieres": m_orn, "crete": m_crete, "eau": m_eau, "prof": m_prof, "berge": m_berge,
        "vase": m_vase, "galets": m_galets, "herbe_grasse": m_hgrasse, "nord": m_nord, "dir_c": dir_c, "dir_s": dir_s,
        "flaques": m_flaque, "bord_flaques": m_bord_flaque, "cailloux": m_cailloux, "douve": m_douve, "remous": m_remous,
        "verge": m_verge, "sentier": m_sentier, "tassee": m_tassee, "poussiere": m_poussiere, "humide": m_humide,
        "paves": m_paves, "touffes": touffe, "fusion": fusion,
        "foret": m_foret, "foret0": m_foret0, "clairiere": clair, "variation": m_var, "usure": np.clip(m_use, 0, 1),
        "dist_route": dr, "dist_riviere": dv, "dist_riviere_b": dvb, "rive": rive, "riviere": riviere, "n1": n1, "n2": n2,
        "interieur": interieur * virage, "angle_riviere": angv, "anneau_clairiere": anneau,
        "boites": boites, "sols": sols, "ponts": ponts, "centres_clairieres": centres,
    }


def ecrire_masque(nom, canaux):
    """Écrit 4 canaux 0..1 dans un PNG RGBA du cache (lu par Blender en « Non-Color »)."""
    arr = np.stack([np.clip(c, 0, 1) for c in canaux], axis=-1)
    chemin = os.path.join(C.CACHE, nom + ".png")
    Image.fromarray((arr * 255 + 0.5).astype(np.uint8), "RGBA").save(chemin)
    return chemin


# ---------------------------------------------------------------- végétation : plan (sans Blender), puis instances
# Modèles (Poly Haven, CC0) : hauteur (m) et portée de la cime depuis le tronc (m), à l'échelle 1.
MODELES = {"arbre_a": ("tree_small_02", 4.5, 2.3), "arbre_b": ("island_tree_02", 3.4, 2.6),
           "arbre_clair": ("tree_small_02", 4.5, 2.3), "arbuste": ("shrub_04", 0.25, 0.4),
           "rochers": ("rock_moss_set_01", 1.1, 4.0)}


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


def planifier_vegetation(carte, mq, graine):
    """Positions de toute la végétation (px logiques), sans Blender : forêt (troncs à plus de 48 px de l'axe de la route,
    sous-bois à plus de 40 px, et aucune ombre portée sur la route), lisière et fondu des clairières (jeunes arbres et
    buissons), franges de joncs, bosquets de la plaine, buissons, rochers.
    Renvoie une liste de dicts {col, x, y, rot, echelle (sx, sy, sz), dz, incl, role, portee_px}."""
    W, H = TAILLE_MASQUE
    s = W / LARG
    foret, foret0, clair = mq["foret"], mq["foret0"], mq["clairiere"]
    dr, dv, rive = mq["dist_route"], mq["dist_riviere"], mq["rive"]
    rnd = random.Random(graine)
    plan = []

    def mval(arr, x, y):
        return float(arr[min(H - 1, max(0, int(y * s))), min(W - 1, max(0, int(x * s)))])

    def hors_cadre(x, y):
        return x < 0 or y < 0 or x >= LARG or y >= HAUT

    def dans_boite(x, y, marge=0.0):
        return any(b[0] - marge <= x <= b[2] + marge and b[1] - marge <= y <= b[3] + marge for b in mq["boites"])

    def ombre_sur_route(x, y, hauteur_px, marge=DEMI_ROUTE + 6):
        """Soleil au nord-ouest à 45° : l'ombre de la cime tombe vers le sud-est, à une distance égale à sa hauteur."""
        for t in (0.4, 0.55, 0.7, 0.85, 1.0):
            px, py = x + 0.707 * hauteur_px * t, y + 0.707 * hauteur_px * t
            if not hors_cadre(px, py) and mval(dr, px, py) < marge:
                return True
        return False

    def ajouter(col, x, y, e, role, sxy=1.0, dz=-0.05, incl=(0.0, 0.0), rot=None):
        plan.append({"col": col, "x": x, "y": y, "rot": rnd.uniform(0, 6.283) if rot is None else rot,
                     "echelle": (e * sxy, e * sxy, e) if not isinstance(sxy, tuple) else (e * sxy[0], e * sxy[1], e),
                     "dz": dz, "incl": incl, "role": role, "portee_px": MODELES.get(col, ("", 0, 0.5))[2] * e * 10 *
                     (sxy if not isinstance(sxy, tuple) else max(sxy))})

    # ---- forêt
    def zone_foret(x, y):
        if hors_cadre(x, y):
            xx, yy = min(LARG - 1, max(0, x)), min(HAUT - 1, max(0, y))
            return mval(clair, xx, yy) < 0.25 and mval(dr, xx, yy) > MARGE_TRONC_ROUTE
        if mval(dr, x, y) < MARGE_TRONC_ROUTE:
            return False
        if mval(dv, x, y) < mval(rive, x, y) + 3:          # pas de tronc dans l'eau (la cime, elle, peut déborder)
            return False
        return mval(foret, x, y) > 0.5 + 0.2 * rnd.random()

    rejets = 0
    for (x, y) in poisson(zone_foret, 27, graine + 11, (-40, -40, LARG + 40, HAUT + 40)):
        col = "arbre_b" if rnd.random() < 0.38 else "arbre_a"
        e = rnd.uniform(1.05, 1.4) if col == "arbre_b" else rnd.uniform(1.25, 1.75)
        haut_px = MODELES[col][1] * e * 10
        portee = MODELES[col][2] * e * 10
        if not hors_cadre(x, y) and (mval(dr, x, y) < DEMI_ROUTE + 2 + 0.85 * portee or ombre_sur_route(x, y, haut_px)):
            rejets += 1
            continue
        ajouter(col, x, y, e, "foret", incl=(rnd.uniform(-0.06, 0.06), rnd.uniform(-0.06, 0.06)))

    def zone_sous_bois(x, y):
        if hors_cadre(x, y):
            xx, yy = min(LARG - 1, max(0, x)), min(HAUT - 1, max(0, y))
            return mval(clair, xx, yy) < 0.25 and mval(dr, xx, yy) > MARGE_SOUS_BOIS_ROUTE
        if mval(dr, x, y) < MARGE_SOUS_BOIS_ROUTE or mval(dv, x, y) < mval(rive, x, y) + 3:
            return False
        return mval(foret, x, y) > 0.5 + 0.2 * rnd.random()

    for (x, y) in poisson(zone_sous_bois, 19, graine + 16, (-20, -20, LARG + 20, HAUT + 20), maxi=1600):
        e = rnd.uniform(0.4, 0.62)
        if not hors_cadre(x, y) and ombre_sur_route(x, y, MODELES["arbre_b"][1] * e * 10):
            continue
        ajouter("arbre_b", x, y, e, "sous_bois")

    exclus = [tuple(p) for p in carte["emplacements"] + carte["emplacementsRivaux"]]

    def libre(x, y, marge_route=30, marge_emp=46, marge_eau=RIVE + 7, clairiere=True):
        if hors_cadre(x, y) or dans_boite(x, y, 6):
            return False
        if mval(dr, x, y) < marge_route or mval(dv, x, y) < marge_eau or (clairiere and mval(clair, x, y) > 0.2):
            return False
        return all(math.hypot(x - ex, y - ey) > marge_emp for ex, ey in exclus)

    # ---- lisière et fondu des clairières : jeunes arbres et buissons (shrub_04)
    def lisiere(x, y):
        if hors_cadre(x, y):
            return False
        f, c = mval(foret, x, y), mval(clair, x, y)
        bord_foret = 0.06 < f < 0.5
        bord_clair = 0.12 < c < 0.85 and mval(foret0, x, y) > 0.35
        if not (bord_foret or bord_clair) or dans_boite(x, y, 2):
            return False
        return libre(x, y, 40, 50, clairiere=False)

    for (x, y) in poisson(lisiere, 14, graine + 12, (0, 0, LARG, HAUT), maxi=420):
        if rnd.random() < 0.55:
            e = rnd.uniform(0.6, 0.95)
            if ombre_sur_route(x, y, MODELES["arbre_a"][1] * e * 10):
                continue
            ajouter("arbre_a", x, y, e, "lisiere")
        else:
            ajouter("arbuste", x, y, rnd.uniform(2.0, 2.8), "lisiere", dz=-0.02)

    # ---- joncs : franges continues, étirées le long de la rive, sur environ 15 % des rives (plutôt à l'intérieur des
    # méandres, où l'eau est lente), loin des ponts, de la route et des emplacements
    bruit_berge = mq["n1"]
    inter = mq["interieur"]
    angv = mq["angle_riviere"]

    def berge(x, y):
        if hors_cadre(x, y):
            return False
        r = mval(rive, x, y)
        if not (r - 1 < mval(dv, x, y) < r + 4.5):
            return False
        if mval(bruit_berge, x, y) + 0.35 * mval(inter, x, y) < 0.3:
            return False
        return libre(x, y, 34, 50, 0)

    for (x, y) in poisson(berge, 3, graine + 17, (0, 0, LARG, HAUT), maxi=700):
        a = mval(angv, x, y)
        ajouter("joncs", x, y, rnd.uniform(0.75, 1.05), "joncs", sxy=(2.5, 1.0), dz=-0.02, rot=-a + rnd.uniform(-0.15, 0.15))

    # ---- plaine : bosquets de 2 à 4 arbres à cime pleine et claire (aucune ombre sur la route), buissons, rochers
    def plaine(x, y, marge_route=36):
        return (not hors_cadre(x, y)) and mval(foret, x, y) < 0.05 and libre(x, y, marge_route, 52)

    nb_bosquets = 0
    for k, (x, y) in enumerate(poisson(plaine, 170, graine + 13, (0, 0, LARG, HAUT), maxi=4)):
        for i in range(rnd.randint(2, 4)):
            px, py = x + rnd.uniform(-18, 18), y + rnd.uniform(-18, 18)
            e = rnd.uniform(1.15, 1.45)
            if plaine(px, py) and not ombre_sur_route(px, py, MODELES["arbre_clair"][1] * e * 10):
                ajouter("arbre_clair", px, py, e, "bosquet", sxy=(1.35, 1.35))
                plan[-1]["echelle"] = (e * 1.35, e * 1.35, e * 0.85)       # cime large et pleine, ombre moins longue
                nb_bosquets += 1
    for (x, y) in poisson(lambda x, y: plaine(x, y, 60), 95, graine + 14, (0, 0, LARG, HAUT), maxi=6):
        ajouter("arbuste", x, y, rnd.uniform(2.2, 3.0), "buisson", dz=-0.02)
    for (x, y) in poisson(lambda x, y: plaine(x, y) or (not hors_cadre(x, y) and 0.2 < mval(foret, x, y) < 0.7
                                                       and not dans_boite(x, y)),
                          90, graine + 15, (0, 0, LARG, HAUT), maxi=6):
        ajouter("rochers", x, y, rnd.uniform(0.12, 0.2), "rocher", dz=-0.25)
    C.journal("végétation prévue : %d arbres de forêt (%d écartés pour la route), %d arbres de bosquets, %d touffes de joncs"
              % (sum(1 for p in plan if p["role"] == "foret"), rejets, nb_bosquets, sum(1 for p in plan if p["role"] == "joncs")))
    return plan


def ecrire_controle(id_carte, mq, sous_bois):
    """Masques de contrôle pour verifier.py (atelier/sources-3d/_cache/controle-terrain-<carte>.png, 2000 × 1320) :
    R = sol visible dans l'anneau de 40 px autour des clairières (hors cimes, route et eau) ; G = plaine de référence
    (herbe loin de la forêt, de la route, de l'eau et des clairières)."""
    libre = (sous_bois < 0.3) & (mq["route"] < 0.1) & (mq["eau"] < 0.1)
    r = mq["anneau_clairiere"] & libre
    g = (mq["foret0"] < 0.01) & libre & (mq["clairiere"] < 0.05) & (mq["berge"] < 0.05) & (mq["dist_route"] > 30) \
        & (mq["dist_riviere"] > 30) & (mq["verge"] < 0.05)
    arr = np.stack([r, g, np.zeros_like(r)], axis=-1).astype(np.uint8) * 255
    chemin = os.path.join(C.CACHE, "controle-terrain-%s.png" % id_carte)
    Image.fromarray(arr, "RGB").save(chemin)
    return chemin


def couverture_cimes(plan):
    """Sol de forêt : seulement sous les cimes réellement posées (disque un peu élargi autour de chaque arbre de forêt,
    de sous-bois et de lisière, adouci) ; partout ailleurs, l'herbe. Plus de bande de sol nu sans arbre."""
    W, H = TAILLE_MASQUE
    s = W / LARG
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)
    for p in plan:
        if p["role"] not in ("foret", "sous_bois", "lisiere") or p["col"] == "arbuste":
            continue
        r = (p["portee_px"] * 0.72 + 1.5) * s
        x, y = p["x"] * s, p["y"] * s
        d.ellipse((x - r, y - r, x + r, y + r), fill=255 if p["role"] != "lisiere" else 150)
    im = im.filter(ImageFilter.GaussianBlur(3 * s))
    return np.array(im, dtype=np.float32) / 255.0


# ---------------------------------------------------------------- sol (relief + matière)
def hauteurs(mq, nx, ny):
    """Relief du sol (m) sur une grille nx × ny : ondulations douces, collines en forêt, lit de la rivière en pente
    douce (0,42 m de fond ; la ligne d'eau tombe à rive − 1, soit une largeur d'eau visible de 2 × rive)."""
    def ech(a):
        return np.array(Image.fromarray(a.astype(np.float32), "F").resize((nx, ny), Image.BILINEAR), dtype=np.float32)
    n1, foret, dv, route = ech(mq["n1"]), ech(mq["foret"]), ech(mq["dist_riviere_b"]), ech(mq["route"])
    clair, rive, douve = ech(mq["clairiere"]), ech(mq["rive"]), ech(mq["douve"])
    h = 0.25 * n1 + 1.4 * foret * (0.5 + 0.5 * n1)
    h = h * lisse01(rive, rive + 25, dv)
    # la surface de l'eau (NIVEAU_EAU = −0,3 m) coupe le lit à dv = rive − 1 : largeur visible ≈ 2 × rive
    lit = 0.42 * (1 - lisse01(rive - 7, rive + 10, dv))
    h = h - lit - 0.5 * douve
    h = h * (1 - 0.7 * route * (lit < 0.05)) * (1 - 0.6 * clair * (lit < 0.05))
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


def _masques_noeuds(nt, noms):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    res = []
    for nom in noms:
        im = nt.nodes.new("ShaderNodeTexImage")
        im.image = C.image(nom, non_couleur=True)
        im.extension = "EXTEND"
        nt.links.new(tc.outputs["UV"], im.inputs["Vector"])
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(im.outputs["Color"], sep.inputs["Color"])
        res.append({"R": sep.outputs["Red"], "G": sep.outputs["Green"], "B": sep.outputs["Blue"], "A": im.outputs["Alpha"]})
    return tc, res


def mat_sol(noms):
    """Matière du sol : herbes mêlées, sol de forêt sous les cimes, piste de terre sèche (ornières, flaques, cailloux,
    plaques tassées ou poussiéreuses, plaques humides près de l'eau), bas-côté discontinu, sentiers de la même terre,
    pavés devant les portes, berges (vase, galets, herbe grasse), herbe à peine piétinée aux abords des places.

    Chaque photo est recalée sur une teinte cible (teinte par la luminance) ; toutes sont projetées en coordonnées du
    monde (X, Y), jamais selon le tracé de la route."""
    m, nt, p = C.nouveau_materiau("sol")
    N, L = nt.nodes.new, nt.links.new
    tc, mk = _masques_noeuds(nt, noms)
    obj = tc.outputs["Object"]
    route, orn, crete = mk[0]["R"], mk[0]["G"], mk[0]["B"]
    foret, clair, var, usure = mk[1]["R"], mk[1]["G"], mk[1]["B"], mk[1]["A"]
    vase, galets, hgrasse, flaques = mk[2]["R"], mk[2]["G"], mk[2]["B"], mk[2]["A"]
    cailloux = mk[3]["R"]
    verge, bord_flaques = mk[4]["R"], mk[4]["B"]
    tassee, poussiere, humide, paves = mk[5]["R"], mk[5]["G"], mk[5]["B"], mk[5]["A"]

    def photo(ident, taille, cible, contraste=1.3, garde=0.2):
        t = _tex(nt, ident, "diff", obj, taille)
        return C.teinter_luminance(nt, t.outputs["Color"], ident, cible, contraste, garde)

    def fois(sortie, k):
        mm = N("ShaderNodeMath"); mm.operation = "MULTIPLY"; mm.inputs[1].default_value = k
        L(sortie, mm.inputs[0])
        return mm.outputs[0]
    h1 = photo("aerial_grass_rock", 13.0, PALETTE["herbe"], 1.6, 0.12)
    h2 = photo("leafy_grass", 2.6, PALETTE["herbe_grasse"], 1.5, 0.15)
    h3 = photo("rocky_terrain_02", 24.0, PALETTE["herbe_sombre"], 1.4, 0.2)
    herbe = _mix(nt, var, h1, h2)
    herbe = _mix(nt, 0.25, herbe, h3)
    seche = photo("aerial_grass_rock", 13.0, PALETTE["herbe_seche"], 1.5, 0.15)
    herbe = _mix(nt, usure, herbe, seche)
    # bas-côté : herbe un peu plus sombre et plus haute qui borde la piste par endroits (absente sur 40 % du tracé)
    herbe = _mix(nt, verge, herbe, photo("leafy_grass", 2.0, PALETTE["bas_cote"], 1.4, 0.1))
    sf = photo("forest_ground_04", 3.2, PALETTE["sous_bois"])
    coul = _mix(nt, foret, herbe, sf)
    # piste de terre sèche : photo sans contraste ajouté, mêlée à moitié à une boue plus régulière ; plaques tassées
    # plus sombres et poussière plus claire (± 8 % de L*, taches de 20 à 60 px) ; le sentier des portes est de la même
    # terre (plus de terre claire en goutte au pied des places)
    terre = _mix(nt, 0.5, photo("dirt_aerial_02", 9.0, PALETTE["terre"], 0.45, 0.05), photo("brown_mud", 1.8, PALETTE["terre"], 0.8, 0.08))
    terre = _mix(nt, fois(tassee, 0.75), terre, photo("brown_mud", 2.3, PALETTE["terre_tassee"], 1.0, 0.08))
    terre = _mix(nt, fois(poussiere, 0.75), terre, photo("dirt_aerial_02", 7.0, PALETTE["poussiere"], 0.5, 0.05))
    boue = photo("brown_mud", 1.8, PALETTE["orniere"], 1.0)
    terre_orn = _mix(nt, orn, terre, boue)
    terre_orn = _mix(nt, crete, terre_orn, herbe)
    terre_orn = _mix(nt, cailloux, terre_orn, photo("river_small_rocks", 1.6, PALETTE["galets"], 1.2, 0.1))
    # plaques humides plus sombres près de la rivière (terre assombrie, un peu plus brune)
    # (multiplication par une teinte chaude : luminance × 0,6 environ, saturation un peu plus forte)
    terre_orn = _mix(nt, fois(humide, 0.75), terre_orn, _mix(nt, 1.0, terre_orn, C.couleur("#d2c6b4"), "MULTIPLY"))
    # flaques : reflet du ciel (gris clair, très lisse) cerné d'un liseré humide sombre de 2-3 px
    terre_orn = _mix(nt, bord_flaques, terre_orn, C.couleur(PALETTE["flaque_bord"]))
    terre_orn = _mix(nt, flaques, terre_orn, C.couleur(PALETTE["flaque"]))
    # quelques pavés juste devant la porte des places (cobblestone_01, pierres d'environ 0,5 m, opacité 0,5)
    terre_orn = _mix(nt, fois(paves, 0.5), terre_orn, photo("cobblestone_01", 2.6, PALETTE["paves"], 1.25, 0.1))
    # abords des places fortes : herbe à peine piétinée (60 % du masque, plus de disque clair)
    pietinee = photo("aerial_grass_rock", 13.0, PALETTE["pietinee"], 1.3, 0.1)
    coul = _mix(nt, fois(clair, 0.6), coul, pietinee)
    coul = _mix(nt, route, coul, terre_orn)
    # berges : herbe grasse, banc de galets (intérieur des méandres), vase humide et talus raide près de l'eau
    coul = _mix(nt, hgrasse, coul, photo("leafy_grass", 2.0, "#4a6229", 1.5, 0.1))
    coul = _mix(nt, galets, coul, photo("river_small_rocks", 2.4, PALETTE["banc"], 1.15, 0.15))
    coul = _mix(nt, vase, coul, photo("brown_mud", 1.8, PALETTE["vase"], 1.2, 0.2))
    L(coul, p.inputs["Base Color"])
    # rugosité : les flaques sont lisses comme un miroir, la vase brille un peu
    rug = N("ShaderNodeMapRange")
    rug.inputs["To Min"].default_value = 0.92
    rug.inputs["To Max"].default_value = 0.05
    mx = N("ShaderNodeMath"); mx.operation = "MAXIMUM"
    L(flaques, mx.inputs[0])
    mv = N("ShaderNodeMath"); mv.operation = "MULTIPLY"; mv.inputs[1].default_value = 0.45
    L(vase, mv.inputs[0])
    L(mv.outputs[0], mx.inputs[1])
    L(mx.outputs[0], rug.inputs["Value"])
    L(rug.outputs["Result"], p.inputs["Roughness"])
    p.inputs["Specular IOR Level"].default_value = 0.3
    # relief fin : normales de l'herbe et de la terre, ornières en creux
    nh = _tex(nt, "aerial_grass_rock", "nor_gl", obj, 13.0, non_couleur=True)
    nterre = _tex(nt, "brown_mud", "nor_gl", obj, 1.8, non_couleur=True)
    nmix = _mix(nt, route, nh.outputs["Color"], nterre.outputs["Color"])
    nm = N("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 1.1
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


def eau(noms):
    """Plan d'eau qui absorbe fort : le fond (brun-vert) ne se voit que sur les 2-3 px du bord, puis vert-bleu sombre
    (#24332c) jusqu'au milieu ; reflet de ciel factice uniforme (0,18 à 0,25 d'un ciel #8fa2a8 sur toute la surface : en
    vue de dessus orthographique, le Fresnel ne donne presque rien) ; normale de rides (bruit de 40 cm étiré dans le sens
    du courant, force 0,15) qui fait naître quelques éclats de soleil et un dégradé ; bande sombre sous la rive nord
    (ombre de la berge) ; remous clair autour des pieux des ponts."""
    m, nt, p = C.nouveau_materiau("eau")
    N, L = nt.nodes.new, nt.links.new
    tc, mk = _masques_noeuds(nt, noms)
    prof, dir_c, dir_s = mk[0]["B"], mk[0]["G"], mk[0]["A"]
    nord, remous = mk[1]["G"], mk[1]["B"]
    ramp = N("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.0, C.couleur(PALETTE["eau_bord"])
    els[1].position, els[1].color = 1.0, C.couleur(PALETTE["eau_fond"])
    e = els.new(0.55)
    e.color = C.couleur(PALETTE["eau_milieu"])
    L(prof, ramp.inputs["Factor"])
    # coordonnées tournées selon la tangente locale : u le long du courant, v en travers
    sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["Object"], sep.inputs[0])

    def vers_angle(sortie):
        mm = N("ShaderNodeMath"); mm.operation = "MULTIPLY_ADD"
        L(sortie, mm.inputs[0]); mm.inputs[1].default_value = 2.0; mm.inputs[2].default_value = -1.0
        return mm.outputs[0]
    c, s_ = vers_angle(dir_c), vers_angle(dir_s)

    def prod(a, b):
        mm = N("ShaderNodeMath"); mm.operation = "MULTIPLY"
        L(a, mm.inputs[0]); L(b, mm.inputs[1])
        return mm.outputs[0]

    def som(a, b, op="ADD"):
        mm = N("ShaderNodeMath"); mm.operation = op
        L(a, mm.inputs[0]); L(b, mm.inputs[1])
        return mm.outputs[0]
    u = som(prod(sep.outputs["X"], c), prod(sep.outputs["Y"], s_))
    v = som(prod(sep.outputs["Y"], c), prod(sep.outputs["X"], s_), "SUBTRACT")

    def bruit_courant(etire_u, etire_v, echelle, detail):
        cmb = N("ShaderNodeCombineXYZ")
        mu = N("ShaderNodeMath"); mu.operation = "MULTIPLY"; mu.inputs[1].default_value = etire_u
        mv = N("ShaderNodeMath"); mv.operation = "MULTIPLY"; mv.inputs[1].default_value = etire_v
        L(u, mu.inputs[0]); L(v, mv.inputs[0])
        L(mu.outputs[0], cmb.inputs["X"]); L(mv.outputs[0], cmb.inputs["Y"])
        nz = N("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = echelle
        nz.inputs["Detail"].default_value = detail
        L(cmb.outputs["Vector"], nz.inputs["Vector"])
        return nz
    # grandes nappes (modulent le reflet du ciel) et rides fines de 40 cm, étirées dans le sens du courant
    nappes = bruit_courant(0.35, 2.4, 3.0, 6.0)
    rides = bruit_courant(0.45, 1.6, 2.5, 4.0)
    reflet = N("ShaderNodeMapRange")
    reflet.inputs["From Min"].default_value = 0.3
    reflet.inputs["From Max"].default_value = 0.7
    reflet.inputs["To Min"].default_value = 0.18
    reflet.inputs["To Max"].default_value = 0.22
    L(nappes.outputs["Factor"], reflet.inputs["Value"])
    coul = _mix(nt, reflet.outputs["Result"], ramp.outputs["Color"], C.couleur(PALETTE["ciel_reflet"]))
    # remous clair autour des pieux
    rm = N("ShaderNodeMath"); rm.operation = "MULTIPLY"; rm.inputs[1].default_value = 0.6
    L(remous, rm.inputs[0])
    coul = _mix(nt, rm.outputs[0], coul, C.couleur(PALETTE["remous"]))
    # bande sombre sous la rive nord
    ombre = N("ShaderNodeMapRange")
    ombre.inputs["To Min"].default_value = 1.0
    ombre.inputs["To Max"].default_value = 0.6
    L(nord, ombre.inputs["Value"])
    coul = C._multiplier(nt, coul, ombre.outputs["Result"])
    L(coul, p.inputs["Base Color"])
    # surface d'eau (F0 ≈ 2 %) assez lisse pour des éclats, assez rugueuse pour un dégradé de reflet du soleil
    p.inputs["Roughness"].default_value = 0.3
    p.inputs["Specular IOR Level"].default_value = 0.2
    b = N("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.15
    b.inputs["Distance"].default_value = 0.1
    L(rides.outputs["Factor"], b.inputs["Height"])
    L(b.outputs["Normal"], p.inputs["Normal"])
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    co = [(0, 0), (LARG * M, 0), (LARG * M, HAUT * M), (0, HAUT * M)]
    f = bm.faces.new([bm.verts.new((x, y, NIVEAU_EAU)) for x, y in co])
    for lp, (uu, vv) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = (uu, vv)
    return C.objet_maillage("eau", bm, m)


# ---------------------------------------------------------------- pont de bois
def mats_pont():
    """Planches de bois clair grisé (lisibles sous les troupes), longerons sombres, garde-corps clair, rampes de terre de
    la route bordées de pierre."""
    return {"planche": C.mat_ph("planche", "weathered_planks", echelle_m=2.0, cible="#9a8566", contraste=1.25, bosse=0.4),
            "planche_sombre": C.mat_ph("planche_s", "weathered_planks", echelle_m=2.0, cible="#6e5338", contraste=1.2, bosse=0.4),
            "planche_usee": C.mat_ph("planche_u", "weathered_planks", echelle_m=2.0, cible="#ad9a78", contraste=1.1, bosse=0.3),
            "poutre": C.mat_ph("poutre", "medieval_wood", echelle_m=1.5, cible="#5b4632", contraste=1.2, bosse=0.4),
            "rampe": C.mat_ph("rampe", "medieval_wood", echelle_m=1.5, cible="#b9a885", contraste=1.0, bosse=0.2),
            "terre": C.mat_ph("terre_rampe", "dirt_aerial_02", echelle_m=9.0, cible=PALETTE["terre"], contraste=1.0, bosse=0.3),
            "pierre": C.mat_ph("culee", "rustic_stone_wall", echelle_m=1.5, cible="#8a8170", contraste=1.2, bosse=0.5,
                               occlusion=0.3)}


def pont(nom, g, mats, z=0.22):
    """Pont de planches dans l'axe de la route (g : géométrie calculée par masques(), px logiques) : tablier de 28 px
    (plus étroit que la route, dont les bords viennent s'y resserrer), long de 2 × rive + 40 px (rapport longueur /
    largeur ≥ 2) ; planches de valeur variable, deux plus sombres, usure claire au milieu ; longerons de 0,18 m ;
    garde-corps clairs fins (main courante de 0,08 m à 0,5 m au-dessus du tablier, 4 poteaux par côté) ; deux chevalets
    de trois pieux dans l'eau ; rampes de terre (celle de la route) bordées de pierre, 1,6 m dans l'axe, 0,35 m de haut."""
    objs = []
    a = g["angle"]
    ca, sa = math.cos(a), math.sin(a)
    L, Lg = g["L"], g["largeur"]
    rz = -a                          # dans Blender, l'axe Y est retourné : l'angle change de signe
    rnd = random.Random(int(g["x"] * 7 + g["y"]))

    def Pt(u, v, zz):
        return monde(g["x"] + ca * u - sa * v, g["y"] + sa * u + ca * v, zz)

    n = int(L * M / 0.3)
    sombres = set(rnd.sample(range(1, n - 1), 2)) if n > 4 else set()
    for k in range(n):
        u = -L / 2 + (k + 0.5) * L / n
        mat = mats["planche_sombre"] if k in sombres else mats["planche"]
        dz = z + rnd.uniform(-0.012, 0.012)
        rzk = rz + rnd.uniform(-0.025, 0.025)
        lg = Lg * M * rnd.uniform(0.96, 1.0)
        for part, (v0, v1) in enumerate(((-0.5, -0.2), (-0.2, 0.2), (0.2, 0.5))):
            mp = mats["planche_usee"] if part == 1 and k not in sombres else mat
            o = C.boite(nom + "_pl%d_%d" % (k, part), L * M / n - 0.035, lg * (v1 - v0) + 0.002, 0.08, (0, 0, 0), mp)
            o.location = Pt(u, (v0 + v1) / 2 * lg / M, dz)
            o.rotation_euler = (0, 0, rzk)
            objs.append(o)
    for cote in (-1, 1):
        v = cote * (Lg / 2 - 0.9)
        o = C.boite(nom + "_long%d" % cote, L * M + 0.3, 0.18, 0.18, (0, 0, 0), mats["poutre"])
        o.location = Pt(0, v, z - 0.18)
        o.rotation_euler.z = rz
        objs.append(o)
        o = C.boite(nom + "_main%d" % cote, L * M * 0.92, 0.08, 0.08, (0, 0, 0), mats["rampe"])
        o.location = Pt(0, v, z + 0.08 + 0.42)
        o.rotation_euler.z = rz
        objs.append(o)
        for k in range(4):
            u = -L * 0.45 + k * L * 0.9 / 3
            o = C.boite(nom + "_pot%d_%d" % (cote, k), 0.08, 0.08, 0.55, (0, 0, 0), mats["rampe"])
            o.location = Pt(u, v, z + 0.05)
            o.rotation_euler.z = rz
            objs.append(o)
    # chevalets : trois pieux dans l'eau sous une traverse
    for u in g["chevalets"]:
        for v in (-Lg / 2 + 2.5, 0.0, Lg / 2 - 2.5):
            o = C.cylindre(nom + "_pieu%d_%d" % (int(u), int(v)), 0.1, 1.45, (0, 0, 0), mats["poutre"], segments=8)
            o.location = Pt(u, v, -1.25)
            objs.append(o)
        o = C.boite(nom + "_traverse%d" % int(u), 0.22, Lg * M - 0.2, 0.2, (0, 0, 0), mats["poutre"])
        o.location = Pt(u, 0, z - 0.34)
        o.rotation_euler.z = rz
        objs.append(o)
    # rampes d'accès : terre de la route, bordures de pierre, en pente vers la berge
    pente = math.atan2(z + 0.06, 1.6)
    for sgn in (-1, 1):
        u = sgn * (L / 2 + 7.5)
        o = C.boite(nom + "_rampe%d" % sgn, 1.75, Lg * M + 0.3, 0.35, (0, 0, 0), mats["terre"], base=False)
        o.location = Pt(u, 0, (z + 0.06) / 2 - 0.17)
        o.rotation_euler = (0, sgn * pente, rz)
        objs.append(o)
        for cote in (-1, 1):
            o = C.boite(nom + "_bordure%d%d" % (sgn, cote), 1.75, 0.22, 0.3, (0, 0, 0), mats["pierre"], base=False)
            o.location = Pt(u, cote * (Lg / 2 + 2.2), (z + 0.06) / 2 - 0.12)
            o.rotation_euler = (0, sgn * pente, rz)
            objs.append(o)
    return objs


# ---------------------------------------------------------------- végétation : instances Blender
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


def teinter_feuillage(col, teinte, force=0.35, valeur=1.0, tout=False):
    """Rapproche les feuillages d'une teinte commune (vert d'été un peu chaud) sans perdre leurs nuances."""
    vus = set()
    for o in col.objects:
        for m in o.data.materials if o.type == "MESH" else []:
            if m is None or m.name in vus:
                continue
            if not tout and "leav" not in m.name.lower() and "_leaves" not in m.name:
                continue
            vus.add(m.name)
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


def collection_joncs():
    """Touffe de joncs / carex modélisée ici (CC0) : 85 feuilles fines presque verticales (vue de dessus, elles ne
    forment plus d'étoile), vert olive clair et paille ; l'instance est étirée le long de la rive."""
    col = bpy.data.collections.new("joncs")
    rnd = random.Random(7)
    vert = C.mat_simple("jonc_vert", "#7f8c4a", rugosite=0.7)
    paille = C.mat_simple("jonc_paille", "#b8a970", rugosite=0.8)
    for mat, nb in ((vert, 60), (paille, 25)):
        bm = bmesh.new()
        for k in range(nb):
            a = rnd.uniform(0, 2 * math.pi)
            h = rnd.uniform(0.8, 1.4)
            pench = rnd.uniform(0.02, 0.12)
            w = rnd.uniform(0.012, 0.022)
            r0 = rnd.uniform(0.0, 0.07)
            pts = []
            for i in range(5):
                t = i / 4
                r = r0 + pench * t * t
                pts.append(V((r * math.cos(a), r * math.sin(a), h * t)))
            perp = V((-math.sin(a), math.cos(a), 0))
            vs = []
            for i, p in enumerate(pts):
                ww = w * (1 - i / 4.5)
                vs.append((bm.verts.new(p - perp * ww), bm.verts.new(p + perp * ww)))
            for i in range(4):
                bm.faces.new((vs[i][0], vs[i][1], vs[i + 1][1], vs[i + 1][0]))
        me = bpy.data.meshes.new("jonc")
        bm.to_mesh(me)
        bm.free()
        me.materials.append(mat)
        ob = bpy.data.objects.new("jonc", me)
        # pas d'ombre portée : à 45° de soleil, l'ombre d'une touffe de 1,2 m faisait une tache noire de 12 px (« araignée »)
        ob.visible_shadow = False
        col.objects.link(ob)
    return col


def instance(col, nom, loc, rot_z, echelle, inclinaison=(0.0, 0.0)):
    e = bpy.data.objects.new(nom, None)
    e.instance_type = "COLLECTION"
    e.instance_collection = col
    e.location = loc
    e.rotation_euler = (inclinaison[0], inclinaison[1], rot_z)
    e.scale = echelle if isinstance(echelle, tuple) else (echelle, echelle, echelle)
    return C.lier(e)


def instancier_vegetation(plan, h_sol):
    """Pose les instances du plan (forêt, lisière, joncs, bosquets, buissons, rochers) sur le relief."""
    cols = {}
    for cle, (ident, _, _) in MODELES.items():
        cols[cle] = charger_modele(ident, cle)
    for cle in ("arbre_a", "arbre_b"):
        teinter_feuillage(cols[cle], "#4f6b2a", force=0.3, valeur=0.92)
    # arbres des bosquets : même modèle, cime pleine et plus claire (ils ne se lisent plus comme des buissons morts)
    teinter_feuillage(cols["arbre_clair"], "#5a7a2e", force=0.35, valeur=1.15)
    teinter_feuillage(cols["arbuste"], "#5d7a32", force=0.35, valeur=1.3, tout=True)
    cols["joncs"] = collection_joncs()
    ny, nx = h_sol.shape

    def z_sol(x, y):
        i = min(nx - 1, max(0, int(min(LARG - 1, max(0, x)) / LARG * (nx - 1))))
        j = min(ny - 1, max(0, int(min(HAUT - 1, max(0, y)) / HAUT * (ny - 1))))
        return float(h_sol[j, i])
    for k, p in enumerate(plan):
        instance(cols[p["col"]], "%s%d" % (p["role"], k), monde(p["x"], p["y"], z_sol(p["x"], p["y"]) + p["dz"]), p["rot"],
                 p["echelle"], p["incl"])


# ---------------------------------------------------------------- aperçu sans Blender
def apercu(id_carte, dossier):
    """Aperçu rapide (sans Blender) : couleurs plates tirées des masques, cimes prévues en disques. Sert à contrôler les
    clairières, la lisière, les sentiers, les ponts et les franges de joncs avant un rendu de 15 minutes."""
    carte = lire_cartes()[id_carte]
    graine = C.graine("terrain-" + id_carte)
    mq = masques(carte, graine)
    plan = planifier_vegetation(carte, mq, graine)
    sb = couverture_cimes(plan)
    W, H = TAILLE_MASQUE

    def c(h):
        return np.array(C.rgb8(h), dtype=np.float32)
    img = np.zeros((H, W, 3), dtype=np.float32) + c(PALETTE["herbe"])
    for cle, coul, k in (("verge", "bas_cote", 1.0), ("clairiere", "pietinee", 0.6)):
        img = img * (1 - k * mq[cle][..., None]) + c(PALETTE[coul]) * k * mq[cle][..., None]
    img = img * (1 - sb[..., None]) + c(PALETTE["sous_bois"]) * sb[..., None]
    terre = np.zeros_like(img) + c(PALETTE["terre"])
    for cle, coul, k in (("tassee", "terre_tassee", 0.75), ("poussiere", "poussiere", 0.75), ("ornieres", "orniere", 1.0),
                         ("humide", "terre_humide", 0.75), ("flaques", "flaque", 1.0), ("paves", "paves", 0.5)):
        terre = terre * (1 - k * mq[cle][..., None]) + c(PALETTE[coul]) * k * mq[cle][..., None]
    img = img * (1 - mq["route"][..., None]) + terre * mq["route"][..., None]
    for cle, coul in (("galets", "banc"), ("vase", "vase")):
        img = img * (1 - mq[cle][..., None]) + c(PALETTE[coul]) * mq[cle][..., None]
    eau = c(PALETTE["eau_bord"]) * (1 - mq["prof"][..., None]) + c(PALETTE["eau_milieu"]) * mq["prof"][..., None]
    eau = eau * (1 - mq["remous"][..., None]) + c(PALETTE["remous"]) * mq["remous"][..., None]
    img = img * (1 - mq["eau"][..., None]) + eau * mq["eau"][..., None]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((LARG, HAUT), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    teintes = {"foret": (40, 62, 30), "sous_bois": (55, 75, 35), "lisiere": (90, 120, 50), "joncs": (170, 160, 100),
               "bosquet": (100, 140, 60), "buisson": (110, 140, 70), "rocher": (130, 130, 120)}
    for p in sorted(plan, key=lambda q: q["role"] != "sous_bois"):
        r = max(1.5, p["portee_px"] * (0.8 if p["role"] != "joncs" else 0.5))
        d.ellipse((p["x"] - r, p["y"] - r, p["x"] + r, p["y"] + r), fill=teintes[p["role"]], outline=(20, 30, 15))
    for g in mq["ponts"]:
        a = g["angle"]
        ca, sa = math.cos(a), math.sin(a)
        pts = [(g["x"] + ca * u - sa * v, g["y"] + sa * u + ca * v) for u, v in
               ((-g["L"] / 2, -g["largeur"] / 2), (g["L"] / 2, -g["largeur"] / 2), (g["L"] / 2, g["largeur"] / 2),
                (-g["L"] / 2, g["largeur"] / 2))]
        d.polygon(pts, fill=(160, 140, 110), outline=(60, 45, 30))
    os.makedirs(dossier, exist_ok=True)
    chemin = os.path.join(dossier, "apercu-terrain-%s.png" % id_carte)
    im.save(chemin)
    C.journal("aperçu écrit : " + chemin)
    return chemin


# ---------------------------------------------------------------- rendu d'une carte
def rendre_terrain(id_carte, essai=False, sortie=None, echantillons=48, zone=None):
    """Rend une carte. essai : taille logique (1000 × 660) ; zone (x0, y0, x1, y1 en px logiques) : seulement ce
    morceau, à la résolution finale (contrôle du détail et du poids JPEG sans tout rendre)."""
    cartes = lire_cartes()
    carte = cartes[id_carte]
    graine = C.graine("terrain-" + id_carte)
    mq = masques(carte, graine)
    plan = planifier_vegetation(carte, mq, graine)
    sous_bois = couverture_cimes(plan)
    ecrire_controle(id_carte, mq, sous_bois)
    un = np.ones_like(mq["eau"])
    m1 = ecrire_masque("masque-%s-1" % id_carte, [mq["route"], mq["ornieres"], mq["crete"], mq["berge"]])
    m2 = ecrire_masque("masque-%s-2" % id_carte, [sous_bois, mq["clairiere"], mq["variation"], mq["usure"]])
    m4 = ecrire_masque("masque-%s-4" % id_carte, [mq["vase"], mq["galets"], mq["herbe_grasse"], mq["flaques"]])
    m5 = ecrire_masque("masque-%s-5" % id_carte, [mq["cailloux"], mq["nord"], mq["remous"], un])
    m6 = ecrire_masque("masque-%s-6" % id_carte, [mq["verge"], mq["sentier"], mq["bord_flaques"], un])
    m7 = ecrire_masque("masque-%s-7" % id_carte, [mq["tassee"], mq["poussiere"], mq["humide"], mq["paves"]])
    m3 = ecrire_masque("masque-%s-3" % id_carte, [mq["eau"], mq["dir_c"], mq["prof"], mq["dir_s"]])
    C.reinitialiser()
    C.installer_lumiere()
    ob_sol, h = sol(mq, [m1, m2, m4, m5, m6, m7], graine)
    eau([m3, m5])
    # le canal R de m5 sert aux cailloux du sol ; l'eau lit la bande nord (G) et le remous (B)
    mats = mats_pont()
    zones_places = mq["sols"]          # pied des murs (et non la clairière) : seul un pont caché sous la place est remplacé
    for k, g in enumerate(mq["ponts"]):
        if any(b[0] <= g["x"] <= b[2] and b[1] <= g["y"] <= b[3] for b in zones_places):
            C.journal("pont %d en (%d, %d) dans l'emprise d'une place forte : remplacé par une passerelle" % (k, g["x"], g["y"]))
            g = dict(g, L=2 * 6 + 20, largeur=20, chevalets=[])
            pont("passerelle%d" % k, g, mats)
            continue
        pont("pont%d" % k, g, mats)
    instancier_vegetation(plan, h)
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
        C.sauver_jpg(img, chemin, qualite=88, max_ko=4000)
        return chemin
    tmp = os.path.join(C.CACHE, "_rendu", "terrain-%s%s.png" % (id_carte, "-essai" if essai else ""))
    img = C.rendre(tmp).convert("RGB")
    if essai:
        chemin = sortie or os.path.join(C.CACHE, "terrain-%s-essai.jpg" % id_carte)
        C.sauver_jpg(img, chemin, qualite=90, max_ko=2000)
        return chemin
    chemin, src = C.chemin_td("terrain-%s.jpg" % id_carte)
    C.sauver_jpg(img, chemin, qualite=80, max_ko=440, plancher=72, masque_debruit=mq["foret0"])
    C.maj_manifeste({"terrain-" + id_carte: C.entree(src, LARG, HAUT, 0, 0)})
    return chemin


# ---------------------------------------------------------------- planche de contrôle des terrains
def planche_terrains(chemin):
    """Planche de contrôle (sans Blender) : les 6 terrains en vue de jeu (places fortes, tours et troupes posées à leur
    taille logique, rival anglais ou omeyyade en alternance), puis pour chaque carte trois détails à la résolution du
    fichier (2 × la taille logique) : premier pont, bout de route des rivaux, bout de route de la France."""
    import planche as PL                      # import ici : planche.py importe déjà ce module
    from PIL import ImageFont
    cartes = lire_cartes()
    ids = [c for c in ("domaine", "gue", "foret", "moulin", "col", "chateau") if c in cartes]

    def police(t, gras=False):
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if gras else ""), t)
        except Exception:
            return ImageFont.load_default()
    L = 2000
    marge, titre = 16, 34
    def vue_jeu(src, carte, rival):
        """Vue de jeu à l'échelle 1 (comme planche.vue_en_jeu, quel que soit le nombre d'emplacements de la carte)."""
        fond = Image.open(src).convert("RGBA").resize((LARG, HAUT), Image.LANCZOS)
        route = carte["route"]
        _, _, lg = PL.sur_route(route, 0)
        emp, riv = carte["emplacements"], carte["emplacementsRivaux"]
        choix = ["tour-archers-france-1", "tour-piquiers-france-2", "tour-baliste-france-3", "tour-archers-france-3",
                 "tour-catapulte-france-2", "tour-archers-france-2"]
        batis = [("place-france-intact", route[0]), ("place-%s-intact" % rival, route[-1])]
        batis += [(choix[i % len(choix)], emp[j]) for i, j in enumerate(range(0, len(emp), 2))]
        batis += [("tour-archers-%s-1" % rival, p) for p in riv[:1]] + [("tour-baliste-%s-1" % rival, p) for p in riv[2:3]]
        for nom, (x, y) in batis:
            PL.poser(fond, "ombre-" + nom, x, y)
        objets = [(y, nom, x, y, 0, False) for nom, (x, y) in batis]
        for s_, cote, m_, nom, im in ((110, -6, False, "unite-fantassins-france", 0), (130, 6, False, "unite-fantassins-france", 2),
                                      (160, 0, False, "unite-cavaliers-france", 1), (lg * 0.55, -6, True, "unite-cavaliers-%s" % rival, 1),
                                      (lg * 0.58, 6, True, "unite-pietaille-%s" % rival, 3), (lg * 0.7, 0, True, "unite-hommes-%s" % rival, 0),
                                      (lg * 0.8, 0, True, "unite-champion-%s" % rival, 2)):
            x, y, _ = PL.sur_route(route, s_, cote)
            objets.append((y, nom, x, y, im, m_))
        for _, nom, x, y, im, m_ in sorted(objets, key=lambda o: o[0]):
            PL.poser(fond, nom, x, y, im, m_)
        return fond

    vues = []
    for k, c in enumerate(ids):
        src = os.path.join(C.TD, "terrain-%s.jpg" % c)
        rival = "angleterre" if k % 2 == 0 else "omeyyades"
        vues.append((c, rival, vue_jeu(src, cartes[c], rival)))
    lv = (L - 4 * marge) // 3
    hv = round(lv * HAUT / LARG)
    # détails à la résolution du fichier
    lz, hz = 300, 210                          # px logiques par détail
    details = []
    for k, c in enumerate(ids):
        carte = cartes[c]
        rival = "angleterre" if k % 2 == 0 else "omeyyades"
        fond = Image.open(os.path.join(C.TD, "terrain-%s.jpg" % c)).convert("RGBA")
        route = carte["route"]
        for nom, (x, y) in (("place-france-intact", route[0]), ("place-%s-intact" % rival, route[-1])):
            PL.poser(fond, "ombre-" + nom, x, y)
        objets = [(route[0][1], "place-france-intact", route[0], 0, False),
                  (route[-1][1], "place-%s-intact" % rival, route[-1], 0, False)]
        _, _, lg = PL.sur_route(route, 0)
        for s_, cote, m_, nom in ((60, -6, False, "unite-fantassins-france"), (78, 6, False, "unite-cavaliers-france"),
                                  (lg - 90, 5, True, "unite-pietaille-%s" % rival), (lg - 70, -5, True, "unite-hommes-%s" % rival)):
            x, y, _ = PL.sur_route(route, s_, cote)
            objets.append((y, nom, (x, y), 1, m_))
        if carte["ponts"]:
            pt = carte["ponts"][0]
            best, s_pont = 1e9, 0
            for s_ in range(0, int(lg), 2):
                x, y, _ = PL.sur_route(route, s_)
                if math.hypot(x - pt["x"], y - pt["y"]) < best:
                    best, s_pont = math.hypot(x - pt["x"], y - pt["y"]), s_
            for ds, cote, im in ((-12, 5, 2), (8, -5, 0)):
                x, y, _ = PL.sur_route(route, s_pont + ds, cote)
                objets.append((y, "unite-cavaliers-%s" % rival, (x, y), im, True))
        for _, nom, (x, y), im, m_ in sorted(objets, key=lambda o: o[0]):
            PL.poser(fond, nom, x, y, im, m_)
        centres = []
        if carte["ponts"]:
            centres.append(("pont", carte["ponts"][0]["x"], carte["ponts"][0]["y"]))
        centres.append(("place des rivaux", route[-1][0] - 60, route[-1][1] - 20))
        centres.append(("place de France", route[0][0] + 60, route[0][1] - 20))
        for nom, cx, cy in centres:
            x0 = int(min(max(cx - lz / 2, 0), LARG - lz))
            y0 = int(min(max(cy - hz / 2, 0), HAUT - hz))
            details.append((c, nom, fond.crop((x0 * 2, y0 * 2, (x0 + lz) * 2, (y0 + hz) * 2))))
    lz2, hz2 = details[0][2].size
    par_ligne = 3
    ech = (L - (par_ligne + 1) * marge) / (par_ligne * lz2)
    lz3, hz3 = int(lz2 * ech), int(hz2 * ech)
    lignes_d = math.ceil(len(details) / par_ligne)
    H = 70 + 2 * (hv + titre + marge) + 60 + lignes_d * (hz3 + titre + marge)
    pl = Image.new("RGB", (L, H), (38, 33, 27))
    d = ImageDraw.Draw(pl)
    d.text((marge, 18), "Terrains de bataille (rendu 3D, vue de dessus) : vues de jeu, sprites à leur taille logique",
           fill=(240, 228, 200), font=police(26, True))
    y = 70
    for k, (c, rival, v) in enumerate(vues):
        x = marge + (k % 3) * (lv + marge)
        yy = y + (k // 3) * (hv + titre + marge)
        d.text((x, yy + 6), "%s (%s ; rival : %s)" % (cartes[c]["nom"], c, rival), fill=(230, 215, 185), font=police(18))
        pl.paste(v.convert("RGB").resize((lv, hv), Image.LANCZOS), (x, yy + titre))
    y += 2 * (hv + titre + marge)
    d.text((marge, y + 14), "Détails à la résolution du fichier (2 × la taille logique), affichés à %.0f %%" % (ech * 100),
           fill=(240, 228, 200), font=police(24, True))
    y += 60
    for k, (c, nom, im) in enumerate(details):
        x = marge + (k % par_ligne) * (lz3 + marge)
        yy = y + (k // par_ligne) * (hz3 + titre + marge)
        d.text((x, yy + 6), "%s : %s" % (c, nom), fill=(230, 215, 185), font=police(18))
        pl.paste(im.convert("RGB").resize((lz3, hz3), Image.LANCZOS), (x, yy + titre))
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    pl.save(chemin, optimize=True)
    C.journal("planche des terrains écrite : %s (%d × %d)" % (chemin, L, H))
    return chemin


def main(args):
    essai = "--essai" in args
    args = [a for a in args if a != "--essai"]
    sortie = None
    zone = None
    if "--planche" in args:
        planche_terrains(args[args.index("--planche") + 1])
        return
    if "--apercu" in args:
        i = args.index("--apercu")
        dossier = args[i + 1]
        args = args[:i] + args[i + 2:]
        for id_carte in (args or list(lire_cartes())):
            apercu(id_carte, dossier)
        return
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
