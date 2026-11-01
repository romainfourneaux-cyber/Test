# Lot C graphique : finitions et performance, relecture (01/11/2026)

Ta demande du 31/10 : « Améliore les graphismes et les animations ». Le plan (atelier/conception/graphismes-animations-plan.md)
découpe le travail en trois lots. Ce document relit le dernier, « Finitions et performance » : rendre le jeu léger pour
la tablette (Galaxy Tab A9), sans rien enlever de ce qui sert au jeu. Trois agents y ont travaillé en même temps (écrans,
champ de bataille, outils de mesure), puis des vérificateurs ont cherché la petite bête. J'ai fusionné, repris les neuf
défauts confirmés (sept corrigés, deux ouverts), refait toutes les mesures sur le jeu final, une passe après l'autre, et regardé les captures.

## 1. En bref

- L'accueil et le domaine ne rament plus : au processeur ralenti quatre fois (l'approche de ta tablette), ils tiennent
  60 images par seconde, sans aucune image lente.
- Nouvelle case « Ambiance » dans les Réglages, sous « Animations » : elle coupe les décors qui bougent (nuages, fumées,
  oiseaux, drapeaux, villageois, poussières) et garde tout le reste. Si l'appareil peine sur un écran, le jeu la coupe de
  lui-même pour la séance ; une note le dit dans les Réglages.
- En bataille, un régulateur peut alléger les effets les moins utiles quand la machine peine. Il ne garde un allègement
  que s'il fait vraiment gagner du temps ; sinon il remet tout.
- Petites finitions : halo d'or arrondi autour de ce qui a le focus, chiffres lisibles sur la carte, la route et le
  bandeau du champ, lueurs qui respirent sans faire repeindre l'écran.
- Les règles du jeu ne changent pas : moteur de bataille identique octet pour octet, même issue pour une même partie
  quels que soient les réglages, simulation d'équilibre des batailles aux mêmes chiffres (écarts nuls).
- Deux objectifs du plan ne sont pas tenus au ralenti : la boucle de bataille reste vers 6,8 ms au lieu de moins de
  4 ms, et la porte d'une expédition montre ses cartes en 72 à 120 ms au lieu de moins de 100 (section 6). L'image reste
  fluide (16,7 ms entre deux images) ; c'est à vérifier sur la tablette.
- En relisant, neuf défauts confirmés par les vérificateurs : sept corrigés, deux laissés ouverts avec leurs mesures
  (section 5).

## 2. Ce qui change à l'écran

| Moment | Avant | Maintenant |
|---|---|---|
| Accueil | les poussières faisaient repeindre la tapisserie à chaque image ; le menu pouvait défiler à l'ouverture | les poussières montent tout droit, peintes une seule fois ; « Jouer » a le focus sans faire défiler la page en 1366 × 768 |
| Domaine | nuages flous, rivière et villageois animés dans le grand dessin : tout le plan se repeignait | le plan ne bouge plus ; ce qui vit (reflets de la rivière, fanions, moulin, fumées, nuages, oiseaux, villageois) est dans un calque posé dessus ; plus aucun flou |
| Réglages | « Animations » seulement | « Ambiance (nuages, fumées, oiseaux, drapeaux) » juste dessous, en sceau de cire, grisée quand Animations est décoché ; une note si le jeu l'a coupée de lui-même |
| Carte, route, domaine sans ambiance | — | décors immobiles ; les halos des lieux où toucher et la lueur de l'événement du jour restent (ce sont des signaux de jeu) |
| Bataille sur une machine qui peine | tout était dessiné, quoi qu'il arrive | le régulateur essaie d'ôter un petit effet (traînées des flèches, volées, mottes, étincelles, poussières, ombres du dernier rang, fumées) ; s'il ne gagne rien, il le remet aussitôt. Jamais moins de soldats, jamais de geste, de chute ou de tir coupé |
| Ombres des nuages sur le champ | peintes dans la toile à chaque image | un calque que la carte graphique fait glisser ; elles assombrissent aussi les troupes |
| Corps et sang en bataille | pouvaient disparaître tous d'un coup sur un grand écran de PC | ils restent leurs quelques secondes, puis s'effacent comme d'habitude, même si la fenêtre change de taille |
| Focus au clavier | rectangle bleu | halo d'or arrondi sur les réponses, liens, cartes, médaillons ; le quartier du domaine s'éclaire |
| Chiffres | « 11 » pouvait se lire « II » sur la carte, la route et le bandeau du champ | chiffres en Crimson Text partout ; le compteur d'or garde son roulement |
| Porte d'une expédition | la réponse et les cartes arrivaient dans la même image | la réponse s'affiche d'abord, les cartes et leur éventail une image plus tard ; le son et le message aussi |
| Feuille de parchemin (partie, expédition) | se repeignait entière à chaque réponse | même feuille à l'œil, faite de couches fixes ; elle a perdu l'assombrissement intérieur du bas (elle garde son ombre) |

