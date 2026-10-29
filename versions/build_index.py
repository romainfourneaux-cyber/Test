#!/usr/bin/env python3
"""Génère versions/index.html (comparatif des maquettes) et, en option, la page d'accueil
de la publication claude.ai (même contenu, sans squelette HTML).

Usage :  python build_index.py [chemin/de/la/page-artifact.html]
"""
import html
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)

VERSIONS = [
    {
        "dossier": "maquette", "nom": "Mur d’exposition", "numero": "v0",
        "resume": "La première maquette. Les plaques sont accrochées comme dans une galerie, avec leur ombre portée et un cartel par modèle. Un bouton simule le kit LED la nuit.",
        "points": ["Simulation du rétroéclairage dans le héros", "Pastilles noir, gris, doré sur chaque carte", "Notes de refonte : 18 problèmes du site actuel"],
        "capture": "maquette/captures/accueil-desktop.jpg",
        "pages": [("Accueil", "index.html"), ("Collection", "collection.html"), ("Fiche Pic du Midi", "produit-le-pic-du-midi.html"), ("Notes de refonte", "notes.html")],
    },
    {
        "dossier": "versions/v1-carnet", "nom": "Carnet de territoire", "numero": "v1",
        "resume": "Un atlas de la Bigorre. Chaque plaque raconte son lieu, et une carte interactive des Hautes-Pyrénées relie les modèles à leurs sommets, villages et monuments.",
        "points": ["Carte des lieux, d’Aquensis et des modèles à venir", "Histoire d’origine : les 30 panneaux d’Aquensis", "Récits de lieu et cadeaux souvenir"],
        "capture": "versions/v1-carnet/captures/accueil-desktop.jpg",
        "pages": [("Accueil", "index.html"), ("Carte", "carte.html"), ("Page QR Aquensis", "qr.html"), ("Stratégie", "strategie.html")],
    },
    {
        "dossier": "versions/v2-boutique", "nom": "Boutique qui convertit", "numero": "v2",
        "resume": "Les codes des marques qui vendent en direct : quiz pour trouver sa plaque, lot de trois, kit LED proposé au bon moment, guide cadeaux de Noël et preuve sociale près du bouton d’achat.",
        "points": ["Quiz « Quelle plaque pour quel mur ? »", "Triptyque, livraison offerte, guide de Noël", "Page d’accueil des visiteurs du QR code Aquensis"],
        "capture": "versions/v2-boutique/captures/accueil-desktop.jpg",
        "pages": [("Accueil", "index.html"), ("Quiz", "quiz.html"), ("Noël", "noel.html"), ("Page QR Aquensis", "qr.html"), ("Stratégie", "strategie.html")],
    },
    {
        "dossier": "versions/v3-showroom", "nom": "Showroom immersif", "numero": "v3",
        "resume": "Un showroom de nuit inspiré du Pic du Midi. On essaie la plaque sur un mur d’exemple ou sur la photo de son propre mur, on choisit la finition et on allume les LED.",
        "points": ["Essai chez soi avec sa propre photo", "Configurateur finition et couleur LED", "Vitrine des modèles en préparation"],
        "capture": "versions/v3-showroom/captures/accueil-desktop.jpg",
        "pages": [("Accueil", "index.html"), ("Essayer chez vous", "essayer.html"), ("Page QR Aquensis", "qr.html"), ("Stratégie", "strategie.html")],
    },
]

STATUTS = {"maquette": "Terminée"}


def e(t):
    return html.escape(str(t), quote=True)


def statut(v):
    if v["dossier"] in STATUTS:
        return STATUTS[v["dossier"]], "fini"
    if not os.path.exists(os.path.join(RACINE, v["dossier"], "index.html")):
        return "En construction", "attente"
    return os.environ.get("STATUT_VERSIONS", "Relecture en cours"), "cours"


