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
      choix: ["Sept", "Quatre", "Trois", "Huit"],
      reponse: "Sept",
      explication: "Il y a quatre modes personnels et trois modes impersonnels. Quatre plus trois font sept.",
      indice: "Additionne les modes personnels et les modes impersonnels.", source: C10(1) },
    { id: "langue-conj10-q2", fiche: "langue-conj10-f1", type: "vrai_faux", niveau: 1,
      enonce: "Tous les modes du verbe changent selon la personne (je, tu, il…).",
      corrections: [
        "Faux : seuls les quatre modes personnels changent selon la personne ; les trois modes impersonnels, non.",
        "Faux : aucun mode ne change selon la personne.",
        "Faux : seul l'infinitif change selon la personne."
      ],
      reponse: { vrai: false, correction: "Faux : seuls les quatre modes personnels changent selon la personne ; les trois modes impersonnels, non." },
      explication: "Les modes personnels varient avec je, tu, il… Les modes impersonnels gardent la même forme pour tout le monde.", source: MEM },
    { id: "langue-conj10-q3", fiche: "langue-conj10-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que l'infinitif est un mode impersonnel ?",
      choix: [
        "Parce que sa forme ne change pas selon la personne",
        "Parce qu'il n'existe qu'au futur",
        "Parce qu'il commence toujours par « que »",
        "Parce qu'il ne s'emploie jamais dans une phrase"
      ],
      reponse: "Parce que sa forme ne change pas selon la personne",
      explication: "L'infinitif chanter garde la même forme, quelle que soit la personne. Comme il ne varie pas en personne, on le dit impersonnel.", source: MEM },
    { id: "langue-conj10-q4", fiche: "langue-conj10-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Ces formes viennent toutes du verbe dessiner. Lesquelles sont à un mode personnel ? Coche toutes les bonnes réponses.",
      choix: ["il dessine", "que vous dessiniez", "nous dessinerions", "dessiner", "dessinant", "en dessinant"],
      reponse: ["il dessine", "que vous dessiniez", "nous dessinerions"],
      explication: "Il, vous et nous montrent une personne : ce sont des modes personnels. Dessiner, dessinant et en dessinant n'ont pas de personne.",
      indice: "Cherche les formes qui ont un pronom : je, tu, nous, vous…", source: C10(1) },
    // f2 : les quatre modes personnels
    { id: "langue-conj10-q5", fiche: "langue-conj10-f2", type: "qcm_multiple", niveau: 1,
      enonce: "Lesquels sont des modes personnels ? Coche toutes les bonnes réponses.",
      choix: ["L'indicatif", "Le conditionnel", "Le subjonctif", "L'impératif", "L'infinitif", "Le gérondif"],
      reponse: ["L'indicatif", "Le conditionnel", "Le subjonctif", "L'impératif"],
      explication: "Les quatre modes personnels sont l'indicatif, le conditionnel, le subjonctif et l'impératif. L'infinitif et le gérondif sont des modes impersonnels.", source: MEM },
    { id: "langue-conj10-q6", fiche: "langue-conj10-f2", type: "association", niveau: 2,
      enonce: "Relie chaque forme du verbe jouer à son mode.",
      gauche: ["tu joues", "joue !", "que tu joues", "tu jouerais"],
      droite: ["Conditionnel", "Subjonctif", "Indicatif", "Impératif"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Sans « que », tu joues est à l'indicatif ; avec « que », c'est le subjonctif. Joue n'a pas de pronom sujet, c'est l'impératif, et tu jouerais est au conditionnel.", source: C10(2) },
    { id: "langue-conj10-q7", fiche: "langue-conj10-f2", type: "vrai_faux", niveau: 1,
      enonce: "Le subjonctif fait partie des modes impersonnels.",
      corrections: [
        "Faux : le subjonctif est un mode personnel, ses formes changent selon la personne.",
        "Faux : le subjonctif n'est pas un mode du verbe.",
        "Faux : le subjonctif est un temps de l'infinitif."
      ],
      reponse: { vrai: false, correction: "Faux : le subjonctif est un mode personnel, ses formes changent selon la personne." },
      explication: "Que je parle, que tu parles, qu'il parle : le subjonctif change avec la personne. C'est donc un mode personnel.", source: MEM },
    { id: "langue-conj10-q8", fiche: "langue-conj10-f2", type: "qcm", niveau: 2,
      enonce: "Comment reconnaître une forme du subjonctif dans un tableau de conjugaison ?",
      choix: [
        "Elle est précédée de « que »",
        "Elle commence par « en »",
        "Elle n'a jamais de personne",
        "Elle se termine toujours par -ant"
      ],
      reponse: "Elle est précédée de « que »",
      explication: "Dans les tableaux, le subjonctif s'écrit toujours après « que » : que je parle, qu'il parle. « En » annonce le gérondif, et -ant le participe présent.", source: C10(2) },
    { id: "langue-conj10-q9", fiche: "langue-conj10-f2", type: "vrai_faux", niveau: 2,
      enonce: "« Il dessinera » et « il dessinerait » sont au même mode.",
      corrections: [
        "Faux : « il dessinera » est au futur simple de l'indicatif, « il dessinerait » au présent du conditionnel.",
        "Faux : les deux formes sont à l'impératif.",
        "Faux : « il dessinerait » est au subjonctif."
      ],
      reponse: { vrai: false, correction: "Faux : « il dessinera » est au futur simple de l'indicatif, « il dessinerait » au présent du conditionnel." },
      explication: "Ces deux formes se ressemblent beaucoup, mais elles ne sont pas au même mode. Il dessinera est au futur simple de l'indicatif, il dessinerait au présent du conditionnel.", source: C10(2) },
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
        "Faux : ils n'ont aucun temps."
      ],
      reponse: { vrai: false, correction: "Faux : chacun a deux temps, un présent et un passé." },
      explication: "Chaque mode impersonnel a un présent et un passé, comme parler et avoir parlé. Ils ne varient pas en personne, mais ils varient dans le temps.", source: MEM },
    { id: "langue-conj10-q13", fiche: "langue-conj10-f3", type: "qcm", niveau: 2,
      enonce: "Comment distinguer le gérondif du participe présent ?",
      choix: [
        "Le gérondif a « en » devant : en marchant",
        "Le gérondif se termine par -er : marcher",
        "Le gérondif a toujours un pronom sujet : je marche",
        "Le gérondif s'écrit avec « que » : que je marche"
      ],
      reponse: "Le gérondif a « en » devant : en marchant",
      explication: "Marchant seul est un participe présent. Avec « en » devant, en marchant devient un gérondif.", source: MEM },
    { id: "langue-conj10-q14", fiche: "langue-conj10-f3", type: "vrai_faux", niveau: 3,
      enonce: "Dans « Étant arrivées en avance, mes cousines ont choisi leurs places », le participe passé « arrivées » s'accorde avec le sujet mes cousines.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Même au mode participe, ce participe passé s'accorde avec le sujet. Mes cousines est au féminin pluriel, donc on écrit arrivées.", source: MEM },
    // f4 : temps simples et temps composés
    { id: "langue-conj10-q15", fiche: "langue-conj10-f4", type: "association", niveau: 2,
      enonce: "Relie chaque temps simple de l'indicatif au temps composé qui lui correspond.",
      gauche: ["Présent", "Imparfait", "Passé simple", "Futur simple"],
      droite: ["Futur antérieur", "Passé composé", "Passé antérieur", "Plus-que-parfait"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Présent et passé composé, imparfait et plus-que-parfait vont ensemble. Passé simple et passé antérieur aussi, comme futur simple et futur antérieur.", source: C10(3) },
    { id: "langue-conj10-q16", fiche: "langue-conj10-f4", type: "qcm", niveau: 2,
      enonce: "« Vous avez sauté » est au passé composé. Quel temps simple lui correspond ?",
      choix: ["Le présent", "L'imparfait", "Le passé simple", "Le futur simple"],
      reponse: "Le présent",
      explication: "Le passé composé est le temps composé qui va avec le présent. Vous sautez, vous avez sauté.", source: C10(3) },
    { id: "langue-conj10-q17", fiche: "langue-conj10-f4", type: "vrai_faux", niveau: 1,
      enonce: "Un temps composé s'écrit avec avoir ou être, suivi du participe passé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "J'ai dessiné, je suis sorti : il faut deux mots. D'abord avoir ou être, puis le participe passé.", source: MEM },
    { id: "langue-conj10-q18", fiche: "langue-conj10-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi « elle est sortie » est-il à un temps composé ?",
      choix: [
        "Parce qu'il est formé de être et du participe passé sortie",
        "Parce que la phrase parle d'une fille",
        "Parce que le verbe se termine par -ie",
        "Parce qu'il a un pronom sujet"
      ],
      reponse: "Parce qu'il est formé de être et du participe passé sortie",
      explication: "Un temps composé demande deux mots : avoir ou être, puis le participe passé. Ici, c'est est puis sortie.", source: MEM },
    // f5 : grammaire, conjugaison et orthographe
    { id: "langue-conj10-q19", fiche: "langue-conj10-f5", type: "qcm", niveau: 1,
      enonce: "D'après le cours, d'où viennent la plupart des fautes d'orthographe ?",
      choix: [
        "D'erreurs d'analyse grammaticale ou de conjugaison",
        "D'une écriture trop rapide",
        "D'un stylo qui écrit mal",
        "De livres trop difficiles"
      ],
      reponse: "D'erreurs d'analyse grammaticale ou de conjugaison",
      explication: "La plupart des fautes viennent d'un mot mal analysé ou d'un verbe mal conjugué. Travailler la grammaire et la conjugaison en évite beaucoup.", source: ORTH },
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
      enonce: "Pourquoi bien connaître la conjugaison aide-t-il à faire moins de fautes ?",
      choix: [
        "Parce que beaucoup de fautes viennent d'un verbe mal conjugué",
        "Parce que la conjugaison remplace le dictionnaire",
        "Parce qu'on écrit ensuite sans aucun verbe",
        "Parce que la conjugaison apprend à écrire plus vite"
      ],
      reponse: "Parce que beaucoup de fautes viennent d'un verbe mal conjugué",
      explication: "Une grande partie des fautes vient d'une erreur d'analyse ou de conjugaison. Bien conjuguer en évite donc beaucoup.", source: ORTH }
  ],
  bonus: [],
  nonCouvert: [
    "La définition d'un mode (partie A, a) et les mots à compléter de la partie A, b : ces lignes sont laissées en blanc sur la fiche du cours 10, à compléter en classe.",
    "Le tableau du verbe venir à tous les modes (page 3) est à compléter en classe : seules ses formes du subjonctif imparfait et plus-que-parfait sont imprimées.",
    "Les exercices de la page 4 du cours 10 : leurs consignes sont données en classe.",
    "Notions du Griffon de cuivre sans support déposé (tableau de progression) : les verbes du 2e et du 3e groupe, et les pronoms personnels."
  ]
};
