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
    "faune": ("Faune du Parc national", "losange"),
}
# slug : (lat, lon, catégorie, côté de l’étiquette)
LIEUX = {
    "le-pic-du-midi": (42.937, 0.142, "sommets", "d"),
    "le-tourmalet": (42.909, 0.145, "sommets", "d"),
    "le-montaigu": (42.96, 0.11, "sommets", "g"),
    "le-cirque-de-gavarnie": (42.695, -0.010, "sites", "d"),
    "le-pont-despagne": (42.854, -0.141, "sites", "g"),
    "la-tour-des-jacobins": (43.065, 0.149, "patrimoine", "g"),
    "le-chateau-de-mauvezin": (43.12, 0.27, "patrimoine", "d"),
    "labbaye-de-lescaladieu": (43.10, 0.27, "patrimoine", "d"),
}
FAUNE = ["lisard", "lours", "le-cerf", "la-marmotte"]
GERDE = (43.055, 0.168)
BAGNERES = (43.065, 0.149)
REVEL = (43.458, 2.004)


def cat_de(slug):
    if slug in LIEUX:
        return LIEUX[slug][2]
    if slug in FAUNE:
        return "faune"
    return None


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
    (42.960, 0.110, 2339, 3.5), (42.950, -0.130, 2334, 5), (42.750, 0.250, 2800, 7), (42.720, 0.400, 2900, 7),
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


def img(rel, alt, sizes="100vw", cls="", eager=False, extra=""):
    w, h = dims(rel)
    charge = 'fetchpriority="high"' if eager else 'loading="lazy"'
    c = ' class="{}"'.format(cls) if cls else ""
    x = " " + extra if extra else ""
    return ('<img{c} src="{src}" width="{w}" height="{h}" sizes="{s}" alt="{a}" {charge} decoding="async"{x}>'
            .format(c=c, src=IMG + rel, w=w, h=h, s=sizes, a=e(alt), charge=charge, x=x))


def img_plaque(p, fin, sizes, eager=False, cls="", extra=""):
    rel = "p/{}-{}-440.webp".format(p["slug"], fin)
    w, h = dims(rel)
    charge = 'fetchpriority="high"' if eager else 'loading="lazy"'
    alt = "Plaque {}, finition {}".format(p["nom"], ACC_FIN[fin])
    c = ' class="{}"'.format(cls) if cls else ""
    x = " " + extra if extra else ""
    return ('<img{c} src="{src}" srcset="{ss}" sizes="{s}" width="{w}" height="{h}" alt="{a}" {charge} decoding="async"{x}>'
            .format(c=c, src=IMG + rel, ss=srcset_plaque(p["slug"], fin), s=sizes, w=w, h=h, a=e(alt), charge=charge, x=x))


def note(texte, sorte="fournir"):
    """Marqueur visible pour Romain : à fournir, à confirmer, proposition à valider."""
    return '<span class="note-maquette note-maquette--{}">{}</span>'.format(sorte, e(texte))


A_FOURNIR = note("à fournir")
A_CONFIRMER = note("à confirmer", "confirmer")
A_VALIDER = note("proposition à valider", "valider")


def etoiles(n):
    plein = int(round(n))
    return '<span class="etoiles" aria-hidden="true">' + "★" * plein + '<span class="etoiles__vide">' + "★" * (5 - plein) + "</span></span>"


def symbole(cat, cls="symbole"):
    forme = CATS[cat][1]
    if forme == "triangle":
        d = '<path d="M8 2.2 14.2 13.4H1.8Z"/>'
    elif forme == "rond":
        d = '<circle cx="8" cy="8" r="5.6"/>'
    elif forme == "carre":
        d = '<rect x="2.6" y="2.6" width="10.8" height="10.8"/>'
    else:
        d = '<path d="M8 1.6 14.4 8 8 14.4 1.6 8Z"/>'
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


def borne(texte, sous=""):
    """Petite borne façon borne de col : altitude ou statut d’un lieu."""
    s = '<span class="borne__sous">{}</span>'.format(e(sous)) if sous else ""
    return '<span class="borne"><span class="borne__tete" aria-hidden="true"></span><span class="borne__corps">{}{}</span></span>'.format(e(texte), s)


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
        return borne("PNP", "Parc national")
    return ""


BALISE = '<span class="balise" aria-hidden="true"></span>'


def etiquette(texte, balise=True):
    return '<p class="etiquette">{}{}</p>'.format(BALISE if balise else "", texte)


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
    t = re.sub(r"(\d) × (\d)", r"\1" + NBSP + "×" + NBSP + r"\2", t)
    t = t.replace("N° ", "N°" + NBSP).replace(" – ", NBSP + "– ")
    return t


def typo(doc):
    morceaux = re.split(r"(<script.*?</script>|<style.*?</style>|<[^>]+>)", doc, flags=re.S)
    return "".join(m if (m.startswith("<")) else typo_texte(m) for m in morceaux)


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

POLICES = ("https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700"
           "&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..600&display=swap")


def marque():
    return ('<a class="marque" href="index.html">' + LOGO +
            '<span class="marque__texte"><span class="marque__nom">Terre Gravée</span>'
            '<span class="marque__sous">Carnet de territoire</span></span></a>')


def entete(actif):
    liens = []
    for href, nom in NAV:
        cur = ' aria-current="page"' if href == actif else ""
        liens.append('<li><a href="{}"{}>{}</a></li>'.format(href, cur, nom))
    return """<header class="entete">
  <div class="cadre entete__ligne">
    {marque}
    <nav class="nav" id="nav-principale" aria-label="Navigation principale"><ul>{liens}</ul></nav>
    <div class="entete__outils">
      <button type="button" class="outil outil--theme" data-theme-bascule aria-pressed="false">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1Z"/></svg>
        <span class="outil__texte" data-theme-texte>Carte de nuit</span>
      </button>
      <button type="button" class="outil outil--commande" data-ouvrir-commande aria-haspopup="dialog">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 6.5h12l-1 10H5Z M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5"/></svg>
        <span class="outil__texte">Commande</span><span class="compteur" data-compteur>0</span><span class="visuellement-cache"> article(s)</span>
      </button>
      <button type="button" class="outil outil--menu" aria-expanded="false" aria-controls="nav-principale" data-menu>
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
        <span class="visuellement-cache">Menu</span>
      </button>
    </div>
  </div>
</header>""".format(marque=marque(), liens="".join(liens))


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
<script>try{{var t=localStorage.getItem("tg-v1-theme");if(t==="dark"||t==="light"){{document.documentElement.setAttribute("data-theme",t);}}}}catch(e){{}}</script>
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

def visuel_carte(p, fin, sizes):
    """Visuel d’une carte produit : la photo, ou un emplacement « photo à venir »."""
    if p["slug"] == "led":
        return img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED", sizes)
    if p["slug"] == "carte-cadeau":
        return img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, lettrage doré sur fond cuivré", sizes)
    return img_plaque(p, fin, sizes)


def vide_photo(p, fin, cls=""):
    return ('<div class="photo-a-venir {}" data-vide="{}"><span>Finition {}<br>photo à venir</span>{}</div>'
            .format(cls, fin, ACC_FIN[fin], note("photo à fournir")))


def carte_produit(p, sizes="(max-width: 600px) 44vw, (max-width: 1100px) 30vw, 300px", fin=None, titre_niveau="h3"):
    slug = p["slug"]
    url = "produit-{}.html".format(slug)
    acc = p["collection"] == "accessoires"
    fin = fin if (fin and a_photo(slug, fin)) else (None if acc else fin_defaut(p))
    lat = LIEUX[slug][0] if slug in LIEUX else (42.0 if slug in FAUNE else 41.0)
    data = ['data-collection="{}"'.format(p["collection"]), 'data-nom="{}"'.format(e(p["nom"])),
            'data-tri="{}"'.format(e(tri_nom(p["nom"]))), 'data-lat="{}"'.format(lat)]
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
    avis = ""
    if nb:
        moy = sum(a["note"] for a in p["avis"]) / nb
        avis = '<span class="carte__avis">{} {} · {} avis</span>'.format(etoiles(moy), note_fr(moy), nb)
    best = '<span class="carte__best">Parmi les plus vendues</span>' if p["best"] else ""
    sur_carte = ""
    if slug in LIEUX:
        sur_carte = '<a class="carte__carte" href="carte.html#{}">Sur la carte</a>'.format(slug)
    elif slug in FAUNE:
        sur_carte = '<a class="carte__carte" href="carte.html#faune">Sur la carte</a>'
    visuel_cls = "carte__visuel carte__visuel--carre" if slug == "carte-cadeau" else "carte__visuel"
    return """<li class="carte" {data}>
  <a class="{vcls}" href="{url}" tabindex="-1" aria-hidden="true">{visuel}{vides}</a>
  <div class="carte__corps">
    <p class="carte__cartel">{ligne}</p>
    <{h} class="carte__nom"><a href="{url}">{nom}</a></{h}>
    <p class="carte__prix">{prix}{best}</p>
    <div class="carte__pied">{pastilles}{avis}{sur_carte}</div>
  </div>
</li>""".format(data=" ".join(data), vcls=visuel_cls, url=url, visuel=visuel_carte(p, fin, sizes), vides=vides, ligne=ligne,
                h=titre_niveau, nom=e(p["nom"]), prix=euros(p["prix"]), best=best, pastilles=pastilles, avis=avis,
                sur_carte=sur_carte)


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
  <rect x="{gx:.1f}" y="{gy:.1f}" width="9" height="9" class="trajet__atelier" transform="translate(-4.5 -4.5)"/>
  <text x="{tx:.1f}" y="{ty:.1f}" text-anchor="end" class="trajet__texte"><tspan x="{tx:.1f}">Revel (31) · découpe laser</tspan><tspan x="{tx:.1f}" dy="15">à environ {km} km, hors cadre</tspan></text>
  <text x="{gtx:.1f}" y="{gty:.1f}" class="trajet__texte trajet__texte--petit"><tspan x="{gtx:.1f}">Gerde · atelier</tspan></text>
</g>""".format(fx=fx, fy=fy, bx=bx, by=by, gx=gx2, gy=gy2, tx=x0 + w - 10, ty=fy - 30, km=KM_REVEL,
               gtx=gx2 + 9, gty=gy2 + 16, btx=bx + 16, bty=by - 30))
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
        txt = "Parc national des Pyrénées, zone schématique"
    return """<figure class="localisateur">
  <svg viewBox="{vb}" role="img" aria-label="{aria}">
    <defs><clipPath id="loc-clip"><path d="{c}"/></clipPath></defs>
    <path d="{c}" class="loc__dep"/>
    {rep}
  </svg>
  <figcaption>{txt}</figcaption>
