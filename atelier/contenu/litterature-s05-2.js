// Source en clair du cours litterature-s05-2 (livret 1, chapitre II, cours 4 : la leçon littéraire, p. 36 à 38 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js litterature-s05-2.
// Source déposée : le corrigé du livret 1, page 3 du PDF (« Chapitre II - Cours 4 », rubrique « Questions sur le cours »).
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
// Devoir 2 (litterature-d2, L'Île au trésor, cours 4 et 5) : son énoncé n'est pas déposé. Par prudence, les questions
// portent sur les notions (énumération d'actions, onomatopée, projections, respect du sujet), jamais sur l'intrigue.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 3 };
// Audit des questions du 28/10/2026 appliqué : q4, q26 et q31 (extrait non déposé, consignes de rédaction) supprimées ;
// q5 et q22 réécrites ; q24, q28, q29 et q30 devenues questions de thème (le schéma du récit), la fiche f4 ne portant
// que la consigne d'une production personnelle.
const THEME = "Cours 4 – Lire la leçon littéraire p36 à 38"; // intitulé du planning, pour les questions de thème (règle du 25/10/2026)
const T = (titre, page) => ({ theme: THEME, titre, editeur: "Wikipédia", url: "https://fr.wikipedia.org/wiki/" + page });

module.exports = {
  id: "litterature-s05-2",
  fiches: [
    {
      id: "litterature-s05-2-f1", notion: "L'énumération d'actions",
      titre: "Une suite d'actions imaginées",
      texte: "Une énumération peut aligner des actions, pas seulement des objets. Plusieurs propositions indépendantes se suivent, chacune avec son verbe. Dans L'Île au trésor, le narrateur Jim Hawkins enchaîne ainsi tout ce qu'il fait en imagination sur l'île vers laquelle il va s'embarquer. Exemple simple : « Je range ma chambre, je ferme la porte, je descends. »",
      pointsCles: [
        "Une énumération peut être une liste d'actions : une proposition indépendante après l'autre",
        "Chaque action a son propre verbe",
        "Dans L'Île au trésor, Jim Hawkins énumère ce qu'il fait en imagination sur l'île"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "énumération d'actions", def: "plusieurs actions citées à la suite, chacune avec son verbe" }
      ],
      schema: null, prerequis: ["litterature-s01-2-f2"], source: S
    },
    {
      id: "litterature-s05-2-f2", notion: "L'onomatopée",
      titre: "Un mot qui fait du bruit",
      texte: "Une onomatopée est un mot qui imite un bruit. On peut décrire l'action d'un personnage au moyen d'une onomatopée : le mot fait entendre le bruit du geste. Par exemple, un pirate menaçant fait « scouic-scouic » avec son poignard. Exemples de tous les jours : « Toc toc ! » à la porte, « Plouf ! » dans l'eau.",
      pointsCles: [
        "Onomatopée : un mot qui imite un bruit",
        "Elle sert à décrire une action par son bruit",
        "Exemples : toc toc, plouf, vroum"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "onomatopée", def: "un mot qui imite un bruit, comme « plouf »" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s05-2-f3", notion: "Les projections d'un personnage",
      titre: "Rêver la suite avant de partir",
      texte: "Se projeter, c'est imaginer à l'avance ce qu'on va vivre. À la veille d'un grand départ, un personnage mêle ses sentiments et ses projections : ce qu'il ressent, et ce qu'il rêve de faire. Avant de s'embarquer, Jim Hawkins se voit déjà explorer l'île et contempler ses paysages. Un récit peut raconter ces rêves comme s'ils étaient vécus.",
      pointsCles: [
        "Projection : ce qu'un personnage imagine de l'avenir",
        "À la veille d'un départ : des sentiments et des projections",
        "Jim Hawkins rêve l'île avant d'y être"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "projection", def: "ce qu'un personnage imagine à l'avance de ce qu'il va vivre" }
      ],
      schema: null, prerequis: ["litterature-s05-2-f1"], source: S
    },
    {
      id: "litterature-s05-2-f4", notion: "Écrire un court récit : respecter le sujet",
      titre: "Le sujet fixe le thème et la longueur",
      texte: "Quand on te demande d'écrire un court récit, le sujet impose deux choses. D'abord le thème : par exemple, les sentiments et les projections d'un personnage à la veille d'un grand départ. Ensuite la longueur : entre 10 et 15 lignes. Avant de rendre, on vérifie les deux : le thème est traité, le nombre de lignes est bon.",
      pointsCles: [
        "Respecter le thème demandé",
        "Respecter le nombre de lignes demandé (ici 10 à 15)",
        "Relire et vérifier les deux avant de rendre"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "sujet", def: "la consigne d'un récit à écrire : son thème et sa longueur" }
      ],
      schema: null, prerequis: ["litterature-s05-2-f3"], source: S
    }
  ],
  schemas: [],
  questions: [
    // f1 : l'énumération d'actions
    { id: "litterature-s05-2-q1", fiche: "litterature-s05-2-f1", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une énumération d'actions ?",
      choix: ["Plusieurs actions citées à la suite, chacune avec son verbe", "Une seule action, décrite longuement et dans tous ses détails", "Un mot qui imite un bruit", "Une exagération pour frapper le lecteur"],
      reponse: "Plusieurs actions citées à la suite, chacune avec son verbe",
      explication: "Une énumération d'actions aligne des propositions indépendantes, chacune avec son verbe. Un mot qui imite un bruit est une onomatopée, et une exagération est une hyperbole.", source: S },
    { id: "litterature-s05-2-q2", fiche: "litterature-s05-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Une énumération ne peut contenir que des objets, jamais des actions.",
      corrections: ["Faux : une énumération peut aussi aligner des actions, une proposition après l'autre.", "Faux : une énumération ne contient que des actions, jamais des objets.", "Faux : une énumération contient toujours exactement trois éléments."],
      reponse: { vrai: false, correction: "Faux : une énumération peut aussi aligner des actions, une proposition après l'autre." },
      explication: "Une énumération peut lister des objets, mais aussi des actions. Jim Hawkins enchaîne ainsi tout ce qu'il fait en imagination sur l'île.", source: S },
    { id: "litterature-s05-2-q3", fiche: "litterature-s05-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment reconnaît-on une énumération d'actions dans un récit ?",
      choix: ["Des propositions indépendantes se suivent, chacune avec son verbe", "Un seul verbe est répété plusieurs fois de suite", "Les phrases deviennent de plus en plus courtes", "Le narrateur s'arrête de raconter pour décrire longuement un lieu"],
      reponse: "Des propositions indépendantes se suivent, chacune avec son verbe",
      explication: "On repère une suite de propositions indépendantes, avec un verbe chacune. Le narrateur multiplie ainsi les actions comme une liste.", source: S },
    { id: "litterature-s05-2-q5", fiche: "litterature-s05-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "« Il saute, il court, il crie, il tombe. » Cette phrase est une énumération d'actions.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Quatre actions se suivent, chacune avec son verbe. C'est bien une énumération d'actions.", source: S },
    { id: "litterature-s05-2-q6", fiche: "litterature-s05-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Parmi ces phrases, lesquelles contiennent une énumération d'actions ? (plusieurs réponses)",
      choix: ["Je lave, j'essuie, je range, je m'assieds.", "Elle ouvre la fenêtre, regarde le ciel, sourit.", "Le sac est lourd.", "Il court comme un lapin.", "Nous prenons le pain, le lait et les œufs."],
      reponse: ["Je lave, j'essuie, je range, je m'assieds.", "Elle ouvre la fenêtre, regarde le ciel, sourit."],
      explication: "Les deux premières phrases alignent des actions, verbe après verbe. La dernière énumère des objets, pas des actions, et « comme un lapin » est une comparaison.", source: S },
    { id: "litterature-s05-2-q7", fiche: "litterature-s05-2-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi Jim Hawkins multiplie-t-il les actions dans son énumération ?",
      choix: ["Pour montrer tout ce qu'il rêve de vivre sur l'île", "Pour prouver qu'il connaît déjà bien l'île", "Pour faire sentir que les naufragés ont peu de choses", "Pour imiter les bruits du navire"],
      reponse: "Pour montrer tout ce qu'il rêve de vivre sur l'île",
      explication: "Chaque action est un rêve de plus : la liste fait sentir tout ce que Jim imagine. Le manque des naufragés, c'était l'énumération du cours 1.", source: S },
    { id: "litterature-s05-2-q8", fiche: "litterature-s05-2-f1", type: "association", niveau: 3,
      enonce: "Relie chaque procédé à sa définition.",
      gauche: ["Énumération d'actions", "Énumération d'objets", "Onomatopée", "Hyperbole"],
      droite: ["Plusieurs choses citées comme une liste", "Un mot qui imite un bruit", "Une exagération", "Plusieurs propositions qui se suivent, chacune avec son verbe"],
      reponse: [[0, 3], [1, 0], [2, 1], [3, 2]],
      explication: "Une énumération d'actions aligne des propositions avec un verbe chacune ; celle d'objets, des choses. L'onomatopée imite un bruit, l'hyperbole exagère.", source: S },
    // f2 : l'onomatopée
    { id: "litterature-s05-2-q9", fiche: "litterature-s05-2-f2", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une onomatopée ?",
      choix: ["Un mot qui imite un bruit", "Une liste de plusieurs actions", "Une exagération volontaire", "Une image qui rapproche deux choses"],
      reponse: "Un mot qui imite un bruit",
      explication: "Une onomatopée imite un bruit, comme « plouf ». Elle sert à décrire une action par son bruit.", source: S },
    { id: "litterature-s05-2-q10", fiche: "litterature-s05-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "« Plouf ! » est une onomatopée.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : « plouf » imite le bruit d'une chute dans l'eau. C'est bien une onomatopée.", source: S },
    { id: "litterature-s05-2-q11", fiche: "litterature-s05-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment une onomatopée décrit-elle une action ?",
      choix: ["Elle fait entendre le bruit du geste", "Elle donne la liste de tout ce que fait le personnage", "Elle exagère la force du personnage", "Elle explique les sentiments du personnage"],
      reponse: "Elle fait entendre le bruit du geste",
      explication: "Avec une onomatopée, le lecteur entend le bruit de l'action. La liste des actions, c'est l'énumération ; l'exagération, l'hyperbole.", source: S },
    { id: "litterature-s05-2-q12", fiche: "litterature-s05-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Parmi ces mots, lesquels sont des onomatopées ? (plusieurs réponses)",
      choix: ["Boum", "Miaou", "Toc toc", "Poignard", "Colline", "Navire"],
      reponse: ["Boum", "Miaou", "Toc toc"],
      explication: "« Boum », « miaou » et « toc toc » imitent des bruits. Poignard, colline et navire nomment des choses, sans imiter de son.", source: S },
    { id: "litterature-s05-2-q13", fiche: "litterature-s05-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Une onomatopée sert à décrire un paysage avec beaucoup de détails.",
      corrections: ["Faux : une onomatopée imite un bruit et sert à décrire une action.", "Faux : une onomatopée est une liste d'actions qui se suivent.", "Faux : une onomatopée exagère un propos pour frapper le lecteur."],
      reponse: { vrai: false, correction: "Faux : une onomatopée imite un bruit et sert à décrire une action." },
      explication: "L'onomatopée imite un bruit : elle sert à faire entendre une action, pas à détailler un paysage. Une description précise, c'est autre chose.", source: S },
    { id: "litterature-s05-2-q14", fiche: "litterature-s05-2-f2", type: "qcm", niveau: 2,
      enonce: "Un personnage claque une porte. Quelle phrase décrit ce geste au moyen d'une onomatopée ?",
      choix: ["La porte fit « vlan ! » derrière lui.", "La porte se ferma lentement derrière lui.", "La porte était aussi haute qu'une maison.", "Il poussa la porte, la ferma, tourna la clé."],
      reponse: "La porte fit « vlan ! » derrière lui.",
      explication: "« Vlan » imite le bruit de la porte qui claque. La porte haute comme une maison est une hyperbole, et la suite d'actions une énumération.", source: S },
    { id: "litterature-s05-2-q15", fiche: "litterature-s05-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Un mot qui imite un bruit, comme « boum », s'appelle une ___.",
      banque: ["onomatopée", "énumération", "hyperbole", "projection"],
      reponse: [["onomatopée"]],
      explication: "Un mot qui imite un bruit est une onomatopée. « Boum », « plouf » ou « toc toc » en sont.", source: S },
    { id: "litterature-s05-2-q16", fiche: "litterature-s05-2-f2", type: "qcm", niveau: 3,
      enonce: "Un pirate menaçant fait « scouic-scouic » avec son poignard. Pourquoi ce mot est-il une onomatopée ?",
      choix: ["Parce qu'il imite le bruit du poignard", "Parce qu'il exagère la taille du poignard", "Parce qu'il énumère tous les gestes du pirate", "Parce qu'il compare le poignard à un animal"],
      reponse: "Parce qu'il imite le bruit du poignard",
      explication: "« Scouic-scouic » imite le bruit que fait le poignard : c'est une onomatopée qui décrit le geste. Exagérer serait une hyperbole, rapprocher deux choses une comparaison.", source: S },
    // f3 : les projections d'un personnage
    { id: "litterature-s05-2-q17", fiche: "litterature-s05-2-f3", type: "qcm", niveau: 1,
      enonce: "Qu'appelle-t-on les projections d'un personnage ?",
      choix: ["Ce qu'il imagine à l'avance de ce qu'il va vivre", "Les souvenirs de ce qu'il a déjà vécu dans le passé", "Les bruits qu'il entend autour de lui", "La liste de ce qu'il possède"],
      reponse: "Ce qu'il imagine à l'avance de ce qu'il va vivre",
      explication: "Se projeter, c'est imaginer la suite avant de la vivre. Les souvenirs regardent le passé ; les projections, l'avenir.", source: S },
    { id: "litterature-s05-2-q18", fiche: "litterature-s05-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "À la veille d'un grand départ, un personnage peut mêler ses sentiments et ses projections.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : il ressent des émotions, et en même temps il imagine ce qu'il va vivre. Un récit peut raconter les deux.", source: S },
    { id: "litterature-s05-2-q19", fiche: "litterature-s05-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les projections d'un personnage sont les souvenirs qu'il garde de son enfance.",
      corrections: ["Faux : ce sont les choses qu'il imagine à l'avance, avant de les vivre.", "Faux : ce sont les bruits qu'il entend pendant son voyage.", "Faux : ce sont les objets qu'il emporte avec lui."],
      reponse: { vrai: false, correction: "Faux : ce sont les choses qu'il imagine à l'avance, avant de les vivre." },
      explication: "Une projection regarde vers l'avenir : le personnage imagine ce qui l'attend. Un souvenir, lui, regarde vers le passé.", source: S },
    { id: "litterature-s05-2-q20", fiche: "litterature-s05-2-f3", type: "qcm", niveau: 2,
      enonce: "Avant de s'embarquer, Jim Hawkins se voit déjà explorer l'île et contempler ses paysages. Comment appelle-t-on cela ?",
      choix: ["Une projection", "Un souvenir", "Une onomatopée", "Une énumération"],
      reponse: "Une projection",
      explication: "Jim imagine à l'avance ce qu'il va vivre : il se projette. Ce n'est pas un souvenir, puisqu'il n'est pas encore parti.", source: S },
    { id: "litterature-s05-2-q21", fiche: "litterature-s05-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Un récit raconte la veille d'un grand départ. Quels éléments sont des projections du personnage ? (plusieurs réponses)",
      choix: ["Il se voit déjà grimper au sommet d'une montagne", "Il imagine les gens qu'il va rencontrer", "Il a le cœur serré en fermant sa valise", "Il repense à son premier jour d'école", "Il rêve des paysages qu'il va découvrir"],
      reponse: ["Il se voit déjà grimper au sommet d'une montagne", "Il imagine les gens qu'il va rencontrer", "Il rêve des paysages qu'il va découvrir"],
      explication: "Grimper, rencontrer, découvrir : le personnage imagine l'avenir, ce sont des projections. Le cœur serré est un sentiment, et le premier jour d'école un souvenir.", source: S },
    { id: "litterature-s05-2-q22", fiche: "litterature-s05-2-f3", type: "qcm", niveau: 3,
      enonce: "Jim Hawkins raconte ses rêves de l'île comme des actions qu'il accomplit. Pourquoi ?",
      choix: ["Parce qu'il les vit en imagination, avant le départ", "Parce qu'il raconte un souvenir de l'été passé", "Parce qu'il est déjà arrivé sur l'île", "Parce qu'il décrit l'île qu'il voit depuis le pont du navire"],
      reponse: "Parce qu'il les vit en imagination, avant le départ",
      explication: "Jim vit ses rêves en imagination, si fort que le récit les raconte comme des actions. Il explore et contemple l'île avant d'y être.", source: S },
    { id: "litterature-s05-2-q23", fiche: "litterature-s05-2-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "À la veille d'un grand départ, un personnage mêle ses ___, ce qu'il ressent, et ses ___, ce qu'il imagine.",
      banque: ["sentiments", "projections", "souvenirs", "onomatopées"],
      reponse: [["sentiments"], ["projections"]],
      explication: "Les sentiments sont ce que le personnage ressent ; les projections, ce qu'il imagine de l'avenir. Les deux se mêlent avant un départ.", source: S },
    // f4 : respecter le sujet
    { id: "litterature-s05-2-q24", fiche: "litterature-s05-2-f4", type: "qcm", niveau: 1,
      enonce: "Dans un récit, comment appelle-t-on l'événement qui vient bouleverser la situation de départ ?",
      choix: ["L'élément perturbateur", "La situation initiale", "Le dénouement", "La situation finale"],
      reponse: "L'élément perturbateur",
      explication: "Au début, tout est calme : c'est la situation initiale. Puis un événement vient tout changer et lance l'histoire : l'élément perturbateur.",
      indice: "Il perturbe le calme du début.", source: T("Schéma narratif", "Sch%C3%A9ma_narratif") },
    { id: "litterature-s05-2-q25", fiche: "litterature-s05-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Pour respecter un sujet de récit, il suffit d'écrire le bon nombre de lignes : le thème n'a pas d'importance.",
      corrections: ["Faux : il faut respecter à la fois le thème et le nombre de lignes.", "Faux : seul le thème compte, la longueur n'a pas d'importance.", "Faux : il faut écrire le plus de lignes possible."],
      reponse: { vrai: false, correction: "Faux : il faut respecter à la fois le thème et le nombre de lignes." },
      explication: "Le sujet fixe deux choses : le thème et la longueur. Il faut respecter les deux.", source: S },
    { id: "litterature-s05-2-q27", fiche: "litterature-s05-2-f4", type: "qcm", niveau: 2,
      enonce: "Le sujet demande les sentiments et les projections d'un personnage à la veille d'un grand départ. Quel récit respecte le thème ?",
      choix: ["Un garçon, la veille de son départ en colonie, a peur et imagine déjà ses nouveaux amis", "Un garçon raconte, jour après jour, tout le voyage qu'il a fait l'été dernier avec ses cousins", "Un garçon décrit sa chambre en détail", "Un garçon rentre chez lui après une longue journée"],
      reponse: "Un garçon, la veille de son départ en colonie, a peur et imagine déjà ses nouveaux amis",
      explication: "La peur est un sentiment, les nouveaux amis imaginés sont une projection, et l'on est bien la veille du départ. Le voyage de l'été dernier est un souvenir, pas une projection.", source: S },
    { id: "litterature-s05-2-q28", fiche: "litterature-s05-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans un récit, la situation initiale présente les personnages et le cadre avant que l'action ne commence.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Tout est encore stable : on fait connaissance avec les personnages et le lieu. Ensuite, un élément perturbateur vient tout bouleverser.", source: T("Schéma narratif", "Sch%C3%A9ma_narratif") },
    { id: "litterature-s05-2-q29", fiche: "litterature-s05-2-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles étapes font partie du schéma d'un récit ? (plusieurs réponses)",
      choix: ["La situation initiale", "L'élément perturbateur", "Le dénouement", "La préface", "Le titre du chapitre"],
      reponse: ["La situation initiale", "L'élément perturbateur", "Le dénouement"],
      explication: "Un récit passe par une situation initiale, un élément perturbateur, des péripéties, un dénouement et une situation finale. La préface et le titre d'un chapitre ne racontent rien.", source: T("Schéma narratif", "Sch%C3%A9ma_narratif") },
    { id: "litterature-s05-2-q30", fiche: "litterature-s05-2-f4", type: "ordre", niveau: 3,
      enonce: "Remets dans l'ordre les étapes d'un récit.",
      elements: ["Dénouement", "Situation initiale", "Péripéties", "Élément perturbateur"],
      reponse: [1, 3, 2, 0],
      explication: "Tout est calme, puis un événement bouleverse la situation et des aventures s'enchaînent. L'histoire se dénoue à la fin.",
      indice: "Commence par le moment où tout est encore calme.", source: T("Schéma narratif", "Sch%C3%A9ma_narratif") },
  ],
  bonus: [
    {
      id: "litterature-s05-2-b1",
      fiche: "litterature-s05-2-f2",
      titre: "Cocorico, kikeriki : les onomatopées changent de langue",
      texte: "Le mot « onomatopée » vient du grec et veut dire « création de mots ». La bande dessinée en est pleine : elles y font entendre les bruits que personne ne prononce. Et chaque langue entend à sa façon : le coq français fait « cocorico », l'allemand « kikeriki » et l'anglais « cock-a-doodle-do ».",
      source: { titre: "Onomatopée", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Onomatop%C3%A9e" }
    }
  ],
  nonCouvert: [
    "La leçon littéraire elle-même (livret 1, pages 36 à 38, et la page 37 citée par l'emploi du temps) n'est pas déposée : seules les réponses du corrigé le sont, et les notions en sont tirées.",
    "La définition de l'onomatopée donnée par la leçon : le corrigé en montre seulement un exemple inventé.",
    "Le résumé de la leçon et les outils de la langue à apprendre.",
    "Les extraits lus (livret, page 35) ne sont pas déposés. Les réponses de compréhension du corrigé qui portent sur eux (page 3 : lieu du début du roman, nom du navire et port de départ, voyage du docteur, personnages évoqués) relèvent de la lecture des textes (litterature-s05-1) et ne sont pas reprises ici.",
    "Le récit à écrire sur les sentiments et les projections d'un personnage, et l'action de Bill à inventer avec une onomatopée : productions personnelles, hors jeu ; seule la consigne (thème, longueur) est reprise.",
    "L'auteur de L'Île au trésor : le corrigé ne le nomme pas (il est donné dans le bonus du cours litterature-s06-2)."
  ]
};
