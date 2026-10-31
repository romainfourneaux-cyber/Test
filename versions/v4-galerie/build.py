#!/usr/bin/env python3
"""Maquette Terre Gravée, version 4 « Galerie de territoire ».

Mélange de la v0 (mur d’exposition, simulation LED, fiches claires) et de la v1 (carte des lieux,
histoire d’Aquensis, texte de chaque lieu), aux couleurs de la charte de Romain.

Génère toutes les pages HTML de ce dossier, ainsi que assets/img/courbes.svg (relief décoratif du mur).
Sources : ../../maquette/data/catalogue.json (produits), ../../maquette/assets/img/ (photos, lues sur place),
data/hautes-pyrenees.json (contour simplifié du département).

Usage, depuis n’importe quel dossier :  python build.py
Compatible Python 3.8, bibliothèque standard uniquement.
"""
import html
import json
import math
import os
import re

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
# Avis neutralisés (réponses du 31 octobre 2026) : les 9 avis du site actuel ne peuvent pas être présentés comme
# des avis de clients vérifiés (Code de la consommation, L121-4 ; sanctions L132-2). La v4 n’en affiche aucun.
# Le catalogue partagé avec les autres maquettes n’est pas modifié : on vide seulement la copie chargée ici.
for _p in CATALOGUE:
    _p["avis"] = []

# Dessins tirés de la planche misc/autres-plaques.webp (recadrés une fois avec Pillow, voir README).
# Le Casque du Lhéris n’est pas annoncé (réponse du 31 octobre 2026) : son dessin reste dans assets/img, sans être affiché.
DESSINS = {
    "la-transhumance": ("assets/img/dessin-la-transhumance.webp", 199, 398),
    "liris": ("assets/img/dessin-liris.webp", 199, 398),  # étape « Dessin » de la page L’atelier
}
for _rel, _w, _h in DESSINS.values():
    assert os.path.exists(os.path.join(ICI, _rel)), "Dessin manquant : " + _rel
# Copie de la planche sans la vignette du Casque du Lhéris (non annoncé) : les vignettes suivantes de la première
# rangée ont été décalées d’un cran avec Pillow, la dernière case reste blanche. Dix-sept dessins.
PLANCHE = ("assets/img/planche-dessins-inedits.webp", 1400, 1258)
assert os.path.exists(os.path.join(ICI, PLANCHE[0])), "Planche manquante : " + PLANCHE[0]

COLLECTIONS = {
    "paysages": ("Paysages", "Sommets, cols et cirques"),
    "patrimoine": ("Patrimoine", "Tour, château et abbaye"),
    "faune": ("Faune", "Les animaux des Pyrénées"),
    "accessoires": ("Accessoires", "Kit LED et carte cadeau"),
}
FINITIONS = [("noir", "Noir", "noire"), ("gris", "Gris", "grise"), ("dore", "Doré", "dorée")]
NOM_FIN = {f: n for f, n, _ in FINITIONS}
ACC_FIN = {f: a for f, _, a in FINITIONS}
LED_COULEURS = [("Blanc chaud", "#FFD39A"), ("Bleu", "#5AB0FF"), ("Vert", "#63E58F"), ("Violet", "#B48CFF"), ("Orange", "#FF8A57")]
POSITIONS_CABLE = ["Bas gauche", "Bas droite", "Haut gauche", "Haut droite"]
FAUNE = ["lisard", "lours", "le-cerf", "la-marmotte"]


# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

def e(t):
    return html.escape(str(t), quote=True)


def euros(n):
    return "{} €".format(n)


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
    if eager == "haute":
        return 'fetchpriority="high"'
    if eager:
        return 'loading="eager"'
    return 'loading="lazy"'


def img(rel, alt, sizes="", cls="", eager=False, srcset=""):
    """Image du catalogue avec ses dimensions réelles."""
    w, h = dims(rel)
    c = ' class="{}"'.format(cls) if cls else ""
    ss = ' srcset="{}" sizes="{}"'.format(srcset, sizes) if srcset else ""
    return '<img{c} src="{src}"{ss} width="{w}" height="{h}" alt="{a}" {ch} decoding="async">'.format(
        c=c, src=IMG + rel, ss=ss, w=w, h=h, a=e(alt), ch=chargement(eager))


def img_plaque(p, fin, sizes, eager=False, alt=None):
    rel = "p/{}-{}-440.webp".format(p["slug"], fin)
    w, h = dims(rel)
    alt = alt if alt is not None else "Plaque {}, finition {}".format(p["nom"], ACC_FIN[fin])
    return '<img src="{src}" srcset="{ss}" sizes="{s}" width="{w}" height="{h}" alt="{a}" {ch} decoding="async">'.format(
        src=IMG + rel, ss=srcset_plaque(p["slug"], fin), s=sizes, w=w, h=h, a=e(alt), ch=chargement(eager))


def plaque(p, fin, sizes, cls="", eager=False, alt=None):
    return '<div class="plaque {}">{}</div>'.format(cls, img_plaque(p, fin, sizes, eager, alt)).replace('class="plaque "', 'class="plaque"')


def dessin(slug, alt, cls="dessin"):
    rel, w, h = DESSINS[slug]
    return '<div class="{}"><img src="{}" width="{}" height="{}" alt="{}" loading="lazy" decoding="async"></div>'.format(cls, rel, w, h, e(alt))


def planche(alt, sizes=""):
    rel, w, h = PLANCHE
    ss = ' sizes="{}"'.format(sizes) if sizes else ""
    return '<img src="{}"{} width="{}" height="{}" alt="{}" loading="lazy" decoding="async">'.format(rel, ss, w, h, e(alt))


def note(texte, sorte="manque"):
    """Marqueur visible pour Romain : « manque » (à fournir, à confirmer, à relire) ou « decision » (à valider)."""
    return '<span class="note note--{}">{}</span>'.format(sorte, e(texte))


A_FOURNIR = note("à fournir")
TELEPHONE = '<a href="tel:+33642572810">06\u00a042\u00a057\u00a028\u00a010</a>'
A_CONFIRMER = note("à confirmer")
A_VALIDER = note("proposition à valider", "decision")
# Annonce validée le 31 octobre 2026 : simple étiquette, sans marqueur de décision
A_PREPARATION = '<span class="etiquette-prep">En préparation</span>'
MEDIATEUR = note("médiateur à fournir")

# Livraison (réponses du 31 octobre 2026). Le tarif de 5 € vaut, par hypothèse, pour les trois modes.
ZONE_LIVRAISON = "France métropolitaine, hors Corse"
MODES_LIVRAISON = "Colissimo en point retrait, Mondial Relay en point relais ou Chronopost"
EXPEDITION = "Expédition sous 2 à 4 jours ouvrés"
NOEL = "Pour recevoir votre plaque avant Noël, commandez au plus tard le lundi 14 décembre 2026."
# Offre de fin d’année : dates proposées par la maquette, pas encore confirmées par Romain (même période dans galerie.js)
OFFRE = "Livraison offerte du vendredi 27 novembre au lundi 14 décembre 2026 inclus"
# Mention courte de l’offre près des boutons (le panier passe à 0 € sur la même période, galerie.js)
OFFRE_COURT = "offerte du 27 novembre au 14 décembre 2026 " + note("dates à confirmer")
# La formule « rayon de 150 km » est gardée ; la ville au centre reste à choisir
RAYON = "Découpe, laquage et expédition dans un rayon de 150 km"
# Promotion de Noël mise en avant sur toutes les pages (demande du 31 octobre 2026).
# Quatre états, choisis par galerie.js en heure locale : « avant » le 27 novembre, « pendant » l’offre (jusqu’au 14 décembre inclus),
# « apres » (du 15 au 24 décembre : la carte cadeau prend le relais), « fini » (à partir du 25 décembre : plus rien).
# Sans JavaScript, seule la variante « neutre » s’affiche : un texte juste avant l’offre.
DATES_NOEL = note("dates à confirmer")
LIMITE_NOEL = "Commandez au plus tard le 14 décembre pour recevoir avant Noël."
# Les quatre « coups de cœur », la carte cadeau et le kit LED : le filtre « Idées cadeaux » de la collection
IDEES_CADEAUX = ("le-pic-du-midi", "lours", "lisard", "le-cerf", "carte-cadeau", "led")


def selon(etats, html, balise="span", cls=""):
    """Variante datée du texte de Noël : visible sans JavaScript seulement si « neutre » figure dans les états."""
    return '<{b}{c} data-noel-quand="{e}"{h}>{t}</{b}>'.format(
        b=balise, c=' class="{}"'.format(cls) if cls else "", e=etats, h="" if "neutre" in etats.split() else " hidden", t=html)


# Ligne « Livraison » des garanties (fiches, collection) : elle suit l’état de l’offre comme le panier
LIVRAISON_COURT = (selon("neutre avant", "5 € par commande (" + OFFRE_COURT + ")")
                   + selon("pendant", "Offerte jusqu’au 14 décembre 2026 " + DATES_NOEL + ", puis 5 € par commande")
                   + selon("apres fini", "5 € par commande")
                   + ", en " + ZONE_LIVRAISON + ". " + EXPEDITION)


def cartel(p):
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return "{} · <i>{}</i>".format(e(lieu), e(detail))
    return "{} · {}".format(e(lieu), e(detail))


def cartel_court(p):
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return "<i>{}</i>".format(e(detail))
    if detail.endswith(" m"):
        return "{} · {}".format(e(lieu.replace("Pic du Midi de Bigorre", "Pic du Midi")), e(detail))
    return e(lieu)


# ---------------------------------------------------------------------------
# Textes du catalogue : corrections avant affichage (reprises de la v1)
# Chaque ancien texte doit exister : si le catalogue change, le script s’arrête.
# ---------------------------------------------------------------------------
CORRECTIONS = {
    "le-tourmalet": [
        ("Mythique. Sauvage. Intemporel. Le col du Tourmalet, haut lieu des exploits cyclistes, s’invite chez vous avec cette plaque élégante et racée. Chaque ligne évoque l’ascension, la sueur, la légende. Un clin d’œil discret et puissant à l’histoire du sport et à l’audace humaine. Idéal pour les passionnés de vélo, de défis et d’horizons sans fin.",
         "Le col du Tourmalet, haut lieu des exploits cyclistes, s’invite chez vous. Chaque ligne de la plaque évoque l’ascension, la sueur, la légende. Pour les passionnés de vélo et de défis."),
    ],
    "le-cirque-de-gavarnie": [
        ("Offrez à votre intérieur une évasion vertigineuse. ", ""),
        ("Notre plaque “Gavarnie” capture la majesté du cirque le plus emblématique des Pyrénées, là où la nature sculpte la montagne avec grâce et puissance.",
         "Notre plaque « Gavarnie » représente le cirque le plus emblématique des Pyrénées."),
        ("Découpée avec précision dans du métal brut, cette œuvre est un hommage à l’inaccessible beauté du massif.",
         "Elle est découpée au laser dans l’aluminium, puis thermolaquée."),
        (" Un must pour les amoureux de paysages spectaculaires.", " Pour les amoureux de grands paysages."),
        # l’UNESCO est déjà cité dans « Le lieu », juste à côté
        (" Une création unique inspirée d’un site classé au patrimoine mondial de l’UNESCO.", ""),
    ],
    "le-pont-despagne": [
        ("Torrent, cascade, forêt, et pierre: le Pont", "Torrent, cascade, forêt et pierre : le Pont"),
    ],
    "le-chateau-de-mauvezin": [
        ("l’âme des baronnies", "l’âme des Baronnies"),
    ],
    "lours": [
        ("Puissant. Rare. Mystérieux. L’ours est plus qu’un animal : c’est un totem, une force ancienne qui hante les forêts pyrénéennes. Cette plaque lui rend hommage avec une découpe brute.",
         "Cette plaque rend hommage à l’ours des forêts pyrénéennes, avec une découpe franche."),
        ("symbole de résilience et de lien à la nature sauvage", "symbole du lien à la nature sauvage"),
    ],
    "le-cerf": [
        ("Vous cherchez une décoration qui a du caractère et une histoire ? Découvrez notre plaque « Le Cerf », une création qui capture toute la majesté de cet animal mythique, symbole de force, liberté et élégance.",
         "La plaque « Le Cerf » rend hommage à l’animal des forêts pyrénéennes, symbole de force et de liberté."),
        ("Imaginez cette silhouette découpée avec précision dans de l’aluminium exposée sur votre mur, dans votre salon, votre bureau ou votre extérieur… Chaque regard porté sur elle vous rappellera l’esprit des forêts sauvages.",
         "Sa silhouette est découpée au laser dans l’aluminium. Elle trouve sa place dans un salon, un bureau ou dehors."),
    ],
    "la-marmotte": [
        # « Le lieu » dit déjà où vit la marmotte : pas de redite ici
        ("Curieuse, paisible et familière, la marmotte est le sourire des montagnes. Cette plaque apporte",
         "Cette plaque célèbre la marmotte, curieuse, paisible et familière. Elle apporte"),
        ("sa bonhomie légendaire", "sa bonhomie"),
        ("Un clin d’œil à la vie paisible des sommets.", "Un clin d’œil à la vie des sommets."),
    ],
    "le-pic-du-midi": [
        (" Cette plaque en métal en capture toute la majesté : silhouette élancée, isolement saisissant, et aura presque mystique. Symbole d’observation, de science et de contemplation, il relie la terre aux étoiles, les hommes à l’infini. Une création puissante, pour celles",
         " Pour celles"),
    ],
    "le-montaigu": [
        # « emblématique » contredisait « sommets moins connus » ; « Le lieu » le dit déjà moins connu que son voisin
        ("Élancé, emblématique, le Montaigu domine la plaine de sa présence tranquille. Notre création en révèle les lignes douces, presque graphiques, dans un design sobre et captivant.",
         "La plaque révèle les lignes douces du Montaigu, presque graphiques, dans un dessin sobre."),
        (" Pour les amateurs de sommets moins connus, mais tout aussi majestueux.", ""),
    ],
    "la-tour-des-jacobins": [
        # « seul vestige d’un ancien couvent » figure déjà dans « Le lieu »
        ("Seul vestige d’un ancien couvent, elle défie le temps avec élégance, racontant à elle seule l’histoire religieuse et architecturale de la ville thermale. ", ""),
        (" et de patrimoine vivant.", " et de patrimoine."),
    ],
}


def histoire(p):
    paras = list(p["histoire"])
    for ancien, nouveau in CORRECTIONS.get(p["slug"], []):
        trouve = [i for i, x in enumerate(paras) if ancien in x]
        assert trouve, "Correction introuvable pour {} : {}".format(p["slug"], ancien[:40])
        for i in trouve:
            paras[i] = paras[i].replace(ancien, nouveau)
    return paras


# Deux ou trois phrases factuelles par lieu ou animal (reprises de la v1) : faits publics, jamais sur la marque.
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
# Géographie (positions indicatives)
# ---------------------------------------------------------------------------
# slug : (lat, lon, côté de l’étiquette, décalage x et y en pixels sur une grande carte, puis sur une petite carte)
# Numérotés du nord au sud. Quand deux repères sont à moins de 3 km, l’un est écarté de quelques pixels et un trait
# le relie à sa position. La petite carte (moins de 500 px de large : téléphone, aperçu de l’accueil) a ses propres écarts,
# réglés pour garder au moins 26 px entre deux centres à 320 px d’écran et 30 px dès 360 px.
LIEUX = {
    "le-chateau-de-mauvezin": (43.12, 0.27, "d", 12, -14, 14, -18),
    "labbaye-de-lescaladieu": (43.110, 0.257, "d", -12, 6, 1, 5),
    "la-tour-des-jacobins": (43.065, 0.149, "g", -2, -2, 0, -15),
    "le-montaigu": (42.984, 0.069, "g", 0, 0, -7, 4),
    "le-pic-du-midi": (42.937, 0.142, "d", 0, -7, 2, -9),
    "le-tourmalet": (42.909, 0.145, "d", 0, 9, 0, 11),
    "le-pont-despagne": (42.854, -0.141, "d", 0, 0, 0, 0),
    "le-cirque-de-gavarnie": (42.695, -0.010, "d", 0, 0, 0, 0),
}
ORDRE_LIEUX = sorted(LIEUX, key=lambda s: -LIEUX[s][0])
NUMERO = {s: i + 1 for i, s in enumerate(ORDRE_LIEUX)}
# Le décor d’origine à Aquensis, centre thermal de Bagnères-de-Bigorre : on y voit les dessins en grand, pas les plaques vendues
AQUENSIS = (43.063, 0.146, "g", -22, 20, -23, 6)
# L’adresse de l’entreprise : 16 rue du Pic du Midi, Gerde. Pas d’accueil du public (réponse du 31 octobre 2026) :
# aucun repère sur la carte, la position ne sert qu’au calcul des distances ci-dessous.
GERDE = (43.055, 0.168)
# Modèles annoncés (réponse du 31 octobre 2026) et placés sur la carte : repères en pointillé.
# La Transhumance n’est pas attachée à un lieu ; Le Casque du Lhéris n’est pas annoncé.
BIENTOT = {
    "le-jardin-massey": {
        "nom": "Le Jardin Massey", "pos": (43.236, 0.074, "d", 0, 0, 0, 0),
        "lieu": "Tarbes · parc paysager",
        "texte": "Un parc paysager au cœur de Tarbes, légué à la ville par le botaniste Placide Massey. Pas encore de dessin à montrer.",
    },
}
VILLES = [("Tarbes", 43.233, 0.078, "g"), ("Lourdes", 43.095, -0.046, "g")]
REVEL = (43.458, 2.004)


def km(a, b):
    r = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(d))


KM_REVEL = int(round(km(GERDE, REVEL) / 5.0) * 5)
# Villes qui rendraient vraie la formule « rayon de 150 km » (Revel et Gerde à moins de 150 km), pour les notes
CENTRES_150 = [("Saint-Gaudens", (43.108, 0.723)), ("Lannemezan", (43.125, 0.384))]

# Cadre : tout le département, projection équirectangulaire (1000 unités par degré de latitude)
LAT_MAX, LAT_MIN, LON_MIN, LON_MAX = 43.625, 42.655, -0.345, 0.665
K = math.cos(math.radians((LAT_MAX + LAT_MIN) / 2))
S = 1000.0
VB_W = int(round((LON_MAX - LON_MIN) * K * S))
VB_H = int(round((LAT_MAX - LAT_MIN) * S))


def proj(lat, lon):
    return ((lon - LON_MIN) * K * S, (LAT_MAX - lat) * S)


def pc(lat, lon):
    x, y = proj(lat, lon)
    return 100.0 * x / VB_W, 100.0 * y / VB_H


def douglas(pts, tol):
    if len(pts) < 3:
        return list(pts)
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    l = math.hypot(dx, dy) or 1e-9
    imax, dmax = 0, -1.0
    ferme = math.hypot(dx, dy) < 1e-9
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = math.hypot(x - x1, y - y1) if ferme else abs(dy * x - dx * y + x2 * y1 - y2 * x1) / l
        if d > dmax:
            imax, dmax = i, d
    if dmax > tol:
        return douglas(pts[:imax + 1], tol)[:-1] + douglas(pts[imax:], tol)
    return [pts[0], pts[-1]]


# Format des chemins SVG : « x, y » pour un point, « L » entre deux points. Deux nombres voisins restent ainsi
# toujours séparés par une lettre ou par une virgule suivie d’une espace, jamais collés en une seule suite de chiffres.
def points_svg(pts):
    return "L".join("{:.0f}, {:.0f}".format(x, y) for x, y in pts)


def chemin_contour(tol):
    morceaux = []
    for poly in CONTOUR["polygones"]:
        pts = douglas([proj(lat, lon) for lon, lat in poly], tol)
        morceaux.append("M" + points_svg(pts) + "Z")
    return "".join(morceaux)


CONTOUR_D = chemin_contour(1.2)
CONTOUR_PETIT = chemin_contour(4.0)

