// Source en clair du cours geographie-s02-1 (Thème 1, cours 1, étude de cas 1 : le Burkina Faso).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/geographie-s02-1.js.
// Valeurs du graphique lues sur la page 1 du PDF (approximatives, arrondies dans les fiches).
// Le devoir geographie-d1 couvre ce cours : aucune question ne reprend ses questions, documents, chiffres ou réponses.
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 1 - Etude de cas 1 Burkina Faso.pdf";
const P = (page) => ({ fichier: F, page: page });

module.exports = {
  id: "geographie-s02-1",
  fiches: [
    {
      id: "geographie-s02-1-f1", notion: "Présentation du Burkina Faso",
      titre: "Le pays des hommes intègres",
      texte: "Le nom Burkina Faso veut dire « pays des hommes intègres ». Ancienne colonie française appelée Haute-Volta, il est indépendant depuis 1960. Ce pays d'Afrique, fait de grandes plaines au climat semi-aride, a pour capitale Ouagadougou. Les habitants vivent surtout de l'élevage et des cultures de mil et de sorgho. L'eau y manque beaucoup.",
      pointsCles: [
        "Indépendant depuis 1960, autrefois appelé Haute-Volta",
        "Une superficie d'environ la moitié de celle de la France",
        "Langue officielle : le français ; on parle aussi le moré, le peul, le dioula et d'autres langues",
        "Un peu de richesses dans le sous-sol (or, zinc), mais un grave manque d'eau"
      ],
      dates: [{ annee: 1960, evenement: "Indépendance du Burkina Faso, l'ancienne Haute-Volta" }],
      lieux: ["Burkina Faso", "Ouagadougou"], personnages: [],
      vocabulaire: [
        { mot: "Burkinabé", def: "un habitant du Burkina Faso" }
      ],
      schema: null, prerequis: [], source: P(1)
    },
    {
      id: "geographie-s02-1-f2", notion: "L'évolution démographique du Burkina Faso",
      titre: "Une population qui explose",
      texte: "Depuis 1960, la mortalité du Burkina Faso a beaucoup baissé, alors que la natalité reste forte et ne recule que lentement. Les naissances dépassent donc largement les décès : la population grimpe très vite. D'environ 5 millions d'habitants en 1960, elle pourrait dépasser 30 millions vers 2040. Le pays n'en est qu'au début de sa transition démographique.",
      pointsCles: [
        "Natalité : près de 50 pour mille en 1960, encore haute aujourd'hui",
        "Mortalité : près de 30 pour mille en 1960, en forte baisse depuis",
        "Environ 5 millions d'habitants en 1960, plus de 30 millions prévus vers 2040",
        "Un pays au tout début de sa transition démographique"
      ],
      dates: [], lieux: ["Burkina Faso"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["geographie-s01-2-f4"], source: P(1)
    },
    {
      id: "geographie-s02-1-f3", notion: "L'explosion urbaine à Ouagadougou",
      titre: "Ouagadougou, une capitale qui déborde",
      texte: "La hausse de la population et l'exode rural, ce départ des campagnes vers la ville, font grossir Ouagadougou sans contrôle. À côté de quartiers bien organisés s'étendent des quartiers pauvres et des bidonvilles. La capitale approche les 3 millions d'habitants et grandit à l'un des rythmes les plus rapides du monde. Ses équipements ne suivent pas.",
      pointsCles: [
        "Croissance démographique et exode rural : une explosion urbaine mal maîtrisée",
        "Des espaces lotis bien organisés, et des quartiers pauvres avec des bidonvilles",
        "Problèmes : pollution, transports, sécurité, eau potable, santé, éducation",
        "Des infrastructures qui ne sont pas adaptées à tant d'habitants"
      ],
      dates: [], lieux: ["Ouagadougou"], personnages: [],
      vocabulaire: [
        { mot: "exode rural", def: "le départ des habitants des campagnes pour aller vivre en ville" },
        { mot: "infrastructures", def: "les installations dont une ville ou un pays a besoin pour sa population" }
      ],
      schema: null, prerequis: ["geographie-s02-1-f2"], source: P(2)
    },
    {
      id: "geographie-s02-1-f4", notion: "Les indicateurs de développement du Burkina Faso",
      titre: "Un pays pauvre et très jeune",
      texte: "Comparé à la France, le Burkina Faso montre les signes d'un pays peu développé. Une femme y a en moyenne plus de cinq enfants, ce qui rend la population très jeune. On y vit environ vingt ans de moins qu'en France. La richesse produite par habitant y est à peu près cinquante fois plus faible. Les classes sont surchargées.",
      pointsCles: [
        "Enfants par femme : 5,1 au Burkina Faso, moins de 2 en France",
        "Espérance de vie : 61 ans au Burkina Faso, 82 ans en France",
        "Mortalité infantile : 54 pour mille, plus de quatre fois celle de la France",
        "PIB par habitant : 786 dollars par an, environ cinquante fois moins qu'en France",
        "Jusqu'à 120 élèves par classe, et plus de la moitié des enfants travaillent"
      ],
      dates: [], lieux: ["Burkina Faso", "France"], personnages: [],
      vocabulaire: [
        { mot: "PIB par habitant", def: "la richesse qu'un pays produit, partagée entre tous ses habitants" }
      ],
      schema: null, prerequis: ["geographie-s02-1-f2"], source: P(2)
    },
    {
      id: "geographie-s02-1-f5", notion: "La pollution à Ouagadougou",
      titre: "Le défi des déchets",
      texte: "À Ouagadougou, les déchets s'entassent : un peu plus d'un tiers des ordures finissent dans la rue ou dans des décharges sauvages. En vingt ans, leur quantité a triplé, et près d'un déchet sur trois est en plastique. En cause : la croissance de la ville, l'explosion démographique et certaines habitudes alimentaires.",
      pointsCles: [
        "Des ordures jetées dans la rue ou dans des décharges sauvages",
        "Trois fois plus de déchets qu'il y a vingt ans",
        "Environ un tiers de plastique",
        "Causes : urbanisation, explosion démographique, habitudes alimentaires"
      ],
      dates: [], lieux: ["Ouagadougou"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["geographie-s02-1-f3"], source: P(2)
    }
  ],
  schemas: [],
  questions: [
    // f1
    { id: "geographie-s02-1-q1", fiche: "geographie-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Que signifie le nom « Burkina Faso » ?",
      choix: ["Pays des hommes intègres", "Pays des grands fleuves", "Terre des montagnes", "Pays de l'or"],
      reponse: "Pays des hommes intègres",
      explication: "Burkina Faso veut dire « pays des hommes intègres ». Avant, le pays s'appelait la Haute-Volta.", source: P(1) },
    { id: "geographie-s02-1-q2", fiche: "geographie-s02-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Avant son indépendance, le Burkina Faso était une colonie française appelée la Haute-Volta.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, c'était une colonie française, devenue indépendante en 1960.", source: P(1) },
    { id: "geographie-s02-1-q3", fiche: "geographie-s02-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment vivent surtout les habitants du Burkina Faso ?",
      choix: ["De l'élevage, et en cultivant du mil et du sorgho", "De la pêche en mer", "Du tourisme en montagne", "De l'industrie automobile"],
      reponse: "De l'élevage, et en cultivant du mil et du sorgho",
      explication: "Les Burkinabés vivent surtout de l'élevage et des céréales comme le mil et le sorgho.", source: P(1) },
    { id: "geographie-s02-1-q4", fiche: "geographie-s02-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le Burkina Faso dispose d'eau en abondance.",
      corrections: ["Faux : le pays manque cruellement d'eau.", "Faux : il n'a aucune richesse dans son sous-sol.", "Faux : il est entièrement couvert de forêts."],
      reponse: { vrai: false, correction: "Faux : le pays manque cruellement d'eau." },
      explication: "Son climat est semi-aride et l'eau y manque beaucoup. Il a pourtant un peu d'or et de zinc dans son sous-sol.", source: P(1) },
    // f2
    { id: "geographie-s02-1-q5", fiche: "geographie-s02-1-f2", type: "qcm", niveau: 1,
      enonce: "D'après le graphique de l'étude de cas, comment la mortalité a-t-elle évolué au Burkina Faso depuis 1960 ?",
      choix: ["Elle a beaucoup baissé", "Elle a beaucoup augmenté", "Elle n'a pas bougé", "Elle a dépassé la natalité"],
      reponse: "Elle a beaucoup baissé",
      explication: "La courbe rouge de la mortalité descend nettement depuis 1960. Elle reste bien sous la natalité.", source: P(1) },
    { id: "geographie-s02-1-q6", fiche: "geographie-s02-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Depuis 1960, la natalité du Burkina Faso est toujours restée bien plus haute que sa mortalité.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, la courbe des naissances reste loin au-dessus de celle des décès. C'est pour cela que la population augmente si vite.", source: P(1) },
    { id: "geographie-s02-1-q7", fiche: "geographie-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment voit-on que le Burkina Faso n'est qu'au début de sa transition démographique ?",
      choix: ["Sa mortalité a déjà bien baissé, mais sa natalité reste très haute", "Sa natalité et sa mortalité sont toutes les deux très basses", "Sa natalité a baissé avant sa mortalité", "Sa population diminue depuis 1960"],
      reponse: "Sa mortalité a déjà bien baissé, mais sa natalité reste très haute",
      explication: "La première étape est faite : on meurt moins. Mais les naissances n'ont pas encore vraiment baissé.", source: P(1) },
    { id: "geographie-s02-1-q8", fiche: "geographie-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "D'après les prévisions du graphique, combien d'habitants le Burkina Faso pourrait-il compter vers 2040 ?",
      choix: ["Plus de 30 millions", "Environ 5 millions", "Environ 1 million", "Plus de 300 millions"],
      reponse: "Plus de 30 millions",
      explication: "La courbe de la population monte sans arrêt. Elle passe d'environ 5 millions en 1960 à plus de 30 millions prévus vers 2040.", source: P(1) },
    // f3
    { id: "geographie-s02-1-q9", fiche: "geographie-s02-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qui fait grossir Ouagadougou de façon mal maîtrisée ?",
      choix: ["La croissance démographique et l'exode rural", "Le tourisme et les croisières", "L'arrivée de retraités venus d'Europe", "La fonte des glaciers"],
      reponse: "La croissance démographique et l'exode rural",
      explication: "Il naît beaucoup d'enfants et beaucoup de ruraux viennent s'installer en ville. La capitale grossit trop vite.", source: P(1) },
    { id: "geographie-s02-1-q10", fiche: "geographie-s02-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "À Ouagadougou, tous les quartiers sont bien organisés.",
      corrections: ["Faux : à côté d'espaces lotis bien organisés, il y a des quartiers pauvres et des bidonvilles.", "Faux : la ville n'a aucun quartier organisé.", "Faux : Ouagadougou n'est qu'un petit village."],
      reponse: { vrai: false, correction: "Faux : à côté d'espaces lotis bien organisés, il y a des quartiers pauvres et des bidonvilles." },
      explication: "La vue aérienne montre deux types de quartiers. Les uns sont bien tracés, les autres sont pauvres et mal équipés.", source: P(1) },
    { id: "geographie-s02-1-q11", fiche: "geographie-s02-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels problèmes la croissance très rapide de Ouagadougou pose-t-elle ?",
      choix: ["La pollution", "Les transports", "La sécurité", "Le manque de neige", "La montée de la mer", "Trop de personnes âgées"],
      reponse: ["La pollution", "Les transports", "La sécurité"],
      explication: "Une ville qui grandit trop vite peine à gérer ses déchets, ses déplacements et sa sécurité. Ses équipements ne suivent pas.", source: P(2) },
    { id: "geographie-s02-1-q12", fiche: "geographie-s02-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi les infrastructures de Ouagadougou ne sont-elles pas adaptées ?",
      choix: ["Parce que la population augmente bien trop vite pour elles", "Parce que la ville perd des habitants", "Parce qu'elles sont trop nombreuses", "Parce que personne n'habite la capitale"],
      reponse: "Parce que la population augmente bien trop vite pour elles",
      explication: "La capitale gagne des habitants à un rythme record. Routes, réseaux et services n'arrivent pas à suivre.", source: P(2) },
    // f4
    { id: "geographie-s02-1-q13", fiche: "geographie-s02-1-f4", type: "association", niveau: 2,
      enonce: "Relie chaque indicateur à sa valeur au Burkina Faso.",
      gauche: ["Nombre d'enfants par femme", "Espérance de vie", "PIB par habitant et par an", "Croissance de la population"],
      droite: ["786 dollars", "5,1", "61 ans", "+ 2,89 % par an"],
      reponse: [[0, 1], [1, 2], [2, 0], [3, 3]],
      explication: "Ces chiffres viennent du tableau de l'étude de cas. Ils montrent un pays pauvre où la population grandit vite.", source: P(2) },
    { id: "geographie-s02-1-q14", fiche: "geographie-s02-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi la population du Burkina Faso est-elle très jeune ?",
      choix: ["Parce que chaque femme y a en moyenne plus de cinq enfants", "Parce que les personnes âgées partent toutes à l'étranger", "Parce qu'on y vit plus longtemps qu'en France", "Parce que les familles y ont très peu d'enfants"],
      reponse: "Parce que chaque femme y a en moyenne plus de cinq enfants",
      explication: "Avec autant de naissances, les enfants et les jeunes sont très nombreux. En plus, on y vit moins vieux qu'en France.", source: P(2) },
    { id: "geographie-s02-1-q15", fiche: "geographie-s02-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Au Burkina Faso, on vit en moyenne plus longtemps qu'en France.",
      corrections: ["Faux : on y vit en moyenne environ 61 ans, contre 82 ans en France.", "Faux : on y vit exactement aussi longtemps qu'en France.", "Faux : l'espérance de vie n'y est pas mesurée."],
      reponse: { vrai: false, correction: "Faux : on y vit en moyenne environ 61 ans, contre 82 ans en France." },
      explication: "On y vit environ vingt ans de moins qu'en France. C'est un signe de faible développement.", source: P(2) },
    { id: "geographie-s02-1-q16", fiche: "geographie-s02-1-f4", type: "qcm", niveau: 1,
      enonce: "Dans une école primaire du Burkina Faso, combien d'élèves peut-il y avoir dans une classe ?",
      choix: ["Jusqu'à 120", "Une dizaine", "Une vingtaine au plus", "Toujours moins de 30"],
      reponse: "Jusqu'à 120",
      explication: "Les classes peuvent compter jusqu'à 120 élèves. Et ces enfants ont de la chance, car beaucoup d'autres travaillent.", source: P(2) },
    { id: "geographie-s02-1-q17", fiche: "geographie-s02-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Au Burkina Faso, plus de la moitié des enfants travaillent.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, d'après l'étude de cas, c'est le cas d'un peu plus de la moitié des enfants.", source: P(2) },
    // f5
    { id: "geographie-s02-1-q18", fiche: "geographie-s02-1-f5", type: "qcm", niveau: 1,
      enonce: "Où finit une bonne partie des ordures de Ouagadougou ?",
      choix: ["Dans la rue ou dans des décharges sauvages", "Dans des usines de recyclage", "Dans des centres de tri modernes", "Dans la mer"],
      reponse: "Dans la rue ou dans des décharges sauvages",
      explication: "Plus d'un tiers des ordures sont jetées dans la rue ou dans des décharges sauvages. Elles forment de petites montagnes de déchets.", source: P(2) },
    { id: "geographie-s02-1-q19", fiche: "geographie-s02-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "La quantité de déchets produite à Ouagadougou diminue chaque année.",
      corrections: ["Faux : elle augmente chaque année, et elle a triplé en vingt ans.", "Faux : la ville ne produit aucun déchet.", "Faux : elle a été divisée par trois."],
      reponse: { vrai: false, correction: "Faux : elle augmente chaque année, et elle a triplé en vingt ans." },
      explication: "La masse de déchets grossit chaque année. La ville en produit trois fois plus qu'il y a vingt ans.", source: P(2) },
    { id: "geographie-s02-1-q20", fiche: "geographie-s02-1-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Pourquoi les déchets augmentent-ils à Ouagadougou ?",
      choix: ["L'urbanisation", "L'explosion démographique", "Certaines habitudes alimentaires", "Le froid de l'hiver", "La baisse de la population"],
      reponse: ["L'urbanisation", "L'explosion démographique", "Certaines habitudes alimentaires"],
      explication: "Plus d'habitants, une ville qui s'étend et certaines façons de manger produisent plus d'ordures.", source: P(2) },
    { id: "geographie-s02-1-q21", fiche: "geographie-s02-1-f5", type: "qcm", niveau: 2,
      enonce: "Quelle part des déchets de la capitale est en plastique ?",
      choix: ["Environ un tiers", "Presque aucune", "La totalité", "Environ un dixième"],
      reponse: "Environ un tiers",
      explication: "À peu près un déchet sur trois est en plastique.", source: P(2) }
  ],
  bonus: [],
  nonCouvert: [
    "La capsule vidéo n° 3 (outil du géographe n° 3), à regarder pour la question sur la transition démographique, n'est pas déposée.",
    "Les valeurs du graphique d'évolution démographique sont lues à l'œil sur le PDF : seules des valeurs arrondies sont reprises.",
    "Les réponses attendues aux questions de l'étude de cas ne sont pas fournies dans le dépôt."
  ]
};
