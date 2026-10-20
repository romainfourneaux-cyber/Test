# Expéditions : le plus petit mode roguelite qui tienne, et comment le construire en quelques jours

Document de conception, 20 octobre 2026. Lecture seule du code : rien n'est encore écrit dans jeu/. Il répond aux deux demandes de Romain du 16 octobre 2026 :

- « le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie » ;
- « intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles ».

Angle : pragmatique et pédagogique. Le but est la plus petite version qui donne la sensation d'un roguelite (une route à embranchements, des choix, des dons temporaires, une progression permanente, une défaite qui n'efface rien) en réutilisant au maximum le moteur de bataille, l'écran de campagne, le conseil et les événements, et sans toucher aux règles d'apprentissage : 7 réussites sur 10, variété des matières, notions à revoir, Seconde chance, aucune punition. D'abord le MVP (quatre jours de travail, section 16), puis deux incréments.

Le document voisin atelier/conception/expeditions-hades.md décrit la version complète « à la Hadès » (18 faveurs à trois rangs, duos, Serments, modificateurs d'élite, Chronique). Le présent document en est le noyau : même vocabulaire (expédition, halte, gardien, faveur, renommée, Armorial), mêmes accroches dans le code, mêmes structures de sauvegarde, pour que l'un soit l'étape 1 de l'autre. Les différences sont dites en section 3.

## 1. En deux mots

Une **expédition** est une partie à part, lancée depuis la carte de campagne, de 20 à 40 minutes, qu'on peut quitter et reprendre à tout moment. Le joueur choisit une **semaine de départ** et parcourt **trois semaines du programme de suite** (moins si la frontière est proche), une par **acte**. Chaque semaine est une petite carte à embranchements dessinée sur un parchemin : deux rangées de **haltes** au choix (escarmouche, embuscade, événement, marchand, bivouac), puis le **gardien de la semaine**. Le gardien de la dernière semaine est le **grand gardien** : le rival du front, en personne.

- Chaque halte pose des questions par le tirage habituel du jeu. Une seule règle de plus : **deux questions sur trois viennent des cours de la semaine traversée**, la troisième vient du tirage ordinaire (toutes semaines, équilibre des familles de matières, priorités « à revoir », Seconde chance). On voit les semaines défiler ; les anciennes reviennent quand même.
- Les réponses paient tout : l'or du conseil de guerre comme aujourd'hui, l'**or de route** (le marchand), le choix des **faveurs** (des dons des conseillers du domaine, un par famille de matières, valables pour l'expédition seulement).
- La **renommée** reste pour toujours. Elle paie l'**Armorial** (quatre améliorations permanentes dans le MVP), qui rend chaque expédition suivante un peu plus facile. Une défaite (plus de **vivres**) renvoie au domaine avec la renommée gagnée. Rien n'est jamais retiré au royaume : ni province, ni bâtiment, ni ressource, ni jauge, ni bâtiment du domaine, ni cours.
- La difficulté monte avec la semaine traversée (le réglage du seigneur rival suit la semaine comme il suit aujourd'hui le niveau de la province) et, dans chaque semaine, de la première halte au gardien. Partir plus loin dans l'année rapporte plus de renommée.

Le MVP tient en deux fichiers nouveaux (jeu/js/expedition.js, sans DOM, testé sous Node ; jeu/js/ecran-expedition.js, l'écran), trois accroches facultatives dans le code existant (un `contexte` pour `JEU.bataille.lancer`, un `quota` pour `JEU.recit.suite`, un paramètre pour `JEU.campagne.jouerEvenement`), un schéma de sauvegarde (6), et **aucun changement du moteur de bataille** : les faveurs du MVP passent toutes par des options que `M.creer` lit déjà.

## 2. Ce que les règles imposent, et ce que je tranche

| Règle (CLAUDE.md, cahier des charges) | Dans les expéditions |
|---|---|
| Jamais de chrono | Aucune horloge, aucun compte à rebours. La route a des « haltes restantes », jamais un temps. |
| Difficulté réglée pour 7 réussites sur 10 | Le tirage des niveaux de questions ne change pas (niveau conseillé, batailles aux niveaux 1 à 3, le reste aux niveaux 1 et 2). La difficulté du mode porte sur la bataille (niveau du rival par semaine), jamais sur les questions. |
| Une erreur ne coûte ni bâtiment, ni province, ni ressource du royaume ; en bataille, un peu d'or de la bataille | Inchangé : −6 or de la bataille en cours, jamais sous zéro. Les **vivres** sont créés au départ de l'expédition et rendus au retour ; on en perd un quand les murs cèdent dans une bataille de route, **jamais pour une question**. |
| Une question ratée revient (« Seconde chance ») | Inchangé : la file des rappels traverse les haltes comme elle traverse aujourd'hui batailles, conseils et événements. Une question ratée au bivouac revient trois questions plus tard, au conseil de guerre de l'escarmouche suivante. |
| Un cours s'ouvre dès que son fichier existe ; le calendrier ne bloque rien | **Frontière** = la dernière semaine du planning qui a au moins un fichier de cours chargé. La semaine du calendrier est affichée (« Cette semaine »), elle ne verrouille rien. En pratique les deux coïncident : Romain dépose les cours au fil de l'année. |
| Un cours pas encore ouvert reste dans la brume | Au-delà de la frontière : nappes de brume, numéro de semaine et « n cours à venir », sans titre, sans question, sans aperçu. |
| Chaque question est posée dans le récit | Nouvelles phrases de cadre (section 7.4), avec la semaine dite par le conseiller. L'énoncé ne change jamais. |
| Carte de campagne à la Total War, enluminure, héraldique | Parchemin d'itinéraire à la manière des cartes d'itinéraire médiévales : une route horizontale, des vignettes-médaillons, une lettrine rubriquée par semaine, les nappes de brume existantes (section 14). |
| Conflits : camps politiques, ton neutre ; adversaires = ceux du cours, sinon « un seigneur rival » | Le gardien d'une semaine est « un seigneur rival » (le générique prévu par CLAUDE.md, avec le médaillon héraldique au tortil). Le grand gardien est le rival du front (personnages.js : « Le roi d'Angleterre », « L'émir de Cordoue », en titre seul). Aucun nom inventé, aucune figure religieuse. |
| Bonus jamais en bataille, dans un siège ou un boss | Le tirage les exclut déjà. |
| Pas d'épreuve de validation | Un gardien vaincu ne change ni suivi.js, ni l'état d'un cours. Il ne vaut que de la renommée et une case scellée sur le parchemin. |
| Moins de 100 ms entre une réponse et la question suivante | Les faveurs sont résolues une fois, en options de `M.creer`. Le quota de semaine ajoute un passage de `tirage()` au début d'une vague ou d'une halte, jamais entre deux questions. |
| Si le cahier ne tranche pas : le plus simple, noté au journal | Les décisions ci-dessous. |

Décisions prises faute d'arbitrage (à reporter dans docs/JOURNAL.md, rubrique Décisions, à la livraison) :

1. **La semaine de départ se choisit librement** parmi les semaines ouvertes (1 à frontière), avec pour défaut **les trois dernières** (frontière − 2). On ne repart pas toujours de la semaine 1 comme dans Hadès : l'élève passerait son année à rejouer septembre, et le but est de réviser ce qu'il travaille. On ne verrouille pas non plus les semaines les unes derrière les autres : la règle du projet est qu'un cours ouvert est jouable partout. La **profondeur** (partir plus tard dans l'année, donc contre un rival plus fort) est le choix du joueur et sa récompense (plus de renommée), comme la chaleur du Pacte dans Hadès. Les semaines déjà **franchies** (gardien vaincu) se voient, scellées, sur le parchemin de l'année : c'est le sentiment de couvrir l'année.
2. **Une expédition = 3 semaines au plus** (config.js), 2 rangées de haltes par semaine dans le MVP, pour tenir 20 à 40 minutes. Trois semaines à partir de la frontière − 2 : avec les cours d'aujourd'hui (S1 à S3), une seule expédition possible, S1 → S3 ; quand les semaines 4 à 8 seront livrées, le défaut sera S6 → S8.
3. **La défaite vient des vivres** (3 au départ), perdus un par bataille où les murs cèdent, jamais par une question ni par un événement. Un gardien raté se retente tant qu'il reste des vivres, et les coups portés à son camp restent (comme pour une place forte de la campagne).
4. **Les faveurs se méritent par une question** du conseiller qui les offre : juste, trois faveurs au choix ; fausse, deux. Jamais de porte vide, jamais de faveur imposée.
5. **Rien de permanent ne vient des faveurs.** La renommée et l'Armorial sont la seule progression entre deux expéditions. Les ressources du domaine gagnées par bonne réponse (règle générale de `enregistrerReponse`) et par les événements restent acquises comme partout : même une expédition perdue fait grandir le domaine.
6. **Les gardiens se jouent en défense** (le mode `defense` du moteur : troupes d'assaut, coups aux murs doublés), les escarmouches en attaque. Le mode défense est déjà réglé pour « inquiéter un peu » (tenue 73 à 83 % à 7 sur 10, 86 à 95 % à 8 sur 10, journal du 16/10/2026) : c'est exactement le taux qu'on veut pour un boss de semaine. Les escarmouches, en attaque, se tiennent presque toujours ; leur enjeu est la **victoire éclatante** (le camp adverse tombe), qui double la porte.

## 3. Rapport avec expeditions-hades.md

Gardé tel quel : le vocabulaire, la route par semaines avec gardien, le quota « 2 questions sur 3 de la semaine », les vivres, l'or de route, la renommée et l'Armorial, le schéma 6, le principe « rien du royaume ne baisse », la plupart des accroches du code (section 15), la graine et la route écrite dans la sauvegarde.

Réduit dans le MVP, à reprendre en incrément 2 et 3 :

| Version complète | MVP | Pourquoi |
|---|---|---|
| Relais ouverts en franchissant les semaines | Départ libre, défaut = les trois dernières semaines | Pas de verrou sur des cours ouverts ; l'élève révise ce qu'il travaille ; une seule règle à coder |
| 3 couches par semaine | 2 couches (config.js : `couches`) | Tient dans 20 à 40 minutes avec des gardiens à 2 vagues ; la 3e couche est un réglage, pas du code |
| 7 types de haltes | 5 (escarmouche, embuscade, événement, marchand, bivouac) ; l'halte « archives » est un événement de plus | Trésor et archives sont des événements à filtre : incrément 2 |
| 18 faveurs, 3 rangs, 6 duos, faveurs d'érudition | 6 faveurs (une par conseiller), un rang, cumulables une fois (rang 2 = effet doublé) ; toutes par des options existantes de `M.creer` | Aucun changement du moteur dans le MVP ; les rangs et duos viennent avec l'option `faveurs` du moteur |
| Modificateurs d'élite, Serments | Embuscade = escarmouche au niveau + 1, sans modificateur ; pas de Serment | Le moteur n'a pas encore d'option `rivalRegle` |
| Table du rival interpolée par semaine | Niveau = (semaine − 1) div 2, plafonné à 4 ; grand gardien au niveau + 1 | Les cinq lignes `RIVAL` sont déjà réglées au simulateur ; l'interpolation attend `rivalRegle` |
| 9 quartiers d'Armorial, titres, Chronique des expéditions | 4 quartiers ; historique des 20 dernières expéditions dans la sauvegarde, affiché au départ | Le reste est de l'affichage, pas du jeu |
| Missives nouvelles dans personnages.js | Réutilisation des situations existantes (`defi` avant le grand gardien, `victoire` après) | Pas de texte nouveau à faire passer au contrôle 10 |

## 4. La boucle d'une expédition

### 4.1 Vocabulaire

- **Expédition** : une partie du mode (un « run »).
- **Départ** : la semaine de départ, choisie parmi les semaines ouvertes. **Arrivée** : `min(départ + semaines − 1, frontière)`.
- **Acte** : une semaine du programme, traversée en 2 haltes (une par couche) puis un gardien. Affichée partout « Semaine 4 », et sous la carte « Semaine 4 · du 21 au 27 septembre 2026 » (`JEU.calendrier.lundiDe`, `libelle`).
- **Couche** : une rangée de 2 ou 3 haltes ; on en joue une.
- **Halte** : un nœud de la route. **Gardien** : la bataille qui ferme la semaine. **Grand gardien** : celle qui ferme l'expédition.
- **Frontière** : la dernière semaine ouverte. Au-delà : brume.
- **Vivres** : les « vies » de l'expédition. **Or de route** : sa monnaie (le marchand). **Faveurs** : les dons des conseillers, pour l'expédition seulement. **Renommée** : la monnaie permanente. **Armorial** : les améliorations permanentes.

### 4.2 Déroulé

1. **Partir.** Sur la carte de campagne, la carte de jeu « Partir en expédition » (ou « Reprendre l'expédition · semaine 5, 1re halte »). L'écran de départ montre : le parchemin de l'année (34 cases, les semaines franchies scellées, la frontière, la brume au-delà), le choix de la semaine de départ (flèches ← →, défaut : frontière − 2), le front (vers l'ouest contre le royaume d'Angleterre, vers le sud contre l'Empire omeyyade : terrains de la variante sèche, couleurs du camp, rival du grand gardien), l'Armorial (acheter avec la renommée), les vivres et l'or de départ qu'on aura, et une phrase du souverain servi : « {souverain} te confie la route des semaines 6 à 8. Reviens couvert de renommée. » (texte du jeu dans expedition.js, pas une réplique nouvelle de personnages.js).
2. **La page de semaine.** À l'entrée de chaque semaine, une page d'enluminure « Semaine 6 · du 5 au 11 octobre 2026 », la liste des cours de la semaine (les titres du planning, déjà visibles dans l'écran Cours), une phrase du chroniqueur : « Les cours de la semaine 6 t'attendent sur la route. Le gardien ne laisse passer que ceux qui s'en souviennent. » Bouton « En route (Entrée) ».
3. **La route.** On choisit une halte atteignable dans la couche 1, on la joue, puis une dans la couche 2 (parmi celles reliées à la première), puis le gardien. Après chaque halte, la sauvegarde est écrite : on peut quitter et reprendre là.
4. **Le gardien.** Défense d'un camp de route, 2 vagues (3 pour le grand gardien), contre « un seigneur rival » (le rival du front pour le grand gardien). Tenu ou victoire : semaine franchie, page de la semaine suivante. Murs cédés : −1 vivre, le gardien se retente (les coups portés à son camp restent).
5. **La fin.** Grand gardien vaincu : **retour triomphal** (bilan, renommée, +3 coups à la prochaine place forte du front, missive du rival). Plus de vivres : **retour au domaine** (même bilan, renommée gagnée, rien de perdu). Abandon depuis la carte (avec confirmation) : même bilan.

### 4.3 Forme de la route (départ S6, frontière S8, 2 couches)

```
 Semaine 6 (niveau 2)                 Semaine 7 (niveau 3)             Semaine 8 (niveau 3, grand gardien 4)
 [départ] ─┬─ escarmouche ─┬─ marchand ─┐
           │               ├─ embuscade ┼─ GARDIEN S6 ─┬─ (2 couches dans la brume) ─ GARDIEN S7 ─┬─ (brume) ─ GRAND GARDIEN S8 ─ [retour]
           └─ événement ───┴─ bivouac ──┘
 Semaine 9 et au-delà : brume, « 6 cours à venir »
```

- 2 couches par semaine, 2 ou 3 haltes par couche (2 une fois sur deux). Chaque halte mène à une ou deux haltes de la couche suivante, sans croisement (section 12). Toute halte est atteignable depuis le départ et mène au gardien.
- On voit : les deux couches de la semaine en cours avec le type de chaque halte et sa **porte** (la récompense annoncée) ; les semaines suivantes de l'expédition sous une nappe de brume, leur gardien en silhouette ; au-delà de la frontière, la brume et le numéro de semaine.
- Nœuds joués par expédition de trois semaines : 9 (6 haltes, 2 gardiens, 1 grand gardien). Questions : environ 45.
- Cartes de bataille : les cinq tracés existants tournent avec la semaine, `["gue", "foret", "moulin", "col", "chateau"][(semaine − 1) % 5]`, variante sèche (`-sud`) quand l'expédition va vers l'Empire omeyyade ; le moteur sait jouer une défense sur n'importe quelle carte (`options.defense`).

### 4.4 Durée

| Nœud | Questions | Vagues | Durée à ×1 (15 à 20 s par question, 50 s par vague) |
|---|---|---|---|
| Escarmouche (attaque, 2 vagues) | 6 | 2 | 3,5 à 4 min |
| Embuscade (attaque, 2 vagues, niveau + 1) | 6 | 2 | 4 min |
| Événement | 2 ou 3 | — | 1 min |
| Marchand | 1 | — | 1 min |
| Bivouac | 1 | — | 0,5 min |
| Gardien (défense, 2 vagues) | 6 | 2 | 4 min |
| Grand gardien (défense, 3 vagues) | 9 | 3 | 6 min |

Une semaine ordinaire : une bataille (4 min) + une halte légère (1 min) + le gardien (4 min) ≈ 9 min, 11 avec deux batailles. Trois semaines : 27 à 33 min ; à ×2 sur les vagues (boutons existants), 20 à 25 min. Une expédition d'une seule semaine (départ = frontière) : 10 à 12 min. Les pages de semaine, les portes et le bilan ajoutent 2 à 3 minutes. Reprise possible après chaque nœud.

## 5. Les semaines : frontière, départ, brume

- **Semaine d'un cours** (`JEU.expedition.semaineDe(coursId)`, à partager avec le chantier « semaine visible dans les questions », idéalement dans `JEU.progression`) : `entree(coursId).semaine`, ou `null` pour un cours de langue, une fiche méthode ou une séquence d'anglais (ils n'ont pas de semaine ; ils arrivent par la troisième question de chaque lot, avec l'équilibre des familles).
- **Frontière** (`JEU.expedition.frontiere()`) : la plus grande semaine parmi `JEU.progression.coursAccessibles()` dont l'entrée du planning est de type cours. Aujourd'hui 3 ; 8 quand les semaines 4 à 8 seront livrées (la semaine 7 n'a que 3 cours au planning, dont un de géographie et un d'histoire : le quota s'en accommode, voir 7.1). Aucun cours chargé : la carte de campagne ne propose pas le mode (« La route attend tes premiers cours »).
- **Départ** : 1 à frontière, défaut `max(1, frontière − semaines + 1)`. **Arrivée** : `min(départ + semaines − 1, frontière)`. Partir de la frontière donne une expédition d'une semaine, grand gardien direct.
- **Cette semaine** : la semaine du calendrier (`JEU.calendrier.semaine()`), plantée en bannière sur le parchemin de l'année. Si elle dépasse la frontière (cours pas encore déposés), elle est dans la brume, ce qui dit à l'élève que les cours arrivent.
- Après S34 (révision libre) : toutes les semaines restent jouables ; aucune nouvelle n'arrive.
- **Semaines franchies** : chaque semaine dont le gardien (ou le grand gardien) a été vaincu une fois, pour toujours. Scellée sur le parchemin de l'année (cire aux couleurs du front où on l'a franchie). Ce n'est ni un état de cours, ni une validation : un sceau de jeu.

## 6. Les haltes

### 6.1 Les cinq types du MVP

| Halte | Icône (jeu/assets/icones, déjà là) | Ce qui se passe | Questions | Réussite | Échec |
|---|---|---|---|---|---|
| **Escarmouche** | assaut | Bataille d'attaque, 2 vagues, sur la carte de la semaine, contre un camp de route (solidité 8), niveau de la semaine. Conseil de guerre : 3 questions par vague. | 6 (niveaux 1 à 3) | Tenu (murs debout) : porte simple. **Éclatante** si le camp tombe : porte doublée. | Murs cédés : −1 vivre ; porte simple quand même (l'effort compte). |
| **Embuscade** | mercenaires | Comme l'escarmouche, au niveau de la semaine + 1 (plafond 4), camp de solidité 10. Toujours une porte de faveur. | 6 | Idem | Idem |
| **Événement** | celle de l'événement | Un des cinq événements du jour existants (marchands, défi du champion, mercenaires, feu au grenier, espion), rejoué par `JEU.campagne.jouerEvenement(ev, contexte)`, gains inchangés ; ou **Les archives** (nouveau, section 6.2). | 2 ou 3 (niveaux 1 et 2) | Toujours « fait » | Jamais de perte |
| **Marchand** | marchand | Le maître d'œuvre tient l'étal. Une question ouvre l'étal ; juste, les prix baissent de 20 %. Puis achats avec l'or de route : une faveur au choix parmi deux (40), un sac de vivres (35, jusqu'au maximum), un plan de bataille (+25 or au début de la prochaine bataille, 15). | 1 | — | — |
| **Bivouac** | camp (feu de camp) | La veillée : le ménestrel (ou le maître scribe) pose une question. Puis un choix : +1 vivre (jusqu'au maximum, sinon +20 or de route), ou +20 or de route, ou une faveur commune au choix parmi deux (seulement si la question est juste). | 1 (niveaux 1 et 2) | — | — |
| **Gardien de la semaine** | defi | Défense d'un camp fortifié, 2 vagues, niveau de la semaine, contre « un seigneur rival ». Tenu ou victoire (son camp de 12 points tombe ; les coups restent entre deux tentatives). | 6 | Semaine franchie | Murs cédés : −1 vivre, on retente |
| **Grand gardien** | couronne (médaillon du rival) | Même règle, 3 vagues, niveau + 1 (plafond 4), camp de 16 points. Missive de défi du rival avant (une fois sur deux, comme avant une bataille de campagne), réaction après. | 9 | Expédition réussie | Murs cédés : −1 vivre, on retente |

« Réussite » et « échec » ne parlent que des murs. Une question ratée coûte au plus 6 or de la bataille en cours, comme partout.

### 6.2 Les événements de route

Les cinq événements du jour se rejouent tels quels : `jouerEvenement(ev, contexte)` prend l'événement en paramètre au lieu de le lire dans `c.evenement`, ne marque pas l'événement du jour comme fait, et appelle `contexte.surFin(bonnes, total)` au lieu de revenir à la campagne. Leurs gains restent ceux de la campagne (2 ressources par bonne réponse aux marchands, +1 Peuple au feu, 3 coups à la prochaine place forte pour le champion, +40 or et espion pour la prochaine bataille : les batailles de route lisent `c.bonus` par `C.options`, comme les batailles de campagne, et `JEU.expedition.apresBataille` le remet à zéro comme `C.apresBataille`). Rien à écrire, rien à équilibrer.

Un événement nouveau, propre à la route : **Les archives** (le chroniqueur) : 3 questions tirées **avant la semaine de départ** (`quota: { nombre: 3, filtre: semaine < départ }` ; depuis le départ S1, les notions à revoir : filtre `fichesARevoir`), renommée doublée pour la halte. C'est la halte qui ramène les semaines anciennes au premier plan ; une expédition en a toujours au moins une (garantie de 6.3).

### 6.3 Répartition des types (tirée à la graine)

| Couche | Escarmouche | Embuscade | Événement | Marchand | Bivouac |
|---|---|---|---|---|---|
| 1re | 60 % | 0 | 30 % | 0 | 10 % |
| 2e | 25 % | 25 % | 10 % | 25 % | 15 % |

Garanties par semaine, appliquées après le tirage dans un ordre fixe (chaque correction remplace la halte la plus à droite du type en trop par le type manquant) : au moins une escarmouche en 1re couche ; exactement un marchand en 2e couche ; au plus une embuscade ; au plus une halte de chaque type par couche, sauf les escarmouches ; au moins un bivouac par semaine (en 2e couche s'il manque). Par expédition : au moins un événement « archives » (placé dans la 1re couche de la 2e semaine, ou de la seule semaine). Les événements du jour tournent sans répétition dans l'expédition.

### 6.4 Les portes (récompense annoncée)

Chaque escarmouche et embuscade porte une récompense visible avant d'entrer, en petit écusson sur le médaillon :

| Porte | Part | Contenu | Éclatante |
|---|---|---|---|
| Faveur d'un conseiller | 60 % (100 % pour une embuscade) | Le médaillon du conseiller. À la fin de la bataille, il pose une question de sa matière puis offre ses faveurs (section 9.2). | Il ajoute une 4e faveur au choix |
| Bourse | 25 % | +20 or de route | +40 |
| Parchemin de renommée | 15 % | +10 renommée tout de suite | +20 |

Conseiller d'une porte de faveur : tiré parmi les conseillers dont la famille a des questions dans les cours chargés, pondéré ×1,5 si la famille a des notions à revoir (on rencontre plus souvent l'herboriste quand les SVT sont à revoir, donc plus de questions de SVT), ×1,5 si la famille a un cours dans la semaine traversée, jamais le même conseiller deux fois dans une semaine. Comme dans Hadès on choisit sa porte à la récompense ; ici la porte dit aussi quelle matière on va rencontrer : c'est le levier de variété le plus simple.

## 7. Les questions dans l'expédition

### 7.1 Le tirage : deux questions de la semaine, une du royaume

Tout passe par `JEU.recit.suite`, le seul tirage du jeu, avec une option nouvelle, `quota` :

```js
// bataille de route, lot d'une vague (3 questions), comme tirerQuestions() de bataille.js
JEU.recit.suite(3, {
  exclure: ids, filtre: function (q) { return fiches.indexOf(q.fiche) < 0; }, completer: true,
  quota: { nombre: 2, filtre: function (q) { return JEU.expedition.semaineDe(q.cours) === semaine; } }
});
```

Dans `suite()`, la liste `essais` reçoit deux essais de plus en tête, plafonnés à `quota.nombre` questions : `[filtre ∧ quota.filtre, souple 0]` puis `[filtre ∧ quota.filtre, souple 1]` (sans le repos des fiches) ; la suite du lot vient des essais existants. Un seul `JEU.rappels.placer` et un seul `eviterTriples` à la fin, comme aujourd'hui : les Seconde chance gardent leur place et leur unicité. Une douzaine de lignes.

- **Part visée** : 2 sur 3 dans chaque lot de bataille, 2 sur 3 dans un événement de 3 questions, 1 sur 1 au bivouac et au marchand (le quota est alors sur la **famille** du conseiller, pas sur la semaine), 3 sur 3 pour les archives (semaines avant le départ). Quand la semaine a peu de cours chargés (la semaine 7 n'en a que trois au planning), `completer` et le tirage ordinaire font le reste : le tirage ne bloque jamais, c'est déjà sa règle.
- **Équilibre des familles** : il continue de se faire sur l'historique commun (`recit.historique`), d'une halte à l'autre. Dans le quota, les familles candidates sont celles qui ont des cours cette semaine-là ; sur l'expédition entière, chaque famille présente doit rester entre 12 et 30 % (mesure : section 17.3). « Jamais trois fois la même famille de suite » tient par `eviterTriples`.
- **À revoir** : inchangé (×1,5 dans la matière et pour la famille), dans le quota comme hors quota. Les fiches de a-retravailler.js d'une semaine traversée ressortent donc davantage, et les cours « à revoir » de suivi.js aussi.
- **Anti-répétition** : inchangée (fenêtre de 60 questions, repos des fiches). Une expédition de 45 questions puise dans 1 189 questions ; une semaine à 6 cours en a 200 à 250 : le quota ne force aucune répétition.
- **Niveaux** : batailles de route en `NIVEAUX_BATAILLE` (1 à 3, par `avecNiveaux`, comme bataille.js) ; événement, bivouac, marchand, archives, porte de faveur en 1 et 2 ; les Seconde chance suivent ces niveaux comme aujourd'hui (une question de niveau 3 ratée attend une bataille).

### 7.2 Ce que les réponses rapportent

- En bataille : l'or du conseil de guerre par le moteur (`M.repondre` : +12, +10 au 3e succès d'affilée, −6 par erreur sur l'or de la bataille, jamais sous zéro), modifié par les faveurs (Annales, Chant de marche).
- Partout : 1 ressource du domaine par bonne réponse (règle générale), **+1 renommée par bonne réponse**, Leitner et Seconde chance.
- Aux portes de faveur : la question du conseiller décide de l'offre (3 faveurs ou 2).
- Au marchand : la question ouvre l'étal (−20 % si juste). Au bivouac : la question ouvre le choix de la faveur.
- Le compte de l'expédition garde les bonnes réponses par famille et par semaine : il sert au bilan (« Ta meilleure semaine : la 7e ; à relire : trois fiches ») et à la ressource bonus du retour triomphal (section 9.4).

### 7.3 Ce qui ne change pas

Panneau d'erreur à deux phrases, « Voir la fiche », « Signaler une erreur », l'indice du mentor, les raccourcis 1 à 6, flèches, Entrée. Pendant le grand gardien, comme pour un boss du cahier des charges, « Voir la fiche » attend le bilan : option `sansFiche` de `panneauErreur` (une ligne), et les fiches ratées sont listées au bilan sous « À relire », avec leur lien vers le Codex.

### 7.4 Le récit : la semaine se voit et s'entend

Trois endroits montrent la semaine, sans toucher à l'énoncé :

1. **Le cadre du récit** : `JEU.recit.cadre(q, contexte, camp, extra)` avec `extra.semaine` ; nouveaux contextes `route` (conseil de guerre d'une escarmouche), `gardien`, `bivouac`, `marchand`, `archives`, `porte`. Phrases de jeu, sans fait de cours ; la moitié nomment la semaine par `{S}` :
   - route : « {N} marche à tes côtés sur la route de la semaine {S}. « Avant la prochaine halte, seigneur, dis-moi ceci. » » ; « Les éclaireurs ont trouvé un camp à prendre. {N} te retient par la manche : « Une question, et je paie les hommes. » »
   - gardien : « {N} regarde la tour du gardien se découper sur la colline. « Il garde la semaine {S}. Montre-lui que tu la connais. » » ; « Les tambours du gardien roulent déjà. {N} monte au rempart du camp : « Vite, seigneur, une question avant l'assaut ! » »
   - bivouac : « Le camp est dressé. {N} déplie ses notes de la semaine {S} à la lueur du feu : « Une question, et je te laisse dormir. » »
   - marchand : « {N} ouvre son étal sur la place du bourg : « Une bonne réponse, et je fais un prix. » »
   - archives : « Un pèlerin partage le feu et parle des semaines passées. {N} te glisse : « Montre-lui que tu n'as rien oublié. » »
   - porte : « {N} t'attend à la sortie du camp, un présent sous le bras : « Réponds d'abord à ceci, seigneur. » »
   - Seconde chance : les phrases `PHRASES.rappel` existantes, inchangées.
2. **La pastille de semaine sur la question** : à côté de la pastille de matière, « Semaine 4 » si le cours de la question est de la semaine traversée ; « Semaine 2 » (en retrait) si elle vient d'une autre semaine ; « Griffon de cuivre », « Fiche méthode », « Anglais » pour les cours sans semaine. Si le chantier « semaine visible dans les questions » met déjà cette pastille dans `JEU.ui.poserQuestion`, l'expédition s'en sert ; sinon le cadre porte `r.semaine`, rendu par `ui.recit` sous le nom du conseiller.
3. **La carte et les pages de semaine** : bandeau « Semaine 4 · du 21 au 27 septembre 2026 » sur la semaine en cours ; la page de semaine à chaque passage (4.2).

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

Au-delà de S10, la table ne monte plus : la profondeur se paie alors en renommée seulement (8.3). L'incrément 2 ajoute l'option `rivalRegle` du moteur et une table interpolée par semaine (la table de expeditions-hades.md, section 6.1), avec le plafond des paliers de flèches en tête.

### 8.2 Par nœud, à partir du niveau de la semaine

| Nœud | Vagues | Mode | Niveau | Camp adverse (pvRival) | Autres options |
|---|---|---|---|---|---|
| Escarmouche | 2 | attaque | semaine | 8 | — |
| Embuscade | 2 | attaque | semaine + 1 (≤ 4) | 10 | — |
| Gardien | 2 | défense (assaut, coups aux murs ×2) | semaine | 12, gardé entre deux tentatives | — |
| Grand gardien | 3 | défense | semaine + 1 (≤ 4) | 16, gardé | 3 vagues : le champion sort à la dernière, comme en campagne |

Tout le reste vient de `JEU.campagne.options(niveau)` : or de départ (60 + Trésor + bonus d'événement), château (20 + Peuple + remparts), dégâts des tours (Garde), or par réponse (Savoir), arsenal débloqué, espion. La campagne aide donc la route, comme les Souvenirs de Hadès ; la route n'abîme jamais la campagne.

Pourquoi ça monte « en avançant sur la carte » : dans une semaine, de l'escarmouche (attaque, niveau w) à l'embuscade (w + 1) puis au gardien (défense, le mode le plus dur) ; d'une semaine à l'autre, le niveau monte toutes les deux semaines ; à la fin, le grand gardien à 3 vagues et au niveau w + 1. Une expédition S6 → S8 va du niveau 2 au niveau 4.

### 8.3 Profondeur et renommée

Partir plus tard dans l'année rapporte plus : les gains de renommée des gardiens portent le numéro de la semaine (section 9.4). Pas d'autre multiplicateur dans le MVP ; les Serments (difficulté facultative choisie) sont l'incrément 3.

## 9. Récompenses : or, faveurs, vivres, renommée, Armorial

### 9.1 Or de route

0 au départ. Gagné : +15 par escarmouche ou embuscade tenue (+10 si éclatante), +20 par porte « bourse » (+40 si éclatante), +20 au bivouac (choix), +2 par bonne réponse aux archives. Dépensé au marchand. Perdu à la fin de l'expédition (il n'a pas de sens au domaine), ce que la carte dit avant le grand gardien : « Dépense ton or de route : il ne te suivra pas au domaine. » Une expédition de trois semaines en donne 80 à 120 : deux ou trois achats.

### 9.2 Les six faveurs du MVP

Une par conseiller (donc par famille de matières), un rang, cumulable une fois (la reprendre la porte au rang 2 : effet doublé). Toutes s'appliquent dans `JEU.expedition.optionsBataille(halte)`, sur des options que `M.creer` lit déjà : **aucun changement du moteur**.

| Conseiller (famille) | Faveur | Rang 1 | Rang 2 | Option du moteur |
|---|---|---|---|---|
| Le chroniqueur (histoire) | **Annales** | +3 or par bonne réponse | +6 | `orParReponse` |
| La cartographe (géographie) | **Éclaireurs** | la première vague adverse perd un homme d'armes (ou son dernier soldat) | et la deuxième | `espion` (modificateur existant), appliqué à la vague suivante par le rendu au rang 2 |
| L'herboriste (SVT) | **Onguents** | tes troupes ont un niveau d'arsenal de plus (+15 % de points de vie, plafond 3) | deux | `arsenal.troupes` (copie) |
| Le maître d'œuvre (physique-chimie) | **Engrenages** | dégâts de tes tours +10 % | +20 % | `bonusDegats` (plafond total, jauge Garde comprise : +60 %) |
| Le ménestrel et le maître scribe (français) | **Chant de marche** | +20 or au début de chaque bataille | +40 | `orDepart` (plafond 180) |
| L'interprète (anglais) | **Parlementaire** | le camp adverse a 2 points de solidité en moins (jamais sous 4) | 4 | `pvRival` |

L'interprète n'apparaît que si une séquence d'anglais est chargée (le chantier anglais ouvre ses portes). Rang 2 des Éclaireurs : `espion` ne vide qu'une vague ; le rendu (bataille.js) pose `p.modificateurs.espion = true` au début de la 2e vague quand `contexte.eclaireurs >= 2` (deux lignes, hors moteur). Les 12 autres faveurs, les rangs rares et les duos viennent avec l'option `faveurs` du moteur (incrément 2).

**Comment on reçoit une faveur.** À une porte de faveur, après la bataille : le conseiller pose **une question de sa matière** (quota sur la famille, niveaux 1 et 2, règles anti-répétition habituelles, Seconde chance possible), dans son cadre de récit. Juste : trois faveurs au choix (la sienne, et deux autres conseillers tirés à la graine) ; fausse : explication, puis deux faveurs au choix (la sienne et une autre). Éclatante : une de plus. Choix au clavier (1 à 4) ou à la souris ; chaque carte montre le conseiller, l'effet en une phrase et, si on tient déjà la faveur, « Renforcer : rang 2 ». Au bivouac et au marchand, le choix est parmi deux.

### 9.3 Vivres

3 au départ (4 ou 5 avec l'Armorial), maximum 5. −1 quand les murs cèdent dans une bataille de route (escarmouche, embuscade, gardien, grand gardien), ou quand on quitte une bataille après sa première vague (comme en campagne, quitter avant la première vague ne coûte rien : la halte reste à jouer). +1 au bivouac (choix), au marchand (35 or de route), à l'événement « feu au grenier » rejoué sur la route ? Non : il garde son gain de campagne (+1 Peuple), plus simple. Jamais perdus pour une question, jamais pour un événement. À 0 : retour au domaine.

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

Lien avec la campagne au retour triomphal : +3 coups à la prochaine place forte du front choisi (comme le défi du champion, `pr.pv = max(1, pv − 3)`), rivalité du front +6, missive `victoire` du rival (il a été repoussé), 8 ressources de la matière la mieux réussie de la route, une ligne dans la chronique.

### 9.5 L'Armorial (le Miroir, en quatre quartiers)

Un écu dont on remplit les quartiers avec la renommée. Un achat est définitif ; rien ne se perd ; on peut toujours jouer sans rien acheter.

| Quartier | Effet | Rangs et prix (renommée) |
|---|---|---|
| Vivres de route | +1 vivre au départ (et au maximum) | 60, puis 150 (5 vivres) |
| Bourse du voyageur | +10 or au début de chaque bataille de route | 30, 60, 120 |
| Murs chaulés | ton camp a +2 points de solidité dans les batailles de route | 40, 90 |
| Bannière | renommée +10 % | 80, 180 |

Total : 810 points, six ou sept expéditions complètes ; le premier quartier (Bourse 30) s'achète dès la première expédition, même perdue. Tous passent par `optionsBataille` (orDepart, pvChateau) ou par l'état de l'expédition (vivres), sans toucher au moteur. L'incrément 2 ajoute Faveur d'ouverture, Seconde monture, Sauf-conduit, Mémoire des anciens, Forge de campagne (expeditions-hades.md, 9.2).

## 10. Défaite, abandon, pause, reprise

- **Retour au domaine** (vivres à 0) : écran de bilan, le même que la victoire : renommée gagnée (jamais réduite), meilleure semaine, fiches à relire (liens Codex), graine (« Graine 4F2A-9C01 »), « Repartir » ou « Retour à la campagne ». La chronique note : « L'expédition s'est arrêtée à la semaine 7, au gardien. La compagnie rentre avec 41 points de renommée. » Rien d'autre ne change.
- **Abandonner** (depuis la carte de route, avec confirmation) : même bilan, même renommée.
- **Pause** : Échap sur la carte de route revient à la campagne, l'expédition reste en cours (« Reprendre l'expédition »). La sauvegarde est écrite après chaque halte, chaque porte, chaque achat, chaque gardien.
- **Fermer le jeu pendant une bataille de route** : la bataille n'est pas sauvegardée (pas plus qu'en campagne). À la réouverture, la halte est à rejouer : sans perte de vivre si sa première vague n'avait pas été lancée ; sinon −1 vivre, comme un abandon de bataille (l'expédition note `entamee = id` à `lancerVague` et l'efface au bilan). Décision à confirmer (section 19) : la plus simple, et elle empêche d'« annuler » une vague qui tourne mal en fermant la fenêtre.
- **Import d'une sauvegarde** : l'expédition en cours revient telle quelle.

## 11. Lien avec la campagne, les rivaux, les souverains

- **Partir** : une carte de la grille de la campagne, après « Conseil du royaume » et avant « Arsenal », avec sa touche. « Reprendre l'expédition · semaine 7, gardien » quand une expédition est en cours. Une attaque du domaine en cours n'empêche pas de partir ; elle attend. Une expédition en cours n'empêche pas de jouer la campagne.
- **Jauges, arsenal, remparts** : s'appliquent aux batailles de route par `C.options`. Le conseil du royaume et l'arsenal restent la progression lente ; l'Armorial est la progression « roguelite ». Les deux poussent dans le même sens.
- **Événements du jour** : rejoués sur la route avec leurs gains de campagne (6.2). L'événement du jour de la campagne reste à jouer à part.
- **Rivaux et missives** : avant le grand gardien, le défi du rival du front par `C.missiveAvantBataille(idDeLaProchaineProvinceDuFront)` (une bataille sur deux, « Relever le défi », rien à écrire ; sans province restante sur ce front, pas de lettre) ; après une victoire, `C.reagir(front, "victoire")` et `C.monterRivalite(front, 6)` ; après un retour, rien (une défaite ne fait rien perdre, ni gagner). Les gardiens de semaine sont « un seigneur rival » (médaillon héraldique au tortil, `medaillonHeraldique(camp, true)`), sans missive. Dans la bataille, le mot du rival (`phraseRival`, p.ia.journal) s'affiche sous ce nom, comme aujourd'hui.
- **Souverain** : il change toujours avec les provinces prises ; l'expédition y contribue par ses 3 coups à chaque retour triomphal. Sa phrase de départ est un texte du jeu avec `{nom}` ; une situation `expedition` dans personnages.js (six répliques, contrôle 10) est l'incrément 3.
- **Chronique** : départ, semaine franchie, retour, dans les vingt faits de la campagne.
- **Réglage « Messages des rivaux »** coupé : pas de missive de défi ni de réaction, comme en campagne.

## 12. Génération procédurale et graine

- **Graine** : un entier 32 bits tiré au départ (`(Date.now() ^ (JEU.questions.posees().horloge * 2654435761)) >>> 0`), gardé dans la sauvegarde, affiché au bilan en hexadécimal. Tirage à graine mulberry32 (celui des simulateurs, recopié dans expedition.js, une dizaine de lignes), jamais `Math.random` dans la génération : avec la même graine, on obtient la même route, les mêmes types, les mêmes portes, les mêmes conseillers de porte, les mêmes étals, les mêmes offres de faveurs (dans l'ordre où on les demande).
- **Ce qui n'est pas à graine** : le tirage des questions, qui suit l'état réel de l'élève (Leitner, fenêtre anti-répétition, Seconde chance). Voulu : deux élèves sur la même route n'ont pas les mêmes questions. Le moteur de bataille est déjà sans hasard pour ses décisions.
- **La route est écrite dans la sauvegarde** (moins de 2 Ko), pas recalculée à partir de la graine : une version future du générateur ne change pas une expédition en cours. La graine sert à rejouer dans les simulateurs et à reproduire un défaut signalé par Romain.
- **Algorithme**, en une passe par semaine, dans cet ordre, tout à la graine :
  1. Pour chaque couche, `n = 2` ou `3` (3 une fois sur deux).
  2. Types de haltes selon 6.3, puis les corrections de garanties dans l'ordre fixe.
  3. Portes des escarmouches et embuscades (6.4), conseiller de porte (pondération par familles chargées, à revoir, présentes dans la semaine ; jamais deux fois le même dans la semaine).
  4. Chemins, sans croisement : couches triées de gauche à droite ; la halte `i` de la couche 1 (sur `n1`) mène à la halte `j` de la couche 2 (sur `n2`) quand `|i / (n1 − 1) − j / (n2 − 1)| ≤ 0,5` (une couche d'une seule halte compte 0,5) ; si une halte n'a aucun chemin entrant ou sortant, on la relie à sa voisine la plus proche (à égalité, la gauche) ; si les deux couches ont 2 haltes, une diagonale tirée à la graine s'ajoute pour qu'il y ait un choix. Les chemins ne vont qu'entre haltes voisines dans l'ordre : ils ne se croisent jamais. Le départ mène à toute la couche 1 ; toute la couche 2 mène au gardien.
  5. Événement de chaque halte « événement » (rotation sans répétition dans l'expédition, archives placées selon 6.3), étal du marchand, carte de bataille de la semaine.
- **Exemple** (graine 4F2A-9C01, départ S6 vers l'ouest) : S6 · carte le Gué · 1re couche : [escarmouche · porte : faveur de l'herboriste] [événement : le défi du champion] [bivouac] ; 2e couche : [embuscade · porte : faveur du maître d'œuvre] [marchand] ; chemins 1→1, 1→2, 2→1, 2→2, 3→2 ; gardien S6. S7 et S8 dans la brume (2 couches chacune, gardien en silhouette ; S8 : grand gardien, le roi d'Angleterre). S9 et au-delà : brume, « 6 cours à venir ».

## 13. Sauvegarde : schéma 6 et réglages

Migration 5 → 6 : ajoute `expedition`, vide, complété par `JEU.expedition.completer` (même méthode que `JEU.campagne.completer` : une valeur absente, nulle ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas). Rien n'est retiré. Une sauvegarde du schéma 6 lue par un jeu plus ancien est refusée, comme aujourd'hui.

```js
expedition: {
  renom: 0, renomTotal: 0,                 // disponible ; gagné depuis le début (jamais réduit)
  armorial: { vivres: 0, bourse: 0, murs: 0, banniere: 0 },   // rangs achetés
  franchies: [],                           // semaines dont le gardien a été vaincu une fois (sceaux du parchemin)
  records: { "6": 135 },                   // meilleure renommée par semaine de départ
  historique: [{ le: "2026-10-20", graine: 1329438721, front: "angleterre", depart: 6, arrivee: 8,
                 atteint: { semaine: 7, noeud: "s7g" }, issue: "victoire" | "retour" | "abandon", renom: 135 }],
                                           // vingt au plus, le plus récent d'abord
  enCours: null | {
    graine: 1329438721, front: "angleterre", depart: 6, arrivee: 8,
    route: [{ semaine: 6, carte: "gue",
              couches: [[{ id: "s6c1n1", type: "escarmouche", porte: { genre: "faveur", conseiller: "svt" }, suivants: ["s6c2n1", "s6c2n2"] },
                         { id: "s6c1n2", type: "evenement", ev: "defi", suivants: ["s6c2n1"] }], [ ... ]],
              gardien: { id: "s6g", type: "gardien" } }, ...],
    position: null | "s6c1n1",             // halte en cours ou dernière jouée ; null : au départ de la semaine courante
    semaine: 6,                            // semaine en cours
    faits: { "s6c1n1": "tenu" | "eclatant" | "cede" | "fait" },
    entamee: null | "s6g",                 // bataille de route dont la 1re vague a été lancée et qui n'a pas de bilan
    vivres: 3, vivresMax: 3, or: 0, plan: 0,
    faveurs: { annales: 1, engrenages: 2 },   // rang 1 ou 2
    places: { "s6g": 9 },                  // solidité restante d'un gardien déjà attaqué
    compte: { questions: 0, bonnes: 0, parFamille: {}, parSemaine: {}, renom: 0, fiches: [] }   // fiches : ratées, pour « À relire »
  }
}
```

- Taille : moins de 2 Ko pour une expédition en cours, 2 Ko d'historique.
- docs/FORMAT_DONNEES.md : section « Sauvegarde », schéma 6, et le bloc `expedition` de config.js ci-dessous. atelier/outils/tests.js : migration 1 → 6 sans perte, `completer` sur une expédition abîmée.
- Réglages, dans jeu/data/config.js (lus par `JEU.expedition`, valeurs par défaut si absents, pour que Romain les touche sans code) :

```js
  expedition: { semaines: 3, couches: 2, vivres: 3, questionsSemaine: 2, difficulte: 0 }
```

`difficulte` s'ajoute au niveau du rival de chaque bataille de route (−1 : tout un cran plus facile ; +1 : plus dur), borné à [0, 4].

## 14. Interface et direction artistique

### 14.1 L'écran « La route » (`JEU.ui.ecrans.expedition`, jeu/js/ecran-expedition.js)

Une section `#ecran-expedition` de plus dans index.html (le menu ne change pas : on y entre par la campagne, on en sort par Échap ou « Retour à la campagne »).

- **Parchemin d'itinéraire** : un SVG de 1000 × 320 (unités logiques), dans le même cadre à bordure de parchemin que la carte de campagne, qui tient entier en 1366 × 768 avec les cartouches du bas (contrôle perf.js, comme pour la carte). Une semaine = une bande de 300 px : une **lettrine rubriquée** « S6 » (Cinzel, #8c2f39, filets d'or), le libellé des dates dessous en 14 px, deux colonnes de médaillons, puis le gardien dans un **médaillon héraldique** (`JEU.ecranCampagne.medaillonHeraldique(camp, true)` au tortil pour un gardien de semaine ; `medaillon(rivalDe(front), 60)` pour le grand gardien : portrait s'il en a un, sinon la silhouette couronnée sur les armes du camp). Les 100 premiers pixels : le départ (un petit bourg de France, `lieu-france`, avec la bannière au lys).
- **Médaillons de haltes** : 52 px, cerclage d'or sur encre comme les médaillons de repli de la carte de campagne, icône Game-icons du type, la porte en petit écusson (médaillon du conseiller à 22 px, bourse, parchemin) en bas à droite. États : à venir (encre), atteignable (halo d'or, le même anneau que la province « cible » de la campagne), jouée (un **sceau de cire** posé dessus : `sceau("joueur")` réduit, vert-de-gris pour tenue, plomb #4a4e57 pour murs cédés, comme le sceau de l'or perdu), hors chemin (estompée à 35 %). Chemins en pointillés d'encre comme `route()` de la carte de campagne ; le chemin parcouru en trait plein doré.
- **Brume** : les nappes `lieu-brume` existantes (sprites.js) sur les couches des semaines suivantes et sur tout ce qui dépasse la frontière, avec le voile désaturé de `voileBrume` ; au-delà de la frontière, le numéro de semaine et « n cours à venir » en gris. La bannière « Cette semaine » (calendrier) est plantée sur la semaine du jour.
- **Sous la carte**, deux cartouches dans le style de « Ton royaume » : **Ta compagnie** (vivres en sacs, or de route, faveurs en médaillons de conseillers avec leur rang et leur effet au survol et dans une liste au clavier, renommée de l'expédition, graine) ; **Journal de route** (les dix derniers faits de l'expédition). Boutons : « Entrer dans la halte (Entrée) », « Faveurs (F) », « Abandonner l'expédition ».
- **Fenêtres** (famille des missives : sceau de cire, médaillon, mêmes raccourcis) : l'écran de départ (avec le parchemin de l'année : 34 cases en rang, scellées pour les semaines franchies, frontière marquée, brume au-delà, bannière « Cette semaine »), la page de semaine, la porte de faveur (question puis cartes de faveurs), le bivouac, le marchand, l'Armorial, le bilan.
- **Palette et polices** : celles du jeu (fond #efe6d2, encre #2e2419, or #b08d3a, rubrique #8c2f39, une teinte par matière sur les médaillons des conseillers), Cinzel pour les titres, Crimson Text pour les textes. Rien de nouveau dans jeu/assets pour le MVP. Incrément 3 : un fond de parchemin de route rendu par les scripts Blender de l'atelier, avec repli vectoriel si l'image manque, comme la carte de campagne.
- **Références** : les cartes d'itinéraire médiévales (route horizontale à stations, vignettes de villes), la carte de campagne de Medieval Total War pour les silhouettes de camps, l'enluminure pour les lettrines.
- Animations de moins de 400 ms (le sceau qui se pose, le halo qui glisse à la halte suivante), aucune entre une réponse et la question suivante, aucun clignotement ; coupées avec « Animations ».

### 14.2 Clavier et accessibilité

- Sur la carte : 1, 2, 3 choisissent une halte atteignable (numéros affichés sur les médaillons, comme les touches de la grille de la campagne), ← → aussi, Entrée entre, F ouvre la liste des faveurs, Échap revient à la campagne (expédition enregistrée). Les haltes atteignables ont `tabindex="0"` et un `aria-label` complet : « Semaine 6, 2e couche : embuscade, récompense : faveur du maître d'œuvre ».
- Porte de faveur, bivouac, marchand, Armorial : touches 1 à 4, Entrée pour valider, Échap pour fermer ce qui peut l'être (jamais une porte : on choisit toujours).
- Rien ne repose sur la couleur seule (sceau + mot « tenue » / « murs cédés » dans le journal de route et l'infobulle) ; textes de 14 px au moins sur la carte, questions à 18 px comme partout ; focus visible.

### 14.3 Performance

- Génération : une fois, au départ (quelques centaines d'opérations). La carte : un SVG d'une trentaine de nœuds et d'une quarantaine de chemins, redessiné à chaque retour sur l'écran (quelques ms).
- Faveurs et Armorial : résolus en options avant `M.creer`. Rien dans la boucle du moteur ni du rendu.
- Entre une réponse et la question suivante : rien de nouveau. Le lot d'une vague est tiré au début de la vague ; le quota ajoute un appel à `tirage()` (cible : médiane sous 3 ms hors bac à sable, 10 ms au plus, mesurée par mesurer-tirage.js).
- perf.js : les mêmes mesures (JEU.mesure et Event Timing) pendant une escarmouche et un gardien de route.

## 15. Ce qu'il faut changer dans le code

Toutes les accroches sont des ajouts facultatifs : sans `contexte`, sans `quota`, sans paramètre, chaque fonction fait exactement ce qu'elle fait aujourd'hui. À livrer après les chantiers en cours sur bataille.js, recit.js et personnages.js, et à vérifier par `simuler-bataille.js --comparer` (les batailles de campagne ne bougent pas d'un coup).

| Fichier | Changement |
|---|---|
| `jeu/js/expedition.js` (nouveau, sans DOM, chargé après campagne.js, testé sous Node) | Constantes (`EXP` : tables de 6.3, 6.4, 8.2, 9.x), tirage à graine, `semaineDe`, `frontiere()`, `generer(graine, depart, arrivee, front)`, `commencer(depart, front)`, `atteignables()`, `entrer(id)`, `optionsBataille(halte)` (niveau de la semaine, mode, pvRival, faveurs, Armorial, config.difficulte), `apresBataille(halte, bilan)` (vivres, portes, renommée, places, `c.bonus = {}`), `offrirFaveurs(conseiller, juste, eclatant)`, `prendreFaveur(id)`, `bivouac(choix)`, `acheter(ligne)`, `renom(source, semaine)`, `finir(issue)`, `armorial.acheter(quartier)`, `completer`, `etat()`. Exposé dans `JEU.expedition`. |
| `jeu/js/ecran-expedition.js` (nouveau) | La carte-itinéraire, l'écran de départ et le parchemin de l'année, la page de semaine, les fenêtres (porte, bivouac, marchand, Armorial), le bilan, la reprise. |
| `jeu/js/bataille.js` | `lancer(lieu, contexte)` : avec un `contexte` ({ carte, titre, front, camp, niveau, vagues, defense, pvRival, pvRivalMax, options (fusionnées sur `C.options`), semaine, tirage(n, posees) → questions, cadre(q) → cadre du récit, nomRival, rivalPerso, eclaireurs, sansFiche, surFin(bilan), surQuitter(entamee), retour() }), la bataille ne touche pas la campagne (`C.apresBataille` n'est pas appelé) et rend son bilan à `JEU.expedition` ; `lancerVague` prévient `contexte.surVague()` (pour `entamee`) ; le retour va à l'écran de la route. Une vingtaine de lignes, toutes sous `if (contexte)`. |
| `jeu/js/recit.js` | `suite(nombre, options)` : option `quota` (7.1). `cadre(q, contexte, camp, extra)` : contextes `route`, `gardien`, `bivouac`, `marchand`, `archives`, `porte` ; `r.semaine`. |
| `jeu/js/interface.js` | `ui.recit` affiche `r.semaine` ; `panneauErreur(q, zone, suite, options)` avec `options.sansFiche`. |
| `jeu/js/campagne.js` | `jouerEvenement(ev, contexte)` (6.2). Rien d'autre : rivalité, missives, chronique se font par les fonctions déjà exportées. |
| `jeu/js/ecran-campagne.js` | La carte « Partir en expédition / Reprendre » dans la grille, avec sa touche. |
| `jeu/js/sauvegarde.js` | `SCHEMA = 6`, migration 5 → 6, `nouvelle()` avec `expedition`. |
| `jeu/js/progression.js` | `semaineDe(coursId)` si le chantier « semaine visible » ne l'a pas déjà mise là. |
| `jeu/index.html` | `#ecran-expedition`, les deux scripts (après ecran-campagne.js), `JEU.version`. |
| `jeu/css/jeu.css` | Styles de la carte-itinéraire (médaillons, sceaux, lettrines), des cartes de faveurs, de l'Armorial, du parchemin de l'année. |
| `jeu/data/config.js` | Bloc `expedition` facultatif. |
| `atelier/outils/tests.js`, `simuler-bataille.js`, `mesurer-tirage.js`, `perf.js` | Section 17. |
| `docs/CAHIER_DES_CHARGES.md` (section 5 : « Les expéditions »), `docs/FORMAT_DONNEES.md`, `docs/JOURNAL.md`, `jeu/VERSION.txt` | Spécification, schéma 6, décisions, version. |

Esquisses des trois accroches, pour fixer la taille :

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
// expedition.js, optionsBataille(halte) : tout par des options que M.creer lit déjà
var e = etat().enCours, s = e.semaine, niv = borne(niveauSemaine(s) + (halte.elite ? 1 : 0) + cfg.difficulte, 0, 4);
var o = JEU.campagne.options(niv);
o.vagues = halte.vagues; o.defense = halte.defense; o.pvRival = places[halte.id] || halte.place; o.pvRivalMax = halte.place;
o.orDepart = Math.min(180, o.orDepart + 10 * arm.bourse + 20 * rang("chant") + e.plan); e.plan = 0;
o.pvChateau += 2 * arm.murs;
o.bonusDegats = Math.min(0.6, o.bonusDegats + 0.1 * rang("engrenages"));
o.orParReponse += 3 * rang("annales");
o.pvRival = Math.max(4, o.pvRival - 2 * rang("parlementaire"));
o.espion = o.espion || rang("eclaireurs") > 0;
if (rang("onguents")) { o.arsenal = { tours: o.arsenal.tours, troupes: {} }; Object.keys(c.arsenal.troupes).forEach(function (t) { o.arsenal.troupes[t] = c.arsenal.troupes[t] ? Math.min(3, c.arsenal.troupes[t] + rang("onguents")) : 0; }); }
if (typeof cfg.orPerduErreur === "number") o.orPerduErreur = cfg.orPerduErreur;
return o;
```

```js
// bataille.js, les points sous « if (contexte) » : niveau, vagues, carte, options, titre et nom du rival viennent du
// contexte ; tirerQuestions passe par contexte.tirage ; le cadre par contexte.cadre(q) ; lancerVague() appelle
// contexte.surVague() ; bilan() appelle contexte.surFin(b) au lieu de C.apresBataille(b) ; surQuitter appelle
// contexte.surQuitter(entamee) ; retour() appelle contexte.retour().
```

## 16. Plan de construction : le MVP en quatre jours, puis deux incréments

### Jour 1 : le cœur, sans écran

1. `expedition.js` : tables, tirage à graine, `semaineDe`, `frontiere`, `generer` (12), état et `completer`, vivres, or de route, renommée, Armorial, `finir`. Schéma 6 et migration. `config.expedition`.
2. tests.js : génération (200 graines), frontière, semaine d'un cours, vivres, renommée, migration, `completer`, Armorial (section 17.1).

### Jour 2 : les accroches et le tirage

3. `recit.js` : `quota`, nouveaux cadres ; `interface.js` : `r.semaine`, `sansFiche` ; `campagne.js` : `jouerEvenement(ev, contexte)` ; `bataille.js` : `contexte`.
4. `optionsBataille`, `apresBataille`, faveurs, portes ; tests du quota et des options ; `mesurer-tirage.js --expedition` ; `simuler-bataille.js --expedition` (première mesure des escarmouches et des gardiens, section 17.2).

### Jour 3 : l'écran

5. `ecran-expedition.js` et CSS : carte-itinéraire, écran de départ avec parchemin de l'année et Armorial, page de semaine, porte de faveur, bivouac, marchand, bilan, reprise ; carte « Partir / Reprendre » dans la campagne ; clavier.

### Jour 4 : réglage et livraison

6. Réglage au simulateur (17.2 et 17.4), perf.js (parcours complet, 17.5), cahier des charges, format, journal (décisions de la section 2), version 0.9.0, les cinq vérifications pour Romain (section 18), commit.

**Livrable** : une expédition de une à trois semaines, choisie au départ, sauvegardée et reprise, avec défaite et victoire, six faveurs, renommée et quatre quartiers d'Armorial. Volume estimé : 900 lignes de JavaScript (expedition.js 350, ecran-expedition.js 450, accroches 100), 250 de CSS, 45 tests. Avec les cours d'aujourd'hui, elle se joue sur S1 → S3 ; elle s'ouvre toute seule sur S6 → S8 dès que les semaines 4 à 8 sont livrées (la frontière suit index-cours.js).

### Incrément 2 : la profondeur (trois à quatre jours)

- Option `faveurs` et `rivalRegle` du moteur (toutes facultatives, mêmes résultats sans elles, vérifiés graine pour graine) : les 12 autres faveurs (portée, vitesse, cadence des engins, revenu, coup d'éclat, Ballade consolante, mercenaires…), les rangs rares, les six duos, la table du rival interpolée par semaine, les modificateurs d'élite des embuscades.
- 3e couche (réglage), haltes trésor et archives du prieuré, étal complet du marchand, Armorial complet, titres, Chronique des expéditions dans le Codex.
- `simuler-expedition.js` : des expéditions entières jouées par l'élève scripté (17.4), pour régler vivres, solidités et table.

### Incrément 3 : le récit et la finition (deux à trois jours)

- Situations `expedition` (souverain), `gardien` et `deroute` (rivaux) dans personnages.js, six répliques chacune, contrôle 10 ; la page de semaine illustrée ; le fond de parchemin de route rendu en 3D ; deux sons (sac de vivres, sceau de halte) ; les Serments (difficulté facultative, +10 % de renommée par point, jamais sur les questions) ; le défi de la semaine (graine commune à toute la semaine du calendrier, record à battre).

## 17. Tests et mesures

### 17.1 tests.js (logique, Node ; ajout de expedition.js à la liste des modules chargés)

- Génération : pour 200 graines, 2 couches par semaine, 2 ou 3 haltes par couche, chemins sans croisement (pour tout chemin i→j et i'→j', pas de i < i' avec j > j'), toute halte atteignable depuis le départ et reliée au gardien, garanties de 6.3 (une escarmouche en 1re couche, un marchand en 2e, au plus une embuscade, un bivouac par semaine, une halte archives par expédition), mêmes résultats pour la même graine, résultats différents pour deux graines, aucun appel à `Math.random` (remplacé par une fonction qui lève une erreur pendant `generer`).
- Frontière et départ : avec les cours chargés d'aujourd'hui, frontière = 3, départ par défaut = 1, arrivée = 3 ; avec un cours de S8 ajouté à la main, frontière = 8, défaut 6 → 8 ; départ = frontière : une semaine ; sans aucun cours, pas d'expédition.
- Semaine d'un cours : `histoire-s03-1` → 3 ; `langue-conj10`, `methode-frise`, `anglais-seq01` → null.
- Vivres : jamais sous zéro ; une question ratée n'en retire jamais (le compte des vivres ne bouge pas quand `enregistrerReponse` est appelé 50 fois en faux) ; un retour à zéro vivre finit l'expédition avec la renommée acquise ; quitter avant la première vague ne coûte rien, après coûte un vivre.
- Renommée : ne baisse jamais, même après un retour ; un achat d'Armorial retire du disponible, pas du total ; la Bannière s'applique au total de l'expédition ; les barèmes de 9.4 (gardien S3 = 13, grand gardien S8 = 31).
- Options de bataille : `optionsBataille` pour chaque faveur et chaque quartier change la bonne option et respecte son plafond ; sans faveur ni Armorial, les options sont exactement celles de `C.options(niveau)` plus vagues, défense et solidités ; niveau de S1 = 0, S8 = 3, grand gardien S8 = 4, `difficulte: −1` ramène S8 à 2 ; `c.bonus` vidé après une bataille de route.
- Après bataille : tenu, éclatante (pvRival à 0), cédé (−1 vivre), porte simple ou doublée, or de route, renommée, `places` gardé entre deux tentatives d'un gardien, semaine franchie une fois pour toutes, retour triomphal : +3 coups à la prochaine place forte du front, rivalité +6, rien d'autre de la campagne ne change (copie profonde de `campagne` avant et après, hors `provinces[cible].pv`, `rivalite` et `chronique`).
- Sauvegarde : migration 1 → 6 sans perte (toutes les clés du schéma 5 inchangées) ; `completer` répare une expédition en cours abîmée (position inconnue → départ de la semaine courante, faveur inconnue retirée, vivres non numériques → 3, route illisible → expédition close avec sa renommée) ; import d'une sauvegarde avec expédition en cours.
- Tirage : `suite(3, { quota })` donne 2 questions de la semaine 1 et 1 autre quand c'est possible ; 3 d'autres semaines quand la semaine n'a pas de cours ; `quota.nombre: 3` et filtre « semaine < 2 » donne 3 questions de S1 ; une Seconde chance due est placée une seule fois ; les 60 dernières questions ne ressortent pas ; sans `quota`, le résultat est identique à aujourd'hui pour une même graine et une même sauvegarde (régression).
- Récit : chaque phrase de route a `{N}` ; celles qui ont `{S}` reçoivent la semaine ; aucun texte de faveur, de halte, de page de semaine ou de bilan ne contient un chiffre de cours, un mot de religion ou une insulte (la liste du contrôle 10 de controles.js, importée).

### 17.2 simuler-bataille.js : les batailles de route

Ajout, à côté des provinces : `--expedition` joue les quatre nœuds de bataille avec les options exactes de `JEU.expedition.optionsBataille` (expedition.js chargé dans le simulateur, après campagne.js), pour les semaines `--semaines 1,3,5,8` (défaut), les justesses `--p 0.6,0.7,0.8,0.9`, 80 graines, l'arsenal supposé de `PROGRESSION[niveau]`, et facultativement `--armorial complet` et `--faveurs annales:2,engrenages:1`.

```
node atelier/outils/simuler-bataille.js --expedition --semaines 1,3,5,8 --p 0.6,0.7,0.8,0.9 [--armorial complet] [--faveurs engrenages:1]
```

Sorties par semaine, nœud et justesse : escarmouche et embuscade (tenue %, éclatante %, coups portés), gardien et grand gardien (tenue % dont victoire, murs restants, batailles pour vaincre quand on retente). Et toujours `--comparer avant.json` sur les provinces : **aucun écart** sur les batailles de campagne.

Cibles de départ (à ajuster avec Romain après quelques expéditions réelles) :

| Mesure, p = 0,7 | S1 → S3 | S6 → S8 | p = 0,9 | p = 0,6 |
|---|---|---|---|---|
| Escarmouche tenue | ≥ 92 % | ≥ 85 % | ≥ 98 % | ≥ 75 % |
| Escarmouche éclatante | 30 à 50 % | 20 à 40 % | ≥ 60 % | ≥ 15 % |
| Gardien vaincu, 1re tentative | 72 à 82 % (mesuré en défense aujourd'hui : 73 à 81 %) | 65 à 78 % | ≥ 94 % | 55 à 65 % |
| Grand gardien vaincu, 1re tentative | 60 à 70 % | 50 à 62 % | ≥ 88 % | ≥ 40 % |

Leviers, dans l'ordre où le journal du 16/10/2026 les a classés : solidité des camps de route (8, 10, 12, 16), nombre de vagues, `difficulte`, et seulement ensuite la table `RIVAL` (jamais dans le MVP : elle est partagée avec la campagne). Attention aux paliers de flèches (1,534 ; 1,725) : un changement de niveau change tout d'un coup, d'où le simulateur avant tout réglage.

### 17.3 mesurer-tirage.js : la part de la semaine

`--expedition` : des expéditions simulées sur six séances (lots de 3 avec quota de semaine, événements de 3, portes de 1 sur la famille, archives de 3 avant le départ), par les trois élèves simulés du 15/10/2026, départ S1 puis S6 avec les cours des semaines 4 à 8 quand ils seront là :

- part des questions de la semaine traversée : **≥ 60 %** quand la semaine a au moins 3 cours chargés (cible 2 sur 3 : 67 %) ;
- part de chaque famille présente sur l'expédition : 12 à 30 % ;
- notions à revoir : au moins 1,5 fois leur part, jamais plus de 2 fois ;
- aucune question reposée à moins de 60 questions hors Seconde chance, aucune notion deux fois en 10 questions ;
- réussite inchangée (≈ 73 % pour l'élève moyen) ;
- durée du tirage avec quota : médiane < 3 ms hors bac à sable, maximum < 10 ms.

### 17.4 La réussite d'une expédition entière

Dans le MVP, par le calcul à partir de 17.2 : avec 3 vivres, trois escarmouches (murs cédés 8 %), deux gardiens (22 %) et un grand gardien (35 %) qui se retentent, la probabilité de perdre trois batailles avant la fin est d'environ 12 % à p = 0,7 : **≈ 85 % d'expéditions S1 → S3 complètes** ; S6 → S8 (gardiens 30 %, grand gardien 45 %) ≈ 70 %. C'est plus doux que Hadès, voulu pour « pas trop d'échecs » : la tension vient du gardien à retenter, des portes doublées et du choix de profondeur, et les premières défaites arrivent quand l'élève part plus loin. Cibles : S1 → S3 : 75 à 85 % sans Armorial, ≥ 90 % avec ; S6 → S8 : 55 à 70 % sans, ≥ 80 % avec ; à p = 0,6 : ≥ 60 % et ≥ 40 %. Si les expéditions réelles sont trop faciles, le premier levier est `vivres: 2` (la probabilité tombe d'un tiers) ; trop dures, `difficulte: −1`. L'incrément 2 remplace ce calcul par `simuler-expedition.js` (le joueur scripté qui parcourt une route à graine, prend les faveurs au hasard, achète un vivre au marchand quand il lui en reste un).

### 17.5 perf.js (bout en bout, Chromium)

Départ d'une expédition depuis la campagne (touche de la carte de jeu) ; carte entière visible en 1366 × 768 avec ses cartouches, noms et étiquettes de 14 px au moins, aucun médaillon ni nom qui se touche ; navigation au clavier (1, 2, Entrée) ; escarmouche jouée (toile jamais réallouée, toujours < 100 ms entre une réponse et la question suivante, JEU.mesure et Event Timing, pastille de semaine présente sur deux questions sur trois) ; porte de faveur : question puis choix au clavier ; Échap au milieu de la route puis « Reprendre » : même position, mêmes vivres, mêmes faveurs ; défaite forcée (vivres mis à 1 par la console, bataille quittée après la 1re vague) : bilan avec renommée > 0, campagne intacte (provinces, ressources, jauges, arsenal identiques avant et après, à l'exception des ressources gagnées par bonne réponse) ; export puis import : l'expédition en cours revient ; « Sang dans les combats » et « Animations » coupés : aucune erreur JavaScript sur la carte de route.

### 17.6 Validateur

Rien de nouveau dans jeu/data/cours : le validateur ne change pas, sauf le même numéro dans VERSION.txt et JEU.version. Les textes de l'expédition (phrases de cadre, faveurs, pages de semaine, bilan) vivent dans expedition.js : tests.js les passe à la liste du contrôle 10 (chiffres, religion, insultes).

## 18. Les cinq vérifications pour Romain (à la livraison)

1. Campagne → « Partir en expédition » : tu vois le parchemin de l'année avec la frontière (S3 aujourd'hui), la semaine du calendrier en bannière dans la brume, le choix de la semaine de départ, le front, l'Armorial à 0 ; « Partir » ouvre la page « Semaine 1 » avec les titres de ses cours.
2. Sur la route : deux haltes au choix avec leur porte, le gardien à droite, les semaines 2 et 3 dans la brume ; la touche 1 entre dans la première halte ; en bataille, deux questions sur trois portent la pastille « Semaine 1 », la troisième une autre semaine ou « Fiche méthode ».
3. Après l'escarmouche : le conseiller de la porte pose une question de sa matière, puis trois faveurs au choix (deux si tu te trompes) ; la faveur choisie apparaît dans « Ta compagnie » ; le sceau se pose sur la halte.
4. Échap sur la route, retour à la campagne : la carte dit « Reprendre l'expédition · semaine 1, 2e couche » ; Réglages → Exporter, puis Importer le même fichier : l'expédition reprend au même point, mêmes vivres, mêmes faveurs.
5. Perds exprès le gardien deux fois de suite (ne pose rien) : vivres 3 → 1, le gardien se retente avec les coups déjà portés ; perds une troisième fois : le bilan montre la renommée gagnée (plus que zéro), « À relire », et la campagne n'a rien perdu (mêmes provinces, mêmes ressources, mêmes jauges). Puis « Repartir » : l'Armorial propose la Bourse du voyageur à 30.

## 19. Risques et questions pour Romain

1. **Départ libre, défaut sur les trois dernières semaines** (plutôt que des relais à débloquer, ou toujours la semaine 1 comme dans Hadès) : d'accord ? C'est le choix qui révise le mieux ce que ton fils travaille en ce moment.
2. **Longueur** : trois semaines, 25 à 35 minutes à vitesse ×1. Préfères-tu deux semaines par défaut (18 à 25 minutes), avec trois au choix ?
3. **Vivres** : une bataille où les murs cèdent coûte un vivre (trois au départ) ; c'est la seule chose qu'on « perd », et seulement dans l'expédition. Le calcul vise ≈ 85 % d'expéditions S1 → S3 réussies à 7 sur 10 au début, plus dur en partant plus loin. Trop doux ? Trop dur ? `vivres` et `difficulte` dans config.js se changent sans code.
4. **Fermer le jeu au milieu d'une bataille de route** après la première vague : compté comme une retraite (−1 vivre), comme un abandon volontaire ? Proposé : oui, pour qu'on ne puisse pas annuler une vague qui tourne mal en fermant la fenêtre.
5. **Or de route perdu au retour** : clair pour un élève de 13 ans si le jeu le dit avant le grand gardien ? Autre solution : le changer en ressources du domaine (1 pour 10) au bilan.
6. **Noms** : « Expédition », « halte », « gardien », « grand gardien », « faveur », « renommée », « Armorial », « vivres », « or de route ». Tous changeables avant le code (les identifiants internes ne porteront pas ces mots).
7. **Risque de réglage** : la difficulté des batailles compte par paliers (flèches par soldat) ; le MVP ne touche pas à la table du rival et joue sur les solidités et les vagues, mesurées au simulateur ; il faudra deux ou trois expéditions réelles pour ajuster. `difficulte` dans config.js est là pour ça.
8. **Risque de collision** avec les chantiers en cours (bataille.js, recit.js, personnages.js, cours des semaines 4 à 8) : toutes les accroches sont des ajouts sous condition ; à livrer après ces chantiers, en comparant les batailles de campagne graine pour graine avant et après.
9. **Semaine 7** : elle n'a que trois cours au planning (géographie, lecture, histoire). Dans une expédition S6 → S8, les questions de sa semaine seront moins nombreuses que les autres : le tirage complète avec le reste ; voulu, mais à savoir.

## Annexe A : les nombres en une page

| Quoi | Valeur de départ (MVP) |
|---|---|
| Semaines par expédition | 3 au plus (config `semaines`) ; départ libre, défaut frontière − 2 |
| Couches par semaine / haltes par couche / nœuds joués par semaine | 2 / 2 ou 3 / 3 (2 haltes + gardien) |
| Vivres au départ / maximum | 3 / 5 (Armorial : 4, 5) |
| Questions : escarmouche, embuscade, événement, marchand, bivouac, gardien, grand gardien | 6, 6, 2 à 3, 1, 1, 6, 9 ; ≈ 45 par expédition |
| Part des questions de la semaine traversée | 2 sur 3 (`questionsSemaine`), le reste au tirage ordinaire |
| Niveau du rival | (semaine − 1) div 2, plafond 4, + `difficulte` ; embuscade et grand gardien + 1 |
| Vagues : escarmouche, embuscade, gardien, grand gardien | 2, 2, 2 (défense), 3 (défense) |
| Solidité des camps de route | 8, 10, 12, 16 |
| Portes : faveur / bourse / parchemin | 60 / 25 / 15 % (embuscade : faveur toujours) |
| Faveurs : conseillers / faveurs / rangs | 6 / 6 / 2 |
| Or de route : halte tenue, éclatante, bourse, bivouac ; marchand : faveur, vivre, plan | 15, +10, 20, 20 ; 40, 35, 15 (−20 % si la question d'ouverture est juste) |
| Renommée : réponse, halte tenue, halte légère, gardien, grand gardien, expédition | 1 ; 5 ; 3 ; 10 + S ; 15 + 2S ; +10 |
| Armorial | 4 quartiers, 810 points en tout, premier achat à 30 |
| Retour triomphal, lien campagne | +3 coups à la prochaine place forte du front, rivalité +6, 8 ressources de la meilleure matière |
| Durée visée | 25 à 35 minutes (×1), 20 à 25 (×2) ; une semaine seule : 10 à 12 ; reprise après chaque nœud |
| Réussite visée (p = 0,7, sans Armorial) | S1 → S3 : 75 à 85 % ; S6 → S8 : 55 à 70 % |
| Volume de code | ≈ 900 lignes JS, 250 CSS, 45 tests ; aucun changement du moteur de bataille |

## Annexe B : une expédition type, S6 → S8 vers l'ouest, racontée

Le souverain confie la route. Page « Semaine 6 · du 5 au 11 octobre 2026 » : les titres des six cours de la semaine. Sur le parchemin, trois haltes à gauche : une escarmouche au Gué avec la porte de l'herboriste, le défi du champion, un bivouac. L'élève prend l'escarmouche : deux vagues, six questions dont quatre de la semaine 6 (physique, SVT, littérature, histoire) et deux d'ailleurs (une géographie de la semaine 2 à revoir, une conjugaison du Griffon de cuivre). Le camp tombe à la deuxième vague : éclatante. L'herboriste pose une question de SVT de la semaine 6 ; juste : quatre faveurs au choix, il prend les Onguents. Deuxième couche : l'embuscade (niveau 3) avec la porte du maître d'œuvre, ou le marchand. Il prend le marchand, répond juste, achète un plan de bataille (12 or après remise) et garde le reste. Gardien de la semaine 6 : défense, deux vagues, niveau 2 ; les murs tiennent de peu. Semaine franchie, sceau sur le parchemin de l'année, +16 renommée. Page « Semaine 7 ». Et ainsi de suite jusqu'au roi d'Angleterre, trois vagues au niveau 4, qui envoie d'abord une lettre de défi. S'il cède deux fois, l'élève rentre avec ses 90 points de renommée, achète la Bourse du voyageur et les Murs chaulés, et repart le lendemain, un peu plus fort, sur la même route ou une autre.
