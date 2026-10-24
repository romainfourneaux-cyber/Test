# Expéditions : mesures

Cahier des mesures du mode Expéditions (atelier/conception/expeditions.md). Rien de ce document n'entre dans jeu/. Chaque section donne les commandes exactes, les tableaux et les décisions, avec leurs raisons. Les fichiers bruts (un .txt lisible et un .json par mesure) sont dans atelier/mesures/jour0/. Les pourcentages sont arrondis à l'unité ; avec 160 batailles par case, un écart de moins de 5 points entre deux cases ne veut rien dire.

## Jour 0 (24 octobre 2026) : mesurer avant d'écrire la route

Sections du cahier de conception concernées : 7.2 (table des haltes), 16.1 (jour 0), 17.2 (simulateur) et 17.3 (cibles et leviers). Le moteur (jeu/js/bataille-moteur.js) n'est pas touché. Les batailles de campagne ne changent pas (preuve en 1).

### 0. En deux mots

- **Escarmouche : 2 vagues, camp de 6** (et non 1 vague). À une vague, le camp de 6 ne tombe jamais au niveau 0 (cinq coups au plus) ni au niveau 4 (le champion), et le taux d'éclatante baisse quand l'élève répond mieux. À deux vagues et camp de 6, l'éclatante vaut 38 à 61 % à 7 sur 10 aux niveaux 0 à 3, et monte avec p.
- **Le champion reste** (le MVP ne peut pas le retirer). À deux vagues et camp de 6, il coûte 9 à 11 points d'éclatante aux niveaux 1 à 3 (rien au niveau 0, 21 points au niveau 4 sur la Forteresse) et les cibles tiennent avec lui. À une vague il tue l'escarmouche du niveau 4 (0 % au lieu de 69 à 97 %).
- **Solidités 6 / 10 / 12 / 16 confirmées.** En défense, la solidité du camp ne change pas la tenue des murs : elle ne règle que la part d'éclatante.
- **Ligne du rival par semaine confirmée** (S1-2 : 0, S3-5 : 1, S6-8 : 2, S9-12 : 3, S13+ : 4). Embuscade à la ligne + 1 confirmée. **Grand Gardien à la ligne de la semaine, pas + 1** : à 3 vagues, la ligne 3 jouée avec l'arsenal de la ligne 2 ne tient que 20 % du temps sur le Gué (S6 à S8), 15 % à la ligne 4 avec l'arsenal 3.
- **Expédition entière, 3 vivres, 7 sur 10 : S1 → S3 84 %** (cible 70 à 85 %), premier gardien 99 %. **S6 → S8 : 100 %** avec le réglage retenu, 48 % avec le Grand Gardien à la ligne + 1 : la cible 55 à 70 % n'est atteignable avec aucun levier du MVP, et elle contredit les cibles par nœud du même tableau (un Grand Gardien vaincu une fois sur deux, retenté avec 3 vivres, donne déjà 88 % de réussite). Cible révisée proposée : ≥ 85 % (amendée à la vérification : 65 à 85 %, non atteinte ; voir « Vérification »).

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

Preuve du jour 0 (24/10/2026) :

- Le simulateur d'avant les options de route (commit 7116aec, copie de travail) et le simulateur d'aujourd'hui ont été lancés avec la commande de régénération ci-dessus, mêmes graines : les deux fichiers JSON (33 588 octets, quatre stratégies, p 0,6 à 0,9, niveaux 0 à 4, attaque et défense) sont **identiques octet par octet** (`cmp` muet, même empreinte SHA-256 commençant par 2ecf29ef). Le fichier d'aujourd'hui est la référence installée.
- La sortie texte par défaut (sans `--json`) a aussi été comparée entre les deux versions sur un essai court (6 graines, niveaux 0 et 3, p 0,7 et 0,9, stratégies equilibre et rush) : identique hors la durée affichée.
- `--comparer atelier/mesures/avant-expedition.json` lancé ensuite : **+0 % sur les vingt cases** (batailles pour prendre et coups à la 1re bataille, niveaux 0 à 4, p 0,6 à 0,9), sortie gardée dans atelier/mesures/jour0/campagne-comparer.txt. Repères de la référence à 7 sur 10, joueur équilibré : batailles pour prendre 1,69 / 2,7 / 3,1 / 2,56 / 5,16 aux niveaux 0 à 4 ; défense du domaine tenue 79 / 73 / 79 / 83 / 73 %.
- Au passage : une bataille de route jouée sur `domaine` à 3 vagues et camp de 12 rend exactement la défense du domaine de la campagne (mêmes graines, mêmes chiffres), ce qui vérifie que le mode route emprunte le même chemin du moteur.

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

