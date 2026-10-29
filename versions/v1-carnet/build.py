#!/usr/bin/env python3
"""Maquette Terre Gravée, version 1 « Carnet de territoire ».

Génère toutes les pages HTML de ce dossier à partir du catalogue de la maquette v0
(../../maquette/data/catalogue.json) et du contour simplifié des Hautes-Pyrénées (data/).

Usage, depuis n’importe quel dossier :  python build.py
Compatible Python 3.8, bibliothèque standard uniquement.
"""
import html
import json
import math
import os
import re
from datetime import date

ICI = os.path.dirname(os.path.abspath(__file__))
MAQUETTE = os.path.join(ICI, "..", "..", "maquette")
with open(os.path.join(MAQUETTE, "data", "catalogue.json"), encoding="utf-8") as f:
    CATALOGUE = json.load(f)
with open(os.path.join(MAQUETTE, "assets", "img", "_sizes.json"), encoding="utf-8") as f:
    TAILLES = json.load(f)
with open(os.path.join(ICI, "data", "hautes-pyrenees.json"), encoding="utf-8") as f:
    CONTOUR = json.load(f)

IMG = "../../maquette/assets/img/"
SITE = "https://terregravee.fr"
PRODUITS = {p["slug"]: p for p in CATALOGUE}
PLAQUES = [p for p in CATALOGUE if p["collection"] != "accessoires"]
TOUS_AVIS = [dict(a, produit=p["slug"]) for p in CATALOGUE for a in p["avis"]]
NOTE_MOYENNE = sum(a["note"] for a in TOUS_AVIS) / len(TOUS_AVIS)
NB_5 = sum(1 for a in TOUS_AVIS if a["note"] == 5)
NB_4 = sum(1 for a in TOUS_AVIS if a["note"] == 4)

FINITIONS = [("noir", "Noir", "noire"), ("gris", "Gris", "grise"), ("dore", "Doré", "dorée")]
NOM_FIN = {f: n for f, n, _ in FINITIONS}
ACC_FIN = {f: a for f, _, a in FINITIONS}
SORTIES_CABLE = [("haut-gauche", "Haut gauche"), ("haut-droite", "Haut droite"),
                 ("bas-gauche", "Bas gauche"), ("bas-droite", "Bas droite")]
COLLECTIONS = {
    "paysages": "Paysages",
    "patrimoine": "Patrimoine",
    "faune": "Faune",
    "accessoires": "Accessoires",
}

# ---------------------------------------------------------------------------
# Géographie (positions indicatives, fournies dans le brief)
# ---------------------------------------------------------------------------

CATS = {
    "sommets": ("Sommets et cols", "triangle"),
    "sites": ("Sites naturels", "rond"),
    "patrimoine": ("Patrimoine", "carre"),
    "faune": ("Faune des Pyrénées", "losange"),
    # Hors catalogue : le décor d’origine, et les modèles en préparation
    "vrai": ("Où voir les plaques en vrai", "etoile"),
    "bientot": ("Bientôt, en préparation", "pointille"),
}
ORDRE_CATS = ("sommets", "sites", "patrimoine", "faune")
# slug : (lat, lon, catégorie, côté de l’étiquette)
# Montaigu et Escaladieu : coordonnées des fiches Wikipédia et Randozone (vérifiées), les autres d’après le brief.
LIEUX = {
    "le-pic-du-midi": (42.937, 0.142, "sommets", "d"),
    "le-tourmalet": (42.909, 0.145, "sommets", "d"),
    "le-montaigu": (42.984, 0.069, "sommets", "g"),
    "le-cirque-de-gavarnie": (42.695, -0.010, "sites", "d"),
    "le-pont-despagne": (42.854, -0.141, "sites", "d"),
    "la-tour-des-jacobins": (43.065, 0.149, "patrimoine", "g"),
    "le-chateau-de-mauvezin": (43.12, 0.27, "patrimoine", "d"),
    "labbaye-de-lescaladieu": (43.110, 0.257, "patrimoine", "g"),
}
FAUNE = ["lisard", "lours", "le-cerf", "la-marmotte"]
# Repère de la zone faune : dans la partie hachurée du Parc national située dans le département
ZONE_FAUNE = (42.77, 0.16)

# Où voir les plaques en vrai : le décor d’origine à Aquensis, centre thermal de Bagnères-de-Bigorre
# (quartier des thermes, rue du Pont d’Arras ; position indicative).
AQUENSIS = (43.063, 0.146)
# Modèles en préparation (dossier « rex » de Romain, juin et juillet 2026) : repères « bientôt », en pointillé.
# Le Casque du Lhéris : sommet en 43°00′49″ N, 0°13′52″ E (fiche Randozone), soit (43,014 ; 0,231).
# dessin : coin haut gauche du dessin sur la planche misc/autres-plaques.webp (cases de 200 × 398 px), ou None.
BIENTOT = {
    "le-casque-du-lheris": {
        "nom": "Le Casque du Lhéris", "pos": (43.014, 0.231), "forme": "sommets", "cote": "d",
        "lieu": "Entre Bagnères-de-Bigorre et Campan", "dlab": "Altitude", "detail": "1 595 m", "bas": True,
        "texte": "1 595 m, entre Bagnères-de-Bigorre et la vallée de Campan. On y monte à pied depuis le col des Palomières ou depuis Campan.",
        "dessin": (474, 0),
    },
    "le-jardin-massey": {
        "nom": "Le Jardin Massey", "pos": (43.236, 0.074), "forme": "patrimoine", "cote": "g",
        "lieu": "Tarbes", "dlab": "Repère", "detail": "Parc paysager du XIXe siècle",
        "texte": "Un parc paysager au cœur de Tarbes, ancienne propriété du botaniste Placide Massey (1777-1853), qui l’a légué à la ville. Il abrite le musée Massey.",
        "dessin": None,
    },
}
# La Transhumance : pas de lieu précis, une zone sans repère (comme la faune) ; placée assez au sud pour que son
# étiquette ne touche ni celle du Lhéris (carte étroite) ni, autant que possible, « HAUTE-GARONNE »
TRANSHUMANCE = {
    "nom": "La Transhumance", "zone": (42.90, 0.50),
    "texte": "Au printemps, les troupeaux montent vers les estives ; ils redescendent à l’automne. La transhumance n’a pas d’adresse : la carte ne lui donne pas de point précis.",
    "dessin": (474, 860),
}
GRANDS_FORMATS = ["le-cirque-de-gavarnie", "le-tourmalet", "le-pont-despagne", "le-pic-du-midi"]

# Grappes de repères trop proches pour être touchées séparément sur un petit écran (≤ 960 px)
# (clé, nom, membres, catégorie du symbole, décalage x, décalage y en pixels)
GRAPPES = [
    ("massif", "Massif du Pic du Midi", ["le-pic-du-midi", "le-tourmalet", "le-montaigu"], "sommets", 0, 0),
    ("baronnies", "Mauvezin et l’Escaladieu", ["le-chateau-de-mauvezin", "labbaye-de-lescaladieu"], "patrimoine", 30, 8),
    ("bagneres", "Bagnères-de-Bigorre et le Lhéris", ["la-tour-des-jacobins", "aquensis", "le-casque-du-lheris"], "patrimoine", -20, -14),
]
# Point d’ancrage d’une grappe (trait de rappel) quand le centre des membres ne tombe sur aucun lieu
ANCRES_GRAPPES = {"bagneres": LIEUX["la-tour-des-jacobins"][:2]}
# Sur grand écran, symboles écartés de quelques pixels (avec trait de rappel) quand deux lieux sont à moins de 2 km
DECALAGES = {"le-chateau-de-mauvezin": (11, -9), "labbaye-de-lescaladieu": (-11, 9), "aquensis": (-18, 29),
             "le-jardin-massey": (-13, -13)}
GERDE = (43.055, 0.168)
BAGNERES = (43.065, 0.149)
REVEL = (43.458, 2.004)


def cat_de(slug):
    if slug in LIEUX:
        return LIEUX[slug][2]
    if slug in FAUNE:
        return "faune"
    if slug == "aquensis":
        return "vrai"
    if slug in BIENTOT or slug == "la-transhumance":
        return "bientot"
    return None


def pos_de(slug):
    """Position indicative (lat, lon) d’un repère de la carte."""
    if slug in LIEUX:
        return LIEUX[slug][0], LIEUX[slug][1]
    if slug == "aquensis":
        return AQUENSIS
    if slug in BIENTOT:
        return BIENTOT[slug]["pos"]
    raise KeyError(slug)


def nom_de(slug):
    if slug in PRODUITS:
        return PRODUITS[slug]["nom"]
    if slug == "aquensis":
        return "Aquensis"
    if slug in BIENTOT:
        return BIENTOT[slug]["nom"]
    return TRANSHUMANCE["nom"]


def km(a, b):
    r = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(d))


KM_REVEL = int(round(km(GERDE, REVEL) / 5.0) * 5)

# Cadre de la carte principale (projection équirectangulaire simple, 1000 unités par degré de latitude)
LAT_MAX, LAT_MIN, LON_MIN, LON_MAX = 43.31, 42.64, -0.37, 0.70
K = math.cos(math.radians((LAT_MAX + LAT_MIN) / 2))
S = 1000.0
VB_W = round((LON_MAX - LON_MIN) * K * S, 1)
VB_H = round((LAT_MAX - LAT_MIN) * S, 1)


def proj(lat, lon):
    return ((lon - LON_MIN) * K * S, (LAT_MAX - lat) * S)


def pc(lat, lon):
    x, y = proj(lat, lon)
    return (100.0 * x / VB_W, 100.0 * y / VB_H)


def chemin(points, ferme=True):
    morceaux = []
    for i, (lon, lat) in enumerate(points):
        x, y = proj(lat, lon)
        morceaux.append(("M" if i == 0 else "L") + "{:.1f},{:.1f}".format(x, y))
    return "".join(morceaux) + ("Z" if ferme else "")


CONTOUR_D = "".join(chemin(p) for p in CONTOUR["polygones"])

RIVIERES = {
    "Adour": [(42.912, 0.170), (42.937, 0.215), (42.985, 0.228), (43.016, 0.178), (43.066, 0.150), (43.085, 0.137),
              (43.125, 0.110), (43.180, 0.090), (43.233, 0.075), (43.300, 0.062), (43.386, 0.054)],
    "Gave de Pau": [(42.690, 0.004), (42.735, -0.009), (42.787, 0.020), (42.840, 0.006), (42.872, -0.003),
                    (42.930, -0.050), (42.958, -0.075), (43.003, -0.099), (43.050, -0.080), (43.095, -0.046),
                    (43.108, -0.100), (43.104, -0.159), (43.127, -0.212), (43.160, -0.300), (43.20, -0.40)],
    "Gave de Cauterets": [(42.854, -0.141), (42.889, -0.114), (42.925, -0.095), (42.958, -0.075)],
    "Neste": [(42.760, 0.290), (42.817, 0.322), (42.905, 0.357), (42.962, 0.380), (43.020, 0.400),
              (43.070, 0.450), (43.090, 0.500), (43.087, 0.567), (43.080, 0.640), (43.07, 0.75)],
}
VILLES = [
    ("Tarbes", 43.233, 0.078, "d"), ("Lourdes", 43.095, -0.046, "g"),
    ("Argelès-Gazost", 43.003, -0.099, "g"), ("Luz-Saint-Sauveur", 42.872, -0.003, "d"),
    ("Cauterets", 42.889, -0.114, "g"), ("Arreau", 42.905, 0.357, "d"), ("Saint-Lary-Soulan", 42.817, 0.322, "d"),
]
# Limite nord schématique du Parc national dans le département (pour une zone hachurée indicative)
PARC = [(-0.40, 42.93), (-0.25, 42.925), (-0.17, 42.875), (-0.09, 42.835), (-0.03, 42.80), (0.03, 42.79),
        (0.08, 42.825), (0.16, 42.835), (0.23, 42.80), (0.30, 42.75), (0.36, 42.71), (0.42, 42.66),
        (0.42, 42.50), (-0.40, 42.50)]
PARC_D = chemin(PARC)
# Sommets qui servent à générer le relief (courbes de niveau décoratives, non cotées)
PICS = [
    (42.774, -0.147, 3298, 8), (42.839, -0.290, 3144, 7), (42.695, 0.030, 3248, 8), (42.672, -0.060, 3100, 7),
    (42.846, 0.115, 3091, 6), (42.800, 0.100, 3192, 6), (42.937, 0.142, 2877, 4.5), (42.880, 0.270, 2831, 6),
    (42.984, 0.069, 2339, 3.5), (42.950, -0.130, 2334, 5), (42.750, 0.250, 2800, 7), (42.720, 0.400, 2900, 7),
    (42.800, 0.450, 2500, 7), (42.900, -0.250, 2650, 6), (42.860, -0.050, 2650, 5), (42.990, 0.270, 1700, 6),
    (43.010, -0.020, 1300, 5), (42.700, -0.250, 2900, 8), (42.880, 0.420, 2200, 6),
]


def dms(lat, lon):
    def un(v, pos, neg):
        s = pos if v >= 0 else neg
        v = abs(v)
        d = int(v)
        m = int(round((v - d) * 60))
        if m == 60:
            d, m = d + 1, 0
        return "{}°{:02d}′ {}".format(d, m, s)
    return un(lat, "N", "S") + " · " + un(lon, "E", "O")


# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

def e(t):
    return html.escape(str(t), quote=True)


def euros(n):
    return "{} €".format(n)


def note_fr(n):
    return "{:.1f}".format(n).replace(".", ",")


MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre",
        "novembre", "décembre"]


def date_fr(iso):
    a, m, j = iso.split("-")
    jour = int(j)
    return "{} {} {}".format("1er" if jour == 1 else jour, MOIS[int(m) - 1], a)


def tri_nom(nom):
    for art in ("Le ", "La ", "Les ", "L’"):
        if nom.startswith(art):
            return nom[len(art):]
    return nom


def dims(rel):
    return TAILLES[rel]


def a_photo(slug, fin):
    return "p/{}-{}-440.webp".format(slug, fin) in TAILLES


def fin_defaut(p, preferee="noir"):
    if a_photo(p["slug"], preferee):
        return preferee
    for f, _, _ in FINITIONS:
        if a_photo(p["slug"], f):
            return f
    return None


def srcset_plaque(slug, fin):
    return "{0}p/{1}-{2}-440.webp 440w, {0}p/{1}-{2}-880.webp 880w".format(IMG, slug, fin)


def chargement(eager):
    """eager : False (différé), True ou "haute" (prioritaire, au-dessus de la ligne de flottaison), "normal"."""
    if eager == "normal":
        return 'loading="eager"'
    if eager:
        return 'fetchpriority="high"'
    return 'loading="lazy"'


def img(rel, alt, sizes="100vw", cls="", eager=False, extra="", srcset=""):
    """Image du catalogue avec ses dimensions réelles ; sizes n’est écrit que s’il y a un srcset."""
    w, h = dims(rel)
    c = ' class="{}"'.format(cls) if cls else ""
    x = " " + extra if extra else ""
    ss = ' srcset="{}" sizes="{}"'.format(srcset, sizes) if srcset else ""
    return ('<img{c} src="{src}"{ss} width="{w}" height="{h}" alt="{a}" {charge} decoding="async"{x}>'
            .format(c=c, src=IMG + rel, ss=ss, w=w, h=h, a=e(alt), charge=chargement(eager), x=x))


def img_plaque(p, fin, sizes, eager=False, cls="", extra="", alt=None):
    rel = "p/{}-{}-440.webp".format(p["slug"], fin)
    w, h = dims(rel)
    alt = alt if alt is not None else "Plaque {}, finition {}".format(p["nom"], ACC_FIN[fin])
    c = ' class="{}"'.format(cls) if cls else ""
    x = " " + extra if extra else ""
    return ('<img{c} src="{src}" srcset="{ss}" sizes="{s}" width="{w}" height="{h}" alt="{a}" {charge} decoding="async"{x}>'
            .format(c=c, src=IMG + rel, ss=srcset_plaque(p["slug"], fin), s=sizes, w=w, h=h, a=e(alt),
                    charge=chargement(eager), x=x))


def img_vignette(rel, cls="", eager=False):
    """Petite vignette décorative (alt vide) : dimensions réelles du fichier, taille d’affichage fixée en CSS."""
    w, h = dims(rel)
    c = ' class="{}"'.format(cls) if cls else ""
    return '<img{} src="{}" alt="" width="{}" height="{}" {} decoding="async">'.format(c, IMG + rel, w, h, chargement(eager))


def note(texte, sorte="fournir"):
    """Marqueur visible pour Romain : à fournir, à confirmer, proposition à valider."""
    return '<span class="note-maquette note-maquette--{}">{}</span>'.format(sorte, e(texte))


A_FOURNIR = note("à fournir")
A_CONFIRMER = note("à confirmer", "confirmer")
A_VALIDER = note("proposition à valider", "valider")
A_PREPARATION = note("en préparation, à valider", "valider")
A_SEMETHERM = note("à valider : accord de la SEMETHERM pour citer le projet Aquensis", "valider")


def etoiles(n):
    """Cinq étoiles remplies au prorata de la note (4,9 → 98 %), sans arrondi à l’étoile."""
    pct = max(0.0, min(100.0, n / 5.0 * 100.0))
    return ('<span class="etoiles" aria-hidden="true"><span class="etoiles__fond">★★★★★</span>'
            '<span class="etoiles__plein" style="width:{:.0f}%">★★★★★</span></span>').format(pct)


FORMES = {
    "triangle": '<path d="M8 2.2 14.2 13.4H1.8Z"/>',
    "rond": '<circle cx="8" cy="8" r="5.6"/>',
    "carre": '<rect x="2.6" y="2.6" width="10.8" height="10.8"/>',
    "losange": '<path d="M8 1.6 14.4 8 8 14.4 1.6 8Z"/>',
    "etoile": '<path d="M8 1 9.9 5.6 14.7 5.9 11 9.1 12.2 13.9 8 11.3 3.8 13.9 5 9.1 1.3 5.9 6.1 5.6Z"/>',
}


def symbole(cat, cls="symbole", forme=None):
    """Symbole de catégorie ; pour « bientôt », la forme de la catégorie du lieu, en creux et en pointillé."""
    f = CATS[cat][1] if forme is None else CATS[forme][1]
    d = FORMES.get(f, FORMES["rond"])
    return '<svg class="{} {}--{}" viewBox="0 0 16 16" aria-hidden="true" focusable="false">{}</svg>'.format(cls, cls, cat, d)


def cartel_court(p):
    if not p["cartel"]:
        return ""
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return "<i>{}</i>".format(e(detail))
    if detail.endswith(" m"):
        return "{} · {}".format(e(lieu), e(detail))
    return "{} · {}".format(e(lieu), e(detail))


def borne(texte, sous="", cls=""):
    """Petite borne façon borne de col : altitude ou statut d’un lieu."""
    s = '<span class="borne__sous">{}</span>'.format(e(sous)) if sous else ""
    c = " borne--" + cls if cls else ""
    return '<span class="borne{}"><span class="borne__tete" aria-hidden="true"></span><span class="borne__corps">{}{}</span></span>'.format(c, e(texte), s)


def borne_de(p):
    if not p["cartel"]:
        return ""
    lieu, detail = p["cartel"]
    slug = p["slug"]
    if detail.endswith(" m"):
        return borne(detail, "col" if slug == "le-tourmalet" else "altitude")
    if "UNESCO" in detail:
        return borne("UNESCO", "patrimoine mondial")
    if "Monument historique" in detail:
        return borne("MH", "monument historique")
    if p["collection"] == "faune":
        # Nom latin, sans sigle qui pourrait passer pour un label
        genre, espece = detail.split(" ", 1)
        return borne(genre, espece, "latin")
    return ""


BALISE = '<span class="balise" aria-hidden="true"></span>'


def etiquette(texte, balise=True):
    return '<p class="etiquette">{}{}</p>'.format(BALISE if balise else "", texte)


# ---------------------------------------------------------------------------
# Textes du catalogue : corrections avant affichage (erreurs de fait, typographie, formules creuses)
# Chaque ancien texte doit exister : si le catalogue change, le script s’arrête au lieu de laisser passer une erreur.
# ---------------------------------------------------------------------------
CORRECTIONS = {
    "le-tourmalet": [
        ("Mythique. Sauvage. Intemporel. Le col du Tourmalet, haut lieu des exploits cyclistes, s’invite chez vous avec cette plaque élégante et racée. Chaque ligne évoque l’ascension, la sueur, la légende. Un clin d’œil discret et puissant à l’histoire du sport et à l’audace humaine. Idéal pour les passionnés de vélo, de défis et d’horizons sans fin.",
         "Le col du Tourmalet, haut lieu des exploits cyclistes, s’invite chez vous. Chaque ligne de la plaque évoque l’ascension, la sueur, la légende. Pour les passionnés de vélo et de défis."),
    ],
    "le-cirque-de-gavarnie": [
        ("Notre plaque “Gavarnie”", "Notre plaque « Gavarnie »"),
        ("Découpée avec précision dans du métal brut, cette œuvre est un hommage à l’inaccessible beauté du massif.",
         "Découpée au laser dans l’aluminium puis thermolaquée, cette plaque rend hommage au cirque."),
        (" Un must pour les amoureux de paysages spectaculaires.", ""),
        (" Une création unique inspirée d’un site classé au patrimoine mondial de l’UNESCO.",
         " Le site est inscrit au patrimoine mondial de l’UNESCO."),
    ],
    "le-pont-despagne": [
        ("Torrent, cascade, forêt, et pierre: le Pont", "Torrent, cascade, forêt et pierre : le Pont"),
    ],
    "le-chateau-de-mauvezin": [
        ("l’âme des baronnies", "l’âme des Baronnies"),
    ],
    "lours": [
        ("avec une découpe brute", "avec une découpe franche"),
    ],
    "le-cerf": [
        ("Vous cherchez une décoration qui a du caractère et une histoire ? Découvrez notre plaque « Le Cerf », une création qui capture toute la majesté de cet animal mythique, symbole de force, liberté et élégance.",
         "La plaque « Le Cerf » rend hommage à l’animal des forêts pyrénéennes, symbole de force et de liberté."),
        ("Imaginez cette silhouette découpée avec précision dans de l’aluminium exposée sur votre mur, dans votre salon, votre bureau ou votre extérieur… Chaque regard porté sur elle vous rappellera l’esprit des forêts sauvages.",
         "Sa silhouette est découpée au laser dans l’aluminium. Elle trouve sa place dans un salon, un bureau ou dehors."),
    ],
    "la-marmotte": [
        ("la marmotte est le sourire des montagnes.", "la marmotte vit dans les pelouses d’altitude."),
    ],
}


def histoire(p):
    """Paragraphes du catalogue, corrigés."""
    paras = list(p["histoire"])
    for ancien, nouveau in CORRECTIONS.get(p["slug"], []):
        trouve = [i for i, x in enumerate(paras) if ancien in x]
        assert trouve, "Correction introuvable pour {} : {}".format(p["slug"], ancien[:40])
        for i in trouve:
            paras[i] = paras[i].replace(ancien, nouveau)
    return paras


def couper_phrase(texte, n):
    """Coupe un texte à la fin de la dernière phrase complète avant n caractères."""
    if len(texte) <= n:
        return texte
    coupe = texte[:n]
    fin = max(coupe.rfind(". "), coupe.rfind(" ? "), coupe.rfind(" ! "))
    return coupe[:fin + 1] if fin > 0 else coupe.rsplit(" ", 1)[0] + "…"


# Deux ou trois phrases factuelles par lieu ou animal : faits publics sur le lieu, jamais sur la marque.
LIEU_TEXTE = {
    "le-pic-du-midi": "2 877 m. Un observatoire occupe le sommet depuis la fin du XIXe siècle, et le Pic se voit depuis toute la plaine de Tarbes. La plaque en dessine la silhouette et le ciel étoilé.",
    "le-tourmalet": "2 115 m, entre Barèges et La Mongie. C’est le col le plus souvent franchi par le Tour de France. La route est fermée l’hiver.",
    "le-montaigu": "2 339 m, au nord-ouest du Pic du Midi, sur la rive gauche de la vallée de Lesponne. Moins connu que son voisin, il domine lui aussi la plaine.",
    "le-cirque-de-gavarnie": "Un cirque de falaises au fond de la vallée de Gavarnie, contre la frontière espagnole. Il est inscrit au patrimoine mondial de l’UNESCO.",
    "le-pont-despagne": "Au-dessus de Cauterets, un pont de pierre enjambe le gave, entre les cascades et la forêt.",
    "la-tour-des-jacobins": "Au cœur de Bagnères-de-Bigorre, la tour est le seul vestige d’un ancien couvent. Elle est protégée au titre des monuments historiques.",
    "le-chateau-de-mauvezin": "Un château fort perché sur une colline des Baronnies, à l’est de Bagnères-de-Bigorre.",
    "labbaye-de-lescaladieu": "Une abbaye cistercienne fondée en 1142 à Bonnemazon, au confluent du Luz et de l’Arros, près du château de Mauvezin.",
    "lisard": "L’isard est le chamois des Pyrénées. On le croise sur les pentes rocheuses, au-dessus de la forêt.",
    "lours": "L’ours brun vit encore dans les Pyrénées, en petit nombre.",
    "le-cerf": "Le cerf élaphe vit dans les forêts des Pyrénées. À l’automne, on entend son brame.",
    "la-marmotte": "La marmotte vit dans les pelouses d’altitude. Elle siffle pour prévenir du danger.",
}


# ---------------------------------------------------------------------------
# Phrases légales et pratiques communes : une seule source pour toutes les pages
# ---------------------------------------------------------------------------

def phrase_retractation():
    return ("14 jours après réception pour vous rétracter sans justification, comme la loi le prévoit. "
            "Frais de retour à votre charge, article dans son état d’origine ; pièces personnalisées exclues.")


def phrase_paiement():
    return ("Carte bancaire (Stripe), PayPal (y compris en 4 fois sans frais), Apple Pay, Google Pay. {}"
            .format(note("conditions du 4 fois PayPal (montants éligibles, sous réserve d’acceptation) à fournir")))


# ---------------------------------------------------------------------------
# Typographie française appliquée au texte (hors balises, scripts et styles)
# ---------------------------------------------------------------------------
NBSP, FINE = " ", " "


def typo_texte(t):
    t = re.sub(r" ([:])(?=[\s<]|$)", NBSP + r"\1", t)
    t = re.sub(r" ([;!?])", FINE + r"\1", t)
    t = t.replace("« ", "«" + NBSP).replace(" »", NBSP + "»")
    for _ in range(2):
        t = re.sub(r"(\d) (\d{3})(?!\d)", r"\1" + FINE + r"\2", t)
    t = re.sub(r"(\d) (€|m|km|cm|mm|jours|%|Ko|Mo|exemplaires|plaques|avis|lieux|modèles|étoiles|ans)(?![\wÀ-ÿ])", r"\1" + NBSP + r"\2", t)
    t = t.replace(" × ", NBSP + "×" + NBSP)  # dimensions : 60 × 30 cm, 1 m × 2 m
    t = t.replace("N° ", "N°" + NBSP).replace(" – ", NBSP + "– ")
    return t


def typo_attributs(balise):
    """Même typographie dans les attributs lus par les personnes : description, alt, aria-label, title."""
    return re.sub(r'((?:content|alt|aria-label|title)=")([^"]*)(")', lambda m: m.group(1) + typo_texte(m.group(2)) + m.group(3), balise)