## 3. Les chiffres

Toutes les passes de perf.js sur le jeu final, lancées seules l'une après l'autre (complète, tablette, expéditions,
ralenti 4 ×, graphismes). Ralenti : processeur ralenti 4 ×, fenêtre 1340 × 800. « Avant » : à la fin du lot B
(atelier/relecture/graphismes-lot-b.md), sauf mention.

| Mesure (plan, section 7) | Seuil | Avant (lot B) | Après (lot C) |
|---|---|---|---|
| 7.1 Boucle de bataille, PC 1920 × 1080 (95 % ; pire) | 4,1 ; 7,1 ms | 2,8 ; 6,5 | 3,2 ; 6,7 |
| 7.1 Boucle de bataille, PC 1366 × 768 (médiane ; 95 %) | 4 ; 8 ms | — | 1,8 ; 3,1 |
| 7.1 Écart entre images (médiane ; plus de 34 ms) | 16,7 ; 2 % | 16,7 ; 0 % | 16,7 ; 0 % |
| 7.1 Plafonds (étincelles, traînées, particules, lueurs, secousses) | 8, 24, 60, 10, 1 | tenus | 6, 3, 0, 1, 0 |
| C2.6 Tas de mémoire pendant 6 s de mêlée | +1 Mo au plus | — | +0,16 Mo au plus |
| 7.2 Boucle de bataille au ralenti (médiane), régulateur actif | moins de 4 ms | 6,8 ms | 6,8 puis 6,9 ms (deux passes) ; le cran 1 est essayé puis rendu : **non tenu** |
| 7.2 Écart entre images au ralenti (médiane ; plus de 34 ms) | 17,5 ; 5 % | — | 16,7 ; 1,5 puis 2,4 % |
| 7.2 Réponse → question suivante, bataille au ralenti (pire) | moins de 100 ms | 48 | 64 puis 72 |
| 7.3 Accueil immobile au ralenti (médiane ; 95 % ; tâche la plus longue) | 16,7 ; 34 ; 50 ms | 133 ms par image à l'audit ; 9,4 % d'images lentes | 16,7 ; 16,7 ; 0 |
| 7.3 Domaine immobile au ralenti | idem | 15 % d'images lentes, une tâche de 448 ms à l'audit | 16,7 ; 16,7 ; 0 |
| 7.3 Carte, route, conseil immobiles au ralenti | idem | 16,7 ; 16,8 | 16,7 ; 16,8 au plus ; 0 |
| 7.3 Images de cuir vide entre deux écrans | 0 | 0 | 0 (PC et tablette au ralenti) |
| 7.3 Animations sans fin qui n'animent que transform ou opacity | toutes | — | toutes, sur chaque écran |
| 7.3 Réponse → question suivante, bataille 1366 × 768 (médiane ; pire) | moins de 100 ms | 40 ; 56 (64 après la chasse du lot B) | 32 ; 56 |
| 7.3 Idem, bataille 1920 × 1080 | moins de 100 ms | 48 ; 64 | 48 ; 80 |
| 7.3 Idem, tablette au doigt 1280 × 800 et 1024 × 768 (pire) | moins de 100 ms | 96 et 64 (80 après la chasse) | 48 et 64 |
| 7.3 Idem, escarmouche d'expédition 1366 et 1920 (pire) | moins de 100 ms | 32 et 56 | 40 et 56 |
| 7.3 Idem au ralenti : événement du jour (mesures) | moins de 100 ms | 72 à 104 | 40 à 72 |
| 7.3 Idem au ralenti : porte d'une expédition (mesures) | moins de 100 ms | 88 à 136 | 72 à 120 sur six mesures (deux passes : 104, 80, 112, puis 72, 96, 120) : **non tenu** |
| 7.4 Moteur ; même partie sous 4 réglages et 8 niveaux forcés ; simulation d'équilibre | identiques | identiques | identique octet pour octet ; 13 parties sur 13 à la même issue ; écarts nuls |
| 7.5 Ambiance coupée : boucles d'ambiance, demandes d'image (accueil, domaine, carte, route) | 0 | — | 0 et 0 |
| Réglage « Ambiance » : absent = actif, export puis import identiques, page rechargée, grisée sans Animations | tous | — | tous |
| tests.js ; valider.js | 0 échec ; 0 erreur | 381 ; 0 erreur | 423 réussis, 0 échec ; 0 erreur, 5 alertes connues (sources absentes de DEPOT/) |

