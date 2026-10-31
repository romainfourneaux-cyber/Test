// Source en clair du cours svt-s03-1 (livret 1, chapitre 2, séance 1 : distinguer météorologie et climatologie).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s03-1.js.
// Source déposée : le corrigé du livret 1 (p. 4 : les couches de l'atmosphère ; p. 5 : exemple de cartes
// mémo ; p. 6 : exemple de carte mentale sur les déplacements de l'air ; p. 7 : frise de l'histoire de la
// météorologie). Le corrigé ne définit ni la météorologie ni la climatologie : ces définitions vont dans
// nonCouvert. Les qualités de l'air notées sur les cartes mémo (chaud, froid, sec, humide…) ne sont pas
// reprises : elles sont peu lisibles sur la photo et à vérifier dans la leçon.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Séance 1 – Distinguer météorologie et climatologie", titre, editeur: "Wikipédia", url });

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
    { id: "svt-s03-1-q3", fiche: "svt-s03-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La Station spatiale internationale tourne dans la troposphère.",
      corrections: ["Faux : elle tourne bien plus haut, à la limite entre la thermosphère et l'exosphère.", "Faux : elle tourne dans la mésosphère, vers 85 km d'altitude.", "Faux : elle tourne dans la stratosphère, au milieu de l'ozone."],
      reponse: { vrai: false, correction: "Faux : elle tourne bien plus haut, à la limite entre la thermosphère et l'exosphère." },
      explication: "La troposphère est la couche du bas. La Station spatiale tourne tout en haut de la thermosphère, au bord de l'exosphère.", source: C(4) },
    { id: "svt-s03-1-q4", fiche: "svt-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle la couche située juste au-dessus de la stratosphère ?",
      choix: ["La mésosphère", "La troposphère", "La thermosphère", "L'exosphère"],
      reponse: "La mésosphère",
      explication: "Après la stratosphère vient la mésosphère, jusqu'à 85 km. Ensuite seulement arrive la thermosphère.", source: C(4) },
    { id: "svt-s03-1-q21", fiche: "svt-s03-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La thermosphère est la couche la plus haute de l'atmosphère.",
      corrections: ["Faux : au-dessus d'elle se trouve encore l'exosphère.", "Faux : la couche la plus haute est la mésosphère.", "Faux : la couche la plus haute est la stratosphère."],
      reponse: { vrai: false, correction: "Faux : au-dessus d'elle se trouve encore l'exosphère." },
      explication: "Au-dessus de la thermosphère vient l'exosphère, la dernière couche. La Station spatiale tourne à la limite entre les deux.", source: C(4) },
    { id: "svt-s03-1-q22", fiche: "svt-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Un avion vole à 8 km d'altitude. Dans quelle couche de l'atmosphère se trouve-t-il ?",
      choix: ["La troposphère", "La stratosphère", "La mésosphère", "La thermosphère"],
      reponse: "La troposphère",
      explication: "La troposphère part du niveau de la mer et monte plus haut que 8 km. L'avion vole donc dans cette première couche.", source: C(4) },
    { id: "svt-s03-1-q23", fiche: "svt-s03-1-f1", type: "qcm", niveau: 3,
      enonce: "Une fusée atteint 100 km d'altitude. Dans quelle couche de l'atmosphère se trouve-t-elle ?",
      choix: ["La thermosphère", "La mésosphère", "L'exosphère", "La stratosphère"],
      reponse: "La thermosphère",
      explication: "La mésosphère s'arrête à 85 km ; au-dessus commence la thermosphère, qui monte bien plus haut que 100 km. La fusée est donc dans la thermosphère.", source: C(4) },
    { id: "svt-s03-1-q24", fiche: "svt-s03-1-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les couches de l'atmosphère situées au-dessus de 50 km d'altitude.",
      choix: ["La mésosphère", "La thermosphère", "L'exosphère", "La stratosphère", "La troposphère"],
      reponse: ["La mésosphère", "La thermosphère", "L'exosphère"],
      explication: "La stratosphère s'arrête à 50 km. Au-dessus viennent la mésosphère, la thermosphère et l'exosphère.", source: C(4) },
    // f2 : lire le graphique de l'atmosphère (les calculs d'épaisseur sont remplacés par des questions de thème, audit du 28/10/2026)
    { id: "svt-s03-1-q5", fiche: "svt-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "Dans quelle couche de l'atmosphère se concentre l'ozone ?",
      choix: ["La stratosphère", "La troposphère", "La mésosphère", "La thermosphère"],
      reponse: "La stratosphère",
      explication: "L'ozone se concentre dans la stratosphère. Elle se trouve juste au-dessus de la troposphère.", source: C(4) },
    { id: "svt-s03-1-q6", fiche: "svt-s03-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Quand on monte de 50 à 85 km d'altitude, il fait de plus en plus chaud.",
      corrections: ["Faux : il fait de plus en plus froid ; la température passe bien en dessous de 0 °C.", "Faux : la température reste à 0 °C sur toute cette hauteur.", "Faux : à cette altitude, il n'y a plus d'atmosphère du tout."],
      reponse: { vrai: false, correction: "Faux : il fait de plus en plus froid ; la température passe bien en dessous de 0 °C." },
      explication: "Vers 50 km, il fait environ 0 °C. Plus haut, dans la mésosphère, la température chute fortement.", source: C(4) },
    { id: "svt-s03-1-q7", fiche: "svt-s03-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi la couche d'ozone de la stratosphère est-elle utile aux êtres vivants ?",
      choix: ["Elle arrête une grande partie des rayons ultraviolets du Soleil", "Elle fabrique le dioxygène que nous respirons à partir de l'eau de mer", "Elle empêche la pluie de tomber trop fort", "Elle réchauffe le sol pendant la nuit"],
      reponse: "Elle arrête une grande partie des rayons ultraviolets du Soleil",
      explication: "L'ozone de la stratosphère absorbe la plus grande partie des ultraviolets, qui abîment la peau et les yeux. Sans cette couche, la vie à la surface serait bien plus difficile.",
      indice: "Pense aux coups de soleil.",
      source: T("Couche d'ozone", "https://fr.wikipedia.org/wiki/Couche_d%27ozone") },
    { id: "svt-s03-1-q8", fiche: "svt-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "Dans quelle couche de l'atmosphère se forment les nuages, la pluie et le vent ?",
      choix: ["La troposphère", "La stratosphère", "La mésosphère", "L'exosphère"],
      reponse: "La troposphère",
      explication: "La troposphère est la couche la plus basse, celle où nous vivons. Presque toute la vapeur d'eau s'y trouve, donc presque tous les nuages et la pluie.",
      source: T("Atmosphère terrestre", "https://fr.wikipedia.org/wiki/Atmosph%C3%A8re_terrestre") },
    { id: "svt-s03-1-q26", fiche: "svt-s03-1-f2", type: "qcm", niveau: 3,
      enonce: "Laquelle de ces couches de l'atmosphère est la plus épaisse ?",
      choix: ["La thermosphère", "La stratosphère", "La mésosphère", "La troposphère"],
      reponse: "La thermosphère",
      explication: "La thermosphère est épaisse de 415 km. Les trois couches du dessous font chacune moins de 40 km.", source: C(4) },
    { id: "svt-s03-1-q27", fiche: "svt-s03-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Dans la troposphère, plus on monte, plus il fait froid : environ six degrés de moins tous les mille mètres.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Plus on monte dans la troposphère, plus l'air se refroidit : au sommet des hautes montagnes, il fait bien plus froid qu'en plaine. C'est pour cela que la neige y reste longtemps.",
      source: T("Troposphère", "https://fr.wikipedia.org/wiki/Troposph%C3%A8re") },
    // f3 : le vocabulaire du temps qu'il fait
    { id: "svt-s03-1-q9", fiche: "svt-s03-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un anticyclone ?",
      choix: ["Une zone de haute pression atmosphérique", "Une zone de basse pression atmosphérique", "Un amas de gouttelettes d'eau", "Une zone de vents et de précipitations"],
      reponse: "Une zone de haute pression atmosphérique",
      explication: "Anticyclone : haute pression. Dépression : basse pression.", source: C(5) },
    { id: "svt-s03-1-q10", fiche: "svt-s03-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Un nuage est fait de gouttelettes d'eau liquide en suspension dans l'air.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Un nuage, c'est de l'eau liquide en minuscules gouttelettes. Elles restent suspendues dans l'air.", source: C(5) },
    { id: "svt-s03-1-q11", fiche: "svt-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on la zone de vents et de précipitations qui se forme entre une dépression et un anticyclone ?",
      choix: ["Une perturbation", "Une dépression", "Un anticyclone", "Une précipitation"],
      reponse: "Une perturbation",
      explication: "La perturbation naît à la limite entre une dépression et un anticyclone. Elle apporte du vent et des précipitations.", source: C(5) },
    { id: "svt-s03-1-q12", fiche: "svt-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Quelle est la différence entre une dépression et un anticyclone ?",
      choix: ["La pression est basse dans l'une, haute dans l'autre", "L'une est faite de gouttelettes, l'autre de grêle", "L'une est dans la troposphère, l'autre dans l'exosphère", "L'une est un nuage, l'autre une perturbation"],
      reponse: "La pression est basse dans l'une, haute dans l'autre",
      explication: "Une dépression est une zone de basse pression atmosphérique. Son contraire, l'anticyclone, est une zone de haute pression.", source: C(5) },
    { id: "svt-s03-1-q29", fiche: "svt-s03-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Une perturbation se forme au centre d'un anticyclone.",
      corrections: ["Faux : elle se forme à la limite entre une dépression et un anticyclone.", "Faux : elle se forme au centre d'une dépression.", "Faux : elle se forme tout en haut, dans l'exosphère."],
      reponse: { vrai: false, correction: "Faux : elle se forme à la limite entre une dépression et un anticyclone." },
      explication: "Une perturbation naît là où une dépression et un anticyclone se rencontrent. Elle apporte du vent et des précipitations.", source: C(5) },
    { id: "svt-s03-1-q30", fiche: "svt-s03-1-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les zones qu'on définit par leur pression atmosphérique.",
      choix: ["Une dépression", "Un anticyclone", "Une perturbation", "Un nuage", "La stratosphère"],
      reponse: ["Une dépression", "Un anticyclone"],
      explication: "Dépression et anticyclone se distinguent par leur pression, basse ou haute. Une perturbation se définit par ses vents et ses précipitations, un nuage par ses gouttelettes.", source: C(5) },
    { id: "svt-s03-1-q31", fiche: "svt-s03-1-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Une dépression est une zone de ___ pression ; un anticyclone, une zone de ___ pression.",
      banque: ["basse", "haute", "moyenne", "nulle"],
      reponse: [["basse", "faible"], ["haute", "forte"]],
      explication: "Une dépression est une zone de basse pression, un anticyclone une zone de haute pression. À leur limite se forment les perturbations.", source: C(5) },
    // f4 : les déplacements de l'air
    { id: "svt-s03-1-q13", fiche: "svt-s03-1-f4", type: "qcm", niveau: 1,
      enonce: "Dans un mouvement de convection, que fait l'air chaud ?",
      choix: ["Il monte", "Il redescend", "Il reste immobile", "Il reste au ras du sol"],
      reponse: "Il monte",
      explication: "Dans la convection, l'air chaud monte et l'air froid redescend. C'est l'un des déplacements de l'air dans l'atmosphère.", source: C(6) },
    { id: "svt-s03-1-q15", fiche: "svt-s03-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les formes de précipitations.",
      choix: ["La pluie", "La neige", "La grêle", "Le vent", "Le nuage"],
      reponse: ["La pluie", "La neige", "La grêle"],
      explication: "Pluie, neige et grêle sont des précipitations : de l'eau qui tombe du ciel. Le vent n'en est pas une, et un nuage reste en suspension dans l'air.", source: C(6) },
    { id: "svt-s03-1-q16", fiche: "svt-s03-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire qu'une perturbation peut apporter de la neige ?",
      choix: ["Elle apporte des précipitations, et la neige en est une", "Elle apporte du vent, et la neige est une sorte de vent", "Elle naît au cœur d'un anticyclone, où l'air est froid", "Elle fait redescendre l'air chaud, qui se change en neige"],
      reponse: "Elle apporte des précipitations, et la neige en est une",
      explication: "Une perturbation est une zone de vents et de précipitations. Les précipitations tombent sous forme de pluie, de neige ou de grêle.", source: C(6) },
    { id: "svt-s03-1-q17", fiche: "svt-s03-1-f4", type: "association", niveau: 3,
      enonce: "Relie chaque notion à ce qu'elle désigne.",
      gauche: ["Convection", "Force de Coriolis", "Cellule de Hadley", "Précipitations"],
      droite: ["Pluie, neige ou grêle", "L'air chaud monte, l'air froid descend", "L'une des trois cellules de vents d'un hémisphère", "Elle agit sur le sens des vents"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "La convection fait monter l'air chaud, la force de Coriolis joue sur le sens des vents. Hadley est une des trois cellules, et les précipitations tombent du ciel.", source: C(6) },
    { id: "svt-s03-1-q32", fiche: "svt-s03-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "La force de Coriolis agit sur le sens des vents.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "La force de Coriolis intervient dans le sens que prennent les vents. Avec la convection et les trois cellules de vents, elle fait partie des déplacements de l'air.", source: C(6) },
    { id: "svt-s03-1-q33", fiche: "svt-s03-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Chaque hémisphère compte trois cellules de vents : la cellule de Hadley, la cellule de Ferrel et la cellule de Coriolis.",
      corrections: ["Faux : la troisième est la cellule polaire ; Coriolis est le nom d'une force qui agit sur le sens des vents.", "Faux : il n'y a que deux cellules, celles de Hadley et de Ferrel.", "Faux : ces trois cellules existent pour toute la Terre, pas dans chaque hémisphère."],
      reponse: { vrai: false, correction: "Faux : la troisième est la cellule polaire ; Coriolis est le nom d'une force qui agit sur le sens des vents." },
      explication: "Les trois cellules de chaque hémisphère sont celles de Hadley, de Ferrel et la cellule polaire. Coriolis, c'est une force, pas une cellule.", source: C(6) },
    { id: "svt-s03-1-q34", fiche: "svt-s03-1-f4", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre ce qui mène aux précipitations.",
      elements: ["La pluie, la neige ou la grêle tombent", "Un anticyclone rencontre une dépression", "Une perturbation se forme"],
      reponse: [1, 2, 0],
      explication: "Là où un anticyclone et une dépression se rencontrent naît une perturbation. C'est elle qui apporte les précipitations.", source: C(6) },
    // f5 : histoire de la météorologie (les calculs de frise sont remplacés par des questions de thème sur la météo d'aujourd'hui, audit du 28/10/2026)
    { id: "svt-s03-1-q18", fiche: "svt-s03-1-f5", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle aujourd'hui le service météorologique français ?",
      choix: ["Météo-France", "Le Bureau central météorologique", "L'Office national météorologique", "La Météorologie nationale"],
      reponse: "Météo-France",
      explication: "Depuis 1993, le service s'appelle Météo-France. Avant, il a porté plusieurs autres noms.", source: C(7) },
    { id: "svt-s03-1-q19", fiche: "svt-s03-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "En France, les relevés météorologiques ont commencé en 1855.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Les relevés commencent en 1855, à l'Observatoire de Paris. Le service prend ensuite plusieurs noms.", source: C(7) },
    { id: "svt-s03-1-q35", fiche: "svt-s03-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le service météorologique français s'appelle Météo-France depuis 1945.",
      corrections: ["Faux : en 1945, il devient la Météorologie nationale ; il ne s'appelle Météo-France qu'en 1993.", "Faux : il s'appelle Météo-France depuis 1855.", "Faux : il s'appelle Météo-France depuis 1920."],
      reponse: { vrai: false, correction: "Faux : en 1945, il devient la Météorologie nationale ; il ne s'appelle Météo-France qu'en 1993." },
      explication: "En 1945, le service prend le nom de Météorologie nationale. Le nom de Météo-France n'arrive qu'en 1993.", source: C(7) },
    { id: "svt-s03-1-q36", fiche: "svt-s03-1-f5", type: "qcm", niveau: 1,
      enonce: "Où commencent les relevés météorologiques en France, en 1855 ?",
      choix: ["À l'Observatoire de Paris", "Au Bureau central météorologique", "À l'Office national météorologique", "À la Météorologie nationale"],
      reponse: "À l'Observatoire de Paris",
      explication: "Les premiers relevés sont faits à l'Observatoire de Paris, en 1855. Le Bureau central météorologique n'arrive qu'en 1878.", source: C(7) },
    { id: "svt-s03-1-q37", fiche: "svt-s03-1-f5", type: "association", niveau: 2,
      enonce: "Relie chaque outil de la météo d'aujourd'hui à son rôle.",
      gauche: ["Le satellite", "Le radar", "L'ordinateur", "La station au sol"],
      droite: ["Calculer les prévisions", "Mesurer le temps sur place", "Voir les nuages depuis l'espace", "Repérer la pluie en direct"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Satellites et radars observent les nuages et les pluies, les stations mesurent sur place. Des ordinateurs réunissent toutes ces mesures pour calculer le temps des jours suivants.",
      source: T("Météorologie", "https://fr.wikipedia.org/wiki/M%C3%A9t%C3%A9orologie") },
    { id: "svt-s03-1-q38", fiche: "svt-s03-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment les météorologues préparent-ils les prévisions aujourd'hui ?",
      choix: ["Des ordinateurs calculent la suite à partir de milliers de mesures", "Ils reprennent le temps qu'il a fait le même jour l'année précédente", "Ils observent le ciel depuis Paris et devinent la suite", "Ils mesurent la température de la mer une fois par mois"],
      reponse: "Des ordinateurs calculent la suite à partir de milliers de mesures",
      explication: "Les mesures des stations, des ballons et des satellites sont envoyées à de puissants ordinateurs. Ceux-ci calculent comment l'atmosphère va évoluer dans les heures et les jours qui viennent.",
      source: T("Prévision numérique du temps", "https://fr.wikipedia.org/wiki/Pr%C3%A9vision_num%C3%A9rique_du_temps") },
    { id: "svt-s03-1-q39", fiche: "svt-s03-1-f5", type: "qcm", niveau: 3,
      enonce: "Pour décrire le climat d'un lieu, sur combien d'années calcule-t-on en général les moyennes de température et de pluie ?",
      choix: ["Environ trente ans", "Une seule année, la plus récente", "Une semaine", "Mille ans"],
      reponse: "Environ trente ans",
      explication: "Le climat d'un lieu se décrit par des moyennes sur une longue durée, pas par le temps d'un jour. Les services météo les calculent sur une trentaine d'années.",
      source: T("Normale climatique", "https://fr.wikipedia.org/wiki/Normale_climatique") }
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
