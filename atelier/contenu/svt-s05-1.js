// Source en clair du cours svt-s05-1 (livret 1, chapitre 2, séance 4 : étude des cycles climatiques du quaternaire
// et prospective). Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s05-1.
// Seule source déposée : le corrigé du livret 1, p. 10-11 (durée des périodes glaciaires et interglaciaires ;
// exercice des sept nains sur la moyenne ; cartes des pollens d'arbres en Europe il y a 5 000 et 18 000 ans ;
// toundra). Le graphique des cycles et les cartes de pollens ne sont pas reproduits : la frise des cycles est
// redessinée en SVG d'après les dates du corrigé. Dans les questions, les grands nombres sont écrits en lettres
// (l'anti-spoil du devoir 1 compare les nombres en chiffres).
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Séance 4 – Étude des cycles climatiques du quaternaire et prospective", titre, editeur: "Wikipédia", url });

// Frise des quatre derniers cycles glaciaires (durées du corrigé), en milliers d'années avant aujourd'hui.
function schemaCycles() {
  const encre = "#2e2419";
  const X0 = 40, X1 = 500, Y = 120;
  const x = ka => X0 + (400 - ka) * (X1 - X0) / 400; // ka : milliers d'années avant aujourd'hui
  const glaciaires = [[400, 330], [320, 240], [230, 130], [120, 10]];
  const inter = [[330, 320], [240, 230], [130, 120], [10, 0]];
  let s = "<svg viewBox='0 0 540 220' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<text x='270' y='22' text-anchor='middle' font-size='13' font-weight='bold' fill='" + encre + "'>Quatre cycles glaciaires en quatre cent mille ans</text>";
  glaciaires.forEach(([a, b], i) => {
    s += "<rect x='" + x(a) + "' y='" + (Y - 30) + "' width='" + (x(b) - x(a)) + "' height='30' fill='#4f86c6'/>";
    s += "<text x='" + ((x(a) + x(b)) / 2) + "' y='" + (Y - 11) + "' text-anchor='middle' fill='#fff' font-size='10'>" + ["70 000 ans", "80 000 ans", "100 000 ans", "110 000 ans"][i] + "</text>";
  });
  inter.forEach(([a, b]) => {
    s += "<rect x='" + x(a) + "' y='" + (Y - 30) + "' width='" + Math.max(4, x(b) - x(a)) + "' height='30' fill='#e78fb3'/>";
  });
  s += "<line x1='" + X0 + "' y1='" + Y + "' x2='" + (X1 + 10) + "' y2='" + Y + "' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 10) + " " + (Y - 5) + " l10 5 -10 5z' fill='" + encre + "'/>";
  for (let ka = 400; ka >= 0; ka -= 50) {
    s += "<line x1='" + x(ka) + "' y1='" + (Y - 4) + "' x2='" + x(ka) + "' y2='" + (Y + 4) + "' stroke='" + encre + "'/>";
    s += "<text x='" + x(ka) + "' y='" + (Y + 18) + "' text-anchor='middle' fill='" + encre + "' font-size='9'>" + (ka ? "−" + ka + " 000" : "aujourd'hui") + "</text>";
  }
  s += "<text x='" + X0 + "' y='" + (Y + 36) + "' fill='" + encre + "' font-size='10'>Une grande graduation : 50 000 ans.</text>";
  s += "<rect x='40' y='170' width='14' height='10' fill='#4f86c6'/><text x='60' y='179' fill='" + encre + "'>période glaciaire (froide), 90 000 ans en moyenne</text>";
  s += "<rect x='40' y='192' width='14' height='10' fill='#e78fb3'/><text x='60' y='201' fill='" + encre + "'>période interglaciaire (chaude), environ 10 000 ans</text>";
  return s + "</svg>";
}

