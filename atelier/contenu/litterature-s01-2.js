// Source en clair du cours litterature-s01-2 (livret 1, cours 1 : la leçon littéraire, p. 9 à 11 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/litterature-s01-2.js.
// Source déposée : le corrigé du livret 1, page 1 (« Chapitre I - Cours 1 », rubrique « Questions sur le cours »).
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
// Audit du 2026-10-15 (difficulté relevée, 7 réussites sur 10) : leurres pris dans les notions voisines du cours
// (hyperbole, énumération, étymologie), affirmations fausses à un seul détail près, questions q21 à q35 ajoutées.
// Devoir 1 (litterature-d1) : rien de son texte, de son auteur, ni mer, vagues, soleil ou rochers dans les exemples.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 1 };
// Audit des questions du 28/10/2026 appliqué : q29 et q33 (doublons) supprimées ; q21 et q16 réécrites depuis la fiche ;
// q30 devenue question de thème (étymologie d'« hyperbole »), la fiche f3 n'ayant qu'un exemple d'étymologie.
const THEME = "Cours 1 – Lire la leçon littéraire p9 à 11"; // intitulé du planning, pour les questions de thème (règle du 25/10/2026)
const T = (titre, page) => ({ theme: THEME, titre, editeur: "Wikipédia", url: "https://fr.wikipedia.org/wiki/" + page });

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
      texte: "Quand on te demande de relever une hyperbole ou une énumération, recopier la phrase ne suffit pas. Voici la marche à suivre : dire ce qu'est le procédé, citer le passage, montrer pourquoi il en est un, puis expliquer ce qu'il apporte au récit, par exemple une peur plus forte ou un manque qu'on fait sentir.",
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
      choix: ["Une exagération", "Une liste d'éléments cités à la suite", "L'origine d'un mot et son ancien sens", "Une phrase qui dit les choses telles qu'elles sont"],
      reponse: "Une exagération",
      explication: "L'hyperbole exagère ce qu'on dit ou ce qui se passe. Elle dit les choses plus fort qu'elles ne sont.",
      indice: "Elle grossit la réalité.", source: S },
    { id: "litterature-s01-2-q2", fiche: "litterature-s01-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dire « Je suis mort ! » après une journée épuisante, c'est faire une hyperbole.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "On n'est pas vraiment mort : on exagère sa fatigue. C'est bien une hyperbole.", source: S },
    { id: "litterature-s01-2-q3", fiche: "litterature-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi un narrateur glisse-t-il une hyperbole dans une scène de danger ?",
      choix: ["Pour rendre la situation plus effrayante", "Pour faire sentir que les héros manquent de tout", "Pour décrire le danger sans rien grossir", "Pour rassurer le lecteur sur la suite"],
      reponse: "Pour rendre la situation plus effrayante",
      explication: "L'exagération renforce l'effet de la scène : le lecteur sent mieux la peur et le choc. Faire sentir un manque, c'est plutôt le rôle d'une énumération.", source: S },
    { id: "litterature-s01-2-q4", fiche: "litterature-s01-2-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Lesquelles de ces phrases sont des hyperboles ?",
      choix: ["Je te l'ai répété mille fois.", "Je meurs de faim.", "Ce cartable pèse une tonne.", "Ce cartable pèse trois kilos.", "J'ai pris un stylo, une gomme et une règle."],
      reponse: ["Je te l'ai répété mille fois.", "Je meurs de faim.", "Ce cartable pèse une tonne."],
      explication: "Mille fois, mourir de faim, peser une tonne : ces phrases grossissent la réalité. Trois kilos est un poids réaliste, et la liste d'objets est une énumération.",
      indice: "Cherche les phrases qui grossissent la réalité.", source: S },
    { id: "litterature-s01-2-q5", fiche: "litterature-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Dans une scène de danger, l'hyperbole rend la situation moins effrayante, pour rassurer le lecteur.",
      corrections: ["Faux : elle rend la situation plus effrayante, elle renforce l'effet.", "Faux : elle rend la scène plus drôle, pour détendre le lecteur.", "Faux : elle n'a aucun effet, elle décrit la scène telle qu'elle est."],
      reponse: { vrai: false, correction: "Faux : elle rend la situation plus effrayante, elle renforce l'effet." },
      explication: "En exagérant, l'hyperbole renforce l'effet de la scène. Le danger paraît plus grand et plus désespéré.", source: S },
    { id: "litterature-s01-2-q21", fiche: "litterature-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Dire « j'ai pleuré toutes les larmes de mon corps », c'est faire une hyperbole.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Personne ne pleure vraiment toutes ses larmes : on grossit le chagrin. Cette exagération est une hyperbole.", source: S },
    { id: "litterature-s01-2-q22", fiche: "litterature-s01-2-f1", type: "qcm", niveau: 3,
      enonce: "« Ce devoir m'a pris des siècles. » Quel effet produit cette hyperbole ?",
      choix: ["Elle fait sentir un travail interminable", "Elle donne la durée réelle du travail", "Elle énumère toutes les étapes du travail", "Elle montre que le travail était très facile"],
      reponse: "Elle fait sentir un travail interminable",
      explication: "Personne ne travaille des siècles : on grossit la durée pour dire que le devoir a semblé sans fin. L'hyperbole renforce cette impression.", source: S },
    { id: "litterature-s01-2-q23", fiche: "litterature-s01-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "L'hyperbole dit les choses moins fort qu'elles ne sont.",
      corrections: ["Faux : elle les dit plus fort qu'elles ne sont, elle exagère.", "Faux : elle les dit exactement comme elles sont.", "Faux : elle les dit sous la forme d'une liste."],
      reponse: { vrai: false, correction: "Faux : elle les dit plus fort qu'elles ne sont, elle exagère." },
      explication: "L'hyperbole est une exagération : elle grossit la réalité. Dire les choses sous forme de liste, c'est une énumération.", source: S },
    { id: "litterature-s01-2-q24", fiche: "litterature-s01-2-f1", type: "trou", niveau: 2,
      enonce: "Écris le nom du procédé.",
      texte: "Dire « j'ai mille devoirs ce soir » quand on n'en a que trois, c'est faire une ___.",
      reponse: [["hyperbole"]],
      explication: "On grossit le nombre de devoirs : c'est une exagération. Ce procédé s'appelle une hyperbole.", source: S },

    // f2 : l'énumération
    { id: "litterature-s01-2-q6", fiche: "litterature-s01-2-f2", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une énumération ?",
      choix: ["Plusieurs éléments cités à la suite", "Une exagération pour frapper le lecteur", "L'origine d'un mot et son ancien sens", "Une phrase de conclusion"],
      reponse: "Plusieurs éléments cités à la suite",
      explication: "L'énumération cite plusieurs éléments à la suite. Elle ressemble à une liste.", source: S },
    { id: "litterature-s01-2-q7", fiche: "litterature-s01-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "« J'ai acheté du pain, des pommes, du lait et du fromage. » Cette phrase contient une énumération.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "La phrase cite quatre achats à la suite. C'est bien une énumération.", source: S },
    { id: "litterature-s01-2-q8", fiche: "litterature-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi un narrateur énumère-t-il tout ce que possèdent des naufragés, avant d'ajouter que c'est tout ?",
      choix: ["Pour faire sentir qu'ils n'ont presque rien", "Pour montrer qu'ils ont tout ce qu'il leur faut", "Pour exagérer leur fatigue et leur peur", "Pour ralentir le récit sans rien dire"],
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
      corrections: ["Faux : elle peut faire sentir quelque chose au lecteur, par exemple le manque de presque tout.", "Faux : elle a toujours le même effet, rendre la scène effrayante.", "Faux : elle sert seulement à exagérer, comme une hyperbole."],
      reponse: { vrai: false, correction: "Faux : elle peut faire sentir quelque chose au lecteur, par exemple le manque de presque tout." },
      explication: "Une énumération agit sur le lecteur. Par exemple, la maigre liste des affaires de naufragés fait sentir leur dénuement.", source: S },
    { id: "litterature-s01-2-q25", fiche: "litterature-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Une courte phrase placée juste après une liste peut la fermer et en renforcer l'effet.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Après la liste, une petite phrase comme « c'est tout » la referme. Elle appuie l'idée que la liste fait sentir.", source: S },
    { id: "litterature-s01-2-q26", fiche: "litterature-s01-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles phrases contiennent une énumération ?",
      choix: ["Dans mon sac : un stylo, une gomme, une règle et un cahier.", "J'ai attendu cent ans devant la porte.", "Il a rangé ses chaussettes, ses pulls et ses tee-shirts.", "Le chien dort sur le tapis.", "Nous avons vu des vaches, des moutons et des chèvres."],
      reponse: ["Dans mon sac : un stylo, une gomme, une règle et un cahier.", "Il a rangé ses chaussettes, ses pulls et ses tee-shirts.", "Nous avons vu des vaches, des moutons et des chèvres."],
      explication: "Les bonnes phrases citent plusieurs éléments à la suite. « Cent ans » est une exagération, et le chien qui dort ne forme aucune liste.",
      indice: "Cherche les phrases qui citent plusieurs choses à la suite.", source: S },
    { id: "litterature-s01-2-q27", fiche: "litterature-s01-2-f2", type: "qcm", niveau: 3,
      enonce: "« Dans mon frigo : un yaourt, une pomme, un reste de pâtes. C'est tout. » Quel effet produit cette énumération ?",
      choix: ["Elle fait sentir le manque de nourriture", "Elle montre que le frigo est plein à craquer", "Elle exagère la faim de celui qui parle", "Elle décrit le frigo à l'aide d'une image"],
      reponse: "Elle fait sentir le manque de nourriture",
      explication: "La liste est courte et fermée par « c'est tout » : on sent qu'il n'y a presque rien. Elle fait sentir un manque, comme le dénuement de naufragés.", source: S },
    { id: "litterature-s01-2-q28", fiche: "litterature-s01-2-f2", type: "qcm", niveau: 3,
      enonce: "« J'ai rangé mes livres, mes jeux, mes habits et mes chaussures : il m'a fallu mille ans ! » Quels procédés trouve-t-on dans cette phrase ?",
      choix: ["Une énumération et une hyperbole", "Une énumération seulement", "Une hyperbole seulement", "Une étymologie et une énumération"],
      reponse: "Une énumération et une hyperbole",
      explication: "Les livres, les jeux, les habits et les chaussures sont cités à la suite : c'est une énumération. « Mille ans » grossit la durée du rangement : c'est une hyperbole.", source: S },

    // f3 : l'étymologie
    { id: "litterature-s01-2-q11", fiche: "litterature-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Le mot « cinéma » vient du grec kinêma. Que veut dire kinêma ?",
      choix: ["Mouvement", "Lumière", "Image", "Spectacle"],
      reponse: "Mouvement",
      explication: "Kinêma signifie « mouvement » en grec. C'est l'étymologie du mot « cinéma ».", source: S },
    { id: "litterature-s01-2-q12", fiche: "litterature-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "L'étymologie d'un mot, c'est la liste des mots qui veulent dire la même chose.",
      corrections: ["Faux : c'est son origine, le mot dont il vient et son sens.", "Faux : c'est la liste des mots de sens contraire.", "Faux : c'est la façon de bien prononcer le mot."],
      reponse: { vrai: false, correction: "Faux : c'est son origine, le mot dont il vient et son sens." },
      explication: "L'étymologie raconte d'où vient un mot. Pour « cinéma », c'est le grec kinêma.", source: S },
    { id: "litterature-s01-2-q13", fiche: "litterature-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment explique-t-on l'étymologie du mot « cinéma » ?",
      choix: ["On donne le mot grec d'origine et son sens", "On cherche des mots qui veulent dire la même chose", "On décrit ce qu'on voit dans une salle de cinéma", "On dit ce que le mot veut dire aujourd'hui"],
      reponse: "On donne le mot grec d'origine et son sens",
      explication: "L'étymologie, c'est l'origine du mot. On donne donc le mot grec kinêma et son sens, « mouvement ».", source: S },
    { id: "litterature-s01-2-q14", fiche: "litterature-s01-2-f3", type: "trou", niveau: 2,
      enonce: "Écris le mot qui manque.",
      texte: "Remonter au mot dont un autre mot vient, et retrouver ce qu'il voulait dire, c'est chercher son ___.",
      reponse: [["étymologie"]],
      explication: "L'étymologie, c'est l'origine d'un mot. Pour « cinéma », c'est le grec kinêma, « mouvement ».", source: S },
    { id: "litterature-s01-2-q15", fiche: "litterature-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Le mot « cinéma » vient d'un mot grec.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Il vient du grec kinêma. Ce mot veut dire « mouvement ».", source: S },
    { id: "litterature-s01-2-q30", fiche: "litterature-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Le mot « hyperbole » vient du grec huperbolê, formé de hyper, « au-delà », et de ballein, « jeter ». Que raconte cette étymologie ?",
      choix: ["Elle « lance au-delà » : elle dépasse la réalité", "Elle parle à voix basse, sans jamais rien grossir", "Elle range les mots les uns après les autres, en liste", "Elle remonte à l'origine d'un mot et à son ancien sens"],
      reponse: "Elle « lance au-delà » : elle dépasse la réalité",
      explication: "Jeter au-delà, c'est aller plus loin que la réalité : l'hyperbole exagère. Son nom grec raconte déjà ce qu'elle fait.",
      indice: "Au-delà de quoi va une exagération ?", source: T("Hyperbole (rhétorique)", "Hyperbole_(rh%C3%A9torique)") },
    { id: "litterature-s01-2-q31", fiche: "litterature-s01-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque mot à ce qu'il désigne.",
      gauche: ["étymologie", "kinêma", "hyperbole", "énumération"],
      droite: ["une exagération", "l'origine d'un mot", "une suite d'éléments cités comme une liste", "un mot grec qui veut dire « mouvement »"],
      reponse: [[0, 1], [1, 3], [2, 0], [3, 2]],
      explication: "L'étymologie est l'origine d'un mot ; kinêma est le mot grec d'où vient « cinéma ». L'hyperbole exagère, l'énumération cite des éléments à la suite.", source: S },

    // f4 : relever un procédé et dire ce qu'il apporte
    { id: "litterature-s01-2-q16", fiche: "litterature-s01-2-f4", type: "ordre", niveau: 3,
      enonce: "Range dans l'ordre les étapes d'une bonne réponse à « Relève une hyperbole : qu'apporte-t-elle au récit ? ».",
      elements: ["Expliquer ce qu'elle apporte au récit", "Citer le passage entre guillemets", "Montrer pourquoi le passage exagère"],
      reponse: [1, 2, 0],
      explication: "On cite d'abord le passage, puis on prouve qu'il exagère. On finit par l'effet sur le récit.",
      indice: "Citer, prouver, expliquer.", source: S },
    { id: "litterature-s01-2-q17", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment répondre à la question « qu'apporte-t-elle au récit ? » après avoir relevé une hyperbole ?",
      choix: ["En expliquant l'effet qu'elle produit", "En recopiant la phrase entre guillemets", "En définissant ce qu'est une hyperbole", "En résumant toute l'histoire du livre"],
      reponse: "En expliquant l'effet qu'elle produit",
      explication: "Ce qu'apporte un procédé, c'est son effet, par exemple une scène qui fait plus peur. Citer et définir viennent avant, mais ne répondent pas à cette question.", source: S },
    { id: "litterature-s01-2-q18", fiche: "litterature-s01-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Pour relever une hyperbole, il suffit de recopier la phrase, sans rien expliquer.",
      corrections: ["Faux : il faut aussi montrer qu'elle exagère et dire ce qu'elle apporte au récit.", "Faux : il faut la réécrire avec ses propres mots, sans la citer.", "Faux : il faut seulement dire ce qu'est une hyperbole, sans citer."],
      reponse: { vrai: false, correction: "Faux : il faut aussi montrer qu'elle exagère et dire ce qu'elle apporte au récit." },
      explication: "Citer ne suffit pas : il faut aussi prouver que le passage exagère. Puis on explique ce qu'il apporte au récit.", source: S },
    { id: "litterature-s01-2-q19", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Un élève définit l'énumération, la cite entre guillemets et montre que c'est bien une liste. Que manque-t-il encore à sa réponse ?",
      choix: ["L'effet de la liste sur le récit", "Une deuxième citation du passage", "Le nombre exact de mots cités", "Une hyperbole tirée du même texte"],
      reponse: "L'effet de la liste sur le récit",
      explication: "Il a défini, cité et prouvé, mais il n'a pas expliqué l'effet. Il doit dire, par exemple, que la liste fait sentir un manque.", source: S },
    { id: "litterature-s01-2-q20", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi faut-il citer le passage entre guillemets dans sa réponse ?",
      choix: ["Pour prouver avec les mots exacts du texte", "Pour ne plus avoir besoin d'expliquer l'effet", "Pour montrer qu'on a lu tout le livre", "Pour rendre la réponse plus longue"],
      reponse: "Pour prouver avec les mots exacts du texte",
      explication: "La citation sert de preuve : on montre dans le texte ce qu'on affirme. Ensuite seulement, on explique l'effet.", source: S },
    { id: "litterature-s01-2-q32", fiche: "litterature-s01-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Pour prouver qu'un passage est une hyperbole, on montre qu'il dit les choses plus fort qu'elles ne sont.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Prouver, c'est montrer que le passage exagère : ce qu'il dit n'est pas vrai à la lettre. Ensuite seulement, on explique l'effet.", source: S },
    { id: "litterature-s01-2-q34", fiche: "litterature-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Un élève définit l'hyperbole, cite le passage, puis explique tout de suite son effet. Quelle étape a-t-il sautée ?",
      choix: ["Montrer pourquoi le passage exagère", "Donner l'étymologie du mot « hyperbole »", "Recopier le passage une seconde fois", "Résumer le récit"],
      reponse: "Montrer pourquoi le passage exagère",
      explication: "Entre la citation et l'effet, il faut prouver que le passage exagère. Sans cette preuve, la réponse n'est pas justifiée.", source: S },
    { id: "litterature-s01-2-q35", fiche: "litterature-s01-2-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Quelles étapes font partie d'une bonne réponse quand on relève une énumération ?",
      choix: ["Dire ce qu'est une énumération", "Citer le passage entre guillemets", "Expliquer ce que la liste apporte au récit", "Remplacer la citation par un résumé", "Donner son avis sur le livre"],
      reponse: ["Dire ce qu'est une énumération", "Citer le passage entre guillemets", "Expliquer ce que la liste apporte au récit"],
      explication: "On définit, on cite, on prouve, puis on explique l'effet. Résumer au lieu de citer, ou donner son avis, ne justifie rien.", source: S }
  ],
  bonus: [
    {
      id: "litterature-s01-2-b1",
      fiche: "litterature-s01-2-f3",
      titre: "Choucroute : une fausse piste",
      texte: "« Étymologie » remonte au grec etumos, « vrai ». Mais attention : on croit voir « chou » et « croûte » dans « choucroute », alors que ce mot vient d'un parler allemand : surkrut, « chou aigre ». Ce rapprochement trompeur s'appelle une étymologie populaire.",
      source: { titre: "étymologie", editeur: "Dictionnaire de français Larousse", url: "https://www.larousse.fr/dictionnaires/francais/%C3%A9tymologie/31605" }
    }
  ],
  nonCouvert: [
    "La leçon littéraire elle-même (livret 1, pages 9 à 11, et la page 12 citée par l'emploi du temps) n'est pas déposée : seules les réponses du corrigé le sont, et les notions en sont tirées.",
    "La définition de l'énumération donnée par la leçon : le corrigé en commente seulement un exemple.",
    "Le résumé de la leçon et les outils de la langue à apprendre.",
    "Les extraits lus (livret, pages 7 et 8) ne sont pas déposés. Les réponses de compréhension du corrigé qui portent sur eux (page 1) relèvent de la lecture des textes (litterature-s01-1) et ne sont pas reprises ici."
  ]
};
