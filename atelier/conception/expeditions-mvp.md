# Expéditions : le plus petit mode roguelite qui tienne, et comment le construire en quelques jours

Document de conception, **version 2 du 24 octobre 2026** (elle remplace la version du 20 octobre, même fichier). Lecture seule du code : rien de ce document n'est écrit dans jeu/. Il répond aux deux demandes de Romain du 16 octobre 2026 :

- « le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie » ;
- « intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles ».

Angle : pragmatique et pédagogique. Le but est la plus petite version qui donne la sensation d'un roguelite (une route à embranchements, des choix, des dons temporaires, une progression permanente, une défaite qui n'efface rien) en réutilisant au maximum le moteur de bataille, l'écran de campagne, le conseil et les événements, sans toucher aux règles d'apprentissage : 7 réussites sur 10, variété des matières, notions à revoir, Seconde chance, aucune punition. D'abord le MVP (quatre jours de travail, section 16), puis deux incréments.

Ce qui change par rapport au 20 octobre : l'état du code et du contenu relu ce matin (section 0) ; la règle des **semaines minces**, parce que les semaines 4 à 8 n'ont encore que quelques cours chargés et que le quota « 2 questions sur 3 de la semaine » tournerait en rond sur 4 fiches (5.3) ; l'**embuscade se joue en défense** (le seul mode où une bataille de route peut vraiment se perdre, et le moteur sait déjà le faire : 6.1) ; le piège des **bonus de campagne** (mercenaires, espion) que la route ne doit pas consommer (11) ; l'alignement du vocabulaire, des prix de l'Armorial et de la structure de sauvegarde sur les deux conceptions sœurs, pour que ce MVP soit leur étape 1 (3) ; une **demi-journée de mesure au simulateur avant la première ligne de route**, pour remplacer les solidités devinées par des solidités mesurées (16, 17.2) ; le calcul de réussite refait (17.4).