def typo(doc):
    morceaux = re.split(r"(<script.*?</script>|<style.*?</style>|<[^>]+>)", doc, flags=re.S)
    sortie = []
    for m in morceaux:
        if m.startswith("<script") or m.startswith("<style"):
            sortie.append(m)
        elif m.startswith("<"):
            sortie.append(typo_attributs(m) if ("content=" in m and "description" in m) or "alt=" in m or "aria-label=" in m else m)
        else:
            sortie.append(typo_texte(m))
    return "".join(sortie)


# ---------------------------------------------------------------------------
# Gabarit commun
# ---------------------------------------------------------------------------

NAV = [("carte.html", "La carte"), ("collection.html", "Les plaques"), ("index.html#fabrication", "Fabrication"),
       ("sur-mesure.html", "Sur mesure"), ("contact.html", "Contact")]

LOGO = ('<svg class="marque__signe" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
        '<path d="M20 4c7 0 15 5 15 14 0 10-8 18-16 18S5 30 5 21C5 12 13 4 20 4Z"/>'
        '<path d="M20 10c4.5 0 9 3 9 8.5 0 6-5 11-10 11s-8.6-4-8.6-9.6C10.4 14.4 15 10 20 10Z"/>'
        '<path d="M19.6 16c2.4 0 4.2 1.6 4.2 3.8s-2 4.4-4.4 4.4-3.8-1.7-3.8-3.9 1.7-4.3 4-4.3Z"/>'
        '</svg>')

POLICES = ("https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700"
           "&family=Newsreader:ital,opsz,wght@0,16..72,400..600;1,16..72,400&display=swap")


def marque():
    return ('<a class="marque" href="index.html">' + LOGO +
            '<span class="marque__texte"><span class="marque__nom">Terre Gravée</span>'
            '<span class="marque__sous">Carnet de territoire</span></span></a>')


def entete(actif):
    liens = []
    for href, nom in NAV:
        cur = ' aria-current="page"' if href == actif else ""
        liens.append('<li><a href="{}"{}>{}</a></li>'.format(href, cur, nom))
    lune = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1Z"/></svg>'
    return """<header class="entete">
  <div class="cadre entete__ligne">
    {marque}
    <nav class="nav" id="nav-principale" aria-label="Navigation principale"><ul>{liens}<li class="nav__theme"><button type="button" class="outil outil--theme-menu" data-theme-bascule aria-pressed="false">{lune}<span>Carte de nuit</span></button></li></ul></nav>
    <div class="entete__outils">
      <button type="button" class="outil outil--theme" data-theme-bascule aria-pressed="false">
        {lune}
        <span class="outil__texte" data-theme-texte>Carte de nuit</span>
      </button>
      <button type="button" class="outil outil--commande" data-ouvrir-commande aria-haspopup="dialog">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 6.5h12l-1 10H5Z M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5"/></svg>
        <span class="outil__texte">Commande</span><span class="compteur" data-compteur>0</span><span class="visuellement-cache"> article(s)</span>
      </button>
      <button type="button" class="outil outil--menu" aria-expanded="false" aria-controls="nav-principale" data-menu>
        <svg class="outil__ouvrir" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
        <svg class="outil__fermer" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5L5 15"/></svg>
        <span class="visuellement-cache" data-menu-texte>Ouvrir le menu</span>
      </button>
    </div>
  </div>
</header>""".format(marque=marque(), liens="".join(liens), lune=lune)


def pied():
    return """<footer class="pied">
  <div class="cadre">
    <div class="pied__grille">
      <div class="pied__marque">
        {marque}
        <p class="pied__slogan">Graver l’âme des territoires</p>
        <p>Atelier Terre Gravée<br>16 rue du Pic du Midi, 65200 Gerde<br><a href="contact.html">contact@terregravee.fr</a></p>
      </div>
      <div>
        <h2 class="pied__titre">Le carnet</h2>
        <ul>
          <li><a href="carte.html">La carte des plaques</a></li>
          <li><a href="collection.html">Les douze plaques</a></li>
          <li><a href="produit-led.html">Kit LED</a></li>
          <li><a href="produit-carte-cadeau.html">Carte cadeau</a></li>
          <li><a href="sur-mesure.html">Sur mesure et séries</a></li>
        </ul>
      </div>
      <div>
        <h2 class="pied__titre">Commander</h2>
        <ul>
          <li><a class="pied__retractation" href="contact.html#retractation">Renoncer au contrat ici</a></li>
          <li><a href="contact.html#livraison">Livraison et retours</a></li>
          <li><a href="contact.html#avis">Comment sont publiés les avis</a></li>
          <li><a href="{site}/cgv/">Conditions générales de vente</a></li>
          <li><a href="{site}/politique/">Mentions légales et confidentialité</a></li>
        </ul>
      </div>
      <div>
        <h2 class="pied__titre">Suivre l’atelier</h2>
        <ul>
          <li><a href="index.html#lettre">Lettre « planche inédite »</a></li>
          <li>Instagram {lien}</li>
          <li>Facebook {lien}</li>
        </ul>
      </div>
    </div>
    <div class="pied__bas">
      <p>Terre Gravée · Micro-entreprise · Responsable : Romain Fourneaux · SIRET 941 234 270 00010</p>
      <p>Prix TTC, TVA non applicable (art. 293 B du CGI)</p>
    </div>
  </div>
</footer>""".format(marque=marque(), site=SITE, lien=note("lien à fournir"))


