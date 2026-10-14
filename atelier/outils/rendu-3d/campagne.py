# -*- coding: utf-8 -*-
"""Carte de campagne (vue de dessus, relief) et petits sprites de lieux.

Usage : python3 atelier/outils/rendu-3d/campagne.py [fond] [lieux] [lieu-<camp>[-<variante>] ...] [--essai] [--apercu dossier]
Sorties (jeu/assets/images/campagne/) :
  fond-campagne.jpg 2000 × 1060 (carte du jeu : viewBox 1000 × 530), JPEG ≤ 490 000 octets : carte en relief à la Total
  War, aucun texte, bords teintés de parchemin.
  lieu-france.png (et ses variantes lieu-france-2.png, lieu-france-3.png pour les provinces prises), lieu-angleterre.png,
  lieu-omeyyades.png (80 × 80 px logiques, rendu 160 × 160) : bourgs fortifiés vus de trois quarts, sur une aire de
  terre claire à peine posée (alpha 0,5, bord fondu, sans trait ni ombre ajoutée), bannière deux fois plus grande
  au-dessus des toits ; lieu-brume.png (180 × 100 px logiques) : une large nappe de brume aux bords effilochés, sans
  silhouette ni disque (lieu pas encore ouvert ; dessinée sans Blender ; le jeu désature aussi le terrain dessous).
  Ancrage des lieux : bas-centre moins 16 px.

Relief (même soleil que les champs de bataille : nord-ouest, 45°, versants nord-ouest éclairés, sud-est à l'ombre) :
  - une chaîne continue entre les deux fronts (crête à 3,0 + 0,8 × bruit le long de la crête, relief exagéré × 1,5),
    contreforts perpendiculaires (bruit « en crêtes » étiré en travers de la chaîne), vallées ; roche sur les pentes
    de plus de 30°, éboulis plus clairs au pied ;
  - un massif secondaire sous le col (front ouest) et des contreforts au piémont (front sud), tous deux du côté des
    montagnes ;
  - rivières en splines lissées (Chaikin, 3 passes), méandres (décalage par un bruit de ± 15 px), plus larges vers l'aval
    (6 à 14 px), berges claires et arbres le long de l'eau : la rivière du nord passe au gué, reçoit le ruisseau du
    moulin et se jette dans le fleuve ; le fleuve passe au « Grand Fleuve », le piémont restant du côté des montagnes.
Champs : lanières rectangulaires (blé, labour, pré) groupées en blocs d'orientations variées, haies sombres et fines.
Oliveraie : quatre parcelles aux rangées d'orientations différentes, limites irrégulières sans chemin tracé (pas de 2,5
diamètres de couronne, décalage de ± 20 % et couronnes de taille ± 30 %), couronnes gris-vert, terre ocre entre les rangs.
Plaine du sud gris-olive. Escarpement : relief exagéré × 1,4 (au-delà, la photo de roche s'étirait en traînées), photos
de roche, d'éboulis et de versant en projection triplanaire, maillage plus fin, extrémité ouest en pente douce.
Positions des lieux relevées dans jeu/js/ecran-campagne.js (lecture seule).
"""
import math
import os
import random
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter  # noqa: E402

import terrains as T  # noqa: E402
import places as P  # noqa: E402

V = Vector
LARG, HAUT = 1000, 530
UNITE = 0.1                     # unités Blender par px logique (carte de 100 × 53)
TAILLE_MASQUE = (2000, 1060)
EXAGERATION = 1.4               # relief exagéré : les versants se lisent (plus fort, la roche s'étirait en traînées)

# Tracés de départ (px logiques) : lissés, ondulés et élargis vers l'aval par riviere()
# La rivière du nord passe à l'est du Gué (le bourg est sur la rive ouest, son nom ne touche pas l'eau) ; le ruisseau
# du moulin longe le bourg du Moulin du Val par le nord (le bourg est sur la berge sud).
RIVIERE_NORD = [(356, 22), (340, 62), (326, 98), (314, 130), (300, 166), (262, 214), (214, 262), (182, 318), (164, 380),
                (154, 430), (150, 456)]
RUISSEAU_MOULIN = [(702, 50), (668, 72), (630, 92), (588, 110), (540, 127), (480, 146), (420, 158), (360, 163), (300, 166)]
FLEUVE_SUD = [(-12, 476), (70, 468), (150, 458), (230, 452), (300, 448), (370, 452), (440, 450), (505, 428), (560, 405),
              (600, 402), (650, 425), (720, 455), (790, 462), (860, 448), (930, 458), (1012, 470)]
CRETE = [(110, 270), (200, 262), (300, 255), (400, 262), (500, 254), (600, 260), (700, 252), (800, 258), (900, 250),
         (1012, 256)]

PALETTE = {
    "herbe_n": "#5d6a34", "herbe_n2": "#55652f", "herbe_s": "#7d7656", "herbe_s2": "#877c5d",
    "roche": "#6e665c", "eboulis": "#8e8672", "versant": "#6b6644", "berge": "#a69c7c", "eau": "#34463c", "eau_bord": "#56604a",
    "ble": "#c8b46a", "labour": "#7a5a3a", "pre": "#7d9440", "chaume": "#a89a62", "jachere": "#8b8a52",
    "haie": "#3a4722", "olivier": "#6f7a4e", "terre_olive": "#a88d5c", "chemin": "#b3a27f", "alpage": "#707d42",
}


def positions():
    """Positions des lieux (lecture de jeu/js/ecran-campagne.js)."""
    with open(os.path.join(C.RACINE, "jeu", "js", "ecran-campagne.js"), encoding="utf-8") as f:
        txt = f.read()
    bloc = re.search(r"POSITIONS\s*=\s*\{(.*?)\};", txt, re.S).group(1)
    return {k: (float(x), float(y)) for k, x, y in re.findall(r"(\w+):\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]", bloc)}


# ---------------------------------------------------------------- outils
def chaikin(pts, n=3):
    """Lissage de Chaikin (ligne ouverte, extrémités conservées)."""
    return [tuple(p) for p in C._chaikin([tuple(p) for p in pts], n, ferme=False)]


def riviere(pts, graine, amplitude=15.0, l0=6.0, l1=14.0):
    """Cours d'eau : polyligne densifiée, décalée en travers par un bruit 1D (méandres de ± amplitude px), lissée
    (Chaikin, 3 passes) ; renvoie (points, demi-largeurs) — la largeur croît de l0 à l1 px vers l'aval."""
    dense = []
    for i in range(1, len(pts)):
        (ax, ay), (bx, by) = pts[i - 1], pts[i]
        n = max(1, int(math.hypot(bx - ax, by - ay) / 6))
        for k in range(n):
            dense.append((ax + (bx - ax) * k / n, ay + (by - ay) * k / n))
    dense.append(pts[-1])
    arr = np.array(dense)
    seg = np.diff(arr, axis=0)
    s = np.concatenate([[0], np.cumsum(np.hypot(seg[:, 0], seg[:, 1]))])
    off = (0.7 * T.bruit1d(s, 55.0, graine) + 0.3 * T.bruit1d(s, 23.0, graine + 1)) * amplitude / 0.85
    off[0] = off[-1] = 0.0
    tang = np.gradient(arr, axis=0)
    tang /= np.maximum(np.hypot(tang[:, 0], tang[:, 1]), 1e-6)[:, None]
    norm = np.stack([-tang[:, 1], tang[:, 0]], axis=1)
    arr = arr + norm * off[:, None]
    lisse = chaikin([tuple(p) for p in arr], 3)
    la = np.array(lisse)
    s2 = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(la, axis=0).T))])
    demi = (l0 + (l1 - l0) * s2 / s2[-1]) / 2
    return lisse, demi


