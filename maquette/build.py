#!/usr/bin/env python3
"""Génère les pages de la maquette Terre Gravée à partir de data/catalogue.json.

Usage (depuis ce dossier) :  python build.py
Les pages sont écrites à côté de ce fichier ; elles s'ouvrent directement dans un navigateur.
"""
import html
import json
import os

ICI = os.path.dirname(os.path.abspath(__file__))
CATALOGUE = json.load(open(os.path.join(ICI, "data", "catalogue.json"), encoding="utf-8"))
TAILLES = json.load(open(os.path.join(ICI, "assets", "img", "_sizes.json"), encoding="utf-8"))
PRODUITS = {p["slug"]: p for p in CATALOGUE}
PLAQUES = [p for p in CATALOGUE if p["collection"] != "accessoires"]
SITE_ACTUEL = "https://terregravee.fr"

COLLECTIONS = {
    "paysages": {"nom": "Paysages", "detail": "Sommets, cols et cirques"},
    "patrimoine": {"nom": "Patrimoine", "detail": "Tours, châteaux et abbayes"},
    "faune": {"nom": "Faune", "detail": "Les animaux des Pyrénées"},
    "accessoires": {"nom": "Accessoires", "detail": "Kit LED et carte cadeau"},
}
FINITIONS = [("noir", "Noir", "noire"), ("gris", "Gris", "grise"), ("dore", "Doré", "dorée")]
NOM_FIN = {f: n for f, n, _ in FINITIONS}
ALT_FIN = {f: a for f, _, a in FINITIONS}
LED_COULEURS = [("Blanc chaud", "#FFD39A"), ("Bleu", "#5AB0FF"), ("Vert", "#63E58F"), ("Violet", "#B48CFF"), ("Orange", "#FF8A57")]
POSITIONS_CABLE = ["Bas gauche", "Bas droite", "Haut gauche", "Haut droite"]

TOUS_AVIS = [dict(a, produit=p["slug"]) for p in CATALOGUE for a in p["avis"]]
NOTE_MOYENNE = sum(a["note"] for a in TOUS_AVIS) / len(TOUS_AVIS)


def e(texte):
    return html.escape(str(texte), quote=True)


def euros(n):
    return f"{n} €"


def note_fr(n):
    return f"{n:.1f}".replace(".", ",")


def etoiles(note):
    plein = round(note)
    return "★" * plein + "☆" * (5 - plein)


def tri_nom(nom):
    for article in ("Le ", "La ", "Les ", "L’"):
        if nom.startswith(article):
            return nom[len(article):]
    return nom


def dims(rel):
    w, h = TAILLES[rel]
    return w, h


# ---------- Images ----------

def a_photo(slug, fin):
    return f"p/{slug}-{fin}-440.webp" in TAILLES


def srcset_plaque(slug, fin):
    return f"assets/img/p/{slug}-{fin}-440.webp 440w, assets/img/p/{slug}-{fin}-880.webp 880w"


def img_plaque(p, fin, sizes, prioritaire=False):
    rel = f"p/{p['slug']}-{fin}-440.webp"
    w, h = dims(rel)
    chargement = 'fetchpriority="high"' if prioritaire else 'loading="lazy"'
    alt = f"Plaque {p['nom']}, finition {ALT_FIN[fin]}"
    return (f'<img src="assets/img/{rel}" srcset="{srcset_plaque(p["slug"], fin)}" sizes="{sizes}" '
            f'width="{w}" height="{h}" alt="{e(alt)}" {chargement} decoding="async">')


def plaque(p, fin, sizes, classe="", prioritaire=False):
    return f'<figure class="plaque {classe}">{img_plaque(p, fin, sizes, prioritaire)}</figure>'


def img(rel, alt, sizes="100vw", classe="", chargement="lazy"):
    w, h = dims(rel)
    cls = f' class="{classe}"' if classe else ""
    return (f'<img{cls} src="assets/img/{rel}" width="{w}" height="{h}" sizes="{sizes}" alt="{e(alt)}" '
            f'loading="{chargement}" decoding="async">')


def finition_defaut(p, preferee="noir"):
    if a_photo(p["slug"], preferee):
        return preferee
    return next(f for f, _, _ in FINITIONS if a_photo(p["slug"], f))


def cartel(p):
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return f"{e(lieu)} · <em>{e(detail)}</em>"
    return f"{e(lieu)} · {e(detail)}"


def cartel_court(p):
    lieu, detail = p["cartel"]
    if p["collection"] == "faune":
        return f"<em>{e(detail)}</em>"
    return f"Altitude {e(detail)}" if detail.endswith(" m") else e(lieu)


TODO = '<mark class="todo">{}</mark>'


# ---------- Cartes produit ----------

def carte_produit(p, fin=None, sizes="(max-width: 720px) 40vw, (max-width: 1000px) 26vw, 220px"):
    url = f"produit-{p['slug']}.html"
    nb_avis = len(p["avis"])
    if p["collection"] == "accessoires":
        if p["slug"] == "led":
            visuel = f'<figure class="plaque">{img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu par le kit LED", sizes)}</figure>'
            pied = '<span class="carte__note">Option, montage compris</span>'
            lieu = "Rétroéclairage RGB"
            classe_visuel = "carte__visuel"
        else:
            visuel = f'<figure class="plaque">{img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée", sizes)}</figure>'
            pied = '<span class="carte__note">Envoyée par e-mail</span>'
            lieu = "Valable sur tous les modèles"
            classe_visuel = "carte__visuel carte__visuel--carre"
        return f"""<li><article class="carte" data-collection="accessoires" data-nom="{e(p['nom'])}" data-tri="{e(tri_nom(p['nom']))}" data-avis="0">
  <a class="{classe_visuel}" href="{url}" tabindex="-1" aria-hidden="true">{visuel}</a>
  <div class="carte__infos"><h3 class="carte__nom"><a href="{url}">{e(p['nom'])}</a></h3><span class="carte__prix">{euros(p['prix'])}</span><span class="carte__lieu">{e(lieu)}</span></div>
  <div class="carte__pied">{pied}</div>
</article></li>"""
    fin = fin if fin and a_photo(p["slug"], fin) else finition_defaut(p)
    data = []
    pastilles = []
    for f, nom, _ in FINITIONS:
        if a_photo(p["slug"], f):
            data.append(f'data-img-{f}="assets/img/p/{p["slug"]}-{f}-440.webp" data-srcset-{f}="{srcset_plaque(p["slug"], f)}"')
            pastilles.append(f'<button type="button" class="pastille fin-{f}" data-fin="{f}" aria-pressed="{"true" if f == fin else "false"}" title="{nom}"><span class="visuellement-cache">{nom}</span></button>')
        else:
            pastilles.append(f'<button type="button" class="pastille pastille--manque fin-{f}" disabled title="{nom} : photo à venir"><span class="visuellement-cache">{nom}, photo à venir</span></button>')
    note = (f'<span class="carte__note"><span class="etoiles" aria-hidden="true">{etoiles(sum(a["note"] for a in p["avis"]) / nb_avis)}</span> {nb_avis} avis</span>'
            if nb_avis else "")
    return f"""<li><article class="carte" data-collection="{p['collection']}" data-nom="{e(p['nom'])}" data-tri="{e(tri_nom(p['nom']))}" data-avis="{nb_avis}" {' '.join(data)}>
  <a class="carte__visuel" href="{url}" tabindex="-1" aria-hidden="true">{plaque(p, fin, sizes)}</a>
  <div class="carte__infos"><h3 class="carte__nom"><a href="{url}">{e(p['nom'])}</a></h3><span class="carte__prix">{euros(p['prix'])}</span><span class="carte__lieu">{cartel_court(p)}</span></div>
  <div class="carte__pied"><div class="pastilles" role="group" aria-label="Finition affichée pour {e(p['nom'])}">{''.join(pastilles)}</div>{note}</div>
</article></li>"""


# ---------- Gabarit commun ----------

NAV = [("collection.html", "Collection"), ("sur-mesure.html", "Sur mesure"), ("savoir-faire.html", "Savoir-faire"),
       ("installation.html", "Installation"), ("contact.html", "Contact")]

LOGO = ('<svg viewBox="0 0 30 22" aria-hidden="true" focusable="false"><path d="M1.5 20.5 10 9l3.2 3.6L18.6 4.5 28.5 20.5Z" '
        'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M18.6 4.5V1" stroke="currentColor" '
        'stroke-width="1.6" stroke-linecap="round"/></svg>')


