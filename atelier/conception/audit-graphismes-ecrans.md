# Audit graphique des écrans hors champ de bataille (31/10/2026)

Demande de Romain du 31/10/2026 : « Améliore les graphismes et les animations ». Ce document est le volet « écrans »
de l'audit : accueil, domaine, campagne (carte, brume, missives, tribut, alerte, conquête), conseil, cours, Codex,
réglages, interface des questions (apparition, bonne réponse, erreur, Seconde chance), Expéditions (départ, Armorial,
semaine, route, haltes, porte, cartes, bilan), transitions, survol et toucher, chargement. Le champ de bataille a son
propre audit. Rien n'a été modifié dans jeu/ : ce volet ne fait que regarder, mesurer et proposer.

Version regardée : 0.9.2 (JEU.version), pendant la passe tablette (d'autres agents modifient jeu/ en même temps : les
numéros de lignes cités peuvent avoir bougé, les noms de classes et de fonctions non).

Complété après l'interruption de la première passe : l'événement du jour sur l'écran de campagne (3.5), la brume et
le halo de la route des expéditions, qui saute d'une halte à l'autre sans pion de compagnie (3.12). Deux images de
preuve ajoutées (`pc/33z-…`, `pc/36z-…`), tirées des captures existantes ; rien d'autre n'a été refait.

Lecture rapide : la section 1 dit l'essentiel, la section 5 donne les dix chantiers classés par gain visuel rapporté au
coût. La section 3 est la revue écran par écran, avec les chemins des captures pour vérifier chaque constat.

## 1. L'essentiel

