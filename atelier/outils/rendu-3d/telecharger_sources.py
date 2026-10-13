# -*- coding: utf-8 -*-
"""Télécharge les sources 3D libres (Poly Haven, CC0) dans atelier/sources-3d/ et écrit SOURCES.md.

Usage : python3 atelier/outils/rendu-3d/telecharger_sources.py
Relançable : un fichier déjà présent (même taille) n'est pas retéléchargé.
Chaque source va dans son propre dossier atelier/sources-3d/<id>/ (données non sûres, jamais exécutées).
"""
import json
import os
import sys
import time
import urllib.request

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, "..", "..", ".."))
SOURCES = os.path.join(RACINE, "atelier", "sources-3d")
API = "https://api.polyhaven.com"
# Poly Haven refuse l'agent par défaut de Python : on s'annonce.
ENTETES = {"User-Agent": "jeu-revision-5e-rendu-3d/1.0"}

# Textures : id -> (résolution, cartes voulues, usage)
TEXTURES = {
    "aerial_grass_rock": ("2k", ["Diffuse", "nor_gl", "Rough"], "herbe de la plaine (vue aérienne)"),
    "rocky_terrain_02": ("2k", ["Diffuse", "nor_gl"], "variation d'herbe et de terre nue"),
    "leafy_grass": ("1k", ["Diffuse", "nor_gl"], "herbe grasse des bords de rivière"),
    "dirt_aerial_02": ("2k", ["Diffuse", "nor_gl", "Displacement"], "terre battue de la route"),
    "brown_mud": ("1k", ["Diffuse", "nor_gl"], "boue des ornières et des berges"),
    "river_small_rocks": ("1k", ["Diffuse", "nor_gl"], "lit et berges de la rivière"),
    "forest_ground_04": ("1k", ["Diffuse", "nor_gl"], "sol de la forêt"),
    "castle_wall_slates": ("1k", ["Diffuse", "nor_gl", "Rough"], "pierre claire des châteaux (France)"),
    "castle_wall_varriation": ("1k", ["Diffuse", "nor_gl", "Rough"], "pierre plus sombre (Angleterre)"),
    "rustic_stone_wall": ("1k", ["Diffuse", "nor_gl"], "soubassements, tours d'archers"),
    "yellow_stone_wall": ("1k", ["Diffuse", "nor_gl", "Rough"], "pierre ocre (forteresse omeyyade)"),
    "clay_plaster": ("1k", ["Diffuse", "nor_gl"], "murs en terre ocre (forteresse omeyyade)"),
    "roof_slates_02": ("1k", ["Diffuse", "nor_gl"], "toits d'ardoise (France)"),
    "clay_roof_tiles": ("1k", ["Diffuse", "nor_gl"], "toits de tuiles (Angleterre)"),
    "weathered_planks": ("1k", ["Diffuse", "nor_gl"], "planches du pont"),
    "medieval_wood": ("1k", ["Diffuse", "nor_gl"], "bois des engins et des hourds"),
    "rough_wood": ("1k", ["Diffuse", "nor_gl"], "pieux, poutres"),
}

# Modèles (glTF) : id -> (résolution, usage)
MODELES = {
    "tree_small_02": ("1k", "feuillus de la forêt"),
    "island_tree_02": ("1k", "arbres larges et buissons hauts"),
    "shrub_04": ("1k", "buissons"),
    "rock_moss_set_01": ("1k", "rochers moussus"),
    "kite_shield": ("1k", "forme de l'écu en amande (peint aux couleurs des camps)"),
}


def lire_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=ENTETES), timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def telecharger(url, dest, taille=None):
    """Télécharge url vers dest, sauf si le fichier est déjà là avec la bonne taille."""
    if os.path.exists(dest) and (taille is None or os.path.getsize(dest) == taille):
        return False
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    for essai in range(4):
        try:
            tmp = dest + ".part"
            with urllib.request.urlopen(urllib.request.Request(url, headers=ENTETES), timeout=300) as r, open(tmp, "wb") as f:
                while True:
                    bloc = r.read(1 << 20)
                    if not bloc:
                        break
                    f.write(bloc)
            os.replace(tmp, dest)
            return True
        except Exception as e:  # réseau capricieux : on réessaie
            print("  nouvel essai", essai + 1, url, e)
            time.sleep(3)
    raise RuntimeError("échec du téléchargement : " + url)


