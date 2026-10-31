# Format des données

Point de départ fixé le 13 octobre 2026, complété au jalon 1 (version 0.1.0 du jeu), mis à jour pour la version 0.5.0 (suivi.js, sauvegarde au schéma 3, épreuve de validation retirée) puis le 15 octobre 2026 (matière langue rangée par badges Griffon, devoir langue-d1, rappelApres, sauvegarde au schéma 4 avec la file des questions ratées, puis au schéma 5 avec la mémoire des questions posées ; fenetreQuestions, reposFiche et reposFicheJuste), puis le 24 octobre 2026 (sauvegarde au schéma 6 avec les expéditions, bloc expedition de config.js, option --expedition des deux simulateurs), puis le 25 octobre 2026 (questions de thème : source { theme, titre, editeur, url }, contrôle 11), puis le 28 octobre 2026 (fiches de programme en histoire et géographie : source { programme, titre, editeur, url }, contrôle 5 ; plafond du contrôle 11 levé pour ces deux matières), puis le 31 octobre 2026 (version web installable pour la tablette : manifest.webmanifest, sw.js généré par generer-sw.js, js/installation.js). Toute évolution se reporte ici dans la même livraison, avec une ligne au journal.

Toutes les données du jeu sont des fichiers .js placés dans jeu/data/. Chacun fait un seul appel à une fonction globale définie dans jeu/js/noyau.js :

```js
JEU.enregistrer("type", objet);
```

Types : config, planning, devoirs, index-cours, a-retravailler, suivi, cours, anglais.

## Identifiants

- Matières : histoire, geographie, svt, physique, litterature, lecture, langue, anglais, methode.
- Cours : `<matiere>-s<semaine sur 2 chiffres>-<n>`, par exemple `histoire-s07-1`.
- Cours de langue (grammaire et conjugaison, hors planning) : `langue-<thème><nn>`. Thèmes : `nat` (natures des mots), `fon` (fonctions des mots), `log` (analyse logique), `conj` (conjugaison), `txt` (analyse de texte) ; `<nn>` : numéro du cours Griffon sur deux chiffres. Par exemple `langue-conj10` (Cours 10 de conjugaison).
- Séquence d'anglais : `anglais-seq01`. Fiche méthode : `methode-frise`, `methode-graphique`, etc.
- Fiche : `<id cours>-f<n>`. Question : `<id cours>-q<n>`. Bonus : `<id cours>-b<n>`. Schéma : `<id cours>-s<n>`.
- Éléments d'une séquence d'anglais : `<id séquence>-v<n>` (vocabulaire), `-g<n>` (structure), `-p<n>` (phrase). Ils jouent le rôle des fiches pour la répétition espacée, les signalements et le validateur.
- Devoir : `<matiere>-d<n>`, par exemple `histoire-d1` ou `langue-d1`.
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
  rappelApres: 3,               // une question ratée revient après 3 autres questions
  fenetreQuestions: 60,         // une question posée ne ressort pas avant 60 autres (sauf « Seconde chance ») ; moins si peu de questions
  reposFiche: 10,               // une notion posée attend 10 autres questions avant de ressortir
  reposFicheJuste: 15,          // une notion réussie attend 15 autres questions (et une notion à revoir réussie 2 fois, la séance suivante)
  orPerduErreur: 6,             // bataille : or retiré par réponse fausse (or de la bataille en cours, jamais sous zéro)
  usureBatiments: false,
  son: true,
  expedition: { semaines: 3, couches: 3, vivres: 3, questionsSemaine: 2, quotaPlein: 12, quotaDemi: 5, difficulte: 0, vitesse: 1, relaisLibres: false }
});
```

expedition (depuis le 24/10/2026, facultatif ; lu par jeu/js/expedition.js avec ces valeurs par défaut) : semaines par expédition (3 ; moins si la frontière est plus proche), couches par semaine (3), vivres au départ (3, 5 au plus), questions de la semaine traversée sur 3 (2), seuils de fiches candidates pour le quota plein (12) et pour le demi-quota (5), cran de difficulté des batailles de route (0 ; −1 ou +1 déplace la ligne du rival d'un cran, +1 à éviter de S6 à S12 tant que la table fine de l'étape 2 n'existe pas), vitesse de départ des batailles de route (1, 2 ou 3), relaisLibres (false : relais = S1, la semaine après chaque semaine franchie et frontière − 2 ; true : toutes les semaines ouvertes). Une valeur absente ou du mauvais genre reprend sa valeur par défaut ; les nombres sont bornés : semaines et couches 1 au moins, vivres de 1 à 5, questionsSemaine de 0 à 3, quotaDemi jamais au-dessus de quotaPlein, difficulte de −4 à 4, vitesse 1, 2 ou 3. Les nombres des haltes (mode, vagues, solidité du camp de route, ligne du rival), la table des lignes par semaine, les faveurs, la renommée et les prix de l'Armorial ne sont pas dans config.js : ils sont dans jeu/js/expedition.js (EXP), mesurés par les simulateurs (plus bas) ; les changer se fait avec Claude. Le réglage difficulte est aussi copié dans chaque expédition au départ (enCours.difficulte) ; une expédition en cours garde donc sa difficulté si Romain change le fichier.

rappelApres (depuis le 15/10/2026) : nombre d'autres questions posées avant qu'une question ratée revienne (jeu/js/rappels.js). Entier, 1 ou plus ; absent ou invalide : 3.

fenetreQuestions, reposFiche, reposFicheJuste (depuis le 15/10/2026, demande de Romain : « elles reviennent souvent » ; lus par jeu/js/questions.js, appliqués par le tirage JEU.recit.suite) : entiers, 0 ou plus ; absents ou invalides : 60, 10 et 15. fenetreQuestions : une question posée parmi les N dernières (toutes parties confondues, séances précédentes comprises) ne ressort pas au tirage ordinaire ; seule sa « Seconde chance » peut revenir plus tôt. Pour chaque tirage, N est ramené à la moitié des questions qui peuvent sortir (bon type, niveaux du tirage, pas exclues) quand elles sont peu nombreuses : 20 vrai ou faux possibles, N = 10. reposFiche : une fiche dont une question a été posée parmi les N dernières n'est pas tirée. reposFicheJuste : une fiche réussie parmi les N dernières questions de la séance n'est pas tirée. Une fiche dont une question attend sa « Seconde chance » n'est pas tirée non plus, et une fiche à revoir (a-retravailler.js, cours « à revoir » de suivi.js) réussie deux fois dans la séance perd sa priorité jusqu'à la séance suivante. Quand ces règles laissent un lot incomplet, le tirage les relâche dans l'ordre : repos des fiches, puis le filtre de la partie (une fiche par bataille), puis la fenêtre ; il ne bloque jamais.

orPerduErreur (depuis le 15/10/2026, demande de Romain) : or retiré par réponse fausse au conseil de guerre d'une bataille (première réponse ou « Seconde chance »), pris sur l'or de la bataille en cours, jamais en dessous de zéro (jeu/js/bataille-moteur.js, repondre). Nombre, 0 ou plus (0 : aucune perte) ; absent : 6. Rien d'autre n'est jamais retiré : ni ressource, ni jauge du royaume, ni province, ni bâtiment ; le conseil du royaume et les événements ne retirent rien.

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
- L'anglais, la grammaire (matière langue) et les fiches méthode ne sont pas dans le planning : les séquences s'ordonnent par leur champ ordre, les cours de langue par badge Griffon puis par leur champ ordre ; séquences, cours de langue et fiches méthode s'ouvrent dès que leur fichier existe (listé dans index-cours.js), et restent dans la brume sinon.

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
- Langue (grammaire et conjugaison) : un devoir par badge Griffon, fait au rythme de l'élève : `semaine: null` (le validateur refuse un nombre). Le périmètre liste des identifiants de cours de langue (`langue-<thème><nn>`), même si leur fichier n'est pas encore là. L'accueil l'annonce « à ton rythme », les Réglages le listent après les devoirs datés.

```js
  { id: "langue-d1", matiere: "langue", semaine: null,
    intitule: "Griffon de cuivre, devoir FR-CUIVRE-2A",
    perimetre: ["langue-conj10", "langue-conj11", "langue-conj12"] }