Ce qui tient déjà bien : la carte de campagne rendue en 3D avec ses nappes de brume, le parchemin d'itinéraire des
expéditions et ses images, les missives avec lettrine et sceau de cire, la carte du conseil qui se retourne et se glisse,
le sceau « Sage décision », le gain qui s'envole vers le médaillon, le tampon de l'or en bataille, le chroniqueur. Le
vocabulaire visuel (cuir, parchemin, filets d'or, Cinzel) est cohérent d'un écran à l'autre. Aucune erreur JavaScript
sur les deux parcours complets.

Cinq défauts traversent tout le jeu. Ils comptent plus que n'importe quel détail d'un écran.

1. **Chaque changement d'écran passe par le cuir nu.** L'ancien écran disparaît d'un coup (`hidden`), le nouveau se
   fond depuis zéro (`.ecran.entree`, 260 ms depuis `opacity: 0`). Entre les deux : 60 ms de cuir vide sur PC
   (accueil → domaine), 150 ms à l'ouverture du conseil, et plus sur la tablette où le rendu du domaine ou du Codex
   prend 220 à 250 ms. Aucune sortie, aucune continuité. C'est ce qui donne l'impression d'un site de pages plutôt que
   d'un jeu. Le même mécanisme (`JEU.ui.afficher` rappelé pour redessiner) efface aussi deux animations qui existent
   déjà : le sceau qui se pose sur la route des expéditions et la carte de faveur choisie (voir 3.12).
2. **Hors bataille et conseil, une réponse n'a aucun poids.** Bonne réponse à un événement, à une porte ou chez le
   marchand : la question suivante remplace l'ancienne dans la même image, un petit médaillon de 18 px s'envole, un
   son. On ne voit jamais quelle réponse était juste. Mauvaise réponse : la question disparaît et une boîte rose
   « Pas tout à fait. » la remplace. Pas de réponse choisie qui rougit, pas de secousse, pas de bonne réponse qui se
   révèle.
3. **La carte de campagne et le plan du domaine sont immobiles.** Sur la carte : aucune bannière qui flotte, aucune
   fumée au domaine, pas d'eau qui scintille, pas d'oiseau, la brume ne dérive pas, la lumière ne change jamais. La
   conquête d'une province n'est pas animée : la carte est simplement redessinée (avec son passage par le cuir nu).
   Le plan du domaine, lui, est le seul écran qui sort de la direction artistique : rectangles pastel arrondis,
   taches blanches floues, croix dans des cercles pointillés, routes beiges. Il se lit comme un schéma, pas comme un
   plan enluminé. Sur la route des expéditions, la compagnie n'a pas de pion : le halo saute d'une halte à l'autre,
   et la brume des semaines suivantes est un rectangle pâle à bords nets.
4. **Les écrans de listes et les états de survol, de focus et de toucher ont un air de formulaire.** Onglets
   rectangulaires, lignes à pointillés, barres d'accordéon à liseré, boutons « Débloquer · 10 », cases à cocher et
   champs de date natifs, rectangle de focus bleu-or autour des boutons du menu. Sur la tablette, l'appui n'enfonce
   une carte que de 2 px sous un doigt qui la cache.
5. **Un vrai problème de coût sur l'accueil.** Les poussières dorées de la tapisserie animent `background-position`
   de six dégradés superposés : la zone est repeinte à chaque image. Mesuré en 1340 × 800 avec le processeur ralenti
   4 × : 133 ms par image en médiane, 95 % des images au-delà de 34 ms, tâches longues jusqu'à 200 ms. Même sur PC sans
   ralentissement : 33 ms par image, 18 % au-delà de 34 ms. Tant que l'élève est sur l'accueil, la tablette chauffe
   pour rien. Tous les autres écrans tiennent 16,7 ms par image, sauf le domaine (15 % d'images lentes, voir 3.4).

## 2. Méthode et chiffres

### 2.1 Ce qui a été fait

- `atelier/captures/audit-graphismes/capturer.js` rejoue le parcours complet dans Chromium, pour deux profils : **pc**
  (1366 × 768, souris) et **tablette** (1340 × 800, toucher émulé, `hover: none` et `pointer: coarse` forcés, l'interface
  se déclare bien tactile : `JEU.ui.tactile` vaut vrai). Chaque écran est capturé (« fixe », parfois la page entière),
  et chaque transition ou animation est enregistrée en **séquence** : les images que produit le compositeur
  (CDP `Page.startScreencast`), horodatées en ms, 20 images au plus par séquence, réduites à 60 %. Quand rien ne bouge,
  le compositeur ne produit rien : le nombre d'images reçues est déjà une mesure.
- `atelier/captures/audit-graphismes/mesurer.js` mesure, en 1340 × 800 avec le processeur ralenti 4 × puis sans
  ralentissement : le temps de construction de chaque écran (`JEU.ui.afficher`), l'écart entre deux images sur l'écran
  immobile pendant 2,5 s (ce que coûte l'ambiance), et les tâches longues.
- Une passe automatique a cherché les images « vides » (zone centrale au cuir, sans parchemin) dans chaque séquence :
  c'est elle qui a chiffré le cuir nu des transitions.
- Sorties : `atelier/captures/audit-graphismes/pc/`, `…/tablette/` (fixes `NN-nom.png`, séquences `seq-NN-nom/fNN-ttttms.png`),
  `journal-pc.json`, `journal-tablette.json`, `mesures.json`. Environ 1 Go au total, à ne pas commiter.

Pour rejouer : `NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/captures/audit-graphismes/capturer.js [pc|tablette]`
(`ETAPES=expedition,conseil` pour ne rejouer que certaines étapes), puis `… node atelier/captures/audit-graphismes/mesurer.js`.

### 2.2 Mesures (1340 × 800)

Construction d'un écran, première ouverture puis deux suivantes (ms, synchrone, avant la peinture) :

| Écran | CPU × 4 | CPU × 1 |
|---|---|---|
| accueil | 70 · 11 · 8 | 87 · 63 · 13 |
| domaine | 224 · 46 · 49 | 61 · 10 · 11 |
| campagne | 153 · 37 · 105 | 33 · 21 · 17 |
| cours | 121 · 72 · 144 | 12 · 29 · 8 |
| codex | 249 · 12 · 9 | 7 · 5 · 5 |
| réglages | 174 · 80 · 133 | 22 · 15 · 32 |
| route d'expédition | 49 · 27 · 45 | 20 · 15 · 15 |
| chargement complet du jeu | 1 249 | 528 |

Écart entre deux images, écran immobile, 2,5 s (médiane · 95e centile · part au-delà de 34 ms) :

| Écran | CPU × 4 | CPU × 1 |
|---|---|---|
| accueil (tapisserie, poussières) | **133 · 200 · 95 %**, tâches longues jusqu'à 201 ms | **33 · 50 · 18 %** |
| domaine (nuages flous, oiseaux, villageois, rivière) | 16,7 · 66,7 · 15 %, une tâche de 448 ms | 16,7 · 16,8 · 0 % |
| domaine, animations coupées | 16,7 · 16,8 · 0 % | idem |
| domaine, seigneur au galop | 16,7 · 33,4 · 3 %, une tâche de 195 ms | 16,7 · 16,7 · 0 % |
| campagne (halo) | 16,7 · 16,8 · 1 % | 0 % |
| réglages (reflet du bouton) | 16,7 · 16,8 · 0 % | 0 % |
| route d'expédition (halo) | 16,7 · 16,7 · 0 % | 0 % |

Cuir nu pendant les transitions (profil pc, images du compositeur) : accueil → domaine, 3 images vides de 393 à
448 ms après le clic ; ouverture du conseil, 4 images de 217 à 366 ms ; menu Cours, de 98 à 235 ms ; retour sur la
route après une halte, de 166 à 237 ms ; carte de faveur choisie, 1 image à 201 ms ; fiche du Codex, 1 image. Sur la
tablette, mêmes creux, un peu plus longs (ouverture de la missive : 514 à 586 ms). Les « vides » relevés pendant
« Lever le camp » sont le voile sombre de la confirmation, pas un trou.

## 3. Revue écran par écran

Chaque point : ce que je vois (captures), ce que serait bien, comment le faire ici, ce que ça coûte sur la tablette,
le réglage à respecter. Convention de coût : « compositeur » = transform et opacity seulement, pas de repeinture par
image ; « j » = jour de travail.

### 3.1 Chargement

- **Vu.** `pc/seq-00-chargement/` : une image blanche (le navigateur avant la page), puis le cuir, le bandeau sans
  médaillons et « Ouverture des archives… » en Cinzel au milieu du vide (f02-0310ms), pendant 0,5 s sur PC et 1,2 s
  sur la tablette ralentie, puis l'accueil qui se fond depuis zéro (f03-0781ms). Rien ne dit que le jeu charge quelque
  chose, rien n'annonce le domaine.
- **Bien.** Le blason du domaine au centre, une ligne « Archives : 12 / 38 » qui avance (le chargeur connaît le nombre
  de cours à charger), un filet d'or qui se remplit, et l'accueil qui vient par-dessus en fondu croisé au lieu d'un
  trou.
- **Ici.** `jeu/js/chargeur.js` compte déjà les fichiers ; `demarrage.js` retire `body.chargement`. Remplacer le
  `<p class="attente">` par un petit bloc (blason SVG `JEU.icones.blason`, texte, barre `transform: scaleX`), le
  faire disparaître en 150 ms (`opacity`) après `JEU.pret`. La couleur de fond du `<html>` posée en CSS évite l'image
  blanche sur un PC lent.
- **Coût.** Nul à l'exécution ; 0,25 j.
- **Réglage.** Aucun (ce n'est pas une animation d'ambiance ; sous `prefers-reduced-motion`, la barre saute sans
  transition).

### 3.2 Changement d'écran et fenêtres

- **Vu.** `pc/seq-02-transition-accueil-domaine/f08-0393ms.png` : le cuir nu. `pc/seq-17-conseil-ouverture/f06-0217ms.png` :
  idem pendant 150 ms. `pc/seq-23-transition-cours/f04-0165ms.png`. L'ancien écran est coupé net, le nouveau monte de
  10 px en 260 ms depuis `opacity: 0` (`.ecran.entree`, jeu.css l. 426). Les fenêtres (`#modale`) : le voile sombre
  apparaît d'un coup, la boîte se fond en 180 ms (`apparition`), et la fermeture est instantanée
  (`pc/seq-04b-missive-fermeture/`). Un onglet des Cours, une matière du Codex qui se déplie : changement sec
  (`seq-23c`, `seq-24b` : 2 à 3 images reçues, donc rien ne bouge).
- **Bien.** Jamais de cuir nu : l'ancien écran s'efface (140 ms, légère descente) pendant que le nouveau arrive
  déjà ; une fenêtre entre à l'échelle (0,96 → 1) et sort en 120 ms ; le voile se fond en 150 ms. Le contenu d'un
  écran redessiné sur place (onglet, conquête, retour sur la route) ne repasse jamais par l'entrée d'écran.
- **Ici.** Dans `JEU.ui.afficher` (`jeu/js/interface.js`) : au lieu de `s.hidden = true` sur l'ancien écran, lui
  poser `.sortie` (`position: absolute; inset: 0 auto auto 0; width: 100%; pointer-events: none; animation: sortieEcran
  .14s forwards`, puis `hidden` à `animationend` ou après 160 ms) ; `main { position: relative }`. Le nouveau écran
  est construit tout de suite, comme aujourd'hui, et son `entreeEcran` part d'`opacity: .3` au lieu de 0, pour que
  même un rendu lent ne montre jamais le cuir. Ajouter un paramètre `{ sansEntree: true }` (ou une fonction
  `JEU.ui.redessiner(nom)`) pour les redessins sur place : conquête, arsenal fermé, route d'expédition, onglets.
  Pour `#modale` : classe `.ouverte` avec transition d'opacité sur le voile, `.modale-boite` en `scale(.96) → 1`,
  et `fermerModale` qui pose `.ferme` 120 ms avant `hidden` (le `retourModale` reste appelé tout de suite : une
  bataille qui suit une missive ne doit pas attendre). Les onglets et le dépli du Codex : `apparition` sur le bloc
  remplacé.
- **Coût.** Compositeur seulement : deux calques pendant 150 ms. Mesurable nulle part. 0,5 j avec les essais.
- **Réglage.** `.sans-anim` coupe tout (déjà le cas : `animation: none !important`) ; `prefers-reduced-motion` idem.
  Garder le `window.scrollTo(0, 0)` après la sortie, pas avant (sinon l'ancien écran saute en haut pendant sa sortie).

### 3.3 Accueil

- **Vu.** `pc/01-accueil.png`, `tablette/01-accueil.png` : la tapisserie du cerf, le cartouche du titre, trois
  cartouches, le grand bouton « Jouer » avec son reflet qui passe toutes les 5 s (`pc/seq-26c-bouton-reflet/f14-4801ms.png`,
  visible et agréable). Deux défauts : (a) **le menu est caché** sous le bandeau sur les deux profils, parce que
  `jouer.focus()` fait défiler la page jusqu'au bouton à l'ouverture (`interface.js`, `ui.ecrans.accueil`) ; (b) les
  poussières dorées coûtent 133 ms par image sur la tablette ralentie (section 2.2) pour un effet qu'on ne remarque
  pas (elles bougent de 60 px en 26 s). Le ken Burns de la tapisserie (38 s, échelle 1 → 1,12) est lui sur
  `transform` : correct.
- **Bien.** Le menu visible à l'ouverture. Les poussières gardées, mais gratuites. Le blason qui respire (déjà :
  `respiration`) et, une fois par visite, un reflet de lumière qui traverse la tapisserie comme un rayon par une
  fenêtre (bande claire en dégradé, `transform: translateX`, 6 s), discret.
- **Ici.** `jouer.focus({ preventScroll: true })`. Pour les poussières (jeu.css l. 433 à 452) : ne plus animer
  `background-position` ; garder le même dégradé sur `::after` avec `inset: -100% 0 0 0` (deux fois la hauteur, tuiles
  toutes de 240 px de haut pour boucler) et animer `transform: translateY(0 → -240px)` sur 26 s (`will-change:
  transform`) : le calque est peint une fois, le compositeur le déplace. Variante encore plus légère : six `<span>`
  de 3 px animés en `transform` et `opacity`.
- **Coût.** Le passage de 133 ms à 16,7 ms par image sur l'accueil tablette, et de 33 à 16,7 ms sur PC. 0,25 j.
- **Réglage.** Animations (déjà coupées par `.sans-anim`).

### 3.4 Domaine

- **Vu.** `pc/03-domaine.png`, `tablette/03-domaine.png`, `pc/03-domaine-entiere.png` : fond peint correct (prés,
  rivière, forêts), mais par-dessus un schéma : six rectangles arrondis pastel à liseré blanc, deux croix par
  quartier dans des cercles pointillés, des taches blanches floues (`filter: blur 9`) pour « endormi », des
  rectangles bruns pour les maisons, des routes beiges rectilignes. Le seigneur est une silhouette plate teintée
  en turquoise (`03c`, `seq-03-domaine-galop/f12-0803ms.png`) ; il trotte, soulève de la poussière (bien), mais
  reste une icône. L'ambiance tourne (116 images en 3 s : rivière, nuages, oiseaux, villageois) sans qu'on le voie
  sur les images échantillonnées : les villageois sont des triangles de 9 px, les nuages des ombres translatées
  avec un filtre de flou SVG, les oiseaux passent toutes les 26 s. Et ce flou coûte : 15 % d'images lentes et une
  tâche de 448 ms en CPU × 4 (un `filter` SVG sur un groupe qui se déplace est recalculé). Sans animations
  (`pc/50-sans-anim-domaine.png`) : le plan est sage et net, ce qui montre que l'ambiance n'apporte presque rien
  visuellement aujourd'hui. Le toucher du plan fonctionne sur la tablette (`tablette/seq-03d-domaine-toucher-plan/`).
- **Bien.** Un plan de ville enluminé, dans la lignée de la carte de campagne : des parcelles rendues (murs,
  vergers, champs) à la place des rectangles pastel ; des fondations de pierre pour les emplacements vides ; des
  bâtiments rendus en 3D quand ils sont construits (comme les bourgs `lieu-france*.png`) ; la brume des quartiers
  endormis avec la nappe `lieu-brume.png` déjà rendue ; des ombres de nuages pré-floutées ; le seigneur avec la
  bande de cavalier rendue pour la bataille ; des fanions qui flottent avec les quatre vues déjà utilisées en
  bataille ; une fumée qui monte de chaque bâtiment construit (les trois cercles existent déjà, ils suffisent).
- **Ici.** Rendus : `atelier/outils/rendu-3d/places.py` et `decors.py` (maisons, moulin, forge, halle à 80 × 80
  comme `lieu-france`), `unites.py` (les cavaliers de la bataille ont déjà une bande de marche : la réutiliser pour
  le seigneur via `JEU.SPRITES`), `effets.py` pour une bande de fumée si l'on veut mieux que les cercles. Dans
  `domaine.js`, `dessiner()` : remplacer les `rect` des quartiers par des `<image>` de parcelles, les cercles
  pointillés par une image de fondation, les ellipses floues par `lieu-brume.png` (deux nappes à 1,15 ×, `opacity`
  animée très lentement en `transform`), les nuages par des ellipses à `radialGradient` sans filtre (ou une PNG
  pré-floutée). Le flou SVG disparaît des deux endroits où il est animé. Le halo du quartier proche anime
  `stroke-width` (`@keyframes halo`, jeu.css) : le passer en `transform: scale` et `opacity`, comme `halo-carte`.
  Garder les rubans de titre, la rose des vents et le cartouche.
- **Coût.** Moins cher qu'aujourd'hui une fois le flou SVG parti (les 15 % d'images lentes tombent à 0, comme le
  montre la ligne « animations coupées »). Travail : 2 à 3 j rendus compris. C'est le chantier le plus lourd, et le
  plus visible après la carte.
- **Réglage.** Animations pour tout ce qui bouge (fumées, fanions, nuages, villageois, oiseaux) ; les images rendues
  restent sans animation.

### 3.5 Campagne

**La carte.** `pc/04-campagne.png`, `tablette/04-campagne.png`. C'est le plus bel écran du jeu : relief, forêts,
escarpement, fleuve, bourgs rendus avec leur bannière, nappes de brume, halo d'or qui bat sur la cible
(`pc/seq-05-campagne-halo/`, 68 images en 1,8 s : l'ellipse respire bien, 16,7 ms par image). Mais rien d'autre ne
vit : les bannières des bourgs sont cuites dans l'image, le domaine n'a pas de fumée, l'eau est peinte, les nappes de
brume ne dérivent pas, le ciel est le même à 8 h et à 20 h.

- **Bien (ambiance de carte, dans l'ordre du gain).** 1) Les bannières flottent : une bande de quatre vues par camp
  (France, Angleterre, Omeyyades), posée sur la hampe de chaque bourg, changée toutes les 150 ms. 2) Une fumée monte
  des cheminées du domaine et des bourgs pris (les mêmes trois cercles que le domaine, teintés plus clair, ou la
  bande `effets.py`). 3) L'eau scintille : un trait blanc à 35 % en pointillés animés (`stroke-dashoffset`, comme le
  `courant` du domaine) le long du fleuve et de la rivière, deux chemins. 4) Les nappes de brume dérivent de ± 6 px
  en 14 s (`transform`, aller-retour) ; même chose sur la route des semaines. 5) Un vol de cinq oiseaux traverse la
  carte toutes les 30 s (le groupe `.oiseaux` du domaine, tel quel). 6) La lumière du jour : une teinte calculée une
  fois à l'ouverture d'après l'heure (aube dorée avant 10 h, plein jour, soir cuivré après 18 h), simple dégradé
  posé sur la carte avec `mix-blend-mode: multiply` et une opacité de 0,12 à 0,2 ; aucune animation, juste de la
  variété d'un jour à l'autre.
