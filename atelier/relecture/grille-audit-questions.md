# Grille d'audit des questions (25/10/2026)

Demande de Romain, le 25/10/2026 : « Il y a des questions un peu bizarres, qui n'ont pas trop de sens. Si tu ne trouves pas de quoi faire la question par rapport au cours, fais des questions qui ont un rapport avec le thème. »

But de l'audit : relire toutes les questions d'une matière, retirer les questions bizarres, et, quand le cours déposé est trop mince pour une vraie question, les remplacer par une question de thème (règle du 25/10/2026 dans CLAUDE.md, format dans docs/FORMAT_DONNEES.md, « Questions de thème » et contrôle 11).

## 1. Ce qu'est une question bizarre (catégories)

Code à mettre dans le champ `categorie` du fichier d'audit. Un exemple trouvé dans le jeu pour chacune.

| Code | Catégorie | Exemple |
|---|---|---|
| `document` | Question sur le document du livret, pas sur le savoir | « Dans quel pays se trouve le dispensaire de brousse décrit par l'infirmière ? », « Que sépare la ligne tracée sur la carte ? », « … selon le corrigé » |
| `experience` | Déroulé d'une manipulation du livret récité par cœur | « Dans la première partie de l'expérience, on chauffe… » |
| `arithmetique` | Calcul sur une frise ou sur des dates | « Pendant combien d'années Louis IX règne-t-il ? » |
| `trivia` | Détail trop précis tiré d'une liste de vocabulaire ou d'une légende | « Quelle taille le loup arctique atteint-il au maximum ? » |
| `distracteurs` | Leurres absurdes ou enfantins | « Exactement 5 % », « Le temps s'arrête de s'écouler », « Un type de nuage » |
| `consigne` | Consigne d'exercice transformée en question | « Respecter le nombre de lignes demandé » |
| `comparaison` | Comparaison forcée entre deux notions sans rapport | « Un grand comté est un territoire plus petit qu'une tenure » |
| `sans-document` | Énoncé qui suppose le document sous les yeux | « ce passage », « ce graphique », « cette carte », « le texte » |
| `trou-sans-contexte` | Texte à trou qu'on ne peut deviner sans le livret | « Le ___ est la ___ du ___. » |
| `doublon` | Quasi-doublon d'une autre question du cours (même fait, même réponse) | deux QCM sur la date du partage de 395 |
| `lecture-spoil` | Lecture suivie : révèle la suite ou la fin du livre | « Que devient le capitaine au dernier chapitre ? » |
| `lecture-zoologie` | Lecture suivie : détail de zoologie ou de géographie sans rapport avec la compréhension du livre | taille, poids ou régime d'un animal croisé dans le récit |
| `autre` | Autre chose qui n'a pas de sens pour un élève de 13 ans (à expliquer dans `raison`) | |

Pour repérer vite : `node atelier/outils/lister-questions.js <matière> --suspects` ne liste que les questions qui ressemblent à une de ces catégories, avec la catégorie devinée. C'est un filet, pas un verdict : il rate des cas et en signale de bons.

## 2. Ce qu'est une bonne question

Elle demande ce qu'un élève de 5e doit savoir et comprendre du thème :
- le sens d'une notion, une définition avec ses mots ;
- une cause et sa conséquence, le pourquoi et le comment ;
- une comparaison entre deux notions du cours qui se confondent vraiment ;
- une date ou un événement central, un personnage ou un lieu clé ;
- un exemple juste parmi des exemples faux.

