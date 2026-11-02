#!/usr/bin/env python3
"""Thème WordPress « Terre Gravée » : génère, à partir de la maquette v4, les fichiers qui en dépendent.

Ce que le script écrit (le reste du thème est écrit à la main et n'est jamais modifié ici) :
  terre-gravee/assets/galerie.css, assets/fonts/, assets/img/   copie de la maquette (styles, polices, images utiles)
  terre-gravee/patterns/page-*.php                              une composition par section des pages de la maquette
  terre-gravee/inc/donnees-produits.php                         textes des fiches (cartel, phrase, « Le lieu », histoire…)
  terre-gravee/inc/fragments.php                                morceaux fixes des fiches produit (caractéristiques…)
  contenu-terre-gravee.xml                                      fichier d'import WordPress (pages et menu)
  terre-gravee.zip                                              le thème, prêt à téléverser

Usage :  python3 generer.py            (Python 3.8 ou plus récent, bibliothèque standard)
Le script lit les pages HTML déjà construites de la maquette : lancer d'abord « python3 build.py » dans versions/v4-galerie.
"""
import datetime
import html
import json
import os
import re
import shutil
import sys
import zipfile
from html.parser import HTMLParser

sys.dont_write_bytecode = True
ICI = os.path.dirname(os.path.abspath(__file__))
V4 = os.path.normpath(os.path.join(ICI, "..", "versions", "v4-galerie"))
THEME = os.path.join(ICI, "terre-gravee")
SLUG_THEME = "terre-gravee"
# Adresse des images du thème dans le contenu importé (le dossier du thème garde le nom « terre-gravee »).
# Le thème remplace ce préfixe à l'affichage s'il est installé ailleurs (inc/contenu.php).
PREFIXE_IMG = "/wp-content/themes/{}/assets/img/".format(SLUG_THEME)
sys.path.insert(0, V4)
import build as B  # noqa: E402  (la maquette : textes, catalogue, géographie)

# Pages de la maquette importées dans WordPress, avec l'adresse qu'elles gardent sur le site en ligne (URL_EN_LIGNE de build.py)
PAGES = [
    # fichier, titre WordPress, slug, ordre dans le menu des pages
    ("index.html", "Accueil", "accueil"),
    ("carte.html", "Carte des lieux", "carte-des-lieux"),
    ("atelier.html", "L’atelier", "propos"),
    ("sur-mesure.html", "Sur mesure", "creations"),
    ("installation.html", "Installation", "tuto"),
    ("contact.html", "Contact", "contact"),
    ("cgv.html", "Conditions générales de vente", "cgv"),
    ("mentions-legales.html", "Mentions légales", "mentions-legales"),
    ("confidentialite.html", "Confidentialité et cookies", "politique"),
]
LIENS = {
    "index.html": "/", "collection.html": "/produits/", "carte.html": "/carte-des-lieux/", "atelier.html": "/propos/",
    "sur-mesure.html": "/creations/", "installation.html": "/tuto/", "contact.html": "/contact/", "cgv.html": "/cgv/",
    "mentions-legales.html": "/mentions-legales/", "confidentialite.html": "/politique/", "qr.html": "/",
}
for _p in B.CATALOGUE:
    LIENS["produit-{}.html".format(_p["slug"])] = "/produits/{}/".format(_p["slug"])
MENU = [("Collection", "/produits/"), ("Carte", "/carte-des-lieux/"), ("L’atelier", "/propos/"),
        ("Sur mesure", "/creations/"), ("Contact", "/contact/")]
assert [n for _, n in B.NAV] == [n for n, _ in MENU], "Menu de la maquette changé : mettre MENU à jour"

VIDES = {"img", "br", "input", "meta", "link", "source", "hr", "wbr", "col", "area", "base", "embed", "param", "track"}
CASSE_SVG = {x.lower(): x for x in ["viewBox", "preserveAspectRatio", "gradientUnits", "gradientTransform", "patternUnits",
                                     "stdDeviation", "textLength", "clipPathUnits", "linearGradient", "radialGradient",
                                     "clipPath", "foreignObject", "feGaussianBlur", "textPath", "patternContentUnits",
                                     "markerWidth", "markerHeight", "refX", "refY", "pathLength", "startOffset"]}


# ---------------------------------------------------------------------------
# Arbre HTML minimal
# ---------------------------------------------------------------------------
class Noeud:
    def __init__(self, tag, attrs, auto=False):
        self.tag, self.attrs, self.enfants, self.auto = tag, list(attrs), [], auto

    def attr(self, k, defaut=None):
        for a, v in self.attrs:
            if a == k:
                return v
        return defaut

    def a(self, k):
        return any(a == k for a, _ in self.attrs)

    def classes(self):
        return (self.attr("class") or "").split()

    def elements(self):
        return [e for e in self.enfants if isinstance(e, Noeud)]


class Texte:
    def __init__(self, data):
        self.data = data