def page(fichier, titre, description, contenu, actif=None, jsonld=None, scripts=(), classe=""):
    donnees = ""
    if jsonld:
        blocs = jsonld if isinstance(jsonld, list) else [jsonld]
        donnees = "".join('<script type="application/ld+json">' + json.dumps(b, ensure_ascii=False) + "</script>" for b in blocs)
    avant = "".join('<script src="assets/{}"></script>'.format(s) for s in scripts if s.startswith("donnees"))
    sup = "".join('<script src="assets/{}"></script>'.format(s) for s in scripts if not s.startswith("donnees"))
    sortie = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titre}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<script>try{{var t=localStorage.getItem("tg-v1-theme");if(t==="dark"||t==="light"){{document.documentElement.setAttribute("data-theme",t);}}if(localStorage.getItem("tg-v1-palette")==="marque"){{document.documentElement.setAttribute("data-palette","marque");}}}}catch(e){{}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{polices}">
<link rel="stylesheet" href="assets/carnet.css">
{donnees}
</head>
<body class="{classe}">
<a class="evitement" href="#contenu">Aller au contenu</a>
<div class="bandeau-maquette">
  <div class="cadre bandeau-maquette__ligne">
    <p><strong>Maquette version 1 · brouillon non publié · paiements désactivés</strong></p>
    <p class="bandeau-maquette__liens"><a href="strategie.html">Lire la stratégie</a><a href="../index.html">Comparer les versions</a></p>
  </div>
</div>
{entete}
<main id="contenu" tabindex="-1">
{contenu}
</main>
{pied}
<dialog class="commande" id="commande" aria-labelledby="titre-commande">
  <div class="commande__haut">
    <h2 id="titre-commande">Votre commande</h2>
    <button type="button" class="commande__fermer" data-fermer-commande>Fermer</button>
  </div>
  <ul class="commande__liste" data-liste-commande></ul>
  <div class="commande__bas">
    <p class="commande__total"><span>Sous-total TTC</span><strong data-total-commande>0 €</strong></p>
    <p class="visuellement-cache" aria-live="polite" data-annonce-commande></p>
    <p class="commande__info">Frais de port selon le poids et la destination, affichés avant validation {fournir}</p>
    <p class="commande__info">Expédition depuis Bagnères-de-Bigorre, livraison en 2 à 4 jours ouvrés (indicatif).</p>
    <button type="button" class="bouton bouton--plein" disabled aria-describedby="commande-desactivee">Commander</button>
    <p class="commande__info" id="commande-desactivee">Maquette : la commande et le paiement sont désactivés. Le panier reste dans ce navigateur.</p>
  </div>
</dialog>
<div class="toast" role="status" aria-live="polite"><span data-toast-texte></span><button type="button" data-ouvrir-commande>Voir la commande</button></div>
{avant}<script src="assets/carnet.js"></script>
{sup}
</body>
</html>
""".format(titre=e(titre), desc=e(description), polices=POLICES.replace("&", "&amp;"), donnees=donnees, classe=classe,
           entete=entete(actif), contenu=contenu, pied=pied(), fournir=note("montant à fournir"), sup=sup, avant=avant)
    with open(os.path.join(ICI, fichier), "w", encoding="utf-8") as f:
        f.write(typo(sortie))


# ---------------------------------------------------------------------------
# Composants
# ---------------------------------------------------------------------------

def visuel_carte(p, fin, sizes, eager=False):
    """Visuel d’une carte produit : la photo, ou un emplacement « photo à venir »."""
    if p["slug"] == "led":
        return img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED", eager=eager)
    if p["slug"] == "carte-cadeau":
        return img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, lettrage doré sur fond cuivré", eager=eager)
    return img_plaque(p, fin, sizes, eager=eager)


def vide_photo(p, fin, cls=""):
    return ('<div class="photo-a-venir {}" data-vide="{}"><span>Finition {}<br>photo à venir</span>{}</div>'
            .format(cls, fin, ACC_FIN[fin], note("photo à fournir")))


def carte_produit(p, sizes="(max-width: 600px) 44vw, (max-width: 1100px) 30vw, 300px", fin=None, titre_niveau="h3",
                  eager=False, rang=0):
    slug = p["slug"]
    url = "produit-{}.html".format(slug)
    acc = p["collection"] == "accessoires"
    fin = fin if (fin and a_photo(slug, fin)) else (None if acc else fin_defaut(p))
    lat = LIEUX[slug][0] if slug in LIEUX else (42.0 if slug in FAUNE else 41.0)
    data = ['data-collection="{}"'.format(cat_de(slug) or "accessoires"), 'data-nom="{}"'.format(e(p["nom"])),
            'data-tri="{}"'.format(e(tri_nom(p["nom"]))), 'data-lat="{}"'.format(lat), 'data-rang="{}"'.format(rang)]
    pastilles = ""
    vides = ""
    if not acc:
        btns = []
        for f, nom, accord in FINITIONS:
            ok = a_photo(slug, f)
            if ok:
                data.append('data-src-{0}="{1}p/{2}-{0}-440.webp" data-srcset-{0}="{3}"'.format(f, IMG, slug, srcset_plaque(slug, f)))
            else:
                vides += vide_photo(p, f, "carte__vide")
            etat = "true" if f == fin else "false"
            lib = nom if ok else nom + ", photo à venir"
            btns.append('<button type="button" class="pastille pastille--{f}" data-fin="{f}" aria-pressed="{etat}">'
                        '<span class="visuellement-cache">{lib}</span></button>'.format(f=f, etat=etat, lib=lib))
        pastilles = ('<div class="pastilles" role="group" aria-label="Finition affichée pour {}">{}</div>'
                     .format(e(p["nom"]), "".join(btns)))
    if acc:
        ligne = "Option, montée avant l’envoi" if slug == "led" else "Une plaque au choix"
    else:
        ligne = cartel_court(p)
    nb = len(p["avis"])
    if nb:
        moy = sum(a["note"] for a in p["avis"]) / nb
        avis = '<span class="carte__avis">{} {} · {} avis<span class="visuellement-cache"> sur 5</span></span>'.format(etoiles(moy), note_fr(moy), nb)
    else:
        avis = '<span class="carte__avis carte__avis--vide">Pas encore d’avis</span>'
    sur_carte = ""
    if slug in LIEUX:
        sur_carte = '<a class="carte__carte" href="carte.html#{}">Sur la carte</a>'.format(slug)
    elif slug in FAUNE:
        sur_carte = '<a class="carte__carte" href="carte.html#faune">Sur la carte</a>'
    visuel_cls = "carte__visuel carte__visuel--carre" if slug == "carte-cadeau" else "carte__visuel"
    meta = ""
    if not acc:
        meta = '<div class="carte__pied">{}<p class="carte__ligne-avis">{}</p><p class="carte__ligne-carte">{}</p></div>'.format(
            pastilles, avis, sur_carte)
    return """<li class="carte" {data}>
  <a class="{vcls}" href="{url}" tabindex="-1" aria-hidden="true">{visuel}{vides}</a>
  <div class="carte__corps">
    <p class="carte__cartel">{ligne}</p>
    <{h} class="carte__nom"><a href="{url}">{nom}</a></{h}>
    <p class="carte__prix">{prix}</p>
    {meta}
  </div>
</li>""".format(data=" ".join(data), vcls=visuel_cls, url=url, visuel=visuel_carte(p, fin, sizes, eager), vides=vides, ligne=ligne,
                h=titre_niveau, nom=e(p["nom"]), prix=euros(p["prix"]), meta=meta)


def grille_produits(produits, cls="grille", sizes="(max-width: 600px) 44vw, 260px", titre_niveau="h3", prefixe_cartes=None):
    """Grille de cartes produit ; ajoute la mention sur les avis dès qu’une carte affiche une note."""
    cartes = prefixe_cartes if prefixe_cartes is not None else [carte_produit(q, sizes=sizes, titre_niveau=titre_niveau) for q in produits]
    mention = MENTION_AVIS if any(q["avis"] for q in produits) else ""
    return '<ul class="{}">{}</ul>{}'.format(cls, "".join(cartes), mention)


def avis_item(a, avec_produit=True, cls="avis"):
    p = PRODUITS[a["produit"]]
    prod = ""
    if avec_produit:
        prod = '<a class="avis__plaque" href="produit-{}.html">{}</a>'.format(p["slug"], e(p["nom"]))
    return """<li class="{cls}">
  <figure>
    <p class="avis__note">{etoiles}<span class="visuellement-cache">Note : {n} sur 5</span></p>
    <blockquote><p>« {texte} »</p></blockquote>
    <figcaption><span class="avis__auteur">{auteur}</span>{prod}<span class="avis__date">publié le <time datetime="{iso}">{date}</time></span></figcaption>
  </figure>
</li>""".format(cls=cls, etoiles=etoiles(a["note"]), n=a["note"], texte=e(a["texte"]), auteur=e(a["auteur"]), prod=prod,
                iso=a["date"], date=date_fr(a["date"]))


MENTION_AVIS = ('<p class="mention-avis">Avis publiés sur le site sans vérification d’achat. '
                '<a href="contact.html#avis">Comment sont publiés les avis</a></p>')

# ---------------------------------------------------------------------------
# Cartographie : SVG commun (carte principale et vignettes)
# ---------------------------------------------------------------------------


def graticule(vb, pas_lat=0.25, pas_lon=0.25, etiquettes=True, marge=0.0, bas=False):
    x0, y0, w, h = vb
    traits, textes = [], []
    lat = math.ceil((LAT_MAX - (y0 + h) / S) / pas_lat) * pas_lat
    while lat <= LAT_MAX - y0 / S + 1e-9:
        _, y = proj(lat, 0)
        if y0 < y < y0 + h - marge:
            traits.append('<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}"/>'.format(x0, y, x0 + w, y))
            if etiquettes:
                d = int(lat)
                m = int(round((lat - d) * 60))
                textes.append('<text x="{:.1f}" y="{:.1f}" class="carte__grad">{}°{:02d}′ N</text>'.format(x0 + 6, y - 4, d, m))
        lat += pas_lat
    lon = math.ceil((LON_MIN + x0 / (K * S)) / pas_lon) * pas_lon
    while lon <= LON_MIN + (x0 + w) / (K * S) + 1e-9:
        x, _ = proj(LAT_MAX, lon)
        if x0 + marge < x < x0 + w:
            traits.append('<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}"/>'.format(x, y0, x, y0 + h))
            if etiquettes:
                v = abs(lon)
                d = int(v + 1e-9)
                m = int(round((v - d) * 60))
                sens = "" if abs(lon) < 1e-6 else (" E" if lon > 0 else " O")
                textes.append('<text x="{:.1f}" y="{:.1f}" class="carte__grad">{}°{:02d}′{}</text>'.format(x + 4, (y0 + h - 6) if bas else (y0 + 14), d, m, sens))
        lon += pas_lon
    return '<g class="carte__graticule">{}</g><g>{}</g>'.format("".join(traits), "".join(textes))


def svg_fond(vb, uid):
    x0, y0, w, h = vb
    return """<svg class="carte__fond" viewBox="{vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <clipPath id="decoupe-{uid}"><path d="{contour}"/></clipPath>
  </defs>
  <rect x="{x0}" y="{y0}" width="{w}" height="{h}" class="carte__hors"/>
  <path d="{contour}" class="carte__dep"/>
</svg>""".format(vb="{} {} {} {}".format(x0, y0, w, h), uid=uid, contour=CONTOUR_D, x0=x0, y0=y0, w=w, h=h)


def svg_dessus(vb, uid, detail=True, trajet=True, villes=True, parc=True, grad=True):
    x0, y0, w, h = vb
    morceaux = []
    if parc:
        morceaux.append('<g class="calque-parc"><path d="{}" clip-path="url(#decoupe-{})" class="carte__parc" fill="url(#hachures-{})"/></g>'.format(PARC_D, uid, uid))
    riv = []
    for nom, pts in RIVIERES.items():
        riv.append('<path d="{}" class="carte__riviere{}"/>'.format(chemin([(lo, la) for la, lo in pts], ferme=False),
                                                                    " carte__riviere--petite" if nom == "Gave de Cauterets" else ""))
    morceaux.append('<g class="calque-eaux">{}</g>'.format("".join(riv)))
    morceaux.append('<path d="{}" class="carte__limite"/>'.format(CONTOUR_D))
    if detail:
        lx, ly = proj(43.18, 0.105)
        gx, gy = proj(42.925, -0.062)
        nx, ny = proj(42.95, 0.395)
        morceaux.append('<g class="calque-eaux"><text x="{:.0f}" y="{:.0f}" class="carte__eau">l’Adour</text>'
                        '<text x="{:.0f}" y="{:.0f}" class="carte__eau" transform="rotate(-52 {:.0f} {:.0f})">Gave de Pau</text>'
                        '<text x="{:.0f}" y="{:.0f}" class="carte__eau" transform="rotate(62 {:.0f} {:.0f})">la Neste</text></g>'
                        .format(lx, ly, gx, gy, gx, gy, nx, ny, nx, ny))
        ex, ey = proj(42.656, -0.13)
        ox, oy = x0 + 15, y0 + 185
        hx, hy = x0 + w - 15, y0 + 340
        morceaux.append('<g class="carte__pays"><text x="{:.0f}" y="{:.0f}">ESPAGNE</text>'
                        '<text x="{:.0f}" y="{:.0f}" text-anchor="middle" transform="rotate(-90 {:.0f} {:.0f})">PYRÉNÉES-ATLANTIQUES</text>'
                        '<text x="{:.0f}" y="{:.0f}" text-anchor="middle" transform="rotate(90 {:.0f} {:.0f})">HAUTE-GARONNE</text></g>'.format(ex, ey, ox, oy, ox, oy, hx, hy, hx, hy))
    if villes:
        v = []
        for nom, la, lo, cote in VILLES:
            x, y = proj(la, lo)
            ancre = "start" if cote == "d" else "end"
            dx = 6 if cote == "d" else -6
            v.append('<circle cx="{:.1f}" cy="{:.1f}" r="2.6" class="carte__ville-point"/>'
                     '<text x="{:.1f}" y="{:.1f}" text-anchor="{}" class="carte__ville">{}</text>'.format(x, y, x + dx, y + 4, ancre, nom))
        morceaux.append('<g class="calque-villes">{}</g>'.format("".join(v)))
    if trajet:
        bx, by = proj(*BAGNERES)
        gx2, gy2 = proj(*GERDE)
        # flèche vers Revel, hors cadre à l’est-nord-est
        fx, fy = x0 + w - 8, by - 0.22 * (x0 + w - 8 - bx)
        morceaux.append("""<g class="calque-trajet">
  <path d="M{fx:.1f},{fy:.1f} L{bx:.1f},{by:.1f}" class="trajet__ligne"/>
  <path d="M{fx:.1f},{fy:.1f} l-12,-3 l3,6 z" class="trajet__fleche" transform="rotate(-12 {fx:.1f} {fy:.1f})"/>
  <circle cx="{bx:.1f}" cy="{by:.1f}" r="11" class="trajet__etape"/>
  <text x="{tx:.1f}" y="{ty:.1f}" text-anchor="end" class="trajet__texte"><tspan x="{tx:.1f}">Revel (31) · découpe laser</tspan><tspan x="{tx:.1f}" dy="15">à environ {km} km, hors cadre</tspan></text>
</g>
<g class="calque-atelier">
  <rect x="{gx:.1f}" y="{gy:.1f}" width="9" height="9" class="atelier__point" transform="translate(-4.5 -4.5)"/>
  <text x="{gtx:.1f}" y="{gty:.1f}" class="atelier__texte">Atelier (adresse) · Gerde</text>
</g>""".format(fx=fx, fy=fy, bx=bx, by=by, gx=gx2, gy=gy2, tx=x0 + w - 10, ty=fy - 30, km=KM_REVEL,
               gtx=gx2 + 9, gty=gy2 + 16))
    if grad:
        morceaux.append(graticule(vb))
        # échelle et nord
        sx, sy = x0 + 18, y0 + h - 30
        dix = 10 / 111.2 * S
        morceaux.append('<g class="carte__echelle"><path d="M{0:.0f},{1:.0f}h{2:.0f}M{0:.0f},{3:.0f}v8M{4:.0f},{3:.0f}v8"/>'
                        '<text x="{0:.0f}" y="{5:.0f}">0</text><text x="{4:.0f}" y="{5:.0f}" text-anchor="middle">10 km</text></g>'
                        .format(sx, sy, dix, sy - 4, sx + dix, sy - 8))
        nx2, ny2 = x0 + w - 26, y0 + 34
        morceaux.append('<g class="carte__nord"><path d="M{0:.0f},{1:.0f}l7,18l-7,-5l-7,5z"/><text x="{0:.0f}" y="{2:.0f}" text-anchor="middle">N</text></g>'
                        .format(nx2, ny2, ny2 - 6))
    defs = ('<defs><clipPath id="decoupe-{0}-b"><path d="{1}"/></clipPath>'
            '<pattern id="hachures-{0}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">'
            '<line x1="0" y1="0" x2="0" y2="7" class="hachure"/></pattern></defs>').format(uid, CONTOUR_D)
    return '<svg class="carte__dessus" viewBox="{} {} {} {}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{}{}</svg>'.format(
        x0, y0, w, h, defs, "".join(morceaux).replace("url(#decoupe-{})".format(uid), "url(#decoupe-{}-b)".format(uid)))


def localisateur(slug):
    """Vignette : tout le département, un repère, pour la fiche produit."""
    bx0, by0 = proj(43.63, -0.36)
    bx1, by1 = proj(42.65, 0.67)
    vb = "{:.0f} {:.0f} {:.0f} {:.0f}".format(bx0, by0, bx1 - bx0, by1 - by0)
    # contour complet (projection identique, hors cadre principal)
    if slug in LIEUX:
        la, lo, cat, _ = LIEUX[slug]
        x, y = proj(la, lo)
        rep = '<circle cx="{:.1f}" cy="{:.1f}" r="34" class="loc__halo"/><circle cx="{:.1f}" cy="{:.1f}" r="15" class="loc__point loc__point--{}"/>'.format(x, y, x, y, cat)
        txt = "Position indicative"
    else:
        rep = '<path d="{}" clip-path="url(#loc-clip)" class="loc__parc"/>'.format(PARC_D)
        txt = "Parc national des Pyrénées, zone schématique, repère géographique"
    return """<figure class="localisateur">
  <svg viewBox="{vb}" role="img" aria-label="{aria}">
    <defs><clipPath id="loc-clip"><path d="{c}"/></clipPath></defs>
    <path d="{c}" class="loc__dep"/>
    {rep}
  </svg>
  <figcaption>{txt}</figcaption>
</figure>""".format(vb=vb, c=CONTOUR_D, rep=rep, txt=txt,
                    aria=e("Carte des Hautes-Pyrénées : " + txt.lower()))


def decalage(slug):
    """Style et trait de rappel d’un repère décalé de sa position réelle (en pixels)."""
    if slug not in DECALAGES:
        return "", "", ""
    dx, dy = DECALAGES[slug]
    x, y = pc(*pos_de(slug))
    grappe = [g[0] for g in GRAPPES if slug in g[2]]
    dans = ' data-dans-grappe="{}"'.format(grappe[0]) if grappe else ""
    rappel = ('<span class="repere-rappel" style="left:{:.2f}%;top:{:.2f}%;width:{:.0f}px;transform:rotate({:.1f}deg)"{} aria-hidden="true"></span>'
              .format(x, y, math.hypot(dx, dy), math.degrees(math.atan2(dy, dx)), dans))
    return ";--dx:{}px;--dy:{}px".format(dx, dy), " repere--decale", rappel


def bouton_repere(slug, avec_nom=True, prefixe="rep"):
    p = PRODUITS[slug]
    la, lo, cat, cote = LIEUX[slug]
    x, y = pc(la, lo)
    dstyle, dcls, rappel = decalage(slug)
    lieu, detail = p["cartel"]
    aria = "{}, {}, {}".format(p["nom"], lieu, detail)
    grappe = [g[0] for g in GRAPPES if slug in g[2]]
    dans = ' data-dans-grappe="{}"'.format(grappe[0]) if grappe else ""
    return (rappel + '<button type="button" class="repere repere--{cote}{dcls}" style="left:{x:.2f}%;top:{y:.2f}%{dstyle}" data-lieu="{slug}" '
            'data-cat="{cat}"{dans} id="{pref}-{slug}" aria-label="{aria}" aria-controls="panneau" aria-expanded="false">'
            '{sym}<span class="repere__nom">{nom}</span></button>').format(
                cote=cote, dcls=dcls, x=x, y=y, dstyle=dstyle, slug=slug, cat=cat, dans=dans, pref=prefixe, aria=e(aria),
                sym=symbole(cat, "repere__sym"), nom=e(p["nom"]))


def lien_repere(slug):
    p = PRODUITS[slug]
    la, lo, cat, cote = LIEUX[slug]
    x, y = pc(la, lo)
    dstyle, dcls, rappel = decalage(slug)
    return (rappel.replace(" data-dans-grappe", " data-mini") + '<a class="repere repere--{cote}{dcls}" style="left:{x:.2f}%;top:{y:.2f}%{dstyle}" href="carte.html#{slug}" data-lieu="{slug}">'
            '{sym}<span class="repere__nom">{nom}</span></a>').format(cote=cote, dcls=dcls, x=x, y=y, dstyle=dstyle, slug=slug,
                                                                       sym=symbole(cat, "repere__sym"), nom=e(p["nom"]))


def zone_faune(bouton=True):
    x, y = pc(*ZONE_FAUNE)
    nom = '<span class="repere__nom">Faune des Pyrénées<small>4 plaques, sans repère précis</small></span>'
    if bouton:
        return ('<button type="button" class="repere repere--zone" style="left:{:.2f}%;top:{:.2f}%" data-lieu="faune" data-cat="faune" '
                'id="rep-faune" aria-label="Faune des Pyrénées, 4 plaques : l’isard, l’ours, le cerf, la marmotte" '
                'aria-controls="panneau" aria-expanded="false">{}{}</button>'
                ).format(x, y, symbole("faune", "repere__sym"), nom)
    return ('<a class="repere repere--zone" style="left:{:.2f}%;top:{:.2f}%" href="carte.html#faune" data-lieu="faune">{}{}</a>'
            ).format(x, y, symbole("faune", "repere__sym"), nom)


def cats_grappe(membres):
    vues = []
    for s in membres:
        if cat_de(s) not in vues:
            vues.append(cat_de(s))
    return " ".join(vues)


def dans_grappe(slug):
    g = [g[0] for g in GRAPPES if slug in g[2]]
    return ' data-dans-grappe="{}"'.format(g[0]) if g else ""


def bouton_vrai():
    """Repère « Où voir les plaques en vrai » : le décor d’origine à Aquensis (étoile cuivre)."""
    x, y = pc(*AQUENSIS)
    dstyle, dcls, rappel = decalage("aquensis")
    return (rappel + '<button type="button" class="repere repere--g repere--vrai{dcls}" style="left:{x:.2f}%;top:{y:.2f}%{dstyle}" data-lieu="aquensis" '
            'data-cat="vrai"{dans} id="rep-aquensis" aria-label="Aquensis, Bagnères-de-Bigorre : où voir les plaques en vrai, le décor d’origine (panneaux de 1 m × 2 m)" '
            'aria-controls="panneau" aria-expanded="false">{sym}<span class="repere__nom">Aquensis<small>le décor d’origine<span class="repere__plus"> (1 m × 2 m)</span></small></span></button>').format(
                dcls=dcls, x=x, y=y, dstyle=dstyle, dans=dans_grappe("aquensis"), sym=symbole("vrai", "repere__sym"))


def bouton_bientot(slug):
    """Repère « bientôt » : modèle en préparation, symbole en creux et en pointillé."""
    b = BIENTOT[slug]
    x, y = pc(*b["pos"])
    dstyle, dcls, rappel = decalage(slug)
    return (rappel + '<button type="button" class="repere repere--{cote} repere--bientot{bas}{dcls}" style="left:{x:.2f}%;top:{y:.2f}%{dstyle}" data-lieu="{slug}" '
            'data-cat="bientot"{dans} id="rep-{slug}" aria-label="{aria}" aria-controls="panneau" aria-expanded="false">'
            '{sym}<span class="repere__nom">{nom}<small>bientôt, en préparation</small></span></button>').format(
                cote=b["cote"], bas=" repere--bas" if b.get("bas") else "", dcls=dcls, x=x, y=y, dstyle=dstyle, slug=slug, dans=dans_grappe(slug),
                aria=e("{}, {} : modèle en préparation".format(b["nom"], b["lieu"])), sym=symbole("bientot", "repere__sym", b["forme"]), nom=e(b["nom"]))


def zone_transhumance():
    x, y = pc(*TRANSHUMANCE["zone"])
    return ('<button type="button" class="repere repere--zone repere--bientot" style="left:{:.2f}%;top:{:.2f}%" data-lieu="la-transhumance" data-cat="bientot" '
            'id="rep-la-transhumance" aria-label="La Transhumance : modèle en préparation, sans repère précis" aria-controls="panneau" aria-expanded="false">'
            '{}<span class="repere__nom">La Transhumance<small>bientôt, sans repère précis</small></span></button>').format(
                x, y, symbole("bientot", "repere__sym", "sites"))


def bouton_grappe(cle, nom, membres, cat, dx, dy):
    """Grappe affichée sous 960 px à la place de repères trop proches ; dx, dy : décalage du symbole en pixels.
    data-cat liste les catégories des membres (filtres de la carte)."""
    pts = [pc(*pos_de(s)) for s in membres]
    x = sum(p[0] for p in pts) / len(pts)
    y = sum(p[1] for p in pts) / len(pts)
    if cle in ANCRES_GRAPPES:
        x, y = pc(*ANCRES_GRAPPES[cle])
    noms = ", ".join(nom_de(s) for s in membres)
    rappel = ""
    if dx or dy:
        long = math.hypot(dx, dy)
        angle = math.degrees(math.atan2(dy, dx))
        rappel = '<span class="grappe__rappel" style="width:{:.0f}px;transform:rotate({:.1f}deg)" aria-hidden="true"></span>'.format(long, angle)
    quoi = "{} plaques".format(len(membres)) if all(s in PRODUITS for s in membres) else "{} repères".format(len(membres))
    return ('<button type="button" class="grappe" style="left:{x:.2f}%;top:{y:.2f}%;--dx:{dx}px;--dy:{dy}px" data-grappe="{cle}" data-cat="{cats}" '
            'id="grappe-{cle}" aria-label="{aria}" aria-controls="panneau" aria-expanded="false">{rappel}'
            '<span class="grappe__pastille">{sym}<span class="grappe__nb">{n}</span></span></button>').format(
                x=x, y=y, dx=dx, dy=dy, cle=cle, cats=cats_grappe(membres), rappel=rappel, sym=symbole(cat, "grappe__sym"), n=len(membres),
                aria=e("{}, {} : {}".format(nom, quoi, noms)))


def carte_plan(uid, interactif=True, trajet=True, legende_cls=""):
    vb = (0, 0, VB_W, VB_H)
    if interactif:
        reperes = ("".join(bouton_repere(s) for s in sorted(LIEUX, key=lambda s: -LIEUX[s][0])) + zone_faune(True) +
                   bouton_vrai() + "".join(bouton_bientot(s) for s in BIENTOT) + zone_transhumance() +
                   "".join(bouton_grappe(*g) for g in GRAPPES))
        ouvrir = ""
    else:
        reperes = "".join(lien_repere(s) for s in sorted(LIEUX, key=lambda s: -LIEUX[s][0])) + zone_faune(False)
        # Sur petit écran, toute la mini-carte est une seule cible vers la carte complète (le lien texte reste sous la carte)
        ouvrir = '<a class="carte__ouvrir" href="carte.html" tabindex="-1" aria-hidden="true"><span>Ouvrir la carte des lieux</span></a>'
    return """<div class="carte__plan" style="aspect-ratio:{w} / {h}" data-plan="{uid}">
  {fond}
  <canvas class="carte__relief" data-relief="carte" data-vb="0 0 {w} {h}" aria-hidden="true"></canvas>
  {dessus}
  <div class="carte__reperes">{reperes}</div>
  {ouvrir}
</div>""".format(w=VB_W, h=VB_H, uid=uid, fond=svg_fond(vb, uid), dessus=svg_dessus(vb, uid, trajet=trajet), reperes=reperes,
                 ouvrir=ouvrir)


def legende():
    items = []
    for cat in ("sommets", "sites", "patrimoine", "faune"):
        items.append('<li>{}{}</li>'.format(symbole(cat), CATS[cat][0]))
    items.append('<li><span class="leg-trajet" aria-hidden="true"></span>Trajet de fabrication</li>')
    items.append('<li><span class="leg-atelier" aria-hidden="true"></span>Adresse de l’atelier</li>')
    items.append('<li><span class="leg-parc" aria-hidden="true"></span>Parc national des Pyrénées, zone schématique, repère géographique</li>')
    items.append('<li>{}Où voir les plaques en vrai</li>'.format(symbole("vrai")))
    items.append('<li>{}Bientôt : modèle {}</li>'.format(symbole("bientot"), A_PREPARATION))
    return '<ul class="legende">{}</ul>'.format("".join(items))


def donnees_js():
    """Données pour le relief génératif (canvas), en script classique."""
    d = {
        "cadre": {"latMax": LAT_MAX, "lonMin": LON_MIN, "k": K, "s": S, "w": VB_W, "h": VB_H},
        "pics": PICS,
        "rivieres": [pts for pts in RIVIERES.values()],
        "contour": CONTOUR_D,
    }
    with open(os.path.join(ICI, "assets", "donnees-carte.js"), "w", encoding="utf-8") as f:
        f.write("/* Généré par build.py : données du relief décoratif (positions indicatives). */\n")
        f.write("window.TG_CARTE = " + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";\n")


# ---------------------------------------------------------------------------
# Textes éditoriaux propres à la version
# ---------------------------------------------------------------------------

OFFRIR = {
    "le-pic-du-midi": ["À quelqu’un qui part vivre loin de la Bigorre et veut garder le Pic à l’horizon.",
                       "Pour une crémaillère à Bagnères, à Tarbes ou dans la vallée de Campan.",
                       "À celles et ceux qui aiment le ciel étoilé : la plaque en dessine les étoiles."],
    "le-tourmalet": ["Au cycliste qui l’a monté cet été, ou qui se prépare à le faire.",
                     "Pour fêter une première ascension, à vélo ou à pied.",
                     "À un passionné de l’histoire du cyclisme."],
    "le-montaigu": ["À qui préfère les sommets moins connus.",
                    "Pour un coin lecture ou un bureau, un mur calme et vertical."],
    "le-cirque-de-gavarnie": ["Au randonneur qui a marché jusqu’au pied du cirque.",
                              "En souvenir d’une première visite à Gavarnie.",
                              "Pour un départ : emporter un grand paysage des Pyrénées."],
    "le-pont-despagne": ["En souvenir de vacances à Cauterets.",
                         "Pour un mur consacré à la nature, à l’eau et à la forêt."],
    "la-tour-des-jacobins": ["En souvenir d’une cure à Bagnères-de-Bigorre.",
                             "Pour une famille bagnéraise, ou qui l’a été.",
                             "Aux amateurs d’histoire locale."],
    "le-chateau-de-mauvezin": ["À qui habite les Baronnies ou y a grandi.",
                               "Pour une crémaillère dans le pays des Baronnies.",
                               "Aux passionnés d’histoire médiévale."],
    "labbaye-de-lescaladieu": ["En souvenir d’une visite de l’abbaye.",
                               "Aux amateurs de pierre, de lumière douce et d’histoire cistercienne."],
    "lisard": ["Au randonneur qui en a croisé un au détour d’un sentier.",
               "Pour une maison de vacances en montagne."],
    "lours": ["À qui aime la faune sauvage des Pyrénées.",
              "Pour un extérieur : aluminium thermolaqué, avec une fixation adaptée " + note("fixation extérieure à fournir") + "."],
    "le-cerf": ["Pour un salon, un bureau ou un extérieur.",
                "Un cadeau pour un ami qui aime la forêt."],
    "la-marmotte": ["En souvenir d’une randonnée en famille.",
                    "Pour une chambre d’enfant ou une maison de vacances."],
}


# ---------------------------------------------------------------------------
# Accueil
# ---------------------------------------------------------------------------

# Héros : la carte comme décor (cadre en unités de conteneur : les repères HTML suivent le SVG et le canvas en « slice »)
HEROS_W, HEROS_H = 425.0, 230.0


def heros_cadre():
    px, py = proj(42.937, 0.142)
    xc = px - 0.12 * HEROS_W
    y0 = py - 0.62 * HEROS_H
    return (round(xc - HEROS_W / 2, 1), round(y0, 1), HEROS_W, HEROS_H)


def heros():
    pic = PRODUITS["le-pic-du-midi"]
    vb = heros_cadre()
    x0, y0, w, h = vb
    xc, yc = x0 + w / 2, y0 + h / 2
    vbs = "{} {} {} {}".format(*vb)

    def rel(lat, lon):
        x, y = proj(lat, lon)
        return "--x:{:.1f};--y:{:.1f}".format(x - xc, y - yc)

    riv = "".join('<path d="{}" class="carte__riviere"/>'.format(chemin([(lo, la) for la, lo in pts], ferme=False)) for pts in RIVIERES.values())
    lignes = []
    lat = 42.8
    while lat < 43.2:
        _, y = proj(lat, 0)
        lignes.append('<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}"/>'.format(x0, y, x0 + w, y))
        lat = round(lat + 0.1, 2)
    grads = []
    lon = -0.2
    while lon < 0.5:
        x, _ = proj(LAT_MAX, lon)
        lignes.append('<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}"/>'.format(x, y0, x, y0 + h))
        if 0.0 <= lon <= 0.4:
            d = int(round(abs(lon) * 60))
            grads.append('<span class="heros__grad" style="--x:{:.1f}">{}°{:02d}′{}</span>'.format(
                x - xc, d // 60, d % 60, "" if abs(lon) < 1e-6 else " E"))
        lon = round(lon + 0.1, 2)
    gave = "".join('<span class="heros__eau" style="{};--r:{}deg">{}</span>'.format(rel(la, lo), r, n)
                   for n, la, lo, r in (("l’Adour", 43.035, 0.168, 62),))
    lieux = [
        ("heros__lieu heros__lieu--g", rel(42.909, 0.145), symbole("sommets", "heros__sym"), "Col du Tourmalet"),
        ("heros__lieu heros__lieu--d", rel(42.984, 0.069), symbole("sommets", "heros__sym"), "Pic du Montaigu"),
        ("heros__lieu heros__lieu--g", rel(*BAGNERES), '<span class="heros__ville" aria-hidden="true"></span>', "Bagnères-de-Bigorre"),
    ]
    lieux_html = "".join('<span class="{}" style="{}">{}<span>{}</span></span>'.format(c, s, sym, n) for c, s, sym, n in lieux)
    return """<section class="heros" aria-labelledby="titre-heros">
  <div class="heros__plan">
    <div class="heros__carte" aria-hidden="true">
      <svg class="carte__fond" viewBox="{vbs}" preserveAspectRatio="xMidYMid slice" focusable="false"><rect x="{x0}" y="{y0}" width="{w}" height="{h}" class="carte__dep"/></svg>
      <canvas class="carte__relief" data-relief="heros" data-vb="{vbs}" data-slice></canvas>
      <svg class="carte__dessus" viewBox="{vbs}" preserveAspectRatio="xMidYMid slice" focusable="false"><g class="carte__graticule">{lignes}</g>{riv}</svg>
      {grads}{gave}{lieux}
      <span class="heros__pic" style="{pic_pos}">{sym_pic}</span>
      <span class="heros__trait" style="{pic_pos}"></span>
      <span class="heros__echelle"><span class="heros__echelle-barre"></span><span>0</span><span>5 km</span></span>
      <span class="heros__nord">N</span>
    </div>
    <figure class="heros__plaque">
      {plaque}
      <figcaption class="heros__cartel">
        <strong>Pic du Midi de Bigorre</strong>
        <span>2 877 m · {coords} · position indicative</span>
        <span>Plaque « Le Pic du Midi », finition noire, 60 × 30 cm</span>
      </figcaption>
    </figure>
  </div>
  <div class="cadre heros__cadre">
    <div class="cartouche">
      <p class="cartouche__entete"><span>Feuille 65 · Hautes-Pyrénées</span><span>Carnet de territoire</span></p>
      <h1 id="titre-heros">Un morceau de Bigorre, <em>à accrocher</em> chez vous.</h1>
      <p class="heros__chapo">Le Pic du Midi, le Tourmalet, la tour des Jacobins, l’isard : huit lieux du département et quatre animaux des Pyrénées, dessinés par Maude Villatte et Lola Jacquet, découpés au laser dans l’aluminium puis thermolaqués à Bagnères-de-Bigorre. Chaque plaque porte son numéro gravé au dos.</p>
      <div class="heros__actions">
        <a class="bouton bouton--plein" href="carte.html">Ouvrir la carte des lieux</a>
        <a class="lien-fleche" href="collection.html">Voir les douze plaques</a>
      </div>
      <ul class="cartouche__legende" aria-label="Légende des symboles">{legende}</ul>
    </div>
  </div>
</section>""".format(vbs=vbs, x0=x0, y0=y0, w=w, h=h, lignes="".join(lignes), riv=riv, grads="".join(grads), gave=gave,
                     lieux=lieux_html, pic_pos=rel(42.937, 0.142), sym_pic=symbole("sommets", "heros__sym"),
                     plaque=img_plaque(pic, "noir", "(max-width: 999px) 34vw, 250px", eager=True,
                                       extra='style="view-transition-name:vt-le-pic-du-midi"'),
                     coords=dms(42.937, 0.142),
                     legende="".join('<li>{}{}</li>'.format(symbole(c), CATS[c][0]) for c in ORDRE_CATS))


def legende_accueil():
    items = [
        ("numero", "N°", "Série limitée", "Chaque plaque porte son numéro, gravé au dos."),
        ("adhesif", "", "Pose sans perçage", "Deux fixations adhésives 3M Command™ fournies. Le léger écart avec le mur fait ressortir les ombres de la découpe."),
        ("dehors", "", "Dedans comme dehors", "Aluminium thermolaqué, pour l’intérieur et l’extérieur. " + note("fixation extérieure à fournir")),
        ("trajet", "", "Expédiée de Bagnères", "Livraison en 2 à 4 jours ouvrés, à titre indicatif. L’atelier vous prévient en cas de retard."),
    ]
    lis = "".join('<div><dt><span class="leg-symbole leg-symbole--{}" aria-hidden="true">{}</span>{}</dt><dd>{}</dd></div>'.format(c, s, t, d)
                  for c, s, t, d in items)
    return """<section class="legende-accueil" aria-labelledby="titre-legende">
  <div class="cadre">
    <div class="legende-accueil__cadre">
      <h2 id="titre-legende" class="legende-accueil__titre">Légende</h2>
      <dl class="legende-accueil__liste">{}</dl>
    </div>
  </div>
</section>""".format(lis)


def table_des_lieux():
    groupes = [
        ("Sommets, cols et sites", ["le-pic-du-midi", "le-tourmalet", "le-montaigu", "le-cirque-de-gavarnie", "le-pont-despagne"]),
        ("Patrimoine", ["la-tour-des-jacobins", "le-chateau-de-mauvezin", "labbaye-de-lescaladieu"]),
        ("Faune des Pyrénées", FAUNE),
    ]
    blocs = []
    for titre, slugs in groupes:
        lignes = []
        for s in slugs:
            p = PRODUITS[s]
            lieu, detail = p["cartel"]
            droite = "<i>{}</i>".format(e(detail)) if p["collection"] == "faune" else e(detail if detail.endswith(" m") else lieu)
            sym = symbole(cat_de(s), "index__sym")
            lignes.append('<li><a class="index__ligne" href="produit-{s}.html" data-lieu="{lieu}">{sym}<span class="index__nom">{n}</span>'
                          '<span class="index__points" aria-hidden="true"></span><span class="index__val">{d}</span></a></li>'
                          .format(s=s, lieu=("faune" if s in FAUNE else s), sym=sym, n=e(p["nom"]), d=droite))
        cls = ' class="index__duo"' if slugs == FAUNE else ""
        blocs.append('<div class="index__groupe"><h3 class="index__titre">{}</h3><ol{}>{}</ol></div>'.format(titre, cls, "".join(lignes)))
    return """<section class="section table-lieux" aria-labelledby="titre-table">
  <div class="cadre">
    <div class="entete-section">
      {etiq}
      <h2 id="titre-table">Table des lieux</h2>
      <p class="chapo">Huit lieux du département et quatre animaux des Pyrénées. Toutes les plaques sont au même prix : 65 €, quel que soit le modèle et la finition. Et pour compléter : <a href="produit-led.html">le kit LED</a> et <a href="produit-carte-cadeau.html">la carte cadeau</a>.</p>
    </div>
    <div class="table-lieux__grille">
      <figure class="atlas atlas--mini">
        {plan}
        <figcaption class="carte__legende-mini">Positions indicatives, à un ou deux kilomètres près. <a href="carte.html">Ouvrir la carte des lieux</a></figcaption>
      </figure>
      <nav class="index" aria-label="Table des lieux">{blocs}</nav>
    </div>
  </div>
</section>""".format(etiq=etiquette("L’atlas"), plan=carte_plan("mini", interactif=False, trajet=False), blocs="".join(blocs))


def a_la_une():
    p = PRODUITS["le-tourmalet"]
    av = dict(p["avis"][0], produit=p["slug"])
    return """<section class="section une" aria-labelledby="titre-une">
  <div class="cadre une__grille">
    <figure class="une__image">
      {img}
      <figcaption>Mise en situation · Le Tourmalet, finition noire</figcaption>
    </figure>
    <div class="une__texte">
      {etiq}
      <p class="une__cartel">{borne}<span>Col du Tourmalet · {coords}</span></p>
      <h2 id="titre-une">L’âme du cyclisme</h2>
      <p class="lecture">{histoire}</p>
      <figure class="une__citation">
        <blockquote><p>« {avis} »</p></blockquote>
        <figcaption>{auteur}, avis publié le {date} · {etoiles}<span class="visuellement-cache">5 sur 5</span></figcaption>
      </figure>
      {mention}
      <p class="une__actions"><a class="bouton" href="produit-le-tourmalet.html">Lire l’entrée du Tourmalet</a><a class="lien-fleche" href="carte.html#le-tourmalet">Le col sur la carte</a></p>
    </div>
  </div>
</section>""".format(img=img("d/le-tourmalet-decor-1200.webp", "Mise en situation : plaque Le Tourmalet noire au-dessus d’un bureau",
                             "(max-width: 900px) 100vw, 760px", srcset="{0}d/le-tourmalet-decor-640.webp 640w, {0}d/le-tourmalet-decor-1200.webp 1200w".format(IMG)),
                     etiq=etiquette("À la une du carnet"), borne=borne("2 115 m", "col"), coords=dms(42.909, 0.145),
                     histoire=e(LIEU_TEXTE["le-tourmalet"]), avis=e(av["texte"]), auteur=e(av["auteur"]), date=date_fr(av["date"]),
                     etoiles=etoiles(5), mention=MENTION_AVIS)


def trajet_fabrication(id_section="fabrication"):
    m = PRODUITS["le-chateau-de-mauvezin"]
    isard = PRODUITS["lisard"]
    etapes = [
        ("Dessin", "Illustrations originales", "Les dessins sont signés Maude Villatte et Lola Jacquet. Ici, celui de L’Isard.",
         '<div class="etape__plaque">' + img_plaque(isard, "gris", "(max-width: 520px) 70px, 110px",
                                                     alt="Plaque L’Isard, finition grise : le dessin de l’isard découpé dans le métal") + "</div>", ""),
        ("Découpe laser", "Revel (31)", "Le laser découpe la feuille d’aluminium de 2 mm, jusqu’aux lettres pochoir du titre.",
         '<div class="etape__plaque">' + img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut") + "</div>",
         '<p class="etape__legende">Illustration : aluminium non laqué. Photo de l’étape à Revel {}</p>'.format(A_FOURNIR)),
        ("Thermolaquage", "Bagnères-de-Bigorre (65)", "Une peinture en poudre cuite au four : noir, gris ou doré, en finition mate ou satinée. {}".format(
            note("mate ou satinée selon la teinte : à confirmer", "confirmer")),
         '<div class="etape__plaque">' + img_plaque(m, "dore", "(max-width: 520px) 70px, 110px") + "</div>", ""),
        ("Contrôle et expédition", "Bagnères-de-Bigorre (65)", "Assemblage, contrôle qualité, emballage et envoi. Le kit LED éventuel est collé au dos à cette étape.",
         img("led/led-img2.webp", "Ruban LED collé au dos d’une plaque"), ""),
    ]
    lis = []
    for titre, lieu, texte, visuel, legende in etapes:
        lis.append('<li class="etape"><div class="etape__visuel">{}</div><p class="etape__lieu">{}</p><h3>{}</h3><p class="etape__texte">{}</p>{}</li>'
                   .format(visuel, lieu, titre, texte, legende))
    return """<section class="section trajet" id="{id}" aria-labelledby="titre-trajet">
  <div class="cadre">
    <div class="entete-section entete-section--large">
      {etiq}
      <h2 id="titre-trajet">De Revel à votre mur</h2>
      <p class="chapo">Une plaque est découpée à Revel (31), puis thermolaquée, assemblée, contrôlée et expédiée à Bagnères-de-Bigorre (65). Toutes nos plaques sont réalisées dans un rayon de 150 km. {conf}</p>
    </div>
    <div class="trajet__route" aria-hidden="true">
      <svg viewBox="0 0 1000 40" preserveAspectRatio="none" focusable="false"><path class="trajet__base" d="M10,20 C200,4 300,36 500,20 S800,6 990,20"/><path class="trajet__progres" d="M10,20 C200,4 300,36 500,20 S800,6 990,20" pathLength="1"/></svg>
    </div>
    <ol class="trajet__etapes">{lis}</ol>
    <p class="trajet__note">L’atelier Terre Gravée a son adresse à Gerde, à côté de Bagnères-de-Bigorre. Visite de l’atelier sur rendez-vous {valider}</p>
  </div>
</section>""".format(id=id_section, etiq=etiquette("Traçabilité"),
                     conf=note("à confirmer : Revel est à environ {} km de Gerde à vol d’oiseau".format(KM_REVEL), "confirmer"),
                     lis="".join(lis), valider=A_VALIDER)


def occasions():
    def mini(slug, fin):
        p = PRODUITS[slug]
        return '<a class="occasion__plaque" href="produit-{}.html">{}<span>{}</span></a>'.format(
            slug, img_plaque(p, fin, "(max-width: 700px) 24vw, 96px"), e(p["nom"]))

    def cit(slug, idx=0):
        p = PRODUITS[slug]
        a = p["avis"][idx]
        return ('<figure class="occasion__avis"><blockquote><p>« {} »</p></blockquote><figcaption>{}, avis publié sur {}</figcaption></figure>'
                .format(e(a["texte"]), e(a["auteur"]), e(p["nom"])))

    def info(texte):
        return '<p class="occasion__note">{}</p>'.format(texte)
    # Un avis n’est cité que s’il parle de l’occasion ; sinon, un fait vérifié.
    cartes = [
        ("occasion--une", "Un souvenir de cure", "Pour qui a passé trois semaines à Bagnères-de-Bigorre et veut en garder une trace au mur.",
         mini("la-tour-des-jacobins", "dore") + mini("la-marmotte", "gris"), cit("la-marmotte")),
        ("", "Pour un cycliste", "Le Tourmalet, pour celui qui l’a monté. Ou pour celle qui s’y prépare.",
         mini("le-tourmalet", "gris"), cit("le-tourmalet")),
        ("", "Pour qui vit en Bigorre", "Le château, la tour ou l’abbaye du coin : pour une crémaillère, ou pour soi.",
         mini("le-chateau-de-mauvezin", "noir"), cit("le-chateau-de-mauvezin")),
        ("", "Pour une randonneuse ou un randonneur", "Le cirque au bout du sentier, l’isard croisé en chemin.",
         mini("le-cirque-de-gavarnie", "dore") + mini("lisard", "noir"), info("Le cirque de Gavarnie est inscrit au patrimoine mondial de l’UNESCO.")),
        ("", "Un départ loin des Pyrénées", "Un collègue est muté, une fille part étudier ailleurs : le Pic du Midi les suit.",
         mini("le-pic-du-midi", "noir"), info("Livrée avec deux fixations adhésives 3M Command™ : rien à percer chez la personne qui la reçoit.")),
    ]
    lis = []
    for cls, titre, texte, plaques, bas in cartes:
        lis.append('<li class="occasion {}"><h3>{}</h3><p>{}</p><div class="occasion__plaques">{}</div>{}</li>'.format(cls, titre, texte, plaques, bas))
    lis.append("""<li class="occasion occasion--cadeau">{img}<h3>Vous hésitez sur le modèle ?</h3>
<p>La carte cadeau vaut une plaque au choix, sur tous les modèles disponibles. Elle part tout de suite par e-mail, ou vous l’imprimez.</p>
<p class="occasion__action"><a class="bouton" href="produit-carte-cadeau.html">Offrir la carte cadeau, 65 €</a></p></li>""".format(img=img("misc/carte-cadeau.webp", "", cls="occasion__carte")))
    return """<section class="section section--teinte occasions" aria-labelledby="titre-offrir">
  <div class="cadre">
    <div class="entete-section">
      {etiq}
      <h2 id="titre-offrir">À offrir à…</h2>
      <p class="chapo">Des idées d’occasions, et ce qu’en disent les avis publiés. Sur chaque fiche, vous pouvez joindre un message {valider}</p>
    </div>
    <ul class="occasions__grille" tabindex="0" aria-label="Idées d’occasions, à faire défiler">{lis}</ul>
    {mention}
  </div>
</section>""".format(etiq=etiquette("Idées cadeaux"), lis="".join(lis), valider=A_VALIDER, mention=MENTION_AVIS)


# Les titres lus sur la photo d’Aquensis (panneaux du décor d’origine devenus des plaques)
SUR_LA_PHOTO = ["le-cerf", "lisard", "le-tourmalet", "le-pont-despagne", "le-chateau-de-mauvezin", "le-cirque-de-gavarnie"]


def origine():
    """Entrée du carnet « Là où tout a commencé : Aquensis » : l’histoire d’origine, avec le marqueur d’accord."""
    a1 = dict(PRODUITS["lours"]["avis"][0], produit="lours")
    a2 = dict(PRODUITS["la-marmotte"]["avis"][0], produit="la-marmotte")
    vus = ", ".join('<a href="produit-{}.html">{}</a>'.format(s, e(PRODUITS[s]["nom"])) for s in SUR_LA_PHOTO)
    return """<section class="section origine" id="origine" aria-labelledby="titre-origine">
  <div class="cadre">
    <div class="origine__grille">
      <figure class="origine__photo">
        {img}
        <figcaption>Photo réelle · Aquensis, Bagnères-de-Bigorre : le décor d’origine, rétroéclairé, au-dessus des bassins.</figcaption>
      </figure>
      <div class="origine__texte">
        {etiq}
        <h2 id="titre-origine">Là où tout a commencé : Aquensis</h2>
        <p class="origine__marqueur">{semetherm}</p>
        <div class="lecture">
          <p>Avant les plaques, il y a eu un décor. À Aquensis, le centre thermal de Bagnères-de-Bigorre, il fallait masquer une coursive technique. Le projet conçu pour Aquensis : 30 niches de 1 m × 2 m, fermées par des panneaux de métal découpé, en jeux de vides et de pleins.</p>
          <p>Le thème : le patrimoine, la flore et la faune de Bagnères et de la Bigorre. Maude Villatte et Lola Jacquet ont dessiné 60 illustrations. Chacune a été adaptée à la découpe : taille des ouvertures, rigidité, accroche.</p>
          <p>Les panneaux sont en aluminium thermolaqué effet Corten, couleur rouille. Ils sont découpés au laser et rétroéclairés. Les visiteurs les ont accueillis avec enthousiasme. L’idée est venue de là : proposer ces dessins aux particuliers, en plaques de 60 × 30 cm.</p>
        </div>
      </div>
    </div>
    <div class="origine__bas">
      <dl class="cartel cartel--origine">
        <div><dt>Lieu</dt><dd>Aquensis, centre thermal de Bagnères-de-Bigorre</dd></div>
        <div><dt>Projet</dt><dd>Masquer une coursive technique : 30 niches de 1 m × 2 m</dd></div>
        <div><dt>Thème</dt><dd>Patrimoine, flore et faune de la Bigorre</dd></div>
        <div><dt>Dessins</dt><dd>60 illustrations de Maude Villatte et Lola Jacquet</dd></div>
        <div><dt>Matière</dt><dd>Aluminium thermolaqué effet Corten, découpe laser, rétroéclairage</dd></div>
      </dl>
      <div class="origine__photo-lue">
        <h3>Sur la photo</h3>
        <p>On lit les titres de panneaux devenus des plaques : {vus} {confirmer}. La Transhumance y figure aussi : elle est en préparation pour la collection {prep}</p>
        <p class="origine__liens"><a class="lien-fleche" href="carte.html#aquensis">Aquensis sur la carte</a><a class="lien-fleche" href="collection.html">Les douze plaques</a></p>
      </div>
      <div class="origine__avis">
        <h3>Vues à Bagnères</h3>
        <ul class="avis-liste avis-liste--colonne">{a1}{a2}</ul>
        {mention}
      </div>
    </div>
  </div>
</section>""".format(img=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre ; au-dessus, une rangée de panneaux en métal découpé, rétroéclairés : le décor d’origine", "(max-width: 900px) 100vw, 780px"),
                     etiq=etiquette("Entrée du carnet · L’origine"), semetherm=A_SEMETHERM, vus=vus, prep=A_PREPARATION, confirmer=A_CONFIRMER,
                     a1=avis_item(a1), a2=avis_item(a2), mention=MENTION_AVIS)


def registre_avis():
    tries = sorted(TOUS_AVIS, key=lambda a: a["date"], reverse=True)
    lignes = []
    for i, a in enumerate(tries):
        p = PRODUITS[a["produit"]]
        lignes.append("""<tr{plus}>
  <td data-label="Date"><time datetime="{iso}">{date}</time></td>
  <td data-label="Plaque"><a href="produit-{slug}.html">{nom}</a></td>
  <td data-label="Note">{etoiles}<span class="visuellement-cache">{n} sur 5</span></td>
  <td data-label="Avis" class="registre__texte">« {texte} »</td>
  <td data-label="Auteur">{auteur}</td>
</tr>""".format(plus=' class="registre__plus"' if i >= 3 else "", iso=a["date"], date=date_fr(a["date"]), slug=p["slug"], nom=e(p["nom"]), etoiles=etoiles(a["note"]), n=a["note"],
                texte=e(a["texte"]), auteur=e(a["auteur"])))
    return """<section class="section registre" id="avis" aria-labelledby="titre-registre">
  <div class="cadre">
    <div class="registre__entete">
      <div class="entete-section">
        {etiq}
        <h2 id="titre-registre">Registre des avis</h2>
        <p class="chapo">Les {nb} avis publiés sur le site, du plus récent au plus ancien, sans tri ni sélection.</p>
      </div>
      <div class="registre__resume">
        <p class="registre__note"><strong>{moy}</strong><span>/ 5</span></p>
        <p>{etoiles}</p>
        <p>{nb} avis : {n5} à 5 étoiles, {n4} à 4 étoiles</p>
      </div>
    </div>
    <div class="registre__table">
      <table>
        <caption class="visuellement-cache">Avis publiés sur le site, classés par date</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Plaque</th><th scope="col">Note</th><th scope="col">Avis</th><th scope="col">Auteur</th></tr></thead>
        <tbody>{lignes}</tbody>
      </table>
    </div>
    <p class="registre__suite"><button type="button" class="bouton bouton--trait" data-registre-voir aria-expanded="true" hidden>Voir les {nb} avis</button></p>
    {mention}
  </div>
</section>""".format(etiq=etiquette("Avis"), nb=len(TOUS_AVIS), moy=note_fr(NOTE_MOYENNE), etoiles=etoiles(NOTE_MOYENNE),
                     n5=NB_5, n4=NB_4, lignes="".join(lignes), mention=MENTION_AVIS)


def lettre(id_section="lettre"):
    return """<section class="section lettre" id="{id}" aria-labelledby="titre-lettre">
  <div class="cadre lettre__grille">
    <div class="lettre__planche">
      <figure>
        <div class="lettre__image">
          {img}
          <div class="lettre__voile" aria-hidden="true"><span>Dessins inédits</span></div>
        </div>
        <figcaption>Dessins inédits de l’atelier, pas encore dans la collection. <a href="sur-mesure.html#exclusives">Voir la planche entière</a></figcaption>
      </figure>
    </div>
    <div class="lettre__texte">
      {etiq}
      <h2 id="titre-lettre">La lettre « planche inédite »</h2>
      <p class="chapo">Certaines plaques sortent en très petite quantité, parfois en exemplaire unique. La lettre vous prévient de chaque sortie et vous montre les dessins en cours.</p>
      <ul class="liste-carnet">
        <li>Les dessins inédits, à chaque sortie</li>
        <li>Votre vote pour le prochain lieu gravé {valider}</li>
        <li>Une lettre par mois au plus {valider}</li>
        <li>Aucune remise promise, aucun code promo</li>
      </ul>
      <div class="bientot">
        <p class="bientot__titre">Bientôt dans le carnet {prep}</p>
        <ul class="bientot__liste">{bientot}</ul>
        <p class="bientot__note">Et des grands formats du Cirque de Gavarnie, du Tourmalet, du Pont d’Espagne et du Pic du Midi. <a href="sur-mesure.html#grands-formats">Voir le sur-mesure</a></p>
      </div>
      <form class="formulaire formulaire--lettre" data-demo novalidate>
        <div class="champ">
          <label for="email-lettre">Votre adresse e-mail</label>
          <input id="email-lettre" name="email" type="email" autocomplete="email" required inputmode="email">
        </div>
        <div class="case">
          <input id="accord-lettre" name="accord-lettre" type="checkbox" required>
          <label for="accord-lettre">J’accepte de recevoir la lettre de Terre Gravée par e-mail. Je peux me désinscrire à chaque envoi.</label>
        </div>
        <div class="case">
          <input id="accord-mesure" name="accord-mesure" type="checkbox">
          <label for="accord-mesure">Facultatif : j’accepte que l’ouverture des lettres soit mesurée (pixel de suivi).</label>
        </div>
        <button class="bouton bouton--plein" type="submit">M’inscrire</button>
        <p class="formulaire__aide">Un e-mail de confirmation vous sera envoyé avant toute inscription (double confirmation) {valider} Adresse utilisée uniquement pour cette lettre.</p>
        <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
      </form>
    </div>
  </div>
</section>""".format(id=id_section, img=img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits, voilée ici sauf trois : la Vierge du Bédat, la cabane du Theillet et le casque du Lhéris"),
                     etiq=etiquette("Lettre d’information"), valider=A_VALIDER, prep=A_PREPARATION,
                     bientot="".join('<li><a href="carte.html#{}">{}{}</a></li>'.format(s, symbole("bientot", forme=f), n) for s, f, n in (
                         ("le-casque-du-lheris", "sommets", "Le Casque du Lhéris"), ("la-transhumance", "sites", "La Transhumance"),
                         ("le-jardin-massey", "patrimoine", "Le Jardin Massey, à Tarbes"))))


ORGANISATION = {
    "@context": "https://schema.org", "@type": "Organization", "name": "Terre Gravée", "url": SITE,
    "email": "contact@terregravee.fr", "slogan": "Graver l’âme des territoires",
    "address": {"@type": "PostalAddress", "streetAddress": "16 rue du Pic du Midi", "postalCode": "65200",
                "addressLocality": "Gerde", "addressCountry": "FR"},
}


def accueil():
    contenu = heros() + legende_accueil() + table_des_lieux() + a_la_une() + trajet_fabrication() + occasions() + origine() + registre_avis() + lettre()
    page("index.html", "Terre Gravée · Carnet de territoire, plaques murales des Hautes-Pyrénées",
         "Douze plaques murales en aluminium découpé au laser, une par lieu ou animal des Hautes-Pyrénées. Carte des lieux, fabrication à Revel et Bagnères-de-Bigorre, 65 € la plaque.",
         contenu, jsonld=ORGANISATION, scripts=("donnees-carte.js",), classe="page-accueil")


# ---------------------------------------------------------------------------
# Carte (page signature)
# ---------------------------------------------------------------------------

def pied_panneau(slug, phrase="TTC, en noir, gris ou doré"):
    return """<div class="panneau__pied">
      <p class="panneau__prix"><strong>65 €</strong> {phrase}</p>
      <div class="panneau__actions">
        <a class="bouton bouton--plein" href="produit-{slug}.html">Voir la plaque</a>
        <button type="button" class="bouton bouton--trait" data-partager="{slug}" aria-label="Copier le lien du lieu : {nom}">Copier le lien</button>
      </div>
    </div>""".format(slug=slug, phrase=phrase, nom=e(PRODUITS[slug]["nom"]))


def panneau_lieu(slug):
    p = PRODUITS[slug]
    la, lo, cat, _ = LIEUX[slug]
    lieu, detail = p["cartel"]
    f0 = fin_defaut(p)
    avis = "".join(avis_item(dict(a, produit=slug), avec_produit=False, cls="avis avis--compact") for a in p["avis"])
    bloc_avis = ('<ul class="avis-liste">{}</ul>{}'.format(avis, MENTION_AVIS) if avis
                 else '<p class="panneau__sans-avis">Pas encore d’avis sur ce modèle.</p>')
    return """<article class="panneau__fiche" data-fiche-lieu="{slug}" hidden aria-labelledby="titre-{slug}">
  <div class="panneau__tete">
    <div class="panneau__visuel">{photo}</div>
    <div class="panneau__titre">
      <p class="panneau__cat">{sym}{catnom}</p>
      <h2 id="titre-{slug}" tabindex="-1">{nom}</h2>
    </div>
  </div>
  <div class="panneau__corps">
    <dl class="cartel">
      <div><dt>Lieu</dt><dd>{lieu}</dd></div>
      <div><dt>{dlab}</dt><dd>{detail}</dd></div>
      <div><dt>Position</dt><dd>{coords} <span class="cartel__note">indicative</span></dd></div>
    </dl>
    <p class="panneau__extrait">{extrait}</p>
    {avis}
  </div>
  {pied}
</article>""".format(slug=slug, photo=img_plaque(p, f0, "(max-width: 960px) 84px, 96px", extra='data-vt="vt-{}"'.format(slug)),
                     sym=symbole(cat), catnom=CATS[cat][0], nom=e(p["nom"]), lieu=e(lieu),
                     dlab="Altitude" if detail.endswith(" m") else "Repère", detail=e(detail), coords=dms(la, lo),
                     extrait=e(LIEU_TEXTE[slug]), avis=bloc_avis, pied=pied_panneau(slug))


def panneau_faune():
    lis = []
    for s in FAUNE:
        p = PRODUITS[s]
        f0 = fin_defaut(p)
        lis.append('<li><a href="produit-{}.html">{}<span class="faune__nom">{}</span><i>{}</i></a></li>'.format(
            s, img_plaque(p, f0, "44px"), e(p["nom"]), e(p["cartel"][1])))
    av = "".join(avis_item(dict(a, produit=s), avec_produit=True, cls="avis avis--compact") for s in FAUNE for a in PRODUITS[s]["avis"][:1])
    return """<article class="panneau__fiche" data-fiche-lieu="faune" hidden aria-labelledby="titre-faune">
  <div class="panneau__corps">
    <p class="panneau__cat">{sym}Faune des Pyrénées</p>
    <h2 id="titre-faune" tabindex="-1">Quatre animaux, sans adresse</h2>
    <p class="panneau__extrait">L’isard, l’ours, le cerf et la marmotte vivent dans le massif. La carte ne leur donne pas de point précis : la zone hachurée situe le Parc national des Pyrénées de façon schématique, comme simple repère géographique.</p>
    <ul class="faune">{lis}</ul>
    <ul class="avis-liste">{av}</ul>
    {mention}
  </div>
  <div class="panneau__pied"><p class="panneau__prix"><strong>65 €</strong> TTC la plaque, en noir, gris ou doré</p>
    <div class="panneau__actions"><a class="bouton bouton--plein" href="collection.html#faune">Voir les quatre plaques</a></div></div>
</article>""".format(sym=symbole("faune"), lis="".join(lis), av=av, mention=MENTION_AVIS)


def dessin_planche(pos, alt, cls=""):
    """Un vrai dessin, découpé dans la planche des dessins inédits (misc/autres-plaques.webp) : pas une photo de plaque."""
    x, y = pos
    l, t, w = 100.0 * x / 200, 100.0 * y / 398, 100.0 * TAILLES["misc/autres-plaques.webp"][0] / 200
    return '<div class="dessin {}" style="--l:{:.2f}%;--t:{:.2f}%;--w:{:.1f}%">{}</div>'.format(
        cls, l, t, w, img("misc/autres-plaques.webp", alt))


def dessin_a_venir(cls=""):
    return '<div class="dessin dessin--vide {}"><span>Dessin à venir</span></div>'.format(cls)


def detail_membre(s):
    if s in PRODUITS:
        return " · ".join(PRODUITS[s]["cartel"])
    if s == "aquensis":
        return "Le décor d’origine (panneaux de 1 m × 2 m) · Où voir les plaques en vrai"
    return "Bientôt · " + BIENTOT[s]["lieu"]


def panneau_aquensis():
    return """<article class="panneau__fiche" data-fiche-lieu="aquensis" hidden aria-labelledby="titre-aquensis-carte">
  <div class="panneau__photo">{photo}</div>
  <div class="panneau__corps">
    <p class="panneau__cat">{sym}Où voir les plaques en vrai</p>
    <h2 id="titre-aquensis-carte" tabindex="-1">Aquensis, là où tout a commencé</h2>
    <p class="panneau__marqueur">{semetherm}</p>
    <dl class="cartel">
      <div><dt>Lieu</dt><dd>Aquensis, centre thermal de Bagnères-de-Bigorre</dd></div>
      <div><dt>À voir</dt><dd>Le décor d’origine : 30 niches de 1 m × 2 m en métal découpé, rétroéclairées</dd></div>
      <div><dt>Position</dt><dd>{coords} <span class="cartel__note">indicative</span></dd></div>
    </dl>
    <p class="panneau__extrait">Avant les plaques, il y a eu ce décor, conçu pour Aquensis. L’accueil des visiteurs a été enthousiaste : l’idée des plaques pour la maison est venue de là. Le décor se voit depuis les bassins, aux conditions d’entrée du centre.</p>
  </div>
  <div class="panneau__pied">
    <p class="panneau__prix">Le même principe, en plaque de 60 × 30 cm : <strong>65 €</strong></p>
    <div class="panneau__actions">
      <a class="bouton bouton--plein" href="index.html#origine">Lire l’histoire</a>
      <button type="button" class="bouton bouton--trait" data-partager="aquensis" aria-label="Copier le lien du lieu : Aquensis">Copier le lien</button>
    </div>
  </div>
</article>""".format(photo=img("misc/aquensis.webp", "Le bassin d’Aquensis, à Bagnères-de-Bigorre, et les panneaux découpés et rétroéclairés du décor d’origine", "(max-width: 960px) 100vw, 400px"),
                     sym=symbole("vrai"), coords=dms(*AQUENSIS), semetherm=A_SEMETHERM)


def panneau_bientot(slug):
    """Fiche d’un modèle en préparation : vrai dessin s’il existe, sinon emplacement vide ; jamais de fausse photo."""
    if slug == "la-transhumance":
        b = dict(TRANSHUMANCE, lieu="Les estives des Pyrénées", dlab="Thème", detail="La montée des troupeaux vers les estives", forme="sites")
        pos = 'Pyrénées <span class="cartel__note">sans repère précis</span>'
    else:
        b = BIENTOT[slug]
        pos = '{} <span class="cartel__note">indicative</span>'.format(dms(*b["pos"]))
    if b["dessin"]:
        visuel = dessin_planche(b["dessin"], "Dessin « {} », extrait de la planche des dessins inédits".format(b["nom"]))
        legende_v = "Le dessin, sur la planche des dessins inédits. Pas encore de photo de la plaque."
    else:
        visuel = dessin_a_venir()
        legende_v = "Pas encore de dessin ni de photo à montrer {}".format(note("dessin à fournir"))
    return """<article class="panneau__fiche" data-fiche-lieu="{slug}" hidden aria-labelledby="titre-{slug}">
  <div class="panneau__tete">
    <div class="panneau__visuel panneau__visuel--dessin">{visuel}</div>
    <div class="panneau__titre">
      <p class="panneau__cat">{sym}Bientôt</p>
      <h2 id="titre-{slug}" tabindex="-1">{nom}</h2>
      <p>{prep}</p>
    </div>
  </div>
  <div class="panneau__corps">
    <dl class="cartel">
      <div><dt>Lieu</dt><dd>{lieu}</dd></div>
      <div><dt>{dlab}</dt><dd>{detail}</dd></div>
      <div><dt>Position</dt><dd>{pos}</dd></div>
    </dl>
    <p class="panneau__extrait">{texte}</p>
    <p class="panneau__legende-dessin">{legende_v}</p>
  </div>
  <div class="panneau__pied">
    <p class="panneau__prix">Prix et date de sortie {conf}</p>
    <div class="panneau__actions"><a class="bouton bouton--plein" href="index.html#lettre">Être prévenu de la sortie</a></div>
  </div>
</article>""".format(slug=slug, visuel=visuel, sym=symbole("bientot", forme=b["forme"]), nom=e(b["nom"]), prep=A_PREPARATION,
                     lieu=e(b["lieu"]), dlab=b["dlab"], detail=e(b["detail"]), pos=pos, texte=e(b["texte"]), legende_v=legende_v,
                     conf=A_CONFIRMER)


def panneau_grappe(cle, nom, membres, cat, dx, dy):
    lis = "".join('<li><button type="button" class="lieu" data-lieu="{s}" aria-controls="panneau">{sym}<span class="lieu__nom">{n}</span>'
                  '<span class="lieu__detail">{d}</span></button></li>'.format(
                      s=s, sym=symbole(cat_de(s), forme=BIENTOT[s]["forme"] if s in BIENTOT else None), n=e(nom_de(s)), d=e(detail_membre(s))) for s in membres)
    return """<article class="panneau__fiche" data-fiche-grappe="{cle}" hidden aria-labelledby="titre-grappe-{cle}">
  <div class="panneau__corps">
    <p class="panneau__cat">{sym}{n} lieux proches</p>
    <h2 id="titre-grappe-{cle}" tabindex="-1">{nom}</h2>
    <p class="panneau__extrait">Ces repères sont trop proches pour être touchés un à un sur cet écran. Choisissez un lieu :</p>
    <ul class="lieux lieux--choix">{lis}</ul>
  </div>
</article>""".format(cle=cle, sym=symbole(cat), n=len(membres), nom=e(nom), lis=lis)


def liste_lieux():
    ordre = sorted(LIEUX, key=lambda s: -LIEUX[s][0])
    lis = []
    for s in ordre:
        p = PRODUITS[s]
        la, lo, cat, _ = LIEUX[s]
        lieu, detail = p["cartel"]
        lis.append('<li data-cat="{cat}"><button type="button" class="lieu" data-lieu="{s}" aria-controls="panneau">{sym}'
                   '<span class="lieu__nom">{nom}</span><span class="lieu__detail">{lieu} · {detail}</span>'
                   '<span class="lieu__coord">{coord}</span></button></li>'.format(
                       cat=cat, s=s, sym=symbole(cat), nom=e(p["nom"]), lieu=e(lieu), detail=e(detail), coord=dms(la, lo)))
    for s in FAUNE:
        p = PRODUITS[s]
        lis.append('<li data-cat="faune"><button type="button" class="lieu" data-lieu="faune" aria-controls="panneau">{sym}'
                   '<span class="lieu__nom">{nom}</span><span class="lieu__detail"><i>{lat}</i> · Faune des Pyrénées</span>'
                   '<span class="lieu__coord">sans repère précis</span></button></li>'.format(
                       sym=symbole("faune"), nom=e(p["nom"]), lat=e(p["cartel"][1])))
    lis.append('<li data-cat="vrai"><button type="button" class="lieu" data-lieu="aquensis" aria-controls="panneau">{sym}'
               '<span class="lieu__nom">Aquensis, le décor d’origine</span><span class="lieu__detail">Où voir les plaques en vrai · panneaux de 1 m × 2 m, à Bagnères-de-Bigorre</span>'
               '<span class="lieu__coord">{coord}</span></button></li>'.format(sym=symbole("vrai"), coord=dms(*AQUENSIS)))
    for s in list(BIENTOT) + ["la-transhumance"]:
        b = BIENTOT.get(s, TRANSHUMANCE)
        forme = b.get("forme", "sites")
        lieu = b.get("lieu", "Estives des Pyrénées")
        coord = dms(*b["pos"]) if "pos" in b else "sans repère précis"
        lis.append('<li data-cat="bientot"><button type="button" class="lieu" data-lieu="{s}" aria-controls="panneau">{sym}'
                   '<span class="lieu__nom">{nom}</span><span class="lieu__detail">Bientôt, en préparation · {lieu}</span>'
                   '<span class="lieu__coord">{coord}</span></button></li>'.format(s=s, sym=symbole("bientot", forme=forme), nom=e(b["nom"]),
                                                                                lieu=e(lieu), coord=coord))
    return "".join(lis)


def carte_page():
    filtres = ['<button type="button" class="puce" data-filtre-carte="tout" aria-pressed="true">Tout <span>{}</span></button>'.format(
        len(LIEUX) + len(FAUNE) + 1 + len(BIENTOT) + 1)]
    for cat in ORDRE_CATS + ("vrai", "bientot"):
        n = {"faune": len(FAUNE), "vrai": 1, "bientot": len(BIENTOT) + 1}.get(cat) or sum(1 for s in LIEUX if LIEUX[s][2] == cat)
        nom = "Bientôt" if cat == "bientot" else CATS[cat][0]
        filtres.append('<button type="button" class="puce" data-filtre-carte="{}" aria-pressed="false">{}{} <span>{}</span></button>'.format(
            cat, symbole(cat), nom, n))
    panneaux = ("".join(panneau_lieu(s) for s in sorted(LIEUX, key=lambda s: -LIEUX[s][0])) + panneau_faune() + panneau_aquensis() +
                "".join(panneau_bientot(s) for s in list(BIENTOT) + ["la-transhumance"]) +
                "".join(panneau_grappe(*g) for g in GRAPPES))
    contenu = """
<div class="cadre carte-page">
  <header class="carte-page__entete">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">La carte</li></ol></nav>
    <h1>La carte des plaques</h1>
    <p class="chapo">Chaque repère plein est un lieu gravé : ouvrez-le pour voir la plaque, son cartel et les avis qui en parlent. L’étoile montre où voir les plaques en vrai : à Aquensis, le décor d’origine, en panneaux de 1 m × 2 m. Les repères en pointillé sont les modèles en préparation. Chaque lieu a sa propre adresse : vous pouvez l’envoyer à quelqu’un.</p>
  </header>
  <div class="carte-page__outils">
    <div class="puces" role="group" aria-label="Afficher les lieux">{filtres}</div>
    <div class="calques" role="group" aria-label="Calques de la carte">
      <label class="interrupteur"><input type="checkbox" data-calque="trajet" checked><span>Trajet de fabrication</span></label>
      <label class="interrupteur"><input type="checkbox" data-calque="relief" checked><span>Relief</span></label>
      <label class="interrupteur"><input type="checkbox" data-calque="villes" checked><span>Villes</span></label>
    </div>
  </div>
  <div class="carte-page__grille">
    <figure class="atlas atlas--grande" data-carte>
      {plan}
      <figcaption class="carte__legende">
        {legende}
        <p><strong>Positions indicatives, à un ou deux kilomètres près.</strong> Aquensis et le Jardin Massey sont légèrement écartés de leur position, un trait les y relie. Les animaux et la transhumance n’ont pas de repère : la zone hachurée situe le Parc national des Pyrénées de façon schématique, comme repère géographique. Rivières tracées de façon schématique. Contour du département simplifié d’après les données IGN (Licence Ouverte 2.0). Relief décoratif, sans valeur topographique.</p>
      </figcaption>
    </figure>
    <aside class="panneau" id="panneau" aria-label="Fiche du lieu choisi" data-panneau>
      <div class="panneau__barre"><span class="panneau__poignee" aria-hidden="true"></span><button type="button" class="panneau__fermer" data-fermer-panneau>Fermer</button></div>
      <div class="panneau__accueil" data-panneau-accueil>
        <p class="etiquette">{balise}Mode d’emploi</p>
        <h2>Choisissez un repère</h2>
        <p>Cliquez sur un symbole de la carte, ou parcourez la liste des lieux sous la carte. Au clavier : Tab pour passer d’un repère à l’autre, Entrée pour l’ouvrir, Échap pour refermer.</p>
        <p><button type="button" class="bouton bouton--trait" data-commencer>Commencer par le nord</button></p>
        <div class="panneau__fabrication">
          <h3>Le trajet d’une plaque</h3>
          <ol class="mini-trajet">
            <li><strong>Revel (31)</strong> découpe laser</li>
            <li><strong>Bagnères-de-Bigorre (65)</strong> thermolaquage, assemblage, contrôle, expédition</li>
          </ol>
          <p class="panneau__atelier"><span class="leg-atelier" aria-hidden="true"></span>L’atelier Terre Gravée a son adresse à Gerde (65), à côté de Bagnères-de-Bigorre.</p>
          <p><a class="lien-fleche" href="index.html#fabrication">Le détail de la fabrication</a></p>
        </div>
      </div>
      {panneaux}
      <div class="panneau__nav" data-panneau-nav hidden>
        <button type="button" class="lien-bouton" data-lieu-voisin="-1">Lieu précédent</button>
        <button type="button" class="lien-bouton" data-lieu-voisin="1">Lieu suivant</button>
      </div>
    </aside>
  </div>
  <section class="lieux-liste" aria-labelledby="titre-liste">
    <h2 id="titre-liste">Les lieux, du nord au sud</h2>
    <p class="chapo">La même information que la carte, en liste. Les coordonnées sont indicatives.</p>
    <ol class="lieux" data-liste-lieux>{lieux}</ol>
  </section>
  <section class="partage" aria-labelledby="titre-partage">
    <div>
      <h2 id="titre-partage">Un lieu, une adresse</h2>
      <p>Chaque repère a son lien direct, par exemple <code>carte.html#le-tourmalet</code>. Envoyez-le à un cycliste, glissez-le dans un message de vacances : la carte s’ouvre sur le bon lieu.</p>
    </div>
    <p class="partage__pro">Office de tourisme, gîte, boutique d’un grand site : vous voulez montrer la carte à vos visiteurs ? <a href="sur-mesure.html#series">Écrivez à l’atelier</a> {valider}</p>
  </section>
</div>""".format(filtres="".join(filtres), plan=carte_plan("grande"), legende=legende(), balise=BALISE,
                 panneaux=panneaux, lieux=liste_lieux(), valider=A_VALIDER)
    page("carte.html", "La carte des plaques · Terre Gravée",
         "Carte interactive des Hautes-Pyrénées : les huit lieux gravés par Terre Gravée, la faune des Pyrénées, le décor d’origine à Aquensis, les modèles en préparation et le trajet de fabrication.",
         contenu, actif="carte.html", scripts=("donnees-carte.js", "carte.js"), classe="page-carte")


# ---------------------------------------------------------------------------
# Collection
# ---------------------------------------------------------------------------

def collection():
    puces = ['<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Toutes <span>{}</span></button>'.format(len(PLAQUES))]
    for c in ORDRE_CATS:
        n = sum(1 for p in PLAQUES if cat_de(p["slug"]) == c)
        puces.append('<button type="button" class="puce" data-filtre="{}" aria-pressed="false">{}{} <span>{}</span></button>'.format(
            c, symbole(c), CATS[c][0], n))
    voir = "".join('<button type="button" class="puce puce--fin" data-voir-en="{}" aria-pressed="false"><span class="pastille pastille--{}" aria-hidden="true"></span>{}</button>'.format(f, f, n)
                   for f, n, _ in FINITIONS)
    ordre = sorted(PLAQUES, key=lambda p: ORDRE_CATS.index(cat_de(p["slug"])))
    cartes = [carte_produit(p, titre_niveau="h2", eager=("haute" if i == 0 else ("normal" if i < 4 else False)), rang=i)
              for i, p in enumerate(ordre)]
    accessoires = [PRODUITS["led"], PRODUITS["carte-cadeau"]]
    acc = "".join(carte_produit(p, sizes="(max-width: 600px) 40vw, 200px", titre_niveau="h3") for p in accessoires)
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Les plaques</li></ol></nav>
    {etiq}
    <h1>Les douze plaques</h1>
    <p class="chapo">Plaques de 60 × 30 cm en aluminium de 2 mm, découpé au laser puis thermolaqué. Chaque modèle existe en noir, gris et doré, au même prix : 65 € TTC.</p>
  </header>
  <div class="filtres">
    <div class="puces" role="group" aria-label="Filtrer par catégorie">{puces}</div>
    <div class="filtres__droite">
      <div class="puces" role="group" aria-label="Afficher toutes les plaques en">{voir}</div>
      <div class="champ champ--ligne"><label for="tri">Classer</label><select id="tri" name="tri" data-tri><option value="theme">Par catégorie</option><option value="nord-sud">Du nord au sud</option><option value="nom">Par nom</option></select></div>
    </div>
  </div>
  <p class="compte" data-compte aria-live="polite">{n} plaques</p>
  <ul class="grille" data-grille>{cartes}</ul>
  {mention}
  <section class="completer" aria-labelledby="titre-completer">
    <div class="completer__texte">
      <p class="etiquette">{balise}Pour compléter</p>
      <h2 id="titre-completer">Le kit LED et la carte cadeau</h2>
      <p>Le kit se colle au dos de la plaque, l’atelier le monte avant l’envoi. La carte cadeau vaut une plaque au choix.</p>
    </div>
    <ul class="completer__grille">{acc}</ul>
  </section>
</div>
<section class="section section--teinte">
  <div class="cadre bandeau-infos">
    <div><h2>Livraison</h2><p>Expédiée depuis Bagnères-de-Bigorre, en 2 à 4 jours ouvrés (indicatif). Frais selon le poids et la destination, affichés avant validation {fournir}</p></div>
    <div><h2>Rétractation</h2><p>{retract}</p></div>
    <div><h2>Paiement</h2><p>{paiement}</p></div>
  </div>
</section>""".format(etiq=etiquette("Inventaire"), puces="".join(puces), voir=voir, n=len(PLAQUES), cartes="".join(cartes),
                     fournir=note("montant à fournir"), mention=MENTION_AVIS, balise=BALISE, acc=acc,
                     retract=phrase_retractation(), paiement=phrase_paiement())
    page("collection.html", "Les douze plaques · Terre Gravée",
         "Toutes les plaques Terre Gravée : trois sommets et cols, deux sites naturels, trois monuments et quatre animaux des Pyrénées, en noir, gris ou doré. 65 € TTC la plaque.",
         contenu, actif="collection.html", classe="page-collection")


# ---------------------------------------------------------------------------
# Fiches produit
# ---------------------------------------------------------------------------

def bloc_livraison():
    return """<div class="avant-commande">
  <h2 class="avant-commande__titre">Avant de commander</h2>
  <dl>
    <div><dt>Livraison</dt><dd>Expédiée depuis Bagnères-de-Bigorre, en 2 à 4 jours ouvrés, à titre indicatif ; l’atelier vous prévient en cas de retard. <span data-estimation></span> {conf}</dd></div>
    <div><dt>Frais de port</dt><dd>Selon le poids et la destination, affichés avant validation. {fournir}</dd></div>
    <div><dt>Emballage</dt><dd>Renforcé : boîte en carton façon livre, pochette en carton ondulé et plaques de calage.</dd></div>
    <div><dt>Rétractation</dt><dd>{retract} <a href="contact.html#retractation">Renoncer au contrat ici</a></dd></div>
    <div><dt>Garanties</dt><dd>Garanties légales de conformité et des vices cachés.</dd></div>
    <div><dt>Paiement</dt><dd>{paiement}</dd></div>
  </dl>
</div>""".format(conf=note("délai de préparation à confirmer", "confirmer"), fournir=note("montant à fournir"),
                 retract=phrase_retractation(), paiement=phrase_paiement())


def bloc_carte_cadeau():
    return """<div class="avant-commande">
  <h2 class="avant-commande__titre">Avant de commander</h2>
  <dl>
    <div><dt>Envoi</dt><dd>Immédiat par e-mail, ou à imprimer chez vous. Aucun frais de port.</dd></div>
    <div><dt>Utilisation</dt><dd>Une plaque au choix, sur tous les modèles disponibles. Durée de validité {fournir}</dd></div>
    <div><dt>Rétractation</dt><dd>Rétractation et conditions d’utilisation de la carte cadeau {conf}</dd></div>
    <div><dt>Paiement</dt><dd>{paiement}</dd></div>
  </dl>
</div>""".format(fournir=A_FOURNIR, conf=A_CONFIRMER, paiement=phrase_paiement())


def choix_cable(nom="sortie"):
    radios = []
    for i, (v, lib) in enumerate(SORTIES_CABLE):
        radios.append('<label class="cable__coin cable__coin--{v}"><input type="radio" name="{n}" value="{lib}"{c}><span>{lib}</span></label>'.format(
            v=v, n=nom, lib=lib, c=" checked" if v == "bas-droite" else ""))
    return """<fieldset class="cable">
  <legend>Sortie du câble</legend>
  <div class="cable__schema"><span class="cable__plaque" aria-hidden="true"><span>Dos de la plaque</span></span>{radios}</div>
</fieldset>""".format(radios="".join(radios))


def voisins(p):
    slug = p["slug"]
    if slug in FAUNE:
        return [(PRODUITS[s], None) for s in FAUNE if s != slug]
    if slug not in LIEUX:
        return []
    la, lo = LIEUX[slug][0], LIEUX[slug][1]
    autres = sorted((km((la, lo), (LIEUX[s][0], LIEUX[s][1])), s) for s in LIEUX if s != slug)
    return [(PRODUITS[s], d) for d, s in autres[:3]]


def avis_fiche(p):
    if not p["avis"]:
        return """<p class="sans-avis">Pas encore d’avis sur ce modèle. Sur l’ensemble de la boutique : {moy} / 5 sur {nb} avis. <a href="index.html#avis">Lire le registre des avis</a></p>""".format(
            moy=note_fr(NOTE_MOYENNE), nb=len(TOUS_AVIS))
    lis = []
    for a in p["avis"]:
        rep = ""
        if a["note"] < 5:
            rep = '<div class="avis__reponse"><p class="avis__reponse-titre">Réponse de l’atelier</p><p>Texte à rédiger par Romain {}</p></div>'.format(A_FOURNIR)
        item = avis_item(dict(a, produit=p["slug"]), avec_produit=False)
        lis.append(item.replace("</figcaption>\n  </figure>", "</figcaption>{}\n  </figure>".format(rep)))
    nb = len(p["avis"])
    moy = sum(a["note"] for a in p["avis"]) / nb
    return """<div class="avis-resume"><strong>{moy} / 5</strong> {etoiles} <span>{nb} avis sur ce modèle · {gmoy} / 5 sur les {gnb} avis de la boutique</span></div>
<ul class="avis-liste">{lis}</ul>""".format(moy=note_fr(moy), etoiles=etoiles(moy), nb=nb, gmoy=note_fr(NOTE_MOYENNE), gnb=len(TOUS_AVIS), lis="".join(lis))


DESCRIPTIONS_ACC = {
    "led": "Kit LED RGB autocollant pour rétroéclairer une plaque Terre Gravée : contrôleur, télécommande infrarouge, application, alimentation USB. Monté par l’atelier avant l’envoi s’il est commandé avec une plaque.",
    "carte-cadeau": "Carte cadeau valable pour une plaque au choix sur tous les modèles disponibles, envoyée par e-mail ou à imprimer.",
}


def jsonld_produit(p, image):
    d = {
        "@context": "https://schema.org", "@type": "Product", "name": p["nom"],
        "brand": {"@type": "Brand", "name": "Terre Gravée"},
        "image": image,
        "description": DESCRIPTIONS_ACC.get(p["slug"]) or couper_phrase(LIEU_TEXTE[p["slug"]] + " " + " ".join(histoire(p)), 320),
        "offers": {"@type": "Offer", "price": "{}.00".format(p["prix"]), "priceCurrency": "EUR", "url": p["url_actuelle"]},
    }
    if p["collection"] != "accessoires":
        d["material"] = "Aluminium thermolaqué"
        d["width"] = {"@type": "QuantitativeValue", "value": 30, "unitCode": "CMT"}
        d["height"] = {"@type": "QuantitativeValue", "value": 60, "unitCode": "CMT"}
    if p["avis"]:
        nb = len(p["avis"])
        d["aggregateRating"] = {"@type": "AggregateRating", "ratingValue": round(sum(a["note"] for a in p["avis"]) / nb, 1),
                                "reviewCount": nb, "bestRating": 5}
        d["review"] = [{"@type": "Review", "author": {"@type": "Person", "name": a["auteur"]}, "datePublished": a["date"],
                        "reviewBody": a["texte"], "reviewRating": {"@type": "Rating", "ratingValue": a["note"], "bestRating": 5}}
                       for a in p["avis"]]
    return d


def fiche_plaque(p):
    slug = p["slug"]
    f0 = fin_defaut(p)
    cat = cat_de(slug)
    lieu, detail = p["cartel"]
    scenes, vignettes, radios = [], [], []
    for f, nom, acc in FINITIONS:
        cache = "" if f == f0 else " hidden"
        if a_photo(slug, f):
            vt = ' style="view-transition-name:vt-{}"'.format(slug) if f == f0 else ""
            scenes.append('<div class="scene" data-scene="{}"{}>{}</div>'.format(
                f, cache, img_plaque(p, f, "(max-width: 960px) 46vw, 400px", eager=(f == f0), extra=vt.strip())))
            vignettes.append('<button type="button" class="vignette" data-vue="{f}" aria-pressed="{pr}">{im}<span>{n}</span></button>'.format(
                f=f, pr="true" if f == f0 else "false", im=img_vignette("p/{}-{}-440.webp".format(slug, f), eager="normal"), n=nom))
        else:
            scenes.append('<div class="scene" data-scene="{}"{}>{}</div>'.format(f, cache, vide_photo(p, f, "photo-a-venir--grand")))
            vignettes.append('<button type="button" class="vignette" data-vue="{f}" aria-pressed="false"><span class="vignette__vide" aria-hidden="true"></span><span>{n}</span><span class="visuellement-cache"> (photo à venir)</span></button>'.format(f=f, n=nom))
        radios.append('<label class="finition finition--{f}"><input type="radio" name="finition" value="{f}"{c}><span class="pastille pastille--{f}" aria-hidden="true"></span><span>{n}{m}</span></label>'.format(
            f=f, c=" checked" if f == f0 else "", n=nom, m="" if a_photo(slug, f) else ' <small>(photo à venir)</small>'))
    if p["decor"]:
        rel640 = p["decor"].replace("-1200", "-640")
        a_srcset = rel640 in TAILLES and rel640 != p["decor"]
        scenes.append('<div class="scene scene--situation" data-scene="situation" hidden><figure>{}<figcaption>Mise en situation</figcaption></figure></div>'.format(
            img(p["decor"], "Mise en situation : plaque " + p["nom"] + " sur un mur", "(max-width: 900px) 92vw, 640px",
                srcset="{0}{1} 640w, {0}{2} 1200w".format(IMG, rel640, p["decor"]) if a_srcset else "")))
        vignettes.append('<button type="button" class="vignette vignette--situation" data-vue="situation" aria-pressed="false">{}<span>En situation</span></button>'.format(
            img_vignette(rel640 if rel640 in TAILLES else p["decor"])))
    data_img = " ".join('data-img-{0}="{1}p/{2}-{0}-440.webp"'.format(f, IMG, slug) for f, _, _ in FINITIONS if a_photo(slug, f))
    nb = len(p["avis"])
    if nb:
        moy = sum(a["note"] for a in p["avis"]) / nb
        note_html = ('<p class="achat__note">{} <a href="#avis-modele">{} / 5 · {} avis</a><span class="achat__mention">publiés sans vérification d’achat</span></p>'
                     .format(etoiles(moy), note_fr(moy), nb))
    else:
        note_html = '<p class="achat__note achat__note--vide">Pas encore d’avis sur ce modèle</p>'
    if slug in LIEUX:
        la, lo = LIEUX[slug][0], LIEUX[slug][1]
        pos = '{} <span class="cartel__note">indicative</span>'.format(dms(la, lo))
        voir_carte = '<a class="lien-fleche" href="carte.html#{}">Voir sur la carte</a>'.format(slug)
    else:
        pos = 'Pyrénées <span class="cartel__note">sans repère précis</span>'
        voir_carte = '<a class="lien-fleche" href="carte.html#faune">La faune sur la carte</a>'
    dlab = "Nom latin" if p["collection"] == "faune" else ("Altitude" if detail.endswith(" m") else "Repère")
    ddet = "<i>{}</i>".format(e(detail)) if p["collection"] == "faune" else e(detail)
    texte_plaque = "".join("<p>{}</p>".format(e(x)) for x in histoire(p))
    lien = ""
    if p["lien"]:
        lien = '<p class="entree__source">Pour en savoir plus sur le lieu : <a href="{}">{}</a></p>'.format(e(p["lien"]["url"]), e(p["lien"]["label"]))
    offrir = "".join("<li>{}</li>".format(x) for x in OFFRIR.get(slug, []))
    if p["decor"]:
        rel640 = p["decor"].replace("-1200", "-640")
        situation = '<figure class="entree__situation">{}<figcaption>Mise en situation, {}</figcaption></figure>'.format(
            img(p["decor"], "Mise en situation : plaque " + p["nom"] + " dans un intérieur", "(max-width: 900px) 92vw, 420px"), e(p["nom"]))
    else:
        situation = '<div class="entree__situation entree__situation--vide"><p>Mise en situation de cette plaque</p>{}</div>'.format(note("photo à fournir"))
    vois = voisins(p)
    titre_vois = "Les autres animaux des Pyrénées" if slug in FAUNE else "Lieux voisins sur la carte"
    cartes_vois = []
    for q, d in vois:
        c = carte_produit(q, sizes="(max-width: 600px) 44vw, 240px")
        if d is not None:
            c = c.replace('<p class="carte__cartel">', '<p class="carte__distance">à {} km à vol d’oiseau</p><p class="carte__cartel">'.format(int(round(d))), 1)
        cartes_vois.append(c)
    cartes_vois.append(carte_produit(PRODUITS["led"], sizes="(max-width: 600px) 44vw, 240px").replace(
        '<p class="carte__cartel">', '<p class="carte__distance">À associer</p><p class="carte__cartel">', 1))
    grille_vois = grille_produits([q for q, _ in vois] + [PRODUITS["led"]], cls="grille grille--quatre", prefixe_cartes=cartes_vois)
    positions = choix_cable()
    contenu = """
<div class="cadre">
  <nav aria-label="Fil d’Ariane" class="ariane-wrap"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li><a href="collection.html">Les plaques</a></li><li><a href="collection.html#{coll_id}">{sym}{coll}</a></li><li aria-current="page">{nom}</li></ol></nav>
  <div class="fiche" data-fiche data-type="plaque" data-slug="{slug}" data-nom="{nom}" data-prix="{prix}" data-prix-led="15" {data_img}>
    <div class="galerie">
      <div class="galerie__scene">{scenes}</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues de la plaque">{vignettes}</div>
      <p class="galerie__note">Photos détourées au ras du métal : les découpes apparaissent en blanc. Les mises en situation sont des montages.</p>
    </div>
    <div class="achat">
      <p class="achat__cat">{sym}{catnom}</p>
      <h1>{nom}</h1>
      {note}
      <dl class="cartel cartel--fiche">
        <div><dt>Lieu</dt><dd>{lieu}</dd></div>
        <div><dt>{dlab}</dt><dd>{ddet}</dd></div>
        <div><dt>Position</dt><dd>{pos}</dd></div>
        <div><dt>Série</dt><dd>Limitée, numéro gravé au dos <span class="cartel__note">taille de la série {fournir_court}</span></dd></div>
      </dl>
      <p class="achat__prix"><strong data-prix-affiche>65 €</strong><span>TTC · TVA non applicable (art. 293 B du CGI)</span></p>
      <fieldset class="choix-finition">
        <legend>Finition : <output data-finition-choisie>{fin_nom}</output></legend>
        <div class="choix-finition__options">{radios}</div>
      </fieldset>
      <div class="option">
        <label class="option__case"><input type="checkbox" data-option-led><span class="option__texte"><strong>Ajouter le kit LED, monté au dos</strong><small>Ruban RGB, télécommande et alimentation USB. L’atelier le colle avant l’envoi. <a href="produit-led.html">Le kit en détail</a></small></span><span class="option__prix">+15 €</span></label>
        <div class="option__suite" data-suite-led hidden>{positions}</div>
      </div>
      <div class="option">
        <label class="option__case"><input type="checkbox" data-option-cadeau><span class="option__texte"><strong>C’est un cadeau</strong><small>Un message sur une carte, et les prix masqués sur le bon de livraison. {valider}</small></span><span class="option__prix">offert</span></label>
        <div class="option__suite" data-suite-cadeau hidden>
          <div class="champ"><label for="message-cadeau">Votre message (facultatif)</label><textarea id="message-cadeau" rows="3" maxlength="240" data-message-cadeau></textarea><small>240 caractères au plus.</small></div>
        </div>
      </div>
      <div class="achat__ligne">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une plaque">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité" data-quantite><button type="button" data-qte="1" aria-label="Ajouter une plaque">+</button></div>
        <button type="button" class="bouton bouton--plein bouton--large" data-ajouter>Ajouter à la commande</button>
      </div>
      <p class="achat__total">Total : <strong data-total-affiche>65 €</strong> TTC, hors frais de port {fournir}</p>
      {livraison}
    </div>
  </div>
</div>
<article class="entree" aria-labelledby="titre-entree">
  <div class="cadre entree__grille">
    <aside class="entree__marge" aria-label="Cartel du lieu">
      <p class="etiquette">{balise}Entrée du carnet</p>
      {borne}
      {loc}
      <p>{voir_carte}</p>
    </aside>
    <div class="entree__texte">
      <h2 id="titre-entree">{titre_h}</h2>
      <div class="lecture">
        <p class="entree__lieu">{lieu_texte}</p>
        {texte_plaque}
      </div>
      {lien}
      <p class="entree__note">Récit du lieu à écrire : 300 à 500 mots, faits vérifiables, auteur et date de publication {fournir_court}. Le texte de la plaque reprend celui du site actuel, corrigé.</p>
      <h3>Comment elle est faite</h3>
      <ul class="liste-carnet">
        <li>Dessin original de Maude Villatte et Lola Jacquet.</li>
        <li>Découpe laser à Revel (31), dans une feuille d’aluminium de 2 mm, titre en lettrage pochoir.</li>
        <li>Thermolaquage à Bagnères-de-Bigorre (65), finition mate ou satinée {mate}.</li>
        <li>Assemblage, contrôle qualité et expédition à Bagnères-de-Bigorre (65).</li>
      </ul>
      <h3>À qui l’offrir</h3>
      <ul class="liste-carnet">{offrir}<li>Vous hésitez ? <a href="produit-carte-cadeau.html">La carte cadeau</a> laisse choisir le modèle.</li></ul>
    </div>
    <div class="entree__cote">
      {situation}
      <h3 class="entree__petit-titre">Caractéristiques</h3>
      <dl class="caracteristiques">
        <div><dt>Format</dt><dd>60 × 30 cm, épaisseur 2 mm</dd></div>
        <div><dt>Matière</dt><dd>Aluminium découpé au laser, thermolaqué</dd></div>
        <div><dt>Finitions</dt><dd>Noir, gris ou doré</dd></div>
        <div><dt>Fixation</dt><dd>2 fixations adhésives 3M Command™ fournies, pose sans perçage</dd></div>
        <div><dt>Usage</dt><dd>Intérieur et extérieur {ext}</dd></div>
        <div><dt>Édition</dt><dd>Série limitée, numéro gravé au dos</dd></div>
      </dl>
    </div>
  </div>
</article>
<section class="section section--teinte" id="avis-modele" aria-labelledby="titre-avis">
  <div class="cadre">
    <div class="entete-section"><p class="etiquette">{balise}Avis</p><h2 id="titre-avis">Avis publiés sur ce modèle</h2></div>
    <div class="avis-grille">
      <div>
        {avis}
        {mention}
      </div>
      <aside class="avis-appel" aria-labelledby="titre-appel">
        <h3 id="titre-appel">Vous avez cette plaque ?</h3>
        <p>Racontez où vous l’avez posée et envoyez une photo : elle pourra illustrer cette fiche, avec votre accord {valider}</p>
        <p><button type="button" class="bouton bouton--trait" data-demo-bouton>Envoyer mon avis</button> <span class="message-demo" role="status" hidden>Maquette : rien n’est envoyé.</span></p>
        <p class="avis-appel__note">Aucune contrepartie {conf}</p>
      </aside>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="titre-voisins">
  <div class="cadre">
    <div class="entete-section entete-section--ligne"><div><p class="etiquette">{balise}{etiq_vois}</p><h2 id="titre-voisins">{titre_vois}</h2></div><a class="lien-fleche" href="carte.html">Toute la carte</a></div>
    {grille_vois}
  </div>
</section>""".format(
        coll_id=cat, coll=CATS[cat][0], nom=e(p["nom"]), slug=slug, prix=p["prix"], data_img=data_img, scenes="".join(scenes),
        vignettes="".join(vignettes), sym=symbole(cat), catnom=CATS[cat][0],
        note=note_html, lieu=e(lieu), dlab=dlab, ddet=ddet, pos=pos, fournir_court=A_FOURNIR, fin_nom=NOM_FIN[f0], radios="".join(radios),
        positions=positions, valider=A_VALIDER, fournir=note("frais de port à fournir"), livraison=bloc_livraison(), balise=BALISE,
        borne=borne_de(p), loc=localisateur(slug), voir_carte=voir_carte, titre_h=e(p["titre_histoire"]), texte_plaque=texte_plaque, lien=lien,
        lieu_texte=e(LIEU_TEXTE[slug]), mate=note("selon la teinte : à confirmer", "confirmer"), ext=note("fixation extérieure à fournir"),
        offrir=offrir, situation=situation, avis=avis_fiche(p), mention=MENTION_AVIS, conf=A_CONFIRMER,
        etiq_vois="Faune" if slug in FAUNE else "À proximité", titre_vois=titre_vois, grille_vois=grille_vois)
    image = "{}p/{}-{}-880.webp".format(IMG, slug, f0)
    desc = "Plaque murale « {} » en aluminium découpé au laser, 60 × 30 cm, noir, gris ou doré. {} · {}. 65 € TTC, série limitée numérotée.".format(
        p["nom"], lieu, detail)
    page("produit-{}.html".format(slug), "{}, plaque murale des Hautes-Pyrénées · Terre Gravée".format(p["nom"]), desc, contenu,
         actif="collection.html", jsonld=jsonld_produit(p, image), classe="page-fiche")


def fiche_led():
    p = PRODUITS["led"]
    vues = [("led-img0", "Plaque L’Ours rétroéclairée en bleu par le kit LED", "Bleu"),
            ("led-img1", "Plaque Le Pic du Midi rétroéclairée en vert", "Vert"),
            ("led-img2", "Ruban LED collé au dos d’une plaque", "Ruban"),
            ("led-img3", "Télécommande infrarouge du kit LED", "Télécommande")]
    scenes = "".join('<div class="scene scene--photo" data-scene="{}"{}>{}</div>'.format(
        k, "" if i == 0 else " hidden", img("led/{}.webp".format(k), alt, eager=(i == 0))) for i, (k, alt, _) in enumerate(vues))
    vign = "".join('<button type="button" class="vignette vignette--situation" data-vue="{k}" aria-pressed="{pr}">{im}<span>{n}</span></button>'.format(
        k=k, pr="true" if i == 0 else "false", im=img_vignette("led/{}.webp".format(k), eager="normal"), n=n) for i, (k, _, n) in enumerate(vues))
    tuto = [("tuto-0", "Contenu du kit LED : ruban, contrôleur, télécommande et câble USB", "Le contenu du kit"),
            ("tuto-1", "Ruban LED positionné au dos de la plaque", "Le ruban se pose au dos"),
            ("tuto-2", "Décollage de la protection de l’adhésif du ruban", "On retire la protection"),
            ("tuto-4", "Ruban plié dans un angle de la plaque", "Les angles"),
            ("tuto-5", "Coupe du ruban LED aux repères prévus", "La coupe aux repères"),
            ("tuto-7", "Télécommande du kit LED", "La télécommande")]
    etapes = "".join('<li><figure>{}<figcaption>{}</figcaption></figure></li>'.format(
        img("tuto/{}.webp".format(k), alt), cap) for k, alt, cap in tuto)
    contenu = """
<div class="cadre">
  <nav aria-label="Fil d’Ariane" class="ariane-wrap"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Kit LED</li></ol></nav>
  <div class="fiche" data-fiche data-type="led" data-slug="led" data-nom="Kit LED" data-prix="15" data-image="{img}led/led-img0.webp">
    <div class="galerie galerie--photo">
      <div class="galerie__scene">{scenes}</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues du kit">{vign}</div>
    </div>
    <div class="achat">
      <p class="achat__cat">Accessoire · rétroéclairage</p>
      <h1>Kit LED</h1>
      <p class="achat__intro">Un ruban LED collé au dos de la plaque. Le soir, la lumière se reflète sur le mur et dessine la découpe en contre-jour.</p>
      <p class="achat__prix"><strong data-prix-affiche>15 €</strong><span>TTC · TVA non applicable (art. 293 B du CGI)</span></p>
      {cable}
      <p class="achat__aide">Commandé avec une plaque, le kit est monté par l’atelier au dos de la plaque avant l’envoi. Le plus simple : cochez l’option sur la fiche de la plaque.</p>
      <div class="achat__ligne">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer un kit">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité" data-quantite><button type="button" data-qte="1" aria-label="Ajouter un kit">+</button></div>
        <button type="button" class="bouton bouton--plein bouton--large" data-ajouter>Ajouter à la commande</button>
      </div>
      <dl class="caracteristiques">
        <div><dt>Ruban</dt><dd>LED RGB autocollant, raccord Pico. Longueur : 2 m sur la fiche du site actuel, 1,5 m sur la notice {conf}</dd></div>
        <div><dt>Commande</dt><dd>Contrôleur intégré, télécommande infrarouge, application smartphone (QR code dans le pack)</dd></div>
        <div><dt>Réglages</dt><dd>Couleur, intensité, minuteur, effets</dd></div>
        <div><dt>Alimentation</dt><dd>USB, adaptateur secteur non fourni</dd></div>
        <div><dt>Origine</dt><dd>Non fabriqué en France, choisi pour sa compatibilité avec les plaques</dd></div>
      </dl>
      {livraison}
    </div>
  </div>
</div>
<section class="section section--teinte" aria-labelledby="titre-notice">
  <div class="cadre">
    <div class="entete-section"><p class="etiquette">{balise}Notice</p><h2 id="titre-notice">La pose, en images</h2>
    <p class="chapo">Les plaques acceptent la plupart des rubans LED du marché. Si vous avez déjà le vôtre, il conviendra probablement.</p></div>
    <ol class="notice">{etapes}</ol>
  </div>
</section>
<section class="section" aria-labelledby="titre-associer">
  <div class="cadre">
    <div class="entete-section"><p class="etiquette">{balise}À associer</p><h2 id="titre-associer">Quelques plaques à éclairer</h2>
    <p class="chapo">L’Ours et le Pic du Midi sont ceux des photos du kit, plus haut.</p></div>
    {cartes}
  </div>
</section>""".format(img=IMG, scenes=scenes, vign=vign, cable=choix_cable(), conf=note("longueur à confirmer", "confirmer"),
                     livraison=bloc_livraison(), balise=BALISE, etapes=etapes,
                     cartes=grille_produits([PRODUITS[s] for s in ("lours", "le-pic-du-midi", "la-tour-des-jacobins", "le-cirque-de-gavarnie")],
                                            cls="grille grille--quatre"))
    page("produit-led.html", "Kit LED pour plaque murale · Terre Gravée",
         "Kit LED RGB à coller au dos d’une plaque Terre Gravée : télécommande, application, alimentation USB. Monté par l’atelier avant l’envoi. 15 € TTC.",
         contenu, actif="collection.html", jsonld=jsonld_produit(p, IMG + "led/led-img0.webp"), classe="page-fiche")


def fiche_carte_cadeau():
    p = PRODUITS["carte-cadeau"]
    contenu = """
<div class="cadre">
  <nav aria-label="Fil d’Ariane" class="ariane-wrap"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Carte cadeau</li></ol></nav>
  <div class="fiche" data-fiche data-type="carte" data-slug="carte-cadeau" data-nom="Carte cadeau" data-prix="65" data-image="{img}misc/carte-cadeau.webp">
    <div class="galerie galerie--photo">
      <div class="galerie__scene"><div class="scene scene--photo" data-scene="carte">{visuel}</div></div>
    </div>
    <div class="achat">
      <p class="achat__cat">Idée cadeau</p>
      <h1>Carte cadeau</h1>
      <p class="achat__intro">Vous voulez offrir une plaque mais vous hésitez sur le lieu ? La carte vaut une plaque au choix : la personne choisit le dessin qui lui parle.</p>
      <p class="achat__prix"><strong data-prix-affiche>65 €</strong><span>TTC · TVA non applicable (art. 293 B du CGI)</span></p>
      <fieldset class="choix-simple">
        <legend>Envoi</legend>
        <label><input type="radio" name="envoi" value="Par e-mail" checked> Immédiat, par e-mail</label>
        <label><input type="radio" name="envoi" value="À imprimer"> À imprimer chez vous</label>
      </fieldset>
      <div class="champ"><label for="message-carte">Message pour la personne (facultatif) {valider}</label><textarea id="message-carte" name="message" rows="3" maxlength="240" data-message-cadeau></textarea></div>
      <div class="achat__ligne">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une carte">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité" data-quantite><button type="button" data-qte="1" aria-label="Ajouter une carte">+</button></div>
        <button type="button" class="bouton bouton--plein bouton--large" data-ajouter>Ajouter à la commande</button>
      </div>
      <dl class="caracteristiques">
        <div><dt>Valeur</dt><dd>Une plaque au choix, quel que soit le modèle et la finition</dd></div>
        <div><dt>Kit LED</dt><dd>Non compris : la personne peut l’ajouter à sa commande, 15 € {conf}</dd></div>
      </dl>
      {avant}
    </div>
  </div>
</div>
<section class="section section--teinte" aria-labelledby="titre-idees">
  <div class="cadre">
    <div class="entete-section"><p class="etiquette">{balise}Ou choisissez pour elle</p><h2 id="titre-idees">Trois idées tirées des avis</h2>
    <p class="chapo">Le Cerf, offert à un ami (avis de Gerald) · Le Tourmalet, que Jerome D. s’est offert après l’avoir monté · La Marmotte, découverte pendant une cure (avis de Sophia P.).</p></div>
    {cartes}
  </div>
</section>""".format(img=IMG, visuel=img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, lettrage doré sur fond cuivré", "(max-width: 900px) 92vw, 520px", eager=True),
                     fournir=A_FOURNIR, balise=BALISE, valider=A_VALIDER, conf=A_CONFIRMER, avant=bloc_carte_cadeau(),
                     cartes=grille_produits([PRODUITS[s] for s in ("le-cerf", "le-tourmalet", "la-marmotte")], cls="grille grille--trois"))
    page("produit-carte-cadeau.html", "Carte cadeau, une plaque au choix · Terre Gravée",
         "Carte cadeau Terre Gravée : elle vaut une plaque au choix sur tous les modèles disponibles. Envoi immédiat par e-mail ou à imprimer. 65 € TTC.",
         contenu, actif="collection.html", jsonld=jsonld_produit(p, IMG + "misc/carte-cadeau.webp"), classe="page-fiche")


# ---------------------------------------------------------------------------
# Sur mesure
# ---------------------------------------------------------------------------

def sur_mesure():
    options = "".join("<option>{}</option>".format(e(p["nom"])) for p in PLAQUES)
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Sur mesure</li></ol></nav>
    {etiq}
    <h1>Sur mesure, exclusives et séries</h1>
    <p class="chapo">Un modèle vous plaît mais il vous le faut plus grand, dans un autre métal, ou pour tout un lieu ? Voici ce que l’atelier sait faire, et ce qu’il ne fait pas.</p>
  </header>
</div>
<section class="section section--serre" aria-labelledby="titre-adapter">
  <div class="cadre deux-col">
    <div>
      <p class="etiquette">{balise}Dès une plaque</p>
      <h2 id="titre-adapter">Adapter un modèle existant</h2>
      <ul class="liste-carnet">
        <li>Un autre format, jusqu’à 2 m × 1 m.</li>
        <li>Un autre métal : aluminium dans la teinte RAL de votre choix, acier Corten ou aluminium brut.</li>
        <li>Une autre fixation, ou un support.</li>
      </ul>
      <p>Possible dès une seule plaque, selon faisabilité. Une pièce adaptée à votre demande n’est pas couverte par le droit de rétractation.</p>
      <div class="grands-formats" id="grands-formats">
        <h3>Grands formats {prep}</h3>
        <p>Des versions grand format du Cirque de Gavarnie, du Tourmalet, du Pont d’Espagne et du Pic du Midi sont en préparation. Dimensions et prix {conf}</p>
      </div>
    </div>
    <div class="materiaux">
      <figure>{corten}<figcaption>Acier Corten</figcaption></figure>
      <figure>{brut}<figcaption>Aluminium brut</figcaption></figure>
    </div>
  </div>
</section>
<section class="section section--teinte" id="exclusives" aria-labelledby="titre-exclu">
  <div class="cadre deux-col deux-col--image">
    <figure class="planche">{planche}<figcaption>Dessins inédits de l’atelier : paysages, fleurs et faune des Pyrénées</figcaption></figure>
    <div>
      <p class="etiquette">{balise}Très petites quantités</p>
      <h2 id="titre-exclu">Plaques exclusives</h2>
      <p>Certains dessins ne sont pas encore entrés dans la collection. Ils sortent ponctuellement, en très petite quantité, parfois en exemplaire unique.</p>
      <p>La lettre « planche inédite » prévient de chaque sortie.</p>
      <p><a class="bouton" href="index.html#lettre">Recevoir la lettre</a></p>
    </div>
  </div>
</section>
<section class="section" id="series" aria-labelledby="titre-series">
  <div class="cadre deux-col deux-col--haut">
    <div>
      <p class="etiquette">{balise}Professionnels, collectivités, lieux culturels</p>
      <h2 id="titre-series">Séries sur demande</h2>
      <ul class="liste-carnet">
        <li>Une frise qui raconte une histoire locale.</li>
        <li>Des plaques signalétiques au style artistique.</li>
        <li>Des éditions spéciales pour une exposition, un événement ou un lieu touristique.</li>
        <li>Des grands formats pour une ville, une place ou un lieu public {valider}</li>
        <li>Des plaques pour les hôtels, les gîtes et les entreprises : décoration, cadeaux d’affaires {valider}</li>
      </ul>
      <p>La quantité minimale dépend du projet.</p>
    </div>
    <div class="encadre encadre--liste">
      <h3>Pour un premier échange</h3>
      <ul class="liste-carnet">
        <li>Le lieu et l’histoire à raconter.</li>
        <li>Le nombre de plaques et leur emplacement : dedans, dehors, en hauteur.</li>
        <li>Le format et le métal envisagés.</li>
        <li>La date de l’exposition ou de l’événement, s’il y en a une.</li>
      </ul>
      <p><a class="lien-fleche" href="#demande">Décrire votre projet</a></p>
    </div>
  </div>
</section>
<section class="section section--serre" aria-labelledby="titre-pas">
  <div class="cadre">
    <div class="encadre">
      <h2 id="titre-pas">Ce que l’atelier ne fait pas</h2>
      <p>Pas de pièce entièrement personnalisée sur simple demande : prénom, citation ou photo. Chaque dessin suit la démarche artistique de l’atelier.</p>
    </div>
  </div>
</section>
<section class="section section--teinte" id="demande" aria-labelledby="titre-demande">
  <div class="cadre deux-col">
    <div>
      <p class="etiquette">{balise}Demande de devis</p>
      <h2 id="titre-demande">Décrire votre projet</h2>
      <p class="chapo">Un croquis, une photo du mur ou du lieu, un ordre de grandeur : plus la demande est précise, plus la réponse est rapide. Vous pouvez joindre vos fichiers au formulaire.</p>
      <p>Vous préférez écrire directement ? <a href="contact.html">contact@terregravee.fr</a></p>
    </div>
    <form class="formulaire" data-demo novalidate>
      <div class="champs">
        <div class="champ"><label for="type-demande">Type de demande</label><select id="type-demande" name="type"><option>Adapter un modèle existant</option><option>Plaque exclusive</option><option>Série pour un professionnel</option></select></div>
        <div class="champ"><label for="modele">Modèle de départ</label><select id="modele" name="modele"><option>Aucun en particulier</option>{options}</select></div>
        <div class="champ"><label for="metal">Métal</label><select id="metal" name="metal"><option>Aluminium thermolaqué, teinte RAL</option><option>Acier Corten</option><option>Aluminium brut</option><option>Je ne sais pas encore</option></select></div>
        <div class="champ"><label for="format">Format souhaité</label><input id="format" name="format" type="text" placeholder="Par exemple 120 × 60 cm"><small>Jusqu’à 2 m × 1 m</small></div>
        <div class="champ"><label for="quantite-projet">Quantité</label><input id="quantite-projet" name="quantite" type="number" min="1" value="1"></div>
        <div class="champ"><label for="usage">Usage</label><select id="usage" name="usage"><option>Intérieur</option><option>Extérieur</option><option>Les deux</option></select></div>
        <div class="champ champ--large"><label for="message-projet">Votre projet</label><textarea id="message-projet" name="message" rows="4"></textarea></div>
        <div class="champ champ--large"><label for="fichiers-projet">Croquis ou photos (facultatif)</label><input id="fichiers-projet" name="fichiers" type="file" multiple accept="image/*,.pdf"><small>Images ou PDF. Maquette : aucun fichier n’est envoyé.</small></div>
        <div class="champ"><label for="nom-projet">Nom</label><input id="nom-projet" name="nom" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="email-projet">E-mail</label><input id="email-projet" name="email" type="email" autocomplete="email" required></div>
      </div>
      <button class="bouton bouton--plein" type="submit">Envoyer la demande</button>
      <p class="formulaire__aide">Vos coordonnées servent uniquement à répondre à cette demande.</p>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
    </form>
  </div>
</section>""".format(etiq=etiquette("Créations spéciales"), balise=BALISE,
                     corten='<div class="materiaux__plaque">' + img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten, teinte rouille", eager="normal") + "</div>",
                     brut='<div class="materiaux__plaque">' + img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", eager="normal") + "</div>",
                     planche=img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits : la Vierge du Bédat, la brèche de Roland, l’iris, l’orchis maculée, le gypaète barbu…"),
                     options=options, prep=A_PREPARATION, conf=A_CONFIRMER, valider=A_VALIDER)
    page("sur-mesure.html", "Sur mesure, plaques exclusives et séries · Terre Gravée",
         "Adapter une plaque Terre Gravée (format jusqu’à 2 × 1 m, acier Corten, aluminium brut), plaques exclusives en très petite quantité, séries pour professionnels et lieux culturels.",
         contenu, actif="sur-mesure.html", classe="page-sur-mesure")


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------

def contact():
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Contact</li></ol></nav>
    {etiq}
    <h1>Écrire à l’atelier</h1>
    <p class="chapo">Une question sur une plaque, une commande ou un projet ? Romain Fourneaux vous répond.</p>
  </header>
  <div class="contact">
    <div class="contact__carte">
      <p class="etiquette">{balise}Par e-mail</p>
      <p class="contact__email"><span id="adresse-email">contact@terregravee.fr</span></p>
      <p><button type="button" class="bouton bouton--trait" data-copier="adresse-email">Copier l’adresse</button> <a class="lien-fleche" href="mailto:contact@terregravee.fr">Ouvrir ma messagerie</a></p>
      <p class="etiquette">{balise}L’atelier</p>
      <address>Terre Gravée<br>16 rue du Pic du Midi<br>65200 Gerde</address>
      <p class="attenue">À côté de Bagnères-de-Bigorre. Visite sur rendez-vous {valider}</p>
      {loc}
    </div>
    <form class="formulaire" data-demo novalidate>
      <h2>Écrire un message</h2>
      <div class="champs">
        <div class="champ"><label for="nom-contact">Nom</label><input id="nom-contact" name="nom" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="email-contact">E-mail</label><input id="email-contact" name="email" type="email" autocomplete="email" required></div>
        <div class="champ champ--large"><label for="sujet-contact">Sujet</label><select id="sujet-contact" name="sujet"><option>Une question sur une plaque</option><option>Ma commande</option><option>Un projet sur mesure</option><option>Autre</option></select></div>
        <div class="champ champ--large"><label for="message-contact">Message</label><textarea id="message-contact" name="message" rows="5" required></textarea></div>
      </div>
      <button class="bouton bouton--plein" type="submit">Envoyer</button>
      <p class="formulaire__aide">Vos coordonnées servent uniquement à vous répondre.</p>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
    </form>
  </div>
</div>
<section class="section retractation" id="retractation" aria-labelledby="titre-retractation">
  <div class="cadre faq-grille">
    <div class="entete-section">
      <p class="etiquette">{balise}Rétractation</p>
      <h2 id="titre-retractation">Renoncer au contrat ici</h2>
      <p class="chapo">Vous avez {retract_court}. Remplissez la déclaration, puis confirmez-la : un accusé de réception vous est envoyé par e-mail.</p>
    </div>
    <form class="formulaire retract" data-retract novalidate>
      <fieldset class="retract__etape" data-retract-etape="1">
        <legend>1. Votre déclaration de rétractation</legend>
        <div class="champs">
          <div class="champ"><label for="nom-retract">Nom</label><input id="nom-retract" name="nom" type="text" autocomplete="name" required></div>
          <div class="champ"><label for="commande-retract">Numéro de commande</label><input id="commande-retract" name="commande" type="text" required></div>
          <div class="champ champ--large"><label for="email-retract">E-mail utilisé pour la commande</label><input id="email-retract" name="email" type="email" autocomplete="email" required></div>
          <div class="champ champ--large"><label for="articles-retract">Articles concernés (facultatif)</label><input id="articles-retract" name="articles" type="text"><small>Sans précision, la rétractation porte sur toute la commande.</small></div>
        </div>
        <button class="bouton bouton--plein" type="submit">Renoncer au contrat</button>
      </fieldset>
      <div class="retract__etape" data-retract-etape="2" hidden>
        <p class="retract__resume" tabindex="-1" data-retract-resume>2. Vérifiez puis confirmez votre rétractation.</p>
        <p><button class="bouton bouton--plein" type="button" data-retract-confirmer>Confirmer la rétractation</button> <button class="lien-bouton" type="button" data-retract-retour>Modifier</button></p>
      </div>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé. Sur le site réel, un accusé de réception part aussitôt par e-mail.</p>
    </form>
  </div>
</section>
<section class="section section--teinte" id="livraison" aria-labelledby="titre-faq">
  <div class="cadre faq-grille">
    <div class="entete-section"><p class="etiquette">{balise}Questions pratiques</p><h2 id="titre-faq">Livraison, retours, paiement</h2></div>
    <div class="faq">
      <details open><summary>Quand vais-je recevoir ma plaque ?</summary><p>Les plaques sont expédiées depuis Bagnères-de-Bigorre. Comptez 2 à 4 jours ouvrés, à titre indicatif. En cas de retard, l’atelier vous prévient. <span data-estimation-texte></span></p></details>
      <details><summary>Combien coûte la livraison ?</summary><p>Les frais dépendent du poids et de la destination. Ils s’affichent avant la validation de la commande. {fournir}</p></details>
      <details><summary>Puis-je changer d’avis ?</summary><p>Oui : {retract} <a href="#retractation">Renoncer au contrat ici</a></p></details>
      <details><summary>Quelles garanties ?</summary><p>Toutes les plaques bénéficient des garanties légales de conformité et des vices cachés.</p></details>
      <details><summary>Comment payer ?</summary><p>{paiement}</p></details>
      <details><summary>Comment fixer la plaque ?</summary><p>Deux fixations adhésives 3M Command™ sont fournies : pas besoin de percer. Le léger écart entre la plaque et le mur fait ressortir les ombres de la découpe. Fixation conseillée en extérieur {fournir}</p></details>
    </div>
  </div>
</section>
<section class="section" id="avis" aria-labelledby="titre-politique">
  <div class="cadre faq-grille">
    <div class="entete-section"><p class="etiquette">{balise}Transparence</p><h2 id="titre-politique">Comment sont publiés les avis</h2></div>
    <div class="lecture lecture--petite">
      <p>Les avis affichés sur le site sont publiés <strong>sans vérification d’achat</strong> : rien ne garantit que leur auteur a acheté la plaque. Ils sont affichés du plus récent au plus ancien, avec leur date de publication, sans tri selon la note.</p>
      <ul class="liste-carnet">
        <li>Contrepartie offerte aux auteurs d’avis : aucune {conf}</li>
        <li>Date de l’expérience (achat ou réception) : non renseignée aujourd’hui</li>
        <li>Délai de publication et durée de conservation des avis {fournir}</li>
        <li>Motifs de refus d’un avis {fournir}</li>
      </ul>
      <p>Un doute sur l’authenticité d’un avis ? Signalez-le gratuitement à <a href="mailto:contact@terregravee.fr">contact@terregravee.fr</a>.</p>
    </div>
  </div>
</section>""".format(etiq=etiquette("Contact"), balise=BALISE, valider=A_VALIDER, loc=localisateur_gerde(), fournir=A_FOURNIR,
                     conf=A_CONFIRMER, retract=phrase_retractation(), paiement=phrase_paiement(),
                     retract_court="14 jours après réception pour vous rétracter, sans avoir à vous justifier")
    page("contact.html", "Contact, livraison et retours · Terre Gravée",
         "Écrire à l’atelier Terre Gravée à Gerde (65) : contact@terregravee.fr. Livraison en 2 à 4 jours ouvrés, formulaire de rétractation, paiement et publication des avis.",
         contenu, actif="contact.html", classe="page-contact")


def localisateur_gerde():
    bx0, by0 = proj(43.63, -0.36)
    bx1, by1 = proj(42.65, 0.67)
    x, y = proj(*GERDE)
    tx, ty = proj(43.07, 0.25)
    return """<figure class="localisateur localisateur--contact">
  <svg viewBox="{:.0f} {:.0f} {:.0f} {:.0f}" role="img" aria-label="Carte des Hautes-Pyrénées : l’atelier est à Gerde, au centre du département">
    <path d="{c}" class="loc__dep"/>
    <circle cx="{x:.1f}" cy="{y:.1f}" r="22" class="loc__halo"/><rect x="{rx:.1f}" y="{ry:.1f}" width="16" height="16" class="loc__atelier"/>
    <text x="{tx:.1f}" y="{ty:.1f}" class="loc__texte">Gerde</text>
  </svg>
  <figcaption>Position indicative de l’atelier</figcaption>
</figure>""".format(bx0, by0, bx1 - bx0, by1 - by0, c=CONTOUR_D, x=x, y=y, rx=x - 8, ry=y - 8, tx=tx, ty=ty)


# ---------------------------------------------------------------------------
# Page d’atterrissage du QR code (panneaux de démonstration à Aquensis, proposition à valider)
# ---------------------------------------------------------------------------

QR_LIES = ["la-tour-des-jacobins", "le-montaigu", "le-pic-du-midi", "le-tourmalet"]


def distance_aquensis(slug):
    d = km(AQUENSIS, pos_de(slug))
    if d < 1:
        return "à {} m d’Aquensis".format(int(round(d * 10)) * 100)
    return "à {} km d’Aquensis".format(int(round(d)))


def qr_page():
    cartes = []
    for s in QR_LIES:
        c = carte_produit(PRODUITS[s], sizes="(max-width: 600px) 44vw, 260px")
        c = c.replace('<p class="carte__cartel">', '<p class="carte__distance">{}</p><p class="carte__cartel">'.format(distance_aquensis(s)), 1)
        cartes.append(c)
    grille = grille_produits([PRODUITS[s] for s in QR_LIES], cls="grille grille--quatre", prefixe_cartes=cartes)
    lh = BIENTOT["le-casque-du-lheris"]
    contenu = """
<div class="cadre">
  <header class="entete-page qr-tete">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Depuis Aquensis</li></ol></nav>
    <div class="qr-tete__grille">
      <div>
        {etiq}
        <h1>Vous avez vu nos plaques à Aquensis ?</h1>
        <p class="qr-tete__marqueur">{semetherm}</p>
        <p class="chapo">Les panneaux découpés et rétroéclairés, au-dessus des bassins, sont à l’origine de Terre Gravée. Plusieurs de ces dessins existent en plaques de 60 × 30 cm, pour chez vous : <strong>65 € la plaque</strong>, en noir, gris ou doré.</p>
        <p class="qr-tete__actions"><a class="bouton bouton--plein" href="collection.html">Voir les douze plaques</a><a class="lien-fleche" href="carte.html#aquensis">Aquensis sur la carte</a></p>
      </div>
      <figure class="qr-tete__photo">
        {photo}
        <figcaption>Photo réelle · le décor d’origine à Aquensis, Bagnères-de-Bigorre</figcaption>
      </figure>
    </div>
  </header>
  <section class="qr-histoire" aria-labelledby="titre-qr-histoire">
    <h2 id="titre-qr-histoire">L’histoire, en bref</h2>
    <ul class="liste-carnet">
      <li>Un décor conçu pour Aquensis, pour masquer une coursive technique : 30 niches de 1 m × 2 m.</li>
      <li>60 illustrations de Maude Villatte et Lola Jacquet : le patrimoine, la flore et la faune de la Bigorre.</li>
      <li>De l’aluminium thermolaqué effet Corten, découpé au laser et rétroéclairé.</li>
      <li>Les visiteurs les ont accueillis avec enthousiasme : les plaques pour la maison sont nées de là.</li>
    </ul>
    <p><a class="lien-fleche" href="index.html#origine">Lire l’histoire complète</a></p>
  </section>
</div>
<section class="section section--teinte" aria-labelledby="titre-qr-lies">
  <div class="cadre">
    <div class="entete-section entete-section--ligne"><div><p class="etiquette">{balise}Autour de Bagnères</p><h2 id="titre-qr-lies">Les plaques de Bagnères et de ses montagnes</h2><p class="chapo">Distances à vol d’oiseau depuis Aquensis, arrondies.</p></div><a class="lien-fleche" href="carte.html">Toute la carte</a></div>
    {grille}
    <div class="qr-bientot">
      <div class="qr-bientot__dessin">{dessin}</div>
      <div>
        <p class="qr-bientot__cat">{sym}Bientôt, {dist}</p>
        <p class="qr-bientot__prep">{prep}</p>
        <h3>Le Casque du Lhéris</h3>
        <p>{texte} Le dessin existe ; la plaque n’est pas encore en vente.</p>
        <p><a class="lien-fleche" href="#lettre">Être prévenu de la sortie</a></p>
      </div>
    </div>
  </div>
</section>
<section class="section section--serre" aria-labelledby="titre-qr-prix">
  <div class="cadre">
    <h2 id="titre-qr-prix" class="visuellement-cache">Prix, livraison et pose</h2>
    <div class="bandeau-infos bandeau-infos--qr">
      <div><h3>65 € la plaque</h3><p>Le même prix pour tous les modèles et toutes les finitions, TTC. Le kit LED pour la rétroéclairer : 15 €.</p></div>
      <div><h3>Livrée chez vous</h3><p>Expédiée depuis Bagnères-de-Bigorre, en 2 à 4 jours ouvrés, à titre indicatif. Frais de port {fournir}</p></div>
      <div><h3>Pose sans perçage</h3><p>Deux fixations adhésives 3M Command™ fournies. Ou offrez <a href="produit-carte-cadeau.html">la carte cadeau</a>, une plaque au choix.</p></div>
    </div>
  </div>
</section>
{lettre}
<div class="cadre">
  <aside class="encadre qr-note" aria-labelledby="titre-qr-note">
    <h2 id="titre-qr-note">Note de maquette, pour Romain</h2>
    <p>Cette page reçoit les visiteurs qui scannent le QR code des panneaux de démonstration proposés à Aquensis, aux vestiaires et à la sortie {valider}</p>
    <p>Chaque QR code porterait un paramètre de suivi, par exemple <code>qr.html?utm_source=aquensis&amp;utm_medium=qr&amp;utm_campaign=vestiaires</code> (ou <code>sortie</code>). Indicateur : les visites issues du QR code, par emplacement, puis les inscriptions à la lettre et les commandes qui suivent. Paramètre et outil de mesure {valider}</p>
    <p>Adresse vers laquelle pointe le QR code déjà prêt dans le dossier Marketing {confirmer}</p>
  </aside>
</div>""".format(etiq=etiquette("Depuis le QR code d’Aquensis"), semetherm=A_SEMETHERM,
                 photo=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre et, au-dessus, les panneaux découpés et rétroéclairés du décor d’origine",
                           "(max-width: 900px) 100vw, 560px", eager=True),
                 balise=BALISE, grille=grille,
                 dessin=dessin_planche(lh["dessin"], "Dessin « Le Casque du Lhéris », extrait de la planche des dessins inédits"),
                 sym=symbole("bientot", forme="sommets"), dist=distance_aquensis("le-casque-du-lheris"), prep=A_PREPARATION, texte=e(lh["texte"]),
                 fournir=note("montant à fournir"), lettre=lettre(), valider=A_VALIDER, confirmer=A_CONFIRMER)
    page("qr.html", "Vous avez vu nos plaques à Aquensis ? · Terre Gravée",
         "Vous avez vu le décor d’Aquensis ? L’histoire du décor d’origine, les plaques de Bagnères-de-Bigorre et de ses montagnes, 65 € la plaque.",
         contenu, classe="page-qr")


