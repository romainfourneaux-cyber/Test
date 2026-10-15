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
      texte: "Des lignes imaginaires découpent le globe. L'équateur partage la Terre en deux moitiés : l'hémisphère nord et l'hémisphère sud. En s'éloignant de l'équateur, on rencontre les tropiques, puis les cercles polaires. Tout au bout se trouvent les deux pôles : le pôle Nord et le pôle Sud.",
      pointsCles: [
        "Équateur : la ligne qui sépare l'hémisphère nord de l'hémisphère sud",
        "De l'équateur vers un pôle : équateur, tropique, cercle polaire, pôle",
        "Aux deux extrémités du globe : le pôle Nord et le pôle Sud"
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
      texte: "Dans le TP, une lampe joue le rôle du Soleil et éclaire un globe. On compare trois endroits : l'équateur, le milieu de l'hémisphère nord et le pôle Nord. À l'équateur, un rayon parallèle à l'équateur dessine une petite tache ronde. Au milieu de l'hémisphère nord, la même tache s'allonge en ovale.",
      pointsCles: [
        "Trait noir : là où arrive un rayon parallèle à l'équateur",
        "Trait jaune : la zone éclairée par le Soleil, joué par la lampe",
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
      texte: "Toutes les planètes tournent sur elles-mêmes, mais pas au même rythme. La Terre fait un tour en 23 h 56 min, Mars en 24 h 36 min. Vénus est la plus lente : 243 jours ! Jupiter, la plus rapide : moins de 10 heures. La Lune met plus de 27 jours. Aucune n'a la même durée que la Terre.",
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
    { id: "svt-s02-1-q2", fiche: "svt-s02-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Les cercles polaires sont plus proches de l'équateur que les tropiques.",
      corrections: ["Faux : en partant de l'équateur, on rencontre d'abord les tropiques, puis les cercles polaires.", "Faux : les cercles polaires et les tropiques sont à la même distance de l'équateur.", "Faux : les cercles polaires sont exactement sur l'équateur."],
      reponse: { vrai: false, correction: "Faux : en partant de l'équateur, on rencontre d'abord les tropiques, puis les cercles polaires." },
      explication: "Depuis l'équateur, on passe un tropique, puis un cercle polaire, avant d'arriver au pôle. Les cercles polaires sont donc plus loin.", source: R(2) },
    { id: "svt-s02-1-q3", fiche: "svt-s02-1-f1", type: "ordre", niveau: 2,
      enonce: "Range ces repères en allant de l'équateur jusqu'au pôle Nord.",
      elements: ["Cercle polaire", "Équateur", "Pôle Nord", "Tropique"],
      reponse: [1, 3, 0, 2],
      explication: "Équateur, tropique, cercle polaire, pôle. Chaque ligne est plus loin de l'équateur que la précédente.", source: R(2) },
    { id: "svt-s02-1-q4", fiche: "svt-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on chacune des deux moitiés du globe séparées par l'équateur ?",
      choix: ["Un hémisphère", "Un tropique", "Un pôle", "Un cercle polaire"],
      reponse: "Un hémisphère",
      explication: "Chaque moitié du globe est un hémisphère. Il y a l'hémisphère nord et l'hémisphère sud.", source: R(2) },
    { id: "svt-s02-1-q25", fiche: "svt-s02-1-f1", type: "qcm", niveau: 2,
      enonce: "Combien de tropiques et de cercles polaires le globe compte-t-il en tout ?",
      choix: ["Deux tropiques et deux cercles polaires", "Un tropique et un cercle polaire", "Deux tropiques et un seul cercle polaire", "Un seul tropique et deux cercles polaires"],
      reponse: "Deux tropiques et deux cercles polaires",
      explication: "Il y a un tropique et un cercle polaire de chaque côté de l'équateur. Cela fait deux tropiques et deux cercles polaires.", source: R(2) },
    { id: "svt-s02-1-q26", fiche: "svt-s02-1-f1", type: "qcm", niveau: 3,
      enonce: "Une exploratrice quitte l'équateur et marche tout droit vers le pôle Sud. Après son départ, quelle est la deuxième ligne imaginaire qu'elle franchit ?",
      choix: ["Un cercle polaire", "Un tropique", "L'équateur", "L'axe de rotation"],
      reponse: "Un cercle polaire",
      explication: "Depuis l'équateur, on franchit d'abord un tropique, puis un cercle polaire, avant d'atteindre le pôle. L'ordre est le même vers le nord et vers le sud.", source: R(2) },
    { id: "svt-s02-1-q27", fiche: "svt-s02-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Le pôle Nord et le pôle Sud se trouvent dans le même hémisphère.",
      corrections: ["Faux : le pôle Nord est au bout de l'hémisphère nord, le pôle Sud au bout de l'hémisphère sud.", "Faux : les deux pôles se trouvent sur l'équateur.", "Faux : il n'y a qu'un seul pôle, au nord."],
      reponse: { vrai: false, correction: "Faux : le pôle Nord est au bout de l'hémisphère nord, le pôle Sud au bout de l'hémisphère sud." },
      explication: "L'équateur sépare les deux hémisphères, et chaque pôle se trouve au bout de l'un d'eux. Ils sont aux deux extrémités du globe.", source: R(2) },
    // f2 : la durée du jour selon le lieu
    { id: "svt-s02-1-q5", fiche: "svt-s02-1-f2", type: "qcm", niveau: 1,
      enonce: "Où le jour et la nuit ont-ils la même durée toute l'année ?",
      choix: ["Sur l'équateur", "Au pôle Nord", "Sur un cercle polaire", "Sur un tropique"],
      reponse: "Sur l'équateur",
      explication: "Seul l'équateur a toute l'année autant de jour que de nuit. Ailleurs, cela n'arrive qu'aux équinoxes.", source: R(2) },
    { id: "svt-s02-1-q6", fiche: "svt-s02-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Aux pôles, le jour peut durer six mois.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Au pôle, le Soleil se lève à l'équinoxe de printemps et ne se couche qu'à l'équinoxe d'automne. Viennent ensuite six mois de nuit.", source: R(2) },
    { id: "svt-s02-1-q7", fiche: "svt-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment évolue l'écart entre la durée du jour en été et en hiver quand on va de l'équateur vers le cercle polaire ?",
      choix: ["Il grandit de plus en plus", "Il diminue jusqu'à disparaître", "Il reste le même partout", "Il grandit, puis il diminue"],
      reponse: "Il grandit de plus en plus",
      explication: "Près de l'équateur, la durée du jour change peu au fil de l'année. Plus on avance vers le cercle polaire, plus l'écart entre l'été et l'hiver devient grand.", source: R(2) },
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
    { id: "svt-s02-1-q28", fiche: "svt-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "À Bourges, en France, combien de temps dure environ le jour au solstice d'été ?",
      choix: ["Environ 16 heures", "Environ 8 heures", "Environ 5 heures", "Environ six mois d'affilée"],
      reponse: "Environ 16 heures",
      explication: "À Bourges, le jour dure environ 16 heures en été et 8 heures en hiver. Cet écart est typique de la zone entre un tropique et le cercle polaire.", source: R(2) },
    { id: "svt-s02-1-q29", fiche: "svt-s02-1-f2", type: "vrai_faux", niveau: 3,
      enonce: "À Yellowknife, au Canada, près du cercle polaire, le jour est très long au solstice d'hiver.",
      corrections: ["Faux : en hiver, le jour y est très court, à peine plus de 5 heures ; c'est en été qu'il est très long.", "Faux : le jour y dure autant que la nuit toute l'année.", "Faux : le jour y dure six mois sans interruption."],
      reponse: { vrai: false, correction: "Faux : en hiver, le jour y est très court, à peine plus de 5 heures ; c'est en été qu'il est très long." },
      explication: "Près du cercle polaire, le jour est très court en hiver et très long en été. À Yellowknife, en été, le Soleil ne se couche que vers 1 heure du matin.", source: R(2) },
    { id: "svt-s02-1-q30", fiche: "svt-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Au pôle, à quel moment de l'année le Soleil se lève-t-il ?",
      choix: ["À l'équinoxe de printemps", "À l'équinoxe d'automne", "Au solstice d'été", "Chaque matin, comme ailleurs"],
      reponse: "À l'équinoxe de printemps",
      explication: "Au pôle, le Soleil se lève à l'équinoxe de printemps et brille ensuite six mois. Il se couche à l'équinoxe d'automne pour six mois de nuit.", source: R(2) },
    // f3 : le crépuscule
    { id: "svt-s02-1-q10", fiche: "svt-s02-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce que le crépuscule ?",
      choix: ["Un moment où les rayons arrivent rasants et rougeoient", "Un moment où le Soleil brille au plus haut, juste à midi", "Une nuit de six mois au-dessus des pôles", "Un jour où la nuit dure autant que le jour, partout"],
      reponse: "Un moment où les rayons arrivent rasants et rougeoient",
      explication: "Le crépuscule, c'est l'aube ou le coucher du Soleil. Les rayons arrivent rasants et la lumière devient rouge.", source: R(2) },
    { id: "svt-s02-1-q11", fiche: "svt-s02-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Près de l'équateur, le crépuscule dure très longtemps.",
      corrections: ["Faux : il est très court près de l'équateur ; il s'allonge vers le cercle polaire.", "Faux : il n'y a jamais de crépuscule à l'équateur.", "Faux : à l'équateur, le crépuscule dure toute la journée."],
      reponse: { vrai: false, correction: "Faux : il est très court près de l'équateur ; il s'allonge vers le cercle polaire." },
      explication: "Le crépuscule est bref près de l'équateur. Près du cercle polaire, il peut durer des heures.", source: R(2) },
    { id: "svt-s02-1-q12", fiche: "svt-s02-1-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi le crépuscule est-il très court près de l'équateur ?",
      choix: ["Le Soleil y est au zénith chaque jour", "Le jour y dure six mois d'affilée", "La Terre y est aplatie", "Les rayons y arrivent toujours rasants"],
      reponse: "Le Soleil y est au zénith chaque jour",
      explication: "Près de l'équateur, le Soleil est au zénith chaque jour, et le crépuscule y est donc très court. Près du cercle polaire, le Soleil l'est rarement et le crépuscule s'allonge.", source: R(2) },
    { id: "svt-s02-1-q31", fiche: "svt-s02-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le crépuscule n'a lieu que le soir, au coucher du Soleil.",
      corrections: ["Faux : il a lieu aussi le matin, à l'aube.", "Faux : il n'a lieu qu'à midi, quand le Soleil est au plus haut.", "Faux : il n'a lieu que la nuit, une fois le Soleil couché."],
      reponse: { vrai: false, correction: "Faux : il a lieu aussi le matin, à l'aube." },
      explication: "Le crépuscule désigne l'aube comme le coucher du Soleil. Dans les deux cas, les rayons arrivent rasants et la lumière rougeoie.", source: R(2) },
    { id: "svt-s02-1-q32", fiche: "svt-s02-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qui est vrai du crépuscule.",
      choix: ["Les rayons du Soleil arrivent rasants", "La lumière du Soleil rougeoie", "Il est très court près de l'équateur", "Il dure le même temps partout sur le globe", "Le Soleil est alors au plus haut dans le ciel"],
      reponse: ["Les rayons du Soleil arrivent rasants", "La lumière du Soleil rougeoie", "Il est très court près de l'équateur"],
      explication: "Au crépuscule, les rayons sont rasants et la lumière rougeoie. Sa durée change selon le lieu : très courte à l'équateur, longue près du cercle polaire.", source: R(2) },
    { id: "svt-s02-1-q33", fiche: "svt-s02-1-f3", type: "ordre", niveau: 3,
      enonce: "Range ces lieux du crépuscule le plus court au plus long.",
      elements: ["Yellowknife, près du cercle polaire", "Un lieu sur l'équateur", "Bourges, en France"],
      reponse: [1, 2, 0],
      explication: "Le crépuscule s'allonge à mesure qu'on s'éloigne de l'équateur vers le cercle polaire. Bourges est entre les deux, Yellowknife tout près du cercle polaire.", source: R(2) },
    { id: "svt-s02-1-q34", fiche: "svt-s02-1-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Au crépuscule, les rayons du Soleil sont ___ et sa lumière ___.",
      banque: ["rasants", "rougeoie", "verticaux", "bleuit"],
      reponse: [["rasants"], ["rougeoie"]],
      explication: "Au crépuscule, à l'aube ou au coucher, les rayons arrivent rasants. La lumière du Soleil prend alors une teinte rouge.", source: R(2) },
    // f4 : le TP du globe éclairé
    { id: "svt-s02-1-q13", fiche: "svt-s02-1-f4", type: "qcm", niveau: 2,
      enonce: "Dans le TP du globe éclairé, que montre le trait jaune ?",
      choix: ["La zone éclairée par le Soleil", "L'arrivée d'un rayon parallèle à l'équateur", "La ligne de l'équateur", "La zone qui reste dans l'ombre"],
      reponse: "La zone éclairée par le Soleil",
      explication: "Le trait jaune entoure la zone éclairée. Le trait noir, lui, marque l'arrivée d'un rayon parallèle à l'équateur.", source: C(3) },
    { id: "svt-s02-1-q14", fiche: "svt-s02-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans le TP, la tache de lumière est ronde au niveau de l'équateur.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "À l'équateur, le rayon dessine une petite tache ronde. Au milieu de l'hémisphère nord, elle s'allonge.", source: C(3) },
    { id: "svt-s02-1-q15", fiche: "svt-s02-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment change la tache de lumière quand on passe de l'équateur au milieu de l'hémisphère nord ?",
      choix: ["Elle s'allonge en ovale", "Elle devient plus petite et plus ronde", "Elle disparaît complètement", "Elle reste ronde et de même taille"],
      reponse: "Elle s'allonge en ovale",
      explication: "La même lumière dessine une tache ronde à l'équateur. Plus au nord, la tache s'étire en ovale.", source: C(3) },
    { id: "svt-s02-1-q35", fiche: "svt-s02-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Dans le TP, le trait noir marque l'arrivée d'un rayon parallèle à l'axe de rotation.",
      corrections: ["Faux : il marque l'arrivée d'un rayon parallèle à l'équateur.", "Faux : il marque toute la zone éclairée par le Soleil.", "Faux : il marque la ligne des tropiques."],
      reponse: { vrai: false, correction: "Faux : il marque l'arrivée d'un rayon parallèle à l'équateur." },
      explication: "Le trait noir montre où arrive un rayon parallèle à l'équateur. La zone éclairée, elle, est entourée par le trait jaune.", source: C(3) },
    { id: "svt-s02-1-q36", fiche: "svt-s02-1-f4", type: "qcm_multiple", niveau: 1,
      enonce: "Coche les endroits du globe comparés dans le TP.",
      choix: ["Au niveau de l'équateur", "Au milieu de l'hémisphère nord", "Au niveau du pôle Nord", "Au niveau du pôle Sud", "Au milieu de l'hémisphère sud"],
      reponse: ["Au niveau de l'équateur", "Au milieu de l'hémisphère nord", "Au niveau du pôle Nord"],
      explication: "Le TP éclaire l'équateur, le milieu de l'hémisphère nord, puis le pôle Nord. On compare la lumière reçue en allant vers le nord.", source: C(3) },
    { id: "svt-s02-1-q37", fiche: "svt-s02-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Dans le TP, la tache de lumière est allongée à l'équateur et devient ronde au milieu de l'hémisphère nord.",
      corrections: ["Faux : c'est l'inverse, ronde à l'équateur, elle s'allonge plus au nord.", "Faux : elle reste ronde partout.", "Faux : elle disparaît dès qu'on quitte l'équateur."],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse, ronde à l'équateur, elle s'allonge plus au nord." },
      explication: "La tache est ronde à l'équateur. Au milieu de l'hémisphère nord, la même lumière s'étale en ovale.", source: C(3) },
    { id: "svt-s02-1-q45", fiche: "svt-s02-1-f4", type: "association", niveau: 2,
      enonce: "Relie chaque observation du TP du globe éclairé à ce qu'elle montre.",
      gauche: ["Le trait noir", "Le trait jaune", "La tache ronde", "La tache allongée en ovale"],
      droite: ["La lumière reçue au milieu de l'hémisphère nord", "La zone éclairée par le Soleil", "L'arrivée d'un rayon parallèle à l'équateur", "La lumière reçue au niveau de l'équateur"],
      reponse: [[0, 2], [1, 1], [2, 3], [3, 0]],
      explication: "Le trait noir marque l'arrivée d'un rayon parallèle à l'équateur, le trait jaune la zone éclairée. La tache est ronde à l'équateur et s'allonge au milieu de l'hémisphère nord.", source: C(3) },
    // f5 : saisons et hémisphères
    { id: "svt-s02-1-q16", fiche: "svt-s02-1-f5", type: "qcm", niveau: 1,
      enonce: "Le 15 janvier, quelle saison est-ce dans l'hémisphère sud ?",
      choix: ["L'été", "L'hiver", "L'automne", "Le printemps"],
      reponse: "L'été",
      explication: "Les saisons sont inversées entre les hémisphères. En janvier, c'est l'hiver au nord et l'été au sud.", source: C(3) },
    { id: "svt-s02-1-q17", fiche: "svt-s02-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Quand c'est l'hiver à New York, c'est aussi l'hiver à Sydney.",
      corrections: ["Faux : Sydney est dans l'hémisphère sud, où c'est l'été à ce moment-là.", "Faux : à Sydney, c'est toujours le printemps.", "Faux : Sydney et New York sont dans le même hémisphère, mais Sydney n'a pas d'hiver."],
      reponse: { vrai: false, correction: "Faux : Sydney est dans l'hémisphère sud, où c'est l'été à ce moment-là." },
      explication: "New York est au nord, Sydney au sud. Leurs saisons sont donc inversées.", source: C(3) },
    { id: "svt-s02-1-q18", fiche: "svt-s02-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi la Guyane française n'a-t-elle pas de saison astronomique ?",
      choix: ["Parce qu'elle est en zone climatique équatoriale", "Parce qu'elle se trouve tout près d'un cercle polaire", "Parce qu'il y pleut autant tous les mois de l'année", "Parce qu'elle se trouve en Antarctique, au pôle Sud"],
      reponse: "Parce qu'elle est en zone climatique équatoriale",
      explication: "En zone équatoriale, il n'y a pas de saisons astronomiques. On y distingue seulement une saison des pluies et une saison sèche.", source: C(3) },
    { id: "svt-s02-1-q19", fiche: "svt-s02-1-f5", type: "association", niveau: 3,
      enonce: "Relie chaque moment à ce qu'il représente.",
      gauche: ["En décembre, dans l'hémisphère sud", "En septembre, dans l'hémisphère sud", "En janvier, dans l'hémisphère nord", "En Guyane, la saison des pluies"],
      droite: ["De décembre à juillet", "Le solstice d'été", "L'hiver", "L'équinoxe de printemps"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Dans l'hémisphère sud, décembre apporte le solstice d'été et septembre l'équinoxe de printemps. En Guyane, la saison des pluies va de décembre à juillet.", source: C(3) },
    { id: "svt-s02-1-q20", fiche: "svt-s02-1-f5", type: "qcm", niveau: 3,
      enonce: "En Terre Adélie, en Antarctique, à quoi ressemble le ciel tard le soir à la mi-novembre ?",
      choix: ["À un ciel de jour", "À un ciel de pleine nuit étoilée", "À un ciel sans Soleil depuis six mois", "À un ciel de crépuscule très court"],
      reponse: "À un ciel de jour",
      explication: "À la mi-novembre, le pôle Sud est entre l'équinoxe de printemps et le solstice d'été. Le Soleil y brille donc encore tard le soir.", source: C(3) },
    { id: "svt-s02-1-q38", fiche: "svt-s02-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "En Guyane française, la saison sèche va de décembre à juillet.",
      corrections: ["Faux : de décembre à juillet, c'est la saison des pluies ; la saison sèche va de juillet à décembre.", "Faux : la Guyane n'a aucune saison sèche.", "Faux : la saison sèche y dure toute l'année."],
      reponse: { vrai: false, correction: "Faux : de décembre à juillet, c'est la saison des pluies ; la saison sèche va de juillet à décembre." },
      explication: "En Guyane, il pleut beaucoup de décembre à juillet. La saison sèche occupe le reste de l'année, de juillet à décembre.", source: C(3) },
    { id: "svt-s02-1-q39", fiche: "svt-s02-1-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Le 15 janvier, coche les villes où c'est l'été.",
      choix: ["São Paulo", "Sydney", "New York", "Tokyo"],
      reponse: ["São Paulo", "Sydney"],
      explication: "São Paulo et Sydney sont dans l'hémisphère sud, où janvier tombe en été. New York et Tokyo, au nord, sont alors en hiver.", source: C(3) },
    { id: "svt-s02-1-q40", fiche: "svt-s02-1-f5", type: "qcm", niveau: 3,
      enonce: "La Guyane française n'a pas de saison astronomique. Pourquoi y distingue-t-on pourtant deux saisons ?",
      choix: ["Il pleut bien plus à certains mois", "Il fait beaucoup plus froid certains mois", "Le jour y dure six mois, puis la nuit six mois", "Les saisons y sont inversées chaque année"],
      reponse: "Il pleut bien plus à certains mois",
      explication: "La Guyane n'a pas de saison astronomique, mais la pluie n'y tombe pas de la même façon toute l'année. On distingue donc une saison des pluies et une saison sèche.", source: C(3) },
    // f6 : les rotations des planètes
    { id: "svt-s02-1-q21", fiche: "svt-s02-1-f6", type: "qcm", niveau: 1,
      enonce: "Quelle planète tourne le plus lentement sur elle-même ?",
      choix: ["Vénus", "Mercure", "Mars", "Jupiter"],
      reponse: "Vénus",
      explication: "Vénus met 243 jours pour faire un tour sur elle-même. Mercure, la suivante, met environ 58 jours.", source: R(3) },
    { id: "svt-s02-1-q22", fiche: "svt-s02-1-f6", type: "qcm", niveau: 2,
      enonce: "Quelle planète tourne le plus vite sur elle-même ?",
      choix: ["Jupiter", "Saturne", "Neptune", "La Terre"],
      reponse: "Jupiter",
      explication: "Jupiter fait un tour sur elle-même en moins de dix heures. Saturne, sa voisine, est presque aussi rapide.", source: R(3) },
    { id: "svt-s02-1-q23", fiche: "svt-s02-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "La Lune met moins d'une journée à faire un tour sur elle-même.",
      corrections: ["Faux : la Lune met plus de 27 jours à tourner sur elle-même.", "Faux : la Lune met 243 jours à tourner sur elle-même.", "Faux : la Lune ne tourne pas du tout sur elle-même."],
      reponse: { vrai: false, correction: "Faux : la Lune met plus de 27 jours à tourner sur elle-même." },
      explication: "La rotation de la Lune dure 27 jours et 8 heures. C'est bien plus long que celle de la Terre.", source: R(3) },
    { id: "svt-s02-1-q24", fiche: "svt-s02-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que la Terre est unique par sa rotation ?",
      choix: ["Aucune autre n'a la même durée de rotation qu'elle", "C'est la seule à tourner sur elle-même", "C'est elle qui tourne le plus vite sur elle-même", "C'est elle qui tourne le plus lentement sur elle-même"],
      reponse: "Aucune autre n'a la même durée de rotation qu'elle",
      explication: "Chaque planète a sa propre durée de rotation, de quelques heures à des centaines de jours. Même Mars, la plus proche de la Terre sur ce point, met environ quarante minutes de plus.", source: R(3) },
    { id: "svt-s02-1-q41", fiche: "svt-s02-1-f6", type: "ordre", niveau: 3,
      enonce: "Range ces astres de celui qui tourne le plus vite sur lui-même à celui qui tourne le plus lentement.",
      elements: ["La Lune", "Mars", "Jupiter", "Vénus", "La Terre"],
      reponse: [2, 4, 1, 0, 3],
      explication: "Jupiter fait un tour en moins de dix heures, la Terre en un peu moins d'une journée et Mars en un peu plus. La Lune met plus de 27 jours et Vénus 243 jours.", source: R(3) },
    { id: "svt-s02-1-q42", fiche: "svt-s02-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Mars tourne sur elle-même un peu plus vite que la Terre.",
      corrections: ["Faux : Mars tourne un peu moins vite, il lui faut une quarantaine de minutes de plus.", "Faux : Mars tourne bien plus vite, en moins de dix heures.", "Faux : Mars met plus de 27 jours à faire un tour."],
      reponse: { vrai: false, correction: "Faux : Mars tourne un peu moins vite, il lui faut une quarantaine de minutes de plus." },
      explication: "La Terre fait un tour en un peu moins d'une journée, Mars en un peu plus. Leurs rotations sont proches, mais pas identiques.", source: R(3) },
    { id: "svt-s02-1-q43", fiche: "svt-s02-1-f6", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les planètes qui font un tour sur elles-mêmes en moins d'une journée.",
      choix: ["Jupiter", "Saturne", "La Terre", "Mars", "Vénus", "Mercure"],
      reponse: ["Jupiter", "Saturne", "La Terre"],
      explication: "Jupiter et Saturne tournent en une dizaine d'heures, la Terre en un peu moins d'une journée. Mars dépasse la journée d'un peu plus d'une demi-heure, Mercure et Vénus mettent des dizaines ou des centaines de jours.", source: R(3) },
    { id: "svt-s02-1-q44", fiche: "svt-s02-1-f6", type: "association", niveau: 2,
      enonce: "Relie chaque astre à sa durée de rotation.",
      gauche: ["Vénus", "Mercure", "La Lune", "Jupiter"],
      droite: ["9 heures et 55 minutes", "243 jours et 26 minutes", "27 jours et 8 heures", "58 jours et 16 heures"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Vénus est la plus lente et Jupiter la plus rapide. Entre les deux, Mercure met près de deux mois et la Lune près d'un mois.", source: R(3) }
  ],
  bonus: [
    {
      id: "svt-s02-1-b1",
      fiche: "svt-s02-1-f1",
      titre: "Le milieu du monde",
      texte: "L'équateur fait le tour de la Terre sur environ 40 075 km. Il traverse 11 pays, dont sept en Afrique. Des monuments marquent son passage, comme le « Mitad del Mundo », le « milieu du monde », près de Quito, la capitale de l'Équateur.",
      source: { titre: "Équateur terrestre", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/%C3%89quateur_terrestre" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 3 n'est pas déposée : seules les lignes citées dans les ressources (équateur, tropiques, cercles polaires, pôles) sont dans le jeu ; le nom et la position exacte de chaque tropique ne sont pas donnés.",
    "La conclusion du TP 3 (ce que la forme de la tache de lumière montre sur l'énergie reçue selon le lieu) n'est pas écrite dans le corrigé.",
    "Le zénith et la latitude sont employés dans les ressources sans être définis.",
    "Deux exemples des sources ne sont pas repris parce qu'ils semblent inexacts (à faire vérifier) : Sydney donnée comme lieu situé entre l'équateur et les tropiques (ressources p. 2) et la Guyane placée entre l'équateur et le tropique du Capricorne (corrigé p. 3)."
  ]
};
