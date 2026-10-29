# Terre Gravée : maquettes de refonte

Maquettes de travail pour la refonte de [terregravee.fr](https://terregravee.fr), boutique de plaques murales en aluminium découpé au laser (Hautes-Pyrénées). Elles reprennent le contenu réel du site (textes, photos, prix, avis) ; le site en ligne n'est pas modifié. Aucune ne déclenche de paiement.

| Dossier | Contenu |
|---|---|
| [`maquette/`](maquette/) | Première maquette (v0), source du mélange (jugée trop simple) : « mur d'exposition », simulation du rétroéclairage LED, notes de refonte (`notes.html`) avec le relevé des problèmes du site actuel |
| [`versions/v4-galerie/`](versions/v4-galerie/) | **Version retenue (v4) « Galerie de territoire »** : le mur d'exposition de la v0 enrichi de la carte des lieux, de l'histoire d'Aquensis et des textes de lieu de la v1, aux couleurs de la charte |
| [`versions/v1-carnet/`](versions/v1-carnet/) | Version 1 « Carnet de territoire », source du mélange (jugée trop complexe). `versions/index.html` compare v4, v0 et v1 |
| [`fichiers-uniques/`](fichiers-uniques/) | Chaque maquette regroupée en un seul fichier HTML autonome (pages, styles, scripts et photos), à ouvrir directement |
| [`outils/`](outils/) | `regrouper.py` : régénère un fichier unique à partir d'un dossier de maquette |

## Ouvrir les maquettes sous Windows

1. Bouton **Code › Download ZIP**, puis dézipper.
2. Double-cliquer sur un fichier de `fichiers-uniques/` (le plus simple), ou sur `maquette/index.html`, ou sur `index.html` dans un dossier de `versions/`.

Une connexion internet est nécessaire pour charger les polices.

Les versions 2 (boutique orientée conversion) et 3 (showroom immersif) ont été abandonnées ; elles restent dans l'historique git.
