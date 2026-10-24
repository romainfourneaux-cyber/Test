// Source en clair du cours svt-s05-2 (livret 1, chapitre 2, séance 5 : notion de risque météo et climatique).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s05-2.
// Seule source déposée : le corrigé du livret 1, p. 11 (exercice sur les cyclones de la Réunion : enjeux, aléas,
// vulnérabilité, définition du risque). La leçon n'est pas déposée : les définitions qu'elle donnerait (aléa, danger…)
// vont dans nonCouvert. Ce cours porte sur les notions ; l'exemple détaillé des cyclones (1962, alertes, kit de survie)
// est dans svt-s06-1. Anti-spoil du devoir 1 : aucune question ne reprend l'exemple ni les chiffres du devoir, et les
// questions sont tournées autrement que les siennes.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });

module.exports = {
  id: "svt-s05-2",
  fiches: [
    {
      id: "svt-s05-2-f1", notion: "L'aléa",
      titre: "Le phénomène qui menace",
      texte: "Un aléa est le phénomène naturel qui peut frapper un territoire. Dans l'exemple étudié, les aléas sont les cyclones : cinq cyclones différents sont cités pour l'île de la Réunion, et l'aléa « cyclone » y est toujours présent. L'aléa ne dit rien, à lui seul, des dégâts : il décrit seulement ce qui peut arriver.",
      pointsCles: [
        "Aléa : le phénomène naturel qui peut frapper (le cyclone, à la Réunion)",
        "Un même aléa peut revenir plusieurs fois sur le même territoire",
        "L'aléa ne décrit pas les dégâts"
      ],
      dates: [], lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "aléa", def: "un phénomène naturel qui peut frapper un territoire, comme un cyclone" }
      ],
      schema: null, prerequis: ["svt-s03-1-f4"], source: C(11)
    },
    {
      id: "svt-s05-2-f2", notion: "Les enjeux",
      titre: "Ce qui peut être touché",
      texte: "Les enjeux sont les personnes et les biens qu'un aléa peut toucher. Pour les cyclones de la Réunion, ce sont les personnes, souvent déjà sur leur lieu de travail, les habitations, la flotte de pêche sortie en mer, la flotte de tourisme, comme un paquebot amarré au port, et les transports terrestres, comme les wagons de chemin de fer.",
      pointsCles: [
        "Enjeux : personnes et biens exposés à l'aléa",
        "À la Réunion : les personnes, les habitations",
        "Aussi : flotte de pêche, flotte de tourisme (paquebot), transports terrestres (wagons)"
      ],
      dates: [], lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "enjeu", def: "une personne ou un bien qui peut être touché par un aléa" },
        { mot: "flotte", def: "l'ensemble des bateaux d'un port ou d'une activité" }
      ],
      schema: null, prerequis: ["svt-s05-2-f1"], source: C(11)
    },
    {
      id: "svt-s05-2-f3", notion: "La vulnérabilité et le risque",
      titre: "Risque = aléa + vulnérabilité des enjeux",
      texte: "La vulnérabilité, c'est l'ampleur des dégâts que les enjeux subissent : à la Réunion, chaque cyclone a provoqué des dégâts majeurs, voire considérables. Le risque combine les deux : un aléa et la vulnérabilité des enjeux. Il n'y a pas de risque sans aléa, et le risque est d'autant plus grand que les enjeux sont vulnérables.",
      pointsCles: [
        "Vulnérabilité : l'ampleur des dégâts subis par les enjeux",
        "Risque : un aléa combiné à la vulnérabilité des enjeux",
        "Quand on te demande ce qu'est un risque, redonne la définition"
      ],
      astuce: "Trois mots à retenir ensemble : aléa (ce qui frappe), enjeux (ce qui est touché), vulnérabilité (l'ampleur des dégâts). Le risque les combine.",
      dates: [], lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "vulnérabilité", def: "l'importance des dégâts que les enjeux subissent quand l'aléa frappe" },
        { mot: "risque", def: "la combinaison d'un aléa et de la vulnérabilité des enjeux" }
      ],
      schema: null, prerequis: ["svt-s05-2-f2"], source: C(11)
    },
    {
      id: "svt-s05-2-f4", notion: "Analyser un risque",
      titre: "Aléa, enjeux, vulnérabilité, puis conclusion",
      texte: "Pour analyser un risque, on repère d'abord l'aléa, puis on liste les enjeux et on estime leur vulnérabilité d'après les dégâts. Si le risque change alors que l'aléa reste présent, ce sont les enjeux ou leur vulnérabilité qui ont changé. À la Réunion, le nombre de morts par cyclone a beaucoup baissé entre 1962 et 2014 sans que l'aléa disparaisse.",
      pointsCles: [
        "Étapes : aléa, enjeux, vulnérabilité, conclusion",
        "Aléa inchangé mais risque en baisse : les enjeux ou leur vulnérabilité ont changé",
        "Réunion : beaucoup moins de morts entre 1962 et 2014, cyclones toujours présents"
      ],
      dates: [
        { annee: 1962, evenement: "Un cyclone frappe la Réunion ; le bilan humain est lourd" },
        { annee: 2014, evenement: "Dernière année du tableau des cyclones : bien moins de morts qu'en 1962" }
      ],
      lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "analyser", def: "examiner une situation morceau par morceau pour la comprendre" }
      ],
      schema: null, prerequis: ["svt-s05-2-f3"], source: C(11)
    }
  ],
  schemas: [],
  questions: [
    // f1 : l'aléa
    { id: "svt-s05-2-q1", fiche: "svt-s05-2-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on le phénomène naturel qui peut frapper un territoire, comme un cyclone ?",
      choix: ["Un aléa", "Un enjeu", "Une vulnérabilité", "Un risque"],
      reponse: "Un aléa",
      explication: "Le phénomène naturel qui menace est l'aléa. Les enjeux sont ce qu'il peut toucher, et le risque combine les deux.", source: C(11) },
    { id: "svt-s05-2-q2", fiche: "svt-s05-2-f1", type: "qcm", niveau: 1,
      enonce: "Dans l'exemple de la Réunion, quel est l'aléa ?",
      choix: ["Les cyclones", "Les habitants", "Les maisons", "Les bateaux de pêche"],
      reponse: "Les cyclones",
      explication: "L'aléa, c'est le cyclone. Habitants, maisons et bateaux sont les enjeux.", source: C(11) },
    { id: "svt-s05-2-q3", fiche: "svt-s05-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Un même aléa, comme le cyclone, peut frapper plusieurs fois le même territoire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : cinq cyclones différents ont touché la Réunion. L'aléa reste présent sur l'île.", source: C(11) },
    { id: "svt-s05-2-q4", fiche: "svt-s05-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Les habitations détruites par un cyclone sont un exemple d'aléa.",
      corrections: ["Faux : les habitations sont un enjeu ; l'aléa, c'est le cyclone.", "Faux : les habitations détruites sont le risque.", "Faux : les habitations sont un aléa seulement si elles sont neuves."],
      reponse: { vrai: false, correction: "Faux : les habitations sont un enjeu ; l'aléa, c'est le cyclone." },
      explication: "L'aléa est le phénomène naturel : ici le cyclone. Les habitations font partie des enjeux qu'il touche.", source: C(11) },
    { id: "svt-s05-2-q5", fiche: "svt-s05-2-f1", type: "qcm", niveau: 2,
      enonce: "Lequel de ces exemples est un aléa ?",
      choix: ["Un cyclone", "Un paquebot au port", "Une famille dans sa maison", "Des wagons de chemin de fer"],
      reponse: "Un cyclone",
      explication: "Seul le cyclone est un phénomène naturel : c'est l'aléa. Les trois autres sont des enjeux.", source: C(11) },
    { id: "svt-s05-2-q6", fiche: "svt-s05-2-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi dit-on que l'aléa « cyclone » est toujours présent à la Réunion ?",
      choix: ["Parce que des cyclones continuent de frapper l'île au fil des années", "Parce que l'île est protégée par une digue", "Parce que la population a augmenté", "Parce que les cyclones ne touchent jamais les continents, seulement les îles"],
      reponse: "Parce que des cyclones continuent de frapper l'île au fil des années",
      explication: "Les cyclones reviennent régulièrement sur l'île. L'aléa n'a donc pas disparu, même si les dégâts changent.", source: C(11) },
    { id: "svt-s05-2-q7", fiche: "svt-s05-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Que dit l'exemple de la Réunion sur l'aléa « cyclone » ? (plusieurs réponses)",
      choix: ["Il est toujours présent sur l'île", "Cinq cyclones différents sont cités", "Il a disparu après le cyclone de 1962", "Il ne touche que les bateaux", "C'est un enjeu"],
      reponse: ["Il est toujours présent sur l'île", "Cinq cyclones différents sont cités"],
      explication: "Les cyclones reviennent régulièrement sur l'île : cinq sont cités, et l'aléa reste présent. Le cyclone est l'aléa, pas un enjeu.", source: C(11) },
    // f2 : les enjeux
    { id: "svt-s05-2-q8", fiche: "svt-s05-2-f2", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on les personnes et les biens qui peuvent être touchés par un aléa ?",
      choix: ["Les enjeux", "Les aléas", "Les dégâts", "Les prévisions"],
      reponse: "Les enjeux",
      explication: "Les enjeux sont tout ce que l'aléa peut toucher : personnes, maisons, bateaux, transports. Les dégâts mesurent leur vulnérabilité.", source: C(11) },
    { id: "svt-s05-2-q9", fiche: "svt-s05-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Pour les cyclones de la Réunion, quels sont les enjeux ? (plusieurs réponses)",
      choix: ["Les personnes", "Les habitations", "Les bateaux de pêche", "Les paquebots de tourisme", "Les transports terrestres", "Les cyclones"],
      reponse: ["Les personnes", "Les habitations", "Les bateaux de pêche", "Les paquebots de tourisme", "Les transports terrestres"],
      explication: "Personnes, habitations, flotte de pêche, flotte de tourisme et transports terrestres : voilà les enjeux. Le cyclone, lui, est l'aléa.", source: C(11) },
    { id: "svt-s05-2-q10", fiche: "svt-s05-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Les wagons de chemin de fer emportés par un cyclone font partie des enjeux.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les transports terrestres sont des enjeux. Un cyclone peut les détruire ou les emporter.", source: C(11) },
    { id: "svt-s05-2-q11", fiche: "svt-s05-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le cyclone lui-même fait partie des enjeux.",
      corrections: ["Faux : le cyclone est l'aléa ; les enjeux sont ce qu'il peut toucher.", "Faux : le cyclone est la vulnérabilité.", "Faux : le cyclone est un enjeu seulement s'il fait des dégâts."],
      reponse: { vrai: false, correction: "Faux : le cyclone est l'aléa ; les enjeux sont ce qu'il peut toucher." },
      explication: "Le cyclone est le phénomène qui frappe : l'aléa. Les enjeux, ce sont les personnes et les biens exposés.", source: C(11) },
    { id: "svt-s05-2-q12", fiche: "svt-s05-2-f2", type: "qcm", niveau: 2,
      enonce: "Lequel de ces exemples est un enjeu ?",
      choix: ["Des barques de pêcheurs", "Un cyclone", "Les dégâts qu'il provoque", "Le risque"],
      reponse: "Des barques de pêcheurs",
      explication: "Les barques peuvent être détruites : ce sont des enjeux. Le cyclone est l'aléa, les dégâts traduisent la vulnérabilité, et le risque combine les deux.", source: C(11) },
    { id: "svt-s05-2-q13", fiche: "svt-s05-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi les personnes déjà sur leur lieu de travail au moment d'un cyclone comptent-elles parmi les enjeux ?",
      choix: ["Parce qu'elles peuvent être blessées ou tuées par le cyclone", "Parce qu'elles provoquent le cyclone", "Parce qu'elles mesurent le vent", "Parce qu'elles sont à l'abri dans des bâtiments solides et bien fermés"],
      reponse: "Parce qu'elles peuvent être blessées ou tuées par le cyclone",
      explication: "Les personnes exposées au cyclone sont les premiers enjeux. Celles qui sont déjà au travail à ce moment-là sont citées en premier dans l'exemple.", source: C(11) },
    { id: "svt-s05-2-q14", fiche: "svt-s05-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Les personnes, les habitations et les bateaux qu'un cyclone peut toucher sont des ___.",
      banque: ["enjeux", "aléas", "risques", "prévisions"],
      reponse: [["enjeux"]],
      explication: "Tout ce que l'aléa peut toucher est un enjeu. Les aléas, eux, sont les phénomènes naturels.", source: C(11) },
    // f3 : la vulnérabilité et le risque
    { id: "svt-s05-2-q15", fiche: "svt-s05-2-f3", type: "qcm", niveau: 1,
      enonce: "Un risque, c'est la combinaison de quoi ?",
      choix: ["D'un aléa et de la vulnérabilité des enjeux", "De deux aléas qui frappent le même territoire au même moment", "D'un enjeu et d'une prévision", "De la pluie et du vent"],
      reponse: "D'un aléa et de la vulnérabilité des enjeux",
      explication: "Le risque réunit un aléa et la vulnérabilité des enjeux. Sans aléa ou sans enjeu vulnérable, pas de risque.", source: C(11) },
    { id: "svt-s05-2-q16", fiche: "svt-s05-2-f3", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on l'importance des dégâts que subissent les enjeux ?",
      choix: ["La vulnérabilité", "L'aléa", "La prévision", "La moyenne"],
      reponse: "La vulnérabilité",
      explication: "La vulnérabilité se lit dans l'ampleur des dégâts. Des dégâts considérables signalent des enjeux très vulnérables.", source: C(11) },
    { id: "svt-s05-2-q17", fiche: "svt-s05-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Dans l'exemple de la Réunion, la vulnérabilité se lit dans les dégâts causés par chaque cyclone.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les dégâts, majeurs ou considérables, traduisent la vulnérabilité des enjeux. Plus ils sont graves, plus les enjeux sont vulnérables.", source: C(11) },
    { id: "svt-s05-2-q18", fiche: "svt-s05-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le risque ne dépend que de la force de l'aléa.",
      corrections: ["Faux : il dépend aussi de la vulnérabilité des enjeux.", "Faux : il ne dépend que du nombre d'habitants.", "Faux : il ne dépend que des prévisions météo."],
      reponse: { vrai: false, correction: "Faux : il dépend aussi de la vulnérabilité des enjeux." },
      explication: "Un aléa très fort sur des enjeux bien protégés fait courir moins de risque. Le risque combine l'aléa et la vulnérabilité.", source: C(11) },
    { id: "svt-s05-2-q19", fiche: "svt-s05-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque exemple à sa catégorie.",
      gauche: ["Un cyclone", "Des maisons et des personnes", "Des dégâts considérables", "Aléa combiné à la vulnérabilité des enjeux"],
      droite: ["Le risque", "La vulnérabilité", "L'aléa", "Les enjeux"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Le cyclone frappe (aléa), les maisons et les personnes sont touchées (enjeux), les dégâts mesurent la vulnérabilité. Le tout forme le risque.", source: C(11) },
    { id: "svt-s05-2-q20", fiche: "svt-s05-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi le risque est-il différent de l'aléa ?",
      choix: ["Parce que le risque tient compte aussi des enjeux et de leur vulnérabilité", "Parce que le risque est toujours plus fort que l'aléa qui le provoque", "Parce que l'aléa n'existe qu'en mer", "Parce que le risque se mesure en millimètres"],
      reponse: "Parce que le risque tient compte aussi des enjeux et de leur vulnérabilité",
      explication: "L'aléa est seulement le phénomène naturel. Le risque ajoute ce qu'il peut toucher et l'ampleur des dégâts.", source: C(11) },
    { id: "svt-s05-2-q21", fiche: "svt-s05-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment évaluer la vulnérabilité après le passage d'un cyclone ?",
      choix: ["En regardant l'ampleur des dégâts subis", "En mesurant la vitesse du vent au plus fort du cyclone", "En comptant les cyclones précédents", "En lisant la carte des pluies"],
      reponse: "En regardant l'ampleur des dégâts subis",
      explication: "La vulnérabilité se juge aux dégâts : majeurs, considérables… La vitesse du vent décrit l'aléa, pas la vulnérabilité.", source: C(11) },
    { id: "svt-s05-2-q22", fiche: "svt-s05-2-f3", type: "trou", niveau: 1,
      enonce: "Complète la définition.",
      texte: "Le risque est la combinaison d'un ___ avec la ___ des enjeux.",
      banque: ["aléa", "vulnérabilité", "enjeu", "moyenne"],
      reponse: [["aléa"], ["vulnérabilité"]],
      explication: "Un aléa et la vulnérabilité des enjeux : voilà les deux ingrédients du risque. Il faut les deux.", source: C(11) },
    // f4 : analyser un risque
    { id: "svt-s05-2-q23", fiche: "svt-s05-2-f4", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes d'une analyse de risque.",
      elements: ["Lister les enjeux : personnes, habitations, bateaux…", "Repérer l'aléa : le phénomène naturel en cause", "Conclure sur le risque", "Estimer la vulnérabilité : l'ampleur des dégâts"],
      reponse: [1, 0, 3, 2],
      explication: "Aléa, enjeux, vulnérabilité, puis conclusion. On suit la définition du risque dans l'ordre.", source: C(11) },
    { id: "svt-s05-2-q24", fiche: "svt-s05-2-f4", type: "qcm", niveau: 2,
      enonce: "À la Réunion, le nombre de morts par cyclone a beaucoup baissé entre 1962 et 2014. Comment l'expliquer, puisque l'aléa est toujours là ?",
      choix: ["Les enjeux ou leur vulnérabilité ont changé", "Les cyclones ont disparu", "Le vent a baissé partout dans le monde", "L'île a changé de place"],
      reponse: "Les enjeux ou leur vulnérabilité ont changé",
      explication: "Si l'aléa n'a pas changé, c'est du côté des enjeux ou de leur vulnérabilité qu'il faut chercher. Ici, les personnes sont devenues moins vulnérables.", source: C(11) },
    { id: "svt-s05-2-q25", fiche: "svt-s05-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Si le risque diminue alors que l'aléa reste le même, c'est que les enjeux ou leur vulnérabilité ont changé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le risque n'a que deux ingrédients. Quand l'un ne bouge pas, c'est l'autre qui a changé.", source: C(11) },
    { id: "svt-s05-2-q26", fiche: "svt-s05-2-f4", type: "vrai_faux", niveau: 3,
      enonce: "À la Réunion, la baisse du nombre de morts par cyclone s'explique par une baisse de la population.",
      corrections: ["Faux : rien n'indique que la population ait changé ; c'est la vulnérabilité des personnes qui a baissé.", "Faux : elle s'explique par la disparition des cyclones.", "Faux : elle s'explique par un déplacement de l'île hors de la zone des cyclones."],
      reponse: { vrai: false, correction: "Faux : rien n'indique que la population ait changé ; c'est la vulnérabilité des personnes qui a baissé." },
      explication: "Aucune information ne parle d'une baisse de la population. C'est la vulnérabilité des personnes qui a diminué.", source: C(11) },
    { id: "svt-s05-2-q27", fiche: "svt-s05-2-f4", type: "qcm", niveau: 3,
      enonce: "Deux cyclones de même force frappent deux îles. Lequel fait courir le plus grand risque ?",
      choix: ["Celui qui frappe l'île aux enjeux les plus vulnérables", "Celui qui a eu lieu le plus récemment, car la population est plus nombreuse", "Celui qui a duré le moins longtemps", "Celui qui a reçu le plus beau nom"],
      reponse: "Celui qui frappe l'île aux enjeux les plus vulnérables",
      explication: "À aléa égal, le risque dépend de la vulnérabilité des enjeux. Plus ils sont vulnérables, plus le risque est grand.", source: C(11) },
    { id: "svt-s05-2-q28", fiche: "svt-s05-2-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Quelles questions se poser pour analyser un risque ? (plusieurs réponses)",
      choix: ["Quel est l'aléa ?", "Quels sont les enjeux ?", "Quelle est leur vulnérabilité ?", "Quelle est la couleur du ciel ?", "Quel jour de la semaine est-on ?"],
      reponse: ["Quel est l'aléa ?", "Quels sont les enjeux ?", "Quelle est leur vulnérabilité ?"],
      explication: "Aléa, enjeux, vulnérabilité : les trois questions de l'analyse. Leurs réponses permettent de conclure sur le risque.", source: C(11) },
    { id: "svt-s05-2-q29", fiche: "svt-s05-2-f4", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce qui ne change pas, à la Réunion, entre le cyclone de 1962 et ceux d'aujourd'hui ?",
      choix: ["L'aléa : les cyclones continuent de passer", "La vulnérabilité des personnes face au vent et à la pluie", "Le nombre de morts", "Les moyens d'alerte"],
      reponse: "L'aléa : les cyclones continuent de passer",
      explication: "Les cyclones reviennent toujours : l'aléa est le même. Ce qui a changé, c'est la vulnérabilité des personnes, donc le nombre de morts.", source: C(11) }
  ],
  bonus: [
    {
      id: "svt-s05-2-b1", fiche: "svt-s05-2-f3",
      titre: "Vert, jaune, orange, rouge : la vigilance météo",
      texte: "En France, Météo-France publie depuis 2001 une carte de vigilance, mise à jour au moins deux fois par jour. Chaque département reçoit une couleur : vert quand il n'y a pas de vigilance particulière, jaune pour être attentif, orange pour être très vigilant, rouge quand une vigilance absolue s'impose. Neuf phénomènes sont suivis, dont le vent, la pluie-inondation, les orages, la neige-verglas, la canicule et les vagues-submersion.",
      source: { titre: "Vigilance météorologique", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Vigilance_m%C3%A9t%C3%A9orologique" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 5 n'est pas déposée : les définitions qu'elle donne du danger, de l'aléa et de l'enjeu, et la différence entre aléa et danger, ne sont pas dans le jeu ; seules les notions lisibles dans le corrigé (aléa, enjeux, vulnérabilité, risque) le sont.",
    "Les risques météorologiques autres que le cyclone (tempête, inondation, canicule…) : aucun exemple dans le corrigé.",
    "Le tableau des cinq cyclones de la Réunion (noms, dates, dégâts) : non reproduit dans le corrigé ; seules ses conclusions sont reprises."
  ]
};
