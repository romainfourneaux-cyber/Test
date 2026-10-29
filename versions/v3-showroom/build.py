#!/usr/bin/env python3
"""Maquette Terre Gravée, version 3 « Showroom immersif ».

Génère les pages HTML, assets/catalogue.js et assets/plaques-data/*.js
à partir de ../../maquette/data/catalogue.json.

Usage, depuis n'importe quel dossier :  python build.py
Compatible Python 3.8, bibliothèque standard uniquement.
"""
import base64
import datetime
import html
import json
import os
import re

ICI = os.path.dirname(os.path.abspath(__file__))
MAQ = os.path.normpath(os.path.join(ICI, "..", "..", "maquette"))
with open(os.path.join(MAQ, "data", "catalogue.json"), encoding="utf-8") as f:
    CATALOGUE = json.load(f)
with open(os.path.join(MAQ, "assets", "img", "_sizes.json"), encoding="utf-8") as f:
    TAILLES = json.load(f)

IMG = "../../maquette/assets/img/"
LOC = "assets/img/"
_tl = os.path.join(ICI, "assets", "img", "_sizes.json")
TAILLES_LOC = {}
if os.path.exists(_tl):
    with open(_tl, encoding="utf-8") as f:
        TAILLES_LOC = json.load(f)
PRODUITS = {p["slug"]: p for p in CATALOGUE}
PLAQUES = [p for p in CATALOGUE if p["collection"] != "accessoires"]
SITE = "https://terregravee.fr"
PRIX_PLAQUE = 65
PRIX_LED = PRODUITS["led"]["prix"]

COLLECTIONS = [
    ("paysages", "Paysages", "Sommets, col, cirque et cascades"),
    ("patrimoine", "Patrimoine", "Tour, château fort et abbaye"),
    ("faune", "Faune", "Isard, ours, cerf et marmotte"),
    ("accessoires", "Accessoires", "Kit LED et carte cadeau"),
]
NOM_COLL = {c: n for c, n, _ in COLLECTIONS}
FINITIONS = [("noir", "Noir", "noire"), ("gris", "Gris", "grise"), ("dore", "Doré", "dorée")]
NOM_FIN = {f: n for f, n, _ in FINITIONS}
ACC_FIN = {f: a for f, _, a in FINITIONS}
COULEURS = [
    ("bleu", "Bleu", "#5cb8ff"), ("blanc", "Blanc", "#eef2ff"), ("vert", "Vert", "#5fe39a"),
    ("rouge", "Rouge", "#ff6464"), ("violet", "Violet", "#b88cff"), ("orange", "Orange", "#ffa24c"),
]
# accord au féminin (« lumière bleue »)
COUL_FEM = {"bleu": "bleue", "blanc": "blanche", "vert": "verte", "rouge": "rouge", "violet": "violette", "orange": "orange"}
CABLES = [("bg", "Bas gauche"), ("bd", "Bas droite"), ("hg", "Haut gauche"), ("hd", "Haut droite")]
MURS = [("platre", "Plâtre"), ("beton", "Béton"), ("brique", "Brique"), ("bois", "Bois")]
LED_REELLE = {"lours": ("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED, photo réelle"),
              "le-pic-du-midi": ("led/led-img1.webp", "Plaque Le Pic du Midi rétroéclairée en vert par le kit LED, photo réelle")}
URL_IMG_SITE = SITE + "/assets/img/"  # hypothèse : images publiées sous ce chemin une fois le site en ligne
MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

TOUS_AVIS = sorted([dict(a, produit=p["slug"]) for p in CATALOGUE for a in p["avis"]], key=lambda a: a["date"], reverse=True)
NB_AVIS = len(TOUS_AVIS)
MOYENNE = sum(a["note"] for a in TOUS_AVIS) / NB_AVIS


def e(t):
    return html.escape(str(t), quote=True)


def euros(n):
    return "{} €".format(n)


def note_fr(n):
    return "{:.1f}".format(n).replace(".", ",")


def date_fr(iso):
    d = datetime.date.fromisoformat(iso)
    jour = "1er" if d.day == 1 else str(d.day)
    return "{} {} {}".format(jour, MOIS[d.month - 1], d.year)


def pluriel(n, sing, plur):
    return sing if n < 2 else plur


def rgb(hexa):
    n = int(hexa[1:], 16)
    return "{} {} {}".format((n >> 16) & 255, (n >> 8) & 255, n & 255)


def marq(t):
    return '<span class="marqueur">' + e(t) + "</span>"


def dims(rel):
    return TAILLES[rel]


def a_photo(slug, fin):
    p = PRODUITS[slug]
    ok = any(f["id"] == fin and f["photo"] for f in p["finitions"])
    return ok and ("p/{}-{}-440.webp".format(slug, fin) in TAILLES)


def finitions_photo(slug):
    return [f for f, _, _ in FINITIONS if a_photo(slug, f)]


def fin_defaut(slug, preferee="noir"):
    if a_photo(slug, preferee):
        return preferee
    return finitions_photo(slug)[0]


def tri_nom(nom):
    for art in ("Le ", "La ", "Les ", "L’"):
        if nom.startswith(art):
            return nom[len(art):]
    return nom


def cartel(p, court=False):
    if not p["cartel"]:
        return ""
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return e(lieu) + " · <em>" + e(detail) + "</em>"
    return e(lieu) + " · " + e(detail)


def etoiles(note):
    n = int(round(note))
    return "★" * n + "☆" * (5 - n)


# ---------- Images ----------

def chargement(eager):
    """eager : False (différé), True (immédiat) ou "high" (immédiat et prioritaire)."""
    if eager == "high":
        return 'fetchpriority="high"'
    return 'loading="eager"' if eager else 'loading="lazy"'


def loc(rel):
    """Variante légère générée dans assets/img (voir outils/vignettes.py), si elle existe."""
    return (LOC + rel, TAILLES_LOC[rel]) if rel in TAILLES_LOC else None


def img(rel, alt, sizes="100vw", classe="", eager=False, srcset=None, src=None, wh=None):
    w, h = wh or dims(rel)
    cls = ' class="{}"'.format(classe) if classe else ""
    ss = ' srcset="{}" sizes="{}"'.format(srcset, sizes) if srcset else ""
    return '<img{} src="{}"{} width="{}" height="{}" alt="{}" {} decoding="async">'.format(cls, src or IMG + rel, ss, w, h, e(alt), chargement(eager))


def img_reduite(rel, alt, sizes, classe="", eager=False):
    """Image originale + variante de 440 px (ou 240 px) quand elle existe."""
    w, h = dims(rel)
    base = rel.rsplit(".", 1)[0]
    parts = []
    for larg in (240, 440):
        v = loc("{}-{}.webp".format(base, larg))
        if v:
            parts.append("{} {}w".format(v[0], v[1][0]))
    if not parts:
        return img(rel, alt, sizes, classe, eager)
    parts.append("{}{} {}w".format(IMG, rel, w))
    return img(rel, alt, sizes, classe, eager, srcset=", ".join(parts))


def vignette(rel_petit, rel_grand, largeur, hauteur):
    """Vignette décorative (alt vide) : variante légère si elle existe, sinon l'image d'origine."""
    v = loc(rel_petit)
    src = v[0] if v else IMG + rel_grand
    return '<img src="{}" alt="" width="{}" height="{}" loading="lazy" decoding="async">'.format(src, largeur, hauteur)


def srcset_plaque(slug, fin):
    return "{0}p/{1}-{2}-440.webp 440w, {0}p/{1}-{2}-880.webp 880w".format(IMG, slug, fin)


def img_plaque(p, fin, sizes, eager=False, alt=None, taille=440, classe=""):
    rel = "p/{}-{}-{}.webp".format(p["slug"], fin, taille)
    w, h = dims("p/{}-{}-440.webp".format(p["slug"], fin))
    alt = alt or "Plaque {}, finition {}".format(p["nom"], ACC_FIN[fin])
    cls = ' class="{}"'.format(classe) if classe else ""
    return ('<img{} src="{}{}" srcset="{}" sizes="{}" width="{}" height="{}" alt="{}" {} decoding="async">'
            .format(cls, IMG, rel, srcset_plaque(p["slug"], fin), sizes, w, h, e(alt), chargement(eager)))


def silhouette(slug):
    """Photo utilisée pour le rendu de nuit : la finition noire a les découpes les plus nettes."""
    return "noir" if a_photo(slug, "noir") else ("gris" if a_photo(slug, "gris") else finitions_photo(slug)[0])


def emplacement(p, fin, sizes, eager=False, cotes=False, alt=None, eager_nuit=False):
    """Plaque (photo) + emplacement « photo à venir » + cotes facultatives."""
    ok = a_photo(p["slug"], fin)
    fin_img = fin if ok else fin_defaut(p["slug"])
    sil = silhouette(p["slug"])
    nuit = img_plaque(p, sil, sizes, eager_nuit, "Plaque {} rétroéclairée, simulation".format(p["nom"]), classe="plaque__nuit sil-" + sil)
    plaque = '<div class="plaque fin-{}"{}>{}{}</div>'.format(fin_img, "" if ok else " hidden", img_plaque(p, fin_img, sizes, eager, alt, classe="plaque__jour"), nuit)
    texte = "{} en finition {} : photo à venir".format(p["nom"], ACC_FIN[fin])
    vide = ('<div class="plaque plaque--vide" role="img" aria-label="Photo de la plaque {} en finition {} à venir"{}>'
            '<span data-texte-vide>{}</span>{}</div>').format(e(p["nom"]), ACC_FIN[fin], "" if not ok else " hidden", e(texte), marq("photo à fournir"))
    c = ""
    if cotes:
        c = '<span class="cote cote--h" aria-hidden="true"><span data-cote-l>30 cm</span></span><span class="cote cote--v" aria-hidden="true"><span data-cote-h>60 cm</span></span>'
    return '<div class="emplacement plaque-cotee">{}{}{}</div>'.format(plaque, vide, c)


# ---------- Typographie française dans les nœuds texte ----------

NB = " "


def typo(t):
    t = re.sub(r" ([:;!?»])", NB + r"\1", t)
    t = t.replace("« ", "«" + NB)
    t = re.sub(r"(\d) × (\d)", r"\1" + NB + "×" + NB + r"\2", t)
    t = re.sub(r"(\d) (€|cm|mm|m|km|%|px|Mo|Ko|Md€)(?![\w])", r"\1" + NB + r"\2", t)
    t = re.sub(r"(\d) (\d{3})(?!\d)", r"\1" + NB + r"\2", t)
    t = re.sub(r"(\d) (\d{3})(?!\d)", r"\1" + NB + r"\2", t)
    t = re.sub(r"\b(n°|N°|art\.|p\.) (\d)", r"\1" + NB + r"\2", t)
    return t


def typographie(doc):
    morceaux = re.split(r"(<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)", doc, flags=re.S)
    sortie = []
    for m in morceaux:
        if not m:
            continue
        if m.startswith("<"):
            if m.startswith("<script") or m.startswith("<style"):
                sortie.append(m)
            else:
                sortie.append(re.sub(r'((?:alt|title|aria-label|placeholder|content)=")([^"]*)(")',
                                     lambda x: x.group(1) + typo(x.group(2)) + x.group(3), m))
        else:
            sortie.append(typo(m))
    return "".join(sortie)


# ---------- Gabarit ----------

POLICES = ("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500"
           "&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Unbounded:wght@400;500;600&amp;display=swap")

NAV = [("collection.html", "La galerie", ""), ("essayer.html", "Essayer chez moi", "nav__essai"),
       ("produit-led.html", "Kit LED", ""), ("sur-mesure.html", "Sur mesure", ""), ("contact.html", "Contact", "")]

LOGO = ('<svg viewBox="0 0 22 40" aria-hidden="true" focusable="false">'
        '<rect x="1" y="1" width="20" height="38" fill="none" stroke="currentColor" stroke-width="1.6"/>'
        '<path d="M3.6 34 8.6 23.5l2.4 3.2 3-8.2 4.6 15.5Z" fill="currentColor"/>'
        '<rect x="13.5" y="13" width="1.1" height="5.6" fill="currentColor"/>'
        '<circle class="marque__etoile" cx="6.6" cy="8.4" r="1.5"/></svg>')

ICONE_PANIER = ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z'
                'M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>')
ICONE_PRIVE = ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6Z" '
               'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" '
               'stroke="currentColor" stroke-width="1.6"/></svg>')
FLECHE_G = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
FLECHE_D = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
FLECHE_H = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 10 5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
FLECHE_B = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'

HORIZON = """<svg class="horizon" viewBox="0 0 1440 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<path class="loin" d="M0 120V78l70-10 60 8 80-22 70 12 90-30 60 14 80-26 70 18 60-8 90 22 70-20 90 16 80-12 70 20 90-14 60 10 80-6 70 12 60-4v70Z"/>
<path class="pres" d="M0 120V96l60-6 70 6 90-14 60 6 80-18 70 8 70-22 60 10 70-16 60 4 64-28 34-14h12l6-6h16l6 6h10l30 18 46 22 64 8 70 18 80-4 70 10 80-8 90 12 60-2v54Z"/>
<rect class="pres" x="1001" y="22" width="3" height="40"/>
<circle class="pres" cx="985" cy="54" r="7"/>
<circle class="vigie" cx="1002.5" cy="20" r="1.8"/>
</svg>"""


def script_led():
    m = {c: [h, rgb(h)] for c, _, h in COULEURS}
    return ('<script>(function(){try{var c=localStorage.getItem("tg3-led"),m=' + json.dumps(m) +
            ';if(m[c]){var r=document.documentElement;r.style.setProperty("--led",m[c][0]);'
            'r.style.setProperty("--led-rgb",m[c][1]);r.setAttribute("data-led",c);}}catch(e){}})();</script>')


def nuancier(classe=""):
    boutons = "".join('<button type="button" data-couleur-led="{0}" style="--c:{2}" aria-pressed="false" aria-label="{1}" title="{1}"></button>'
                      .format(c, n, h) for c, n, h in COULEURS)
    return '<div class="nuancier {}" role="group" aria-label="Couleur du rétroéclairage">{}</div>'.format(classe, boutons)


BOUTON_RETRACTATION = ('<button type="button" class="lien-bouton" data-retractation>Renoncer au contrat ici</button> '
                       + '<span class="marqueur">fonction à brancher, à confirmer</span>')


def note_donnees(finalite):
    """Information RGPD sous chaque formulaire (durée de conservation inconnue)."""
    return ('<p class="attenue petit note-donnees">Responsable : Romain Fourneaux. Vos données servent uniquement à ' + finalite +
            ' et sont conservées pendant une durée ' + marq("à fournir") + '. Vos droits : voir la politique de confidentialité ' + marq("à rédiger") + '.</p>')


def pied():
    return """<footer class="pied">
  <div class="cadre">
    <div class="pied__grille">
      <div>
        <a class="marque" href="index.html">""" + LOGO + """<span class="marque__nom">TERRE GRAVÉE<small>Graver l’âme des territoires</small></span></a>
        <address>Atelier Terre Gravée<br>16 rue du Pic du Midi<br>65200 Gerde</address>
        <p style="margin-top:8px"><a href="contact.html">contact@terregravee.fr</a></p>
      </div>
      <div>
        <h2>Le showroom</h2>
        <ul>
          <li><a href="collection.html">La galerie des 12 plaques</a></li>
          <li><a href="essayer.html">Essayer chez moi</a></li>
          <li><a href="produit-led.html">Kit LED</a></li>
          <li><a href="produit-carte-cadeau.html">Carte cadeau</a></li>
          <li><a href="sur-mesure.html">Sur mesure</a></li>
        </ul>
      </div>
      <div>
        <h2>Aide</h2>
        <ul>
          <li><a href="contact.html">Contact et questions</a></li>
          <li><a href="contact.html#livraison">Livraison et retours</a></li>
          <li>""" + BOUTON_RETRACTATION + """</li>
          <li><a href="strategie.html">Stratégie de cette maquette</a></li>
        </ul>
      </div>
      <div>
        <h2>Informations légales</h2>
        <ul>
          <li><a href=\"""" + SITE + """/cgv/">Conditions générales de vente</a></li>
          <li><a href=\"""" + SITE + """/politique/">Mentions légales</a> """ + marq("page à mettre à jour") + """</li>
          <li>Politique de confidentialité """ + marq("à rédiger") + """</li>
          <li>Médiateur de la consommation : """ + marq("à fournir") + """</li>
          <li>Téléphone : """ + marq("à fournir") + """</li>
          <li>Hébergeur du site : """ + marq("à fournir") + """</li>
        </ul>
      </div>
      <div>
        <h2>Suivre l’atelier</h2>
        <ul>
          <li>Instagram """ + marq("lien à fournir") + """</li>
          <li>Facebook """ + marq("lien à fournir") + """</li>
          <li><a href="index.html#lettre">Lettre « prochaines plaques »</a></li>
        </ul>
      </div>
    </div>
    <div class="pied__bas">
      <span>© 2026 Terre Gravée · Micro-entreprise · Responsable : Romain Fourneaux · SIRET 941 234 270 00010</span>
      <span>Prix TTC, TVA non applicable (art. 293 B du CGI)</span>
    </div>
  </div>
</footer>"""


def page(fichier, titre, description, contenu, actif=None, jsonld=None, scripts_sup="", classe_body=""):
    liens = []
    for href, nom, cls in NAV:
        cur = ' aria-current="page"' if href == actif else ""
        c = ' class="{}"'.format(cls) if cls else ""
        liens.append('<a href="{}"{}{}>{}</a>'.format(href, c, cur, nom))
    donnees = ""
    if jsonld:
        donnees = '<script type="application/ld+json">' + json.dumps(jsonld, ensure_ascii=False) + "</script>\n"
    doc = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>""" + e(titre) + """</title>
