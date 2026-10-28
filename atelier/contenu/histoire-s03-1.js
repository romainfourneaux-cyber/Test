// Source en clair du cours histoire-s03-1 « Cours 4 – Islam, origines et expansion ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s03-1.
// Seule source : le support de la séance 4, une page scannée dont seule la frise donne des faits
// (dates et villes). Les trois images commentées en classe ne sont pas dans le fichier : rien n'en est tiré.
const F = "cours/histoire/Histoire 5e - Seance 4 - Support.pdf";
const S = p => ({ fichier: F, page: p });
const S2 = p => ({ fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 4 – Islam, origines et expansion", titre, editeur: "Wikipédia", url });

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 560, A1 = 1300, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 36 540 178' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  // 929 : califat de Cordoue (au-dessus)
  s += "<line x1='" + x(929) + "' y1='62' x2='" + x(929) + "' y2='120' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(929) + "' y='56' text-anchor='middle' fill='" + encre + "'>929 : début du califat de Cordoue</text>";
  // Mohamed et dynastie abbasside au-dessus de l'axe
  s += "<rect x='" + x(570) + "' y='98' width='" + (x(632) - x(570)) + "' height='14' fill='#a8848c'/>";
  s += "<text x='" + x(570) + "' y='92' fill='" + encre + "'>Mohamed (Mahomet), 570-632</text>";
  s += "<rect x='" + x(750) + "' y='96' width='" + (x(1258) - x(750)) + "' height='18' fill='#3f8a5a'/>";
  s += "<text x='" + ((x(750) + x(1258)) / 2) + "' y='109' text-anchor='middle' font-size='10' fill='#fff'>Dynastie abbasside (Bagdad), 750-1258</text>";
  // axe et graduations
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 600; a <= 1300; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  // dynastie omeyyade sous l'axe
  s += "<rect x='" + x(661) + "' y='142' width='" + (x(750) - x(661)) + "' height='14' fill='#9cc58a'/>";
  s += "<text x='" + x(661) + "' y='172' fill='" + encre + "'>Dynastie omeyyade (Damas), 661-750</text>";
  // 622 : l'Hégire (en bas)
  s += "<line x1='" + x(622) + "' y1='120' x2='" + x(622) + "' y2='190' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(622) + "' cy='120' r='4' fill='#8e2f4f'/>";
  s += "<text x='" + (x(622) + 4) + "' y='202' fill='#8e2f4f'>622 : l'Hégire</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s03-1",
  fiches: [
    {
      id: "histoire-s03-1-f1", notion: "Mohamed et l'Hégire",
      titre: "Aux origines : Mohamed et l'Hégire (622)",
      texte: "La frise des origines de l'islam commence avec Mohamed, que l'on appelle aussi Mahomet. Il vit de 570 à 632. La frise met en valeur un événement de 622 : l'Hégire. Elle a donc lieu du vivant de Mohamed, dix ans avant sa mort.",
      pointsCles: ["Mohamed, aussi appelé Mahomet : de 570 à 632", "622 : l'Hégire, du vivant de Mohamed"],
      dates: [
        { annee: 570, evenement: "Naissance de Mohamed (Mahomet)" },
        { annee: 622, evenement: "L'Hégire" },
        { annee: 632, evenement: "Mort de Mohamed (Mahomet)" }
      ],
      lieux: [], personnages: ["Mohamed (Mahomet)"],
      vocabulaire: [],
      schema: "histoire-s03-1-s1", prerequis: [], source: S(1)
    },
    {
      id: "histoire-s03-1-f2", notion: "Les dynasties omeyyade et abbasside",
      titre: "Damas puis Bagdad : deux dynasties",
      texte: "Après Mohamed, deux dynasties se suivent. Sur la frise, la dynastie omeyyade est liée à la ville de Damas et va de 661 à 750. La dynastie abbasside, liée à Bagdad, prend la suite en 750 et dure jusqu'en 1258, soit plus de cinq siècles.",
      pointsCles: ["661-750 : dynastie omeyyade (Damas)", "750-1258 : dynastie abbasside (Bagdad)", "La seconde commence l'année où finit la première"],
      astuce: "D'abord Damas avec les Omeyyades, puis Bagdad avec les Abbassides : en 750, on passe de l'une à l'autre.",
      dates: [
        { annee: 661, evenement: "Début de la dynastie omeyyade (Damas)" },
        { annee: 750, evenement: "Début de la dynastie abbasside (Bagdad)" },
        { annee: 1258, evenement: "Fin de la dynastie abbasside" }
      ],
      lieux: ["Damas", "Bagdad"], personnages: [],
      vocabulaire: [],
      schema: "histoire-s03-1-s1", prerequis: ["histoire-s03-1-f1"], source: S(1)
    },
    {
      id: "histoire-s03-1-f3", notion: "Le califat de Cordoue (929)",
      titre: "929 : le califat de Cordoue",
      texte: "En 929 commence le califat de Cordoue. À ce moment, la dynastie abbasside, liée à Bagdad, existe toujours : elle dure jusqu'en 1258. Cordoue apparaissait déjà sur la carte de l'Empire carolingien : l'émirat de Cordoue y était voisin de la Marche espagnole, conquise par Charlemagne.",
      pointsCles: ["929 : début du califat de Cordoue", "En 929, la dynastie abbasside (Bagdad) existe encore", "Sur la carte du cours 2 : l'émirat de Cordoue, au sud-ouest de l'empire de Charlemagne"],
      dates: [
        { annee: 929, evenement: "Début du califat de Cordoue" }
      ],
      lieux: ["Cordoue", "Bagdad"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["histoire-s03-1-f2", "histoire-s01-2-f2"], source: S(1)
    }
  ],
  schemas: [
    { id: "histoire-s03-1-s1", legende: "Les origines de l'islam et les grandes dynasties, de 570 à 1258 (frise redessinée d'après le support).", svg: frise() }
  ],
  questions: [
    // f1 : Mohamed et l'Hégire
    { id: "histoire-s03-1-q1", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 1,
      enonce: "En quelle année a lieu l'Hégire ?",
      choix: ["622", "570", "632", "661"],
      reponse: "622",
      explication: "L'Hégire a lieu en 622. C'est pendant la vie de Mohamed, qui vit de 570 à 632.", source: S(1) },
    { id: "histoire-s03-1-q2", fiche: "histoire-s03-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "L'Hégire a lieu après la mort de Mohamed.",
      corrections: ["Faux : elle a lieu en 622, alors que Mohamed vit jusqu'en 632.", "Faux : elle a lieu en 570, l'année où commence la vie de Mohamed.", "Faux : elle a lieu en 661, au début de la dynastie omeyyade."],
      reponse: { vrai: false, correction: "Faux : elle a lieu en 622, alors que Mohamed vit jusqu'en 632." },
      explication: "Mohamed vit de 570 à 632. L'Hégire, en 622, se passe donc de son vivant.", source: S(1) },
    { id: "histoire-s03-1-q3", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi l'année 622 compte-t-elle autant dans l'histoire de l'islam ?",
      choix: ["C'est l'Hégire : Mohamed quitte La Mecque pour Médine", "C'est l'année de la fondation de Bagdad, la capitale des Abbassides", "C'est le début de la dynastie omeyyade, à Damas", "C'est l'année où l'armée du califat prend Jérusalem"],
      reponse: "C'est l'Hégire : Mohamed quitte La Mecque pour Médine",
      explication: "En 622, Mohamed et ses compagnons quittent La Mecque pour s'installer à Médine : c'est l'Hégire. Les musulmans comptent les années à partir de ce départ, qui ouvre leur calendrier.",
      source: T("Hégire", "https://fr.wikipedia.org/wiki/H%C3%A9gire") },
    { id: "histoire-s03-1-q4", fiche: "histoire-s03-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Mohamed, que l'on appelle aussi ___, vit de 570 à 632.",
      banque: ["Mahomet", "Justinien", "Clovis", "Constantin"],
      reponse: [["Mahomet"]],
      explication: "On écrit « Mohamed (Mahomet) ». Ce sont deux noms pour la même personne.", source: S(1) },
    { id: "histoire-s03-1-q16", fiche: "histoire-s03-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Mohamed, aussi appelé Mahomet, vit de 570 à 622.",
      corrections: ["Faux : il vit de 570 à 632 ; 622 est l'année de l'Hégire.", "Faux : il vit de 622 à 632.", "Faux : il vit de 661 à 750."],
      reponse: { vrai: false, correction: "Faux : il vit de 570 à 632 ; 622 est l'année de l'Hégire." },
      explication: "Mohamed vit de 570 à 632. L'année 622 est celle de l'Hégire, dix ans avant sa mort.", source: S(1) },
    { id: "histoire-s03-1-q17", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 3,
      enonce: "Pendant la vie de Mohamed (570-632), quel empire chrétien existe à l'est de la Méditerranée ?",
      choix: ["L'Empire byzantin", "L'Empire carolingien", "L'Empire romain d'Occident", "Aucun, ils n'existent pas encore"],
      reponse: "L'Empire byzantin",
      explication: "L'Empire byzantin existe de 395 à 1453, donc pendant toute la vie de Mohamed. L'Occident a disparu en 476 et l'Empire carolingien ne naît qu'en 800.", source: S2(1) },
    { id: "histoire-s03-1-q18", fiche: "histoire-s03-1-f1", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre du temps ces repères de la vie de Mohamed et de la suite.",
      elements: ["Mort de Mohamed", "L'Hégire", "Début de la dynastie omeyyade", "Naissance de Mohamed"],
      reponse: [3, 1, 0, 2],
      explication: "570 : naissance de Mohamed ; 622 : l'Hégire ; 632 : sa mort ; 661 : début de la dynastie omeyyade.", source: S(1) },
    // f2 : Omeyyades et Abbassides
    { id: "histoire-s03-1-q6", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "À quelle ville la dynastie abbasside est-elle liée ?",
      choix: ["Bagdad", "Damas", "Cordoue", "Constantinople"],
      reponse: "Bagdad",
      explication: "La dynastie abbasside est liée à Bagdad. La dynastie omeyyade, elle, est liée à Damas.", source: S(1) },
    { id: "histoire-s03-1-q7", fiche: "histoire-s03-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "La dynastie omeyyade de Damas va de 661 à 750.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la dynastie omeyyade de Damas va de 661 à 750. Elle précède la dynastie abbasside.", source: S(1) },
    { id: "histoire-s03-1-q8", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que la dynastie abbasside succède à la dynastie omeyyade de Damas ?",
      choix: ["Elle commence en 750, quand s'arrête la dynastie omeyyade de Damas", "Elle est liée à la même ville que la dynastie omeyyade, Damas", "Elle commence en 622, avec l'Hégire, avant les Omeyyades", "Elle commence en 1258, quand s'arrête la dynastie omeyyade de Damas"],
      reponse: "Elle commence en 750, quand s'arrête la dynastie omeyyade de Damas",
      explication: "La dynastie omeyyade de Damas s'arrête en 750. La dynastie abbasside commence justement cette année-là.", source: S(1) },
    { id: "histoire-s03-1-q9", fiche: "histoire-s03-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque repère à ses dates.",
      gauche: ["Dynastie omeyyade", "Dynastie abbasside", "Hégire", "Califat de Cordoue"],
      droite: ["622", "750-1258, à Bagdad", "Début en 929", "661-750, à Damas"],
      reponse: [[0, 3], [1, 1], [2, 0], [3, 2]],
      explication: "Hégire : 622 ; Omeyyades : 661-750, Damas ; Abbassides : 750-1258, Bagdad ; califat de Cordoue : 929.", source: S(1) },
    { id: "histoire-s03-1-q10", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 3,
      enonce: "De la dynastie omeyyade de Damas et de la dynastie abbasside, laquelle dure le plus longtemps ?",
      choix: ["La dynastie abbasside, plus de cinq siècles", "La dynastie omeyyade de Damas, plus de cinq siècles", "Elles durent exactement le même temps", "La dynastie omeyyade de Damas, plus de mille ans"],
      reponse: "La dynastie abbasside, plus de cinq siècles",
      explication: "La dynastie omeyyade de Damas dure 89 ans, de 661 à 750. La dynastie abbasside dure 508 ans, de 750 à 1258.", source: S(1) },
    { id: "histoire-s03-1-q19", fiche: "histoire-s03-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "La dynastie omeyyade est liée à Bagdad, et la dynastie abbasside à Damas.",
      corrections: ["Faux : c'est l'inverse, Damas pour les Omeyyades et Bagdad pour les Abbassides.", "Faux : les deux dynasties sont liées à Damas.", "Faux : les deux dynasties sont liées à Bagdad."],
      reponse: { vrai: false, correction: "Faux : c'est l'inverse, Damas pour les Omeyyades et Bagdad pour les Abbassides." },
      explication: "La dynastie omeyyade est liée à Damas, la dynastie abbasside à Bagdad. Retiens l'ordre : Damas d'abord, Bagdad ensuite.", source: S(1) },
    { id: "histoire-s03-1-q20", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "Les Omeyyades et les Abbassides sont des dynasties de califes. Qu'est-ce qu'un calife ?",
      choix: ["Le successeur de Mohamed, qui dirige les musulmans et gouverne l'empire", "Le gouverneur d'une seule province de l'empire, nommé par l'empereur byzantin", "Un grand marchand de Bagdad ou de Damas", "Le chef de l'armée byzantine"],
      reponse: "Le successeur de Mohamed, qui dirige les musulmans et gouverne l'empire",
      explication: "Le mot arabe « khalifa » veut dire « successeur ». Après la mort de Mohamed, le calife prend la tête de la communauté des musulmans et gouverne l'empire, depuis Damas puis depuis Bagdad.",
      source: T("Calife", "https://fr.wikipedia.org/wiki/Calife") },
    { id: "histoire-s03-1-q21", fiche: "histoire-s03-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles phrases sur les deux dynasties sont justes ? (plusieurs réponses)",
      choix: ["La dynastie omeyyade commence après la mort de Mohamed", "La dynastie abbasside dure jusqu'en 1258", "La dynastie abbasside est liée à Bagdad", "La dynastie omeyyade dure plus longtemps que la dynastie abbasside", "Les deux dynasties commencent en 661"],
      reponse: ["La dynastie omeyyade commence après la mort de Mohamed", "La dynastie abbasside dure jusqu'en 1258", "La dynastie abbasside est liée à Bagdad"],
      explication: "La dynastie omeyyade commence en 661, après 632, et la dynastie abbasside va de 750 à 1258, à Bagdad. Elle dure donc bien plus longtemps que la première.", source: S(1) },
    // f3 : califat de Cordoue
    { id: "histoire-s03-1-q11", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 1,
      enonce: "En quelle année commence le califat de Cordoue ?",
      choix: ["929", "622", "750", "1258"],
      reponse: "929",
      explication: "Le califat de Cordoue commence en 929. La dynastie abbasside existe alors encore.", source: S(1) },
    { id: "histoire-s03-1-q12", fiche: "histoire-s03-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le califat de Cordoue commence avant la dynastie omeyyade.",
      corrections: ["Faux : il commence en 929, bien après le début de la dynastie omeyyade en 661.", "Faux : il commence en 622, l'année de l'Hégire.", "Faux : il commence en 750, en même temps que la dynastie abbasside."],
      reponse: { vrai: false, correction: "Faux : il commence en 929, bien après le début de la dynastie omeyyade en 661." },
      explication: "La dynastie omeyyade commence en 661. Le califat de Cordoue ne commence qu'en 929.", source: S(1) },
    { id: "histoire-s03-1-q13", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 3,
      enonce: "Qu'est-ce qui change à Cordoue en 929 ?",
      choix: ["L'émir de Cordoue se proclame calife, sans plus dépendre de Bagdad", "Cordoue est conquise par Charlemagne et rattachée à la Marche espagnole", "Les Abbassides quittent Bagdad et installent leur capitale à Cordoue, en Al-Andalus", "Cordoue redevient une ville de l'Empire byzantin"],
      reponse: "L'émir de Cordoue se proclame calife, sans plus dépendre de Bagdad",
      explication: "Jusqu'en 929, Cordoue est un émirat : son chef, l'émir, reconnaît en principe le calife de Bagdad. En 929, Abd al-Rahman III se proclame calife à son tour, et Cordoue devient un califat indépendant.",
      source: T("Califat de Cordoue", "https://fr.wikipedia.org/wiki/Califat_de_Cordoue") },
    { id: "histoire-s03-1-q14", fiche: "histoire-s03-1-f3", type: "ordre", niveau: 2,
      enonce: "Range ces repères du plus ancien au plus récent.",
      elements: ["Début du califat de Cordoue", "L'Hégire", "Début de la dynastie abbasside", "Début de la dynastie omeyyade"],
      reponse: [1, 3, 2, 0],
      explication: "622 : Hégire ; 661 : Omeyyades ; 750 : Abbassides ; 929 : califat de Cordoue.", source: S(1) },
    { id: "histoire-s03-1-q15", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Au temps de Charlemagne, comment se présente Cordoue par rapport à son empire ?",
      choix: ["Comme un émirat voisin, au-delà de la Marche espagnole", "Comme une conquête de Charlemagne, au sud de la Marche espagnole", "Comme la capitale de l'Empire carolingien", "Comme une ville de l'Empire byzantin de Justinien"],
      reponse: "Comme un émirat voisin, au-delà de la Marche espagnole",
      explication: "Sur la carte de l'empire de Charlemagne, l'émirat de Cordoue est au sud-ouest, après la Marche espagnole. En 929, un califat y commence.", source: S2(1) },
    { id: "histoire-s03-1-q22", fiche: "histoire-s03-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le califat de Cordoue commence en 929, après la fin de la dynastie abbasside.",
      corrections: ["Faux : en 929, la dynastie abbasside existe encore ; elle dure jusqu'en 1258.", "Faux : le califat de Cordoue commence en 1258, à la fin de la dynastie abbasside.", "Faux : le califat de Cordoue commence en 750, avec la dynastie abbasside."],
      reponse: { vrai: false, correction: "Faux : en 929, la dynastie abbasside existe encore ; elle dure jusqu'en 1258." },
      explication: "La dynastie abbasside dure de 750 à 1258. En 929, elle est donc toujours là quand commence le califat de Cordoue.", source: S(1) },
    { id: "histoire-s03-1-q23", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "Dans quel pays actuel se trouve Cordoue, et comment appelait-on au Moyen Âge la partie de cette région dominée par les musulmans ?",
      choix: ["En Espagne ; Al-Andalus", "Au Maroc ; le Maghreb", "En Italie ; la Lombardie", "En Syrie ; le califat de Damas"],
      reponse: "En Espagne ; Al-Andalus",
      explication: "Cordoue est aujourd'hui une ville du sud de l'Espagne, en Andalousie. Au Moyen Âge, les terres de la péninsule Ibérique dominées par les musulmans s'appelaient Al-Andalus, et Cordoue en était la principale ville.",
      source: T("Al-Andalus", "https://fr.wikipedia.org/wiki/Al-Andalus") },
    { id: "histoire-s03-1-q24", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 3,
      enonce: "Au temps de Charlemagne, on parle de l'émirat de Cordoue, et non du califat de Cordoue. Pourquoi ?",
      choix: ["Le califat de Cordoue ne commence qu'en 929, après son règne", "Le califat de Cordoue a déjà pris fin avant son règne", "Cordoue fait alors partie des conquêtes de Charlemagne, au sud", "Le califat de Cordoue est lié à Bagdad, pas à Cordoue"],
      reponse: "Le califat de Cordoue ne commence qu'en 929, après son règne",
      explication: "Charlemagne règne de 768 à 814. Le califat de Cordoue ne commence qu'en 929, plus d'un siècle après.", source: S(1) },
    { id: "histoire-s03-1-q25", fiche: "histoire-s03-1-f3", type: "qcm_multiple", niveau: 3,
      enonce: "En 929, quand commence le califat de Cordoue, qu'est-ce qui existe encore ? (plusieurs réponses)",
      choix: ["La dynastie abbasside de Bagdad", "L'Empire byzantin", "L'Empire romain d'Occident", "Le règne de Charlemagne", "Le règne de Justinien"],
      reponse: ["La dynastie abbasside de Bagdad", "L'Empire byzantin"],
      explication: "La dynastie abbasside dure jusqu'en 1258 et l'Empire byzantin jusqu'en 1453. L'Occident est tombé en 476, et les règnes de Justinien et de Charlemagne sont finis depuis longtemps.", source: S(1) }
  ],
  bonus: [
    {
      id: "histoire-s03-1-b1",
      fiche: "histoire-s03-1-f3",
      titre: "Madinat Azahra, la ville brillante",
      texte: "Peu après la création du califat de Cordoue, on bâtit à huit kilomètres de cette ville une immense ville-palais, Madinat Azahra, la « ville brillante ». Les travaux commencent en 936, et le gouvernement siège dans ses murs. Ses ruines sont inscrites au patrimoine mondial de l'UNESCO depuis 2018.",
      source: { titre: "Madinat Azahra", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Madinat_Azahra" }
    }
  ],
  nonCouvert: [
    "Les trois images commentées en classe (un personnage avec des ailes, une écriture, une mosquée avec une tour) ne sont pas dans le fichier : seules les questions y figurent, sans réponse.",
    "Le sens des mots Hégire, calife, califat, émirat et dynastie : le cadre « Mots importants » est vide.",
    "La vie de Mohamed et les débuts de l'islam : seules les dates sont données.",
    "Les croyances et les pratiques de l'islam.",
    "L'expansion de l'islam (territoires, étapes, carte) : le titre l'annonce, le support ne la montre pas.",
    "Le rôle de Damas et de Bagdad : la frise les cite seulement entre parenthèses.",
    "La leçon à apprendre : le cadre est laissé vide dans le support."
  ]
};
