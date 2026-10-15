// Source en clair du cours histoire-s03-1 « Cours 4 – Islam, origines et expansion ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s03-1.
// Seule source : le support de la séance 4, une page scannée dont seule la frise donne des faits
// (dates et villes). Les trois images commentées en classe ne sont pas dans le fichier : rien n'en est tiré.
const F = "cours/histoire/Histoire 5e - Seance 4 - Support.pdf";
const S = p => ({ fichier: F, page: p });
const S2 = p => ({ fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: p });

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
      enonce: "En quelle année a lieu l'Hégire, d'après la frise ?",
      choix: ["622", "570", "632", "750"],
      reponse: "622",
      explication: "La frise place l'Hégire en 622. C'est pendant la vie de Mohamed.", source: S(1) },
    { id: "histoire-s03-1-q2", fiche: "histoire-s03-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "L'Hégire a lieu après la mort de Mohamed.",
      corrections: ["Faux : elle a lieu en 622, alors que Mohamed vit jusqu'en 632.", "Faux : elle a lieu en 570.", "Faux : elle a lieu en 750."],
      reponse: { vrai: false, correction: "Faux : elle a lieu en 622, alors que Mohamed vit jusqu'en 632." },
      explication: "Mohamed vit de 570 à 632. L'Hégire, en 622, se passe donc de son vivant.", source: S(1) },
    { id: "histoire-s03-1-q3", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment la frise montre-t-elle que l'Hégire a lieu du vivant de Mohamed ?",
      choix: ["L'année 622 se situe entre 570 et 632", "L'année 622 vient après 632", "L'Hégire et la dynastie omeyyade commencent la même année", "L'année 622 se situe après 750"],
      reponse: "L'année 622 se situe entre 570 et 632",
      explication: "Mohamed vit de 570 à 632. L'année 622 se trouve entre ces deux dates.", source: S(1) },
    { id: "histoire-s03-1-q4", fiche: "histoire-s03-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Mohamed, que l'on appelle aussi ___, vit de 570 à 632.",
      banque: ["Mahomet", "Justinien", "Clovis", "Constantin"],
      reponse: [["Mahomet"]],
      explication: "La frise écrit « Mohamed (Mahomet) ». Ce sont deux noms pour la même personne.", source: S(1) },
    { id: "histoire-s03-1-q5", fiche: "histoire-s03-1-f1", type: "qcm", niveau: 3,
      enonce: "D'après la frise, combien d'années séparent l'Hégire de la mort de Mohamed ?",
      choix: ["10 ans", "52 ans", "62 ans", "128 ans"],
      reponse: "10 ans",
      explication: "632 moins 622 font 10. L'Hégire a lieu dix ans avant la mort de Mohamed.", indice: "Fais la soustraction 632 moins 622.", source: S(1) },
    // f2 : Omeyyades et Abbassides
    { id: "histoire-s03-1-q6", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 1,
      enonce: "D'après la frise, à quelle ville la dynastie abbasside est-elle liée ?",
      choix: ["Bagdad", "Damas", "Cordoue", "Constantinople"],
      reponse: "Bagdad",
      explication: "La frise associe la dynastie abbasside à Bagdad. La dynastie omeyyade, elle, est liée à Damas.", source: S(1) },
    { id: "histoire-s03-1-q7", fiche: "histoire-s03-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Sur la frise, la dynastie omeyyade est liée à Damas et va de 661 à 750.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est ce qu'indique la frise. Elle précède la dynastie abbasside.", source: S(1) },
    { id: "histoire-s03-1-q8", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que la dynastie abbasside succède à la dynastie omeyyade ?",
      choix: ["La dynastie abbasside commence en 750, l'année où finit la dynastie omeyyade", "Elles sont liées à la même ville, Damas", "La dynastie abbasside commence en 622", "La dynastie omeyyade dure jusqu'en 1258"],
      reponse: "La dynastie abbasside commence en 750, l'année où finit la dynastie omeyyade",
      explication: "La dynastie omeyyade s'arrête en 750. La dynastie abbasside commence justement cette année-là.", source: S(1) },
    { id: "histoire-s03-1-q9", fiche: "histoire-s03-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque repère de la frise à ses dates.",
      gauche: ["Dynastie omeyyade", "Dynastie abbasside", "Hégire", "Califat de Cordoue"],
      droite: ["622", "750-1258, à Bagdad", "Début en 929", "661-750, à Damas"],
      reponse: [[0, 3], [1, 1], [2, 0], [3, 2]],
      explication: "Hégire : 622 ; Omeyyades : 661-750, Damas ; Abbassides : 750-1258, Bagdad ; califat de Cordoue : 929.", source: S(1) },
    { id: "histoire-s03-1-q10", fiche: "histoire-s03-1-f2", type: "qcm", niveau: 3,
      enonce: "D'après la frise, laquelle des deux dynasties dure le plus longtemps ?",
      choix: ["La dynastie abbasside, plus de cinq siècles", "La dynastie omeyyade, plus de cinq siècles", "Elles durent exactement le même temps", "La dynastie omeyyade, plus de mille ans"],
      reponse: "La dynastie abbasside, plus de cinq siècles",
      explication: "La dynastie omeyyade dure 89 ans, de 661 à 750. La dynastie abbasside dure 508 ans, de 750 à 1258.", source: S(1) },
    // f3 : califat de Cordoue
    { id: "histoire-s03-1-q11", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 1,
      enonce: "En quelle année commence le califat de Cordoue ?",
      choix: ["929", "622", "750", "1258"],
      reponse: "929",
      explication: "La frise place le début du califat de Cordoue en 929. La dynastie abbasside existe alors encore.", source: S(1) },
    { id: "histoire-s03-1-q12", fiche: "histoire-s03-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Le califat de Cordoue commence avant la dynastie omeyyade.",
      corrections: ["Faux : il commence en 929, bien après le début de la dynastie omeyyade en 661.", "Faux : il commence en 622, avec l'Hégire.", "Faux : il commence en 1258."],
      reponse: { vrai: false, correction: "Faux : il commence en 929, bien après le début de la dynastie omeyyade en 661." },
      explication: "La dynastie omeyyade commence en 661. Le califat de Cordoue ne commence qu'en 929.", source: S(1) },
    { id: "histoire-s03-1-q13", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 2,
      enonce: "En 929, quand commence le califat de Cordoue, quelle dynastie la frise place-t-elle à Bagdad ?",
      choix: ["La dynastie abbasside", "La dynastie omeyyade", "Aucune dynastie", "Les deux dynasties à la fois"],
      reponse: "La dynastie abbasside",
      explication: "La frise place la dynastie abbasside à Bagdad, de 750 à 1258. L'année 929 se trouve dans cette période.", source: S(1) },
    { id: "histoire-s03-1-q14", fiche: "histoire-s03-1-f3", type: "ordre", niveau: 2,
      enonce: "Range ces repères du plus ancien au plus récent.",
      elements: ["Début du califat de Cordoue", "L'Hégire", "Début de la dynastie abbasside", "Début de la dynastie omeyyade"],
      reponse: [1, 3, 2, 0],
      explication: "622 : Hégire ; 661 : Omeyyades ; 750 : Abbassides ; 929 : califat de Cordoue.", source: S(1) },
    { id: "histoire-s03-1-q15", fiche: "histoire-s03-1-f3", type: "qcm", niveau: 3,
      enonce: "Comment relier le califat de Cordoue à la carte de l'Empire carolingien du cours 2 ?",
      choix: ["Cordoue y figure déjà, comme émirat voisin de la Marche espagnole", "Cordoue y figure comme une conquête de Charlemagne", "Cordoue y figure comme la capitale de Charlemagne", "Cordoue n'y figure pas du tout"],
      reponse: "Cordoue y figure déjà, comme émirat voisin de la Marche espagnole",
      explication: "Sur la carte du cours 2, l'émirat de Cordoue est au sud-ouest, après la Marche espagnole. En 929, un califat y commence.", source: S2(1) }
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
