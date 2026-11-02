# Terre Gravée · passage de la maquette v4 à WordPress

La maquette v4 (`versions/v4-galerie`) devient le vrai site dans le WordPress actuel de terregravee.fr, sans recréer la boutique : les produits, les commandes, les clients, les moyens de paiement et les réglages de WooCommerce restent tels quels. Seuls changent le thème (l’habillage) et les pages de texte.

| Fichier | Rôle |
|---|---|
| `terre-gravee.zip` | Le thème, à téléverser dans Apparence › Thèmes |
| `contenu-terre-gravee.xml` | Les 9 pages de la maquette en blocs, et le menu principal (Outils › Importer › WordPress) |
| `terre-gravee/` | Le thème en clair (le même que dans le zip) |
| `generer.py` | Refait les compositions, le fichier d’import, les textes des fiches et le zip à partir de la maquette |

## Ce que fait le thème

- **Thème par blocs**, compatible WooCommerce, qui reprend la maquette à l’identique : `assets/galerie.css` est la copie exacte de la feuille de style de la maquette, `assets/wp.css` n’ajuste que ce que WordPress ajoute. Polices hébergées avec le thème (aucune requête vers Google Fonts), clair et sombre selon l’appareil, de 320 à 1440 px.
- **En-tête** : emblème au coq et nom au pochoir, menu (bloc Navigation), **mini-panier WooCommerce** (le tiroir de la maquette devient le vrai panier). **Pied de page** avec les liens légaux, le médiateur et « Renoncer au contrat ici ».
- **Noël selon la date** : bandeau sur toutes les pages, bloc en tête de l’accueil, encarts sur les fiches, dans le panier et la validation de commande. Quatre états comme dans la maquette (avant le 27 novembre, pendant l’offre jusqu’au 14 décembre inclus, du 15 au 24 décembre, puis plus rien). Le serveur choisit l’état du jour et le navigateur le vérifie à l’heure de Paris, ce qui corrige une page restée en cache (LiteSpeed Cache) sans contredire le prix de la livraison, quel que soit le fuseau du visiteur. **Pendant l’offre, la livraison passe à 0 € pour tous les modes**, le panier et la validation affichent la ligne « Magnet en ardoise gravée : Offert », et chaque commande à expédier reçoit une note « glisser un magnet en ardoise gravée dans le colis ».
- **Fiches produit de la maquette** : cartel, nom, phrase de présentation, prix « 65 € », trois boutons de finition (noir, gris, doré) qui changent la photo, **kit LED en option** avec la sortie du câble (le kit est ajouté au panier avec la plaque, avec la mention « Pour la plaque : … »), quantité, barre d’achat collante sur téléphone, garanties, caractéristiques, « Le lieu » avec la petite carte, « L’histoire du modèle », « À voir aussi ». Le kit LED ne se commande pas seul : sans plaque, la commande est bloquée avec un message clair. La carte cadeau a sa propre fiche.
- **Boutique** : la grille de cartes à pastilles, les filtres par thème (Paysages, Patrimoine, Faune, Accessoires, Idées cadeaux) et « Voir en noir, gris ou doré », puis les garanties et les questions fréquentes.
- **Panier et validation de commande** : les blocs de WooCommerce, aux couleurs de la maquette. La finition s’affiche « Finition : grise » (et non « Couleur : GRIS »), aussi dans la commande et les e-mails. La validation propose une case non cochée « Je ne souhaite pas recevoir d’offres de Terre Gravée par e-mail », enregistrée sur la commande (opposition à la prospection au moment de la commande, art. L34-5 du Code des postes et des communications électroniques). Le bouton final dit « Commander avec obligation de paiement ».
- **Formulaires réels** : contact (le message part à contact@terregravee.fr), **demande de devis sur mesure** avec les champs de la maquette (type, modèle, métal, format, quantité, usage, projet, croquis ou photo joint à l’e-mail), **rétractation en ligne en deux étapes** (e-mail à l’atelier, accusé de réception daté au client, trace dans WooCommerce › Rétractations), lettre d’information par l’extension Newsletter déjà installée.
- **Compositions** : chaque section de la maquette est disponible dans l’outil d’insertion (catégorie « Terre Gravée : sections »), et chaque page complète (« Terre Gravée : pages complètes »).
- **Apparence › Terre Gravée** : une liste de contrôle (pages, page d’accueil, menu, kit LED, plaques reconnues, finitions sans photo, Matomo, médiateur), deux boutons : « Utiliser la page Accueil comme page d’accueil » et « Remplacer la description des plaques par le texte de la maquette » (ce dernier retire les mentions « série limitée et numérotée » et corrige la description de la carte cadeau ; l’ancienne description est gardée et un bouton la remet), et la case « J’ai adhéré au CM2C », qui retire le marqueur « adhésion à faire » des pages.
- **Pas de doublon** : le thème n’écrit aucune donnée structurée (JSON-LD). Celles des produits viennent de WooCommerce et de Rank Math ; le plan du site et le robots.txt aussi (voir plus bas). Le thème en retire seulement la note et les avis (`aggregateRating`, `review`), que Rank Math écrit dès qu’un avis est approuvé.

