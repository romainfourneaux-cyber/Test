// Source en clair du cours svt-s02-2 (livret 1, chapitre 1, séance 4 : les effets de serre).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s02-2.js.
// Source déposée : le corrigé du livret 1 (p. 3 : lecture du graphique sur l'histoire de l'atmosphère ;
// p. 4 : tableau des distances et des températures des planètes ; p. 1 : l'atmosphère de Vénus).
// Le corrigé ne donne que les données : le mécanisme de l'effet de serre, expliqué dans la leçon du livret
// non déposée, va dans nonCouvert.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });

module.exports = {
  id: "svt-s02-2",
  fiches: [
    {
      id: "svt-s02-2-f1", notion: "La vapeur d'eau de l'atmosphère au fil du temps",
      titre: "Une atmosphère qui a changé",
      texte: "Il y a 4,5 milliards d'années, l'atmosphère de la Terre contenait presque toute la vapeur d'eau possible : 90 % du maximum. Ce taux a ensuite chuté très vite, jusqu'à environ 10 % il y a 4 milliards d'années. Depuis, il reste à peu près à ce niveau.",
      pointsCles: [
        "Il y a 4,5 milliards d'années : 90 % de la quantité maximale de vapeur d'eau",
        "Il y a 4 milliards d'années : chute rapide, autour de 10 %",
        "Ensuite et jusqu'à aujourd'hui : taux à peu près stable"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["svt-s01-1-f4"], source: C(3)
    },
    {
      id: "svt-s02-2-f2", notion: "L'apparition du dioxygène et de l'ozone",
      titre: "Dioxygène et ozone",
      texte: "Pendant très longtemps, l'atmosphère n'avait pas de dioxygène : il n'y en a pas entre 4,5 et 2,4 milliards d'années. Il apparaît ensuite peu à peu, puis son taux se stabilise il y a environ 2 milliards d'années, jusqu'à aujourd'hui. L'ozone arrive bien plus tard, en faible quantité, il y a 800 millions d'années.",
      pointsCles: [
        "De 4,5 à 2,4 milliards d'années : pas de dioxygène dans l'atmosphère",
        "Puis apparition progressive ; taux stable depuis environ 2 milliards d'années",
        "Ozone : apparition en faible quantité il y a 800 millions d'années"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["svt-s02-2-f1"], source: C(3)
    },
    {
      id: "svt-s02-2-f3", notion: "Distance au Soleil et température des planètes",
      titre: "Plus loin, plus froid… sauf Vénus",
      texte: "En général, plus une planète est loin du Soleil, plus elle est froide. La Terre, à 150 millions de km, est à 15 °C ; Neptune, la plus lointaine, descend à −230 °C. Mais Vénus fait exception : elle est plus loin du Soleil que Mercure, et pourtant plus chaude, avec 477 °C contre 167 °C.",
      pointsCles: [
        "Mercure : 58 millions de km, 167 °C",
        "Vénus : 108 millions de km, 477 °C (atmosphère très épaisse)",
        "Terre : 150 millions de km, 15 °C ; Mars : 228 millions de km, −40 °C",
        "Jupiter : −110 °C ; Saturne : −180 °C ; Uranus : −221 °C ; Neptune : −230 °C"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["svt-s01-1-f3"], source: C(4)
    },
    {
      id: "svt-s02-2-f4", notion: "Du graphique au tableau à double entrée",
      titre: "Ranger les données d'un graphique",
      texte: "Pour ranger les données d'un graphique dans un tableau à double entrée, on fait une colonne par information : le nom des planètes, leur distance au Soleil, leur température. On ajoute une ligne d'en-tête, puis une ligne par planète. Pour chaque point, on lit l'abscisse, ici la distance, et l'ordonnée, ici la température.",
      pointsCles: [
        "Trois colonnes : planète, distance au Soleil (en millions de km), température (en °C)",
        "Une ligne d'en-tête + une ligne par planète : 9 lignes pour 8 planètes",
        "Abscisse du point = distance ; ordonnée du point = température"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: [], source: C(4)
    }
  ],
  schemas: [],
  questions: [
    // f1 : la vapeur d'eau
    { id: "svt-s02-2-q1", fiche: "svt-s02-2-f1", type: "qcm", niveau: 1,
      enonce: "Comment la quantité de vapeur d'eau de l'atmosphère a-t-elle évolué depuis 4,5 milliards d'années ?",
      choix: ["Elle a chuté très vite, puis s'est stabilisée", "Elle a augmenté sans arrêt", "Elle est restée au maximum", "Elle a disparu complètement"],
      reponse: "Elle a chuté très vite, puis s'est stabilisée",
      explication: "Presque au maximum il y a 4,5 milliards d'années, le taux de vapeur d'eau a chuté très vite. Il est ensuite resté à peu près stable.", source: C(3) },
    { id: "svt-s02-2-q2", fiche: "svt-s02-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Aujourd'hui, l'atmosphère contient autant de vapeur d'eau qu'il y a 4,5 milliards d'années.",
      corrections: ["Faux : le taux a chuté très vite il y a environ 4 milliards d'années, puis il est resté bas.", "Faux : il n'y a plus du tout de vapeur d'eau dans l'atmosphère.", "Faux : il y en a beaucoup plus aujourd'hui."],
      reponse: { vrai: false, correction: "Faux : le taux a chuté très vite il y a environ 4 milliards d'années, puis il est resté bas." },
      explication: "La vapeur d'eau était presque au maximum au début. Elle a vite baissé, puis elle s'est stabilisée à un niveau bas.", source: C(3) },
    { id: "svt-s02-2-q3", fiche: "svt-s02-2-f1", type: "qcm", niveau: 2,
      enonce: "Il y a 4,5 milliards d'années, l'atmosphère contenait-elle beaucoup de vapeur d'eau ?",
      choix: ["Oui, presque le maximum possible", "Non, pas du tout", "Seulement quelques traces", "On ne peut pas le savoir"],
      reponse: "Oui, presque le maximum possible",
      explication: "Au début, la vapeur d'eau était presque au maximum possible. C'est ensuite que son taux a chuté.", source: C(3) },
    // f2 : dioxygène et ozone
    { id: "svt-s02-2-q4", fiche: "svt-s02-2-f2", type: "qcm", niveau: 1,
      enonce: "Lequel de ces gaz est apparu en dernier dans l'atmosphère ?",
      choix: ["L'ozone", "Le dioxygène", "La vapeur d'eau", "Ils sont tous apparus en même temps"],
      reponse: "L'ozone",
      explication: "L'ozone n'apparaît qu'il y a 800 millions d'années, en faible quantité. Le dioxygène était déjà là depuis bien plus longtemps.", source: C(3) },
    { id: "svt-s02-2-q5", fiche: "svt-s02-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Il y a 3 milliards d'années, l'atmosphère contenait déjà du dioxygène.",
      corrections: ["Faux : il n'y avait pas de dioxygène avant 2,4 milliards d'années environ.", "Faux : le dioxygène était au plus haut il y a 3 milliards d'années.", "Faux : le dioxygène n'est apparu qu'il y a 800 millions d'années."],
      reponse: { vrai: false, correction: "Faux : il n'y avait pas de dioxygène avant 2,4 milliards d'années environ." },
      explication: "De 4,5 à 2,4 milliards d'années, l'atmosphère n'a pas de dioxygène. Il n'apparaît qu'ensuite, peu à peu.", source: C(3) },
    { id: "svt-s02-2-q6", fiche: "svt-s02-2-f2", type: "ordre", niveau: 2,
      enonce: "Range ces étapes de l'histoire de l'atmosphère, de la plus ancienne à la plus récente.",
      elements: ["Apparition de l'ozone", "Atmosphère très riche en vapeur d'eau", "Début de l'apparition du dioxygène", "Chute rapide de la vapeur d'eau"],
      reponse: [1, 3, 2, 0],
      explication: "D'abord beaucoup de vapeur d'eau, qui chute vite, puis le dioxygène arrive peu à peu. L'ozone n'apparaît que bien plus tard.", source: C(3) },
    { id: "svt-s02-2-q7", fiche: "svt-s02-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment le dioxygène est-il apparu dans l'atmosphère ?",
      choix: ["Peu à peu, à partir d'environ 2,4 milliards d'années", "D'un seul coup, il y a 800 millions d'années", "Dès le début, il y a 4,5 milliards d'années", "Il n'y en a jamais eu"],
      reponse: "Peu à peu, à partir d'environ 2,4 milliards d'années",
      explication: "Le dioxygène apparaît progressivement après 2,4 milliards d'années. Son taux se stabilise vers 2 milliards d'années.", source: C(3) },
    // f3 : distance et température
    { id: "svt-s02-2-q8", fiche: "svt-s02-2-f3", type: "qcm", niveau: 1,
      enonce: "Laquelle de ces planètes est la plus froide ?",
      choix: ["Neptune", "Mars", "Mercure", "Vénus"],
      reponse: "Neptune",
      explication: "Neptune est la planète la plus éloignée du Soleil. C'est aussi la plus froide, à −230 °C.", source: C(4) },
    { id: "svt-s02-2-q9", fiche: "svt-s02-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Mercure, la planète la plus proche du Soleil, est la plus chaude du système solaire.",
      corrections: ["Faux : Vénus, pourtant plus loin du Soleil, est plus chaude que Mercure.", "Faux : la planète la plus chaude est Neptune.", "Faux : Mercure est la planète la plus froide."],
      reponse: { vrai: false, correction: "Faux : Vénus, pourtant plus loin du Soleil, est plus chaude que Mercure." },
      explication: "Vénus atteint 477 °C, Mercure 167 °C. La plus proche n'est donc pas la plus chaude.", source: C(4) },
    { id: "svt-s02-2-q10", fiche: "svt-s02-2-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que la distance au Soleil n'explique pas tout ?",
      choix: ["Parce que Vénus est plus chaude que Mercure, alors qu'elle est plus loin du Soleil", "Parce que Neptune est la planète la plus chaude", "Parce que toutes les planètes ont la même température", "Parce que la Terre est plus froide que Mars"],
      reponse: "Parce que Vénus est plus chaude que Mercure, alors qu'elle est plus loin du Soleil",
      explication: "En général, plus loin veut dire plus froid. Vénus est l'exception : plus loin que Mercure, elle est pourtant plus chaude.", source: C(4) },
    { id: "svt-s02-2-q11", fiche: "svt-s02-2-f3", type: "qcm", niveau: 2,
      enonce: "Quelle température le tableau indique-t-il pour la Terre ?",
      choix: ["Environ 15 °C", "Environ 167 °C", "Environ −40 °C", "Environ 477 °C"],
      reponse: "Environ 15 °C",
      explication: "La Terre est à 15 °C. Mercure et Vénus sont bien plus chaudes, Mars plus froide.", source: C(4) },
    { id: "svt-s02-2-q12", fiche: "svt-s02-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque planète à la température donnée dans le tableau.",
      gauche: ["Mercure", "Vénus", "Mars", "Neptune"],
      droite: ["−230 °C", "167 °C", "477 °C", "−40 °C"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Vénus est la plus chaude, devant Mercure. Mars est sous zéro et Neptune, la plus lointaine, est la plus froide.", source: C(4) },
    // f4 : du graphique au tableau
    { id: "svt-s02-2-q13", fiche: "svt-s02-2-f4", type: "qcm", niveau: 1,
      enonce: "Dans le tableau des planètes, que met-on dans la première colonne ?",
      choix: ["Le nom des planètes", "La température", "La distance au Soleil", "Le titre du graphique"],
      reponse: "Le nom des planètes",
      explication: "La première colonne donne le nom des planètes. Les deux autres donnent leur distance au Soleil et leur température.", source: C(4) },
    { id: "svt-s02-2-q14", fiche: "svt-s02-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans ce graphique, on lit la température de chaque planète sur l'axe des ordonnées.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Ici, l'ordonnée donne la température et l'abscisse la distance. On recopie ces deux valeurs pour chaque planète.", source: C(4) },
    { id: "svt-s02-2-q15", fiche: "svt-s02-2-f4", type: "qcm", niveau: 2,
      enonce: "Huit planètes et une ligne d'en-tête : combien de lignes compte le tableau ?",
      choix: ["Neuf", "Huit", "Trois", "Seize"],
      reponse: "Neuf",
      explication: "Une ligne par planète, plus la ligne d'en-tête : 8 + 1 = 9. Le tableau a aussi trois colonnes.", source: C(4) },
    { id: "svt-s02-2-q16", fiche: "svt-s02-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment trouver la distance d'une planète au Soleil sur ce graphique ?",
      choix: ["On lit l'abscisse de son point", "On lit l'ordonnée de son point", "On compte les points du graphique", "On mesure la taille du point"],
      reponse: "On lit l'abscisse de son point",
      explication: "Sur ce graphique, l'abscisse donne la distance au Soleil. L'ordonnée donne la température.", source: C(4) }
  ],
  bonus: [
    {
      id: "svt-s02-2-b1",
      fiche: "svt-s02-2-f2",
      titre: "Le bon et le mauvais ozone",
      texte: "L'ozone est une forme de l'oxygène faite de trois atomes : O3. En altitude, la couche d'ozone absorbe une partie des rayons ultraviolets du Soleil, dangereux pour la vie : c'est le « bon » ozone. Près du sol, l'ozone dû à la pollution est un « mauvais » ozone.",
      source: { titre: "Science de l'ozone (Journée internationale de la protection de la couche d'ozone)", editeur: "Organisation des Nations unies", url: "https://www.un.org/fr/observances/ozone-day/science" }
    }
  ],
  nonCouvert: [
    "Le mécanisme de l'effet de serre et le rôle des gaz de l'atmosphère : la leçon de la séance 4 n'est pas déposée et le corrigé ne l'explique pas.",
    "Pourquoi Vénus est plus chaude que Mercure : le corrigé donne les données, pas l'explication.",
    "Pourquoi la vapeur d'eau a chuté, et d'où viennent le dioxygène et l'ozone : rien dans les fichiers déposés.",
    "Le pourcentage actuel de dioxygène lu sur le graphique n'est pas repris : à vérifier dans la leçon du livret."
  ]
};