# --- Relief décoratif : courbes de niveau calculées une fois (marching squares), sans valeur topographique ---
PICS = [
    (42.774, -0.147, 3298, 8), (42.839, -0.290, 3144, 7), (42.695, 0.030, 3248, 8), (42.672, -0.060, 3100, 7),
    (42.846, 0.115, 3091, 6), (42.800, 0.100, 3192, 6), (42.937, 0.142, 2877, 4.5), (42.880, 0.270, 2831, 6),
    (42.984, 0.069, 2339, 3.5), (42.950, -0.130, 2334, 5), (42.750, 0.250, 2800, 7), (42.720, 0.400, 2900, 7),
    (42.800, 0.450, 2500, 7), (42.900, -0.250, 2650, 6), (42.860, -0.050, 2650, 5), (42.990, 0.270, 1700, 6),
    (43.010, -0.020, 1300, 5), (42.700, -0.250, 2900, 8), (42.880, 0.420, 2200, 6),
]
RIVIERES = [
    [(42.912, 0.170), (42.937, 0.215), (42.985, 0.228), (43.016, 0.178), (43.066, 0.150), (43.085, 0.137),
     (43.125, 0.110), (43.180, 0.090), (43.233, 0.075), (43.300, 0.062), (43.386, 0.054), (43.62, 0.05)],
    [(42.690, 0.004), (42.735, -0.009), (42.787, 0.020), (42.840, 0.006), (42.872, -0.003), (42.930, -0.050),
     (42.958, -0.075), (43.003, -0.099), (43.050, -0.080), (43.095, -0.046), (43.108, -0.100), (43.104, -0.159),
     (43.127, -0.212), (43.160, -0.300), (43.20, -0.40)],
    [(42.854, -0.141), (42.889, -0.114), (42.925, -0.095), (42.958, -0.075)],
    [(42.760, 0.290), (42.817, 0.322), (42.905, 0.357), (42.962, 0.380), (43.020, 0.400), (43.070, 0.450),
     (43.090, 0.500), (43.087, 0.567), (43.080, 0.640), (43.07, 0.75)],
]
KX = 111.32 * math.cos(math.radians(43))
KY = 111.2
RIV_KM = [[(lo * KX, la * KY) for la, lo in r] for r in RIVIERES]


def _lisse(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def _hash(i, j):
    h = math.sin(i * 127.1 + j * 311.7) * 43758.5453
    return h - math.floor(h)


def _bruit(x, y):
    i, j = math.floor(x), math.floor(y)
    fx, fy = x - i, y - j
    a, b, c, d = _hash(i, j), _hash(i + 1, j), _hash(i, j + 1), _hash(i + 1, j + 1)
    ux, uy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy


def _fbm(x, y):
    return 0.55 * _bruit(x, y) + 0.3 * _bruit(x * 2.1 + 5.2, y * 2.1 + 1.3) + 0.15 * _bruit(x * 4.3 + 9.1, y * 4.3 + 3.7)


def _dseg(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    l = dx * dx + dy * dy
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / l)) if l else 0.0
    qx, qy = ax + t * dx - px, ay + t * dy - py
    return math.sqrt(qx * qx + qy * qy)


def altitude(lat, lon):
    x, y = lon * KX, lat * KY
    massif = _lisse(43.09, 42.86, lat)
    alt = 230 + 260 * _lisse(43.42, 43.12, lat) + 650 * massif
    hauts = []
    for la, lo, h, s in PICS:
        px, py = (lon - lo) * KX, (lat - la) * KY
        hauts.append((h - 1000) * 0.85 * math.exp(-(px * px + py * py) / (2 * s * s)))
    hauts.sort(reverse=True)
    alt += hauts[0] + 0.35 * hauts[1] + 0.15 * hauts[2]
    dmin = 99.0
    for r in RIV_KM:
        for k in range(len(r) - 1):
            dd = _dseg(x, y, r[k][0], r[k][1], r[k + 1][0], r[k + 1][1])
            if dd < dmin:
                dmin = dd
    alt -= (180 + 620 * massif) * math.exp(-(dmin * dmin) / (2 * 1.9 * 1.9))
    alt += (70 + 300 * massif) * (_fbm(x / 7.5, y / 7.5) - 0.5) * 2
    return alt


def courbes(fonction, w, h, nx, ny, niveaux, fort, tol=1.2):
    """Courbes de niveau d’un champ fonction(x, y) sur [0, w] × [0, h] : deux chemins SVG (fines, fortes)."""
    sx, sy = w / (nx - 1), h / (ny - 1)
    v = [[fonction(i * sx, j * sy) for i in range(nx)] for j in range(ny)]
    fines, fortes = [], []
    for niv in niveaux:
        segs = []
        for j in range(ny - 1):
            for i in range(nx - 1):
                a, b, c, d = v[j][i], v[j][i + 1], v[j + 1][i + 1], v[j + 1][i]
                cas = (8 if a >= niv else 0) | (4 if b >= niv else 0) | (2 if c >= niv else 0) | (1 if d >= niv else 0)
                if cas in (0, 15):
                    continue
                X, Y = i * sx, j * sy
                ph = (round(X + sx * (niv - a) / (b - a), 2), round(Y, 2)) if b != a else None
                pd = (round(X + sx, 2), round(Y + sy * (niv - b) / (c - b), 2)) if c != b else None
                pb = (round(X + sx * (niv - d) / (c - d), 2), round(Y + sy, 2)) if c != d else None
                pg = (round(X, 2), round(Y + sy * (niv - a) / (d - a), 2)) if d != a else None
                paires = {1: [(pg, pb)], 14: [(pg, pb)], 2: [(pb, pd)], 13: [(pb, pd)], 3: [(pg, pd)], 12: [(pg, pd)],
                          4: [(ph, pd)], 11: [(ph, pd)], 5: [(pg, ph), (pb, pd)], 6: [(ph, pb)], 9: [(ph, pb)],
                          7: [(pg, ph)], 8: [(pg, ph)], 10: [(pg, pb), (ph, pd)]}[cas]
                segs.extend(s for s in paires if s[0] and s[1])
        (fortes if niv % fort == 0 else fines).extend(_chainer(segs))

    def chemin(lignes):
        sortie = []
        for ligne in lignes:
            if len(ligne) < 3:
                continue
            pts = douglas(ligne, tol)
            sortie.append("M" + points_svg(pts))
        return "".join(sortie)
    return chemin(fines), chemin(fortes)


def _chainer(segs):
    adj = {}
    for k, (p, q) in enumerate(segs):
        adj.setdefault(p, []).append(k)
        adj.setdefault(q, []).append(k)
    vu = [False] * len(segs)
    lignes = []
    for k in range(len(segs)):
        if vu[k]:
            continue
        vu[k] = True
        ligne = list(segs[k])
        for sens in (1, 0):
            while True:
                bout = ligne[-1] if sens else ligne[0]
                suite = next((m for m in adj.get(bout, []) if not vu[m]), None)
                if suite is None:
                    break
                vu[suite] = True
                a, b = segs[suite]
                autre = b if a == bout else a
                if sens:
                    ligne.append(autre)
                else:
                    ligne.insert(0, autre)
        lignes.append(ligne)
    return lignes


def _alt_carte(x, y):
    return altitude(LAT_MAX - y / S, LON_MIN + x / (K * S))


TOPO_FIN, TOPO_FORT = courbes(_alt_carte, VB_W, VB_H, 150, 197, list(range(300, 3400, 150)), 750)


def svg_courbes_mur():
    """Fichier assets/img/courbes.svg : courbes du massif du Pic du Midi, en fond très léger du mur d’exposition."""
    la0, la1, lo0, lo1 = 43.06, 42.84, -0.02, 0.33
    w, h = 1200, 860

    def f(x, y):
        return altitude(la0 + (la1 - la0) * y / h, lo0 + (lo1 - lo0) * x / w)
    fin, fort = courbes(f, w, h, 140, 101, list(range(500, 3100, 100)), 500, tol=1.6)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice">'
           '<g fill="none" stroke="#8C8272" stroke-linejoin="round"><path d="{fin}" stroke-width="1.1"/>'
           '<path d="{fort}" stroke-width="2"/></g></svg>').format(w=w, h=h, fin=fin, fort=fort)
    with open(os.path.join(ICI, "assets", "img", "courbes.svg"), "w", encoding="utf-8") as fichier:
        fichier.write(svg)


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
    t = re.sub(r"(\d) (€|m|km|cm|mm|jours|%|Mo|plaques|avis|lieux|modèles|niches|illustrations|animaux|étapes|ans|e)(?![\wÀ-ÿ])", r"\1" + NBSP + r"\2", t)
    t = t.replace(" × ", NBSP + "×" + NBSP)
    t = t.replace("N° ", "N°" + NBSP).replace("art. ", "art." + NBSP)
    return t


def typo_attributs(balise):
    return re.sub(r'((?:content|alt|aria-label|title)=")([^"]*)(")', lambda m: m.group(1) + typo_texte(m.group(2)) + m.group(3), balise)


def typo(doc):
    morceaux = re.split(r"(<script.*?</script>|<style.*?</style>|<[^>]+>)", doc, flags=re.S)
    sortie = []
    for m in morceaux:
        if m.startswith("<script") or m.startswith("<style"):
            sortie.append(m)
        elif m.startswith("<"):
            sortie.append(typo_attributs(m) if ('name="description"' in m or "alt=" in m or "aria-label=" in m or "title=" in m) else m)
        else:
            sortie.append(typo_texte(m))
    return "".join(sortie)


# ---------------------------------------------------------------------------
# Gabarit commun
# ---------------------------------------------------------------------------
NAV = [("collection.html", "Collection"), ("carte.html", "Carte"), ("atelier.html", "L’atelier"),
       ("sur-mesure.html", "Sur mesure"), ("contact.html", "Contact")]
POLICES = ("https://fonts.googleapis.com/css2?family=Allerta+Stencil&family=Barlow+Semi+Condensed:ital,wght@0,500;0,600;1,500"
           "&family=Jost:ital,wght@0,400;0,500;0,600;1,400&family=Marcellus&display=swap")
# Le logo au coq de Romain (réponse du 31 octobre 2026) : l’emblème dans l’en-tête, à côté du nom au pochoir
# (texte alternatif vide : l’image est décorative, le nom est écrit) ; le logo complet dans le pied de page.
EMBLEME = '<img class="marque__embleme" src="assets/img/logo-embleme.webp" width="274" height="192" alt="">'
LOGO_COMPLET = ('<img class="pied__logo" src="assets/img/logo-complet.webp" width="560" height="329" '
                'alt="Terre Gravée, graver l’âme des territoires" loading="lazy" decoding="async">')


def marque():
    return '<a class="marque" href="index.html">{}<span class="marque__nom">TERRE GRAVÉE</span></a>'.format(EMBLEME)


def entete(actif):
    liens = "".join('<a href="{}"{}>{}</a>'.format(h, ' aria-current="page"' if h == actif else "", n) for h, n in NAV)
    return """<header class="entete">
  <div class="wrap entete__ligne">
    {marque}
    <nav class="nav" id="nav-principale" aria-label="Navigation principale">{liens}</nav>
    <button type="button" class="bouton-icone bouton-panier" data-ouvrir-panier aria-label="Ouvrir le panier">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      <span class="bouton-panier__texte">Panier</span><span class="compteur">0</span>
    </button>
    <button type="button" class="bouton-icone bouton-menu" aria-expanded="false" aria-controls="nav-principale">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5"/></svg>
      <span class="visuellement-cache">Menu</span>
    </button>
  </div>
</header>""".format(marque=marque(), liens=liens)


def pied():
    return """<footer class="pied">
  <div class="wrap">
    <div class="pied__grille">
      <div class="pied__marque">
        <a class="pied__logo-lien" href="index.html">{logo}</a>
        <p>Romain Fourneaux EI<br>16 rue du Pic du Midi, 65200 Gerde<br><a href="contact.html">contact@terregravee.fr</a><br>Téléphone : {tel}</p>
      </div>
      <div>
        <h2>Collection</h2>
        <ul>
          <li><a href="collection.html#paysages">Paysages</a></li>
          <li><a href="collection.html#patrimoine">Patrimoine</a></li>
          <li><a href="collection.html#faune">Faune</a></li>
          <li><a href="produit-led.html">Kit LED</a></li>
          <li><a href="produit-carte-cadeau.html">Carte cadeau</a></li>
        </ul>
      </div>
      <div>
        <h2>Commander</h2>
        <ul>
          <li><a href="installation.html">Installation et kit LED</a></li>
          <li><a href="contact.html#livraison">Livraison et retours</a></li>
          <li><a class="pied__retractation" href="contact.html#retractation">Renoncer au contrat ici</a></li>
          <li><a href="{site}/cgv/">Conditions générales de vente</a></li>
          <li><a href="{site}/politique/">Mentions légales et confidentialité</a></li>
        </ul>
      </div>
      <div>
        <h2>L’atelier</h2>
        <ul>
          <li><a href="carte.html">La carte des lieux</a></li>
          <li><a href="atelier.html#origine">L’histoire d’Aquensis</a></li>
          <li><a href="atelier.html#politique-avis">Politique des avis</a></li>
          <li><a href="index.html#lettre">Lettre d’information</a></li>
        </ul>
      </div>
    </div>
    <div class="pied__bas">
      <p>© 2026 Terre Gravée · Romain Fourneaux EI, micro-entreprise · SIRET 941 234 270 00010</p>
      <p>Médiateur de la consommation : {mediateur}</p>
      <p>Prix TTC, TVA non applicable (art. 293 B du CGI) · Photos : Romain Fourneaux</p>
    </div>
  </div>
</footer>""".format(logo=LOGO_COMPLET, site=SITE, tel=TELEPHONE, mediateur=MEDIATEUR)


def bandeau_noel(accueil=False):
    """Bandeau de Noël sous le bandeau de la maquette, sur toutes les pages : très contrasté, sans compte à rebours ni urgence."""
    offre = (selon("neutre", "Du 27 novembre au 14 décembre : livraison offerte", "strong")
             + selon("avant", "À partir du 27 novembre : livraison offerte, jusqu’au 14 décembre", "strong")
             + selon("pendant", "Livraison offerte jusqu’au 14 décembre", "strong")
             + selon("apres", "La carte cadeau, envoyée par e-mail", "strong"))
    limite = (selon("neutre avant pendant", "{} {}".format(LIMITE_NOEL, DATES_NOEL))
              + selon("apres", "Une plaque au choix, sans frais de port : pour offrir même après la date limite d’envoi."))
    actions = ('<a class="bandeau-noel__action" href="{}" data-noel-quand="neutre avant pendant">Idées cadeaux</a>'.format("#noel" if accueil else "index.html#noel")
               + '<a class="bandeau-noel__action" href="produit-carte-cadeau.html" data-noel-quand="apres" hidden>La carte cadeau</a>')
    return """<aside class="bandeau-noel" aria-label="Noël" data-noel-quand="neutre avant pendant apres">
  <div class="wrap bandeau-noel__ligne">
    <p class="bandeau-noel__titre">Noël</p>
    <div class="bandeau-noel__texte"><p class="bandeau-noel__offre">{offre}</p><p class="bandeau-noel__limite">{limite}</p></div>
    {actions}
  </div>
</aside>""".format(offre=offre, limite=limite, actions=actions)


def encart_noel(carte=False):
    """Encart de Noël près du bouton d’achat. Plaques : offre et date limite ; carte cadeau : pas de frais de port, envoi par e-mail."""
    if carte:
        corps = ('<div class="encart-noel__corps"><p><strong>Pas de frais de port : la carte est envoyée par e-mail</strong>, ou à imprimer chez vous. '
                 "Une idée pour Noël, même après la date limite d’envoi des plaques.</p></div>")
    else:
        corps = ("<p>"
                 + selon("neutre", "Livraison offerte du 27 novembre au 14 décembre.", "strong")
                 + selon("avant", "À partir du 27 novembre, livraison offerte jusqu’au 14 décembre.", "strong")
                 + selon("pendant", "Livraison offerte jusqu’au 14 décembre.", "strong")
                 + " " + selon("avant", "Aujourd’hui, elle coûte encore 5 €.")
                 + "</p><p>{} {}</p>".format(LIMITE_NOEL, DATES_NOEL))
        corps = selon("neutre avant pendant", corps, "div", "encart-noel__corps") + selon(
            "apres", "<p>Trop tard pour recevoir une plaque avant Noël ? <a href=\"produit-carte-cadeau.html\">La carte cadeau</a>, "
            "envoyée par e-mail, sans frais de port.</p>", "div", "encart-noel__corps")
    # Masqué à partir du 25 décembre (état « fini »)
    return """<aside class="encart-noel" aria-label="Noël" data-noel-quand="neutre avant pendant apres">
  <p class="encart-noel__titre">Noël</p>
  {corps}
</aside>""".format(corps=corps)


def panier_noel():
    """Rappel de Noël dans le tiroir du panier : avant l’offre, le client paie 5 € aujourd’hui ; pendant, la livraison est offerte."""
    return """<div class="encart-noel encart-noel--panier" data-noel-quand="neutre avant pendant">
      <p class="encart-noel__titre">Noël</p>
      <div class="encart-noel__corps">
        {neutre}{avant}{pendant}
        <p>Pour recevoir avant Noël, commandez au plus tard le lundi 14 décembre 2026. {dates}</p>
      </div>
    </div>""".format(
        neutre=selon("neutre", "<strong>Livraison offerte du 27 novembre au 14 décembre.</strong>", "p"),
        avant=selon("avant", "<strong>La livraison sera offerte à partir du 27 novembre.</strong> Aujourd’hui, elle coûte 5 € par commande.", "p"),
        pendant=selon("pendant", "<strong>Livraison offerte jusqu’au 14 décembre inclus.</strong>", "p"), dates=DATES_NOEL)


PAGES_ECRITES = []


def page(fichier, titre, description, contenu, actif=None, jsonld=None, classe=""):
    donnees = ""
    if jsonld:
        donnees = '<script type="application/ld+json">' + json.dumps(jsonld, ensure_ascii=False) + "</script>"
    sortie = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titre}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{polices}">
<link rel="stylesheet" href="assets/galerie.css">
{donnees}
</head>
<body class="{classe}">
<a class="lien-evitement" href="#contenu">Aller au contenu</a>
<div class="bandeau-maquette">
  <div class="wrap bandeau-maquette__ligne">
    <p>Maquette version 4 · brouillon non publié · paiements désactivés</p>
    <p class="bandeau-maquette__liens"><button type="button" class="apercu-noel" data-apercu-noel aria-pressed="false" hidden><span class="apercu-noel__voyant" aria-hidden="true"></span>Voir pendant l’offre de Noël</button><a href="notes.html">Notes de la maquette</a><a href="../index.html">Comparer les versions</a></p>
  </div>
</div>
{noel}
{entete}
<main id="contenu" tabindex="-1">
{contenu}
</main>
{pied}
<div class="voile" data-fermer-panier></div>
<div class="tiroir" role="dialog" aria-modal="true" aria-labelledby="titre-panier" aria-hidden="true" inert>
  <div class="tiroir__haut"><h2 id="titre-panier">Panier</h2><button type="button" class="bouton-icone tiroir__fermer" data-fermer-panier>Fermer</button></div>
  <ul class="tiroir__liste"></ul>
  <div class="tiroir__bas">
    <dl class="tiroir__montants">
      <div><dt>Sous-total</dt><dd data-sous-total>0 €</dd></div>
      <div><dt>Livraison</dt><dd data-livraison>5 €</dd></div>
      <div class="tiroir__total"><dt>Total TTC</dt><dd><strong data-total>0 €</strong></dd></div>
    </dl>
    {panier_noel}
    <p data-livraison-normale>Livraison : 5 € par commande, quel que soit le nombre d’articles. Aucuns frais pour une carte cadeau seule, envoyée par e-mail.</p>
    <p>{zone}, en {modes}. {expedition}.</p>
    <button type="button" class="btn btn--plein" disabled aria-describedby="commande-desactivee">Commander</button>
    <p id="commande-desactivee">Maquette : la commande et le paiement sont désactivés. Le panier reste dans ce navigateur.</p>
  </div>
</div>
<div class="toast" role="status" aria-live="polite"><span class="toast__texte"></span><button type="button" data-ouvrir-panier>Voir le panier</button></div>
<script src="assets/galerie.js"></script>
</body>
</html>
""".format(titre=e(titre), desc=e(description), polices=POLICES.replace("&", "&amp;"), donnees=donnees, classe=classe,
           noel=bandeau_noel(fichier == "index.html"), panier_noel=panier_noel(), entete=entete(actif), contenu=contenu, pied=pied(), zone=ZONE_LIVRAISON, modes=MODES_LIVRAISON, expedition=EXPEDITION)
    with open(os.path.join(ICI, fichier), "w", encoding="utf-8") as f:
        f.write(typo(sortie))
    PAGES_ECRITES.append(fichier)


# ---------------------------------------------------------------------------
# Composants
# ---------------------------------------------------------------------------

def reperes():
    return """<section class="reperes" aria-label="Nos repères">
  <div class="wrap"><ul>
    <li><strong>150 km</strong><span>{rayon} {ref}</span></li>
    <li><strong>Laser</strong><span>Aluminium découpé au laser puis thermolaqué, en Occitanie.</span></li>
    <li><strong>0 perçage</strong><span>Deux fixations adhésives 3M Command™ fournies avec la plaque.</span></li>
    <li><strong>2 à 4 jours</strong><span>{expedition}.</span></li>
  </ul></div>