- **Ici.** `ecran-campagne.js`, `noeud()` : ajouter un `<image class="banniere">` par lieu tenu, ancré au point de
  hampe du sprite (nouveaux champs `hampe: [x, y]` dans `sprites.js`, rendus par `places.py` sans la bannière, ou
  bannière rendue à part par `campagne.py`) ; un seul `setInterval` de 150 ms qui change l'attribut `href` des onze
  bannières, arrêté quand l'écran n'est plus affiché ou quand `JEU.anim.actif()` est faux. Fumée : un groupe
  `.fumee` par lieu pris aux coordonnées `fumees` que `sprites.js` connaît déjà pour les places fortes (ajouter le
  même champ aux `lieu-*`). Eau : deux `<path>` tracés une fois sur le fond 3D (les coordonnées se relèvent sur
  `fond-campagne.jpg`). Brume : `.nappe { animation: derive 14s ease-in-out infinite alternate }`. Lumière : classe
  `aube`, `jour` ou `soir` sur `.carte-campagne`.
- **Coût.** Bannières : onze changements d'attribut toutes les 150 ms, négligeable ; fumées et oiseaux : transform et
  opacity ; eau : deux chemins repeints par image, quelques dixièmes de ms ; brume : transform ; lumière : nul.
  Ensemble mesuré à prévoir sous 2 ms par image en CPU × 4 (à vérifier avec `mesurer.js`). Travail : 1 à 1,5 j,
  rendu des bannières compris.
