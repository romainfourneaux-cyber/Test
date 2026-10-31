# Audit graphique du champ de bataille en mouvement (31/10/2026)

Demande de Romain du 31/10/2026 : « Améliore les graphismes et les animations ». Ce document est le volet « champ de
bataille » de l'audit (le volet « écrans » est dans audit-graphismes-ecrans.md). Il regarde la bataille **en
mouvement** : marche, mêlée, tirs, impacts, chutes, corps, champion, brèches, construction, fins de bataille, bandeau
d'or, ambiance. Rien n'a été modifié dans jeu/ : ce volet regarde, mesure et propose.

Version regardée : 0.9.2, pendant la passe tablette (d'autres agents modifient jeu/ en même temps : les numéros de
lignes cités peuvent bouger, les noms de fonctions non). Rien de ce qui est proposé ne touche bataille-moteur.js : tout
se fait dans le dessin (bataille.js), la feuille de style, ou de nouvelles images rendues dans Blender.

Lecture rapide : la section 1 dit l'essentiel, la section 5 donne les dix améliorations classées par gain visuel
rapporté au coût. La section 3 détaille chaque constat avec les images qui le montrent.

## 1. L'essentiel

Ce qui tient déjà bien : le terrain rendu en 3D, les places fortes et les tours, les bataillons en rangs qui prennent
les virages, les bannières héraldiques lisibles, les figurines qui tombent une à une, les giclées et les flaques, les
fumées animées des places abîmées, les ombres de nuages. À l'arrêt, une capture fait « Total War ». **En mouvement,
le champ paraît figé et sans poids.** Six défauts comptent plus que tout le reste.

1. **Rien ne réagit aux coups.** Une pierre de trébuchet tombe sur une troupe : une bouffée pâle, des éclats en
   petits cubes clairs, et la troupe continue sa route sans broncher. Des cavaliers frappent la porte du rival : ils
   deviennent transparents devant elle, un peu de poussière, et le château ne bouge pas. Aucune secousse, aucun éclair,
   aucun cratère, aucune pierre qui tombe d'un mur. La victoire et la défaite se jouent en une image : la place forte
   passe d'« abîmée » à « ruine » d'un coup.
2. **Les tours sont des images fixes.** Le trébuchet ne bascule jamais son bras : la pierre apparaît en l'air
   au-dessus de lui, et la boule dessinée au bout de la verge y reste après le tir. La baliste ne se détend pas, les
   archers ne bandent pas, les piques de la palissade ne frappent pas. Or les tours sont les unités du joueur.
3. **La mêlée n'a pas de geste.** Les figurines n'ont qu'une bande de 4 images de marche. En mêlée, elles marchent sur
   place (la bande défile à 1,8 image par seconde) et glissent de 1,5 à 3,2 px vers l'avant pour « se fendre ». On ne
   voit jamais une épée se lever. Le choc est marqué par une grande étoile blanche à quatre branches, qui fait éclat de
   dessin animé.
4. **Les morts ne tombent pas, ils pivotent.** Un soldat tué est son image de marche tournée d'un quart de tour,
   aplatie et assombrie. Couché, il se lit comme un bâton gris pâle, souvent sous un voile de poussière. Sur un pont
   encombré, la mêlée devient une bouillie rouge et brune où l'on ne distingue plus les vivants des morts.
5. **Le pas patine.** La bande de marche fait un cycle complet pour 30 px parcourus ; un homme de cette taille
   (environ 19 px) en ferait un pour 15 px. Les pieds glissent deux fois trop vite. Et comme il n'y a que deux sens
   (droite et gauche retournée), une troupe qui monte ou descend l'écran marche en crabe, de profil.
6. **Le budget de la tablette est déjà dépassé en grosse mêlée.** La boucle de bataille coûte 2,1 ms en médiane sur PC,
   mais 6,9 ms (95 % sous 15,2 ms) avec le processeur ralenti 4 ×, qui approche la Galaxy Tab A9 : 30 images par
   seconde au lieu de 60. Les corps et le sang en sont la plus grosse part (4,5 ms sang coupé). Toute animation nouvelle
   doit donc être payée par une économie, et la plus grosse est à portée : poser les corps et le sang dans une couche
   de sol au lieu de les redessiner à chaque image (amélioration 3).

La bonne nouvelle : la chaîne Blender sait déjà rendre presque tout ce qui manque. pose_homme (figurines.py) prend les
angles des bras et l'ampleur du pas, soldat() prend le lacet (le sens), trebuchet() prend l'angle de la verge, baliste()
l'ouverture des bras, et unites.py rend une bande d'images par phase. Il manque surtout des boucles de rendu et
quelques lignes de dessin.

## 2. Méthode, captures et chiffres

### 2.1 Les deux passes de capture

Chromium (Playwright), 1366 × 768, vitesse × 1, horloge truquée (page.clock) : chaque image est prise à pas fixe de
temps de jeu, sans dépendre de la vitesse de la machine. Le relevé du moteur (troupes, projectiles, effets, figurines
dessinées) est gardé pour chaque image dans releves.json.

