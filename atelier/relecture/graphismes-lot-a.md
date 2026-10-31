# Lot A graphique : le champ de bataille vivant, relecture (31/10/2026)

Ta demande du 31/10 : « Améliore les graphismes et les animations ». Le plan (atelier/conception/graphismes-animations-plan.md) découpe le travail en trois lots. Ce document relit le premier, le champ de bataille. Je l'ai relu en adversaire : le code ligne à ligne, les mesures refaites, les replis essayés, et chaque séquence regardée image par image, avant et après.

## 1. En bref

- Les batailles bougent pour de vrai : les soldats frappent, tombent en trois temps, restent au sol quelques secondes avec leur sang, puis s'effacent.
- Les tours tirent avec un geste (le bras du trébuchet bascule, les archers tirent par volées), une pierre laisse un cratère et bouscule les soldats, une brèche fait tomber des pierres et trembler l'écran.
- À la victoire, le château s'effondre dans la poussière et la bannière de France monte sur la ruine. À la défaite, le champ s'assombrit.
- La bataille ne coûte pas plus cher qu'avant, même avec un processeur ralenti quatre fois (l'approche de ta tablette).
- Les règles du jeu ne changent pas : le moteur de la bataille est identique, octet pour octet. Une même partie donne la même issue, avec ou sans animations, avec ou sans sang.
- En relisant, j'ai corrigé trois défauts (section 5). Il en reste quatre à reprendre, rien de bloquant (section 6).

## 2. Ce qui change à l'écran

| Moment | Avant | Maintenant |
|---|---|---|
| Marche | les pieds glissaient (un pas pour 30 px) | un pas pour 15 px à pied ; les bannières flottent un peu plus |
| Mêlée | une grande étoile blanche cachait le premier rang ; les cavaliers devenaient translucides | de petites étincelles orangées ; le premier rang arme, frappe, suit et revient ; la poussière passe sous les pieds |
| Soldat tué | il pivotait d'un quart de tour et devenait un trait gris | genoux qui plient, buste renversé, au sol, couché avec son arme ; le cavalier glisse de son cheval qui s'affaisse |
| Morts et sang | effacés en quelques secondes, pâles | corps assombris sur leur flaque, gouttes brun-rouge au sol, flèches plantées ; tout reste 5 s puis s'efface vers 8 s ; même sang pour tous les camps, aucun membre détaché |
| Trébuchet | bras immobile, la pierre naissait en l'air | le bras bascule et lâche la pierre au bout de la fronde ; un peu de poussière au pied |
| Archers, baliste | une flèche de 24 px | des volées de trois flèches fines (12 px) avec une traînée pâle ; la baliste se détend |
| Pierre qui tombe | une bouffée pâle | un anneau de terre au sol, des mottes, les soldats voisins bousculés d'un ou deux pixels, un cratère qui reste |
| Brèche | chiffre seul ; les troupes à la porte devenaient des fantômes | pierres qui tombent du haut du mur, deux bouffées, le château s'éclaire un instant, le chiffre frappe ; l'écran tremble (plus fort quand ce sont tes murs, avec un liseré rouge) ; les troupes passent derrière la façade |
| Tour posée | apparaissait d'un coup | sort de terre en un tiers de seconde, se tasse, poussière au pied ; améliorée, la nouvelle tour se révèle de haut en bas |
| Or | chiffre qui change | compteur qui roule ; « +12 » vole du sceau jusqu'au compteur ; à l'erreur, le compteur tressaille et « −6 » rouge en tombe |
| Victoire | château déjà en ruine à la première image | le château s'enfonce sous trois nuages de poussière, puis la ruine ; la bannière anglaise tombe, celle de France monte ; voile doré ; tes troupes restent 1,5 s |
| Défaite | ruine d'un coup | tes murs s'effondrent dans la poussière, le champ se ternit |
| Animations coupées | — | rien ne bouge en dehors du jeu lui-même : ruine directe, pas de secousse, tours au repos, corps posés tout de suite |
| Sang coupé | — | ni goutte, ni flaque, ni tache ; les soldats tombés s'effacent en 1,4 s |

## 3. Images à regarder