<meta name="description" content=\"""" + e(description) + """\">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#060a14">
""" + script_led() + """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href=\"""" + POLICES + """\">
<link rel="stylesheet" href="assets/showroom.css">
""" + donnees + """</head>
<body""" + (' class="{}"'.format(classe_body) if classe_body else "") + """>
<a class="lien-evitement" href="#contenu">Aller au contenu</a>
<div class="bandeau-maquette"><div class="cadre"><p>Maquette version 3 · brouillon non publié · paiements désactivés</p><nav aria-label="Maquette"><a href="strategie.html">La stratégie</a><a href="../index.html">Comparer les versions</a></nav></div></div>
<header class="entete">
  <div class="cadre">
    <a class="marque" href="index.html" aria-label="Terre Gravée, accueil">""" + LOGO + """<span class="marque__nom" aria-hidden="true">TERRE GRAVÉE<small>Graver l’âme des territoires</small></span></a>
    <nav class="nav" id="nav-principale" aria-label="Navigation principale">""" + "".join(liens) + """</nav>
    <div class="entete__actions">
      <button type="button" class="bouton-icone bouton-panier" data-ouvrir-panier>""" + ICONE_PANIER + """<span class="bouton-panier__texte" aria-hidden="true">Panier</span><span class="vh">Ouvrir le panier, articles :</span><span class="compteur">0</span></button>
      <button type="button" class="bouton-icone bouton-menu" aria-expanded="false" aria-controls="nav-principale"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.6" fill="none"/></svg><span class="vh">Menu</span></button>
    </div>
  </div>
</header>
<main id="contenu">
""" + contenu + """
</main>
""" + pied() + """
<dialog class="panier" id="panier" aria-labelledby="titre-panier">
  <div class="panier__haut"><h2 id="titre-panier" tabindex="-1">Panier</h2><button type="button" class="bouton-icone" data-fermer-panier>Fermer</button></div>
  <div class="panier__liste"></div>
  <div class="panier__bas">
    <div class="panier__total"><span>Sous-total TTC</span><strong>0 €</strong></div>
    <p>Frais de port selon le poids et la destination, affichés avant validation """ + marq("montant à fournir") + """</p>
    <button type="button" class="btn btn--led btn--plein" disabled aria-describedby="panier-explication">Commander</button>
    <p id="panier-explication">Maquette : la commande est désactivée et aucun paiement n’est possible. En ligne : carte bancaire (Stripe), PayPal (y compris en 4 fois sans frais), Apple Pay, Google Pay. """ + marq("mention légale PayPal 4X à fournir") + """</p>
    <p>Après une commande, vous pourrez vous rétracter pendant 14 jours : """ + BOUTON_RETRACTATION + """</p>
  </div>
</dialog>
<div class="toast" role="status" aria-live="polite"><span class="toast__texte"></span><button type="button">Voir le panier</button></div>
<p id="annonce" class="vh" aria-live="polite"></p>
<script src="assets/catalogue.js"></script>
<script src="assets/showroom.js"></script>
""" + scripts_sup + """</body>
</html>
"""
    doc = typographie(doc)
    with open(os.path.join(ICI, fichier), "w", encoding="utf-8") as f:
        f.write(doc)
    PAGES.append(fichier)


PAGES = []


# ---------- Composants ----------

def options_modeles(selection):
    groupes = []
    for c, n, _ in COLLECTIONS[:3]:
        opts = "".join('<option value="{}"{}>{}</option>'.format(p["slug"], " selected" if p["slug"] == selection else "", e(p["nom"]))
                       for p in PLAQUES if p["collection"] == c)
        groupes.append('<optgroup label="{}">{}</optgroup>'.format(n, opts))
    return "".join(groupes)


def radios_finition(nom, slug, choisie, attr="", marqueur_manque=True):
    out = []
    for f, n, a in FINITIONS:
        manque = not a_photo(slug, f)
        m = (" " + marq("photo à venir").replace('class="marqueur"', 'class="marqueur"' + ("" if manque else " hidden"))) if marqueur_manque else ""
        out.append('<label><input type="radio" name="{}" value="{}"{}{}><span class="echantillon fin-{}" aria-hidden="true"></span>{}{}</label>'
                   .format(nom, f, " checked" if f == choisie else "", attr, f, n, m))
    return "".join(out)


def pastilles(p, fin):
    out = []
    for f, n, a in FINITIONS:
        manque = not a_photo(p["slug"], f)
        lbl = "{} {}{}".format(p["nom"], a if False else n.lower(), ", photo à venir" if manque else "")
        out.append('<button type="button" class="pastille{}" data-fin="{}" aria-pressed="{}" aria-label="Afficher en finition {}{}"><span class="echantillon fin-{}"></span></button>'
                   .format(" pastille--manque" if manque else "", f, "true" if f == fin else "false", a, " (photo à venir)" if manque else "", f))
    return '<div class="pastilles" role="group" aria-label="Finition affichée pour {}">{}</div>'.format(e(p["nom"]), "".join(out))


def carte(p, fin=None, niveau="h3", vt=True, sizes="(max-width: 760px) 16vw, 110px", eager=False):
    url = "produit-{}.html".format(p["slug"])
    vtn = ' style="view-transition-name: vt-{}"'.format(p["slug"]) if vt else ""
    if p["collection"] == "accessoires":
        if p["slug"] == "led":
            visuel = ('<div class="scene scene--photo scene--led">' + img_reduite("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED, photo réelle", sizes="(max-width: 760px) 46vw, 300px") +
                      '<span class="niche__photo-tag">Photo réelle</span></div>')
            cart = "Ruban RGB, télécommande, alimentation USB"
            note = "Monté au dos par l’atelier si commandé avec la plaque"
        else:
            visuel = ('<div class="scene scene--photo">' + img_reduite("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée", sizes="(max-width: 760px) 46vw, 300px") + "</div>")
            cart = "Vaut une plaque au choix"
            note = "Envoi immédiat par e-mail ou à imprimer"
        return """<li class="carte apparait" data-collection="accessoires" data-slug="{slug}">
  <a class="niche" href="{url}" tabindex="-1" aria-hidden="true"{vtn}>{visuel}</a>
  <div class="carte__corps">
    <p class="cartel">{cart}</p>
    <{n} class="carte__nom"><a href="{url}">{nom}</a></{n}>
    <div class="carte__ligne"><span class="carte__prix">{prix}</span><span class="carte__note">{note}</span></div>
  </div>
</li>""".format(slug=p["slug"], url=url, vtn=vtn, visuel=visuel, cart=cart, n=niveau, nom=e(p["nom"]), prix=euros(p["prix"]), note=note)
    fin = fin if fin else fin_defaut(p["slug"])
    nb = len(p["avis"])
    note = ""
    if nb:
        moy = sum(a["note"] for a in p["avis"]) / nb
        note = ('<a class="carte__note" href="{}#avis"><span class="etoiles" aria-hidden="true">★</span> {} · {} {}</a>'
                .format(url, note_fr(moy), nb, pluriel(nb, "avis non vérifié", "avis non vérifiés")))
    return """<li class="carte apparait" data-collection="{coll}" data-slug="{slug}">
  <a class="niche" href="{url}#{slug}-{fin}" data-lien-fiche tabindex="-1" aria-hidden="true"{vtn}><div class="scene">{emp}</div></a>
  <div class="carte__corps">
    <p class="cartel">{cartel}</p>
    <{n} class="carte__nom"><a href="{url}#{slug}-{fin}" data-lien-fiche>{nom}</a></{n}>
    <div class="carte__ligne"><span class="carte__prix">{prix}</span>{pastilles}</div>
    <div class="carte__liens"><a href="essayer.html#{slug}-{fin}" data-lien-essai>Essayer chez moi</a>{note}</div>
  </div>
</li>""".format(coll=p["collection"], slug=p["slug"], url=url, fin=fin, vtn=vtn, emp=emplacement(p, fin, sizes, eager=eager),
                cartel=cartel(p), n=niveau, nom=e(p["nom"]), prix=euros(p["prix"]), pastilles=pastilles(p, fin), note=note)


def citation(a, lien=True):
    p = PRODUITS[a["produit"]]
    prod = '<a href="produit-{}.html">{}</a>'.format(p["slug"], e(p["nom"])) if lien else ""
    cls = " avis--mitige" if a["note"] < 5 else ""
    return """<li><figure class="avis{cls}">
  <span class="etoiles" role="img" aria-label="Note : {note} sur 5">{et}</span>
  <blockquote>« {texte} »</blockquote>
  <figcaption><span class="avis__auteur">{auteur}</span><span>publié le {date}</span><span>expérience : {exp}</span>{prod}</figcaption>
</figure></li>""".format(cls=cls, note=a["note"], et=etoiles(a["note"]), texte=e(a["texte"]), auteur=e(a["auteur"]), date=date_fr(a["date"]),
                         exp=marq("date à fournir"), prod=prod)


def resume_avis(avis, titre=True):
    nb = len(avis)
    moy = sum(a["note"] for a in avis) / nb
    lignes = []
    for n in (5, 4, 3, 2, 1):
        k = sum(1 for a in avis if a["note"] == n)
        lignes.append('<li><span>{} étoile{}</span><span class="barre" aria-hidden="true"><span style="width:{:.0f}%"></span></span><span>{}</span></li>'
                      .format(n, "s" if n > 1 else "", 100.0 * k / nb, k))
    return """<div class="avis-resume">
  <p class="avis-resume__note">{moy}<small> / 5</small></p>
  <p><span class="etoiles" aria-hidden="true">{et}</span></p>
  <p class="attenue petit">{nb} {libelle} sur le site</p>
  <ul class="repartition" aria-label="Répartition des notes">{lignes}</ul>
</div>""".format(moy=note_fr(moy), et=etoiles(moy), nb=nb, libelle=pluriel(nb, "avis publié", "avis publiés"), lignes="".join(lignes))


MENTION_AVIS = ("Les avis sont publiés sur le site sans vérification d’achat. Ils sont affichés du plus récent au plus ancien, "
                "sans tri par note. Un doute sur un avis ? Signalez-le à contact@terregravee.fr.")
GESTION_AVIS = ('<p class="mention-avis">Comment les avis sont gérés (contreparties, délais de publication et de conservation, motifs de refus) : '
                + marq("rubrique à fournir") + "</p>")


def schema_echelle(ident="titre-echelle"):
    """Plaque 60 × 30 cm sur un mur, à côté d'une porte et d'un meuble : échelle indicative."""
    return """<svg class="schema schema--echelle" viewBox="0 0 300 250" role="img" aria-labelledby=\"""" + ident + """\">
<title id=\"""" + ident + """\">Schéma à l’échelle : la plaque de 60 × 30 cm au-dessus d’un meuble de 120 cm, à côté d’une porte de 204 cm</title>
<line class="trait" x1="6" y1="232" x2="294" y2="232"/>
<rect class="trait" x="22" y="28" width="83" height="204"/>
<circle cx="96" cy="134" r="2" fill="currentColor"/>
<rect class="trait" x="150" y="157" width="120" height="64"/>
<line class="trait" x1="156" y1="221" x2="156" y2="232"/><line class="trait" x1="264" y1="221" x2="264" y2="232"/>
<rect class="plaque-s" x="195" y="67" width="30" height="60"/>
<line class="trait led-trait" x1="235" y1="67" x2="235" y2="127"/><text x="240" y="100">60 cm</text>
<line class="trait led-trait" x1="195" y1="60" x2="225" y2="60"/><text x="196" y="54">30 cm</text>
<line class="trait" x1="12" y1="28" x2="12" y2="232"/><text x="14" y="20">porte 204 cm</text>
<text x="168" y="245">meuble 120 cm</text>
</svg>"""


def schema_sur_mesure():
    return """<svg class="schema schema--sm" viewBox="0 0 380 250" role="img" aria-labelledby="titre-sm-schema">
<title id="titre-sm-schema">Comparaison d’échelle : une personne de 175 cm, une plaque de 60 × 30 cm et un grand format de 200 × 100 cm</title>
<line class="trait" x1="4" y1="232" x2="376" y2="232"/>
<circle class="silhouette" cx="38" cy="69" r="11"/>
<rect class="silhouette" x="25" y="82" width="26" height="72" rx="6"/>
<rect class="silhouette" x="18" y="86" width="7" height="60" rx="3"/><rect class="silhouette" x="51" y="86" width="7" height="60" rx="3"/>
<rect class="silhouette" x="27" y="150" width="10" height="82" rx="3"/><rect class="silhouette" x="39" y="150" width="10" height="82" rx="3"/>
<line class="trait" x1="10" y1="57" x2="10" y2="232"/><text x="2" y="50">175 cm</text>
<rect class="plaque-s" x="82" y="52" width="30" height="60"/>
<text x="74" y="128">60 × 30</text>
<rect class="grand-s" x="160" y="32" width="200" height="100"/>
<line class="trait" x1="160" y1="144" x2="360" y2="144"/><text x="232" y="160">200 cm</text>
<line class="trait" x1="368" y1="32" x2="368" y2="132"/><text x="300" y="24">100 cm</text>
</svg>"""


# ---------- Accueil ----------

def accueil():
    pic = PRODUITS["le-pic-du-midi"]
    radios = radios_finition("finition-vitrine", "le-pic-du-midi", "noir", ' data-fin-vitrine', marqueur_manque=False)
    best = [("le-pic-du-midi", "noir"), ("lisard", "dore"), ("lours", "noir"), ("le-cerf", "gris")]
    cartes = "".join(carte(PRODUITS[s], f) for s, f in best)
    avis = "".join(citation(a) for a in TOUS_AVIS)
    contenu = """
<section class="heros ciel" aria-labelledby="titre-accueil">
  <div class="cadre heros__grille">
    <div class="heros__texte">
      <p class="surtitre">Showroom en ligne · Bigorre, Hautes-Pyrénées</p>
      <h1 id="titre-accueil"><span class="h1-ligne"><span class="insec">Essayez-la</span> chez vous.</span> <em class="h1-ligne"><span class="insec">Allumez-la</span> le soir.</em></h1>
      <p class="chapo">Douze plaques en aluminium découpé au laser, d’après les sommets, les monuments et la faune de Bigorre. Choisissez la finition, testez le rétroéclairage, posez la plaque sur une photo de votre mur avant de commander.</p>
      <div class="actions">
        <a class="btn btn--led" href="essayer.html">Essayer sur mon mur</a>
        <a class="btn btn--ligne" href="collection.html">Voir les 12 plaques</a>
      </div>
      <p class="preuve mono">65 € la plaque · kit LED +15 € · fabriquée entre Revel (31) et Bagnères-de-Bigorre (65) · <a href="#titre-avis">""" + note_fr(MOYENNE) + """ sur 5 · """ + str(NB_AVIS) + """ avis publiés sans vérification d’achat</a></p>
    </div>
    <div class="vitrine" data-vitrine data-allumage data-slug="le-pic-du-midi" data-fin="noir">
      <div class="scene">
        """ + emplacement(pic, "noir", "(max-width: 980px) 30vw, 150px", eager="high", cotes=True, eager_nuit=True) + """
        <p class="etiquette-sim">Simulation · rendu indicatif</p>
      </div>
      <div class="vitrine__commandes">
        <div class="vitrine__ligne">
          <div class="selecteur-modele">
            <button type="button" class="fleche" data-modele-pas="-1" aria-label="Modèle précédent">""" + FLECHE_G + """</button>
            <label class="vh" for="vitrine-modele">Modèle exposé</label>
            <select id="vitrine-modele" data-modele>""" + options_modeles("le-pic-du-midi") + """</select>
            <button type="button" class="fleche" data-modele-pas="1" aria-label="Modèle suivant">""" + FLECHE_D + """</button>
          </div>
        </div>
        <fieldset class="vitrine__ligne"><legend class="vh">Finition</legend><div class="choix-finition">""" + radios + """</div></fieldset>
        <div class="vitrine__ligne">
          <button type="button" class="interrupteur" data-interrupteur aria-pressed="false"><span class="interrupteur__piste" aria-hidden="true"></span>Rétroéclairage <span class="interrupteur__prix">kit LED +15 €</span></button>
          """ + nuancier("nuancier--petit") + """
        </div>
        <div class="vitrine__resume">
          <output data-resume aria-live="polite">Le Pic du Midi, finition noire : 65 €</output>
          <span class="actions"><a class="lien-fleche" data-lien-fiche href="produit-le-pic-du-midi.html#le-pic-du-midi-noir">Voir la fiche</a><a class="lien-fleche" data-lien-essai href="essayer.html#le-pic-du-midi-noir">Sur mon mur</a></span>
        </div>
      </div>
    </div>
  </div>
  """ + HORIZON + """
</section>

<section aria-label="La plaque en bref">
  <div class="cadre">
    <ul class="cartouche">
      <li><span>Format</span><strong>60 × 30 cm</strong><p>Épaisseur 2 mm, usage intérieur et extérieur</p></li>
      <li><span>Matière</span><strong>Aluminium</strong><p>Découpé au laser, puis thermolaqué</p></li>
      <li><span>Finitions</span><strong>Noir, gris, doré</strong><p>Même prix pour les trois</p></li>
      <li><span>Prix TTC</span><strong>65 €</strong><p>Quel que soit le modèle</p></li>
      <li><span>Édition</span><strong>Série limitée</strong><p>Numéro gravé au dos de chaque plaque</p></li>
      <li><span>Pose</span><strong>Sans perçage</strong><p>2 fixations adhésives 3M Command™ fournies</p></li>
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="titre-galerie">
  <div class="cadre">
    <div class="section__tete">
      <div>
        <p class="surtitre">La galerie de nuit</p>
        <h2 id="titre-galerie">Quatre plaques de la collection</h2>
        <p class="chapo">Le Pic du Midi et trois animaux des Pyrénées, exposés sur un mur clair. Éteignez la salle pour voir le rendu avec le kit LED.</p>
      </div>
      <div class="section__outils">
        <div class="barre-salle">
          <button type="button" class="interrupteur" data-bascule-nuit="#galerie-accueil" aria-pressed="false" data-texte-jour="Éteindre la salle" data-texte-nuit="Rallumer la salle"><span class="interrupteur__piste" aria-hidden="true"></span><span data-libelle-bascule>Éteindre la salle</span></button>
          """ + nuancier("nuancier--petit") + """
        </div>
        <a class="lien-fleche" href="collection.html">Les 12 plaques et les accessoires</a>
      </div>
    </div>
    <ul class="grille-niches" id="galerie-accueil">""" + cartes + """</ul>
  </div>
