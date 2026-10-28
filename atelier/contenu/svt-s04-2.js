// Source en clair du cours svt-s04-2 (livret 1, chapitre 2, séance 3 : climats actuels, climats du passé ;
// les grands climats aujourd'hui). Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s04-2.
// Seule source déposée : le corrigé du livret 1, p. 9 (diagramme ombrothermique d'un territoire inconnu et son
// analyse : deux saisons, climat tropical, hiver austral, hémisphère sud). La leçon sur les grands climats n'est pas
// déposée et la carte muette des climats (DEPOT/cours/svt) est vide : les grands climats vont dans nonCouvert.
// Doute signalé : le texte du corrigé donne 327 mm pour le mois le plus arrosé, mais l'axe du graphique s'arrête
// à 240 mm ; les fiches disent « plus de 200 mm ».
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
// La leçon sur les grands climats n'est pas déposée : quatre questions de thème (audit du 28/10/2026).
const T = (titre, url) => ({ theme: "Séance 3 – Climats actuels, climats du passé – Les grands climats aujourd’hui", titre, editeur: "Wikipédia", url });

module.exports = {
  id: "svt-s04-2",
  fiches: [
    {
      id: "svt-s04-2-f1", notion: "Saison sèche et saison humide",
      titre: "Deux saisons, pas quatre",
      texte: "Sur le diagramme d'un territoire inconnu, les précipitations changent énormément selon les mois : à peine 2 mm pour le mois le plus sec, plus de 200 mm pour le plus arrosé. Les pluies sont très fortes huit mois durant, d'octobre à mai, puis presque absentes de juin à septembre. Deux saisons seulement : une humide, une sèche.",
      pointsCles: [
        "Énorme écart entre le mois le plus sec (2 mm) et le plus arrosé",
        "Pluies très fortes d'octobre à mai : huit mois",
        "Presque pas de pluie de juin à septembre",
        "Deux saisons seulement : une humide, une sèche"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "saison sèche", def: "la partie de l'année où il ne pleut presque pas" },
        { mot: "saison humide", def: "la partie de l'année où les pluies sont très fortes" }
      ],
      schema: null, prerequis: ["methode-ombrothermique-f1"], source: C(9)
    },
    {
      id: "svt-s04-2-f2", notion: "Le climat tropical",
      titre: "Un climat à deux saisons",
      texte: "Un territoire qui n'a que deux saisons, une sèche et une humide, est en climat tropical. Les températures le confirment : elles restent très régulières toute l'année, entre 21,3 °C et 26,3 °C en moyenne mensuelle. Il n'y a ni hiver froid ni grand écart entre les mois, à la différence d'un climat à quatre saisons.",
      pointsCles: [
        "Climat tropical : une saison sèche et une saison humide",
        "Températures mensuelles très proches les unes des autres : entre 21,3 °C et 26,3 °C",
        "Les pluies font les saisons, pas les températures"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "climat tropical", def: "un climat chaud toute l'année, avec une saison sèche et une saison humide" }
      ],
      schema: null, prerequis: ["svt-s04-2-f1"], source: C(9)
    },
    {
      id: "svt-s04-2-f3", notion: "L'hiver austral et l'hémisphère sud",
      titre: "Repérer l'hémisphère grâce aux mois les plus frais",
      texte: "Sur ce diagramme, les températures les plus basses tombent en juin, juillet et août. C'est l'hiver austral, l'hiver de l'hémisphère sud, où les saisons sont inversées par rapport aux nôtres. Le territoire est donc en zone tropicale de l'hémisphère sud : ce pourrait être Mayotte, la Réunion ou la Polynésie française.",
      pointsCles: [
        "Mois les plus frais : juin, juillet, août",
        "Hiver austral : l'hiver de l'hémisphère sud",
        "Territoire en zone tropicale de l'hémisphère sud",
        "Candidats : Mayotte, la Réunion, la Polynésie française"
      ],
      dates: [], lieux: ["Mayotte", "La Réunion", "Polynésie française"], personnages: [],
      vocabulaire: [
        { mot: "austral", def: "qui concerne l'hémisphère sud" }
      ],
      schema: null, prerequis: ["svt-s02-1-f5", "svt-s04-2-f2"], source: C(9)
    },
    {
      id: "svt-s04-2-f4", notion: "Analyser un diagramme ombrothermique",
      titre: "La méthode en trois temps",
      texte: "Pour analyser un diagramme ombrothermique, on commence par les précipitations : écart entre le mois le plus sec et le plus arrosé, mois pluvieux, mois secs. On en déduit le nombre de saisons, donc le climat. Ensuite les températures : régulières ou contrastées, elles confirment le climat, et les mois les plus frais donnent l'hémisphère. Enfin, on propose un lieu.",
      pointsCles: [
        "D'abord les précipitations : écart, mois pluvieux, mois secs, nombre de saisons",
        "Ensuite les températures : régulières ou contrastées, mois les plus frais",
        "Enfin la conclusion : climat, hémisphère, lieu possible"
      ],
      astuce: "Pluies, puis températures, puis conclusion : P, T, C.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "contrasté", def: "avec de grandes différences, par exemple entre l'été et l'hiver" }
      ],
      schema: null, prerequis: ["svt-s04-2-f1", "svt-s04-2-f3"], source: C(9)
    }
  ],
  schemas: [],
  questions: [
    // f1 : saison sèche et saison humide
    { id: "svt-s04-2-q1", fiche: "svt-s04-2-f1", type: "qcm", niveau: 1,
      enonce: "Quel climat trouve-t-on tout près de l'équateur, avec de la chaleur et des pluies abondantes toute l'année ?",
      choix: ["Le climat équatorial", "Le climat tropical, qui a une saison sèche", "Le climat méditerranéen", "Le climat polaire"],
      reponse: "Le climat équatorial",
      explication: "Près de l'équateur, il fait chaud toute l'année et il pleut presque tous les jours : c'est le climat équatorial. Le climat tropical, un peu plus loin de l'équateur, a lui une saison sèche.",
      source: T("Climat équatorial", "https://fr.wikipedia.org/wiki/Climat_%C3%A9quatorial") },
    { id: "svt-s04-2-q2", fiche: "svt-s04-2-f1", type: "qcm", niveau: 1,
      enonce: "Quel type de climat trouve-t-on en France métropolitaine ?",
      choix: ["Des climats tempérés, comme l'océanique ou le méditerranéen", "Un climat tropical, avec une saison sèche", "Un climat équatorial, chaud et très pluvieux pendant toute l'année", "Un climat polaire, froid toute l'année"],
      reponse: "Des climats tempérés, comme l'océanique ou le méditerranéen",
      explication: "La France métropolitaine est dans la zone tempérée. Selon les régions, son climat est océanique, continental, méditerranéen ou de montagne.",
      source: T("Climat de la France", "https://fr.wikipedia.org/wiki/Climat_de_la_France") },
    { id: "svt-s04-2-q3", fiche: "svt-s04-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Les climats se répartissent en grandes zones : chaud près de l'équateur, tempéré entre les tropiques et les cercles polaires, froid vers les pôles.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Plus on s'éloigne de l'équateur, moins les rayons du Soleil chauffent, et plus le climat se refroidit. On distingue ainsi une zone chaude, deux zones tempérées et deux zones froides.",
      source: T("Zone climatique", "https://fr.wikipedia.org/wiki/Zone_climatique") },
    { id: "svt-s04-2-q4", fiche: "svt-s04-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "En climat tropical, l'année a quatre saisons bien marquées.",
      corrections: ["Faux : il n'y a que deux saisons, une sèche et une humide.", "Faux : il n'y a qu'une seule saison, pluvieuse toute l'année.", "Faux : il y a trois saisons, dont deux sèches."],
      reponse: { vrai: false, correction: "Faux : il n'y a que deux saisons, une sèche et une humide." },
      explication: "En climat tropical, ce sont les pluies qui font les saisons : une longue période humide, puis une période sèche. Cela fait deux saisons, pas quatre.", source: C(9) },
    { id: "svt-s04-2-q5", fiche: "svt-s04-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on la période de l'année où il ne pleut presque pas ?",
      choix: ["La saison sèche", "La saison humide", "L'hiver", "La saison des pluies"],
      reponse: "La saison sèche",
      explication: "C'est la saison sèche. La saison humide, elle, est la période des pluies très fortes.", source: C(9) },
    { id: "svt-s04-2-q6", fiche: "svt-s04-2-f1", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce qui permet de compter les saisons sur un diagramme ombrothermique ?",
      choix: ["La répartition des pluies au fil des mois", "La hauteur du titre", "Le nombre de barres bleues, une par mois", "La couleur de la courbe des températures"],
      reponse: "La répartition des pluies au fil des mois",
      explication: "On regarde quels mois sont pluvieux et lesquels sont secs. Une longue période de pluie puis une période sèche font deux saisons.", source: C(9) },
    { id: "svt-s04-2-q8", fiche: "svt-s04-2-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi dit-on qu'un climat tropical a deux saisons ?",
      choix: ["Parce qu'une période très pluvieuse alterne avec une période sèche", "Parce que les températures montent en été puis chutent fortement en hiver", "Parce qu'il y fait froid six mois par an", "Parce que l'année compte deux semestres"],
      reponse: "Parce qu'une période très pluvieuse alterne avec une période sèche",
      explication: "Ce sont les pluies qui font les saisons ici : plusieurs mois humides, puis des mois secs. Les températures, elles, changent peu.", source: C(9) },
    // f2 : le climat tropical
    { id: "svt-s04-2-q9", fiche: "svt-s04-2-f2", type: "qcm", niveau: 1,
      enonce: "Quel climat a un territoire chaud toute l'année, avec une saison sèche et une saison humide ?",
      choix: ["Le climat tropical", "Le climat méditerranéen", "Le climat polaire", "Le climat tempéré"],
      reponse: "Le climat tropical",
      explication: "Deux saisons, une sèche et une humide : c'est le climat tropical. Les températures y restent chaudes toute l'année.", source: C(9) },
    { id: "svt-s04-2-q10", fiche: "svt-s04-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "En climat tropical, les températures moyennes restent proches les unes des autres toute l'année.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : sur le diagramme, toutes les moyennes mensuelles tiennent entre 21,3 °C et 26,3 °C. Cette régularité confirme le climat tropical.", source: C(9) },
    { id: "svt-s04-2-q11", fiche: "svt-s04-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "En climat tropical, les températures passent sous zéro en hiver.",
      corrections: ["Faux : elles restent chaudes et proches les unes des autres toute l'année.", "Faux : elles sont toujours au-dessus de 30 °C.", "Faux : elles descendent sous zéro pendant la saison sèche seulement."],
      reponse: { vrai: false, correction: "Faux : elles restent chaudes et proches les unes des autres toute l'année." },
      explication: "En climat tropical, il fait chaud toute l'année et les moyennes mensuelles changent peu. Il n'y a jamais de gel.", source: C(9) },
    { id: "svt-s04-2-q12", fiche: "svt-s04-2-f2", type: "qcm", niveau: 2,
      enonce: "Entre quelles lignes imaginaires se trouve la zone des climats tropicaux ?",
      choix: ["Entre les deux tropiques, autour de l'équateur", "Entre un tropique et le cercle polaire du même hémisphère", "Autour des pôles, au-delà des cercles polaires", "Seulement sur la ligne de l'équateur"],
      reponse: "Entre les deux tropiques, autour de l'équateur",
      explication: "La zone tropicale s'étend du tropique du Cancer, au nord, au tropique du Capricorne, au sud. Entre les deux, le Soleil passe très haut dans le ciel et il fait chaud toute l'année.",
      source: T("Climat tropical", "https://fr.wikipedia.org/wiki/Climat_tropical") },
    { id: "svt-s04-2-q13", fiche: "svt-s04-2-f2", type: "qcm", niveau: 3,
      enonce: "Comment les températures confirment-elles un climat tropical ?",
      choix: ["Elles varient très peu d'un mois à l'autre", "Elles sont négatives en hiver", "Elles suivent exactement les pluies", "Elles changent de 30 °C entre été et hiver"],
      reponse: "Elles varient très peu d'un mois à l'autre",
      explication: "Des températures régulières toute l'année vont avec un climat tropical. Un grand écart entre les mois indiquerait un autre climat.", source: C(9) },
    { id: "svt-s04-2-q14", fiche: "svt-s04-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels indices montrent un climat tropical sur un diagramme ombrothermique ? (plusieurs réponses)",
      choix: ["Des pluies très fortes pendant une partie de l'année", "Une saison presque sans pluie", "Des températures régulières toute l'année", "De la neige en hiver", "Des températures sous zéro"],
      reponse: ["Des pluies très fortes pendant une partie de l'année", "Une saison presque sans pluie", "Des températures régulières toute l'année"],
      explication: "Saison humide, saison sèche et températures régulières : les trois indices vont ensemble. Neige et gel n'ont pas leur place ici.", source: C(9) },
    { id: "svt-s04-2-q15", fiche: "svt-s04-2-f2", type: "association", niveau: 3,
      enonce: "Relie chaque observation à ce qu'elle indique.",
      gauche: ["Huit mois très pluvieux puis quatre mois presque secs", "Températures qui varient peu dans l'année", "Mois les plus frais en juin, juillet et août", "Pluies presque nulles de juin à septembre"],
      droite: ["Hiver austral : hémisphère sud", "La saison sèche", "Deux saisons : humide puis sèche", "Confirme le climat tropical"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Les pluies donnent les saisons, les températures confirment le climat. Les mois les plus frais donnent l'hémisphère.", source: C(9) },
    // f3 : hiver austral et hémisphère sud
    { id: "svt-s04-2-q17", fiche: "svt-s04-2-f3", type: "qcm", niveau: 2,
      enonce: "Que signifie « hiver austral » ?",
      choix: ["L'hiver de l'hémisphère sud", "L'hiver de l'hémisphère nord", "Un hiver sans pluie", "L'hiver au pôle Nord"],
      reponse: "L'hiver de l'hémisphère sud",
      explication: "Austral veut dire « du sud ». L'hiver austral tombe en juin, juillet et août.", source: C(9) },
    { id: "svt-s04-2-q18", fiche: "svt-s04-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Si les mois les plus frais sont juin, juillet et août, le territoire est dans l'hémisphère sud.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : dans l'hémisphère sud, l'hiver tombe en juin, juillet et août. Les saisons y sont inversées par rapport à l'hémisphère nord.", source: C(9) },
    { id: "svt-s04-2-q19", fiche: "svt-s04-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Un lieu au climat tropical dont les mois les plus frais sont juin, juillet et août peut se trouver en Bretagne.",
      corrections: ["Faux : il est dans l'hémisphère sud, comme la Réunion ou Mayotte.", "Faux : il est tout près du pôle Sud.", "Faux : il est en zone tropicale de l'hémisphère nord."],
      reponse: { vrai: false, correction: "Faux : il est dans l'hémisphère sud, comme la Réunion ou Mayotte." },
      explication: "Des mois frais en juin, juillet et août, c'est l'hiver austral : le lieu est dans l'hémisphère sud. La Bretagne, elle, a son hiver en décembre, janvier et février.", source: C(9) },
    { id: "svt-s04-2-q20", fiche: "svt-s04-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels territoires français se trouvent en zone tropicale de l'hémisphère sud ? (plusieurs réponses)",
      choix: ["Mayotte", "La Réunion", "La Polynésie française", "La Corse", "Les Alpes"],
      reponse: ["Mayotte", "La Réunion", "La Polynésie française"],
      explication: "Mayotte, la Réunion et la Polynésie française sont en zone tropicale de l'hémisphère sud. La Corse et les Alpes sont dans l'hémisphère nord, en zone tempérée.", source: C(9) },
    { id: "svt-s04-2-q21", fiche: "svt-s04-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'hiver tombe-t-il en juin, juillet et août dans l'hémisphère sud ?",
      choix: ["Parce que les saisons y sont inversées par rapport à l'hémisphère nord", "Parce qu'il y pleut davantage à cette période de l'année", "Parce que le Soleil s'y couche plus tôt toute l'année", "Parce que l'équateur y passe"],
      reponse: "Parce que les saisons y sont inversées par rapport à l'hémisphère nord",
      explication: "Quand c'est l'été au nord, c'est l'hiver au sud, et inversement. Les mois les plus frais d'un lieu de l'hémisphère sud sont donc juin, juillet et août.", source: C(9) },
    { id: "svt-s04-2-q22", fiche: "svt-s04-2-f3", type: "qcm", niveau: 3,
      enonce: "Comment, sur un diagramme, repère-t-on qu'un lieu est dans l'hémisphère sud ?",
      choix: ["Ses mois les plus frais sont en juin, juillet et août", "Ses pluies tombent surtout en hiver", "Ses températures sont très basses", "Ses mois les plus chauds sont en juillet et en août, comme en France"],
      reponse: "Ses mois les plus frais sont en juin, juillet et août",
      explication: "On cherche les mois les plus frais sur la courbe des températures. S'ils tombent en juin, juillet et août, c'est l'hiver austral.", source: C(9) },
    // f4 : analyser un diagramme ombrothermique
    { id: "svt-s04-2-q23", fiche: "svt-s04-2-f4", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes pour analyser un diagramme ombrothermique.",
      elements: ["Regarder les températures : régulières ou contrastées, mois les plus frais", "Conclure sur le climat et proposer un lieu", "Regarder les précipitations : écart entre les mois, mois secs et mois pluvieux", "Compter les saisons d'après les pluies"],
      reponse: [2, 3, 0, 1],
      explication: "Pluies, saisons, températures, conclusion. Les pluies viennent toujours en premier.", source: C(9) },
    { id: "svt-s04-2-q24", fiche: "svt-s04-2-f4", type: "qcm", niveau: 1,
      enonce: "Par quoi commence-t-on pour analyser un diagramme ombrothermique ?",
      choix: ["Par les précipitations", "Par le titre", "Par la couleur des axes", "Par l'hémisphère"],
      reponse: "Par les précipitations",
      explication: "On commence par les précipitations : elles donnent le nombre de saisons. Les températures viennent ensuite.", source: C(9) },
    { id: "svt-s04-2-q25", fiche: "svt-s04-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Pour trouver le nombre de saisons, on regarde d'abord la courbe des températures.",
      corrections: ["Faux : ce sont les précipitations qui permettent de compter les saisons.", "Faux : on regarde d'abord le titre du diagramme.", "Faux : on compte les barres bleues."],
      reponse: { vrai: false, correction: "Faux : ce sont les précipitations qui permettent de compter les saisons." },
      explication: "Les saisons se lisent dans la répartition des pluies. Les températures servent ensuite à confirmer le climat.", source: C(9) },
    { id: "svt-s04-2-q26", fiche: "svt-s04-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Les mois les plus frais permettent de dire dans quel hémisphère se trouve le lieu.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : hiver en décembre-janvier, hémisphère nord ; hiver en juin-juillet-août, hémisphère sud. C'est la dernière étape avant la conclusion.", source: C(9) },
    { id: "svt-s04-2-q27", fiche: "svt-s04-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment vérifie-t-on, avec les températures, une idée de climat trouvée grâce aux pluies ?",
      choix: ["On regarde si elles varient peu ou beaucoup dans l'année", "On additionne toutes les températures", "On compare avec la pression atmosphérique", "On lit seulement la température du mois de janvier et celle de juillet"],
      reponse: "On regarde si elles varient peu ou beaucoup dans l'année",
      explication: "Des températures régulières confirment un climat tropical ; des températures contrastées indiquent un autre climat. On regarde toute la courbe.", source: C(9) },
    { id: "svt-s04-2-q28", fiche: "svt-s04-2-f4", type: "qcm", niveau: 3,
      enonce: "Un diagramme montre des pluies régulières toute l'année et des températures très différentes entre janvier et juillet. Que peut-on en conclure ?",
      choix: ["Ce n'est pas un climat tropical", "C'est un climat tropical", "Le lieu est forcément dans l'hémisphère sud", "Le diagramme est faux"],
      reponse: "Ce n'est pas un climat tropical",
      explication: "Pas de saison sèche ni de saison humide, et des températures contrastées : rien ne colle avec un climat tropical. Il s'agit d'un autre climat.", source: C(9) },
    { id: "svt-s04-2-q29", fiche: "svt-s04-2-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Quelles informations une bonne analyse d'un diagramme ombrothermique doit-elle donner ? (plusieurs réponses)",
      choix: ["Le nombre de saisons", "Le type de climat", "L'hémisphère du lieu", "Le nom exact de la ville", "La date de construction du diagramme"],
      reponse: ["Le nombre de saisons", "Le type de climat", "L'hémisphère du lieu"],
      explication: "Saisons, climat, hémisphère : c'est ce que le diagramme permet de trouver. Le lieu exact reste une hypothèse.", source: C(9) }
  ],
  bonus: [
    {
      id: "svt-s04-2-b1", fiche: "svt-s04-2-f2",
      titre: "Le climat tropical, vu par les climatologues",
      texte: "Pour les climatologues, un climat est tropical quand la température moyenne de chaque mois reste au-dessus de 18 °C. Ce sont donc les pluies qui font les saisons : la saison sèche tombe en général autour de l'hiver, la saison humide autour de l'été. On distingue trois variantes : le climat équatorial, près de l'équateur, le climat de mousson et le climat de savane.",
      source: { titre: "Climat tropical", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Climat_tropical" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 3 n'est pas déposée : la liste des grands climats actuels, leurs noms et leur place sur la carte ne sont pas dans le jeu ; seul le climat tropical est traité, à partir de l'exemple du corrigé.",
    "La carte muette des climats déposée (SVT- LIVRET 1- 5eme - CARTE MUETTE CLIMAT.pdf) est vide : rien à en tirer sans la leçon.",
    "Les climats du passé annoncés par le titre de la séance : rien dans le corrigé de cette séance (voir la séance 4 pour les cycles glaciaires).",
    "La valeur exacte du mois le plus arrosé du territoire inconnu : le texte du corrigé dit 327 mm, mais l'axe du graphique s'arrête à 240 mm ; les fiches disent « plus de 200 mm »."
  ]
};