</section>""".format(rayon=RAYON, ref=note("ville au centre à choisir", "decision"), expedition=EXPEDITION)


def carte_produit(p, fin=None, sizes="(max-width: 720px) 40vw, (max-width: 1000px) 26vw, 220px", niveau="h3", eager=False):
    url = "produit-{}.html".format(p["slug"])
    if p["collection"] == "accessoires":
        prix = euros(p["prix"])
        if p["slug"] == "led":
            # Le kit ne se vend pas seul (réponse du 31 octobre 2026) : la carte le présente comme une option
            visuel = '<div class="plaque">{}</div>'.format(img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED"))
            prix = "+ " + prix
            lieu, pied_c, cls = "Option d’une plaque", "À cocher sur la fiche de la plaque", "carte__visuel"
        else:
            visuel = '<div class="plaque">{}</div>'.format(img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée"))
            lieu, pied_c, cls = "Une plaque au choix, valable 2 ans", "Par e-mail ou à imprimer", "carte__visuel carte__visuel--carre"
        return """<li><article class="carte" data-collection="accessoires" data-nom="{nom}"{cadeau}>
  <a class="{cls}" href="{url}" tabindex="-1" aria-hidden="true">{visuel}</a>
  <div class="carte__infos"><{h} class="carte__nom"><a href="{url}">{nom}</a></{h}><span class="carte__prix">{prix}</span><span class="carte__lieu">{lieu}</span></div>
  <div class="carte__pied"><span class="carte__note">{pied}</span></div>
</article></li>""".format(nom=e(p["nom"]), cadeau=" data-cadeau" if p["slug"] in IDEES_CADEAUX else "", cls=cls, url=url, visuel=visuel, h=niveau, prix=prix, lieu=lieu, pied=pied_c)
    fin = fin if fin and a_photo(p["slug"], fin) else fin_defaut(p)
    data, pastilles = [], []
    for f, nom, _ in FINITIONS:
        if a_photo(p["slug"], f):
            data.append('data-img-{0}="{1}p/{2}-{0}-440.webp" data-srcset-{0}="{3}"'.format(f, IMG, p["slug"], srcset_plaque(p["slug"], f)))
            pastilles.append('<button type="button" class="pastille fin-{f}" data-fin="{f}" aria-pressed="{etat}" title="{nom}"><span class="visuellement-cache">{nom}</span></button>'.format(
                f=f, etat="true" if f == fin else "false", nom=nom))
        else:
            pastilles.append('<button type="button" class="pastille pastille--manque fin-{f}" disabled title="{nom} : photo à venir"><span class="visuellement-cache">{nom}, photo à venir</span></button>'.format(f=f, nom=nom))
    return """<li><article class="carte" data-collection="{coll}" data-nom="{nom}"{cadeau} {data}>
  <a class="carte__visuel" href="{url}" tabindex="-1" aria-hidden="true">{visuel}</a>
  <div class="carte__infos"><{h} class="carte__nom"><a href="{url}">{nom}</a></{h}><span class="carte__prix">{prix}</span><span class="carte__lieu">{lieu}</span></div>
  <div class="carte__pied"><div class="pastilles" role="group" aria-label="Finition affichée pour {nom}">{pastilles}</div></div>
</article></li>""".format(coll=p["collection"], nom=e(p["nom"]), cadeau=" data-cadeau" if p["slug"] in IDEES_CADEAUX else "", data=" ".join(data), url=url, visuel=plaque(p, fin, sizes, eager=eager),
                          h=niveau, prix=euros(p["prix"]), lieu=cartel_court(p), pastilles="".join(pastilles))


def grille(produits, niveau="h3", fins=None, eager=0, haute=False):
    """Grille de cartes ; les « eager » premières images (premier écran) ne sont pas différées ; « haute » : la première est prioritaire."""
    cartes = "".join(carte_produit(p, (fins or {}).get(p["slug"]), niveau=niveau,
                                   eager=("haute" if i == 0 and haute else True) if i < eager else False) for i, p in enumerate(produits))
    return '<ul class="grille-produits">{}</ul>'.format(cartes)


def etapes(detail=False):
    """Les quatre étapes de fabrication, sur le trajet de Revel à Bagnères-de-Bigorre."""
    m = PRODUITS["le-chateau-de-mauvezin"]
    if detail:
        dessin_txt = ('Les dessins originaux sont signés <a href="https://www.instagram.com/maude.villatte/">Maude Villatte</a> '
                      'et <a href="https://www.lolajacquet.com/">Lola Jacquet</a>.')
    else:
        dessin_txt = "Les dessins originaux sont signés Maude Villatte et Lola Jacquet."
    items = [
        ("Dessin", "Illustratrices", dessin_txt,
         dessin("liris", "Dessin au trait « L’iris », extrait de la planche de l’atelier"),
         '<p class="etape__legende">Un dessin de la planche de l’atelier, avant la découpe.</p>'),
        ("Découpe laser", "Revel (31)", "Le laser découpe la feuille d’aluminium de 2 mm, jusqu’aux lettres pochoir du titre.",
         '<div class="plaque">' + img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut, avant le laquage") + "</div>",
         '<p class="etape__legende">Aluminium brut, avant le laquage. Photo de la découpe {}</p>'.format(A_FOURNIR)),
        ("Thermolaquage", "Bagnères-de-Bigorre (65)", "Une peinture en poudre cuite au four : noir, gris ou doré.",
         plaque(m, "dore", "(max-width: 700px) 30vw, 120px"), ""),
        ("Contrôle et expédition", "Bagnères-de-Bigorre (65)", "Assemblage, contrôle et envoi. Choisi en option, le kit LED est collé au dos de la plaque avant l’envoi.",
         '<div class="plaque">' + img("tuto/tuto-3.webp", "Dos de la plaque L’Isard : le ruban LED collé sur le pourtour") + "</div>", ""),
    ]
    lis = []
    for titre, lieu, texte, visuel, legende in items:
        vis = '<div class="etape__visuel">{}</div>'.format(visuel) if detail else ""
        lis.append('<li class="etape">{vis}<p class="etape__lieu">{lieu}</p><h3>{titre}</h3><p class="etape__texte">{texte}</p>{leg}</li>'.format(
            vis=vis, lieu=lieu, titre=titre, texte=texte, leg=legende if detail else ""))
    return """<div class="trajet{cls}">
  <p class="trajet__ligne" aria-hidden="true"><span>Revel (31)</span><span class="trajet__tirets"></span><span>Bagnères-de-Bigorre (65)</span></p>
  <ol class="etapes">{lis}</ol>
</div>""".format(cls=" trajet--detail" if detail else "", lis="".join(lis))


# ---------------------------------------------------------------------------
# La carte des lieux
# ---------------------------------------------------------------------------

def svg_carte(uid):
    return """<svg class="atlas__svg" viewBox="0 0 {w} {h}" aria-hidden="true" focusable="false">
  <defs><clipPath id="dep-{uid}"><path d="{c}"/></clipPath></defs>
  <path class="atlas__dep" d="{c}"/>
  <g class="atlas__topo" clip-path="url(#dep-{uid})"><path d="{fin}"/><path class="atlas__topo-fort" d="{fort}"/></g>
  <path class="atlas__limite" d="{c}"/>
</svg>""".format(w=VB_W, h=VB_H, uid=uid, c=CONTOUR_D, fin=TOPO_FIN, fort=TOPO_FORT)


def etiquettes_carte():
    """Villes et pays en HTML : la taille du texte reste lisible quelle que soit la taille de la carte."""
    sortie = []
    for nom, la, lo, cote in VILLES:
        x, y = pc(la, lo)
        sortie.append('<span class="atlas__ville atlas__ville--{}" style="left:{:.2f}%;top:{:.2f}%" aria-hidden="true">{}</span>'.format(cote, x, y, nom))
    x, y = pc(42.71, -0.30)
    sortie.append('<span class="atlas__pays" style="left:{:.2f}%;top:{:.2f}%" aria-hidden="true">Espagne</span>'.format(x, y))
    return "".join(sortie)


def position(lat, lon, dx, dy, mdx, mdy):
    """Style du repère (position et écarts) et trait de rappel vers la position réelle, pour les deux tailles de carte."""
    x, y = pc(lat, lon)
    style = "left:{:.2f}%;top:{:.2f}%".format(x, y)
    rappel = ""
    if dx or dy or mdx or mdy:
        style += ";--dx:{}px;--dy:{}px;--mdx:{}px;--mdy:{}px".format(dx, dy, mdx, mdy)
        rappel = ('<span class="rappel" style="left:{:.2f}%;top:{:.2f}%;--l:{:.0f}px;--a:{:.1f}deg;--ml:{:.0f}px;--ma:{:.1f}deg" aria-hidden="true"></span>'
                  .format(x, y, math.hypot(dx, dy), math.degrees(math.atan2(dy, dx)), math.hypot(mdx, mdy), math.degrees(math.atan2(mdy, mdx))))
    return style, rappel


def reperes_carte(lien):
    """Repères de la carte : boutons (page carte) ou liens vers la page carte (aperçu de l’accueil)."""
    sortie = []

    def bouton(cle, cls, style, contenu, etiquette, cote):
        etq = '<span class="repere__nom">{}</span>'.format(e(etiquette))
        if lien:
            return '<a class="repere {cls} repere--{cote}" href="carte.html#{cle}" style="{st}" aria-label="{al}">{c}{etq}</a>'.format(
                cls=cls, cote=cote, cle=cle, st=style, al=e(etiquette + " : voir sur la carte"), c=contenu, etq=etq)
        return ('<button type="button" class="repere {cls} repere--{cote}" data-repere="{cle}" aria-controls="fiche-lieu" aria-pressed="false" '
                'style="{st}">{c}{etq}<span class="visuellement-cache"> : ouvrir la fiche</span></button>').format(
                    cls=cls, cote=cote, cle=cle, st=style, c=contenu, etq=etq)
    for s in ORDRE_LIEUX:
        la, lo, cote, dx, dy, mdx, mdy = LIEUX[s]
        style, rappel = position(la, lo, dx, dy, mdx, mdy)
        sortie.append(rappel + bouton(s, "repere--plaque", style, '<span class="repere__num">{}</span>'.format(NUMERO[s]), PRODUITS[s]["nom"], cote))
    la, lo, cote, dx, dy, mdx, mdy = AQUENSIS
    style, rappel = position(la, lo, dx, dy, mdx, mdy)
    etoile = '<svg class="repere__etoile" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1 9.9 5.6 14.7 5.9 11 9.1 12.2 13.9 8 11.3 3.8 13.9 5 9.1 1.3 5.9 6.1 5.6Z"/></svg>'
    sortie.append(rappel + bouton("aquensis", "repere--vrai", style, etoile, "Aquensis", cote))
    for s, b in BIENTOT.items():
        la, lo, cote, dx, dy, mdx, mdy = b["pos"]
        style, rappel = position(la, lo, dx, dy, mdx, mdy)
        sortie.append(rappel + bouton(s, "repere--bientot", style, "", b["nom"] + " (en préparation)", cote))
    return "".join(sortie)


def atlas(uid, lien=False):
    return """<div class="atlas{cls}" style="aspect-ratio:{w} / {h}" {data}>
  {svg}
  {reperes}
</div>""".format(cls=" atlas--apercu" if lien else "", w=VB_W, h=VB_H, data="" if lien else "data-atlas",
                 svg=svg_carte(uid), reperes=etiquettes_carte() + reperes_carte(lien))


def legende_carte():
    return """<ul class="legende">
  <li><span class="legende__signe legende__signe--plaque" aria-hidden="true">1</span>Un lieu, une plaque</li>
  <li><span class="legende__signe legende__signe--vrai" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false"><path d="M8 1 9.9 5.6 14.7 5.9 11 9.1 12.2 13.9 8 11.3 3.8 13.9 5 9.1 1.3 5.9 6.1 5.6Z"/></svg></span>Le décor d’origine, à Aquensis</li>
  <li><span class="legende__signe legende__signe--bientot" aria-hidden="true"></span>En préparation</li>
</ul>"""


def ligne_faune():
    items = "".join('<li><a href="produit-{s}.html">{img}<span>{nom}</span></a></li>'.format(
        s=s, img=plaque(PRODUITS[s], fin_defaut(PRODUITS[s]), "36px", eager=True), nom=e(PRODUITS[s]["nom"])) for s in FAUNE)
    return """<div class="faune-ligne">
  <p class="faune-ligne__titre">Faune des Pyrénées</p>
  <ul>{items}</ul>
  <p class="faune-ligne__note">Pas de repère pour les animaux : ils ne sont pas attachés à un lieu précis.</p>
</div>""".format(items=items)


def fiches_carte():
    articles = []
    for s in ORDRE_LIEUX:
        p = PRODUITS[s]
        articles.append("""<article class="fiche-lieu" data-fiche-lieu="{s}" hidden aria-labelledby="titre-{s}">
  <div class="fiche-lieu__visuel">{plaque}</div>
  <div class="fiche-lieu__corps">
    <p class="fiche-lieu__cartel"><span class="fiche-lieu__num">{n}</span>{cartel}</p>
    <h2 id="titre-{s}">{nom}</h2>
    <p class="fiche-lieu__prix"><strong>65 €</strong> en noir, gris ou doré</p>
    <a class="btn" href="produit-{s}.html">Voir la fiche</a>
  </div>
</article>""".format(s=s, plaque=plaque(p, fin_defaut(p), "120px"), n=NUMERO[s], cartel=cartel(p), nom=e(p["nom"])))
    articles.append("""<article class="fiche-lieu fiche-lieu--large" data-fiche-lieu="aquensis" hidden aria-labelledby="titre-aquensis">
  <div class="fiche-lieu__photo">{photo}</div>
  <div class="fiche-lieu__corps">
    <p class="fiche-lieu__cartel">Le décor d’origine · Bagnères-de-Bigorre</p>
    <h2 id="titre-aquensis">Aquensis, le décor d’origine</h2>
    <p>Avant les plaques, il y a eu ce décor : 30 niches de 1 m × 2 m en aluminium découpé et rétroéclairé, au centre thermal. Les douze plaques de la collection reprennent toutes des dessins de ce décor.</p>
    <a class="btn btn--ligne" href="atelier.html#origine">Lire l’histoire</a>
  </div>
</article>""".format(photo=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre et, au-dessus, les panneaux découpés et rétroéclairés du décor d’origine")))
    for s, b in BIENTOT.items():
        if s in DESSINS:
            visuel = dessin(s, "Dessin « {} », extrait de la planche des dessins inédits".format(b["nom"]))
        else:
            visuel = '<div class="dessin dessin--vide"><span>Dessin à venir</span></div>'
        articles.append("""<article class="fiche-lieu" data-fiche-lieu="{s}" hidden aria-labelledby="titre-{s}">
  <div class="fiche-lieu__visuel">{visuel}</div>
  <div class="fiche-lieu__corps">
    <p class="fiche-lieu__cartel">{lieu}</p>
    <h2 id="titre-{s}">{nom}</h2>
    <p>{prep}</p>
    <p>{texte}{fournir}</p>
    <a class="btn btn--ligne" href="index.html#lettre">Être prévenu de la sortie</a>
  </div>
</article>""".format(s=s, visuel=visuel, lieu=e(b["lieu"]), nom=e(b["nom"]), prep=A_PREPARATION, texte=e(b["texte"]),
                     fournir="" if s in DESSINS else " " + note("dessin à fournir")))
    return "".join(articles)


def liste_lieux():
    lis = []
    for s in ORDRE_LIEUX:
        p = PRODUITS[s]
        lis.append("""<li class="lieu-ligne">
  <span class="lieu-ligne__num" aria-hidden="true">{n}</span>
  <div class="lieu-ligne__texte"><a href="produit-{s}.html">{nom}</a><span>{cartel}</span></div>
  <span class="lieu-ligne__prix">65 €</span>
  <button type="button" class="lieu-ligne__situer" data-situer="{s}">Situer<span class="visuellement-cache"> {nom} sur la carte</span></button>
</li>""".format(n=NUMERO[s], s=s, nom=e(p["nom"]), cartel=cartel(p)))
    autres = [("aquensis", "Aquensis, le décor d’origine", "Centre thermal de Bagnères-de-Bigorre", "vrai")]
    autres += [(s, b["nom"], "En préparation · " + b["lieu"], "bientot") for s, b in BIENTOT.items()]
    for s, nom, detail, sorte in autres:
        lis.append("""<li class="lieu-ligne lieu-ligne--{sorte}">
  <span class="lieu-ligne__num legende__signe legende__signe--{sorte}" aria-hidden="true">{signe}</span>
  <div class="lieu-ligne__texte"><strong>{nom}</strong><span>{detail}</span></div>
  <span class="lieu-ligne__prix"></span>
  <button type="button" class="lieu-ligne__situer" data-situer="{s}">Situer<span class="visuellement-cache"> {nom} sur la carte</span></button>
</li>""".format(sorte=sorte, s=s, nom=e(nom), detail=e(detail),
                signe='<svg viewBox="0 0 16 16" focusable="false"><path d="M8 1 9.9 5.6 14.7 5.9 11 9.1 12.2 13.9 8 11.3 3.8 13.9 5 9.1 1.3 5.9 6.1 5.6Z"/></svg>' if sorte == "vrai" else ""))
    return "".join(lis)


def localisateur(p):
    s = p["slug"]
    if s in LIEUX:
        x, y = proj(LIEUX[s][0], LIEUX[s][1])
        point = '<circle cx="{:.0f}" cy="{:.0f}" r="44" class="loc__halo"/><rect x="{:.0f}" y="{:.0f}" width="40" height="40" class="loc__point"/>'.format(x, y, x - 20, y - 20)
        legende = "Position indicative"
        aria = "Carte des Hautes-Pyrénées : position indicative de " + p["nom"]
    else:
        point = ""
        legende = "Faune des Pyrénées : sans repère précis"
        aria = "Carte des Hautes-Pyrénées, sans repère : l’animal n’est pas attaché à un lieu précis"
    return """<figure class="localisateur">
  <svg viewBox="0 0 {w} {h}" role="img" aria-label="{aria}"><path d="{c}" class="loc__dep"/>{point}</svg>
  <figcaption>{legende}</figcaption>
