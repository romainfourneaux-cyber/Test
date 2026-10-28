// Source en clair du cours geographie-s07-1 « Cours 2 – 1re partie – Richesse et pauvreté dans le monde ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js geographie-s07-1.
// Seule source : le cours 2 du thème 1 (texte lu sur le Drive, 8 pages ; le PDF n'est pas encore déposé dans
// DEPOT/, les pages citées sont celles des repères « === page n === » de l'extraction), partie I.A
// « Qu'est-ce que la pauvreté ? » (page 1). La partie I.B (mesurer, page 2) nourrit l'outil 9 (geographie-s08-1) ;
// la partie II (pages 3-4) et les exercices des pages 7-8 attendent la 2e partie du cours (semaine 9).
// Fiches de programme (règle du 28/10/2026, sous-thème « Répartition de la richesse et de la pauvreté dans le monde ») :
// f6 (le seuil d'extrême pauvreté de la Banque mondiale, relevé en 2022 et 2025) et f7 (le seuil relatif de la France),
// faits relus le 28/10/2026 sur les pages de la Banque mondiale, de l'INSEE et de Wikipédia citées ; leurs questions
// sont des questions de thème. Le livret garde son seuil de 1,90 dollar (celui de 2015) : f6 le date sans le contredire.
// Devoir n° 2 (semaine 11) non déposé : aucune question « définis » sur le vocabulaire du livret.
// Relecture sceptique du 28/10/2026 : les 2,3 milliards de 1990 sont comptés avec le seuil de 3 dollars (pas avec celui
// de 1990), f6 et q45 le disent ; deux leurres qui insinuaient une manipulation des chiffres (q43, q51) remplacés.
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 2.pdf";
const P = (page) => ({ fichier: F, page: page });
const THEME = "Cours 2 – 1re partie – Richesse et pauvreté dans le monde";
const T = (titre, editeur, url) => ({ theme: THEME, titre: titre, editeur: editeur, url: url });
const PROG = "Répartition de la richesse et de la pauvreté dans le monde";
const PR = (titre, editeur, url) => ({ programme: PROG, titre: titre, editeur: editeur, url: url });
const BM = "Banque mondiale";
const U_BM = "https://www.worldbank.org/en/topic/poverty/overview";
const U_BM22 = "https://www.worldbank.org/en/news/factsheet/2022/05/02/fact-sheet-an-adjustment-to-global-poverty-lines";
const U_BM25 = "https://www.worldbank.org/en/news/factsheet/2025/06/05/june-2025-update-to-global-poverty-lines";
const U_INSEE = "https://www.insee.fr/fr/statistiques/8600989";
const U_MEDIANE = "https://www.insee.fr/fr/metadonnees/definition/c1376";
const U_SEUIL = "https://fr.wikipedia.org/wiki/Seuil_de_pauvret%C3%A9";
const U_TIERS = "https://fr.wikipedia.org/wiki/Tiers_monde";

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
    },
    {
      id: "geographie-s07-1-f6", notion: "Le seuil d'extrême pauvreté de la Banque mondiale",
      titre: "1,90, puis 2,15, puis 3 dollars par jour",
      texte: "La Banque mondiale fixe le seuil d'extrême pauvreté. Il monte avec les prix : 1,90 dollar par jour en 2015 2,15 dollars en 2022, 3 dollars depuis 2025. Avec ce seuil de 3 dollars, on compte environ 2,3 milliards de très pauvres en 1990 et environ 840 millions aujourd'hui, de plus en plus souvent en Afrique subsaharienne.",
      pointsCles: [
        "Le seuil est relevé quand les prix montent : 1 dollar (1990), 1,90 dollar (2015), 2,15 dollars (2022), 3 dollars (2025)",
        "Avec le seuil de 3 dollars : environ 2,3 milliards de personnes en 1990, environ 840 millions en 2022 (le livret, avec l'ancien seuil de 1,90 dollar, dit presque 2 milliards en 1990 et plus de 700 millions en 2018)",
        "L'extrême pauvreté se concentre de plus en plus en Afrique subsaharienne et dans les pays en guerre",
        "Depuis une dizaine d'années, le recul ralentit : croissance faible, dettes, Covid, conflits, sécheresses et inondations",
        "Le livret garde le seuil de 2015 (1,90 dollar) : les deux chiffres sont justes, chacun à sa date"
      ],
      astuce: "Trois seuils, trois dates qui montent : 1,90 en 2015, 2,15 en 2022, 3 en 2025.",
      dates: [
        { annee: 1990, evenement: "Premier seuil de la Banque mondiale : 1 dollar par jour" },
        { annee: 2015, evenement: "Seuil d'extrême pauvreté porté à 1,90 dollar par jour" },
        { annee: 2022, evenement: "Seuil porté à 2,15 dollars par jour" },
        { annee: 2025, evenement: "Seuil porté à 3 dollars par jour" }
      ],
      lieux: ["Afrique subsaharienne"], personnages: [],
      vocabulaire: [
        { mot: "Banque mondiale", def: "une institution internationale qui prête de l'argent aux pays pauvres et mesure la pauvreté dans le monde" },
        { mot: "pouvoir d'achat", def: "ce qu'on peut acheter avec une somme d'argent ; il baisse quand les prix montent" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f3", "geographie-s07-1-f4"],
      source: PR("Poverty – Overview", BM, U_BM)
    },
    {
      id: "geographie-s07-1-f7", notion: "Pauvre en France : le seuil relatif",
      titre: "Pauvre en France, pauvre au Burkina : deux seuils",
      texte: "Le seuil de la Banque mondiale est absolu : la même somme pour tous. En France, l'INSEE utilise un seuil relatif : moins de 60 % du niveau de vie médian, celui qui coupe la population en deux moitiés. En 2023, cela fait 1 288 euros par mois pour une personne seule ; 15,4 % des habitants vivent en dessous.",
      pointsCles: [
        "Seuil absolu (Banque mondiale) : une somme fixe, 3 dollars par jour, la même du Burkina Faso à la France",
        "Seuil relatif (France, Europe) : 60 % du niveau de vie médian du pays",
        "Médiane : la valeur qui partage la population en deux moitiés égales (INSEE)",
        "2023 : 1 288 euros par mois pour une personne seule, 1 932 euros pour un couple",
        "15,4 % de pauvres en France en 2023 (14,4 % en 2022), soit 9,8 millions de personnes"
      ],
      dates: [{ annee: 2023, evenement: "Seuil de pauvreté français : 1 288 euros par mois pour une personne seule" }],
      lieux: ["France"], personnages: [],
      vocabulaire: [
        { mot: "médiane", def: "la valeur qui partage une population en deux moitiés égales : autant de gens au-dessus qu'en dessous" },
        { mot: "seuil relatif", def: "un seuil de pauvreté calculé par rapport au niveau de vie du pays, comme 60 % de la médiane en France" },
        { mot: "INSEE", def: "l'Institut national de la statistique, qui compte les habitants et mesure les revenus en France" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f3", "geographie-s07-1-f6"],
      source: PR("Niveau de vie et pauvreté en 2023 (Insee Première n° 2063)", "INSEE", U_INSEE)
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
      explication: "Le développement améliore les conditions de vie. L'inégalité mesure l'écart de richesse ou de développement.", source: P(1) },

    // f6 : le seuil d'extrême pauvreté de la Banque mondiale (fiche de programme : questions de thème)
    { id: "geographie-s07-1-q41", fiche: "geographie-s07-1-f6", type: "qcm", niveau: 1,
      enonce: "Quel est aujourd'hui le seuil d'extrême pauvreté fixé par la Banque mondiale ?",
      choix: ["3 dollars par jour", "1,90 dollar par jour, comme dans le livret", "30 dollars par jour", "3 dollars par mois"],
      reponse: "3 dollars par jour",
      explication: "Depuis 2025, le seuil est de 3 dollars par jour. Le livret donne 1,90 dollar : c'était le seuil de 2015.",
      source: T("June 2025 Update to Global Poverty Lines", BM, U_BM25) },
    { id: "geographie-s07-1-q42", fiche: "geographie-s07-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Le seuil de 1,90 dollar par jour donné par le cours est celui que la Banque mondiale a fixé en 2015.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1,90 dollar a été le seuil de 2015 à 2022. Il a ensuite été relevé à 2,15 dollars, puis à 3 dollars.",
      source: T("Fact Sheet: An Adjustment to Global Poverty Lines", BM, U_BM22) },
    { id: "geographie-s07-1-q43", fiche: "geographie-s07-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi la Banque mondiale relève-t-elle régulièrement son seuil d'extrême pauvreté ?",
      choix: ["Parce que les prix montent : avec la même somme, on achète moins qu'avant", "Parce que la population mondiale augmente et qu'il faut compter plus de monde", "Parce que le dollar a été remplacé par l'euro", "Parce que les pauvres gagnent plus"],
      reponse: "Parce que les prix montent : avec la même somme, on achète moins qu'avant",
      explication: "Le seuil suit le coût de la nourriture, des vêtements et du logement dans les pays pauvres. Quand ces prix montent, il faut plus de dollars pour le même minimum.",
      source: T("Fact Sheet: An Adjustment to Global Poverty Lines", BM, U_BM22) },
    { id: "geographie-s07-1-q44", fiche: "geographie-s07-1-f6", type: "ordre", niveau: 2,
      enonce: "Range ces seuils de la Banque mondiale du plus ancien au plus récent.",
      elements: ["2,15 dollars par jour", "1 dollar par jour", "3 dollars par jour", "1,90 dollar par jour"],
      reponse: [1, 3, 0, 2],
      explication: "1 dollar en 1990, 1,90 dollar en 2015, 2,15 dollars en 2022, puis 3 dollars à la mise à jour de 2025. Le seuil monte avec les prix.",
      source: T("Fact Sheet: An Adjustment to Global Poverty Lines", BM, U_BM22) },
    { id: "geographie-s07-1-q45", fiche: "geographie-s07-1-f6", type: "qcm", niveau: 2,
      enonce: "Combien de personnes vivent aujourd'hui sous le seuil d'extrême pauvreté, d'après la Banque mondiale ?",
      choix: ["Environ 840 millions", "Environ 2,3 milliards, comme en 1990", "Environ 50 millions", "Environ 4 milliards, la moitié de l'humanité"],
      reponse: "Environ 840 millions",
      explication: "Environ 840 millions de personnes en 2022, contre 2,3 milliards en 1990, comptées avec le même seuil de 3 dollars. Le nombre a beaucoup baissé, même si le seuil a été relevé.",
      source: T("Poverty – Overview", BM, U_BM) },
    { id: "geographie-s07-1-q46", fiche: "geographie-s07-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Les personnes en extrême pauvreté vivent de plus en plus souvent en Afrique subsaharienne.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la Banque mondiale note que l'extrême pauvreté se concentre de plus en plus en Afrique subsaharienne et dans les pays touchés par la guerre. Dans le reste du monde, elle a davantage reculé.",
      source: T("Poverty – Overview", BM, U_BM) },
    { id: "geographie-s07-1-q47", fiche: "geographie-s07-1-f6", type: "qcm", niveau: 3,
      enonce: "En 2025, le seuil passe de 2,15 à 3 dollars par jour. Une personne vit avec 2,50 dollars par jour. Est-elle comptée parmi les très pauvres ?",
      choix: ["Avant 2025, non ; depuis 2025, oui : elle est passée sous le nouveau seuil", "Oui dans les deux cas, car 2,50 dollars par jour reste de toute façon une très petite somme", "Non dans les deux cas", "Avant 2025, oui ; depuis 2025, non"],
      reponse: "Avant 2025, non ; depuis 2025, oui : elle est passée sous le nouveau seuil",
      explication: "2,50 est au-dessus de 2,15 mais en dessous de 3. Relever le seuil fait entrer de nouvelles personnes dans le compte : c'est pourquoi le nombre de très pauvres a été revu à la hausse en 2025.",
      indice: "Compare 2,50 à chacun des deux seuils.",
      source: T("June 2025 Update to Global Poverty Lines", BM, U_BM25) },
    { id: "geographie-s07-1-q48", fiche: "geographie-s07-1-f6", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Depuis 2025, la Banque mondiale fixe le seuil d'extrême pauvreté à ___ dollars par jour ; le livret donne l'ancien seuil de ___ dollar, fixé en 2015.",
      banque: ["3", "1,90", "30", "19"],
      reponse: [["3"], ["1,90", "1.90"]],
      explication: "3 dollars aujourd'hui, 1,90 dollar en 2015. Le seuil monte quand les prix montent.",
      source: T("June 2025 Update to Global Poverty Lines", BM, U_BM25) },

    // f7 : le seuil relatif de la France (fiche de programme : questions de thème)
    { id: "geographie-s07-1-q49", fiche: "geographie-s07-1-f7", type: "qcm", niveau: 1,
      enonce: "En France, à partir de quand une personne est-elle considérée comme pauvre ?",
      choix: ["Quand elle vit avec moins de 60 % du niveau de vie médian", "Quand elle vit avec moins de 3 dollars par jour, comme dans le reste du monde", "Quand elle n'a pas de voiture", "Quand elle gagne moins que le salaire minimum, le SMIC"],
      reponse: "Quand elle vit avec moins de 60 % du niveau de vie médian",
      explication: "La France utilise un seuil relatif : 60 % du niveau de vie médian. En 2023, cela fait 1 288 euros par mois pour une personne seule.",
      source: T("Niveau de vie et pauvreté en 2023", "INSEE", U_INSEE) },
    { id: "geographie-s07-1-q50", fiche: "geographie-s07-1-f7", type: "vrai_faux", niveau: 1,
      enonce: "En 2023, le seuil de pauvreté en France est d'environ 1 300 euros par mois pour une personne seule.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1 288 euros par mois, d'après l'INSEE. Pour un couple, le seuil monte à 1 932 euros.",
      source: T("Niveau de vie et pauvreté en 2023", "INSEE", U_INSEE) },
    { id: "geographie-s07-1-q51", fiche: "geographie-s07-1-f7", type: "qcm", niveau: 2,
      enonce: "Pourquoi le seuil de pauvreté français est-il bien plus élevé que celui de la Banque mondiale ?",
      choix: ["Parce qu'il est relatif : il dépend du niveau de vie en France, où tout coûte plus cher", "Parce qu'il est calculé par mois et non par jour, ce qui gonfle beaucoup le chiffre final", "Parce que l'euro vaut cent fois plus que le dollar", "Parce que les Français ont plus d'enfants"],
      reponse: "Parce qu'il est relatif : il dépend du niveau de vie en France, où tout coûte plus cher",
      explication: "Le seuil français se calcule par rapport aux revenus des Français : il mesure qui est pauvre dans son pays. Le seuil de la Banque mondiale mesure l'extrême pauvreté, avec la même somme partout.",
      source: T("Seuil de pauvreté", "Wikipédia", U_SEUIL) },
    { id: "geographie-s07-1-q52", fiche: "geographie-s07-1-f7", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce que le niveau de vie médian ?",
      choix: ["Le niveau de vie qui coupe la population en deux moitiés : autant de gens au-dessus qu'en dessous", "Le niveau de vie moyen, obtenu en additionnant tous les revenus et en divisant par le nombre d'habitants", "Le niveau de vie des personnes les plus riches", "Le niveau de vie minimum fixé par la loi"],
      reponse: "Le niveau de vie qui coupe la population en deux moitiés : autant de gens au-dessus qu'en dessous",
      explication: "La médiane partage la population en deux parts égales. Ce n'est pas la moyenne, que quelques très gros revenus peuvent tirer vers le haut.",
      source: T("Médiane (définition)", "INSEE", U_MEDIANE) },
    { id: "geographie-s07-1-q53", fiche: "geographie-s07-1-f7", type: "vrai_faux", niveau: 2,
      enonce: "Dans un pays riche comme la France, il n'y a presque plus de pauvres.",
      corrections: ["Faux : en 2023, 15,4 % des habitants, soit 9,8 millions de personnes, vivaient sous le seuil de pauvreté.", "Faux : la moitié des Français vivent sous le seuil de pauvreté.", "Faux : il n'y a aucun pauvre en France, mais beaucoup au Burkina Faso."],
      reponse: { vrai: false, correction: "Faux : en 2023, 15,4 % des habitants, soit 9,8 millions de personnes, vivaient sous le seuil de pauvreté." },
      explication: "Il y a des pauvres dans les pays riches : 9,8 millions en France en 2023, d'après l'INSEE. Le taux était de 14,4 % en 2022.",
      source: T("Niveau de vie et pauvreté en 2023", "INSEE", U_INSEE) },
    { id: "geographie-s07-1-q54", fiche: "geographie-s07-1-f7", type: "association", niveau: 2,
      enonce: "Relie chaque expression à ce qu'elle désigne.",
      gauche: ["Seuil absolu", "Seuil relatif", "Niveau de vie médian", "Extrême pauvreté"],
      droite: ["Une somme fixe, la même pour tous les pays", "Un pourcentage du niveau de vie du pays", "La valeur qui coupe la population en deux moitiés", "Vivre sous le seuil de la Banque mondiale"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Le seuil absolu compare le monde entier avec une même somme ; le relatif compare chacun à son pays. La médiane sert de base au seuil relatif.",
      source: T("Seuil de pauvreté", "Wikipédia", U_SEUIL) },
    { id: "geographie-s07-1-q55", fiche: "geographie-s07-1-f7", type: "qcm", niveau: 3,
      enonce: "Un habitant de France vit avec 1 100 euros par mois. Est-il pauvre ?",
      choix: ["Oui selon le seuil français (moins de 1 288 euros), non selon le seuil de la Banque mondiale (3 dollars par jour)", "Non selon les deux seuils, car 1 100 euros par mois reste une somme confortable dans la plupart des pays du monde aujourd'hui", "Oui selon les deux seuils", "Non selon le seuil français, oui selon la Banque mondiale"],
      reponse: "Oui selon le seuil français (moins de 1 288 euros), non selon le seuil de la Banque mondiale (3 dollars par jour)",
      explication: "1 100 euros, c'est moins que 1 288 : pauvre en France. Mais c'est environ 36 euros par jour, bien plus que 3 dollars : pas en extrême pauvreté au sens mondial.",
      indice: "Compare 1 100 à 1 288, puis divise 1 100 par 30.",
      source: T("Niveau de vie et pauvreté en 2023", "INSEE", U_INSEE) },
    { id: "geographie-s07-1-q56", fiche: "geographie-s07-1-f7", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En France, est pauvre celui qui vit avec moins de ___ % du niveau de vie ___.",
      banque: ["60", "médian", "10", "moyen"],
      reponse: [["60"], ["médian", "median"]],
      explication: "60 % du niveau de vie médian : c'est le seuil relatif de l'INSEE. En 2023, cela fait 1 288 euros par mois pour une personne seule.",
      source: T("Niveau de vie et pauvreté en 2023", "INSEE", U_INSEE) }
  ],
  bonus: [
    {
      id: "geographie-s07-1-b1",
      fiche: "geographie-s07-1-f6",
      titre: "Le seuil de 3 dollars vient du Burkina Faso",
      texte: "Pour fixer son seuil de 2025, la Banque mondiale a rassemblé les seuils de pauvreté nationaux de 23 pays à faible revenu et a pris celui du milieu : 3,04 dollars par jour, le seuil du Burkina Faso en 2022. Arrondi à 3 dollars, il est devenu le seuil d'extrême pauvreté du monde entier.",
      source: { titre: "June 2025 Update to Global Poverty Lines", editeur: "Banque mondiale", url: U_BM25 }
    },
    {
      id: "geographie-s07-1-b2",
      fiche: "geographie-s07-1-f5",
      titre: "Tiers-monde : un mot de 1952",
      texte: "Le 14 août 1952, le démographe français Alfred Sauvy lance l'expression « tiers-monde » dans un article de L'Observateur intitulé « Trois mondes, une planète ». Il pense au tiers état de la Révolution française, qui réclamait sa place. Le mot a désigné les pays pauvres d'Afrique, d'Asie et d'Amérique ; les géographes parlent aujourd'hui plutôt de pays en développement et de PMA.",
      source: { titre: "Tiers monde", editeur: "Wikipédia, l'encyclopédie libre", url: U_TIERS }
    }
  ],
  nonCouvert: [
    "Le PDF du cours 2 n'est pas encore déposé dans DEPOT/ : seul son texte, lu sur le Drive, a servi ; les cartes, schémas et photos ne sont connus que par leurs légendes.",
    "La vidéo du cours n'est pas déposée : ce qu'elle ajoute au support n'est pas repris.",
    "La valeur du graphique pour 2030 (projection) n'est pas lisible dans le texte extrait.",
    "La partie I.B « Comment mesurer la richesse et la pauvreté ? » (page 2) est traitée dans l'outil 9 (geographie-s08-1).",
    "La répartition Nords/Suds, les pays émergents, les pays pétroliers et les PMA, attendus par le programme, sont dans la partie II du cours (pages 3-4, semaine 9) : ils ne sont pas repris ici, pas plus que le dossier sur le Bénin (page 7) et la carte à colorier (page 8).",
    "Les inégalités à l'intérieur des pays et des villes (ségrégation spatiale, pauvreté des campagnes), attendues par le programme, relèvent aussi de la partie II (semaine 9).",
    "Les seuils intermédiaires de la Banque mondiale (4,20 et 8,30 dollars par jour selon le niveau de revenu du pays) ne sont pas enseignés."
  ]
};
