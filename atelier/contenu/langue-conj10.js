// Source en clair du cours langue-conj10 (Grammaire, badge Griffon de cuivre) : les modes du verbe.
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/langue-conj10.js.
// Sources déposées : la fiche du cours 10 de conjugaison (pages 1 à 3 ; la page 4 ne contient que des exercices),
// le mémento 4 (tableau de synthèse des modes) et la présentation « Orthographe et expression écrite ».
// Ce sont des fiches à compléter en classe : on ne s'appuie que sur ce qui est imprimé (noms des modes, tableaux
// de conjugaison, rubriques), jamais sur ce que les blancs contiendront. Les exemples sont inventés, avec d'autres
// verbes que ceux des tableaux (chanter, jouer, dessiner…), et aucun ne reprend le devoir du badge.
const C10 = (page) => ({ fichier: "cours/langue/Francais 5e - Conjugaison - Cours 10 - Les modes du verbe.pdf", page: page });
const MEM = { fichier: "cours/langue/Francais 5e - Conjugaison - Memento 4 Modes.pdf", page: 1 };
const ORTH = { fichier: "cours/langue/Orthographe et expression ecrite.pdf", page: 1 };

module.exports = {
  id: "langue-conj10",
  matiere: "langue",
  titre: "Les modes du verbe",
  badge: "cuivre",
  ordre: 1,
  fiches: [
    {
      id: "langue-conj10-f1", notion: "Les sept modes du verbe",
      titre: "Un verbe, sept modes",
      texte: "Un même verbe prend des formes très différentes : tu chantes, chantons, en chantant, que je chante… On range toutes ces formes en sept modes. Quatre modes changent selon la personne (je, tu, il…) : ce sont les modes personnels. Les trois autres ne changent pas selon la personne : ce sont les modes impersonnels.",
      pointsCles: [
        "Un verbe se conjugue à sept modes",
        "Quatre modes personnels : leurs formes varient selon la personne",
        "Trois modes impersonnels : leurs formes ne varient pas selon la personne"
      ],
      astuce: "4 + 3 = 7 : quatre modes avec des personnes, trois modes sans personne.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "mode", def: "chacune des sept familles dans lesquelles on range les formes d'un verbe, comme l'indicatif ou l'infinitif" },
        { mot: "mode personnel", def: "un mode dont les formes changent selon la personne : je, tu, il, nous, vous, ils" },
        { mot: "mode impersonnel", def: "un mode dont les formes ne changent pas, quelle que soit la personne" }
      ],
      schema: "langue-conj10-s1", prerequis: [], source: C10(1)
    },
    {
      id: "langue-conj10-f2", notion: "Les quatre modes personnels",
      titre: "Indicatif, conditionnel, subjonctif, impératif",
      texte: "Les quatre modes personnels sont l'indicatif, le conditionnel, le subjonctif et l'impératif. Leurs formes changent avec la personne : trois au singulier, trois au pluriel. Dans les tableaux du cours, le subjonctif vient toujours après « que » (que je chante). L'impératif, lui, n'a que trois formes, sans pronom sujet : chante, chantons, chantez.",
      pointsCles: [
        "Indicatif : je chante, je chantais, je chanterai…",
        "Conditionnel : je chanterais, il chanterait, nous chanterions",
        "Subjonctif : que je chante, que nous chantions",
        "Impératif : chante, chantons, chantez (sans pronom sujet)"
      ],
      astuce: "« que » devant le verbe dans le tableau : subjonctif. Pas de pronom du tout : impératif.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "indicatif", def: "le mode personnel qui a le plus de temps : présent, imparfait, passé simple, futur et leurs temps composés" },
        { mot: "conditionnel", def: "un mode personnel ; au présent : je chanterais, il chanterait, nous chanterions" },
        { mot: "subjonctif", def: "un mode personnel dont les formes, dans les tableaux, sont précédées de « que »" },
        { mot: "impératif", def: "un mode personnel qui s'emploie sans pronom sujet : chante, chantons, chantez" },
        { mot: "personne", def: "en conjugaison, chacune des six places du tableau : je, tu, il ou elle au singulier ; nous, vous, ils ou elles au pluriel" }
      ],
      schema: "langue-conj10-s1", prerequis: ["langue-conj10-f1"], source: MEM
    },
    {
      id: "langue-conj10-f3", notion: "Les trois modes impersonnels",
      titre: "Infinitif, participe, gérondif",
      texte: "Les trois modes impersonnels sont l'infinitif, le participe et le gérondif. Ils ne changent pas selon la personne, mais ils ont un présent et un passé : jouer, avoir joué ; jouant, ayant joué ; en jouant, en ayant joué. Le gérondif se reconnaît au petit mot « en » mis devant.",
      pointsCles: [
        "Infinitif : jouer (présent), avoir joué (passé)",
        "Participe : jouant (présent), ayant joué (passé)",
        "Gérondif : en jouant (présent), en ayant joué (passé)",
        "Attention : avec « étant », le participe passé s'accorde quand même avec le sujet (Léa, étant arrivée tôt…)"
      ],
      astuce: "« en » + forme en -ant = gérondif. Sans « en », c'est le participe présent.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "infinitif", def: "le mode impersonnel qui sert aussi à nommer le verbe : jouer, avoir joué" },
        { mot: "participe", def: "un mode impersonnel : jouant au présent ; ayant joué au passé" },
        { mot: "gérondif", def: "le mode impersonnel formé avec « en » : en jouant, en ayant joué" },
        { mot: "participe passé", def: "la forme du verbe comme joué ou arrivé, qu'on retrouve dans les temps composés" }
      ],
      schema: "langue-conj10-s1", prerequis: ["langue-conj10-f1"], source: MEM
    },
    {
      id: "langue-conj10-f4", notion: "Temps simples et temps composés",
      titre: "À chaque temps simple, son temps composé",
      texte: "Dans chaque mode, chaque temps simple a son partenaire : un temps composé. Au temps simple, le verbe tient en un seul mot (je dessinais). Au temps composé, il en faut deux : avoir ou être, puis le participe passé (j'avais dessiné, j'étais sorti). À l'indicatif, il y a quatre temps simples et quatre temps composés.",
      pointsCles: [
        "Présent → passé composé",
        "Imparfait → plus-que-parfait",
        "Passé simple → passé antérieur",
        "Futur simple → futur antérieur",
        "Subjonctif : présent → passé, imparfait → plus-que-parfait",
        "Conditionnel, impératif et modes impersonnels : un présent et un passé"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "temps simple", def: "un temps où le verbe s'écrit en un seul mot : je dessine, je dessinais" },
        { mot: "temps composé", def: "un temps formé de avoir ou être, suivi du participe passé : j'ai dessiné, je suis sorti" },
        { mot: "plus-que-parfait", def: "le temps composé de l'indicatif qui correspond à l'imparfait : j'avais dessiné" }
      ],
      schema: null, prerequis: ["langue-conj10-f2", "langue-conj10-f3"], source: C10(3)
    },
    {
      id: "langue-conj10-f5", notion: "Grammaire, conjugaison et orthographe",
      titre: "Pourquoi apprendre la grammaire et la conjugaison ?",
      texte: "La plupart des fautes d'orthographe viennent d'une analyse grammaticale ratée ou d'un verbe mal conjugué. L'analyse grammaticale étudie la nature et la fonction de chaque mot ; l'analyse logique fait de même avec les propositions. L'orthographe d'usage, celle des mots du dictionnaire, s'apprend surtout en lisant.",
      pointsCles: [
        "Beaucoup de fautes viennent de la grammaire et de la conjugaison",
        "Analyse grammaticale : nature et fonction des mots",
        "Analyse logique : nature et fonction des propositions",
        "Un vocabulaire riche aide à trouver le mot juste",
        "Cinq thèmes : natures des mots, fonctions des mots, analyse logique, conjugaison, analyse de texte"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "analyse grammaticale", def: "l'étude de la nature et de la fonction de chaque mot d'une phrase" },
        { mot: "analyse logique", def: "l'étude de la nature et de la fonction des propositions d'une phrase" },
        { mot: "orthographe d'usage", def: "la façon d'écrire un mot telle qu'on la trouve dans le dictionnaire" }
      ],
      schema: null, prerequis: [], source: ORTH
    }
  ],
  schemas: [
    {
      id: "langue-conj10-s1", legende: "Les sept modes du verbe : quatre modes personnels, trois modes impersonnels.",
      svg: "<svg viewBox='0 0 520 240' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='15'>" +
        "<text x='260' y='24' text-anchor='middle' font-weight='bold' font-size='17' fill='#2e2419'>Les sept modes du verbe</text>" +
        "<path d='M260 34v18M260 52H140v16M260 52h120v16' fill='none' stroke='#2e2419' stroke-width='2'/>" +
        "<rect x='22' y='70' width='236' height='156' rx='8' fill='#8c2f39' fill-opacity='.10' stroke='#8c2f39' stroke-width='2'/>" +
        "<rect x='272' y='70' width='226' height='156' rx='8' fill='#b08d3a' fill-opacity='.14' stroke='#b08d3a' stroke-width='2'/>" +
        "<text x='140' y='94' text-anchor='middle' font-weight='bold' fill='#8c2f39'>4 modes personnels</text>" +
        "<text x='140' y='112' text-anchor='middle' font-size='12' font-style='italic' fill='#5b5044'>ils varient en personne</text>" +
        "<g fill='#2e2419'><text x='46' y='140'>indicatif</text><text x='46' y='162'>conditionnel</text><text x='46' y='184'>subjonctif</text><text x='46' y='206'>impératif</text></g>" +
        "<g fill='#5b5044' font-size='12' font-style='italic'><text x='150' y='140'>tu chantes</text><text x='150' y='162'>tu chanterais</text><text x='150' y='184'>que tu chantes</text><text x='150' y='206'>chante</text></g>" +
        "<text x='385' y='94' text-anchor='middle' font-weight='bold' fill='#7a5c1c'>3 modes impersonnels</text>" +
        "<text x='385' y='112' text-anchor='middle' font-size='12' font-style='italic' fill='#5b5044'>ils ne varient pas en personne</text>" +
        "<g fill='#2e2419'><text x='294' y='140'>infinitif</text><text x='294' y='162'>participe</text><text x='294' y='184'>gérondif</text></g>" +
        "<g fill='#5b5044' font-size='12' font-style='italic'><text x='392' y='140'>chanter</text><text x='392' y='162'>chantant</text><text x='392' y='184'>en chantant</text></g>" +
        "</svg>"
    }
  ],
  questions: [
    // f1 : les sept modes
    { id: "langue-conj10-q1", fiche: "langue-conj10-f1", type: "qcm", niveau: 1,
      enonce: "Combien de modes un verbe a-t-il en tout ?",
      choix: ["Six", "Quatre", "Sept", "Trois"],
      reponse: "Sept",
      explication: "Il y a quatre modes personnels et trois modes impersonnels. Quatre plus trois font sept.",
      indice: "Additionne les modes personnels et les modes impersonnels.", source: C10(1) },
    { id: "langue-conj10-q2", fiche: "langue-conj10-f1", type: "vrai_faux", niveau: 2,
      enonce: "Trois modes changent selon la personne, et quatre modes ne changent pas.",
      corrections: [
        "Faux : c'est l'inverse ; quatre modes changent selon la personne, trois ne changent pas.",
        "Faux : les sept modes changent tous selon la personne.",
        "Faux : deux modes changent selon la personne, cinq ne changent pas."
      ],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse ; quatre modes changent selon la personne, trois ne changent pas." },
      explication: "Les quatre modes personnels varient avec la personne : je, tu, il, nous, vous, ils. Les trois modes impersonnels gardent la même forme pour tout le monde.", source: MEM },
    { id: "langue-conj10-q3", fiche: "langue-conj10-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que l'infinitif est un mode impersonnel ?",
      choix: [
        "Parce qu'il n'a qu'un seul temps, sans aucun passé",
        "Parce que sa forme ne change pas selon la personne",
        "Parce qu'il s'écrit toujours après le mot « en »",
        "Parce qu'il ne se conjugue qu'au singulier"
      ],
      reponse: "Parce que sa forme ne change pas selon la personne",
      explication: "Chanter garde la même forme, quelle que soit la personne : c'est pour cela qu'on le dit impersonnel. Il a pourtant aussi un passé : avoir chanté.", source: MEM },
    { id: "langue-conj10-q4", fiche: "langue-conj10-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Ces formes viennent toutes du verbe dessiner. Lesquelles sont à un mode personnel ? Coche toutes les bonnes réponses.",
      choix: ["dessinant", "il dessine", "dessinez", "en dessinant", "que vous dessiniez", "nous dessinerions"],
      reponse: ["il dessine", "dessinez", "que vous dessiniez", "nous dessinerions"],
      explication: "Il dessine, que vous dessiniez et nous dessinerions montrent leur personne, et dessinez, à l'impératif, change aussi avec elle (dessine, dessinons). Dessinant et en dessinant ne changent jamais : ils sont impersonnels.",
      indice: "Attention à l'impératif : il n'a pas de pronom sujet, mais il change selon la personne.", source: C10(1) },
    { id: "langue-conj10-q23", fiche: "langue-conj10-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les formes d'un mode personnel changent avec la personne du verbe.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Je chante, tu chantes, nous chantons : la forme suit la personne. C'est ce qui fait d'un mode un mode personnel.", source: MEM },
    { id: "langue-conj10-q24", fiche: "langue-conj10-f1", type: "vrai_faux", niveau: 2,
      enonce: "La forme « chantant » change quand on passe de je à nous.",
      corrections: [
        "Faux : chantant est au participe, un mode impersonnel ; il garde la même forme.",
        "Faux : chantant est au gérondif, c'est pour cela qu'il ne change pas.",
        "Faux : chantant est à l'infinitif, c'est pour cela qu'il ne change pas."
      ],
      reponse: { vrai: false, correction: "Faux : chantant est au participe, un mode impersonnel ; il garde la même forme." },
      explication: "Chantant garde toujours la même forme, quelle que soit la personne. Sans « en » devant, c'est le participe présent, un mode impersonnel.", source: MEM },
    { id: "langue-conj10-q25", fiche: "langue-conj10-f1", type: "qcm", niveau: 2,
      enonce: "Comment savoir si un mode est personnel ?",
      choix: [
        "On regarde s'il possède un présent et un passé",
        "On regarde s'il commence par « que »",
        "On regarde si sa forme change avec la personne",
        "On regarde s'il a toujours un pronom sujet"
      ],
      reponse: "On regarde si sa forme change avec la personne",
      explication: "Un mode personnel change avec la personne, même l'impératif, qui n'a pas de pronom sujet. Avoir un présent et un passé ne suffit pas : l'infinitif en a deux, et il est impersonnel.", source: C10(1) },
    { id: "langue-conj10-q26", fiche: "langue-conj10-f1", type: "qcm", niveau: 3,
      enonce: "Quel groupe ne contient que des formes à un mode impersonnel ?",
      choix: [
        "sauter, sautant, en sautant",
        "sautez, sautant, sauter",
        "que je saute, sauter, en sautant",
        "je sauterais, sautant, ayant sauté"
      ],
      reponse: "sauter, sautant, en sautant",
      explication: "Sauter, sautant et en sautant sont à l'infinitif, au participe et au gérondif. Sautez, que je saute et je sauterais changent selon la personne.",
      indice: "Cherche le groupe où aucune forme ne change avec je, tu, nous.", source: MEM },
    // f2 : les quatre modes personnels
    { id: "langue-conj10-q5", fiche: "langue-conj10-f2", type: "qcm_multiple", niveau: 1,
      enonce: "Lesquels sont des modes personnels ? Coche toutes les bonnes réponses.",
      choix: ["L'infinitif", "Le conditionnel", "L'indicatif", "Le gérondif", "L'impératif", "Le subjonctif"],
      reponse: ["Le conditionnel", "L'indicatif", "L'impératif", "Le subjonctif"],
      explication: "Les quatre modes personnels sont l'indicatif, le conditionnel, le subjonctif et l'impératif. L'infinitif et le gérondif sont des modes impersonnels.", source: MEM },
    { id: "langue-conj10-q6", fiche: "langue-conj10-f2", type: "association", niveau: 2,
      enonce: "Relie chaque forme du verbe jouer à son mode.",
      gauche: ["tu joues", "joue !", "que tu joues", "tu jouerais"],
      droite: ["Conditionnel", "Subjonctif", "Indicatif", "Impératif"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Sans « que », tu joues est à l'indicatif ; avec « que », c'est le subjonctif. Joue n'a pas de pronom sujet, c'est l'impératif, et tu jouerais est au conditionnel.", source: C10(2) },
    { id: "langue-conj10-q7", fiche: "langue-conj10-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le subjonctif fait partie des modes impersonnels.",
      corrections: [
        "Faux : le subjonctif est un mode personnel, ses formes changent selon la personne.",
        "Faux : le subjonctif est un temps de l'indicatif, pas un mode.",
        "Faux : le subjonctif est un mode personnel, mais il n'a qu'un seul temps."
      ],
      reponse: { vrai: false, correction: "Faux : le subjonctif est un mode personnel, ses formes changent selon la personne." },
      explication: "Que je parle, que tu parles, qu'il parle : le subjonctif change avec la personne. Il a même plusieurs temps : présent, passé, imparfait et plus-que-parfait.", source: C10(2) },
    { id: "langue-conj10-q8", fiche: "langue-conj10-f2", type: "qcm", niveau: 2,
      enonce: "Comment reconnaître une forme du subjonctif dans un tableau de conjugaison ?",
      choix: [
        "Elle se termine par -rais ou par -rait",
        "Elle commence par le petit mot « en »",
        "Elle est précédée de « que »",
        "Elle se termine toujours par -ant"
      ],
      reponse: "Elle est précédée de « que »",
      explication: "Dans les tableaux, le subjonctif s'écrit toujours après « que » : que je parle, qu'il parle. Je parlerais est au conditionnel, et en parlant au gérondif.", source: C10(2) },
    { id: "langue-conj10-q9", fiche: "langue-conj10-f2", type: "vrai_faux", niveau: 3,
      enonce: "« Il dessinera » et « il dessinerait » sont au même mode.",
      corrections: [
        "Faux : « il dessinera » est au futur simple de l'indicatif, « il dessinerait » au présent du conditionnel.",
        "Faux : « il dessinera » est au conditionnel, « il dessinerait » au futur simple de l'indicatif.",
        "Faux : « il dessinerait » est au subjonctif présent."
      ],
      reponse: { vrai: false, correction: "Faux : « il dessinera » est au futur simple de l'indicatif, « il dessinerait » au présent du conditionnel." },
      explication: "Ces deux formes se ressemblent beaucoup, mais elles ne sont pas au même mode. Il dessinera est au futur simple de l'indicatif, il dessinerait au présent du conditionnel.", source: C10(2) },
    { id: "langue-conj10-q27", fiche: "langue-conj10-f2", type: "qcm", niveau: 3,
      enonce: "À quel mode et à quel temps est « que nous dansions » ?",
      choix: ["Indicatif imparfait", "Subjonctif imparfait", "Conditionnel présent", "Subjonctif présent"],
      reponse: "Subjonctif présent",
      explication: "Avec « que » devant, c'est le subjonctif présent, comme que nous rangions. Sans « que », nous dansions serait à l'imparfait de l'indicatif.",
      indice: "Regarde le petit mot placé devant nous.", source: C10(2) },
    { id: "langue-conj10-q28", fiche: "langue-conj10-f2", type: "vrai_faux", niveau: 2,
      enonce: "À l'impératif présent, le verbe danser a trois formes : danse, dansons, dansent.",
      corrections: [
        "Faux : la troisième forme est dansez.",
        "Faux : la première forme est danses, avec un s.",
        "Faux : l'impératif présent n'a que deux formes."
      ],
      reponse: { vrai: false, correction: "Faux : la troisième forme est dansez." },
      explication: "L'impératif présent a trois formes, sans pronom sujet : danse, dansons, dansez. Dansent va avec ils, et l'impératif n'a pas de forme pour ils.", source: C10(2) },
    { id: "langue-conj10-q29", fiche: "langue-conj10-f2", type: "trou", niveau: 1,
      enonce: "Complète avec le nom du mode.",
      texte: "« Tu jouerais » est au ___, et « joue ! » est à l'___.",
      banque: ["conditionnel", "impératif", "indicatif", "subjonctif"],
      reponse: [["conditionnel"], ["impératif"]],
      explication: "Tu jouerais se termine comme je rangerais : c'est le conditionnel. Joue n'a pas de pronom sujet, c'est l'impératif.", source: C10(2) },
    // f3 : les trois modes impersonnels
    { id: "langue-conj10-q10", fiche: "langue-conj10-f3", type: "qcm", niveau: 1,
      enonce: "À quel mode est « en sautant » ?",
      choix: ["Le gérondif", "Le participe", "L'infinitif", "Le subjonctif"],
      reponse: "Le gérondif",
      explication: "Le petit mot « en » devant une forme en -ant annonce le gérondif. Sans « en », sautant serait un participe présent.", source: MEM },
    { id: "langue-conj10-q11", fiche: "langue-conj10-f3", type: "association", niveau: 2,
      enonce: "Relie chaque forme du verbe danser à son mode et à son temps.",
      gauche: ["danser", "dansant", "en dansant", "avoir dansé"],
      droite: ["Gérondif présent", "Infinitif passé", "Infinitif présent", "Participe présent"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Danser et avoir dansé sont les deux temps de l'infinitif. Dansant est le participe présent, et en dansant le gérondif présent.", source: MEM },
    { id: "langue-conj10-q12", fiche: "langue-conj10-f3", type: "vrai_faux", niveau: 1,
      enonce: "Les modes impersonnels n'ont qu'un seul temps.",
      corrections: [
        "Faux : chacun a deux temps, un présent et un passé.",
        "Faux : ils ont autant de temps que l'indicatif.",
        "Faux : chacun a deux temps, l'imparfait et le futur."
      ],
      reponse: { vrai: false, correction: "Faux : chacun a deux temps, un présent et un passé." },
      explication: "Chaque mode impersonnel a un présent et un passé, comme parler et avoir parlé. Ils ne varient pas en personne, mais ils varient dans le temps.", source: MEM },
    { id: "langue-conj10-q13", fiche: "langue-conj10-f3", type: "qcm", niveau: 2,
      enonce: "Comment distinguer le gérondif du participe présent ?",
      choix: [
        "Le gérondif se termine par -er : marcher",
        "Le gérondif a « en » devant : en marchant",
        "Le gérondif a un pronom sujet : je marche",
        "Le gérondif s'écrit après « que » : que je marche"
      ],
      reponse: "Le gérondif a « en » devant : en marchant",
      explication: "Marchant seul est un participe présent. Avec « en » devant, en marchant devient un gérondif.", source: MEM },
    { id: "langue-conj10-q14", fiche: "langue-conj10-f3", type: "vrai_faux", niveau: 3,
      enonce: "Dans « Étant arrivées en avance, mes cousines ont choisi leurs places », le participe passé « arrivées » s'accorde avec le sujet mes cousines.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Même au mode participe, ce participe passé s'accorde avec le sujet. Mes cousines est au féminin pluriel, donc on écrit arrivées.", source: MEM },
    { id: "langue-conj10-q30", fiche: "langue-conj10-f3", type: "qcm", niveau: 2,
      enonce: "Quelle forme est l'infinitif passé du verbe sauter ?",
      choix: ["avoir sauté", "ayant sauté", "en ayant sauté", "sauté"],
      reponse: "avoir sauté",
      explication: "L'infinitif passé se forme avec avoir et le participe passé, comme avoir rangé. Ayant sauté est au participe passé, et en ayant sauté au gérondif passé.", source: C10(2) },
    { id: "langue-conj10-q31", fiche: "langue-conj10-f3", type: "vrai_faux", niveau: 2,
      enonce: "« Ayant joué » est le gérondif passé du verbe jouer.",
      corrections: [
        "Faux : ayant joué est au participe passé ; le gérondif passé est en ayant joué.",
        "Faux : ayant joué est l'infinitif passé du verbe jouer.",
        "Faux : ayant joué est au participe présent du verbe jouer."
      ],
      reponse: { vrai: false, correction: "Faux : ayant joué est au participe passé ; le gérondif passé est en ayant joué." },
      explication: "Sans « en », ayant joué appartient au mode participe. Le gérondif passé, lui, commence par « en » : en ayant joué.", source: C10(2) },
    { id: "langue-conj10-q32", fiche: "langue-conj10-f3", type: "qcm", niveau: 3,
      enonce: "Verbe partir : comment écrire « En étant ___ très tôt, mes sœurs ont trouvé de bonnes places » ?",
      choix: ["parti", "partis", "parties", "partie"],
      reponse: "parties",
      explication: "Au gérondif passé, le participe passé s'accorde quand même avec le sujet. Mes sœurs est au féminin pluriel : en étant parties.",
      indice: "Qui est parti ? Regarde son genre et son nombre.", source: MEM },
    // f4 : temps simples et temps composés
    { id: "langue-conj10-q15", fiche: "langue-conj10-f4", type: "association", niveau: 2,
      enonce: "Relie chaque temps simple de l'indicatif au temps composé qui lui correspond.",
      gauche: ["Présent", "Imparfait", "Passé simple", "Futur simple"],
      droite: ["Futur antérieur", "Passé composé", "Passé antérieur", "Plus-que-parfait"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Présent et passé composé, imparfait et plus-que-parfait vont ensemble. Passé simple et passé antérieur aussi, comme futur simple et futur antérieur.", source: C10(3) },
    { id: "langue-conj10-q16", fiche: "langue-conj10-f4", type: "qcm", niveau: 2,
      enonce: "« Vous avez sauté » est au passé composé. Quel temps simple lui correspond ?",
      choix: ["L'imparfait", "Le présent", "Le passé simple", "Le futur simple"],
      reponse: "Le présent",
      explication: "Le passé composé est le temps composé qui va avec le présent. Vous sautez, vous avez sauté.", source: C10(3) },
    { id: "langue-conj10-q17", fiche: "langue-conj10-f4", type: "vrai_faux", niveau: 1,
      enonce: "Un temps composé s'écrit avec avoir ou être, suivi du participe passé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "J'ai dessiné, je suis sorti : il faut deux mots. D'abord avoir ou être, puis le participe passé.", source: MEM },
    { id: "langue-conj10-q18", fiche: "langue-conj10-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi « elle est sortie » est-il à un temps composé ?",
      choix: [
        "Parce qu'il est au passé simple de l'indicatif",
        "Parce que le verbe se termine par -ie",
        "Parce qu'il a un pronom sujet, elle",
        "Parce qu'il réunit être et un participe passé"
      ],
      reponse: "Parce qu'il réunit être et un participe passé",
      explication: "Un temps composé demande deux mots : avoir ou être, puis le participe passé. Ici, c'est est puis sortie.", source: MEM },
    { id: "langue-conj10-q33", fiche: "langue-conj10-f4", type: "vrai_faux", niveau: 2,
      enonce: "Le plus-que-parfait est le temps composé qui correspond au passé simple.",
      corrections: [
        "Faux : le plus-que-parfait correspond à l'imparfait ; au passé simple correspond le passé antérieur.",
        "Faux : le plus-que-parfait correspond au futur simple.",
        "Faux : le plus-que-parfait est un temps simple de l'indicatif."
      ],
      reponse: { vrai: false, correction: "Faux : le plus-que-parfait correspond à l'imparfait ; au passé simple correspond le passé antérieur." },
      explication: "J'avais rangé va avec je rangeais : le plus-que-parfait est le partenaire de l'imparfait. Celui du passé simple est le passé antérieur, j'eus rangé.", source: C10(2) },
    { id: "langue-conj10-q34", fiche: "langue-conj10-f4", type: "qcm", niveau: 2,
      enonce: "« Elles avaient dessiné » : à quel temps de l'indicatif est ce verbe ?",
      choix: ["Passé composé", "Plus-que-parfait", "Passé antérieur", "Imparfait"],
      reponse: "Plus-que-parfait",
      explication: "Avaient dessiné est formé comme j'avais rangé : c'est le plus-que-parfait. Il faut deux mots, ce n'est donc pas l'imparfait, qui est un temps simple.", source: C10(2) },
    { id: "langue-conj10-q35", fiche: "langue-conj10-f4", type: "qcm", niveau: 3,
      enonce: "« Ils chanteront » est au futur simple. Quelle forme est au temps composé qui lui correspond ?",
      choix: ["ils auraient chanté", "ils avaient chanté", "ils eurent chanté", "ils auront chanté"],
      reponse: "ils auront chanté",
      explication: "Au futur simple correspond le futur antérieur, formé comme j'aurai rangé. Ils auraient chanté est au conditionnel passé, et ils avaient chanté au plus-que-parfait.", source: C10(2) },
    { id: "langue-conj10-q36", fiche: "langue-conj10-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Lesquelles de ces formes sont à un temps composé ? Coche toutes les bonnes réponses.",
      choix: ["tu dansais", "j'ai joué", "elle sauta", "nous étions partis", "nous chanterons", "ils auront dessiné"],
      reponse: ["j'ai joué", "nous étions partis", "ils auront dessiné"],
      explication: "Un temps composé s'écrit en deux mots : avoir ou être, puis le participe passé. Dans tu dansais, elle sauta et nous chanterons, le verbe tient en un seul mot : ce sont des temps simples.",
      indice: "Compte les mots du verbe, sans le pronom.", source: MEM },
    // f5 : grammaire, conjugaison et orthographe
    { id: "langue-conj10-q19", fiche: "langue-conj10-f5", type: "qcm", niveau: 1,
      enonce: "Que veut dire « conjuguer un verbe » ?",
      choix: [
        "Donner ses formes selon le mode, le temps et la personne",
        "Chercher dans le dictionnaire la façon d'écrire son infinitif",
        "Trouver quelle fonction il occupe dans la phrase",
        "L'accorder en genre et en nombre, comme un adjectif"
      ],
      reponse: "Donner ses formes selon le mode, le temps et la personne",
      explication: "Conjuguer, c'est donner les formes d'un verbe selon le mode, le temps et la personne : je chante, nous chantions, qu'il chante. Chercher la fonction d'un mot ou l'orthographe de son infinitif, c'est de l'analyse, pas de la conjugaison.",
      indice: "Pense à ce qui change entre je chante, nous chantions et qu'il chante.",
      source: { theme: "Les modes du verbe", titre: "Conjuguer", editeur: "Larousse", url: "https://www.larousse.fr/dictionnaires/francais/conjuguer/18262" } },
    { id: "langue-conj10-q20", fiche: "langue-conj10-f5", type: "vrai_faux", niveau: 1,
      enonce: "L'orthographe d'usage, celle des mots du dictionnaire, s'apprend surtout en lisant.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "L'orthographe d'usage, c'est la façon d'écrire un mot dans le dictionnaire. On la retient surtout grâce à la lecture.", source: ORTH },
    { id: "langue-conj10-q21", fiche: "langue-conj10-f5", type: "association", niveau: 2,
      enonce: "Relie chaque domaine à ce qu'il étudie ou apporte.",
      gauche: ["Analyse grammaticale", "Analyse logique", "Orthographe d'usage", "Vocabulaire riche"],
      droite: ["Trouver le mot juste", "Nature et fonction des mots", "L'écriture des mots du dictionnaire", "Nature et fonction des propositions"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "L'analyse grammaticale s'occupe des mots, l'analyse logique des propositions. L'orthographe d'usage est celle du dictionnaire, et le vocabulaire aide à trouver le mot juste.", source: ORTH },
    { id: "langue-conj10-q22", fiche: "langue-conj10-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi bien connaître la conjugaison aide-t-il à faire moins de fautes d'orthographe ?",
      choix: [
        "Parce que la conjugaison apprend l'écriture des mots du dictionnaire",
        "Parce que beaucoup de fautes viennent d'un verbe mal conjugué",
        "Parce que la conjugaison étudie la fonction des propositions",
        "Parce que la conjugaison aide surtout à trouver le mot juste"
      ],
      reponse: "Parce que beaucoup de fautes viennent d'un verbe mal conjugué",
      explication: "Une grande partie des fautes vient d'une erreur d'analyse grammaticale ou de conjugaison. Les mots du dictionnaire relèvent de l'orthographe d'usage, les propositions de l'analyse logique.", source: ORTH },
    { id: "langue-conj10-q37", fiche: "langue-conj10-f5", type: "vrai_faux", niveau: 2,
      enonce: "L'analyse logique étudie la nature et la fonction de chaque mot.",
      corrections: [
        "Faux : elle étudie la nature et la fonction des propositions ; les mots, c'est l'analyse grammaticale.",
        "Faux : elle étudie l'orthographe des mots du dictionnaire.",
        "Faux : elle étudie la conjugaison des verbes."
      ],
      reponse: { vrai: false, correction: "Faux : elle étudie la nature et la fonction des propositions ; les mots, c'est l'analyse grammaticale." },
      explication: "L'analyse grammaticale s'occupe des mots, l'analyse logique des propositions. Les deux étudient leur nature et leur fonction.", source: ORTH },
    { id: "langue-conj10-q39", fiche: "langue-conj10-f5", type: "qcm", niveau: 2,
      enonce: "Tu hésites : « girafe » s'écrit-il avec un f ou avec deux ? De quoi relève cette difficulté ?",
      choix: ["De l'analyse grammaticale", "De la conjugaison", "De l'analyse logique", "De l'orthographe d'usage"],
      reponse: "De l'orthographe d'usage",
      explication: "L'écriture d'un mot telle qu'on la trouve dans le dictionnaire, c'est l'orthographe d'usage. Elle ne dépend ni de la nature, ni de la fonction du mot dans la phrase.", source: ORTH },
    { id: "langue-conj10-q40", fiche: "langue-conj10-f5", type: "qcm", niveau: 3,
      enonce: "Tu cherches la fonction de chaque proposition d'une longue phrase. Quelle analyse fais-tu ?",
      choix: ["L'analyse logique", "L'analyse grammaticale", "L'analyse de texte", "La conjugaison"],
      reponse: "L'analyse logique",
      explication: "Les propositions sont étudiées par l'analyse logique, même quand on cherche leur fonction. L'analyse grammaticale, elle, s'occupe de la fonction des mots.",
      indice: "Regarde sur quoi porte la recherche : des mots ou des propositions ?", source: ORTH }
  ],
  bonus: [],
  nonCouvert: [
    "La définition d'un mode (partie A, a) et les mots à compléter de la partie A, b : ces lignes sont laissées en blanc sur la fiche du cours 10, à compléter en classe.",
    "Le tableau du verbe venir à tous les modes (page 3) est à compléter en classe : seules ses formes du subjonctif imparfait et plus-que-parfait sont imprimées.",
    "Les exercices de la page 4 du cours 10 : leurs consignes sont données en classe.",
    "Notions du Griffon de cuivre sans support déposé (tableau de progression) : les verbes du 2e et du 3e groupe, et les pronoms personnels."
  ]
};
