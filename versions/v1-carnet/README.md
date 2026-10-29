# Terre Gravée · maquette version 1 « Carnet de territoire »

Brouillon de refonte de terregravee.fr. Le site devient un atlas des Hautes-Pyrénées : chaque plaque est l’entrée d’un lieu, avec son cartel, sa position sur la carte, quelques phrases factuelles sur le lieu, ses avis publiés et les occasions de l’offrir. La carte sert de décor au premier écran (titre dans un cartouche de feuille topographique) et la page signature est **la carte des plaques** (`carte.html`) : repères en vrais boutons, grappes tactiles sur mobile, faune des Pyrénées sans repère précis, trajet de fabrication de Revel à Bagnères-de-Bigorre, adresse de l’atelier à Gerde, une adresse web par lieu.

Rien n’est publié : pas de paiement, formulaires simulés (« Maquette : rien n’est envoyé »), panier gardé dans le navigateur.

## Ouvrir la maquette

Double-cliquer sur `index.html`. Une connexion internet est nécessaire pour les polices (Google Fonts) ; tout le reste fonctionne hors ligne. Les images sont lues dans `../../maquette/assets/img/`, le dossier `maquette` doit donc rester à côté du dossier `versions`.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : carte en pleine largeur avec cartouche et plaque du Pic du Midi, légende (série numérotée, pose sans perçage, dedans comme dehors, expédition), table des lieux et mini-carte, le Tourmalet à la une, « De Revel à votre mur », idées cadeaux, photo d’Aquensis, registre des 9 avis, lettre « planche inédite » |
| `carte.html` | Page signature : carte interactive, panneau latéral avec prix et boutons toujours visibles (feuille du bas modale sur mobile), grappes de repères sur petit écran, filtres, calques, liste des lieux du nord au sud |
| `collection.html` | Les 12 plaques par catégorie de la carte (sommets et cols, sites naturels, patrimoine, faune des Pyrénées), affichage en noir, gris ou doré, classement du nord au sud ; kit LED et carte cadeau dans une bande à part |
| `produit-*.html` | 14 fiches : finitions (photos manquantes signalées), option kit LED et sortie du câble, option cadeau, bloc « Avant de commander », entrée du carnet, avis publiés, lieux voisins ; fiches dédiées au kit LED et à la carte cadeau |
| `sur-mesure.html` | Adapter un modèle, plaques exclusives, séries pour professionnels, ce que l’atelier ne fait pas, demande de devis (fichiers joints simulés) |
| `contact.html` | Adresse e-mail à copier, atelier, formulaire « Renoncer au contrat ici » en deux étapes, livraison et retours, politique des avis |
| `strategie.html` | Note pour Romain : concept, personas, tendances, techniques de vente sourcées, points légaux, informations à fournir, décisions à valider, limites |

Le lien « Renoncer au contrat ici » figure dans le pied de page de chaque page. Les étiquettes **À FOURNIR**, **À CONFIRMER** et **PROPOSITION À VALIDER** signalent ce qui manque ou demande une décision.

## Modifier

Les textes et la structure sont dans `build.py` (y compris la table `CORRECTIONS` appliquée aux textes du catalogue et les textes factuels `LIEU_TEXTE`), les styles dans `assets/carnet.css`, les scripts dans `assets/carnet.js` et `assets/carte.js`. Après une modification : `python build.py` (Python 3.8 ou plus récent, bibliothèque standard). Le contour du département (`data/hautes-pyrenees.json`) est simplifié d’après les données IGN (Licence Ouverte 2.0).