```

- devoirs.js est généré par `node atelier/outils/generer-planning.js` (avec planning.js). Les devoirs hors planning (ceux de langue) sont écrits dans la liste DEVOIRS_HORS_PLANNING de ce script et recopiés tels quels à chaque génération : on y ajoute le devoir du badge suivant.

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

- Sert à cibler une fiche précise, même dans un cours acquis. S'ajoute aux fiches des cours « a-revoir » de suivi.js : les unes et les autres comptent comme à revoir dans le tirage des questions. Dans le jeu (jeu/js/leitner.js), elles sortent au moins 1,5 fois plus souvent que les autres fiches de leur matière, et leur famille de matières pèse 1,5 fois plus que les autres, jamais davantage (cahier des charges, section 5 : le tirage reste équilibré entre les matières).
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
- Clé : identifiant d'une entrée de type cours du planning, d'une séquence d'anglais (`anglais-seqNN`), d'un cours de langue (`langue-<thème><nn>`) ou d'une fiche méthode (`methode-<nom>`). Jamais une révision ni un devoir (ERREUR).
- etat : `"acquis"` (rien de raté dans ce cours) ou `"a-revoir"` (au moins une notion ratée ou fragile). Tout autre état : ERREUR.
- note : facultative, 20 mots au plus (ALERTE au-delà), écrite pour l'élève avec les mots du cours : elle s'affiche dans la liste des cours, à côté de « À revoir ». Elle ne contient jamais d'énoncé, de document, d'exemple, de chiffre, de réponse attendue ou de note du devoir, ni le nom de l'élève, de sa famille ou d'un correcteur. Le validateur alerte sur un chiffre ou un mot comme « M. », « Mme », « correcteur », et passe la note à l'anti-recopie et à l'anti-spoil (contrôles 8 et 9).
- source : l'identifiant du devoir corrigé dans devoirs.js (ERREUR s'il est absent ou inconnu ; ALERTE si le cours, du planning ou de langue, n'est pas dans le périmètre de ce devoir). Pour un document corrigé qui n'a pas d'identifiant (un devoir d'entraînement, par exemple) : le chemin du fichier relatif à DEPOT/, qui doit exister (ERREUR sinon). Si ce nom de fichier contient un nom de personne, on demande à Romain de le redéposer sous un autre nom.
- le : date de l'estimation (AAAA-MM-JJ ; ALERTE si elle manque). /relecture s'en sert pour retrouver les estimations nouvelles.
- Un corrigé plus récent remplace l'estimation du même cours : on réécrit l'entrée entière, et on met majLe à jour. Retirer une entrée rend au cours son état calculé (ouvert, présumé acquis…).
- Dans le jeu (jeu/js/progression.js), suivi.js passe avant tout autre état, présumé acquis compris. Toutes les fiches d'un cours « a-revoir » (les éléments, pour une séquence d'anglais) comptent comme à revoir dans le tirage.

## personnages.js

Depuis le 16/10/2026. Les personnages de la campagne : les souverains réels que l'élève sert (camp « joueur »), cités dans les cours d'histoire déposés, et les rivaux des deux fronts (camps « angleterre » et « omeyyades », ceux de jeu/js/campagne.js). Chargé par jeu/index.html après suivi.js ; tenu à jour par /traiter (section « Cours d'histoire : personnages »). Fichier absent : chaque front a « un seigneur rival », sans nom, et ton camp n'a pas de souverain.

```js
JEU.enregistrer("personnages", {
  personnages: [
    { id: "clovis", nom: "Clovis", camp: "joueur", seuil: 0,
      titre: "roi des Francs", dates: "481-511",          // tels que le cours les imprime, ou null
      cours: "histoire-s01-2",                            // le cours qui le cite (planning, fiche méthode ou cours de langue)
      source: { fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: 1 },  // relatif à DEPOT/
      faits: [{ texte: "Sur la frise du cours, il est roi des Francs de 481 à 511." }],
                                                          // un fait d'un autre cours : { texte, cours, source }
      portrait: { fichier: "assets/images/personnages/clovis.jpg", oeuvre: "...", artiste: "...", date: "1644",
                  institution: "...", licence: "domaine public (CC0, Open Access du Met)", url: "https://..." },
      repliques: { presentation: ["..."], changement: ["..."] } },
    { id: "roi-angleterre", nom: "Le roi d'Angleterre", camp: "angleterre", seuil: 0, titreSeul: true,
      titre: null, dates: null, cours: null, source: null, faits: [], portrait: null }
  ],
  humeurs: { angleterre: { calme: "{nom} t'observe…", pique: "...", acharne: "..." }, omeyyades: { ... } },
  repliques: { angleterre: { presentation: [{ niveau: "calme", texte: "..." }, ...], defi: [...], victoire: [...],
               tenu: [...], retraite: [...], province: [...], attaque: [...] }, omeyyades: { ... } },
  changement: ["Les années passent : {nom} est maintenant ton souverain. ..."]
});
```

- Brume : un personnage relié à un cours n'existe dans le jeu que si le fichier de ce cours est chargé (JEU.util.coursCharge), comme un cours s'ouvre dès que son fichier existe ; chaque fait ne se montre que si son cours (le sien, sinon celui du personnage) est chargé. Un personnage d'un cours pas encore ouvert ne se voit nulle part : ni sur la carte, ni dans une missive, ni dans la galerie, même en silhouette.
- seuil : provinces prises (les deux fronts) à partir desquelles le personnage règne. Dans un camp, c'est le dernier de la liste dont le cours est ouvert et le seuil atteint. Aujourd'hui : Clovis 0, Pépin le Bref 3, Charlemagne 6 ; les deux rivaux 0.
- Fiche : rien d'autre que ce que le cours imprime (titre, dates), reformulé ; un fait de 35 mots et deux phrases au plus.
- titreSeul : un rival que le cours ne nomme pas. Il n'a que son titre : ni date, ni visage (portrait: null, médaillon héraldique dessiné par le jeu : silhouette couronnée, sans visage, sur les armes du camp, avec l'écu dessous). Seul un rival « titre seul » peut n'avoir aucun cours (cours: null), et alors ni titre, ni date, ni fait : il suit son camp (le roi d'Angleterre).
- Portrait : œuvre réelle du domaine public, CC0 ou CC BY (scène profane, aucune œuvre imprimée dans les supports des Cours Griffon), recadrée en 240 × 300 par atelier/outils/preparer-portraits.py, dans jeu/assets/images/personnages/, avec son crédit complet ici et dans jeu/CREDITS.md. Une image qui ne se charge pas laisse la place au médaillon héraldique du camp.
- Répliques : une ou deux phrases de jeu (28 mots au plus), respectueuses, drôles ou fières ; ni chiffre ni fait historique, ni religion, ni insulte. Marques : {nom} (le personnage, ou le rival dans une humeur), {province} (la province prise, seulement dans province), {souverain} ; au milieu d'une phrase, l'article du nom passe en minuscule (« le Gué », « le roi d'Angleterre »). Les répliques des rivaux sont celles du camp : elles ne nomment jamais un personnage (un « seigneur rival » peut les dire). Au moins 6 par camp et par situation, dont 2 au moins par niveau de rivalité : calme (rivalité 0 à 29, « courtoise »), pique (30 à 64, « vive »), acharne (65 à 100, « acharnée ») ; une réplique sans niveau convient à tous. Les répliques d'un souverain (presentation, changement) ne nomment que lui ; changement (liste générale) sert au souverain qui n'a pas la sienne.
- Situations des rivaux : presentation (première visite de la campagne), defi (avant une bataille contre ce front), victoire (tu as repoussé son attaque), tenu (sa place forte tient après une bataille), retraite (tu as reculé, ou tes murs ont cédé), province (tu lui as pris une province), attaque (il attaque ton domaine ; sert aussi de défi avant la défense).
- Quand une missive vient (jeu/js/campagne.js, jeu/js/ecran-campagne.js) : seulement sur l'écran de la campagne, jamais pendant une partie (une partie qui commence ferme la missive). Première visite : ton souverain puis les deux rivaux se présentent, une seule fois. Avant une bataille lancée depuis la campagne : le défi du rival une bataille sur deux, jamais deux de suite (bouton « Relever le défi » ; la bataille suit la fermeture, Échap compris). Au retour sur la carte : la réaction du rival à chaque province prise et à chaque attaque repoussée, une fois sur deux sinon (tenu, retraite ; rien si l'on a quitté avant la première vague) ; « Les années passent : … » quand le souverain change (aussi dans la chronique) ; l'annonce d'une attaque. Trois lettres au plus dans une même fenêtre. Jamais deux fois de suite la même réplique pour un même camp et une même situation (missives.dernieres). Réglage « Messages des rivaux » décoché : aucune lettre ; la rivalité monte quand même, et un changement de souverain s'annonce en une ligne (toast).
- Rivalité d'un front (0 à 100, campagne.rivalite) : +15 par province prise, +10 par attaque repoussée, +4 quand sa place forte tient après une bataille complète, +8 quand il attaque ton domaine ; une retraite ne la change pas. Elle choisit le niveau des répliques et l'humeur affichée près de son médaillon.

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
    // fiche de programme (28/10/2026, histoire et géographie seulement, cours non déposé) : mêmes champs, mais la source
    // est le programme officiel de 5e, vérifié sur une page fiable, sans fichier ni page. Par exemple, dans histoire-s01-2 :
    // { id: "histoire-s01-2-f3", notion: "...", titre: "...", texte: "...", pointsCles: ["..."], prerequis: [],
    //   source: { programme: "Byzance et l'Europe carolingienne", titre: "Charlemagne", editeur: "Wikipédia", url: "https://fr.wikipedia.org/wiki/Charlemagne" } }
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
      source: { fichier: "cours/physique-chimie/Livret 1.pdf", page: 7 } },
    // question de thème (25/10/2026) : mêmes champs, mais la source est une source fiable, sans fichier ni page
    { id: "physique-s01-1-q2", fiche: "physique-s01-1-f1", type: "vrai_faux", niveau: 1, enonce: "...", corrections: ["...", "..."],
      r: "<réponse brouillée>", explication: "Deux phrases au plus.", poids: 1,
      source: { theme: "Les états de la matière", titre: "État de la matière", editeur: "Vikidia", url: "https://fr.vikidia.org/wiki/..." } }
  ],
  bonus: [
    { id: "physique-s01-1-b1", fiche: "physique-s01-1-f1", titre: "...", texte: "...",
      source: { titre: "...", editeur: "...", url: "..." } }
  ],
  nonCouvert: ["..."]
});
```