def bruit_valeur(u, v, graine, octaves=3):
    """Bruit de valeur 2D (0..1) évalué aux coordonnées (u, v) quelconques (tableaux), fractal."""
    tot = np.zeros_like(u, dtype=np.float32)
    amp, somme = 1.0, 0.0
    for o in range(octaves):
        rng = np.random.default_rng(graine + 97 * o)
        g = rng.random((257, 257)).astype(np.float32)
        uu, vv = u * (2 ** o), v * (2 ** o)
        i0, j0 = np.floor(uu).astype(int), np.floor(vv).astype(int)
        fu, fv = uu - i0, vv - j0
        fu, fv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)
        i0, j0 = i0 % 256, j0 % 256
        a, b = g[j0, i0], g[j0, i0 + 1]
        c, d = g[j0 + 1, i0], g[j0 + 1, i0 + 1]
        tot += amp * ((a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv)
        somme += amp
        amp *= 0.5
    return tot / somme


def distance_points(px, py, x, y):
    """Distance de chaque pixel au plus proche de points (petites listes), et au deuxième (pour les frontières)."""
    d1 = np.full(x.shape, 1e9, dtype=np.float32)
    d2 = np.full(x.shape, 1e9, dtype=np.float32)
    idx = np.zeros(x.shape, dtype=np.int32)
    for k, (a, b) in enumerate(zip(px, py)):
        d = np.hypot(x - a, y - b)
        plus = d < d1
        d2 = np.where(plus, d1, np.minimum(d2, d))
        idx = np.where(plus, k, idx)
        d1 = np.where(plus, d, d1)
    return d1, d2, idx


# ---------------------------------------------------------------- masques et relief
def masques(graine=17):
    W, H = TAILLE_MASQUE
    s = W / LARG
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    x, y = (xx + 0.5) / s, (yy + 0.5) / s
    n1 = T.bruit(W, H, 90 * s, graine + 1)
    n2 = T.bruit(W, H, 25 * s, graine + 2, octaves=4)
    n3 = T.bruit(W, H, 260 * s, graine + 3, octaves=3)
    n4 = T.bruit(W, H, 45 * s, graine + 4, octaves=3)
    pos = positions()

    # ---- chaîne principale : crête continue, contreforts perpendiculaires, vallées
    # la crête est lissée (Chaikin, 5 passes) : sur une ligne brisée, l'abscisse curviligne saute de quelques px à
    # chaque sommet et dessinait des coutures verticales dans le relief
    dc, latc, absc, _ = T.champ_distance(chaikin(CRETE, 5), W, H, 140)
    h_crete = 3.0 + 0.8 * T.bruit1d(absc, 90.0, graine + 5)
    # contreforts : bruit « en crêtes » étiré en travers de la chaîne (lent en travers, plus rapide le long)
    # (moins étirés qu'avant : étirés de 80 px en travers, ils dessinaient sur la face sud des traînées verticales)
    contreforts = 1 - np.abs(2 * bruit_valeur(absc / 40.0, latc / 46.0 + 50, graine + 6, octaves=2) - 1)
    vallees = bruit_valeur(absc / 70.0, latc / 120.0 + 20, graine + 7, octaves=2)
    # l'escarpement s'amincit et s'abaisse en pente douce vers l'ouest (il ne s'arrête plus net vers x = 200)
    debut = T.lisse01(110, 330, x)
    largeur = (44 + 20 * n1 + 12 * n4 + 10 * (contreforts - 0.5)) * (0.45 + 0.55 * debut)  # pied irrégulier (avancées, anses)
    # profil en toit : arête de crête nette, deux versants francs (l'un au soleil, l'autre à l'ombre)
    profil = np.clip(1 - dc / (largeur * 1.5), 0, 1) ** 1.25
    profil = profil * T.lisse01(0.0, 0.25, profil) ** 0.5                 # pied adouci (pas d'arête au bas des versants)
    montagne = profil * debut
    relief = h_crete * profil * (0.7 + 0.35 * contreforts ** 1.5) * (0.7 + 0.3 * vallees) * debut
    # détail « multifractal à crêtes » : arêtes secondaires et ravines d'orientations variées (le relief se lit en
    # facettes claires et sombres, comme sur une carte de campagne, et non comme une bande lisse)
    r1 = 1 - np.abs(2 * bruit_valeur(x / 28.0 + 11, y / 28.0 + 5, graine + 9, octaves=2) - 1)
    r2 = 1 - np.abs(2 * bruit_valeur(x / 11.0 + 3, y / 11.0 + 9, graine + 10, octaves=2) - 1)
    relief += (1.3 * r1 ** 2 + 0.45 * r2 ** 2 * r1) * profil ** 0.7 * debut
    # ---- massif secondaire sous le col (front ouest), contreforts du piémont (front sud, côté montagnes)
    for nom, amp, rx, ry, dy in (("col", 1.9, 70, 55, 8), ("piemont", 1.1, 75, 45, -30)):
        px, py = pos[nom]
        d = np.sqrt(((x - px) / rx) ** 2 + ((y - py - dy) / ry) ** 2)
        crete_m = 1 - np.abs(2 * bruit_valeur(x / 32.0 + 3, y / 32.0 + 7, graine + 8 + len(nom), octaves=2) - 1)
        bosse = amp * np.exp(-d ** 1.7) * (0.55 + 0.6 * crete_m)
        if nom == "col":
            # le col : une ensellure au passage du chemin
            bosse *= 1 - 0.55 * np.exp(-(((x - px) / 22) ** 2 + ((y - py) / 60) ** 2))
        relief = np.maximum(relief, bosse)
        montagne = np.maximum(montagne, 0.7 * np.exp(-d ** 1.7))
    for nom, amp, r in (("citadelle", 0.5, 60), ("chateau", 0.45, 55), ("forteresse", 0.35, 55)):
        px, py = pos[nom]
        relief += amp * np.exp(-(((x - px) / r) ** 2 + ((y - py - 20) / r) ** 2)) * (0.7 + 0.5 * n2)
    h = 0.8 + 0.3 * n3 + 0.2 * n1 + relief

    # ---- rivières : lits creusés, eau, berges claires
    eau = np.zeros((H, W), dtype=np.float32)
    prof = np.zeros((H, W), dtype=np.float32)
    berge = np.zeros((H, W), dtype=np.float32)
    vallee = np.zeros((H, W), dtype=np.float32)
    proche_eau = np.full((H, W), 99.0, dtype=np.float32)
    cours = []
    for k, (pts, a, l0, l1) in enumerate(((RIVIERE_NORD, 12, 6, 10), (RUISSEAU_MOULIN, 7, 4, 7), (FLEUVE_SUD, 15, 10, 14))):
        trace, demi = riviere(pts, graine + 30 + k, a, l0, l1)
        cours.append((trace, demi))
        d, _, ab, _ = T.champ_distance(trace, W, H, 50)
        sd = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(np.array(trace), axis=0).T))])
        r = np.interp(ab, sd, demi) + 0.6 * n2
        eau = np.maximum(eau, T.lisse01(r + 0.6, r - 0.8, d))
        prof = np.maximum(prof, T.lisse01(r - 0.3, 0.0, d))
        berge = np.maximum(berge, T.lisse01(r + 3.2, r + 1.2, d) * (1 - T.lisse01(r + 0.6, r - 0.8, d)))
        vallee = np.maximum(vallee, T.lisse01(r + 40, r + 3, d))
        proche_eau = np.minimum(proche_eau, d - r)
    h = h * (1 - 0.85 * vallee * (1 - 0.6 * montagne)) + 0.55 * vallee - 0.15 * eau
    h = h * EXAGERATION

    # ---- climat : nord tempéré, sud sec (transition bruitée au pied de la chaîne)
    sud = T.lisse01(250, 330, y + 30 * n1)
    # ---- pentes : roche au-delà de 30°, éboulis plus clairs au pied des versants
    gy, gx = np.gradient(h)
    pente = np.degrees(np.arctan(np.hypot(gx, gy) / (UNITE / s)))
    roche = T.lisse01(26, 34, pente + 4 * n2) * T.lisse01(0.12, 0.3, montagne)
    eboulis = 0.75 * T.lisse01(14, 22, pente) * (1 - roche) * T.lisse01(0.04, 0.12, montagne) * (1 - T.lisse01(0.18, 0.32, montagne))
    # ---- forêts : taches, plus denses au nord et autour de la forêt de l'ouest ; pins clairsemés au sud
    fx, fy = pos["foret"]
    f = 0.55 * n3 + 0.45 * n4 + 0.6 * np.exp(-(((x - fx) / 110) ** 2 + ((y - fy) / 70) ** 2)) - 0.15 * sud
    foret = T.lisse01(0.12, 0.22, f) * (1 - T.lisse01(0.35, 0.7, montagne))
    flancs = T.lisse01(0.15, 0.3, montagne) * (1 - T.lisse01(0.45, 0.7, montagne)) * T.lisse01(-0.1, 0.25, n4) * (1 - roche)
    maquis = 0.22 * sud * T.lisse01(-0.2, 0.3, n2 + 0.5 * n4) * (1 - T.lisse01(0.3, 0.6, montagne))
    foret = np.maximum(np.maximum(foret, 0.8 * flancs), maquis) * T.lisse01(4, 10, proche_eau)
    # ---- champs : autour du domaine et des bourgs, en plaine, hors forêt et hors eau
    champs = np.zeros((H, W), dtype=np.float32)
    for nom, (px, py) in pos.items():
        r = 125 if nom == "domaine" else 72
        champs = np.maximum(champs, T.lisse01(1.0, 0.5, ((x - px) / r) ** 2 + ((y - py) / (r * 0.8)) ** 2 + 0.3 * n4))
    champs *= (1 - np.clip(foret * 2, 0, 1)) * (1 - T.lisse01(0.2, 0.45, montagne)) * T.lisse01(3, 8, proche_eau)
    champs *= (1 - 0.6 * sud)
    # ---- oliveraie : 4 parcelles autour des Oliveraies (au nord du fleuve)
    ox, oy = pos["oliveraie"]
    oliviers = T.lisse01(1.0, 0.55, ((x - ox) / 150) ** 2 + ((y - oy + 8) / 62) ** 2 + 0.2 * n4) * sud
    oliviers *= T.lisse01(4, 12, proche_eau) * (1 - T.lisse01(0.25, 0.5, montagne))
    champs *= (1 - T.lisse01(0.05, 0.3, oliviers))
    foret *= (1 - T.lisse01(0.05, 0.3, oliviers))
    # alpage du col : pâturage d'herbe claire dans l'ensellure, entre les hauteurs rocheuses (le passage se lit)
    cx_, cy_ = pos["col"]
    alpage = T.lisse01(46, 28, np.hypot((x - cx_) / 1.2, y - (cy_ - 18)) + 6 * n2)
    roche *= (1 - alpage)
    eboulis *= (1 - alpage)
    foret *= (1 - alpage)

    return {"h": h, "eau": eau, "prof": prof, "berge": berge, "sud": sud, "foret": foret, "champs": champs,
            "oliviers": oliviers, "roche": roche, "eboulis": eboulis, "variation": np.clip(0.5 + 0.7 * n4, 0, 1),
            "versant": T.lisse01(0.1, 0.4, montagne + 0.08 * n2),
            "montagne": montagne, "proche_eau": proche_eau, "cours": cours, "alpage": alpage}