def marque():
    return f'<a class="marque" href="index.html">{LOGO}<span class="marque__nom">TERRE GRAVÉE</span></a>'


def page(fichier, titre, description, contenu, actif=None, jsonld=None):
    courant = ' aria-current="page"'
    liens = "".join(f'<a href="{href}"{courant if href == actif else ""}>{nom}</a>' for href, nom in NAV)
    donnees = ""
    if jsonld:
        donnees = '<script type="application/ld+json">' + json.dumps(jsonld, ensure_ascii=False) + "</script>"
    sortie = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(titre)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{e(description)}">
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Allerta+Stencil&amp;family=Jost:ital,wght@0,400;0,500;0,600;1,400&amp;family=Marcellus&amp;display=swap">
<link rel="stylesheet" href="assets/css/site.css">
{donnees}
</head>
<body>
<a class="lien-evitement" href="#contenu">Aller au contenu</a>
<div class="bandeau-maquette"><div class="wrap"><span>Maquette de travail, non publiée. Les paiements sont désactivés.</span><a href="notes.html">Lire les notes de refonte</a></div></div>
<header class="entete">
  <div class="wrap">
    {marque()}
    <nav class="nav" aria-label="Navigation principale">{liens}</nav>
    <button type="button" class="bouton-icone" data-ouvrir-panier aria-label="Ouvrir le panier">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      <span class="compteur">0</span>
    </button>
    <button type="button" class="bouton-icone bouton-menu" aria-expanded="false" aria-label="Menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
  </div>
</header>
<main id="contenu">
{contenu}
</main>
{pied()}
<div class="voile"></div>
<aside class="tiroir" aria-label="Panier" aria-hidden="true" inert>
  <div class="tiroir__haut"><h2>Panier</h2><button type="button" class="bouton-icone tiroir__fermer" data-fermer-panier>Fermer</button></div>
  <ul class="tiroir__liste"></ul>
  <div class="tiroir__bas">
    <div class="tiroir__total"><span>Sous-total</span><strong>0 €</strong></div>
    <button type="button" class="btn btn--plein" disabled>Commander</button>
    <p>Maquette : la commande est désactivée. Frais de port calculés à l’étape suivante selon le poids et la destination.</p>
  </div>
</aside>
<div class="toast" role="status" aria-live="polite"><span class="toast__texte"></span><button type="button">Voir le panier</button></div>
<script src="assets/js/site.js"></script>
</body>
</html>
"""
    with open(os.path.join(ICI, fichier), "w", encoding="utf-8") as f:
        f.write(sortie)


def pied():
    return f"""<footer class="pied">
  <div class="wrap">
    <div class="pied__grille">
      <div>
        {marque()}
        <p class="attenue">Plaques murales en aluminium découpé au laser, fabriquées dans le Sud-Ouest.</p>
        <p style="margin-top:14px">16 rue du Pic du Midi, 65200 Gerde<br>contact@terregravee.fr</p>
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
        <h2>Aide</h2>
        <ul>
          <li><a href="installation.html">Installation</a></li>
          <li><a href="contact.html#faq">Livraison et retours</a></li>
          <li><a href="{SITE_ACTUEL}/cgv/">Conditions générales de vente</a></li>
          <li><a href="{SITE_ACTUEL}/politique/">Mentions légales et confidentialité</a></li>
        </ul>
      </div>
      <div>
        <h2>Suivre l’atelier</h2>
        <ul>
          <li><a href="#">Instagram</a> {TODO.format("lien")}</li>
          <li><a href="#">Facebook</a> {TODO.format("lien")}</li>
          <li><a href="index.html#lettre">Lettre d’information</a></li>
        </ul>
      </div>
    </div>
    <div class="pied__bas">
      <span>© 2026 Terre Gravée · Micro-entreprise · SIRET 941 234 270 00010</span>
      <span>Prix TTC, TVA non applicable (art. 293 B du CGI)</span>
    </div>
  </div>
</footer>"""


def reperes():
    return """<section class="reperes" aria-label="Nos engagements">
  <div class="wrap"><ul>
    <li><strong>150 km</strong><span>Toutes nos plaques sont fabriquées dans ce rayon, du dessin à l’expédition.</span></li>
    <li><strong>N° 001</strong><span>Série limitée : chaque plaque porte son numéro gravé au dos.</span></li>
    <li><strong>0 perçage</strong><span>Deux fixations adhésives 3M Command™ fournies avec la plaque.</span></li>
    <li><strong>2 à 4 jours</strong><span>Délai de livraison indicatif, en jours ouvrés.</span></li>
  </ul></div>
</section>"""


def etapes(avec_liens=False):
    dessin = ("Les visuels originaux sont dessinés par <a href=\"https://www.instagram.com/maude.villatte/\">Maude Villatte</a> "
              "et <a href=\"https://www.lolajacquet.com/\">Lola Jacquet</a>." if avec_liens else
              "Les visuels originaux sont dessinés par Maude Villatte et Lola Jacquet.")
    return f"""<ol class="etapes">
  <li><h3>Dessin</h3><span class="lieu">Illustratrices</span><p>{dessin}</p></li>
  <li><h3>Découpe laser</h3><span class="lieu">Revel (31)</span><p>Le laser découpe l’aluminium avec une grande finesse de détail.</p></li>
  <li><h3>Thermolaquage</h3><span class="lieu">Bagnères-de-Bigorre (65)</span><p>Une finition mate ou satinée, résistante en intérieur comme en extérieur.</p></li>
  <li><h3>Assemblage et expédition</h3><span class="lieu">Bagnères-de-Bigorre (65)</span><p>Contrôle qualité, emballage renforcé et envoi.</p></li>