Ses leurres sont plausibles : des notions du même thème qu'on peut confondre, jamais des absurdités. On peut y répondre sans le livret sous les yeux. Elle ne recoupe aucun devoir (anti-spoil), ne recopie aucune phrase d'une source, reste neutre sur les conflits, ne pose aucune question de religion (le cours sur l'islam reste sur les faits politiques, géographiques et culturels), n'invente aucun nom.

## 3. Les quatre verdicts

Valeur exacte du champ `verdict` :

| Verdict | Quand |
|---|---|
| `garder` | La question est bonne, ou passable avec une retouche de forme (une faute, un leurre à changer). La retouche se note dans `piste`. |
| `reecrire-fiche` | Le fait est bon mais la question est mal posée (catégorie `sans-document`, `consigne`, `distracteurs`, `comparaison`, `trou-sans-contexte`). On la réécrit à partir de la fiche, même id si la fiche et la famille de type ne changent pas. |
| `question-theme` | La fiche ne donne pas de quoi faire une vraie question (cours mince, document seul, liste de vocabulaire). On la remplace par une question de thème sur la même fiche. |
| `supprimer` | Rien à sauver et la fiche a déjà assez de bonnes questions (au moins 3, dont une vrai_faux) ; sinon, préférer `question-theme`. Un `doublon` se supprime quand l'autre question est gardée. |

Garde-fous du validateur à connaître avant de supprimer : ERREUR s'il ne reste aucune vrai_faux pour une notion, ALERTE si une fiche a moins de trois questions ou aucune question en « pourquoi » ou « comment ».

## 4. À quoi doit ressembler une question de remplacement

- Même champs qu'une autre question : `id`, `fiche`, `type`, `niveau` (1 à 3), `enonce`, les champs du type (`choix`, `corrections`, `gauche`/`droite`, `elements`, `texte`/`banque`), `reponse` en clair, `explication` (deux phrases au plus), `indice`, `poids` 1, `source`.
- Réécrite depuis la fiche : `source: { fichier, page }` de la fiche, comme avant.
- Question de thème : `source: { theme, titre, editeur, url }`, sans `fichier` ni `page`. `theme` = l'intitulé du cours tel que le planning le nomme (jeu/data/planning.js, docs/PROGRAMME_5E.md ; pour une fiche méthode, un cours de langue ou une séquence d'anglais, le `titre` du cours). Le fait est vérifié dans la page citée ; il ne contredit jamais le cours déposé ; il est au niveau du programme officiel de 5e.
- Vocabulaire d'un élève de 13 ans, phrases courtes. Quatre choix pour un QCM, dont trois leurres plausibles du même thème. Pour une vrai_faux fausse, deux ou trois corrections proposées, dont la bonne.
- Aucune phrase recopiée d'une source (le validateur compare douze mots d'affilée aux extractions ; pour une page en ligne, reformule de toute façon).
- Anti-spoil : relis atelier/devoirs/<devoir>.md et les entrées `enonce` / `corrige` de atelier/registre.json du périmètre du cours ; aucune question ne reprend une tournure de huit mots ni un nombre propre à un devoir.
- Identifiants : une question remplacée garde son id si elle garde sa fiche et sa famille de type ; un id supprimé n'est jamais réutilisé ; une question nouvelle prend le numéro libre suivant du cours. Familles de type : (qcm, qcm_multiple), (vrai_faux), (association, ordre), (trou), (legende_schema, clic_carte, calcul_etapes).
- Les fiches ne bougent pas (atelier/index-notions.json : ne renumérote rien). Une question de thème vise toujours une fiche existante du cours.

## 5. Le fichier d'audit

Un fichier par matière : `atelier/relecture/audit-questions-<matiere>.json` (matiere : histoire, geographie, svt, physique, litterature, lecture, langue, anglais, methode). Une liste, une entrée par question relue qui n'est pas simplement gardée telle quelle (les `garder` sans retouche peuvent être omis ; les `garder` avec retouche sont notés).

