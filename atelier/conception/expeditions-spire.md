# Expéditions : une route procédurale sur la carte de campagne (angle Slay the Spire / Hadès)

Conception écrite le 20 octobre 2026, à partir des deux demandes de Romain du 16 octobre 2026 :

1. « Le jeu est trop court, il faut intégrer sur la map de campagne quelque chose de procédural, de plus en plus dur en avançant sur la carte, version Hadès roguelite où on s'améliore de partie en partie. »
2. « Intégrer jusqu'à la semaine 8, et du coup tu vois les semaines défiler dans les questions et les batailles. »

Document de conception seulement : rien ici n'est codé. Il s'appuie sur le code tel qu'il est aujourd'hui (jeu/js/campagne.js, bataille-moteur.js, bataille.js, recit.js, leitner.js, questions.js, rappels.js, sauvegarde.js, cartes-bataille.js, ecran-campagne.js) et sur les deux simulateurs de l'atelier. Les chiffres sont des valeurs de départ : la section 18 dit comment les régler au simulateur avant de livrer.

Lecture rapide : la section 0 résume tout en une page ; les sections 3 à 6 donnent les règles de jeu ; 15 à 17 la technique ; 19 le plan de réalisation.

---

## 0. Résumé en une page

- **Le mode « Expédition »** s'ajoute à la campagne (bouton de menu « Expédition »). Une expédition est une partie à part, de 25 à 45 minutes, qu'on peut quitter et reprendre à tout moment entre deux étapes (sauvegardée). Elle se joue sur une **route de parchemin** générée au hasard, faite de rangs de nœuds reliés par des chemins qui se séparent et se rejoignent, avec la brume devant.
- **La route suit les semaines de l'année.** Une expédition traverse trois **actes**, et chaque acte est une **semaine du programme** (« Semaine 6 », « Semaine 7 », « Semaine 8 »). Les deux tiers des questions d'un acte viennent des cours de sa semaine, le dernier tiers du tirage ordinaire (équilibre des familles, notions à revoir). Chaque question porte une étiquette « Semaine 7 · Cours 9 – Féodaux et seigneurs ». La dernière semaine qui a un cours ouvert est la **frontière** : son gardien clôt l'expédition. Les semaines d'après restent dans la brume.
- **On part d'un camp de base.** Au début, seule la première semaine ouverte sert de camp (aujourd'hui S1). Battre le gardien d'une semaine ouvre la semaine suivante comme camp de départ pour les expéditions futures : c'est le raccourci des roguelites, qui fait avancer le joueur dans l'année de partie en partie sans qu'il refasse toujours S1 à S3.
- **Les nœuds** : escarmouche (bataille courte), bataille, élite, rencontre (événement à questions), marchand ou forge, coffre, campement (repos ou veillée de révision), embuscade (défense), gardien de la semaine (boss). Chaque acte : 2 choix au rang 1, 3 au rang 2, repos garanti au rang 3, gardien au rang 4. Un chemin tranquille existe toujours ; le chemin risqué rapporte plus.
- **La difficulté monte** avec l'acte : niveau du seigneur rival (table RIVAL du moteur) de 0 à 4, solidité des camps adverses, modificateurs d'élite et de gardien (porte de fer, volée d'archers, champion à chaque vague…), 4 vagues au gardien de la frontière. Les batailles sont le moteur actuel, inchangé dans ses règles : 3 questions par vague, or gagné ou perdu, mêlée, IA du rival.
- **Récompenses de la partie seulement** : or d'expédition, **faveurs** des six conseillers du domaine (le chroniqueur, la cartographe, l'herboriste, le maître d'œuvre, le ménestrel ou le maître scribe, l'interprète), à trois rangs, comme les bienfaits des dieux dans Hadès, et **reliques**. Le conseiller qui offre ses faveurs est celui de la famille de matières réussie au nœud ; une troisième faveur vient toujours de la famille la moins jouée de l'expédition : la variété paie.
- **Bannières** : le moral de l'armée, 3 au départ. Une retraite (tes murs cèdent), un élite ou un gardien qui tient après ses vagues en coûtent une. À zéro, l'expédition s'arrête : retour au domaine avec tout ce qui a été gagné.
- **Rien de permanent ne se perd jamais.** Les ressources du domaine, les provinces, les bâtiments, l'arsenal, les jauges, la renommée et les améliorations de l'Armurerie restent. Une expédition perdue paie quand même sa renommée.
- **Méta-progression** : la **renommée** (jamais perdue) achète des améliorations permanentes à **l'Armurerie du souverain**, le miroir d'Hadès : bannières de plus, bourse de route, faveur de départ, second souffle, éclaireurs, forge réputée, chemins de traverse. Les camps de base et le **Livre des expéditions** (Codex) gardent la trace des exploits.
- **Technique** : sauvegarde au schéma 6 (objet `expedition`, migration sans perte), générateur à graine (mulberry32), deux fichiers nouveaux (jeu/js/expedition.js sans DOM, testé sous Node ; jeu/js/ecran-expedition.js), quatre petits points d'accroche dans l'existant (`JEU.bataille.lancer(lieu, exp)`, `options.rival`, `options.faveurs` et `options.championChaqueVague` du moteur, `JEU.recit.suiteMixte`, `cadre.semaine`). Aucune image nouvelle pour le MVP : icônes Game-icons, parchemin, cartes de bataille existantes.
- **Essais** : tests.js (générateur, contraintes, migration, bannières, renommée), perf.js (parcours clavier, moins de 100 ms entre deux questions), simuler-bataille.js `--expedition` (taux de réussite d'une expédition par justesse et par niveau d'Armurerie, durée estimée), mesurer-tirage.js `--expedition` (part des questions de la semaine, équilibre des familles).

---

## 1. Ce que demande Romain, ce que le jeu impose

### Les deux demandes

- Plus long, procédural, de plus en plus dur, roguelite « à la Hadès » : on progresse de partie en partie.
- Les semaines doivent se voir : la partie avance semaine par semaine, les questions d'une étape viennent surtout d'une semaine donnée, l'étape porte sa semaine, les semaines suivantes arrivent quand on avance, la semaine en cours est la frontière.

### Les règles fermes qui encadrent (CLAUDE.md et cahier des charges)

| Règle | Conséquence pour les expéditions |
|---|---|
| Jamais de chrono | Aucune limite de temps sur la route ni dans les nœuds ; les vagues se regardent comme aujourd'hui. |
| Environ 7 réussites sur 10 | Le tirage garde son niveau conseillé ; les nœuds ne changent pas la difficulté des questions, seulement celle des batailles. |
| Une erreur ne fait jamais perdre un bâtiment, une province ni une ressource du royaume ; en bataille seulement, un peu d'or de la bataille en cours | Inchangé dans les batailles d'expédition (orPerduErreur). Dans les rencontres, coffres et veillées : gains seulement. Les bannières ne tombent que sur une issue de bataille, jamais sur une réponse. |
| Une question ratée revient (« Seconde chance ») | Le tirage des expéditions passe par `JEU.recit.suite` : la file des rappels suit le joueur sur la route, comme partout. |
| Un cours s'ouvre dès que son fichier existe ; le calendrier ne bloque rien | La frontière est la dernière semaine qui a au moins un cours ouvert, pas la semaine du calendrier. Un cours déposé en avance ouvre sa semaine. |
| Un cours pas encore ouvert reste dans la brume : titre visible, sans question, indice ni aperçu | Les actes d'après la frontière montrent seulement « Semaine 9 · dans la brume », aucun titre de cours, aucun nœud. |
| Chaque question est posée dans le récit | Les conseillers du domaine posent les questions sur la route (nouveaux cadres : route, veillée, coffre), le conseil de guerre dans les batailles. |
| Cours des semaines 1 à 6 présumés acquis | Ils sont des actes comme les autres ; leur part de questions vient d'abord des fiches à revoir et des notions dues. |
| Style Total War, enluminure, héraldique ; ni pixel art ni manga | Route de parchemin à l'encre, médaillons, gonfanons aux couleurs des camps, lettrines Cinzel. |
| Conflits : camps politiques, ton neutre ; aucune figure religieuse ; armées du cours, sinon « un seigneur rival » | Les gardiens sont « le champion du roi d'Angleterre », « la garnison de l'émir de Cordoue », jamais un nom inventé. Les textes de la route sont du jeu : aucun fait historique, aucune religion. |
| Contenu des cours uniquement depuis les fichiers déposés | Les textes d'ambiance des nœuds, des faveurs et des reliques ne contiennent aucune information de cours (même règle que les répliques de personnages.js, contrôle 10 du validateur). |
| Moins de 100 ms entre une réponse et la question suivante | Le tirage se fait au début d'un nœud ou d'une vague, jamais entre deux questions ; la carte de la route n'est pas redessinée pendant une partie. |
| Sauvegarde avec schéma et migration sans perte | Schéma 6. |

### Décisions de cadrage

- Une expédition est une partie **à part** de la campagne : elle ne prend ni ne rend de province, mais elle y renvoie (section 12). La campagne reste la « maison » du roguelite : c'est là qu'on dépense la renommée et qu'on repart.
- Nom retenu pour la conception : **Expédition** (le joueur « part en expédition »). Variante possible si Romain préfère : « Chevauchée » (plus médiéval, mais le mot évoque des raids contre les campagnes : moins neutre). Le nom ne touche qu'aux textes.

---

## 2. La boucle de jeu, en une image