</ol>"""


def avant_apres():
    m = PRODUITS["le-chateau-de-mauvezin"]
    return f"""<div class="avant-apres">
  <figure><div class="plaque">{img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", "(max-width: 900px) 40vw, 220px")}</div><figcaption>Aluminium brut, après la découpe</figcaption></figure>
  <figure>{plaque(m, "dore", "(max-width: 900px) 40vw, 220px")}<figcaption>Après thermolaquage, finition dorée</figcaption></figure>
</div>"""


def citation_avis(a, lien_produit=True):
    p = PRODUITS[a["produit"]]
    produit = f'<span>·</span><a href="produit-{p["slug"]}.html">{e(p["nom"])}</a>' if lien_produit else ""
    return f"""<li><figure class="avis">
  <span class="etoiles" aria-label="Note {a['note']} sur 5">{etoiles(a['note'])}</span>
  <blockquote>« {e(a['texte'])} »</blockquote>
  <figcaption><span>{e(a['auteur'])}</span>{produit}</figcaption>
</figure></li>"""


ORGANISATION = {
    "@context": "https://schema.org", "@type": "Organization", "name": "Terre Gravée",
    "alternateName": ["Terre Gravee", "Terres Gravées", "Terregravee"], "url": SITE_ACTUEL,
    "email": "contact@terregravee.fr", "slogan": "Graver l’âme des territoires",
    "address": {"@type": "PostalAddress", "streetAddress": "16 rue du Pic du Midi", "postalCode": "65200",
                "addressLocality": "Gerde", "addressCountry": "FR"},
}


# ---------- Accueil ----------

def accueil():
    pic, isard, jacobins = PRODUITS["le-pic-du-midi"], PRODUITS["lisard"], PRODUITS["la-tour-des-jacobins"]
    taille_heros = "(max-width: 900px) 26vw, 170px"
    couleurs = "".join(
        f'<button type="button" style="--c:{c}" data-couleur="{c}" aria-pressed="{"true" if i == 0 else "false"}" title="{n}"><span class="visuellement-cache">{n}</span></button>'
        for i, (n, c) in enumerate(LED_COULEURS))
    tuiles = []
    for cle, choix in (("paysages", [("le-pic-du-midi", "noir"), ("le-cirque-de-gavarnie", "dore"), ("le-montaigu", "gris")]),
                       ("patrimoine", [("le-chateau-de-mauvezin", "noir"), ("la-tour-des-jacobins", "dore"), ("labbaye-de-lescaladieu", "gris")]),
                       ("faune", [("lours", "noir"), ("lisard", "gris"), ("la-marmotte", "dore")])):
        nb = sum(1 for p in PLAQUES if p["collection"] == cle)
        mini = "".join(plaque(PRODUITS[s], f, "(max-width: 560px) 22vw, 90px") for s, f in choix)
        tuiles.append(f"""<a class="tuile" href="collection.html#{cle}">
  <div class="tuile__mur" aria-hidden="true">{mini}</div>
  <div><div class="tuile__titre"><h3>{COLLECTIONS[cle]['nom']}</h3><span>{nb} modèles</span></div><p>{COLLECTIONS[cle]['detail']}</p></div>
</a>""")
    best = "".join(carte_produit(PRODUITS[s], f) for s, f in (("le-pic-du-midi", "noir"), ("lours", "noir"), ("lisard", "dore"), ("le-cerf", "gris")))
    avis_choisis = [a for a in TOUS_AVIS if a["auteur"] in ("Sergio", "Isa", "Marie")]
    contenu = f"""
<section class="heros">
  <div class="wrap heros__grille">
    <div class="heros__texte">
      <p class="surtitre">Plaques murales en aluminium · Hautes-Pyrénées</p>
      <h1>Graver l’âme des territoires</h1>
      <p class="heros__intro">Le Pic du Midi, l’isard, la tour des Jacobins… Chaque plaque reprend une silhouette de la Bigorre, découpée au laser dans l’aluminium puis thermolaquée. Les modèles sont édités en série limitée et numérotés au dos.</p>
      <div class="heros__actions"><a class="btn" href="collection.html">Voir la collection</a><a class="btn btn--ligne" href="sur-mesure.html">Un projet sur mesure</a></div>
      <dl class="faits">
        <div><dt>Format</dt><dd>60 × 30 cm</dd></div>
        <div><dt>Finitions</dt><dd>Noir, gris, doré</dd></div>
        <div><dt>Prix</dt><dd>65 €</dd></div>
      </dl>
    </div>
    <div class="mur-expo" data-mur>
      {plaque(pic, "noir", taille_heros, "plaque--a", True)}
      {plaque(isard, "dore", taille_heros, "plaque--b", True)}
      {plaque(jacobins, "gris", taille_heros, "plaque--c", True)}
      <div class="mur-expo__legende">
        <div class="led-commandes" style="display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center">
          <button type="button" class="interrupteur" aria-pressed="false"><span class="interrupteur__voyant" aria-hidden="true"></span><span class="interrupteur__texte">Allumer le rétroéclairage</span></button>
          <div class="led-couleurs" role="group" aria-label="Couleur des LED" hidden>{couleurs}</div>
        </div>
        <span class="mur-expo__note">Simulation · kit LED 15 €</span>
      </div>
    </div>
  </div>
</section>
{reperes()}
<section class="section">
  <div class="wrap">
    <div class="entete-section entete-section--ligne">
      <div><p class="surtitre">La collection</p><h2>Trois thèmes, douze plaques</h2></div>
      <a class="lien-fleche" href="collection.html">Tout voir</a>
    </div>
    <div class="collections">{''.join(tuiles)}</div>
  </div>
</section>
<section class="section section--clair">
  <div class="wrap">
    <div class="entete-section entete-section--ligne">
      <div><p class="surtitre">Meilleures ventes</p><h2>Les plus demandées</h2></div>
      <p class="attenue petit">Touchez une pastille pour voir une autre finition.</p>
    </div>
    <ul class="grille-produits">{best}</ul>
  </div>
</section>
<section class="section section--nuit">
  <div class="wrap led-grille">
    <div class="led-photos">
      {img("led/led-img1.webp", "Plaque Le Pic du Midi rétroéclairée en vert", "(max-width: 900px) 46vw, 330px")}
      {img("led/led-img0.webp", "Plaque L’Ours rétroéclairée en bleu", "(max-width: 900px) 46vw, 330px")}
    </div>
    <div class="led-texte">
      <p class="surtitre">Option rétroéclairage</p>
      <h2>Le soir, la plaque s’allume</h2>
      <p class="chapo">Le ruban LED se colle au dos de la plaque. La lumière se reflète sur le mur et passe à travers la découpe.</p>
      <ul class="liste-simple">
        <li>Couleur, intensité, minuteur et effets réglables</li>
        <li>Télécommande, boutons sur le ruban ou application smartphone</li>
        <li>Monté par l’atelier avant l’envoi, à l’emplacement de câble choisi</li>
      </ul>
      <div class="prix-ligne"><strong>15 €</strong><span class="attenue petit">Kit non fabriqué en France, choisi pour sa compatibilité avec nos plaques.</span></div>
      <div><a class="btn" href="produit-led.html">Voir le kit LED</a></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap atelier">
    <div>
      <div class="entete-section"><p class="surtitre">L’atelier</p><h2>Du dessin à l’expédition</h2>
        <p class="chapo">Toute la fabrication reste dans le Sud-Ouest, dans un rayon de 150 km.</p></div>
      {etapes()}
      <p style="margin-top:28px"><a class="lien-fleche" href="savoir-faire.html">Découvrir l’atelier</a></p>
    </div>
    {avant_apres()}
  </div>
</section>
<section class="section section--clair">
  <div class="wrap">
    <div class="entete-section entete-section--ligne">
      <div><p class="surtitre">Avis clients</p><h2>Ce qu’en disent nos clients</h2></div>
      <div class="avis-resume"><strong>{note_fr(NOTE_MOYENNE)}</strong><span class="etoiles" aria-hidden="true">{etoiles(NOTE_MOYENNE)}</span><span class="attenue petit">sur 5 · {len(TOUS_AVIS)} avis publiés sur le site</span></div>
    </div>
    <ul class="grille-avis">{''.join(citation_avis(a) for a in avis_choisis)}</ul>
  </div>
</section>
<section class="section">
  <div class="wrap duo">
    <div class="bloc">
      {img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée", "(max-width: 980px) 36vw, 200px")}
      <div><p class="surtitre">Idée cadeau</p><h3>Carte cadeau</h3><p class="attenue">Vous hésitez sur le modèle ? La carte vaut une plaque, au choix du destinataire. Elle est envoyée par e-mail.</p><p><a class="lien-fleche" href="produit-carte-cadeau.html">Offrir la carte, 65 €</a></p></div>
    </div>
    <div class="bloc">
      <div class="plaque">{img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten", "(max-width: 980px) 36vw, 200px")}</div>
      <div><p class="surtitre">Créations spéciales</p><h3>Sur mesure</h3><p class="attenue">Un format jusqu’à 2 × 1 m, l’acier Corten, une série pour un lieu ou un événement : parlons de votre projet.</p><p><a class="lien-fleche" href="sur-mesure.html">Voir les possibilités</a></p></div>
    </div>
  </div>
</section>
<section class="section section--clair" id="lettre">
  <div class="wrap deux-colonnes">
    <div class="entete-section" style="margin-bottom:0"><p class="surtitre">Lettre d’information</p><h2>Être prévenu des nouvelles plaques</h2>
      <p class="chapo">Certaines plaques sortent en très petite quantité, parfois en exemplaire unique. Inscrivez-vous pour les voir en premier.</p></div>
    <div>
      <form class="inscription" data-demo><label class="visuellement-cache" for="email-lettre">Adresse e-mail</label><input id="email-lettre" type="email" required placeholder="votre@adresse.fr" autocomplete="email"><button class="btn" type="submit">S’inscrire</button></form>
      <p class="message-demo" tabindex="-1" hidden style="margin-top:14px">Maquette : aucune adresse n’est enregistrée.</p>
    </div>
  </div>
</section>"""
    page("index.html", "Terre Gravée · Plaques murales en aluminium découpé",
         "Plaques murales en aluminium découpé au laser, inspirées des paysages, du patrimoine et de la faune des Pyrénées. Séries limitées numérotées, fabriquées en France.",
         contenu, jsonld=ORGANISATION)


# ---------- Collection ----------

def collection():
    comptes = {c: sum(1 for p in CATALOGUE if p["collection"] == c) for c in COLLECTIONS}
    puces = [f'<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Tout <span>{len(CATALOGUE)}</span></button>']
    puces += [f'<button type="button" class="puce" data-filtre="{c}" aria-pressed="false">{v["nom"]} <span>{comptes[c]}</span></button>'
              for c, v in COLLECTIONS.items()]
    voir = "".join(f'<button type="button" class="puce fin-{f}" data-voir-en="{f}" aria-pressed="false">{n}</button>' for f, n, _ in FINITIONS)
    cartes = "".join(carte_produit(p) for p in CATALOGUE)
    contenu = f"""
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Boutique</p>
    <h1>La collection</h1>
    <p class="chapo">Douze plaques de 60 × 30 cm en aluminium découpé au laser et thermolaqué. Chaque modèle existe en noir, gris et doré, au même prix.</p>
  </header>
  <div class="barre-filtres">
    <div class="puces" role="group" aria-label="Filtrer par thème">{''.join(puces)}</div>
    <div class="voir-en" role="group" aria-label="Afficher toutes les plaques en"><span>Voir en</span>{voir}</div>
    <div class="voir-en"><label for="tri">Trier</label><select id="tri" class="puce"><option value="selection">Sélection de l’atelier</option><option value="nom">Nom, de A à Z</option><option value="avis">Les plus commentées</option></select></div>
  </div>
  <p class="compte" data-compte aria-live="polite" style="margin-bottom:20px">{len(CATALOGUE)} modèles</p>
  <ul class="grille-produits" data-grille-collection>{cartes}</ul>
</div>
<section class="section">
  <div class="wrap">
    <ul class="garanties" style="max-width:none;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));display:grid;column-gap:32px">
      <li><span>Livraison</span><span>2 à 4 jours ouvrés</span></li>
      <li><span>Retours</span><span>14 jours pour changer d’avis</span></li>
      <li><span>Paiement</span><span>Carte bancaire, PayPal</span></li>
      <li><span>Fabrication</span><span>Revel (31) et Bagnères-de-Bigorre (65)</span></li>
    </ul>
  </div>
</section>"""
    page("collection.html", "La collection · Terre Gravée",
         "Douze plaques murales en aluminium découpé au laser : paysages, patrimoine et faune des Pyrénées, en noir, gris ou doré. 65 € la plaque.",
         contenu, actif="collection.html")


# ---------- Fiches produit ----------

def garanties():
    return """<ul class="garanties">
  <li><span>Livraison</span><span>2 à 4 jours ouvrés, emballage renforcé</span></li>
  <li><span>Retours</span><span>14 jours pour changer d’avis</span></li>
  <li><span>Paiement</span><span>Carte bancaire sécurisée, PayPal</span></li>
</ul>"""


def bloc_avis(p):
    if not p["avis"]:
        return '<p class="attenue">Pas encore d’avis sur ce modèle.</p>'
    return f'<ul class="grille-avis">{"".join(citation_avis(dict(a, produit=p["slug"]), lien_produit=False) for a in p["avis"])}</ul>'


def similaires(p):
    meme = [x for x in PLAQUES if x["collection"] == p["collection"] and x["slug"] != p["slug"]]
    autres = [x for x in PLAQUES if x["best"] and x not in meme and x["slug"] != p["slug"]]
    return (meme + autres)[:4]


def fiche_plaque(p):
    fin0 = finition_defaut(p)
    coll = COLLECTIONS[p["collection"]]
    scenes, vignettes, radios = [], [], []
    for f, nom, alt in FINITIONS:
        cache = "" if f == fin0 else " hidden"
        if a_photo(p["slug"], f):
            scenes.append(f'<div data-scene="{f}"{cache}>{plaque(p, f, "(max-width: 900px) 70vw, 340px", prioritaire=(f == fin0))}</div>')
            vignettes.append(f'<button type="button" class="vignette" data-vue="{f}" aria-pressed="{"true" if f == fin0 else "false"}"><img src="assets/img/p/{p["slug"]}-{f}-440.webp" alt="" width="34" height="68" loading="lazy">{nom}</button>')
        else:
            scenes.append(f'<div data-scene="{f}"{cache}><div class="plaque plaque--vide"><span>Photo de la finition {alt} à venir<br><br>{TODO.format("photo à fournir")}</span></div></div>')
            vignettes.append(f'<button type="button" class="vignette" data-vue="{f}" aria-pressed="false"><span class="vignette__vide"></span>{nom}</button>')
        radios.append(f'<label class="fin-{f}"><input type="radio" name="finition" value="{f}"{" checked" if f == fin0 else ""}>{nom}</label>')
    if p["decor"]:
        scenes.append(f'<div data-scene="situation" hidden>{img(p["decor"], "Mise en situation de la plaque " + p["nom"], "(max-width: 900px) 92vw, 640px", "situation")}</div>')
        vignettes.append(f'<button type="button" class="vignette vignette--situation" data-vue="situation" aria-pressed="false"><img src="assets/img/{p["decor"].replace("-1200", "-640")}" alt="" width="64" height="64" loading="lazy">En situation</button>')
    nb = len(p["avis"])
    moyenne = sum(a["note"] for a in p["avis"]) / nb if nb else 0
    note = (f'<p class="achat__note"><span class="etoiles" aria-hidden="true">{etoiles(moyenne)}</span><a href="#avis">{note_fr(moyenne)} sur 5 · {nb} avis</a></p>'
            if nb else '<p class="achat__note">Pas encore d’avis</p>')
    positions = "".join(f"<option>{x}</option>" for x in POSITIONS_CABLE)
    histoire = "".join(f"<p>{e(x)}</p>" for x in p["histoire"])
    lien = f'<p><a class="lien-fleche" href="{e(p["lien"]["url"])}">En savoir plus : {e(p["lien"]["label"])}</a></p>' if p["lien"] else ""
    figure_decor = (f'<figure>{img(p["decor"], "Mise en situation de la plaque " + p["nom"], "(max-width: 900px) 92vw, 520px")}<figcaption>Mise en situation</figcaption></figure>'
                    if p["decor"] else f'<figure><div class="avant-apres" style="grid-template-columns:repeat(3,minmax(0,1fr))">{"".join(plaque(p, f, "160px") for f, _, _ in FINITIONS if a_photo(p["slug"], f))}</div><figcaption>Les finitions disponibles en photo {TODO.format("mise en situation à fournir")}</figcaption></figure>')
    data_img = " ".join(f'data-img-{f}="assets/img/p/{p["slug"]}-{f}-440.webp"' for f, _, _ in FINITIONS if a_photo(p["slug"], f))
    contenu = f"""
<div class="wrap">
  <nav aria-label="Fil d’Ariane" style="padding-top:28px"><ol class="fil-ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html">Collection</a></li><li><a href="collection.html#{p['collection']}">{coll['nom']}</a></li><li aria-current="page">{e(p['nom'])}</li></ol></nav>
  <div class="fiche" data-fiche data-slug="{p['slug']}" data-nom="{e(p['nom'])}" data-prix="{p['prix']}" data-prix-led="{PRODUITS['led']['prix']}" {data_img}>
    <div class="galerie">
      <div class="galerie__scene">{''.join(scenes)}</div>
      <div class="galerie__vignettes" role="group" aria-label="Vues">{''.join(vignettes)}</div>
    </div>
    <div class="achat">
      <div style="display:grid;gap:12px">
        <p class="cartel-ligne">{cartel(p)}</p>
        <h1>{e(p['nom'])}</h1>
        {note}
      </div>
      <div class="achat__prix"><strong data-prix-affiche>{euros(p['prix'])}</strong><span>TTC, TVA non applicable (art. 293 B du CGI)</span></div>
      <div class="option">
        <p class="option__titre" id="titre-finition">Finition : <output id="finition-choisie">{NOM_FIN[fin0]}</output></p>
        <fieldset class="choix-finition" aria-labelledby="titre-finition">{''.join(radios)}</fieldset>
      </div>
      <div class="option-led">
        <label class="option-led__case"><input type="checkbox" id="option-led"><span><strong>Ajouter le kit LED</strong><small>Ruban RGB, télécommande et alimentation USB. Monté au dos de la plaque avant l’envoi.</small></span><span>+15 €</span></label>
        <div class="champ" data-position-led hidden><label for="position-cable">Sortie du câble</label><select id="position-cable">{positions}</select></div>
      </div>
      <div class="quantite-achat">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer une plaque">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter une plaque">+</button></div>
        <button type="button" class="btn" data-ajouter>Ajouter au panier</button>
      </div>
      {garanties()}
      <dl class="caracteristiques">
        <dt>Format</dt><dd>60 × 30 cm, épaisseur 2 mm</dd>
        <dt>Matière</dt><dd>Aluminium découpé au laser, thermolaqué</dd>
        <dt>Fixation</dt><dd>2 attaches adhésives 3M Command™ fournies, sans perçage</dd>
        <dt>Usage</dt><dd>Intérieur et extérieur</dd>
        <dt>Édition</dt><dd>Série limitée, numérotée au dos</dd>
      </dl>
    </div>
  </div>
</div>
<section class="section section--clair">
  <div class="wrap histoire">
    <div class="offre"><p class="surtitre">L’histoire du modèle</p><h2>{e(p['titre_histoire'])}</h2><div class="texte">{histoire}</div>{lien}</div>
    {figure_decor}
  </div>
</section>
<section class="section" id="avis">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Avis</p><h2>Avis sur {e(p['nom'])}</h2></div>
    {bloc_avis(p)}
  </div>
</section>
<section class="section section--clair">
  <div class="wrap">
    <div class="entete-section entete-section--ligne"><div><p class="surtitre">{coll['nom']}</p><h2>À voir aussi</h2></div><a class="lien-fleche" href="collection.html">Toute la collection</a></div>
    <ul class="grille-produits">{''.join(carte_produit(x) for x in similaires(p))}</ul>
  </div>
</section>
<div class="barre-achat-mobile"><div><strong>{e(p['nom'])}</strong><span data-prix-affiche>{euros(p['prix'])}</span></div><button type="button" class="btn" data-ajouter>Ajouter au panier</button></div>"""
    jsonld = {
        "@context": "https://schema.org", "@type": "Product", "name": p["nom"], "brand": {"@type": "Brand", "name": "Terre Gravée"},
        "description": p["histoire"][0] if p["histoire"] else "",
        "offers": {"@type": "Offer", "price": f"{p['prix']}.00", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": p["url_actuelle"]},
    }
    if nb:
        jsonld["aggregateRating"] = {"@type": "AggregateRating", "ratingValue": note_fr(moyenne).replace(",", "."), "reviewCount": nb}
    page(f"produit-{p['slug']}.html", f"{p['nom']}, plaque murale en aluminium · Terre Gravée",
         f"Plaque murale {p['nom']} en aluminium découpé au laser, 60 × 30 cm, en noir, gris ou doré. Série limitée numérotée, fabriquée dans le Sud-Ouest.",
         contenu, jsonld=jsonld)


def fiche_accessoire(p):
    led = p["slug"] == "led"
    if led:
        vues = [("led-img0", "Plaque L’Ours rétroéclairée en bleu", "Bleu"), ("led-img1", "Plaque Le Pic du Midi rétroéclairée en vert", "Vert"),
                ("led-img2", "Ruban LED collé au dos d’une plaque", "Ruban"), ("led-img3", "Télécommande et boîtier du kit LED", "Télécommande")]
        scenes = "".join(f'<div data-scene="{k}"{"" if i == 0 else " hidden"}>{img("led/" + k + ".webp", alt, "(max-width: 900px) 92vw, 640px", "situation", "eager" if i == 0 else "lazy")}</div>' for i, (k, alt, _) in enumerate(vues))
        vignettes = "".join(f'<button type="button" class="vignette vignette--situation" data-vue="{k}" aria-pressed="{"true" if i == 0 else "false"}"><img src="assets/img/led/{k}.webp" alt="" width="64" height="64" loading="lazy">{n}</button>' for i, (k, _, n) in enumerate(vues))
        positions = "".join(f"<option>{x}</option>" for x in POSITIONS_CABLE)
        options = f"""<div class="option"><div class="champ"><label for="position-cable">Sortie du câble sur votre plaque</label><select id="position-cable">{positions}</select><small>Le kit est collé au dos de la plaque avant l’envoi. Indiquez où vous voulez la sortie du câble.</small></div></div>"""
        details = f"""<dl class="caracteristiques">
        <dt>Ruban</dt><dd>LED RGB autocollant, raccord Pico, {TODO.format("2 m ou 1,5 m ?")}</dd>
        <dt>Commande</dt><dd>Télécommande infrarouge, boutons sur le ruban, application smartphone</dd>
        <dt>Alimentation</dt><dd>USB, adaptateur secteur non fourni</dd>
        <dt>Origine</dt><dd>Non fabriqué en France, choisi pour sa compatibilité</dd>
      </dl>"""
        cartel_txt, image_panier, carre = "Option rétroéclairage", "assets/img/led/led-img0.webp", "0"
        histoire = """<p>Nous proposons ce kit pour vous éviter de chercher vous-même un modèle compatible. Vous restez libre d’utiliser une autre bande LED : nos plaques s’adaptent à la plupart des rubans du marché.</p>
<p>L’application permet de programmer des horaires, de faire varier les couleurs ou de synchroniser la lumière avec la musique.</p>"""
        titre_h, suite = "Une solution clé en main", '<p><a class="lien-fleche" href="installation.html#led">Voir la notice de pose</a></p>'
    else:
        scenes = f'<div data-scene="carte">{img("misc/carte-cadeau.webp", "Carte cadeau Terre Gravée", "(max-width: 900px) 92vw, 520px", "situation", "eager")}</div>'
        vignettes, options = "", ""
        details = """<dl class="caracteristiques">
        <dt>Valeur</dt><dd>Une plaque au choix</dd>
        <dt>Validité</dt><dd>Tous les modèles disponibles sur la boutique</dd>
        <dt>Envoi</dt><dd>Immédiat par e-mail, ou à imprimer chez vous</dd>
      </dl>"""
        cartel_txt, image_panier, carre = "Idée cadeau", "assets/img/misc/carte-cadeau.webp", "1"
        histoire = "<p>Vous souhaitez offrir une plaque mais vous hésitez sur le modèle ? Avec la carte cadeau, la personne choisit le dessin qui lui plaît vraiment.</p><p>Un cadeau sans risque d’erreur, pour toutes les occasions.</p>"
        titre_h, suite = "Laisser choisir", ""
    contenu = f"""
<div class="wrap">
  <nav aria-label="Fil d’Ariane" style="padding-top:28px"><ol class="fil-ariane"><li><a href="index.html">Accueil</a></li><li><a href="collection.html#accessoires">Accessoires</a></li><li aria-current="page">{e(p['nom'])}</li></ol></nav>
  <div class="fiche" data-fiche data-type="{'led' if led else 'carte'}" data-slug="{p['slug']}" data-nom="{e(p['nom'])}" data-prix="{p['prix']}" data-image="{image_panier}" data-carre="{carre}">
    <div class="galerie">
      <div class="galerie__scene">{scenes}</div>
      {f'<div class="galerie__vignettes" role="group" aria-label="Vues">{vignettes}</div>' if vignettes else ''}
    </div>
    <div class="achat">
      <div style="display:grid;gap:12px"><p class="cartel-ligne">{cartel_txt}</p><h1>{e(p['nom'])}</h1></div>
      <div class="achat__prix"><strong data-prix-affiche>{euros(p['prix'])}</strong><span>TTC, TVA non applicable (art. 293 B du CGI)</span></div>
      {options}
      <div class="quantite-achat">
        <div class="quantite"><button type="button" data-qte="-1" aria-label="Retirer un article">−</button><input id="quantite" type="number" min="1" max="9" value="1" aria-label="Quantité"><button type="button" data-qte="1" aria-label="Ajouter un article">+</button></div>
        <button type="button" class="btn" data-ajouter>Ajouter au panier</button>
      </div>
      {details}
    </div>
  </div>
</div>
<section class="section section--clair">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="offre"><p class="surtitre">En détail</p><h2>{titre_h}</h2><div class="texte">{histoire}</div>{suite}</div>
    <div class="offre"><p class="surtitre">À associer</p><ul class="grille-produits" style="grid-template-columns:repeat(2,minmax(0,1fr))">{carte_produit(PRODUITS['le-pic-du-midi'])}{carte_produit(PRODUITS['lours'])}</ul></div>
  </div>
</section>
<div class="barre-achat-mobile"><div><strong>{e(p['nom'])}</strong><span data-prix-affiche>{euros(p['prix'])}</span></div><button type="button" class="btn" data-ajouter>Ajouter au panier</button></div>"""
    page(f"produit-{p['slug']}.html", f"{p['nom']} · Terre Gravée",
         "Kit LED RGB pour rétroéclairer une plaque Terre Gravée, monté avant l’envoi. 15 €." if led else
         "Carte cadeau Terre Gravée : une plaque au choix du destinataire, envoyée par e-mail. 65 €.",
         contenu)


# ---------- Sur mesure ----------

def sur_mesure():
    options_modeles = "".join(f"<option>{e(p['nom'])}</option>" for p in PLAQUES)
    contenu = f"""
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Créations spéciales</p>
    <h1>Sur mesure</h1>
    <p class="chapo">Un modèle vous plaît mais il vous le faut plus grand, dans un autre métal ou en série ? Voici ce que l’atelier peut faire.</p>
  </header>
</div>
<section class="section" style="padding-top:0">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Dès une plaque</p>
      <h2>Adapter un modèle existant</h2>
      <ul class="liste-simple">
        <li>Un autre format, jusqu’à 2 m × 1 m</li>
        <li>Un autre métal : aluminium dans la teinte RAL de votre choix, acier Corten, aluminium brut</li>
        <li>Un autre système de fixation ou de support</li>
      </ul>
      <p class="attenue">Possible à partir d’une seule plaque, selon faisabilité.</p>
    </div>
    <div class="paire-materiaux">
      <figure><div class="plaque">{img("misc/mauvezin-corten.webp", "Plaque Le Château de Mauvezin en acier Corten", "(max-width: 900px) 40vw, 240px")}</div><figcaption>Acier Corten</figcaption></figure>
      <figure><div class="plaque">{img("misc/mauvezin-brut.webp", "Plaque Le Château de Mauvezin en aluminium brut", "(max-width: 900px) 40vw, 240px")}</div><figcaption>Aluminium brut</figcaption></figure>
    </div>
  </div>
</section>
<section class="section section--clair">
  <div class="wrap deux-colonnes">
    <figure>{img("misc/autres-plaques.webp", "Planche de dix-huit dessins inédits : Payolle, la brèche de Roland, le gypaète barbu, l’iris des Pyrénées…", "(max-width: 900px) 92vw, 600px")}<figcaption>Quelques dessins inédits de l’atelier</figcaption></figure>
    <div class="offre">
      <p class="surtitre">Quantité très limitée</p>
      <h2>Plaques exclusives</h2>
      <p class="attenue">Certains dessins ne sont pas encore entrés dans la collection. Ils sont proposés en très petite quantité, parfois en exemplaire unique : paysages confidentiels, inspirations originales.</p>
      <p class="attenue">Elles sortent ponctuellement sur le site ou sur demande. La lettre d’information prévient de chaque sortie.</p>
      <p><a class="lien-fleche" href="index.html#lettre">S’inscrire à la lettre</a></p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Professionnels, collectivités, lieux culturels</p>
      <h2>Séries sur demande</h2>
      <p class="attenue">Nous créons des séries de plaques dans l’esprit Terre Gravée, par exemple :</p>
      <ul class="liste-simple">
        <li>une frise décorative qui raconte une histoire locale</li>
        <li>un ensemble de plaques signalétiques au style artistique</li>
        <li>des éditions spéciales pour une exposition, un événement ou un lieu touristique</li>
      </ul>
      <p class="attenue">La quantité minimale dépend du projet.</p>
    </div>
    <figure>{img("misc/aquensis.webp", "Plaques Terre Gravée exposées dans le centre thermal Aquensis", "(max-width: 900px) 92vw, 600px")}<figcaption>Plaques Terre Gravée à Aquensis, Bagnères-de-Bigorre</figcaption></figure>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap"><div class="encadre" style="max-width:760px"><h3>Ce que nous ne faisons pas</h3><p class="attenue">Nous ne réalisons pas de pièce 100 % personnalisée sur simple demande (prénom, citation, photo). Chaque dessin suit la démarche artistique de l’atelier.</p></div></div>
</section>
<section class="section section--clair" id="demande">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="entete-section"><p class="surtitre">Demande de devis</p><h2>Décrire votre projet</h2><p class="chapo">Plus la demande est précise, plus la réponse sera rapide. Un croquis ou une photo aide beaucoup.</p></div>
    <div>
      <form class="formulaire" data-demo>
        <div class="champs">
          <div class="champ"><label for="type-demande">Type de demande</label><select id="type-demande"><option>Adapter un modèle existant</option><option>Plaque exclusive</option><option>Série pour un professionnel</option></select></div>
          <div class="champ"><label for="modele">Modèle de départ</label><select id="modele"><option>Aucun en particulier</option>{options_modeles}</select></div>
          <div class="champ"><label for="metal">Métal souhaité</label><select id="metal"><option>Aluminium thermolaqué (teinte RAL)</option><option>Acier Corten</option><option>Aluminium brut</option><option>Je ne sais pas encore</option></select></div>
          <div class="champ"><label for="format">Format</label><input id="format" type="text" placeholder="Par exemple 120 × 60 cm"><small>Jusqu’à 2 m × 1 m</small></div>
          <div class="champ"><label for="quantite-projet">Quantité</label><input id="quantite-projet" type="number" min="1" value="1"></div>
          <div class="champ"><label for="usage">Usage</label><select id="usage"><option>Intérieur</option><option>Extérieur</option><option>Les deux</option></select></div>
          <div class="champ champ--large"><label for="message-projet">Votre projet</label><textarea id="message-projet" placeholder="Lieu, support, délai souhaité…"></textarea></div>
          <div class="champ champ--large"><label for="fichier">Fichier (facultatif)</label><input id="fichier" type="file"></div>
          <div class="champ"><label for="nom-projet">Nom</label><input id="nom-projet" type="text" autocomplete="name" required></div>
          <div class="champ"><label for="email-projet">E-mail</label><input id="email-projet" type="email" autocomplete="email" required></div>
        </div>
        <div><button class="btn" type="submit">Envoyer la demande</button></div>
        <p class="message-demo" tabindex="-1" hidden>Maquette : ce formulaire n’envoie rien. Sur le site, la demande arrivera dans la boîte contact@terregravee.fr.</p>
      </form>
    </div>
  </div>
</section>"""
    page("sur-mesure.html", "Créations sur mesure · Terre Gravée",
         "Plaques en métal sur mesure : grand format jusqu’à 2 × 1 m, acier Corten, aluminium brut, séries pour professionnels et collectivités.",
         contenu, actif="sur-mesure.html")


# ---------- Savoir-faire ----------

def savoir_faire():
    contenu = f"""
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">À propos</p>
    <h1>Une histoire gravée dans le métal</h1>
    <p class="chapo">Terre Gravée est née d’une passion pour le patrimoine, la nature et le design. Nous créons des plaques décoratives en métal découpé au laser, inspirées des paysages, de la faune et de l’histoire de nos régions.</p>
  </header>
</div>
<section class="section" style="padding-top:0">
  <div class="wrap deux-colonnes">
    <figure>{img("d/la-tour-des-jacobins-decor2-1200.webp", "Plaque La Tour des Jacobins dorée dans un salon", "(max-width: 900px) 92vw, 560px")}<figcaption>La Tour des Jacobins, finition dorée</figcaption></figure>
    <div class="offre">
      <h2>Raconter un lieu</h2>
      <div class="texte">
        <p>Chaque création raconte l’histoire d’un lieu, d’un symbole ou d’une émotion ancrée dans nos terres. Le Pic du Midi, la tour des Jacobins, l’isard : des repères que l’on reconnaît au premier coup d’œil.</p>
        <p>Nous croyons en une production à taille humaine, en séries limitées, dans le respect des matériaux, des savoir-faire et de notre territoire. Chaque plaque est pensée pour durer.</p>
      </div>
    </div>
  </div>
</section>
{reperes()}
<section class="section section--clair">
  <div class="wrap atelier">
    <div>
      <div class="entete-section"><p class="surtitre">Fabrication locale</p><h2>Quatre étapes, un seul territoire</h2>
        <p class="chapo">Notre volonté : mettre en lumière les savoir-faire du Sud-Ouest. Toutes nos plaques sont réalisées dans un rayon de 150 km.</p></div>
      {etapes(avec_liens=True)}
    </div>
    {avant_apres()}
  </div>
</section>
<section class="section">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Série limitée</p>
      <h2>Un numéro au dos de chaque plaque</h2>
      <p class="attenue">Chaque modèle est édité en quantité limitée. Le numéro gravé au dos fait de chaque plaque une pièce de collection.</p>
      <p><a class="btn" href="collection.html">Voir la collection</a></p>
    </div>
    <div class="avant-apres" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      {plaque(PRODUITS["le-tourmalet"], "noir", "160px")}{plaque(PRODUITS["le-pont-despagne"], "dore", "160px")}{plaque(PRODUITS["la-marmotte"], "gris", "160px")}
    </div>
  </div>
</section>"""
    page("savoir-faire.html", "L’atelier et la fabrication · Terre Gravée",
         "Dessinées par des illustratrices, découpées à Revel, thermolaquées et expédiées à Bagnères-de-Bigorre : la fabrication des plaques Terre Gravée.",
         contenu, actif="savoir-faire.html")


# ---------- Installation ----------

def installation():
    contenu = f"""
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Aide</p>
    <h1>Installation et kit LED</h1>
    <p class="chapo">La pose prend quelques minutes et ne demande aucun outil.</p>
  </header>
</div>
<section class="section" style="padding-top:0">
  <div class="wrap deux-colonnes">
    <div class="offre">
      <p class="surtitre">Fixation</p>
      <h2>Une pose sans perçage</h2>
      <div class="texte">
        <p>Chaque plaque est livrée avec deux fixations adhésives 3M Command™. L’installation est simple et rapide, sans perçage.</p>
        <p>Les fixations créent un léger décalage avec le mur. Les volumes ressortent et la découpe projette ses ombres.</p>
      </div>
      <p><a class="lien-fleche" href="https://command.3mfrance.fr/3M/fr_FR/command-EU/how-to/how-to-hang-picture-without-nails/#Stepbystep">Notice de pose sur le site 3M</a></p>
    </div>
    <div class="paire-materiaux">
      <figure>{plaque(PRODUITS["le-pic-du-midi"], "gris", "(max-width: 900px) 40vw, 240px")}<figcaption>60 × 30 cm, 2 mm d’épaisseur</figcaption></figure>
      <figure><div class="plaque">{img("tuto/tuto-1.webp", "Dos d’une plaque avec le ruban LED en place", "(max-width: 900px) 40vw, 240px")}</div><figcaption>Le dos de la plaque, ruban LED posé</figcaption></figure>
    </div>
  </div>
</section>
<section class="section section--clair" id="led">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Kit LED</p><h2>Poser le rétroéclairage</h2>
      <p class="chapo">Commandé avec une plaque, le kit est monté par l’atelier. Si vous l’installez vous-même, suivez ces cinq étapes.</p></div>
    <div class="deux-colonnes deux-colonnes--haut" style="margin-bottom:48px">
      <figure>{img("tuto/tuto-0.webp", "Contenu du kit LED", "(max-width: 900px) 92vw, 560px")}<figcaption>Le contenu du kit</figcaption></figure>
      <ul class="liste-simple">
        <li>Ruban LED avec raccord Pico {TODO.format("longueur : 1,5 m ici, 2 m sur la fiche")}</li>
        <li>Contrôleur intégré au ruban</li>
        <li>Alimentation USB (adaptateur secteur non fourni)</li>
        <li>Télécommande infrarouge</li>
        <li>Application smartphone, à télécharger avec le QR code du pack</li>
      </ul>
    </div>
    <ol class="tableau-etapes">
      <li>{img("tuto/tuto-2.webp", "Décollement progressif de la bande adhésive du ruban", "(max-width: 900px) 92vw, 280px")}<h3>Préparer</h3><p>Choisissez l’emplacement de l’alimentation (prise, discrétion). Nettoyez le dos de la plaque, puis collez le ruban en suivant le contour, en commençant côté raccord Pico. Décollez la bande adhésive petit à petit.</p></li>
      <li>{img("tuto/tuto-4.webp", "Ruban LED formant un arrondi dans un angle", "(max-width: 900px) 92vw, 280px")}<h3>Faire les angles</h3><p>Formez un arrondi doux à chaque angle, sans pli brusque. Faites le tour complet, ou un retour vers l’intérieur s’il reste de la place.</p></li>
      <li>{img("tuto/tuto-5.webp", "Découpe du ruban LED sur une zone de coupe", "(max-width: 900px) 92vw, 280px")}<h3>Ajuster la longueur</h3><p>Coupez l’excédent uniquement sur une zone de découpe, repérée par un petit espace doré sur le ruban.</p></li>
      <li>{img("tuto/tuto-6.webp", "Branchement du raccord Pico", "(max-width: 900px) 92vw, 280px")}<h3>Raccorder</h3><p>Branchez le raccord Pico en respectant le sens des flèches.</p></li>
      <li>{img("tuto/tuto-7.webp", "Télécommande du kit LED", "(max-width: 900px) 92vw, 280px")}<h3>Régler la lumière</h3><p>Télécommande, boutons du ruban ou application : couleur, intensité, minuteur et effets.</p></li>
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Questions fréquentes</p><h2>Avant de poser</h2></div>
    <div class="faq">
      <details><summary>La plaque peut-elle aller en extérieur ?</summary><div><p>Oui. L’aluminium thermolaqué tient en extérieur comme en intérieur.</p><p>{TODO.format("à préciser")} la fixation conseillée dehors : les attaches Command classiques sont prévues pour l’intérieur.</p></div></details>
      <details><summary>Le kit LED est-il nécessaire ?</summary><div><p>Non, c’est une option. La plaque se pose seule avec les deux fixations fournies.</p></div></details>
      <details><summary>Puis-je utiliser un autre ruban LED ?</summary><div><p>Oui. Nos plaques sont compatibles avec la plupart des bandes LED du marché.</p></div></details>
      <details><summary>Où trouver le numéro de ma plaque ?</summary><div><p>Il est gravé au dos. Chaque modèle est édité en série limitée.</p></div></details>
    </div>
  </div>
</section>"""
    page("installation.html", "Installation et kit LED · Terre Gravée",
         "Poser une plaque Terre Gravée sans perçage avec les fixations 3M Command fournies, et installer le kit LED de rétroéclairage en cinq étapes.",
         contenu, actif="installation.html")


# ---------- Contact ----------

def contact():
    contenu = f"""
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Contact</p>
    <h1>Une question, un projet ?</h1>
    <p class="chapo">Écrivez-nous. Pour une demande sur mesure, le formulaire dédié permet de tout préciser en une fois.</p>
  </header>
</div>
<section class="section" style="padding-top:0">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <dl class="coordonnees">
      <div><dt>E-mail</dt><dd class="copie"><code id="adresse-email">contact@terregravee.fr</code><button type="button" data-copier="adresse-email">Copier</button></dd></div>
      <div><dt>Atelier</dt><dd>16 rue du Pic du Midi<br>65200 Gerde</dd></div>
      <div><dt>Réseaux</dt><dd>Instagram, Facebook {TODO.format("liens à fournir")}</dd></div>
      <div><dt>Sur mesure</dt><dd><a class="lien-fleche" href="sur-mesure.html#demande">Formulaire de projet</a></dd></div>
    </dl>
    <div>
      <form class="formulaire" data-demo>
        <div class="champs">
          <div class="champ"><label for="nom-contact">Nom</label><input id="nom-contact" type="text" autocomplete="name" required></div>
          <div class="champ"><label for="email-contact">E-mail</label><input id="email-contact" type="email" autocomplete="email" required></div>
          <div class="champ champ--large"><label for="sujet">Sujet</label><select id="sujet"><option>Une commande en cours</option><option>Une question sur un modèle</option><option>Un projet sur mesure</option><option>Autre</option></select></div>
          <div class="champ champ--large"><label for="message-contact">Message</label><textarea id="message-contact" required></textarea></div>
        </div>
        <div><button class="btn" type="submit">Envoyer</button></div>
        <p class="message-demo" tabindex="-1" hidden>Maquette : ce formulaire n’envoie rien. Sur le site, le message arrivera dans la boîte contact@terregravee.fr.</p>
      </form>
    </div>
  </div>
</section>
<section class="section section--clair" id="faq">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Livraison, retours, paiement</p><h2>Questions fréquentes</h2></div>
    <div class="faq">
      <details open><summary>Quels sont les délais de livraison ?</summary><div><p>Comptez 2 à 4 jours ouvrés. Ce délai est indicatif ; en cas de retard, nous vous prévenons.</p></div></details>
      <details><summary>Combien coûte la livraison ?</summary><div><p>Les frais dépendent du poids et de la destination. Ils s’affichent avant la validation de la commande.</p><p>{TODO.format("à compléter")} un tarif indicatif ou un seuil de gratuité.</p></div></details>
      <details><summary>Puis-je retourner une plaque ?</summary><div><p>Oui. Vous disposez de 14 jours après réception pour changer d’avis, sans avoir à vous justifier. Prévenez-nous par e-mail ; la plaque doit revenir dans son état d’origine et les frais de retour restent à votre charge.</p><p>Les pièces personnalisées ou fabriquées sur demande ne peuvent pas être retournées.</p></div></details>
      <details><summary>Ma plaque est arrivée abîmée, que faire ?</summary><div><p>Envoyez-nous une photo et une description du problème par e-mail. Toutes nos plaques bénéficient des garanties légales de conformité et des vices cachés.</p></div></details>
      <details><summary>Quels moyens de paiement acceptez-vous ?</summary><div><p>La carte bancaire par une solution sécurisée, PayPal (y compris en 4 fois sans frais), Apple Pay et Google Pay.</p></div></details>
      <details><summary>Comment fonctionne la carte cadeau ?</summary><div><p>Elle vaut une plaque, au choix du destinataire, sur tous les modèles disponibles. Elle est envoyée par e-mail dès la commande.</p></div></details>
    </div>
  </div>
</section>"""
    page("contact.html", "Contact · Terre Gravée",
         "Contacter Terre Gravée : questions sur une plaque, une commande ou un projet sur mesure. Atelier à Gerde, près de Bagnères-de-Bigorre.",
         contenu, actif="contact.html")


# ---------- Notes de refonte ----------

CONSTATS = [
    ("urgent", "Les liens Facebook, Instagram et X de la page Contact mènent aux comptes de Hostinger.",
     "Ce sont les liens par défaut du thème. À remplacer par vos comptes, ou à retirer."),
    ("urgent", "Un produit vide « AUTO-DRAFT » est publié.",
     "L’adresse /produits/tr/ apparaît dans le catalogue et peut être indexée par Google. À mettre à la corbeille dans WooCommerce › Produits."),
    ("urgent", "Les mentions légales contiennent encore des champs à remplir.",
     "La page affiche « SIRET : [à compléter] » et « Téléphone : [optionnel] ». Le numéro de téléphone de l’hébergeur, exigé par la LCEN, manque aussi."),
    ("urgent", "Les CGV pointent vers un mauvais domaine.",
     "Le lien affiché « www.terregravee.fr » mène en réalité à www.terresgravees.fr, qui ne répond pas. Le lien vers la politique de confidentialité est vide, et le vendeur est nommé « Terres Gravées »."),
    ("important", "Aucun médiateur de la consommation n’est nommé.",
     "Les CGV renvoient vers un site générique. Le Code de la consommation (art. L612-1 et L616-1) impose d’indiquer le médiateur auquel vous adhérez : nom, site et adresse."),
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
     "Le Cerf en noir et L’Abbaye de l’Escaladieu en doré. La maquette le signale par un emplacement vide."),
    ("important", "La longueur du ruban LED change selon la page.",
     "2 mètres sur la fiche du kit, 1,5 mètre sur la page Infos & installation."),
    ("confort", "La fiche produit est lourde et le prix arrive tard.",
     "225 requêtes et 2,5 Mo de scripts : Stripe, PayPal, Apple Pay, Google Pay et hCaptcha se chargent dès l’affichage d’une plaque. Le prix apparaît sous les boutons de paiement."),
    ("confort", "Les descriptions Google se répètent.",
     "À propos, Contact et la boutique partagent la même description (« Découvrez nos articles… »), qui évoque un blog inexistant. Celle de Créations spéciales dépasse 400 caractères."),
    ("confort", "Le pied de page liste les variantes du nom.",
     "« Terre Gravé, Terregrave, Terres gravees… » ressemble à du bourrage de mots-clés. Ces variantes peuvent passer dans les données structurées (alternateName), comme dans la maquette."),
    ("confort", "Quelques fautes et accents manquants.",
     "« Meilleurs ventes », « Serie limitée », « Retro-eclairage », « Le Chateau de Mauvezin », « Condition general de vente », « A propos », et « Terres Gravées » dans les fiches produit."),
    ("confort", "Plusieurs images n’ont pas de texte alternatif.",
     "Les photos du Pic du Midi et les mises en situation n’ont pas de description. Elle sert à l’accessibilité et à Google Images."),
    ("confort", "Les avis affichent le nom complet des clients.",
     "Le prénom et l’initiale du nom suffisent (« Sophia P. »). La maquette applique cette règle."),
]

COMPARAISON = [
    ("Accueil", "Une grande photo, six blocs d’icônes, puis deux fois les mêmes produits.",
     "Un mur d’exposition avec simulation du rétroéclairage, les trois collections, les meilleures ventes et les avis."),
    ("Finitions", "Un menu déroulant sur la fiche produit.",
     "Des pastilles sur chaque carte et un bouton « Voir en noir, gris ou doré » pour toute la collection."),
    ("Kit LED", "Un produit séparé, proposé en « Vous aimerez peut-être aussi ».",
     "Une case à cocher sur la fiche de chaque plaque, avec la sortie du câble et le prix mis à jour."),
    ("Fiche produit", "Le prix sous les boutons de paiement ; le format caché dans un onglet.",
     "Prix en tête, format, matière et fixation visibles, livraison et retours résumés."),
    ("Repères", "Aucun.", "Chaque plaque a son cartel : lieu, altitude ou nom latin de l’animal."),
    ("Sur mesure", "Un texte, puis un renvoi vers le formulaire de contact.",
     "Les offres détaillées et un formulaire de demande guidé (métal, format, quantité, fichier)."),
    ("Mobile", "Bandeau cookies sur un tiers de l’écran, bouton d’achat hors de vue.",
     "Bouton d’achat fixé en bas d’écran sur la fiche produit."),
    ("Écran sombre", "Non géré.", "La maquette suit le réglage clair ou sombre de l’appareil."),
    ("Poids des pages", "Accueil : 92 requêtes, 2,6 Mo. Fiche produit : 225 requêtes, 3,3 Mo.",
     "Accueil : 24 requêtes, 0,75 Mo. Fiche produit : 16 requêtes, 0,4 Mo. Mesure faite sans les scripts de paiement et de statistiques, qui ne devraient se charger qu’au panier."),
]

A_FOURNIR = [
    "Les adresses de vos comptes Instagram et Facebook.",
    "Les photos manquantes : Le Cerf en noir, L’Abbaye de l’Escaladieu en doré, une mise en situation du Cirque de Gavarnie et du Cerf.",
    "La longueur exacte du ruban LED (1,5 m ou 2 m).",
    "Le nom et les coordonnées de votre médiateur de la consommation.",
    "Les frais de port, ou au moins un tarif indicatif.",
    "La fixation conseillée pour une pose en extérieur.",
    "Votre avis sur le logo : la maquette utilise une signature typographique au pochoir, comme les titres gravés sur vos plaques. Votre emblème actuel peut être conservé, idéalement redessiné en vectoriel.",
]


def notes():
    constats = "".join(
        f'<li><h3><span class="niveau niveau--{n}">{n}</span>{e(t)}</h3><p>{e(d)}</p></li>' for n, t, d in CONSTATS)
    lignes = "".join(f"<tr><td>{e(a)}</td><td>{e(b)}</td><td>{e(c)}</td></tr>" for a, b, c in COMPARAISON)
    fournir = "".join(f"<li>{e(x)}</li>" for x in A_FOURNIR)
    contenu = f"""
<div class="wrap">
  <header class="entete-page">
    <p class="surtitre">Notes de refonte · relevé du 28 octobre 2026</p>
    <h1>Ce que change la maquette</h1>
    <p class="chapo">La maquette reprend le contenu réel de terregravee.fr (textes, photos, prix, avis) dans une nouvelle présentation. Elle ne modifie pas le site en ligne.</p>
  </header>
</div>
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">{len(CONSTATS)} constats</p><h2>À corriger sur le site actuel</h2>
      <p class="chapo">Classés par urgence. Les quatre premiers se corrigent en quelques minutes depuis WordPress.</p></div>
    <ol class="notes">{constats}</ol>
  </div>
</section>
<section class="section section--clair">
  <div class="wrap">
    <div class="entete-section"><p class="surtitre">Avant, après</p><h2>Ce que propose la maquette</h2></div>
    <div class="tableau-defile"><table class="tableau"><thead><tr><th>Sujet</th><th>Site actuel</th><th>Maquette</th></tr></thead><tbody>{lignes}</tbody></table></div>
  </div>
</section>
<section class="section">
  <div class="wrap deux-colonnes deux-colonnes--haut">
    <div class="entete-section"><p class="surtitre">Pour finir la maquette</p><h2>Informations à fournir</h2>
      <p class="chapo">Les emplacements concernés sont signalés dans les pages par {TODO.format("à compléter")}.</p></div>
    <ul class="liste-simple">{fournir}</ul>
  </div>
</section>
<section class="section section--clair">
  <div class="wrap"><div class="encadre" style="max-width:820px"><h3>Et ensuite ?</h3>
    <p class="attenue">Si cette direction vous plaît, elle peut être appliquée au site WordPress actuel (thème enfant et blocs), sans changer de WooCommerce ni perdre les commandes et les avis. Cette étape demandera un accès administrateur au site.</p></div></div>
</section>"""
    page("notes.html", "Notes de refonte · Terre Gravée",
         "Relevé des problèmes du site actuel et des changements proposés par la maquette.", contenu)


if __name__ == "__main__":
    accueil()
    collection()
    for produit in CATALOGUE:
        if produit["collection"] == "accessoires":
            fiche_accessoire(produit)
        else:
            fiche_plaque(produit)
    sur_mesure()
    savoir_faire()
    installation()
    contact()
    notes()
    print("Pages générées dans", ICI)