# ---------------------------------------------------------------------------
# Stratégie (page pour Romain)
# ---------------------------------------------------------------------------

def src(url, label):
    return '<a class="source" href="{}">{}</a>'.format(e(url), label)


TECHNIQUES = [
    {
        "nom": "La fiche comme récit de lieu",
        "ou": "Chaque fiche produit : « Entrée du carnet » avec cartel, borne, localisateur, texte du modèle, « Comment elle est faite » et « À qui l’offrir ».",
        "pourquoi": "L’immersion dans un récit agit sur les attitudes des lecteurs (méta-analyse de van Laer et al., 2014, 132 tailles d’effet, " + src("https://openaccess.city.ac.uk/id/eprint/6755/", "City, University of London") + "). Google valorise l’expérience de première main et la transparence sur qui écrit (" + src("https://developers.google.com/search/docs/fundamentals/creating-helpful-content", "Google Search Central") + "). Les recherches « plaque Pic du Midi » ou « cadeau Tourmalet » trouvent une vraie page de contenu.",
        "valider": "Écrire 300 à 500 mots par lieu, avec des faits vérifiables et l’auteur nommé ; garder le prix et le bouton d’achat visibles au-dessus du récit.",
        "kpi": "Taux d’ajout au panier par fiche, profondeur de lecture, entrées organiques par fiche (Search Console).",
    },
    {
        "nom": "Une histoire d’origine vraie",
        "ou": "Accueil (entrée du carnet « Là où tout a commencé : Aquensis », photo réelle, fiche du projet, avis qui parlent d’Aquensis), repère « Où voir les plaques en vrai » sur la carte, page qr.html.",
        "pourquoi": "Le même levier que le récit de lieu (méta-analyse de van Laer et al., 2014, " + src("https://openaccess.city.ac.uk/id/eprint/6755/", "City, University of London") + ") : ici, l’histoire est vérifiable, avec une photo réelle et les chiffres du projet (30 niches, 60 illustrations). Aucune étude trouvée sur l’effet commercial d’une histoire d’origine pour un artisan : hypothèse à tester.",
        "valider": "L’accord de la SEMETHERM pour citer le projet (marqueur sur chaque page qui en parle) ; ne jamais parler de partenariat ni de point de vente à Aquensis.",
        "kpi": "Clics sur « Lire l’histoire » et « Aquensis sur la carte », lecture de la section d’origine, visites de qr.html.",
    },
    {
        "nom": "La carte, porte d’entrée et contenu à partager",
        "ou": "carte.html : repères cliquables (regroupés en grappes sur mobile), panneau latéral avec prix et bouton toujours visibles, liste des lieux, une adresse par lieu (carte.html#le-tourmalet) et bouton « Copier le lien du lieu ». Deux catégories hors catalogue : « Où voir les plaques en vrai » (Aquensis) et « Bientôt » (modèles en préparation, en pointillé). La carte sert aussi de décor au premier écran de l’accueil, et chaque fiche a son localisateur. C’est la carte interactive que ton Contexte prévoyait.",
        "pourquoi": "Aucune étude trouvée sur l’effet commercial d’une carte : c’est une hypothèse à tester. Le levier documenté est la visibilité : 23 % des sondés citent l’IA comme point de départ de leurs recherches de cadeaux (baromètre Havas Market / YouGov, octobre 2026, intentions déclarées, lu via " + src("https://mondetech.fr/noel-2026-novembre-mois-cle-des-achats/", "mondetech.fr") + "). Une carte accessible doit être opérable au clavier, ne pas dépendre de la couleur et proposer une alternative texte (" + src("https://www.boia.org/blog/interactive-maps-and-accessibility-4-tips", "BOIA") + ").",
        "valider": "Montrer la carte aux offices de tourisme, gîtes et boutiques des grands sites (voir « Vos idées, mises en œuvre ») ; vérifier les positions des repères (Montaigu, Escaladieu et Casque du Lhéris recalés d’après leurs coordonnées publiées) ; les repères « bientôt » des modèles en préparation.",
        "kpi": "Taux de clic sur les repères, parcours carte → fiche → panier, sessions arrivant par un lien à ancre, liens entrants vers carte.html.",
    },
    {
        "nom": "Le trajet de fabrication, en clair",
        "ou": "Accueil (« De Revel à votre mur »), calque « Trajet de fabrication » de la carte (Revel puis Bagnères-de-Bigorre ; Gerde présenté à part comme adresse de l’atelier), liste « Comment elle est faite » sur chaque fiche.",
        "pourquoi": "Rendre le travail visible augmente la valeur perçue (Buell et Norton, Management Science, 2011, " + src("https://ideas.repec.org/a/inm/ormnsc/v57y2011i9p1564-1579.html", "IDEAS") + "). La transparence aide quand le processus se montre bien (entretien avec Martin Schreier, " + src("https://www.wu.ac.at/fileadmin/wu/d/i/mm/news/Schreier_Seiten_aus_handWERK.pdf", "WU Vienne") + ").",
        "valider": "Photos réelles de chaque étape (découpe à Revel, four de thermolaquage, emballage) ; vérifier la formule « rayon de 150 km » : Revel est à environ " + str(KM_REVEL) + " km de Gerde à vol d’oiseau. Ne jamais écrire « fait main ».",
        "kpi": "Clics sur « Fabrication » et sur le calque trajet, conversion des visiteurs qui l’ont vu (corrélation, pas causalité).",
    },
    {
        "nom": "Marketing identitaire local",
        "ou": "Titre de l’accueil (« Un morceau de Bigorre, à accrocher chez vous »), occasion « Pour qui vit en Bigorre » avec l’avis de Sergio (« Habitant à Mauvezin… »), occasion « départ loin des Pyrénées ».",
        "pourquoi": "Aucune étude solide trouvée sur la fierté locale appliquée à la décoration : hypothèse à tester. L’avis réel de Sergio l’illustre sans rien inventer.",
        "valider": "Le ton : la maquette parle de Bigorre et des Hautes-Pyrénées ; faut-il élargir aux Pyrénées pour les touristes ?",
        "kpi": "Conversion par origine géographique (65 et départements voisins comparés au reste de la France), part des commandes livrées hors du 65.",
    },
    {
        "nom": "Des occasions de cadeau ancrées dans le réel",
        "ou": "Accueil (« À offrir à… » : un avis n’est cité que s’il parle de l’occasion), « À qui l’offrir » sur chaque fiche, option « C’est un cadeau » (message, prix masqués) près du bouton d’achat, fiche carte cadeau (« Trois idées tirées des avis »).",
        "pourquoi": "Schreier observe que le fait main est préféré quand on offre à un proche ; ce résultat ne se transpose pas directement à des plaques découpées au laser (hypothèse à tester). 78 % des sites ne montrent pas d’option cadeau sur la fiche (" + src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard, 2026") + ") ; en test, les acheteurs veulent surtout masquer les prix et ajouter un message (" + src("https://baymard.com/blog/gifting-flow", "Baymard") + "). 66 % des sondés veulent faire l’essentiel de leurs achats de cadeaux avant décembre (Havas Market / YouGov 2026, via " + src("https://mondetech.fr/noel-2026-novembre-mois-cle-des-achats/", "mondetech.fr") + ").",
        "valider": "Option cadeau (message, prix masqués) ; durée de validité de la carte cadeau ; publier un guide cadeaux début novembre, avant le Black Friday du 27 novembre 2026 (" + src("https://publicholidays.com/black-friday/", "publicholidays.com") + ").",
        "kpi": "Part des commandes avec message cadeau, ventes de cartes cadeaux, conversion des pages d’occasion (liens UTM).",
    },
    {
        "nom": "Des avis réels, datés, rattachés aux lieux",
        "ou": "Panneau de la carte, fiches produit, « Registre des avis » de l’accueil (les 9 avis, sans sélection ; replié à 3 sur mobile avec un bouton pour tout voir), politique de publication sur la page Contact. La mention « sans vérification d’achat » accompagne chaque note et chaque citation, y compris sur les cartes produit.",
        "pourquoi": "Avec 5 avis, la probabilité d’achat serait 270 % plus élevée qu’avec zéro, et elle culmine entre 4,0 et 4,7 étoiles (" + src("https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales", "Spiegel Research Center") + ", données d’un seul distributeur). Montrer des avis mixtes et leur contexte (" + src("https://www.nngroup.com/articles/ecommerce-product-pages/", "NN/g") + "). 89 % des sites ne répondent pas aux avis négatifs (" + src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard 2026") + ") : la fiche du Cerf prévoit la réponse de l’atelier.",
        "valider": "Rédiger la réponse à l’avis de Gerald (livraison en une semaine) ; décider si l’on demande des photos de plaques posées (proposition à valider, bouton simulé sur les fiches) ; mettre en place une vérification d’achat si possible.",
        "kpi": "Nombre d’avis par modèle (viser 5 sur les modèles phares), part d’avis avec photo, conversion des fiches avec ou sans avis.",
    },
    {
        "nom": "Lettre « planche inédite »",
        "ou": "Accueil (planche voilée sauf trois dessins, tampon « Dessins inédits »), page Sur mesure (planche entière, jamais réservée aux abonnés).",
        "pourquoi": "Une inscription rapide qui dit ce que contient la lettre (" + src("https://www.nngroup.com/articles/newsletters/", "NN/g") + "). Les e-mails automatiques font 2 % des envois mais 30 % du chiffre d’affaires e-mail (" + src("https://www.omnisend.com/2026-ecommerce-marketing-report", "Omnisend 2026") + ", éditeur).",
        "valider": "Le vote pour le prochain lieu, le rythme (une lettre par mois au plus), l’outil d’envoi avec double confirmation (bonne pratique, non obligatoire) ; consentement séparé pour la mesure d’ouverture (" + src("https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels", "CNIL, délibération n° 2026-042") + ").",
        "kpi": "Inscriptions pour 100 visiteurs, taux de consentement à la mesure, clics, ventes attribuées, désinscriptions.",
    },
    {
        "nom": "La rareté réelle : la série numérotée",
        "ou": "Cartel de chaque fiche (« Série : limitée, numéro gravé au dos »), légende de l’accueil.",
        "pourquoi": "Un message « quantité limitée » convainc plus qu’un message « temps limité », surtout pour une marque symbolique (Aggarwal, Jun et Huh, 2011, " + src("https://experts.umn.edu/en/publications/scarcity-messages-a-consumer-competition-perspective/", "University of Minnesota") + "). La rareté n’est honnête que si elle est vraie (" + src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g") + ").",
        "valider": "La taille réelle de chaque série ; un registre public des numéros attribués (ville seulement, avec accord de l’acheteur) ; aucune relance d’une série épuisée sous le même nom.",
        "kpi": "Délai d’épuisement par série, inscriptions à la lettre, demandes « prochaine série ».",
    },
    {
        "nom": "Coût total et délais près du bouton",
        "ou": "Bloc « Avant de commander » de chaque fiche, y compris la carte cadeau : estimation indicative des dates (2 à 4 jours ouvrés, fériés fixes et mobiles exclus), frais de port, rétractation présentée comme un droit légal avec le lien « Renoncer au contrat ici », paiements. Sur mobile, le titre et le prix passent au-dessus de la photo et le bouton remonte.",
        "pourquoi": "64 % des testeurs cherchent les frais de port sur la fiche (" + src("https://baymard.com/blog/show-shipping-costs-on-product-pages", "Baymard") + ") ; 41 % des sites n’indiquent pas de date de livraison à l’étape du choix de livraison (" + src("https://baymard.com/blog/shipping-speed-vs-delivery-date", "Baymard") + "). Pour Noël 2026, 47 % des sondés citent les frais de port et 46 % les délais (Havas Market / YouGov, via " + src("https://mondetech.fr/noel-2026-novembre-mois-cle-des-achats/", "mondetech.fr") + "). Un panier moyen e-commerce de 62 € en 2025 (" + src("https://www.ecommerce-nation.fr/bilan-ecommerce-2025-196-milliards-baisse-panier-moyen/", "FEVAD via E-Commerce Nation") + ") : une plaque à 65 € est dans la norme.",
        "valider": "Grille des frais de port ; délai de préparation inclus ou non ; date limite de commande pour Noël (à calculer : délai atelier + transporteur) ; retrait à l’atelier de Gerde.",
        "kpi": "Taux d’abandon de panier, questions « quand vais-je recevoir ? », part des retards.",
    },
    {
        "nom": "Le kit LED proposé là où il sert",
        "ou": "Option non cochée sur chaque fiche de plaque, avec choix de la sortie du câble sur un schéma ; fiche dédiée avec la notice.",
        "pourquoi": "Les suggestions doivent être peu nombreuses, pertinentes et expliquées, accessoires nécessaires d’abord (" + src("https://baymard.com/blog/product-recommendations-cart", "Baymard") + ") ; jamais d’option pré-cochée (" + src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g") + ").",
        "valider": "La longueur exacte du ruban (2 m ou 1,5 m).",
        "kpi": "Taux d’attache du kit LED, panier moyen.",
    },
    {
        "nom": "Lisible par les moteurs et les assistants",
        "ou": "Données structurées Product, Offer, AggregateRating et Review sur les fiches ; tout le contenu de la carte existe aussi en texte (liste des lieux, panneaux).",
        "pourquoi": "16 % des Français utilisaient l’IA pour s’informer avant Noël 2025 (" + src("https://www.fevad.com/noel-2025-les-francais-veulent-garder-lesprit-des-fetes-malgre-linquietude-ambiante/", "FEVAD") + "). Google n’accepte que des avis visibles et réels dans les données structurées (" + src("https://developers.google.com/search/docs/appearance/structured-data/review-snippet", "Google") + "). Une structure sémantique lisible par les agents fait partie des tendances 2026 (" + src("https://bubble.io/blog/web-design-trends/", "Bubble") + ").",
        "valider": "Garder les avis visibles sur la page qui les balise ; tester les fiches dans l’outil de test des résultats enrichis.",
        "kpi": "Impressions et clics dans Search Console, extraits enrichis valides.",
    },
]

