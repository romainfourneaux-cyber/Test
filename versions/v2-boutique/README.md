# Terre Gravée · version 2 « Boutique qui convertit »

Maquette de refonte de terregravee.fr pensée comme une boutique en vente directe. Le balisage blanc et rouge des sentiers pyrénéens marque la progression (étapes du quiz, jauge de livraison offerte) et le bouton rouge plein est réservé à l’action principale de chaque écran. Trois portes d’entrée mènent au panier : la boutique, le quiz « Quelle plaque pour quel mur ? » et le guide cadeaux de Noël. Le panier fait monter la commande sans fausse urgence : livraison offerte à deux plaques, Triptyque à trois, kit LED si la plaque n’en a pas.

Brouillon non publié : aucun paiement possible, les formulaires n’envoient rien. Les décisions commerciales portent l’étiquette jaune « proposition à valider », les informations manquantes « à fournir » ou « à confirmer ». Le bouton « Masquer les notes jaunes » du bandeau les cache pour juger le rendu (préférence gardée dans ce navigateur).

L’histoire d’origine (les panneaux conçus pour Aquensis, le centre thermal de Bagnères-de-Bigorre) porte partout l’étiquette « à valider : accord de la SEMETHERM pour citer le projet Aquensis ». Les modèles en préparation portent « en préparation, à valider ».

## Ouvrir la maquette

Double-cliquez sur `index.html`. Les images sont lues dans `../../maquette/assets/img/` : gardez le dossier `versions` à côté du dossier `maquette`. Quelques copies réduites (vignettes, photos larges) sont dans `assets/img/`, avec leurs dimensions dans `assets/img/_variantes.json`. Une connexion internet sert uniquement aux polices (Google Fonts).

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil en bento hiérarchisé (Noël en 3e position sur téléphone), case « Tout est né à Aquensis » avec la photo réelle et l’avis qui en parle, 4 plaques pour commencer, 9 avis, fabrication, section « Nos plaques sont nées à Aquensis » (histoire, chiffres, preuve), lettre d’information avec le bloc « Bientôt » (Le Casque du Lhéris, La Transhumance, Le Jardin Massey) |
| `collection.html` | Les 12 plaques et 2 accessoires, filtres, « Voir en » noir, gris ou doré, tri, ajout rapide |
| `produit-*.html` | 14 fiches : finitions, kit LED et sortie du câble, vue à l’échelle, coût et livraison près du bouton, FAQ (dont l’emballage renforcé, à confirmer), avis, barre d’achat sur téléphone visible dès que le bouton principal n’est pas à l’écran |
| `quiz.html` | Page signature : quiz en 4 questions (avance automatique au doigt, Retour et Suivant collants sur téléphone), recommandation précise, lien partageable, e-mail facultatif |
| `noel.html` | Page signature : guide cadeaux par profil, date limite écrite en clair, calendrier |
| `triptyque.html` | Composeur de Triptyque avec aperçu sur le mur |
| `sur-mesure.html` | Adaptations, versions grand format en préparation (format exact à confirmer), plaques exclusives, séries pour villes, hôtels et entreprises avec la référence d’Aquensis, demande de devis |
| `qr.html` | Page d’arrivée du QR code des panneaux de démonstration d’Aquensis (vestiaires, sortie) : « Vous venez d’Aquensis ? », 4 plaques de Bagnères et de la Bigorre avec ajout direct, quiz en un clic « Qu’est-ce qui vous parle le plus ? », garanties et emballage renforcé, code de bienvenue AQUENSIS (proposition à valider, rappelé dans le panier de cette page ; code neutre BIGORRE en repli), les deux avis qui citent Aquensis ou une cure. Absente du menu |
| `contact.html` | E-mail à copier, adresse de l’atelier, livraison et emballage renforcé, retours, garanties, gestion des avis |
| `strategie.html` | Note pour Romain : concept, tendances, votre palette (contrastes, adaptation fidèle à la charte, aperçu sur toute la maquette), techniques marketing, vos idées mises en œuvre (QR codes, commerçants, offices de tourisme, événements, grands formats, professionnels, rétroéclairage, sport, autres faunes et flores, autres territoires, emballage renforcé), points légaux, informations à fournir |

## Modifier

Les textes sont dans `build.py`, les données produits dans `../../maquette/data/catalogue.json` (les histoires des modèles sont réécrites dans `build.py`, dictionnaire `HISTOIRES`). Après une modification :

```
python build.py
```

(Python 3.8 ou plus récent, bibliothèque standard.) Styles : `assets/boutique.css`. Script commun (panier de démonstration, quiz, quiz en un clic de `qr.html`, Triptyque, aperçu de la palette) : `assets/boutique.js`. Les deux vignettes du bloc « Bientôt » (`assets/img/bientot-*.webp`) sont recadrées dans la planche des dessins inédits : ce sont des dessins, pas des photos de plaques.

## Palette de la charte

La version garde son bleu nuit et son rouge de balisage. La palette de Romain (noir ardoise, blanc cassé, argent doux, vert sauge, cuivre clair) revient par touches : fond de la section « Nos plaques sont nées à Aquensis », filet cuivre, code AQUENSIS (sur la page et dans le panier de `qr.html`). Dans `strategie.html`, le bouton « Voir toute la maquette aux couleurs de votre charte » applique l’adaptation proposée à toutes les pages (classe `charte` sur la racine, préférence gardée dans ce navigateur) ; le bandeau jaune affiche alors « Quitter la palette de votre charte ». Le bouton d’action y passe en cuivre clair avec un texte noir ardoise (6,4:1), jamais en texte blanc (2,2:1). L’échantillon « Version 2 » de la section garde ses couleurs fixes (blanc sur rouge, 5,5:1) même quand l’aperçu est actif.

Captures : `captures/`.

Dépôt public : aucun coût, volume, devis, fournisseur ni coordonnée personnelle ne figure dans ces fichiers.
