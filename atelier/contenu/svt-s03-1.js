// Source en clair du cours svt-s03-1 (livret 1, chapitre 2, séance 1 : distinguer météorologie et climatologie).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s03-1.js.
// Source déposée : le corrigé du livret 1 (p. 4 : les couches de l'atmosphère ; p. 5 : exemple de cartes
// mémo ; p. 6 : exemple de carte mentale sur les déplacements de l'air ; p. 7 : frise de l'histoire de la
// météorologie). Le corrigé ne définit ni la météorologie ni la climatologie : ces définitions vont dans
// nonCouvert. Les qualités de l'air notées sur les cartes mémo (chaud, froid, sec, humide…) ne sont pas
// reprises : elles sont peu lisibles sur la photo et à vérifier dans la leçon.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });

module.exports = {
  id: "svt-s03-1",
  fiches: [
    {
      id: "svt-s03-1-f1", notion: "Les couches de l'atmosphère",
      titre: "L'atmosphère en cinq couches",
      texte: "L'atmosphère est faite de couches posées les unes sur les autres. Du sol vers l'espace : la troposphère jusqu'à 12 km d'altitude, la stratosphère jusqu'à 50 km, la mésosphère jusqu'à 85 km, la thermosphère jusqu'à 500 km, puis l'exosphère. La Station spatiale internationale tourne à la limite entre thermosphère et exosphère.",
      pointsCles: [
        "Troposphère : du niveau de la mer à 12 km",
        "Stratosphère : de 12 à 50 km ; mésosphère : de 50 à 85 km",
        "Thermosphère : de 85 à 500 km ; au-dessus : l'exosphère",
        "La Station spatiale internationale : vers 500 km, entre thermosphère et exosphère"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "troposphère", def: "la couche de l'atmosphère la plus proche du sol" },
        { mot: "stratosphère", def: "la couche de l'atmosphère juste au-dessus de la troposphère, où se concentre l'ozone" },
        { mot: "mésosphère", def: "la couche de l'atmosphère entre la stratosphère et la thermosphère" },
        { mot: "exosphère", def: "la couche la plus haute de l'atmosphère, au-dessus de la thermosphère" }
      ],
      schema: "svt-s03-1-s1", prerequis: ["svt-s02-2-f1"], source: C(4)
    },
    {
      id: "svt-s03-1-f2", notion: "Lire le graphique de l'atmosphère",
      titre: "Altitude, température, ozone",
      texte: "Sur le graphique de l'atmosphère, la température change avec l'altitude : environ 0 °C vers 50 km, puis environ −90 °C vers 85 km. L'ozone se concentre dans la stratosphère. Pour trouver l'épaisseur d'une couche, on soustrait l'altitude de sa limite basse à celle de sa limite haute.",
      pointsCles: [
        "Épaisseurs : troposphère 12 km, stratosphère 38 km, mésosphère 35 km, thermosphère 415 km",
        "Exemple : mésosphère = 85 − 50 = 35 km",
        "L'épaisseur de l'exosphère ne se lit pas sur ce graphique"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "altitude", def: "la hauteur au-dessus du niveau de la mer" }
      ],
      schema: "svt-s03-1-s1", prerequis: ["svt-s03-1-f1"], source: C(4)
    },
    {
      id: "svt-s03-1-f3", notion: "Le vocabulaire du temps qu'il fait",
      titre: "Nuage, dépression, anticyclone, perturbation",
      texte: "Un nuage est un amas de fines gouttelettes d'eau liquide qui restent suspendues dans l'air. Une dépression est une zone où la pression atmosphérique est basse ; un anticyclone, une zone où elle est haute. À la limite entre une dépression et un anticyclone se forme une perturbation : une zone de vent et de précipitations.",
      pointsCles: [
        "Nuage : gouttelettes d'eau liquide en suspension",
        "Dépression : basse pression ; anticyclone : haute pression",
        "Perturbation : vents et précipitations, entre dépression et anticyclone"
      ],
      astuce: "Fabrique des cartes mémo : le mot en capitales au recto, sa définition au verso, écrits de la même couleur.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "nuage", def: "un amas de gouttelettes d'eau liquide en suspension dans l'air" },
        { mot: "dépression", def: "une zone de basse pression atmosphérique" },
        { mot: "anticyclone", def: "une zone de haute pression atmosphérique" },
        { mot: "perturbation", def: "une zone de vents et de précipitations, à la limite entre une dépression et un anticyclone" }
      ],
      schema: null, prerequis: [], source: C(5)
    },
    {
      id: "svt-s03-1-f4", notion: "Les déplacements de l'air dans l'atmosphère",
      titre: "Comment l'air se déplace",
      texte: "L'air chaud monte et l'air froid redescend : ce sont les mouvements de convection. La force de Coriolis agit sur le sens des vents. Chaque hémisphère compte trois cellules de vents contraires, liées aux anticyclones et aux dépressions. Là où anticyclones et dépressions se rencontrent naissent les perturbations, qui apportent les précipitations : pluie, neige ou grêle.",
      pointsCles: [
        "Convection : l'air chaud monte, l'air froid descend",
        "Force de Coriolis : elle intervient sur le sens des vents",
        "Trois cellules par hémisphère : cellule de Hadley, cellule de Ferrel, cellule polaire",
        "Perturbations : là où se rencontrent anticyclones et dépressions",
        "Précipitations : pluie, neige, grêle"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "convection", def: "le mouvement de l'air où l'air chaud monte et l'air froid redescend" },
        { mot: "précipitations", def: "l'eau qui tombe du ciel, sous forme de pluie, de neige ou de grêle" }
      ],
      schema: null, prerequis: ["svt-s03-1-f3"], source: C(6)
    },
    {
      id: "svt-s03-1-f5", notion: "Petite histoire de la météorologie en France",
      titre: "De l'Observatoire de Paris à Météo-France",
      texte: "En France, les relevés météorologiques commencent en 1855, à l'Observatoire de Paris. Le service change ensuite plusieurs fois de nom : Bureau central météorologique en 1878, Office national météorologique en 1920, Météorologie nationale en 1945, et enfin Météo-France à partir de 1993.",
      pointsCles: [
        "1855 : début des relevés météorologiques, à l'Observatoire de Paris",
        "1878 : Bureau central météorologique ; 1920 : Office national météorologique",
        "1945 : Météorologie nationale ; 1993 : Météo-France",
        "Pour la frise : de 1855 à 1993, une échelle de 1 cm pour 10 ans tient sur une page"
      ],
      dates: [
        { annee: 1855, evenement: "Début des relevés météorologiques en France, à l'Observatoire de Paris" },
        { annee: 1878, evenement: "Le service devient le Bureau central météorologique" },
        { annee: 1920, evenement: "Le service devient l'Office national météorologique" },
        { annee: 1945, evenement: "Le service devient la Météorologie nationale" },
        { annee: 1993, evenement: "Le service devient Météo-France" }
      ],
      lieux: ["Paris"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: [], source: C(7)
    }
  ],
  schemas: [
    {
      id: "svt-s03-1-s1", legende: "Les couches de l'atmosphère, du sol vers l'espace (épaisseurs pas à l'échelle).",
      svg: "<svg viewBox='0 0 460 320' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13'>" +
        "<rect x='40' y='20' width='260' height='50' fill='#e4e9f0'/>" +
        "<rect x='40' y='70' width='260' height='60' fill='#d3dceb'/>" +
        "<rect x='40' y='130' width='260' height='55' fill='#c3d2e6'/>" +
        "<rect x='40' y='185' width='260' height='60' fill='#b6cbe4'/>" +
        "<rect x='40' y='245' width='260' height='45' fill='#a8c3e0'/>" +
        "<rect x='40' y='290' width='260' height='12' fill='#8a7f70'/>" +
        "<g stroke='#2e2419' stroke-width='1.5'><line x1='40' y1='70' x2='300' y2='70'/><line x1='40' y1='130' x2='300' y2='130'/><line x1='40' y1='185' x2='300' y2='185'/><line x1='40' y1='245' x2='300' y2='245'/><line x1='40' y1='290' x2='300' y2='290'/></g>" +
        "<g fill='#2e2419' font-weight='bold'>" +
        "<text x='56' y='50'>exosphère</text><text x='56' y='105'>thermosphère</text><text x='56' y='162'>mésosphère</text>" +
        "<text x='56' y='220'>stratosphère</text><text x='56' y='273'>troposphère</text></g>" +
        "<g fill='#2e2419' font-size='12'>" +
        "<text x='310' y='74'>500 km</text><text x='310' y='134'>85 km</text><text x='310' y='189'>50 km</text>" +
        "<text x='310' y='249'>12 km</text><text x='310' y='294'>0 km (mer)</text></g>" +
        "<g fill='#6b2d5c' font-size='12'><text x='190' y='220'>couche d'ozone</text></g>" +
        "<rect x='238' y='62' width='26' height='12' fill='#8a7f70'/><line x1='228' y1='68' x2='274' y2='68' stroke='#8a7f70' stroke-width='3'/>" +
        "<text x='196' y='58' font-size='11' fill='#5b5044'>Station spatiale</text>" +
        "</svg>"
    }
  ],
  questions: [
    // f1 : les couches de l'atmosphère
    { id: "svt-s03-1-q1", fiche: "svt-s03-1-f1", type: "qcm", niveau: 1,
      enonce: "Quelle est la couche de l'atmosphère la plus proche du sol ?",
      choix: ["La troposphère", "La stratosphère", "La mésosphère", "L'exosphère"],
      reponse: "La troposphère",
      explication: "La troposphère part du niveau de la mer. Les autres couches sont au-dessus d'elle.", source: C(4) },
    { id: "svt-s03-1-q2", fiche: "svt-s03-1-f1", type: "ordre", niveau: 2,
      enonce: "Range les couches de l'atmosphère du sol vers l'espace.",
      elements: ["Mésosphère", "Troposphère", "Exosphère", "Stratosphère", "Thermosphère"],
      reponse: [1, 3, 0, 4, 2],
      explication: "Troposphère, stratosphère, mésosphère, thermosphère, puis exosphère. Les noms s'enchaînent du bas vers le haut.", source: C(4) },
    { id: "svt-s03-1-q3", fiche: "svt-s03-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La Station spatiale internationale tourne dans la troposphère.",
      corrections: ["Faux : elle tourne bien plus haut, à la limite entre la thermosphère et l'exosphère.", "Faux : elle reste posée au sol.", "Faux : elle tourne dans la stratosphère, au milieu de l'ozone."],
      reponse: { vrai: false, correction: "Faux : elle tourne bien plus haut, à la limite entre la thermosphère et l'exosphère." },
      explication: "La troposphère est la couche du bas. La Station spatiale tourne tout en haut de la thermosphère, au bord de l'exosphère.", source: C(4) },
    { id: "svt-s03-1-q4", fiche: "svt-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle la couche située juste au-dessus de la stratosphère ?",
      choix: ["La mésosphère", "La troposphère", "La thermosphère", "L'exosphère"],
      reponse: "La mésosphère",
      explication: "Après la stratosphère vient la mésosphère, jusqu'à 85 km. Ensuite seulement arrive la thermosphère.", source: C(4) },
    // f2 : lire le graphique de l'atmosphère
    { id: "svt-s03-1-q5", fiche: "svt-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "Dans quelle couche de l'atmosphère se concentre l'ozone ?",
      choix: ["La stratosphère", "La troposphère", "La mésosphère", "L'exosphère"],
      reponse: "La stratosphère",
      explication: "L'ozone se concentre dans la stratosphère. Elle se trouve juste au-dessus de la troposphère.", source: C(4) },
    { id: "svt-s03-1-q6", fiche: "svt-s03-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Sur le graphique, il fait de plus en plus chaud quand on monte de 50 à 85 km d'altitude.",
      corrections: ["Faux : il fait de plus en plus froid ; la température passe bien en dessous de 0 °C.", "Faux : la température reste la même à toutes les altitudes.", "Faux : au-dessus de 50 km, il n'y a plus d'atmosphère du tout."],
      reponse: { vrai: false, correction: "Faux : il fait de plus en plus froid ; la température passe bien en dessous de 0 °C." },
      explication: "Vers 50 km, il fait environ 0 °C. Plus haut, dans la mésosphère, la température chute fortement.", source: C(4) },
    { id: "svt-s03-1-q7", fiche: "svt-s03-1-f2", type: "qcm", niveau: 2,
      enonce: "La mésosphère va de 50 km à 85 km d'altitude. Quelle est son épaisseur ?",
      choix: ["35 km", "85 km", "135 km", "50 km"],
      reponse: "35 km",
      explication: "On soustrait la limite basse à la limite haute : 85 − 50 = 35. La mésosphère est épaisse de 35 km.", source: C(4) },
    { id: "svt-s03-1-q8", fiche: "svt-s03-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment trouve-t-on l'épaisseur d'une couche de l'atmosphère sur le graphique ?",
      choix: ["On soustrait l'altitude de sa limite basse à celle de sa limite haute", "On additionne les altitudes de ses deux limites", "On lit la température en son milieu", "On compte les nuages qu'elle contient"],
      reponse: "On soustrait l'altitude de sa limite basse à celle de sa limite haute",
      explication: "L'épaisseur, c'est la différence entre le haut et le bas de la couche. Par exemple, la mésosphère fait 85 − 50 = 35 km.", source: C(4) },
    // f3 : le vocabulaire du temps qu'il fait
    { id: "svt-s03-1-q9", fiche: "svt-s03-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un anticyclone ?",
      choix: ["Une zone de haute pression atmosphérique", "Une zone de basse pression atmosphérique", "Un amas de gouttelettes d'eau", "Une couche de l'atmosphère"],
      reponse: "Une zone de haute pression atmosphérique",
      explication: "Anticyclone : haute pression. Dépression : basse pression.", source: C(5) },
    { id: "svt-s03-1-q10", fiche: "svt-s03-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Un nuage est fait de gouttelettes d'eau liquide en suspension dans l'air.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Un nuage, c'est de l'eau liquide en minuscules gouttelettes. Elles restent suspendues dans l'air.", source: C(5) },
    { id: "svt-s03-1-q11", fiche: "svt-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on la zone de vents et de précipitations qui se forme entre une dépression et un anticyclone ?",
      choix: ["Une perturbation", "Un nuage", "La stratosphère", "Un équinoxe"],
      reponse: "Une perturbation",
      explication: "La perturbation naît à la limite entre une dépression et un anticyclone. Elle apporte du vent et des précipitations.", source: C(5) },
    { id: "svt-s03-1-q12", fiche: "svt-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment reconnaître une dépression ?",
      choix: ["C'est une zone où la pression atmosphérique est basse", "C'est une zone où la pression atmosphérique est haute", "C'est un amas de gouttelettes d'eau en suspension", "C'est la couche la plus haute de l'atmosphère"],
      reponse: "C'est une zone où la pression atmosphérique est basse",
      explication: "Une dépression est une zone de basse pression atmosphérique. Son contraire, l'anticyclone, est une zone de haute pression.", source: C(5) },
    // f4 : les déplacements de l'air
    { id: "svt-s03-1-q13", fiche: "svt-s03-1-f4", type: "qcm", niveau: 1,
      enonce: "Dans un mouvement de convection, que fait l'air chaud ?",
      choix: ["Il monte", "Il descend", "Il reste immobile", "Il se transforme en grêle"],
      reponse: "Il monte",
      explication: "Dans la convection, l'air chaud monte et l'air froid redescend. C'est l'un des déplacements de l'air dans l'atmosphère.", source: C(6) },
    { id: "svt-s03-1-q14", fiche: "svt-s03-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Chaque hémisphère compte trois cellules de vents contraires.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Il y en a trois par hémisphère : la cellule de Hadley, la cellule de Ferrel et la cellule polaire. Elles sont liées aux anticyclones et aux dépressions.", source: C(6) },
    { id: "svt-s03-1-q15", fiche: "svt-s03-1-f4", type: "qcm_multiple", niveau: 1,
      enonce: "Coche les formes de précipitations.",
      choix: ["La pluie", "La neige", "La grêle", "Le vent", "L'ozone"],
      reponse: ["La pluie", "La neige", "La grêle"],
      explication: "Pluie, neige et grêle sont des précipitations : de l'eau qui tombe du ciel. Le vent et l'ozone n'en sont pas.", source: C(6) },
    { id: "svt-s03-1-q16", fiche: "svt-s03-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi une perturbation peut-elle apporter de la neige ?",
      choix: ["Parce qu'elle apporte des précipitations, et la neige en est une forme", "Parce qu'elle se forme dans l'exosphère", "Parce que l'air chaud y redescend vers le sol", "Parce qu'elle arrête tous les vents"],
      reponse: "Parce qu'elle apporte des précipitations, et la neige en est une forme",
      explication: "Une perturbation est une zone de vents et de précipitations. Les précipitations tombent sous forme de pluie, de neige ou de grêle.", source: C(6) },
    { id: "svt-s03-1-q17", fiche: "svt-s03-1-f4", type: "association", niveau: 2,
      enonce: "Relie chaque notion à ce qu'elle désigne.",
      gauche: ["Convection", "Force de Coriolis", "Cellule de Hadley", "Précipitations"],
      droite: ["Pluie, neige ou grêle", "L'air chaud monte, l'air froid descend", "L'une des trois cellules de vents d'un hémisphère", "Elle agit sur le sens des vents"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "La convection fait monter l'air chaud, la force de Coriolis joue sur le sens des vents. Hadley est une des trois cellules, et les précipitations tombent du ciel.", source: C(6) },
    // f5 : histoire de la météorologie
    { id: "svt-s03-1-q18", fiche: "svt-s03-1-f5", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle aujourd'hui le service météorologique français ?",
      choix: ["Météo-France", "Le Bureau central météorologique", "L'Office national météorologique", "L'Observatoire de Paris"],
      reponse: "Météo-France",
      explication: "Depuis 1993, le service s'appelle Météo-France. Avant, il a porté plusieurs autres noms.", source: C(7) },
    { id: "svt-s03-1-q19", fiche: "svt-s03-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "En France, les relevés météorologiques ont commencé en 1855.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Les relevés commencent en 1855, à l'Observatoire de Paris. Le service prend ensuite plusieurs noms.", source: C(7) },
    { id: "svt-s03-1-q20", fiche: "svt-s03-1-f5", type: "ordre", niveau: 2,
      enonce: "Range ces noms du service météorologique français, du plus ancien au plus récent.",
      elements: ["Météorologie nationale", "Bureau central météorologique", "Météo-France", "Office national météorologique"],
      reponse: [1, 3, 0, 2],
      explication: "Bureau central en 1878, Office national en 1920, Météorologie nationale en 1945. Météo-France arrive en 1993.", source: C(7) }
  ],
  bonus: [
    {
      id: "svt-s03-1-b1",
      fiche: "svt-s03-1-f3",
      titre: "Le parrain des nuages",
      texte: "En 1802, le pharmacien britannique Luke Howard propose des noms pour classer les nuages. Il en distingue trois grandes familles : les cumulus, les stratus et les cirrus. Avant lui, Jean-Baptiste de Lamarck avait proposé des mots français, mais ce sont les noms latins de Howard qui l'ont emporté.",
      source: { titre: "Luke Howard", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Luke_Howard" }
    }
  ],
  nonCouvert: [
    "La définition de la météorologie et celle de la climatologie, et ce qui les distingue : la leçon de la séance 1 n'est pas déposée et le corrigé ne les donne pas.",
    "Les qualités de l'air (chaud ou froid, sec ou humide, léger ou lourd) dans une dépression et dans un anticyclone : écrites à la main sur les cartes mémo du corrigé (p. 5), en partie illisibles et à vérifier dans la leçon avant de les mettre dans le jeu.",
    "Le rôle précis de chaque cellule de vents (Hadley, Ferrel, polaire) et le fonctionnement de la force de Coriolis : seulement nommés sur l'exemple de carte mentale.",
    "La partie japonaise de la frise de l'histoire de la météorologie : peu lisible sur la photo du corrigé."
  ]
};