TENDANCES = [
    ("Mise en page éditoriale", "Colonne de lecture étroite, corps de 20 px en Newsreader, cartels et légendes : le registre le moins saturé dans l’e-commerce artisanal. Les tendances 2026 opposent l’intention au gabarit (" + src("https://bubble.io/blog/web-design-trends/", "Bubble, juillet 2026") + ")."),
    ("Un lettrage tiré de lieux réels, en accent", "Barlow Semi Condensed, dessinée d’après la signalisation routière, pour les cartels, cotes et étiquettes ; une « borne » façon borne de col pour les altitudes. Figure Estudio relève les polices inspirées de lieux réels (" + src("https://figureestudio.com/2026/09/10/typography-trends-late-2026/", "septembre 2026") + "). Le serif Newsreader est cité pour une italique d’emphase sur un seul mot (" + src("https://www.gleamstudio.design/blog-post/font-trends-2026", "Gleam Studio") + ")."),
    ("Un blanc froid de carte", "Pantone 2026 est un blanc cassé, Cloud Dancer (" + src("https://www.smithsonianmag.com/smart-news/pantones-color-of-the-year-for-2026-is-a-blank-canvas-called-cloud-dancer-or-in-other-words-white-180987805/", "Smithsonian") + "). Pour s’en distinguer : un blanc légèrement bleuté de carte topographique, le bistre des courbes de niveau en filets, le bleu des eaux en aplat sur les sections teintées, le vert du Parc et le rouge-blanc du balisage GR. Pied de page bleu nuit. Option « carte de nuit » en sombre, où chaque plaque garde un fond « mur » clair."),
    ("Interface discrète, matière réelle", "Filets fins, peu d’ombres, coins presque droits. Aucune image créée pour la maquette : uniquement les visuels de la marque (photos et mises en situation en montage). Les créatifs se disent lassés des images IA, du glassmorphism et des grilles bento (" + src("https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/", "Creative Boom, avril 2026") + ")."),
    ("Récit qui réagit sans détourner le défilement", "Un seul geste animé : le tracé « De Revel à votre mur » se renforce au défilement avec animation-timeline (Chrome, Safari 26), dans @supports, le tracé complet restant l’état par défaut (" + src("https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/", "web-features") + ", " + src("https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/", "WebKit") + ")."),
    ("Relief génératif léger", "Courbes de niveau dessinées une fois dans un canvas (aucune bibliothèque, aucun WebGL), à partir de quelques sommets réels. La 3D décorative coûte de 0,8 à 2 Mo de JavaScript selon " + src("https://dev.to/studiomeyer_io/web-design-trends-2026-what-actually-held-up-after-six-months-23p8", "StudioMeyer") + " (données d’agence)."),
    ("View Transitions entre carte et fiche", "La photo du panneau de la carte et l’image principale de la fiche partagent un nom de transition : Chrome, Edge et Safari 18.2 enchaînent les deux pages, Firefox navigue normalement (" + src("https://web-platform-dx.github.io/web-features-explorer/features/cross-document-view-transitions/", "web-features") + ", " + src("https://developer.chrome.com/docs/web-platform/view-transitions/cross-document", "Chrome") + "). Désactivé si l’utilisateur réduit les animations. En ouvrant les fichiers en local (file://), l’effet peut ne pas se déclencher."),
    ("Coupures de lignes soignées", "text-wrap: balance sur les titres, pretty sur le texte courant en amélioration progressive (" + src("https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-balance/", "balance") + ", " + src("https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-pretty/", "pretty") + ")."),
    ("Commerce honnête", "Ni compte à rebours, ni stock affiché, ni prix barré. La consultation européenne sur le Digital Fairness Act vise notamment les comptes à rebours et la fausse rareté (" + src("https://www.osborneclarke.com/insights/digital-fairness-act-unpacked-dark-patterns", "Osborne Clarke") + ") ; pour les prix barrés, c’est l’article L112-1-1 qui s’applique."),
    ("La carte comme décor", "Le premier écran est une feuille de carte en pleine largeur : relief, rivières, repères, la plaque posée sur son sommet, et le titre dans un cartouche de feuille topographique. La légende de la carte remplace le bandeau de réassurance habituel."),
]


