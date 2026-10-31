# Le domaine : l'application Android (.apk)

Le jeu de révision, le même que sur le PC, emballé dans une application pour la tablette. Rien d'autre dedans :
une page web (le dossier jeu/ entier, copié au moment de la construction) affichée en plein écran par Android.
L'application ne demande aucune permission : pas d'accès à Internet, pas d'accès aux photos ni aux contacts. Le jeu
se joue entièrement hors ligne, la partie s'enregistre dans l'application, comme dans le navigateur du PC.

Ce dossier tient le projet de construction. Le fichier à installer est `sorties/le-domaine-<version>.apk`
(par exemple `sorties/le-domaine-0.9.2.apk`, environ 13 Mo).

## Reconstruire l'application (une commande)

Dans le conteneur de travail, à la racine du projet :

```
bash atelier/outils/construire-apk.sh
```

Le script copie jeu/ dans l'application (sans sw.js ni manifest.webmanifest, qui servent à la version web), lit la
version dans jeu/VERSION.txt (0.9.3 donne la version 0.9.3 et le numéro interne 903), construit l'APK, le signe avec
la clé du projet, vérifie la signature, la fiche (paquet, version, aucune permission) et le contenu (tous les fichiers
du jeu présents), puis le range dans `sorties/`. Il s'arrête net à la première chose qui manque et dit laquelle.
Compter une à deux minutes. Les outils nécessaires et leur installation sont décrits dans CHAINE.md.

Après chaque livraison du jeu (nouveau numéro dans jeu/VERSION.txt), relancer cette commande : l'APK porte la
version du jeu, et Android n'installe une mise à jour que si son numéro est plus grand que celui déjà installé.

## Installer sur la tablette

1. Mettre le fichier `.apk` sur la tablette : par câble USB (le copier dans le dossier Téléchargements de la
   tablette), par Google Drive (l'envoyer sur le Drive puis le télécharger depuis la tablette), ou par mail
   (l'ouvrir depuis la pièce jointe).
2. Sur la tablette, ouvrir l'application « Mes fichiers », aller dans Téléchargements et toucher le fichier.
3. La tablette prévient que l'application ne vient pas du Play Store. Toucher « Paramètres » puis autoriser
   l'installation depuis cette source (Mes fichiers, Drive ou l'application mail), revenir, toucher « Installer ».
   Si Play Protect propose d'analyser l'application, accepter ou choisir « Installer quand même » : elle n'est pas
   connue du Play Store, c'est normal.
4. Toucher « Ouvrir », ou chercher « Le domaine » (le blason sur fond sombre) sur l'écran d'accueil.

L'application se joue en paysage, écran allumé tant que le jeu est ouvert. Le bouton Retour de la tablette fait
comme la touche Échap sur le PC : il ferme la fenêtre ouverte ou propose de quitter la partie. S'il n'y a rien à
fermer, un second appui dans les deux secondes ferme l'application (un message « Appuie encore pour quitter »
le dit).

## Mettre à jour

Installer le nouveau `.apk` par-dessus l'ancien, de la même façon. Android remplace l'application et garde la
partie en cours : rien à exporter d'abord, mais une exportation avant la mise à jour ne coûte rien.

Deux cas qui perdent la partie, à connaître : désinstaller l'application (ou « Effacer les données » dans les
paramètres Android), et installer une application signée avec une autre clé (voir plus bas). Dans les deux cas,
une sauvegarde exportée se réimporte en une minute.

## Sauvegarde : exporter et importer

