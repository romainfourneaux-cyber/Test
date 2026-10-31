# Expéditions : conception finale (route des semaines, roguelite à la Hadès)

Document de conception arbitré le 24 octobre 2026 à partir des trois conceptions indépendantes du dossier (expeditions-hades.md, expeditions-mvp.md, expeditions-spire.md), relues contre le code et le contenu du jour (jeu 0.8.0, sauvegarde au schéma 5, tests Node, simulateurs). Rien de ce document n'est codé. Il remplace les trois documents comme référence pour les agents qui coderont ; les trois restent dans le dossier pour l'historique.

Il répond aux deux demandes de Romain du 16 octobre 2026 :

- « le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie » ;
- « intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles ».

## 0. Arbitrage

### 0.1 Notes des trois conceptions (sur 10)

| Critère | Hadès | MVP | Spire |
|---|---|---|---|
| Respect de CLAUDE.md et des buts d'apprentissage | 9 | 9 | 7,5 |
| Plaisir et « sensation Hadès » pour un élève de 13 ans | 9 | 6,5 | 8,5 |
| Faisabilité dans ce code (réutilisation, risque) | 7 | 9,5 | 6 |
| Netteté des nombres, testabilité | 9 | 9 | 7,5 |
| **Total sur 40** | **34** | **34** | **29,5** |