**Escarmouche : attaque, 2 vagues, camp de 6, ligne de la semaine, champion gardé.** À 7 sur 10 : 39 % (S1, S2), 56 % (S3, sur le Moulin ; 54 à 61 % selon la carte), 54 à 55 % (S6 à S8) ; à 9 sur 10 : 86 à 91 % ; à 6 sur 10 : 20 à 50 % (précisé à la vérification). Cibles 17.3 : 40 à 60 % (S1 → S3), 30 à 50 % (S6 → S8), ≥ 70 % à p 0,9, ≥ 20 % à p 0,6 : tenues à 5 points près (S1 et S2 à 38 %, S6 à S8 à 54 %). Conséquence à reporter dans le cahier (5.1, annexe A) : 6 questions par escarmouche au lieu de 3, 4 à 4,5 minutes au lieu de 2,5 à 3, soit 4 à 6 minutes de plus par expédition de trois semaines.

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

Murs restants en moyenne sur toutes les batailles, 0 quand ils cèdent (gue, p 0,7) : 42 / 77 / 61 / 61 % ; quand elle tient : 60 / 82 / 70 / 61 % (corrigé à la vérification) ; coups portés au camp : 3,7 / 3,3 / 2,4 / 1,9.

#### 5.3 La solidité du camp ne change pas la tenue

`emb-2v8-gue-arsenal-1`, `emb-2v10-gue-arsenal-1`, `emb-2v12-gue-arsenal-1` : tenue identique à l'unité près (70 / 94 / 87 / 100 % à p 0,7). En défense, le camp adverse ne sert qu'à l'éclatante : camp 8 ou 10 : 8 / 0 / 6 / 0 % à p 0,7 et 51 / 0 / 17 / 0 % à p 0,9 (lignes 1 à 4) ; camp 12 : 0 / 0 / 3 / 0 % et 6 / 0 / 13 / 0 %. (Une victoire termine la bataille avant la fin de la vague : une solidité plus basse protège un peu les murs, sans effet mesurable ici.)

#### 5.4 Décision

**Embuscade : défense, 2 vagues, camp de 10, ligne de la semaine + 1 (plafond 4), confirmée.** Cibles 17.3 (75 à 85 % en S1 → S3, 68 à 80 % en S6 → S8, ≥ 94 % à p 0,9, 58 à 70 % à p 0,6) : S1 et S2 un peu dures (70 % à p 0,7, 49 % à p 0,6), S3 à S5 faciles (94 à 96 %), S6 à S8 un peu faciles (87 à 93 %), p 0,9 tenu partout (97 à 100 %). La règle « ligne de la semaine » (5.1) irait mieux en S1 → S5 (80 / 68 / 89 %) mais donne 100 % dès S6 : à deux vagues, la ligne + 1 est le seul réglage qui garde un enjeu après S5. L'embuscade est un choix (chemin tranquille garanti, G6) avec une faveur garantie : un peu de risque en S1-S2 est voulu. Camp de 10 gardé (8 n'apporte rien, 12 éteint l'éclatante).

### 6. Gardien de la semaine (défense, 2 vagues, camp de 12)

#### 6.1 Tenue

`gard-2v12-<carte>` : à solidité différente, la tenue est **la même que l'embuscade** à la même ligne (5.1), au point près : gue 80 / 82 / 100 / 100 / 100 % à p 0,7 (niveaux 0 à 4), foret 68 / 91 / 100 / 100 / 100 %, moulin 88 / 89 / 100 / 100 / 100 %, col 81 / 89 / 100 / 100 / 100 %, chateau 88 / 100 / 100 / 100 / 100 %, domaine 81 / 81 / 100 / 100 / 100 %. À p 0,6 : gue 62 / 72 / 99 / 100 / 98 %, foret 45 / 86 / 99 / 100 / 100 %, moulin 72 / 84 / 99 / 100 / 100 %. À p 0,9 : 96 à 100 % partout.

Murs restants en moyenne, 0 quand ils cèdent (gue, p 0,7) : 45 / 64 / 91 / 82 / 69 % ; quand il tient : 57 / 79 / 91 / 82 / 69 % (corrigé à la vérification) ; coups portés : 4,1 / 3,5 / 6,6 / 8,2 / 0.

#### 6.2 Solidité 10, 12, 14, 16

`gard-2v10-gue` à `gard-2v16-gue` : tenue identique (80 / 82 / 100 / 100 / 100 % à p 0,7). Éclatante à p 0,7, niveaux 0 à 4 : camp 10 : 11 / 0 / 26 / 35 / 0 % ; camp 12 : 11 / 0 / 14 / 26 / 0 % ; camp 14 : 0 / 0 / 14 / 26 / 0 % ; camp 16 : 0 / 0 / 14 / 12 / 0 %. À p 0,9, camp 12 : 48 / 0 / 52 / 66 / 0 %.

#### 6.3 Une ligne au-dessus, deux lignes au-dessus (levier `difficulte`)

Gardien joué une ligne au-dessus de l'arsenal (lecture de `emb-2v10-gue-arsenal-1`, même tenue) : 70 / 94 / 87 / 100 % aux lignes 1 à 4, p 0,7. Deux lignes au-dessus (`gard-2v12-gue-arsenal-2`, lignes 2 à 4 avec l'arsenal 0 à 2) : 72 / 61 / 48 % à p 0,6, 78 / 66 / 63 % à p 0,7, 98 / 84 / 93 % à p 0,9, murs en moyenne 39 / 31 / 40 % (50 / 47 / 64 % quand il tient, corrigé à la vérification).

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

