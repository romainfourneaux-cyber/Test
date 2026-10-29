# Terre Gravée · maquette version 1 « Carnet de territoire »

Brouillon de refonte de terregravee.fr. Le site devient un atlas des Hautes-Pyrénées : chaque plaque est l’entrée d’un lieu, avec son cartel, sa position sur la carte, son histoire, ses avis réels et les occasions de l’offrir. La page signature est **la carte des plaques** (`carte.html`) : repères cliquables, zone du Parc national pour la faune, trajet de fabrication de Revel à Bagnères-de-Bigorre, une adresse par lieu.

Rien n’est publié : pas de paiement, formulaires simulés, panier gardé dans le navigateur.

## Ouvrir la maquette

Double-cliquer sur `index.html`. Une connexion internet est nécessaire pour les polices (Google Fonts) ; tout le reste fonctionne hors ligne. Les images sont lues dans `../../maquette/assets/img/`, le dossier `maquette` doit donc rester à côté du dossier `versions`.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : héros sur fond de courbes de niveau, table des lieux et mini-carte, plaque à la une, « De Revel à votre mur », idées cadeaux, photo d’Aquensis, registre des 9 avis, lettre « planche inédite » |
| `carte.html` | Page signature : carte interactive, panneau latéral (feuille du bas sur mobile), filtres, calques, liste des lieux |
| `collection.html` | Les 12 plaques et 2 accessoires : filtres, affichage en noir, gris ou doré, classement du nord au sud |
| `produit-*.html` | 14 fiches : finitions (photos manquantes signalées), option kit LED et sortie du câble, option cadeau, livraison et retours, entrée du carnet, avis, lieux voisins ; fiches dédiées au kit LED et à la carte cadeau |
| `sur-mesure.html` | Adapter un modèle, plaques exclusives, séries pour professionnels, demande de devis |
| `contact.html` | Adresse e-mail à copier, atelier, livraison et retours, bouton de rétractation, politique des avis |
| `strategie.html` | Note pour Romain : concept, tendances, techniques de vente sourcées, points légaux, informations à fournir |

Les étiquettes **À FOURNIR**, **À CONFIRMER** et **PROPOSITION À VALIDER** signalent ce qui manque ou demande une décision.

## Modifier

Les textes et la structure sont dans `build.py`, les styles dans `assets/carnet.css`, les scripts dans `assets/carnet.js` et `assets/carte.js`. Après une modification : `python build.py` (Python 3.8 ou plus récent, bibliothèque standard). Le contour du département (`data/hautes-pyrenees.json`) est simplifié d’après les données IGN (Licence Ouverte 2.0).
