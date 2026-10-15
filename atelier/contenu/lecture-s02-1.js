// Source en clair du cours lecture-s02-1 « Un hivernage dans les glaces – chapitres 1 et 2 ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js lecture-s02-1.
// Seule source : la liste de vocabulaire du livre. Elle ne dit pas à quel chapitre appartient chaque mot :
// ce cours prend le vocabulaire du navire et de l'équipage (pages 3, 6 et 7 de la liste). Aucune question
// sur l'intrigue, et aucun exercice où l'on place des noms sur un navire.
const F = "cours/lecture/Vocabulaire 5e - Un hivernage dans les glaces.pdf";
const S = p => ({ fichier: F, page: p });

module.exports = {
  id: "lecture-s02-1",
  fiches: [
    {
      id: "lecture-s02-1-f1", notion: "Les sortes de navires",
      titre: "Brick, goélette, caboteur et chaloupes",
      texte: "Le livre emploie des mots précis pour parler des bateaux. Le brick et la goélette sont deux sortes de voiliers. Un caboteur navigue le long des côtes. Les chaloupes sont de petites embarcations. Enfin, celui qui possède un ou plusieurs navires de commerce s'appelle un armateur.",
      pointsCles: ["Brick, goélette : des sortes de voiliers", "Caboteur : il longe les côtes", "Chaloupes : de petites embarcations", "Armateur : le propriétaire de navires de commerce"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "goélette", def: "un type de voilier" },
        { mot: "caboteur", def: "celui qui navigue en longeant les côtes" },
        { mot: "chaloupes", def: "de petites embarcations" },
        { mot: "armateur", def: "le propriétaire d'un ou de plusieurs navires de commerce" }
      ],
      schema: null, prerequis: [], source: S(6)
    },
    {
      id: "lecture-s02-1-f2", notion: "Les rôles à bord",
      titre: "Timonier, vigie et quarts",
      texte: "Sur un navire, chacun a son rôle. Le timonier dirige le bateau : il manœuvre la barre qui actionne le gouvernail. La vigie est un guetteur qui surveille la mer et les côtes. Comme certaines tâches ne doivent jamais s'arrêter, les marins forment des équipes qui se relaient sans cesse : les quarts.",
      pointsCles: ["Timonier : il dirige le navire avec la barre", "Vigie : le guetteur de la mer et des côtes", "Quart : une équipe qui prend le relais d'une autre"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "timonier", def: "le marin qui manœuvre la barre pour diriger le navire" },
        { mot: "vigie", def: "le guetteur qui surveille la mer et les côtes" },
        { mot: "quart", def: "une équipe de marins qui prend le relais d'une autre pour les tâches indispensables" }
      ],
      schema: null, prerequis: ["lecture-s02-1-f1"], source: S(7)
    },
    {
      id: "lecture-s02-1-f3", notion: "Gréement courant et gréement dormant",
      titre: "Le gréement : ce qui bouge et ce qui reste fixe",
      texte: "Les mâts, les voiles et les cordages forment le gréement du navire. On en distingue deux parties. Le gréement courant est mobile : ce sont les voiles et les cordes que l'on règle. Le gréement dormant est fixe : ce sont les mâts et les câbles. Le pataras, lui, retient le mât vers l'arrière.",
      pointsCles: ["Gréement courant : les parties mobiles (voiles, cordes)", "Gréement dormant : les parties fixes (mâts, câbles)", "Pataras : il retient le mât vers l'arrière"],
      astuce: "Dormant, comme quelqu'un qui dort : ça ne bouge pas. Courant, comme quelqu'un qui court : ça bouge.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "gréement courant", def: "les parties mobiles d'un voilier, que l'on règle : voiles, cordes" },
        { mot: "gréement dormant", def: "les parties fixes d'un voilier : mâts, câbles" },
        { mot: "pataras", def: "ce qui retient le mât vers l'arrière du navire" }
      ],
      schema: null, prerequis: [], source: S(3)
    },
    {
      id: "lecture-s02-1-f4", notion: "Les parties du navire et le sextant",
      titre: "Du mât de misaine à la ligne de flottaison",
      texte: "Le mât de misaine est le premier mât vertical, à l'avant. Sur le pont, le rouf est un abri en bois. La ligne de flottaison sépare la partie de la coque qui est sous l'eau de celle qui en sort. Le pavillon hissé sur le navire montre sa nationalité. Pour naviguer, on se sert d'un sextant.",
      pointsCles: ["Mât de misaine : le premier mât, à l'avant", "Rouf : un abri en bois sur le pont", "Ligne de flottaison : la limite entre partie immergée et partie émergée de la coque", "Pavillon : il montre la nationalité, la compagnie, ou sert à faire des signaux", "Sextant : un instrument de navigation"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "mât de misaine", def: "le premier mât vertical, à l'avant du navire" },
        { mot: "rouf", def: "un abri en bois construit sur le pont" },
        { mot: "ligne de flottaison", def: "la limite entre la partie de la coque sous l'eau et celle hors de l'eau" },
        { mot: "pavillon", def: "le tissu hissé sur un navire pour montrer sa nationalité, sa compagnie, ou pour faire des signaux" },
        { mot: "sextant", def: "un instrument de navigation qui mesure l'angle entre deux points" }
      ],
      schema: null, prerequis: ["lecture-s02-1-f3"], source: S(7)
    },
    {
      id: "lecture-s02-1-f5", notion: "Se repérer dans le navire",
      titre: "Barre, haubans, entrepont et cambuse",
      texte: "La barre est la roue qui permet de manœuvrer le gouvernail, donc de diriger le bateau. Les haubans sont des cordages fixés au mât. À l'intérieur, l'entrepont est un étage placé entre le pont et la cale. Les réserves de nourriture sont rangées dans la cambuse.",
      pointsCles: ["Barre : la roue qui commande le gouvernail", "Haubans : des cordages fixés au mât", "Entrepont : l'étage entre le pont et la cale", "Cambuse : la pièce des réserves de nourriture"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "barre", def: "la roue qui sert à manœuvrer le gouvernail" },
        { mot: "haubans", def: "des cordages fixés au mât" },
        { mot: "entrepont", def: "l'étage situé entre le pont et la cale" },
        { mot: "cambuse", def: "la pièce du navire où l'on garde les réserves de nourriture" }
      ],
      schema: null, prerequis: ["lecture-s02-1-f2"], source: S(6)
    }
  ],
  schemas: [],
  questions: [
    // f1 : les sortes de navires
    { id: "lecture-s02-1-q1", fiche: "lecture-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Qu'ont en commun un brick et une goélette ?",
      choix: ["Ce sont deux sortes de voiliers", "Ce sont deux grades de marins", "Ce sont deux parties d'un mât", "Ce sont deux poissons du Grand Nord"],
      reponse: "Ce sont deux sortes de voiliers",
      explication: "Le brick et la goélette sont deux sortes de voiliers. Ce sont donc des bateaux, pas des personnes.", source: S(6) },
    { id: "lecture-s02-1-q2", fiche: "lecture-s02-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Un armateur est le marin qui tient la barre.",
      corrections: ["Faux : l'armateur est le propriétaire d'un ou de plusieurs navires de commerce.", "Faux : l'armateur est le cuisinier du navire.", "Faux : l'armateur est le guetteur qui surveille les côtes."],
      reponse: { vrai: false, correction: "Faux : l'armateur est le propriétaire d'un ou de plusieurs navires de commerce." },
      explication: "L'armateur possède des navires de commerce. Celui qui tient la barre, c'est le timonier.", source: S(6) },
    { id: "lecture-s02-1-q3", fiche: "lecture-s02-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on celui qui navigue le long des côtes ?",
      choix: ["Un caboteur", "Un armateur", "Un timonier", "Un naturel"],
      reponse: "Un caboteur",
      explication: "Le caboteur navigue en longeant les côtes. L'armateur, lui, possède des navires.", source: S(6) },
    { id: "lecture-s02-1-q4", fiche: "lecture-s02-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Le ___ et la goélette sont des voiliers ; les ___ sont de petites embarcations.",
      banque: ["brick", "chaloupes", "haubans", "lames"],
      reponse: [["brick"], ["chaloupes"]],
      explication: "Le brick est un voilier, comme la goélette. Les chaloupes sont de petites embarcations.", source: S(6) },
    // f2 : les rôles à bord
    { id: "lecture-s02-1-q5", fiche: "lecture-s02-1-f2", type: "qcm", niveau: 1,
      enonce: "Quel marin dirige le navire en manœuvrant la barre ?",
      choix: ["Le timonier", "La vigie", "L'armateur", "Le caboteur"],
      reponse: "Le timonier",
      explication: "Le timonier manœuvre la barre, qui actionne le gouvernail. C'est donc lui qui dirige le navire.", source: S(7) },
    { id: "lecture-s02-1-q6", fiche: "lecture-s02-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "La vigie est un guetteur qui surveille la mer et les côtes.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est le rôle de la vigie. Le timonier, lui, dirige le navire.", source: S(7) },
    { id: "lecture-s02-1-q7", fiche: "lecture-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi les marins sont-ils répartis en quarts ?",
      choix: ["Pour que les tâches indispensables soient faites sans interruption", "Pour couper le navire en quatre parties", "Pour manger quatre fois par jour", "Pour choisir le propriétaire du navire"],
      reponse: "Pour que les tâches indispensables soient faites sans interruption",
      explication: "Les quarts sont des équipes qui se relaient en permanence. Ainsi, les tâches indispensables ne s'arrêtent jamais.", source: S(7) },
    { id: "lecture-s02-1-q8", fiche: "lecture-s02-1-f2", type: "trou", niveau: 2,
      enonce: "Complète la phrase.",
      texte: "Le ___ manœuvre la barre, pendant que la ___ surveille la mer.",
      banque: ["timonier", "vigie", "cambuse", "goélette"],
      reponse: [["timonier"], ["vigie"]],
      explication: "Le timonier dirige le navire grâce à la barre. La vigie, elle, guette la mer et les côtes.", source: S(7) },
    // f3 : le gréement
    { id: "lecture-s02-1-q9", fiche: "lecture-s02-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'appelle-t-on le gréement dormant ?",
      choix: ["Les parties fixes, comme les mâts et les câbles", "Les parties mobiles, comme les voiles et les cordes", "Les marins qui dorment entre deux quarts", "La pièce où l'on range la nourriture"],
      reponse: "Les parties fixes, comme les mâts et les câbles",
      explication: "Le gréement dormant ne bouge pas : ce sont les mâts et les câbles. Les voiles et les cordes, mobiles, forment le gréement courant.", source: S(3) },
    { id: "lecture-s02-1-q10", fiche: "lecture-s02-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Les voiles font partie du gréement courant.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les voiles et les cordes sont mobiles, on les règle. Elles forment le gréement courant.", source: S(3) },
    { id: "lecture-s02-1-q11", fiche: "lecture-s02-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquels de ces éléments font partie du gréement dormant ? Coche toutes les bonnes réponses.",
      choix: ["Les mâts", "Les câbles", "Les voiles", "Les cordes"],
      reponse: ["Les mâts", "Les câbles"],
      explication: "Le gréement dormant regroupe les parties fixes : mâts et câbles. Voiles et cordes sont mobiles : c'est le gréement courant.", source: S(3) },
    { id: "lecture-s02-1-q12", fiche: "lecture-s02-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment le pataras tient-il le mât ?",
      choix: ["Il le retient vers l'arrière", "Il le pousse vers l'avant", "Il le couche sur le pont", "Il le fait tourner sur lui-même"],
      reponse: "Il le retient vers l'arrière",
      explication: "Le pataras sert à retenir le mât vers l'arrière du navire.", source: S(3) },
    // f4 : les parties du navire et le sextant
    { id: "lecture-s02-1-q13", fiche: "lecture-s02-1-f4", type: "qcm", niveau: 1,
      enonce: "Où se trouve le mât de misaine ?",
      choix: ["C'est le premier mât, à l'avant du navire", "C'est le dernier mât, à l'arrière du navire", "Il est couché sous le pont", "Il se dresse sur une chaloupe"],
      reponse: "C'est le premier mât, à l'avant du navire",
      explication: "Le mât de misaine est le premier mât vertical. Il se dresse à l'avant du navire.", source: S(7) },
    { id: "lecture-s02-1-q14", fiche: "lecture-s02-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le rouf est la pièce où l'on range les réserves de nourriture.",
      corrections: ["Faux : le rouf est un abri en bois sur le pont ; la nourriture se garde dans la cambuse.", "Faux : le rouf est le premier mât du navire.", "Faux : le rouf est un instrument de navigation."],
      reponse: { vrai: false, correction: "Faux : le rouf est un abri en bois sur le pont ; la nourriture se garde dans la cambuse." },
      explication: "Le rouf est un abri en bois placé sur le pont. Les réserves de nourriture sont gardées dans la cambuse.", source: S(7) },
    { id: "lecture-s02-1-q15", fiche: "lecture-s02-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi hisse-t-on un pavillon sur un navire ?",
      choix: ["Pour montrer sa nationalité ou sa compagnie, ou pour faire des signaux", "Pour faire sécher le linge des marins", "Pour remplacer une voile déchirée", "Pour mesurer la force du vent"],
      reponse: "Pour montrer sa nationalité ou sa compagnie, ou pour faire des signaux",
      explication: "Le pavillon est un tissu hissé sur le navire. Il indique sa nationalité ou sa compagnie, et sert aussi à faire des signaux.", source: S(7) },
    { id: "lecture-s02-1-q16", fiche: "lecture-s02-1-f4", type: "association", niveau: 2,
      enonce: "Relie chaque mot à ce qu'il désigne.",
      gauche: ["sextant", "rouf", "ligne de flottaison", "mât de misaine"],
      droite: ["un abri en bois sur le pont", "le premier mât, à l'avant", "un instrument de navigation", "la limite entre la coque immergée et la coque émergée"],
      reponse: [[0, 2], [1, 0], [2, 3], [3, 1]],
      explication: "Le sextant est un instrument, le rouf un abri sur le pont. La ligne de flottaison marque la limite de l'eau sur la coque, et le mât de misaine se dresse à l'avant.", source: S(7) },
    // f5 : se repérer dans le navire
    { id: "lecture-s02-1-q17", fiche: "lecture-s02-1-f5", type: "qcm", niveau: 1,
      enonce: "Dans quelle pièce du navire range-t-on les réserves de nourriture ?",
      choix: ["La cambuse", "Le rouf", "L'entrepont", "La vigie"],
      reponse: "La cambuse",
      explication: "La cambuse est la pièce où l'on conserve la nourriture. L'entrepont, lui, est un étage entre le pont et la cale.", source: S(6) },
    { id: "lecture-s02-1-q18", fiche: "lecture-s02-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Les haubans sont de petites embarcations.",
      corrections: ["Faux : les haubans sont des cordages fixés au mât ; les petites embarcations sont les chaloupes.", "Faux : les haubans sont des vagues.", "Faux : les haubans sont des réserves de nourriture."],
      reponse: { vrai: false, correction: "Faux : les haubans sont des cordages fixés au mât ; les petites embarcations sont les chaloupes." },
      explication: "Les haubans sont des cordages attachés au mât. Les petites embarcations s'appellent des chaloupes.", source: S(6) },
    { id: "lecture-s02-1-q19", fiche: "lecture-s02-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment le navire est-il dirigé ?",
      choix: ["Grâce à la barre, une roue qui manœuvre le gouvernail", "Grâce aux haubans, que l'on tire vers l'arrière", "Grâce à la cambuse, qui sert de moteur", "Grâce au pavillon, qui pointe vers le nord"],
      reponse: "Grâce à la barre, une roue qui manœuvre le gouvernail",
      explication: "La barre sert à manœuvrer le gouvernail, qui dirige le bateau. C'est le travail du timonier.", source: S(6) },
    { id: "lecture-s02-1-q20", fiche: "lecture-s02-1-f5", type: "trou", niveau: 3,
      enonce: "Écris le mot qui manque.",
      texte: "L'___ est l'étage situé entre le pont et la cale.",
      reponse: [["entrepont"]],
      explication: "L'entrepont est un étage intermédiaire. Il se trouve entre le pont et la cale.", source: S(6) }
  ],
  bonus: [],
  nonCouvert: [
    "Le contenu des chapitres 1 et 2 (p. 31 à 44 du livre) : le livre n'est pas déposé, et la liste de vocabulaire ne dit pas à quel chapitre appartient chaque mot. Ce cours reprend le vocabulaire du navire et de l'équipage (pages 3, 6 et 7 de la liste).",
    "Le brick : la définition de la liste mélange deux sens (un voilier, un guetteur) ; seul « sorte de voilier » est repris.",
    "Les voiles foc, petit foc et din-foc, les chandeliers et la corne de brigantine : nommés sur le schéma de la page 3 sans explication simple, ils ne sont pas repris.",
    "Le galhauban, le faux pont, le plat-bord et la préceinte (pages 6 et 7) : trop proches des haubans, de l'entrepont ou de la coque pour faire des questions sans confusion."
  ]
};
