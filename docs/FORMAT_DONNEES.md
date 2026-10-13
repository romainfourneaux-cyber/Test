# Format des données

Point de départ fixé le 13 octobre 2026, complété au jalon 1 (version 0.1.0 du jeu), mis à jour pour la version 0.5.0 (suivi.js, sauvegarde au schéma 3, épreuve de validation retirée). Toute évolution se reporte ici dans la même livraison, avec une ligne au journal.

Toutes les données du jeu sont des fichiers .js placés dans jeu/data/. Chacun fait un seul appel à une fonction globale définie dans jeu/js/noyau.js :

```js
JEU.enregistrer("type", objet);
```

Types : config, planning, devoirs, index-cours, a-retravailler, suivi, cours, anglais.

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
  seuilBatiment: 0.70,
  leitnerJours: [1, 2, 4, 8, 16],
  usureBatiments: false,
  son: true
});
```

seuilValidation et tailleEpreuve ont disparu en 0.5.0 avec l'épreuve de validation : plus rien ne les lisait. avanceMax et usureBatiments ne sont pas encore lus par le jeu ; ils gardent leur valeur par défaut (pas de limite, pas d'usure).

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
- type cours : tout ce qui apporte du contenu à apprendre (séance, cours, leçon, dossier, étude de cas, étude de document, outil, présentation d'une œuvre, pages ou chapitres de lecture suivie). S'ouvre dès que son fichier existe ; son état (acquis ou à revoir) vient de suivi.js.
- type revision : révisions, tests et devoirs d'entraînement en autocorrection, cartes mentales, séances d'exercices, « Teste tes connaissances », quiz du livre, préparation d'une fiche de lecture. Affichée pour information.
- type devoir : devoirs notés et fiches de lecture à envoyer. Affichée pour information ; le siège correspondant viendra au jalon 2.
- Seules les entrées de type cours reçoivent un fichier de cours et un état de suivi ; revision et devoir ne bloquent rien.
- ordre : rang dans la matière, toutes entrées confondues.
- ere : numéro d'ère, pour l'histoire seulement.
- Généré par `node atelier/outils/generer-planning.js` à partir de `atelier/extractions/Emploi du temps - entrees par matiere.json` (lui-même tiré du PDF par les deux scripts Python de atelier/outils/). Les titres reprennent l'emploi du temps, raccourcis. Une entrée qui mêle contenu et devoir (« lire le dossier… puis commencer le devoir ») est de type cours ; une carte mentale suivie d'un début de devoir est de type devoir.
- L'anglais et les fiches méthode ne sont pas dans le planning : les séquences s'ordonnent par leur champ ordre ; séquences et fiches méthode s'ouvrent dès que leur fichier existe.

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

- Sert à cibler une fiche précise, même dans un cours acquis. S'ajoute aux fiches des cours « a-revoir » de suivi.js : les unes et les autres comptent comme à revoir dans le tirage des questions.
- Tenu par Claude (/traiter) d'après les devoirs corrigés : sans doublon ; une fiche qu'un corrigé plus récent montre réussie en sort.

## suivi.js

```js
JEU.enregistrer("suivi", {
  majLe: "2026-11-20",          // date de la dernière mise à jour
  cours: {
    "histoire-s07-2": { etat: "acquis", source: "histoire-d1", le: "2026-11-20" },
    "histoire-s08-1": { etat: "a-revoir", note: "Revois ce qui distingue le domaine royal des grands fiefs.",
                        source: "histoire-d1", le: "2026-11-20" }
  }
});
```

L'estimation de chaque cours d'après les devoirs corrigés. Il n'y a plus d'épreuve dans le jeu depuis la 0.5.0 : c'est ce fichier qui fait passer un cours « acquis » ou « à revoir ».

- Tenu par Claude (commande /traiter), jamais écrit par le jeu. Romain relit chaque estimation nouvelle ou changée dans la fiche de /relecture.
- Base : un devoir corrigé de l'élève (note, remarques du correcteur ou copie annotée). Un corrigé type seul ne dit rien de l'élève : pas d'estimation, on demande ses remarques à Romain.
- Clé : identifiant d'une entrée de type cours du planning, d'une séquence d'anglais (`anglais-seqNN`) ou d'une fiche méthode (`methode-<nom>`). Jamais une révision ni un devoir (ERREUR).
- etat : `"acquis"` (rien de raté dans ce cours) ou `"a-revoir"` (au moins une notion ratée ou fragile). Tout autre état : ERREUR.
- note : facultative, 20 mots au plus (ALERTE au-delà), écrite pour l'élève avec les mots du cours : elle s'affiche dans la liste des cours, à côté de « À revoir ». Elle ne contient jamais d'énoncé, de document, d'exemple, de chiffre, de réponse attendue ou de note du devoir, ni le nom de l'élève, de sa famille ou d'un correcteur. Le validateur alerte sur un chiffre ou un mot comme « M. », « Mme », « correcteur », et passe la note à l'anti-recopie et à l'anti-spoil (contrôles 8 et 9).
- source : l'identifiant du devoir corrigé dans devoirs.js (ERREUR s'il est absent ou inconnu ; ALERTE si le cours n'est pas dans le périmètre de ce devoir). Pour un document corrigé qui n'a pas d'identifiant (un devoir d'entraînement, par exemple) : le chemin du fichier relatif à DEPOT/, qui doit exister (ERREUR sinon). Si ce nom de fichier contient un nom de personne, on demande à Romain de le redéposer sous un autre nom.
- le : date de l'estimation (AAAA-MM-JJ ; ALERTE si elle manque). /relecture s'en sert pour retrouver les estimations nouvelles.
- Un corrigé plus récent remplace l'estimation du même cours : on réécrit l'entrée entière, et on met majLe à jour. Retirer une entrée rend au cours son état calculé (ouvert, présumé acquis…).
- Dans le jeu (jeu/js/progression.js), suivi.js passe avant tout autre état, présumé acquis compris. Toutes les fiches d'un cours « a-revoir » (les éléments, pour une séquence d'anglais) comptent comme à revoir dans le tirage.

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

Les fichiers de fiches méthode (cours/methode-<nom>.js) ont le même format, avec en plus `matiere` et `titre`, puisqu'ils ne figurent pas dans le planning. Ils s'ouvrent dès que leur fichier existe, sans épreuve ; leur état vient de suivi.js, comme pour un cours. Rattachement par défaut : section 3 du cahier des charges.

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

Champs facultatifs d'une question : `indice` (le mentor le donne sur demande), `poids` (1 par défaut ; plus lu par le jeu depuis la 0.5.0, il réglait les dégâts de l'ancien Assaut). Pour vrai_faux, `corrections` est vide quand l'affirmation est vraie. Pour trou, chaque élément de r est une liste de variantes admises ; la comparaison ignore la casse et les accents.

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

Schéma actuel : 3 (depuis la version 0.5.0). Migrations, testées par atelier/outils/tests.js : 1 → 2 ajoute reglages, stats et questionsVues ; 2 → 3 ajoute campagne (complétée par JEU.campagne.completer) et reglages.musique. Aucune ne retire rien. Une sauvegarde sans numéro est lue comme un schéma 1 ; une sauvegarde d'un schéma plus récent que le jeu est refusée.

```js
{
  schema: 3,
  creeLe: "2026-10-13T18:00:00", majLe: "...",
  cours: { "histoire-s01-1": { etat: "valide", le: "...", score: 0.875 } },  // hérité des épreuves (0.1.0 à 0.4.0), plus écrit
  notions: { "histoire-s01-1-f1": { boite: 1, vue: "...", ok: 3, ko: 1 } },
  ressources: { sceaux: 0, routes: 0, remedes: 0, alambics: 0, parchemins: 0, alliances: 0 },
  batiments: [],
  devoirs: { "histoire-d1": { envoye: "2026-11-06" } },
  signalements: [{ le: "...", question: "physique-s01-1-q1",
                   motif: "reponse",   // reponse | clarte | pas-dans-mon-cours | autre
                   texte: "..." }],
  dernierExport: "...",
  // schéma 2
  reglages: { son: true, musique: true, animations: true, nomDomaine: "Le domaine" },
                                                 // musique : schéma 3 ; animations absent = vrai
  stats: { bonnes: 0, total: 0, parties: 0 },
  questionsVues: { "physique-s01-1-q1": 2 },     // pour varier les questions
  // schéma 3 : la campagne
  campagne: {
    provinces: { "gue": { pv: 16 } },            // solidité restante de chaque place forte adverse (dix provinces)
    conquises: ["gue"],                          // provinces prises, dans l'ordre
    rival: { menace: 0, attaque: false, defaites: 0 },
                                                 // attaque : false, ou l'identifiant du front qui attaque ("angleterre" | "omeyyades")
    arsenal: { tours: { archers: 1, piquiers: 1, baliste: 0, catapulte: 0 },
               troupes: { fantassins: 1, cavaliers: 0, belier: 0 },
               remparts: 0 },                    // niveaux de 0 (à débloquer) à 3 ; remparts de 0 à 3
    royaume: { tresor: 0, peuple: 0, garde: 0, savoir: 0, conseils: 0 },
                                                 // jauges (elles ne baissent jamais) et nombre de conseils tenus
    dernierJour: "2026-10-13",                   // dernier jour de jeu : tributs, menace et événement du jour
    evenement: null,                             // ou { id: "marchands", jour: "2026-10-13", fait: false }
    bonus: {},                                   // { or: 40 } (mercenaires), { espion: true } : pour la prochaine bataille
    chronique: [{ le: "2026-10-13", texte: "..." }]  // vingt faits au plus, le plus récent d'abord
  }
}
```

- cours[id] : plus écrit depuis la 0.5.0. Un ancien « valide » est lu comme acquis. L'état d'un cours est calculé dans cet ordre : suivi.js (acquis, a-revoir), ancien « valide » (acquis), presume (semaine avant semaineDepart), ouvert (fichier présent), avenir (fiche méthode sans fichier), brume. Ces états calculés ne sont jamais enregistrés.
- notions[idFiche].boite : boîte Leitner de 1 à 5 ; une bonne réponse fait monter d'une boîte, une erreur ramène en boîte 1.
- campagne : réparée au chargement par JEU.campagne.completer (une valeur absente ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas).

Export : fichier `sauvegarde-jeu5e-AAAA-MM-JJ.json`. Import : le fichier doit ressembler à une sauvegarde du jeu (creeLe, notions, ressources), sinon il est refusé et la partie en cours ne bouge pas ; après confirmation, il remplace la partie en cours, dont une copie reste dans le navigateur (clé jeu5e-avant-import).

## Fichiers de l'atelier

- registre.json : `[{ chemin, taille, modifieLe, traiteLe, type, cours: [ids], extraction }]`. chemin : relatif à DEPOT/. type : planning, methode, cours, enonce, corrige, sauvegarde. extraction : nom du fichier dans extractions/. Pour un énoncé ou un corrigé de devoir, cours contient l'identifiant du devoir (contrôle 9).
- index-notions.json : `[{ id, matiere, semaine, cours, notion, prerequis }]` (semaine 0 pour les savoir-faire).
- contenu/<id>.js : sources en clair des cours (voir plus haut).
- extractions/*.txt : texte intégral, mot pour mot, des fichiers lus (sans le nom de l'élève, de sa famille ou d'un correcteur, ni numéro de sécurité sociale), pour ne pas les relire et pour l'anti-recopie et l'anti-spoil.
- devoirs/<id>.md : notions évaluées ; si le devoir est corrigé, notions réussies, notions à retravailler et estimation par cours, reportée dans jeu/data/suivi.js. Ni nom de l'élève ou du correcteur, ni numéro.
- relectures/ : fiches HTML et derniere.txt (date de la dernière relecture).
- outils/ : valider.js et controles.js (validateur), validateur.html, brouillage.js, tests.js (logique), perf.js (essai de bout en bout et mesure de vitesse, demande Playwright), compiler-cours.js, generer-planning.js, generer-sons.js, scripts Python d'extraction de l'emploi du temps, extraire-icones.py et icones-choisies.json (icônes Game-icons), generer-textures.py et generer-terrain.py (textures et fond de carte), rendu-3d/ (scripts Blender des images de bataille).
- versions/ : copies datées de jeu/ si git n'est pas installé.
- drive/ : PDF téléchargés du Drive pour l'inventaire, ignorés par git. Ce n'est pas une source : le contenu des cours vient de DEPOT/.

## Contrôles du validateur

1. Chaque fichier de jeu/data se charge sans erreur.
2. Identifiants uniques et au bon format.
3. Chaque cours de index-cours.js existe dans planning.js (sauf anglais et méthodes) ; semaines comprises entre 1 et 34.
4. Chaque question : type connu, fiche (ou élément d'anglais) existante, source présente, explication de deux phrases au plus, bonne réponse présente parmi les choix une fois débrouillée, pas de choix en double. Au moins une vrai_faux par notion.
5. Chaque fiche : source (fichier et page), prérequis existants, pris dans un cours antérieur ou le même cours.
6. Bonus : source présente ; aucune question ne s'appuie sur un bonus (un bonus n'entre donc jamais dans une bataille, le conseil, un événement, un siège ou un boss).
7. devoirs.js : seulement les champs autorisés ; périmètres valides. a-retravailler.js : fiches existantes (ALERTE). suivi.js : champ cours présent ; chaque clé est un cours du planning, une séquence d'anglais ou une fiche méthode, jamais une révision ou un devoir ; etat acquis ou a-revoir ; source = devoir connu de devoirs.js ou fichier présent dans DEPOT/ (ERREUR) ; cours hors du périmètre du devoir source, date le absente ou mal écrite, note de plus de 20 mots, note avec un chiffre ou qui parle d'une personne (ALERTE).
8. Node seulement, anti-recopie : aucune suite de 12 mots identique entre les cours du jeu (jeu/data/cours et jeu/data/anglais), les notes de suivi.js et atelier/extractions. Le planning, qui reprend les titres de l'emploi du temps, n'est pas concerné.
9. Node seulement, anti-spoil : aucune suite de 8 mots et aucun nombre propre au devoir communs à l'énoncé et aux questions de son périmètre. Les notes de suivi.js sont comparées de même à tous les énoncés et corrigés inscrits au registre.

Contrôles ajoutés : brouillage identique côté jeu et atelier ; ALERTE si une fiche a moins de trois questions écrites, aucune question en « pourquoi » ou « comment », ou un texte de plus de 60 mots ; ERREUR si une question vise une fiche d'un autre cours ; ERREUR si jeu/VERSION.txt et JEU.version (jeu/index.html) ne portent pas le même numéro (Node seulement).

Sortie : une liste ERREUR et ALERTE, avec un code de sortie non nul s'il y a au moins une erreur.
