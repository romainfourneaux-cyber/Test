# Audit des questions d'histoire (25/10/2026)

Relecture des 415 questions des 12 cours d'histoire (atelier/contenu/histoire-*.js), avec la grille atelier/relecture/grille-audit-questions.md. Le détail, question par question, est dans audit-questions-histoire.json (106 entrées : tout ce qui n'est pas gardé tel quel). Appliqué le 28/10/2026 dans les fichiers de contenu et recompilé (376 questions, 42 de thème) ; les écarts avec les pistes sont notés dans docs/JOURNAL.md.

## Résumé

- 415 questions relues : 317 gardées (dont 8 avec une retouche de forme), 17 à réécrire depuis la fiche, 42 à remplacer par une question de thème, 39 à supprimer.
- Après application : 376 questions, dont 42 de thème (11 %). Aucun cours ne dépasse la moitié : pas d'entrée « cours-mince » dans le fichier d'audit.
- Les cours 1, 2, 6, 7, 8 (études de cas) sont solides : presque tout est gardé. Les cours 3, 4, 9, 10 et 11 sont minces (un tableau à remplir, une frise, une image) : c'est là que vont la plupart des questions de thème.
- Les catégories les plus fréquentes : calculs sur la frise (« combien d'années… », avec l'indice « fais la soustraction ») : 24 questions ; questions sur le document plutôt que sur le savoir (« sur la carte », « d'après la frise », légende, couleur d'un manteau, lieu de conservation) : 38 ; doublons : 15 ; leurres absurdes : 5.

## Bilan par cours

| Cours | Avant | Gardées | Retouches | Réécrites | Thème | Supprimées | Après | Part thème | Mince ? |
|---|---|---|---|---|---|---|---|---|---|
| histoire-s01-1 – Cours 1, Empire byzantin | 41 | 37 | 0 | 1 | 2 | 1 | 40 | 5 % | non |
| histoire-s01-2 – Cours 2, Empire carolingien | 42 | 38 | 0 | 0 | 3 | 1 | 41 | 7 % | non |
| histoire-s02-1 – Cours 3, christianisme Orient/Occident | 30 | 24 | 0 | 0 | 3 | 3 | 27 | 11 % | oui (trois définitions et un tableau rempli en vidéo) |
| histoire-s03-1 – Cours 4, islam | 25 | 20 | 0 | 0 | 4 | 1 | 24 | 17 % | oui (une frise de sept dates) |
| histoire-s04-1 – Cours 5, Empire abbasside | 40 | 22 | 0 | 8 | 5 | 5 | 35 | 14 % | en partie (fiches f3 et f5) |
| histoire-s04-3 – Cours 6, campagnes | 33 | 22 | 3 | 1 | 1 | 6 | 27 | 4 % | non |
| histoire-s05-1 – Cours 7, seigneurie | 35 | 23 | 1 | 4 | 3 | 4 | 31 | 10 % | non |
| histoire-s05-2 – Cours 8, études de cas 1 et 2 | 35 | 32 | 0 | 1 | 0 | 2 | 33 | 0 % | non |
| histoire-s06-1 – Cours 8, études de cas 3 et 4 | 37 | 37 | 0 | 0 | 0 | 0 | 37 | 0 % | non |
| histoire-s07-2 – Cours 9, féodaux et seigneurs | 29 | 17 | 1 | 0 | 8 | 3 | 26 | 31 % | oui (frise et quatre mots) |
| histoire-s08-1 – Cours 10, État royal | 37 | 21 | 3 | 0 | 9 | 4 | 33 | 27 % | oui (frise et trois questions) |
| histoire-s08-2 – Cours 11, étude de document | 31 | 16 | 0 | 2 | 4 | 9 | 22 | 18 % | oui (une seule image) |
| Total | 415 | 309 | 8 | 17 | 42 | 39 | 376 | 11 % | |

« Gardées » = gardées telles quelles ; « Retouches » = gardées avec une retouche de forme notée dans `piste`.

## Cours minces : ce qu'il leur faut

