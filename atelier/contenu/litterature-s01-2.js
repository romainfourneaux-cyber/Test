// Source en clair du cours litterature-s01-2 (livret 1, cours 1 : la leçon littéraire, p. 9 à 11 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/litterature-s01-2.js.
// Source déposée : le corrigé du livret 1, page 1 (« Chapitre I - Cours 1 », rubrique « Questions sur le cours »).
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 1 };

module.exports = {
  id: "litterature-s01-2",
  fiches: [
    {
      id: "litterature-s01-2-f1", notion: "L'hyperbole",
      titre: "L'hyperbole : exagérer pour frapper",
      texte: "L'hyperbole est une exagération : on dit les choses plus fort qu'elles ne sont. Dans un récit, montrer un personnage comme réduit à rien alors qu'il vit encore rend la scène plus effrayante et fait sentir le choc subi. On en fait aussi tous les jours : « Je suis mort ! » après une journée épuisante.",
      pointsCles: [
        "Hyperbole : une façon d'exagérer ce qu'on dit ou ce qui se passe",
        "Dans un récit, elle renforce l'effet : la situation paraît plus effrayante, plus désespérée",
        "On en emploie à l'oral : « je suis mort » après un gros effort"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "hyperbole", def: "une façon d'exagérer ce qu'on dit ou ce qui se passe, pour frapper davantage" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s01-2-f2", notion: "L'énumération",
      titre: "L'énumération : une liste qui en dit long",
      texte: "Une énumération cite plusieurs éléments à la suite, comme une liste. Elle n'est pas là par hasard. Quand un narrateur passe en revue tout ce que possèdent des naufragés, puis ajoute que c'est tout, la liste fait sentir combien ils ont peu de choses : leur dénuement.",
      pointsCles: [
        "Énumération : plusieurs éléments cités les uns après les autres",
        "Elle produit un effet : ici, faire sentir le manque de presque tout",
        "Une courte phrase après la liste peut la fermer et appuyer l'idée"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "énumération", def: "une suite de plusieurs éléments cités les uns après les autres, comme une liste" },
        { mot: "dénuement", def: "la situation de quelqu'un qui n'a presque rien" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s01-2-f3", notion: "L'étymologie d'un mot",
      titre: "D'où vient le mot « cinéma » ?",
      texte: "Chercher l'étymologie d'un mot, c'est remonter au mot dont il vient et retrouver ce qu'il voulait dire. Le mot « cinéma » vient ainsi du grec kinêma, qui signifie « mouvement ».",
      pointsCles: [
        "Étymologie : l'origine d'un mot, le mot dont il vient et son sens",
        "« Cinéma » vient du grec kinêma",
        "Kinêma veut dire « mouvement »"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "étymologie", def: "l'origine d'un mot : le mot dont il vient et ce qu'il voulait dire" },
        { mot: "kinêma", def: "un mot grec qui veut dire « mouvement », à l'origine du mot « cinéma »" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s01-2-f4", notion: "Relever un procédé et dire ce qu'il apporte",
      titre: "Relever, prouver, expliquer",
      texte: "Quand on te demande de relever une hyperbole ou une énumération, recopier la phrase ne suffit pas. Le corrigé montre la marche à suivre : dire ce qu'est le procédé, citer le passage, montrer pourquoi il en est un, puis expliquer ce qu'il apporte au récit, par exemple une peur plus forte ou un manque qu'on fait sentir.",
      pointsCles: [
        "1. Dire ce qu'est le procédé",
        "2. Citer le passage entre guillemets",
        "3. Prouver que c'en est un",
        "4. Expliquer ce qu'il apporte au récit"
      ],
      astuce: "Retiens : définir, citer, prouver, expliquer l'effet.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["litterature-s01-2-f1", "litterature-s01-2-f2"], source: S
    }
  ],
  schemas: [],
  questions: [
    // f1 : l'hyperbole
    { id: "litterature-s01-2-q1", fiche: "litterature-s01-2-f1", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une hyperbole ?",
      choix: ["Une exagération", "Une liste de mots", "L'origine d'un mot", "Une question sans réponse"],
      reponse: "Une exagération",
      explication: "L'hyperbole exagère ce qu'on dit ou ce qui se passe. Elle dit les choses plus fort qu'elles ne sont.",
      indice: "Elle grossit la réalité.", source: S },
    { id: "litterature-s01-2-q2", fiche: "litterature-s01-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dire « Je suis mort ! » après une journée épuisante, c'est faire une hyperbole.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "On n'est pas vraiment mort : on exagère sa fatigue. C'est bien une hyperbole.", source: S },
    { id: "litterature-s01-2-q3", fiche: "litterature-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi un narrateur glisse-t-il une hyperbole dans une scène de danger ?",
      choix: ["Pour rendre la situation plus effrayante et plus forte", "Pour donner l'origine d'un mot", "Pour dire les choses exactement comme elles sont", "Pour ranger les objets dans une liste"],
      reponse: "Pour rendre la situation plus effrayante et plus forte",
      explication: "L'exagération renforce l'effet de la scène. Le lecteur sent mieux la peur et le choc.", source: S },
    { id: "litterature-s01-2-q4", fiche: "litterature-s01-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquelles de ces phrases sont des hyperboles ?",
      choix: ["Je te l'ai répété mille fois !", "Je meurs de faim.", "Il pleut depuis ce matin.", "La porte est fermée.", "Ce cartable pèse une tonne !"],
      reponse: ["Je te l'ai répété mille fois !", "Je meurs de faim.", "Ce cartable pèse une tonne !"],
      explication: "Mille fois, mourir de faim, peser une tonne : ce sont des exagérations. Les deux autres phrases disent simplement ce qui se passe.",
      indice: "Cherche les phrases qui grossissent la réalité.", source: S },
    { id: "litterature-s01-2-q5", fiche: "litterature-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Une hyperbole décrit la réalité exactement comme elle est, sans rien grossir.",
      corrections: ["Faux : l'hyperbole grossit la réalité, elle exagère.", "Faux : l'hyperbole donne l'origine d'un mot.", "Faux : l'hyperbole est une liste d'objets."],
      reponse: { vrai: false, correction: "Faux : l'hyperbole grossit la réalité, elle exagère." },
      explication: "L'hyperbole fait tout le contraire : elle exagère. C'est ce qui la rend frappante.", source: S },

    // f2 : l'énumération
    { id: "litterature-s01-2-q6", fiche: "litterature-s01-2-f2", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une énumération ?",
      choix: ["Une suite d'éléments cités les uns après les autres", "Une exagération", "Un mot venu du grec", "Une phrase qui ne contient qu'un seul mot"],
      reponse: "Une suite d'éléments cités les uns après les autres",
      explication: "L'énumération cite plusieurs éléments à la suite. Elle ressemble à une liste.", source: S },
    { id: "litterature-s01-2-q7", fiche: "litterature-s01-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "« J'ai acheté du pain, des pommes, du lait et du fromage. » Cette phrase contient une énumération.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "La phrase cite quatre achats à la suite. C'est bien une énumération.", source: S },
    { id: "litterature-s01-2-q8", fiche: "litterature-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi un narrateur énumère-t-il tout ce que possèdent des naufragés, avant d'ajouter que c'est tout ?",
      choix: ["Pour faire sentir qu'ils n'ont presque rien", "Pour montrer qu'ils sont très riches", "Pour expliquer l'origine des mots", "Pour exagérer leur fatigue"],
      reponse: "Pour faire sentir qu'ils n'ont presque rien",
      explication: "La liste, fermée par « c'est tout », montre combien leur matériel est maigre. Elle souligne leur dénuement de naufragés.",
      indice: "Pense à ce que veut dire « c'est tout » après une liste.", source: S },
    { id: "litterature-s01-2-q9", fiche: "litterature-s01-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Des mots cités les uns après les autres, comme une liste, forment une ___.",
      banque: ["énumération", "hyperbole", "étymologie", "description"],
      reponse: [["énumération"]],
      explication: "Une liste d'éléments à la suite, c'est une énumération. L'hyperbole, elle, exagère.", source: S },
    { id: "litterature-s01-2-q10", fiche: "litterature-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Dans un récit, une énumération n'a aucun effet : c'est une simple liste.",
      corrections: ["Faux : elle peut faire sentir quelque chose au lecteur, par exemple le manque de presque tout.", "Faux : elle sert uniquement à exagérer.", "Faux : elle sert à donner l'origine d'un mot."],
      reponse: { vrai: false, correction: "Faux : elle peut faire sentir quelque chose au lecteur, par exemple le manque de presque tout." },
      explication: "Une énumération agit sur le lecteur. Dans le cours, elle fait sentir le dénuement de naufragés.", source: S },

    // f3 : l'étymologie
    { id: "litterature-s01-2-q11", fiche: "litterature-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Le mot « cinéma » vient du grec kinêma. Que veut dire kinêma ?",
      choix: ["Mouvement", "Lumière", "Image", "Spectacle"],
      reponse: "Mouvement",
      explication: "Kinêma signifie « mouvement » en grec. C'est l'étymologie du mot « cinéma ».", source: S },
    { id: "litterature-s01-2-q12", fiche: "litterature-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "L'étymologie d'un mot, c'est la liste des mots qui veulent dire la même chose.",
      corrections: ["Faux : c'est son origine, le mot dont il vient et son sens.", "Faux : c'est une exagération.", "Faux : c'est le nombre de lettres du mot."],
      reponse: { vrai: false, correction: "Faux : c'est son origine, le mot dont il vient et son sens." },
      explication: "L'étymologie raconte d'où vient un mot. Pour « cinéma », c'est le grec kinêma.", source: S },
    { id: "litterature-s01-2-q13", fiche: "litterature-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment le corrigé explique-t-il l'étymologie du mot « cinéma » ?",
      choix: ["Il donne le mot grec dont il vient et ce que ce mot veut dire", "Il compte les syllabes du mot", "Il cherche un mot de sens contraire", "Il exagère le sens du mot"],
      reponse: "Il donne le mot grec dont il vient et ce que ce mot veut dire",
      explication: "L'étymologie, c'est l'origine du mot. Le corrigé donne donc le mot grec kinêma et son sens, « mouvement ».", source: S },
    { id: "litterature-s01-2-q14", fiche: "litterature-s01-2-f3", type: "trou", niveau: 2,
      enonce: "Complète la phrase.",
      texte: "Le mot « cinéma » vient du grec kinêma, qui veut dire « ___ ».",
      reponse: [["mouvement"]],
      explication: "Kinêma veut dire « mouvement ». C'est de ce mot grec que vient « cinéma ».", source: S },
    { id: "litterature-s01-2-q15", fiche: "litterature-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Le mot « cinéma » vient d'un mot grec.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Il vient du grec kinêma. Ce mot veut dire « mouvement ».", source: S },

    // f4 : relever un procédé et dire ce qu'il apporte
    { id: "litterature-s01-2-q16", fiche: "litterature-s01-2-f4", type: "ordre", niveau: 2,
      enonce: "Range dans l'ordre suivi par le corrigé les étapes d'une réponse à « Relève une hyperbole : qu'apporte-t-elle au récit ? ».",
      elements: ["Citer le passage entre guillemets", "Dire ce qu'est une hyperbole", "Expliquer ce qu'elle apporte au récit", "Montrer pourquoi le passage exagère"],
      reponse: [1, 0, 3, 2],
      explication: "Le corrigé définit d'abord l'hyperbole, cite le passage et prouve qu'il exagère. Il finit par l'effet sur le récit.",
      indice: "Définir, citer, prouver, expliquer.", source: S },
    { id: "litterature-s01-2-q17", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment répondre à la question « qu'apporte-t-elle au récit ? » après avoir relevé une hyperbole ?",
      choix: ["En expliquant l'effet qu'elle produit sur la scène ou sur le lecteur", "En recopiant tout le texte", "En donnant l'origine grecque de chaque mot", "En comptant les mots de la phrase"],
      reponse: "En expliquant l'effet qu'elle produit sur la scène ou sur le lecteur",
      explication: "Ce qu'apporte un procédé, c'est son effet. Par exemple, une scène qui fait plus peur.", source: S },
    { id: "litterature-s01-2-q18", fiche: "litterature-s01-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Pour relever une hyperbole, il suffit de recopier la phrase, sans rien expliquer.",
      corrections: ["Faux : il faut aussi montrer qu'elle exagère et dire ce qu'elle apporte au récit.", "Faux : il faut seulement donner l'étymologie de chaque mot.", "Faux : il ne faut jamais citer le texte."],
      reponse: { vrai: false, correction: "Faux : il faut aussi montrer qu'elle exagère et dire ce qu'elle apporte au récit." },
      explication: "Citer ne suffit pas : il faut prouver et expliquer. C'est ce que fait le corrigé.", source: S },
    { id: "litterature-s01-2-q19", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Un élève recopie une énumération entre guillemets, puis il s'arrête là. Que manque-t-il à sa réponse ?",
      choix: ["Ce que l'énumération apporte au récit", "Le nombre de pages du livre", "L'étymologie du mot « énumération »", "Une hyperbole en plus"],
      reponse: "Ce que l'énumération apporte au récit",
      explication: "Il a cité le passage, mais il n'a pas expliqué son effet. Il devrait dire, par exemple, que la liste fait sentir un manque.", source: S },
    { id: "litterature-s01-2-q20", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi le corrigé cite-t-il le passage entre guillemets dans sa réponse ?",
      choix: ["Pour appuyer sa réponse sur les mots exacts du texte", "Pour rendre la réponse plus longue", "Pour donner l'origine des mots", "Pour éviter d'expliquer"],
      reponse: "Pour appuyer sa réponse sur les mots exacts du texte",
      explication: "La citation sert de preuve : on montre dans le texte ce qu'on affirme. Ensuite seulement, on explique l'effet.", source: S }
  ],
  bonus: [],
  nonCouvert: [
    "La leçon littéraire elle-même (livret 1, pages 9 à 11, et la page 12 citée par l'emploi du temps) n'est pas déposée : seules les réponses du corrigé le sont, et les notions en sont tirées.",
    "La définition de l'énumération donnée par la leçon : le corrigé en commente seulement un exemple.",
    "Le résumé de la leçon et les outils de la langue à apprendre.",
    "Les extraits lus (livret, pages 7 et 8) ne sont pas déposés. Les réponses de compréhension du corrigé qui portent sur eux (page 1) relèvent de la lecture des textes (litterature-s01-1) et ne sont pas reprises ici."
  ]
};