STYLE = """
/* Mise en page : une liste de fiches de version, capture en tête, liens directs vers les pages à tester. */
:root {
  --fond: #F5F5F0; --surface: #FFFFFF; --encre: #2C2C2C; --encre-2: #5A5D58; --trait: #D0D0D0;
  --sauge: #DCE2D4; --cuivre: #CBAA88; --cuivre-texte: #7C5A33; --attente: #8A8D88;
  --f-titre: "Archivo", "Segoe UI", system-ui, sans-serif; --f-texte: "Archivo", "Segoe UI", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --fond: #1F201F; --surface: #2A2B2A; --encre: #F0F0EA; --encre-2: #B5B8B2; --trait: #3E403D;
  --sauge: #34392F; --cuivre: #CBAA88; --cuivre-texte: #DDBF9C; --attente: #8E918B; color-scheme: dark; } }
:root[data-theme="dark"] {
  --fond: #1F201F; --surface: #2A2B2A; --encre: #F0F0EA; --encre-2: #B5B8B2; --trait: #3E403D;
  --sauge: #34392F; --cuivre: #CBAA88; --cuivre-texte: #DDBF9C; --attente: #8E918B; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--fond); color: var(--encre); font-family: var(--f-texte); font-size: 16px; line-height: 1.55; }
.cadre { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: clamp(28px, 5vw, 64px); }
.entete { display: grid; gap: 10px; margin-bottom: clamp(24px, 4vw, 40px); max-width: 44rem; }
.marque { font-family: var(--f-titre); font-weight: 700; font-stretch: 112%; letter-spacing: .14em; text-transform: uppercase; font-size: .8rem; color: var(--cuivre-texte); margin: 0; }
h1 { font-family: var(--f-titre); font-weight: 800; font-stretch: 105%; font-size: clamp(2rem, 1.4rem + 2.6vw, 3.2rem); line-height: 1.05; margin: 0; text-wrap: balance; }
.chapo { color: var(--encre-2); margin: 0; font-size: 1.05rem; }
.conseils { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 0; padding: 0; list-style: none; }
.conseils li { background: var(--sauge); padding: 4px 10px; font-size: .85rem; }
.liste { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(16px, 2.5vw, 28px); list-style: none; margin: 0; padding: 0; }
.version { background: var(--surface); border: 1px solid var(--trait); display: grid; grid-template-rows: auto 1fr; min-width: 0; }
.version img { width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; object-position: top; display: block; border-bottom: 1px solid var(--trait); background: var(--sauge); }
.version .vide { aspect-ratio: 16 / 10; display: grid; place-items: center; background: repeating-linear-gradient(135deg, var(--sauge) 0 12px, var(--fond) 12px 24px); color: var(--encre-2); font-size: .9rem; border-bottom: 1px solid var(--trait); }
.corps { display: grid; gap: 12px; padding: 18px 18px 20px; align-content: start; min-width: 0; }
.ligne { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.numero { font-family: var(--f-titre); font-weight: 700; font-size: .8rem; letter-spacing: .12em; text-transform: uppercase; color: var(--cuivre-texte); }
.statut { font-size: .75rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 2px 8px; border: 1px solid currentColor; }
.statut--fini { color: var(--encre); }
.statut--cours { color: var(--cuivre-texte); }
.statut--attente { color: var(--attente); }
h2 { font-family: var(--f-titre); font-weight: 750; font-stretch: 105%; font-size: 1.45rem; line-height: 1.15; margin: 0; }
.corps p { margin: 0; color: var(--encre-2); }
.points { margin: 0; padding-left: 18px; color: var(--encre-2); font-size: .95rem; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.bouton { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; background: var(--encre); color: var(--fond); text-decoration: none; font-weight: 600; }
.bouton:hover { background: var(--cuivre); color: #2C2C2C; }
.lien { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border: 1px solid var(--trait); color: var(--encre); text-decoration: none; font-size: .92rem; }
.lien:hover { border-color: var(--encre); }
a:focus-visible { outline: 2px solid var(--cuivre); outline-offset: 2px; }
.pied { margin-top: clamp(28px, 4vw, 48px); color: var(--encre-2); font-size: .88rem; max-width: 44rem; }
@media (max-width: 760px) { .liste { grid-template-columns: minmax(0, 1fr); } }
"""

POLICES = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&amp;display=swap">'


def contenu(prefixe):
    """prefixe : chemin vers la racine du projet depuis la page générée."""
    fiches = []
    for v in VERSIONS:
        texte, classe = statut(v)
        base = prefixe + v["dossier"] + "/"
        dispo = classe != "attente"
        capture_ok = os.path.exists(os.path.join(RACINE, v["capture"]))
        visuel = (f'<img src="{e(prefixe + v["capture"])}" alt="Accueil de la version {e(v["nom"])}" loading="lazy" width="1440" height="900">'
                  if capture_ok else '<div class="vide">Capture à venir</div>')
        if dispo:
            actions = f'<a class="bouton" href="{e(base + "index.html")}">Ouvrir</a>' + "".join(
                f'<a class="lien" href="{e(base + p)}">{e(n)}</a>' for n, p in v["pages"][1:])
        else:
            actions = '<span class="lien" aria-disabled="true">Bientôt disponible</span>'
        points = "".join(f"<li>{e(p)}</li>" for p in v["points"])
        fiches.append(f"""<li class="version">{visuel}<div class="corps">
  <div class="ligne"><span class="numero">Version {e(v['numero'][1:])}</span><span class="statut statut--{classe}">{e(texte)}</span></div>
  <h2>{e(v['nom'])}</h2>
  <p>{e(v['resume'])}</p>
  <ul class="points">{points}</ul>
  <div class="actions">{actions}</div>
</div></li>""")
    return f"""<div class="cadre">
  <header class="entete">
    <p class="marque">Terre Gravée</p>
    <h1>Les maquettes du nouveau site</h1>
    <p class="chapo">Quatre directions pour terregravee.fr, construites avec le vrai contenu du site. Ouvrez-les, cliquez partout, ajoutez au panier : rien n’est envoyé ni payé.</p>
    <ul class="conseils"><li>Brouillons non publiés</li><li>Paiements désactivés</li><li>Les étiquettes « à valider » attendent votre décision</li></ul>
  </header>
  <ul class="liste">{''.join(fiches)}</ul>
  <p class="pied">Chaque version a une page « Stratégie » qui explique ses choix de design et de marketing, avec les informations à fournir. Pour revenir ici depuis une version, utilisez le lien « Comparer les versions » du bandeau.</p>
</div>"""


def page_complete():
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Maquettes Terre Gravée</title>
<meta name="robots" content="noindex, nofollow">
{POLICES}
<style>{STYLE}</style>
</head>
<body>
{contenu("../")}
</body>
</html>
"""


def page_artifact():
    return f"""<title>Maquettes Terre Gravée</title>
<meta name="claude:viewport-fit-sides" content="cover">
{POLICES}
<style>{STYLE}</style>
{contenu("")}
"""


if __name__ == "__main__":
    with open(os.path.join(ICI, "index.html"), "w", encoding="utf-8") as f:
        f.write(page_complete())
    if len(sys.argv) > 1:
        with open(sys.argv[1], "w", encoding="utf-8") as f:
            f.write(page_artifact())
    print("Comparatif généré")