## Mise en ligne, pas à pas (Windows, hPanel, administration WordPress)

Comptez une heure et demie, plus le délai de confirmation du médiateur. Faites-le à un moment calme (le soir). Jusqu’à l’étape 4 comprise, rien ne change pour les visiteurs ; entre l’import (étape 5) et l’activation (étape 7), les adresses `/propos/`, `/contact/`… montrent déjà le nouveau texte avec l’ancien habillage, d’où l’enchaînement sans pause ; tout bascule à l’étape 7.

### 0. Avant tout : deux conditions, sinon le thème n’est activé que sur le site de test
Les nouvelles pages disent deux choses qui doivent être vraies le jour où elles sont en ligne.

**a. Le médiateur.** Le pied de page, les CGV et la page Contact annoncent le CM2C comme médiateur de la consommation. Avant d’activer le thème sur le vrai site :
1. adhérez au CM2C (www.cm2c.net › Professionnels › Inscription individuelle, 48 € pour 3 ans) et gardez la confirmation de l’adhésion ;
2. à l’étape 7, cochez « J’ai adhéré au CM2C » dans Apparence › Terre Gravée : le marqueur « adhésion à faire » disparaît des pages.

Sans adhésion, n’activez pas le thème sur le site en ligne : faites les étapes sur le site de test seulement (étape 2).

**b. Les cookies.** La page Confidentialité importée dit : mesure d’audience par Matomo réglé selon la CNIL, aucun autre outil de mesure ni de publicité, donc pas de bandeau. Aujourd’hui c’est faux : le site charge Google Analytics (Site Kit, deux propriétés), les statistiques Jetpack (cookies tk_*), la balise Google Ads de Google Listings & Ads et l’attribution des commandes de WooCommerce (cookies sbjs_* déposés avant tout consentement). Le bandeau actuel vient du thème Blocksy : **il disparaît avec l’ancien thème à l’étape 7**. Ces réglages passent donc avant l’import et l’activation :
1. **Extensions › Ajouter** : « Matomo Analytics » (Matomo pour WordPress, les données restent sur le serveur du site), Installer, Activer.
2. Dans Matomo : mode conformité CNIL (« Enforce All Settings ») et suivi e-commerce désactivé (« Not an Ecommerce site ») ; détail dans `notes.html`, points légaux, « Mesure d’audience sans bandeau : Matomo ».
3. **Extensions › Extensions installées** : désactivez **Site Kit by Google** (Google Analytics) et **Google Listings & Ads** (balise Google Ads ; le flux des produits vers Google s’arrête aussi : à réactiver plus tard seulement avec un bandeau). Dans **Jetpack › Réglages**, coupez les **statistiques** (Jetpack Stats).
4. **WooCommerce › Réglages › Avancé › Fonctionnalités** : décochez **Attribution de commande**, puis Enregistrer.
5. Contrôlez dans une fenêtre de navigation privée (Ctrl+Maj+N dans Chrome ou Edge) : ouvrez terregravee.fr, touche F12, onglet **Application** › **Cookies**. Avant tout clic sur le bandeau, il ne doit rester que ceux de WooCommerce (`woocommerce_…`, `wp_woocommerce_session_…`) et de Matomo. Plus aucun `_ga`, `_gcl`, `tk_` ni `sbjs_`.
6. Sur la page de paiement, notez les cookies déposés par Stripe et PayPal (même onglet) : la page Confidentialité porte le marqueur « liste des cookies de paiement à recenser » en attendant.