Les fichiers de fiches méthode (cours/methode-<nom>.js) ont le même format, avec en plus `matiere` et `titre`, puisqu'ils ne figurent pas dans le planning. Le champ `matiere` range aussi leurs questions dans la famille de matières de ce champ pour l'équilibre du tirage (cahier des charges, section 5). Ils s'ouvrent dès que leur fichier existe, sans épreuve ; leur état vient de suivi.js, comme pour un cours. Rattachement par défaut : section 3 du cahier des charges.

Les cours de langue (cours/langue-<thème><nn>.js, grammaire et conjugaison) ont le même format, avec en plus quatre champs, puisqu'ils ne figurent pas dans le planning :

```js
JEU.enregistrer("cours", {
  id: "langue-conj10", matiere: "langue", titre: "Les modes du verbe",
  badge: "cuivre",   // bois | fer | cuivre | acier | bronze | titane | argent | or (JEU.BADGES_GRIFFON, jeu/js/noyau.js)
  ordre: 1,          // rang dans le badge (entier, 1 ou plus)
  fiches: [ ... ], schemas: [], questions: [ ... ], bonus: [], nonCouvert: []
});
```

Fiches `langue-conj10-f<n>`, questions `-q<n>`, bonus `-b<n>`, comme pour tout cours. Dans le jeu : matière Grammaire (couleur #8c2f39), ressource parchemins, quartier du scriptorium, conseiller « Le maître scribe ». L'écran Cours les range sous leur badge (seulement les badges qui ont au moins un cours), par ordre ; le Codex les montre comme les autres matières. Pour le tirage des questions, la grammaire est une des trois matières de la famille Français (avec la littérature et la lecture suivie : un tiers de la part du français chacune) ; pour la récence, un cours de langue prend la semaine médiane des cours accessibles du planning (il ne compte plus comme un cours de la semaine en cours), et entre cours de langue le badge puis l'ordre les plus avancés passent devant.

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

### Questions de thème (depuis le 25/10/2026)

Demande de Romain : quand le cours déposé est trop mince pour une vraie question sur une fiche, la question porte sur le thème du cours (titre du planning) et sur la notion de la fiche, au niveau du programme de 5e, sans contredire le cours. Elle a les mêmes champs qu'une autre question (id, fiche, type, niveau, énoncé, explication…) et se joue partout, contrairement au bonus ; seule sa source change : `source: { theme, titre, editeur, url }`, sans `fichier` ni `page`. `theme` est l'intitulé du thème tel que le planning le nomme, `titre` et `editeur` désignent la page consultée (fr.wikipedia.org, fr.vikidia.org, lumni.fr, larousse.fr, bnf.fr, eduscol ou un musée), `url` son adresse en http(s). Le validateur (contrôle 11) : ERREUR si theme, titre, editeur ou url manquent ou si l'url n'est pas en http(s), ERREUR si la source cite aussi un fichier ou une page ; ALERTE si l'adresse n'est pas sur un site de la liste connue (encyclopédies, institutions, musées) ; ALERTE si un cours a plus de la moitié de questions de thème (avec le compte). La fiche visée doit être du cours (contrôle 4), l'anti-recopie (8) et l'anti-spoil (9) s'appliquent comme aux autres questions ; le contrôle 5 ne cherche pas ces sources dans DEPOT/. Le jeu n'affiche pas encore la source d'une question ; s'il le fait un jour, il écrira « Thème : <theme> · <editeur> » pour une question de thème. Les questions de thème ajoutées ou modifiées sont listées pour Romain dans la fiche de relecture (`node atelier/outils/lister-questions.js <matière> --theme`). La grille d'audit est dans atelier/relecture/grille-audit-questions.md.

### Fiches de programme (histoire et géographie, depuis le 28/10/2026)

Demande de Romain (« J'ai pas les cours d'histoire-géo : inspire-toi du programme officiel de 5e ») : en histoire et en géographie, quand le cours n'est pas déposé, une fiche peut venir du programme officiel de 5e (cycle 4, BO n° 31 du 30 juillet 2020, eduscol.education.fr). Elle a les mêmes champs qu'une autre fiche (id `<cours>-f<n>`, notion, titre, texte de 60 mots au plus, pointsCles, vocabulaire, dates, lieux, personnages, prerequis, astuce) ; seule sa source change : `source: { programme, titre, editeur, url }`, sans `fichier` ni `page`. `programme` est l'intitulé du sous-thème officiel (par exemple « Byzance et l'Europe carolingienne », « L'ordre seigneurial : la formation et la domination des campagnes », « La croissance démographique et ses effets »), `titre` et `editeur` désignent la page fiable où les faits ont été vérifiés (fr.wikipedia.org, bnf.fr, lumni.fr, eduscol, un musée, ined.fr, insee.fr, banquemondiale.org, un.org…), `url` son adresse en http(s). Une fiche qui vient d'une feuille déposée garde sa source `{ fichier, page }` ; les deux genres se mêlent dans un même cours. Les questions d'une fiche de programme sont des questions de thème (`source: { theme, titre, editeur, url }`, `theme` = titre du cours dans le planning) : une question ne porte jamais de source `{ programme }` (ERREUR, contrôle 4). Charte éditoriale dans CLAUDE.md (faits du programme, aucun commentaire militant d'aucun bord, histoire de France racontée avec énergie).

