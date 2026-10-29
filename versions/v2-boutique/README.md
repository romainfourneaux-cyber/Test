# Terre Gravée · version 2 « Boutique qui convertit »

Maquette de refonte de terregravee.fr pensée comme une boutique en vente directe. Le balisage blanc et rouge des sentiers pyrénéens marque la progression (étapes du quiz, jauge de livraison offerte) et le rouge est réservé aux boutons d’achat. Trois portes d’entrée mènent au panier : la boutique, le quiz « Quelle plaque pour quel mur ? » et le guide cadeaux de Noël. Le panier fait monter la commande sans fausse urgence : livraison offerte à deux plaques, Triptyque à trois, kit LED si la plaque n’en a pas.

Brouillon non publié : aucun paiement possible, les formulaires n’envoient rien. Les décisions commerciales portent l’étiquette jaune « proposition à valider », les informations manquantes « à fournir » ou « à confirmer ».

## Ouvrir la maquette

Double-cliquez sur `index.html`. Les images sont lues dans `../../maquette/assets/img/` : gardez le dossier `versions` à côté du dossier `maquette`. Une connexion internet sert uniquement aux polices (Google Fonts).

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil en bento hiérarchisé, meilleures ventes, 9 avis, fabrication, lettre d’information |
| `collection.html` | Les 12 plaques et 2 accessoires, filtres, « Voir en » noir, gris ou doré, tri, ajout rapide |
| `produit-*.html` | 14 fiches : finitions, kit LED et sortie du câble, vue à l’échelle, coût et livraison près du bouton, FAQ, avis, barre d’achat sur téléphone |
| `quiz.html` | Page signature : quiz en 4 questions, recommandation précise, lien partageable, e-mail facultatif |
| `noel.html` | Page signature : guide cadeaux par profil, date limite écrite en clair, calendrier |
| `triptyque.html` | Composeur de Triptyque avec aperçu sur le mur |
| `sur-mesure.html` | Adaptations, plaques exclusives, séries pour professionnels, demande de devis |
| `contact.html` | E-mail à copier, adresse de l’atelier, livraison, retours, garanties, gestion des avis |
| `strategie.html` | Note pour Romain : concept, tendances, techniques marketing, points légaux, informations à fournir |

## Modifier

Les textes sont dans `build.py`, les données produits dans `../../maquette/data/catalogue.json`. Après une modification :

```
python build.py
```

(Python 3.8 ou plus récent, bibliothèque standard.) Styles : `assets/boutique.css`. Script commun (panier de démonstration, quiz, Triptyque) : `assets/boutique.js`.

Captures : `captures/`.
