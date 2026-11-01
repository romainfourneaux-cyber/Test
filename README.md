# Terre Gravée : maquette de refonte

Maquette de travail pour la refonte de [terregravee.fr](https://terregravee.fr), boutique de plaques murales en aluminium découpé au laser (Hautes-Pyrénées). Elle reprend le contenu réel du site (textes, photos, prix) ; le site en ligne n'est pas modifié. Elle ne déclenche aucun paiement.

Depuis le 1er novembre 2026, on ne travaille plus que sur la version 4 « Galerie de territoire ».

| Dossier | Contenu |
|---|---|
| [`versions/v4-galerie/`](versions/v4-galerie/) | **La maquette (v4) « Galerie de territoire »** : mur d'exposition, simulation du rétroéclairage LED, carte des lieux, histoire d'Aquensis, aux couleurs de la charte. Autonome : photos, catalogue et polices sont dans le dossier. Notes pour Romain dans `notes.html` |
| [`versions/index.html`](versions/index.html) | Page d'accueil : la maquette, ses notes et le questionnaire (générée par `versions/build_index.py`) |
| [`fichiers-uniques/`](fichiers-uniques/) | La maquette regroupée en un seul fichier HTML autonome (pages, styles, scripts, photos et polices), à ouvrir directement |
| [`questionnaire/`](questionnaire/) | Questionnaire pour Romain sur ce qui manque pour finir le site : les questions et le générateur de la page. Les réponses restent dans la page publiée, pas dans ce dépôt |
| [`outils/`](outils/) | `regrouper.py` : régénère le fichier unique à partir du dossier de la maquette |

## Ouvrir la maquette sous Windows

1. Bouton **Code › Download ZIP**, puis dézipper.
2. Double-cliquer sur le fichier de `fichiers-uniques/` (le plus simple), ou sur `versions/v4-galerie/index.html`.

Aucune connexion internet n'est nécessaire : les polices sont hébergées avec la maquette.

## Reconstruire

```
cd versions/v4-galerie && python3 build.py
(cd versions/v4-galerie && python3 build.py --mise-en-ligne)   # avant la mise en ligne : liste les marqueurs restants, échoue s’il en reste
python3 versions/build_index.py
python3 outils/regrouper.py versions/v4-galerie fichiers-uniques/terre-gravee-v4-galerie-de-territoire.html "Terre Gravée · Galerie de territoire (v4)"
```

Les autres maquettes (v0 « mur d'exposition », v1 « carnet de territoire », v2 « boutique orientée conversion », v3 « showroom immersif ») ont été retirées ou abandonnées ; elles restent dans l'historique git.
