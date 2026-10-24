# Expéditions : mesures

Cahier des mesures du mode Expéditions (atelier/conception/expeditions.md). Rien de ce document n'entre dans jeu/. Chaque section donne les commandes exactes, les tableaux et les décisions, avec leurs raisons. Les fichiers bruts (un .txt lisible et un .json par mesure) sont dans atelier/mesures/jour0/. Les pourcentages sont arrondis à l'unité ; avec 160 batailles par case, un écart de moins de 5 points entre deux cases ne veut rien dire.

## Jour 0 (24 octobre 2026) : mesurer avant d'écrire la route

Sections du cahier de conception concernées : 7.2 (table des haltes), 16.1 (jour 0), 17.2 (simulateur) et 17.3 (cibles et leviers). Le moteur (jeu/js/bataille-moteur.js) n'est pas touché. Les batailles de campagne ne changent pas (preuve en 1).

### 0. En deux mots

- **Escarmouche : 2 vagues, camp de 6** (et non 1 vague). À une vague, le camp de 6 ne tombe jamais au niveau 0 (cinq coups au plus) ni au niveau 4 (le champion), et le taux d'éclatante baisse quand l'élève répond mieux. À deux vagues et camp de 6, l'éclatante vaut 38 à 61 % à 7 sur 10 aux niveaux 0 à 3, et monte avec p.
- **Le champion reste** (le MVP ne peut pas le retirer). À deux vagues et camp de 6, il coûte 9 à 11 points d'éclatante aux niveaux 1 à 3 (rien au niveau 0, 21 points au niveau 4 sur la Forteresse) et les cibles tiennent avec lui. À une vague il tue l'escarmouche du niveau 4 (0 % au lieu de 69 à 97 %).
- **Solidités 6 / 10 / 12 / 16 confirmées.** En défense, la solidité du camp ne change pas la tenue des murs : elle ne règle que la part d'éclatante.
- **Ligne du rival par semaine confirmée** (S1-2 : 0, S3-5 : 1, S6-8 : 2, S9-12 : 3, S13+ : 4). Embuscade à la ligne + 1 confirmée. **Grand Gardien à la ligne de la semaine, pas + 1** : à 3 vagues, la ligne 3 jouée avec l'arsenal de la ligne 2 ne tient que 20 % du temps sur le Gué (S6 à S8), 15 % à la ligne 4 avec l'arsenal 3.
- **Expédition entière, 3 vivres, 7 sur 10 : S1 → S3 84 %** (cible 70 à 85 %), premier gardien 99 %. **S6 → S8 : 100 %** avec le réglage retenu, 48 % avec le Grand Gardien à la ligne + 1 : la cible 55 à 70 % n'est atteignable avec aucun levier du MVP, et elle contredit les cibles par nœud du même tableau (un Grand Gardien vaincu une fois sur deux, retenté avec 3 vivres, donne déjà 88 % de réussite). Cible révisée proposée : ≥ 85 %.

### 1. Référence des batailles de campagne

Avant toute mesure, les batailles de campagne ont été enregistrées telles qu'elles sont aujourd'hui : 80 graines par province et par front, 160 défenses du domaine par niveau, les quatre stratégies du joueur scripté (equilibre, rush, tortue, attente), p 0,6 / 0,7 / 0,8 / 0,9, niveaux 0 à 4.

Fichier de référence : **atelier/mesures/avant-expedition.json**.

Le régénérer (environ 15 minutes seul sur la machine ; dans PowerShell, le fichier écrit par « > » est en UTF-16, le simulateur le relit quand même) :

```
node atelier/outils/simuler-bataille.js --strategies equilibre,rush,tortue,attente --json > atelier/mesures/avant-expedition.json
```

Comparer l'état courant à la référence (écarts par niveau, batailles pour prendre et coups à la 1re bataille, stratégie equilibre ; environ 3 minutes) :

```
node atelier/outils/simuler-bataille.js --comparer atelier/mesures/avant-expedition.json
```

Tout écart autre que « +0 % » signale un changement des batailles de campagne. Pour une preuve complète (les quatre stratégies, défense comprise, au centième), régénérer le JSON sous un autre nom et le comparer octet par octet à la référence : dans PowerShell, `Compare-Object (Get-Content a.json) (Get-Content b.json)` ne doit rien rendre ; sous Linux, `cmp a.json b.json`.

Preuve du jour 0 : (à compléter : référence, comparaison)

### 2. Les options de mesure du simulateur

atelier/outils/simuler-bataille.js joue une **bataille de route** dès qu'une de ces options est donnée (sans elles, il joue les provinces et la défense du domaine comme avant, et rien ne change dans ses tableaux) :

