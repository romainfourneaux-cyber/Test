# Format des données

Point de départ fixé le 13 octobre 2026, complété au jalon 1 (version 0.1.0 du jeu). Toute évolution se reporte ici dans la même livraison, avec une ligne au journal.

Toutes les données du jeu sont des fichiers .js placés dans jeu/data/. Chacun fait un seul appel à une fonction globale définie dans jeu/js/noyau.js :

```js
JEU.enregistrer("type", objet);
```

Types : config, planning, devoirs, index-cours, a-retravailler, cours, anglais.

## Identifiants

- Matières : histoire, geographie, svt, physique, litterature, lecture, anglais, methode.
- Cours : `<matiere>-s<semaine sur 2 chiffres>-<n>`, par exemple `histoire-s07-1`.
- Séquence d'anglais : `anglais-seq01`. Fiche méthode : `methode-frise`, `methode-graphique`, etc.
- Fiche : `<id cours>-f<n>`. Question : `<id cours>-q<n>`. Bonus : `<id cours>-b<n>`. Schéma : `<id cours>-s<n>`.
- Éléments d'une séquence d'anglais : `<id séquence>-v<n>` (vocabulaire), `-g<n>` (structure), `-p<n>` (phrase). Ils jouent le rôle des fiches pour la répétition espacée, les signalements et le validateur.
- Devoir : `<matiere>-d<n>`, par exemple `histoire-d1`.
- Un identifiant publié ne change plus jamais : la sauvegarde de l'élève en dépend.

## config.js

```js
JEU.enregistrer("config", {
  debutSemaine1: "2026-08-31",  // lundi de la semaine 1
  pauses: [],                   // lundis des semaines sautées, aucune pour l'instant
  avanceMax: null,              // null : le calendrier ne limite pas l'avance
  semaineDepart: 7,             // les cours des semaines 1 à 6 sont présumés acquis
  seuilValidation: 0.75,
  tailleEpreuve: 8,
  seuilBatiment: 0.70,
  leitnerJours: [1, 2, 4, 8, 16],
  usureBatiments: false,
  son: true
});
```

## planning.js

```js
JEU.enregistrer("planning", [
  { id: "histoire-s01-1", matiere: "histoire", semaine: 1, ordre: 1,
    titre: "Cours 1 : l'Empire byzantin au temps de Justinien",
    type: "cours",              // cours | revision | devoir
    jour: "lundi",              // jour de l'emploi du temps
    livret: "", chapitre: "", pages: "", ere: 1 }
]);
```