</figure>""".format(w=VB_W, h=VB_H, aria=e(aria), c=CONTOUR_PETIT, point=point, legende=legende)


ORGANISATION = {
    "@context": "https://schema.org", "@type": "Organization", "name": "Terre Gravée", "url": SITE,
    "email": "contact@terregravee.fr", "telephone": "+33 6 42 57 28 10", "slogan": "Graver l’âme des territoires",
    "address": {"@type": "PostalAddress", "streetAddress": "16 rue du Pic du Midi", "postalCode": "65200",
                "addressLocality": "Gerde", "addressCountry": "FR"},
}


# ---------------------------------------------------------------------------
# Accueil : 7 sections (la section des avis est retirée le 31 octobre 2026). Pendant la saison de Noël, le bloc de Noël
# passe en tête et reprend « Nos coups de cœur », qui revient à sa place le 15 décembre.
# ---------------------------------------------------------------------------

def bloc_noel():
    """Première section de l’accueil pendant la saison : l’offre, la date limite, quatre plaques à offrir, la carte cadeau
    et le kit LED. L’image de Noël est la plaque rétroéclairée en blanc chaud (simulation), plutôt que des décorations.
    Masquée à partir du 15 décembre : « Nos coups de cœur » reprend alors sa place plus bas."""
    plaques = grille([PRODUITS[s] for s in ("le-pic-du-midi", "lours", "lisard", "le-cerf")], fins={"lisard": "dore", "le-cerf": "gris"})
    offre = (selon("neutre", "Livraison offerte du 27 novembre au 14 décembre")
             + selon("avant", "À partir du 27 novembre, la livraison est offerte, jusqu’au 14 décembre. Aujourd’hui, elle coûte encore 5 €.")
             + selon("pendant", "Livraison offerte jusqu’au 14 décembre"))
    mur = "".join(plaque(PRODUITS[s], f, "(max-width: 900px) 30vw, 150px", eager=True,
                        alt="Simulation : plaque {} rétroéclairée en blanc chaud".format(PRODUITS[s]["nom"]))
                  for s, f in (("le-pic-du-midi", "noir"), ("le-cerf", "gris")))
    return """<section class="noel" id="noel" aria-labelledby="titre-noel" data-noel-quand="neutre avant pendant">
  <div class="wrap noel__grille">
    <div class="noel__texte">
      <p class="surtitre">Noël 2026 · Idées cadeaux</p>
      <h2 id="titre-noel">Offrir les Pyrénées pour Noël</h2>
      <p class="noel__offre">{offre}</p>
      <p class="noel__limite">Pour recevoir avant Noël, commandez au plus tard le lundi 14 décembre. {dates}</p>
      <p class="noel__actions"><a class="btn" href="collection.html#cadeaux">Toutes les idées cadeaux</a></p>
    </div>
    <div class="noel__vitrine">
      <div class="noel__mur">{mur}</div>
      <div class="noel__led">
        <h3><a href="produit-led.html">Le kit LED</a> <span>+ 15 €</span></h3>
        <p>En option sur la fiche de chaque plaque. L’atelier le colle au dos : le soir, la plaque s’allume, par exemple en blanc chaud. Simulation ci-dessus.</p>
      </div>
    </div>
    <div class="noel__plaques">
      <h3 class="noel__sous-titre">Quatre plaques à offrir <span>65 € · noir, gris ou doré</span></h3>
      {plaques}
    </div>
    <div class="noel__cadeau">
      <a class="noel__cadeau-visuel" href="produit-carte-cadeau.html" tabindex="-1" aria-hidden="true">{carte}</a>
      <div>
        <h3><a href="produit-carte-cadeau.html">La carte cadeau</a> <span>65 €</span></h3>
        <p>Une plaque au choix, valable 2 ans. Envoyée par e-mail ou à imprimer, sans frais de port : la bonne solution si la date limite d’envoi est passée.</p>
      </div>
    </div>
  </div>
</section>""".format(offre=offre, dates=DATES_NOEL, mur=mur, plaques=plaques, carte=img("misc/carte-cadeau.webp", "", "120px"))


def accueil():
    pic, isard, jacobins = PRODUITS["le-pic-du-midi"], PRODUITS["lisard"], PRODUITS["la-tour-des-jacobins"]
    taille = "(max-width: 900px) 27vw, 170px"
    couleurs = "".join(
        '<button type="button" style="--c:{c}" data-couleur="{c}" aria-pressed="{etat}" title="{n}"><span class="visuellement-cache">{n}</span></button>'.format(
            c=c, n=n, etat="true" if i == 0 else "false") for i, (n, c) in enumerate(LED_COULEURS))

    def accroche(p, fin, lettre, nom, detail):
        legende = '<span class="cartel__nom">{}</span><span class="cartel__sep"> · </span><span class="cartel__detail">{}</span>'.format(nom, detail)
        return '<figure class="accroche accroche--{}">{}<figcaption class="cartel">{}</figcaption></figure>'.format(
            lettre, plaque(p, fin, taille, eager="haute"), legende)
    tuiles = []
    for cle, choix in (("paysages", [("le-pic-du-midi", "noir"), ("le-cirque-de-gavarnie", "dore"), ("le-montaigu", "gris")]),
                       ("patrimoine", [("le-chateau-de-mauvezin", "noir"), ("la-tour-des-jacobins", "dore"), ("labbaye-de-lescaladieu", "gris")]),
                       ("faune", [("lours", "noir"), ("lisard", "gris"), ("la-marmotte", "dore")])):
        nb = sum(1 for p in PLAQUES if p["collection"] == cle)
        mini = "".join(plaque(PRODUITS[s], f, "(max-width: 560px) 18vw, 90px") for s, f in choix)
        tuiles.append("""<a class="tuile" href="collection.html#{cle}">
  <div class="tuile__mur" aria-hidden="true">{mini}</div>
  <div class="tuile__texte"><div class="tuile__titre"><h3>{nom}</h3><span>{nb} modèles</span></div><p>{detail}</p></div>
</a>""".format(cle=cle, mini=mini, nom=COLLECTIONS[cle][0], nb=nb, detail=COLLECTIONS[cle][1]))
    # « Nos coups de cœur » : un choix de l’atelier, sans prétendre à un classement des ventes
    coups_coeur = grille([PRODUITS[s] for s in ("le-pic-du-midi", "lours", "lisard", "le-cerf")], fins={"lisard": "dore", "le-cerf": "gris"})
    noms_lieux = "".join('<li><span class="apercu-carte__num" aria-hidden="true">{}</span><a href="carte.html#{}">{}</a></li>'.format(
        NUMERO[s], s, e(PRODUITS[s]["nom"])) for s in ORDRE_LIEUX)
    # Modèles annoncés le 31 octobre 2026, sans date de sortie
    bientot = """<div class="bientot">
  <p class="bientot__titre">Bientôt</p>
  <ul class="bientot__liste">
    <li>{d1}<span>La Transhumance</span></li>
    <li><div class="dessin dessin--vide"><span>Dessin à venir</span></div><span>Le Jardin Massey, à Tarbes</span></li>
  </ul>
  <p class="bientot__note">Et des grands formats de 60 × 120 cm, à 150 € : Le Cirque de Gavarnie, Le Tourmalet, Le Pont d’Espagne et Le Pic du Midi. Le dessin ci-dessus vient de la planche de l’atelier. Ces plaques n’existent pas encore en photo.</p>
</div>""".format(d1=dessin("la-transhumance", "Dessin « La Transhumance »"))
    contenu = """
{noel}
<section class="heros">
  <div class="wrap heros__grille">
    <div class="heros__texte">
      <p class="surtitre">Plaques murales en aluminium · Hautes-Pyrénées</p>
      <h1>Graver l’âme des territoires</h1>
      <p class="heros__intro">Le Pic du Midi, l’isard, la tour des Jacobins… Chaque plaque reprend une silhouette de la Bigorre, découpée au laser dans l’aluminium puis thermolaquée, en Occitanie.</p>
      <div class="heros__actions"><a class="btn" href="collection.html">Voir la collection</a><a class="btn btn--ligne" href="carte.html">La carte des lieux</a></div>
      <dl class="faits">
        <div><dt>Format</dt><dd>60 × 30 cm</dd></div>
        <div><dt>Finitions</dt><dd>Noir, gris, doré</dd></div>
        <div><dt>Prix</dt><dd>65 €</dd></div>
      </dl>
    </div>
    <div class="mur-expo" data-mur>
      {a1}{a2}{a3}
      <div class="mur-expo__legende">
        <div class="led-commandes">
          <button type="button" class="interrupteur" aria-pressed="false"><span class="interrupteur__voyant" aria-hidden="true"></span><span class="interrupteur__texte">Allumer le rétroéclairage</span></button>
          <div class="led-couleurs" role="group" aria-label="Couleur des LED" hidden>{couleurs}</div>
        </div>
        <a class="mur-expo__note" href="produit-led.html">Simulation · kit LED en option, 15 €</a>
      </div>
    </div>
  </div>
</section>
{reperes}
<section class="section">
  <div class="wrap">
    <div class="entete-section entete-section--ligne">
      <div><p class="surtitre">La collection</p><h2>Trois thèmes, douze plaques</h2></div>
      <a class="lien-fleche" href="collection.html">Toute la collection</a>
    </div>
    <div class="collections">{tuiles}</div>
    <div class="aussi">
      <a class="aussi__photo" href="produit-led.html" tabindex="-1" aria-hidden="true">{led}</a>
      <p class="aussi__texte"><strong>Le soir, en vrai</strong>Photo réelle : L’Ours rétroéclairé en bleu par le kit LED. En option à 15 € sur la fiche de chaque plaque, il est collé au dos par l’atelier. <a class="lien-fleche" href="produit-led.html">Le kit LED</a></p>
      <p class="aussi__cadeau">Pour laisser choisir : <a href="produit-carte-cadeau.html">la carte cadeau, 65 €</a>.</p>
    </div>
  </div>
</section>
<section class="section section--clair" data-noel-quand="apres fini" hidden>
  <div class="wrap">
    <div class="entete-section entete-section--ligne">
      <div><p class="surtitre">La sélection de l’atelier</p><h2>Nos coups de cœur</h2></div>
      <p class="attenue petit">Choisissez une pastille pour voir une autre finition.</p>
    </div>
    {coups_coeur}
  </div>
</section>
<section class="section section--topo apercu-carte" aria-labelledby="titre-apercu-carte">
  <div class="wrap apercu-carte__grille">
    <div class="apercu-carte__tete">
      <p class="surtitre">La carte des lieux</p>
      <h2 id="titre-apercu-carte">Huit lieux à accrocher</h2>
      <p class="chapo">Chaque paysage et chaque monument a son repère. L’étoile marque le décor d’origine, à Aquensis.</p>
    </div>
    <figure class="apercu-carte__figure">
      {atlas}
      <figcaption>Positions indicatives. Les quatre animaux de la collection n’ont pas de repère.</figcaption>
    </figure>
    <div class="apercu-carte__suite">
      <ol class="apercu-carte__liste">{noms_lieux}</ol>
      <p><a class="btn btn--ligne" href="carte.html">Ouvrir la carte</a></p>
    </div>
  </div>
</section>
<section class="section section--sauge atelier-accueil" aria-labelledby="titre-atelier-accueil">
  <div class="wrap">
    <div class="origine">
      <figure class="origine__photo">
        {photo}
        <figcaption>Photo réelle · Aquensis, Bagnères-de-Bigorre : le décor d’origine, rétroéclairé, au-dessus des bassins.</figcaption>
      </figure>
      <div class="origine__texte">
        <p class="surtitre">L’atelier · L’origine</p>
        <h2 id="titre-atelier-accueil">Tout a commencé à Aquensis</h2>
                <p>Au centre thermal de Bagnères-de-Bigorre, il fallait masquer une coursive technique. Le décor conçu pour Aquensis compte 30 niches de 1 m × 2 m, fermées par des panneaux d’aluminium découpé, thermolaqué effet Corten et rétroéclairé. L’idée des plaques de 60 × 30 cm pour la maison est venue de là : les douze plaques de la collection reprennent toutes des dessins de ce décor.</p>
        <p><a class="lien-fleche" href="atelier.html#origine">Lire l’histoire</a></p>
      </div>
    </div>
    <div class="fabrication-accueil">
      <div class="fabrication-accueil__tete">
        <h3>Du dessin à l’expédition</h3>
        <p>Quatre étapes, de Revel à Bagnères-de-Bigorre. <a class="lien-fleche" href="atelier.html#fabrication">La fabrication en détail</a></p>
      </div>
      {etapes}
    </div>
  </div>
</section>
<section class="section lettre" id="lettre" aria-labelledby="titre-lettre">
  <div class="wrap lettre__grille">
    <div class="lettre__texte">
      <p class="surtitre">Lettre d’information</p>
      <h2 id="titre-lettre">Être prévenu des nouvelles plaques</h2>
      <p class="chapo">La lettre vous prévient de chaque nouvelle plaque. Une lettre par trimestre au plus.</p>
      <form class="inscription" data-demo>
        <div class="inscription__ligne">
          <label class="visuellement-cache" for="email-lettre">Adresse e-mail</label>
          <input id="email-lettre" name="email" type="email" required placeholder="votre@adresse.fr" autocomplete="email">
          <button class="btn" type="submit">S’inscrire</button>
        </div>
        <div class="case"><input id="accord-lettre" name="accord" type="checkbox" required><label for="accord-lettre">J’accepte de recevoir la lettre de Terre Gravée par e-mail, une par trimestre au plus. Je peux me désinscrire à chaque envoi.</label></div>
        <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
      </form>
    </div>
    {bientot}
  </div>
</section>""".format(
        a1=accroche(pic, "noir", "a", "Le Pic du Midi", "2 877 m"),
        a2=accroche(isard, "dore", "b", "L’Isard", "<i>Rupicapra pyrenaica</i>"),
        a3=accroche(jacobins, "gris", "c", "La Tour des Jacobins", "Bagnères"),
        led=img("led/led-img0.webp", "Photo réelle : plaque L’Ours rétroéclairée en bleu par le kit LED", "84px"),
        couleurs=couleurs, reperes=reperes(), tuiles="".join(tuiles), coups_coeur=coups_coeur, noms_lieux=noms_lieux, atlas=atlas("apercu", lien=True),
        photo=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre ; au-dessus, une rangée de panneaux en métal découpé, rétroéclairés : le décor d’origine",
                  "(max-width: 900px) 92vw, 680px"),
        etapes=etapes(), bientot=bientot, noel=bloc_noel())
    page("index.html", "Terre Gravée · Plaques murales en aluminium des Hautes-Pyrénées",
         "Plaques murales en aluminium découpé au laser et thermolaqué : paysages, patrimoine et faune des Hautes-Pyrénées. 60 × 30 cm, 65 €.",
         contenu, jsonld=ORGANISATION, classe="page-accueil")


# ---------------------------------------------------------------------------
# Collection
# ---------------------------------------------------------------------------

def collection():
    comptes = {c: sum(1 for p in CATALOGUE if p["collection"] == c) for c in COLLECTIONS}
    puces = ['<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Tout <span>{}</span></button>'.format(len(CATALOGUE))]
    puces += ['<button type="button" class="puce" data-filtre="{}" aria-pressed="false">{} <span>{}</span></button>'.format(c, v[0], comptes[c])
              for c, v in COLLECTIONS.items()]
    puces.append('<button type="button" class="puce puce--cadeaux" data-filtre="cadeaux" aria-pressed="false">Idées cadeaux <span>{}</span></button>'.format(len(IDEES_CADEAUX)))
    voir = "".join('<button type="button" class="puce puce--fin fin-{0}" data-voir-en="{0}" aria-pressed="false">{1}</button>'.format(f, n) for f, n, _ in FINITIONS)
    contenu = """
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Boutique</p>
    <h1>La collection</h1>
    <p class="chapo">Douze plaques de 60 × 30 cm en aluminium découpé au laser et thermolaqué. Chaque modèle existe en noir, gris et doré, au même prix : 65 €. Le kit LED s’ajoute en option sur la fiche de chaque plaque ; la carte cadeau vaut une plaque au choix, pendant 2 ans.</p>
  </header>
  <div class="barre-filtres">
    <div class="puces" role="group" aria-label="Filtrer par thème">{puces}</div>
    <div class="voir-en" role="group" aria-label="Afficher toutes les plaques en"><span>Voir en</span>{voir}</div>
  </div>
  <p class="compte" data-compte aria-live="polite">{n} articles</p>
  <h2 class="visuellement-cache">Les articles</h2>
  <div data-grille-collection>{grille}</div>
</div>
<section class="section">
  <div class="wrap">
    <ul class="garanties garanties--bande">
      <li><span>Livraison</span><span>{livraison}</span></li>
      <li><span>Retours</span><span>14 jours pour vous rétracter, frais de retour à votre charge</span></li>
      <li><span>Paiement</span><span>Carte bancaire, PayPal, Apple Pay, Google Pay</span></li>
      <li><span>Fabrication</span><span>Revel (31) et Bagnères-de-Bigorre (65)</span></li>
    </ul>
  </div>
</section>""".format(puces="".join(puces), voir=voir, n=len(CATALOGUE), grille=grille(CATALOGUE, eager=4, haute=True), livraison=LIVRAISON_COURT)
    page("collection.html", "La collection · Terre Gravée",
         "Douze plaques murales en aluminium découpé au laser : paysages, patrimoine et faune des Pyrénées, en noir, gris ou doré. 65 € la plaque, kit LED en option et carte cadeau.",
         contenu, actif="collection.html", classe="page-collection")


# ---------------------------------------------------------------------------
# Fiches produit
# ---------------------------------------------------------------------------

def garanties(carte=False):
    envoi = ("<li><span>Envoi</span><span>Par e-mail, sans frais de port</span></li>" if carte else
             "<li><span>Livraison</span><span>{}</span></li>".format(LIVRAISON_COURT))
    return """<ul class="garanties">
  {envoi}
  <li><span>Retours</span><span>14 jours pour vous rétracter, frais de retour à votre charge</span></li>
  <li><span>Paiement</span><span>Carte bancaire (Stripe), PayPal, Apple Pay, Google Pay</span></li>
</ul>""".format(envoi=envoi)


def similaires(p):
    meme = [x for x in PLAQUES if x["collection"] == p["collection"] and x["slug"] != p["slug"]]
    # « best » : champ du catalogue partagé, lu ici comme « coup de cœur » (aucun classement des ventes n’est affiché)
    autres = [x for x in PLAQUES if x["best"] and x not in meme and x["slug"] != p["slug"]]
    return (meme + autres)[:4]


def jsonld_produit(p, image):
    d = {"@context": "https://schema.org", "@type": "Product", "name": p["nom"], "image": image,
         "brand": {"@type": "Brand", "name": "Terre Gravée"},
         "offers": {"@type": "Offer", "price": "{}.00".format(p["prix"]), "priceCurrency": "EUR", "url": p["url_actuelle"]}}
    # Pas d’aggregateRating : aucun avis n’est affiché (voir la neutralisation des avis en tête du fichier)
    return d


def fiche_plaque(p):
    slug = p["slug"]
    f0 = fin_defaut(p)
    coll = COLLECTIONS[p["collection"]][0]
    scenes, vignettes, radios = [], [], []
    for f, nom, accord in FINITIONS:
        cache = "" if f == f0 else " hidden"
        if a_photo(slug, f):
            scenes.append('<div data-scene="{}"{}>{}</div>'.format(f, cache, plaque(p, f, "(max-width: 900px) 70vw, 340px", eager="haute" if f == f0 else False)))
            vignettes.append('<button type="button" class="vignette" data-vue="{f}" aria-pressed="{etat}"><img src="{src}" alt="" width="440" height="{h}" loading="lazy" decoding="async"><span>{nom}</span></button>'.format(
                f=f, etat="true" if f == f0 else "false", src="{}p/{}-{}-440.webp".format(IMG, slug, f), h=dims("p/{}-{}-440.webp".format(slug, f))[1], nom=nom))
        else:
            scenes.append('<div data-scene="{}"{}><div class="plaque plaque--vide"><span>Finition {} : photo à venir</span>{}</div></div>'.format(f, cache, accord, note("photo à fournir")))
            vignettes.append('<button type="button" class="vignette" data-vue="{}" aria-pressed="false"><span class="vignette__vide"></span><span>{}</span></button>'.format(f, nom))
        radios.append('<label class="fin-{f}"><input type="radio" name="finition" value="{f}"{c}>{nom}{manque}</label>'.format(
            f=f, c=" checked" if f == f0 else "", nom=nom, manque="" if a_photo(slug, f) else '<span class="visuellement-cache"> (photo à venir)</span>'))
    if p["decor"]:
        r640 = p["decor"].replace("-1200", "-640")
        scenes.append('<div data-scene="situation" hidden><figure class="scene-situation">{}<figcaption>Mise en situation</figcaption></figure></div>'.format(
            img(p["decor"], "Mise en situation : plaque " + p["nom"] + " sur un mur", "(max-width: 900px) 92vw, 640px", cls="situation",
                srcset="{0}{1} 640w, {0}{2} 1200w".format(IMG, r640, p["decor"]) if r640 in TAILLES and r640 != p["decor"] else "")))
        w, h = dims(r640 if r640 in TAILLES else p["decor"])
        vignettes.append('<button type="button" class="vignette vignette--situation" data-vue="situation" aria-pressed="false"><img src="{}{}" alt="" width="{}" height="{}" loading="lazy" decoding="async"><span>En situation</span></button>'.format(
            IMG, r640 if r640 in TAILLES else p["decor"], w, h))
    positions = "".join("<option>{}</option>".format(x) for x in POSITIONS_CABLE)
    texte = "".join("<p>{}</p>".format(e(x)) for x in histoire(p))
    lien = '<p class="recit__source">Pour en savoir plus : <a href="{}">{}</a></p>'.format(e(p["lien"]["url"]), e(p["lien"]["label"])) if p["lien"] else ""
    faune = p["collection"] == "faune"
    voir_carte = '<a class="lien-fleche" href="carte.html">La faune sur la carte</a>' if faune else '<a class="lien-fleche" href="carte.html#{}">Voir sur la carte</a>'.format(slug)
    data_img = " ".join('data-img-{0}="{1}p/{2}-{0}-440.webp"'.format(f, IMG, slug) for f, _, _ in FINITIONS if a_photo(slug, f))
    contenu = """