</section>

<section class="section section--sombre section--bord" aria-labelledby="titre-essai">
  <div class="cadre essai-teaser">
    <div class="maquette-essai apparait" aria-hidden="true">
      <div class="mur mur--brique"></div>
      <div class="plinthe"></div>
      <div class="meuble"><div class="meuble__corps"></div><span class="meuble__pied meuble__pied--g"></span><span class="meuble__pied meuble__pied--d"></span><span class="meuble__vase"></span><span class="meuble__livres"></span></div>
      <div class="plaque-pose">""" + emplacement(PRODUITS["lisard"], "noir", "(max-width: 980px) 16vw, 110px", cotes=True) + """</div>
      <p class="etiquette-sim">Simulation</p>
    </div>
    <div class="essai-teaser__texte">
      <p class="surtitre">Essayer chez moi</p>
      <h2 id="titre-essai">Votre mur, la bonne taille, avant d’acheter</h2>
      <ol class="etapes">
        <li><div><h3>Choisissez un mur</h3><p>Plâtre, béton, brique ou bois, avec la teinte de votre choix. Ou importez une photo de votre mur.</p></div></li>
        <li><div><h3>Placez la plaque à l’échelle</h3><p>Glissez-la au doigt ou à la souris. Calez le repère sur une porte ou une prise : la plaque s’affiche en 60 × 30 cm.</p></div></li>
        <li><div><h3>Allumez, partagez</h3><p>Passez en aperçu de nuit pour voir le rétroéclairage, puis envoyez le lien à un proche ou enregistrez l’image.</p></div></li>
      </ol>
      <p class="note-privee">""" + ICONE_PRIVE + """<span>Votre photo reste sur votre appareil. Rien n’est envoyé, rien n’est conservé.</span></p>
      <div class="actions"><a class="btn btn--led" href="essayer.html">Ouvrir le visualiseur</a></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="titre-led">
  <div class="cadre led-grille">
    <div class="photos-reelles">
      <figure class="photo-reelle">""" + img_reduite("led/led-img1.webp", "Plaque Le Pic du Midi rétroéclairée en vert, photo réelle", "(max-width: 980px) 46vw, 300px") + """<span class="tag">Photo réelle</span><figcaption>Le Pic du Midi, lumière verte</figcaption></figure>
      <figure class="photo-reelle">""" + img_reduite("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu, photo réelle", "(max-width: 980px) 46vw, 300px") + """<span class="tag">Photo réelle</span><figcaption>L’Ours, lumière bleue</figcaption></figure>
    </div>
    <div>
      <p class="surtitre">Option rétroéclairage</p>
      <h2 id="titre-led" style="margin:12px 0 16px">Le soir, la découpe s’allume</h2>
      <p class="chapo">Un ruban LED se colle au dos de la plaque. La lumière éclaire le mur et passe par la découpe.</p>
      <div class="prix-led"><strong>+15 €</strong><span class="attenue">monté par l’atelier avant l’envoi, si vous le commandez avec la plaque</span></div>
      <ul class="liste-kit" aria-label="Contenu du kit LED">
        <li><span>Ruban</span><span>LED RGB autocollant, raccord Pico. Longueur 2 m ou 1,5 m """ + marq("à confirmer") + """</span></li>
        <li><span>Commandes</span><span>Contrôleur intégré, télécommande infrarouge, application smartphone (QR code dans le pack)</span></li>
        <li><span>Réglages</span><span>Couleur, intensité, minuteur, effets</span></li>
        <li><span>Alimentation</span><span>USB, adaptateur secteur non fourni</span></li>
        <li><span>Origine</span><span>Non fabriqué en France, choisi pour sa compatibilité. Les plaques acceptent la plupart des rubans du marché.</span></li>
      </ul>
      <p style="margin-top:24px"><a class="lien-fleche" href="produit-led.html">Tout savoir sur le kit LED</a></p>
    </div>
  </div>
</section>

<section class="section section--sombre section--bord" aria-labelledby="titre-fab">
  <div class="cadre">
    <div class="section__tete">
      <div>
        <p class="surtitre">Fabrication</p>
        <h2 id="titre-fab">De Revel à Bagnères-de-Bigorre</h2>
        <p class="chapo">La marque l’écrit ainsi : « Toutes nos plaques sont réalisées dans un rayon de 150 km. » """ + marq("centre du rayon à confirmer") + """ Du dessin à l’expédition, voici le trajet d’une plaque.</p>
      </div>
    </div>
    <ol class="route">
      <li><span class="lieu">Dessin</span><h3>Illustrations originales</h3><p>Dessinées par Maude Villatte et Lola Jacquet.</p></li>
      <li><span class="lieu">Revel (31)</span><h3>Découpe laser</h3><p>L’aluminium de 2 mm est découpé, titre en lettrage pochoir compris.</p></li>
      <li><span class="lieu">Bagnères-de-Bigorre (65)</span><h3>Thermolaquage</h3><p>Finition noire, grise ou dorée, mate ou satinée.</p></li>
      <li><span class="lieu">Bagnères-de-Bigorre (65)</span><h3>Assemblage et envoi</h3><p>Contrôle qualité, numéro au dos, expédition.</p></li>
    </ol>
    <div class="duo-photo">
      <figure>""" + img("misc/aquensis.webp", "Plaques Terre Gravée exposées au-dessus des bassins d’Aquensis, à Bagnères-de-Bigorre", "(max-width: 900px) 92vw, 760px") + """<figcaption>Plaques Terre Gravée à Aquensis, Bagnères-de-Bigorre</figcaption></figure>
      <div class="encart">
        <p class="surtitre">Série limitée</p>
        <h3>Chaque plaque porte son numéro</h3>
        <p class="attenue">Les modèles sont édités en série limitée. Le numéro est gravé au dos de chaque plaque.</p>
        <p class="numero-grave" aria-hidden="true">N° ___ · gravé au dos</p>
        <p class="attenue petit">Aucun compte à rebours ni stock affiché : la rareté annoncée est celle de la série, rien d’autre.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="titre-avis">
  <div class="cadre">
    <div class="avis-tete">
      <div style="display:grid;gap:12px">
        <p class="surtitre">Avis</p>
        <h2 id="titre-avis">Les 9 avis publiés, du plus récent au plus ancien</h2>
        <p class="mention-avis">""" + MENTION_AVIS + """</p>
        """ + GESTION_AVIS + """
      </div>
      """ + resume_avis(TOUS_AVIS) + """
    </div>
    <ul class="grille-avis grille-avis--trois" id="liste-avis" data-avis-repliables>""" + avis + """</ul>
    <p class="deplier-avis"><button type="button" class="btn btn--ligne btn--petit" data-deplier-avis aria-controls="liste-avis" aria-expanded="false" hidden>Voir les 6 autres avis</button></p>
  </div>
</section>

<section class="section section--sombre section--bord" aria-labelledby="titre-sm">
  <div class="cadre passerelle-grille">
    <div style="display:grid;gap:16px">
      <p class="surtitre">Sur mesure</p>
      <h2 id="titre-sm">Votre lieu n’existe pas encore dans la collection ?</h2>
      <p class="chapo">L’atelier adapte un modèle existant dès une plaque, selon faisabilité : format jusqu’à 2 × 1 m, aluminium dans la teinte RAL choisie, acier Corten ou aluminium brut. Il réalise aussi des séries pour les professionnels, les collectivités et les lieux culturels.</p>
      <div class="actions"><a class="btn btn--ligne" href="sur-mesure.html">Voir le sur-mesure</a></div>
    </div>
    <figure>""" + schema_sur_mesure() + """<figcaption class="legende-schema">Comparaison d’échelle indicative</figcaption></figure>
  </div>
</section>

<section class="section" aria-labelledby="titre-noel">
  <div class="cadre">
    <div class="section__tete"><div><p class="surtitre">Cadeaux</p><h2 id="titre-noel">Pour Noël, deux façons d’offrir</h2></div></div>
    <div class="deux-blocs">
      <div class="bloc-offre">
        """ + img_plaque(PRODUITS["le-tourmalet"], "gris", "120px", alt="Plaque Le Tourmalet, finition grise") + """
        <div>
          <h3>Une plaque choisie pour quelqu’un</h3>
          <p class="attenue">Sur chaque fiche, cochez « C’est un cadeau » pour ajouter un message et masquer le prix sur le bon de livraison. """ + marq("proposition à valider") + """</p>
          <p class="date-limite">Commande conseillée avant le jeudi 17 décembre 2026 """ + marq("proposition à valider") + """</p>
          <p class="attenue petit">Date à confirmer selon le délai de l’atelier et celui du transporteur.</p>
        </div>
      </div>
      <div class="bloc-offre">
        """ + img_reduite("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée", "(max-width: 480px) 72px, 120px") + """
        <div>
          <h3>La carte cadeau, 65 €</h3>
          <p class="attenue">Elle vaut une plaque au choix, sur tous les modèles disponibles. Envoi immédiat par e-mail ou à imprimer : elle reste possible au dernier moment.</p>
          <p><a class="lien-fleche" href="produit-carte-cadeau.html">Offrir la carte cadeau</a></p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--sombre section--bord" id="lettre" aria-labelledby="titre-lettre">
  <div class="cadre lettre">
    <div style="display:grid;gap:14px">
      <p class="surtitre">Lettre « prochaines plaques »</p>
      <h2 id="titre-lettre">Être prévenu des nouveaux dessins</h2>
      <p class="chapo">Des dessins inédits sortent de temps en temps, en très petite quantité, parfois en exemplaire unique. Un e-mail quand une plaque sort, rien d’autre.</p>
    </div>
    <form class="formulaire" data-demo novalidate>
      <div class="champ"><label for="email-lettre">Adresse e-mail</label><input id="email-lettre" type="email" autocomplete="email" placeholder="vous@exemple.fr" required data-erreur-vide="Indiquez votre adresse e-mail." data-erreur-format="Indiquez une adresse e-mail valide, par exemple vous@exemple.fr."></div>
      <div class="champ"><label class="case"><input type="checkbox" name="consentement" id="consentement-lettre" required data-erreur-vide="Cochez la case pour vous inscrire."><span>J’accepte de recevoir la lettre de Terre Gravée par e-mail. Désinscription en un clic dans chaque envoi.</span></label></div>
      <div><button class="btn btn--led" type="submit">M’inscrire</button></div>
      <p class="message-demo" tabindex="-1" hidden>Maquette : rien n’est envoyé, aucune adresse n’est enregistrée.</p>
      """ + note_donnees("l’envoi de cette lettre") + """
      <p class="attenue petit">Pas de mesure d’ouverture des e-mails sans votre accord.</p>
    </form>
  </div>
</section>"""
    org = {
        "@context": "https://schema.org", "@type": "Organization", "name": "Terre Gravée", "url": SITE,
        "email": "contact@terregravee.fr", "slogan": "Graver l’âme des territoires",
        "address": {"@type": "PostalAddress", "streetAddress": "16 rue du Pic du Midi", "postalCode": "65200",
                    "addressLocality": "Gerde", "addressCountry": "FR"},
    }
    page("index.html", "Terre Gravée · Showroom de nuit, plaques murales de Bigorre (maquette v3)",
         "Plaques murales en aluminium découpé au laser, inspirées de la Bigorre. Essayez-les sur votre mur, testez le rétroéclairage LED. 65 € la plaque.",
         contenu, jsonld=org)


# ---------- Galerie (collection) ----------

def collection():
    comptes = {c: sum(1 for p in CATALOGUE if p["collection"] == c) for c, _, _ in COLLECTIONS}
    puces = ['<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Tout <span>{}</span></button>'.format(len(CATALOGUE))]
    puces += ['<button type="button" class="puce" data-filtre="{}" aria-pressed="false">{} <span>{}</span></button>'.format(c, n, comptes[c]) for c, n, _ in COLLECTIONS]
    voir = "".join('<button type="button" class="puce" data-voir-en="{}" aria-pressed="false"><span class="echantillon fin-{}" aria-hidden="true" style="width:14px;height:14px"></span>{}</button>'.format(f, f, n) for f, n, _ in FINITIONS)
    cartes = "".join(carte(p, niveau="h2", eager=("high" if i == 0 else (i < 4))) for i, p in enumerate(PLAQUES))
    accessoires = "".join(carte(p, niveau="h3") for p in CATALOGUE if p["collection"] == "accessoires")
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <p class="surtitre">La galerie</p>
    <h1>Douze plaques, deux accessoires</h1>
    <p class="chapo">Chaque plaque mesure 60 × 30 cm et existe en noir, gris ou doré, au même prix de 65 €. Éteignez la salle pour voir le rendu avec le kit LED.</p>
  </header>
  <div class="barre-outils">
    <div class="groupe-outil"><span class="etiquette" id="etiquette-filtre">Thème</span><div class="puces" role="group" aria-labelledby="etiquette-filtre">""" + "".join(puces) + """</div></div>
    <div class="groupe-outil"><span class="etiquette" id="etiquette-voir">Voir en</span><div class="puces" role="group" aria-labelledby="etiquette-voir">""" + voir + """</div></div>
    <div class="barre-salle">
      <button type="button" class="interrupteur" data-bascule-nuit="#galerie" aria-pressed="false" data-texte-jour="Éteindre la salle" data-texte-nuit="Rallumer la salle"><span class="interrupteur__piste" aria-hidden="true"></span><span data-libelle-bascule>Éteindre la salle</span></button>
      """ + nuancier("nuancier--petit") + """
    </div>
  </div>
  <div class="infos-galerie">
    <p class="mono attenue" data-compte aria-live="polite">""" + str(len(CATALOGUE)) + """ objets affichés</p>
    <p class="attenue petit">Rendu de nuit : simulation indicative. Les pastilles jaunes signalent une finition vendue dont la photo est à venir.</p>
  </div>
  <div id="galerie" data-grille>
    <div data-groupe><ul class="grille-niches">""" + cartes + """</ul></div>
    <section class="groupe-accessoires" data-groupe aria-labelledby="titre-accessoires">
      <h2 id="titre-accessoires" class="titre-groupe">Accessoires</h2>
      <ul class="grille-accessoires">""" + accessoires + """</ul>
    </section>
  </div>
</div>
<section class="section">
  <div class="cadre">
    <ul class="cartouche">
      <li><span>Livraison</span><strong>2 à 4 jours</strong><p>Ouvrés, à titre indicatif. L’atelier prévient en cas de retard.</p></li>
      <li><span>Frais de port</span><strong>Selon le colis</strong><p>Poids et destination, affichés avant validation """ + marq("montant à fournir") + """</p></li>
      <li><span>Rétractation</span><strong>14 jours</strong><p>Droit légal après réception, frais de retour à votre charge</p></li>
      <li><span>Paiement</span><strong>CB, PayPal</strong><p>Stripe, PayPal en 4 fois sans frais, Apple Pay, Google Pay """ + marq("mention légale PayPal 4X à fournir") + """</p></li>
      <li><span>Fabrication</span><strong>Revel, Bagnères</strong><p>Découpe à Revel (31), thermolaquage et envoi à Bagnères-de-Bigorre (65)</p></li>
      <li><span>Sur mesure</span><strong>Jusqu’à 2 × 1 m</strong><p><a href="sur-mesure.html">Corten, alu brut, RAL</a></p></li>
    </ul>
  </div>
</section>"""
    page("collection.html", "La galerie des plaques · Terre Gravée (maquette v3)",
         "Les 12 plaques murales Terre Gravée en noir, gris ou doré, plus le kit LED et la carte cadeau. Filtrez par thème et voyez le rendu de nuit.",
         contenu, actif="collection.html")


# ---------- Fiches produit ----------

def rassurance(etat="Plaque dans son état d’origine"):
    return """<ul class="rassurance">
  <li><span>Livraison</span><span><strong>2 à 4 jours ouvrés</strong>, à titre indicatif. L’atelier vous prévient en cas de retard.</span></li>
  <li><span>Frais de port</span><span>Selon le poids et la destination, affichés avant validation. """ + marq("montant à fournir") + """</span></li>
  <li><span>Rétractation</span><span>Droit légal de <strong>14 jours</strong> après réception, sans justification. """ + etat + """, frais de retour à votre charge. Pièces personnalisées exclues.</span></li>
  <li><span>Garanties</span><span>Garanties légales de conformité et des vices cachés.</span></li>
  <li><span>Paiement</span><span>Carte bancaire (Stripe), PayPal y compris en 4 fois sans frais, Apple Pay, Google Pay. """ + marq("mention légale PayPal 4X à fournir") + """</span></li>
</ul>"""


def caracteristiques():
    return """<dl class="carac">
  <dt>Format</dt><dd>60 × 30 cm, épaisseur 2 mm</dd>
  <dt>Matière</dt><dd>Aluminium découpé au laser, thermolaqué, finition mate ou satinée</dd>
  <dt>Finitions</dt><dd>Noir, gris ou doré, même prix</dd>
  <dt>Titre</dt><dd>Découpé en lettrage pochoir, à ponts</dd>
  <dt>Pose</dt><dd>2 fixations adhésives 3M Command™ fournies, sans perçage. Le léger décalage avec le mur fait ressortir les ombres de la découpe.</dd>
  <dt>Usage</dt><dd>Intérieur et extérieur. Fixation adaptée à l’extérieur """ + marq("à confirmer") + """</dd>
  <dt>Édition</dt><dd>Série limitée, numéro gravé au dos</dd>
  <dt>Fabrication</dt><dd>Dessins de Maude Villatte et Lola Jacquet · découpe à Revel (31) · thermolaquage, assemblage et expédition à Bagnères-de-Bigorre (65)</dd>
</dl>"""


