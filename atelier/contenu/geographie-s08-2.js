// Source en clair du cours geographie-s08-2 « Étude de cas 3 – L'éducation en Afghanistan et en Finlande ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js geographie-s08-2.
// Seule source : l'étude de cas n° 3 (2 pages : texte sur l'école en Afghanistan, photos, carte du taux
// d'alphabétisation 2018, texte sur le parcours scolaire d'une jeune Finlandaise, tableau comparatif des deux pays).
// Ton neutre : les talibans sont seulement nommés comme le pouvoir en place, sans qualificatif ni détail violent.
// 28/10/2026 (programme officiel, sous-thème « Répartition de la richesse et de la pauvreté dans le monde ») : le dépôt
// couvre le programme, aucune fiche de programme n'est nécessaire ; ajout d'une question à f3, f5 et f6 (q51 est une
// question de thème, UNESCO) et d'un bonus b3 (lois Jules Ferry). Devoir n° 2 (semaine 11) non déposé : prudence.
const F = "cours/geographie/Geo 5e - Theme 1 - Etude de cas 3.pdf";
const P = (page) => ({ fichier: F, page: page });
const THEME = "Étude de cas 3 – L’éducation en Afghanistan et en Finlande";
const T = (titre, editeur, url) => ({ theme: THEME, titre: titre, editeur: editeur, url: url });
const U_UNESCO = "https://www.unesco.org/fr/literacy/need-know";
const U_FERRY = "https://fr.wikipedia.org/wiki/Lois_Jules_Ferry";

// Schéma redessiné : quatre lignes du tableau comparatif, en barres (Afghanistan en rouge, Finlande en bleu).
function schemaComparaison() {
  const encre = "#2e2419";
  const lignes = [
    ["Espérance de vie", "53 ans", 53 / 81, "81 ans", 1],
    ["PIB par habitant (2019)", "2 000 $", 2000 / 48600, "48 600 $", 1],
    ["Élèves par classe", "43", 1, "15", 15 / 43],
    ["Savent lire et écrire", "43 %", 0.43, "presque 100 %", 1]
  ];
  let s = "<svg viewBox='0 0 560 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='12'>";
  s += "<text x='280' y='22' text-anchor='middle' font-size='15' fill='" + encre + "'>Afghanistan et Finlande : quatre comparaisons</text>";
  s += "<rect x='150' y='34' width='12' height='10' fill='#b5452f'/><text x='168' y='43' fill='" + encre + "'>Afghanistan</text>";
  s += "<rect x='300' y='34' width='12' height='10' fill='#2f5e8e'/><text x='318' y='43' fill='" + encre + "'>Finlande</text>";
  lignes.forEach((l, i) => {
    const y = 64 + 58 * i, L = 220;
    s += "<text x='10' y='" + (y + 20) + "' fill='" + encre + "' font-weight='bold'>" + l[0] + "</text>";
    const wa = Math.max(4, Math.round(L * l[2])), wf = Math.max(4, Math.round(L * l[4]));
    s += "<rect x='200' y='" + y + "' width='" + wa + "' height='16' fill='#b5452f'/>";
    s += "<text x='" + (206 + wa) + "' y='" + (y + 13) + "' fill='" + encre + "'>" + l[1] + "</text>";
    s += "<rect x='200' y='" + (y + 22) + "' width='" + wf + "' height='16' fill='#2f5e8e'/>";
    s += "<text x='" + (206 + wf) + "' y='" + (y + 35) + "' fill='" + encre + "'>" + l[3] + "</text>";
  });
  return s + "</svg>";
}