- **Réglage.** Animations pour tout sauf la lumière du jour.

**Les lieux : survol, focus.** `pc/06-campagne-survol-cible.png` : le survol du Gué éclaircit le bourg de 15 %, à
peine visible. `pc/06e-campagne-focus-cible.png` : le focus clavier s'est posé sur le bouton « Cours » du menu avec
un rectangle, l'air d'un formulaire. Bien : au survol, le halo passe au plein (opacity 1, anneau plus large) et le
bourg se soulève de 2 px (`transform`), le curseur devient une main ; le focus visible reprend le halo d'or arrondi
du jeu plutôt qu'`outline` (règle `:focus-visible` globale à remplacer par un `box-shadow` or à coins arrondis, et
pour les SVG le halo déjà prévu). Coût nul ; 0,25 j avec le tour des boutons.

**La missive.** `pc/04-campagne-missive.png` : belle lettre (médaillons, lettrines aux couleurs du camp, sceau de
cire bleu). Ouverture : voile instantané, lettre en fondu 180 ms (`pc/seq-04-campagne-missive-ouverture/f04-0195ms.png`) ;
fermeture sèche. Bien : la lettre se déplie (rotateX −10° → 0, origine en haut, 220 ms), le sceau saute en place
(échelle 1,4 → 1, 250 ms, décalé de 150 ms, avec le son `sceau` déjà joué), et à la fermeture la lettre descend en
s'effaçant 120 ms. Ici : classes sur `.missive-boite` et `.missive-sceau` dans jeu.css, le cadre général de 3.2.
Coût nul ; 0,25 j.

**Le tribut du jour.** `pc/07-campagne-tribut-toast.png`, `pc/seq-07-campagne-tribut/` : le message glisse en haut à
droite, lisible, correct. Bien : les médaillons du bandeau concernés rebondissent (classe `rebond` existante) et un
éclat d'or part de chaque médaillon (`JEU.anim.eclat`, 8 particules). Coût nul ; 0,1 j.

**L'événement du jour.** `pc/12-campagne-carte-evenement.png`, `pc/04-campagne-entiere.png`, `tablette/04-campagne.png` :
l'événement est la sixième carte de la grille, sous la carte de campagne. En 1366 × 768 comme en 1340 × 800, aucune
carte d'action n'est visible sans défiler (sur la tablette, seul le haut des cartes dépasse). L'événement ne se
distingue que par un liseré brique au lieu de l'or, et rien sur la carte ni dans le bandeau ne dit qu'il attend. Bien :
un petit cachet de cire « Aujourd'hui » épinglé au coin de la carte, frappé une fois à la première vue du jour
(échelle 1,4 → 1, 250 ms, son `sceau`), une lueur brique qui respire lentement sur le liseré, et sur la carte de
campagne, sous le titre, un ruban qui porte le titre de l'événement (« Des marchands à la porte ») et fait défiler
jusqu'à la carte au clic. Ici : `ecran-campagne.js`, la grille des `carte-jeu` (option `evenement: true`) : le cachet
en `<span>` dans le bouton ; la lueur sur un `::after` dont seule l'opacité est animée (compositeur, pas de
`box-shadow` animé) ; le « déjà frappé aujourd'hui » gardé dans une variable du module, schéma de sauvegarde inchangé.
Coût nul ; 0,25 j. Réglage : Animations pour le cachet frappé et la lueur ; cachet et ruban restent visibles sans
animations.

**L'alerte.** `pc/08-campagne-alerte.png`, `pc/seq-08-campagne-alerte-pulsation/` : l'encadré rouge pulse par son
`box-shadow` (repeint à chaque image : petit, donc bon marché, 16,7 ms mesurés). Visuellement juste. Bien : la
bannière du lion penche légèrement (rotate ± 3°, 2,2 s) et le domaine sur la carte a son halo rouge qui bat (déjà
fait). Ici : remplacer la pulsation de `box-shadow` par l'opacité d'un pseudo-élément (compositeur) par propreté.

**La conquête.** `pc/seq-09-campagne-conquete/` : après la prise d'une province, rien : la carte est redessinée
(cuir nu à 298 ms), le bourg a changé de camp, la brume a reculé d'un lieu (`pc/07b-campagne-apres-conquete-gue.png`
puis `09-campagne-conquete-apres.png`). C'est le moment le plus important de la campagne et il passe inaperçu.
Bien : à l'arrivée sur la carte après une victoire, 1,2 s de cérémonie : la bannière adverse tombe (rotate 70°,
opacity 0, 400 ms), le bourg adverse se fond dans le bourg de France (deux `<image>` superposées, 500 ms), un anneau
d'or s'élargit et s'efface autour du lieu, les nappes de brume du lieu suivant se dissipent (opacity .7 → 0, 600 ms,
légère montée) et son nom apparaît, un éclat d'or et le son `sceau`. Puis une ligne dans la chronique. Ici :
`JEU.campagne.apresBataille` note déjà la province prise ; ajouter `c.derniereConquete = id` (schéma de sauvegarde
inchangé : champ facultatif), et dans `ui.ecrans.jouer` jouer la cérémonie une fois puis l'effacer. Sans animations :
affichage direct. Coût : ponctuel, compositeur ; 1 j.

**Les cartes de jeu, l'arsenal, la fiche.** `pc/06b-campagne-survol-carte.png` : la carte se soulève de 4 px avec
une ombre plus longue, bien. `tablette/06d-campagne-carte-enfoncee.png` : enfoncée de 2 px, le doigt la cache :
trop faible (voir 3.13). `pc/10-arsenal.png` : liste à lignes pointillées et boutons « Débloquer · 10 », un tableau
de boutique web ; bien : chaque arme sur une petite carte de parchemin avec son sprite rendu (les tours et troupes
sont déjà rendues en 3D pour la bataille : `JEU.SPRITES`), ses losanges de niveau en sceaux, et un éclat d'or sur la
ligne achetée. `pc/11-fiche-perso.png` : sobre et juste ; entrée de fenêtre de 3.2 suffira.