- **Hadès** : la plus complète et la plus fidèle à la demande (conseillers = dieux, faveurs à trois rangs, duos, Armorial, Serments, route des semaines avec relais, archives qui ramènent les semaines passées). Ses nombres sont écrits et testables. Faiblesses : l'escarmouche à une vague n'est pas mesurée, et son MVP demande déjà des options nouvelles du moteur (collision possible avec la revue du moteur en cours).
- **MVP** : la plus sûre et la mieux ancrée dans le code (numéros de ligne, esquisses, aucun changement du moteur, une demi-journée de mesure avant la première ligne, calcul de réussite d'une expédition entière, piège des bonus de campagne). Faiblesses : trop mince pour la « sensation Hadès » (6 faveurs à 2 rangs, 2 couches, 4 quartiers) et le départ libre perd le « on s'améliore de partie en partie ».
- **Spire** : les meilleures idées de variété (la troisième carte de faveur vient de la matière la moins jouée, les portes tournent entre les familles, la veillée du campement cible les notions à revoir, le chemin tranquille garanti, les phrases de l'éclaireur pour les modificateurs). Faiblesses : gardiens en attaque sur des camps de 7 à 10 points, non mesurés ; 4 rangs par acte et gardiens à 3 ou 4 vagues (42 à 59 minutes) ; compagnons de route admis dans le quota (les 396 questions d'anglais noieraient la semaine) ; un élite « tenu » coûte un vivre ; des rencontres où l'on paie pour éviter des questions.

### 0.2 Ce que la version finale retient

**Base : la conception Hadès**, construite dans l'ordre et avec la discipline de la conception MVP (jour de mesure, MVP sans changement du moteur, accroches facultatives relues ligne à ligne, calcul de réussite), et greffée des idées de Spire listées ci-dessous.

Pris dans MVP : le plan en étapes avec un jour 0 de mesure (`--vagues`, `--pvRival`, `--mode`) ; les six faveurs du MVP qui passent toutes par des options que `M.creer` lit déjà (aucun changement du moteur avant l'étape 2) ; la règle des semaines minces par élargissement de la fenêtre de l'acte (le quota reste 2 sur 3 plus longtemps) ; `jouerEvenement(ev, contexte)` ; le piège des bonus de campagne ; l'esquisse de `quota` ; le calcul de réussite d'une expédition et ses leviers ; les cinq vérifications pour Romain.

Pris dans Spire : la troisième carte de faveur vient de la famille de matières la moins jouée de l'expédition ; dans une semaine, les portes de faveur tournent entre les familles ; le bivouac propose le repos **ou** la veillée (3 questions qui ciblent d'abord les notions à revoir) ; un bivouac garanti avant chaque gardien ; un chemin tranquille garanti ; la phrase de l'éclaireur pour chaque modificateur d'élite ; l'or de route restant converti en renommée (1 pour 5) au lieu d'être perdu ; l'événement « le tournoi du bourg » ; la prime de profondeur est déjà dans le barème de renommée de Hadès (renommée qui porte le numéro de la semaine).

Écarté, avec la raison : départ libre (MVP) : remplacé par les relais de Hadès, plus un réglage `relaisLibres` ; 2 couches (MVP) : 3, réglables (`couches`) ; escarmouche à 2 vagues (MVP) : 1 vague, à confirmer au jour 0 ; gardiens en attaque (Spire) : le mode défense est le seul déjà réglé pour « inquiéter un peu » ; 4 rangs et gardiens à 3 ou 4 vagues (Spire) : trop long ; compagnons de route dans le quota (Spire) : non, ils viennent par la troisième question ; « tenu » qui coûte un vivre (Spire) : non, tenir est une réussite ; reliques (Spire) : trois d'entre elles sont déjà des faveurs ou des quartiers (Trompe de guet = Parlementaire, Sceau de plomb = Ballade consolante, Lanterne = duo Veillée), le reste viendra plus tard s'il manque de variété ; or de route perdu au retour (Hadès, MVP) : converti ; « 1 sur 3 sur S−1 et S » pour les semaines minces (Hadès) : remplacé par la fenêtre élargie.

### 0.3 L'état du code dont ce document dépend (24 octobre 2026)

- Jeu 0.8.0, `SCHEMA = 5` (jeu/js/sauvegarde.js), migrations 1 → 5 ; le numéro 6 est libre (vérifier le jour de la livraison).
- Contenu indexé (jeu/data/index-cours.js) : semaines 1 à 3 du planning, 5 fiches méthode, 3 cours de grammaire du Griffon de cuivre, 3 séquences d'anglais (≈ 1 585 questions jouables). **Frontière d'aujourd'hui : S3.** Fichiers présents mais pas encore indexés dans jeu/data/cours (chantier « semaines 4 à 8 », qui bouge chaque jour) : S4 : 6 cours (histoire 2, géographie 1, SVT 2, physique 1), S5 : 5, S6 : 3, S7 : 2, S8 : 7. Dès qu'index-cours.js les listera, la frontière passera à S8, la semaine du calendrier.
- Le chantier « semaine visible dans les questions » n'a rien livré : aucun `semaineDe`, aucun `.recit-semaine` dans jeu/js. Ce document fixe le contrat partagé (6.4) ; expedition.js porte un repli.
- Tirage unique : `JEU.recit.suite(nombre, { types, exclure, filtre, completer })` (recit.js ligne 230), qui appelle `tirage()` → `JEU.leitner.tirer` (équilibre des familles sur `historique`, priorités à revoir, fenêtre de 60, repos des fiches), puis `JEU.rappels.placer` et `eviterTriples`. En bataille : `JEU.questions.avecNiveaux(NIVEAUX_BATAILLE, …)`. Pas d'option `quota`.
- Moteur (jeu/js/bataille-moteur.js) : `creer(carte, options)` lit `vagues, orDepart, pvChateau, pvRival, pvRivalMax, niveau, bonusDegats, arsenal, orParReponse, orPerduErreur, espion, defense` ; `defense` marche sur n'importe quelle carte ; table `RIVAL` à cinq lignes réglée le 16/10 ; décisions du rival sans hasard ; `repondre(p, juste)` pour l'or ; le champion sort à la dernière vague quel que soit leur nombre.
- Rendu (jeu/js/bataille.js) : `tirerQuestions(n, posees)` ligne 1631, `lancer(lieu)` ligne 1643 (un seul paramètre), `C.options(niveau)` ligne 1682, `nouvellesDuFront` ligne 1926, `preparation` ligne 1944 (tirage du lot de la vague), `JEU.recit.cadre(q, defense ? "defense" : "preparation", adv)` ligne 2000, `lancerVague` ligne 2052, `JEU.partie.surQuitter` ligne 2218, `bilan()` ligne 2223 (appelle `C.apresBataille`), `retour()` ligne 2262. Boutons de vitesse ×1, ×2, ×3 (`v.vitesse`).
- Campagne (jeu/js/campagne.js) : `options(niveau)` ajoute `c.bonus.or` et lit `c.bonus.espion` ; `apresBataille` vide `c.bonus` ; `jouerEvenement()` sans paramètre (ligne 528) ; `reagir` **n'est pas exporté** ; exportés : `rivalDe, souverain, monterRivalite, noter, prochaineProvince, missiveAvantBataille, prendreMissives, EVENEMENTS, GAINS_RIVALITE, province, front, campDe`.
- Écran de campagne : grille `grille-jeux` (lignes 444 à 463), `medaillon`, `medaillonHeraldique(camp, generique)` (tortil pour « un seigneur rival »), `sceau(camp)`, `ouvrirMissive`, `lancerBataille`. Sprites : `lieu-brume`, `lieu-france`, `fond-campagne`.
- Interface : `ui.poserQuestion(q, zone, fini, options)` ligne 244 (`options.recit`), `ui.recit(r)` ligne 281 (portrait, nom, étiquette, texte), `ui.panneauErreur(q, zone, suite)` vers la ligne 480, `ui.commencerPartie` ligne 506, `ui.clavier`.
- Personnages : Clovis, Pépin le Bref, Charlemagne (seuils 0, 3, 6) ; « Le roi d'Angleterre » et « L'émir de Cordoue » en titre seul ; six conseillers dans `JEU.recit.CONSEILLERS`.
- Mesures du journal (16/10/2026, Décisions) dont dépendent les nombres : défense du domaine (3 vagues, place 12, coups aux murs doublés) tenue 77 / 73 / 81 / 76 / 81 % aux niveaux 0 à 4 à p = 0,7 (86 à 91 % à p = 0,8 ; 54 à 74 % à p = 0,6) ; coups portés à la première bataille d'attaque (4 vagues) à p = 0,7 : 12,6 / 8,9 / 9,1 / 14,7 / 6,8 ; les tirs des tours rivales comptent par paliers (1,534 ; 1,725).
- Simulateurs : atelier/outils/simuler-bataille.js (joueur scripté, 80 graines, `--regle`, `--comparer`, `--strategies`, `PROGRESSION[niveau]`), mesurer-tirage.js (élèves simulés, six séances), tests.js, perf.js (Playwright).

**Note du 24 octobre 2026, à la livraison de l'étape 1.** Ce document reste la référence ; voici ce qui a été construit autrement, ou en plus, et où le lire. Le code fait foi : jeu/js/expedition.js, jeu/js/ecran-expedition.js, les accroches de recit.js, interface.js, campagne.js, bataille.js, progression.js et ecran-campagne.js, jeu/js/sauvegarde.js, jeu/data/config.js.

- **Jour 0 et réglage** (atelier/conception/expeditions-mesures.md, blocs V7 et R6) : l'escarmouche se joue à **2 vagues** et 6 questions, camp de 6 (5.1, 7.2, 12 et l'annexe A disent 1 vague et 3 questions : à une vague, le camp ne tombait jamais au niveau 0 ni au niveau 4) ; le **Grand Gardien joue à la ligne de la semaine, sans + 1** (7.2, 15.2, annexe A : avec + 1, 20 % de tenue en S8 sur le Gué) ; `EXP.HALTES` porte ces nombres avec l'or de route par halte (escarmouche 10 ou 20, embuscade 20 ou 35, gardiens 25). La cible d'expédition S6 → S8 de 17.3 est révisée à 65 à 85 % et **n'est pas atteinte** (99,6 % : trop facile ; aucun levier du MVP ne l'y ramène sans casser S1 → S3, qui tient toutes ses cibles : 84 % à 7 sur 10 avec 3 vivres). Levier gardé pour l'étape 2 : la table fine par semaine. Deux autres écarts mesurés : l'anglais fait 7 à 12 % des questions de route (décision 10 de la section 2), le tirage avec quota prend 7,5 ms en médiane sur la machine de mesure (3 visés ; au début d'une vague, jamais entre deux questions). La durée estimée affichée au départ suit la formule du jeu (`dureeEstimee`) : environ 33 minutes à ×1 pour trois semaines, 13 pour une (12 dit 40).
- **Semaine visible** : ce chantier a livré avant l'expédition. `JEU.progression.semaineDe` existe ; `cadre()` porte déjà le repère « Semaine 4 · Histoire · Cours 5 » (`.recit-repere`, sur la ligne du nom du conseiller) ; le ruban `.recit-semaine` de 6.4 est devenu une classe de relief posée sur ce repère quand la question vient de la fenêtre de l'acte, avec le titre du cours en infobulle. Le contexte de cadre de la halte trésor (étape 2) s'appelle `cache` : `tresor` est déjà le contexte du conseil pour la jauge Trésor. L'éclaireur dit la semaine une vague sur deux, en carte de récit avant la première question.
- **Frontière** : S8 depuis le 24/10 (les semaines 4 à 8 sont indexées, et toutes « pleines » : 14 à 44 fiches candidates ; la fenêtre élargie, le demi-quota et la semaine sautée ne sont exercés que par tests.js).
- **Génération (4.2)** : les chemins entre deux couches sont un **escalier monotone** tiré à la graine (`escalier`), pas la règle de distance ≤ 0,5 de l'étape 4, qui créait des croisements au sens de G7 ; la correction G3 (la voisine de l'embuscade) reste. Un relais qui tombe sur une semaine sans cours est ramené à la première semaine ouverte qui suit. Les archives garanties (G8) sont la dernière halte de la 1re couche de la 2e semaine (ou de la seule). La route enregistre en plus `sautees`, chaque acte `fiches`, `cas` et `essais` (21 et `secours: true` pour la semaine de secours), chaque gardien `semaine`, `carte` et `suivants` ; `carteGrand` vient de la prochaine province du front.
- **État (13)** : `vivresMax` = réglage + Vivres de route + Simples au rang rare, 5 au plus ; la renommée est **créditée tout de suite** au disponible et au total (finir n'ajoute que la prime d'expédition accomplie, l'or restant et la Bannière) ; `records[relais]` compte aussi `accomplie` ; `compte` a `parMatiere` ; `etal[halte]` a `achetes` ; `offre` reçoit `question: true` et `eclatante` de l'écran ; `optionsBataille` est sans effet de bord, le plan et l'espion de route sont consommés par `apresBataille` ; `completer` ne clôt pas une expédition à 0 vivre (c'est `reprendre()` qui le fait à l'ouverture de l'écran) ; la porte du Grand Gardien existe dans la route mais n'est pas offerte (l'expédition finit sur sa victoire, les faveurs sont rendues) ; une porte simple est payée même si les murs cèdent ; au MVP chaque conseiller n'a qu'une faveur, la deuxième carte d'une porte vient donc de la deuxième famille la moins jouée (la troisième reste la moins jouée, jamais celle de la porte). Détail de ces choix : docs/JOURNAL.md, Décisions du 24/10 (logique).
- **Écran (14)** : les fenêtres des haltes (porte, bivouac, marchand, Armorial, bilan, page de semaine) sont des panneaux dessinés dans l'écran de la route, pas des boîtes modales (une porte ne se ferme jamais par Échap et se choisit au clavier) ; les batailles et les événements restent des parties. Les sceaux des semaines franchies sur le parchemin de l'année sont à la cire bleue de France (le front n'est pas enregistré). Le gardien de semaine n'a pas de missive ; le défi du Grand Gardien passe par `JEU.ecranCampagne.defiAvantRoute`, pour que les missives ne viennent que de l'écran de campagne. La page de semaine revient à chaque arrivée sur la route au départ d'une semaine, donc après une réouverture. Les noms des haltes alternent au-dessus et au-dessous des médaillons, avec des noms courts pour les événements. Le clavier livré est dans `JEU.ecranExpedition.CLAVIER` (départ : Entrée, ← →, 1 2, A, Échap ; route : 1 2 3, flèches, Entrée, F, Échap ; porte : 1 à 4, ← →, Entrée ; bivouac : 1, 2, Échap ; marchand : 1 à 4, Entrée ou Échap ; Armorial : 1 à 5 ; bilan : Entrée, Échap). Détail : docs/JOURNAL.md, Décisions du 24/10 (écran).
- **Outils (17)** : pas de `simuler-expedition.js` (étape 2) : la convolution de 17.3 est intégrée à `simuler-bataille.js --expedition`, qui joue les quatre nœuds avec les options exactes de `optionsBataille` et retente les gardiens ; `mesurer-tirage.js --expedition` charge les modules hors bac à sable et tous les fichiers de cours ; perf.js joue le passage d'expédition de 17.6 en 1366 × 768 et 1920 × 1080 (variable PARTIE=expedition pour ne jouer que lui) ; `atelier/outils/essai-expedition.js` reste l'essai de bout en bout avec captures (atelier/captures/expedition-*.png). tests.js : 345 réussis le 24/10.
- **Documentation** : docs/CAHIER_DES_CHARGES.md v6 (section 5, « La route des semaines (Expéditions) »), docs/FORMAT_DONNEES.md (schéma 6 champ par champ, règles de réparation, config, simulateurs), docs/JOURNAL.md (entrées du 24/10 et Décisions).

## 1. En deux mots

Une **expédition** est une partie à part, lancée depuis la carte de campagne, de 30 à 40 minutes, qu'on quitte et reprend à tout moment entre deux haltes. On part d'un **relais** (une semaine du programme) et on traverse **trois semaines de suite**, une par **acte**. Chaque semaine est une petite carte à embranchements sur un parchemin : trois **couches** de deux ou trois **haltes** (escarmouche, embuscade, événement, marchand, bivouac, trésor, archives), on en joue une par couche, puis le **Gardien de la semaine**. La dernière semaine se ferme sur le **Grand Gardien** : le rival du front, en personne.

- Chaque halte pose des questions par le tirage habituel du jeu, avec une règle de plus : **deux questions sur trois viennent des cours de la semaine traversée**, la troisième du tirage ordinaire (toutes semaines, équilibre des familles, priorités « à revoir », Seconde chance). On voit les semaines défiler ; les anciennes reviennent quand même, et les haltes « archives » les ramènent au premier plan.
- Les réponses paient tout : l'or du conseil de guerre comme aujourd'hui, l'**or de route** (le marchand), le droit de choisir une **faveur** (les dons des six conseillers, un par famille de matières, pour l'expédition seulement).
- La **renommée** reste pour toujours : elle paie l'**Armorial**, qui rend chaque expédition suivante un peu plus facile. La défaite (plus de **vivres**) renvoie au domaine avec la renommée gagnée. Rien n'est jamais retiré au royaume : ni province, ni bâtiment, ni ressource, ni jauge, ni cours.
- La difficulté monte avec la semaine traversée (le réglage du seigneur rival suit la semaine comme il suit aujourd'hui le niveau de la province) et, dans chaque semaine, de la première halte au gardien. Partir plus loin dans l'année rapporte plus de renommée.

## 2. Ce que les règles imposent, et ce qui est tranché

| Règle (CLAUDE.md, cahier des charges) | Dans les expéditions |
|---|---|
| Jamais de chrono | Aucune horloge, aucun compte à rebours. La route a des « haltes restantes », jamais un temps. La durée estimée de l'écran de départ informe, elle ne limite rien. |
| Difficulté réglée pour 7 réussites sur 10 | Le tirage des niveaux de questions ne change pas (niveau conseillé ; batailles aux niveaux 1 à 3 ; le reste aux niveaux 1 et 2). La difficulté du mode porte sur la bataille (réglage du rival par semaine, vagues, solidité), jamais sur les questions. |
| Une erreur ne coûte ni bâtiment, ni province, ni ressource ; en bataille, un peu d'or de la bataille | Inchangé : −6 or de la bataille en cours, jamais sous zéro. Les **vivres** sont créés au départ et rendus au retour ; on en perd un quand les murs cèdent dans une bataille de route, **jamais pour une question**, jamais pour un événement. |
| Seconde chance | Inchangée : la file des rappels traverse les haltes comme elle traverse batailles, conseils et événements. |
| Un cours s'ouvre dès que son fichier existe ; le calendrier ne bloque rien | **Frontière** = la dernière semaine du planning qui a au moins un cours chargé. La semaine du calendrier est affichée (bannière « Cette semaine »), elle ne verrouille rien. Les relais n'enferment aucun cours : tout cours ouvert reste jouable partout (campagne, conseil, événements), et toutes les semaines ouvertes viennent par la troisième question et les archives. |
| Un cours pas encore ouvert reste dans la brume | Au-delà de la frontière : nappes de brume, numéro de semaine et titres du planning (déjà visibles dans l'écran Cours), ni question, ni aperçu, ni gardien nommé. |
| Chaque question est posée dans le récit | Nouvelles phrases de cadre pour la route (6.4), avec la semaine dite par le conseiller. L'énoncé ne change jamais. |
| Style Total War, enluminure, héraldique | Parchemin d'itinéraire à la manière de la Table de Peutinger et de l'itinéraire de Matthew Paris : route horizontale, vignettes, lettrines rubriquées, médaillons héraldiques, nappes de brume existantes (section 14). |
| Conflits : camps politiques, ton neutre ; adversaires du cours, sinon « un seigneur rival » | Le Gardien d'une semaine est « un seigneur rival » du camp du front (médaillon au tortil, sans nom ni visage). Le Grand Gardien est le rival du front de personnages.js (en titre seul aujourd'hui). Aucun nom inventé, aucune figure religieuse, aucun lieu de culte, ni dans les haltes, ni dans les événements, ni dans les textes de faveurs. |
| Bonus jamais en bataille ni en boss | Le tirage les exclut déjà (contrôle 6 du validateur). |
| Pas d'épreuve de validation | Un gardien vaincu ne change ni suivi.js, ni l'état d'un cours : il vaut de la renommée, un relais et un sceau de jeu sur le parchemin de l'année. |
| Contenu des cours uniquement depuis les fichiers déposés | Les textes de route (phrases de cadre, faveurs, événements, pages de semaine, titres, bilan) sont des textes de jeu sans fait de cours, soumis aux interdits des répliques de personnages.js (ni chiffre de cours, ni religion, ni insulte, ni nom d'un personnage dans la bouche d'un rival). |
| Moins de 100 ms entre une réponse et la question suivante | Faveurs, Armorial et Serments sont résolus une fois, en options de `M.creer`. Le quota de semaine ajoute un passage de `tirage()` au début d'une vague ou d'une halte, jamais entre deux questions. La route n'est jamais redessinée pendant une partie. |
| Sauvegarde avec schéma et migration sans perte | Schéma 6, bloc `expedition`, complété par `JEU.expedition.completer`. |

Décisions prises faute d'arbitrage dans le cahier des charges (à reporter dans docs/JOURNAL.md, rubrique Décisions, à la livraison) :

1. **Une expédition = 3 semaines** (2 ou 1 si la frontière est plus proche), 3 couches par semaine, pour tenir 30 à 40 minutes en deux séances. `config.expedition.semaines` et `couches` se règlent sans code.
2. **Les relais** sont S1, la semaine qui suit chaque semaine franchie (gardien vaincu, pour toujours), **et toujours le tronçon de l'année en cours** (max(1, frontière − 2)). On ne repart pas toujours de la semaine 1 comme dans Hadès : l'élève doit pouvoir réviser ce qu'il travaille sans rejouer septembre. Le défaut proposé est le relais ouvert le plus élevé. `config.expedition.relaisLibres: true` ouvre toutes les semaines si Romain le préfère.
3. **La défaite vient des vivres** (3 au départ), perdus un par bataille où les murs cèdent, jamais par une question ni un événement. Un gardien raté se retente tant qu'il reste des vivres, et les coups qu'on lui a portés restent.
4. **Les faveurs se méritent par une question** du conseiller qui les offre : juste, trois faveurs au choix ; fausse, deux. Jamais de porte vide, jamais de faveur imposée.
5. **Rien de permanent ne vient des faveurs.** La renommée et l'Armorial sont la seule progression entre deux expéditions. Les ressources du domaine gagnées par bonne réponse (règle générale de `enregistrerReponse`) restent acquises partout : même une expédition perdue fait grandir le domaine.
6. **Embuscades, gardiens et Grand Gardien se jouent en défense** (mode `defense` du moteur : troupes d'assaut, coups aux murs doublés), **les escarmouches en attaque**. En attaque, le rival ne fait presque jamais céder tes murs : les vivres n'auraient d'enjeu nulle part. Le mode défense est déjà réglé pour « inquiéter un peu ». L'escarmouche garde l'attaque pour son enjeu propre, la victoire éclatante (le camp de route tombe), qui double la porte.
7. **La route ne consomme rien de la campagne** : les bonus de l'événement du jour (mercenaires, espion) restent pour la prochaine bataille de campagne ; la route a son propre plan de bataille et son propre espion.
8. **Fermer le jeu pendant une bataille de route après sa première vague** compte comme une retraite (−1 vivre), comme un « Quitter » en cours de bataille ; avant la première vague, rien. C'est le plus simple, et cela empêche d'annuler une vague qui tourne mal en fermant la fenêtre.
9. **L'or de route restant** devient de la renommée (1 pour 5) au bilan : rien n'est jeté, et l'élève n'a pas à comprendre qu'une monnaie disparaît.
10. **Les compagnons de route** (grammaire, anglais, fiches méthode, qui n'ont pas de semaine) ne sont pas dans le quota de semaine : ils viennent par la troisième question, à leur part dans l'équilibre des familles.

## 3. La route des semaines

### 3.1 Vocabulaire

- **Expédition** : une partie du mode (un « run »). **Relais** : la semaine de départ. **Acte** : une semaine traversée (3 couches puis un gardien). **Couche** : une rangée de 2 ou 3 haltes ; on en joue une. **Halte** : un nœud de la route. **Porte** : la récompense annoncée sur une halte de bataille.
- **Gardien de la semaine** : la bataille qui ferme la semaine (défense d'un camp de route, 2 vagues). **Grand Gardien** : celle qui ferme l'expédition (3 vagues, le rival du front).
- **Frontière** : la dernière semaine ouverte. **Fenêtre d'un acte** : la ou les semaines d'où viennent ses questions de quota (sa semaine, élargie en arrière si elle est mince). **Compagnons de route** : les cours sans semaine (grammaire, anglais, méthode).
- **Vivres** : les « vies » de l'expédition. **Or de route** : sa monnaie (le marchand). **Faveurs** : les dons des conseillers, pour l'expédition seulement. **Renommée** : la monnaie permanente. **Armorial** : les améliorations permanentes. **Serments** (étape 3) : la difficulté facultative, mesurée en **ardeur**.

### 3.2 Semaine d'un cours, frontière, relais, brume

- **Semaine d'un cours** : `JEU.progression.semaineDe(coursId)` = la semaine de son entrée du planning ; `null` pour un cours de langue, une fiche méthode ou une séquence d'anglais. À partager avec le chantier « semaine visible » ; repli identique dans expedition.js tant qu'il n'existe pas.
- **Frontière** : `JEU.expedition.frontiere()` = la plus grande semaine parmi `JEU.progression.coursAccessibles()` dont l'entrée du planning est de type cours. Aujourd'hui 3 ; 8 dès que les semaines 4 à 8 seront indexées. Aucun cours : la carte de campagne ne propose pas le mode (« La route attend tes premiers cours »).
- **Relais ouverts** : `{1} ∪ {w + 1 : w ∈ franchies} ∪ {max(1, frontière − 2)}`, bornés à la frontière et dédoublonnés ; avec `relaisLibres`, toutes les semaines de 1 à la frontière. Une expédition couvre les `semaines` (3) premières semaines **ouvertes** à partir du relais ; une semaine sans aucun cours chargé entre deux (trou dans les dépôts) n'est pas un acte : la route la saute et la page de semaine le dit (« Semaine 5 traversée sans halte : ses cours ne sont pas encore déposés »). Partir de la frontière donne une expédition d'une semaine, Grand Gardien direct.
- **Semaines franchies** : chaque semaine dont le gardien (ou le Grand Gardien) a été vaincu une fois, pour toujours ; scellée sur le parchemin de l'année (cire aux couleurs du front où on l'a franchie).
- **Brume** : au-delà de la frontière, la route montre le numéro de la semaine et les titres de ses cours du planning, rien d'autre. **Cette semaine** (calendrier) : une bannière plantée sur la semaine du jour ; si elle dépasse la frontière, elle est dans la brume, ce qui dit à l'élève que les cours arrivent. Après S34 : toutes les semaines restent jouables, aucune nouvelle n'arrive.

### 3.3 Les semaines minces (fenêtre de l'acte)

Avec le contenu du jour, S6 n'a que trois cours chargés et S7 deux ; S7 n'a d'ailleurs que trois cours au planning. Un quota de deux tiers sur une poignée de fiches ferait tourner les mêmes notions, et le repos des fiches ou la fenêtre anti-répétition le relâcherait de toute façon. Règle, calculée au départ de l'expédition pour chaque acte sur les **fiches candidates** (cours chargés, au moins une question jouable, `JEU.recit.candidats(filtreSemaine)`), et écrite dans la route (`route[i].semaines`, `route[i].quota`) pour qu'un dépôt en cours d'expédition ne change rien :

| Fiches candidates | Fenêtre de l'acte | Quota | Page de semaine |
|---|---|---|---|
| 12 et plus | la semaine seule | 2 sur 3 | « Les cours de la semaine 6 t'attendent sur la route. » |
| moins de 12, mais 12 et plus en élargissant à la semaine précédente, puis à celle d'avant (deux au plus) | S−1 et S, ou S−2 à S | 2 sur 3 sur la fenêtre | « La semaine 6 est encore mince sur les registres : la route repasse aussi par la semaine 5. » |
| 5 à 11 même élargie | la fenêtre élargie | 1 sur 3 | « Peu de cours déposés pour la semaine 6 : une question sur trois en vient, le reste vient de tout le royaume. » |
| moins de 5 | aucune | 0 (tirage ordinaire, étiquette de semaine quand même) | « La semaine 6 attend ses cours : la route puise dans tout le royaume. » |

Seuils dans `config.expedition` (`quotaPlein: 12`, `quotaDemi: 5`), contrôlés par `mesurer-tirage.js --expedition` (17.4). L'étiquette d'une question dit toujours **sa** semaine.

### 3.4 Forme de la route

Pour une expédition partant du relais S4 avec la frontière en S8 :

```
 S4 ──────────────────────────────────────┐   S5 ────────────────────────┐   S6 ──────────────────────────────┐
 [départ] ─┬─ halte ─┬─ halte ─┬─ halte ─┐│                              │                                    │
           ├─ halte ─┼─ halte ─┼─ halte ─┼┼─ GARDIEN S4 ─┬─ (3 couches dans la brume) ─ GARDIEN S5 ─┬─ (brume) ─ GRAND GARDIEN S6 ─ [retour]
           └─ halte ─┘         └─ halte ─┘│                              │
                                          S7, S8 : visibles plus loin sur le parchemin, hors de cette expédition ; S9 et au-delà : brume
```

- 3 couches par semaine ; 2 haltes (55 %) ou 3 (45 %) par couche ; chaque halte mène à 1 ou 2 haltes de la couche suivante, sans croisement ; toute halte est atteignable depuis le départ et mène au gardien. Haltes générées par semaine : 6 à 9 ; jouées : 3 + le gardien. Une expédition de 3 semaines : **12 nœuds joués** (9 haltes, 2 gardiens, 1 Grand Gardien).
- On voit les trois couches de la semaine en cours avec le type de chaque halte et sa porte ; les semaines suivantes de l'expédition sous une nappe de brume, leur gardien en silhouette ; au-delà de la frontière, la brume et le numéro de semaine.
- Cartes de bataille : les cinq tracés tournent avec la semaine, `["gue", "foret", "moulin", "col", "chateau"][(semaine − 1) % 5]`, variante sèche (`-sud`) vers l'Empire omeyyade (bataille.js la choisit d'après le camp). Le Grand Gardien attend sur la carte de la **prochaine province du front** (`C.prochaineProvince(front).province.carte`, sinon `chateau`) : il garde la place que tu convoites. Le moteur joue une défense sur n'importe quelle carte.

## 4. Génération procédurale et graine

### 4.1 Graine et déterminisme

- Graine : un entier 32 bits tiré au départ, `(Date.now() ^ (JEU.questions.posees().horloge * 2654435761)) >>> 0`, gardé dans la sauvegarde, affiché au bilan (« Graine 4F2A-9C01 »). Tirage à graine mulberry32 (celui des simulateurs, recopié dans expedition.js, exposé en `JEU.expedition.alea(graine)` ; `alea.entier(r, n)`, `alea.choisir(r, liste)`, `alea.melanger(r, liste)`, `alea.pondere(r, poids)`). Jamais `Math.random` dans la génération (un test le remplace par une fonction qui lève une erreur pendant `generer`).
- Déterministe par la graine : la route (nombre de haltes, types, chemins), les portes et leurs conseillers, les événements tirés, les modificateurs d'élite, l'étal du marchand, les offres de faveurs (dans l'ordre où on les demande : sous-graine `hash(graine, idHalte)`). **Pas** déterministe : les questions (tirage du jeu, qui suit l'état réel de l'élève) et le pas des figurines du moteur (ses décisions sont déjà sans hasard).
- La route est **écrite dans la sauvegarde** (moins de 3 Ko), jamais recalculée : une version future du générateur ne change pas une expédition en cours. Le générateur porte un numéro (`route.version`). La graine sert aux simulateurs et à reproduire un défaut signalé par Romain.

### 4.2 Algorithme (jeu/js/expedition.js, sans DOM)

```js
// generer(graine, { depart, semaines: [4, 5, 6], frontiere, front, fenetres: { 4: { semaines: [4], quota: 2 }, … },
//                   famillesChargees, famillesARevoir, armorial, config })
// → { version: 1, graine, front, depart, actes: [ { semaine, semaines, quota, carte, couches: [[halte…], [halte…], [halte…]],
//      gardien: { id, type: "gardien" | "grand", place: 12 | 16, vagues: 2 | 3, porte } } ] }
// halte : { id: "s4c2h1", couche, rang, type, suivants: [ids], porte?, conseiller?, ev?, modif?, etal? }
function generer(graine, p) {
  var rotation = tourniquet(alea(graine), p.famillesChargees);          // ordre des familles pour les portes de faveur
  return { version: 1, graine: graine, front: p.front, depart: p.depart, actes: p.semaines.map(function (s, a) {
    for (var essai = 0; essai < 20; essai++) {
      var r = alea(hash(graine, s, essai));                               // sous-graine : régénérer une semaine ne change pas les autres
      var acte = tirerActe(r, s, a, p, rotation);                         // étapes 1 à 7 ci-dessous
      if (verifier(acte, a === p.semaines.length - 1)) return acte;
    }
    return acteDeSecours(s, a, p);                                        // escarmouche + événement / marchand + embuscade / bivouac + escarmouche
  }) };
}
```

Étapes de `tirerActe`, toutes à la sous-graine, dans cet ordre :

1. **Fenêtre et quota** de l'acte (3.3), à partir des fiches candidates du moment.
2. **Taille des couches** : pour chaque couche, `n = r() < 0,45 ? 3 : 2`.
3. **Types** : tirés dans la table 4.3 ; dans une couche, au plus une halte de chaque type sauf les escarmouches (retirage, 10 fois au plus, puis escarmouche). Puis les corrections d'ordre fixe : pas de marchand → la halte la plus à droite de la 3e couche qui n'est pas un bivouac devient marchand (sinon de la 2e) ; pas de bivouac en 3e couche → la halte la plus à droite de la 3e couche qui n'est pas le marchand devient bivouac ; aucune escarmouche ni embuscade en 1re ou 2e couche → la halte la plus à gauche de la 1re couche devient escarmouche ; deux embuscades → la seconde devient escarmouche.
4. **Chemins**, sans croisement : couches lues de gauche à droite ; la halte `i` (sur `n1`) mène à la halte `j` (sur `n2`) quand `|i / (n1 − 1) − j / (n2 − 1)| ≤ 0,5` (une couche d'une seule halte compte 0,5) ; une halte sans chemin entrant ou sortant est reliée à sa voisine la plus proche (à égalité, la gauche) ; quand deux couches voisines ont 2 haltes chacune, une diagonale tirée à la graine s'ajoute (il y a toujours un choix) ; si une halte ne mène qu'à l'embuscade, on lui ajoute le chemin vers la voisine de l'embuscade. Le départ mène à toute la 1re couche ; toute la 3e couche mène au gardien. Les chemins ne vont qu'entre haltes voisines dans l'ordre : ils ne se croisent jamais.
5. **Portes** des escarmouches et embuscades (4.4) : genre tiré ; conseiller d'une porte de faveur pris dans la rotation des familles (jamais deux fois la même famille dans la semaine tant qu'il en reste une non proposée ; quand toutes ont été proposées, tirage pondéré : ×1 si la famille a des questions dans la fenêtre de l'acte, ×0,3 sinon, ×1,5 si elle a des notions à revoir ; l'interprète seulement si une séquence d'anglais est chargée). La porte du gardien : faveur rare garantie, conseiller suivant de la rotation.
6. **Contenu** : événement de chaque halte « événement » (rotation sans répétition dans l'expédition ; les archives garanties placées en 1re couche de la 2e semaine, ou de la seule semaine) ; modificateur d'élite de l'embuscade (7.3, étape 2) ; étal du marchand (8.6) ; carte de bataille de la semaine (3.4).
7. **Gardien** : `{ type: dernier acte ? "grand" : "gardien", place: 12 | 16, vagues: 2 | 3 }`.

`verifier(acte)` contrôle les garanties ci-dessous ; sinon essai suivant (graine + 1 pour cette semaine), vingt fois au plus, puis la semaine de secours fixe : le jeu ne bloque jamais.

### 4.3 Répartition des types et garanties

| Couche | Escarmouche | Embuscade | Événement | Marchand | Bivouac | Trésor | Archives |
|---|---|---|---|---|---|---|---|
| 1re | 55 % | 0 | 30 % | 0 | 0 | 5 % | 10 % |
| 2e | 35 % | 25 % | 15 % | 15 % | 0 | 10 % | 0 |
| 3e | 25 % | 0 | 20 % | 15 % | 40 % | 0 | 0 |

(Au MVP, trésor et archives « halte » n'existent pas encore : leurs parts vont à l'événement, et les archives sont un événement de route.)

Garanties par semaine : (G1) exactement un marchand, en 2e ou 3e couche ; (G2) au moins un bivouac en 3e couche (le repos avant le gardien) ; (G3) au plus une embuscade, jamais la seule halte atteignable depuis une halte de la couche d'avant ; (G4) au moins une escarmouche ou une embuscade en 1re ou 2e couche ; (G5) au plus une halte de chaque type par couche sauf les escarmouches, jamais deux haltes du même type côte à côte sauf escarmouches ; (G6) **un chemin tranquille** existe : du départ au gardien en passant par au plus une bataille (escarmouche ou embuscade) ; (G7) toute halte a un chemin entrant et un sortant, aucun croisement. Par expédition : (G8) au moins une halte d'archives (halte ou événement), (G9) au plus deux embuscades.

### 4.4 Les portes (récompense annoncée)

Chaque escarmouche et embuscade porte une récompense visible avant d'entrer, en petit écusson sur le médaillon ; le gardien annonce sa faveur rare.

| Porte | Part | Contenu | Éclatante (le camp de route tombe) |
|---|---|---|---|
| Faveur d'un conseiller | 55 % (100 % pour une embuscade, rare 50 % au lieu de 25 %) | Le médaillon du conseiller. Après la bataille, il pose une question de sa matière puis offre ses faveurs (8.5). | Une 4e carte au choix |
| Bourse | 25 % | +20 or de route | +40 |
| Parchemin de renommée | 10 % | +10 renommée tout de suite | +20 |
| Vivres | 10 % | +1 vivre ; au maximum, se change en 15 or de route | et +15 or de route |

Comme dans Hadès on choisit sa porte à la récompense ; ici la porte dit aussi quelle matière on va rencontrer : c'est le levier de variété le plus simple. La porte ne choisit jamais les questions de la bataille, qui restent au tirage. Porte scellée (étape 2) : une escarmouche sur six ; le conseiller propose un pari (« Trois réponses justes, sans faute, et je double mon don ») : trois justes, faveur rare garantie ; sinon la récompense simple. Jamais une perte.

## 5. Les haltes

### 5.1 Tableau

Durées à vitesse ×1 : 15 à 20 s par question, 50 s par vague ; les boutons ×2 et ×3 existent, la vitesse choisie est retenue d'une halte à l'autre (`enCours.vitesse`).

| Halte | Icône (Game-icons, déjà dans le jeu) | Ce qui se passe | Questions | Réussite | Échec | Durée |
|---|---|---|---|---|---|---|
| **Escarmouche** | assaut | Bataille d'**attaque**, 1 vague (2 si le jour 0 le demande, 16.1), sur la carte de la semaine, contre un camp de route (solidité 6), sans champion adverse. Conseil de guerre : 3 questions, on place, on lance. | 3 (niveaux 1 à 3) | Tenu : porte simple. **Éclatante** si le camp tombe : porte doublée | Murs cédés (très rare en attaque) : −1 vivre, porte simple quand même | 2,5 à 3 min |
| **Embuscade** (l'élite) | mercenaires | On vous tombe dessus : bataille de **défense** (troupes d'assaut, coups aux murs ×2), 2 vagues, camp adverse de solidité 10, champion à la 2e vague, ligne du rival + 1 au MVP, un modificateur d'élite à l'étape 2 (7.3). Toujours une porte de faveur. | 6 | Tenu : porte simple ; éclatante : doublée | Murs cédés : −1 vivre ; la halte est passée quand même, porte simple | 4,5 à 5 min |
| **Événement** | celle de l'événement | Un des cinq événements du jour rejoué sur la route avec des gains de route, ou un événement propre à la route (5.2). | 2 ou 3 (niveaux 1 et 2) | Selon l'événement, jamais de perte | — | 1 à 1,5 min |
| **Marchand** | marchand | Le maître d'œuvre tient l'étal. Une question de sa matière l'ouvre ; juste, les prix baissent de 20 %. Puis achats avec l'or de route (8.6). | 1 | — | — | 1 min |
| **Bivouac** | camp | Le ménestrel (ou le maître scribe) accueille la compagnie. Choix : **Repos** (+1 vivre, jusqu'au maximum, sinon +25 or de route) **ou Veillée** : 3 questions tirées d'abord dans les notions à revoir (quota « fiche à revoir »), +4 or de route chacune ; 3 sur 3 : affiner une faveur d'un rang (ou +25 or si aucune). | 0 ou 3 (niveaux 1 et 2) | — | — | 0,3 à 1,2 min |
| **Trésor** (étape 2) | tresor | La cache : 2 questions. Chaque bonne réponse ouvre un coffre (+25 or de route) ; les deux justes : une faveur rare au choix parmi deux à la place du second coffre. | 2 | — | — | 1 min |
| **Archives** | parchemin-plume | Un vieux scribe du bailli garde les registres : 3 questions tirées **avant** le relais (semaines < départ ; depuis le relais S1, les notions à revoir). Renommée doublée pour la halte, +2 or de route par bonne réponse. | 3 | — | — | 1 à 1,5 min |
| **Gardien de la semaine** | defi | **Défense** d'un camp fortifié, 2 vagues, ligne de la semaine, garnison +1 (étape 2), contre « un seigneur rival ». Tenu ou victoire (son camp de 12 points tombe ; les coups restent entre deux tentatives). Porte : faveur rare garantie. | 6 | Semaine franchie | Murs cédés : −1 vivre, on retente | 5 min |
| **Grand Gardien** | couronne (médaillon du rival) | Même règle, 3 vagues, ligne + 1 (plafond 4), camp de 16 points, sur la carte de la prochaine province du front ; étape 2 : une tour adverse de plus au départ, garnison +1, champion à chaque vague à partir de la 2e. Missive de défi du rival avant (une fois sur deux), réaction après. | 9 | Expédition accomplie | Murs cédés : −1 vivre, on retente | 7 min |

« Réussite » et « échec » ne parlent que des murs. Une question ratée coûte au plus 6 or de la bataille en cours, comme partout. Pourquoi deux batailles en défense qui se ressemblent : l'embuscade est un **choix** (une porte de faveur garantie contre un risque), le gardien un **passage obligé** qui se retente.

### 5.2 Événements de route

Les cinq événements du jour (`JEU.campagne.EVENEMENTS`) se rejouent sur la route par `jouerEvenement(ev, contexte)` : l'événement est passé en paramètre, l'événement du jour de la campagne n'est pas marqué fait, les questions viennent de `contexte.tirage(n)` (quota de l'acte), et `contexte.cloturer(id, bonnes, total)` applique le gain de route et rend la phrase du bilan, puis `contexte.retour()`. Les gains immédiats et sans conséquence sur la campagne restent ; ce qui visait « la prochaine bataille de campagne » devient « la prochaine bataille de route » :

| Événement | Gain de campagne (inchangé depuis la campagne) | Gain sur la route |
|---|---|---|
| Des marchands à la porte | 2 ressources par bonne réponse | identique, et +4 or de route par bonne réponse |
| Le défi du champion | 3 coups à une place forte | 3 coups au **gardien de la semaine** (`places[gardien] = max(1, … − 3)`) |
| Des mercenaires | +40 or à la prochaine bataille de campagne | +40 or à la prochaine bataille de route (`enCours.plan`) |
| Le feu au grenier | +1 Peuple par bonne réponse | identique, et +1 vivre si deux réponses justes (au maximum : +20 or de route) |
| Un espion démasqué | première vague adverse affaiblie | première vague affaiblie à la prochaine bataille de route (`enCours.espion`) |

Événements propres à la route (textes de jeu, sans contenu de cours, sans nom propre, sans lieu de culte ; 40 mots au plus par texte) :

- **Les archives** (le chroniqueur, MVP) : voir 5.1 ; c'est l'événement garanti de chaque expédition.
- **Le pont rompu** (la cartographe, étape 2) : 2 questions ; chaque bonne réponse rouvre un chemin : la couche suivante montre toutes ses portes, même celles qu'un Serment cache.
- **La meunière** (l'herboriste, étape 2) : 3 questions ; 2 justes sur 3 : +1 vivre (au maximum : +20 or de route).
- **Le colporteur** (l'interprète, étape 2) : 2 questions ; une bonne réponse : une faveur commune au choix parmi deux ; deux : parmi trois, dont une rare.
- **Le tournoi du bourg** (le ménestrel, étape 2 ; de Spire) : l'élève choisit une matière parmi les deux familles les moins jouées de l'expédition, puis 3 questions de cette famille (quota sur la famille) ; 2 sur 3 : faveur de ce conseiller parmi 2 ; 3 sur 3 : rare garantie. La variété se choisit et se paie.
- **Les registres du bailliage** (le chroniqueur, étape 2) : variante des archives, questions d'il y a au moins deux semaines ; renommée ×2.

Aucun événement ne propose de payer pour éviter des questions : les récompenses viennent des notions réussies.

## 6. Les questions dans l'expédition

### 6.1 Le tirage : deux questions de la semaine, une du royaume

Tout passe par `JEU.recit.suite`, le seul tirage du jeu, avec une option nouvelle, `quota` :

```js
// bataille de route, lot d'une vague (3 questions), comme tirerQuestions() de bataille.js
JEU.recit.suite(3, {
  exclure: ids, filtre: function (q) { return fiches.indexOf(q.fiche) < 0; }, completer: true,
  quota: { nombre: 2, filtre: function (q) { return acte.semaines.indexOf(JEU.expedition.semaineDe(q.cours)) >= 0; } }
});
```

Dans `suite()`, deux essais de plus en tête de la liste `essais`, plafonnés à `quota.nombre` questions : `[filtre ∧ quota.filtre, souple 0]` puis `[filtre ∧ quota.filtre, souple 1]` (sans le repos des fiches) ; le reste du lot vient des essais existants. Un seul `JEU.rappels.placer` et un seul `eviterTriples` à la fin : les Seconde chance gardent leur place et leur unicité. Esquisse en 15.2 ; une douzaine de lignes ; sans `quota`, résultat identique à aujourd'hui (test de régression).

- **Part visée** : 2 sur 3 dans chaque lot de bataille, 2 sur 3 dans un événement de 3 questions (1 sur 2 dans un événement de 2), 1 sur 1 pour la question d'un conseiller (porte, bivouac, marchand : le quota est alors sur **sa famille**, `JEU.recit.famille(q.matiere) === fam`, pas sur la semaine), 3 sur 3 pour les archives (semaines avant le départ) et la veillée (`JEU.progression.fichesARevoir`). Quand la fenêtre a peu de questions libres, `completer` et le tirage ordinaire font le reste : le tirage ne bloque jamais.
- **Équilibre des familles** : il continue sur l'historique commun (`recit.historique`, oubli 0,85), d'une halte à l'autre ; dans le quota, les familles candidates sont celles qui ont des cours dans la fenêtre ; sur l'expédition entière, chaque famille présente reste entre 12 et 30 % (mesure 17.4). « Jamais trois fois la même famille de suite » tient par `eviterTriples`. Les compagnons de route viennent par la troisième question, à leur part.
- **À revoir** : inchangé (×1,5 dans la matière et pour la famille), dans le quota comme hors quota. Les fiches de a-retravailler.js et des cours « à revoir » de suivi.js d'une semaine traversée ressortent donc davantage ; la veillée les cible ; les semaines 1 à 6, présumées acquises, sont des actes comme les autres et leur quota vient d'abord des notions dues et à revoir.
- **Anti-répétition** : inchangée (fenêtre de 60, repos des fiches, 10 et 15). Une expédition de 50 questions puise dans 1 585 questions ; une semaine pleine en a 200 à 360 : le quota ne force aucune répétition. Une semaine mince est élargie avant d'être tirée.
- **Niveaux** : batailles de route en `NIVEAUX_BATAILLE` (1 à 3, par `avecNiveaux`) ; événement, bivouac, marchand, archives, porte en 1 et 2 ; les Seconde chance suivent ces niveaux comme aujourd'hui.

### 6.2 Ce que les réponses rapportent

- En bataille : l'or du conseil de guerre par le moteur (`M.repondre` : +12, +10 au 3e succès d'affilée, −6 par erreur sur l'or de la bataille, jamais sous zéro), modifié par les faveurs (Annales, Ballade consolante…).
- Partout : 1 ressource du domaine par bonne réponse (règle générale), **+1 renommée par bonne réponse**, Leitner et Seconde chance.
- Aux portes : la question du conseiller décide de l'offre (3 faveurs ou 2). Au marchand : −20 % si juste. Au bivouac : la veillée paie en or de route et, sans faute, en affinage.
- Le compte de l'expédition (`enCours.compte`) garde les questions posées et les bonnes réponses par famille et par semaine : il sert à la troisième carte de faveur (la famille la moins jouée), aux faveurs d'érudition (étape 2), au bilan (« Tes meilleures matières sur cette route », « À relire ») et aux titres.

### 6.3 Ce qui ne change pas

Panneau d'erreur à deux phrases, « Voir la fiche », « Signaler une erreur », l'indice du mentor, les raccourcis 1 à 6, flèches, Entrée. Pendant le Grand Gardien, comme pour un boss du cahier des charges, « Voir la fiche » attend le bilan : option `sansFiche` de `panneauErreur` (quatrième paramètre `options`), et les fiches ratées sont listées au bilan sous « À relire », avec leur lien vers le Codex.

### 6.4 Le récit : la semaine se voit et s'entend

Trois endroits montrent la semaine, sans toucher à l'énoncé :

1. **Le cadre du récit** : `JEU.recit.cadre(q, contexte, camp, extra)` avec `extra.semaine` (la semaine de l'acte) ; contextes nouveaux `route` (conseil de guerre d'une escarmouche), `embuscade`, `gardien`, `bivouac`, `marchand`, `archives`, `porte`, `tresor` ; trois phrases au moins par contexte, la moitié nomment la semaine par `{S}`. Textes de jeu, sans fait de cours :
   - route : « {N} marche à tes côtés sur la route de la semaine {S}. « Avant la prochaine halte, seigneur, dis-moi ceci. » » ; « Les éclaireurs ont trouvé un camp à prendre. {N} te retient par la manche : « Une question, et je paie les hommes. » »
   - embuscade : « Des cris dans le bois : on vous tombe dessus ! {N} te tire par la manche : « Réponds, seigneur, et j'arme les chariots. » » (sans « vite » : aucun chrono)
   - gardien : « {N} regarde la tour du gardien se découper sur la colline. « Il garde la semaine {S}. Montre-lui que tu la connais. » »
   - bivouac : « Le camp est dressé. {N} déplie ses notes de la semaine {S} à la lueur du feu : « Une question, et je te laisse dormir. » »
   - marchand : « {N} ouvre son étal sur la place du bourg : « Une bonne réponse, et je fais un prix. » »
   - archives : « Un vieux scribe ouvre ses registres. {N} lui répond : « Mon seigneur se souvient des semaines passées. Écoute. » »
   - porte : « {N} t'attend à la sortie du camp, un présent sous le bras : « Ma faveur se mérite. Une question de mon art, seigneur. » »
   - Seconde chance : les phrases `PHRASES.rappel` existantes, inchangées.
2. **L'étiquette de semaine sur la question** (contrat partagé avec le chantier « semaine visible », valable aussi en campagne) : `cadre()` renvoie en plus `r.semaine = { numero, libelle, route }` : « Semaine 4 » (numéro de l'entrée du planning ; `route: true` si elle est dans la fenêtre de l'acte, affichée en relief ; `false` en retrait, « d'une autre semaine ») ; pour les cours sans semaine : « Griffon de cuivre », « Fiche méthode », « Anglais · séquence 2 » (`numero: null`). `ui.recit` l'affiche en petit ruban à droite du nom du conseiller (classe `.recit-semaine`, 14 px au moins, le titre du cours en infobulle), là où est déjà l'étiquette « Seconde chance ». En campagne, le ruban dit la semaine sans relief : c'est la réponse à « tu vois les semaines défiler dans les questions ». Si ce chantier livre d'abord une pastille dans `poserQuestion`, l'expédition s'en sert : même information, même endroit.
3. **La carte et les pages de semaine** : bandeau « Semaine 4 · du 21 au 27 septembre 2026 » (`JEU.calendrier.lundiDe`, `libelle`) sur la semaine en cours ; à l'entrée de chaque semaine, une page d'enluminure avec les titres des cours ouverts de la semaine (ceux du planning), la phrase de la fenêtre (3.3) et le gardien qui attend ; au début de chaque vague d'une bataille de route, la carte « Un éclaireur » (`nouvellesDuFront`) dit la semaine une fois sur deux : « Nous traversons les terres de la semaine 7 : ses cours sont en tête. » (une carte de récit avant la première question, jamais entre deux).

## 7. La difficulté monte avec la semaine

### 7.1 La ligne du rival par semaine

Le moteur règle le seigneur rival par une ligne de la table `RIVAL` (niveaux 0 à 4, réglés au simulateur le 16/10/2026). La route a besoin d'une échelle plus longue que les cinq provinces : la semaine. Pour que le niveau 4 (la Forteresse : tirs ×1,62) n'arrive pas dès novembre pour un élève dont l'arsenal de campagne est encore au niveau 1, les cinq lignes s'étalent sur treize semaines :

| Semaines | Ligne RIVAL | Repère de la campagne |
|---|---|---|
| S1, S2 | 0 | Le Gué, le Piémont |
| S3 à S5 | 1 | La Forêt, les Oliveraies |
| S6 à S8 | 2 | Le Moulin, le Grand Fleuve |
| S9 à S12 | 3 | La Tour du Col, la Citadelle |
| S13 et au-delà | 4 | Les deux forteresses |

`ligne(S) = LIGNE_SEMAINE[S]` (table ci-dessus, dans `EXP`), + `config.expedition.difficulte` (0 par défaut ; −1 ou +1 pour que Romain baisse ou monte tout d'un cran sans attendre une livraison), borné à [0, 4]. Le MVP ne touche pas à la table `RIVAL`, partagée avec la campagne.

**Étape 2 : table fine par semaine et profondeur**, passée au moteur par `options.rivalRegle` (surcharge partielle de la ligne, fusionnée une fois dans `creer` en `p.regleRival`, lue par `rival(p)`). Entre deux lignes, les valeurs continues (pv, coup, garde, assaut) s'interpolent ; les entiers (tours de départ, renfort, garnison) prennent la ligne du dessous ; **les tirs ne s'interpolent pas** : ils comptent par paliers de flèches et prennent une valeur déjà mesurée (0,3 ; 0,5 ; 0,7 ; 1,0 ; 1,16 ; 1,62). Au-delà de S13 : pv ×(1 + 0,04 × (S − 13)) plafond ×1,6 ; coup ×(1 + 0,03 × (S − 13)) plafond ×1,5 ; garde +0,05 par semaine plafond 1,5 ; garnison +1 à S20 et S28 (plafond 4) ; tours de départ 3 à partir de S24. Points de départ à régler au simulateur comme `RIVAL` l'a été ; c'est lui qui tranchera entre cette table et un pas plus court.

### 7.2 Par type de halte

| Halte | Vagues | Mode | Ligne | Camp adverse (pvRival) | Autres |
|---|---|---|---|---|---|
| Escarmouche | 1 | attaque | semaine | 6 | `champion: false` (étape 2 ; au MVP, le champion sort à la dernière vague comme aujourd'hui : avec 1 vague, c'est la seule, et le jour 0 mesure s'il faut le retirer ou passer à 2 vagues) |
| Embuscade | 2 | défense | semaine + 1 (MVP) ; semaine + modificateur (étape 2) | 10 | champion à la 2e vague (règle actuelle) |
| Gardien | 2 | défense | semaine | 12, gardé entre deux tentatives | étape 2 : `garnisonPlus: 1` |
| Grand Gardien | 3 | défense | semaine + 1 (plafond 4) | 16, gardé | étape 2 : `toursDepartPlus: 1`, `garnisonPlus: 1`, champion à chaque vague à partir de la 2e |

Tout le reste vient de `JEU.campagne.options(niveau)` : or de départ (60 + Trésor), château (20 + Peuple + remparts), dégâts des tours (Garde), or par réponse (Savoir), arsenal débloqué ; moins les bonus de l'événement du jour (11). La campagne aide donc la route, comme les souvenirs de Hadès ; la route n'abîme jamais la campagne. Pourquoi ça monte « en avançant sur la carte » : dans une semaine, de l'escarmouche (attaque, où l'on ne risque presque rien) à l'embuscade (défense, ligne + 1) puis au gardien (défense, place plus solide) ; d'une semaine à l'autre, la ligne monte ; à la fin, le Grand Gardien à 3 vagues et ligne + 1 ; dans l'année, l'Armorial et l'arsenal compensent. Une expédition S6 → S8 va de la ligne 2 à la ligne 3.

Les solidités 6, 10, 12, 16 sont des **valeurs de départ** : le jour 0 (16.1) les mesure avant d'écrire la route.

### 7.3 Modificateurs d'élite (embuscades, étape 2)

Un par embuscade, tiré à la graine, affiché sur la porte et dit par la carte de l'éclaireur au début de la bataille (avant la première question, jamais entre deux). Chacun s'écrit comme une option du moteur :

| Modificateur | Effet | Phrase de l'éclaireur |
|---|---|---|
| Garnison doublée | `garnisonPlus: 1` | « Sa porte est tenue par deux fois plus d'hommes d'armes : il faudra les battre avant de toucher ses murs. » |
| Archers embusqués | `toursDepartPlus: 1` | « Une tour de plus garde sa route : avance tes troupes sous le couvert de tes propres tours. » |
| Cavalerie légère | `renfortPlus: ["cavaliers", "cavaliers"]` à chaque vague | « Des cavaliers légers ouvrent chacune de ses vagues : garde des piquiers pour les ralentir. » |
| Trésor de guerre | `tresorPlus: 30` | « Il a de l'or plein ses coffres : attends-toi à des renforts à chaque vague. » |
| Brouillard sur tes lignes | `modificateurs: { brouillardJoueur: true }` à la 1re vague (tes tours voient 25 % moins loin) | « Le brouillard couvre tes lignes : tes tours verront moins loin au premier assaut. » |
| Pluie | `modificateurs: { pluie: true }` à la 1re vague (existe déjà) | « La pluie détrempe la route : tout le monde avance au pas. » |

Les Serments (difficulté facultative, ardeur, prime d'ardeur) sont décrits en 10.4 (étape 3).

## 8. Les faveurs des conseillers

### 8.1 Les six conseillers, un par famille

Les conseillers existent (`JEU.recit.CONSEILLERS`) : le chroniqueur (histoire), la cartographe (géographie), l'herboriste (SVT), le maître d'œuvre (physique-chimie), le ménestrel et le maître scribe (français : littérature, lecture suivie, grammaire ; ils offrent les mêmes faveurs ; le ménestrel tient la porte, le maître scribe pose la question quand elle est de grammaire), l'interprète (anglais ; ses portes n'apparaissent que si une séquence d'anglais est chargée). Chacun a trois faveurs et un thème : la mémoire, les routes, les remèdes, les engins, le moral, les alliances.

### 8.2 Les dix-huit faveurs, en trois rangs

Rangs : **commune**, **rare**, **épique** (cadre de bronze, d'argent, d'or sur le médaillon). Chaque faveur se tient une fois ; la reprendre l'**affine** d'un rang. Les six faveurs marquées **MVP** passent par des options que `M.creer` lit déjà ou par l'état de l'expédition : aucun changement du moteur à l'étape 1 ; les autres viennent avec l'option `faveurs` du moteur à l'étape 2.

| Conseiller | Faveur | Commune | Rare | Épique | Où ça s'applique |
|---|---|---|---|---|---|
| Chroniqueur (histoire) | **Annales** (MVP) | +2 or par bonne réponse | +3 | +5 | `orParReponse` |
| | Mémoire des anciens | une Seconde chance réussie rapporte +4 or | +7 | +10 | `repondre(p, juste, rappel)` |
| | Chronique dorée | renommée des haltes +10 % | +15 % | +25 % | compte de l'expédition |
| Cartographe (géographie) | **Éclaireurs** (MVP) | la 1re vague adverse perd un homme d'armes (ou son dernier soldat) | et la 2e | et la garnison de départ a un garde de moins (jamais sous 0) | `espion` (existe) ; rang 2 : le rendu repose `p.modificateurs.espion` au début de la 2e vague ; rang 3 : `garnisonPlus: −1` (étape 2) |
| | Lignes de visée | portée de tes tours +8 % | +12 % | +18 % | `porteeTour` |
| | Chemins creux | vitesse de tes troupes +10 % | +15 % | +25 % | `creerUnite` |
| Herboriste (SVT) | **Simples** (MVP) | +1 vivre tout de suite | et +1 au maximum | et +1 vivre à chaque gardien vaincu | état de l'expédition |
| | Onguents | points de vie de tes troupes +10 % | +15 % | +25 % | `creerUnite` |
| | Murs chaulés | château +3 | +5 | +8 | `pvChateau` (option existante) |
| Maître d'œuvre (physique) | **Engrenages** (MVP) | dégâts de tes tours +8 % | +12 % | +18 % | `bonusDegats` (option existante) |
| | Charpente | tours −3 or | −5 | −8 | `poserTour` |
| | Contrepoids | baliste et trébuchet : cadence +15 % | +25 % | +40 % | `etapeTours` |
| Ménestrel et maître scribe (français) | **Ballade consolante** (MVP) | une erreur coûte 4 or au lieu de 6 | 2 | 0 | `orPerduErreur` (option existante) |
| | Chant de marche | revenu par vague +3 | +5 | +8 | `etape` (fin de vague) |
| | Refrain | coup d'éclat +15 au lieu de +10 | +20 | +25, et dès 2 succès d'affilée | `repondre` |
| Interprète (anglais) | **Lettres de crédit** (MVP) | or de départ +15 | +25 | +40 | `orDepart` (option existante) |
| | Mercenaires | un fantassin gratuit par vague | deux | un cavalier | `lancerVague` |
| | Parlementaire | garnison rivale −1 au départ (jamais sous 0) | et une tour adverse de départ en moins (jamais sous 1) | et son trésor −15 | `rivalDepart` |

**Plafonds** (le simulateur joue le pire cas, et rien ne casse les paliers mesurés) : dégâts des tours au total (jauge Garde + faveurs) ≤ +60 % ; portée ≤ +25 % ; points de vie des troupes ≤ +40 % ; vitesse ≤ +30 % ; or par réponse ≤ 22 ; or de départ ≤ 180 ; perte par erreur ≥ 0 ; château ≤ 40 ; garnison et tours de départ jamais sous 0 et 1.

**Faveur d'érudition** (étape 2 ; une par conseiller, épique, au marchand à partir de la 2e semaine, 90 or de route) : « +1 % de dégâts de tes tours (cartographe : de portée ; herboriste : de points de vie des troupes ; ménestrel : de revenu ; interprète : d'or de départ ; chroniqueur : d'or par réponse) par bonne réponse de ma matière pendant cette expédition, plafond 15 % ». Elle récompense directement les réponses dans une matière, et le bilan la commente.

### 8.3 Duos (étape 2)

Tenir une faveur de deux conseillers ouvre, au marchand ou à une porte de l'un des deux, une faveur de duo (rang unique) :

| Duo | Faveur | Effet |
|---|---|---|
| Cartographe + Maître d'œuvre | Tir plongeant | tes tours frappent +20 % les troupes ralenties par une palissade |
| Herboriste + Ménestrel | Veillée | après chaque vague, ton château regagne 2 points (jamais au-dessus de son maximum) |
| Chroniqueur + Interprète | Ambassade savante | 3 bonnes réponses d'affilée : un fantassin gratuit de plus pour la vague |
| Chroniqueur + Ménestrel | Geste héroïque | 5 bonnes réponses d'affilée dans l'expédition : +30 or de route |
| Cartographe + Herboriste | Herbier des routes | tes troupes +10 % de vie et +10 % de vitesse |
| Maître d'œuvre + Interprète | Sapeurs | ta tour de siège frappe la place adverse +50 % |

Ils poussent à prendre des faveurs de matières différentes, donc à rencontrer des questions de matières différentes.

### 8.4 Rareté : combien on en voit

- À une porte, question juste : 3 cartes, rare une fois sur quatre (une fois sur deux après une embuscade ; garantie au gardien) ; question fausse : 2 communes ; éclatante : une carte de plus. Si un duo est ouvert, il prend la place de la rare.
- Une faveur tenue proposée de nouveau s'affine d'un rang : c'est le chemin ordinaire vers l'épique, comme la Grenade de Hadès.
- Le bivouac (veillée sans faute) affine une faveur au choix. Le marchand vend une faveur commune (45), une rare (75), un affinage (35), une érudition (90), un duo (80).
- Ordres de grandeur pour trois semaines à 7 sur 10 : 4 à 6 portes de faveur, 1 affinage, 1 ou 2 achats : 5 à 7 faveurs tenues au Grand Gardien, dont 1 ou 2 rares et 0 ou 1 épique. Au MVP (6 faveurs, 2 rangs : commune puis rare), 3 à 5 faveurs tenues.

### 8.5 Comment on reçoit une faveur

À une porte de faveur, après la halte : le conseiller pose **une question de sa matière** (quota sur sa famille, niveaux 1 et 2, règles anti-répétition habituelles, Seconde chance possible), dans son cadre de récit. Puis les cartes : la première et la deuxième sont du **conseiller de la porte** (deux faveurs différentes, ou une faveur et l'affinage d'une faveur tenue) ; la troisième est du conseiller de la **famille la moins jouée depuis le début de l'expédition** (`compte.parFamille`, questions posées ; à égalité, la moins réussie ; jamais la famille de la porte) : qui varie les matières voit plus de faveurs différentes. Question fausse : explication, puis la première et la troisième. Choix au clavier (1 à 4) ou à la souris ; chaque carte montre le conseiller, le nom, le rang, l'effet en une phrase et, si on tient déjà la faveur, « Affiner : commune → rare ». Les offres en cours sont enregistrées avec la halte (`enCours.offre`) : on retrouve les mêmes à la reprise. Jamais de porte vide, jamais de faveur imposée, pas de « passer ».

### 8.6 Le marchand

Le maître d'œuvre tient l'étal ; une question de sa matière l'ouvre (juste : −20 % sur tout l'étal). L'étal (tiré à la graine) propose 4 lignes parmi : une faveur commune (45 or de route), une faveur rare (75), affiner une faveur tenue (35), un sac de vivres (40, jusqu'au maximum), un **plan de bataille** (+25 or au début de la prochaine bataille de route, 15), **rafraîchir l'étal** (10, une fois) ; à partir de la 2e semaine : une érudition (90) ou un duo (80). Au MVP : faveur commune, vivres, plan, rafraîchir. L'Armorial (Forge de campagne) baisse les prix de 10 puis 20 % ; le Serment du marchand les monte de 25 %. Une expédition complète donne environ 180 à 220 or de route : trois ou quatre achats. L'écran dit toujours ce que l'or restant deviendra : « L'or de route qui te reste deviendra de la renommée au retour (1 pour 5). »

## 9. Vivres, or de route, défaite, retour, victoire

- **Vivres** : 3 au départ (4 ou 5 avec l'Armorial ; 2 avec le Serment des vivres), maximum 5. −1 quand les murs cèdent dans une bataille de route, ou quand on quitte (ou ferme le jeu) après la première vague d'une bataille de route (avant : rien, la halte reste à jouer). +1 au bivouac (repos), au marchand, aux Simples, à la porte « vivres », au feu au grenier et à la meunière, jamais au-delà du maximum. Jamais perdus pour une question, jamais pour un événement. À 0 : **le retour au domaine**.
- **Or de route** : 0 au départ. Gagné : escarmouche tenue +10 (+10 éclatante), embuscade tenue +20 (+15 éclatante), gardien vaincu +25, porte bourse +20 (+20), coffre +25, bivouac +25 (repos au maximum ou choix), veillée +4 par bonne réponse, marchands de route +4, archives +2, Geste héroïque +30, Bourse de l'Armorial. Dépensé au marchand. Au bilan, l'or restant devient de la renommée, 1 pour 5.
- **Faveurs** : rendues au retour.
- **Retour au domaine** (défaite) : un écran de bilan, le même que la victoire : renommée gagnée (jamais réduite), meilleures matières de la route, fiches à relire (liens vers le Codex), graine, une phrase du chroniqueur (« Une expédition qui apprend n'est jamais perdue. »), « Repartir » ou « Retour à la campagne ». La chronique de la campagne note : « L'expédition s'est arrêtée à la semaine 5, 2e halte. La compagnie rentre avec 83 points de renommée. » Rien d'autre ne change : provinces, ressources, jauges, arsenal, bâtiments, suivi des cours.
- **Lever le camp** (depuis la carte de route, avec confirmation) : même bilan, même renommée. Une seule expédition en cours à la fois.
- **Victoire** (Grand Gardien vaincu) : semaine franchie, relais suivant ouvert, +20 renommée, 3 coups à la prochaine place forte du front (comme le défi du champion : `pr.pv = max(1, pv − 3)`, jamais une prise), rivalité du front +6, missive `victoire` du rival (il a été repoussé), 8 ressources de la matière la mieux réussie de la route (3 questions au moins), une ligne dans la chronique.

## 10. Renommée, Armorial, titres, Serments

### 10.1 Gagner de la renommée

| Source | Renommée |
|---|---|
| Bonne réponse (partout sur la route) | +1 |
| Halte terminée (bataille tenue ou éclatante, événement, marchand, bivouac, trésor, archives) | 4 + numéro de la semaine |
| Bataille de route où les murs ont cédé (l'effort compte) | 2 |
| Archives, registres du bailliage | ×2 sur la halte |
| Porte « parchemin » | +10 (+20 si éclatante) |
| Gardien de la semaine vaincu | 15 + 3 × semaine |
| Grand Gardien vaincu | 30 + 5 × semaine |
| Expédition complète | +20 |
| Or de route restant au bilan | +1 pour 5 |
| Serments (étape 3) | +10 % par point d'ardeur, et la prime d'ardeur |
| Armorial, Bannière | +10 % puis +20 % |

Le numéro de la semaine dans chaque barème est la **prime de profondeur** : partir de S7 rapporte plus que de S1. Ordres de grandeur : expédition S1 → S3 complète ≈ 195 (9 haltes ≈ 54, gardiens S1 et S2 = 39, Grand Gardien S3 = 45, 35 bonnes réponses, +20, or restant) ; S7 → S9 complète ≈ 310 ; arrêtée à la 4e halte de S1 ≈ 40. Toujours plus que zéro, toujours gardée, jamais réduite. Au bilan : « Renommée gagnée : 83 (tu en as 412, 190 à dépenser). »

### 10.2 L'Armorial (le Miroir)

Un écu dont on remplit les quartiers avec la renommée, depuis l'écran de départ (et une page du Codex). Un achat est définitif ; rien ne se perd ; on peut toujours jouer sans rien acheter.

| Quartier | Effet | Rangs et prix | Étape |
|---|---|---|---|
| Vivres de route | +1 vivre au départ et au maximum | 40, puis 110 (5 vivres) | MVP |
| Bourse du voyageur | +10 or au début de chaque bataille de route | 25, 50, 90 | MVP |
| Murs chaulés | château +2 dans les batailles de route | 35, 75 | MVP |
| Faveur d'ouverture | une faveur commune au choix parmi trois au départ de chaque expédition | 80 | MVP |
| Bannière | renommée +10 % | 60, 140 | MVP |
| Sauf-conduit | les portes de toute la semaine sont visibles dès l'arrivée, et les modificateurs d'élite se lisent sur la route | 30 | 2 |
| Mémoire des anciens | une Seconde chance réussie rapporte +4 or, partout sur la route | 35 | 2 |
| Forge de campagne | prix du marchand −10 % | 30, 60 | 2 |
| Seconde monture | une fois par expédition, une bataille perdue ne coûte pas de vivre | 120 | 2 |

Total : 980 points (630 pour les cinq quartiers du MVP), soit cinq à six expéditions complètes ; le premier quartier (Bourse, 25) s'achète dès la première expédition, même perdue. Les relais ne s'achètent pas : ils s'ouvrent en franchissant les semaines. Ordre conseillé, affiché sans obligation : Bourse, Vivres, Faveur d'ouverture.

### 10.3 Titres et Chronique des expéditions (étape 2)

Une page du Codex, « Chronique des expéditions », à côté de la Galerie des souverains : les vingt dernières expéditions (date, relais, front, semaine et halte atteintes, renommée, graine, ardeur), le record par relais, le parchemin de l'année avec ses sceaux, et des titres gagnés une fois pour toutes (« Premier pas », « Gardien de la semaine 3 », « Sans faute à la veillée », « Les six conseillers » (une faveur de chacun dans la même expédition), « Trois duos », « Archiviste » (dix haltes d'archives), « Érudit de l'herboriste »…). Mots de jeu, sans fait de cours. Rang affiché avec la renommée totale, pour la parure : Écuyer (0), Banneret (150), Capitaine (400), Connétable (800), Maréchal (1 500).

### 10.4 Les Serments (difficulté facultative, étape 3)

Le Pacte du Châtiment. Chaque Serment vaut des points d'**ardeur** ; chaque point donne +10 % de renommée sur toute l'expédition (plafond 8 points). Ils se choisissent à l'écran de départ, se gardent d'une fois sur l'autre, et ne touchent jamais aux questions (pas de chrono, pas de niveau forcé, pas de Seconde chance retirée) :

| Serment | Effet | Ardeur |
|---|---|---|
| De la garde | Garnison rivale +1 à chaque bataille | 1 |
| Du guetteur | Tours rivales : tirs au palier supérieur | 1 |
| Des vivres | 2 vivres au départ au lieu de 3 (jamais moins de 1 ; l'Armorial s'ajoute ensuite) | 2 |
| Du marchand | Prix du marchand +25 % | 1 |
| De la hâte | Les portes ne montrent plus leur récompense | 1 |
| Du champion | Le champion adverse à chaque vague des gardiens | 2 |

**Prime d'ardeur** : pour chaque relais, le jeu retient la plus forte ardeur avec laquelle l'expédition a été accomplie ; la dépasser rapporte +25 renommée par point au-dessus du record. Les Serments s'ouvrent à la première victoire sur un Grand Gardien.

**Gages des conseillers** (plus tard, les souvenirs de Hadès) : quand une famille a reçu 60 bonnes réponses sur la route (toutes expéditions confondues), son conseiller offre un gage qu'on emporte au départ (un à la fois) : la première porte de faveur est la sienne, ou sa faveur d'ouverture est rare.

## 11. Lien avec la campagne existante

- **Indépendance** : une expédition ne prend ni ne rend de province ; elle n'écrit dans `campagne.provinces` que les 3 coups de la victoire ; elle ne touche ni menace, ni attaque du domaine, ni événement du jour. Une attaque du domaine en cours n'empêche pas de partir ; elle attend. Une expédition en cours n'empêche pas de jouer la campagne : les deux restent dans la grille.
- **Ce que la campagne apporte à la route** : arsenal, jauges, remparts, par `JEU.campagne.options(niveau)`. Le conseil du royaume et l'arsenal restent la progression lente ; l'Armorial est la progression « roguelite ». Les deux poussent dans le même sens.
- **Piège à éviter (relu dans le code)** : `C.options` ajoute `c.bonus.or` à l'or de départ et lit `c.bonus.espion`, et c'est `C.apresBataille` qui vide `c.bonus` ; la route n'appelle pas `apresBataille`. `JEU.expedition.optionsBataille` repart de `C.options(niveau)`, **retire `c.bonus.or` de `orDepart`** et met `espion` à vrai seulement si `enCours.espion` (ou les Éclaireurs) le dit ; elle ne vide jamais `c.bonus`. Test 17.1.
- **Rivaux et missives** : avant le Grand Gardien, le défi du rival du front par `C.missiveAvantBataille(idDeLaProchaineProvinceDuFront)` (une bataille sur deux, « Relever le défi » ; sans province restante sur ce front, pas de lettre) ; après une victoire, `C.reagir(front, "victoire")` (à ajouter à l'export de campagne.js, une ligne) et `C.monterRivalite(front, 6)` ; gardien de semaine vaincu : rivalité +2, pas de lettre ; après un retour, rien. Les gardiens de semaine sont « un seigneur rival » (`medaillonHeraldique(camp, true)`), sans missive ; dans la bataille, le mot du rival (`phraseRival`, p.ia.journal) s'affiche sous ce nom. Étape 3 : situations `mission` (souverain), `grandGardien`, `franchie`, `rentree` dans personnages.js, six répliques par camp et par situation, contrôle 10.
- **Souverain** : il change toujours avec les provinces prises ; l'expédition y contribue par ses 3 coups. La phrase de départ est un texte du jeu avec son nom (`JEU.campagne.souverain()`), « Le royaume te confie… » sans souverain ouvert.
- **Chronique et cartouche** : départ, semaine franchie, retour, record, dans les vingt faits ; le cartouche « Les fronts et tes rivaux » gagne une ligne : « Expéditions : 3 accomplies, relais ouverts jusqu'à la semaine 7, renommée 412. »
- **Statistiques** : chaque halte compte une partie (`stats.parties`) ; les réponses entrent dans `stats`, `notions`, `posees`, `rappels` comme partout.
- **Réglage « Messages des rivaux »** coupé : pas de défi ni de réaction, comme en campagne ; les pages de semaine et le bilan, qui ne sont pas des lettres, restent.

## 12. Durée, pause et reprise

Compte pour une expédition de 3 semaines (9 haltes, 2 gardiens, 1 Grand Gardien), avec le mélange de la table 4.3 :

| Poste | Questions | Durée à ×1 | Durée à ×2 |
|---|---|---|---|
| 9 haltes (en moyenne 3,5 batailles, 2 événements, 1 marchand, 1,5 bivouac, 1 archives ou trésor) | ≈ 24 | ≈ 20 min | ≈ 16 min |
| Portes de faveur et questions de conseiller | ≈ 5 | ≈ 2 min | ≈ 2 min |
| 2 gardiens (6 questions, 2 vagues chacun) | 12 | ≈ 10 min | ≈ 8 min |
| Grand Gardien (9 questions, 3 vagues) | 9 | ≈ 7 min | ≈ 5 min |
| Pages de semaine, choix de haltes, bilan | — | ≈ 2 min | ≈ 2 min |
| **Total** | **≈ 50** | **≈ 40 min** | **≈ 33 min** |

Une expédition de deux semaines (`couches: 2`, ou le choix « expédition courte » à l'écran de départ, étape 2) : ≈ 34 questions, 25 à 28 minutes ; une seule semaine : 10 à 12 minutes. Une séance type de l'élève fait 15 à 20 minutes : l'expédition est faite pour être **jouée en deux fois**. D'où :

- **Pause** : « Retour à la campagne » (et Échap, par `ui.clavier` de l'écran de route) revient à la campagne, l'expédition reste en cours (« Reprendre l'expédition · semaine 5, 2e halte »). La route n'est pas une « partie » au sens de `JEU.partie` : on peut aller au Codex ou aux Réglages et revenir ; seules les haltes sont des parties (`JEU.ui.commencerPartie`). La sauvegarde est écrite après chaque halte, chaque porte, chaque achat, chaque gardien, chaque page de semaine.
- **Fermer le jeu pendant une bataille de route** : la bataille n'est pas sauvegardée (pas plus qu'en campagne). À la réouverture, la halte est à rejouer : sans perte de vivre si sa première vague n'avait pas été lancée ; sinon −1 vivre (l'expédition note `entamee = id` à `lancerVague` et l'efface au bilan).
- **Import d'une sauvegarde** : l'expédition en cours revient telle quelle.
- La durée estimée s'affiche à l'écran de départ, calculée par la même formule que le simulateur (questions × 18 s + vagues × 50 s / vitesse + 2 min).

## 13. Sauvegarde : schéma 6 et réglages

Migration 5 → 6 (6 est le premier numéro libre au 24/10/2026 : vérifier `SCHEMA` le jour de la livraison et prendre le suivant s'il a bougé ; le test « Sauvegarde d'un schéma plus récent (6) refusée » passe à 7) : ajoute `expedition`, vide, complété par `JEU.expedition.completer` (même méthode que `JEU.campagne.completer` : une valeur absente, nulle ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas ; une expédition en cours illisible est close proprement, sa renommée de haltes déjà franchies créditée, et la chronique le dit en une ligne). Rien n'est retiré. Une sauvegarde du schéma 6 lue par un jeu plus ancien est refusée, comme aujourd'hui. Les champs des étapes 2 et 3 (serments, titres, quartiers de plus, étal complet) se complètent sans nouvelle migration.

```js
expedition: {
  renom: 0, renomTotal: 0,                       // disponible ; gagné depuis le début (jamais réduit)
  armorial: { vivres: 0, bourse: 0, murs: 0, ouverture: 0, banniere: 0,                     // MVP
              saufConduit: 0, memoire: 0, forge: 0, monture: 0 },                           // étape 2
  franchies: [],                                 // semaines dont le gardien a été vaincu ; relais = {1} ∪ {w + 1} ∪ {frontière − 2}
  sermentsOuverts: false, serments: { garde: false, guetteur: false, vivres: false, marchand: false, hate: false, champion: false },
  titres: [],                                    // identifiants de titres gagnés (étape 2)
  records: { "1": { semaine: 3, halte: 4, renom: 195, ardeur: 0 } },   // par relais
  reponsesParFamille: { svt: 12 },               // bonnes réponses sur la route, pour les gages (plus tard)
  historique: [{ le: "2026-10-24", graine: 1329438721, front: "angleterre", depart: 1, semaines: [1, 2, 3],
                 atteint: { semaine: 2, noeud: "s2c3h1" }, issue: "victoire" | "retour" | "abandon", renom: 195, ardeur: 0 }],
                                                 // vingt au plus, le plus récent d'abord
  enCours: null | {
    graine: 1329438721, front: "angleterre", depart: 4, semaines: [4, 5, 6], ardeur: 0, difficulte: 0, vitesse: 1,
    route: { version: 1, actes: [{ semaine: 4, semaines: [4], quota: 2, carte: "col",
              couches: [[{ id: "s4c1h1", type: "escarmouche", porte: { genre: "faveur", conseiller: "svt" }, suivants: ["s4c2h1", "s4c2h2"] },
                         { id: "s4c1h2", type: "evenement", ev: "archives", suivants: ["s4c2h1"] }], [ … ], [ … ]],
              gardien: { id: "s4g", type: "gardien", place: 12, vagues: 2, porte: { genre: "faveur", conseiller: "histoire", rare: true } } }, …] },
    position: null | "s4c1h1",                   // halte en cours ou dernière jouée ; null : au départ de la semaine courante
    semaine: 4,                                  // semaine en cours
    faits: { "s4c1h1": "reussi" | "eclatante" | "echoue" | "fait" },
    entamee: null | "s4g",                       // bataille de route dont la 1re vague a été lancée et qui n'a pas de bilan
    vivres: 3, vivresMax: 3, or: 0, plan: 0, espion: false, monture: true,
    faveurs: [{ id: "annales", rang: 1 }],       // rang 1 commune, 2 rare, 3 épique ; duos et éruditions : rang 1
    places: { "s4g": 9 },                        // solidité restante d'un gardien déjà attaqué
    offre: null | { halte: "s4c1h1", conseiller: "svt", cartes: [{ id: "simples", rang: 1 }, …] },   // offre en attente de choix
    etal: { "s4c2h2": { remise: true, lignes: ["faveur:engrenages", "vivres", "plan", "rafraichir"], rafraichi: false } },
    compte: { questions: 0, bonnes: 0, serie: 0, meilleureSerie: 0, parFamille: { svt: { posees: 4, bonnes: 3 } }, parSemaine: {},
              renom: 0, renomHaltes: 0, fiches: [] }   // fiches : ratées, pour « À relire »
  }
}
```

Taille : moins de 3 Ko pour une expédition en cours, 2 Ko d'historique. docs/FORMAT_DONNEES.md : section « Sauvegarde », schéma 6, et le bloc `expedition` de config.js ci-dessous.

Réglages dans jeu/data/config.js (lus par `JEU.expedition`, valeurs par défaut si absents, pour que Romain les touche sans code) :

```js
  expedition: { semaines: 3, couches: 3, vivres: 3, questionsSemaine: 2, quotaPlein: 12, quotaDemi: 5, difficulte: 0, vitesse: 1, relaisLibres: false }
```

## 14. Interface et direction artistique

### 14.1 L'écran de départ

Une carte de la grille de la campagne, « Partir en expédition » (ou « Reprendre l'expédition · semaine 5, 2e halte »), après « Conseil du royaume » et avant « Arsenal », avec sa touche. L'écran de départ montre : le **parchemin de l'année** (34 cases en rang, scellées pour les semaines franchies, frontière marquée, brume au-delà, bannière « Cette semaine ») ; le choix du **relais** (flèches ← →, défaut : le relais ouvert le plus élevé) avec la liste des cours ouverts de la semaine de départ ; le **front** (vers l'ouest contre le royaume d'Angleterre, vers le sud contre l'Empire omeyyade : deux écus, terrains de la variante sèche, couleurs du camp, rival du Grand Gardien) ; l'**Armorial** (un écu à neuf quartiers qui se colorent ; achat à la renommée) ; les Serments s'ils sont ouverts ; les vivres et l'or de départ qu'on aura ; la durée estimée (« environ 35 minutes, reprise possible à chaque halte ») ; une phrase du souverain servi : « {souverain} te confie la route des semaines 4 à 6. Reviens couvert de renommée. » Boutons : « Partir (Entrée) », « Armorial (A) », « Chronique (C) », « Retour ».

### 14.2 La carte-itinéraire

- Un écran de partie « La route » (`JEU.ui.ecrans.expedition`, module jeu/js/ecran-expedition.js, section `#ecran-expedition` dans index.html ; le menu ne change pas : on y entre par la campagne, on en sort par Échap ou « Retour à la campagne »).
- **Parchemin horizontal** (SVG, 1000 × 320 unités logiques, dans le même cadre à bordure de parchemin que la carte de campagne : il tient entier en 1366 × 768 avec les cartouches du bas, contrôle perf.js). Les 100 premiers pixels : le départ (un petit bourg de France, `lieu-france`, bannière au lys). Une semaine = une bande de 300 px : une **lettrine rubriquée** (« S4 » en Cinzel #8c2f39, filets d'or) et le libellé des dates dessous (14 px au moins) ; trois colonnes de vignettes (x = 60, 130, 200 dans la bande, haltes étalées en hauteur selon leur nombre, gigue ±4 % à la graine) ; le gardien à x = 265 dans un **médaillon héraldique** de 72 px (`JEU.ecranCampagne.medaillonHeraldique(camp, true)` au tortil pour un gardien de semaine ; `medaillon(rivalDe(front), 72)` pour le Grand Gardien : portrait s'il en a un, sinon la silhouette couronnée sur les armes du camp).
- **Vignettes de haltes** : médaillons de 56 px à l'encre et à l'or (le cerclage des médaillons de repli de la carte de campagne), icône Game-icons du type, sous-titre de 14 px (« Escarmouche », « Bivouac »…), la **porte** en petit écusson de 22 px en bas à droite (médaillon du conseiller à la teinte de sa matière, bourse, parchemin, sac), le modificateur d'élite en petit mot sous l'embuscade (étape 2). États : à venir (encre), atteignable (halo d'or, le même anneau que la province « cible » de la campagne, avec le numéro de touche), jouée (un sceau de cire posé dessus : `sceau("joueur")` réduit, vert-de-gris pour réussie, plomb #4a4e57 pour « murs cédés », comme le sceau de l'or perdu), hors chemin (estompée à 35 %). Chemins en pointillés d'encre comme `route()` de la carte de campagne ; le chemin parcouru en trait plein doré ; les chemins empruntables depuis la halte courante un peu plus clairs.
- **Brume** : les nappes `lieu-brume` existantes (sprites.js) sur les couches des semaines suivantes et sur tout ce qui dépasse la frontière, avec le voile désaturé de `voileBrume` ; la bannière « Cette semaine » plantée sur la semaine du jour.
- **Sous la carte**, deux cartouches dans le style de « Ton royaume » : **Ta compagnie** (vivres en sacs, or de route, faveurs en médaillons cerclés de bronze, d'argent ou d'or avec leur effet au survol et dans une liste au clavier, renommée de l'expédition, ardeur, graine) ; **Journal de route** (les dix derniers faits de l'expédition). Boutons : « Entrer dans la halte (Entrée) », « Faveurs (F) », « Retour à la campagne (Échap) », « Lever le camp ».
- **Fenêtres** (famille des missives : sceau de cire, médaillon, mêmes raccourcis) : la page de semaine (« Semaine 5 », titres des cours, phrase de la fenêtre, le gardien, bouton « En route (Entrée) »), la porte de faveur (question puis cartes de faveurs : trois cartes d'enluminure côte à côte, portrait du conseiller en médaillon, nom en Cinzel, ruban de rang, effet en une phrase), le bivouac, le marchand, l'Armorial, les Serments, le bilan. Animations de moins de 400 ms (le sceau qui se pose, le halo qui glisse à la halte suivante), aucune entre une réponse et la question suivante, aucun clignotement, coupées avec « Animations ».
- **Palette et polices** : celles du jeu (fond #efe6d2, encre #2e2419, or #b08d3a, rubrique #8c2f39, une teinte par matière sur les médaillons des conseillers), Cinzel pour les titres, Crimson Text pour les textes. Rien de nouveau dans jeu/assets pour le MVP ; étape 3 : un fond de parchemin de route rendu par les scripts Blender de l'atelier, avec repli vectoriel si l'image manque, et deux sons courts (sac de vivres, sceau de halte) par generer-sons.js.
- **Références** : la Table de Peutinger et l'itinéraire de Matthew Paris (XIIIe siècle, domaine public) pour la route horizontale à stations ; la carte de campagne de Medieval Total War pour les silhouettes de camps ; l'enluminure pour les lettrines ; l'écran des bienfaits de Hadès pour la carte de faveur.

### 14.3 Clavier et accessibilité

- Sur la carte : 1, 2, 3 choisissent une halte atteignable (numéros affichés sur les médaillons, comme les touches de la grille de la campagne) ; ← → et ↑ ↓ aussi ; Entrée entre ; F ouvre la liste des faveurs ; Échap revient à la campagne (expédition enregistrée). Les haltes atteignables ont `tabindex="0"` et un `aria-label` complet : « Semaine 4, 2e couche : embuscade, garnison doublée, récompense : faveur de l'herboriste ».
- Porte de faveur, bivouac, marchand, Serments, Armorial : touches 1 à 4, Entrée pour valider, Échap pour fermer ce qui peut l'être (jamais une porte : on choisit toujours). Le focus revient sur la halte courante après chaque fenêtre.
- Rien ne repose sur la couleur seule (sceau + mot « réussie » / « murs cédés » dans le journal de route et l'infobulle) ; textes de 14 px au moins sur la carte, questions à 18 px comme partout ; focus visible ; pas de clignotement.

### 14.4 Performance

- Génération : une fois, au départ (quelques centaines d'opérations). La carte : un SVG d'une trentaine de nœuds et d'une quarantaine de chemins, redessiné à chaque retour sur l'écran (quelques ms), jamais pendant une partie.
- Faveurs, Armorial, Serments : résolus en options avant `M.creer` ; à l'étape 2, quelques multiplications déjà sur le chemin chaud du moteur (comme `bonusDegats`). Rien dans la boucle de rendu.
- Entre une réponse et la question suivante : rien de nouveau. Le lot d'une vague est tiré au début de la vague ; le quota ajoute un appel à `tirage()` (cible : médiane sous 3 ms hors bac à sable, 10 ms au plus ; aujourd'hui 1,2 ms en médiane pour un lot de 3).
- perf.js : les mêmes mesures (JEU.mesure et Event Timing) pendant une escarmouche et un gardien de route.

## 15. Ce qu'il faut changer dans le code

### 15.1 Par fichier

Toutes les accroches sont des ajouts facultatifs : sans `contexte`, sans `quota`, sans `extra`, sans paramètre, chaque fonction fait exactement ce qu'elle fait aujourd'hui. À livrer après les chantiers en cours (revue du moteur, bataille.js, recit.js, personnages.js, cours des semaines 4 à 8) et à vérifier par `simuler-bataille.js --comparer` (les batailles de campagne ne bougent pas d'un coup). Numéros de ligne relevés le 24/10 au matin, à retrouver par leur nom s'ils ont bougé.

| Fichier | Changement |
|---|---|
| `jeu/js/expedition.js` (nouveau, sans DOM, chargé après campagne.js et bataille.js, testé sous Node) | Constantes `EXP` (tables 4.3, 4.4, 7.1, 7.2, 8.2, 8.6, 10.1, 10.2), `alea`, `semaineDe` (repli), `frontiere()`, `relais()`, `fenetre(semaine)` et `quotaDe` (3.3), `generer` (4.2), `commencer(relais, front)`, `atteignables()`, `entrer(id)`, `tirage(n, posees, halte)` (quota et niveaux), `optionsBataille(halte)` (ligne de la semaine, mode, vagues, place, faveurs, Armorial, Serments, `difficulte`, sans les bonus de campagne), `apresBataille(halte, bilan)` (vivres, portes, or de route, renommée, places, plan et espion consommés, `entamee`), `offrirFaveurs(conseiller, juste, eclatante)`, `prendreFaveur(id)`, `bivouac(choix)`, `acheter(ligne)`, `renom(source, semaine)`, `finir(issue)`, `armorial.acheter(quartier)`, `completer`, `etatVide`, `etat()`, `TEXTES`. Exposé dans `JEU.expedition`. |
| `jeu/js/ecran-expedition.js` (nouveau) | L'écran de départ et le parchemin de l'année, la carte-itinéraire, la page de semaine, les fenêtres (porte, bivouac, marchand, Armorial, Serments), le bilan, la reprise, la Chronique. |
| `jeu/js/bataille.js` | `lancer(lieu, contexte)` (ligne 1643) : avec un `contexte` ({ carte, titre, front, camp, niveau, vagues, defense, pvRival, pvRivalMax, options (celles de `optionsBataille`, à la place de `C.options(niveau)`, lignes 1680 à 1688), semaine, tirage(n, posees) (à la place de `tirerQuestions`, ligne 1631), cadre(q) (ligne 2000), nomRival, rivalPerso (pour `motDuRival`), eclaireur (phrase du modificateur, carte de récit avant la première question de la 1re vague), eclaireurs (rang des Éclaireurs), sansFiche, vitesse, surVitesse(n), surVague(), surFin(bilan), surQuitter(entamee), retour() }), la bataille ne touche pas la campagne : `bilan()` (ligne 2223) et `JEU.partie.surQuitter` (ligne 2218) rendent le bilan à `contexte` au lieu d'appeler `C.apresBataille` ; `lancerVague` (ligne 2052) prévient `contexte.surVague()` (pour `entamee`) et pose `espion` à la 2e vague au rang 2 des Éclaireurs ; `retour()` (ligne 2262) appelle `contexte.retour()` ; `nouvellesDuFront` (ligne 1926) peut dire la semaine. Une vingtaine de lignes, toutes sous `if (contexte)`. |
| `jeu/js/bataille-moteur.js` (étape 2 seulement) | Options nouvelles, toutes facultatives et sans effet si absentes : `champion` (false : `composerVague` n'ajoute pas le champion ; `"chaque"` : un champion à chaque vague à partir de la 2e) ; `rivalRegle` (surcharge partielle de la ligne, fusionnée une fois dans `creer`, lue par `rival(p)`) ; `garnisonPlus`, `toursDepartPlus`, `tresorPlus`, `renfortPlus` (lus par `rivalDepart` et `composerVague`) ; `modificateurs` initiaux (`pluie`, `brouillardJoueur` lu par `porteeTour` pour tes tours) ; `faveurs` ({ degats, portee, pvTroupes, vitesseTroupes, prixTours, cadenceEngins, revenu, serieBonus, serieSeuil, orSecondeChance, mercenaires, regen, tirPlongeant, sapeurs }), lues dans `creer`, `degatsTour`, `porteeTour`, `creerUnite`, `poserTour`, `etapeTours`, `lancerVague`, `etape` (fin de vague) et `repondre(p, juste, rappel)`. Le moteur reste sans hasard, son journal du rival inchangé ; sans ces options, mêmes résultats graine pour graine (`--comparer`). |
| `jeu/js/recit.js` | `suite(nombre, options)` (ligne 230) : option `quota` (6.1, esquisse 15.2). `cadre(q, contexte, camp, extra)` (ligne 84) : contextes `route`, `embuscade`, `gardien`, `bivouac`, `marchand`, `archives`, `porte`, `tresor` ; `r.semaine` (6.4). |
| `jeu/js/interface.js` | `ui.recit` (ligne 281) affiche `r.semaine` (`.recit-semaine`) ; `panneauErreur(q, zone, suite, options)` (vers la ligne 480) avec `options.sansFiche`. |
| `jeu/js/campagne.js` | `jouerEvenement(ev, contexte)` (ligne 528 ; 5.2) ; `reagir` ajouté à l'export (ligne 596, une ligne) ; `GAINS_RIVALITE.gardien: 2`, `.grandGardien: 6`. Rien d'autre. |
| `jeu/js/ecran-campagne.js` | La carte « Partir en expédition / Reprendre » dans la grille (lignes 444 à 463), avec sa touche ; la ligne « Expéditions » du cartouche des rivaux. |
| `jeu/js/progression.js` | `semaineDe(coursId)` (partagé avec le chantier « semaine visible » ; repli dans expedition.js sinon). |
| `jeu/js/sauvegarde.js` | `SCHEMA = 6` (ligne 6), migration 5 → 6 (`MIGRATIONS`, ligne 36), `nouvelle()` avec `expedition: JEU.expedition ? JEU.expedition.etatVide() : null`. |
| `jeu/js/codex.js` (étape 2) | Pages « Chronique des expéditions » et « Armorial ». |
| `jeu/index.html` | `#ecran-expedition`, les deux scripts (expedition.js après bataille.js, ecran-expedition.js après ecran-campagne.js), `JEU.version`. |
| `jeu/css/jeu.css` | Styles de la carte-itinéraire (médaillons, sceaux, lettrines), du ruban `.recit-semaine`, des cartes de faveurs, de l'Armorial, du parchemin de l'année, des pages de semaine. |
| `jeu/data/config.js` | Bloc `expedition` facultatif (13). |
| `jeu/data/personnages.js` (étape 3) | Situations `mission`, `grandGardien`, `franchie`, `rentree`, au format existant, contrôle 10. |
| `atelier/outils/tests.js` (`contexte()` charge `expedition` après `campagne`), `simuler-bataille.js`, nouveau `simuler-expedition.js` (étape 2), `mesurer-tirage.js`, `perf.js` | Section 17. |
| `docs/CAHIER_DES_CHARGES.md` (section 5 : « La route des semaines »), `docs/FORMAT_DONNEES.md`, `docs/JOURNAL.md`, `jeu/VERSION.txt` | Spécification, schéma 6 et config, décisions de la section 2 et mesures du jour 0, version. |

L'expédition n'écrit rien dans jeu/data : les données de cours restent au /traiter.

### 15.2 Esquisses des trois accroches principales

```js
// recit.js, suite() : le quota en tête des essais, plafonné à quota.nombre questions
var essais = [];
if (options.quota && options.quota.nombre > 0) {
  var fq = function (q) { return options.quota.filtre(q) && (!f || f(q)); };
  essais.push([fq, 0, options.quota.nombre], [fq, 1, options.quota.nombre]);
}
essais.push([f, 0], [f, 1]); if (options.completer) essais.push([null, 1]); essais.push([f, 2]); if (options.completer) essais.push([null, 2]);
for (var i = 0; i < essais.length; i++) {
  var cap = Math.min(nombre, essais[i][2] || nombre);
  if (qs.length >= cap) continue;
  var deja = qs.map(function (q) { return q.id; });
  qs = qs.concat(tirage(cap - qs.length, essais[i][0], options.types, exclure.concat(deja), attente.concat(deja), qs, essais[i][1]));
}
```

```js
// expedition.js, optionsBataille(halte) : au MVP, tout par des options que M.creer lit déjà, sans les bonus de campagne
var e = etat().enCours, c = JEU.campagne.etat(), acte = acteCourant(), arm = etat().armorial, cfg = reglages();
var niv = borne(ligneSemaine(acte.semaine) + (halte.type === "grand" || halte.type === "embuscade" ? 1 : 0) + cfg.difficulte, 0, 4);
var o = JEU.campagne.options(niv);
o.orDepart -= (c.bonus.or || 0);                                    // les mercenaires de l'événement du jour restent à la campagne
o.vagues = halte.vagues; o.defense = halte.type !== "escarmouche"; o.pvRival = e.places[halte.id] || halte.place; o.pvRivalMax = halte.place;
o.orDepart = Math.min(180, o.orDepart + 10 * arm.bourse + LETTRES[rang("lettres")] + e.plan); e.plan = 0;
o.pvChateau = Math.min(40, o.pvChateau + 2 * arm.murs);
o.bonusDegats = Math.min(0.6, o.bonusDegats + ENGRENAGES[rang("engrenages")]);
o.orParReponse = Math.min(22, o.orParReponse + ANNALES[rang("annales")]);
o.orPerduErreur = Math.max(0, (typeof cfg.orPerduErreur === "number" ? cfg.orPerduErreur : 6) - BALLADE[rang("ballade")]);
o.espion = e.espion || rang("eclaireurs") > 0; e.espion = false;    // l'espion de route, jamais c.bonus.espion
return o;
```

```js
// bataille.js, les points sous « if (contexte) » : niveau, vagues, carte, options, titre et nom du rival viennent du contexte ;
// tirerQuestions passe par contexte.tirage ; le cadre par contexte.cadre(q) ; v.vitesse = contexte.vitesse ;
// lancerVague() appelle contexte.surVague() ; bilan() appelle contexte.surFin(b) au lieu de C.apresBataille(b) ;
// surQuitter appelle contexte.surQuitter(entamee) ; retour() appelle contexte.retour() ; panneauErreur reçoit { sansFiche }.
```

## 16. Plan de construction

### 16.1 Jour 0 : mesurer avant d'écrire la route (une demi-journée)

Trois options dans simuler-bataille.js qui ne changent rien aux tableaux existants : `--vagues n`, `--pvRival n`, `--mode attaque|defense` (et `--carte gue`), pour jouer les quatre nœuds de la table 7.2 aux niveaux 0 à 4, quatre justesses, 80 graines :

```
node atelier/outils/simuler-bataille.js --vagues 1 --pvRival 6 --mode attaque --niveaux 0,1,2,3,4 --p 0.6,0.7,0.8,0.9
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 10 --mode defense --niveaux 0,1,2,3,4
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 12 --mode defense --niveaux 0,1,2,3,4
node atelier/outils/simuler-bataille.js --vagues 3 --pvRival 16 --mode defense --niveaux 1,2,3,4
```

Sorties : part des escarmouches éclatantes et où les murs cèdent ; part des défenses tenues à 2 et 3 vagues, murs restants. Décisions à prendre d'après ces chiffres, notées au journal : escarmouche à 1 vague (place 6) ou à 2 vagues (place 8) ; retrait ou non du champion à l'escarmouche ; solidités 10, 12, 16 ; ligne du gardien confirmée. Cibles en 17.3.

### 16.2 Étape 1 : le squelette jouable (MVP), version 0.9.0 (quatre à cinq jours)

1. `expedition.js` : `alea`, `semaineDe`, `frontiere`, `relais`, `fenetre` et `quotaDe`, `generer` (3 couches, garanties, portes, rotation des familles), état et `completer`, vivres, or de route, renommée, Armorial à 5 quartiers, `finir` ; schéma 6 et migration ; `config.expedition` ; tests Node (17.1).
2. Accroches : `recit.js` (`quota`, cadres de route, `r.semaine`), `interface.js` (`ui.recit`, `sansFiche`), `campagne.js` (`jouerEvenement(ev, contexte)`, export de `reagir`, gains de rivalité), `bataille.js` (`contexte`), `progression.js` (`semaineDe`).
3. `optionsBataille`, `apresBataille`, les six faveurs du MVP (commune et rare), les portes, la troisième carte de la famille la moins jouée ; tests du quota, des options et de l'intégrité de la campagne (`c.bonus` intact) ; `mesurer-tirage.js --expedition` ; `simuler-bataille.js --expedition` (les quatre nœuds avec les options exactes de `optionsBataille`).
4. `ecran-expedition.js` et CSS : écran de départ avec parchemin de l'année et Armorial, carte-itinéraire, page de semaine, porte de faveur, bivouac (repos ou veillée), marchand minimal (faveur, vivre, plan, rafraîchir), événements du jour rejoués et archives, gardien et Grand Gardien (missive de défi, réaction), bilan, reprise ; carte « Partir / Reprendre » dans la campagne ; clavier complet.
5. Réglage au simulateur, perf.js (parcours complet), cahier des charges, format, journal (décisions de la section 2 et mesures du jour 0), version 0.9.0, les cinq vérifications pour Romain (16.6), commit.

Livrable : une expédition de une à trois semaines, depuis un relais, sauvegardée et reprise, avec défaite et victoire, six faveurs à deux rangs, renommée et cinq quartiers d'Armorial ; aucun changement du moteur de bataille. Avec les cours d'aujourd'hui, elle se joue sur S1 → S3 ; elle s'ouvre toute seule sur S6 → S8 dès que les semaines 4 à 8 sont indexées, avec les fenêtres élargies tant que ces semaines sont minces. Volume estimé : 1 300 lignes de JavaScript (expedition.js 500, ecran-expedition.js 600, accroches 200), 300 de CSS, 60 tests.

### 16.3 Étape 2 : la profondeur, version 0.10.0 (trois à quatre jours)

Options du moteur (`faveurs`, `rivalRegle`, `champion`, `garnisonPlus`, `toursDepartPlus`, `tresorPlus`, `renfortPlus`, `brouillardJoueur`), vérifiées graine pour graine sans elles ; les 18 faveurs à 3 rangs, l'affinage, les six duos, les éruditions ; les modificateurs d'élite avec leurs phrases ; la table fine par semaine et la profondeur au-delà de S13 ; la halte trésor, les cinq événements nouveaux (pont rompu, meunière, colporteur, tournoi du bourg, registres), la porte scellée ; l'étal complet ; l'Armorial complet ; la Chronique des expéditions et les titres dans le Codex ; le choix « expédition courte » ; `simuler-expedition.js` et le réglage de la table par semaine.

### 16.4 Étape 3 : le récit et la finition, version 0.10.x (deux à trois jours)

Les Serments et la prime d'ardeur ; les situations nouvelles de personnages.js (`mission`, `grandGardien`, `franchie`, `rentree`), six répliques chacune, contrôle 10 ; la page de semaine illustrée ; le fond de parchemin de route rendu en 3D ; deux sons ; le « défi de la semaine » (graine commune à toute la semaine du calendrier, record à battre à l'accueil).

### 16.5 Plus tard

Les gages des conseillers ; des haltes nouvelles quand les mini-jeux arriveront (Plan de bataille, Pont de liens, Observatoire comme haltes de route) ; des reliques si la variété manque ; une musique « route » (troisième humeur de musique.js).

### 16.6 Les cinq vérifications pour Romain (à la livraison du MVP)

(Écrites pour la frontière S3 ; si les semaines 4 à 8 sont indexées, lire « S6 » pour « S1 ».)

1. Campagne → « Partir en expédition » : tu vois le parchemin de l'année avec la frontière, la semaine du calendrier en bannière, le relais (S1), le front, l'Armorial à 0, la durée estimée ; « Partir » ouvre la page « Semaine 1 » avec les titres de ses cours.
2. Sur la route : deux ou trois haltes au choix avec leur porte, trois couches, le gardien à droite, les semaines 2 et 3 dans la brume ; la touche 1 entre dans la première halte ; en bataille, deux questions sur trois portent le ruban « Semaine 1 » en relief, la troisième une autre semaine, « Griffon de cuivre », « Fiche méthode » ou « Anglais ».
3. Après l'escarmouche : le conseiller de la porte pose une question de sa matière, puis trois faveurs au choix (deux si tu te trompes), dont une d'une autre matière ; la faveur choisie apparaît dans « Ta compagnie » ; le sceau se pose sur la halte.
4. « Retour à la campagne » depuis la route : la carte dit « Reprendre l'expédition · semaine 1, 2e couche » ; l'événement du jour de la campagne est toujours là ; Réglages → Exporter, puis Importer le même fichier : l'expédition reprend au même point, mêmes vivres, mêmes faveurs.
5. Perds exprès le gardien deux fois de suite (ne pose rien) : vivres 3 → 1, le gardien se retente avec les coups déjà portés ; perds une troisième fois : le bilan montre la renommée gagnée (plus que zéro), « À relire », et la campagne n'a rien perdu (mêmes provinces, mêmes ressources, mêmes jauges). Puis « Repartir » : l'Armorial propose la Bourse du voyageur à 25.

## 17. Tests et mesures

### 17.1 tests.js (logique, Node ; `expedition` ajouté aux modules chargés)

- Génération : pour 200 graines, 3 couches par semaine, 2 ou 3 haltes par couche, chemins sans croisement (pour tout chemin i→j et i'→j', pas de i < i' avec j > j'), toute halte atteignable depuis le départ et reliée au gardien, garanties G1 à G9, mêmes résultats pour la même graine, résultats différents pour deux graines, aucun appel à `Math.random` pendant `generer`, jamais plus de vingt régénérations, la semaine de secours valide.
- Frontière et relais : avec les cours chargés par les tests, frontière = 3, relais = [1] ; `franchies = [1]` → relais [1, 2] ; frontière 8 et rien de franchi → relais [1, 6] ; `relaisLibres` → 1 à 8 ; départ = frontière : une semaine ; une semaine sans cours entre deux est sautée ; sans aucun cours, pas d'expédition.
- Semaine d'un cours : `histoire-s03-1` → 3 ; `langue-conj10`, `methode-frise`, `anglais-seq01` → null.
- Semaines minces : 44 fiches → fenêtre [S], quota 2 ; 8 fiches avec 23 la semaine d'avant → [S−1, S], quota 2 ; 4 fiches avec 3 et 2 avant → [S−2, S], quota 1 ; 2 fiches seules → quota 0.
- Vivres : jamais sous zéro ; une question ratée n'en retire jamais (le compte ne bouge pas quand `enregistrerReponse` est appelé 50 fois en faux) ; un retour à zéro vivre finit l'expédition avec la renommée acquise ; quitter avant la première vague ne coûte rien, après coûte un vivre ; `entamee` fait perdre un vivre à la reprise, pas sans première vague ; Seconde monture consommée une fois.
- Renommée : ne baisse jamais, même après un retour ; un achat d'Armorial retire du disponible, pas du total ; Bannière, ardeur et prime d'ardeur s'appliquent au bon total ; le record par relais ne descend jamais ; barèmes de 10.1 (gardien S3 = 24, Grand Gardien S8 = 70) ; or de route restant converti 1 pour 5.
- Options de bataille : `optionsBataille` pour chaque faveur et chaque quartier change la bonne option et respecte son plafond ; sans faveur ni Armorial, les options sont exactement celles de `C.options(niveau)` plus vagues, défense et solidités, **moins `c.bonus.or` et sans `c.bonus.espion`** ; ligne de S1 = 0, S5 = 1, S8 = 2, S13 = 4, Grand Gardien S8 = 3, `difficulte: −1` ramène S8 à 1.
- Campagne intacte : avant et après une expédition simulée (victoire, puis défaite), `campagne.provinces` (sauf les 3 coups de la victoire), `conquises`, `rival`, `arsenal`, `royaume`, `evenement`, `bonus` et les ressources sont inchangés (copie profonde) ; `c.bonus.or` posé à 40 avant l'expédition vaut encore 40 après.
- Après bataille : tenu, éclatante, cédé (−1 vivre), porte simple ou doublée, or de route, renommée, `places` gardé entre deux tentatives d'un gardien, semaine franchie une fois pour toutes, `plan` et `espion` consommés par une seule bataille, retour triomphal (+3 coups, rivalité +6, 8 ressources).
- Faveurs : la troisième carte vient de la famille la moins jouée, jamais de celle de la porte ; une faveur tenue proposée de nouveau s'affine ; les rangs ne dépassent pas 3 ; les portes d'une semaine tournent entre les familles.
- Sauvegarde : migration 1 → 6 sans perte (toutes les clés du schéma 5 inchangées) ; `completer` répare une expédition en cours abîmée (position inconnue → départ de la semaine courante, faveur inconnue retirée, vivres non numériques → 3, route illisible → expédition close avec sa renommée) ; import d'une sauvegarde avec expédition en cours ; une sauvegarde de schéma 7 est refusée.
- Tirage : `suite(3, { quota })` donne 2 questions de la semaine 1 et 1 autre quand c'est possible ; 3 d'autres semaines quand la fenêtre n'a pas de cours ; `quota.nombre: 3` et filtre « semaine < 2 » donne 3 questions de S1 ; un quota sur la famille « svt » donne une question de SVT ; une Seconde chance due est placée une seule fois ; les 60 dernières questions ne ressortent pas ; **sans `quota`, le résultat est identique à aujourd'hui** pour une même graine et une même sauvegarde (régression).
- Récit : chaque phrase de route a `{N}` ; celles qui ont `{S}` reçoivent la semaine ; `cadre()` renvoie `semaine` pour un cours du planning et le bon libellé pour la grammaire, l'anglais et les méthodes ; aucun texte de faveur, de halte, d'événement, de page de semaine, de titre ou de bilan ne contient un chiffre de cours, un mot de religion ou une insulte (la liste du contrôle 10 de controles.js, importée), ni le nom d'un personnage.
- Moteur (étape 2) : avec `options.faveurs` vide et sans options nouvelles, une bataille graine pour graine donne le même `stats` qu'avant ; chaque faveur change le bon paramètre et respecte son plafond ; `champion: false` → aucun champion ; `rivalRegle` surcharge sans toucher `RIVAL` ; `garnisonPlus` et `toursDepartPlus` se lisent dans `p.garnison` et `p.toursRivales`.

### 17.2 simuler-bataille.js : les batailles de route une à une

Jour 0 : `--vagues n --pvRival n --mode attaque|defense [--carte gue]` (16.1). MVP : `--expedition` joue les quatre nœuds avec les options exactes de `JEU.expedition.optionsBataille` (expedition.js chargé dans le simulateur après campagne.js), pour `--semaines 1,3,6,8,13` (défaut), l'arsenal supposé de `PROGRESSION[ligne]`, et facultativement `--armorial complet`, `--faveurs annales:2,engrenages:1`, `--serments garde`, `--modificateur garnison` (étape 2). Sorties par semaine, nœud et justesse : escarmouche (tenue %, éclatante %, coups portés), embuscade (tenue %, éclatante %), gardien et Grand Gardien (tenue % dont victoire, murs restants, batailles pour vaincre quand on retente). Et toujours `--comparer avant.json` sur les provinces : **aucun écart** sur les batailles de campagne.

### 17.3 Cibles de réussite

Par nœud (à ajuster avec Romain après quelques expéditions réelles) :

| Mesure, p = 0,7 | S1 → S3 | S6 → S8 | p = 0,9 | p = 0,6 |
|---|---|---|---|---|
| Escarmouche tenue | ≥ 95 % | ≥ 90 % | ≥ 99 % | ≥ 85 % |
| Escarmouche éclatante | 40 à 60 % | 30 à 50 % | ≥ 70 % | ≥ 20 % |
| Embuscade tenue, 1re tentative | 75 à 85 % | 68 à 80 % | ≥ 94 % | 58 à 70 % |
| Gardien vaincu, 1re tentative | 75 à 85 % (défense du domaine mesurée : 73 à 81 % sur trois vagues) | 68 à 80 % | ≥ 94 % | 55 à 65 % |
| Grand Gardien vaincu, 1re tentative | 60 à 70 % | 50 à 62 % | ≥ 88 % | ≥ 40 % |

Par expédition entière (au MVP, par le calcul : une expédition échoue quand les murs cèdent autant de fois qu'il y a de vivres ; escarmouche ou embuscade cédée ne se rejoue pas, gardien et Grand Gardien se retentent ; `simuler-bataille.js --expedition` imprime cette convolution à partir des taux qu'il vient de mesurer ; à l'étape 2, `simuler-expedition.js` la remplace) :

| Expédition de trois semaines | 3 vivres (départ) | 4 vivres (Armorial 40) | 5 vivres |
|---|---|---|---|
| S1 → S3, p = 0,7 | **70 à 85 %** | ≥ 90 % | ≥ 95 % |
| S6 → S8, p = 0,7 | **55 à 70 %** | ≥ 80 % | ≥ 90 % |
| S1 → S3, p = 0,6 | ≥ 45 % | ≥ 60 % | ≥ 75 % |
| S6 → S8, p = 0,6 | ≥ 35 % | ≥ 50 % | ≥ 65 % |
| S1 → S3, p = 0,9 | ≥ 95 % | ≥ 99 % | 100 % |
| Premier gardien franchi, p = 0,7 | ≥ 95 % | | |

Lecture : à 7 sur 10, trois expéditions S1 → S3 sur quatre vont au bout dès la première, et une sur deux à deux sur trois en partant de S6 ; c'est plus doux que Hadès, voulu pour « pas trop d'échecs » ; la tension vient du gardien à retenter, des portes doublées et du choix de profondeur ; une défaite rapporte toujours 25 à 40 points de renommée, et le premier quartier de vivres (40) remonte un élève à 6 sur 10 à deux expéditions sur trois. Leviers, dans l'ordre : trop facile → `vivres: 2` ou `difficulte: +1` ; trop dur → `difficulte: −1` avant de toucher aux vivres ; puis la garnison des gardiens (+1 garde coûte une troupe par vague), la solidité des places (6, 10, 12, 16), et seulement ensuite la table par semaine. Attention aux paliers de flèches : vérifier chaque changement de « tirs » au simulateur de bataille.

### 17.4 mesurer-tirage.js : la part de la semaine

`--expedition` : des expéditions simulées sur six séances (lots de 3 avec quota de semaine, événements de 3, portes de 1 sur la famille, archives de 3 avant le départ, veillées sur les fiches à revoir), par les trois élèves simulés du 15/10/2026, départ S1 puis S6 (avec les fichiers des semaines 4 à 8 chargés même s'ils ne sont pas indexés, pour mesurer les semaines minces dès maintenant) : part des questions de la fenêtre de l'acte **≥ 60 %** quand le quota est 2 (cible 67 %), ≥ 30 % quand il est 1 ; part de chaque famille présente sur l'expédition entre 12 et 30 % ; notions à revoir au moins 1,5 fois leur part, jamais plus de 2 ; aucune question reposée à moins de 60 questions hors Seconde chance ; aucune notion deux fois en 10 questions, même dans une fenêtre de 12 fiches ; réussite inchangée (≈ 73 % pour l'élève moyen) ; durée du tirage avec quota : médiane < 3 ms hors bac à sable, maximum < 10 ms.

### 17.5 simuler-expedition.js (étape 2, atelier)

Il réutilise le joueur scripté et le chargement de simuler-bataille.js, y ajoute expedition.js, et joue des expéditions entières : route à graine, choix de halte selon une politique (tranquille : jamais d'embuscade, repos au bivouac ; mixte : au hasard pondéré vers les portes de faveur ; guerrier : toujours la bataille, veillée au bivouac), question de porte juste avec la probabilité p, faveur prise au hasard parmi l'offre, marchand : vivre si vivres ≤ 1 sinon faveur.

```
node atelier/outils/simuler-expedition.js --graines 80 --p 0.6,0.7,0.8,0.9 --relais 1,4,7 --armorial 0,moitie,complet --chemin tranquille,mixte,guerrier [--serments garde,guetteur] [--difficulte 0] [--json] [--comparer avant.json]
```

Sorties par justesse, relais, Armorial et chemin : part d'expéditions complètes ; semaine et halte moyennes atteintes ; vivres restants ; réussite par type de halte ; renommée moyenne ; questions posées et durée estimée ; faveurs les plus prises et leur effet sur la réussite (différence avec et sans).

### 17.6 perf.js (bout en bout, Chromium)

Départ d'une expédition depuis la campagne (touche de la carte de jeu) ; carte entière visible en 1366 × 768 avec ses cartouches, noms et étiquettes de 14 px au moins, aucun médaillon ni nom qui se touche ; navigation au clavier (1, 2, 3, flèches, Entrée) ; escarmouche jouée (toile jamais réallouée, toujours < 100 ms entre une réponse et la question suivante, JEU.mesure et Event Timing, ruban de semaine présent sur chaque question et en relief sur deux sur trois ; la carte de l'éclaireur avant la première question, jamais entre deux) ; porte de faveur : question puis choix au clavier ; retour à la campagne au milieu de la route puis « Reprendre » : même position, mêmes vivres, mêmes faveurs ; défaite forcée (vivres mis à 1 par la console, bataille quittée après la 1re vague) : bilan avec renommée > 0, campagne intacte (provinces, ressources, jauges, arsenal, `bonus` identiques avant et après, à l'exception des ressources gagnées par bonne réponse) ; export puis import : l'expédition en cours revient ; « Sang dans les combats » et « Animations » coupés : aucune erreur JavaScript sur la route ; « Messages des rivaux » coupé : pas de défi avant le Grand Gardien.

### 17.7 Validateur

Rien de nouveau dans jeu/data/cours : le validateur ne change pas, sauf le même numéro dans VERSION.txt et JEU.version et, quand des répliques d'expédition entrent dans personnages.js (étape 3), le contrôle 10 existant étendu aux situations nouvelles. Les textes de l'expédition (phrases de cadre, faveurs, pages de semaine, titres, bilan) vivent dans expedition.js : tests.js les passe à la liste du contrôle 10.

## 18. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| Expéditions trop longues pour une séance | Reprise après chaque nœud ; vitesse ×2 retenue ; `couches: 2` ou « expédition courte » ; durée estimée affichée au départ. |
| Semaines minces ou maigres (S6, S7) : questions répétitives | Fenêtre de l'acte élargie, quota qui se relâche, anti-répétition inchangée, compagnons de route ; mesure 17.4 ; la page de semaine le dit ; temporaire. |
| Les vivres tombent trop vite pour un élève à 6 sur 10 | Cibles 17.3 (≥ 95 % passent le premier gardien à 7 sur 10) ; bivouac garanti ; `difficulte` et `vivres` dans config.js ; Seconde monture ; renommée gagnée quoi qu'il arrive ; le niveau conseillé des questions le ramène vers 7 sur 10. |
| Faveurs trop fortes qui rendent les gardiens triviaux | Plafonds écrits ; faveurs du moteur livrées après mesure ; le simulateur joue avec et sans. |
| Réglage par paliers (flèches par soldat) | Le MVP ne touche pas à `RIVAL` ; leviers = solidités, vagues, `difficulte` ; chaque changement de « tirs » vérifié au simulateur ; deux ou trois expéditions réelles pour ajuster. |
| Collision avec les chantiers en cours (moteur en revue, bataille.js, recit.js, personnages.js, cours S4 à S8, semaine visible) | Accroches minces et facultatives ; livraison après ces chantiers ; `--comparer` graine pour graine ; contrat `r.semaine` partagé. |
| Route générée invalide | Garanties vérifiées, régénération graine + 1 (vingt fois), semaine de secours fixe ; tests sur 200 graines. |
| Textes de route qui glisseraient vers du contenu de cours | Règle écrite (section 2), relecture dans /relecture, contrôle 10 appliqué par tests.js. |
| Sauvegarde abîmée en cours d'expédition | `completer` ferme proprement en créditant la renommée ; copie `jeu5e-avant-import` à l'import. |
| Le joueur suit toujours la même porte (une seule famille) | Les portes tournent entre les familles ; la troisième carte vient de la famille la moins jouée ; le tournoi du bourg ; le quota de semaine et l'équilibre du tirage posent de toute façon toutes les matières : la porte ne choisit que la faveur, jamais les questions. |

## Annexe A : les nombres en une page

| Quoi | Valeur de départ |
|---|---|
| Semaines par expédition | 3 (moins si la frontière est proche ; 2 en « expédition courte ») |
| Relais ouverts | S1 ; la semaine après chaque semaine franchie ; frontière − 2 ; `relaisLibres` pour tout ouvrir |
| Couches par semaine / haltes par couche / nœuds joués | 3 / 2 ou 3 / 12 pour trois semaines |
| Vivres au départ / maximum | 3 / 5 |
| Questions par escarmouche, embuscade, événement, marchand, bivouac, trésor, archives, gardien, Grand Gardien | 3, 6, 2 à 3, 1, 0 ou 3, 2, 3, 6, 9 ; ≈ 50 par expédition |
| Part des questions de la fenêtre de l'acte | 2 sur 3 (≥ 12 fiches, fenêtre élargie de deux semaines au plus), 1 sur 3 (5 à 11), aucune (< 5) |
| Ligne RIVAL d'une semaine | S1-2 : 0 ; S3-5 : 1 ; S6-8 : 2 ; S9-12 : 3 ; S13+ : 4 ; + `difficulte` ; embuscade et Grand Gardien : + 1 (plafond 4) |
| Modes et vagues | escarmouche : attaque, 1 ; embuscade : défense, 2 ; gardien : défense, 2 ; Grand Gardien : défense, 3 |
| Solidité des camps de route | 6, 10, 12, 16 (mesurées au jour 0) |
| Portes : faveur / bourse / parchemin / vivres | 55 / 25 / 10 / 10 % ; rare 25 % (50 % après une embuscade, garantie au gardien) |
| Faveurs : conseillers / faveurs / rangs / duos / éruditions | 6 / 18 / 3 / 6 / 6 ; MVP : 6 faveurs à 2 rangs |
| Or de route : escarmouche, embuscade, gardien, bourse, coffre, bivouac, veillée | 10, 20, 25, 20, 25, 25, 4 par bonne réponse ; marchand : faveur 45, rare 75, affiner 35, vivre 40, plan 15, rafraîchir 10, érudition 90, duo 80 ; restant → renommée 1 pour 5 |
| Renommée : réponse, halte, murs cédés, gardien, Grand Gardien, expédition | 1 ; 4 + S ; 2 ; 15 + 3S ; 30 + 5S ; +20 |
| Armorial | 9 quartiers, 980 points (MVP : 5 quartiers, 630) ; premier achat à 25 |
| Serments (étape 3) | 6, ardeur 8 au plus, +10 % de renommée par point, prime de 25 par point de record |
| Retour triomphal, lien campagne | +3 coups à la prochaine place forte du front, rivalité +6, missive, 8 ressources de la meilleure matière |
| Durée visée | 30 à 40 minutes (×1), 25 à 33 (×2) ; une semaine seule : 10 à 12 ; reprise après chaque nœud |
| Réussite visée (p = 0,7, sans Armorial) | S1 → S3 : 70 à 85 % ; S6 → S8 : 55 à 70 % ; premier gardien ≥ 95 % |
| Volume du MVP | ≈ 1 300 lignes JS, 300 CSS, 60 tests ; aucun changement du moteur |

## Annexe B : exemple de route (graine 4F2A-9C01, relais S4, frontière S8, vers l'ouest)

```
Semaine 4 · du 21 au 27 septembre 2026 · carte : la Tour du Col · quota : 2 questions sur 3 (23 fiches)
  1re couche : [Escarmouche · porte : faveur de l'herboriste]  [Archives · renommée ×2]  [Événement : le défi du champion]
  2e couche  : [Embuscade · porte : faveur du maître d'œuvre (rare 50 %)]  [Marchand]
  3e couche  : [Bivouac]  [Escarmouche · porte : bourse]  [Événement : des marchands à la porte]
  Gardien de la semaine 4 : un seigneur rival du royaume d'Angleterre (défense, 2 vagues, ligne 1, place 12) · porte : faveur rare du chroniqueur
Semaine 5 · du 28 septembre au 4 octobre 2026 · carte : la Forteresse anglaise · quota : 2 sur 3 (fenêtre S4-S5)
  (3 couches dans la brume, gardien en silhouette)
Semaine 6 · du 5 au 11 octobre 2026 · carte : le Gué
  (3 couches dans la brume) … Grand Gardien : le roi d'Angleterre (défense, 3 vagues, ligne 3, place 16), sur la carte du Gué
Semaines 7 et 8 : plus loin sur le parchemin, visibles, hors de cette expédition. Semaine 9 et au-delà : brume, titres du planning.
```

Racontée : le souverain confie la route. Page « Semaine 4 ». L'élève prend l'escarmouche : une vague, trois questions dont deux de la semaine 4 (histoire, physique) et une d'ailleurs (une géographie de la semaine 2 à revoir), chacune avec son ruban de semaine. Le camp tombe : éclatante. L'herboriste pose une question de SVT ; juste : quatre faveurs au choix, dont une du maître scribe (le français est la famille la moins jouée) ; il prend les Simples. Deuxième couche : l'embuscade (défense, deux vagues, ligne 2) avec la porte du maître d'œuvre, ou le marchand. Il prend le marchand, répond juste, achète un plan de bataille (12 or après remise). Troisième couche : le bivouac, veillée : trois questions à revoir, deux justes, +8 or de route. Gardien de la semaine 4 : défense, deux vagues ; les murs tiennent de peu. Semaine franchie, sceau sur le parchemin de l'année, relais S5 ouvert, +27 renommée, faveur rare du chroniqueur. Page « Semaine 5 ». Et ainsi de suite jusqu'au roi d'Angleterre, trois vagues à la ligne 3 devant la place forte du Gué, qui envoie d'abord une lettre de défi. S'il cède deux fois, l'élève rentre avec ses 120 points de renommée, achète la Bourse du voyageur et les Murs chaulés, et repart le lendemain, un peu plus fort, du même relais ou d'un autre.

## Questions pour Romain

1. **Longueur** : trois semaines par expédition (30 à 40 minutes à vitesse ×1, faites pour deux séances, reprise à chaque halte), ou deux semaines par défaut (25 minutes, une séance longue) avec trois au choix ? Un seul nombre dans config.js.
2. **Part d'échecs** : avec trois vivres, le réglage vise trois expéditions S1 → S3 sur quatre réussies dès le début à 7 sur 10, une sur deux à deux sur trois en partant de la semaine 6, et une défaite rapporte toujours de la renommée. Est-ce dans l'esprit « pas trop d'échecs », ou faut-il plus doux (quatre vivres) ou plus tendu (deux) ?
3. **Relais** : on part de la semaine 1, de la semaine qui suit chaque semaine franchie, et toujours des trois dernières semaines ouvertes (le sentiment d'avancer de partie en partie), ou de n'importe quelle semaine ouverte dès le premier jour (réglage `relaisLibres`) ?