- Chaque entrée de l'emploi du temps pour une matière du jeu reçoit un identifiant. `<n>` numérote toutes les entrées d'une matière dans la semaine, types confondus, dans l'ordre de l'emploi du temps (lundi, mardi, jeudi, vendredi). Un même cours étalé sur deux semaines donne deux entrées.
- type cours : tout ce qui apporte du contenu à apprendre (séance, cours, leçon, dossier, étude de cas, étude de document, outil, présentation d'une œuvre, pages ou chapitres de lecture suivie). Épreuve à la validation.
- type revision : révisions, tests et devoirs d'entraînement en autocorrection, cartes mentales, séances d'exercices, « Teste tes connaissances », quiz du livre, préparation d'une fiche de lecture. Se coche sans épreuve.
- type devoir : devoirs notés et fiches de lecture à envoyer. Renvoie au siège.
- Seules les entrées de type cours comptent pour le déblocage : revision et devoir ne bloquent jamais la suite.
- ordre : rang dans la matière, toutes entrées confondues.
- ere : numéro d'ère, pour l'histoire seulement.
- Généré par `node atelier/outils/generer-planning.js` à partir de `atelier/extractions/Emploi du temps - entrees par matiere.json` (lui-même tiré du PDF par les deux scripts Python de atelier/outils/). Les titres reprennent l'emploi du temps, raccourcis. Une entrée qui mêle contenu et devoir (« lire le dossier… puis commencer le devoir ») est de type cours ; une carte mentale suivie d'un début de devoir est de type devoir.
- L'anglais et les fiches méthode ne sont pas dans le planning : les séquences s'ordonnent par leur champ ordre, les fiches méthode sont ouvertes d'emblée.

## devoirs.js

```js
JEU.enregistrer("devoirs", [
  { id: "histoire-d1", matiere: "histoire", semaine: 10,
    intitule: "Histoire, devoir 1",
    perimetre: ["histoire-s01-1", "histoire-s01-2"] }
]);
```

Aucun autre champ, aucun texte tiré du devoir. La date d'envoi est saisie par l'élève et vit dans la sauvegarde.

- semaine : celle du plan des devoirs, même quand l'emploi du temps étale le devoir sur deux semaines (11 pour Géo 2, 24 pour Géo 4, 26 pour Hist. 4).
- Anglais : `perimetre: []` tant que Romain n'a pas confirmé quelles séquences le devoir couvre. Un périmètre vide garde le siège fermé.

## index-cours.js

```js
JEU.enregistrer("index-cours", ["methode-frise", "physique-s01-1", "anglais-seq01"]);
```

La liste des fichiers de cours et de séquences présents. Le chargeur ne charge que ceux-là ; /traiter la tient à jour.

## a-retravailler.js

```js
JEU.enregistrer("a-retravailler", ["svt-s03-1-f2"]);
```

Identifiants de fiches repérées dans les corrigés. Rien d'autre.

## cours/<id>.js

```js
JEU.enregistrer("cours", {
  id: "physique-s01-1",
  fiches: [
    { id: "physique-s01-1-f1", notion: "Les trois états de la matière",
      titre: "...", texte: "... (60 mots au plus, reformulé)",
      pointsCles: ["..."],
      dates: [{ annee: 800, evenement: "..." }],   // sert aux frises fabriquées par le jeu
      lieux: [], personnages: [],
      astuce: "...",            // facultatif : moyen de retenir (fiche de mémorisation)
      vocabulaire: [{ mot: "...", def: "..." }],
      schema: null,             // ou l'identifiant d'un schéma ci-dessous
      prerequis: [],            // identifiants de fiches
      source: { fichier: "cours/physique-chimie/Livret 1.pdf", page: 7 } }
  ],
  schemas: [
    { id: "physique-s01-1-s1", legende: "...", svg: "<svg viewBox='0 0 400 300'>...</svg>",
      zones: [{ id: "a", x: 120, y: 40 }] }
  ],
  questions: [
    { id: "physique-s01-1-q1", fiche: "physique-s01-1-f1", type: "qcm", niveau: 1,
      enonce: "...", choix: ["...", "...", "...", "..."],
      r: "<réponse brouillée>",
      explication: "Deux phrases au plus.", indice: "...", poids: 1,
      source: { fichier: "cours/physique-chimie/Livret 1.pdf", page: 7 } }
  ],
  bonus: [
    { id: "physique-s01-1-b1", fiche: "physique-s01-1-f1", titre: "...", texte: "...",
      source: { titre: "...", editeur: "...", url: "..." } }
  ],
  nonCouvert: ["..."]
});
```

Les fichiers de fiches méthode (cours/methode-<nom>.js) ont le même format, avec en plus `matiere` et `titre`, puisqu'ils ne figurent pas dans le planning. Ils se valident par une épreuve, comme un cours. Rattachement par défaut : section 3 du cahier des charges.

### Champs propres à chaque type de question

| Type | Champs visibles | Contenu de r, avant brouillage |
|---|---|---|
| qcm | choix (4) | texte du bon choix |
| qcm_multiple | choix (4 à 6) | liste des bons choix |
| vrai_faux | enonce, corrections (2 ou 3) | { vrai: true/false, correction: "..." } |
| association | gauche, droite (mélangées) | paires d'indices |
| ordre | elements (mélangés) | ordre juste, en indices |
| trou | texte avec ___, banque (niveau 1) | mots attendus, variantes admises |
| legende_schema | schema, etiquettes | { idZone: étiquette } |
| clic_carte | consigne | code ISO A3 de Natural Earth |
| calcul_etapes | etapes (consignes) | valeurs attendues et tolérance |

Brouillage : `r = JEU.brouiller(JSON.stringify(reponse))`. La même fonction existe dans atelier/outils/brouillage.js (fichier identique, vérifié par le validateur).

Champs facultatifs d'une question : `indice` (le mentor le donne sur demande), `poids` (dégâts dans l'Assaut, 1 par défaut). Pour vrai_faux, `corrections` est vide quand l'affirmation est vraie. Pour trou, chaque élément de r est une liste de variantes admises ; la comparaison ignore la casse et les accents.

Types jouables au jalon 1 : qcm, qcm_multiple, vrai_faux, association, ordre, trou. Les autres (legende_schema, clic_carte, calcul_etapes) sont reconnus par le validateur et seront joués aux jalons 2 et 4.

### Sources en clair et compilation

On n'écrit pas les fichiers de jeu/data/cours à la main. Chaque cours a une source en clair, `atelier/contenu/<id>.js` (`module.exports = {...}`), où chaque question porte sa réponse en clair dans `reponse`. `node atelier/outils/compiler-cours.js [id]` produit `jeu/data/cours/<id>.js` (ou `jeu/data/anglais/<id>.js`) avec `r` brouillé. Ne pas oublier ensuite index-cours.js et le validateur.

### Variantes fabriquées par le jeu

À partir des fiches, le jeu fabrique : un QCM « Que veut dire… ? » par mot de vocabulaire (leurres pris dans le même cours puis la même matière, il en faut 3), des associations mot-définition (4 paires) et une frise à ordonner si le cours a au moins 3 dates. Leurs identifiants (`<fiche>-gv<n>`, `<cours>-ga<n>`, `<cours>-gf1`) ne sont pas publiés dans les données.

## anglais/<id>.js

```js
JEU.enregistrer("anglais", {
  id: "anglais-seq01", ordre: 1, titre: "...",
  vocabulaire: [{ id: "anglais-seq01-v1", en: "...", fr: "...", exemple: "...",
                  source: { fichier: "cours/anglais/...", page: 1 } }],
  structures: [{ id: "anglais-seq01-g1", regle: "...", exemples: ["..."], source: {} }],
  phrases: [{ id: "anglais-seq01-p1", en: "...", fr: "...", source: {} }],
  questions: [], bonus: [], nonCouvert: []
});
```

