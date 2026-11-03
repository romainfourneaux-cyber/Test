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

## 7. Les questions dans l'expédition

### 7.1 Le tirage : deux questions de la semaine, une du royaume

Tout passe par `JEU.recit.suite`, le seul tirage du jeu, avec une option nouvelle, `quota` :

```js
// bataille de route, lot d'une vague (3 questions), comme tirerQuestions() de bataille.js
JEU.recit.suite(3, {
  exclure: ids, filtre: function (q) { return fiches.indexOf(q.fiche) < 0; }, completer: true,
  quota: { nombre: 2, filtre: function (q) { return acte.semaines.indexOf(JEU.expedition.semaineDe(q.cours)) >= 0; } }
});
```

Dans `suite()`, la liste `essais` reçoit deux essais de plus en tête, plafonnés à `quota.nombre` questions : `[filtre ∧ quota.filtre, souple 0]` puis `[filtre ∧ quota.filtre, souple 1]` (sans le repos des fiches) ; la suite du lot vient des essais existants. Un seul `JEU.rappels.placer` et un seul `eviterTriples` à la fin, comme aujourd'hui : les Seconde chance gardent leur place et leur unicité. Une douzaine de lignes (esquisse en 15).

- **Part visée** : 2 sur 3 dans chaque lot de bataille, 2 sur 3 dans un événement de 3 questions (1 sur 2 dans un événement de 2), 1 sur 1 au bivouac et au marchand (le quota est alors sur la **famille** du conseiller, `JEU.recit.famille(q.matiere) === fam`, pas sur la semaine), 3 sur 3 pour les archives (semaines avant le départ). Quand la fenêtre de l'acte a peu de questions libres, `completer` et le tirage ordinaire font le reste : le tirage ne bloque jamais, c'est déjà sa règle.
- **Équilibre des familles** : il continue de se faire sur l'historique commun (`recit.historique`, oubli 0,85), d'une halte à l'autre. Dans le quota, les familles candidates sont celles qui ont des cours dans la fenêtre de l'acte ; sur l'expédition entière, chaque famille présente doit rester entre 12 et 30 % (mesure : 17.3). « Jamais trois fois la même famille de suite » tient par `eviterTriples`. Les compagnons de route (grammaire, anglais, fiches méthode) viennent par la troisième question, à leur part.
- **À revoir** : inchangé (×1,5 dans la matière et pour la famille), dans le quota comme hors quota. Les fiches de a-retravailler.js d'une semaine traversée ressortent donc davantage, et les cours « à revoir » de suivi.js aussi. Les semaines 1 à 6, présumées acquises, sont des actes comme les autres : leur part de quota vient d'abord des notions dues et à revoir.
- **Anti-répétition** : inchangée (fenêtre de 60 questions, repos des fiches). Une expédition de 45 questions puise dans 1 585 questions ; une semaine pleine en a 200 à 360 : le quota ne force aucune répétition. Une semaine mince est élargie avant d'être tirée (5.3).
- **Niveaux** : batailles de route en `NIVEAUX_BATAILLE` (1 à 3, par `avecNiveaux`, comme bataille.js) ; événement, bivouac, marchand, archives, porte de faveur en 1 et 2 ; les Seconde chance suivent ces niveaux comme aujourd'hui (une question de niveau 3 ratée attend une bataille).

### 7.2 Ce que les réponses rapportent

- En bataille : l'or du conseil de guerre par le moteur (`M.repondre` : +12, +10 au 3e succès d'affilée, −6 par erreur sur l'or de la bataille, jamais sous zéro), modifié par les faveurs (Annales, Chant de marche).
- Partout : 1 ressource du domaine par bonne réponse (règle générale), **+1 renommée par bonne réponse**, Leitner et Seconde chance.
- Aux portes de faveur : la question du conseiller décide de l'offre (3 faveurs ou 2).
- Au marchand : la question ouvre l'étal (−20 % si juste). Au bivouac : la question ouvre le choix de la faveur.
- Le compte de l'expédition garde les bonnes réponses par famille et par semaine : il sert au bilan (« Ta meilleure semaine : la 7e ; à relire : trois fiches ») et à la ressource bonus du retour triomphal (9.4).

### 7.3 Ce qui ne change pas

Panneau d'erreur à deux phrases, « Voir la fiche », « Signaler une erreur », l'indice du mentor, les raccourcis 1 à 6, flèches, Entrée. Pendant le grand gardien, comme pour un boss du cahier des charges, « Voir la fiche » attend le bilan : option `sansFiche` de `panneauErreur` (un quatrième paramètre `options`, une ligne), et les fiches ratées sont listées au bilan sous « À relire », avec leur lien vers le Codex.

### 7.4 Le récit : la semaine se voit et s'entend

Trois endroits montrent la semaine, sans toucher à l'énoncé :

1. **Le cadre du récit** : `JEU.recit.cadre(q, contexte, camp, extra)` avec `extra.semaine` (la semaine de l'acte) ; nouveaux contextes `route` (conseil de guerre d'une escarmouche), `embuscade`, `gardien`, `bivouac`, `marchand`, `archives`, `porte`. Phrases de jeu, sans fait de cours ; la moitié nomment la semaine par `{S}` :
   - route : « {N} marche à tes côtés sur la route de la semaine {S}. « Avant la prochaine halte, seigneur, dis-moi ceci. » » ; « Les éclaireurs ont trouvé un camp à prendre. {N} te retient par la manche : « Une question, et je paie les hommes. » »
   - embuscade : « Des cris dans le bois : on vous tombe dessus ! {N} te tire par la manche : « Réponds, seigneur, et j'arme les chariots. » » (« vite » n'y est pas : aucun chrono)
   - gardien : « {N} regarde la tour du gardien se découper sur la colline. « Il garde la semaine {S}. Montre-lui que tu la connais. » » ; « Les tambours du gardien roulent déjà. {N} monte au rempart du camp : « Une question avant l'assaut, seigneur. » »
   - bivouac : « Le camp est dressé. {N} déplie ses notes de la semaine {S} à la lueur du feu : « Une question, et je te laisse dormir. » »
   - marchand : « {N} ouvre son étal sur la place du bourg : « Une bonne réponse, et je fais un prix. » »
   - archives : « Un pèlerin partage le feu et parle des semaines passées. {N} te glisse : « Montre-lui que tu n'as rien oublié. » »
   - porte : « {N} t'attend à la sortie du camp, un présent sous le bras : « Réponds d'abord à ceci, seigneur. » »
   - Seconde chance : les phrases `PHRASES.rappel` existantes, inchangées.
2. **L'étiquette de semaine sur la question** : `cadre()` renvoie en plus `r.semaine` : « Semaine 4 » (la semaine du cours de la question ; en relief si elle est dans la fenêtre de l'acte, en retrait sinon), « Griffon de cuivre », « Fiche méthode », « Anglais · séquence 2 » pour les cours sans semaine. `ui.recit` l'affiche en petit ruban à droite du nom du conseiller (`.recit-semaine`, 14 px au moins), là où est déjà l'étiquette « Seconde chance ». Si le chantier « semaine visible dans les questions » livre déjà une pastille dans `JEU.ui.poserQuestion`, l'expédition s'en sert et le ruban disparaît : c'est la même information au même endroit.
3. **La carte et les pages de semaine** : bandeau « Semaine 4 · du 21 au 27 septembre 2026 » sur la semaine en cours ; la page de semaine à chaque passage (4.2). Au début de chaque vague d'une bataille de route, la carte « Un éclaireur » existante (`nouvellesDuFront`) peut dire la semaine une fois sur deux : « Nous traversons les terres de la semaine 7 : ses cours sont en tête. » (une carte de récit avant la première question, jamais entre deux).

## 8. La difficulté monte avec la semaine

### 8.1 Niveau du rival par semaine (MVP : les cinq lignes existantes)

