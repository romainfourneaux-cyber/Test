// Source en clair du cours svt-s01-1 (livret 1, chapitre 1, séance 1 : la Terre dans le système solaire).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s01-1.js.
// Sources déposées : le corrigé du livret 1 (p. 1 : représenter le système solaire ; p. 2 : fiches modèles
// qui résument la séance) et les ressources complémentaires (p. 1 : planètes naines). Le livret lui-même
// n'est pas déposé : ce qu'il est seul à enseigner va dans nonCouvert.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
const R = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Ressources complementaires.pdf", page: page });

module.exports = {
  id: "svt-s01-1",
  fiches: [
    {
      id: "svt-s01-1-f1", notion: "Le Soleil et l'ordre des planètes",
      titre: "Huit planètes autour d'une étoile",
      texte: "Le Soleil est une étoile. Huit planètes tournent autour de lui. En partant du Soleil, on trouve Mercure, Vénus, la Terre et Mars, puis une ceinture d'astéroïdes, puis Jupiter, Saturne, Uranus et Neptune. Plus loin encore viennent la ceinture de Kuiper et le nuage d'Oort.",
      pointsCles: [
        "Le Soleil est l'étoile du système solaire : toutes les planètes gravitent autour de lui",
        "Ordre : Mercure, Vénus, Terre, Mars | ceinture d'astéroïdes | Jupiter, Saturne, Uranus, Neptune",
        "Au-delà de Neptune : la ceinture de Kuiper, puis le nuage d'Oort"
      ],
      astuce: "Retiens les abréviations de la fiche modèle : Me, Ve, Te, Ma, puis la ceinture, puis Ju, Sa, Ur, Ne.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "système solaire", def: "le Soleil et l'ensemble des planètes qui gravitent autour de lui" },
        { mot: "graviter", def: "tourner autour d'un astre, comme les planètes autour du Soleil" }
      ],
      schema: "svt-s01-1-s1", prerequis: [], source: C(1)
    },
    {
      id: "svt-s01-1-f2", notion: "Planètes telluriques et planètes gazeuses",
      titre: "Deux familles de planètes",
      texte: "Les planètes telluriques ont un noyau de métal et de roche : Mercure, Vénus, la Terre et Mars. Les planètes gazeuses, qu'on appelle aussi joviennes, sont faites uniquement de gaz : Jupiter, Saturne, Uranus et Neptune. La ceinture principale d'astéroïdes sépare les deux familles.",
      pointsCles: [
        "Telluriques (noyau métallo-rocheux) : Mercure, Vénus, Terre, Mars",
        "Gazeuses ou joviennes (seulement du gaz) : Jupiter, Saturne, Uranus, Neptune",
        "Mars est la tellurique la plus éloignée du Soleil, Neptune la gazeuse la plus éloignée"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "planète tellurique", def: "une planète avec un noyau de métal et de roche, comme la Terre ou Mars" },
        { mot: "planète gazeuse", def: "une planète constituée uniquement de gaz, comme Jupiter ; on dit aussi planète jovienne" },
        { mot: "ceinture principale d'astéroïdes", def: "la zone d'astéroïdes placée entre Mars et Jupiter, qui sépare les planètes telluriques des planètes gazeuses" }
      ],
      schema: "svt-s01-1-s1", prerequis: ["svt-s01-1-f1"], source: C(1)
    },
    {
      id: "svt-s01-1-f3", notion: "Le portrait de quelques planètes",
      titre: "Des planètes très différentes",
      texte: "Mercure est la plus petite planète et la plus proche du Soleil. Vénus a la même taille que la Terre, mais elle est entourée d'une atmosphère épaisse qu'on ne peut pas respirer, et il y fait plus de 400 °C. Jupiter est la plus grosse planète, avec de nombreux satellites. Saturne, géante gazeuse, porte des anneaux.",
      pointsCles: [
        "Mercure : la plus petite, la plus proche du Soleil",
        "Vénus : même taille que la Terre, atmosphère très épaisse et irrespirable, plus de 400 °C",
        "Jupiter : la plus grosse, juste après la ceinture d'astéroïdes, beaucoup de satellites",
        "Saturne : géante gazeuse à anneaux, voisine de Jupiter ; Uranus entre Saturne et Neptune"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["svt-s01-1-f2"], source: C(1)
    },
    {
      id: "svt-s01-1-f4", notion: "La Terre, une planète à part",
      titre: "Notre planète",
      texte: "La Terre est la troisième planète en partant du Soleil, entre Vénus et Mars. C'est une planète tellurique, à environ 150 millions de kilomètres du Soleil. Elle possède une atmosphère, de l'eau liquide et un seul satellite : la Lune.",
      pointsCles: [
        "Troisième planète du système solaire, entre Vénus et Mars",
        "Tellurique, à environ 150 millions de km du Soleil",
        "Une atmosphère, de l'eau liquide, un satellite : la Lune"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "Lune", def: "le seul satellite de la Terre" }
      ],
      schema: null, prerequis: ["svt-s01-1-f2"], source: C(2)
    },
    {
      id: "svt-s01-1-f5", notion: "Le système solaire dans l'Univers",
      titre: "Où se trouve le système solaire ?",
      texte: "Le système solaire n'est pas seul. Il appartient à une galaxie, la Voie lactée, qui contient aussi beaucoup d'autres systèmes stellaires. Et l'Univers compte encore de nombreuses autres galaxies.",
      pointsCles: [
        "Univers > galaxies > la Voie lactée > le système solaire > la Terre",
        "La Voie lactée abrite d'autres systèmes stellaires que le nôtre",
        "Mots de la leçon à connaître : astre, étoile, planète, système stellaire, galaxie"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "Voie lactée", def: "la galaxie dans laquelle se trouve le système solaire" }
      ],
      schema: null, prerequis: ["svt-s01-1-f1"], source: C(2)
    },
    {
      id: "svt-s01-1-f6", notion: "Les planètes naines",
      titre: "Pluton, Cérès et les planètes naines",
      texte: "Une planète naine est une petite planète rocheuse dont l'orbite contient aussi d'autres corps célestes. On en connaît cinq aujourd'hui. Pluton est considérée comme la première d'entre elles ; Cérès en est une autre.",
      pointsCles: [
        "Planète naine : petite, rocheuse, et pas seule sur son orbite",
        "Cinq planètes naines connues aujourd'hui, dont Pluton et Cérès",
        "Pluton n'est donc pas comptée parmi les huit planètes"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "planète naine", def: "une petite planète rocheuse dont l'orbite contient d'autres corps célestes, comme Pluton ou Cérès" }
      ],
      schema: null, prerequis: ["svt-s01-1-f1"], source: R(1)
    }
  ],
  schemas: [
    {
      id: "svt-s01-1-s1", legende: "Le système solaire, sans respecter les distances ni les tailles : les planètes telluriques en bleu, les planètes gazeuses en ocre.",
      svg: "<svg viewBox='0 0 640 240' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='12'>" +
        "<circle cx='-30' cy='115' r='78' fill='#e3b341' stroke='#b08d3a' stroke-width='2'/>" +
        "<text x='6' y='122' fill='#2e2419' font-weight='bold'>Soleil</text>" +
        "<g fill='#4a78a8' stroke='#2e2419' stroke-width='1'>" +
        "<circle cx='72' cy='115' r='4'/><circle cx='102' cy='115' r='7'/><circle cx='136' cy='115' r='7'/><circle cx='168' cy='115' r='5'/></g>" +
        "<circle cx='146' cy='101' r='2.5' fill='#8a7f70'/>" +
        "<g fill='#2e2419' text-anchor='middle'>" +
        "<text x='72' y='140'>Mercure</text><text x='102' y='96'>Vénus</text><text x='136' y='140'>Terre</text><text x='168' y='96'>Mars</text>" +
        "<text x='152' y='84' font-size='10' fill='#5b5044'>Lune</text></g>" +
        "<line x1='200' y1='30' x2='200' y2='200' stroke='#5b5044' stroke-width='2' stroke-dasharray='3 6'/>" +
        "<text x='200' y='222' text-anchor='middle' font-size='11' fill='#5b5044'>ceinture principale d'astéroïdes</text>" +
        "<g fill='#d9a63a' stroke='#2e2419' stroke-width='1'>" +
        "<circle cx='262' cy='115' r='26'/><circle cx='342' cy='115' r='21'/><circle cx='412' cy='115' r='13'/><circle cx='460' cy='115' r='12'/></g>" +
        "<ellipse cx='342' cy='115' rx='34' ry='8' fill='none' stroke='#2e2419' stroke-width='1.5'/>" +
        "<g fill='#2e2419' text-anchor='middle'>" +
        "<text x='262' y='160'>Jupiter</text><text x='342' y='160'>Saturne</text><text x='412' y='92'>Uranus</text><text x='460' y='145'>Neptune</text></g>" +
        "<path d='M505 30 Q520 115 505 200' fill='none' stroke='#5b5044' stroke-width='2' stroke-dasharray='3 6'/>" +
        "<text x='512' y='222' text-anchor='middle' font-size='11' fill='#5b5044'>ceinture de Kuiper</text>" +
        "<path d='M585 20 Q605 115 585 210' fill='none' stroke='#8a7f70' stroke-width='2' stroke-dasharray='1 5'/>" +
        "<text x='600' y='14' text-anchor='middle' font-size='11' fill='#5b5044'>nuage d'Oort</text>" +
        "<circle cx='60' cy='20' r='6' fill='#4a78a8'/><text x='72' y='24' fill='#2e2419'>planètes telluriques</text>" +
        "<circle cx='60' cy='40' r='6' fill='#d9a63a'/><text x='72' y='44' fill='#2e2419'>planètes gazeuses</text>" +
        "</svg>"
    }
  ],
  questions: [
    // f1 : le Soleil et l'ordre des planètes
    { id: "svt-s01-1-q1", fiche: "svt-s01-1-f1", type: "qcm", niveau: 1,
      enonce: "Quelle planète est la plus proche du Soleil ?",
      choix: ["Mercure", "Vénus", "Mars", "Neptune"],
      reponse: "Mercure",
      explication: "Mercure est la première planète après le Soleil. C'est aussi la plus petite.", indice: "C'est aussi la plus petite planète.", source: C(1) },
    { id: "svt-s01-1-q2", fiche: "svt-s01-1-f1", type: "ordre", niveau: 2,
      enonce: "Range ces planètes de la plus proche à la plus éloignée du Soleil.",
      elements: ["Jupiter", "Mercure", "Neptune", "Terre", "Saturne"],
      reponse: [1, 3, 0, 4, 2],
      explication: "Mercure, puis la Terre, avant la ceinture d'astéroïdes. Ensuite Jupiter, Saturne et enfin Neptune.", indice: "Les petites planètes rocheuses d'abord, les géantes ensuite.", source: C(1) },
    { id: "svt-s01-1-q3", fiche: "svt-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Le Soleil est une planète.",
      corrections: ["Faux : le Soleil est une étoile, et les planètes tournent autour de lui.", "Faux : le Soleil est un satellite de la Terre.", "Faux : le Soleil est une galaxie."],
      reponse: { vrai: false, correction: "Faux : le Soleil est une étoile, et les planètes tournent autour de lui." },
      explication: "Le Soleil est l'étoile du système solaire. Les huit planètes gravitent autour de lui.", source: C(1) },
    { id: "svt-s01-1-q4", fiche: "svt-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle la zone située au-delà de Neptune, avant le nuage d'Oort ?",
      choix: ["La ceinture de Kuiper", "La ceinture principale d'astéroïdes", "La Voie lactée", "L'atmosphère"],
      reponse: "La ceinture de Kuiper",
      explication: "Après Neptune, on trouve la ceinture de Kuiper, puis le nuage d'Oort. La ceinture principale, elle, se trouve entre Mars et Jupiter.", source: C(1) },
    // f2 : telluriques et gazeuses
    { id: "svt-s01-1-q5", fiche: "svt-s01-1-f2", type: "qcm_multiple", niveau: 1,
      enonce: "Coche toutes les planètes telluriques.",
      choix: ["Mercure", "Vénus", "Terre", "Mars", "Jupiter", "Neptune"],
      reponse: ["Mercure", "Vénus", "Terre", "Mars"],
      explication: "Les quatre planètes les plus proches du Soleil sont telluriques. Jupiter et Neptune sont gazeuses.", source: C(1) },
    { id: "svt-s01-1-q6", fiche: "svt-s01-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque élément du système solaire à ce qui le décrit.",
      gauche: ["Planète tellurique", "Planète gazeuse", "Ceinture principale d'astéroïdes", "Ceinture de Kuiper"],
      droite: ["Sépare les planètes gazeuses du nuage d'Oort", "Un noyau de métal et de roche", "Sépare les telluriques des gazeuses", "Faite uniquement de gaz"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Tellurique : métal et roche ; gazeuse : seulement du gaz. La ceinture principale sépare les deux familles, celle de Kuiper sépare les gazeuses du nuage d'Oort.", source: C(1) },
    { id: "svt-s01-1-q7", fiche: "svt-s01-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Jupiter est une planète tellurique.",
      corrections: ["Faux : Jupiter est une planète gazeuse, faite uniquement de gaz.", "Faux : Jupiter est une étoile.", "Faux : Jupiter est un satellite de Saturne."],
      reponse: { vrai: false, correction: "Faux : Jupiter est une planète gazeuse, faite uniquement de gaz." },
      explication: "Jupiter est la plus grosse des planètes gazeuses. Les telluriques sont Mercure, Vénus, la Terre et Mars.", source: C(1) },
    { id: "svt-s01-1-q8", fiche: "svt-s01-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire à la fois que Mars et que Neptune sont « les plus éloignées » du Soleil ?",
      choix: ["Mars est la tellurique la plus éloignée, Neptune la gazeuse la plus éloignée", "Elles sont exactement à la même distance du Soleil", "Ce sont deux satellites de Jupiter", "Elles sont toutes les deux gazeuses"],
      reponse: "Mars est la tellurique la plus éloignée, Neptune la gazeuse la plus éloignée",
      explication: "Chaque famille a sa planète la plus lointaine. Mars ferme les telluriques, Neptune ferme les gazeuses.", source: C(1) },
    // f3 : portrait des planètes
    { id: "svt-s01-1-q9", fiche: "svt-s01-1-f3", type: "qcm", niveau: 1,
      enonce: "Quelle est la plus grosse planète du système solaire ?",
      choix: ["Jupiter", "Mercure", "La Terre", "Vénus"],
      reponse: "Jupiter",
      explication: "Jupiter est la plus grosse planète. Elle a aussi de nombreux satellites.", source: C(1) },
    { id: "svt-s01-1-q10", fiche: "svt-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Vénus et la Terre ont la même taille.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Vénus a la même taille que la Terre et, comme elle, elle est tellurique. Mais son atmosphère est irrespirable et il y fait plus de 400 °C.", source: C(1) },
    { id: "svt-s01-1-q11", fiche: "svt-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi un être humain ne pourrait-il pas respirer sur Vénus ?",
      choix: ["Son atmosphère, très épaisse, est irrespirable", "Elle n'a aucune atmosphère", "Elle est faite uniquement de gaz", "Elle est la planète la plus éloignée du Soleil"],
      reponse: "Son atmosphère, très épaisse, est irrespirable",
      explication: "Vénus est entourée d'une atmosphère très épaisse qu'on ne peut pas respirer. En plus, il y fait plus de 400 °C.", source: C(1) },
    { id: "svt-s01-1-q12", fiche: "svt-s01-1-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Saturne, une géante gazeuse voisine de Jupiter, est entourée d'___.",
      banque: ["anneaux", "océans", "forêts", "volcans"],
      reponse: [["anneaux"]],
      explication: "Saturne se reconnaît à ses anneaux. C'est une planète gazeuse, comme Jupiter.", source: C(1) },
    // f4 : la Terre
    { id: "svt-s01-1-q13", fiche: "svt-s01-1-f4", type: "qcm", niveau: 1,
      enonce: "À quelle place se trouve la Terre en partant du Soleil ?",
      choix: ["La troisième", "La première", "La cinquième", "La huitième"],
      reponse: "La troisième",
      explication: "Après Mercure et Vénus vient la Terre. Mars arrive juste après elle.", source: C(2) },
    { id: "svt-s01-1-q14", fiche: "svt-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "La Terre possède plusieurs satellites.",
      corrections: ["Faux : la Terre n'a qu'un seul satellite, la Lune.", "Faux : la Terre n'a aucun satellite.", "Faux : la Terre a des anneaux à la place des satellites."],
      reponse: { vrai: false, correction: "Faux : la Terre n'a qu'un seul satellite, la Lune." },
      explication: "La Terre a un seul satellite : la Lune. Jupiter, elle, en a beaucoup.", source: C(2) },
    { id: "svt-s01-1-q15", fiche: "svt-s01-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qui caractérise la Terre.",
      choix: ["Elle est tellurique", "Elle a une atmosphère", "Elle a de l'eau liquide", "Elle est gazeuse", "Elle a des anneaux"],
      reponse: ["Elle est tellurique", "Elle a une atmosphère", "Elle a de l'eau liquide"],
      explication: "La Terre est une planète tellurique avec une atmosphère et de l'eau liquide. Elle n'a pas d'anneaux.", source: C(2) },
    { id: "svt-s01-1-q16", fiche: "svt-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment situer la Terre parmi ses voisines ?",
      choix: ["Entre Vénus et Mars", "Entre Mars et Jupiter", "Entre Mercure et Vénus", "Après Neptune"],
      reponse: "Entre Vénus et Mars",
      explication: "La Terre est entourée de Vénus, plus près du Soleil, et de Mars, plus loin. Toutes trois sont telluriques.", source: C(1) },
    // f5 : le système solaire dans l'Univers
    { id: "svt-s01-1-q17", fiche: "svt-s01-1-f5", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle la galaxie où se trouve le système solaire ?",
      choix: ["La Voie lactée", "La ceinture de Kuiper", "Le nuage d'Oort", "La Lune"],
      reponse: "La Voie lactée",
      explication: "Notre galaxie est la Voie lactée. Le système solaire n'en est qu'une petite partie.", source: C(2) },
    { id: "svt-s01-1-q18", fiche: "svt-s01-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le système solaire est le seul système stellaire de sa galaxie.",
      corrections: ["Faux : la Voie lactée contient aussi beaucoup d'autres systèmes stellaires.", "Faux : le système solaire ne se trouve dans aucune galaxie.", "Faux : c'est la galaxie qui se trouve à l'intérieur du système solaire."],
      reponse: { vrai: false, correction: "Faux : la Voie lactée contient aussi beaucoup d'autres systèmes stellaires." },
      explication: "Dans la Voie lactée, il y a bien d'autres systèmes stellaires. Et l'Univers compte d'autres galaxies encore.", source: C(2) },
    { id: "svt-s01-1-q19", fiche: "svt-s01-1-f5", type: "ordre", niveau: 2,
      enonce: "Range du plus petit au plus grand.",
      elements: ["La Voie lactée", "La Terre", "L'Univers", "Le système solaire"],
      reponse: [1, 3, 0, 2],
      explication: "La Terre est dans le système solaire, lui-même dans la Voie lactée. L'Univers contient toutes les galaxies.", source: C(2) },
    // f6 : planètes naines
    { id: "svt-s01-1-q20", fiche: "svt-s01-1-f6", type: "qcm", niveau: 1,
      enonce: "Laquelle de ces planètes est une planète naine ?",
      choix: ["Pluton", "Neptune", "Mars", "Saturne"],
      reponse: "Pluton",
      explication: "Pluton est considérée aujourd'hui comme une planète naine. Neptune, Mars et Saturne font partie des huit planètes.", source: R(1) },
    { id: "svt-s01-1-q21", fiche: "svt-s01-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Cérès est une planète naine.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Cérès, comme Pluton, est une planète naine. Ce sont de petites planètes rocheuses.", source: R(1) },
    { id: "svt-s01-1-q22", fiche: "svt-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi Pluton n'est-elle pas comptée parmi les huit planètes ?",
      choix: ["C'est une planète naine : petite, rocheuse, et pas seule sur son orbite", "C'est une étoile", "C'est une planète gazeuse géante", "C'est le satellite de la Terre"],
      reponse: "C'est une planète naine : petite, rocheuse, et pas seule sur son orbite",
      explication: "Une planète naine est petite et rocheuse, et d'autres corps partagent son orbite. C'est le cas de Pluton.", source: R(1) },
    { id: "svt-s01-1-q23", fiche: "svt-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Combien de planètes naines connaît-on aujourd'hui, d'après le cours ?",
      choix: ["Cinq", "Une", "Huit", "Deux"],
      reponse: "Cinq",
      explication: "On connaît cinq planètes naines. Pluton est la première, Cérès en est une autre.", source: R(1) }
  ],
  bonus: [],
  nonCouvert: [
    "Les définitions d'astre, d'étoile, de planète, de système stellaire, de galaxie, d'astéroïde et de satellite : la fiche modèle du corrigé les liste sans les expliquer, et la leçon du livret n'est pas déposée.",
    "La comète, seulement dessinée sur la fiche modèle, et la nature de la ceinture de Kuiper et du nuage d'Oort (de quoi ils sont faits) : le corrigé ne donne que leur place.",
    "Le nombre de satellites de chaque planète, abrégé et peu lisible sur la fiche modèle, n'est pas repris."
  ]
};
