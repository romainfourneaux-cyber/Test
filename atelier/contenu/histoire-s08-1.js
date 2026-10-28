// Source en clair du cours histoire-s08-1 « Cours 10 – Émergence d'un État royal fort ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s08-1.
// Seule source : le support de la séance 10 (une page) : la même frise de 900 à 1500 que la séance 9 (Hugues
// Capet élu roi 987, Philippe Auguste 1180-1223, bataille de Bouvines 1214, Louis IX 1226-1270, Philippe le Bel
// 1285-1314, guerre de Cent Ans 1337-1453, Jeanne d'Arc 1428) et trois questions : les principaux fiefs sur une
// carte (« le domaine royal est autour de Paris »), le roi sur une représentation de la bataille de Bouvines, le
// pouvoir de Louis IX. Carte et images sont absentes du fichier. La leçon est donnée en vidéo : voir nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 10 - Support.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 10 – Émergence d’un État royal fort", titre, editeur: "Wikipédia", url });

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 900, A1 = 1500, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 540 214' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<line x1='" + x(987) + "' y1='24' x2='" + x(987) + "' y2='120' stroke='#6a4c9c' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(987) + "' cy='120' r='4' fill='#6a4c9c'/>";
  s += "<text x='" + (x(987) + 4) + "' y='20' fill='#6a4c9c'>987 : Hugues Capet élu roi</text>";
  s += "<line x1='" + x(1214) + "' y1='48' x2='" + x(1214) + "' y2='120' stroke='#b23a3a' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(1214) + "' cy='120' r='4' fill='#b23a3a'/>";
  s += "<text x='" + (x(1214) - 4) + "' y='44' text-anchor='end' fill='#b23a3a'>1214 : bataille de Bouvines</text>";
  s += "<line x1='" + x(1428) + "' y1='48' x2='" + x(1428) + "' y2='96' stroke='#2f5e8e' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(1428) + "' y='44' text-anchor='middle' fill='#2f5e8e'>1428 : Jeanne d'Arc</text>";
  s += "<rect x='" + x(1337) + "' y='96' width='" + (x(1453) - x(1337)) + "' height='18' fill='#d46a5c'/>";
  s += "<text x='" + ((x(1337) + x(1453)) / 2) + "' y='82' text-anchor='middle' font-size='10' fill='" + encre + "'>Guerre de Cent Ans : 1337-1453</text>";
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 900; a <= 1500; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  s += "<rect x='" + x(1180) + "' y='144' width='" + (x(1223) - x(1180)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(1223) + "' y='170' text-anchor='end' fill='" + encre + "'>Philippe Auguste 1180-1223</text>";
  s += "<rect x='" + x(1226) + "' y='144' width='" + (x(1270) - x(1226)) + "' height='10' fill='#3f8a5a'/>";
  s += "<line x1='" + ((x(1226) + x(1270)) / 2) + "' y1='154' x2='" + ((x(1226) + x(1270)) / 2) + "' y2='180' stroke='" + encre + "'/>";
  s += "<text x='" + ((x(1226) + x(1270)) / 2) + "' y='192' text-anchor='middle' fill='" + encre + "'>Louis IX 1226-1270</text>";
  s += "<rect x='" + x(1285) + "' y='144' width='" + (x(1314) - x(1285)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(1285) + "' y='170' fill='" + encre + "'>Philippe le Bel 1285-1314</text>";
  s += "<rect x='30' y='200' width='12' height='10' fill='#2f5e8e'/><text x='48' y='209' fill='" + encre + "'>règne d'un roi</text>";
  s += "<rect x='150' y='200' width='12' height='10' fill='#d46a5c'/><text x='168' y='209' fill='" + encre + "'>guerre</text>";
  s += "<circle cx='236' cy='205' r='4' fill='#b23a3a'/><text x='246' y='209' fill='" + encre + "'>événement daté</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s08-1",
  fiches: [
    {
      id: "histoire-s08-1-f1", notion: "Le domaine royal, autour de Paris, et les principaux fiefs",
      titre: "Le domaine royal est autour de Paris",
      texte: "La séance « L'émergence d'un État royal » fait repérer sur une carte où se trouvent les principaux fiefs du royaume. Elle donne un exemple : le domaine royal est autour de Paris. Le mot « royal » dit que ce domaine est celui du roi lui-même. La séance précédente, elle, faisait noter de grands duchés et de grands comtés.",
      pointsCles: ["Le domaine royal, le domaine du roi : autour de Paris", "Les principaux fiefs se repèrent sur une carte du royaume", "Rappel de la séance 9 : de grands duchés et de grands comtés"],
      dates: [],
      lieux: ["Paris"], personnages: [],
      vocabulaire: [
        { mot: "domaine royal", def: "le domaine du roi lui-même, situé autour de Paris" }
      ],
      schema: null, prerequis: ["histoire-s07-2-f3"], source: S(1)
    },
    {
      id: "histoire-s08-1-f2", notion: "Philippe Auguste (1180-1223) et la bataille de Bouvines (1214)",
      titre: "Philippe Auguste, le roi de Bouvines",
      texte: "Philippe Auguste règne de 1180 à 1223. Pendant son règne a lieu la bataille de Bouvines, en 1214. La séance en étudie une représentation sur laquelle il faut situer le roi : le roi est donc présent sur l'image de la bataille. Bouvines est le seul combat daté sur la frise avant la guerre de Cent Ans.",
      pointsCles: ["1180-1223 : règne de Philippe Auguste", "1214 : bataille de Bouvines, pendant ce règne", "Sur la représentation de la bataille, on repère le roi"],
      dates: [
        { annee: 1180, evenement: "Début du règne de Philippe Auguste" },
        { annee: 1214, evenement: "Bataille de Bouvines" },
        { annee: 1223, evenement: "Fin du règne de Philippe Auguste" }
      ],
      lieux: ["Bouvines"], personnages: ["Philippe Auguste"],
      vocabulaire: [
        { mot: "représentation", def: "une image qui montre une scène, ici la bataille de Bouvines" }
      ],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s07-2-f1"], source: S(1)
    },
    {
      id: "histoire-s08-1-f3", notion: "Louis IX (1226-1270) et Philippe le Bel (1285-1314)",
      titre: "Deux rois après Philippe Auguste : Louis IX et Philippe le Bel",
      texte: "Après Philippe Auguste, la frise retient deux rois. Louis IX règne de 1226 à 1270 : la séance demande ce qui montre son pouvoir. Philippe le Bel règne de 1285 à 1314 : son règne commence au XIIIe siècle et s'achève au XIVe. Entre les deux règnes, la frise laisse un blanc, de 1270 à 1285.",
      pointsCles: ["1226-1270 : Louis IX ; la séance étudie ce qui montre son pouvoir", "1285-1314 : Philippe le Bel, du XIIIe au XIVe siècle", "Entre 1270 et 1285 : aucun repère sur la frise"],
      astuce: "Louis IX finit en 1270, Philippe le Bel commence en 1285 : quinze ans de blanc entre les deux.",
      dates: [
        { annee: 1226, evenement: "Début du règne de Louis IX" },
        { annee: 1270, evenement: "Fin du règne de Louis IX" },
        { annee: 1285, evenement: "Début du règne de Philippe le Bel" },
        { annee: 1314, evenement: "Fin du règne de Philippe le Bel" }
      ],
      lieux: [], personnages: ["Louis IX", "Philippe le Bel"],
      vocabulaire: [],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f2"], source: S(1)
    },
    {
      id: "histoire-s08-1-f4", notion: "La guerre de Cent Ans (1337-1453) et Jeanne d'Arc (1428)",
      titre: "Une guerre de plus de cent ans, et Jeanne d'Arc",
      texte: "Le dernier repère de la frise est une longue période : la guerre de Cent Ans, de 1337 à 1453. Malgré son nom, elle dure 116 ans. Un personnage est placé au milieu de cette guerre : Jeanne d'Arc, en 1428. Ces repères viennent après tous les rois de la frise, dont le dernier, Philippe le Bel, règne jusqu'en 1314.",
      pointsCles: ["1337-1453 : la guerre de Cent Ans, qui dure en fait 116 ans", "1428 : Jeanne d'Arc, pendant la guerre", "Ces repères viennent après le dernier roi de la frise, Philippe le Bel (1314)"],
      dates: [
        { annee: 1337, evenement: "Début de la guerre de Cent Ans" },
        { annee: 1428, evenement: "Jeanne d'Arc" },
        { annee: 1453, evenement: "Fin de la guerre de Cent Ans" }
      ],
      lieux: [], personnages: ["Jeanne d'Arc"],
      vocabulaire: [],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f3"], source: S(1)
    }
  ],
  schemas: [
    { id: "histoire-s08-1-s1", legende: "De Hugues Capet à Jeanne d'Arc, de 900 à 1500 (frise redessinée d'après le support, le même qu'à la séance 9).", svg: frise() }
  ],
  questions: [
    // f1 : le domaine royal et les fiefs
    { id: "histoire-s08-1-q1", fiche: "histoire-s08-1-f1", type: "qcm", niveau: 1,
      enonce: "Autour de quelle ville se trouve le domaine royal ?",
      choix: ["Paris", "Bouvines", "Rome", "Wismes"],
      reponse: "Paris",
      explication: "Le domaine royal est autour de Paris. Bouvines est le lieu d'une bataille, Wismes une seigneurie du nord.", source: S(1) },
    { id: "histoire-s08-1-q2", fiche: "histoire-s08-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Le domaine royal est situé autour de Paris.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est l'exemple que donne la séance pour situer les principaux fiefs. Les terres du roi sont autour de Paris.", source: S(1) },
    { id: "histoire-s08-1-q3", fiche: "histoire-s08-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment Philippe Auguste agrandit-il fortement le domaine royal ?",
      choix: ["Il prend la Normandie et d'autres terres au roi d'Angleterre, en 1204", "Il hérite de la Bourgogne à la mort de son oncle", "Il reçoit la Flandre en cadeau de l'empereur", "Il conquiert la Lombardie, au-delà des Alpes, comme Charlemagne avant lui"],
      reponse: "Il prend la Normandie et d'autres terres au roi d'Angleterre, en 1204",
      explication: "Le roi d'Angleterre tient de grandes terres en France, comme la Normandie. En 1204, Philippe Auguste s'en empare, et il prend aussi Poitiers, Loches et Chinon : le domaine royal devient bien plus grand.",
      source: T("Philippe II Auguste", "https://fr.wikipedia.org/wiki/Philippe_II_Auguste") },
    { id: "histoire-s08-1-q4", fiche: "histoire-s08-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le domaine royal se trouve autour de Bouvines.",
      corrections: ["Faux : il se trouve autour de Paris ; Bouvines est le lieu d'une bataille de 1214.", "Faux : il se trouve autour de Wismes, dans le nord.", "Faux : il n'y a pas de domaine royal au Moyen Âge."],
      reponse: { vrai: false, correction: "Faux : il se trouve autour de Paris ; Bouvines est le lieu d'une bataille de 1214." },
      explication: "Le domaine royal est autour de Paris. Bouvines est le lieu de la bataille de 1214.", source: S(1) },
    { id: "histoire-s08-1-q5", fiche: "histoire-s08-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi cite-t-on Paris quand on parle du domaine royal ?",
      choix: ["Parce que les terres du roi sont autour de cette ville", "Parce que la bataille de Bouvines s'y est déroulée en 1214", "Parce que Hugues Capet y a été élu roi en 987", "Parce que c'est la ville du seigneur de Wismes"],
      reponse: "Parce que les terres du roi sont autour de cette ville",
      explication: "Le domaine royal est autour de Paris. Bouvines est ailleurs, et la frise ne dit pas où Hugues Capet est élu.", source: S(1) },
    { id: "histoire-s08-1-q6", fiche: "histoire-s08-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quels mots désignent des territoires du royaume ? (plusieurs réponses)",
      choix: ["Le domaine royal", "Un duché", "Un comté", "Un fief", "Le cens", "Une corvée"],
      reponse: ["Le domaine royal", "Un duché", "Un comté", "Un fief"],
      explication: "Domaine royal, duchés, comtés et fiefs sont des territoires. Le cens et la corvée sont des taxes dues au seigneur.", source: S(1) },
    { id: "histoire-s08-1-q8", fiche: "histoire-s08-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Quand Hugues Capet devient roi, en 987, le domaine royal couvre déjà presque tout le royaume de France.",
      corrections: ["Faux : il est alors très petit, autour de Paris et d'Orléans ; les rois l'agrandissent ensuite peu à peu.", "Faux : il n'existe pas encore ; c'est Philippe Auguste qui le crée en 1204.", "Faux : il couvre déjà tout le royaume, mais seulement au sud de la Loire."],
      reponse: { vrai: false, correction: "Faux : il est alors très petit, autour de Paris et d'Orléans ; les rois l'agrandissent ensuite peu à peu." },
      explication: "Au début, les terres du roi se limitent à peu près à l'Île-de-France et à la région d'Orléans. Les Capétiens les agrandissent ensuite par des confiscations, des mariages et des achats, jusqu'à ce que le domaine se confonde avec le royaume.",
      source: T("Domaine royal français", "https://fr.wikipedia.org/wiki/Domaine_royal_fran%C3%A7ais") },
    // f2 : Philippe Auguste et Bouvines
    { id: "histoire-s08-1-q9", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 1,
      enonce: "En quelle année a lieu la bataille de Bouvines ?",
      choix: ["1214", "1180", "1223", "1428"],
      reponse: "1214",
      explication: "La bataille de Bouvines a lieu en 1214. 1180 et 1223 sont le début et la fin du règne de Philippe Auguste.", source: S(1) },
    { id: "histoire-s08-1-q10", fiche: "histoire-s08-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "La bataille de Bouvines a lieu pendant le règne de Philippe Auguste.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1214 se situe entre 1180 et 1223. Philippe Auguste est le roi de Bouvines.", source: S(1) },
    { id: "histoire-s08-1-q11", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 2,
      enonce: "Qui Philippe Auguste bat-il à Bouvines, en 1214 ?",
      choix: ["L'empereur germanique Otton IV et ses alliés, soutenus par le roi d'Angleterre", "L'armée de l'Empire byzantin, envoyée par Constantinople contre le roi de France", "Le calife de Cordoue et ses troupes d'Al Andalus", "Le duc de Normandie révolté contre le roi"],
      reponse: "L'empereur germanique Otton IV et ses alliés, soutenus par le roi d'Angleterre",
      explication: "À Bouvines, Philippe Auguste affronte l'empereur Otton IV, allié au comte de Flandre et au comte de Boulogne, et soutenu par le roi d'Angleterre Jean sans Terre. Le roi de France l'emporte : l'empereur s'enfuit et les deux comtes sont faits prisonniers.",
      source: T("Bataille de Bouvines", "https://fr.wikipedia.org/wiki/Bataille_de_Bouvines") },
    { id: "histoire-s08-1-q12", fiche: "histoire-s08-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Philippe Auguste règne de 1226 à 1270.",
      corrections: ["Faux : il règne de 1180 à 1223 ; 1226-1270, c'est le règne de Louis IX.", "Faux : il règne de 1285 à 1314.", "Faux : il est élu roi en 987."],
      reponse: { vrai: false, correction: "Faux : il règne de 1180 à 1223 ; 1226-1270, c'est le règne de Louis IX." },
      explication: "Philippe Auguste règne de 1180 à 1223. Les dates 1226-1270 sont celles de Louis IX.", source: S(1) },
    { id: "histoire-s08-1-q13", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi la victoire de Bouvines renforce-t-elle le roi de France ?",
      choix: ["Elle montre qu'il est plus fort que les grands seigneurs ligués contre lui", "Parce qu'elle lui donne la couronne d'Angleterre, que portait Jean sans Terre", "Parce qu'elle met fin à la guerre de Cent Ans", "Parce qu'elle lui apporte l'Empire germanique"],
      reponse: "Elle montre qu'il est plus fort que les grands seigneurs ligués contre lui",
      explication: "Après Bouvines, le prestige de Philippe Auguste est immense : le roi apparaît au-dessus des grands seigneurs, qui n'osent plus le défier. Sa victoire protège aussi les terres qu'il a prises au roi d'Angleterre.",
      source: T("Bataille de Bouvines", "https://fr.wikipedia.org/wiki/Bataille_de_Bouvines") },
    { id: "histoire-s08-1-q15", fiche: "histoire-s08-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets ces repères dans l'ordre du temps.",
      elements: ["Début du règne de Philippe Auguste", "Bataille de Bouvines", "Fin du règne de Philippe Auguste", "Début du règne de Louis IX"],
      reponse: [0, 1, 2, 3],
      explication: "1180 : Philippe Auguste devient roi ; 1214 : Bouvines ; 1223 : fin de son règne ; 1226 : Louis IX commence à régner.", source: S(1) },
    { id: "histoire-s08-1-q16", fiche: "histoire-s08-1-f2", type: "trou", niveau: 1,
      enonce: "Complète avec les repères de la frise.",
      texte: "Philippe Auguste règne de 1180 à ___ ; la bataille de ___ a lieu en 1214.",
      banque: ["1223", "Bouvines", "1270", "Paris"],
      reponse: [["1223"], ["Bouvines"]],
      explication: "Le règne de Philippe Auguste s'achève en 1223. Bouvines est la bataille de 1214.", source: S(1) },
    { id: "histoire-s08-1-q37", fiche: "histoire-s08-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Que sait-on de Philippe Auguste ? (plusieurs réponses)",
      choix: ["Il règne de 1180 à 1223", "La bataille de Bouvines a lieu pendant son règne", "Il est élu roi en 987", "Il règne pendant la guerre de Cent Ans", "Il règne après Louis IX"],
      reponse: ["Il règne de 1180 à 1223", "La bataille de Bouvines a lieu pendant son règne"],
      explication: "Philippe Auguste règne de 1180 à 1223, et la bataille de Bouvines, en 1214, a lieu pendant son règne. Hugues Capet est élu en 987, et la guerre de Cent Ans ne commence qu'en 1337.", source: S(1) },
    // f3 : Louis IX et Philippe le Bel
    { id: "histoire-s08-1-q18", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 1,
      enonce: "Quel roi règne de 1285 à 1314 ?",
      choix: ["Philippe le Bel", "Louis IX", "Philippe Auguste", "Hugues Capet"],
      reponse: "Philippe le Bel",
      explication: "Philippe le Bel règne de 1285 à 1314. C'est le dernier roi de la frise.", source: S(1) },
    { id: "histoire-s08-1-q19", fiche: "histoire-s08-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Louis IX règne de 1226 à 1270.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Louis IX règne de 1226 à 1270. La séance demande ce qui montre son pouvoir.", source: S(1) },
    { id: "histoire-s08-1-q20", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Lequel de ces deux rois règne avant l'autre ?",
      choix: ["Louis IX, avant Philippe le Bel", "Philippe le Bel, avant Louis IX", "Ils règnent en même temps", "Aucun des deux n'est sur la frise"],
      reponse: "Louis IX, avant Philippe le Bel",
      explication: "Louis IX règne de 1226 à 1270, Philippe le Bel de 1285 à 1314. Louis IX vient donc en premier.", source: S(1) },
    { id: "histoire-s08-1-q21", fiche: "histoire-s08-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Philippe le Bel règne entièrement au XIVe siècle.",
      corrections: ["Faux : son règne commence en 1285, au XIIIe siècle, et s'achève en 1314, au XIVe.", "Faux : il règne entièrement au XIIIe siècle.", "Faux : il règne au XIIe siècle."],
      reponse: { vrai: false, correction: "Faux : son règne commence en 1285, au XIIIe siècle, et s'achève en 1314, au XIVe." },
      explication: "1285 appartient au XIIIe siècle et 1314 au XIVe. Le règne de Philippe le Bel est à cheval sur les deux.", source: S(1) },
    { id: "histoire-s08-1-q23", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 3,
      enonce: "En 1250, quel roi de la frise règne ?",
      choix: ["Louis IX", "Philippe le Bel", "Philippe Auguste", "Hugues Capet"],
      reponse: "Louis IX",
      explication: "1250 se situe entre 1226 et 1270 : c'est le règne de Louis IX. Philippe le Bel ne règne qu'à partir de 1285.", indice: "Cherche le règne qui contient 1250.", source: S(1) },
    { id: "histoire-s08-1-q24", fiche: "histoire-s08-1-f3", type: "association", niveau: 3,
      enonce: "Relie chaque repère au siècle (ou aux siècles) où il se place.",
      gauche: ["Hugues Capet élu roi (987)", "Philippe Auguste (1180-1223)", "Louis IX (1226-1270)", "Philippe le Bel (1285-1314)"],
      droite: ["XIIIe siècle seulement", "XIIe et XIIIe siècles", "Xe siècle", "XIIIe et XIVe siècles"],
      reponse: [[0, 2], [1, 1], [2, 0], [3, 3]],
      explication: "987 est au Xe siècle, et 1180-1223 va du XIIe au XIIIe. 1226-1270 reste au XIIIe, tandis que 1285-1314 va du XIIIe au XIVe.", source: S(1) },
    { id: "histoire-s08-1-q25", fiche: "histoire-s08-1-f3", type: "trou", niveau: 1,
      enonce: "Complète avec les dates de la frise.",
      texte: "Louis IX règne de 1226 à ___ ; Philippe le Bel règne de ___ à 1314.",
      banque: ["1270", "1285", "1223", "1337"],
      reponse: [["1270"], ["1285"]],
      explication: "Louis IX règne jusqu'en 1270. Philippe le Bel commence à régner en 1285.", source: S(1) },
    { id: "histoire-s08-1-q26", fiche: "histoire-s08-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Philippe le Bel est un roi faible, qui laisse les grands seigneurs gouverner le royaume à sa place.",
      corrections: ["Faux : il renforce le pouvoir du roi, aidé de conseillers juristes, les légistes.", "Faux : il laisse l'empereur germanique gouverner le royaume à sa place.", "Faux : il abandonne le royaume pour aller vivre en Angleterre."],
      reponse: { vrai: false, correction: "Faux : il renforce le pouvoir du roi, aidé de conseillers juristes, les légistes." },
      explication: "Philippe le Bel, roi de 1285 à 1314, s'entoure de légistes, des conseillers qui connaissent bien le droit. Avec eux, il renforce beaucoup le pouvoir du roi face aux grands seigneurs.",
      source: T("Philippe IV le Bel", "https://fr.wikipedia.org/wiki/Philippe_IV_le_Bel") },
    { id: "histoire-s08-1-q27", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi Louis IX est-il resté célèbre ?",
      choix: ["Pour sa justice : il étend la justice du roi à tout le royaume", "Pour sa victoire à Bouvines contre l'empereur et le roi d'Angleterre", "Pour avoir fondé la dynastie des Capétiens", "Pour avoir mis fin à la guerre de Cent Ans"],
      reponse: "Pour sa justice : il étend la justice du roi à tout le royaume",
      explication: "Louis IX, roi de 1226 à 1270, est resté dans les mémoires comme le roi qui rend la justice sous un chêne, à Vincennes. Il envoie aussi des enquêteurs dans le royaume et fait du roi le juge suprême, au-dessus des seigneurs.",
      source: T("Louis IX", "https://fr.wikipedia.org/wiki/Louis_IX") },
    // f4 : la guerre de Cent Ans et Jeanne d'Arc
    { id: "histoire-s08-1-q28", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 1,
      enonce: "En quelle année la guerre de Cent Ans commence-t-elle ?",
      choix: ["1337", "1453", "1428", "1214"],
      reponse: "1337",
      explication: "La guerre de Cent Ans commence en 1337 et finit en 1453. Jeanne d'Arc apparaît en 1428, pendant cette guerre.", source: S(1) },
    { id: "histoire-s08-1-q29", fiche: "histoire-s08-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Jeanne d'Arc intervient en 1428, pendant la guerre de Cent Ans.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1428 se situe entre 1337 et 1453. Jeanne d'Arc apparaît pendant la guerre de Cent Ans.", source: S(1) },
    { id: "histoire-s08-1-q30", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "En quelle année la guerre de Cent Ans se termine-t-elle ?",
      choix: ["1453", "1337", "1428", "1314"],
      reponse: "1453",
      explication: "La guerre de Cent Ans s'achève en 1453. Elle avait commencé en 1337.", source: S(1) },
    { id: "histoire-s08-1-q31", fiche: "histoire-s08-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "La guerre de Cent Ans dure exactement cent ans.",
      corrections: ["Faux : de 1337 à 1453, elle dure 116 ans.", "Faux : elle ne dure que dix ans.", "Faux : elle dure deux cents ans."],
      reponse: { vrai: false, correction: "Faux : de 1337 à 1453, elle dure 116 ans." },
      explication: "1453 moins 1337 font 116. La guerre de Cent Ans dure donc un peu plus d'un siècle.", source: S(1) },
    { id: "histoire-s08-1-q32", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi la guerre de Cent Ans commence-t-elle, en 1337 ?",
      choix: ["Le roi d'Angleterre réclame la couronne de France", "Le roi de France veut conquérir l'Angleterre", "Les deux rois se disputent Jérusalem et la Terre sainte", "L'empereur germanique attaque la France"],
      reponse: "Le roi d'Angleterre réclame la couronne de France",
      explication: "En 1328, le dernier fils de Philippe le Bel meurt sans héritier, et la couronne passe à son cousin Philippe VI de Valois. Le roi d'Angleterre Édouard III, petit-fils de Philippe le Bel par sa mère, estime qu'elle lui revient : la guerre éclate en 1337.",
      source: T("Guerre de Cent Ans", "https://fr.wikipedia.org/wiki/Guerre_de_Cent_Ans") },
    { id: "histoire-s08-1-q33", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 1,
      enonce: "Que fait Jeanne d'Arc pendant la guerre de Cent Ans ?",
      choix: ["Elle mène l'armée du roi de France et délivre Orléans", "Elle négocie la paix entre le roi de France et le roi d'Angleterre", "Elle gagne la bataille de Bouvines", "Elle devient reine de France"],
      reponse: "Elle mène l'armée du roi de France et délivre Orléans",
      explication: "Jeanne d'Arc conduit les troupes de Charles VII et fait lever le siège d'Orléans, tenu par les Anglais. Capturée par les Bourguignons, alliés des Anglais, elle leur est ensuite vendue.",
      source: T("Jeanne d'Arc", "https://fr.wikipedia.org/wiki/Jeanne_d%27Arc") },
    { id: "histoire-s08-1-q34", fiche: "histoire-s08-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels repères de la frise se situent après la fin du règne de Philippe le Bel, en 1314 ? (plusieurs réponses)",
      choix: ["Le début de la guerre de Cent Ans", "Jeanne d'Arc", "La fin de la guerre de Cent Ans", "La bataille de Bouvines", "Le règne de Louis IX"],
      reponse: ["Le début de la guerre de Cent Ans", "Jeanne d'Arc", "La fin de la guerre de Cent Ans"],
      explication: "1337, 1428 et 1453 viennent après 1314. Bouvines (1214) et Louis IX (1226-1270) sont plus anciens.", source: S(1) },
    { id: "histoire-s08-1-q35", fiche: "histoire-s08-1-f4", type: "trou", niveau: 1,
      enonce: "Complète avec les dates de la frise.",
      texte: "La guerre de Cent Ans dure de ___ à 1453 ; Jeanne d'Arc apparaît en ___.",
      banque: ["1337", "1428", "1314", "1453"],
      reponse: [["1337"], ["1428"]],
      explication: "La guerre commence en 1337. Jeanne d'Arc est placée en 1428, avant la fin de la guerre en 1453.", source: S(1) },
    { id: "histoire-s08-1-q36", fiche: "histoire-s08-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Pendant la guerre de Cent Ans, Jeanne d'Arc combat du côté du roi d'Angleterre.",
      corrections: ["Faux : elle combat pour le roi de France, Charles VII, contre les Anglais et leurs alliés bourguignons.", "Faux : elle ne combat pas : elle négocie la paix entre les deux rois.", "Faux : elle combat pour le duc de Bourgogne, contre les deux rois à la fois."],
      reponse: { vrai: false, correction: "Faux : elle combat pour le roi de France, Charles VII, contre les Anglais et leurs alliés bourguignons." },
      explication: "Jeanne d'Arc se bat pour Charles VII, le roi de France, contre les Anglais et leurs alliés, les Bourguignons. Ce sont d'ailleurs les Bourguignons qui la capturent et la vendent aux Anglais.",
      source: T("Jeanne d'Arc", "https://fr.wikipedia.org/wiki/Jeanne_d%27Arc") },
  ],
  bonus: [
    {
      id: "histoire-s08-1-b1",
      fiche: "histoire-s08-1-f2",
      titre: "Bouvines, un dimanche de juillet 1214",
      texte: "La bataille de Bouvines se déroule le dimanche 27 juillet 1214, près du village de Bouvines, dans le comté de Flandre, aujourd'hui dans le département du Nord. Philippe Auguste y affronte une coalition menée par l'empereur Otton IV, avec le comte de Flandre et le comte de Boulogne. Le roi de France l'emporte : son retour à Paris est triomphal, avec six jours de fêtes.",
      source: { titre: "Bataille de Bouvines", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Bataille_de_Bouvines" }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre « mots importants » du support est vide ; la leçon est donnée en vidéo.",
    "La carte des principaux fiefs et leurs noms : seule la question, avec l'exemple du domaine royal autour de Paris, figure dans le fichier.",
    "La définition précise du domaine royal et du fief, et ce qui distingue le domaine royal des grands fiefs.",
    "La représentation de la bataille de Bouvines (où se trouve le roi, qui combat, qui gagne) : l'image n'est pas dans le fichier.",
    "Ce qui montre le pouvoir de Louis IX : la question est posée, la réponse est donnée en vidéo.",
    "Comment l'État royal s'affirme face aux seigneurs : le support n'a que la frise et trois questions.",
    "Qui sont Philippe Auguste, Louis IX et Philippe le Bel, et ce qu'ils ont fait : la frise ne donne que leurs dates.",
    "Ce qu'est la guerre de Cent Ans, qui s'y affronte et ce qu'y fait Jeanne d'Arc.",
    "Hugues Capet, le vassal et le seigneur, les duchés et les comtés : ils sont traités au cours 9 (histoire-s07-2)."
  ]
};