# Histoires réécrites : lieu, altitude ou statut, ce que montre la découpe (faits vérifiés et photos des plaques).
HISTOIRES = {
    "le-pic-du-midi": ("Le sommet sous les étoiles", [
        "Le Pic du Midi de Bigorre culmine à 2 877 m. La découpe montre son sommet et son mât sous un ciel piqué d’étoiles.",
        "Le titre « Pic du Midi de Bigorre » est découpé en lettrage pochoir, comme sur toutes les plaques."]),
    "le-tourmalet": ("La route du col", [
        "Le col du Tourmalet passe à 2 115 m. La plaque dessine la route en lacets, les cyclistes qui la montent, une cabane et les crêtes autour."]),
    "le-montaigu": ("Une pointe de 2 339 m", [
        "Le pic du Montaigu s’élève à 2 339 m. La découpe superpose sa pointe, ses arêtes et les pentes qui descendent vers la vallée."]),
    "le-cirque-de-gavarnie": ("Le cirque et sa cascade", [
        "Le cirque de Gavarnie est inscrit au patrimoine mondial de l’UNESCO. La plaque montre ses parois, la cascade, la forêt de sapins et le torrent au premier plan.",
        "Elle est découpée au laser dans l’aluminium, puis thermolaquée. Série limitée, numéro gravé au dos."]),
    "le-pont-despagne": ("L’arche entre les cascades", [
        "Le Pont d’Espagne se trouve à Cauterets, entre cascades et forêt. La découpe montre l’arche de pierre du pont, la végétation et les fougères."]),
    "la-tour-des-jacobins": ("La tour de Bagnères", [
        "La Tour des Jacobins, à Bagnères-de-Bigorre, est un monument historique. La plaque découpe sa silhouette, son clocher et les toits voisins."]),
    "le-chateau-de-mauvezin": ("Le château fort et ses tours", [
        "Le château de Mauvezin est un château fort des Hautes-Pyrénées. La découpe montre ses tours et ses murailles devant les sommets, avec des oiseaux en vol au premier plan."]),
    "labbaye-de-lescaladieu": ("L’abbaye cistercienne", [
        "L’abbaye de l’Escaladieu est une abbaye cistercienne de Bonnemazon. La plaque montre ses bâtiments et son clocher, avec des roses au premier plan."]),
    "lisard": ("L’isard sur les rochers", [
        "L’isard (Rupicapra pyrenaica) est le chamois des Pyrénées. La découpe le montre debout sur les rochers, entre les sapins, devant un sommet."]),
    "lours": ("L’ours brun, de face", [
        "L’ours brun (Ursus arctos). La plaque, titrée « L’Ours brun », le montre de face entre deux troncs, dans les feuillages."]),
    "le-cerf": ("La tête et les bois", [
        "Le cerf élaphe (Cervus elaphus). La découpe montre sa tête et ses bois, entourés de feuillages.",
        "Comme toutes les plaques, elle convient à l’intérieur comme à l’extérieur."]),
    "la-marmotte": ("La marmotte dressée", [
        "La marmotte (Marmota marmota). La plaque la montre dressée sur un rocher, entourée de feuilles et de fleurs."]),
}


def similaires(p):
    meme = [x for x in PLAQUES if x["collection"] == p["collection"] and x["slug"] != p["slug"]]
    autres = [x for x in PLAQUES if x["best"] and x not in meme and x["slug"] != p["slug"]]
    return (meme[:3] + autres)[:4]


def fiche_plaque(p):
    slug = p["slug"]
    fin0 = fin_defaut(slug)
    sizes_scene = "(max-width: 1000px) 30vw, 210px"
    vues = ['<div class="vue vue--sim" data-vue="sim">' + emplacement(p, fin0, sizes_scene, eager="high", cotes=True) + "</div>"]
    boutons = ['<button type="button" class="vue-bouton" data-vue="sim" aria-pressed="true"><span class="vue-bouton__img vue-bouton__img--nuit" aria-hidden="true"><span></span></span>Simulation</button>']
    # photo de la finition
    w, h = dims("p/{}-{}-440.webp".format(slug, fin0))
    vues.append('<div class="vue vue--photo" data-vue="photo" hidden><div class="emplacement-photo">'
                '<img src="{}p/{}-{}-880.webp" srcset="{}" sizes="(max-width: 1000px) 60vw, 330px" width="{}" height="{}" alt="Photo de la plaque {}, finition {}" loading="lazy" decoding="async">'
                '<p class="photo-vide plaque--vide" hidden style="width:200px">Photo de cette finition à venir {}</p></div>'
                '<span class="vue-legende">Photo de la plaque</span></div>'.format(IMG, slug, fin0, srcset_plaque(slug, fin0), w, h, e(p["nom"]), ACC_FIN[fin0], marq("photo à fournir")))
    boutons.append('<button type="button" class="vue-bouton" data-vue="photo" aria-pressed="false"><span class="vue-bouton__img">{}</span><span class="vue-bouton__texte">Photo, finition {}</span></button>'
                   .format(vignette("v/{}-{}-100.webp".format(slug, fin0), "p/{}-{}-440.webp".format(slug, fin0), 32, 64), ACC_FIN[fin0]))
    if p["decor"]:
        petit = p["decor"].replace("-1200", "-640")
        ss = "{0}{1} 640w, {0}{2} {3}w".format(IMG, petit, p["decor"], dims(p["decor"])[0]) if petit in TAILLES and petit != p["decor"] else None
        vues.append('<div class="vue vue--decor" data-vue="decor" hidden>' + img(p["decor"], "Mise en situation de la plaque " + p["nom"] + " (montage)", "(max-width: 1000px) 92vw, 640px", srcset=ss) +
                    '<span class="vue-legende">Mise en situation · montage, échelle indicative</span></div>')
        boutons.append('<button type="button" class="vue-bouton" data-vue="decor" aria-pressed="false"><span class="vue-bouton__img vue-bouton__img--cover">{}</span>En situation</button>'
                       .format(vignette("v/{}-decor-160.webp".format(slug), petit if petit in TAILLES else p["decor"], 72, 64)))
    if slug in LED_REELLE:
        rel, alt = LED_REELLE[slug]
        vues.append('<div class="vue vue--reel" data-vue="reel" hidden>' + img_reduite(rel, alt, "(max-width: 1000px) 92vw, 640px") + '<span class="vue-legende">Photo réelle, kit LED allumé</span></div>')
        boutons.append('<button type="button" class="vue-bouton" data-vue="reel" aria-pressed="false"><span class="vue-bouton__img vue-bouton__img--cover">{}</span>Photo allumée</button>'
                       .format(vignette("v/" + rel.split("/")[-1].replace(".webp", "-160.webp"), rel, 72, 64)))
    vues.append('<div class="vue vue--echelle" data-vue="echelle" hidden>' + schema_echelle("titre-echelle-vue") + '<span class="vue-legende">Échelle indicative</span></div>')
    boutons.append('<button type="button" class="vue-bouton" data-vue="echelle" aria-pressed="false"><span class="vue-bouton__img vue-bouton__img--echelle" aria-hidden="true">60 × 30</span>À l’échelle</button>')

    nb = len(p["avis"])
    if nb:
        moy = sum(a["note"] for a in p["avis"]) / nb
        note = ('<p class="note-lien"><span class="etoiles" aria-hidden="true">{}</span><a href="#avis">{} sur 5 · {} avis</a><span>{} sans vérification d’achat</span></p>'
                .format(etoiles(moy), note_fr(moy), nb, pluriel(nb, "publié", "publiés")))
    else:
        note = '<p class="note-lien">Pas encore d’avis sur ce modèle · <a href="#avis">voir les avis de la collection</a></p>'
    cables = "".join('<label class="{0}" title="{1}"><input type="radio" name="cable" value="{0}"{2}><span></span><span class="vh">{1}</span></label>'
                     .format(c, n, " checked" if c == "bd" else "") for c, n in CABLES)
    titre_h, textes_h = HISTOIRES.get(slug, (p["titre_histoire"], p["histoire"]))
    histoire = "".join("<p>{}</p>".format(e(x)) for x in textes_h)
    lien = '<p><a class="lien-fleche" href="{}">En savoir plus : {}</a></p>'.format(e(p["lien"]["url"]), e(p["lien"]["label"])) if p["lien"] else ""
    if p["decor"]:
        fig = ('<figure class="histoire__figure">' + img(p["decor"], "Mise en situation de la plaque " + p["nom"] + " (montage)", "(max-width: 980px) 92vw, 600px", srcset=ss) +
               "<figcaption>Mise en situation · montage, échelle indicative</figcaption></figure>")
    else:
        fig = '<div class="encart"><p class="surtitre">Mise en situation</p><p class="attenue">Pas encore de photo de ce modèle sur un mur. ' + marq("photo à fournir") + '</p><p><a class="lien-fleche" href="essayer.html#' + slug + "-" + fin0 + '" data-lien-essai-fiche>Le voir sur un mur d’exemple</a></p></div>'
    if nb:
        bloc_avis = '<div class="avis-fiche">' + resume_avis(p["avis"]) + '<ul class="grille-avis">' + "".join(citation(dict(a, produit=slug), lien=False) for a in sorted(p["avis"], key=lambda a: a["date"], reverse=True)) + "</ul></div>"
    else:
        autres = "".join(citation(a) for a in TOUS_AVIS[:3])
        bloc_avis = '<p class="attenue" style="margin-bottom:20px">Pas encore d’avis sur ce modèle. Voici les plus récents de la collection :</p><ul class="grille-avis">' + autres + "</ul>"
    sim = "".join(carte(x, niveau="h3") for x in similaires(p))
    contenu = """
<div class="cadre">
  <nav class="fil" aria-label="Fil d’Ariane"><ol><li><a href="index.html">Accueil</a></li><li><a href="collection.html">Galerie</a></li><li><a href="collection.html#{coll}">{nomcoll}</a></li><li aria-current="page">{nom}</li></ol></nav>
  <div class="fiche" data-fiche data-slug="{slug}" data-nom="{nom}" data-fin="{fin0}">
    <div class="fiche__visuel">
      <div class="scene scene--fiche" style="view-transition-name: vt-{slug}">
        {vues}
        <div class="scene__barre"><div class="segmente" role="group" aria-label="Ambiance"><button type="button" data-ambiance="jour" aria-pressed="true">Jour</button><button type="button" data-ambiance="nuit" aria-pressed="false">Nuit</button></div></div>
        <p class="etiquette-sim">Simulation · rendu indicatif</p>
      </div>
      <p class="encadre-alerte" data-note-nuit hidden><span>Aperçu avec le kit LED, qui n’est pas dans votre configuration.</span> <button type="button" class="btn btn--petit btn--ligne" data-activer-led>Ajouter le kit LED, +15 €</button></p>
      <p class="attenue petit" data-note-finitions hidden>De nuit, on voit surtout la découpe éclairée : rendu identique pour les trois finitions.</p>
      <div class="vues" role="group" aria-label="Vues de la plaque">{boutons}</div>
    </div>
    <div class="configurateur">
      <div class="configurateur__tete">
        <p class="cartel">{cartel}</p>
        <h1>{nom}</h1>
        {note}
      </div>
      <div class="prix-bloc"><strong data-prix>65 €</strong><span>TTC · TVA non applicable (art. 293 B du CGI)</span></div>
      <fieldset class="etape">
        <legend class="etape__titre"><span class="n">1</span>Finition : <output id="finition-choisie">{nomfin}</output></legend>
        <div class="choix-finition">{radios}</div>
      </fieldset>
      <fieldset class="etape">
        <legend class="etape__titre"><span class="n">2</span>Rétroéclairage</legend>
        <div class="choix-led">
          <label class="carte-choix"><input type="radio" name="led" value="sans" checked><strong>Sans</strong><small>La plaque seule, avec ses deux fixations.</small></label>
          <label class="carte-choix"><input type="radio" name="led" value="avec"><strong>Kit LED <span>+15 €</span></strong><small>Ruban RGB monté au dos par l’atelier, télécommande, alimentation USB.</small></label>
        </div>
        <div class="options-led" data-options-led hidden>
          <div><p class="sous-titre">Couleur de l’aperçu <span>· réglable ensuite à la télécommande</span></p>{nuancier}</div>
          <div class="choix-cable">
            <div class="cable-plan" role="radiogroup" aria-label="Sortie du câble, vue de dos">{cables}</div>
            <div class="choix-cable__texte"><p class="sous-titre" style="margin:0">Sortie du câble : <output id="cable-choisi">Bas droite</output></p><p>Choisissez le coin le plus proche de votre prise USB. L’atelier monte le ruban en conséquence.</p></div>
          </div>
          <p class="attenue petit">Adaptateur secteur USB non fourni. Longueur du ruban : 2 m ou 1,5 m {conf}</p>
        </div>
      </fieldset>
      <details class="cadeau">
        <summary><span><span class="etape__titre" style="display:inline-flex"><span class="n">3</span>C’est un cadeau ?</span></span></summary>
        <div class="cadeau__corps">
          <label class="case"><input type="checkbox" id="option-cadeau"><span>Préparer cette commande comme un cadeau {pav}</span></label>
          <div class="champ"><label for="message-cadeau">Message joint, facultatif</label><textarea id="message-cadeau" maxlength="200" placeholder="Quelques mots pour la personne qui reçoit la plaque"></textarea><span class="aide">200 caractères au plus.</span></div>
          <label class="case"><input type="checkbox" id="masquer-prix"><span>Masquer le prix sur le bon de livraison</span></label>
          <p class="attenue petit">Vous hésitez sur le modèle ? La <a href="produit-carte-cadeau.html">carte cadeau</a> vaut une plaque au choix.</p>
        </div>
      </details>
      <div class="resume-config"><span>Votre configuration</span><output data-resume aria-live="polite">{nom} · {nomfin} : 65 €</output></div>
      <div class="achat-ligne">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une plaque">−</button><input id="quantite" type="number" inputmode="numeric" min="1" max="9" value="1" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter une plaque">+</button></div>
        <button type="button" class="btn btn--led" data-ajouter>Ajouter au panier</button>
      </div>
      <div class="actions-partage">
        <a class="btn btn--petit btn--ligne" href="essayer.html#{slug}-{fin0}" data-lien-essai-fiche>Essayer sur mon mur</a>
        <button type="button" class="btn btn--petit btn--ligne" data-copier-config>Copier le lien</button>
        <button type="button" class="btn btn--petit btn--ligne" data-partager>Envoyer pour avis</button>
      </div>
      {rassurance}
      <div class="passerelle">
        <strong>Plus grand ? Une autre matière ?</strong>
        <p>Sur mesure jusqu’à 2 × 1 m, en acier Corten ou en aluminium brut, à partir de ce modèle et selon faisabilité.</p>
        <p><a class="lien-fleche" href="sur-mesure.html">Demander un devis</a></p>
      </div>
    </div>
  </div>
</div>
<section class="section section--sombre section--bord" aria-labelledby="titre-tech">
  <div class="cadre fiche-technique">
    <div style="display:grid;gap:18px">
      <p class="surtitre">Fiche technique</p>
      <h2 id="titre-tech">Ce que vous recevez</h2>
      {carac}
    </div>
    <figure style="display:grid;gap:10px">{schema}<figcaption class="legende-schema">Schéma à l’échelle, indicatif. La plaque se pose aussi à l’extérieur. Fixation adaptée à l’extérieur {conf}</figcaption></figure>
  </div>
</section>
<section class="section" aria-labelledby="titre-histoire">
  <div class="cadre histoire-grille histoire">
    <div class="histoire__texte">
      <p class="surtitre">L’histoire du modèle</p>
      <h2 id="titre-histoire">{titre_h}</h2>
      {histoire}
      {lien}
    </div>
    {fig}
  </div>
</section>
<section class="section section--sombre section--bord" id="avis" aria-labelledby="titre-avis-fiche">
  <div class="cadre">
    <div class="section__tete"><div><p class="surtitre">Avis</p><h2 id="titre-avis-fiche">Avis sur {nom}</h2><p class="mention-avis">{mention}</p>{gestion}</div></div>
    {bloc_avis}
  </div>
</section>
<section class="section" aria-labelledby="titre-aussi">
  <div class="cadre">
    <div class="section__tete"><div><p class="surtitre">{nomcoll}</p><h2 id="titre-aussi">À voir aussi</h2></div><a class="lien-fleche" href="collection.html">Toute la galerie</a></div>
    <ul class="grille-niches">{sim}</ul>
  </div>
</section>
<div class="barre-mobile"><div><strong data-prix>65 €</strong><output data-resume>{nom} · {nomfin} : 65 €</output></div><button type="button" class="btn btn--led" data-ajouter>Ajouter</button></div>""".format(
        coll=p["collection"], nomcoll=NOM_COLL[p["collection"]], nom=e(p["nom"]), slug=slug, fin0=fin0,
        vues="".join(vues), boutons="".join(boutons), cartel=cartel(p), note=note, nomfin=NOM_FIN[fin0],
        radios=radios_finition("finition", slug, fin0), nuancier=nuancier(), cables=cables, conf=marq("à confirmer"),
        pav=marq("proposition à valider"), rassurance=rassurance(), carac=caracteristiques(), schema=schema_echelle("titre-echelle-fiche"),
        titre_h=e(titre_h), histoire=histoire, lien=lien, fig=fig, mention=MENTION_AVIS, gestion=GESTION_AVIS, bloc_avis=bloc_avis, sim=sim)
    jsonld = {
        "@context": "https://schema.org", "@type": "Product", "name": p["nom"], "brand": {"@type": "Brand", "name": "Terre Gravée"},
        "description": "Plaque murale en aluminium découpé au laser et thermolaqué, 60 × 30 cm, finition noire, grise ou dorée.",
        "material": "Aluminium", "width": "30 cm", "height": "60 cm",
        "image": URL_IMG_SITE + "p/{}-{}-880.webp".format(slug, fin0),
        "offers": {"@type": "Offer", "price": "65.00", "priceCurrency": "EUR", "url": p["url_actuelle"]},
    }
    if nb:
        jsonld["aggregateRating"] = {"@type": "AggregateRating", "ratingValue": note_fr(sum(a["note"] for a in p["avis"]) / nb).replace(",", "."), "reviewCount": nb}
    page("produit-{}.html".format(slug), "{} · plaque murale 60 × 30 cm · Terre Gravée (maquette v3)".format(p["nom"]),
         "Plaque {} en aluminium découpé, 60 × 30 cm. Configurez la finition et le kit LED, essayez-la sur votre mur. 65 € TTC.".format(p["nom"]),
         contenu, jsonld=jsonld)