Dans le jeu, Réglages, « Exporter » : le fichier `sauvegarde-jeu5e-<date>.json` est écrit dans le dossier
Téléchargements de la tablette (un message le confirme et donne le nom du fichier ; un second export le même jour
s'appelle `sauvegarde-jeu5e-<date> (1).json`). De là, il se copie sur le PC par câble, se dépose sur
Drive ou s'envoie par mail, par exemple pour être mis dans DEPOT/sauvegardes/.

Réglages, « Importer » : la tablette ouvre son sélecteur de fichiers ; choisir le fichier `.json`, puis confirmer.
La partie importée remplace celle de la tablette (l'ancienne est gardée de côté dans l'application, comme sur le
PC). Une sauvegarde du PC se joue sur la tablette et inversement : c'est le même format.

## La clé de signature : à garder pour toujours

`cles/domaine.jks` et `cles/mot-de-passe.txt` sont la clé qui signe l'application (RSA 2048 bits, valable
jusqu'en 2056). Android n'accepte une mise à jour que si elle est signée avec la même clé que l'application déjà
installée. Si la clé est perdue, la seule issue est de désinstaller l'application, ce qui efface la partie sur la
tablette (sauf si elle a été exportée), puis d'installer la nouvelle version.

Ces deux fichiers ne sont pas dans git (règle du .gitignore à la racine du projet) : ils sont remis à Romain, qui
en garde une copie en lieu sûr (clé USB, Drive privé), et ils sont remis dans `atelier/android/cles/` avant chaque
reconstruction. Ne jamais les supprimer ni les régénérer : une nouvelle clé obligerait à réinstaller l'application.
La clé ne sert qu'à ça : elle n'ouvre rien d'autre et ne donne accès à rien.

## Ce qui n'a pas été testé

Le conteneur n'a ni émulateur ni tablette : l'application a été construite et vérifiée (signature, fiche, contenu),
pas lancée. À regarder au premier essai sur la tablette, dans cet ordre :

1. Le jeu s'ouvre en plein écran, en paysage, avec le bandeau et le menu (si l'écran reste sombre plus de dix
   secondes, le dire : c'est le chargement des fichiers qui coince).
2. Fermer et rouvrir l'application : la partie est toujours là.
3. Réglages, « Exporter » : le message « Sauvegarde enregistrée dans Téléchargements », puis le fichier dans
   Mes fichiers.
4. Réglages, « Importer » : le sélecteur s'ouvre, le fichier se charge.
5. Une question à trou pendant une bataille : le clavier laisse voir le champ de réponse ; les sons jouent ; le
   bouton Retour ferme bien une fenêtre, puis quitte sur double appui.
6. La taille d'écran vue par le jeu : la Galaxy Tab A9 (8,7 pouces, 1340 × 800) n'a pas été mesurée. Le jeu a été
   réglé pour 1280 × 800 et 1024 × 768 ; si la tablette annonce une densité de 1,33, la page fait environ
   1005 × 600 et il faut regarder si le champ de bataille et la colonne des questions tiennent en entier.

## Pour la prochaine session

- Projet Gradle classique : `settings.gradle`, `build.gradle`, `gradle.properties`, `app/` (manifeste, deux classes
  Java, ressources, icônes), wrapper Gradle 8.14.3, Android Gradle Plugin 8.5.2, androidx.webkit 1.11.0 comme
  seule dépendance, Java sans Kotlin, pas d'AppCompat. `app/src/main/assets/` est régénéré par le script et
  ignoré par git, comme `app/build/`, `.gradle/`, `local.properties`, `sorties/` (l'APK livré se transmet à part)
  et `cles/` (la clé, remise à Romain : si le dossier est vide dans une nouvelle session, le script s'arrête et le
  dit ; il faut remettre la clé de Romain, pas en créer une autre).
- `MainActivity.java` : la WebView, le chargeur d'assets (WebViewAssetLoader, origine
  https://appassets.androidplatform.net, page `/assets/jeu/index.html`), tout ce qui sort de là reçoit un 404 ;
  le service worker de la version web est refusé ; le sélecteur de fichiers pour l'import ; le bouton Retour ;
  le plein écran ; `configChanges` dans le manifeste pour qu'une rotation ou le clavier ne rechargent pas la page.
- `PontDomaine.java` : `window.AndroidDomaine.exporter(nom, contenu)`, présent avant le premier script de la page.
  Côté jeu, `jeu/js/sauvegarde.js` l'appelle quand il existe, sinon le lien de téléchargement habituel : c'est le
  seul changement fait dans jeu/ pour l'application.
- jeu/js/installation.js teste `typeof window.AndroidDomaine` dans `possible()` : dans l'application, il
  n'enregistre pas sw.js et n'affiche pas le cartouche « Tablette et hors ligne » (vérifié dans Chromium, page
  servie au même chemin que dans la WebView, pont simulé). Le service worker reste refusé côté Java en plus.
- Si la page plante ou si Android reprend la mémoire de son processus, `onRenderProcessGone` rebâtit l'écran au
  lieu de laisser fermer toute l'application ; deux plantages en moins de dix secondes ferment l'application.
- Le nom de fichier venu de la page est assaini (lettres, chiffres, point, tiret, souligné ; toujours `.json`) et
  le texte borné à 20 Mo : la page ne peut écrire qu'un fichier .json dans Téléchargements, rien d'autre.
- Version : l'APK construit le 31/10/2026 porte 0.9.2 parce que jeu/VERSION.txt disait 0.9.2 ; une fois le jeu
  livré en 0.9.3, relancer le script pour obtenir `sorties/le-domaine-0.9.3.apk` (numéro interne 903).
- Proxy du conteneur : le bloc entre les repères de `gradle.properties` est récrit à chaque passage du script
  d'après HTTPS_PROXY ; sans proxy, il est vidé. Détails, mesures et pièges (Maven Central en 429) dans CHAINE.md.