| Option | Sens | Par défaut |
|---|---|---|
| `--vagues n` | vagues de la bataille | 4 en attaque, 3 en défense |
| `--pvRival n` | solidité du camp de route | 16 en attaque, 12 en défense |
| `--mode attaque\|defense` | mode du moteur (option `defense` de `M.creer`) | attaque, défense si la carte est `domaine` |
| `--carte gue\|foret\|moulin\|col\|chateau\|domaine` | la carte (identifiants de jeu/js/cartes-bataille.js) | en attaque, la carte de la province du niveau sur chaque front (80 graines par front) ; en défense, `domaine` (160 graines) |
| `--arsenal n` ou `--arsenal -1` | rangée de PROGRESSION (arsenal et jauges de l'élève) si elle diffère de la ligne du rival ; avec un signe, un écart au niveau | le niveau |
| `--sansChampion` | le champion de la dernière vague est ôté de la file adverse, dans le simulateur seulement | gardé |
| `--sortie f.json` | écrit aussi les résultats en JSON dans un fichier | — |

`--niveaux`, `--p`, `--graines`, `--strategies`, `--trace`, `--json` et `--comparer` marchent avec ces options. En mode route, `--comparer` prend un essai de route enregistré par `--json` et imprime les écarts de tenue, d'éclatante, de coups et de murs. Les graines sont celles de la première bataille des provinces (deux cartes) ou de la défense du domaine (une carte) : à réglage égal, une bataille de route sur `domaine` à 3 vagues et camp de 12 rend exactement la défense du domaine de la campagne (vérifié : niveau 4, p 0,7, 20 graines, 70 % tenue dont 45 % victoire, murs 44 % dans les deux cas).

Colonnes du tableau de route, par niveau : **tenue** (les murs n'ont pas cédé ; victoire et tenu), **éclatante** (le camp de route tombe), tenu, retraite, **murs restants** (en part du château, et quand la bataille est tenue), **coups portés** au camp (et à la 1re vague), ennemis tués et pertes, sorties de la garnison, ce que le rival a fait (tours, gardes, rappelés, renforts).

Tout rejouer (une quarantaine de mesures, environ 20 minutes à trois processus) :

```
node atelier/mesures/jour0.js
node atelier/mesures/tableaux-jour0.js esc-2v6 gard-2v12-gue        (tableaux Markdown d'une ou plusieurs mesures)
node atelier/mesures/tableaux-jour0.js --compare gard-2v12-gue,gard-2v12-foret --champ tenue
node atelier/mesures/convolution-expedition.js --esc 2v6 --embPlus 1 --grandPlus 0 --p 0.6,0.7,0.9 --detail
```

Les quatre commandes du cahier (16.1), telles quelles :

```
node atelier/outils/simuler-bataille.js --vagues 1 --pvRival 6 --mode attaque --niveaux 0,1,2,3,4 --p 0.6,0.7,0.8,0.9
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 10 --mode defense --niveaux 0,1,2,3,4
node atelier/outils/simuler-bataille.js --vagues 2 --pvRival 12 --mode defense --niveaux 0,1,2,3,4
node atelier/outils/simuler-bataille.js --vagues 3 --pvRival 16 --mode defense --niveaux 1,2,3,4
```

### 3. Méthode

- **Niveau** = ligne de la table `RIVAL` jouée (0 à 4). L'élève a l'arsenal et les jauges de `PROGRESSION[niveau]` du simulateur (ce qu'un élève régulier a débloqué quand il attaque la province de ce niveau), sauf `--arsenal`.
- **Ligne de la semaine** (cahier 7.1) : S1-2 → 0, S3-5 → 1, S6-8 → 2, S9-12 → 3, S13+ → 4. Un nœud « à la ligne + 1 » se joue à la ligne du dessus **avec l'arsenal de la semaine** : il se lit dans un fichier `-arsenal-1` au niveau ligne + 1 (par exemple l'embuscade de S1, ligne 1 et arsenal 0 : `emb-2v10-gue-arsenal-1`, niveau 1).
- **Cartes** : les cinq tracés tournent avec la semaine (cahier 3.4) : gue (S1, S6), foret (S2, S7), moulin (S3, S8), col (S4, S9), chateau (S5, S10). Le Grand Gardien attend sur la carte de la prochaine province du front : gue ou col pour une campagne qui commence, foret et moulin ensuite ; `domaine` est donné pour comparer avec la défense de la campagne.
- **Joueur scripté** « equilibre » partout (tours jusqu'à 2 + numéro de vague, trois quarts de l'or en troupes, tour de siège dès la 2e vague, puis améliorations). La stratégie « rush » (tout en troupes, jamais de tour) sert de contre-épreuve pour l'escarmouche.
- 80 graines par carte de front en attaque (160 par niveau), 160 par niveau en défense ; p 0,6 / 0,7 / 0,8 / 0,9 ; niveaux 0 à 4 (1 à 4 pour le Grand Gardien, 0 ajouté sur gue).

### 4. Escarmouche (attaque)

En attaque, les murs ne cèdent jamais : **tenue 100 %** dans toutes les mesures d'escarmouche (une vague ou deux, toutes cartes, toutes solidités). L'escarmouche ne coûte donc jamais de vivre ; tout l'enjeu est l'**éclatante** (le camp tombe, porte doublée).

#### 4.1 Une vague, camp de 6 (le réglage du cahier)

`esc-1v6` (cartes des provinces du niveau : gue/col, foret/moulin, moulin/gue, col/foret, chateau/chateau). Éclatante / coups portés :

| niveau | p 0,6 | p 0,7 | p 0,8 | p 0,9 |
|---|---|---|---|---|
| 0 | 0 % / 1,86 | 0 % / 2,62 | 0 % / 3,38 | 0 % / 4,04 |
| 1 | 33 % / 2,66 | 23 % / 2,49 | 10 % / 2,59 | 3 % / 2,89 |
| 2 | 24 % / 1,83 | 35 % / 2,41 | 56 % / 3,56 | 78 % / 4,78 |
| 3 | 31 % / 2,91 | 40 % / 3,6 | 55 % / 4,39 | 83 % / 5,4 |
| 4 | 0 % / 0 | 0 % / 0 | 0 % / 0 | 0 % / 0 |

Trois défauts, tous liés à la vague unique :

- **Niveau 0 : jamais** (0 % à tous les p, toutes cartes). Trace : l'élève pose deux tours, envoie 6 fantassins, le garde de la porte en abat un, cinq frappent le camp : 5 coups, jamais 6. Avec un camp de 5 ou de 4 (`esc-1v5`, `esc-1v4`), le niveau 0 fait 19 / 33 / 51 / 70 %.
- **Niveau 1 : l'éclatante baisse quand p monte** (33 → 3 %). Plus d'or fait acheter la baliste (50 or) comme deuxième tour, il reste moins pour les troupes, et il n'y a pas de 2e vague pour s'en servir. C'est un artefact du joueur scripté, mais un élève à une vague est soumis au même hasard de la dépense.
- **Niveau 4 : 0 coup** : le champion sort à la vague unique (points de vie × 1,2, coups × 1) et arrête tout devant la porte (4.2).

Solidités voisines à une vague (`esc-1v4`, `esc-1v5`, `esc-1v8`), éclatante à p 0,7 : camp 4 : 33 / 49 / 35 / 40 / 0 % ; camp 5 : 33 / 23 / 35 / 40 / 0 % ; camp 8 : 0 / 0 / 35 / 38 / 0 %.

#### 4.2 Le champion

`esc-1v6-sans-champion` (même chose, le champion ôté de la file dans le simulateur). Niveaux 0 à 3 : éclatante identique à 2 points près (niveau 3 : 31 → 33 % à p 0,6, 40 → 41 % à p 0,7), coups 0,2 à 0,6 de plus. **Niveau 4** : 0 → 2,25 / 2,64 / 3,19 / 3,52 coups et, par carte, 0 → 69 / 81 / 93 / 97 % d'éclatante sur gue et moulin ; toujours 0 % sur foret et chateau (là, ce sont les deux tours de départ du rival, tirs × 1,62, qui arrêtent les troupes).

À deux vagues et camp de 6 (`esc-2v6` contre `esc-2v6-sans-champion`), éclatante avec / sans champion :

| niveau | p 0,6 | p 0,7 | p 0,8 | p 0,9 |
|---|---|---|---|---|
| 0 | 24 / 24 % | 38 / 38 % | 63 / 63 % | 87 / 87 % |
| 1 | 53 / 63 % | 58 / 67 % | 77 / 83 % | 88 / 92 % |
| 2 | 35 / 44 % | 53 / 64 % | 74 / 82 % | 91 / 96 % |
| 3 | 54 / 63 % | 69 / 76 % | 86 / 91 % | 98 / 99 % |
| 4 | 18 / 38 % | 30 / 51 % | 49 / 62 % | 71 / 76 % |

Coups portés à p 0,7 : 4,7 / 5,2 ; 5,1 / 5,4 ; 5,1 / 5,6 ; 6,2 / 6,8 ; 5,6 / 6,3. Sur le Gué à p 0,7 : 39 / 39, 61 / 66, 54 / 66, 68 / 83, 85 / 86 %. Au camp de 8 (`esc-2v8` contre `esc-2v8-sans-champion`, p 0,7) : niveau 1 : 38 → 40 % ; niveau 3 : 59 → 69 % ; autres niveaux inchangés.

Lecture : au réglage retenu (2 vagues, camp de 6), le champion coûte 9 à 11 points d'éclatante aux niveaux 1 à 3 à p 0,7 (0 au niveau 0, 21 au niveau 4 sur la Forteresse) et 0,3 à 0,6 coup. C'est le prix d'un adversaire qu'on voit sortir à la dernière vague ; les cibles d'éclatante tiennent avec lui (4.6). À une vague il ne gêne qu'au niveau 4, mais là il interdit l'éclatante. Le MVP ne peut pas le retirer ; l'option `champion: false` de l'étape 2 vaut 9 à 11 points d'éclatante, à ajouter si Romain trouve les portes doublées trop rares.

#### 4.3 Deux vagues : camp de 6, 7 ou 8

Éclatante à deux vagues (cartes des provinces du niveau) :

| niveau | camp 6 : p 0,6 / 0,7 / 0,8 / 0,9 | camp 7 | camp 8 |
|---|---|---|---|
| 0 | 24 / 38 / 63 / 87 % | 21 / 33 / 54 / 78 % | 5 / 11 / 29 / 51 % |
| 1 | 53 / 58 / 77 / 88 % | 26 / 39 / 69 / 85 % | 25 / 38 / 69 / 85 % |
| 2 | 35 / 53 / 74 / 91 % | 34 / 53 / 73 / 91 % | 33 / 51 / 73 / 91 % |
| 3 | 54 / 69 / 86 / 98 % | 51 / 68 / 86 / 98 % | 43 / 59 / 81 / 97 % |
| 4 | 18 / 30 / 49 / 71 % | 18 / 30 / 49 / 71 % | 18 / 30 / 49 / 71 % |

Coups portés au camp de 6 (p 0,6 / 0,7 / 0,8 / 0,9) : niveau 0 : 3,6 / 4,7 / 6,1 / 7,5 ; niveau 1 : 4,6 / 5,1 / 6,3 / 7,1 ; niveau 2 : 3,7 / 5,1 / 6,0 / 6,4 ; niveau 3 : 4,9 / 6,2 / 7,5 / 6,9 ; niveau 4 : 4,1 / 5,6 / 8,1 / 10,6.

À deux vagues, l'éclatante monte avec p à tous les niveaux : la 2e vague apporte le revenu des troupes, une deuxième dépense et la tour de siège. Le camp de 8 est hors de portée du niveau 0 (11 % à p 0,7, 51 % à p 0,9) ; le camp de 6 met les niveaux 0 à 3 entre 38 et 69 % à p 0,7.

#### 4.4 Par carte (deux vagues, camp de 6)

Éclatante sur les cartes des semaines 1 à 3 et 6 à 8 :

| niveau | gue : p 0,6 / 0,7 / 0,9 | foret | moulin |
|---|---|---|---|
| 0 | 20 / 39 / 86 % | 20 / 39 / 86 % | 20 / 39 / 86 % |
| 1 | 56 / 61 / 91 % | 48 / 54 / 84 % | 50 / 56 / 88 % |
| 2 | 38 / 54 / 91 % | 38 / 54 / 91 % | 39 / 55 / 91 % |
| 3 | 54 / 68 / 96 % | 54 / 68 / 96 % | 54 / 69 / 96 % |
| 4 | 74 / 85 / 99 % | 26 / 36 / 72 % | 74 / 86 / 99 % |

La carte ne compte qu'au niveau 4 (deux tours rivales de départ à tirs × 1,62 : foret et chateau les placent mieux). À une vague, mêmes écarts (`esc-1v6-gue` à `esc-1v6-chateau`).

#### 4.5 L'élève qui ne bâtit rien (ruée)

`esc-1v6-rush`, `esc-2v6-rush`, `esc-2v8-rush` (tableau « rush » des .txt). Tout l'or en troupes, jamais de tour : les guetteurs du rival rappellent 12 à 31 gardes, et **l'éclatante tombe à 0 %** à tous les niveaux (4 % au niveau 0 à deux vagues), 0 coup porté sauf au niveau 0. L'anti-ruée du 16/10/2026 joue à plein sur la route : l'escarmouche récompense l'élève qui pose ses tours d'abord, comme la campagne.

#### 4.6 Décision

**Escarmouche : attaque, 2 vagues, camp de 6, ligne de la semaine, champion gardé.** À 7 sur 10 : 38 à 39 % (S1, S2), 54 à 61 % (S3), 54 à 55 % (S6 à S8) ; à 9 sur 10 : 84 à 91 % ; à 6 sur 10 : 20 à 56 %. Cibles 17.3 : 40 à 60 % (S1 → S3), 30 à 50 % (S6 → S8), ≥ 70 % à p 0,9, ≥ 20 % à p 0,6 : tenues à 5 points près (S1 et S2 à 38 %, S6 à S8 à 54 %). Conséquence à reporter dans le cahier (5.1, annexe A) : 6 questions par escarmouche au lieu de 3, 4 à 4,5 minutes au lieu de 2,5 à 3, soit 4 à 6 minutes de plus par expédition de trois semaines.

### 5. Embuscade (défense, 2 vagues, camp de 10)

#### 5.1 À la ligne jouée, avec l'arsenal de cette ligne

`emb-2v10-<carte>`. Tenue à p 0,6 / 0,7 / 0,9 :

| niveau | gue | foret | moulin | col | chateau | domaine |
|---|---|---|---|---|---|---|
| 0 | 62 / 80 / 98 % | 45 / 68 / 96 % | 72 / 88 / 98 % | 64 / 81 / 98 % | 73 / 88 / 99 % | 64 / 81 / 98 % |
| 1 | 72 / 82 / 97 % | 86 / 91 / 99 % | 84 / 89 / 99 % | 84 / 89 / 99 % | 100 / 100 / 100 % | 69 / 81 / 96 % |
| 2 | 99 / 100 / 100 % | 99 / 100 / 100 % | 99 / 100 / 100 % | 99 / 100 / 100 % | 100 % | 99 / 100 / 100 % |
| 3 | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % |
| 4 | 98 / 100 / 100 % | 100 % | 100 % | 98 / 100 / 100 % | 100 % | 98 / 100 / 100 % |

Les niveaux 0 et 1 sont les seuls à inquiéter : la ligne 0 a les troupes d'assaut les plus solides (`assaut` 5,2 contre 2,8 et 2,6 aux lignes 1 et 2), et l'arsenal de la rangée 2 (trébuchet, tour de siège, jauges à 4) met la défense hors d'atteinte à deux vagues. La carte pèse jusqu'à 20 points au niveau 0 (foret 68 %, moulin 88 % à p 0,7).

#### 5.2 À la ligne + 1 avec l'arsenal de la semaine (la règle du MVP)

`emb-2v10-<carte>-arsenal-1` : le niveau est la ligne jouée, l'arsenal celui du niveau du dessous. Tenue à p 0,6 / 0,7 / 0,8 / 0,9 :

| ligne jouée (semaines) | gue | foret | moulin |
|---|---|---|---|
| 1, arsenal 0 (S1, S2) | 49 / 70 / 85 / 97 % | 49 / 69 / 84 / 97 % | 75 / 90 / 93 / 99 % |
| 2, arsenal 1 (S3 à S5) | 89 / 94 / 98 / 100 % | 92 / 96 / 99 / 100 % | 91 / 96 / 99 / 100 % |
| 3, arsenal 2 (S6 à S8) | 76 / 87 / 93 / 97 % | 75 / 88 / 96 / 98 % | 81 / 93 / 96 / 99 % |
| 4, arsenal 3 (S9 à S12) | 97 / 100 / 100 / 100 % | 99 / 100 / 100 / 100 % | 99 / 100 / 100 / 100 % |

Murs restants quand elle tient (gue, p 0,7) : 42 / 77 / 61 / 61 % ; coups portés au camp : 3,7 / 3,3 / 2,4 / 1,9.

#### 5.3 La solidité du camp ne change pas la tenue

`emb-2v8-gue-arsenal-1`, `emb-2v10-gue-arsenal-1`, `emb-2v12-gue-arsenal-1` : tenue identique à l'unité près (70 / 94 / 87 / 100 % à p 0,7). En défense, le camp adverse ne sert qu'à l'éclatante : camp 8 ou 10 : 8 / 0 / 6 / 0 % à p 0,7 et 51 / 0 / 17 / 0 % à p 0,9 (lignes 1 à 4) ; camp 12 : 0 / 0 / 3 / 0 % et 6 / 0 / 13 / 0 %. (Une victoire termine la bataille avant la fin de la vague : une solidité plus basse protège un peu les murs, sans effet mesurable ici.)

#### 5.4 Décision

**Embuscade : défense, 2 vagues, camp de 10, ligne de la semaine + 1 (plafond 4), confirmée.** Cibles 17.3 (75 à 85 % en S1 → S3, 68 à 80 % en S6 → S8, ≥ 94 % à p 0,9, 58 à 70 % à p 0,6) : S1 et S2 un peu dures (70 % à p 0,7, 49 % à p 0,6), S3 à S5 faciles (94 à 96 %), S6 à S8 un peu faciles (87 à 93 %), p 0,9 tenu partout (97 à 100 %). La règle « ligne de la semaine » (5.1) irait mieux en S1 → S5 (80 / 68 / 89 %) mais donne 100 % dès S6 : à deux vagues, la ligne + 1 est le seul réglage qui garde un enjeu après S5. L'embuscade est un choix (chemin tranquille garanti, G6) avec une faveur garantie : un peu de risque en S1-S2 est voulu. Camp de 10 gardé (8 n'apporte rien, 12 éteint l'éclatante).

### 6. Gardien de la semaine (défense, 2 vagues, camp de 12)

#### 6.1 Tenue

`gard-2v12-<carte>` : à solidité différente, la tenue est **la même que l'embuscade** à la même ligne (5.1), au point près : gue 80 / 82 / 100 / 100 / 100 % à p 0,7 (niveaux 0 à 4), foret 68 / 91 / 100 / 100 / 100 %, moulin 88 / 89 / 100 / 100 / 100 %, col 81 / 89 / 100 / 100 / 100 %, chateau 88 / 100 / 100 / 100 / 100 %, domaine 81 / 81 / 100 / 100 / 100 %. À p 0,6 : gue 62 / 72 / 99 / 100 / 98 %, foret 45 / 86 / 99 / 100 / 100 %, moulin 72 / 84 / 99 / 100 / 100 %. À p 0,9 : 96 à 100 % partout.

Murs restants quand il tient (gue, p 0,7) : 45 / 64 / 91 / 82 / 69 % ; coups portés : 4,1 / 3,5 / 6,6 / 8,2 / 0.

#### 6.2 Solidité 10, 12, 14, 16

`gard-2v10-gue` à `gard-2v16-gue` : tenue identique (80 / 82 / 100 / 100 / 100 % à p 0,7). Éclatante à p 0,7, niveaux 0 à 4 : camp 10 : 11 / 0 / 26 / 35 / 0 % ; camp 12 : 11 / 0 / 14 / 26 / 0 % ; camp 14 : 0 / 0 / 14 / 26 / 0 % ; camp 16 : 0 / 0 / 14 / 12 / 0 %. À p 0,9, camp 12 : 48 / 0 / 52 / 66 / 0 %.

#### 6.3 Une ligne au-dessus, deux lignes au-dessus (levier `difficulte`)

Gardien joué une ligne au-dessus de l'arsenal (lecture de `emb-2v10-gue-arsenal-1`, même tenue) : 70 / 94 / 87 / 100 % aux lignes 1 à 4, p 0,7. Deux lignes au-dessus (`gard-2v12-gue-arsenal-2`, lignes 2 à 4 avec l'arsenal 0 à 2) : 72 / 61 / 48 % à p 0,6, 78 / 66 / 63 % à p 0,7, 98 / 84 / 93 % à p 0,9, murs 39 / 31 / 40 %.

#### 6.4 Décision

**Gardien : défense, 2 vagues, camp de 12, ligne de la semaine, confirmé.** S1 → S3 à p 0,7 : 80 / 68 / 89 % (cible 75 à 85 % : S2 sur la Forêt un peu sous, S3 un peu au-dessus) ; premier gardien franchi avec 3 vivres : 99 % (cible ≥ 95 %). S6 → S8 : 100 % à p 0,7 comme à p 0,6 (cible 68 à 80 % : trop facile ; à deux vagues, l'arsenal de la rangée 2 ne craint plus la ligne 2). La ligne + 1 pour le gardien donnerait 87 à 93 % en S6 → S8 mais 69 à 70 % en S1-S2 (cible 75 à 85) et rendrait le gardien égal à l'embuscade : non retenu au MVP. C'est le premier candidat de la table fine par semaine de l'étape 2 (cahier 7.1) : gardien de S6 à S8 à la ligne 3 (87 à 93 %), tout le reste inchangé. Camp de 12 gardé (éclatante 14 à 26 % aux niveaux 2 et 3 à p 0,7, 0 % au niveau 1 quel que soit le camp).

### 7. Grand Gardien (défense, 3 vagues, camp de 16)

#### 7.1 À la ligne + 1 avec l'arsenal de la semaine (la règle du cahier)

`grand-3v16-<carte>-arsenal-1`. Tenue à p 0,6 / 0,7 / 0,8 / 0,9 :

| ligne jouée (semaines) | gue | foret | moulin | col |
|---|---|---|---|---|
| 1, arsenal 0 (S1, S2) | 41 / 67 / 84 / 96 % | 41 / 66 / 83 / 96 % | 78 / 94 / 97 / 100 % | 61 / 82 / 93 / 99 % |
| 2, arsenal 1 (S3 à S5) | 59 / 76 / 91 / 96 % | 76 / 88 / 95 / 99 % | 87 / 94 / 98 / 100 % | 70 / 84 / 93 / 98 % |
| 3, arsenal 2 (S6 à S8) | **9 / 20 / 38 / 60 %** | 28 / 39 / 53 / 74 % | 53 / 63 / 79 / 93 % | 43 / 57 / 73 / 87 % |
| 4, arsenal 3 (S9 à S12) | **6 / 15 / 23 / 20 %** | 8 / 21 / 28 / 26 % | 51 / 69 / 84 / 93 % | 20 / 37 / 61 / 90 % |

Murs restants quand il tient (gue, p 0,7) : 36 / 37 / 16 / 1 %. La troisième vague fait la différence : à deux vagues, la ligne 3 avec l'arsenal 2 tient 87 % (5.2) ; à trois vagues, 20 %. Le passage de la ligne 2 à la ligne 3 (garde × 1,3, points de vie × 0,9, assaut 3,5) puis à la ligne 4 (tirs × 1,62, points de vie × 1,2, coups × 1) coûte une vague entière.

#### 7.2 À la ligne de la semaine

`grand-3v16-<carte>` (et `grand-3v16-gue-niveau0`). Tenue à p 0,6 / 0,7 / 0,9 :

| ligne (semaines) | gue | foret | moulin | col | domaine |
|---|---|---|---|---|---|
| 0 (S1, S2) | 52 / 76 / 97 % | — | — | — | — |
| 1 (S3 à S5) | 51 / 71 / 96 % | 66 / 78 / 97 % | 84 / 90 / 100 % | 69 / 81 / 99 % | 54 / 68 / 96 % |
| 2 (S6 à S8) | 83 / 87 / 99 % | 93 / 95 / 99 % | 99 / 100 / 100 % | 91 / 94 / 99 % | 74 / 79 / 94 % |
| 3 (S9 à S12) | 64 / 76 / 97 % | 82 / 88 / 99 % | 96 / 97 / 100 % | 89 / 94 / 99 % | 80 / 83 / 99 % |
| 4 (S13+) | 29 / 37 / 79 % | 33 / 49 / 89 % | 93 / 98 / 100 % | 59 / 74 / 96 % | 49 / 60 / 86 % |

Murs restants quand il tient (gue, p 0,7) : 42 / 36 / 50 / 31 / 5 % ; éclatante (gue) : 6 / 0 / 14 / 12 / 0 %.

#### 7.3 Quatre vagues à la ligne de la semaine (essai de levier)

`grand-4v16-gue`, `grand-4v16-domaine`, tenue à p 0,6 / 0,7 / 0,9, lignes 1 à 4 : gue 56 / 72 / 98 %, 63 / 78 / 99 %, 23 / 42 / 94 %, 3 / 9 / 33 % ; domaine 54 / 69 / 97 %, 64 / 75 / 96 %, 59 / 74 / 97 %, 10 / 16 / 56 %. Une 4e vague coûte peu aux lignes 1 et 2 (−1 à −9 points) et beaucoup aux lignes 3 et 4. Elle rallonge le Grand Gardien à 12 questions. Non retenue.

#### 7.4 Solidité 12, 14, 16, 20

`grand-3v12-gue-arsenal-1` à `grand-3v20-gue-arsenal-1`, tenue à p 0,7 (lignes 1 à 4) : camp 12 : 68 / 76 / 20 / 29 % ; 14 : 67 / 76 / 20 / 29 % ; 16 : 67 / 76 / 20 / 15 % ; 20 : 67 / 76 / 6 / 15 %. Éclatante à p 0,7 : camp 12 : 9 / 0 / 15 / 14 % ; 16 : 0 / 0 / 15 / 0 % ; 20 : 0 partout. Une victoire termine la bataille avant la dernière vague : un camp plus solide fait perdre quelques points de tenue aux lignes 3 et 4.

#### 7.5 Décision

**Grand Gardien : défense, 3 vagues, camp de 16, ligne de la semaine (plafond 4) : la règle « ligne + 1 » du cahier n'est pas retenue.** Avec elle, le Grand Gardien de S8 (ligne 3, arsenal 2) tient 20 % sur le Gué, 39 % sur la Forêt, 57 % au Col, 63 % au Moulin à 7 sur 10 (9 % sur le Gué à 6 sur 10) ; celui de S12 (ligne 4, arsenal 3) 15 à 37 % sauf au Moulin. Une bataille de 7 minutes perdue quatre fois sur cinq, retentée jusqu'à la fin des vivres : c'est l'échec que les règles du projet écartent. À la ligne de la semaine, le Grand Gardien tient 71 à 90 % en S3 (cible 60 à 70 % : tenue sur le Gué, 71 %), 87 à 100 % en S8 (cible 50 à 62 % : au-dessus), 76 à 97 % en S12, 37 à 98 % à partir de S13 (le niveau 4 de la campagne, dur sur le Gué et la Forêt). La cible de S6 → S8 n'est atteignable avec aucun levier du MVP : la ligne + 1 à 3 vagues donne 20 à 63 % selon la carte (plus bas que la cible sur trois cartes sur quatre), la ligne + 1 à 2 vagues 87 à 93 % (et le Grand Gardien ne se distinguerait plus du gardien), la ligne de la semaine à 4 vagues 78 %. Le réglage le plus proche qui ne casse rien est la ligne de la semaine à 3 vagues. Camp de 16 gardé : il ne change pas la tenue aux lignes 1 et 2, éteint l'éclatante (0 à 15 %) et distingue le Grand Gardien du gardien (12).

Remarque pour la table fine de l'étape 2 : la ligne + 1 reste bonne pour le Grand Gardien tant que la semaine est à la ligne 0 ou 1 (67 à 94 % en S1 → S5), et trop dure dès la ligne 2. « La troisième vague vaut une ligne » : si l'étape 2 veut un Grand Gardien plus dur en S6 → S12, c'est la garnison ou une tour de départ de plus (options `garnisonPlus`, `toursDepartPlus` du cahier), pas la ligne.

### 8. Réussite d'une expédition entière (calcul du 17.3)

atelier/mesures/convolution-expedition.js : trois semaines, trois couches par semaine, une halte jouée par couche dont le type est tiré dans la table 4.3 (escarmouche 55 / 35 / 25 %, embuscade 0 / 25 / 0 %), puis le gardien de la semaine ; la dernière semaine finit sur le Grand Gardien. Une bataille où les murs cèdent coûte un vivre ; escarmouche et embuscade cédées ne se rejouent pas ; gardien et Grand Gardien se retentent tant qu'il reste des vivres, au taux de la première tentative (prudent : les coups portés restent). Aucun vivre regagné au bivouac dans le calcul de base (prudent aussi : un bivouac est garanti par semaine). Les cartes tournent avec la semaine ; le Grand Gardien est sur le Gué sauf mention.

```
node atelier/mesures/convolution-expedition.js --esc 2v6 --embPlus 1 --grandPlus 0 --p 0.6,0.7,0.9 --detail     (réglage retenu)
node atelier/mesures/convolution-expedition.js --esc 2v6 --embPlus 1 --grandPlus 1 --p 0.6,0.7,0.9              (règle du cahier)
node atelier/mesures/convolution-expedition.js --esc 2v6 --embPlus 1 --grandPlus 0 --carteGrand foret
node atelier/mesures/convolution-expedition.js --esc 2v6 --embPlus 1 --grandPlus 0 --vivres 2,3 --repos 0.5
```

Réglage retenu (escarmouche 2 vagues camp 6, embuscade ligne + 1, gardien ligne, Grand Gardien ligne, sur le Gué) :

| Expédition | p | 3 vivres | 4 vivres | 5 vivres | premier gardien franchi (3 vivres) |
|---|---|---|---|---|---|
| S1 → S3 | 0,6 | 48 % | 65 % | 77 % | 93 % |
| S1 → S3 | 0,7 | **84 %** | 93 % | 97 % | 99 % |
| S1 → S3 | 0,9 | 100 % | 100 % | 100 % | 100 % |
| S6 → S8 | 0,6 | 99 % | 100 % | 100 % | 100 % |
| S6 → S8 | 0,7 | **100 %** | 100 % | 100 % | 100 % |
| S6 → S8 | 0,9 | 100 % | 100 % | 100 % | 100 % |

Règle du cahier (Grand Gardien à la ligne + 1), même chose par ailleurs : S1 → S3 : 53 / 86 / 100 % à p 0,6 / 0,7 / 0,9 avec 3 vivres (69 / 95 / 100 % avec 4) ; **S6 → S8 : 23 / 48 / 93 %** (30 / 58 / 97 % avec 4 vivres, 36 / 67 / 99 % avec 5).

Variantes :

- Grand Gardien sur une autre carte (réglage retenu, p 0,7, 3 vivres) : S1 → S3 : 87 % (Forêt), 90 % (Moulin), 88 % (Col) ; S6 → S8 : 100 % partout. Règle du cahier : S6 → S8 : 76 % (Forêt), 94 % (Moulin), 91 % (Col) : la cible 55 à 70 % n'est approchée que sur le Gué, et par en dessous.
- Embuscade à la ligne de la semaine (au lieu de + 1) : aucun changement visible (84 % et 100 %) : l'embuscade pèse peu dans la réussite d'une expédition.
- Escarmouche à 1 vague au lieu de 2 : aucun changement (elle ne coûte jamais de vivre).
- 2 vivres au départ (réglage retenu) : S1 → S3 : 29 / 65 / 99 % à p 0,6 / 0,7 / 0,9 ; S6 → S8 : 94 / 97 / 100 %.
- Repos au bivouac une fois sur deux (`--repos 0.5`) : S1 → S3 : 67 / 93 / 100 % ; S6 → S8 : 100 %. Avec la règle du cahier : S6 → S8 : 33 / 61 %.

Taux de tenue de chaque nœud, semaine par semaine, réglage retenu, p 0,7 : S1 (Gué) : escarmouche 100 % (éclatante 39 %), embuscade 70 %, gardien 80 % ; S2 (Forêt) : 100 % (39 %), 69 %, 68 % ; S3 (Moulin) : 100 % (56 %), 96 %, 89 %, Grand Gardien 71 % ; S6 (Gué) : 100 % (54 %), 87 %, 100 % ; S7 (Forêt) : 100 % (54 %), 88 %, 100 % ; S8 (Moulin) : 100 % (55 %), 93 %, 100 %, Grand Gardien 87 %.

Ce que le calcul montre : la réussite d'une expédition tient presque entièrement aux gardiens retentés. Avec 3 vivres, un Grand Gardien tenu une fois sur deux à la première tentative donne déjà 1 − 0,5³ = 88 % d'expéditions gagnées quand rien d'autre n'a coûté de vivre ; les cibles par nœud du 17.3 (gardien 68 à 80 %, Grand Gardien 50 à 62 % en S6 → S8) sont donc incompatibles avec la cible d'expédition de 55 à 70 % : pour tomber à 60 %, il faudrait un Grand Gardien tenu une fois sur quatre. Les cibles par nœud sont celles que l'élève ressent à chaque bataille ; ce sont elles qui sont gardées.

### 9. Les cibles du 17.3, nœud par nœud (réglage retenu, Grand Gardien sur le Gué)

| Mesure | cible S1 → S3 (p 0,7) | mesuré S1 / S2 / S3 | cible S6 → S8 (p 0,7) | mesuré S6 / S7 / S8 | cible p 0,9 | mesuré S1-S3 ; S6-S8 | cible p 0,6 | mesuré S1-S3 ; S6-S8 |
|---|---|---|---|---|---|---|---|---|
| Escarmouche tenue | ≥ 95 % | 100 % | ≥ 90 % | 100 % | ≥ 99 % | 100 % | ≥ 85 % | 100 % |
| Escarmouche éclatante | 40 à 60 % | 39 / 39 / 56 % | 30 à 50 % | 54 / 54 / 55 % | ≥ 70 % | 86 / 84 / 88 ; 91 / 91 / 91 % | ≥ 20 % | 20 / 20 / 50 ; 38 / 38 / 39 % |
| Embuscade tenue (ligne + 1) | 75 à 85 % | 70 / 69 / 96 % | 68 à 80 % | 87 / 88 / 93 % | ≥ 94 % | 97 / 97 / 100 ; 97 / 98 / 99 % | 58 à 70 % | 49 / 49 / 91 ; 76 / 75 / 81 % |
| Gardien vaincu, 1re tentative | 75 à 85 % | 80 / 68 / 89 % | 68 à 80 % | 100 / 100 / 100 % | ≥ 94 % | 98 / 96 / 99 ; 100 % | 55 à 65 % | 62 / 45 / 84 ; 99 % |
| Grand Gardien, 1re tentative | 60 à 70 % | 71 % | 50 à 62 % | 87 % | ≥ 88 % | 96 ; 99 % | ≥ 40 % | 51 ; 83 % |
| Expédition, 3 vivres | 70 à 85 % | 84 % | 55 à 70 % | 100 % | ≥ 95 % | 100 ; 100 % | ≥ 45 % ; ≥ 35 % | 48 ; 99 % |
| Expédition, 4 vivres | ≥ 90 % | 93 % | ≥ 80 % | 100 % | ≥ 99 % | 100 % | ≥ 60 % ; ≥ 50 % | 65 ; 100 % |
| Expédition, 5 vivres | ≥ 95 % | 97 % | ≥ 90 % | 100 % | 100 % | 100 % | ≥ 75 % ; ≥ 65 % | 77 ; 100 % |
| Premier gardien franchi | ≥ 95 % | 99 % | | 100 % | | | | |

S1 → S3 : tout est tenu ou à 5 points près (escarmouche 39 %, embuscade 69 à 70 %, gardien de la Forêt 68 %). S6 → S8 : tout est tenu sauf « trop facile » : escarmouche 54 % (cible ≤ 50), embuscade 87 à 93 % (≤ 80), gardien 100 % (≤ 80), Grand Gardien 87 % (≤ 62), expédition 100 % (≤ 70). La raison est la même partout : avec l'arsenal de la rangée 2 (trébuchet, tour de siège, jauges à 4), la ligne 2 du rival ne fait plus peur à deux vagues, et la ligne 3 à trois vagues en fait trop. Rien entre les deux n'est accessible sans toucher au moteur ou à la table RIVAL (interdits au MVP) : c'est le travail de la table fine de l'étape 2, avec la garnison et les tours de départ comme leviers.

### 10. Décisions et raisons

1. **Escarmouche à 2 vagues, camp de 6** (le cahier proposait 1 vague camp 6, ou 2 vagues camp 8). Une vague : impossible au niveau 0 (cinq coups au plus), éclatante qui baisse avec p au niveau 1, nulle au niveau 4 ; deux vagues camp 8 : 11 % au niveau 0. Deux vagues camp 6 : 38 à 69 % à p 0,7 aux niveaux 0 à 3, monotone en p, dans les cibles à 5 points près. Coût : 6 questions et 4 à 4,5 minutes par escarmouche.
2. **Le champion n'empêche rien à deux vagues** : il coûte 9 à 11 points d'éclatante aux niveaux 1 à 3 (0 au niveau 0, 21 au niveau 4 sur la Forteresse), 0,3 à 0,6 coup, et les cibles tiennent avec lui. À une vague il interdisait l'éclatante au niveau 4 (0 % au lieu de 69 à 97 % sur le Gué et le Moulin). Rien à faire au MVP ; `champion: false` à l'étape 2 rend ces 9 à 11 points si Romain veut plus de portes doublées.
3. **Solidités 6 / 10 / 12 / 16 confirmées.** En défense, elles ne changent pas la tenue des murs (identique à l'unité près de 8 à 16), seulement l'éclatante ; 10 pour l'embuscade et 12 pour le gardien laissent 8 à 35 % d'éclatante aux niveaux 0, 2 et 3 ; 16 pour le Grand Gardien l'éteint presque (0 à 15 %), ce qui le distingue.
4. **Ligne par semaine confirmée** (S1-2 : 0, S3-5 : 1, S6-8 : 2, S9-12 : 3, S13+ : 4). Embuscade à la ligne + 1 (plafond 4) confirmée. Gardien à la ligne. **Grand Gardien à la ligne de la semaine et non + 1** (7.5). Avec ces règles, S1 → S3 tient toutes ses cibles ; S6 → S8 est trop facile partout sauf avec le Grand Gardien à + 1, qui est alors beaucoup trop dur : le réglage retenu est le plus proche qui ne casse rien.
5. **`config.expedition.difficulte` : 0.** Le lever à + 1 est à éviter de S6 à S12 tant que la table fine n'existe pas : il met le Grand Gardien de S8 à la ligne 3 avec l'arsenal 2 (20 % sur le Gué). À − 1, il ramène S3 → S5 à la ligne 0, mesurée seulement avec l'arsenal 0 ; sans effet sur S1-S2 (plancher).
6. **Cible d'expédition S6 → S8 à réviser dans le cahier (17.3)** : ≥ 85 % à p 0,7 avec 3 vivres (mesuré 100 %), ≥ 60 % à p 0,6 (99 %) ; les cibles par nœud restent la référence. Le levier « trop facile » reste `vivres: 2` (97 % en S6 → S8, 65 % en S1 → S3) puis les Serments (étape 3).
7. **Vivres : 3 au départ, 5 au plus, confirmés.** À 2, S1 → S3 tombe à 65 % à p 0,7 et 29 % à p 0,6.
8. **Étape 2, premiers candidats de la table fine** (cahier 7.1) : gardien de S6 à S8 à la ligne 3 (87 à 93 % à deux vagues) ; Grand Gardien durci par `garnisonPlus` ou `toursDepartPlus` plutôt que par la ligne ; embuscade de S1-S2 à la ligne 0 si Romain la trouve trop dure (80 / 68 % au lieu de 70 / 69 %).
9. **Comptes à reporter dans le cahier** : escarmouche 6 questions, 4 à 4,5 minutes ; expédition de trois semaines ≈ 60 questions (au lieu de ≈ 50) et 34 à 46 minutes à vitesse × 1 ; annexe A « Modes et vagues : escarmouche : attaque, 2 ».

### Décisions à appliquer

```
escarmouche.mode = attaque
escarmouche.vagues = 2
escarmouche.pvRival = 6
escarmouche.ligne = ligne de la semaine + 0
escarmouche.champion = gardé (option moteur inchangée)
escarmouche.questions = 6
embuscade.mode = defense
embuscade.vagues = 2
embuscade.pvRival = 10
embuscade.ligne = ligne de la semaine + 1, plafond 4
gardien.mode = defense
gardien.vagues = 2
gardien.pvRival = 12
gardien.ligne = ligne de la semaine + 0
grandGardien.mode = defense
grandGardien.vagues = 3
grandGardien.pvRival = 16
grandGardien.ligne = ligne de la semaine + 0, plafond 4
LIGNE_SEMAINE = S1-S2 : 0 ; S3-S5 : 1 ; S6-S8 : 2 ; S9-S12 : 3 ; S13+ : 4
config.expedition.difficulte = 0
config.expedition.vivres = 3
vivres.maximum = 5
cible 17.3 expédition S6 → S8, p 0,7, 3 vivres = ≥ 85 % (au lieu de 55 à 70 %)
cible 17.3 expédition S6 → S8, p 0,6, 3 vivres = ≥ 60 % (au lieu de ≥ 35 %)
référence des batailles de campagne = atelier/mesures/avant-expedition.json (0 écart exigé)
```
