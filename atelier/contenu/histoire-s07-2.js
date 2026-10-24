// Source en clair du cours histoire-s07-2 « Cours 9 – Féodaux et seigneurs ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s07-2.
// Seule source : le support de la séance 9 (une page) : la frise de 900 à 1500 (Hugues Capet élu roi 987,
// Philippe Auguste 1180-1223, bataille de Bouvines 1214, Louis IX 1226-1270, Philippe le Bel 1285-1314, guerre de
// Cent Ans 1337-1453, Jeanne d'Arc 1428) et trois questions sur une carte et une image absentes du fichier (grands
// duchés et grands comtés, attitude du vassal et du seigneur). La leçon est donnée en vidéo : voir nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 9 - Support.pdf";
const S = p => ({ fichier: F, page: p });

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 900, A1 = 1500, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 540 214' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  // repères ponctuels au-dessus de l'axe
  s += "<line x1='" + x(987) + "' y1='24' x2='" + x(987) + "' y2='120' stroke='#6a4c9c' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(987) + "' cy='120' r='4' fill='#6a4c9c'/>";
  s += "<text x='" + (x(987) + 4) + "' y='20' fill='#6a4c9c'>987 : Hugues Capet élu roi</text>";
  s += "<line x1='" + x(1214) + "' y1='48' x2='" + x(1214) + "' y2='120' stroke='#b23a3a' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(1214) + "' cy='120' r='4' fill='#b23a3a'/>";
  s += "<text x='" + (x(1214) - 4) + "' y='44' text-anchor='end' fill='#b23a3a'>1214 : bataille de Bouvines</text>";
  s += "<line x1='" + x(1428) + "' y1='48' x2='" + x(1428) + "' y2='96' stroke='#2f5e8e' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(1428) + "' y='44' text-anchor='middle' fill='#2f5e8e'>1428 : Jeanne d'Arc</text>";
  // la guerre de Cent Ans, période au-dessus de l'axe
  s += "<rect x='" + x(1337) + "' y='96' width='" + (x(1453) - x(1337)) + "' height='18' fill='#d46a5c'/>";
  s += "<text x='" + ((x(1337) + x(1453)) / 2) + "' y='82' text-anchor='middle' font-size='10' fill='" + encre + "'>Guerre de Cent Ans : 1337-1453</text>";
  // axe et graduations
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 900; a <= 1500; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  // règnes sous l'axe
  s += "<rect x='" + x(1180) + "' y='144' width='" + (x(1223) - x(1180)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(1223) + "' y='170' text-anchor='end' fill='" + encre + "'>Philippe Auguste 1180-1223</text>";
  s += "<rect x='" + x(1226) + "' y='144' width='" + (x(1270) - x(1226)) + "' height='10' fill='#3f8a5a'/>";
  s += "<line x1='" + ((x(1226) + x(1270)) / 2) + "' y1='154' x2='" + ((x(1226) + x(1270)) / 2) + "' y2='180' stroke='" + encre + "'/>";
  s += "<text x='" + ((x(1226) + x(1270)) / 2) + "' y='192' text-anchor='middle' fill='" + encre + "'>Louis IX 1226-1270</text>";
  s += "<rect x='" + x(1285) + "' y='144' width='" + (x(1314) - x(1285)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(1285) + "' y='170' fill='" + encre + "'>Philippe le Bel 1285-1314</text>";
  // légende
  s += "<rect x='30' y='200' width='12' height='10' fill='#2f5e8e'/><text x='48' y='209' fill='" + encre + "'>règne d'un roi</text>";
  s += "<rect x='150' y='200' width='12' height='10' fill='#d46a5c'/><text x='168' y='209' fill='" + encre + "'>guerre</text>";
  s += "<circle cx='236' cy='205' r='4' fill='#b23a3a'/><text x='246' y='209' fill='" + encre + "'>événement daté</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s07-2",
  fiches: [
    {
      id: "histoire-s07-2-f1", notion: "La frise de 900 à 1500 : rois, batailles et guerre de Cent Ans",
      titre: "Sept repères, de Hugues Capet à Jeanne d'Arc",
      texte: "La frise du cours va de 900 à 1500. En 987, Hugues Capet est élu roi. Puis viennent trois règnes : Philippe Auguste (1180-1223), Louis IX (1226-1270) et Philippe le Bel (1285-1314). Deux événements s'y ajoutent : la bataille de Bouvines, en 1214, et la guerre de Cent Ans (1337-1453), pendant laquelle apparaît Jeanne d'Arc, en 1428.",
      pointsCles: ["987 : Hugues Capet élu roi", "1180-1223 : Philippe Auguste ; 1214 : bataille de Bouvines", "1226-1270 : Louis IX", "1285-1314 : Philippe le Bel", "1337-1453 : guerre de Cent Ans ; 1428 : Jeanne d'Arc"],
      astuce: "Trois rois dans l'ordre : Philippe Auguste, Louis IX, Philippe le Bel, soit P-L-P.",
      dates: [
        { annee: 987, evenement: "Hugues Capet est élu roi" },
        { annee: 1180, evenement: "Début du règne de Philippe Auguste" },
        { annee: 1214, evenement: "Bataille de Bouvines" },
        { annee: 1226, evenement: "Début du règne de Louis IX" },
        { annee: 1285, evenement: "Début du règne de Philippe le Bel" },
        { annee: 1337, evenement: "Début de la guerre de Cent Ans" },
        { annee: 1428, evenement: "Jeanne d'Arc" }
      ],
      lieux: ["Bouvines"], personnages: ["Hugues Capet", "Philippe Auguste", "Louis IX", "Philippe le Bel", "Jeanne d'Arc"],
      vocabulaire: [
        { mot: "règne", def: "la période pendant laquelle un roi gouverne" }
      ],
      schema: "histoire-s07-2-s1", prerequis: ["histoire-s04-3-f1"], source: S(1)
    },
    {
      id: "histoire-s07-2-f2", notion: "987 : Hugues Capet élu roi",
      titre: "Un roi élu, en 987",
      texte: "Le premier repère de la frise est l'élection de Hugues Capet : en 987, il est élu roi, c'est-à-dire choisi, par un vote ou un accord. C'est le seul roi de la frise avec une élection et non des dates de règne. L'année 987 appartient au Xe siècle, un peu avant l'an mil, quand naît le village médiéval.",
      pointsCles: ["987 : Hugues Capet est élu roi", "Élu : choisi, par un vote ou un accord", "987 : Xe siècle, un peu avant l'an mil", "Seul repère de la frise avant 1180"],
      dates: [
        { annee: 987, evenement: "Hugues Capet est élu roi" }
      ],
      lieux: [], personnages: ["Hugues Capet"],
      vocabulaire: [
        { mot: "élire", def: "choisir quelqu'un, par un vote ou par l'accord d'une assemblée ; Hugues Capet est élu roi en 987" }
      ],
      schema: "histoire-s07-2-s1", prerequis: ["histoire-s07-2-f1", "histoire-s04-3-f1"], source: S(1)
    },
    {
      id: "histoire-s07-2-f3", notion: "Vassal et seigneur, duchés et comtés",
      titre: "Les mots de la séance : vassal, seigneur, duché, comté",
      texte: "La séance « Féodaux et seigneurs » fait noter deux grands duchés et deux grands comtés : un duché est le territoire d'un duc, un comté celui d'un comte. Elle fait aussi observer une image d'un vassal et de son seigneur : il faut décrire l'attitude de chacun, puis repérer et citer les deux personnages principaux de l'image.",
      pointsCles: ["Duché : le territoire d'un duc ; comté : le territoire d'un comte", "La séance fait noter de grands duchés et de grands comtés", "Sur l'image étudiée : un vassal et son seigneur, dont on décrit l'attitude"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "duché", def: "le territoire gouverné par un duc" },
        { mot: "comté", def: "le territoire gouverné par un comte" }
      ],
      schema: null, prerequis: ["histoire-s01-2-f4"], source: S(1)
    }
  ],
  schemas: [
    { id: "histoire-s07-2-s1", legende: "De Hugues Capet à Jeanne d'Arc, de 900 à 1500 (frise redessinée d'après le support).", svg: frise() }
  ],
  questions: [
    // f1 : la frise
    { id: "histoire-s07-2-q1", fiche: "histoire-s07-2-f1", type: "qcm", niveau: 1,
      enonce: "En quelle année Hugues Capet est-il élu roi ?",
      choix: ["987", "1214", "1428", "1180"],
      reponse: "987",
      explication: "Hugues Capet est élu roi en 987. 1214 est la bataille de Bouvines et 1428 l'année de Jeanne d'Arc.", source: S(1) },
    { id: "histoire-s07-2-q2", fiche: "histoire-s07-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Philippe Auguste règne de 1180 à 1223.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la frise place le règne de Philippe Auguste de 1180 à 1223. La bataille de Bouvines, en 1214, a lieu pendant ce règne.", source: S(1) },
    { id: "histoire-s07-2-q3", fiche: "histoire-s07-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets ces repères de la frise dans l'ordre du temps.",
      elements: ["Bataille de Bouvines", "Hugues Capet élu roi", "Jeanne d'Arc", "Début du règne de Philippe le Bel"],
      reponse: [1, 0, 3, 2],
      explication: "987 : Hugues Capet ; 1214 : Bouvines ; 1285 : début du règne de Philippe le Bel ; 1428 : Jeanne d'Arc.", source: S(1) },
    { id: "histoire-s07-2-q4", fiche: "histoire-s07-2-f1", type: "qcm", niveau: 2,
      enonce: "Quel roi règne de 1226 à 1270 ?",
      choix: ["Louis IX", "Philippe le Bel", "Philippe Auguste", "Hugues Capet"],
      reponse: "Louis IX",
      explication: "Louis IX règne de 1226 à 1270. Philippe Auguste le précède et Philippe le Bel vient après lui.", source: S(1) },
    { id: "histoire-s07-2-q5", fiche: "histoire-s07-2-f1", type: "association", niveau: 2,
      enonce: "Relie chaque roi aux dates que lui donne la frise.",
      gauche: ["Philippe Auguste", "Louis IX", "Philippe le Bel", "Hugues Capet"],
      droite: ["1285-1314", "Élu roi en 987", "1180-1223", "1226-1270"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Philippe Auguste 1180-1223, Louis IX 1226-1270, Philippe le Bel 1285-1314. Hugues Capet, lui, est élu roi en 987.", source: S(1) },
    { id: "histoire-s07-2-q6", fiche: "histoire-s07-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "La guerre de Cent Ans a lieu pendant le règne de Philippe Auguste.",
      corrections: ["Faux : elle commence en 1337, plus d'un siècle après la fin de son règne, en 1223.", "Faux : elle a lieu pendant le règne de Hugues Capet.", "Faux : elle se termine avant le début du règne de Philippe Auguste."],
      reponse: { vrai: false, correction: "Faux : elle commence en 1337, plus d'un siècle après la fin de son règne, en 1223." },
      explication: "Philippe Auguste règne de 1180 à 1223. La guerre de Cent Ans ne commence qu'en 1337.", source: S(1) },
    { id: "histoire-s07-2-q7", fiche: "histoire-s07-2-f1", type: "qcm", niveau: 3,
      enonce: "Quel roi de la frise règne au moment de la bataille de Bouvines, en 1214 ?",
      choix: ["Philippe Auguste", "Louis IX", "Philippe le Bel", "Hugues Capet"],
      reponse: "Philippe Auguste",
      explication: "1214 se trouve entre 1180 et 1223, les dates du règne de Philippe Auguste. Louis IX ne commence à régner qu'en 1226.", indice: "Cherche le règne qui contient l'année 1214.", source: S(1) },
    { id: "histoire-s07-2-q8", fiche: "histoire-s07-2-f1", type: "qcm", niveau: 3,
      enonce: "Pendant combien d'années Louis IX règne-t-il ?",
      choix: ["44 ans", "34 ans", "54 ans", "24 ans"],
      reponse: "44 ans",
      explication: "Louis IX règne de 1226 à 1270. 1270 moins 1226 font 44 ans.", indice: "Fais la soustraction 1270 moins 1226.", source: S(1) },
    { id: "histoire-s07-2-q9", fiche: "histoire-s07-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quels repères de la frise sont des événements datés d'une seule année, et non des règnes ? (plusieurs réponses)",
      choix: ["La bataille de Bouvines", "Jeanne d'Arc", "L'élection de Hugues Capet", "Louis IX", "Philippe le Bel"],
      reponse: ["La bataille de Bouvines", "Jeanne d'Arc", "L'élection de Hugues Capet"],
      explication: "Bouvines (1214), Jeanne d'Arc (1428) et l'élection de Hugues Capet (987) ont une seule date. Louis IX et Philippe le Bel ont des dates de règne.", source: S(1) },
    { id: "histoire-s07-2-q10", fiche: "histoire-s07-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment la frise présente-t-elle la guerre de Cent Ans ?",
      choix: ["Comme une période, de 1337 à 1453", "Comme un seul événement, daté de 1428", "Comme un règne, de 1285 à 1314", "Comme une bataille, en 1214"],
      reponse: "Comme une période, de 1337 à 1453",
      explication: "La guerre de Cent Ans occupe une longue bande sur la frise, de 1337 à 1453. Jeanne d'Arc, en 1428, est placée pendant cette guerre.", source: S(1) },
    { id: "histoire-s07-2-q11", fiche: "histoire-s07-2-f1", type: "trou", niveau: 1,
      enonce: "Complète avec les repères de la frise.",
      texte: "La bataille de ___ a lieu en 1214 ; Jeanne d'Arc apparaît en ___.",
      banque: ["Bouvines", "1428", "1453", "Paris"],
      reponse: [["Bouvines"], ["1428"]],
      explication: "Bouvines est la bataille de 1214. Jeanne d'Arc est placée en 1428, pendant la guerre de Cent Ans.", source: S(1) },
    // f2 : Hugues Capet élu roi
    { id: "histoire-s07-2-q12", fiche: "histoire-s07-2-f2", type: "qcm", niveau: 1,
      enonce: "Que signifie « élu » dans « Hugues Capet élu roi » ?",
      choix: ["Choisi, par un vote ou un accord", "Né fils de roi", "Vainqueur d'une bataille", "Couronné par un empereur"],
      reponse: "Choisi, par un vote ou un accord",
      explication: "Élire, c'est choisir quelqu'un, par un vote ou un accord. En 987, Hugues Capet est ainsi élu roi.", source: S(1) },
    { id: "histoire-s07-2-q13", fiche: "histoire-s07-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "L'élection de Hugues Capet, en 987, est le premier repère de la frise.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la frise commence en 900 et son premier repère est 987. Le suivant, le règne de Philippe Auguste, ne commence qu'en 1180.", source: S(1) },
    { id: "histoire-s07-2-q14", fiche: "histoire-s07-2-f2", type: "qcm", niveau: 2,
      enonce: "À quel siècle appartient l'année 987 ?",
      choix: ["Le Xe siècle", "Le IXe siècle", "Le XIe siècle", "Le XXe siècle"],
      reponse: "Le Xe siècle",
      explication: "Les années 901 à 1000 forment le Xe siècle. 987 en fait partie, juste avant l'an mil.", source: S(1) },
    { id: "histoire-s07-2-q15", fiche: "histoire-s07-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Hugues Capet est élu roi après la bataille de Bouvines.",
      corrections: ["Faux : il est élu en 987, plus de deux siècles avant Bouvines, en 1214.", "Faux : il est élu l'année même de la bataille de Bouvines.", "Faux : il est élu après la guerre de Cent Ans."],
      reponse: { vrai: false, correction: "Faux : il est élu en 987, plus de deux siècles avant Bouvines, en 1214." },
      explication: "987 vient bien avant 1214. Hugues Capet est élu plus de deux siècles avant la bataille de Bouvines.", source: S(1) },
    { id: "histoire-s07-2-q16", fiche: "histoire-s07-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que Hugues Capet est élu « un peu avant l'an mil » ?",
      choix: ["Parce que 987 est treize ans avant 1000", "Parce que 987 est treize ans après 1000", "Parce que 987 est un siècle avant 1000", "Parce que 987 et l'an mil sont la même année"],
      reponse: "Parce que 987 est treize ans avant 1000",
      explication: "1000 moins 987 font 13. L'élection a lieu treize ans avant l'an mil.", source: S(1) },
    { id: "histoire-s07-2-q17", fiche: "histoire-s07-2-f2", type: "qcm", niveau: 3,
      enonce: "Combien de temps sépare l'élection de Hugues Capet (987) du début du règne de Philippe Auguste (1180) ?",
      choix: ["Près de deux siècles", "Une dizaine d'années", "Près de cinq siècles", "Un demi-siècle"],
      reponse: "Près de deux siècles",
      explication: "1180 moins 987 font 193 ans. C'est presque deux siècles sans aucun repère sur la frise.", indice: "Fais la soustraction, puis compte les centaines.", source: S(1) },
    { id: "histoire-s07-2-q18", fiche: "histoire-s07-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En ___, Hugues Capet est ___ roi.",
      banque: ["987", "élu", "1214", "battu"],
      reponse: [["987"], ["élu"]],
      explication: "Hugues Capet est élu roi en 987. C'est le premier repère de la frise.", source: S(1) },
    { id: "histoire-s07-2-q19", fiche: "histoire-s07-2-f2", type: "vrai_faux", niveau: 3,
      enonce: "Entre l'élection de Hugues Capet et la fin de la guerre de Cent Ans, il s'écoule plus de quatre siècles.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1453 moins 987 font 466 ans. Cela fait plus de quatre siècles et demi.", source: S(1) },
    { id: "histoire-s07-2-q29", fiche: "histoire-s07-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Que peut-on dire de l'élection de Hugues Capet ? (plusieurs réponses)",
      choix: ["Elle a lieu en 987", "C'est le premier repère de la frise", "Elle se place au Xe siècle", "Elle a lieu après la bataille de Bouvines", "Elle marque le début de la guerre de Cent Ans"],
      reponse: ["Elle a lieu en 987", "C'est le premier repère de la frise", "Elle se place au Xe siècle"],
      explication: "Hugues Capet est élu en 987, au Xe siècle : c'est le premier repère de la frise. Bouvines (1214) et la guerre de Cent Ans (1337) viennent bien après.", source: S(1) },
    // f3 : vassal, seigneur, duchés, comtés
    { id: "histoire-s07-2-q20", fiche: "histoire-s07-2-f3", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on le territoire gouverné par un comte ?",
      choix: ["Un comté", "Un duché", "Un royaume", "Une seigneurie"],
      reponse: "Un comté",
      explication: "Le comte gouverne un comté, comme le duc gouverne un duché. Le roi, lui, règne sur un royaume.", source: S(1) },
    { id: "histoire-s07-2-q21", fiche: "histoire-s07-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Un duché est le territoire d'un duc.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le duché est au duc ce que le comté est au comte. La séance fait noter deux grands duchés et deux grands comtés.", source: S(1) },
    { id: "histoire-s07-2-q22", fiche: "histoire-s07-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels territoires sont tenus par un duc ou par un comte ? (plusieurs réponses)",
      choix: ["Les duchés", "Les comtés", "Les califats", "Les tenures", "Les royaumes"],
      reponse: ["Les duchés", "Les comtés"],
      explication: "Le duc tient un duché et le comte un comté : la séance en fait noter deux de chaque sorte. Un califat ou un royaume a un autre chef, et la tenure est la terre d'un paysan.", source: S(1) },
    { id: "histoire-s07-2-q23", fiche: "histoire-s07-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Un comté est gouverné par un duc.",
      corrections: ["Faux : un comté est gouverné par un comte ; le duc gouverne un duché.", "Faux : un comté est gouverné par un évêque.", "Faux : le comté est le territoire du roi, et le duché celui du duc."],
      reponse: { vrai: false, correction: "Faux : un comté est gouverné par un comte ; le duc gouverne un duché." },
      explication: "Le comté est le territoire du comte. Le duc, lui, gouverne un duché.", source: S(1) },
    { id: "histoire-s07-2-q24", fiche: "histoire-s07-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque personnage au territoire qu'il gouverne.",
      gauche: ["Duc", "Comte", "Roi", "Seigneur"],
      droite: ["Royaume", "Seigneurie", "Duché", "Comté"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Duc et duché, comte et comté, roi et royaume, seigneur et seigneurie : le nom du territoire vient de celui qui le gouverne.", source: S(1) },
    { id: "histoire-s07-2-q25", fiche: "histoire-s07-2-f3", type: "qcm", niveau: 2,
      enonce: "Sur l'image étudiée en séance, le vassal est représenté avec un autre personnage. Lequel ?",
      choix: ["Son seigneur", "Un serf", "Un laboureur", "Un chroniqueur"],
      reponse: "Son seigneur",
      explication: "L'image montre un vassal et son seigneur. La séance demande de décrire l'attitude de chacun.", source: S(1) },
    { id: "histoire-s07-2-q26", fiche: "histoire-s07-2-f3", type: "qcm", niveau: 3,
      enonce: "Un « grand duché » et un « grand comté » : qu'ont-ils en commun ?",
      choix: ["Ce sont de vastes territoires, l'un d'un duc, l'autre d'un comte", "Ce sont deux villes du domaine royal", "Ce sont deux batailles de la frise", "Ce sont deux rois élus"],
      reponse: "Ce sont de vastes territoires, l'un d'un duc, l'autre d'un comte",
      explication: "Un duché et un comté sont des territoires. Le mot « grand » dit qu'ils sont vastes, et la séance en fait noter deux de chaque sorte.", indice: "Pars du sens des mots duché et comté.", source: S(1) },
    { id: "histoire-s07-2-q27", fiche: "histoire-s07-2-f3", type: "trou", niveau: 1,
      enonce: "Complète avec les noms des territoires.",
      texte: "Le ___ est le territoire d'un duc ; le ___ est celui d'un comte.",
      banque: ["duché", "comté", "royaume", "village"],
      reponse: [["duché"], ["comté"]],
      explication: "Le duché appartient au duc, le comté au comte. Le royaume, lui, est au roi.", source: S(1) },
    { id: "histoire-s07-2-q28", fiche: "histoire-s07-2-f3", type: "vrai_faux", niveau: 3,
      enonce: "Un grand comté est un territoire plus petit qu'une tenure.",
      corrections: ["Faux : un grand comté est un vaste territoire tenu par un comte ; une tenure est une terre cédée à un seul paysan.", "Faux : le comté et la tenure désignent la même chose.", "Faux : la tenure est le territoire du comte, et le comté celui du paysan."],
      reponse: { vrai: false, correction: "Faux : un grand comté est un vaste territoire tenu par un comte ; une tenure est une terre cédée à un seul paysan." },
      explication: "Un grand comté est un vaste territoire, tenu par un comte. Une tenure est une simple terre qu'un seigneur cède à un paysan.", source: S(1) }
  ],
  bonus: [
    {
      id: "histoire-s07-2-b1",
      fiche: "histoire-s07-2-f2",
      titre: "Hugues Capet, acclamé à Senlis",
      texte: "En 987, Hugues Capet est acclamé roi par une assemblée de grands réunie à Senlis. Le jour de Noël de la même année, il fait associer son fils Robert à la couronne, de son vivant. Son surnom viendrait peut-être de la chape, un manteau. Ses descendants ont régné sur la France sans interruption jusqu'à la Révolution.",
      source: { titre: "Hugues Capet", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Hugues_Capet" }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre « mots importants » du support est vide ; la leçon est donnée en vidéo.",
    "Ce que sont un fief, un vassal, un seigneur et le lien qui les unit (l'hommage) : la séance ne fait qu'en nommer les personnages.",
    "La carte des grands duchés et des grands comtés, et leurs noms : seule la question figure dans le fichier.",
    "L'image du vassal et du seigneur étudiée en séance : seules les questions sur leur attitude figurent dans le fichier.",
    "Qui sont Hugues Capet, Philippe Auguste, Louis IX, Philippe le Bel et Jeanne d'Arc : la frise ne donne que leurs dates.",
    "Ce qu'est la guerre de Cent Ans, qui s'y affronte et ce qu'y fait Jeanne d'Arc.",
    "Le domaine royal autour de Paris et les principaux fiefs : ils sont traités au cours 10 (histoire-s08-1), avec la bataille de Bouvines."
  ]
};
