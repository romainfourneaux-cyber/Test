// Source en clair du cours geographie-s07-1 « Cours 2 – 1re partie – Richesse et pauvreté dans le monde ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js geographie-s07-1.
// Seule source : le cours 2 du thème 1 (texte lu sur le Drive, 8 pages ; le PDF n'est pas encore déposé dans
// DEPOT/, les pages citées sont celles des repères « === page n === » de l'extraction), partie I.A
// « Qu'est-ce que la pauvreté ? » (page 1). La partie I.B (mesurer, page 2) nourrit l'outil 9 (geographie-s08-1) ;
// la partie II (pages 3-4) et les exercices des pages 7-8 attendent la 2e partie du cours (semaine 9).
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 2.pdf";
const P = (page) => ({ fichier: F, page: page });

// Schéma redessiné : les deux familles de ressources qui manquent aux pauvres.
function schemaRessources() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 520 230' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13'>";
  s += "<text x='260' y='24' text-anchor='middle' font-size='15' fill='" + encre + "'>Ce qui manque à une personne pauvre</text>";
  s += "<rect x='20' y='44' width='230' height='166' rx='8' fill='#e9d8b4' stroke='#8a6d3b'/>";
  s += "<text x='135' y='68' text-anchor='middle' font-weight='bold' fill='" + encre + "'>Ressources matérielles</text>";
  ["eau potable", "nourriture", "vêtements", "logement"].forEach((m, i) => {
    s += "<text x='40' y='" + (98 + 26 * i) + "' fill='" + encre + "'>• " + m + "</text>";
  });
  s += "<rect x='270' y='44' width='230' height='166' rx='8' fill='#cfdce6' stroke='#2f5e8e'/>";
  s += "<text x='385' y='68' text-anchor='middle' font-weight='bold' fill='" + encre + "'>Ressources immatérielles</text>";
  ["transport", "école", "santé (soins)"].forEach((m, i) => {
    s += "<text x='290' y='" + (98 + 26 * i) + "' fill='" + encre + "'>• " + m + "</text>";
  });
  return s + "</svg>";
}

// Graphique redessiné : part de la population mondiale sous le seuil de pauvreté (valeurs du cours).
function schemaRecul() {
  const encre = "#2e2419";
  const valeurs = [[1990, 35, "35 %", "#b5452f"], [2000, 16, "16 %", "#c8742a"], [2010, 10, "10 %", "#d9a441"], [2018, 8.5, "8,5 %", "#e2c25c"]];
  let s = "<svg viewBox='0 0 520 240' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13'>";
  s += "<text x='260' y='24' text-anchor='middle' font-size='14' fill='" + encre + "'>Part de la population mondiale sous le seuil de pauvreté</text>";
  valeurs.forEach((v, i) => {
    const h = v[1] * 4, x = 60 + 110 * i;
    s += "<rect x='" + x + "' y='" + (190 - h) + "' width='70' height='" + h + "' fill='" + v[3] + "'/>";
    s += "<text x='" + (x + 35) + "' y='" + (184 - h) + "' text-anchor='middle' fill='" + encre + "'>" + v[2] + "</text>";
    s += "<text x='" + (x + 35) + "' y='212' text-anchor='middle' fill='" + encre + "'>" + v[0] + "</text>";
  });
  s += "<line x1='40' y1='190' x2='490' y2='190' stroke='" + encre + "' stroke-width='2'/>";
  return s + "</svg>";
}