</figure>""".format(vb=vb, c=CONTOUR_D, rep=rep, txt=txt,
                    aria=e("Carte des Hautes-Pyrénées : " + txt.lower()))


def bouton_repere(slug, avec_nom=True, prefixe="rep"):
    p = PRODUITS[slug]
    la, lo, cat, cote = LIEUX[slug]
    x, y = pc(la, lo)
    lieu, detail = p["cartel"]
    aria = "{}, {}, {}".format(p["nom"], lieu, detail)
    return ('<button type="button" class="repere repere--{cote}" style="left:{x:.2f}%;top:{y:.2f}%" data-lieu="{slug}" '
            'data-cat="{cat}" id="{pref}-{slug}" aria-label="{aria}" aria-controls="panneau" aria-expanded="false">'
            '{sym}<span class="repere__nom">{nom}</span></button>').format(
                cote=cote, x=x, y=y, slug=slug, cat=cat, pref=prefixe, aria=e(aria), sym=symbole(cat, "repere__sym"),
                nom=e(p["nom"]))


def lien_repere(slug):
    p = PRODUITS[slug]
    la, lo, cat, cote = LIEUX[slug]
    x, y = pc(la, lo)
    return ('<a class="repere repere--{cote}" style="left:{x:.2f}%;top:{y:.2f}%" href="carte.html#{slug}" data-lieu="{slug}">'
            '{sym}<span class="repere__nom">{nom}</span></a>').format(cote=cote, x=x, y=y, slug=slug,
                                                                       sym=symbole(cat, "repere__sym"), nom=e(p["nom"]))


def zone_faune(bouton=True):
    x, y = pc(42.795, -0.245)
    if bouton:
        return ('<button type="button" class="repere repere--zone" style="left:{:.2f}%;top:{:.2f}%" data-lieu="faune" data-cat="faune" '
                'id="rep-faune" aria-label="Faune du Parc national, 4 plaques : l’isard, l’ours, le cerf, la marmotte" '
                'aria-controls="panneau" aria-expanded="false">{}<span class="repere__nom">Faune du Parc national<small>4 plaques</small></span></button>'
                ).format(x, y, symbole("faune", "repere__sym"))
    return ('<a class="repere repere--zone" style="left:{:.2f}%;top:{:.2f}%" href="carte.html#faune" data-lieu="faune">{}'
            '<span class="repere__nom">Faune du Parc national<small>4 plaques</small></span></a>').format(x, y, symbole("faune", "repere__sym"))


def carte_plan(uid, interactif=True, trajet=True, legende_cls=""):
    vb = (0, 0, VB_W, VB_H)
    if interactif:
        reperes = "".join(bouton_repere(s) for s in sorted(LIEUX, key=lambda s: -LIEUX[s][0])) + zone_faune(True)
    else:
        reperes = "".join(lien_repere(s) for s in sorted(LIEUX, key=lambda s: -LIEUX[s][0])) + zone_faune(False)
    return """<div class="carte__plan" style="aspect-ratio:{w} / {h}" data-plan="{uid}">
  {fond}
  <canvas class="carte__relief" data-relief="carte" data-vb="0 0 {w} {h}" aria-hidden="true"></canvas>
  {dessus}
  <div class="carte__reperes">{reperes}</div>
</div>""".format(w=VB_W, h=VB_H, uid=uid, fond=svg_fond(vb, uid), dessus=svg_dessus(vb, uid, trajet=trajet), reperes=reperes)


def legende():
    items = []
    for cat in ("sommets", "sites", "patrimoine", "faune"):
        items.append('<li>{}{}</li>'.format(symbole(cat), CATS[cat][0]))
    items.append('<li><span class="leg-trajet" aria-hidden="true"></span>Trajet de fabrication</li>')
    items.append('<li><span class="leg-parc" aria-hidden="true"></span>Parc national (zone schématique)</li>')
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
              "Pour un extérieur : la plaque supporte la pluie et le soleil."],
    "le-cerf": ["Pour un salon, un bureau ou un extérieur.",
                "Un cadeau pour un ami qui aime la forêt."],
    "la-marmotte": ["En souvenir d’une randonnée en famille.",
                    "Pour une chambre d’enfant ou une maison de vacances."],
}


# ---------------------------------------------------------------------------
# Accueil
# ---------------------------------------------------------------------------

def heros():
    pic = PRODUITS["le-pic-du-midi"]
    # recadrage autour du Pic du Midi
    cx, cy = proj(42.937, 0.142)
    w, h = 300.0, 330.0
    x0, y0 = cx - 0.36 * w, cy - 0.58 * h
    vb = (round(x0, 1), round(y0, 1), w, h)
    px, py = 100 * (cx - x0) / w, 100 * (cy - y0) / h
    tx, ty = proj(42.909, 0.145)
    tpx, tpy = 100 * (tx - x0) / w, 100 * (ty - y0) / h
    mx, my = proj(42.96, 0.11)
    mpx, mpy = 100 * (mx - x0) / w, 100 * (my - y0) / h
    bx, by = proj(*BAGNERES)
    bpx, bpy = 100 * (bx - x0) / w, 100 * (by - y0) / h
    vbs = "{} {} {} {}".format(*vb)
    riv = "".join('<path d="{}" class="carte__riviere"/>'.format(chemin([(lo, la) for la, lo in pts], ferme=False)) for pts in RIVIERES.values())
    return """<section class="heros" aria-labelledby="titre-heros">
  <div class="cadre heros__grille">
    <div class="heros__texte">
      {etiq}
      <h1 id="titre-heros">Un morceau de Bigorre, <em>à accrocher</em> chez vous.</h1>
      <p class="heros__chapo">Le Pic du Midi, le Tourmalet, la tour des Jacobins, l’isard : douze lieux et animaux du département, dessinés par deux illustratrices, découpés au laser dans l’aluminium puis thermolaqués à Bagnères-de-Bigorre. Chaque plaque porte son numéro gravé au dos.</p>
      <div class="heros__actions">
        <a class="bouton bouton--plein" href="carte.html">Ouvrir la carte des lieux</a>
        <a class="lien-fleche" href="collection.html">Voir les douze plaques</a>
      </div>
      <dl class="fiche-technique">
        <div><dt>Format</dt><dd>60 × 30 cm</dd></div>
        <div><dt>Matière</dt><dd>Aluminium 2 mm</dd></div>
        <div><dt>Finitions</dt><dd>Noir, gris, doré</dd></div>
        <div><dt>Prix</dt><dd>65 € TTC</dd></div>
      </dl>
    </div>
    <figure class="feuille" aria-labelledby="legende-feuille">
      <div class="feuille__plan">
        <svg class="carte__fond" viewBox="{vbs}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect x="{x0}" y="{y0}" width="{w}" height="{h}" class="carte__dep"/></svg>
        <canvas class="carte__relief" data-relief="heros" data-vb="{vbs}" aria-hidden="true"></canvas>
        <svg class="carte__dessus" viewBox="{vbs}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{riv}{grad}</svg>
        <span class="feuille__point feuille__point--pic" style="left:{px:.2f}%;top:{py:.2f}%" aria-hidden="true">{sym}</span>
        <span class="feuille__lieu feuille__lieu--g" style="left:{tpx:.2f}%;top:{tpy:.2f}%" aria-hidden="true">{sym}<span>Col du Tourmalet</span></span>
        <span class="feuille__lieu feuille__lieu--g" style="left:{mpx:.2f}%;top:{mpy:.2f}%" aria-hidden="true">{sym}<span>Montaigu</span></span>
        <span class="feuille__lieu feuille__lieu--g" style="left:{bpx:.2f}%;top:{bpy:.2f}%" aria-hidden="true">{sym2}<span>Bagnères-de-Bigorre</span></span>
        <span class="feuille__trait" style="left:{px:.2f}%;top:{py:.2f}%;width:{tw:.2f}%" aria-hidden="true"></span>
        <div class="feuille__plaque">
          {plaque}
        </div>
      </div>
      <figcaption id="legende-feuille" class="feuille__cartel">
        <span class="feuille__nom">Pic du Midi de Bigorre</span>
        <span>2 877 m · {coords} · position indicative</span>
        <span>Plaque « Le Pic du Midi », finition noire, 60 × 30 cm</span>
      </figcaption>
    </figure>
  </div>
</section>""".format(etiq=etiquette("Carnet de territoire · Hautes-Pyrénées (65)"), vbs=vbs, x0=vb[0], y0=vb[1], w=w, h=h,
                     riv=riv, grad=graticule(vb, 0.1, 0.1, True, marge=24, bas=True), px=px, py=py, tpx=tpx, tpy=tpy, mpx=mpx, mpy=mpy,
                     bpx=bpx, bpy=bpy, tw=54 - px, sym=symbole("sommets", "feuille__sym"), sym2=symbole("patrimoine", "feuille__sym"),
                     plaque=img_plaque(pic, "noir", "(max-width: 700px) 46vw, 300px", eager=True, extra='style="view-transition-name:vt-le-pic-du-midi"'),
                     coords=dms(42.937, 0.142))


def reperes_engagements():
    items = [
        ("Série limitée", "Chaque plaque porte son numéro, gravé au dos."),
        ("Pose sans perçage", "Deux fixations adhésives 3M Command™ fournies. Le léger écart avec le mur fait ressortir les ombres de la découpe."),
        ("Dedans comme dehors", "Aluminium thermolaqué, pour l’intérieur et l’extérieur."),
        ("Expédiée de Bagnères", "Livraison en 2 à 4 jours ouvrés, à titre indicatif. L’atelier vous prévient en cas de retard."),
    ]
    lis = "".join('<li><span class="balise" aria-hidden="true"></span><h3>{}</h3><p>{}</p></li>'.format(t, d) for t, d in items)
    return '<section class="engagements" aria-label="Repères"><div class="cadre"><ul>{}</ul></div></section>'.format(lis)


def table_des_lieux():
    groupes = [
        ("Sommets, cols et sites", ["le-pic-du-midi", "le-tourmalet", "le-montaigu", "le-cirque-de-gavarnie", "le-pont-despagne"]),
        ("Patrimoine", ["la-tour-des-jacobins", "le-chateau-de-mauvezin", "labbaye-de-lescaladieu"]),
        ("Faune du Parc national", FAUNE),
    ]
    blocs = []
    for titre, slugs in groupes:
        lignes = []
        for s in slugs:
            p = PRODUITS[s]
            if p["collection"] == "accessoires":
                droite = euros(p["prix"])
                vignette = '<span class="index__vignette index__vignette--acc" aria-hidden="true"></span>'
            else:
                lieu, detail = p["cartel"]
                droite = "<i>{}</i>".format(e(detail)) if p["collection"] == "faune" else e(detail if detail.endswith(" m") else lieu)
                f0 = fin_defaut(p)
                vignette = '<img class="index__vignette" src="{}p/{}-{}-440.webp" width="22" height="44" alt="" loading="lazy" decoding="async">'.format(IMG, s, f0)
            cat = cat_de(s)
            sym = symbole(cat, "index__sym") if cat else '<span class="index__sym index__sym--vide" aria-hidden="true"></span>'
            lignes.append('<li><a class="index__ligne" href="produit-{s}.html" data-lieu="{lieu}">{v}{sym}<span class="index__nom">{n}</span>'
                          '<span class="index__points" aria-hidden="true"></span><span class="index__val">{d}</span></a></li>'
                          .format(s=s, lieu=("faune" if s in FAUNE else s), v=vignette, sym=sym, n=e(p["nom"]), d=droite))
        cls = ' class="index__duo"' if slugs == FAUNE else ""
        blocs.append('<div class="index__groupe"><h3 class="index__titre">{}</h3><ol{}>{}</ol></div>'.format(titre, cls, "".join(lignes)))
    return """<section class="section table-lieux" aria-labelledby="titre-table">
  <div class="cadre">
    <div class="entete-section">
      {etiq}
      <h2 id="titre-table">Table des lieux</h2>
      <p class="chapo">Huit lieux du département et quatre animaux du Parc national. Toutes les plaques sont au même prix : 65 €, quel que soit le modèle et la finition. Et pour compléter : <a href="produit-led.html">le kit LED</a> et <a href="produit-carte-cadeau.html">la carte cadeau</a>.</p>
    </div>
    <div class="table-lieux__grille">
      <figure class="atlas atlas--mini">
        {plan}
        <figcaption class="carte__legende-mini">Positions indicatives. Touchez un repère pour ouvrir la carte. <a href="carte.html">Ouvrir la carte complète</a></figcaption>
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
      <p class="une__actions"><a class="bouton" href="produit-le-tourmalet.html">Lire l’entrée du Tourmalet</a><a class="lien-fleche" href="carte.html#le-tourmalet">Le col sur la carte</a></p>
    </div>
  </div>
