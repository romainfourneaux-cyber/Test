# Terre Gravée · maquette version 3 « Showroom immersif »

Un showroom en ligne, de nuit, inspiré du Pic du Midi. Le visiteur essaie la plaque sur son mur, la configure (finition, kit LED, couleur, sortie du câble) et l’allume. Le prix suit chacun de ses choix, et la couleur LED choisie devient l’accent de tout le site. L’aperçu de nuit ne change que le rendu : le kit LED (+15 €) ne s’ajoute que par un choix distinct, jamais présélectionné.

Les informations publiables du Drive de Romain sont intégrées : l’histoire d’origine (les 30 niches conçues pour Aquensis), sa palette de marque, les modèles en préparation et ses idées marketing. Aucun chiffre interne (coûts, volumes, fournisseurs) ne figure dans ce dossier.

Brouillon non publié : aucun paiement, aucun envoi. Les informations manquantes sont signalées par des étiquettes jaunes « à fournir », « à confirmer », « à rédiger » ou « proposition à valider ». La liste complète est dans `strategie.html`, section « À fournir et à décider ».

## Ouvrir la maquette

Double-cliquez sur `index.html`. Tout fonctionne en local, sans serveur. Une connexion internet sert seulement à charger les polices (Google Fonts). Les images viennent du dossier `../../maquette/assets/img/`, à garder à côté.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : vitrine qui s’allume quand elle arrive à l’écran, galerie qu’on éteint, essai, kit LED, « La première installation » (la photo d’Aquensis traitée en niche éclairée, les cotes du projet, l’échelle niche et plaque), fabrication, les 9 avis, sur-mesure, cadeaux, lettre |
| `collection.html` | La galerie : 12 plaques et un bloc Accessoires, filtres, « voir en » noir, gris ou doré, salle éteinte, puis la vitrine « En préparation à l’atelier » (Le Casque du Lhéris, La Transhumance, Le Jardin Massey : dessins de découpe, pas de photos) |
| `essayer.html` | Page signature : murs dessinés ou photo de votre mur, placement à l’échelle (30 × 60 cm), aperçu de nuit, kit LED en option, lien et image JPEG à partager |
| `produit-*.html` | 14 fiches : configurateur avec prix en direct pour les 12 plaques, fiches dédiées au kit LED et à la carte cadeau |
| `sur-mesure.html` | Échelles, grands formats en préparation (silhouette cotée « grand format, à confirmer »), matières, plaques exclusives, demande de devis |
| `contact.html` | E-mail à copier, adresse de l’atelier, questions fréquentes |
| `qr.html` | Arrivée des visiteurs qui scannent le QR code des panneaux de démonstration d’Aquensis : « Vous avez vu nos plaques allumées à Aquensis ? Essayez-les chez vous », lien direct vers le visualiseur en aperçu de nuit, six sujets des panneaux en plaque. Repère de suivi `?src=` affiché, jamais envoyé |
| `strategie.html` | Pour Romain : concept, tendances, « Votre palette » (pastilles, contrastes calculés, essai des couleurs de la charte sur toute la maquette, logo), techniques marketing sourcées, « Vos idées, mises en œuvre », vigilance légale, informations à fournir |

## Modifier

Les pages sont générées par `build.py` (Python 3.8 ou plus récent, bibliothèque standard) à partir de `../../maquette/data/catalogue.json` :

```
python build.py
```

Styles : `assets/showroom.css`. La palette de Romain y est définie en variables (`--ardoise`, `--blanc-casse`, `--argent`, `--sauge`, `--cuivre`) ; l’essai « nuit ardoise et cuivre » s’active depuis `strategie.html` (attribut `data-charte` sur la page, mémorisé dans le navigateur seulement). Scripts : `assets/showroom.js` (commun) et `assets/essayer.js` (visualiseur). `assets/catalogue.js` et `assets/plaques-data/` sont générés : le second contient une copie des photos des plaques, nécessaire pour enregistrer l’image « mon mur » quand la page est ouverte en local.

`assets/img/` contient des variantes légères (vignettes, photos du kit LED, carte cadeau) créées par `outils/vignettes.py`, qui demande Pillow. `build.py` s’en passe si elles manquent.

## Format des plaques

Le site note toujours le format en largeur × hauteur, comme le Drive : plaque de 30 × 60 cm (portrait), niche d’Aquensis de 1 × 2 m, grand format de 200 × 100 cm. Le schéma d’échelle et le visualiseur gardent leurs cotes 30 cm et 60 cm.

## Marqueurs liés au Drive

- « à valider : accord de la SEMETHERM pour citer le projet Aquensis » sur l’histoire d’origine (accueil, `qr.html`) ; « à valider : accord de la SEMETHERM » et « proposition à valider : panneaux de démonstration à installer » en tête de `qr.html`, qui ne doit être mise en ligne qu’avec ces panneaux.
- « en préparation, à valider » sur les trois modèles en préparation et les grands formats ; « grand format, à confirmer » sur la silhouette cotée.
- « paramètre de suivi à valider » sur le repère `?src=` des QR codes ; « proposition à valider » sur chaque idée marketing et sur l’adaptation à la charte.