Murs restants en moyenne, 0 quand ils cèdent (gue, p 0,7) : 36 / 37 / 16 / 1 % ; quand il tient : 54 / 49 / 80 / 10 % (corrigé à la vérification). La troisième vague fait la différence : à deux vagues, la ligne 3 avec l'arsenal 2 tient 87 % (5.2) ; à trois vagues, 20 %. Le passage de la ligne 2 à la ligne 3 (garde × 1,3, points de vie × 0,9, assaut 3,5) puis à la ligne 4 (tirs × 1,62, points de vie × 1,2, coups × 1) coûte une vague entière.

#### 7.2 À la ligne de la semaine

`grand-3v16-<carte>` (et `grand-3v16-gue-niveau0`). Tenue à p 0,6 / 0,7 / 0,9 :

| ligne (semaines) | gue | foret | moulin | col | domaine |
|---|---|---|---|---|---|
| 0 (S1, S2) | 52 / 76 / 97 % | — | — | — | — |
| 1 (S3 à S5) | 51 / 71 / 96 % | 66 / 78 / 97 % | 84 / 90 / 100 % | 69 / 81 / 99 % | 54 / 68 / 96 % |
| 2 (S6 à S8) | 83 / 87 / 99 % | 93 / 95 / 99 % | 99 / 100 / 100 % | 91 / 94 / 99 % | 74 / 79 / 94 % |
| 3 (S9 à S12) | 64 / 76 / 97 % | 82 / 88 / 99 % | 96 / 97 / 100 % | 89 / 94 / 99 % | 80 / 83 / 99 % |
| 4 (S13+) | 29 / 37 / 79 % | 33 / 49 / 89 % | 93 / 98 / 100 % | 59 / 74 / 96 % | 49 / 60 / 86 % |

Murs restants en moyenne, 0 quand ils cèdent (gue, p 0,7) : 42 / 36 / 50 / 31 / 5 % ; quand il tient : 55 / 50 / 58 / 41 / 14 % (corrigé à la vérification) ; éclatante (gue) : 6 / 0 / 14 / 12 / 0 %.

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
| Escarmouche éclatante | 40 à 60 % | 39 / 39 / 56 % | 30 à 50 % | 54 / 54 / 55 % | ≥ 70 % | 86 / 86 / 88 ; 91 / 91 / 91 % | ≥ 20 % | 20 / 20 / 50 ; 38 / 38 / 39 % |
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
6. **Cible d'expédition S6 → S8 à réviser dans le cahier (17.3)** : ≥ 85 % à p 0,7 avec 3 vivres (mesuré 100 %), ≥ 60 % à p 0,6 (99 %) (amendé à la vérification : 65 à 85 % à p 0,7, déduit des cibles par nœud, non atteinte ; ≥ 35 % gardé à p 0,6) ; les cibles par nœud restent la référence. Le levier « trop facile » reste `vivres: 2` (97 % en S6 → S8, 65 % en S1 → S3) puis les Serments (étape 3).
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

Bloc relu, amendé et confirmé par la vérification : voir « Vérification », V7, à la fin de ce document.

## Vérification (24 octobre 2026, second regard)

Rôle de cette section : refaire les mesures du jour 0 sans les croire sur parole, chercher les erreurs de recopie, recalculer la réussite d'une expédition avec une autre méthode, confronter le bloc de décisions aux cibles du 17.3 et chercher le piège des paliers de flèches. Fichiers bruts : atelier/mesures/verification/ (20 mesures relancées, un .txt et un .json chacune ; 17 essais de fragilité `fragilite-*.txt` ; `campagne-comparer.txt` ; `campagne-regen.json`). Scripts de travail hors dépôt. Le simulateur n'a pas été modifié : ses options de route font ce qu'elles disent.

### V1. Les batailles de campagne n'ont pas bougé

- `node atelier/outils/simuler-bataille.js --comparer atelier/mesures/avant-expedition.json` : **+0 % sur les vingt cases** (batailles pour prendre et coups à la 1re bataille, niveaux 0 à 4, p 0,6 à 0,9), sortie dans atelier/mesures/verification/campagne-comparer.txt.
- Régénération complète de la référence avec le simulateur d'aujourd'hui (quatre stratégies, `--json`, 80 graines) : REGEN_RESULTAT
- Simulateur d'avant les options de route (commit 7116aec, copie de travail avec sa racine ajustée) contre le simulateur d'aujourd'hui, essai court en `--json` (6 graines, niveaux 0 et 3, p 0,7 et 0,9, stratégies equilibre et rush) : **fichiers identiques** (`cmp` muet).
- Les fichiers que le simulateur charge (jeu/js/noyau.js, sauvegarde.js, bataille-moteur.js, cartes-bataille.js, campagne.js, jeu/data/config.js) n'ont pas changé depuis 7116aec (`git diff 7116aec HEAD` sur ces fichiers : vide). `git status` pendant la vérification : rien de la vérification dans jeu/ ; en revanche les agents du MVP ont modifié en même temps jeu/js/recit.js, bataille.js, interface.js, campagne.js et jeu/css/jeu.css (vers 16 h 50). Dans campagne.js, le diff touche `GAINS_RIVALITE` (deux clés ajoutées), `jouerEvenement` (un contexte de route, DOM seulement) et l'export de `reagir` ; `options(niveau)` est intact. Pour en être sûr, `--comparer` a été relancé sur l'arbre de travail tel quel après ces modifications : **+0 % sur les vingt cases** (atelier/mesures/verification/campagne-comparer-apres-edits.txt).
- `--niveaux 0 --p 0.7` en mode campagne : marche (tableau à une ligne). `--comparer` en mode route : marche (+0 pt sur tenue, éclatante, coups et murs contre atelier/mesures/jour0/gard-2v12-gue.json). `--regle` en mode route : marche (assaut 20 → 0 % de tenue ; tours × 3 → 100 %).
- `node atelier/outils/tests.js` : **234 réussis, 0 en échec**. `node atelier/outils/valider.js` : **0 erreur, 5 alertes** (sources de géographie citées mais absentes de DEPOT/, sans rapport avec les mesures) ; 62 cours, 291 fiches, 2 341 questions.

