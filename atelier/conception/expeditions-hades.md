# Expéditions : un mode roguelite à la Hadès sur la carte de campagne

Document de conception, version 2 du 24 octobre 2026 (elle remplace la version du 20 octobre, même fichier). Rien de ce document n'est codé : il décrit ce qu'on construit, avec des nombres de départ à régler au simulateur, et dans quel ordre. Il répond à deux demandes de Romain du 16 octobre 2026 :

- « le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie » ;
- « intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles ».

Angle retenu : le plus proche de Hadès. Les dieux de l'Olympe deviennent les six conseillers du domaine (un par famille de matières), leurs dons deviennent des **faveurs** à trois rangs, avec des duos ; le Miroir de la Nuit devient l'**Armorial** (améliorations permanentes achetées avec la **renommée**, jamais perdue) ; le Pacte du Châtiment devient les **Serments** (difficulté facultative, ouverte après la première victoire sur un Grand Gardien) ; la Maison d'Hadès, où l'on revient entre deux évasions, c'est la carte de campagne, avec son souverain et ses rivaux qui commentent chaque retour ; et la route du Tartare à la surface devient **la route des semaines** : chaque semaine du programme est un acte, qui se ferme par son gardien.

Ce qui change par rapport à la version du 20 octobre (pour qui l'a lue) : l'état du code au 24 octobre (section 0.2) ; un troisième relais toujours ouvert, « le tronçon de l'année en cours », pour ne jamais forcer l'élève à rejouer septembre (3.3) ; l'embuscade devient une bataille où l'on se défend (le moteur sait déjà faire, 6.2) ; une règle pour les semaines encore minces en cours (5.2) ; deux noms d'événements changés pour la neutralité (4.2) ; la table de correspondance avec Hadès (section 0.1) ; la prime d'ardeur des Serments (6.4) ; le compte des questions et des durées refait avec le contenu réel (12) ; les accroches de code revues ligne à ligne sur le code du 24 octobre (15) ; un piège repéré (les bonus de campagne « mercenaires » et « espion » ne doivent pas servir sur la route, 11).

## 0. Repères

### 0.1 Hadès → Expéditions, la table de correspondance

| Dans Hadès | Ici | Où c'est décrit |
|---|---|---|
| Une évasion (un « run ») | Une **expédition** : trois semaines du programme de suite, 30 à 40 minutes, reprise à tout moment | 1, 3, 12 |
| Les biomes (Tartare, Asphodèle, Élysée, Styx) | Les **semaines** (actes), de plus en plus dures | 3, 6 |
| Les salles et leurs portes marquées d'une récompense | Les **haltes** et leurs **portes** (faveur d'un conseiller, bourse, parchemin, vivres) | 4 |
| Les boss de biome (la Furie, la Lernie, les Champions, Hadès) | Le **Gardien de la semaine** (un seigneur rival) et le **Grand Gardien** (le rival du front, en personne) | 4.1, 6.2 |
| Les dieux et leurs bienfaits (commun, rare, épique, duo, légendaire) | Les six **conseillers** et leurs **faveurs** (commune, rare, épique, duo, érudition) | 7 |
| La Grenade (monter un bienfait d'un rang) | **Affiner** une faveur (bivouac, marchand, ou la reprendre) | 7.2, 7.5 |
| Les points de vie, la Défiance de la mort | Les **vivres** (3), la **Seconde monture** (Armorial) | 8, 9.2 |
| L'obole de Charon et sa boutique | L'**or de route** et le **marchand** | 7.5, 8 |
| Les Ténèbres et le Miroir de la Nuit | La **renommée** et l'**Armorial** (neuf quartiers, 980 points) | 9 |
| Le Pacte du Châtiment et sa chaleur, les primes de chaleur | Les **Serments** et leur **ardeur** (8 points au plus), la **prime d'ardeur** par relais | 6.4 |
| La Maison d'Hadès entre deux évasions, les dialogues | La **carte de campagne**, le souverain qui confie la route, les missives des rivaux | 10 |
| Les souvenirs (keepsakes) | **Faveur d'ouverture** (Armorial), puis les **gages** des conseillers (extension) | 9.2, 10.4 |
| Les fontaines, les coffres infernaux, les rencontres (Thanatos, Chaos, Sisyphe) | Le **bivouac**, le **trésor**, les **événements de route** | 4 |
| La liste des prophéties, les titres | La **Chronique des expéditions** et ses **titres** | 9.3 |

Ce qui n'est volontairement pas repris de Hadès : les combats en temps réel au clavier (ici, on répond à des questions, puis on regarde la vague), le départ obligé du premier biome (3.3), toute forme de chrono, et la mort comme fin : ici, on **rentre au domaine**, avec sa renommée.

### 0.2 L'état du code au 24 octobre 2026, dont ce document dépend

- Jeu 0.8.0, sauvegarde au schéma 5, 227 tests Node, validateur sans erreur.
- Contenu chargé : 46 cours ou séquences, 2 034 questions. Par semaine du planning (fichiers présents dans jeu/data/cours, qu'index-cours.js les liste déjà ou non) : S1 : 9 cours, 44 fiches, 363 questions ; S2 : 8, 39, 314 ; S3 : 6, 25, 213 ; S4 : 3, 15, 117 ; S5 : 2, 8, 70 ; S6 : 1, 4, 37 ; S7 : 2, 8, 69 ; S8 : 4, 18, 156 ; hors semaine : 3 cours de grammaire (112 questions), 5 fiches méthode (187), 3 séquences d'anglais (396). Les semaines 4 à 8 n'ont pour l'instant que l'histoire et la géographie (chantier « cours des semaines 4 à 8 » en cours) : d'où la règle des semaines minces (5.2).
- index-cours.js ne liste encore que les semaines 1 à 3 : la **frontière** (3.3) est S3 aujourd'hui, S8 dès que le chantier aura indexé ses fichiers.
- Le tirage unique du jeu : `JEU.recit.suite(nombre, options)` (équilibre des familles, priorités à revoir, fenêtre anti-répétition de 60, repos des fiches, Seconde chance placée par `JEU.rappels.placer`, `eviterTriples`), avec `JEU.questions.avecNiveaux(NIVEAUX_BATAILLE, …)` en bataille.
- Le moteur (`jeu/js/bataille-moteur.js`) : `creer(carte, options)` lit vagues, orDepart, pvChateau, pvRival, pvRivalMax, niveau, bonusDegats, arsenal, orParReponse, orPerduErreur, defense, espion ; la table `RIVAL` à cinq lignes réglée le 16/10 ; le seigneur rival (tours de départ, garnison, guetteurs, décisions journalisées ; revue du 24/10 en cours : la posture « méfiance » fortifie aussi sa porte, et ses guetteurs comptent l'or qu'on gardait à la vague d'avant) ; `repondre(p, juste)` pour l'or ; aucun hasard dans les décisions. Le mode `defense` (troupes d'assaut, coups aux murs doublés) marche sur n'importe quelle carte (`options.defense`).
- `jeu/js/bataille.js` : `lancer(lieu)` construit tout depuis la campagne (`C.options(niveau)`, `C.apresBataille(bilan)`, `JEU.partie.surQuitter`), tire ses questions par `tirerQuestions(n, posees)`, affiche le mot du rival (`phraseRival`, p.ia.journal) et le cadre du récit (`JEU.recit.cadre(q, "preparation" | "defense", adv)`).
- `jeu/data/personnages.js` : souverains (Clovis, Pépin le Bref, Charlemagne) et rivaux en titre seul (« Le roi d'Angleterre », « L'émir de Cordoue ») ; situations presentation, defi, victoire, tenu, retraite, province, attaque ; `JEU.campagne.rivalDe`, `souverain`, `missiveAvantBataille`, `prendreMissives`, `monterRivalite` ; `JEU.ecranCampagne.medaillon`, `medaillonHeraldique(camp, generique)`, `sceau(camp)`, `ouvrirMissive`.
- Les six conseillers existent (`JEU.recit.CONSEILLERS`) ; l'interprète a maintenant 396 questions d'anglais derrière lui : ses portes s'ouvrent dès le MVP.
- Simulateurs : `atelier/outils/simuler-bataille.js` (joueur scripté, 80 graines, `--regle`, `--comparer`, `--strategies`), `mesurer-tirage.js` (parts par famille, répétitions, élèves simulés), `tests.js`, `perf.js` (Playwright).

## 1. En deux mots

Une **expédition** est une partie à part, lancée depuis la carte de campagne. Le joueur part d'un **relais** (une semaine du programme) et traverse **trois semaines de suite**, une par acte. Chaque semaine est une petite carte à embranchements sur un parchemin : trois **haltes** au choix (escarmouche, embuscade, événement, marchand, bivouac, trésor, archives), puis le **Gardien de la semaine**. Le dernier acte se ferme sur le **Grand Gardien**, le rival du front, en personne.

- Chaque halte pose des questions par le tirage habituel du jeu, avec une règle de plus : **deux questions sur trois viennent des cours de la semaine traversée**, la troisième vient du tirage ordinaire (toutes semaines, équilibre des matières, priorités « à revoir », Seconde chance). On voit donc les semaines défiler, et les anciennes reviennent quand même.
- Les réponses paient tout : l'or de la bataille comme aujourd'hui, l'or de route, et le droit de choisir une faveur.
- Les **faveurs** ne durent que l'expédition. La **renommée** reste pour toujours : elle paie l'Armorial, qui rend chaque expédition suivante un peu plus facile. La défaite (plus de vivres) renvoie au domaine avec la renommée gagnée : rien n'est jamais retiré au royaume, ni province, ni bâtiment, ni ressource, ni jauge.
- La difficulté monte avec la semaine traversée (le réglage du seigneur rival suit la semaine, comme il suit aujourd'hui le niveau de la province) et, à l'intérieur d'une semaine, de la première halte au gardien. Partir plus loin dans l'année rapporte plus de renommée.

## 2. Ce que les règles imposent, et ce qui est tranché

Les règles fermes de CLAUDE.md et du cahier des charges s'appliquent telles quelles. Ce qu'elles donnent pour ce mode :

| Règle | Dans les expéditions |
|---|---|
| Jamais de chrono | Aucun compte à rebours, aucune horloge affichée. La route n'a pas de « temps restant », seulement des « haltes restantes ». |
| Difficulté réglée pour 7 réussites sur 10 | Le tirage des niveaux de questions ne change pas (niveau conseillé ; batailles aux niveaux 1 à 3 ; événements, portes, bivouac, marchand, trésor, archives aux niveaux 1 et 2). La difficulté du mode porte sur la bataille (réglage du rival par semaine), jamais sur les questions. Cibles de réussite d'une expédition : section 17.2. |
| Une erreur ne coûte ni bâtiment, ni province, ni ressource du royaume | Une réponse fausse coûte au plus 6 or de la bataille en cours, comme aujourd'hui. Les **vivres** sont une ressource de l'expédition, créée au départ et rendue au retour : une bataille où les murs cèdent en coûte un ; une question ratée, jamais. Rien du royaume ne baisse. |
| Seconde chance | Inchangée : la file des rappels traverse les haltes comme elle traverse aujourd'hui batailles, conseils et événements. |
| Un cours s'ouvre dès que son fichier existe ; le calendrier ne bloque rien | **Frontière** de la route : la dernière semaine du planning qui a au moins un fichier de cours chargé. La semaine du calendrier est affichée (bannière « Cette semaine »), elle ne verrouille rien. En pratique les deux coïncident, puisque Romain dépose les cours au fil de l'année ; un cours déposé en avance ouvre la route en avance, comme le reste du jeu. |
| Un cours pas encore ouvert reste dans la brume | Au-delà de la frontière : nappes de brume, numéro de semaine et titres du planning (déjà visibles dans l'écran Cours), aucune question, aucun aperçu. |
| Chaque question est posée dans le récit | Nouvelles phrases de cadre pour la route (5.4), avec la semaine dite par le conseiller. L'énoncé ne change jamais. |
| Style Total War, enluminure, héraldique | Carte-itinéraire sur parchemin à la manière de la Table de Peutinger et de l'itinéraire de Matthew Paris (XIIIe siècle) : une longue route horizontale, des vignettes d'étapes, des lettrines rubriquées pour les semaines (section 14). |
| Conflits : camps politiques, ton neutre, adversaires du cours sinon « un seigneur rival » | Le Gardien d'une semaine est « un seigneur rival » du camp du front (médaillon héraldique au tortil, sans nom ni visage) ; le Grand Gardien est le rival du front tel que personnages.js le donne (en titre seul aujourd'hui). Aucune figure religieuse, aucun lieu de culte, aucun nom inventé, ni dans les haltes ni dans les événements de route. |
| Bonus jamais en bataille ni en boss | Le tirage les exclut déjà (contrôle 6 du validateur). |
| Pas d'épreuve de validation dans le jeu | Un gardien vaincu ne change ni suivi.js ni l'état d'un cours. Il n'ouvre rien d'autre que le relais suivant de la route. |
| Moins de 100 ms entre une réponse et la question suivante | Les faveurs sont appliquées une fois, à la création de la bataille (options du moteur) ; aucune n'ajoute de travail entre deux questions. Le quota de semaine ajoute un passage de `tirage()` au début d'une vague ou d'une halte, jamais entre deux questions. |
| Rien dans jeu/ qui vienne d'un devoir ; productions personnelles hors jeu | Les textes de route, de faveurs, d'événements et de titres sont des textes de jeu sans fait de cours, soumis aux mêmes interdits que les répliques de personnages.js (ni chiffre de cours, ni religion, ni insulte). |

Décisions prises faute d'arbitrage dans le cahier des charges (à reporter dans docs/JOURNAL.md, rubrique Décisions, à la livraison) :

1. **Une expédition = 3 semaines** (2 ou 1 si la frontière est plus proche), réglable dans config.js, pour tenir 30 à 40 minutes. « Jusqu'à la semaine 8 » donne aujourd'hui trois tronçons : S1-S3, S4-S6, S7-S8 (S9 quand ses cours seront là).
2. **Les relais** (semaines où une expédition peut partir) sont S1, chaque semaine qui suit une semaine franchie (Grand Gardien vaincu), **et toujours le tronçon de l'année en cours** (frontière − 2). On ne repart pas toujours de la semaine 1 comme dans Hadès : Romain veut voir les semaines défiler, et l'élève doit pouvoir réviser ce qu'il travaille cette semaine sans rejouer septembre. Les semaines anciennes reviennent quand même par la troisième question de chaque lot et par les haltes « archives ».
3. **La défaite** vient des vivres (3 au départ), perdus un par bataille où les murs cèdent, jamais par une question. Un gardien raté se retente tant qu'il reste des vivres, et les coups qu'on lui a portés restent (comme pour une place forte de la campagne).
4. **Les faveurs se méritent par une question** du conseiller qui les offre : juste, trois faveurs au choix (dont parfois une rare) ; fausse, deux faveurs communes au choix. Jamais rien, jamais de porte vide.
5. **Rien de permanent ne vient des faveurs** ; la renommée et l'Armorial sont la seule méta-progression. Les ressources du domaine gagnées par bonne réponse (1 par réponse juste, règle générale de `enregistrerReponse`) restent acquises comme partout.
6. **Les embuscades et les gardiens se jouent en défense** (mode `defense` du moteur : troupes d'assaut, coups aux murs doublés), **les escarmouches en attaque**. C'est la seule façon, avec le moteur d'aujourd'hui, qu'une bataille de route puisse se perdre : en attaque, le rival n'abat presque jamais tes murs (ses troupes ordinaires frappent 1 ou 2 coups, ton château en a 20 et plus). Le mode défense est déjà réglé pour « inquiéter un peu » (tenue 73 à 83 % à 7 sur 10 sur trois vagues ; journal du 16/10/2026).

## 3. La route des semaines

### 3.1 Vocabulaire

- **Expédition** : une partie du mode (un « run »).
- **Relais** : la semaine de départ. Relais ouverts : S1 ; S(w + 1) pour chaque semaine w franchie ; et max(1, frontière − 2), le tronçon de l'année en cours.
- **Acte** : une semaine du programme, traversée en 3 haltes puis un gardien. Affichée partout « Semaine 4 » et, sous la carte, « Semaine 4 · du 21 au 27 septembre 2026 » (`JEU.calendrier.lundiDe`).
- **Halte** : un nœud de la route (une bataille courte, un événement, un bivouac…). Trois couches de haltes par semaine, 2 ou 3 haltes par couche ; on en joue une par couche.
- **Gardien de la semaine** : la bataille qui ferme la semaine (défense d'un camp de route, 2 vagues). **Grand Gardien** : celle qui ferme l'expédition (3 vagues, le rival du front).
- **Frontière** : dernière semaine ouverte (au moins un fichier de cours du planning chargé pour cette semaine). Au-delà : brume.
- **Vivres** : les « vies » de l'expédition. **Or de route** : la monnaie de l'expédition (le marchand). **Faveurs** : les dons des conseillers, pour l'expédition seulement. **Renommée** : la monnaie permanente. **Armorial** : les améliorations permanentes. **Serments** : la difficulté facultative, mesurée en **ardeur**.

### 3.2 Forme de la route

Pour une expédition partant du relais S4 avec la frontière en S8 :

```
 S4 ─────────────────────────────┐  S5 ──────────────────────────┐  S6 ────────────────────────────┐
 [départ] ─┬─ halte ─┬─ halte ─┬─ halte ─┐                      │                                  │
           ├─ halte ─┼─ halte ─┼─ halte ─┼─ GARDIEN S4 ─┬─ … (3 couches dans la brume) … ─ GARDIEN S5 ─┬─ … ─ GRAND GARDIEN S6 ─ [retour]
           └─ halte ─┘         └─ halte ─┘              │                                  │
                                              S7, S8 : visibles plus loin sur le parchemin, hors de cette expédition
                                              S9 et au-delà : brume (titres du planning seulement)
```

- **Couches** : 3 par semaine. Chaque couche a 2 haltes (55 %) ou 3 (45 %). Chaque halte a 1 ou 2 chemins vers la couche suivante ; toute halte est atteignable depuis le départ et mène au gardien. Le générateur relie d'abord chaque halte à la halte « en face », puis ajoute des diagonales ; il refuse les croisements, comme Slay the Spire. Haltes générées par semaine : 6 à 9 ; jouées : 3 + le gardien. Une expédition de 3 semaines : 12 nœuds joués (9 haltes, 2 gardiens, 1 Grand Gardien).
- **Ce qu'on voit** : les trois couches de la semaine en cours, avec le type de chaque halte et sa **porte** (la récompense annoncée : le médaillon du conseiller qui offrira une faveur, une bourse, un parchemin de renommée, un sac de vivres). Les semaines suivantes de l'expédition : une nappe de brume par couche, le gardien en silhouette. Au-delà de la frontière : brume et numéro de semaine seulement. Dans Hadès, on choisit sa porte à la récompense ; ici pareil, et la récompense dit aussi quelle matière on va rencontrer.
- **Les gardiens** : un par semaine, posé à droite de ses trois couches. Celui de la dernière semaine de l'expédition est le Grand Gardien.
- **Cartes de bataille** : les cinq tracés existants tournent avec la semaine, `["gue", "foret", "moulin", "col", "chateau"][(semaine − 1) % 5]`, avec la variante sèche (`-sud`) quand l'expédition va vers l'Empire omeyyade ; les gardiens prennent le tracé du domaine (défense d'un camp fortifié ; le moteur joue une défense sur n'importe quelle carte, `options.defense`).

### 3.3 La frontière, les relais, la brume, la fin de l'année

- Frontière = la plus grande semaine w telle qu'il existe un cours du planning de semaine w dont le fichier est chargé (`JEU.progression.fichierPresent`). Aujourd'hui S3 ; S8 dès qu'index-cours.js liste les fichiers des semaines 4 à 8.
- Une expédition couvre `min(3, frontière − relais + 1)` semaines. Une seule semaine ouverte : expédition d'une semaine, Grand Gardien direct. Aucune semaine ouverte : la carte de campagne ne propose pas le mode (« La route attend tes premiers cours »).
- Relais ouverts : S1 ; la semaine qui suit chaque semaine franchie (franchir S1-S3 ouvre le relais S4, pour toujours) ; et max(1, frontière − 2), le tronçon de l'année en cours. Pourquoi ce troisième relais : avec les trois semaines de départ ouvertes dès le premier jour (S1, S4, S6 quand la frontière est S8), l'élève joue d'abord ce qu'il travaille, puis gagne le droit d'aller plus loin semaine après semaine ; si la frontière avance plus vite que lui, le relais du jour suit sans qu'il doive rattraper tout l'intervalle. Le défaut proposé à l'écran de départ est le relais ouvert le plus élevé.
- Repartir d'un relais ancien reste toujours possible : utile pour réviser, et les Serments y donnent de la renommée en plus.
- Brume : au-delà de la frontière, la route montre les numéros de semaine et les titres du planning (déjà dans l'écran Cours), rien d'autre : ni question, ni aperçu, ni gardien nommé.
- Après S34 (révision libre), la route reste jouable depuis n'importe quel relais ; aucune semaine nouvelle n'arrive.

### 3.4 Génération procédurale et graine

- **Graine** : un entier 32 bits tiré au départ de l'expédition, `(Date.now() ^ (JEU.questions.posees().horloge * 2654435761)) >>> 0`, gardé dans la sauvegarde et affiché au bilan sous la forme « Graine 4F2A-9C01 ». Le jeu reçoit un petit tirage à graine (mulberry32, le même que celui des simulateurs, une dizaine de lignes dans `jeu/js/expedition.js`, exposé en `JEU.expedition.alea(graine)`). Avec la même graine : même route, mêmes types de haltes, mêmes portes, mêmes conseillers de porte, même étal du marchand, mêmes modificateurs d'élite, mêmes offres de faveurs (dans l'ordre où on les demande). Jamais `Math.random` dans la génération.
- **Ce qui n'est pas à graine** : le tirage des questions, qui suit l'état réel de l'élève (Leitner, fenêtre anti-répétition, Seconde chance). C'est voulu : deux élèves sur la même route n'ont pas les mêmes questions. Le moteur de bataille est déjà sans hasard pour ses décisions (`Math.random` n'y sert qu'au pas des figurines).
- **La route est écrite dans la sauvegarde** (environ 2 Ko), pas recalculée à partir de la graine : une version future du générateur ne doit pas changer une expédition en cours. La graine sert à rejouer dans les simulateurs et à reproduire un défaut signalé par Romain.
- **Génération en une passe** par semaine, dans cet ordre : nombre de haltes par couche ; types (table 4.3, avec ses garanties) ; portes (4.4) ; chemins ; modificateur d'élite des embuscades (6.3) ; étal du marchand (7.5) ; carte de bataille. Les contraintes sont vérifiées à la fin ; si l'une manque (cas rare : le tirage pondéré ne peut pas toujours satisfaire les garanties), on régénère la semaine avec graine + 1, vingt fois au plus, puis une semaine de secours fixe (escarmouche, marchand, bivouac). Déterministe, testé sur 200 graines (17.1).

## 4. Les haltes

### 4.1 Les types

| Halte | Icône (Game-icons déjà dans le jeu) | Ce qui se passe | Questions | Réussite | Échec | Durée |
|---|---|---|---|---|---|---|
| **Escarmouche** | assaut | Bataille d'1 vague, en attaque, sur la carte de la semaine, sans champion adverse, contre un camp de route (solidité 6). Le conseil de guerre pose 3 questions, on place, on lance. | 3 (niveaux 1 à 3) | Tenir (toujours ou presque). **Éclatante** si le camp tombe : porte doublée | Murs cédés (très rare) : −1 vivre, porte simple quand même | 2,5 à 3 min |
| **Embuscade** (élite) | mercenaires | On est attaqué sur la route : bataille de 2 vagues **en défense** (troupes d'assaut, coups aux murs doublés), avec un modificateur d'élite (6.3), champion à la 2e vague, camp adverse de solidité 10. | 6 | Tenir. Éclatante si le camp tombe | Murs cédés : −1 vivre ; la halte est passée quand même, porte simple | 4,5 à 5 min |
| **Événement** | l'icône de l'événement | Un des événements du jour existants adapté à la route, ou un des quatre nouveaux (4.2). | 2 ou 3 (niveaux 1 et 2) | Selon l'événement ; jamais de perte | — | 1 à 1,5 min |
| **Marchand** | marchand | Le maître d'œuvre tient l'étal. Une question de physique-chimie l'ouvre ; juste, les prix baissent de 20 %. Puis achats avec l'or de route (7.5). | 1 | — | — | 1 min |
| **Bivouac** | incendie (feu de camp) | La veillée : le ménestrel pose une question. Puis un choix : +1 vivre (jusqu'au maximum), ou +25 or de route, ou affiner une faveur d'un rang. Toujours au moins un bivouac atteignable par semaine. | 1 ou 2 | — | — | 1 min |
| **Trésor** | tresor | La cache : 2 questions. Chaque bonne réponse ouvre un coffre (+25 or de route) ; les deux justes : une faveur rare au choix parmi deux, à la place du second coffre. | 2 | — | — | 1 min |
| **Archives** | parchemin-plume | Un vieux scribe du bailli garde les registres des semaines passées : 3 questions tirées **avant** le relais (semaines < départ ; depuis le relais S1, les notions à revoir). Renommée doublée pour cette halte. | 3 | — | — | 1 à 1,5 min |
| **Gardien de la semaine** | defi | Défense d'un camp fortifié, 2 vagues (mode `defense`), garnison rivale +1. On gagne en tenant les 2 vagues ou en abattant sa place (12 points, qui restent d'une tentative à l'autre). | 6 | Tenu ou victoire : semaine franchie | Murs cédés : −1 vivre, on retente | 5 min |
| **Grand Gardien** | couronne (médaillon du rival) | Même règle, 3 vagues, ligne du rival + 1, une tour adverse de plus au départ, un champion à chaque vague à partir de la 2e, place de 16 points. Missive de défi du rival avant, réaction après. | 9 | Tenu ou victoire : expédition accomplie | Murs cédés : −1 vivre, on retente | 7 min |

Les durées supposent 15 à 20 secondes par question et des vagues regardées à vitesse ×1 (les boutons ×2 et ×3 existent déjà ; la vitesse choisie est retenue d'une halte à l'autre). Compte et durée d'une expédition : section 12.

### 4.2 Événements de route

Les cinq événements du jour (`JEU.campagne.EVENEMENTS`) se rejouent sur la route avec des gains de route à la place des gains de campagne : marchands → +4 or de route par bonne réponse ; défi du champion → 3 coups au gardien de la semaine ; mercenaires → +40 or au début de la prochaine bataille de route (`plan`) ; feu au grenier → +1 vivre ; espion → première vague du gardien affaiblie. Quatre événements propres à la route (textes de jeu, sans contenu de cours, sans nom propre, sans lieu de culte) :

- **Le pont rompu** (la cartographe) : 2 questions ; chaque bonne réponse rouvre un chemin : la couche suivante montre toutes ses portes, même celles qu'un Serment cache.
- **La meunière** (l'herboriste) : 3 questions ; 2 justes sur 3 : la compagnie est soignée et nourrie, +1 vivre.
- **Le colporteur** (l'interprète) : 2 questions ; une bonne réponse : une faveur commune au choix parmi deux ; deux : parmi trois, dont une rare.
- **Les registres du bailliage** (le chroniqueur) : variante des archives, 3 questions d'il y a au moins deux semaines ; renommée ×2.

### 4.3 Répartition des types

Tirée à la graine, couche par couche, avec des garanties :

| Couche | Escarmouche | Embuscade | Événement | Marchand | Bivouac | Trésor | Archives |
|---|---|---|---|---|---|---|---|
| 1re | 55 % | 0 | 30 % | 0 | 0 | 5 % | 10 % |
| 2e | 35 % | 25 % | 15 % | 15 % | 0 | 10 % | 0 |
| 3e | 25 % | 0 | 20 % | 15 % | 40 % | 0 | 0 |

Garanties par semaine : au moins une escarmouche ou une embuscade en 1re ou 2e couche ; au moins un bivouac en 3e couche ; au plus une embuscade ; exactement un marchand (en 2e ou 3e couche) ; au plus une halte de chaque autre type par couche ; jamais deux haltes du même type côte à côte dans une couche (sauf escarmouches) ; **un chemin sans embuscade existe toujours** (l'élite n'est jamais la seule halte joignable depuis une halte de la couche d'avant). Une expédition entière a au moins une halte « archives » (ou « registres du bailliage »), et au plus deux embuscades.

### 4.4 Les portes (récompenses annoncées)

Chaque escarmouche, embuscade et trésor porte une récompense visible avant d'entrer :

| Porte | Part | Contenu |
|---|---|---|
| Faveur d'un conseiller | 55 % | Le médaillon du conseiller. À la fin de la halte, il pose une question de sa matière puis offre ses faveurs (7.4). |
| Bourse | 25 % | +20 or de route (+10 si éclatante). |
| Parchemin de renommée | 10 % | +10 renommée tout de suite (+10 si éclatante). |
| Vivres | 10 % | +1 vivre ; au maximum, se change en 15 or de route. |

Conseiller d'une porte de faveur : tiré parmi les six, pondéré par les familles qui ont des questions dans la semaine traversée (×1 si présente, ×0,3 sinon), par les familles à revoir (×1,5 : on rencontre plus souvent l'herboriste quand les SVT sont à revoir, ce qui amène plus de questions de SVT), jamais le même conseiller deux fois dans une couche ; un conseiller dont on tient déjà une faveur propose aussi de l'affiner (7.2). Une embuscade a toujours une porte de faveur, avec une chance de rare relevée (50 % au lieu de 25 %). L'interprète n'est tiré que si une séquence d'anglais est chargée (c'est le cas depuis le 16/10).

**Porte scellée** (extension, étape 2 ; l'équivalent des portes d'Érèbe de Hadès) : une escarmouche sur six porte une porte scellée. En entrant, le conseiller propose un pari : « Trois réponses justes, sans faute, et je double mon don. » Les trois justes : faveur rare garantie (ou porte doublée) ; sinon la récompense simple. Jamais une perte : c'est une récompense qui vient des notions réussies, comme le veut le cahier des charges.

## 5. Les questions dans l'expédition

### 5.1 Le tirage : deux questions de la semaine, une du royaume

Tout passe par `JEU.recit.suite`, le seul tirage du jeu, avec une option nouvelle :

```js
JEU.recit.suite(3, { exclure: ids, filtre: f, completer: true,
  quota: { nombre: 2, filtre: function (q) { return JEU.progression.semaineDe(q.cours) === 4; } } });
```

- `quota` : au plus `nombre` questions du lot sont cherchées d'abord parmi celles qui passent `quota.filtre` (et `filtre`), avec toutes les règles anti-répétition, puis sans le repos des fiches ; s'il en manque, la suite du lot vient du tirage ordinaire. Dans `suite()`, cela se traduit par deux essais de plus en tête de la liste `essais`, chacun plafonné à `quota.nombre` questions. Un seul `JEU.rappels.placer` et un seul `eviterTriples` à la fin, comme aujourd'hui : les Seconde chance gardent leur place et leur unicité.
- **Semaine d'un cours** (`JEU.progression.semaineDe(coursId)`, partagé avec le chantier « semaine visible dans les questions » ; repli dans expedition.js s'il n'existe pas encore) : la semaine de son entrée du planning ; `null` pour un cours de langue, une fiche méthode ou une séquence d'anglais (ils n'ont pas de semaine ; ils viennent par la troisième question, avec l'équilibre des familles).
- Part visée : 2 questions sur 3 de la semaine dans les batailles (3 par vague), 2 sur 3 dans les événements, les 3 des archives avant le relais (`quota.nombre: 3`, filtre « semaine < départ »). La question d'un conseiller (porte, bivouac, marchand) porte un quota sur **sa famille** (`JEU.recit.famille(q.matiere) === fam`), pas sur la semaine. Quand la semaine a peu de cours chargés, `completer` fait le reste sans bloquer : le tirage ne bloque jamais, c'est déjà sa règle.
- **Équilibre des familles** : il continue de se faire sur l'historique commun (`recit.historique`), d'une halte à l'autre. Dans le quota, les familles candidates sont celles qui ont des cours cette semaine-là (S1 : histoire, géographie, SVT, physique, français). Sur l'expédition entière, chaque famille présente doit rester entre 12 et 30 % (mesure : 17.4). « Jamais trois fois la même famille de suite » tient par `eviterTriples`.
- **À revoir** : inchangé (1,5× pour la matière et pour la famille), dans le quota comme hors quota. Les fiches de a-retravailler.js d'une semaine traversée ressortent donc davantage.
- **Anti-répétition** : inchangée (fenêtre de 60, repos des fiches). Une expédition de 50 questions puise dans 2 034 questions ; une semaine pleine en a 200 à 360 : le quota ne force aucune répétition.
- **Niveaux** : batailles de la route en `NIVEAUX_BATAILLE` (1 à 3) ; événements, portes, bivouac, marchand, trésor, archives en 1 et 2 ; les Seconde chance suivent ces niveaux comme aujourd'hui.

### 5.2 Les semaines minces

Avec le contenu du 24 octobre, S6 n'a qu'un cours chargé (4 fiches, 37 questions) et S5 ou S7 deux. Un quota de deux tiers sur 4 fiches ferait tourner les mêmes notions en boucle, et la règle du repos (10 questions) ou la fenêtre (60, ramenée à la moitié des questions disponibles) le relâcherait de toute façon. Règle, calculée à l'entrée de l'acte sur les fiches candidates de la semaine (cours chargés, au moins une question jouable) :

| Fiches candidates de la semaine | Quota | Filtre du quota | Ce que dit la page de semaine |
|---|---|---|---|
| 12 et plus | 2 sur 3 | la semaine | « Les cours de la semaine 6 t'attendent sur la route. » |
| 5 à 11 | 1 sur 3 | la semaine, puis la précédente (S−1 et S) | « La semaine 6 est courte sur les registres : la route repasse aussi par la semaine 5. » |
| moins de 5 | aucun | — (tirage ordinaire, étiquette de semaine quand même) | « Peu de cours déposés pour la semaine 6 : la route puise dans tout le royaume. » |

Les seuils vivent dans `config.expedition` (`quotaPlein: 12, quotaDemi: 5`), et `mesurer-tirage.js --expedition` les contrôle (17.4). Dès que le chantier des semaines 4 à 8 aura livré SVT, physique, littérature et lecture, toutes ces semaines passent au-dessus de 12.

### 5.3 Ce que les réponses rapportent

- En bataille : l'or du conseil de guerre, par le moteur (`M.repondre` : +12, +10 au 3e succès d'affilée, −6 par erreur sur l'or de la bataille, jamais sous zéro), modifié par les faveurs (7).
- Partout : 1 ressource du domaine par bonne réponse (règle générale), +1 renommée par bonne réponse (9.1), la Seconde chance et Leitner.
- Aux portes de faveur : la question du conseiller décide de l'offre (3 faveurs dont une rare possible, ou 2 communes).
- Le compte de l'expédition garde les bonnes réponses par famille et par semaine : il sert aux faveurs d'érudition (7.2), au bilan (« Tes meilleures matières sur cette route », « À relire ») et aux titres.

### 5.4 Ce qui ne change pas, et le récit

Panneau d'erreur à deux phrases, « Voir la fiche » (pendant le Grand Gardien, comme pour un boss du cahier des charges, le lien attend le bilan : option `sansFiche` de `panneauErreur`, les fiches ratées sont listées au bilan sous « À relire »), « Signaler une erreur », l'indice du mentor, les raccourcis 1 à 6, flèches, Entrée.

Trois endroits montrent la semaine, sans toucher à l'énoncé :

1. **Le cadre du récit** (`JEU.recit.cadre(q, contexte, camp, extra)`, avec `extra.semaine` et `extra.halte`) : nouvelles listes `PHRASES.route`, `PHRASES.embuscade`, `PHRASES.bivouac`, `PHRASES.marchand`, `PHRASES.archives`, `PHRASES.gardien`, `PHRASES.porte`, dont la moitié nomment la semaine (`{S}`). Exemples (jeu seulement, aucun fait de cours) :
   - « {N} marche à tes côtés sur la route de la semaine {S}. « Avant la prochaine halte, seigneur, dis-moi ceci. » »
   - « Le camp est dressé. {N} déplie ses notes de la semaine {S} à la lueur du feu : « Une question, et je te laisse dormir. » »
   - « Des cris dans le bois : on vous tombe dessus ! {N} te tire par la manche : « Réponds vite, seigneur, j'arme les chariots. » » (embuscade ; « vite » est une façon de parler : aucun chrono)
   - « {N} regarde la tour du gardien se découper sur la colline. « Il garde la semaine {S}. Montre-lui que tu la connais. » »
   - « Un vieux scribe ouvre ses registres. {N} lui répond : « Mon seigneur se souvient des semaines passées. Écoute. » » (archives)
   - « {N} ouvre son étal sur la place du bourg : « Une bonne réponse, et je fais un prix. » » (marchand)
   - « {N} te tend un médaillon : « Ma faveur se mérite. Une question de mon art, seigneur. » » (porte)
   - Seconde chance : les phrases `PHRASES.rappel` existantes, inchangées.
2. **L'étiquette de semaine sur la question** : à côté de la pastille de matière, « Semaine 4 » si le cours de la question est de la semaine traversée ; « Rappel · semaine 2 » si la question vient d'une semaine antérieure ; « Grammaire · Griffon de cuivre », « Fiche méthode », « Anglais · séquence 2 » pour les cours sans semaine. Si le chantier « semaine visible dans les questions » livre déjà cette pastille dans `JEU.ui.poserQuestion`, l'expédition s'en sert ; sinon elle passe par `cadre()` (`r.semaine`, rendu par `ui.recit` à côté de l'étiquette « Seconde chance »).
3. **La carte et les interstices** : bandeau « Semaine 4 · du 21 au 27 septembre 2026 » sur la couche en cours ; au passage d'une semaine à l'autre, une page d'enluminure « Semaine 5 » avec les titres des cours de la semaine (ceux du planning) et une phrase du chroniqueur : « Les cours de la semaine 5 t'attendent sur la route. Le gardien n'en laisse passer que ceux qui s'en souviennent. »

## 6. La difficulté monte avec la semaine

### 6.1 Le réglage du rival par semaine

Le moteur règle le seigneur rival par une ligne de la table `RIVAL` (niveaux 0 à 4 des provinces, réglés au simulateur le 16/10/2026). La route a besoin d'une échelle plus longue : la semaine.

**MVP (étape 1)** : la ligne d'une semaine est `min(4, floor((semaine − 1) / 2))` : S1-S2 ligne 0, S3-S4 ligne 1, S5-S6 ligne 2, S7-S8 ligne 3, S9 et au-delà ligne 4 ; le Grand Gardien prend la ligne + 1 (plafond 4). Aucun changement du moteur : ce sont les cinq lignes déjà réglées, et `simuler-bataille.js` les connaît.

**Étape 2** : une table fine par semaine, passée au moteur par `options.rivalRegle` (surcharge partielle de la ligne, fusionnée une fois dans `creer` et lue par `rival(p)`). Entre deux lignes, les valeurs continues (pv, coup, garde, assaut) sont interpolées à mi-chemin les semaines paires ; les valeurs entières (tours de départ, renfort, garnison) prennent la ligne du dessous ; **les tirs ne s'interpolent pas** : ils comptent par paliers de flèches (journal du 15/10/2026 : à partir de 1,534, un fantassin de l'arsenal 2 tombe en 6 flèches au lieu de 7) et prennent une valeur déjà mesurée : 0,3 ; 0,5 ; 0,7 ; 1,0 ; 1,16 ; 1,62.

| Semaine | Ligne | pv | tirs | coup | tours départ | garde | assaut (défenses) | Note |
|---|---|---|---|---|---|---|---|---|
| S1 | 0 | 0,40 | 0,30 | 0,35 | 1 | 1,00 | 5,2 | Le Tartare : on apprend la route |
| S2 | 0 → 1 | 0,60 | 0,50 | 0,38 | 1 | 1,05 | 4,0 | |
| S3 | 1 | 0,80 | 0,70 | 0,40 | 1 | 1,10 | 2,8 | Premier Grand Gardien |
| S4 | 1 → 2 | 0,80 | 0,70 | 0,40 | 1 | 1,15 | 2,7 | |
| S5 | 2 | 0,80 | 0,70 | 0,40 | 2 | 1,20 | 2,6 | |
| S6 | 2 → 3 | 0,85 | 0,70 | 0,40 | 2 | 1,25 | 3,0 | |
| S7 | 3 | 0,90 | 0,70 | 0,40 | 2 | 1,30 | 3,5 | |
| S8 | 3 → 4 | 1,05 | 1,00 | 0,70 | 2 | 1,15 | 3,4 | Frontière de demain |
| S9, S10 | 4 | 1,20 | 1,62 | 1,00 | 2 | 1,00 | 3,3 | La Forteresse de la campagne |
| S11 et au-delà | 4 + profondeur | ×(1 + 0,04 × (S − 10)), plafond ×1,6 | 1,62 | ×(1 + 0,03 × (S − 10)), plafond ×1,5 | 3 à partir de S20 | +0,05 par semaine, plafond 1,5 | 3,3 | Garnison +1 à S16 et S24 (plafond 4) |

Ces nombres sont des points de départ : la table se règle au simulateur comme `RIVAL` l'a été (80 graines, 4 justesses, un processus par semaine), et le journal note les écarts. `config.expedition.difficulte` (entier, 0 par défaut) s'ajoute à la ligne de toutes les batailles de route, borné à [0, 4] : Romain peut tout baisser ou tout monter d'un cran sans attendre une livraison.

### 6.2 Par type de halte, à partir de la ligne de la semaine

| Halte | Vagues | Mode | Modifications | Place adverse |
|---|---|---|---|---|
| Escarmouche | 1 | attaque | pas de champion (`options.champion: false`), garnison 1, tours de départ de la ligne | 6 |
| Embuscade | 2 | défense (troupes d'assaut, coups aux murs ×2) | un modificateur d'élite (6.3), champion à la 2e vague | 10 |
| Gardien | 2 | défense | garnison +1 | 12 (gardée entre deux tentatives) |
| Grand Gardien | 3 | défense | ligne + 1 (plafond 4), tours de départ +1, garnison +1, un champion à chaque vague à partir de la 2e | 16 (gardée) |

Tout le reste vient de `JEU.campagne.options(niveau)` : or de départ (60 + Trésor), château (20 + Peuple + remparts), dégâts des tours (Garde), or par réponse (Savoir), arsenal débloqué. La campagne aide donc la route, comme les souvenirs de Hadès, et la route n'abîme jamais la campagne. Deux exceptions, pour que la route ne consomme pas ce qui est à la campagne : `options.orDepart` est recalculé sans `c.bonus.or` (les mercenaires de l'événement du jour servent à la prochaine bataille de campagne, pas à toutes les batailles de route) et `espion` ne vient que du plan de route (11).

Pourquoi l'embuscade et les gardiens en défense : en attaque, le rival ne fait presque jamais céder tes murs (ses troupes ordinaires portent 1 ou 2 coups, ton château en a 20 et plus) ; les vivres n'auraient alors d'enjeu qu'aux gardiens. En défense, ses troupes ont « assaut » fois leurs points de vie et frappent les murs deux fois : c'est réglé, mesuré (tenue 73 à 83 % à 7 sur 10, 89 à 95 % à 8 sur 10, sur 3 vagues), et c'est exactement le frisson d'un élite ou d'un boss de biome. L'escarmouche reste en attaque : son enjeu est la victoire éclatante (abattre le camp de route), pas la survie.

### 6.3 Modificateurs d'élite (embuscades)

Un par embuscade, tiré à la graine, affiché sur la porte et rappelé par l'éclaireur au début de la bataille :

- **Garnison doublée** : 2 gardes au départ (`garnisonPlus: 1`).
- **Archers embusqués** : une tour d'archers adverse de plus au départ (`toursDepartPlus: 1`).
- **Cavalerie légère** : 2 cavaliers de renfort à chaque vague (`renfortPlus: ["cavaliers", "cavaliers"]`).
- **Brouillard sur tes lignes** : tes tours voient 25 % moins loin à la 1re vague (`brouillardJoueur`, symétrique du `brouillard` existant).
- **Pluie** : toutes les troupes plus lentes à la 1re vague (le modificateur `pluie` existe déjà).
- **Trésor de guerre** : le rival a 30 or de plus (`tresorPlus: 30`, il bâtit plus vite).

### 6.4 Les Serments (difficulté facultative, après le premier Grand Gardien)

Le Pacte du Châtiment. Chaque Serment vaut des points d'**ardeur** ; chaque point donne +10 % de renommée sur toute l'expédition (plafond 8 points, +80 %). Ils se choisissent à l'écran de départ, se gardent d'une fois sur l'autre, et ne touchent jamais aux questions (pas de chrono, pas de niveau forcé, pas de Seconde chance retirée) :

| Serment | Effet | Ardeur |
|---|---|---|
| De la garde | Garnison rivale +1 à chaque bataille | 1 |
| Du guetteur | Tours rivales : tirs au palier supérieur (0,3 → 0,5 → 0,7 → 1,0 → 1,16 → 1,62) | 1 |
| Des vivres | 2 vivres au départ au lieu de 3 (jamais moins de 1 ; l'Armorial s'ajoute ensuite) | 2 |
| Du marchand | Prix du marchand +25 % | 1 |
| De la hâte | Les portes ne montrent plus leur récompense | 1 |
| Du champion | Le champion adverse à chaque vague des gardiens | 2 |

**Prime d'ardeur** (les primes de chaleur de Hadès) : pour chaque relais, le jeu retient la plus forte ardeur avec laquelle l'expédition a été accomplie ; accomplir une expédition avec une ardeur plus haute que ce record rapporte +25 renommée par point au-dessus du record. Les titres de la Chronique (9.3) notent le record d'ardeur par relais. Les Serments s'ouvrent à la première victoire sur un Grand Gardien, quel que soit le relais.

## 7. Les faveurs des conseillers

### 7.1 Les six conseillers, un par famille

Les conseillers existent (`JEU.recit.CONSEILLERS`) : le chroniqueur (histoire), la cartographe (géographie), l'herboriste (SVT), le maître d'œuvre (physique-chimie), le ménestrel et le maître scribe (français : littérature, lecture suivie, grammaire ; ils offrent les mêmes faveurs ; le ménestrel tient la porte, le maître scribe pose la question quand elle est de grammaire), l'interprète (anglais ; ses portes n'apparaissent que si une séquence d'anglais est chargée). Chacun a trois faveurs et un thème : la mémoire, les routes, les remèdes, les engins, le moral, les alliances.

### 7.2 Les faveurs, en trois rangs

Rangs : **commune**, **rare**, **épique** (cadre de bronze, d'argent, d'or sur le médaillon). Chaque faveur se tient une fois ; la reprendre l'affine d'un rang.

| Conseiller | Faveur | Commune | Rare | Épique | Où s'applique (moteur) |
|---|---|---|---|---|---|
| Chroniqueur (histoire) | **Annales** | +2 or par bonne réponse | +3 | +5 | `repondre` (orParReponse) |
| | **Mémoire des anciens** | une Seconde chance réussie rapporte +4 or | +7 | +10 | `repondre`, question `rappel` |
| | **Chronique dorée** | renommée des haltes +10 % | +15 % | +25 % | compte de l'expédition (hors moteur) |
| Cartographe (géographie) | **Lignes de visée** | portée de tes tours +8 % | +12 % | +18 % | `porteeTour` |
| | **Chemins creux** | vitesse de tes troupes +10 % | +15 % | +25 % | `creerUnite` |
| | **Relevé des cols** | les portes de la couche suivante sont visibles | toute la semaine | toute l'expédition | carte (hors moteur) |
| Herboriste (SVT) | **Onguents** | points de vie de tes troupes +10 % | +15 % | +25 % | `creerUnite` |
| | **Murs chaulés** | château +3 | +5 | +8 | `creer` (pvChateau) |
| | **Simples** | +1 vivre tout de suite | +1 vivre maximum | +1 vivre à chaque gardien vaincu | expédition (hors moteur) |
| Maître d'œuvre (physique) | **Engrenages** | dégâts de tes tours +8 % | +12 % | +18 % | `degatsTour` (bonusDegats) |
| | **Charpente** | tours −3 or | −5 | −8 | `poserTour` |
| | **Contrepoids** | baliste et trébuchet : cadence +15 % | +25 % | +40 % | `etapeTours` |
| Ménestrel et maître scribe (français) | **Chant de marche** | revenu par vague +3 | +5 | +8 | `etape` (fin de vague) |
| | **Refrain** | coup d'éclat +15 au lieu de +10 | +20 | +25, et dès 2 succès d'affilée | `repondre` |
| | **Ballade consolante** | une erreur coûte 4 or au lieu de 6 | 2 | 0 | `repondre` (orPerduErreur) |
| Interprète (anglais) | **Lettres de crédit** | or de départ +15 | +25 | +40 | `creer` (orDepart) |
| | **Mercenaires** | un fantassin gratuit par vague | deux | un cavalier | `lancerVague` |
| | **Parlementaire** | garnison rivale −1 au départ (jamais sous 0) | et une tour adverse de départ en moins (jamais sous 1) | et son trésor −15 | `rivalDepart` |

**Plafonds** (pour que le simulateur joue le pire cas et que rien ne casse les paliers mesurés) : dégâts des tours au total (jauge Garde + faveurs) ≤ +60 % ; portée ≤ +25 % ; points de vie des troupes ≤ +40 % ; vitesse ≤ +30 % ; or par réponse ≤ 22 ; or de départ ≤ 180 ; perte par erreur ≥ 0 ; château ≤ 40 ; garnison et tours de départ jamais sous 0 et 1.

**Faveur d'érudition** (une par conseiller, épique seulement, proposée au marchand à partir de la 2e semaine de l'expédition, 90 or de route) : « +1 % de dégâts de tes tours (cartographe : de portée ; herboriste : de points de vie des troupes ; ménestrel : de revenu ; interprète : d'or de départ ; chroniqueur : d'or par réponse) par bonne réponse de ma matière pendant cette expédition, plafond 15 % ». Elle récompense directement les réponses dans une matière, et le bilan la commente (« L'érudition de l'herboriste t'a donné +11 % »).

### 7.3 Rareté : combien on en voit

- À une porte de faveur, question juste : 3 faveurs au choix, dont une rare une fois sur quatre (une fois sur deux après une embuscade) ; question fausse : 2 communes. Si un duo est ouvert (7.4), il prend la place de la rare.
- Une faveur tenue proposée de nouveau s'affine d'un rang (commune → rare → épique) : c'est le chemin ordinaire vers l'épique, comme la Grenade de Hadès.
- Le bivouac peut affiner une faveur au choix (rang +1). Le marchand vend une faveur commune (45), une rare (75), un affinage (35), une érudition (90, dès la 2e semaine), un duo (80, s'il est ouvert).
- Ordres de grandeur pour une expédition de 3 semaines à 7 sur 10 : 4 à 6 portes de faveur, 1 bivouac affiné, 1 ou 2 achats : 5 à 7 faveurs tenues au Grand Gardien, dont 1 ou 2 rares et 0 ou 1 épique. Le simulateur (17.2) mesure les faveurs les plus prises et leur effet sur la réussite.

### 7.4 Duos (synergies)

Tenir une faveur de deux conseillers ouvre, au marchand ou à une porte de l'un des deux, une faveur de duo (rang unique) :

| Duo | Faveur | Effet |
|---|---|---|
| Cartographe + Maître d'œuvre | **Tir plongeant** | tes tours frappent +20 % les troupes ralenties par une palissade |
| Herboriste + Ménestrel | **Veillée** | après chaque vague, ton château regagne 2 points (jamais au-dessus de son maximum) |
| Chroniqueur + Interprète | **Ambassade savante** | 3 bonnes réponses d'affilée : un fantassin gratuit de plus pour la vague |
| Chroniqueur + Ménestrel | **Geste héroïque** | 5 bonnes réponses d'affilée dans l'expédition : +30 or de route |
| Cartographe + Herboriste | **Herbier des routes** | tes troupes +10 % de vie et +10 % de vitesse |
| Maître d'œuvre + Interprète | **Sapeurs** | ta tour de siège frappe la place adverse +50 % |

Six duos suffisent ; ils encouragent à prendre des faveurs de matières différentes, donc à rencontrer des questions de matières différentes.

### 7.5 Comment on reçoit une faveur ; le marchand

À une porte de faveur, après la halte : le conseiller pose **une question de sa matière** (quota sur la famille, niveaux 1 et 2, règles anti-répétition habituelles, Seconde chance possible), dans son cadre de récit. Juste : trois faveurs au choix (deux des siennes et, une fois sur quatre, une rare, ou une faveur de duo si le duo est ouvert) ; fausse : explication, puis deux faveurs communes au choix. On choisit au clavier (1, 2, 3) ou à la souris ; chaque carte montre le conseiller, le rang, l'effet en une phrase et, si on tient déjà la faveur, « Affiner : commune → rare ». Jamais de porte vide, jamais de faveur imposée.

Le marchand : l'étal (tiré à la graine) propose 4 lignes parmi : une faveur commune (45 or de route), une faveur rare (75), affiner une faveur tenue (35), un sac de vivres (40), un **plan de bataille** (+25 or au début de la prochaine bataille de route, 15), **rafraîchir l'étal** (10, une fois) ; à partir de la 2e semaine, une faveur d'érudition (90) ou une faveur de duo (80). Les prix baissent de 20 % si la question d'ouverture est juste, de 10 à 20 % de plus avec l'Armorial (Forge de campagne), montent de 25 % avec le Serment du marchand. L'or de route d'une expédition complète est d'environ 220 : trois ou quatre achats.

## 8. Vivres, or de route, défaite et retour

- **Vivres** : 3 au départ (4 ou 5 avec l'Armorial ; 2 avec le Serment des vivres), maximum 5. −1 quand les murs cèdent dans une bataille de route (embuscade, gardien, Grand Gardien ; une escarmouche en théorie), ou quand on quitte une bataille après sa première vague (comme dans la campagne, quitter avant la première vague ne coûte rien : la halte reste à jouer). Jamais pour une question, jamais pour un événement. À 0 : **le retour au domaine**.
- **Or de route** : 0 au départ. Gagné : escarmouche tenue +10 (+10 éclatante), embuscade tenue +20 (+15 éclatante), gardien vaincu +25, porte bourse +20 (+10), coffre du trésor +25, bivouac +25 (choix), marchands de route +4 par bonne réponse, archives +2 par bonne réponse, Geste héroïque +30. Dépensé au marchand. Perdu à la fin de l'expédition (il n'a pas de sens au domaine), ce que la carte dit avant le Grand Gardien : « Dépense ton or de route avant le Grand Gardien, il ne te suivra pas au domaine. »
- **Faveurs** : rendues au retour.
- **Retour au domaine** (défaite) : un écran de bilan, le même que la victoire : renommée gagnée (jamais réduite), meilleures matières de la route, fiches à relire (liens vers le Codex), graine, « Repartir » ou « Retour à la campagne ». La chronique note : « L'expédition s'est arrêtée à la semaine 5, 2e halte. La compagnie rentre avec 83 points de renommée. » Rien d'autre ne change : provinces, ressources, jauges, arsenal, bâtiments, suivi des cours.
- **Abandonner** (depuis la carte de route, « Lever le camp », avec confirmation) : même bilan, même renommée.
- **Victoire** (Grand Gardien vaincu) : semaine franchie, relais suivant ouvert, +20 renommée, 3 coups à la prochaine place forte du front (comme le défi du champion), rivalité du front +6, missive du rival (situation `victoire` : il a été repoussé ; `franchie` en extension), 8 ressources de la matière la plus réussie de la route.

## 9. Renommée, Armorial, titres

### 9.1 Gagner de la renommée

| Source | Renommée |
|---|---|
| Bonne réponse (partout sur la route) | +1 |
| Halte réussie | 4 + numéro de la semaine |
| Halte où les murs ont cédé (l'effort compte) | 2 |
| Archives, registres du bailliage | ×2 sur la halte |
| Gardien de la semaine vaincu | 15 + 3 × semaine |
| Grand Gardien vaincu | 30 + 5 × semaine |
| Expédition complète | +20 |
| Serments | +10 % par point d'ardeur sur le total, et la prime d'ardeur (6.4) |
| Armorial, Bannière | +10 % puis +20 % |

Ordres de grandeur : expédition S1-S3 complète ≈ 190 (9 haltes ≈ 54, 2 gardiens ≈ 39, Grand Gardien ≈ 45, 35 bonnes réponses, +20) ; S7-S9 complète ≈ 310 ; expédition arrêtée à la 4e halte de S1 ≈ 40. Toujours plus que zéro, toujours gardée. Au bilan : « Renommée gagnée : 83 (tu en as 412, 190 à dépenser). »

### 9.2 L'Armorial (le Miroir)

Un écu dont on remplit les quartiers avec la renommée. Rien ne se perd ; un achat est définitif ; on peut toujours jouer sans rien acheter.

| Quartier | Effet | Rangs et prix (renommée) | Dans Hadès |
|---|---|---|---|
| Vivres de route | +1 vivre au départ et au maximum | 40, puis 110 (5 vivres) | Vie supplémentaire |
| Bourse du voyageur | +10 or de départ par bataille de route | 25, 50, 90 | Portefeuille |
| Sauf-conduit | les portes de toute la semaine sont visibles dès l'arrivée | 30 | Autorité du destin |
| Mémoire des anciens | une Seconde chance réussie rapporte +4 or, partout sur la route | 35 | (propre au jeu) |
| Murs chaulés | château +2 dans les batailles de route | 35, 75 | Peau dure |
| Forge de campagne | prix du marchand −10 % | 30, 60 | Réductions de Charon |
| Faveur d'ouverture | une faveur commune au choix parmi trois au départ de chaque expédition | 80 | Souvenir |
| Seconde monture | une fois par expédition, une bataille perdue ne coûte pas de vivre | 120 | Défiance de la mort |
| Bannière | renommée +10 % | 60, 140 | Ténèbres ardentes |

Total : 980 points, soit cinq à six expéditions complètes ; le premier quartier (Bourse, 25) s'achète dès la première expédition, même perdue. Les relais ne s'achètent pas : ils s'ouvrent en franchissant les semaines. Ordre conseillé, affiché sans obligation : Bourse, Vivres, Faveur d'ouverture.

### 9.3 Titres et Chronique des expéditions

Une page du Codex, « Chronique des expéditions », à côté de la Galerie des souverains : les vingt dernières expéditions (date, relais, front, semaine et halte atteintes, renommée, graine, ardeur), le record par relais (renommée, ardeur), et des titres gagnés une fois pour toutes (« Premier pas », « Gardien de la semaine 3 », « Sans faute au bivouac », « Les six conseillers » (une faveur de chacun dans la même expédition), « Trois duos », « Ardeur 4 », « Archiviste » (dix haltes d'archives), « Érudit de l'herboriste »…). Les titres sont des mots de jeu, sans fait de cours. Rang affiché avec la renommée totale, pour la parure : Écuyer (0), Banneret (150), Capitaine (400), Connétable (800), Maréchal (1 500).

## 10. Entre deux expéditions : le récit

C'est ce qui fait la saveur de Hadès : chaque retour à la Maison a ses dialogues. Ici, la Maison est la carte de campagne, et les personnages existent déjà.

### 10.1 Le départ

Une carte de la grille de la campagne, « Partir en expédition » (ou « Reprendre l'expédition · semaine 5, 2e halte »), avec sa touche. L'écran de départ : le parchemin de l'année (34 cases en rang, scellées pour les semaines franchies, frontière marquée, brume au-delà, bannière « Cette semaine »), le choix du relais (flèches ← →, défaut : le relais ouvert le plus élevé), le front (vers l'ouest contre le royaume d'Angleterre, vers le sud contre l'Empire omeyyade : terrains de la variante sèche, couleurs du camp, rival du Grand Gardien), les Serments s'ils sont ouverts, l'Armorial, les vivres et l'or de départ qu'on aura, la durée estimée (« environ 35 minutes, reprise possible à chaque halte »). Une phrase du souverain servi rappelle l'ordre : « {souverain} te confie la route des semaines 4 à 6. Reviens couvert de renommée. » (phrase du jeu dans expedition.js, avec le nom du souverain de `JEU.campagne.souverain()` ; sans souverain disponible, « Le royaume te confie… »). Étape 3 : une situation `mission` du souverain dans personnages.js, avec ses répliques propres.

### 10.2 Les rivaux pendant l'expédition

- Les Gardiens de semaine sont « un seigneur rival » du camp du front (`rivalGenerique`, médaillon au tortil) : pas de missive, mais le mot du rival en bataille (`phraseRival`, p.ia.journal) sous ce nom, comme aujourd'hui.
- Avant le Grand Gardien : le défi du rival du front (situation `defi`, par `C.missiveAvantBataille` avec l'identifiant de la prochaine province du front : une bataille sur deux, « Relever le défi »). Étape 3 : situation `grandGardien` (« Tu as traversé mes terres jusqu'ici ; voyons si tu sais rentrer »), six répliques par camp.
- Après une victoire : réaction `victoire` (il a été repoussé) et rivalité +6 ; étape 3 : situation `franchie`. Après un retour au domaine (défaite ou abandon) : rien de perdu, rien de gagné en rivalité ; étape 3 : situation `rentree` (« Déjà de retour ? Ma route est longue, seigneur. »), montrée une fois sur deux. Gardien de semaine vaincu : rivalité +2, pas de lettre.
- Toutes les répliques nouvelles suivent le format de personnages.js (28 mots, ni chiffre, ni fait historique, ni religion, ni insulte, 6 par camp et par situation, 2 par niveau de rivalité, contrôle 10 du validateur) et sont écrites pour le camp : un « seigneur rival » de remplacement peut les dire.

### 10.3 Le souverain, la chronique, la cour

- Le souverain change toujours avec les provinces prises ; l'expédition y contribue par ses 3 coups à la prochaine place forte à chaque Grand Gardien vaincu, et sa page de départ change de nom avec lui.
- La chronique de la campagne note le départ, chaque semaine franchie, le retour, un record (« Nouveau record sur le relais 4 : 274 points de renommée »), dans ses vingt faits.
- Le cartouche « Les fronts et tes rivaux » gagne une ligne : « Expéditions : 3 accomplies, relais ouverts jusqu'à la semaine 7, renommée 412. »

### 10.4 Extension : les gages des conseillers (les souvenirs de Hadès)

Quand une famille de matières a reçu 60 bonnes réponses sur la route (toutes expéditions confondues), son conseiller offre un **gage** : un petit objet qu'on peut emporter au départ (un seul à la fois) : la première porte de faveur de l'expédition est la sienne, ou sa faveur d'ouverture est rare. Six gages, affichés dans l'Armorial. Ils poussent à soigner chaque matière, et ils donnent un rendez-vous à long terme. Après le MVP, après les Serments.

## 11. Lien avec la campagne existante

- **Indépendance** : une expédition ne prend ni ne rend de province ; elle n'écrit rien dans `campagne.provinces` sauf les 3 coups de la victoire ; elle ne touche ni menace, ni attaque du domaine, ni événement du jour. Une attaque du domaine en cours n'empêche pas de partir ; elle attend. Une expédition en cours n'empêche pas de jouer la campagne : les deux restent dans la grille.
- **Ce que la campagne apporte à la route** : arsenal, jauges, remparts, par `JEU.campagne.options(niveau)`. Le conseil du royaume et l'arsenal restent la progression « lente » ; l'Armorial est la progression « roguelite ». Les deux poussent dans le même sens.
- **Piège à éviter** : `C.options` ajoute `c.bonus.or` (mercenaires de l'événement du jour) à l'or de départ et lit `c.bonus.espion`, et c'est `C.apresBataille` qui vide `c.bonus` ; la route n'appelle pas `apresBataille`. `JEU.expedition.optionsBataille` repart donc de `C.options(niveau)` puis recalcule `orDepart` sans `c.bonus.or` et met `espion` à vrai seulement si le plan de route le dit. Les bonus de campagne restent intacts pour la prochaine bataille de campagne (test 17.1).
- **Événements du jour** rejoués sur la route (4.2) : par `JEU.campagne.jouerEvenement(ev, contexte)`, où `contexte.gains` remplace les gains de campagne et `contexte.suite` rend la main à la route ; l'événement du jour de la campagne reste à jouer à part.
- **Rivalité** : Grand Gardien vaincu +6, gardien vaincu +2, retour 0 (`GAINS_RIVALITE.gardien`, `.grandGardien`).
- **Statistiques** : chaque halte compte une partie (`stats.parties`), les réponses entrent dans `stats`, `notions`, `posees`, `rappels` comme partout.
- **Réglage « Messages des rivaux »** coupé : pas de missive de défi ni de réaction, comme en campagne ; les pages de semaine et le bilan, qui ne sont pas des lettres, restent.

## 12. Durée, questions, pause et reprise

Compte pour une expédition de 3 semaines (9 haltes, 2 gardiens, 1 Grand Gardien), avec le mélange de haltes de la table 4.3 :

| Poste | Questions | Durée à ×1 | Durée à ×2 |
|---|---|---|---|
| 9 haltes (en moyenne : 3,5 batailles, 2 événements, 1 marchand, 1,5 bivouac, 1 trésor ou archives) | ≈ 24 | ≈ 20 min | ≈ 16 min |
| Portes de faveur et questions de conseiller | ≈ 5 | ≈ 2 min | ≈ 2 min |
| 2 gardiens (6 questions, 2 vagues chacun) | 12 | ≈ 10 min | ≈ 8 min |
| Grand Gardien (9 questions, 3 vagues) | 9 | ≈ 7 min | ≈ 5 min |
| Pages de semaine, choix de haltes, bilan | — | ≈ 2 min | ≈ 2 min |
| **Total** | **≈ 50** | **≈ 40 min** | **≈ 33 min** |

Une expédition de deux semaines (`config.expedition.semaines: 2`, ou le choix « expédition courte » à l'écran de départ en étape 2) : ≈ 34 questions, 25 à 28 minutes. Une seule séance type de l'élève fait 15 à 20 minutes : l'expédition est faite pour être **jouée en deux fois**. D'où :

- **Pause** : Échap sur la carte de route revient à la campagne, l'expédition reste en cours (« Reprendre l'expédition »). La sauvegarde est écrite après chaque halte, chaque porte, chaque achat, chaque gardien, chaque page de semaine.
- **Fermer le jeu pendant une bataille de route** : la bataille n'est pas sauvegardée (pas plus qu'en campagne). À la réouverture, la halte est à rejouer : sans perte de vivre si sa première vague n'avait pas été lancée ; sinon −1 vivre, comme un abandon de bataille (l'expédition note `entamee = id` à `lancerVague` et l'efface au bilan). À confirmer (section 18) : c'est le plus simple, et cela empêche d'« annuler » une vague qui tourne mal en fermant la fenêtre.
- **Import d'une sauvegarde** : l'expédition en cours revient telle quelle.
- La durée estimée s'affiche à l'écran de départ, calculée par la même formule que le simulateur (questions × 18 s + vagues × 50 s / vitesse + 2 min).

## 13. Sauvegarde : schéma 6 et réglages

Migration 5 → 6 (6 est le premier numéro libre au 24/10/2026 : vérifier `SCHEMA` dans sauvegarde.js le jour de la livraison et prendre le suivant s'il a bougé) : ajoute `expedition`, vide, complété par `JEU.expedition.completer` (même méthode que `JEU.campagne.completer` : une valeur absente, nulle ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas). Rien n'est retiré. Une sauvegarde du schéma 6 lue par un jeu plus ancien est refusée, comme aujourd'hui.

```js
expedition: {
  renom: 0, renomTotal: 0,                       // disponible ; gagné depuis le début (jamais réduit)
  armorial: { vivres: 0, bourse: 0, saufConduit: 0, memoire: 0, murs: 0, forge: 0, ouverture: 0, monture: 0, banniere: 0 },
  franchies: [],                                 // semaines dont le Grand Gardien a été vaincu ; relais = {1} ∪ { w + 1 } ∪ { frontière − 2 }
  sermentsOuverts: false,                        // vrai après le premier Grand Gardien vaincu
  serments: { garde: false, guetteur: false, vivres: false, marchand: false, hate: false, champion: false },
  titres: [],                                    // identifiants de titres gagnés
  records: { "1": { semaine: 3, halte: 4, renom: 190, ardeur: 0 } },   // par relais
  reponsesParFamille: { svt: 12 },               // pour les gages (extension)
  historique: [{ le: "2026-10-24", graine: 1329438721, front: "angleterre", depart: 1, atteint: { semaine: 2, halte: 3 },
                 issue: "victoire" | "retour" | "abandon", renom: 190, ardeur: 0 }],   // vingt au plus, le plus récent d'abord
  enCours: null | {
    graine: 1329438721, front: "angleterre", depart: 4, semaines: [4, 5, 6], ardeur: 0, difficulte: 0,
    route: [{ semaine: 4, carte: "col", quota: 2,
              couches: [[{ id: "s4c1h1", type: "escarmouche", porte: { genre: "faveur", conseiller: "svt" }, suivants: ["s4c2h1", "s4c2h2"] }], [], []],
              gardien: { id: "s4g", type: "gardien", place: 12 } }],
    position: null | "s4c1h1",                   // halte en cours ou dernière jouée ; null : au départ de la semaine courante
    semaine: 4,                                  // semaine en cours
    faits: { "s4c1h1": "reussi" | "echoue" | "eclatante" | "fait" },
    entamee: null | "s4g",                       // bataille de route dont la 1re vague a été lancée et qui n'a pas de bilan
    vivres: 3, vivresMax: 3, or: 0, plan: 0, espion: false, monture: true,
    faveurs: [{ id: "annales", rang: 1 }],       // rang 1 commune, 2 rare, 3 épique ; duos et éruditions : rang 1
    places: { "s4g": 9 },                        // solidité restante d'un gardien déjà attaqué
    etal: { "s4c2h2": { lignes: [...], rafraichi: false } },
    compte: { questions: 0, bonnes: 0, serie: 0, meilleureSerie: 0, parFamille: {}, parSemaine: {}, renom: 0, renomHaltes: 0, fiches: [] }
  }
}
```

- Quand on enregistre : après chaque halte, chaque choix de faveur, chaque achat, chaque gardien ; la bataille en cours n'est pas sauvegardée au milieu (pas plus qu'aujourd'hui).
- Reprise : « Reprendre l'expédition » ouvre la carte à la position enregistrée. Taille : moins de 3 Ko par expédition en cours, 2 Ko d'historique.
- docs/FORMAT_DONNEES.md : section « Sauvegarde », schéma 6, et le bloc `expedition` de config.js. atelier/outils/tests.js : migration 1 → 6 sans perte, `completer` sur une expédition abîmée.
- Réglages dans `jeu/data/config.js` (lus par `JEU.expedition`, valeurs par défaut si absents, pour que Romain les touche sans code) :

```js
  expedition: { semaines: 3, couches: 3, vivres: 3, questionsSemaine: 2, quotaPlein: 12, quotaDemi: 5, difficulte: 0 }
```

## 14. Interface et direction artistique

### 14.1 La carte-itinéraire

- Un nouvel écran de partie, « La route » (`JEU.ui.ecrans.expedition`, module `jeu/js/ecran-expedition.js`, section `#ecran-expedition` dans index.html ; le menu ne change pas : on y entre par la campagne, on en sort par Échap ou « Retour à la campagne »).
- **Parchemin horizontal** (SVG, 1000 × 300 logiques, dans le même cadre que la carte de campagne : il tient entier en 1366 × 768 avec les cartouches du bas, contrôle perf.js comme pour la carte). Une semaine = une bande de 300 px : une **lettrine rubriquée** (« S4 » en Cinzel #8c2f39, filets d'or), le libellé des dates dessous (14 px au moins), trois colonnes de vignettes, puis le gardien dans un médaillon héraldique (`JEU.ecranCampagne.medaillonHeraldique(camp, true)` au tortil pour un gardien de semaine ; `medaillon(rivalDe(front), 60)` pour le Grand Gardien : portrait s'il en a un, sinon la silhouette couronnée sur les armes du camp). Les 100 premiers pixels : le départ (un petit bourg de France, `lieu-france`, bannière au lys).
- **Vignettes de haltes** : médaillons de 56 px à l'encre et à l'or (le cerclage des médaillons de repli de la carte de campagne), icône Game-icons du type, la porte en petit écusson en bas à droite (médaillon du conseiller 22 px, bourse, parchemin, sac), le modificateur d'élite en petit mot sous l'embuscade. États : à venir (encre), atteignable (halo d'or, comme la province « cible » de la campagne), jouée (sceau de cire : `sceau("joueur")` réduit, vert-de-gris pour réussie, plomb #4a4e57 pour échouée, comme le sceau de l'or perdu), hors chemin (estompée à 35 %). Chemins en pointillés d'encre comme `route()` de la carte de campagne ; le chemin parcouru en trait plein doré.
- **Brume** : les nappes `lieu-brume` existantes (sprites.js), posées sur les couches des semaines suivantes et sur tout ce qui dépasse la frontière, avec le voile désaturé de `voileBrume` ; la bannière « Cette semaine » (calendrier) plantée sur la semaine du jour, à l'intérieur ou au bord de la brume.
- **Sous la carte**, deux cartouches dans le style de « Ton royaume » : **Ta compagnie** (vivres en sacs, or de route, faveurs en médaillons cerclés de bronze, d'argent ou d'or avec leur effet au survol et dans une liste au clavier, renommée de l'expédition, ardeur, graine) ; **Journal de route** (les dix derniers faits de l'expédition). Boutons : « Entrer dans la halte (Entrée) », « Faveurs (F) », « Lever le camp ».
- **Fenêtres** (famille des missives : sceau de cire, médaillon, mêmes raccourcis) : l'écran de départ, la page de semaine (« Semaine 5 », titres des cours, phrase du chroniqueur, bouton « En route (Entrée) »), la porte de faveur (question puis cartes de faveurs), le bivouac, le marchand, les Serments, l'Armorial (un écu à neuf quartiers qui se colorent), le bilan. Pas d'animation de plus de 400 ms ; aucun clignotement ; coupées avec « Animations ».
- **Palette et polices** : celles du jeu (fond #efe6d2, encre #2e2419, or #b08d3a, rubrique #8c2f39, une teinte par matière sur les médaillons des conseillers), Cinzel pour les titres, Crimson Text pour les textes. Rien de nouveau dans jeu/assets pour le MVP ; en extension, un fond de parchemin de route rendu par les scripts Blender de l'atelier (rendu-3d), avec repli vectoriel si l'image manque, comme la carte de campagne ; deux sons courts (sac de vivres, sceau de halte) par generer-sons.js.
- **Références** : la Table de Peutinger et l'itinéraire de Londres à Jérusalem de Matthew Paris (XIIIe siècle, domaine public) pour la route horizontale à stations ; les cartes de campagne de Medieval Total War pour les silhouettes de camps ; les enluminures pour les lettrines ; l'écran des bienfaits de Hadès pour la carte de faveur (médaillon, rang, une phrase).

### 14.2 Clavier et accessibilité

- Sur la carte : 1, 2, 3 choisissent une halte atteignable (numéros affichés sur les médaillons, comme les touches de la grille de la campagne) ; ← → et ↑ ↓ aussi ; Entrée entre ; F ouvre la liste des faveurs ; Échap revient à la campagne (expédition enregistrée). Les haltes atteignables ont `tabindex="0"` et un `aria-label` complet : « Semaine 4, 2e halte : embuscade, garnison doublée, récompense : faveur de l'herboriste ».
- Choix de faveur, bivouac, marchand, Serments, Armorial : touches 1 à 4, Entrée pour valider, Échap pour fermer ce qui peut l'être (jamais une porte : on choisit toujours).
- Rien ne repose sur la couleur seule (sceau + mot « réussie » / « murs cédés » dans le journal de route et l'infobulle) ; textes de 14 px au moins sur la carte, questions à 18 px comme partout ; focus visible ; pas de clignotement.

### 14.3 Performance

- Génération : une fois, au départ (quelques centaines d'opérations). La carte : un SVG d'une trentaine de nœuds et d'une quarantaine de chemins, redessiné à chaque retour sur l'écran (quelques ms).
- Faveurs, Serments, Armorial : résolus en un objet `faveurs` et en options avant `M.creer` ; dans le moteur, quelques multiplications déjà sur le chemin chaud (comme `bonusDegats`). Rien dans la boucle de rendu.
- Entre une réponse et la question suivante : rien de nouveau. Le lot d'une vague est tiré au début de la vague, comme aujourd'hui ; le quota de semaine ajoute un appel à `tirage()` (mesuré par `mesurer-tirage.js`, cible : médiane sous 3 ms hors bac à sable, 10 ms au plus).
- perf.js : les mêmes mesures (JEU.mesure et Event Timing) pendant une escarmouche et un gardien de route.

## 15. Ce qu'il faut changer dans le code

Lecture seule pour ce document ; voici les accroches précises, relues sur le code du 24 octobre, pour les agents qui coderont. Toutes sont des ajouts facultatifs : sans contexte d'expédition, le code existant fait exactement ce qu'il fait aujourd'hui.

| Fichier | Changement |
|---|---|
| `jeu/js/expedition.js` (nouveau, sans DOM, testé sous Node) | Constantes (`EXP`), `alea(graine)`, `semaineDe` (repli), `frontiere()`, `relais()`, `generer(graine, depart, semaines, front)`, `commencer`, `haltesAtteignables`, `entrer(id)`, `quotaDe(semaine)`, `tirage(n, posees, halte)` (ajoute le quota et les niveaux), `optionsBataille(halte)` (ligne de la semaine, mode, faveurs, Serments, Armorial, modificateur d'élite, sans les bonus de campagne), `apresBataille(halte, bilan)`, `offrirFaveurs(conseiller, juste)`, `prendreFaveur`, `acheter`, `bivouac`, `renom(...)`, `finir(issue)`, `armorial`, `serments`, `completer`, `etatVide`, `etat()`. `JEU.expedition`. |
| `jeu/js/ecran-expedition.js` (nouveau) | La carte-itinéraire, l'écran de départ, les fenêtres (faveurs, marchand, bivouac, Serments, page de semaine), le bilan, l'Armorial, la Chronique. |
| `jeu/js/bataille-moteur.js` | Options nouvelles, toutes facultatives et sans effet si absentes : `options.champion` (false : `composerVague` n'ajoute pas le champion) ; `options.rivalRegle` (surcharge partielle de la ligne, fusionnée une fois dans `creer` en `p.regleRival`, lue par `rival(p)`) ; `options.garnisonPlus`, `toursDepartPlus`, `tresorPlus`, `renfortPlus` (lus par `rivalDepart` et `composerVague`) ; `options.modificateurs` initiaux (`pluie`, `brouillardJoueur`, lu par `porteeTour` pour tes tours) ; `options.faveurs` ({ degats, portee, pvTroupes, vitesseTroupes, prixTours, cadenceEngins, revenu, serieBonus, serieSeuil, orSecondeChance, mercenaires, chateauPv, regen, tirPlongeant, sapeurs }), lues dans `creer`, `degatsTour`, `porteeTour`, `creerUnite`, `poserTour`, `etapeTours`, `lancerVague`, `etape` (fin de vague) et `repondre(p, juste, rappel)` (le troisième paramètre pour « Mémoire des anciens »). Le moteur reste sans hasard, son journal du rival inchangé ; sans ces options, mêmes résultats graine pour graine (`simuler-bataille.js --comparer`). |
| `jeu/js/bataille.js` | `lancer(lieu, contexte)` : avec un `contexte` d'expédition ({ carte, options, titre, front, campAdverse, rival (personnage ou générique), tirage(n, posees), surFin(bilan), surQuitter(entamee), sansFiche, eclaireur (phrase du modificateur) }), la bataille ne touche pas la campagne (`C.apresBataille` n'est pas appelé : `bilan()` et `surQuitter` rendent le bilan à `contexte`) ; `tirerQuestions` délègue à `contexte.tirage` ; le cadre du récit reçoit `extra` (semaine, halte) ; `motDuRival` prend `contexte.rival` ; la carte « Un éclaireur » affiche le modificateur d'élite avant la première question de la 1re vague, jamais entre deux. |
| `jeu/js/recit.js` | `suite(nombre, options)` : option `quota` (5.1). `cadre(q, contexte, camp, extra)` : contextes `route`, `embuscade`, `bivouac`, `marchand`, `archives`, `gardien`, `porte`, et `r.semaine`. |
| `jeu/js/interface.js` | `ui.recit` affiche `r.semaine` ; `panneauErreur(q, zone, suite, options)` avec `options.sansFiche` ; `poserQuestion` ne change pas (sauf si le chantier « semaine visible » y met déjà la pastille). |
| `jeu/js/campagne.js` | `jouerEvenement(ev, contexte)` ; export de `reagir` ; `GAINS_RIVALITE.gardien` et `.grandGardien` ; rien d'autre. |
| `jeu/js/ecran-campagne.js` | La carte « Partir en expédition / Reprendre » dans la grille (après « Conseil du royaume »), avec sa touche ; la ligne « Expéditions » du cartouche des rivaux. |
| `jeu/js/sauvegarde.js` | `SCHEMA = 6`, migration 5 → 6, `nouvelle()` avec `expedition`. |
| `jeu/js/codex.js` | Pages « Chronique des expéditions » et « Armorial » (ou l'Armorial depuis l'écran de départ seulement, au choix du codeur). |
| `jeu/js/progression.js` | `semaineDe(coursId)` (partagé avec le chantier « semaine visible »). |
| `jeu/index.html` | La section `#ecran-expedition`, les deux scripts nouveaux (après ecran-campagne.js), `JEU.version`. |
| `jeu/css/jeu.css` | Styles de la carte-itinéraire, des cartes de faveurs, de l'Armorial, des pages de semaine. |
| `jeu/data/config.js` | Bloc `expedition` facultatif (13). |
| `jeu/data/personnages.js` (étape 3) | Situations `mission` (souverain), `grandGardien`, `franchie`, `rentree` (rivaux), au format existant, contrôle 10. |
| `atelier/outils/tests.js`, `simuler-bataille.js`, nouveau `simuler-expedition.js`, `mesurer-tirage.js`, `perf.js` | Section 17. |
| `docs/CAHIER_DES_CHARGES.md`, `docs/FORMAT_DONNEES.md`, `docs/JOURNAL.md`, `jeu/VERSION.txt` | Section 5 du cahier (« La route des semaines »), schéma 6 et config, décisions, version. |

Coordination avec les chantiers en cours : « cours des semaines 4 à 8 et semaine visible dans les questions » fournit `semaineDe`, la pastille et la frontière à S8 ; « personnages et missives » fournit plus tard les situations nouvelles ; l'anglais est déjà là. L'expédition n'écrit rien dans jeu/data : les données de cours restent au /traiter. Livrer après ces chantiers, puis comparer les batailles de campagne graine pour graine avant et après (`simuler-bataille.js --comparer`).

## 16. Plan de construction

### Étape 1 : le squelette jouable (MVP), version 0.9.0

1. `expedition.js` : tirage à graine, frontière, relais, génération de route (3 couches, garanties, portes), état, vivres, or de route, renommée, quota de semaine et règle des semaines minces, `completer` ; schéma 6 ; tests Node (route, migration, frontière, relais, quota).
2. Moteur : `champion`, `faveurs` pour les six faveurs les plus simples (Annales, Lignes de visée, Onguents, Engrenages, Chant de marche, Lettres de crédit) ; tests du moteur (une bataille à faveurs donne les bons chiffres ; sans faveurs, strictement le même résultat qu'avant, graine pour graine : `simuler-bataille.js --comparer`).
3. `bataille.js` : contexte d'expédition ; escarmouche (attaque, 1 vague), embuscade (défense, 2 vagues, sans modificateur d'élite au début, niveau + 1 à la place), gardien et Grand Gardien jouables, ligne du rival = (semaine − 1) div 2.
4. `recit.js` : quota de semaine, cadres de route, étiquette de semaine ; `mesurer-tirage.js --expedition`.
5. `ecran-expedition.js` : carte-itinéraire, portes, fenêtre de faveurs (une question puis le choix), bivouac, marchand minimal (faveur, vivre, plan), page de semaine, bilan, reprise ; carte dans la grille de la campagne ; Armorial à trois quartiers (Vivres, Bourse, Bannière) ; événements du jour rejoués sur la route.
6. Journal, cahier des charges, format, version, `perf.js` (parcours complet), cinq vérifications pour Romain.

Livrable : une expédition S1-S3 (et S6-S8 dès que la frontière y sera) complète, sauvegardée, reprise, avec défaite et victoire, renommée et trois quartiers d'Armorial. Volume : environ 1 300 lignes de JavaScript, 300 de CSS, 60 tests. Trois à quatre jours.

### Étape 2 : la profondeur, version 0.10.0

Les 18 faveurs et les trois rangs, l'affinage, les duos, les éruditions, les modificateurs d'élite (`rivalRegle`, `garnisonPlus`, `toursDepartPlus`, `tresorPlus`, `renfortPlus`, `brouillardJoueur`), la table fine par semaine, l'étal complet, les quatre événements de route, trésor et archives, la porte scellée, l'Armorial complet, la Chronique des expéditions et les titres, le choix « expédition courte », `simuler-expedition.js` et le réglage de la table par semaine. Trois à quatre jours.

### Étape 3 : le récit et la finition, version 0.10.x

Les Serments et la prime d'ardeur, les situations nouvelles de personnages.js (`mission`, `grandGardien`, `franchie`, `rentree`), la phrase du souverain, le fond de parchemin rendu en 3D, deux sons, la page de semaine illustrée, le marqueur « Cette semaine ». Deux jours.

### Plus tard

Les gages des conseillers (10.4) ; des haltes nouvelles quand les mini-jeux arriveront (Plan de bataille, Pont de liens, Observatoire comme haltes de route) ; un défi hebdomadaire à graine commune (la même route pour la semaine, record à battre, affiché à l'accueil).

## 17. Tests et mesures

### 17.1 tests.js (logique, Node ; `expedition` ajouté à la liste des modules chargés)

- Route : pour 200 graines, 3 couches par semaine, 2 ou 3 haltes par couche, toute halte atteignable depuis le départ et reliée au gardien, aucun croisement, garanties de 4.3 (dont un chemin sans embuscade), mêmes résultats pour la même graine, résultats différents pour deux graines, jamais plus de vingt régénérations.
- Frontière et relais : avec les cours chargés d'aujourd'hui, frontière = 3 ; relais = [1] ; après `franchies = [3]`, relais = [1, 4] ; frontière 8 et rien de franchi : relais = [1, 6] ; une expédition partant de 3 avec la frontière à 3 fait une semaine ; sans aucun cours, pas d'expédition.
- Semaine d'un cours : `histoire-s03-1` → 3 ; `langue-conj10`, `methode-frise`, `anglais-seq01` → null. Quota : une semaine de 44 fiches → 2 ; de 8 → 1 et filtre élargi ; de 4 → 0.
- Vivres : jamais sous zéro ; une question ratée n'en retire jamais ; un retour à zéro vivre finit l'expédition avec la renommée acquise ; Seconde monture consommée une fois ; `entamee` fait perdre un vivre à la reprise, pas sans première vague.
- Renommée : ne baisse jamais, même après un retour ; un achat d'Armorial retire du disponible, pas du total ; Bannière, ardeur et prime d'ardeur s'appliquent au bon total ; le record par relais ne descend jamais.
- Campagne intacte : avant et après une expédition simulée (victoire, puis défaite), `campagne.provinces` (sauf les 3 coups de la victoire), `conquises`, `rival`, `arsenal`, `royaume`, `bonus` et les ressources sont inchangés ; `c.bonus.or` reste pour la prochaine bataille de campagne.
- Sauvegarde : migration 1 → 6 sans perte ; `completer` répare une expédition en cours abîmée (position inconnue → départ de la semaine courante, faveur inconnue retirée, vivres non numériques → 3, route illisible → expédition close avec sa renommée) ; import d'une sauvegarde avec expédition en cours.
- Moteur : avec `options.faveurs` vide et sans options nouvelles, une bataille graine pour graine donne le même `stats` qu'avant ; chaque faveur change le bon paramètre et respecte son plafond ; `champion: false` → aucun champion ; `rivalRegle` surcharge sans toucher `RIVAL` ; `garnisonPlus` et `toursDepartPlus` se lisent dans `p.garnison` et `p.toursRivales`.
- Tirage : `suite(3, { quota })` donne 2 questions de la semaine 1 et 1 autre quand c'est possible, 3 d'une autre semaine quand la semaine n'a pas de cours ; les Seconde chance sont placées une seule fois ; les 60 dernières questions ne ressortent pas ; un quota sur la famille « svt » donne une question de SVT.
- Récit : chaque phrase de route a `{N}` ; celles qui ont `{S}` reçoivent la semaine ; aucun texte de faveur, de halte, d'événement de route, de Serment, de titre ne contient un chiffre de cours, un mot de religion ou une insulte (même liste que le contrôle 10 du validateur), ni le nom d'un personnage.

### 17.2 simuler-expedition.js (nouveau, atelier)

Il réutilise le joueur scripté et le chargement de `simuler-bataille.js` (mêmes modules, `Math.random` à graine), y ajoute `expedition.js`, et joue des expéditions entières : route à graine, choix de halte au hasard pondéré vers les portes de faveur, question de porte juste avec la probabilité p, faveur prise au hasard parmi l'offre, bivouac en « +1 vivre » si vivres < max sinon « affiner », marchand : vivre si vivres ≤ 1 sinon faveur.

```
node atelier/outils/simuler-expedition.js --graines 80 --p 0.6,0.7,0.8,0.9 --depart 1,4,7 --armorial 0,moitie,complet [--serments garde,guetteur] [--difficulte 0] [--json] [--comparer avant.json]
```

Sorties par justesse, relais et Armorial : part d'expéditions complètes ; semaine et halte moyennes atteintes ; vivres restants ; réussite par type de halte (escarmouche, embuscade, gardien, Grand Gardien, première tentative) ; renommée moyenne ; questions posées et durée estimée (questions × 18 s + vagues × 50 s) ; faveurs les plus prises et leur effet sur la réussite (différence avec et sans).

Cibles de départ (à ajuster avec Romain après quelques expéditions réelles) :

| Mesure | p = 0,7, Armorial 0 | p = 0,7, Armorial complet | p = 0,9 | p = 0,6 |
|---|---|---|---|---|
| Escarmouche tenue | ≥ 97 % | ≥ 99 % | ≥ 99 % | ≥ 95 % |
| Escarmouche éclatante (camp abattu) | 40 à 60 % | ≥ 70 % | ≥ 80 % | ≥ 25 % |
| Embuscade tenue (1re tentative) | 75 à 85 % | ≥ 90 % | ≥ 95 % | ≥ 60 % |
| Gardien de semaine vaincu (1re tentative) | 75 à 85 % | ≥ 90 % | ≥ 95 % | ≥ 60 % |
| Grand Gardien S3 vaincu (1re tentative) | 60 à 70 % | ≥ 80 % | ≥ 90 % | ≥ 45 % |
| Expédition S1-S3 complète | 55 à 65 % | ≥ 85 % | ≥ 90 % | 30 à 40 % |
| Expédition S7-S9 complète | 30 à 40 % | ≥ 65 % | ≥ 80 % | ≥ 15 % |
| Renommée d'une expédition arrêtée | ≥ 35 | | | ≥ 30 |
| Durée estimée d'une expédition complète | 30 à 40 min | | | |

Leviers, dans l'ordre où le journal du 16/10/2026 les a classés par effet : la garnison des gardiens (+1 garde coûte une troupe par vague), la solidité des places de route (6, 10, 12, 16), les vivres, puis seulement la table par semaine. Attention aux paliers de flèches : vérifier chaque changement de « tirs » au simulateur de bataille. Si les gardiens sont trop cléments (le mode défense tient 73 à 83 % sur trois vagues ; sur deux, davantage), c'est la garnison +1 qu'on monte d'abord, puis l'assaut de la ligne.

### 17.3 simuler-bataille.js : les batailles de route une à une

`--halte escarmouche|embuscade|gardien|grand-gardien --semaine 4 [--faveurs "engrenages:2,onguents:1"] [--serments garde] [--modificateur garnison]` : joue la halte avec les options exactes de `JEU.expedition.optionsBataille`, 80 graines, les quatre justesses, les trois stratégies : issue, coups portés, batailles pour vaincre le gardien (coups gardés). Et `--comparer` entre le moteur d'avant et le moteur avec `options.faveurs` vide : aucun écart (les batailles de campagne ne bougent pas).

### 17.4 mesurer-tirage.js : la part de la semaine

`--expedition` : des expéditions simulées (lots de 3 avec quota, événements, portes, archives) sur six séances : part des questions de la semaine traversée (cible ≥ 60 % quand la semaine a au moins 12 fiches, ≥ 30 % entre 5 et 11), part de chaque famille sur l'expédition (12 à 30 % par famille présente), notions à revoir ≥ 1,5× leur part, aucune question reposée à moins de 60 questions hors Seconde chance, aucune notion deux fois en 10 questions, durée du tirage (médiane < 3 ms, maximum < 10 ms). Mesuré avec le contenu d'aujourd'hui (S6 à un cours) et de nouveau quand les semaines 4 à 8 seront pleines.

### 17.5 perf.js (bout en bout, Chromium)

Départ d'une expédition depuis la campagne ; carte entière visible en 1366 × 768 avec ses cartouches, noms et étiquettes de 14 px au moins ; navigation au clavier d'une halte à l'autre ; escarmouche jouée (toile de bataille jamais réallouée, toujours < 100 ms entre une réponse et la question suivante, JEU.mesure et Event Timing) ; porte de faveur : question puis choix au clavier ; Échap au milieu d'une halte puis « Reprendre » : même position, mêmes vivres ; défaite forcée (vivres à 1, bataille quittée après la 1re vague) : bilan avec renommée > 0, campagne intacte (mêmes provinces, ressources, jauges avant et après) ; export puis import : l'expédition en cours revient ; « Messages des rivaux » coupé : pas de défi avant le Grand Gardien.

### 17.6 Validateur

Rien de nouveau dans jeu/data/cours : le validateur ne change pas, sauf la vérification du même numéro de version et, quand des répliques d'expédition entrent dans personnages.js, le contrôle 10 existant, étendu aux situations nouvelles.

## 18. Risques et questions pour Romain

1. **Relais** : S1, la semaine après chaque semaine franchie, et toujours le tronçon de l'année en cours (frontière − 2). D'accord ? (Autres choix : toujours repartir de la semaine 1 comme dans Hadès ; ou départ libre partout.)
2. **Longueur** : trois semaines par expédition (30 à 40 minutes, en deux séances, reprise à tout moment). Préfères-tu deux semaines (25 à 28 minutes), ou le choix au départ (prévu en étape 2) ?
3. **Vivres** : une bataille où les murs cèdent coûte un vivre (trois au départ). C'est la seule chose qu'on « perd », et seulement dans l'expédition. Cela reste-t-il dans l'esprit « pas trop d'échecs » ? Le simulateur vise une expédition sur deux réussie au début, trois sur quatre avec l'Armorial, et une défaite rapporte toujours de la renommée.
4. **Fermer le jeu au milieu d'une bataille de route** après la première vague : compté comme une retraite (−1 vivre), comme un abandon volontaire ? Proposé : oui, pour qu'on ne puisse pas « annuler » une vague qui tourne mal en fermant la fenêtre.
5. **Or de route perdu au retour** : clair pour un élève de 13 ans si le jeu le dit avant le Grand Gardien ? Autre solution : le changer en ressources du domaine (1 pour 10) au bilan.
6. **Noms** : « Expédition », « halte », « gardien », « faveur », « renommée », « Armorial », « Serment », « ardeur », « vivres », « Lever le camp ». Tous changeables avant le code (les identifiants internes ne porteront pas ces mots).
7. **Frontière** : la demande dit « la semaine scolaire en cours » ; la règle du projet dit « le calendrier ne bloque rien ». Proposé : frontière = dernière semaine qui a un cours déposé, bannière « Cette semaine » pour le calendrier.
8. **Risque de réglage** : la difficulté des batailles compte par paliers (flèches par soldat) ; la table par semaine sera réglée au simulateur, mais il faudra deux ou trois expéditions réelles pour l'ajuster. D'où `config.expedition.difficulte` pour baisser ou monter tout d'un cran sans attendre une livraison.
9. **Risque de contenu** : tant que les semaines 4 à 8 n'ont que l'histoire et la géographie, la règle des semaines minces rend ces actes moins « semaine » (une question sur trois, ou aucune). C'est temporaire et le jeu le dit sur la page de semaine.
10. **Risque de collision** avec les chantiers en cours (bataille.js, bataille-moteur.js, recit.js, personnages.js) : les accroches de la section 15 sont toutes des ajouts facultatifs ; les livrer après ces chantiers, et comparer les batailles de campagne graine pour graine avant et après (`simuler-bataille.js --comparer`).
11. **Textes de route qui glisseraient vers du contenu de cours** : règle écrite (section 2), relecture dans /relecture, contrôle 10 étendu.

## Annexe A : exemple de route (graine 4F2A-9C01, relais S4, frontière S8, vers l'ouest)

```
Semaine 4 · du 21 au 27 septembre 2026 · carte : la Tour du Col · quota : 2 questions sur 3 (15 fiches)
  1re couche : [Escarmouche · porte : faveur de l'herboriste]  [Archives · renommée ×2]  [Événement : le pont rompu]
  2e couche  : [Embuscade · garnison doublée · porte : faveur du maître d'œuvre (rare 50 %)]  [Marchand]
  3e couche  : [Bivouac]  [Escarmouche · porte : bourse]  [Événement : le défi du champion]
  Gardien de la semaine 4 : un seigneur rival du camp anglais (défense, 2 vagues, place 12)
Semaine 5 · du 28 septembre au 4 octobre 2026 · carte : la Forteresse anglaise · quota : 1 sur 3 (8 fiches, élargi à S4-S5)
  (3 couches dans la brume, gardien en silhouette)
Semaine 6 · du 5 au 11 octobre 2026 · carte : le Gué
  (3 couches dans la brume) … Grand Gardien : le roi d'Angleterre (défense, 3 vagues, ligne 3, place 16)
Semaines 7 et 8 : plus loin sur le parchemin, visibles, hors de cette expédition. Semaine 9 et au-delà : brume, « 6 cours à venir ».
```

## Annexe B : les nombres en une page

| Quoi | Valeur de départ |
|---|---|
| Semaines par expédition | 3 (moins si la frontière est proche ; 2 en « expédition courte ») |
| Relais ouverts | S1 ; la semaine après chaque semaine franchie ; frontière − 2 |
| Couches par semaine / haltes par couche / jouées | 3 / 2 ou 3 / 3 + gardien |
| Vivres au départ / maximum | 3 / 5 |
| Questions par escarmouche, embuscade, gardien, Grand Gardien | 3, 6, 6, 9 |
| Part des questions de la semaine traversée | 2 sur 3 (≥ 12 fiches), 1 sur 3 (5 à 11), aucune (< 5) |
| Modes et vagues | escarmouche : attaque, 1 ; embuscade : défense, 2 ; gardien : défense, 2 ; Grand Gardien : défense, 3 |
| Solidité des places de route | 6, 10, 12, 16 |
| Ligne RIVAL d'une semaine | MVP : min(4, (semaine − 1) div 2) ; étape 2 : table fine, tirs par paliers ; Grand Gardien ligne + 1 |
| Faveurs : conseillers / faveurs / rangs / duos / éruditions | 6 / 18 / 3 / 6 / 6 |
| Portes : faveur / bourse / renommée / vivres | 55 / 25 / 10 / 10 % ; rare 25 % (50 % après une embuscade) |
| Or de route : escarmouche, embuscade, gardien, bourse, coffre, bivouac | 10, 20, 25, 20, 25, 25 ; marchand : faveur 45, rare 75, affiner 35, vivre 40, plan 15, érudition 90, duo 80 |
| Renommée : réponse, halte, gardien, Grand Gardien, expédition | 1 ; 4 + S ; 15 + 3S ; 30 + 5S ; +20 |
| Armorial | 9 quartiers, 980 points en tout |
| Serments | 6, ardeur 8 au plus, +10 % de renommée par point, prime de 25 par point de record |
| Questions et durée visées | ≈ 50 questions ; 30 à 40 minutes (×1), 25 à 33 (×2) ; reprise à tout moment |
| Réussite visée (p = 0,7) | expédition S1-S3 : 55 à 65 % sans Armorial, ≥ 85 % avec |