Le moteur règle le seigneur rival par une ligne de la table `RIVAL` (niveaux 0 à 4, réglés province par province au simulateur les 15 et 16/10/2026). Le MVP ne touche pas à cette table : `niveau(semaine) = min(4, (semaine − 1) div 2) + config.expedition.difficulte` (0 par défaut, −1 ou +1 pour que Romain baisse ou monte tout d'un coup), borné à [0, 4].

| Semaines | Niveau | Repère de la campagne |
|---|---|---|
| S1, S2 | 0 | Le Gué, le Piémont |
| S3, S4 | 1 | La Forêt, les Oliveraies |
| S5, S6 | 2 | Le Moulin, le Grand Fleuve |
| S7, S8 | 3 | La Tour du Col, la Citadelle |
| S9 et au-delà | 4 | Les deux forteresses |

Au-delà de S10, la table ne monte plus : la profondeur se paie alors en renommée seulement (8.3). L'incrément 2 ajoute l'option `rivalRegle` du moteur et une table interpolée par semaine (expeditions-hades.md, 6.1 : tirs par paliers de flèches, 0,3 ; 0,5 ; 0,7 ; 1,0 ; 1,16 ; 1,62), ou le palier par tranche de trois semaines de expeditions-spire.md : c'est le simulateur qui tranchera.

### 8.2 Par nœud, à partir du niveau de la semaine

| Nœud | Vagues | Mode | Niveau | Camp adverse (pvRival) | Autres options |
|---|---|---|---|---|---|
| Escarmouche | 2 | attaque | semaine | 8 | — |
| Embuscade | 2 | défense (assaut, coups aux murs ×2) | semaine | 10 | — |
| Gardien | 2 | défense | semaine | 12, gardé entre deux tentatives | — |
| Grand gardien | 3 | défense | semaine + 1 (≤ 4) | 16, gardé | le champion sort à la dernière vague, comme en campagne |

Tout le reste vient de `JEU.campagne.options(niveau)` : or de départ (60 + Trésor), château (20 + Peuple + remparts), dégâts des tours (Garde), or par réponse (Savoir), arsenal débloqué ; moins les bonus de l'événement du jour (11). La campagne aide donc la route, comme les Souvenirs de Hadès ; la route n'abîme jamais la campagne.

Pourquoi ça monte « en avançant sur la carte » : dans une semaine, de l'escarmouche (attaque, où l'on ne risque presque rien) à l'embuscade (défense) puis au gardien (défense, place plus solide) ; d'une semaine à l'autre, le niveau monte toutes les deux semaines ; à la fin, le grand gardien à 3 vagues et au niveau w + 1. Une expédition S6 → S8 va du niveau 2 au niveau 4. Et dans l'année, l'Armorial et l'arsenal de la campagne compensent au fil des semaines.

Les solidités 8, 10, 12, 16 sont des **valeurs de départ devinées** : la première demi-journée du plan (16, 17.2) les mesure avant d'écrire la route.

### 8.3 Profondeur et renommée

Partir plus tard dans l'année rapporte plus : les gains de renommée des gardiens portent le numéro de la semaine (9.4). Pas d'autre multiplicateur dans le MVP ; les Serments (difficulté facultative choisie, +10 % de renommée par point d'ardeur) sont l'incrément 3.

## 9. Récompenses : or, faveurs, vivres, renommée, Armorial

### 9.1 Or de route

0 au départ. Gagné : +15 par escarmouche ou embuscade tenue (+10 si éclatante), +20 par porte « bourse » (+40 si éclatante), +20 au bivouac (choix), +4 par bonne réponse aux marchands de route, +2 par bonne réponse aux archives. Dépensé au marchand. Perdu à la fin de l'expédition (il n'a pas de sens au domaine), ce que la carte dit avant le grand gardien : « Dépense ton or de route : il ne te suivra pas au domaine. » Une expédition de trois semaines en donne 80 à 120 : deux ou trois achats.

### 9.2 Les six faveurs du MVP

Une par conseiller (donc par famille de matières), rang 1, cumulable une fois (la reprendre à une porte : rang 2, effet doublé). Toutes s'appliquent dans `JEU.expedition.optionsBataille(halte)`, sur des options que `M.creer` lit déjà : **aucun changement du moteur**.

| Conseiller (famille) | Faveur | Rang 1 | Rang 2 | Option du moteur |
|---|---|---|---|---|
| Le chroniqueur (histoire) | **Annales** | +3 or par bonne réponse | +6 | `orParReponse` |
| La cartographe (géographie) | **Éclaireurs** | la première vague adverse perd un homme d'armes (ou son dernier soldat) | et la deuxième | `espion` (modificateur existant), reposé à la 2e vague par le rendu au rang 2 |
| L'herboriste (SVT) | **Onguents** | tes troupes ont un niveau d'arsenal de plus (+15 % de points de vie, plafond 3) | deux | `arsenal.troupes` (copie) |
| Le maître d'œuvre (physique-chimie) | **Engrenages** | dégâts de tes tours +10 % | +20 % | `bonusDegats` (plafond total +50 % : la Garde au maximum donne +30 %, le rang 2 +20 % ; le moteur a été réglé entre 0 et +30 %, d'où la mesure au simulateur avec `--faveurs engrenages:2`) |
| Le ménestrel et le maître scribe (français) | **Chant de marche** | +20 or au début de chaque bataille | +40 | `orDepart` (plafond 180) |
| L'interprète (anglais) | **Parlementaire** | le camp adverse a 2 points de solidité en moins (jamais sous 4) | 4 | `pvRival` |

L'interprète n'apparaît que si une séquence d'anglais est chargée (c'est le cas depuis le 16/10). Rang 2 des Éclaireurs : `espion` ne vide qu'une vague ; le rendu (bataille.js) pose `p.modificateurs.espion = true` au début de la 2e vague quand `contexte.eclaireurs >= 2` (deux lignes, hors moteur). Les 12 autres faveurs, les rangs rares et les duos viennent avec l'option `faveurs` du moteur (incrément 2).

**Comment on reçoit une faveur.** À une porte de faveur, après la bataille : le conseiller pose **une question de sa matière** (quota sur la famille, niveaux 1 et 2, règles anti-répétition habituelles, Seconde chance possible), dans son cadre de récit. Juste : trois faveurs au choix (la sienne, et deux autres conseillers tirés à la graine) ; fausse : explication, puis deux faveurs au choix (la sienne et une autre). Éclatante : une de plus. Choix au clavier (1 à 4) ou à la souris ; chaque carte montre le conseiller, l'effet en une phrase et, si on tient déjà la faveur, « Renforcer : rang 2 ». Au bivouac et au marchand, le choix est parmi deux. Les offres en cours sont enregistrées avec la halte : on retrouve les mêmes à la reprise.

### 9.3 Vivres