def fiche_led():
    p = PRODUITS["led"]
    pic = PRODUITS["le-pic-du-midi"]
    tuto = [("tuto/tuto-0.webp", "Contenu du kit : ruban enroulé, contrôleur et télécommande", "Le kit : ruban, contrôleur, télécommande."),
            ("tuto/tuto-1.webp", "Ruban LED posé au dos d’une plaque, câble et raccord visibles", "Le ruban se pose au dos, le long des bords."),
            ("tuto/tuto-2.webp", "Main qui décolle la protection de l’adhésif du ruban", "On décolle la protection de l’adhésif."),
            ("tuto/tuto-4.webp", "Ruban LED plié pour passer un angle de la plaque", "Le ruban se plie pour passer les angles."),
            ("tuto/tuto-5.webp", "Ciseaux qui coupent le ruban LED au repère", "Il se coupe aux repères prévus."),
            ("tuto/tuto-6.webp", "Raccord du ruban LED branché", "Le raccord Pico relie le ruban au contrôleur."),
            ("tuto/tuto-7.webp", "Contrôleur et télécommande du kit LED", "Couleur, intensité, minuteur et effets.")]
    etapes = "".join('<li>{}<p>{}</p></li>'.format(img(r, a, "(max-width: 600px) 92vw, 240px"), t) for r, a, t in tuto)
    contenu = """
<div class="cadre">
  <nav class="fil" aria-label="Fil d’Ariane"><ol><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Kit LED</li></ol></nav>
  <div class="fiche" data-fiche-led>
    <div class="fiche__visuel">
      <div class="vitrine" data-vitrine data-allume data-slug="le-pic-du-midi" data-fin="noir" style="view-transition-name: vt-led">
        <div class="scene">""" + emplacement(pic, "noir", "(max-width: 1000px) 30vw, 170px", eager=True, eager_nuit="high") + """<p class="etiquette-sim">Simulation · rendu indicatif</p></div>
        <div class="vitrine__commandes">
          <div class="vitrine__ligne">
            <div class="selecteur-modele">
              <button type="button" class="fleche" data-modele-pas="-1" aria-label="Modèle précédent">""" + FLECHE_G + """</button>
              <label class="vh" for="led-modele">Plaque de démonstration</label>
              <select id="led-modele" data-modele>""" + options_modeles("le-pic-du-midi") + """</select>
              <button type="button" class="fleche" data-modele-pas="1" aria-label="Modèle suivant">""" + FLECHE_D + """</button>
            </div>
          </div>
          <div class="vitrine__ligne">
            <button type="button" class="interrupteur" data-interrupteur aria-pressed="true"><span class="interrupteur__piste" aria-hidden="true"></span>Rétroéclairage</button>
            """ + nuancier() + """
          </div>
          <p class="attenue petit">Simulation. Le kit est RGB : la couleur se règle à la télécommande. Nuancier exact """ + marq("à confirmer") + """</p>
        </div>
      </div>
      <div class="photos-reelles" style="margin-top:12px">
        <figure class="photo-reelle">""" + img_reduite("led/led-img2.webp", "Ruban LED collé au dos d’une plaque", "(max-width: 1000px) 46vw, 320px") + """<span class="tag">Photo réelle</span><figcaption>Le ruban collé au dos</figcaption></figure>
        <figure class="photo-reelle">""" + img_reduite("led/led-img3.webp", "Télécommande infrarouge et contrôleur du kit LED", "(max-width: 1000px) 46vw, 320px") + """<span class="tag">Photo réelle</span><figcaption>Télécommande et contrôleur</figcaption></figure>
      </div>
    </div>
    <div class="configurateur">
      <div class="configurateur__tete">
        <p class="cartel">Accessoire · rétroéclairage RGB</p>
        <h1>Kit LED</h1>
        <p class="chapo">Le ruban se colle au dos de la plaque. La lumière éclaire le mur et passe par la découpe.</p>
      </div>
      <div class="prix-bloc"><strong>15 €</strong><span>TTC · TVA non applicable (art. 293 B du CGI)</span></div>
      <div class="encadre-alerte"><strong>Le plus simple : ajoutez-le depuis la fiche d’une plaque.</strong><span>Si vous ajoutez le kit depuis la fiche d’une plaque, l’atelier le monte au dos avant l’envoi, à la sortie de câble choisie. Ici, vous commandez le kit seul : vous le posez vous-même et choisissez où sort le câble.</span><a class="lien-fleche" href="collection.html">Choisir une plaque</a></div>
      <div class="achat-ligne"><button type="button" class="btn btn--led" data-ajouter-led>Ajouter le kit seul au panier</button></div>
      <ul class="liste-kit" aria-label="Caractéristiques du kit">
        <li><span>Ruban</span><span>LED RGB autocollant avec raccord Pico</span></li>
        <li><span>Longueur</span><span>2 m sur la fiche actuelle, 1,5 m sur la notice """ + marq("à confirmer") + """</span></li>
        <li><span>Commandes</span><span>Contrôleur intégré, télécommande infrarouge, application smartphone (QR code dans le pack)</span></li>
        <li><span>Réglages</span><span>Couleur, intensité, minuteur, effets</span></li>
        <li><span>Alimentation</span><span>USB. Adaptateur secteur non fourni.</span></li>
        <li><span>Origine</span><span>Non fabriqué en France. Choisi pour sa compatibilité avec les plaques.</span></li>
        <li><span>Alternative</span><span>Les plaques acceptent la plupart des rubans LED du marché.</span></li>
      </ul>
      """ + rassurance("Kit complet, dans son état d’origine") + """
    </div>
  </div>
</div>
<section class="section section--sombre section--bord" aria-labelledby="titre-pose">
  <div class="cadre">
    <div class="section__tete"><div><p class="surtitre">Notice</p><h2 id="titre-pose">La pose du ruban, en images</h2><p class="chapo">Si vous commandez le kit avec une plaque, l’atelier fait tout cela pour vous.</p></div></div>
    <ol class="tuto">""" + etapes + """</ol>
  </div>
</section>"""
    jsonld = {
        "@context": "https://schema.org", "@type": "Product", "name": "Kit LED pour plaque Terre Gravée", "brand": {"@type": "Brand", "name": "Terre Gravée"},
        "description": "Ruban LED RGB autocollant avec raccord Pico, contrôleur intégré, télécommande infrarouge et alimentation USB, pour rétroéclairer une plaque.",
        "image": URL_IMG_SITE + "led/led-img2.webp",
        "offers": {"@type": "Offer", "price": "15.00", "priceCurrency": "EUR", "url": p["url_actuelle"]},
    }
    page("produit-led.html", "Kit LED pour plaque murale · Terre Gravée (maquette v3)",
         "Kit LED RGB pour les plaques Terre Gravée : ruban autocollant, télécommande, application. 15 €, monté par l’atelier si commandé avec la plaque.",
         contenu, actif="produit-led.html", jsonld=jsonld)


def fiche_carte():
    contenu = """
<div class="cadre">
  <nav class="fil" aria-label="Fil d’Ariane"><ol><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Carte cadeau</li></ol></nav>
  <div class="fiche" data-fiche-carte>
    <div class="fiche__visuel">
      <div class="scene scene--fiche scene--carre" style="view-transition-name: vt-carte-cadeau">
        <div class="vue">""" + img_reduite("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, couleur bronze, avec le logo et le slogan « Graver l’âme des territoires »", "(max-width: 1000px) 92vw, 600px", eager="high") + """</div>
      </div>
    </div>
    <div class="configurateur">
      <div class="configurateur__tete">
        <p class="cartel">Accessoire · idée cadeau</p>
        <h1>Carte cadeau</h1>
        <p class="chapo">Elle vaut une plaque au choix. La personne qui la reçoit choisit le modèle et la finition.</p>
      </div>
      <div class="prix-bloc"><strong>65 €</strong><span>TTC · TVA non applicable (art. 293 B du CGI)</span></div>
      <fieldset class="etape">
        <legend class="etape__titre"><span class="n">1</span>Format</legend>
        <div class="choix-led">
          <label class="carte-choix"><input type="radio" name="format" value="email" checked><strong>Par e-mail</strong><small>Envoi immédiat.</small></label>
          <label class="carte-choix"><input type="radio" name="format" value="imprimer"><strong>À imprimer</strong><small>Vous l’imprimez chez vous.</small></label>
        </div>
      </fieldset>
      <fieldset class="etape">
        <legend class="etape__titre"><span class="n">2</span>Pour qui ? <span class="valeur">facultatif</span></legend>
        <div class="champ"><label for="destinataire">Prénom de la personne</label><input id="destinataire" type="text" autocomplete="off" maxlength="40"></div>
        <div class="champ"><label for="message-carte">Message</label><textarea id="message-carte" maxlength="200"></textarea></div>
      </fieldset>
      <div class="achat-ligne"><button type="button" class="btn btn--led" data-ajouter-carte>Ajouter au panier</button></div>
      <ul class="rassurance">
        <li><span>Valeur</span><span>Une plaque au choix, valable sur tous les modèles disponibles</span></li>
        <li><span>Envoi</span><span>Immédiat par e-mail, ou à imprimer</span></li>
        <li><span>Validité</span><span>Durée de validité """ + marq("à fournir") + """</span></li>
        <li><span>Conditions</span><span>Rétractation et conditions d’utilisation de la carte """ + marq("à confirmer") + """</span></li>
        <li><span>Paiement</span><span>Carte bancaire (Stripe), PayPal y compris en 4 fois sans frais, Apple Pay, Google Pay. """ + marq("mention légale PayPal 4X à fournir") + """</span></li>
      </ul>
      <div class="passerelle"><strong>Vous connaissez ses goûts ?</strong><p>Choisissez directement une plaque et cochez « C’est un cadeau » sur sa fiche.</p><p><a class="lien-fleche" href="collection.html">Voir la galerie</a></p></div>
    </div>
  </div>
</div>"""
    pc = PRODUITS["carte-cadeau"]
    jsonld = {
        "@context": "https://schema.org", "@type": "Product", "name": "Carte cadeau Terre Gravée", "brand": {"@type": "Brand", "name": "Terre Gravée"},
        "description": "Carte cadeau qui vaut une plaque au choix, valable sur tous les modèles disponibles, envoyée par e-mail ou à imprimer.",
        "image": URL_IMG_SITE + "misc/carte-cadeau.webp",
        "offers": {"@type": "Offer", "price": "65.00", "priceCurrency": "EUR", "url": pc["url_actuelle"]},
    }
    page("produit-carte-cadeau.html", "Carte cadeau, une plaque au choix · Terre Gravée (maquette v3)",
         "Carte cadeau Terre Gravée à 65 € : elle vaut une plaque au choix, envoyée par e-mail ou à imprimer.", contenu, jsonld=jsonld)


# ---------- Visualiseur ----------

def essayer():
    pic = PRODUITS["le-pic-du-midi"]
    murs = "".join('<button type="button" data-choix-mur="{0}" aria-pressed="{2}"><span class="mur mur--{0}" aria-hidden="true"></span>{1}</button>'
                   .format(m, n, "true" if m == "platre" else "false") for m, n in MURS)
    murs += '<button type="button" data-choix-mur="photo" aria-pressed="false" hidden><span class="mur" style="background:#3a4560" aria-hidden="true"></span>Ma photo</button>'
    cables = "".join('<option value="{}"{}>{}</option>'.format(c, " selected" if c == "bd" else "", n) for c, n in CABLES)
    contenu = """
<div class="cadre">
  <header class="entete-page" style="padding-bottom:20px">
    <p class="surtitre">Essayer chez moi</p>
    <h1>Votre mur, la plaque, à l’échelle</h1>
    <p class="chapo">Choisissez un mur d’exemple ou importez une photo du vôtre. Placez la plaque, allumez-la, partagez le résultat.</p>
  </header>
  <div class="essai" data-essai>
    <div class="essai__visuel">
      <div class="essai__scene avec-cotes" id="scene-essai">
        <div class="mur mur--platre" data-mur></div>
        <img class="photo-mur" data-photo width="1600" height="1200" alt="Votre photo de mur, affichée seulement sur cet appareil" hidden>
        <div class="plinthe" data-decor></div>
        <div class="meuble" data-decor aria-hidden="true"><div class="meuble__corps"></div><span class="meuble__pied meuble__pied--g"></span><span class="meuble__pied meuble__pied--d"></span><span class="meuble__vase"></span><span class="meuble__livres"></span></div>
        <div class="plaque-mobile" data-plaque tabindex="0" role="group" aria-roledescription="plaque déplaçable" aria-label="Plaque Le Pic du Midi" aria-describedby="aide-plaque">""" + emplacement(pic, "noir", "(max-width: 1000px) 30vw, 180px", eager="high", cotes=True) + """</div>
        <div class="barre-echelle" aria-hidden="true"><b data-barre-texte>1 m</b><span data-barre style="width:100px"></span></div>
        <div class="repere" data-repere hidden>
          <svg aria-hidden="true" focusable="false"><line x1="0" y1="0" x2="0" y2="0"/></svg>
          <button type="button" class="poignee" data-poignee="a" aria-label="Extrémité 1 du repère d’échelle, flèches pour déplacer"></button>
          <button type="button" class="poignee" data-poignee="b" aria-label="Extrémité 2 du repère d’échelle, flèches pour déplacer"></button>
          <span class="repere__etiquette" data-repere-etiquette aria-hidden="true"></span>
        </div>
        <p class="etiquette-sim">Simulation · rendu indicatif</p>
      </div>
      <p class="essai__aide" id="aide-plaque"><span>Glissez la plaque à la souris ou au doigt. Au clavier : sélectionnez-la puis utilisez les flèches, Maj pour aller dix fois plus vite.</span><span>Échelle indicative</span></p>
    </div>
    <div class="essai__panneau">
      <div class="onglets" role="tablist" aria-label="Réglages">
        <button type="button" role="tab" id="o-mur" aria-controls="p-mur" aria-selected="true">Mur</button>
        <button type="button" role="tab" id="o-plaque" aria-controls="p-plaque" aria-selected="false" tabindex="-1">Plaque</button>
        <button type="button" role="tab" id="o-lumiere" aria-controls="p-lumiere" aria-selected="false" tabindex="-1">Lumière</button>
        <button type="button" role="tab" id="o-partage" aria-controls="p-partage" aria-selected="false" tabindex="-1">Partager</button>
      </div>
      <section class="panneau actif" id="p-mur" role="tabpanel" aria-labelledby="t-mur">
        <h2 id="t-mur">1 · Le mur</h2>
        <div class="choix-mur" role="group" aria-label="Murs d’exemple">""" + murs + """</div>
        <div class="ligne-couleur"><input type="color" id="couleur-mur" value="#e8e3d9"><label for="couleur-mur">Teinte du mur</label></div>
        <p class="attenue petit" data-info-echelle>Mur d’exemple : 1,80 m de hauteur visible.</p>
        <div class="import">
          <input type="file" id="photo-mur" accept="image/*">
          <label class="btn btn--ligne" for="photo-mur">Importer une photo de mon mur</label>
          <p class="note-privee">""" + ICONE_PRIVE + """<span>Votre photo est traitée sur votre appareil. Rien n’est envoyé, rien n’est conservé après la fermeture de la page.</span></p>
          <p class="attenue petit" data-etat-import aria-live="polite"></p>
          <button type="button" class="btn btn--petit btn--ligne" data-retirer-photo hidden>Retirer ma photo</button>
        </div>
        <div class="champ" data-bloc-repere hidden>
          <p class="sous-titre" style="margin:0">Repère d’échelle <span>· indicatif</span></p>
          <p class="attenue petit">Affichez le repère, posez ses deux extrémités sur un objet connu de la photo, indiquez sa longueur, puis appliquez.</p>
          <button type="button" class="btn btn--petit btn--ligne" data-montrer-repere aria-pressed="false">Afficher le repère</button>
          <label for="reference-echelle">Objet de référence</label>
          <select id="reference-echelle"><option value="204">Hauteur d’une porte, environ 204 cm</option><option value="8">Prise ou interrupteur, environ 8 cm</option><option value="autre">Autre longueur</option></select>
          <div class="champ" data-bloc-autre hidden><label for="reference-autre">Longueur réelle en cm</label><input id="reference-autre" type="number" inputmode="decimal" min="2" max="600" step="1" value="100"></div>
          <button type="button" class="btn btn--petit btn--led" data-appliquer-repere>Appliquer l’échelle</button>
          <p class="attenue petit" data-etat-repere aria-live="polite"></p>
        </div>
      </section>
      <section class="panneau" id="p-plaque" role="tabpanel" aria-labelledby="t-plaque">
        <h2 id="t-plaque">2 · La plaque</h2>
        <div class="champ"><label for="modele-essai">Modèle</label><select id="modele-essai">""" + options_modeles("le-pic-du-midi") + """</select></div>
        <fieldset><legend class="sous-titre">Finition</legend><div class="choix-finition">""" + radios_finition("finition-essai", "le-pic-du-midi", "noir") + """</div></fieldset>
        <div class="taille-fixe">
          <p class="sous-titre" style="margin:0">Taille : <span class="mono">60 × 30 cm</span> · taille réelle</p>
          <p class="attenue petit">La plaque reste affichée à sa taille réelle sur le mur. Besoin d’un plus grand format ? <a href="sur-mesure.html">Voir le sur-mesure, jusqu’à 2 × 1 m</a>.</p>
        </div>
        <div class="placement">
          <div class="pad" role="group" aria-label="Déplacer la plaque">
            <button type="button" class="haut" data-deplacer="haut" aria-label="Monter">""" + FLECHE_H + """</button>
            <button type="button" class="gauche" data-deplacer="gauche" aria-label="Vers la gauche">""" + FLECHE_G + """</button>
            <button type="button" class="centre" data-deplacer="centre">Centrer</button>
            <button type="button" class="droite" data-deplacer="droite" aria-label="Vers la droite">""" + FLECHE_D + """</button>
            <button type="button" class="bas" data-deplacer="bas" aria-label="Descendre">""" + FLECHE_B + """</button>
          </div>
          <p>Chaque appui déplace la plaque de 1 % de la largeur du mur. Maj + clic : 10 %.</p>
        </div>
        <label class="case"><input type="checkbox" id="afficher-cotes" checked><span>Afficher les cotes</span></label>
      </section>
      <section class="panneau" id="p-lumiere" role="tabpanel" aria-labelledby="t-lumiere">
        <h2 id="t-lumiere">3 · La lumière</h2>
        <button type="button" class="interrupteur" data-interrupteur-essai aria-pressed="false"><span class="interrupteur__piste" aria-hidden="true"></span>Aperçu de nuit</button>
        <p class="attenue petit">L’aperçu montre la plaque rétroéclairée dans une pièce sombre. Il ne change que le rendu : il n’ajoute rien à votre configuration.</p>
        <p class="encadre-alerte" data-note-apercu hidden>Aperçu avec le kit LED, qui n’est pas dans votre configuration.</p>
        <div><p class="sous-titre">Couleur <span>· réglable à la télécommande, nuancier """ + marq("à confirmer") + """</span></p>""" + nuancier() + """</div>
        <div class="curseur" data-options-lumiere hidden><div class="curseur__tete"><label for="intensite-essai">Intensité de l’aperçu</label><output id="intensite-sortie" for="intensite-essai">100 %</output></div><input type="range" id="intensite-essai" min="20" max="100" step="5" value="100"></div>
        <div class="option-kit">
          <label class="case"><input type="checkbox" id="kit-essai"><span>Ajouter le kit LED (+15 €) à ma configuration</span></label>
          <p class="attenue petit">Ruban RGB monté au dos par l’atelier avant l’envoi, télécommande, alimentation USB (adaptateur secteur non fourni).</p>
          <div class="champ" data-bloc-cable hidden><label for="cable-essai">Sortie du câble, vue de dos</label><select id="cable-essai">""" + cables + """</select></div>
        </div>
      </section>
      <section class="panneau" id="p-partage" role="tabpanel" aria-labelledby="t-partage">
        <h2 id="t-partage">4 · Votre configuration</h2>
        <div class="resume-config"><span>Résumé</span><output data-resume-essai aria-live="polite">Le Pic du Midi · Noir : 65 €</output></div>
        <div class="resume-essai">
          <button type="button" class="btn btn--led" data-ajouter-essai>Ajouter au panier</button>
          <div class="duo-boutons"><button type="button" class="btn btn--petit btn--ligne" data-copier-essai>Copier le lien</button><button type="button" class="btn btn--petit btn--ligne" data-partager-essai>Envoyer pour avis</button></div>
          <button type="button" class="btn btn--petit btn--ligne" data-exporter>Enregistrer l’image de mon mur</button>
          <p class="attenue petit" data-etat-export aria-live="polite"></p>
          <p class="attenue petit">Le lien contient le modèle, la finition, le kit LED et sa couleur s’il est choisi, jamais votre photo. Partager une image de votre intérieur reste votre choix. Hashtag suggéré : #MonMurTerreGravee """ + marq("proposition à valider") + """</p>
          <a class="lien-fleche" data-lien-fiche-essai href="produit-le-pic-du-midi.html">Voir la fiche Le Pic du Midi</a>
        </div>
        <div class="passerelle"><strong>Votre lieu n’existe pas encore ?</strong><p>Sur mesure jusqu’à 2 × 1 m, en acier Corten ou en aluminium brut.</p><p><a class="lien-fleche" href="sur-mesure.html">Voir le sur-mesure</a></p></div>
      </section>
    </div>
  </div>
</div>"""
    page("essayer.html", "Essayer une plaque sur votre mur · Terre Gravée (maquette v3)",
         "Visualiseur Terre Gravée : posez une plaque de 60 × 30 cm sur un mur d’exemple ou sur la photo de votre mur, à l’échelle, de jour ou rétroéclairée.",
         contenu, actif="essayer.html", scripts_sup='<script src="assets/essayer.js"></script>\n')