Une fois le contrôle fait (point 5), retirez le marqueur « à vérifier dans un navigateur vierge avant de retirer le bandeau » de la page Confidentialité (Pages › Confidentialité et cookies › modifier). Si vous préférez garder Google Analytics ou Google Ads, gardez un bandeau de cookies (une extension de bandeau compatible avec WP Consent API) et réécrivez la section « Cookies » de la page Confidentialité en conséquence avant de la publier.

### 1. Sauvegarde complète
1. Connectez-vous à hPanel (hpanel.hostinger.com), ouvrez le site terregravee.fr.
2. Allez dans **Fichiers › Sauvegardes** et lancez une sauvegarde des fichiers **et** de la base de données. Attendez qu’elle soit terminée et notez sa date.

### 2. Un site de test si votre offre le permet
Si hPanel affiche **WordPress › Staging** (selon l’offre), créez une copie de test et faites les étapes 3 à 11 sur cette copie. Quand tout vous convient, publiez la copie (« Publier sur le site en ligne ») ou refaites les mêmes étapes sur le vrai site. Sans copie de test, continuez sur le vrai site si les deux conditions de l’étape 0 sont remplies : la sauvegarde de l’étape 1 permet de tout remettre.

### 3. Téléverser le thème (sans l’activer)
1. Téléchargez `terre-gravee.zip` et `contenu-terre-gravee.xml` sur votre PC (dossier `wordpress` du dépôt). Ne décompressez pas le zip.
2. Dans WordPress : **Apparence › Thèmes › Ajouter un thème › Téléverser un thème**, choisissez `terre-gravee.zip`, puis **Installer maintenant**. Ne cliquez pas encore sur « Activer ».

### 4. Libérer les adresses des anciennes pages, sans les retirer
Les nouvelles pages gardent les adresses actuelles. Dans **Pages**, pour chacune des anciennes pages ci-dessous, survolez son titre, cliquez sur **Modification rapide**, changez seulement le champ **Identifiant**, puis **Mettre à jour**. Laissez-les publiées : le site ne change pas (WordPress renvoie l’ancienne adresse vers la nouvelle).

| Ancienne page | Identifiant actuel | Nouvel identifiant |
|---|---|---|
| Accueil (la page d’accueil actuelle) | `accueil` | `accueil-ancien` |
| A propos | `propos` | `propos-ancien` |
| Infos & installation | `tuto` | `tuto-ancien` |
| Contact | `contact` | `contact-ancien` |
| Créations spéciales | `creations` | `creations-ancien` |
| Conditions Générales de Vente (CGV) | `cgv` | `cgv-ancien` |
| Politique de confidentialité & Mentions légales | `politique` | `politique-ancien` |

Ne mettez rien à la corbeille maintenant : une page d’accueil, une page de CGV ou une page de confidentialité à la corbeille fait changer le site tout de suite (WordPress repasse la page d’accueil en « derniers articles »). La page Newsletter, la boutique (`/produits/`), Panier, Commander et Mon compte ne bougent pas.

**Enchaînez ensuite les étapes 5 à 7 sans pause** (une dizaine de minutes) : dès l’import, les nouvelles pages répondent à leurs adresses, encore avec l’ancien thème.