3 au départ (4 ou 5 avec l'Armorial), maximum 5. −1 quand les murs cèdent dans une bataille de route (escarmouche, embuscade, gardien, grand gardien), ou quand on quitte une bataille après sa première vague (comme en campagne, quitter avant la première vague ne coûte rien : la halte reste à jouer). +1 au bivouac (choix), au marchand (35 or de route), au feu au grenier rejoué sur la route (deux réponses justes). Jamais perdus pour une question, jamais pour un événement. À 0 : retour au domaine.

### 9.4 Renommée

| Source | Renommée |
|---|---|
| Bonne réponse, partout sur la route | +1 |
| Escarmouche ou embuscade tenue | +5 (+3 si éclatante) ; murs cédés : +2 |
| Événement, marchand, bivouac | +3 ; archives : ×2 sur la halte |
| Porte « parchemin » | +10 (+20 si éclatante) |
| Gardien vaincu | 10 + numéro de la semaine |
| Grand gardien vaincu | 15 + 2 × numéro de la semaine |
| Expédition complète | +10 |
| Armorial, Bannière | +10 % puis +20 % sur le total de l'expédition |

Ordres de grandeur : expédition S1 → S3 complète ≈ 110 (6 haltes ≈ 27, gardiens S1 et S2 = 23, grand gardien S3 = 21, 31 bonnes réponses, +10) ; S6 → S8 complète ≈ 135 ; arrêtée au gardien de la 1re semaine ≈ 25 à 35. Toujours plus que zéro, toujours gardée, jamais réduite par une défaite. Au bilan : « Renommée gagnée : 34 (tu en as 112) ».

Lien avec la campagne au retour triomphal : +3 coups à la prochaine place forte du front choisi (comme le défi du champion, `pr.pv = max(1, pv − 3)` ; jamais une prise : seule une bataille de campagne prend une province), rivalité du front +6, missive `victoire` du rival (il a été repoussé), 8 ressources de la matière la mieux réussie de la route, une ligne dans la chronique.

### 9.5 L'Armorial (le Miroir, en quatre quartiers)

Un écu dont on remplit les quartiers avec la renommée. Un achat est définitif ; rien ne se perd ; on peut toujours jouer sans rien acheter. Prix alignés sur les quartiers homonymes de expeditions-hades.md (9.2), pour que l'incrément 2 ajoute les cinq autres sans rien retoucher.

| Quartier | Effet | Rangs et prix (renommée) |
|---|---|---|
| Vivres de route | +1 vivre au départ (et au maximum) | 40, puis 110 (5 vivres) |
| Bourse du voyageur | +10 or au début de chaque bataille de route | 25, 50, 90 |
| Murs chaulés | ton camp a +2 points de solidité dans les batailles de route | 35, 75 |
| Bannière | renommée +10 % | 60, 140 |

Total : 625 points, cinq ou six expéditions complètes ; le premier quartier (Bourse, 25) s'achète dès la première expédition, même perdue. Tous passent par `optionsBataille` (orDepart, pvChateau) ou par l'état de l'expédition (vivres), sans toucher au moteur. Ordre conseillé, affiché sans obligation : Bourse, Vivres. L'incrément 2 ajoute Faveur d'ouverture, Seconde monture, Sauf-conduit, Mémoire des anciens, Forge de campagne.

## 10. Défaite, abandon, pause, reprise

- **Retour au domaine** (vivres à 0) : écran de bilan, le même que la victoire : renommée gagnée (jamais réduite), meilleure semaine, fiches à relire (liens Codex), graine (« Graine 4F2A-9C01 »), une phrase du chroniqueur (« Une expédition qui apprend n'est jamais perdue. »), « Repartir » ou « Retour à la campagne ». La chronique note : « L'expédition s'est arrêtée à la semaine 7, au gardien. La compagnie rentre avec 41 points de renommée. » Rien d'autre ne change.
- **Lever le camp** (depuis la carte de route, avec confirmation) : même bilan, même renommée.
- **Pause** : « Retour à la campagne » (et Échap, par `ui.clavier` de l'écran de route) revient à la campagne, l'expédition reste en cours (« Reprendre l'expédition »). La route n'est pas une « partie » au sens de `JEU.partie` : on peut aller au Codex ou aux Réglages et revenir ; seules les haltes sont des parties (`JEU.ui.commencerPartie`), qui bloquent le menu comme aujourd'hui. La sauvegarde est écrite après chaque halte, chaque porte, chaque achat, chaque gardien, chaque page de semaine.
- **Fermer le jeu pendant une bataille de route** : la bataille n'est pas sauvegardée (pas plus qu'en campagne). À la réouverture, la halte est à rejouer : sans perte de vivre si sa première vague n'avait pas été lancée ; sinon −1 vivre, comme un abandon de bataille (l'expédition note `entamee = id` à `lancerVague` et l'efface au bilan). Décision à confirmer (19) : la plus simple, et elle empêche d'« annuler » une vague qui tourne mal en fermant la fenêtre.
- **Une seule expédition en cours à la fois** ; en commencer une nouvelle demande de lever le camp de l'ancienne (confirmation, renommée gardée).
- **Import d'une sauvegarde** : l'expédition en cours revient telle quelle.

## 11. Lien avec la campagne, les rivaux, les souverains

- **Partir** : une carte de la grille de la campagne, après « Conseil du royaume » et avant « Arsenal », avec sa touche. « Reprendre l'expédition · semaine 7, gardien » quand une expédition est en cours. Une attaque du domaine en cours n'empêche pas de partir ; elle attend. Une expédition en cours n'empêche pas de jouer la campagne.
- **Jauges, arsenal, remparts** : s'appliquent aux batailles de route par `C.options`. Le conseil du royaume et l'arsenal restent la progression lente ; l'Armorial est la progression « roguelite ». Les deux poussent dans le même sens.
- **Piège à éviter (relu dans le code)** : `C.options` ajoute `c.bonus.or` (les mercenaires de l'événement du jour) à l'or de départ et lit `c.bonus.espion`, et c'est `C.apresBataille` qui vide `c.bonus` ; la route n'appelle pas `apresBataille`. `JEU.expedition.optionsBataille` repart donc de `C.options(niveau)` puis **retire `c.bonus.or` de `orDepart`** et met `espion` à vrai seulement si `enCours.espion` le dit ; elle ne vide jamais `c.bonus`. Les bonus de campagne restent intacts pour la prochaine bataille de campagne (test en 17.1).
- **Événements du jour** rejoués sur la route avec des gains de route (6.2). L'événement du jour de la campagne reste à jouer à part.
- **Rivaux et missives** : avant le grand gardien, le défi du rival du front par `C.missiveAvantBataille(idDeLaProchaineProvinceDuFront)` (une bataille sur deux, « Relever le défi », rien à écrire ; sans province restante sur ce front, pas de lettre) ; après une victoire, `C.reagir(front, "victoire")` (fonction interne de campagne.js aujourd'hui : à ajouter à son export, une ligne) et `C.monterRivalite(front, 6)` ; gardien de semaine vaincu : rivalité +2, pas de lettre ; après un retour, rien (une défaite ne fait rien perdre, ni gagner). Les gardiens de semaine sont « un seigneur rival » (médaillon héraldique au tortil, `medaillonHeraldique(camp, true)`), sans missive. Dans la bataille, le mot du rival (`phraseRival`, p.ia.journal) s'affiche sous ce nom, comme aujourd'hui.
- **Souverain** : il change toujours avec les provinces prises ; l'expédition y contribue par ses 3 coups à chaque retour triomphal. Sa phrase de départ est un texte du jeu avec `{nom}` ; une situation `mission` dans personnages.js (six répliques, contrôle 10) est l'incrément 3.
- **Chronique** : départ, semaine franchie, retour, dans les vingt faits de la campagne. Le cartouche « Les fronts et tes rivaux » gagne une ligne : « Expéditions : 2 accomplies, semaines franchies : 1 à 3, renommée 212. »
- **Statistiques** : chaque halte compte une partie (`stats.parties`), les réponses entrent dans `stats`, `notions`, `posees`, `rappels` comme partout.
- **Réglage « Messages des rivaux »** coupé : pas de missive de défi ni de réaction, comme en campagne ; les pages de semaine et le bilan, qui ne sont pas des lettres, restent.

## 12. Génération procédurale et graine

- **Graine** : un entier 32 bits tiré au départ (`(Date.now() ^ (JEU.questions.posees().horloge * 2654435761)) >>> 0`), gardé dans la sauvegarde, affiché au bilan en hexadécimal. Tirage à graine mulberry32 (celui des simulateurs, recopié dans expedition.js, une dizaine de lignes, exposé en `JEU.expedition.alea(graine)`), jamais `Math.random` dans la génération : avec la même graine, on obtient la même route, les mêmes types, les mêmes portes, les mêmes conseillers de porte, les mêmes étals, les mêmes offres de faveurs (dans l'ordre où on les demande).
- **Ce qui n'est pas à graine** : le tirage des questions, qui suit l'état réel de l'élève (Leitner, fenêtre anti-répétition, Seconde chance). Voulu : deux élèves sur la même route n'ont pas les mêmes questions. Le moteur de bataille est déjà sans hasard pour ses décisions (`Math.random` n'y sert qu'au pas des figurines).
- **La route est écrite dans la sauvegarde** (moins de 2 Ko), pas recalculée à partir de la graine : une version future du générateur ne change pas une expédition en cours. La graine sert à rejouer dans les simulateurs et à reproduire un défaut signalé par Romain.
- **Algorithme**, en une passe par semaine, dans cet ordre, tout à la graine :
  1. Fenêtre et quota de l'acte (5.3), à partir des fiches candidates du moment.
  2. Pour chaque couche, `n = 2` ou `3` (3 une fois sur deux).
  3. Types de haltes selon 6.3, puis les corrections de garanties dans l'ordre fixe.
  4. Portes des escarmouches et embuscades (6.4), conseiller de porte (pondération par familles chargées, à revoir, présentes dans la fenêtre ; jamais deux fois le même dans la semaine).
  5. Chemins, sans croisement : couches triées de gauche à droite ; la halte `i` de la couche 1 (sur `n1`) mène à la halte `j` de la couche 2 (sur `n2`) quand `|i / (n1 − 1) − j / (n2 − 1)| ≤ 0,5` (une couche d'une seule halte compte 0,5) ; si une halte n'a aucun chemin entrant ou sortant, on la relie à sa voisine la plus proche (à égalité, la gauche) ; si les deux couches ont 2 haltes, une diagonale tirée à la graine s'ajoute pour qu'il y ait un choix ; si une halte de la 1re couche ne mène qu'à l'embuscade, on lui ajoute le chemin vers sa voisine. Les chemins ne vont qu'entre haltes voisines dans l'ordre : ils ne se croisent jamais. Le départ mène à toute la couche 1 ; toute la couche 2 mène au gardien.
  6. Événement de chaque halte « événement » (rotation sans répétition dans l'expédition, archives placées selon 6.3), étal du marchand, carte de bataille de la semaine.
  7. Vérification des garanties ; sinon graine + 1 (vingt fois au plus), puis la semaine de secours.
- **Exemple** (graine 4F2A-9C01, départ S6 vers l'ouest, contenu d'aujourd'hui) : S6 · fenêtre S5-S6 (12 fiches), quota 2 sur 3 · carte le Gué · 1re couche : [escarmouche · porte : faveur de l'herboriste] [événement : le défi du champion] [bivouac] ; 2e couche : [embuscade · porte : faveur du maître d'œuvre] [marchand] ; chemins 1→1, 1→2, 2→1, 2→2, 3→2 ; gardien S6 (défense, 2 vagues, niveau 2, place 12). S7 (fenêtre S6-S7) et S8 (S8 seule) dans la brume, 2 couches chacune, gardien en silhouette ; S8 : grand gardien, le roi d'Angleterre, sur la carte de la prochaine province du front de l'ouest. S9 et au-delà : brume, « 6 cours à venir ».

## 13. Sauvegarde : schéma 6 et réglages

Migration 5 → 6 (6 est le premier numéro libre au 24/10/2026 ; vérifier `SCHEMA` dans sauvegarde.js le jour de la livraison et prendre le numéro suivant s'il a bougé) : ajoute `expedition`, vide, complété par `JEU.expedition.completer` (même méthode que `JEU.campagne.completer` : une valeur absente, nulle ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas). Rien n'est retiré. Une sauvegarde du schéma 6 lue par un jeu plus ancien est refusée, comme aujourd'hui. Le bloc est un sous-ensemble de celui de expeditions-hades.md (13) : les champs qu'elle ajoutera (serments, titres, quartiers de plus, étal complet) se complètent sans migration.

```js
expedition: {
  renom: 0, renomTotal: 0,                     // disponible ; gagné depuis le début (jamais réduit)
  armorial: { vivres: 0, bourse: 0, murs: 0, banniere: 0 },   // rangs achetés
  franchies: [],                               // semaines dont le gardien a été vaincu une fois (sceaux du parchemin)
  records: { "6": 135 },                       // meilleure renommée par semaine de départ
  historique: [{ le: "2026-10-24", graine: 1329438721, front: "angleterre", depart: 6, semaines: [6, 7, 8],
                 atteint: { semaine: 7, noeud: "s7g" }, issue: "victoire" | "retour" | "abandon", renom: 135 }],
                                               // vingt au plus, le plus récent d'abord
  enCours: null | {
    graine: 1329438721, front: "angleterre", depart: 6, semaines: [6, 7, 8], difficulte: 0, vitesse: 1,
    route: [{ semaine: 6, semaines: [5, 6], quota: 2, carte: "gue",
              couches: [[{ id: "s6c1h1", type: "escarmouche", porte: { genre: "faveur", conseiller: "svt" }, suivants: ["s6c2h1", "s6c2h2"] },
                         { id: "s6c1h2", type: "evenement", ev: "defi", suivants: ["s6c2h1"] }], [ ... ]],
              gardien: { id: "s6g", type: "gardien", place: 12 } }, ...],
    position: null | "s6c1h1",                 // halte en cours ou dernière jouée ; null : au départ de la semaine courante
    semaine: 6,                                // semaine en cours
    faits: { "s6c1h1": "reussi" | "eclatante" | "echoue" | "fait" },
    entamee: null | "s6g",                     // bataille de route dont la 1re vague a été lancée et qui n'a pas de bilan
    vivres: 3, vivresMax: 3, or: 0, plan: 0, espion: false,
    faveurs: [{ id: "annales", rang: 1 }, { id: "engrenages", rang: 2 }],
    places: { "s6g": 9 },                      // solidité restante d'un gardien déjà attaqué
    offre: null | { halte: "s6c1h1", faveurs: ["annales", "onguents", "parlementaire"] },   // offre en attente de choix
    etal: { "s6c2h2": { remise: true, lignes: ["faveur:onguents", "faveur:chant", "vivres", "plan"] } },
    compte: { questions: 0, bonnes: 0, parFamille: {}, parSemaine: {}, renom: 0, fiches: [] }   // fiches : ratées, pour « À relire »
  }
}
```

- Taille : moins de 2 Ko pour une expédition en cours, 2 Ko d'historique.
- docs/FORMAT_DONNEES.md : section « Sauvegarde », schéma 6, et le bloc `expedition` de config.js ci-dessous. atelier/outils/tests.js : migration 1 → 6 sans perte, `completer` sur une expédition abîmée.
- Réglages, dans jeu/data/config.js (lus par `JEU.expedition`, valeurs par défaut si absents, pour que Romain les touche sans code) :

```js
  expedition: { semaines: 3, couches: 2, vivres: 3, questionsSemaine: 2, quotaPlein: 12, quotaDemi: 5, difficulte: 0, vitesse: 1 }
```

`difficulte` s'ajoute au niveau du rival de chaque bataille de route (−1 : tout un cran plus facile ; +1 : plus dur), borné à [0, 4]. `vitesse` : la vitesse des vagues proposée au départ (1, 2 ou 3 ; l'élève la change pendant la bataille comme aujourd'hui, et son choix est retenu pour l'expédition).

## 14. Interface et direction artistique

### 14.1 L'écran « La route » (`JEU.ui.ecrans.expedition`, jeu/js/ecran-expedition.js)

Une section `#ecran-expedition` de plus dans index.html (le menu ne change pas : on y entre par la campagne, on en sort par « Retour à la campagne » ou Échap).

- **Parchemin d'itinéraire** : un SVG de 1000 × 320 (unités logiques), dans le même cadre à bordure de parchemin que la carte de campagne, qui tient entier en 1366 × 768 avec les cartouches du bas (contrôle perf.js, comme pour la carte). Une semaine = une bande de 300 px : une **lettrine rubriquée** « S6 » (Cinzel, #8c2f39, filets d'or), le libellé des dates dessous en 14 px, deux colonnes de médaillons, puis le gardien dans un **médaillon héraldique** (`JEU.ecranCampagne.medaillonHeraldique(camp, true)` au tortil pour un gardien de semaine ; `medaillon(rivalDe(front), 60)` pour le grand gardien : portrait s'il en a un, sinon la silhouette couronnée sur les armes du camp). Les 100 premiers pixels : le départ (un petit bourg de France, `lieu-france`, avec la bannière au lys).
- **Médaillons de haltes** : 52 px, cerclage d'or sur encre comme les médaillons de repli de la carte de campagne, icône Game-icons du type, la porte en petit écusson (médaillon du conseiller à 22 px, bourse, parchemin) en bas à droite. États : à venir (encre), atteignable (halo d'or, le même anneau que la province « cible » de la campagne), jouée (un **sceau de cire** posé dessus : `sceau("joueur")` réduit, vert-de-gris pour réussie, plomb #4a4e57 pour murs cédés, comme le sceau de l'or perdu), hors chemin (estompée à 35 %). Chemins en pointillés d'encre comme `route()` de la carte de campagne ; le chemin parcouru en trait plein doré.
- **Brume** : les nappes `lieu-brume` existantes (sprites.js) sur les couches des semaines suivantes et sur tout ce qui dépasse la frontière, avec le voile désaturé de `voileBrume` ; au-delà de la frontière, le numéro de semaine et « n cours à venir » en gris. La bannière « Cette semaine » (calendrier) est plantée sur la semaine du jour.
- **Sous la carte**, deux cartouches dans le style de « Ton royaume » : **Ta compagnie** (vivres en sacs, or de route, faveurs en médaillons de conseillers avec leur rang et leur effet au survol et dans une liste au clavier, renommée de l'expédition, graine) ; **Journal de route** (les dix derniers faits de l'expédition). Boutons : « Entrer dans la halte (Entrée) », « Faveurs (F) », « Retour à la campagne (Échap) », « Lever le camp ».
- **Fenêtres** (famille des missives : sceau de cire, médaillon, mêmes raccourcis) : l'écran de départ (avec le parchemin de l'année : 34 cases en rang, scellées pour les semaines franchies, frontière marquée, brume au-delà, bannière « Cette semaine »), la page de semaine, la porte de faveur (question puis cartes de faveurs), le bivouac, le marchand, l'Armorial, le bilan.
- **Palette et polices** : celles du jeu (fond #efe6d2, encre #2e2419, or #b08d3a, rubrique #8c2f39, une teinte par matière sur les médaillons des conseillers), Cinzel pour les titres, Crimson Text pour les textes. Rien de nouveau dans jeu/assets pour le MVP. Incrément 3 : un fond de parchemin de route rendu par les scripts Blender de l'atelier, avec repli vectoriel si l'image manque, comme la carte de campagne ; deux sons courts (sac de vivres, sceau de halte) par generer-sons.js.
- **Références** : les cartes d'itinéraire médiévales (route horizontale à stations, vignettes de villes), la carte de campagne de Medieval Total War pour les silhouettes de camps, l'enluminure pour les lettrines, l'écran des bienfaits de Hadès pour la carte de faveur (médaillon, rang, une phrase).
- Animations de moins de 400 ms (le sceau qui se pose, le halo qui glisse à la halte suivante), aucune entre une réponse et la question suivante, aucun clignotement ; coupées avec « Animations ».

### 14.2 Clavier et accessibilité

- Sur la carte : 1, 2, 3 choisissent une halte atteignable (numéros affichés sur les médaillons, comme les touches de la grille de la campagne), ← → aussi, Entrée entre, F ouvre la liste des faveurs, Échap revient à la campagne (expédition enregistrée ; la route n'étant pas une partie, c'est `ui.clavier` de l'écran qui reçoit la touche). Les haltes atteignables ont `tabindex="0"` et un `aria-label` complet : « Semaine 6, 2e couche : embuscade, récompense : faveur du maître d'œuvre ».
- Porte de faveur, bivouac, marchand, Armorial : touches 1 à 4, Entrée pour valider, Échap pour fermer ce qui peut l'être (jamais une porte : on choisit toujours).
- Rien ne repose sur la couleur seule (sceau + mot « réussie » / « murs cédés » dans le journal de route et l'infobulle) ; textes de 14 px au moins sur la carte, questions à 18 px comme partout ; focus visible ; le focus revient sur la halte courante après chaque fenêtre.

### 14.3 Performance

- Génération : une fois, au départ (quelques centaines d'opérations). La carte : un SVG d'une trentaine de nœuds et d'une quarantaine de chemins, redessiné à chaque retour sur l'écran (quelques ms) ; jamais pendant une partie.
- Faveurs et Armorial : résolus en options avant `M.creer`. Rien dans la boucle du moteur ni du rendu.
- Entre une réponse et la question suivante : rien de nouveau. Le lot d'une vague est tiré au début de la vague ; le quota ajoute un appel à `tirage()` (cible : médiane sous 3 ms hors bac à sable, 10 ms au plus, mesurée par mesurer-tirage.js ; aujourd'hui 1,2 ms en médiane pour un lot de 3).
- perf.js : les mêmes mesures (JEU.mesure et Event Timing) pendant une escarmouche et un gardien de route.

## 15. Ce qu'il faut changer dans le code

Toutes les accroches sont des ajouts facultatifs : sans `contexte`, sans `quota`, sans `extra`, sans paramètre, chaque fonction fait exactement ce qu'elle fait aujourd'hui. À livrer après les chantiers en cours sur bataille-moteur.js (revue du 24/10), bataille.js, recit.js et personnages.js, et à vérifier par `simuler-bataille.js --comparer` (les batailles de campagne ne bougent pas d'un coup). Repères de lignes relevés le 24/10 au matin, à retrouver par leur nom si elles ont bougé.

| Fichier | Changement |
|---|---|
| `jeu/js/expedition.js` (nouveau, sans DOM, chargé après campagne.js et bataille.js, testé sous Node) | Constantes (`EXP` : tables de 6.3, 6.4, 8.2, 9.x), `alea(graine)`, `semaineDe`, `frontiere()`, `fenetre(semaine)` et `quotaDe` (5.3), `generer(graine, depart, semaines, front)`, `commencer(depart, front)`, `atteignables()`, `entrer(id)`, `tirage(n, posees, halte)` (quota et niveaux), `optionsBataille(halte)` (niveau de la semaine, mode, pvRival, faveurs, Armorial, config.difficulte, sans les bonus de campagne), `apresBataille(halte, bilan)` (vivres, portes, renommée, places, plan et espion de route consommés), `offrirFaveurs(conseiller, juste, eclatant)`, `prendreFaveur(id)`, `bivouac(choix)`, `acheter(ligne)`, `renom(source, semaine)`, `finir(issue)`, `armorial.acheter(quartier)`, `completer`, `etatVide`, `etat()`. Exposé dans `JEU.expedition`. |
| `jeu/js/ecran-expedition.js` (nouveau) | La carte-itinéraire, l'écran de départ et le parchemin de l'année, la page de semaine, les fenêtres (porte, bivouac, marchand, Armorial), le bilan, la reprise. |
| `jeu/js/bataille.js` | `lancer(lieu, contexte)` (ligne 1643) : avec un `contexte` ({ carte, titre, front, camp, niveau, vagues, defense, pvRival, pvRivalMax, options (celles de `optionsBataille`, à la place de `C.options(niveau)`, lignes 1680 à 1688), semaine, tirage(n, posees) → questions (à la place de `tirerQuestions`, ligne 1631), cadre(q) → cadre du récit (ligne 2000), nomRival, rivalPerso (pour `motDuRival`), eclaireurs, sansFiche, vitesse, surVitesse(n), surVague(), surFin(bilan), surQuitter(entamee), retour() }), la bataille ne touche pas la campagne (`C.apresBataille` n'est pas appelé : `bilan()` ligne 2223 et `JEU.partie.surQuitter` ligne 2218 rendent le bilan à `contexte`) ; `lancerVague` (ligne 2052) prévient `contexte.surVague()` (pour `entamee`) et pose `espion` à la 2e vague au rang 2 des Éclaireurs ; `retour()` (ligne 2262) va à l'écran de la route ; le titre et le nom du rival viennent du contexte. Une vingtaine de lignes, toutes sous `if (contexte)`. |
| `jeu/js/recit.js` | `suite(nombre, options)` (ligne 230) : option `quota` (7.1). `cadre(q, contexte, camp, extra)` (ligne 84) : contextes `route`, `embuscade`, `gardien`, `bivouac`, `marchand`, `archives`, `porte` ; `r.semaine` (7.4). |
| `jeu/js/interface.js` | `ui.recit` (ligne 281) affiche `r.semaine` ; `panneauErreur(q, zone, suite, options)` (ligne 479) avec `options.sansFiche`. |
| `jeu/js/campagne.js` | `jouerEvenement(ev, contexte)` (ligne 528 ; 6.2) ; `reagir` ajouté à l'export `JEU.campagne` (ligne 596, une ligne) ; `GAINS_RIVALITE.gardien: 2`, `.grandGardien: 6`. Rien d'autre : rivalité, missives et chronique passent par `monterRivalite`, `missiveAvantBataille`, `rivalDe`, `prochaineProvince` et `noter`, déjà exportés. |
| `jeu/js/ecran-campagne.js` | La carte « Partir en expédition / Reprendre » dans la grille (lignes 444 à 463), avec sa touche ; la ligne « Expéditions » du cartouche des rivaux. |
| `jeu/js/sauvegarde.js` | `SCHEMA = 6` (ligne 274), migration 5 → 6 (`MIGRATIONS`, ligne 304), `nouvelle()` avec `expedition: JEU.expedition ? JEU.expedition.etatVide() : null`. |
| `jeu/js/progression.js` | `semaineDe(coursId)` si le chantier « semaine visible » ne l'a pas déjà mise là (repli dans expedition.js sinon). |
| `jeu/index.html` | `#ecran-expedition`, les deux scripts (expedition.js après bataille.js, ecran-expedition.js après ecran-campagne.js), `JEU.version`. |
| `jeu/css/jeu.css` | Styles de la carte-itinéraire (médaillons, sceaux, lettrines), du ruban `.recit-semaine`, des cartes de faveurs, de l'Armorial, du parchemin de l'année. |
| `jeu/data/config.js` | Bloc `expedition` facultatif (13). |
| `atelier/outils/tests.js` (`contexte()` charge `expedition` après `campagne`), `simuler-bataille.js`, `mesurer-tirage.js`, `perf.js` | Section 17. |
| `docs/CAHIER_DES_CHARGES.md` (section 5 : « Les expéditions »), `docs/FORMAT_DONNEES.md`, `docs/JOURNAL.md`, `jeu/VERSION.txt` | Spécification, schéma 6 et config, décisions, version. |

Esquisses des trois accroches principales, pour fixer la taille :

```js
// recit.js, suite() : le quota en tête des essais, plafonné
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
// expedition.js, optionsBataille(halte) : tout par des options que M.creer lit déjà, sans les bonus de campagne
var e = etat().enCours, c = JEU.campagne.etat(), acte = acteCourant(), arm = etat().armorial;
var niv = borne(niveauSemaine(acte.semaine) + (halte.type === "grand" ? 1 : 0) + cfg.difficulte, 0, 4);
var o = JEU.campagne.options(niv);
o.orDepart -= (c.bonus.or || 0);                      // les mercenaires de l'événement du jour restent à la campagne
o.vagues = halte.vagues; o.defense = halte.defense; o.pvRival = places[halte.id] || halte.place; o.pvRivalMax = halte.place;
o.orDepart = Math.min(180, o.orDepart + 10 * arm.bourse + 20 * rang("chant") + e.plan); e.plan = 0;
o.pvChateau += 2 * arm.murs;
o.bonusDegats = Math.min(0.5, o.bonusDegats + 0.1 * rang("engrenages"));
o.orParReponse += 3 * rang("annales");
o.pvRival = Math.max(4, o.pvRival - 2 * rang("parlementaire"));
o.espion = e.espion || rang("eclaireurs") > 0; e.espion = false;   // l'espion de route, jamais c.bonus.espion
if (rang("onguents")) { o.arsenal = { tours: o.arsenal.tours, troupes: {} }; Object.keys(c.arsenal.troupes).forEach(function (t) { o.arsenal.troupes[t] = c.arsenal.troupes[t] ? Math.min(3, c.arsenal.troupes[t] + rang("onguents")) : 0; }); }
if (typeof cfg.orPerduErreur === "number") o.orPerduErreur = cfg.orPerduErreur;
return o;
```

```js
// bataille.js, les points sous « if (contexte) » : niveau, vagues, carte, options, titre et nom du rival viennent du
// contexte ; tirerQuestions passe par contexte.tirage ; le cadre par contexte.cadre(q) ; v.vitesse = contexte.vitesse ;
// lancerVague() appelle contexte.surVague() ; bilan() appelle contexte.surFin(b) au lieu de C.apresBataille(b) ;
// surQuitter appelle contexte.surQuitter(entamee) ; retour() appelle contexte.retour().
```

## 16. Plan de construction : le MVP en quatre jours, puis deux incréments

### Jour 1 : mesurer, puis le cœur sans écran

1. **Matin, une demi-journée de mesure** (rien d'écrit dans jeu/) : trois options dans simuler-bataille.js qui ne changent rien aux tableaux existants, `--vagues n`, `--pvRival n`, `--mode attaque|defense` (et `--carte gue`), pour jouer les quatre nœuds de la table 8.2 aux niveaux 0 à 4, quatre justesses, 80 graines : part des escarmouches où le camp tombe (éclatantes) et où les murs cèdent ; part des défenses à 2 vagues tenues (embuscade, gardien) et à 3 vagues (grand gardien) ; murs restants. C'est ce qui fixe les solidités 8, 10, 12, 16 (ou d'autres) **avant** d'écrire la route. Résultats au journal.
2. `expedition.js` : tables, tirage à graine, `semaineDe`, `frontiere`, `fenetre` et `quotaDe` (semaines minces), `generer` (12), état et `completer`, vivres, or de route, renommée, Armorial, `finir`. Schéma 6 et migration. `config.expedition`.
3. tests.js : génération (200 graines), frontière, semaine d'un cours, fenêtres des semaines minces, vivres, renommée, migration, `completer`, Armorial (17.1).

### Jour 2 : les accroches et le tirage

4. `recit.js` : `quota`, nouveaux cadres, `r.semaine` ; `interface.js` : `ui.recit`, `sansFiche` ; `campagne.js` : `jouerEvenement(ev, contexte)`, export de `reagir` ; `bataille.js` : `contexte`.
5. `optionsBataille`, `apresBataille`, faveurs, portes ; tests du quota, des options et de l'intégrité de la campagne (`c.bonus` intact) ; `mesurer-tirage.js --expedition` ; `simuler-bataille.js --expedition` (les quatre nœuds avec les options exactes de `optionsBataille`, 17.2).

### Jour 3 : l'écran

6. `ecran-expedition.js` et CSS : carte-itinéraire, écran de départ avec parchemin de l'année et Armorial, page de semaine, porte de faveur, bivouac, marchand, bilan, reprise ; carte « Partir / Reprendre » dans la campagne ; clavier.

### Jour 4 : réglage et livraison

7. Réglage au simulateur (17.2 et 17.4), perf.js (parcours complet, 17.5), cahier des charges, format, journal (décisions de la section 2 et mesures du jour 1), version 0.9.0, les cinq vérifications pour Romain (18), commit.

**Livrable** : une expédition de une à trois semaines, choisie au départ, sauvegardée et reprise, avec défaite et victoire, six faveurs, renommée et quatre quartiers d'Armorial. Volume estimé : 950 lignes de JavaScript (expedition.js 380, ecran-expedition.js 450, accroches 120), 250 de CSS, 50 tests. Avec les cours d'aujourd'hui, elle se joue sur S1 → S3 ; elle s'ouvre toute seule sur S6 → S8 dès que les semaines 4 à 8 sont indexées (la frontière suit index-cours.js), avec les fenêtres élargies tant que ces semaines sont minces.

### Incrément 2 : la profondeur (trois à quatre jours)

- Options `faveurs` et `rivalRegle` du moteur (toutes facultatives, mêmes résultats sans elles, vérifiés graine pour graine) : les 12 autres faveurs (portée, vitesse, cadence des engins, revenu, coup d'éclat, Ballade consolante, mercenaires…), les rangs rares, les six duos, la table du rival par semaine (interpolée, ou par palier de trois semaines : au simulateur de trancher), les modificateurs d'élite des embuscades.
- Relais (`config.expedition.relais: true`, à partir de `franchies`), 3e couche (réglage), haltes trésor et archives du prieuré, étal complet du marchand, Armorial complet, titres, Chronique des expéditions dans le Codex.
- `simuler-expedition.js` : des expéditions entières jouées par l'élève scripté (17.4), pour régler vivres, solidités et table.

### Incrément 3 : le récit et la finition (deux à trois jours)

- Situations `mission` (souverain), `grandGardien`, `franchie`, `rentree` (rivaux) dans personnages.js, six répliques chacune, contrôle 10 ; la page de semaine illustrée ; le fond de parchemin de route rendu en 3D ; deux sons ; les Serments (difficulté facultative, +10 % de renommée par point, jamais sur les questions) ; le défi de la semaine (graine commune à toute la semaine du calendrier, record à battre).

## 17. Tests et mesures

### 17.1 tests.js (logique, Node ; ajout de expedition.js à la liste des modules chargés)

- Génération : pour 200 graines, 2 couches par semaine, 2 ou 3 haltes par couche, chemins sans croisement (pour tout chemin i→j et i'→j', pas de i < i' avec j > j'), toute halte atteignable depuis le départ et reliée au gardien, garanties de 6.3 (une escarmouche en 1re couche, un marchand en 2e, au plus une embuscade jamais imposée, un bivouac par semaine, une halte archives par expédition), mêmes résultats pour la même graine, résultats différents pour deux graines, aucun appel à `Math.random` (remplacé par une fonction qui lève une erreur pendant `generer`), jamais plus de vingt régénérations.
- Frontière et départ : avec les cours chargés par les tests, frontière = 3, départ par défaut = 1, arrivée = 3 ; avec un cours de S8 ajouté à la main, frontière = 8, défaut 6 → 8 ; départ = frontière : une semaine ; une semaine sans cours entre deux est sautée ; sans aucun cours, pas d'expédition.
- Semaine d'un cours : `histoire-s03-1` → 3 ; `langue-conj10`, `methode-frise`, `anglais-seq01` → null.
- Semaines minces : une semaine de 44 fiches → fenêtre [S], quota 2 ; 8 fiches avec 23 la semaine d'avant → [S−1, S], quota 2 ; 4 fiches avec 3 et 2 avant → [S−2, S], quota 1 ; 2 fiches seules → quota 0.
- Vivres : jamais sous zéro ; une question ratée n'en retire jamais (le compte des vivres ne bouge pas quand `enregistrerReponse` est appelé 50 fois en faux) ; un retour à zéro vivre finit l'expédition avec la renommée acquise ; quitter avant la première vague ne coûte rien, après coûte un vivre.
- Renommée : ne baisse jamais, même après un retour ; un achat d'Armorial retire du disponible, pas du total ; la Bannière s'applique au total de l'expédition ; les barèmes de 9.4 (gardien S3 = 13, grand gardien S8 = 31).
- Options de bataille : `optionsBataille` pour chaque faveur et chaque quartier change la bonne option et respecte son plafond ; sans faveur ni Armorial, les options sont exactement celles de `C.options(niveau)` plus vagues, défense et solidités, **moins `c.bonus.or` et sans `c.bonus.espion`** ; niveau de S1 = 0, S8 = 3, grand gardien S8 = 4, `difficulte: −1` ramène S8 à 2.
- Campagne intacte : avant et après une expédition simulée (victoire, puis défaite), `campagne.provinces` (sauf les 3 coups de la victoire), `conquises`, `rival`, `arsenal`, `royaume`, `evenement`, `bonus` et les ressources sont inchangés (copie profonde) ; `c.bonus.or` posé à 40 avant l'expédition vaut encore 40 après.
- Après bataille : tenu, éclatante (pvRival à 0), cédé (−1 vivre), porte simple ou doublée, or de route, renommée, `places` gardé entre deux tentatives d'un gardien, semaine franchie une fois pour toutes, `plan` et `espion` de route consommés par une seule bataille, retour triomphal : +3 coups à la prochaine place forte du front, rivalité +6.
- Sauvegarde : migration 1 → 6 sans perte (toutes les clés du schéma 5 inchangées) ; `completer` répare une expédition en cours abîmée (position inconnue → départ de la semaine courante, faveur inconnue retirée, vivres non numériques → 3, route illisible → expédition close avec sa renommée) ; import d'une sauvegarde avec expédition en cours ; une sauvegarde de schéma 7 est refusée.
- Tirage : `suite(3, { quota })` donne 2 questions de la semaine 1 et 1 autre quand c'est possible ; 3 d'autres semaines quand la fenêtre n'a pas de cours ; `quota.nombre: 3` et filtre « semaine < 2 » donne 3 questions de S1 ; un quota sur la famille « svt » donne une question de SVT ; une Seconde chance due est placée une seule fois ; les 60 dernières questions ne ressortent pas ; sans `quota`, le résultat est identique à aujourd'hui pour une même graine et une même sauvegarde (régression).
- Récit : chaque phrase de route a `{N}` ; celles qui ont `{S}` reçoivent la semaine ; `cadre()` renvoie `semaine` pour un cours du planning et le bon libellé pour la grammaire, l'anglais et les méthodes ; aucun texte de faveur, de halte, de page de semaine ou de bilan ne contient un chiffre de cours, un mot de religion ou une insulte (la liste du contrôle 10 de controles.js, importée), ni le nom d'un personnage.

### 17.2 simuler-bataille.js : les batailles de route

Jour 1 (avant la route) : `--vagues n --pvRival n --mode attaque|defense [--carte gue]` remplacent les 4 vagues, la solidité de la province et le mode dans `optionsBataille`, pour les niveaux `--niveaux 0,1,2,3,4` et les justesses `--p 0.6,0.7,0.8,0.9`, 80 graines. Jour 2 : `--expedition` joue les quatre nœuds avec les options exactes de `JEU.expedition.optionsBataille` (expedition.js chargé dans le simulateur, après campagne.js), pour les semaines `--semaines 1,3,5,8` (défaut), l'arsenal supposé de `PROGRESSION[niveau]`, et facultativement `--armorial complet` et `--faveurs annales:2,engrenages:1`.

```
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 8 --mode attaque --niveaux 0,1,2,3,4 --p 0.6,0.7,0.8,0.9
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 12 --mode defense --niveaux 0,1,2,3,4
node atelier/outils/simuler-bataille.js --expedition --semaines 1,3,5,8 --p 0.6,0.7,0.8,0.9 [--armorial complet] [--faveurs engrenages:1]
```

Sorties par semaine, nœud et justesse : escarmouche (tenue %, éclatante %, coups portés), embuscade (tenue %, éclatante %), gardien et grand gardien (tenue % dont victoire, murs restants, batailles pour vaincre quand on retente). Et toujours `--comparer avant.json` sur les provinces : **aucun écart** sur les batailles de campagne.

Cibles de départ (à ajuster avec Romain après quelques expéditions réelles) :

| Mesure, p = 0,7 | S1 → S3 | S6 → S8 | p = 0,9 | p = 0,6 |
|---|---|---|---|---|
| Escarmouche tenue | ≥ 92 % | ≥ 85 % | ≥ 98 % | ≥ 75 % |
| Escarmouche éclatante | 30 à 50 % | 20 à 40 % | ≥ 60 % | ≥ 15 % |
| Embuscade tenue, 1re tentative | 75 à 85 % | 68 à 80 % | ≥ 94 % | 58 à 70 % |
| Gardien vaincu, 1re tentative | 72 à 82 % (la défense du domaine mesurée le 16/10/2026 : 73 à 83 % à 7 sur 10 sur trois vagues) | 65 à 78 % | ≥ 94 % | 55 à 65 % |
| Grand gardien vaincu, 1re tentative | 60 à 70 % | 50 à 62 % | ≥ 88 % | ≥ 40 % |

Leviers, dans l'ordre où le journal du 16/10/2026 les a classés : solidité des camps de route (8, 10, 12, 16), nombre de vagues, `difficulte`, et seulement ensuite la table `RIVAL` (jamais dans le MVP : elle est partagée avec la campagne). Attention aux paliers de flèches (1,534 ; 1,725) : un changement de niveau change tout d'un coup, d'où le simulateur avant tout réglage.

### 17.3 mesurer-tirage.js : la part de la semaine

`--expedition` : des expéditions simulées sur six séances (lots de 3 avec quota de semaine, événements de 3, portes de 1 sur la famille, archives de 3 avant le départ), par les trois élèves simulés du 15/10/2026, départ S1 puis S6 (avec les fichiers des semaines 4 à 8 chargés même s'ils ne sont pas indexés, pour mesurer les semaines minces dès maintenant) :

- part des questions de la fenêtre de l'acte : **≥ 60 %** quand le quota est 2 (cible 67 %), ≥ 30 % quand il est 1 ;
- part de chaque famille présente sur l'expédition : 12 à 30 % ;
- notions à revoir : au moins 1,5 fois leur part, jamais plus de 2 fois ;
- aucune question reposée à moins de 60 questions hors Seconde chance, aucune notion deux fois en 10 questions, même dans une fenêtre de 12 fiches ;
- réussite inchangée (≈ 73 % pour l'élève moyen) ;
- durée du tirage avec quota : médiane < 3 ms hors bac à sable, maximum < 10 ms.

### 17.4 La réussite d'une expédition entière

Dans le MVP, par le calcul à partir des taux de 17.2 (une convolution de quelques lignes, que `simuler-bataille.js --expedition` imprime à la fin de son tableau à partir des taux qu'il vient de mesurer ; refaite le 24/10/2026 avec un petit script) : une expédition échoue quand les murs cèdent autant de fois qu'il y a de vivres ; une escarmouche ou une embuscade cédée ne se rejoue pas, un gardien ou le grand gardien se retente jusqu'à la victoire, chaque échec coûtant un vivre. Hypothèses de murs cédés (à remplacer par les mesures du jour 1) : escarmouche ou embuscade 8 %, gardien 22 %, grand gardien 35 % à p = 0,7 sur S1 → S3 ; 12, 30, 45 % sur S6 → S8 ; 20, 40, 55 % et 25, 45, 60 % à p = 0,6 ; 5, 13, 22 % et 8, 18, 30 % à p = 0,8 ; 2, 6, 12 % et 4, 10, 18 % à p = 0,9.

| Expédition de trois semaines, 2 ou 3 batailles de couche | 2 vivres | **3 vivres (départ)** | 4 vivres (Armorial 40) | 5 vivres (Armorial 150) |
|---|---|---|---|---|
| S1 → S3, p = 0,7 | 63 à 66 % | **83 à 85 %** | 93 à 94 % | 97 à 98 % |
| S6 → S8, p = 0,7 | 45 à 48 % | **68 à 70 %** | 83 à 84 % | 91 à 92 % |
| S1 → S3, p = 0,8 | 83 à 84 % | **95 à 96 %** | 99 % | 100 % |
| S6 → S8, p = 0,8 | 70 à 73 % | **88 à 90 %** | 96 % | 99 % |
| S1 → S3, p = 0,6 | 26 à 30 % | **46 à 50 %** | 63 à 67 % | 76 à 79 % |
| S6 → S8, p = 0,6 | 18 à 22 % | **35 à 39 %** | 52 à 56 % | 66 à 69 % |
| S1 → S3, p = 0,9 | 95 à 96 % | **99 %** | 100 % | 100 % |

Premier gardien franchi avec 3 vivres : 98 % (S1 → S3) et 96 % (S6 → S8) à p = 0,7 ; 89 et 84 % à p = 0,6. Une expédition d'une seule semaine (départ = frontière) : 94 à 95 % à p = 0,7.

Lecture : à 7 sur 10, **environ 85 % des expéditions S1 → S3 vont au bout** dès la première, et 70 % des expéditions S6 → S8 ; c'est plus doux que Hadès (et que les cibles de 55 à 65 % des conceptions sœurs), voulu pour « pas trop d'échecs » dans la version qui n'a ni faveurs rares ni Seconde monture. La tension vient du gardien à retenter, des portes doublées et du choix de profondeur ; les premières défaites arrivent quand l'élève part plus loin dans l'année. Un élève à 6 sur 10 finit une expédition sur deux : c'est le seul cas où le mode échoue souvent, et il est transitoire (le niveau conseillé des questions redescend pour le ramener vers 7 sur 10) ; une défaite lui paie quand même 25 à 40 points de renommée, et le premier quartier de vivres (40) le remonte à deux expéditions sur trois.

Cibles : S1 → S3 : 75 à 85 % sans Armorial, ≥ 90 % avec un vivre de plus ; S6 → S8 : 55 à 70 % sans, ≥ 80 % avec ; à p = 0,6 : ≈ 50 % et ≈ 40 % (pas moins de 40 % et 30 %). Leviers, si les expéditions réelles s'écartent : trop faciles, `vivres: 2` dans config.js (S1 → S3 tombe à ≈ 65 %) ou `difficulte: +1` ; trop dures, `difficulte: −1` (le niveau du rival baisse d'un cran partout) avant de toucher aux vivres. L'incrément 2 remplace ce calcul par `simuler-expedition.js` (le joueur scripté qui parcourt une route à graine, prend les faveurs au hasard, achète un vivre au marchand quand il lui en reste un), qui tiendra compte des faveurs et des achats que le calcul ignore.

### 17.5 perf.js (bout en bout, Chromium)

Départ d'une expédition depuis la campagne (touche de la carte de jeu) ; carte entière visible en 1366 × 768 avec ses cartouches, noms et étiquettes de 14 px au moins, aucun médaillon ni nom qui se touche ; navigation au clavier (1, 2, Entrée) ; escarmouche jouée (toile jamais réallouée, toujours < 100 ms entre une réponse et la question suivante, JEU.mesure et Event Timing, ruban de semaine présent sur chaque question et en relief sur deux sur trois) ; porte de faveur : question puis choix au clavier ; retour à la campagne au milieu de la route puis « Reprendre » : même position, mêmes vivres, mêmes faveurs ; défaite forcée (vivres mis à 1 par la console, bataille quittée après la 1re vague) : bilan avec renommée > 0, campagne intacte (provinces, ressources, jauges, arsenal, `bonus` identiques avant et après, à l'exception des ressources gagnées par bonne réponse) ; export puis import : l'expédition en cours revient ; « Sang dans les combats » et « Animations » coupés : aucune erreur JavaScript sur la carte de route ; « Messages des rivaux » coupé : pas de défi avant le grand gardien.

### 17.6 Validateur

Rien de nouveau dans jeu/data/cours : le validateur ne change pas, sauf le même numéro dans VERSION.txt et JEU.version. Les textes de l'expédition (phrases de cadre, faveurs, pages de semaine, bilan) vivent dans expedition.js : tests.js les passe à la liste du contrôle 10 (chiffres, religion, insultes, noms de personnages).

## 18. Les cinq vérifications pour Romain (à la livraison)

(Écrites pour la frontière S3 ; si les semaines 4 à 8 sont indexées le jour de la livraison, lire « S6 » pour « S1 » et « S6 → S8 » pour « S1 → S3 ».)

1. Campagne → « Partir en expédition » : tu vois le parchemin de l'année avec la frontière (S3 aujourd'hui), la semaine du calendrier en bannière dans la brume, le choix de la semaine de départ, le front, l'Armorial à 0, la durée estimée ; « Partir » ouvre la page « Semaine 1 » avec les titres de ses cours.
2. Sur la route : deux ou trois haltes au choix avec leur porte, le gardien à droite, les semaines 2 et 3 dans la brume ; la touche 1 entre dans la première halte ; en bataille, deux questions sur trois portent le ruban « Semaine 1 » en relief, la troisième une autre semaine, « Griffon de cuivre », « Fiche méthode » ou « Anglais ».
3. Après l'escarmouche : le conseiller de la porte pose une question de sa matière, puis trois faveurs au choix (deux si tu te trompes) ; la faveur choisie apparaît dans « Ta compagnie » ; le sceau se pose sur la halte.
4. « Retour à la campagne » depuis la route : la carte dit « Reprendre l'expédition · semaine 1, 2e couche » ; joue l'événement du jour de la campagne s'il y en a un (il est toujours là) ; Réglages → Exporter, puis Importer le même fichier : l'expédition reprend au même point, mêmes vivres, mêmes faveurs.
5. Perds exprès le gardien deux fois de suite (ne pose rien) : vivres 3 → 1, le gardien se retente avec les coups déjà portés ; perds une troisième fois : le bilan montre la renommée gagnée (plus que zéro), « À relire », et la campagne n'a rien perdu (mêmes provinces, mêmes ressources, mêmes jauges). Puis « Repartir » : l'Armorial propose la Bourse du voyageur à 25.

## 19. Risques et questions pour Romain

1. **Départ libre, défaut sur le tronçon de l'année en cours** (plutôt que des relais à débloquer, ou toujours la semaine 1 comme dans Hadès) : d'accord ? C'est le choix qui révise le mieux ce que ton fils travaille en ce moment. Les relais peuvent s'ajouter ensuite par un réglage, sans rien perdre.
2. **Longueur** : trois semaines, 25 à 35 minutes à vitesse ×1, en deux séances. Préfères-tu deux semaines par défaut (18 à 25 minutes), avec trois au choix ? Ou la vitesse ×2 proposée au départ ?
3. **Vivres** : une bataille où les murs cèdent coûte un vivre (trois au départ) ; c'est la seule chose qu'on « perd », et seulement dans l'expédition. Le calcul (17.4) donne ≈ 85 % d'expéditions S1 → S3 réussies à 7 sur 10 au début, ≈ 70 % sur S6 → S8, une sur deux pour un élève à 6 sur 10. Trop doux ? Trop dur ? `vivres` et `difficulte` dans config.js se changent sans code.
4. **Fermer le jeu au milieu d'une bataille de route** après la première vague : compté comme une retraite (−1 vivre), comme un abandon volontaire ? Proposé : oui, pour qu'on ne puisse pas annuler une vague qui tourne mal en fermant la fenêtre.
5. **Or de route perdu au retour** : clair pour un élève de 13 ans si le jeu le dit avant le grand gardien ? Autre solution : le changer en ressources du domaine (1 pour 10) au bilan.
6. **Noms** : « Expédition », « halte », « porte », « gardien », « grand gardien », « faveur », « renommée », « Armorial », « vivres », « or de route », « Lever le camp ». Tous changeables avant le code (les identifiants internes ne porteront pas ces mots).
7. **Semaines minces** : tant que les semaines 4 à 8 n'ont que quelques cours chargés, la route élargit la fenêtre de l'acte aux semaines d'avant (S6 → semaines 5 et 6) ; c'est temporaire, et la page de semaine le dit. D'accord pour que « semaine 6 » puisse vouloir dire « semaines 5 et 6 » pendant quelques jours ?
8. **Risque de réglage** : la difficulté des batailles compte par paliers (flèches par soldat) ; le MVP ne touche pas à la table du rival et joue sur les solidités, les vagues et le mode, mesurés au simulateur dès le premier matin ; il faudra deux ou trois expéditions réelles pour ajuster. `difficulte` dans config.js est là pour ça.
9. **Risque de collision** avec les chantiers en cours (bataille-moteur.js en revue, bataille.js, recit.js, personnages.js, cours des semaines 4 à 8) : toutes les accroches sont des ajouts sous condition ; à livrer après ces chantiers, en comparant les batailles de campagne graine pour graine avant et après.
10. **Semaine 7** : elle n'a que trois cours au planning (géographie, lecture, histoire). Même pleine, ses questions de semaine seront moins nombreuses et moins variées que les autres : la fenêtre élargie et le tiers ordinaire font le reste ; voulu, mais à savoir.
11. **Textes de route qui glisseraient vers du contenu de cours** : règle écrite (section 2), relecture dans /relecture, contrôle 10 appliqué par tests.js.

## Annexe A : les nombres en une page

| Quoi | Valeur de départ (MVP) |
|---|---|
| Semaines par expédition | 3 au plus (config `semaines`) ; départ libre, défaut frontière − 2 |
| Couches par semaine / haltes par couche / nœuds joués par semaine | 2 / 2 ou 3 / 3 (2 haltes + gardien) |
| Vivres au départ / maximum | 3 / 5 (Armorial : 4, 5) |
| Questions : escarmouche, embuscade, événement, marchand, bivouac, gardien, grand gardien | 6, 6, 2 à 3, 1, 1, 6, 9 ; ≈ 45 par expédition |
| Part des questions de la fenêtre de l'acte | 2 sur 3 (`questionsSemaine`) si la fenêtre a 12 fiches (élargie de deux semaines au plus), 1 sur 3 entre 5 et 11, aucune sous 5 ; le reste au tirage ordinaire |
| Niveau du rival | (semaine − 1) div 2, plafond 4, + `difficulte` ; grand gardien + 1 |
| Modes et vagues : escarmouche, embuscade, gardien, grand gardien | attaque 2 ; défense 2 ; défense 2 ; défense 3 |
| Solidité des camps de route | 8, 10, 12, 16 (à mesurer le jour 1) |
| Portes : faveur / bourse / parchemin | 60 / 25 / 15 % (embuscade : faveur toujours) |
| Faveurs : conseillers / faveurs / rangs | 6 / 6 / 2 |
| Or de route : halte tenue, éclatante, bourse, bivouac ; marchand : faveur, vivre, plan | 15, +10, 20, 20 ; 40, 35, 15 (−20 % si la question d'ouverture est juste) |
| Renommée : réponse, halte tenue, halte légère, gardien, grand gardien, expédition | 1 ; 5 ; 3 ; 10 + S ; 15 + 2S ; +10 |
| Armorial | 4 quartiers, 625 points en tout, premier achat à 25 |
| Retour triomphal, lien campagne | +3 coups à la prochaine place forte du front, rivalité +6, 8 ressources de la meilleure matière |
| Durée visée | 25 à 35 minutes (×1), 20 à 25 (×2) ; une semaine seule : 10 à 12 ; reprise après chaque nœud |
| Réussite visée (sans Armorial) | p = 0,7 : S1 → S3 83 à 85 %, S6 → S8 68 à 70 % (calcul 17.4) ; p = 0,6 : ≈ 50 % et ≈ 40 % ; un vivre d'Armorial : 93 % et 83 % |
| Volume de code | ≈ 950 lignes JS, 250 CSS, 50 tests ; aucun changement du moteur de bataille |

## Annexe B : une expédition type, S6 → S8 vers l'ouest, racontée

Le souverain confie la route. Page « Semaine 6 · du 5 au 11 octobre 2026 » : les titres des cours ouverts de la semaine, et la phrase « La semaine 6 est encore mince sur les registres : la route repasse aussi par la semaine 5 » (tant que SVT, physique et littérature de la semaine ne sont pas déposées ; après, « Les cours de la semaine 6 t'attendent sur la route »). Sur le parchemin, trois haltes à gauche : une escarmouche au Gué avec la porte de l'herboriste, le défi du champion, un bivouac. L'élève prend l'escarmouche : deux vagues, six questions dont quatre des semaines 5 et 6 (histoire, physique, histoire, SVT) et deux d'ailleurs (une géographie de la semaine 2 à revoir, une conjugaison du Griffon de cuivre), chacune avec son ruban de semaine. Le camp tombe à la deuxième vague : éclatante. L'herboriste pose une question de SVT ; juste : quatre faveurs au choix, il prend les Onguents. Deuxième couche : l'embuscade (défense, deux vagues) avec la porte du maître d'œuvre, ou le marchand. Il prend le marchand, répond juste, achète un plan de bataille (12 or après remise) et garde le reste. Gardien de la semaine 6 : défense, deux vagues, niveau 2 ; les murs tiennent de peu. Semaine franchie, sceau sur le parchemin de l'année, +16 renommée. Page « Semaine 7 ». Et ainsi de suite jusqu'au roi d'Angleterre, trois vagues au niveau 4 devant la place forte du Gué, qui envoie d'abord une lettre de défi. S'il cède deux fois, l'élève rentre avec ses 90 points de renommée, achète la Bourse du voyageur et les Murs chaulés, et repart le lendemain, un peu plus fort, sur la même route ou une autre.
