#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Terre Gravée · maquette version 2 « Boutique qui convertit ».

Génère les pages HTML et assets/catalogue.js à partir du catalogue de la maquette v0
(../../maquette/data/catalogue.json). Les images restent dans ../../maquette/assets/img.

Usage, depuis n'importe quel dossier :  python build.py
Python 3.8 ou plus récent, bibliothèque standard uniquement.
"""
import html
import json
import os
import re

ICI = os.path.dirname(os.path.abspath(__file__))
MAQUETTE = os.path.normpath(os.path.join(ICI, "..", "..", "maquette"))
with open(os.path.join(MAQUETTE, "data", "catalogue.json"), encoding="utf-8") as fichier_cat:
    CATALOGUE = json.load(fichier_cat)
with open(os.path.join(MAQUETTE, "assets", "img", "_sizes.json"), encoding="utf-8") as fichier_tailles:
    TAILLES = json.load(fichier_tailles)

IMG = "../../maquette/assets/img/"
LOCAL = "assets/img/"
# Copies réduites (vignettes, photos larges) générées une fois avec Pillow dans assets/img/,
# avec leurs dimensions dans assets/img/_variantes.json. Sans ce fichier, les originaux sont utilisés.
CHEMIN_VARIANTES = os.path.join(ICI, "assets", "img", "_variantes.json")
VARIANTES = {}
if os.path.exists(CHEMIN_VARIANTES):
    with open(CHEMIN_VARIANTES, encoding="utf-8") as fichier_var:
        VARIANTES = json.load(fichier_var)
SITE = "https://terregravee.fr"
CGV = SITE + "/cgv/"
MENTIONS = SITE + "/politique/"
PRODUITS = {p["slug"]: p for p in CATALOGUE}
PLAQUES = [p for p in CATALOGUE if p["collection"] != "accessoires"]
PRIX_PLAQUE = 65
PRIX_LED = PRODUITS["led"]["prix"]
SEUIL = 130
REMISE = 0.10
PRIX_TRIPTYQUE = 3 * PRIX_PLAQUE * (1 - REMISE)
DATE_NOEL = "lundi 14 décembre 2026"

COLLECTIONS = [
    ("paysages", "Paysages", "Sommets, col, cirque et pont"),
    ("patrimoine", "Patrimoine", "Tours, châteaux et abbayes"),
    ("faune", "Faune", "Les animaux des Pyrénées"),
    ("accessoires", "Accessoires", "Kit LED et carte cadeau"),
]
NOM_COLL = {c: n for c, n, _ in COLLECTIONS}
FINITIONS = [("noir", "Noir", "noire"), ("gris", "Gris", "grise"), ("dore", "Doré", "dorée")]
NOM_FIN = {f: n for f, n, _ in FINITIONS}
ACC_FIN = {f: a for f, _, a in FINITIONS}
CABLES = [("hg", "Haut gauche"), ("hd", "Haut droite"), ("bg", "Bas gauche"), ("bd", "Bas droite")]

TOUS_AVIS = sorted([dict(a, produit=p["slug"]) for p in CATALOGUE for a in p["avis"]],
                   key=lambda a: a["date"], reverse=True)
NB_AVIS = len(TOUS_AVIS)
MOYENNE = sum(a["note"] for a in TOUS_AVIS) / NB_AVIS
REPARTITION = {n: sum(1 for a in TOUS_AVIS if a["note"] == n) for n in range(1, 6)}
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre",
        "octobre", "novembre", "décembre"]
SEUIL_TXT = "Livraison offerte dès 130 € d’articles livrés, soit deux plaques"

# Histoires réécrites en phrases factuelles (lieu, altitude, ce que montre la découpe) : les textes
# du site actuel contenaient des formules creuses et, pour Gavarnie, une contradiction (« métal brut »,
# « création unique »). Le catalogue de la v0 n'est pas modifié.
HISTOIRES = {
    "le-pic-du-midi": ("Le sommet sous les étoiles", [
        "Le Pic du Midi de Bigorre culmine à 2 877 m. La plaque montre le sommet et son antenne sous un ciel "
        "piqué d’étoiles : chaque étoile est un petit trou découpé au laser.",
        "Avec le kit LED, la lumière passe par toutes les découpes, étoiles comprises."]),
    "le-tourmalet": ("Le col des cyclistes", [
        "Le col du Tourmalet monte à 2 115 m. La plaque montre la route en lacets, trois cyclistes en pleine "
        "montée, un chalet et les crêtes au-dessus.",
        "Pour ceux qui l’ont monté à vélo, ou qui comptent le faire."]),
    "le-montaigu": ("Un sommet de Bigorre", [
        "Le Montaigu culmine à 2 339 m. La plaque montre sa pointe au-dessus des crêtes, puis les sapins et les "
        "prairies en bandes jusqu’au bas de la plaque."]),
    "le-cirque-de-gavarnie": ("Les parois du cirque", [
        "Le cirque de Gavarnie est classé au patrimoine mondial de l’UNESCO. Découpée avec précision dans "
        "l’aluminium, la plaque montre ses parois en gradins, les cascades qui en tombent, puis la forêt et les "
        "rochers du premier plan.",
        "Une création inspirée d’un site classé au patrimoine mondial de l’UNESCO."]),
    "le-pont-despagne": ("L’arche au-dessus du torrent", [
        "Le Pont d’Espagne se trouve à Cauterets. La plaque montre l’arche de pierre au-dessus du torrent, "
        "entre les rochers et les feuillages."]),
    "la-tour-des-jacobins": ("La tour de Bagnères", [
        "La tour des Jacobins, monument historique, se dresse au centre de Bagnères-de-Bigorre. C’est le seul "
        "vestige d’un ancien couvent.",
        "La plaque détaille ses étages, ses fenêtres et sa flèche, avec les toits de la ville autour."]),
    "le-chateau-de-mauvezin": ("Le château fort", [
        "Le château de Mauvezin est un château fort de Bigorre. La plaque montre ses tours devant les montagnes, "
        "avec des feuillages et des oiseaux au premier plan."]),
    "labbaye-de-lescaladieu": ("L’abbaye cistercienne", [
        "L’abbaye de l’Escaladieu, à Bonnemazon, est une abbaye cistercienne. La plaque montre ses bâtiments et "
        "son clocher, avec des feuillages et des roses au premier plan."]),
    "lisard": ("L’animal des hauteurs", [
        "L’isard vit en altitude dans les Pyrénées. La plaque le montre debout sur les rochers, entre les sapins, "
        "avec un sommet derrière lui."]),
    "lours": ("Face à l’ours brun", [
        "L’ours brun vit dans les forêts des Pyrénées. La plaque le montre de face, entre deux troncs, au milieu "
        "des feuillages.",
        "Posée avec le léger décalage des fixations, la découpe projette l’ombre de sa silhouette sur le mur."]),
    "le-cerf": ("Le cerf et ses bois", [
        "La plaque montre le cerf de face, entouré de feuillages. Ses bois occupent tout le haut de la découpe.",
        "Elle trouve sa place au salon, au bureau ou dehors : l’aluminium thermolaqué s’utilise en intérieur "
        "comme en extérieur."]),
    "la-marmotte": ("La marmotte sur son rocher", [
        "La marmotte vit dans les prairies d’altitude. La plaque la montre dressée sur un rocher, entre des "
        "branches et des fleurs."]),
}


# ---------------------------------------------------------------- utilitaires

def e(texte):
    return html.escape(str(texte), quote=True)


def prix(n):
    if abs(n - round(n)) < 1e-9:
        s = str(int(round(n)))
    else:
        s = ("%.2f" % n).replace(".", ",")
    return s + "\u00a0€"


def note_fr(n):
    return ("%.1f" % n).replace(".", ",")


def date_fr(iso):
    annee, mois, jour = iso.split("-")
    j = "1er" if int(jour) == 1 else str(int(jour))
    return "%s %s %s" % (j, MOIS[int(mois) - 1], annee)


def tri_nom(nom):
    for article in ("Le ", "La ", "Les ", "L’"):
        if nom.startswith(article):
            return nom[len(article):]
    return nom


def moyenne(p):
    if not p["avis"]:
        return 0
    return sum(a["note"] for a in p["avis"]) / len(p["avis"])


def valider(detail=""):
    texte = detail + " : proposition à valider" if detail else "proposition à valider"
    return '<span class="note-maq note-maq--valider">' + texte + "</span>"


def fournir(detail):
    return '<span class="note-maq note-maq--fournir">à fournir : ' + detail + "</span>"


def confirmer(detail):
    return '<span class="note-maq note-maq--fournir">à confirmer : ' + detail + "</span>"


def accord_aquensis():
    """Marqueur obligatoire partout où l’histoire d’Aquensis est racontée."""
    return ('<span class="note-maq note-maq--valider">à valider : accord de la SEMETHERM pour citer le projet Aquensis</span>')


def preparation(precision=""):
    texte = "en préparation, à valider" + (" (" + precision + ")" if precision else "")
    return '<span class="note-maq note-maq--valider">' + texte + '</span>'


ETOILE = ('<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 '
          '1.1 5.8L10 14.6l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z"/></svg>')


def etoiles(note, classe=""):
    pct = round(note / 5 * 100, 1)
    rangee = ETOILE * 5
    return ('<span class="etoiles %s" style="--n:%s%%" aria-hidden="true"><span class="etoiles__fond">%s</span>'
            '<span class="etoiles__plein">%s</span></span>' % (classe, pct, rangee, rangee))


def balise(classe="balise"):
    return ('<svg class="%s" viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect x="1" y="1" width="28" '
            'height="8" class="balise__blanc"/><rect x="1" y="11" width="28" height="8" class="balise__rouge"/></svg>'
            % classe)


LOGO = ('<svg class="logo__marque" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" '
        'rx="3" fill="#0E1D3A"/><rect x="8" y="11" width="24" height="7" fill="#fff"/><rect x="8" y="22" width="24" '
        'height="7" fill="#D0121F"/></svg>')

ICONES = {
    "panier": '<path d="M5 8h14l-1.3 11.4a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3Z M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    "retour": '<path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2"/>',
    "cadenas": '<path d="M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
    "bouclier": '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z M9 12l2 2 4-4"/>',
    "camion": '<path d="M3 7h11v9H3z M14 10h4l3 3v3h-7z M7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>',
    "fleche": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "cadeau": '<path d="M4 10h16v10H4z M3 7h18v3H3z M12 7v13 M12 7c-1.5-3-5-3.5-5-1.2C7 7 9 7 12 7Zm0 0c1.5-3 5-3.5 5-1.2C17 7 15 7 12 7Z"/>',
    "copier": '<path d="M9 9h10v11H9z M5 15V4h10"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "croix": '<path d="M6 6l12 12M18 6 6 18"/>',
    "lampe": '<path d="M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
    "numero": '<path d="M5 19V5l8 14V5 M16 9h4 M16 13h4"/>',
    "carte": '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20Z M9 4v13.5 M15 6.5V20"/>',
    "check": '<path d="M5 12.5 10 17 19 7"/>',
}


def icone(nom, classe="ico"):
    return ('<svg class="%s" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" '
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (classe, ICONES[nom]))


# ---------------------------------------------------------------- images

def dims(rel):
    w, h = TAILLES[rel]
    return w, h


def photo(slug, fin):
    return "p/%s-%s-440.webp" % (slug, fin)


def a_photo(slug, fin):
    return photo(slug, fin) in TAILLES


def srcset(slug, fin):
    petit = photo(slug, fin)
    grand = petit.replace("-440.", "-880.")
    return "%s%s %dw, %s%s %dw" % (IMG, petit, TAILLES[petit][0], IMG, grand, TAILLES[grand][0])


def alt_plaque(p, fin):
    return "Plaque murale %s, finition %s" % (p["nom"], ACC_FIN[fin])


def img_plaque(p, fin, sizes, eager=False, attrs=""):
    rel = photo(p["slug"], fin)
    w, h = dims(rel)
    charge = 'fetchpriority="high"' if eager else 'loading="lazy"'
    extra = " " + attrs if attrs else ""
    return ('<img src="%s%s" srcset="%s" sizes="%s" width="%d" height="%d" alt="%s" %s decoding="async"%s>'
            % (IMG, rel, srcset(p["slug"], fin), sizes, w, h, e(alt_plaque(p, fin)), charge, extra))


def srcset_variantes(rel):
    """srcset avec les copies réduites de assets/img/ puis l’original, ou chaîne vide s’il n’y en a pas."""
    var = VARIANTES.get(rel) or []
    if not var:
        return ""
    w, _ = dims(rel)
    morceaux = ["%s%s %dw" % (LOCAL, nom, vw) for nom, vw, _ in var]
    morceaux.append("%s%s %dw" % (IMG, rel, w))
    return ", ".join(morceaux)


def petite(rel):
    """Plus petite copie (chemin, largeur, hauteur) pour une vignette, sinon l’original."""
    var = VARIANTES.get(rel) or []
    if var:
        nom, w, h = var[0]
        return LOCAL + nom, w, h
    w, h = dims(rel)
    return IMG + rel, w, h


def img(rel, alt, sizes="100vw", classe="", eager=False, attrs=""):
    w, h = dims(rel)
    cls = ' class="%s"' % classe if classe else ""
    charge = 'fetchpriority="high"' if eager else 'loading="lazy"'
    extra = " " + attrs if attrs else ""
    jeu = srcset_variantes(rel)
    jeu_attr = ' srcset="%s"' % jeu if jeu else ""
    return ('<img%s src="%s%s"%s width="%d" height="%d" sizes="%s" alt="%s" %s decoding="async"%s>'
            % (cls, IMG, rel, jeu_attr, w, h, sizes, e(alt), charge, extra))


def ico_num():
    return '<span class="ico ico-num" aria-hidden="true">N°</span>'


def vide_plaque(p, fin, cache=False):
    libelle = "Photo de %s en finition %s à venir" % (p["nom"], ACC_FIN[fin])
    return ('<div class="plaque-vide" role="img" aria-label="%s" data-vide%s><span class="plaque-vide__mot">Photo à venir</span>'
            '<span class="plaque-vide__fin" data-vide-fin>Finition %s</span>%s</div>'
            % (e(libelle), " hidden" if cache else "", ACC_FIN[fin], fournir("photo")))


def fin_defaut(p, pref="noir"):
    if a_photo(p["slug"], pref):
        return pref
    for f, _, _ in FINITIONS:
        if a_photo(p["slug"], f):
            return f
    return pref


def manque_photo(p):
    return [f for f, _, _ in FINITIONS if not a_photo(p["slug"], f)]


def cartel(p):
    if not p["cartel"]:
        return ""
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return "%s · <i>%s</i>" % (e(lieu), e(detail))
    return "%s · %s" % (e(lieu), e(detail))


# ---------------------------------------------------------------- composants

def pastilles(p, fin):
    boutons = []
    for f, n, _ in FINITIONS:
        manque = not a_photo(p["slug"], f)
        libelle = n + (", photo à venir" if manque else "")
        boutons.append('<button type="button" class="pastille pastille--%s%s" data-fin="%s" aria-pressed="%s" title="%s">'
                       '<span class="sr">%s</span></button>'
                       % (f, " pastille--manque" if manque else "", f, "true" if f == fin else "false", e(libelle), e(libelle)))
    return '<div class="pastilles" role="group" aria-label="Finition de %s">%s</div>' % (e(p["nom"]), "".join(boutons))


def ligne_avis(p, lien=True):
    nb = len(p["avis"])
    if not nb:
        return '<p class="carte__avis carte__avis--vide">Pas encore d’avis</p>'
    m = moyenne(p)
    return ('<p class="carte__avis">%s<span class="carte__note">%s</span><span class="attenue">(%d avis)</span>'
            '<span class="sr">Note %s sur 5, %d avis</span></p>' % (etoiles(m), note_fr(m), nb, note_fr(m), nb))


TAILLE_CARTE = "(max-width: 640px) 44vw, (max-width: 1100px) 28vw, 250px"


def carte(p, fin=None, sizes=TAILLE_CARTE, ordre=0, titre="h3", badge_ok=True):
    url = "produit-%s.html" % p["slug"]
    commun = ('data-collection="%s" data-slug="%s" data-tri="%s" data-avis="%d" data-best="%d" data-ordre="%d"'
              % (p["collection"], p["slug"], e(tri_nom(p["nom"])), len(p["avis"]), 1 if p["best"] else 0, ordre))
    accessoire = p["collection"] == "accessoires"
    badge = ('<p class="carte__badge">%sMeilleure vente</p>' % balise("balise carte__balise")
             if (p["best"] and badge_ok and not accessoire) else "")
    if p["slug"] == "led":
        return ('<li class="carte carte--accessoire" %s><div class="carte__visuel"><a href="%s" tabindex="-1" aria-hidden="true">'
                '<div class="plaque plaque--photo">%s</div></a></div><div class="carte__corps">%s'
                '<p class="carte__cartel">Option rétroéclairage</p><%s class="carte__nom"><a href="%s">Kit LED</a></%s>'
                '<p class="carte__avis carte__avis--vide">Monté par l’atelier avec une plaque</p>'
                '<div class="carte__bas"><span class="carte__prix">%s</span></div>'
                '<a class="btn-ajout" href="%s">Choisir la sortie du câble</a></div></li>'
                % (commun, url, img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED", sizes),
                   badge, titre, url, titre, prix(p["prix"]), url))
    if p["slug"] == "carte-cadeau":
        return ('<li class="carte carte--accessoire" %s><div class="carte__visuel"><a href="%s" tabindex="-1" aria-hidden="true">'
                '<div class="plaque plaque--carte">%s</div></a></div><div class="carte__corps">%s'
                '<p class="carte__cartel">Valable sur tous les modèles</p><%s class="carte__nom"><a href="%s">Carte cadeau</a></%s>'
                '<p class="carte__avis carte__avis--vide">Envoi immédiat par e-mail</p>'
                '<div class="carte__bas"><span class="carte__prix">%s</span></div>'
                '<button type="button" class="btn-ajout" data-ajout-carte-cadeau>%sAjouter<span class="sr"> la carte cadeau au panier</span></button>'
                '</div></li>'
                % (commun, url, img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, couleur cuivre, avec le logo", sizes),
                   badge, titre, url, titre, prix(p["prix"]), icone("plus")))
    fin = fin if fin and a_photo(p["slug"], fin) else fin_defaut(p)
    vide = vide_plaque(p, manque_photo(p)[0], cache=True) if manque_photo(p) else ""
    return ('<li class="carte" %s><div class="carte__visuel"><a href="%s" tabindex="-1" aria-hidden="true">'
            '<div class="plaque" data-plaque>%s%s</div></a></div><div class="carte__corps">%s'
            '<p class="carte__cartel">%s</p><%s class="carte__nom"><a href="%s">%s</a></%s>%s'
            '<div class="carte__bas"><span class="carte__prix">%s</span>%s</div>'
            '<button type="button" class="btn-ajout" data-ajout-carte>%sAjouter<span class="sr" data-ajout-sr> %s, finition %s, au panier</span></button>'
            '</div></li>'
            % (commun, url, img_plaque(p, fin, sizes, attrs="data-img"), vide, badge, cartel(p), titre, url, e(p["nom"]), titre,
               ligne_avis(p), prix(p["prix"]), pastilles(p, fin), icone("plus"), e(p["nom"]), ACC_FIN[fin]))


def fin_citee(a, p):
    """Finition nommée dans l’avis (« pris en gris »), pour que la vignette ne contredise pas le texte."""
    texte = a["texte"].lower()
    for f, mot in (("noir", "en noir"), ("gris", "en gris"), ("dore", "en doré")):
        if mot in texte and a_photo(p["slug"], f):
            return f
    return fin_defaut(p)


def citation(a, taille="", lien=True, rappel=False):
    p = PRODUITS[a["produit"]]
    fin = fin_citee(a, p)
    vignette = ('<a class="avis__produit" href="produit-%s.html"><span class="avis__vignette">%s</span><span>%s</span></a>'
                % (p["slug"], img_plaque(p, fin, "40px"), e(p["nom"]))) if lien else ""
    controle = '<span class="avis__controle">Publié sans vérification d’achat</span>' if rappel else ""
    return ('<li class="avis %s"><figure><div class="avis__haut">%s<span class="sr">Note %d sur 5</span></div>'
            '<blockquote><p>« %s »</p></blockquote><figcaption><span class="avis__auteur">%s</span>'
            '<span>Publié le <time datetime="%s">%s</time></span>%s%s</figcaption></figure>%s</li>'
            % (taille, etoiles(a["note"]), a["note"], e(a["texte"]), e(a["auteur"]), a["date"], date_fr(a["date"]),
               controle, fournir("date de l’expérience"), vignette))


def mention_avis():
    return ('<p class="mention-avis">Avis publiés sur le site sans vérification d’achat. Classés du plus récent au plus ancien, '
            'avec leur date de publication ; la date de l’expérience (achat ou réception) reste à fournir. '
            '<a href="contact.html#avis-gestion">Comment nous gérons les avis</a></p>')


def repartition_mini():
    """Répartition des notes en barres compactes pour la case de l’accueil."""
    lignes = []
    for n in (5, 4):
        nb = REPARTITION[n]
        lignes.append('<li><span>%d★</span><span class="repart__barre"><span style="width:%d%%"></span></span><span>%d</span></li>'
                      % (n, round(nb / NB_AVIS * 100), nb))
    return ('<p class="sr">Répartition : %d avis à 5 étoiles, %d à 4 étoiles.</p>'
            '<ul class="repart repart--mini" aria-hidden="true">%s</ul>' % (REPARTITION[5], REPARTITION[4], "".join(lignes)))


def repartition():
    lignes = []
    for n in range(5, 0, -1):
        nb = REPARTITION[n]
        pct = round(nb / NB_AVIS * 100)
        lignes.append('<li><span>%d étoile%s</span><span class="repart__barre"><span style="width:%d%%"></span></span>'
                      '<span>%d</span></li>' % (n, "s" if n > 1 else "", pct, nb))
    return '<ul class="repart" aria-label="Répartition des notes">%s</ul>' % "".join(lignes)


def jauge_livraison(attr="data-jauge"):
    return ('<div class="jauge" %s aria-hidden="true"><span class="jauge__rempli"></span><span class="jauge__seuil">%s</span></div>'
            % (attr, prix(SEUIL)))


# ---------------------------------------------------------------- gabarit

NAV = [("collection.html", "Boutique"), ("quiz.html", "Quiz"), ("noel.html", "Noël"), ("triptyque.html", "Triptyque"),
       ("sur-mesure.html", "Sur mesure"), ("contact.html", "Aide et contact")]

FONTS = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800"
         "&amp;family=Figtree:ital,wght@0,400..700;1,400&amp;display=swap")


def entete(actif):
    liens = "".join('<li><a href="%s"%s>%s</a></li>' % (h, ' aria-current="page"' if h == actif else "", n) for h, n in NAV)
    return """<div class="bandeau-maq" role="note"><div class="wrap bandeau-maq__in"><p><strong>Maquette version 2 · brouillon non publié · paiements désactivés</strong></p><p class="bandeau-maq__liens"><a href="strategie.html">Lire la stratégie</a><a href="../index.html">Comparer les versions</a><button type="button" class="bandeau-maq__notes" data-notes aria-pressed="false">Masquer les notes jaunes</button><button type="button" class="bandeau-maq__notes bandeau-maq__charte" data-charte-quitter>Quitter la palette de votre charte</button></p></div></div>