### 3.6 L'interface des questions

**Apparition.** `pc/12-evenement-question.png`, `pc/seq-12-evenement-ouverture/` : l'en-tête de l'événement, le
bandeau sombre du conseiller, la carte de la question en 180 ms de fondu. Propre. Les réponses arrivent toutes en
même temps ; bien : un décalage de 40 ms entre les réponses (quatre au plus), `apparition` avec `animation-delay`,
sans toucher à `JEU.mesure` (la question est déjà peinte).

**Bonne réponse.** `pc/seq-13-evenement-bonne-reponse/f02-0050ms.png` puis `f04-0183ms.png` : à 50 ms la question
suivante est déjà là (en fondu), le compteur du bandeau a déjà changé, et un médaillon de 18 px s'envole depuis le
centre de la carte ; à 380 ms le médaillon rebondit. On ne sait pas quelle réponse était la bonne, et l'effet est
trop petit pour être vu à 1366 px. Bien : un sceau « Juste » qui s'imprime sur la réponse choisie (pas au centre de
l'écran), des pièces d'or qui en jaillissent et filent vers le médaillon, le médaillon qui rebondit ; la question
suivante arrive en même temps, dessous. Ici : dans `ui.poserQuestion`, `repondre()` relève le rectangle du bouton
choisi avant d'appeler `fini` ; `JEU.anim` pose, une image après (`apresImage`, comme le tampon), un sceau fixe à
cet endroit (petit sceau de 64 px, image rendue `sceau-reussie.png` déjà dans les assets des expéditions, 350 ms,
`sceau-pose`), et `gain()` part de ce point avec une pièce plus grosse (1,6 rem) et 6 éclats d'or en traîne. Rien ne
retarde la question suivante : tout est posé après la première image. Coût : nul (une petite toile de particules,
déjà bornée par `ETENDUE`) ; 0,5 j. Réglage : Animations (déjà respecté par `JEU.anim.actif()`).

**Mauvaise réponse.** `pc/seq-14-evenement-mauvaise-reponse/f04-0090ms.png`, `pc/14-evenement-panneau-erreur.png`,
`tablette/14-evenement-panneau-erreur.png`, `pc/20-conseil-panneau-erreur.png` : la question disparaît, une boîte
rose pâle à bordure brique apparaît en fondu : « Pas tout à fait. », la bonne réponse, l'explication, trois boutons.
C'est une boîte de validation de formulaire, et l'élève ne voit plus ce qu'il avait choisi. Bien : la réponse choisie
rougit et tremble (secousse existante, 300 ms), la bonne réponse se révèle en vert-or avec un petit sceau, puis le
panneau d'explication se déplie **sous** la question gardée (ou glisse sur elle en la laissant visible 400 ms), sur
un parchemin taché d'encre rouge plutôt qu'une boîte rose : filet brique, lettrine « P » rouge, cachet « À revoir »
dans le coin. Ici : `ui.panneauErreur(q, zone, suite)` vide `zone` ; proposer un mode « réponse montrée » où la carte
`.question` reste (boutons désactivés, classes `.choisie-fausse` et `.bonne` posées par `poserQuestion` qui garde
les boutons sous la main), puis `.panneau-erreur` ajouté dessous avec `apparition`. En bataille la colonne est
étroite et collante : y garder seulement l'en-tête de la question et les deux réponses concernées (le reste masqué),
ou garder le remplacement actuel. Coût nul ; 0,5 à 1 j à cause de la bataille. Réglage : Animations pour la secousse,
rien pour la mise en page.

**Seconde chance.** `pc/15-conseil-seconde-chance.png` : une pastille dorée « SECONDE CHANCE » sur la carte, bien.
Bien aussi : la carte qui revient arrive de dessous la pile (translateY 30 px → 0, retard 0) et la pastille
s'imprime 200 ms après (échelle 1,4 → 1). Coût nul ; 0,1 j. Même chose pour le bandeau `.recit.seconde-chance` des
événements et de la route.

**Bilan d'un événement.** `pc/16-evenement-bilan.png` : titre, « 2 / 3 », une phrase, un bouton. Bien : le score qui
compte (0 → 2 en 400 ms), un sceau d'or si tout est juste, les ressources gagnées listées avec leurs médaillons et
un éclat sur chacun. Coût nul ; 0,25 j.

### 3.7 Le conseil du royaume

- **Vu.** `pc/17-conseil.png`, `tablette/17-conseil.png` : belle carte. Ouverture : retournement 3D 300 ms
  (`pc/seq-17-conseil-ouverture/f09-0332ms.png`), convaincant. Glissement à la souris : la carte penche, le cachet
  « JE LE CROIS » apparaît (`pc/seq-18-conseil-glisse/f08-0413ms.png`) ; au doigt aussi (`tablette/seq-18`). Bonne
  réponse (`pc/seq-19-conseil-bonne-reponse/`) : la carte file à droite, le sceau rouge « Sage décision » s'imprime
  au centre, la jauge Trésor s'allume (`monte`), la carte suivante se retourne : tout en même temps, et le sceau
  (vecteur plat, texte blanc) se pose **sur le texte de la carte suivante** (f04-0305ms, f06-0443ms), ce qui brouille
  les deux. Décision (`pc/21-conseil-decision.png`) : carte d'or sobre, deux boutons. Bilan (`pc/22-conseil-bilan.png`,
  `pc/seq-22-conseil-bilan/f10-1047ms.png`) : « Un conseil avisé ! », le chroniqueur, et une gerbe de « feuilles » qui
  sont des rectangles de couleur : des confettis, pas des feuilles.
- **Bien.** Le sceau s'imprime là où la carte est partie (à droite, à 72 % de la largeur) ou la carte suivante
  attend 150 ms à opacité 0,3 le temps que le sceau soit au plus fort ; le sceau est la cire rendue en 3D
  (`sceau-reussie.png`) avec le mot gravé, pas un pictogramme ; les feuilles ont une forme de feuille (chemin SVG
  ou trois petites PNG) et tournent. Au glissement, la carte suit le doigt avec une légère élévation (ombre qui
  grandit).
- **Ici.** `ui.tampon` : paramètre de position (`x` en %), et `.tampon` qui utilise l'image rendue ; `conseil.js`,
  `conclure()` : poser `tampon("Sage décision", …, { x: 72 })`. `anim.js`, genre `feuilles` : dessiner un `quadraticCurveTo`
  au lieu de `fillRect`. Coût nul ; 0,25 j.
- **Réglage.** Animations.

### 3.8 Cours

- **Vu.** `pc/23-cours.png`, `tablette/23-cours.png`, `pc/23c-cours-onglet-autre.png` : onglets rectangulaires à
  liseré de couleur, puis une longue liste de lignes à pointillés, les lignes « Dans la brume » en gris flou. Le
  changement d'onglet est sec. Lisible, mais c'est un tableau web.