def parcelles(mq, graine=23):
    """Champs en lanières rectangulaires : blocs (cellules de Voronoï de graines espacées d'environ 45 px), chacun avec
    son orientation, sa largeur de lanière (5 à 9 px) et son décalage ; couleur tirée par lanière (blé, labour, pré,
    chaume, jachère) ; haies fines et sombres sur certaines limites de lanières et sur toutes les limites de blocs.
    Calculé à la moitié de la résolution, puis agrandi sans lissage. Renvoie (couleur RGB 0..1, haie 0..1)."""
    W, H = TAILLE_MASQUE[0] // 2, TAILLE_MASQUE[1] // 2
    s = W / LARG
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    x, y = (xx + 0.5) / s, (yy + 0.5) / s
    rng = np.random.default_rng(graine)
    champs = np.array(Image.fromarray(mq["champs"]).resize((W, H), Image.BILINEAR))
    sud = np.array(Image.fromarray(mq["sud"]).resize((W, H), Image.BILINEAR))
    gx, gy = [], []
    for j in range(0, HAUT + 45, 45):
        for i in range(0, LARG + 45, 45):
            gx.append(i + rng.uniform(-18, 18))
            gy.append(j + rng.uniform(-18, 18))
    d1, d2, idx = distance_points(gx, gy, x, y)
    n = len(gx)
    angles = rng.choice([0.0, 0.35, -0.3, 1.25, -1.1, 0.8], n) + rng.uniform(-0.12, 0.12, n)
    larg = rng.uniform(5.0, 9.0, n)
    dec = rng.uniform(0, 9, n)
    a = angles[idx]
    u = x * np.cos(a) + y * np.sin(a)
    q = (u + dec[idx]) / larg[idx]
    bande = np.floor(q).astype(np.int64)
    frac = q - bande
    h = (bande * 7919 + idx * 104729) % 1000 / 1000.0
    nord_cols = [PALETTE["ble"], PALETTE["labour"], PALETTE["pre"], PALETTE["chaume"], PALETTE["jachere"], PALETTE["pre"]]
    sud_cols = [PALETTE["ble"], PALETTE["labour"], PALETTE["chaume"], "#9a8a5c", PALETTE["jachere"], "#8c7a52"]

    def palette(cols):
        tab = np.array([C.rgb8(c) for c in cols], dtype=np.float32) / 255.0
        return tab[np.minimum((h * len(cols)).astype(int), len(cols) - 1)]
    coul = palette(nord_cols) * (1 - sud[..., None]) + palette(sud_cols) * sud[..., None]
    # léger grain de labour à l'intérieur de chaque lanière (sillons parallèles)
    sillon = 0.94 + 0.06 * np.sin(q * 2 * math.pi * 4)
    coul *= sillon[..., None]
    haie_bande = ((frac < 0.1) | (frac > 0.96)) & ((bande * 31 + idx * 17) % 3 == 0)
    haie_bloc = (d2 - d1) < 1.3
    haie = (haie_bande | haie_bloc).astype(np.float32) * T.lisse01(0.3, 0.6, champs)
    coul = Image.fromarray((np.clip(coul, 0, 1) * 255).astype(np.uint8)).resize(TAILLE_MASQUE, Image.NEAREST)
    haie = Image.fromarray((haie * 255).astype(np.uint8)).resize(TAILLE_MASQUE, Image.BILINEAR)
    return np.array(coul, dtype=np.float32) / 255.0, np.array(haie, dtype=np.float32) / 255.0