# ---------- Sur mesure ----------

def sur_mesure():
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <p class="surtitre">Sur mesure</p>
    <h1>Plus grand, une autre matière, un lieu à vous</h1>
    <p class="chapo">L’atelier part de ses dessins et de son savoir-faire pour des pièces hors collection. Il ne réalise pas de pièce 100 % personnalisée sur simple demande, comme un prénom, une citation ou une photo.</p>
  </header>
  <div class="offres">
    <article class="offre"><p class="surtitre">Dès une plaque</p><h2 style="font-size:1.15rem">Adapter un modèle existant</h2><ul><li>Format jusqu’à 2 m × 1 m</li><li>Aluminium dans la teinte RAL choisie, acier Corten ou aluminium brut</li><li>Autre fixation ou support</li></ul><p>Selon faisabilité.</p></article>
    <article class="offre"><p class="surtitre">Très petite quantité</p><h2 style="font-size:1.15rem">Plaques exclusives</h2><p>Des dessins inédits, pas encore dans la collection, sortis ponctuellement. Parfois en exemplaire unique.</p><p><a class="lien-fleche" href="index.html#lettre">Être prévenu des sorties</a></p></article>
    <article class="offre"><p class="surtitre">Pros, collectivités, lieux culturels</p><h2 style="font-size:1.15rem">Séries et éditions spéciales</h2><ul><li>Frise qui raconte une histoire locale</li><li>Plaques signalétiques au style artistique</li><li>Éditions pour expositions, événements, lieux touristiques</li></ul><p>Quantité minimale selon le projet.</p></article>
  </div>
</div>
<section class="section" aria-labelledby="titre-echelles">
  <div class="cadre passerelle-grille">
    <div style="display:grid;gap:16px">
      <p class="surtitre">Échelle</p>
      <h2 id="titre-echelles">De 60 × 30 cm à 2 × 1 m</h2>
      <p class="chapo">Le grand format change la pièce : il habille un mur entier, une façade ou un hall d’accueil.</p>
    </div>
    <figure>""" + schema_sur_mesure() + """<figcaption class="legende-schema">Comparaison d’échelle indicative : personne de 175 cm, plaque standard, grand format.</figcaption></figure>
  </div>
</section>
<section class="section section--sombre section--bord" aria-labelledby="titre-matieres">
  <div class="cadre">
    <div class="section__tete"><div><p class="surtitre">Matières</p><h2 id="titre-matieres">Trois rendus possibles</h2></div></div>
    <div class="matieres">
      <figure>""" + img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten, teinte rouille", "(max-width: 560px) 46vw, 300px") + """<figcaption>Acier Corten, sa patine rouille</figcaption></figure>
      <figure>""" + img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", "(max-width: 560px) 46vw, 300px") + """<figcaption>Aluminium brut</figcaption></figure>
      <figure><div class="ral" role="img" aria-label="Exemples de teintes, à titre d’illustration"><span style="background:#1f3a33"></span><span style="background:#7a2a26"></span><span style="background:#2c3e5c"></span><span style="background:#b08d57"></span><span style="background:#d8d3c6"></span><span style="background:#3b3d40"></span></div><figcaption>Aluminium thermolaqué dans la teinte RAL choisie (couleurs d’illustration)</figcaption></figure>
    </div>
    <div class="duo-photo duo-photo--haut" style="margin-top:48px">
      <figure class="planche-inedits">""" + img("misc/autres-plaques.webp", "Planche de 18 dessins inédits de paysages, de flore et de faune des Pyrénées", "(max-width: 900px) 92vw, 760px") + """<figcaption>Dessins inédits de paysages, de flore et de faune des Pyrénées.</figcaption></figure>
      <div class="encart"><p class="surtitre">Plaques exclusives</p><h3>Des dessins pas encore dans la collection</h3><p class="attenue">Ils sortent ponctuellement, en très petite quantité, parfois en exemplaire unique.</p><p><a class="lien-fleche" href="index.html#lettre">Être prévenu des sorties</a></p></div>
    </div>
  </div>
</section>
<section class="section" id="demande" aria-labelledby="titre-demande">
  <div class="cadre lettre">
    <div style="display:grid;gap:16px">
      <p class="surtitre">Demande de devis</p>
      <h2 id="titre-demande">Décrivez votre projet</h2>
      <p class="chapo">Quelques lignes suffisent. L’atelier vous répond pour en vérifier la faisabilité. Délai de réponse """ + marq("à fournir") + """</p>
      <div class="encadre-alerte"><strong>Bon à savoir avant de commander</strong><span>Une pièce confectionnée sur mesure n’ouvre pas droit à la rétractation (art. L221-28, 3° du Code de la consommation). L’atelier vous le rappelle sur le devis.</span></div>
    </div>
    <form class="formulaire" data-demo novalidate>
      <div class="champ"><label for="sm-idee">Votre idée</label><textarea id="sm-idee" placeholder="Le lieu, le modèle de départ, l’endroit où la plaque sera posée" required data-erreur-vide="Décrivez votre idée en quelques mots."></textarea></div>
      <div class="form-ligne">
        <div class="champ"><label for="sm-format">Dimensions souhaitées</label><input id="sm-format" type="text" placeholder="Par exemple 120 × 60 cm"></div>
        <div class="champ"><label for="sm-matiere">Matière</label><select id="sm-matiere"><option>Je ne sais pas encore</option><option>Aluminium, teinte RAL</option><option>Acier Corten</option><option>Aluminium brut</option></select></div>
      </div>
      <div class="champ import import--champ"><span class="etiquette" id="sm-photo-etiquette">Photo du lieu, facultative</span><input id="sm-photo" type="file" accept="image/*" data-nom-fichier="sm-photo-nom" aria-labelledby="sm-photo-etiquette sm-photo-bouton"><label class="btn btn--petit btn--ligne" for="sm-photo" id="sm-photo-bouton">Choisir une photo</label><span class="aide" id="sm-photo-nom" aria-live="polite">Aucun fichier choisi. En maquette, le fichier n’est pas envoyé.</span></div>
      <div class="champ"><label for="sm-email">Votre e-mail</label><input id="sm-email" type="email" autocomplete="email" required data-erreur-vide="Indiquez votre adresse e-mail pour recevoir la réponse." data-erreur-format="Indiquez une adresse e-mail valide, par exemple vous@exemple.fr."></div>
      <label class="case"><input type="checkbox"><span>J’accepte aussi de recevoir la lettre « prochaines plaques ». Facultatif.</span></label>
      <div><button class="btn btn--led" type="submit">Envoyer la demande</button></div>
      <p class="message-demo" tabindex="-1" hidden>Maquette : rien n’est envoyé. En ligne, la demande partira à contact@terregravee.fr.</p>
      """ + note_donnees("répondre à votre demande de devis") + """
    </form>
  </div>
</section>"""
    page("sur-mesure.html", "Sur mesure et séries · Terre Gravée (maquette v3)",
         "Plaques sur mesure jusqu’à 2 × 1 m en aluminium RAL, acier Corten ou aluminium brut, plaques exclusives et séries pour professionnels.",
         contenu, actif="sur-mesure.html")


# ---------- Contact ----------

def contact():
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <p class="surtitre">Contact</p>
    <h1>Une question avant de choisir ?</h1>
    <p class="chapo">Une hésitation sur la taille, la finition ou le kit LED ? Écrivez à l’atelier de Gerde.</p>
  </header>
  <div class="contact-grille">
    <div class="carte-contact">
      <p class="surtitre">E-mail</p>
      <div class="email-ligne"><span id="email-contact">contact@terregravee.fr</span><button type="button" class="btn btn--petit btn--ligne" data-copier="email-contact">Copier</button></div>
      <p><a class="lien-fleche" href="mailto:contact@terregravee.fr">Écrire avec ma messagerie</a></p>
      <p class="surtitre" style="margin-top:8px">Atelier</p>
      <address style="font-style:normal">Terre Gravée<br>16 rue du Pic du Midi<br>65200 Gerde, à côté de Bagnères-de-Bigorre</address>
      <div class="encadre-alerte"><strong>Voir les plaques en vrai</strong><span>Présentation à l’atelier sur rendez-vous, pris par e-mail. """ + marq("proposition à valider") + """</span></div>
    </div>
    <form class="formulaire" data-demo novalidate>
      <div class="form-ligne">
        <div class="champ"><label for="c-nom">Votre nom</label><input id="c-nom" type="text" autocomplete="name"></div>
        <div class="champ"><label for="c-email">Votre e-mail</label><input id="c-email" type="email" autocomplete="email" required data-erreur-vide="Indiquez votre adresse e-mail pour recevoir la réponse." data-erreur-format="Indiquez une adresse e-mail valide, par exemple vous@exemple.fr."></div>
      </div>
      <div class="champ"><label for="c-sujet">Sujet</label><select id="c-sujet"><option>Choisir un modèle</option><option>Kit LED</option><option>Commande en cours</option><option>Sur mesure</option><option>Autre</option></select></div>
      <div class="champ"><label for="c-message">Message</label><textarea id="c-message" required data-erreur-vide="Écrivez votre message."></textarea></div>
      <div><button class="btn btn--led" type="submit">Envoyer</button></div>
      <p class="message-demo" tabindex="-1" hidden>Maquette : rien n’est envoyé. Écrivez à contact@terregravee.fr.</p>
      """ + note_donnees("vous répondre") + """
    </form>
  </div>
</div>
<section class="section section--sombre section--bord" id="livraison" aria-labelledby="titre-faq">
  <div class="cadre faq-grille">
    <div class="faq-tete"><p class="surtitre">Questions fréquentes</p><h2 id="titre-faq">Livraison, retours, pose</h2><p class="attenue">Les réponses courtes aux questions qu’on se pose avant de commander.</p></div>
    <div class="faq">
      <details open><summary>Quand vais-je recevoir ma plaque ?</summary><div><p>En 2 à 4 jours ouvrés, à titre indicatif. L’atelier vous prévient en cas de retard.</p></div></details>
      <details><summary>Combien coûte la livraison ?</summary><div><p>Les frais dépendent du poids et de la destination. Ils s’affichent avant la validation de la commande. """ + marq("grille à fournir") + """</p></div></details>
      <details><summary>Puis-je changer d’avis ?</summary><div><p>Oui. La loi vous donne 14 jours après réception pour vous rétracter sans justification. La plaque doit revenir dans son état d’origine, et les frais de retour sont à votre charge. Les pièces personnalisées et sur mesure sont exclues.</p><p>En ligne, le bouton « Renoncer au contrat ici », en bas de chaque page, vous permettra de le faire directement. """ + marq("fonction à brancher, à confirmer") + """</p></div></details>
      <details><summary>Comment poser la plaque ?</summary><div><p>Avec les 2 fixations adhésives 3M Command™ fournies, sans perçage. Le léger décalage avec le mur fait ressortir les ombres de la découpe.</p></div></details>
      <details><summary>Le kit LED est-il obligatoire ?</summary><div><p>Non. C’est une option à 15 €, montée au dos par l’atelier si vous la commandez avec la plaque. Les plaques acceptent aussi la plupart des rubans LED du marché.</p></div></details>
      <details><summary>La plaque va-t-elle dehors ?</summary><div><p>Oui, elle est prévue pour l’intérieur et l’extérieur. Fixation adaptée à l’extérieur """ + marq("à confirmer") + """</p></div></details>
      <details><summary>Quels moyens de paiement ?</summary><div><p>Carte bancaire (Stripe), PayPal y compris en 4 fois sans frais, Apple Pay et Google Pay. """ + marq("mention légale PayPal 4X à fournir") + """</p></div></details>
      <details><summary>Les garanties ?</summary><div><p>Les garanties légales de conformité et des vices cachés s’appliquent.</p></div></details>
    </div>
  </div>
</section>"""
    page("contact.html", "Contact et questions · Terre Gravée (maquette v3)",
         "Contacter l’atelier Terre Gravée à Gerde : e-mail, adresse, livraison, retours, pose sans perçage et kit LED.",
         contenu, actif="contact.html")


# ---------- Stratégie ----------

def lien_src(url, texte=None):
    return '<a href="{}">{}</a>'.format(e(url), e(texte or url))