- **Bien.** Des onglets en signets de parchemin (languette à encoche, médaillon de la matière), des blocs de semaine
  en chapitres (lettrine « S4 »), les cours acquis avec un petit sceau vert-or, à revoir avec un cachet brique, dans
  la brume avec la nappe de brume en filigrane au lieu du gris ; à l'ouverture, les douze premières lignes arrivent
  en cascade (18 ms d'écart), les suivantes d'un coup.
- **Ici.** CSS seulement pour l'habillage ; `interface.js`, `ui.ecrans.cours` : variable `--i` sur les douze
  premières `.ligne-cours` et `animation: apparition .2s both; animation-delay: calc(var(--i) * 18ms)`.
- **Coût.** Nul ; 0,5 j (partagé avec Codex et réglages, voir 5).
- **Réglage.** Animations pour la cascade.

### 3.9 Codex et fiches

- **Vu.** `pc/24-codex.png` : un bandeau de tapisserie, puis des barres d'accordéon à liseré de couleur
  (« Histoire · 73 fiches »), dépli sec. `pc/24b-codex-ouvert.png` : des vignettes rectangulaires. `pc/25-fiche.png` :
  la fiche elle-même est bien (lettrine, « À retenir », mots clés, schéma redessiné).
- **Bien.** Chaque matière comme un tome relié (dos de cuir de la couleur de la matière, titre doré, nombre de
  fiches en pied) ; les vignettes comme des signets ; le dépli en 200 ms (hauteur mesurée puis `transform`), la fiche
  qui s'ouvre comme une page (rotateY léger depuis la vignette).
- **Ici.** CSS ; `codex.js` ne change pas de structure.
- **Coût.** Nul ; 0,5 j.

### 3.10 Réglages

- **Vu.** `pc/26-reglages.png`, `pc/26-reglages-entiere.png` : champ texte, boutons, cases à cocher natives, champs
  de date natifs avec icône de calendrier. Un formulaire.
- **Bien.** Les cases en petits sceaux de cire (vide : cercle gravé ; coché : cire rouge avec le lys), le champ du nom
  en cartouche, les champs de date encadrés de parchemin (le sélecteur natif reste : il est pratique sur tablette),
  les cartouches rangés en deux colonnes sur PC.
- **Ici.** `input[type=checkbox] { appearance: none }` et `::before`, le reste en CSS. La tablette impose déjà
  44 px de haut : à garder.
- **Coût.** Nul ; 0,25 j.

### 3.11 Toast et chroniqueur

- **Vu.** `pc/seq-27-toast/` : le toast monte du bas en 200 ms, sobre. `pc/28-chroniqueur.png`,
  `pc/seq-28-chroniqueur/` : le chroniqueur glisse en bas à gauche, le portrait respire. Bien tous les deux.
- **Bien.** Le toast en bandelette de parchemin avec un petit sceau à gauche selon le genre (or : gain ; brique :
  attention) ; le chroniqueur qui entre avec une légère rotation (−3° → 0) et sa bulle qui apparaît 100 ms après
  lui.
- **Coût.** Nul ; 0,1 j. Priorité basse.

### 3.12 Expéditions

**Départ et Armorial.** `pc/30-exp-depart.png`, `tablette/30-exp-depart.png`, `pc/31-exp-armorial.png` : le parchemin
de l'année (cases scellées, « Cette semaine », frontière) est l'un des plus beaux éléments du jeu ; les trois
cartouches sont clairs ; le front choisi est bien marqué. L'Armorial : écu rendu, mais la liste des quartiers est un
tableau à boutons « Acheter · 40 » (comme l'arsenal). Bien : les quartiers de l'écu s'allument sur l'écu lui-même au
survol de leur ligne, et l'achat fait briller le quartier (éclat d'or sur l'écu). Coût nul ; 0,25 j.

**Page de semaine et route.** `pc/32-exp-semaine.png` : propre, lettrine, deux colonnes. `pc/33-exp-route.png`,
`tablette/33-exp-route.png` : la route dessinée avec les médaillons rendus, les semaines suivantes sous la brume, le
halo qui bat sur les haltes atteignables (`pc/seq-34-exp-halo/`, 37 images). Bon. Les nappes de brume sont figées ;
même dérive que sur la carte de campagne. Le survol d'une halte éclaircit de 12 % (`pc/34b-exp-survol-halte.png`),
le focus clavier passe le halo au plein (`pc/34c-exp-route-focus.png`) : le focus est meilleur que le survol, à
aligner (survol = halo plein + médaillon soulevé de 2 px).

**La brume de la route.** `pc/33-exp-route.png`, agrandie dans `pc/33z-exp-route-brume-zoom.png` : la brume des
semaines suivantes est un rectangle pâle à bords nets (opacité 0,42), plus étroit que la bande : le médaillon du
« Grand Gardien » en dépasse à droite. Sous chaque nappe rendue, l'ellipse de repli est toujours dessinée : chaque
nuage est posé sur un ovale pâle à bord franc. On voit le dessin au lieu de la brume. Bien : un voile qui s'éteint
vers ses bords, des nappes seules quand l'image est chargée, et la même dérive lente que sur la carte de campagne.
Ici : `ecran-expedition.js`, `nappes()` : ne tracer les `<ellipse>` que si `lieu-brume` manque (`if (!br)`) ; le
`<rect>` de `.brume-bande` sur toute la largeur de la bande, rempli par un `linearGradient` horizontal (0 → 0,42 →
0,42 → 0) défini une fois dans les `<defs>`. Coût nul (image fixe) ; 0,1 j. Réglage : aucun pour le voile, Animations
pour la dérive.

**Le halo et la compagnie.** `pc/36z-exp-halo-avant-apres.png` (à gauche `pc/33-exp-route.png`, à droite
`pc/36c-exp-route-apres-halte.png`) et `pc/seq-36-exp-retour-sceau/f06-0395ms.png` : la compagnie n'a pas de pion sur
la route. Après une halte, les halos quittent Incendie et Escarmouche et réapparaissent d'un coup sur Escarmouche et
Embuscade, dans le fondu de tout l'écran ; seul le trait d'or du chemin pris dit où l'on est. Rien ne glisse. Bien :
un pion de compagnie (petit étendard bleu au lys sur sa hampe, ou le cavalier rendu de la bataille vu de profil) posé
sur la halte courante ; au retour sur la route, il suit le chemin choisi jusqu'à la nouvelle halte (600 ms,
`ease-in-out`), le trait d'or se dore derrière lui (`stroke-dashoffset`, une fois), le sceau tombe à l'arrivée, puis
les halos des haltes atteignables s'allument l'un après l'autre (fondu 200 ms, 60 ms d'écart). Ici : dans le redessin
sur place proposé au point suivant, une `<image class="pion">` qui suit la courbe que `courbe(c)` calcule déjà pour le
chemin « pris » (`<animateMotion>` natif du SVG, ou `getPointAtLength` dans un `requestAnimationFrame` de 600 ms) ;
ordre : pion, sceau, halos. Coût : un seul élément déplacé pendant 600 ms ; nul. 0,25 j. Réglage : Animations (et
`prefers-reduced-motion`) ; sans animations, le pion est posé directement et les halos sont allumés.

