# Expéditions : un mode roguelite à la Hadès sur la carte de campagne

Document de conception, 20 octobre 2026. Rien de ce document n'est encore codé : il décrit ce qu'on construit, avec des nombres de départ à régler au simulateur, et dans quel ordre. Il répond à deux demandes de Romain du 16 octobre 2026 :

- « le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie » ;
- « intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles ».

Angle retenu : le plus proche de Hadès. Les dieux deviennent les six conseillers du domaine (un par famille de matières), leurs dons deviennent des **faveurs** à rareté et à synergies, le Miroir de la Nuit devient **l'Armorial** (améliorations permanentes achetées avec la **renommée**), le Pacte du Châtiment devient les **Serments** (difficulté facultative ouverte après la première victoire sur un Grand Gardien), et la route de Tartare en Élysée devient **la route des semaines** : chaque semaine du programme est un acte, avec son gardien.

## 1. En deux mots

Une **expédition** est une partie à part, de 20 à 40 minutes, qu'on lance depuis la carte de campagne. Le joueur part d'un **relais** (une semaine du programme) et traverse **trois semaines** de suite, une par acte. Chaque semaine est une petite carte à embranchements : trois **haltes** au choix (escarmouche, embuscade, événement, marchand, bivouac, trésor, archives) puis le **Gardien de la semaine**. Le dernier acte se termine par le **Grand Gardien**, le rival du front, en personne.