TECHNIQUES = [
    {
        "nom": "Essayer avant d’acheter : le visualiseur 2D",
        "ou": "<a href=\"essayer.html\">essayer.html</a>, avec des liens « Essayer chez moi » sur l’accueil, chaque carte de la galerie et chaque fiche.",
        "pourquoi": ("Quand on ne peut pas voir l’objet chez soi, on hésite : selon un sondage de Saatchi Art, 70 % des acheteurs d’art hésitent faute de voir l’œuvre avant l’achat ("
                     + lien_src("https://info.nianticspatial.com/blog/saatchi-art-launches-worlds-largest-webar-deployment-letting-customers-view-over-1-million-works-of-art-in-their-home", "Niantic Spatial") +
                     "). L’effet moyen de la réalité augmentée sur les ventes est faible. Il est plus fort quand l’incertitude est élevée, pour les nouveaux clients et les produits peu connus (Tan, Chandukala et Reddy, <em>Journal of Marketing</em>, 2022, "
                     + lien_src("https://www.ama.org/press-releases/press-release-from-the-journal-of-marketing-augmented-reality-in-retail-and-its-impact-on-sales/", "AMA") +
                     "). Dans les tests Baymard sur la déco, 87 % des testeurs qui voyaient « View in Room » ne l’utilisaient pas, surtout à cause d’une mauvaise expérience passée, puis de gestes confus et de redimensionnements accidentels ("
                     + lien_src("https://baymard.com/blog/deprioritize-view-in-room-augmented-reality", "Baymard") +
                     "). D’où un outil 2D, sans application ni caméra, avec une taille verrouillée sur 60 × 30 cm."),
        "valider": "Ne rien promettre sur la baisse des retours : aucune preuve solide. Tester sur un iPhone et un Android réels.",
        "kpi": "Part des visiteurs des fiches qui ouvrent le visualiseur, part qui placent une plaque, conversion des utilisateurs comparée aux autres (en tenant compte de l’auto-sélection), retours motivés par « rendu différent ».",
    },
    {
        "nom": "Repère d’échelle et image cotée",
        "ou": "Visualiseur (repère à caler sur une porte ou une prise, barre d’échelle, cotes) ; fiches (cotes sur la scène, vue « À l’échelle ») ; accueil (vitrine cotée).",
        "pourquoi": ("42 % des utilisateurs jugent la taille d’après les photos et 37 % des sites n’ont pas d’image à l’échelle ("
                     + lien_src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard 2026") +
                     "). Pour juger si un produit de déco convient, les dimensions écrites (49 %) et l’image de dimensions (42 %) arrivent en tête ("
                     + lien_src("https://baymard.com/research-articles/furniture-and-home-decor-quantitative-ux-insights-2026", "Baymard 2026") + ")."),
        "valider": "Les hauteurs de référence (porte d’environ 204 cm, prise d’environ 8 cm) restent indicatives : la mention « indicatif » doit rester visible.",
        "kpi": "Consultation de la vue « À l’échelle », utilisation du repère, questions « quelle taille ? » reçues par e-mail.",
    },
    {
        "nom": "Configurateur avec prix en direct",
        "ou": "Chaque fiche plaque : finition, kit LED, couleur d’aperçu, sortie du câble, option cadeau. Résumé du type « Le Pic du Midi · Doré · kit LED (bleu) : 80 € ».",
        "pourquoi": ("On est prêt à payer plus pour un produit qu’on a configuré soi-même, à condition d’être content du résultat (Franke, Schreier et Kaiser, <em>Management Science</em>, 2010, "
                     + lien_src("https://ideas.repec.org/a/inm/ormnsc/v56y2010i1p125-140.html", "IDEAS") +
                     "). Les utilisateurs veulent pouvoir modifier librement leurs choix ("
                     + lien_src("https://www.nngroup.com/articles/calculator-expectations/", "NN/g") +
                     ") et une option pré-cochée est une pratique trompeuse ("
                     + lien_src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g") + "). Le kit LED n’est donc jamais sélectionné par défaut, et le prix TTC se met à jour dans une zone lue par les lecteurs d’écran."),
        "valider": "Rien à décider : le prix (65 € et 15 €) est réel. Seule l’option cadeau demande une décision (voir plus bas).",
        "kpi": "Passage configuration vers ajout au panier, taux d’ajout du kit LED, panier moyen.",
    },
    {
        "nom": "Démonstration LED jour et nuit, prix collé à l’interrupteur",
        "ou": "Héros de l’accueil (l’allumage, quand la vitrine entre à l’écran), scène des fiches (Jour / Nuit), galerie (« Éteindre la salle »), fiche du kit LED, visualiseur (« Aperçu de nuit »).",
        "pourquoi": ("Les aides visuelles servent le plus quand l’incertitude est forte (Tan et al., 2022). La vidéo et l’image sont bien plus utilisées que la RA : 41 % regardent les vidéos, 6 % cherchent la RA ("
                     + lien_src("https://baymard.com/blog/deprioritize-view-in-room-augmented-reality", "Baymard") +
                     "). La simulation est toujours marquée « rendu indicatif » et accompagnée des vraies photos du kit allumé. L’aperçu ne change que le rendu : le kit LED ne s’ajoute que par un choix distinct, jamais présélectionné, et les liens de l’accueil ne transmettent jamais la couleur ("
                     + lien_src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g") + ")."),
        "valider": "Le nuancier proposé (bleu, blanc, vert, rouge, violet, orange) doit correspondre aux couleurs de la télécommande. Une photo réelle allumée de chaque finition rendrait la promesse plus juste.",
        "kpi": "Taux d’activation du mode nuit, taux d’ajout du kit après activation, réclamations « rendu différent ».",
    },
    {
        "nom": "La couleur LED devient l’accent du site",
        "ou": "Partout : boutons, anneaux de focus, halos, liens. La couleur choisie est mémorisée dans le navigateur du visiteur (stockage local, rien sur un serveur).",
        "pourquoi": "Hypothèse, sans étude dédiée : rendre le choix visible sur tout le site prolonge le sentiment d’avoir composé sa plaque (effet décrit par Franke et al., 2010). C’est aussi la signature visuelle de cette version.",
        "valider": "Rien de commercial. Vérifier le contraste de chaque couleur (le texte sur les boutons reste sombre).",
        "kpi": "Part des visiteurs qui changent de couleur, taux d’ajout du kit LED chez eux.",
    },
    {
        "nom": "Lien de configuration partageable",
        "ou": "Fiches et visualiseur : « Copier le lien » et « Envoyer pour avis » (partage natif du téléphone, sinon copie). Format lisible : <code>#le-pic-du-midi-dore-bleu</code>.",
        "pourquoi": "Aucune étude trouvée : c’est une hypothèse. L’idée est de faciliter l’avis d’un proche, fréquent pour un cadeau. Le lien ne contient aucune donnée personnelle, jamais la photo importée, et il est validé strictement (lettres, chiffres, tirets, valeurs connues seulement).",
        "valider": "En ligne, vérifier que le lien s’ouvre bien sur la fiche avec la configuration restaurée.",
        "kpi": "Clics sur « partager », sessions arrivant par un lien de configuration, conversion de ces sessions.",
    },
    {
        "nom": "« Mon mur » : image partageable et hashtag",
        "ou": "Visualiseur : « Enregistrer l’image de mon mur » compose une image JPEG sur l’appareil (mur ou photo, plaque, halo, légende « simulation »).",
        "pourquoi": "Les photos de clients rassurent. Une image prête à partager aide à demander un avis et peut, avec l’accord de son auteur, alimenter une galerie « Chez vous ». Aucune étude chiffrée citée ici : c’est une hypothèse.",
        "valider": "Le hashtag #MonMurTerreGravee (proposition à valider). Toute republication demande l’accord de l’auteur (droit à l’image). Toute contrepartie (tirage au sort : proposition à valider) doit être indiquée dans la rubrique dédiée aux avis (art. D111-17, 2° a).",
        "kpi": "Images enregistrées, publications avec le hashtag, fiches avec au moins une photo de client.",
    },
    {
        "nom": "Passerelle vers le sur-mesure",
        "ou": "Fin du configurateur, accueil (silhouettes cotées), page <a href=\"sur-mesure.html\">sur-mesure</a> avec formulaire court.",
        "pourquoi": "La valeur d’un produit qu’on a contribué à concevoir (Franke et al., 2010). Les silhouettes cotées (175 cm, 60 × 30 cm, 200 × 100 cm) rendent le grand format concret.",
        "valider": "Le délai de réponse aux devis. L’information, avant commande, que le sur-mesure n’ouvre pas droit à la rétractation (art. L221-28, 3°) est déjà dans la page.",
        "kpi": "Demandes de devis, taux de transformation devis vers commande, montant moyen, délai de réponse.",
    },
    {
        "nom": "Réassurance au bouton d’achat",
        "ou": "Sous le bouton de chaque fiche, dans le panier et dans le cartouche de la galerie : livraison, frais, rétractation, garanties, paiement.",
        "pourquoi": ("60 % des acheteurs cherchent la politique de retour sur la fiche et 44 % des sites ne la lient pas ; 67 % des sites n’estiment pas le coût total près du bouton ("
                     + lien_src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard 2026") +
                     "). 64 % des testeurs cherchent les frais de port avant d’ajouter au panier ("
                     + lien_src("https://baymard.com/blog/show-shipping-costs-on-product-pages", "Baymard") +
                     "). Les frais supplémentaires sont la première raison d’abandon de panier, citée par 40 % ("
                     + lien_src("https://baymard.com/lists/cart-abandonment-rate", "Baymard") + ")."),
        "valider": "Le montant des frais de port (inconnu, marqué « à fournir »). Avec le délai de préparation, la fiche pourra afficher une date de livraison plutôt qu’un délai (" + lien_src("https://baymard.com/blog/shipping-speed-vs-delivery-date", "Baymard") + ").",
        "kpi": "Taux d’abandon de panier, conversion des fiches.",
    },
    {
        "nom": "Des avis complets, répartition et dates comprises",
        "ou": "Accueil (les 9 avis, du plus récent au plus ancien ; sur téléphone, trois avis puis un bouton pour les six autres), fiches (avis du modèle ou, à défaut, avis récents de la collection). Les notes des cartes et du héros précisent « non vérifiés ».",
        "pourquoi": ("La probabilité d’achat culmine entre 4,0 et 4,7 étoiles, puis baisse vers 5,0, effet « trop beau pour être vrai » ("
                     + lien_src("https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales", "Spiegel Research Center") +
                     "). Avec 4,9 sur 9 avis, mieux vaut tout montrer : nombre, répartition, dates, et l’avis à 4 étoiles. Les acheteurs s’attendent à trouver des avis positifs et négatifs ("
                     + lien_src("https://www.nngroup.com/articles/ecommerce-product-pages/", "NN/g") + ")."),
        "valider": ("Répondre publiquement à l’avis de Gerald sur le délai de livraison : 89 % des sites ne répondent pas aux avis négatifs (" + lien_src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard 2026") +
                    "). Fournir la date d’achat ou d’expérience de chaque avis (marquée « date à fournir ») et rédiger la rubrique sur la gestion des avis. Mettre en place une collecte d’avis après achat."),
        "kpi": "Conversion des fiches avec avis contre fiches sans avis, nombre d’avis par mois.",
    },
    {
        "nom": "Rareté réelle : la série numérotée, rien d’autre",
        "ou": "Cartouche de l’accueil, encart « Série limitée », fiche technique.",
        "pourquoi": ("Un message « quantité limitée » convainc plus qu’un message « temps limité » (Aggarwal, Jun et Huh, <em>Journal of Advertising</em>, 2011, "
                     + lien_src("https://experts.umn.edu/en/publications/scarcity-messages-a-consumer-competition-perspective/", "UMN") +
                     "). La rareté ne persuade honnêtement que si elle est vraie (NN/g). Aucun compte à rebours, aucun stock affiché."),
        "valider": "Si vous voulez afficher la taille des séries ou un compteur d’exemplaires, il doit être relié au stock réel.",
        "kpi": "Inscriptions à la lettre « prochaines plaques » par série.",
    },
    {
        "nom": "Option cadeau sur la fiche, date de Noël, carte cadeau",
        "ou": "Fiches (« C’est un cadeau ? » : message et prix masqué), bloc Noël de l’accueil, fiche carte cadeau.",
        "pourquoi": ("80 % des sites ne proposent pas d’option cadeau sur la fiche ; en test, les participants veulent surtout masquer les prix et ajouter un message ("
                     + lien_src("https://baymard.com/blog/gifting-flow", "Baymard") +
                     "). Deux tiers des achats de Noël (66 %) sont prévus avant le 1er décembre (baromètre Havas Market et YouGov, 1 004 personnes interrogées les 6 et 7 octobre 2026, intentions déclarées, lu via "
                     + lien_src("https://www.e-marketing.fr/retail-1095/noel-2026-budget-en-hausse-mais-des-achats-sous-forte-contrainte-175794", "e-marketing.fr") +
                     "). Le Black Friday tombe le vendredi 27 novembre 2026. Après la date limite, la carte cadeau envoyée par e-mail reste possible."),
        "valider": "Le message joint et le prix masqué (proposition à valider). La date limite du jeudi 17 décembre 2026 (proposition à valider : délai de l’atelier plus celui du transporteur). La durée de validité de la carte cadeau.",
        "kpi": "Part des commandes cadeau, chiffre d’affaires avant le 1er décembre, ventes de cartes cadeaux après la date limite.",
    },
    {
        "nom": "Lettre « prochaines plaques »",
        "ou": "Accueil, en fin de page. Case de consentement non cochée et obligatoire pour s’inscrire, e-mail obligatoire, envoi simulé.",
        "pourquoi": ("Les plaques exclusives sortent en très petite quantité : être prévenu a une vraie valeur. Une inscription doit dire l’essentiel sur le contenu de la lettre ("
                     + lien_src("https://www.nngroup.com/articles/newsletters/", "NN/g") +
                     "). Chez un éditeur d’e-mailing, les alertes de disponibilité convertissent à 6,46 % (" + lien_src("https://www.omnisend.com/2026-ecommerce-marketing-report", "Omnisend 2026") + ", donnée d’éditeur)."),
        "valider": "Le rythme d’envoi. La mesure d’ouverture par pixel demande en principe un consentement séparé, sauf exceptions (recommandation CNIL adoptée le 12 mars 2026). La durée de conservation des adresses.",
        "kpi": "Taux d’inscription, désinscriptions, commandes issues de la lettre.",
    },
    {
        "nom": "Voir les plaques en vrai, à l’atelier",
        "ou": "Page <a href=\"contact.html\">contact</a> : présentation sur rendez-vous, pris par e-mail.",
        "pourquoi": "Une cliente écrit : « Merci à Romain de nous les avoir montrés avant l’achat. » C’est le prolongement physique du showroom. Aucune étude citée : c’est une hypothèse.",
        "valider": "Proposition à valider : souhaitez-vous recevoir à Gerde, et à quelles conditions ?",
        "kpi": "Demandes de rendez-vous, commandes qui suivent.",
    },
]

TENDANCES = [
    ("Une nuit sans WebGL ni verre dépoli", "Bleu nuit profond, étoiles en dégradés CSS, aucun Three.js ni Spline. Le glassmorphism lasse ("
     + lien_src("https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/", "Creative Boom") + ") et une scène Spline ajoute environ 0,8 à 2 Mo de JavaScript ("
     + lien_src("https://dev.to/studiomeyer_io/web-design-trends-2026-what-actually-held-up-after-six-months-23p8", "StudioMeyer") + ")."),
    ("Un seul moment signature", "L’allumage de la plaque dans le héros. Pas d’animation partout : le mouvement gratuit lasse (Creative Boom) et une seule typographie animée par page suffit ("
     + lien_src("https://bubble.io/blog/web-design-trends/", "Bubble") + ")."),
    ("Inclinaison 3D légère", "Les niches de la galerie s’inclinent de 6° au plus, seulement à la souris et hors réglage « réduire les animations »."),
    ("Apparitions liées au défilement, avec repli", "Les cartes montent de quelques pixels en entrant à l’écran avec <code>animation-timeline: view()</code>, sous <code>@supports</code>. Sans support (Firefox), elles sont simplement là ("
     + lien_src("https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/", "web-features") + ", "
     + lien_src("https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/", "WebKit") + ")."),
    ("View Transitions", "Bascule jour et nuit avec <code>document.startViewTransition</code> (Baseline depuis octobre 2025), et passage de la galerie à la fiche entre pages sous Chrome, Edge et Safari 18.2 ("
     + lien_src("https://web-platform-dx.github.io/web-features-explorer/features/cross-document-view-transitions/", "web-features") + "). Sans support, la navigation reste normale."),
    ("Typographie moins vue", "Unbounded pour les titres, cité comme choix moins vu ("
     + lien_src("https://www.gleamstudio.design/blog-post/font-trends-2026", "Gleam Studio") + ") ; Manrope pour le texte. JetBrains Mono est réservé aux cotes et aux étiquettes. <code>text-wrap: balance</code> sur les titres."),
    ("Visualiseur autonome plutôt que RA tierce", "8th Wall, qui faisait tourner ce type d’outil, a fermé sa plateforme le 28 février 2026 ("
     + lien_src("https://info.nianticspatial.com/blog/next-chapter", "Niantic Spatial") + "). Le visualiseur 2D ne dépend d’aucun service."),
    ("Configurateur à la Yellowpop", "Import d’une photo de son mur, lien direct pour avis, sauvegarde de sa création ("
     + lien_src("https://yellowpop.fr/a/l/en/en/blogs/news/lecole-du-neon-comment-creer-un-neon-personnalise", "Yellowpop") + ")."),
    ("Lisible par les machines", "Titres hiérarchisés lisibles par les machines ("
     + lien_src("https://bubble.io/blog/web-design-trends/", "Bubble") + ") ; données structurées JSON-LD <code>Product</code> et <code>Organization</code> ajoutées par nous."),
    ("Accessibilité WCAG 2.2", "Glisser doublé de boutons et du clavier (2.5.7), cibles de 24 px au moins (2.5.8), focus non masqué par l’en-tête (2.4.11) ("
     + lien_src("https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/", "W3C") + ")."),
    ("Commerce honnête", "Pas de faux compte à rebours ni de fausse rareté, des pratiques que la Commission envisage d’encadrer dans le futur Digital Fairness Act ("
     + lien_src("https://www.osborneclarke.com/insights/digital-fairness-act-unpacked-dark-patterns", "Osborne Clarke") + ")."),
    ("Barres du bas à fond plein", "La barre d’achat mobile a un fond plein et respecte la zone sûre, car Safari iOS 26 teinte sa barre d’onglets avec le bas de page ("
     + lien_src("https://gist.github.com/alessiomaffeis/41224fad0df2bb722db13473091f0933", "source faible") + "). Elle n’apparaît que sur les fiches, où elle permet de finir l’achat ("
     + lien_src("https://cleancommit.io/blog/sticky-add-to-cart-buttons/", "Cleancommit") + ")."),
]