<div class="wrap">
  <nav aria-label="Fil d’Ariane" class="fil"><ol class="fil-ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html">Collection</a></li><li><a href="collection.html#{cid}">{coll}</a></li><li aria-current="page">{nom}</li></ol></nav>
  <div class="fiche" data-fiche data-slug="{slug}" data-nom="{nom}" data-prix="{prix}" data-prix-led="15" {data_img}>
    <div class="galerie">
      <div class="galerie__scene">{scenes}</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues de la plaque">{vignettes}</div>
    </div>
    <div class="achat">
      <div class="achat__tete">
        <p class="cartel-ligne">{cartel}</p>
        <h1>{nom}</h1>
      </div>
      <p class="achat__prix"><strong data-prix-affiche>{prix_txt}</strong><span>TTC, TVA non applicable (art. 293 B du CGI)</span></p>
      <fieldset class="option choix-finition">
        <legend class="option__titre">Finition : <output id="finition-choisie">{fin_nom}</output></legend>
        <div class="choix-finition__options">{radios}</div>
      </fieldset>
      <div class="option-led">
        <label class="option-led__case"><input type="checkbox" id="option-led"><span><strong>Ajouter le kit LED</strong><small>Ruban RGB, télécommande et câble USB, sans chargeur : il se branche sur un chargeur USB ou un port USB. L’atelier le colle au dos de la plaque avant l’envoi, à la sortie de câble choisie. Dehors, à l’abri de la pluie. Informations de sécurité {securite_led} <a href="produit-led.html">Le kit en détail</a></small></span><span class="option-led__prix">+15 €</span></label>
        <div class="champ" data-position-led hidden><label for="position-cable">Sortie du câble</label><select id="position-cable">{positions}</select></div>
      </div>
      <div class="quantite-achat">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une plaque">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter une plaque">+</button></div>
        <button type="button" class="btn" data-ajouter>Ajouter au panier</button>
      </div>
      {noel}
      {garanties}
      <dl class="caracteristiques">
        <div><dt>Format</dt><dd>60 × 30 cm, épaisseur 2 mm</dd></div>
        <div><dt>Matière</dt><dd>Aluminium découpé au laser, thermolaqué</dd></div>
        <div><dt>Titre</dt><dd>Découpé en lettrage pochoir</dd></div>
        <div><dt>Fixation</dt><dd>2 fixations adhésives 3M Command™ fournies, pose sans perçage</dd></div>
        <div><dt>Usage</dt><dd>Plaque : intérieur et extérieur, sans restriction. Les fixations fournies sont prévues pour l’intérieur. Fixation conseillée dehors {ext}</dd></div>
        <div><dt>Fabrication</dt><dd>Découpe à Revel (31), thermolaquage à Bagnères-de-Bigorre (65)</dd></div>
      </dl>
    </div>
  </div>
</div>
<section class="section section--sauge" aria-labelledby="titre-recit">
  <div class="wrap recit recit--sans-avis">
    <aside class="recit__lieu" aria-label="{lab_lieu}">
      <p class="surtitre">{lab_lieu}</p>
      <p class="recit__lieu-texte">{lieu_texte}</p>
      {loc}
      <p>{voir_carte}</p>
    </aside>
    <div class="recit__histoire">
      <p class="surtitre">L’histoire du modèle</p>
      <h2 id="titre-recit">{titre_h}</h2>
      <div class="texte">{texte}</div>
      {lien}
    </div>
  </div>
</section>
<section class="section section--clair" aria-labelledby="titre-voir-aussi">
  <div class="wrap">
    <div class="entete-section entete-section--ligne"><div><p class="surtitre">{coll}</p><h2 id="titre-voir-aussi">À voir aussi</h2></div><a class="lien-fleche" href="collection.html">Toute la collection</a></div>
    {sim}
  </div>
</section>
<div class="barre-achat-mobile"><div><strong>{nom}</strong><span data-prix-affiche>{prix_txt}</span></div><button type="button" class="btn" data-ajouter>Ajouter au panier</button></div>""".format(
        cid=p["collection"], coll=coll, nom=e(p["nom"]), slug=slug, prix=p["prix"], data_img=data_img, scenes="".join(scenes),
        vignettes="".join(vignettes), cartel=cartel(p), prix_txt=euros(p["prix"]), fin_nom=NOM_FIN[f0],
        radios="".join(radios), positions=positions, garanties=garanties(), noel=encart_noel(), ext=A_FOURNIR, securite_led=note("à fournir"),
        lab_lieu="L’animal" if faune else "Le lieu", lieu_texte=e(LIEU_TEXTE[slug]).replace("XIXe", "XIX<sup>e</sup>"), loc=localisateur(p),
        voir_carte=voir_carte, titre_h=e(p["titre_histoire"]), texte=texte, lien=lien, sim=grille(similaires(p)))
    lieu, detail = p["cartel"]
    page("produit-{}.html".format(slug), "{}, plaque murale en aluminium · Terre Gravée".format(p["nom"]),
         "Plaque murale « {} » en aluminium découpé au laser et thermolaqué, 60 × 30 cm, en noir, gris ou doré. {} · {}. 65 € TTC.".format(p["nom"], lieu, detail),
         contenu, actif="collection.html", jsonld=jsonld_produit(p, "{}p/{}-{}-880.webp".format(IMG, slug, f0)), classe="page-fiche")


def fiche_led():
    p = PRODUITS["led"]
    vues = [("led-img0", "Plaque L’Ours rétroéclairée en bleu", "Bleu"), ("led-img1", "Plaque Le Pic du Midi rétroéclairée en vert", "Vert"),
            ("led-img2", "Ruban LED collé au dos d’une plaque", "Ruban"), ("led-img3", "Télécommande et boîtier du kit LED", "Commande")]
    scenes = "".join('<div data-scene="{}"{}>{}</div>'.format(k, "" if i == 0 else " hidden", img("led/" + k + ".webp", alt, cls="situation", eager="haute" if i == 0 else False))
                     for i, (k, alt, _) in enumerate(vues))
    vignettes = "".join('<button type="button" class="vignette vignette--situation" data-vue="{k}" aria-pressed="{etat}"><img src="{src}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async"><span>{n}</span></button>'.format(
        k=k, etat="true" if i == 0 else "false", src=IMG + "led/" + k + ".webp", w=dims("led/" + k + ".webp")[0], h=dims("led/" + k + ".webp")[1], n=n)
        for i, (k, _, n) in enumerate(vues))
    contenu = """
<div class="wrap">
  <nav aria-label="Fil d’Ariane" class="fil"><ol class="fil-ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Kit LED</li></ol></nav>
  <div class="fiche" data-fiche data-type="accessoire" data-slug="led" data-nom="Kit LED">
    <div class="galerie">
      <div class="galerie__scene galerie__scene--photo">{scenes}</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues du kit">{vignettes}</div>
    </div>
    <div class="achat">
      <div class="achat__tete"><p class="cartel-ligne">Option d’une plaque</p><h1>Kit LED</h1></div>
      <p class="achat__prix"><strong>+ 15 €</strong><span>avec une plaque · TTC, TVA non applicable (art. 293 B du CGI)</span></p>
      <div class="encadre encadre--doux">
        <p><strong>Le kit s’ajoute en option sur la fiche de chaque plaque, + 15 €.</strong> Il ne se vend pas seul.</p>
        <p>L’atelier le colle au dos de la plaque avant l’envoi, à la sortie de câble choisie : bas gauche, bas droite, haut gauche ou haut droite.</p>
      </div>
      <p class="option-led-lien"><a class="btn" href="collection.html">Choisir une plaque</a></p>
      <dl class="caracteristiques">
        <div><dt>Ruban</dt><dd>LED RGB autocollant, longueur 2 m</dd></div>
        <div><dt>Commande</dt><dd>Télécommande, boutons sur le ruban, application smartphone</dd></div>
        <div><dt>Alimentation</dt><dd>Câble USB fourni, sans chargeur : à brancher sur un chargeur USB ou un port USB</dd></div>
        <div><dt>Usage</dt><dd>Intérieur, ou dehors à l’abri de la pluie</dd></div>
        <div><dt>Origine</dt><dd>Non fabriqué en France, choisi pour sa compatibilité avec les plaques</dd></div>
        <div><dt>Sécurité</dt><dd>Fabricant (nom, adresse), référence et avertissements {securite}</dd></div>
      </dl>
    </div>
  </div>
</div>
<section class="section section--sauge">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="offre"><p class="surtitre">En détail</p><h2>Une solution clé en main</h2>
      <div class="texte"><p>Ce kit vous évite de chercher vous-même un modèle compatible. Vous restez libre d’utiliser une autre bande LED : les plaques s’adaptent à la plupart des rubans du marché.</p>
      <p>L’application permet de programmer des horaires, de faire varier les couleurs ou de synchroniser la lumière avec la musique.</p></div>
      <p><a class="lien-fleche" href="installation.html#led">Voir la notice de pose</a></p></div>
    <div class="offre"><p class="surtitre">Choisir une plaque</p>{assoc}</div>
  </div>
</section>""".format(
        scenes=scenes, vignettes=vignettes,
        # Règlement (UE) 2023/988, art. 19 : informations de sécurité du fabricant, pas encore envoyées
        securite=note("informations de sécurité à fournir"),
        assoc='<ul class="grille-produits grille-produits--deux">{}{}</ul>'.format(carte_produit(PRODUITS["le-pic-du-midi"]), carte_produit(PRODUITS["lours"])))
    page("produit-led.html", "Kit LED de rétroéclairage · Terre Gravée",
         "Kit LED RGB pour rétroéclairer une plaque Terre Gravée : ruban autocollant, télécommande, câble USB. En option à 15 € sur la fiche de chaque plaque, collé au dos par l’atelier.",
         contenu, actif="collection.html", classe="page-fiche")


def fiche_carte_cadeau():
    contenu = """
<div class="wrap">
  <nav aria-label="Fil d’Ariane" class="fil"><ol class="fil-ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Carte cadeau</li></ol></nav>
  <div class="fiche" data-fiche data-type="accessoire" data-slug="carte-cadeau" data-nom="Carte cadeau" data-prix="65" data-image="{img}" data-carre="1">
    <div class="galerie">
      <div class="galerie__scene galerie__scene--photo"><div data-scene="carte">{visuel}</div></div>
    </div>
    <div class="achat">
      <div class="achat__tete"><p class="cartel-ligne">Idée cadeau</p><h1>Carte cadeau</h1></div>
      <p class="achat__prix"><strong data-prix-affiche>65 €</strong><span>TTC, TVA non applicable (art. 293 B du CGI)</span></p>
      <p>Elle vaut une plaque au choix, sur tous les modèles disponibles, même si le prix change. La personne qui la reçoit choisit le dessin et la finition. Elle est valable 2 ans à compter de l’achat. La livraison de la plaque reste à payer : 5 € ({offre_court}).</p>
      <div class="quantite-achat">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une carte">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter une carte">+</button></div>
        <button type="button" class="btn" data-ajouter>Ajouter au panier</button>
      </div>
      {noel}
      {garanties}
      <dl class="caracteristiques">
        <div><dt>Valeur</dt><dd>Une plaque au choix, même si le prix change</dd></div>
        <div><dt>Envoi</dt><dd>Par e-mail, ou à imprimer chez vous</dd></div>
        <div><dt>Validité</dt><dd>2 ans à compter de l’achat</dd></div>
        <div><dt>Livraison</dt><dd>Celle de la plaque reste à payer : 5 € par commande ({offre_court})</dd></div>
      </dl>
    </div>
  </div>
</div>
<section class="section section--sauge">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="offre"><p class="surtitre">En détail</p><h2>Laisser choisir</h2>
      <div class="texte"><p>Vous voulez offrir une plaque mais vous hésitez sur le modèle ? Avec la carte cadeau, la personne choisit le dessin qui lui plaît vraiment.</p></div></div>
    <div class="offre"><p class="surtitre">Nos coups de cœur</p>{assoc}</div>
  </div>
</section>
<div class="barre-achat-mobile"><div><strong>Carte cadeau</strong><span data-prix-affiche>65 €</span></div><button type="button" class="btn" data-ajouter>Ajouter au panier</button></div>""".format(
        img=IMG + "misc/carte-cadeau.webp", visuel=img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée", cls="situation", eager="haute"),
        garanties=garanties(carte=True), noel=encart_noel(carte=True), offre_court=OFFRE_COURT,
        assoc='<ul class="grille-produits grille-produits--deux">{}{}</ul>'.format(carte_produit(PRODUITS["le-pic-du-midi"]), carte_produit(PRODUITS["lisard"])))
    page("produit-carte-cadeau.html", "Carte cadeau · Terre Gravée",
         "Carte cadeau Terre Gravée : une plaque au choix du destinataire, valable 2 ans, envoyée par e-mail ou à imprimer. 65 €.",
         contenu, actif="collection.html", classe="page-fiche")


# ---------------------------------------------------------------------------
# Carte des lieux
# ---------------------------------------------------------------------------

def carte_page():
    contenu = """
<div class="wrap carte-page">
  <header class="entete-page entete-page--serre">
    <p class="surtitre">Hautes-Pyrénées</p>
    <h1>La carte des lieux</h1>
    <p class="chapo">Huit plaques, huit lieux du département. Choisissez un repère pour voir la plaque, son cartel et son prix. L’étoile marque le décor d’origine, à Aquensis.</p>
  </header>
  <div class="carte-page__grille">
    <figure class="carte-page__carte">
      {atlas}
      <figcaption><strong>Positions indicatives.</strong> Quand deux lieux sont très proches, un repère est légèrement écarté et un trait le relie à sa position. Contour du département simplifié d’après les données IGN (Licence Ouverte 2.0). Courbes de niveau décoratives.</figcaption>
    </figure>
    <div class="carte-page__cote">
      <div class="atlas-fiche" id="fiche-lieu" aria-live="polite">
        <div class="atlas-fiche__intro" data-fiche-intro>
          <p class="surtitre">Mode d’emploi</p>
          <h2>Choisissez un repère</h2>
          <p>La fiche du lieu s’ouvre ici : la plaque, son cartel et son prix.</p>
          <p class="atlas-fiche__clavier">Au clavier : Tab pour passer d’un repère à l’autre, Entrée pour ouvrir la fiche, Échap pour la refermer.</p>
          {legende}
        </div>
        {fiches}
        <button type="button" class="atlas-fiche__fermer" data-fermer-fiche hidden>Fermer la fiche</button>
      </div>
      {faune}
    </div>
  </div>
  <section class="lieux-liste" aria-labelledby="titre-liste">
    <h2 id="titre-liste">Les lieux, du nord au sud</h2>
    <p class="attenue">La même information que la carte, en liste.</p>
    <ol class="lieux">{lieux}</ol>
  </section>
</div>""".format(atlas=atlas("carte"), legende=legende_carte(), fiches=fiches_carte(), faune=ligne_faune(), lieux=liste_lieux())
    page("carte.html", "La carte des lieux · Terre Gravée",
         "Carte des Hautes-Pyrénées : les huit lieux gravés par Terre Gravée, le décor d’origine à Aquensis et le modèle en préparation.",
         contenu, actif="carte.html", classe="page-carte")


# ---------------------------------------------------------------------------
# L’atelier : origine, fabrication, illustratrices, avis
# ---------------------------------------------------------------------------

def atelier():
    contenu = """
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">L’atelier</p>
    <h1>De la Bigorre à votre mur</h1>
    <p class="chapo">Terre Gravée est la micro-entreprise de Romain Fourneaux, à Gerde, à côté de Bagnères-de-Bigorre. Les plaques reprennent les dessins de deux illustratrices, créés pour le décor d’Aquensis. La découpe se fait à Revel, le thermolaquage à Bagnères-de-Bigorre.</p>
    <nav class="sommaire-court" aria-label="Sur cette page"><a href="#origine">L’origine</a><a href="#fabrication">La fabrication</a><a href="#illustratrices">Les illustratrices</a><a href="#avis">Les avis</a></nav>
  </header>
</div>
<section class="section section--sauge" id="origine" aria-labelledby="titre-origine">
  <div class="wrap">
    <div class="origine origine--page">
      <figure class="origine__photo">
        {photo}
        <figcaption>Photo réelle · Aquensis, Bagnères-de-Bigorre : le décor d’origine, rétroéclairé, au-dessus des bassins.</figcaption>
      </figure>
      <div class="origine__texte">
        <p class="surtitre">L’origine</p>
        <h2 id="titre-origine">Tout a commencé à Aquensis</h2>
                <div class="texte">
          <p>Avant les plaques, il y a eu un décor. À Aquensis, le centre thermal de Bagnères-de-Bigorre, il fallait masquer une coursive technique. Le projet conçu pour Aquensis compte 30 niches de 1 m × 2 m, fermées par des panneaux de métal découpé.</p>
          <p>Le thème : le patrimoine, la flore et la faune de la Bigorre. Maude Villatte et Lola Jacquet ont dessiné 60 illustrations, adaptées ensuite à la découpe.</p>
          <p>Les panneaux sont en aluminium thermolaqué effet Corten, découpés au laser et rétroéclairés. L’idée est venue de là : proposer ces dessins aux particuliers, en plaques de 60 × 30 cm. Les douze plaques de la collection reprennent toutes des dessins de ce décor.</p>
        </div>
      </div>
    </div>
    <dl class="cartel-projet">
      <div><dt>Lieu</dt><dd>Aquensis, centre thermal de Bagnères-de-Bigorre</dd></div>
      <div><dt>Projet</dt><dd>Masquer une coursive technique : 30 niches de 1 m × 2 m</dd></div>
      <div><dt>Thème</dt><dd>Patrimoine, flore et faune de la Bigorre</dd></div>
      <div><dt>Dessins</dt><dd>60 illustrations de Maude Villatte et Lola Jacquet</dd></div>
      <div><dt>Matière</dt><dd>Aluminium thermolaqué effet Corten, découpe laser, rétroéclairage</dd></div>
    </dl>
  </div>
</section>
<section class="section" id="fabrication" aria-labelledby="titre-fabrication">
  <div class="wrap">
    <div class="entete-section">
      <p class="surtitre">La fabrication</p>
      <h2 id="titre-fabrication">Quatre étapes, de Revel à Bagnères-de-Bigorre</h2>
      <p class="chapo">La découpe se fait à Revel (31). Le thermolaquage, l’assemblage, le contrôle et l’expédition, à Bagnères-de-Bigorre (65). {rayon} {ref}</p>
    </div>
    {etapes}
  </div>
</section>
<section class="section section--clair" id="illustratrices" aria-labelledby="titre-illus">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Les illustratrices</p>
      <h2 id="titre-illus">Maude Villatte et Lola Jacquet</h2>
      <div class="texte">
        <p>Les dessins des plaques sont signés de deux illustratrices. Pour Aquensis, elles ont dessiné 60 illustrations du patrimoine, de la flore et de la faune de la Bigorre.</p>
        <p>Chaque dessin est ensuite adapté à la découpe laser, jusqu’au titre en lettrage pochoir.</p>
      </div>
      <p class="liens-illus"><a class="lien-fleche" href="https://www.instagram.com/maude.villatte/">Maude Villatte sur Instagram</a><a class="lien-fleche" href="https://www.lolajacquet.com/">Le site de Lola Jacquet</a></p>
    </div>
    <figure class="planche">{planche}<figcaption>Dessins inédits de l’atelier, pas encore dans la collection.</figcaption></figure>
  </div>
</section>
<section class="section" id="avis" aria-labelledby="titre-avis-tous">
  <div class="wrap">
    <div class="entete-section entete-section--ligne">
      <div><p class="surtitre">Les avis</p><h2 id="titre-avis-tous">Les avis des clients</h2></div>
    </div>
    <p class="avis-vide">Pas encore d’avis.</p>
    <div class="encadre politique-avis" id="politique-avis">
      <h3>Comment sont publiés les avis</h3>
      <p>Les avis sont publiés sous 7 jours au plus et restent en ligne 3 ans. Un avis est refusé ou retiré s’il contient des propos injurieux, grossiers ou diffamatoires, s’il est hors sujet, s’il donne des données personnelles, s’il porte sur un produit que l’atelier ne vend pas, s’il fait de la publicité ou s’il fait doublon. L’auteur d’un avis refusé est prévenu, avec la raison.</p>
      <ul class="liste-simple">
        <li>Contrepartie offerte aux auteurs d’avis : aucune.</li>
        <li>Les avis sont publiés <strong>sans vérification d’achat</strong> : rien ne garantit que leur auteur a acheté la plaque.</li>
        <li>Ils sont affichés du plus récent au plus ancien, avec leur date.</li>
      </ul>
      <p>Un doute sur un avis ? Signalez-le à <a href="mailto:contact@terregravee.fr">contact@terregravee.fr</a>.</p>
    </div>
  </div>