**Entrer dans une halte, revenir sur la route : le sceau.** `pc/seq-35-exp-halte-ouverture/` : l'écran passe par le
cuir (184 à 255 ms) avant la fenêtre de l'événement (`pc/35-exp-halte-evenement.png`). Au retour,
`pc/seq-36-exp-retour-sceau/f03-0166ms.png` : cuir nu ; `f06-0395ms.png` : la route réapparaît en fondu **avec le
sceau déjà posé**. L'animation `sceau-pose` (échelle 1,6 → 1 en 320 ms, jeu.css l. 891) existe, mais elle se joue
pendant le fondu de tout l'écran : on ne voit pas la cire tomber. Même chose pour la carte de faveur choisie
(`pc/seq-39-exp-carte-choisie/f02-0201ms.png` : cuir ; `f05-0416ms.png` : route avec le nouveau sceau et le toast
« Faveur tenue »). Bien : la fenêtre de la halte s'ouvre **par-dessus** la route (la route reste visible, assombrie),
se referme, et la cire tombe sur la halte (échelle 1,6 → 1 avec une petite poussière d'or à l'impact, le son `sceau`),
puis le journal de route reçoit sa ligne. Ici : `ecran-expedition.js`, `afficher()` passe par `JEU.ui.afficher("expedition")`
pour tout ; faire que la route soit redessinée sur place quand l'écran est déjà affiché (remplacer le contenu de
`.route-carte` et des cartouches, sans l'entrée d'écran), et poser le sceau une image après (`apresImage`) avec un
`JEU.anim.eclat(x, y, "or", 6)` au point du sceau (coordonnées SVG converties avec `getScreenCTM`). Les fenêtres de
halte (`cadreEcran`) : les monter dans un calque au-dessus de la route conservée (`position: absolute` dans
`#ecran-expedition`, route en `opacity: .35`), entrée `apparition` déjà là, sortie 120 ms. Coût nul ; 0,5 à 1 j.

**La porte : question, puis cartes.** `pc/37-exp-porte-question.png` : la fenêtre cadrée d'or, le ménestrel, la
question : bien. Bonne réponse (`pc/seq-38-exp-porte-bonne-reponse/f02-0216ms.png` puis `f05-0438ms.png`) : la
fenêtre se fond, un toast « Juste ! Trois faveurs au choix. » et les trois cartes apparaissent ensemble.
`pc/38-exp-cartes.png` : cartes nettes, rang en ruban, médaillon rendu. Survol (`pc/38b-exp-carte-survol.png`) :
soulèvement de 4 px, fond plus clair : correct mais sans lumière. Focus clavier (`pc/38d-exp-carte-focus.png`) : un
cerne gris-bleu, le liseré d'une faveur rare. Appui tablette (`tablette/38c-exp-carte-enfoncee.png`) : 2 px. Bien :
les cartes arrivent en éventail, l'une après l'autre (retournement `retourner` déjà écrit, 80 ms d'écart), la carte
survolée ou focalisée s'élève avec une lueur d'or (`box-shadow` statique, pas animé), la carte choisie grandit (1,06)
et brille 200 ms pendant que les deux autres s'effacent vers le bas, puis le médaillon de la faveur apparaît dans
« Ta compagnie » avec un rebond. Ici : `rendreCartes`, classes `.choisie` et `.ecartee`, `--i` sur chaque carte
pour le décalage ; la route redessinée sur place (point précédent). Coût nul ; 0,25 j.

**Marchand, faveurs, lever le camp, bilan.** `pc/40-exp-marchand.png` : l'étal est une liste de lignes avec le prix
à droite ; bien : des lignes en étiquettes de marchandise avec leur icône rendue (sac, plan, cire), le prix dans une
bourse, la ligne achetée qui s'estompe avec un tintement d'or. `pc/41-exp-faveurs.png` : correct. `pc/42-exp-confirmation.png` :
une boîte nue à deux boutons ; le cadre de fenêtre de 3.2 suffit. `pc/42-exp-bilan.png` : « Le camp est levé »,
renommée gagnée ; bien : un sceau de cire frappé en bas (« Expédition accomplie » ou « Camp levé ») après 300 ms, et
le chiffre de renommée qui compte. Coût nul ; 0,25 j.

### 3.13 Survol, focus, toucher

- **Vu.** Souris : `.carte-jeu` monte de 4 px (bien), `.choix` glisse de 3 px avec un cerne or
  (`pc/12b-evenement-survol-choix.png`, correct), `.bouton` éclaircit de 6 % (`pc/26b-reglages-survol-bouton.png`,
  invisible), le menu monte de 1 px, les lieux de la carte éclaircissent de 15 %. Enfoncé : `.bouton:active` descend
  de 2 px (bien). Focus clavier : rectangle `outline` or (`pc/06e-campagne-focus-cible.png`). Tablette : la carte
  s'enfonce de 2 px (`tablette/06d`), la réponse s'éclaircit (`tablette/12c-evenement-choix-enfonce.png`), la carte de
  faveur de 2 px (`tablette/38c`) : sous un doigt, on ne voit rien.
- **Bien.** Un seul langage : ce qui est actif a une lueur d'or (bordure ou halo), ce qui est pressé s'enfonce et
  émet une onde dorée (cercle qui s'élargit de 0 à 1 en 250 ms depuis le point touché, puis s'efface), ce qui a le
  focus porte le même halo que le survol, jamais un rectangle. Les boutons de menu : un trait d'or qui s'étire depuis
  le centre (`transform: scaleX`).
- **Ici.** Règle globale `:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--or-clair), 0 0 12px rgba(226,194,114,.6) }`
  avec `border-radius` hérité ; onde : `::after` en `radial-gradient` positionné au `pointerdown` (variables `--x`,
  `--y` posées par un écouteur global de 10 lignes dans `interface.js`), animée en `transform: scale` et `opacity`
  (compositeur). Sur la tablette, l'onde remplace le survol absent.
- **Coût.** Nul ; 0,5 j pour le tour de tous les boutons.
- **Réglage.** Animations pour l'onde ; le halo de focus reste toujours.

### 3.14 Sans animations

`pc/50-sans-anim-domaine.png`, `pc/50-sans-anim-campagne.png`, `pc/seq-51-sans-anim-conseil/` (6 images en 1,8 s :
rien ne bouge, comme voulu). Le réglage coupe bien tout, y compris les entrées d'écran : les écrans sautent. C'est le
comportement attendu et il doit le rester pour chaque proposition de ce document : toute nouvelle animation vit sous
`body:not(.sans-anim)` ou derrière `JEU.anim.actif()`. Décision à proposer à Romain : un palier intermédiaire
automatique sur tablette (`hover: none`) où l'ambiance continue (nuages, oiseaux, villageois, poussières, bannières)
est coupée mais où les retours de réponse, les transitions et les sceaux restent. Sans ce palier, l'ambiance
proposée en 3.5 devra être mesurée sur la Galaxy Tab A9 avant d'être activée par défaut.

### 3.15 Tablette 1340 × 800

La mise en page tient partout (`tablette/*.png`) : carte entière, route entière, cartes de faveur sur une ligne,
conseil centré, question avec ses quatre réponses visibles. Trois remarques pour la passe tablette en cours : le
menu caché à l'ouverture (3.3) ; les retours d'appui trop faibles (3.13) ; et le coût de l'accueil (3.3), qui est le
seul écran où la tablette ralentie décroche nettement. Les bandes de 3D du domaine (3.4) et l'ambiance de la carte
(3.5) doivent être mesurées avec `mesurer.js` (cible : médiane 16,7 ms, 95e centile sous 34 ms en CPU × 4).

## 4. Règles pour toute animation nouvelle

1. `transform` et `opacity` seulement pour ce qui tourne en continu. Jamais `background-position`, `filter`,
   `box-shadow`, `width`, `top` en boucle. Un `filter` SVG ne se pose jamais sur un groupe animé.
2. Rien dans le chemin réponse → question suivante : la décoration se pose une image après (`JEU.anim.apresImage`),
   comme le tampon et le gain aujourd'hui.
3. Tout passe par `.sans-anim` ou `JEU.anim.actif()`, et respecte `prefers-reduced-motion`.
4. Une boucle d'ambiance s'arrête quand son écran n'est plus affiché (vérifier `JEU.ui.ecranCourant()` comme
   `domaine.js` le fait pour les villageois).
