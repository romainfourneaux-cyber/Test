// Source en clair du cours histoire-s03-1 « Cours 4 – Islam, origines et expansion ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s03-1.
// Sources : le support de la séance 4, une page scannée dont seule la frise donne des faits (dates et villes), pour
// les fiches f2 et f3 ; le programme officiel de 5e (règle du 28/10/2026) pour les fiches f1, f4 et f5, dont les faits
// ont été vérifiés sur les pages citées. Les trois images commentées en classe ne sont pas dans le fichier : rien n'en
// est tiré. Règle sur la religion : faits politiques, territoriaux et de calendrier seulement.
const F = "cours/histoire/Histoire 5e - Seance 4 - Support.pdf";
const S = p => ({ fichier: F, page: p });
const S2 = p => ({ fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 4 – Islam, origines et expansion", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel et page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "De la naissance de l'islam à la prise de Bagdad par les Mongols : pouvoirs, sociétés, cultures", titre, editeur: "Wikipédia", url });
const U_HEGIRE = "https://fr.wikipedia.org/wiki/H%C3%A9gire";
const U_EXPANSION = "https://fr.wikipedia.org/wiki/Expansion_de_l%27islam";
const U_POITIERS = "https://fr.wikipedia.org/wiki/Bataille_de_Poitiers_(732)";
const U_YARMOUK = "https://fr.wikipedia.org/wiki/Bataille_du_Yarmouk";
const U_CALIFE = "https://fr.wikipedia.org/wiki/Calife";
const U_ABBASSIDE = "https://fr.wikipedia.org/wiki/Califat_abbasside";
const U_DAMAS = "https://fr.wikipedia.org/wiki/Grande_Mosqu%C3%A9e_des_Omeyyades";

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
      titre: "622, l'Hégire : de La Mecque à Médine",
      texte: "Mohamed (ou Mahomet, 570-632) vit à La Mecque, une ville de marchands d'Arabie. Ses adversaires le menacent : en 622, il part avec ses compagnons pour Yathrib, qui devient Médine. Ce départ, c'est l'Hégire. À Médine, il devient un chef politique. À sa mort, en 632, toute l'Arabie lui obéit. Les musulmans comptent les années depuis 622.",
      pointsCles: ["Mohamed (Mahomet) : 570-632, né à La Mecque, en Arabie", "622 : l'Hégire, le départ de La Mecque vers Yathrib, qui devient Médine", "À Médine, Mohamed devient le chef de la communauté", "632 : à sa mort, l'Arabie est unifiée sous son autorité", "Le calendrier musulman commence en 622 : son an 1 est l'année de l'Hégire"],
      astuce: "622, c'est le départ : l'an 1 du calendrier musulman. 632, dix ans plus tard, c'est la mort de Mohamed.",
      dates: [
        { annee: 570, evenement: "Naissance de Mohamed (Mahomet)" },
        { annee: 622, evenement: "L'Hégire : départ pour Médine" },
        { annee: 632, evenement: "Mort de Mohamed ; l'Arabie unifiée" }
      ],
      lieux: ["La Mecque", "Médine", "Arabie"], personnages: ["Mohamed (Mahomet)"],
      vocabulaire: [
        { mot: "Hégire", def: "le départ de Mohamed de La Mecque pour Médine, en 622 ; le mot arabe veut dire « émigration »" },
        { mot: "Médine", def: "la ville d'Arabie, d'abord appelée Yathrib, où Mohamed s'installe en 622" }
      ],
      schema: "histoire-s03-1-s1", prerequis: [], source: P("Hégire", U_HEGIRE)
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
    },
    {
      id: "histoire-s03-1-f4", notion: "Les conquêtes du califat",
      titre: "Les conquêtes : de l'Indus à l'Espagne en un siècle",
      texte: "En un siècle, les armées du califat bâtissent un empire immense. Syrie et Palestine d'abord : Jérusalem tombe en 637 ou 638. Puis l'Égypte (639-642), la Perse (651), l'Afrique du Nord (Carthage, 698), l'Espagne (711), l'Indus. Deux arrêts : Constantinople, qui résiste en 717-718, et la Gaule, où Charles Martel stoppe une expédition près de Poitiers, en 732.",
      pointsCles: ["Syrie et Palestine : victoire du Yarmouk sur les Byzantins (636), Jérusalem (637-638)", "Égypte (639-642) ; Perse : l'empire sassanide s'effondre en 651", "Afrique du Nord : Kairouan fondée en 670, Carthage prise en 698 ; Espagne : en 711, Tariq franchit le détroit de Gibraltar", "Limites : échec devant Constantinople (717-718) ; expédition stoppée entre Tours et Poitiers par Charles Martel (732)", "Pourquoi si vite : Byzantins et Perses épuisés par leur guerre (602-628), armées arabes mobiles ; les peuples soumis gardent leur religion contre un impôt"],
      astuce: "Un siècle, de 632 à 732 : de Médine jusqu'à l'Indus d'un côté, jusqu'aux Pyrénées de l'autre.",
      dates: [
        { annee: 636, evenement: "Bataille du Yarmouk : la Syrie passe au califat" },
        { annee: 651, evenement: "Fin de l'empire perse sassanide" },
        { annee: 698, evenement: "Prise de Carthage" },
        { annee: 711, evenement: "Entrée en Espagne" },
        { annee: 718, evenement: "Échec devant Constantinople" },
        { annee: 732, evenement: "Charles Martel arrête une expédition près de Poitiers" }
      ],
      lieux: ["Jérusalem", "Égypte", "Carthage", "Espagne", "Constantinople", "Poitiers"], personnages: ["Charles Martel", "Eudes d'Aquitaine", "Tariq ibn Ziyad"],
      vocabulaire: [
        { mot: "califat", def: "l'empire gouverné par le calife" },
        { mot: "expédition", def: "une armée envoyée au loin pour combattre ou piller" },
        { mot: "Charles Martel", def: "le chef des Francs, grand-père de Charlemagne, vainqueur près de Poitiers en 732" }
      ],
      schema: null, prerequis: ["histoire-s03-1-f1", "histoire-s03-1-f2"], source: P("Expansion de l'islam", U_EXPANSION)
    },
    {
      id: "histoire-s03-1-f5", notion: "Le calife, successeur et chef",
      titre: "Le calife : successeur de Mohamed, chef de l'empire",
      texte: "Calife vient de l'arabe khalifa, « successeur ». Après la mort de Mohamed, en 632, le calife dirige la communauté des musulmans : il commande l'armée et gouverne l'empire. Quatre premiers califes se succèdent de 632 à 661. Puis le titre devient héréditaire : les Omeyyades règnent à Damas (661-750), les Abbassides à Bagdad (750-1258).",
      pointsCles: ["Calife : « successeur » de Mohamed ; il dirige la communauté des musulmans et porte le titre de « commandeur des croyants »", "632-661 : les quatre premiers califes, Abou Bakr, Omar, Othman, Ali", "661-750 : les Omeyyades, à Damas ; 750-1258 : les Abbassides, à Bagdad", "Au Xe siècle, trois califes rivaux : Bagdad, Cordoue (depuis 929) et les Fatimides (depuis 909)"],
      astuce: "Calife = successeur. Basileus à Constantinople, empereur à Aix, calife à Damas puis Bagdad : trois chefs pour trois empires.",
      dates: [
        { annee: 632, evenement: "Premier calife après la mort de Mohamed" },
        { annee: 661, evenement: "Les Omeyyades : le califat devient héréditaire" },
        { annee: 909, evenement: "Les Fatimides fondent un califat rival" }
      ],
      lieux: ["Damas", "Bagdad", "Cordoue"], personnages: ["Abou Bakr", "Omar", "Othman", "Ali"],
      vocabulaire: [
        { mot: "calife", def: "le successeur de Mohamed, qui dirige les musulmans et gouverne l'empire" },
        { mot: "dynastie", def: "une famille qui garde le pouvoir de père en fils" },
        { mot: "héréditaire", def: "qui passe du père au fils" }
      ],
      schema: null, prerequis: ["histoire-s03-1-f1", "histoire-s03-1-f2"], source: P("Calife", U_CALIFE)
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
      source: T("Hégire", U_HEGIRE) },
    { id: "histoire-s03-1-q4", fiche: "histoire-s03-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Mohamed, que l'on appelle aussi ___, vit de 570 à 632.",
      banque: ["Mahomet", "Hégire", "Omeyyade", "Abbasside"],
      reponse: [["Mahomet"]],
      explication: "On écrit « Mohamed (Mahomet) ». Ce sont deux noms pour la même personne.", source: S(1) },
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
    { id: "histoire-s03-1-q26", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi Mohamed quitte-t-il La Mecque en 622 ?",
      choix: ["Les marchands de la ville s'opposent à lui et le menacent", "La Mecque est prise et détruite par une armée venue de l'Empire byzantin", "Il part fonder la ville de Bagdad", "Il veut créer le califat de Cordoue"],
      reponse: "Les marchands de la ville s'opposent à lui et le menacent",
      explication: "Les grandes familles de marchands de La Mecque lui sont hostiles et font pression sur ses compagnons. Les habitants de Yathrib, la future Médine, acceptent de l'accueillir.",
      source: T("Hégire", U_HEGIRE) },
    { id: "histoire-s03-1-q27", fiche: "histoire-s03-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La ville de Médine s'appelait Yathrib avant l'arrivée de Mohamed.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Mohamed s'installe en 622 à Yathrib, qui prend ensuite le nom de Médine. C'est là qu'il devient le chef de la communauté.",
      source: T("Hégire", U_HEGIRE) },
    { id: "histoire-s03-1-q28", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 3,
      enonce: "Que se passe-t-il en Arabie à la mort de Mohamed, en 632 ?",
      choix: ["L'Arabie est unifiée sous son autorité ; un calife lui succède", "L'Arabie redevient aussitôt un ensemble de tribus sans chef, pour trois siècles", "L'Arabie est conquise par l'Empire byzantin", "L'Arabie passe sous l'autorité de l'empereur perse"],
      reponse: "L'Arabie est unifiée sous son autorité ; un calife lui succède",
      explication: "À sa mort, en 632, Mohamed a rassemblé toute la péninsule d'Arabie sous son autorité. Ses successeurs, les califes, lancent alors les conquêtes hors d'Arabie.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q29", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment les musulmans comptent-ils les années ?",
      choix: ["À partir de l'Hégire, en 622", "À partir de la naissance de Mohamed, en 570", "À partir de la fondation de Bagdad, en 762", "À partir de la mort de Mohamed, en 632"],
      reponse: "À partir de l'Hégire, en 622",
      explication: "L'an 1 du calendrier musulman commence avec l'année de l'Hégire, en 622 : c'est le calife Omar qui a fixé ce point de départ. On parle donc de calendrier hégirien.",
      source: T("Hégire", U_HEGIRE) },
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
      explication: "Le mot arabe « khalifa » veut dire « successeur ». Après la mort de Mohamed, le calife dirige la communauté des musulmans et gouverne l'empire : les Omeyyades le font depuis Damas, puis les Abbassides depuis Bagdad.",
      source: T("Calife", U_CALIFE) },
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
      explication: "Depuis 756, Cordoue est un émirat indépendant, mais son émir reconnaît encore, pour la religion, l'autorité du calife de Bagdad. En 929, l'émir Abd al-Rahman III se proclame calife à son tour : Cordoue ne dépend plus de Bagdad en rien.",
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
      explication: "La dynastie abbasside dure jusqu'en 1258 et l'Empire byzantin jusqu'en 1453. L'Occident est tombé en 476, et les règnes de Justinien et de Charlemagne sont finis depuis longtemps.", source: S(1) },
    // f4 : les conquêtes
    { id: "histoire-s03-1-q30", fiche: "histoire-s03-1-f4", type: "qcm", niveau: 1,
      enonce: "Jusqu'où s'étend l'empire des califes au VIIIe siècle ?",
      choix: ["De l'Espagne à l'Indus", "De la Gaule à la Chine", "Seulement en Arabie", "De Rome à Constantinople"],
      reponse: "De l'Espagne à l'Indus",
      explication: "En un siècle, les armées du califat vont de l'Espagne, à l'ouest, jusqu'au fleuve Indus, à l'est. La Gaule et Constantinople, elles, résistent.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q31", fiche: "histoire-s03-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "En 711, une armée venue d'Afrique du Nord franchit le détroit de Gibraltar et entre en Espagne.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en 711, Tariq ibn Ziyad franchit le détroit avec son armée. L'Espagne devient Al-Andalus.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q32", fiche: "histoire-s03-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi les conquêtes du califat sont-elles si rapides au VIIe siècle ?",
      choix: ["Byzantins et Perses sont épuisés par leur guerre ; les armées arabes sont rapides", "Les armées du califat sont dix fois plus nombreuses que toutes celles de leurs adversaires réunis", "Les Byzantins et les Perses se rendent sans combattre", "Les Francs de Charles Martel aident les armées du califat"],
      reponse: "Byzantins et Perses sont épuisés par leur guerre ; les armées arabes sont rapides",
      explication: "L'Empire byzantin et l'Empire perse viennent de se faire la guerre pendant un quart de siècle (602-628). Face à eux, une cavalerie légère et mobile, et des provinces mal attachées à leurs maîtres.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q33", fiche: "histoire-s03-1-f4", type: "qcm", niveau: 2,
      enonce: "Que se passe-t-il près de Poitiers en 732 ?",
      choix: ["Charles Martel et Eudes d'Aquitaine stoppent une expédition venue d'Espagne", "Les Francs de Charles Martel traversent les Pyrénées et s'emparent de Cordoue", "Charlemagne est couronné empereur d'Occident", "L'armée byzantine bat les Francs"],
      reponse: "Charles Martel et Eudes d'Aquitaine stoppent une expédition venue d'Espagne",
      explication: "Une expédition partie d'Al-Andalus pille la région de Bordeaux et remonte vers Tours. Entre Poitiers et Tours, en octobre 732 ou 733, les Francs de Charles Martel et les Aquitains d'Eudes l'arrêtent ; son chef, Abd al-Rahman, est tué.",
      source: T("Bataille de Poitiers (732)", U_POITIERS) },
    { id: "histoire-s03-1-q34", fiche: "histoire-s03-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "L'armée du califat prend Constantinople en 718.",
      corrections: ["Faux : le siège de 717-718 échoue ; Constantinople résiste jusqu'en 1453.", "Faux : elle la prend en 732, après la bataille de Poitiers.", "Faux : elle ne s'approche jamais de Constantinople."],
      reponse: { vrai: false, correction: "Faux : le siège de 717-718 échoue ; Constantinople résiste jusqu'en 1453." },
      explication: "Les armées du califat assiègent deux fois Constantinople, vers 677 puis en 717-718, sans réussir. La ville ne tombe qu'en 1453, devant les Ottomans.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q35", fiche: "histoire-s03-1-f4", type: "ordre", niveau: 2,
      enonce: "Range ces conquêtes et batailles du plus ancien au plus récent.",
      elements: ["Prise de Carthage", "Jérusalem passe sous l'autorité du califat", "Entrée en Espagne", "Bataille près de Poitiers"],
      reponse: [1, 0, 2, 3],
      explication: "Jérusalem en 637 ou 638 ; Carthage en 698 ; l'Espagne en 711 ; Poitiers en 732.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q36", fiche: "histoire-s03-1-f4", type: "qcm", niveau: 3,
      enonce: "Les historiens discutent de la portée de la bataille de 732. Que disent-ils ?",
      choix: ["Pour les uns, un raid de pillage stoppé ; pour d'autres, la fin de l'expansion vers le nord", "Tous s'accordent : elle a sauvé l'Europe entière, et son lieu exact est connu avec certitude", "Tous pensent qu'elle n'a jamais eu lieu", "Ils connaissent le nombre exact de soldats de chaque camp"],
      reponse: "Pour les uns, un raid de pillage stoppé ; pour d'autres, la fin de l'expansion vers le nord",
      explication: "On ne connaît ni le lieu exact, ni les effectifs, ni même l'année sûre (732 ou 733). Les raids continuent après, et c'est seulement en 759 que Pépin le Bref reprend Narbonne.",
      source: T("Bataille de Poitiers (732)", U_POITIERS) },
    { id: "histoire-s03-1-q37", fiche: "histoire-s03-1-f4", type: "association", niveau: 3,
      enonce: "Relie chaque bataille ou étape à ce qu'elle a changé.",
      gauche: ["Yarmouk, 636", "Carthage, 698", "Gibraltar, 711", "Poitiers, 732"],
      droite: ["Victoire sur l'armée byzantine : la Syrie passe au califat", "L'Afrique du Nord est conquise", "L'entrée en Espagne", "Une expédition stoppée par Charles Martel"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Au Yarmouk, en août 636, l'armée byzantine perd la Syrie. Carthage tombe en 698, l'Espagne est envahie en 711, et l'expédition de 732 est arrêtée près de Poitiers.",
      source: T("Bataille du Yarmouk", U_YARMOUK) },
    { id: "histoire-s03-1-q38", fiche: "histoire-s03-1-f4", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En 732, ___ Martel arrête une expédition venue d'Espagne près de ___.",
      banque: ["Charles", "Poitiers", "Pépin", "Paris"],
      reponse: [["Charles"], ["Poitiers"]],
      explication: "Charles Martel, le grand-père de Charlemagne, arrête l'expédition entre Tours et Poitiers. Pépin le Bref est son fils.",
      source: T("Bataille de Poitiers (732)", U_POITIERS) },
    // f5 : le calife
    { id: "histoire-s03-1-q39", fiche: "histoire-s03-1-f5", type: "qcm", niveau: 1,
      enonce: "Que veut dire le mot « calife » ?",
      choix: ["Successeur", "Roi", "Empereur", "Marchand"],
      reponse: "Successeur",
      explication: "Calife vient de l'arabe khalifa, « successeur ». Le calife succède à Mohamed à la tête de la communauté des musulmans.",
      source: T("Calife", U_CALIFE) },
    { id: "histoire-s03-1-q40", fiche: "histoire-s03-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le calife dirige la communauté des musulmans après la mort de Mohamed.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : à partir de 632, le calife dirige la communauté et gouverne l'empire. Il porte le titre de « commandeur des croyants ».",
      source: T("Calife", U_CALIFE) },
    { id: "histoire-s03-1-q41", fiche: "histoire-s03-1-f5", type: "qcm", niveau: 2,
      enonce: "Combien de califes se succèdent de 632 à 661, avant les Omeyyades ?",
      choix: ["Quatre", "Deux", "Dix", "Un seul"],
      reponse: "Quatre",
      explication: "Abou Bakr, Omar, Othman et Ali se succèdent de 632 à 661. On les appelle les quatre premiers califes, ou califes « bien guidés ».",
      source: T("Calife", U_CALIFE) },
    { id: "histoire-s03-1-q42", fiche: "histoire-s03-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que le pouvoir des califes devient héréditaire à partir de 661 ?",
      choix: ["Les Omeyyades, puis les Abbassides, se transmettent le titre de père en fils", "Le calife est désormais élu par l'assemblée de tous les musulmans de l'empire", "Le calife est nommé par l'empereur byzantin", "Le titre est tiré au sort chaque année"],
      reponse: "Les Omeyyades, puis les Abbassides, se transmettent le titre de père en fils",
      explication: "En 661, Muawiya fonde la dynastie omeyyade : le titre se transmet dans sa famille. Les Abbassides font de même à partir de 750.",
      source: T("Expansion de l'islam", U_EXPANSION) },
    { id: "histoire-s03-1-q43", fiche: "histoire-s03-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Au Xe siècle, il n'y a qu'un seul calife dans tout le monde musulman, à Bagdad.",
      corrections: ["Faux : trois califes rivaux existent, à Bagdad, à Cordoue (depuis 929) et chez les Fatimides (depuis 909).", "Faux : il n'y a plus aucun calife au Xe siècle.", "Faux : le seul calife est à Cordoue, car Bagdad a été détruite."],
      reponse: { vrai: false, correction: "Faux : trois califes rivaux existent, à Bagdad, à Cordoue (depuis 929) et chez les Fatimides (depuis 909)." },
      explication: "Les Fatimides fondent un califat rival en 909, et l'émir de Cordoue se proclame calife en 929. Au Xe siècle, trois califes se disputent donc le titre.",
      source: T("Calife", U_CALIFE) },
    { id: "histoire-s03-1-q44", fiche: "histoire-s03-1-f5", type: "association", niveau: 2,
      enonce: "Relie chaque mot à ce qu'il désigne.",
      gauche: ["Calife", "Omeyyades", "Abbassides", "Hégire"],
      droite: ["Successeur de Mohamed, chef des musulmans", "Dynastie de Damas (661-750)", "Dynastie de Bagdad (750-1258)", "Le départ pour Médine, en 622"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Le calife succède à Mohamed. Les Omeyyades règnent à Damas, puis les Abbassides à Bagdad ; l'Hégire, en 622, ouvre le calendrier musulman.",
      source: T("Calife", U_CALIFE) },
    { id: "histoire-s03-1-q46", fiche: "histoire-s03-1-f5", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Le ___ est le successeur de Mohamed ; il porte le titre de « commandeur des ___ ».",
      banque: ["calife", "croyants", "basileus", "Francs"],
      reponse: [["calife"], ["croyants"]],
      explication: "Le calife succède à Mohamed et porte le titre de commandeur des croyants. Le basileus, lui, est l'empereur byzantin.",
      source: T("Calife", U_CALIFE) }
  ],
  bonus: [
    {
      id: "histoire-s03-1-b1",
      fiche: "histoire-s03-1-f3",
      titre: "Madinat Azahra, la ville brillante",
      texte: "Peu après la création du califat de Cordoue, on bâtit à huit kilomètres de cette ville une immense ville-palais, Madinat Azahra, la « ville brillante ». Les travaux commencent en 936, et le gouvernement siège dans ses murs. Ses ruines sont inscrites au patrimoine mondial de l'UNESCO depuis 2018.",
      source: { titre: "Madinat Azahra", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Madinat_Azahra" }
    },
    {
      id: "histoire-s03-1-b2",
      fiche: "histoire-s03-1-f2",
      titre: "Damas : la Grande Mosquée des Omeyyades",
      texte: "Entre 706 et 715, le calife omeyyade al-Walid fait bâtir à Damas, sa capitale, une immense mosquée de plus de 150 mètres de long, le plus grand bâtiment du monde musulman de l'époque. Ses murs étaient couverts de mosaïques de verre sur fond d'or, à la manière byzantine ; un panneau de près de 35 mètres de long montre les rives de la rivière Barada. La vieille ville de Damas est inscrite au patrimoine mondial depuis 1979.",
      source: { titre: "Grande Mosquée des Omeyyades", editeur: "Wikipédia, l'encyclopédie libre", url: U_DAMAS }
    }
  ],
  nonCouvert: [
    "Les trois images commentées en classe (un personnage avec des ailes, une écriture, une mosquée avec une tour) ne sont pas dans le fichier : seules les questions y figurent, sans réponse.",
    "Les croyances et les pratiques de l'islam : hors jeu (règle sur la religion) ; le cours s'en tient aux faits politiques, territoriaux et de calendrier.",
    "L'organisation de l'empire omeyyade (administration, monnaie, arabisation) : une ligne seulement.",
    "La vie des peuples conquis et le statut des non-musulmans : un point clé seulement.",
    "Les villes et le commerce du monde musulman avant Bagdad (Damas, Kairouan, Le Caire).",
    "La leçon à apprendre : le cadre est laissé vide dans le support."
  ]
};