- Cours 3 (histoire-s02-1) : le support ne donne que trois mots (christianisation, schisme, théologie) ; le tableau comparatif est rempli en vidéo. 3 questions de thème proposées (deux empires chrétiens et leurs différences, christianisation de la Saxe, schisme de 1054). Faits institutionnels seulement, aucune doctrine : à faire valider par Romain.
- Cours 4 (histoire-s03-1) : une frise de sept dates, aucun mot défini. 4 questions de thème proposées (Hégire, calife, émirat devenu califat à Cordoue, Al-Andalus). Si Romain veut aller plus loin, deux ajouts possibles avec les numéros libres q26 et q27 : l'étendue de l'empire au VIIIe siècle (de l'Espagne à l'Indus) et la fondation de Bagdad par les Abbassides en 762. Le cours reste sur les faits politiques, géographiques et culturels.
- Cours 5 (histoire-s04-1) : la fiche f3 n'est qu'une carte, la fiche f5 un extrait religieux. Les questions de croyance et de règle (révélation, jeûne du malade) sont retirées ; les remplacements restent culturels (langue du Coran, minaret) ou géopolitiques (bataille du Yarmouk, Cordoue).
- Cours 9 (histoire-s07-2) : une frise et quatre mots. 8 questions de thème (adversaires et fin de la guerre de Cent Ans, Hugues Capet et les Capétiens, grands duchés et comtés, Guillaume le Conquérant). Part de thème : 31 %, sous le plafond.
- Cours 10 (histoire-s08-1) : une frise et trois questions sans réponse. 9 questions de thème (agrandissement du domaine royal, Bouvines, Louis IX, Philippe le Bel, guerre de Cent Ans, Jeanne d'Arc). Part : 27 %.
- Cours 11 (histoire-s08-2) : une seule enluminure. 9 questions de détail d'image ou de légende supprimées ; 4 questions de thème (qui est Édouard Ier, pourquoi il rend hommage, la fleur de lys, les Grandes Chroniques de France). Part : 18 %.

## Garde-fous à respecter en appliquant

- Anti-spoil. Périmètre à relire avant d'écrire : atelier/devoirs/histoire-d1.md et l'extraction « Hist-5e Devoir n1 (texte du Drive).txt » (définitions de vilain, vassal, fief, domaine royal ; cérémonie de l'hommage et ce que reçoit le vassal ; deux parties de la seigneurie ; impôts et obligations du paysan ; transformations des campagnes au XIe siècle ; trois techniques nouvelles ; moyens du seigneur pour se faire obéir ; équipement et mode de vie du chevalier), le test de la séance 8 (assolement triennal, château fort, herse) et le test de la séance 11 (description de l'hommage ; sacre à Reims, roi au manteau à fleurs de lys, onction). Les pistes évitent ces sujets : pas de définition de vassal, fief ou domaine royal ; pas d'étape de l'hommage ; pas d'assolement triennal ; pas de sacre ; rien sur les chevaliers. Les pistes marquées « vérifier » (s05-1-q8, s05-1-q29, s07-2-q25, s08-1-q3, s08-2-q14) sont à relire avec ce périmètre sous les yeux.
- Religion : le cours sur l'islam reste sur le politique, le géographique et le culturel ; le cours 3 ne pose que des faits d'institution datés (capitales, chef, langue, schisme de 1054), sans croyance.
- Conflits : camps nommés comme puissances politiques (armée du califat / armée byzantine, roi de France / roi d'Angleterre, coalition d'Otton IV), ton neutre, aucun nom inventé.
- Le cours place Jeanne d'Arc en 1428 : aucune question de thème ne date Orléans ni ne contredit cette date.
- Les adresses des sources sont des propositions : vérifier le fait sur la page au moment d'écrire la question, puis noter `source: { theme, titre, editeur, url }` sans fichier ni page.
- Identifiants : une question remplacée garde son id (même fiche, même famille de type) ; un id supprimé n'est pas réutilisé ; un ajout prend le numéro libre suivant.
- Après application : `node atelier/outils/compiler-cours.js <cours>` pour chaque cours touché, puis valider.js, tests.js et mesurer-tirage.js --familles ; une ligne au journal ; les questions de thème listées à Romain dans la fiche de relecture (`node atelier/outils/lister-questions.js histoire --theme`).

## Vérifications faites par chaque fiche après application

Chaque fiche touchée garde au moins trois questions, au moins une vrai_faux et au moins une question en « pourquoi » ou « comment » (les pistes de thème sont formulées pour cela quand la fiche en manquait : s02-1-f1, s03-1-f1, s04-1-f3, s07-2-f1, s07-2-f2, s08-1-f3, s08-2-f2, s08-2-f3). Les fiches les plus allégées : s05-1-f4 (5 questions), s04-3-f4 (5), s04-1-f3 (6), s04-1-f5 (6).