```
   LE DOMAINE / LA CAMPAGNE (la maison)
   │  renommée → Armurerie du souverain (améliorations permanentes)
   │  camps de base ouverts, Livre des expéditions
   ▼
   DÉPART : front (ouest ou sud), camp de base (semaine), graine
   │
   ▼
   ACTE 1 = Semaine S     ACTE 2 = Semaine S+1    ACTE 3 = Semaine S+2 (ou frontière)
   rang 1 (2 choix)       rang 1 (2 choix)        rang 1 (2 choix)
   rang 2 (3 choix)       rang 2 (3 choix)        rang 2 (3 choix, un élite)
   rang 3 (campement +1)  rang 3 (campement +1)   rang 3 (campement +1)
   GARDIEN                GARDIEN                 GARDIEN (de la frontière : 4 vagues)
   │                      │                       │
   │  chaque nœud : questions → or d'expédition, faveurs, reliques, bannières
   │  bannières à zéro → retour au domaine (renommée gardée)
   ▼
   FIN : renommée, chronique, ressources déjà gagnées, nouveau camp de base
```

Le joueur voit l'acte en cours en entier (comme la carte d'un acte de Slay the Spire : le choix de route compte), et seulement la bannière de semaine et la silhouette du gardien pour les actes suivants (la brume d'Hadès).

---

## 3. La route de l'année : actes, semaines, frontière, camps de base

### 3.1 Semaines ouvertes et frontière

- **Semaine d'un cours** : `semaine` de son entrée du planning (jeu/data/planning.js). Les cours hors planning (grammaire `langue-*`, anglais `anglais-*`, savoir-faire `methode-*`) n'ont pas de semaine : ce sont des **compagnons de route**, acceptés dans tous les actes (ils avancent au rythme de l'élève).
- **Semaine ouverte** : une semaine du planning dont au moins un cours est accessible (`JEU.progression.coursAccessibles`) et a des questions jouables. Aujourd'hui : S1, S2, S3 ; S4 à S8 dès que leurs fichiers sont là (tâche en cours).
- **Frontière** : la plus grande semaine ouverte (34 au plus). Le calendrier (`JEU.calendrier.semaine`) ne sert qu'à l'affichage (« cette semaine » sur la bannière de l'acte) ; il ne bloque rien, comme le veut CLAUDE.md. Si Romain dépose un cours de S9 pendant S8, S9 est ouverte.
- **Semaine sans cours** (trou dans les dépôts) : elle n'est pas un acte ; la route passe à la semaine ouverte suivante, et la bannière de l'acte le dit (« Semaine 5 traversée sans halte : ses cours ne sont pas encore déposés »).

### 3.2 Les actes d'une expédition

- Une expédition compte **3 actes** : les trois semaines ouvertes consécutives à partir du camp de base choisi. S'il en reste moins de trois avant la frontière, l'expédition en a 2 ou 1 ; le dernier acte dont la semaine est la frontière se termine par le **gardien de la frontière** (4 vagues au lieu de 3) et la fin victorieuse de l'expédition.
- Chaque acte porte sa semaine partout : bannière de l'acte sur la route, titre des batailles (« Escarmouche · Semaine 7 »), ligne de l'éclaireur au début de chaque vague (« Nous traversons les terres de la semaine 7 : ses cours sont en tête »), étiquette de chaque question (section 7.4).
- Au début d'un acte, un parchemin présente la semaine : numéro, dates du calendrier (`JEU.calendrier.libelle`), liste des cours ouverts de la semaine (titres du planning, qui sont déjà visibles dans l'écran Cours), et le gardien qui attend au bout.

### 3.3 Camps de base (le raccourci des roguelites)

- La liste `meta.camps` des semaines d'où l'on peut partir. Au début : la première semaine ouverte (S1).
- **Battre le gardien d'une semaine S ouvre S+1 comme camp** (si S+1 est ouverte, ou dès qu'elle le devient). Battre le gardien de la frontière n'ouvre rien de plus, tant que la frontière n'avance pas.
- Exemple aujourd'hui (S1 à S8 ouvertes) : expédition 1 depuis S1 (S1, S2, S3) ; victoire au gardien de S3 : camp S4 ; expédition 2 (S4, S5, S6) : camp S7 ; expédition 3 (S7, S8 + gardien de la frontière). Trois expéditions réussies amènent à la frontière ; ensuite, chaque semaine réelle ajoute une semaine à la route, et les expéditions repartent du camp le plus avancé (S6 ou S7) : les semaines récentes sont révisées le plus, les anciennes par le tiers de tirage ordinaire et les notions à revoir.
- Le joueur choisit librement son camp parmi ceux qu'il a ouverts (repartir de S1 reste possible : c'est une révision des débuts, avec la même renommée de nœuds mais sans la prime « semaine franchie pour la première fois »).

### 3.4 Ce qui n'a pas été retenu

- Repartir toujours de S1 (fidèle à Hadès) : les six premières semaines, présumées acquises, auraient pris toutes les questions ; la frontière aurait été hors de portée en 40 minutes dès novembre.
- Un acte par semaine pour toute l'année dans une seule expédition : 34 actes, plusieurs heures.
- Un acte par « ère » d'histoire : les autres matières n'ont pas d'ères, et Romain demande explicitement les semaines.

---

## 4. Génération procédurale de la carte d'un acte

### 4.1 Forme

Quatre rangs par acte, de gauche (départ) à droite (gardien), comme les routes de la carte de campagne :

```
 rang 1          rang 2            rang 3           rang 4
 (2 nœuds)       (3 nœuds)         (2 nœuds)        (1 nœud)

 ○ A ──────┬──── ○ D ────────────── ○ G (campement) ─┐
           │      ╲                 ╱                │
 ○ B ──────┼──── ○ E ──────────────┤                 ├── ◎ GARDIEN
           │      ╱                 ╲                │
           └──── ○ F ────────────── ○ H (forge/coffre/rencontre) ─┘
 arêtes : A→D, A→E ; B→E, B→F ; D→G ; E→G, E→H ; F→H ; G→gardien ; H→gardien
```

Quatre nœuds visités par acte, douze par expédition de trois actes, plus les trois gardiens qui sont des nœuds. Sur la route, les trois actes se suivent de gauche à droite dans un même parchemin qui défile (section 16).

### 4.2 Table des nœuds par rang et par acte

| Rang | Acte 1 (a = 0) | Acte 2 (a = 1) | Acte 3 (a = 2, ou dernier) |
|---|---|---|---|
| 1 | toujours { escarmouche, rencontre }, ordre tiré | idem | idem |
| 2 | 3 tirés sans remise, poids : bataille 2, rencontre 2, marchand 2, coffre 1, embuscade 1. **Jamais d'élite au premier acte.** | bataille 2, élite 1,5, rencontre 1,5, marchand 1,5, coffre 1, embuscade 1 | **un élite garanti** parmi les trois ; les deux autres : bataille 2, rencontre 1,5, marchand 1,5, coffre 1, embuscade 1 |
| 3 | toujours { campement, X } ; X = forge si aucun marchand au rang 2, sinon tiré parmi { coffre, rencontre } | idem | idem |
| 4 | gardien de la semaine | gardien | gardien (gardien de la frontière si la semaine est la frontière) |

Contraintes vérifiées par le générateur (et par tests.js) :

1. Deux nœuds du même type ne se touchent pas dans un même rang.
2. Au rang 2, au moins un nœud sans bataille (rencontre, marchand ou coffre) : le **chemin tranquille** (rencontre → marchand ou coffre → campement → gardien) existe dans chaque acte.
3. Un élite n'est jamais le seul nœud joignable depuis un nœud du rang 1 : il y a toujours une autre route.
4. Au plus un élite par acte ; jamais deux embuscades dans la même expédition.
5. Le campement est toujours au rang 3 (repos garanti avant le gardien), joignable depuis tous les nœuds du rang 2 sauf un au plus.
6. Chaque nœud a au moins un successeur ; le gardien est joignable depuis tout nœud du rang 1.
7. « Chemins de traverse » (Armurerie) : le rang 2 passe à 4 nœuds ; arêtes A→D,E ; B→F,G ; plus une arête croisée tirée (A→F ou B→E).

### 4.3 Algorithme (jeu/js/expedition.js, sans DOM)

```js
// generer(graine, { semaines: [6, 7, 8], front: "angleterre", frontiere: 8, options: { traverse: false } })
// → { version: 1, graine, front, actes: [ { semaine, frontiere: bool, noeuds: [ { id: "a0r1n0", rang, type, x, y,
//     suivants: ["a0r2n0", "a0r2n1"], carte: "gue", modif: null, fait: false } ] } ] }
function generer(graine, params) {
  var r = JEU.alea(graine);                       // mulberry32, le même que les simulateurs
  return { version: 1, graine: graine, front: params.front, actes: params.semaines.map(function (s, a) {
    var dernier = a === params.semaines.length - 1;
    var rang1 = melanger(r, ["escarmouche", "rencontre"]);
    var rang2 = tirerSansRemise(r, POIDS_RANG2[Math.min(a, 2)], 3, contraintesRang2(a));
    var rang3 = ["campement", rang2.indexOf("marchand") < 0 ? "forge" : choisir(r, ["coffre", "rencontre"])];
    var rang4 = [s === params.frontiere && dernier ? "frontiere" : "gardien"];
    var noeuds = poser([rang1, rang2, rang3, rang4], r, a);   // x par rang, y étalés, gigue ±6 %
    relier(noeuds);                                           // arêtes de la figure 4.1
    noeuds.forEach(function (n) { n.carte = carteDe(n.type, params.front, r); n.modif = modificateurDe(n.type, a, r); });
    return { semaine: s, frontiere: s === params.frontiere, noeuds: noeuds };
  }) };
}
```

- `carteDe` : escarmouche et bataille sur gue, foret, moulin ; élite sur col ou chateau ; gardien sur chateau (la Forteresse) ; gardien de la frontière sur col (la boucle autour de la place) ; embuscade sur domaine. Front du sud : les variantes « -sud » des mêmes tracés, comme aujourd'hui (jeu/js/bataille.js choisit déjà le terrain d'après le camp).
- `modificateurDe` : un modificateur pour chaque élite et chaque gardien (section 6.3), aucun pour les autres.
- La carte générée est **enregistrée telle quelle** dans la sauvegarde (une quarantaine de petits objets) ; la graine sert aux tests et au Livre des expéditions (« sceau n° 48213 »), pas à regénérer en cours de partie : une nouvelle version du générateur ne change jamais une expédition en cours.

