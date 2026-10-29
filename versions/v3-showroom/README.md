# Terre Gravée · maquette version 3 « Showroom immersif »

Un showroom en ligne, de nuit, inspiré du Pic du Midi. Le visiteur essaie la plaque sur son mur, la configure (finition, kit LED, couleur, sortie du câble) et l’allume. Le prix suit chacun de ses choix, et la couleur LED choisie devient l’accent de tout le site. L’aperçu de nuit ne change que le rendu : le kit LED (+15 €) ne s’ajoute que par un choix distinct, jamais présélectionné.

Brouillon non publié : aucun paiement, aucun envoi. Les informations manquantes sont signalées par des étiquettes jaunes « à fournir », « à confirmer », « à rédiger » ou « proposition à valider ». La liste complète est dans `strategie.html`, section « À fournir et à décider ».

## Ouvrir la maquette

Double-cliquez sur `index.html`. Tout fonctionne en local, sans serveur. Une connexion internet sert seulement à charger les polices (Google Fonts). Les images viennent du dossier `../../maquette/assets/img/`, à garder à côté.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : vitrine qui s’allume quand elle arrive à l’écran, galerie qu’on éteint, essai, kit LED, fabrication, les 9 avis, sur-mesure, cadeaux, lettre |
| `collection.html` | La galerie : 12 plaques et un bloc Accessoires, filtres, « voir en » noir, gris ou doré, salle éteinte |
| `essayer.html` | Page signature : murs dessinés ou photo de votre mur, placement à l’échelle (60 × 30 cm), aperçu de nuit, kit LED en option, lien et image JPEG à partager |
| `produit-*.html` | 14 fiches : configurateur avec prix en direct pour les 12 plaques, fiches dédiées au kit LED et à la carte cadeau |
| `sur-mesure.html` | Grands formats, matières, plaques exclusives, demande de devis |
| `contact.html` | E-mail à copier, adresse de l’atelier, questions fréquentes |
| `strategie.html` | Pour Romain : concept, tendances, techniques marketing sourcées, vigilance légale, informations à fournir |

## Modifier

Les pages sont générées par `build.py` (Python 3.8 ou plus récent, bibliothèque standard) à partir de `../../maquette/data/catalogue.json` :

```
python build.py
```

Styles : `assets/showroom.css`. Scripts : `assets/showroom.js` (commun) et `assets/essayer.js` (visualiseur). `assets/catalogue.js` et `assets/plaques-data/` sont générés : le second contient une copie des photos des plaques, nécessaire pour enregistrer l’image « mon mur » quand la page est ouverte en local.

`assets/img/` contient des variantes légères (vignettes, photos du kit LED, carte cadeau) créées par `outils/vignettes.py`, qui demande Pillow. `build.py` s’en passe si elles manquent.
