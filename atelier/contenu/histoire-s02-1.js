// Source en clair du cours histoire-s02-1 « Cours 3 – Le christianisme, entre Orient et Occident ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s02-1.
// Seule source : la partie « support » de la séance 3 (pages 1 et 2 : tableau à compléter et mots importants).
// Le devoir d'entraînement du même fichier (pages 3 à 5) relève de histoire-s02-2 : il n'est pas repris ici.
// Deux faits du tableau viennent des cours précédents (capitale byzantine, pape) : leur source est indiquée.
const F = "cours/histoire/Histoire 5e - Seance 3 - Support et Devoir entrainement.pdf";
const S = p => ({ fichier: F, page: p });
const S1 = p => ({ fichier: "cours/histoire/Histoire 5e - Seance 1 - Support.pdf", page: p });
const S2 = p => ({ fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: p });

module.exports = {
  id: "histoire-s02-1",
  fiches: [
    {
      id: "histoire-s02-1-f1", notion: "Deux empires chrétiens : Orient et Occident",
      titre: "Être chrétien, entre Orient et Occident",
      texte: "Au Moyen Âge, deux empires chrétiens existent en même temps : l'Empire byzantin à l'est, en Orient, et l'Empire carolingien à l'ouest, en Occident. Le cours les compare point par point : leur capitale, leur chef religieux, leur langue liturgique, une de leurs basiliques et la façon dont le christianisme s'y diffuse.",
      pointsCles: ["Orient : l'Empire byzantin", "Occident : l'Empire carolingien", "On compare : capitale, chef religieux, langue liturgique, basilique, diffusion du christianisme", "Déjà vu : Constantinople, capitale byzantine (cours 1) ; le pape, chef de l'Église catholique (cours 2)"],
      dates: [],
      lieux: ["Constantinople", "Rome"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["histoire-s01-1-f3", "histoire-s01-2-f1", "histoire-s01-2-f3"], source: S(1)
    },
    {
      id: "histoire-s02-1-f2", notion: "La christianisation",
      titre: "Répandre le christianisme",
      texte: "La christianisation, c'est le fait de faire connaître et de répandre le christianisme dans des régions ou chez des peuples qui ne le pratiquent pas encore. On emploie aussi le mot « évangélisation », qui a le même sens. Dans le tableau du cours, c'est la ligne « diffusion du christianisme », pour chacun des deux empires.",
      pointsCles: ["Christianisation : répandre le christianisme là où il n'est pas encore pratiqué", "Synonyme : évangélisation"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "christianisation", def: "le fait de répandre la religion chrétienne là où elle n'est pas encore pratiquée" }
      ],
      schema: null, prerequis: ["histoire-s02-1-f1"], source: S(1)
    },
    {
      id: "histoire-s02-1-f3", notion: "Le schisme",
      titre: "Quand l'Église se divise",
      texte: "Un schisme, c'est une rupture au sein de l'Église : le christianisme se coupe alors en plusieurs branches, qui se séparent les unes des autres. Le mot désigne donc une division entre chrétiens, et non une guerre ni une conquête.",
      pointsCles: ["Schisme : une rupture au sein de l'Église", "Après un schisme, le christianisme forme plusieurs branches"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "schisme", def: "une rupture dans l'Église, qui coupe le christianisme en plusieurs branches" }
      ],
      schema: null, prerequis: ["histoire-s02-1-f1"], source: S(1)
    },
    {
      id: "histoire-s02-1-f4", notion: "La théologie",
      titre: "Réfléchir sur la foi",
      texte: "La théologie est un travail de réflexion : on y étudie la foi, la doctrine et les grands principes d'une religion. Il ne faut pas la confondre avec la christianisation : la théologie cherche à comprendre une religion, elle ne sert pas à la répandre.",
      pointsCles: ["Théologie : réfléchir à la foi, à la doctrine et aux grands principes d'une religion"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "théologie", def: "le travail de réflexion sur la foi, la doctrine et les principes d'une religion" }
      ],
      schema: null, prerequis: ["histoire-s02-1-f1"], source: S(1)
    }
  ],
  schemas: [],
  questions: [
    // f1 : deux empires chrétiens
    { id: "histoire-s02-1-q1", fiche: "histoire-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Dans le tableau du cours, quel empire représente l'Orient chrétien ?",
      choix: ["L'Empire byzantin", "L'Empire carolingien", "Les royaumes germaniques", "L'émirat de Cordoue"],
      reponse: "L'Empire byzantin",
      explication: "L'Empire byzantin, ou Empire romain d'Orient, est à l'est. L'Empire carolingien est à l'ouest, en Occident.", source: S(1) },
    { id: "histoire-s02-1-q2", fiche: "histoire-s02-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "L'Empire carolingien est l'empire chrétien de l'Orient.",
      corrections: ["Faux : l'Empire carolingien est en Occident ; l'Orient, c'est l'Empire byzantin.", "Faux : l'Empire carolingien n'est pas chrétien.", "Faux : l'Empire carolingien a pour capitale Constantinople."],
      reponse: { vrai: false, correction: "Faux : l'Empire carolingien est en Occident ; l'Orient, c'est l'Empire byzantin." },
      explication: "Charlemagne est empereur d'Occident. L'empire chrétien d'Orient est l'Empire byzantin.", source: S(1) },
    { id: "histoire-s02-1-q3", fiche: "histoire-s02-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Sur quels points le cours compare-t-il les deux empires chrétiens ? (plusieurs réponses)",
      choix: ["La capitale", "Le chef religieux", "La langue liturgique", "La diffusion du christianisme", "Le nombre d'habitants", "La monnaie"],
      reponse: ["La capitale", "Le chef religieux", "La langue liturgique", "La diffusion du christianisme"],
      explication: "Le tableau compare la capitale, le chef religieux, la langue liturgique, une basilique et la diffusion du christianisme. Il ne parle ni d'habitants ni de monnaie.", source: S(1) },
    { id: "histoire-s02-1-q4", fiche: "histoire-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Grâce au cours 1, quelle capitale peut-on déjà inscrire dans la colonne de l'Empire byzantin ?",
      choix: ["Constantinople", "Rome", "Ravenne", "Aix-la-Chapelle"],
      reponse: "Constantinople",
      explication: "De 395 à 1453, Constantinople est la ville capitale de l'Empire romain d'Orient. C'est donc la capitale byzantine.", source: S1(3) },
    { id: "histoire-s02-1-q5", fiche: "histoire-s02-1-f1", type: "qcm", niveau: 3,
      enonce: "Comment sait-on que l'Empire byzantin et l'Empire carolingien existent en même temps ?",
      choix: ["L'Empire byzantin dure de 395 à 1453, et Charlemagne est empereur de 800 à 814", "Ils ont la même capitale", "Justinien et Charlemagne règnent ensemble", "Ils naissent tous les deux en 476"],
      reponse: "L'Empire byzantin dure de 395 à 1453, et Charlemagne est empereur de 800 à 814",
      explication: "Les années 800 à 814 se trouvent entre 395 et 1453. Les deux empires existent donc au même moment.", source: S2(1) },
    // f2 : christianisation
    { id: "histoire-s02-1-q6", fiche: "histoire-s02-1-f2", type: "qcm", niveau: 1,
      enonce: "Quel mot a le même sens que « christianisation » ?",
      choix: ["Évangélisation", "Schisme", "Théologie", "Renaissance"],
      reponse: "Évangélisation",
      explication: "Le cours donne ces deux mots comme synonymes. Ils désignent la diffusion du christianisme.", source: S(1) },
    { id: "histoire-s02-1-q7", fiche: "histoire-s02-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "La christianisation, c'est répandre le christianisme chez des peuples qui ne sont pas encore chrétiens.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : christianiser, c'est faire connaître le christianisme là où il n'est pas pratiqué. On dit aussi évangéliser.", source: S(1) },
    { id: "histoire-s02-1-q8", fiche: "histoire-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on la diffusion du christianisme dans de nouveaux territoires ?",
      choix: ["La christianisation", "Le schisme", "La théologie", "Le bénéfice"],
      reponse: "La christianisation",
      explication: "Répandre le christianisme dans de nouveaux territoires, c'est la christianisation. On parle aussi d'évangélisation.", source: S(1) },
    { id: "histoire-s02-1-q9", fiche: "histoire-s02-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "La christianisation désigne la séparation de l'Église en plusieurs branches.",
      corrections: ["Faux : cette séparation est un schisme ; la christianisation est la diffusion du christianisme.", "Faux : la christianisation est l'étude de la foi.", "Faux : la christianisation est le couronnement d'un empereur."],
      reponse: { vrai: false, correction: "Faux : cette séparation est un schisme ; la christianisation est la diffusion du christianisme." },
      explication: "Une séparation dans l'Église s'appelle un schisme. La christianisation, elle, répand le christianisme.", source: S(1) },
    // f3 : schisme
    { id: "histoire-s02-1-q10", fiche: "histoire-s02-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un schisme ?",
      choix: ["Une division de l'Église en plusieurs branches chrétiennes séparées", "La diffusion du christianisme chez de nouveaux peuples", "L'étude de la foi et de la doctrine", "Une terre donnée contre des services militaires"],
      reponse: "Une division de l'Église en plusieurs branches chrétiennes séparées",
      explication: "Un schisme coupe l'Église en plusieurs branches. Ce n'est ni une diffusion ni une étude.", source: S(1) },
    { id: "histoire-s02-1-q11", fiche: "histoire-s02-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Un schisme est une rupture au sein de l'Église.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : lors d'un schisme, l'Église se coupe en plusieurs branches. Les chrétiens se divisent.", source: S(1) },
    { id: "histoire-s02-1-q12", fiche: "histoire-s02-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Un schisme, c'est une guerre entre deux empires chrétiens.",
      corrections: ["Faux : c'est une rupture au sein de l'Église, qui se coupe en plusieurs branches.", "Faux : c'est la diffusion du christianisme.", "Faux : c'est l'étude de la foi."],
      reponse: { vrai: false, correction: "Faux : c'est une rupture au sein de l'Église, qui se coupe en plusieurs branches." },
      explication: "Un schisme n'est pas une guerre. C'est une division de l'Église en plusieurs branches.", source: S(1) },
    { id: "histoire-s02-1-q13", fiche: "histoire-s02-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on de « branches » du christianisme après un schisme ?",
      choix: ["Parce que l'Église s'est séparée en plusieurs parties", "Parce que le christianisme disparaît", "Parce que l'Église s'agrandit par des conquêtes", "Parce que chaque empire change de capitale"],
      reponse: "Parce que l'Église s'est séparée en plusieurs parties",
      explication: "Après un schisme, l'Église n'est plus unie. Elle forme plusieurs branches séparées.", source: S(1) },
    // f4 : théologie
    { id: "histoire-s02-1-q14", fiche: "histoire-s02-1-f4", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on l'étude réfléchie de la foi et des principes d'une religion ?",
      choix: ["La théologie", "La christianisation", "Le schisme", "La renaissance carolingienne"],
      reponse: "La théologie",
      explication: "La théologie réfléchit à la foi et à la doctrine. C'est une étude, pas une diffusion.", source: S(1) },
    { id: "histoire-s02-1-q15", fiche: "histoire-s02-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "La théologie étudie la foi, la doctrine et les principes d'une religion.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est un travail de réflexion sur une religion. On l'appelle la théologie.", source: S(1) },
    { id: "histoire-s02-1-q16", fiche: "histoire-s02-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "La théologie, c'est faire connaître le christianisme à de nouveaux peuples.",
      corrections: ["Faux : ça, c'est la christianisation ; la théologie est l'étude de la foi.", "Faux : la théologie est une séparation dans l'Église.", "Faux : la théologie est une période de renouveau culturel."],
      reponse: { vrai: false, correction: "Faux : ça, c'est la christianisation ; la théologie est l'étude de la foi." },
      explication: "Répandre le christianisme, c'est la christianisation. La théologie est une étude de la foi.", source: S(1) },
    { id: "histoire-s02-1-q17", fiche: "histoire-s02-1-f4", type: "association", niveau: 2,
      enonce: "Relie chaque mot du cours à son sens.",
      gauche: ["Christianisation", "Schisme", "Théologie"],
      droite: ["Étude de la foi et de la doctrine", "Diffusion du christianisme chez des peuples non chrétiens", "Séparation de l'Église en plusieurs branches"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "Christianisation : diffuser ; schisme : se séparer ; théologie : étudier la foi.", source: S(1) }
  ],
  bonus: [],
  nonCouvert: [
    "Le contenu du tableau comparatif, rempli pendant la vidéo : seules la capitale byzantine (cours 1) et le rôle du pape (cours 2) sont donnés par les supports.",
    "La capitale de l'Empire carolingien.",
    "Le chef religieux de l'Église d'Orient.",
    "Le sens de l'expression « langue liturgique » et la langue de chaque Église.",
    "Les exemples de basiliques, byzantine et carolingienne, demandés dans le tableau.",
    "Comment le christianisme se diffuse dans chacun des deux empires.",
    "Quel schisme sépare les chrétiens d'Orient et d'Occident, et à quelle date.",
    "La leçon à apprendre : le cadre est laissé vide dans le support.",
    "Le devoir d'entraînement des pages 3 à 5 n'est pas repris : c'est un exercice de révision (histoire-s02-2)."
  ]
};