Le validateur (contrôle 5) : ERREUR si programme, titre, editeur ou url manquent ou sont vides, si l'url n'est pas en http(s), ou si la source cite aussi un fichier ou une page ; ALERTE si l'adresse n'est pas sur un site de la liste connue (la même que pour les questions de thème) ; ALERTE si une fiche de programme se trouve hors d'un cours d'histoire ou de géographie. Le contrôle 5 (Node) ne cherche pas cette source dans DEPOT/ (pas d'alerte « source absente »). Le plafond de la moitié de questions de thème (contrôle 11) ne s'applique pas aux cours dont l'identifiant commence par `histoire-` ou `geographie-` ; il reste pour toutes les autres matières. L'anti-recopie (8) et l'anti-spoil (9) s'appliquent sans changement. Dans le jeu, le Codex écrit « Source : Programme officiel de 5e · <editeur> » sous une fiche de programme, à la place de « <fichier>, page <n> » ; rien d'autre ne change. `node atelier/outils/lister-questions.js <matière>` indique le genre de la source de chaque fiche (dépôt avec la page, ou programme avec l'intitulé du sous-thème) et compte les fiches de programme par cours. Les fiches de programme ajoutées ou modifiées sont listées pour Romain dans la fiche de relecture, avec leur source.

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

Schéma actuel : 6 (depuis le 24/10/2026). Migrations, testées par atelier/outils/tests.js : 1 → 2 ajoute reglages, stats et questionsVues ; 2 → 3 ajoute campagne (complétée par JEU.campagne.completer) et reglages.musique ; 3 → 4 ajoute rappels, vide (complétée par JEU.rappels.completer) ; 4 → 5 ajoute posees, vide (complétée par JEU.questions.completerPosees) ; 5 → 6 ajoute expedition, vide (complétée par JEU.expedition.completer : une valeur absente, nulle ou du mauvais genre reprend sa valeur neuve ; une expédition en cours illisible est close proprement, sa renommée gardée, et la chronique le dit). Aucune ne retire rien. Une sauvegarde sans numéro est lue comme un schéma 1 ; une sauvegarde d'un schéma plus récent que le jeu est refusée. Le réglage reglages.sang (15/10/2026) n'a pas demandé de nouveau schéma : absent (sauvegarde plus ancienne), il vaut vrai, comme animations ; une sauvegarde neuve l'écrit à vrai ; la case des Réglages l'écrit à vrai ou faux (testé par tests.js, contrôlé par perf.js).