### V2. Relances (80 graines, p 0,6 / 0,7 / 0,9, mêmes commandes)

Relancées : esc-2v6 (gue, foret, moulin, cartes du niveau, sans champion), esc-1v6, emb-2v10-arsenal-1 (gue, foret, moulin), gard-2v12 (gue, foret, moulin), grand-3v16 (gue aux niveaux 0 à 4, gue-arsenal-1, foret, moulin). Résultat : **toutes identiques, à l'unité, aux fichiers de atelier/mesures/jour0/** (tenue, éclatante, coups, murs). C'est attendu : le simulateur tire ses graines d'une suite fixe, une même commande rend les mêmes batailles. La relance prouve donc que les fichiers bruts se reproduisent ; la vérification a porté ensuite sur la **recopie** des fichiers bruts vers les tableaux de ce document : chaque chiffre de tenue et d'éclatante des sections 4 à 9 a été comparé à son fichier .json (tableaux régénérés par atelier/mesures/tableaux-jour0.js). Aucun chiffre de tenue ou d'éclatante n'est faux de plus de 2 points ; les erreurs trouvées sont en V3.

Bruit de mesure, mesuré en rejouant les 40 premières graines (80 batailles au lieu de 160), tenue à p 0,6 / 0,7 / 0,9 :

| Mesure, niveau | 160 batailles | 80 batailles | écart |
|---|---|---|---|
| gard-2v12-gue, 0 | 62 / 80 / 98 % | 56 / 76 / 98 % | −6 / −4 / 0 |
| gard-2v12-foret, 0 | 45 / 68 / 96 % | 41 / 61 / 95 % | −4 / −7 / −1 |
| grand-3v16-gue, 1 | 51 / 71 / 96 % | 48 / 73 / 98 % | −3 / +2 / +2 |
| grand-3v16-gue, 2 | 83 / 87 / 99 % | 81 / 86 / 99 % | −2 / −1 / 0 |
| grand-3v16-gue, 3 | 64 / 76 / 97 % | 69 / 79 / 96 % | +5 / +3 / −1 |
| esc-2v6-gue, éclatante p 0,7, niveaux 0 / 2 | 39 / 54 % | 35 / 48 % | −4 / −6 |

Lecture : à 160 batailles, un taux voisin de 70 % se connaît à **± 7 points** près. Une cible manquée de moins de 7 points est « à la limite », pas tranchée.

### V3. Corrections apportées au texte du jour 0