```json
[
  { "id": "histoire-s05-1-q12", "cours": "histoire-s05-1", "fiche": "histoire-s05-1-f2",
    "verdict": "question-theme", "categorie": "document",
    "raison": "La question demande ce que montre la gravure du livret, pas ce qu'est une tenure.",
    "piste": "Vrai/faux : « Le paysan qui tient une tenure la cultive pour lui et verse des redevances au seigneur » ; source Vikidia, article Seigneurie." },
  { "id": "lecture-s03-1-q7", "cours": "lecture-s03-1", "fiche": "lecture-s03-1-f1",
    "verdict": "supprimer", "categorie": "lecture-zoologie",
    "raison": "La taille de l'ours blanc n'aide pas à comprendre le livre ; la fiche garde cinq bonnes questions.", "piste": "" }
]
```

Champs : `id` (question), `cours`, `fiche`, `verdict` (section 3), `categorie` (section 1, ou `""` pour un `garder`), `raison` (une ou deux phrases), `piste` (ce que devient la question : énoncé proposé, source envisagée, ou vide).

Cours trop mince : si un cours ne permet pas de rester sous la moitié de questions de thème, l'audit le dit noir sur blanc par une entrée de cours, en plus des entrées de questions : `{ "id": "<id du cours>", "cours": "<id du cours>", "fiche": null, "verdict": "cours-mince", "categorie": "cours-mince", "raison": "pourquoi le cours déposé ne suffit pas", "piste": "part visée, par exemple 8 questions de thème sur 12" }`. C'est la seule entrée qui sort des quatre verdicts. Le validateur garde son ALERTE [11] sur ce cours ; elle est notée au journal.

## 6. Sources admises pour une question de thème

fr.wikipedia.org, fr.vikidia.org, lumni.fr, larousse.fr, bnf.fr (gallica, classes, essentiels), eduscol et education.gouv.fr, ou le site d'un musée ou d'une institution scientifique (Louvre, musée de Cluny, Versailles, Muséum, Cité des sciences, CNRS, CNES, Météo-France, IGN, INSEE, INED, ONU, UNESCO, OMS, Met, British Museum, NASA, ESA). Toujours une page précise, pas une page d'accueil. Un fait pris sur une autre adresse déclenche une ALERTE du validateur : garde-la seulement si c'est vraiment une encyclopédie, une institution ou un musée, et dis-le dans `raison`.

Notation : `source: { theme: "Cours 7 – La seigneurie", titre: "Seigneurie", editeur: "Vikidia", url: "https://fr.vikidia.org/wiki/Seigneurie" }`.

## 7. Plafond par cours

Au plus la moitié des questions d'un cours sont des questions de thème (le validateur compte et alerte au-delà : `[11] <cours> : n questions de thème sur N`). Au-delà seulement pour un cours trop mince, dit tel par l'audit (section 5). Un bonus reste un bonus (fiche à part, jamais en bataille) ; une question de thème, elle, se joue partout.

## 8. Déroulé et commandes

1. Lire tout : `node atelier/outils/lister-questions.js histoire > /tmp/histoire.txt` (un bloc par question : thème, fiche, type, source, énoncé, choix, réponse, explication). Filtres : `--suspects` (filet des catégories), `--theme` (seulement les questions de thème). Préfixe possible : une matière, un identifiant de cours, ou `tout`.
2. Écrire `atelier/relecture/audit-questions-<matiere>.json` (section 5).
3. Appliquer dans `atelier/contenu/<cours>.js` (réponses en clair), puis compiler : `node atelier/outils/compiler-cours.js <cours>`.
4. Vérifier : `node atelier/outils/valider.js` (0 erreur ; les 5 alertes « [5] source absente » des PDF de géographie sont connues), `node atelier/outils/tests.js`, `node atelier/outils/mesurer-tirage.js --familles`.
5. Journal : une ligne dans docs/JOURNAL.md (date, fichiers, cours, nombre de questions gardées, réécrites, remplacées, supprimées). Les questions de thème sont listées à Romain dans la fiche de relecture suivante (`lister-questions.js <matière> --theme`).

Ne jamais toucher DEPOT/. Ne pas changer jeu/VERSION.txt ni JEU.version. Pas de nom d'élève, de famille ou de correcteur nulle part.