Planches avant-après rangées dans le dépôt : `atelier/captures/graphismes-lot-a/revue/` (images JPG, une ligne « avant », une ligne « après » quand l'avant existe).

1. `revue-chute.jpg` : un soldat anglais tombe. Avant, l'étoile blanche et le « bâton » ; après, la chute en trois temps et le corps sombre sur la route.
2. `revue-melee.jpg` : ta piétaille contre des cavaliers anglais. Avant, l'étoile et les cavaliers fantômes ; après, étincelles, poussière et sang au sol.
3. `revue-pierre.jpg` : une pierre de trébuchet. Avant, presque rien ; après, l'anneau de terre, les mottes, le cratère.
4. `revue-breche.jpg` : tes cavaliers à la porte du château anglais, la brèche.
5. `revue-construction.jpg` : une tour d'archers qui sort de terre.
6. `revue-victoire.jpg` et `revue-defaite.jpg` : la fin de bataille.
7. `revue-reglages.jpg` : Sang coupé, puis Animations coupées.

Les séquences complètes (des centaines d'images) restent hors du dépôt, sur la machine de travail : atelier/captures/audit-graphismes/lot-a/integration/ (apres-brut/, avant-brut/, planches/).

## 4. Les chiffres

Avant : la base mesurée par l'agent des mesures sur une copie du jeu d'avant le lot (atelier/captures/audit-graphismes/plan/base-lot-a.json, médianes de 6 à 8 passages). Après : mes passages sur le jeu final, même machine, mêmes essais (perf.js complet, `PARTIE=ralenti`, `PARTIE=graphismes`). Le plan donnait des bases d'un seul passage (7,2 ms, 7,1 ms, 3,7 ms) ; elles bougent de ± 1,5 ms d'un passage à l'autre, d'où la base refaite.

| Mesure (grosse mêlée avec effets : 4 tours, pierres, volées, brèches) | Seuil | Avant | Après |
|---|---|---|---|
| Processeur ralenti 4 ×, 1340 × 800 : boucle de bataille, médiane | pas au-dessus de la base (8,4 ms avec le bruit) | 7,6 ms (plan : 7,2) | 7,5 ms |
| Ralenti : boucle, 95 % des images | — | 15,1 ms | 13,1 ms |
| Ralenti : boucle, la pire | — | 24,2 ms | 22,8 ms |
| Ralenti : images à plus de 34 ms | lot C : 5 % | 11,3 % | 6,1 % |
| Ralenti : écart médian entre deux images | lot C : 17,5 ms | 33,3 ms | 33,3 ms |
| PC 1366 × 768 : boucle médiane | moins de 4 ms | 2,1 ms | 2,2 ms |
| PC 1366 × 768 : boucle, 95 % | moins de 8 ms | 4,0 ms | 3,8 ms |
| PC 1920 × 1080 : boucle, la pire | moins de 11,8 ms (plan : 7,1) | 10,7 ms | 7,7 ms |
| PC 1920 × 1080 : boucle, 95 % | moins de 4,5 ms (plan : 4,1) | 4,1 ms | 3,3 ms |
| PC, 1366 et 1920 : écart médian entre images | 17,5 ms au plus | 16,7 ms | 16,7 ms |
| Coût d'une pierre (ralenti) | moins de 0,1 ms | 0,017 ms | 0,013 ms |
| Coût d'une brèche (ralenti) | moins de 0,1 ms | 0,063 ms | 0,062 ms |
| Temps de calcul par image, partie identique | — | 2,03 ms | 1,99 ms |
| Réponse → question suivante peinte, ralenti, en bataille | moins de 100 ms | 80 ms | 88 ms |
| Réponse → question suivante, PC 1366 et 1920 (temps réel) | moins de 100 ms | — | 56 ms au pire (deux passages) |
| Réponse → question suivante, tablette au doigt 1280 × 800 et 1024 × 768 | moins de 100 ms | — | 88 ms au pire (deux passages) |
| Plafonds : étincelles, traînées, particules, lueurs, secousses | 8, 24, 60, 10, 1 | — | 6, 3, 8, 1, 1 |
| Mémoire JavaScript pendant 6 s de mêlée | pas de croissance | 17,1 → 17,1 Mo | 18,2 → 18,2 Mo |
| Même issue sous les 4 réglages (Animations × Sang), et la même qu'avant le lot | oui | oui | oui |
| Moteur bataille-moteur.js | identique | — | identique |

Ce que disent ces chiffres : les effets neufs sont payés par la « couche de sol » (corps et sang peints une fois dans une image de fond au lieu d'être redessinés à chaque image), mais ils ne laissent pas encore de marge sur la tablette. La bataille y tourne toujours à 30 images par seconde quand la mêlée est grosse. C'est le travail du lot C (régulateur automatique, réglage Ambiance).

## 5. Ce que j'ai corrigé en relisant

1. **L'anneau des pierres ressemblait à une cible.** Il était tracé avec la même fonction que les marques du rival : un cercle net cerné d'encre. Sur les séquences, il se lisait comme un repère de jeu, et la liste de style du plan interdit tout contour noir neuf. C'est maintenant un seul trait de terre, qui s'élargit et pâlit en un tiers de seconde (comparer `revue-pierre.jpg` à l'ancienne planche atelier/captures/audit-graphismes/lot-a/integration/planches/loupe-ht-impact-apres.png).
2. **Le compteur d'or roulait avant l'arrivée de l'or.** Le « +12 » met 0,45 s à voler du sceau au compteur, mais le compteur affichait la nouvelle somme tout de suite. Il attend maintenant que l'or arrive (0,38 s), puis roule. Rien ne change dans le temps entre la réponse et la question suivante.
3. **Un petit calcul répété à chaque image après une victoire** (le réglage d'ambiance relu pour la bannière de France) : il prend maintenant la valeur calculée une fois par image.

## 6. Ce qui reste ouvert

1. **Le nuage d'effondrement fait un peu « coton ».** Les trois nuages sont lisses, pâles et à fond plat : ils forment un banc de nuages plus qu'une poussière de pierres. Proposition : refaire l'image effet-effondrement dans Blender, plus grise et brune, plus turbulente, avec un cœur sombre et une colonne qui monte (une minute de rendu, outil effets.py). Pas fait ici : c'est un rendu, pas une retouche.
2. **Le champion n'a pas encore son anneau au sol ni sa bannière agrandie** (dernière ligne de la fin de bataille du plan). Proposition : sous le champion, une ellipse de la couleur de son camp, sans contour noir, et sa bannière 1,3 fois plus grande.
3. **La couche de sol ne rend pas le temps promis.** Le plan voulait 1 ms de moins que la base au ralenti avant tout effet ; on reste au même niveau (7,6 → 7,5 ms), effets compris. Le lot C doit apporter la marge (régulateur, netteté plafonnée sur la tablette).
4. **Mémoire de la couche de sol.** Elle tient dans deux images de la taille du champ (l'une pour peindre, l'autre pour effacer) : environ deux fois ce que le plan estimait (10 Mo en 2000 × 1320, donc 20 Mo). La tablette a 4 Go, ça passe ; si elle peinait, la couche peut passer à demi-résolution (étape prévue au lot C).

Petites remarques sans correction : les six losanges d'or quand on pose une tour restent un peu « jeu sur téléphone » (le plan les a gardés, réduits de 14 à 6) ; l'éclair d'une brèche pâlit tout le champ pendant 60 ms, une fois par seconde au plus, comme le plan le prévoit ; à la défaite, le champ est terni par un filtre de la feuille de style pendant que la page montre le bilan (coût faible, à surveiller sur la tablette).

## 7. À vérifier dans le navigateur (cinq gestes)

1. Lance une bataille, pose une tour d'archers : elle sort de terre dans un peu de poussière, en moins d'une demi-seconde.
2. Envoie des fantassins contre les Anglais : au contact, des étincelles orangées (pas d'étoile blanche), des soldats qui tombent en pliant les genoux, des corps sombres qui restent quelques secondes puis s'effacent.
3. Réponds juste au conseil de guerre : « +12 » vole du sceau vers le compteur d'or, puis le compteur roule.
4. Gagne une bataille : le château ennemi s'effondre dans la poussière et la bannière bleue à fleurs de lys monte sur la ruine.
5. Dans les Réglages, décoche « Sang », relance une bataille : plus aucune goutte ni flaque, les soldats tombés s'effacent vite. Décoche ensuite « Animations » : le champ reste immobile en dehors des troupes qui marchent, et l'écran ne tremble plus.

## 8. Contrôles faits

- Moteur : `git diff` vide sur jeu/js/bataille-moteur.js depuis le commit d'avant les lots (930af4c), et l'empreinte contrôlée par tests.js.
- Hasard : aucun `Math.random` dans le dessin neuf (bataille-sol.js, bataille-effets.js, lignes neuves de bataille.js) ; les tirages viennent de la place de l'effet.
- Replis, sur des copies du jeu : nouvelle bataille.js avec les anciennes images et l'ancien manifeste (sans bandes de chute, de coup, de tir, sans cratère, nuage ni drapeau) ; sans les deux scripts neufs ; les deux à la fois ; et les deux avec Animations et Sang coupés. Aucune erreur, l'ancien dessin revient, et la partie a la même issue (même or, mêmes troupes, même victoire).
- Version installable et application Android : aucun fichier neuf dans jeu/ depuis ma relecture ; sw.js correspond à jeu/ (tests.js) ; aucun nom en « . » ni dossier en « _ » que l'application écarterait, et aucune sorte de fichier nouvelle.
- `node atelier/outils/tests.js` : 370 réussis, 0 échec. `node atelier/outils/valider.js` : 0 erreur, 5 alertes connues.
- perf.js complet (PC, expédition, tablette) : aucun échec au premier passage. Au second, après mes corrections, un seul échec sans rapport avec le lot : « seulement 2 mesures d'Event Timing pendant l'escarmouche » (il en faut 3 ; les questions tirées au hasard demandent parfois plusieurs gestes, qui ne se mesurent pas) ; `PARTIE=expedition` relancée deux fois : 4 puis 3 mesures, aucun échec. Ce contrôle est instable : à rendre plus sûr dans perf.js (tirer des questions à un seul geste pour l'escarmouche). `PARTIE=ralenti` et `PARTIE=graphismes` : aucun échec ; ce qui reste « à venir » appartient aux lots B (écrans vides entre deux écrans) et C (accueil, domaine, porte d'expédition au ralenti, marge de la tablette).