### 5. Importer les pages et le menu
1. **Outils › Importer**, ligne **WordPress** : **Installer maintenant**, puis **Lancer l’outil d’importation**.
2. Choisissez `contenu-terre-gravee.xml`, **Téléverser le fichier et importer**.
3. Écran « Assigner les auteurs/autrices » : dans la liste **ou assigner les articles à un compte existant**, choisissez **votre identifiant** (sinon l’outil crée un compte « terre-gravee-import » inutile). Laissez décochée « Téléverser et importer les fichiers joints » (il n’y en a pas : les images sont dans le thème). La case en anglais « Change all imported URLs that currently link to the previous site so that they now link to this site » peut rester cochée ou être décochée : les liens du fichier sont écrits pour marcher dans les deux cas. Validez.
4. Les 9 pages arrivent publiées : Accueil, Carte des lieux (`/carte-des-lieux/`, nouvelle adresse), L’atelier (`/propos/`), Sur mesure (`/creations/`), Installation (`/tuto/`), Contact, Conditions générales de vente (`/cgv/`), Mentions légales (`/mentions-legales/`, nouvelle adresse), Confidentialité et cookies (`/politique/`), avec leur titre et leur description pour Rank Math. Le menu « Menu principal Terre Gravée » aussi.

Si l’import doit être refait (après un retour arrière par exemple), videz d’abord la corbeille des pages : l’outil d’import ne recrée pas une page qui existe encore à la corbeille.

### 6. (Facultatif) L’aperçu du thème
**Apparence › Thèmes**, survolez « Terre Gravée », **Prévisualiser en direct** : pour un thème par blocs, cela ouvre l’éditeur du site, qui ne montre que le cadre (en-tête, pied de page) avec un texte de remplissage, pas les pages ni le bandeau de Noël. Pour voir le site complet avant les visiteurs, il faut le site de test (étape 2).

### 7. Activer
1. **Apparence › Thèmes › Terre Gravée › Activer**.
2. **Apparence › Terre Gravée** : cliquez sur **Utiliser la page « Accueil » comme page d’accueil**. La liste de contrôle doit être verte (✔), sauf les lignes « ! » qui sont des signalements : finitions sans photo de variation (elles affichent « photo à venir » au lieu d’une photo d’une autre couleur) et médiateur tant que la case n’est pas cochée. La ligne Matomo doit être verte (étape 0).
3. Toujours là : **Remplacer la description des plaques par le texte de la maquette** (recommandé : retire « série limitée et numérotée » des 12 plaques, et remplace la description de la carte cadeau, qui promet aujourd’hui un « envoi immédiat par email ou à imprimer », par « carte cadeau numérique, envoyée par e-mail »). Réversible.
4. Toujours là, rubrique **Médiateur de la consommation** : cochez « J’ai adhéré au CM2C… » et **Enregistrer** (étape 0, a).
5. **LiteSpeed Cache › Boîte à outils › Purger tout**, puis, si le CDN de Hostinger est actif, hPanel › Performance › CDN › **Vider le cache**.

### 8. Réglages WooCommerce et produits
- **WooCommerce › Réglages › Avancé**, rubrique **Installation des pages** : « Conditions générales de vente » = la nouvelle page *Conditions générales de vente* (et non « Conditions Générales de Vente (CGV) »), Enregistrer. **Réglages › Confidentialité** (WordPress) : page *Confidentialité et cookies*, **Utiliser cette page**.
- **Avis** : **Produits › Avis**, sélectionnez tous les avis puis **Mettre à la corbeille** ; **WooCommerce › Réglages › Produits** : décochez « Activer les avis produit » ; désactivez l’extension **Site Reviews**. Les anciens avis ne doivent plus s’afficher. Décocher les avis ne suffit pas : tant qu’un avis reste approuvé, Rank Math écrit sa note dans les données structurées lues par Google (le thème les retire aussi, par sécurité).
- **Produits** : mettez à la corbeille le produit vide **AUTO-DRAFT** (`/produits/tr/`), qui s’afficherait sinon comme une carte « AUTO-DRAFT » dans la collection Accessoires.
- **Carte cadeau** : si vous n’avez pas cliqué sur le bouton de l’étape 7.3, **Produits › Carte cadeau › Description** : remplacez le texte par « La carte cadeau Terre Gravée vaut une plaque murale au choix, à 65 €, valable 2 ans. C’est une carte cadeau numérique, envoyée par e-mail, sans frais de port. » (ce texte est repris par la recherche du site et par Google).
- **Expédition** (onglet de WooCommerce › Réglages) : laissez 5 € par mode. Le thème met la livraison à 0 € du 27 novembre au 14 décembre 2026 : ne créez pas de livraison gratuite en plus.
- **Paiements** : rien à changer (WooPayments, PayPal). Vérifiez à l’étape 10 que les boutons de paiement express apparaissent bien.
- **Elementor › Réglages › Performance** : « Chargement optimisé des images » : **Désactiver**, puis Enregistrer. Sinon Elementor ajoute des attributs en double dans les images du thème (`loading="lazy" loading="lazy"`). Elementor peut rester installé pour les anciens contenus.