# Palette de marque de Romain (dossier « Identité graphique », « version centrée métal brut »)
PALETTE = [
    ("Noir ardoise", "#2C2C2C", "Texte, en-tête, pied de page, contrastes",
     "Encre un peu plus noire (#14181B) pour le texte ; pied de page bleu nuit (#0F2433), couleur de carte de nuit.", "Proche"),
    ("Blanc cassé", "#F5F5F0", "Fond principal",
     "Fond #F1F4F3 : un blanc légèrement bleuté de carte topographique, froid là où ta charte est chaude.", "Écart volontaire"),
    ("Argent doux", "#D0D0D0", "Détails, bordures, icônes",
     "Filets #CDD5D5 : presque le même gris, à peine teinté de bleu.", "Repris"),
    ("Vert sauge très pâle", "#DCE2D4", "Fonds de sections secondaires",
     "Les sections teintées sont bleu des eaux (#E2EDF3). Le sauge sert de fond à l’entrée « Là où tout a commencé : Aquensis » et au cadre de la photo de qr.html.", "Repris en partie"),
    ("Cuivre clair", "#CBAA88", "Boutons d’action, survol",
     "Boutons en encre. Le cuivre sert d’accent : filet de l’entrée d’origine, étoile « Où voir les plaques en vrai » ; le bistre des courbes de niveau (#C8A27A) en est très proche.", "Repris en accent"),
]