Dans une séquence d'anglais, le champ `fiche` d'une question ou d'un bonus contient l'identifiant d'un élément (v, g ou p).

## Sauvegarde (localStorage, clé jeu5e)

Schéma actuel : 2. Le schéma 1 est celui ci-dessous sans les trois derniers champs ; la migration 1 → 2 les ajoute sans rien retirer (testée par atelier/outils/tests.js).

```js
{
  schema: 2,
  creeLe: "2026-10-13T18:00:00", majLe: "...",
  cours: { "histoire-s01-1": { etat: "valide", le: "...", score: 0.875 } },  // presume | ouvert | valide
  notions: { "histoire-s01-1-f1": { boite: 1, vue: "...", ok: 3, ko: 1 } },
  ressources: { sceaux: 0, routes: 0, remedes: 0, alambics: 0, parchemins: 0, alliances: 0 },
  batiments: [],
  devoirs: { "histoire-d1": { envoye: "2026-11-06" } },
  signalements: [{ le: "...", question: "physique-s01-1-q1",
                   motif: "reponse",   // reponse | clarte | pas-dans-mon-cours | autre
                   texte: "..." }],
  dernierExport: "...",
  // schéma 2
  reglages: { son: true, nomDomaine: "Le domaine" },
  stats: { bonnes: 0, total: 0, parties: 0 },
  questionsVues: { "physique-s01-1-q1": 2 }      // pour varier les questions
}
```

- cours[id].etat : valide, ou fait pour une entrée de révision cochée. « presume », « ouvert », « avenir » (fichier absent) et « brume » sont calculés, jamais enregistrés.
- notions[idFiche].boite : boîte Leitner de 1 à 5 ; une bonne réponse fait monter d'une boîte, une erreur ramène en boîte 1.

Export : fichier `sauvegarde-jeu5e-AAAA-MM-JJ.json`. Import : remplace la partie en cours, après confirmation.

## Fichiers de l'atelier

- registre.json : `[{ chemin, taille, modifieLe, traiteLe, type, cours: [ids], extraction }]`. type : planning, methode, cours, enonce, corrige, sauvegarde. extraction : nom du fichier dans extractions/. Pour un énoncé de devoir, cours contient l'identifiant du devoir (contrôle 9).
- index-notions.json : `[{ id, matiere, semaine, cours, notion, prerequis }]` (semaine 0 pour les savoir-faire).
- contenu/<id>.js : sources en clair des cours (voir plus haut).
- extractions/*.txt : texte intégral, mot pour mot, des fichiers lus (sans le nom de l'élève, de sa famille ou d'un correcteur, ni numéro de sécurité sociale), pour ne pas les relire et pour l'anti-recopie et l'anti-spoil.
- devoirs/<id>.md : notions évaluées, notions à retravailler. Ni nom de l'élève ou du correcteur, ni numéro.
- relectures/ : fiches HTML et derniere.txt (date de la dernière relecture).
- outils/ : valider.js et controles.js (validateur), validateur.html, brouillage.js, tests.js (logique), perf.js (essai de bout en bout et mesure de vitesse, demande Playwright), compiler-cours.js, generer-planning.js, generer-sons.js, scripts Python d'extraction de l'emploi du temps.
- versions/ : copies datées de jeu/ si git n'est pas installé.

## Contrôles du validateur

1. Chaque fichier de jeu/data se charge sans erreur.
2. Identifiants uniques et au bon format.
3. Chaque cours de index-cours.js existe dans planning.js (sauf anglais et méthodes) ; semaines comprises entre 1 et 34.
4. Chaque question : type connu, fiche (ou élément d'anglais) existante, source présente, explication de deux phrases au plus, bonne réponse présente parmi les choix une fois débrouillée, pas de choix en double. Au moins une vrai_faux par notion.
5. Chaque fiche : source (fichier et page), prérequis existants, pris dans un cours antérieur ou le même cours.
6. Bonus : source présente ; jamais utilisés par une épreuve, un siège ou un boss.
7. devoirs.js : seulement les champs autorisés ; périmètres valides.
8. Node seulement, anti-recopie : aucune suite de 12 mots identique entre les cours du jeu (jeu/data/cours et jeu/data/anglais) et atelier/extractions. Le planning, qui reprend les titres de l'emploi du temps, n'est pas concerné.
9. Node seulement, anti-spoil : aucune suite de 8 mots et aucun nombre propre au devoir communs à l'énoncé et aux questions de son périmètre.

Contrôles ajoutés : brouillage identique côté jeu et atelier ; ALERTE si une fiche a moins de trois questions écrites, aucune question en « pourquoi » ou « comment », ou un texte de plus de 60 mots ; ERREUR si une question vise une fiche d'un autre cours.

Sortie : une liste ERREUR et ALERTE, avec un code de sortie non nul s'il y a au moins une erreur.
