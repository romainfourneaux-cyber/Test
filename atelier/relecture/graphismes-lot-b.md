# Lot B graphique : la carte, les écrans et les menus, relecture (31/10/2026)

Tes demandes du 31/10 : « Améliore les graphismes et les animations », puis « Les graphismes des menus aussi ». Le plan
(atelier/conception/graphismes-animations-plan.md) découpe le travail en trois lots. Ce document relit le deuxième : les
changements d'écran, les réponses, le conseil, la carte de campagne, la route des expéditions, l'habillage des menus,
et les restes du champ de bataille. Cinq agents y ont travaillé en même temps. Je l'ai relu en adversaire : le code
fusionné ligne à ligne, toutes les mesures refaites sur le jeu final, une copie du jeu d'avant le lot mesurée en
alternance avec lui quand un chiffre bougeait, et les séquences regardées image par image, avant et après.

## 1. En bref

- Plus jamais de fond de cuir vide entre deux écrans : l'ancien écran s'efface pendant que le nouveau arrive.
- Une bonne réponse est frappée d'un sceau de cire et des pièces filent vers le compteur. Une erreur garde la question
  à l'écran : ta réponse en rouge, la bonne en or, l'explication qui se déplie dessous.
- La carte de campagne respire (fumées, brume, bannières, oiseaux, eau), et prendre une province donne une petite
  cérémonie. Sur la route des expéditions, on voit le sceau tomber sur chaque halte.
- Les menus prennent l'allure du jeu : sangle de cuir cousue, fanion rouge sous l'écran où tu es, boutons en
  cartouches dorés, sceaux de cire pour les cases et l'état des cours. Le « 1 » ne se lit plus « I ».
- En relisant, j'ai trouvé et corrigé cinq défauts, dont un retard de la question suivante en bataille sur grand écran
  (section 5). Il reste des points à reprendre, rien de bloquant (section 6).
- Les règles du jeu ne changent pas : le moteur de la bataille est identique, octet pour octet, et la simulation de
  200 campagnes donne exactement les mêmes chiffres qu'avant.

## 2. Ce qui change à l'écran

| Moment | Avant | Maintenant |
|---|---|---|
| Changement d'écran | 60 à 150 ms de cuir vide (plus sur la tablette) | l'ancien écran s'efface en glissant pendant que le nouveau arrive ; une bataille, un conseil ou un événement arrive d'un coup, sans fondu |
| Fenêtre (arsenal, missive) | apparaissait d'un bloc | le voile se fond, la fenêtre grandit un peu ; la missive se déplie, son sceau saute |
| Bonne réponse | un médaillon de 18 px s'envolait | un sceau de cire bleue frappe à côté de ta réponse, des pièces d'or jaillissent et filent vers le compteur |
| Mauvaise réponse (hors bataille) | une boîte rose remplaçait la question | la question reste ; ta réponse rougit, tremble et se barre ; la bonne passe en or avec un petit sceau ; l'explication se déplie dessous, sur parchemin à lettrine rouge |
| Mauvaise réponse (bataille) | « Pas tout à fait » et la bonne réponse | en plus : « Ta réponse » barrée de rouge au-dessus de la bonne réponse en or |
| Sceaux « Juste », « Dommage », « Sage décision » | dessin plat, posé sur le texte de la carte suivante | cire et plomb rendus en 3D, mot en lettres d'or dans l'empreinte ; « Sage décision » se pose là où la carte est partie, jamais sur la suivante |
| Bilan d'un événement ou du conseil | score fixe, « feuilles » en confettis | le score compte jusqu'à sa valeur, sceau d'or si tout est juste, vraies feuilles d'automne qui tombent en basculant |
| Carte de campagne | immobile | fumée au domaine et aux deux derniers bourgs pris, brume qui dérive, bannières qui flottent, eau qui scintille, cinq oiseaux toutes les 30 s ; ruban « Aujourd'hui » qui mène à l'événement du jour ; lumière d'aube, de jour ou de soir |
| Province prise | le bourg changeait d'un coup | la bannière ennemie tombe, le bourg passe aux couleurs de France, un anneau d'or s'ouvre, la brume du lieu suivant se lève |
| Route des expéditions | le sceau était déjà posé, la brume avait des bords nets | un petit étendard au lys suit le chemin pris, le trait se dore, le sceau tombe avec un éclat d'or ; les haltes s'ouvrent par-dessus la route assombrie ; brume fondue jusqu'au bord ; cartes de faveur en éventail |
| Barre de menu | planche plate, trait sous l'écran actif | sangle de cuir cousue de fil d'or, clous de laiton, fanion rouge qui pend sous l'écran actif |
| Boutons | dégradé d'or, reflet sur tous les boutons | cartouches dorés (or pour l'action, parchemin pour le reste, plomb quand c'est indisponible) qui s'enfoncent ; le reflet ne reste que sur « Jouer » |
| Accueil | « Jouer » sous le bas de l'écran en 1366 × 768 | « Jouer » posé sur la tapisserie, visible sans descendre |
| Cours | onglets de tableur, pointillés | signets à ruban de la couleur de la matière ; l'état de chaque cours en sceau de cire (vert au lys : acquis ; brique : à revoir ; or : en cours ; cercle vide : à venir) |
| Codex | accordéons de site | chaque matière est le dos d'un livre relié ; la galerie des souverains est un rouleau |
| Réglages | cases et champs de formulaire | cases en sceaux de cire rouge au lys, champs en cartouches ; dates lisibles |
| Chiffres | en Cinzel, « Cours 11 » se lisait « Cours II » | chiffres en Crimson Text dans les menus, les fenêtres, les questions, les récits et le conseil |
| Toucher (tablette) | rien ne se voyait sous le doigt | un anneau doré s'ouvre sous le doigt dans les menus (jamais sur une réponse) |
| Chargement | « Ouverture des archives… » seul | blason et nom du domaine, rail de laiton qui se remplit d'or, « 65 / 65 » |
| Champ de bataille (restes du lot A) | château qui s'effondrait dans trois nuages de coton ; champion peu visible ; losanges d'or sur la page à la pose d'une tour | nuage de poussière de pierre rendu en 3D ; champion avec une ellipse de sa couleur au sol et une bannière plus grande ; bouffée de terre au pied de la tour posée |
| Animations coupées | — | plus rien ne bouge ; sceaux, cartouches, fanion et sceaux d'état restent |