def strategie():
    techniques = []
    for t in TECHNIQUES:
        techniques.append("""<article class="technique">
  <h3>{nom}</h3>
  <dl>
    <div><dt>Où</dt><dd>{ou}</dd></div>
    <div><dt>Pourquoi</dt><dd>{pq}</dd></div>
    <div><dt>À valider</dt><dd>{val}</dd></div>
    <div><dt>Indicateur</dt><dd>{kpi}</dd></div>
  </dl>
</article>""".format(nom=t["nom"], ou=t["ou"], pq=t["pourquoi"], val=t["valider"], kpi=t["kpi"]))
    tendances = "".join("<li><strong>{}</strong><p>{}</p></li>".format(a, b) for a, b in TENDANCES)
    contenu = """
<div class="cadre">
  <header class="entete-page">
    <p class="surtitre">Pour Romain · version 3</p>
    <h1>Le showroom de nuit, expliqué</h1>
    <p class="chapo">Ce que cette maquette propose, pourquoi, ce qu’il faut valider et comment mesurer si ça marche.</p>
  </header>
  <div class="doc">
    <nav class="doc__sommaire" aria-label="Sommaire"><p>Sommaire</p><ol>
      <li><a href="#concept">Le concept</a></li><li><a href="#parcours">Pour qui</a></li><li><a href="#tendances">Tendances utilisées</a></li>
      <li><a href="#techniques">Techniques marketing</a></li><li><a href="#mesure">Mesurer sans se tromper</a></li>
      <li><a href="#legal">Vigilance légale</a></li><li><a href="#fournir">À fournir et à décider</a></li><li><a href="#limites">Limites de la maquette</a></li>
    </ol></nav>
    <div class="doc__corps">
      <section id="concept">
        <h2>Le concept</h2>
        <p>Un showroom en ligne, de nuit, inspiré du Pic du Midi : un observatoire, un ciel étoilé, et vos plaques qui s’allument. Le visiteur <strong>essaie</strong> la plaque sur son mur, la <strong>configure</strong> et l’<strong>allume</strong>. Le prix suit chacun de ses choix.</p>
        <p>Les deux autres versions partent d’autres idées : la version 1, « Carnet de territoire », raconte les lieux ; la version 2, « Boutique qui convertit », optimise le parcours d’achat. Celle-ci mise sur l’objet et sa lumière, pour réduire l’incertitude qui freine l’achat d’une déco murale : la taille, le rendu sur mon mur, le rendu le soir.</p>
        <p><strong>Pages clés :</strong> <a href="essayer.html">le visualiseur</a>, <a href="produit-le-pic-du-midi.html">une fiche avec configurateur</a>, <a href="collection.html">la galerie qu’on éteint</a>, <a href="index.html">l’accueil et son allumage</a>.</p>
      </section>
      <section id="parcours">
        <h2>Pour qui</h2>
        <p>Des hypothèses de travail, pas des affirmations à publier :</p>
        <ul>
          <li><strong>L’habitant de Bigorre</strong> fier de son territoire : il connaît le lieu, il hésite sur la finition et la taille. Le visualiseur et la photo de son mur répondent.</li>
          <li><strong>Le curiste ou le touriste</strong> qui a vu les plaques à Aquensis ou en ville : il veut retrouver le modèle et le voir chez lui. Deux avis mentionnent Aquensis et une cure à Bagnères.</li>
          <li><strong>Le cycliste</strong> du Tourmalet : il achète un souvenir d’exploit. Le lien partageable lui sert à montrer son choix.</li>
          <li><strong>La personne qui offre</strong> : elle doute du goût du destinataire. Lien « pour avis », option cadeau, carte cadeau.</li>
        </ul>
      </section>
      <section id="tendances">
        <h2>Tendances utilisées</h2>
        <p>Le fil rouge des tendances 2026 : un design « propre » se génère en quelques minutes, la différence vient de choix délibérés (""" + lien_src("https://bubble.io/blog/web-design-trends/", "Bubble") + """). Ici, le geste signature est la lumière. Les photos des plaques et du kit allumé sont réelles. Les mises en situation sont des montages, et le rendu de nuit est une simulation : les deux sont signalés comme tels sur le site.</p>
        <ul class="cartes-tendances">""" + tendances + """</ul>
        <p><strong>Identité :</strong> nuit bleutée (#060a14), accent piloté par la couleur LED (bleu par défaut), titres en Unbounded, texte en Manrope, cotes en JetBrains Mono. Composants propres à cette version : la vitrine cotée, les niches éclairées qu’on éteint, le cartouche technique, l’interrupteur.</p>
      </section>
      <section id="techniques">
        <h2>Techniques marketing</h2>
        <p>Chaque technique indique où elle se trouve, pourquoi elle marche, ce qu’il faut valider et l’indicateur à suivre. Les chiffres viennent de la recherche fournie, avec leur source.</p>
        <div class="liste-techniques">""" + "".join(techniques) + """</div>
      </section>
      <section id="mesure">
        <h2>Mesurer sans se tromper</h2>
        <p>Avec le trafic d’une micro-entreprise, un test A/B aura rarement assez de puissance statistique. Mieux vaut comparer des périodes comparables avant et après, et faire quelques tests avec de vraies personnes, par exemple trois clients qui essaient le visualiseur sur leur téléphone.</p>
        <p>Beaucoup de chiffres du type « +X % de conversion » viennent d’éditeurs de logiciels (RevenueHunt, Omnisend) ou d’associations professionnelles : ce sont des ordres de grandeur. Les sources les plus solides citées ici sont Baymard, NN/g, le W3C et les articles académiques.</p>
        <p>Événements à suivre en priorité, avec un outil de mesure respectueux du consentement : ouverture du visualiseur, import d’une photo, passage en mode nuit, ajout du kit LED, copie ou partage d’un lien de configuration, enregistrement de l’image.</p>
      </section>
      <section id="legal">
        <h2>Points de vigilance légaux</h2>
        <ul>
          <li><strong>Pratiques trompeuses</strong> (""" + lien_src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563107", "art. L121-4") + """) : aucun compte à rebours (7°), le droit de rétractation de 14 jours est présenté comme un droit légal et non comme un avantage de la marque (10°), aucun avis présenté comme vérifié (27°).</li>
          <li><strong>Origine et caractéristiques</strong> (art. L121-2) : la découpe laser est faite à Revel (31). Le site ne dit donc jamais « fait main ». Le kit LED est signalé « non fabriqué en France ».</li>
          <li><strong>Rayon de 150 km</strong> (art. L121-2) : Revel est à environ 155 km de Gerde et de Bagnères-de-Bigorre à vol d’oiseau. Le héros dit donc « fabriquée entre Revel (31) et Bagnères-de-Bigorre (65) ». La phrase « Toutes nos plaques sont réalisées dans un rayon de 150 km » n’apparaît qu’entre guillemets, avec le marqueur « centre du rayon à confirmer ». Dites-nous d’où part le rayon.</li>
          <li><strong>Avis</strong> (""" + lien_src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049571119", "art. L111-7-2") + """ et """ + lien_src("https://www.legifrance.gouv.fr/jorf/id/JORFARTI000035720943", "art. D111-16 à D111-19") + """) : déjà en place, la mention « publiés sans vérification d’achat » près des avis et des notes, la date de publication, l’ordre chronologique et l’adresse pour signaler un doute. Pas encore conforme : il manque près de chaque avis la date de l’expérience de consommation (D111-17, 1° b), marquée « date à fournir », et la rubrique dédiée (contreparties, délais de publication et de conservation : D111-17, 2° ; motifs de refus : L111-7-2), marquée « rubrique à fournir ».</li>
          <li><strong>Prix</strong> : prix TTC et mention de TVA partout, aucun prix barré. Toute réduction future devra se référer au prix le plus bas des 30 derniers jours (""" + lien_src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044549592", "art. L112-1-1") + """).</li>
          <li><strong>Simulation</strong> : chaque rendu de nuit et chaque mur est marqué « simulation, rendu indicatif » ; les mises en situation sont nommées ainsi, jamais présentées comme des photos de clients.</li>
          <li><strong>Photo importée</strong> : elle est lue et affichée dans le navigateur, sans envoi ni conservation. À garder ainsi en ligne : c’est ce qui évite tout traitement de données personnelles.</li>
          <li><strong>E-mail</strong> (""" + lien_src("https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique", "CNIL") + """) : consentement explicite, case non cochée et obligatoire pour s’inscrire, désinscription simple. Les relances par e-mail suivent les mêmes règles de prospection : consentement préalable, ou client existant pour des produits analogues. Les pixels de suivi dans les e-mails demandent en principe un consentement, sauf exceptions (e-mails transactionnels, mesure de délivrabilité) : """ + lien_src("https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels", "recommandation CNIL adoptée le 12 mars 2026") + """.</li>
          <li><strong>Données des formulaires</strong> : sous chaque formulaire, le responsable (Romain Fourneaux), la finalité et un renvoi vers la politique de confidentialité. La durée de conservation et la politique elle-même restent à fournir.</li>
          <li><strong>Rétractation</strong> : depuis le 19 juin 2026, une fonction « Renoncer au contrat ici » doit rester accessible pendant tout le délai de rétractation (ordonnance n° 2026-2 du 5 janvier 2026 et son décret d’application, articles du Code de la consommation à confirmer ; """ + lien_src("https://hlc.com/fr/publications/transposition-under-french-law-of-the-eu-mandatory-withdrawal-button-for-online-sales", "analyse Hogan Lovells") + """). La maquette en montre l’emplacement dans le pied de page et le panier, marqué « fonction à brancher, à confirmer ». Le sur-mesure est exclu du droit de rétractation (""" + lien_src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563170", "art. L221-28, 3°") + """), ce que la page sur-mesure dit avant la commande.</li>
          <li><strong>Informations obligatoires</strong> : le médiateur de la consommation (art. L612-1 et L616-1), le téléphone, l’hébergeur et la politique de confidentialité manquent sur le site actuel. Le pied de page de la maquette leur réserve une place, marquée « à fournir » ou « à rédiger ». La page des mentions légales est à mettre à jour.</li>
          <li><strong>Paiement en 4 fois</strong> : PayPal impose en général une mention sur le financement près de l’offre. Marqueur « mention légale PayPal 4X à fournir » après chaque affichage.</li>
          <li><strong>Polices</strong> : la maquette charge Google Fonts. Un tribunal de Munich a condamné en 2022 un site qui transmettait ainsi l’adresse IP des visiteurs (""" + lien_src("https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html", "The Hacker News") + """). À héberger sur le site avant la mise en ligne.</li>
          <li><strong>Contenus partagés</strong> : republier une photo « mon mur » demande l’accord de son auteur ; toute contrepartie doit être indiquée dans la rubrique dédiée aux avis (D111-17, 2° a).</li>
          <li><strong>Pose à l’extérieur</strong> : la plaque est vendue pour l’intérieur et l’extérieur, mais les fixations adhésives fournies sont en général prévues pour l’intérieur. Le site affiche « fixation adaptée à l’extérieur : à confirmer ».</li>
          <li><strong>Accessibilité</strong> : l’European Accessibility Act exempte a priori les micro-entreprises de services (""" + lien_src("https://www.ccpc.ie/business/enforcement/accessibility/european-accessibility-act-guidelines-for-microenterprises/", "CCPC") + """). La maquette vise quand même WCAG 2.2 AA.</li>
        </ul>
      </section>
      <section id="fournir">
        <h2>À fournir et à décider</h2>
        <table class="tableau">
          <thead><tr><th scope="col">Sujet</th><th scope="col">Ce qu’il faut</th><th scope="col">Où c’est marqué</th></tr></thead>
          <tbody>
            <tr><td>Frais de port</td><td>La grille par poids et destination</td><td>Fiches, panier, galerie, contact</td></tr>
            <tr><td>Ruban LED</td><td>La longueur exacte : 2 m ou 1,5 m</td><td>Accueil, fiches, kit LED</td></tr>
            <tr><td>Nuancier LED</td><td>Les couleurs réelles de la télécommande</td><td>Visualiseur, kit LED</td></tr>
            <tr><td>Photos</td><td>Le Cerf en noir, L’Abbaye de l’Escaladieu en doré ; une mise en situation du Cirque de Gavarnie et du Cerf ; idéalement une photo allumée par finition</td><td>Galerie, fiches, visualiseur</td></tr>
            <tr><td>Réseaux sociaux</td><td>Les adresses Instagram et Facebook</td><td>Pied de page</td></tr>
            <tr><td>Carte cadeau</td><td>La durée de validité</td><td>Fiche carte cadeau</td></tr>
            <tr><td>Sur mesure</td><td>Le délai de réponse aux devis</td><td>Page sur-mesure</td></tr>
            <tr><td>Livraison</td><td>Le délai de préparation, pour afficher une date de livraison</td><td>À ajouter aux fiches</td></tr>
            <tr><td>Décision</td><td>Option cadeau : message et prix masqué</td><td>Fiches, accueil</td></tr>
            <tr><td>Décision</td><td>Date limite de commande pour Noël (proposée : jeudi 17 décembre 2026)</td><td>Accueil</td></tr>
            <tr><td>Décision</td><td>Hashtag #MonMurTerreGravee</td><td>Visualiseur</td></tr>
            <tr><td>Décision</td><td>Présentation des plaques à l’atelier sur rendez-vous</td><td>Contact</td></tr>
            <tr><td>Avis</td><td>La date d’achat ou d’expérience de chaque avis</td><td>Accueil, fiches</td></tr>
            <tr><td>Rubrique avis</td><td>Contreparties, délais de publication et de conservation, motifs de refus</td><td>Accueil, fiches</td></tr>
            <tr><td>Rétractation</td><td>Le bouton « Renoncer au contrat ici », actif pendant tout le délai</td><td>Pied de page, panier, contact</td></tr>
            <tr><td>Médiateur</td><td>Le nom et les coordonnées du médiateur de la consommation</td><td>Pied de page</td></tr>
            <tr><td>Téléphone</td><td>Un numéro de téléphone de contact</td><td>Pied de page</td></tr>
            <tr><td>Hébergeur</td><td>Le nom et l’adresse de l’hébergeur du site</td><td>Pied de page</td></tr>
            <tr><td>Confidentialité</td><td>La politique de confidentialité, la durée de conservation des données des formulaires, et la mise à jour des mentions légales</td><td>Pied de page, formulaires</td></tr>
            <tr><td>Fabrication</td><td>Le point de départ du rayon de 150 km</td><td>Accueil</td></tr>
            <tr><td>Pose</td><td>Une fixation adaptée à l’extérieur</td><td>Fiches, contact</td></tr>
            <tr><td>Paiement</td><td>La mention légale imposée par PayPal pour le paiement en 4 fois</td><td>Fiches, panier, galerie, contact, carte cadeau</td></tr>
            <tr><td>Carte cadeau</td><td>La rétractation et les conditions d’utilisation de la carte</td><td>Fiche carte cadeau</td></tr>
            <tr><td>Mises en situation</td><td>Leur origine (montage, image générée ou non) avant d’écrire « aucune image générée »</td><td>Fiches</td></tr>
          </tbody>
        </table>
      </section>
      <section id="limites">
        <h2>Limites de la maquette</h2>
        <ul>
          <li>Le rendu de nuit est une simulation : il ne montre ni la finition mate ou satinée, ni la diffusion réelle de la lumière sur le mur.</li>
          <li>Les photos des plaques grises ont des découpes légèrement grises : le rendu sur mur est corrigé, mais pas parfait.</li>
          <li>Les transitions entre pages et le partage natif ne fonctionnent pas quand on ouvre les fichiers en local : il faut un vrai site.</li>
          <li>L’export « mon mur » produit une image JPEG d’environ 300 Ko. Il s’appuie sur une copie embarquée des photos des plaques (dossier <code>assets/plaques-data</code>), car un navigateur interdit d’exporter une image locale composée.</li>
          <li>Les données structurées indiquent des adresses d’images qui supposent qu’elles seront publiées sous <code>/assets/img/</code>. Elles ne disent rien du stock, faute de données.</li>
          <li>Les liens de configuration pointent vers le fichier local tant que le site n’est pas en ligne.</li>
          <li>Aucune donnée de stock : la maquette n’affiche donc ni disponibilité ni quantité restante.</li>
        </ul>
      </section>
    </div>
  </div>
</div>"""
    page("strategie.html", "Stratégie de la version 3, showroom de nuit · Terre Gravée",
         "Explication de la maquette version 3 de Terre Gravée : concept, tendances, techniques marketing sourcées, points légaux et informations à fournir.",
         contenu)


# ---------- Données JavaScript ----------

def ecrire_js():
    plaques = []
    for p in PLAQUES:
        fins = finitions_photo(p["slug"])
        plaques.append({"s": p["slug"], "n": p["nom"], "c": p["collection"], "p": fins, "sil": silhouette(p["slug"]),
                        "t": {f: dims("p/{}-{}-440.webp".format(p["slug"], f)) for f in fins}})
    donnees = {
        "img": IMG, "prixPlaque": PRIX_PLAQUE, "prixLed": PRIX_LED, "plaques": plaques,
        "couleurs": [{"id": c, "n": n, "f": COUL_FEM[c], "hex": h, "rgb": rgb(h)} for c, n, h in COULEURS],
        "vignettes": sorted(k for k in TAILLES_LOC if k.startswith("v/")),
        "finitions": [{"id": f, "n": n, "a": a} for f, n, a in FINITIONS],
        "cables": [{"id": c, "n": n} for c, n in CABLES],
    }
    with open(os.path.join(ICI, "assets", "catalogue.js"), "w", encoding="utf-8") as f:
        f.write("/* Généré par build.py : ne pas modifier à la main. */\nwindow.TG3 = " + json.dumps(donnees, ensure_ascii=False) + ";\n")
    dossier = os.path.join(ICI, "assets", "plaques-data")
    if not os.path.isdir(dossier):
        os.makedirs(dossier)
    for p in PLAQUES:
        for fin in finitions_photo(p["slug"]):
            cle = "{}-{}".format(p["slug"], fin)
            with open(os.path.join(MAQ, "assets", "img", "p", cle + "-440.webp"), "rb") as f:
                b64 = base64.b64encode(f.read()).decode("ascii")
            with open(os.path.join(dossier, cle + ".js"), "w", encoding="ascii") as f:
                f.write("window.TG3_PLAQUES=window.TG3_PLAQUES||{};window.TG3_PLAQUES[\"" + cle + "\"]=\"data:image/webp;base64," + b64 + "\";\n")


def main():
    ecrire_js()
    accueil()
    collection()
    essayer()
    for p in PLAQUES:
        fiche_plaque(p)
    fiche_led()
    fiche_carte()
    sur_mesure()
    contact()
    strategie()
    print("{} pages générées dans {}".format(len(PAGES), ICI))


if __name__ == "__main__":
    main()
