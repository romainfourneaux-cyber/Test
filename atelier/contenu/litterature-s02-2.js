// Source en clair du cours litterature-s02-2 (livret 1, cours 2 : la leçon littéraire, p. 19 à 22 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/litterature-s02-2.js.
// Source déposée : le corrigé du livret 1, page 2 (« Chapitre I - Cours 2 », rubrique « Questions sur le cours »).
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
// Devoir 1 (litterature-d1) : il porte aussi sur la description objective et subjective. Aucun de ses textes,
// exemples ou explications n'est repris ici ; les exemples ne parlent ni de mer, ni de vagues, ni de soleil.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 2 };

module.exports = {
  id: "litterature-s02-2",
  fiches: [
    {
      id: "litterature-s02-2-f1", notion: "La description objective",
      titre: "Décrire seulement ce qu'on voit",
      texte: "Une description objective s'en tient à ce qu'on peut voir ou constater directement : une taille, une couleur, un vêtement. Le narrateur n'y glisse ni son avis ni ses émotions, il n'interprète rien. Exemple : « La table est en bois et porte trois assiettes. »",
      pointsCles: [
        "Objective : seulement ce qui est visible, directement observable",
        "Aucune interprétation, aucun avis du narrateur",
        "Exemple : une tenue décrite pièce par pièce, sans jugement"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "description objective", def: "une description qui s'en tient à ce qu'on voit, sans avis ni émotion du narrateur" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s02-2-f2", notion: "La description subjective",
      titre: "Décrire avec ses sentiments",
      texte: "Dans une description subjective, le narrateur ajoute à ce qu'il observe ce qu'il ressent et ce qu'il pense. Un narrateur amoureux, par exemple, décrit la personne aimée avec admiration. Des mots comme « je n'aime pas » trahissent un avis personnel. Exemple : « Cette rue triste me donne envie de partir. »",
      pointsCles: [
        "Subjective : ce qu'on voit, plus ce que le narrateur ressent et pense",
        "Indices : « j'aime », « je n'aime pas », des mots qui jugent",
        "Une description peut juger un comportement : c'est un avis personnel"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "description subjective", def: "une description où le narrateur mêle à ce qu'il voit ses sentiments et ses idées" }
      ],
      schema: null, prerequis: ["litterature-s02-2-f1"], source: S
    },
    {
      id: "litterature-s02-2-f3", notion: "Description précise ou rapide",
      titre: "Beaucoup de détails, ou quelques mots",
      texte: "Une description peut être précise et fouillée : elle accumule les détails et peut même contenir une image, comme une métaphore. Elle peut aussi être rapide et simple : quelques mots suffisent, sans chercher la précision. Exemple de description rapide : « Le village est petit. »",
      pointsCles: [
        "Précise, fouillée : beaucoup de détails, parfois une image",
        "Rapide, simple : quelques mots, peu de précision",
        "Une description fouillée peut contenir une métaphore"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "description fouillée", def: "une description très précise, pleine de détails" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s02-2-f4", notion: "La métaphore dans une description",
      titre: "Parler d'une chose avec l'image d'une autre",
      texte: "La métaphore évoque une chose à l'aide de l'image d'une autre. Un narrateur peut parler de celle qu'il aime avec l'image de la musique, ou donner à un personnage peu aimable un air d'insecte. Exemple de tous les jours : « Mon frère est un vrai moulin à paroles. »",
      pointsCles: [
        "Métaphore : une image, on évoque une chose à l'aide de l'image d'une autre",
        "Image de la musique pour dire l'amour ; image de l'insecte pour un personnage déplaisant",
        "C'est une figure de style"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "métaphore", def: "une image : on parle d'une chose à l'aide d'une autre, par exemple de l'amour avec l'image de la musique" }
      ],
      schema: null, prerequis: ["litterature-s02-2-f3"], source: S
    },
    {
      id: "litterature-s02-2-f5", notion: "Ce qu'une description laisse deviner",
      titre: "Lire entre les lignes d'un portrait",
      texte: "Une description ne montre pas seulement l'apparence : elle peut sous-entendre un caractère. Des yeux qui fouillent sans cesse le regard des autres font penser à quelqu'un de méfiant. Une description peut aussi dénoncer un comportement, comme celui d'une personne curieuse qui observe en silence pour ne pas être repérée.",
      pointsCles: [
        "Un détail physique, comme un regard, peut révéler un caractère",
        "Une description peut dénoncer un comportement, par exemple l'indiscrétion",
        "Un narrateur qui dit ouvertement son agacement fait une description subjective"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "sous-entendre", def: "faire comprendre une chose sans la dire directement" }
      ],
      schema: null, prerequis: ["litterature-s02-2-f2"], source: S
    }
  ],
  schemas: [],
  questions: [
    // f1 : la description objective
    { id: "litterature-s02-2-q1", fiche: "litterature-s02-2-f1", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une description objective ?",
      choix: ["Une description qui s'en tient à ce qu'on voit, sans avis du narrateur", "Une description pleine des sentiments du narrateur", "Une description qui exagère tout", "Une liste de mots venus du grec"],
      reponse: "Une description qui s'en tient à ce qu'on voit, sans avis du narrateur",
      explication: "Objective veut dire : seulement ce qu'on peut observer. Le narrateur n'interprète pas.", source: S },
    { id: "litterature-s02-2-q2", fiche: "litterature-s02-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "« Le sac est bleu et il a deux poches. » C'est une description objective.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "La phrase dit seulement ce qu'on voit, une couleur et des poches. Le narrateur ne donne aucun avis.", source: S },
    { id: "litterature-s02-2-q3", fiche: "litterature-s02-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi la phrase « Le garçon porte un pull rouge et un bonnet noir » est-elle une description objective ?",
      choix: ["Parce qu'elle ne dit que des choses visibles, sans interprétation", "Parce qu'elle montre que le narrateur admire ce garçon", "Parce qu'elle exagère", "Parce qu'elle contient une métaphore"],
      reponse: "Parce qu'elle ne dit que des choses visibles, sans interprétation",
      explication: "Un pull rouge, un bonnet noir : tout se voit. Rien ne dit ce que pense le narrateur.", source: S },
    { id: "litterature-s02-2-q4", fiche: "litterature-s02-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Dans une description objective, le narrateur dit ce qu'il ressent face à ce qu'il voit.",
      corrections: ["Faux : il s'en tient à ce qu'on peut voir, sans y mêler ses sentiments.", "Faux : il invente des choses qu'on ne peut pas voir.", "Faux : il ne décrit jamais les vêtements."],
      reponse: { vrai: false, correction: "Faux : il s'en tient à ce qu'on peut voir, sans y mêler ses sentiments." },
      explication: "Les sentiments du narrateur, c'est la marque d'une description subjective. L'objective reste sur ce qui se voit.", source: S },
    { id: "litterature-s02-2-q24", fiche: "litterature-s02-2-f1", type: "qcm", niveau: 2,
      enonce: "Laquelle de ces phrases est une description objective ?",
      choix: ["Le cartable est noir et se ferme par une boucle.", "Ce cartable affreux me fait honte.", "J'adore ce cartable, il me porte chance.", "Ce pauvre cartable me fait pitié."],
      reponse: "Le cartable est noir et se ferme par une boucle.",
      explication: "Une couleur et une boucle, cela se voit : aucun avis n'est donné. Les trois autres phrases disent ce que ressent le narrateur.",
      indice: "Cherche la phrase où personne ne donne son avis.", source: S },

    // f2 : la description subjective
    { id: "litterature-s02-2-q5", fiche: "litterature-s02-2-f2", type: "qcm", niveau: 1,
      enonce: "Dans une description subjective, qu'est-ce qui se mêle à ce que le narrateur observe ?",
      choix: ["Ses sentiments et ses idées", "Uniquement des mesures", "L'origine grecque des mots", "Rien du tout"],
      reponse: "Ses sentiments et ses idées",
      explication: "Le narrateur décrit ce qu'il voit avec ce qu'il ressent et pense. C'est ce qui rend la description subjective.", source: S },
    { id: "litterature-s02-2-q6", fiche: "litterature-s02-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "« Je n'aime pas cette maison sombre. » C'est une description subjective.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "« Je n'aime pas » montre un avis personnel du narrateur. La description est donc subjective.", source: S },
    { id: "litterature-s02-2-q7", fiche: "litterature-s02-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment reconnaît-on qu'une description est subjective ?",
      choix: ["Elle contient les sentiments ou les idées du narrateur", "Elle ne parle que de couleurs et de tailles", "Elle ne contient aucun verbe", "Elle est toujours très longue"],
      reponse: "Elle contient les sentiments ou les idées du narrateur",
      explication: "Un avis, une émotion, une idée personnelle : ce sont les indices d'une description subjective. Les couleurs et les tailles seules restent objectives.", source: S },
    { id: "litterature-s02-2-q8", fiche: "litterature-s02-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquelles de ces descriptions sont subjectives ?",
      choix: ["Cette horrible porte me fait peur.", "La porte est verte.", "Ce chat adorable me rend joyeux.", "Le chat a les yeux jaunes.", "Je trouve ce jardin magnifique."],
      reponse: ["Cette horrible porte me fait peur.", "Ce chat adorable me rend joyeux.", "Je trouve ce jardin magnifique."],
      explication: "Horrible, adorable, magnifique : ces mots disent ce que pense le narrateur. La porte verte et les yeux jaunes se voient, sans avis.",
      indice: "Cherche les mots qui donnent un avis.", source: S },
    { id: "litterature-s02-2-q9", fiche: "litterature-s02-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Un narrateur décrit la jeune fille qu'il aime en mêlant son admiration à ce qu'il voit. C'est une description objective.",
      corrections: ["Faux : ses sentiments se mêlent à ce qu'il voit, la description est subjective.", "Faux : c'est forcément une hyperbole.", "Faux : c'est une description rapide et simple."],
      reponse: { vrai: false, correction: "Faux : ses sentiments se mêlent à ce qu'il voit, la description est subjective." },
      explication: "Son amour colore tout ce qu'il observe. C'est le signe d'une description subjective.", source: S },
    { id: "litterature-s02-2-q25", fiche: "litterature-s02-2-f2", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce qui sépare une description subjective d'une description objective ?",
      choix: ["Les sentiments et les idées du narrateur s'y mêlent à ce qu'il observe", "Elle contient plus de couleurs", "Elle est toujours plus courte", "Elle ne parle que de personnages"],
      reponse: "Les sentiments et les idées du narrateur s'y mêlent à ce qu'il observe",
      explication: "L'objective s'en tient à ce qui se voit, sans interprétation. La subjective y ajoute ce que le narrateur ressent et pense.", source: S },
    { id: "litterature-s02-2-q26", fiche: "litterature-s02-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Une description ___ s'en tient à ce qu'on voit ; une description ___ y mêle les sentiments du narrateur.",
      banque: ["objective", "subjective", "rapide", "précise"],
      reponse: [["objective"], ["subjective"]],
      explication: "Objective : seulement ce qu'on observe. Subjective : ce qu'on observe, avec les sentiments et les idées du narrateur.", source: S },

    // f3 : description précise ou rapide
    { id: "litterature-s02-2-q10", fiche: "litterature-s02-2-f3", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on une description qui accumule beaucoup de détails ?",
      choix: ["Une description précise, fouillée", "Une description rapide, simple", "Une étymologie", "Une hyperbole"],
      reponse: "Une description précise, fouillée",
      explication: "Beaucoup de détails, c'est une description précise. On dit aussi qu'elle est fouillée.", source: S },
    { id: "litterature-s02-2-q11", fiche: "litterature-s02-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "« La ville est grande. » C'est une description rapide et simple.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Quelques mots, aucun détail : la description est rapide. Elle ne cherche pas la précision.", source: S },
    { id: "litterature-s02-2-q12", fiche: "litterature-s02-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment reconnaît-on une description rapide ?",
      choix: ["Elle dit peu de choses, en quelques mots, sans détails", "Elle accumule les détails", "Elle contient toujours une métaphore", "Elle parle forcément de vitesse"],
      reponse: "Elle dit peu de choses, en quelques mots, sans détails",
      explication: "Une description rapide reste simple et peu précise. Quelques mots lui suffisent.", source: S },
    { id: "litterature-s02-2-q13", fiche: "litterature-s02-2-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Une description ___ accumule les détails ; une description ___ se contente de quelques mots.",
      banque: ["précise", "rapide", "subjective", "grecque"],
      reponse: [["précise", "fouillée"], ["rapide", "simple"]],
      explication: "Précise ou fouillée quand il y a beaucoup de détails. Rapide ou simple quand il y en a peu.", source: S },
    { id: "litterature-s02-2-q14", fiche: "litterature-s02-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Une description précise et fouillée ne peut jamais contenir de métaphore.",
      corrections: ["Faux : une description fouillée peut même contenir une métaphore.", "Faux : seule une description rapide peut contenir une métaphore.", "Faux : une description précise ne contient que des métaphores."],
      reponse: { vrai: false, correction: "Faux : une description fouillée peut même contenir une métaphore." },
      explication: "Le corrigé cite une description détaillée qui contient justement une métaphore. Les détails n'empêchent pas les images.", source: S },

    // f4 : la métaphore
    { id: "litterature-s02-2-q15", fiche: "litterature-s02-2-f4", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'une métaphore ?",
      choix: ["Une image : on parle d'une chose à l'aide d'une autre", "Une liste d'objets", "L'origine d'un mot", "Une description sans aucun détail"],
      reponse: "Une image : on parle d'une chose à l'aide d'une autre",
      explication: "La métaphore évoque une chose par l'image d'une autre. Par exemple, l'amour avec l'image de la musique.", source: S },
    { id: "litterature-s02-2-q16", fiche: "litterature-s02-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "« Mon frère est un vrai moulin à paroles. » Cette phrase contient une métaphore.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "On parle du frère avec l'image d'un moulin. On comprend qu'il parle sans arrêt.", source: S },
    { id: "litterature-s02-2-q17", fiche: "litterature-s02-2-f4", type: "qcm", niveau: 2,
      enonce: "Un narrateur évoque celle qu'il aime avec l'image de la musique. Quelle figure de style emploie-t-il ?",
      choix: ["Une métaphore", "Une énumération", "Une étymologie", "Une description rapide"],
      reponse: "Une métaphore",
      explication: "Il parle de son amour avec l'image de la musique. Parler d'une chose avec l'image d'une autre, c'est une métaphore.", source: S },
    { id: "litterature-s02-2-q18", fiche: "litterature-s02-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on qu'un portrait qui donne à un personnage un air d'insecte contient une métaphore ?",
      choix: ["Parce qu'il parle du personnage avec l'image d'un insecte", "Parce que le personnage est vraiment un insecte", "Parce qu'il énumère des insectes", "Parce qu'il donne l'origine du mot « insecte »"],
      reponse: "Parce qu'il parle du personnage avec l'image d'un insecte",
      explication: "Le personnage n'est pas un insecte : on lui en donne l'image. C'est le principe de la métaphore.", source: S },
    { id: "litterature-s02-2-q19", fiche: "litterature-s02-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Mon frère est un vrai moulin à paroles », le frère est réellement un moulin.",
      corrections: ["Faux : le moulin est une image pour dire qu'il parle beaucoup.", "Faux : c'est une énumération.", "Faux : c'est une description objective."],
      reponse: { vrai: false, correction: "Faux : le moulin est une image pour dire qu'il parle beaucoup." },
      explication: "Une métaphore ne se prend pas mot à mot. Le moulin est une image.", source: S },

    // f5 : ce qu'une description laisse deviner
    { id: "litterature-s02-2-q20", fiche: "litterature-s02-2-f5", type: "qcm", niveau: 2,
      enonce: "Un narrateur décrit un homme dont les yeux fouillent sans cesse le regard des autres. Que peut-on deviner de son caractère ?",
      choix: ["Il est sans doute méfiant", "Il est sans doute très timide et doux", "Il ne voit rien", "Rien : une description ne dit rien du caractère"],
      reponse: "Il est sans doute méfiant",
      explication: "Ce regard qui scrute les autres fait penser à la méfiance. Le narrateur le suggère sans le dire.", source: S },
    { id: "litterature-s02-2-q21", fiche: "litterature-s02-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "Une description ne dit jamais rien du caractère d'un personnage.",
      corrections: ["Faux : elle peut laisser deviner son caractère, par exemple la méfiance.", "Faux : elle donne toujours son âge exact.", "Faux : elle dit seulement son nom."],
      reponse: { vrai: false, correction: "Faux : elle peut laisser deviner son caractère, par exemple la méfiance." },
      explication: "Un regard, une attitude en disent long sur un personnage. Une description peut donc sous-entendre un caractère.", source: S },
    { id: "litterature-s02-2-q22", fiche: "litterature-s02-2-f5", type: "qcm", niveau: 2,
      enonce: "« Je déteste ceux qui lisent par-dessus mon épaule. » Quel comportement le narrateur dénonce-t-il ?",
      choix: ["La curiosité indiscrète", "La générosité", "Le courage", "La politesse"],
      reponse: "La curiosité indiscrète",
      explication: "Lire par-dessus l'épaule de quelqu'un, c'est vouloir voir ce qui ne nous regarde pas. Le narrateur dénonce cette indiscrétion.", source: S },
    { id: "litterature-s02-2-q23", fiche: "litterature-s02-2-f5", type: "qcm", niveau: 3,
      enonce: "Comment sait-on que « Je déteste ceux qui lisent par-dessus mon épaule » est une description subjective ?",
      choix: ["« Je déteste » montre un avis personnel du narrateur", "La phrase ne contient que des faits visibles", "La phrase est une énumération", "La phrase donne l'origine d'un mot"],
      reponse: "« Je déteste » montre un avis personnel du narrateur",
      explication: "Le narrateur dit ouvertement qu'il est agacé. Son avis personnel rend la description subjective.", source: S }
  ],
  bonus: [],
  nonCouvert: [
    "La leçon littéraire elle-même (livret 1, pages 19 à 22, et les pages 18 et 20 citées par l'emploi du temps) n'est pas déposée : seules les réponses du corrigé le sont, et les notions en sont tirées.",
    "Une définition complète de la métaphore : le corrigé en donne seulement deux exemples (l'image de la musique, l'air d'insecte).",
    "Le résumé de la leçon et les outils de la langue à apprendre.",
    "Les extraits lus (livret, pages 13 à 17) ne sont pas déposés. Les réponses de compréhension du corrigé qui portent sur eux (pages 1 et 2 : humeur d'un narrateur, accueil des voyageurs par Kubilaï dans le Livre des merveilles) relèvent de la lecture des textes (litterature-s02-1) et ne sont pas reprises ici.",
    "Le dessin du capitaine Flint demandé en compréhension : production personnelle, hors jeu."
  ]
};
