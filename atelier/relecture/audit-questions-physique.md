# Audit des questions de physique-chimie (28/10/2026)

Demande de Romain du 25/10/2026 : retirer les questions bizarres et, quand le cours déposé est trop mince, poser une question de thème. Grille : atelier/relecture/grille-audit-questions.md. Détail question par question : atelier/relecture/audit-questions-physique.json (77 entrées : tout ce qui n'est pas gardé tel quel, plus onze « garder » avec une retouche de forme). Appliqué le 28/10/2026 dans atelier/contenu/ (voir la section « Application » en fin de fichier).

## Résumé

314 questions relues dans les sept cours de physique-chimie (semaines 1 à 8, livret 1, thème A).

| Verdict | Nombre |
|---|---|
| garder | 259 (dont 11 avec une retouche notée) |
| réécrire depuis la fiche | 14 |
| remplacer par une question de thème | 21 |
| supprimer | 31 |

Après application : 283 questions, dont 21 de thème (7 %). Aucun cours ne dépasse la moitié : pas d'entrée « cours-mince » dans le fichier JSON.

Les questions de physique sont, dans l'ensemble, de vraies questions de cours : propriétés des trois états, noms des changements d'état, masse et volume, mélanges, pH. Les défauts trouvés se concentrent sur quatre points :

1. **Le protocole récité** (« dans la première partie de l'expérience, on chauffe… », l'ordre des gestes du verre retourné ou du papier pH, « que fait-on au mélange ? », la liste du matériel, la marque du papier) : quinze questions, surtout dans physique-s05-1 (fiche f1, le ballon) et physique-s08-1 (fiche f1, le chou rouge).
2. **Les détails de tableau ou de graphique du livret** (« les premières lignes du tableau », « vers la 3e minute », « environ 10 °C au début », « 35 g, encore homogène », « 3 cuillères à café de vinaigre », « l'eau du robinet de cette expérience ») : treize questions, dans physique-s04-1 (solubilité), physique-s05-1 (graphique de l'eau salée) et physique-s08-1 (échelle de couleurs).
3. **Les quasi-doublons** : vingt-deux questions posent le même fait avec la même réponse qu'une voisine (le brouillard quatre fois, le plomb et l'aluminium trois fois, le calcul du volume plongé trois fois, 200 g + 1,8 g deux fois).
4. **Les leurres absurdes** (« Le temps s'arrête de s'écouler », « Elle double », « sur une carte », « la couleur du lait ») et les calculs déguisés (« 10 000 seaux », « combien sont liquides ? ») : six questions.

Aucune question de thème n'existait avant l'audit. Après application : 7 sur 42 pour physique-s02-1, 8 sur 36 pour physique-s05-1, 3 sur 37 pour physique-s08-1, 2 sur 41 pour physique-s03-1, 1 sur 38 pour physique-s04-1 ; aucune dans physique-s01-1 et physique-s06-1.

## Bilan par cours

| Cours | Avant | Gardées | Retouches | Réécrites | Thème | Supprimées | Après | Part thème | Mince ? |
|---|---|---|---|---|---|---|---|---|---|
| physique-s01-1 – Séance 1, les états de la matière | 49 | 43 | 0 | 1 | 0 | 5 | 44 | 0 % | non |
| physique-s02-1 – Séance 2, le cycle de l'eau | 50 | 34 | 1 | 0 | 7 | 8 | 42 | 17 % | fiches f5 et f6 |
| physique-s03-1 – Séance 3, la masse et le volume | 46 | 36 | 2 | 1 | 2 | 5 | 41 | 5 % | non |
| physique-s04-1 – Séance 4, mélange et dissolution | 43 | 28 | 4 | 5 | 1 | 5 | 38 | 3 % | fiche f4 |
| physique-s05-1 – Séance 5, caractéristiques des changements d'état | 37 | 23 | 2 | 3 | 8 | 1 | 36 | 22 % | oui (fiches f1 et f4) |
| physique-s06-1 – Séance 6, volume et masse au cours du changement d'état | 48 | 45 | 0 | 0 | 0 | 3 | 45 | 0 % | non |
| physique-s08-1 – Séance 1 du chapitre 2, les acides et les bases | 41 | 28 | 2 | 4 | 3 | 4 | 37 | 8 % | fiche f1 |
| Total | 314 | 237 | 11 | 14 | 21 | 31 | 283 | 7 % | |