def plan_oliviers(mq, graine=31):
    """Oliviers : 4 parcelles (Voronoï de 4 graines dans l'oliveraie), séparées par des chemins de 3 px ; dans chaque
    parcelle, rangées alignées selon son orientation, pas de 2,5 × le diamètre de la couronne (2,2 px), décalage de
    ± 20 % du pas, couronnes de taille ± 30 %. Renvoie [(x, y, rayon_px)] et le masque des chemins."""
    rnd = random.Random(graine)
    W, H = TAILLE_MASQUE
    s = W / LARG
    pos = positions()
    ox, oy = pos["oliveraie"]
    graines = [(ox - 90, oy - 10), (ox - 20, oy + 25), (ox + 60, oy - 12), (ox + 120, oy + 18)]
    angles = [0.25, -0.35, 0.05, 0.6]
    diam = 2.2
    pas = 2.5 * diam
    oliv = mq["oliviers"]
    pts = []
    xs = np.arange(ox - 190, ox + 190, 1.0)
    ys = np.arange(oy - 90, oy + 90, 1.0)
    X, Y = np.meshgrid(xs, ys)
    d1, d2, idx = distance_points([g[0] for g in graines], [g[1] for g in graines], X, Y)
    for k, (gx, gy) in enumerate(graines):
        a = angles[k]
        ca, sa = math.cos(a), math.sin(a)
        for i in range(-45, 46):
            for j in range(-25, 26):
                u, v = i * pas, j * pas
                px = gx + u * ca - v * sa + rnd.uniform(-0.2, 0.2) * pas
                py = gy + u * sa + v * ca + rnd.uniform(-0.2, 0.2) * pas
                if not (0 <= px < LARG and 0 <= py < HAUT):
                    continue
                ii, jj = int(round(px - xs[0])), int(round(py - ys[0]))
                if not (0 <= ii < X.shape[1] and 0 <= jj < X.shape[0]):
                    continue
                if idx[jj, ii] != k or d2[jj, ii] - d1[jj, ii] < 1.2 + 1.6 * rnd.random():   # limites irrégulières
                    continue
                if oliv[min(H - 1, int(py * s)), min(W - 1, int(px * s))] < 0.45:
                    continue
                pts.append((px, py, diam / 2 * rnd.uniform(0.7, 1.3)))
    # plus de chemins tirés au cordeau entre les parcelles (ils dessinaient un grand « Λ ») : les rangées changent
    # seulement d'orientation d'une parcelle à l'autre, à une limite irrégulière
    return pts, np.zeros((H, W), dtype=np.float32)