module.exports = {
  id: "geographie-s07-1",
  fiches: [
    {
      id: "geographie-s07-1-f1", notion: "Qu'est-ce que la pauvreté ?",
      titre: "Être pauvre, c'est manquer de l'essentiel",
      texte: "Une personne est pauvre quand elle n'a pas les ressources qu'il faut pour vivre correctement dans son pays. Ses revenus sont trop faibles pour couvrir ses besoins essentiels : manger, se loger, s'habiller, boire de l'eau potable. Elle n'a pas non plus accès à l'école, aux soins ou aux transports.",
      pointsCles: [
        "Pauvreté : ne pas avoir les ressources nécessaires pour vivre correctement dans son pays",
        "Besoins essentiels : se nourrir, se loger, se vêtir, avoir de l'eau potable",
        "Les pauvres manquent aussi d'école, de soins et de transports"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "pauvreté", def: "la situation d'une personne qui n'a pas de quoi vivre correctement dans son pays" },
        { mot: "besoins essentiels", def: "ce dont on ne peut pas se passer : manger, se loger, s'habiller, boire de l'eau potable" }
      ],
      schema: null, prerequis: ["geographie-s02-2-f1"], source: P(1)
    },
    {
      id: "geographie-s07-1-f2", notion: "Ressources matérielles et ressources immatérielles",
      titre: "Deux sortes de ressources qui manquent",
      texte: "Le cours range en deux familles ce qui manque aux pauvres. Les ressources matérielles sont des choses concrètes : l'eau potable, la nourriture, les vêtements, le logement. Les ressources immatérielles sont des services : le transport, l'école, la santé. Être pauvre, ce n'est donc pas seulement avoir faim : c'est aussi ne pas pouvoir se soigner, apprendre ou se déplacer.",
      pointsCles: [
        "Ressources matérielles : eau potable, nourriture, vêtements, logement",
        "Ressources immatérielles : transport, école, santé",
        "La pauvreté touche les deux familles de ressources"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ressources matérielles", def: "les choses concrètes nécessaires pour vivre : eau potable, nourriture, vêtements, logement" },
        { mot: "ressources immatérielles", def: "les services nécessaires pour vivre : transport, école, santé" }
      ],
      schema: "geographie-s07-1-s1", prerequis: ["geographie-s07-1-f1"], source: P(1)
    },
    {
      id: "geographie-s07-1-f3", notion: "Le seuil de pauvreté et l'extrême pauvreté",
      titre: "Moins de 1,90 dollar par jour",
      texte: "Pour compter les pauvres, on fixe un seuil de pauvreté : un revenu au-dessous duquel une personne est considérée comme pauvre. Quand quelqu'un dispose de moins de 1,90 dollar par jour pour vivre, on parle d'extrême pauvreté. En Inde, par exemple, 50 millions de personnes vivent dans cette situation.",
      pointsCles: [
        "Seuil de pauvreté : le revenu au-dessous duquel on est considéré comme pauvre",
        "Extrême pauvreté : vivre avec moins de 1,90 dollar par jour",
        "Exemple : 50 millions de personnes en extrême pauvreté en Inde"
      ],
      dates: [], lieux: ["Inde"], personnages: [],
      vocabulaire: [
        { mot: "seuil de pauvreté", def: "le revenu au-dessous duquel une personne est considérée comme pauvre" },
        { mot: "extrême pauvreté", def: "la situation d'une personne qui vit avec moins de 1,90 dollar par jour" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f1"], source: P(1)
    },
    {
      id: "geographie-s07-1-f4", notion: "Le recul de la pauvreté dans le monde",
      titre: "Une pauvreté en recul",
      texte: "Depuis plusieurs dizaines d'années, la population mondiale s'enrichit et la pauvreté recule. En 1990, 35 % des humains vivaient sous le seuil de pauvreté, soit presque 2 milliards de personnes. La part est tombée à 16 % en 2000, 10 % en 2010 et 8,5 % en 2018. Cela représente tout de même encore plus de 700 millions de personnes.",
      pointsCles: [
        "1990 : 35 % de la population mondiale sous le seuil de pauvreté (presque 2 milliards de personnes)",
        "2000 : 16 % ; 2010 : 10 %",
        "2018 : 8,5 %, soit encore plus de 700 millions de personnes",
        "La pauvreté recule, mais elle n'a pas disparu"
      ],
      dates: [
        { annee: 1990, evenement: "35 % de la population mondiale sous le seuil de pauvreté" },
        { annee: 2000, evenement: "16 % de la population mondiale sous le seuil de pauvreté" },
        { annee: 2010, evenement: "10 % de la population mondiale sous le seuil de pauvreté" },
        { annee: 2018, evenement: "8,5 % de la population mondiale sous le seuil de pauvreté" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [],
      schema: "geographie-s07-1-s2", prerequis: ["geographie-s07-1-f3", "geographie-s01-2-f1"], source: P(1)
    },
    {
      id: "geographie-s07-1-f5", notion: "Inégalités et développement",
      titre: "Un monde plus riche, mais très inégal",
      texte: "Même si la pauvreté recule, les richesses restent très mal partagées : 1 % de la population possède la moitié de la richesse mondiale. Une inégalité est une différence de richesse ou de développement entre des personnes ou des territoires. Le développement, c'est l'amélioration des conditions de vie d'une population, jusqu'à couvrir tous ses besoins essentiels.",
      pointsCles: [
        "1 % de la population possède 50 % de la richesse mondiale",
        "Inégalité : différence de richesse ou de développement entre personnes ou territoires",
        "Développement : amélioration des conditions de vie (eau, nourriture, soins, logement, éducation)"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "inégalité", def: "une différence de richesse ou de développement entre des personnes ou entre des territoires" },
        { mot: "développement", def: "l'amélioration des conditions de vie d'une population, qui peut alors satisfaire tous ses besoins essentiels" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f1", "geographie-s01-2-f3"], source: P(1)
    }
  ],
  schemas: [
    { id: "geographie-s07-1-s1", legende: "Les deux familles de ressources qui manquent à une personne pauvre (schéma redessiné d'après le cours).", svg: schemaRessources() },
    { id: "geographie-s07-1-s2", legende: "Part de la population mondiale vivant sous le seuil de pauvreté, de 1990 à 2018 (graphique redessiné d'après le cours).", svg: schemaRecul() }
  ],
  questions: [
    // f1 : qu'est-ce que la pauvreté ?
    { id: "geographie-s07-1-q1", fiche: "geographie-s07-1-f1", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une personne pauvre ?",
      choix: ["Une personne qui manque des ressources nécessaires pour vivre correctement dans son pays", "Une personne qui vit à la campagne", "Une personne qui n'a pas de voiture", "Une personne qui habite dans l'hémisphère Sud"],
      reponse: "Une personne qui manque des ressources nécessaires pour vivre correctement dans son pays",
      explication: "Être pauvre, c'est ne pas avoir de quoi vivre correctement dans son pays. Vivre à la campagne ou sans voiture ne suffit pas à définir la pauvreté.", source: P(1) },
    { id: "geographie-s07-1-q2", fiche: "geographie-s07-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quels besoins essentiels une personne pauvre ne peut-elle pas satisfaire ? (plusieurs réponses)",
      choix: ["Se nourrir", "Se loger", "Se vêtir", "Boire de l'eau potable", "Partir en vacances", "Acheter une télévision"],
      reponse: ["Se nourrir", "Se loger", "Se vêtir", "Boire de l'eau potable"],
      explication: "Manger, se loger, s'habiller et boire de l'eau potable sont les besoins essentiels cités par le cours. Les vacances et la télévision ne sont pas des besoins essentiels.", source: P(1) },
    { id: "geographie-s07-1-q3", fiche: "geographie-s07-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La pauvreté, c'est seulement le fait de manquer de nourriture.",
      corrections: ["Faux : c'est manquer de tout ce qu'il faut pour vivre correctement : nourriture, logement, vêtements, eau potable, mais aussi école, soins et transports.", "Faux : c'est seulement le fait de manquer d'un logement.", "Faux : c'est seulement le fait de ne pas aller à l'école."],
      reponse: { vrai: false, correction: "Faux : c'est manquer de tout ce qu'il faut pour vivre correctement : nourriture, logement, vêtements, eau potable, mais aussi école, soins et transports." },
      explication: "La nourriture n'est qu'un des besoins essentiels. Le pauvre manque aussi de logement, de vêtements, d'eau potable, d'école, de soins et de transports.", source: P(1) },
    { id: "geographie-s07-1-q4", fiche: "geographie-s07-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Une personne pauvre a aussi du mal à se soigner et à aller à l'école.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le cours précise que le pauvre n'a pas accès à l'école, aux soins ni aux transports. La pauvreté ne se limite pas à la faim.", source: P(1) },
    { id: "geographie-s07-1-q5", fiche: "geographie-s07-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi une personne pauvre ne peut-elle pas satisfaire ses besoins essentiels ?",
      choix: ["Parce que ses revenus sont trop faibles", "Parce qu'elle ne sait pas lire", "Parce qu'elle vit dans l'hémisphère Sud", "Parce qu'elle a trop d'enfants"],
      reponse: "Parce que ses revenus sont trop faibles",
      explication: "Tout part du manque d'argent : sans revenus suffisants, impossible de se nourrir, de se loger ou de se soigner correctement. Le reste n'est pas la cause donnée par le cours.", source: P(1) },
    { id: "geographie-s07-1-q6", fiche: "geographie-s07-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi dit-on qu'on est pauvre par rapport à son pays ?",
      choix: ["Parce que ce qu'il faut pour vivre correctement n'est pas le même partout", "Parce que seuls les pays du Sud comptent des pauvres", "Parce que le seuil de pauvreté est exactement le même dans tous les pays", "Parce qu'on compte les pauvres continent par continent, jamais pays par pays"],
      reponse: "Parce que ce qu'il faut pour vivre correctement n'est pas le même partout",
      explication: "Se loger, se nourrir ou se déplacer ne coûte pas la même chose selon le pays. On juge donc la pauvreté d'une personne par rapport à ce qu'il faut pour vivre correctement là où elle vit.", indice: "Pense à ce que coûte un logement ici et ailleurs.", source: P(1) },
    { id: "geographie-s07-1-q7", fiche: "geographie-s07-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la définition.",
      texte: "Être ___, c'est manquer des ___ qu'il faut pour vivre correctement dans son pays.",
      banque: ["pauvre", "ressources", "riche", "inégalités"],
      reponse: [["pauvre"], ["ressources"]],
      explication: "Le pauvre manque des ressources nécessaires pour vivre correctement. Ses revenus ne couvrent pas ses besoins essentiels.", source: P(1) },

    // f2 : ressources matérielles et immatérielles
    { id: "geographie-s07-1-q8", fiche: "geographie-s07-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles ressources le cours range-t-il parmi les ressources matérielles ? (plusieurs réponses)",
      choix: ["L'eau potable", "La nourriture", "Les vêtements", "Le logement", "L'école", "La santé"],
      reponse: ["L'eau potable", "La nourriture", "Les vêtements", "Le logement"],
      explication: "Eau potable, nourriture, vêtements et logement sont des choses concrètes : des ressources matérielles. L'école et la santé sont des ressources immatérielles.", source: P(1) },
    { id: "geographie-s07-1-q9", fiche: "geographie-s07-1-f2", type: "qcm", niveau: 1,
      enonce: "Dans quelle famille le cours range-t-il l'école et la santé ?",
      choix: ["Les ressources immatérielles", "Les ressources matérielles", "Les ressources naturelles", "Les ressources énergétiques"],
      reponse: "Les ressources immatérielles",
      explication: "L'école et la santé sont des services, pas des objets : ce sont des ressources immatérielles. Le transport en fait partie aussi.", source: P(1) },
    { id: "geographie-s07-1-q10", fiche: "geographie-s07-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Le logement est une ressource matérielle.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le logement est une chose concrète, comme l'eau potable, la nourriture et les vêtements. Ce sont les ressources matérielles.", source: P(1) },
    { id: "geographie-s07-1-q11", fiche: "geographie-s07-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le transport est une ressource matérielle, comme la nourriture.",
      corrections: ["Faux : le transport fait partie des ressources immatérielles, avec l'école et la santé.", "Faux : le transport n'est pas une ressource, c'est un loisir.", "Faux : la nourriture est une ressource immatérielle."],
      reponse: { vrai: false, correction: "Faux : le transport fait partie des ressources immatérielles, avec l'école et la santé." },
      explication: "Le transport est un service : une ressource immatérielle. La nourriture, elle, est bien une ressource matérielle.", source: P(1) },
    { id: "geographie-s07-1-q12", fiche: "geographie-s07-1-f2", type: "qcm", niveau: 3,
      enonce: "Une famille a de quoi manger et se loger, mais aucun moyen de se déplacer ni de se soigner. Que lui manque-t-il ?",
      choix: ["Des ressources immatérielles", "Des ressources matérielles", "Rien : elle n'est pas pauvre", "De l'eau potable"],
      reponse: "Des ressources immatérielles",
      explication: "Transport et santé sont des ressources immatérielles. Cette famille a le matériel, mais pas les services.", source: P(1) },
    { id: "geographie-s07-1-q13", fiche: "geographie-s07-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi le cours distingue-t-il deux sortes de ressources ?",
      choix: ["Parce que la pauvreté, ce n'est pas seulement manquer d'objets : c'est aussi manquer de services comme l'école ou les soins", "Parce que seules les ressources matérielles comptent vraiment", "Parce que les ressources immatérielles ne manquent jamais : seules les ressources matérielles peuvent faire défaut aux pauvres", "Parce que l'eau potable est une ressource immatérielle"],
      reponse: "Parce que la pauvreté, ce n'est pas seulement manquer d'objets : c'est aussi manquer de services comme l'école ou les soins",
      explication: "Le pauvre manque de choses concrètes, mais aussi de services. Les deux familles de ressources comptent.", source: P(1) },
    { id: "geographie-s07-1-q14", fiche: "geographie-s07-1-f2", type: "trou", niveau: 1,
      enonce: "Complète avec les deux familles de ressources.",
      texte: "Les ressources ___ sont l'eau potable, la nourriture, les vêtements et le logement ; les ressources ___ sont le transport, l'école et la santé.",
      banque: ["matérielles", "immatérielles", "naturelles", "financières"],
      reponse: [["matérielles"], ["immatérielles"]],
      explication: "Les choses concrètes sont matérielles, les services sont immatériels. Les deux manquent aux pauvres.", source: P(1) },

    // f3 : seuil de pauvreté et extrême pauvreté
    { id: "geographie-s07-1-q15", fiche: "geographie-s07-1-f3", type: "qcm", niveau: 1,
      enonce: "Avec moins de combien d'argent par jour parle-t-on d'extrême pauvreté ?",
      choix: ["Moins de 1,90 dollar", "Moins de 19 dollars", "Moins de 190 dollars", "Moins de 10 dollars"],
      reponse: "Moins de 1,90 dollar",
      explication: "Le seuil est de 1,90 dollar par jour. En dessous, on parle d'extrême pauvreté.", source: P(1) },
    { id: "geographie-s07-1-q16", fiche: "geographie-s07-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le seuil de pauvreté est le revenu au-dessous duquel on considère qu'une personne est pauvre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est une limite de revenu. En dessous, la personne est comptée comme pauvre.", source: P(1) },
    { id: "geographie-s07-1-q17", fiche: "geographie-s07-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on la situation d'une personne qui vit avec moins de 1,90 dollar par jour ?",
      choix: ["L'extrême pauvreté", "L'inégalité", "Le sous-développement", "La richesse relative"],
      reponse: "L'extrême pauvreté",
      explication: "Moins de 1,90 dollar par jour, c'est l'extrême pauvreté. L'inégalité, elle, désigne une différence entre des personnes ou des territoires.", source: P(1) },
    { id: "geographie-s07-1-q18", fiche: "geographie-s07-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le seuil de pauvreté se mesure en nombre d'enfants par femme.",
      corrections: ["Faux : il se mesure en argent disponible par jour, moins de 1,90 dollar.", "Faux : il se mesure en années d'espérance de vie.", "Faux : il se mesure en pourcentage de la population mondiale."],
      reponse: { vrai: false, correction: "Faux : il se mesure en argent disponible par jour, moins de 1,90 dollar." },
      explication: "Le seuil de pauvreté est un revenu par jour. Le nombre d'enfants par femme, c'est le taux de fécondité.", source: P(1) },
    { id: "geographie-s07-1-q19", fiche: "geographie-s07-1-f3", type: "qcm", niveau: 3,
      enonce: "Une personne dispose de 3 dollars par jour, une autre de 1,50 dollar. Laquelle est en extrême pauvreté d'après le seuil du cours ?",
      choix: ["Celle qui a 1,50 dollar", "Celle qui a 3 dollars par jour", "Les deux", "Aucune des deux"],
      reponse: "Celle qui a 1,50 dollar",
      explication: "Le seuil est de 1,90 dollar par jour. Seule la personne qui a 1,50 dollar est en dessous.", indice: "Compare chaque somme à 1,90 dollar.", source: P(1) },
    { id: "geographie-s07-1-q20", fiche: "geographie-s07-1-f3", type: "qcm", niveau: 2,
      enonce: "À quoi sert le seuil de pauvreté ?",
      choix: ["À décider à partir de quel revenu une personne est considérée comme pauvre", "À savoir quels pays se trouvent dans l'hémisphère Sud et lesquels dans l'hémisphère Nord", "À mesurer la croissance de la population", "À calculer l'espérance de vie"],
      reponse: "À décider à partir de quel revenu une personne est considérée comme pauvre",
      explication: "Le seuil fixe une limite de revenu. Il permet de compter les pauvres de la même façon.", source: P(1) },
    { id: "geographie-s07-1-q21", fiche: "geographie-s07-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "En Inde, environ 50 millions de personnes vivent dans l'extrême pauvreté.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, 50 millions d'après le cours. L'Inde en est l'exemple donné.", source: P(1) },
    { id: "geographie-s07-1-q22", fiche: "geographie-s07-1-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "On parle d'___ pauvreté quand une personne vit avec moins de ___ dollar par jour.",
      banque: ["extrême", "1,90", "grande", "19"],
      reponse: [["extrême", "extreme"], ["1,90", "1.90"]],
      explication: "Moins de 1,90 dollar par jour, c'est l'extrême pauvreté. Ce chiffre est le seuil de pauvreté.", source: P(1) },
    { id: "geographie-s07-1-q23", fiche: "geographie-s07-1-f3", type: "qcm", niveau: 3,
      enonce: "Dans un pays du Sud, une famille de cinq personnes gagne 9 dollars par jour. Est-elle en extrême pauvreté d'après le seuil du cours ?",
      choix: ["Oui : 9 dollars pour cinq personnes font 1,80 dollar par personne, sous le seuil", "Non : 9 dollars par jour, c'est bien plus que le seuil de 1,90 dollar, quel que soit le nombre de personnes", "Non : le seuil ne concerne que les enfants", "Oui : toute famille d'un pays du Sud est en extrême pauvreté"],
      reponse: "Oui : 9 dollars pour cinq personnes font 1,80 dollar par personne, sous le seuil",
      explication: "Le seuil se compte par personne et par jour. 9 dollars partagés en cinq font 1,80 dollar chacun, moins que 1,90.", indice: "Divise 9 par 5, puis compare à 1,90.", source: P(1) },

    // f4 : le recul de la pauvreté
    { id: "geographie-s07-1-q24", fiche: "geographie-s07-1-f4", type: "qcm", niveau: 1,
      enonce: "Quelle part de la population mondiale vivait sous le seuil de pauvreté en 1990 ?",
      choix: ["35 %", "8,5 %", "50 %", "1 %"],
      reponse: "35 %",
      explication: "En 1990, 35 % des humains vivaient sous le seuil de pauvreté. C'était presque 2 milliards de personnes.", source: P(1) },
    { id: "geographie-s07-1-q25", fiche: "geographie-s07-1-f4", type: "qcm", niveau: 2,
      enonce: "Quelle part de la population mondiale vivait encore sous le seuil de pauvreté en 2018 ?",
      choix: ["8,5 %", "35 %", "16 %", "50 %"],
      reponse: "8,5 %",
      explication: "En 2018, il restait 8,5 % de la population mondiale sous le seuil. C'est quatre fois moins qu'en 1990.", source: P(1) },
    { id: "geographie-s07-1-q26", fiche: "geographie-s07-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Depuis 1990, la part des habitants de la planète qui vivent sous le seuil de pauvreté a beaucoup baissé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : de 35 % en 1990 à 8,5 % en 2018. La pauvreté recule.", source: P(1) },
    { id: "geographie-s07-1-q28", fiche: "geographie-s07-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "En 2018, plus personne ne vivait dans l'extrême pauvreté.",
      corrections: ["Faux : 8,5 % de la population mondiale, soit plus de 700 millions de personnes, vivaient encore sous le seuil.", "Faux : la moitié de l'humanité vivait encore sous le seuil.", "Faux : 35 % de la population mondiale vivaient encore sous le seuil."],
      reponse: { vrai: false, correction: "Faux : 8,5 % de la population mondiale, soit plus de 700 millions de personnes, vivaient encore sous le seuil." },
      explication: "La pauvreté recule, mais elle n'a pas disparu. En 2018, plus de 700 millions de personnes vivaient encore sous le seuil.", source: P(1) },
    { id: "geographie-s07-1-q29", fiche: "geographie-s07-1-f4", type: "qcm", niveau: 2,
      enonce: "Combien de personnes vivaient encore sous le seuil de pauvreté en 2018 ?",
      choix: ["Plus de 700 millions", "Presque 2 milliards", "50 millions", "7 milliards"],
      reponse: "Plus de 700 millions",
      explication: "Plus de 700 millions de personnes en 2018. Presque 2 milliards, c'était le chiffre de 1990.", source: P(1) },
    { id: "geographie-s07-1-q30", fiche: "geographie-s07-1-f4", type: "qcm", niveau: 3,
      enonce: "Entre 1990 et 2018, la population mondiale a augmenté, et pourtant le nombre de personnes très pauvres est passé de presque 2 milliards à un peu plus de 700 millions. Que peut-on en conclure ?",
      choix: ["La pauvreté recule vraiment : moins de pauvres, dans un monde plus peuplé", "La pauvreté augmente forcément, puisque la population mondiale a augmenté pendant la même période", "Le nombre de pauvres n'a pas changé", "Le seuil de pauvreté a disparu"],
      reponse: "La pauvreté recule vraiment : moins de pauvres, dans un monde plus peuplé",
      explication: "Il y a plus d'humains, mais moins de pauvres : le recul est réel. La part et le nombre ont baissé tous les deux.", source: P(1) },
    { id: "geographie-s07-1-q31", fiche: "geographie-s07-1-f4", type: "qcm", niveau: 3,
      enonce: "Comment la part de la population mondiale sous le seuil de pauvreté a-t-elle évolué de 1990 à 2018 ?",
      choix: ["Elle a été divisée par quatre environ", "Elle a doublé", "Elle est restée stable", "Elle a légèrement augmenté, de quelques points"],
      reponse: "Elle a été divisée par quatre environ",
      explication: "De 35 % à 8,5 %, c'est environ quatre fois moins. La population mondiale, elle, s'est enrichie.", indice: "Compare 35 et 8,5.", source: P(1) },
    { id: "geographie-s07-1-q32", fiche: "geographie-s07-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Comme 8,5 % de la population mondiale, c'est peu, cela représente moins de 100 millions de personnes.",
      corrections: ["Faux : cela fait encore plus de 700 millions de personnes.", "Faux : cela représente presque 2 milliards de personnes.", "Faux : cela représente 50 millions de personnes, toutes en Inde."],
      reponse: { vrai: false, correction: "Faux : cela fait encore plus de 700 millions de personnes." },
      explication: "Sur une population mondiale énorme, 8,5 % font beaucoup de monde : plus de 700 millions de personnes. Un petit pourcentage peut cacher un grand nombre.", source: P(1) },

    // f5 : inégalités et développement
    { id: "geographie-s07-1-q33", fiche: "geographie-s07-1-f5", type: "qcm", niveau: 1,
      enonce: "Quelle part de la richesse mondiale est possédée par 1 % de la population ?",
      choix: ["50 %", "1 %", "10 %", "99 %"],
      reponse: "50 %",
      explication: "Un centième de la population détient la moitié de la richesse mondiale. C'est le signe de très fortes inégalités.", source: P(1) },
    { id: "geographie-s07-1-q34", fiche: "geographie-s07-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le développement, c'est l'amélioration générale des conditions de vie d'une population.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : une population se développe quand ses conditions de vie s'améliorent. Elle peut alors satisfaire ses besoins essentiels.", source: P(1) },
    { id: "geographie-s07-1-q35", fiche: "geographie-s07-1-f5", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce qu'une inégalité, en géographie ?",
      choix: ["Une différence de richesse ou de développement entre des personnes ou des territoires", "Une différence de taille entre deux pays", "Une différence de climat entre le Nord et le Sud", "Une différence d'âge entre les habitants"],
      reponse: "Une différence de richesse ou de développement entre des personnes ou des territoires",
      explication: "L'inégalité porte sur la richesse et le développement. Elle existe entre des personnes comme entre des territoires.", source: P(1) },
    { id: "geographie-s07-1-q36", fiche: "geographie-s07-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Comme la pauvreté recule, les richesses sont aujourd'hui réparties de façon à peu près égale dans le monde.",
      corrections: ["Faux : 1 % de la population possède la moitié de la richesse mondiale ; les inégalités restent très fortes.", "Faux : la pauvreté ne recule pas.", "Faux : les richesses sont réparties également, mais seulement dans les pays du Sud."],
      reponse: { vrai: false, correction: "Faux : 1 % de la population possède la moitié de la richesse mondiale ; les inégalités restent très fortes." },
      explication: "Moins de pauvres ne veut pas dire partage égal. Une toute petite minorité garde la moitié des richesses.", source: P(1) },
    { id: "geographie-s07-1-q37", fiche: "geographie-s07-1-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Quels besoins essentiels un pays développé permet-il à sa population de satisfaire ? (plusieurs réponses)",
      choix: ["L'eau", "Les soins", "Le logement", "L'éducation", "Les voyages à l'étranger", "Une voiture par personne"],
      reponse: ["L'eau", "Les soins", "Le logement", "L'éducation"],
      explication: "Eau, alimentation, soins, logement et éducation sont les besoins essentiels liés au développement. Voyages et voitures n'en font pas partie.", source: P(1) },
    { id: "geographie-s07-1-q38", fiche: "geographie-s07-1-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire à la fois que la pauvreté recule et que le monde reste très inégal ?",
      choix: ["Moins de gens sont très pauvres, mais une toute petite minorité garde la moitié des richesses", "Parce que la pauvreté ne recule que dans les pays du Nord, tandis qu'elle augmente partout dans les pays du Sud", "Parce que la population mondiale diminue", "Parce que le seuil de pauvreté a été supprimé"],
      reponse: "Moins de gens sont très pauvres, mais une toute petite minorité garde la moitié des richesses",
      explication: "Les deux faits sont vrais en même temps. La part des très pauvres baisse, mais 1 % de la population possède 50 % de la richesse.", source: P(1) },
    { id: "geographie-s07-1-q39", fiche: "geographie-s07-1-f5", type: "association", niveau: 3,
      enonce: "Relie chaque mot à sa définition.",
      gauche: ["Inégalité", "Développement", "Seuil de pauvreté", "Extrême pauvreté"],
      droite: ["Vivre avec moins de 1,90 dollar par jour", "Différence de richesse ou de développement entre personnes ou territoires", "Revenu au-dessous duquel on est considéré comme pauvre", "Amélioration générale des conditions de vie d'une population"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "L'inégalité est une différence, le développement une amélioration. Le seuil est une limite de revenu, l'extrême pauvreté la vie sous 1,90 dollar par jour.", source: P(1) },
    { id: "geographie-s07-1-q40", fiche: "geographie-s07-1-f5", type: "trou", niveau: 1,
      enonce: "Complète avec les mots du cours.",
      texte: "Le ___ est l'amélioration générale des conditions de vie ; une ___ est une différence de richesse entre des personnes ou des territoires.",
      banque: ["développement", "inégalité", "seuil", "revenu"],
      reponse: [["développement", "developpement"], ["inégalité", "inegalite"]],
      explication: "Le développement améliore les conditions de vie. L'inégalité mesure l'écart de richesse ou de développement.", source: P(1) }
  ],
  bonus: [
    {
      id: "geographie-s07-1-b1",
      fiche: "geographie-s07-1-f3",
      titre: "Un seuil qui bouge avec les prix",
      texte: "Le seuil de 1,90 dollar du cours a depuis été relevé : la Banque mondiale compte aujourd'hui les très pauvres sous 3 dollars par jour, en prix de 2021. Même avec ce seuil plus haut, leur nombre est passé d'environ 2,3 milliards en 1990 à moins de 840 millions en 2026.",
      source: { titre: "Poverty – Overview", editeur: "Banque mondiale", url: "https://www.worldbank.org/en/topic/poverty/overview" }
    }
  ],
  nonCouvert: [
    "Le PDF du cours 2 n'est pas encore déposé dans DEPOT/ : seul son texte, lu sur le Drive, a servi ; les cartes, schémas et photos ne sont connus que par leurs légendes.",
    "La vidéo du cours n'est pas déposée : ce qu'elle ajoute au support n'est pas repris.",
    "La valeur du graphique pour 2030 (projection) n'est pas lisible dans le texte extrait.",
    "La partie I.B « Comment mesurer la richesse et la pauvreté ? » (page 2) est traitée dans l'outil 9 (geographie-s08-1).",
    "La partie II « Des inégalités à différentes échelles » (pages 3-4), le dossier sur le Bénin (page 7) et la carte à colorier (page 8) attendent la 2e partie du cours (semaine 9)."
  ]
};