<header class="entete" data-entete>
  <div class="wrap entete__in">
    <a class="logo" href="index.html">%s<span class="logo__nom">Terre Gravée</span><span class="sr">, retour à l’accueil</span></a>
    <nav class="nav" id="nav" aria-label="Navigation principale"><ul>%s</ul></nav>
    <div class="entete__actions">
      <button type="button" class="bouton-panier" data-ouvrir-panier aria-haspopup="dialog">%s<span class="bouton-panier__txt">Panier</span><span class="bouton-panier__nb" data-panier-compteur>0</span><span class="sr"> article(s)</span></button>
      <button type="button" class="bouton-menu" data-menu aria-expanded="false" aria-controls="nav"><span class="bouton-menu__barres" aria-hidden="true"></span>Menu</button>
    </div>
  </div>
</header>""" % (LOGO, liens, icone("panier"))


def pied():
    return """<footer class="pied">
  <div class="pied__balisage" aria-hidden="true"></div>
  <div class="wrap pied__grille">
    <div class="pied__marque">
      <a class="logo logo--clair" href="index.html">%s<span class="logo__nom">Terre Gravée</span><span class="sr">, retour à l’accueil</span></a>
      <p class="pied__slogan">Graver l’âme des territoires</p>
      <p>Atelier : 16 rue du Pic du Midi, 65200 Gerde<br>contact@terregravee.fr</p>
    </div>
    <nav aria-label="Boutique"><h2>Boutique</h2><ul>
      <li><a href="collection.html">Toutes les plaques</a></li>
      <li><a href="collection.html#paysages">Paysages</a></li>
      <li><a href="collection.html#patrimoine">Patrimoine</a></li>
      <li><a href="collection.html#faune">Faune</a></li>
      <li><a href="triptyque.html">Triptyque</a></li>
      <li><a href="produit-led.html">Kit LED</a></li>
      <li><a href="produit-carte-cadeau.html">Carte cadeau</a></li>
    </ul></nav>
    <nav aria-label="Aide"><h2>Aide</h2><ul>
      <li><a href="quiz.html">Quiz</a></li>
      <li><a href="noel.html">Guide de Noël</a></li>
      <li><a href="contact.html#livraison">Livraison, retours</a></li>
      <li><a href="contact.html#avis-gestion">Gestion des avis</a></li>
      <li><a href="sur-mesure.html">Sur mesure</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul></nav>
    <div><h2>Suivre l’atelier</h2><ul>
      <li>Instagram %s</li>
      <li>Facebook %s</li>
      <li><a href="index.html#lettre">Lettre d’information</a></li>
    </ul></div>
  </div>
  <div class="wrap"><div class="pied__bas">
    <p>© 2026 Terre Gravée · Micro-entreprise · Responsable : Romain Fourneaux · SIRET 941 234 270 00010</p>
    <p>Prix TTC, TVA non applicable (art. 293 B du CGI)</p>
    <p><a href="%s">Conditions générales de vente</a> · <a href="%s">Mentions légales et confidentialité</a></p>
  </div></div>
</footer>""" % (LOGO, fournir("lien"), fournir("lien"), CGV, MENTIONS)


def tiroir_panier(qr=False):
    # Sur qr.html, le panier rappelle le code de bienvenue pour ne pas contredire le ticket de la page.
    code = ('<p class="panier__code">Avec le code <strong>AQUENSIS</strong>, à saisir au paiement : livraison offerte dès la première plaque. %s</p>'
            % valider("code et valeur") if qr else "")
    return """<dialog class="panier" id="panier" aria-labelledby="panier-titre">
  <div class="panier__cadre">
    <div class="panier__haut">
      <h2 id="panier-titre">Votre panier</h2>
      <button type="button" class="panier__fermer" data-fermer-panier>%s<span>Fermer</span></button>
    </div>
    <div class="panier__defile">
      <div class="panier__livraison" data-panier-livraison>
        <p class="panier__livraison-msg" data-livraison-msg>Livraison offerte dès %s d’articles livrés.</p>
        %s
        <p class="petit">Hors carte cadeau, envoyée par e-mail. %s</p>
        %s
      </div>
      <ul class="panier__liste" data-panier-liste></ul>
      <div class="panier__suggestions" data-panier-suggestions></div>
      <details class="panier__cadeau">
        <summary>%sC’est pour offrir ?</summary>
        <div class="panier__cadeau-corps">
          <label class="coche"><input type="checkbox" data-panier-cadeau> <span>Masquer les prix sur le bon de livraison</span></label>
          <label class="champ"><span>Message joint au colis (facultatif)</span><textarea rows="2" maxlength="200" data-panier-message></textarea></label>
          <p class="petit">%s Vous hésitez sur le modèle ? <a href="produit-carte-cadeau.html">La carte cadeau</a> vaut une plaque au choix.</p>
        </div>
      </details>
      <p class="petit panier__paiement">Sur le site : carte bancaire (Stripe), PayPal (y compris en 4 fois sans frais dès 20 € d’achat, sous réserve d’acceptation par PayPal), Apple Pay et Google Pay. Commande sans création de compte %s</p>
    </div>
    <div class="panier__bas">
      <dl class="panier__totaux">
        <div><dt>Sous-total</dt><dd data-sous-total>0&nbsp;€</dd></div>
        <div data-ligne-remise hidden><dt>Remise Triptyque %s</dt><dd data-remise>0&nbsp;€</dd></div>
        <div><dt>Livraison</dt><dd data-port>Selon poids et destination</dd></div>
        <div class="panier__total"><dt>Total estimé</dt><dd data-total-panier>0&nbsp;€</dd></div>
      </dl>
      <button type="button" class="btn btn--action btn--plein" disabled aria-describedby="note-commande">Commander</button>
      <p class="petit panier__note" id="note-commande">Maquette : la commande est désactivée.</p>
    </div>
  </div>
</dialog>
<div class="annonce sr" aria-live="polite" data-annonce></div>""" % (
        icone("croix"), prix(SEUIL), jauge_livraison(), valider("seuil de 130 €"), code, icone("cadeau"),
        valider("options cadeau"), confirmer("commande sans compte"), valider("−10 %"))


def typo(texte):
    """Typographie française : espaces insécables avant : ; ! ? », après «, dans les nombres et devant les unités."""
    morceaux = re.split(r"(<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)", texte, flags=re.S)
    sortie = []
    for i, m in enumerate(morceaux):
        if i % 2 == 1:
            if m.startswith("<script") or m.startswith("<style"):
                sortie.append(m)
                continue
            # balise : on ne traite que les attributs de texte
            m = re.sub(r'((?:alt|title|aria-label|content|placeholder)=")([^"]*)(")',
                       lambda r: r.group(1) + typo_texte(r.group(2)) + r.group(3), m)
            sortie.append(m)
        else:
            sortie.append(typo_texte(m))
    return "".join(sortie)


def typo_texte(t):
    t = re.sub(r" ([:])", "\u00a0\\1", t)
    t = re.sub(r" ([;!?])", "\u202f\\1", t)
    t = t.replace("« ", "«\u00a0").replace(" »", "\u00a0»")
    t = re.sub(r"(?<=\d) (?=\d{3}\b)", "\u00a0", t)
    t = re.sub(r"(\d) (€|%|cm|mm|m|km|Mo|Ko|jours|h)\b", "\\1\u00a0\\2", t)
    t = re.sub(r"(\d) €", "\\1\u00a0€", t)
    t = re.sub(r"(\d) %", "\\1\u00a0%", t)
    t = t.replace(" × ", "\u00a0×\u00a0")
    t = re.sub(r"\b(n°|N°) (\d)", "\\1\u00a0\\2", t)
    return t


def page(fichier, titre, description, contenu, actif=None, jsonld=None, classe="", apres=""):
    donnees = ""
    if jsonld:
        donnees = '<script type="application/ld+json">' + json.dumps(jsonld, ensure_ascii=False) + "</script>\n"
    sortie = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%s</title>
<meta name="description" content="%s">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#ffffff">
<script>try { if (window.localStorage.getItem("tg-v2-notes") === "masquees") document.documentElement.classList.add("sans-notes"); if (window.localStorage.getItem("tg-v2-charte") === "romain") document.documentElement.classList.add("charte"); } catch (e) {}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="%s">
<link rel="stylesheet" href="assets/boutique.css">
%s</head>
<body class="%s">
<a class="lien-evitement" href="#contenu">Aller au contenu</a>
%s
<main id="contenu">
%s
</main>
%s
%s
%s
<script src="assets/catalogue.js"></script>
<script src="assets/boutique.js"></script>
</body>
</html>
""" % (e(titre), e(description), FONTS, donnees, classe, entete(actif), contenu, pied(), apres, tiroir_panier("page-qr" in classe.split()))
    with open(os.path.join(ICI, fichier), "w", encoding="utf-8", newline="\n") as f:
        f.write(typo(sortie))
    PAGES.append(fichier)


PAGES = []

ORGANISATION = {
    "@context": "https://schema.org", "@type": "Organization", "name": "Terre Gravée", "url": SITE,
    "email": "contact@terregravee.fr", "slogan": "Graver l’âme des territoires",
    "address": {"@type": "PostalAddress", "streetAddress": "16 rue du Pic du Midi", "postalCode": "65200",
                "addressLocality": "Gerde", "addressCountry": "FR"},
}


# ---------------------------------------------------------------- blocs réutilisés

def rassurance(quatre_fois=True):
    paypal = ("PayPal (y compris en 4 fois sans frais dès 20 € d’achat, sous réserve d’acceptation par PayPal)"
              if quatre_fois else "PayPal")
    return """<ul class="rassurance">
  <li>%s<span><strong>14 jours pour vous rétracter</strong> après réception, comme le prévoit la loi. Article dans son état d’origine, frais de retour à votre charge.</span></li>
  <li>%s<span><strong>Paiement sécurisé</strong> par carte bancaire (Stripe), %s, Apple Pay ou Google Pay.</span></li>
  <li>%s<span><strong>Garanties légales</strong> de conformité et des vices cachés. <a href="%s">Lire les CGV</a></span></li>
</ul>""" % (icone("retour"), icone("cadenas"), paypal, icone("bouclier"), CGV)


def chemin_fabrication(compact=False):
    etapes = [
        ("Dessin", "Illustrations originales", "Maude Villatte et Lola Jacquet dessinent chaque modèle."),
        ("Découpe laser", "Revel (31)", "Le laser découpe l’aluminium de 2 mm d’épaisseur."),
        ("Thermolaquage", "Bagnères-de-Bigorre (65)", "Noir, gris ou doré, en finition mate ou satinée."),
        ("Assemblage et envoi", "Bagnères-de-Bigorre (65)", "Contrôle qualité, emballage et expédition."),
    ]
    items = "".join('<li class="chemin__etape">%s<p class="chemin__lieu">%s</p><h3>%s</h3><p>%s</p></li>'
                    % (balise("balise chemin__balise"), e(lieu), e(titre), e(txt)) for titre, lieu, txt in etapes)
    return '<ol class="chemin%s">%s</ol>' % (" chemin--compact" if compact else "", items)


def faq_objections(led=True):
    q = [
        ("Comment se fixe la plaque ?",
         "<p>Avec les deux fixations adhésives 3M Command™ livrées avec la plaque. Pas de perçage. Le léger décalage avec le mur fait ressortir les ombres de la découpe.</p>"),
        ("Peut-on l’installer dehors ?",
         "<p>Oui. L’aluminium thermolaqué s’utilise en intérieur comme en extérieur. %s</p>" % confirmer("fixation conseillée en extérieur")),
        ("Quand vais-je la recevoir ?",
         "<p>En 2 à 4 jours ouvrés après l’expédition, à titre indicatif. Nous vous prévenons en cas de retard.</p>"),
        ("Comment la plaque voyage-t-elle ?",
         "<p>Dans un emballage renforcé : une pochette en carton ondulé, des plaques de calage et une boîte en carton type livre, au format A2. %s</p>"
         % confirmer("emballage utilisé aujourd’hui")),
    ]
    if led:
        q.append(("Comment s’alimente le kit LED ?",
                  "<p>Par un câble USB. L’adaptateur secteur n’est pas fourni. Vous réglez la couleur, l’intensité, le minuteur et les effets avec la télécommande infrarouge ou l’application smartphone (QR code dans le pack).</p>"))
    q += [
        ("Et si elle ne me plaît pas ?",
         "<p>Vous avez 14 jours après réception pour vous rétracter sans justification. La plaque doit revenir dans son état d’origine et les frais de retour sont à votre charge. Les pièces personnalisées sont exclues.</p>"),
        ("Que signifie le numéro au dos ?",
         "<p>Chaque modèle est édité en série limitée. Le numéro de votre exemplaire est gravé au dos de la plaque.</p>"),
    ]
    return "".join('<details class="faq"><summary>%s</summary><div class="faq__corps">%s</div></details>' % (e(a), b) for a, b in q)


# ---------------------------------------------------------------- histoire d’origine et nouveautés