def contraste(a, b):
    def lum(h):
        c = [int(h.lstrip("#")[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
        c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def verdict(r, usage="texte"):
    if usage == "objet":
        return "suffisant pour un objet graphique (3 : 1)" if r >= 3 else "insuffisant, même pour un objet graphique (3 : 1)"
    if r >= 7:
        return "AAA"
    if r >= 4.5:
        return "AA"
    if r >= 3:
        return "AA pour un grand texte seulement"
    return "échoue, même en grand texte"


CONTRASTES = [
    ("Texte blanc", "#FFFFFF", "cuivre clair", "#CBAA88", "texte"),
    ("Texte blanc cassé", "#F5F5F0", "cuivre clair", "#CBAA88", "texte"),
    ("Texte noir ardoise", "#2C2C2C", "cuivre clair", "#CBAA88", "texte"),
    ("Texte noir ardoise", "#2C2C2C", "blanc cassé", "#F5F5F0", "texte"),
    ("Texte noir ardoise", "#2C2C2C", "vert sauge", "#DCE2D4", "texte"),
    ("Texte cuivre clair", "#CBAA88", "blanc cassé", "#F5F5F0", "texte"),
    ("Texte cuivre foncé proposé", "#80542B", "blanc cassé", "#F5F5F0", "texte"),
    ("Texte cuivre foncé proposé", "#80542B", "vert sauge", "#DCE2D4", "texte"),
    ("Bordure de champ argent doux", "#D0D0D0", "blanc cassé", "#F5F5F0", "objet"),
    ("Étoile cuivre clair, sans contour", "#CBAA88", "fond de carte", "#FAFBFB", "objet"),
]

ADAPTATION = [
    ("Fond des pages", "#F1F4F3, blanc froid de carte", "#F5F5F0, ton blanc cassé"),
    ("Texte et en-tête", "#14181B", "#2C2C2C, ton noir ardoise"),
    ("Filets et bordures décoratives", "#CDD5D5", "#D0D0D0, ton argent doux ; #8A8A84 pour les bordures de champs, qui doivent atteindre 3 : 1"),
    ("Sections teintées", "#E2EDF3, bleu des eaux", "#DCE2D4, ton vert sauge"),
    ("Boutons d’action", "fond encre, texte blanc", "fond #CBAA88 cuivre clair, texte #2C2C2C noir ardoise ; au survol, fond noir ardoise et texte blanc cassé"),
    ("Texte couleur cuivre (étiquettes)", "bistre #7A4A22", "#80542B, un cuivre foncé : jamais de texte en cuivre clair"),
    ("Pied de page", "#0F2433, bleu nuit", "#2C2C2C, noir ardoise"),
    ("À garder", "bleu des eaux, vert du Parc, rouge du balisage", "inchangés : ils portent la lecture de la carte (rivières, parc, trajet, liens)"),
]

# Idées marketing de Romain (Contexte.docx) : ce que le site prévoit, l’indicateur, ce qui reste à valider
IDEES = [
    {"nom": "Panneaux de démonstration à Aquensis, avec QR code",
     "site": "La page <a href=\"qr.html\">qr.html</a> les attend : « Vous avez vu nos plaques à Aquensis ? », l’histoire en bref, les plaques liées à Bagnères avec leur distance, le prix de 65 €, la carte, la collection et la lettre. Un QR code par emplacement (vestiaires, sortie), chacun avec son paramètre de suivi : <code>qr.html?utm_source=aquensis&amp;utm_medium=qr&amp;utm_campaign=vestiaires</code>. Sur le panneau : le prix, et le rappel que d’autres modèles existent.",
     "kpi": "Visites issues du QR code, par emplacement ; inscriptions à la lettre et commandes qui suivent une visite de qr.html.",
     "valider": "L’accord de la SEMETHERM, pour les panneaux comme pour la citation du projet ; les emplacements ; le paramètre de suivi et l’outil de mesure (sans cookie, ou avec consentement) ; l’adresse vers laquelle pointe le QR code déjà prêt dans le dossier Marketing."},
    {"nom": "Commerçants et restaurants partenaires",
     "site": "Sur la carte, la catégorie « Où voir les plaques en vrai » accueille chaque lieu qui expose une plaque, avec son accord : nom, adresse, modèle exposé. Un lien court ou un QR code par lieu (<code>utm_source=nom-du-lieu</code>). Une mention claire, « plaque offerte par l’atelier », pour que le visiteur sache de quoi il s’agit.",
     "kpi": "Visites par lieu ; commandes qui citent le lieu, avec une question facultative au moment de commander : « Où avez-vous vu nos plaques ? ».",
     "valider": "La liste des lieux, l’accord écrit de chacun, le nombre de plaques offertes, la mention de transparence."},
    {"nom": "Offices de tourisme et boutiques des grands sites",
     "site": "Une page « Où acheter », créée seulement quand un dépôt est signé : aucun point de vente n’est annoncé avant. Sur la page Sur mesure, une rubrique pour les revendeurs : conditions sur demande, photos et textes prêts à l’emploi. Sur la carte, une catégorie « Où acheter », distincte de « Où voir ».",
     "kpi": "Nombre de lieux de vente, ventes par lieu (déclarées par le lieu), visites issues de leurs QR codes.",
     "valider": "Les lieux à démarcher (boutique du téléphérique du Pic du Midi, concept-stores, offices de tourisme) ; le prix public en boutique, le même qu’en ligne ou non ; le présentoir et l’emballage."},
    {"nom": "Événements : fête du château de Mauvezin, montée du col du Tourmalet",
     "site": "Un bloc « Où nous rencontrer » sur l’accueil et un repère temporaire sur la carte, avec les dates ; un rappel sur les fiches du Château de Mauvezin et du Tourmalet ; sur le stand, un QR code vers la lettre (<code>utm_campaign=mauvezin</code> ou <code>tourmalet</code>).",
     "kpi": "Inscriptions à la lettre le jour même, visites issues du QR code du stand, ventes sur place.",
     "valider": "La participation, les dates exactes, le paiement sur place, l’accord des organisateurs."},
    {"nom": "Grands formats pour la ville",
     "site": "La page Sur mesure annonce les grands formats en préparation (Gavarnie, Tourmalet, Pont d’Espagne, Pic du Midi) et les séries pour une ville ou un lieu public, avec le formulaire de devis. Une pièce installée rejoint ensuite la carte, avec l’accord de la ville.",
     "kpi": "Demandes de devis de collectivités, visites de la page Sur mesure.",
     "valider": "La ville à qui proposer, offert ou vendu, les dimensions et le prix des grands formats."},
    {"nom": "Offres pour les professionnels : hôtels, entreprises",
     "site": "Sur la page Sur mesure, la ligne « hôtels, gîtes et entreprises : décoration, cadeaux d’affaires » et le type « Série pour un professionnel » dans le formulaire. Plus tard, une page dédiée avec des exemples réels, photographiés avec l’accord des clients.",
     "kpi": "Demandes de devis professionnelles, part des devis signés, panier moyen des commandes professionnelles.",
     "valider": "Les conditions pour les professionnels (dégressivité éventuelle, délais) : la maquette n’affiche aucun chiffre."},
    {"nom": "Thèmes sportifs : cols, rugby",
     "site": "Le Tourmalet ouvre déjà la catégorie « Sommets et cols » de la carte : d’autres cols du département (Aspin, Hautacam…) y prendraient place, avec la même fiche. Pour le rugby, un dessin sans logo ni nom de club : ces marques sont protégées.",
     "kpi": "Votes dans la lettre pour le prochain lieu gravé, inscriptions « prévenez-moi » par modèle, ventes des modèles de cols autour du passage du Tour de France.",
     "valider": "Les thèmes, les droits sur les noms et les logos (clubs, épreuves), le calendrier de sortie."},
    {"nom": "Autres faunes et flores",
     "site": "La catégorie « Faune des Pyrénées » de la carte et de la collection accueille de nouveaux animaux, sans repère précis comme les quatre actuels. Une catégorie « Flore » s’y ajoute, avec son symbole sur la carte et son filtre dans la collection. La planche des dessins inédits en contient déjà : l’iris, l’orchis maculée, les chardons bleus, la digitale pourpre et la ramonde des Pyrénées pour la flore ; le grand tétras, le milan royal, le vautour fauve et le gypaète barbu pour la faune. Chaque nouveau modèle passe d’abord par la catégorie « Bientôt » et par la lettre, avec un bouton « prévenez-moi ».",
     "kpi": "Votes dans la lettre pour la prochaine espèce gravée, inscriptions « prévenez-moi » par modèle, ventes de la collection Faune puis Flore.",
     "valider": "Le choix des espèces et le calendrier de sortie ; les noms affichés (nom courant, nom latin dans le cartel, comme pour la faune actuelle) ; toujours sans sigle qui évoquerait le Parc national ou sa marque."},
    {"nom": "Autres territoires : Mont-Saint-Michel, Étretat, Pont du Gard",
     "site": "La carte est une feuille par département (« Feuille 65 · Hautes-Pyrénées » sur l’accueil). Un autre territoire devient une autre feuille de la même collection : Feuille 50 · Manche, Feuille 76 · Seine-Maritime, Feuille 30 · Gard, chacune avec ses repères et ses fiches. Le site passe alors d’une carte à un sommaire de cartes.",
     "kpi": "Inscriptions à une liste d’attente par territoire, demandes reçues par le formulaire de contact.",
     "valider": "Les priorités, les illustrations, les marques à vérifier (le label « Grand Site de France » est protégé, certains noms de sites peuvent être déposés), la cohérence avec « Graver l’âme des territoires »."},
]


def strategie():
    tech = []
    for t in TECHNIQUES:
        tech.append("""<article class="technique">
  <h3>{nom}</h3>
  <dl>
    <div><dt>Où</dt><dd>{ou}</dd></div>
    <div><dt>Pourquoi</dt><dd>{pq}</dd></div>
    <div><dt>À valider</dt><dd>{val}</dd></div>
    <div><dt>Indicateur</dt><dd>{kpi}</dd></div>
  </dl>
</article>""".format(nom=t["nom"], ou=e(t["ou"]), pq=t["pourquoi"], val=t["valider"], kpi=e(t["kpi"])))
    tend = "".join("<li><h3>{}</h3><p>{}</p></li>".format(t, d) for t, d in TENDANCES)
    legal = [
        ("Pratiques commerciales trompeuses", "Aucun stock, délai, label, classement des ventes ou partenariat inventé (L121-2) : le badge « Parmi les plus vendues » du site actuel n’est pas repris, faute de chiffres. L’histoire d’origine (le décor conçu pour Aquensis) est racontée sur l’accueil, la carte et qr.html, toujours avec le marqueur « à valider : accord de la SEMETHERM pour citer le projet Aquensis » ; jamais de partenariat ni de point de vente à Aquensis, et le décor n’est pas présenté comme une référence pour des clients professionnels. Les modèles en préparation sont montrés sans photo de plaque (le vrai dessin de la planche, ou un emplacement vide), sans prix ni date. La faune est dite « des Pyrénées », sans sigle qui évoquerait le Parc national ou sa marque. Pas de « fait main » : la découpe est faite au laser à Revel. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563107", "L121-4 sur Légifrance")),
        ("Droits légaux", "Les 14 jours de rétractation et les garanties légales sont présentés comme des droits, jamais comme un avantage de la marque (L121-4, 10°)."),
        ("Avis en ligne", "Mention « publiés sans vérification d’achat » près de chaque bloc d’avis, de chaque citation et de chaque note, dates de publication, ordre chronologique, rubrique « Comment sont publiés les avis » (L111-7-2 ; D111-16 à D111-19). Textes cités mot pour mot. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049571119", "L111-7-2") + ", " + src("https://www.legifrance.gouv.fr/jorf/id/JORFARTI000035720943", "décret 2017-1436")),
        ("Prix et réductions", "Aucun prix barré. Toute réduction future devra se référer au prix le plus bas des 30 derniers jours (L112-1-1). " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044549592", "Légifrance")),
        ("Lettre d’information", "Case non cochée, finalité écrite, désinscription à chaque envoi (L34-5 CPCE, RGPD) ; double confirmation (bonne pratique, non obligatoire). Consentement séparé pour le pixel de mesure d’ouverture : CNIL, délibération n° 2026-042 du 12 mars 2026 (publiée le 14 avril 2026) ; trois mois pour informer les contacts déjà collectés. " + src("https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels", "CNIL, pixels") + ", " + src("https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique", "CNIL, prospection")),
        ("Bouton de rétractation", "L’ordonnance n° 2026-2 du 5 janvier 2026 transpose la directive (UE) 2023/2673 ; un décret du même jour (numéro " + note("à fournir") + ") fixe les champs de la déclaration et l’accusé de réception. Depuis le 19 juin 2026, le site doit offrir sans frais une fonction « Renoncer au contrat ici », facile à trouver pendant tout le délai ; amende administrative jusqu’à 75 000 € pour une personne morale. La maquette met un lien permanent dans le pied de page de chaque page et un formulaire simulé en deux étapes (déclaration, puis confirmation) sur la page Contact. " + src("https://hlc.com/fr/publications/transposition-under-french-law-of-the-eu-mandatory-withdrawal-button-for-online-sales", "Hogan Lovells")),
        ("Sur mesure", "Les pièces adaptées à la demande sont exclues du droit de rétractation (L221-28, 3°) : c’est écrit sur la page Sur mesure. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563170", "Légifrance")),
        ("Polices", "La maquette charge Google Fonts pour être prête à l’emploi. Un tribunal de Munich a condamné en 2022 un site qui transmettait ainsi l’adresse IP des visiteurs à Google : sur le site réel, héberger les polices soi-même. " + src("https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html", "The Hacker News")),
        ("Formule « rayon de 150 km »", "Revel (31) est à environ " + str(KM_REVEL) + " km de Gerde à vol d’oiseau. Selon le point de référence choisi, la formule peut être contestée : préciser le centre du rayon ou écrire « fabriquées en Occitanie »."),
    ]
    legal_html = "".join("<li><h3>{}</h3><p>{}</p></li>".format(t, d) for t, d in legal)
    pastilles = "".join(
        '<li class="palette__item"><span class="palette__couleur" style="background:{hx}" aria-hidden="true"></span>'
        '<span class="palette__nom">{nom}</span><code>{hx}</code><span class="palette__role">{role}</span></li>'.format(nom=n, hx=hx, role=r)
        for n, hx, r, _, _ in PALETTE)
    lignes_palette = "".join(
        '<tr><th scope="row"><span class="palette__mini" style="background:{hx}" aria-hidden="true"></span>{nom} <code>{hx}</code></th>'
        '<td data-label="Dans la version 1">{v1}</td><td data-label="Écart">{ec}</td></tr>'.format(nom=n, hx=hx, v1=v1, ec=ec)
        for n, hx, _, v1, ec in PALETTE)
    lignes_contraste = "".join(
        '<tr><th scope="row"><span class="contraste__exemple" style="color:{a};background:{b}">Aa</span>{ta} <code>{a}</code></th>'
        '<td data-label="Sur">{tb} <code>{b}</code></td><td data-label="Contraste">{r}</td><td data-label="Verdict" class="{cls}">{v}</td></tr>'.format(
            ta=ta, a=a, tb=tb, b=b, r=("{:.2f}".format(contraste(a, b)).replace(".", ",") + " : 1"),
            v=verdict(contraste(a, b), u), cls="contraste--ok" if (contraste(a, b) >= (3 if u == "objet" else 4.5)) else "contraste--non")
        for ta, a, tb, b, u in CONTRASTES)
    lignes_adapt = "".join('<tr><th scope="row">{}</th><td data-label="Version 1">{}</td><td data-label="Fidèle à ta charte">{}</td></tr>'.format(x, y, z)
                           for x, y, z in ADAPTATION)
    idees = "".join("""<article class="technique idee">
  <h3>{nom}</h3>
  <dl>
    <div><dt>Sur le site</dt><dd>{site}</dd></div>
    <div><dt>Indicateur</dt><dd>{kpi}</dd></div>
    <div><dt>À valider</dt><dd>{val} {marq}</dd></div>
  </dl>
</article>""".format(nom=i["nom"], site=i["site"], kpi=e(i["kpi"]), val=e(i["valider"]), marq=A_VALIDER) for i in IDEES)
    fournir = [
        "La taille de chaque série limitée (nombre d’exemplaires numérotés).",
        "La grille des frais de port, ou au moins un tarif indicatif.",
        "Le délai de préparation avant expédition (compris ou non dans les 2 à 4 jours ouvrés) et la date limite de commande pour Noël 2026.",
        "La longueur exacte du ruban LED (2 m ou 1,5 m).",
        "La durée de validité de la carte cadeau.",
        "Les photos manquantes : Le Cerf en noir, L’Abbaye de l’Escaladieu en doré, les mises en situation du Cirque de Gavarnie et du Cerf.",
        "Des photos réelles de la fabrication : découpe à Revel, thermolaquage, contrôle et emballage.",
        "Un récit de 300 à 500 mots par lieu, avec faits vérifiables, auteur et date.",
        "La réponse de l’atelier à l’avis de Gerald.",
        "La politique des avis : contrepartie éventuelle, délais de publication et de conservation, motifs de refus.",
        "Les liens Instagram et Facebook.",
        "La fixation conseillée en extérieur (affichée « à fournir » sur l’accueil et dans les caractéristiques de chaque fiche).",
        "Le point de référence de la formule « rayon de 150 km ».",
        "Le numéro du décret du 5 janvier 2026 sur la fonction de rétractation, et les champs exacts qu’il impose.",
        "Les conditions PayPal du paiement en 4 fois (montants éligibles, offre sous réserve d’acceptation).",
        "Une photo réelle de chaque étape, dont la découpe à Revel (l’accueil montre pour l’instant une plaque en aluminium brut, présentée comme illustration).",
        "Mate ou satinée : quelle finition pour quelle teinte.",
        "Les conditions de rétractation et d’utilisation de la carte cadeau.",
        "L’accord écrit de la SEMETHERM pour citer le projet Aquensis (tes notes parlent d’un accord de principe ; la lettre n’est pas encore signée).",
        "Le logo en SVG, exporté de logo.ai, pour remplacer la signature typographique.",
        "Le dessin du Jardin Massey, s’il existe en image (la planche montre seulement Le Casque du Lhéris et La Transhumance).",
        "Le prix et la date de sortie des modèles en préparation ; les dimensions et le prix des grands formats.",
        "L’adresse vers laquelle pointe le QR code déjà prêt dans le dossier Marketing.",
        "Les panneaux d’Aquensis devenus des plaques (liste lue sur la photo : Le Cerf, L’Isard, Le Tourmalet, Le Pont d’Espagne, Le Château de Mauvezin, Le Cirque de Gavarnie ; La Transhumance y figure aussi).",
        "Les dates de la fête du château de Mauvezin et de la montée du Tourmalet, si tu y participes.",
    ]
    valider = [
        "Option cadeau : message sur une carte et prix masqués sur le bon de livraison.",
        "Lettre : vote pour le prochain lieu gravé, une lettre par mois au plus.",
        "Visite de l’atelier sur rendez-vous ; retrait des commandes à Gerde.",
        "Montrer la carte aux offices de tourisme, gîtes et boutiques des grands sites.",
        "Demande de photos aux personnes qui ont une plaque, pour illustrer les fiches avec leur accord.",
        "Message libre sur la carte cadeau.",
        "Guide cadeaux publié début novembre, avant le Black Friday du 27 novembre 2026.",
        "Panneaux de démonstration à Aquensis (vestiaires, sortie), page qr.html et paramètre de suivi.",
        "Les modèles annoncés « bientôt » : Le Casque du Lhéris, La Transhumance, Le Jardin Massey, et les grands formats.",
        "Commerçants et restaurants qui exposent une plaque, dépôts en boutique, événements, offres aux professionnels, thèmes sportifs, autres faunes et flores, autres territoires (détail dans « Vos idées, mises en œuvre »).",
        "La palette : garder celle de la version 1, ou passer à ta charte (aperçu avec le bouton de la section « Votre palette »).",
    ]
    contenu = """
<div class="cadre strategie">
  <header class="entete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Stratégie</li></ol></nav>
    {etiq}
    <h1>Version 1 : le carnet de territoire</h1>
    <p class="chapo">Romain, cette page explique la version 1 : son idée, les tendances qu’elle suit, chaque technique de vente et ce qu’il te reste à décider. Les trois versions partent des mêmes faits ; celle-ci mise sur le récit des lieux et la carte.</p>
    <nav class="strat-sommaire" aria-label="Nouveau depuis la lecture de ton Drive">
      <p>Nouveau depuis la lecture de ton Drive :</p>
      <ul><li><a href="#s-idees">Vos idées, mises en œuvre</a></li><li><a href="#s-palette">Votre palette</a></li><li><a href="index.html#origine">L’histoire d’origine sur l’accueil</a></li><li><a href="qr.html">La page du QR code</a></li><li><a href="carte.html#aquensis">Aquensis et les modèles « bientôt » sur la carte</a></li></ul>
    </nav>
  </header>
  <section class="strat-bloc" aria-labelledby="s-concept">
    <h2 id="s-concept">L’idée</h2>
    <div class="lecture">
      <p>Le site devient un atlas. Chaque plaque est l’entrée d’un lieu que les gens connaissent : le Pic qu’ils voient de leur fenêtre, le col qu’ils ont monté, la tour de la ville où ils ont fait leur cure. La page signature, <a href="carte.html">la carte des plaques</a>, réunit les huit lieux, les quatre animaux des Pyrénées (sans repère précis, dans la zone schématique du Parc national) et le trajet de fabrication de Revel à Bagnères-de-Bigorre.</p>
      <p>Le ton est celui d’un carnet de terrain : cartels, coordonnées, bornes d’altitude, registre des avis. Le commerce est lent et net : prix unique, délais et frais près du bouton, aucune urgence.</p>
      <p>Ton Drive a apporté l’histoire d’origine. Elle devient une entrée du carnet sur l’accueil, « Là où tout a commencé : Aquensis », et un repère « Où voir les plaques en vrai » sur la carte. Les modèles en préparation y ont des repères « bientôt », en pointillé, et la page <a href="qr.html">qr.html</a> attend les visiteurs des panneaux de démonstration.</p>
    </div>
    <div class="personas">
      <h3>Pour qui (hypothèses, pas des affirmations à publier)</h3>
      <ul>
        <li><strong>L’habitant de Bigorre</strong>, fier de son coin : il cherche « son » lieu sur la carte.</li>
        <li><strong>Le touriste, randonneur ou cycliste</strong> : un souvenir du Tourmalet, de Gavarnie, du Pont d’Espagne.</li>
        <li><strong>La curiste de Bagnères</strong> : elle a vu les plaques à Aquensis ou pendant sa cure.</li>
        <li><strong>La personne qui cherche un cadeau</strong> : occasions concrètes, option message, carte cadeau.</li>
      </ul>
      <p class="personas__note">Tes cibles prioritaires, d’après ton Contexte : les touristes et les habitants attachés à leur patrimoine. La version 1 les sert en premier.</p>
    </div>
  </section>
  <section class="strat-bloc" aria-labelledby="s-idees">
    <h2 id="s-idees">Vos idées, mises en œuvre</h2>
    <p class="attenue">Les idées de ton Contexte, une par une : ce que le site doit prévoir, l’indicateur à suivre, ce qui reste à décider. Déjà en place dans cette version : la carte interactive des plaques, les plaques sur devis (page Sur mesure), le rétroéclairage (kit LED) et l’emballage renforcé (bloc « Avant de commander »).</p>
    <div class="techniques">{idees}</div>
  </section>
  <section class="strat-bloc" aria-labelledby="s-palette">
    <h2 id="s-palette">Votre palette</h2>
    <p class="attenue">« Palette Terres Gravées : version centrée métal brut », d’après ton dossier Identité graphique.</p>
    <ul class="palette">{pastilles}</ul>
    <h3 class="strat-sous-titre">Comment la version 1 la reprend, ou s’en écarte</h3>
    <p class="strat-texte">La version 1 a sa propre palette, celle d’une carte topographique : blanc froid, encre, bistre des courbes, bleu des eaux, vert du Parc, rouge du balisage. Elle reste cousine de la tienne (gris, cuivre, encre) et la rappelle là où c’est cohérent : le vert sauge et le filet cuivre de l’entrée d’origine, rappel du Corten d’Aquensis, et l’étoile cuivre des lieux où voir les plaques.</p>
    <div class="strat-table-wrap"><table class="strat-table">
      <caption class="visuellement-cache">Ta palette et son usage dans la version 1</caption>
      <thead><tr><th scope="col">Ta couleur</th><th scope="col">Dans la version 1</th><th scope="col">Écart</th></tr></thead>
      <tbody>{lignes_palette}</tbody>
    </table></div>
    <h3 class="strat-sous-titre">Les contrastes à respecter</h3>
    <p class="strat-texte">Seuils WCAG : 4,5 : 1 pour un texte courant, 3 : 1 pour un grand texte ou un objet graphique (icône, bordure de champ). Le texte blanc sur cuivre clair ne passe pas : sur un bouton cuivre, écrire en noir ardoise. L’argent doux convient aux filets décoratifs, pas aux bordures de champs. Sur la carte, l’étoile cuivre porte un contour encre : c’est lui qui assure le contraste.</p>
    <div class="strat-table-wrap"><table class="strat-table strat-table--contrastes">
      <caption class="visuellement-cache">Contrastes calculés entre les couleurs de ta palette</caption>
      <thead><tr><th scope="col">Couleur</th><th scope="col">Sur</th><th scope="col">Contraste</th><th scope="col">Verdict</th></tr></thead>
      <tbody>{lignes_contraste}</tbody>
    </table></div>
    <h3 class="strat-sous-titre">Si tu veux rester fidèle à ta charte {valider_m}</h3>
    <p class="strat-texte">Toutes les couleurs de la maquette passent par une douzaine de variables CSS (début de <code>assets/carnet.css</code>). Voici la correspondance proposée ; le bouton ci-dessous l’applique à toute la maquette, dans ce navigateur, pour en juger sur pièce.</p>
    <div class="strat-table-wrap"><table class="strat-table">
      <caption class="visuellement-cache">Adaptation proposée de la version 1 à ta charte</caption>
      <thead><tr><th scope="col">Élément</th><th scope="col">Version 1</th><th scope="col">Fidèle à ta charte</th></tr></thead>
      <tbody>{lignes_adapt}</tbody>
    </table></div>
    <div class="palette__essai">
      <div class="palette__apercu" aria-hidden="true"><span class="palette__apercu-tete">Terre Gravée</span><span class="palette__apercu-corps"><span>Le Pic du Midi · 65 €</span><span class="palette__apercu-bouton">Ajouter à la commande</span></span><span class="palette__apercu-section">Section secondaire</span></div>
      <div>
        <p>Aperçu : en-tête noir ardoise, fond blanc cassé, filets argent, section vert sauge, bouton cuivre clair à texte noir ardoise.</p>
        <p><button type="button" class="bouton bouton--trait" data-palette-bascule aria-pressed="false"><span data-palette-texte>Voir la maquette avec ta palette</span></button></p>
        <p class="palette__aide">Le choix est gardé dans ce navigateur, de page en page ; le même bouton revient à la palette de la version 1. En mode « carte de nuit », la palette sombre de la version reste active.</p>
      </div>
    </div>
    <h3 class="strat-sous-titre">Le logo</h3>
    <p class="strat-texte">Ton logo existe en vectoriel (Identité graphique/logo/logo.ai, avec logo.png, logo2.png et logo3.png) : l’emblème au coq, « TERRE GRAVÉE » et « Graver l’âme des territoires ». La maquette affiche à la place une signature typographique, un petit signe en courbes de niveau suivi de « Terre Gravée ». Exporté en SVG, le logo peut la remplacer dans l’en-tête et le pied de page : c’est la constante <code>LOGO</code> de build.py. Fichier SVG {fournir_m}</p>
  </section>
  <section class="strat-bloc" aria-labelledby="s-tendances">
    <h2 id="s-tendances">Les tendances utilisées</h2>
    <ul class="strat-liste">{tend}</ul>
    <p class="attenue">Évité volontairement : parallaxe, défilement détourné, glassmorphism, bento, images générées, dégradés, compte à rebours.</p>
  </section>
  <section class="strat-bloc" aria-labelledby="s-techniques">
    <h2 id="s-techniques">Les techniques de vente, une par une</h2>
    <p class="attenue">Niveau de preuve : fort pour Baymard, NN/g et les articles académiques ; moyen pour les sondages ; faible pour les rapports d’éditeurs (Omnisend). Avec le trafic d’une micro-entreprise, préférer les comparaisons avant/après sur des périodes comparables aux tests A/B.</p>
    <div class="techniques">{tech}</div>
    <p class="attenue">Non retenus dans cette version, pour la distinguer de la version 2 : seuil de livraison offerte, lots, quiz et barre d’achat collante sur mobile (cette dernière ne gagne qu’entre 12,5 et 27 % des tests selon {cc}). À la place, la fiche mobile remonte le titre, le prix et le bouton.</p>
  </section>
  <section class="strat-bloc" aria-labelledby="s-legal">
    <h2 id="s-legal">Points de vigilance légaux</h2>
    <ul class="strat-liste">{legal}</ul>
  </section>
  <section class="strat-bloc strat-bloc--double" aria-labelledby="s-fournir">
    <div>
      <h2 id="s-fournir">Informations à fournir</h2>
      <p class="attenue">Signalées dans les pages par {f} ou {c}.</p>
      <ul class="liste-carnet">{fournir}</ul>
    </div>
    <div>
      <h2>Décisions commerciales à valider</h2>
      <p class="attenue">Signalées dans les pages par {v}.</p>
      <ul class="liste-carnet">{valider}</ul>
    </div>
  </section>
  <section class="strat-bloc" aria-labelledby="s-limites">
    <h2 id="s-limites">Limites de la maquette</h2>
    <ul class="liste-carnet">
      <li>Les positions des repères viennent de coordonnées approximatives (à un ou deux kilomètres près) ; le relief est décoratif.</li>
      <li>Chaque fiche ouvre sur deux ou trois phrases factuelles sur le lieu, puis le texte du site actuel corrigé : il reste trop court pour un vrai récit de lieu.</li>
      <li>Le panier vit dans le navigateur ; aucune commande, aucun paiement, aucun envoi de formulaire.</li>
      <li>Les polices viennent de Google Fonts : une connexion internet est nécessaire pour les voir.</li>
      <li>L’aperçu « ta palette » ne change que les couleurs ; le logo reste la signature typographique tant que le SVG manque.</li>
      <li>Repères Aquensis et Jardin Massey : positions indicatives, écartées de quelques pixels sur grand écran pour ne pas masquer la tour des Jacobins et le point de Tarbes.</li>
    </ul>
  </section>
</div>""".format(etiq=etiquette("Note pour Romain"), tend=tend, tech="".join(tech), legal=legal_html,
                 fournir="".join("<li>{}</li>".format(x) for x in fournir), valider="".join("<li>{}</li>".format(x) for x in valider),
                 f=A_FOURNIR, c=A_CONFIRMER, v=A_VALIDER, cc=src("https://cleancommit.io/blog/sticky-add-to-cart-buttons/", "Cleancommit"),
                 idees=idees, pastilles=pastilles, lignes_palette=lignes_palette, lignes_contraste=lignes_contraste, lignes_adapt=lignes_adapt,
                 valider_m=A_VALIDER, fournir_m=A_FOURNIR)
    page("strategie.html", "Stratégie de la version 1 · Terre Gravée",
         "Note pour Romain Fourneaux : concept de la version « Carnet de territoire », ses idées mises en œuvre, sa palette, tendances, techniques de vente sourcées, points légaux et informations à fournir.",
         contenu, classe="page-strategie")


# ---------------------------------------------------------------------------

def main():
    os.makedirs(os.path.join(ICI, "assets"), exist_ok=True)
    donnees_js()
    accueil()
    carte_page()
    collection()
    for p in PLAQUES:
        fiche_plaque(p)
    fiche_led()
    fiche_carte_cadeau()
    sur_mesure()
    contact()
    qr_page()
    strategie()
    print("Pages générées dans", ICI)


if __name__ == "__main__":
    main()
