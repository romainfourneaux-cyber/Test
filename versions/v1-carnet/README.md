# Terre Gravée · maquette version 1 « Carnet de territoire »

Brouillon de refonte de terregravee.fr. Le site devient un atlas des Hautes-Pyrénées : chaque plaque est l’entrée d’un lieu, avec son cartel, sa position sur la carte, quelques phrases factuelles sur le lieu, ses avis publiés et les occasions de l’offrir. La carte sert de décor au premier écran (titre dans un cartouche de feuille topographique) et la page signature est **la carte des plaques** (`carte.html`) : repères en vrais boutons, grappes tactiles sur mobile, faune des Pyrénées sans repère précis, trajet de fabrication de Revel à Bagnères-de-Bigorre, adresse de l’atelier à Gerde, une adresse web par lieu.

Depuis la lecture du Drive de Romain (partie publiable seulement) : l’histoire d’origine devient une entrée du carnet, « Là où tout a commencé : Aquensis », sur l’accueil et sur la carte (catégorie « Où voir les plaques en vrai ») ; les modèles en préparation (Le Casque du Lhéris, La Transhumance, Le Jardin Massey, grands formats) ont des repères « bientôt » en pointillé ; `qr.html` reçoit les visiteurs des panneaux de démonstration proposés à Aquensis ; la page Stratégie ajoute « Vos idées, mises en œuvre » et « Votre palette ». Les blocs qui racontent l’histoire d’origine (accueil, panneau Aquensis de la carte, qr.html) portent le marqueur « à valider : accord de la SEMETHERM pour citer le projet Aquensis ». Rien de la partie confidentielle du Drive n’est repris (aucun chiffre interne, aucun nom de prestataire, aucune coordonnée personnelle).

Rien n’est publié : pas de paiement, formulaires simulés (« Maquette : rien n’est envoyé »), panier gardé dans le navigateur.

## Ouvrir la maquette

Double-cliquer sur `index.html`. Une connexion internet est nécessaire pour les polices (Google Fonts) ; tout le reste fonctionne hors ligne. Les images sont lues dans `../../maquette/assets/img/`, le dossier `maquette` doit donc rester à côté du dossier `versions`.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : carte en pleine largeur avec cartouche et plaque du Pic du Midi, légende (série numérotée, pose sans perçage, dedans comme dehors, expédition), table des lieux et mini-carte, le Tourmalet à la une, « De Revel à votre mur », idées cadeaux, entrée d’origine « Là où tout a commencé : Aquensis » (photo réelle, fiche du projet, titres lus sur la photo, à confirmer, deux avis ; fond vert sauge et filet cuivre de la palette de Romain), registre des 9 avis, lettre « planche inédite » avec « Bientôt dans le carnet » |
| `carte.html` | Page signature : carte interactive, panneau latéral avec prix et boutons toujours visibles (feuille du bas modale sur mobile), grappes de repères sur petit écran, filtres, calques, liste des lieux du nord au sud. Hors catalogue : étoile cuivre « Où voir les plaques en vrai » (Aquensis, Bagnères-de-Bigorre : on y voit le décor d’origine, en panneaux de 1 m × 2 m) et repères « bientôt » en pointillé (Le Casque du Lhéris, placé sur son sommet d’après la fiche Randozone, Le Jardin Massey, La Transhumance sans repère précis), avec le vrai dessin de la planche quand il existe, jamais de fausse photo |
| `qr.html` | Atterrissage du QR code des panneaux de démonstration (« Vous avez vu nos plaques à Aquensis ? ») : origine en bref, plaques liées à Bagnères avec leur distance à vol d’oiseau, Le Casque du Lhéris en préparation (à 9 km), 65 € la plaque, liens vers la carte et la collection, lettre, note sur le paramètre de suivi à valider. Hors navigation, lié depuis la Stratégie |
| `collection.html` | Les 12 plaques par catégorie de la carte (sommets et cols, sites naturels, patrimoine, faune des Pyrénées), affichage en noir, gris ou doré, classement du nord au sud ; kit LED et carte cadeau dans une bande à part |
| `produit-*.html` | 14 fiches : finitions (photos manquantes signalées), option kit LED et sortie du câble, option cadeau, bloc « Avant de commander » (avec l’emballage renforcé), entrée du carnet, avis publiés, lieux voisins ; fiches dédiées au kit LED et à la carte cadeau |
| `sur-mesure.html` | Adapter un modèle, grands formats en préparation, plaques exclusives, séries pour professionnels, villes, hôtels et entreprises, ce que l’atelier ne fait pas, demande de devis (fichiers joints simulés) |
| `contact.html` | Adresse e-mail à copier, atelier, formulaire « Renoncer au contrat ici » en deux étapes, livraison et retours, politique des avis |
| `strategie.html` | Note pour Romain : concept, personas, « Vos idées, mises en œuvre » (9 idées du Contexte, dont « Autres faunes et flores » : ce que le site prévoit, indicateur, à valider), « Votre palette » (5 pastilles, écarts, contrastes calculés, adaptation proposée et bouton d’aperçu de toute la maquette dans sa palette, logo vectoriel), tendances, techniques de vente sourcées, points légaux, informations à fournir, décisions à valider, limites |

Le lien « Renoncer au contrat ici » figure dans le pied de page de chaque page. Les étiquettes **À FOURNIR**, **À CONFIRMER** et **PROPOSITION À VALIDER** signalent ce qui manque ou demande une décision ; **EN PRÉPARATION, À VALIDER** marque les modèles annoncés et **À VALIDER : ACCORD DE LA SEMETHERM POUR CITER LE PROJET AQUENSIS** l’histoire d’origine.

L’aperçu « ta palette » (bouton de la page Stratégie) est gardé dans le navigateur (`localStorage`, clé `tg-v1-palette`) : le même bouton revient à la palette de la version 1.

## Modifier

Les textes et la structure sont dans `build.py` (y compris la table `CORRECTIONS` appliquée aux textes du catalogue, les textes factuels `LIEU_TEXTE`, les repères `AQUENSIS`, `BIENTOT` et `TRANSHUMANCE`, les données `PALETTE`, `CONTRASTES`, `ADAPTATION` et `IDEES` de la Stratégie), les styles dans `assets/carnet.css`, les scripts dans `assets/carnet.js` et `assets/carte.js`. Après une modification : `python build.py` (Python 3.8 ou plus récent, bibliothèque standard). Le contour du département (`data/hautes-pyrenees.json`) est simplifié d’après les données IGN (Licence Ouverte 2.0).
