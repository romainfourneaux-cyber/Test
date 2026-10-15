// Source en clair du cours litterature-s03-2 (livret 1, cours 3 : la leçon littéraire, p. 24 à 26 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/litterature-s03-2.js.
// Source déposée : le corrigé du livret 1, page 2, colonne de droite (titrée « Chapitre II - Cours 3 » dans le
// corrigé, alors que l'emploi du temps range le cours 3 au chapitre I), rubrique « Questions sur le cours ».
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
// Devoir 1 (litterature-d1) : il demande la façon de raconter d'un autre texte. Aucune de ses réponses n'est
// reprise ni proposée en choix ici.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 2 };

module.exports = {
  id: "litterature-s03-2",
  fiches: [
    {
      id: "litterature-s03-2-f1", notion: "L'antithèse",
      titre: "L'antithèse : deux contraires côte à côte",
      texte: "L'antithèse rapproche deux idées contraires, comme le bruit et le silence, ce qui crée un contraste. Opposer le vacarme qui entoure des personnages au silence qu'ils n'arrivent pas à briser fait mieux sentir ce silence, et laisse deviner des sentiments forts qu'ils n'osent pas dire. Exemple simple : « La cour résonnait de rires ; la classe restait muette. »",
      pointsCles: [
        "Antithèse : deux idées opposées rapprochées, qui font contraste",
        "Le contraste fait ressortir chacun des deux côtés",
        "Elle peut révéler des sentiments que les personnages gardent pour eux, par pudeur"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "antithèse", def: "le rapprochement de deux idées opposées, qui crée un contraste" },
        { mot: "pudeur", def: "la gêne qui retient de montrer ou de dire ses sentiments" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s03-2-f2", notion: "Les sentiments d'un personnage et leur évolution",
      titre: "Des sentiments qui changent",
      texte: "Les sentiments d'un personnage peuvent évoluer au fil d'un passage. Un jeune homme peut être d'abord vexé par une réponse ironique et très brève de son chef, puis ressentir une injustice plus profonde quand ce chef ne dit rien de son courage. Pour les repérer, on relève les mots qui disent ce qu'il éprouve.",
      pointsCles: [
        "Les sentiments d'un personnage peuvent changer d'un moment à l'autre",
        "Une réplique ironique et sèche peut vexer, ou froisser",
        "Un silence peut blesser : on attendait un mot qui ne vient pas",
        "Méthode : relever les mots qui disent ce que ressent le personnage"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "froissé", def: "vexé par une remarque, piqué au vif" },
        { mot: "lapidaire", def: "très bref et sec, comme une réponse de deux mots" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s03-2-f3", notion: "La focalisation interne",
      titre: "Vivre l'histoire de l'intérieur",
      texte: "En focalisation interne, on suit le récit à travers un personnage : on partage ce qu'il ressent et ce qu'il pense. Les mots qui disent ses désirs ou ses regrets en sont des indices, et on les cite pour le prouver. Exemple : « J'avais peur et je me demandais qui allait frapper à la porte. »",
      pointsCles: [
        "Focalisation interne : on voit l'histoire à travers un personnage",
        "On a accès à ce qu'il ressent et à ce qu'il pense",
        "Indices : ses désirs, ses regrets, ses sensations"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "focalisation interne", def: "une façon de raconter où l'on partage ce que ressent et pense un personnage" }
      ],
      schema: null, prerequis: ["litterature-s03-2-f2"], source: S
    }
  ],
  schemas: [],
  questions: [
    // f1 : l'antithèse
    { id: "litterature-s03-2-q1", fiche: "litterature-s03-2-f1", type: "qcm", niveau: 1,
      enonce: "Que fait une antithèse ?",
      choix: ["Elle oppose deux idées contraires", "Elle exagère une réalité", "Elle donne l'origine d'un mot", "Elle cite des objets les uns après les autres"],
      reponse: "Elle oppose deux idées contraires",
      explication: "L'antithèse rapproche deux idées opposées. Cela crée un contraste.", source: S },
    { id: "litterature-s03-2-q2", fiche: "litterature-s03-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "« La cour résonnait de rires ; la classe restait muette. » Cette phrase contient une antithèse.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Les rires bruyants de la cour s'opposent au silence de la classe. Cette opposition est une antithèse.", source: S },
    { id: "litterature-s03-2-q3", fiche: "litterature-s03-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi un auteur oppose-t-il le vacarme de la rue au silence de ses personnages ?",
      choix: ["Pour faire mieux sentir ce silence et les sentiments qu'ils retiennent", "Pour expliquer d'où vient le mot « silence »", "Pour énumérer tous les bruits de la ville", "Pour montrer que les personnages bavardent sans arrêt"],
      reponse: "Pour faire mieux sentir ce silence et les sentiments qu'ils retiennent",
      explication: "Le contraste fait ressortir le silence. On devine des sentiments forts que les personnages n'arrivent pas à dire.",
      indice: "Pense à l'effet du contraste.", source: S },
    { id: "litterature-s03-2-q4", fiche: "litterature-s03-2-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "L'antithèse rapproche deux idées ___ : elle crée un ___.",
      banque: ["opposées", "contraste", "semblables", "mouvement"],
      reponse: [["opposées", "contraires"], ["contraste"]],
      explication: "Deux idées opposées côte à côte forment un contraste. C'est le principe de l'antithèse.", source: S },
    { id: "litterature-s03-2-q5", fiche: "litterature-s03-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Une antithèse rapproche deux idées qui veulent dire la même chose.",
      corrections: ["Faux : elle rapproche deux idées opposées.", "Faux : elle ne contient qu'une seule idée.", "Faux : elle rapproche deux mots grecs."],
      reponse: { vrai: false, correction: "Faux : elle rapproche deux idées opposées." },
      explication: "L'antithèse joue sur les contraires, comme le bruit et le silence. Deux idées semblables ne font pas de contraste.", source: S },

    // f2 : les sentiments d'un personnage
    { id: "litterature-s03-2-q6", fiche: "litterature-s03-2-f2", type: "qcm", niveau: 1,
      enonce: "Un personnage est « froissé » par une remarque. Quel mot dit la même chose ?",
      choix: ["Vexé", "Joyeux", "Fatigué", "Affamé"],
      reponse: "Vexé",
      explication: "Être froissé, c'est être vexé. Le corrigé emploie les deux mots pour le même personnage.", source: S },
    { id: "litterature-s03-2-q7", fiche: "litterature-s03-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans un passage, les sentiments d'un personnage restent toujours les mêmes du début à la fin.",
      corrections: ["Faux : ils peuvent changer, par exemple passer de la vexation à un sentiment d'injustice.", "Faux : un personnage n'a jamais de sentiments.", "Faux : ils changent seulement à la dernière page du livre."],
      reponse: { vrai: false, correction: "Faux : ils peuvent changer, par exemple passer de la vexation à un sentiment d'injustice." },
      explication: "Les sentiments évoluent au fil des événements. Le corrigé montre un personnage d'abord vexé, puis blessé par une injustice.", source: S },
    { id: "litterature-s03-2-q8", fiche: "litterature-s03-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment repérer les sentiments d'un personnage dans un passage ?",
      choix: ["En relevant les mots qui disent ce qu'il éprouve, comme « froissé » ou « blessé »", "En comptant les lignes du passage", "En cherchant l'origine grecque des mots", "En regardant seulement la couleur de ses vêtements"],
      reponse: "En relevant les mots qui disent ce qu'il éprouve, comme « froissé » ou « blessé »",
      explication: "Les sentiments se lisent dans les mots du texte. On les relève, puis on les nomme.", source: S },
    { id: "litterature-s03-2-q9", fiche: "litterature-s03-2-f2", type: "qcm", niveau: 2,
      enonce: "Un personnage espérait qu'on salue son courage, mais son chef n'en parle même pas. Que ressent-il sans doute ?",
      choix: ["Un sentiment d'injustice", "Une grande fierté", "De l'indifférence", "Une joie immense"],
      reponse: "Un sentiment d'injustice",
      explication: "Il attendait qu'on reconnaisse sa qualité, et rien ne vient. Ce silence le peine : il se sent injustement traité.", source: S },
    { id: "litterature-s03-2-q10", fiche: "litterature-s03-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Une réponse ironique et très brève peut vexer un personnage.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Le corrigé montre un personnage vexé par la réponse sèche de son supérieur. Le ton d'une réplique agit sur les sentiments.", source: S },
    { id: "litterature-s03-2-q11", fiche: "litterature-s03-2-f2", type: "association", niveau: 2,
      enonce: "Relie chaque situation au sentiment qu'elle fait naître.",
      gauche: ["Son chef se moque de lui par une réplique ironique de deux mots", "Son chef ne dit pas un mot du courage qu'il espérait voir reconnu", "Son chef le félicite devant tout le monde"],
      droite: ["Un sentiment d'injustice", "La fierté", "La vexation"],
      reponse: [[0, 2], [1, 0], [2, 1]],
      explication: "Une réplique moqueuse vexe ; se taire sur un mérite qu'on attendait de voir reconnu paraît injuste. Des félicitations, elles, rendent fier.", source: S },

    // f3 : la focalisation interne
    { id: "litterature-s03-2-q12", fiche: "litterature-s03-2-f3", type: "qcm", niveau: 1,
      enonce: "En focalisation interne, à travers quoi suit-on l'histoire ?",
      choix: ["Le ressenti et les pensées d'un personnage", "Une liste de dates", "Les définitions d'un dictionnaire", "Uniquement les paysages, sans personnage"],
      reponse: "Le ressenti et les pensées d'un personnage",
      explication: "On vit l'histoire de l'intérieur d'un personnage. On connaît ce qu'il ressent et ce qu'il pense.", source: S },
    { id: "litterature-s03-2-q13", fiche: "litterature-s03-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "« J'avais peur et je me demandais qui allait frapper à la porte. » Ce passage est raconté en focalisation interne.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "On entre dans la peur et les questions du personnage. C'est le signe d'une focalisation interne.", source: S },
    { id: "litterature-s03-2-q14", fiche: "litterature-s03-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment reconnaît-on une focalisation interne ?",
      choix: ["Le texte fait connaître les désirs, les regrets et les sensations d'un personnage", "Le texte ne contient que des chiffres", "Le texte ne contient aucun personnage", "Chaque phrase est une exagération"],
      reponse: "Le texte fait connaître les désirs, les regrets et les sensations d'un personnage",
      explication: "La focalisation interne passe par le ressenti d'un personnage. Ses désirs et ses regrets en sont les indices.", source: S },
    { id: "litterature-s03-2-q15", fiche: "litterature-s03-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "En focalisation interne, on ne sait rien de ce que pense le personnage.",
      corrections: ["Faux : on suit justement l'histoire à travers ses pensées et son ressenti.", "Faux : on ne connaît que son nom.", "Faux : on ne voit que les paysages."],
      reponse: { vrai: false, correction: "Faux : on suit justement l'histoire à travers ses pensées et son ressenti." },
      explication: "C'est tout le contraire : on est dans la tête du personnage. On partage ce qu'il pense et ressent.", source: S },
    { id: "litterature-s03-2-q16", fiche: "litterature-s03-2-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Quelles phrases montrent qu'on suit l'histoire à travers ce que ressent un personnage ?",
      choix: ["Je regrettais déjà ma maison.", "Je n'avais qu'une envie : dormir.", "La maison a deux étages.", "Le train part à midi.", "J'avais hâte de retrouver mes amis."],
      reponse: ["Je regrettais déjà ma maison.", "Je n'avais qu'une envie : dormir.", "J'avais hâte de retrouver mes amis."],
      explication: "Un regret, une envie, une impatience : on est dans le ressenti du personnage. Les deux autres phrases donnent seulement des faits.",
      indice: "Cherche les phrases où l'on sent ce que vit le personnage.", source: S },
    { id: "litterature-s03-2-q17", fiche: "litterature-s03-2-f3", type: "qcm", niveau: 3,
      enonce: "Comment prouver qu'un passage est raconté en focalisation interne ?",
      choix: ["En citant les mots qui montrent ce que le personnage ressent et pense", "En comptant les personnages du passage", "En donnant le titre du livre", "En recopiant tout le passage sans rien expliquer"],
      reponse: "En citant les mots qui montrent ce que le personnage ressent et pense",
      explication: "Le corrigé nomme la focalisation, puis cite des passages où l'on entend les désirs et les regrets du personnage. La citation sert de preuve.", source: S }
  ],
  bonus: [],
  nonCouvert: [
    "La leçon littéraire elle-même (livret 1, pages 24 à 26) n'est pas déposée : seules les réponses du corrigé le sont, et les notions en sont tirées.",
    "La définition de l'antithèse donnée par la leçon : le corrigé en commente seulement un exemple.",
    "Le corrigé ne parle que de la focalisation interne : ce que la leçon dit d'autre sur la façon de raconter n'est pas déposé.",
    "Le résumé de la leçon et les outils de la langue à apprendre.",
    "Les extraits lus (livret, pages 23 et 24) et les réponses de compréhension qui portent sur eux (personnage principal, portrait du capitaine, pays regretté par le narrateur, arrivée d'un bateau) : ils relèvent de la lecture des textes (litterature-s03-1), non déposée."
  ]
};
