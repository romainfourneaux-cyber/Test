// Source en clair du cours svt-s01-2 (livret 1, chapitre 1, séance 2 : les axes de la Terre).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s01-2.js.
// Sources déposées : les ressources complémentaires (p. 1 : orbite, périhélie, aphélie, solstices et
// équinoxes ; p. 2 : axe de rotation et plan de l'écliptique ; p. 3 : durée de rotation de la Terre) et le
// corrigé du livret 1 (p. 2 : faire des fiches). Le livret lui-même n'est pas déposé.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
const R = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Ressources complementaires.pdf", page: page });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Séance 2 – La Terre une planète en mouvement – Les axes de la Terre", titre, editeur: "Wikipédia", url });

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
      choix: ["Un peu moins d'une journée", "Un peu plus d'une journée entière", "Environ 27 jours", "Environ 243 jours"],
      reponse: "Un peu moins d'une journée",
      explication: "Un tour complet de la Terre sur elle-même prend un peu moins d'une journée entière. Mars, elle, met un peu plus d'une journée.", source: R(3) },
    { id: "svt-s01-2-q21", fiche: "svt-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "La Terre accomplit sa révolution autour de son axe de rotation.",
      corrections: ["Faux : sa révolution se fait autour du Soleil ; autour de son axe, c'est sa rotation.", "Faux : sa révolution se fait autour de la Lune.", "Faux : sa révolution se fait autour du plan de l'écliptique."],
      reponse: { vrai: false, correction: "Faux : sa révolution se fait autour du Soleil ; autour de son axe, c'est sa rotation." },
      explication: "Tourner autour du Soleil, c'est la révolution. Tourner sur soi-même, autour de son axe, c'est la rotation.", source: R(2) },
    { id: "svt-s01-2-q22", fiche: "svt-s01-2-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Coche ce qui concerne la révolution de la Terre, et non sa rotation.",
      choix: ["Elle se fait autour du Soleil", "Elle suit l'orbite de la Terre", "Elle se fait dans le plan de l'écliptique", "Elle se fait autour de l'axe de rotation", "Elle dure un peu moins d'une journée"],
      reponse: ["Elle se fait autour du Soleil", "Elle suit l'orbite de la Terre", "Elle se fait dans le plan de l'écliptique"],
      explication: "La révolution suit l'orbite autour du Soleil, dans le plan de l'écliptique. Tourner autour de l'axe en un peu moins d'une journée, c'est la rotation.", source: R(2) },
    { id: "svt-s01-2-q23", fiche: "svt-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que la Terre a deux mouvements à la fois ?",
      choix: ["Elle tourne sur elle-même et autour du Soleil", "Elle tourne sur elle-même et autour de la Lune", "Elle tourne autour des deux centres de son orbite", "Elle tourne autour du Soleil, et le Soleil autour d'elle"],
      reponse: "Elle tourne sur elle-même et autour du Soleil",
      explication: "La Terre fait sa rotation sur elle-même et, en même temps, sa révolution autour du Soleil. Ce sont ses deux mouvements.", source: R(2) },
    // f2 : l'axe incliné
    { id: "svt-s01-2-q5", fiche: "svt-s01-2-f2", type: "qcm", niveau: 1,
      enonce: "Comment est placé l'axe de rotation de la Terre par rapport au plan de l'écliptique ?",
      choix: ["Penché, avec un angle", "Parfaitement droit", "Couché à plat dans ce plan", "Penché seulement en hiver"],
      reponse: "Penché, avec un angle",
      explication: "L'axe de rotation est incliné par rapport au plan de l'écliptique. C'est ce qui fait varier la durée du jour selon les lieux.", source: R(2) },
    { id: "svt-s01-2-q6", fiche: "svt-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Comme l'axe de rotation est incliné, le jour et la nuit durent aussi longtemps l'un que l'autre partout sur le globe, toute l'année.",
      corrections: ["Faux : à cause de cette inclinaison, la durée du jour change beaucoup selon l'endroit.", "Faux : à cause de cette inclinaison, il fait nuit six mois partout sur le globe.", "Faux : l'axe n'est pas incliné, il est parfaitement droit."],
      reponse: { vrai: false, correction: "Faux : à cause de cette inclinaison, la durée du jour change beaucoup selon l'endroit." },
      explication: "C'est justement l'inclinaison de l'axe qui fait varier la durée du jour et de la nuit d'un lieu à l'autre. Seul l'équateur garde toute l'année autant de jour que de nuit.", source: R(2) },
    { id: "svt-s01-2-q7", fiche: "svt-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi la durée du jour n'est-elle pas la même partout sur le globe ?",
      choix: ["L'axe de rotation de la Terre est incliné", "L'orbite de la Terre est une ellipse", "La Terre est plus près du Soleil en janvier", "La Lune cache le Soleil à certains endroits"],
      reponse: "L'axe de rotation de la Terre est incliné",
      explication: "Comme l'axe de rotation est penché, la durée du jour et celle de la nuit varient d'un lieu à l'autre. L'orbite en ellipse, elle, n'explique pas ces différences.", source: R(2) },
    { id: "svt-s01-2-q8", fiche: "svt-s01-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "L'axe de rotation de la Terre est ___ par rapport au plan de l'___.",
      banque: ["incliné", "écliptique", "équateur", "vertical"],
      reponse: [["incliné", "penché"], ["écliptique"]],
      explication: "L'axe est incliné par rapport au plan de l'écliptique. Ce plan est celui de la révolution de la Terre.", source: R(2) },
    { id: "svt-s01-2-q24", fiche: "svt-s01-2-f2", type: "vrai_faux", niveau: 3,
      enonce: "C'est parce que la durée du jour change selon les lieux que l'axe de rotation de la Terre est incliné.",
      corrections: ["Faux : c'est l'inverse, l'inclinaison de l'axe fait varier la durée du jour selon les lieux.", "Faux : l'axe de rotation de la Terre n'est pas incliné.", "Faux : la durée du jour est la même partout sur le globe."],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse, l'inclinaison de l'axe fait varier la durée du jour selon les lieux." },
      explication: "L'inclinaison de l'axe est la cause, la variation de la durée du jour en est la conséquence. La phrase met la cause et la conséquence à l'envers.", source: R(2) },
    { id: "svt-s01-2-q25", fiche: "svt-s01-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les phrases justes sur l'axe de rotation de la Terre.",
      choix: ["Il est penché par rapport au plan de l'écliptique", "La Terre tourne sur elle-même autour de lui", "Son inclinaison fait varier la durée du jour selon les lieux", "Il est couché à plat dans le plan de l'écliptique", "La Terre fait sa révolution autour de lui"],
      reponse: ["Il est penché par rapport au plan de l'écliptique", "La Terre tourne sur elle-même autour de lui", "Son inclinaison fait varier la durée du jour selon les lieux"],
      explication: "La Terre tourne sur elle-même autour de son axe, penché par rapport au plan de l'écliptique, et cette inclinaison fait varier la durée du jour selon les lieux. Sa révolution, elle, se fait autour du Soleil.", source: R(2) },
    { id: "svt-s01-2-q38", fiche: "svt-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'axe de rotation de la Terre est penché par rapport au plan dans lequel elle tourne autour du Soleil.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Le plan dans lequel la Terre tourne autour du Soleil s'appelle le plan de l'écliptique. Son axe de rotation fait un angle avec ce plan.", source: R(2) },
    // f3 : l'orbite en ellipse
    { id: "svt-s01-2-q9", fiche: "svt-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Quelle forme a l'orbite de la Terre autour du Soleil ?",
      choix: ["Une ellipse, c'est-à-dire un ovale", "Un cercle parfait autour du Soleil", "Une spirale qui s'éloigne du Soleil", "Une ligne droite qui passe par le Soleil"],
      reponse: "Une ellipse, c'est-à-dire un ovale",
      explication: "L'orbite de la Terre est une ellipse. Le Soleil est placé à l'un de ses deux centres.", source: R(1) },
    { id: "svt-s01-2-q10", fiche: "svt-s01-2-f3", type: "vrai_faux", niveau: 3,
      enonce: "L'aphélie est le point de l'orbite où la Terre est la plus proche du Soleil.",
      corrections: ["Faux : c'est le point le plus éloigné ; le plus proche s'appelle le périhélie.", "Faux : c'est le point le plus éloigné, atteint vers le 3 janvier.", "Faux : c'est le point où la Terre passe à l'équinoxe."],
      reponse: { vrai: false, correction: "Faux : c'est le point le plus éloigné ; le plus proche s'appelle le périhélie." },
      explication: "Aphélie : le plus loin du Soleil, début juillet. Périhélie : le plus près, début janvier.", source: R(1) },
    { id: "svt-s01-2-q11", fiche: "svt-s01-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi ne peut-on pas dire que l'hiver de l'hémisphère nord vient de l'éloignement du Soleil ?",
      choix: ["En hiver, la Terre est justement au plus près du Soleil", "En hiver, la Terre est justement au plus loin du Soleil", "La distance entre la Terre et le Soleil ne change jamais", "Le périhélie tombe en plein été, dans l'hémisphère nord"],
      reponse: "En hiver, la Terre est justement au plus près du Soleil",
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
    { id: "svt-s01-2-q26", fiche: "svt-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Vers le 3 juillet, où en est la Terre sur son orbite ?",
      choix: ["À l'aphélie, au plus loin du Soleil", "Au périhélie, au plus près du Soleil", "À l'aphélie, au plus près du Soleil", "Au périhélie, au plus loin du Soleil"],
      reponse: "À l'aphélie, au plus loin du Soleil",
      explication: "Début juillet, la Terre passe à l'aphélie, le point de son orbite le plus éloigné du Soleil. Le périhélie, le plus proche, tombe début janvier.", source: R(1) },
    { id: "svt-s01-2-q27", fiche: "svt-s01-2-f3", type: "qcm", niveau: 3,
      enonce: "Début juillet, la Terre est au plus loin du Soleil. Quelle saison est-ce alors dans l'hémisphère sud ?",
      choix: ["L'hiver", "L'été", "Le printemps", "L'automne"],
      reponse: "L'hiver",
      explication: "Au nord, la Terre est au plus loin du Soleil en été. Au sud, c'est l'inverse : à ce moment-là, c'est l'hiver.", source: R(1) },
    { id: "svt-s01-2-q28", fiche: "svt-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le Soleil se trouve exactement au milieu de l'orbite de la Terre.",
      corrections: ["Faux : il occupe l'un des deux centres de l'ellipse.", "Faux : il se trouve en dehors de l'orbite.", "Faux : il se trouve sur l'orbite, comme la Terre."],
      reponse: { vrai: false, correction: "Faux : il occupe l'un des deux centres de l'ellipse." },
      explication: "L'orbite est une ellipse, qui a deux centres. Le Soleil occupe l'un d'eux, ce qui explique qu'il y ait un point plus proche et un point plus éloigné.", source: R(1) },
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
    { id: "svt-s01-2-q16", fiche: "svt-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Le jour de l'équinoxe de septembre, comment se partagent le jour et la nuit en France ?",
      choix: ["Ils durent autant l'un que l'autre", "Le jour dure deux fois plus que la nuit", "La nuit dure deux fois plus que le jour", "Il fait jour pendant toute la journée"],
      reponse: "Ils durent autant l'un que l'autre",
      explication: "Le jour d'un équinoxe, jour et nuit ont la même durée en tout point du globe. La France ne fait pas exception, même si la durée de ses jours varie beaucoup le reste de l'année.", source: R(2) },
    { id: "svt-s01-2-q17", fiche: "svt-s01-2-f4", type: "ordre", niveau: 2,
      enonce: "Range ces positions de la Terre dans l'ordre de l'année, en partant de l'équinoxe de mars.",
      elements: ["Solstice de décembre", "Équinoxe de mars", "Équinoxe de septembre", "Solstice de juin"],
      reponse: [1, 3, 2, 0],
      explication: "Mars, juin, septembre, décembre : un repère tous les trois mois. Équinoxes et solstices alternent.", source: R(1) },
    { id: "svt-s01-2-q29", fiche: "svt-s01-2-f4", type: "qcm", niveau: 1,
      enonce: "Combien y a-t-il de solstices et d'équinoxes en tout au cours d'une année ?",
      choix: ["Quatre : deux de chaque", "Deux : un de chaque", "Quatre : un solstice, trois équinoxes", "Six : trois de chaque"],
      reponse: "Quatre : deux de chaque",
      explication: "Il y a deux solstices, en juin et en décembre, et deux équinoxes, en mars et en septembre. Ce sont les quatre positions repères de la Terre sur son orbite.", source: R(1) },
    { id: "svt-s01-2-q30", fiche: "svt-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Combien de temps sépare un équinoxe du solstice qui le suit ?",
      choix: ["Environ trois mois", "Environ six mois", "Environ six semaines", "Environ deux mois"],
      reponse: "Environ trois mois",
      explication: "De mars à juin, puis de juin à septembre, il s'écoule environ trois mois. Équinoxes et solstices alternent ainsi tout au long de l'année.", source: R(1) },
    { id: "svt-s01-2-q31", fiche: "svt-s01-2-f4", type: "vrai_faux", niveau: 3,
      enonce: "Le solstice de décembre a lieu peu avant le passage de la Terre au périhélie.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Le solstice de décembre arrive à la fin de ce mois, et le périhélie vers le 3 janvier. Ils ne sont séparés que d'environ deux semaines.", source: R(1) },
    { id: "svt-s01-2-q32", fiche: "svt-s01-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Les équinoxes ont lieu en juin et en décembre.",
      corrections: ["Faux : ce sont les solstices ; les équinoxes ont lieu en mars et en septembre.", "Faux : les équinoxes ont lieu début janvier et début juillet.", "Faux : il n'y a qu'un équinoxe par an, en mars."],
      reponse: { vrai: false, correction: "Faux : ce sont les solstices ; les équinoxes ont lieu en mars et en septembre." },
      explication: "Juin et décembre sont les mois des solstices. Les équinoxes tombent entre eux, en mars et en septembre.", source: R(1) },
    // f5 : fiche de méthode sans savoir de SVT ; ses questions sont des questions de thème sur les axes de la Terre (audit du 28/10/2026)
    { id: "svt-s01-2-q18", fiche: "svt-s01-2-f5", type: "qcm", niveau: 1,
      enonce: "Pourquoi le Soleil se lève-t-il à l'est ?",
      choix: ["Parce que la Terre tourne sur elle-même d'ouest en est", "Parce que le Soleil tourne autour de la Terre", "Parce que l'axe de la Terre est penché", "Parce que la Terre est plus près du Soleil au lever du jour"],
      reponse: "Parce que la Terre tourne sur elle-même d'ouest en est",
      explication: "La Terre tourne sur elle-même vers l'est, en un peu moins d'une journée. Vu du sol, le Soleil semble donc apparaître à l'est et disparaître à l'ouest.",
      indice: "Pense au sens dans lequel la Terre tourne sur elle-même.",
      source: T("Rotation de la Terre", "https://fr.wikipedia.org/wiki/Rotation_de_la_Terre") },
    { id: "svt-s01-2-q19", fiche: "svt-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "Les saisons existent parce que la distance entre la Terre et le Soleil change au cours de l'année.",
      corrections: ["Faux : elles viennent de l'inclinaison de l'axe de la Terre ; la Terre est même au plus près du Soleil en janvier.", "Faux : elles viennent de la Lune, qui cache le Soleil une partie de l'année.", "Faux : elles viennent de la vitesse de rotation de la Terre, qui change selon les mois."],
      reponse: { vrai: false, correction: "Faux : elles viennent de l'inclinaison de l'axe de la Terre ; la Terre est même au plus près du Soleil en janvier." },
      explication: "La Terre passe au plus près du Soleil début janvier, en plein hiver au nord : la distance n'explique donc pas les saisons. C'est l'inclinaison de l'axe de rotation qui les fait.",
      source: T("Saison", "https://fr.wikipedia.org/wiki/Saison") },
    { id: "svt-s01-2-q20", fiche: "svt-s01-2-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qui est vrai de l'axe de rotation de la Terre.",
      choix: ["Il est penché d'environ 23 degrés", "Il garde la même direction pendant tout le tour autour du Soleil", "Son inclinaison explique les saisons", "Il se redresse à chaque équinoxe", "Il est couché à plat dans le plan de l'écliptique"],
      reponse: ["Il est penché d'environ 23 degrés", "Il garde la même direction pendant tout le tour autour du Soleil", "Son inclinaison explique les saisons"],
      explication: "L'axe de la Terre est incliné d'environ 23 degrés et pointe toujours dans la même direction pendant la révolution. C'est pour cela qu'un hémisphère est tourné vers le Soleil pendant six mois, puis l'autre.",
      source: T("Obliquité", "https://fr.wikipedia.org/wiki/Obliquit%C3%A9") },
    { id: "svt-s01-2-q33", fiche: "svt-s01-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "La Terre met environ 365 jours et un quart pour faire un tour complet autour du Soleil.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Une révolution complète dure à peu près 365 jours et un quart. Ce quart de jour en trop s'accumule et donne le 29 février tous les quatre ans.",
      source: T("Année", "https://fr.wikipedia.org/wiki/Ann%C3%A9e") },
    { id: "svt-s01-2-q34", fiche: "svt-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "L'alternance du jour et de la nuit vient du tour que fait la Terre autour du Soleil.",
      corrections: ["Faux : elle vient de la rotation de la Terre sur elle-même, en un peu moins d'une journée.", "Faux : elle vient de la Lune, qui cache le Soleil chaque nuit.", "Faux : elle vient de l'inclinaison de l'axe de la Terre."],
      reponse: { vrai: false, correction: "Faux : elle vient de la rotation de la Terre sur elle-même, en un peu moins d'une journée." },
      explication: "C'est la rotation de la Terre sur elle-même qui tourne chaque lieu vers le Soleil, puis vers l'ombre. Le tour autour du Soleil, lui, donne l'année.",
      source: T("Rotation de la Terre", "https://fr.wikipedia.org/wiki/Rotation_de_la_Terre") },
    { id: "svt-s01-2-q35", fiche: "svt-s01-2-f5", type: "ordre", niveau: 2,
      enonce: "Range ces durées de la plus courte à la plus longue.",
      elements: ["Une saison", "Une rotation de la Terre sur elle-même", "Une révolution de la Terre autour du Soleil", "Un tour de la Lune autour de la Terre"],
      reponse: [1, 3, 0, 2],
      explication: "La Terre tourne sur elle-même en un peu moins d'un jour, et la Lune fait le tour de la Terre en environ 27 jours. Une saison dure environ trois mois et la révolution complète environ 365 jours.",
      source: T("Lune", "https://fr.wikipedia.org/wiki/Lune") },
    { id: "svt-s01-2-q36", fiche: "svt-s01-2-f5", type: "association", niveau: 3,
      enonce: "Relie chaque mouvement ou particularité de la Terre à ce qu'il produit.",
      gauche: ["La rotation de la Terre sur elle-même", "La révolution de la Terre autour du Soleil", "L'inclinaison de l'axe de rotation", "L'orbite en forme d'ellipse"],
      droite: ["Les saisons", "Un point le plus proche et un point le plus éloigné du Soleil", "Le jour et la nuit", "L'année"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "La rotation donne le jour et la nuit, la révolution donne l'année, et l'axe penché donne les saisons. Comme l'orbite est une ellipse, la Terre passe par un point le plus proche du Soleil, le périhélie, et un point le plus éloigné, l'aphélie.",
      source: T("Saison", "https://fr.wikipedia.org/wiki/Saison") },
    { id: "svt-s01-2-q37", fiche: "svt-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi ajoute-t-on un 29 février tous les quatre ans ?",
      choix: ["Parce qu'un tour autour du Soleil dure un peu plus de 365 jours", "Parce que février est le mois le plus froid de l'année", "Parce que la Terre tourne un peu moins vite sur elle-même tous les quatre ans", "Parce que la Lune fait un tour de plus cette année-là"],
      reponse: "Parce qu'un tour autour du Soleil dure un peu plus de 365 jours",
      explication: "Une révolution dure environ 365 jours et un quart. Tous les quatre ans, ces quarts de jour font un jour entier, qu'on ajoute au calendrier.",
      indice: "Compte ce que font quatre quarts de jour.",
      source: T("Année bissextile", "https://fr.wikipedia.org/wiki/Ann%C3%A9e_bissextile") }
  ],
  bonus: [
    {
      id: "svt-s01-2-b1",
      fiche: "svt-s01-2-f1",
      titre: "Voir la Terre tourner",
      texte: "En 1851, le physicien Léon Foucault suspend un pendule de 67 mètres sous la voûte du Panthéon, à Paris. Au fil des heures, la direction de ses allers-retours tourne lentement. Cette expérience montre que la Terre tourne sur elle-même.",
      source: { titre: "Pendule de Foucault", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Pendule_de_Foucault" }
    }
  ],
  nonCouvert: [
    "Le lien entre l'inclinaison de l'axe et l'alternance des saisons : la leçon du livret n'est pas déposée, et les ressources n'expliquent que les variations de la durée du jour.",
    "La durée de la révolution de la Terre autour du Soleil n'est donnée dans aucun fichier déposé.",
    "Les autres « axes » que la leçon présenterait au-delà de l'axe de rotation et du plan de l'écliptique."
  ]
};
