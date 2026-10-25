# Audit des questions de géographie (25/10/2026)

Demande de Romain du 25/10/2026 : retirer les questions bizarres et, quand le cours déposé est trop mince, poser une question de thème. Grille : atelier/relecture/grille-audit-questions.md. Détail question par question : atelier/relecture/audit-questions-geographie.json (une entrée par question qui n'est pas gardée telle quelle, plus cinq « garder » avec retouche).

## Résumé

362 questions relues dans les neuf cours de géographie (semaines 1 à 8).

| Verdict | Nombre |
|---|---|
| garder | 311 (dont 5 avec une retouche notée) |
| réécrire depuis la fiche | 12 |
| remplacer par une question de thème | 19 |
| supprimer | 20 |

Les questions de géographie sont, dans l'ensemble, de vraies questions de cours : définitions, causes et conséquences, comparaisons Nord/Sud, lecture de chiffres-clés. Les défauts trouvés se concentrent sur trois points :

1. **Le cours geographie-s01-1 (présentation du programme)** : la seule source déposée est le tableau de progression. Presque la moitié des questions portent sur la mise en page du livret (lettres P et V, nombre de devoirs, ordre des séances, nombre d'études de cas). Seize questions sont à remplacer par des questions de thème : les outils du géographe (carte, légende, échelle, planisphère, croquis) pour la fiche f1, et le fond des trois thèmes de l'année (démographie, population des continents, ressources renouvelables ou non, eau douce, risque naturel et technologique, cyclone, changement global) pour les fiches f2 à f4.
2. **Les questions sur le document** (« sur le graphique », « sur la carte », « la ligne tracée », « ce témoignage », « décrit par l'infirmière ») dans les études de cas sur l'Inde, l'outil 9 et l'éducation : neuf réécrites depuis la fiche, trois remplacées par des questions de thème (la fiche du dispensaire de brousse repose sur un seul témoignage), quatre supprimées.
3. **Les chiffres à deviner et les calculs** (densité de Mumbai, personnes en EHPAD, écoles attaquées, « 100 kilos × 3 », « 30 millions ÷ 5 millions ») et une douzaine de quasi-doublons.

Aucune question de thème n'existait avant l'audit. Après application : 16 sur 36 pour geographie-s01-1 (44 %, sous la moitié), 3 sur 41 pour geographie-s08-1 ; aucune ailleurs.

## Cours minces

- **geographie-s01-1** (Présentation du programme et regarder les outils du géographe) : mince. Le dépôt ne contient que le tableau de progression ; la fiche « Les outils du géographe » n'est pas déposée (dit dans nonCouvert). Besoin : 16 questions de thème sur 36 (reste sous la moitié, donc pas d'entrée « cours-mince » dans le fichier JSON ; si le réécrivain juge d'autres questions de structure sans intérêt, par exemple q7, q26 ou q28, il peut aller jusqu'à 18 sur 36 sans dépasser le plafond). Les fiches gardent leurs identifiants ; pour f1, dont la notion est l'organisation de l'année, les questions de thème prennent l'angle « outils du géographe » que porte le titre du cours.
- **geographie-s08-1-f5** (le dispensaire de brousse) : fiche mince, pas le cours. Trois questions de thème sur l'accès aux soins dans les pays pauvres (3 sur 41 pour le cours).
- Les sept autres cours ne sont pas minces : leur livret donne largement de quoi poser sept questions par fiche.

## Points à signaler à Romain

- geographie-s04-1-q1 : le livret place l'Inde au deuxième rang derrière la Chine ; dans les faits, l'Inde est passée devant en 2023. La question reste conforme au livret ; à voir avec lui.
- Les PDF « Geo 5e - Theme 1 - Cours 1.pdf » (cités par geographie-s01-2, s02-2 et s03-1) et « Geo 5e - Theme 1 - Cours 2.pdf » (cités par geographie-s07-1 et s08-1) ne sont pas dans DEPOT/cours/geographie/ aujourd'hui : ce sont les cinq alertes « [5] source absente » connues du validateur. L'audit ne change rien à ce point ; les réécritures depuis la fiche gardent la source de la fiche.
- geographie-s04-1-q19 est supprimée aussi parce que sa réponse est la définition du taux de fécondité, demandée telle quelle dans le devoir n° 1 (partie A).

## Anti-spoil (devoir n° 1, cours s01-1 à s04-1)

Les pistes de thème évitent les repères du devoir : pas de liste des pays les plus peuplés (la question de thème sur la population classe des continents), pas de définition de la croissance démographique, de la natalité, de la fécondité ou du bidonville, pas de chiffre de population mondiale, pas de seuil de renouvellement.

## Garde-fous vérifiés

Après les suppressions, chaque fiche garde au moins cinq questions écrites, au moins un vrai/faux et une question en « pourquoi » ou « comment » (les pistes de thème des fiches f1 à f4 de s01-1 en prévoient une par fiche : q3, q26, q29, q35).

## Sources envisagées pour les questions de thème

Vikidia (Carte géographique, Planisphère, Géographie, Démographie, Énergie fossile, Cyclone tropical), Wikipédia (Échelle (cartographie), Population mondiale, Eau douce, Risque naturel, Risque technologique, Changement global, Chaîne du froid, Pays les moins avancés), Lumni ou eduscol (croquis de géographie), OMS (densité de médecins). Chaque fait est à vérifier sur la page citée au moment de la réécriture ; les adresses sont données dans le JSON.