</section>""".format(
        photo=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre ; au-dessus, une rangée de panneaux en métal découpé, rétroéclairés : le décor d’origine",
                  "(max-width: 900px) 92vw, 680px", eager=True),
        rayon=RAYON + ".", ref=note("ville au centre à choisir", "decision"), etapes=etapes(detail=True),
        planche=planche("Planche de dix-sept dessins inédits : la Vierge du Bédat, la brèche de Roland, l’iris, le gypaète barbu…"))
    page("atelier.html", "L’atelier, l’origine et la fabrication · Terre Gravée",
         "L’histoire de Terre Gravée, née du décor conçu pour Aquensis à Bagnères-de-Bigorre ; la fabrication de Revel à Bagnères ; les illustratrices ; la politique des avis.",
         contenu, actif="atelier.html", classe="page-atelier")


# ---------------------------------------------------------------------------
# Sur mesure
# ---------------------------------------------------------------------------

def sur_mesure():
    options = "".join("<option>{}</option>".format(e(p["nom"])) for p in PLAQUES)
    contenu = """
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Créations spéciales</p>
    <h1>Sur mesure</h1>
    <p class="chapo">Un modèle vous plaît mais il vous le faut plus grand, dans un autre métal ou en série ? Voici ce que l’atelier peut faire, et ce qu’il ne fait pas.</p>
  </header>
</div>
<section class="section section--haut-serre">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Dès une plaque</p>
      <h2>Adapter un modèle existant</h2>
      <ul class="liste-simple">
        <li>Un autre format, jusqu’à 2 m × 1 m.</li>
        <li>Un autre métal : aluminium dans la teinte RAL de votre choix, acier Corten ou aluminium brut.</li>
        <li>Une autre fixation.</li>
      </ul>
      <p class="attenue">Possible dès une seule plaque, selon faisabilité. Prix sur devis. Fabrication en 1 à 2 mois après validation du devis, avec un acompte de 30 % à la commande. Une pièce adaptée à votre demande n’est pas couverte par le droit de rétractation.</p>
      <div class="encadre encadre--doux"><h3>Grands formats {prep}</h3><p>Bientôt, en 60 × 120 cm, à 150 € : Le Cirque de Gavarnie, Le Tourmalet, Le Pont d’Espagne et Le Pic du Midi.</p></div>
    </div>
    <div class="paire-materiaux">
      <figure><div class="plaque">{corten}</div><figcaption>Acier Corten</figcaption></figure>
      <figure><div class="plaque">{brut}</div><figcaption>Aluminium brut</figcaption></figure>
    </div>
  </div>
</section>
<section class="section section--sauge" id="exclusives">
  <div class="wrap deux-colonnes">
    <figure class="planche">{planche}<figcaption>Dessins inédits de l’atelier : paysages, fleurs et faune des Pyrénées</figcaption></figure>
    <div class="offre">
      <p class="surtitre">Dessins inédits</p>
      <h2>Les prochains dessins</h2>
      <p class="attenue">Certains dessins ne sont pas encore entrés dans la collection. Ils sortent ponctuellement.</p>
      <p class="attenue">La lettre d’information prévient de chaque sortie, une lettre par trimestre au plus.</p>
      <p><a class="lien-fleche" href="index.html#lettre">S’inscrire à la lettre</a></p>
    </div>
  </div>
</section>
<section class="section" id="series">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="offre">
      <p class="surtitre">Professionnels, collectivités, lieux culturels</p>
      <h2>Séries sur demande</h2>
      <ul class="liste-simple">
        <li>Une frise qui raconte une histoire locale.</li>
        <li>Des plaques signalétiques au style artistique.</li>
        <li>Des éditions spéciales pour une exposition, un événement ou un lieu touristique.</li>
      </ul>
      <p class="attenue">La quantité minimale dépend du projet.</p>
    </div>
    <div class="encadre">
      <h3>Ce que l’atelier ne fait pas</h3>
      <p class="attenue">Pas de pièce entièrement personnalisée sur simple demande : prénom, citation ou photo. Chaque dessin suit la démarche artistique de l’atelier.</p>
    </div>
  </div>
</section>
<section class="section section--clair" id="demande">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="entete-section"><p class="surtitre">Demande de devis</p><h2>Décrire votre projet</h2><p class="chapo">Plus la demande est précise, plus la réponse sera rapide. Un croquis ou une photo du lieu aide beaucoup.</p></div>
    <form class="formulaire" data-demo>
      <div class="champs">
        <div class="champ"><label for="type-demande">Type de demande</label><select id="type-demande" name="type"><option>Adapter un modèle existant</option><option>Un dessin inédit</option><option>Série pour un professionnel</option></select></div>
        <div class="champ"><label for="modele">Modèle de départ</label><select id="modele" name="modele"><option>Aucun en particulier</option>{options}</select></div>
        <div class="champ"><label for="metal">Métal souhaité</label><select id="metal" name="metal"><option>Aluminium, teinte RAL</option><option>Acier Corten</option><option>Aluminium brut</option><option>Je ne sais pas encore</option></select></div>
        <div class="champ"><label for="format">Format</label><input id="format" name="format" type="text" placeholder="Par exemple 100 × 50 cm"><small>Jusqu’à 2 m × 1 m</small></div>
        <div class="champ"><label for="quantite-projet">Quantité</label><input id="quantite-projet" name="quantite" type="number" min="1" value="1"></div>
        <div class="champ"><label for="usage">Usage</label><select id="usage" name="usage"><option>Intérieur</option><option>Extérieur</option><option>Les deux</option></select></div>
        <div class="champ champ--large"><label for="message-projet">Votre projet</label><textarea id="message-projet" name="message" rows="4" placeholder="Lieu, support, délai souhaité…"></textarea></div>
        <div class="champ champ--large"><label for="fichier">Croquis ou photo (facultatif)</label><input id="fichier" name="fichier" type="file" accept="image/*,.pdf"></div>
        <div class="champ"><label for="nom-projet">Nom</label><input id="nom-projet" name="nom" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="email-projet">E-mail</label><input id="email-projet" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div><button class="btn" type="submit">Envoyer la demande</button></div>
      <p class="formulaire__aide">Vos coordonnées servent uniquement à répondre à cette demande.</p>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé. Sur le site, la demande arrivera à contact@terregravee.fr.</p>
    </form>
  </div>
</section>""".format(prep=A_PREPARATION,
                     corten=img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten", eager=True),
                     brut=img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", eager=True),
                     planche=planche("Planche de dix-sept dessins inédits : Payolle, la brèche de Roland, le gypaète barbu, l’iris…"),
                     options=options)
    page("sur-mesure.html", "Créations sur mesure · Terre Gravée",
         "Plaques en métal sur mesure : format jusqu’à 2 m × 1 m, acier Corten, aluminium brut, prix sur devis, 1 à 2 mois de fabrication. Bientôt des grands formats de 60 × 120 cm à 150 €.",
         contenu, actif="sur-mesure.html", classe="page-sur-mesure")


# ---------------------------------------------------------------------------
# Installation
# ---------------------------------------------------------------------------

def installation():
    contenu = """
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Aide</p>
    <h1>Installation et kit LED</h1>
    <p class="chapo">La pose prend quelques minutes et ne demande aucun outil.</p>
  </header>
</div>
<section class="section section--haut-serre">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Fixation</p>
      <h2>Une pose sans perçage</h2>
      <div class="texte">
        <p>Chaque plaque est livrée avec deux fixations adhésives 3M Command™. La pose est simple et rapide, sans perçage.</p>
        <p>Les fixations créent un léger décalage avec le mur. La découpe projette ses ombres.</p>
      </div>
      <p><a class="lien-fleche" href="https://command.3mfrance.fr/3M/fr_FR/command-EU/how-to/how-to-hang-picture-without-nails/#Stepbystep">Notice de pose sur le site 3M</a></p>
    </div>
    <div class="paire-materiaux">
      <figure>{pic}<figcaption>60 × 30 cm, 2 mm d’épaisseur</figcaption></figure>
      <figure><div class="plaque">{dos}</div><figcaption>Le dos d’une plaque, ruban LED posé</figcaption></figure>
    </div>
  </div>
</section>
<section class="section section--sauge" id="led">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Kit LED</p><h2>Poser le rétroéclairage</h2>
      <p class="chapo">Le kit se commande en option avec une plaque : l’atelier le colle au dos avant l’envoi, à la sortie de câble choisie. Les cinq étapes ci-dessous servent si vous devez le reposer, ou si vous utilisez votre propre ruban.</p></div>
    <div class="deux-colonnes deux-colonnes--haut kit-contenu">
      <figure>{kit}<figcaption>Le contenu du kit</figcaption></figure>
      <ul class="liste-simple">
        <li>Ruban LED RGB autocollant avec raccord, longueur 2 m</li>
        <li>Contrôleur intégré au ruban</li>
        <li>Câble USB, sans chargeur : à brancher sur un chargeur USB ou un port USB</li>
        <li>Télécommande</li>
        <li>Application smartphone</li>
        <li>Dehors : à l’abri de la pluie</li>
      </ul>
    </div>
    <ol class="tableau-etapes">
      <li>{t2}<h3>Préparer</h3><p>Choisissez l’emplacement de l’alimentation. Nettoyez le dos de la plaque, puis collez le ruban en suivant le contour, en commençant côté raccord. Décollez la bande adhésive petit à petit.</p></li>
      <li>{t4}<h3>Faire les angles</h3><p>Formez un arrondi doux à chaque angle, sans pli brusque.</p></li>
      <li>{t5}<h3>Ajuster la longueur</h3><p>Coupez l’excédent uniquement sur une zone de découpe, repérée par un petit espace doré sur le ruban.</p></li>
      <li>{t6}<h3>Raccorder</h3><p>Branchez le raccord en respectant le sens des flèches.</p></li>
      <li>{t7}<h3>Régler la lumière</h3><p>Télécommande, boutons du ruban ou application : couleur, intensité, minuteur et effets.</p></li>
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Questions fréquentes</p><h2>Avant de poser</h2></div>
    <div class="faq">
      <details><summary>La plaque peut-elle aller en extérieur ?</summary><div><p>Oui, sans restriction. L’aluminium thermolaqué convient dehors comme dedans.</p><p>Les fixations adhésives fournies sont prévues pour l’intérieur. Fixation conseillée en extérieur {fournir}</p></div></details>
      <details><summary>Le kit LED est-il nécessaire ?</summary><div><p>Non, c’est une option à cocher sur la fiche de la plaque. La plaque se pose seule avec les deux fixations fournies.</p></div></details>
      <details><summary>Le kit LED peut-il aller dehors ?</summary><div><p>Oui, à l’abri de la pluie.</p></div></details>
      <details><summary>Faut-il un chargeur ?</summary><div><p>Le kit est livré avec son câble USB, sans chargeur. Branchez-le sur un chargeur USB ou sur un port USB.</p></div></details>
      <details><summary>Puis-je utiliser un autre ruban LED ?</summary><div><p>Oui. Les plaques sont compatibles avec la plupart des bandes LED du marché.</p></div></details>
    </div>
  </div>
</section>""".format(
        pic=plaque(PRODUITS["le-pic-du-midi"], "gris", "(max-width: 900px) 40vw, 240px", eager=True),
        dos=img("tuto/tuto-3.webp", "Dos de la plaque L’Isard avec le ruban LED collé sur le pourtour", eager=True),
        kit=img("tuto/tuto-0.webp", "Contenu du kit LED : ruban, télécommande, câble USB"), fournir=A_FOURNIR,
        t2=img("tuto/tuto-2.webp", "Décollement progressif de la bande adhésive du ruban"),
        t4=img("tuto/tuto-4.webp", "Ruban LED formant un arrondi dans un angle"),
        t5=img("tuto/tuto-5.webp", "Découpe du ruban LED sur une zone de coupe"),
        t6=img("tuto/tuto-6.webp", "Branchement du raccord du ruban"),
        t7=img("tuto/tuto-7.webp", "Télécommande du kit LED"))
    page("installation.html", "Installation et kit LED · Terre Gravée",
         "Poser une plaque Terre Gravée sans perçage avec les fixations 3M Command fournies, et le kit LED, collé au dos par l’atelier : contenu, usage et notice pour le reposer.",
         contenu, classe="page-installation")


# ---------------------------------------------------------------------------
# Contact, livraison, rétractation
# ---------------------------------------------------------------------------

def contact():
    contenu = """
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Contact</p>
    <h1>Écrire à l’atelier</h1>
    <p class="chapo">Une question sur une plaque, une commande ou un projet ? Écrivez-nous. Pour un projet sur mesure, <a href="sur-mesure.html#demande">le formulaire dédié</a> permet de tout préciser en une fois.</p>
  </header>
</div>
<section class="section section--haut-serre">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <dl class="coordonnees">
      <div><dt>E-mail</dt><dd class="copie"><code id="adresse-email">contact@terregravee.fr</code><button type="button" data-copier="adresse-email">Copier</button></dd></div>
      <div><dt>Téléphone</dt><dd>{tel}</dd></div>
      <div><dt>Adresse postale</dt><dd>Terre Gravée, Romain Fourneaux EI<br>16 rue du Pic du Midi<br>65200 Gerde<br><span class="attenue">Pas d’accueil du public</span></dd></div>
    </dl>
    <form class="formulaire" data-demo>
      <div class="champs">
        <div class="champ"><label for="nom-contact">Nom</label><input id="nom-contact" name="nom" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="email-contact">E-mail</label><input id="email-contact" name="email" type="email" autocomplete="email" required></div>
        <div class="champ champ--large"><label for="sujet">Sujet</label><select id="sujet" name="sujet"><option>Une question sur un modèle</option><option>Ma commande</option><option>Un projet sur mesure</option><option>Autre</option></select></div>
        <div class="champ champ--large"><label for="message-contact">Message</label><textarea id="message-contact" name="message" rows="5" required></textarea></div>
      </div>
      <div><button class="btn" type="submit">Envoyer</button></div>
      <p class="formulaire__aide">Vos coordonnées servent uniquement à vous répondre.</p>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé. Sur le site, le message arrivera à contact@terregravee.fr.</p>
    </form>
  </div>
</section>
<section class="section section--sauge" id="retractation" aria-labelledby="titre-retractation">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="entete-section">
      <p class="surtitre">Rétractation</p>
      <h2 id="titre-retractation">Renoncer au contrat ici</h2>
      <p class="chapo">Vous avez 14 jours après réception pour vous rétracter, sans avoir à vous justifier. Remplissez la déclaration, puis confirmez-la : un accusé de réception vous est envoyé par e-mail.</p>
      <p class="attenue petit">Les frais de retour sont à votre charge. Vous répondez seulement d’une dépréciation due à d’autres manipulations que celles nécessaires pour examiner la plaque. Les pièces personnalisées sont exclues.</p>
      <p class="attenue petit">Adresse de retour : {retour}.</p>
    </div>
    <form class="formulaire retract" data-retract>
      <fieldset class="retract__etape" data-retract-etape="1">
        <legend>1. Votre déclaration de rétractation</legend>
        <div class="champs">
          <div class="champ"><label for="nom-retract">Nom</label><input id="nom-retract" name="nom" type="text" autocomplete="name" required></div>
          <div class="champ"><label for="commande-retract">Numéro de commande</label><input id="commande-retract" name="commande" type="text" required></div>
          <div class="champ champ--large"><label for="email-retract">E-mail utilisé pour la commande</label><input id="email-retract" name="email" type="email" autocomplete="email" required></div>
          <div class="champ champ--large"><label for="articles-retract">Articles concernés (facultatif)</label><input id="articles-retract" name="articles" type="text"><small>Sans précision, la rétractation porte sur toute la commande.</small></div>
        </div>
        <button class="btn" type="submit">Renoncer au contrat</button>
      </fieldset>
      <div class="retract__etape" data-retract-etape="2" hidden>
        <p class="retract__resume" tabindex="-1" data-retract-resume>2. Vérifiez puis confirmez votre rétractation.</p>
        <p class="retract__boutons"><button class="btn" type="button" data-retract-confirmer>Confirmer la rétractation</button><button class="btn btn--ligne" type="button" data-retract-retour>Modifier</button></p>
      </div>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé. Sur le site, un accusé de réception partira aussitôt par e-mail.</p>
    </form>
  </div>
</section>
<section class="section" id="livraison" aria-labelledby="titre-faq">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Livraison, retours, paiement</p><h2 id="titre-faq">Questions fréquentes</h2></div>
    <div class="faq">
      <details open><summary>Quand vais-je recevoir ma plaque ?</summary><div><p>{expedition} : c’est le temps de préparation avant l’envoi. Les plaques partent de Bagnères-de-Bigorre. Délai maximal de livraison : {delai}</p><p>{noel} {revoir}</p></div></details>
      <details><summary>Où livrez-vous, et comment ?</summary><div><p>En {zone}. Trois modes au choix : Colissimo en point retrait, Mondial Relay en point relais, ou Chronopost. Pas de retrait sur place à Gerde.</p></div></details>
      <details><summary>Combien coûte la livraison ?</summary><div><p>5 € par commande, quel que soit le nombre d’articles et le mode choisi {tarif}. La carte cadeau seule, envoyée par e-mail, n’a pas de frais de port. Le montant s’affiche dans le panier, avant la validation.</p><p>{offre} {dates} (offre de fin d’année).</p></div></details>
      <details><summary>Puis-je changer d’avis ?</summary><div><p>Oui. Vous avez 14 jours après réception pour vous rétracter, comme la loi le prévoit. Les frais de retour restent à votre charge et les pièces personnalisées sont exclues. Adresse de retour : {retour}. <a href="#retractation">Renoncer au contrat ici</a></p></div></details>
      <details><summary>Ma plaque est arrivée abîmée, que faire ?</summary><div><p>Envoyez une photo et une description par e-mail. Vous choisissez : une nouvelle plaque, sans frais, ou le remboursement. Toutes les plaques bénéficient aussi des garanties légales de conformité et des vices cachés.</p></div></details>
      <details><summary>Quels moyens de paiement ?</summary><div><p>Carte bancaire (Stripe), PayPal, Apple Pay et Google Pay.</p></div></details>
      <details><summary>Comment fonctionne la carte cadeau ?</summary><div><p>Elle vaut une plaque au choix, sur tous les modèles disponibles, même si le prix change. Elle est valable 2 ans à compter de l’achat, envoyée par e-mail ou à imprimer. La livraison de la plaque reste à payer : 5 € ({offre_court}).</p></div></details>
      <details><summary>Un désaccord avec l’atelier ?</summary><div><p>Écrivez d’abord à contact@terregravee.fr. Si le désaccord persiste, vous pouvez saisir gratuitement le médiateur de la consommation : {mediateur}</p></div></details>
    </div>
  </div>
</section>""".format(tel=TELEPHONE, expedition=EXPEDITION, delai=A_FOURNIR, noel=NOEL, revoir=note("à revoir avec le délai de transport"),
                     zone=ZONE_LIVRAISON, offre=OFFRE, dates=note("dates à confirmer"), offre_court=OFFRE_COURT,
                     tarif=note("tarif par mode à confirmer", "decision"),
                     retour="Terre Gravée, 16 rue du Pic du Midi, 65200 Gerde", mediateur=MEDIATEUR)
    page("contact.html", "Contact, livraison et rétractation · Terre Gravée",
         "Écrire à Terre Gravée : contact@terregravee.fr. Livraison en France métropolitaine (hors Corse), expédition sous 2 à 4 jours ouvrés, paiement, formulaire « Renoncer au contrat ici ».",
         contenu, actif="contact.html", classe="page-contact")


# ---------------------------------------------------------------------------
# QR code d’Aquensis (version courte)
# ---------------------------------------------------------------------------

def qr_page():
    # Les douze plaques reprennent toutes des dessins du décor (réponse du 31 octobre 2026) : la page les montre toutes
    contenu = """