Les deux documents voisins : atelier/conception/expeditions-hades.md (la version complète « à la Hadès » : 18 faveurs à trois rangs, duos, Serments, modificateurs d'élite, Chronique) et expeditions-spire.md (angle Slay the Spire : rangs et contraintes de génération, reliques, forge). Le présent document est le noyau commun : même vocabulaire (expédition, halte, porte, gardien, faveur, vivres, renommée, Armorial), mêmes accroches dans le code, même bloc de sauvegarde (en plus petit). Les différences sont dites en section 3.

## 0. Repères : l'état du code et du contenu au 24 octobre 2026

Relu sur les fichiers eux-mêmes ce matin (les chantiers « cours des semaines 4 à 8 », « personnages » et « revue du moteur » tournent en même temps : ces chiffres bougent de jour en jour, ce qui ne change rien aux règles ci-dessous).

- **Jeu 0.8.0**, sauvegarde au **schéma 5** (`SCHEMA = 5` dans jeu/js/sauvegarde.js, migrations 1 → 5 ; le numéro 6 est libre : le test « Sauvegarde d'un schéma plus récent (6) refusée » de tests.js passera à 7). 228 `verifier(...)` dans atelier/outils/tests.js.
- **Contenu indexé** (jeu/data/index-cours.js) : 34 cours et séquences, **1 585 questions jouables**, 284 fiches : semaines 1 à 3 du planning (S1 : 363 questions, S2 : 314, S3 : 213), 5 fiches méthode (187), 3 cours de grammaire du Griffon de cuivre (112), 3 séquences d'anglais (396). **Frontière d'aujourd'hui : S3.**
- **Contenu présent mais pas encore indexé** (jeu/data/cours, chantier en cours) : histoire S4 à S8 (8 cours), géographie S4, S7, S8 (4 cours), SVT S4 (2 cours), et pendant que j'écris arrivent physique S4 à S8 et SVT S5. Avec les fichiers comptés ce matin : S4 : 5 cours, 23 fiches, 178 questions ; S5 : 2 cours, 8 fiches, 70 ; S6 : 1 cours, 4 fiches, 37 ; S7 : 2 cours, 8 fiches, 69 ; S8 : 4 cours, 18 fiches, 156. Le planning prévoit S4 : 8 cours, S5 : 8, S6 : 6, **S7 : 3 seulement** (géographie, lecture suivie, histoire), S8 : 10. Dès qu'index-cours.js listera ces fichiers, la frontière passera à S8 : c'est la **semaine du calendrier d'aujourd'hui** (S8 = du 19 au 25 octobre 2026, `JEU.calendrier.semaine`).
- **Le chantier « semaine visible dans les questions » n'a encore rien livré** : aucun mot « semaine » dans jeu/js/bataille.js, interface.js, recit.js ni questions.js. Le MVP prévoit donc son propre repli (`JEU.expedition.semaineDe`, `r.semaine` dans le cadre du récit), à remplacer par ce que livrera ce chantier.
- **Le tirage unique** : `JEU.recit.suite(nombre, options)` avec `types`, `exclure`, `filtre`, `completer` ; dedans, `tirage()` → `JEU.leitner.tirer` (équilibre des familles sur `historique`, priorités à revoir, fenêtre de 60, repos des fiches), puis `JEU.rappels.placer` (Seconde chance) et `eviterTriples`. En bataille, `JEU.questions.avecNiveaux(NIVEAUX_BATAILLE, …)`. Aucune option `quota`.
- **Le moteur** (jeu/js/bataille-moteur.js) : `creer(carte, options)` lit `vagues`, `orDepart`, `pvChateau`, `pvRival`, `pvRivalMax`, `niveau`, `bonusDegats`, `arsenal`, `orParReponse`, `orPerduErreur`, `espion`, `defense` (`o.defense != null ? !!o.defense : carte.id === "domaine"` : le mode défense marche sur n'importe quelle carte). Table `RIVAL` à cinq lignes (niveaux 0 à 4) réglée au simulateur le 16/10 ; revue du 24/10 en cours (posture « méfiance », guetteurs qui comptent l'or gardé, 36 gardes rappelés au plus) : rien de tout cela ne touche aux options que le MVP utilise. `repondre(p, juste)` fait l'or des réponses ; le champion sort à la dernière vague quel que soit leur nombre (`composerVague`).
- **Le rendu** (jeu/js/bataille.js) : `JEU.bataille.lancer(lieu)` (un seul paramètre) construit tout depuis la campagne : `C.options(niveau)` + `vagues`, `orPerduErreur`, `pvRival` ; `tirerQuestions(n, posees)` ; `JEU.recit.cadre(q, defense ? "defense" : "preparation", adv)` ; `motDuRival` (`phraseRival`, p.ia.journal, `C.rivalDe(frontId)`) ; `JEU.partie.surQuitter` et `bilan()` appellent `C.apresBataille(...)` ; `retour()` → `JEU.ui.afficher("jouer")`. Boutons de vitesse ×1, ×2, ×3 (`v.vitesse`, par bataille). Garde : « Pas encore assez de questions pour une bataille » si le premier lot a moins de 3 questions.
- **La campagne** (jeu/js/campagne.js) : `options(niveau)` renvoie `{ niveau, orDepart: 60 + 5·min(Trésor, 12) + c.bonus.or, pvChateau: 20 + Peuple/2 + 4·remparts, bonusDegats: 0,025·min(Garde, 12), orParReponse: 12 + Savoir/3, arsenal, espion: !!c.bonus.espion }` ; `apresBataille(bilan)` vide `c.bonus` ; `jouerEvenement()` sans paramètre, lit `c.evenement`, marque l'événement du jour fait ; `missiveAvantBataille(lieu)` (une bataille sur deux) ; `reagir(frontId, situation)` **n'est pas exporté** ; exportés : `rivalDe`, `souverain`, `monterRivalite`, `noter`, `prochaineProvince`, `missiveAvantBataille`, `prendreMissives`, `EVENEMENTS`, `GAINS_RIVALITE`.
- **L'écran de campagne** (jeu/js/ecran-campagne.js) : la grille `grille-jeux` (cartes numérotées 1, 2, 3…, `JEU.ui.clavier` prend le numéro), `medaillon(p, taille)`, `medaillonHeraldique(camp, generique)` (tortil pour « un seigneur rival »), `sceau(camp)`, `ouvrirMissive`, `lancerBataille(lieu)`. Icônes Game-icons disponibles (jeu/assets/icones/game-icons.js) : assaut, mercenaires, marchand, camp, defi, couronne, trompe, tresor, parchemin-plume, chroniqueur, routes, remedes, alambics, alliances, sceau, valider, rallier… Sprites : `lieu-brume`, `lieu-france`, `lieu-angleterre`, `lieu-omeyyades`.
- **L'interface** (jeu/js/interface.js) : `ui.ecrans[nom](section, arg)` et `ui.afficher(nom)` (refusé pendant une partie, sauf « partie ») ; `ui.commencerPartie(titre, quitter)` / `ui.finirPartie()` ; `ui.poserQuestion(q, zone, fini, options)` avec `options.recit` ; `ui.recit(r)` (portrait, nom, étiquette, texte) ; `ui.panneauErreur(q, zone, suite)` (trois paramètres, bouton « Voir la fiche » toujours présent) ; `ui.clavier` reçoit la touche de l'écran actif, Échap n'est traité à part que pendant une partie.
- **Personnages** (jeu/data/personnages.js) : Clovis, Pépin le Bref, Charlemagne (seuils 0, 3, 6) ; « Le roi d'Angleterre » et « L'émir de Cordoue » en titre seul ; situations des rivaux : presentation, defi, victoire, tenu, retraite, province, attaque. Les six conseillers existent (`JEU.recit.CONSEILLERS`), et l'interprète a 396 questions d'anglais derrière lui.
- **Simulateurs** : atelier/outils/simuler-bataille.js (modules chargés par `new Function` avec une fausse fenêtre et `Math.random` à graine mulberry32 ; `PROGRESSION[niveau]` ; `optionsBataille(niveau)` ; `jouerBataille(carteId, o, p, graine, strategie)` ; `attaque()` avec 12 batailles au plus ; `defense()` à 3 vagues, place 12 ; options `--graines`, `--p`, `--niveaux`, `--regle`, `--comparer`, `--strategies equilibre,rush,tortue,attente`), mesurer-tirage.js (bac à sable vm, modules `MODULES`, trois élèves simulés, `jouerSeance`), perf.js (Playwright : bataille, événement, conseil, export et import, < 100 ms).

## 1. En deux mots

Une **expédition** est une partie à part, lancée depuis la carte de campagne, de 20 à 40 minutes, qu'on peut quitter et reprendre à tout moment. Le joueur choisit une **semaine de départ** et parcourt **trois semaines du programme de suite** (moins si la frontière est proche), une par **acte**. Chaque semaine est une petite carte à embranchements dessinée sur un parchemin : deux rangées de **haltes** au choix (escarmouche, embuscade, événement, marchand, bivouac), puis le **gardien de la semaine**. Le gardien de la dernière semaine est le **grand gardien** : le rival du front, en personne.

- Chaque halte pose des questions par le tirage habituel du jeu. Une seule règle de plus : **deux questions sur trois viennent des cours de la semaine traversée** (ou, quand la semaine est encore mince, des deux ou trois dernières semaines), la troisième vient du tirage ordinaire (toutes semaines, équilibre des familles de matières, priorités « à revoir », Seconde chance). On voit les semaines défiler ; les anciennes reviennent quand même.
- Les réponses paient tout : l'or du conseil de guerre comme aujourd'hui, l'**or de route** (le marchand), le choix des **faveurs** (des dons des conseillers du domaine, un par famille de matières, valables pour l'expédition seulement).
- La **renommée** reste pour toujours. Elle paie l'**Armorial** (quatre améliorations permanentes dans le MVP), qui rend chaque expédition suivante un peu plus facile. Une défaite (plus de **vivres**) renvoie au domaine avec la renommée gagnée. Rien n'est jamais retiré au royaume : ni province, ni bâtiment, ni ressource, ni jauge, ni cours.
- La difficulté monte avec la semaine traversée (le réglage du seigneur rival suit la semaine comme il suit aujourd'hui le niveau de la province) et, dans chaque semaine, de la première halte au gardien. Partir plus loin dans l'année rapporte plus de renommée.

Le MVP tient en deux fichiers nouveaux (jeu/js/expedition.js, sans DOM, testé sous Node ; jeu/js/ecran-expedition.js, l'écran), cinq accroches facultatives dans le code existant (un `contexte` pour `JEU.bataille.lancer`, un `quota` pour `JEU.recit.suite`, un `extra` pour `JEU.recit.cadre`, un paramètre pour `JEU.campagne.jouerEvenement`, un export), quelques lignes d'affichage (section 15), un schéma de sauvegarde (6), et **aucun changement du moteur de bataille** : les six faveurs du MVP passent toutes par des options que `M.creer` lit déjà.

## 2. Ce que les règles imposent, et ce que je tranche

| Règle (CLAUDE.md, cahier des charges) | Dans les expéditions |
|---|---|
| Jamais de chrono | Aucune horloge, aucun compte à rebours. La route a des « haltes restantes », jamais un temps. La durée estimée affichée au départ est une information, pas une limite. |
| Difficulté réglée pour 7 réussites sur 10 | Le tirage des niveaux de questions ne change pas (niveau conseillé, batailles aux niveaux 1 à 3, le reste aux niveaux 1 et 2). La difficulté du mode porte sur la bataille (niveau du rival par semaine), jamais sur les questions. |
| Une erreur ne coûte ni bâtiment, ni province, ni ressource du royaume ; en bataille, un peu d'or de la bataille | Inchangé : −6 or de la bataille en cours, jamais sous zéro. Les **vivres** sont créés au départ de l'expédition et rendus au retour ; on en perd un quand les murs cèdent dans une bataille de route, **jamais pour une question**, jamais pour un événement. |
| Une question ratée revient (« Seconde chance ») | Inchangé : la file des rappels traverse les haltes comme elle traverse aujourd'hui batailles, conseils et événements. Une question ratée au bivouac revient trois questions plus tard, au conseil de guerre de l'escarmouche suivante. |
| Un cours s'ouvre dès que son fichier existe ; le calendrier ne bloque rien | **Frontière** = la dernière semaine du planning qui a au moins un fichier de cours chargé. La semaine du calendrier est affichée (bannière « Cette semaine »), elle ne verrouille rien. En pratique les deux coïncident : Romain dépose les cours au fil de l'année. |
| Un cours pas encore ouvert reste dans la brume | Au-delà de la frontière : nappes de brume, numéro de semaine et « n cours à venir », sans titre, sans question, sans aperçu. |
| Chaque question est posée dans le récit | Nouvelles phrases de cadre (7.4), avec la semaine dite par le conseiller. L'énoncé ne change jamais. |
| Carte de campagne à la Total War, enluminure, héraldique | Parchemin d'itinéraire à la manière des cartes d'itinéraire médiévales : une route horizontale, des vignettes-médaillons, une lettrine rubriquée par semaine, les nappes de brume existantes (14). |
| Conflits : camps politiques, ton neutre ; adversaires = ceux du cours, sinon « un seigneur rival » | Le gardien d'une semaine est « un seigneur rival » (le générique prévu par CLAUDE.md, médaillon héraldique au tortil). Le grand gardien est le rival du front (personnages.js : « Le roi d'Angleterre », « L'émir de Cordoue », en titre seul). Aucun nom inventé, aucune figure religieuse, aucun lieu de culte dans les haltes ni les événements de route. |
| Bonus jamais en bataille, dans un siège ou un boss | Le tirage les exclut déjà (contrôle 6 du validateur). |
| Pas d'épreuve de validation | Un gardien vaincu ne change ni suivi.js, ni l'état d'un cours. Il ne vaut que de la renommée et une case scellée sur le parchemin de l'année. |
| Contenu des cours uniquement depuis les fichiers déposés | Les textes de route (phrases de cadre, faveurs, pages de semaine, bilan) sont des textes de jeu sans fait de cours, soumis aux mêmes interdits que les répliques de personnages.js (ni chiffre de cours, ni religion, ni insulte, ni nom de personnage dans la bouche d'un rival). |
| Moins de 100 ms entre une réponse et la question suivante | Les faveurs sont résolues une fois, en options de `M.creer`. Le quota de semaine ajoute un passage de `tirage()` au début d'une vague ou d'une halte, jamais entre deux questions. |
| Si le cahier ne tranche pas : le plus simple, noté au journal | Les décisions ci-dessous. |

Décisions prises faute d'arbitrage (à reporter dans docs/JOURNAL.md, rubrique Décisions, à la livraison) :

1. **La semaine de départ se choisit librement** parmi les semaines ouvertes (1 à frontière), avec pour défaut **le tronçon de l'année en cours** (frontière − 2). On ne repart pas toujours de la semaine 1 comme dans Hadès : l'élève passerait son année à rejouer septembre, et le but est de réviser ce qu'il travaille. On ne verrouille pas non plus les semaines les unes derrière les autres : la règle du projet est qu'un cours ouvert est jouable partout. La **profondeur** (partir plus tard dans l'année, donc contre un rival plus fort) est le choix du joueur et sa récompense (plus de renommée). Les semaines déjà **franchies** (gardien vaincu) se voient, scellées, sur le parchemin de l'année : c'est le sentiment de couvrir l'année. Les « relais » des conceptions sœurs (ouverts semaine après semaine) sont compatibles : `franchies` est déjà dans la sauvegarde, un réglage `relais: true` les active en incrément 2 sans migration.
2. **Une expédition = 3 semaines au plus** (config.js), 2 rangées de haltes par semaine dans le MVP, pour tenir 20 à 40 minutes. Trois semaines à partir de la frontière − 2 : avec les cours d'aujourd'hui (S1 à S3), une seule expédition possible, S1 → S3 ; dès que les semaines 4 à 8 seront indexées, le défaut sera S6 → S8.
3. **La défaite vient des vivres** (3 au départ), perdus un par bataille où les murs cèdent, jamais par une question ni par un événement. Un gardien raté se retente tant qu'il reste des vivres, et les coups portés à son camp restent (comme pour une place forte de la campagne).
4. **Les faveurs se méritent par une question** du conseiller qui les offre : juste, trois faveurs au choix ; fausse, deux. Jamais de porte vide, jamais de faveur imposée.
5. **Rien de permanent ne vient des faveurs.** La renommée et l'Armorial sont la seule progression entre deux expéditions. Les ressources du domaine gagnées par bonne réponse (règle générale de `enregistrerReponse`) restent acquises comme partout : même une expédition perdue fait grandir le domaine.
6. **Les embuscades, les gardiens et le grand gardien se jouent en défense** (le mode `defense` du moteur : troupes d'assaut, coups aux murs doublés), **les escarmouches en attaque**. En attaque, le rival ne fait presque jamais céder tes murs (ses troupes ordinaires portent 1 ou 2 coups, ton château en a 20 et plus) : les vivres n'auraient d'enjeu nulle part. Le mode défense est déjà réglé pour « inquiéter un peu » (tenue 73 à 83 % à 7 sur 10 sur trois vagues, 89 à 95 % à 8 sur 10 : journal du 16/10/2026, Décisions) : c'est exactement le frisson d'un élite ou d'un boss de semaine. L'escarmouche reste en attaque : son enjeu est la **victoire éclatante** (le camp adverse tombe), qui double la porte.
7. **La route ne consomme rien de la campagne** : les bonus de l'événement du jour (mercenaires, espion) restent pour la prochaine bataille de campagne ; la route a son propre « plan de bataille » et son propre espion (11).

## 3. Rapport avec les deux conceptions sœurs

Gardé tel quel dans les trois documents : le vocabulaire (expédition, acte, halte, porte, gardien, grand gardien, faveur, vivres, or de route, renommée, Armorial, frontière, brume), la route par semaines avec un gardien par semaine, le quota « 2 questions sur 3 de la semaine » par l'option `quota` de `suite`, la règle des semaines minces et ses seuils (`quotaPlein: 12`, `quotaDemi: 5`), les vivres, le schéma 6 et la forme du bloc `expedition`, le principe « rien du royaume ne baisse », la graine mulberry32 et la route écrite dans la sauvegarde, les accroches du code (section 15), les gardiens en défense, le piège des bonus de campagne.

Réduit dans le MVP, à reprendre en incrément 2 et 3 :

| Version complète (Hadès) ou Spire | MVP | Pourquoi |
|---|---|---|
| Relais ouverts en franchissant les semaines (les deux sœurs) | Départ libre, défaut = le tronçon de l'année en cours | Pas de verrou sur des cours ouverts ; une seule règle à coder ; `franchies` déjà sauvegardé, le réglage `relais` viendra |
| 3 couches par semaine (Hadès), 4 rangs (Spire) | 2 couches (config.js : `couches`) | Tient dans 20 à 40 minutes avec des gardiens à 2 vagues ; la 3e couche est un réglage, pas du code |
| 7 types de haltes, trésor, archives, rencontres nouvelles | 5 types ; « les archives » est un événement de route de plus, tiré avant la semaine de départ | Trésor et rencontres nouvelles : textes à écrire et à relire ; incrément 2 |
| 18 faveurs à 3 rangs, duos, éruditions (Hadès) ; 24 faveurs et 12 reliques (Spire) | 6 faveurs (une par conseiller), rang 1 et 2 (reprise = effet doublé), toutes par des options existantes de `M.creer` | Aucun changement du moteur dans le MVP ; les rangs rares et les duos viennent avec l'option `faveurs` du moteur |
| Modificateurs d'élite, Serments, prime d'ardeur | Embuscade = défense à 2 vagues, sans modificateur ; pas de Serment | Le moteur n'a pas encore d'option `rivalRegle` |
| Table du rival interpolée par semaine (Hadès), palier par tranche de trois semaines (Spire) | Niveau = (semaine − 1) div 2, plafonné à 4 ; grand gardien au niveau + 1 | Les cinq lignes `RIVAL` sont déjà réglées au simulateur ; le pas de deux semaines fait monter le niveau **à l'intérieur** d'une expédition de trois semaines (S6 → S8 : 2, 3, 3 puis 4) ; à trancher au simulateur en incrément 2 |
| 9 quartiers d'Armorial (980 points), titres, Chronique des expéditions | 4 quartiers (625 points, mêmes prix que les quartiers homonymes de la version Hadès) ; historique des 20 dernières expéditions dans la sauvegarde, affiché au départ | Le reste est de l'affichage, pas du jeu |
| Missives nouvelles dans personnages.js | Réutilisation des situations existantes (`defi` avant le grand gardien, `victoire` après) | Pas de texte nouveau à faire passer au contrôle 10 |
| Semaines minces : 1 sur 3 sur S−1 et S (Hadès) | La fenêtre de l'acte s'élargit aux semaines précédentes (deux au plus) jusqu'à 12 fiches, et le quota 2 sur 3 porte sur la fenêtre | Garde le sentiment de « semaine » plus longtemps ; mêmes seuils, même réglage ; une ligne à changer si Romain préfère la règle de la version Hadès |

## 4. La boucle d'une expédition

### 4.1 Vocabulaire

- **Expédition** : une partie du mode (un « run »).
- **Départ** : la semaine de départ, choisie parmi les semaines ouvertes. **Arrivée** : `min(départ + semaines − 1, frontière)`.
- **Acte** : une semaine du programme, traversée en 2 haltes (une par couche) puis un gardien. Affichée partout « Semaine 4 », et sous la carte « Semaine 4 · du 21 au 27 septembre 2026 » (`JEU.calendrier.lundiDe`, `libelle`).
- **Couche** : une rangée de 2 ou 3 haltes ; on en joue une.
- **Halte** : un nœud de la route. **Porte** : la récompense annoncée sur une halte de bataille. **Gardien** : la bataille qui ferme la semaine. **Grand gardien** : celle qui ferme l'expédition.
- **Fenêtre d'un acte** : la ou les semaines d'où viennent ses questions de quota (sa semaine, élargie en arrière si elle est mince : 5.3).
- **Frontière** : la dernière semaine ouverte. Au-delà : brume.
- **Vivres** : les « vies » de l'expédition. **Or de route** : sa monnaie (le marchand). **Faveurs** : les dons des conseillers, pour l'expédition seulement. **Renommée** : la monnaie permanente. **Armorial** : les améliorations permanentes.

### 4.2 Déroulé

1. **Partir.** Sur la carte de campagne, la carte de jeu « Partir en expédition » (ou « Reprendre l'expédition · semaine 5, 1re halte »). L'écran de départ montre : le parchemin de l'année (34 cases, les semaines franchies scellées, la frontière, la brume au-delà, la bannière « Cette semaine »), le choix de la semaine de départ (flèches ← →, défaut : frontière − 2), le front (vers l'ouest contre le royaume d'Angleterre, vers le sud contre l'Empire omeyyade : terrains de la variante sèche, couleurs du camp, rival du grand gardien), l'Armorial (acheter avec la renommée), les vivres et l'or de départ qu'on aura, la durée estimée (« environ 30 minutes, reprise possible à chaque halte »), et une phrase du souverain servi : « {souverain} te confie la route des semaines 6 à 8. Reviens couvert de renommée. » (texte du jeu dans expedition.js avec le nom de `JEU.campagne.souverain()` ; sans souverain ouvert : « Le royaume te confie… »).
2. **La page de semaine.** À l'entrée de chaque semaine, une page d'enluminure « Semaine 6 · du 5 au 11 octobre 2026 », la liste des cours ouverts de la semaine (les titres du planning, déjà visibles dans l'écran Cours ; un cours prévu sans fichier compte « à venir », sans titre), la phrase du chroniqueur selon l'épaisseur de la semaine (5.3), le gardien qui attend au bout. Bouton « En route (Entrée) ».
3. **La route.** On choisit une halte atteignable dans la couche 1, on la joue, puis une dans la couche 2 (parmi celles reliées à la première), puis le gardien. Après chaque halte, la sauvegarde est écrite : on peut quitter et reprendre là.
4. **Le gardien.** Défense d'un camp de route, 2 vagues (3 pour le grand gardien), contre « un seigneur rival » (le rival du front pour le grand gardien). Tenu ou victoire : semaine franchie, page de la semaine suivante. Murs cédés : −1 vivre, le gardien se retente (les coups portés à son camp restent).
5. **La fin.** Grand gardien vaincu : **retour triomphal** (bilan, renommée, +3 coups à la prochaine place forte du front, missive du rival). Plus de vivres : **retour au domaine** (même bilan, renommée gagnée, rien de perdu). Abandon depuis la carte (« Lever le camp », avec confirmation) : même bilan.

### 4.3 Forme de la route (départ S6, frontière S8, 2 couches)

```
 Semaine 6 (niveau 2)                 Semaine 7 (niveau 3)             Semaine 8 (niveau 3, grand gardien 4)
 [départ] ─┬─ escarmouche ─┬─ marchand ─┐
           │               ├─ embuscade ┼─ GARDIEN S6 ─┬─ (2 couches dans la brume) ─ GARDIEN S7 ─┬─ (brume) ─ GRAND GARDIEN S8 ─ [retour]
           └─ événement ───┴─ bivouac ──┘
 Semaine 9 et au-delà : brume, « 6 cours à venir »
```

- 2 couches par semaine, 2 ou 3 haltes par couche (2 une fois sur deux). Chaque halte mène à une ou deux haltes de la couche suivante, sans croisement (12). Toute halte est atteignable depuis le départ et mène au gardien.
- On voit : les deux couches de la semaine en cours avec le type de chaque halte et sa **porte** ; les semaines suivantes de l'expédition sous une nappe de brume, leur gardien en silhouette ; au-delà de la frontière, la brume et le numéro de semaine.
- Nœuds joués par expédition de trois semaines : 9 (6 haltes, 2 gardiens, 1 grand gardien). Questions : environ 45.
- Cartes de bataille : les cinq tracés existants tournent avec la semaine, `["gue", "foret", "moulin", "col", "chateau"][(semaine − 1) % 5]`, variante sèche (`-sud`) quand l'expédition va vers l'Empire omeyyade (bataille.js la choisit déjà d'après le camp) ; le grand gardien attend sur la carte de la **prochaine province du front** (`C.prochaineProvince(front).province.carte`, sinon `chateau`) : il garde la place que tu convoites. Le moteur joue une défense sur n'importe quelle carte.

### 4.4 Durée

| Nœud | Questions | Vagues | Durée à ×1 (15 à 20 s par question, 50 s par vague) |
|---|---|---|---|
| Escarmouche (attaque, 2 vagues) | 6 | 2 | 3,5 à 4 min |
| Embuscade (défense, 2 vagues) | 6 | 2 | 4 min |
| Événement | 2 ou 3 | — | 1 min |
| Marchand | 1 | — | 1 min |
| Bivouac | 1 | — | 0,5 min |
| Gardien (défense, 2 vagues) | 6 | 2 | 4 min |
| Grand gardien (défense, 3 vagues) | 9 | 3 | 6 min |

Une semaine ordinaire : une bataille (4 min) + une halte légère (1 min) + le gardien (4 min) ≈ 9 min, 11 avec deux batailles. Trois semaines : 27 à 33 min ; à ×2 sur les vagues (boutons existants ; la vitesse choisie est retenue d'une halte à l'autre dans `enCours.vitesse`), 20 à 25 min. Une expédition d'une seule semaine (départ = frontière) : 10 à 12 min. Les pages de semaine, les portes et le bilan ajoutent 2 à 3 minutes. Une séance type de l'élève fait 15 à 20 minutes : l'expédition est faite pour être jouée en deux fois, et la reprise est possible après chaque nœud.

## 5. Les semaines : frontière, départ, brume, semaines minces

### 5.1 Semaine d'un cours, frontière, départ

- **Semaine d'un cours** (`JEU.expedition.semaineDe(coursId)`, à partager avec le chantier « semaine visible dans les questions », idéalement dans `JEU.progression`) : `entree(coursId).semaine`, ou `null` pour un cours de langue, une fiche méthode ou une séquence d'anglais (ils n'ont pas de semaine ; ils arrivent par la troisième question de chaque lot, avec l'équilibre des familles ; on les appelle les **compagnons de route**).
- **Frontière** (`JEU.expedition.frontiere()`) : la plus grande semaine parmi `JEU.progression.coursAccessibles()` dont l'entrée du planning est de type cours. Aujourd'hui 3 ; 8 dès que les fichiers des semaines 4 à 8 seront indexés. Aucun cours chargé : la carte de campagne ne propose pas le mode (« La route attend tes premiers cours »).
- **Départ** : 1 à frontière, défaut `max(1, frontière − semaines + 1)`. **Arrivée** : `min(départ + semaines − 1, frontière)`. Partir de la frontière donne une expédition d'une semaine, grand gardien direct.
- **Semaine sans aucun cours chargé** entre le départ et l'arrivée (un trou dans les dépôts) : elle n'est pas un acte ; la route passe à la suivante et la page de semaine le dit (« Semaine 5 traversée sans halte : ses cours ne sont pas encore déposés »). L'arrivée se compte alors en semaines ouvertes.
- **Cette semaine** : la semaine du calendrier (`JEU.calendrier.semaine()`), plantée en bannière sur le parchemin de l'année. Si elle dépasse la frontière (cours pas encore déposés), elle est dans la brume, ce qui dit à l'élève que les cours arrivent.
- Après S34 (révision libre) : toutes les semaines restent jouables ; aucune nouvelle n'arrive.

### 5.2 Semaines franchies et brume

- **Semaines franchies** : chaque semaine dont le gardien (ou le grand gardien) a été vaincu une fois, pour toujours. Scellée sur le parchemin de l'année (cire aux couleurs du front où on l'a franchie). Ce n'est ni un état de cours, ni une validation : un sceau de jeu.
- **Brume** : au-delà de la frontière, la route montre le numéro de semaine et « n cours à venir » (le compte des entrées de type cours du planning), rien d'autre : ni titre de halte, ni question, ni gardien nommé.

### 5.3 Les semaines minces (règle nouvelle du 24 octobre)

Avec le contenu d'aujourd'hui, S6 n'a qu'un cours chargé (4 fiches, 37 questions), S5 et S7 en ont deux (8 fiches). Un quota de deux tiers sur 4 fiches ferait tourner les mêmes notions en boucle, et le repos des fiches (10 questions) ou la fenêtre anti-répétition (60, ramenée à la moitié des questions disponibles) le relâcherait de toute façon : on perdrait le sentiment de semaine sans rien gagner. Règle, calculée au départ de l'expédition pour chaque acte, sur les **fiches candidates** de la semaine (cours chargés, au moins une question jouable), et écrite dans la route (`route[i].semaines`, `route[i].quota`) pour qu'un dépôt en cours d'expédition ne change rien :

| Fiches candidates | Fenêtre de l'acte | Quota | Ce que dit la page de semaine |
|---|---|---|---|
| 12 et plus | la semaine seule | 2 sur 3 | « Les cours de la semaine 6 t'attendent sur la route. » |
| moins de 12, mais 12 et plus en élargissant à la semaine précédente, puis à celle d'avant (deux au plus) | S−1 et S, ou S−2 à S | 2 sur 3 sur la fenêtre | « La semaine 6 est encore mince sur les registres : la route repasse aussi par la semaine 5. » |
| 5 à 11 même élargie | la fenêtre élargie | 1 sur 3 | « Peu de cours déposés pour la semaine 6 : une question sur trois en vient, le reste vient de tout le royaume. » |
| moins de 5 | — | aucun (tirage ordinaire, étiquette de semaine quand même) | « La semaine 6 attend ses cours : la route puise dans tout le royaume. » |

Avec les fichiers comptés ce matin : S4 (23 fiches) → quota plein sur S4 ; S5 (8) → fenêtre S4-S5 (31) → plein ; S6 (4) → S5-S6 (12) → plein ; S7 (8) → S6-S7 (12) → plein ; S8 (18) → plein. Dès que SVT, physique, littérature et lecture des semaines 4 à 8 seront là, chaque semaine se suffit. Les seuils vivent dans `config.expedition` (`quotaPlein: 12`, `quotaDemi: 5`, les mêmes que dans la conception Hadès), et `mesurer-tirage.js --expedition` les contrôle (17.3). L'étiquette d'une question dit toujours **sa** semaine (« Semaine 5 ») : dans une fenêtre S5-S6, elle est de la route ; hors fenêtre, elle est « d'une autre semaine ».

## 6. Les haltes

### 6.1 Les cinq types du MVP, les gardiens

| Halte | Icône (jeu/assets/icones, déjà là) | Ce qui se passe | Questions | Réussite | Échec |
|---|---|---|---|---|---|
| **Escarmouche** | assaut | Bataille d'**attaque**, 2 vagues, sur la carte de la semaine, contre un camp de route (solidité 8), niveau de la semaine. Conseil de guerre : 3 questions par vague. | 6 (niveaux 1 à 3) | Tenu (murs debout) : porte simple. **Éclatante** si le camp tombe : porte doublée. | Murs cédés (rare en attaque) : −1 vivre ; porte simple quand même (l'effort compte). |
| **Embuscade** | mercenaires | On vous tombe dessus : bataille de **défense** (troupes d'assaut, coups aux murs ×2), 2 vagues, sur la carte de la semaine, camp adverse de solidité 10, niveau de la semaine. Toujours une porte de faveur. | 6 | Tenu : porte simple ; éclatante (camp abattu) : porte doublée. | Murs cédés : −1 vivre ; la halte est passée quand même, porte simple. |
| **Événement** | celle de l'événement | Un des cinq événements du jour existants (marchands, défi du champion, mercenaires, feu au grenier, espion), rejoué par `JEU.campagne.jouerEvenement(ev, contexte)` avec des gains de route (6.2) ; ou **les archives** (nouveau, 6.2). | 2 ou 3 (niveaux 1 et 2) | Toujours « fait » | Jamais de perte |
| **Marchand** | marchand | Le maître d'œuvre tient l'étal. Une question (de sa matière) ouvre l'étal ; juste, les prix baissent de 20 %. Puis achats avec l'or de route : une faveur au choix parmi deux (40), un sac de vivres (35, jusqu'au maximum), un plan de bataille (+25 or au début de la prochaine bataille de route, 15). | 1 | — | — |
| **Bivouac** | camp (feu de camp) | La veillée : le ménestrel (ou le maître scribe) pose une question. Puis un choix : +1 vivre (jusqu'au maximum, sinon +20 or de route), ou +20 or de route, ou une faveur au choix parmi deux (seulement si la question est juste). | 1 (niveaux 1 et 2) | — | — |
| **Gardien de la semaine** | defi | **Défense** d'un camp fortifié, 2 vagues, niveau de la semaine, contre « un seigneur rival ». Tenu ou victoire (son camp de 12 points tombe ; les coups restent entre deux tentatives). | 6 | Semaine franchie | Murs cédés : −1 vivre, on retente |
| **Grand gardien** | couronne (médaillon du rival) | Même règle, 3 vagues, niveau + 1 (plafond 4), camp de 16 points, sur la carte de la prochaine province du front. Missive de défi du rival avant (une fois sur deux, comme avant une bataille de campagne), réaction après. | 9 | Expédition réussie | Murs cédés : −1 vivre, on retente |

« Réussite » et « échec » ne parlent que des murs. Une question ratée coûte au plus 6 or de la bataille en cours, comme partout. Pourquoi deux batailles en défense qui se ressemblent (embuscade, gardien) : l'embuscade est un **choix** (une porte de faveur garantie contre un risque), le gardien est un **passage obligé** qui se retente ; l'une se joue en 2e couche et prépare l'autre.

### 6.2 Les événements de route

Les cinq événements du jour se rejouent tels quels : `jouerEvenement(ev, contexte)` prend l'événement en paramètre au lieu de le lire dans `c.evenement`, ne marque pas l'événement du jour comme fait, demande ses questions à `contexte.tirage(n)` (quota de l'acte), et à la fin appelle `contexte.cloturer(id, bonnes, total)`, qui applique le gain **de route** et rend la phrase du bilan, puis `contexte.retour()`. Gains de route (ce qui est immédiat et sans conséquence sur la campagne reste, ce qui visait « la prochaine bataille de campagne » devient « la prochaine bataille de route ») :

| Événement | Gain de campagne (inchangé si joué depuis la campagne) | Gain sur la route |
|---|---|---|
| Des marchands à la porte | 2 ressources par bonne réponse | identique (les ressources du domaine sont acquises partout) et +4 or de route par bonne réponse |
| Le défi du champion | 3 coups à une place forte | 3 coups au **gardien de la semaine** (`places[gardien] = max(1, … − 3)`) |
| Des mercenaires | +40 or à la prochaine bataille de campagne (`c.bonus.or`) | +40 or à la prochaine bataille de route (`enCours.plan`) |
| Le feu au grenier | +1 Peuple par bonne réponse | identique, et +1 vivre si deux réponses justes (jusqu'au maximum, sinon +20 or de route) |
| Un espion démasqué | première vague adverse affaiblie (`c.bonus.espion`) | première vague affaiblie à la prochaine bataille de route (`enCours.espion`) |

Rien à écrire : les textes d'introduction existent, seules les phrases de bilan de route s'ajoutent (une par événement, textes de jeu). Un événement nouveau, propre à la route : **les archives** (le chroniqueur) : 3 questions tirées **avant la semaine de départ** (`quota: { nombre: 3, filtre: semaine < départ }` ; depuis le départ S1, le filtre devient « fiche à revoir » par `JEU.progression.fichesARevoir`), renommée doublée pour la halte. C'est la halte qui ramène les semaines anciennes au premier plan ; une expédition en a toujours au moins une (garantie de 6.3). Les événements du jour tournent sans répétition dans l'expédition.

### 6.3 Répartition des types (tirée à la graine)

| Couche | Escarmouche | Embuscade | Événement | Marchand | Bivouac |
|---|---|---|---|---|---|
| 1re | 60 % | 0 | 30 % | 0 | 10 % |
| 2e | 25 % | 25 % | 10 % | 25 % | 15 % |

Garanties par semaine, appliquées après le tirage dans un ordre fixe (chaque correction remplace la halte la plus à droite du type en trop par le type manquant) : au moins une escarmouche en 1re couche ; exactement un marchand en 2e couche ; au plus une embuscade, et **jamais comme seule halte atteignable** depuis une halte de la 1re couche (l'élite n'est jamais imposé) ; au plus une halte de chaque type par couche, sauf les escarmouches ; au moins un bivouac par semaine (en 2e couche s'il manque). Par expédition : au moins un événement « archives » (placé dans la 1re couche de la 2e semaine, ou de la seule semaine). Les contraintes sont vérifiées à la fin ; si l'une manque, la semaine est régénérée avec graine + 1 (vingt fois au plus), puis une semaine de secours fixe (escarmouche et événement, puis marchand et bivouac) : le jeu ne bloque jamais.

### 6.4 Les portes (récompense annoncée)

Chaque escarmouche et embuscade porte une récompense visible avant d'entrer, en petit écusson sur le médaillon :

| Porte | Part | Contenu | Éclatante |
|---|---|---|---|
| Faveur d'un conseiller | 60 % (100 % pour une embuscade) | Le médaillon du conseiller. À la fin de la bataille, il pose une question de sa matière puis offre ses faveurs (9.2). | Il ajoute une 4e faveur au choix |
| Bourse | 25 % | +20 or de route | +40 |
| Parchemin de renommée | 15 % | +10 renommée tout de suite | +20 |

Conseiller d'une porte de faveur : tiré parmi les conseillers dont la famille a des questions dans les cours chargés, pondéré ×1,5 si la famille a des notions à revoir (on rencontre plus souvent l'herboriste quand les SVT sont à revoir, donc plus de questions de SVT), ×1,5 si la famille a un cours dans la fenêtre de l'acte, jamais le même conseiller deux fois dans une semaine. Comme dans Hadès on choisit sa porte à la récompense ; ici la porte dit aussi quelle matière on va rencontrer : c'est le levier de variété le plus simple. Et la porte ne choisit jamais les questions de la bataille, qui restent au tirage.