</section>""".format(img=img("d/le-tourmalet-decor-1200.webp", "Mise en situation : plaque Le Tourmalet noire au-dessus d’un bureau",
                             "(max-width: 900px) 100vw, 760px", extra='srcset="{0}d/le-tourmalet-decor-640.webp 640w, {0}d/le-tourmalet-decor-1200.webp 1200w"'.format(IMG)),
                     etiq=etiquette("À la une du carnet"), borne=borne("2 115 m", "col"), coords=dms(42.909, 0.145),
                     histoire=e(p["histoire"][0]), avis=e(av["texte"]), auteur=e(av["auteur"]), date=date_fr(av["date"]),
                     etoiles=etoiles(5))


def trajet_fabrication(id_section="fabrication"):
    m = PRODUITS["le-chateau-de-mauvezin"]
    etapes = [
        ("Dessin", "Illustrations originales", "Les dessins sont signés Maude Villatte et Lola Jacquet.",
         img("misc/autres-plaques.webp", "Planche de dessins inédits : paysages, fleurs et animaux des Pyrénées", "(max-width: 700px) 70vw, 220px")),
        ("Découpe laser", "Revel (31)", "Le laser découpe la feuille d’aluminium de 2 mm, jusqu’aux lettres pochoir du titre.",
         '<div class="etape__plaque">' + img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut, juste après la découpe", "(max-width: 700px) 30vw, 110px") + "</div>"),
        ("Thermolaquage", "Bagnères-de-Bigorre (65)", "Une peinture en poudre cuite au four, en finition mate ou satinée : noir, gris ou doré.",
         '<div class="etape__plaque">' + img_plaque(m, "dore", "(max-width: 700px) 30vw, 110px") + "</div>"),
        ("Contrôle et expédition", "Bagnères-de-Bigorre (65)", "Assemblage, contrôle qualité, emballage et envoi. Le kit LED éventuel est collé au dos à cette étape.",
         img("led/led-img2.webp", "Ruban LED collé au dos d’une plaque", "(max-width: 700px) 40vw, 160px")),
    ]
    lis = []
    for titre, lieu, texte, visuel in etapes:
        lis.append('<li class="etape"><div class="etape__visuel">{}</div><p class="etape__lieu">{}</p><h3>{}</h3><p>{}</p></li>'
                   .format(visuel, lieu, titre, texte))
    return """<section class="section trajet" id="{id}" aria-labelledby="titre-trajet">
  <div class="cadre">
    <div class="entete-section entete-section--large">
      {etiq}
      <h2 id="titre-trajet">De Revel à votre mur</h2>
      <p class="chapo">Une plaque passe par trois communes d’Occitanie avant d’arriver chez vous. Toutes nos plaques sont réalisées dans un rayon de 150 km. {conf}</p>
    </div>
    <div class="trajet__route" aria-hidden="true">
      <svg viewBox="0 0 1000 40" preserveAspectRatio="none" focusable="false"><path class="trajet__base" d="M10,20 C200,4 300,36 500,20 S800,6 990,20"/><path class="trajet__progres" d="M10,20 C200,4 300,36 500,20 S800,6 990,20" pathLength="1"/></svg>
    </div>
    <ol class="trajet__etapes">{lis}</ol>
    <p class="trajet__note">L’atelier Terre Gravée est à Gerde, à côté de Bagnères-de-Bigorre. Visite de l’atelier sur rendez-vous {valider}</p>
  </div>
</section>""".format(id=id_section, etiq=etiquette("Traçabilité"),
                     conf=note("à confirmer : Revel est à environ {} km de Gerde à vol d’oiseau".format(KM_REVEL), "confirmer"),
                     lis="".join(lis), valider=A_VALIDER)


def occasions():
    def mini(slug, fin):
        p = PRODUITS[slug]
        return '<a class="occasion__plaque" href="produit-{}.html">{}<span>{}</span></a>'.format(
            slug, img_plaque(p, fin, "(max-width: 700px) 22vw, 90px"), e(p["nom"]))

    def cit(slug, idx=0):
        p = PRODUITS[slug]
        a = p["avis"][idx]
        return ('<figure class="occasion__avis"><blockquote><p>« {} »</p></blockquote><figcaption>{}, avis sur {}</figcaption></figure>'
                .format(e(a["texte"]), e(a["auteur"]), e(p["nom"])))
    cartes = [
        ("occasion--large", "Un souvenir de cure", "Pour qui a passé trois semaines à Bagnères-de-Bigorre et veut en garder une trace au mur.",
         mini("la-tour-des-jacobins", "dore") + mini("la-marmotte", "gris"), cit("la-marmotte")),
        ("", "Pour un cycliste", "Le Tourmalet, pour celui qui l’a monté. Ou pour celle qui s’y prépare.",
         mini("le-tourmalet", "gris"), cit("le-tourmalet")),
        ("", "Une crémaillère en Bigorre", "Un monument du coin, pour marquer l’arrivée dans une nouvelle maison.",
         mini("le-chateau-de-mauvezin", "noir"), cit("le-chateau-de-mauvezin")),
        ("", "Pour une randonneuse ou un randonneur", "Le cirque, la cascade, l’isard croisé sur le sentier.",
         mini("le-cirque-de-gavarnie", "dore") + mini("lisard", "noir"), cit("lisard")),
        ("", "Un départ loin des Pyrénées", "Un collègue mute, une fille part étudier ailleurs : le Pic du Midi les suit.",
         mini("le-pic-du-midi", "noir"), '<p class="occasion__note">Livrée avec deux fixations adhésives 3M Command™ : rien à percer chez la personne qui la reçoit.</p>'),
    ]
    lis = []
    for cls, titre, texte, plaques, avis in cartes:
        if cls:
            lis.append('<li class="occasion {}"><div class="occasion__texte"><h3>{}</h3><p>{}</p>{}</div><div class="occasion__plaques">{}</div></li>'.format(cls, titre, texte, avis, plaques))
        else:
            lis.append('<li class="occasion"><h3>{}</h3><p>{}</p><div class="occasion__plaques">{}</div>{}</li>'.format(titre, texte, plaques, avis))
    lis.append("""<li class="occasion occasion--cadeau">{img}<div class="occasion__texte"><h3>Vous hésitez sur le modèle ?</h3>
<p>La carte cadeau vaut une plaque au choix, sur tous les modèles disponibles. Elle part tout de suite par e-mail, ou vous l’imprimez.</p></div>
<p><a class="bouton" href="produit-carte-cadeau.html">Offrir la carte cadeau, 65 €</a></p></li>""".format(img=img("misc/carte-cadeau.webp", "", "120px", cls="occasion__carte")))
    return """<section class="section section--teinte occasions" aria-labelledby="titre-offrir">
  <div class="cadre">
    <div class="entete-section">
      {etiq}
      <h2 id="titre-offrir">À offrir à…</h2>
      <p class="chapo">Des occasions réelles, et les mots de clients qui les ont vécues. Sur chaque fiche, vous pouvez joindre un message {valider}</p>
    </div>
    <ul class="occasions__grille">{lis}</ul>
  </div>
</section>""".format(etiq=etiquette("Idées cadeaux"), lis="".join(lis), valider=A_VALIDER)


def aquensis():
    a1 = dict(PRODUITS["lours"]["avis"][0], produit="lours")
    a2 = dict(PRODUITS["la-marmotte"]["avis"][0], produit="la-marmotte")
    return """<section class="section aquensis" aria-labelledby="titre-aquensis">
  <div class="cadre aquensis__grille">
    <figure class="aquensis__photo">
      {img}
      <figcaption>Plaques Terre Gravée à Aquensis, Bagnères-de-Bigorre</figcaption>
    </figure>
    <div class="aquensis__texte">
      {etiq}
      <h2 id="titre-aquensis">Vues à Bagnères</h2>
      <p>Deux clients racontent avoir découvert les plaques à Aquensis, le centre thermal de Bagnères-de-Bigorre, ou pendant leur cure.</p>
      <ul class="avis-liste avis-liste--colonne">{a1}{a2}</ul>
      {mention}
    </div>
  </div>
</section>""".format(img=img("misc/aquensis.webp", "Le bassin d’Aquensis à Bagnères-de-Bigorre, avec une rangée de plaques Terre Gravée rétroéclairées en hauteur", "(max-width: 900px) 100vw, 820px"),
                     etiq=etiquette("Photo réelle"), a1=avis_item(a1), a2=avis_item(a2), mention=MENTION_AVIS)


def registre_avis():
    tries = sorted(TOUS_AVIS, key=lambda a: a["date"], reverse=True)
    lignes = []
    for a in tries:
        p = PRODUITS[a["produit"]]
        lignes.append("""<tr>
  <td data-label="Date"><time datetime="{iso}">{date}</time></td>
  <td data-label="Plaque"><a href="produit-{slug}.html">{nom}</a></td>
  <td data-label="Note">{etoiles}<span class="visuellement-cache">{n} sur 5</span></td>
  <td data-label="Avis" class="registre__texte">« {texte} »</td>
  <td data-label="Auteur">{auteur}</td>