```js
{
  schema: 6,
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
  reglages: { son: true, musique: true, animations: true, sang: true, rivaux: true, nomDomaine: "Le domaine" },
                                                 // musique : schéma 3 ; animations absent = vrai ;
                                                 // sang (15/10/2026, « Sang dans les combats ») absent = vrai
  stats: { bonnes: 0, total: 0, parties: 0 },
  questionsVues: { "physique-s01-1-q1": 2 },     // nombre de fois où chaque question a été posée
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
    chronique: [{ le: "2026-10-13", texte: "..." }], // vingt faits au plus, le plus récent d'abord
    // 16/10/2026, sans nouveau schéma (complétés par JEU.campagne.completer) :
    rivalite: { angleterre: 30, omeyyades: 15 }, // rivalité de chaque front, 0 à 100 (personnages.js)
    missives: { presentees: true, chef: "clovis", dernieres: { "angleterre/defi": 3 }, defi: false, apres: true }
                                                 // presentees : première visite faite ; chef : souverain annoncé en dernier ;
                                                 // dernieres : dernière réplique tirée par camp et situation ;
                                                 // defi, apres : la dernière bataille a eu son défi, sa réaction (une sur deux)
  },
  // schéma 4 : les questions ratées à reposer un peu plus tard (jeu/js/rappels.js)
  rappels: {
    compteur: 57,                                // réponses données depuis le début, toutes parties confondues
    file: [{ id: "histoire-s07-2-q3", cours: "histoire-s07-2", du: 60 }],
                                                 // douze au plus ; du : la question est due quand compteur atteint du
    derniere: "geographie-s02-1-q4"              // dernière question répondue (absente au début)
  },
  // schéma 5 : quand chaque question a été posée pour la dernière fois (jeu/js/questions.js, anti-répétition)
  posees: {
    horloge: 57,                                 // réponses données depuis le début, toutes parties confondues
    questions: { "histoire-s07-2-q3": 55 }       // valeur de l'horloge à la dernière fois où la question a été posée
  },
  // schéma 6 (24/10/2026) : les expéditions, la route des semaines (jeu/js/expedition.js, etatVide et commencer ; atelier/conception/expeditions.md, section 13)
  expedition: {
    renom: 0, renomTotal: 0,                     // renommée disponible ; gagnée depuis le début (jamais réduite : un achat d'Armorial retire du disponible seulement)
    armorial: { vivres: 0, bourse: 0, murs: 0, ouverture: 0, banniere: 0,   // rang de chaque quartier acheté (MVP : 2, 3, 2, 1 et 2 rangs au plus)
                saufConduit: 0, memoire: 0, forge: 0, monture: 0 },        // quartiers de l'étape 2, toujours 0 aujourd'hui
    franchies: [6],                              // semaines dont le gardien (ou le Grand Gardien) a été vaincu, pour toujours ; triées, sans doublon
    sermentsOuverts: false,                      // étape 3 (toujours faux)
    serments: { garde: false, guetteur: false, vivres: false, marchand: false, hate: false, champion: false }, // étape 3 (toujours faux)
    titres: [],                                  // étape 2
    records: { "6": { semaine: 8, halte: 3, renom: 319, ardeur: 0, accomplie: 1 } },
                                                 // par relais : semaine et halte les plus loin atteintes, meilleure renommée, ardeur (étape 3), expéditions accomplies ; jamais en baisse
    reponsesParFamille: { svt: 12 },             // bonnes réponses sur la route, toutes expéditions confondues (pour plus tard)
    historique: [{ le: "2026-10-24", graine: 1860519976, front: "angleterre", depart: 6, semaines: [6, 7, 8],
                   atteint: { semaine: 8, noeud: "s8g" }, issue: "victoire", renom: 319, ardeur: 0 }],
                                                 // vingt au plus, le plus récent d'abord ; issue : victoire | retour (plus de vivres) | abandon (camp levé)
    enCours: null,                               // ou l'expédition en cours (une seule à la fois) :
    enCours: {
      graine: 1860519976, front: "angleterre",   // graine du tirage de la route (affichée au bilan « Graine 6EE5-4828 ») ; front du Grand Gardien
      depart: 6, semaines: [6, 7, 8],            // relais ; semaines traversées (une semaine sans cours est sautée)
      ardeur: 0, difficulte: 0, vitesse: 1,      // ardeur : étape 3 ; difficulte et vitesse : copiées de config.js au départ (vitesse retenue de halte en halte)
      route: { version: 1, graine: 1860519976, front: "angleterre", depart: 6, sautees: [],
               actes: [{ semaine: 6, semaines: [6], quota: 2, fiches: 22, cas: "pleine", carte: "gue", essais: 1,
                         couches: [[{ id: "s6c1h1", couche: 1, rang: 1, type: "escarmouche", suivants: ["s6c2h1"],
                                      porte: { genre: "faveur", conseiller: "svt", rare: false } },
                                    { id: "s6c1h2", couche: 1, rang: 2, type: "evenement", ev: "archives", suivants: ["s6c2h1", "s6c2h2"] }],
                                   [ { id: "s6c2h1", couche: 2, rang: 1, type: "marchand", etal: { lignes: ["faveur:engrenages", "vivres", "plan", "rafraichir"] }, suivants: ["s6c3h1"] }, … ],
                                   [ … ]],
                         gardien: { id: "s6g", type: "gardien", semaine: 6, place: 12, vagues: 2, carte: "gue", suivants: [],
                                    porte: { genre: "faveur", conseiller: "histoire", rare: true } } }, …] },
                                                 // écrite au départ, jamais recalculée. semaines : la fenêtre de l'acte ; quota : questions de la fenêtre sur 3 ;
                                                 // cas : pleine | elargie | demi | vide ; essais : tirages avant une semaine valide (21 et secours: true : la semaine
                                                 // de secours) ; type : escarmouche | embuscade | evenement | marchand | bivouac ; porte : faveur (conseiller = famille
                                                 // du conseiller, rare) | bourse | parchemin | vivres ; ev : marchands | defi | mercenaires | incendie | espion | archives ;
                                                 // gardien.type : gardien | grand ; la carte du Grand Gardien est celle de la prochaine province du front
      position: null,                            // halte en cours ou dernière jouée ; null au départ de la semaine courante
      semaine: 6,                                // semaine en cours
      faits: { "s6c1h1": "reussi" },             // reussi | eclatante | echoue (murs cédés) | fait (événement, marchand, bivouac) ; le journal de route se lit ici
      entamee: null,                             // bataille de route dont la 1re vague est lancée et qui n'a pas eu son bilan (jeu fermé en route : un vivre à la reprise)
      vivres: 3, vivresMax: 3,                   // vivresMax = réglage + Vivres de route de l'Armorial + Simples au rang rare, 5 au plus
      or: 0, plan: 0, espion: false, monture: false,
                                                 // or de route ; or du plan de bataille pour la prochaine bataille de route ; espion de route (première vague
                                                 // adverse affaiblie) ; monture : étape 2. plan et espion sont consommés par la prochaine bataille de route jouée
      faveurs: [{ id: "annales", rang: 1 }],     // faveurs tenues : rang 1 commune, 2 rare ; rendues au retour
      places: { "s6g": 7 },                      // solidité restante d'un gardien dont les murs ont cédé (les coups portés restent)
      offre: null,                               // ou l'offre de faveur en attente : { halte, conseiller, cartes: [{ id, rang, affine, nom, famille, conseiller, icone,
                                                 // rangNom, texte }] } ; l'écran y ajoute question: true tant que la question du conseiller n'est pas répondue, et eclatante
      etal: { "s6c2h2": { remise: true, lignes: ["faveur:engrenages", "vivres", "plan", "rafraichir"], rafraichi: false, achetes: ["plan"] } },
                                                 // les étals ouverts : remise de la question juste, lignes, rafraîchi une fois, lignes achetées
      compte: { questions: 0, bonnes: 0, serie: 0, meilleureSerie: 0, parFamille: { svt: { posees: 4, bonnes: 3 } }, parMatiere: {}, parSemaine: {},
                renom: 0, renomHaltes: 0, fiches: [] }
                                                 // le compte de l'expédition : par famille, matière et semaine (posees, bonnes) ; renommée gagnée, dont celle des
                                                 // haltes ; fiches : les fiches ratées, pour « À relire » au bilan
    }
  }
}
```

