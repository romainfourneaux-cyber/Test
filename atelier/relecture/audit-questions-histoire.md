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

## Relecture critique du 28/10/2026 (après application)

Toutes les questions modifiées et toutes les questions restantes des cours minces ont été relues ; les 37 pages Wikipédia citées ont été ouvertes (toutes les dates et tous les nombres vérifiés) et comparées aux textes des questions : aucune suite de douze mots reprise. Corrections faites dans les sources en clair, puis recompilées :

- histoire-s03-1-q13 : l'explication disait que l'émir de Cordoue « reconnaît en principe le calife de Bagdad » ; la page dit l'inverse : émirat indépendant depuis 756, seule l'autorité religieuse de Bagdad restait reconnue, et 929 y met fin. Réécrite.
- histoire-s04-3-q6 : « au moins un Européen sur trois » devient « environ un Européen sur trois, parfois plus » (la page donne 30 à 60 %).
- histoire-s04-1-q36 : le minaret ne portait pas sur la notion de la fiche f5 (le texte sur le ramadan). Remplacée, même identifiant, par un vrai/faux de thème : « Le ramadan est le premier mois de l'année du calendrier hégirien » → faux, c'est le neuvième (Wikipédia « Ramadan »). Fait de calendrier, sans croyance.
- histoire-s07-2-q26 : « lequel est un grand comté ? → la Flandre » faisait doublon avec l'association q30 (Flandre, Champagne : comtés ; Normandie, Aquitaine : duchés). Remplacée, même identifiant, par une question de thème sur le peu de pouvoir du roi vers l'an mil face aux grands ducs et comtes (Wikipédia « Hugues Capet » : le duc de Normandie et le comte d'Anjou plus riches en terres et en hommes que le roi, le duc d'Aquitaine libre loin de Paris). Aucune définition de vassal, de fief ni de domaine royal (devoir 1, A).
- histoire-s08-2-q12 supprimée : quatrième question sur « Philippe assis, Édouard à genoux » (q11, q13, q27). Identifiant non réutilisé ; entrée ajoutée au fichier d'audit.
- Précisions : s03-1-q20 (les premiers califes ne gouvernent pas depuis Damas : « les Omeyyades depuis Damas, puis les Abbassides depuis Bagdad »), s04-1-q3 (le bon choix commence par « C'est » comme les trois leurres, sinon il se repérait à sa forme), s04-1-q22 (sans « pour de bon » : la page rappelle le retour byzantin en Syrie du Nord au Xe siècle), s05-1-q18 (« une abbaye ou une cathédrale », ce que cite la page, et non « une ville »), s07-2-q8 (« entrecoupée de trêves », pas « de longues trêves »), s08-2-q14 (la page date l'hommage de 1286 sans le situer à Paris : « à Paris » retiré), s03-1-q4 (banque du texte à trou : Hégire, Omeyyade, Abbasside à la place de Justinien, Clovis, Constantin, absurdes comme autres noms de Mohamed), s04-1-q23 (indice sans « la carte »).
- Vérifié sans changement : s01-1-q26 (Théodose, dernier empereur de tout l'empire, partage de 395 entre ses deux fils), s01-2-q5 (751, 768), s01-2-q26 (après 806), s01-2-q41 (789 ; la lisibilité de la caroline est confirmée par la page « Minuscule caroline »), s02-1-q23 (772-804, conversion imposée), s02-1-q27 (1054), s03-1-q3 (622), s04-1-q3 (762, Al-Mansur, près d'un million d'habitants, Maison de la sagesse), s04-1-q12 (756, 929), s04-1-q22 (août 636), s04-1-q37, s05-1-q8, s05-1-q29, s07-2-q8 et q10 (Valois, Plantagenêts, Calais), s07-2-q16, q17 et q19 (Senlis, Adalbéron de Reims, Noël 987, 996), s07-2-q28 (14 octobre 1066, Noël 1066), s07-2-q30 (les six pairs laïcs), s08-1-q3 (1204, Poitiers 1204, Loches et Chinon 1205), s08-1-q8, s08-1-q11 et q13 (Otton IV, comtes de Flandre et de Boulogne, Jean sans Terre), s08-1-q26 (légistes), s08-1-q27 (chêne de Vincennes, enquêteurs de 1247), s08-1-q32 (1328, Philippe VI, Édouard III), s08-1-q33 et q36 (Orléans, Compiègne, vente aux Anglais), s08-2-q30 (Saint-Denis, Primat, XIIIe siècle), s08-2-q16 (1272-1307), s08-2-q21 (Louis VII, XIIe siècle).

Bilan après relecture : 375 questions, 42 de thème (11 %), part maximale 31 % (histoire-s07-2). Fiche pour Romain : atelier/relecture/questions-theme-histoire.md.
