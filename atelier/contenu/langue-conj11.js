// Source en clair du cours langue-conj11 (Grammaire, badge Griffon de cuivre) : être et avoir.
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/langue-conj11.js.
// Source déposée : la fiche du cours 11 de conjugaison (2 pages, à compléter en classe). Sont imprimés : ce que
// le verbe être peut indiquer (page 1, sans les exemples, sauf le premier) et ce que le verbe avoir peut exprimer
// (page 2). Les tableaux de conjugaison sont vides : ils vont dans nonCouvert. Tous les exemples sont inventés.
const C11 = (page) => ({ fichier: "cours/langue/Francais 5e - Conjugaison - Cours 11 - Etre et avoir.pdf", page: page });

module.exports = {
  id: "langue-conj11",
  matiere: "langue",
  titre: "Être et avoir",
  badge: "cuivre",
  ordre: 2,
  fiches: [
    {
      id: "langue-conj11-f1", notion: "Être : l'identité et les qualités",
      titre: "Être : ce que l'on est",
      texte: "Le verbe être exprime l'identité : ce que l'on est. Il peut dire ce que l'on est pour toujours : « La baleine est un mammifère. » Il peut aussi donner une qualité, physique si elle concerne le corps (« Mon oncle est grand »), morale si elle concerne le caractère (« Ma voisine est généreuse »).",
      pointsCles: [
        "Être exprime l'identité : ce que l'on est",
        "Ce que l'on est de façon permanente",
        "Une qualité physique (le corps) ou morale (le caractère)"
      ],
      astuce: "Physique : ce qui se voit sur le corps. Morale : ce qui tient au caractère.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "identité", def: "ce qu'une personne ou une chose est" },
        { mot: "qualité physique", def: "une caractéristique du corps : grand, roux, musclé" },
        { mot: "qualité morale", def: "une caractéristique du caractère : courageux, généreux, patient" }
      ],
      schema: null, prerequis: [], source: C11(1)
    },
    {
      id: "langue-conj11-f2", notion: "Être : un état ou une situation",
      titre: "Être : un état passager, un rôle, un lieu",
      texte: "Le verbe être peut aussi indiquer un état provisoire, qui passe : « Je suis enrhumé cette semaine. » Ou bien un rôle, c'est-à-dire une place dans la société ou un métier : « Sa tante est pharmacienne. » Enfin, il peut situer quelqu'un ou quelque chose dans l'espace : « Les clés sont dans le tiroir. »",
      pointsCles: [
        "Un état provisoire, passager",
        "Un rôle : une identité sociale ou professionnelle",
        "Une situation dans l'espace : où se trouve quelqu'un ou quelque chose"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "état provisoire", def: "une façon d'être qui ne dure pas, qui passe" },
        { mot: "rôle", def: "la place que l'on tient dans la société ou dans son travail : élève, boulanger, maire" }
      ],
      schema: null, prerequis: ["langue-conj11-f1"], source: C11(1)
    },
    {
      id: "langue-conj11-f3", notion: "Avoir : la possession",
      titre: "Avoir, c'est souvent posséder",
      texte: "Le verbe avoir veut souvent dire posséder ou utiliser : « J'ai une trottinette bleue. » Il exprime alors la possession, ce que l'on a. Le verbe être, lui, exprime l'identité, ce que l'on est. Compare : « Je suis gourmand » dit ce que je suis, « J'ai un gâteau » dit ce que je possède.",
      pointsCles: [
        "Avoir : posséder, utiliser",
        "Avoir exprime la possession : ce que l'on a",
        "Être exprime l'identité : ce que l'on est"
      ],
      astuce: "Ce que j'ai : avoir. Ce que je suis : être.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "possession", def: "le fait d'avoir quelque chose à soi" }
      ],
      schema: null, prerequis: ["langue-conj11-f1"], source: C11(2)
    },
    {
      id: "langue-conj11-f4", notion: "Avoir : une relation",
      titre: "Avoir : un lien avec un animal ou une personne",
      texte: "Le verbe avoir sert aussi à dire une relation. Avec un animal, c'est un lien où l'animal dépend de nous : « J'ai un lapin » veut dire que j'en suis responsable et que je m'en occupe. Avec une personne, c'est une relation familiale, sentimentale ou professionnelle : « J'ai une marraine », « J'ai un entraîneur de judo ».",
      pointsCles: [
        "Un animal : il dépend de moi ; j'en ai la responsabilité, je décide pour lui et je m'en occupe",
        "Une personne : relation familiale, sentimentale (amitié, amour) ou professionnelle",
        "Avec une personne, avoir dit un lien, et non la possession d'un objet"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "relation", def: "un lien entre deux personnes, ou entre une personne et un animal" },
        { mot: "responsabilité", def: "le devoir de s'occuper de quelqu'un ou de quelque chose" }
      ],
      schema: null, prerequis: ["langue-conj11-f3"], source: C11(2)
    }
  ],
  schemas: [],
  questions: [
    // f1 : être, identité et qualités
    { id: "langue-conj11-q1", fiche: "langue-conj11-f1", type: "qcm", niveau: 1,
      enonce: "Dans « Mon grand-père est très patient », que dit le verbe être ?",
      choix: ["Une qualité morale", "Une qualité physique", "Une situation dans l'espace", "Une possession"],
      reponse: "Une qualité morale",
      explication: "La patience fait partie du caractère. C'est donc une qualité morale.", source: C11(1) },
    { id: "langue-conj11-q2", fiche: "langue-conj11-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dans « Ce garçon est roux », le verbe être donne une qualité morale.",
      corrections: [
        "Faux : être roux décrit le corps, c'est une qualité physique.",
        "Faux : il indique une situation dans l'espace.",
        "Faux : il exprime une possession."
      ],
      reponse: { vrai: false, correction: "Faux : être roux décrit le corps, c'est une qualité physique." },
      explication: "La couleur des cheveux se voit sur le corps. C'est une qualité physique.", source: C11(1) },
    { id: "langue-conj11-q3", fiche: "langue-conj11-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi « Le chêne est un arbre » exprime-t-il quelque chose de permanent ?",
      choix: [
        "Parce que le chêne est un arbre toute sa vie",
        "Parce que le chêne est malade cette année",
        "Parce que le chêne se trouve dans la forêt",
        "Parce que le chêne possède des feuilles"
      ],
      reponse: "Parce que le chêne est un arbre toute sa vie",
      explication: "Être un arbre ne change pas avec le temps. Le verbe être dit ici ce que le chêne est, pour toujours.", source: C11(1) },
    { id: "langue-conj11-q4", fiche: "langue-conj11-f1", type: "association", niveau: 2,
      enonce: "Relie chaque phrase à ce que dit le verbe être.",
      gauche: ["Ce chat est noir.", "Mon cousin est courageux.", "La rose est une fleur."],
      droite: ["Ce que l'on est de façon permanente", "Une qualité physique", "Une qualité morale"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "La couleur du pelage est une qualité physique, le courage une qualité morale. Une rose, elle, est une fleur pour toujours.", source: C11(1) },
    // f2 : être, un état ou une situation
    { id: "langue-conj11-q5", fiche: "langue-conj11-f2", type: "qcm", niveau: 1,
      enonce: "« Ce soir, je suis très fatigué. » Que dit ici le verbe être ?",
      choix: ["Un état passager", "Une qualité morale", "Ce que l'on est pour toujours", "Une possession"],
      reponse: "Un état passager",
      explication: "La fatigue du soir disparaîtra après une nuit de sommeil. C'est un état provisoire.", source: C11(1) },
    { id: "langue-conj11-q6", fiche: "langue-conj11-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans « Mon père est boulanger », le verbe être indique une situation dans l'espace.",
      corrections: [
        "Faux : il indique un rôle, une identité professionnelle.",
        "Faux : il indique une qualité physique.",
        "Faux : il exprime une possession."
      ],
      reponse: { vrai: false, correction: "Faux : il indique un rôle, une identité professionnelle." },
      explication: "Boulanger est un métier. Le verbe être donne ici un rôle professionnel.", source: C11(1) },
    { id: "langue-conj11-q7", fiche: "langue-conj11-f2", type: "qcm", niveau: 2,
      enonce: "Comment sait-on que « Le vélo est dans le garage » indique une situation dans l'espace ?",
      choix: [
        "La phrase dit où se trouve le vélo",
        "La phrase dit de quelle couleur est le vélo",
        "La phrase dit à qui est le vélo",
        "La phrase dit que le vélo est neuf"
      ],
      reponse: "La phrase dit où se trouve le vélo",
      explication: "« Dans le garage » répond à la question « où ». Le verbe être situe donc le vélo dans l'espace.", source: C11(1) },
    { id: "langue-conj11-q8", fiche: "langue-conj11-f2", type: "association", niveau: 2,
      enonce: "Relie chaque phrase à ce qu'exprime le verbe être.",
      gauche: ["Léo est malade aujourd'hui.", "Sa mère est infirmière.", "Les biscuits sont sur l'étagère.", "Ce chien est énorme."],
      droite: ["Une qualité physique", "Un état passager", "Une situation dans l'espace", "Un rôle (un métier)"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Une maladie d'un jour est un état passager, et infirmière est un métier. Sur l'étagère dit où sont les biscuits, et énorme décrit le corps du chien.", source: C11(1) },
    // f3 : avoir, la possession
    { id: "langue-conj11-q9", fiche: "langue-conj11-f3", type: "qcm", niveau: 1,
      enonce: "Dans « Nous avons une grande tente », que veut dire le verbe avoir ?",
      choix: ["Posséder", "Être situé", "Devenir", "Ressembler"],
      reponse: "Posséder",
      explication: "Avoir une tente, c'est la posséder. Le verbe avoir exprime ici la possession.", source: C11(2) },
    { id: "langue-conj11-q10", fiche: "langue-conj11-f3", type: "vrai_faux", niveau: 1,
      enonce: "Être exprime la possession et avoir exprime l'identité.",
      corrections: [
        "Faux : c'est l'inverse ; avoir exprime la possession, être exprime l'identité.",
        "Faux : les deux verbes expriment la possession.",
        "Faux : les deux verbes expriment l'identité."
      ],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse ; avoir exprime la possession, être exprime l'identité." },
      explication: "Ce que j'ai se dit avec avoir. Ce que je suis se dit avec être.", source: C11(2) },
    { id: "langue-conj11-q11", fiche: "langue-conj11-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on « je suis curieux » mais « j'ai un livre » ?",
      choix: [
        "Curieux dit ce que je suis, un livre dit ce que je possède",
        "Parce que curieux est un objet",
        "Parce que le livre fait partie de mon caractère",
        "Parce que avoir ne s'emploie jamais avec un nom"
      ],
      reponse: "Curieux dit ce que je suis, un livre dit ce que je possède",
      explication: "Être exprime l'identité, ce que l'on est. Avoir exprime la possession, ce que l'on a.", source: C11(2) },
    { id: "langue-conj11-q12", fiche: "langue-conj11-f3", type: "qcm_multiple", niveau: 1,
      enonce: "Dans quelles phrases le verbe avoir exprime-t-il une possession ? Coche toutes les bonnes réponses.",
      choix: ["J'ai une casquette rouge.", "Tu as deux crayons.", "Il a un ballon neuf.", "J'ai une grande sœur.", "Elle est joyeuse."],
      reponse: ["J'ai une casquette rouge.", "Tu as deux crayons.", "Il a un ballon neuf."],
      explication: "Avoir une casquette, des crayons ou un ballon, c'est les posséder. Avoir une grande sœur exprime une relation familiale, et « elle est joyeuse » dit ce qu'elle est.", source: C11(2) },
    // f4 : avoir, une relation
    { id: "langue-conj11-q13", fiche: "langue-conj11-f4", type: "qcm", niveau: 1,
      enonce: "Dans « J'ai une perruche », quelle relation le verbe avoir exprime-t-il ?",
      choix: [
        "Un lien où l'animal dépend de moi",
        "Une relation de travail",
        "Une qualité physique",
        "Une situation dans l'espace"
      ],
      reponse: "Un lien où l'animal dépend de moi",
      explication: "La perruche compte sur moi : je la nourris et je m'en occupe. Avoir exprime ici une relation où j'ai une responsabilité.", source: C11(2) },
    { id: "langue-conj11-q14", fiche: "langue-conj11-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans « J'ai une marraine », avoir veut dire que je possède ma marraine comme un objet.",
      corrections: [
        "Faux : avoir exprime ici une relation familiale entre deux personnes.",
        "Faux : avoir indique ici une situation dans l'espace.",
        "Faux : avoir donne ici une qualité morale."
      ],
      reponse: { vrai: false, correction: "Faux : avoir exprime ici une relation familiale entre deux personnes." },
      explication: "Avec une personne, avoir n'exprime pas la possession d'un objet mais une relation. Ici, c'est le lien familial qui nous unit.", source: C11(2) },
    { id: "langue-conj11-q15", fiche: "langue-conj11-f4", type: "association", niveau: 2,
      enonce: "Relie chaque phrase au lien qu'exprime le verbe avoir.",
      gauche: ["J'ai une grand-tante.", "J'ai un meilleur ami.", "J'ai un entraîneur de judo.", "J'ai un hamster."],
      droite: ["Un animal qui dépend de moi", "Une relation professionnelle", "Une relation familiale", "Une relation sentimentale (amitié)"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Une grand-tante fait partie de la famille, un meilleur ami relève de l'amitié. L'entraîneur fait son métier avec moi, et le hamster dépend de moi.", source: C11(2) },
    { id: "langue-conj11-q16", fiche: "langue-conj11-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi avoir un animal entraîne-t-il une responsabilité ?",
      choix: [
        "Parce que l'animal dépend de moi et que je dois m'en occuper",
        "Parce que l'animal devient le chef de la maison",
        "Parce que l'animal est une qualité morale",
        "Parce que l'animal est un objet qu'on range"
      ],
      reponse: "Parce que l'animal dépend de moi et que je dois m'en occuper",
      explication: "L'animal compte sur moi pour ses repas et ses soins. C'est pour cela que j'en suis responsable.", source: C11(2) }
  ],
  bonus: [],
  nonCouvert: [
    "La conjugaison d'être et d'avoir aux temps simples de l'indicatif (présent, imparfait, passé simple, futur simple) : les deux tableaux de la fiche sont vides, à compléter en classe.",
    "Le titre du cours, les deux observations de début de cours, les intitulés des parties et les conclusions (lignes ⇨) sont laissés en blanc sur la fiche.",
    "La suite de la comparaison entre avoir et être (ligne « MAIS… », page 2) est laissée en blanc.",
    "Les exemples de chaque sens du verbe être sont à trouver en classe : ceux du jeu sont inventés."
  ]
};