1. **« Murs restants quand elle tient » : mauvaise colonne, cinq endroits (5.2, 6.1, 6.3, 7.1, 7.2).** Les chiffres donnés étaient la moyenne sur toutes les batailles, murs comptés à 0 quand ils cèdent (colonne « murs » du simulateur), pas la moyenne des batailles tenues. Vraies valeurs quand la bataille est tenue (gue, p 0,7) : embuscade ligne + 1 : 60 / 82 / 70 / 61 % (au lieu de 42 / 77 / 61 / 61) ; gardien : 57 / 79 / 91 / 82 / 69 % (au lieu de 45 / 64 / 91 / 82 / 69) ; gardien deux lignes au-dessus : 50 / 47 / 64 % (au lieu de 39 / 31 / 40) ; Grand Gardien à la ligne + 1 : 54 / 49 / 80 / 10 % (au lieu de 36 / 37 / 16 / 1) ; Grand Gardien à la ligne : 55 / 50 / 58 / 41 / 14 % (au lieu de 42 / 36 / 50 / 31 / 5). Corrigé en place, les deux valeurs sont maintenant données. Aucune décision n'en dépendait.
2. **Section 9, escarmouche éclatante à p 0,9, S2 : 84 % → 86 %** (la Forêt à la ligne 0 ; 84 % est la ligne 1). Corrigé.
3. **Section 4.6, fourchettes de l'escarmouche** : 56 % en S3 (Moulin), pas « 54 à 61 % » ; à 9 sur 10, 86 à 91 % (pas 84) ; à 6 sur 10, 20 à 50 % sur les semaines jouées (56 % est le Gué à la ligne 1, qu'aucune semaine de S1 → S3 ni de S6 → S8 ne joue). Précisé.
4. **« S6 → S8 : 100 % »** (sections 0, 8, 9) vaut 99,6 % avant arrondi. Rien à changer, mais il faut le savoir : ce n'est pas une certitude, c'est 0,13³ plus des miettes.
5. **« Les cibles par nœud sont incompatibles avec la cible d'expédition de 55 à 70 % »** (sections 0 et 8) : trop fort. En mettant chaque nœud de S6 → S8 exactement sur sa cible (escarmouche 100 %), le calcul de la section 8 donne **65 à 85 %** d'expéditions réussies à p 0,7 (bas des fourchettes : embuscade 68, gardien 68, Grand Gardien 50 → 65 % ; haut : 80, 80, 62 → 85 %). La fourchette du cahier (55 à 70 %) recouvre donc la fourchette déduite entre 65 et 70 % : les cibles sont compatibles seulement si chaque nœud est au plus dur de sa fourchette. **La cible révisée « ≥ 85 % » du jour 0 n'est pas déduite des cibles par nœud, elle est calée sur la mesure (99,6 %)** : une cible qu'on ne peut pas manquer ne sert plus à régler. Cible retenue ici : **65 à 85 %** (déduite), **non atteinte** (99,6 %, trop facile). À p 0,6, la cible du cahier (≥ 35 %) est un plancher cohérent avec les cibles par nœud (elles donnent 43 à 69 %) : gardée, le « ≥ 60 % » du jour 0 est retiré. Même raisonnement pour S1 → S3 : les cibles par nœud donnent 79 à 92 %, le cahier dit 70 à 85 % ; le 84 % mesuré est dans les deux.

Pas d'erreur de plus de 5 points. Les options `--vagues`, `--pvRival`, `--mode`, `--carte`, `--arsenal`, `--sansChampion`, `--sortie` du simulateur font ce que la section 2 dit ; rien n'y a été changé.

### V4. La convolution recalculée à part

Deux méthodes écrites sans regarder atelier/mesures/convolution-expedition.js, nourries des mêmes fichiers .json.

Formule. Une semaine = trois couches puis un gardien. À chaque couche, la halte jouée coûte un vivre avec la chance `perte = part_esc × (1 − tenue_esc) + part_emb × (1 − tenue_emb)` (parts 55 / 35 / 25 % pour l'escarmouche, 0 / 25 / 0 % pour l'embuscade ; l'escarmouche tient toujours, donc seule l'embuscade de la 2e couche compte). Si `d(v)` est la chance d'avoir `v` vivres, une couche donne `d'(v − 1) += d(v) × perte` et `d'(v) += d(v) × (1 − perte)`. Un gardien tenu avec la chance `t` à chaque tentative, retenté tant qu'il reste des vivres : `d'(v − k) += d(v) × (1 − t)^k × t` pour `k` de 0 à `v − 1`, et le reste, `d(v) × (1 − t)^v`, va dans `d'(0)`. La réussite est `1 − d(0)` après le Grand Gardien ; « premier gardien franchi » est `1 − d(0)` après le gardien de la première semaine.

À la main, S1 → S3 à p 0,7 en négligeant les embuscades : quatre places retentées (gardiens 0,80 ; 0,68 ; 0,89 ; Grand Gardien 0,71), l'expédition réussit si elles coûtent au plus 2 échecs en tout. Avec `q = 1 − t` (0,20 ; 0,32 ; 0,11 ; 0,29) et `P0 = 0,80 × 0,68 × 0,89 × 0,71 = 0,344` : réussite = `P0 × (1 + Σq + Σ_{i ≤ j} q_i q_j) = 0,344 × (1 + 0,92 + 0,5425) = 84,6 %` ; les embuscades (0,25 × 30 % de chance de perdre un vivre en S1 et S2) enlèvent le demi-point qui reste.

| Expédition | p | vivres | convolution refaite | tirage Monte-Carlo (200 000) | script du jour 0 | premier gardien (refaite / MC / jour 0) |
|---|---|---|---|---|---|---|
| S1 → S3 | 0,6 | 3 / 4 / 5 | 48,3 / 64,7 / 76,9 % | 48,2 / 64,7 / 76,9 % | 48 / 65 / 77 % | 93,4 / 93,4 / 93 % |
| S1 → S3 | 0,7 | 3 / 4 / 5 | 84,1 / 93,4 / 97,4 % | 84,1 / 93,4 / 97,5 % | 84 / 93 / 97 % | 99,0 / 98,9 / 99 % |
| S1 → S3 | 0,9 | 3 / 4 / 5 | 100 / 100 / 100 % | 99,9 / 100 / 100 % | 100 % | 100 % |
| S6 → S8 | 0,6 | 3 / 4 / 5 | 98,9 / 99,8 / 100 % | 98,9 / 99,8 / 100 % | 99 / 100 / 100 % | 100 % |
| S6 → S8 | 0,7 | 3 / 4 / 5 | 99,6 / 100 / 100 % | 99,6 / 100 / 100 % | 100 % | 100 % |
| S6 → S8 | 0,9 | 3 / 4 / 5 | 100 % | 100 % | 100 % | 100 % |
| S6 → S8, Grand Gardien à la ligne + 1 (règle du cahier) | 0,7 | 3 / 4 / 5 | 47,8 / 58,2 / 66,6 % | 47,8 / 58,3 / 66,7 % | 48 / 58 / 67 % | 100 % |