module.exports = {
  id: "geographie-s08-2",
  fiches: [
    {
      id: "geographie-s08-2-f1", notion: "La situation scolaire en Afghanistan",
      titre: "Une école en grande difficulté",
      texte: "L'Afghanistan, en guerre depuis plus de quarante ans, a un analphabétisme parmi les plus forts du monde. Près d'un enfant sur deux ne va pas à l'école ; 55 % des garçons et 30 % des jeunes femmes savent lire. La moitié des 12 000 écoles publiques n'ont pas de bâtiment : classe par terre, dehors ou sous une tente.",
      pointsCles: [
        "Un pays en guerre depuis plus de quarante ans",
        "Près de la moitié des enfants de 7 à 17 ans ne vont pas à l'école",
        "Savent lire et écrire : 55 % des garçons, 30 % des jeunes femmes",
        "12 000 écoles publiques, la moitié sans locaux ; matériel réduit à un tableau noir et des ardoises"
      ],
      dates: [], lieux: ["Afghanistan", "Kaboul"], personnages: [],
      vocabulaire: [
        { mot: "scolarisation", def: "le fait d'aller à l'école" },
        { mot: "taux d'alphabétisation", def: "la part des habitants qui savent lire et écrire" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f2", "geographie-s08-1-f2"], source: P(1)
    },
    {
      id: "geographie-s08-2-f2", notion: "Les freins à la scolarisation en Afghanistan",
      titre: "Pourquoi tant d'enfants restent loin de l'école",
      texte: "Les talibans ont dirigé l'Afghanistan de 1996 à 2001 et ont repris le pouvoir en 2021. Aller à l'école est dangereux : en 2018, 200 écoles ont été attaquées, surtout celles des filles. Au moins 20 % des enfants travaillent pour aider leur famille. Dans le sud, près de Kandahar, les filles, mariées très jeunes, quittent l'école.",
      pointsCles: [
        "Les talibans : au pouvoir de 1996 à 2001, de retour en 2021 ; ils cherchent à décourager les filles d'aller à l'école",
        "2018 : 200 écoles attaquées dans le pays",
        "Au moins 20 % des enfants travaillent (champs, ateliers), parfois dès 5 ans",
        "Éducation des filles mal vue dans le sud, près de Kandahar ; mariées très jeunes, elles quittent l'école"
      ],
      dates: [
        { annee: 1996, evenement: "Les talibans prennent le pouvoir en Afghanistan" },
        { annee: 2001, evenement: "Fin du premier pouvoir des talibans" },
        { annee: 2018, evenement: "200 écoles attaquées en Afghanistan" },
        { annee: 2021, evenement: "Les talibans reprennent le pouvoir" }
      ],
      lieux: ["Afghanistan", "Kandahar"], personnages: [],
      vocabulaire: [
        { mot: "travail des enfants", def: "le fait, pour un enfant, de travailler aux champs ou dans un atelier au lieu d'aller à l'école" }
      ],
      schema: null, prerequis: ["geographie-s08-2-f1"], source: P(1)
    },
    {
      id: "geographie-s08-2-f3", notion: "L'école en Finlande",
      titre: "Une école gratuite jusqu'à l'université",
      texte: "En Finlande, l'école est obligatoire de 7 à 16 ans et gratuite. Le dentiste de l'école soigne les élèves sans frais, la cantine ne coûte rien, le conservatoire presque rien. Le lycée est gratuit, repas compris ; on y passe le baccalauréat à 18 ans. L'université aussi est gratuite, et grâce à l'État, une chambre d'étudiant coûte moitié prix.",
      pointsCles: [
        "École obligatoire de 7 à 16 ans",
        "Gratuit : l'école, le dentiste scolaire, la cantine, le lycée, l'université ; conservatoire presque gratuit",
        "Baccalauréat à 18 ans ; chambre d'étudiant à moitié prix grâce à l'État",
        "36 % des Finlandaises ont une formation universitaire : les plus éduquées d'Europe"
      ],
      dates: [], lieux: ["Finlande"], personnages: [],
      vocabulaire: [
        { mot: "scolarité obligatoire", def: "les années pendant lesquelles la loi oblige les enfants à aller à l'école" }
      ],
      schema: null, prerequis: ["geographie-s08-2-f1"], source: P(2)
    },
    {
      id: "geographie-s08-2-f4", notion: "Afghanistan et Finlande : population et richesse",
      titre: "Deux pays, deux niveaux de développement",
      texte: "Le tableau compare les deux pays. L'Afghanistan compte 38 millions d'habitants, la Finlande 5,5 millions, soit sept fois moins. Un Afghan vit en moyenne 53 ans, un Finlandais 81. Le PIB par habitant atteint 2 000 dollars en Afghanistan contre 48 600 en Finlande (2019). Les familles afghanes ont 4,7 enfants par femme, les finlandaises 1,74.",
      pointsCles: [
        "Population : 38 millions (Afghanistan) contre 5,5 millions (Finlande)",
        "Espérance de vie : 53 ans contre 81 ans",
        "PIB par habitant (2019) : 2 000 dollars contre 48 600 dollars",
        "Fécondité : 4,7 enfants par femme contre 1,74"
      ],
      dates: [], lieux: ["Afghanistan", "Finlande"], personnages: [],
      vocabulaire: [],
      schema: "geographie-s08-2-s1", prerequis: ["geographie-s08-1-f1", "geographie-s08-1-f4", "geographie-s01-2-f3"], source: P(2)
    },
    {
      id: "geographie-s08-2-f5", notion: "Afghanistan et Finlande : deux écoles",
      titre: "Deux écoles que tout oppose",
      texte: "Côté école, le contraste est net. L'Afghanistan consacre 4,1 % de son PIB à l'éducation, la Finlande 6,4 %. Une classe afghane compte 43 élèves, une classe finlandaise 15. L'école est obligatoire de 7 à 15 ans en Afghanistan, de 7 à 16 ans en Finlande. 43 % des Afghans savent lire et écrire, contre presque 100 % des Finlandais.",
      pointsCles: [
        "Part du PIB pour l'éducation : 4,1 % contre 6,4 %",
        "Élèves par classe : 43 contre 15",
        "École obligatoire : de 7 à 15 ans contre de 7 à 16 ans",
        "Savent lire et écrire : 43 % des Afghans contre presque 100 % des Finlandais"
      ],
      dates: [], lieux: ["Afghanistan", "Finlande"], personnages: [],
      vocabulaire: [],
      schema: "geographie-s08-2-s1", prerequis: ["geographie-s08-2-f4", "geographie-s08-2-f3"], source: P(2)
    },
    {
      id: "geographie-s08-2-f6", notion: "L'alphabétisation dans le monde",
      titre: "Savoir lire : une carte très inégale",
      texte: "La carte de 2018 montre la part des habitants qui savent lire et écrire. Elle dépasse 95 % en Europe, en Amérique du Nord, en Russie et en Australie. Elle tombe sous 50 % dans plusieurs pays d'Afrique et en Afghanistan. L'Afrique est le continent où les taux d'alphabétisation sont les plus faibles.",
      pointsCles: [
        "Plus de 95 % : Europe, Amérique du Nord, Russie, Australie",
        "Moins de 50 % : plusieurs pays d'Afrique, Afghanistan",
        "L'Afrique est le continent le moins alphabétisé"
      ],
      dates: [], lieux: ["Afrique", "Europe", "Amérique du Nord", "Russie", "Australie", "Afghanistan"], personnages: [],
      vocabulaire: [
        { mot: "analphabétisme", def: "le fait de ne savoir ni lire ni écrire, souvent parce qu'on n'a pas pu l'apprendre" }
      ],
      schema: null, prerequis: ["geographie-s08-2-f1", "geographie-s08-1-f3"], source: P(1)
    }
  ],
  schemas: [
    { id: "geographie-s08-2-s1", legende: "Afghanistan et Finlande : espérance de vie, PIB par habitant, élèves par classe et alphabétisation (schéma redessiné d'après le tableau de l'étude de cas).", svg: schemaComparaison() }
  ],
  questions: [
    // f1 : la situation scolaire en Afghanistan
    { id: "geographie-s08-2-q1", fiche: "geographie-s08-2-f1", type: "qcm", niveau: 1,
      enonce: "Depuis combien de temps l'Afghanistan est-il en guerre ?",
      choix: ["Plus de quarante ans", "Une dizaine d'années", "Cinq ans", "Plus d'un siècle"],
      reponse: "Plus de quarante ans",
      explication: "Le pays est en guerre depuis plus de quarante ans. Cela explique en partie l'état de ses écoles.", source: P(1) },
    { id: "geographie-s08-2-q2", fiche: "geographie-s08-2-f1", type: "qcm", niveau: 1,
      enonce: "Quelle part des enfants afghans de 7 à 17 ans ne va pas à l'école ?",
      choix: ["Près de la moitié", "Presque tous", "Un sur dix", "Un sur cent"],
      reponse: "Près de la moitié",
      explication: "Près d'un enfant sur deux n'est pas scolarisé. C'est l'un des signes de la crise de l'école afghane.", source: P(1) },
    { id: "geographie-s08-2-q3", fiche: "geographie-s08-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "En Afghanistan, 55 % des garçons et seulement 30 % des jeunes femmes savent lire et écrire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 55 % des garçons, 30 % des jeunes femmes. Les filles sont les plus touchées par l'analphabétisme.", source: P(1) },
    { id: "geographie-s08-2-q4", fiche: "geographie-s08-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Toutes les écoles publiques afghanes ont des bâtiments et du matériel moderne.",
      corrections: ["Faux : la moitié des 12 000 écoles publiques n'ont pas de locaux ; les élèves font classe par terre ou sous des tentes.", "Faux : il n'y a aucune école publique en Afghanistan.", "Faux : les écoles ont des bâtiments, mais aucun élève."],
      reponse: { vrai: false, correction: "Faux : la moitié des 12 000 écoles publiques n'ont pas de locaux ; les élèves font classe par terre ou sous des tentes." },
      explication: "Une école sur deux n'a pas de bâtiment. Le matériel se résume souvent à un tableau noir et des ardoises.", source: P(1) },
    { id: "geographie-s08-2-q5", fiche: "geographie-s08-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment se passe souvent la classe en Afghanistan quand l'école n'a pas de locaux ?",
      choix: ["Par terre, en plein air ou sous une tente", "Dans un gymnase", "Dans un bus scolaire", "Par internet, à la maison"],
      reponse: "Par terre, en plein air ou sous une tente",
      explication: "Les élèves s'assoient par terre, dehors, ou sous une tente dans le meilleur des cas. Une école publique sur deux n'a pas de locaux.", source: P(1) },
    { id: "geographie-s08-2-q6", fiche: "geographie-s08-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quels signes montrent que l'école va mal en Afghanistan ? (plusieurs réponses)",
      choix: ["Près de la moitié des enfants de 7 à 17 ans ne sont pas scolarisés", "La moitié des écoles publiques n'ont pas de locaux", "Le matériel se limite souvent à un tableau noir et des ardoises", "Tous les enfants passent le baccalauréat à 18 ans", "La cantine est gratuite pour tous"],
      reponse: ["Près de la moitié des enfants de 7 à 17 ans ne sont pas scolarisés", "La moitié des écoles publiques n'ont pas de locaux", "Le matériel se limite souvent à un tableau noir et des ardoises"],
      explication: "Enfants non scolarisés, écoles sans locaux, matériel minimal : trois signes de crise. Le baccalauréat à 18 ans et la cantine gratuite, c'est la Finlande.", source: P(1) },
    { id: "geographie-s08-2-q7", fiche: "geographie-s08-2-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'analphabétisme est-il si élevé en Afghanistan ?",
      choix: ["Parce que près de la moitié des enfants ne vont pas à l'école, dans un pays en guerre depuis quarante ans", "Parce que la langue du pays ne s'écrit pas", "Parce que l'école n'y est pas obligatoire, si bien que les familles n'y envoient leurs enfants que si elles le souhaitent", "Parce que le pays est trop peuplé"],
      reponse: "Parce que près de la moitié des enfants ne vont pas à l'école, dans un pays en guerre depuis quarante ans",
      explication: "Qui ne va pas à l'école n'apprend pas à lire. La guerre, le manque d'écoles et le travail des enfants tiennent la moitié des enfants loin de la classe.", source: P(1) },
    { id: "geographie-s08-2-q8", fiche: "geographie-s08-2-f1", type: "trou", niveau: 1,
      enonce: "Complète avec les deux mots de l'étude de cas.",
      texte: "Ne savoir ni lire ni écrire, c'est l'___ ; aller à l'école, c'est la ___.",
      banque: ["analphabétisme", "scolarisation", "alphabétisation", "éducation"],
      reponse: [["analphabétisme", "analphabetisme"], ["scolarisation"]],
      explication: "L'analphabétisme, c'est ne savoir ni lire ni écrire. La scolarisation, c'est le fait d'aller à l'école.", source: P(1) },

    // f2 : les freins à la scolarisation
    { id: "geographie-s08-2-q9", fiche: "geographie-s08-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels sont les freins à la scolarisation en Afghanistan ? (plusieurs réponses)",
      choix: ["Les attaques contre les écoles", "Le travail des enfants", "Le mariage très jeune des filles", "L'éducation des filles mal vue dans certaines régions", "La gratuité de la cantine", "Le trop grand nombre d'écoles"],
      reponse: ["Les attaques contre les écoles", "Le travail des enfants", "Le mariage très jeune des filles", "L'éducation des filles mal vue dans certaines régions"],
      explication: "Danger, travail, mariages précoces et traditions tiennent les enfants, surtout les filles, loin de l'école. La cantine gratuite, c'est la Finlande.", source: P(1) },
    { id: "geographie-s08-2-q10", fiche: "geographie-s08-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "En Afghanistan, au moins 20 % des enfants sont contraints de travailler, parfois dès l'âge de 5 ans.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : au moins un enfant sur cinq travaille, aux champs ou dans des ateliers. Certains fabriquent des briques.", source: P(1) },
    { id: "geographie-s08-2-q11", fiche: "geographie-s08-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "En Afghanistan, les écoles de filles sont les mieux protégées.",
      corrections: ["Faux : ce sont les plus visées par les attaques.", "Faux : il n'existe aucune école de filles.", "Faux : les écoles de garçons sont les plus visées."],
      reponse: { vrai: false, correction: "Faux : ce sont les plus visées par les attaques." },
      explication: "Les écoles qui accueillent des filles sont les plus attaquées. Le but est de décourager les filles d'y aller.", source: P(1) },
    { id: "geographie-s08-2-q13", fiche: "geographie-s08-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi beaucoup d'enfants afghans travaillent-ils au lieu d'aller à l'école ?",
      choix: ["Pour aider financièrement leur famille", "Parce que l'école est interdite aux garçons", "Parce qu'ils ont déjà leur diplôme", "Parce que les écoles sont trop loin des villes"],
      reponse: "Pour aider financièrement leur famille",
      explication: "Les familles ont besoin de l'argent que rapportent les enfants. Ils travaillent aux champs ou dans des ateliers.", source: P(1) },
    { id: "geographie-s08-2-q14", fiche: "geographie-s08-2-f2", type: "qcm", niveau: 3,
      enonce: "Dans le sud de l'Afghanistan, près de Kandahar, les filles quittent l'école très tôt. Comment l'expliquer ?",
      choix: ["L'éducation des filles y est mal vue et elles sont mariées très jeunes", "Il n'y a pas d'écoles dans le sud du pays", "Les filles préfèrent travailler dans les ateliers", "Le climat y est trop chaud pour étudier"],
      reponse: "L'éducation des filles y est mal vue et elles sont mariées très jeunes",
      explication: "Par tradition, l'école des filles est mal vue dans le sud. Mariées très jeunes, elles se consacrent à leur foyer.", source: P(1) },
    { id: "geographie-s08-2-q15", fiche: "geographie-s08-2-f2", type: "qcm", niveau: 2,
      enonce: "En quelle année les talibans ont-ils repris le pouvoir en Afghanistan ?",
      choix: ["En 2021", "En 1996", "En 2001", "En 2018"],
      reponse: "En 2021",
      explication: "Ils ont dirigé le pays de 1996 à 2001, puis sont revenus au pouvoir en 2021. 2018 est l'année des 200 écoles attaquées.", source: P(1) },
    { id: "geographie-s08-2-q16", fiche: "geographie-s08-2-f2", type: "vrai_faux", niveau: 3,
      enonce: "Puisque l'école est obligatoire de 7 à 15 ans en Afghanistan, tous les enfants finissent par y aller.",
      corrections: ["Faux : la guerre, le travail des enfants et les mariages précoces empêchent près de la moitié des enfants d'y aller.", "Faux : l'école n'existe pas en Afghanistan.", "Faux : seules les filles vont à l'école."],
      reponse: { vrai: false, correction: "Faux : la guerre, le travail des enfants et les mariages précoces empêchent près de la moitié des enfants d'y aller." },
      explication: "Une loi ne suffit pas. Danger, pauvreté et traditions tiennent près d'un enfant sur deux loin de l'école.", source: P(2) },

    // f3 : l'école en Finlande
    { id: "geographie-s08-2-q17", fiche: "geographie-s08-2-f3", type: "qcm", niveau: 1,
      enonce: "Entre quels âges l'école est-elle obligatoire en Finlande ?",
      choix: ["De 7 à 16 ans", "De 3 à 18 ans", "De 6 à 12 ans", "De 7 à 15 ans"],
      reponse: "De 7 à 16 ans",
      explication: "En Finlande, l'école est obligatoire de 7 à 16 ans. En Afghanistan, c'est de 7 à 15 ans.", source: P(2) },
    { id: "geographie-s08-2-q18", fiche: "geographie-s08-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Qu'est-ce qui est gratuit pour une élève finlandaise ? (plusieurs réponses)",
      choix: ["La cantine", "Les soins du dentiste de l'école", "Le lycée", "L'université", "Ses cours de piano au conservatoire", "Sa chambre d'étudiante"],
      reponse: ["La cantine", "Les soins du dentiste de l'école", "Le lycée", "L'université"],
      explication: "Cantine, dentiste scolaire, lycée et université ne coûtent rien. La chambre d'étudiante est à moitié prix et le conservatoire coûte presque rien : pas tout à fait gratuits.", source: P(2) },
    { id: "geographie-s08-2-q19", fiche: "geographie-s08-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "En Finlande, les études à l'université sont gratuites.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'université et les grandes écoles sont gratuites. L'État aide même à payer la chambre d'étudiant.", source: P(2) },
    { id: "geographie-s08-2-q23", fiche: "geographie-s08-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire que les élèves finlandais étudient dans de bonnes conditions ?",
      choix: ["L'école est gratuite jusqu'à l'université, avec repas et soins, et les classes sont petites", "Parce que l'école n'est pas obligatoire", "Parce que les élèves travaillent aux champs l'après-midi pour aider leur famille, après avoir étudié le matin", "Parce que les classes comptent plus de quarante élèves"],
      reponse: "L'école est gratuite jusqu'à l'université, avec repas et soins, et les classes sont petites",
      explication: "Tout est gratuit, de la cantine à l'université, et une classe compte 15 élèves.", source: P(2) },
    { id: "geographie-s08-2-q24", fiche: "geographie-s08-2-f3", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre le parcours scolaire d'une jeune Finlandaise.",
      elements: ["Elle entre au lycée, toujours gratuit", "Elle commence l'école obligatoire à sept ans", "Elle passe le baccalauréat à dix-huit ans", "Elle entre à l'université, gratuite elle aussi"],
      reponse: [1, 0, 2, 3],
      explication: "École à 7 ans, lycée, baccalauréat à 18 ans, puis université. À chaque étape, c'est gratuit.", source: P(2) },

    { id: "geographie-s08-2-q48", fiche: "geographie-s08-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les Finlandaises comptent parmi les femmes les plus diplômées d'Europe : plus d'une sur trois a fait des études à l'université.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Plus d'un tiers des Finlandaises ont une formation universitaire. L'université gratuite y est pour beaucoup.", source: P(2) },
    { id: "geographie-s08-2-q49", fiche: "geographie-s08-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque étape du parcours d'une élève finlandaise à ce qu'elle lui coûte.",
      gauche: ["La cantine et le dentiste de l'école", "Le conservatoire", "La chambre d'étudiante", "Le lycée et l'université"],
      droite: ["Gratuits, tous les jours d'école", "Presque rien", "La moitié du loyer habituel, grâce à l'État", "Gratuits, repas du lycée compris"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Presque tout est gratuit, de la cantine à l'université. Le conservatoire coûte presque rien et la chambre d'étudiante moitié prix.", source: P(2) },

    // f4 : population et richesse
    { id: "geographie-s08-2-q25", fiche: "geographie-s08-2-f4", type: "qcm", niveau: 1,
      enonce: "Quelle est l'espérance de vie en Finlande ?",
      choix: ["81 ans", "53 ans", "69 ans", "95 ans"],
      reponse: "81 ans",
      explication: "Un Finlandais vit en moyenne 81 ans. Un Afghan, 53 ans.", source: P(2) },
    { id: "geographie-s08-2-q26", fiche: "geographie-s08-2-f4", type: "qcm", niveau: 2,
      enonce: "Quel était le PIB par habitant de l'Afghanistan en 2019 ?",
      choix: ["2 000 dollars", "48 600 dollars", "20 000 dollars", "200 dollars"],
      reponse: "2 000 dollars",
      explication: "2 000 dollars par habitant en Afghanistan, contre 48 600 en Finlande. L'écart est énorme.", source: P(2) },
    { id: "geographie-s08-2-q27", fiche: "geographie-s08-2-f4", type: "association", niveau: 3,
      enonce: "Relie chaque donnée à sa valeur.",
      gauche: ["Espérance de vie en Afghanistan", "Espérance de vie en Finlande", "PIB par habitant en Afghanistan", "PIB par habitant en Finlande"],
      droite: ["48 600 dollars", "53 ans", "2 000 dollars", "81 ans"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "53 ans et 2 000 dollars pour l'Afghanistan ; 81 ans et 48 600 dollars pour la Finlande. Le pays le plus riche est aussi celui où l'on vit le plus longtemps.", source: P(2) },
    { id: "geographie-s08-2-q28", fiche: "geographie-s08-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "L'Afghanistan compte environ sept fois plus d'habitants que la Finlande.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 38 millions contre 5,5 millions. Mais le nombre d'habitants ne dit rien du développement.", source: P(2) },
    { id: "geographie-s08-2-q29", fiche: "geographie-s08-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "En Finlande, les femmes ont en moyenne plus d'enfants qu'en Afghanistan.",
      corrections: ["Faux : 1,74 enfant par femme en Finlande contre 4,7 en Afghanistan.", "Faux : les deux pays ont le même nombre d'enfants par femme.", "Faux : les Finlandaises n'ont en moyenne aucun enfant."],
      reponse: { vrai: false, correction: "Faux : 1,74 enfant par femme en Finlande contre 4,7 en Afghanistan." },
      explication: "C'est l'inverse : 4,7 enfants par femme en Afghanistan, 1,74 en Finlande. Une forte fécondité est fréquente dans les pays peu développés.", source: P(2) },
    { id: "geographie-s08-2-q30", fiche: "geographie-s08-2-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire que la Finlande est un pays développé ?",
      choix: ["Espérance de vie longue, PIB par habitant élevé, presque tout le monde sait lire", "Parce que sa population est plus nombreuse", "Parce que les familles y ont beaucoup d'enfants", "Parce que les classes y sont plus chargées, ce qui prouve que beaucoup d'enfants vont à l'école"],
      reponse: "Espérance de vie longue, PIB par habitant élevé, presque tout le monde sait lire",
      explication: "Richesse, santé et éducation : les trois critères de l'IDH sont excellents en Finlande. C'est la définition d'un pays développé.", source: P(2) },
    { id: "geographie-s08-2-q31", fiche: "geographie-s08-2-f4", type: "qcm", niveau: 3,
      enonce: "Comment l'espérance de vie des Afghans se compare-t-elle à celle des Finlandais ?",
      choix: ["Elle est plus courte de près de trente ans", "Elle est plus longue d'environ dix ans", "Elle est la même", "Elle est plus courte de cinq ans"],
      reponse: "Elle est plus courte de près de trente ans",
      explication: "53 ans contre 81 ans : 28 années d'écart. C'est un signe de l'inégal développement.", indice: "Calcule 81 moins 53.", source: P(2) },
    { id: "geographie-s08-2-q32", fiche: "geographie-s08-2-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels indicateurs montrent que l'Afghanistan est un pays peu développé ? (plusieurs réponses)",
      choix: ["Une espérance de vie de 53 ans", "Un PIB par habitant de 2 000 dollars", "Une forte fécondité : 4,7 enfants par femme", "Une population de 38 millions d'habitants", "Une capitale nommée Kaboul"],
      reponse: ["Une espérance de vie de 53 ans", "Un PIB par habitant de 2 000 dollars", "Une forte fécondité : 4,7 enfants par femme"],
      explication: "Vie courte, faible richesse et forte fécondité sont des signes de faible développement. Le nombre d'habitants et le nom de la capitale ne disent rien du développement.", source: P(2) },

    // f5 : deux écoles
    { id: "geographie-s08-2-q33", fiche: "geographie-s08-2-f5", type: "qcm", niveau: 2,
      enonce: "Combien d'élèves compte une classe en Afghanistan, en moyenne ?",
      choix: ["43", "15", "25", "100"],
      reponse: "43",
      explication: "43 élèves par classe en Afghanistan, contre 15 en Finlande. Presque trois fois plus.", source: P(2) },
    { id: "geographie-s08-2-q34", fiche: "geographie-s08-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "La Finlande consacre à l'éducation une part de son PIB plus petite que l'Afghanistan.",
      corrections: ["Faux : 6,4 % du PIB en Finlande contre 4,1 % en Afghanistan.", "Faux : les deux pays consacrent la même part de leur PIB à l'éducation.", "Faux : l'Afghanistan ne dépense rien pour l'éducation."],
      reponse: { vrai: false, correction: "Faux : 6,4 % du PIB en Finlande contre 4,1 % en Afghanistan." },
      explication: "La Finlande consacre 6,4 % de son PIB à l'éducation, l'Afghanistan 4,1 %. Et le PIB finlandais est bien plus gros.", source: P(2) },
    { id: "geographie-s08-2-q35", fiche: "geographie-s08-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "En Finlande, presque toute la population sait lire et écrire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : presque 100 % des Finlandais savent lire et écrire. En Afghanistan, c'est 43 %.", source: P(2) },
    { id: "geographie-s08-2-q37", fiche: "geographie-s08-2-f5", type: "association", niveau: 2,
      enonce: "Relie chaque donnée scolaire à sa valeur.",
      gauche: ["Élèves par classe en Afghanistan", "Élèves par classe en Finlande", "Part du PIB pour l'éducation en Afghanistan", "Part du PIB pour l'éducation en Finlande"],
      droite: ["6,4 %", "43", "4,1 %", "15"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "43 élèves et 4,1 % du PIB pour l'Afghanistan ; 15 élèves et 6,4 % du PIB pour la Finlande.", source: P(2) },
    { id: "geographie-s08-2-q38", fiche: "geographie-s08-2-f5", type: "qcm", niveau: 3,
      enonce: "Comment expliquer qu'une classe afghane compte presque trois fois plus d'élèves qu'une classe finlandaise ?",
      choix: ["Le pays, plus pauvre, consacre moins d'argent à l'école et manque de locaux", "Les enfants afghans sont plus nombreux à vouloir aller à l'école", "Les classes finlandaises sont presque vides, car l'école n'y est pas obligatoire et beaucoup d'enfants restent chez eux", "Le climat afghan oblige à regrouper les élèves"],
      reponse: "Le pays, plus pauvre, consacre moins d'argent à l'école et manque de locaux",
      explication: "Avec un PIB très faible et une petite part consacrée à l'éducation, l'Afghanistan manque d'écoles et de bâtiments. Les élèves s'entassent donc.", source: P(2) },
    { id: "geographie-s08-2-q39", fiche: "geographie-s08-2-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Quels éléments sont plus favorables à l'école en Finlande ? (plusieurs réponses)",
      choix: ["Des classes de 15 élèves", "6,4 % du PIB pour l'éducation", "L'école obligatoire jusqu'à 16 ans", "Presque 100 % d'alphabétisés", "38 millions d'habitants", "4,7 enfants par femme"],
      reponse: ["Des classes de 15 élèves", "6,4 % du PIB pour l'éducation", "L'école obligatoire jusqu'à 16 ans", "Presque 100 % d'alphabétisés"],
      explication: "Petites classes, plus d'argent, école plus longue et alphabétisation complète : la Finlande gagne sur toute la ligne. 38 millions d'habitants et 4,7 enfants par femme sont des données afghanes.", source: P(2) },
    { id: "geographie-s08-2-q50", fiche: "geographie-s08-2-f5", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En Afghanistan, une classe compte en moyenne ___ élèves ; en Finlande, ___.",
      banque: ["43", "15", "25", "60"],
      reponse: [["43"], ["15"]],
      explication: "43 élèves par classe en Afghanistan, 15 en Finlande. Presque trois fois plus d'un côté que de l'autre.", source: P(2) },

    // f6 : l'alphabétisation dans le monde
    { id: "geographie-s08-2-q41", fiche: "geographie-s08-2-f6", type: "qcm", niveau: 1,
      enonce: "En 2018, quel continent avait les taux d'alphabétisation les plus faibles ?",
      choix: ["L'Afrique", "L'Europe", "L'Amérique du Nord", "L'Océanie"],
      reponse: "L'Afrique",
      explication: "Les couleurs les plus claires de la carte, sous 50 %, sont surtout en Afrique. L'Europe et l'Amérique du Nord dépassent 95 %.", source: P(1) },
    { id: "geographie-s08-2-q42", fiche: "geographie-s08-2-f6", type: "vrai_faux", niveau: 1,
      enonce: "En Europe et en Amérique du Nord, plus de 95 % des habitants savent lire et écrire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'Europe, l'Amérique du Nord, la Russie et l'Australie dépassent 95 %. C'est le niveau le plus élevé relevé en 2018.", source: P(1) },
    { id: "geographie-s08-2-q43", fiche: "geographie-s08-2-f6", type: "vrai_faux", niveau: 2,
      enonce: "En 2018, le taux d'alphabétisation dépassait 95 % dans tous les pays du monde.",
      corrections: ["Faux : dans plusieurs pays d'Afrique et en Afghanistan, il est inférieur à 50 %.", "Faux : aucun pays ne dépasse 95 %.", "Faux : il dépasse 95 % seulement en Afrique."],
      reponse: { vrai: false, correction: "Faux : dans plusieurs pays d'Afrique et en Afghanistan, il est inférieur à 50 %." },
      explication: "La carte va de moins de 50 % à plus de 95 %. Les écarts entre pays sont très grands.", source: P(1) },
    { id: "geographie-s08-2-q44", fiche: "geographie-s08-2-f6", type: "qcm", niveau: 2,
      enonce: "Que mesure le taux d'alphabétisation ?",
      choix: ["La part des habitants qui savent lire et écrire", "La part des enfants qui vont à l'école", "Le nombre d'écoles pour mille habitants", "La part du PIB consacrée à l'éducation"],
      reponse: "La part des habitants qui savent lire et écrire",
      explication: "Il compte ceux qui savent lire et écrire. Aller à l'école, c'est la scolarisation : ce n'est pas la même mesure.", source: P(1) },
    { id: "geographie-s08-2-q45", fiche: "geographie-s08-2-f6", type: "qcm", niveau: 3,
      enonce: "Comment les taux d'alphabétisation reflètent-ils les inégalités de développement ?",
      choix: ["Les taux les plus bas sont dans les pays pauvres, les plus hauts dans les pays développés", "Ils sont identiques partout", "Les pays riches ont les taux les plus bas", "Ils dépendent seulement du climat : on apprend moins bien à lire dans les pays chauds que dans les pays froids"],
      reponse: "Les taux les plus bas sont dans les pays pauvres, les plus hauts dans les pays développés",
      explication: "L'éducation est un des trois critères de l'IDH. Là où le développement est faible, comme en Afghanistan, on sait moins souvent lire.", source: P(1) },
    { id: "geographie-s08-2-q47", fiche: "geographie-s08-2-f6", type: "qcm_multiple", niveau: 2,
      enonce: "Où trouve-t-on des taux d'alphabétisation supérieurs à 95 % ? (plusieurs réponses)",
      choix: ["En Europe", "En Amérique du Nord", "En Russie", "En Australie", "Dans plusieurs pays d'Afrique", "En Afghanistan"],
      reponse: ["En Europe", "En Amérique du Nord", "En Russie", "En Australie"],
      explication: "Europe, Amérique du Nord, Russie et Australie sont dans la classe la plus haute. Plusieurs pays d'Afrique et l'Afghanistan sont sous 50 %.", source: P(1) },
    { id: "geographie-s08-2-q51", fiche: "geographie-s08-2-f6", type: "qcm", niveau: 2,
      enonce: "Dans le monde, parmi les adultes qui ne savent ni lire ni écrire, qui est le plus nombreux ?",
      choix: ["Les femmes : deux sur trois", "Les hommes : deux sur trois", "Autant d'hommes que de femmes", "Les enfants de moins de dix ans, qui n'ont pas encore eu le temps d'apprendre"],
      reponse: "Les femmes : deux sur trois",
      explication: "D'après l'UNESCO, au moins 739 millions d'adultes ne savent ni lire ni écrire, et deux sur trois sont des femmes. Chez les jeunes, la situation s'améliore : 93 % savaient lire en 2024.",
      source: T("L'alphabétisation : ce qu'il faut savoir", "UNESCO", U_UNESCO) }
  ],
  bonus: [
    {
      id: "geographie-s08-2-b1",
      fiche: "geographie-s08-2-f3",
      titre: "Un repas gratuit depuis 1948",
      texte: "En Finlande, chaque élève, de la maternelle au lycée, reçoit un repas gratuit tous les jours d'école. Ce droit est garanti par une loi de 1948. Certaines villes nourrissaient déjà les élèves pauvres bien avant : Kuopio, par exemple, dès 1902.",
      source: { titre: "School meal", editeur: "Wikipedia, the free encyclopedia", url: "https://en.wikipedia.org/wiki/School_meal" }
    },
    {
      id: "geographie-s08-2-b2",
      fiche: "geographie-s08-2-f6",
      titre: "Combien d'adultes ne savent pas lire ?",
      texte: "D'après l'UNESCO, au moins 739 millions d'adultes dans le monde ne savent toujours ni lire ni écrire, et deux sur trois sont des femmes. Chez les jeunes de 18 à 24 ans, la situation est meilleure : 93 % savaient lire en 2024.",
      source: { titre: "L'alphabétisation : ce qu'il faut savoir", editeur: "UNESCO", url: U_UNESCO }
    },
    {
      id: "geographie-s08-2-b3",
      fiche: "geographie-s08-2-f3",
      titre: "En France, l'école gratuite et obligatoire depuis 1881-1882",
      texte: "L'école gratuite a une longue histoire en France. La loi du 16 juin 1881 rend l'école primaire publique gratuite ; celle du 28 mars 1882 rend l'instruction obligatoire de 6 à 13 ans. Elles portent le nom de Jules Ferry, ministre de l'Instruction publique. Obligation d'instruction, pas d'école : une famille pouvait instruire ses enfants à la maison.",
      source: { titre: "Lois Jules Ferry", editeur: "Wikipédia, l'encyclopédie libre", url: U_FERRY }
    }
  ],
  nonCouvert: [
    "Les réponses attendues aux questions de l'étude de cas ne sont pas fournies dans le dépôt : le jeu s'appuie seulement sur les documents.",
    "La carte du taux d'alphabétisation (2018) est lue à l'œil : seules les grandes zones (plus de 95 %, moins de 50 %) sont reprises, sans valeur par pays.",
    "Les détails violents du texte sur les attaques contre les écolières ne sont pas repris ; les talibans sont seulement nommés comme le pouvoir en place, sans qualificatif.",
    "Le parcours de la jeune Finlandaise est anonymisé : son prénom n'est pas repris.",
    "Les photos (garçon fabriquant des briques, classe par terre, salle de classe finlandaise) et les deux cartes de situation ne sont pas reproduites.",
    "L'étude de cas s'arrête en 2021 : l'accès des filles afghanes à l'école depuis cette date n'est pas traité, faute de page vérifiée et pour ne pas contredire le livret.",
    "Les réformes récentes de l'école finlandaise (durée de la scolarité obligatoire) ne sont pas reprises : le jeu suit le livret (de 7 à 16 ans).",
    "L'IDH des deux pays, que le programme invite à comparer, n'est pas dans le tableau du livret : la comparaison se fait par l'espérance de vie, le PIB par habitant et l'alphabétisation (le classement 2023 est dans geographie-s08-1)."
  ]
};
