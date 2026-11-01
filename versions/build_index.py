#!/usr/bin/env python3
"""Génère versions/index.html (la page d’accueil des maquettes : la version 4, seule gardée depuis le 1er novembre 2026)
et, en option, la page d’accueil de la publication claude.ai (même contenu, sans squelette HTML).

Usage :  python build_index.py [chemin/de/la/page-artifact.html]
Compatible Python 3.8, bibliothèque standard uniquement.
"""
import html
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)

V4 = {
    "dossier": "versions/v4-galerie", "nom": "Galerie de territoire", "numero": "4",
    "resume": "Le mur d’exposition, sa simulation LED et ses fiches claires, avec la carte des lieux, l’histoire d’Aquensis et le texte de chaque lieu, aux couleurs de la charte Terre Gravée.",
    "points": ["Mur d’exposition et rétroéclairage LED", "Carte des lieux simplifiée", "Offre de Noël en tête de l’accueil pendant la saison"],
    "capture": "versions/v4-galerie/captures/accueil-desktop.jpg",
    "pages": [("Carte", "carte.html"), ("Collection", "collection.html"), ("Notes de la maquette", "notes.html")],
}
# Le questionnaire publié sur claude.ai (réponses de Romain sur ce qui manque pour finir le site)
QUESTIONNAIRE = "https://claude.ai/artifact/6NmNnDTEaRXV4agoVmfqus"


def e(t):
    return html.escape(str(t), quote=True)


STYLE = """
/* Mise en page : la fiche de la maquette, capture en tête, liens directs vers les pages à tester. */
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
.liste { display: grid; grid-template-columns: minmax(0, 1fr); max-width: 760px; list-style: none; margin: 0; padding: 0; }
.version { background: var(--surface); border: 1px solid var(--trait); display: grid; grid-template-rows: auto 1fr; min-width: 0; }
.version img { width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; object-position: top; display: block; border-bottom: 1px solid var(--trait); background: var(--sauge); }
.version .vide { aspect-ratio: 16 / 10; display: grid; place-items: center; background: repeating-linear-gradient(135deg, var(--sauge) 0 12px, var(--fond) 12px 24px); color: var(--encre-2); font-size: .9rem; border-bottom: 1px solid var(--trait); }
.corps { display: grid; gap: 12px; padding: 18px 18px 20px; align-content: start; min-width: 0; }
.ligne { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.numero { font-family: var(--f-titre); font-weight: 700; font-size: .8rem; letter-spacing: .12em; text-transform: uppercase; color: var(--cuivre-texte); }
.statut { font-size: .75rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 2px 8px; border: 1px solid currentColor; }
.statut--fini { color: var(--encre); }
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
"""

POLICES = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&amp;display=swap">'


def contenu(prefixe):
    """prefixe : chemin vers la racine du projet depuis la page générée."""
    v = V4
    base = prefixe + v["dossier"] + "/"
    if os.path.exists(os.path.join(RACINE, v["capture"])):
        visuel = '<img src="{}" alt="Accueil de la maquette Terre Gravée" loading="lazy" width="1440" height="900">'.format(e(prefixe + v["capture"]))
    else:
        visuel = '<div class="vide">Capture à venir</div>'
    actions = ('<a class="bouton" href="{}">Ouvrir la maquette</a>'.format(e(base + "index.html"))
               + "".join('<a class="lien" href="{}">{}</a>'.format(e(base + p), e(n)) for n, p in v["pages"])
               + '<a class="lien" href="{}">Questionnaire</a>'.format(e(QUESTIONNAIRE)))
    points = "".join("<li>{}</li>".format(e(p)) for p in v["points"])
    return """<div class="cadre">
  <header class="entete">
    <p class="marque">Terre Gravée</p>
    <h1>La maquette du nouveau site</h1>
    <p class="chapo">Ouvrez-la, cliquez partout, ajoutez au panier : rien n’est envoyé ni payé. Les notes réunissent ce qui reste à fournir ou à décider ; le questionnaire recueille vos réponses.</p>
    <ul class="conseils"><li>Brouillon non publié</li><li>Paiements désactivés</li><li>Les étiquettes « à fournir » et « à confirmer » attendent votre réponse</li></ul>
  </header>
  <ul class="liste"><li class="version">{visuel}<div class="corps">
  <div class="ligne"><span class="numero">Version {num}</span><span class="statut statut--fini">{statut}</span></div>
  <h2>{nom}</h2>
  <p>{resume}</p>
  <ul class="points">{points}</ul>
  <div class="actions">{actions}</div>
</div></li></ul>
  <p class="pied">Les premières maquettes (versions 0 et 1) ont été retirées le 1er novembre 2026 ; leur historique reste dans le dépôt.</p>
</div>""".format(visuel=visuel, num=e(v["numero"]), statut=e(os.environ.get("STATUT_VERSIONS", "Version retenue")), nom=e(v["nom"]),
                 resume=e(v["resume"]), points=points, actions=actions)


def page_complete():
    # Concaténation plutôt que .format() : la feuille de style contient des accolades
    return ("""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Maquettes Terre Gravée</title>
<meta name="robots" content="noindex, nofollow">
""" + POLICES + "\n<style>" + STYLE + "</style>\n</head>\n<body>\n" + contenu("../") + "\n</body>\n</html>\n")


def page_artifact():
    return ("""<title>Maquettes Terre Gravée</title>
<meta name="claude:viewport-fit-sides" content="cover">
""" + POLICES + "\n<style>" + STYLE + "</style>\n" + contenu("") + "\n")


if __name__ == "__main__":
    with open(os.path.join(ICI, "index.html"), "w", encoding="utf-8") as f:
        f.write(page_complete())
    if len(sys.argv) > 1:
        with open(sys.argv[1], "w", encoding="utf-8") as f:
            f.write(page_artifact())
    print("Page d’accueil des maquettes générée")