module.exports = {
  id: "svt-s05-1",
  fiches: [
    {
      id: "svt-s05-1-f1", notion: "Périodes glaciaires et interglaciaires",
      titre: "Le climat alterne entre froid et chaud",
      texte: "Sur le graphique des climats des derniers quatre cent mille ans, des périodes glaciaires, très froides et dessinées en bleu, alternent avec des périodes interglaciaires, plus chaudes et dessinées en rose. Les pics de réchauffement correspondent aux périodes interglaciaires. Une période glaciaire suivie d'une interglaciaire forme un cycle glaciaire : le graphique en montre quatre.",
      pointsCles: [
        "Période glaciaire : froide, en bleu sur le graphique",
        "Période interglaciaire : chaude, en rose ; ce sont les pics de réchauffement",
        "Un cycle glaciaire = une glaciaire + une interglaciaire",
        "Quatre cycles en quatre cent mille ans"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "période glaciaire", def: "une longue période froide du climat de la Terre" },
        { mot: "période interglaciaire", def: "une période plus chaude, entre deux périodes glaciaires" },
        { mot: "cycle glaciaire", def: "une période glaciaire et la période interglaciaire qui la suit" }
      ],
      schema: "svt-s05-1-s1", prerequis: [], source: C(10)
    },
    {
      id: "svt-s05-1-f2", notion: "Mesurer la durée d'une période glaciaire",
      titre: "Lire l'échelle, calculer une moyenne",
      texte: "Sur le graphique, une grande graduation vaut 50 000 ans, une petite 10 000 ans. Pour chaque cycle, on repère le début et la fin de la période glaciaire et on calcule sa durée : 70 000, 80 000, 100 000 puis 110 000 ans. Moyenne des quatre : 90 000 ans. Les interglaciaires durent environ 10 000 ans.",
      pointsCles: [
        "Grande graduation : 50 000 ans ; petite graduation : 10 000 ans",
        "Durée = fin − début, pour chaque période glaciaire",
        "Durées : 70 000, 80 000, 100 000, 110 000 ans ; moyenne : 90 000 ans",
        "Interglaciaires : environ 10 000 ans"
      ],
      astuce: "Une moyenne : on additionne toutes les durées, puis on divise par leur nombre.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "graduation", def: "un des traits régulièrement espacés d'un axe, qui sert à lire une valeur" },
        { mot: "moyenne", def: "la somme de plusieurs valeurs divisée par leur nombre" }
      ],
      schema: "svt-s05-1-s1", prerequis: ["svt-s05-1-f1"], source: C(10)
    },
    {
      id: "svt-s05-1-f3", notion: "Ce qu'une moyenne ne dit pas",
      titre: "Sept nains, la même moyenne",
      texte: "Sept nains ont des notes très différentes, et pourtant tous la même moyenne. Une moyenne ne montre donc ni la taille des écarts ni leur nombre. Ainsi, une température très éloignée de la moyenne calculée sur trente ans ne prouve pas un changement de climat. Mais si la moyenne du globe monte de 2 °C, l'ensemble des températures a monté.",
      pointsCles: [
        "Des séries de notes très différentes peuvent avoir la même moyenne",
        "Une moyenne cache la taille et le nombre des écarts",
        "Une valeur isolée très loin de la moyenne ne prouve pas un changement de climat",
        "Une hausse de 2 °C de la moyenne du globe traduit une hausse de l'ensemble des températures"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "écart", def: "la différence entre une valeur et la moyenne" }
      ],
      schema: null, prerequis: ["svt-s05-1-f2"], source: C(10)
    },
    {
      id: "svt-s05-1-f4", notion: "Lire les cartes de pollens d'Europe",
      titre: "Des pollens fossiles dans les sédiments",
      texte: "Les pollens d'arbres se conservent dans les sédiments. Des cartes montrent leur quantité en Europe par une échelle de couleurs : blanc sans pollen, vert de plus en plus foncé quand il y en a davantage. Il y a cinq mille ans, l'Europe est verte : couverte de forêts. Il y a dix-huit mille ans, elle est presque toute blanche.",
      pointsCles: [
        "Lire d'abord la légende : une échelle de couleurs",
        "Blanc : pas de pollen d'arbre ; vert foncé : beaucoup de pollens",
        "Il y a cinq mille ans : des forêts partout en Europe",
        "Il y a dix-huit mille ans : des arbres dans quelques zones seulement"
      ],
      dates: [], lieux: ["Europe"], personnages: [],
      vocabulaire: [
        { mot: "pollen fossile", def: "un grain de pollen très ancien conservé dans les sédiments" },
        { mot: "sédiments", def: "des dépôts de particules qui s'accumulent au fond de l'eau ou sur le sol" }
      ],
      schema: null, prerequis: ["svt-s05-1-f1"], source: C(10)
    },
    {
      id: "svt-s05-1-f5", notion: "La toundra de l'Europe glaciaire",
      titre: "Il y a dix-huit mille ans : prairie l'été, neige l'hiver",
      texte: "Il y a dix-huit mille ans, l'Europe était en pleine période glaciaire. Dans les zones blanches des cartes : pas d'arbres, mais des herbes selon la saison, ou rien. C'est la toundra, paysage des climats très froids. Les arbres survivaient dans les vallées encaissées, moins froides. Ce paysage existe encore dans le nord de l'Europe, chez les rennes.",
      pointsCles: [
        "Il y a dix-huit mille ans : période glaciaire en Europe",
        "Toundra : pas d'arbres, prairie l'été, neige l'hiver",
        "Les forêts d'arbres bas se réfugient dans les vallées encaissées, moins froides",
        "Même paysage aujourd'hui dans le nord de l'Europe, chez les rennes"
      ],
      dates: [], lieux: ["Europe"], personnages: [],
      vocabulaire: [
        { mot: "toundra", def: "un paysage sans arbres des climats très froids : herbes l'été, neige l'hiver" },
        { mot: "vallée encaissée", def: "une vallée profonde, serrée entre des pentes raides" }
      ],
      schema: null, prerequis: ["svt-s05-1-f4"], source: C(11)
    }
  ],
  schemas: [
    { id: "svt-s05-1-s1", legende: "Les quatre derniers cycles glaciaires, d'après les durées relevées (frise redessinée).", svg: schemaCycles() }
  ],
  questions: [
    // f1 : périodes glaciaires et interglaciaires
    { id: "svt-s05-1-q2", fiche: "svt-s05-1-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on une période plus chaude située entre deux périodes glaciaires ?",
      choix: ["Une période interglaciaire", "Une période glaciaire", "Une saison sèche", "Un cycle"],
      reponse: "Une période interglaciaire",
      explication: "Entre deux périodes glaciaires vient une période plus chaude : l'interglaciaire. Elle est courte par rapport à la période glaciaire qui la précède.", source: C(10) },
    { id: "svt-s05-1-q3", fiche: "svt-s05-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Une période interglaciaire est plus chaude qu'une période glaciaire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les interglaciaires sont les pics de réchauffement du graphique. Les glaciaires sont les longues périodes froides.", source: C(10) },
    { id: "svt-s05-1-q4", fiche: "svt-s05-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Depuis quatre cent mille ans, le climat de la Terre est resté le même.",
      corrections: ["Faux : des périodes glaciaires et interglaciaires se sont succédé en cycles.", "Faux : il a été glaciaire sans interruption.", "Faux : il s'est réchauffé régulièrement, sans jamais se refroidir."],
      reponse: { vrai: false, correction: "Faux : des périodes glaciaires et interglaciaires se sont succédé en cycles." },
      explication: "Le climat a alterné entre froid et chaud : quatre cycles glaciaires en quatre cent mille ans. Il n'est donc pas resté le même.", source: C(10) },
    { id: "svt-s05-1-q5", fiche: "svt-s05-1-f1", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce qu'un cycle glaciaire ?",
      choix: ["Une période glaciaire suivie d'une période interglaciaire", "Une année avec de la neige", "Le tour que fait la Terre autour du Soleil", "Un hiver très froid"],
      reponse: "Une période glaciaire suivie d'une période interglaciaire",
      explication: "Un cycle glaciaire réunit une longue période froide et le réchauffement qui la suit. Puis un nouveau cycle commence.", source: C(10) },
    { id: "svt-s05-1-q6", fiche: "svt-s05-1-f1", type: "qcm", niveau: 2,
      enonce: "Depuis quatre cent mille ans, combien de cycles glaciaires se sont succédé, environ ?",
      choix: ["Quatre, d'environ cent mille ans chacun", "Deux, d'environ deux cent mille ans chacun", "Dix", "Quarante"],
      reponse: "Quatre, d'environ cent mille ans chacun",
      explication: "Quatre cycles se sont succédé en quatre cent mille ans. Chacun dure donc environ cent mille ans.", source: C(10) },
    { id: "svt-s05-1-q7", fiche: "svt-s05-1-f1", type: "ordre", niveau: 3,
      enonce: "Remets dans l'ordre, du plus ancien au plus récent, ces moments du dernier cycle glaciaire.",
      elements: ["Fin de la dernière période glaciaire, il y a dix mille ans", "Nouvelle période interglaciaire, la plus récente", "Période interglaciaire précédente, courte et chaude", "Début de la dernière période glaciaire"],
      reponse: [2, 3, 0, 1],
      explication: "Une interglaciaire, puis une glaciaire qui commence et finit il y a dix mille ans, puis une nouvelle interglaciaire. C'est le dernier des quatre cycles du graphique.", source: C(10) },
    { id: "svt-s05-1-q8", fiche: "svt-s05-1-f1", type: "qcm", niveau: 3,
      enonce: "Comment connaît-on la température qu'il faisait sur Terre il y a des centaines de milliers d'années ?",
      choix: ["Grâce à la glace des pôles, qui garde des bulles d'air de l'époque", "Grâce aux thermomètres de l'époque", "Grâce aux récits laissés par les hommes de la préhistoire sur les parois des grottes", "Grâce aux photos prises par satellite"],
      reponse: "Grâce à la glace des pôles, qui garde des bulles d'air de l'époque",
      explication: "Dans la glace de l'Antarctique et du Groenland, chaque couche garde de l'air et des traces de l'époque où elle s'est formée. En forant des carottes de glace, on remonte ainsi jusqu'à huit cent mille ans en arrière.",
      indice: "Pense à ce qui s'accumule couche après couche aux pôles.",
      source: T("Carotte de glace", "https://fr.wikipedia.org/wiki/Carotte_de_glace") },
    { id: "svt-s05-1-q38", fiche: "svt-s05-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qui est vrai de la période où nous vivons. (plusieurs réponses)",
      choix: ["C'est une période interglaciaire", "Elle a commencé il y a un peu plus de dix mille ans, à la fin de la dernière glaciation", "On l'appelle l'Holocène", "C'est une période glaciaire", "Elle a commencé il y a un million d'années"],
      reponse: ["C'est une période interglaciaire", "Elle a commencé il y a un peu plus de dix mille ans, à la fin de la dernière glaciation", "On l'appelle l'Holocène"],
      explication: "La dernière période glaciaire s'est terminée il y a environ onze mille sept cents ans. Depuis, nous vivons dans une période interglaciaire, l'Holocène.",
      source: T("Holocène", "https://fr.wikipedia.org/wiki/Holoc%C3%A8ne") },
    // f2 : mesurer la durée d'une période glaciaire
    { id: "svt-s05-1-q11", fiche: "svt-s05-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment trouve-t-on la durée d'une période glaciaire quand on connaît la date de son début et celle de sa fin ?",
      choix: ["On calcule l'écart entre les deux dates", "On compte les pics de réchauffement du cycle", "On lit la température la plus basse", "On additionne les deux dates"],
      reponse: "On calcule l'écart entre les deux dates",
      explication: "La durée, c'est la différence entre la date de la fin et celle du début. On calcule ainsi chaque période glaciaire, puis leur moyenne.", source: C(10) },
    { id: "svt-s05-1-q12", fiche: "svt-s05-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Pour trouver la durée moyenne, on additionne les durées des quatre périodes glaciaires puis on divise par quatre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est la définition d'une moyenne. Somme des quatre durées, divisée par quatre.", source: C(10) },
    { id: "svt-s05-1-q13", fiche: "svt-s05-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Une période glaciaire dure en moyenne dix mille ans.",
      corrections: ["Faux : elle dure en moyenne quatre-vingt-dix mille ans ; ce sont les interglaciaires qui durent environ dix mille ans.", "Faux : elle dure en moyenne un million d'années.", "Faux : elle dure en moyenne un siècle."],
      reponse: { vrai: false, correction: "Faux : elle dure en moyenne quatre-vingt-dix mille ans ; ce sont les interglaciaires qui durent environ dix mille ans." },
      explication: "La moyenne des quatre périodes glaciaires est de quatre-vingt-dix mille ans. Dix mille ans, c'est la durée approximative d'une interglaciaire.", source: C(10) },
    { id: "svt-s05-1-q14", fiche: "svt-s05-1-f2", type: "qcm", niveau: 3,
      enonce: "Les quatre périodes glaciaires durent soixante-dix mille, quatre-vingt mille, cent mille et cent dix mille ans. Quelle est leur durée moyenne ?",
      choix: ["Quatre-vingt-dix mille ans", "Soixante-dix mille ans", "Cent dix mille ans", "Trois cent soixante mille ans"],
      reponse: "Quatre-vingt-dix mille ans",
      explication: "La somme fait trois cent soixante mille ans. Divisée par quatre, elle donne quatre-vingt-dix mille ans.", indice: "Additionne les quatre durées, puis divise par quatre.", source: C(10) },
    { id: "svt-s05-1-q16", fiche: "svt-s05-1-f2", type: "qcm", niveau: 1,
      enonce: "Combien de temps durent, à peu près, les périodes interglaciaires ?",
      choix: ["Environ dix mille ans", "Environ quatre-vingt-dix mille ans", "Environ cent ans", "Environ un million d'années"],
      reponse: "Environ dix mille ans",
      explication: "Les pics de réchauffement durent environ dix mille ans. C'est bien plus court que les périodes glaciaires.", source: C(10) },
    // f3 : ce qu'une moyenne ne dit pas
    { id: "svt-s05-1-q18", fiche: "svt-s05-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Deux élèves peuvent avoir la même moyenne avec des notes très différentes.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : quatre notes identiques ou quatre notes très écartées peuvent donner la même moyenne. C'est la leçon des sept nains.", source: C(10) },
    { id: "svt-s05-1-q19", fiche: "svt-s05-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Une moyenne indique à elle seule si les valeurs sont régulières ou très dispersées.",
      corrections: ["Faux : une moyenne ne montre ni la taille des écarts ni leur nombre.", "Faux : une moyenne montre seulement la valeur la plus haute.", "Faux : une moyenne indique toujours la note la plus fréquente."],
      reponse: { vrai: false, correction: "Faux : une moyenne ne montre ni la taille des écarts ni leur nombre." },
      explication: "La moyenne résume, mais elle cache les écarts. Il faut regarder les valeurs elles-mêmes pour voir leur dispersion.", source: C(10) },
    { id: "svt-s05-1-q20", fiche: "svt-s05-1-f3", type: "qcm", niveau: 2,
      enonce: "Une température très éloignée de la moyenne calculée sur trente ans, qu'est-ce que cela prouve ?",
      choix: ["Rien : ce n'est pas le signe d'un changement de climat", "Que le climat a changé pour de bon dans cette région", "Que la moyenne a été mal calculée", "Que l'hiver sera plus froid"],
      reponse: "Rien : ce n'est pas le signe d'un changement de climat",
      explication: "Une valeur isolée peut s'écarter beaucoup de la moyenne sans que celle-ci change. Le climat se juge sur l'ensemble des mesures.", source: C(10) },
    { id: "svt-s05-1-q21", fiche: "svt-s05-1-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi une hausse de 2 °C de la température moyenne du globe est-elle un grand changement ?",
      choix: ["Parce que l'ensemble des températures mesurées a monté", "Parce que 2 °C, c'est la différence entre l'été et l'hiver", "Parce qu'une seule journée très chaude suffit à la provoquer", "Parce que la moyenne se calcule sur une seule année"],
      reponse: "Parce que l'ensemble des températures mesurées a monté",
      explication: "Pour faire monter une moyenne de deux points, il faut que l'ensemble des valeurs soit plus élevé. Une seule journée chaude ne suffit pas.", source: C(10) },
    { id: "svt-s05-1-q23", fiche: "svt-s05-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque série de notes à ce qu'elle montre.",
      gauche: ["Quatre notes identiques", "Des notes qui montent de 0 à 9", "Des notes qui alternent 9 et 1", "Les notes 5, 5, 5, 5 et les notes 9, 1, 9, 1"],
      droite: ["La même moyenne", "De très grands écarts", "Le travail le plus régulier", "La meilleure progression"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Régularité, progression, écarts : la moyenne ne distingue rien de tout cela. Des notes très différentes peuvent donner exactement la même moyenne.", source: C(10) },
    { id: "svt-s05-1-q39", fiche: "svt-s05-1-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Quelles affirmations sur la moyenne sont justes ? (plusieurs réponses)",
      choix: ["Elle se calcule en additionnant les valeurs puis en divisant par leur nombre", "Elle ne montre pas la taille des écarts", "Elle ne montre pas le nombre des écarts", "Elle est toujours égale à la valeur la plus fréquente", "Elle est toujours la plus grande des valeurs"],
      reponse: ["Elle se calcule en additionnant les valeurs puis en divisant par leur nombre", "Elle ne montre pas la taille des écarts", "Elle ne montre pas le nombre des écarts"],
      explication: "La moyenne est une somme divisée par un nombre de valeurs. Elle ne dit rien des écarts, et elle n'est ni la valeur la plus fréquente ni la plus grande.", source: C(10) },
    // f4 : lire les cartes de pollens
    { id: "svt-s05-1-q24", fiche: "svt-s05-1-f4", type: "qcm", niveau: 1,
      enonce: "Sur une carte de pollens fossiles, que veut dire une zone sans aucun pollen d'arbre ?",
      choix: ["À cette époque, aucune forêt n'y poussait", "Il y avait des forêts très denses", "La zone était sous la mer", "La zone était couverte de neige toute l'année"],
      reponse: "À cette époque, aucune forêt n'y poussait",
      explication: "Les pollens tombent dans les sédiments et s'y conservent. Pas de pollen d'arbre, donc pas de forêt à cette époque.", source: C(10) },
    { id: "svt-s05-1-q26", fiche: "svt-s05-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Il y a cinq mille ans, l'Europe était presque entièrement couverte de forêts.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la carte d'il y a cinq mille ans est verte partout. Les sédiments de cette époque sont pleins de pollens d'arbres.", source: C(10) },
    { id: "svt-s05-1-q27", fiche: "svt-s05-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Il y a dix-huit mille ans, les forêts couvraient toute l'Europe.",
      corrections: ["Faux : les arbres ne poussaient que dans quelques zones bien délimitées.", "Faux : il n'y avait plus aucun arbre nulle part en Europe.", "Faux : l'Europe était entièrement sous la mer."],
      reponse: { vrai: false, correction: "Faux : les arbres ne poussaient que dans quelques zones bien délimitées." },
      explication: "La carte d'il y a dix-huit mille ans est presque toute blanche. Seules quelques zones vertes gardent des forêts.", source: C(10) },
    { id: "svt-s05-1-q28", fiche: "svt-s05-1-f4", type: "qcm", niveau: 2,
      enonce: "Où trouve-t-on les pollens fossiles qui servent à dresser ces cartes ?",
      choix: ["Dans les sédiments déposés à cette époque", "Dans l'air d'aujourd'hui", "Sur les feuilles des arbres qui poussent aujourd'hui", "Dans la glace des pôles"],
      reponse: "Dans les sédiments déposés à cette époque",
      explication: "Les pollens se sont conservés dans les sédiments de chaque époque. On les retrouve en fouillant ces couches.", source: C(10) },
    { id: "svt-s05-1-q29", fiche: "svt-s05-1-f4", type: "qcm", niveau: 3,
      enonce: "Comment des pollens vieux de milliers d'années renseignent-ils sur le climat ?",
      choix: ["Ils indiquent quels végétaux poussaient, donc le climat qui leur convenait", "Ils donnent la température exacte de chaque année", "Ils montrent la direction des vents", "Ils indiquent la quantité de pluie tombée chaque mois au millimètre près"],
      reponse: "Ils indiquent quels végétaux poussaient, donc le climat qui leur convenait",
      explication: "Beaucoup de pollens d'arbres, c'est une forêt, donc un climat qui permet aux arbres de pousser. Presque pas de pollens, c'est un paysage sans arbres, comme la toundra.", source: C(10) },
    // f5 : la toundra de l'Europe glaciaire
    { id: "svt-s05-1-q31", fiche: "svt-s05-1-f5", type: "qcm", niveau: 1,
      enonce: "Quel paysage couvrait la majeure partie de l'Europe il y a dix-huit mille ans ?",
      choix: ["La toundra", "La forêt tropicale", "Le désert de sable", "La savane"],
      reponse: "La toundra",
      explication: "Sans arbres ou presque, l'Europe glaciaire était une toundra. C'est le paysage des climats très froids.", source: C(11) },
    { id: "svt-s05-1-q32", fiche: "svt-s05-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi les forêts d'il y a dix-huit mille ans se trouvaient-elles surtout dans les grandes vallées ?",
      choix: ["Parce que les vallées, plus encaissées, étaient moins froides", "Parce qu'il y pleuvait davantage", "Parce que les rivières transportaient les graines", "Parce que les hommes y plantaient des arbres pour se chauffer"],
      reponse: "Parce que les vallées, plus encaissées, étaient moins froides",
      explication: "Les vallées encaissées étaient plus abritées et moins froides. Des arbres bas pouvaient y pousser.", source: C(11) },
    { id: "svt-s05-1-q33", fiche: "svt-s05-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Il y a dix-huit mille ans, l'Europe était en pleine période glaciaire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'était la dernière période glaciaire. La toundra des cartes de pollens en est la trace.", source: C(11) },
    { id: "svt-s05-1-q34", fiche: "svt-s05-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Dans les zones blanches des cartes d'il y a dix-huit mille ans, il n'y avait aucun végétal.",
      corrections: ["Faux : il n'y avait pas d'arbres, mais il pouvait y avoir des herbes selon la saison.", "Faux : il y avait des forêts denses.", "Faux : il y avait des cultures de blé."],
      reponse: { vrai: false, correction: "Faux : il n'y avait pas d'arbres, mais il pouvait y avoir des herbes selon la saison." },
      explication: "Le blanc signale l'absence de pollens d'arbres, pas l'absence de toute plante. Une prairie poussait l'été.", source: C(11) },
    { id: "svt-s05-1-q35", fiche: "svt-s05-1-f5", type: "qcm", niveau: 2,
      enonce: "À quoi ressemble la toundra au fil de l'année ?",
      choix: ["Une prairie l'été, de la neige l'hiver", "Une forêt dense et sombre toute l'année", "Un désert de sable brûlant", "Un marais tropical"],
      reponse: "Une prairie l'été, de la neige l'hiver",
      explication: "La toundra est couverte d'herbes à la belle saison et de neige en hiver. Les arbres n'y poussent pas.", source: C(11) },
    { id: "svt-s05-1-q36", fiche: "svt-s05-1-f5", type: "qcm", niveau: 1,
      enonce: "Où trouve-t-on encore aujourd'hui un paysage de toundra, avec des rennes ?",
      choix: ["Dans le nord de l'Europe", "Autour de la Méditerranée", "Dans le Sahara", "En Amazonie"],
      reponse: "Dans le nord de l'Europe",
      explication: "Le nord de l'Europe garde aujourd'hui ce paysage. Les rennes y vivent encore.", source: C(11) },
    { id: "svt-s05-1-q37", fiche: "svt-s05-1-f5", type: "qcm", niveau: 3,
      enonce: "Comment les pollens fossiles montrent-ils que le climat d'il y a dix-huit mille ans était très froid ?",
      choix: ["Presque aucun pollen d'arbre : le paysage était une toundra", "Beaucoup de pollens d'arbres, donc de grandes forêts", "Des glaciers recouvraient alors tout le continent, jusqu'à la Méditerranée", "On y trouve des pollens de palmiers"],
      reponse: "Presque aucun pollen d'arbre : le paysage était une toundra",
      explication: "Pas de pollens d'arbres, donc pas de forêts : le paysage était une toundra. Or la toundra est typique du grand froid.", source: C(11) }
  ],
  bonus: [
    {
      id: "svt-s05-1-b1", fiche: "svt-s05-1-f1",
      titre: "Les carottes de glace, mémoire du climat",
      texte: "Pour connaître les climats anciens, les scientifiques forent les calottes glaciaires et remontent de longs cylindres de glace : des carottes. Plus on descend, plus la glace est vieille : en Antarctique, le projet européen EPICA est remonté huit cent mille ans en arrière. Les bulles d'air prisonnières de la glace renseignent sur l'atmosphère du passé, et la glace elle-même sur la température d'autrefois.",
      source: { titre: "Carotte de glace", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Carotte_de_glace" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 4 n'est pas déposée : les causes des cycles glaciaires et la partie « prospective » (ce que le climat pourrait devenir) ne sont pas dans le jeu.",
    "Le graphique des cycles glaciaires lui-même (température ou volume de glace en fonction du temps) : seules les dates et durées relevées dans le corrigé sont reprises.",
    "Le quaternaire : la période n'est pas définie dans le corrigé.",
    "Les cartes de pollens : elles ne sont pas reproduites ; le jeu reprend seulement ce que le corrigé en dit."
  ]
};