- Chaque halte pose des questions par le tirage habituel du jeu, avec une règle de plus : deux questions sur trois viennent des cours de la semaine traversée, la troisième vient du tirage ordinaire (toutes semaines, équilibre des matières, priorités « à revoir », Seconde chance). On voit donc les semaines défiler, et les anciennes reviennent quand même.
- Les réponses paient tout : l'or de la bataille comme aujourd'hui, l'or de route, et le droit de choisir une faveur.
- Les **faveurs** ne durent que l'expédition. La **renommée** reste pour toujours : elle paie l'Armorial, qui rend chaque expédition suivante un peu plus facile. La défaite (plus de vivres) renvoie au domaine avec la renommée gagnée : rien n'est jamais retiré au royaume, ni province, ni bâtiment, ni ressource, ni jauge.
- La difficulté monte avec la semaine traversée (le réglage du seigneur rival suit la semaine, comme il suit aujourd'hui le niveau de la province), et le joueur choisit de partir plus loin quand il a franchi les semaines d'avant.

## 2. Ce que les règles imposent, et ce que j'ai tranché

Les règles fermes de CLAUDE.md et du cahier des charges s'appliquent telles quelles. Ce qu'elles donnent pour ce mode :

| Règle | Dans les expéditions |
|---|---|
| Jamais de chrono | Aucun compte à rebours, aucune horloge affichée. La route n'a pas de « temps restant », seulement des « haltes restantes ». |
| Difficulté réglée pour 7 réussites sur 10 | Le tirage des niveaux de questions ne change pas (niveau conseillé, batailles 1 à 3, événements 1 et 2). La difficulté du mode porte sur la bataille (réglage du rival par semaine), jamais sur les questions. Cibles de réussite d'une expédition : section 15. |
| Une erreur ne coûte ni bâtiment, ni province, ni ressource du royaume | Une réponse fausse coûte au plus 6 or de la bataille en cours, comme aujourd'hui. Les **vivres** sont une ressource de l'expédition, créée au départ et rendue au retour : une bataille perdue (murs cédés) en coûte un ; une question ratée, jamais. Rien du royaume ne baisse. |
| Seconde chance | Inchangée : la file des rappels traverse les haltes comme elle traverse aujourd'hui batailles, conseils et événements. |
| Un cours s'ouvre dès que son fichier existe, le calendrier ne bloque rien | **Frontière** de la route : la dernière semaine qui a au moins un fichier de cours. La semaine du calendrier est affichée (bannière « Cette semaine ») mais ne verrouille rien. La demande dit « la semaine scolaire en cours est la frontière » : en pratique les deux coïncident, puisque Romain dépose les cours au fil de l'année ; si un cours est déposé en avance, la route s'ouvre en avance, comme le reste du jeu. À confirmer par Romain (section 16). |
| Un cours pas encore ouvert reste dans la brume | Les semaines au-delà de la frontière sont des nappes de brume : numéro de la semaine et titres des cours à venir (ils sont déjà dans l'écran Cours), aucune question, aucun aperçu. |
| Chaque question est posée dans le récit | Nouvelles phrases de cadre pour la route (section 5.4), avec la semaine dite par le conseiller. L'énoncé ne change pas. |
| Style Total War, enluminure, héraldique | Carte-itinéraire sur parchemin à la manière de la Table de Peutinger et des cartes d'itinéraire de Matthew Paris : une longue route horizontale, des vignettes d'étapes, des initiales rubriquées pour les semaines (section 12). |
| Conflits : camps politiques, ton neutre | Le Gardien d'une semaine est « le capitaine anglais » ou « le capitaine omeyyade » ; le Grand Gardien est le rival du front, en titre seul s'il n'a pas de nom (personnages.js). Aucune figure religieuse, aucun nom inventé. |
| Bonus jamais en bataille ni en boss | Le tirage les exclut déjà. |
| Pas d'épreuve de validation | Un gardien vaincu ne change ni suivi.js ni l'état d'un cours. Il n'ouvre rien d'autre que le relais suivant de la route. |
| Moins de 100 ms entre une réponse et la question suivante | Les faveurs sont appliquées une fois, à la création de la bataille (options du moteur) ; aucune n'ajoute de travail entre deux questions. Le tirage avec quota de semaine coûte un passage de plus de `tirage()` (quelques ms), au début d'une vague ou d'une halte, jamais entre deux questions. |

Décisions prises faute d'arbitrage dans le cahier des charges (à reporter dans docs/JOURNAL.md, rubrique Décisions, à la livraison) :

1. **Une expédition = 3 semaines** (2 ou 1 si la frontière est plus proche), pour tenir 20 à 40 minutes. La demande « jusqu'à la semaine 8 » donne aujourd'hui trois tronçons : S1-S3, S4-S6, S7-S8 (S9 quand ses cours seront là).
2. **Les relais** (semaines où une expédition peut partir) sont la semaine 1 et chaque semaine qui suit une semaine franchie (Grand Gardien vaincu). On ne repart pas toujours de la semaine 1 comme dans Hadès : Romain veut voir les semaines défiler, et partir plus loin est la récompense naturelle. Les semaines anciennes reviennent quand même par la troisième question de chaque lot (tirage ordinaire) et par les haltes « archives ».
3. **La défaite** vient des vivres (3 au départ), perdus un par bataille où les murs cèdent, jamais par une question. Un gardien raté se retente tant qu'il reste des vivres, et les coups qu'on lui a portés restent (comme pour une place forte de la campagne).
4. **Les faveurs se méritent par une question** du conseiller qui les offre : juste, trois faveurs au choix (dont parfois une rare) ; fausse, deux faveurs communes au choix. Jamais rien, jamais de porte vide.
5. **Rien de permanent ne vient des faveurs** ; la renommée et l'Armorial sont la seule méta-progression. Les ressources du domaine gagnées par bonne réponse (1 par réponse juste, règle générale de `enregistrerReponse`) restent acquises comme partout.

## 3. La route des semaines

### 3.1 Vocabulaire

- **Expédition** : une partie du mode (un « run »).
- **Relais** : la semaine de départ. Relais ouverts : S1, et S(w + 1) pour chaque semaine w franchie.
- **Acte** : une semaine du programme, traversée en 3 haltes puis un gardien. Affichée partout « Semaine 4 » (et sous la carte « Semaine 4 · du 21 au 27 septembre 2026 », par `JEU.calendrier.lundiDe`).
- **Halte** : un nœud de la route (une bataille courte, un événement, un bivouac…). Trois couches de haltes par semaine, 2 ou 3 haltes par couche, on en joue une par couche.
- **Gardien de la semaine** : la bataille qui ferme la semaine (défense d'un camp de route, 2 vagues). **Grand Gardien** : celle qui ferme l'expédition (3 vagues, le rival du front).
- **Frontière** : dernière semaine ouverte (au moins un fichier de cours du planning pour cette semaine). Au-delà : brume.
- **Vivres** : les « vies » de l'expédition. **Or de route** : la monnaie de l'expédition (le marchand). **Faveurs** : les dons des conseillers, pour l'expédition seulement. **Renommée** : la monnaie permanente. **Armorial** : les améliorations permanentes. **Serments** : la difficulté facultative.

### 3.2 Forme de la route

Pour une expédition partant du relais S4 avec la frontière en S8 :

```
 S4 ─────────────────────────┐  S5 ────────────────────────┐  S6 ──────────────────────────┐
 [départ] ─┬─ halte ─┬─ halte ─┬─ halte ─┐                 │                                │
           ├─ halte ─┼─ halte ─┼─ halte ─┼─ GARDIEN S4 ─┬─ … (3 couches) … ─ GARDIEN S5 ─┬─ … ─ GRAND GARDIEN S6 ─ [retour]
           └─ halte ─┘         └─ halte ─┘               │                                │
                                                        S7, S8 : visibles plus loin sur le parchemin, hors de cette expédition
                                                        S9 et au-delà : brume
```

- **Couches** : 3 par semaine. Chaque couche a 2 haltes (55 %) ou 3 (45 %). Chaque halte a 1 ou 2 chemins vers la couche suivante ; toute halte est atteignable depuis le départ et mène au gardien (le générateur relie d'abord chaque halte à la halte « en face », puis ajoute des diagonales ; il refuse les croisements, comme Slay the Spire). Nombre de haltes générées par semaine : 6 à 9 ; jouées : 3 + le gardien. Une expédition de 3 semaines : 12 nœuds joués (plus le départ).
- **Ce qu'on voit** : les trois couches de la semaine en cours, avec le type de chaque halte et sa « porte » (la récompense annoncée : le médaillon du conseiller qui offrira une faveur, une bourse d'or, un parchemin de renommée, un sac de vivres). Les semaines suivantes de l'expédition : une nappe de brume par couche, le gardien en silhouette. Au-delà de la frontière : brume et numéro de semaine seulement. Dans Hadès, on choisit sa porte à la récompense ; ici pareil, et la récompense dit aussi quelle matière on va rencontrer.
- **Les gardiens** : un par semaine, posé à droite de ses trois couches. Celui de la dernière semaine de l'expédition est le Grand Gardien.
- **Cartes de bataille** : les cinq tracés existants tournent selon la semaine (`["gue", "foret", "moulin", "col", "chateau"][(semaine - 1) % 5]`), avec la variante sèche du sud quand l'expédition va vers l'Empire omeyyade, et le tracé du domaine pour les gardiens (défense d'un camp fortifié : le moteur sait déjà jouer une défense sur n'importe quelle carte, `options.defense`).

### 3.3 Génération procédurale et graine

- **Graine** : un entier 32 bits tiré au départ de l'expédition (`Date.now() ^ (horloge des questions posées × 2654435761)`), gardé dans la sauvegarde et affiché au bilan sous la forme « Graine 4F2A-9C01 ». Le jeu reçoit un petit tirage à graine (mulberry32, le même que celui des simulateurs, dans `jeu/js/expedition.js`) : avec la même graine, on obtient la même route, les mêmes types de haltes, les mêmes portes, le même étal du marchand et les mêmes faveurs proposées (dans l'ordre où on les demande).
- **Ce qui n'est pas à graine** : le tirage des questions, qui suit l'état réel de l'élève (Leitner, fenêtre anti-répétition, Seconde chance). C'est voulu : deux élèves sur la même route n'ont pas les mêmes questions.
- **La route est écrite dans la sauvegarde** (environ 2 Ko), pas recalculée à partir de la graine : une version future du générateur ne doit pas changer une expédition en cours. La graine sert à rejouer dans les simulateurs et à reproduire un défaut signalé par Romain.
- **Génération en une passe** par semaine, dans cet ordre : nombre de haltes par couche ; types (table de la section 4.3, avec les garanties) ; portes ; chemins ; modificateur d'élite des embuscades ; étal du marchand ; carte de bataille. Déterministe, sans appel à `Math.random`.

### 3.4 La frontière, les relais et la fin de l'année

- Frontière = la plus grande semaine w telle qu'il existe un cours du planning de semaine w dont le fichier est chargé (`JEU.progression.fichierPresent`). Aujourd'hui : S3 ; S8 quand le chantier « cours des semaines 4 à 8 » aura livré.
- Une expédition couvre `min(3, frontière − relais + 1)` semaines. Une seule semaine ouverte : expédition d'une semaine, Grand Gardien direct. Aucune semaine ouverte : la carte de campagne ne propose pas le mode (« La route attend tes premiers cours »).
- Franchir une semaine (vaincre son Grand Gardien) ouvre le relais suivant, pour toujours. Franchir S1-S3 ouvre le relais S4. On peut toujours repartir d'un relais ancien : c'est utile pour réviser, et les Serments y donnent de la renommée en plus.
- Après S34 (révision libre), la route reste jouable depuis n'importe quel relais ; aucune semaine nouvelle n'arrive.

## 4. Les haltes

### 4.1 Les types

| Halte | Icône (Game-icons déjà dans le jeu) | Ce qui se passe | Questions | Réussite | Échec | Durée |
|---|---|---|---|---|---|---|
| **Escarmouche** | assaut | Bataille d'1 vague sur la carte de la semaine, sans champion adverse, contre un camp de route (solidité 6). Le conseil de guerre pose 3 questions, on place, on lance. | 3 (niveaux 1 à 3) | Tenir (murs debout). **Éclatante** si le camp tombe : porte doublée | Murs cédés : −1 vivre, porte simple quand même (section 8) | 2,5 à 3 min |
| **Embuscade** (élite) | mercenaires | Bataille de 2 vagues avec un modificateur d'élite (section 6.3), champion à la 2e vague, camp de solidité 10. | 6 | Tenir. Éclatante si le camp tombe | −1 vivre | 4,5 à 5 min |
| **Événement** | l'icône de l'événement | Un des événements du jour existants adapté à la route (marchands, défi du champion, feu au camp, espion), ou un des nouveaux (section 4.2). | 2 ou 3 (niveaux 1 et 2) | Selon l'événement ; jamais de perte | — | 1 à 1,5 min |
| **Marchand** | marchand | Le maître d'œuvre tient l'étal. Une question de physique-chimie ouvre l'étal ; juste, les prix baissent de 20 %. Puis achats avec l'or de route (section 7.5). | 1 | — | — | 1 min |
| **Bivouac** | incendie (feu de camp) | La veillée : le ménestrel pose une question. Puis un choix : +1 vivre (jusqu'au maximum), ou +25 or de route, ou affiner une faveur d'un rang. Toujours au moins un bivouac atteignable par semaine. | 1 ou 2 | — | — | 1 min |
| **Trésor** | tresor | La cache : 2 questions. Chaque bonne réponse ouvre un coffre (or de route +25, ou une faveur rare directement si les deux sont justes). | 2 | — | — | 1 min |
| **Archives** | parchemin-plume | Le pèlerin des semaines passées : 3 questions tirées **avant** le relais (semaines < départ ; depuis le relais S1, les notions à revoir). Renommée doublée pour cette halte. | 3 | — | — | 1 à 1,5 min |
| **Gardien de la semaine** | defi | Défense d'un camp fortifié, 2 vagues, troupes d'assaut (règle `defense` du moteur : points de vie × assaut, coups aux murs × 2), garnison +1. On gagne en tenant les 2 vagues ou en abattant sa place (12 points, qui restent d'une tentative à l'autre). | 6 | Tenu ou victoire | Murs cédés : −1 vivre, on retente | 5 min |
| **Grand Gardien** | couronne (médaillon du rival) | Même règle, 3 vagues, niveau de la semaine + 1, une tour adverse de plus au départ, place de 16 points. Missive de défi du rival avant, réaction après. | 9 | Tenu ou victoire : semaine franchie | Murs cédés : −1 vivre, on retente | 7 min |

Les durées supposent 15 à 20 secondes par question et des vagues regardées à vitesse ×1 (les boutons ×2 et ×3 existent déjà). Une expédition de 3 semaines : 2 × (3 haltes ≈ 5,5 min + gardien 5 min) + (3 haltes + Grand Gardien 7 min) ≈ 33 min ; à ×2 sur les vagues, 26 min. Environ 45 questions par expédition complète.

### 4.2 Événements de route

Les cinq événements du jour (`JEU.campagne.EVENEMENTS`) se rejouent sur la route avec des gains de route à la place des gains de campagne : marchands → or de route, défi du champion → 3 coups au gardien de la semaine, mercenaires → +40 or au début de la prochaine bataille (`plan`), feu au grenier → +1 vivre, espion → première vague du gardien affaiblie. Quatre événements propres à la route (textes de jeu, sans contenu de cours) :

- **Le pont rompu** (la cartographe) : 2 questions ; chaque bonne réponse rouvre un chemin : la couche suivante montre toutes ses portes, même celles qu'un Serment cache.
- **La veuve du meunier** (l'herboriste) : 3 questions ; 2 justes sur 3 : la compagnie est soignée, +1 vivre.
- **Le colporteur** (l'interprète) : 2 questions ; une bonne réponse : une faveur commune au choix parmi deux ; deux : parmi trois, dont une rare.
- **Les archives du prieuré** (le chroniqueur) : variante des archives, 3 questions d'il y a au moins deux semaines ; renommée ×2.

### 4.3 Répartition des types

Tirée à la graine, couche par couche, avec des garanties :

| Couche | Escarmouche | Embuscade | Événement | Marchand | Bivouac | Trésor | Archives |
|---|---|---|---|---|---|---|---|
| 1re halte | 55 % | 0 | 30 % | 0 | 0 | 5 % | 10 % |
| 2e halte | 35 % | 25 % | 15 % | 15 % | 0 | 10 % | 0 |
| 3e halte | 25 % | 0 | 20 % | 15 % | 40 % | 0 | 0 |

Garanties par semaine : au moins une escarmouche ou une embuscade en 1re ou 2e couche ; au moins un bivouac en 3e couche ; au plus une embuscade ; exactement un marchand (en 2e ou 3e couche) ; au plus une halte de chaque autre type par couche ; jamais deux haltes du même type côte à côte dans une couche (sauf escarmouches). Une expédition entière a au moins une halte « archives » (ou « archives du prieuré »).

### 4.4 Les portes (récompenses annoncées)

Chaque escarmouche, embuscade et trésor porte une récompense visible avant d'entrer :

| Porte | Part | Contenu |
|---|---|---|
| Faveur d'un conseiller | 55 % | Le médaillon du conseiller. À la fin de la halte, il pose une question de sa matière puis offre ses faveurs (section 7.4). |
| Bourse | 25 % | +20 or de route (+10 si éclatante). |
| Parchemin de renommée | 10 % | +10 renommée tout de suite. |
| Vivres | 10 % | +1 vivre ; au maximum, se change en 15 or de route. |

Conseiller d'une porte de faveur : tiré parmi les six, pondéré par les familles qui ont des questions dans la semaine traversée (×1 si présente, ×0,3 sinon), par les familles à revoir (×1,5 : on rencontre plus souvent l'herboriste quand les SVT sont à revoir, ce qui amène plus de questions de SVT), jamais le même conseiller deux fois dans une couche, et un conseiller dont on tient déjà une faveur propose aussi de l'affiner (section 7.3). Une embuscade a toujours une porte de faveur avec une chance de rare relevée (50 % au lieu de 25 %).

## 5. Les questions dans l'expédition

### 5.1 Le tirage : deux questions de la semaine, une du royaume

Tout passe par `JEU.recit.suite`, le seul tirage du jeu, avec une option nouvelle :

```js
JEU.recit.suite(3, { exclure: ids, filtre: f, completer: true,
  quota: { nombre: 2, filtre: function (q) { return JEU.expedition.semaineDe(q.cours) === 4; } } });
```

- `quota` : au plus `nombre` questions du lot sont cherchées d'abord parmi celles qui passent `quota.filtre` (et `filtre`), avec toutes les règles anti-répétition, puis sans le repos des fiches ; s'il en manque, la suite du lot vient du tirage ordinaire. Dans `suite()`, cela se traduit par deux essais de plus en tête de la liste `essais`, chacun plafonné à `quota.nombre` questions. Un seul `JEU.rappels.placer` et un seul `eviterTriples` à la fin, comme aujourd'hui : les Seconde chance gardent leur place et leur unicité.
- **Semaine d'un cours** (`JEU.expedition.semaineDe`, ou mieux un `JEU.progression.semaineDe` partagé avec le chantier « semaine visible dans les questions ») : la semaine de son entrée du planning ; `null` pour un cours de langue, une fiche méthode ou une séquence d'anglais (ils n'ont pas de semaine ; ils viennent par la troisième question, avec l'équilibre des familles).
- Part visée : 2 questions sur 3 de la semaine dans les batailles (3 par vague), 2 sur 3 dans les événements, 1 sur 1 au bivouac et au marchand (la question du conseiller est de sa matière : quota sur la famille, pas sur la semaine), les 3 des archives avant le relais (`quota.nombre: 3`, filtre « semaine < départ »). Quand la semaine a peu de cours chargés, `completer` fait le reste sans bloquer : le tirage ne bloque jamais, c'est déjà sa règle.
- **Équilibre des familles** : il continue de se faire sur l'historique commun (`recit.historique`), d'une halte à l'autre. Dans le quota, les familles candidates sont celles qui ont des cours cette semaine-là (S1 : histoire, géographie, SVT, physique, littérature, lecture) ; sur l'expédition entière, chaque famille présente doit rester entre 12 et 30 % (mesure : section 15.3). La règle « jamais trois fois la même famille de suite » tient par `eviterTriples`.
- **À revoir** : inchangé (1,5× dans la matière et pour la famille), dans le quota comme hors quota. Les fiches de a-retravailler.js d'une semaine traversée ressortent donc davantage.
- **Anti-répétition** : inchangée (fenêtre de 60, repos des fiches). Une expédition de 45 questions puise dans 1 189 questions aujourd'hui ; une semaine à 6 cours en a 200 à 250 : le quota ne force aucune répétition.
- **Niveaux** : batailles de la route en `NIVEAUX_BATAILLE` (1 à 3), événements, bivouac, marchand, trésor, archives en 1 et 2 ; les Seconde chance suivent ces niveaux comme aujourd'hui.

### 5.2 Ce que les réponses rapportent

- En bataille : l'or du conseil de guerre, par le moteur (`M.repondre` : +12, +10 au 3e succès d'affilée, −6 par erreur sur l'or de la bataille, jamais sous zéro), modifié par les faveurs (section 7).
- Partout : 1 ressource du domaine par bonne réponse (règle générale), +1 renommée par bonne réponse (section 9.1), la Seconde chance et Leitner.
- Aux portes de faveur : la question du conseiller décide de l'offre (3 faveurs dont une rare possible, ou 2 communes).
- Le compte de l'expédition garde les bonnes réponses par famille : il sert aux faveurs « d'érudition » (section 7.2) et au bilan (« Tes meilleures matières sur cette route »).

### 5.3 Ce qui ne change pas

Panneau d'erreur à deux phrases, « Voir la fiche » (pendant le Grand Gardien, comme pour un boss du cahier des charges, le lien attend le bilan : option `sansFiche` de `panneauErreur`, les fiches ratées sont listées au bilan sous « À relire »), « Signaler une erreur », l'indice du mentor, les raccourcis 1 à 6, flèches, Entrée.

### 5.4 Le récit : la semaine se voit et s'entend

Trois endroits montrent la semaine, sans toucher à l'énoncé :

1. **Le cadre du récit** (`JEU.recit.cadre(q, contexte, camp, extra)`, avec `extra.semaine` et `extra.halte`) : nouvelles listes de phrases `PHRASES.route`, `PHRASES.bivouac`, `PHRASES.marchand`, `PHRASES.archives`, `PHRASES.gardien`, dont la moitié nomment la semaine. Exemples (jeu seulement, aucun fait de cours) :
   - « {N} marche à tes côtés sur la route de la semaine {S}. « Avant la prochaine halte, seigneur, dis-moi ceci. » »
   - « Le camp est dressé. {N} déplie ses notes de la semaine {S} à la lueur du feu : « Une question, et je te laisse dormir. » »
   - « {N} regarde la tour du gardien se découper sur la colline. « Il garde la semaine {S}. Montre-lui que tu la connais. » »
   - « Un pèlerin partage le feu. {N} lui répond : « Mon seigneur se souvient des semaines passées. Écoute. » » (archives)
   - « {N} ouvre son étal sur la place du bourg : « Une bonne réponse, et je fais un prix. » » (marchand)
   - Seconde chance : les phrases `PHRASES.rappel` existantes, inchangées.
2. **L'étiquette de semaine sur la question** : à côté de la pastille de matière, « Semaine 4 » si le cours de la question est de la semaine traversée ; « Rappel · semaine 2 » si la question vient d'une semaine antérieure ; « Grammaire · Griffon de cuivre », « Fiche méthode », « Anglais » pour les cours sans semaine. Si le chantier « semaine visible dans les questions » livre déjà cette pastille dans `JEU.ui.poserQuestion`, l'expédition s'en sert ; sinon elle passe par `cadre()` (`r.semaine`, rendu par `ui.recit`).
3. **La carte et les interstices** : bandeau « Semaine 4 · du 21 au 27 septembre 2026 » sur la couche en cours ; au passage d'une semaine à l'autre, une page d'enluminure « Semaine 5 » avec les titres des cours de la semaine (ceux du planning, visibles de toute façon dans l'écran Cours) et une phrase du chroniqueur : « Les cours de la semaine 5 t'attendent sur la route. Le gardien n'en laisse passer que ceux qui s'en souviennent. »

## 6. La difficulté monte avec la semaine

### 6.1 Le réglage du rival par semaine

Le moteur règle le seigneur rival par une ligne de la table `RIVAL` (niveaux 0 à 4 des provinces). La route a besoin d'une échelle plus fine et plus longue : la semaine. Règle : `ligne(semaine) = min(4, floor((semaine − 1) / 2))`, et, entre deux lignes, les valeurs continues (pv, coup, garde, assaut) sont interpolées à mi-chemin les semaines paires ; les valeurs entières (tours de départ, renfort, garnison) prennent la ligne du dessous ; **les tirs ne s'interpolent pas** (ils comptent par paliers de flèches, voir le journal du 15/10/2026 : 1,534 fait tomber un fantassin en 6 flèches au lieu de 7) et prennent une valeur déjà mesurée : 0,3 ; 0,5 ; 0,7 ; 1,0 ; 1,16 ; 1,62.

| Semaine | Ligne | pv | tirs | coup | tours départ | garde | assaut (gardiens) | Note |
|---|---|---|---|---|---|---|---|---|
| S1 | 0 | 0,40 | 0,30 | 0,35 | 1 | 1,00 | 5,2 | Tartare : on apprend la route |
| S2 | 0 → 1 | 0,60 | 0,50 | 0,38 | 1 | 1,05 | 4,0 | |
| S3 | 1 | 0,80 | 0,70 | 0,40 | 1 | 1,10 | 2,8 | Premier Grand Gardien |
| S4 | 1 → 2 | 0,80 | 0,70 | 0,40 | 1 | 1,15 | 2,7 | |
| S5 | 2 | 0,80 | 0,70 | 0,40 | 2 | 1,20 | 2,6 | |
| S6 | 2 → 3 | 0,85 | 0,70 | 0,40 | 2 | 1,25 | 3,0 | |
| S7 | 3 | 0,90 | 0,70 | 0,40 | 2 | 1,30 | 3,5 | |
| S8 | 3 → 4 | 1,05 | 1,00 | 0,70 | 2 | 1,15 | 3,4 | Frontière d'aujourd'hui |
| S9, S10 | 4 | 1,20 | 1,62 | 1,00 | 2 | 1,00 | 3,3 | La Forteresse de la campagne |
| S11 et au-delà | 4 + profondeur | ×(1 + 0,04 × (S − 10)), plafond ×1,6 | 1,62 | ×(1 + 0,03 × (S − 10)), plafond ×1,5 | 3 à partir de S20 | +0,05 par semaine, plafond 1,5 | 3,3 | Garnison +1 à S16 et S24 (plafond 4) |

Ces nombres sont des points de départ : la table se règle au simulateur comme la table `RIVAL` l'a été (80 graines, 4 justesses, un processus par niveau), et le journal note les écarts.

### 6.2 Par type de halte, à partir de la ligne de la semaine

| Halte | Vagues | Mode | Modifications | Place adverse |
|---|---|---|---|---|
| Escarmouche | 1 | attaque | pas de champion (`options.champion: false`), garnison 1, tours de départ de la ligne | 6 |
| Embuscade | 2 | attaque | un modificateur d'élite (6.3), champion à la 2e vague | 10 |
| Gardien | 2 | défense (assaut, coups aux murs ×2) | garnison +1 | 12 (gardée entre deux tentatives) |
| Grand Gardien | 3 | défense | ligne + 1 (plafond 4), tours de départ +1, garnison +1, un champion à chaque vague à partir de la 2e | 16 (gardée) |

Tout le reste vient de `JEU.campagne.options(niveau)` : or de départ (60 + Trésor), château (20 + Peuple + remparts), dégâts des tours (Garde), or par réponse (Savoir), arsenal débloqué. La campagne aide donc la route (comme les souvenirs de Hadès), et la route n'abîme jamais la campagne.

### 6.3 Modificateurs d'élite (embuscades)

Un par embuscade, tiré à la graine, affiché sur la porte et rappelé par l'éclaireur au début de la bataille :

- **Garnison doublée** : 2 gardes au départ.
- **Archers embusqués** : une tour d'archers adverse de plus au départ.
- **Cavalerie légère** : 2 cavaliers de renfort à chaque vague.
- **Brouillard sur tes lignes** : tes tours voient 25 % moins loin à la 1re vague (symétrique du `brouillard` existant, qui gêne les tours adverses).
- **Pluie** : toutes les troupes plus lentes (le modificateur `pluie` existe déjà).
- **Trésor de guerre** : le rival a 30 or de plus (il bâtit plus vite).

### 6.4 Les Serments (difficulté facultative, après le premier Grand Gardien)

Chaque Serment vaut des points d'**ardeur** ; chaque point donne +10 % de renommée sur toute l'expédition (plafond 8 points, +80 %). Ils se choisissent au départ, se gardent d'une fois sur l'autre, et ne touchent jamais aux questions (pas de chrono, pas de niveau forcé, pas de Seconde chance retirée) :

| Serment | Effet | Ardeur |
|---|---|---|
| De la garde | Garnison rivale +1 à chaque bataille | 1 |
| Du guetteur | Tours rivales : tirs au palier supérieur | 1 |
| Des vivres | 2 vivres au départ au lieu de 3 (jamais moins de 1) | 2 |
| Du marchand | Prix du marchand +25 % | 1 |
| De la hâte | Les portes ne montrent plus leur récompense | 1 |
| Du champion | Le champion adverse à chaque vague des gardiens | 2 |

Les titres de l'Armorial (section 9.3) notent le record d'ardeur par relais.

## 7. Les faveurs des conseillers

### 7.1 Les six conseillers, un par famille

Les conseillers existent (`JEU.recit.CONSEILLERS`) : le chroniqueur (histoire), la cartographe (géographie), l'herboriste (SVT), le maître d'œuvre (physique-chimie), le ménestrel et le maître scribe (français : littérature, lecture suivie, grammaire ; ils offrent les mêmes faveurs, c'est le ménestrel qui tient la porte, le maître scribe pose la question quand elle est de grammaire), l'interprète (anglais ; ses portes n'apparaissent que si une séquence d'anglais est chargée). Chacun a trois faveurs et un thème : la mémoire, les routes, les remèdes, les engins, le moral, les alliances.

### 7.2 Les faveurs, en trois rangs

Rangs : **commune**, **rare**, **épique** (cadre de bronze, d'argent, d'or sur le médaillon). Chaque faveur se tient une fois ; la reprendre l'affine d'un rang.

| Conseiller | Faveur | Commune | Rare | Épique | Où s'applique |
|---|---|---|---|---|---|
| Chroniqueur (histoire) | **Annales** | +2 or par bonne réponse | +3 | +5 | `M.repondre` (orParReponse) |
| | **Mémoire des anciens** | une Seconde chance réussie rapporte +4 or | +7 | +10 | `M.repondre`, question `rappel` |
| | **Chronique dorée** | renommée des haltes +10 % | +15 % | +25 % | compte de l'expédition |
| Cartographe (géographie) | **Lignes de visée** | portée de tes tours +8 % | +12 % | +18 % | `porteeTour` |
| | **Chemins creux** | vitesse de tes troupes +10 % | +15 % | +25 % | `creerUnite` |
| | **Relevé des cols** | les portes de la couche suivante sont visibles | toute la semaine | toute l'expédition | carte |
| Herboriste (SVT) | **Onguents** | points de vie de tes troupes +10 % | +15 % | +25 % | `creerUnite` |
| | **Murs chaulés** | château +3 | +5 | +8 | `creer` (pvChateau) |
| | **Simples** | +1 vivre tout de suite | +1 vivre maximum | +1 vivre à chaque gardien vaincu | expédition |
| Maître d'œuvre (physique) | **Engrenages** | dégâts de tes tours +8 % | +12 % | +18 % | `degatsTour` (bonusDegats) |
| | **Charpente** | tours −3 or | −5 | −8 | `poserTour` |
| | **Contrepoids** | baliste et trébuchet : cadence +15 % | +25 % | +40 % | `etapeTours` |
| Ménestrel et maître scribe (français) | **Chant de marche** | revenu par vague +3 | +5 | +8 | `etape` (fin de vague) |
| | **Refrain** | coup d'éclat +15 au lieu de +10 | +20 | +25, et dès 2 succès d'affilée | `M.repondre` |
| | **Ballade consolante** | une erreur coûte 4 or au lieu de 6 | 2 | 0 | `M.repondre` (orPerduErreur) |
| Interprète (anglais) | **Lettres de crédit** | or de départ +15 | +25 | +40 | `creer` |
| | **Mercenaires** | un fantassin gratuit par vague | deux | un cavalier | `lancerVague` |
| | **Parlementaire** | garnison rivale −1 au départ (jamais sous 0) | et une tour adverse de départ en moins (jamais sous 1) | et son trésor −15 | `rivalDepart` |

**Plafonds** (pour que le simulateur puisse jouer le pire cas) : dégâts des tours au total (jauge Garde + faveurs) ≤ +60 % ; portée ≤ +25 % ; points de vie des troupes ≤ +40 % ; vitesse ≤ +30 % ; or par réponse ≤ 22 ; or de départ ≤ 180 ; perte par erreur ≥ 0 ; château ≤ 40.

**Faveur d'érudition** (une par conseiller, épique seulement, proposée au marchand à partir de la 2e semaine de l'expédition) : « +1 % de dégâts (cartographe : de portée ; herboriste : de points de vie…) par bonne réponse de ma matière pendant cette expédition, plafond 15 % ». Elle récompense directement les réponses dans une matière, et le bilan la commente.

### 7.3 Duos (synergies)

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

### 7.4 Comment on reçoit une faveur

À une porte de faveur, après la halte : le conseiller pose **une question de sa matière** (quota sur la famille, niveaux 1 et 2, règles anti-répétition habituelles, Seconde chance possible), dans son cadre de récit. Juste : trois faveurs au choix (deux de ses faveurs et, une fois sur quatre, une rare, ou une faveur de duo si le duo est ouvert) ; fausse : explication, puis deux faveurs communes au choix. On choisit au clavier (1, 2, 3) ou à la souris ; chaque carte de faveur montre le conseiller, le rang, l'effet en une phrase et, si on tient déjà la faveur, « Affiner : commune → rare ». Jamais de porte vide, jamais de faveur imposée.

### 7.5 Le marchand

L'étal (tiré à la graine) propose 4 lignes parmi : une faveur commune (45 or de route), une faveur rare (75), affiner une faveur tenue (35), un sac de vivres (40), un **plan de bataille** (+25 or au début de la prochaine bataille, 15), **rafraîchir l'étal** (10, une fois), à partir de la 2e semaine une faveur d'érudition (90) ou une faveur de duo (80). Les prix baissent de 20 % si la question d'ouverture est juste, de 10 à 20 % de plus avec l'Armorial (Forge de campagne), montent de 25 % avec le Serment du marchand. L'or de route d'une expédition complète est d'environ 250 : trois ou quatre achats.

## 8. Vivres, or de route, défaite et retour

- **Vivres** : 3 au départ (4 ou 5 avec l'Armorial ; 2 avec le Serment des vivres). −1 quand les murs cèdent dans une bataille de route (escarmouche, embuscade, gardien, Grand Gardien), ou quand on quitte une bataille après sa première vague (comme dans la campagne, quitter avant la première vague ne coûte rien : la halte reste à jouer). Jamais pour une question, jamais pour un événement. À 0 : **le retour au domaine**.
- **Or de route** : 0 au départ. Gagné par les portes et les événements, dépensé au marchand. Perdu à la fin de l'expédition (il n'a pas de sens au domaine), ce que le bilan dit clairement avant de partir : « Dépense ton or de route avant le Grand Gardien, il ne te suivra pas au domaine. »
- **Faveurs** : rendues au retour.
- **Retour au domaine** (défaite) : un écran de bilan, le même que la victoire, avec la renommée gagnée (jamais réduite), les meilleures matières de la route, les fiches à relire, la graine, et « Repartir » ou « Retour à la campagne ». La chronique note : « L'expédition s'est arrêtée à la semaine 5, halte 2. La compagnie rentre avec 83 points de renommée. » Rien d'autre ne change : provinces, ressources, jauges, arsenal, bâtiments, suivi des cours.
- **Abandonner** (depuis la carte de route, avec confirmation) : même bilan, même renommée.
- **Victoire** (Grand Gardien vaincu) : semaine franchie, relais suivant ouvert, +20 renommée, 3 coups à la prochaine place forte du front (comme le défi du champion), rivalité du front +6, missive du rival (situation `victoire` : il a été repoussé), 8 ressources de la matière la plus réussie de la route.

## 9. Renommée, Armorial, trophées

### 9.1 Gagner de la renommée

| Source | Renommée |
|---|---|
| Bonne réponse (partout sur la route) | +1 |
| Halte réussie | 4 + numéro de la semaine |
| Halte échouée (l'effort compte) | 2 |
| Archives (halte) | ×2 sur la halte |
| Gardien de la semaine vaincu | 15 + 3 × semaine |
| Grand Gardien vaincu | 30 + 5 × semaine |
| Expédition complète | +20 |
| Serments | +10 % par point d'ardeur sur le total |
| Armorial, Bannière | +10 % puis +20 % |

Ordres de grandeur : expédition S1-S3 complète ≈ 190 (9 haltes ≈ 55, 2 gardiens ≈ 40, Grand Gardien ≈ 45, 32 bonnes réponses, +20) ; S7-S9 complète ≈ 310 ; expédition arrêtée à la 5e halte de S1 ≈ 40. Toujours plus que zéro, toujours gardée.

### 9.2 L'Armorial (le Miroir)

Un écu dont on remplit les quartiers avec la renommée. Rien ne se perd ; un achat est définitif ; on peut toujours jouer sans rien acheter.

| Quartier | Effet | Rangs et prix (renommée) |
|---|---|---|
| Vivres de route | +1 vivre au départ | 40, puis 110 (5 vivres) |
| Bourse du voyageur | +10 or de départ par bataille de route | 25, 50, 90 |
| Sauf-conduit | les portes de toute la semaine sont visibles dès l'arrivée | 30 |
| Mémoire des anciens | une Seconde chance réussie rapporte +4 or, partout sur la route | 35 |
| Murs chaulés | château +2 dans les batailles de route | 35, 75 |
| Forge de campagne | prix du marchand −10 % | 30, 60 |
| Faveur d'ouverture | une faveur commune au choix au départ de chaque expédition | 80 |
| Seconde monture | une fois par expédition, une bataille perdue ne coûte pas de vivre | 120 |
| Bannière | renommée +10 % | 60, 140 |

Total : 980 points, soit cinq à six expéditions complètes, un ou deux quartiers par expédition au début. Les relais ne s'achètent pas : ils s'ouvrent en franchissant les semaines.

### 9.3 Trophées et chronique des expéditions

Une page du Codex, « Chronique des expéditions » : les vingt dernières expéditions (date, relais, front, semaine et halte atteintes, renommée, graine, ardeur), le record par relais, et des titres gagnés une fois pour toutes (« Premier pas », « Gardien de la semaine 3 », « Sans faute au bivouac », « Les six conseillers », « Ardeur 4 »…). Les titres sont des mots de jeu, sans fait de cours.

## 10. Le récit entre les parties et le lien avec la campagne

- **Partir** : une carte de la grille de la campagne, « Partir en expédition » (ou « Reprendre l'expédition · semaine 5, 2e halte »). L'écran de départ : le relais (parmi les relais ouverts), le front (vers l'ouest contre le royaume d'Angleterre, vers le sud contre l'Empire omeyyade : la carte de bataille prend la variante du sud, le gardien les couleurs du camp), les Serments s'ils sont ouverts, l'Armorial. Une phrase du chroniqueur rappelle l'ordre du souverain : « {souverain} te confie la route des semaines 4 à 6. Reviens avec de la renommée. » (phrase du jeu, sans réplique nouvelle dans personnages.js ; une situation `expedition` des souverains viendra en extension, avec ses six répliques).
- **Rivaux et missives** : avant le Grand Gardien, le défi du rival du front (situation `defi`, une fois sur deux comme avant une bataille de campagne) ; après une victoire, sa réaction (`victoire`) ; après un retour, `retraite`. Les gardiens de semaine sont des capitaines du camp, sans missive. Extension : situations `gardien`, `expedition`, `deroute` dans personnages.js (au moins six répliques, deux par niveau de rivalité, contrôle 10 du validateur).
- **Rivalité** : Grand Gardien vaincu +6, gardien vaincu +2, retour 0 (une défaite ne fait rien perdre, ni gagner).
- **Souverain** : il change toujours avec les provinces prises. L'expédition y contribue par les 3 coups à la place forte à chaque Grand Gardien vaincu.
- **Arsenal, jauges, remparts** : s'appliquent aux batailles de route (`JEU.campagne.options`). Le conseil du royaume et l'arsenal restent la progression « lente » ; l'Armorial est la progression « roguelite ».
- **Événements du jour, menace, attaques du domaine** : indépendants. Une attaque du domaine en cours n'empêche pas de partir ; elle attend. Une expédition en cours n'empêche pas de jouer la campagne : les deux boutons restent disponibles.
- **Chronique** : départ, semaine franchie, retour, record, dans les vingt faits de la campagne.

## 11. Sauvegarde : schéma 6

Migration 5 → 6 : ajoute `expedition`, vide, complété par `JEU.expedition.completer` (même méthode que `JEU.campagne.completer` : une valeur absente ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas). Rien n'est retiré. Une sauvegarde du schéma 6 lue par un jeu plus ancien est refusée, comme aujourd'hui.

```js
expedition: {
  renom: 0, renomTotal: 0,                       // disponible, gagné depuis le début (jamais réduit)
  armorial: { vivres: 0, bourse: 0, saufConduit: 0, memoire: 0, murs: 0, forge: 0, ouverture: 0, monture: 0, banniere: 0 },
  franchies: [],                                 // semaines dont le Grand Gardien a été vaincu ; relais = [1] ∪ { w + 1 }
  sermentsOuverts: false,                        // vrai après le premier Grand Gardien vaincu
  serments: { garde: false, guetteur: false, vivres: false, marchand: false, hate: false, champion: false },
  titres: [],                                    // identifiants de trophées
  records: { "1": { semaine: 3, halte: 4, renom: 190, ardeur: 0 } },   // par relais
  historique: [{ le: "2026-10-20", graine: 1329438721, front: "angleterre", depart: 1, atteint: { semaine: 2, halte: 3 },
                 issue: "victoire" | "retour", renom: 190, ardeur: 0 }],   // vingt au plus, le plus récent d'abord
  enCours: null | {
    graine: 1329438721, front: "angleterre", depart: 4, semaines: [4, 5, 6], ardeur: 0,
    route: [{ semaine: 4, carte: "col",
              couches: [[{ id: "s4c1h1", type: "escarmouche", porte: { genre: "faveur", conseiller: "svt" }, suivants: ["s4c2h1", "s4c2h2"] }], [], []],
              gardien: { id: "s4g", type: "gardien", place: 12 } }],
    position: null | "s4c1h1",                   // halte en cours ou dernière jouée
    faits: { "s4c1h1": "reussi" | "echoue" | "eclatante" },
    vivres: 3, vivresMax: 3, or: 0, plan: 0, monture: true,
    faveurs: [{ id: "annales", rang: 1 }],       // rang 1 commune, 2 rare, 3 épique ; duos : { id: "veillee", rang: 1 }
    places: { "s4g": 9 },                        // solidité restante d'un gardien déjà attaqué
    etal: { "s4c2h2": { lignes: [...], rafraichi: false } },
    compte: { questions: 0, bonnes: 0, serie: 0, meilleureSerie: 0, parFamille: {}, renom: 0, renomHaltes: 0, fiches: [] }
  }
}
```

- **Quand on enregistre** : après chaque halte, chaque choix de faveur, chaque achat, chaque gardien ; la bataille en cours n'est pas sauvegardée au milieu (pas plus qu'aujourd'hui). Fermer le jeu pendant une bataille de route : à la réouverture, la halte est à rejouer, sans perte de vivre si la première vague n'avait pas été lancée ; sinon, −1 vivre, comme un abandon (décision à confirmer : le plus simple et cohérent avec la campagne).
- **Reprise** : « Reprendre l'expédition » ouvre la carte à la position enregistrée. Une sauvegarde importée reprend son expédition telle quelle.
- **Taille** : moins de 3 Ko par expédition en cours, 2 Ko d'historique.
- **docs/FORMAT_DONNEES.md** : section « Sauvegarde », schéma 6, et les réglages ajoutés à config.js (ci-dessous). **atelier/outils/tests.js** : migration 1 → 6 sans perte, `completer` sur une expédition abîmée.

Réglages dans `jeu/data/config.js` (lus par `JEU.expedition`, valeurs par défaut si absents, pour que Romain puisse les toucher sans code) : `expedition: { semaines: 3, vivres: 3, couches: 3, questionsSemaine: 2 }`.

## 12. Interface et direction artistique

### 12.1 La carte-itinéraire

- Un nouvel écran de partie, « La route » (`JEU.ui.ecrans.expedition`, module `jeu/js/ecran-expedition.js`), ouvert depuis la campagne, retour par Échap ou « Retour à la campagne ».
- **Parchemin horizontal** (SVG, 1000 × 300 logiques, dans le même cadre que la carte de campagne : il tient entier en 1366 × 768 avec les panneaux du bas, contrôle perf.js comme pour la carte). Une semaine = une bande de 300 px : une initiale rubriquée (« S4 » en #8c2f39, lettrine à filets d'or), le libellé des dates dessous, trois colonnes de vignettes, puis le gardien dans un médaillon héraldique (`JEU.ecranCampagne.medaillonHeraldique(camp)`, couronne « tortil » pour un capitaine, celle du camp pour le Grand Gardien, portrait du rival s'il en a un).
- **Vignettes de haltes** : médaillons de 56 px à l'encre et à l'or, icône Game-icons du type, la porte en petit écusson en bas à droite (médaillon du conseiller 22 px, bourse, parchemin, sac). États : à venir (encre), atteignable (halo d'or, comme la province « cible » de la campagne), jouée (sceau de cire du camp : vert-de-gris si réussie, plomb si échouée), hors chemin (estompée). Chemins en pointillés d'encre comme `route()` de la carte de campagne ; le chemin parcouru en trait plein doré.
- **Brume** : les nappes `lieu-brume` existantes, posées sur les couches des semaines suivantes et sur tout ce qui dépasse la frontière, avec le voile désaturé de `voileBrume` ; la bannière « Cette semaine » (calendrier) plantée sur la semaine du jour, à l'intérieur ou au bord de la brume.
- **Sous la carte** : le cartouche « Ta compagnie » (vivres en sacs, or de route, faveurs en médaillons cerclés de bronze, d'argent ou d'or avec leur effet au survol et dans une liste au clavier, renommée de l'expédition, ardeur) ; le cartouche « Journal de route » (les dix derniers faits de l'expédition) ; les boutons « Entrer dans la halte (Entrée) », « Faveurs (F) », « Abandonner l'expédition ».
- **Interstice de semaine** : au passage à la semaine suivante, une page pleine « Semaine 5 », avec les titres des cours de la semaine et la phrase du chroniqueur, bouton « En route (Entrée) ». Pas d'animation de plus de 400 ms ; aucun clignotement.
- **Écran de départ** et **bilan** : fenêtres de la famille des missives (sceau de cire, médaillon), avec les mêmes raccourcis.
- **Palette et polices** : celles du jeu (fond #efe6d2, encre #2e2419, or #b08d3a, rubrique #8c2f39, une teinte par matière sur les médaillons des conseillers), Cinzel pour les titres, Crimson Text pour les textes. Rien de nouveau dans jeu/assets pour le MVP ; en extension, un fond de parchemin de route rendu par les scripts Blender de l'atelier (rendu-3d), avec repli vectoriel si l'image manque, comme la carte de campagne.
- **Références** : la Table de Peutinger et l'itinéraire de Londres à Jérusalem de Matthew Paris (XIIIe siècle, domaine public) pour la route horizontale à stations ; les cartes de campagne de Medieval Total War pour les silhouettes de camps ; les enluminures pour les initiales de semaine.

### 12.2 Clavier et accessibilité

- Sur la carte : ← → passent d'une halte atteignable à l'autre (couche suivante), ↑ ↓ aussi, Entrée entre, F ouvre la liste des faveurs, Échap revient à la campagne (avec l'expédition enregistrée). Les haltes atteignables ont `tabindex="0"` et un `aria-label` complet : « Semaine 4, 2e halte : embuscade, garnison doublée, récompense : faveur de l'herboriste ».
- Choix de faveur, bivouac, marchand : touches 1 à 4, Entrée pour valider, Échap pour fermer ce qui peut l'être (jamais une porte : on choisit toujours).
- Rien ne repose sur la couleur seule (icône + mot : « réussie », « échouée ») ; textes de 14 px au moins sur la carte, questions à 18 px comme partout ; focus visible ; pas de clignotement.

### 12.3 Performance

- La carte : un SVG de 30 nœuds et 40 chemins, redessiné à chaque retour sur l'écran (quelques ms).
- Les faveurs : résolues en un objet `faveurs` à la création de la bataille ; dans le moteur, quelques multiplications déjà sur le chemin chaud (comme `bonusDegats`). Aucun effet dans la boucle de rendu.
- Entre une réponse et la question suivante : rien de nouveau. Le lot d'une vague est tiré au début de la vague, comme aujourd'hui ; le quota de semaine ajoute un appel à `tirage()` (mesuré par `mesurer-tirage.js`, cible : médiane sous 3 ms hors bac à sable, 10 ms au plus).
- perf.js : les mêmes mesures (JEU.mesure et Event Timing) pendant une escarmouche et un gardien de route.

## 13. Ce qu'il faut changer dans le code

Lecture seule pour ce document ; voici les accroches précises pour les agents qui coderont.

| Fichier | Changement |
|---|---|
| `jeu/js/expedition.js` (nouveau, sans DOM, testé sous Node) | Constantes (`EXP`), tirage à graine, `semaineDe`, `frontiere()`, `relais()`, `generer(graine, depart, semaines, front)`, `commencer`, `haltesAtteignables`, `entrer(id)`, `optionsBataille(halte)` (ligne de la semaine, mode, faveurs, modificateur d'élite), `apresBataille(halte, bilan)`, `offrirFaveurs(conseiller, juste)`, `prendreFaveur`, `acheter`, `bivouac`, `renom(...)`, `finir(issue)`, `armorial`, `serments`, `completer`, `etat()`. `JEU.expedition`. |
| `jeu/js/ecran-expedition.js` (nouveau) | La carte-itinéraire, l'écran de départ, les fenêtres (faveurs, marchand, bivouac, interstice), le bilan, l'Armorial, la Chronique. |
| `jeu/js/bataille-moteur.js` | Options nouvelles, toutes facultatives et sans effet si absentes : `options.champion` (false : aucun champion), `options.rivalRegle` (surcharge partielle de la ligne `RIVAL`, lue par `rival(p)`), `options.faveurs` ({ degats, portee, pvTroupes, vitesseTroupes, prixTours, cadenceEngins, revenu, serieBonus, serieSeuil, orSecondeChance, mercenaires, garnisonMoins, toursDepartMoins, tresorMoins, chateauPv, regen, tirPlongeant, sapeurs }), lues dans `creer`, `rivalDepart`, `degatsTour`, `porteeTour`, `creerUnite`, `poserTour`, `etapeTours`, `lancerVague`, `etape` (fin de vague) et `repondre` (qui reçoit aussi `rappel` pour « Mémoire des anciens »). Le moteur reste sans hasard et son journal du rival inchangé. Un modificateur `brouillardJoueur` symétrique de `brouillard`. |
| `jeu/js/bataille.js` | `lancer(lieu, contexte)` : avec un `contexte` d'expédition ({ carte, options, titre, campAdverse, nomRival, surFin(bilan), surQuitter(entamee) }), la bataille ne touche pas la campagne (`C.apresBataille` n'est pas appelé) et rend son bilan à `JEU.expedition`. Les questions passent par `JEU.expedition.tirage(n, posees)` qui ajoute le quota de semaine. Le cadre du récit reçoit `extra` (semaine, halte). Option `sansFiche` au Grand Gardien. Phrase de l'éclaireur pour le modificateur d'élite. |
| `jeu/js/recit.js` | `suite(nombre, options)` : option `quota` (section 5.1). `cadre(q, contexte, camp, extra)` : contextes `route`, `bivouac`, `marchand`, `archives`, `gardien`, et `r.semaine`. |
| `jeu/js/interface.js` | `ui.recit` affiche `r.semaine` ; `panneauErreur(q, zone, suite, options)` avec `options.sansFiche` ; `poserQuestion` ne change pas (sauf si le chantier « semaine visible » y met déjà la pastille). |
| `jeu/js/campagne.js` | `jouerEvenement(ev, contexte)` : les événements rejouables sur la route avec des gains de route ; `GAINS_RIVALITE.gardien` et `.grandGardien` ; rien d'autre. |
| `jeu/js/ecran-campagne.js` | La carte « Partir en expédition / Reprendre » dans la grille, avec sa touche ; le bouton « Armorial ». |
| `jeu/js/sauvegarde.js` | `SCHEMA = 6`, migration 5 → 6, `nouvelle()` avec `expedition`. |
| `jeu/js/codex.js` | Page « Chronique des expéditions » et « Armorial ». |
| `jeu/js/progression.js` | `semaineDe(coursId)` (partagé avec le chantier « semaine visible »). |
| `jeu/index.html` | Les deux scripts nouveaux (après ecran-campagne.js), `JEU.version`. |
| `jeu/css/jeu.css` | Styles de la carte-itinéraire, des médaillons de faveurs, de l'Armorial. |
| `jeu/data/config.js` | Bloc `expedition` facultatif. |
| `atelier/outils/tests.js`, `simuler-bataille.js`, nouveau `simuler-expedition.js`, `mesurer-tirage.js`, `perf.js` | Section 15. |
| `docs/CAHIER_DES_CHARGES.md`, `docs/FORMAT_DONNEES.md`, `docs/JOURNAL.md`, `jeu/VERSION.txt` | Section 5 du cahier (« La route des semaines »), schéma 6, décisions, version. |

Coordination avec les chantiers en cours : le chantier « cours des semaines 4 à 8 et semaine visible dans les questions » fournit `semaineDe` et la pastille ; le chantier « personnages et missives » fournit plus tard les situations `expedition`, `gardien`, `deroute` ; le chantier « anglais » ouvre les portes de l'interprète dès qu'une séquence est chargée. L'expédition n'écrit rien dans jeu/data : les données de cours restent au /traiter.

## 14. Plan de construction

### Étape 1 : le squelette jouable (MVP)

1. `expedition.js` : génération de route à graine, état, vivres, or de route, renommée, `completer` ; schéma 6 ; tests Node (route, migration, frontière, relais).
2. Moteur : `champion`, `rivalRegle`, `faveurs` (les six faveurs les plus simples : Annales, Lignes de visée, Onguents, Engrenages, Chant de marche, Lettres de crédit) ; tests du moteur (une bataille à faveurs donne les bons chiffres ; sans faveurs, strictement le même résultat qu'avant, graine pour graine : le simulateur de bataille le vérifie par `--comparer`).
3. `bataille.js` : contexte d'expédition ; escarmouche, gardien et Grand Gardien jouables (embuscade sans modificateur d'élite au début).
4. `recit.js` : quota de semaine, cadres de route, étiquette de semaine ; `mesurer-tirage.js --expedition`.
5. `ecran-expedition.js` : carte-itinéraire, portes, fenêtre de faveurs (une question puis le choix), bivouac, marchand minimal (faveur, vivre, plan), bilan, reprise ; bouton dans la campagne ; Armorial avec trois quartiers (Vivres, Bourse, Bannière).
6. Journal, cahier des charges, format, version, `perf.js` (parcours complet), cinq vérifications pour Romain.

Livrable : une expédition S1-S3 complète, sauvegardée, reprise, avec défaite et victoire, renommée et trois quartiers d'Armorial. Volume : environ 1 200 lignes de JavaScript, 300 de CSS, 60 tests.

### Étape 2 : la profondeur

Les 18 faveurs et les rangs, l'affinage, les duos, les modificateurs d'élite, l'étal complet, les quatre événements de route, les archives, l'Armorial complet, la Chronique des expéditions et les titres, `simuler-expedition.js` et le réglage de la table par semaine.

### Étape 3 : le récit et la finition

Les Serments, les situations de missives nouvelles (personnages.js), la phrase du souverain, le fond de parchemin rendu en 3D, les sons propres (sac de vivres, sceau de halte), l'interstice de semaine illustré, les faveurs d'érudition, le marqueur « Cette semaine ».

### Plus tard

Des haltes nouvelles quand les mini-jeux arriveront (Plan de bataille, Pont de liens, Observatoire comme haltes de route), une expédition « courte » de deux semaines choisie au départ, un défi hebdomadaire à graine commune (la même route pour la semaine, record à battre).

## 15. Tests et mesures

### 15.1 tests.js (logique, Node)

- Route : pour 200 graines, 3 couches par semaine, 2 ou 3 haltes par couche, toute halte atteignable depuis le départ et reliée au gardien, aucun croisement, garanties de la section 4.3, mêmes résultats pour la même graine, résultats différents pour deux graines.
- Frontière et relais : avec les cours chargés d'aujourd'hui, frontière = 3 ; relais = [1] ; après `franchies = [3]`, relais = [1, 4] ; une expédition partant de 3 avec la frontière à 3 fait une semaine ; sans aucun cours, pas d'expédition.
- Semaine d'un cours : `histoire-s03-1` → 3 ; `langue-conj10`, `methode-frise`, `anglais-seq01` → null.
- Vivres : jamais sous zéro ; une question ratée n'en retire jamais ; un retour à zéro vivre finit l'expédition avec la renommée acquise ; Seconde monture consommée une fois.
- Renommée : ne baisse jamais, même après un retour ; un achat d'Armorial retire du disponible, pas du total ; Bannière et ardeur s'appliquent au bon total.
- Sauvegarde : migration 1 → 6 sans perte ; `completer` répare une expédition en cours abîmée (position inconnue → départ de la semaine courante, faveur inconnue retirée, vivres non numériques → 3) ; import d'une sauvegarde avec expédition en cours.
- Moteur : avec `options.faveurs` vide, une bataille graine pour graine donne le même `stats` qu'avant (comparaison avec `git show <commit>:jeu/js/bataille-moteur.js`) ; chaque faveur change le bon paramètre et respecte son plafond ; `champion: false` → aucun champion ; `rivalRegle` surcharge sans toucher `RIVAL`.
- Tirage : `suite(3, { quota })` donne 2 questions de la semaine 1 et 1 autre quand c'est possible, 3 d'une autre semaine quand la semaine n'a pas de cours ; les Seconde chance sont placées une seule fois ; les 60 dernières questions ne ressortent pas.
- Récit : chaque phrase de route a `{N}` ; celles qui ont `{S}` reçoivent la semaine ; aucun texte de faveur, de halte, d'événement de route, de titre ne contient un chiffre de cours, un mot de religion ou une insulte (même liste que le contrôle 10 du validateur).

### 15.2 simuler-expedition.js (nouveau, atelier)

Il réutilise le joueur scripté et le chargement de `simuler-bataille.js` (mêmes modules, `Math.random` à graine), y ajoute `expedition.js`, et joue des expéditions entières : route à graine, choix de halte au hasard pondéré vers les faveurs, question de porte juste avec la probabilité p, faveur prise au hasard parmi l'offre, bivouac en « +1 vivre » si vivres < max sinon « affiner », marchand : vivre si vivres ≤ 1 sinon faveur.

```
node atelier/outils/simuler-expedition.js --graines 80 --p 0.6,0.7,0.8,0.9 --depart 1,4,7 --armorial 0,moitie,complet [--serments garde,guetteur] [--json] [--comparer avant.json]
```

Sorties par justesse, relais et Armorial : part d'expéditions complètes ; semaine et halte moyennes atteintes ; vivres restants ; réussite par type de halte (escarmouche, embuscade, gardien, Grand Gardien) ; renommée moyenne ; questions posées (durée estimée = questions × 18 s + vagues × 50 s) ; faveurs les plus prises et leur effet sur la réussite (différence de réussite avec et sans).

Cibles de départ (à ajuster avec Romain après quelques expéditions réelles) :

| Mesure | p = 0,7, Armorial 0 | p = 0,7, Armorial complet | p = 0,9 | p = 0,6 |
|---|---|---|---|---|
| Escarmouche tenue | ≥ 90 % | ≥ 95 % | ≥ 98 % | ≥ 80 % |
| Gardien de semaine vaincu (1re tentative) | 75 à 80 % | ≥ 85 % | ≥ 95 % | ≥ 60 % |
| Grand Gardien S3 vaincu (1re tentative) | 60 à 65 % | ≥ 75 % | ≥ 90 % | ≥ 45 % |
| Expédition S1-S3 complète | 50 à 60 % | ≥ 80 % | ≥ 90 % | ≥ 30 % |
| Expédition S7-S9 complète | 25 à 35 % | ≥ 60 % | ≥ 80 % | ≥ 15 % |
| Renommée d'une expédition arrêtée | ≥ 35 | | | ≥ 30 |
| Durée estimée d'une expédition complète | 25 à 38 min | | | |

Levier par levier, dans l'ordre où le journal du 16/10/2026 les a classés : la garnison des gardiens, la solidité des places de route (6, 10, 12, 16), les vivres, puis seulement la table par semaine. Attention aux paliers de flèches : vérifier chaque changement de « tirs » au simulateur de bataille.

### 15.3 simuler-bataille.js et mesurer-tirage.js

- `simuler-bataille.js --halte escarmouche|embuscade|gardien|grand-gardien --semaine 4 [--faveurs "engrenages:2,onguents:1"]` : joue la halte avec les options exactes de `JEU.expedition.optionsBataille`, 80 graines, les quatre justesses, les trois stratégies : issue, coups portés, batailles pour vaincre le gardien. Et `--comparer` entre le moteur d'avant et le moteur avec `options.faveurs` vide : aucun écart (les batailles de campagne ne bougent pas).
- `mesurer-tirage.js --expedition` : des expéditions simulées (lots de 3 avec quota, événements, portes, archives) sur six séances : part des questions de la semaine traversée (cible ≥ 60 % quand la semaine a au moins 3 cours chargés), part de chaque famille sur l'expédition (12 à 30 % par famille présente), notions à revoir ≥ 1,5× leur part, aucune question reposée à moins de 60 questions hors Seconde chance, aucune notion deux fois en 10 questions, durée du tirage (médiane < 3 ms, maximum < 10 ms).

### 15.4 perf.js (bout en bout, Chromium)

Départ d'une expédition depuis la campagne ; carte entière visible en 1366 × 768 avec ses cartouches, noms et étiquettes de 14 px au moins ; navigation au clavier d'une halte à l'autre ; escarmouche jouée (toile de bataille jamais réallouée, toujours < 100 ms entre une réponse et la question suivante, JEU.mesure et Event Timing) ; porte de faveur : question puis choix au clavier ; Échap au milieu d'une halte puis « Reprendre » : même position, mêmes vivres ; défaite forcée (vivres à 1, bataille quittée après la 1re vague) : bilan avec renommée > 0, campagne intacte (mêmes provinces, ressources, jauges avant et après) ; export puis import : l'expédition en cours revient.

### 15.5 Validateur

Rien de nouveau dans jeu/data/cours : le validateur ne change pas, sauf la vérification du même numéro de version et, si des répliques d'expédition entrent dans personnages.js, le contrôle 10 existant.

## 16. Risques et questions pour Romain

1. **Frontière** : la demande dit « la semaine scolaire en cours » ; la règle du projet dit « le calendrier ne bloque rien ». Proposé : frontière = dernière semaine qui a un cours déposé, bannière « Cette semaine » pour le calendrier. D'accord ?
2. **Longueur** : trois semaines par expédition (25 à 38 minutes). Préfères-tu deux semaines (18 à 25 minutes), ou le choix au départ ?
3. **Vivres** : une bataille où les murs cèdent coûte un vivre (trois au départ). C'est la seule chose qu'on « perd », et seulement dans l'expédition. Confirmes-tu que cela reste dans l'esprit « pas trop d'échecs » ? Le simulateur vise une expédition sur deux réussie au début, trois sur quatre avec l'Armorial.
4. **Relais** : repartir plus loin quand on a franchi une semaine (proposé), ou toujours repartir de la semaine 1 comme dans Hadès ?
5. **Fermer le jeu au milieu d'une bataille de route** après la première vague : compté comme une retraite (−1 vivre), comme un abandon volontaire ? Ou gratuit ? Proposé : comme une retraite, pour qu'on ne puisse pas « annuler » une vague qui tourne mal en fermant la fenêtre.
6. **Or de route perdu au retour** : clair pour un élève de 13 ans si le jeu le dit avant le Grand Gardien ? Autre solution : le changer en ressources du domaine (1 pour 10) au bilan.
7. **Noms** : « Expédition », « halte », « gardien », « faveur », « renommée », « Armorial », « Serment », « vivres ». Tous changeables avant le code (les identifiants internes ne porteront pas ces mots).
8. **Risque de réglage** : la difficulté des batailles compte par paliers (flèches par soldat) ; la table par semaine sera réglée au simulateur, mais il faudra deux ou trois expéditions réelles pour l'ajuster. Prévoir une ligne de réglage dans config.js (`expedition.difficulte: 1`) pour baisser ou monter tout d'un coup sans attendre une livraison.
9. **Risque de collision** avec les chantiers en cours (bataille.js, recit.js, personnages.js) : les accroches de la section 13 sont toutes des ajouts facultatifs ; les livrer après ces chantiers, et comparer les batailles de campagne graine pour graine avant et après (`simuler-bataille.js --comparer`).

## Annexe A : exemple de route (graine 4F2A-9C01, relais S4, frontière S8, vers l'ouest)

```
Semaine 4 · du 21 au 27 septembre 2026 · carte : la Tour du Col
  1re halte : [Escarmouche · porte : faveur de l'herboriste]  [Archives · renommée ×2]  [Événement : le pont rompu]
  2e halte  : [Embuscade · garnison doublée · porte : faveur du maître d'œuvre (rare 50 %)]  [Marchand]
  3e halte  : [Bivouac]  [Escarmouche · porte : bourse]  [Événement : le défi du champion]
  Gardien de la semaine 4 : le capitaine anglais (2 vagues, place 12)
Semaine 5 · du 28 septembre au 4 octobre 2026 · carte : la Forteresse anglaise
  (3 couches dans la brume, gardien en silhouette)
Semaine 6 · du 5 au 11 octobre 2026 · carte : le Gué
  (3 couches dans la brume) … Grand Gardien : le roi d'Angleterre (3 vagues, place 16)
Semaines 7 et 8 : plus loin sur le parchemin, visibles, hors de cette expédition. Semaine 9 et au-delà : brume, « 6 cours à venir ».
```

## Annexe B : les nombres en une page

| Quoi | Valeur de départ |
|---|---|
| Semaines par expédition | 3 (moins si la frontière est proche) |
| Couches par semaine / haltes par couche / jouées | 3 / 2 ou 3 / 3 + gardien |
| Vivres au départ / maximum | 3 / 5 |
| Questions par escarmouche, embuscade, gardien, Grand Gardien | 3, 6, 6, 9 |
| Part des questions de la semaine traversée | 2 sur 3 (quota), le reste au tirage ordinaire |
| Solidité des places de route | 6, 10, 12, 16 |
| Vagues | 1, 2, 2, 3 |
| Ligne RIVAL d'une semaine | min(4, (semaine − 1) div 2), interpolée, tirs par paliers |
| Faveurs : conseillers / faveurs / rangs / duos | 6 / 18 / 3 / 6 |
| Portes : faveur / bourse / renommée / vivres | 55 / 25 / 10 / 10 % |
| Or de route : escarmouche, embuscade, trésor ; marchand | 20, 35, 25 ; faveur 45, rare 75, affiner 35, vivre 40, plan 15 |
| Renommée : réponse, halte, gardien, Grand Gardien, expédition | 1 ; 4 + S ; 15 + 3S ; 30 + 5S ; +20 |
| Armorial | 9 quartiers, 980 points en tout |
| Serments | 6, ardeur 8 au plus, +10 % de renommée par point |
| Durée visée | 25 à 38 minutes (×1), 20 à 28 (×2), reprise à tout moment |
| Réussite visée (p = 0,7) | expédition S1-S3 : une sur deux sans Armorial, trois sur quatre avec |
