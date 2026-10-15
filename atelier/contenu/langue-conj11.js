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
      choix: ["Une qualité morale", "Une qualité physique", "Un rôle (un métier)", "Un état passager"],
      reponse: "Une qualité morale",
      explication: "La patience tient au caractère, pas au corps. C'est donc une qualité morale.", source: C11(1) },
    { id: "langue-conj11-q2", fiche: "langue-conj11-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dans « Ce garçon est roux », le verbe être donne une qualité morale.",
      corrections: [
        "Faux : être roux décrit le corps, c'est une qualité physique.",
        "Faux : il indique un rôle dans la société.",
        "Faux : il indique un état passager."
      ],
      reponse: { vrai: false, correction: "Faux : être roux décrit le corps, c'est une qualité physique." },
      explication: "La couleur des cheveux se voit sur le corps. C'est une qualité physique.", source: C11(1) },
    { id: "langue-conj11-q3", fiche: "langue-conj11-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi « Le chêne est un arbre » exprime-t-il quelque chose de permanent ?",
      choix: [
        "Parce que le chêne se trouve au milieu de la forêt",
        "Parce que le chêne possède des feuilles",
        "Parce que le chêne est un arbre toute sa vie",
        "Parce que le chêne est malade cette année"
      ],
      reponse: "Parce que le chêne est un arbre toute sa vie",
      explication: "Être un arbre ne change pas avec le temps. Le verbe être dit ici ce que le chêne est, pour toujours.", source: C11(1) },
    { id: "langue-conj11-q4", fiche: "langue-conj11-f1", type: "association", niveau: 2,
      enonce: "Relie chaque phrase à ce que dit le verbe être.",
      gauche: ["Ce chat est noir.", "Mon cousin est courageux.", "La rose est une fleur."],
      droite: ["Ce que l'on est de façon permanente", "Une qualité physique", "Une qualité morale"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "La couleur du pelage est une qualité physique, le courage une qualité morale. Une rose, elle, est une fleur pour toujours.", source: C11(1) },
    { id: "langue-conj11-q17", fiche: "langue-conj11-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Dans quelles phrases le verbe être donne-t-il une qualité morale ? Coche toutes les bonnes réponses.",
      choix: ["Mon voisin est chauve.", "Ma tante est très honnête.", "La tortue est un reptile.", "Ton frère est paresseux.", "Le ballon est sous la table.", "Cette fillette est gentille."],
      reponse: ["Ma tante est très honnête.", "Ton frère est paresseux.", "Cette fillette est gentille."],
      explication: "Honnête, paresseux et gentille parlent du caractère, même quand c'est un défaut. Chauve décrit le corps, et les deux autres phrases disent ce qu'est la tortue et où est le ballon.",
      indice: "Une qualité morale peut aussi être un défaut de caractère.", source: C11(1) },
    { id: "langue-conj11-q18", fiche: "langue-conj11-f1", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Le requin est un poisson », le verbe être donne une qualité physique.",
      corrections: [
        "Faux : il dit ce que le requin est, de façon permanente.",
        "Faux : il indique un état passager du requin.",
        "Faux : il donne une qualité morale du requin."
      ],
      reponse: { vrai: false, correction: "Faux : il dit ce que le requin est, de façon permanente." },
      explication: "Être un poisson, c'est ce que le requin est, toute sa vie. Une qualité physique décrirait son corps, par exemple « le requin est gris ».", source: C11(1) },
    { id: "langue-conj11-q19", fiche: "langue-conj11-f1", type: "qcm", niveau: 2,
      enonce: "Comment savoir si une qualité est physique ou morale ?",
      choix: [
        "On se demande si elle dure longtemps ou si elle passe vite",
        "On se demande si elle concerne le corps ou le caractère",
        "On regarde si le sujet est une personne ou un objet",
        "On regarde si la phrase est au présent ou au passé"
      ],
      reponse: "On se demande si elle concerne le corps ou le caractère",
      explication: "Une qualité physique concerne le corps, comme grand ou roux. Une qualité morale concerne le caractère, comme généreux ou patient.", source: C11(1) },
    { id: "langue-conj11-q20", fiche: "langue-conj11-f1", type: "qcm", niveau: 3,
      enonce: "Dans « Mon oncle est grand et généreux », que donnent les deux adjectifs ?",
      choix: [
        "Deux qualités physiques",
        "Une qualité morale, puis une qualité physique",
        "Une qualité physique, puis une qualité morale",
        "Un état passager, puis une qualité morale"
      ],
      reponse: "Une qualité physique, puis une qualité morale",
      explication: "Grand décrit le corps : c'est une qualité physique. Généreux décrit le caractère : c'est une qualité morale.", source: C11(1) },
    // f2 : être, un état ou une situation
    { id: "langue-conj11-q5", fiche: "langue-conj11-f2", type: "qcm", niveau: 1,
      enonce: "« Ce soir, je suis très fatigué. » Que dit ici le verbe être ?",
      choix: ["Un état passager", "Une qualité morale", "Ce que l'on est pour toujours", "Un rôle (un métier)"],
      reponse: "Un état passager",
      explication: "La fatigue du soir disparaîtra après une nuit de sommeil. C'est un état provisoire.", source: C11(1) },
    { id: "langue-conj11-q6", fiche: "langue-conj11-f2", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Mon père est boulanger », le verbe être indique un état passager.",
      corrections: [
        "Faux : il indique un rôle, une identité professionnelle.",
        "Faux : il indique une qualité morale.",
        "Faux : il indique une situation dans l'espace."
      ],
      reponse: { vrai: false, correction: "Faux : il indique un rôle, une identité professionnelle." },
      explication: "Boulanger est un métier : le verbe être donne ici un rôle, une identité professionnelle. Un état passager, comme être enrhumé, ne dure pas.", source: C11(1) },
    { id: "langue-conj11-q7", fiche: "langue-conj11-f2", type: "qcm", niveau: 2,
      enonce: "Comment sait-on que « Le vélo est dans le garage » indique une situation dans l'espace ?",
      choix: [
        "La phrase dit de quelle couleur est le vélo",
        "La phrase dit à qui appartient le vélo",
        "La phrase dit que le vélo est cassé pour l'instant",
        "La phrase dit où se trouve le vélo"
      ],
      reponse: "La phrase dit où se trouve le vélo",
      explication: "« Dans le garage » répond à la question « où ». Le verbe être situe donc le vélo dans l'espace.", source: C11(1) },
    { id: "langue-conj11-q8", fiche: "langue-conj11-f2", type: "association", niveau: 3,
      enonce: "Relie chaque phrase à ce qu'exprime le verbe être.",
      gauche: ["Léo est malade aujourd'hui.", "Sa mère est infirmière.", "Les biscuits sont sur l'étagère.", "Ce chien est énorme."],
      droite: ["Une qualité physique", "Un état passager", "Une situation dans l'espace", "Un rôle (un métier)"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Une maladie d'un jour est un état passager, et infirmière est un métier. Sur l'étagère dit où sont les biscuits, et énorme décrit le corps du chien.", source: C11(1) },
    { id: "langue-conj11-q21", fiche: "langue-conj11-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans « Mes parents sont au marché », le verbe être situe quelqu'un dans l'espace.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "« Au marché » dit où se trouvent les parents. Le verbe être indique ici une situation dans l'espace.", source: C11(1) },
    { id: "langue-conj11-q22", fiche: "langue-conj11-f2", type: "qcm", niveau: 2,
      enonce: "Dans « Sa tante est maire du village », que dit le verbe être ?",
      choix: ["Un rôle dans la société", "Une situation dans l'espace", "Un état passager", "Une qualité morale"],
      reponse: "Un rôle dans la société",
      explication: "Être maire, c'est tenir une place dans la société : le verbe être donne un rôle. « Du village » ne dit pas où elle se trouve en ce moment.", source: C11(1) },
    { id: "langue-conj11-q23", fiche: "langue-conj11-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi « Il est pompier » et « Il est fatigué » n'expriment-ils pas la même chose ?",
      choix: [
        "Pompier est un rôle, fatigué un état qui passe",
        "Pompier est une qualité morale, fatigué une qualité physique",
        "Pompier est un état qui passe, fatigué est un rôle",
        "Pompier dit où il est, fatigué dit ce qu'il possède"
      ],
      reponse: "Pompier est un rôle, fatigué un état qui passe",
      explication: "Pompier est un métier, donc un rôle : une identité professionnelle. Fatigué est un état provisoire, qui passera après du repos.", source: C11(1) },
    { id: "langue-conj11-q24", fiche: "langue-conj11-f2", type: "vrai_faux", niveau: 1,
      enonce: "Un état provisoire est une façon d'être qui dure toute la vie.",
      corrections: [
        "Faux : un état provisoire passe, il ne dure pas.",
        "Faux : un état provisoire est un métier.",
        "Faux : un état provisoire dit où l'on se trouve."
      ],
      reponse: { vrai: false, correction: "Faux : un état provisoire passe, il ne dure pas." },
      explication: "Provisoire veut dire passager : l'état ne dure pas, comme être enrhumé une semaine. Ce qui ne change jamais, c'est par exemple, pour un chêne, être un arbre.", source: C11(1) },
    // f3 : avoir, la possession
    { id: "langue-conj11-q9", fiche: "langue-conj11-f3", type: "qcm", niveau: 1,
      enonce: "Dans « Nous avons une grande tente », que veut dire le verbe avoir ?",
      choix: ["Dépendre de", "Posséder", "Être situé dans", "Être en relation avec"],
      reponse: "Posséder",
      explication: "Avoir une tente, c'est la posséder. Le verbe avoir exprime ici la possession.", source: C11(2) },
    { id: "langue-conj11-q10", fiche: "langue-conj11-f3", type: "vrai_faux", niveau: 2,
      enonce: "Être exprime la possession et avoir exprime l'identité.",
      corrections: [
        "Faux : c'est l'inverse ; avoir exprime la possession, être exprime l'identité.",
        "Faux : être exprime une relation, et avoir exprime l'identité.",
        "Faux : avoir exprime bien l'identité, mais être exprime un lieu."
      ],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse ; avoir exprime la possession, être exprime l'identité." },
      explication: "Ce que j'ai se dit avec avoir. Ce que je suis se dit avec être.", source: C11(2) },
    { id: "langue-conj11-q11", fiche: "langue-conj11-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on « je suis curieux » mais « j'ai un livre » ?",
      choix: [
        "Curieux dit ce que je possède, un livre dit ce que je suis",
        "Curieux dit un état passager, un livre dit une relation",
        "Curieux dit ce que je suis, un livre dit ce que je possède",
        "Curieux dit où je suis, un livre dit ce que j'utilise"
      ],
      reponse: "Curieux dit ce que je suis, un livre dit ce que je possède",
      explication: "Être exprime l'identité, ce que l'on est. Avoir exprime la possession, ce que l'on a.", source: C11(2) },
    { id: "langue-conj11-q12", fiche: "langue-conj11-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Dans quelles phrases le verbe avoir exprime-t-il une possession ? Coche toutes les bonnes réponses.",
      choix: ["J'ai une grande sœur.", "J'ai une casquette rouge.", "J'ai un parrain très drôle.", "Tu as deux crayons.", "Elle est joyeuse.", "Il a un ballon neuf."],
      reponse: ["J'ai une casquette rouge.", "Tu as deux crayons.", "Il a un ballon neuf."],
      explication: "Une casquette, des crayons, un ballon : ce sont des objets que l'on possède. Avec une sœur ou un parrain, avoir exprime une relation, et « elle est joyeuse » dit ce qu'elle est.", source: C11(2) },
    { id: "langue-conj11-q25", fiche: "langue-conj11-f3", type: "trou", niveau: 1,
      enonce: "Complète avec le bon verbe, avoir ou être.",
      texte: "Moi, j'___ un vélo rouge, et je ___ très sportif.",
      banque: ["ai", "suis", "es", "est"],
      reponse: [["ai"], ["suis"]],
      explication: "Un vélo, c'est ce que je possède : j'ai. Sportif, c'est ce que je suis : je suis.", source: C11(2) },
    { id: "langue-conj11-q26", fiche: "langue-conj11-f3", type: "qcm", niveau: 3,
      enonce: "« Je suis pâtissier » et « J'ai une pâtisserie » : que disent être et avoir dans ces deux phrases ?",
      choix: [
        "Être dit une possession, avoir dit un rôle",
        "Être dit un rôle, avoir dit une possession",
        "Les deux verbes disent une possession",
        "Être dit un lieu, avoir dit une relation"
      ],
      reponse: "Être dit un rôle, avoir dit une possession",
      explication: "Être pâtissier, c'est un métier : ce que je suis. Avoir une pâtisserie, c'est posséder un magasin : ce que j'ai.", source: C11(2) },
    { id: "langue-conj11-q27", fiche: "langue-conj11-f3", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Tu as un parapluie », le verbe avoir exprime ce que tu es.",
      corrections: [
        "Faux : il exprime la possession, ce que tu as.",
        "Faux : il exprime un lien où le parapluie dépend de toi.",
        "Faux : il situe le parapluie dans l'espace."
      ],
      reponse: { vrai: false, correction: "Faux : il exprime la possession, ce que tu as." },
      explication: "Un parapluie est un objet que l'on possède ou que l'on utilise. Ce que l'on est se dit avec le verbe être.", source: C11(2) },
    { id: "langue-conj11-q28", fiche: "langue-conj11-f3", type: "qcm", niveau: 2,
      enonce: "Comment vérifier que le verbe avoir exprime une possession ?",
      choix: [
        "On met la phrase à l'imparfait",
        "On le remplace par « être »",
        "On le remplace par « posséder »",
        "On regarde si le sujet est « je »"
      ],
      reponse: "On le remplace par « posséder »",
      explication: "Si l'on peut dire « je possède » ou « j'utilise » sans changer le sens, avoir exprime la possession. C'est le cas avec un sac ou des chaussures.", source: C11(2) },
    // f4 : avoir, une relation
    { id: "langue-conj11-q13", fiche: "langue-conj11-f4", type: "qcm", niveau: 1,
      enonce: "Dans « J'ai une perruche », quelle relation le verbe avoir exprime-t-il ?",
      choix: [
        "Une relation de travail",
        "Un lien où l'animal dépend de moi",
        "Une relation familiale",
        "Une situation dans l'espace"
      ],
      reponse: "Un lien où l'animal dépend de moi",
      explication: "La perruche compte sur moi : je la nourris et je m'en occupe. Avoir exprime ici une relation où j'ai une responsabilité.", source: C11(2) },
    { id: "langue-conj11-q14", fiche: "langue-conj11-f4", type: "vrai_faux", niveau: 2,
      enonce: "Dans « J'ai une marraine », le verbe avoir exprime une relation professionnelle.",
      corrections: [
        "Faux : il exprime une relation familiale.",
        "Faux : il exprime un lien où la marraine dépend de moi.",
        "Faux : il exprime ce que je suis."
      ],
      reponse: { vrai: false, correction: "Faux : il exprime une relation familiale." },
      explication: "Une marraine fait partie de la famille : avoir exprime ici une relation familiale. Ce n'est ni un lien de travail, ni un lien où elle dépendrait de moi.", source: C11(2) },
    { id: "langue-conj11-q15", fiche: "langue-conj11-f4", type: "association", niveau: 3,
      enonce: "Relie chaque phrase au lien qu'exprime le verbe avoir.",
      gauche: ["J'ai une grand-tante.", "J'ai un meilleur ami.", "J'ai un entraîneur de judo.", "J'ai un hamster."],
      droite: ["Un animal qui dépend de moi", "Une relation professionnelle", "Une relation familiale", "Une relation sentimentale (amitié)"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Une grand-tante fait partie de la famille, un meilleur ami relève de l'amitié. L'entraîneur fait son métier avec moi, et le hamster dépend de moi.", source: C11(2) },
    { id: "langue-conj11-q16", fiche: "langue-conj11-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi avoir un animal entraîne-t-il une responsabilité ?",
      choix: [
        "Parce que l'animal et moi avons une relation familiale",
        "Parce que l'animal dépend de moi et que je m'en occupe",
        "Parce que l'animal dit ce que je suis, mon identité",
        "Parce que l'animal décide de tout pour moi"
      ],
      reponse: "Parce que l'animal dépend de moi et que je m'en occupe",
      explication: "L'animal compte sur moi pour ses repas et ses soins. C'est pour cela que j'en suis responsable.", source: C11(2) },
    { id: "langue-conj11-q29", fiche: "langue-conj11-f4", type: "qcm", niveau: 2,
      enonce: "Dans « J'ai un moniteur d'escalade », quelle relation exprime le verbe avoir ?",
      choix: ["Une relation familiale", "Une relation sentimentale (amitié)", "Un animal qui dépend de moi", "Une relation professionnelle"],
      reponse: "Une relation professionnelle",
      explication: "Le moniteur fait son métier avec moi : c'est une relation professionnelle. Il ne fait pas partie de ma famille.", source: C11(2) },
    { id: "langue-conj11-q30", fiche: "langue-conj11-f4", type: "qcm", niveau: 3,
      enonce: "Quelle différence y a-t-il entre « J'ai un vélo » et « J'ai un chien » ?",
      choix: [
        "Avec le vélo, avoir dit une relation : il dépend de moi",
        "Avec le chien, avoir dit une relation : il dépend de moi",
        "Avec le chien, avoir dit une relation familiale",
        "Aucune : les deux phrases disent ce que je suis"
      ],
      reponse: "Avec le chien, avoir dit une relation : il dépend de moi",
      explication: "Un vélo est un objet que l'on possède. Un chien dépend de moi : avoir exprime aussi une relation, avec une responsabilité.", source: C11(2) },
    { id: "langue-conj11-q31", fiche: "langue-conj11-f4", type: "vrai_faux", niveau: 2,
      enonce: "Avec un animal, avoir exprime une relation où c'est moi qui dépends de l'animal.",
      corrections: [
        "Faux : c'est l'animal qui dépend de moi, et je m'en occupe.",
        "Faux : avec un animal, avoir exprime une relation familiale.",
        "Faux : avec un animal, avoir exprime ce que je suis."
      ],
      reponse: { vrai: false, correction: "Faux : c'est l'animal qui dépend de moi, et je m'en occupe." },
      explication: "L'animal compte sur moi pour vivre : il dépend de moi. J'en suis responsable et je m'en occupe.", source: C11(2) },
    { id: "langue-conj11-q32", fiche: "langue-conj11-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Dans quelles phrases le verbe avoir exprime-t-il une relation entre deux personnes ? Coche toutes les bonnes réponses.",
      choix: ["J'ai un sac à dos.", "J'ai un grand frère.", "J'ai une tortue.", "J'ai une amie d'enfance.", "J'ai une entraîneuse de natation."],
      reponse: ["J'ai un grand frère.", "J'ai une amie d'enfance.", "J'ai une entraîneuse de natation."],
      explication: "Un frère, une amie, une entraîneuse : ce sont des relations familiale, sentimentale et professionnelle. Le sac est un objet, et la tortue un animal qui dépend de moi.", source: C11(2) }
  ],
  bonus: [],
  nonCouvert: [
    "La conjugaison d'être et d'avoir aux temps simples de l'indicatif (présent, imparfait, passé simple, futur simple) : les deux tableaux de la fiche sont vides, à compléter en classe.",
    "Le titre du cours, les deux observations de début de cours, les intitulés des parties et les conclusions (lignes ⇨) sont laissés en blanc sur la fiche.",
    "La suite de la comparaison entre avoir et être (ligne « MAIS… », page 2) est laissée en blanc.",
    "Les exemples de chaque sens du verbe être sont à trouver en classe : ceux du jeu sont inventés."
  ]
};