</tr>""".format(iso=a["date"], date=date_fr(a["date"]), slug=p["slug"], nom=e(p["nom"]), etoiles=etoiles(a["note"]), n=a["note"],
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
        <caption class="visuellement-cache">Avis clients publiés sur le site, classés par date</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Plaque</th><th scope="col">Note</th><th scope="col">Avis</th><th scope="col">Auteur</th></tr></thead>
        <tbody>{lignes}</tbody>
      </table>
    </div>
    {mention}
  </div>
</section>""".format(etiq=etiquette("Preuve sociale"), nb=len(TOUS_AVIS), moy=note_fr(NOTE_MOYENNE), etoiles=etoiles(NOTE_MOYENNE),
                     n5=NB_5, n4=NB_4, lignes="".join(lignes), mention=MENTION_AVIS)


def lettre(id_section="lettre"):
    return """<section class="section lettre" id="{id}" aria-labelledby="titre-lettre">
  <div class="cadre lettre__grille">
    <div class="lettre__planche">
      <figure>
        {img}
        <div class="lettre__voile" aria-hidden="true"><span>Planche à paraître</span></div>
        <figcaption>Dessins inédits de l’atelier, pas encore dans la collection. <a href="sur-mesure.html#exclusives">Voir la planche entière</a></figcaption>
      </figure>
    </div>
    <div class="lettre__texte">
      {etiq}
      <h2 id="titre-lettre">La lettre « planche inédite »</h2>
      <p class="chapo">Certaines plaques sortent en très petite quantité, parfois en exemplaire unique. La lettre vous prévient de chaque sortie et vous montre les dessins en cours.</p>
      <ul class="liste-carnet">
        <li>La planche des dessins inédits, à chaque nouvelle série</li>
        <li>Votre vote pour le prochain lieu gravé {valider}</li>
        <li>Une lettre par mois au plus {valider}</li>
        <li>Aucune remise promise, aucun code promo</li>
      </ul>
      <form class="formulaire formulaire--lettre" data-demo novalidate>
        <div class="champ">
          <label for="email-lettre">Votre adresse e-mail</label>
          <input id="email-lettre" name="email" type="email" autocomplete="email" required inputmode="email">
        </div>
        <div class="case">
          <input id="accord-lettre" type="checkbox" required>
          <label for="accord-lettre">J’accepte de recevoir la lettre de Terre Gravée par e-mail. Je peux me désinscrire à chaque envoi.</label>
        </div>
        <div class="case">
          <input id="accord-mesure" type="checkbox">
          <label for="accord-mesure">Facultatif : j’accepte que l’ouverture des lettres soit mesurée (pixel de suivi).</label>
        </div>
        <button class="bouton bouton--plein" type="submit">M’inscrire</button>
        <p class="formulaire__aide">Un e-mail de confirmation vous sera envoyé avant toute inscription (double confirmation). Adresse utilisée uniquement pour cette lettre.</p>
        <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
      </form>
    </div>
  </div>
</section>""".format(id=id_section, img=img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits : la Vierge du Bédat, la cabane du Theillet, la brèche de Roland, l’iris des Pyrénées, le gypaète barbu…", "(max-width: 900px) 100vw, 560px"),
                     etiq=etiquette("Lettre d’information"), valider=A_VALIDER)


ORGANISATION = {
    "@context": "https://schema.org", "@type": "Organization", "name": "Terre Gravée", "url": SITE,
    "email": "contact@terregravee.fr", "slogan": "Graver l’âme des territoires",
    "address": {"@type": "PostalAddress", "streetAddress": "16 rue du Pic du Midi", "postalCode": "65200",
                "addressLocality": "Gerde", "addressCountry": "FR"},
}


def accueil():
    contenu = heros() + reperes_engagements() + table_des_lieux() + a_la_une() + trajet_fabrication() + occasions() + aquensis() + registre_avis() + lettre()
    page("index.html", "Terre Gravée · Carnet de territoire, plaques murales des Hautes-Pyrénées",
         "Douze plaques murales en aluminium découpé au laser, une par lieu ou animal des Hautes-Pyrénées. Carte des lieux, fabrication à Revel et Bagnères-de-Bigorre, 65 € la plaque.",
         contenu, jsonld=ORGANISATION, scripts=("donnees-carte.js",), classe="page-accueil")


# ---------------------------------------------------------------------------
# Carte (page signature)
# ---------------------------------------------------------------------------

def panneau_lieu(slug):
    p = PRODUITS[slug]
    la, lo, cat, _ = LIEUX[slug]
    lieu, detail = p["cartel"]
    f0 = fin_defaut(p)
    extrait = p["histoire"][0]
    if len(extrait) > 230:
        coupe = extrait[:230].rsplit(" ", 1)[0]
        extrait = coupe.rstrip(",;:") + "…"
    avis = "".join(avis_item(dict(a, produit=slug), avec_produit=False, cls="avis avis--compact") for a in p["avis"])
    bloc_avis = ('<ul class="avis-liste">{}</ul>{}'.format(avis, MENTION_AVIS) if avis
                 else '<p class="panneau__sans-avis">Pas encore d’avis sur ce modèle.</p>')
    return """<article class="panneau__fiche" data-fiche-lieu="{slug}" hidden aria-labelledby="titre-{slug}">
  <div class="panneau__visuel">{photo}</div>
  <div class="panneau__corps">
    <p class="panneau__cat">{sym}{catnom}</p>
    <h2 id="titre-{slug}" tabindex="-1">{nom}</h2>
    <dl class="cartel">
      <div><dt>Lieu</dt><dd>{lieu}</dd></div>
      <div><dt>{dlab}</dt><dd>{detail}</dd></div>
      <div><dt>Position</dt><dd>{coords} <span class="cartel__note">indicative</span></dd></div>
    </dl>
    <p class="panneau__extrait">{extrait}</p>
    {avis}
    <p class="panneau__prix"><strong>65 €</strong> TTC, en noir, gris ou doré</p>
    <div class="panneau__actions">
      <a class="bouton bouton--plein" href="produit-{slug}.html">Voir la plaque</a>
      <button type="button" class="bouton bouton--trait" data-partager="{slug}">Copier le lien du lieu</button>
    </div>
  </div>
</article>""".format(slug=slug, photo=img_plaque(p, f0, "(max-width: 900px) 40vw, 170px", extra='data-vt="vt-{}"'.format(slug)),
                     sym=symbole(cat), catnom=CATS[cat][0], nom=e(p["nom"]), lieu=e(lieu),
                     dlab="Altitude" if detail.endswith(" m") else "Repère", detail=e(detail), coords=dms(la, lo),
                     extrait=e(extrait), avis=bloc_avis)


def panneau_faune():
    lis = []
    for s in FAUNE:
        p = PRODUITS[s]
        f0 = fin_defaut(p)
        lis.append('<li><a href="produit-{}.html">{}<span class="faune__nom">{}</span><i>{}</i></a></li>'.format(
            s, img_plaque(p, f0, "(max-width: 900px) 20vw, 80px"), e(p["nom"]), e(p["cartel"][1])))
    av = "".join(avis_item(dict(a, produit=s), avec_produit=True, cls="avis avis--compact") for s in FAUNE for a in PRODUITS[s]["avis"][:1])
    return """<article class="panneau__fiche" data-fiche-lieu="faune" hidden aria-labelledby="titre-faune">
  <div class="panneau__corps">
    <p class="panneau__cat">{sym}Faune du Parc national</p>
    <h2 id="titre-faune" tabindex="-1">Quatre animaux, sans adresse</h2>
    <p class="panneau__extrait">L’isard, l’ours, le cerf et la marmotte vivent dans le massif. La carte ne leur donne pas de point précis : la zone hachurée situe le Parc national des Pyrénées de façon schématique.</p>
    <ul class="faune">{lis}</ul>
    <ul class="avis-liste">{av}</ul>
    {mention}
    <p class="panneau__prix"><strong>65 €</strong> TTC la plaque, en noir, gris ou doré</p>
  </div>
</article>""".format(sym=symbole("faune"), lis="".join(lis), av=av, mention=MENTION_AVIS)


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
                   '<span class="lieu__nom">{nom}</span><span class="lieu__detail"><i>{lat}</i> · Parc national</span>'
                   '<span class="lieu__coord">sans repère précis</span></button></li>'.format(
                       sym=symbole("faune"), nom=e(p["nom"]), lat=e(p["cartel"][1])))
    return "".join(lis)


def carte_page():
    filtres = ['<button type="button" class="puce" data-filtre-carte="tout" aria-pressed="true">Tous les lieux <span>12</span></button>']
    for cat in ("sommets", "sites", "patrimoine", "faune"):
        n = len(FAUNE) if cat == "faune" else sum(1 for s in LIEUX if LIEUX[s][2] == cat)
        filtres.append('<button type="button" class="puce" data-filtre-carte="{}" aria-pressed="false">{}{} <span>{}</span></button>'.format(
            cat, symbole(cat), CATS[cat][0], n))
    panneaux = "".join(panneau_lieu(s) for s in sorted(LIEUX, key=lambda s: -LIEUX[s][0])) + panneau_faune()
    contenu = """
<div class="cadre carte-page">
  <header class="carte-page__entete">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">La carte</li></ol></nav>
    <h1>La carte des plaques</h1>
    <p class="chapo">Chaque repère est un lieu gravé. Ouvrez-le pour voir la plaque, son cartel et les avis qui en parlent. Chaque lieu a sa propre adresse : vous pouvez l’envoyer à quelqu’un.</p>
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
        <p><strong>Positions indicatives.</strong> Les repères situent les lieux à quelques centaines de mètres près ; les animaux n’ont pas de repère. Rivières tracées de façon schématique. Contour du département simplifié d’après les données IGN (Licence Ouverte 2.0). Relief décoratif, sans valeur topographique.</p>
      </figcaption>
    </figure>
    <aside class="panneau" id="panneau" aria-label="Fiche du lieu choisi" data-panneau>
      <div class="panneau__barre"><span class="panneau__poignee" aria-hidden="true"></span><button type="button" class="panneau__fermer" data-fermer-panneau>Fermer</button></div>
      <div class="panneau__accueil" data-panneau-accueil>
        <p class="etiquette">{balise}Mode d’emploi</p>
        <h2>Choisissez un repère</h2>
        <p>Cliquez sur un symbole de la carte, ou parcourez la liste des lieux sous la carte. Au clavier : Tab pour passer d’un repère à l’autre, Entrée pour l’ouvrir, Échap pour refermer.</p>
        <div class="panneau__fabrication">
          <h3>Le trajet d’une plaque</h3>
          <ol class="mini-trajet">
            <li><strong>Revel (31)</strong> découpe laser</li>
            <li><strong>Bagnères-de-Bigorre (65)</strong> thermolaquage, assemblage, contrôle, expédition</li>
            <li><strong>Gerde (65)</strong> l’atelier Terre Gravée</li>
          </ol>
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
    <p class="partage__pro">Office de tourisme, gîte, centre thermal : vous voulez montrer la carte à vos visiteurs ? <a href="sur-mesure.html#series">Parlons d’une série ou d’un partenariat</a> {valider}</p>
  </section>
</div>""".format(filtres="".join(filtres), plan=carte_plan("grande"), legende=legende(), balise=BALISE,
                 panneaux=panneaux, lieux=liste_lieux(), valider=A_VALIDER)
    page("carte.html", "La carte des plaques · Terre Gravée",
         "Carte interactive des Hautes-Pyrénées : les huit lieux gravés par Terre Gravée, la zone du Parc national pour la faune et le trajet de fabrication de Revel à Bagnères-de-Bigorre.",
         contenu, actif="carte.html", scripts=("donnees-carte.js", "carte.js"), classe="page-carte")