**L'arithmétique du jour 0 est juste.** Ses hypothèses tiennent aussi : une halte par couche (cahier 3.4 : 3 haltes jouées puis le gardien), parts de la table 4.3, escarmouche et embuscade cédées non rejouées, gardiens retentés au taux de la première tentative, aucun vivre regagné (prudent : le bivouac de 3e couche est garanti, cahier G2).

### V5. Les cibles du 17.3, nœud par nœud (réglage retenu, p 0,7 sauf mention, Grand Gardien sur le Gué)

« Atteinte » : dans la fourchette. « Limite » : à moins de 7 points (le bruit de mesure). « Non atteinte » : au-delà.

| Cible | Valeur du cahier | Mesuré | Verdict |
|---|---|---|---|
| Escarmouche tenue S1 → S3 | ≥ 95 % | 100 / 100 / 100 % | atteinte |
| Escarmouche tenue S6 → S8 | ≥ 90 % | 100 % | atteinte |
| Escarmouche tenue p 0,9 / p 0,6 | ≥ 99 % / ≥ 85 % | 100 % / 100 % | atteinte |
| Escarmouche éclatante S1 → S3 | 40 à 60 % | 39 / 39 / 56 % | limite (S1, S2 à 1 point sous) |
| Escarmouche éclatante S6 → S8 | 30 à 50 % | 54 / 54 / 55 % | limite (4 à 5 points au-dessus : un peu trop facile) |
| Escarmouche éclatante p 0,9 / p 0,6 | ≥ 70 % / ≥ 20 % | 86 à 91 % / 20 à 50 % | atteinte (p 0,6 : S1 et S2 pile à 20 %) |
| Embuscade tenue S1 → S3 | 75 à 85 % | 70 / 69 / 96 % | limite en S1-S2 (5 à 6 points sous) ; **non atteinte en S3** (11 points au-dessus) |
| Embuscade tenue S6 → S8 | 68 à 80 % | 87 / 88 / 93 % | **non atteinte** (7 à 13 points au-dessus) |
| Embuscade tenue p 0,9 | ≥ 94 % | 97 à 100 % | atteinte |
| Embuscade tenue p 0,6 | 58 à 70 % | 49 / 49 / 91 % ; 76 / 75 / 81 % | **non atteinte** (S1-S2 9 points sous, S3 et S6 → S8 au-dessus) |
| Gardien vaincu S1 → S3 | 75 à 85 % | 80 / 68 / 89 % | S1 atteinte ; S2 (Forêt) **limite** (7 points sous, 61 % sur les 40 premières graines) ; S3 limite (4 au-dessus) |
| Gardien vaincu S6 → S8 | 68 à 80 % | 100 / 100 / 100 % | **non atteinte** (20 points au-dessus) |
| Gardien p 0,9 | ≥ 94 % | 96 à 100 % | atteinte |
| Gardien p 0,6 | 55 à 65 % | 62 / 45 / 84 % ; 99 % | S1 atteinte ; S2 **non atteinte** (10 sous) ; S3 et S6 → S8 **non atteintes** (trop facile) |
| Grand Gardien S1 → S3 | 60 à 70 % | 71 % (Gué ; 78 à 90 % sur les autres cartes) | limite sur le Gué (1 point) ; non atteinte ailleurs (trop facile) |
| Grand Gardien S6 → S8 | 50 à 62 % | 87 % (Gué ; 94 à 100 % ailleurs) | **non atteinte** (25 points au-dessus) |
| Grand Gardien p 0,9 / p 0,6 | ≥ 88 % / ≥ 40 % | 96 ; 99 % / 51 ; 83 % | atteinte |
| Expédition S1 → S3, 3 / 4 / 5 vivres | 70 à 85 / ≥ 90 / ≥ 95 % | 84 / 93 / 97 % | atteinte |
| Expédition S6 → S8, 3 vivres | 55 à 70 % (cahier) ; 65 à 85 % (déduite, V3) | 99,6 % | **non atteinte** (trop facile) |
| Expédition S6 → S8, 4 / 5 vivres | ≥ 80 / ≥ 90 % | 100 % | atteinte (planchers) |
| Expédition p 0,6, S1 → S3 / S6 → S8 | ≥ 45 / ≥ 35 % | 48 / 99 % | atteinte (S1 → S3 à 3 points du plancher) |
| Expédition p 0,9, S1 → S3 | ≥ 95 % | 100 % | atteinte |
| Premier gardien franchi | ≥ 95 % | 99 % | atteinte |