Deux lignes de perf.js restent en échec dans la passe au ralenti : la boucle de 4 ms (non tenue, section 6) et
la porte d'une expédition (pire mesure 112 ms, puis 120 ms : j'ai relancé cette passe une fois, car ce contrôle passe
d'un côté ou de l'autre du seuil selon les passages ; section 6). Toutes les autres passes se terminent sans échec.

## 4. Images à regarder

Dans `atelier/captures/graphismes-lot-c/revue/` (JPG ; « pc » : 1366 × 768 à la souris ; « tablette » : 1340 × 800 au
doigt).

1. `accueil-pc.jpg`, `accueil-tablette.jpg` : la tapisserie, le blason, « Jouer » visible sans descendre.
2. `domaine-pc.jpg`, `domaine-tablette.jpg` : le plan net, sans flou ; la rivière, le moulin, les villageois.
3. `reglages-ambiance-pc.jpg`, `reglages-ambiance-tablette.jpg` : la case « Ambiance » sous « Animations ».
   `reglages-apres-coupure-tablette.jpg` : la note quand le jeu a coupé l'ambiance de lui-même.
4. `carte-sans-ambiance-pc.jpg`, `carte-sans-ambiance-tablette.jpg` : la carte calme, les halos des lieux toujours là.
5. `melee-niveau0-pc.jpg` et `melee-niveau8-pc.jpg` (et les mêmes en « tablette ») : une grosse mêlée avec tous les
   effets, puis au dernier cran du régulateur. La différence doit être à peine visible : c'est voulu.
6. `porte-eventail-pc.jpg`, `porte-eventail-tablette.jpg` : les cartes de faveur en éventail, après une bonne réponse.

Les planches avant et après des bâtisseurs sont dans `atelier/captures/graphismes-lot-c/ecrans/`.

## 5. Chasse aux bugs : trouvé et corrigé

Neuf défauts confirmés. Pour chacun, j'ai rejoué le scénario du vérificateur sur le jeu final. Aucun ne faisait perdre
une ressource, une province ou une réponse.

