// Source en clair du cours geographie-s03-1 (Thème 1, cours 1, 2e partie : III. Dans les pays du Nord).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/geographie-s03-1.js.
// Pages utilisées : 4 et 10 du cours 1. Le devoir geographie-d1 couvre ce cours : aucune question ne reprend ses
// questions, ses chiffres ni ses réponses attendues (le seuil de renouvellement n'est demandé par aucune question).
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 1.pdf";
const P = (page) => ({ fichier: F, page: page });

module.exports = {
  id: "geographie-s03-1",
  fiches: [
    {
      id: "geographie-s03-1-f1", notion: "Le vieillissement des pays riches",
      titre: "Des populations qui vieillissent",
      texte: "Dans les pays développés, on vit très longtemps et les couples ont de moins en moins d'enfants : la population vieillit. C'est le cas au Japon, en Russie et en Europe. Pour se renouveler, une population doit dépasser 2,1 enfants par femme. Beaucoup de pays n'y arrivent plus ; en Europe de l'Est et en Russie, la population baisse dangereusement.",
      pointsCles: [
        "Une espérance de vie très élevée et peu d'enfants : la population vieillit",
        "Japon, Russie, Europe : de moins en moins d'enfants par couple",
        "Beaucoup de pays ne renouvellent plus leur population naturellement",
        "Dans le monde, la part des personnes âgées doit presque doubler d'ici le milieu du siècle"
      ],
      dates: [], lieux: ["Japon", "Russie", "Europe"], personnages: [],
      vocabulaire: [
        { mot: "vieillissement de la population", def: "la hausse de la part des personnes âgées dans une population" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f3"], source: P(4)
    },
    {
      id: "geographie-s03-1-f2", notion: "L'hiver démographique de l'Europe",
      titre: "L'hiver démographique de l'Europe",
      texte: "Depuis les années 1970, l'Europe ne renouvelle plus sa population par les seules naissances : les femmes ont trop peu d'enfants pour remplacer les générations. Depuis 2012, le continent enregistre même chaque année plus de décès que de naissances. On parle d'hiver démographique.",
      pointsCles: [
        "Depuis les années 1970 : une fécondité trop faible pour remplacer les générations",
        "Depuis 2012 : chaque année, plus de décès que de naissances en Europe",
        "Une année récente : environ 4,2 millions de naissances pour 4,7 millions de décès"
      ],
      dates: [{ annee: 2012, evenement: "L'Europe compte désormais chaque année plus de décès que de naissances" }],
      lieux: ["Europe"], personnages: [],
      vocabulaire: [
        { mot: "hiver démographique", def: "la situation d'une population qui ne se renouvelle plus, faute de naissances suffisantes" }
      ],
      schema: null, prerequis: ["geographie-s03-1-f1"], source: P(10)
    },
    {
      id: "geographie-s03-1-f3", notion: "Les problèmes posés par le vieillissement",
      titre: "Les défis du vieillissement",
      texte: "Avec plus de personnes âgées, les États doivent payer davantage de retraites et créer des services de santé, comme des hôpitaux ou des maisons de retraite, car on se soigne plus en vieillissant. En France, plus de 600 000 personnes âgées vivent en maison de retraite ou en EHPAD. Comme les jeunes manquent, le pays manque aussi de travailleurs.",
      pointsCles: [
        "Financer les retraites",
        "Créer des services de santé : hôpitaux, maisons de retraite",
        "Des dépenses de santé qui augmentent avec l'âge",
        "Un manque de jeunes, donc une pénurie de main-d'œuvre"
      ],
      dates: [], lieux: ["France"], personnages: [],
      vocabulaire: [
        { mot: "EHPAD", def: "un établissement qui loge des personnes âgées ayant besoin d'aide au quotidien" },
        { mot: "pénurie de main-d'œuvre", def: "un manque de travailleurs" }
      ],
      schema: null, prerequis: ["geographie-s03-1-f1"], source: P(4)
    },
    {
      id: "geographie-s03-1-f4", notion: "Les politiques face au vieillissement",
      titre: "Des réponses différentes",
      texte: "Face au vieillissement, les pays font des choix différents. La France et l'Allemagne favorisent l'immigration venue des pays du Sud ; l'Allemagne y a cherché des travailleurs. La Hongrie, elle, pousse les couples à avoir plus d'enfants : elle aide les familles nombreuses avec de l'argent, des places en crèche et des avantages sur les impôts.",
      pointsCles: [
        "France, Allemagne : favoriser l'immigration venue des pays du Sud",
        "Allemagne : faire venir des immigrés pour trouver de la main-d'œuvre",
        "Hongrie : aider les familles nombreuses (aides en argent, places en crèche, avantages fiscaux)"
      ],
      dates: [], lieux: ["France", "Allemagne", "Hongrie"], personnages: [],
      vocabulaire: [
        { mot: "immigration", def: "le fait de venir s'installer dans un pays qui n'est pas le sien" }
      ],
      schema: null, prerequis: ["geographie-s03-1-f3"], source: P(4)
    }
  ],
  schemas: [],
  questions: [
    // f1
    { id: "geographie-s03-1-q1", fiche: "geographie-s03-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "En Europe de l'Est et en Russie, la population diminue.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, le cours dit même qu'elle y baisse dangereusement. Il n'y naît plus assez d'enfants.", source: P(4) },
    { id: "geographie-s03-1-q2", fiche: "geographie-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "D'après le cours, comment la part des personnes âgées dans la population mondiale va-t-elle évoluer d'ici le milieu du siècle ?",
      choix: ["Elle va presque doubler", "Elle va baisser de moitié", "Elle ne changera pas", "Elle va être multipliée par dix"],
      reponse: "Elle va presque doubler",
      explication: "Le schéma du cours montre une part qui passe d'environ 8 % à presque le double. Le monde entier vieillit, pas seulement les pays riches.", source: P(4) },
    { id: "geographie-s03-1-q3", fiche: "geographie-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Que se passe-t-il quand une population n'a plus assez d'enfants pour se renouveler ?",
      choix: ["Elle ne se renouvelle plus naturellement et peut diminuer", "Elle double en quelques années", "Elle rajeunit", "Elle se renouvelle plus vite"],
      reponse: "Elle ne se renouvelle plus naturellement et peut diminuer",
      explication: "Les naissances ne compensent plus les décès. Sans arrivées de l'étranger, la population finit par baisser.", source: P(4) },
    { id: "geographie-s03-1-q4", fiche: "geographie-s03-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Au Japon, en Russie et en Europe, les couples ont de plus en plus d'enfants.",
      corrections: ["Faux : ils en ont de moins en moins, ce qui fait vieillir la population.", "Faux : ils n'ont plus du tout d'enfants.", "Faux : ils en ont autant que dans les PMA."],
      reponse: { vrai: false, correction: "Faux : ils en ont de moins en moins, ce qui fait vieillir la population." },
      explication: "Ces pays font de moins en moins d'enfants. La part des personnes âgées y grandit.", source: P(4) },
    { id: "geographie-s03-1-q19", fiche: "geographie-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi la population des pays développés vieillit-elle ?",
      choix: ["Parce qu'il y naît peu d'enfants et qu'on y vit très longtemps", "Parce que les naissances y sont de plus en plus nombreuses", "Parce que l'espérance de vie y baisse", "Parce que les jeunes y sont de plus en plus nombreux"],
      reponse: "Parce qu'il y naît peu d'enfants et qu'on y vit très longtemps",
      explication: "Peu de naissances, c'est peu de jeunes ; une longue espérance de vie, c'est beaucoup de personnes âgées. La part des personnes âgées grandit donc.", source: P(4) },
    // f2
    { id: "geographie-s03-1-q5", fiche: "geographie-s03-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Depuis 2012, l'Europe compte chaque année plus de naissances que de décès.",
      corrections: ["Faux : c'est l'inverse, il y a plus de décès que de naissances.", "Faux : naissances et décès y sont toujours égaux.", "Faux : il n'y a plus aucune naissance en Europe."],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse, il y a plus de décès que de naissances." },
      explication: "Depuis 2012, les décès l'emportent sur les naissances en Europe. C'est l'hiver démographique.", source: P(10) },
    { id: "geographie-s03-1-q6", fiche: "geographie-s03-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi la population européenne ne se renouvelle-t-elle plus naturellement ?",
      choix: ["Parce que les femmes ont trop peu d'enfants pour remplacer les générations", "Parce qu'il naît trop d'enfants", "Parce que l'espérance de vie s'effondre", "Parce que tout le monde quitte l'Europe"],
      reponse: "Parce que les femmes ont trop peu d'enfants pour remplacer les générations",
      explication: "La fécondité est trop basse depuis les années 1970. Les jeunes générations sont moins nombreuses que celles qu'elles remplacent.", source: P(10) },
    { id: "geographie-s03-1-q7", fiche: "geographie-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "Depuis quand la population européenne ne se renouvelle-t-elle plus naturellement ?",
      choix: ["Depuis les années 1970", "Depuis le Moyen Âge", "Depuis l'an 2000", "Depuis le XIXe siècle"],
      reponse: "Depuis les années 1970",
      explication: "Le cours date le début de l'hiver démographique européen des années 1970.", source: P(10) },
    { id: "geographie-s03-1-q8", fiche: "geographie-s03-1-f2", type: "qcm", niveau: 3,
      enonce: "Une année récente, l'Europe a eu environ 4,2 millions de naissances. Combien a-t-elle compté de décès ?",
      choix: ["Environ 4,7 millions", "Environ 2 millions", "Environ 1 million", "Aucun"],
      reponse: "Environ 4,7 millions",
      explication: "Il y a eu plus de décès que de naissances. C'est le signe de l'hiver démographique.", source: P(10) },
    { id: "geographie-s03-1-q18", fiche: "geographie-s03-1-f2", type: "trou", niveau: 2,
      enonce: "Complète la phrase.",
      texte: "Depuis les années ___, l'Europe ne renouvelle plus sa population par les naissances : on parle alors de l'___ démographique.",
      banque: ["1970", "hiver", "été", "1920"],
      reponse: [["1970"], ["hiver"]],
      explication: "Depuis les années 1970, il naît trop peu d'enfants en Europe. Le cours appelle cela l'hiver démographique.", source: P(10) },
    // f3
    { id: "geographie-s03-1-q9", fiche: "geographie-s03-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels problèmes le vieillissement pose-t-il aux États ?",
      choix: ["Payer davantage de retraites", "Créer des services de santé", "Manquer de main-d'œuvre", "Construire beaucoup plus d'écoles maternelles", "Lutter contre les famines"],
      reponse: ["Payer davantage de retraites", "Créer des services de santé", "Manquer de main-d'œuvre"],
      explication: "Plus de personnes âgées, c'est plus de retraites et de soins à payer. Et moins de jeunes pour travailler.", source: P(4) },
    { id: "geographie-s03-1-q10", fiche: "geographie-s03-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Les dépenses de santé augmentent avec l'âge.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, on a plus souvent besoin de soins en vieillissant. C'est pourquoi il faut plus d'hôpitaux et de maisons de retraite.", source: P(4) },
    { id: "geographie-s03-1-q11", fiche: "geographie-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi les pays vieillissants manquent-ils de main-d'œuvre ?",
      choix: ["Parce qu'ils ont trop peu de jeunes en âge de travailler", "Parce que toutes les usines ferment", "Parce que les jeunes sont trop nombreux", "Parce que les retraités prennent tous les emplois"],
      reponse: "Parce qu'ils ont trop peu de jeunes en âge de travailler",
      explication: "Peu de naissances hier, c'est peu de travailleurs aujourd'hui. Le cours parle d'une pénurie de main-d'œuvre.", source: P(4) },
    { id: "geographie-s03-1-q12", fiche: "geographie-s03-1-f3", type: "qcm", niveau: 1,
      enonce: "D'après le cours, combien de personnes âgées vivent en maison de retraite ou en EHPAD en France ?",
      choix: ["Plus de 600 000", "Environ 600", "Environ 6 000", "Plus de 600 millions"],
      reponse: "Plus de 600 000",
      explication: "Plus de 600 000 personnes âgées vivent dans ces établissements. Cela montre l'importance des besoins.", source: P(4) },
    { id: "geographie-s03-1-q17", fiche: "geographie-s03-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque effet du vieillissement au problème qu'il pose à l'État.",
      gauche: ["Les retraités sont de plus en plus nombreux", "On a besoin de plus de soins en vieillissant", "Les jeunes sont moins nombreux"],
      droite: ["Une pénurie de main-d'œuvre", "Des retraites plus coûteuses à financer", "Des hôpitaux et des maisons de retraite à créer"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "Plus de retraités, ce sont plus de retraites à payer, et plus de soins demandent plus d'hôpitaux et de maisons de retraite. Avec moins de jeunes, il manque des travailleurs.", source: P(4) },
    // f4
    { id: "geographie-s03-1-q13", fiche: "geographie-s03-1-f4", type: "qcm", niveau: 1,
      enonce: "Quelle solution la Hongrie a-t-elle choisie face au vieillissement ?",
      choix: ["Aider les familles nombreuses pour encourager les naissances", "Faire venir beaucoup d'immigrés", "Supprimer les retraites", "Fermer ses maisons de retraite"],
      reponse: "Aider les familles nombreuses pour encourager les naissances",
      explication: "La Hongrie pousse les couples à avoir plus d'enfants. La France et l'Allemagne misent plutôt sur l'immigration.", source: P(4) },
    { id: "geographie-s03-1-q14", fiche: "geographie-s03-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Pour lutter contre le vieillissement, la France et l'Allemagne favorisent l'immigration venue des pays du Sud.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, c'est leur choix, d'après le cours. La Hongrie a choisi d'aider les familles nombreuses.", source: P(4) },
    { id: "geographie-s03-1-q15", fiche: "geographie-s03-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Comment la Hongrie aide-t-elle les familles nombreuses ?",
      choix: ["Des aides en argent", "Des places en crèche", "Des avantages sur les impôts", "Des voyages gratuits à l'étranger", "Une retraite plus tôt pour tous"],
      reponse: ["Des aides en argent", "Des places en crèche", "Des avantages sur les impôts"],
      explication: "La Hongrie donne de l'argent, des places en crèche et des avantages fiscaux aux familles nombreuses.", source: P(10) },
    { id: "geographie-s03-1-q16", fiche: "geographie-s03-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi l'Allemagne a-t-elle fait venir des immigrés ?",
      choix: ["Pour trouver de la main-d'œuvre", "Pour remplir ses maisons de retraite", "Pour faire baisser sa population", "Pour fermer ses usines"],
      reponse: "Pour trouver de la main-d'œuvre",
      explication: "Avec une population vieillissante, l'Allemagne manque de travailleurs. Les immigrés viennent combler ce manque.", source: P(10) }
  ],
  bonus: [],
  nonCouvert: [
    "Les graphiques du cours (espérance de vie des Français depuis 1960, part des personnes âgées dans plusieurs pays) : seuls leurs titres sont lisibles dans l'extraction, leurs valeurs ne sont pas reprises.",
    "Page 9 (la Chine, puissance démographique vieillissante) : exercice non repris dans ce cours.",
    "Les vidéos du cours (repère V au tableau de progression) ne sont pas déposées."
  ]
};