**Réglages produits dont le thème a besoin** (déjà vrais sur terregravee.fr) :
- chaque plaque est un produit variable avec l’attribut de finition `couleur` (valeurs NOIR, GRIS, DOREE ; « noir, gris, doré » marche aussi), et **une photo par variation** (onglet Variations › photo de chaque finition) ; les autres photos du produit (mise en situation) passent dans la galerie. Dans le panier, la commande et les e-mails, le thème affiche « Finition : noire / grise / dorée » ;
- le kit LED a l’identifiant (slug) `led`, est variable avec l’attribut « Emplacement câble » (Bas Gauche, Bas Droite, Haut Gauche, Haut Droite) ;
- la carte cadeau a l’identifiant `carte-cadeau` ;
- les textes de la maquette (cartel, phrase, « Le lieu », titre de l’histoire) sont dans le thème pour les 12 plaques actuelles. Pour en changer un, ou pour une nouvelle plaque : **Produits › modifier › encadré « Fiche Terre Gravée »** (un champ vide garde le texte de la maquette). L’histoire du modèle est la **description** du produit.

### 9. Rank Math (référencement), sans doublon
- **Rank Math › Titres & méta** : gardez « Produits » et « Pages » indexables. Les pages importées portent déjà leur titre (par exemple « Terre Gravée · Plaques murales en aluminium des Hautes-Pyrénées » pour l’accueil) et leur méta-description : rien à saisir.
- **Rank Math › Titres & méta › SEO local** (module « SEO local » activé dans le tableau de bord de Rank Math) : type *Organisation*, nom *Terre Gravée*, logo, adresse de Gerde, téléphone, e-mail. C’est la carte d’identité de l’entreprise pour Google : le thème n’en écrit pas d’autre.
- **Rank Math › Réglages du plan de site** : plan du site actif (`/sitemap_index.xml`), avec Pages, Produits et Catégories de produits ; décochez Articles s’il n’y en a pas.
- **Rank Math › Réglages généraux › Modifier le robots.txt** : collez le contenu de `versions/v4-galerie/robots.txt` en remplaçant la ligne `Sitemap:` par `Sitemap: https://terregravee.fr/sitemap_index.xml`.
- Données structurées des produits : celles de Rank Math (avec WooCommerce) suffisent ; n’ajoutez aucun autre balisage. Vérifiez une fiche avec le Test des résultats enrichis de Google, en particulier Le Pic du Midi (qui avait 2 avis) : un seul « Product », sans note ni avis.
- `llms.txt` : facultatif (aucun grand moteur ne dit le lire). Si vous le gardez, remplacez celui de Hostinger Tools par `versions/v4-galerie/llms.txt`.

### 10. Vérifications
Sur ordinateur et sur téléphone, en clair et en sombre : l’accueil, la boutique et ses filtres, une fiche (choisir « Gris », cocher le kit LED, ajouter au panier : le mini-panier compte 2 articles), le panier, la validation de commande jusqu’au bouton « Commander avec obligation de paiement » (sans payer ; la case « Je ne souhaite pas recevoir d’offres de Terre Gravée par e-mail » est là, décochée), le formulaire de contact et la demande de devis de la page Sur mesure, avec une photo (vous recevez les messages), la rétractation (vous recevez l’e-mail et l’accusé), les pages légales (cliquez sur une ligne du sommaire des CGV : la page descend à l’article, sans revenir à l’accueil). Le 27 novembre, vérifiez que la livraison affiche 0 € dans le panier, avec la ligne « Magnet en ardoise gravée : Offert ».