<div class="wrap">
  <header class="entete-page qr-tete">
    <div class="qr-tete__texte">
      <p class="surtitre">Depuis le QR code d’Aquensis</p>
      <h1>Vous avez vu le décor d’Aquensis ?</h1>
            <p class="chapo">Les panneaux découpés et rétroéclairés, au-dessus des bassins, sont à l’origine de Terre Gravée. Les douze plaques de la collection reprennent des dessins de ce décor, en 60 × 30 cm pour la maison : <strong>65 € la plaque</strong>, en noir, gris ou doré.</p>
      <p class="heros__actions"><a class="btn" href="collection.html">Voir la collection</a><a class="btn btn--ligne" href="carte.html#aquensis">Aquensis sur la carte</a></p>
    </div>
    <figure class="qr-tete__photo">{photo}<figcaption>Photo réelle · le décor d’origine à Aquensis, Bagnères-de-Bigorre</figcaption></figure>
  </header>
</div>
<section class="section section--sauge">
  <div class="wrap">
    <div class="entete-section entete-section--ligne"><div><p class="surtitre">Paysages, patrimoine, faune</p><h2>Les 12 plaques tirées du décor</h2></div><a class="lien-fleche" href="atelier.html#origine">Lire l’histoire d’Aquensis</a></div>
    {grille}
  </div>
</section>
<div class="wrap">
  <aside class="encadre qr-note" aria-labelledby="titre-qr-note">
    <h2 id="titre-qr-note">Note de maquette, pour Romain</h2>
    <p>Cette page reçoit les visiteurs qui scannent le QR code des panneaux d’Aquensis. Elle n’est pas dans le menu.</p>
    <p>Le QR code est déjà posé : un code imprimé ne change plus d’adresse. Sur le site réel, cette page devra donc répondre à l’adresse que contient ce QR code, à relever sur l’image du dossier Marketing du Drive {fournir}. Pas de paramètre de suivi à ajouter : pour compter les visites venues du panneau, il faudra lire cette adresse dans l’outil de mesure, sans cookie ou après consentement.</p>
  </aside>
</div>""".format(photo=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre et, au-dessus, les panneaux découpés et rétroéclairés du décor d’origine",
                           "(max-width: 900px) 92vw, 560px", eager="haute"),
                 grille=grille(PLAQUES, eager=4), fournir=note("adresse du QR code à fournir"))
    page("qr.html", "Vous avez vu le décor d’Aquensis ? · Terre Gravée",
         "Vous avez vu le décor d’Aquensis à Bagnères-de-Bigorre ? Les douze plaques de la collection reprennent ses dessins, en 60 × 30 cm, 65 € la plaque.",
         contenu, classe="page-qr")


# ---------------------------------------------------------------------------
# Notes : relevé du site actuel (v0) et essentiel de la stratégie (v1)
# ---------------------------------------------------------------------------

def src(url, label):
    return '<a class="source" href="{}">{}</a>'.format(e(url), label)


CONSTATS = [
    ("urgent", "Les 9 avis du site actuel sont à retirer.",
     "Ils ne peuvent pas être présentés comme des avis de clients vérifiés (Code de la consommation, art. L121-4 ; sanctions à l’art. L132-2). À retirer tout de suite du site actuel : WooCommerce › Produits › Avis. La maquette n’en affiche plus aucun ; les vrais avis à venir suivront la politique que vous avez validée."),
    ("urgent", "« Moi-même » ne peut pas être le médiateur de la consommation.",
     "Le médiateur doit être une personne ou un organisme indépendant et impartial (art. L613-1), référencé par la Commission d’évaluation et de contrôle de la médiation de la consommation (CECMC). Vous devez garantir au client un recours effectif à ce médiateur (art. L612-1) et donner ses coordonnées (art. L616-1) ; amende administrative jusqu’à 3 000 € pour une personne physique (art. L641-1). À faire : adhérer à un médiateur référencé (liste sur economie.gouv.fr/mediation-conso), puis donner son nom et son adresse. Les pages gardent un marqueur « médiateur à fournir »."),
    ("urgent", "Le site actuel affiche « Série limitée ».",
     "Les plaques ne portent pas de numéro et une série épuisée est refaite à l’identique : l’allégation est trompeuse (art. L121-2). À retirer des fiches produit et de l’accueil. La maquette ne parle plus ni de série limitée ni de numéro."),
    ("urgent", "Les liens Facebook, Instagram et X de la page Contact mènent aux comptes de Hostinger.",
     "Ce sont les liens par défaut du thème. Vous n’avez pas de compte : à retirer."),
    ("urgent", "Un produit vide « AUTO-DRAFT » est publié.",
     "L’adresse /produits/tr/ apparaît dans le catalogue et peut être indexée par Google. À mettre à la corbeille dans WooCommerce › Produits."),
    ("urgent", "Les mentions légales contiennent encore des champs à remplir.",
     "La page affiche « SIRET : [à compléter] » et « Téléphone : [optionnel] » : votre numéro peut y figurer. Le numéro de téléphone de l’hébergeur, exigé par la LCEN, manque aussi."),
    ("urgent", "Les CGV pointent vers un mauvais domaine.",
     "Le lien affiché « www.terregravee.fr » mène en réalité à www.terresgravees.fr, qui ne répond pas. Le lien vers la politique de confidentialité est vide, et le vendeur est nommé « Terres Gravées »."),
    ("important", "Le formulaire type de rétractation manque.",
     "Les CGV décrivent bien le délai de 14 jours, mais le modèle de formulaire prévu par le Code de la consommation (art. L221-5) n’est pas fourni."),
    ("important", "Des cookies de suivi sont déposés avant le consentement.",
     "Dix cookies (sbjs_* pour l’attribution des commandes WooCommerce, tk_* pour les statistiques Jetpack) arrivent dès l’ouverture de la page. Google Analytics et Google Ads attendent bien le clic sur le bandeau. Deux propriétés Google Analytics sont chargées en double (G-HG9HTJQDV7 et G-E5TQ05HCMQ)."),
    ("important", "Un lien de l’accueil est cassé.",
     "Le bouton « Voir » du bloc « Montage facile » mène à /infosinstallation/ (erreur 404). La page existe à l’adresse /tuto/."),
    ("important", "Les compteurs de catégories de l’accueil sont faux.",
     "L’accueil affiche 24 paysages, 32 animaux, 50 flore et 3 architecture. Le catalogue compte 5, 4, 0 et 4 modèles, et le lien Flore est vide."),
    ("important", "La page boutique s’intitule « prod Archives ».",
     "Le titre reprend le nom technique de la catégorie « prod ». La page n’a pas non plus de titre principal (H1)."),
    ("important", "Deux finitions sont vendues sans photo.",
     "Le Cerf en noir et L’Abbaye de l’Escaladieu en doré. La maquette le signale par un emplacement « photo à venir »."),
    ("important", "La longueur du ruban LED change selon la page.",
     "2 mètres sur la fiche du kit, 1,5 mètre sur la page Infos & installation. La bonne longueur est 2 m : la page Infos & installation est à corriger."),
    ("confort", "La fiche produit est lourde et le prix arrive tard.",
     "225 requêtes et 2,5 Mo de scripts : Stripe, PayPal, Apple Pay, Google Pay et hCaptcha se chargent dès l’affichage d’une plaque. Le prix apparaît sous les boutons de paiement."),
    ("confort", "Les descriptions Google se répètent.",
     "À propos, Contact et la boutique partagent la même description (« Découvrez nos articles… »), qui évoque un blog inexistant. Celle de Créations spéciales dépasse 400 caractères."),
    ("confort", "Le pied de page liste les variantes du nom.",
     "« Terre Gravé, Terregrave, Terres gravees… » ressemble à du bourrage de mots-clés. Ces variantes peuvent passer dans les données structurées (alternateName)."),
    ("confort", "Quelques fautes et accents manquants.",
     "« Meilleurs ventes » (à renommer « Nos coups de cœur »), « Retro-eclairage », « Le Chateau de Mauvezin », « Condition general de vente », « A propos », et « Terres Gravées » dans les fiches produit."),
    ("confort", "Plusieurs images n’ont pas de texte alternatif.",
     "Les photos du Pic du Midi et les mises en situation n’ont pas de description. Elle sert à l’accessibilité et à Google Images."),
]

TECHNIQUES = [
    ("Le mur d’exposition et la lumière",
     "Premier écran de l’accueil : trois plaques accrochées avec leur ombre, et l’interrupteur qui simule le kit LED en cinq couleurs.",
     "Montrer l’objet et l’effet du rétroéclairage avant l’achat. Aucune étude citée : hypothèse à tester.",
     "Clics sur l’interrupteur, taux d’ajout du kit LED sur les fiches."),
    ("Le kit LED proposé là où il sert",
     "Option non cochée sur chaque fiche de plaque, avec la sortie du câble et le prix mis à jour.",
     "Les suggestions doivent être peu nombreuses, pertinentes et expliquées, accessoires nécessaires d’abord (" + src("https://baymard.com/blog/product-recommendations-cart", "Baymard") + ") ; jamais d’option pré-cochée (" + src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g") + ").",
     "Taux d’attache du kit LED, panier moyen."),
    ("Une histoire d’origine vraie",
     "Accueil (section L’atelier), page L’atelier, étoile « Le décor d’origine » sur la carte, page qr.html.",
     "L’immersion dans un récit agit sur les attitudes des lecteurs (méta-analyse de van Laer et al., 2014, " + src("https://openaccess.city.ac.uk/id/eprint/6755/", "City, University of London") + "). Ici l’histoire est vérifiable, avec une photo réelle. Aucune étude trouvée sur l’effet commercial d’une histoire d’origine pour un artisan : hypothèse à tester.",
     "Clics sur « Lire l’histoire », visites de qr.html."),
    ("Une carte simple des lieux",
     "Aperçu sur l’accueil, page carte.html : repères numérotés, petite fiche, liste des lieux en dessous.",
     "Aucune étude trouvée sur l’effet commercial d’une carte : hypothèse à tester. Une carte accessible doit être opérable au clavier, ne pas dépendre de la couleur et proposer une alternative texte (" + src("https://www.boia.org/blog/interactive-maps-and-accessibility-4-tips", "BOIA") + ") : c’est le rôle de la liste.",
     "Clics sur les repères, parcours carte → fiche → panier."),
    ("Le trajet de fabrication, en clair",
     "Quatre étapes de Revel à Bagnères-de-Bigorre, sur l’accueil et la page L’atelier.",
     "Rendre le travail visible augmente la valeur perçue (Buell et Norton, Management Science, 2011, " + src("https://ideas.repec.org/a/inm/ormnsc/v57y2011i9p1564-1579.html", "IDEAS") + ").",
     "Clics vers la fabrication, conversion des visiteurs qui l’ont vue (corrélation, pas causalité)."),
    ("Des avis vrais, demandés après la livraison",
     "Un e-mail envoyé après réception invite le client à laisser un avis. En attendant, la page L’atelier affiche « Pas encore d’avis » et la politique des avis ; la mention « sans vérification d’achat » reste. Les 9 avis actuels ne sont pas repris.",
     "Avec 5 avis, la probabilité d’achat serait 270 % plus élevée qu’avec zéro (" + src("https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales", "Spiegel Research Center") + ", données d’un seul distributeur). Seuls de vrais avis comptent (L121-4, L132-2).",
     "Avis reçus par mois, part des clients qui répondent à l’e-mail."),
    ("Coût total et délais près du bouton",
     "Trois garanties sous le bouton d’ajout (livraison, retours, paiement) : frais de port de 5 €, zone de livraison et délai d’expédition annoncés sous le bouton, dans la FAQ et dans le panier.",
     "64 % des testeurs cherchent les frais de port sur la fiche (" + src("https://baymard.com/blog/show-shipping-costs-on-product-pages", "Baymard") + ") ; 41 % des sites n’indiquent pas de date de livraison à l’étape du choix de livraison (" + src("https://baymard.com/blog/shipping-speed-vs-delivery-date", "Baymard") + ").",
     "Taux d’abandon de panier, questions « quand vais-je recevoir ? »."),
    ("La barre d’achat collante sur mobile",
     "Reprise de la v0 : le nom, le prix et le bouton restent en bas de l’écran quand on fait défiler une fiche.",
     "Elle ne gagne qu’entre 12,5 et 27 % des tests selon " + src("https://cleancommit.io/blog/sticky-add-to-cart-buttons/", "Cleancommit") + " : à mesurer avant de la garder.",
     "Taux d’ajout au panier sur mobile, avant et après."),
    ("Une lettre d’information honnête",
     "Fin de l’accueil : une adresse, une case non cochée, le rythme annoncé (une lettre par trimestre au plus), le bloc « Bientôt ».",
     "Une inscription rapide qui dit ce que contient la lettre (" + src("https://www.nngroup.com/articles/newsletters/", "NN/g") + "). Consentement séparé si l’on mesure l’ouverture des lettres (" + src("https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels", "CNIL, délibération n° 2026-042") + ").",
     "Inscriptions pour 100 visiteurs, désinscriptions."),
]

LEGAL = [
    ("Bouton de rétractation", "L’ordonnance n° 2026-2 du 5 janvier 2026 transpose la directive (UE) 2023/2673 ; le décret n° 2026-3 du même jour en fixe les modalités. Depuis le 19 juin 2026, le site doit offrir sans frais une fonction « Renoncer au contrat ici », facile à trouver pendant tout le délai ; amende administrative jusqu’à 75 000 € pour une personne morale et, selon des commentateurs, 15 000 € pour une personne physique, votre cas {}. La maquette met un lien dans le pied de chaque page et un formulaire simulé en deux étapes sur la page Contact. ".format(note("à vérifier sur Légifrance")) + src("https://hlc.com/fr/publications/transposition-under-french-law-of-the-eu-mandatory-withdrawal-button-for-online-sales", "Hogan Lovells")),
    ("Avis en ligne", "Les 9 avis du site actuel ne peuvent pas être présentés comme des avis de clients vérifiés : la maquette n’en affiche aucun, ni note ni étoile (L121-4, L132-2). Pour les vrais avis à venir : mention « publiés sans vérification d’achat », dates, ordre du plus récent au plus ancien, et la politique que vous avez validée (publication sous 7 jours, conservation 3 ans, motifs de refus, auteur prévenu, aucune contrepartie) dans la rubrique « Comment sont publiés les avis » (L111-7-2 ; D111-16 à D111-19). " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049571119", "L111-7-2") + ", " + src("https://www.legifrance.gouv.fr/jorf/id/JORFARTI000035720943", "décret 2017-1436")),
    ("Médiateur de la consommation", "Un médiateur indépendant, référencé par la CECMC, est obligatoire (L612-1, L613-1) et ses coordonnées doivent figurer sur le site (L616-1) ; amende jusqu’à 3 000 € pour une personne physique (L641-1). « Moi-même » ne convient pas : voir les constats urgents. La maquette garde un marqueur dans le pied de page et la FAQ. " + src("https://www.economie.gouv.fr/mediation-conso", "economie.gouv.fr/mediation-conso")),
    ("Entrepreneur individuel", "Le nom est suivi de la mention « EI » sur les documents professionnels (décret n° 2022-725 du 28 avril 2022 ; art. R526-26 et suivants du Code de commerce) : « Romain Fourneaux EI » dans le pied de page et sur la page Contact."),
    ("Délai de livraison", "Le site doit annoncer un délai ou une date de livraison (L216-1). « Sous 2 à 4 jours ouvrés » est le temps de préparation avant l’envoi : le délai maximal de livraison reste à fournir et un marqueur l’attend dans la FAQ."),
    ("Kit LED", "Les informations de sécurité du fabricant (nom, adresse, référence, avertissements) doivent figurer là où le kit est vendu (règlement (UE) 2023/988, art. 19) : marqueur dans l’option LED de chaque fiche plaque et sur la page du kit."),
    ("Prix et réductions", "Aucun prix barré. Toute réduction future devra se référer au prix le plus bas des 30 derniers jours (L112-1-1). " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044549592", "Légifrance")),
    ("Pratiques commerciales trompeuses", "Aucun stock, délai, label ou partenariat inventé, ni série limitée ou numérotation (les plaques n’en ont pas). L’histoire d’Aquensis est citée avec l’accord écrit de la SEMETHERM (sur papier, à conserver), qui couvre aussi la photo des bassins et du décor et les panneaux avec QR code ; elle ne présente jamais de partenariat ni de point de vente. Les modèles en préparation sont montrés sans photo de plaque. La livraison offerte de fin d’année est annoncée sans compte à rebours. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563107", "L121-4 sur Légifrance")),
    ("Sur mesure", "Les pièces adaptées à la demande sont exclues du droit de rétractation (L221-28, 3°) : c’est écrit sur la page Sur mesure. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563170", "Légifrance")),
    ("Lettre d’information", "Case non cochée, finalité écrite, désinscription à chaque envoi (L34-5 CPCE, RGPD). " + src("https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique", "CNIL, prospection")),
    ("Polices", "La maquette charge Google Fonts pour être prête à l’emploi. Un tribunal de Munich a condamné en 2022 un site qui transmettait ainsi l’adresse IP des visiteurs à Google : sur le site réel, héberger les polices soi-même. " + src("https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html", "The Hacker News")),
    ("Formule « rayon de 150 km »", "Vous voulez la garder en nommant la ville au centre. Autour de Gerde, elle est fausse : Revel (31) est à environ {} km à vol d’oiseau. Centres qui la rendent vraie : {}. Autre solution : écrire « 160 km autour de Gerde ». Le mot « Dessin » est retiré de la formule : le lieu de travail des illustratrices n’est pas connu. Sur les pages, un marqueur « ville au centre à choisir » suit la formule.".format(
        KM_REVEL, " ; ".join("{} (Revel à {:.0f} km, Gerde à {:.0f} km)".format(v, km(c, REVEL), km(c, GERDE)) for v, c in CENTRES_150))),
]
for _v, _c in CENTRES_150:
    assert km(_c, REVEL) < 150 and km(_c, GERDE) < 150, "Centre du rayon de 150 km mal choisi : " + _v
assert km(GERDE, REVEL) < 160, "La formule « 160 km autour de Gerde » ne tient plus"

PALETTE = [
    ("Noir ardoise", "#2C2C2C", "Texte, bandeau de maquette, pied de page, fond du mur allumé."),
    ("Blanc cassé", "#F5F5F0", "Fond des pages, texte sur fond sombre."),
    ("Argent doux", "#D0D0D0", "Filets et séparations décoratives. Les bordures de champs passent à #7E7E77 pour atteindre 3 : 1."),
    ("Vert sauge très pâle", "#DCE2D4", "Sections secondaires : l’atelier, la lettre, le récit du lieu sur chaque fiche, la rétractation."),
    ("Cuivre clair", "#CBAA88", "Boutons d’action, texte noir ardoise ; étoile d’Aquensis sur la carte."),
    ("Cuivre foncé", "#80542B", "Texte d’accent (surtitres, cartels), parce que le cuivre clair ne passe pas en texte."),
]


def contraste(a, b):
    def lum(h):
        c = [int(h.lstrip("#")[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
        c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


CONTRASTES = [
    ("Texte blanc", "#FFFFFF", "cuivre clair", "#CBAA88", 4.5),
    ("Texte noir ardoise", "#2C2C2C", "cuivre clair", "#CBAA88", 4.5),
    ("Texte noir ardoise", "#2C2C2C", "blanc cassé", "#F5F5F0", 4.5),
    ("Texte secondaire", "#55554E", "vert sauge", "#DCE2D4", 4.5),
    ("Texte cuivre clair", "#CBAA88", "blanc cassé", "#F5F5F0", 4.5),
    ("Texte cuivre foncé", "#80542B", "blanc cassé", "#F5F5F0", 4.5),
    ("Texte cuivre foncé", "#80542B", "vert sauge", "#DCE2D4", 4.5),
    ("Bordure de champ", "#7E7E77", "blanc cassé", "#F5F5F0", 3.0),
]

# Les panneaux avec QR code d’Aquensis sont posés : l’idée est « en place » (texte de la section), elle sort de cette liste.
# Aucune de ces idées n’est à lancer dans les six prochains mois (réponse du 31 octobre 2026) : la liste reste en réserve.
IDEES = [
    ("Commerçants et restaurants qui exposent une plaque", "La carte peut recevoir un repère « Où voir une plaque » pour chaque lieu, avec son accord et la mention « plaque offerte par l’atelier ».",
     "La liste des lieux, l’accord écrit de chacun."),
    ("Offices de tourisme et boutiques des grands sites", "Une page « Où acheter », créée seulement quand un dépôt est signé. Aucun point de vente n’est annoncé avant.",
     "Les lieux à démarcher, le prix public en boutique."),
    ("Événements : fête du château de Mauvezin, montée du Tourmalet", "Un repère temporaire sur la carte et un QR code vers la lettre sur le stand.",
     "La participation et les dates."),
    ("Grands formats pour la ville", "Annoncés sur la page Sur mesure et dans le bloc « Bientôt » de l’accueil : 60 × 120 cm, 150 €.",
     "La ville à qui les proposer."),
    ("Offres pour les professionnels", "La page Sur mesure présente les séries et le formulaire propose « Série pour un professionnel ». Aucun chiffre affiché.",
     "Les conditions (délais, dégressivité éventuelle)."),
    ("Thèmes sportifs : cols, rugby", "D’autres cols prendraient place sur la carte comme le Tourmalet. Pour le rugby, un dessin sans logo ni nom de club.",
     "Les thèmes et les droits sur les noms."),
    ("Autres faunes et flores", "La planche des dessins inédits en contient déjà : l’iris, l’orchis maculée, les chardons bleus, la digitale pourpre, le grand tétras, le milan royal, le vautour fauve, le gypaète barbu. Chaque nouveau modèle passerait d’abord par le bloc « Bientôt ».",
     "Le choix des espèces et le calendrier."),
    ("Autres territoires", "Une carte par département, avec le même principe de repères numérotés.",
     "Les priorités, les illustrations, les marques à vérifier."),
]

A_FOURNIR_LISTE = [
    "Le nom et l’adresse du médiateur de la consommation auquel vous adhérez (« moi-même » ne convient pas : voir les constats urgents).",
    "Le délai maximal de livraison, ou une date, à annoncer dans la FAQ (L216-1). La date limite de Noël (commande au plus tard le 14 décembre) sera à revérifier avec ce délai.",
    "La fixation conseillée en extérieur.",
    "Les informations de sécurité du kit LED : nom et adresse du fabricant, référence, avertissements.",
    "L’outil d’envoi de la lettre d’information.",
    "Les dates exactes de la livraison offerte de fin d’année (proposées : du vendredi 27 novembre au lundi 14 décembre 2026 inclus).",
    "La ville au centre du rayon de 150 km.",
    "Les photos manquantes : Le Cerf en noir, L’Abbaye de l’Escaladieu en doré, une mise en situation du Cirque de Gavarnie et du Cerf.",
    "Des photos réelles de la fabrication : découpe à Revel, thermolaquage, emballage.",
    "L’adresse que contient le QR code posé à Aquensis (image du dossier Marketing du Drive).",
    "Le dessin du Jardin Massey.",
    "À vérifier sur Légifrance : le décret n° 2026-3 du 5 janvier 2026 (fonction de rétractation) et le plafond de l’amende pour une personne physique.",
]

A_VALIDER_LISTE = [
    "La formule du rayon de 150 km : Saint-Gaudens ou Lannemezan au centre, ou bien « 160 km autour de Gerde » (voir les points légaux).",
    "Les outils de mesure d’audience (votre réponse : « je ne sais pas »). Recommandation : une mesure d’audience exemptée de consentement, réglée selon les conditions de la CNIL, sans bandeau ; ou Google Analytics, avec un bandeau de consentement.",
    "Le tarif de 5 € pour les trois modes de livraison (Colissimo, Mondial Relay, Chronopost) : hypothèse de la maquette.",
    "La barre d’achat collante sur mobile, à mesurer.",
]

# Résumé court des réponses au questionnaire du 31 octobre 2026 (section « À fournir » des notes)
RECU_31_OCTOBRE = [
    "Entreprise : SIRET confirmé ; « Romain Fourneaux EI » dans le pied de page. Gerde ne reçoit pas de public : plus de repère sur la carte, adresse postale sur la page Contact.",
    "Médiateur : « moi-même » ne convient pas (constat urgent) ; un marqueur reste sur les pages.",
    "Livraison : France métropolitaine hors Corse ; Colissimo en point retrait, Mondial Relay en point relais, Chronopost ; 5 € par commande ; expédition sous 2 à 4 jours ouvrés ; commandes pour Noël jusqu’au 14 décembre 2026 ; retours au 16 rue du Pic du Midi ; colis abîmé : nouvelle plaque ou remboursement, au choix du client.",
    "Offre de fin d’année : livraison offerte, sur des dates proposées par la maquette (du 27 novembre au 14 décembre 2026), à confirmer. Le panier passe la livraison à 0 € pendant cette période.",
    "Avis : les 9 avis du site actuel ne sont plus affichés ; aucune contrepartie ; tout le monde pourra laisser un avis, « sans vérification d’achat » ; votre politique des avis est reprise mot pour mot sur la page L’atelier.",
    "Ni série limitée ni numéro gravé : retirés partout, remplacés par des faits (découpe au laser, thermolaquage, fabrication en Occitanie). « Meilleures ventes » devient « Nos coups de cœur ».",
    "Kit LED : vendu seulement en option d’une plaque (la page du kit n’a plus de bouton d’achat) ; collé au dos par l’atelier ; câble USB sans chargeur ; dehors à l’abri de la pluie. Plaque dehors : oui, sans restriction. Éco-organisme : aucun, rien à afficher.",
    "Carte cadeau : valable 2 ans, une plaque au choix même si le prix change, livraison de la plaque à payer (5 €).",
    "Textes « Le lieu » et « L’histoire du modèle » validés. Aucun réseau social : liens retirés. Logo au coq en place. Accord écrit des illustratrices : oui. Photos : Romain Fourneaux. Les 12 plaques reprennent toutes des dessins du décor d’Aquensis.",
    "SEMETHERM : l’accord couvre aussi la photo des bassins et du décor et les panneaux avec QR code, déjà posés.",
    "Sur mesure : 1 à 2 mois après validation du devis, pas de prix affiché, acompte de 30 %, aluminium brut proposé. Bientôt : La Transhumance, Le Jardin Massey et les grands formats (60 × 120 cm, 150 €), sans date. Le Casque du Lhéris n’est pas annoncé.",
    "Lettre : une par trimestre au plus, outil pas encore choisi. Données des clients : hors prestataires techniques, seul le transporteur voit les coordonnées ; la politique de confidentialité devra aussi citer les prestataires de paiement (Stripe, PayPal), l’hébergeur et l’outil de la lettre (RGPD, art. 13) ; durées de conservation validées (factures 10 ans, autres données de commande 5 ans, clients et prospects 3 ans, cookies de mesure 13 mois au plus, choix du bandeau gardé 6 mois), à reprendre dans la politique de confidentialité du site réel.",
]


def notes():
    constats = "".join('<li><h3><span class="niveau niveau--{n}">{n}</span>{t}</h3><p>{d}</p></li>'.format(n=n, t=e(t), d=e(d)) for n, t, d in CONSTATS)
    techs = "".join("""<article class="technique">
  <h3>{nom}</h3>
  <dl><div><dt>Où</dt><dd>{ou}</dd></div><div><dt>Pourquoi</dt><dd>{pq}</dd></div><div><dt>Indicateur</dt><dd>{kpi}</dd></div></dl>
