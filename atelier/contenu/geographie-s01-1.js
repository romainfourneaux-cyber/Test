// Source en clair du cours geographie-s01-1 (présentation du programme de géographie de 5e).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/geographie-s01-1.js.
// Seule source déposée : le tableau de progression. La fiche « Les outils du géographe » n'est pas déposée.
const F = "cours/geographie/Geo 5e - Tableau de progression.pdf";
const P = (page) => ({ fichier: F, page: page });

module.exports = {
  id: "geographie-s01-1",
  fiches: [
    {
      id: "geographie-s01-1-f1", notion: "L'organisation de l'année de géographie",
      titre: "Comment se déroule l'année",
      texte: "L'année de géographie est découpée en thèmes. Chaque thème alterne des cours, souvent en deux parties, et des études de cas, qui observent de près un pays ou un événement. Certains cours ont des vidéos en plus du papier. Des devoirs facultatifs partent à la correction. Le tableau de progression sert à cocher ce qui est compris et su.",
      pointsCles: [
        "V : vidéos et support papier ; P : support papier seulement",
        "Les outils du géographe 1 à 8 ont été vus en 6e : on peut les relire",
        "Les devoirs sont facultatifs, mais on peut les envoyer à la correction",
        "Le tableau de progression : une case « compris et su » et une case pour noter ce qui reste à revoir"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: [], source: P(1)
    },
    {
      id: "geographie-s01-1-f2", notion: "Le thème 1 : la croissance démographique et l'inégal développement",
      titre: "Le thème 1 en un coup d'œil",
      texte: "Le thème 1 parle de la croissance démographique et de l'inégal développement. Le cours 1 montre comment la population augmente, avec des besoins qui grandissent au Sud et un vieillissement au Nord. Le cours 2 étudie la richesse et la pauvreté dans le monde. Études de cas : le Burkina Faso, l'Inde, puis l'éducation en Afghanistan et en Finlande.",
      pointsCles: [
        "Cours 1 : I. croissance et développement de la population ; II. les pays du Sud ; III. les pays du Nord",
        "Cours 2 : I. une pauvreté qui recule ; II. des inégalités à différentes échelles",
        "Outil 9 : mesurer la pauvreté et les inégalités",
        "Deux devoirs facultatifs dans ce thème"
      ],
      dates: [], lieux: ["Burkina Faso", "Inde", "Afghanistan", "Finlande"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["geographie-s01-1-f1"], source: P(1)
    },
    {
      id: "geographie-s01-1-f3", notion: "Le thème 2 : des ressources limitées à gérer et à renouveler",
      titre: "Le thème 2 : eau, énergie, nourriture",
      texte: "Le thème 2 porte sur des ressources limitées qu'il faut gérer et renouveler. Trois cours : l'accès à l'eau, les ressources énergétiques, puis la question de nourrir les hommes. Chaque cours a ses études de cas : la Tunisie et le Moyen-Orient pour l'eau, la Russie et la Chine pour l'énergie, l'Éthiopie et l'Argentine pour l'alimentation.",
      pointsCles: [
        "Eau : l'accès en Tunisie ; les conflits liés à l'eau au Moyen-Orient",
        "Énergie : la Russie et ses hydrocarbures ; la Chine, du charbon aux panneaux solaires",
        "Alimentation : la situation en Éthiopie ; l'Argentine, un géant agricole"
      ],
      dates: [], lieux: ["Tunisie", "Moyen-Orient", "Russie", "Chine", "Éthiopie", "Argentine"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["geographie-s01-1-f1"], source: P(2)
    },
    {
      id: "geographie-s01-1-f4", notion: "Le thème 3 : prévenir les risques, s'adapter au changement global",
      titre: "Le thème 3 : risques et changement global",
      texte: "Le thème 3 apprend à prévenir les risques et à s'adapter au changement global. Le cours 1 traite des risques naturels, industriels et technologiques. Ce thème n'a qu'une seule étude de cas : le cyclone Nargis, en Birmanie, qu'on appelle aussi Myanmar. Le cours 2 porte sur le changement global et ses effets.",
      pointsCles: [
        "Cours 1 : risques naturels, industriels et technologiques",
        "Une seule étude de cas : le cyclone Nargis en Birmanie (Myanmar)",
        "Cours 2 : le changement global et ses effets"
      ],
      dates: [], lieux: ["Birmanie (Myanmar)"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["geographie-s01-1-f1"], source: P(2)
    }
  ],
  schemas: [],
  questions: [
    // f1
    { id: "geographie-s01-1-q1", fiche: "geographie-s01-1-f1", type: "qcm", niveau: 1,
      enonce: "Sur le tableau de progression, que veut dire la lettre P placée devant un cours ?",
      choix: ["Support papier seulement", "Vidéos et support papier", "Cours à préparer", "Partie à passer"],
      reponse: "Support papier seulement",
      explication: "P signale un cours seulement sur papier. V signale des vidéos en plus du papier.",
      indice: "L'autre lettre, V, parle de vidéos.", source: P(1) },
    { id: "geographie-s01-1-q2", fiche: "geographie-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les outils du géographe 1 à 8 ont déjà été étudiés en 6e.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, ils datent de la 6e. En 5e, on peut les relire ou les découvrir.", source: P(1) },
    { id: "geographie-s01-1-q3", fiche: "geographie-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment se sert-on du tableau de progression ?",
      choix: ["On coche les cours compris et sus, et on note ce qui reste à revoir", "On y écrit les réponses des devoirs", "On y colle les cartes du cours", "On y range les vidéos"],
      reponse: "On coche les cours compris et sus, et on note ce qui reste à revoir",
      explication: "Le tableau a une case « compris et su » et une case de remarques. Il sert à suivre ses progrès.", source: P(1) },
    { id: "geographie-s01-1-q4", fiche: "geographie-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les devoirs de géographie inscrits au tableau de progression sont obligatoires.",
      corrections: ["Faux : ils sont facultatifs, mais on peut les envoyer à la correction.", "Faux : il n'y a aucun devoir en géographie.", "Faux : les devoirs remplacent les cours."],
      reponse: { vrai: false, correction: "Faux : ils sont facultatifs, mais on peut les envoyer à la correction." },
      explication: "Le tableau les marque comme optionnels. On peut quand même les faire et les envoyer.", source: P(1) },
    // f2
    { id: "geographie-s01-1-q5", fiche: "geographie-s01-1-f2", type: "qcm", niveau: 1,
      enonce: "Quel est le sujet du thème 1 ?",
      choix: ["La croissance démographique et l'inégal développement", "Des ressources limitées à gérer et à renouveler", "Prévenir les risques et s'adapter au changement global", "Les climats de la Terre"],
      reponse: "La croissance démographique et l'inégal développement",
      explication: "Le thème 1 parle de la population qui augmente et des écarts de développement. L'eau et les risques viennent plus tard.", source: P(1) },
    { id: "geographie-s01-1-q6", fiche: "geographie-s01-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque étude de cas du thème 1 à son sujet.",
      gauche: ["Le Burkina Faso", "L'Inde", "L'Afghanistan et la Finlande"],
      droite: ["L'éducation", "Une forte croissance démographique", "La situation démographique du pays"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "Le Burkina Faso et l'Inde servent au cours 1 sur la population. L'Afghanistan et la Finlande servent au cours 2, sur l'éducation.", source: P(1) },
    { id: "geographie-s01-1-q7", fiche: "geographie-s01-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les trois parties du cours 1 du thème 1.",
      elements: ["Les pays du Nord et le défi du vieillissement", "Croissance et développement de la population", "Les pays du Sud et leurs besoins toujours plus grands"],
      reponse: [1, 2, 0],
      explication: "On voit d'abord la population mondiale, puis le Sud, puis le Nord.", source: P(1) },
    { id: "geographie-s01-1-q8", fiche: "geographie-s01-1-f2", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle le cours 2 du thème 1 ?",
      choix: ["Richesse et pauvreté dans le monde", "L'inégal accès à l'eau", "Nourrir les hommes", "Le changement global et ses effets"],
      reponse: "Richesse et pauvreté dans le monde",
      explication: "Après la population, le thème 1 étudie la richesse et la pauvreté. Les autres titres appartiennent aux thèmes 2 et 3.", source: P(1) },
    { id: "geographie-s01-1-q17", fiche: "geographie-s01-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Dans le cours 1 du thème 1, le vieillissement de la population est étudié dans les pays du Sud.",
      corrections: ["Faux : le vieillissement est étudié dans les pays du Nord ; au Sud, ce sont les besoins qui grandissent.", "Faux : le cours 1 ne parle que de l'eau.", "Faux : le vieillissement n'est étudié nulle part."],
      reponse: { vrai: false, correction: "Faux : le vieillissement est étudié dans les pays du Nord ; au Sud, ce sont les besoins qui grandissent." },
      explication: "La partie II parle des besoins des pays du Sud. La partie III parle du vieillissement des pays du Nord.", source: P(1) },
    // f3
    { id: "geographie-s01-1-q9", fiche: "geographie-s01-1-f3", type: "qcm_multiple", niveau: 1,
      enonce: "Quelles ressources le thème 2 étudie-t-il ?",
      choix: ["L'eau", "L'énergie", "L'alimentation", "L'or et les diamants", "Les monuments historiques"],
      reponse: ["L'eau", "L'énergie", "L'alimentation"],
      explication: "Le thème 2 a trois cours : l'eau, l'énergie et nourrir les hommes.", source: P(2) },
    { id: "geographie-s01-1-q10", fiche: "geographie-s01-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque étude de cas du thème 2 à ce qu'elle étudie.",
      gauche: ["La Tunisie", "La Russie", "L'Éthiopie", "La Chine"],
      droite: ["La situation alimentaire", "L'accès à l'eau", "Le passage du charbon aux panneaux solaires", "Les hydrocarbures"],
      reponse: [[0, 1], [1, 3], [2, 0], [3, 2]],
      explication: "La Tunisie sert au cours sur l'eau, la Russie et la Chine à celui sur l'énergie. L'Éthiopie sert au cours sur l'alimentation.", source: P(2) },
    { id: "geographie-s01-1-q11", fiche: "geographie-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Dans le thème 2, l'Argentine est présentée comme un géant agricole.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, c'est le titre de la dernière étude de cas du cours sur l'alimentation.", source: P(2) },
    { id: "geographie-s01-1-q12", fiche: "geographie-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment le thème 2 aborde-t-il l'eau au Moyen-Orient ?",
      choix: ["Par les conflits liés à l'eau", "Par la pêche en mer", "Par les inondations", "Par le tourisme au bord de la mer"],
      reponse: "Par les conflits liés à l'eau",
      explication: "L'étude de cas 2 du thème 2 porte sur les conflits liés à l'eau au Moyen-Orient.", source: P(2) },
    // f4
    { id: "geographie-s01-1-q13", fiche: "geographie-s01-1-f4", type: "qcm", niveau: 1,
      enonce: "Quel événement sert d'étude de cas au thème 3 ?",
      choix: ["Le cyclone Nargis en Birmanie", "Un séisme au Japon", "Une sécheresse en Éthiopie", "Une crue du Nil"],
      reponse: "Le cyclone Nargis en Birmanie",
      explication: "La seule étude de cas du thème 3 porte sur le cyclone Nargis. La Birmanie s'appelle aussi Myanmar.", source: P(2) },
    { id: "geographie-s01-1-q14", fiche: "geographie-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le thème 3 compte plusieurs études de cas.",
      corrections: ["Faux : il n'en a qu'une, sur le cyclone Nargis en Birmanie.", "Faux : il n'en a aucune.", "Faux : il en a six, comme le thème 2."],
      reponse: { vrai: false, correction: "Faux : il n'en a qu'une, sur le cyclone Nargis en Birmanie." },
      explication: "Le tableau précise qu'il y a une seule étude de cas pour ce thème.", source: P(2) },
    { id: "geographie-s01-1-q15", fiche: "geographie-s01-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels types de risques le cours 1 du thème 3 étudie-t-il ?",
      choix: ["Les risques naturels", "Les risques industriels", "Les risques technologiques", "Les risques financiers", "Les risques sportifs"],
      reponse: ["Les risques naturels", "Les risques industriels", "Les risques technologiques"],
      explication: "Le cours 1 du thème 3 réunit trois sortes de risques : naturels, industriels et technologiques.", source: P(2) },
    { id: "geographie-s01-1-q16", fiche: "geographie-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment s'intitule le thème 3 ?",
      choix: ["Prévenir les risques, s'adapter au changement global", "Des ressources limitées à gérer et à renouveler", "La croissance démographique et l'inégal développement", "Richesse et pauvreté dans le monde"],
      reponse: "Prévenir les risques, s'adapter au changement global",
      explication: "Le dernier thème parle des risques et du changement global. Les autres titres viennent des thèmes 1 et 2.", source: P(2) }
  ],
  bonus: [],
  nonCouvert: [
    "La fiche « Les outils du géographe » (outils 1 à 8, vus en 6e) n'est pas déposée : son contenu n'est pas dans le jeu.",
    "La vidéo de présentation du programme (repère V du tableau) n'est pas déposée.",
    "Le contenu des cours eux-mêmes (thèmes 2 et 3, cours 2 du thème 1, outil 9) : seuls leurs titres figurent dans le tableau."
  ]
};