### 11. Ranger les anciennes pages
Quand tout est vérifié (le lendemain par exemple), **Pages** : cochez les sept anciennes pages (identifiants en `-ancien`) › Actions groupées › **Déplacer dans la corbeille** (la liste montre 20 pages par écran : vérifiez que WordPress confirme « 7 pages », sinon continuez sur l’écran suivant). Elles ne sont plus page d’accueil, page de CGV ni page de confidentialité : rien ne change pour les visiteurs.

### Retour arrière
**Juste le thème**, dans cet ordre (une page encore réglée comme page d’accueil, de CGV ou de confidentialité ne doit pas partir à la corbeille avant d’avoir été remplacée) :
1. Si l’étape 11 est déjà faite : **Pages › Corbeille**, cochez les sept anciennes pages › **Restaurer**. Depuis WordPress 5.6, elles reviennent en **brouillon** : cochez-les dans Pages › Brouillons › Actions groupées › **Modifier** › État : **Publié** › Mettre à jour.
2. **Apparence › Thèmes** : activez **Blocksy Child** (l’ancien thème enfant de Blocksy, resté installé).
3. **Réglages › Lecture** : page d’accueil = l’ancienne « Accueil ». La liste contient alors deux « Accueil » : choisissez celle qui n’est pas sélectionnée. Enregistrer.
4. **WooCommerce › Réglages › Avancé › Installation des pages** : « Conditions générales de vente » = *Conditions Générales de Vente (CGV)* ; **Réglages › Confidentialité** : *Politique de confidentialité & Mentions légales*, Utiliser cette page.
5. **Pages** : cochez les 9 nouvelles pages › **Déplacer dans la corbeille**. La liste montre 20 pages par écran : si WordPress ne confirme pas « 9 pages déplacées dans la corbeille », passez à l’écran suivant (flèche en haut à droite de la liste) pour les dernières.
6. Anciennes pages, **Modification rapide › Identifiant** : retirez « -ancien » (`accueil`, `propos`, `tuto`, `contact`, `creations`, `cgv`, `politique`).
7. **LiteSpeed Cache › Boîte à outils › Purger tout**.

Le bandeau de cookies du thème Blocksy revient avec l’ancien thème : laissez Matomo actif ou désactivez-le, selon ce que dit l’ancienne politique de confidentialité.

**Tout** : hPanel › Fichiers › Sauvegardes › restaurez la sauvegarde de l’étape 1 (fichiers et base). Les commandes passées entre-temps seraient perdues : préférez le retour du thème si des commandes sont arrivées.

## Avant d’annoncer la nouvelle version

Les pages importées gardent les **marqueurs** de la maquette (cadres pointillés « à fournir », « à confirmer »…) tant que l’information manque. Ils sont visibles des visiteurs : réglez-les dans la maquette (puis relancez `generer.py` et réimportez) ou directement dans les pages WordPress. Au 2 novembre 2026 : Carte des lieux (« dessin à fournir »), L’atelier (« à fournir »), Contact et CGV (« 4 à 5 jours, week-end compris ? à confirmer » : si ces jours ne comptent pas le week-end, la date limite de Noël passe du 14 au 10 décembre ; « adhésion à faire », retiré par la case du médiateur), Confidentialité (« outil à confirmer » pour la lettre, « transferts à vérifier », « liste des cookies de paiement à recenser », « à vérifier dans un navigateur vierge avant de retirer le bandeau ») et les fiches (« à fournir » pour les informations de sécurité du kit LED). Le pied de page porte aussi « adhésion à faire » jusqu’à la case du médiateur. `python3 build.py --mise-en-ligne` liste ceux de la maquette.