- **Passe 1** (atelier/captures/audit-graphismes/bataille/capturer-bataille.js, images dans brut/, en .jpg) : netteté 1,
  champ entier (821 × 542 px à l'écran, 0,82 px par px logique), une bataille d'attaque (Forteresse anglaise, dernière
  vague, tours d'archers niveau 3, baliste niveau 2, trébuchet, palissade, 6 envois) et une défense (domaine, assaut
  de niveau 3, archers, trébuchet, baliste). Séquences de 10 à 30 images, toutes les 50 à 400 ms. Planches dans
  planches/ (planches.py) : « ensemble » (une image sur deux) et « loupe » (fenêtre de 200 × 130 px logiques grossie
  3 ×, centrée sur l'action).
- **Passe 2** (capturer-bataille-2.js, images dans brut2/, en .jpg) : **netteté 2** (deviceScaleFactor 2, toile à
  1,64 px par px logique, comme un écran haute densité), gros plans de 220 × 145 px logiques (361 × 238 px), toutes les
  40 à 100 ms. Elle ajoute ce qui manquait ou ne se jugeait pas à la netteté 1 : le pas, la mêlée de près (attaque et
  défense), la chute, le champion, la **brèche sur les murs du rival** (absente de la passe 1), les tirs des tours de
  près, l'impact d'une pierre de près, la mêlée sans animations, et une **vraie victoire** (le château du rival tombe
  pendant la vague). Planches : planches/gros-<séquence>-N.png (planches2.py, toutes les images, à leur taille) et
  planches/loupe2-*.png (loupe2.py : 56 à 70 px logiques autour d'une troupe suivie, grossis 4 à 5 ×).

Deux défauts de la passe 1, corrigés par la passe 2 :
- a-victoire n'est **pas** une victoire : la vague était déjà finie (phase « fin », bilan « Les Anglais tiennent
  encore »), et la solidité du rival a été mise à zéro après coup. La vraie victoire est hv-victoire.
- a-fumee, a-sans-anim et a-sans-sang ont été prises après la fin de la vague : il n'y a plus de troupes. La mêlée
  sans animations est h-sans-anim ; le sang coupé est jugé à la lecture du code (3.13).
- Les animations CSS (sceau, or qui rougit) tournent en temps réel et non sur l'horloge truquée : leur durée dans les
  séquences hud-* n'est pas fiable, seul leur aspect l'est.

Nommage des images : brut/<séquence>-NN.jpg et brut2/<séquence>-NN.jpg, NN = numéro d'image dans la séquence (le temps
de jeu de chaque image est dans releves.json et sur les planches).

### 2.2 Ce que le dessin sait faire aujourd'hui (bataille.js, sprites.js)

- **Troupes** : une seule bande par troupe et par camp, **4 images de marche** (unite-*-*.png, 40 × 40 px logiques,
  48 × 48 pour le champion, 56 × 64 pour la tour de siège, dont les 4 images sont presque identiques). Pas d'image
  d'attaque, pas d'image de chute, pas d'image de face ni de dos. Une figurine de bataillon est réduite à 0,56-0,64 ×
  (environ 19 px logiques de haut, donc 16 px à l'écran sur PC à netteté 1, 10 à 14 px sur la tablette selon sa densité).
- **Choix de l'image de marche** : bat.pasV avance de min(déplacement, 4) / 9 par image, l'image vaut
  floor(pasV × 1,2 + phase) modulo 4 : un cycle de 4 images pour 30 px. En mêlée, pasV avance de 1,5 par seconde
  (marche sur place). Aucune interpolation entre images (les positions, elles, sont continues).
- **Mêlée** : « fente » = glissement de la figurine de 1,5 à 3,2 px vers l'avant (majBataillon) ; éclat blanc
  eclatLumiere() (24 px au choc, 18 px quand un trait touche, 14 px pour un coup sans sang).
- **Chute** : poseCouchee() tourne la vue de marche d'un quart de tour, l'aplatit à 0,55 et l'assombrit ; bascule en
  0,2 s ; flaque de 16 × 8 px ; 5 gouttes de 0,7 à 1,6 px, trois rouges ; corps gardés 6 s (CORPS_MAX 150), redessinés
  à chaque image (deux drawImage par corps).
- **Tours et places fortes** : une image fixe chacune (bannières et braises cuites dans l'image). Les projectiles
  partent de 42 px au-dessus du pied de la tour, quel que soit l'engin.
- **Projectiles** : flèche 24 × 6 px, carreau 32 × 8 px, pierre 14 × 14 px, une image chacun, tournés selon la
  trajectoire, cloche de 18 px (flèche), 5 px (carreau), 70 px (pierre, avec son ombre au sol). Pas de traînée.
- **Effets** : effet-poussiere (5 images), effet-eclats (4 images), dessinés **après** toutes les troupes, donc
  par-dessus elles.
- **Ambiance** : 3 ombres de nuages, fumées des places abîmées (7 bouffées par foyer), pluie (120 traits), brouillard
  (un dégradé fixe sur la moitié droite, x ≥ 520).
- **Réglage Animations** (JEU.anim.actif, aussi coupé par prefers-reduced-motion) : coupe les nuages, la pluie, les
  ondes (une seule, immobile), les fumées (une bouffée fixe), l'ondulation des bannières, les gestes de mêlée, le
  balancement, le glissement des rangs, la bascule des corps, les giclées, la pulsation du curseur, les gerbes de
  particules (anim.js) et les animations CSS. Il laisse la marche (la bande défile toujours) et les projectiles.
- **Réglage Sang** (JEU.anim.sang) : coupé, ni giclée ni flaque ; les figurines tombées s'effacent en 1,4 s dans un peu
  de poussière.

### 2.3 Mesures (budget)

Boucle de bataille (moteur et dessin, fonction « boucle ») en grosse mêlée, Forteresse anglaise, 4 tours, 14 envois,
5 s par mesure (mesures-boucle.json, mesure-boucle.js) :

| Profil | Images (médiane) | Boucle médiane | Boucle 95 % | Figurines | Corps |
|---|---|---|---|---|---|
| PC | 16,7 ms | 2,1 ms | 3,1 ms | 199 | 73 |
| Ralenti 4 × | 33,3 ms | **6,9 ms** | 15,2 ms | 138 | 75 |
| Ralenti 4 ×, Animations coupées | 16,7 ms | 5,8 ms | 11,3 ms | 116 | 45 |
| Ralenti 4 ×, Sang coupé | 16,7 ms | 4,5 ms | 9,7 ms | 97 | 22 |

Le budget demandé est de 4 ms en médiane. Sur PC il reste 1,9 ms. Sur la tablette approchée, il manque déjà 3 ms en
grosse mêlée (le ralenti 4 × n'est qu'une approximation : à confirmer sur la Galaxy Tab A9, dont la toile est dessinée
par le processeur graphique, ce qui allège les drawImage mais pas le JavaScript).

Coût unitaire de quelques opérations de dessin (mesures-couts.json, mesure-couts.js : toile de 821 × 542 px, rendu
logiciel forcé, donc une borne haute) :

| Opération | PC | Ralenti 4 × |
|---|---|---|
| Fond plein écran (drawImage 1000 × 660) | 0,36 ms | 1,74 ms |
| Voile plein écran (fillRect translucide) | 0,42 ms | 3,54 ms |
| Dégradé radial plein écran recalculé | 5,6 ms | 20,6 ms |
| Lueur 32 × 32 en mode « lighter » | 0,020 ms | 0,110 ms |
| Lueur 32 × 32 normale | 0,008 ms | 0,056 ms |
| Particule (fillRect 2 × 2) | 0,002 ms | 0,006 ms |
| Traînée (trait de 12 px) | 0,003 ms | 0,015 ms |
| Décalque posé dans une couche hors écran | 0,004 ms | 0,035 ms |

Conséquences : jamais de dégradé ni de voile plein écran dans la boucle (une secousse ou un éclair passent par la
feuille de style, sur la toile entière, sans rien coûter à la boucle) ; au plus une dizaine de lueurs à la fois ; une
centaine de particules et une vingtaine de traînées tiennent dans 0,5 ms au ralenti 4 × ; un décalque posé une fois
dans une couche de sol ne coûte presque rien.

## 3. Revue en mouvement

Pour chaque constat : ce qu'on voit (images), ce qu'il faudrait, comment le faire ici, ce que ça coûte, et les
réglages à respecter. Chemins relatifs à atelier/captures/audit-graphismes/bataille/.

### 3.1 La marche

**Ce qu'on voit.**
- Pieds qui patinent : dans h-marche, la troupe de tête monte de y 355 à y 255 en 2,32 s (44 px/s) pendant que sa
  bande avance de 13,6 images, soit un cycle de 4 images pour 29 px (relevé pasV dans brut2/releves.json). Pour une
  figurine de 19 px, un cycle devrait couvrir 15 px environ. Images brut2/h-marche-00 à 29, planche
  planches/loupe2-h-marche-J-fantassins-1.png.
- Marche en crabe : sur la même planche, le bataillon monte l'écran mais ses hommes regardent à droite, de profil
  (h-marche-00 à 22). Les cartes ont toutes des tronçons en S presque verticaux : c'est fréquent.
- 4 images par cycle : à cette taille, le pas se lit (jambes sombres qui alternent, loupe2-h-champion-R-champion-1.png),
  mais saccadé de près.
- Ombres parfois décollées des pieds (à vérifier) : sur loupe2-h-champion-R-champion-1.png (h-champion-00, 08, 16),
  l'ombre ovale des gardes est 2 à 3 px logiques sous les pieds, la figurine semble flotter.
- Les bannières de bataillon ondulent de ± 0,6 px à 5 images par seconde : immobiles à l'œil (loupe2-h-marche).

**Ce qu'il faudrait.** Un pas qui « accroche » le sol, 8 images, et des hommes qui regardent où ils vont (au moins
trois sens : de profil, de dos en montant, de face en descendant, plus leurs miroirs).

**Comment.**
- Cadence : dans majBataillon, une cadence par genre de figurine au lieu du « / 9 » commun : environ / 4,5 pour les
  piétons (cycle de 15 px), garder / 9 pour les cavaliers (cycle de 30 px, juste pour un cheval à cette échelle). Une
  ligne. Avec 4 images, chaque image dure alors 85 ms à 44 px/s : plus vif mais juste.
- 8 images : unites.py, IMAGES = 8 (la phase est déjà 2πk/IMAGES), 11 bandes, soit 44 rendus de plus. Images de
  80 × 80 rendues à 160 × 160, 64 échantillons : environ 5 à 8 s par image avec la reconstruction de la scène
  (estimation : le module de rendu Blender n'est pas installé dans ce conteneur ; à mesurer d'abord avec
  `unites.py unite-fantassins-france --images 1 --dossier <essai>`), soit 5 à 6 minutes.
- Trois sens : soldat() et cavalier() prennent déjà le lacet (−22° et −35° aujourd'hui). Deux bandes de plus par
  troupe (« -dos » vers 70° et « -face » vers −110°), 8 images chacune : 176 rendus, 15 à 25 minutes. Dans le dessin :
  vueFigure reçoit le sens choisi d'après la tangente de la route (pointTmp.tx, ty déjà calculés), avec la même marge
  que pour le miroir ; la clé de la vue gardée prend le sens. Repli : la bande de profil si l'autre manque.
- Bannières : amplitude ± 1,4 px et 6 vues à 8 images par seconde dans banniere() (vues gardées : rien de plus à chaque
  image).
- Ombres : relever sur la bande où sont les pieds d'appui (contrôle dans unites.py), recaler OMBRES.pied si besoin.

**Coût.** Cadence et bannières : 0 ms. 8 images et trois sens : 0 ms par image (une autre vue gardée, même drawImage),
mémoire des vues gardées multipliée par 2 à 6 (quelques Mo au plus à netteté 2).
**Réglages.** Aucun : la marche n'est pas de l'ambiance. Animations coupées : bannières immobiles, comme aujourd'hui.

### 3.2 La mêlée

**Ce qu'on voit.**
- Pas de geste : loupe2-hd-melee-462_392-1.png (défense, tes fantassins contre des cavaliers anglais, hd-melee-00 à
  22) et loupe2-h-melee-580_432-1.png (h-melee-00 à 11) : le premier rang ne lève jamais son arme ; les figurines
  marchent sur place et glissent d'un ou deux pixels.
- Un bloc : sur planches/loupe-a-melee-2.png (a-melee-12 à 19) les cavaliers bleus avalent la piétaille en une
  seconde ; sur planches/loupe-a-chute-1.png et loupe-a-efface-1.png (pont, a-chute-00 à 11, a-efface-00 à 15) la
  colonne bloquée devient une masse rouge et brune où vivants et morts se confondent.
- Étoile blanche : grande croix lumineuse de 24 px au choc (hd-melee-00, a-chute-07, a-efface-00), 18 px quand un trait
  touche (h-chute-00 à 02, ht-impact-07 à 09). Elle cache le premier rang et sort du style (éclat de dessin animé).
- Voile de poussière : la poussière de charge, de chute ou d'impact est dessinée après les troupes, donc par-dessus :
  les cavaliers deviennent translucides et délavés (h-melee-00 à 02 et 10 à 11, hd-melee-06 à 12).
- Le sang se voit : gouttes qui partent du côté du coup (h-melee-01 à 04, hd-melee-18 à 22). Mais toutes les gouttes
  ont la même forme ronde, les mêmes trois rouges, la même gerbe à chaque coup.

**Ce qu'il faudrait.** Le premier rang qui arme, frappe et revient, chacun à son rythme ; l'homme touché qui recule
d'un pixel ; quelques étincelles de métal au lieu de l'étoile ; une poussière qui reste aux pieds ; des gerbes de sang
variées (une ou deux grosses gouttes, une brume de fines, des taches qui restent au sol).

**Comment.**
- Bande d'attaque par troupe : pose_homme(phase, bras_droit=(épaule, coude), …) suffit pour armer (épaule 130°, coude
  40°), frapper (épaule 20°, coude 5°) et revenir. 4 images par troupe à pied, 4 pour les cavaliers (lance couchée puis
  poussée, cheval qui se cabre un peu), 4 pour le champion : 10 bandes, 40 rendus, environ 5 minutes. Nouvelle entrée
  « unite-<type>-<camp>-coup » dans sprites.js, la bande de marche ne change pas.
- Dans majBataillon, pour le premier rang au contact, remplacer la fente par l'image d'attaque choisie sur
  (t − u.frappe − fg.delai) / 0,35 s, comme la fente aujourd'hui ; le second rang garde la marche sur place, au pas
  ralenti. Repli : la fente actuelle si la bande manque.
- Recul : quand un coup tombe (effet « coup », cible déjà trouvée par cibleDuCoup : e.gx, e.gy), décaler la figurine
  touchée de 1 px vers l'arrière pendant 80 ms et l'assombrir d'un cran (vue sombre() déjà gardée).
- Étincelles : 3 à 5 traits orangés de 2 à 3 px qui s'écartent en 0,15 s à la place d'eclatLumiere pour « coup » et
  « choc » ; pour « touche », un petit éclat de 6 px au plus.
- Poussière : dessiner les effets « choc », « touche », « pique », « chute » et « retrait » dans la passe « sol » (sous
  les figurines) ou les trier avec les volumes à leur y, avec une opacité plus faible.
- Sang : tirer pour chaque gerbe une ou deux gouttes de 2 à 2,5 px et le reste en brume de 0,5 px ; ajouter un rouge
  brun (#4a0606) pour les gouttes posées ; poser les taches au sol dans la couche de sol (3.5 et amélioration 3).

**Coût.** Bandes d'attaque : 0 ms (même drawImage). Étincelles : 5 traits × 0,015 ms = 0,08 ms par coup au ralenti
4 ×, plafonnées à 8 coups à la fois. Poussière déplacée : 0 ms.
**Réglages.** Animations coupées : pas de geste, pas de recul, pas d'étincelle (un éclat fixe très court, comme
aujourd'hui). Sang coupé : étincelles seules, aucune goutte.

### 3.3 Les tirs des tours

**Ce qu'on voit.**
- Trébuchet figé : planches/gros-ht-trebuchet-1.png (ht-trebuchet-00 à 11) : la pierre apparaît en l'air au-dessus de
  l'engin ; la verge ne bouge pas ; la boule au bout de la verge reste là après le tir ; pas de poussière au pied.
- Tours d'archers et balistes figées : planches/gros-ht-archers-1.png (ht-archers-00 à 11), planches/loupe-a-tirs-tours-1.png
  (a-tirs-00 à 11). Le trait part du haut de la tour sans qu'aucun archer ne bouge. Les drapeaux des tours sont cuits
  dans l'image, immobiles.
- Projectiles trop grands : la flèche fait 24 px logiques, le carreau 32 px, la pierre 14 px, pour des hommes de
  19 px. Une flèche est plus longue qu'un homme, un carreau en fait presque deux : ils se lisent comme des bâtons ou des
  javelots (ht-archers-00 à 02 ; carreau rival dans a-chute-05 à 06 et h-sans-anim-01 à 02 ; pierre dans
  loupe-a-tirs-projectiles-1.png, a-tirs-08 à 10).
- Une flèche à la fois, sans traînée : une tour d'archers niveau 3 tire un trait isolé, comme une baliste.

**Ce qu'il faudrait.** Le trébuchet qui bascule sa verge et lâche la pierre au bout de sa fronde, avec un nuage de
poussière au pied ; la baliste qui détend ses bras d'un coup ; les archers qui bandent et lâchent ; les piquiers qui
poussent leurs piques. Des traits à la bonne taille, partis en petite volée, avec une traînée légère.

**Comment.**
- Blender : tours.py ne rend qu'une image par tour (rendre_tour). Y ajouter une boucle d'images comme unites.py :
  - trébuchet : E.trebuchet(…, bras_angle=…) existe ; 4 images (armé 36 à 40°, mi-course, verge à la verticale,
    lâché vers l'avant), boule retirée de la fronde après le tir ; 3 niveaux ;
  - baliste : baliste(…, arc=…) existe ; 3 images (tendue, détendue, retour) ; 3 niveaux et 2 tours rivales ;
  - archers : archer(…) passe par soldat(rôle « archer ») ; 3 images (bander, tenir, lâcher) en changeant
    bras_droit et bras_gauche ; 3 niveaux et 2 tours rivales ;
  - piquiers : piquier_tour(…, pique=…) ; 3 images (piques poussées vers l'avant) ; 3 niveaux.
  Soit 16 tours, 2 à 3 images nouvelles chacune (l'image actuelle reste celle du repos) : environ 45 rendus. Images de
  140 × 168 rendues à 280 × 336, 64 échantillons : 15 à 25 s chacune (estimation), 12 à 20 minutes. L'ombre portée
  reste la même (une seule par tour). Le manifeste gagne « frames » et un point « tir » ([x, y] du bout de la verge, des
  bras de la baliste, de l'arc) relevé sur la scène 3D comme les foyers « fumees » des places fortes.
- Dans le dessin : aucun changement du moteur. Un projectile neuf (pr.t petit, pas encore marqué) donne son départ
  (pr.x0, pr.y0) : on retrouve la tour à ces coordonnées et on note tr.dernierTir = v.horloge ; l'image de la tour vaut
  vue(v.horloge − tr.dernierTir, durée, frames). Pour la palissade, l'effet « pique » le plus proche fait de même. Le
  projectile part du point « tir » de la tour au lieu de 42 px au-dessus de son pied (le moteur ne change pas, seul le
  dessin de la trajectoire part de là).
- Poussière au pied du trébuchet au lâcher (effet-poussiere existant, échelle 0,8).
- Taille des traits : sprite() accepte déjà une échelle : flèche à 0,5 (12 px), carreau à 0,5 (16 px), pierre à 0,65
  (9 px). Aucune nouvelle image.
- Volée : pour les tours d'archers, dessiner 3 flèches au lieu d'une (décalées de ± 4 px et de 0 à 60 ms), visuel
  seulement : les dégâts restent ceux du moteur.
- Traînée : un trait de 8 à 10 px, couleur crème à 0,35 d'opacité, derrière flèches et carreaux ; un léger nuage de
  poussière qui suit la pierre et la pierre qui tourne sur elle-même (rotation de la sprite selon t).

**Coût.** Images des tours : 0 ms. Volées et traînées : 20 projectiles × 3 traits × 0,015 ms = 0,9 ms au pire au
ralenti 4 × : plafonner à 24 traits dessinés à la fois (au-delà, une flèche par tir). Taille des traits : 0 ms.
**Réglages.** Animations coupées : image de repos des tours, pas de traînée, pas de poussière au lâcher (les traits
volent toujours : c'est le jeu).

### 3.4 Les impacts

**Ce qu'on voit.**
- Pierre de trébuchet : planches/gros-ht-impact-1.png (ht-impact-02 à 11) et planches/loupe-a-impacts-1.png
  (a-impacts-01 à 05) : une bouffée de poussière pâle, presque de la couleur de la route, des éclats en petits cubes
  clairs, un cheval qui tombe ; les cavaliers voisins continuent au même pas. Pas de cratère, pas d'onde, pas de recul,
  pas de secousse. Dans hd-melee-04 à 08, la pierre tombe au milieu de la mêlée et la poussière délave tout le groupe.
- Trait qui touche : l'étoile blanche (3.2) et une bouffée de poussière ; la figurine ne réagit pas.

**Ce qu'il faudrait.** Une pierre qui pèse : un anneau de poussière brune qui s'étale au ras du sol, quelques mottes
de terre qui retombent en cloche, les figurines voisines qui sont repoussées d'un ou deux pixels et vacillent, une
petite secousse (1 px, 120 ms), un cratère sombre qui reste au sol.

**Comment.**
- Anneau au sol : onde() existe déjà (ellipse à plat) ; une onde brune de 10 à 40 px en 0,35 s, dans la passe « sol ».
- Mottes : 6 à 8 particules brun sombre (fillRect 2 × 2) avec gravité, 0,5 s, tirage fixe par effet (comme giclee()).
- Recul : chaque figurine a déjà des décalages propres (fg.ja, fg.jb) ; leur ajouter une poussée qui s'amortit en
  0,3 s pour les figurines à moins de e.rayon (48 px) du point d'impact. Dessin seulement.
- Cratère : un décalque de 18 × 9 px (terre retournée, bord clair, centre sombre) posé dans la couche de sol
  (amélioration 3), qui s'efface avec elle.
- Secousse : voir 3.12.

**Coût.** Anneau 0,02 ms, mottes 8 × 0,006 ms, recul 0 ms (calcul de quelques figurines), cratère 0,035 ms une fois :
moins de 0,1 ms au ralenti 4 × par impact.
**Réglages.** Animations coupées : ni mottes, ni recul, ni secousse ; l'anneau devient une tache fixe ; le cratère
reste (c'est un décor). Sang : sans objet.

### 3.5 Les chutes et les corps

**Ce qu'on voit.**
- Pivot, pas chute : planches/loupe2-h-chute-569_425-1.png (h-chute-00 à 11, toutes les 40 ms) : la piétaille fauchée
  par les traits pivote en 0,2 s et devient une série de bâtons gris pâle, à plat, lance comprise ; une bouffée de
  poussière passe par-dessus.
- Cheval tué : une tache rouge sombre (hd-melee-18 à 22, ht-archers-00 sur la route).
- Corps et flaques sur un pont encombré : planches/loupe-a-efface-1.png (a-efface-00 à 15, toutes les 400 ms) :
  on ne distingue plus les morts des vivants.
- Flaque petite (16 × 8 px), qui ne grandit pas.

**Ce qu'il faudrait.** Un homme qui plie les genoux et tombe en arrière en trois images, puis un corps couché rendu en
3D (vu de trois quarts, éclairé comme le reste, l'arme à côté de lui), une flaque qui s'étend en une seconde et fonce
en séchant.

**Comment.**
- Blender : une pose « tombe » dans figurines.py (pose_homme avec genoux pliés, buste renversé, puis corps allongé : la
  racine tournée de 90° autour des pieds, bassin au sol), 3 images de chute et 1 corps couché par troupe ; cavaliers :
  cheval qui s'affaisse et cavalier qui glisse, 3 + 1. 10 bandes × 4 = 40 rendus, 4 à 6 minutes. Nouvelle entrée
  « unite-<type>-<camp>-chute ».
- Dans corps() : jouer la bande de chute pendant BASCULE (portée à 0,3 s), puis l'image couchée ; poseCouchee() reste
  en repli. L'image couchée part ensuite dans la couche de sol (amélioration 3) : plus aucun redessin par image.
- Flaque : grandir de 0,4 à 1 en 1 s (déjà : k = 0,35 + âge / 0,9 ; l'étendre et ajouter un rouge plus sombre au bout
  de 3 s).

**Coût.** 0 ms par image pour la chute ; gain de 1,5 à 2 ms au ralenti 4 × une fois les corps posés dans la couche de
sol.
**Réglages.** Animations coupées : directement l'image couchée. Sang coupé : pas de flaque, et le corps s'efface en
1,4 s comme aujourd'hui (il n'entre pas dans la couche de sol).

### 3.6 La brèche et les murs

**Ce qu'on voit.**
- Chez le rival : planches/loupe2-h-breche-875_345-1.png (h-breche-10 à 21, toutes les 50 ms) : les cavaliers
  deviennent translucides devant la porte (fondu sur 16 px), puis une bouffée pâle et quelques éclats clairs. La porte,
  les murs, la bannière du donjon ne réagissent pas.
- Chez toi : planches/loupe-d-murs-1.png (d-murs-00 à 11) : poussière à peine visible à la porte ; le chiffre « −4 »
  monte au-dessus de la jauge, rouge clair, en petit (planches/ensemble-d-murs-1.png). La jauge passe de 40 à 36 d'un
  coup.

**Ce qu'il faudrait.** C'est le moment payant d'une attaque et le moment d'alarme d'une défense. Des pierres qui se
détachent du mur et roulent au pied, un éclair bref sur la place forte, une secousse (forte chez toi, légère chez le
rival), le chiffre qui frappe (gros, puis qui monte), la jauge qui se vide en deux temps (la part perdue reste claire
une demi-seconde avant de fondre), un liseré rouge au bord du champ quand ce sont tes murs.

**Comment.**
- Pierres : effet-eclats existant avec une gravité (3 à 4 éclats qui tombent du haut du mur au pied, 0,5 s) et 2
  bouffées de poussière au pied, au lieu d'une.
- Éclair sur la place forte : redessiner sa sprite par-dessus en mode « lighter » à 0,25 d'opacité pendant 80 ms
  (un drawImage de 150 × 150).
- Chiffre : échelle 1,6 → 1 sur ses 120 premières ms, puis la montée actuelle.
- Jauge en deux temps : garder dans jauge() une valeur « fantôme » qui rejoint pv en 0,5 s, dessinée en clair.
- Fondu à la porte : le remplacer par un passage derrière la façade (les troupes sont déjà triées sur le pied de la
  façade, prof) avec un assombrissement progressif plutôt qu'une transparence : plus de fantômes.
- Liseré rouge et secousse : feuille de style (3.12).

**Coût.** Moins de 0,1 ms au ralenti 4 × par brèche (éclats, poussière, éclair) ; jauge et chiffre : 0 ms ; liseré et
secousse : 0 ms dans la boucle.
**Réglages.** Animations coupées : pas de secousse, pas d'éclair ni de liseré, chiffre sans rebond, jauge directe ;
les pierres deviennent une seule image d'éclats.

### 3.7 Le champion

**Ce qu'on voit.** planches/loupe2-h-champion-R-champion-1.png (h-champion-00 à 22) et planches/loupe-a-champion-1.png
(a-champion-00 à 11) : une grande figurine (près de deux fois la hauteur des gardes) avec son grand écu et sa hampe, quatre gardes qui
marchent bien. Rien ne signale son arrivée ; sa barre de vie de 24 × 5 px est le seul repère.

**Ce qu'il faudrait.** Une entrée remarquée : sa propre grande bannière qui claque, un anneau de sa couleur au sol sous
lui, et, quand il frappe, une gerbe d'étincelles plus forte et une petite secousse.

**Comment.** Code seulement : anneau (onde() à plat, fixe, 0,5 d'opacité), bannière agrandie (banniere() avec une
hampe de 47 px existe déjà : agrandir l'étoffe pour lui seul), coups plus marqués (étincelles × 2). Avec la bande
d'attaque (3.2), il frappe enfin.
**Coût.** 0,05 ms. **Réglages.** Animations coupées : anneau fixe, bannière immobile.

### 3.8 La construction et l'amélioration

**Ce qu'on voit.** planches/loupe-construction-1.png (construction-00 à 11, toutes les 60 ms) : la tour apparaît
d'un coup, entière ; une gerbe de losanges d'or plats (anim.js, « or ») s'envole par-dessus la page : effet
d'interface plus que de chantier. L'amélioration (bouton « Améliorer ») n'a aucun effet visible, seulement un son et un
losange de plus au cartouche.

**Ce qu'il faudrait.** La tour qui sort de terre en 0,35 s (révélée de bas en haut, avec un léger tassement à la fin),
un nuage de poussière à son pied et quelques éclats de pierre ; pour l'amélioration, un éclat chaud qui monte le long
de la tour et le nouveau losange qui se pose.

**Comment.** Dans tour() : si tr.bati est récent (noter v.horloge à la pose, dans agirSur), dessiner la sprite avec
une source rognée par le bas (drawImage avec sy, sh) et un décalage de 2 px qui s'amortit ; effet-poussiere échelle 1,1
au pied (comme « tourRivale », qui a déjà sa poussière et son fondu). Les losanges d'or d'anim.js peuvent rester, plus
rares (6 au lieu de 14). Amélioration : même révélation sur 0,25 s depuis le haut de la tour précédente.
**Coût.** 0 ms en vague (la construction se fait en préparation). **Réglages.** Animations coupées : apparition
directe, comme aujourd'hui.

### 3.9 Les fins de bataille

**Ce qu'on voit.**
- Vraie victoire : planches/loupe-hv-victoire-chateau.png (hv-victoire-00 à 11, toutes les 80 ms) et
  planches/ensemble-hv-victoire.png : à la première image le château du rival est déjà une ruine (changement d'image
  sec), la fumée continue ; tes troupes deviennent transparentes en 0,6 s (hv-victoire-03 à 07) et le champ reste vide.
  Le panneau « Victoire ! » est bien là (planches/image-hv-victoire-fin.png).
- Défaite : planches/ensemble-d-defaite.png (d-defaite-00 à 02) : même changement sec d'abîmé à ruine, les assaillants
  s'effacent, le panneau change.

**Ce qu'il faudrait.** Une seconde de mise en scène avant le bilan : la place forte qui s'effondre dans un gros nuage de
poussière et de pierres, une secousse forte, la ruine qui apparaît quand le nuage retombe ; à la victoire, la bannière
du rival qui tombe et celle de France plantée sur la ruine, tes troupes qui s'arrêtent et lèvent leurs bannières au
lieu de disparaître, une lumière dorée qui monte (voile de la feuille de style) ; à la défaite, le champ qui se
désature et s'assombrit un peu.

**Comment.** Dans la boucle, au passage à « fin » (là où v.retrait est posé) : un état « effondrement » de 0,9 s qui
dessine l'ancienne image de la place forte qui s'enfonce de 6 px en s'assombrissant, 3 bouffées d'effet-poussiere à
l'échelle 2,5 à 3 décalées dans le temps, des éclats qui tombent, puis l'image « ruine ». Bannière : une flamme dessinée
(comme banniere()) plantée au point le plus haut de la ruine, qui monte de 20 px. Troupes victorieuses : garder les
bataillons 1,5 s (au lieu de 0,6 s), immobiles, bannières levées et abaissées deux fois, puis le retrait actuel.
Voile doré ou gris : un élément posé sur la toile (dégradé fixe en CSS, opacité animée), jamais dans la toile. Le bilan
arrive après, comme aujourd'hui (il n'y a plus de question à poser à ce moment-là).
**Coût.** Pic de 0,5 à 1 ms au ralenti 4 × pendant 1 s, après la dernière action de la bataille. **Réglages.**
Animations coupées : changement d'image direct, un seul nuage fixe, pas de voile ni de secousse.

### 3.10 Le bandeau d'or

**Ce qu'on voit.** planches/loupe-hud-faux-bandeau.png (hud-faux-00 à 02) : l'or passe de 72 à 66 d'une image à
l'autre, le chiffre rougit un instant. planches/loupe-hud-juste-sceau.png (hud-juste-00 à 03) : le sceau « Juste, +12
or » se pose sur le champ, puis le compteur saute. Aucun lien visible entre le sceau et le compteur.

**Ce qu'il faudrait.** Le « +12 » qui part du sceau et vole jusqu'au compteur, le compteur qui roule de 72 à 84 en
0,4 s avec un éclat sur la pièce ; à l'erreur, le compteur qui tressaille (2 px), un « −6 » rouge qui en tombe.

**Comment.** Feuille de style et quelques lignes dans majHud et orPerdu : un élément « +12 » en position fixe animé en
transform (même recette que JEU.anim.gain, déjà en place pour les ressources), compteur qui roule par
requestAnimationFrame sur 0,4 s (chiffres de largeur fixe : font-variant-numeric: tabular-nums), lancé après l'image
(JEU.anim.apresImage) pour ne jamais retarder la question suivante.
**Coût.** 0 ms dans la boucle de bataille ; une petite couche composée pendant 0,4 s. **Réglages.** Animations
coupées : compteur direct, rougeur seule (comme aujourd'hui).

### 3.11 La vie au repos

**Ce qu'on voit.**
- Drapeaux des tours et des places fortes cuits dans les images : immobiles (toutes les séquences ; par exemple
  planches/loupe-a-fumee-1.png, a-fumee-00 à 11).
- Braises des toits brûlés de la place abîmée cuites dans l'image : des tuiles orange immobiles, qui se lisent comme de
  la lave (loupe-a-fumee-1.png). La fumée monte, mais pâle et mince.
- Rivière immobile ; pas d'oiseau ; le brouillard (modificateur) est un dégradé fixe sur la moitié droite du champ, à
  bord droit vertical (bataille.js, « brouillard »).
- Ce qui vit déjà : ombres de nuages, fumées, pluie.

**Ce qu'il faudrait.** Des drapeaux qui claquent, des braises qui rougeoient et palpitent, quelques reflets qui
glissent sur l'eau, des corbeaux qui tournent au-dessus des morts, un brouillard en nappes qui dérivent.

**Comment.**
- Drapeaux : rendre dans Blender une flamme de chaque camp en bande de 6 images (petit rendu, environ 2 s chacune,
  18 rendus), rendre tours et places fortes sans leur flamme (paramètre dans tours.py et places.py, environ 16 tours
  × 20 s et 9 places × 45 s, 12 à 15 minutes), et relever les points d'accroche « drapeaux » dans le manifeste comme les
  foyers « fumees ». Le jeu dessine la bande à ces points (6 à 12 drapeaux, un drawImage chacun).
- Braises : 2 à 3 lueurs orangées en mode « lighter » aux foyers « fumees », dont l'opacité palpite (bruit lent).
- Fumée : bouffées un peu plus sombres et plus grosses à la base (bouffee(), deux teintes existent).
- Rivière : 6 à 8 reflets de 6 × 2 px qui glissent le long de la rivière de la carte (le tracé existe pour le repli),
  opacité qui monte et descend.
- Corbeaux : 2 ou 3 silhouettes de 2 images (battement) qui tournent lentement au-dessus de l'endroit où il y a le plus
  de corps, après la première minute de vague.
- Brouillard : 2 nappes douces pré-calculées (toile de 400 × 200 px) qui dérivent lentement, à la place du dégradé fixe.

**Coût.** Drapeaux 12 × 0,056 = 0,7 ms au ralenti 4 × (0,1 ms sur PC) ; braises 3 × 0,11 = 0,33 ms quand une place
est abîmée ; reflets 8 × 0,056 = 0,45 ms ; corbeaux 0,02 ms ; nappes de brouillard 2 × 0,25 ms quand le modificateur
est là. C'est le poste le plus cher par gain : à couper d'abord quand la boucle dépasse 4 ms (section 4).
**Réglages.** Animations coupées : drapeaux sur leur première image, braises fixes, pas de reflets ni d'oiseaux,
brouillard fixe (le dégradé actuel). Sang : sans objet (les corbeaux restent possibles sang coupé : ils ne montrent
rien).

### 3.12 La caméra

**Ce qu'on voit.** Aucune secousse, aucun éclair dans tout le champ de bataille (seul JEU.anim.secouer existe, pour
d'autres écrans). Ni l'impact d'une pierre, ni une brèche, ni la chute d'une place forte ne se sentent.

**Ce qu'il faudrait.** Des secousses courtes et rares, dosées : 1 px pour une pierre proche de ton château, 2 px pour
une brèche chez le rival, 3 à 4 px pour une brèche chez toi, 6 px pour l'effondrement d'une place forte ; un éclair
blanc chaud très bref (60 ms, 0,15 d'opacité) aux mêmes moments ; un liseré rouge au bord du champ quand tes murs sont
frappés.

**Comment.** Feuille de style : une classe sur le cadre de la toile (.td-cadre) avec une animation transform de 120 à
400 ms (keyframes « secousse » existent déjà, à décliner en trois forces) ; un pseudo-élément posé sur la toile pour
l'éclair et le liseré (box-shadow inset rouge), opacité animée. Déclenchés par les effets « impact », « breche » et la
fin de bataille, au plus une secousse en cours à la fois.
**Coût.** 0 ms dans la boucle (le compositeur déplace la couche déjà existante de la toile). À vérifier sur la
tablette : une transformation de la toile ne doit pas la faire repeindre (la mesure de perf.js le dira).
**Réglages.** Animations coupées (et prefers-reduced-motion) : rien du tout.

### 3.13 Sans animations, sans sang

- Sans animations : planches/gros-h-sans-anim-1.png (h-sans-anim-00 à 07) : la mêlée reste lisible, figée ; les
  traits volent toujours. Le réglage fait ce qu'il dit. Chaque proposition ci-dessus précise ce qu'il coupe.
- Sans sang (lecture du code) : poussière à la chute, corps effacés en 1,4 s. Rien à reprendre ; les propositions
  gardent ce partage (étincelles et chutes oui, gouttes, flaques et taches non).

## 4. Budget et règles pour toute animation nouvelle

1. **Rien dans le moteur.** bataille-moteur.js ne change pas : les effets se déduisent de ce qu'il publie (projectiles
   neufs, effets « impact », « breche », « coup », « chute », « pique »), dans le dessin.
2. **Payer avant d'ajouter.** La couche de sol (amélioration 3) vient avant les effets continus : elle rend 1,5 à 2 ms
   au ralenti 4 × en grosse mêlée.
3. **La boucle reste sous 4 ms en médiane.** Ajouter à perf.js une mesure « grosse mêlée avec effets » (pierres,
   brèches, volées) au ralenti 4 × ; tenir les plafonds : 8 coups étincelants, 24 traits avec traînée, 60 particules,
   10 lueurs, une secousse à la fois.
4. **Un régulateur.** Si la boucle dépasse 4 ms en moyenne sur une seconde, couper dans l'ordre : reflets de l'eau,
   corbeaux, traînées, volées (une flèche par tir), mottes et étincelles réduites de moitié, drapeaux sur une image ;
   les rétablir sous 3 ms. Le joueur ne voit qu'un champ un peu plus calme.
5. **Jamais de dégradé ni de voile plein écran dans la toile** : secousse, éclair, voile doré ou gris passent par la
   feuille de style.
6. **Les vues sont gardées.** Toute nouvelle bande (attaque, chute, sens, tours) passe par vueFigure ou une petite
   toile gardée ; une image du combat ne fait que copier.
7. **Après la question.** Tout effet déclenché par une réponse (bandeau d'or) part après l'image (apresImage) et ne
   touche jamais le chemin réponse → question suivante.
8. **Les deux réglages.** Animations coupées : pas de secousse, d'éclair, de particule, de traînée, d'ambiance, de
   geste ; il reste l'état du jeu lisible. Sang coupé : ni goutte, ni flaque, ni tache, ni corps gardés plus de 1,4 s.
9. **Repli.** Chaque nouvelle image a son repli : la bande de marche si la bande d'attaque ou de chute manque, l'image
   de repos si la tour n'a pas d'images de tir.

## 5. Les dix améliorations, par gain visuel rapporté au coût

Gain : ce que l'élève voit à chaque bataille. Coût : travail, rendu Blender (estimé, Blender n'étant pas dans ce
conteneur) et millisecondes de boucle au ralenti 4 ×.

| # | Amélioration | Nature | Travail | Boucle (ralenti 4 ×) | Réglages |
|---|---|---|---|---|---|
| 1 | Réglages à coût nul : cadence du pas, poussières sous les figures, étincelles au lieu des étoiles blanches, traits à l'échelle et en volée, bannières qui ondulent | code | 3 h | + 0,1 ms au plus | Animations (volées, étincelles, bannières) |
| 2 | Retour immédiat : secousses, éclair, liseré rouge, or qui roule et qui vole | feuille de style + JS | 4 h | 0 ms | Animations |
| 3 | Couche de sol persistante : corps couchés, flaques, taches de sang, cratères, flèches plantées | code | 1 jour | **− 1,5 à − 2 ms** | Sang (corps, sang) |
| 4 | Impacts qui pèsent : anneau au sol, mottes, recul des voisins, pierres qui tombent des murs, jauge en deux temps, chiffre qui frappe | code | 5 h | + 0,1 ms par impact | Animations |
| 5 | Tour qui sort de terre, amélioration visible | code | 2 h | 0 ms (préparation) | Animations |
| 6 | Fin de bataille mise en scène : effondrement, bannières, troupes victorieuses, voile doré ou gris | code + feuille de style | 5 h | pic 1 ms pendant 1 s | Animations |
| 7 | Tours qui tirent : trébuchet, baliste, archers, piquiers animés, départ du trait au bon endroit | Blender (tours.py) + code | 1 jour, dont 12 à 20 min de rendu | 0 ms | Animations (image de repos) |
| 8 | Chutes et corps rendus : 3 images de chute + 1 corps couché par troupe | Blender (figurines.py, unites.py) + code | 1 jour, dont 4 à 6 min de rendu | 0 ms (gain avec le 3) | Animations, Sang |
| 9 | Gestes de mêlée : 4 images d'attaque par troupe, recul de l'homme touché | Blender (figurines.py, unites.py) + code | 1 jour, dont 5 min de rendu | + 0,05 ms | Animations |
| 10 | Vie au repos : drapeaux qui claquent, braises, fumée plus dense, reflets, corbeaux, brouillard en nappes | Blender (flammes, tours et places sans flamme) + code | 1,5 jour, dont 15 min de rendu | + 0,3 à 0,8 ms, coupé par le régulateur | Animations |

### 1. Réglages à coût nul (3.1, 3.2, 3.3)

Cinq corrections de quelques lignes chacune, qui changent l'impression générale :
- cadence du pas par genre (piétons : cycle de 15 px au lieu de 30) : fin du patinage ;
- poussières de choc, de trait, de chute et de retrait dessinées sous les figurines ou triées avec elles, plus
  transparentes : fin des cavaliers délavés (h-melee-00, hd-melee-08) ;
- étincelles de métal (3 à 5 traits orangés, 0,15 s) à la place des étoiles blanches de 18 à 24 px (hd-melee-00,
  h-chute-00) ;
- flèche, carreau et pierre ramenés à 12, 16 et 9 px par l'échelle de sprite() ; volées de 3 flèches pour les tours
  d'archers ; traînée légère ; pierre qui tourne ;
- bannières de bataillon qui ondulent vraiment (± 1,4 px, 6 vues gardées).
Gain : la bataille paraît plus juste et plus « dessinée à la main » dès la première vague. Coût presque nul.

### 2. Retour immédiat (3.10, 3.12)

Trois forces de secousse sur le cadre de la toile, un éclair bref et un liseré rouge par la feuille de style ;
compteur d'or qui roule et « +12 » qui vole du sceau au compteur, « −6 » qui tombe à l'erreur. Rien dans la toile,
rien dans le chemin réponse → question. C'est ce qui donne du poids à tout le reste : une brèche se sent, une bonne
réponse se voit arriver dans la bourse.

### 3. Couche de sol persistante (3.4, 3.5)

Une toile hors écran de la taille du fond, initialisée avec lui, dessinée à sa place à chaque image (même coût que
le fond actuel). Y sont posés une fois pour toutes : les corps couchés dès la fin de leur bascule, leurs flaques,
les taches de sang retombées, les cratères des pierres, 1 ou 2 flèches plantées autour de chaque troupe touchée, les
traces des engins. L'effacement : chaque image, une bande de 1/8 de la hauteur reçoit le fond d'origine à 0,08
d'opacité (tout s'efface doucement en 6 à 8 s, comme les corps aujourd'hui), soit 1/8 de fond par image
(environ 0,2 ms au ralenti 4 ×, déjà compté dans le gain net). La couche est
refaite depuis le fond quand la netteté change (ajusterNettete). Gain double : le champ garde la trace des combats,
comme dans Total War, et la boucle rend 1,5 à 2 ms au ralenti 4 × (corps et flaques ne sont plus redessinés). Sang
coupé : les corps restent vivants 1,4 s et ne sont jamais posés ; seuls les cratères le sont.

### 4. Impacts qui pèsent (3.4, 3.6)

Pierre : anneau brun au sol, 6 à 8 mottes en cloche, figurines voisines repoussées et vacillantes, cratère posé dans la
couche de sol, secousse de 1 px si l'impact est près de ton château. Brèche : pierres qui tombent du mur, deux bouffées
au pied, éclair sur la place forte, chiffre qui frappe, jauge en deux temps, passage derrière la façade au lieu du
fondu fantôme, secousse et liseré chez toi. Moins de 0,1 ms par impact.

### 5. Tour qui sort de terre (3.8)

Révélation de bas en haut en 0,35 s avec tassement, poussière au pied, éclats ; amélioration révélée depuis le haut.
Vu à chaque préparation ; coût nul en vague.

### 6. Fin de bataille mise en scène (3.9)

Une seconde d'effondrement (ancienne image qui s'enfonce, trois gros nuages, éclats, secousse forte, ruine qui
apparaît), bannière du rival qui tombe et bannière de France plantée sur la ruine, troupes victorieuses qui restent
1,5 s bannières levées, voile doré (victoire) ou champ désaturé (défaite) par la feuille de style ; le bilan ensuite.

### 7. Tours qui tirent (3.3)

Boucle d'images dans tours.py (2 à 3 images nouvelles par tour, 16 tours, environ 45 rendus de 15 à 25 s), point « tir »
dans le manifeste ; dans le dessin, la tour joue sa bande au départ de chaque projectile neuf (aucun changement du
moteur) et le trait part du bout de la verge ou de l'arc. Poussière au pied du trébuchet au lâcher. Les tours sont les
unités du joueur : les voir travailler change la lecture de toute la défense.

### 8. Chutes et corps rendus (3.5)

Pose « tombe » dans figurines.py, bande « -chute » de 4 images par troupe (3 de chute, 1 couchée), 40 rendus. corps()
joue la chute puis pose le corps couché dans la couche de sol. Les morts redeviennent des hommes tombés, lisibles
même sur un pont encombré.

### 9. Gestes de mêlée (3.2)

Bande « -coup » de 4 images par troupe (armer, frapper, revenir), 40 rendus, jouée par le premier rang au contact sur
le rythme de u.frappe ; recul de 1 px et assombrissement de l'homme touché ; le champion frappe enfin. Avec les
étincelles de l'amélioration 1, la mêlée devient un combat et non deux blocs qui se touchent.

### 10. Vie au repos (3.11)

Flammes animées de chaque camp en bande de 6 images, tours et places fortes rendues sans leur flamme, points
d'accroche dans le manifeste ; braises qui palpitent aux foyers des places abîmées ; fumée plus dense à la base ;
reflets sur la rivière ; corbeaux au-dessus des morts ; brouillard en nappes qui dérivent. Le poste le plus cher par
gain et le premier coupé par le régulateur.

## 6. Hors des dix, à garder en réserve

- **Marche à 8 images et trois sens** (3.1) : 44 rendus pour les 8 images, 176 pour les deux sens de plus, 20 à 30
  minutes de rendu ; dessin : choix du sens d'après la tangente de la route. Gain réel mais modeste à la taille des
  figurines sur la tablette (10 à 14 px) ; à faire après les dix, ou dès que les bandes d'attaque et de chute sont
  rendues (même session Blender).
- **Champion mis en valeur** (3.7) : anneau au sol, grande bannière, coups plus marqués. 1 h, à grouper avec le 9.
- **Ombres des figurines** (3.1) : vérifier sur les bandes que l'ombre touche le pied d'appui.
- **Tour de siège** : ses 4 images de marche sont presque identiques (roues qui ne tournent pas à l'œil) ; rendre les
  roues à 4 angles et faire osciller les hommes qui poussent.
- **Pluie** : gouttes qui éclaboussent la route (petits anneaux) et assombrissement léger du champ (dans le fond
  pré-calculé, pas dans la boucle).

## 7. Fichiers

Scripts et mesures (atelier/captures/audit-graphismes/bataille/) :
- capturer-bataille.js (passe 1), capturer-bataille-2.js (passe 2 : `SEUL=attaque,breche,defense,tirs,victoire`
  pour rejouer une partie seulement ; ajoute ses relevés à brut2/releves.json) ;
- planches.py (passe 1), planches2.py et loupe2.py (passe 2 : `python3 loupe2.py <séquence> <J-type | R-type | x,y>
  <largeur> <hauteur> <grossissement> [première] [dernière] [pas]`) ;
- mesure-boucle.js → mesures-boucle.json (boucle de bataille, PC et ralenti 4 ×) ;
- mesure-couts.js → mesures-couts.json (coût unitaire des opérations de dessin).

Images :
- brut/ : passe 1, netteté 1 (a-marche, a-tirs, a-melee, a-chute, a-efface, a-touche, a-impacts, a-porte, a-champion,
  construction, prep-*, d-marche, d-tirs, d-impacts, d-chute, d-murs, d-fumee, d-defaite, hud-juste, hud-faux ; a-victoire,
  a-fumee, a-sans-anim, a-sans-sang prises après la fin de la vague, voir 2.1) ;
- brut2/ : passe 2, netteté 2 (h-marche, h-champion, h-chute, h-melee, h-sans-anim, h-breche, hd-melee, ht-trebuchet,
  ht-impact, ht-archers ; hv-victoire en page entière, netteté 1) ;
- planches/ : loupe-*.png et ensemble-*.png (passe 1), gros-*.png et loupe2-*.png (passe 2), ensemble-hv-victoire.png,
  loupe-hv-victoire-chateau.png, image-hv-victoire-fin.png.

Code regardé : jeu/js/bataille.js (dessiner, majBataillon, vueFigure, banniere, corps, poseCouchee, giclee, projectile,
fumees, jauge, tour, boucle, agirSur), jeu/js/anim.js, jeu/css/jeu.css (td-or, keyframes), jeu/assets/images/td/sprites.js ;
atelier/outils/rendu-3d/unites.py, figurines.py (pose_homme, soldat, cavalier), engins.py (trebuchet, baliste,
piquier, tour_de_siege), tours.py, effets.py.