Bilan : S1 → S3 tient, à la limite près (embuscade de S1-S2, gardien de la Forêt, escarmouche à 39 %). **Tout S6 → S8 est trop facile** : embuscade, gardien, Grand Gardien et expédition dépassent leur fourchette de 7 à 25 points. Le jour 0 l'avait vu et l'a écrit ; ce qu'il n'a pas dit assez clairement, c'est que c'est une cible manquée, pas une cible à déplacer.

### V6. Le piège des paliers de flèches

Rappel du mécanisme (journal du 16/10/2026, moteur ligne 60 et suivantes) : une troupe tombe quand ses points de vie passent sous 0,001 ; le nombre de coups nécessaires est un entier, et tout quotient points de vie / dégâts proche d'un entier peut sauter d'un cran pour un changement minuscule. Les seuils 1,534 et 1,725 du journal sont ceux de `RIVAL[4].tirs` (fantassin et cavalier de l'arsenal 2 : 9,2 / 6 = 1,533 ; 13,8 / 8 = 1,725). **Aucune décision du bloc ne touche à « tirs », ni à aucune valeur de la table RIVAL** : la route combine seulement des lignes existantes avec des rangées d'arsenal existantes. Les combinaisons neuves sont celles de la ligne + 1 (embuscade : ligne 1 avec l'arsenal 0, ligne 2 avec l'arsenal 1, ligne 3 avec l'arsenal 2, ligne 4 avec l'arsenal 3).

Quotients calculés depuis le moteur (dégâts d'une tour = base × (1 + 0,6 × (niveau − 1)) × bonus d'arsenal × (1 + 0,025 × jauge Garde) ; points de vie d'une troupe d'assaut = base × (pv + 0,07 × vague) × assaut), ceux qui sont à moins de 4 % d'un entier et qui comptent dans les premières vagues :

- **Ligne 0 (gardien de S1-S2)** : archers de niveau 1 (1,3) contre la piétaille (10,4 pv) : **8,000 exactement** ; archers de niveau 2 (2,08) : 5,000 / 8,000 / 16,000 / 34,000 contre piétaille, cavaliers, hommes d'armes, champion. Pile sur le palier : la moindre hausse de `RIVAL[0].assaut` (5,2) ajouterait un coup à chaque troupe. Baisse possible jusqu'à 4,55 sans changement. À ne jamais monter d'un centième sans remesurer.
- **Ligne 1 avec l'arsenal 0 (embuscade de S1-S2)** : archers de niveau 1 contre cavaliers à la 2e vague 14,991 → 15 coups ; contre hommes d'armes 29,982 → 30. Juste sous l'entier : une hausse de 0,1 % des points de vie adverses coûterait un coup de plus.
- **Ligne 2 avec l'arsenal 2 (gardien de S6-S8, Grand Gardien de S8)** : baliste de niveau 1 (6,05) contre cavaliers à la 2e vague 2,991 → 3 ; contre hommes d'armes 5,982 → 6 ; à la 3e vague, piétaille 2,020 → 3 et, baliste de niveau 2, hommes d'armes 4,040 → 5. Des deux côtés du palier.
- **Ligne 3 avec l'arsenal 2 (embuscade de S6-S8)** : archers de niveau 1 (1,43) contre la piétaille 11,014 → 12 (à 0,13 % de 11) ; contre cavaliers à la 2e vague 18,993 → 19 ; baliste contre hommes d'armes à la 2e vague 8,979 → 9. Le réglage le plus exposé.
- Attaque (escarmouche) : mêmes couples ligne / arsenal que la campagne, mêmes paliers qu'elle (fantassins en 12 flèches aux lignes 1 à 3, 6 à la ligne 4).

Essais au simulateur (80 graines, p 0,6 / 0,7 / 0,9 ; `--regle` sur le moteur chargé, moteur sur disque intact) : dégâts de toutes tes tours × 0,975 et × 1,025, soit **un cran de la jauge Garde en moins ou en plus** par rapport à la rangée PROGRESSION supposée ; points de vie d'assaut du rival + 1 % ; tirs 0,72 au lieu de 0,7.

| Nœud | Tenue mesurée | Tours × 0,975 | Tours × 1,025 | Autre |
|---|---|---|---|---|
| Gardien S1-S2, ligne 0, Gué | 62 / 80 / 98 % | 62 / 80 / 98 % | 62 / 80 / 98 % | assaut 5,25 : 62 / 80 / 98 % |
| Gardien S1-S2, ligne 0, Forêt | 45 / 68 / 96 % | 45 / 68 / 96 % | 45 / 68 / 96 % | |
| Embuscade S1-S2, ligne 1, arsenal 0, Gué | 49 / 70 / 97 % | 49 / 70 / 97 % | 49 / 70 / 97 % | |
| Embuscade S6-S8, ligne 3, arsenal 2, Gué | 76 / 87 / 97 % | **73 / 83 / 97 %** | 76 / 87 / 97 % | |
| Gardien S6-S8, ligne 2, Gué | 99 / 100 / 100 % | 99 / 100 / 100 % | | |
| Grand Gardien S3, ligne 1, Gué | 51 / 71 / 96 % | 51 / 71 / 96 % | 53 / 73 / 96 % | |
| Grand Gardien S8, ligne 2, Gué | 83 / 87 / 99 % | 83 / 86 / 99 % | **87 / 92 / 99 %** | assaut 2,63 : 83 / 87 / 99 % |
| Escarmouche S3 et S9, lignes 1 et 3, Gué (éclatante) | 61 % ; 68 % | | | tirs 0,72 : 61 % ; 68 % |

Verdict : **aucun réglage recommandé ne bascule pour un cran de jauge.** Les paliers exacts de la ligne 0 ne mordent pas (un coup de plus par troupe à assaut 5,25 : tenue inchangée à l'unité, les murs non plus). Deux réglages bougent un peu, dans le bruit : l'**embuscade de S6-S8** perd 3 à 4 points si l'élève a une jauge Garde de 3 au lieu de 4 (cavaliers en 20 coups au lieu de 19, hommes d'armes en 10 au lieu de 9) ; le **Grand Gardien de S8** gagne 5 points avec une jauge de 5 (les troupes de la 3e vague tombent une balistade plus tôt). Les deux vont dans le sens « plus l'élève a bâti, plus c'est facile », qui est voulu. Ce qui reste vrai, et que le jour 0 ne dit pas : la route joue avec **les jauges réelles de l'élève**, pas celles de PROGRESSION ; chaque chiffre de ce document est un point, pas une courbe, et un élève qui a monté sa Garde à 8 en novembre trouvera le gardien de S1 à la ligne 0 plus doux que 80 %. Le levier `difficulte` restera à portée de Romain pour ça. Si l'étape 2 touche à la table RIVAL ou à une table fine par semaine : remesurer à chaque changement d'« assaut », de « pv » ou de « tirs », en commençant par la ligne 0 (8,000) et la ligne 3 avec l'arsenal 2 (11,014).

### V7. Bloc de décisions confirmé (chiffres finals)

Tout le bloc du jour 0 est confirmé, à deux lignes près (les cibles d'expédition S6 → S8, V3 point 5).

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
cible 17.3 expédition S6 → S8, p 0,7, 3 vivres = 65 à 85 % (déduite des cibles par nœud ; mesuré 99,6 % : non atteinte au MVP)
cible 17.3 expédition S6 → S8, p 0,6, 3 vivres = ≥ 35 % (inchangée ; mesuré 99 %)
référence des batailles de campagne = atelier/mesures/avant-expedition.json (0 écart exigé ; vérifié le 24/10 : +0 % sur 20 cases)
```

### V8. Cibles non atteintes et levier recommandé

1. **Embuscade, gardien, Grand Gardien et expédition de S6 → S8 : trop faciles** (87 à 93 %, 100 %, 87 %, 99,6 % contre 68 à 80, 68 à 80, 50 à 62, 55 à 70 %). Aucun levier du MVP ne les ramène dans la fourchette sans casser autre chose : `difficulte: +1` met le Grand Gardien de S8 à la ligne 3 avec l'arsenal 2 (20 % sur le Gué) ; `vivres: 2` laisse l'expédition à 97 % ; la solidité des camps ne change pas la tenue. Le seul réglage du MVP qui rapproche le Grand Gardien de sa cible est **4 vagues à la ligne de la semaine** (78 % sur le Gué, 75 % sur le domaine, au lieu de 87 %), au prix de 12 questions au lieu de 9 : à proposer à Romain, pas à décider ici. Levier recommandé pour l'étape 2 : la table fine par semaine (cahier 7.1), d'abord le **gardien de S6 à S8 à la ligne 3** (87 à 93 % à deux vagues, mesuré), puis `garnisonPlus: 1` ou `toursDepartPlus: 1` sur le Grand Gardien de S6 à S12, à mesurer ; l'embuscade de S6-S8 suivra. Livrer le MVP tel quel, en le disant à Romain : de S6 à S8, l'expédition se gagne presque toujours, la tension vient des portes doublées et des gardiens retentés.
2. **Embuscade de S1-S2 : 70 % pour 75 à 85 %**, 49 % pour 58 à 70 % à p 0,6. Limite à p 0,7, manquée à p 0,6. Levier : embuscade à la ligne 0 en S1-S2 (80 % sur le Gué, mais 68 % sur la Forêt : pas mieux). Rien au MVP ; c'est un choix de l'élève, avec un chemin tranquille garanti (G6).
3. **Gardien de S2 (Forêt) : 68 % pour 75 à 85 %**, 45 % pour 55 à 65 % à p 0,6. Effet de carte (la Forêt est la carte la plus dure à la ligne 0 : 45 / 68 / 96 % contre 62 / 80 / 98 % sur le Gué). Aucun levier au MVP (`difficulte: −1` est plancher à 0). À surveiller sur les premières expéditions réelles : si l'élève bute sur la Forêt, c'est le premier endroit où lever la garnison ou changer la carte de S2.
4. **Escarmouche de S6 → S8 : 54 à 55 % pour 30 à 50 %** et **Grand Gardien de S3 hors du Gué : 78 à 90 % pour 60 à 70 %**. Limite ou trop facile ; même cause, même levier (étape 2).
