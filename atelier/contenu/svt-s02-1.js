// Source en clair du cours svt-s02-1 (livret 1, chapitre 1, séance 3 : les lignes imaginaires).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/svt-s02-1.js.
// Sources déposées : les ressources complémentaires (p. 2 : durée du jour et de la nuit selon le lieu,
// crépuscule ; p. 3 : durées de rotation des planètes) et le corrigé du livret 1 (p. 3 : TP 3 du globe
// éclairé, saisons et hémisphères). Le livret lui-même n'est pas déposé.
// Deux passages des sources ne sont pas repris parce qu'ils semblent inexacts (à faire vérifier par Romain) : Sydney donnée
// en exemple de la zone entre l'équateur et les tropiques, et la Guyane placée entre l'équateur et le tropique
// du Capricorne.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
const R = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Ressources complementaires.pdf", page: page });

module.exports = {
  id: "svt-s02-1",
  fiches: [
    {
      id: "svt-s02-1-f1", notion: "Les lignes imaginaires du globe",
      titre: "Des lignes pour découper le globe",
      texte: "Des lignes imaginaires découpent le globe. L'équateur partage la Terre en deux moitiés : l'hémisphère nord et l'hémisphère sud. En s'éloignant de l'équateur, on rencontre les tropiques, puis les cercles polaires. Tout au bout se trouvent les deux pôles, le pôle Nord et le pôle Sud, par où passe l'axe de rotation.",
      pointsCles: [
        "Équateur : la ligne qui sépare l'hémisphère nord de l'hémisphère sud",
        "De l'équateur vers un pôle : équateur, tropique, cercle polaire, pôle",
        "L'axe de rotation de la Terre passe par le pôle Nord et le pôle Sud"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "équateur", def: "la ligne imaginaire qui partage le globe en deux hémisphères, nord et sud" },
        { mot: "hémisphère", def: "une moitié du globe, au nord ou au sud de l'équateur" },
        { mot: "cercle polaire", def: "la ligne imaginaire située entre un tropique et un pôle" }
      ],
      schema: "svt-s02-1-s1", prerequis: ["svt-s01-2-f2"], source: R(2)
    },
    {
      id: "svt-s02-1-f2", notion: "La durée du jour selon le lieu",
      titre: "Des jours longs, des jours courts",
      texte: "À l'équateur, le jour et la nuit durent 12 heures toute l'année. Entre l'équateur et les tropiques, la durée du jour change peu. Entre un tropique et le cercle polaire, l'écart grandit. Près du cercle polaire, le jour est très court en hiver et très long en été. Aux pôles, il dure six mois, la nuit aussi.",
      pointsCles: [
        "Bourges (France) : environ 8 h 15 de jour au solstice d'hiver, 16 h 15 au solstice d'été",
        "Yellowknife (Canada), près du cercle polaire : 5 h 15 de jour en hiver, 21 heures en été",
        "Aux pôles : le Soleil se lève à l'équinoxe de printemps et se couche à l'équinoxe d'automne",
        "Entre cercle polaire et pôle, la durée du jour change très vite avec la latitude"
      ],
      dates: [], lieux: ["Bourges", "Yellowknife"], personnages: [],
      vocabulaire: [],
      schema: "svt-s02-1-s1", prerequis: ["svt-s02-1-f1"], source: R(2)
    },
    {
      id: "svt-s02-1-f3", notion: "Le crépuscule",
      titre: "Le crépuscule",
      texte: "Le crépuscule est le moment où les rayons du Soleil arrivent rasants et où sa lumière rougeoie : à l'aube et au coucher du Soleil. Près de l'équateur, il est très court. Plus on s'approche du cercle polaire, plus il s'allonge : il peut durer de nombreuses heures.",
      pointsCles: [
        "Crépuscule : rayons rasants, lumière rougeoyante, à l'aube et au coucher",
        "Court près de l'équateur, long près du cercle polaire"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "crépuscule", def: "le moment, à l'aube ou au coucher, où les rayons du Soleil sont rasants et sa lumière rougeoie" }
      ],
      schema: null, prerequis: ["svt-s02-1-f2"], source: R(2)
    },
    {
      id: "svt-s02-1-f4", notion: "Le TP du globe éclairé",
      titre: "Un même faisceau, des taches différentes",
      texte: "Dans le TP, on éclaire un globe avec une lampe et on compare trois endroits : l'équateur, le milieu de l'hémisphère nord et le pôle Nord. À l'équateur, un rayon parallèle à l'équateur dessine une petite tache ronde. Au milieu de l'hémisphère nord, la même tache s'allonge en ovale.",
      pointsCles: [
        "Trait noir : là où arrive un rayon parallèle à l'équateur",
        "Trait jaune : la zone éclairée par la lampe, qui joue le Soleil",
        "Équateur : tache ronde ; milieu de l'hémisphère : tache allongée"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["svt-s02-1-f1"], source: C(3)
    },
    {
      id: "svt-s02-1-f5", notion: "Les saisons dans les deux hémisphères",
      titre: "Quand c'est l'hiver au nord…",
      texte: "Les saisons sont inversées entre les deux hémisphères : le 15 janvier, c'est l'hiver au nord et l'été au sud. Dans l'hémisphère sud, le solstice d'été a donc lieu en décembre et l'équinoxe de printemps en septembre. En zone climatique équatoriale, il n'y a pas de saison astronomique.",
      pointsCles: [
        "Hémisphère nord (New York, Tokyo) : hiver en janvier",
        "Hémisphère sud (São Paulo, Sydney) : été en janvier",
        "Guyane française (zone équatoriale) : une saison des pluies de décembre à juillet, une saison sèche de juillet à décembre",
        "Terre Adélie (Antarctique) : à la mi-novembre, il fait encore jour à 23 heures"
      ],
      dates: [], lieux: ["New York", "Tokyo", "São Paulo", "Sydney", "Guyane française", "Terre Adélie"], personnages: [],
      vocabulaire: [
        { mot: "saison météorologique", def: "une saison qu'on distingue par le temps qu'il fait, par exemple par la quantité de pluie" },
        { mot: "pluviosité", def: "la quantité de pluie qui tombe sur un lieu" }
      ],
      schema: null, prerequis: ["svt-s02-1-f1", "svt-s01-2-f4"], source: C(3)
    },
    {
      id: "svt-s02-1-f6", notion: "Chaque planète tourne à son rythme",
      titre: "Des rotations toutes différentes",
      texte: "Toutes les planètes tournent sur elles-mêmes, mais pas au même rythme. La Terre fait un tour en 23 h 56 min, Mars en 24 h 36 min. Vénus est la plus lente : 243 jours ! Jupiter, la plus rapide, met moins de 10 heures. La Lune met plus de 27 jours. Aucune ne ressemble vraiment à la Terre.",
      pointsCles: [
        "Mercure : 58 j 16 h ; Vénus : 243 j 26 min",
        "Terre : 23 h 56 min ; Mars : 24 h 36 min",
        "Jupiter : 9 h 55 min ; Saturne : 10 h 33 min ; Uranus : 17 h 14 min ; Neptune : 16 heures",
        "Lune : 27 jours et 8 heures"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["svt-s01-2-f1"], source: R(3)
    }
  ],
  schemas: [
    {
      id: "svt-s02-1-s1", legende: "Les lignes imaginaires du globe et les zones où la durée du jour varie peu, plus, ou beaucoup.",
      svg: "<svg viewBox='0 0 580 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='12'>" +
        "<g transform='translate(70,0)'>" +
        "<circle cx='190' cy='150' r='120' fill='#cfe0ea' stroke='#2e2419' stroke-width='2'/>" +
        "<line x1='190' y1='16' x2='190' y2='284' stroke='#2e2419' stroke-width='2'/>" +
        "<line x1='70' y1='150' x2='310' y2='150' stroke='#a3412b' stroke-width='2.5'/>" +
        "<g stroke='#b08d3a' stroke-width='2'><line x1='80' y1='103' x2='300' y2='103'/><line x1='80' y1='197' x2='300' y2='197'/></g>" +
        "<g stroke='#4a78a8' stroke-width='2'><line x1='125' y1='50' x2='255' y2='50'/><line x1='125' y1='250' x2='255' y2='250'/></g>" +
        "<g fill='#2e2419'>" +
        "<text x='200' y='14'>pôle Nord</text><text x='200' y='297'>pôle Sud</text>" +
        "<text x='318' y='154' fill='#a3412b'>équateur</text>" +
        "<text x='308' y='107' fill='#8a6a22'>tropique</text><text x='308' y='201' fill='#8a6a22'>tropique</text>" +
        "<text x='263' y='54' fill='#4a78a8'>cercle polaire</text><text x='263' y='254' fill='#4a78a8'>cercle polaire</text>" +
        "<text x='396' y='132' font-size='11'>hémisphère nord</text><text x='396' y='178' font-size='11'>hémisphère sud</text></g></g>" +
        "<g font-size='11' fill='#5b5044'><text x='20' y='131'>le jour</text><text x='20' y='144'>varie peu</text>" +
        "<text x='20' y='75'>il varie</text><text x='20' y='88'>de plus en plus</text>" +
        "<text x='20' y='18'>aux pôles : six mois</text><text x='20' y='31'>de jour, six de nuit</text></g>" +
        "</svg>"
    }
  ],
  questions: [
    // f1 : les lignes imaginaires
    { id: "svt-s02-1-q1", fiche: "svt-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Quelle ligne imaginaire partage la Terre en deux hémisphères ?",
      choix: ["L'équateur", "Le cercle polaire", "Le tropique", "L'axe de rotation"],
      reponse: "L'équateur",
      explication: "L'équateur coupe le globe en deux moitiés. Au-dessus, l'hémisphère nord ; en dessous, l'hémisphère sud.", source: R(2) },
    { id: "svt-s02-1-q2", fiche: "svt-s02-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les cercles polaires sont plus proches de l'équateur que les tropiques.",
      corrections: ["Faux : en partant de l'équateur, on rencontre d'abord les tropiques, puis les cercles polaires.", "Faux : les cercles polaires sont exactement sur l'équateur.", "Faux : il n'existe qu'un seul cercle polaire, au milieu du globe."],
      reponse: { vrai: false, correction: "Faux : en partant de l'équateur, on rencontre d'abord les tropiques, puis les cercles polaires." },
      explication: "Depuis l'équateur, on passe un tropique, puis un cercle polaire, avant d'arriver au pôle. Les cercles polaires sont donc plus loin.", source: R(2) },
    { id: "svt-s02-1-q3", fiche: "svt-s02-1-f1", type: "ordre", niveau: 2,
      enonce: "Range ces repères en allant de l'équateur jusqu'au pôle Nord.",
      elements: ["Cercle polaire", "Équateur", "Pôle Nord", "Tropique"],
      reponse: [1, 3, 0, 2],
      explication: "Équateur, tropique, cercle polaire, pôle. Chaque ligne est plus loin de l'équateur que la précédente.", source: R(2) },
    { id: "svt-s02-1-q4", fiche: "svt-s02-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on chacune des deux moitiés du globe séparées par l'équateur ?",
      choix: ["Un hémisphère", "Un tropique", "Un pôle", "Un crépuscule"],
      reponse: "Un hémisphère",
      explication: "Chaque moitié du globe est un hémisphère. Il y a l'hémisphère nord et l'hémisphère sud.", source: R(2) },
    // f2 : la durée du jour selon le lieu
    { id: "svt-s02-1-q5", fiche: "svt-s02-1-f2", type: "qcm", niveau: 1,
      enonce: "Où le jour et la nuit ont-ils la même durée toute l'année ?",
      choix: ["Sur l'équateur", "Au pôle Nord", "Sur le cercle polaire", "À Bourges"],
      reponse: "Sur l'équateur",
      explication: "Seul l'équateur a toute l'année autant de jour que de nuit. Ailleurs, cela n'arrive qu'aux équinoxes.", source: R(2) },
    { id: "svt-s02-1-q6", fiche: "svt-s02-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Aux pôles, le jour peut durer six mois.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Au pôle, le Soleil se lève à l'équinoxe de printemps et ne se couche qu'à l'équinoxe d'automne. Viennent ensuite six mois de nuit.", source: R(2) },
    { id: "svt-s02-1-q7", fiche: "svt-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi la durée du jour change-t-elle autant d'un endroit à l'autre du globe ?",
      choix: ["Parce que l'axe de rotation de la Terre est incliné", "Parce que la Terre s'arrête de tourner en été", "Parce que le Soleil est plus gros au-dessus des pôles", "Parce que la Lune éclaire certains pays la nuit"],
      reponse: "Parce que l'axe de rotation de la Terre est incliné",
      explication: "L'axe penché de la Terre fait varier la durée du jour selon le lieu. Près du cercle polaire, l'écart entre hiver et été devient énorme.", source: R(2) },
    { id: "svt-s02-1-q8", fiche: "svt-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Dans quelle zone la durée du jour varie-t-elle le moins au cours de l'année ?",
      choix: ["Entre l'équateur et les tropiques", "Entre un tropique et le cercle polaire", "Près du cercle polaire", "Entre le cercle polaire et le pôle"],
      reponse: "Entre l'équateur et les tropiques",
      explication: "Entre l'équateur et les tropiques, le jour garde presque la même durée. Plus on va vers les pôles, plus l'écart grandit.", source: R(2) },
    { id: "svt-s02-1-q9", fiche: "svt-s02-1-f2", type: "ordre", niveau: 3,
      enonce: "Range ces lieux selon l'écart entre leur jour d'été et leur jour d'hiver, du plus petit au plus grand.",
      elements: ["Bourges, en France", "Un lieu sur l'équateur", "Yellowknife, au Canada, près du cercle polaire", "Le pôle Nord"],
      reponse: [1, 0, 2, 3],
      explication: "L'écart est nul sur l'équateur et grandit en allant vers le nord. Au pôle, on passe de six mois de jour à six mois de nuit.", source: R(2) },
    // f3 : le crépuscule
    { id: "svt-s02-1-q10", fiche: "svt-s02-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce que le crépuscule ?",
      choix: ["Le moment où les rayons du Soleil sont rasants et sa lumière rougeoie", "Le milieu de la nuit", "Le moment où le Soleil est le plus haut", "Une ligne imaginaire du globe"],
      reponse: "Le moment où les rayons du Soleil sont rasants et sa lumière rougeoie",
      explication: "Le crépuscule, c'est l'aube ou le coucher du Soleil. Les rayons arrivent rasants et la lumière devient rouge.", source: R(2) },
    { id: "svt-s02-1-q11", fiche: "svt-s02-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Près de l'équateur, le crépuscule dure très longtemps.",
      corrections: ["Faux : il est très court près de l'équateur ; il s'allonge vers le cercle polaire.", "Faux : il n'y a jamais de crépuscule à l'équateur.", "Faux : à l'équateur, le crépuscule dure toute la journée."],
      reponse: { vrai: false, correction: "Faux : il est très court près de l'équateur ; il s'allonge vers le cercle polaire." },
      explication: "Le crépuscule est bref près de l'équateur. Près du cercle polaire, il peut durer des heures.", source: R(2) },
    { id: "svt-s02-1-q12", fiche: "svt-s02-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment change la durée du crépuscule quand on va de l'équateur vers le cercle polaire ?",
      choix: ["Elle s'allonge, jusqu'à de nombreuses heures", "Elle raccourcit jusqu'à disparaître", "Elle reste la même partout", "Elle dure toujours exactement une minute"],
      reponse: "Elle s'allonge, jusqu'à de nombreuses heures",
      explication: "Plus on s'éloigne de l'équateur, plus le crépuscule dure. Près du cercle polaire, il peut s'étirer sur des heures.", source: R(2) },
    // f4 : le TP du globe éclairé
    { id: "svt-s02-1-q13", fiche: "svt-s02-1-f4", type: "qcm", niveau: 1,
      enonce: "Dans le TP du globe éclairé, que montre le trait jaune ?",
      choix: ["La zone éclairée par la lampe", "L'équateur", "Le tropique", "L'ombre de la Lune"],
      reponse: "La zone éclairée par la lampe",
      explication: "Le trait jaune entoure la zone éclairée. Le trait noir, lui, marque l'arrivée d'un rayon parallèle à l'équateur.", source: C(3) },
    { id: "svt-s02-1-q14", fiche: "svt-s02-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans le TP, la tache de lumière est ronde au niveau de l'équateur.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "À l'équateur, le rayon dessine une petite tache ronde. Au milieu de l'hémisphère nord, elle s'allonge.", source: C(3) },
    { id: "svt-s02-1-q15", fiche: "svt-s02-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment change la tache de lumière quand on passe de l'équateur au milieu de l'hémisphère nord ?",
      choix: ["Elle s'allonge en ovale", "Elle devient plus petite et plus ronde", "Elle disparaît complètement", "Elle devient carrée"],
      reponse: "Elle s'allonge en ovale",
      explication: "La même lumière dessine une tache ronde à l'équateur. Plus au nord, la tache s'étire en ovale.", source: C(3) },
    // f5 : saisons et hémisphères
    { id: "svt-s02-1-q16", fiche: "svt-s02-1-f5", type: "qcm", niveau: 1,
      enonce: "Le 15 janvier, quelle saison est-ce dans l'hémisphère sud ?",
      choix: ["L'été", "L'hiver", "L'automne", "Le printemps"],
      reponse: "L'été",
      explication: "Les saisons sont inversées entre les hémisphères. En janvier, c'est l'hiver au nord et l'été au sud.", source: C(3) },
    { id: "svt-s02-1-q17", fiche: "svt-s02-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Quand c'est l'hiver à New York, c'est aussi l'hiver à Sydney.",
      corrections: ["Faux : Sydney est dans l'hémisphère sud, où c'est l'été à ce moment-là.", "Faux : à Sydney, c'est toujours le printemps.", "Faux : Sydney et New York sont dans le même hémisphère."],
      reponse: { vrai: false, correction: "Faux : Sydney est dans l'hémisphère sud, où c'est l'été à ce moment-là." },
      explication: "New York est au nord, Sydney au sud. Leurs saisons sont donc inversées.", source: C(3) },
    { id: "svt-s02-1-q18", fiche: "svt-s02-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi la Guyane française n'a-t-elle pas de saison astronomique ?",
      choix: ["Parce qu'elle est dans la zone climatique équatoriale", "Parce qu'elle est au pôle Sud", "Parce qu'il n'y pleut jamais", "Parce qu'elle est près du cercle polaire"],
      reponse: "Parce qu'elle est dans la zone climatique équatoriale",
      explication: "En zone équatoriale, il n'y a pas de saisons astronomiques. On y distingue seulement une saison des pluies et une saison sèche.", source: C(3) },
    { id: "svt-s02-1-q19", fiche: "svt-s02-1-f5", type: "association", niveau: 2,
      enonce: "Relie chaque moment à ce qu'il représente.",
      gauche: ["Le solstice de décembre, dans l'hémisphère sud", "L'équinoxe de septembre, dans l'hémisphère sud", "Le mois de janvier, dans l'hémisphère nord", "La saison des pluies en Guyane"],
      droite: ["De décembre à juillet", "Le solstice d'été", "L'hiver", "L'équinoxe de printemps"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Au sud, l'été et le printemps arrivent quand le nord a l'hiver et l'automne. En Guyane, il pleut surtout de décembre à juillet.", source: C(3) },
    { id: "svt-s02-1-q20", fiche: "svt-s02-1-f5", type: "qcm", niveau: 3,
      enonce: "En Terre Adélie, en Antarctique, à quoi ressemble le ciel tard le soir à la mi-novembre ?",
      choix: ["À un ciel de jour", "À un ciel de pleine nuit étoilée", "À un ciel sans Soleil depuis six mois", "À un ciel d'éclipse"],
      reponse: "À un ciel de jour",
      explication: "À la mi-novembre, le pôle Sud est entre l'équinoxe de printemps et le solstice d'été. Le Soleil y brille donc encore tard le soir.", source: C(3) },
    // f6 : les rotations des planètes
    { id: "svt-s02-1-q21", fiche: "svt-s02-1-f6", type: "qcm", niveau: 1,
      enonce: "Quelle planète tourne le plus lentement sur elle-même ?",
      choix: ["Vénus", "Jupiter", "La Terre", "Mars"],
      reponse: "Vénus",
      explication: "Vénus met 243 jours pour faire un tour sur elle-même. C'est de loin la plus lente.", source: R(3) },
    { id: "svt-s02-1-q22", fiche: "svt-s02-1-f6", type: "qcm", niveau: 1,
      enonce: "Quelle planète tourne le plus vite sur elle-même ?",
      choix: ["Jupiter", "Vénus", "Mercure", "La Terre"],
      reponse: "Jupiter",
      explication: "Jupiter fait un tour en moins d'une demi-journée. C'est la rotation la plus rapide du système solaire.", source: R(3) },
    { id: "svt-s02-1-q23", fiche: "svt-s02-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "La Lune met moins d'une journée à faire un tour sur elle-même.",
      corrections: ["Faux : la Lune met plus de 27 jours à tourner sur elle-même.", "Faux : la Lune ne tourne pas du tout sur elle-même.", "Faux : la Lune met exactement une année."],
      reponse: { vrai: false, correction: "Faux : la Lune met plus de 27 jours à tourner sur elle-même." },
      explication: "La rotation de la Lune dure 27 jours et 8 heures. C'est bien plus long que celle de la Terre.", source: R(3) },
    { id: "svt-s02-1-q24", fiche: "svt-s02-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que la Terre est unique par sa rotation ?",
      choix: ["Aucune autre planète ne tourne sur elle-même en un temps vraiment comparable", "C'est la seule planète qui tourne sur elle-même", "Elle tourne plus vite que toutes les autres", "Elle ne tourne pas du tout sur elle-même"],
      reponse: "Aucune autre planète ne tourne sur elle-même en un temps vraiment comparable",
      explication: "Chaque planète a sa propre durée de rotation, de quelques heures à des centaines de jours. Aucune n'est vraiment comparable à la Terre.", source: R(3) }
  ],
  bonus: [],
  nonCouvert: [
    "La leçon de la séance 3 n'est pas déposée : seules les lignes citées dans les ressources (équateur, tropiques, cercles polaires, pôles) sont dans le jeu ; le nom et la position exacte de chaque tropique ne sont pas donnés.",
    "La conclusion du TP 3 (ce que la forme de la tache de lumière montre sur l'énergie reçue selon le lieu) n'est pas écrite dans le corrigé.",
    "Le zénith et la latitude sont employés dans les ressources sans être définis."
  ]
};
