// Source en clair du cours geographie-s02-2 (Thème 1, cours 1, 2e partie : II. Dans les pays du Sud).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/geographie-s02-2.js.
// Page utilisée : 3 du cours 1. Le devoir geographie-d1 couvre ce cours : aucune question ne reprend ses questions,
// ses documents, ses exemples, ses chiffres ni ses réponses attendues (le paragraphe sur les défis des pays du Sud
// n'est pas posé tel quel). Les définitions de « bidonville » et « front pionnier » viennent du cours (pages 3 et 5),
// reformulées : le cahier des charges (section 9) autorise les définitions du cours.
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 1.pdf";
const P = (page) => ({ fichier: F, page: page });

module.exports = {
  id: "geographie-s02-2",
  fiches: [
    {
      id: "geographie-s02-2-f1", notion: "Les besoins en ressources et en services",
      titre: "Des besoins toujours plus grands",
      texte: "Dans les pays du Sud, la population est jeune et grandit vite. Il faut la nourrir, la soigner, l'envoyer à l'école et lui trouver du travail. Les besoins en eau potable, en nourriture et en énergie, mais aussi en soins et en éducation, augmentent. Sans un développement économique suffisant, certains États ne peuvent pas les assurer à tous.",
      pointsCles: [
        "Eau, énergie, nourriture : une consommation qui doit doubler d'ici le milieu du siècle",
        "Quatre défis : nourrir, soigner, scolariser, faire travailler",
        "Ressources essentielles : eau potable, nourriture, énergie ; services : soins, éducation",
        "Près de 3 milliards de pauvres dans les pays du Sud, qui manquent d'eau potable et de nourriture"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ressources essentielles", def: "ce dont une population a besoin pour vivre, comme l'eau potable, la nourriture ou l'énergie" },
        { mot: "services", def: "ce qu'on apporte à la population pour l'aider, comme les soins médicaux ou l'école" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f3"], source: P(3)
    },
    {
      id: "geographie-s02-2-f2", notion: "Le besoin de terres agricoles et les fronts pionniers",
      titre: "Des forêts grignotées",
      texte: "Dans les pays pauvres, les campagnes comptent de plus en plus d'habitants, qui cherchent des terres à cultiver, de l'eau et du bois. Les forêts reculent devant les fronts pionniers : de nouveaux espaces peuplés et mis en valeur, où s'installent élevage, plantations et mines, comme en Amazonie, dans le bassin du Congo ou en Asie du Sud-Est.",
      pointsCles: [
        "Plus de ruraux, donc plus de terres à cultiver",
        "Front pionnier : de nouveaux espaces mis en valeur et peuplés, souvent en coupant la forêt",
        "Activités : élevage, plantations, mines",
        "Lieux : au bord des grandes forêts équatoriales"
      ],
      dates: [], lieux: ["Amazonie", "Bassin du Congo", "Asie du Sud-Est"], personnages: [],
      vocabulaire: [
        { mot: "front pionnier", def: "un nouvel espace que l'on peuple et que l'on met en valeur, souvent en coupant la forêt" }
      ],
      schema: null, prerequis: ["geographie-s02-2-f1"], source: P(3)
    },
    {
      id: "geographie-s02-2-f3", notion: "Une urbanisation forte et incontrôlée",
      titre: "Des villes qui débordent",
      texte: "Il faut aussi loger tout ce monde. Faute d'emplois et de ressources à la campagne, beaucoup de ruraux partent vers les villes, qui grossissent très vite. Beaucoup échouent dans des bidonvilles, des quartiers pauvres et malsains bâtis avec des matériaux récupérés. Cette urbanisation que personne ne contrôle apporte beaucoup de pollution et dégrade la vie des habitants.",
      pointsCles: [
        "Des besoins en logements qui font grandir les villes",
        "Des ruraux qui quittent la campagne, sans emploi ni ressources suffisantes",
        "Bidonvilles : des quartiers pauvres et insalubres (mauvais pour la santé), faits de matériaux récupérés",
        "Une urbanisation incontrôlée : pollution et conditions de vie dégradées"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "bidonville", def: "un quartier pauvre et malsain, aux abris bâtis avec des matériaux de récupération" }
      ],
      schema: null, prerequis: ["geographie-s02-2-f1"], source: P(3)
    },
    {
      id: "geographie-s02-2-f4", notion: "La hausse des flux migratoires",
      titre: "Partir vers le Nord",
      texte: "Certains habitants du Sud partent vers les pays du Nord en espérant une vie meilleure : les flux migratoires grossissent. Ceux qui partent sont surtout des jeunes, en majorité des hommes. Leur départ en grand nombre est une catastrophe pour l'économie de leur pays, et il crée de fortes tensions dans les pays qui les reçoivent.",
      pointsCles: [
        "But : trouver une vie meilleure dans les pays du Nord",
        "Départs surtout de jeunes, en majorité des hommes",
        "Pays de départ : une catastrophe économique ; pays d'arrivée : de graves tensions",
        "Exemple : le 17 mai 2021, plus de 8 000 migrants africains passent du Maroc à Ceuta, enclave espagnole"
      ],
      dates: [{ annee: 2021, evenement: "Plus de 8 000 migrants africains passent du Maroc à l'enclave espagnole de Ceuta" }],
      lieux: ["Maroc", "Ceuta (Espagne)"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["geographie-s02-2-f1"], source: P(3)
    }
  ],
  schemas: [],
  questions: [
    // f1
    { id: "geographie-s02-2-q1", fiche: "geographie-s02-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Parmi ces besoins, lesquels sont des services ?",
      choix: ["Les soins médicaux", "L'éducation", "L'eau potable", "La nourriture", "L'énergie"],
      reponse: ["Les soins médicaux", "L'éducation"],
      explication: "Soigner et instruire, ce sont des services. L'eau, la nourriture et l'énergie sont des ressources essentielles.", source: P(3) },
    { id: "geographie-s02-2-q2", fiche: "geographie-s02-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dans les pays du Sud, la population est surtout âgée.",
      corrections: ["Faux : elle est jeune et de plus en plus nombreuse.", "Faux : elle diminue rapidement.", "Faux : il n'y a presque pas d'enfants."],
      reponse: { vrai: false, correction: "Faux : elle est jeune et de plus en plus nombreuse." },
      explication: "Le cours parle d'une population jeune qui ne cesse de grandir. Le vieillissement concerne surtout les pays du Nord.", source: P(3) },
    { id: "geographie-s02-2-q3", fiche: "geographie-s02-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi certains États du Sud n'arrivent-ils pas à garantir à tous l'eau, la nourriture ou les soins ?",
      choix: ["Parce que leur développement économique est insuffisant", "Parce que leurs habitants n'en veulent pas", "Parce que leur population diminue", "Parce que ces ressources y sont interdites"],
      reponse: "Parce que leur développement économique est insuffisant",
      explication: "Sans assez de richesses produites, un État ne peut pas répondre à tous les besoins. Certains habitants restent alors privés de l'essentiel.", source: P(3) },
    { id: "geographie-s02-2-q4", fiche: "geographie-s02-2-f1", type: "qcm", niveau: 1,
      enonce: "D'après le cours, combien de pauvres compte-t-on à peu près dans les pays du Sud ?",
      choix: ["Près de 3 milliards", "Environ 3 millions", "Environ 300 millions", "Aucun"],
      reponse: "Près de 3 milliards",
      explication: "Les pays du Sud comptent près de 3 milliards de pauvres. Beaucoup manquent d'eau potable ou de nourriture.", source: P(3) },
    // f2
    { id: "geographie-s02-2-q5", fiche: "geographie-s02-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles activités s'installent sur les fronts pionniers ?",
      choix: ["L'élevage", "Les plantations", "Les mines", "Les stations de ski", "Les ports de pêche"],
      reponse: ["L'élevage", "Les plantations", "Les mines"],
      explication: "Sur ces nouveaux espaces gagnés sur la forêt, on élève, on plante et on creuse des mines.", source: P(3) },
    { id: "geographie-s02-2-q6", fiche: "geographie-s02-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans les pays pauvres, les populations des campagnes diminuent.",
      corrections: ["Faux : elles augmentent et cherchent toujours plus d'espace.", "Faux : les campagnes y sont vides.", "Faux : tous les habitants y vivent déjà en ville."],
      reponse: { vrai: false, correction: "Faux : elles augmentent et cherchent toujours plus d'espace." },
      explication: "Les ruraux sont de plus en plus nombreux dans les pays pauvres. Ils ont donc besoin de plus de terres.", source: P(3) },
    { id: "geographie-s02-2-q7", fiche: "geographie-s02-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi les habitants des campagnes des pays pauvres ont-ils besoin de toujours plus d'espace ?",
      choix: ["Parce qu'ils sont plus nombreux et doivent cultiver et trouver de l'eau et du bois", "Parce qu'ils construisent des stades", "Parce que leurs champs produisent trop", "Parce qu'ils partent tous à la retraite"],
      reponse: "Parce qu'ils sont plus nombreux et doivent cultiver et trouver de l'eau et du bois",
      explication: "Plus de bouches à nourrir, c'est plus de champs. Il faut aussi trouver de l'eau et du bois.", source: P(3) },
    { id: "geographie-s02-2-q8", fiche: "geographie-s02-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Les fronts pionniers font reculer les forêts équatoriales.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : pour s'installer, on coupe la forêt. Les espaces forestiers se réduisent.", source: P(3) },
    // f3
    { id: "geographie-s02-2-q9", fiche: "geographie-s02-2-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi beaucoup d'habitants des campagnes partent-ils vivre en ville ?",
      choix: ["Parce qu'à la campagne ils manquent de travail et de ressources", "Parce que les villes sont moins peuplées", "Parce que la ville est plus calme", "Parce que les campagnes sont trop riches"],
      reponse: "Parce qu'à la campagne ils manquent de travail et de ressources",
      explication: "Sans emploi ni ressources suffisantes, les ruraux tentent leur chance en ville. Beaucoup finissent dans des quartiers très pauvres.", source: P(3) },
    { id: "geographie-s02-2-q10", fiche: "geographie-s02-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Dans les pays du Sud, les villes grandissent de façon bien contrôlée.",
      corrections: ["Faux : leur croissance est souvent incontrôlée, avec des bidonvilles.", "Faux : les villes y perdent des habitants.", "Faux : il n'y a pas de villes dans les pays du Sud."],
      reponse: { vrai: false, correction: "Faux : leur croissance est souvent incontrôlée, avec des bidonvilles." },
      explication: "Les villes grossissent plus vite qu'on ne peut les organiser. Des bidonvilles se forment.", source: P(3) },
    { id: "geographie-s02-2-q11", fiche: "geographie-s02-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Qu'entraîne une urbanisation incontrôlée ?",
      choix: ["Une forte pollution", "Des conditions de vie qui se dégradent", "Des bidonvilles qui s'étendent", "Un logement neuf pour chaque famille", "La fin des embouteillages"],
      reponse: ["Une forte pollution", "Des conditions de vie qui se dégradent", "Des bidonvilles qui s'étendent"],
      explication: "Quand la ville grandit sans plan, les bidonvilles s'étendent. La pollution monte et la vie devient plus dure.", source: P(3) },
    // f4
    { id: "geographie-s02-2-q12", fiche: "geographie-s02-2-f4", type: "qcm", niveau: 1,
      enonce: "Pourquoi certains habitants des pays du Sud partent-ils vers les pays du Nord ?",
      choix: ["Pour chercher une vie meilleure", "Pour y prendre leur retraite", "Pour fuir le froid", "Pour faire du tourisme"],
      reponse: "Pour chercher une vie meilleure",
      explication: "Ils espèrent trouver dans les pays du Nord de meilleures conditions de vie.", source: P(3) },
    { id: "geographie-s02-2-q13", fiche: "geographie-s02-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Ceux qui partent vers le Nord sont surtout des personnes âgées.",
      corrections: ["Faux : ce sont surtout des jeunes, en majorité des hommes.", "Faux : ce sont surtout des enfants seuls.", "Faux : personne ne part des pays du Sud."],
      reponse: { vrai: false, correction: "Faux : ce sont surtout des jeunes, en majorité des hommes." },
      explication: "Les départs concernent surtout des jeunes hommes. C'est ce qui affaiblit les pays qu'ils quittent.", source: P(3) },
    { id: "geographie-s02-2-q14", fiche: "geographie-s02-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment le départ massif de jeunes touche-t-il leur pays d'origine ?",
      choix: ["Il le plonge dans de graves difficultés économiques", "Il l'enrichit fortement", "Il y fait disparaître la pollution", "Il n'a aucun effet"],
      reponse: "Il le plonge dans de graves difficultés économiques",
      explication: "Le pays perd une grande partie de ses jeunes travailleurs. Le cours parle d'une catastrophe économique.", source: P(3) },
    { id: "geographie-s02-2-q15", fiche: "geographie-s02-2-f4", type: "qcm", niveau: 2,
      enonce: "Quel exemple de ces migrations le cours donne-t-il ?",
      choix: ["Des migrants africains passant du Maroc à l'enclave espagnole de Ceuta", "Des retraités partant vivre au Japon", "Des Européens partant s'installer en Amazonie", "Des paysans quittant la Russie pour le Brésil"],
      reponse: "Des migrants africains passant du Maroc à l'enclave espagnole de Ceuta",
      explication: "En mai 2021, plus de 8 000 migrants africains ont franchi la frontière entre le Maroc et Ceuta. Ceuta est une enclave espagnole.", source: P(3) },
    { id: "geographie-s02-2-q16", fiche: "geographie-s02-2-f1", type: "association", niveau: 3,
      enonce: "Relie chaque besoin d'une population qui grandit à ce qu'il entraîne dans les pays du Sud.",
      gauche: ["Le besoin de nouvelles terres agricoles", "Le besoin de logements", "La recherche d'une vie meilleure"],
      droite: ["Des flux migratoires vers le Nord", "Le recul des forêts", "Une forte urbanisation"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "Plus de champs fait reculer la forêt, plus de logements fait grossir les villes. L'espoir d'une vie meilleure pousse certains à partir vers le Nord.", source: P(3) },
    { id: "geographie-s02-2-q17", fiche: "geographie-s02-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Une population jeune grandit vite dans un pays du Sud. Que faut-il lui assurer, d'après le cours ?",
      choix: ["La nourrir", "La soigner", "La scolariser", "Lui donner du travail", "Lui verser des retraites", "Construire des maisons de retraite"],
      reponse: ["La nourrir", "La soigner", "La scolariser", "Lui donner du travail"],
      explication: "Nourrir, soigner, scolariser et faire travailler une population jeune : ce sont les grands défis du Sud. Retraites et maisons de retraite sont plutôt les défis des pays du Nord, qui vieillissent.", source: P(3) },
    { id: "geographie-s02-2-q18", fiche: "geographie-s02-2-f1", type: "qcm", niveau: 1,
      enonce: "D'ici le milieu du siècle, comment les besoins en eau, en énergie et en nourriture devraient-ils évoluer ?",
      choix: ["Ils devraient doubler", "Ils devraient baisser de moitié", "Ils devraient rester les mêmes", "Ils devraient être multipliés par dix"],
      reponse: "Ils devraient doubler",
      explication: "Avec une population toujours plus nombreuse, les besoins grandissent. Le cours prévoit deux fois plus d'eau, d'énergie et de nourriture consommées.", source: P(3) },
    { id: "geographie-s02-2-q19", fiche: "geographie-s02-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "D'après le cours, qu'est-ce qui fait reculer les grandes forêts équatoriales ?",
      choix: ["Des ruraux plus nombreux qui cherchent des terres à cultiver", "La recherche de bois et d'eau", "L'installation d'élevages, de plantations et de mines", "Le vieillissement de la population", "La construction de maisons de retraite"],
      reponse: ["Des ruraux plus nombreux qui cherchent des terres à cultiver", "La recherche de bois et d'eau", "L'installation d'élevages, de plantations et de mines"],
      explication: "Plus nombreux, les ruraux ont besoin de champs, de bois et d'eau. Sur les fronts pionniers, l'élevage, les plantations et les mines grignotent aussi la forêt.", source: P(3) },
    { id: "geographie-s02-2-q20", fiche: "geographie-s02-2-f2", type: "qcm", niveau: 1,
      enonce: "Où s'ouvrent les fronts pionniers cités par le cours ?",
      choix: ["Au bord des grandes forêts équatoriales", "Au centre des grandes villes", "Dans les régions polaires", "Sur les côtes de l'Europe"],
      reponse: "Au bord des grandes forêts équatoriales",
      explication: "Le cours cite l'Amazonie, le bassin du Congo et l'Asie du Sud-Est. Ce sont de grandes forêts équatoriales.", source: P(3) },
    { id: "geographie-s02-2-q21", fiche: "geographie-s02-2-f3", type: "qcm", niveau: 1,
      enonce: "Avec quoi les abris des bidonvilles sont-ils construits ?",
      choix: ["Avec des matériaux de récupération", "Avec de la pierre de taille", "Avec du béton neuf payé par l'État", "Avec du verre et de l'acier"],
      reponse: "Avec des matériaux de récupération",
      explication: "Les habitants des bidonvilles bâtissent avec ce qu'ils trouvent. Ces quartiers sont pauvres et mauvais pour la santé.", source: P(3) },
    { id: "geographie-s02-2-q22", fiche: "geographie-s02-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Un bidonville est un nouvel espace gagné sur la forêt pour y cultiver.",
      corrections: ["Faux : c'est un quartier pauvre et malsain fait de matériaux récupérés ; l'espace gagné sur la forêt, c'est un front pionnier.", "Faux : c'est un quartier riche du centre-ville.", "Faux : c'est une grande ferme moderne."],
      reponse: { vrai: false, correction: "Faux : c'est un quartier pauvre et malsain fait de matériaux récupérés ; l'espace gagné sur la forêt, c'est un front pionnier." },
      explication: "Le bidonville est en ville, le front pionnier au bord de la forêt. Ne confonds pas ces deux mots du cours.", source: P(3) }
  ],
  bonus: [],
  nonCouvert: [
    "Le graphique du nombre d'habitants vivant dans des bidonvilles (ONU-Habitat) : seul son titre est lisible dans l'extraction, ses valeurs ne sont pas reprises.",
    "Les photos du cours (famille rurale en Afghanistan, culture sur brûlis au Congo, frontière de Ceuta) ne sont pas reproduites.",
    "Les vidéos du cours (repère V au tableau de progression) ne sont pas déposées."
  ]
};
