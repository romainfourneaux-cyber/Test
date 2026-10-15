// Source en clair du cours svt-s01-2 (livret 1, chapitre 1, séance 2 : les axes de la Terre).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s01-2.js.
// Sources déposées : les ressources complémentaires (p. 1 : orbite, périhélie, aphélie, solstices et
// équinoxes ; p. 2 : axe de rotation et plan de l'écliptique ; p. 3 : durée de rotation de la Terre) et le
// corrigé du livret 1 (p. 2 : faire des fiches). Le livret lui-même n'est pas déposé.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
const R = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Ressources complementaires.pdf", page: page });

module.exports = {
  id: "svt-s01-2",
  fiches: [
    {
      id: "svt-s01-2-f1", notion: "Rotation et révolution de la Terre",
      titre: "La Terre tourne de deux façons",
      texte: "La Terre tourne sur elle-même autour d'une ligne imaginaire, son axe de rotation : c'est la rotation. Un tour complet dure 23 h 56 min. La Terre tourne aussi autour du Soleil en suivant son orbite : c'est la révolution. Elle se fait dans un plan appelé plan de l'écliptique.",
      pointsCles: [
        "Rotation : la Terre tourne sur elle-même, autour de son axe de rotation (23 h 56 min)",
        "Révolution : la Terre tourne autour du Soleil, sur son orbite",
        "Plan de l'écliptique : le plan dans lequel se fait la révolution"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "rotation", def: "le mouvement de la Terre qui tourne sur elle-même autour de son axe" },
        { mot: "révolution", def: "le tour que fait la Terre autour du Soleil, en suivant son orbite" },
        { mot: "plan de l'écliptique", def: "le plan dans lequel la Terre accomplit sa révolution autour du Soleil" },
        { mot: "orbite", def: "le trajet que suit la Terre autour du Soleil" }
      ],
      schema: "svt-s01-2-s1", prerequis: [], source: R(2)
    },
    {
      id: "svt-s01-2-f2", notion: "Un axe de rotation incliné",
      titre: "Un axe penché",
      texte: "L'axe de rotation de la Terre n'est pas droit : il fait un angle de 23° avec le plan de l'écliptique. À cause de cette inclinaison, la durée du jour et celle de la nuit changent beaucoup selon l'endroit où l'on se trouve sur le globe.",
      pointsCles: [
        "Angle de 23° entre l'axe de rotation et le plan de l'écliptique",
        "Conséquence : jour et nuit n'ont pas la même durée partout sur le globe"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "axe de rotation", def: "la ligne imaginaire, penchée, autour de laquelle la Terre tourne sur elle-même" }
      ],
      schema: "svt-s01-2-s1", prerequis: ["svt-s01-2-f1"], source: R(2)
    },
    {
      id: "svt-s01-2-f3", notion: "L'orbite en ellipse : périhélie et aphélie",
      titre: "Une orbite ovale",
      texte: "L'orbite de la Terre n'est pas un cercle parfait mais une ellipse, c'est-à-dire un ovale. Le Soleil occupe l'un de ses deux centres. Le point le plus proche du Soleil s'appelle le périhélie, vers le 3 janvier ; le plus éloigné, l'aphélie, vers le 3 juillet. Au nord, la Terre est donc au plus près du Soleil en plein hiver.",
      pointsCles: [
        "Orbite en ellipse, le Soleil à l'un des deux centres",
        "Périhélie (le plus proche) : vers le 3 janvier",
        "Aphélie (le plus loin) : vers le 3 juillet",
        "Hémisphère nord : plus près du Soleil en hiver, plus loin en été ; c'est l'inverse au sud"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ellipse", def: "une forme ovale, comme un cercle allongé" },
        { mot: "périhélie", def: "le point de l'orbite de la Terre le plus proche du Soleil" },
        { mot: "aphélie", def: "le point de l'orbite de la Terre le plus éloigné du Soleil" }
      ],
      schema: "svt-s01-2-s1", prerequis: ["svt-s01-2-f1"], source: R(1)
    },
    {
      id: "svt-s01-2-f4", notion: "Solstices et équinoxes",
      titre: "Quatre positions repères",
      texte: "Sur son orbite, la Terre passe par quatre positions repères. Les deux solstices ont lieu vers le 21 juin et le 21 décembre. Les deux équinoxes ont lieu vers le 21 mars et le 21 septembre. Le jour d'un équinoxe, le jour et la nuit durent chacun 12 heures, partout sur le globe.",
      pointsCles: [
        "Solstices : vers le 21 juin et le 21 décembre",
        "Équinoxes : vers le 21 mars et le 21 septembre",
        "Aux équinoxes : 12 heures de jour et 12 heures de nuit en tout point du globe"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "solstice", def: "l'une des deux positions de la Terre, vers le 21 juin et le 21 décembre" },
        { mot: "équinoxe", def: "l'une des deux positions de la Terre, vers le 21 mars et le 21 septembre, où le jour dure autant que la nuit partout" }
      ],
      schema: "svt-s01-2-s1", prerequis: ["svt-s01-2-f3"], source: R(1)
    },
    {
      id: "svt-s01-2-f5", notion: "Faire des fiches de révision",
      titre: "Des fiches pour réviser",
      texte: "Une fiche de révision porte un numéro, pour ranger les fiches dans l'ordre. On choisit une couleur par niveau de titre et on décale le texte d'un carreau à chaque sous-titre. On y note les définitions, on encadre en couleur le résumé, et un schéma aide à le visualiser.",
      pointsCles: [
        "Un numéro par fiche",
        "Une couleur par niveau de titre, un carreau de décalage par sous-titre",
        "Les définitions, un résumé encadré et colorié",
        "Un schéma pour visualiser le résumé"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: [], source: C(2)
    }
  ],
  schemas: [
    {
      id: "svt-s01-2-s1", legende: "L'orbite de la Terre autour du Soleil, vue de biais : l'ovale est volontairement exagéré.",
      svg: "<svg viewBox='-20 0 680 310' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='12'>" +
        "<ellipse cx='310' cy='155' rx='200' ry='95' fill='none' stroke='#2e2419' stroke-width='2'/>" +
        "<g stroke='#8a7f70' stroke-width='1.2' stroke-dasharray='4 4'>" +
        "<line x1='340' y1='155' x2='110' y2='155'/><line x1='340' y1='155' x2='510' y2='155'/>" +
        "<line x1='340' y1='155' x2='199' y2='77'/><line x1='340' y1='155' x2='399' y2='78'/>" +
        "<line x1='340' y1='155' x2='199' y2='233'/><line x1='340' y1='155' x2='425' y2='233'/></g>" +
        "<circle cx='340' cy='155' r='16' fill='#e3b341' stroke='#b08d3a' stroke-width='2'/>" +
        "<text x='340' y='186' text-anchor='middle' fill='#2e2419'>Soleil</text>" +
        "<g fill='#4a78a8' stroke='#2e2419' stroke-width='1'>" +
        "<circle cx='510' cy='155' r='11'/><circle cx='399' cy='78' r='11'/><circle cx='199' cy='77' r='11'/>" +
        "<circle cx='110' cy='155' r='11'/><circle cx='199' cy='233' r='11'/><circle cx='425' cy='233' r='11'/></g>" +
        "<g stroke='#2e2419' stroke-width='2'>" +
        "<line x1='505' y1='138' x2='515' y2='172'/><line x1='394' y1='61' x2='404' y2='95'/><line x1='194' y1='60' x2='204' y2='94'/>" +
        "<line x1='105' y1='138' x2='115' y2='172'/><line x1='194' y1='216' x2='204' y2='250'/><line x1='420' y1='216' x2='430' y2='250'/></g>" +
        "<g fill='#2e2419'>" +
        "<text x='530' y='150'>périhélie</text><text x='530' y='166' fill='#6b2d5c'>vers le 3 janvier</text>" +
        "<text x='92' y='150' text-anchor='end'>aphélie</text><text x='92' y='166' text-anchor='end' fill='#6b2d5c'>vers le 3 juillet</text>" +
        "<text x='415' y='50'>équinoxe</text><text x='415' y='64' fill='#6b2d5c'>vers le 21 mars</text>" +
        "<text x='183' y='36' text-anchor='end'>solstice</text><text x='183' y='50' text-anchor='end' fill='#6b2d5c'>vers le 21 juin</text>" +
        "<text x='183' y='272' text-anchor='end'>équinoxe</text><text x='183' y='286' text-anchor='end' fill='#6b2d5c'>vers le 21 septembre</text>" +
        "<text x='441' y='272'>solstice</text><text x='441' y='286' fill='#6b2d5c'>vers le 21 décembre</text></g>" +
        "<text x='310' y='305' text-anchor='middle' font-size='11' fill='#5b5044'>Le trait noir sur chaque Terre : l'axe de rotation, penché.</text>" +
        "</svg>"
    }
  ],
  questions: [
    // f1 : rotation et révolution
    { id: "svt-s01-2-q1", fiche: "svt-s01-2-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on le mouvement de la Terre qui tourne sur elle-même ?",
      choix: ["La rotation", "La révolution", "L'aphélie", "L'équinoxe"],
      reponse: "La rotation",
      explication: "La rotation, c'est la Terre qui tourne sur elle-même autour de son axe. La révolution, c'est son tour autour du Soleil.", source: R(2) },
    { id: "svt-s01-2-q2", fiche: "svt-s01-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "La révolution, c'est le tour que fait la Terre autour du Soleil.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Oui : la Terre accomplit sa révolution sur son orbite, autour du Soleil. Cela se passe dans le plan de l'écliptique.", source: R(1) },
    { id: "svt-s01-2-q3", fiche: "svt-s01-2-f1", type: "association", niveau: 2,
      enonce: "Relie chaque mot à ce qu'il désigne.",
      gauche: ["Rotation", "Révolution", "Axe de rotation", "Plan de l'écliptique"],
      droite: ["Le plan dans lequel la Terre tourne autour du Soleil", "Le mouvement de la Terre qui tourne sur elle-même", "La ligne imaginaire, penchée, autour de laquelle la Terre tourne", "Le tour que fait la Terre autour du Soleil"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Rotation : la Terre tourne sur elle-même, autour de son axe. Révolution : elle tourne autour du Soleil, dans le plan de l'écliptique.", source: R(2) },
    { id: "svt-s01-2-q4", fiche: "svt-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Combien de temps dure une rotation complète de la Terre sur elle-même ?",
      choix: ["Un peu moins d'un jour", "Environ une semaine", "Environ un mois", "Environ un an"],
      reponse: "Un peu moins d'un jour",
      explication: "La Terre fait un tour sur elle-même en un peu moins d'une journée. Il lui manque quatre minutes pour faire un jour entier.", source: R(3) },
    // f2 : l'axe incliné
    { id: "svt-s01-2-q5", fiche: "svt-s01-2-f2", type: "qcm", niveau: 1,
      enonce: "Comment est placé l'axe de rotation de la Terre par rapport au plan de l'écliptique ?",
      choix: ["Il est penché et fait un angle avec ce plan", "Il est parfaitement droit", "Il est couché à plat dans ce plan", "Il change de place chaque jour"],
      reponse: "Il est penché et fait un angle avec ce plan",
      explication: "L'axe de rotation est incliné par rapport au plan de l'écliptique. C'est ce qui fait varier la durée du jour selon les lieux.", source: R(2) },
    { id: "svt-s01-2-q6", fiche: "svt-s01-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "L'axe de rotation de la Terre est parfaitement droit par rapport au plan de l'écliptique.",
      corrections: ["Faux : il est penché et fait un angle avec le plan de l'écliptique.", "Faux : il est couché à plat dans le plan de l'écliptique.", "Faux : la Terre n'a pas d'axe de rotation."],
      reponse: { vrai: false, correction: "Faux : il est penché et fait un angle avec le plan de l'écliptique." },
      explication: "L'axe de la Terre est incliné. Cette inclinaison change la durée du jour d'un endroit à l'autre.", source: R(2) },
    { id: "svt-s01-2-q7", fiche: "svt-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi la durée du jour n'est-elle pas la même partout sur le globe ?",
      choix: ["Parce que l'axe de rotation de la Terre est incliné", "Parce que la Terre ne tourne pas sur elle-même", "Parce que le Soleil s'éteint la nuit", "Parce que la Lune cache le Soleil"],
      reponse: "Parce que l'axe de rotation de la Terre est incliné",
      explication: "Comme l'axe de rotation est penché, la durée du jour et celle de la nuit varient d'un lieu à l'autre. Selon l'endroit, les journées sont plus ou moins longues.", source: R(2) },
    { id: "svt-s01-2-q8", fiche: "svt-s01-2-f2", type: "trou", niveau: 2,
      enonce: "Complète la phrase.",
      texte: "L'axe de rotation de la Terre est ___ par rapport au plan de l'___.",
      banque: ["incliné", "écliptique", "équateur", "vertical"],
      reponse: [["incliné", "penché"], ["écliptique"]],
      explication: "L'axe est incliné par rapport au plan de l'écliptique. Ce plan est celui de la révolution de la Terre.", source: R(2) },
    // f3 : l'orbite en ellipse
    { id: "svt-s01-2-q9", fiche: "svt-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Quelle forme a l'orbite de la Terre autour du Soleil ?",
      choix: ["Une ellipse, c'est-à-dire un ovale", "Un carré", "Une ligne droite", "Une spirale"],
      reponse: "Une ellipse, c'est-à-dire un ovale",
      explication: "L'orbite de la Terre est une ellipse. Le Soleil est placé à l'un de ses deux centres.", source: R(1) },
    { id: "svt-s01-2-q10", fiche: "svt-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "L'aphélie est le point de l'orbite où la Terre est la plus proche du Soleil.",
      corrections: ["Faux : c'est le point le plus éloigné ; le plus proche s'appelle le périhélie.", "Faux : l'aphélie est le centre de l'orbite.", "Faux : l'aphélie est un satellite de la Terre."],
      reponse: { vrai: false, correction: "Faux : c'est le point le plus éloigné ; le plus proche s'appelle le périhélie." },
      explication: "Aphélie : le plus loin du Soleil, début juillet. Périhélie : le plus près, début janvier.", source: R(1) },
    { id: "svt-s01-2-q11", fiche: "svt-s01-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi ne peut-on pas dire que l'hiver de l'hémisphère nord vient de l'éloignement du Soleil ?",
      choix: ["Parce qu'en hiver, la Terre est justement au plus près du Soleil", "Parce que la Terre ne s'éloigne jamais du Soleil", "Parce que le Soleil tourne autour de la Terre", "Parce que l'orbite est un cercle parfait"],
      reponse: "Parce qu'en hiver, la Terre est justement au plus près du Soleil",
      explication: "Le périhélie, point le plus proche, tombe début janvier, en plein hiver au nord. L'éloignement n'explique donc pas l'hiver.", source: R(1) },
    { id: "svt-s01-2-q12", fiche: "svt-s01-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque mot à sa définition.",
      gauche: ["Périhélie", "Aphélie", "Ellipse", "Soleil"],
      droite: ["Une forme ovale", "Le point le plus éloigné du Soleil", "L'un des deux centres de l'orbite", "Le point le plus proche du Soleil"],
      reponse: [[0, 3], [1, 1], [2, 0], [3, 2]],
      explication: "Périhélie : le plus près ; aphélie : le plus loin. L'orbite est une ellipse et le Soleil occupe l'un de ses deux centres.", source: R(1) },
    { id: "svt-s01-2-q13", fiche: "svt-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Vers quel moment de l'année la Terre passe-t-elle au périhélie ?",
      choix: ["Début janvier", "Début juillet", "Fin mars", "Fin septembre"],
      reponse: "Début janvier",
      explication: "Le périhélie arrive vers le 3 janvier. L'aphélie, six mois plus tard, vers le 3 juillet.", source: R(1) },
    // f4 : solstices et équinoxes
    { id: "svt-s01-2-q14", fiche: "svt-s01-2-f4", type: "qcm", niveau: 1,
      enonce: "Vers quels mois ont lieu les deux solstices ?",
      choix: ["Juin et décembre", "Mars et septembre", "Janvier et juillet", "Avril et octobre"],
      reponse: "Juin et décembre",
      explication: "Les solstices tombent en juin et en décembre. Les équinoxes, eux, tombent en mars et en septembre.", source: R(1) },
    { id: "svt-s01-2-q15", fiche: "svt-s01-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le jour d'un équinoxe, le jour et la nuit ont la même durée partout sur le globe.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Aux équinoxes, chaque point du globe a autant de jour que de nuit. Le reste de l'année, seul l'équateur est dans ce cas.", source: R(2) },
    { id: "svt-s01-2-q16", fiche: "svt-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment reconnaître le jour d'un équinoxe ?",
      choix: ["Partout sur Terre, le jour dure autant que la nuit", "C'est le jour le plus long de l'année partout", "La Terre est au plus loin du Soleil", "Le Soleil ne se lève nulle part"],
      reponse: "Partout sur Terre, le jour dure autant que la nuit",
      explication: "Un équinoxe partage la journée en deux parts égales, partout. Cela arrive en mars et en septembre.", source: R(2) },
    { id: "svt-s01-2-q17", fiche: "svt-s01-2-f4", type: "ordre", niveau: 2,
      enonce: "Range ces positions de la Terre dans l'ordre de l'année, en partant de l'équinoxe de mars.",
      elements: ["Solstice de décembre", "Équinoxe de mars", "Équinoxe de septembre", "Solstice de juin"],
      reponse: [1, 3, 2, 0],
      explication: "Mars, juin, septembre, décembre : un repère tous les trois mois. Équinoxes et solstices alternent.", source: R(1) },
    // f5 : faire des fiches
    { id: "svt-s01-2-q18", fiche: "svt-s01-2-f5", type: "qcm", niveau: 1,
      enonce: "Pourquoi numérote-t-on ses fiches de révision ?",
      choix: ["Pour pouvoir les ranger dans l'ordre", "Pour savoir combien elles coûtent", "Pour les colorier plus vite", "Pour ne pas avoir à écrire de titre"],
      reponse: "Pour pouvoir les ranger dans l'ordre",
      explication: "Le numéro permet de remettre les fiches dans l'ordre. On s'y retrouve plus vite pour réviser.", source: C(2) },
    { id: "svt-s01-2-q19", fiche: "svt-s01-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "Sur une fiche de révision, on écrit tous les titres de la même couleur.",
      corrections: ["Faux : on choisit une couleur pour chaque niveau de titre.", "Faux : on n'écrit aucun titre sur une fiche.", "Faux : les titres s'écrivent seulement au crayon à papier."],
      reponse: { vrai: false, correction: "Faux : on choisit une couleur pour chaque niveau de titre." },
      explication: "Une couleur par niveau de titre aide à voir le plan d'un coup d'œil. On décale aussi d'un carreau à chaque sous-titre.", source: C(2) },
    { id: "svt-s01-2-q20", fiche: "svt-s01-2-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qu'on trouve sur une bonne fiche de révision.",
      choix: ["Un numéro pour la ranger", "Les définitions", "Un résumé encadré en couleur", "Un schéma", "Une recette de cuisine"],
      reponse: ["Un numéro pour la ranger", "Les définitions", "Un résumé encadré en couleur", "Un schéma"],
      explication: "Numéro, définitions, résumé encadré et schéma font une fiche efficace. Le schéma aide à visualiser le résumé.", source: C(2) }
  ],
  bonus: [],
  nonCouvert: [
    "Le lien entre l'inclinaison de l'axe et l'alternance des saisons : la leçon du livret n'est pas déposée, et les ressources n'expliquent que les variations de la durée du jour.",
    "La durée de la révolution de la Terre autour du Soleil n'est donnée dans aucun fichier déposé.",
    "Les autres « axes » que la leçon présenterait au-delà de l'axe de rotation et du plan de l'écliptique."
  ]
};