# Modèles en préparation (dossier « rex » de l’atelier, juin et juillet 2026). Aucune photo de plaque :
# les deux premiers sont recadrés dans la planche des dessins inédits, le troisième n’a pas encore d’aperçu.
BIENTOT = [
    ("Le Casque du Lhéris", "Dessin, pas encore une plaque", "bientot-casque-du-lheris.webp", (194, 388),
     "Dessin préparatoire du Casque du Lhéris : le sommet rocheux au-dessus des pentes"),
    ("La Transhumance", "Dessin, pas encore une plaque", "bientot-la-transhumance.webp", (194, 380),
     "Dessin préparatoire de La Transhumance : un troupeau de vaches et son berger sur un chemin de montagne"),
    ("Le Jardin Massey", "Tarbes", None, None, ""),
]
NB_FAUNE = sum(1 for p in CATALOGUE if p["collection"] == "faune")
EN_LETTRES = {2: "deux", 3: "trois", 4: "quatre", 5: "cinq", 6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix"}
GRANDS_FORMATS = "Le Cirque de Gavarnie, Le Tourmalet, Le Pont d’Espagne et Le Pic du Midi"


def section_origine():
    return """<section class="section section--origine" id="origine" aria-labelledby="titre-origine">
  <div class="wrap origine">
    <div class="origine__texte">
      <p class="surtitre">Notre histoire</p>
      <h2 id="titre-origine">Nos plaques sont nées à Aquensis</h2>
      <p class="origine__chapo">Tout est parti d’un projet de décoration conçu pour Aquensis, le centre thermal de Bagnères-de-Bigorre.</p>
      <p>Il fallait masquer une coursive technique. Trente niches de 1 m × 2 m ont reçu des panneaux en métal découpé, qui jouent avec les vides et les pleins. Leur thème : le patrimoine, la flore et la faune de Bagnères et de la Bigorre.</p>
      <p>Deux illustratrices, Maude Villatte et Lola Jacquet, ont dessiné soixante illustrations. Chacune a été adaptée aux contraintes de la découpe : taille des ouvertures, rigidité, points d’accroche.</p>
      <p>Les panneaux sont en aluminium thermolaqué effet Corten, découpés au laser et rétroéclairés. Les visiteurs ont adoré. C’est ce succès qui a donné l’idée de proposer des plaques aux particuliers, au format 60 × 30 cm.</p>
      <p>%s</p>
      <p class="origine__preuve"><strong>Ce que cela prouve.</strong> Le style des panneaux a d’abord plu aux visiteurs d’Aquensis. Deux avis publiés sur le site racontent avoir découvert nos plaques là-bas ou pendant une cure. <a href="#avis">Lire les avis</a></p>
      <a class="lien-fleche" href="collection.html">Voir les 12 plaques%s</a>
    </div>
    <div class="origine__cote">
      <figure class="origine__fig"><div class="origine__photo">%s<span class="etiquette">Photo réelle</span></div><figcaption>Les panneaux rétroéclairés au-dessus du bassin d’Aquensis.</figcaption></figure>
      <ul class="origine__chiffres">
        <li><strong>30</strong><span>niches de 1 m × 2 m</span></li>
        <li><strong>60</strong><span>illustrations adaptées à la découpe</span></li>
        <li><strong>2</strong><span>illustratrices pour les dessins</span></li>
        <li><strong>60 × 30</strong><span>cm : le format des plaques, pour chez vous</span></li>
      </ul>
    </div>
  </div>
</section>""" % (accord_aquensis(), icone("fleche"),
                 img("misc/aquensis.webp", "Détail du centre thermal Aquensis : les panneaux découpés et rétroéclairés, avec leurs titres, sous la galerie en bois",
                     "(max-width: 959px) 92vw, 560px", classe="origine__img"))


def bloc_bientot():
    items = []
    for nom, info, fichier, taille, alt in BIENTOT:
        if fichier:
            visuel = '<img class="bientot__img" src="%s%s" width="%d" height="%d" alt="%s" loading="lazy" decoding="async">' % (
                LOCAL, fichier, taille[0], taille[1], e(alt))
            detail = '<span class="bientot__info">%s</span>' % e(info)
        else:
            visuel = '<span class="bientot__vide" aria-hidden="true">?</span>'
            detail = '<span class="bientot__info">%s</span><span class="bientot__info">%s</span>' % (e(info), fournir("aperçu du dessin"))
        items.append('<li class="bientot__item">%s<span class="bientot__txt"><strong>%s</strong>%s</span></li>' % (visuel, e(nom), detail))
    return """<div class="bientot" role="group" aria-labelledby="titre-bientot">
        <div class="bientot__tete"><h3 id="titre-bientot" class="bientot__titre">Bientôt</h3>%s</div>
        <ul class="bientot__liste">%s</ul>
        <p class="petit">Les trois prochains modèles. La lettre vous prévient de leur sortie.</p>
      </div>""" % (preparation(), "".join(items))


# ---------------------------------------------------------------- accueil

def accueil():
    pic = PRODUITS["le-pic-du-midi"]
    heros_fins = "".join(
        '<button type="button" class="pastille pastille--%s" data-heros-fin="%s" aria-pressed="%s" title="%s"><span class="sr">Voir en %s</span></button>'
        % (f, f, "true" if f == "noir" else "false", n, n.lower()) for f, n, _ in FINITIONS)
    anto = [a for a in TOUS_AVIS if a["auteur"] == "Anto 65"][0]
    trip = "".join('<div class="plaque">%s</div>' % img_plaque(PRODUITS[s], f, "90px") for s, f in
                   (("le-cirque-de-gavarnie", "noir"), ("le-pic-du-midi", "noir"), ("le-pont-despagne", "noir")))
    best = [PRODUITS[s] for s in ("le-pic-du-midi", "lisard", "lours", "le-cerf")]
    cartes_best = "".join(carte(p, "dore" if p["slug"] == "lisard" else None, ordre=i, badge_ok=False) for i, p in enumerate(best))
    puces = "".join('<li><a class="puce" href="collection.html#%s">%s <span>%d</span></a></li>'
                    % (c, n, sum(1 for p in CATALOGUE if p["collection"] == c)) for c, n, _ in COLLECTIONS)
    tailles = {"Greg 65": "avis--3", "Marie": "avis--3", "Sophia P.": "avis--6", "Isa": "avis--3", "Romain P.": "avis--3",
               "Gerald": "avis--6", "Anto 65": "avis--4", "Jerome D.": "avis--4", "Sergio": "avis--4"}
    avis = "".join(citation(a, tailles.get(a["auteur"], "avis--4")) for a in TOUS_AVIS)
    contenu = """
<section class="bento-accueil wrap" aria-label="À la une">
  <div class="case case--heros">
    <div class="heros__texte">
      <p class="surtitre">Plaques murales · Hautes-Pyrénées</p>
      <h1 class="heros__titre">Les Pyrénées, <span class="souligne">découpées</span> dans l’aluminium</h1>
      <p class="heros__chapo">Douze silhouettes de Bigorre : des sommets, des monuments, des animaux. Chaque plaque mesure 60 × 30 cm et se pose sans perçage.</p>
      <p class="heros__prix"><strong>65 €</strong> la plaque, en noir, gris ou doré</p>
      <div class="heros__actions">
        <a class="btn btn--action" href="collection.html">Choisir ma plaque%s</a>
        <a class="btn btn--ligne" href="quiz.html">Trouver la mienne en 4 questions</a>
      </div>
    </div>
    <div class="heros__visuel">
      <figure class="cotes" data-heros>
        <div class="plaque plaque--heros">%s</div>
        <span class="cote cote--h"><span>30 cm</span></span>
        <span class="cote cote--v"><span>60 cm</span></span>
      </figure>
      <div class="heros__fins"><span>Voir en</span><div class="pastilles" role="group" aria-label="Finition affichée">%s</div></div>
    </div>
  </div>
  <div class="case case--aquensis">
    <figure class="aquensis__fig">
      <div class="aquensis__photo">%s<span class="etiquette">Photo réelle</span></div>
    </figure>
    <div class="aquensis__texte">
      <h2 class="aquensis__titre">Tout est né à Aquensis</h2>
      <p>Ces panneaux ont été conçus pour Aquensis, le centre thermal de Bagnères-de-Bigorre. Les visiteurs les ont adorés : nos plaques sont nées de là. <a href="#origine">Notre histoire</a></p>
      <p class="aquensis__note">%s</p>
    </div>
    <blockquote class="aquensis__avis">%s<span class="sr">Note %d sur 5</span><p>« %s »</p><footer><span>%s · publié le <time datetime="%s">%s</time> · avis sur <a href="produit-lours.html">L’Ours</a></span><span>Avis publié sans vérification d’achat. %s</span></footer></blockquote>
  </div>
  <div class="case case--quiz">
    <p class="surtitre">Vous hésitez ?</p>
    <h2>Quelle plaque pour quel mur ?</h2>
    <p>Quatre questions sur votre pièce, votre mur et vos goûts. À la fin : un modèle, une finition et le prix total. Sans e-mail.</p>
    <ol class="mini-etapes" aria-label="Les quatre questions"><li><span class="barre-balise" aria-hidden="true"></span>Pièce</li><li><span class="barre-balise" aria-hidden="true"></span>Mur</li><li><span class="barre-balise" aria-hidden="true"></span>Thème</li><li><span class="barre-balise" aria-hidden="true"></span>Lumière</li></ol>
    <a class="btn btn--clair" href="quiz.html">Commencer le quiz%s</a>
  </div>
  <div class="case case--noel">
    <p class="surtitre">Noël 2026</p>
    <h2>Un cadeau par profil</h2>
    <p>Randonneur, cycliste, amoureux de Bagnères, curiste ou indécis : les plaques triées pour chacun.</p>
    <p class="case__date">Commandez au plus tard le %s pour recevoir avant Noël. %s</p>
    <a class="lien-fleche" href="noel.html">Ouvrir le guide cadeaux%s</a>
  </div>
  <div class="case case--trip">
    <div class="trip__mini" aria-hidden="true">%s</div>
    <div>
      <p class="surtitre">Lot de trois</p>
      <h2>Le Triptyque</h2>
      <p>Trois plaques au choix, alignées sur le mur. <strong>%s les trois</strong>, soit %s la plaque.</p>
      <p class="petit">%s</p>
      <a class="lien-fleche" href="triptyque.html">Composer mon Triptyque%s</a>
    </div>
  </div>
  <div class="case case--note">
    <p class="note-geante">%s<span>/5</span></p>
    %s
    <p><strong>%d avis</strong> publiés sur le site</p>
    %s
    <p class="petit attenue">Sans vérification d’achat</p>
    <a class="lien-fleche" href="#avis">Lire les avis%s</a>
  </div>
  <div class="case case--led">
    %s
    <div>
      <p class="surtitre">Option · +15 €</p>
      <h2>Le soir, elle s’allume</h2>
      <p>Ruban LED RGB collé au dos par l’atelier avant l’envoi. Télécommande et application pour la couleur et l’intensité.</p>
      <a class="lien-fleche" href="produit-led.html">Voir le kit LED%s</a>
    </div>
  </div>
  <div class="case case--serie">
    <p class="numero-geant" aria-hidden="true">N°</p>
    <h2>Série limitée</h2>
    <p>Chaque modèle est édité en série limitée. Le numéro de votre exemplaire est gravé au dos de la plaque.</p>
    <p class="petit">%s</p>
    <a class="lien-fleche" href="collection.html">Les 12 modèles%s</a>
  </div>
  <div class="case case--retours">
    %s
    <h2>Retours</h2>
    <p>14 jours après réception pour vous rétracter, comme le prévoit la loi. Frais de retour à votre charge.</p>
    <a class="lien-fleche" href="contact.html#livraison">Livraison et retours%s</a>
  </div>
</section>

<section class="section wrap" aria-labelledby="titre-best">
  <div class="tete-section">
    <div><p class="surtitre">Meilleures ventes affichées sur le site actuel %s</p><h2 id="titre-best">Quatre plaques pour commencer</h2></div>
    <p class="tete-section__aide">Touchez une pastille pour changer de finition, puis ajoutez au panier.</p>
  </div>
  <ul class="grille-cartes">%s</ul>
  <div class="themes"><p>Par thème</p><ul class="puces">%s</ul><a class="lien-fleche" href="collection.html">Voir les 12 plaques%s</a></div>
</section>

<section class="section section--neige" id="avis" aria-labelledby="titre-avis">
  <div class="wrap">
    <div class="tete-avis">
      <div><p class="surtitre">Avis</p><h2 id="titre-avis">Ce que disent les avis publiés sur le site</h2></div>
      <div class="resume-avis">
        <p class="note-geante">%s<span>/5</span></p>
        <div>%s<p>%d avis, dont %d à 5 étoiles et %d à 4 étoiles</p></div>
        %s
      </div>
    </div>
    %s
    <ul class="grille-avis grille-avis--defile" tabindex="0" aria-label="Les 9 avis, à faire défiler sur téléphone">%s</ul>
  </div>
</section>

<section class="section wrap" aria-labelledby="titre-chemin">
  <div class="tete-section">
    <div><p class="surtitre">Fabrication</p><h2 id="titre-chemin">Le chemin d’une plaque</h2></div>
    <div class="tete-section__aide"><p class="citation-marque">« Toutes nos plaques sont réalisées dans un rayon de 150 km. »</p><p class="petit">L’atelier, à propos de sa fabrication. %s</p></div>
  </div>
  %s
</section>

%s

<section class="section wrap" id="lettre" aria-labelledby="titre-lettre">
  <div class="lettre">
    <figure class="lettre__visuel">%s<figcaption>Dessins inédits de l’atelier, pas encore dans la collection</figcaption></figure>
    <div class="lettre__texte">
      <p class="surtitre">Plaques exclusives</p>
      <h2 id="titre-lettre">Soyez prévenu de la prochaine sortie</h2>
      <p>Certains dessins sortent en très petite quantité, parfois en exemplaire unique. La lettre vous prévient à chaque sortie.</p>
      <p class="petit">Jour de sortie : le premier jeudi du mois. %s</p>
      %s
      %s
    </div>
  </div>
</section>
""" % (
        icone("fleche"), img_plaque(pic, "noir", "(max-width: 640px) 46vw, 300px", eager=True, attrs="data-heros-img"), heros_fins,
        img("misc/aquensis.webp", "Bassin du centre thermal Aquensis : sous la charpente en bois, la rangée de panneaux découpés et rétroéclairés conçus pour le centre",
            "(max-width: 699px) 92vw, (max-width: 1099px) 46vw, 430px"),
        accord_aquensis(),
        etoiles(anto["note"]), anto["note"], e(anto["texte"]), e(anto["auteur"]), anto["date"], date_fr(anto["date"]),
        fournir("date de l’expérience"),
        icone("fleche"),
        DATE_NOEL, valider("date limite"), icone("fleche"),
        trip, prix(PRIX_TRIPTYQUE), prix(PRIX_TRIPTYQUE / 3), valider("remise de 10 %"), icone("fleche"),
        note_fr(MOYENNE), etoiles(MOYENNE), NB_AVIS, repartition_mini(), icone("fleche"),
        img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu", "(max-width: 699px) 30vw, 150px"), icone("fleche"),
        fournir("taille de chaque série"), icone("fleche"),
        icone("retour", "ico ico--grand"), icone("fleche"),
        confirmer("à vérifier avec les ventes réelles"), cartes_best, puces, icone("fleche"),
        note_fr(MOYENNE), etoiles(MOYENNE), NB_AVIS, REPARTITION[5], REPARTITION[4], repartition(),
        mention_avis(), avis,
        confirmer("centre du rayon de 150 km, Revel étant à environ 155 km de l’atelier à vol d’oiseau"),
        chemin_fabrication(),
        section_origine(),
        img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits : sommets, fleurs et animaux des Pyrénées", "(max-width: 899px) 92vw, 600px"),
        valider("jour de sortie"),
        bloc_bientot(),
        formulaire_lettre("accueil"),
    )
    page("index.html", "Terre Gravée · Plaques murales des Pyrénées en aluminium",
         "Plaques murales en aluminium découpé au laser : sommets, patrimoine et faune des Pyrénées. 65 € la plaque, 60 × 30 cm, pose sans perçage, série limitée numérotée.",
         contenu, jsonld=ORGANISATION, classe="page-accueil")


def formulaire_lettre(cle):
    return """<form class="form-lettre" data-demo novalidate>
        <div class="champ"><label for="email-%s">Votre adresse e-mail</label><input id="email-%s" type="email" autocomplete="email" required placeholder="prenom@exemple.fr"></div>
        <label class="coche"><input type="checkbox" required> <span>J’accepte de recevoir la lettre de Terre Gravée par e-mail. Je peux me désinscrire à tout moment avec le lien présent dans chaque lettre. <a href="%s">Confidentialité</a></span></label>
        <button type="submit" class="btn btn--nuit">M’inscrire</button>
        <p class="message-demo" role="status" hidden>Maquette : rien n’est envoyé.</p>
      </form>""" % (cle, cle, MENTIONS)


# ---------------------------------------------------------------- collection

def collection():
    comptes = {c: sum(1 for p in CATALOGUE if p["collection"] == c) for c, _, _ in COLLECTIONS}
    puces = ['<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Tout <span>%d</span></button>' % len(CATALOGUE)]
    puces += ['<button type="button" class="puce" data-filtre="%s" aria-pressed="false">%s <span>%d</span></button>' % (c, n, comptes[c])
              for c, n, _ in COLLECTIONS]
    voir = "".join('<button type="button" class="pastille pastille--%s" data-voir-en="%s" aria-pressed="false" title="%s"><span class="sr">Tout voir en %s</span></button>'
                   % (f, f, n, n.lower()) for f, n, _ in FINITIONS)
    cartes = []
    for i, p in enumerate(CATALOGUE):
        cartes.append(carte(p, ordre=i))
        if i == 3:
            cartes.append("""<li class="tuile-promo tuile-promo--quiz" data-promo><p class="surtitre">Vous hésitez ?</p><h2 class="tuile-promo__titre">Quelle plaque pour quel mur ?</h2><p>Quatre questions, une recommandation précise.</p><a class="btn btn--action" href="quiz.html">Faire le quiz%s</a></li>""" % icone("fleche"))
        if i == 7:
            trip = "".join('<div class="plaque">%s</div>' % img_plaque(PRODUITS[s], f, "80px") for s, f in
                           (("lisard", "noir"), ("lours", "noir"), ("la-marmotte", "noir")))
            cartes.append("""<li class="tuile-promo tuile-promo--trip" data-promo><div class="trip__mini" aria-hidden="true">%s</div><p class="surtitre">Lot de trois</p><h2 class="tuile-promo__titre">Le Triptyque</h2><p><strong>%s</strong> les trois plaques au choix.</p><p class="petit">%s</p><a class="lien-fleche" href="triptyque.html">Composer%s</a></li>"""
                          % (trip, prix(PRIX_TRIPTYQUE), valider("remise de 10 %"), icone("fleche")))
    contenu = """
<div class="wrap">
  <header class="tete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li aria-current="page">Boutique</li></ol></nav>
    <h1>Toutes les plaques</h1>
    <p class="chapo">Douze modèles en aluminium découpé au laser et thermolaqué, 60 × 30 cm. <strong>65 € la plaque</strong>, quels que soient le modèle et la finition.</p>
  </header>
  <div class="filtres">
    <div class="puces" role="group" aria-label="Filtrer par thème">%s</div>
    <div class="filtres__droite">
      <div class="voir-en" role="group" aria-label="Afficher toutes les plaques en"><span aria-hidden="true">Voir en</span>%s</div>
      <div class="tri"><label for="tri">Trier</label><select id="tri"><option value="atelier">Ordre de l’atelier</option><option value="best">Meilleures ventes d’abord</option><option value="nom">Nom, de A à Z</option><option value="avis">Les plus commentées</option></select></div>
    </div>
  </div>
  <div class="compte-ligne"><p class="compte" data-compte aria-live="polite">%d articles</p><p class="petit attenue">« Meilleure vente » : étiquette reprise du site actuel. %s</p></div>
  <ul class="grille-cartes grille-cartes--collection" data-grille>%s</ul>
</div>
<section class="section wrap">
  <ul class="bandeau-garanties">
    <li>%s<span><strong>Livraison en 2 à 4 jours ouvrés</strong> après l’expédition, à titre indicatif</span></li>
    <li>%s<span><strong>Livraison offerte dès 130 € d’articles livrés</strong>, soit deux plaques, hors carte cadeau %s</span></li>
    <li>%s<span><strong>14 jours pour vous rétracter</strong>, comme le prévoit la loi</span></li>
    <li>%s<span><strong>Série limitée</strong>, numéro gravé au dos</span></li>
  </ul>
</section>""" % ("".join(puces), voir, len(CATALOGUE), confirmer("ventes réelles"), "".join(cartes), icone("camion"), icone("camion"), valider(), icone("retour"), ico_num())
    page("collection.html", "Boutique : toutes les plaques · Terre Gravée",
         "Les douze plaques murales Terre Gravée en aluminium découpé : paysages, patrimoine et faune des Pyrénées, en noir, gris ou doré. 65 € la plaque.",
         contenu, actif="collection.html")


# ---------------------------------------------------------------- fiches produit

def schema_echelle(p, fin):
    rel = photo(p["slug"], fin)
    return """<svg class="echelle" viewBox="0 0 260 216" role="img" aria-labelledby="echelle-titre-%s">
  <title id="echelle-titre-%s">Schéma à l’échelle : la plaque de 60 × 30 cm au-dessus d’un canapé d’environ 2 m de large</title>
  <rect width="260" height="216" class="echelle__mur"/>
  <line x1="0" y1="196" x2="260" y2="196" class="echelle__sol"/>
  <g class="echelle__canape">
    <rect x="40" y="111" width="180" height="40" rx="5"/>
    <rect x="30" y="128" width="17" height="54" rx="5"/>
    <rect x="213" y="128" width="17" height="54" rx="5"/>
    <rect x="45" y="149" width="170" height="20" rx="4"/>
    <rect x="30" y="168" width="200" height="16" rx="3"/>
    <rect x="37" y="184" width="5" height="12"/><rect x="218" y="184" width="5" height="12"/>
  </g>
  <g data-echelle-photo><image href="%s%s" x="115" y="26" width="30" height="60" preserveAspectRatio="xMidYMid meet" class="echelle__plaque" data-echelle-img/></g>
  <g data-echelle-vide style="display:none"><rect x="115" y="26" width="30" height="60" class="echelle__vide"/><text x="130" y="58" text-anchor="middle" class="echelle__petit">photo</text></g>
  <g class="echelle__cote">
    <line x1="115" y1="17" x2="145" y2="17"/><line x1="115" y1="13" x2="115" y2="21"/><line x1="145" y1="13" x2="145" y2="21"/>
    <text x="130" y="11" text-anchor="middle">30 cm</text>
    <line x1="153" y1="26" x2="153" y2="86"/><line x1="149" y1="26" x2="157" y2="26"/><line x1="149" y1="86" x2="157" y2="86"/>
    <text x="159" y="59">60 cm</text>
    <line x1="30" y1="206" x2="230" y2="206"/><line x1="30" y1="202" x2="30" y2="210"/><line x1="230" y1="202" x2="230" y2="210"/>
    <rect x="104" y="200" width="52" height="12" class="echelle__fond-txt"/>
    <text x="130" y="209.5" text-anchor="middle">env. 200 cm</text>
  </g>
</svg>""" % (p["slug"], p["slug"], IMG, rel)


def bloc_avis_produit(p):
    nb = len(p["avis"])
    if nb:
        m = moyenne(p)
        tete = ('<div class="resume-avis resume-avis--fiche"><p class="note-geante">%s<span>/5</span></p><div>%s<p>%d avis sur ce modèle</p></div></div>'
                % (note_fr(m), etoiles(m), nb))
        liste = '<ul class="grille-avis grille-avis--fiche">%s</ul>' % "".join(citation(dict(a, produit=p["slug"]), "avis--4", lien=False) for a in p["avis"])
        autres = ""
    else:
        tete = ('<div class="resume-avis resume-avis--fiche"><p>Pas encore d’avis sur ce modèle. Sur l’ensemble de la boutique : '
                '<strong>%s/5</strong> sur %d avis.</p></div>' % (note_fr(MOYENNE), NB_AVIS))
        liste = ""
        autres_avis = [a for a in TOUS_AVIS if a["produit"] != p["slug"]][:3]
        autres = ('<h3 class="sous-titre">Avis sur d’autres plaques</h3><ul class="grille-avis grille-avis--fiche">%s</ul>'
                  % "".join(citation(a, "avis--4") for a in autres_avis))
    return tete + mention_avis() + liste + autres


def associes(p):
    meme = [x for x in PLAQUES if x["collection"] == p["collection"] and x["slug"] != p["slug"]]
    autres = [x for x in PLAQUES if x["best"] and x not in meme and x["slug"] != p["slug"]]
    return (meme + autres)[:3]


def trio_mini(p, fin):
    autres = [x for x in associes(p)][:2]
    plaques = [(p, fin)] + [(x, fin_defaut(x, fin)) for x in autres]
    return "".join('<div class="plaque">%s</div>' % img_plaque(x, f, "50px") for x, f in plaques)


def option_cable(prefixe="cable", legende="Sortie du câble"):
    opts = "".join('<label class="cable__opt cable__opt--%s"><input type="radio" name="%s" value="%s"%s><span>%s</span></label>'
                   % (k, prefixe, n, " checked" if k == "bd" else "", n) for k, n in CABLES)
    return ('<fieldset class="cable" data-cable><legend>%s <span class="petit">(vue de face)</span> %s</legend>'
            '<div class="cable__plan"><span class="cable__plaque" aria-hidden="true"></span>%s</div></fieldset>'
            % (legende, confirmer("sens de la vue"), opts))


def fiche_plaque(p):
    slug = p["slug"]
    fin0 = fin_defaut(p)
    nb = len(p["avis"])
    m = moyenne(p)
    scenes, vignettes = [], []
    for f, n, a in FINITIONS:
        cache = "" if f == fin0 else " hidden"
        if a_photo(slug, f):
            corps = ('<figure class="cotes cotes--fiche"><div class="plaque plaque--fiche">%s</div><span class="cote cote--h"><span>30 cm</span></span>'
                     '<span class="cote cote--v"><span>60 cm</span></span></figure>'
                     % img_plaque(p, f, "(max-width: 900px) 42vw, 250px", eager=(f == fin0)))
            vw, vh = dims(photo(slug, f))
            vign = '<img src="%s%s" alt="" width="%d" height="%d" loading="lazy" decoding="async">' % (IMG, photo(slug, f), vw, vh)
        else:
            corps = '<div class="cotes cotes--fiche"><div class="plaque plaque--fiche">%s</div></div>' % vide_plaque(p, f)
            vign = '<span class="vignette__vide" aria-hidden="true"></span>'
        scenes.append('<div class="scene" data-scene="%s"%s>%s</div>' % (f, cache, corps))
        vignettes.append('<button type="button" class="vignette" data-vue="%s" aria-pressed="%s">%s<span>%s</span></button>'
                         % (f, "true" if f == fin0 else "false", vign, n))
    if p["decor"]:
        scenes.append('<div class="scene scene--photo" data-scene="situation" hidden><figure>%s<figcaption>Mise en situation</figcaption></figure></div>'
                      % img(p["decor"], "Mise en situation de la plaque %s dans un intérieur" % p["nom"], "(max-width: 900px) 92vw, 640px"))
        v_src, v_w, v_h = petite(p["decor"].replace("-1200", "-640"))
        vignettes.append('<button type="button" class="vignette vignette--photo" data-vue="situation" aria-pressed="false"><img src="%s" alt="" width="%d" height="%d" loading="lazy" decoding="async"><span>En situation</span></button>'
                         % (v_src, v_w, v_h))
    scenes.append('<div class="scene scene--echelle" data-scene="echelle" hidden><figure>%s<figcaption>Schéma à l’échelle, pour juger de la taille</figcaption></figure></div>' % schema_echelle(p, fin0))
    vignettes.append('<button type="button" class="vignette vignette--echelle" data-vue="echelle" aria-pressed="false"><span class="vignette__echelle" aria-hidden="true"></span><span>À l’échelle</span></button>')

    radios = []
    for f, n, a in FINITIONS:
        info = '<span class="fin-opt__info">photo à venir</span>' if not a_photo(slug, f) else ""
        radios.append('<label class="fin-opt"><input type="radio" name="finition" value="%s"%s><span class="fin-opt__pastille pastille--%s" aria-hidden="true"></span><span class="fin-opt__nom">%s</span>%s</label>'
                      % (f, " checked" if f == fin0 else "", f, n, info))
    if nb:
        note = ('<a class="achat__avis" href="#avis">%s<span>%s/5</span><span class="attenue">· %d avis sur ce modèle</span></a>'
                % (etoiles(m), note_fr(m), nb))
    else:
        note = ('<a class="achat__avis" href="#avis"><span class="attenue">Pas encore d’avis sur ce modèle · boutique : %s/5 sur %d avis</span></a>'
                % (note_fr(MOYENNE), NB_AVIS))
    titre_hist, textes_hist = HISTOIRES.get(slug, (p["titre_histoire"], p["histoire"]))
    histoire = "".join("<p>%s</p>" % e(x) for x in textes_hist)
    lien = ('<p><a class="lien-fleche" href="%s">%s%s</a></p>' % (e(p["lien"]["url"]), e(p["lien"]["label"]), icone("fleche"))) if p["lien"] else ""
    if p["decor"]:
        figure = '<figure class="histoire__fig">%s<figcaption>Mise en situation</figcaption></figure>' % img(
            p["decor"], "Mise en situation de la plaque %s" % p["nom"], "(max-width: 900px) 92vw, 480px")
    else:
        figure = ('<figure class="histoire__fig histoire__fig--vide"><div class="plaque-vide plaque-vide--large"><span class="plaque-vide__mot">Mise en situation à venir</span>%s</div></figure>'
                  % fournir("photo de mise en situation"))
    fins_barre = "".join('<button type="button" class="pastille pastille--%s" data-barre-fin="%s" aria-pressed="%s" title="%s"><span class="sr">Finition %s</span></button>'
                         % (f, f, "true" if f == fin0 else "false", n, n.lower()) for f, n, _ in FINITIONS)
    assoc = "".join(carte(x, titre="h3") for x in associes(p))
    contenu = """
<div class="wrap">
  <nav aria-label="Fil d’Ariane" class="ariane-fiche"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html">Boutique</a></li><li><a href="collection.html#%s">%s</a></li><li aria-current="page">%s</li></ol></nav>
  <div class="fiche" data-fiche data-slug="%s" data-type="plaque" data-prix="%d">
    <div class="galerie">
      <div class="galerie__scene">%s</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues de la plaque">%s</div>
    </div>
    <div class="achat">
      <p class="achat__cartel">%s</p>
      <h1 class="achat__titre">%s</h1>
      %s
      <p class="achat__serie">%sSérie limitée, numéro gravé au dos %s</p>
      <div class="achat__prix"><p><strong data-prix-unitaire>65 €</strong> <span>TTC · TVA non applicable (art. 293 B du CGI)</span></p><p class="petit">ou en 4 fois sans frais avec PayPal, soit 4 × 16,25 €, sous réserve d’acceptation par PayPal</p></div>
      <fieldset class="choix-fin"><legend>Finition : <strong data-fin-nom>%s</strong></legend><div class="choix-fin__liste">%s</div></fieldset>
      <div class="option-led">
        <label class="option-led__case"><input type="checkbox" data-option-led>%s<span class="option-led__txt"><strong>Ajouter le kit LED, monté par l’atelier</strong><small>Ruban RGB, télécommande et alimentation USB (adaptateur secteur non fourni).</small></span><span class="option-led__prix">+15 €</span></label>
        <div data-bloc-cable hidden>%s</div>
      </div>
      <details class="option-cadeau">
        <summary>%sC’est pour offrir ?</summary>
        <div class="option-cadeau__corps">
          <label class="coche"><input type="checkbox" data-cadeau-prix> <span>Masquer les prix sur le bon de livraison</span></label>
          <label class="champ"><span>Message joint au colis (facultatif)</span><textarea rows="2" maxlength="200" data-cadeau-message></textarea></label>
          <p class="petit">%s Vous hésitez sur le modèle ? <a href="produit-carte-cadeau.html">La carte cadeau</a> vaut une plaque au choix.</p>
        </div>
      </details>
      <p class="achat__total">Total : <output data-total>65 €</output> <span class="attenue">TTC, hors frais de port</span></p>
      <div class="achat__action">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une plaque">−</button><input type="number" id="qte" min="1" max="9" value="1" inputmode="numeric" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter une plaque">+</button></div>
        <button type="button" class="btn btn--action btn--large" data-ajouter>%sAjouter au panier</button>
      </div>
      <div class="livraison-fiche">
        <p data-livraison-fiche>Livraison offerte dès 130 € d’articles livrés : il manquera 65 € avec cette plaque.</p>
        %s
        <p class="petit">%s Frais de port selon le poids et la destination, affichés avant validation. %s</p>
        <div class="livraison-fiche__date">%s<p><span data-estimation>Livraison en 2 à 4 jours ouvrés après l’expédition, à titre indicatif.</span> %s</p></div>
      </div>
      %s
      <div class="objections"><h2 class="objections__titre">Vos questions avant d’acheter</h2>%s<p class="petit"><a href="contact.html">Une autre question ? Écrivez-nous</a></p></div>
    </div>
  </div>
</div>

<section class="section section--neige" aria-labelledby="titre-histoire">
  <div class="wrap histoire">
    <div class="histoire__texte">
      <p class="surtitre">L’histoire du modèle</p>
      <h2 id="titre-histoire">%s</h2>
      %s
      %s
      <dl class="caracs">
        <div><dt>Format</dt><dd>60 × 30 cm, épaisseur 2 mm</dd></div>
        <div><dt>Matière</dt><dd>Aluminium découpé au laser, thermolaqué</dd></div>
        <div><dt>Finitions</dt><dd>Noir, gris ou doré, même prix</dd></div>
        <div><dt>Fixation</dt><dd>2 fixations adhésives 3M Command™ fournies, sans perçage</dd></div>
        <div><dt>Usage</dt><dd>Intérieur et extérieur</dd></div>
        <div><dt>Édition</dt><dd>Série limitée, numéro gravé au dos</dd></div>
        <div><dt>Titre</dt><dd>Lettrage pochoir découpé dans la plaque</dd></div>
      </dl>
    </div>
    %s
  </div>
</section>

<section class="section wrap" aria-labelledby="titre-fab">
  <div class="tete-section"><div><p class="surtitre">Fabrication</p><h2 id="titre-fab">Découpée à Revel (31), thermolaquée et expédiée à Bagnères-de-Bigorre (65)</h2></div></div>
  %s
</section>

<section class="section section--neige" id="avis" aria-labelledby="titre-avis-fiche">
  <div class="wrap">
    <div class="tete-section"><div><p class="surtitre">Avis</p><h2 id="titre-avis-fiche">Avis sur %s</h2></div></div>
    %s
  </div>
</section>

<section class="section wrap" aria-labelledby="titre-assoc">
  <div class="tete-section"><div><p class="surtitre">%s</p><h2 id="titre-assoc">À associer</h2></div><a class="lien-fleche" href="collection.html">Toute la boutique%s</a></div>
  <ul class="grille-cartes grille-cartes--assoc">%s
    <li class="tuile-promo tuile-promo--trip"><div class="trip__mini" aria-hidden="true">%s</div><p class="surtitre">Lot de trois</p><h3 class="tuile-promo__titre">Un Triptyque avec %s</h3><p>Ajoutez deux lieux : <strong>%s</strong> les trois.</p><p class="petit">%s</p><a class="btn btn--ligne" href="triptyque.html#t=%s-%s">Composer%s</a></li>
  </ul>
</section>
""" % (
        p["collection"], NOM_COLL[p["collection"]], e(p["nom"]),
        slug, PRIX_PLAQUE,
        "".join(scenes), "".join(vignettes),
        cartel(p), e(p["nom"]), note,
        balise(), fournir("taille de la série"),
        NOM_FIN[fin0], "".join(radios),
        img("led/led-img1.webp", "Exemple réel : Le Pic du Midi rétroéclairé en vert", "44px", "option-led__photo"),
        option_cable(),
        icone("cadeau"), valider("options cadeau"),
        icone("panier"),
        jauge_livraison(), valider("seuil de 130 €"), fournir("tarifs de port"),
        icone("camion"), confirmer("délai de préparation"),
        rassurance(), faq_objections(),
        e(titre_hist), histoire, lien, figure,
        chemin_fabrication(compact=True),
        e(p["nom"]), bloc_avis_produit(p),
        NOM_COLL[p["collection"]], icone("fleche"), assoc,
        trio_mini(p, fin0), e(p["nom"]), prix(PRIX_TRIPTYQUE), valider("remise de 10 %"), slug, fin0, icone("fleche"),
    )
    barre = """<div class="barre-achat" data-barre>
  <div class="barre-achat__in">
    <div class="barre-achat__produit"><strong>%s</strong><div class="pastilles" role="group" aria-label="Finition">%s</div></div>
    <p class="barre-achat__prix"><span class="sr">Total : </span><strong data-total>65 €</strong><small data-barre-led hidden>avec kit LED</small></p>
    <button type="button" class="btn btn--action" data-ajouter>Ajouter</button>
  </div>
</div>""" % (e(p["nom"]), fins_barre)
    jsonld = {
        "@context": "https://schema.org", "@type": "Product", "name": p["nom"],
        "brand": {"@type": "Brand", "name": "Terre Gravée"},
        "description": textes_hist[0] if textes_hist else "", "material": "Aluminium thermolaqué",
        "width": {"@type": "QuantitativeValue", "value": 30, "unitCode": "CMT"},
        "height": {"@type": "QuantitativeValue", "value": 60, "unitCode": "CMT"},
        "offers": {"@type": "Offer", "price": "65.00", "priceCurrency": "EUR", "url": p["url_actuelle"]},
    }
    if nb:
        jsonld["aggregateRating"] = {"@type": "AggregateRating", "ratingValue": note_fr(m).replace(",", "."), "reviewCount": nb}
    page("produit-%s.html" % slug, "%s, plaque murale en aluminium · Terre Gravée" % p["nom"],
         "Plaque murale %s en aluminium découpé au laser, 60 × 30 cm, noir, gris ou doré. 65 €, kit LED en option, série limitée numérotée." % p["nom"],
         contenu, jsonld=jsonld, classe="page-fiche", apres=barre)


def fiche_led(p):
    vues = [("led-img0", "Plaque L’Ours rétroéclairée en bleu", "Bleu"), ("led-img1", "Plaque Le Pic du Midi rétroéclairée en vert", "Vert"),
            ("led-img2", "Ruban LED collé au dos d’une plaque", "Au dos"), ("led-img3", "Télécommande infrarouge du kit LED", "Télécommande")]
    scenes = "".join('<div class="scene scene--photo" data-scene="%s"%s><figure>%s</figure></div>'
                     % (k, "" if i == 0 else " hidden", img("led/%s.webp" % k, alt, "(max-width: 900px) 92vw, 600px", eager=(i == 0)))
                     for i, (k, alt, _) in enumerate(vues))
    vignettes = "".join('<button type="button" class="vignette vignette--photo" data-vue="%s" aria-pressed="%s"><img src="%s" alt="" width="%d" height="%d" loading="lazy" decoding="async"><span>%s</span></button>'
                        % ((k, "true" if i == 0 else "false") + petite("led/%s.webp" % k) + (n,)) for i, (k, _, n) in enumerate(vues))
    etapes = [
        ("tuto/tuto-2.webp", "Décollement progressif de la bande adhésive du ruban", "Coller le ruban", "Nettoyez le dos de la plaque. Collez le ruban le long du contour en commençant côté raccord Pico, en décollant la bande adhésive petit à petit."),
        ("tuto/tuto-4.webp", "Ruban LED formant un arrondi dans un angle", "Passer les angles", "Formez un arrondi doux dans chaque angle, sans pli brusque."),
        ("tuto/tuto-5.webp", "Découpe du ruban LED sur une zone de coupe", "Ajuster la longueur", "Coupez l’excédent uniquement sur une zone de coupe, repérée par un petit espace doré."),
        ("tuto/tuto-6.webp", "Branchement du raccord Pico", "Raccorder", "Branchez le raccord Pico dans le sens des flèches."),
        ("tuto/tuto-7.webp", "Télécommande du kit LED", "Régler", "Télécommande ou application : couleur, intensité, minuteur et effets."),
    ]
    tuto = "".join('<li class="tuto__etape"><figure>%s</figure><h3>%s</h3><p>%s</p></li>' % (img(r, alt, "(max-width: 640px) 80vw, 220px"), t, d)
                   for r, alt, t, d in etapes)
    assoc = "".join(carte(PRODUITS[s]) for s in ("le-pic-du-midi", "lours", "lisard", "la-tour-des-jacobins"))
    contenu = """
<div class="wrap">
  <nav aria-label="Fil d’Ariane" class="ariane-fiche"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Kit LED</li></ol></nav>
  <div class="fiche" data-fiche data-slug="led" data-type="led" data-prix="%d">
    <div class="galerie">
      <div class="galerie__scene galerie__scene--photo">%s</div>
      <div class="galerie__vignettes" role="group" aria-label="Photos du kit">%s</div>
    </div>
    <div class="achat">
      <p class="achat__cartel">Option rétroéclairage</p>
      <h1 class="achat__titre">Kit LED</h1>
      <p class="achat__conseil">Le plus simple : cochez « kit LED » sur la fiche de votre plaque. L’atelier le monte au dos avant l’envoi.</p>
      <div class="achat__prix"><p><strong data-prix-unitaire>15 €</strong> <span>TTC · TVA non applicable (art. 293 B du CGI)</span></p></div>
      %s
      <p class="petit">Commandé avec une plaque, le kit est monté au dos par l’atelier, câble à la sortie choisie. Commandé seul, vous le posez vous-même avec la notice ci-dessous.</p>
      <p class="achat__total">Total : <output data-total>15 €</output> <span class="attenue">TTC, hors frais de port</span></p>
      <div class="achat__action">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer un kit">−</button><input type="number" id="qte" min="1" max="9" value="1" inputmode="numeric" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter un kit">+</button></div>
        <button type="button" class="btn btn--action btn--large" data-ajouter>%sAjouter au panier</button>
      </div>
      <dl class="caracs caracs--fiche">
        <div><dt>Ruban</dt><dd>LED RGB autocollant, raccord Pico, contrôleur intégré. Longueur %s</dd></div>
        <div><dt>Commande</dt><dd>Télécommande infrarouge et application smartphone (QR code dans le pack)</dd></div>
        <div><dt>Réglages</dt><dd>Couleur, intensité, minuteur, effets</dd></div>
        <div><dt>Alimentation</dt><dd>USB, adaptateur secteur non fourni</dd></div>
        <div><dt>Origine</dt><dd>Non fabriqué en France, choisi pour sa compatibilité avec nos plaques</dd></div>
      </dl>
      <p class="petit">Vous pouvez aussi utiliser un autre ruban : nos plaques acceptent la plupart des rubans LED du marché.</p>
      %s
    </div>
  </div>
</div>
<section class="section section--neige" aria-labelledby="titre-tuto">
  <div class="wrap">
    <div class="tete-section"><div><p class="surtitre">Notice</p><h2 id="titre-tuto">Poser le kit vous-même</h2></div><p class="tete-section__aide">Commandé avec une plaque, le kit arrive déjà monté. Seul, il se pose en cinq étapes.</p></div>
    <div class="tuto">
      <figure class="tuto__contenu">%s<figcaption><strong>Le contenu du kit</strong><span>Ruban LED RGB autocollant avec raccord Pico et contrôleur intégré, télécommande infrarouge, alimentation USB (adaptateur secteur non fourni) et QR code de l’application.</span></figcaption></figure>
      <ol class="tuto__etapes">%s</ol>
    </div>
  </div>
</section>
<section class="section wrap" aria-labelledby="titre-assoc">
  <div class="tete-section"><div><p class="surtitre">Avec une plaque</p><h2 id="titre-assoc">Le kit monté par l’atelier</h2></div><a class="lien-fleche" href="collection.html">Toutes les plaques%s</a></div>
  <ul class="grille-cartes grille-cartes--assoc">%s</ul>
</section>
""" % (PRIX_LED, scenes, vignettes, option_cable(), icone("panier"), confirmer("2 m sur la fiche actuelle, 1,5 m sur la notice"),
       rassurance(quatre_fois=False), img("tuto/tuto-0.webp", "Contenu du kit LED : ruban enroulé, boîtier, télécommande", "(max-width: 900px) 92vw, 420px"),
       tuto, icone("fleche"), assoc)
    barre = """<div class="barre-achat" data-barre><div class="barre-achat__in"><div class="barre-achat__produit"><strong>Kit LED</strong></div><p class="barre-achat__prix"><span class="sr">Total : </span><strong data-total>15 €</strong></p><button type="button" class="btn btn--action" data-ajouter>Ajouter</button></div></div>"""
    page("produit-led.html", "Kit LED pour plaque murale · Terre Gravée",
         "Kit LED RGB pour rétroéclairer une plaque Terre Gravée : télécommande, application, alimentation USB. Monté par l’atelier avec une plaque. 15 €.",
         contenu, classe="page-fiche", apres=barre,
         jsonld={"@context": "https://schema.org", "@type": "Product", "name": "Kit LED Terre Gravée", "brand": {"@type": "Brand", "name": "Terre Gravée"},
                 "offers": {"@type": "Offer", "price": "15.00", "priceCurrency": "EUR", "url": p["url_actuelle"]}})


def fiche_carte(p):
    assoc = "".join(carte(PRODUITS[s]) for s in ("le-pic-du-midi", "la-tour-des-jacobins", "lours", "lisard"))
    contenu = """
<div class="wrap">
  <nav aria-label="Fil d’Ariane" class="ariane-fiche"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">Carte cadeau</li></ol></nav>
  <div class="fiche" data-fiche data-slug="carte-cadeau" data-type="carte" data-prix="%d">
    <div class="galerie">
      <div class="galerie__scene galerie__scene--carte"><div class="scene" data-scene="carte"><figure class="carte-visuel">%s<figcaption><span data-carte-apercu-nom>Pour vous</span><span data-carte-apercu-montant>65 €</span></figcaption></figure></div></div>
    </div>
    <div class="achat">
      <p class="achat__cartel">Idée cadeau · valable sur tous les modèles</p>
      <h1 class="achat__titre">Carte cadeau</h1>
      <p class="achat__conseil">Elle vaut une plaque, au choix de la personne qui la reçoit. Envoi immédiat par e-mail, ou à imprimer chez vous.</p>
      <div class="achat__prix"><p><strong data-prix-unitaire>65 €</strong> <span>TTC · TVA non applicable (art. 293 B du CGI)</span></p></div>
      <fieldset class="choix-montant"><legend>Montant</legend>
        <label class="montant-opt"><input type="radio" name="montant" value="65" checked><span><strong>65 €</strong>Une plaque au choix</span></label>
        <label class="montant-opt"><input type="radio" name="montant" value="80"><span><strong>80 €</strong>Une plaque et son kit LED</span></label>
        <p class="petit">%s</p>
      </fieldset>
      <fieldset class="choix-envoi"><legend>Envoi</legend>
        <label class="coche"><input type="radio" name="envoi" value="email" checked> <span>Par e-mail, envoi immédiat</span></label>
        <label class="coche"><input type="radio" name="envoi" value="imprimer"> <span>À imprimer chez vous</span></label>
      </fieldset>
      <div class="champs-carte">
        <label class="champ"><span>Prénom de la personne (facultatif)</span><input type="text" data-carte-nom maxlength="40" autocomplete="off"></label>
        <label class="champ"><span>Votre message (facultatif)</span><textarea rows="3" maxlength="200" data-carte-message></textarea></label>
      </div>
      <p class="achat__total">Total : <output data-total>65 €</output> <span class="attenue">TTC, sans frais de port</span></p>
      <div class="achat__action">
        <button type="button" class="btn btn--action btn--large btn--plein" data-ajouter>%sAjouter au panier</button>
      </div>
      <dl class="caracs caracs--fiche">
        <div><dt>Valeur</dt><dd>Une plaque au choix, sur tous les modèles disponibles</dd></div>
        <div><dt>Envoi</dt><dd>Immédiat par e-mail, ou à imprimer</dd></div>
        <div><dt>Validité</dt><dd>%s</dd></div>
        <div><dt>Frais d’envoi</dt><dd>Aucun : envoi par e-mail ou à imprimer. Non prise en compte dans le seuil de livraison offerte des plaques %s</dd></div>
      </dl>
      <p class="petit">Pour Noël : la carte part par e-mail jusqu’au 24 décembre, même après la date limite de commande des plaques. <a href="noel.html">Voir le guide cadeaux</a></p>
    </div>
  </div>
</div>
<section class="section section--neige" aria-labelledby="titre-assoc">
  <div class="wrap">
    <div class="tete-section"><div><p class="surtitre">Vous préférez choisir ?</p><h2 id="titre-assoc">Les modèles à offrir</h2></div><a class="lien-fleche" href="quiz.html">Faire le quiz à sa place%s</a></div>
    <ul class="grille-cartes grille-cartes--assoc">%s</ul>
  </div>
</section>
""" % (p["prix"], img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, couleur cuivre, avec le logo et le slogan", "(max-width: 900px) 80vw, 480px", eager=True),
       valider("montant de 80 €"), icone("panier"), fournir("durée de validité"), valider("règle proposée"), icone("fleche"), assoc)
    page("produit-carte-cadeau.html", "Carte cadeau · Terre Gravée",
         "Carte cadeau Terre Gravée : elle vaut une plaque au choix sur tous les modèles. Envoi immédiat par e-mail ou à imprimer. 65 €.",
         contenu, classe="page-fiche",
         jsonld={"@context": "https://schema.org", "@type": "Product", "name": "Carte cadeau Terre Gravée", "brand": {"@type": "Brand", "name": "Terre Gravée"},
                 "offers": {"@type": "Offer", "price": "65.00", "priceCurrency": "EUR", "url": p["url_actuelle"]}})


# ---------------------------------------------------------------- quiz

def svg_piece(nom):
    dessins = {
        "salon": '<path d="M8 30v-8a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v8 M5 26a3 3 0 0 1 6 0v6h26v-6a3 3 0 0 1 6 0v10H5Z M9 36v3 M39 36v3"/>',
        "chambre": '<path d="M5 34V12 M5 26h38v8 M43 34v4 M5 34v4 M5 20h12a4 4 0 0 1 4 4v2 M21 22h16a6 6 0 0 1 6 6"/>',
        "bureau": '<path d="M4 22h40 M8 22v18 M40 22v18 M28 22v10h12 M14 22v-6h10v6 M33 8l4 6-6 2 M31 16l-2 6"/>',
        "entree": '<path d="M12 42V6h22v36 M8 42h32 M29 25h2 M16 10h14v28"/>',
        "exterieur": '<path d="M24 6v4 M24 30v4 M10 20H6 M42 20h-4 M14 10l2.8 2.8 M34 10l-2.8 2.8 M24 26a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M4 42h40 M8 42v-6 M16 42v-6 M24 42v-6 M32 42v-6 M40 42v-6 M6 37h36"/>',
        "offrir": '<path d="M8 20h32v20H8z M6 14h36v6H6z M24 14v26 M24 14c-3-6-11-7-11-2 0 2 4 2 11 2Zm0 0c3-6 11-7 11-2 0 2-4 2-11 2Z"/>',
    }
    return ('<svg class="choix__ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" '
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % dessins[nom])


def quiz():
    def opt(nom, val, libelle, visuel, detail=""):
        det = '<small>%s</small>' % detail if detail else ""
        return ('<label class="choix"><input type="radio" name="%s" value="%s"><span class="choix__visuel">%s</span>'
                '<span class="choix__txt"><strong>%s</strong>%s</span></label>' % (nom, val, visuel, libelle, det))

    def mur(couleur, classe=""):
        return '<span class="mur %s" style="--mur:%s"><span class="mur__plaque"></span></span>' % (classe, couleur)

    def mini(slug, fin):
        return '<span class="choix__plaque"><span class="plaque">%s</span></span>' % img_plaque(PRODUITS[slug], fin, "70px")

    nsp = '<span class="choix__nsp" aria-hidden="true">?</span>'
    q1 = "".join([opt("piece", "salon", "Salon ou séjour", svg_piece("salon")), opt("piece", "chambre", "Chambre", svg_piece("chambre")),
                  opt("piece", "bureau", "Bureau", svg_piece("bureau")), opt("piece", "entree", "Entrée ou couloir", svg_piece("entree")),
                  opt("piece", "exterieur", "Dehors", svg_piece("exterieur"), "Terrasse, façade, abri"),
                  opt("piece", "offrir", "C’est pour offrir", svg_piece("offrir"), "Je ne connais pas la pièce")])
    q2 = "".join([opt("mur", "clair", "Blanc ou très clair", mur("#F6F5F1")), opt("mur", "gris", "Gris ou béton", mur("#B7BBBF")),
                  opt("mur", "fonce", "Foncé", mur("#1F3350", "mur--fonce"), "Bleu nuit, vert, noir"),
                  opt("mur", "bois", "Bois ou pierre", mur("#B98D5F", "mur--bois")), opt("mur", "nsp", "Je ne sais pas", mur("#E6E9EE", "mur--nsp"))])
    q3 = "".join([opt("theme", "sommets", "Les sommets et grands sites", mini("le-pic-du-midi", "noir"), "Pic du Midi, Montaigu, cirque de Gavarnie…"),
                  opt("theme", "patrimoine", "Les vieilles pierres", mini("le-chateau-de-mauvezin", "noir"), "Tour, château, abbaye"),
                  opt("theme", "faune", "Les animaux", mini("lisard", "gris"), "Isard, ours, cerf, marmotte"),
                  opt("theme", "velo", "Le vélo", mini("le-tourmalet", "gris"), "Le col du Tourmalet"),
                  opt("theme", "bagneres", "Bagnères-de-Bigorre", mini("la-tour-des-jacobins", "dore"), "La ville et ses alentours"),
                  opt("theme", "nsp", "Je ne sais pas", nsp, "Montrez-moi une sélection")])
    q4 = "".join([opt("lumiere", "oui", "Oui, qu’elle s’allume", '<span class="choix__photo">%s</span>' % img("led/led-img1.webp", "", "140px"), "Kit LED monté par l’atelier, +15 €"),
                  opt("lumiere", "non", "Non, la découpe suffit", mini("lours", "noir"), "Les ombres font le travail"),
                  opt("lumiere", "nsp", "Je ne sais pas encore", nsp, "Je déciderai plus tard")])
    questions = [
        ("piece", "Où va la plaque ?", "La pièce oriente le choix du sujet.", q1),
        ("mur", "De quelle couleur est le mur ?", "La couleur du mur décide de la finition.", q2),
        ("theme", "Qu’est-ce qui vous ressemble ?", "Choisissez ce qui vous parle le plus.", q3),
        ("lumiere", "Et le soir, de la lumière ?", "Le kit LED se colle au dos de la plaque et éclaire le mur.", q4),
    ]
    etapes = "".join('<li><button type="button" class="quiz-etape" data-aller="%d" aria-current="%s" disabled><span class="barre-balise" aria-hidden="true"></span><span class="quiz-etape__num">%d</span><span class="quiz-etape__nom">%s</span><span class="quiz-etape__rep" data-rep="%s"></span></button></li>'
                     % (i, "step" if i == 0 else "false", i + 1, n, k)
                     for i, (k, n) in enumerate([("piece", "Pièce"), ("mur", "Mur"), ("theme", "Thème"), ("lumiere", "Lumière")]))
    blocs = "".join('<fieldset class="quiz__question" data-question="%d"><legend><span class="quiz__compteur">Question %d sur 4</span><span class="quiz__intitule">%s</span></legend><p class="quiz__aide">%s</p><div class="quiz__choix quiz__choix--%s">%s</div></fieldset>'
                    % (i, i + 1, titre, aide, k, choix) for i, (k, titre, aide, choix) in enumerate(questions))
    contenu = """
<div class="wrap">
  <header class="tete-page tete-page--quiz">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li aria-current="page">Quiz</li></ol></nav>
    <h1>Quelle plaque pour quel mur ?</h1>
    <p class="chapo">Quatre questions, une recommandation précise : le modèle, la finition et le prix total. Aucun e-mail n’est demandé pour voir le résultat.</p>
  </header>
  <div class="quiz-zone">
    <form class="quiz" data-quiz novalidate aria-label="Quiz en quatre questions">
      <ol class="quiz-etapes" aria-label="Progression">%s</ol>
      <div class="quiz__questions">%s</div>
      <p class="quiz__erreur" data-quiz-erreur role="alert" hidden>Choisissez une réponse pour continuer, ou « Je ne sais pas ».</p>
      <div class="quiz__nav">
        <button type="button" class="btn btn--ligne" data-quiz-retour>Retour</button>
        <button type="button" class="btn btn--action" data-quiz-suivant>Question suivante%s</button>
      </div>
      <p class="petit quiz__memo">Vos réponses restent dans ce navigateur. Vous pouvez revenir sur chaque question.</p>
    </form>
    <section class="quiz-resultat" data-quiz-resultat hidden aria-labelledby="titre-resultat" tabindex="-1">
      <div class="resultat">
        <div class="resultat__visuel" data-res-visuel></div>
        <div class="resultat__texte">
          <p class="surtitre" data-res-surtitre>Notre recommandation</p>
          <h2 id="titre-resultat" data-res-titre>Votre plaque</h2>
          <p class="resultat__options" data-res-options></p>
          <div class="resultat__pourquoi"><h3>Pourquoi ce choix</h3><ul data-res-pourquoi></ul></div>
          <div data-res-led-option></div>
          <p class="resultat__total">Total : <output data-res-total>65 €</output> <span class="attenue" data-res-port>TTC, hors frais de port</span></p>
          <div class="resultat__actions">
            <button type="button" class="btn btn--action btn--large" data-res-ajouter>%sTout ajouter au panier</button>
            <a class="btn btn--ligne" href="collection.html" data-res-fiche>Voir la fiche</a>
          </div>
          <p class="resultat__refaire"><button type="button" class="lien-bouton" data-res-modifier>Modifier mes réponses</button> · <button type="button" class="lien-bouton" data-res-recommencer>Recommencer</button></p>
        </div>
      </div>
      <div class="resultat__alternatives">
        <h3 class="sous-titre">Deux autres pistes</h3>
        <ul class="grille-cartes grille-cartes--alt" data-res-alternatives></ul>
      </div>
      <div class="resultat__garder">
        <div class="resultat__partage">
          <h3>Garder ce résultat</h3>
          <p class="petit">Ce lien rouvre votre recommandation, à envoyer à qui vous voulez.</p>
          <div class="partage"><label class="sr" for="lien-resultat">Lien du résultat</label><input id="lien-resultat" type="text" readonly data-res-lien><button type="button" class="btn btn--ligne" data-copier-champ="lien-resultat" data-repli="Lien sélectionné, copiez-le">%sCopier</button></div>
        </div>
        <form class="resultat__email" data-demo novalidate>
          <h3>Recevoir ma sélection par e-mail</h3>
          <p class="petit">Facultatif. Nous envoyons le résultat une fois, sans autre usage.</p>
          <div class="champ"><label for="email-quiz">Adresse e-mail</label><input id="email-quiz" type="email" autocomplete="email" placeholder="prenom@exemple.fr"><small><a href="%s">Confidentialité</a></small></div>
          <label class="coche"><input type="checkbox" name="lettre"> <span>Je souhaite aussi recevoir la lettre de Terre Gravée (sorties de plaques exclusives). Désinscription en un clic.</span></label>
          <button type="submit" class="btn btn--nuit">Recevoir ma sélection</button>
          <p class="message-demo" role="status" hidden>Maquette : rien n’est envoyé.</p>
        </form>
      </div>
    </section>
  </div>
</div>
<section class="section section--neige" aria-labelledby="titre-quiz-info">
  <div class="wrap trio-infos">
    <h2 id="titre-quiz-info" class="sr">Bon à savoir</h2>
    <div>%s<h3>Même prix partout</h3><p>65 € la plaque, quels que soient le modèle et la finition. Le kit LED ajoute 15 €.</p></div>
    <div>%s<h3>Pose sans perçage</h3><p>Deux fixations adhésives 3M Command™ sont livrées avec chaque plaque.</p></div>
    <div>%s<h3>Pour offrir</h3><p>Pas sûr de ses goûts ? La <a href="produit-carte-cadeau.html">carte cadeau</a> vaut une plaque au choix.</p></div>
  </div>
</section>
""" % (etapes, blocs, icone("fleche"), icone("panier"), icone("copier"), MENTIONS, icone("check"), icone("check"), icone("cadeau"))
    page("quiz.html", "Quiz : quelle plaque pour quel mur ? · Terre Gravée",
         "Quatre questions sur votre pièce, votre mur et vos goûts pour trouver la plaque Terre Gravée qui vous va : modèle, finition, kit LED et prix total.",
         contenu, actif="quiz.html", classe="page-quiz")


# ---------------------------------------------------------------- noël

def noel():
    def profil(ancre, surtitre, titre, texte, slugs, avis_auteurs, extra="", fins=None, tuile=""):
        fins = fins or {}
        cartes = "".join(carte(PRODUITS[s], fins.get(s)) for s in slugs) + tuile
        cits = [a for a in TOUS_AVIS if a["auteur"] in avis_auteurs]
        cit = ""
        if cits:
            cit = '<ul class="profil__avis">%s</ul>' % "".join(citation(a, "avis--profil", rappel=True) for a in cits)
        return """<section class="profil" id="%s" aria-labelledby="titre-%s">
  <div class="profil__tete">
    <p class="surtitre">%s</p>
    <h2 id="titre-%s">%s</h2>
    <p>%s</p>
    <p class="profil__budget"><span>65 € la plaque</span><span>80 € avec le kit LED</span></p>
    %s
  </div>
  <div class="profil__corps"><ul class="grille-cartes grille-cartes--profil">%s</ul>%s</div>
</section>""" % (ancre, ancre, surtitre, ancre, titre, texte, extra, cartes, cit)

    trio_rando = (("le-cirque-de-gavarnie", "noir"), ("le-pont-despagne", "noir"), ("lisard", "noir"))
    tuile_rando = ('<li class="tuile-promo tuile-promo--trip"><div class="trip__mini" aria-hidden="true">%s</div><p class="surtitre">Lot de trois</p><h3 class="tuile-promo__titre">Gavarnie, le Pont d’Espagne et l’isard</h3><p>Les trois en Triptyque : %s.</p><p class="petit">%s</p><a class="lien-fleche" href="triptyque.html#t=%s">Composer%s</a></li>'
                   % ("".join('<div class="plaque">%s</div>' % img_plaque(PRODUITS[s], f, "50px") for s, f in trio_rando),
                      prix(PRIX_TRIPTYQUE), valider("remise de 10 %"), ",".join("%s-%s" % sf for sf in trio_rando), icone("fleche")))
    rando = profil("randonneur", "Sentiers et grands sites", "Pour un randonneur",
                   "Des lieux qu’on rejoint à pied : le cirque de Gavarnie, classé au patrimoine mondial de l’UNESCO, et le Pont d’Espagne à Cauterets. L’isard, qu’on croise en altitude, complète le Triptyque.",
                   ["le-cirque-de-gavarnie", "le-pont-despagne"], ["Marie"], tuile=tuile_rando)
    tuile_led = ('<li class="tuile-promo tuile-promo--led"><div class="tuile-promo__photo">%s</div><p class="surtitre">Option · +15 €</p><h3 class="tuile-promo__titre">Qu’elle s’allume le soir</h3><p>Cochez le kit LED sur la fiche : l’atelier le monte au dos avant l’envoi.</p><a class="lien-fleche" href="produit-led.html">Voir le kit LED%s</a></li>'
                 % (img("led/led-img1.webp", "Plaque Le Pic du Midi rétroéclairée en vert", "200px"), icone("fleche")))
    velo = profil("cycliste", "Col mythique", "Pour un cycliste",
                  "Le col du Tourmalet culmine à 2 115 m. Ceux qui l’ont monté s’en souviennent longtemps.",
                  ["le-tourmalet", "le-pic-du-midi"], ["Jerome D."], fins={"le-tourmalet": "gris"}, tuile=tuile_led)
    tuile_trip = ('<li class="tuile-promo tuile-promo--trip"><div class="trip__mini" aria-hidden="true">%s</div><p class="surtitre">Lot de trois</p><h3 class="tuile-promo__titre">Bagnères en Triptyque</h3><p>La tour, le Pic et un troisième lieu au choix : %s les trois.</p><p class="petit">%s</p><a class="lien-fleche" href="triptyque.html#t=la-tour-des-jacobins-dore,le-pic-du-midi-dore">Composer%s</a></li>'
                  % ("".join('<div class="plaque">%s</div>' % img_plaque(PRODUITS[s], f, "50px") for s, f in (("la-tour-des-jacobins", "dore"), ("le-pic-du-midi", "dore"))),
                     prix(PRIX_TRIPTYQUE), valider("remise de 10 %"), icone("fleche")))
    bagneres = profil("bagneres", "La ville et son Pic", "Pour un amoureux de Bagnères",
                      "La tour des Jacobins, monument historique de Bagnères-de-Bigorre, et le Pic du Midi de Bigorre, 2 877 m.",
                      ["la-tour-des-jacobins", "le-pic-du-midi"], ["Greg 65"], fins={"la-tour-des-jacobins": "dore", "le-pic-du-midi": "dore"}, tuile=tuile_trip)
    aquensis = ('<figure class="profil__photo">%s<figcaption>Les panneaux conçus pour Aquensis, à Bagnères-de-Bigorre : nos plaques en sont nées. %s</figcaption></figure>'
                % (img("misc/aquensis.webp", "Bassin du centre thermal Aquensis avec la rangée de panneaux découpés et rétroéclairés conçus pour le centre", "(max-width: 900px) 92vw, 420px"),
                   accord_aquensis()))
    curiste = profil("curiste", "Vu à Aquensis", "Pour un curiste",
                     "Deux avis racontent avoir découvert nos plaques à Aquensis, le centre thermal de Bagnères-de-Bigorre, ou pendant une cure.",
                     ["la-marmotte", "lours"], ["Sophia P.", "Anto 65"], extra=aquensis, tuile=tuile_led)
    indecis = """<section class="profil profil--indecis" id="indecis" aria-labelledby="titre-indecis">
  <div class="profil__tete">
    <p class="surtitre">Carte cadeau</p>
    <h2 id="titre-indecis">Pour quelqu’un dont vous ignorez les goûts</h2>
    <p>La carte cadeau vaut une plaque au choix, sur tous les modèles disponibles. Elle part tout de suite par e-mail, ou vous l’imprimez.</p>
    <p class="profil__budget"><span>65 € la carte</span></p>
  </div>
  <div class="profil__corps profil__corps--carte">
    <figure class="carte-visuel carte-visuel--petit">%s</figure>
    <div class="profil__carte-txt">
      <h3>Carte cadeau</h3>
      <p>Envoi immédiat par e-mail jusqu’au 24 décembre, même après la date limite des plaques.</p>
      <div class="profil__actions"><button type="button" class="btn btn--action" data-ajout-carte-cadeau>%sAjouter la carte, 65 €</button><a class="btn btn--ligne" href="produit-carte-cadeau.html">Personnaliser le message</a></div>
      <p class="petit">Ou <a href="quiz.html">répondez au quiz à sa place</a> : quatre questions suffisent.</p>
    </div>
  </div>
</section>""" % (img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée, couleur cuivre", "(max-width: 900px) 70vw, 280px"), icone("panier"))
    chips = "".join('<li><a class="puce" href="#%s">%s</a></li>' % (a, n) for a, n in
                    (("randonneur", "Randonneur"), ("cycliste", "Cycliste"), ("bagneres", "Amoureux de Bagnères"), ("curiste", "Curiste"), ("indecis", "Indécis")))
    contenu = """
<div class="wrap">
  <header class="noel-tete">
    <div class="noel-tete__texte">
      <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li aria-current="page">Guide cadeaux</li></ol></nav>
      <p class="surtitre">Guide cadeaux · Noël 2026</p>
      <h1>Un cadeau qui vient d’ici</h1>
      <p class="chapo">Cinq profils, des plaques ou une carte cadeau pour chacun. Toutes les plaques sont à 65 €, découpées à Revel et thermolaquées à Bagnères-de-Bigorre.</p>
      <ul class="puces puces--profils" aria-label="Choisir un profil">%s</ul>
    </div>
    <aside class="date-cle" aria-labelledby="titre-date">
      %s
      <h2 id="titre-date">Pour recevoir avant Noël</h2>
      <p class="date-cle__date">Commandez au plus tard le <strong>%s</strong></p>
      <p class="petit">%s Elle dépend du stock et du délai de thermolaquage.</p>
      <p class="date-cle__apres">Après cette date, la <a href="produit-carte-cadeau.html">carte cadeau</a> part par e-mail jusqu’au 24 décembre.</p>
      <p class="petit">Livraison en 2 à 4 jours ouvrés après l’expédition, à titre indicatif. Nous vous prévenons en cas de retard.</p>
    </aside>
  </header>
  <div class="noel-calendrier" aria-labelledby="titre-calendrier">
    <h2 id="titre-calendrier" class="sous-titre">Le calendrier jusqu’à Noël</h2>
    <ol class="calendrier" data-calendrier>
      <li class="calendrier__point" style="--x:0%%"><span class="calendrier__date">1<sup>er</sup> nov.</span><span>Ouverture du guide</span>%s</li>
      <li class="calendrier__point" style="--x:47%%"><span class="calendrier__date">27 nov.</span><span>Black Friday : nos prix ne changent pas</span>%s</li>
      <li class="calendrier__point calendrier__point--fort" style="--x:79%%"><span class="calendrier__date">14 déc.</span><span>Dernier jour de commande conseillé</span>%s</li>
      <li class="calendrier__point" style="--x:100%%"><span class="calendrier__date">24 déc.</span><span>Dernières cartes cadeaux par e-mail</span></li>
    </ol>
    <p class="calendrier__ici" data-calendrier-ici hidden></p>
  </div>
  <div class="noel-avis">%s</div>
  %s
  %s
  %s
  %s
  %s
</div>
<section class="section section--neige" aria-labelledby="titre-services">
  <div class="wrap">
    <div class="tete-section"><div><p class="surtitre">Offrir sans souci</p><h2 id="titre-services">Ce qui est prévu pour les cadeaux</h2></div></div>
    <ul class="services">
      <li>%s<h3>Message et prix masqués</h3><p>Un message joint au colis et des prix masqués sur le bon de livraison.</p><p class="petit">%s</p></li>
      <li>%s<h3>Livraison chez la personne</h3><p>Indiquez son adresse comme adresse de livraison, et la vôtre pour la facture.</p><p class="petit">%s</p></li>
      <li>%s<h3>Retours après les fêtes</h3><p>Vous avez 14 jours après la réception du colis pour vous rétracter, comme le prévoit la loi. Nous proposons d’aller jusqu’au 15 janvier 2027 pour les cadeaux.</p><p class="petit">%s</p></li>
      <li>%s<h3>Trois plaques, un lot</h3><p>Le <a href="triptyque.html">Triptyque</a> : trois plaques au choix pour %s.</p><p class="petit">%s</p></li>
    </ul>
  </div>
</section>
<section class="section wrap" aria-labelledby="titre-faq-noel">
  <div class="tete-section"><div><p class="surtitre">Questions</p><h2 id="titre-faq-noel">Avant de commander pour Noël</h2></div></div>
  <div class="faq-liste">
    <details class="faq"><summary>Et si la plaque arrive en retard ?</summary><div class="faq__corps"><p>Le délai de 2 à 4 jours ouvrés après l’expédition est indicatif. En cas de retard, nous vous prévenons. Si la date est trop proche, la carte cadeau par e-mail reste possible jusqu’au 24 décembre.</p></div></details>
    <details class="faq"><summary>Puis-je ajouter le kit LED à un cadeau ?</summary><div class="faq__corps"><p>Oui. Cochez l’option sur la fiche de la plaque : l’atelier monte le ruban au dos avant l’envoi. Prévoyez un adaptateur secteur USB, non fourni.</p></div></details>
    <details class="faq"><summary>Et si le cadeau ne plaît pas ?</summary><div class="faq__corps"><p>Vous, l’acheteur, disposez de 14 jours à compter de la réception du colis par la personne pour vous rétracter, plaque dans son état d’origine, frais de retour à votre charge. Un échange n’est pas prévu par la loi. %s Avec la carte cadeau, la personne choisit elle-même son modèle.</p></div></details>
    <details class="faq"><summary>Faites-vous des remises pour le Black Friday ?</summary><div class="faq__corps"><p>Non : le prix reste 65 € toute l’année. Le seul lot proposé est le Triptyque. %s</p></div></details>
  </div>
</section>
""" % (chips, balise("balise balise--grande"), DATE_NOEL, valider("date proposée"),
       valider("date d’ouverture"), valider(), valider("date"),
       mention_avis(),
       rando, velo, bagneres, curiste, indecis,
       icone("cadeau"), valider("option à mettre en place"), icone("camion"), confirmer("adresse de livraison distincte dans WooCommerce"),
       icone("retour"), valider("retours prolongés jusqu’au 15 janvier"), icone("plus"), prix(PRIX_TRIPTYQUE), valider("remise de 10 %"),
       valider("échange à proposer ou non"),
       valider("politique Black Friday"))
    page("noel.html", "Guide cadeaux de Noël 2026 · Terre Gravée",
         "Idées cadeaux de Noël par profil : randonneur, cycliste, amoureux de Bagnères, curiste ou indécis. Plaques murales des Pyrénées à 65 € et carte cadeau.",
         contenu, actif="noel.html", classe="page-noel")


# ---------------------------------------------------------------- triptyque

def triptyque():
    choix = []
    for p in PLAQUES:
        f = fin_defaut(p)
        choix.append('<li><button type="button" class="pioche" data-pioche="%s" data-collection="%s">%s<span class="pioche__nom">%s</span></button></li>'
                     % (p["slug"], p["collection"], '<span class="plaque">%s</span>' % img_plaque(p, f, "80px"), e(p["nom"])))
    idees = [("Trois sommets", "le-pic-du-midi-noir,le-montaigu-noir,le-tourmalet-noir"),
             ("Faune", "lisard-noir,lours-noir,la-marmotte-noir"),
             ("Patrimoine", "la-tour-des-jacobins-dore,le-chateau-de-mauvezin-dore,labbaye-de-lescaladieu-gris"),
             ("Grands sites", "le-cirque-de-gavarnie-gris,le-pont-despagne-gris,le-pic-du-midi-gris")]
    boutons_idees = "".join('<li><button type="button" class="puce" data-idee="%s">%s</button></li>' % (v, n) for n, v in idees)
    emplacements = "".join("""<li class="emplacement" data-emplacement="%d">
  <button type="button" class="emplacement__plaque" data-choisir-emplacement="%d" aria-pressed="%s"><span class="emplacement__vide">Lieu %d<br><small>Choisissez ci-contre</small></span></button>
  <p class="emplacement__nom" data-emplacement-nom>À choisir</p>
  <div class="pastilles" role="group" aria-label="Finition du lieu %d">%s</div>
</li>""" % (i, i, "true" if i == 0 else "false", i + 1, i + 1,
            "".join('<button type="button" class="pastille pastille--%s" data-emp-fin="%s" aria-pressed="%s" title="%s"><span class="sr">%s</span></button>'
                    % (f, f, "true" if f == "noir" else "false", n, n) for f, n, _ in FINITIONS)) for i in range(3))
    filtres = "".join('<button type="button" class="puce" data-pioche-filtre="%s" aria-pressed="%s">%s</button>' % (k, "true" if k == "tout" else "false", n)
                      for k, n in (("tout", "Tout"), ("paysages", "Paysages"), ("patrimoine", "Patrimoine"), ("faune", "Faune")))
    contenu = """
<div class="wrap">
  <header class="tete-page tete-page--trip">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html">Boutique</a></li><li aria-current="page">Triptyque</li></ol></nav>
    <h1>Composez votre Triptyque</h1>
    <p class="chapo">Choisissez trois lieux. Les plaques s’alignent sur le mur et vous voyez l’ensemble avant de commander.</p>
    <p class="prix-trip"><strong>%s</strong> les trois plaques, soit %s la plaque au lieu de 65 €. %s</p>
  </header>
  <div class="compo" data-triptyque>
    <div class="compo__mur-zone">
      <div class="compo__mur">
        <ol class="emplacements" aria-label="Les trois plaques du Triptyque">%s</ol>
        <p class="compo__cote"><span>environ 110 cm de large avec 10 cm entre les plaques</span></p>
      </div>
      <div class="compo__resume">
        <label class="coche"><input type="checkbox" data-trip-meme> <span>Même finition pour les trois</span></label>
        <label class="coche"><input type="checkbox" data-trip-led> <span>Ajouter le kit LED aux trois plaques, monté par l’atelier (+45 €)</span></label>
        <div data-trip-cable hidden>%s</div>
        <p class="compo__total">Total : <output data-trip-total>%s</output> <span class="attenue" data-trip-detail>3 × 65 € = 195 €, remise de 10 %% : −19,50 €</span></p>
        <div class="compo__actions">
          <button type="button" class="btn btn--action btn--large" data-trip-ajouter disabled>%sAjouter les trois au panier</button>
          <button type="button" class="btn btn--ligne" data-trip-partager>%sCopier le lien</button>
        </div>
        <p class="petit" data-trip-aide>Choisissez encore 3 lieux.</p>
        <p class="petit">Les plaques restent en vente à l’unité. Dans le panier, chaque groupe de trois plaques forme un Triptyque.</p>
      </div>
    </div>
    <div class="compo__pioche">
      <h2 class="sous-titre">Des idées pour commencer</h2>
      <ul class="puces puces--idees">%s</ul>
      <h2 class="sous-titre">Choisissez <span data-trip-cible>le lieu 1</span></h2>
      <div class="puces" role="group" aria-label="Filtrer les lieux">%s</div>
      <ul class="pioches">%s</ul>
    </div>
  </div>
</div>
<section class="section section--neige" aria-labelledby="titre-trip-info">
  <div class="wrap trio-infos">
    <h2 id="titre-trip-info" class="sr">Bon à savoir</h2>
    <div>%s<h3>Expédiées ensemble</h3><p>Les trois plaques partent ensemble. %s La livraison est offerte dès 130 € d’articles livrés. %s</p></div>
    <div>%s<h3>Pose sans perçage</h3><p>Deux fixations 3M Command™ par plaque. Le décalage avec le mur dessine les ombres.</p></div>
    <div>%s<h3>Trois numéros</h3><p>Chaque plaque garde son numéro de série gravé au dos.</p></div>
  </div>
</section>
""" % (prix(PRIX_TRIPTYQUE), prix(PRIX_TRIPTYQUE / 3), valider("remise de 10 %"), emplacements, option_cable("cable-trip", "Sortie du câble"), prix(PRIX_TRIPTYQUE),
       icone("panier"), icone("copier"), boutons_idees, filtres, "".join(choix), icone("camion"), confirmer("envoi en un seul colis"), valider("seuil"), icone("check"), ico_num())
    page("triptyque.html", "Composer un Triptyque de trois plaques · Terre Gravée",
         "Composez un Triptyque : trois plaques murales Terre Gravée au choix, alignées sur votre mur. Aperçu en direct et prix du lot.",
         contenu, actif="triptyque.html", classe="page-trip")


# ---------------------------------------------------------------- sur mesure

def sur_mesure():
    options = "".join("<option>%s</option>" % e(p["nom"]) for p in PLAQUES)
    contenu = """
<div class="wrap">
  <header class="tete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li aria-current="page">Sur mesure</li></ol></nav>
    <h1>Sur mesure et séries</h1>
    <p class="chapo">Un modèle vous plaît, mais il le faut plus grand, dans une autre matière ou en plusieurs exemplaires ? Voici ce que l’atelier sait faire.</p>
  </header>
  <div class="bento-sm">
    <section class="case case--sm-adapter" aria-labelledby="titre-adapter">
      <div>
        <p class="surtitre">Dès une plaque</p>
        <h2 id="titre-adapter">Adapter un modèle existant</h2>
        <ul class="liste-coches">
          <li>%sUn autre format, jusqu’à 2 m × 1 m</li>
          <li>%sUne autre matière ou teinte : aluminium dans la teinte RAL de votre choix, acier Corten, aluminium brut</li>
          <li>%sUne autre fixation ou un autre support</li>
        </ul>
        <div class="grands-formats"><p><strong>Versions grand format de nos modèles</strong> : %s.</p><p>%s</p></div>
        <p class="petit">Selon faisabilité. Les pièces sur mesure sont exclues du droit de rétractation (art. L221-28, 3° du Code de la consommation). Elles bénéficient des garanties légales de conformité et des vices cachés.</p>
      </div>
      <div class="duo-metal">
        <figure><div class="plaque plaque--photo">%s</div><figcaption>Acier Corten</figcaption></figure>
        <figure><div class="plaque plaque--photo">%s</div><figcaption>Aluminium brut</figcaption></figure>
      </div>
    </section>
    <section class="case case--sm-exclu" aria-labelledby="titre-exclu">
      <figure>%s</figure>
      <div>
        <p class="surtitre">Très petite quantité</p>
        <h2 id="titre-exclu">Plaques exclusives</h2>
        <p>Des dessins inédits, pas encore dans la collection. Ils sortent ponctuellement, en très petite quantité, parfois en exemplaire unique.</p>
        <a class="lien-fleche" href="index.html#lettre">Être prévenu des sorties%s</a>
      </div>
    </section>
    <section class="case case--sm-pro" aria-labelledby="titre-pro">
      <div>
        <p class="surtitre">Villes, hôtels, entreprises, lieux culturels</p>
        <h2 id="titre-pro">Séries sur demande</h2>
        <ul class="liste-coches">
          <li>%sUne frise qui raconte une histoire locale</li>
          <li>%sDes grands formats pour une place, un hall ou un bureau</li>
          <li>%sDes plaques signalétiques au style artistique</li>
          <li>%sDes éditions spéciales pour un hôtel, une entreprise, un événement, un lieu touristique</li>
        </ul>
        <p class="sm-reference">Tout est parti d’un projet conçu pour Aquensis : des panneaux pour 30 niches de 1 m × 2 m. <a href="index.html#origine">Lire l’histoire</a> %s</p>
        <p class="petit">La quantité minimale dépend du projet.</p>
      </div>
      <div class="plaque-vide plaque-vide--pro"><span class="plaque-vide__mot">Photo d’une série professionnelle</span>%s</div>
    </section>
    <section class="case case--sm-non" aria-labelledby="titre-non">
      <h2 id="titre-non">Ce que nous ne faisons pas</h2>
      <p>Pas de pièce 100 %% personnalisée sur simple demande : prénom, citation ou photo. Chaque dessin suit la démarche de l’atelier.</p>
    </section>
  </div>
</div>
<section class="section section--neige" id="demande" aria-labelledby="titre-demande">
  <div class="wrap demande">
    <div>
      <p class="surtitre">Demande de devis</p>
      <h2 id="titre-demande">Décrivez votre projet</h2>
      <p>Plus la demande est précise, plus la réponse est rapide. Un croquis ou une photo aide beaucoup.</p>
      <p class="petit">Délai de réponse %s</p>
    </div>
    <form class="formulaire" data-demo novalidate>
      <div class="champs">
        <div class="champ"><label for="sm-type">Type de demande</label><select id="sm-type"><option>Adapter un modèle existant</option><option>Grand format</option><option>Plaque exclusive</option><option>Série pour un professionnel (ville, hôtel, entreprise)</option></select></div>
        <div class="champ"><label for="sm-modele">Modèle de départ</label><select id="sm-modele"><option>Aucun en particulier</option>%s</select></div>
        <div class="champ"><label for="sm-metal">Matière</label><select id="sm-metal"><option>Aluminium thermolaqué, teinte RAL</option><option>Acier Corten</option><option>Aluminium brut</option><option>Je ne sais pas encore</option></select></div>
        <div class="champ"><label for="sm-format">Format souhaité</label><input id="sm-format" type="text" placeholder="Par exemple 120 × 60 cm"><small>Jusqu’à 2 m × 1 m</small></div>
        <div class="champ"><label for="sm-qte">Quantité</label><input id="sm-qte" type="number" min="1" value="1" inputmode="numeric"></div>
        <div class="champ"><label for="sm-usage">Usage</label><select id="sm-usage"><option>Intérieur</option><option>Extérieur</option><option>Les deux</option></select></div>
        <div class="champ champ--large"><label for="sm-projet">Votre projet</label><textarea id="sm-projet" rows="4" placeholder="Lieu, support, délai souhaité"></textarea></div>
        <div class="champ champ--large champ--fichier"><span class="champ__titre">Croquis ou photo (facultatif)</span><div class="fichier"><input id="sm-fichier" class="fichier__input" type="file" accept="image/*,.pdf" aria-describedby="sm-fichier-nom"><label class="btn btn--ligne fichier__bouton" for="sm-fichier">Joindre un croquis ou une photo</label><span class="petit attenue" id="sm-fichier-nom" data-fichier-nom>Aucun fichier choisi</span></div></div>
        <div class="champ"><label for="sm-nom">Nom</label><input id="sm-nom" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="sm-email">E-mail</label><input id="sm-email" type="email" autocomplete="email" required></div>
      </div>
      <p class="petit">Vos coordonnées servent uniquement à répondre à cette demande. <a href="%s">Confidentialité</a></p>
      <button type="submit" class="btn btn--action">Envoyer la demande</button>
      <p class="message-demo" role="status" hidden>Maquette : rien n’est envoyé. Sur le site, la demande arrivera à contact@terregravee.fr.</p>
    </form>
  </div>
</section>
""" % (icone("check"), icone("check"), icone("check"), e(GRANDS_FORMATS), preparation("format exact à confirmer"),
       img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten", "(max-width: 900px) 40vw, 200px"),
       img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", "(max-width: 900px) 40vw, 200px"),
       img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits : sommets, fleurs et animaux des Pyrénées", "(max-width: 900px) 92vw, 520px"), icone("fleche"),
       icone("check"), icone("check"), icone("check"), icone("check"), accord_aquensis(),
       fournir("photo d’une série professionnelle"),
       fournir("délai de réponse habituel"), options, MENTIONS)
    page("sur-mesure.html", "Sur mesure et séries · Terre Gravée",
         "Plaques sur mesure : jusqu’à 2 × 1 m, aluminium RAL, acier Corten ou aluminium brut. Plaques exclusives et séries pour professionnels.",
         contenu, actif="sur-mesure.html")


# ---------------------------------------------------------------- page d’arrivée du QR code d’Aquensis

# Quatre plaques liées à Bagnères et à la Bigorre, avec ajout direct au panier.
QR_SELECTION = [("la-tour-des-jacobins", "dore"), ("le-pic-du-midi", "noir"), ("le-chateau-de-mauvezin", "noir"), ("lisard", "dore")]
# Quiz en un clic : une réponse, une plaque (hors des quatre ci-dessus), et une piste pour aller plus loin.
QR_CLIC = [
    ("montagnes", "Les montagnes", "le-cirque-de-gavarnie", "noir",
     "Le cirque de Gavarnie est classé au patrimoine mondial de l’UNESCO.",
     '<a href="triptyque.html#t=le-cirque-de-gavarnie-noir,le-pic-du-midi-noir,le-montaigu-noir">Avec Le Pic du Midi et Le Montaigu, en Triptyque</a>'),
    ("animaux", "Les animaux", "lours", "noir",
     "Un avis publié sur le site cite cette plaque après une visite à Aquensis.",
     '<a href="produit-la-marmotte.html">La Marmotte</a>, elle, a été vue pendant une cure, selon un autre avis.'),
    ("pierres", "Les vieilles pierres", "labbaye-de-lescaladieu", "noir",
     "L’abbaye cistercienne de l’Escaladieu se trouve à Bonnemazon, en Bigorre.",
     '<a href="triptyque.html#t=labbaye-de-lescaladieu-noir,la-tour-des-jacobins-dore,le-chateau-de-mauvezin-noir">Avec la tour et le château, en Triptyque</a>'),
    ("velo", "Le vélo", "le-tourmalet", "gris",
     "Le col du Tourmalet monte à 2 115 m. La plaque montre la route en lacets et trois cyclistes.",
     '<a href="produit-le-tourmalet.html">Avec le kit LED, +15 €</a> : la route s’éclaire le soir.'),
    ("offrir", "C’est pour offrir", "carte-cadeau", None,
     "La carte cadeau vaut une plaque : la personne choisit elle-même son modèle.",
     'Envoi immédiat par e-mail, ou à imprimer.'),
]


def qr():
    cartes = "".join(carte(PRODUITS[s], f, ordre=i, badge_ok=False) for i, (s, f) in enumerate(QR_SELECTION))
    boutons, resultats = [], []
    for cle, libelle, slug, fin, pourquoi, piste in QR_CLIC:
        p = PRODUITS[slug]
        if slug == "carte-cadeau":
            mini = '<span class="clic__mini clic__mini--carte">%s</span>' % img("misc/carte-cadeau.webp", "", "48px")
        else:
            mini = '<span class="clic__mini"><span class="plaque">%s</span></span>' % img_plaque(p, fin, "28px")
        boutons.append('<li><button type="button" class="clic__bouton" data-clic-choix="%s" data-clic-nom="%s" aria-pressed="false" aria-controls="clic-%s">%s<span>%s</span></button></li>'
                       % (cle, e(p["nom"]), cle, mini, e(libelle)))
        resultats.append('<div class="clic__res" id="clic-%s" data-clic-res="%s" hidden><ul class="grille-cartes grille-cartes--clic">%s</ul>'
                         '<div class="clic__txt"><p class="surtitre">Pour vous</p><h3 class="clic__nom">%s</h3><p>%s</p><p class="petit">%s</p></div></div>'
                         % (cle, cle, carte(p, fin, titre="h4", badge_ok=False), e(p["nom"]), e(pourquoi), piste))
    avis_aq = [a for a in TOUS_AVIS if a["auteur"] in ("Anto 65", "Sophia P.")]
    contenu = """
<div class="wrap">
  <header class="qr-tete">
    <div class="qr-tete__texte">
      <p class="qr-tete__note">%s</p>
      <p class="surtitre">Bienvenue</p>
      <h1>Vous venez d’Aquensis ?</h1>
      <p class="chapo">Les panneaux du centre thermal ont donné naissance à nos plaques : le patrimoine et la faune de la Bigorre, découpés dans l’aluminium. En 60 × 30 cm pour votre mur, posées sans perçage.</p>
      <div class="ticket">
        <p class="ticket__titre">Votre code de bienvenue</p>
        <p class="ticket__code"><span id="code-aquensis" class="ticket__mot">AQUENSIS</span><button type="button" class="btn btn--ligne ticket__copier" data-copier="code-aquensis" data-repli="Code sélectionné, copiez-le">%sCopier</button></p>
        <p class="ticket__valeur"><strong>Livraison offerte dès la première plaque.</strong> À saisir au moment de payer.</p>
        <p>%s</p>
      </div>
      <div class="qr-tete__actions">
        <a class="btn btn--action" href="#selection">Voir les plaques de Bigorre%s</a>
        <a class="btn btn--ligne" href="#un-clic">Trouver la mienne en un clic</a>
      </div>
      <p class="qr-tete__prix"><strong>65 €</strong> la plaque, en noir, gris ou doré, même prix pour toutes</p>
    </div>
    <figure class="qr-tete__photo">
      <div class="qr-tete__img">%s<span class="etiquette">Photo réelle</span></div>
      <figcaption>Les panneaux conçus pour Aquensis, au-dessus du bassin. Les visiteurs les ont adorés : nos plaques sont nées de là. <a href="index.html#origine">Notre histoire</a> %s</figcaption>
    </figure>
  </header>
</div>

<section class="section section--qr wrap" id="selection" aria-labelledby="titre-selection">
  <div class="tete-section">
    <div><p class="surtitre">Bagnères et la Bigorre</p><h2 id="titre-selection">Quatre plaques d’ici</h2></div>
    <p class="tete-section__aide">Touchez une pastille pour changer de finition, puis ajoutez au panier. Même prix pour les trois finitions.</p>
  </div>
  <ul class="grille-cartes grille-cartes--qr">%s</ul>
  <p class="qr-livraison">%s<span>Livraison offerte dès deux plaques, ou dès la première avec le code AQUENSIS. %s</span></p>
</section>

<section class="section section--neige" id="un-clic" aria-labelledby="titre-clic">
  <div class="wrap">
    <div class="tete-section">
      <div><p class="surtitre">Quiz en un clic</p><h2 id="titre-clic">Qu’est-ce qui vous parle le plus ?</h2></div>
      <p class="tete-section__aide">Une réponse, une plaque. Pour tenir compte de votre mur : <a href="quiz.html">le quiz en 4 questions</a>.</p>
    </div>
    <div class="clic" data-clic>
      <ul class="clic__choix" aria-label="Ce qui vous parle le plus">%s</ul>
      <div class="clic__resultats">
        <p class="clic__attente" data-clic-attente>Choisissez une réponse : la plaque proposée s’affiche ici, prête à ajouter au panier.</p>
        %s
      </div>
    </div>
  </div>
</section>

<section class="section wrap" aria-labelledby="titre-garanties-qr">
  <h2 id="titre-garanties-qr" class="sous-titre">Commander en confiance</h2>
  <ul class="bandeau-garanties">
    <li>%s<span><strong>Emballage renforcé</strong>, livraison en 2 à 4 jours ouvrés après l’expédition, à titre indicatif %s</span></li>
    <li>%s<span><strong>Paiement sécurisé</strong> par carte bancaire (Stripe), PayPal, Apple Pay ou Google Pay</span></li>
    <li>%s<span><strong>14 jours pour vous rétracter</strong> après réception, comme le prévoit la loi</span></li>
    <li>%s<span><strong>Garanties légales</strong> de conformité et des vices cachés. <a href="%s">Lire les CGV</a></span></li>
  </ul>
</section>

<section class="section section--neige" aria-labelledby="titre-avis-qr">
  <div class="wrap">
    <div class="tete-section"><div><p class="surtitre">Avis</p><h2 id="titre-avis-qr">Ils les ont vues à Bagnères</h2></div></div>
    %s
    <ul class="grille-avis grille-avis--fiche">%s</ul>
  </div>
</section>

<section class="section wrap">
  <div class="bandeau-sm"><div><p class="surtitre">Toute la collection</p><h2>Douze plaques des Pyrénées</h2><p>Sommets, patrimoine et faune, à 65 € la plaque.</p></div><a class="btn btn--ligne" href="collection.html">Voir les 12 plaques%s</a></div>
</section>
""" % (valider("page d’arrivée du QR code des panneaux de démonstration (vestiaires, sortie)"),
       icone("copier"), valider("code AQUENSIS, ou un code neutre comme BIGORRE, et livraison offerte dès la première plaque"), icone("fleche"),
       img("misc/aquensis.webp", "Bassin du centre thermal Aquensis : la rangée de panneaux découpés et rétroéclairés conçus pour le centre",
           "(max-width: 899px) 92vw, 560px", eager=True),
       accord_aquensis(),
       cartes, icone("camion"), valider("seuil et code"),
       "".join(boutons), "".join(resultats),
       icone("camion"), confirmer("emballage"), icone("cadenas"), icone("retour"), icone("bouclier"), CGV,
       mention_avis(), "".join(citation(a, "avis--4", rappel=True) for a in avis_aq),
       icone("fleche"))
    page("qr.html", "Vous venez d’Aquensis ? · Terre Gravée",
         "Vous avez vu les panneaux d’Aquensis ? Quatre plaques murales de Bagnères et de la Bigorre, un quiz en un clic et un code de bienvenue.",
         contenu, classe="page-qr")


# ---------------------------------------------------------------- contact

def contact():
    contenu = """
<div class="wrap">
  <header class="tete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li aria-current="page">Aide et contact</li></ol></nav>
    <h1>Aide et contact</h1>
    <p class="chapo">Une question sur une plaque, une commande ou un projet ? Romain vous répond.</p>
  </header>
  <div class="contact">
    <div class="case case--contact">
      <h2>Écrire à l’atelier</h2>
      <p class="contact__email"><span id="adresse-email">contact@terregravee.fr</span><button type="button" class="btn btn--ligne" data-copier="adresse-email" data-repli="Adresse sélectionnée, copiez-la">%sCopier</button></p>
      <p class="petit">Délai de réponse %s</p>
      <h2>Adresse de l’atelier</h2>
      <address>Terre Gravée<br>16 rue du Pic du Midi<br>65200 Gerde</address>
      <p class="petit">À côté de Bagnères-de-Bigorre. Visite de l’atelier %s</p>
    </div>
    <form class="formulaire case" data-demo novalidate>
      <h2>Formulaire</h2>
      <div class="champs">
        <div class="champ"><label for="c-nom">Nom</label><input id="c-nom" type="text" autocomplete="name" required></div>
        <div class="champ"><label for="c-email">E-mail</label><input id="c-email" type="email" autocomplete="email" required></div>
        <div class="champ champ--large"><label for="c-sujet">Sujet</label><select id="c-sujet"><option>Question sur une plaque</option><option>Suivi de commande</option><option>Retour ou rétractation</option><option>Sur mesure</option><option>Autre</option></select></div>
        <div class="champ champ--large"><label for="c-msg">Message</label><textarea id="c-msg" rows="5" required></textarea></div>
      </div>
      <p class="petit">Vos coordonnées servent uniquement à vous répondre. <a href="%s">Confidentialité</a></p>
      <button type="submit" class="btn btn--action">Envoyer</button>
      <p class="message-demo" role="status" hidden>Maquette : rien n’est envoyé.</p>
    </form>
  </div>
</div>
<section class="section section--neige" aria-labelledby="titre-aide">
  <div class="wrap aide">
    <h2 id="titre-aide" class="sr">Questions fréquentes</h2>
    <div class="aide__bloc" id="livraison">
      <h3>%sLivraison</h3>
      <p>Livraison en 2 à 4 jours ouvrés après l’expédition, à titre indicatif. Nous vous prévenons en cas de retard.</p>
      <p>Emballage renforcé : la plaque voyage dans une pochette en carton ondulé, entre des plaques de calage, dans une boîte en carton type livre au format A2. %s</p>
      <p>Les frais dépendent du poids et de la destination. Ils sont affichés avant la validation de la commande. %s</p>
      <p>Livraison offerte dès 130 € d’articles livrés (plaques et kits LED), soit deux plaques. La carte cadeau, envoyée par e-mail, n’entre pas dans ce calcul. %s</p>
    </div>
    <div class="aide__bloc" id="retours">
      <h3>%sRetours et rétractation</h3>
      <p>Vous avez 14 jours après réception pour vous rétracter sans justification. La plaque doit être dans son état d’origine. Les frais de retour sont à votre charge. Les pièces personnalisées sont exclues.</p>
      <p class="petit">Sur le site : un bouton « Renoncer au contrat ici » visible et accessible sans connexion pendant les 14 jours. %s</p>
    </div>
    <div class="aide__bloc">
      <h3>%sPaiement</h3>
      <p>Carte bancaire (Stripe), PayPal, y compris en 4 fois sans frais dès 20 € d’achat sous réserve d’acceptation par PayPal, Apple Pay et Google Pay. Prix TTC, TVA non applicable (art. 293 B du CGI).</p>
    </div>
    <div class="aide__bloc">
      <h3>%sGaranties</h3>
      <p>Vos achats bénéficient des garanties légales de conformité et des vices cachés. <a href="%s">Lire les conditions générales de vente</a></p>
      <p class="petit">Médiateur de la consommation : %s</p>
    </div>
    <div class="aide__bloc">
      <h3>%sKit LED</h3>
      <p>Commandé avec une plaque, le kit est monté au dos par l’atelier. Alimentation USB, adaptateur secteur non fourni. <a href="produit-led.html">Voir la notice</a></p>
    </div>
    <div class="aide__bloc" id="avis-gestion">
      <h3>%sComment nous gérons les avis</h3>
      <p>Les avis sont publiés sur le site sans vérification d’achat. Ils sont affichés du plus récent au plus ancien, avec leur date de publication et la note donnée.</p>
      <p>Date de l’expérience (achat ou réception) pour chaque avis : %s</p>
      <p>Contrepartie, délai de publication, durée de conservation, motifs de refus : %s Pour signaler un avis douteux, écrivez à contact@terregravee.fr.</p>
    </div>
  </div>
</section>
<section class="section wrap">
  <div class="bandeau-sm"><div><p class="surtitre">Créations spéciales</p><h2>Un projet sur mesure ?</h2><p>Grand format, acier Corten, série pour un lieu ou un événement.</p></div><a class="btn btn--ligne" href="sur-mesure.html">Voir le sur mesure%s</a></div>
</section>
""" % (icone("copier"), fournir("délai habituel"), confirmer("sur rendez-vous ou non"), MENTIONS,
       icone("camion"), confirmer("emballage utilisé aujourd’hui"), fournir("grille des tarifs"), valider("seuil"),
       icone("retour"), confirmer("obligation en vigueur depuis le 19 juin 2026, à vérifier avec un juriste"),
       icone("cadenas"), icone("bouclier"), CGV, fournir("nom et site"), icone("lampe"), icone("check"),
       fournir("dates d’achat ou de réception"), fournir("règles de modération"), icone("fleche"))
    page("contact.html", "Aide et contact · Terre Gravée",
         "Contacter l’atelier Terre Gravée à Gerde : e-mail, adresse, livraison, retours, paiement, garanties et gestion des avis.",
         contenu, actif="contact.html")


# ---------------------------------------------------------------- stratégie

def strategie():
    def src(url, nom):
        return '<a href="%s">%s</a>' % (url, nom)

    tendances = [
        ("Bento hiérarchisé", "L’accueil et la page sur mesure utilisent des cases de tailles différentes, ordonnées comme un tunnel sur mobile : héros, quiz, Noël pendant la campagne, preuve réelle, note et série, lot, option LED, retours.",
         "Le bento ne marche que si la taille des cases suit leur importance (%s). Il est devenu banal à cases égales (%s), d’où des tailles et des rayons volontairement inégaux."
         % (src("https://bubble.io/blog/web-design-trends/", "Bubble"), src("https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/", "Creative Boom"))),
        ("Blanc structurant, rouge du balisage", "Fond blanc pur, bleu nuit pour le texte, rouge réservé aux actions et aux repères de progression. Le motif blanc et rouge des sentiers de grande randonnée sert de système : étapes du quiz, jauge de livraison offerte, logo.",
         "Pantone a choisi un blanc, Cloud Dancer, pour 2026 (%s). Pour ne pas ressembler à tout le monde, le blanc est associé au rouge du balisage pyrénéen." % src("https://www.smithsonianmag.com/smart-news/pantones-color-of-the-year-for-2026-is-a-blank-canvas-called-cloud-dancer-or-in-other-words-white-180987805/", "Smithsonian")),
        ("Typographie", "Bricolage Grotesque en largeur 75 et graisses 700 à 800 pour les titres, Figtree pour le texte. Deux familles seulement.",
         "Bricolage Grotesque est très répandue sur les pages SaaS (%s) : la version étroite et grasse lui donne un air de panneau de sentier. Figtree est une linéale sobre (%s). <code>text-wrap: balance</code> sur les titres (%s)."
         % (src("https://www.afontfinder.com/blog/bricolage-grotesque-review", "A Font Finder"), src("https://www.gleamstudio.design/blog-post/font-trends-2026", "Gleam Studio"),
            src("https://web-platform-dx.github.io/web-features-explorer/features/text-wrap-balance/", "web-features"))),
        ("Commerce honnête", "Aucun compte à rebours, aucun faux stock, aucun prix barré. La seule rareté affichée est réelle : la série numérotée.",
         "La consultation européenne sur le futur Digital Fairness Act vise les comptes à rebours et les fausses raretés (%s)." % src("https://www.osborneclarke.com/insights/digital-fairness-act-unpacked-dark-patterns", "Osborne Clarke")),
        ("Interface discrète et rapide", "Filets fins, pas d’ombres lourdes, pas de <code>backdrop-filter</code>, aucune bibliothèque JavaScript. Images WebP avec dimensions.",
         "Le <code>backdrop-filter</code> coûte cher sur Android milieu de gamme et pose problème sous iOS 26 (%s, données d’agence ; %s, source faible). Objectifs Core Web Vitals : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 (%s)."
         % (src("https://dev.to/studiomeyer_io/web-design-trends-2026-what-actually-held-up-after-six-months-23p8", "StudioMeyer"), src("https://gist.github.com/alessiomaffeis/41224fad0df2bb722db13473091f0933", "gist"),
            src("https://web.dev/articles/vitals", "web.dev"))),
        ("Barre d’achat collante, seulement sur les fiches", "Sur téléphone, la barre apparaît quand le bouton principal sort de l’écran. Elle contient les finitions, le total et le bouton.",
         "Elle ne gagne que dans une minorité de tests, et seulement si elle permet de finir le choix (%s ; %s). Elle n’apparaît donc ni sur l’accueil ni sur la boutique." % (src("https://cleancommit.io/blog/sticky-add-to-cart-buttons/", "Cleancommit"), src("https://www.goodui.org/patterns/41", "GoodUI"))),
        ("Transitions entre pages, en bonus", "<code>@view-transition</code> activé hors mouvement réduit : fondu entre les pages sous Chrome, Edge et Safari 18.2, navigation normale ailleurs.",
         "Support des transitions entre documents (%s)." % src("https://web-platform-dx.github.io/web-features-explorer/features/cross-document-view-transitions/", "web-features")),
        ("Lisible par les machines", "Données structurées JSON-LD (Organization, Product, AggregateRating) et HTML sémantique.",
         "Structure lisible par les agents IA (%s). Les étoiles Google exigent des avis visibles et non rémunérés en secret (%s)." % (src("https://bubble.io/blog/web-design-trends/", "Bubble"), src("https://developers.google.com/search/docs/appearance/structured-data/review-snippet", "Google"))),
    ]
    techniques = [
        ("Vente guidée par quiz", "quiz.html, case de l’accueil, tuile dans la boutique, fiche carte cadeau",
         "Quand on ne sait pas ce qu’on préfère, trop de choix bloque l’achat (%s). Les utilisateurs sont particulièrement agacés quand on exige leurs coordonnées avant le résultat, et ils ajustent leurs réponses pour explorer (%s) ; des étapes visibles et un retour arrière sont recommandés (%s). Chiffres d’éditeur, preuve faible : 69 %% de complétion et panier plus élevé de 11 à 15 %% (%s)."
         % (src("https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual", "Chernev et al., 2015"), src("https://www.nngroup.com/articles/calculator-expectations/", "NN/g"), src("https://www.nngroup.com/articles/wizards/", "NN/g"), src("https://revenuehunt.com/state-of-product-recommendation-quizzes/", "RevenueHunt")),
         "La logique de recommandation (quel modèle pour quelles réponses), le texte de consentement, l’outil d’envoi de l’e-mail facultatif.",
         "Taux de démarrage, complétion par question, quiz vers ajout au panier, quiz vers commande, panier moyen des utilisateurs du quiz, taux d’acceptation de l’e-mail."),
        ("Bloc d’achat qui répond à côté du bouton", "Toutes les fiches produit",
         "64 %% des testeurs cherchent les frais de port sur la fiche (%s), 60 %% cherchent la politique de retour, et 67 %% des sites n’estiment pas le coût total près du bouton (%s). Les frais supplémentaires causent 40 %% des abandons de panier (%s)."
         % (src("https://baymard.com/blog/show-shipping-costs-on-product-pages", "Baymard"), src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard, 2026"), src("https://baymard.com/lists/cart-abandonment-rate", "Baymard")),
         "La grille des frais de port, le délai de préparation avant expédition (la date estimée en dépend).",
         "Taux d’ajout au panier, taux de sortie de la fiche, ouvertures de la FAQ, questions reçues avant achat."),
        ("Image à l’échelle", "Vue « À l’échelle » de chaque fiche : la plaque au-dessus d’un canapé, cotes 60 × 30 cm",
         "37 %% des sites n’ont pas d’image à l’échelle alors que 42 %% des utilisateurs jugent la taille sur les photos (%s). Les dimensions écrites et l’image de dimensions sont les aides les plus utiles en décoration (%s)."
         % (src("https://baymard.com/research-articles/current-state-ecommerce-product-page-ux", "Baymard"), src("https://baymard.com/research-articles/furniture-and-home-decor-quantitative-ux-insights-2026", "Baymard, 2026")),
         "Les proportions du schéma (canapé d’environ 2 m).", "Taux d’ajout au panier, retours pour cause de taille."),
        ("Livraison offerte dès 130 €", "Jauge dans le panier, message dynamique sous le bouton des fiches, bandeau de garanties",
         "Les seuils augmentent les ventes mais peuvent détruire la marge (%s). Le message « plus que X € » doit être près du bouton et dans le panier, pas seulement dans un bandeau (%s). 130 € correspond à deux plaques."
         % (src("https://ideas.repec.org/a/inm/ormksc/v25y2006i1p51-64.html", "Lewis, Singh et Fay, 2006"), src("https://baymard.com/blog/avoid-banners-only-free-shipping", "Baymard")),
         "Le seuil, la règle de calcul (articles livrés : plaques et kits LED, hors carte cadeau) et le coût réel du port pour 2 et 3 plaques.", "Part des paniers au-dessus du seuil, panier moyen, coût du port et marge nette par commande."),
        ("Lot Triptyque", "triptyque.html (composeur avec aperçu sur le mur), case de l’accueil, tuile boutique, fiches, panier",
         "Un lot à prix réduit agit surtout par la remise, et vendre aussi les plaques à l’unité convient quand les goûts varient (%s). Le contenu du lot doit être visible dès la vignette (%s). Displate met en avant un lot de trois (%s)."
         % (src("https://personal.eur.nl/stremersch/artikels/Strategic%20Bundling%20of%20Products%20and%20Prices%20A%20New%20Synthesis%20for%20Marketing.pdf", "Stremersch et Tellis, 2002"), src("https://baymard.com/research-articles/include-contents-quantities-list-item-sets-bundles", "Baymard"), src("https://displate.com/", "Displate")),
         "La remise de 10 % après calcul de marge. Le prix est affiché sans prix barré.", "Part des commandes en Triptyque, panier moyen, marge brute par commande."),
        ("Kit LED en vente croisée", "Case non cochée sur chaque fiche avec une photo réelle allumée, une seule suggestion dans le panier",
         "Peu de suggestions, pertinentes et expliquées, les accessoires utiles en premier (%s). Jamais d’option pré-cochée (%s)."
         % (src("https://baymard.com/blog/product-recommendations-cart", "Baymard"), src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g")),
         "La longueur exacte du ruban, le sens de lecture de la sortie du câble (vue de face ou de dos).", "Taux d’ajout du kit, passage du panier au paiement, retours et réclamations sur le kit."),
        ("Guide cadeaux de Noël par profil", "noel.html, case de l’accueil",
         "Selon le baromètre Havas Market réalisé avec YouGov (sondage des 6 et 7 octobre 2026 auprès de 1 004 Français), deux tiers des achats de Noël (66 %%) sont programmés avant le 1er décembre, et novembre concentre à lui seul 55 %% des intentions d’achat (%s). Afficher une date de livraison estimée rassure mieux qu’une vitesse (%s) ; la date limite de commande en est la déclinaison pour Noël."
         % (src("https://www.e-marketing.fr/retail-1095/noel-2026-budget-en-hausse-mais-des-achats-sous-forte-contrainte-175794", "e-marketing.fr"), src("https://baymard.com/blog/shipping-speed-vs-delivery-date", "Baymard")),
         "La date limite (au plus tard le lundi 14 décembre 2026 ; aucune date officielle La Poste 2026 trouvée), l’ouverture du guide le 1er novembre, les options cadeau, les retours prolongés au 15 janvier, la position « pas de remise » pour le Black Friday du 27 novembre.",
         "Trafic et conversion par profil, part du chiffre d’affaires avant le 1er décembre, commandes livrées après Noël."),
        ("Options cadeau sur la fiche et dans le panier", "« C’est pour offrir ? » sur chaque fiche, dans le panier et sur la page Noël",
         "80 %% des sites ne montrent pas les options cadeau sur la fiche ; les acheteurs veulent surtout masquer les prix et ajouter un message (%s)." % src("https://baymard.com/blog/gifting-flow", "Baymard"),
         "La faisabilité dans WooCommerce (message et bon de livraison sans prix).", "Part des commandes avec option cadeau."),
        ("Carte cadeau", "Fiche carte cadeau, guide de Noël, panier, quiz",
         "Au Royaume-Uni, 68 %% des utilisateurs de cartes cadeaux dépensent plus que leur valeur (%s, association professionnelle, preuve faible)." % src("https://www.paymentsjournal.com/gift-cards-lead-to-even-more-consumer-spending/", "GCVA via PaymentsJournal"),
         "Le montant de 80 € (plaque et kit), la durée de validité, et la règle proposée : la carte, envoyée par e-mail, n’entre pas dans le seuil de livraison offerte.", "Ventes de cartes après la date limite, taux d’utilisation, dépense au-delà de la carte."),
        ("Preuve sociale conforme", "Avis à côté du bouton et en bas de fiche, case de l’accueil, bento de 9 avis, photo réelle d’Aquensis",
         "Les premiers avis font l’essentiel de l’effet et la probabilité d’achat culmine entre 4,0 et 4,7 étoiles (%s) : on affiche donc le nombre, la répartition, les dates et l’avis à 4 étoiles. Montrer des avis mixtes (%s)."
         % (src("https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales", "Spiegel Research Center"), src("https://www.nngroup.com/articles/ecommerce-product-pages/", "NN/g")),
         "La mention de contrôle (aujourd’hui : sans vérification d’achat), la date de l’expérience (achat ou réception) de chaque avis, les règles de modération, des réponses aux avis.", "Clics vers les avis, nouveaux avis par mois, part d’avis avec photo."),
        ("Rareté honnête", "Mention « Série limitée, numéro gravé au dos » sur les fiches et l’accueil",
         "Un message « quantité limitée » persuade plus qu’un message « temps limité » (%s), à condition d’être vrai (%s)."
         % (src("https://experts.umn.edu/en/publications/scarcity-messages-a-consumer-competition-perspective/", "Aggarwal, Jun et Huh, 2011"), src("https://www.nngroup.com/articles/deceptive-patterns/", "NN/g")),
         "La taille de chaque série. Un compteur « exemplaire 18/50 » seulement s’il est relié au vrai stock.", "Vitesse d’épuisement des séries."),
        ("Lettre « être prévenu »", "Accueil, page sur mesure, case facultative du quiz",
         "Une inscription rapide qui dit ce que contient la lettre (%s). Chiffres d’éditeur : les alertes de disponibilité convertissent à 6,46 %% (%s). Consentement préalable, case non cochée (%s)."
         % (src("https://www.nngroup.com/articles/newsletters/", "NN/g"), src("https://www.omnisend.com/2026-ecommerce-marketing-report", "Omnisend"), src("https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique", "CNIL")),
         "Le jour de sortie (premier jeudi du mois), l’outil d’envoi et sa gestion des pixels de suivi.", "Taux d’inscription, conversion des alertes, désinscriptions."),
        ("Fabrication visible", "Le chemin d’une plaque sur l’accueil et les fiches",
         "Rendre le travail visible augmente la valeur perçue (%s). On écrit « découpé au laser », jamais « fait main ». Les fiches nomment les lieux réels plutôt que le rayon de 150 km." % src("https://ideas.repec.org/a/inm/ormnsc/v57y2011i9p1564-1579.html", "Buell et Norton, 2011"),
         "Les étapes et les lieux, et le centre du rayon de 150 km cité par l’atelier : Revel est à environ 155 km de Gerde à vol d’oiseau.", "Profondeur de lecture des fiches, taux de conversion."),
    ]
    # Idées de Romain (Contexte du business plan) : ce que le site prévoit, l’indicateur, ce qui reste à valider.
    idees = [
        ("Panneaux de démonstration à Aquensis, avec QR code",
         "Des panneaux petit format aux vestiaires et à la sortie, avec le prix affiché et le rappel qu’il existe d’autres modèles. "
         "Le QR code mène à <a href=\"qr.html\">qr.html</a>, déjà dans la maquette : « Vous venez d’Aquensis ? », quatre plaques de Bagnères et de la Bigorre "
         "avec ajout direct au panier, quiz en un clic, garanties et code de bienvenue AQUENSIS. Un QR code par emplacement, chacun avec son paramètre de suivi, "
         "par exemple <code>qr.html?utm_source=aquensis&amp;utm_medium=qr&amp;utm_content=vestiaires</code> (puis <code>sortie</code>). "
         "Le QR code du dossier Marketing devra pointer vers cette adresse.",
         "Visites issues du QR code, par emplacement ; ajouts au panier et commandes depuis qr.html ; commandes avec le code AQUENSIS.",
         "L’accord de la SEMETHERM pour poser les panneaux et citer le projet, et pour utiliser le nom Aquensis comme code ; sans cet accord, "
         "un code neutre (BIGORRE ou BIENVENUE). Le paramètre de suivi. La valeur proposée du code (livraison offerte dès la première plaque), "
         "à calculer avec le coût réel du port d’une plaque et à vérifier par rapport aux limites de remise du business plan. "
         "Variante dont vous connaissez le coût d’avance : le kit LED à prix réduit avec la première plaque, elle aussi à valider."),
        ("Commerçants et restaurants partenaires",
         "Une plaque offerte et exposée, avec un petit chevalet et son QR code (<code>utm_source</code> au nom du lieu). Sur le site, une liste « Où voir nos plaques », "
         "publiée seulement après accord de chaque lieu. La carte interactive de la version 1 peut l’afficher.",
         "Visites et commandes par lieu, rapportées au coût de la plaque offerte.",
         "La liste des lieux, la contrepartie, un accord écrit avec chacun."),
        ("Offices de tourisme et boutiques des grands sites",
         "Pour le téléphérique du Pic du Midi, les concept-stores ou les offices de tourisme : un espace « Revendeurs » sur la page sur mesure, avec une présentation, "
         "des photos en haute définition et un formulaire. Les conditions de revente restent hors du site, envoyées sur demande. Une page « Où acheter » une fois les dépôts signés.",
         "Demandes de revendeurs, commandes professionnelles, ventes par lieu.",
         "Les conditions de revente, le stock, le choix des lieux (Le Pic du Midi au téléphérique du Pic du Midi, par exemple)."),
        ("Événements : fête du château de Mauvezin, montée du col du Tourmalet",
         "Un bloc « Nous retrouver » avec les dates. Sur le stand, la même mécanique que qr.html : un QR code avec son paramètre, vers une page qui met en avant "
         "<a href=\"produit-le-chateau-de-mauvezin.html\">Le Château de Mauvezin</a> ou <a href=\"produit-le-tourmalet.html\">Le Tourmalet</a>.",
         "Visites et commandes pendant l’événement et la semaine suivante ; inscriptions à la lettre.",
         "La participation, les dates, l’emplacement du stand."),
        ("Grands formats pour la ville",
         "La page <a href=\"sur-mesure.html\">sur mesure</a> annonce les versions grand format en préparation (" + GRANDS_FORMATS + "), dont le format exact reste à confirmer, rappelle la référence d’Aquensis "
         "(des panneaux pour 30 niches de 1 m × 2 m) et propose « Grand format » dans le formulaire.",
         "Demandes de devis grand format, devis signés.",
         "Les formats, les prix sur devis, l’accord de la SEMETHERM pour citer la référence."),
        ("Offres aux professionnels : hôtels, entreprises",
         "La page sur mesure s’adresse désormais aux villes, hôtels et entreprises : frise, grands formats, éditions spéciales. Le formulaire a un type de demande dédié.",
         "Demandes professionnelles, taux de devis signés, montant moyen.",
         "L’offre (quantités, délais, personnalisation possible ou non) et la facturation."),
        ("Rétroéclairage",
         "Le kit LED existe déjà pour les plaques de 60 × 30 cm : sa <a href=\"produit-led.html\">fiche</a>, l’option sur chaque fiche produit, la suggestion du panier "
         "et la question « Lumière » du quiz. Pour les grands formats et les séries, la page sur mesure pourra proposer le rétroéclairage, comme pour les panneaux "
         "d’Aquensis, avec une case dans le formulaire de devis.",
         "Part des plaques vendues avec le kit LED ; demandes de devis avec rétroéclairage.",
         "La faisabilité et le prix du rétroéclairage sur les grands formats et les séries."),
        ("Thèmes sportifs : cols, rugby",
         "Un thème « Sport » dans la boutique et dans le quiz dès qu’il y aura plusieurs modèles (aujourd’hui Le Tourmalet et la réponse « Le vélo » du quiz). "
         "La lettre « être prévenu » peut demander les thèmes qui intéressent.",
         "Ventes du Tourmalet, inscriptions par thème, demandes reçues.",
         "Les modèles. Pour le rugby, ni logo ni nom de club sans licence : ce sont des marques déposées."),
        ("Autres faunes et flores",
         "La collection Faune réunit aujourd’hui " + EN_LETTRES.get(NB_FAUNE, str(NB_FAUNE)) + " animaux des Pyrénées. La planche des dessins inédits de la page sur mesure montre déjà des fleurs : "
         "chaque nouveau modèle passe par le bloc « Bientôt » et la lettre « être prévenu », puis un filtre « Flore » rejoint la boutique dès la première fleur.",
         "Ventes de la collection Faune, inscriptions à la lettre, demandes reçues pour une espèce ou une fleur.",
         "Les espèces et les fleurs retenues, les illustrations, le calendrier de sortie."),
        ("Autres territoires et grands sites : Mont-Saint-Michel, Étretat, Pont du Gard",
         "Une boutique organisée par territoire, les Pyrénées d’abord, avec une adresse par territoire. Avant de produire, la lettre « être prévenu » propose "
         "le choix du territoire pour mesurer la demande. La signature « Graver l’âme des territoires » s’y prête.",
         "Inscriptions par territoire, ventes du premier modèle hors Pyrénées.",
         "Le premier territoire, les illustrations, les droits sur l’image et le nom des sites : certains sont des marques déposées ou des domaines nationaux."),
        ("Emballage renforcé",
         "La FAQ des fiches produit (« Comment la plaque voyage-t-elle ? »), la page <a href=\"contact.html#livraison\">contact</a> et les garanties de "
         "<a href=\"qr.html\">qr.html</a> décrivent la boîte en carton type livre au format A2, la pochette en carton ondulé et les plaques de calage. "
         "Une photo du colis ouvert rassurerait davantage.",
         "Colis abîmés et retours pour casse ; avis qui parlent de l’emballage.",
         "Que cet emballage est bien celui utilisé aujourd’hui. Une photo du colis."),
    ]
    idees_html = "".join("""<li class="tech">
  <h3>%s</h3>
  <dl>
    <div><dt>Sur le site</dt><dd>%s</dd></div>
    <div><dt>Indicateur</dt><dd>%s</dd></div>
    <div><dt>À valider</dt><dd>%s</dd></div>
  </dl>
</li>""" % i for i in idees)
    palette = [
        ("Noir ardoise", "#2C2C2C", "Texte, en-tête, pied de page, contrastes", "Texte ardoise sur blanc cassé : 12,8:1. Texte blanc sur ardoise : 14:1."),
        ("Blanc cassé", "#F5F5F0", "Fond principal", "Fond de page : le texte noir ardoise y atteint 12,8:1."),
        ("Argent doux", "#D0D0D0", "Détails, bordures, icônes", "1,4:1 sur blanc cassé : décor seulement. Pour les bordures de champs, il faut 3:1 : un gris #7D7D78 (3,8:1)."),
        ("Vert sauge très pâle", "#DCE2D4", "Fonds de sections secondaires", "Texte noir ardoise sur sauge : 10,6:1."),
        ("Cuivre clair", "#CBAA88", "Boutons d’action, survol", "Texte blanc sur cuivre clair : 2,2:1, refusé. Texte noir ardoise : 6,4:1, conforme AA."),
    ]
    pal_html = "".join('<li class="pal"><span class="pal__pastille" style="background:%s" aria-hidden="true"></span><span class="pal__txt"><strong>%s</strong>'
                       '<code>%s</code><span>%s</span><small>%s</small></span></li>' % (h, n, h, r, c) for n, h, r, c in palette)
    adaptation = [
        ("Texte, en-tête, pied de page", "Bleu nuit #0E1D3A", "Noir ardoise #2C2C2C", "12,8:1 sur blanc cassé"),
        ("Fond principal", "Blanc pur #FFFFFF", "Blanc cassé #F5F5F0", "Les cartes produit restent blanches"),
        ("Sections secondaires, fond des photos", "Gris neige #F3F5F8", "Vert sauge #DCE2D4", "Texte ardoise : 10,6:1"),
        ("Filets et bordures", "Gris bleuté #D3DAE4", "Argent doux #D0D0D0 ; #7D7D78 pour les champs et pastilles", "3,8:1 pour les bordures utiles"),
        ("Bouton d’action", "Rouge #D0121F, texte blanc (5,5:1)", "Cuivre clair #CBAA88, texte noir ardoise ; survol #B8936C", "6,4:1 ; 4,9:1 au survol"),
        ("Texte ou lien cuivré", "Aucun", "Cuivre foncé #7E5A36", "5,6:1 sur blanc cassé ; le cuivre clair en texte (2:1) est refusé"),
        ("Texte atténué", "#4F5D78", "#5A5A55", "6,3:1 sur blanc cassé, 5,2:1 sur sauge"),
        ("Balisage : étapes, jauge, pied de page", "Blanc et rouge", "Blanc et cuivre clair, filet ardoise", "Décor"),
    ]
    adapt_html = "".join("<tr><th scope=\"row\">%s</th><td>%s</td><td>%s</td><td>%s</td></tr>" % r for r in adaptation)
    tend_html = "".join('<li class="strat-carte"><h3>%s</h3><p>%s</p><p class="strat-carte__source">%s</p></li>' % (t, a, b) for t, a, b in tendances)
    tech_html = "".join("""<li class="tech">
  <h3>%s</h3>
  <dl>
    <div><dt>Où</dt><dd>%s</dd></div>
    <div><dt>Pourquoi</dt><dd>%s</dd></div>
    <div><dt>À valider</dt><dd>%s</dd></div>
    <div><dt>Indicateurs</dt><dd>%s</dd></div>
  </dl>
</li>""" % t for t in techniques)
    pages_liste = [("index.html", "Accueil en bento hiérarchisé"), ("collection.html", "Boutique filtrable, ajout rapide"),
                   ("produit-le-pic-du-midi.html", "Fiche produit type"), ("produit-le-cerf.html", "Fiche avec une finition sans photo"),
                   ("produit-led.html", "Kit LED et notice"), ("produit-carte-cadeau.html", "Carte cadeau"),
                   ("quiz.html", "Page signature : quiz"), ("noel.html", "Page signature : guide de Noël"),
                   ("triptyque.html", "Composeur de Triptyque"), ("sur-mesure.html", "Sur mesure et séries"),
                   ("qr.html", "Page d’arrivée du QR code d’Aquensis"), ("contact.html", "Aide et contact")]
    pl = "".join('<li><a href="%s">%s</a><span>%s</span></li>' % (h, h, d) for h, d in pages_liste)
    contenu = """
<div class="wrap strat">
  <header class="tete-page">
    <nav aria-label="Fil d’Ariane"><ol class="ariane"><li><a href="index.html">Accueil</a></li><li aria-current="page">Stratégie</li></ol></nav>
    <p class="surtitre">Note pour Romain · 29 octobre 2026</p>
    <h1>Version 2 : la boutique qui convertit</h1>
    <p class="chapo">Cette version traite le site comme une boutique en vente directe. Chaque écran aide à choisir, rassure à côté du bouton et propose une raison honnête d’ajouter un article.</p>
  </header>

  <section class="strat-bloc" aria-labelledby="s-concept">
    <h2 id="s-concept">Le concept</h2>
    <div class="strat-deux">
      <p>Le balisage blanc et rouge des sentiers pyrénéens sert de fil conducteur. Il marque la progression : les quatre étapes du quiz, la jauge vers la livraison offerte, le logo. Le bouton rouge plein est réservé à l’action principale de l’écran ; les autres boutons sont blancs ou bleu nuit.</p>
      <p>Trois portes d’entrée mènent au panier : la boutique pour ceux qui savent, le quiz pour ceux qui hésitent, le guide de Noël pour ceux qui offrent. Le panier fait ensuite monter la commande : livraison offerte à deux plaques, Triptyque à trois, kit LED si la plaque n’en a pas.</p>
    </div>
    <p class="petit">Thème unique clair assumé : les photos des plaques ont des découpes blanches. Un mode sombre montrerait des trous blancs sur fond foncé.</p>
    <p class="petit">Les histoires des modèles ont été réécrites en phrases factuelles (lieu, altitude, ce que montre la découpe) à partir des textes du site actuel : à relire. Le bouton « Masquer les notes jaunes » du bandeau permet de juger le rendu sans les étiquettes de maquette.</p>
    <ul class="strat-pages">%s</ul>
  </section>

  <section class="strat-bloc" aria-labelledby="s-tendances">
    <h2 id="s-tendances">Les tendances utilisées</h2>
    <ul class="strat-grille">%s</ul>
  </section>

  <section class="strat-bloc" aria-labelledby="s-palette">
    <h2 id="s-palette">Votre palette</h2>
    <p>Votre fichier « Palette Terres Gravées : version centrée métal brut » définit cinq couleurs. Les voici, avec les contrastes mesurés selon les règles WCAG (AA : 4,5:1 pour le texte, 3:1 pour les gros titres et les bordures utiles).</p>
    <ul class="palette">%s</ul>
    <div class="strat-deux">
      <div>
        <h3>Ce que la version 2 en reprend</h3>
        <ul class="strat-liste">
          <li>L’argent doux est très proche des filets de la maquette (#D3DAE4).</li>
          <li>Le vert sauge sert de fond à la section « Nos plaques sont nées à Aquensis » de l’accueil, comme vous le prévoyez pour les sections secondaires.</li>
          <li>Le cuivre clair revient dans le filet de cette section, qui évoque l’effet Corten des panneaux, dans la carte cadeau (votre visuel) et dans le code AQUENSIS de <a href="qr.html">qr.html</a>, toujours avec un texte noir ardoise.</li>
        </ul>
      </div>
      <div>
        <h3>Ce dont elle s’écarte, et pourquoi</h3>
        <ul class="strat-liste">
          <li>Le texte et les fonds foncés sont en bleu nuit, pas en noir ardoise : le bleu accompagne le balisage blanc et rouge des sentiers, fil conducteur de cette version.</li>
          <li>Le bouton d’action est rouge, pas cuivre : c’est le rouge du balisage, et le texte blanc y atteint 5,5:1. Sur le cuivre clair, le texte blanc tombe à 2,2:1.</li>
          <li>Le fond est blanc pur, plus franc que le blanc cassé : la version joue le contraste net d’un panneau de sentier.</li>
        </ul>
      </div>
    </div>
    <h3 class="strat-sous">Rester fidèle à votre charte : l’adaptation proposée</h3>
    <div class="echantillons" aria-label="Échantillons de bouton d’achat">
      <div class="ech ech--v2"><p class="ech__titre">Version 2</p><span class="ech__bouton">Ajouter au panier</span><span class="ech__fond">Section secondaire</span><p class="ech__note">Blanc sur rouge : 5,5:1</p></div>
      <div class="ech ech--charte"><p class="ech__titre">Votre charte</p><span class="ech__bouton">Ajouter au panier</span><span class="ech__fond">Section secondaire</span><p class="ech__note">Ardoise sur cuivre clair : 6,4:1</p></div>
      <div class="ech ech--refus"><p class="ech__titre">À éviter</p><span class="ech__bouton" role="img" aria-label="Exemple refusé : texte blanc sur cuivre clair">Ajouter au panier</span><span class="ech__fond">Section secondaire</span><p class="ech__note">Blanc sur cuivre clair : 2,2:1, illisible</p></div>
    </div>
    <div class="tableau-defile" tabindex="0" role="region" aria-label="Tableau de l’adaptation, à faire défiler sur téléphone">
      <table class="tableau-charte">
        <thead><tr><th scope="col">Rôle</th><th scope="col">Version 2</th><th scope="col">Votre charte</th><th scope="col">Contraste vérifié</th></tr></thead>
        <tbody>%s</tbody>
      </table>
    </div>
    <div class="essai-charte">
      <button type="button" class="btn btn--nuit" data-charte aria-pressed="false">Voir toute la maquette aux couleurs de votre charte</button>
      <p class="petit">L’aperçu s’applique à toutes les pages et reste actif dans ce navigateur. Le bandeau jaune affiche alors un bouton pour en sortir. Les notes jaunes de maquette ne changent pas. %s</p>
    </div>
    <p><strong>Votre logo.</strong> Il existe en vectoriel (logo.ai), avec l’emblème au coq, « TERRE GRAVÉE » et « Graver l’âme des territoires ». Exporté en SVG, il peut remplacer la signature typographique de l’en-tête et du pied de page (le carré balisé et le nom en Bricolage Grotesque), en version claire sur les fonds foncés. %s</p>
  </section>

  <section class="strat-bloc" aria-labelledby="s-techniques">
    <h2 id="s-techniques">Les techniques marketing, une par une</h2>
    <p>Chaque technique indique où la voir, pourquoi elle marche, ce que vous devez décider et ce qu’il faudra mesurer. Avec le trafic d’une micro-entreprise, un test A/B aura rarement assez de visites : mieux vaut comparer avant et après sur des périodes comparables, et faire tester le site à quelques personnes.</p>
    <ol class="techs">%s</ol>
  </section>

  <section class="strat-bloc" aria-labelledby="s-idees">
    <h2 id="s-idees">Vos idées, mises en œuvre</h2>
    <p>Votre business plan vise d’abord les touristes et les habitants attachés à leur patrimoine. Voici vos idées, une par une : ce que le site doit prévoir, ce qu’il faudra mesurer et ce qui reste à décider. La carte interactive des plaques, que vous envisagez aussi, est la page carte de la version 1.</p>
    <ol class="techs techs--idees">%s</ol>
    <p class="petit">Pour suivre les QR codes, les paramètres <code>utm_source</code>, <code>utm_medium</code> et <code>utm_content</code> sont lus par la plupart des outils de mesure d’audience. La mesure doit respecter les règles de la CNIL sur les traceurs.</p>
  </section>

  <section class="strat-bloc" aria-labelledby="s-legal">
    <h2 id="s-legal">Points de vigilance légaux</h2>
    <ul class="strat-liste">
      <li><strong>Pas de fausse urgence ni de fausse rareté.</strong> Aucun compte à rebours ni stock inventé (art. L121-2 et L121-4, 7° du Code de la consommation). La date limite de Noël est écrite en clair.</li>
      <li><strong>Le droit de rétractation de 14 jours est un droit légal.</strong> Il est présenté comme tel, jamais comme un avantage de la marque (art. L121-4, 10°). Un délai prolongé au 15 janvier serait, lui, un vrai geste commercial.</li>
      <li><strong>Prix et réductions.</strong> Pas de prix barré. Une réduction annoncée se réfère au prix le plus bas des 30 derniers jours (%s). Le Triptyque est une offre de lot, hors de ce champ selon une lecture professionnelle (%s), mais soumise à la loyauté (art. L121-1).</li>
      <li><strong>Avis.</strong> Dire près des avis qu’ils sont publiés sans vérification d’achat, avec la date de publication et la date de l’expérience, et l’ordre de classement (art. D111-17 ; %s ; %s). La date de l’expérience manque encore : chaque avis porte l’étiquette « à fournir ». Ne jamais présenter les auteurs comme des clients ni écrire « avis vérifiés » sans contrôle réel (art. L121-4, 27°).</li>
      <li><strong>Lettre d’information et e-mail du quiz.</strong> Consentement préalable, case non cochée, désinscription simple (%s). Selon la recommandation de la CNIL du 14 avril 2026 (délibération n° 2026-042), les pixels de suivi dans les e-mails exigent le consentement, sauf pour mesurer la délivrabilité ; pour les adresses déjà collectées, trois mois pour informer les destinataires et leur permettre de s’opposer (%s).</li>
      <li><strong>Bouton de rétractation.</strong> Un bouton « Renoncer au contrat ici », visible, accessible directement et disponible pendant tout le délai de rétractation, est obligatoire depuis le 19 juin 2026. Il vient de l’ordonnance n° 2026-2 du 5 janvier 2026, qui transpose la directive (UE) 2023/2673, et d’un décret du même jour (%s). Les articles exacts restent à vérifier avec un juriste.</li>
      <li><strong>Sur mesure.</strong> Les biens nettement personnalisés sont exclus du droit de rétractation (%s), mais restent couverts par les garanties légales de conformité et des vices cachés : la page sur mesure le dit.</li>
      <li><strong>Cadeaux.</strong> Le droit de rétractation appartient à l’acheteur ; le délai court à partir de la réception par la personne qu’il a désignée (art. L221-18). La loi ne prévoit pas d’échange : c’est une décision commerciale.</li>
      <li><strong>Origine et fabrication.</strong> La découpe laser est faite à Revel (31) : ne pas écrire « fait main » (art. L121-2). L’affirmation « dans un rayon de 150 km » reste citée entre guillemets : Revel est à environ 155 km de l’atelier, il faut préciser le centre du rayon.</li>
      <li><strong>Médiateur de la consommation.</strong> Ses coordonnées doivent figurer sur le site (art. L612-1 et L616-1). Elles manquent : la page contact porte l’étiquette « à fournir ».</li>
      <li><strong>Étiquettes « Meilleure vente ».</strong> Elles sont reprises du site actuel. À garder seulement si elles reflètent les ventes réelles.</li>
      <li><strong>Balisage blanc et rouge.</strong> Le motif est un clin d’œil graphique, sans sigle ni logo de la Fédération française de randonnée. Point à vérifier avant publication : la fédération protège ses marques de balisage.</li>
      <li><strong>Polices.</strong> La maquette charge Google Fonts. Un tribunal de Munich a condamné en 2022 un site qui transmettait ainsi l’adresse IP des visiteurs (%s). Sur le vrai site, héberger les deux polices soi-même.</li>
      <li><strong>Accessibilité.</strong> Les micro-entreprises de services sont a priori exemptées de l’European Accessibility Act (%s). La maquette vise quand même le niveau AA : focus visible, cibles de 24 px au moins, contrastes, mouvement réduit.</li>
    </ul>
  </section>

  <section class="strat-bloc" aria-labelledby="s-fournir">
    <h2 id="s-fournir">À fournir ou à décider</h2>
    <div class="strat-deux">
      <div>
        <h3>Informations à fournir</h3>
        <ul class="strat-liste">
          <li>La grille des frais de port, au moins un tarif indicatif pour 1, 2 et 3 plaques.</li>
          <li>Le délai de préparation avant expédition, avec et sans kit LED.</li>
          <li>La taille de chaque série limitée.</li>
          <li>La longueur exacte du ruban LED : 2 m ou 1,5 m.</li>
          <li>Le sens de la sortie du câble : vue de face ou de dos.</li>
          <li>Les photos manquantes : Le Cerf en noir, L’Abbaye de l’Escaladieu en doré, une mise en situation du Cirque de Gavarnie et du Cerf.</li>
          <li>La durée de validité de la carte cadeau.</li>
          <li>La fixation conseillée en extérieur.</li>
          <li>Les liens Instagram et Facebook.</li>
          <li>Les règles de modération des avis et votre délai de réponse habituel.</li>
          <li>La date d’achat ou de réception pour chaque avis.</li>
          <li>Le nom et le site du médiateur de la consommation.</li>
          <li>Le centre du rayon de 150 km cité pour la fabrication.</li>
          <li>Les ventes réelles derrière les étiquettes « Meilleure vente ».</li>
          <li>Une photo d’une série professionnelle, si vous en avez une.</li>
          <li>L’accord écrit de la SEMETHERM pour citer le projet Aquensis : l’histoire d’origine porte l’étiquette « à valider » d’ici là.</li>
          <li>Le logo exporté en SVG depuis logo.ai.</li>
          <li>Un aperçu du dessin du Jardin Massey, et les dates de sortie des trois modèles en préparation.</li>
          <li>Le format exact et le prix des versions grand format.</li>
          <li>La confirmation que l’emballage renforcé (boîte type livre, carton ondulé, calage) est celui utilisé aujourd’hui, et une photo du colis.</li>
        </ul>
      </div>
      <div>
        <h3>Décisions commerciales</h3>
        <ul class="strat-liste">
          <li>Seuil de livraison offerte : 130 € d’articles livrés (plaques et kits LED, hors carte cadeau), soit deux plaques.</li>
          <li>Remise Triptyque : 10 %%, soit 175,50 € les trois.</li>
          <li>Date limite de commande pour Noël : au plus tard le lundi 14 décembre 2026.</li>
          <li>Ouverture du guide de Noël : le 1er novembre.</li>
          <li>Black Friday du 27 novembre : pas de remise, prix stable.</li>
          <li>Retours prolongés jusqu’au 15 janvier 2027 pour les cadeaux, et échange proposé ou non.</li>
          <li>Carte cadeau de 80 € (plaque et kit LED), non prise en compte dans le seuil de livraison.</li>
          <li>Options cadeau : message joint et prix masqués.</li>
          <li>Jour de sortie des plaques exclusives : le premier jeudi du mois.</li>
          <li>Panneaux de démonstration à Aquensis (vestiaires, sortie) et page d’arrivée qr.html.</li>
          <li>Code de bienvenue AQUENSIS : livraison offerte dès la première plaque, à vérifier par rapport aux limites de remise du business plan. Le nom demande l’accord de la SEMETHERM ; sinon, un code neutre (BIGORRE ou BIENVENUE).</li>
          <li>Paramètre de suivi des QR codes : <code>utm_source</code>, <code>utm_medium</code>, <code>utm_content</code>.</li>
          <li>Adopter ou non la palette de votre charte.</li>
        </ul>
      </div>
    </div>
    <p class="petit">Dans les pages, chaque décision porte l’étiquette jaune « proposition à valider », chaque information manquante l’étiquette « à fournir » ou « à confirmer ».</p>
  </section>

  <section class="strat-bloc" aria-labelledby="s-mesure">
    <h2 id="s-mesure">Ce qu’il faudra mesurer</h2>
    <dl class="mesures">
      <div><dt>Taux de conversion</dt><dd>Commandes divisées par visites, sur ordinateur et sur téléphone séparément.</dd></div>
      <div><dt>Panier moyen</dt><dd>Effet du seuil de 130 €, du Triptyque et du kit LED.</dd></div>
      <div><dt>Taux d’attachement du kit LED</dt><dd>Part des plaques vendues avec le kit.</dd></div>
      <div><dt>Quiz</dt><dd>Démarrages, complétion, ajouts au panier depuis le résultat.</dd></div>
      <div><dt>Taux d’inscription</dt><dd>Inscriptions à la lettre divisées par visites de l’accueil.</dd></div>
      <div><dt>Saison de Noël</dt><dd>Part des ventes avant le 1er décembre, ventes de cartes après le 14 décembre.</dd></div>
      <div><dt>QR codes d’Aquensis</dt><dd>Visites par emplacement, commandes depuis qr.html, utilisations du code AQUENSIS.</dd></div>
    </dl>
    <p class="petit">Mesure d’audience à mettre en place dans le respect des règles de la CNIL sur les traceurs.</p>
  </section>
</div>
""" % (pl, tend_html, pal_html, adapt_html, valider("palette de votre charte, à adopter ou non"), fournir("logo exporté en SVG depuis logo.ai"), tech_html, idees_html,
       src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044549592", "art. L112-1-1"),
       src("https://www.medef.com/uploads/media/node/0019/100/14563-faq-annoncesreductionprix-medef-31052022.pdf", "FAQ du MEDEF, 2022"),
       src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049571119", "art. L111-7-2"),
       src("https://www.legifrance.gouv.fr/jorf/id/JORFARTI000035720943", "décret 2017-1436"),
       src("https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique", "CNIL"),
       src("https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels", "CNIL, recommandation pixels"),
       src("https://hlc.com/fr/publications/transposition-under-french-law-of-the-eu-mandatory-withdrawal-button-for-online-sales", "Hogan Lovells"),
       src("https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563170", "art. L221-28, 3°"),
       src("https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html", "The Hacker News"),
       src("https://www.ccpc.ie/business/enforcement/accessibility/european-accessibility-act-guidelines-for-microenterprises/", "CCPC"))
    page("strategie.html", "Stratégie de la version 2 · Terre Gravée",
         "Note pour Romain : concept, tendances, techniques marketing, points légaux et informations à fournir pour la version 2 de la maquette Terre Gravée.",
         contenu, classe="page-strat")


# ---------------------------------------------------------------- données pour le JavaScript

def catalogue_js():
    donnees = {}
    for p in CATALOGUE:
        fins = {}
        for f, _, _ in FINITIONS:
            if p["collection"] != "accessoires":
                fins[f] = photo(p["slug"], f) if a_photo(p["slug"], f) else None
        donnees[p["slug"]] = {
            "nom": p["nom"], "prix": p["prix"], "collection": p["collection"], "best": bool(p["best"]),
            "cartel": " · ".join(p["cartel"]) if p["cartel"] else "", "fins": fins,
            "srcset": {f: srcset(p["slug"], f) for f in fins if fins[f]},
            "dims": {f: TAILLES[fins[f]] for f in fins if fins[f]},
            "nbAvis": len(p["avis"]), "moyenne": round(moyenne(p), 1),
        }
    vignettes = {}
    for k in ("led/led-img0.webp", "led/led-img1.webp", "misc/carte-cadeau.webp"):
        src, w, h = petite(k)
        vignettes[k] = [src, w, h]
    config = {"img": IMG, "vignettes": vignettes, "seuil": SEUIL, "remise": REMISE, "prixLed": PRIX_LED, "prixPlaque": PRIX_PLAQUE,
              "produits": donnees, "moyenne": round(MOYENNE, 1), "nbAvis": NB_AVIS}
    texte = ("/* Généré par build.py : ne pas modifier à la main. */\nwindow.TG = "
             + json.dumps(config, ensure_ascii=False, indent=1) + ";\n")
    with open(os.path.join(ICI, "assets", "catalogue.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write(texte)


def main():
    os.makedirs(os.path.join(ICI, "assets"), exist_ok=True)
    catalogue_js()
    accueil()
    collection()
    for p in CATALOGUE:
        if p["slug"] == "led":
            fiche_led(p)
        elif p["slug"] == "carte-cadeau":
            fiche_carte(p)
        else:
            fiche_plaque(p)
    quiz()
    noel()
    triptyque()
    sur_mesure()
    qr()
    contact()
    strategie()
    print("%d pages générées dans %s" % (len(PAGES), ICI))


if __name__ == "__main__":
    main()
