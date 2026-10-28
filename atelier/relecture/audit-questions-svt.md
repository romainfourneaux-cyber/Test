# Audit des questions de SVT (28/10/2026)

Demande de Romain du 25/10/2026 : retirer les questions bizarres et, quand le cours déposé est trop mince, poser une question de thème. Grille : atelier/relecture/grille-audit-questions.md. Détail question par question : atelier/relecture/audit-questions-svt.json (une entrée par question qui n'est pas gardée telle quelle, plus quinze « garder » avec une retouche notée).

## Résumé

434 questions relues dans les douze cours de SVT (semaines 1 à 8, livret 1). Aucune fiche bonus n'a de question.

| Verdict | Nombre |
|---|---|
| garder | 325 (dont 15 avec une retouche notée) |
| réécrire depuis la fiche | 24 |
| remplacer par une question de thème | 48 |
| supprimer | 37 |

Les cours de SVT ont une particularité : aucune leçon du livret n'est déposée, seulement le corrigé des exercices, les ressources complémentaires et une carte muette. Les fiches ont donc souvent été tirées d'un exercice (un graphique, un tableau, un TP, une carte de pollens, une simulation), et c'est là que se trouvent les questions bizarres. Quatre familles reviennent :

1. **Les questions sur le document** (« sur le graphique », « dans le tableau », « de quelle couleur », « dans l'exemple de la Réunion », « combien de lignes », « que montre le trait jaune ») : surtout dans svt-s02-2 (fiche du tableau à double entrée), svt-s05-1 (graphique des cycles glaciaires, cartes de pollens, sept nains), svt-s04-2 (le « territoire inconnu ») et svt-s06-1 (le tableau des cyclones). Quand le fait est bon, la question est réécrite sans le document ; quand il n'y a que le document, elle devient une question de thème ou disparaît.
2. **Les manipulations récitées** (couleur du colorant, bac de glaçons, tube du bas, quart d'heure de mélange) dans svt-s04-1 et le TP du globe éclairé de svt-s02-1 : on garde la conclusion (le chaud monte, le froid et le sel descendent, la même lumière s'étale vers les pôles), on retire le protocole.
3. **Les calculs et les chiffres à deviner** (85 − 50, 1993 − 1855, 31 % + 29 %, 20 % → 72°, graduations du graphique, « divisé par 25 », durées de rotation à la minute près, températures exactes des planètes).
4. **Deux fiches de méthode sans savoir de SVT** : « Faire des fiches de révision » (svt-s01-2-f5, huit questions sur la couleur des titres et le décalage d'un carreau) et « Du graphique au tableau à double entrée » (svt-s02-2-f4, huit questions sur la mise en page d'un tableau). Les fiches gardent leur identifiant ; leurs questions deviennent des questions de thème sur le titre du cours (les axes de la Terre ; l'effet de serre), comme l'audit de géographie l'a fait pour geographie-s01-1-f1.

Les leurres enfantins signalés par Romain (« Exactement 5 % », « Un type de nuage », « Un bateau à vapeur », « Quelle est la couleur du ciel ? », « L'interdiction des cyclones ») sont notés en retouche sur des questions gardées.

Aucune question de thème n'existait avant l'audit. Après application : 48 questions de thème sur 397, réparties ainsi (part après suppression) : svt-s02-2 11 sur 27 (41 %), svt-s01-2 8 sur 38 (21 %), svt-s04-1 5 sur 26 (19 %), svt-s03-1 6 sur 35 (17 %), svt-s04-2 4 sur 27 (15 %), svt-s06-1 4 sur 26 (15 %), svt-s02-1 3 sur 42, svt-s05-1 2 sur 31, svt-s08-1 2 sur 37, svt-s08-2 2 sur 36, svt-s05-2 1 sur 27, svt-s01-1 aucune. Tous les cours restent sous la moitié : pas d'entrée « cours-mince » dans le JSON.

## Cours minces

« Mince » au sens de la grille : le dépôt ne donne pas de quoi poser sept vraies questions par fiche.

| Cours | Mince ? | Questions de thème à écrire | Pourquoi |
|---|---|---|---|
| svt-s01-1 (la Terre dans le système solaire) | non | 0 | Fiche modèle du corrigé et ressources suffisent. |
| svt-s01-2 (les axes de la Terre) | une fiche (f5) | 8 sur 38 | f5 est une méthode de révision ; le non-couvert (inclinaison et saisons, durée de la révolution) fournit l'angle. |
| svt-s02-1 (les lignes imaginaires) | une fiche (f4) | 3 sur 42 | Le TP du globe éclairé n'a pas sa conclusion dans le corrigé : l'angle est l'énergie reçue selon la latitude. |
| svt-s02-2 (les effets de serre) | **oui, le plus mince** | 11 sur 27 (41 %) | Le thème annoncé, l'effet de serre, n'est nulle part dans le dépôt ; le corrigé ne porte que l'histoire de l'atmosphère, les températures des planètes et la mise en forme d'un tableau. Reste sous la moitié ; si le réécrivain écarte aussi q1 ou q19 (courbe de la vapeur d'eau), ne pas dépasser 13 sur 27. |
| svt-s03-1 (distinguer météorologie et climatologie) | deux fiches (f2, f5) | 6 sur 35 | Le graphique de l'atmosphère et la frise de l'histoire de la météo ne donnent que des calculs ; la distinction météo/climat elle-même reste hors jeu (voir anti-spoil). |
| svt-s04-1 (vents et courants) | oui (f2, f3) | 5 sur 26 | La leçon est une vidéo non déposée ; deux fiches sur quatre ne décrivent qu'un montage. Angle : courants marins, Gulf Stream, pourquoi l'eau froide et salée plonge. |
| svt-s04-2 (les grands climats aujourd'hui) | une fiche (f1) | 4 sur 27 | Un seul exercice (le territoire inconnu) ; la liste des grands climats n'est pas déposée. |
| svt-s05-1 (cycles climatiques du quaternaire) | non | 2 sur 31 | Corrigé riche, mais beaucoup de lecture de graphique à retirer (huit suppressions). |
| svt-s05-2 (notion de risque) | non | 1 sur 27 | Les notions (aléa, enjeux, vulnérabilité, risque) sont bien dans le corrigé. |
| svt-s06-1 (les risques climatiques) | oui | 4 sur 26 | Le corrigé n'a pas d'exercice pour cette séance : tout repose sur l'exemple de la Réunion de la séance 5. Angle : canicule, sécheresse, formation d'un cyclone, nom des cyclones. Le réécrivain peut aller jusqu'à 6 ou 7 s'il juge q2 ou q7 redondantes avec svt-s05-2. |
| svt-s08-1 (environnement, biomes, sol) | non | 2 sur 37 | Carte mentale et ressources suffisent ; deux questions de thème complètent la liste des biomes (taïga). |
| svt-s08-2 (sols et ressources naturelles) | non | 2 sur 36 | Corrigé suffisant ; deux questions de thème disent ce qu'est une énergie renouvelable (non couvert). |

## Points à signaler à Romain

- Le devoir 1 de SVT demande les définitions de planète tellurique, planète gazeuse, risque, enjeu et la différence aléa/danger. Ce sont aussi le cœur des cours svt-s01-1 et svt-s05-2 : les questions existantes qui les posent ont été gardées (le validateur ne relève aucune phrase ni aucun chiffre repris du devoir), mais aucune question de thème nouvelle ne les touche. La différence entre météorologie et climatologie, titre du cours svt-s03-1 et question du devoir, reste volontairement hors jeu.
- svt-s02-1-q12 : le crépuscule est court à l'équateur « parce que le Soleil y est au zénith chaque jour ». C'est ce que disent les ressources, mais le Soleil n'est au zénith à l'équateur que deux fois par an (il en est proche toute l'année). Question gardée telle quelle ; à voir dans le livret.
- svt-s04-1 : les ressources écrivent « 35 % » de sel pour l'eau de mer (déjà dans non couvert) ; la valeur réelle est d'environ 35 g par litre, soit 3,5 %. Aucune question ne reprend le chiffre des ressources ; la retouche de svt-s08-1-q32 propose « Environ 3,5 %, comme la mer » comme leurre.
- Deux fiches gardent leur titre dans le codex alors que leurs questions changent de sujet : svt-s01-2-f5 « Des fiches pour réviser » (questions de thème sur les axes de la Terre) et svt-s02-2-f4 « Ranger les données d'un graphique » (questions de thème sur l'effet de serre). La grille interdit de toucher aux fiches ; si cela gêne, Romain peut demander un titre de fiche plus large.
- Vikidia n'était pas joignable depuis l'environnement de l'audit (défi anti-robot) ; les pages Wikipédia de même titre existent (vérifié pour chacune). À la réécriture, vérifier chaque fait sur la page citée, ou prendre la page Wikipédia de même nom.

## Anti-spoil (devoir 1, cours svt-s01-1 à svt-s06-1)

Les pistes de thème évitent les cibles du devoir : pas de définition de la météorologie, de la climatologie, de la paléoclimatologie, du risque, de l'aléa, du danger ou de l'enjeu ; pas d'instrument de mesure ni d'unité ; pas de schéma des positions de la Terre avec le début des saisons par hémisphère ; pas de diagramme ombrothermique à construire ; pas de pluies sur la Côte d'Azur. Les questions sur les saisons (svt-s01-2-f5) portent sur la cause (inclinaison, pas la distance au Soleil) et sur la durée de la révolution, pas sur les positions. La question « sur combien d'années calcule-t-on un climat » (svt-s03-1-q39) ne reprend ni la définition ni les années du devoir.

## Garde-fous vérifiés

Après les suppressions, chaque fiche garde au moins cinq questions (minimum atteint par svt-s02-1-f4, svt-s02-2-f1, svt-s04-1-f3, svt-s05-1-f2 et svt-s05-1-f4), au moins un vrai/faux et une question en « pourquoi » ou « comment » ; le détail est dans les champs raison du JSON. Deux remplacements changent de famille de type et prennent donc un nouvel identifiant : svt-s02-2-q12 (association → QCM) et svt-s04-1-q14 (ordre → QCM) ; les anciens numéros ne sont pas réutilisés. Les autres questions de thème gardent l'identifiant et la famille de la question remplacée.

Contrôles lancés sans modification des données : validateur 0 erreur, 5 alertes connues (« [5] source absente » des PDF de géographie) ; tests 347 réussis, 0 échec.

## Sources envisagées pour les questions de thème

Vikidia (Saison, Année, Année bissextile, Lune, Effet de serre, Réchauffement climatique, Vénus (planète), Atmosphère terrestre, Courant marin, Gulf Stream, Climat, Climat équatorial, Climat tropical, Cyclone tropical, Sécheresse, Taïga, Biome, Énergie renouvelable), Wikipédia (Rotation de la Terre, Obliquité, Effet de serre, Gaz à effet de serre, Atmosphère terrestre, Origine de l'eau sur la Terre, Grande Oxydation, Couche d'ozone, Troposphère, Météorologie, Prévision numérique du temps, Normale climatique, Courant marin, Circulation thermohaline, Climat de la France, Zone climatique, Carotte de glace, Holocène, Risque naturel, Canicule, Cyclone tropical). Les adresses précises sont dans le JSON ; chaque fait est à vérifier sur la page citée au moment de la réécriture.