Autres points à savoir :
- Les dates de l’offre de Noël sont dans `terre-gravee/inc/noel.php` (fonction `tg_offre`) : à changer pour l’an prochain, avec les textes des pages. L’état de l’offre suit la date de Paris, sur le serveur comme dans le navigateur, quel que soit le pays du visiteur.
- Les messages du formulaire de contact, des demandes de devis (photo jointe, 5 Mo au plus, image ou PDF, non gardée sur le serveur) et des rétractations partent à contact@terregravee.fr (filtre `tg_email_atelier`). WordPress envoie par la fonction mail de Hostinger ; si les e-mails n’arrivent pas, installez une extension SMTP reliée à la boîte contact@.
- La case « Je ne souhaite pas recevoir d’offres de Terre Gravée par e-mail » est enregistrée sur chaque commande (rubrique « Informations complémentaires » de la commande) : n’envoyez pas d’offres aux clients qui l’ont cochée.
- Affichage des prix : les blocs Panier et Validation de WooCommerce écrivent « 65,00 € », les fiches « 65 € ». C’est l’affichage des blocs de WooCommerce, sans effet sur les montants.
- Si un client retire la plaque de son panier en gardant le kit LED, le message « Le kit LED se commande avec une plaque » n’apparaît qu’au rechargement de la page ; la validation de commande refuse de toute façon le kit seul.
- Le QR code des panneaux d’Aquensis mène à l’accueil : rien à changer. La page `qr.html` de la maquette n’est pas importée.

## Pour un développeur : modifier et refaire

- Textes et sections : dans la maquette (`versions/v4-galerie/build.py`), puis `python3 build.py`, puis `python3 wordpress/generer.py`. Le script réécrit `patterns/page-*.php`, `patterns/pied.php`, `patterns/bandeau-noel.php`, `patterns/boutique-suite.php`, `inc/donnees-produits.php`, `inc/fragments.php`, `assets/galerie.css`, `assets/fonts/`, `assets/img/`, le fichier d’import et le zip. Le reste du thème est écrit à la main.
- Conversion : chaque élément de la maquette devient un bloc WordPress natif quand c’est possible (groupe, titre, paragraphe, liste, détails), sinon un bloc « HTML personnalisé » (carte SVG, mur LED, tableaux). Les grilles de produits deviennent `[tg_produits slugs="…"]` (vrais produits, prix et photos de WooCommerce), les formulaires `[tg_contact]`, `[tg_devis]` (page Sur mesure), `[tg_retractation]`, `[tg_lettre]`. La section « Cookies » de la page Confidentialité est remplacée par sa version pour le site réel (`cookies_texte(site_reel=True)` dans build.py : cookies de WooCommerce, module d’opposition `[matomo_opt_out]` de l’extension Matomo ; sans l’extension, le thème affiche un marqueur à sa place). Les variantes de Noël (`data-noel-quand`) deviennent des classes `tg-quand tg-quand-<état>`. Chaque page reçoit `rank_math_title` (le titre de la maquette) et `rank_math_description`. Liens : `produit-x.html` → `/produits/x/`, une ancre de la page même (`#cgv-objet`) → `/cgv/#cgv-objet` (l’outil d’import réécrirait sinon `#…` en `/#…`, vers l’accueil), `collection.html` → `/produits/` (réécrit vers la vraie adresse de la boutique si elle diffère), images → `/wp-content/themes/terre-gravee/assets/img/`.
- Fiches et boutique : gabarits classiques de WooCommerce surchargés dans `terre-gravee/woocommerce/` (appelés par le bloc « Modèle classique »), pour garder les crochets dont dépendent les extensions (paiement express, données structurées). Les listes de variations de WooCommerce restent dans la page, masquées : les boutons de finition les pilotent.
- `TG_DATE_ESSAI` (`define( 'TG_DATE_ESSAI', '2026-12-01' );` dans `wp-config.php`, site de test seulement) simule une date pour essayer l’offre de Noël : le serveur (livraison offerte comprise) et le navigateur la suivent tous les deux.

## Essai sur un WordPress local (2 novembre 2026)