</article>""".format(nom=e(n), ou=e(o), pq=p, kpi=e(k)) for n, o, p, k in TECHNIQUES)
    legal = "".join("<li><h3>{}</h3><p>{}</p></li>".format(e(t), d) for t, d in LEGAL)
    palette = "".join('<li class="palette__item"><span class="palette__couleur" style="background:{hx}" aria-hidden="true"></span><span class="palette__nom">{nom} <code>{hx}</code></span><span class="palette__role">{role}</span></li>'.format(
        nom=n, hx=hx, role=e(r)) for n, hx, r in PALETTE)
    lignes = []
    for ta, a, tb, b, seuil in CONTRASTES:
        r = contraste(a, b)
        ok = r >= seuil
        lignes.append('<tr><th scope="row"><span class="contraste__exemple" style="color:{a};background:{b}" aria-hidden="true">Aa</span>{ta} <code>{a}</code></th><td>{tb} <code>{b}</code></td><td class="num">{r} : 1</td><td class="{cls}">{v}</td></tr>'.format(
            a=a, b=b, ta=ta, tb=tb, r="{:.2f}".format(r).replace(".", ","), cls="contraste--ok" if ok else "contraste--non",
            v=("passe" if ok else "ne passe pas") + (" (objet graphique, 3 : 1)" if seuil == 3.0 else " (texte, 4,5 : 1)")))
    idees = "".join('<li><h3>{}</h3><p>{}</p><p class="attenue"><strong>Pour plus tard :</strong> {}</p></li>'.format(e(n), e(s), e(v)) for n, s, v in IDEES)
    contenu = """
<div class="wrap notes-page">
  <header class="entete-page">
    <p class="surtitre">Notes de la maquette · version 4</p>
    <h1>Galerie de territoire</h1>
    <p class="chapo">Romain, cette page réunit le relevé des problèmes du site actuel et l’essentiel de la stratégie : ce que garde la version 4, les techniques retenues, votre palette, vos idées, et ce qu’il reste à fournir ou à décider.</p>
  </header>
  <div class="notes-grille">
    <nav class="sommaire" aria-label="Sommaire">
      <p class="sommaire__titre">Sommaire</p>
      <ol>
        <li><a href="#n-version">La version 4 en bref</a></li>
        <li><a href="#n-constats">À corriger sur le site actuel</a></li>
        <li><a href="#n-techniques">Les techniques retenues</a></li>
        <li><a href="#n-palette">Votre palette</a></li>
        <li><a href="#n-idees">Vos idées, mises en œuvre</a></li>
        <li><a href="#n-legal">Points légaux</a></li>
        <li><a href="#n-fournir">À fournir et à valider</a></li>
        <li><a href="#n-limites">Limites de la maquette</a></li>
      </ol>
    </nav>
    <div class="notes-corps">
      <section class="note-bloc" id="n-version" aria-labelledby="t-version">
        <h2 id="t-version">La version 4 en bref</h2>
        <div class="texte">
          <p>Le mur d’exposition de la v0 était trop simple, le carnet de territoire de la v1 trop complexe. La version 4 garde la base de la v0 et lui ajoute, en version courte, ce que la v1 avait de plus parlant : la carte des lieux, l’histoire d’Aquensis et le texte de chaque lieu.</p>
        </div>
        <div class="trois-colonnes">
          <div><h3>Gardé de la v0</h3><ul class="liste-simple"><li>Le mur d’exposition et la simulation du rétroéclairage</li><li>Les cartes à pastilles et le bouton « Voir en »</li><li>La fiche claire, la barre d’achat sur mobile, le panier en tiroir</li><li>Les cartels, la bande de repères, la page Installation</li></ul></div>
          <div><h3>Pris de la v1, simplifié</h3><ul class="liste-simple"><li>Une carte des lieux à repères numérotés, sans filtres ni calques</li><li>L’histoire d’Aquensis, avec la photo réelle</li><li>Le paragraphe « Le lieu » sur chaque fiche</li><li>Le trajet de Revel à Bagnères dans les quatre étapes, le bloc « Bientôt », qr.html</li></ul></div>
          <div><h3>Laissé de côté</h3><ul class="liste-simple"><li>Grappes, filtres et calques de la carte, feuille modale</li><li>Idées cadeaux en grille, registre des avis sur l’accueil</li><li>Mode « carte de nuit » : le mode sombre suit l’appareil</li><li>Cartouches et graticules sur toutes les pages</li></ul></div>
        </div>
        <p class="attenue">Garde-fous : 5 entrées de menu, 7 sections sur l’accueil (la section des avis est retirée ; pendant la saison de Noël, le bloc de Noël passe en tête et reprend « Nos coups de cœur »), trois moments interactifs (la lumière du mur, les pastilles de finition, la carte).</p>
      </section>
      <section class="note-bloc" id="n-constats" aria-labelledby="t-constats">
        <h2 id="t-constats">À corriger sur le site actuel</h2>
        <p class="attenue">Relevé du 28 octobre 2026 sur terregravee.fr, complété le 31 octobre avec vos réponses, classé par urgence. La plupart des points urgents se corrigent en quelques minutes depuis WordPress ; le médiateur demande une adhésion.</p>
        <ol class="constats">{constats}</ol>
      </section>
      <section class="note-bloc" id="n-techniques" aria-labelledby="t-techniques">
        <h2 id="t-techniques">Les techniques retenues</h2>
        <p class="attenue">Niveau de preuve : fort pour Baymard, NN/g et les articles académiques ; moyen pour les sondages. Avec le trafic d’une micro-entreprise, préférer les comparaisons avant/après sur des périodes comparables aux tests A/B.</p>
        <div class="techniques">{techs}</div>
        <p class="attenue">Évité volontairement : compte à rebours, stock affiché, prix barré, option pré-cochée, fausse urgence.</p>
      </section>
      <section class="note-bloc" id="n-palette" aria-labelledby="t-palette">
        <h2 id="t-palette">Votre palette</h2>
        <p class="attenue">La charte « version centrée métal brut » sert de base. Le cuivre foncé est ajouté pour le texte d’accent. Le mode sombre suit le réglage de l’appareil.</p>
        <ul class="palette">{palette}</ul>
        <div class="tableau-defile" tabindex="0" role="region" aria-label="Tableau des contrastes, défilement horizontal"><table class="tableau">
          <caption class="visuellement-cache">Contrastes calculés entre les couleurs de la palette</caption>
          <thead><tr><th scope="col">Couleur</th><th scope="col">Sur</th><th scope="col">Contraste</th><th scope="col">Seuil WCAG AA</th></tr></thead>
          <tbody>{lignes}</tbody>
        </table></div>
        <p class="attenue">Typographie : Marcellus pour les titres, Jost pour le texte, Barlow Semi Condensed pour les cartels et les étiquettes de la carte, Allerta Stencil pour le nom TERRE GRAVÉE de l’en-tête, comme le lettrage pochoir des plaques. Votre logo au coq signe le site : l’emblème (la maison et le coq) à côté du nom dans l’en-tête, le logo complet dans le pied de page ; en mode sombre, son encre passe en clair.</p>
      </section>
      <section class="note-bloc" id="n-idees" aria-labelledby="t-idees">
        <h2 id="t-idees">Vos idées, mises en œuvre</h2>
        <p class="attenue">Les idées de votre document Contexte : ce que le site prévoit, ce qui reste à décider. Déjà en place : la carte des lieux, le sur-mesure, le kit LED, et les panneaux avec QR code à Aquensis, déjà posés (la page qr.html les attend). Aucune autre idée n’est à lancer dans les six prochains mois : la liste ci-dessous reste en réserve.</p>
        <ul class="idees">{idees}</ul>
      </section>
      <section class="note-bloc" id="n-legal" aria-labelledby="t-legal">
        <h2 id="t-legal">Points légaux</h2>
        <ul class="legal">{legal}</ul>
      </section>
      <section class="note-bloc note-bloc--double" id="n-fournir" aria-labelledby="t-fournir">
        <div>
          <h2 id="t-fournir">À fournir</h2>
          <p class="attenue">Signalé dans les pages par {f} ou {c}.</p>
          <ul class="liste-simple">{a_fournir}</ul>
          <p class="attenue">Reçu et intégré le 30 octobre 2026 : l’accord écrit de la SEMETHERM pour citer Aquensis (sur papier, à conserver), le téléphone, les frais de port (5 € par commande), la longueur du ruban LED (2 m).</p>
          <h3>Reçu et intégré le 31 octobre 2026</h3>
          <ul class="liste-simple">{recu}</ul>
        </div>
        <div>
          <h2>À valider</h2>
          <p class="attenue">Signalé dans les pages par un marqueur de décision, par exemple {ville} ou {tarif}.</p>
          <ul class="liste-simple">{a_valider}</ul>
        </div>
      </section>
      <section class="note-bloc" id="n-limites" aria-labelledby="t-limites">
        <h2 id="t-limites">Limites de la maquette</h2>
        <ul class="liste-simple">
          <li>Les positions de la carte sont indicatives, à un ou deux kilomètres près ; les courbes de niveau sont décoratives.</li>
          <li>La simulation du rétroéclairage donne une idée de l’effet ; les couleurs réelles du ruban diffèrent.</li>
          <li>Les textes « Le lieu » sont courts ; vous les avez validés le 31 octobre 2026.</li>
          <li>Le panier vit dans le navigateur : aucune commande, aucun paiement, aucun envoi de formulaire.</li>
          <li>Noël : la promotion est mise en avant sur toutes les pages (bandeau sous celui de la maquette, bloc en tête de l’accueil, encart près du bouton d’achat, rappel dans le panier, qui passe à 0 € du 27 novembre au 14 décembre 2026) ; le 15 décembre, le bloc de l’accueil et l’offre disparaissent, le bandeau propose la carte cadeau jusqu’au 24 décembre, puis plus rien. L’interrupteur « Voir pendant l’offre de Noël », en haut de chaque page, simule le 1<sup>er</sup> décembre. Les mentions fixes de l’offre (fiche de la carte cadeau, FAQ) sont à retirer du site réel le 15 décembre.</li>
          <li>Les polices viennent de Google Fonts : une connexion internet est nécessaire pour les voir.</li>
        </ul>
        <p><a class="lien-fleche" href="qr.html">Voir la page du QR code d’Aquensis</a></p>
      </section>
    </div>
  </div>
</div>""".format(constats=constats, techs=techs, palette=palette, lignes="".join(lignes), idees=idees, legal=legal,
                 f=A_FOURNIR, c=A_CONFIRMER, ville=note("ville au centre à choisir", "decision"), tarif=note("tarif par mode à confirmer", "decision"), recu="".join("<li>{}</li>".format(e(x)) for x in RECU_31_OCTOBRE),
                 a_fournir="".join("<li>{}</li>".format(e(x)) for x in A_FOURNIR_LISTE),
                 a_valider="".join("<li>{}</li>".format(e(x)) for x in A_VALIDER_LISTE))
    page("notes.html", "Notes de la version 4 · Terre Gravée",
         "Notes pour Romain : relevé des problèmes du site actuel, techniques retenues et sourcées, palette, idées mises en œuvre, points légaux, informations à fournir.",
         contenu, classe="page-notes")


# ---------------------------------------------------------------------------

def verifier_liens():
    """Contrôle léger : chaque lien local et chaque image locale des pages générées existe."""
    manquants = []
    for fichier in PAGES_ECRITES:
        with open(os.path.join(ICI, fichier), encoding="utf-8") as f:
            doc = f.read()
        for attr, cible in re.findall(r'(href|src)="([^"#?]+)', doc):
            if cible.startswith(("http", "mailto:", "tel:", "data:")):
                continue
            if not os.path.exists(os.path.normpath(os.path.join(ICI, cible))):
                manquants.append((fichier, cible))
        for cible in re.findall(r'srcset="([^"]+)"', doc):
            for morceau in cible.split(","):
                chemin = morceau.strip().split(" ")[0]
                if not os.path.exists(os.path.normpath(os.path.join(ICI, chemin))):
                    manquants.append((fichier, chemin))
    assert not manquants, "Liens ou images manquants : {}".format(manquants[:10])
    # Contrôle facultatif : une expression régulière fournie hors du dépôt (variable d’environnement TG_MOTIFS_INTERDITS).
    # Sans cette variable, le contrôle est simplement ignoré.
    motifs = os.environ.get("TG_MOTIFS_INTERDITS")
    if motifs:
        interdits = re.compile(motifs, re.I)
        for fichier in PAGES_ECRITES + [os.path.join("assets", "img", "courbes.svg"), "README.md"]:
            chemin = os.path.join(ICI, fichier)
            if os.path.exists(chemin):
                with open(chemin, encoding="utf-8") as f:
                    assert not interdits.search(f.read()), "Motif interdit trouvé dans " + fichier


def main():
    os.makedirs(os.path.join(ICI, "assets", "img"), exist_ok=True)
    svg_courbes_mur()
    accueil()
    collection()
    carte_page()
    for p in PLAQUES:
        fiche_plaque(p)
    fiche_led()
    fiche_carte_cadeau()
    atelier()
    sur_mesure()
    installation()
    contact()
    qr_page()
    notes()
    verifier_liens()
    print("{} pages générées dans {}".format(len(PAGES_ECRITES), ICI))


if __name__ == "__main__":
    main()