class Lecteur(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.racine = Noeud("#racine", [])
        self.pile = [self.racine]

    def handle_starttag(self, tag, attrs):
        n = Noeud(tag, attrs)
        self.pile[-1].enfants.append(n)
        if tag not in VIDES:
            self.pile.append(n)

    def handle_startendtag(self, tag, attrs):
        self.pile[-1].enfants.append(Noeud(tag, attrs, auto=True))

    def handle_endtag(self, tag):
        if tag in VIDES:
            return
        for i in range(len(self.pile) - 1, 0, -1):
            if self.pile[i].tag == tag:
                del self.pile[i:]
                return

    def handle_data(self, data):
        self.pile[-1].enfants.append(Texte(data))


def lire(fragment):
    lec = Lecteur()
    lec.feed(fragment)
    lec.close()
    return lec.racine


def esc_t(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def esc_a(t):
    return t.replace("&", "&amp;").replace('"', "&quot;")


def ser_attrs(n):
    out = []
    for k, v in n.attrs:
        k = CASSE_SVG.get(k, k)
        out.append(" " + k if v is None else ' {}="{}"'.format(k, esc_a(v)))
    return "".join(out)


def ser(n, brut=False):
    if isinstance(n, Texte):
        return n.data if brut else esc_t(n.data)
    if n.tag == "#racine":
        return "".join(ser(e) for e in n.enfants)
    tag = CASSE_SVG.get(n.tag, n.tag)
    if n.auto:
        return "<{}{}/>".format(tag, ser_attrs(n))
    if n.tag in VIDES:
        return "<{}{}>".format(tag, ser_attrs(n))
    interieur_brut = n.tag in ("script", "style")
    return "<{}{}>{}</{}>".format(tag, ser_attrs(n), "".join(ser(e, interieur_brut) for e in n.enfants), tag)


def interieur(n):
    return "".join(ser(e) for e in n.enfants)


def texte_de(n):
    if isinstance(n, Texte):
        return n.data
    return "".join(texte_de(e) for e in n.enfants)


# ---------------------------------------------------------------------------
# Adaptations du contenu : liens, images, états de Noël, formulaires et grilles de produits
# ---------------------------------------------------------------------------
def lien(url, page=""):
    """Lien de la maquette (produit-x.html#a) vers l'adresse WordPress (/produits/x/#a).
    Une ancre de la page même (#a) reçoit le chemin de sa page (/cgv/#a) : l'outil d'import de WordPress, case
    « Change all imported URLs… » cochée (par défaut), réécrit sinon « #a » en « /#a », qui mène à l'accueil."""
    if url and url.startswith("#") and len(url) > 1 and page in LIENS:
        return LIENS[page] + url
    if not url or re.match(r"^(https?:|mailto:|tel:|#|/)", url):
        return url
    page, _, ancre = url.partition("#")
    if page in LIENS:
        return LIENS[page] + ("#" + ancre if ancre else "")
    if page == "notes.html":
        return None
    return url


def image(v):
    return v.replace("assets/img/", PREFIXE_IMG) if "assets/img/" in v else v


def adapter(n, page=""):
    """Réécrit liens et images, transforme data-noel-quand en classes, retire ce qui ne sert qu'à la maquette."""
    if isinstance(n, Texte):
        return n
    attrs = []
    quand = n.attr("data-noel-quand")
    for k, v in n.attrs:
        if k == "href" and n.tag == "a":
            v2 = lien(v, page)
            if v2 is None:
                continue
            v = v2
        elif v and (k in ("src", "srcset") or k.startswith("data-img") or k.startswith("data-srcset") or k == "data-image"):
            v = image(v)
        elif k == "style" and v and "assets/img/" in v:
            v = image(v)
        if k == "data-noel-quand":
            continue
        if k == "hidden" and quand:
            continue
        attrs.append((k, v))
    if quand:
        etats = [x for x in quand.split() if x != "neutre"]
        cls = n.classes() + ["tg-quand"] + ["tg-quand-" + x for x in etats]
        attrs = [(k, v) for k, v in attrs if k != "class"] + [("class", " ".join(cls))]
        attrs.sort(key=lambda kv: 0 if kv[0] == "class" else 1)
    n.attrs = attrs
    garde = []
    for e in n.enfants:
        if isinstance(e, Noeud):
            q = e.attr("data-noel-quand")
            if q is not None and q.split() == ["neutre"]:
                continue  # variante sans JavaScript : le thème calcule l'état côté serveur
        garde.append(adapter(e, page))
    n.enfants = garde
    return n


SHORTCODE = "shortcode"


def remplacer_dynamiques(n):
    """Grilles de produits, formulaires : remplacés par des codes courts du thème (données WooCommerce, envoi réel)."""
    if not isinstance(n, Noeud):
        return
    for i, e in enumerate(n.enfants):
        if not isinstance(e, Noeud):
            continue
        cls = e.classes()
        if e.tag == "ul" and "grille-produits" in cls:
            slugs, fins = [], []
            for art in trouver(e, lambda x: x.tag == "article" and "carte" in x.classes()):
                a = trouver(art, lambda x: x.tag == "a" and x.attr("href"))[0]
                s = a.attr("href").strip("/").split("/")[-1]
                slugs.append(s)
                actif = trouver(art, lambda x: x.tag == "button" and x.attr("aria-pressed") == "true")
                if actif:
                    fins.append("{}:{}".format(s, actif[0].attr("data-fin")))
            autres = [c for c in cls if c != "grille-produits"]
            code = '[tg_produits slugs="{}"{}{}]'.format(",".join(slugs), ' finitions="{}"'.format(",".join(fins)) if fins else "",
                                                         ' classe="{}"'.format(" ".join(autres)) if autres else "")
            n.enfants[i] = Noeud(SHORTCODE, [("code", code)])
        elif e.tag == "form" and e.a("data-retract"):
            n.enfants[i] = Noeud(SHORTCODE, [("code", "[tg_retractation]")])
        elif e.tag == "form" and "inscription" in cls:
            n.enfants[i] = Noeud(SHORTCODE, [("code", "[tg_lettre]")])
        elif e.tag == "form" and e.a("data-demo") and trouver(e, lambda x: x.attr("id") == "type-demande"):
            n.enfants[i] = Noeud(SHORTCODE, [("code", "[tg_devis]")])  # demande de devis sur mesure (champs, photo jointe)
        elif e.tag == "form" and e.a("data-demo"):
            n.enfants[i] = Noeud(SHORTCODE, [("code", "[tg_contact]")])
        elif e.attr("data-tg-code-court"):
            n.enfants[i] = Noeud(SHORTCODE, [("code", e.attr("data-tg-code-court"))])
        else:
            remplacer_dynamiques(e)


def trouver(n, test):
    res = []
    for e in n.enfants:
        if isinstance(e, Noeud):
            if test(e):
                res.append(e)
            res.extend(trouver(e, test))
    return res


# ---------------------------------------------------------------------------
# Conversion en blocs
# ---------------------------------------------------------------------------
EN_LIGNE = {"a", "strong", "em", "i", "b", "span", "br", "sup", "sub", "code", "small", "abbr", "time", "mark", "s", "u",
            "del", "ins", "kbd", "q", "cite", "bdi"}
ATTRS_EN_LIGNE = {"href", "class", "title", "target", "rel", "lang", "datetime", "id"}
GROUPES = {"div", "section", "article", "aside", "header", "footer", "main"}


def en_ligne_ok(n):
    for e in n.enfants:
        if isinstance(e, Texte):
            continue
        if e.tag not in EN_LIGNE:
            return False
        if any(k not in ATTRS_EN_LIGNE for k, _ in e.attrs):
            return False
        if not en_ligne_ok(e):
            return False
    return True


def attrs_simples(n, permis=("class", "id")):
    return all(k in permis for k, _ in n.attrs)


def jattrs(d):
    if not d:
        return ""
    return " " + json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("--", "\\u002d\\u002d")


def bloc_html(n):
    return "<!-- wp:html -->\n{}\n<!-- /wp:html -->".format(ser(n))


def classe_attr(classes):
    return ' class="{}"'.format(" ".join(classes)) if classes else ""


def blocs(n):
    """Un nœud de la maquette, en blocs WordPress valides (sinon un bloc HTML personnalisé, toujours valide)."""
    if isinstance(n, Texte):
        if n.data.strip():
            raise ValueError("texte isolé")
        return ""
    if n.tag == SHORTCODE:
        return "<!-- wp:shortcode -->\n{}\n<!-- /wp:shortcode -->".format(n.attr("code"))
    cls = n.classes()
    ident = n.attr("id")
    attrs = {}
    if cls:
        attrs["className"] = " ".join(cls)
    if ident:
        attrs["anchor"] = ident
    id_html = ' id="{}"'.format(esc_a(ident)) if ident else ""

    if n.tag == "p" and attrs_simples(n) and en_ligne_ok(n):
        return "<!-- wp:paragraph{} -->\n<p{}{}>{}</p>\n<!-- /wp:paragraph -->".format(jattrs(attrs), id_html, classe_attr(cls), interieur(n))
    if re.match(r"^h[1-6]$", n.tag) and attrs_simples(n) and en_ligne_ok(n):
        niveau = int(n.tag[1])
        d = dict(attrs)
        if niveau != 2:
            d = dict([("level", niveau)] + list(d.items()))
        return "<!-- wp:heading{} -->\n<{t}{}{}>{}</{t}>\n<!-- /wp:heading -->".format(
            jattrs(d), id_html, classe_attr(["wp-block-heading"] + cls), interieur(n), t=n.tag)
    if n.tag in ("ul", "ol") and attrs_simples(n, ("class",)):
        items = []
        for e in n.enfants:
            if isinstance(e, Texte):
                if e.data.strip():
                    return bloc_html(n)
                continue
            if e.tag != "li" or not attrs_simples(e, ("class",)) or not en_ligne_ok(e):
                return bloc_html(n)
            ecls = e.classes()
            items.append("<!-- wp:list-item{} -->\n<li{}>{}</li>\n<!-- /wp:list-item -->".format(
                jattrs({"className": " ".join(ecls)} if ecls else {}), classe_attr(ecls), interieur(e)))
        d = dict(attrs)
        if n.tag == "ol":
            d = dict([("ordered", True)] + list(d.items()))
        return "<!-- wp:list{} -->\n<{t}{}>{}</{t}>\n<!-- /wp:list -->".format(
            jattrs(d), classe_attr(["wp-block-list"] + cls), "".join(items), t=n.tag)
    if n.tag == "details" and attrs_simples(n, ("class", "open")):
        el = n.elements()
        if el and el[0].tag == "summary" and attrs_simples(el[0], ()) and en_ligne_ok(el[0]):
            try:
                corps = "\n\n".join(b for b in (blocs(e) for e in n.enfants[n.enfants.index(el[0]) + 1:]) if b)
            except ValueError:
                return bloc_html(n)
            d = {}
            if n.a("open"):
                d["showContent"] = True
            if cls:
                d["className"] = " ".join(cls)
            return "<!-- wp:details{} -->\n<details{}{}><summary>{}</summary>{}</details>\n<!-- /wp:details -->".format(
                jattrs(d), classe_attr(["wp-block-details"] + cls), " open" if n.a("open") else "", interieur(el[0]),
                "\n" + corps + "\n" if corps else "")
        return bloc_html(n)
    if n.tag in GROUPES and attrs_simples(n, ("class", "id", "aria-labelledby", "aria-label")):
        try:
            corps = [b for b in (blocs(e) for e in n.enfants) if b]
        except ValueError:
            return bloc_html(n)
        d = {}
        if n.tag != "div":
            d["tagName"] = n.tag
        d.update(attrs)
        return "<!-- wp:group{} -->\n<{t}{}{}>{}</{t}>\n<!-- /wp:group -->".format(
            jattrs(d), id_html, classe_attr(["wp-block-group"] + cls), "\n" + "\n\n".join(corps) + "\n", t=n.tag)
    return bloc_html(n)


def page_en_blocs(fichier):
    doc = open(os.path.join(V4, fichier), encoding="utf-8").read()
    main = doc[doc.index("<main"):doc.index("</main>") + 7]
    racine = lire(main)
    m = racine.elements()[0]
    if fichier == "confidentialite.html":
        # La maquette décrit son propre stockage local ; la page WordPress décrit les cookies de la vraie boutique
        section = trouver(m, lambda x: x.attr("id") == "cf-cookies")[0]
        ancien = [x for x in section.elements() if "texte" in x.classes()][0]
        section.enfants[section.enfants.index(ancien)] = lire(B.cookies_texte(site_reel=True)).elements()[0]
    adapter(m, fichier)
    remplacer_dynamiques(m)
    sections = [e for e in m.elements()]
    titre = re.search(r"<title>(.*?)</title>", doc, re.S).group(1)
    desc = re.search(r'<meta name="description" content="([^"]*)"', doc).group(1)
    return sections, html.unescape(titre), html.unescape(desc)


def nom_section(s, fichier, i):
    h = trouver(s, lambda x: re.match(r"^h[1-3]$", x.tag) is not None)
    t = re.sub(r"\s+", " ", texte_de(h[0])).strip() if h else ""
    if not t:
        t = s.attr("aria-label") or " ".join(s.classes()[:2]) or "section {}".format(i + 1)
    return t


# ---------------------------------------------------------------------------
# Fichiers du thème
# ---------------------------------------------------------------------------
def ecrire(chemin, contenu):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "w", encoding="utf-8", newline="\n") as f:
        f.write(contenu)


def php_chaine(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def php_valeur(v, retrait="\t"):
    if isinstance(v, dict):
        if not v:
            return "array()"
        lignes = ["{}\t{} => {},".format(retrait, php_chaine(str(k)), php_valeur(x, retrait + "\t")) for k, x in v.items()]
        return "array(\n" + "\n".join(lignes) + "\n" + retrait + ")"
    if isinstance(v, (list, tuple)):
        if not v:
            return "array()"
        lignes = ["{}\t{},".format(retrait, php_valeur(x, retrait + "\t")) for x in v]
        return "array(\n" + "\n".join(lignes) + "\n" + retrait + ")"
    if isinstance(v, bool):
        return "true" if v else "false"
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return repr(v)
    return php_chaine(str(v))


def pour_php(contenu):
    """Contenu de composition : images du thème par get_theme_file_uri(), « <?php » neutralisé."""
    contenu = contenu.replace("<?", "&lt;?")
    return contenu.replace(PREFIXE_IMG, "<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>")


def ecrire_compositions(pages_blocs):
    dossier = os.path.join(THEME, "patterns")
    for f in os.listdir(dossier) if os.path.isdir(dossier) else []:
        if f.startswith("page-"):
            os.remove(os.path.join(dossier, f))
    noms = []
    for fichier, titre_wp, slug, sections in pages_blocs:
        for i, (nom, contenu) in enumerate(sections):
            base = "page-{}-{:02d}".format(slug, i + 1)
            noms.append(base)
            entete = """<?php
/**
 * Title: {titre} · {nom}
 * Slug: terre-gravee/{base}
 * Categories: terre-gravee
 * Keywords: terre gravée, {mots}
 * Description: Section de la page « {titre} » de la maquette v4 (générée par generer.py).
 * Inserter: true
 *
 * @package TerreGravee
 */

?>
""".format(titre=titre_wp.replace("*/", ""), nom=nom.replace("*/", "")[:80], base=base, mots=slug)
            ecrire(os.path.join(dossier, base + ".php"), entete + pour_php(contenu) + "\n")
    # Une composition par page entière (pour reconstruire une page depuis l'éditeur)
    for fichier, titre_wp, slug, sections in pages_blocs:
        base = "page-{}".format(slug)
        entete = """<?php
/**
 * Title: Page complète · {titre}
 * Slug: terre-gravee/{base}
 * Categories: terre-gravee-pages
 * Post Types: page
 * Description: Toute la page « {titre} » de la maquette v4, prête à insérer dans une page vide.
 * Inserter: true
 *
 * @package TerreGravee
 */

?>
""".format(titre=titre_wp, base=base)
        ecrire(os.path.join(dossier, base + ".php"), entete + pour_php("\n\n".join(c for _, c in sections)) + "\n")
    return noms


def compositions_communes():
    """Pied de page, bandeau de Noël et bas de la boutique : repris de la maquette, en blocs."""
    doc = open(os.path.join(V4, "atelier.html"), encoding="utf-8").read()
    corps = lire(doc[doc.index("<body"):doc.index("</body>") + 7])
    adapter(corps, "atelier.html")
    pied = trouver(corps, lambda x: x.tag == "footer" and "pied" in x.classes())[0]
    bandeau = trouver(corps, lambda x: x.tag == "aside" and "bandeau-noel" in x.classes())[0]
    col = open(os.path.join(V4, "collection.html"), encoding="utf-8").read()
    main = lire(col[col.index("<main"):col.index("</main>") + 7])
    adapter(main, "collection.html")
    suite = [s for s in main.elements()[0].elements() if s.tag == "section"]
    assert len(suite) == 2, "Bas de la page Collection changé"
    res = {
        "pied": ("Pied de page", "\n\n".join(blocs(e) for e in pied.elements())),
        "bandeau-noel": ("Bandeau de Noël (toutes les pages)", blocs(bandeau)),
        "boutique-suite": ("Boutique : garanties et questions fréquentes", "\n\n".join(blocs(s) for s in suite)),
    }
    for slug, (titre, contenu) in res.items():
        entete = """<?php
/**
 * Title: {titre}
 * Slug: terre-gravee/{slug}
 * Categories: terre-gravee
 * Description: Repris de la maquette v4 (généré par generer.py).
 * Inserter: {ins}
 *
 * @package TerreGravee
 */

?>
""".format(titre=titre, slug=slug, ins="true" if slug == "boutique-suite" else "false")
        ecrire(os.path.join(THEME, "patterns", slug + ".php"), entete + pour_php(contenu) + "\n")
    return "\n".join(c for _, c in res.values())


def copier_assets(contenu_total):
    a = os.path.join(THEME, "assets")
    os.makedirs(a, exist_ok=True)
    shutil.copy2(os.path.join(V4, "assets", "galerie.css"), os.path.join(a, "galerie.css"))
    if os.path.isdir(os.path.join(a, "fonts")):
        shutil.rmtree(os.path.join(a, "fonts"))
    shutil.copytree(os.path.join(V4, "assets", "fonts"), os.path.join(a, "fonts"))
    # Images : celles que citent les pages, les fiches et le CSS, plus toutes les photos de plaques (cartes, mur, fiches)
    dest = os.path.join(a, "img")
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    utiles = set(re.findall(re.escape(PREFIXE_IMG) + r"([\w./-]+\.(?:webp|svg|jpg|png))", contenu_total))
    utiles |= {"courbes.svg", "logo-embleme.webp", "logo-complet.webp", "misc/carte-cadeau.webp"}
    for racine, _, fichiers in os.walk(os.path.join(V4, "assets", "img")):
        for f in fichiers:
            rel = os.path.relpath(os.path.join(racine, f), os.path.join(V4, "assets", "img")).replace(os.sep, "/")
            if rel in utiles or rel.startswith(("p/", "led/", "d/")):
                os.makedirs(os.path.dirname(os.path.join(dest, rel)), exist_ok=True)
                shutil.copy2(os.path.join(racine, f), os.path.join(dest, rel))
    manquantes = [u for u in utiles if not os.path.exists(os.path.join(dest, u))]
    assert not manquantes, "Images manquantes : {}".format(manquantes)


# ---------------------------------------------------------------------------
# Données des fiches produit
# ---------------------------------------------------------------------------
def fragment_maquette(fichier, selecteur):
    """Extrait un élément d'une fiche de la maquette (premier qui satisfait le test), adapté pour WordPress."""
    doc = open(os.path.join(V4, fichier), encoding="utf-8").read()
    main = lire(doc[doc.index("<main"):doc.index("</main>") + 7])
    adapter(main, fichier)
    el = trouver(main, selecteur)
    assert el, "Fragment introuvable dans " + fichier
    return ser(el[0])


def donnees_produits():
    d = {}
    for p in B.CATALOGUE:
        s = p["slug"]
        entree = {"nom": p["nom"], "collection": p["collection"], "cadeau": s in B.IDEES_CADEAUX}
        if p["collection"] != "accessoires":
            faune = p["collection"] == "faune"
            entree.update({
                "cartel": B.cartel(p), "cartel_court": B.cartel_court(p), "phrase": B.phrase_plaque(p),
                "lieu_titre": "L’animal" if faune else "Le lieu",
                "lieu": html.escape(B.LIEU_TEXTE[s]).replace("XIXe", "XIX<sup>e</sup>"),
                "localisateur": B.localisateur(p),
                "carte": "/carte-des-lieux/" if faune else "/carte-des-lieux/#" + s,
                "carte_texte": "La faune sur la carte" if faune else "Voir sur la carte",
                "titre_histoire": p["titre_histoire"], "histoire": B.histoire(p),
                "source": p["lien"] or {},
            })
        d[s] = entree
    d["led"].update({"cartel": "Option d’une plaque", "cartel_court": "Option d’une plaque", "phrase": B.PHRASE_LED})
    d["carte-cadeau"].update({"cartel": "Idée cadeau", "cartel_court": "Une plaque au choix, valable 2 ans", "phrase": B.PHRASE_CARTE})
    # Description WooCommerce de la carte cadeau (bouton « Remplacer la description… » d'Apparence › Terre Gravée) : l'actuelle
    # promet un « envoi immédiat par email ou à imprimer », contraire à la réponse du 2 novembre 2026 (numérique, par e-mail).
    d["carte-cadeau"]["description"] = B.PHRASE_CARTE
    return d


def ecrire_donnees():
    d = donnees_produits()
    contenu = """<?php
/**
 * Textes des fiches produit repris de la maquette v4 (build.py), par identifiant (slug) de produit WooCommerce.
 * Fichier généré par generer.py : ne pas le modifier à la main. Chaque texte peut être remplacé produit par produit
 * dans l'administration (Produits › modifier › encadré « Fiche Terre Gravée »).
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

return {};
""".format(php_valeur(d, ""))
    ecrire(os.path.join(THEME, "inc", "donnees-produits.php"), contenu)
    # Morceaux fixes des fiches (les mêmes pour toutes les plaques), tirés des fiches de la maquette
    pic = "produit-le-pic-du-midi.html"
    frag = {
        "plaque_led_texte": fragment_maquette(pic, lambda x: x.tag == "small" and "kit" in texte_de(x)),
        "plaque_encart_noel": fragment_maquette(pic, lambda x: x.tag == "aside" and "encart-noel" in x.classes()),
        "plaque_garanties": fragment_maquette(pic, lambda x: x.tag == "ul" and "garanties" in x.classes()),
        "plaque_caracteristiques": fragment_maquette(pic, lambda x: x.tag == "dl" and "caracteristiques" in x.classes()),
        "led_encadre": fragment_maquette("produit-led.html", lambda x: "encadre" in x.classes()),
        "led_caracteristiques": fragment_maquette("produit-led.html", lambda x: x.tag == "dl" and "caracteristiques" in x.classes()),
        "led_detail": fragment_maquette("produit-led.html", lambda x: x.tag == "div" and "offre" in x.classes()),
        "carte_texte": fragment_maquette("produit-carte-cadeau.html", lambda x: x.tag == "p" and "Elle vaut une plaque" in texte_de(x)),
        "carte_encart_noel": fragment_maquette("produit-carte-cadeau.html", lambda x: x.tag == "aside" and "encart-noel" in x.classes()),
        "carte_garanties": fragment_maquette("produit-carte-cadeau.html", lambda x: x.tag == "ul" and "garanties" in x.classes()),
        "carte_caracteristiques": fragment_maquette("produit-carte-cadeau.html", lambda x: x.tag == "dl" and "caracteristiques" in x.classes()),
        "carte_detail": fragment_maquette("produit-carte-cadeau.html", lambda x: x.tag == "div" and "offre" in x.classes()),
        "collection_garanties": fragment_maquette("collection.html", lambda x: x.tag == "section" and trouver(x, lambda y: "garanties--bande" in y.classes())),
        "collection_faq": fragment_maquette("collection.html", lambda x: x.tag == "section" and x.attr("id") == "questions"),
        "collection_entete": fragment_maquette("collection.html", lambda x: x.tag == "header" and "entete-page" in x.classes()),
    }
    # Le texte du kit dans la fiche d'une plaque se termine par le lien « Le kit en détail », que le thème réécrit lui-même
    contenu = """<?php
/**
 * Morceaux fixes des fiches produit et de la boutique, tirés des pages de la maquette v4.
 * Fichier généré par generer.py : ne pas le modifier à la main (modifier build.py, reconstruire, relancer generer.py).
 * {{img}} est remplacé par l'adresse des images du thème.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

return {};
""".format(php_valeur({k: v.replace(PREFIXE_IMG, "{{img}}") for k, v in frag.items()}, ""))
    ecrire(os.path.join(THEME, "inc", "fragments.php"), contenu)
    return d


# ---------------------------------------------------------------------------
# Fichier d'import WordPress (WXR 1.2)
# ---------------------------------------------------------------------------
def cdata(t):
    return "<![CDATA[" + t.replace("]]>", "]]]]><![CDATA[>") + "]]>"


# Auteur des pages importées : un identifiant neutre, sans adresse e-mail. À l'import, choisir son propre compte dans
# « ou assigner les articles à un compte existant » (README, étape 5) ; sinon l'outil d'import crée un compte abonné
# « terre-gravee-import » sans e-mail ni mot de passe connu, inutilisable (jamais de compte « admin »).
AUTEUR = "terre-gravee-import"


def wxr(pages_blocs, metas):
    date = B.DATE_CONTENU + " 09:00:00"
    items = []
    pid = 9000
    for ordre, (fichier, titre, slug, sections) in enumerate(pages_blocs):
        pid += 1
        contenu = "\n\n".join(c for _, c in sections)
        titre_seo, desc = metas[fichier]
        # Titre et description de la maquette pour Rank Math (sinon « Accueil - Terre Gravée »)
        postmeta = [("_wp_page_template", "page-maquette"), ("rank_math_title", titre_seo), ("rank_math_description", desc),
                    ("_tg_maquette", fichier)]
        items.append("""
	<item>
		<title>{titre}</title>
		<link>/{slug}/</link>
		<pubDate>Mon, 02 Nov 2026 09:00:00 +0000</pubDate>
		<dc:creator>{auteur}</dc:creator>
		<guid isPermaLink="false">terre-gravee-v4-{slug}</guid>
		<description></description>
		<content:encoded>{contenu}</content:encoded>
		<excerpt:encoded><![CDATA[]]></excerpt:encoded>
		<wp:post_id>{pid}</wp:post_id>
		<wp:post_date>{date}</wp:post_date>
		<wp:post_date_gmt>{date}</wp:post_date_gmt>
		<wp:post_modified>{date}</wp:post_modified>
		<wp:post_modified_gmt>{date}</wp:post_modified_gmt>
		<wp:comment_status>closed</wp:comment_status>
		<wp:ping_status>closed</wp:ping_status>
		<wp:post_name>{slug}</wp:post_name>
		<wp:status>publish</wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>{ordre}</wp:menu_order>
		<wp:post_type>page</wp:post_type>
		<wp:post_password></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>{metas}
	</item>""".format(titre=cdata(titre), slug=slug, auteur=cdata(AUTEUR), contenu=cdata(contenu), pid=pid, date=date, ordre=ordre,
                  metas="".join("\n\t\t<wp:postmeta>\n\t\t\t<wp:meta_key>{}</wp:meta_key>\n\t\t\t<wp:meta_value>{}</wp:meta_value>\n\t\t</wp:postmeta>".format(cdata(k), cdata(v)) for k, v in postmeta)))
    # Menu principal (bloc Navigation) : cinq entrées, comme la maquette
    nav = "\n".join('<!-- wp:navigation-link {} /-->'.format(json.dumps({"label": n, "url": u, "kind": "custom", "isTopLevelLink": True}, ensure_ascii=False, separators=(",", ":"))) for n, u in MENU)
    items.append("""
	<item>
		<title><![CDATA[Menu principal Terre Gravée]]></title>
		<link>/</link>
		<pubDate>Mon, 02 Nov 2026 09:00:00 +0000</pubDate>
		<dc:creator>{auteur}</dc:creator>
		<guid isPermaLink="false">terre-gravee-v4-menu-principal</guid>
		<description></description>
		<content:encoded>{nav}</content:encoded>
		<excerpt:encoded><![CDATA[]]></excerpt:encoded>
		<wp:post_id>{pid}</wp:post_id>
		<wp:post_date>{date}</wp:post_date>
		<wp:post_date_gmt>{date}</wp:post_date_gmt>
		<wp:post_modified>{date}</wp:post_modified>
		<wp:post_modified_gmt>{date}</wp:post_modified_gmt>
		<wp:comment_status>closed</wp:comment_status>
		<wp:ping_status>closed</wp:ping_status>
		<wp:post_name>menu-principal-terre-gravee</wp:post_name>
		<wp:status>publish</wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type>wp_navigation</wp:post_type>
		<wp:post_password></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
	</item>""".format(nav=cdata(nav), pid=pid + 1, date=date, auteur=cdata(AUTEUR)))
    return """<?xml version="1.0" encoding="UTF-8" ?>
<!-- Contenu du thème Terre Gravée : les pages de la maquette v4 en blocs et le menu principal.
     À importer dans WordPress : Outils › Importer › WordPress (extension « WordPress Importer »).
     Généré par wordpress/generer.py le {jour} à partir de versions/v4-galerie. -->
<rss version="2.0"
	xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
	<title>Terre Gravée</title>
	<link>https://terregravee.fr</link>
	<description>Plaques murales en aluminium des Hautes-Pyrénées</description>
	<pubDate>Mon, 02 Nov 2026 09:00:00 +0000</pubDate>
	<language>fr-FR</language>
	<wp:wxr_version>1.2</wp:wxr_version>
	<wp:base_site_url>https://terregravee.fr</wp:base_site_url>
	<wp:base_blog_url>https://terregravee.fr</wp:base_blog_url>
	<wp:author><wp:author_id>1</wp:author_id><wp:author_login>{auteur}</wp:author_login><wp:author_email><![CDATA[]]></wp:author_email><wp:author_display_name><![CDATA[Terre Gravée (import)]]></wp:author_display_name><wp:author_first_name><![CDATA[]]></wp:author_first_name><wp:author_last_name><![CDATA[]]></wp:author_last_name></wp:author>
{items}
</channel>
</rss>
""".format(jour=datetime.date.today().isoformat(), items="".join(items), auteur=cdata(AUTEUR))


# ---------------------------------------------------------------------------
def zipper():
    chemin = os.path.join(ICI, "terre-gravee.zip")
    if os.path.exists(chemin):
        os.remove(chemin)
    with zipfile.ZipFile(chemin, "w", zipfile.ZIP_DEFLATED) as z:
        for racine, dossiers, fichiers in os.walk(THEME):
            dossiers[:] = sorted(d for d in dossiers if not d.startswith((".", "__")))
            for f in sorted(fichiers):
                if f.startswith(".") or f.endswith((".pyc", "~")):
                    continue
                complet = os.path.join(racine, f)
                rel = os.path.relpath(complet, ICI).replace(os.sep, "/")
                z.write(complet, rel)
    return chemin


def marqueurs(contenu):
    return re.findall(r'class="note note--(?:manque|decision)">([^<]*)<', contenu)


def main():
    pages_blocs, metas, total = [], {}, []
    for fichier, titre, slug in PAGES:
        sections, titre_seo, desc = page_en_blocs(fichier)
        convertis = []
        for i, s in enumerate(sections):
            convertis.append((nom_section(s, fichier, i), blocs(s)))
        pages_blocs.append((fichier, titre, slug, convertis))
        metas[fichier] = (titre_seo, desc)
        total.extend(c for _, c in convertis)
    contenu_total = "\n".join(total) + compositions_communes()
    d = ecrire_donnees()
    frag_total = open(os.path.join(THEME, "inc", "fragments.php"), encoding="utf-8").read().replace("{{img}}", PREFIXE_IMG)
    donnees_total = open(os.path.join(THEME, "inc", "donnees-produits.php"), encoding="utf-8").read()
    copier_assets(contenu_total + frag_total + donnees_total)
    noms = ecrire_compositions(pages_blocs)
    ecrire(os.path.join(ICI, "contenu-terre-gravee.xml"), wxr(pages_blocs, metas))
    # Bilan : blocs HTML personnalisés restants et marqueurs pour Romain, page par page
    for fichier, titre, slug, sections in pages_blocs:
        c = "\n".join(x for _, x in sections)
        print("{:<32} {:>3} blocs, dont {:>2} HTML, {:>2} codes courts ; marqueurs : {}".format(
            titre, c.count("<!-- wp:"), c.count("<!-- wp:html"), c.count("<!-- wp:shortcode"), ", ".join(marqueurs(c)) or "aucun"))
    print("{} compositions, {} fiches produit, zip : {}".format(len(noms), len(d), zipper()))


if __name__ == "__main__":
    main()