WordPress 7.1.4 fr_FR, WooCommerce 11.2.1, PHP 8.3, MariaDB 11.8 (Docker), avec les 14 produits créés depuis `data/catalogue.json` comme sur le site en ligne (attribut `couleur` NOIR/GRIS/DOREE, kit `led`), Rank Math 1.0.280, Elementor 4.3.5, Newsletter 9.5.3 et WordPress Importer 0.9.7. Les sept anciennes pages du site (Accueil, A propos, Infos & installation, Contact, Créations spéciales, CGV, Politique…) sont recréées avec leurs identifiants, réglées comme page d’accueil, page de CGV et page de confidentialité, et un autre thème est actif, comme Blocksy sur le vrai site. Matomo n’est pas installé sur ce site d’essai (hors ligne) : la page Confidentialité y montre le marqueur « module d’opposition : extension Matomo à installer ».

- **Guide suivi dans l’interface** (Playwright), étapes 3 à 11 : thème téléversé ; identifiants des anciennes pages changés par Modification rapide (le site reste identique) ; import avec la case « Change all imported URLs… » laissée cochée et les pages assignées à son compte (aucun compte créé) ; activation, page d’accueil, descriptions ; CGV et confidentialité réglées ; avis mis à la corbeille ; Elementor › Performance › « Chargement optimisé des images » désactivé ; anciennes pages mises à la corbeille (la page d’accueil reste « Accueil »). Sommaire des CGV : `/cgv/#cgv-retractation` reste sur les CGV. Titres : « Terre Gravée · Plaques murales en aluminium des Hautes-Pyrénées » pour l’accueil, « L’atelier, l’origine et la fabrication · Terre Gravée »…
- **Retour arrière** suivi dans l’interface (anciennes pages encore là) : ancien thème, l’autre « Accueil » dans Réglages › Lecture, anciennes CGV et politique, nouvelles pages à la corbeille, identifiants d’origine : le site redevient l’ancien. Constat ajouté au guide : la liste des pages montre 20 pages par écran.
- **Parcours d’achat**, 1440 et 320 px : plaque dorée seule (Chronopost 5 €, total 70 €), plaque grise ×2 avec kit LED ×2 (« Pour la plaque : Le Pic du Midi, finition grise »), carte cadeau seule (sans livraison) ; « Finition : dorée / grise » partout ; case « Je ne souhaite pas recevoir d’offres de Terre Gravée par e-mail » présente et décochée ; bouton « Commander avec obligation de paiement » ; commande d’essai par virement : page « Commande reçue » avec « L’Ours × 1, Finition : noire » et la réponse à la case d’opposition ; kit LED seul refusé à la validation. Au 1er décembre (`TG_DATE_ESSAI`) : livraison 0 € (« Chronopost GRATUIT ») et ligne « Magnet en ardoise gravée : Offert » dans le panier et la validation.
- **Noël à l’heure de Paris** : navigateur à New York le 26 novembre à 20 h 30 → état « pendant » (27 novembre à Paris) ; en Martinique le 14 décembre à 21 h → « après » ; à Paris le 26 novembre à 23 h 30 → « avant ».
- **Demande de devis** : les 10 champs de la maquette, envoi avec une photo (pièce jointe reçue, fichier temporaire effacé), faux fichier image refusé.
- **Données structurées** : Le Pic du Midi avec 2 avis approuvés et avis désactivés : un seul `Product` (Rank Math), sans `aggregateRating` ni `review`.
- **Accessibilité** (axe-core) : plus d’erreur « aria-hidden-focus » sur le mini-panier (tiroir fermé `inert`, ouvert avec le focus dedans) ; restent le contraste du marqueur « adhésion à faire » du pied de page et le lien cm2c.net, comme dans la maquette, qui partent avec la case du médiateur.
- **Elementor** : avec « Chargement optimisé des images » activé, attributs en double dans les images du contenu (d’où le réglage de l’étape 8) ; le logo de l’en-tête n’est plus marqué prioritaire.
- Contrôle PHP : `php -l` sans erreur sur tous les fichiers du thème ; aucune erreur JavaScript sur les pages visitées.
