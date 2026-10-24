# Expéditions : une route procédurale sur la carte de campagne (angle Slay the Spire)

Conception écrite le 20 octobre 2026 et **révisée le 24 octobre 2026** contre l'état du code et du contenu (jeu/js/*.js, jeu/data/, docs/JOURNAL.md, rubrique Décisions), à partir des deux demandes de Romain du 16 octobre 2026 :

1. « Le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie. »
2. « Intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles. »

Document de conception seulement : rien ici n'est codé, aucun fichier du jeu n'a été touché. Angle retenu : **le plus proche de Slay the Spire** (carte à rangs et embranchements, choix de route risqué ou tranquille, repos garanti avant le boss, élites espacés, marchand, reliques), greffé sur la boucle « on s'améliore de partie en partie » d'Hadès (faveurs des conseillers pendant la partie, Armorial permanent entre les parties). Deux conceptions sœurs existent dans ce dossier (expeditions-hades.md, angle Hadès ; expeditions-mvp.md, le plus petit mode qui tienne) : la section 22 donne la correspondance de vocabulaire et ce que cette version apporte en propre, pour qu'on puisse prendre dans l'une ou l'autre sans contradiction.

Ce qui a changé depuis le 20 octobre : le vocabulaire est aligné sur les deux conceptions sœurs (haltes, relais, vivres, Armorial) ; la difficulté suit maintenant **la semaine traversée** (palier) et non le seul rang de l'acte, pour que « de plus en plus dur en avançant sur la carte » veuille dire la même chose sur une expédition et sur l'année ; chaque halte de bataille **annonce son butin** (la porte, comme dans Hadès) ; les chiffres de solidité s'appuient sur les mesures du journal (coups portés par niveau à 7 réussites sur 10) et la section 18 commence par une mesure simple (`--vagues`, `--pvRival`) avant le simulateur d'expéditions complet ; les semaines 4 à 8 d'histoire et de géographie sont compilées dans jeu/data/cours (pas encore dans index-cours.js au moment où j'écris), ce qui fixe les exemples (S7 n'a que trois cours au planning).

Lecture rapide : la section 0 résume tout en une page ; les sections 3 à 6 donnent les règles de la route ; 7 les questions ; 8 à 11 l'économie et la progression ; 15 à 17 la technique ; 18 les essais ; 19 le plan de réalisation ; 20 les décisions à valider par Romain ; 22 la correspondance avec les conceptions sœurs.

---

## 0. Résumé en une page

- **Le mode « Expédition »** s'ajoute à la campagne (bouton de menu « Expédition », et une carte « Partir en expédition » dans la grille de la campagne). Une expédition est une partie à part, de 25 à 45 minutes, qu'on peut quitter et reprendre à tout moment entre deux haltes (sauvegardée). Elle se joue sur une **route de parchemin** générée au hasard : des rangs de haltes reliés par des chemins qui se séparent et se rejoignent, l'acte en cours visible en entier (on choisit sa route comme dans Slay the Spire), les actes suivants dans la brume (comme dans Hadès).
- **La route suit les semaines de l'année.** Une expédition traverse trois **actes**, et chaque acte est une **semaine du programme** (« Semaine 6 », « Semaine 7 », « Semaine 8 »). Deux questions sur trois d'un acte viennent des cours de sa semaine (les cours sans semaine, grammaire, anglais, savoir-faire, sont des compagnons de route admis partout), la troisième du tirage ordinaire : équilibre des familles, notions à revoir, Seconde chance, tout reste. Chaque question porte un ruban « Semaine 7 ». La dernière semaine qui a un cours ouvert est la **frontière** : son gardien clôt l'expédition. Au-delà, la brume.
- **On part d'un relais.** Au début, seule la première semaine ouverte sert de relais (S1). Battre le gardien d'une semaine ouvre la semaine suivante comme relais pour les expéditions futures : le raccourci des roguelites, qui fait avancer le joueur dans l'année de partie en partie. Repartir d'un relais ancien reste permis (révision), repartir d'un relais avancé rapporte plus (prime de profondeur).
- **Les haltes** : escarmouche, bataille, élite, embuscade (défense), rencontre (événement à questions), marchand ou forge, coffre, campement (repos ou veillée de révision), gardien de la semaine, gardien de la frontière. Chaque acte : 2 choix au rang 1, 3 au rang 2, repos garanti au rang 3, gardien au rang 4. Un chemin tranquille existe toujours ; le chemin risqué rapporte plus. Chaque halte de bataille **annonce son butin** (la faveur de tel conseiller, une relique, de l'or) : choisir sa route, c'est choisir ce qu'on va gagner.
- **La difficulté monte** avec la semaine traversée (palier 0 pour S1 à S3, 1 pour S4 à S6, 2 pour S7 à S9… jusqu'à 4) et avec le type de halte (escarmouche en dessous du palier, élite et gardien au-dessus, gardien de la frontière deux crans au-dessus, avec des modificateurs annoncés par l'éclaireur : porte de fer, volée d'archers, champion à chaque vague…) et le nombre de vagues (2, puis 3, puis 4). Les batailles sont le moteur actuel, inchangé dans ses règles : 3 questions par vague, or gagné ou perdu, mêlée, IA du seigneur rival.
- **Récompenses de la partie seulement** : or d'expédition, **faveurs** des six conseillers du domaine (chroniqueur, cartographe, herboriste, maître d'œuvre, ménestrel ou maître scribe, interprète), à trois rangs, comme les bienfaits des dieux d'Hadès, et **reliques**. La faveur est offerte par le conseiller annoncé à la porte ; son rang dépend des réponses ; une troisième carte vient toujours de la famille la moins jouée de l'expédition : la variété paie.
- **Vivres** : 3 au départ. Une retraite (tes murs cèdent), un élite ou un gardien qui tient après ses vagues en coûtent un. À zéro, l'expédition s'arrête : retour au domaine avec tout ce qui a été gagné. Jamais une question ne coûte un vivre.
- **Rien de permanent ne se perd jamais.** Ressources du domaine, provinces, bâtiments, arsenal, jauges, renommée et Armorial restent. Une expédition perdue paie quand même sa renommée (« le récit du retour »).
- **Méta-progression** : la **renommée** (jamais perdue) achète des quartiers de **l'Armorial** (le miroir d'Hadès) : vivres de plus, bourse de route, faveur de départ, second souffle, éclaireurs, forge réputée, chemins de traverse, mémoire du chroniqueur. Les relais et le **Livre des expéditions** (Codex) gardent la trace des exploits.
- **Technique** : sauvegarde au schéma 6 (objet `expedition`, migration sans perte), générateur à graine (mulberry32, le même que les simulateurs), deux fichiers nouveaux (jeu/js/expedition.js sans DOM, testé sous Node ; jeu/js/ecran-expedition.js), des points d'accroche minces et facultatifs dans l'existant (`JEU.bataille.lancer(lieu, exp)`, `options.rival`, `options.championChaqueVague`, `options.permanents`, `JEU.recit.suite` avec `quota`, `cadre.semaine`). Aucune image nouvelle pour le MVP : icônes Game-icons, parchemin, nappes de brume et cartes de bataille existantes.
- **Essais** : tests.js (générateur, contraintes, migration, vivres, renommée), perf.js (parcours clavier, moins de 100 ms entre deux questions), simuler-bataille.js (`--vagues`, `--pvRival` d'abord, puis `--expedition`), mesurer-tirage.js `--expedition` (part des questions de la semaine, équilibre des familles).

---

## 1. Ce que demande Romain, ce que le jeu impose

### 1.1 Les deux demandes

- Plus long, procédural, de plus en plus dur, roguelite « à la Hadès » : on progresse de partie en partie.
- Les semaines doivent se voir : la partie avance semaine par semaine, les questions d'une étape viennent surtout d'une semaine donnée, l'étape porte sa semaine, les semaines suivantes arrivent quand on avance, la semaine en cours est la frontière.

### 1.2 Les règles fermes qui encadrent (CLAUDE.md et cahier des charges)

| Règle | Conséquence pour les expéditions |
|---|---|
| Jamais de chrono | Aucune limite de temps sur la route ni dans les haltes ; les vagues se regardent comme aujourd'hui. Une expédition se compte en haltes, jamais en minutes. |
| Environ 7 réussites sur 10 | Le tirage garde son niveau conseillé ; les haltes ne changent pas la difficulté des questions, seulement celle des batailles (rival, vagues, solidité). |
| Une erreur ne fait jamais perdre un bâtiment, une province ni une ressource du royaume ; en bataille seulement, un peu d'or de la bataille en cours | Inchangé dans les batailles d'expédition (orPerduErreur). Dans les rencontres, coffres et veillées : gains seulement. Les vivres ne tombent que sur une issue de bataille, jamais sur une réponse. |
| Une question ratée revient (« Seconde chance ») | Le tirage des expéditions passe par `JEU.recit.suite` : la file des rappels suit le joueur sur la route, comme partout. |
| Un cours s'ouvre dès que son fichier existe ; le calendrier ne bloque rien | La frontière est la dernière semaine qui a au moins un cours ouvert, pas la semaine du calendrier. Un cours déposé en avance ouvre sa semaine. |
| Un cours pas encore ouvert reste dans la brume : titre visible, sans question, indice ni aperçu | Les actes d'après la frontière montrent seulement « Semaine 9 · dans la brume » et le nombre de cours prévus au planning (déjà visible dans l'écran Cours) : aucun titre, aucune halte. |
| Chaque question est posée dans le récit | Les conseillers du domaine posent les questions sur la route (nouveaux cadres : route, veillée, coffre), le conseil de guerre dans les batailles. |
| Cours des semaines 1 à 6 présumés acquis | Ils sont des actes comme les autres ; leur part de questions vient d'abord des fiches à revoir et des notions dues. |
| Pas d'épreuve de validation | Un gardien battu ne change ni suivi.js ni l'état d'un cours : il vaut de la renommée, un relais et un sceau sur le parchemin de l'année. |
| Style Total War, enluminure, héraldique ; ni pixel art ni manga | Route de parchemin à l'encre, médaillons, gonfanons aux couleurs des camps, lettrines Cinzel, nappes de brume existantes. |
| Conflits : camps politiques, ton neutre ; aucune figure religieuse ; armées du cours, sinon « un seigneur rival » | Les gardiens sont « le champion du roi d'Angleterre », « la garnison de l'émir de Cordoue » (personnages.js, titre seul) ; faute de personnage ouvert, « le champion d'un seigneur rival ». Les textes de la route sont du jeu : aucun fait historique, aucune religion. |
| Contenu des cours uniquement depuis les fichiers déposés | Les textes d'ambiance des haltes, des faveurs et des reliques ne contiennent aucune information de cours (même règle que les répliques de personnages.js, contrôle 10 du validateur). |
| Bonus jamais en bataille, dans un siège ou un boss | Le tirage les exclut déjà ; rien à faire. |
| Moins de 100 ms entre une réponse et la question suivante | Le tirage se fait au début d'une halte ou d'une vague, jamais entre deux questions ; la route n'est pas redessinée pendant une partie ; les faveurs sont résolues une fois, en options de `M.creer`. |
| Sauvegarde avec schéma et migration sans perte | Schéma 6 (le prochain numéro libre au 24/10/2026 : à vérifier dans sauvegarde.js le jour de la livraison). |

### 1.3 Décisions de cadrage

- Une expédition est une partie **à part** de la campagne : elle ne prend ni ne rend de province, mais elle y renvoie (section 12). La campagne reste la « maison » du roguelite : c'est là qu'on dépense la renommée et qu'on repart.
- Nom retenu : **Expédition** (le joueur « part en expédition »). Variante possible : « Chevauchée » (plus médiéval, mais le mot évoque des raids contre les campagnes : moins neutre). Le nom ne touche qu'aux textes.
- Vocabulaire (aligné sur les conceptions sœurs) : **halte** (une case de la route), **relais** (semaine d'où l'on peut partir), **vivres** (le moral de l'expédition, 3 au départ), **Armorial** (améliorations permanentes), **porte** (le butin annoncé d'une halte), **faveur** (don temporaire d'un conseiller), **relique** (objet passif de l'expédition).

---

## 2. La boucle de jeu, en une image

```
   LE DOMAINE / LA CAMPAGNE (la maison)
   │  renommée → Armorial (quartiers permanents)
   │  relais ouverts, Livre des expéditions
   ▼
   DÉPART : front (ouest ou sud), relais (semaine), graine
   │
   ▼
   ACTE 1 = Semaine S     ACTE 2 = Semaine S+1    ACTE 3 = Semaine S+2 (ou frontière)
   rang 1 (2 choix)       rang 1 (2 choix)        rang 1 (2 choix)
   rang 2 (3 choix)       rang 2 (3 choix)        rang 2 (3 choix, un élite)
   rang 3 (campement +1)  rang 3 (campement +1)   rang 3 (campement +1)
   GARDIEN                GARDIEN                 GARDIEN (de la frontière : 4 vagues)
   │                      │                       │
   │  chaque halte : questions → or d'expédition, faveurs, reliques, vivres
   │  vivres à zéro → retour au domaine (renommée gardée)
   ▼
   FIN : renommée, chronique, ressources déjà gagnées, nouveau relais
```

Le joueur voit l'acte en cours en entier (le choix de route compte, comme sur la carte d'un acte de Slay the Spire), et seulement la bannière de semaine et la silhouette du gardien pour les actes suivants (la brume d'Hadès). Sur la route, chaque halte de bataille montre sa **porte** : ce qu'on y gagne si on l'emporte.

---

## 3. La route de l'année : actes, semaines, frontière, relais

### 3.1 Semaines ouvertes et frontière

- **Semaine d'un cours** : `semaine` de son entrée du planning (jeu/data/planning.js). Les cours hors planning (grammaire `langue-*`, anglais `anglais-*`, savoir-faire `methode-*`) n'ont pas de semaine : ce sont des **compagnons de route**, admis dans tous les actes (ils avancent au rythme de l'élève).
- **Semaine ouverte** : une semaine du planning dont au moins un cours est accessible (`JEU.progression.coursAccessibles`) et a des questions jouables. Au 24/10/2026 : S1, S2, S3 d'après index-cours.js ; S4 à S8 dès que les fichiers déjà compilés d'histoire et de géographie y seront listés (histoire-s04-1, s04-3, s05-1, s05-2, s06-1, s07-2, s08-1, s08-2 ; geographie-s04-1, s07-1, s08-1, s08-2), puis SVT, physique et littérature au fur et à mesure.
- **Frontière** : la plus grande semaine ouverte (34 au plus). Le calendrier (`JEU.calendrier.semaine`) ne sert qu'à l'affichage (« cette semaine » sur la bannière de l'acte) ; il ne bloque rien, comme le veut CLAUDE.md. Si Romain dépose un cours de S9 pendant S8, S9 est ouverte.
- **Semaine sans cours** (trou dans les dépôts) : elle n'est pas un acte ; la route passe à la semaine ouverte suivante, et la bannière de l'acte le dit (« Semaine 5 traversée sans halte : ses cours ne sont pas encore déposés »).
- **Semaine maigre** (S7 n'a que trois cours au planning : géographie, lecture suivie, histoire ; S10 n'en a que trois aussi) : elle reste un acte ; le mélange se relâche de lui-même (section 7.2) et les compagnons de route prennent le relais.

### 3.2 Les actes d'une expédition

- Une expédition compte **3 actes** : les trois semaines ouvertes consécutives à partir du relais choisi. S'il en reste moins de trois avant la frontière, l'expédition en a 2 ou 1 ; le dernier acte dont la semaine est la frontière se termine par le **gardien de la frontière** (4 vagues au lieu de 3) et la fin victorieuse de l'expédition.
- Chaque acte porte sa semaine partout : bannière de l'acte sur la route, titre des batailles (« Escarmouche · Semaine 7 »), carte de l'éclaireur au début de chaque vague (« Nous traversons les terres de la semaine 7 : ses cours sont en tête »), ruban de chaque question (section 7.4).
- Au début d'un acte, un parchemin présente la semaine : numéro, dates du calendrier (`JEU.calendrier.libelle`), liste des cours **ouverts** de la semaine (titres du planning, déjà visibles dans l'écran Cours ; un cours de la semaine encore sans fichier est compté « à venir », sans titre), et le gardien qui attend au bout.

### 3.3 Relais (le raccourci des roguelites)

- La liste `meta.relais` des semaines d'où l'on peut partir. Au début : la première semaine ouverte (S1).
- **Battre le gardien d'une semaine S ouvre S+1 comme relais** (si S+1 est ouverte, ou dès qu'elle le devient). Battre le gardien de la frontière n'ouvre rien de plus, tant que la frontière n'avance pas.
- Exemple avec S1 à S8 ouvertes : expédition 1 depuis S1 (S1, S2, S3) ; victoire au gardien de S3 : relais S4 ; expédition 2 (S4, S5, S6) : relais S7 ; expédition 3 (S7, S8 + gardien de la frontière). Trois expéditions réussies amènent à la frontière ; ensuite, chaque semaine réelle ajoute une semaine à la route, et les expéditions repartent du relais le plus avancé : les semaines récentes sont révisées le plus, les anciennes par le tiers de tirage ordinaire et les notions à revoir.
- Le joueur choisit librement son relais parmi ceux qu'il a ouverts. Repartir de S1 reste possible (révision des débuts) : même renommée de haltes, sans la prime « semaine franchie pour la première fois » et avec une prime de profondeur plus petite (section 11.1). Le relais proposé par défaut est le plus avancé.

### 3.4 Ce qui n'a pas été retenu

- Repartir toujours de S1 (fidèle à Hadès) : les six premières semaines, présumées acquises, auraient pris toutes les questions ; la frontière aurait été hors de portée en 40 minutes dès novembre.
- Un acte par semaine pour toute l'année dans une seule expédition : 34 actes, plusieurs heures.
- Un acte par « ère » d'histoire : les autres matières n'ont pas d'ères, et Romain demande explicitement les semaines.
- Départ libre sur n'importe quelle semaine ouverte sans relais (la conception MVP le propose) : plus simple, mais on perd le « on avance de partie en partie » demandé. Les deux sont compatibles : le relais est un défaut, et un réglage `relaisLibres: true` dans config.js peut ouvrir toutes les semaines si Romain le préfère.

---

## 4. Génération procédurale de la carte d'un acte

### 4.1 Forme

Quatre rangs par acte, de gauche (départ) à droite (gardien), comme les routes de la carte de campagne. C'est la carte de Slay the Spire (15 étages, 7 colonnes, 3 à 4 départs) compressée pour tenir en 10 à 15 minutes par acte, en gardant ses règles : embranchements qui se séparent puis se rejoignent, repos garanti avant le boss, élite jamais en début d'acte, jamais deux haltes du même type côte à côte, un chemin « tranquille » toujours possible.

```
 rang 1          rang 2            rang 3           rang 4
 (2 haltes)      (3 haltes)        (2 haltes)       (1 halte)

 ○ A ──────┬──── ○ D ────────────── ○ G (campement) ─┐
           │      ╲                 ╱                │
 ○ B ──────┼──── ○ E ──────────────┤                 ├── ◎ GARDIEN
           │      ╱                 ╲                │
           └──── ○ F ────────────── ○ H (forge, coffre ou rencontre) ─┘
 arêtes : A→D, A→E ; B→E, B→F ; D→G ; E→G, E→H ; F→H ; G→gardien ; H→gardien
```

Quatre haltes visitées par acte, douze par expédition de trois actes, plus les trois gardiens qui sont des haltes. Sur la route, les trois actes se suivent de gauche à droite dans un même parchemin qui défile (section 16).

### 4.2 Table des haltes par rang et par acte

| Rang | Acte 1 (a = 0) | Acte 2 (a = 1) | Acte 3 (a = 2, ou dernier) |
|---|---|---|---|
| 1 | toujours { escarmouche, rencontre }, ordre tiré | idem | idem |
| 2 | 3 tirées sans remise, poids : bataille 2, rencontre 2, marchand 2, coffre 1, embuscade 1. **Jamais d'élite au premier acte.** | bataille 2, élite 1,5, rencontre 1,5, marchand 1,5, coffre 1, embuscade 1 | **un élite garanti** parmi les trois ; les deux autres : bataille 2, rencontre 1,5, marchand 1,5, coffre 1, embuscade 1 |
| 3 | toujours { campement, X } ; X = forge si aucun marchand au rang 2, sinon tiré parmi { coffre, rencontre } | idem | idem |
| 4 | gardien de la semaine | gardien | gardien (gardien de la frontière si la semaine est la frontière) |

Contraintes vérifiées par le générateur (et par tests.js sur 200 graines) :

1. Deux haltes du même type ne se touchent pas dans un même rang.
2. Au rang 2, au moins une halte sans bataille (rencontre, marchand ou coffre) : le **chemin tranquille** (rencontre → marchand ou coffre → campement → gardien) existe dans chaque acte.
3. Un élite n'est jamais le seul successeur d'une halte du rang 1 : il y a toujours une autre route.
4. Au plus un élite par acte ; jamais deux embuscades dans la même expédition ; jamais deux coffres dans le même acte.
5. Le campement est toujours au rang 3 (repos garanti avant le gardien), joignable depuis toutes les haltes du rang 2 sauf une au plus.
6. Chaque halte a au moins un successeur ; le gardien est joignable depuis toute halte du rang 1.
7. « Chemins de traverse » (Armorial) : le rang 2 passe à 4 haltes ; arêtes A→D,E ; B→F,G ; plus une arête croisée tirée (A→F ou B→E).

### 4.3 Les portes : le butin annoncé

Chaque halte de bataille (escarmouche, bataille, élite, embuscade, gardien) porte une **porte**, tirée à la génération et dessinée sur la route : le médaillon du conseiller dont on gagnera la faveur, ou une relique (élites, gardiens), ou une bourse d'or. Règles :

- Dans un acte, les conseillers des portes « faveur » tournent entre les **familles qui ont des questions** (histoire, géographie, SVT, physique-chimie, français, anglais), dans un ordre tiré : un acte ne propose jamais deux fois la même famille à ses portes tant qu'il reste une famille non proposée. Le joueur qui veut varier ses matières le peut en lisant la route ; celui qui suit toujours le même conseiller voit sa faveur monter en rang (section 9), mais rate les autres.
- Les élites et le gardien de la frontière annoncent une relique ; le gardien de la semaine annonce une faveur rare garantie.
- Le butin annoncé est **gagné si la halte est réussie** (victoire, ou tenu pour une escarmouche, une bataille, une embuscade). La troisième carte de faveur (famille la moins jouée) et l'or des bonnes réponses viennent en plus (section 5.2).
- Une rencontre, un coffre, un campement n'annoncent rien : leur issue dépend du texte de la carte.

### 4.4 Algorithme (jeu/js/expedition.js, sans DOM)

```js
// generer(graine, { semaines: [6, 7, 8], front: "angleterre", frontiere: 8, familles: ["histoire", ...], options: { traverse: false } })
// → { version: 1, graine, front, actes: [ { semaine, frontiere: bool, haltes: [ { id: "a0r1n0", rang, type, x, y,
//     suivants: ["a0r2n0", "a0r2n1"], carte: "gue", modif: null, porte: { genre: "faveur", conseiller: "svt" }, fait: false } ] } ] }
function generer(graine, params) {
  var r = JEU.alea(graine);                       // mulberry32, le même que les simulateurs
  var portes = tourniquet(r, params.familles);    // ordre des familles pour les portes « faveur »
  return { version: 1, graine: graine, front: params.front, actes: params.semaines.map(function (s, a) {
    var dernier = a === params.semaines.length - 1;
    var rang1 = melanger(r, ["escarmouche", "rencontre"]);
    var rang2 = tirerSansRemise(r, POIDS_RANG2[Math.min(a, 2)], params.options.traverse ? 4 : 3, contraintesRang2(a));
    var rang3 = ["campement", rang2.indexOf("marchand") < 0 ? "forge" : choisir(r, ["coffre", "rencontre"])];
    var rang4 = [s === params.frontiere && dernier ? "frontiere" : "gardien"];
    var haltes = poser([rang1, rang2, rang3, rang4], r, a);   // x par rang, y étalés, gigue ±6 %
    relier(haltes, params.options.traverse, r);               // arêtes de la figure 4.1 (ou 4.2, contrainte 7)
    haltes.forEach(function (n) {
      n.carte = carteDe(n.type, params.front, r);
      n.modif = modificateurDe(n.type, a, r);
      n.porte = porteDe(n.type, portes);
    });
    return { semaine: s, frontiere: s === params.frontiere, haltes: haltes };
  }) };
}
```

- `carteDe` : escarmouche et bataille sur gue, foret, moulin ; élite sur col ou chateau ; gardien sur chateau ; gardien de la frontière sur col (la boucle autour de la place forte) ; embuscade sur domaine. Front du sud : jeu/js/bataille.js choisit déjà la variante « -sud » d'après le camp ; rien à faire.
- `modificateurDe` : un modificateur pour chaque élite et chaque gardien, deux pour le gardien de la frontière (section 6.3), aucun pour les autres.
- Une carte qui viole une contrainte est regénérée avec graine + 1 (vingt essais au plus), puis une carte de secours fixe prend le relais : le jeu ne bloque jamais.
- La carte générée est **enregistrée telle quelle** dans la sauvegarde (une quarantaine de petits objets) ; la graine sert aux tests et au Livre des expéditions (« sceau n° 48213 »), pas à regénérer en cours de partie : une nouvelle version du générateur ne change jamais une expédition en cours.

### 4.5 Exemple de carte tirée (graine 7, front de l'ouest, S6 à S8)

```
Semaine 6 (palier 1)                  Semaine 7 (palier 2)                   Semaine 8 · frontière (palier 2)
rencontre ─┬─ bataille [herboriste] ─ campement ─┐   escarmouche [chroniqueur] ─┬─ élite [relique] ─ campement ─┐   rencontre ─┬─ coffre ──── campement ─┐
           ├─ marchand ─────────────┤            ├─ GARDIEN [rare]           ├─ rencontre ────────┤           ├─ GARDIEN   ├─ élite [relique] ──┤         ├─ GARDIEN DE LA FRONTIÈRE [relique]
escarmouche┴─ coffre ──── coffre ───┘            │   rencontre ──────────────┴─ marchand ── forge ─┘   [rare]   escarmouche┴─ bataille [interprète] ─ rencontre ─┘
[ménestrel]                                                                                                     [cartographe]
```

(Entre crochets : la porte de la halte.) S7 est une semaine maigre (trois cours au planning, deux fichiers aujourd'hui) : ses questions de semaine viennent d'histoire, de géographie et de lecture suivie, le reste du tirage ordinaire et des compagnons de route ; l'équilibre des familles se rattrape sur l'expédition entière (section 7.2).

---

## 5. Les haltes

### 5.1 Tableau

Durées estimées à vitesse ×1 : 15 s par question (25 s avec le panneau d'erreur), 30 s de dépense d'or par vague, 60 s de vague (40 s à vitesse ×1,5, voir 13.2), 1 minute par halte sans bataille.

| Halte | Icône (Game-icons déjà dans le jeu) | Ce qui s'y passe | Questions | Durée | Récompenses (palier 0 → 2 ; +5 or par palier au-delà) | Risque |
|---|---|---|---|---|---|---|
| **Escarmouche** | assaut (épées croisées) | Bataille de 2 vagues contre un détachement ; niveau = palier − 1 (0 au moins) | 6 | 4 à 5 min | victoire : 25 / 30 / 35 or d'expédition et la porte ; tenu : la moitié de l'or et la porte ; +2 or par bonne réponse | retraite : −1 vivre |
| **Bataille** | lances | 2 vagues, niveau = palier, camp adverse plus solide | 6 | 5 min | 35 / 40 / 45 or et la porte ; tenu : la moitié de l'or et la porte | retraite : −1 vivre |
| **Élite** | defi (emblème d'épées), cordon rouge | 3 vagues, niveau = palier + 1, un modificateur annoncé par l'éclaireur (6.3) | 9 | 7 min | 55 / 65 / 75 or, la porte (relique parmi 2), 1 faveur parmi 3 dont une rare au moins | tenu ou retraite : −1 vivre |
| **Embuscade** | lances + torche | Défense du domaine (mode `defense` du moteur : troupes d'assaut, coups aux murs ×2), 2 vagues, niveau = palier − 1 ; tenu = réussite | 6 | 4 à 5 min | 30 / 35 / 40 or et la porte | retraite : −1 vivre |
| **Rencontre** | trompe | Une carte d'événement de route : récit, 2 ou 3 questions, parfois un choix (5.3) | 2 à 3 | 1 à 1,5 min | 10 à 30 or, parfois une faveur commune ou une relique | aucun (rien n'est perdu) |
| **Marchand** | marchand (chariot) | Six étals, prix en or d'expédition (8.2) | 0 (ou 1 pour marchander) | 1 min | ce qu'on achète | aucun |
| **Forge** | forge (enclume) | Comme le marchand, plus la **trempe** : monter d'un rang une faveur possédée (40 or), ou +1 niveau d'arsenal d'un type pour l'expédition (35 or) | 0 ou 1 | 1 min | — | aucun |
| **Coffre** | tresor | Un coffre scellé : une question (niveau 2 ou 3) ; juste : relique ou 40 / 50 / 60 or au choix ; fausse : 15 or quand même (« la serrure a cédé à moitié ») et la question reviendra en Seconde chance | 1 | 0,5 min | voir à gauche | aucun |
| **Campement** | camp (feu) | Repos (+1 vivre, jusqu'au maximum) **ou** veillée : 3 questions tirées d'abord dans les fiches à revoir, +10 or chacune ; 3 sur 3 : une faveur possédée monte d'un rang | 0 ou 3 | 0,3 à 1,2 min | voir à gauche | aucun |
| **Gardien de la semaine** | heaume sur écu du camp | 3 vagues, niveau = palier + 1 (4 au plus), modificateur ; les coups portés restent d'un assaut à l'autre | 9 | 7 min | 60 / 70 / 80 or, la porte (faveur rare garantie parmi 3), 1 relique, +1 vivre, renommée, relais S+1 | le gardien tient après 3 vagues : −1 vivre, on peut réassiéger (ses coups restent) ; retraite : −1 vivre |
| **Gardien de la frontière** | couronne sur écu | 4 vagues, niveau = palier + 2 (4 au plus), deux modificateurs | 12 | 9 min | 100 or (converti en renommée à la fin, 1 pour 5), la porte (relique), fin victorieuse | idem |

« Tenu » (toutes les vagues repoussées sans abattre le camp adverse) laisse toujours passer sur une escarmouche, une bataille ou une embuscade ; il ne coûte un vivre que sur un élite et un gardien.

### 5.2 Récompense liée aux réponses, pas au hasard seul

- L'or de la halte compte les bonnes réponses : +2 or d'expédition par bonne réponse en bataille, +5 par bonne réponse de rencontre, de veillée ou de coffre, en plus du socle du tableau.
- Le **rang** d'une faveur offerte dépend de la réussite à la halte : moins de 60 % de bonnes réponses : commune 85 %, rare 15 % ; de 60 à 89 % : commune 70 %, rare 25 %, légendaire 5 % ; 90 % et plus : commune 45 %, rare 45 %, légendaire 10 %. Un élite ou un gardien garantit une rare.
- Les trois cartes de faveur : la première et la deuxième du **conseiller de la porte** (deux faveurs différentes de ce conseiller, ou la même à deux rangs si l'une est déjà possédée), la troisième du conseiller de la **famille la moins jouée depuis le début de l'expédition** (compteur `stats.parFamille`) : qui varie les matières voit plus de faveurs différentes. « Passer » rapporte +15 or.

### 5.3 Rencontres (événements de route)

Dix cartes au départ, dans jeu/js/expedition.js (textes du jeu, sans fait historique, sans religion, sans nom propre, sans lieu de culte ; 40 mots au plus). Toutes gardent la règle des événements de la campagne : rien n'est jamais perdu.

| Rencontre | Choix et questions | Issue |
|---|---|---|
| Le passeur du gué | Payer 20 or, ou répondre à 2 questions | 2 sur 2 : passage et +15 or ; 1 sur 2 : passage ; 0 : passage quand même, sans rien |
| Le colporteur | 3 questions | +10 or chacune ; 3 sur 3 : une faveur commune au choix parmi 2 |
| La meunière | 2 questions pour aider à réparer la roue | 2 sur 2 : +1 vivre ; sinon +10 or |
| Le messager du souverain | Missive du souverain (si un personnage est ouvert), puis 2 questions | +4 renommée tout de suite, +10 or |
| La tour en ruine | 1 question de niveau 3 (une vieille tour de guet, pas un lieu de culte) | juste : relique au choix parmi 2 ; fausse : +15 or |
| Le tournoi du bourg | Le joueur choisit une matière parmi les deux familles les moins jouées de l'expédition, puis 3 questions de cette famille | 2 sur 3 : faveur de ce conseiller parmi 2 ; 3 sur 3 : rare garantie |
| Le marché aux chevaux | Payer 30 or, ou 2 questions | cavaliers +1 niveau d'arsenal pour l'expédition (2 sur 2 ou paiement) ; sinon +10 or |
| Le voyageur lettré | 2 questions de la famille français | +15 or chacune |
| L'orage | 2 questions (abriter la colonne) | 1 sur 2 au moins : +20 or ; 0 : rien, la route continue |
| Les éclaireurs du rival | Missive du rival (défi), 2 questions | 2 sur 2 : le modificateur du prochain élite ou gardien est révélé et sa première vague perd une troupe (espion) ; sinon +10 or |

Les rencontres tirent leurs questions avec le mélange de l'acte (section 7.2), niveaux 1 et 2 comme les événements de la campagne ; le niveau 3 de la tour en ruine passe par `JEU.questions.avecNiveaux([2, 3], …)`.

---

## 6. Les batailles d'expédition

### 6.1 Ce qui ne change pas

Le moteur (jeu/js/bataille-moteur.js) et le rendu (jeu/js/bataille.js) sont ceux de la campagne : préparation avec 3 questions par vague (QUESTIONS_PAR_VAGUE), or de la bataille gagné (12 + Savoir, coup d'éclat au 3e succès) ou perdu (6, jamais sous zéro), tours, troupes, mêlée en bataillons, sang réglable, IA du seigneur rival (tours dès le début, garnison, guetteurs, postures), mot du rival sous son médaillon, bilan. Les questions sont tirées comme aujourd'hui, niveaux 1 à 3, avec le mélange de l'acte (7.2). Le joueur garde son arsenal et ses jauges de la campagne (`JEU.campagne.options(niveau)`) : la force du royaume compte dans les expéditions, c'est une méta-progression de plus, déjà là.

### 6.2 Palier de la semaine, niveau de la halte, solidité (valeurs de départ, à régler au simulateur)

Le moteur règle le seigneur rival par une ligne de la table `RIVAL` (niveaux 0 à 4 des provinces, réglés au simulateur le 16/10/2026). Les expéditions choisissent la ligne d'après la **semaine traversée** et le **type de halte** :

- **Palier d'une semaine** : `palier(S) = min(4, floor((S − 1) / 3))` : S1 à S3 → 0 ; S4 à S6 → 1 ; S7 à S9 → 2 ; S10 à S12 → 3 ; S13 et au-delà → 4. Au-delà de S13, la **profondeur** s'ajoute par `options.rival` (points de vie des troupes rivales × (1 + 0,04 × (S − 12)), plafond × 1,5 ; garnison + 1 à S20 et S28) : extension, à mesurer.
- **Niveau d'une halte** = palier + décalage du type, borné entre 0 et 4 :

| Halte | Décalage | Vagues | Solidité du camp adverse (pvRival) = base + niveau | Exemple S6 → S8 (paliers 1, 1, 2) |
|---|---|---|---|---|
| Escarmouche | −1 | 2 | 4 + niveau | niveaux 0, 0, 1 ; solidités 4, 4, 5 |
| Bataille | 0 | 2 | 5 + niveau | 1, 1, 2 ; 6, 6, 7 |
| Embuscade (défense) | −1 | 2 | ton château : 20 + Peuple + remparts (comme aujourd'hui) ; camp adverse 12 | 0, 0, 1 |
| Élite | +1 | 3 | 8 + niveau | 2, 2, 3 ; 10, 10, 11 |
| Gardien de la semaine | +1 | 3 | 7 + niveau | 2, 2, 3 ; 9, 9, 10 |
| Gardien de la frontière | +2 | 4 | 9 (fixe) | 4 ; 9 |

Pourquoi des solidités si petites à côté des places fortes de la campagne (16 à 32) : la campagne est faite pour des sièges en plusieurs batailles de 4 vagues (2 à 5 batailles par province) ; ici chaque halte doit se jouer en un seul passage de 2 ou 3 vagues. D'après les mesures du 16/10/2026 (journal, Décisions ; joueur équilibré, 80 graines par province), une bataille de 4 vagues porte en moyenne, à p = 0,7 : 12,6 coups au niveau 0, 8,9 au niveau 1, 9,1 au niveau 2, 14,7 au niveau 3 (cartes plus ouvertes), 6,8 au niveau 4 ; à p = 0,8 : 14,7 ; 11,4 ; 13,4 ; 19,8 ; 8,9. La première vague en porte peu (l'armée est petite), les suivantes de plus en plus (revenu des troupes) : deux vagues portent **sans doute** 3 à 5 coups et trois vagues 7 à 9, mais ce n'est pas mesuré : c'est la **première mesure à faire** (18.3, `--vagues`). Cibles : escarmouche gagnée du premier coup 6 fois sur 10 à p = 0,7 (tenu sinon, qui laisse passer), gardien battu du premier assaut 6 fois sur 10 et en deux assauts 9 fois sur 10, frontière en deux assauts 8 fois sur 10. Ce sont des **camps retranchés** (palissade, tentes), pas des forteresses : le rendu garde la place forte du camp adverse (image existante, état « abîmé » dès la moitié), la jauge dit « Camp du gardien 6 / 9 ».

### 6.3 Modificateurs d'élite et de gardien

Un par élite et par gardien (deux pour le gardien de la frontière), tiré à la génération, annoncé par la carte de l'éclaireur au début de la bataille (même gabarit que la carte du mot du rival : avant la première question, jamais entre deux) et sur la route avec le quartier « Éclaireurs » de l'Armorial. Chacun s'écrit comme une surcharge de la ligne RIVAL du niveau (`options.rival`, section 17.2) ou comme un modificateur permanent (`options.permanents`) :

| Modificateur | Effet | Phrase de l'éclaireur |
|---|---|---|
| Porte de fer | `rival: { garnison: +1, garde: ×1,3 }` | « Sa porte est tenue par des hommes d'armes en cuirasse : il faudra les battre avant de toucher ses murs. » |
| Volée d'archers | `rival: { toursDepart: +1 }` | « Une tour de plus garde sa route : avance tes troupes sous le couvert de tes propres tours. » |
| Trésor de guerre | `rival: { tresor: +30, impot: +20 }` | « Il a de l'or plein ses coffres : attends-toi à des renforts à chaque vague. » |
| Marche forcée | `rival: { ecartSortie: −0,2 s }` (plancher 0,5 ; VAGUES.ecartSortie lu par ligne) | « Ses troupes sortent serrées : tes tours auront moins de temps entre deux. » |
| Champion à chaque vague | `championChaqueVague: true` : un champion ferme chaque vague, pas seulement la dernière | « Son champion mène chaque vague : garde des piquiers pour le ralentir. » |
| Guetteurs vigilants | `rival: { alerte: 10 }` (IA.alerte 20 → 10 pour cette bataille) | « Ses guetteurs voient tout : une ruée de troupes sera accueillie par toute sa garnison. » |
| Pluie | `permanents: { pluie: true }` : toutes les troupes marchent moins vite, à toutes les vagues (le moteur a déjà `pluie`, mais `p.modificateurs` est vidé à chaque fin de vague : d'où `permanents`) | « La pluie détrempe la route : tout le monde avance au pas. » |

Ces sept effets suffisent au MVP (les trois premiers d'abord) ; d'autres viendront des mesures (une baliste dès le départ, cavalerie légère en renfort à chaque vague…).

### 6.4 Comment la profondeur se lit dans la bataille

- Niveau RIVAL de 0 à 4 : les mêmes paliers que les provinces, déjà équilibrés : troupes plus solides, tours qui tirent plus fort, garnison plus coriace, IA plus riche.
- Nombre de vagues : 2 au début de l'acte, 3 pour les élites et gardiens, 4 à la frontière.
- Modificateurs cumulés : un à l'élite, un au gardien, deux à la frontière.
- Les camps adverses des gardiens gardent les coups reçus (`enCours.gardiens[acte].pv`), comme les places fortes de la campagne : un gardien qui tient n'est pas un mur, c'est un vivre de moins et un siège qui reprend là où il s'est arrêté.
- Dans l'année : S1 à S3 se jouent au palier 0 (escarmouches de niveau 0, gardiens de niveau 1), S7 à S9 au palier 2 (escarmouches 1, gardiens 3, frontière 4). L'Armorial et l'arsenal de la campagne compensent au fil des semaines.

---

## 7. Les questions : le cœur du mode

### 7.1 Un seul tirage

Tout passe par `JEU.recit.suite` (jeu/js/recit.js) : équilibre des familles de matières (parts égales, coup de pouce 1,5 pour une famille à revoir), priorités dans une matière (50 % à revoir, 40 % récents, 10 % solides), anti-répétition (fenêtre de 60 questions, repos des fiches), niveau conseillé (7 sur 10), file des « Seconde chance » placée à son rang. Les expéditions n'y ajoutent qu'un **quota de semaine**.

### 7.2 Le mélange de l'acte : deux questions de la semaine, une du tirage ordinaire

Option `quota` de `suite(nombre, options)` (une dizaine de lignes ; la conception MVP en donne l'esquisse, reprise ici) : `{ nombre: k, filtre: fonction(q) }`. Le tirage commence par k questions qui passent le filtre, avec toutes les règles (essais à souplesse 0 puis 1), puis complète le lot par le tirage ordinaire. Si la semaine n'a pas assez de questions libres, le quota se relâche de lui-même : le lot est toujours plein.

```js
// expedition.js : filtre de semaine d'un acte
function deLaSemaine(semaine) {
  return function (q) { var s = JEU.progression.semaineDe(q.cours); return s === null || s === semaine; };
}
// lot d'une vague : 2 de la semaine (ou compagnons de route), 1 ordinaire ; rencontre de 3 : 2 + 1 ; de 2 : 1 + 1
tirer = function (n, posees) {
  return enBataille(function () {
    return JEU.recit.suite(n, { exclure: ids(posees), filtre: pasMemeFiche(posees), completer: true,
      quota: { nombre: Math.round(n * 2 / 3), filtre: deLaSemaine(acte.semaine) } });
  });
};
```

- `JEU.progression.semaineDe(coursId)` : la semaine de l'entrée du planning, `null` pour langue, anglais et méthode (compagnons de route, admis partout ; l'équilibre des familles les tient à leur part).
- Veillée du campement : quota « fiche à revoir » (`JEU.progression.fichesARevoir`) à la place du quota de semaine.
- Les familles restent équilibrées **sur la durée** (mémoire `historique` de recit.js, oubli 0,85) : une semaine sans SVT ni physique (S7) voit son tiers ordinaire et les compagnons de route rattraper ces familles, et la semaine suivante compense. Mesure visée (18.4) : chaque famille entre 12 et 28 % sur une expédition, part des questions de la semaine de l'acte entre 55 et 70 % (compagnons de route comptés à part).
- Les fiches à revoir (a-retravailler.js, cours « à revoir » de suivi.js) gardent leur priorité dans les deux parts, et la veillée du campement les cible.
- Le niveau conseillé et les « Seconde chance » sont inchangés : une question ratée dans une rencontre peut revenir dans la bataille suivante, où qu'elle soit sur la route ; une question de niveau 3 ratée attend une bataille (règle actuelle).

### 7.3 Nombre de questions par expédition

Chemin tranquille : 3 (rencontre) + 1 (coffre) + 0 (campement, repos) + 9 (gardien) = 13 par acte, 39 pour trois actes (42 avec la frontière). Chemin de bataille : 6 + 9 + 3 (veillée) + 9 = 27 par acte, 81 au plus. Expédition type : 55 à 60 questions, soit l'équivalent de cinq batailles de campagne ou de sept conseils.

### 7.4 Le récit et le ruban de semaine

- `JEU.recit.cadre(q, contexte)` reçoit trois contextes de plus : `route` (rencontres : « {N} t'arrête au bord du chemin : “Seigneur, avant d'aller plus loin…” »), `veillee` (« Autour du feu, {N} rouvre son carnet : “Reprenons ce que tu as trouvé difficile.” »), `coffre` (« {N} examine la serrure : “Elle s'ouvre à qui sait répondre.” »). Trois phrases au moins par contexte, comme aujourd'hui. Les batailles gardent `preparation` et `defense`.
- `cadre` renvoie en plus `semaine : { numero, titre } | null`, calculé pour **toutes** les parties du jeu (campagne comprise, pour répondre à « tu vois les semaines défiler dans les questions ») : `numero` et `titre` de l'entrée du planning (« Semaine 7 », « Cours 9 – Féodaux et seigneurs ») ; pour un cours de langue : `{ numero: null, titre: "Griffon de cuivre" }` ; anglais : « Séquence 1 » ; méthode : « Savoir-faire ». `JEU.ui.recit` (interface.js, qui ne montre aujourd'hui que le portrait, le nom, l'étiquette et le texte) l'affiche en petit ruban à droite du nom du conseiller : « Semaine 7 », le titre du cours en infobulle (`title`) et sous le ruban en 14 px quand la colonne est large. Dans une expédition, le ruban prend la couleur du camp adverse quand la question est de la semaine de l'acte, la couleur pierre sinon (« d'une autre semaine »). La tâche en cours « semaine visible dans les questions » peut livrer ce point ; cette conception s'y aligne : un champ `semaine` sur le cadre, une classe `.recit-semaine`.
- Au début de chaque vague d'une bataille d'expédition, la carte de l'éclaireur dit la semaine : « Nous traversons les terres de la semaine 7 : ses cours sont en tête. » (Une carte de récit, jamais entre deux questions, comme le mot du rival.)

---

## 8. Économie de la partie

### 8.1 L'or d'expédition

Distinct de l'or de bataille (qui reste dans sa bataille, avec ses règles). Sources : socle des haltes (5.1), bonnes réponses (+2 en bataille, +5 ailleurs), rencontres, coffres, « Bourse de route » de l'Armorial, faveurs de la cartographe et de l'interprète. Il ne descend jamais sous zéro et ne se perd que si on le dépense. En fin d'expédition, l'or restant devient de la renommée (1 pour 5) : rien n'est jeté.

Recette type par acte (chemin mixte, p = 0,7, palier 1) : escarmouche 30 + 8 = 38, rencontre 20, campement 0, gardien 70 + 12 = 82, soit 140 or ; sur trois actes, 420 or, plus 25 à 75 de bourse de route.

### 8.2 Le marchand et la forge

Six étals, prix multipliés par 1,25 à l'acte 2 et 1,5 à l'acte 3 (arrondis à 5) :

| Étal | Prix (acte 1) | Contenu |
|---|---|---|
| Faveur commune | 40 | une faveur tirée (conseiller tiré parmi les familles jouées dans l'expédition) |
| Faveur rare | 75 | idem, rare |
| Relique | 90 | une relique tirée (jamais une relique déjà possédée) |
| Provisions | 50, puis × 1,5 à chaque achat | +1 vivre (jusqu'au maximum) |
| Flèches trempées | 25 | la prochaine bataille a le modificateur `flechesNeuves` (archers +50 %) dès la 1re vague |
| Rumeurs | 15 | le modificateur du prochain élite ou gardien se lit sur la route |

La forge a les mêmes étals plus deux : **trempe** (monter d'un rang une faveur possédée, 40) et **atelier** (+1 niveau d'arsenal d'un type au choix, pour l'expédition seulement, 35, un seul par forge). « Marchander » : une question de niveau 2 ; juste : −20 % sur un achat ; fausse : rien ne change.

### 8.3 Reliques (12 au départ)

Objets passifs, pour toute l'expédition, une seule fois chacun. R : effet de route ; O : passe par `JEU.campagne.options` étendu ; E : point d'accroche dans le moteur (17.2).

| Relique | Effet |
|---|---|
| Bourse du voyageur (R) | +20 or d'expédition au début de chaque acte |
| Clé ouvragée (R) | les coffres offrent le choix entre deux récompenses |
| Carte annotée (R) | les types des haltes de l'acte suivant se voient à travers la brume |
| Gonfanon de soie (R) | +1 vivre au maximum |
| Pierre à aiguiser (O) | tours +10 % de dégâts |
| Anneau du trésorier (O) | +25 or au début de chaque bataille |
| Lanterne (R) | la veillée du campement rend aussi +1 vivre |
| Écu fendu (O) | château +6 points de solidité |
| Sceau de plomb (O) | une réponse fausse coûte 3 or de bataille au lieu de 6 |
| Carnet du copiste (R) | chaque « Seconde chance » réussie dans l'expédition rapporte +10 or d'expédition |
| Fer à cheval (O) | cavaliers +1 niveau d'arsenal pour l'expédition |
| Trompe de guet (E) | le rival commence chaque bataille avec une tour de moins (jamais moins d'une) |

---

## 9. Les faveurs des conseillers

Le pendant des bienfaits d'Hadès : chaque conseiller du domaine (jeu/js/recit.js, CONSEILLERS) a quatre faveurs à trois rangs (I commune, II rare, III légendaire). Une faveur se garde pour l'expédition ; en prendre une déjà possédée la monte d'un rang. Vingt-quatre au départ.

| Conseiller (famille) | Faveur | Rang I / II / III | Accroche |
|---|---|---|---|
| Le chroniqueur (histoire) | Mémoire des sièges | +10 / +15 / +20 or au début de chaque bataille | O (orDepart) |
| | Chronique fidèle | +1 / +2 / +3 or par bonne réponse en bataille | O (orParReponse) |
| | Sceau du roi | coup d'éclat dès la 2e bonne réponse d'affilée / et +5 or / et +10 or | E (repondre) |
| | Leçon des anciens | une « Seconde chance » réussie rapporte +10 / +15 / +20 or d'expédition | R |
| La cartographe (géographie) | Éclaireurs | la 1re vague adverse perd une troupe / deux / ses hommes d'armes d'abord | O (espion étendu) |
| | Chemins connus | +1 halte au rang 2 des actes suivants / et les modificateurs se lisent / et +1 choix au rang 1 | R (actes suivants : la carte est enregistrée, on complète l'acte à son ouverture) |
| | Relais de poste | +10 / +15 / +20 or d'expédition par halte franchie | R |
| | Carte des gués | tes troupes marchent 10 / 20 / 30 % plus vite | E (creerUnite) |
| L'herboriste (SVT) | Baume | +1 vivre / +1 et +1 au maximum / +2 et +1 au maximum | R |
| | Remparts de terre | château +4 / +7 / +10 | O (pvChateau) |
| | Provisions | tes troupes +10 / +20 / +30 % de points de vie | E (creerUnite) |
| | Herbes de veillée | la veillée pose 4 / 5 / 6 questions (et paie autant) | R |
| Le maître d'œuvre (physique-chimie) | Flèches trempées | tours +10 / +20 / +30 % de dégâts | O (bonusDegats) |
| | Engins de siège | baliste +1 niveau / et catapulte +1 / et tour de siège +1, pour l'expédition | O (arsenal) |
| | Charpentiers | tours 10 / 20 / 30 % moins chères | E (poserTour, ameliorerTour) |
| | Balistes lourdes | baliste ×1,2 / ×1,4 / ×1,6 de dégâts | E (degatsTour) |
| Le ménestrel, le maître scribe (français) | Chant de marche | +5 / +8 / +12 or de revenu par vague | E (p.revenu) |
| | Éloquence | prix du marchand −15 / −25 / −35 % | R |
| | Ballade des braves | tes troupes frappent ×1,15 / ×1,3 / ×1,5 au corps à corps | E (frapper) |
| | Gonfanon brodé | +1 vivre au maximum / et +1 maintenant / +2 au maximum | R |
| L'interprète (anglais) | Trêve négociée | garnison −1 au départ / tour de départ −1 / les deux | O (`options.rival`) |
| | Lettres de change | +40 / +60 / +80 or d'expédition maintenant | R |
| | Marchands d'outre-Manche | le marchand a 1 / 2 étals de plus / et une relique garantie | R |
| | Rançon | une troupe adverse abattue rapporte +1 / +2 / +3 or de bataille de plus | E (blesser) |

Les faveurs de l'interprète ne sont offertes que si l'anglais a des questions (c'est le cas depuis les séquences 1 à 3). Au MVP, seules les faveurs O et R sont livrées (15 sur 24, Trêve négociée comprise puisque `options.rival` est une accroche du MVP) ; les faveurs E arrivent avec `options.faveurs` du moteur à l'étape 2 (section 19).

Duos (étape 2, à la manière des bienfaits combinés d'Hadès ; chacun une phrase sur la carte) : Flèches trempées + Balistes lourdes → « Feu grégeois » (la baliste met le feu : dégâts de zone 24 px) ; Baume + Herbes de veillée → « Infirmerie de campagne » (la veillée rend un vivre sans Lanterne) ; Chronique fidèle + Leçon des anciens → « Annales » (+1 renommée par « Seconde chance » réussie) ; Éclaireurs + Trêve négociée → « Ambassade » (la garnison ne se reforme pas à la 2e vague).

---

## 10. Vivres, défaite, fin d'expédition

- **Vivres** (le moral et les provisions de la colonne) : 3 au départ ; maximum 3, relevé par l'Armorial, des faveurs et une relique (5 au plus en tout).
- **Perdre un vivre** : retraite dans toute bataille (tes murs cèdent, comme aujourd'hui) ; élite ou gardien qui tient après toutes ses vagues ; quitter une bataille d'expédition après le départ de la première vague (comme `surQuitter` compte une retraite aujourd'hui ; avant la première vague, rien). Jamais sur une réponse, une rencontre, un coffre ou une veillée.
- **Regagner un vivre** : campement (repos), gardien battu, Baume, meunière, Provisions du marchand, Lanterne ; jamais au-delà du maximum.
- **À zéro** : l'expédition s'arrête sur la route, parchemin « Retour au domaine » : ce qu'on rapporte (renommée gagnée, ressources déjà créditées par les bonnes réponses, actes franchis, relais ouvert le cas échéant), une phrase du conseiller (« Une expédition qui apprend n'est jamais perdue ») et le bouton « Rentrer ». Aucune défaite n'efface rien.
- **Fin victorieuse** : le gardien du dernier acte tombe : parchemin « Expédition accomplie », renommée, nouveau relais, Livre des expéditions.
- **Abandonner** : depuis la route, « Lever le camp » (confirmation) : même écran de retour, renommée des haltes déjà franchies, sans la prime d'expédition accomplie.

Taux visés (18.3) : avec p = 0,7 et sans Armorial, 55 à 65 % des expéditions vont au bout, 90 % passent le premier gardien ; avec 150 de renommée dépensée, 75 à 85 % ; à p = 0,6, 25 à 40 % (et jamais un mur : 80 % passent le premier gardien) ; à p = 0,9, 90 % et plus. C'est plus clément qu'un roguelite du commerce : le cahier demande « pas trop d'échecs », et la frustration viendrait ici d'un moteur de bataille, pas d'une notion mal sue.

---

## 11. Méta-progression : ce qui reste de partie en partie

### 11.1 La renommée (jamais perdue)

| Fait | Renommée |
|---|---|
| Rencontre, coffre, marchand, forge, campement franchis | +1 |
| Escarmouche ou embuscade (victoire ou tenu) | +3 (victoire) / +2 (tenu) |
| Bataille | +4 / +2 |
| Élite battu | +6 |
| Gardien de la semaine battu | +10 |
| Gardien de la frontière battu | +15 |
| Semaine franchie pour la première fois (son gardien battu) | +15, une fois par semaine de l'année |
| Expédition accomplie | +20 |
| Retour au domaine (défaite ou abandon) | +5 (« le récit du retour ») |
| Or d'expédition restant à la fin | +1 pour 5 |
| Prime de profondeur | tout ce qui précède × (1 + 0,1 × palier du relais de départ) : partir de S7 rapporte 20 % de plus que de S1 |

Expédition type accomplie depuis S1 : 3 × (3 + 1 + 1 + 10) + 20 + 12 (or restant) = 77, plus 45 la première fois qu'on franchit ses trois semaines. Expédition perdue au deuxième acte : 25 à 35. Deux ou trois expéditions par semaine réelle : 150 à 250 de renommée par semaine.

Titres affichés avec la renommée (parure seulement) : Écuyer (0), Banneret (100), Capitaine (250), Connétable (500), Maréchal (900).

### 11.2 L'Armorial (le miroir d'Hadès)

Quartiers permanents achetés avec la renommée, depuis l'écran Expédition (et un raccourci sur la carte de campagne). Prix cumulés : environ 550 pour tout avoir, soit sept à huit expéditions accomplies : de quoi tenir plusieurs semaines sans que tout soit acquis tout de suite ; si c'est trop vite, les prix du second cran passent de ×2,25 à ×3 (un seul nombre dans `ARMORIAL`).

| Quartier | Effet | Prix par cran |
|---|---|---|
| Gonfanon de plus | +1 vivre au départ et au maximum (jusqu'à 5) | 40, 90 |
| Bourse de route | +25 or d'expédition au départ | 20, 40, 80 |
| Faveur de départ | choisir une faveur commune parmi 3 au départ | 50 |
| Second souffle | une fois par expédition, le dernier vivre perdu est rendu | 70 |
| Éclaireurs | le modificateur des élites et gardiens se lit sur la route | 30 |
| Forge réputée | marchand et forge : un étal de plus et −20 % | 45 |
| Mémoire du chroniqueur | une « Seconde chance » réussie en expédition rapporte +6 or de bataille de plus | 35 |
| Chemins de traverse | 4 haltes au rang 2 de chaque acte | 50 |

Ordre conseillé affiché au joueur (sans obligation) : bourse, gonfanon, faveur de départ.

### 11.3 Relais et Livre des expéditions

- Relais : section 3.3 ; jamais retirés, même si Romain retire un fichier de cours (la semaine redevient « sans halte » et la route saute à la suivante).
- Livre des expéditions (Codex, à côté de la Galerie des souverains) : les vingt dernières expéditions (date, front, semaines, actes franchis, issue, renommée, sceau n°), la meilleure profondeur, les gardiens battus par semaine (le parchemin de l'année, avec un sceau de cire par semaine franchie), les faveurs vues. Rien d'un cours fermé n'y apparaît.

---

## 12. Liens avec la campagne existante

- **Deux fronts** : au départ, le joueur choisit « Vers l'ouest » (royaume d'Angleterre) ou « Vers le sud » (Empire omeyyade). Tout l'acte suit ce choix : couleurs et emblème des gonfanons (`JEU.campagne.CAMPS`), terrains des batailles (variantes « -sud »), rival des missives (`JEU.campagne.rivalDe`), gardiens (« le champion du roi d'Angleterre », « la garnison de l'émir de Cordoue » ; faute de personnage ouvert : « le champion d'un seigneur rival »). Le front du sud n'est proposé qu'une fois le front de l'ouest tenté une fois (la première expédition se présente d'elle-même).
- **Rivalité** : +3 par gardien battu sur son front, +1 par élite (jamais en baisse ; les gains restent inférieurs à ceux de la campagne). L'humeur du rival change donc aussi avec les expéditions.
- **Missives** (réglage « Messages des rivaux ») : au départ de la première expédition, le souverain écrit (« Pars, et reviens couvert de renommée ») ; avant chaque gardien, le défi du rival, une fois sur deux, comme devant une place forte (`missiveAvantBataille` étendu à un lieu `{ gardien: frontId }`) ; au retour sur la carte de campagne, une lettre selon l'issue (expédition accomplie : situation `province` avec {province} = « la semaine 8 » ; défaite : rien, ou `retraite`). Les répliques existantes suffisent au MVP ; des répliques propres aux expéditions pourront s'ajouter à personnages.js (contrôle 10 inchangé). Note : `reagir` n'est pas exporté par JEU.campagne aujourd'hui ; `apresExpedition` (ci-dessous) l'appelle de l'intérieur.
- **Provinces** : un gardien battu porte 2 coups à la place forte visée sur le même front (« ton expédition a affaibli le Gué »), comme le défi du champion (−3). Jamais une prise : seule une bataille de campagne prend une province.
- **Souverain** : le souverain servi est celui de la campagne (seuil de provinces) ; il n'est pas touché par les expéditions.
- **Ressources du domaine** : inchangées dans leur règle (+1 par bonne réponse, créditée par `enregistrerReponse`) ; un gardien battu ajoute 4 ressources de la matière la plus jouée dans l'acte (comme une victoire de campagne, qui en donne 8).
- **Chronique** : « Ton expédition a franchi la semaine 7 », « Tu es rentré de la semaine 6 avec 32 de renommée ».
- **Événement du jour, conseil, arsenal, attaques du rival** : inchangés ; une attaque du domaine en attente n'empêche pas de partir en expédition (le rival « campe » comme aujourd'hui).
- Tout cela tient dans une fonction `JEU.campagne.apresExpedition(bilan)` (rivalité, réaction du rival, chronique, 2 coups, 4 ressources), appelée par expedition.js à la fin d'un gardien et à la fin de l'expédition.

---

## 13. Durée, pause, reprise

### 13.1 Calcul

| Chemin | Acte | Trois actes |
|---|---|---|
| Tranquille (rencontre, coffre, repos, gardien) | 1,5 + 0,5 + 0,3 + 7 ≈ 9,5 min | 28 min |
| Mixte (escarmouche, marchand, veillée, gardien) | 4,5 + 1 + 1,2 + 7 ≈ 14 min | 42 min |
| Tout en bataille (escarmouche, élite, veillée, gardien) | 4,5 + 7 + 1,2 + 7 ≈ 20 min | 59 min |

L'expédition type tient en 30 à 45 minutes, le chemin guerrier en deux séances. Romain décrit des séances de 15 à 20 minutes : une expédition en occupe deux ou trois, ce qui répond à « le jeu est trop court » : il y a toujours une expédition à reprendre.

### 13.2 Deux leviers si c'est trop long

- Vitesse des vagues ×1,5 par défaut dans les expéditions (le réglage `v.vitesse` existe dans bataille.js, avec son bouton) : −20 s par vague, l'expédition mixte passe à 35 min. À valider avec Romain après quelques parties.
- Gardiens des actes 1 et 2 à 2 vagues (3 au dernier acte, 4 à la frontière) : −2,5 min par acte. Gardé en réserve (un nombre dans la table 6.2).

### 13.3 Pause et reprise

- L'expédition est enregistrée après chaque halte, chaque achat, chaque choix de faveur (`JEU.sauvegarde.enregistrer`). Quitter le jeu n'importe quand entre deux haltes ne perd rien ; l'écran Expédition propose « Reprendre : acte 2, semaine 7, au campement ».
- Une bataille interrompue (fermeture du jeu) se rejoue depuis son début, avec un nouveau tirage ; si une vague avait été lancée (`enCours.entamee`), la reprise compte une retraite (−1 vivre), comme un « Quitter » en cours de bataille ; avant la première vague, rien. Les coups portés à un gardien ne comptent qu'à la fin d'un assaut terminé.
- Les offres en cours (faveurs à choisir, étals du marchand) sont enregistrées avec la halte : on retrouve les mêmes au retour.
- Une seule expédition en cours à la fois ; en commencer une nouvelle demande de lever le camp de l'ancienne (confirmation, renommée gardée).
- La route n'est pas une « partie » au sens de `JEU.partie` : on peut aller au Codex ou aux Réglages depuis la route et revenir ; seules les haltes sont des parties (`JEU.ui.commencerPartie`), qui bloquent le menu comme aujourd'hui.

---

## 14. Graines et déterminisme

- `JEU.alea(graine)` : mulberry32, le même que simuler-bataille.js et mesurer-tirage.js, dans jeu/js/alea.js (15 lignes, sans DOM). Graine d'une expédition : `(Date.now() ^ (meta.parties * 2654435761)) >>> 0`, affichée comme « sceau n° » dans le Livre.
- Déterministe par la graine : la carte (types, arêtes, positions, cartes de bataille, modificateurs, portes), l'ordre des étals du marchand, les rencontres tirées. **Pas** déterministe : les questions (tirage du jeu, qui dépend de la sauvegarde) et le cours des vagues (le moteur garde `Math.random` pour le pas des figurines ; l'IA du rival est sans hasard). Le rang des faveurs offertes dépend des réponses : il est tiré à la graine de la halte au moment de l'offre et enregistré avec elle.
- Le générateur porte un numéro (`carte.version`) ; une carte enregistrée n'est jamais regénérée.
- « Défi de la semaine » (extension) : graine = numéro de la semaine du calendrier × 1000 + année : la même carte toute la semaine, pour se mesurer à soi-même dans le Livre.

---

## 15. Sauvegarde : schéma 6

### 15.1 Structure

```js
expedition: {
  meta: {
    renommee: 0, depensee: 0,                 // renommée totale gagnée (jamais en baisse) et dépensée à l'Armorial
    armorial: { gonfanon: 0, bourse: 0, faveurDepart: 0, souffle: 0, eclaireurs: 0, forge: 0, memoire: 0, traverse: 0 },
    relais: [1],                              // semaines d'où l'on peut partir
    franchies: [],                            // semaines dont le gardien a été battu au moins une fois (prime +15)
    parties: 0, accomplies: 0, meilleure: null, // meilleure : { semaine, acte, le }
    livre: []                                 // 20 dernières : { le, front, semaines, actes, issue, renommee, graine }
  },
  enCours: null | {
    version: 1, graine: 48213, front: "angleterre", semaines: [6, 7, 8], frontiere: 8,
    acte: 0, position: "a0r1n0",              // halte où l'on se trouve (faite) ; suivants joignables = ses arêtes
    entamee: null | "a0r2n1",                 // bataille dont la 1re vague est partie et qui n'a pas de bilan (reprise = retraite)
    vivres: 3, vivresMax: 3, or: 25, souffleUtilise: false,
    faveurs: [{ id: "flechesTrempees", rang: 1 }], reliques: ["cleOuvragee"],
    arsenalPlus: { tours: { baliste: 1 }, troupes: {} }, // niveaux d'arsenal gagnés pour l'expédition seulement
    prochaineBataille: { flechesNeuves: true, espion: false },
    carte: [ /* actes générés, voir 4.4 ; chaque halte porte fait: true|false, et pour un gardien pv, max, assauts */ ],
    offres: null | { halte: "a0r2n1", faveurs: [...], reliques: [...], etals: [...] },
    stats: { questions: 0, bonnes: 0, parFamille: {}, parSemaine: {}, haltes: 0, batailles: 0, retraites: 0 },
    journal: [],                              // 30 dernières lignes de l'expédition (texte), pour la reprise
    debut: "2026-10-24T18:02:00"
  }
}
```

Taille : moins de 4 Ko par expédition en cours.

### 15.2 Migration et réparation

- `SCHEMA = 6` dans jeu/js/sauvegarde.js ; `MIGRATIONS[5]` ajoute `s.expedition = JEU.expedition.completer(s.expedition)` et passe à 6, sans rien retirer. Une sauvegarde de schéma 1 passe par 2, 3, 4, 5, 6 (tests existants étendus ; le test « Sauvegarde d'un schéma plus récent (6) refusée » passe à 7).
- `JEU.expedition.completer(e)` : sur le modèle de `JEU.campagne.completer` (une valeur absente ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas) ; une expédition en cours abîmée (carte illisible, position inconnue) est fermée proprement : sa renommée de haltes déjà franchies est créditée, puis `enCours = null`, et la chronique le dit en une ligne.
- `meta.relais` : toujours au moins la première semaine ouverte, recalculée au chargement si la liste est vide.
- Export et import : inchangés (l'objet suit). docs/FORMAT_DONNEES.md reçoit la section « expedition » et la ligne « schéma 6 ».
- Réglages facultatifs dans jeu/data/config.js, pour que Romain règle sans code : `expedition: { actes: 3, vivres: 3, quota: 2, difficulte: 0, vitesse: 1, relaisLibres: false }` (`difficulte` s'ajoute au niveau de chaque bataille de route, borné à [0, 4]).

---

## 16. Interface et direction artistique

### 16.1 L'écran « Expédition » (menu)

- Sans expédition en cours : titre « L'expédition », parchemin de départ : front (deux écus : lys contre lion, lys contre tour), relais (liste des semaines ouvertes comme relais, avec la liste des cours ouverts de la semaine de départ), renommée et titre, boutons « Partir (Entrée) », « L'Armorial », « Le Livre des expéditions ». Un mot du conseiller la première fois (le chroniqueur explique la route en trois phrases).
- Avec une expédition en cours : la route, directement.
- Sur la carte de campagne : une carte « Partir en expédition » (ou « Reprendre l'expédition : semaine 7 ») dans la grille des jeux, avec sa touche, qui ouvre l'écran.

### 16.2 La route de parchemin

- Un SVG de 2 900 × 520 (trois actes de 960 px côte à côte, plus le relais à gauche et la brume à droite), dans un cadre qui défile horizontalement (`overflow-x: auto`, `scroll-snap` par acte, défilement doux vers l'acte en cours), fond parchemin (assets/images/parchemin.png) avec le fond 3D de la campagne passé au sépia en filigrane (`fond-campagne` de sprites.js, opacité 0,25), vignettage, traits d'encre.
- **Bannière d'acte** : un gonfanon aux couleurs du camp adverse, lettrine Cinzel « Semaine 7 », dessous en Crimson « du 12 au 18 octobre » et « cette semaine » si c'est la semaine du calendrier ; un clic ou Entrée sur la bannière ouvre la liste des cours ouverts de la semaine (titres).
- **Haltes** : médaillons de 56 px (anneau d'or, disque parchemin, icône Game-icons à l'encre), sous-titre de 14 px (« Escarmouche », « Rencontre »…) ; **porte** : un petit médaillon de 24 px accroché au médaillon de la halte (icône du conseiller, de la relique ou de la bourse), infobulle « Butin : faveur de l'herboriste » ; gardien : médaillon de 84 px avec l'écu du camp et un gonfanon planté ; élite : cordon rouge brique et épées croisées ; halte faite : cachet de cire posé dessus (icône `sceau`), chemin parcouru en trait plein ; haltes joignables : halo d'or (le même que le lieu « cible » de la carte de campagne) et numéro de touche ; haltes hors de portée : encre pâlie (opacité 0,45) ; actes suivants : nappes de brume (`lieu-brume`, déjà dans sprites.js) et gardien en silhouette.
- **Chemins** : pointillés d'encre comme `route()` de ecran-campagne.js (trait sombre large, pointillé clair dessus) ; les chemins empruntables depuis la halte courante sont un peu plus clairs.
- **Bandeau de l'expédition** (sous le bandeau du jeu, hauteur fixe de 52 px) : vivres (gonfanons pleins ou grisés), or d'expédition (icône tresor), renommée (icône valider, le laurier), « Acte 2 / 3 · Semaine 7 », faveurs (médaillons de 28 px de leur conseiller avec 1 à 3 pépites de rang, infobulle), reliques (icônes de 24 px, infobulle), boutons « Armorial », « Lever le camp ».
- **Parchemin d'acte** et **parchemin de retour** : modales du jeu (`JEU.ui.ouvrirModale`), classe `missive-boite` pour l'aspect lettre, sceau de cire du camp (`JEU.ecranCampagne.sceau`).

### 16.3 Les récompenses

- Choix de faveur : trois cartes d'enluminure côte à côte (portrait du conseiller en icône dans un médaillon, nom de la faveur en Cinzel, rang en ruban « rare » doré, effet en une phrase), touches 1 à 3, « Passer (+15 or) » touche 4. Même mise en page pour les reliques et les étals du marchand.
- Rien n'est chronométré ; les animations suivent la règle des 400 ms (un éclat de feuilles quand un gardien tombe, le gonfanon qui se replie quand un vivre tombe, sans clignotement ; coupées avec le réglage Animations).

### 16.4 Accessibilité et clavier

- Sur la route : flèches gauche et droite pour passer d'une halte joignable à l'autre, haut et bas aussi (ordre du rang), Entrée pour y aller, 1 à 4 directement, Échap vers le menu (l'expédition reste en cours), A pour l'Armorial, L pour le Livre ; `tabindex` sur les haltes joignables, `aria-label` « Escarmouche, semaine 7, butin : faveur de l'herboriste, joignable » ; le focus revient sur la halte courante après chaque fenêtre.
- Dans les haltes : les commandes existantes (1 à 6 pour les choix, flèches, Entrée, Échap).
- Contraste : texte encre sur parchemin, jamais de texte sur la brume ; tailles 18 px pour les questions, 14 px au moins sur la route (règle de perf.js).

### 16.5 Performance

- La route est construite une fois par changement d'état (après une halte) : 40 haltes et 60 chemins, moins de 5 ms ; elle n'est jamais redessinée pendant une partie (l'écran de partie remplace l'écran, comme aujourd'hui).
- Les batailles d'expédition sont les batailles d'aujourd'hui : la mesure réponse → question suivante (perf.js) ne change pas ; le quota de l'acte se tire au début de chaque vague (un passage de plus dans `tirage`, environ 1 ms).
- Aucune image nouvelle au MVP : icônes, parchemin, nappes de brume, fond de campagne existants. Plus tard : médaillons de haltes rendus en 3D (atelier/outils/rendu-3d) sur le modèle des bourgs.

---

## 17. Architecture du code

### 17.1 Fichiers

| Fichier | Rôle | Testé par |
|---|---|---|
| jeu/js/alea.js (nouveau) | `JEU.alea(graine)` : mulberry32 ; `JEU.alea.melanger(r, liste)`, `JEU.alea.choisir(r, liste)` | tests.js |
| jeu/js/expedition.js (nouveau, sans DOM) | état (`vide`, `completer`, `etat`), semaines ouvertes et frontière, génération (`generer`), règles (`partir`, `aller(halteId)`, `issueBataille(bilan)`, `offrirFaveurs`, `prendreFaveur`, `acheter`, `reposer`, `perdreVivre`, `finir`), options de bataille d'une halte (`optionsBataille(halte)`), renommée et Armorial (`ARMORIAL`, `ameliorer`), FAVEURS, RELIQUES, RENCONTRES, MODIFICATEURS, TEXTES | tests.js, simuler-bataille.js --expedition, mesurer-tirage.js --expedition |
| jeu/js/ecran-expedition.js (nouveau) | écran du menu, route SVG, bandeau, parchemins, fenêtres de récompenses, marchand, campement, rencontres, Armorial, Livre | perf.js |
| jeu/index.html | bouton de menu `data-ecran="expedition"`, section `#ecran-expedition`, balises script (alea.js après noyau.js ; expedition.js après campagne.js et bataille.js ; ecran-expedition.js après ecran-campagne.js), `JEU.version` | validateur (version) |
| jeu/css/jeu.css | classes `.route-expedition`, `.halte-exp`, `.porte-exp`, `.bandeau-exp`, `.carte-faveur`, `.recit-semaine` | perf.js (1366 × 768) |
| jeu/js/codex.js | onglet « Livre des expéditions » (même mécanique que la Galerie) | perf.js |
| atelier/outils/tests.js | `contexte()` charge `alea` après `noyau` et `expedition` après `campagne` | — |
| docs/FORMAT_DONNEES.md, docs/CAHIER_DES_CHARGES.md (sections 5 et 6), docs/JOURNAL.md | documentation et décisions | — |

### 17.2 Points d'accroche dans l'existant (petits, facultatifs, testables)

1. **jeu/js/bataille.js, `lancer(lieu, exp)`** : un second paramètre facultatif. Avec `exp` : `{ carte, titre, options (celles de JEU.campagne.options complétées par l'expédition), semaine, front, defense, modificateurs: [textes de l'éclaireur], tirer: function (n, deja) → questions, surVague: function (), fin: function (bilan), retour: function () }`. La fonction prend `exp.carte` à la place de `prov.carte`, `exp.options` à la place de `C.options(niveau)`, `exp.tirer` à la place de `tirerQuestions`, appelle `exp.surVague()` au premier `lancerVague` (pour `entamee`), `exp.fin(bilan)` à la place de `C.apresBataille`, `exp.retour()` à la place de `JEU.ui.afficher("jouer")`, et affiche `exp.titre` ; `surQuitter` appelle aussi `exp.fin` avec `issue: "retraite"` si `entamee`. Le bilan reçoit en plus `bonnesParFamille` (compté dans `questionSuivante`). Rien ne change sans `exp` : une vingtaine de lignes, toutes sous `if (exp)`.
2. **jeu/js/bataille-moteur.js** :
   - `options.rival` : objet fusionné sur `RIVAL[niveau]` dans `creer` (`p.regleRival = Object.assign({}, RIVAL[n], o.rival || {})` ; `rival(p)` renvoie `p.regleRival`) ; les clés `ecartSortie` et `alerte`, lues aujourd'hui dans VAGUES et IA, passent par la même règle quand elles y sont. Les modificateurs d'élite et de gardien et la Trêve négociée passent par là. Le simulateur peut déjà essayer ces valeurs avec `--regle`.
   - `options.championChaqueVague` : dans `composerVague`, `if (w === p.vagues - 1 || p.championChaqueVague) file.push("champion")`.
   - `options.permanents` : modificateurs remis dans `p.modificateurs` au début de chaque vague (`lancerVague`), puisque le moteur vide `p.modificateurs` à chaque fin de vague (Pluie).
   - `options.toursDepartMoins` (Trompe de guet) : dans `rivalDepart`, `Math.max(1, r.toursDepart − n)`.
   - `options.faveurs` (étape 2) : `{ degatsTours: 1, degatsBaliste: 1, coutTours: 1, pvTroupes: 1, vitesseTroupes: 1, coupTroupes: 1, revenu: 0, eclatDes: 3, bonusEclat: 0, rancon: 0 }`, lus respectivement dans `degatsTour`, `poserTour` et `ameliorerTour` (arrondi), `creerUnite` (camp joueur), `frapper`, `creer` (`p.revenu`), `repondre`, `blesser`. Dix lignes, chacune avec son test ; `simuler-bataille.js --comparer` vérifie que les batailles de campagne ne bougent pas.
3. **jeu/js/recit.js** : option `quota` de `suite` (7.2) ; contextes `route`, `veillee`, `coffre` dans PHRASES ; `cadre` renvoie `semaine` (7.4).
4. **jeu/js/progression.js** : `semaineDe(coursId)` (null hors planning), `semainesOuvertes(etat)` (semaines du planning ayant au moins un cours accessible avec une question jouable), `frontiere(etat)`.
5. **jeu/js/campagne.js** : `options(niveau, extra)` accepte des compléments (`orDepart`, `pvChateau`, `bonusDegats`, `orParReponse`, `arsenalPlus`, `espion`, `orPerduErreur`) ; `missiveAvantBataille` accepte un lieu `{ gardien: frontId }` ; `apresExpedition(bilan)` (section 12).
6. **jeu/js/interface.js** : `ui.recit` affiche `r.semaine` ; rien d'autre.
7. **jeu/js/ecran-campagne.js** : la carte « Partir en expédition / Reprendre » dans la grille.
8. **jeu/js/sauvegarde.js** : SCHEMA 6, migration 5 → 6, `nouvelle()` avec `expedition: JEU.expedition.vide()`.

### 17.3 Ce qui ne change pas

Le tirage (leitner.js, questions.js, rappels.js), les cartes de bataille, l'IA du rival, le conseil du royaume, les événements du jour, l'arsenal, les jauges, le domaine, le Codex (hors onglet ajouté), le validateur et ses contrôles sur les cours. Les textes nouveaux (rencontres, faveurs, reliques, modificateurs, phrases de récit) sont des textes de jeu dans le code, comme EVENEMENTS et PHRASES aujourd'hui ; le validateur peut leur appliquer le contrôle des répliques (pas de chiffre historique, pas de religion, pas de nom de personnage) en lisant `JEU.expedition.TEXTES` : à ajouter au contrôle 10 si Romain le souhaite.

---

## 18. Essais et réglage

### 18.1 tests.js (logique, Node)

Une trentaine de `verifier(…)` de plus :

- Générateur : même graine, même carte (deux appels égaux en JSON) ; graines différentes, cartes différentes ; 200 graines : contraintes 1 à 7 de la section 4.2 toutes tenues ; acte 1 sans élite ; acte 3 avec un élite ; campement au rang 3 ; au plus une embuscade par expédition ; chaque halte a un successeur ; le gardien est joignable de toutes les haltes du rang 1 ; « Chemins de traverse » donne 4 haltes au rang 2 ; les portes « faveur » d'un acte couvrent des familles différentes tant qu'il en reste.
- Semaines : `semainesOuvertes` avec les cours chargés des tests ; frontière = la plus grande ; une semaine sans cours est sautée ; l'expédition a 3, 2 ou 1 acte selon ce qui reste ; le dernier acte à la frontière a le gardien de la frontière (4 vagues) ; palier(S) suit la table.
- Règles : `aller` refuse une halte non joignable ; une retraite retire un vivre ; un gardien qui tient retire un vivre et garde ses coups ; vivres à zéro → `enCours` fermé, renommée des haltes créditée, +5 ; second souffle une seule fois ; une faveur reprise monte d'un rang (3 au plus) ; l'or d'expédition ne descend jamais sous zéro ; renommée jamais en baisse sur 1 000 actions tirées au hasard ; relais S+1 ouvert quand le gardien de S tombe ; prime « semaine franchie » une seule fois ; la porte annoncée est bien le butin reçu.
- Options de bataille : niveau, vagues, pvRival par halte et par palier conformes à 6.2 ; `options.rival` fusionne ; `championChaqueVague` ajoute un champion à chaque vague ; `permanents` survit à une fin de vague ; faveurs O reportées dans les options ; `toursDepartMoins` ne descend pas sous une tour ; les batailles de campagne (sans `exp`, sans `options.rival`) donnent les mêmes résultats qu'avant (même graine, mêmes décisions du rival).
- Mélange : `suite(3, { quota })` donne 2 questions de la semaine 7 (ou compagnons) et 1 autre quand la semaine 7 a des questions ; se relâche sans bloquer quand elle n'en a pas ; les rappels dus gardent leur place ; jamais trois fois la même famille.
- Sauvegarde : migration 5 → 6 ajoute `expedition` sans rien retirer ; schéma 1 → 6 ; `completer` répare une expédition abîmée en créditant la renommée ; export puis import gardent l'expédition en cours ; une sauvegarde de schéma 7 est refusée.

### 18.2 perf.js (bout en bout, Playwright)

- Ouvrir « Expédition », partir (front de l'ouest, relais S1), route entière visible en 1366 × 768 (acte en cours sans défilement vertical de la page ; défilement horizontal seulement dans le cadre de la route), noms de 14 px au moins, deux haltes joignables au clavier (flèche droite, Entrée).
- Jouer une escarmouche : mesure réponse → question suivante inchangée (moins de 100 ms, Event Timing) ; ruban de semaine présent sur chaque question ; la carte de l'éclaireur dit la semaine avant la première question, jamais entre deux.
- Quitter pendant la préparation (aucun vivre perdu), recharger la page : « Reprendre » revient à la même halte joignable ; quitter après une vague : un vivre de moins.
- Choisir une faveur au clavier (touche 2) ; le bandeau la montre ; le marchand refuse un achat sans or (bouton désactivé, accord du texte).
- Une expédition menée au bout en mode essai (hook de test : `JEU.expedition.essai = true` qui met les camps adverses à 1 point) : parchemin de fin, renommée, relais S2 ouvert, Livre rempli.

### 18.3 simuler-bataille.js : d'abord les haltes, puis les expéditions

**Première mesure, avant tout code d'expédition** (une demi-journée, trois options nouvelles qui ne changent rien aux tableaux existants) :

```
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 4 --niveaux 0,1 --p 0.6,0.7,0.8,0.9 --graines 80
node atelier/outils/simuler-bataille.js --vagues 3 --pvRival 9 --niveaux 2,3 --regle "M.RIVAL[2].garnison = 2; M.RIVAL[2].garde = 1.56"
node atelier/outils/simuler-bataille.js --vagues 4 --pvRival 9 --niveaux 4 --seulement attaque
```

- `--vagues n` et `--pvRival n` remplacent les 4 vagues et la solidité de la province dans `optionsBataille` ; `--progression k` (facultatif) prend la ligne PROGRESSION du niveau k au lieu de celle du niveau joué (un joueur de palier 1 qui attaque une escarmouche de niveau 0). Sorties : part des batailles où le camp tombe en un passage, coups moyens, distribution ; c'est ce qui fixe la table 6.2 avant d'écrire une ligne de la route.
- Les modificateurs de 6.3 s'essaient avec `--regle`, qui existe.

**Ensuite, `--expedition`** : joue des expéditions entières sous Node avec le vrai moteur et le vrai générateur.

```
node atelier/outils/simuler-bataille.js --expedition --graines 80 --p 0.6,0.7,0.8,0.9 --armorial 0,150,400 --chemin tranquille,mixte,guerrier --relais 1,4,7
```

- Pour chaque graine : `JEU.expedition.generer`, puis le joueur scripté suit la politique de chemin (tranquille : jamais d'élite, repos au campement ; mixte : une halte sur deux au hasard ; guerrier : toujours la bataille la plus dure, veillée au campement), répond juste avec la probabilité p (les rencontres et coffres comptent leurs bonnes réponses), joue chaque bataille avec `jouerBataille(carteId, optionsBataille(halte), p, graine, "equilibre")` (arsenal PROGRESSION du palier, faveurs O appliquées, faveurs E ignorées au MVP), prend les faveurs dans l'ordre de leur valeur estimée.
- Sorties par p, par Armorial, par chemin et par relais : expéditions accomplies (%), acte atteint (répartition), vivres perdus (moyenne), assauts par gardien (moyenne, le pire), victoires par type de halte (%), durée estimée (15 s par question, 10 s par erreur, 30 s par préparation, 60 s par vague, 60 s par halte sans bataille), renommée par expédition, or gagné et dépensé.
- Cibles de réglage (valeurs de 6.2 ajustées jusqu'à les tenir, relais S1 et S4) :

| p | Armorial 0 : accomplies | 1er gardien passé | Armorial 150 : accomplies | Durée mixte |
|---|---|---|---|---|
| 0,6 | 25 à 40 % | ≥ 80 % | 45 à 60 % | ≤ 45 min |
| 0,7 | 55 à 65 % | ≥ 90 % | 75 à 85 % | ≤ 42 min |
| 0,8 | 70 à 80 % | ≥ 95 % | 85 à 95 % | ≤ 40 min |
| 0,9 | ≥ 90 % | ≥ 98 % | ≥ 95 % | ≤ 38 min |

Et par halte à p = 0,7 : escarmouche gagnée 55 à 65 % (tenu sinon), bataille 50 à 60 %, élite battu 45 à 55 %, embuscade tenue ≥ 80 %, gardien du premier assaut 55 à 65 % et en deux assauts ≥ 90 %, frontière en deux assauts ≥ 80 %. Depuis le relais S7 (palier 2), les mêmes cibles avec Armorial 150 et PROGRESSION du niveau 2. Comme pour la campagne, tout compte par seuils (flèches, coups) : vérifier chaque changement de pvRival ou de modificateur au simulateur, 80 graines au moins, et noter les tableaux au journal.

### 18.4 mesurer-tirage.js `--expedition`

- Joue une expédition type (acte 1 : rencontre, escarmouche, veillée, gardien ; actes 2 et 3 de même) avec le quota de l'acte, 16 élèves simulés (les trois profils existants), six séances de suite, depuis S1 et depuis S6.
- Mesures : part des questions dont le cours est de la semaine de l'acte (cible 55 à 70 %, compagnons de route comptés à part), parts des familles sur l'expédition (chacune entre 12 et 28 %), part des fiches à revoir (au moins celle de la campagne), questions reposées à moins de 60 (0 hors Seconde chance), même notion en 10 questions (0), niveau moyen posé face au conseillé (écart ≤ 0,2), durée des tirages (médiane < 5 ms).
- Cas limite à mesurer : une semaine maigre (S7 : trois cours au planning) : le quota se relâche et l'équilibre tient sur l'expédition entière ; et S5 et S6, sans géographie.

---

## 19. Plan de réalisation

Chaque étape finit par le validateur, tests.js, perf.js, une ligne au journal et le numéro de version. À livrer après les chantiers en cours sur bataille.js, recit.js et personnages.js (ou en accord avec eux pour `cadre.semaine`).

### Étape 0 : mesures et préparatifs (une journée)

- `--vagues`, `--pvRival`, `--progression` dans simuler-bataille.js ; première table 6.2 mesurée et notée au journal.
- jeu/js/alea.js ; `semaineDe`, `semainesOuvertes`, `frontiere` dans progression.js ; `cadre.semaine` et `.recit-semaine` (en accord avec la tâche « semaine visible dans les questions » : s'ils l'ont déjà fait, reprendre leur champ) ; option `quota` de `suite` ; schéma 6 avec `expedition` vide et `completer` ; docs/FORMAT_DONNEES.md.

### Étape 1 : MVP « la route » (deux à trois jours) : version 0.9.0

- expedition.js : génération, portes, état, départ (front de l'ouest seulement), haltes **escarmouche, bataille, rencontre (4 cartes), coffre, campement (repos et veillée), gardien, gardien de la frontière** ; vivres, or d'expédition, renommée avec prime de profondeur ; fin et retour ; relais ; 7 faveurs O et R (Mémoire des sièges, Chronique fidèle, Remparts de terre, Flèches trempées, Engins de siège, Baume, Trêve négociée) ; Armorial à 4 quartiers (gonfanon, bourse, faveur de départ, second souffle).
- bataille.js `lancer(lieu, exp)` ; moteur `options.rival`, `championChaqueVague`, `permanents` ; modificateurs Porte de fer, Volée d'archers, Trésor de guerre.
- ecran-expedition.js : départ, route SVG avec portes, bandeau, parchemins d'acte et de retour, choix de faveur, campement, coffre, rencontres ; carte « Partir en expédition » sur la campagne ; clavier complet.
- Essais : tests.js (générateur, règles, migration), perf.js (parcours), simuler-bataille `--expedition` (chemin mixte, Armorial 0, relais S1) pour confirmer pvRival ; mesurer-tirage `--expedition`.
- Pour Romain, cinq vérifications : la route s'ouvre et se lit en 1366 × 768, chaque halte de bataille montre son butin ; une escarmouche pose deux questions de la semaine sur trois (ruban) ; quitter et reprendre ; perdre volontairement une bataille ne retire rien au domaine ; battre le gardien de S1 ouvre le relais S2.

### Étape 2 : profondeur (deux à trois jours) : version 0.10.0

- Élites et embuscades, 7 modificateurs, marchand et forge, les 12 reliques, les 24 faveurs (accroches `options.faveurs` du moteur) et les 4 duos, 10 rencontres, front du sud, Chemins de traverse, Éclaireurs, Forge réputée, Mémoire du chroniqueur.
- Simulateur complet (trois chemins, trois niveaux d'Armorial, trois relais), réglage final des solidités et des modificateurs, tableaux au journal.

### Étape 3 : récit et liens (un à deux jours) : version 0.10.x

- Missives (souverain au départ, défi du rival avant un gardien, lettre au retour), rivalité, chronique, 2 coups à la place forte, 4 ressources (`apresExpedition`) ; Livre des expéditions et parchemin de l'année dans le Codex ; répliques propres aux expéditions dans personnages.js si Romain le veut (validateur inchangé).

### Étape 4 : extensions (à la demande)

- Vitesse ×1,5 par défaut si les expéditions sont trop longues ; « Défi de la semaine » (graine fixe) ; « Serments » (modificateurs choisis au départ, à la manière du Pacte du châtiment d'Hadès : « gardiens à 4 vagues », « deux vivres seulement », « sans campement », chacun +20 % de renommée, jamais plus durs sur les questions) ; profondeur au-delà de S13 (`options.rival` multiplicateurs) ; médaillons de haltes rendus en 3D ; musique « route » (troisième humeur de musique.js, entre « paix » et « guerre ») ; un boss de fin d'ère quand les ères d'histoire seront sur la carte (cahier, jalon 2).

---

## 20. Décisions à noter au journal, points à valider par Romain

Décisions proposées (rubrique Décisions de docs/JOURNAL.md, à la livraison) :

1. Une expédition = trois actes = trois semaines ouvertes consécutives ; la frontière = la plus grande semaine ouverte ; les relais s'ouvrent gardien par gardien (réglage `relaisLibres` pour tout ouvrir).
2. Deux questions sur trois d'un acte viennent de sa semaine (compagnons de route compris), la troisième du tirage ordinaire ; l'équilibre des familles se mesure sur l'expédition entière.
3. La difficulté d'une halte = palier de la semaine (une ligne RIVAL par tranche de trois semaines) + décalage du type ; la profondeur au-delà de S13 par `options.rival`.
4. Les vivres ne tombent que sur une issue de bataille ; rien de permanent ne se perd ; la renommée ne baisse jamais.
5. Les camps adverses des expéditions sont petits (4 à 12) parce que chaque halte se joue en un passage ; les gardiens gardent leurs coups.
6. Chaque halte de bataille annonce son butin (porte) ; les portes d'un acte tournent entre les familles.
7. Les textes des expéditions sont des textes de jeu, sans fait de cours, soumis aux mêmes interdits que les répliques des personnages.
8. Schéma de sauvegarde 6 ; la carte générée est enregistrée, jamais regénérée.

À valider par Romain :

- Le nom (« Expédition » ou autre) et le mot « vivres » pour le moral.
- Trois actes par expédition (30 à 45 minutes, deux séances) plutôt que deux (20 à 30 minutes, une séance).
- Les relais (on avance de partie en partie) plutôt que le départ libre sur toute semaine ouverte.
- Le choix du front au départ (plutôt qu'une alternance imposée).
- Les taux visés (55 à 65 % d'expéditions accomplies à 7 sur 10 sans Armorial) : plus dur ou plus facile ?
- La vitesse des vagues ×1,5 par défaut dans les expéditions.
- Les deux retours vers la campagne (2 coups à la place forte, 4 ressources par gardien) : les garder, ou laisser les expéditions tout à fait à part.

---

## 21. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| Expéditions trop longues pour une séance | Reprise à tout moment ; vitesse ×1,5 ; gardiens à 2 vagues en réserve ; durée estimée par le simulateur et affichée au départ (« environ 35 minutes, reprise possible à chaque halte »). |
| Une semaine maigre (S7) donne des questions répétitives | Le quota se relâche de lui-même ; anti-répétition inchangée ; compagnons de route ; mesure 18.4. |
| Le moral tombe trop vite pour un élève à 6 sur 10 | Cibles 18.3 (≥ 80 % passent le premier gardien) ; campement garanti ; second souffle ; renommée gagnée quoi qu'il arrive. |
| Faveurs trop fortes qui rendent les gardiens triviaux | Faveurs E livrées après mesure ; plafond de trois rangs ; le simulateur joue avec et sans. |
| Collision avec les tâches en cours (personnages, semaine visible, cours S4 à S8) | Points d'accroche minces et facultatifs (`exp`, `options.rival`, `cadre.semaine`) ; cette conception ne touche ni personnages.js ni les cours ; `--comparer` prouve que les batailles de campagne ne bougent pas. |
| Une carte générée invalide (bogue) | Contraintes vérifiées à la génération, régénération avec graine + 1 jusqu'à 20 fois, puis carte de secours fixe ; tests sur 200 graines. |
| Textes de route qui glissent vers du contenu de cours | Règle écrite (section 1), relecture dans /relecture, contrôle 10 étendu si souhaité. |
| Sauvegarde abîmée en cours d'expédition | `completer` ferme proprement en créditant la renommée ; copie `jeu5e-avant-import` déjà prévue à l'import. |
| Le joueur suit toujours la même porte (une seule famille) | Les portes tournent entre les familles dans chaque acte ; la troisième carte vient de la famille la moins jouée ; le quota de semaine et l'équilibre du tirage posent de toute façon toutes les matières : la porte ne choisit que la faveur, jamais les questions. |

---

## 22. Correspondance avec les deux conceptions sœurs

Les trois documents décrivent le même mode sous trois angles ; voici la table de traduction et ce que celui-ci apporte en propre, pour qu'on puisse composer la version finale sans contradiction.

| Ici (Spire) | expeditions-hades.md | expeditions-mvp.md | Remarque |
|---|---|---|---|
| halte | halte | halte | même chose |
| relais (ouverts gardien par gardien) | relais | départ libre, défaut = trois dernières semaines | ici : relais + réglage `relaisLibres` |
| vivres | vivres | vivres | aligné (« bannières » dans la version du 20/10) |
| Armorial | Armorial | Armorial (4 quartiers) | aligné (« Armurerie » dans la version du 20/10) |
| porte (butin annoncé sur la halte) | porte | porte | repris ici le 24/10 |
| quota de semaine (option `quota` de `suite`) | quota « 2 sur 3 » | quota, esquisse de code | même règle ; l'esquisse du MVP est reprise |
| palier(S) = (S − 1) div 3, + décalage du type | ligne(S) = (S − 1) div 2, interpolée, tirs par paliers | niveau = (S − 1) div 2, plafonné | à trancher au simulateur ; les trois passent par `options.rival` |
| gardien en attaque (camp retranché de 7 à 10) | gardien en défense (mode `defense`) | gardien en défense | le mode défense est déjà réglé pour « inquiéter un peu » : c'est une alternative solide, surtout si la mesure `--vagues` montre que 3 vagues portent trop peu de coups ; ici l'attaque est gardée pour que la carte de bataille change de halte en halte |
| rangs 1 à 4, 3 haltes au rang 2, élite espacé, repos garanti | 3 couches, 2 ou 3 haltes | 2 couches | ce document est le plus proche de Slay the Spire : contraintes de génération écrites (4.2) et testées sur 200 graines |
| reliques (12), marchand à six étals, forge | marchand (faveur, rare, affiner, vivre, plan) | marchand réduit | les reliques et la forge sont propres à cet angle |
| modificateurs d'élite (7) | modificateurs (6) + Serments | aucun au MVP | Serments gardés ici en extension |
| faveurs 6 × 4 × 3 rangs, 4 duos | 18 faveurs, 3 rangs, 6 duos | 6 faveurs, 2 rangs | même mécanique ; les listes se fusionnent |

Ce que cette version apporte en propre : la génération à rangs et contraintes (chemin tranquille garanti, élite espacé, repos avant le boss), les portes qui tournent entre les familles, les reliques et la forge, la prime de profondeur, la mesure préalable `--vagues` / `--pvRival`, et le plan en quatre étapes avec le MVP à sept faveurs et quatre quartiers.
