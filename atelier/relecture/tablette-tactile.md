# Tablette tactile : audit des commandes au doigt et passe tactile (31/10/2026)

Demande de Romain : jouer sur sa tablette Android, hors ligne. La version web installable (manifeste, service worker) est faite à part. Ce document couvre la passe tactile : ce qui demandait une souris ou un clavier, ce qui a été changé, ce qui a été mesuré, ce qui reste ouvert.

Cibles : tablette Android 10 pouces, Chrome, au doigt seul (ni survol, ni clavier), en paysage : 1280 × 800 et 1024 × 768 (densité 2). En portrait (800 × 1280) : un mot pour demander de tourner la tablette.

Méthode : Playwright et Chromium, contexte « Android émulé » (viewport, densité 2, écran tactile, `pointer: coarse` et `hover: none`), tout joué par `locator.tap`, `page.touchscreen` et des événements tactiles bruts (glissement de la carte du conseil), jamais au clavier. Une sonde mesure sur chaque écran la largeur défilable, la position du champ de bataille, les colonnes de la grille, le plus petit texte de la colonne de bataille et chaque cible tactile de moins de 44 px. La passe est dans `atelier/outils/perf.js` (`PARTIE=tablette` seule, et à la fin de l'essai complet) ; captures dans `atelier/captures/tablette-*.png`.

## 1. Inventaire : ce qui dépendait de la souris ou du clavier

Une seule règle a guidé le tri : tout ce que le clavier ou le survol fait doit se faire au doigt, et une cible se touche à 44 px au moins. Les raccourcis clavier restent en bonus (ils marchent toujours) ; seules leurs indications disparaissent sur une tablette.

| Écran, commande | Avant la passe | Au doigt | Fait |
|---|---|---|---|
| Bandeau : musique, son | boutons ronds de 40 px | boutons | 44 px |
| Menu | boutons (icône et mot, 60 px de haut) | boutons | rien à faire |
| Accueil : Jouer, Exporter | boutons | boutons | rien à faire |
| Domaine : déplacer le seigneur | flèches ou Z Q S D (clavier), ou un clic sur le plan | un toucher sur le plan | aide du plan réécrite au doigt (« Touche le plan… ») |
| Domaine : ouvrir un quartier | clic ou Entrée quand le seigneur est dessus | toucher le quartier | rien à faire, aide réécrite |
| Campagne : cartes de jeu | boutons avec une pastille de touche (1 à n) | boutons | pastilles cachées, grille sur deux colonnes à 1280 px et moins |
| Campagne : lieux de la carte (cible, attaque) | clic ou Entrée sur le lieu (80 px) | toucher | rien à faire |
| Campagne : médaillons de la cour | clic ouvre la fiche ; infobulle `title` au survol (humeur, rivalité sur 100) | toucher ouvre la fiche ; l'humeur et la jauge sont aussi écrites dans le cartouche « Tes rivaux » | 44 px de haut |
| Campagne : alerte « Défendre le domaine » | bouton avec pastille « 1 » | bouton | pastille cachée |
| Bataille : choisir une tour, envoyer des troupes | boutons (touches 1 à 4 en pastille, infobulle `title` qui répète le nom) | boutons | pastilles cachées |
| Bataille : poser une tour | clic sur la toile, cible de 30 unités (25 px en 1280, 17 px en 1024) ; flèches et Espace au clavier | toucher la toile : cible de 42 unités au doigt (RAYON_DOIGT), 30 à la souris | fait |
| Bataille : sélectionner une tour bâtie, Améliorer | clic sur la tour, bouton « Améliorer (A) » | toucher la tour, bouton | fait, indication « (A) » cachée |
| Bataille : portée de la tour choisie sur un emplacement | survol de la souris (ou curseur clavier) | la portée s'affiche à l'appui du doigt et reste jusqu'au toucher suivant | fait |
| Bataille : portée d'une tour adverse | survol de la souris | toucher la tour adverse : sa portée reste affichée | fait |
| Bataille : portées adverses quand on choisit des troupes | survol ou focus d'un bouton de troupe | le bouton touché garde le focus : les portées restent jusqu'au toucher suivant | fait (pointerover ignoré au doigt) |
| Bataille : lancer la vague | bouton « Lancer la vague (Entrée) » ; Entrée prévient s'il reste de l'or | bouton | indication cachée |
| Bataille : vitesse ×1 ×2 ×3 | boutons « petit » de 34 px | boutons | 44 px |
| Bataille : molette, glisser, clic droit | aucun | | rien à faire |
| Bataille : double déclenchement | un seul gestionnaire `click` sur la toile ; `pointermove` et `pointerleave` ignorés au doigt | un toucher = une action | vérifié (une tour par toucher) |
| Questions : QCM, plusieurs réponses, vrai ou faux, ordre, association | boutons `.choix` de 54 px, « Valider (Entrée) » | boutons | consignes « Clique » → « Touche », indication cachée ; association en bataille 43 px → 44 px |
| Questions : texte à trous | champ ou liste, Entrée | le clavier de la tablette s'ouvre sur le champ ; « Valider » au doigt | rien à faire |
| Indice du chroniqueur, Signaler une erreur, Voir la fiche | liens de 30 px, bouton | liens | 44 px |
| Panneau d'erreur : Continuer (Entrée) | bouton, Entrée | bouton | indication cachée |
| Conseil : juger une affirmation | carte glissée (événements de pointeur, `touch-action: none`), boutons « J'en doute » / « Je le crois », flèches | glisser au doigt ou toucher un bouton | vérifié (carte glissée par événements tactiles bruts) |
| Conseil : Nouveau conseil (Entrée) | bouton | bouton | indication cachée |
| Expéditions, départ : choisir le relais | flèches « Relais précédent / suivant » (44 × 34), cases du parchemin (29 × 36), Partir (Entrée), Armorial (A), Retour (Échap) | flèches et boutons | flèches 44 × 44, indications cachées ; les cases du parchemin restent à 29 px (voir « reste ouvert ») |
| Expéditions, route : entrer dans une halte | toucher la halte (64 à 67 px), chiffres 1 à 3, flèches, Entrée, bouton « Entrer dans la halte » ; infobulle `<title>` (semaine, type, porte) au survol | toucher la halte ou le bouton ; le nom est écrit sous la halte, la porte est dessinée en écusson | numéros de touche cachés, indications cachées |
| Expéditions, route : Faveurs (F), Retour (Échap), Lever le camp | boutons | boutons | indications cachées ; à 1024 px, boutons et cartouches serrés pour tout garder à l'écran |
| Expéditions : faveurs tenues | médaillons à infobulle `title` (nom, rang, effet) | le bouton « Faveurs » liste les cartes avec leur effet | rien à faire |
| Expéditions : cartes de faveur, bivouac, étal du marchand, Armorial | boutons et cartes (pastilles de touche) | boutons | pastilles cachées, 44 px |
| Missives | bouton de 39 px, fermeture par le fond ou la croix (34 px) | bouton, fond, croix | 44 px, croix 48 px |
| Codex : matières, vignettes, fiche en fenêtre | boutons | boutons | croix 48 px |
| Réglages : cases à cocher | cases de 13 px | toute la ligne du libellé se touche (44 px), case de 26 px | fait |
| Réglages : dates des devoirs, import, export | sélecteurs natifs, téléchargement | sélecteurs natifs d'Android, téléchargement dans Téléchargements | rien à faire |
| Cours : onglets | boutons de 42 px ; note du suivi en infobulle `title` (écrite en clair seulement pour « à revoir ») | boutons | 44 px ; infobulle : voir « reste ouvert » |
| Bandeau : nom des ressources | infobulle `title` au survol | les noms sont écrits sur l'écran du domaine | voir « reste ouvert » |
| Zoom au double toucher | possible partout | `touch-action: manipulation` sur les commandes ; le pincement reste possible sur la page ; `viewport` inchangé (`width=device-width, initial-scale=1`) | fait |
| Appui long | menu « enregistrer l'image », sélection de texte, halo bleu | coupés sur les boutons, les cartes SVG, la toile et les images | fait |

Mise en page avant la passe (sonde du jour, Android émulé) :

- aucun défilement horizontal sur aucun écran, à aucune taille (1280 × 800, 1024 × 768, 800 × 1280) ;
- bataille en 1280 × 800 : champ et colonne côte à côte (règle PC dès 1100 px), tout tient ; en 1024 × 768 : champ au-dessus, questions et ordres dessous : pour choisir une tour puis la poser, il fallait faire défiler entre le panneau et le champ, et pendant la vague les boutons de vitesse étaient sous le champ ;
- route des semaines en 1024 × 768 : carte entière, mais les quatre boutons passaient sur deux lignes et les cartouches « Ta compagnie » et « Journal de route » étaient coupés en bas ; texte le plus petit de la carte à 13,7 px (14 attendus) ;
- cibles de moins de 44 px : boutons ronds (40), boutons ordinaires (39), petits (34), discrets (32 à 37), onglets (42), médaillons de la cour (42), liens (30), croix des fenêtres (34), cases à cocher (13), champs (38 à 40), flèches du relais (44 × 34), cases du parchemin de l'année (29 × 36) ;
- portrait : mise en page empilée, utilisable, sans mot pour demander de tourner.

## 2. Ce qui a changé

Tout ce qui touche à la mise en page n'existe que pour un écran tactile sans souris (`@media (hover: none) and (pointer: coarse)`) : sur le PC de Romain (1366 × 768, 1920 × 1080), rien ne change.

- `jeu/css/jeu.css`, bloc « tablette tactile » en fin de feuille : cibles de 44 px au moins (boutons, petits et discrets compris, onglets, liens, médaillons, entêtes du Codex, vignettes, lignes de l'étal, choix de front, boutons de tour, choix, cartes de faveur, champs ; boutons ronds 44 px ; croix des fenêtres 48 px ; cases à cocher et boutons radio de 26 px touchables sur toute la ligne du libellé) ; `touch-action: manipulation` sur les commandes et les cartes, `touch-action: none` gardé sur la carte du conseil ; ni halo, ni sélection, ni menu d'image au toucher ; survol neutralisé (rien ne reste « soulevé » après un toucher) et retour à l'appui ; indications de touches cachées (`astuce-clavier`, pastilles des cartes de jeu, des cartes de faveur, du choix de front, de l'alerte, numéros des haltes, note « Au clavier », pastilles des boutons de tour) ; plus petits libellés un peu plus grands ; hauteurs en `dvh` (la barre d'adresse de Chrome ne mange plus la colonne). À 1280 px et moins : grille de la campagne sur deux colonnes, boutons et cartouches des expéditions serrés, feuille des expéditions sans marges de côté (la carte garde 14 px de texte en 1024 × 768). Mise en page côte à côte de la bataille dès 1000 px au doigt (les trois règles `min-width: 1100px` acceptent aussi `(min-width: 1000px) and (hover: none) and (pointer: coarse)`). En portrait : `body::after` écrit « Tourne ta tablette en paysage » au centre, par-dessus le jeu, sans prendre aucun toucher (feuille de style seule). `text-size-adjust: 100%` pour tous.
- `jeu/js/interface.js` : `JEU.ui.tactile` (vrai sans souris ni survol), `JEU.ui.astuce(t)` (span « (Entrée) » caché sur tablette), `JEU.ui.verbeClic` ; « Valider », « Continuer », « Quitter » portent leur indication dans ce span ; consignes « Touche » au lieu de « Clique » sur une tablette.
- `jeu/js/bataille.js` : `RAYON_DOIGT` (42 unités) pour la cible d'un emplacement ou d'une tour adverse au doigt ; à l'appui (`pointerdown` tactile) la portée s'affiche et reste jusqu'au toucher suivant ; `pointermove`, `pointerleave` et `pointerover` ignorés pour un doigt ; portées et survol remis à zéro au lancement de la vague et à chaque préparation ; « Lancer la vague », « Améliorer » et la consigne « touche un emplacement » suivent la tablette.
- `jeu/js/conseil.js`, `jeu/js/ecran-expedition.js` (quinze boutons), `jeu/js/domaine.js` (aide du plan) : indications de touches par `JEU.ui.astuce`, texte de l'aide au doigt. Les boutons de fin de bataille et d'événement (« Continuer la route (Entrée) », « Retour à la campagne (Entrée) ») gardent leur texte : tests.js les vérifie tels quels.
- `atelier/outils/perf.js` : passe « tablette » décrite ci-dessus, dans l'essai complet et seule avec `PARTIE=tablette`.

Ce qui n'a pas changé : `jeu/index.html` (le `viewport` reste `width=device-width, initial-scale=1`), les données, le moteur de bataille, les raccourcis clavier.

## 3. Mesures après la passe (perf.js, PARTIE=tablette, 0 échec)

| Mesure | 1280 × 800 | 1024 × 768 |
|---|---|---|
| Défilement horizontal (accueil, campagne, bataille en conseil et en vague, départ, semaine, route, porte, faveurs, conseil, réglages) | aucun | aucun |
| Cibles de moins de 44 px sur ces écrans | 0 | 0 |
| Grille de la campagne | 2 colonnes | 2 colonnes |
| Bataille : champ et colonne | côte à côte, champ de 760 px pendant la vague (632 pendant le conseil), entier à l'écran | côte à côte, champ de 568 px (479), entier à l'écran |
| Bataille : plus petit texte de la colonne | 14 px | 14 px |
| Bataille au doigt | 3 questions, tour de piquiers posée, sélectionnée au second toucher, seconde tour bâtie à 36 unités de l'emplacement, 3 fantassins envoyés, vague lancée, ×3 pris | idem |
| Entre une réponse touchée et la question suivante peinte (Event Timing, 6 mesures) | médiane 48 ms, maximum 80 ms | médiane 48 ms, maximum 56 ms |
| JEU.mesure (construction de la question suivante) | 1,4 ms au plus | 1,7 ms au plus |
| Route des semaines : carte, cartouches, plus petit texte, haltes | bas de carte 558 px, cartouches 748 px sur 800 ; 14,7 px ; haltes de 67 px | 546 px, 736 px sur 768 ; 14,2 px ; haltes de 64 px |
| Escarmouche au doigt, porte, faveur | 6 questions, 2 vagues, porte jouée, carte « Ballade consolante » tenue | idem |
| Conseil : carte glissée au doigt, puis un sceau touché | tranchée (affaire 2 atteinte) | tranchée |
| Réglages : la ligne « Sang dans les combats » touchée | basculée, puis remise | idem |
| Portrait 800 × 1280 | « Tourne ta tablette en paysage » en `body::after`, `pointer-events: none`, disparaît en paysage ; aucun défilement horizontal | |

Les captures regardées une à une : `atelier/captures/tablette-1280x800-*.png`, `tablette-1024x768-*.png` (accueil, campagne, bataille en conseil et en vague, départ, semaine, route, porte, faveurs, conseil, réglages) et `tablette-800x1280-portrait.png`.

## 4. Ce qui reste ouvert

- Les cases du parchemin de l'année (écran de départ des expéditions) font 29 px de large par construction (34 semaines sur 1000) : touchables, mais sous les 44 px. Les flèches « Relais précédent / suivant » font la même chose en 44 px ; la sonde les exclut à dessein.
- Deux infobulles `title` restent sans équivalent au doigt : la note du suivi d'un cours sur l'écran Cours (écrite en clair seulement pour « à revoir ») et le nom des ressources du bandeau (écrit sur l'écran du domaine). Sans effet sur le jeu.
- En 1024 × 768, la colonne des questions garde sa propre hauteur et défile au doigt quand une question est longue (comme sur le portable de 1366 × 768) : l'énoncé reste visible à l'ouverture, la quatrième réponse peut demander un glissement.
- Le pincement (zoom) reste possible sur la page ; seules les commandes refusent le zoom au double toucher. Le champ de bataille lit sa taille affichée : un zoom ne fausse pas les touchers.
- Tout a été mesuré dans Chromium émulé, sans carte graphique : les 48 ms de médiane au doigt à densité 2 sont à confirmer sur la tablette de Romain, de même que l'ouverture du clavier Android sur un texte à trous et le téléchargement de l'export. Le mode installé (plein écran, sans barre d'adresse) est celui de la version installable.
- Une tablette Windows avec souris (`hover: hover`) garde la mise en page du PC.
- Numéro de version inchangé par cette passe : il monte à la livraison avec la version installable.