# ---------------------------------------------------------------------------
# Collection
# ---------------------------------------------------------------------------

def collection():
    comptes = {c: sum(1 for p in CATALOGUE if p["collection"] == c) for c in COLLECTIONS}
    puces = ['<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Tout <span>{}</span></button>'.format(len(CATALOGUE))]
    puces += ['<button type="button" class="puce" data-filtre="{}" aria-pressed="false">{} <span>{}</span></button>'.format(c, n, comptes[c])
              for c, n in COLLECTIONS.items()]
    voir = "".join('<button type="button" class="puce puce--fin" data-voir-en="{}" aria-pressed="false"><span class="pastille pastille--{}" aria-hidden="true"></span>{}</button>'.format(f, f, n)
                   for f, n, _ in FINITIONS)
    ordre = sorted(CATALOGUE, key=lambda p: (p["collection"] == "accessoires", not p["best"]))
    cartes = "".join(carte_produit(p, titre_niveau="h2") for p in ordre)
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Les plaques</li></ol></nav>
    {etiq}
    <h1>Les douze plaques</h1>
    <p class="chapo">Plaques de 60 × 30 cm en aluminium de 2 mm, découpé au laser puis thermolaqué. Chaque modèle existe en noir, gris et doré, au même prix : 65 € TTC.</p>
  </header>
  <div class="filtres">
    <div class="puces" role="group" aria-label="Filtrer par thème">{puces}</div>
    <div class="filtres__droite">
      <div class="puces" role="group" aria-label="Afficher toutes les plaques en">{voir}</div>
      <div class="champ champ--ligne"><label for="tri">Classer</label><select id="tri" data-tri><option value="selection">Sélection de l’atelier</option><option value="nord-sud">Du nord au sud</option><option value="nom">Par nom</option></select></div>
    </div>
  </div>
  <p class="compte" data-compte aria-live="polite">{n} articles</p>
  <ul class="grille" data-grille>{cartes}</ul>
</div>
<section class="section section--teinte">
  <div class="cadre bandeau-infos">
    <div><h2>Livraison</h2><p>Expédiée depuis Bagnères-de-Bigorre, en 2 à 4 jours ouvrés (indicatif). Frais selon le poids et la destination, affichés avant validation {fournir}</p></div>
    <div><h2>Rétractation</h2><p>Vous avez 14 jours après réception pour changer d’avis, comme la loi le prévoit. Frais de retour à votre charge.</p></div>
    <div><h2>Paiement</h2><p>Carte bancaire, PayPal (y compris en 4 fois sans frais), Apple Pay, Google Pay.</p></div>
  </div>
</section>""".format(etiq=etiquette("Inventaire"), puces="".join(puces), voir=voir, n=len(CATALOGUE), cartes=cartes,
                     fournir=note("montant à fournir"))
    page("collection.html", "Les douze plaques · Terre Gravée",
         "Toutes les plaques Terre Gravée : cinq paysages, trois monuments et quatre animaux des Hautes-Pyrénées, en noir, gris ou doré. 65 € TTC la plaque, kit LED et carte cadeau.",
         contenu, actif="collection.html", classe="page-collection")


# ---------------------------------------------------------------------------
# Fiches produit
# ---------------------------------------------------------------------------

def bloc_livraison():
    return """<div class="avant-commande">
  <h2 class="avant-commande__titre">Avant de commander</h2>
  <dl>
    <div><dt>Livraison</dt><dd>Expédiée depuis Bagnères-de-Bigorre. <span data-estimation>Livraison en 2 à 4 jours ouvrés</span>, à titre indicatif ; l’atelier vous prévient en cas de retard. {conf}</dd></div>
    <div><dt>Frais de port</dt><dd>Selon le poids et la destination, affichés avant validation. {fournir}</dd></div>
    <div><dt>Rétractation</dt><dd>14 jours après réception pour vous rétracter sans justification, comme la loi le prévoit. Frais de retour à votre charge, plaque dans son état d’origine. <a href="contact.html#livraison">Détails</a></dd></div>
    <div><dt>Garanties</dt><dd>Garanties légales de conformité et des vices cachés.</dd></div>
    <div><dt>Paiement</dt><dd>Carte bancaire (Stripe), PayPal, y compris en 4 fois sans frais, Apple Pay, Google Pay.</dd></div>
  </dl>
</div>""".format(conf=note("à confirmer : délai de préparation compris ?", "confirmer"), fournir=note("montant à fournir"))


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
        "description": DESCRIPTIONS_ACC.get(p["slug"], " ".join(p["histoire"])[:300]),
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
    coll = COLLECTIONS[p["collection"]]
    cat = cat_de(slug)
    lieu, detail = p["cartel"]
    scenes, vignettes, radios = [], [], []
    for f, nom, acc in FINITIONS:
        cache = "" if f == f0 else " hidden"
        if a_photo(slug, f):
            vt = ' style="view-transition-name:vt-{}"'.format(slug) if f == f0 else ""
            scenes.append('<div class="scene" data-scene="{}"{}>{}</div>'.format(
                f, cache, img_plaque(p, f, "(max-width: 900px) 70vw, 400px", eager=(f == f0), extra=vt.strip())))
            vignettes.append('<button type="button" class="vignette" data-vue="{f}" aria-pressed="{pr}"><img src="{img}p/{s}-{f}-440.webp" alt="" width="30" height="60" loading="lazy" decoding="async"><span>{n}</span></button>'.format(
                f=f, pr="true" if f == f0 else "false", img=IMG, s=slug, n=nom))
        else:
            scenes.append('<div class="scene" data-scene="{}"{}>{}</div>'.format(f, cache, vide_photo(p, f, "photo-a-venir--grand")))
            vignettes.append('<button type="button" class="vignette" data-vue="{f}" aria-pressed="false"><span class="vignette__vide" aria-hidden="true"></span><span>{n}</span><span class="visuellement-cache"> (photo à venir)</span></button>'.format(f=f, n=nom))
        radios.append('<label class="finition finition--{f}"><input type="radio" name="finition" value="{f}"{c}><span class="pastille pastille--{f}" aria-hidden="true"></span><span>{n}{m}</span></label>'.format(
            f=f, c=" checked" if f == f0 else "", n=nom, m="" if a_photo(slug, f) else ' <small>(photo à venir)</small>'))
    if p["decor"]:
        rel640 = p["decor"].replace("-1200", "-640")
        scenes.append('<div class="scene scene--situation" data-scene="situation" hidden><figure>{}<figcaption>Mise en situation</figcaption></figure></div>'.format(
            img(p["decor"], "Mise en situation : plaque " + p["nom"] + " sur un mur", "(max-width: 900px) 92vw, 640px",
                extra='srcset="{0}{1} 640w, {0}{2} 1200w"'.format(IMG, rel640, p["decor"]) if rel640 in TAILLES and rel640 != p["decor"] else "")))
        vignettes.append('<button type="button" class="vignette vignette--situation" data-vue="situation" aria-pressed="false"><img src="{}{}" alt="" width="60" height="60" loading="lazy" decoding="async"><span>En situation</span></button>'.format(IMG, rel640))
    data_img = " ".join('data-img-{0}="{1}p/{2}-{0}-440.webp"'.format(f, IMG, slug) for f, _, _ in FINITIONS if a_photo(slug, f))
    nb = len(p["avis"])
    if nb:
        moy = sum(a["note"] for a in p["avis"]) / nb
        note_html = '<p class="achat__note">{} <a href="#avis-modele">{} / 5 · {} avis</a></p>'.format(etoiles(moy), note_fr(moy), nb)
    else:
        note_html = '<p class="achat__note achat__note--vide">Pas encore d’avis sur ce modèle</p>'
    if slug in LIEUX:
        la, lo = LIEUX[slug][0], LIEUX[slug][1]
        pos = '{} <span class="cartel__note">indicative</span>'.format(dms(la, lo))
        voir_carte = '<a class="lien-fleche" href="carte.html#{}">Voir sur la carte</a>'.format(slug)
    else:
        pos = 'Parc national des Pyrénées <span class="cartel__note">sans repère précis</span>'
        voir_carte = '<a class="lien-fleche" href="carte.html#faune">La faune sur la carte</a>'
    dlab = "Nom latin" if p["collection"] == "faune" else ("Altitude" if detail.endswith(" m") else "Repère")
    ddet = "<i>{}</i>".format(e(detail)) if p["collection"] == "faune" else e(detail)
    histoire = "".join("<p>{}</p>".format(e(x)) for x in p["histoire"])
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
    titre_vois = "Les autres animaux du Parc" if slug in FAUNE else "Lieux voisins sur la carte"
    cartes_vois = []
    for q, d in vois:
        c = carte_produit(q, sizes="(max-width: 600px) 44vw, 240px")
        if d is not None:
            c = c.replace('<p class="carte__cartel">', '<p class="carte__distance">à {} km à vol d’oiseau</p><p class="carte__cartel">'.format(int(round(d))), 1)
        cartes_vois.append(c)
    cartes_vois.append(carte_produit(PRODUITS["led"], sizes="(max-width: 600px) 44vw, 240px").replace(
        '<p class="carte__cartel">', '<p class="carte__distance">À associer</p><p class="carte__cartel">', 1))
    positions = choix_cable()
    contenu = """