# ---------------------------------------------------------------- matière
def mat_carte(noms, img_champs):
    m, nt, p = C.nouveau_materiau("carte")
    N, L = nt.nodes.new, nt.links.new
    tc, mk = T._masques_noeuds(nt, noms)
    obj = tc.outputs["Object"]
    eau, sud, foret, champs = mk[0]["R"], mk[0]["G"], mk[0]["B"], mk[0]["A"]
    oliviers, roche, var, haie = mk[1]["R"], mk[1]["G"], mk[1]["B"], mk[1]["A"]
    eboulis, berge, prof, chemin = mk[2]["R"], mk[2]["G"], mk[2]["B"], mk[2]["A"]
    versant, alpage = mk[3]["R"], mk[3]["G"]

    def photo(ident, taille, cible, contraste=1.3, garde=0.15, triplanaire=False):
        t = T._tex(nt, ident, "diff", obj, taille)
        if triplanaire:                 # versants raides : la photo n'est plus étirée le long de la pente
            t.projection = "BOX"
            t.projection_blend = 0.35
        return C.teinter_luminance(nt, t.outputs["Color"], ident, cible, contraste, garde)
    herbe_n = T._mix(nt, var, photo("aerial_grass_rock", 16.0, PALETTE["herbe_n"], 1.3), photo("rocky_terrain_02", 20.0, PALETTE["herbe_n2"], 1.2))
    # plaine du sud : gris-olive (valeur −12 %, saturation −20 % par rapport à l'ancien ocre)
    herbe_s = T._mix(nt, var, photo("aerial_grass_rock", 16.0, PALETTE["herbe_s"], 1.2), photo("rocky_terrain_02", 20.0, PALETTE["herbe_s2"], 1.2))
    sol = T._mix(nt, sud, herbe_n, herbe_s)
    # versants : pelouse rase brun-olive, éboulis au pied, roche sur les pentes de plus de 30°
    sol = T._mix(nt, versant, sol, photo("rocky_terrain_02", 12.0, PALETTE["versant"], 1.4, 0.1, True))
    sol = T._mix(nt, eboulis, sol, photo("rocky_terrain_02", 9.0, PALETTE["eboulis"], 1.3, 0.1, True))
    sol = T._mix(nt, roche, sol, photo("aerial_rocks_02", 9.0, PALETTE["roche"], 1.5, 0.15, True))
    sol = T._mix(nt, alpage, sol, photo("aerial_grass_rock", 12.0, PALETTE["alpage"], 1.2, 0.1))
    # champs en lanières (image calculée par parcelles()), grain de la terre par-dessus, haies sombres
    im = N("ShaderNodeTexImage")
    im.image = C.image(img_champs)
    im.interpolation = "Closest"
    L(tc.outputs["UV"], im.inputs["Vector"])
    grain = photo("dirt_aerial_02", 4.0, "#808080", 0.8, 0.0)
    parcelle = T._mix(nt, 0.3, im.outputs["Color"], grain, "OVERLAY")
    parcelle = T._mix(nt, haie, parcelle, C.couleur(PALETTE["haie"]))
    sol = T._mix(nt, champs, sol, parcelle)
    # oliveraie : terre ocre entre les rangs, chemins clairs entre les parcelles (les couronnes sont des instances)
    sol = T._mix(nt, oliviers, sol, photo("dirt_aerial_02", 6.0, PALETTE["terre_olive"], 0.9, 0.1))
    sol = T._mix(nt, chemin, sol, C.couleur(PALETTE["chemin"]))
    # sous-bois sombre sous les cimes instanciées
    v06 = N("ShaderNodeValue")
    v06.outputs[0].default_value = 0.55
    sombre = C._multiplier(nt, herbe_n, v06.outputs[0])
    sol = T._mix(nt, foret, sol, sombre)
    # berges claires, eau du bord au milieu
    sol = T._mix(nt, berge, sol, photo("river_small_rocks", 3.0, PALETTE["berge"], 1.1, 0.1))
    e = T._mix(nt, prof, C.couleur(PALETTE["eau_bord"]), C.couleur(PALETTE["eau"]))
    sol = T._mix(nt, eau, sol, e)
    L(sol, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.9
    p.inputs["Specular IOR Level"].default_value = 0.2
    nr = T._tex(nt, "rocky_terrain_02", "nor_gl", obj, 7.0, non_couleur=True)
    nm = N("ShaderNodeNormalMap")
    fr = N("ShaderNodeMath"); fr.operation = "MULTIPLY"; fr.inputs[1].default_value = 0.5
    L(roche, fr.inputs[0])
    L(fr.outputs[0], nm.inputs["Strength"])
    L(nr.outputs["Color"], nm.inputs["Color"])
    L(nm.outputs["Normal"], p.inputs["Normal"])
    return m


def houppier(nom, teintes, sud_teintes=None):
    """Collection d'un houppier bosselé (sphère déformée) dont la couleur varie par instance (et selon « sud »)."""
    col = bpy.data.collections.new(nom)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    for v in bm.verts:
        v.co.z *= 0.75
        x, y, z = v.co
        v.co *= 1 + 0.12 * math.sin(x * 7 + y * 5) + 0.08 * math.sin(y * 11 - z * 9 + 1.3) + 0.06 * math.cos(x * 15 + z * 13)
    me = bpy.data.meshes.new(nom)
    bm.to_mesh(me)
    bm.free()
    for pl in me.polygons:
        pl.use_smooth = True
    m, nt, p = C.nouveau_materiau("feuillage_" + nom)
    info = nt.nodes.new("ShaderNodeObjectInfo")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = C.couleur(teintes[0])
    ramp.color_ramp.elements[1].color = C.couleur(teintes[1])
    nt.links.new(info.outputs["Random"], ramp.inputs["Factor"])
    sortie = ramp.outputs["Color"]
    if sud_teintes:
        attr = nt.nodes.new("ShaderNodeAttribute")
        attr.attribute_type = "INSTANCER"
        attr.attribute_name = "sud"
        ramp2 = nt.nodes.new("ShaderNodeValToRGB")
        ramp2.color_ramp.elements[0].color = C.couleur(sud_teintes[0])
        ramp2.color_ramp.elements[1].color = C.couleur(sud_teintes[1])
        nt.links.new(info.outputs["Random"], ramp2.inputs["Factor"])
        sortie = T._mix(nt, attr.outputs["Fac"], sortie, ramp2.outputs["Color"])
    nt.links.new(sortie, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.9
    p.inputs["Specular IOR Level"].default_value = 0.2
    C._grain(nt, p, 0.6, 9.0)
    me.materials.append(m)
    col.objects.link(bpy.data.objects.new(nom, me))
    return col


def arbres(mq, h, nx, ny, oliviers_pts, pas=4.3, graine=5):
    """Forêts (houppiers semés en grille jittée selon le masque), arbres le long des rivières, oliviers alignés.
    Tous portent leur ombre, comme les arbres des cartes de campagne des jeux de stratégie."""
    rnd = random.Random(graine)
    W, H = TAILLE_MASQUE
    s = W / LARG
    feuillus = houppier("houppier", ("#2f4423", "#61793a"), ("#4a5230", "#727a48"))
    olive = houppier("olivier", ("#636e45", "#7c8658"))
    foret, sudm = mq["foret"], mq["sud"]

    def z(px, py):
        hi = min(nx, max(0, int(px / LARG * nx)))
        hj = min(ny, max(0, int(py / HAUT * ny)))
        return float(h[hj, hi])

    def poser(col, nom, px, py, r, sd, aplati=1.0):
        e = bpy.data.objects.new(nom, None)
        e.instance_type = "COLLECTION"
        e.instance_collection = col
        e.location = (px * UNITE, (HAUT - py) * UNITE, z(px, py) + r * 0.55 * aplati)
        e.scale = (r * rnd.uniform(0.9, 1.1), r * rnd.uniform(0.9, 1.1), r * aplati)
        e.rotation_euler.z = rnd.uniform(0, 6.283)
        e["sud"] = sd
        C.lier(e)
    n = 0
    for (px, py, r) in oliviers_pts:
        poser(olive, "olivier%d" % n, px, py, r * UNITE, 1.0, 0.8)
        n += 1
    y = pas / 2
    while y < HAUT:
        x = pas / 2
        while x < LARG:
            px, py = x + rnd.uniform(-0.45, 0.45) * pas, y + rnd.uniform(-0.45, 0.45) * pas
            i, j = min(W - 1, max(0, int(px * s))), min(H - 1, max(0, int(py * s)))
            f = float(foret[j, i])
            sd = float(sudm[j, i])
            if f > 0.05 and rnd.random() < f * (1.0 - 0.45 * sd):
                poser(feuillus, "arbre%d" % n, px, py, rnd.uniform(0.17, 0.33) * (0.85 if sd > 0.5 else 1.0), sd)
                n += 1
            x += pas
        y += pas
    # ripisylve : arbres le long de l'eau, des deux côtés, un peu plus serrés
    for trace, demi in mq["cours"]:
        for k in range(0, len(trace), 2):
            px, py = trace[k]
            if k + 1 < len(trace):
                tx, ty = trace[k + 1][0] - px, trace[k + 1][1] - py
            l = math.hypot(tx, ty) or 1.0
            for cote in (-1, 1):
                if rnd.random() > 0.42:
                    continue
                d = demi[k] + rnd.uniform(3.0, 6.5)
                qx, qy = px - ty / l * d * cote, py + tx / l * d * cote
                if not (0 <= qx < LARG and 0 <= qy < HAUT):
                    continue
                sd = float(sudm[min(H - 1, int(qy * s)), min(W - 1, int(qx * s))])
                poser(feuillus, "rive%d" % n, qx, qy, rnd.uniform(0.15, 0.26), sd)
                n += 1
    C.journal("carte : %d arbres et oliviers" % n)


def fond(essai=False, echantillons=48):
    mq = masques()
    champs_img, haie = parcelles(mq)
    chemin_champs = os.path.join(C.CACHE, "campagne-champs.png")
    Image.fromarray((champs_img * 255).astype(np.uint8)).save(chemin_champs)
    oliviers_pts, chemin_oliv = plan_oliviers(mq)
    m1 = T.ecrire_masque("campagne-1", [mq["eau"], mq["sud"], mq["foret"], mq["champs"]])
    m2 = T.ecrire_masque("campagne-2", [mq["oliviers"], mq["roche"], mq["variation"], haie])
    m3 = T.ecrire_masque("campagne-3", [mq["eboulis"], mq["berge"], mq["prof"], chemin_oliv])
    m4 = T.ecrire_masque("campagne-4", [mq["versant"], mq["alpage"], np.zeros_like(mq["eau"]), np.ones_like(mq["eau"])])
    C.reinitialiser()
    C.installer_lumiere()
    nx, ny = 1000, 530                  # maillage plus fin : facettes de l'escarpement sans étirement
    h = np.array(Image.fromarray(mq["h"].astype(np.float32), "F").resize((nx + 1, ny + 1), Image.BILINEAR), dtype=np.float32)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    vs = []
    for j in range(ny + 1):
        ligne = []
        for i in range(nx + 1):
            ligne.append(bm.verts.new((i / nx * LARG * UNITE, (1 - j / ny) * HAUT * UNITE, float(h[j, i]))))
        vs.append(ligne)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((vs[j + 1][i], vs[j + 1][i + 1], vs[j][i + 1], vs[j][i]))
            f.smooth = True
            for lp, (di, dj) in zip(f.loops, ((0, 1), (1, 1), (1, 0), (0, 0))):
                lp[uv].uv = ((i + di) / nx, 1 - (j + dj) / ny)
    C.objet_maillage("carte", bm, mat_carte([m1, m2, m3, m4], chemin_champs))
    arbres(mq, h, nx, ny, oliviers_pts)
    W, H = (LARG, HAUT) if essai else TAILLE_MASQUE
    C.camera_dessus(LARG * UNITE / 2, HAUT * UNITE / 2, LARG * UNITE, HAUT * UNITE)
    C.reglages_rendu(W, H, echantillons=echantillons, transparent=False, filtre=1.0, exposition=-0.2)
    img = C.rendre(os.path.join(C.CACHE, "_rendu", "fond-campagne%s.png" % ("-essai" if essai else ""))).convert("RGB")
    img = relief_accentue(img, mq)
    img = parchemin(img)
    if essai:
        chemin = os.path.join(C.CACHE, "fond-campagne-essai.jpg")
        C.sauver_jpg(img, chemin, qualite=88, max_ko=2000)
        return chemin
    chemin, src = C.chemin_campagne("fond-campagne.jpg")
    C.sauver_jpg(img, chemin, qualite=84, max_ko=490, plancher=72)
    C.maj_manifeste({"fond-campagne": C.entree(src, LARG, HAUT, 0, 0)})
    return chemin


def apercu(dossier):
    """Aperçu sans Blender : relief ombré (soleil nord-ouest), eau, forêts, champs, oliviers."""
    mq = masques()
    champs_img, haie = parcelles(mq)
    oliviers_pts, chemin_oliv = plan_oliviers(mq)
    h = mq["h"]
    gy, gx = np.gradient(h)
    k = 1.0 / (UNITE / 2)
    nxv, nyv = -gx * k, gy * k                  # y image vers le bas : le nord est vers -y
    n = np.stack([nxv, nyv, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1)[..., None]
    soleil = np.array([-0.5, 0.5, 0.707])
    ombre = np.clip(n @ soleil, 0, 1)

    def c(hx):
        return np.array(C.rgb8(hx), dtype=np.float32) / 255
    base = c(PALETTE["herbe_n"]) * (1 - mq["sud"][..., None]) + c(PALETTE["herbe_s"]) * mq["sud"][..., None]
    for cle, coul in (("eboulis", "eboulis"), ("roche", "roche")):
        base = base * (1 - mq[cle][..., None]) + c(PALETTE[coul]) * mq[cle][..., None]
    base = base * (1 - mq["champs"][..., None]) + champs_img * mq["champs"][..., None]
    base = base * (1 - haie[..., None]) + c(PALETTE["haie"]) * haie[..., None]
    base = base * (1 - mq["oliviers"][..., None]) + c(PALETTE["terre_olive"]) * mq["oliviers"][..., None]
    base = base * (1 - chemin_oliv[..., None]) + c(PALETTE["chemin"]) * chemin_oliv[..., None]
    base = base * (1 - 0.5 * mq["foret"][..., None])
    base = base * (1 - mq["berge"][..., None]) + c(PALETTE["berge"]) * mq["berge"][..., None]
    base = base * (1 - mq["eau"][..., None]) + c(PALETTE["eau"]) * mq["eau"][..., None]
    img = base * (0.35 + 0.9 * ombre[..., None])
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    for (px, py, r) in oliviers_pts:
        d.ellipse((px * 2 - r * 2, py * 2 - r * 2, px * 2 + r * 2, py * 2 + r * 2), fill=(111, 122, 78))
    os.makedirs(dossier, exist_ok=True)
    chemin = os.path.join(dossier, "apercu-campagne.png")
    im.save(chemin)
    C.journal("aperçu : " + chemin)
    return chemin


def relief_accentue(img, mq, force=0.45):
    """Estompage cartographique : le rendu est modulé par un ombrage du relief calculé sur le champ de hauteurs avec le
    même soleil (nord-ouest), mais plus rasant (35°), seulement sur les montagnes et les collines : versants nord-ouest
    éclaircis, versants sud-est assombris, arêtes et ravines lisibles d'un coup d'œil, comme sur une carte en relief."""
    W, H = img.size
    h = np.array(Image.fromarray(mq["h"].astype(np.float32), "F").resize((W, H), Image.BILINEAR), dtype=np.float32)
    gy, gx = np.gradient(h)
    pas = LARG * UNITE / W
    nx_, ny_ = -gx / pas, gy / pas           # image : y vers le bas, le nord est vers le haut
    n = np.stack([nx_, ny_, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1)[..., None]
    el = math.radians(35)
    soleil = np.array([-math.cos(el) * 0.7071, math.cos(el) * 0.7071, math.sin(el)])
    ombrage = np.clip(n @ soleil, 0, 1) / math.sin(el)
    zone = np.array(Image.fromarray(np.clip(mq["montagne"] * 2.5, 0, 1).astype(np.float32), "F").resize((W, H), Image.BILINEAR))
    facteur = 1 + force * (np.clip(ombrage, 0.2, 1.35) - 1) * zone
    a = np.array(img, dtype=np.float32) * facteur[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def parchemin(img):
    """Bords teintés de parchemin : la carte se fond dans un papier chaud, bord irrégulier, léger grain ; aucun texte."""
    W, H = img.size
    a = np.array(img, dtype=np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    bx = np.minimum(xx, W - 1 - xx) / W
    by = np.minimum(yy, H - 1 - yy) / H
    n = T.bruit(W, H, 60, 99, octaves=4)
    d = np.minimum(bx * 1.9, by * 1.9 * H / W * 1.9) + 0.012 * n
    papier = np.array(C.rgb8("#c8b28a"), dtype=np.float32)
    grain = 1 + 0.06 * T.bruit(W, H, 4, 98, octaves=2)
    p = papier[None, None, :] * grain[..., None]
    t = T.lisse01(0.012, 0.06, d)[..., None]
    chaud = np.array((1.04, 1.0, 0.9), dtype=np.float32)
    patine = 1 - 0.35 * (1 - T.lisse01(0.0, 0.18, d))[..., None]
    a = a * (chaud * (1 - (1 - patine) * 0.6)) * patine + p * (1 - patine) * 0.35
    a = a * t + p * (1 - t)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------- lieux
# Variantes du bourg de France (provinces prises) : (lacet en degrés, miroir en x, quart de tour du plan). Le jeu choisit
# la variante d'après l'identifiant de la province : les lieux pris ne sont pas tous le même bourg.
VARIANTES_FRANCE = {1: (P.LACET, False, False), 2: (P.LACET - 54, True, False), 3: (P.LACET + 22, False, True)}


def bourg(camp, couleurs=True, variante=1):
    """Petit bourg fortifié du camp : tour ou donjon, quelques maisons, enceinte basse ; bannière deux fois plus grande
    qu'avant, au-dessus des toits, sur la tour. Variantes (France) : plan retourné ou tourné d'un quart de tour et lacet
    différent ; la bannière flotte toujours dans le même vent, la tenture du mur et celle de la tour restent tournées
    vers la caméra (côté sud-ouest). Renvoie (objets, lacet en degrés)."""
    lacet, miroir, quart = VARIANTES_FRANCE.get(variante, VARIANTES_FRANCE[1]) if camp == "france" else (P.LACET, False, False)

    def tr(x, y):
        """Point du plan de base vers le plan de la variante."""
        if quart:
            x, y = -y, x
        return (-x if miroir else x), y

    def mur(a, b):
        a, b = tr(*a), tr(*b)
        return (b, a) if miroir else (a, b)       # chemin de ronde toujours à l'extérieur (droite de a -> b)

    # pierre un peu plus sombre que sur le champ de bataille : le bourg se détache des prés et des chaumes clairs
    m = P.matieres(camp if camp != "neutre" else "france", "intact", echelle_tex=1.4,
                   valeur=0.85 if camp in ("france", "angleterre") else 1.0)
    m["or"] = C.mat_metal("or", "#c9a24a", rugosite=0.35)
    o = []
    sud = camp == "omeyyades"
    if camp == "neutre":
        m["toit"] = C.mat_toit("toit_n", "clay_roof_tiles", "#7a6a5a", rang_m=0.34)
    hx, hy = (5, 7) if quart else (7, 5)
    o += P.cour("cour", -hx, hx, -hy, hy, m)
    for nom, a, b in (("s", (-7, -5), (7, -5)), ("e", (7, -5), (7, 5)), ("n", (7, 5), (-7, 5)), ("o", (-7, 5), (-7, -5))):
        a, b = mur(a, b)
        o += P.courtine("enc_" + nom, a, b, 3.2, 0.8, m, merlons="pointe" if sud else "carre", mat="mur" if sud else "pierre")
    for k, (x, y, sx, sy, h) in enumerate(((-3.5, -2.0, 3.6, 2.8, 3.0), (2.0, -2.5, 3.0, 2.6, 2.8), (3.5, 2.0, 3.4, 2.6, 3.2),
                                          (-4.0, 2.4, 3.0, 2.4, 2.6))):
        x, y = tr(x, y)
        if quart:
            sx, sy = sy, sx
        o.append(C.boite("maison%d" % k, sx, sy, h, (x, y, 0), m["mur"]))
        if sud:
            o.append(C.boite("maison%d_t" % k, sx + 0.1, sy + 0.1, 0.25, (x, y, h), m["pierre"]))
            if couleurs:
                rayee = C.mat_tissu("auvent", "#e9e1cc", image_png=P.texture_rayee("auvent-omeyyades", "#2f6b52", "#e9e1cc", n=4))
                o += P.auvent("auvent%d" % k, x, y + sy * 0.35, h + 1.4, sx * 0.9, sy * 0.75, rayee)
        else:
            o.append(P.toit_deux_pans("maison%d_toit" % k, x - sx / 2, x + sx / 2, y - sy / 2, y + sy / 2, h, 1.8, m["toit"], debord=0.25))
    tx, ty = tr(0.5, 0.8)
    if camp == "france":
        o += P.tour_ronde("tour", tx, ty, 2.2, 8.5, m, graine=1, archeres=((240, 0.5),))
        haut = 8.5 + 0.7 + 2.3 * 2.5
    elif camp == "angleterre":
        o += P.tour_carree("tour", tx, ty, 4.2, 9.0, m, archeres=None, toit=True)
        haut = 9.0 + 4.0
    elif camp == "omeyyades":
        o += P.tour_carree("tour", tx, ty, 4.0, 9.0, m, merlons="pointe", mat="mur", soubassement=("pierre", 2.5), archeres=None)
        haut = 9.0 + 0.9
    else:
        o += P.tour_carree("tour", tx, ty, 3.8, 7.5, m, archeres=None)
        haut = 7.5
    if couleurs and camp != "neutre":
        # grande bannière au-dessus des toits (aire doublée), plantée au sommet de la tour, dans le vent commun
        o += C.drapeau("ban", camp, 4.2, 6.2, 4.1, loc=(tx - 1.2, ty - 1.2, haut - 0.6), vent=1.0, cap=-28 - lacet,
                       echelle_embleme=0.66, inverse=sud, epi=True)
        # tentures tournées vers la caméra : direction du monde à 212° (sud-ouest), ramenée dans le plan du bourg
        a = math.radians(212 - lacet)
        normales = ((-1, 0, hx), (1, 0, hx), (0, -1, hy), (0, 1, hy))
        nx_, ny_, demi = max(normales, key=lambda n: n[0] * math.cos(a) + n[1] * math.sin(a))
        an = math.atan2(ny_, nx_)
        o += C.tenture("tenture", camp, 2.6, 2.5, loc=(nx_ * (demi + 0.5) - ny_ * 0.6, ny_ * (demi + 0.5) + nx_ * 0.6, 3.1),
                       rot_z=an + math.pi / 2, graine=2, mat_tringle=m["bois"], pointe=0.12)
        o += C.tenture("tenture_tour", camp, 3.0, 5.0, loc=(tx + 2.12 * math.cos(a), ty + 2.12 * math.sin(a), 8.4),
                       rot_z=a + math.pi / 2, graine=3, mat_tringle=m["bois"], pointe=0.12)
    return o, lacet


def plateforme(taille_px, centre, rx, ry, graine=3):
    """Sol du bourg : une aire de terre battue claire, à peine posée sur la carte (alpha 0,5 au plus), bord fondu sur
    18 % du rayon et un peu irrégulier, sans trait ni ombre (l'ombre de contact du rendu suffit) : le bourg semble bâti
    sur le relief, pas posé sur un pion."""
    W = H = taille_px
    cx, cy = centre
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    ang = np.arctan2((yy - cy) / ry, (xx - cx) / rx)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) * (1 + 0.06 * T.bruit_angle(ang, graine))
    grain = T.bruit(W, H, 10, graine + 1, octaves=3)
    terre = np.array(C.rgb8("#c8b088"), dtype=np.float32)
    rgb = terre[None, None, :] * (1 + 0.08 * grain[..., None])
    alpha = PLATEFORME_ALPHA * T.lisse01(1.0, 1.0 - PLATEFORME_FONDU, d) * (0.85 + 0.15 * grain)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8), "RGBA")


PLATEFORME_ALPHA, PLATEFORME_FONDU = 0.5, 0.18


# nappe de brume : taille logique, ancrage, bas visible de la nuée depuis l'ancrage (16 px sous le pied du lieu, comme le
# bas des bourgs : le nom d'un lieu dans la brume est à la même place que s'il était découvert), centre de la nappe,
# haut visible de la nuée depuis l'ancrage (pour un nom posé au-dessus du lieu)
BRUME = (180, 100, 90, 48, 16, 46, -32)


def nappe_brume(W, H, cx, cy, graine=41):
    """Lieu pas encore ouvert : une large nappe de brume (environ 170 × 90 px logiques), irrégulière, aux bords
    effilochés en filaments étirés par le vent, sans silhouette ni disque : un voile de brouillard de guerre posé sur
    la carte (le jeu désature en plus le terrain dessous). Volume suggéré par la même lumière que le reste : haut et
    gauche plus clairs, dessous un peu gris. (cx, cy) : centre de la nappe, en px de l'image."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rng = np.random.default_rng(graine)
    dens = np.zeros((H, W), dtype=np.float32)
    # une vingtaine de bouffées étirées en largeur, en grappe irrégulière
    for k in range(22):
        bx = cx + rng.normal(0, 0.2) * W
        by = cy + rng.normal(0, 0.09) * H
        rx = rng.uniform(0.09, 0.2) * W
        ry = rx * rng.uniform(0.35, 0.55)
        dens = np.maximum(dens, rng.uniform(0.7, 1.0) * np.exp(-(((xx - bx) / rx) ** 2 + ((yy - by) / ry) ** 2)))
    # filaments : bruit étiré en largeur (le vent), qui ronge les bords
    n_gros = T.bruit(W, H, 40, graine + 2, octaves=4)
    fil = np.array(Image.fromarray(T.bruit(W // 4, H, 6, graine + 3, octaves=3).astype(np.float32), "F").resize((W, H), Image.BICUBIC))
    dens = dens * (0.8 + 0.35 * n_gros) + 0.28 * fil * T.lisse01(0.08, 0.5, dens)
    dens = np.array(Image.fromarray(np.clip(dens * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6)),
                    dtype=np.float32) / 255
    a = T.lisse01(0.12, 0.7, dens) * 0.82
    marge = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, H - 1 - yy))
    a *= T.lisse01(2, 14, marge)
    # lumière du nord-ouest : bords hauts et gauches plus clairs, dessous gris
    flou = np.array(Image.fromarray((dens * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)), dtype=np.float32) / 255
    dy_, dx_ = np.gradient(flou)
    lum = np.clip(0.55 - 10.0 * (dx_ + dy_), 0, 1)
    clair, ombre = np.array(C.rgb8("#f1eee4"), dtype=np.float32), np.array(C.rgb8("#bdbab0"), dtype=np.float32)
    t = np.clip(0.3 + 0.55 * lum + 0.15 * n_gros, 0, 1)[..., None]
    rgb = ombre * (1 - t) + clair * t
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 235), a * 255]).astype(np.uint8), "RGBA")


def rendre_lieu(camp, surech=2, echantillons=64, variante=1):
    taille, ancre, ppm = 80, 16, 3.6
    px = taille * C.ECHELLE
    nom = "lieu-" + camp + ("-%d" % variante if variante > 1 else "")
    if camp == "brume":
        # nappe plus large que les bourgs : 180 × 100 px logiques, ancrée sous le corps du bourg qu'elle cache ; « bas » :
        # bas visible de la nuée depuis l'ancrage (le jeu y cale le nom du lieu)
        w, h, ax, ay, bas, cy, haut = BRUME
        k = C.ECHELLE
        img = nappe_brume(w * k, h * k, w * k / 2, cy * k)
        C.controle_bords(img, nom)
        chemin, src = C.chemin_campagne(nom + ".png")
        C.sauver_png(img, chemin)
        e = C.entree(src, w, h, ax, ay)
        e["bas"], e["haut"] = bas, haut
        C.maj_manifeste({nom: e})
        return chemin
    else:
        C.reinitialiser()
        C.lumiere_batiment(camp if camp in C.CAMPS else "france")
        C.camera_trois_quarts(px * surech, px * surech, ppm * C.ECHELLE * surech, ancre * C.ECHELLE * surech)
        C.sol_capteur(60)
        objs, lacet = bourg(camp, variante=variante)
        C.pivot("bourg", objs, lacet, (0, 3.2, 0))
        img, _ = C.rendre_sprite(nom, px, px, objs, surech=surech, echantillons=echantillons, contour=0.5,
                                 epaisseur_contour=1, force_ombre=0.6, pres=0.06)
        # aire de terre claire sous le bourg : centre au milieu du bourg (3,2 m au nord de l'ancre)
        k = C.ECHELLE
        cy = (taille - ancre - 3.2 * math.sin(math.radians(C.INCLINAISON)) * ppm) * k - 12
        rx = 0.42 * px
        plat = plateforme(px, (px / 2, cy), rx, rx * math.sin(math.radians(C.INCLINAISON)) + 2)
        a_bourg = np.array(img)[..., 3] / 255.0              # bourg, son liseré et son ombre de contact
        a_plat = np.array(plat)[..., 3] / 255.0
        plat.alpha_composite(img)
        img = plat
        C.controle_camp(img, nom, camp, 0.08)
        # masques de contrôle pour verifier.py : R = corps du bourg (opaque), G = aire de terre nue tout autour (sans le
        # bourg ni son ombre, à moins de 14 px rendus du bourg) : le bourg doit se détacher de ce qui l'entoure à l'écran
        corps = a_bourg > 0.8
        pres = np.array(Image.fromarray((a_bourg > 0.05).astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(29))) > 127
        aire = pres & (a_bourg < 0.05) & (a_plat > 0.25)
        Image.fromarray(np.dstack([corps * 255, aire * 255, np.zeros_like(a_bourg)]).astype(np.uint8), "RGB").save(
            os.path.join(C.CACHE, "controle-lieu-%s.png" % nom))
    C.controle_bords(img, nom)
    chemin, src = C.chemin_campagne(nom + ".png")
    C.sauver_png(img, chemin)
    C.maj_manifeste({nom: C.entree(src, taille, taille, taille // 2, taille - ancre)})
    return chemin


def main(args):
    essai = "--essai" in args
    args = [a for a in args if a != "--essai"]
    if "--apercu" in args:
        i = args.index("--apercu")
        apercu(args[i + 1])
        return
    quoi = args or ["fond", "lieux"]
    if "fond" in quoi:
        fond(essai)
    if "lieux" in quoi:
        for camp in ("france", "angleterre", "omeyyades", "brume"):
            rendre_lieu(camp)
        for v in sorted(VARIANTES_FRANCE):
            if v > 1:
                rendre_lieu("france", variante=v)
    for q in quoi:                              # un seul lieu : lieu-france-2, lieu-brume...
        if q.startswith("lieu-"):
            morceaux = q[5:].split("-")
            rendre_lieu(morceaux[0], variante=int(morceaux[1]) if len(morceaux) > 1 else 1)


if __name__ == "__main__":
    main(sys.argv[1:])