- cours[id] : plus écrit depuis la 0.5.0. Un ancien « valide » est lu comme acquis. L'état d'un cours est calculé dans cet ordre : suivi.js (acquis, a-revoir), ancien « valide » (acquis), presume (semaine avant semaineDepart), ouvert (fichier présent), avenir (fiche méthode sans fichier), brume. Ces états calculés ne sont jamais enregistrés.
- notions[idFiche].boite : boîte Leitner de 1 à 5 ; une bonne réponse fait monter d'une boîte, une erreur ramène en boîte 1.
- campagne : réparée au chargement par JEU.campagne.completer (une valeur absente ou du mauvais genre reprend sa valeur neuve, le reste ne bouge pas). Une campagne d'avant le 16/10/2026 reçoit une rivalité tirée de ses conquêtes (15 par province déjà prise sur le front, 100 au plus) et des missives neuves : la présentation du souverain et des rivaux vient à la visite suivante. reglages.rivaux (« Messages des rivaux ») absent vaut vrai. Les lettres en attente (réaction après une bataille, attaque) ne sont pas sauvegardées : elles se montrent au retour sur la carte, ou se perdent si le jeu est fermé avant.
- rappels : une erreur met la question (son identifiant, et celui de son cours) dans la file avec du = compteur + rappelApres ; si elle y était déjà, elle est reprogrammée. Une bonne réponse l'en retire. Au-delà de douze, la plus ancienne tombe. Chaque tirage (JEU.recit.suite) place les questions dues à leur rang dans le lot (rang = du − compteur, 0 si elle est déjà due), jamais juste après elle-même (derniere : la question répondue en dernier, gardée d'une séance à l'autre), à la place d'une question ordinaire ; pendant une partie, une erreur replace les questions qui restent à poser (JEU.rappels.replacer). Une question en attente ne sort jamais au tirage ordinaire, même quand toutes les questions de sa fiche attendent. Le conseil du royaume ne reprend que les vrai_faux ; les autres attendent une bataille ou un événement. Une question de niveau 3 n'est reprise qu'en bataille, la seule partie qui tire ce niveau (JEU.questions.niveauMax ; la bataille replace aussi ses questions dans JEU.questions.avecNiveaux) ; ailleurs, elle attend. Une entrée dont la question n'existe plus est effacée au tirage suivant. À l'ouverture du jeu (nouvelle séance), les questions en attente deviennent dues tout de suite (celle répondue en dernier vient en second). Réparée au besoin par JEU.rappels.completer (une derniere qui n'est pas un texte est oubliée).

- posees : après chaque réponse (JEU.questions.enregistrerReponse), horloge avance de 1 et questions[id] prend sa valeur (« Seconde chance » comprise). Le tirage ordinaire s'en sert pour la fenêtre (une question posée parmi les fenetreQuestions dernières ne ressort pas), pour le repos des fiches (reposFiche) et, dans une fiche, pour reposer la question posée il y a le plus longtemps. Une question absente de posees mais vue d'après questionsVues (sauvegarde d'avant le schéma 5) compte comme posée il y a très longtemps : après les questions jamais posées, jamais bloquée par la fenêtre. Réparée au besoin par JEU.questions.completerPosees, vérifiée à chaque usage, sauvegarde au schéma 5 comprise (questions qui n'est pas un objet, ou qui est un tableau, devient vide ; une horloge illisible ou négative reprend la plus grande valeur notée). Environ 30 octets par question posée : 45 Ko pour 1 500 questions.
- expedition : réparé au chargement et à chaque usage par JEU.expedition.completer (la migration 5 → 6 pose un bloc vide ; rien d'autre ne bouge). Une clé absente, nulle ou du mauvais genre reprend sa valeur neuve ; renom illisible ou négatif → 0, renomTotal jamais sous renom, les deux arrondis à l'entier ; chaque quartier de l'Armorial borné entre 0 et son nombre de rangs ; franchies : entiers de 1 ou plus, sans doublon, triés ; sermentsOuverts et chaque serment : vrai ou faux ; titres : des textes seulement ; records et reponsesParFamille : les entrées illisibles sont effacées ; historique : vingt entrées au plus, chacune avec une issue. Une expédition en cours dont la route est illisible (pas de liste d'actes, une halte sans identifiant ou sans type, un gardien d'un autre type que gardien ou grand) est close en « retour » : la renommée déjà créditée au fil de la route reste, le record du relais et l'historique la notent, la chronique dit que la route n'a pas pu être relue. Sinon : semaine inconnue → la première semaine de la route ; front inconnu → l'ouest ; vivresMax de 1 à 5, vivres de 0 à vivresMax (absents : le réglage) ; or et plan jamais négatifs ; faveur inconnue, en double ou sans rang retirée, rang plafonné à 2 ; places et faits illisibles effacés ; offre sans carte valable → aucune ; position qui n'est pas une halte de la semaine en cours → le départ de la semaine ; entamee inconnue → aucune ; compte complété champ par champ. Une sauvegarde à 0 vivre n'est pas close par completer : le bilan vient à la reprise de l'écran (reprendre). Une sauvegarde du schéma 7 est refusée. Taille : environ 3 Ko pour une expédition de trois semaines en cours, 2 Ko d'historique.
- Séance (rien dans la sauvegarde) : pour chaque fiche, la dernière bonne réponse et le nombre de bonnes réponses depuis l'ouverture du jeu (repos de reposFicheJuste questions après une bonne réponse ; une fiche à revoir réussie deux fois perd sa priorité jusqu'à la séance suivante). Tout repart de zéro quand le jeu est rouvert ou qu'une sauvegarde est importée.

Export : fichier `sauvegarde-jeu5e-AAAA-MM-JJ.json`. Import : le fichier doit ressembler à une sauvegarde du jeu (creeLe, notions, ressources), sinon il est refusé et la partie en cours ne bouge pas ; après confirmation, il remplace la partie en cours, dont une copie reste dans le navigateur (clé jeu5e-avant-import).

## Version web installable (manifest.webmanifest, sw.js, js/installation.js), depuis le 31/10/2026

Pour la tablette Android (Chrome), la version web du jeu s'installe sur l'écran d'accueil et se joue hors ligne. Trois fichiers, aucun changement au jeu lui-même, qui ne fait toujours aucun appel réseau pendant la partie : le service worker est le mécanisme d'installation du navigateur, rien d'autre.

- jeu/manifest.webmanifest : le manifeste d'application. name « Le domaine · révision 5e », short_name « Le domaine », start_url `./`, scope `./`, display standalone, orientation landscape, lang fr, background_color et theme_color #2e2419 (l'encre du jeu), trois icônes PNG dans jeu/assets/images/icones-app/ (icone-192.png, icone-512.png, icone-512-maskable.png : le blason du jeu sur le parchemin, créditées dans CREDITS.md). L'en-tête de index.html le référence (`<link rel="manifest" href="manifest.webmanifest">`, `<meta name="theme-color" content="#2e2419">`) et charge js/installation.js en defer.
- jeu/sw.js : le service worker, FICHIER GÉNÉRÉ, jamais écrit à la main : `node atelier/outils/generer-sw.js`. Il porte la liste de précache FICHIERS (tous les fichiers de jeu/, chemins relatifs triés, sauf sw.js lui-même et les fichiers système Thumbs.db, desktop.ini, .DS_Store, et les noms qui commencent par un point ; le-domaine.html compris s'il existe) et le nom du cache `le-domaine-<version>`, lu dans jeu/VERSION.txt. À l'installation, il met tout en cache (requêtes `cache: "reload"`, pour relire le serveur et non le cache HTTP) puis skipWaiting ; à l'activation, il efface les autres caches `le-domaine-*` puis clients.claim. Ensuite chaque demande GET de la même origine est servie depuis le cache, réseau en repli. Une page (mode navigate) vient du cache si elle y est (index.html, le-domaine.html) ; `./`, l'adresse de départ du manifeste, reçoit l'accueil mis en cache ; une page jumelle absente du cache vient du réseau, sinon de l'accueil mis en cache, sinon un texte « Hors ligne » (503). À régénérer à chaque livraison, après le changement de numéro de version, et dès qu'un fichier entre ou sort de jeu/.
- jeu/js/installation.js (chargé en dernier, balise defer dans l'en-tête ; JEU.installation) : enregistre `sw.js` seulement si location.protocol est http: ou https: et si navigator.serviceWorker existe ; jamais en file:// (le double-clic sur index.html sur le PC ne change pas) ; une erreur d'enregistrement reste dans la console. Il enrobe l'écran des Réglages (interface.js intact) : la ligne « Version x.y.z » devient « Version x.y.z · mode installé » (application ouverte depuis l'écran d'accueil, display-mode standalone), « · hors ligne prêt » (service worker aux commandes), « · hors ligne en préparation… » ou « · hors ligne indisponible » ; un cartouche « Tablette et hors ligne » se place avant les crédits, avec le bouton « Mettre à jour » (registration.update(), puis proposition de recharger quand la nouvelle version est active ; « Le jeu est déjà à jour. » ou « Pas de réseau : la mise à jour attendra. » sinon) et, quand Chrome le propose (beforeinstallprompt), « Installer sur la tablette ». En file://, rien de tout cela n'apparaît.

Contrôles (tests.js) : la liste de précache de jeu/sw.js est exactement la liste des fichiers de jeu/ (aucun manquant, aucun fantôme) et jeu/sw.js est octet pour octet ce que generer-sw.js produit ; le nom du cache porte le numéro de VERSION.txt ; le service worker pose ses trois écouteurs (install, activate, fetch) ; le manifeste a ses champs et ses trois icônes, présentes dans jeu/ et dans la précache ; l'en-tête de index.html référence le manifeste, la couleur de thème et installation.js ; installation.js n'enregistre rien en file:// et enregistre sw.js une fois en https, avec les Réglages enrobés. L'essai de bout en bout (serveur http local, réseau coupé, bataille hors ligne, file:// sans enregistrement) se fait avec Playwright hors dépôt ; son déroulé est dans le journal du 31/10/2026.

## Fichiers de l'atelier

- registre.json : `[{ chemin, taille, modifieLe, traiteLe, type, cours: [ids], extraction }]`. chemin : relatif à DEPOT/. type : planning, methode, cours, enonce, corrige, sauvegarde. extraction : nom du fichier dans extractions/. Pour un énoncé ou un corrigé de devoir, cours contient l'identifiant du devoir (contrôle 9).
- index-notions.json : `[{ id, matiere, semaine, cours, notion, prerequis }]` (semaine 0 pour les savoir-faire).
- contenu/<id>.js : sources en clair des cours (voir plus haut).
- extractions/*.txt : texte intégral, mot pour mot, des fichiers lus (sans le nom de l'élève, de sa famille ou d'un correcteur, ni numéro de sécurité sociale), pour ne pas les relire et pour l'anti-recopie et l'anti-spoil.
- devoirs/<id>.md : notions évaluées ; si le devoir est corrigé, notions réussies, notions à retravailler et estimation par cours, reportée dans jeu/data/suivi.js. Ni nom de l'élève ou du correcteur, ni numéro.
- relectures/ : fiches HTML et derniere.txt (date de la dernière relecture).
- relecture/ (depuis le 25/10/2026) : grille-audit-questions.md (grille de l'audit des questions bizarres et des questions de thème), audit-questions-<matiere>.json (verdicts de l'audit : [{ id, cours, fiche, verdict, categorie, raison, piste }]) et questions-theme-<matiere>.md (fiches de relecture des questions de thème) ; depuis le 28/10/2026, programme-histoire-1.md, programme-histoire-2.md, programme-geographie-1.md et programme-geographie-2.md (fiches de relecture des fiches de programme d'histoire-géographie, par groupe de cours : tableau des fiches avec leur source, corrections et retraits de la relecture, questions de thème à comparer au livret, bonus, non couvert, points à trancher) et programme-histoire-geo.md (leur index pour Romain : totaux, où regarder, les cinq points à vérifier d'abord).
- conception/ : cahiers de conception (expeditions.md et ses annexes expeditions-mvp.md, expeditions-mesures.md, expeditions-graphismes.md, expeditions-hades.md, expeditions-spire.md) et, depuis le 28/10/2026, programme-histoire-geo-5e.md : le document de référence des fiches de programme (programme officiel de 5e avec les intitulés exacts des thèmes et sous-thèmes et leurs adresses, charte éditoriale, règles de données, les 21 cours d'histoire-géographie un par un avec les fiches à garder, retirer ou créer, les lignes rouges de l'anti-spoil et les questions types d'une évaluation de 5e).
- outils/ : valider.js et controles.js (validateur), validateur.html, brouillage.js, tests.js (logique), perf.js (essai de bout en bout et mesure de vitesse, demande Playwright ; depuis le 16/10/2026, il vérifie aussi que les troupes sont dessinées en bataillons, avec des figurines couchées, et mesure une grosse mêlée de bataillons en 1366 × 768 et 1920 × 1080 : écart médian entre deux images de 17,5 ms au plus, 2 % des images au plus au-delà de 34 ms, boucle de bataille sous 8 ms pour 95 % des images ; et, une image sur six, deux bataillons ennemis l'un dans l'autre le long de la route hors des deux adversaires d'un duel : sur 35 % des images au plus, ligne de front des mêlées ; perf.js n'a pas de passage d'expédition au MVP), essai-expedition.js (depuis le 24/10/2026 : la route de bout en bout dans Chromium, avec Playwright : départ depuis la carte de campagne, Armorial, page de semaine, carte-itinéraire au clavier, escarmouche jouée puis porte de faveur, événement, marchand, bivouac, gardien, retour à la campagne et reprise au même point, export puis import identiques, réglages « Sang », « Animations » et « Messages des rivaux » coupés ; aucune erreur JavaScript attendue, aucun nom de halte qui en touche un autre ; captures dans atelier/captures/expedition-*.png), simuler-bataille.js (équilibre de la bataille : le vrai moteur joué par un élève scripté, 80 graines par défaut ; par niveau de province, issues, coups portés et batailles pour prendre la province ; défense du domaine tenue et murs restants ; --moteur pour jouer une copie d'un ancien moteur, --json pour enregistrer un essai, --comparer pour les écarts par niveau avec un essai enregistré, --regle pour essayer un réglage du seigneur rival (table RIVAL et DEFENSE de jeu/js/bataille-moteur.js) sans toucher au fichier, --seulement attaque ou defense, la partie non jouée s'affichant « — » ; depuis le 16/10/2026, --strategies equilibre,rush,tortue,attente pour comparer des joueurs scriptés (équilibré, ruée : tout l'or en troupes dès la 1re vague, tortue : rien que des tours ; attente, depuis la revue du 16/10/2026 : les tours de l'équilibré mais aucune troupe et l'or gardé, puis tout en troupes à la dernière vague) : coups à la 1re vague en part de la solidité, batailles pour prendre, défense tenue, et ce qu'a fait le seigneur rival (tours bâties, gardes achetés, gardes rappelés par ses guetteurs, renforts) ; --trace pour suivre une bataille vague par vague, décisions du rival comprises ; depuis le 24/10/2026, les batailles de route des expéditions : --vagues, --pvRival, --mode, --carte, --arsenal, --sansChampion pour une bataille de route réglée à la main (jour 0), et --expedition pour les quatre nœuds de la route (escarmouche, embuscade, gardien, Grand Gardien) joués avec les options exactes de JEU.expedition.optionsBataille, semaine par semaine, gardiens retentés avec les coups gardés, puis la réussite d'une expédition entière par le calcul du cahier (--semaines, --expeditions, --vivres, --repos, --difficulte, --armorial, --faveurs, --essai pour un réglage de jeu/js/expedition.js en mémoire, --depuis pour reprendre des cases déjà mesurées, --noeuds pour ne jouer que certains nœuds, --front ou --carteGrand pour la carte du Grand Gardien, --tentatives pour le nombre de reprises d'un gardien, --sortie pour écrire aussi le JSON, et --comparer nœud par nœud en mode expédition ; sans ces options, rien ne change : --comparer atelier/mesures/avant-expedition.json doit rendre +0 % sur les vingt cases après tout changement du simulateur ou de jeu/js/expedition.js) ; mesures et réglage dans atelier/conception/expeditions-mesures.md), mesurer-tirage.js (le vrai tirage des questions avec les vrais cours : part de chaque famille de matières ; répétitions sur des séances de 100 questions jouées par des élèves simulés, questions reposées, même notion en 10 questions, niveaux posés face au niveau conseillé ; option --avant pour comparer avec une copie d'anciens modules ; depuis le 24/10/2026, --expedition : des expéditions simulées par les mêmes élèves avec le vrai déroulé de jeu/js/expedition.js, départ S1 puis S6, tous les fichiers de cours chargés : part des questions de la fenêtre de l'acte selon le quota, part de chaque famille, notions à revoir, répétitions, réussite, durée d'un tirage avec quota hors bac à sable), compiler-cours.js, lister-questions.js (depuis le 25/10/2026 : toutes les questions d'une matière ou d'un cours avec leur contexte, thème du planning, fiche, type, source, énoncé, choix et réponse en clair, un bloc par question ; --theme pour les seules questions de thème, --suspects pour le filet des catégories de la grille ; depuis le 28/10/2026, le genre de la source de chaque fiche, dépôt avec la page ou programme avec l'intitulé du sous-thème, et le nombre de fiches de programme par cours), preparer-portraits.py (portraits des souverains de personnages.js : recadrage 240 × 300 et camaïeu, à partir des images originales du Met téléchargées à part), generer-planning.js (planning.js et devoirs.js, devoirs hors planning compris), generer-sons.js, scripts Python d'extraction de l'emploi du temps, extraire-icones.py et icones-choisies.json (icônes Game-icons), generer-textures.py et generer-terrain.py (textures et fond de carte), rendu-3d/ (scripts Blender des images de bataille).
- versions/ : copies datées de jeu/ si git n'est pas installé.
- drive/ : PDF téléchargés du Drive pour l'inventaire, ignorés par git. Ce n'est pas une source : le contenu des cours vient de DEPOT/.

## Contrôles du validateur

1. Chaque fichier de jeu/data se charge sans erreur.
2. Identifiants uniques et au bon format. Cours de langue : identifiant `langue-<nat|fon|log|conj|txt><nn>`, champs matiere (« langue »), titre, badge (un des huit badges Griffon) et ordre (entier, 1 ou plus) présents, sinon ERREUR.
3. Chaque cours de index-cours.js existe dans planning.js (sauf anglais, méthodes et cours de langue) ; semaines comprises entre 1 et 34.
4. Chaque question : type connu, fiche (ou élément d'anglais) existante, source présente ({ fichier, page }, ou { theme, titre, editeur, url } pour une question de thème, contrôle 11 ; jamais { programme }, qui n'existe que sur une fiche : ERREUR), explication de deux phrases au plus, bonne réponse présente parmi les choix une fois débrouillée, pas de choix en double. Au moins une vrai_faux par notion.
5. Chaque fiche : source (fichier et page ; ou, depuis le 28/10/2026, { programme, titre, editeur, url } pour une fiche de programme : ERREUR si un champ manque ou est vide, si l'url n'est pas en http(s) ou si la source cite aussi un fichier ou une page ; ALERTE si l'adresse n'est pas sur un site connu, ou si la fiche est hors d'un cours d'histoire ou de géographie), prérequis existants, pris dans un cours antérieur ou le même cours (pour un cours de langue : un badge antérieur, ou le même badge avec un ordre plus petit). Node seulement : chaque fichier cité comme source (fiche, question, schéma, élément d'anglais) existe dans DEPOT/ (ALERTE, une ligne par fichier et par cours) ; une source de thème ou de programme n'est pas cherchée dans DEPOT/.
6. Bonus : source présente ; aucune question ne s'appuie sur un bonus (un bonus n'entre donc jamais dans une bataille, le conseil, un événement, un siège ou un boss).
7. devoirs.js : seulement les champs autorisés ; semaine de 1 à 34, sauf un devoir de langue (semaine null) ; périmètres valides (pour un devoir de langue : des identifiants de cours de langue, et un cours déjà présent doit être de la matière langue). a-retravailler.js : fiches existantes (ALERTE). suivi.js : champ cours présent ; chaque clé est un cours du planning, une séquence d'anglais, un cours de langue ou une fiche méthode, jamais une révision ou un devoir ; etat acquis ou a-revoir ; source = devoir connu de devoirs.js ou fichier présent dans DEPOT/ (ERREUR) ; cours hors du périmètre du devoir source, date le absente ou mal écrite, note de plus de 20 mots, note avec un chiffre ou qui parle d'une personne (ALERTE).
8. Node seulement, anti-recopie : aucune suite de 12 mots identique entre les cours du jeu (jeu/data/cours et jeu/data/anglais), les notes de suivi.js, les textes de personnages.js (noms, titres, faits, humeurs, répliques) et atelier/extractions. Le planning, qui reprend les titres de l'emploi du temps, n'est pas concerné.
9. Node seulement, anti-spoil : aucune suite de 8 mots et aucun nombre propre au devoir communs à l'énoncé et aux questions de son périmètre (devoir de langue compris : langue-d1 et les cours langue-conj10 à 12). Les notes de suivi.js et les textes de personnages.js sont comparés de même à tous les énoncés et corrigés inscrits au registre.
10. personnages.js (depuis le 16/10/2026 ; absent : ALERTE seulement, Node). ERREUR si : identifiant mal formé ou en double ; nom manquant ; camp autre que joueur, angleterre, omeyyades ; seuil qui n'est pas un entier positif ou nul ; dates mal écrites (« 481-511 » ou null) ; cours (du personnage ou d'un fait) inconnu, ou entrée du planning qui n'est pas un cours ; source { fichier, page } manquante quand il y a un cours ; personnage sans cours qui n'est pas un rival « titre seul », ou qui a un titre, une date ou un fait ; rival « titre seul » avec un portrait ou des dates ; fait de plus de deux phrases ou 35 mots ; portrait hors de assets/images/personnages/, crédit incomplet (oeuvre, artiste, date, institution, licence, url en https), licence autre que domaine public, CC0 ou CC BY ; réplique ou humeur de plus de deux phrases ou 28 mots, avec un chiffre, un mot de religion ou une insulte, une marque inconnue ({province} hors de la situation province), le nom d'un personnage dans la bouche d'un rival (ou d'un autre personnage dans celle d'un souverain) ; humeur manquante ; moins de 6 répliques par camp et par situation, ou moins de 2 par niveau de rivalité ; aucune annonce changement, ou sans {nom}. Node seulement : source introuvable dans DEPOT/, portrait introuvable dans jeu/, ligne de crédit absente de jeu/CREDITS.md (nom du fichier et adresse de l'œuvre) : ERREUR ; portrait de plus de 120 Ko : ALERTE. ALERTE aussi : cours pas encore dans index-cours.js (le personnage reste dans la brume), souverain sans portrait ou sans réplique de présentation.
11. Questions de thème (depuis le 25/10/2026) : une question dont la source porte un champ `theme` est une question de thème. ERREUR si theme, titre, editeur ou url manquent ou sont vides, si l'url ne commence pas par http:// ou https://, ou si la source cite aussi un fichier ou une page. ALERTE si l'adresse n'est pas sur un site connu (wikipedia.org, vikidia.org, lumni.fr, larousse.fr, bnf.fr, education.fr et gouv.fr, grands musées et institutions scientifiques, ou un hôte dont le nom contient « musee » ou « museum »). ALERTE, avec le compte, si plus de la moitié des questions d'un cours sont des questions de thème, sauf pour les cours dont l'identifiant commence par `histoire-` ou `geographie-` (plafond levé le 28/10/2026 : leurs cours ne sont pas déposés, voir « Fiches de programme »). Les contrôles 4 (fiche du cours, explication, réponse), 8 et 9 s'appliquent sans changement.

Contrôles ajoutés : brouillage identique côté jeu et atelier ; ALERTE si une fiche a moins de trois questions écrites, aucune question en « pourquoi » ou « comment », ou un texte de plus de 60 mots ; ERREUR si une question vise une fiche d'un autre cours ; ERREUR si jeu/VERSION.txt et JEU.version (jeu/index.html) ne portent pas le même numéro (Node seulement).

Sortie : une liste ERREUR et ALERTE, avec un code de sortie non nul s'il y a au moins une erreur.