| Ce qui arrivait | Maintenant | Fichier |
|---|---|---|
| Sur un PC à grand écran qui peinait, le régulateur refaisait la toile de bataille en pleine vague : une image gelée de 80 à 330 ms, et tous les corps et tout le sang disparaissaient d'un coup, pour 2,8 % de pixels en moins | la toile n'est plus jamais refaite en pleine bataille ; la netteté plus basse ne vaut qu'à la bataille suivante. Rejoué en 1920 × 1080 et en 1340 × 800 à densité 2 : aucune toile refaite, aucun effacement d'un coup (avant : 1268 → 1250 px, puis 57 corps et 51 taches effacés d'une image à l'autre) | jeu/js/bataille.js |
| Le régulateur ôtait les effets un par un jusqu'au dernier cran sans rien gagner (au ralenti, tous les crans ensemble pèsent moins de 0,5 ms), et la bataille suivante partait déjà allégée | un cran qui ne rend pas au moins 0,3 ms est remis 2 s plus tard, et le régulateur ne monte plus dans cette bataille. Rejoué : il essaie le premier cran, puis remet tout (avant : cran 8, tous les effets ôtés) | jeu/js/bataille.js |
| Fenêtre redimensionnée en pleine vague (PC) : des soldats tombés restaient peints à l'ancienne taille, décalés de leur flaque, jamais effacés | ils sont reposés dans la couche neuve à la bonne taille, puis s'effacent normalement. Rejoué : 16 corps restés avant, 0 après | jeu/js/bataille.js |
| Après une coupure de l'ambiance par le jeu (appareil qui peine), la case « Ambiance » restait cochée sans rien faire, même décochée puis recochée | une note dit que l'ambiance est coupée pour la séance ; recocher la case la rallume (le jeu remesure, et recoupe si l'appareil peine toujours) | jeu/js/interface.js |
| Porte d'une expédition au ralenti : le son et le message partaient dans la même image que la réponse | ils partent une image plus tard, comme le reste (règle du plan) ; mais le seuil de 100 ms n'est toujours pas tenu au ralenti (section 6) | jeu/js/ecran-expedition.js |
| Outil de mesure : la porte était jugée sur la pire touche du geste, même celle qui ne valide rien (« Faux » qui ouvre la correction) | on juge la touche qui valide ; les autres sont des alertes | atelier/outils/perf.js |
| Outil de mesure : l'essai « même partie, même issue » ne se rejouait pas toujours à l'identique (son horloge truquée avançait encore toute seule) | l'horloge est arrêtée, elle n'avance que pas à pas. Rejoué : 6 parties sur 6 identiques, puis 6 sur 6 sous des réglages différents ; dans la passe complète, 13 sur 13 | atelier/outils/perf.js |
| Outil de mesure : le contrôle « Ambiance coupée » ne reconnaissait ni les villageois, ni le moulin, ni les reflets du domaine | une seule liste, partagée avec les tests des écrans : les six boucles du domaine sont vues, aucun signal de jeu n'est pris à tort | atelier/outils/perf.js, atelier/outils/tests-lot-c-ecrans.js |
| Boucle de bataille au ralenti au-dessus de 4 ms | pas corrigé : voir section 6 | — |

Les tests sous Node du régulateur (atelier/outils/tests-lot-c-bataille.js) suivent les nouvelles règles : 25 contrôles,
dont « un cran qui n'allège pas est remis » et « la toile n'est jamais refaite en pleine bataille ».

## 6. Ce qui reste

1. **Boucle de bataille au ralenti : 6,8 ms au lieu de moins de 4.** L'image reste fluide (16,7 ms entre deux images,
   1,5 à 2,4 % d'images lentes, seuil 5 %), mais le plan voulait de la marge. Le dessin des figurines prend à lui seul environ
   3,3 ms par image au ralenti, et la machine de travail dessine sans carte graphique : sur ta tablette, le dessin peut
   coûter bien moins. Aucun correctif court ne tient (les petits effets pèsent moins de 0,5 ms). Il faut d'abord mesurer
   sur la tablette ; si elle peine vraiment en grosse mêlée, on allégera le dessin des figurines (sans en enlever), ou on
   fixera ensemble un objectif tenable.
2. **Porte d'une expédition au ralenti.** De ta réponse aux cartes de faveur : 72 à 120 ms sur six mesures, la moitié
   au-dessus de 100 ms (à la fin du lot B : 88 à 136). Le calcul de la réponse ne prend que 14 à 22 ms ; le reste est le
   temps de peindre l'écran, que la machine de travail fait sans carte graphique. Le son et le message partent maintenant
   après l'image, et l'outil juge la bonne touche : pas de gain mesurable. À vérifier sur la tablette (essai 5) : si les
   cartes arrivent tout de suite, on garde ; sinon, il faudra alléger la fenêtre de la porte.
3. Les halos des lieux sur la carte et la route restent des animations dans le dessin de la carte (elles coûtent très
   peu). À passer dans un calque à part si la tablette peine sur la carte.
4. « Ambiance » coupée d'office sur écran tactile (première idée du plan si la tablette reste lente) : prête, pas
   appliquée. Accueil, domaine, carte et route tiennent déjà 60 images par seconde au ralenti, et le jeu coupe l'ambiance
   tout seul si l'appareil peine.
5. Choix visuels acceptés : les poussières de l'accueil montent tout droit (plus de petite dérive de côté) ; le courant
   de la rivière du domaine se relaie par petites touches au lieu de glisser ; la feuille de parchemin n'a plus
   l'assombrissement intérieur du bas.
6. Sur un PC à écran très dense qui peinerait, la netteté du champ ne baisse plus qu'à la bataille suivante (et
   rarement, puisque les petits effets ne font rien gagner). Sur la tablette, elle est plafonnée dès le départ, comme
   avant.
7. Version : inchangée (0.9.5). Elle monte à la livraison du lot (jeu/VERSION.txt, JEU.version, puis generer-sw.js).
   Aucun fichier neuf dans jeu/ : la liste de la version installable ne change pas.

## 7. À essayer sur la tablette

1. Ouvrir le jeu et rester dix secondes sur l'accueil : « Jouer » visible sans descendre, les poussières montent
   doucement, sans saccade.
2. Aller au Domaine : la rivière scintille, le moulin tourne, des villageois vont et viennent, sans à-coup. Dans les
   Réglages, si une note dit « L'ambiance est coupée pour cette séance », dis-le-moi : la tablette peine.
3. Dans les Réglages, décocher « Ambiance », puis revenir au Domaine et à la carte : nuages, fumées, oiseaux et
   villageois ne bougent plus ; les halos des lieux brillent toujours. Recocher : tout revient.
4. Lancer une bataille et envoyer beaucoup de troupes : le combat reste fluide, les soldats frappent et tombent, et les
   corps ne disparaissent jamais tous d'un coup.
5. Partir en expédition jusqu'à une porte de faveur et répondre juste : les cartes de faveur arrivent tout de suite et
   se retournent en éventail. Puis, à un événement du jour, répondre faux : ta réponse en rouge, la bonne en or,
   l'explication dessous.