## 3. Images à regarder

Planches rangées dans le dépôt : `atelier/captures/graphismes-lot-b/revue/` (JPG ; à gauche avant, à droite après).

1. `menus-accueil-pc.jpg` et `menus-accueil-tablette.jpg` : la sangle, le fanion sous « Accueil », « Jouer » visible.
2. `menus-cours-pc.jpg`, `menus-codex-pc.jpg`, `menus-arsenal-pc.jpg` : signets et sceaux d'état, livres reliés,
   médaillons de l'arsenal.
3. `menus-reglages-tablette.jpg`, `menus-case-tablette.jpg` : la case « Sang » en sceau de cire, au doigt.
4. `menus-chargement-pc.jpg` : le blason et le rail de chargement.
5. `transition-conseil-pc.jpg` : avant, des images de cuir vide ; après, le conseil arrive sans trou.
6. `transition-accueil-domaine-pc.jpg`, `transition-evenement-tablette.jpg`, `fenetre-arsenal-pc.jpg` : un changement
   d'écran, l'ouverture d'un événement au doigt, une fenêtre.
7. `reponse-juste-pc.jpg` et `reponse-fausse-pc.jpg` : le sceau et les pièces ; la réponse montrée et l'explication.
8. `conseil-sceau-pc.jpg`, `conseil-erreur-pc.jpg`, `conseil-bilan-pc.jpg` : « Sage décision » à côté de la carte, la
   carte qui revient en cas d'erreur, le score qui compte.
9. `carte-vivante-pc.jpg` et `carte-conquete-pc.jpg` : la carte qui respire ; la prise du Moulin du Val.
10. `route-sceau-pc.jpg`, `route-sceau-tablette.jpg`, `route-carte-choisie-pc.jpg` : l'étendard, le sceau qui tombe,
    les cartes de faveur.
11. `tampons-cire.jpg` : les cinq sceaux (« Juste », « Coup d'éclat », « Dommage », « Vague repoussée », « Sage
    décision ») : chaque mot tient dans la cire.
12. Champ de bataille : `atelier/captures/graphismes-lot-a/revue-a-plus/` (effondrement, champion, tour posée).