<div class="cadre">
  <nav aria-label="Fil d’Ariane" class="ariane-wrap"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li><a href="collection.html">Les plaques</a></li><li><a href="collection.html#{coll_id}">{coll}</a></li><li aria-current="page">{nom}</li></ol></nav>
  <div class="fiche" data-fiche data-type="plaque" data-slug="{slug}" data-nom="{nom}" data-prix="{prix}" data-prix-led="15" {data_img}>
    <div class="galerie">
      <div class="galerie__scene">{scenes}</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues de la plaque">{vignettes}</div>
      <p class="galerie__note">Photos de la plaque détourées au ras du métal : les découpes apparaissent en blanc. Les mises en situation sont des montages.</p>
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
      <div class="lecture">{histoire}</div>
      {lien}
      <p class="entree__note">Récit du lieu à enrichir : 300 à 500 mots, faits vérifiables, auteur et date de publication {fournir_court}</p>
      <h3>Comment elle est faite</h3>
      <ul class="liste-carnet">
        <li>Dessin original de Maude Villatte et Lola Jacquet.</li>
        <li>Découpe laser à Revel (31), dans une feuille d’aluminium de 2 mm, titre en lettrage pochoir.</li>
        <li>Thermolaquage à Bagnères-de-Bigorre (65), finition mate ou satinée.</li>
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
        <div><dt>Usage</dt><dd>Intérieur et extérieur</dd></div>
        <div><dt>Édition</dt><dd>Série limitée, numéro gravé au dos</dd></div>
      </dl>
    </div>
  </div>
</article>
<section class="section section--teinte" id="avis-modele" aria-labelledby="titre-avis">
  <div class="cadre">
    <div class="entete-section"><p class="etiquette">{balise}Avis</p><h2 id="titre-avis">Ce qu’en disent les clients</h2></div>
    <div class="avis-grille">
      <div>
        {avis}
        {mention}
      </div>
      <aside class="avis-appel" aria-labelledby="titre-appel">
        <h3 id="titre-appel">Vous avez cette plaque ?</h3>
        <p>Racontez où vous l’avez posée et envoyez une photo : elle pourra illustrer cette fiche, avec votre accord.</p>
        <p><a class="bouton bouton--trait" href="mailto:contact@terregravee.fr?subject=Mon%20avis%20sur%20{sujet}">Envoyer mon avis</a></p>
        <p class="avis-appel__note">Aucune contrepartie {conf}</p>
      </aside>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="titre-voisins">
  <div class="cadre">
    <div class="entete-section entete-section--ligne"><div><p class="etiquette">{balise}{etiq_vois}</p><h2 id="titre-voisins">{titre_vois}</h2></div><a class="lien-fleche" href="carte.html">Toute la carte</a></div>
    <ul class="grille grille--quatre">{cartes_vois}</ul>
  </div>
</section>""".format(
        coll_id=p["collection"], coll=coll, nom=e(p["nom"]), slug=slug, prix=p["prix"], data_img=data_img, scenes="".join(scenes),
        vignettes="".join(vignettes), sym=symbole(cat), catnom=CATS[cat][0] if cat != "faune" else "Faune des Pyrénées",
        note=note_html, lieu=e(lieu), dlab=dlab, ddet=ddet, pos=pos, fournir_court=A_FOURNIR, fin_nom=NOM_FIN[f0], radios="".join(radios),
        positions=positions, valider=A_VALIDER, fournir=note("frais de port à fournir"), livraison=bloc_livraison(), balise=BALISE,
        borne=borne_de(p), loc=localisateur(slug), voir_carte=voir_carte, titre_h=e(p["titre_histoire"]), histoire=histoire, lien=lien,
        offrir=offrir, situation=situation, avis=avis_fiche(p), mention=MENTION_AVIS, conf=A_CONFIRMER,
        sujet=p["nom"].replace("’", "%E2%80%99").replace(" ", "%20"),
        etiq_vois="Faune" if slug in FAUNE else "À proximité", titre_vois=titre_vois, cartes_vois="".join(cartes_vois))
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
        k, "" if i == 0 else " hidden", img("led/{}.webp".format(k), alt, "(max-width: 900px) 92vw, 560px", eager=(i == 0))) for i, (k, alt, _) in enumerate(vues))
    vign = "".join('<button type="button" class="vignette vignette--situation" data-vue="{k}" aria-pressed="{pr}"><img src="{img}led/{k}.webp" alt="" width="60" height="60" loading="lazy" decoding="async"><span>{n}</span></button>'.format(
        k=k, pr="true" if i == 0 else "false", img=IMG, n=n) for i, (k, _, n) in enumerate(vues))
    tuto = [("tuto-0", "Contenu du kit LED : ruban, contrôleur, télécommande et câble USB", "Le contenu du kit"),
            ("tuto-1", "Ruban LED positionné au dos de la plaque", "Le ruban se pose au dos"),
            ("tuto-2", "Décollage de la protection de l’adhésif du ruban", "On retire la protection"),
            ("tuto-4", "Ruban plié dans un angle de la plaque", "Les angles"),
            ("tuto-5", "Coupe du ruban LED aux repères prévus", "La coupe aux repères"),
            ("tuto-7", "Télécommande du kit LED", "La télécommande")]
    etapes = "".join('<li><figure>{}<figcaption>{}</figcaption></figure></li>'.format(
        img("tuto/{}.webp".format(k), alt, "(max-width: 700px) 44vw, 200px"), cap) for k, alt, cap in tuto)
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
    <div class="entete-section"><p class="etiquette">{balise}À associer</p><h2 id="titre-associer">Les plaques les plus demandées</h2></div>
    <ul class="grille grille--quatre">{cartes}</ul>
  </div>
</section>""".format(img=IMG, scenes=scenes, vign=vign, cable=choix_cable(), conf=note("longueur à confirmer", "confirmer"),
                     livraison=bloc_livraison(), balise=BALISE, etapes=etapes,
                     cartes="".join(carte_produit(PRODUITS[s], sizes="(max-width: 600px) 44vw, 260px") for s in ("le-pic-du-midi", "lours", "lisard", "le-cerf")))
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
      <div class="champ"><label for="message-carte">Message pour la personne (facultatif)</label><textarea id="message-carte" rows="3" maxlength="240" data-message-cadeau></textarea></div>
      <div class="achat__ligne">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une carte">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité" data-quantite><button type="button" data-qte="1" aria-label="Ajouter une carte">+</button></div>
        <button type="button" class="bouton bouton--plein bouton--large" data-ajouter>Ajouter à la commande</button>
      </div>
      <dl class="caracteristiques">
        <div><dt>Valeur</dt><dd>Une plaque au choix</dd></div>
        <div><dt>Validité</dt><dd>Tous les modèles disponibles sur la boutique. Durée de validité {fournir}</dd></div>
        <div><dt>Envoi</dt><dd>Immédiat par e-mail, ou à imprimer chez vous</dd></div>
        <div><dt>Kit LED</dt><dd>Non compris : la personne peut l’ajouter à sa commande, 15 €</dd></div>
      </dl>
    </div>
  </div>
</div>
<section class="section section--teinte" aria-labelledby="titre-idees">
  <div class="cadre">
    <div class="entete-section"><p class="etiquette">{balise}Ou choisissez pour elle</p><h2 id="titre-idees">Trois lieux souvent offerts</h2>
    <p class="chapo">Selon les avis publiés : un ami, un souvenir de cure, une maison de vacances.</p></div>
    <ul class="grille grille--trois">{cartes}</ul>
  </div>
</section>""".format(img=IMG, visuel=img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, lettrage doré sur fond cuivré", "(max-width: 900px) 92vw, 520px", eager=True),
                     fournir=A_FOURNIR, balise=BALISE,
                     cartes="".join(carte_produit(PRODUITS[s], sizes="(max-width: 600px) 44vw, 260px") for s in ("le-cerf", "la-marmotte", "lisard")))
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
  <div class="cadre deux-col deux-col--image">
    <div>
      <p class="etiquette">{balise}Professionnels, collectivités, lieux culturels</p>
      <h2 id="titre-series">Séries sur demande</h2>
      <ul class="liste-carnet">
        <li>Une frise qui raconte une histoire locale.</li>
        <li>Des plaques signalétiques au style artistique.</li>
        <li>Des éditions spéciales pour une exposition, un événement ou un lieu touristique.</li>
      </ul>
      <p>La quantité minimale dépend du projet.</p>
    </div>
    <figure class="photo-reelle">{aquensis}<figcaption>Plaques Terre Gravée à Aquensis, Bagnères-de-Bigorre</figcaption></figure>
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
      <p class="chapo">Un croquis, une photo du mur ou du lieu, un ordre de grandeur : plus la demande est précise, plus la réponse est rapide.</p>
      <p>Vous préférez écrire directement ? <a href="contact.html">contact@terregravee.fr</a></p>
    </div>
    <form class="formulaire" data-demo novalidate>
      <div class="champs">
        <div class="champ"><label for="type-demande">Type de demande</label><select id="type-demande"><option>Adapter un modèle existant</option><option>Plaque exclusive</option><option>Série pour un professionnel</option></select></div>
        <div class="champ"><label for="modele">Modèle de départ</label><select id="modele"><option>Aucun en particulier</option>{options}</select></div>
        <div class="champ"><label for="metal">Métal</label><select id="metal"><option>Aluminium thermolaqué, teinte RAL</option><option>Acier Corten</option><option>Aluminium brut</option><option>Je ne sais pas encore</option></select></div>
        <div class="champ"><label for="format">Format souhaité</label><input id="format" type="text" placeholder="Par exemple 120 × 60 cm"><small>Jusqu’à 2 m × 1 m</small></div>
        <div class="champ"><label for="quantite-projet">Quantité</label><input id="quantite-projet" type="number" min="1" value="1"></div>
        <div class="champ"><label for="usage">Usage</label><select id="usage"><option>Intérieur</option><option>Extérieur</option><option>Les deux</option></select></div>
        <div class="champ champ--large"><label for="message-projet">Votre projet</label><textarea id="message-projet" rows="4"></textarea></div>
        <div class="champ"><label for="nom-projet">Nom</label><input id="nom-projet" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="email-projet">E-mail</label><input id="email-projet" type="email" autocomplete="email" required></div>
      </div>
      <button class="bouton bouton--plein" type="submit">Envoyer la demande</button>
      <p class="formulaire__aide">Vos coordonnées servent uniquement à répondre à cette demande.</p>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
    </form>
  </div>
</section>""".format(etiq=etiquette("Créations spéciales"), balise=BALISE,
                     corten='<div class="materiaux__plaque">' + img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten, teinte rouille", "(max-width: 700px) 42vw, 220px") + "</div>",
                     brut='<div class="materiaux__plaque">' + img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", "(max-width: 700px) 42vw, 220px") + "</div>",
                     planche=img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits : la Vierge du Bédat, la brèche de Roland, l’iris, l’orchis maculée, le gypaète barbu…", "(max-width: 900px) 100vw, 620px"),
                     aquensis=img("misc/aquensis.webp", "Bassin d’Aquensis à Bagnères-de-Bigorre, avec une rangée de plaques Terre Gravée rétroéclairées", "(max-width: 900px) 100vw, 620px"),
                     options=options)
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
      <h2>Formulaire</h2>
      <div class="champs">
        <div class="champ"><label for="nom-contact">Nom</label><input id="nom-contact" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="email-contact">E-mail</label><input id="email-contact" type="email" autocomplete="email" required></div>
        <div class="champ champ--large"><label for="sujet-contact">Sujet</label><select id="sujet-contact"><option>Une question sur une plaque</option><option>Ma commande</option><option>Un projet sur mesure</option><option>Autre</option></select></div>
        <div class="champ champ--large"><label for="message-contact">Message</label><textarea id="message-contact" rows="5" required></textarea></div>
      </div>
      <button class="bouton bouton--plein" type="submit">Envoyer</button>
      <p class="formulaire__aide">Vos coordonnées servent uniquement à vous répondre.</p>
      <p class="message-demo" role="status" tabindex="-1" hidden>Maquette : rien n’est envoyé.</p>
    </form>
  </div>
