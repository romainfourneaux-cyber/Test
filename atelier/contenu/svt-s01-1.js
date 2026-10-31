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
      choix: ["Mercure", "Vénus", "La Terre", "Mars"],
      reponse: "Mercure",
      explication: "Mercure est la première planète après le Soleil. C'est aussi la plus petite des huit.", indice: "C'est aussi la plus petite planète.", source: C(1) },
    { id: "svt-s01-1-q2", fiche: "svt-s01-1-f1", type: "ordre", niveau: 2,
      enonce: "Range ces planètes de la plus proche à la plus éloignée du Soleil.",
      elements: ["Jupiter", "Mercure", "Neptune", "Terre", "Saturne"],
      reponse: [1, 3, 0, 4, 2],
      explication: "Mercure, puis la Terre, avant la ceinture d'astéroïdes. Ensuite Jupiter, Saturne et enfin Neptune.", indice: "Les petites planètes rocheuses d'abord, les géantes ensuite.", source: C(1) },
    { id: "svt-s01-1-q3", fiche: "svt-s01-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le Soleil est une étoile qui gravite autour des planètes du système solaire.",
      corrections: ["Faux : c'est l'inverse, ce sont les planètes qui gravitent autour du Soleil.", "Faux : le Soleil n'est pas une étoile, c'est une planète gazeuse.", "Faux : le Soleil gravite seulement autour de la Terre."],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse, ce sont les planètes qui gravitent autour du Soleil." },
      explication: "Le Soleil est bien une étoile, mais ce sont les huit planètes qui tournent autour de lui. On dit qu'elles gravitent autour du Soleil.", source: C(1) },
    { id: "svt-s01-1-q4", fiche: "svt-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle la zone située juste après Neptune, quand on s'éloigne du Soleil ?",
      choix: ["La ceinture de Kuiper", "Le nuage d'Oort", "La ceinture principale d'astéroïdes", "La Voie lactée"],
      reponse: "La ceinture de Kuiper",
      explication: "Après Neptune vient la ceinture de Kuiper, puis, plus loin, le nuage d'Oort. La ceinture principale, elle, se trouve entre Mars et Jupiter.", source: C(1) },
    { id: "svt-s01-1-q24", fiche: "svt-s01-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La ceinture principale d'astéroïdes se trouve entre la Terre et Mars.",
      corrections: ["Faux : elle se trouve entre Mars et Jupiter.", "Faux : elle se trouve entre Neptune et le nuage d'Oort.", "Faux : elle se trouve entre Mercure et Vénus."],
      reponse: { vrai: false, correction: "Faux : elle se trouve entre Mars et Jupiter." },
      explication: "La ceinture principale sépare Mars, dernière planète tellurique, de Jupiter, première planète gazeuse. Au-delà de Neptune, c'est la ceinture de Kuiper.", source: C(1) },
    { id: "svt-s01-1-q25", fiche: "svt-s01-1-f1", type: "ordre", niveau: 3,
      enonce: "Range ces éléments du plus proche au plus éloigné du Soleil.",
      elements: ["Nuage d'Oort", "Uranus", "Ceinture de Kuiper", "Saturne", "Neptune"],
      reponse: [3, 1, 4, 2, 0],
      explication: "Saturne, Uranus et Neptune sont les trois dernières planètes. Viennent ensuite la ceinture de Kuiper, puis le nuage d'Oort.", source: C(1) },
    { id: "svt-s01-1-q26", fiche: "svt-s01-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En partant du Soleil : Mercure, Vénus, la Terre, ___, puis la ceinture principale d'astéroïdes, puis ___ et Saturne.",
      banque: ["Mars", "Jupiter", "Neptune", "Uranus"],
      reponse: [["Mars"], ["Jupiter"]],
      explication: "Mars est la dernière planète avant la ceinture principale d'astéroïdes. Jupiter est la première juste après elle.", source: C(1) },
    { id: "svt-s01-1-q27", fiche: "svt-s01-1-f1", type: "qcm", niveau: 3,
      enonce: "Quelle planète est la cinquième en partant du Soleil ?",
      choix: ["Jupiter", "Mars", "Saturne", "Uranus"],
      reponse: "Jupiter",
      explication: "Mercure, Vénus, la Terre et Mars viennent d'abord, puis la ceinture d'astéroïdes. Jupiter est donc la cinquième planète.", source: C(1) },
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
    { id: "svt-s01-1-q7", fiche: "svt-s01-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Jupiter, la plus grosse planète, est une planète tellurique.",
      corrections: ["Faux : Jupiter est bien la plus grosse, mais c'est une planète gazeuse.", "Faux : Jupiter est tellurique, mais la plus grosse planète est Saturne.", "Faux : Jupiter est gazeuse, et la plus grosse planète est Saturne."],
      reponse: { vrai: false, correction: "Faux : Jupiter est bien la plus grosse, mais c'est une planète gazeuse." },
      explication: "Jupiter est la plus grosse planète, et elle est faite uniquement de gaz. Les telluriques sont Mercure, Vénus, la Terre et Mars.", source: C(1) },
    { id: "svt-s01-1-q8", fiche: "svt-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi Mars et Jupiter, pourtant voisines, ne sont-elles pas dans la même famille de planètes ?",
      choix: ["Mars est tellurique et Jupiter gazeuse", "Jupiter est tellurique et Mars est gazeuse", "Elles sont en fait dans la même famille, celle des géantes gazeuses", "Mars tourne autour de Jupiter, comme un satellite"],
      reponse: "Mars est tellurique et Jupiter gazeuse",
      explication: "Mars est la dernière planète tellurique, Jupiter la première planète gazeuse. Entre elles passe la ceinture principale d'astéroïdes, qui sépare les deux familles.", source: C(1) },
    { id: "svt-s01-1-q28", fiche: "svt-s01-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Mars est la planète gazeuse la plus proche du Soleil.",
      corrections: ["Faux : Mars est tellurique ; la gazeuse la plus proche du Soleil est Jupiter.", "Faux : Mars est gazeuse, mais c'est la plus éloignée du Soleil.", "Faux : Mars est tellurique ; la gazeuse la plus proche du Soleil est Saturne."],
      reponse: { vrai: false, correction: "Faux : Mars est tellurique ; la gazeuse la plus proche du Soleil est Jupiter." },
      explication: "Mars est la dernière tellurique avant la ceinture d'astéroïdes. Juste après celle-ci vient Jupiter, la première des gazeuses.", source: C(1) },
    { id: "svt-s01-1-q29", fiche: "svt-s01-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Uranus est une planète tellurique, voisine de Saturne et de Neptune.",
      corrections: ["Faux : Uranus est une planète gazeuse, comme ses voisines Saturne et Neptune.", "Faux : Uranus est tellurique, mais elle est voisine de Mars.", "Faux : Uranus est une planète naine, comme Pluton."],
      reponse: { vrai: false, correction: "Faux : Uranus est une planète gazeuse, comme ses voisines Saturne et Neptune." },
      explication: "Uranus est gazeuse, comme Saturne et Neptune qui l'entourent. Les quatre gazeuses se trouvent toutes au-delà de la ceinture d'astéroïdes.", source: C(1) },
    { id: "svt-s01-1-q30", fiche: "svt-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "On sait seulement qu'une planète se trouve au-delà de la ceinture principale d'astéroïdes. Que peut-on en déduire ?",
      choix: ["C'est une planète gazeuse", "C'est une planète tellurique", "C'est forcément Jupiter, la plus grosse", "C'est forcément Neptune, la plus lointaine"],
      reponse: "C'est une planète gazeuse",
      explication: "La ceinture principale sépare les telluriques, avant elle, des gazeuses, après elle. Les quatre planètes situées au-delà sont donc gazeuses.", source: C(1) },
    { id: "svt-s01-1-q31", fiche: "svt-s01-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les phrases justes sur les planètes gazeuses.",
      choix: ["Elles sont faites uniquement de gaz", "On les appelle aussi planètes joviennes", "Neptune est la plus éloignée d'entre elles", "Elles ont un noyau de métal et de roche", "Elles sont plus proches du Soleil que les telluriques"],
      reponse: ["Elles sont faites uniquement de gaz", "On les appelle aussi planètes joviennes", "Neptune est la plus éloignée d'entre elles"],
      explication: "Les gazeuses, ou joviennes, sont faites seulement de gaz, et Neptune est la plus lointaine. Le noyau de métal et de roche est la marque des telluriques, plus proches du Soleil.", source: C(1) },
    // f3 : portrait des planètes
    { id: "svt-s01-1-q9", fiche: "svt-s01-1-f3", type: "qcm", niveau: 1,
      enonce: "Quelle est la plus grosse planète du système solaire ?",
      choix: ["Jupiter", "Saturne", "Neptune", "Uranus"],
      reponse: "Jupiter",
      explication: "Jupiter est la plus grosse planète, juste après la ceinture d'astéroïdes. Saturne, sa voisine, est aussi une géante gazeuse.", source: C(1) },
    { id: "svt-s01-1-q10", fiche: "svt-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Vénus et la Terre ont la même taille.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Vénus a la même taille que la Terre et, comme elle, elle est tellurique. Mais son atmosphère est irrespirable et il y fait plus de 400 °C.", source: C(1) },
    { id: "svt-s01-1-q11", fiche: "svt-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Vénus a la taille de la Terre et une atmosphère. Pourquoi un être humain ne pourrait-il pourtant pas y vivre ?",
      choix: ["Son air est irrespirable et il y fait plus de 400 °C", "Son atmosphère est trop mince et il y fait très froid", "Elle est faite uniquement de gaz, sans sol où se poser", "Elle est trop loin du Soleil pour recevoir sa lumière"],
      reponse: "Son air est irrespirable et il y fait plus de 400 °C",
      explication: "Vénus est entourée d'une atmosphère très épaisse qu'on ne peut pas respirer, et il y fait plus de 400 °C. Elle est pourtant tellurique, comme la Terre.", source: C(1) },
    { id: "svt-s01-1-q12", fiche: "svt-s01-1-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Saturne, une géante gazeuse voisine de Jupiter, est entourée d'___.",
      banque: ["anneaux", "astéroïdes", "océans", "étoiles"],
      reponse: [["anneaux"]],
      explication: "Saturne se reconnaît à ses anneaux. C'est une planète gazeuse, comme Jupiter.", source: C(1) },
    { id: "svt-s01-1-q32", fiche: "svt-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Mercure est à la fois la plus petite planète et la plus proche du Soleil.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Mercure réunit les deux records : la plus petite et la plus proche du Soleil. La plus grosse, c'est Jupiter.", source: C(1) },
    { id: "svt-s01-1-q33", fiche: "svt-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Vénus, de la même taille que la Terre, est une planète gazeuse.",
      corrections: ["Faux : Vénus a bien la taille de la Terre, et elle est tellurique comme elle.", "Faux : Vénus est gazeuse, mais elle est bien plus grosse que la Terre.", "Faux : Vénus est tellurique, mais elle est bien plus petite que la Terre."],
      reponse: { vrai: false, correction: "Faux : Vénus a bien la taille de la Terre, et elle est tellurique comme elle." },
      explication: "Vénus a la taille de la Terre et elle est tellurique, elle aussi. Ce qui la distingue, c'est son atmosphère irrespirable et sa chaleur de plus de 400 °C.", source: C(1) },
    { id: "svt-s01-1-q34", fiche: "svt-s01-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque planète à son portrait.",
      gauche: ["Mercure", "Vénus", "Jupiter", "Saturne"],
      droite: ["Géante gazeuse entourée d'anneaux", "La plus petite, la plus proche du Soleil", "Taille de la Terre, atmosphère irrespirable", "La plus grosse, avec de nombreux satellites"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Mercure est la plus petite et Jupiter la plus grosse. Vénus a la taille de la Terre, et Saturne porte des anneaux.", source: C(1) },
    { id: "svt-s01-1-q35", fiche: "svt-s01-1-f3", type: "qcm", niveau: 3,
      enonce: "Laquelle de ces comparaisons entre Vénus et la Terre est juste ?",
      choix: ["Même taille, mais une atmosphère irrespirable", "Même taille, mais Vénus est une planète gazeuse", "Plus petite que la Terre, mais même atmosphère", "Plus grosse que la Terre, et bien plus froide"],
      reponse: "Même taille, mais une atmosphère irrespirable",
      explication: "Vénus et la Terre ont la même taille et sont toutes deux telluriques. Mais l'atmosphère de Vénus, très épaisse, ne se respire pas, et il y fait plus de 400 °C.", source: C(1) },
    // f4 : la Terre
    { id: "svt-s01-1-q13", fiche: "svt-s01-1-f4", type: "qcm", niveau: 1,
      enonce: "À quelle place se trouve la Terre en partant du Soleil ?",
      choix: ["La troisième", "La deuxième", "La quatrième", "La cinquième"],
      reponse: "La troisième",
      explication: "Après Mercure et Vénus vient la Terre. Mars arrive juste après elle.", source: C(2) },
    { id: "svt-s01-1-q14", fiche: "svt-s01-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "La Terre possède deux satellites, dont la Lune.",
      corrections: ["Faux : la Terre n'a qu'un seul satellite, la Lune.", "Faux : la Terre n'a aucun satellite ; la Lune est une planète naine."],
      reponse: { vrai: false, correction: "Faux : la Terre n'a qu'un seul satellite, la Lune." },
      explication: "La Terre a un seul satellite : la Lune. Jupiter, elle, en a beaucoup.", source: C(2) },
    { id: "svt-s01-1-q15", fiche: "svt-s01-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qui caractérise la Terre.",
      choix: ["Elle est tellurique", "Elle a une atmosphère", "Elle a de l'eau liquide", "Elle est gazeuse", "Elle a des anneaux", "Elle a plusieurs satellites"],
      reponse: ["Elle est tellurique", "Elle a une atmosphère", "Elle a de l'eau liquide"],
      explication: "La Terre est une planète tellurique avec une atmosphère et de l'eau liquide. Elle n'a ni anneaux ni plusieurs satellites : seulement la Lune.", source: C(2) },
    { id: "svt-s01-1-q16", fiche: "svt-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment situer la Terre parmi ses voisines ?",
      choix: ["Entre Vénus et Mars", "Entre Mars et Jupiter", "Entre Mercure et Vénus", "Entre Jupiter et Saturne"],
      reponse: "Entre Vénus et Mars",
      explication: "La Terre est entourée de Vénus, plus près du Soleil, et de Mars, plus loin. Toutes trois sont telluriques.", source: C(1) },
    { id: "svt-s01-1-q36", fiche: "svt-s01-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi la Terre est-elle classée parmi les planètes telluriques ?",
      choix: ["Pour son noyau de métal et de roche", "Pour son atmosphère et son eau liquide", "Pour son unique satellite, la Lune", "Pour sa place juste avant Mars"],
      reponse: "Pour son noyau de métal et de roche",
      explication: "Une planète est tellurique quand elle a un noyau de métal et de roche. L'atmosphère, l'eau liquide ou la Lune sont des traits de la Terre, pas la raison de ce classement.", source: C(1) },
    { id: "svt-s01-1-q37", fiche: "svt-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "La Lune est une planète tellurique voisine de la Terre.",
      corrections: ["Faux : la Lune est le satellite de la Terre, pas une planète.", "Faux : la Lune est une planète gazeuse voisine de Mars.", "Faux : la Lune est une planète naine, comme Pluton."],
      reponse: { vrai: false, correction: "Faux : la Lune est le satellite de la Terre, pas une planète." },
      explication: "La Lune est le seul satellite de la Terre. Elle ne fait pas partie des huit planètes.", source: C(2) },
    { id: "svt-s01-1-q38", fiche: "svt-s01-1-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Coche ce que la Terre a en commun avec Vénus.",
      choix: ["Elles sont telluriques", "Elles ont la même taille", "Elles ont une atmosphère", "Leur atmosphère se respire", "Il y fait plus de 400 °C"],
      reponse: ["Elles sont telluriques", "Elles ont la même taille", "Elles ont une atmosphère"],
      explication: "La Terre et Vénus sont deux telluriques de même taille, entourées d'une atmosphère. Mais celle de Vénus est irrespirable, et il y fait plus de 400 °C.", source: C(1) },
    // f5 : le système solaire dans l'Univers
    { id: "svt-s01-1-q17", fiche: "svt-s01-1-f5", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle la galaxie où se trouve le système solaire ?",
      choix: ["La Voie lactée", "Le nuage d'Oort", "La ceinture de Kuiper", "L'Univers"],
      reponse: "La Voie lactée",
      explication: "Notre galaxie est la Voie lactée, et le système solaire n'en est qu'une petite partie. L'Univers, lui, compte de nombreuses galaxies.", source: C(2) },
    { id: "svt-s01-1-q18", fiche: "svt-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le système solaire est le seul système stellaire de sa galaxie.",
      corrections: ["Faux : la Voie lactée abrite aussi beaucoup d'autres systèmes stellaires.", "Faux : le système solaire ne se trouve dans aucune galaxie.", "Faux : le système solaire est une galaxie à lui tout seul."],
      reponse: { vrai: false, correction: "Faux : la Voie lactée abrite aussi beaucoup d'autres systèmes stellaires." },
      explication: "Dans la Voie lactée, il y a bien d'autres systèmes stellaires. Et l'Univers compte d'autres galaxies encore.", source: C(2) },
    { id: "svt-s01-1-q19", fiche: "svt-s01-1-f5", type: "ordre", niveau: 2,
      enonce: "Range du plus petit au plus grand.",
      elements: ["La Voie lactée", "La Terre", "L'Univers", "Le système solaire"],
      reponse: [1, 3, 0, 2],
      explication: "La Terre est dans le système solaire, lui-même dans la Voie lactée. L'Univers contient toutes les galaxies.", source: C(2) },
    { id: "svt-s01-1-q39", fiche: "svt-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "L'Univers ne compte qu'une seule galaxie : la Voie lactée.",
      corrections: ["Faux : l'Univers compte de nombreuses autres galaxies.", "Faux : la Voie lactée est plus grande que l'Univers.", "Faux : l'Univers ne contient aucune galaxie, seulement des planètes."],
      reponse: { vrai: false, correction: "Faux : l'Univers compte de nombreuses autres galaxies." },
      explication: "La Voie lactée n'est qu'une galaxie parmi beaucoup d'autres. L'Univers les contient toutes.", source: C(2) },
    { id: "svt-s01-1-q40", fiche: "svt-s01-1-f5", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les ensembles qui contiennent le système solaire.",
      choix: ["La Voie lactée", "L'Univers", "La Terre", "La ceinture de Kuiper", "Le nuage d'Oort"],
      reponse: ["La Voie lactée", "L'Univers"],
      explication: "Le système solaire est dans la Voie lactée, elle-même dans l'Univers. La Terre, la ceinture de Kuiper et le nuage d'Oort sont au contraire des parties du système solaire.", source: C(2) },
    { id: "svt-s01-1-q41", fiche: "svt-s01-1-f5", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Le système solaire appartient à une ___ : la Voie lactée.",
      banque: ["galaxie", "planète", "étoile", "ceinture"],
      reponse: [["galaxie"]],
      explication: "La Voie lactée est une galaxie. Elle contient le système solaire et bien d'autres systèmes stellaires.", source: C(2) },
    { id: "svt-s01-1-q42", fiche: "svt-s01-1-f5", type: "qcm", niveau: 3,
      enonce: "Qu'ont en commun le système solaire et un autre système stellaire de la Voie lactée ?",
      choix: ["Ils sont dans la même galaxie", "Ce sont tous deux des galaxies", "Ils sont dans deux galaxies différentes", "Ils forment à eux deux l'Univers"],
      reponse: "Ils sont dans la même galaxie",
      explication: "La Voie lactée abrite le système solaire et beaucoup d'autres systèmes stellaires. Ils partagent donc la même galaxie, qui n'est elle-même qu'une galaxie parmi d'autres dans l'Univers.", source: C(2) },
    // f6 : planètes naines
    { id: "svt-s01-1-q20", fiche: "svt-s01-1-f6", type: "qcm", niveau: 1,
      enonce: "Lequel de ces astres est une planète naine ?",
      choix: ["Pluton", "Mercure", "Mars", "Neptune"],
      reponse: "Pluton",
      explication: "Pluton est considérée aujourd'hui comme une planète naine. Mercure, la plus petite, reste l'une des huit planètes.", source: R(1) },
    { id: "svt-s01-1-q21", fiche: "svt-s01-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Cérès est une planète naine.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Cérès, comme Pluton, est une planète naine. Ce sont de petites planètes rocheuses.", source: R(1) },
    { id: "svt-s01-1-q22", fiche: "svt-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi Pluton n'est-elle pas comptée parmi les huit planètes ?",
      choix: ["C'est une planète naine, qui partage son orbite", "C'est une planète gazeuse, au-delà de Neptune", "C'est un satellite qui tourne autour de Neptune", "C'est une étoile, trop petite pour briller"],
      reponse: "C'est une planète naine, qui partage son orbite",
      explication: "Une planète naine est petite et rocheuse, et d'autres corps célestes partagent son orbite. C'est le cas de Pluton.", source: R(1) },
    { id: "svt-s01-1-q23", fiche: "svt-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Combien de planètes naines connaît-on aujourd'hui ?",
      choix: ["Cinq", "Deux", "Quatre", "Huit"],
      reponse: "Cinq",
      explication: "On connaît cinq planètes naines. Pluton est la première, Cérès en est une autre.", source: R(1) },
    { id: "svt-s01-1-q43", fiche: "svt-s01-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Une planète naine est une petite planète gazeuse.",
      corrections: ["Faux : c'est une petite planète rocheuse.", "Faux : c'est une très grosse planète rocheuse.", "Faux : c'est une petite étoile, comme le Soleil."],
      reponse: { vrai: false, correction: "Faux : c'est une petite planète rocheuse." },
      explication: "Une planète naine est petite et rocheuse. D'autres corps célestes partagent son orbite.", source: R(1) },
    { id: "svt-s01-1-q44", fiche: "svt-s01-1-f6", type: "qcm", niveau: 3,
      enonce: "Un petit astre rocheux tourne autour du Soleil, mais d'autres corps célestes partagent son orbite. Comment le classer ?",
      choix: ["Comme une planète naine", "Comme une planète tellurique", "Comme une planète gazeuse", "Comme une étoile"],
      reponse: "Comme une planète naine",
      explication: "Petit, rocheux et pas seul sur son orbite : ce sont les traits d'une planète naine. Une planète tellurique, comme la Terre, compte parmi les huit planètes.", source: R(1) },
    { id: "svt-s01-1-q45", fiche: "svt-s01-1-f6", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les phrases justes sur Pluton.",
      choix: ["C'est une planète naine", "C'est la première des planètes naines connues", "Elle est petite et rocheuse", "C'est la plus petite des huit planètes", "Elle est seule sur son orbite"],
      reponse: ["C'est une planète naine", "C'est la première des planètes naines connues", "Elle est petite et rocheuse"],
      explication: "Pluton est la première des cinq planètes naines connues, petite et rocheuse, avec d'autres corps sur son orbite. La plus petite des huit planètes, c'est Mercure.", source: R(1) }
  ],
  bonus: [
    {
      id: "svt-s01-1-b1",
      fiche: "svt-s01-1-f6",
      titre: "Un cœur sur Pluton",
      texte: "Lancée par la NASA, la sonde New Horizons est la première à avoir visité Pluton. Sur cette planète naine s'étend une zone claire large de plus de 2 000 km, surnommée le « cœur » : la région Tombaugh. Pluton avait été découverte en 1930 par l'Américain Clyde Tombaugh.",
      source: { titre: "Pluton (planète naine)", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Pluton_(plan%C3%A8te_naine)" }
    }
  ],
  nonCouvert: [
    "Les définitions d'astre, d'étoile, de planète, de système stellaire, de galaxie, d'astéroïde et de satellite : la fiche modèle du corrigé les liste sans les expliquer, et la leçon du livret n'est pas déposée.",
    "La comète, seulement dessinée sur la fiche modèle, et la nature de la ceinture de Kuiper et du nuage d'Oort (de quoi ils sont faits) : le corrigé ne donne que leur place.",
    "Le nombre de satellites de chaque planète, abrégé et peu lisible sur la fiche modèle, n'est pas repris."
  ]
};