« Gardées » = gardées telles quelles ; « Retouches » = gardées avec une retouche de forme notée dans `piste` (un leurre, un début d'énoncé qui renvoyait au TP).

## Cours et fiches minces

Pour toute la physique, seul le **corrigé** du livret 1 est déposé, pas le livret de cours lui-même (dit dans le nonCouvert de chaque cours). Les fiches tiennent quand même, parce que le corrigé des exercices redit l'essentiel de la leçon. Trois endroits font exception :

- **physique-s05-1** (Caractéristiques des changements d'état) : le cours le plus mince. Le corrigé de la séance tient en cinq lignes et un graphique. La fiche f1 (« Vaporisation puis fusion dans un ballon ») ne décrit que le déroulé du TP : cinq de ses six questions deviennent des questions de thème sur la vaporisation (évaporation et ébullition, le linge qui sèche, l'eau qui bout à 100 °C). La fiche f4 (« Lire le graphique ») en reçoit deux (température de fusion d'un corps pur, qui ne dépend pas de la quantité), la fiche f5 une (le sel sur les routes). Besoin : 8 questions de thème sur 36 (22 %), sous la moitié, donc pas d'entrée « cours-mince ».
- **physique-s02-1, fiches f5 et f6** : la fiche f5 (« L'eau, indispensable au corps ») repose sur une remarque du corrigé (les liquides sans eau de l'expérience sont des poisons) et six questions tournaient autour ; quatre deviennent des questions de thème sur l'eau et le corps (part d'eau du corps, pertes quotidiennes, boissons et aliments, quelques jours sans boire). Le cours s'appelle « Le cycle de l'eau » et le corrigé ne décrit pas le cycle : trois questions de thème le comblent (formation des nuages en f3, évaporation par le Soleil et glace comme réserve d'eau douce en f6). Besoin : 7 sur 42 (17 %).
- **physique-s08-1, fiche f1** (« Fabriquer un papier pH ») : un protocole en photos. Trois questions de thème comblent ce que le nonCouvert signale comme manquant (indicateur coloré, pH-mètre, échelle de 0 à 14) : 3 sur 37 (8 %).
- **physique-s04-1, fiche f4** (solubilité) : un tableau de huit lignes ; quatre questions sont réécrites depuis la fiche en formulations générales et une devient une question de thème (le sucre se dissout mieux dans l'eau chaude). Deux questions de thème sur les conversions (1 L = 1 000 cm³ ; tonne, kilogramme, gramme) comblent deux manques notés dans physique-s03-1.

Les cours physique-s01-1, physique-s03-1 et physique-s06-1 ne sont pas minces : le corrigé donne largement de quoi poser sept questions par fiche.

## Anti-spoil (devoir 1, cours s01-1 à s10-1)

Le devoir 1 (énoncé seul déposé) demande les définitions des trois états, la comparaison des températures de fusion et de solidification de l'eau pure, la définition des acides et des bases par le pH, la densité de l'huile (fiole, 90 g), un graphique de fusion de la glace (titre, axes, états en 1, 2, 3, durée), l'eau de chaux, la séparation du sel et de l'eau, « miscible », la définition de la solubilité et de la solution.

- Aucune question du jeu ne reprend un document, un chiffre ou une tournure propre au devoir (huile, fiole jaugée, eau de chaux, points 1-2-3 du graphique, chimie et industrie) ; le contrôle 9 du validateur passe sans erreur.
- Les pistes de thème évitent : la définition de la solubilité « par litre », les mots « miscible » et « solution », la définition de la densité, l'évaporation pour séparer le sel, les dangers des acides et des bases (séance 2 du chapitre), la valeur de la température de fusion de l'eau et la durée d'un palier sur un graphique.
- **À signaler à Romain** : trois fiches portent sur un fait que le devoir demande aussi, parce que c'est la leçon elle-même, telle que le corrigé la redit : les propriétés des trois états (physique-s01-1), « fusion et solidification de l'eau pure ont lieu à la même température, 0 °C » (physique-s05-1, fiche f3, question 5f du devoir), « acide : pH inférieur à 7, basique : supérieur à 7 » (physique-s08-1, fiche f3, question 8 du devoir). L'audit les garde : ce sont les notions centrales des fiches et retirer la leçon viderait les cours. Si Romain préfère, elles peuvent être mises en sommeil jusqu'au devoir (semaine 12).

## Garde-fous vérifiés

Après les suppressions, chaque fiche garde au moins cinq questions écrites (physique-s04-1-f5 en garde cinq, toutes les autres six ou plus), au moins un vrai/faux et au moins une question en « pourquoi » ou « comment » (vérifié fiche par fiche, en comptant les réécritures et les pistes de thème prévues : s01-1-q26, s02-1-q37 et q45, s04-1-q26 et q27, s05-1-q1, q6, q23, q27 et q31). Les identifiants sont conservés pour toute question réécrite ou remplacée (même fiche, même famille de type) ; aucune fiche ne bouge.

## Sources envisagées pour les questions de thème

Vikidia (Nuage, Eau, Cycle de l'eau), Wikipédia (Déshydratation, Eau douce, Litre, Tonne, Solubilité, Ébullition, Vaporisation, Évaporation, Changement d'état, Point de fusion, Sel de déneigement, Indicateur de pH, pH-mètre, Potentiel hydrogène). Chaque fait est à vérifier sur la page citée au moment de la réécriture ; les adresses sont données dans le JSON. Les thèmes sont écrits comme le planning les nomme (jeu/data/planning.js) : « Séance 2 – Le cycle de l’eau », « Séance 3 – La masse et le volume », « Séance 4 – Mélange et dissolution », « Séance 5 – Caractéristiques des changements d'état », « Séance 1 – Les acides et les bases ».

## Contrôles au moment de l'audit

node atelier/outils/valider.js : 0 erreur, 5 alertes (les « [5] source absente » connues des PDF de géographie). node atelier/outils/tests.js : 347 réussis, 0 en échec. Aucun fichier de contenu, de jeu ou de documentation n'a été modifié par l'audit.

## Application (28/10/2026)

Tous les verdicts ont été appliqués dans atelier/contenu/physique-*.js et recompilés dans jeu/data/cours/ : 31 suppressions, 14 réécritures, 21 questions de thème, 11 retouches ; 283 questions, dont 21 de thème. Écarts avec les pistes de l’audit, tous dans l’esprit de la grille :

- Sources : Vikidia (Nuage, Eau, Cycle de l’eau) refuse les requêtes depuis le poste de travail ; les pages Wikipédia de même nom ont servi. La page Wikipédia « Déshydratation » n’est qu’une page d’homonymie : les quatre faits sur l’eau et le corps (65 % du corps d’un adulte, deux à cinq jours sans boire, pertes par l’urine, la sueur et la respiration, apports par les boissons et les aliments) viennent de la page « Eau ». La page « Solubilité » ne cite pas le sucre : physique-s04-1-q27 cite « Saccharose » (la solubilité du sucre augmente avec la température).
- physique-s02-1-q21 : les corrections proposées ont été changées pour qu’une seule soit juste (« plusieurs semaines sans manger, mais pas sans boire » était vraie aussi).
- physique-s05-1-q3 posée en FAUX (« l’ébullition est la seule façon pour un liquide de devenir un gaz ») plutôt qu’en VRAI, pour qu’elle demande quelque chose ; physique-s03-1-q36 de même (« une tonne vaut cent kilogrammes », FAUX).
- physique-s05-1-q26 : la page « Point de fusion » définit la température de fusion comme une propriété du corps pur à pression donnée, changée par toute impureté, sans écrire mot pour mot qu’elle ne dépend pas de la quantité ; à comparer au livret.
- physique-s03-1-q32 : « 1 L = 1 000 cm³ » se déduit de la page « Litre » (litre = décimètre cube, millilitre = centimètre cube).
- Niveaux des 21 questions de thème : 5 de niveau 1, 11 de niveau 2, 5 de niveau 3 ; types : 12 QCM, 7 vrai/faux, 1 QCM à plusieurs réponses, 1 association.
- physique-s08-1-q11 (association réécrite) : colonne de droite réordonnée pour que la réponse [1, 2] ne soit plus lue comme le nombre « 1,2 » du devoir 1 par l’anti-spoil du validateur.

Contrôles après application : node atelier/outils/valider.js : 0 erreur, 8 alertes (les 5 « [5] source absente » de géographie et 3 « [9] svt-s01-2-q20 contient 23 », hors physique) ; node atelier/outils/tests.js : 351 réussis, 0 en échec ; node atelier/outils/mesurer-tirage.js --familles : part de la physique entre 14,6 et 16,4 % selon le scénario.

## Relecture critique (28/10/2026)

Seconde lecture, après l’application : les 66 questions changées ou ajoutées rouvertes une par une, toutes les questions restantes des cours minces (physique-s02-1, s05-1, s08-1) et des cours s03-1 et s04-1 relues, les 16 pages Wikipédia citées ouvertes (chaque nombre vérifié : 65 % d’eau dans le corps, 2 à 5 jours sans boire, environ 69 % de l’eau douce gelée, 1 L = 1 dm³, 1 t = 1 000 kg, pH 0 à 14, ébullition de l’eau vers 100 °C), et une vérification à part des suites de 12 mots communes avec ces pages. Dix-sept retouches, sans changer un identifiant, une fiche ni un nombre de questions : leurres enfantins remplacés (physique-s02-1 q37, q45, q48, q50 ; physique-s05-1 q3, q6, q23 ; physique-s06-1 q39), énoncés détachés du document (physique-s05-1 q24, q25 ; physique-s08-1 q2, q10, q14), deux quasi-doublons déplacés (physique-s04-1 q24 : le sel au fond rend le mélange hétérogène ; physique-s08-1 q4 : le mot « indicateur coloré »), une explication qui recopiait treize mots de la page « Saccharose » réécrite (physique-s04-1 q27), une source citée sous le vrai titre de sa page (physique-s05-1 q31 : « Fondant routier »). Niveaux des questions de thème après relecture : 5 / 11 / 5 ; bonne réponse la plus longue dans 8 % des QCM. Fiche de relecture pour Romain : atelier/relecture/questions-theme-physique.md. Contrôles : valider.js 0 erreur, 5 alertes connues ; tests.js 351 réussis, 0 en échec.