</div>
<section class="section section--teinte" id="livraison" aria-labelledby="titre-faq">
  <div class="cadre faq-grille">
    <div class="entete-section"><p class="etiquette">{balise}Questions pratiques</p><h2 id="titre-faq">Livraison, retours, paiement</h2></div>
    <div class="faq">
      <details open><summary>Quand vais-je recevoir ma plaque ?</summary><p>Les plaques sont expédiées depuis Bagnères-de-Bigorre. Comptez 2 à 4 jours ouvrés, à titre indicatif. En cas de retard, l’atelier vous prévient. <span data-estimation-texte></span></p></details>
      <details><summary>Combien coûte la livraison ?</summary><p>Les frais dépendent du poids et de la destination. Ils s’affichent avant la validation de la commande. {fournir}</p></details>
      <details><summary>Puis-je changer d’avis ?</summary><p>Oui. La loi vous donne 14 jours après réception pour vous rétracter, sans avoir à vous justifier. Les frais de retour sont à votre charge et la plaque doit être renvoyée dans son état d’origine. Les pièces personnalisées sont exclues.</p>
        <p><button type="button" class="bouton bouton--trait" data-demo-bouton>Renoncer au contrat ici</button> <span class="message-demo" role="status" hidden>Maquette : rien n’est envoyé.</span></p>
        <p class="attenue">Ce bouton de rétractation est obligatoire sur le site marchand depuis le 19 juin 2026 {conf}</p></details>
      <details><summary>Quelles garanties ?</summary><p>Toutes les plaques bénéficient des garanties légales de conformité et des vices cachés.</p></details>
      <details><summary>Comment payer ?</summary><p>Carte bancaire (Stripe), PayPal, y compris en 4 fois sans frais, Apple Pay et Google Pay.</p></details>
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
                     conf=A_CONFIRMER)
    page("contact.html", "Contact, livraison et retours · Terre Gravée",
         "Écrire à l’atelier Terre Gravée à Gerde (65) : contact@terregravee.fr. Livraison en 2 à 4 jours ouvrés, rétractation de 14 jours, paiement et publication des avis.",
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
        "nom": "La carte, porte d’entrée et contenu à partager",
        "ou": "carte.html : repères cliquables, panneau latéral, liste des lieux, une adresse par lieu (carte.html#le-tourmalet) et bouton « Copier le lien du lieu ». Aperçu sur l’accueil (« Table des lieux ») et localisateur sur chaque fiche.",
        "pourquoi": "Aucune étude trouvée sur l’effet commercial d’une carte : c’est une hypothèse à tester. Le levier documenté est la visibilité : 23 % des Français disent commencer leurs recherches de Noël par une IA (baromètre Havas Market / YouGov, octobre 2026, lu via " + src("https://www.e-marketing.fr/retail-1095/noel-2026-budget-en-hausse-mais-des-achats-sous-forte-contrainte-175794", "e-marketing.fr") + "). Une carte accessible doit être opérable au clavier, ne pas dépendre de la couleur et proposer une alternative texte (" + src("https://www.boia.org/blog/interactive-maps-and-accessibility-4-tips", "BOIA") + ").",
        "valider": "Proposer la carte aux offices de tourisme, gîtes ou centres thermaux (partenariat à décider) ; vérifier les positions des repères.",
        "kpi": "Taux de clic sur les repères, parcours carte → fiche → panier, sessions arrivant par un lien à ancre, liens entrants vers carte.html.",
    },
    {
        "nom": "Le trajet de fabrication, en clair",
        "ou": "Accueil (« De Revel à votre mur »), calque « Trajet de fabrication » de la carte, liste « Comment elle est faite » sur chaque fiche.",
        "pourquoi": "Rendre le travail visible augmente la valeur perçue (Buell et Norton, Management Science, 2011, " + src("https://ideas.repec.org/a/inm/ormnsc/v57y2011i9p1564-1579.html", "IDEAS") + "). La transparence aide quand le processus se montre bien (entretien avec Martin Schreier, " + src("https://www.wu.ac.at/fileadmin/wu/d/i/mm/news/Schreier_Seiten_aus_handWERK.pdf", "WU Vienne") + ").",
        "valider": "Photos réelles de chaque étape (découpe à Revel, four de thermolaquage, emballage) ; vérifier la formule « rayon de 150 km » : Revel est à environ " + str(KM_REVEL) + " km de Gerde à vol d’oiseau. Ne jamais écrire « fait main ».",
        "kpi": "Clics sur « Fabrication » et sur le calque trajet, conversion des visiteurs qui l’ont vu (corrélation, pas causalité).",
    },
    {
        "nom": "Marketing identitaire local",
        "ou": "Titre de l’accueil (« Un morceau de Bigorre, à accrocher chez vous »), occasions « crémaillère en Bigorre » et « départ loin des Pyrénées », avis de Sergio (« Habitant à Mauvezin… »).",
        "pourquoi": "Aucune étude solide trouvée sur la fierté locale appliquée à la décoration : hypothèse à tester. L’avis réel de Sergio l’illustre sans rien inventer.",
        "valider": "Le ton : la maquette parle de Bigorre et des Hautes-Pyrénées ; faut-il élargir aux Pyrénées pour les touristes ?",
        "kpi": "Conversion par origine géographique (65 et départements voisins comparés au reste de la France), part des commandes livrées hors du 65.",
    },
    {
        "nom": "Des occasions de cadeau ancrées dans le réel",
        "ou": "Accueil (« À offrir à… »), « À qui l’offrir » sur chaque fiche, option « C’est un cadeau » (message, prix masqués) près du bouton d’achat, fiche carte cadeau.",
        "pourquoi": "Les produits artisanaux sont surtout choisis pour offrir à un proche (Schreier). 78 % des sites ne montrent pas d’option cadeau sur la fiche (" + src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard, 2026") + ") ; en test, les acheteurs veulent surtout masquer les prix et ajouter un message (" + src("https://baymard.com/blog/gifting-flow", "Baymard") + "). 66 % des Français prévoient l’essentiel de leurs achats de Noël avant le 1er décembre (Havas Market / YouGov 2026, via " + src("https://mondetech.fr/noel-2026-novembre-mois-cle-des-achats/", "mondetech.fr") + ").",
        "valider": "Option cadeau (message, prix masqués) ; durée de validité de la carte cadeau ; publier un guide cadeaux début novembre, avant le Black Friday du 27 novembre 2026 (" + src("https://publicholidays.com/black-friday/", "publicholidays.com") + ").",
        "kpi": "Part des commandes avec message cadeau, ventes de cartes cadeaux, conversion des pages d’occasion (liens UTM).",
    },
    {
        "nom": "Des avis réels, datés, rattachés aux lieux",
        "ou": "Panneau de la carte, fiches produit, « Registre des avis » de l’accueil (les 9 avis, sans sélection), politique de publication sur la page Contact.",
        "pourquoi": "Avec 5 avis, la probabilité d’achat serait 270 % plus élevée qu’avec zéro, et elle culmine entre 4,0 et 4,7 étoiles (" + src("https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales", "Spiegel Research Center") + ", données d’un seul distributeur). Montrer des avis mixtes et leur contexte (" + src("https://www.nngroup.com/articles/ecommerce-product-pages/", "NN/g") + "). 89 % des sites ne répondent pas aux avis négatifs (Baymard 2026) : la fiche du Cerf prévoit la réponse de l’atelier.",
        "valider": "Rédiger la réponse à l’avis de Gerald (livraison en une semaine) ; demander des photos de plaques posées ; mettre en place une vérification d’achat si possible.",
        "kpi": "Nombre d’avis par modèle (viser 5 sur les modèles phares), part d’avis avec photo, conversion des fiches avec ou sans avis.",
    },
    {
        "nom": "Lettre « planche inédite »",
        "ou": "Accueil (bloc en page de carnet avec la planche voilée), page Sur mesure (planche entière, jamais réservée aux abonnés).",
        "pourquoi": "Une inscription rapide qui dit ce que contient la lettre (" + src("https://www.nngroup.com/articles/newsletters/", "NN/g") + "). Les e-mails automatiques font 2 % des envois mais 30 % du chiffre d’affaires e-mail (" + src("https://www.omnisend.com/2026-ecommerce-marketing-report", "Omnisend 2026") + ", éditeur).",
        "valider": "Le vote pour le prochain lieu, le rythme (une lettre par mois au plus), l’outil d’envoi avec double confirmation ; consentement séparé pour la mesure d’ouverture (" + src("https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels", "CNIL, avril 2026") + ").",
        "kpi": "Inscriptions pour 100 visiteurs, taux de consentement à la mesure, clics, ventes attribuées, désinscriptions.",
    },
    {
        "nom": "La rareté réelle : la série numérotée",
        "ou": "Cartel de chaque fiche (« Série : limitée, numéro gravé au dos »), engagements de l’accueil.",
        "pourquoi": "Un message « quantité limitée » convainc plus qu’un message « temps limité », surtout pour une marque symbolique (Aggarwal, Jun et Huh, 2011, " + src("https://experts.umn.edu/en/publications/scarcity-messages-a-consumer-competition-perspective/", "University of Minnesota") + "). La rareté n’est honnête que si elle est vraie (" + src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g") + ").",
        "valider": "La taille réelle de chaque série ; un registre public des numéros attribués (ville seulement, avec accord de l’acheteur) ; aucune relance d’une série épuisée sous le même nom.",
        "kpi": "Délai d’épuisement par série, inscriptions à la lettre, demandes « prochaine série ».",
    },
    {
        "nom": "Coût total et délais près du bouton",
        "ou": "Bloc « Avant de commander » de chaque fiche : estimation de dates de livraison calculée à partir de 2 à 4 jours ouvrés, frais de port, rétractation présentée comme un droit légal, paiements.",
        "pourquoi": "64 % des testeurs cherchent les frais de port sur la fiche (" + src("https://baymard.com/blog/show-shipping-costs-on-product-pages", "Baymard") + ") ; 41 % des sites n’indiquent pas de date de livraison (" + src("https://baymard.com/blog/shipping-speed-vs-delivery-date", "Baymard") + "). Pour Noël 2026, 47 % des Français citent les frais de port et 46 % les délais (Havas / YouGov). Un panier moyen e-commerce de 62 € en 2025 (" + src("https://www.ecommerce-nation.fr/bilan-ecommerce-2025-196-milliards-baisse-panier-moyen/", "FEVAD via E-Commerce Nation") + ") : une plaque à 65 € est dans la norme.",
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
    ("Un blanc froid de carte", "Pantone 2026 est un blanc cassé, Cloud Dancer (" + src("https://www.smithsonianmag.com/smart-news/pantones-color-of-the-year-for-2026-is-a-blank-canvas-called-cloud-dancer-or-in-other-words-white-180987805/", "Smithsonian") + "). Pour s’en distinguer : un blanc légèrement bleuté de carte topographique, le bistre des courbes de niveau, le bleu des eaux, le vert du Parc et le rouge-blanc du balisage GR. Option « carte de nuit » en sombre."),
    ("Interface discrète, matière réelle", "Filets fins, peu d’ombres, coins presque droits. Aucune image générée : seules les vraies photos de la marque. Les créatifs se disent lassés des images IA, du glassmorphism et des grilles bento (" + src("https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/", "Creative Boom, avril 2026") + ")."),
    ("Récit qui réagit sans détourner le défilement", "Un seul geste animé : le tracé « De Revel à votre mur » se renforce au défilement avec animation-timeline (Chrome, Safari 26), dans @supports, le tracé complet restant l’état par défaut (" + src("https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/", "web-features") + ", " + src("https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/", "WebKit") + ")."),
    ("Relief génératif léger", "Courbes de niveau dessinées une fois dans un canvas (aucune bibliothèque, aucun WebGL), à partir de quelques sommets réels. La 3D décorative coûte de 0,8 à 2 Mo de JavaScript selon " + src("https://dev.to/studiomeyer_io/web-design-trends-2026-what-actually-held-up-after-six-months-23p8", "StudioMeyer") + " (données d’agence)."),
    ("View Transitions entre carte et fiche", "La photo du panneau de la carte et l’image principale de la fiche partagent un nom de transition : Chrome, Edge et Safari 18.2 enchaînent les deux pages, Firefox navigue normalement (" + src("https://web-platform-dx.github.io/web-features-explorer/features/cross-document-view-transitions/", "web-features") + ", " + src("https://developer.chrome.com/docs/web-platform/view-transitions/cross-document", "Chrome") + "). Désactivé si l’utilisateur réduit les animations. En ouvrant les fichiers en local (file://), l’effet peut ne pas se déclencher."),
    ("Coupures de lignes soignées", "text-wrap: balance sur les titres, pretty sur le texte courant en amélioration progressive (" + src("https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-balance/", "balance") + ", " + src("https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-pretty/", "pretty") + ")."),
    ("Commerce honnête", "Ni compte à rebours, ni stock affiché, ni prix barré. La consultation européenne sur le Digital Fairness Act vise ces pratiques (" + src("https://www.osborneclarke.com/insights/digital-fairness-act-unpacked-dark-patterns", "Osborne Clarke") + ")."),
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
        ("Pratiques commerciales trompeuses", "Aucun stock, délai, label ou partenariat inventé (L121-2). La présence des plaques à Aquensis est montrée sans parler de partenariat ni de point de vente. Pas de « fait main » : la découpe est faite au laser à Revel. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563107", "L121-4 sur Légifrance")),
        ("Droits légaux", "Les 14 jours de rétractation et les garanties légales sont présentés comme des droits, jamais comme un avantage de la marque (L121-4, 10°)."),
        ("Avis en ligne", "Mention « publiés sans vérification d’achat » près de chaque bloc d’avis, dates de publication, ordre chronologique, rubrique « Comment sont publiés les avis » (L111-7-2 ; D111-16 à D111-19). Textes cités mot pour mot. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049571119", "L111-7-2") + ", " + src("https://www.legifrance.gouv.fr/jorf/id/JORFARTI000035720943", "décret 2017-1436")),
        ("Prix et réductions", "Aucun prix barré. Toute réduction future devra se référer au prix le plus bas des 30 derniers jours (L112-1-1). " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044549592", "Légifrance")),
        ("Lettre d’information", "Case non cochée, finalité écrite, double confirmation, désinscription à chaque envoi (L34-5 CPCE, RGPD). Consentement séparé pour le pixel de mesure d’ouverture (CNIL, recommandation d’avril 2026, transition terminée le 14 juillet 2026). " + src("https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique", "CNIL")),
        ("Bouton de rétractation", "Un bouton « Renoncer au contrat ici » est obligatoire depuis le 19 juin 2026 selon l’analyse d’un cabinet d’avocats ; les articles exacts restent à vérifier. Démonstration sur la page Contact. " + src("https://hlc.com/fr/publications/transposition-under-french-law-of-the-eu-mandatory-withdrawal-button-for-online-sales", "Hogan Lovells")),
        ("Sur mesure", "Les pièces adaptées à la demande sont exclues du droit de rétractation (L221-28, 3°) : c’est écrit sur la page Sur mesure. " + src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563170", "Légifrance")),
        ("Polices", "La maquette charge Google Fonts pour être prête à l’emploi. Un tribunal de Munich a condamné en 2022 un site qui transmettait ainsi l’adresse IP des visiteurs à Google : sur le site réel, héberger les polices soi-même. " + src("https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html", "The Hacker News")),
        ("Formule « rayon de 150 km »", "Revel (31) est à environ " + str(KM_REVEL) + " km de Gerde à vol d’oiseau. Selon le point de référence choisi, la formule peut être contestée : préciser le centre du rayon ou écrire « fabriquées en Occitanie »."),
    ]
    legal_html = "".join("<li><h3>{}</h3><p>{}</p></li>".format(t, d) for t, d in legal)
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
        "La fixation conseillée en extérieur.",
        "Le point de référence de la formule « rayon de 150 km ».",
    ]
    valider = [
        "Option cadeau : message sur une carte et prix masqués sur le bon de livraison.",
        "Lettre : vote pour le prochain lieu gravé, une lettre par mois au plus.",
        "Visite de l’atelier sur rendez-vous ; retrait des commandes à Gerde.",
        "Partenariats avec offices de tourisme, gîtes ou centres thermaux autour de la carte.",
        "Guide cadeaux publié début novembre, avant le Black Friday du 27 novembre 2026.",
    ]
    contenu = """
<div class="cadre strategie">
  <header class="entete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Carnet</a></li><li aria-current="page">Stratégie</li></ol></nav>
    {etiq}
    <h1>Version 1 : le carnet de territoire</h1>
    <p class="chapo">Romain, cette page explique la version 1 : son idée, les tendances qu’elle suit, chaque technique de vente et ce qu’il te reste à décider. Les trois versions partent des mêmes faits ; celle-ci mise sur le récit des lieux et la carte.</p>
  </header>
  <section class="strat-bloc" aria-labelledby="s-concept">
    <h2 id="s-concept">L’idée</h2>
    <div class="lecture">
      <p>Le site devient un atlas. Chaque plaque est l’entrée d’un lieu que les gens connaissent : le Pic qu’ils voient de leur fenêtre, le col qu’ils ont monté, la tour de la ville où ils ont fait leur cure. La page signature, <a href="carte.html">la carte des plaques</a>, réunit les huit lieux, la zone du Parc national pour les quatre animaux et le trajet de fabrication de Revel à Bagnères-de-Bigorre.</p>
      <p>Le ton est celui d’un carnet de terrain : cartels, coordonnées, bornes d’altitude, registre des avis. Le commerce est lent et net : prix unique, délais et frais près du bouton, aucune urgence.</p>
    </div>
    <div class="personas">
      <h3>Pour qui (hypothèses, pas des affirmations à publier)</h3>
      <ul>
        <li><strong>L’habitant de Bigorre</strong>, fier de son coin : il cherche « son » lieu sur la carte.</li>
        <li><strong>Le touriste, randonneur ou cycliste</strong> : un souvenir du Tourmalet, de Gavarnie, du Pont d’Espagne.</li>
        <li><strong>La curiste de Bagnères</strong> : elle a vu les plaques à Aquensis ou pendant sa cure.</li>
        <li><strong>La personne qui cherche un cadeau</strong> : occasions concrètes, option message, carte cadeau.</li>
      </ul>
    </div>
  </section>
  <section class="strat-bloc" aria-labelledby="s-tendances">
    <h2 id="s-tendances">Les tendances utilisées</h2>
    <ul class="strat-liste">{tend}</ul>
    <p class="attenue">Évité volontairement : parallaxe, défilement détourné, glassmorphism, bento, images générées, dégradés, compte à rebours.</p>
  </section>
  <section class="strat-bloc" aria-labelledby="s-techniques">
    <h2 id="s-techniques">Les techniques de vente, une par une</h2>
    <p class="attenue">Niveau de preuve : fort pour Baymard, NN/g et les articles académiques ; moyen pour les sondages ; faible pour les rapports d’éditeurs (Omnisend, RevenueHunt). Avec le trafic d’une micro-entreprise, préférer les comparaisons avant/après sur des périodes comparables aux tests A/B.</p>
    <div class="techniques">{tech}</div>
    <p class="attenue">Non retenus dans cette version, pour la distinguer de la version 2 : seuil de livraison offerte, lots, quiz et barre d’achat collante sur mobile (cette dernière ne gagne qu’entre 12,5 et 27 % des tests selon {cc}).</p>
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
      <li>Les positions des repères viennent de coordonnées approximatives ; le relief est décoratif.</li>
      <li>Les textes des fiches sont ceux du site actuel : ils restent courts pour des récits de lieu.</li>
      <li>Le panier vit dans le navigateur ; aucune commande, aucun paiement, aucun envoi de formulaire.</li>
      <li>Les polices viennent de Google Fonts : une connexion internet est nécessaire pour les voir.</li>
    </ul>
  </section>
</div>""".format(etiq=etiquette("Note pour Romain"), tend=tend, tech="".join(tech), legal=legal_html,
                 fournir="".join("<li>{}</li>".format(x) for x in fournir), valider="".join("<li>{}</li>".format(x) for x in valider),
                 f=A_FOURNIR, c=A_CONFIRMER, v=A_VALIDER, cc=src("https://cleancommit.io/blog/sticky-add-to-cart-buttons/", "Cleancommit"))
    page("strategie.html", "Stratégie de la version 1 · Terre Gravée",
         "Note pour Romain Fourneaux : concept de la version « Carnet de territoire », tendances, techniques de vente sourcées, points légaux et informations à fournir.",
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
    strategie()
    print("Pages générées dans", ICI)


if __name__ == "__main__":
    main()