### 4.4 Exemple de carte tirée (graine 7, front de l'ouest, S6 à S8)

```
Semaine 6                         Semaine 7                          Semaine 8 · frontière
rencontre ─┬─ bataille ─ campement ─┐   escarmouche ─┬─ élite ──── campement ─┐   rencontre ─┬─ coffre ──── campement ─┐
           ├─ marchand ─┤           ├─ GARDIEN       ├─ rencontre ─┤          ├─ GARDIEN     ├─ élite ────┤            ├─ GARDIEN DE LA FRONTIÈRE
escarmouche┴─ coffre ─── coffre ────┘   rencontre ───┴─ marchand ── forge ────┘   escarmouche┴─ bataille ── rencontre ──┘
```

---

## 5. Les nœuds

### 5.1 Tableau

Durées estimées à vitesse ×1 : 15 s par question (25 s avec le panneau d'erreur), 30 s de dépense d'or par vague, 60 s de vague (40 s à vitesse ×1,5, voir 13.2), 1 minute par nœud sans bataille.

| Nœud | Icône (Game-icons déjà dans le jeu) | Ce qui s'y passe | Questions | Durée | Récompenses (acte 1 → 3) | Risque |
|---|---|---|---|---|---|---|
| **Escarmouche** | assaut (épées croisées) | Bataille de 2 vagues contre un détachement ; niveau RIVAL = a | 6 | 4 à 5 min | victoire : 25 / 30 / 35 or d'expédition, 1 faveur parmi 2 ; tenu : la moitié de l'or, pas de faveur ; +2 or par bonne réponse | retraite : −1 bannière |
| **Bataille** | lances | 2 vagues, niveau a + 1, camp adverse plus solide | 6 | 5 min | 35 / 40 / 45 or, 1 faveur parmi 3 | retraite : −1 bannière |
| **Élite** | defi (emblème d'épées), cordon rouge | 3 vagues, niveau a + 1, un modificateur annoncé par l'éclaireur (6.3) | 9 | 7 min | 55 / 65 or, 1 faveur parmi 3 dont une rare au moins, 1 relique parmi 2 | tenu ou retraite : −1 bannière |
| **Embuscade** | lances + torche | Défense du domaine, 2 vagues, niveau a (DEFENSE.degats ×2, colonne assaut) ; tenu = réussite | 6 | 4 à 5 min | 30 / 35 / 40 or, 1 faveur parmi 3 | retraite : −1 bannière |
| **Rencontre** | trompe | Une carte d'événement de route : récit, 2 ou 3 questions, parfois un choix (5.3) | 2 à 3 | 1 à 1,5 min | 10 à 30 or, parfois une faveur commune ou une relique | aucun (rien n'est perdu) |
| **Marchand** | marchand (chariot) | Six étals, prix en or d'expédition (8.2) | 0 (ou 1 pour marchander) | 1 min | ce qu'on achète | aucun |
| **Forge** | forge (enclume) | Comme le marchand, plus la **trempe** : monter d'un rang une faveur possédée (40 or), ou +1 niveau d'arsenal d'un type pour l'expédition (35 or) | 0 ou 1 | 1 min | — | aucun |
| **Coffre** | tresor | Un coffre scellé : une question (niveau 2 ou 3) ; juste : relique ou 40 / 50 / 60 or au choix ; fausse : 15 or quand même (« la serrure a cédé à moitié ») et la question reviendra en Seconde chance | 1 | 0,5 min | voir à gauche | aucun |
| **Campement** | camp (feu) | Repos (+1 bannière, jusqu'au maximum) **ou** veillée : 3 questions tirées d'abord dans les fiches à revoir, +10 or chacune, 3 sur 3 : une faveur possédée monte d'un rang | 0 ou 3 | 0,3 à 1,2 min | voir à gauche | aucun |
| **Gardien de la semaine** | heaume sur écu du camp | 3 vagues, niveau a + 1 (4 au plus), modificateur ; les coups portés restent d'un assaut à l'autre | 9 | 7 min | 60 / 70 / 80 or, 1 faveur parmi 3 (rare garantie), 1 relique, +1 bannière, renommée | le gardien tient après 3 vagues : −1 bannière, on peut réassiéger (ses coups restent) ; retraite : −1 bannière |
| **Gardien de la frontière** | couronne sur écu | 4 vagues, niveau 4, deux modificateurs | 12 | 9 min | 100 or (inutile ensuite : converti en renommée, 1 pour 5), 1 relique, fin victorieuse | idem |

« Tenu » (toutes les vagues repoussées sans abattre le camp adverse) laisse toujours passer sur une escarmouche, une bataille ou une embuscade ; il ne coûte une bannière que sur un élite et un gardien.

### 5.2 Récompense liée aux réponses, pas au hasard seul

- L'or du nœud compte les bonnes réponses : +2 or d'expédition par bonne réponse en bataille, +5 par bonne réponse de rencontre, de veillée ou de coffre, en plus du socle du tableau.
- Le rang d'une faveur offerte dépend de la réussite au nœud : moins de 60 % de bonnes réponses : commune 85 %, rare 15 % ; de 60 à 89 % : commune 70 %, rare 25 %, légendaire 5 % ; 90 % et plus : commune 45 %, rare 45 %, légendaire 10 %. Un élite ou un gardien garantit une rare.
- Le conseiller qui offre ses faveurs est celui de la **famille de matières la mieux réussie au nœud** (bonnes réponses, puis taux) ; à égalité, la famille la **moins jouée depuis le début de l'expédition**. La troisième carte vient toujours de la famille la moins jouée de l'expédition : qui varie les matières voit plus de faveurs différentes.

### 5.3 Rencontres (événements de route)

Dix cartes au départ, dans jeu/js/expedition.js (textes du jeu, sans fait historique, sans religion, sans nom propre ; 40 mots au plus). Toutes gardent la règle des événements de la campagne : rien n'est jamais perdu.

| Rencontre | Choix et questions | Issue |
|---|---|---|
| Le passeur du gué | Payer 20 or, ou répondre à 2 questions | 2 sur 2 : passage et +15 or ; 1 sur 2 : passage ; 0 : passage quand même, sans rien |
| Le colporteur | 3 questions | +10 or chacune ; 3 sur 3 : une faveur commune au choix parmi 2 |
| La meunière | 2 questions pour aider à réparer la roue | 2 sur 2 : +1 bannière ; sinon +10 or |
| Le messager du souverain | Missive du souverain (si un personnage est ouvert), puis 2 questions | +4 renommée tout de suite, +10 or |
| Les ruines | 1 question de niveau 3 | juste : relique au choix parmi 2 ; fausse : +15 or |
| Le tournoi du bourg | Le joueur choisit une matière parmi les deux familles les moins jouées de l'expédition, puis 3 questions de cette famille | 2 sur 3 : faveur de ce conseiller parmi 2 ; 3 sur 3 : rare garantie |
| Le marché aux chevaux | Payer 30 or, ou 2 questions | cavaliers +1 niveau d'arsenal pour l'expédition (2 sur 2 ou paiement) ; sinon +10 or |
| Le voyageur lettré | 2 questions de la famille français | +15 or chacune |
| L'orage | 2 questions (abriter la colonne) | 1 sur 2 au moins : +20 or ; 0 : rien, la route continue |
| Les éclaireurs du rival | Missive du rival (défi), 2 questions | 2 sur 2 : le modificateur du prochain élite ou gardien est révélé et une troupe de moins à sa première vague (espion) ; sinon +10 or |

Les rencontres tirent leurs questions avec le mélange de l'acte (section 7.2), niveaux 1 et 2 comme les événements de la campagne ; le niveau 3 des ruines passe par `JEU.questions.avecNiveaux([2, 3], …)`.

---

## 6. Les batailles d'expédition

### 6.1 Ce qui ne change pas

Le moteur (jeu/js/bataille-moteur.js) et le rendu (jeu/js/bataille.js) sont ceux de la campagne : préparation avec 3 questions par vague (QUESTIONS_PAR_VAGUE), or de la bataille gagné (12 + Savoir, coup d'éclat au 3e succès) ou perdu (6, jamais sous zéro), tours, troupes, mêlée en bataillons, sang réglable, IA du seigneur rival (tours dès le début, garnison, guetteurs, postures), bilan. Les questions sont tirées comme aujourd'hui, niveaux 1 à 3, avec le mélange de l'acte (7.2).

### 6.2 Réglages par nœud et par acte (valeurs de départ, à régler au simulateur)

| Nœud | Acte 1 | Acte 2 | Acte 3 ou dernier | Vagues | Solidité du camp adverse (pvRival) |
|---|---|---|---|---|---|
| Escarmouche | niveau 0 | niveau 1 | niveau 2 | 2 | 4 / 5 / 6 |
| Bataille | niveau 1 | niveau 2 | niveau 3 | 2 | 5 / 6 / 7 |
| Élite | — | niveau 2 + modif. | niveau 3 + modif. | 3 | 10 / 12 |
| Embuscade (défense) | niveau 0 | niveau 1 | niveau 2 | 2 | ton château : 20 + Peuple + remparts (comme aujourd'hui) ; camp adverse 12 |
| Gardien | niveau 1 + modif. | niveau 2 + modif. | niveau 3 + modif. | 3 | 8 / 9 / 11 |
| Gardien de la frontière | — | — | niveau 4 + 2 modif. | 4 | 12 |

Pourquoi des solidités si petites à côté des places fortes de la campagne (16 à 32) : la campagne est faite pour des sièges en plusieurs batailles de 4 vagues (2 à 5 batailles par province) ; ici chaque nœud doit se jouer en un seul passage de 2 ou 3 vagues. D'après les mesures du 16/10/2026 (joueur équilibré, 80 graines), une bataille de 4 vagues porte 15,5 coups au niveau 0 à p = 0,8 (12,8 à p = 0,7) et 11,9 au niveau 1 ; la première vague en porte peu (l'armée est petite), les suivantes de plus en plus (revenu des troupes). Deux vagues portent donc 3 à 5 coups, trois vagues 7 à 9. Les valeurs ci-dessus visent : escarmouche gagnée du premier coup 6 fois sur 10 à p = 0,7 (tenu sinon, qui laisse passer), gardien battu du premier assaut 6 fois sur 10 et en deux assauts 9 fois sur 10. Ce sont des **camps retranchés** (palissade, tentes), pas des forteresses : le rendu garde la place forte du camp adverse (image existante), la jauge dit « Camp du gardien 6 / 9 ».

Le joueur garde son arsenal et ses jauges de la campagne (`JEU.campagne.options(niveau)`), plus les faveurs et reliques de l'expédition : la force du royaume compte dans les expéditions, c'est une méta-progression de plus, déjà là.

### 6.3 Modificateurs d'élite et de gardien

Un par élite et par gardien (deux pour le gardien de la frontière), tiré à la génération, annoncé par l'éclaireur au début de la bataille (et sur la carte avec l'amélioration « Éclaireurs » de l'Armurerie). Chacun s'écrit comme une surcharge de la ligne RIVAL du niveau (`options.rival`, section 17.2) :

| Modificateur | Effet (sur la ligne RIVAL du niveau) | Phrase de l'éclaireur |
|---|---|---|
| Porte de fer | garnison + 1, garde × 1,3 | « Sa porte est tenue par des hommes d'armes en cuirasse : il faudra les battre avant de toucher ses murs. » |
| Volée d'archers | toursDepart + 1 | « Une tour de plus garde sa route : avance tes troupes sous couvert de tes propres tours. » |
| Trésor de guerre | tresor + 30, impot + 20 | « Il a de l'or plein ses coffres : attends-toi à des renforts à chaque vague. » |
| Marche forcée | ecartSortie − 0,2 s (plancher 0,5) | « Ses troupes sortent serrées : tes tours auront moins de temps entre deux. » |
| Champion à chaque vague | `options.championChaqueVague` : un champion ferme chaque vague, pas seulement la dernière | « Son champion mène chaque vague : garde des piquiers pour le ralentir. » |
| Guetteurs vigilants | IA.alerte 20 → 10 pour cette bataille | « Ses guetteurs voient tout : une ruée de troupes sera accueillie par toute sa garnison. » |

Ces six effets suffisent au MVP ; d'autres viendront des mesures (une baliste dès le départ, une pluie permanente…).

### 6.4 Comment la profondeur se lit dans la bataille

- Niveau RIVAL de 0 (acte 1, escarmouche) à 4 (frontière) : les mêmes paliers que les provinces, déjà équilibrés : troupes plus solides, tours qui tirent plus fort, garnison plus coriace, IA plus riche.
- Nombre de vagues : 2 au début de l'acte, 3 pour les élites et gardiens, 4 à la frontière.
- Modificateurs cumulés : un à l'élite, un au gardien, deux à la frontière.
- Les camps adverses des gardiens gardent les coups reçus (`enCours.gardiens[acte].pv`), comme les places fortes de la campagne : un gardien qui tient n'est pas un mur, c'est une bannière de moins et un siège qui reprend là où il s'est arrêté.

---

## 7. Les questions : le cœur du mode

### 7.1 Un seul tirage

Tout passe par `JEU.recit.suite` (jeu/js/recit.js) : équilibre des familles de matières (parts égales, coup de pouce 1,5 pour une famille à revoir), priorités dans une matière (50 % à revoir, 40 % récents, 10 % solides), anti-répétition (fenêtre de 60 questions, repos des fiches), niveau conseillé (7 sur 10), file des « Seconde chance » placée à son rang. Les expéditions n'y ajoutent qu'un **filtre de semaine** et une **part**.

### 7.2 Le mélange de l'acte : deux tiers de la semaine, un tiers du tirage ordinaire

Nouvelle fonction `JEU.recit.suiteMixte(nombre, options, semaine, part)` (une dizaine de lignes) :

```js
// k = arrondi(nombre × part) questions dont le cours est de la semaine de l'acte (ou un compagnon de route :
// langue, anglais, méthode), tirées avec toutes les règles (completer : si la semaine n'a pas assez de questions
// libres, le tirage se relâche comme aujourd'hui) ; puis nombre − k questions du tirage ordinaire, en excluant les
// premières. Les rappels dus se placent dans l'ensemble, comme toujours (JEU.rappels.placer via suite).
function suiteMixte(nombre, options, semaine, part) {
  var k = Math.round(nombre * (part == null ? 2 / 3 : part));
  var deLaSemaine = function (q) { var s = JEU.progression.semaineDe(q.cours); return s === null || s === semaine; };
  var f = options.filtre;
  var a = suite(k, Object.assign({}, options, { filtre: f ? function (q) { return f(q) && deLaSemaine(q); } : deLaSemaine, completer: true }));
  var b = suite(nombre - a.length, Object.assign({}, options, { exclure: (options.exclure || []).concat(a.map(function (q) { return q.id; })) }));
  return a.concat(b);
}
```

- Lot de 3 d'une vague : 2 de la semaine, 1 ordinaire. Rencontre de 3 : 2 + 1 ; de 2 : 1 + 1. Veillée : filtre « fiche à revoir » à la place du filtre de semaine, `completer: true`.
- `JEU.progression.semaineDe(coursId)` : la semaine de l'entrée du planning, `null` pour langue, anglais et méthode (compagnons de route, acceptés partout ; l'équilibre des familles les tient à leur part).
- Les familles restent équilibrées **sur la durée** (mémoire `historique` de recit.js, oubli 0,85) : une semaine sans SVT (S7 n'a que géographie, histoire et lecture) voit son tiers ordinaire et les compagnons de route rattraper la SVT et la physique, et la semaine suivante compense. Mesure visée (18.4) : chaque famille entre 12 et 28 % sur une expédition, part des questions de la semaine de l'acte entre 55 et 70 %.
- Les fiches à revoir (a-retravailler.js, cours « à revoir » de suivi.js) gardent leur priorité dans les deux parts, et la veillée du campement les cible.
- Le niveau conseillé et les « Seconde chance » sont inchangés : une question ratée dans une rencontre peut revenir dans la bataille suivante, où qu'elle soit sur la route ; une question de niveau 3 ratée attend une bataille (règle actuelle).

### 7.3 Nombre de questions par expédition

Chemin tranquille : 3 (rencontre) + 1 (coffre) + 0 (campement, repos) + 9 (gardien) = 13 par acte, 39 pour trois actes (42 avec la frontière). Chemin de bataille : 6 + 9 + 3 (veillée) + 9 = 27 par acte, 81 au plus. Expédition type : 55 à 60 questions, soit l'équivalent de cinq batailles de campagne ou de sept conseils.

### 7.4 Le récit et l'étiquette de semaine

- `JEU.recit.cadre(q, contexte)` reçoit trois contextes de plus : `route` (rencontres : « {N} t'arrête au bord du chemin : “Seigneur, avant d'aller plus loin…” »), `veillee` (« Autour du feu, {N} rouvre son carnet : “Reprenons ce que tu as trouvé difficile.” »), `coffre` (« {N} examine la serrure : “Elle s'ouvre à qui sait répondre.” »). Trois phrases au moins par contexte, comme aujourd'hui. Les batailles gardent `preparation` et `defense`.
- `cadre` renvoie en plus `semaine : { numero, titre } | null`, calculé pour **toutes** les parties du jeu (campagne comprise, pour répondre à « tu vois les semaines défiler dans les questions ») : `numero` et `titre` de l'entrée du planning (« Semaine 7 », « Cours 9 – Féodaux et seigneurs ») ; pour un cours de langue : `{ numero: null, titre: "Griffon de cuivre" }` ; anglais : « Séquence 1 » ; méthode : « Savoir-faire ». `JEU.ui.recit` l'affiche en petit ruban à droite du nom du conseiller : « Semaine 7 », le titre du cours en infobulle (`title`) et sous le ruban en 14 px quand la colonne est large. Dans une expédition, le ruban prend la couleur du camp quand la question est de la semaine de l'acte, la couleur pierre sinon (« d'une autre semaine »). (La tâche en cours « semaine visible dans les questions » peut livrer ce point ; cette conception s'y aligne : un champ `semaine` sur le cadre, une classe `.recit-semaine`.)
- Au début de chaque vague d'une bataille d'expédition, l'éclaireur (déjà utilisé pour les nouvelles du front) dit la semaine : « Nous traversons les terres de la semaine 7 : ses cours sont en tête. »

---

## 8. Économie de la partie

### 8.1 L'or d'expédition

Distinct de l'or de bataille (qui reste dans sa bataille, avec ses règles). Sources : socle des nœuds (5.1), bonnes réponses (+2 en bataille, +5 ailleurs), rencontres, coffres, « Bourse de route » de l'Armurerie, faveurs de la cartographe et de l'interprète. Il ne descend jamais sous zéro et ne se perd que si on le dépense. En fin d'expédition, l'or restant devient de la renommée (1 pour 5) : rien n'est jeté.

Recette type par acte (chemin mixte, p = 0,7) : escarmouche 30 + 8 = 38, rencontre 20, campement 0, gardien 70 + 12 = 82, soit 140 or ; sur trois actes, 420 or, plus 25 à 75 de bourse de route.

### 8.2 Le marchand et la forge

Six étals, prix multipliés par 1,25 à l'acte 2 et 1,5 à l'acte 3 (arrondis à 5) :

| Étal | Prix (acte 1) | Contenu |
|---|---|---|
| Faveur commune | 40 | une faveur tirée (conseiller tiré parmi les familles jouées dans l'expédition) |
| Faveur rare | 75 | idem, rare |
| Relique | 90 | une relique tirée (jamais une relique déjà possédée) |
| Provisions | 50, puis × 1,5 à chaque achat | +1 bannière (jusqu'au maximum) |
| Flèches trempées | 25 | la prochaine bataille a le modificateur flechesNeuves (archers +50 %) dès la 1re vague |
| Rumeurs | 15 | le modificateur du prochain élite ou gardien se lit sur la carte |

La forge a les mêmes étals plus deux : **trempe** (monter d'un rang une faveur possédée, 40) et **atelier** (+1 niveau d'arsenal d'un type au choix, pour l'expédition seulement, 35, un seul par forge). « Marchander » : une question de niveau 2 ; juste : −20 % sur un achat ; fausse : rien ne change.

### 8.3 Reliques (12 au départ)

Objets passifs, pour toute l'expédition, une seule fois chacun. R : effet de route ; O : passe par `JEU.campagne.options` étendu ; E : point d'accroche dans le moteur (17.2).

| Relique | Effet |
|---|---|
| Bourse du voyageur (R) | +20 or d'expédition au début de chaque acte |
| Clé ouvragée (R) | les coffres offrent le choix entre deux récompenses |
| Carte annotée (R) | les types des nœuds de l'acte suivant se voient à travers la brume |
| Gonfanon de soie (R) | +1 bannière au maximum |
| Pierre à aiguiser (O) | tours +10 % de dégâts |
| Anneau du trésorier (O) | +25 or au début de chaque bataille |
| Lanterne (R) | la veillée du campement rend aussi +1 bannière |
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
| | Chemins connus | +1 nœud au rang 2 de chaque acte / et les modificateurs se lisent / et +1 choix au rang 1 | R (génération des actes suivants) |
| | Relais de poste | +10 / +15 / +20 or d'expédition par nœud franchi | R |
| | Carte des gués | tes troupes marchent 10 / 20 / 30 % plus vite | E (creerUnite) |
| L'herboriste (SVT) | Baume | +1 bannière / +1 et +1 au maximum / +2 et +1 au maximum | R |
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
| | Gonfanon brodé | +1 bannière au maximum / et +1 maintenant / +2 au maximum | R |
| L'interprète (anglais) | Trêve négociée | garnison −1 au départ / tour de départ −1 / les deux | E (rivalDepart) |
| | Lettres de change | +40 / +60 / +80 or d'expédition maintenant | R |
| | Marchands d'outre-Manche | le marchand a 1 / 2 étals de plus / et une relique garantie | R |
| | Rançon | une troupe adverse abattue rapporte +1 / +2 / +3 or de bataille de plus | E (blesser) |

Les faveurs de l'interprète ne sont offertes que si l'anglais a des questions (la famille doit avoir été jouée) : elles arrivent d'elles-mêmes avec les séquences d'anglais en cours.

Au MVP, seules les faveurs O et R sont livrées (14 sur 24) ; les faveurs E arrivent avec les accroches du moteur à l'étape 2 (section 19).

---

## 10. Bannières, défaite, fin d'expédition

- **Bannières** (le moral de l'armée) : 3 au départ ; maximum 3, relevé par l'Armurerie, des faveurs et une relique (5 au plus en tout).
- **Perdre une bannière** : retraite dans toute bataille (tes murs cèdent, comme aujourd'hui) ; élite ou gardien qui tient après toutes ses vagues ; quitter une bataille d'expédition après le départ de la première vague (comme `surQuitter` compte une retraite aujourd'hui ; avant la première vague, rien). Jamais sur une réponse, une rencontre, un coffre ou une veillée.
- **Regagner une bannière** : campement (repos), gardien battu, Baume, meunière, Provisions du marchand, Lanterne ; jamais au-delà du maximum.
- **À zéro** : l'expédition s'arrête sur la route, parchemin « Retour au domaine » : ce qu'on rapporte (renommée gagnée, ressources déjà créditées par les bonnes réponses, actes franchis, camp de base ouvert le cas échéant), une phrase du conseiller (« Une expédition qui apprend n'est jamais perdue ») et le bouton « Rentrer ». Aucune défaite n'efface rien.
- **Fin victorieuse** : le gardien du dernier acte tombe : parchemin « Expédition accomplie », renommée, nouveau camp, Livre des expéditions.
- **Abandonner** : depuis la carte, « Lever le camp » (confirmation) : même écran de retour, renommée des nœuds déjà franchis, sans la prime d'expédition accomplie.

Taux visés (18.3) : avec p = 0,7 et sans amélioration, 55 à 65 % des expéditions vont au bout, 90 % passent le premier gardien ; avec 150 de renommée dépensée, 75 à 85 % ; à p = 0,6, 25 à 40 % (et jamais un mur : 80 % passent le premier gardien) ; à p = 0,9, 90 % et plus. C'est plus clément qu'un roguelite du commerce : le cahier demande « pas trop d'échecs », et la frustration viendrait ici d'un moteur de bataille, pas d'une notion mal sue.

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

Expédition type accomplie : 3 × (3 + 1 + 1 + 10) + 20 + 15 (or restant) = 80, plus 45 la première fois qu'on franchit ses trois semaines. Expédition perdue au deuxième acte : 25 à 35. Deux ou trois expéditions par semaine réelle : 150 à 250 de renommée par semaine.

Titres affichés avec la renommée (parure seulement) : Écuyer (0), Banneret (100), Capitaine (250), Connétable (500), Maréchal (900).

### 11.2 L'Armurerie du souverain (le miroir d'Hadès)

Améliorations permanentes achetées avec la renommée, depuis l'écran Expédition (et un raccourci sur la carte de campagne). Prix cumulés : environ 600 pour tout avoir, soit huit à dix expéditions accomplies : de quoi tenir plusieurs semaines sans que tout soit acquis tout de suite.

| Amélioration | Effet | Prix par cran |
|---|---|---|
| Gonfanon de plus | +1 bannière au départ et au maximum (jusqu'à 5) | 40, 90 |
| Bourse de route | +25 or d'expédition au départ | 20, 40, 80 |
| Faveur de départ | choisir une faveur commune parmi 3 au départ | 50 |
| Second souffle | une fois par expédition, la dernière bannière perdue est rendue | 70 |
| Éclaireurs | le modificateur des élites et gardiens se lit sur la carte | 30 |
| Forge réputée | marchand et forge : un étal de plus et −20 % | 45 |
| Mémoire du chroniqueur | une « Seconde chance » réussie en expédition rapporte +6 or de bataille de plus | 35 |
| Chemins de traverse | 4 nœuds au rang 2 de chaque acte | 50 |

Ordre conseillé affiché au joueur (sans obligation) : bourse, gonfanon, faveur de départ.

### 11.3 Camps de base et Livre des expéditions

- Camps : section 3.3 ; jamais retirés, même si Romain retire un fichier de cours (la semaine redevient « sans halte » et la route saute à la suivante).
- Livre des expéditions (Codex, à côté de la Galerie des souverains) : les vingt dernières expéditions (date, front, semaines, actes franchis, issue, renommée, sceau n°), la meilleure profondeur, les gardiens battus par semaine, les faveurs vues. Rien d'un cours fermé n'y apparaît.

---

## 12. Liens avec la campagne existante

- **Deux fronts** : au départ, le joueur choisit « Vers l'ouest » (royaume d'Angleterre) ou « Vers le sud » (Empire omeyyade). Tout l'acte suit ce choix : couleurs et emblème des gonfanons (`JEU.campagne.CAMPS`), terrains des batailles (variantes « -sud »), rival des missives (`JEU.campagne.rivalDe`), gardiens (« le champion du roi d'Angleterre », « la garnison de l'émir de Cordoue » ; faute de personnage ouvert : « le champion d'un seigneur rival »). Le front du sud n'est proposé qu'une fois le front de l'ouest tenté une fois (la première expédition se présente d'elle-même).
- **Rivalité** : +3 par gardien battu sur son front, +1 par élite (jamais en baisse ; les gains restent inférieurs à ceux de la campagne). L'humeur du rival change donc aussi avec les expéditions.
- **Missives** (réglage « Messages des rivaux ») : au départ de la première expédition, le souverain écrit (« Pars, et reviens couvert de renommée ») ; avant chaque gardien, le défi du rival, une fois sur deux, comme devant une place forte (`missiveAvantBataille` étendu à un lieu « gardien ») ; au retour sur la carte de campagne, une lettre selon l'issue (expédition accomplie : situation `province` avec {province} = « la semaine 8 » ; défaite : rien, ou `retraite`). Les répliques existantes suffisent au MVP ; des répliques propres aux expéditions pourront s'ajouter à personnages.js (contrôle 10 inchangé).
- **Provinces** : un gardien battu porte 2 coups à la place forte visée sur le même front (« ton expédition a affaibli le Gué »), comme le défi du champion (−3). Jamais une prise : seule une bataille de campagne prend une province.
- **Souverain** : le souverain servi est celui de la campagne (seuil de provinces) ; il n'est pas touché par les expéditions.
- **Ressources du domaine** : inchangées dans leur règle (+1 par bonne réponse, créditée par `enregistrerReponse`) ; un gardien battu ajoute 4 ressources de la matière la plus jouée dans l'acte (comme une victoire de campagne, qui en donne 8).
- **Chronique** : « Ton expédition a franchi la semaine 7 », « Tu es rentré de la semaine 6 avec 32 de renommée ».
- **Événement du jour, conseil, arsenal, attaques du rival** : inchangés ; une attaque du domaine en attente n'empêche pas de partir en expédition (le rival « campe » comme aujourd'hui).

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
- Gardiens des actes 1 et 2 à 2 vagues (3 au dernier acte, 4 à la frontière) : −2,5 min par acte. Gardé en réserve.

### 13.3 Pause et reprise

- L'expédition est enregistrée après chaque nœud, chaque achat, chaque choix de faveur (`JEU.sauvegarde.enregistrer`). Quitter le jeu n'importe quand entre deux nœuds ne perd rien ; l'écran Expédition propose « Reprendre : acte 2, semaine 7, au campement ».
- Une bataille interrompue (fermeture du jeu) se rejoue depuis son début, avec un nouveau tirage ; si une vague avait été lancée, la reprise compte une retraite (−1 bannière), comme un « Quitter » en cours de bataille ; avant la première vague, rien. Les coups portés à un gardien ne comptent qu'à la fin d'un assaut terminé.
- Les offres en cours (faveurs à choisir, étals du marchand) sont enregistrées avec le nœud : on retrouve les mêmes au retour.
- Une seule expédition en cours à la fois ; en commencer une nouvelle demande de lever le camp de l'ancienne (confirmation, renommée gardée).

---

## 14. Graines et déterminisme

- `JEU.alea(graine)` : mulberry32, le même que simuler-bataille.js et mesurer-tirage.js, dans jeu/js/alea.js (15 lignes, sans DOM). Graine d'une expédition : `(Date.now() ^ (meta.parties * 2654435761)) >>> 0`, affichée comme « sceau n° » dans le Livre.
- Déterministe par la graine : la carte (types, arêtes, positions, cartes de bataille, modificateurs), l'ordre des étals du marchand, les rencontres tirées. **Pas** déterministe : les questions (tirage du jeu, qui dépend de la sauvegarde) et le cours des vagues (le moteur garde `Math.random` pour le pas des figurines ; l'IA du rival est sans hasard). Les faveurs offertes sont tirées à la graine mais dépendent des réponses (famille la mieux réussie) : elles sont enregistrées avec le nœud.
- Le générateur porte un numéro (`carte.version`) ; une carte enregistrée n'est jamais regénérée.
- « Défi de la semaine » (extension) : graine = numéro de la semaine du calendrier × 1000 + année : la même carte toute la semaine, pour se mesurer à soi-même dans le Livre.

---

## 15. Sauvegarde : schéma 6

### 15.1 Structure

```js
expedition: {
  meta: {
    renommee: 0, depensee: 0,                 // renommée totale gagnée (jamais en baisse) et dépensée à l'Armurerie
    armurerie: { gonfanon: 0, bourse: 0, faveurDepart: 0, souffle: 0, eclaireurs: 0, forge: 0, memoire: 0, traverse: 0 },
    camps: [1],                               // semaines d'où l'on peut partir
    franchies: [],                            // semaines dont le gardien a été battu au moins une fois (prime +15)
    parties: 0, accomplies: 0, meilleure: null, // meilleure : { semaine, acte, le }
    livre: []                                 // 20 dernières : { le, front, semaines, actes, issue, renommee, graine }
  },
  enCours: null | {
    version: 1, graine: 48213, front: "angleterre", semaines: [6, 7, 8], frontiere: 8,
    acte: 0, position: "a0r1n0",              // nœud où l'on se trouve (fait) ; suivants joignables = ses arêtes
    bannieres: 3, bannieresMax: 3, or: 25, souffleUtilise: false,
    faveurs: [{ id: "flechesTrempees", rang: 1 }], reliques: ["cleOuvragee"],
    arsenalPlus: { tours: { baliste: 1 }, troupes: {} }, // niveaux d'arsenal gagnés pour l'expédition seulement
    prochaineBataille: { flechesNeuves: true, espion: false },
    carte: [ /* actes générés, voir 4.3 ; chaque nœud porte fait: true|false, et pour un gardien pv, max, assauts */ ],
    offres: null | { noeud: "a0r2n1", faveurs: [...], reliques: [...], etals: [...] },
    stats: { questions: 0, bonnes: 0, parFamille: {}, noeuds: 0, batailles: 0, retraites: 0 },
    journal: [],                              // 30 dernières lignes de l'expédition (texte), pour la reprise
    debut: "2026-10-20T18:02:00"
  }
}
```

Taille : moins de 4 Ko par expédition en cours.

### 15.2 Migration et réparation

- `SCHEMA = 6` dans jeu/js/sauvegarde.js ; `MIGRATIONS[5]` ajoute `s.expedition = JEU.expedition.completer(s.expedition)` et passe à 6, sans rien retirer. Une sauvegarde de schéma 1 passe par 2, 3, 4, 5, 6 (tests existants étendus).
- `JEU.expedition.completer(e)` : sur le modèle de `JEU.campagne.completer` (une valeur absente ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas) ; une expédition en cours abîmée (carte illisible, position inconnue) est fermée proprement : sa renommée de nœuds déjà franchis est créditée, puis `enCours = null`, et le journal du jeu le dit en une ligne.
- `meta.camps` : toujours au moins la première semaine ouverte, recalculée au chargement si la liste est vide.
- Export et import : inchangés (l'objet suit). docs/FORMAT_DONNEES.md reçoit la section « expedition » et la ligne « schéma 6 ».

---

## 16. Interface et direction artistique

### 16.1 L'écran « Expédition » (menu)

- Sans expédition en cours : titre « L'expédition », parchemin de départ : front (deux écus : lys contre lion, lys contre tour), camp de base (liste des semaines ouvertes comme camps, avec la liste des cours de la semaine de départ), renommée et titre, boutons « Partir (Entrée) », « L'Armurerie », « Le Livre des expéditions ». Un mot du conseiller la première fois (le chroniqueur explique la route en trois phrases).
- Avec une expédition en cours : la route, directement.

### 16.2 La route de parchemin

- Un SVG de 2 900 × 520 (trois actes de 960 px côte à côte, plus le camp de base à gauche et la brume à droite), dans un cadre qui défile horizontalement (`overflow-x: auto`, `scroll-snap` par acte, défilement doux vers l'acte en cours), fond parchemin (assets/images/parchemin.png) avec le fond 3D de la campagne passé au sépia en filigrane (fond-campagne existant, opacité 0,25, réutilisé tel quel), vignettage, traits d'encre.
- **Bannière d'acte** : un gonfanon aux couleurs du camp adverse, lettrine Cinzel « Semaine 7 », dessous en Crimson « du 12 au 18 octobre » et « cette semaine » si c'est la semaine du calendrier ; un clic ou Entrée sur la bannière ouvre la liste des cours de la semaine (titres).
- **Nœuds** : médaillons de 56 px (anneau d'or, disque parchemin, icône Game-icons à l'encre), sous-titre de 14 px (« Escarmouche », « Rencontre »…) ; gardien : médaillon de 84 px avec l'écu du camp et un gonfanon planté ; élite : cordon rouge brique et épées croisées ; nœud fait : cachet de cire posé dessus (icône `sceau`), chemin parcouru en trait plein ; nœuds joignables : halo d'or (le même que le lieu « cible » de la carte de campagne) et numéro de touche ; nœuds hors de portée : encre pâlie (opacité 0,45) ; actes suivants : nappes de brume (`lieu-brume`, déjà dans sprites.js) et gardien en silhouette.
- **Chemins** : pointillés d'encre comme `route()` de ecran-campagne.js (trait sombre large, pointillé clair dessus) ; les chemins empruntables depuis le nœud courant sont un peu plus clairs.
- **Bandeau de l'expédition** (sous le bandeau du jeu, hauteur fixe de 52 px) : bannières (gonfanons pleins ou grisés), or d'expédition (icône tresor), renommée (icône valider, le laurier), « Acte 2 / 3 · Semaine 7 », faveurs (médaillons de 28 px de leur conseiller avec 1 à 3 pépites de rang, infobulle), reliques (icônes de 24 px, infobulle), boutons « Armurerie », « Lever le camp ».
- **Parchemin d'acte** et **parchemin de retour** : modales du jeu (`JEU.ui.ouvrirModale`), classe `missive-boite` pour l'aspect lettre, sceau de cire du camp.

### 16.3 Les récompenses

- Choix de faveur : trois cartes d'enluminure côte à côte (portrait du conseiller en icône dans un médaillon, nom de la faveur en Cinzel, rang en ruban « rare » doré, effet en une phrase), touches 1 à 3, « Passer (+15 or) » touche 4. Même mise en page pour les reliques et les étals du marchand.
- Rien n'est chronométré ; les animations suivent la règle des 400 ms (un éclat de feuilles quand un gardien tombe, le gonfanon qui se replie quand une bannière tombe, sans clignotement ; coupées avec le réglage Animations).

### 16.4 Accessibilité et clavier

- Sur la route : flèches gauche et droite pour passer d'un nœud joignable à l'autre, haut et bas aussi (ordre du rang), Entrée pour y aller, 1 à 4 directement, Échap vers le menu (l'expédition reste en cours), A pour l'Armurerie, L pour le Livre ; `tabindex` sur les nœuds joignables, `aria-label` « Escarmouche, semaine 7, joignable » ; le focus revient sur le nœud courant après chaque fenêtre.
- Dans les nœuds : les commandes existantes (1 à 6 pour les choix, flèches, Entrée, Échap).
- Contraste : texte encre sur parchemin, jamais de texte sur la brume ; tailles 18 px pour les questions, 14 px au moins sur la carte (règle de perf.js).

### 16.5 Performance

- La route est construite une fois par changement d'état (après un nœud) : 40 nœuds et 60 chemins, moins de 5 ms ; elle n'est jamais redessinée pendant une partie (l'écran de partie remplace l'écran, comme aujourd'hui).
- Les batailles d'expédition sont les batailles d'aujourd'hui : la mesure réponse → question suivante (perf.js) ne change pas ; le mélange de l'acte se tire au début de chaque vague (deux appels à `suite`, environ 2 ms).
- Aucune image nouvelle au MVP : icônes, parchemin, nappes de brume, fond de campagne existants. Plus tard : médaillons de nœuds rendus en 3D (atelier/outils/rendu-3d) sur le modèle des bourgs.

---

## 17. Architecture du code

### 17.1 Fichiers

| Fichier | Rôle | Testé par |
|---|---|---|
| jeu/js/alea.js (nouveau) | `JEU.alea(graine)` : mulberry32 ; `JEU.alea.melanger(r, liste)`, `JEU.alea.choisir(r, liste)` | tests.js |
| jeu/js/expedition.js (nouveau, sans DOM) | état (`vide`, `completer`, `etat`), semaines ouvertes et frontière, génération (`generer`), règles (`partir`, `aller(noeudId)`, `issueBataille(bilan)`, `offrirFaveurs`, `prendreFaveur`, `acheter`, `reposer`, `perdreBanniere`, `finir`), options de bataille d'un nœud (`optionsBataille(noeud)`), renommée et Armurerie (`ARMURERIE`, `ameliorer`), FAVEURS, RELIQUES, RENCONTRES, MODIFICATEURS, textes | tests.js, simuler-bataille.js --expedition, mesurer-tirage.js --expedition |
| jeu/js/ecran-expedition.js (nouveau) | écran du menu, route SVG, bandeau, parchemins, fenêtres de récompenses, marchand, campement, rencontres, Armurerie, Livre | perf.js |
| jeu/index.html | bouton de menu `data-ecran="expedition"`, balises script (alea.js après noyau.js ; expedition.js après campagne.js et bataille.js ; ecran-expedition.js après ecran-campagne.js) | validateur (version) |
| jeu/css/jeu.css | classes `.route-expedition`, `.noeud-exp`, `.bandeau-exp`, `.carte-faveur`, `.recit-semaine` | perf.js (1366 × 768) |
| jeu/js/codex.js | onglet « Livre des expéditions » | perf.js |
| docs/FORMAT_DONNEES.md, docs/CAHIER_DES_CHARGES.md (section 5 et 6), docs/JOURNAL.md | documentation et décisions | — |

### 17.2 Points d'accroche dans l'existant (petits et testables)

1. **jeu/js/bataille.js, `lancer(lieu, exp)`** : un second paramètre facultatif. Avec `exp` : `{ carte, titre, options (celles de JEU.campagne.options complétées par l'expédition), semaine, front, defense, modificateurs: [textes de l'éclaireur], tirer: function (n, deja) → questions, fin: function (bilan) }`. La fonction prend `exp.carte` à la place de `prov.carte`, `exp.options` à la place de `C.options(niveau)`, `exp.tirer` à la place de `tirerQuestions` (qui appelle `JEU.recit.suiteMixte`), appelle `exp.fin(bilan)` à la place de `C.apresBataille`, et affiche `exp.titre` ; `surQuitter` appelle aussi `exp.fin` avec `issue: "retraite"` si `entamee`. Le bilan reçoit en plus `bonnesParFamille` (compté dans `questionSuivante`). Rien ne change sans `exp`.
2. **jeu/js/bataille-moteur.js** :
   - `options.rival` : objet fusionné sur `RIVAL[niveau]` dans `creer` (`p.regleRival = Object.assign({}, RIVAL[n], o.rival || {})` ; `rival(p)` renvoie `p.regleRival`). Les modificateurs d'élite et de gardien et la Trêve négociée passent par là. Le simulateur peut déjà essayer ces valeurs avec `--regle`.
   - `options.championChaqueVague` : dans `composerVague`, `if (w === p.vagues - 1 || p.modificateurs.championChaqueVague) file.push("champion")`.
   - `options.faveurs` (étape 2) : `{ degatsTours: 1, degatsBaliste: 1, coutTours: 1, pvTroupes: 1, vitesseTroupes: 1, coupTroupes: 1, revenu: 0, eclatDes: 3, bonusEclat: 0, rancon: 0 }`, lus respectivement dans `degatsTour`, `poserTour` et `ameliorerTour` (arrondi), `creerUnite` (camp joueur), `frapper`, `creer` (`p.revenu`), `repondre`, `blesser`. Dix lignes, chacune avec son test.
   - `options.toursDepartMoins` (Trompe de guet) : dans `rivalDepart`, `Math.max(1, r.toursDepart − n)`.
3. **jeu/js/recit.js** : `suiteMixte` (7.2) ; contextes `route`, `veillee`, `coffre` dans PHRASES ; `cadre` renvoie `semaine` (7.4).
4. **jeu/js/progression.js** : `semaineDe(coursId)` (null hors planning), `semainesOuvertes(etat)` (semaines du planning ayant au moins un cours accessible avec une question jouable), `frontiere(etat)`.
5. **jeu/js/campagne.js** : `options(niveau, extra)` accepte des compléments (`orDepart`, `pvChateau`, `bonusDegats`, `orParReponse`, `arsenalPlus`, `espion`, `orPerduErreur`) ; `missiveAvantBataille` accepte un lieu `{ gardien: frontId }` ; `apresExpedition(bilan)` pour la rivalité, la chronique, les 2 coups à la place forte et les 4 ressources.
6. **jeu/js/interface.js** : `ui.recit` affiche `r.semaine` ; rien d'autre.
7. **jeu/js/sauvegarde.js** : SCHEMA 6, migration 5 → 6, `nouvelle()` avec `expedition: JEU.expedition.vide()`.

### 17.3 Ce qui ne change pas

Le tirage (leitner.js, questions.js, rappels.js), les cartes de bataille, l'IA du rival, le conseil du royaume, les événements du jour, l'arsenal, les jauges, le domaine, le Codex (hors onglet ajouté), le validateur et ses contrôles sur les cours. Les textes nouveaux (rencontres, faveurs, reliques, modificateurs, phrases de récit) sont des textes de jeu dans le code, comme EVENEMENTS et PHRASES aujourd'hui ; le validateur peut leur appliquer le contrôle des répliques (pas de chiffre historique, pas de religion, pas de nom de personnage) en lisant `JEU.expedition.TEXTES` : à ajouter au contrôle 10 si Romain le souhaite.

---

## 18. Essais et réglage

### 18.1 tests.js (logique, Node)

Une trentaine de `verifier(…)` de plus :

- Générateur : même graine, même carte (deux appels égaux en JSON) ; graines différentes, cartes différentes ; 200 graines : contraintes 1 à 7 de la section 4.2 toutes tenues ; acte 1 sans élite ; acte 3 avec un élite ; campement au rang 3 ; au plus une embuscade par expédition ; chaque nœud a un successeur ; le gardien est joignable de tous les nœuds du rang 1 ; « Chemins de traverse » donne 4 nœuds au rang 2.
- Semaines : `semainesOuvertes` avec les cours chargés des tests ; frontière = la plus grande ; une semaine sans cours est sautée ; l'expédition a 3, 2 ou 1 acte selon ce qui reste ; le dernier acte à la frontière a le gardien de la frontière (4 vagues).
- Règles : `aller` refuse un nœud non joignable ; une retraite retire une bannière ; un gardien qui tient retire une bannière et garde ses coups ; bannières à zéro → `enCours` fermé, renommée des nœuds créditée, +5 ; second souffle une seule fois ; une faveur reprise monte d'un rang (3 au plus) ; l'or d'expédition ne descend jamais sous zéro ; renommée jamais en baisse sur 1 000 actions tirées au hasard ; camp S+1 ouvert quand le gardien de S tombe ; prime « semaine franchie » une seule fois.
- Options de bataille : niveau, vagues, pvRival par nœud et par acte conformes à 6.2 ; `options.rival` fusionne ; `championChaqueVague` ajoute un champion à chaque vague ; faveurs O reportées dans les options ; `toursDepartMoins` ne descend pas sous une tour.
- Mélange : `suiteMixte(3, …, 7)` donne 2 questions de la semaine 7 (ou compagnons) et 1 autre quand la semaine 7 a des questions ; se relâche sans bloquer quand elle n'en a pas ; les rappels dus gardent leur place.
- Sauvegarde : migration 5 → 6 ajoute `expedition` sans rien retirer ; schéma 1 → 6 ; `completer` répare une expédition abîmée en créditant la renommée ; export puis import gardent l'expédition en cours.

### 18.2 perf.js (bout en bout, Playwright)

- Ouvrir « Expédition », partir (front de l'ouest, camp S1), carte entière visible en 1366 × 768 (acte en cours sans défilement vertical de la page ; défilement horizontal seulement dans le cadre de la route), noms de 14 px au moins, deux nœuds joignables au clavier (flèche droite, Entrée).
- Jouer une escarmouche : mesure réponse → question suivante inchangée (moins de 100 ms, Event Timing) ; étiquette de semaine présente sur chaque question ; l'éclaireur dit la semaine.
- Quitter pendant la préparation (aucune bannière perdue), recharger la page : « Reprendre » revient au même nœud joignable ; quitter après une vague : une bannière de moins.
- Choisir une faveur au clavier (touche 2) ; le bandeau la montre ; le marchand refuse un achat sans or (bouton désactivé, accord du texte).
- Une expédition menée au bout en mode essai (hook de test : `JEU.expedition.essai = true` qui met les camps adverses à 1 point) : parchemin de fin, renommée, camp S4 ouvert, Livre rempli.

### 18.3 simuler-bataille.js `--expedition`

Nouvelle option : joue des expéditions entières sous Node avec le vrai moteur et le vrai générateur.

```
node atelier/outils/simuler-bataille.js --expedition --graines 80 --p 0.6,0.7,0.8,0.9 --armurerie 0,150,400 --chemin tranquille,mixte,guerrier
```

- Pour chaque graine : `JEU.expedition.generer`, puis le joueur scripté suit la politique de chemin (tranquille : jamais d'élite, repos au campement ; mixte : un nœud sur deux au hasard ; guerrier : toujours la bataille la plus dure, veillée au campement), répond juste avec la probabilité p (les rencontres et coffres comptent leurs bonnes réponses), joue chaque bataille avec `jouerBataille(carteId, optionsBataille(noeud), p, graine, "equilibre")` (arsenal PROGRESSION du niveau du nœud, faveurs O appliquées, faveurs E ignorées au MVP), prend les faveurs dans l'ordre de leur valeur estimée.
- Sorties par p, par armurerie et par chemin : expéditions accomplies (%), acte atteint (répartition), bannières perdues (moyenne), assauts par gardien (moyenne, le pire), victoires par type de nœud (%), durée estimée (15 s par question, 10 s par erreur, 30 s par préparation, 60 s par vague, 60 s par nœud sans bataille), renommée par expédition, or gagné et dépensé.
- Cibles de réglage (valeurs de 6.2 ajustées jusqu'à les tenir) :

| p | Armurerie 0 : accomplies | 1er gardien passé | Armurerie 150 : accomplies | Durée mixte |
|---|---|---|---|---|
| 0,6 | 25 à 40 % | ≥ 80 % | 45 à 60 % | ≤ 45 min |
| 0,7 | 55 à 65 % | ≥ 90 % | 75 à 85 % | ≤ 42 min |
| 0,8 | 70 à 80 % | ≥ 95 % | 85 à 95 % | ≤ 40 min |
| 0,9 | ≥ 90 % | ≥ 98 % | ≥ 95 % | ≤ 38 min |

Et par nœud à p = 0,7 : escarmouche gagnée 55 à 65 % (tenu sinon), bataille 50 à 60 %, élite battu 45 à 55 %, embuscade tenue ≥ 80 %, gardien du premier assaut 55 à 65 % et en deux assauts ≥ 90 %, frontière en deux assauts ≥ 80 %. Comme pour la campagne, tout compte par seuils (flèches, coups) : vérifier chaque changement de pvRival ou de modificateur au simulateur, 80 graines au moins, et noter les tableaux au journal.

### 18.4 mesurer-tirage.js `--expedition`

- Joue une expédition type (acte 1 : rencontre, escarmouche, veillée, gardien ; actes 2 et 3 de même) avec le mélange de l'acte, 16 élèves simulés (les trois profils existants), six séances de suite.
- Mesures : part des questions dont le cours est de la semaine de l'acte (cible 55 à 70 %, compagnons de route comptés à part), parts des familles sur l'expédition (chacune entre 12 et 28 %), part des fiches à revoir (au moins celle de la campagne), questions reposées à moins de 60 (0 hors Seconde chance), même notion en 10 questions (0), niveau moyen posé face au conseillé (écart ≤ 0,2), durée des tirages (médiane < 5 ms).
- Cas limite à mesurer : une semaine à un seul cours (S7 aujourd'hui) : le mélange se relâche et l'équilibre tient sur l'expédition entière.

---

## 19. Plan de réalisation

Chaque étape finit par le validateur, tests.js, perf.js, une ligne au journal et le numéro de version.

### Étape 0 : préparatifs (une demi-journée)

- jeu/js/alea.js ; `semaineDe`, `semainesOuvertes`, `frontiere` dans progression.js ; `cadre.semaine` et `.recit-semaine` (en accord avec la tâche « semaine visible dans les questions » : s'ils l'ont déjà fait, reprendre leur champ) ; `suiteMixte` ; schéma 6 avec `expedition` vide et `completer` ; docs/FORMAT_DONNEES.md.

### Étape 1 : MVP « la route » (deux à trois jours) : version 0.9.0

- expedition.js : génération, état, départ (front de l'ouest seulement), nœuds **escarmouche, bataille, rencontre (4 cartes), coffre, campement (repos et veillée), gardien, gardien de la frontière** ; bannières, or d'expédition, renommée ; fin et retour ; camps de base ; 6 faveurs O (Mémoire des sièges, Chronique fidèle, Remparts de terre, Flèches trempées, Engins de siège, Baume) ; Armurerie à 4 crans (gonfanon, bourse, faveur de départ, second souffle).
- bataille.js `lancer(lieu, exp)` ; moteur `options.rival`, `championChaqueVague` ; modificateurs Porte de fer, Volée d'archers, Trésor de guerre.
- ecran-expedition.js : départ, route SVG, bandeau, parchemins d'acte et de retour, choix de faveur, campement, coffre, rencontres ; clavier complet.
- Essais : tests.js (générateur, règles, migration), perf.js (parcours), simuler-bataille `--expedition` (chemin mixte, armurerie 0) pour fixer pvRival ; mesurer-tirage `--expedition`.
- Pour Romain, cinq vérifications : la route s'ouvre et se lit en 1366 × 768 ; une escarmouche pose deux questions de la semaine sur trois (ruban) ; quitter et reprendre ; perdre volontairement une bataille ne retire rien au domaine ; battre le gardien de S1 ouvre le camp S2.

### Étape 2 : profondeur (deux à trois jours) : version 0.10.0

- Élites et embuscades, 6 modificateurs, marchand et forge, les 12 reliques, les 24 faveurs (accroches `options.faveurs` du moteur), 10 rencontres, front du sud, Chemins de traverse, Éclaireurs, Forge réputée, Mémoire du chroniqueur.
- Simulateur complet (trois chemins, trois niveaux d'Armurerie), réglage final des solidités et des modificateurs, tableaux au journal.

### Étape 3 : récit et liens (un à deux jours) : version 0.10.x

- Missives (souverain au départ, défi du rival avant un gardien, lettre au retour), rivalité, chronique, 2 coups à la place forte, 4 ressources ; Livre des expéditions dans le Codex ; répliques propres aux expéditions dans personnages.js si Romain le veut (validateur inchangé).

### Étape 4 : extensions (à la demande)

- Vitesse ×1,5 par défaut si les expéditions sont trop longues ; « Défi de la semaine » (graine fixe) ; « Serments » (modificateurs choisis au départ, à la manière du Pacte du châtiment d'Hadès : « gardiens à 4 vagues », « deux bannières seulement », « sans campement », chacun +20 % de renommée, jamais plus durs sur les questions) ; médaillons de nœuds rendus en 3D ; musique « route » (troisième humeur de musique.js) ; un boss de fin d'ère quand les ères d'histoire seront sur la carte (cahier, jalon 2).

---

## 20. Décisions à noter au journal, points à valider par Romain

Décisions proposées (rubrique Décisions de docs/JOURNAL.md, à la livraison) :

1. Une expédition = trois actes = trois semaines ouvertes consécutives ; la frontière = la plus grande semaine ouverte ; les camps de base s'ouvrent gardien par gardien.
2. Deux tiers des questions d'un acte viennent de sa semaine (compagnons de route compris), un tiers du tirage ordinaire ; l'équilibre des familles se mesure sur l'expédition entière.
3. Les bannières ne tombent que sur une issue de bataille ; rien de permanent ne se perd ; la renommée ne baisse jamais.
4. Les camps adverses des expéditions sont petits (4 à 12) parce que chaque nœud se joue en un passage ; les gardiens gardent leurs coups.
5. Les textes des expéditions sont des textes de jeu, sans fait de cours, soumis aux mêmes interdits que les répliques des personnages.
6. Schéma de sauvegarde 6 ; la carte générée est enregistrée, jamais regénérée.

À valider par Romain :

- Le nom (« Expédition » ou autre) et le mot « bannières » pour le moral.
- Trois actes par expédition (30 à 45 minutes, deux séances) plutôt que deux (20 à 30 minutes, une séance).
- Le choix du front au départ (plutôt qu'une alternance imposée).
- Les taux visés (55 à 65 % d'expéditions accomplies à 7 sur 10 sans amélioration) : plus dur ou plus facile ?
- La vitesse des vagues ×1,5 par défaut dans les expéditions.
- Les deux retours vers la campagne (2 coups à la place forte, 4 ressources par gardien) : les garder, ou laisser les expéditions tout à fait à part.

---

## 21. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| Expéditions trop longues pour une séance | Reprise à tout moment ; vitesse ×1,5 ; gardiens à 2 vagues en réserve ; durée estimée par le simulateur et affichée au départ (« environ 35 minutes, reprise possible à chaque étape »). |
| Une semaine presque vide (un seul cours) donne des questions répétitives | Le mélange se relâche de lui-même (completer) ; anti-répétition inchangée ; mesure 18.4. |
| Le moral tombe trop vite pour un élève à 6 sur 10 | Cibles 18.3 (≥ 80 % passent le premier gardien) ; campement garanti ; second souffle ; renommée gagnée quoi qu'il arrive. |
| Faveurs trop fortes qui rendent les gardiens triviaux | Faveurs E livrées après mesure ; plafond de trois rangs ; le simulateur joue avec et sans. |
| Collision avec les tâches en cours (personnages, semaine visible, cours S4 à S8) | Points d'accroche minces et facultatifs (`exp`, `options.rival`, `cadre.semaine`) ; cette conception ne touche ni personnages.js ni les cours. |
| Une carte générée invalide (bogue) | Contraintes vérifiées à la génération, régénération avec graine + 1 jusqu'à 20 fois, puis carte de secours fixe ; tests sur 200 graines. |
| Textes de route qui glissent vers du contenu de cours | Règle écrite (section 1), relecture dans /relecture, contrôle 10 étendu si souhaité. |
| Sauvegarde abîmée en cours d'expédition | `completer` ferme proprement en créditant la renommée ; copie `jeu5e-avant-import` déjà prévue à l'import. |