def garder_info(ident, info):
    """Garde la fiche Poly Haven (taille réelle en mm, auteurs) : commun.py s'en sert pour l'échelle des textures."""
    os.makedirs(os.path.join(SOURCES, ident), exist_ok=True)
    with open(os.path.join(SOURCES, ident, "info.json"), "w", encoding="utf-8") as f:
        json.dump(info, f, ensure_ascii=False, indent=1)


def main():
    os.makedirs(SOURCES, exist_ok=True)
    lignes = []
    for ident, (res, cartes, usage) in TEXTURES.items():
        info = lire_json(API + "/info/" + ident)
        garder_info(ident, info)
        fichiers = lire_json(API + "/files/" + ident)
        urls = []
        for carte in cartes:
            f = fichiers[carte][res]["jpg"]
            nom = os.path.basename(f["url"])
            neuf = telecharger(f["url"], os.path.join(SOURCES, ident, nom), f.get("size"))
            urls.append(f["url"])
            print(("téléchargé " if neuf else "déjà là    ") + ident + "/" + nom)
        auteurs = ", ".join(info.get("authors", {}).keys())
        lignes.append((ident, "texture " + res, info.get("name", ident), auteurs, usage, urls))
    for ident, (res, usage) in MODELES.items():
        info = lire_json(API + "/info/" + ident)
        garder_info(ident, info)
        fichiers = lire_json(API + "/files/" + ident)
        g = fichiers["gltf"][res]["gltf"]
        dossier = os.path.join(SOURCES, ident)
        telecharger(g["url"], os.path.join(dossier, os.path.basename(g["url"])), g.get("size"))
        for chemin, inc in g.get("include", {}).items():
            neuf = telecharger(inc["url"], os.path.join(dossier, chemin), inc.get("size"))
            if neuf:
                print("téléchargé " + ident + "/" + chemin)
        auteurs = ", ".join(info.get("authors", {}).keys())
        lignes.append((ident, "modèle glTF " + res, info.get("name", ident), auteurs, usage, [g["url"]]))
        print("modèle prêt " + ident)

    md = [
        "# Sources 3D du rendu pré-calculé",
        "",
        "Toutes les sources ci-dessous viennent de **Poly Haven** (https://polyhaven.com), licence **CC0 1.0** "
        "(domaine public, https://polyhaven.com/license) : aucune obligation de crédit, crédit donné quand même dans jeu/CREDITS.md.",
        "Elles servent seulement de matière première aux scripts de atelier/outils/rendu-3d/ ; seules les images rendues "
        "(jeu/assets/images/td/, jeu/assets/images/campagne/) entrent dans le jeu. Les fichiers sources ne sont pas suivis par git "
        "(voir .gitignore de ce dossier) : `python3 atelier/outils/rendu-3d/telecharger_sources.py` les retélécharge.",
        "",
        "| Identifiant | Type | Nom | Auteur(s) | Usage | Licence | Page / fichiers |",
        "|---|---|---|---|---|---|---|",
    ]
    for ident, typ, nom, auteurs, usage, urls in lignes:
        md.append("| `%s` | %s | %s | %s | %s | CC0 1.0 | https://polyhaven.com/a/%s ; %s |" % (
            ident, typ, nom, auteurs, usage, ident, " ; ".join(urls)))
    md += [
        "",
        "Emblèmes des bannières (lys, lion, tour) : tracés de Game-icons.net (Lorc, Delapouite et contributeurs), CC BY 3.0, "
        "déjà crédités dans jeu/CREDITS.md ; rastérisés par commun.py depuis jeu/assets/icones/game-icons.js.",
        "",
        "Tout le reste (personnages, chevaux, châteaux, tours, engins, ponts, eau, relief) est modélisé par programme "
        "dans les scripts de atelier/outils/rendu-3d/ (CC0 1.0).",
        "",
    ]
    with open(os.path.join(SOURCES, "SOURCES.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print("SOURCES.md écrit")


if __name__ == "__main__":
    sys.exit(main())