5. Avant d'activer par défaut : `mesurer.js` en CPU × 4, médiane 16,7 ms, 95e centile sous 34 ms, aucune tâche longue.
6. Chaque image rendue garde son repli vectoriel (règle du cahier des expéditions) et sa licence dans CREDITS.md.

## 5. Les dix chantiers, par gain visuel rapporté au coût

| Rang | Chantier | Gain visible | Coût (travail · exécution) | Réglage |
|---|---|---|---|---|
| 1 | **Poussières de l'accueil en `transform`** (3.3) et menu visible à l'ouverture | L'écran d'entrée cesse de saccader sur la tablette (133 → 16,7 ms par image) et sur PC (33 → 16,7) | 0,25 j · gain net | Animations |
| 2 | **Transitions d'écran et de fenêtre sans cuir nu** (3.2) : sortie de l'ancien écran, entrée depuis 0,3, redessin sur place, fenêtres qui entrent et sortent | Toutes les navigations, cent fois par séance ; le jeu cesse d'être « des pages » | 0,5 j · compositeur | Animations |
| 3 | **Bonne réponse avec du poids** (3.6) : sceau de cire sur la réponse choisie, pièces qui filent au médaillon | Chaque bonne réponse hors bataille (événements, portes, marchand, veillée) | 0,5 j · une petite toile 400 ms | Animations |
| 4 | **Mauvaise réponse lisible** (3.6) : réponse choisie qui rougit et tremble, bonne réponse révélée, panneau en parchemin taché sous la question | Chaque erreur, et un vrai gain pédagogique | 0,5 à 1 j · nul | Animations (secousse) |
| 5 | **Expéditions : sceau qui tombe, pion qui avance, cartes en éventail, carte choisie** (3.12) : route redessinée sur place, fenêtres par-dessus la route, pion de compagnie qui suit le chemin, brume de la route sans bords nets | Une animation déjà écrite devient enfin visible ; la progression se lit d'un coup d'œil ; le choix des faveurs prend du relief | 0,75 à 1,25 j · nul | Animations (voile de brume : aucun) |
| 6 | **Missive, toast, tampon, feuilles, événement du jour** (3.5, 3.7, 3.11) : lettre qui se déplie, sceau qui saute, tampon en cire rendue posé à côté de la carte, vraies feuilles, cachet « Aujourd'hui » et ruban de l'événement | Les petits moments de récit gagnent en matière pour presque rien ; l'événement du jour ne passe plus inaperçu sous la carte | 0,75 j · nul | Animations |
| 7 | **Carte de campagne vivante** (3.5) : bannières rendues en quatre vues, fumées, eau, brume qui dérive, oiseaux, lumière du jour | L'écran central respire comme une carte de campagne ; direction Total War tenue | 1 à 1,5 j · ≈ 2 ms par image à vérifier | Animations (lumière : aucun) |
| 8 | **Cérémonie de conquête** (3.5) : bannière qui tombe, bourg qui change, brume qui se lève, anneau d'or | Le moment le plus important de la campagne devient un moment | 1 j · ponctuel | Animations |
| 9 | **Listes, boutique, réglages, survol et toucher habillés** (3.5 arsenal, 3.8, 3.9, 3.10, 3.13) : signets, tomes, sceaux pour les cases, cascade d'entrée, halo de focus, onde dorée au toucher | Plus rien n'a l'air d'un formulaire ; la tablette a enfin un retour sous le doigt | 1,5 j · nul | Animations (cascade, onde) |
| 10 | **Plan du domaine enluminé** (3.4) : parcelles, fondations et bâtiments rendus en 3D, brume en nappes, seigneur en bande de cavalier, plus de flou SVG | Le seul écran hors direction artistique rejoint la carte ; et le domaine coûte moins qu'aujourd'hui | 2 à 3 j · gain net | Animations pour la vie, rien pour les images |

Lots suggérés : 1 à 4 dans le lot « finitions et performance » (une à deux journées, visible partout) ; 5 à 8 dans
le lot « carte et écrans vivants » ; 9 et 10 ensuite. Les points 1, 2 et 5 se mesurent avec les outils de
`atelier/captures/audit-graphismes/` avant et après.

## 6. Fichiers

- Ce document : `atelier/conception/audit-graphismes-ecrans.md`.
- Outils : `atelier/captures/audit-graphismes/capturer.js`, `…/mesurer.js`.
- Captures : `atelier/captures/audit-graphismes/pc/` (101 fixes et séquences), `…/tablette/` ; journaux
  `journal-pc.json`, `journal-tablette.json` ; mesures `mesures.json`.
- Index des captures les plus parlantes : `pc/seq-02-transition-accueil-domaine/f08-0393ms.png` (cuir nu),
  `pc/seq-13-evenement-bonne-reponse/f02-0050ms.png` (réponse sans poids), `pc/14-evenement-panneau-erreur.png`
  (boîte rose), `pc/seq-19-conseil-bonne-reponse/f04-0305ms.png` (sceau sur la carte suivante),
  `pc/seq-36-exp-retour-sceau/f03-0166ms.png` et `f06-0395ms.png` (sceau masqué par le fondu), `pc/03-domaine.png`
  (plan en schéma), `pc/04-campagne.png` (carte immobile), `pc/seq-22-conseil-bilan/f10-1047ms.png` (confettis),
  `tablette/06d-campagne-carte-enfoncee.png` et `tablette/38c-exp-carte-enfoncee.png` (appui invisible),
  `pc/33z-exp-route-brume-zoom.png` (brume de la route à bords nets), `pc/36z-exp-halo-avant-apres.png` (halo qui
  saute, pas de pion), `pc/04-campagne-entiere.png` (événement du jour sous la carte).
- Deux remarques de lecture. Les séquences du profil pc rejouées après l'interruption (chargement, conseil, début des
  expéditions) gardent les images des deux passages : deux images peuvent porter le même numéro, l'horodatage en ms
  les distingue. Sur les captures « page entière », le cuir s'arrête à la hauteur de la fenêtre : c'est un effet de
  la capture (le cuir est sur un calque fixe), pas un défaut du jeu.