Les séquences complètes (des centaines d'images) restent hors du dépôt, sur la machine de travail :
atelier/captures/audit-graphismes/lot-b/ (pc/, tablette/, menus/, carte-pc/, planches-*).

## 4. Les chiffres

Toutes les passes de perf.js sur le jeu final (complet, tablette, expéditions, ralenti 4 ×, graphismes) : aucun échec.

| Mesure | Seuil | Avant le lot | Après |
|---|---|---|---|
| Touche → question suivante peinte, bataille 1366 × 768 (médiane ; pire) | moins de 100 ms | 48 ; 80 | 40 ; 56 |
| Idem, bataille 1920 × 1080 | moins de 100 ms | 40 ; 64 à 80 | 48 ; 64 (184 avant ma correction) |
| Idem, escarmouche d'expédition (pire, 1366 et 1920) | moins de 100 ms | — | 32 et 56 |
| Idem, tablette au doigt 1280 × 800 et 1024 × 768 (pire) | moins de 100 ms | — | 96 et 64 |
| Idem, processeur ralenti 4 × : bataille ; événement | moins de 100 ms | — | 48 ; 88 |
| Temps de calcul d'une réponse (JEU.mesure, 60 mesures) | moins de 100 ms | — | 2 ms au pire |
| Énoncé visible en bataille à 1366 × 768 | 6 contrôles | — | 6 sur 6 |
| Boucle de bataille au ralenti 4 ×, 1340 × 800 (médiane) | pas au-dessus de 8,4 ms | 6,9 et 7,2 ms | 6,8 ms (7,0 et 7,2 en alternance avec la copie d'avant) |
| Boucle de bataille PC 1920 × 1080 (95 % ; pire) | 4,1 ; 7,1 ms | 3,7 ; 7,1 | 2,8 ; 6,5 |
| Écrans immobiles au ralenti 4 × : campagne, route, conseil (médiane ; 95 %) | 16,7 ; sous 34 ms | 16,7 ; 16,8 | 16,7 ; 16,8 au plus, aucune tâche longue |
| Images de cuir vide dans les changements d'écran | 0 | 31 (PC) et 27 (tablette) | 0 sur 44 séquences PC, 44 tablette, 13 au ralenti |
| Construction d'un écran au ralenti 4 × (accueil, domaine, campagne, cours, codex, réglages, route ; ms) | pas plus de 10 % au-dessus | 23, 46, 54, 18, 18, 45, 74 | 7, 23, 30, 10, 12, 20, 66 |
| Ouverture des menus au ralenti 4 × avec et sans l'habillage (accueil, Cours, Codex, Réglages ; ms) | au plus + 15 ms | 65, 70, 50, 122 | 70, 72, 62, 121 |
| Hauteur du bandeau et du menu (trois fenêtres) | inchangée | 64,4 et 69,5 px | 64,4 et 69,5 px |
| Cibles au doigt (1340 × 800 et 1024 × 768) | 44 px au moins | — | 284 cibles, aucune en dessous |
| Contraste des textes des menus | 4,5 : 1 au moins | étiquettes d'état à 3,1 à 4,2 | 26 textes, tous au-dessus |
| Animations coupées : animations en cours sur 7 écrans | 0 | — | 0, aucune erreur |
| Préférence « réduire les animations » du système | 0 | — | 0 (après ma correction) |
| Moteur de bataille ; simulation de 200 campagnes | identiques | — | identique octet pour octet ; écarts nuls |
| tests.js ; valider.js | 0 échec ; 0 erreur | — | 381 réussis, 0 échec ; 0 erreur, 5 alertes (sources absentes de DEPOT/, déjà connues) |

## 5. Ce que j'ai corrigé en relisant

1. **La question suivante tardait en bataille sur grand écran.** En 1920 × 1080, la première réponse d'une bataille
   mettait jusqu'à 184 à 256 ms à montrer la question suivante (5 réponses sur 25 au-dessus de 100 ms ; la copie d'avant
   le lot : aucune). Cause : l'écran de la campagne qui s'effaçait encore par-dessus la bataille. Désormais une bataille,
   un conseil ou un événement arrive d'un coup, en pleine lumière, avec un léger glissé : aucun cuir vide, et 0 réponse
   sur 26 au-dessus de 100 ms (pire : 80 ms ; la copie d'avant : 64). Fichiers : jeu/js/interface.js (ui.afficher),
   jeu/css/jeu.css.
2. **La préférence « réduire les animations » ne coupait pas tout.** La lueur de l'événement du jour tournait sans fin,
   et d'autres petits mouvements posés sur des pseudo-éléments restaient. La règle couvre maintenant tout ; mesuré :
   0 animation sur les 7 écrans.
3. **Le sceau d'une bonne réponse tombait sur une réponse de la question suivante**, qui arrive au même endroit : il
   pouvait se lire comme un indice. Il se pose maintenant dans la marge, juste à droite de ta réponse (jeu/js/anim.js).
4. **« Cours 11 » se lisait encore « Cours II »** dans les récits, les questions et le conseil (« Affaire I / I0 »). Les
   chiffres en Crimson Text y sont étendus (jeu/css/menus.css), sauf le compteur d'or du champ de bataille.
5. **L'alerte du rival sur la carte** clignotait par une ombre qui faisait repeindre le bandeau à chaque image ; elle
   respire maintenant par l'opacité seule, comme le reste de la carte.
6. Petits travaux de fusion : les contrôles des menus (atelier/outils/controles-menus.js) sont branchés dans tests.js
   (11 contrôles) et dans perf.js (passe graphismes) ; une animation morte de la route retirée.

## 6. Ce qui reste (à reprendre, rien de bloquant)

1. **Porte d'une expédition au ralenti 4 ×** : de la réponse aux cartes de faveur, 88 à 136 ms selon les passages ; la
   copie d'avant le lot, mesurée en alternance, fait 128 à 200 ms. Le lot B n'a donc rien aggravé (plutôt amélioré),
   mais le seuil de 100 ms n'est pas tenu : c'est un contrôle du lot C. Même chose pour un événement au ralenti (72 à
   104 ms ; avant : 64 à 120).
2. **Pour le lot C** (prévu au plan, pas du lot B) : poussières de l'accueil (background-position), courant et halo du
   domaine (stroke-dashoffset, stroke-width), nuages et blason sous un filtre SVG ; case « Ambiance » pas encore
   branchée (la cale vaut « Animations ») ; boucle de bataille au ralenti 6,8 ms pour un objectif de 4 ms ; lueur de
   l'événement du jour et halos des lieux, qui tournent encore sans ambiance (ce sont des signaux de jeu : à trancher).
3. **Chiffres en Crimson Text sur la carte, la route et le bandeau du champ** : prévu en C2.7, après avoir vérifié le
   compteur d'or à rouleaux.
4. **Champion anglais** : son ellipse rouge au sol pourrait se lire comme une flaque. À regarder sur la tablette ; sinon,
   correctif proposé dans bataille.js (anneauChampion) : centre presque transparent (0,1), bord seul marqué.
   **Fait** (section 8).
5. **« Sage décision » au bilan** : pendant ses deux premières images (échelle 1,8), le sceau déborde du bord droit de la
   fenêtre en 1366 × 768. Correctif proposé dans ui.placeTampon : garder le centre à 140 px du bord quand il se pose
   dessous ou sur le coin. **Fait, et étendu au cas « à côté »** (section 8).
6. **Outil de capture des écrans** (atelier/captures/audit-graphismes/capturer.js) : la page plante pendant l'analyse du
   cuir vide d'une séquence de 140 images (le domaine). Correctif proposé : analyser les images par paquets de 30. Les
   captures de ce lot ont été faites sans l'étape du domaine (hors lot B). **Fait** (section 8).
7. La page de chargement compte 6 à 11 images « de cuir » : c'est l'écran de chargement lui-même (blason et rail sur le
   cuir), pas un changement d'écran.
8. Version : inchangée (0.9.4). À la livraison du lot : 0.9.5 dans jeu/VERSION.txt et JEU.version, puis
   generer-sw.js.

## 7. À essayer sur la tablette

1. Ouvrir le jeu : le blason et une barre dorée qui se remplit, puis l'accueil avec « Jouer » visible sans descendre.
2. Toucher « Cours » : le fanion rouge passe sous « Cours », un anneau doré s'ouvre sous le doigt, chaque cours a son
   petit sceau de cire.
3. Faire l'événement du jour : une bonne réponse est frappée d'un sceau bleu à côté, des pièces filent vers le haut ;
   une erreur montre ta réponse en rouge, la bonne en or, l'explication dessous.
4. Gagner une bataille qui prend une province : de retour sur la carte, la bannière ennemie tombe et le bourg passe aux
   couleurs de France.
5. Dans les Réglages, décocher « Animations » : plus rien ne bouge, mais les sceaux, les cartouches et le fanion restent.

## 8. Chasse aux bugs (31/10/2026, après cette relecture)

Après la relecture, des vérificateurs ont rejoué le jeu en cherchant la petite bête : vrais clics, vrais touchers au
doigt, jeu rechargé en pleine halte, sauvegarde importée. Six défauts ont été confirmés. Je les ai tous corrigés, avec
les correctifs qu'ils avaient essayés sur une copie, puis j'ai rejoué leurs scénarios sur le jeu corrigé. Aucun ne fait
perdre une ressource, une province ou une réponse : c'était de l'affichage, ou un choix perdu.

| Ce qui arrivait | Maintenant | Fichier |
|---|---|---|
| « Réduire les animations » rallumé dans Windows en cours de partie, ou sauvegarde importée avec « Animations » décoché : l'ancien écran restait affiché par-dessus le nouveau pendant trois quarts de seconde, et une fenêtre fermée restait figée à l'écran | le jeu suit le réglage du système dès qu'il change ; quand les animations se coupent, ce qui s'efface encore part tout de suite. Rejoué : l'ancien écran est parti à 300 ms, comme d'habitude ; après l'import, la fenêtre est fermée dès 100 ms | jeu/js/interface.js |
| Après une erreur hors bataille (événement du jour, conseil, halte d'expédition), la page restait descendue : la question suivante arrivait avec son personnage caché sous le bandeau, et le bouton « Quitter » sortait de l'écran | « Continuer » remonte la page en haut, comme avant le lot. Rejoué sur 5 types de questions, deux tailles d'écran et le conseil : toujours en haut, le personnage visible (299 à 369 px) | jeu/js/interface.js |
| Tablette : deux touchers rapides sur une halte choisissaient Repos, Veillée ou une carte de faveur sans que la fenêtre ait été vue (défaut plus ancien que le lot) | la garde du double toucher couvre aussi les fenêtres des haltes. Rejoué : 0 choix volé sur 10 au bivouac (10 sur 10 avant), 0 sur 16 à la porte ; un toucher voulu marche toujours | jeu/js/interface.js, jeu/js/ecran-expedition.js |
| Veillée sans faute : la faveur à affiner était perdue si le jeu se fermait ou si l'élève quittait l'écran pendant le choix (défaut plus ancien que le lot) | le choix est enregistré dans la sauvegarde, comme les cartes d'une porte : il revient à la réouverture. Le numéro de la sauvegarde ne change pas (un champ de plus) | jeu/js/ecran-expedition.js |
| La fenêtre d'une halte (porte, explication d'une erreur, éventail de faveurs) pendait sous le bas de la page de parchemin, sur le cuir (jusqu'à 144 px) | la page grandit avec la fenêtre : elle finit 180 à 290 px au-dessus du bas de la page, à toutes les tailles. Contrepartie, comme avant le lot : quand la fenêtre est plus haute que la route, les cartouches du bas descendent sous elle et remontent ensuite. Sans fenêtre, rien ne bouge (cartouches entiers à 763 px en 1366 × 768) | jeu/css/jeu.css |
| Retour sur la route après une halte : la page restait descendue, le titre « La route des semaines » caché sous le bandeau | la route revient en haut (titre à 159 px), sur PC comme sur tablette | jeu/js/ecran-expedition.js |

Trois points de la section 6 sont aussi réglés :

- **Champion anglais** (point 4) : l'ellipse rouge pleine devient un anneau, centre presque transparent. Regardé en gros
  plan, avant et après : la terre se voit au milieu, on ne peut plus le prendre pour une flaque.
- **« Sage décision »** (point 5) : le correctif proposé (dessous et sur le coin) ne suffisait pas. En mesurant, le sceau du
  bilan se posait « à côté », et c'est là qu'il débordait : de 31 px en 1280 × 800, la taille de la tablette, d'un côté
  comme de l'autre. Le centre du sceau reste maintenant à 140 px des bords dans tous les cas. Au bilan, en 1366 × 768 et
  en 1280 × 800, il se pose sous le bilan, comme il le faisait déjà en 1024 × 768 (regardé : il ne couvre pas les
  boutons). Les sceaux des affaires ordinaires ne bougent pas.
- **Outil de capture** (point 6) : les images sont analysées par paquets de 30. Essayé sur 140 images de 1366 × 768 du
  domaine (240 Mo), dont 14 au cuir nu glissées exprès : l'ancienne façon plante et n'en trouve aucune, la nouvelle les
  trouve toutes les 14.

Petit ménage : un appel devenu inutile au début d'une partie a été retiré.

Les règles du jeu ne changent pas : moteur de bataille identique octet pour octet, simulation de 200 campagnes aux mêmes
chiffres (écarts nuls), tests.js 381 réussis et 0 échec, valider.js 0 erreur (5 alertes connues). Toutes les passes de
perf.js (complète, tablette, expéditions, ralenti, graphismes) se terminent sans échec. De la réponse à la question
suivante : 64 ms au pire en bataille (1366 × 768 et 1920 × 1080), 80 ms au pire sur la tablette. La porte d'une
expédition au ralenti 4 × reste au-dessus de 100 ms, comme avant (point 1 de la section 6, lot C). Mesurée en
alternance avec la version d'avant ces correctifs, elle donne des chiffres du même ordre : 96 à 168 ms avant, 112 à
184 ms après.
