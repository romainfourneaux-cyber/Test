// Source en clair du cours histoire-s01-1 « Cours 1 – Empire byzantin au temps de Justinien ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s01-1.
// Seule source : le support de la séance 1 (cartes, frise, mosaïque, mémento). La leçon elle-même est
// donnée en vidéo et n'est pas déposée : ce qu'elle apporterait est listé dans nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 1 - Support.pdf";
const S = p => ({ fichier: F, page: p });

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 370, A1 = 1470, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 540 236' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  // repères du haut, avec leur trait jusqu'à l'axe
  [[380, 16, "380 : édit de Thessalonique"], [395, 32, "395 : partage de l'Empire romain"],
   [476, 48, "476 : chute du dernier empereur romain d'Occident"]].forEach(([a, y, t]) => {
    s += "<line x1='" + x(a) + "' y1='" + (y + 4) + "' x2='" + x(a) + "' y2='120' stroke='" + encre + "' stroke-dasharray='3 2'/>";
    s += "<text x='" + (x(a) + 3) + "' y='" + y + "' fill='" + encre + "'>" + t + "</text>";
  });
  // périodes au-dessus de l'axe
  s += "<rect x='" + x(395) + "' y='92' width='" + (x(476) - x(395)) + "' height='18' fill='#9e2b25'/>";
  s += "<rect x='" + x(476) + "' y='92' width='" + (x(800) - x(476)) + "' height='18' fill='#d46a5c'/>";
  s += "<text x='" + ((x(476) + x(800)) / 2) + "' y='105' text-anchor='middle' font-size='10' fill='#fff'>Royaumes germaniques</text>";
  // axe et graduations
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 400; a <= 1400; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  // Empire romain d'Orient sous l'axe
  s += "<rect x='" + x(395) + "' y='142' width='" + (x(1453) - x(395)) + "' height='18' fill='#6b3fa0'/>";
  s += "<text x='" + ((x(395) + x(1453)) / 2) + "' y='155' text-anchor='middle' font-size='10' fill='#fff'>Empire romain d'Orient (Empire byzantin)</text>";
  s += "<rect x='" + x(527) + "' y='164' width='" + (x(565) - x(527)) + "' height='8' fill='#b08d3a'/>";
  s += "<text x='" + x(527) + "' y='186' fill='" + encre + "'>527-565 : règne de Justinien</text>";
  s += "<line x1='" + x(1453) + "' y1='160' x2='" + x(1453) + "' y2='194' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(1453) + "' y='206' text-anchor='end' fill='" + encre + "'>1453 : prise de Constantinople par les Turcs</text>";
  // légende de la petite barre d'Occident
  s += "<rect x='30' y='220' width='12' height='10' fill='#9e2b25'/><text x='48' y='229' fill='" + encre + "'>Empire romain d'Occident (395-476)</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s01-1",
  fiches: [
    {
      id: "histoire-s01-1-f1", notion: "Le partage de l'Empire romain en 395",
      titre: "395 : un empire coupé en deux",
      texte: "En 395, à la mort de Théodose, l'Empire romain est divisé en deux moitiés. À l'ouest se trouve l'Empire romain d'Occident, avec Rome et Ravenne. À l'est se trouve l'Empire romain d'Orient, avec Constantinople. Les deux moitiés bordent la mer Méditerranée.",
      pointsCles: ["395 : à la mort de Théodose, l'Empire romain est partagé", "À l'ouest, l'Occident : Rome, Ravenne", "À l'est, l'Orient : Constantinople"],
      astuce: "Sur la carte du partage : l'Occident à gauche (l'ouest), l'Orient à droite (l'est).",
      dates: [{ annee: 395, evenement: "Partage de l'Empire romain en deux" }],
      lieux: ["Rome", "Ravenne", "Constantinople", "Mer Méditerranée"], personnages: ["Théodose"],
      vocabulaire: [
        { mot: "Empire romain d'Occident", def: "la moitié ouest de l'Empire romain après le partage de 395, avec Rome et Ravenne" }
      ],
      schema: null, prerequis: [], source: S(1)
    },
    {
      id: "histoire-s01-1-f2", notion: "Deux destins : 476 et 1453",
      titre: "L'Occident tombe, l'Orient dure",
      texte: "L'Empire romain d'Occident ne dure pas longtemps : en 476, c'est la chute de son dernier empereur, et des royaumes germaniques prennent sa place. L'Empire romain d'Orient tient bien plus longtemps, jusqu'en 1453, quand les Turcs prennent Constantinople. La frise des empires chrétiens du Moyen Âge s'ouvre sur l'édit de Thessalonique, en 380.",
      pointsCles: ["380 : édit de Thessalonique", "476 : chute du dernier empereur romain d'Occident", "Après 476 : les royaumes germaniques", "1453 : les Turcs prennent Constantinople, fin de l'Empire romain d'Orient"],
      dates: [
        { annee: 380, evenement: "Édit de Thessalonique" },
        { annee: 476, evenement: "Chute du dernier empereur romain d'Occident" },
        { annee: 1453, evenement: "Prise de Constantinople par les Turcs" }
      ],
      lieux: ["Constantinople"], personnages: [],
      vocabulaire: [
        { mot: "royaumes germaniques", def: "les royaumes qui remplacent l'Empire romain d'Occident après 476" }
      ],
      schema: "histoire-s01-1-s1", prerequis: ["histoire-s01-1-f1"], source: S(1)
    },
    {
      id: "histoire-s01-1-f3", notion: "Byzance, Constantinople, Istanbul",
      titre: "Une ville, trois noms",
      texte: "Byzance naît comme colonie grecque au VIe siècle avant J.-C. Au IVe siècle après J.-C., elle devient Constantinople, du nom de l'empereur Constantin, qui la voulait comme une Rome de l'Orient. De 395 à 1453, elle est la capitale de l'Empire romain d'Orient, aussi appelé Empire byzantin. Aujourd'hui, la ville s'appelle Istanbul, en Turquie.",
      pointsCles: ["Byzance : colonie grecque (VIe siècle av. J.-C.)", "Constantinople : son nom à partir du IVe siècle, d'après l'empereur Constantin", "De 395 à 1453 : capitale de l'Empire romain d'Orient", "Istanbul : son nom aujourd'hui, en Turquie"],
      astuce: "Trois noms dans l'ordre : Byzance, Constantinople, Istanbul. « Byzantin » vient de Byzance.",
      dates: [],
      lieux: ["Byzance", "Constantinople", "Istanbul"], personnages: ["Constantin"],
      vocabulaire: [
        { mot: "Empire byzantin", def: "un autre nom de l'Empire romain d'Orient, tiré de Byzance, l'ancien nom de sa capitale" }
      ],
      schema: null, prerequis: ["histoire-s01-1-f1"], source: S(3)
    },
    {
      id: "histoire-s01-1-f4", notion: "Justinien et ses conquêtes",
      titre: "Le règne de Justinien (527-565)",
      texte: "L'empereur Justinien règne de 527 à 565. Quand il arrive au pouvoir, l'Empire byzantin occupe surtout l'est de la Méditerranée. Justinien mène alors des conquêtes vers l'ouest, sur des terres de l'ancien Empire romain d'Occident, comme la région de Ravenne. Son empire entoure ainsi presque toute la Méditerranée.",
      pointsCles: ["527-565 : règne de l'empereur Justinien", "Ses conquêtes se font vers l'ouest de la Méditerranée", "Ravenne fait partie de ses conquêtes"],
      dates: [
        { annee: 527, evenement: "Début du règne de Justinien" },
        { annee: 565, evenement: "Fin du règne de Justinien" }
      ],
      lieux: ["Ravenne", "Constantinople", "Mer Méditerranée"], personnages: ["Justinien"],
      vocabulaire: [],
      schema: null, prerequis: ["histoire-s01-1-f1"], source: S(2)
    },
    {
      id: "histoire-s01-1-f5", notion: "La mosaïque de Saint-Vital de Ravenne",
      titre: "Justinien et sa cour en mosaïque",
      texte: "Ravenne fait partie des conquêtes de Justinien. Dans la basilique Saint-Vital de cette ville, une mosaïque représente l'empereur Justinien avec les membres de sa cour. On y voit donc l'image de l'empereur loin de Constantinople, dans une ville reprise à l'ouest.",
      pointsCles: ["Lieu : la basilique Saint-Vital, à Ravenne", "Sujet : l'empereur Justinien et sa cour", "Ravenne : une ville conquise par Justinien"],
      dates: [],
      lieux: ["Ravenne"], personnages: ["Justinien"],
      vocabulaire: [],
      schema: null, prerequis: ["histoire-s01-1-f4"], source: S(2)
    }
  ],
  schemas: [
    { id: "histoire-s01-1-s1", legende: "Les empires chrétiens du Moyen Âge, de 380 à 1453 (frise redessinée d'après le support).", svg: frise() }
  ],
  questions: [
    // f1 : le partage de 395
    { id: "histoire-s01-1-q1", fiche: "histoire-s01-1-f1", type: "qcm", niveau: 1,
      enonce: "En quelle année l'Empire romain est-il partagé en deux ?",
      choix: ["395", "380", "476", "527"],
      reponse: "395",
      explication: "Le partage a lieu en 395, à la mort de Théodose. Naissent alors l'Empire romain d'Occident et l'Empire romain d'Orient.",
      indice: "C'est entre l'édit de Thessalonique et la chute du dernier empereur romain d'Occident.", source: S(1) },
    { id: "histoire-s01-1-q2", fiche: "histoire-s01-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "En 395, Constantinople se trouve dans l'Empire romain d'Occident.",
      corrections: ["Faux : Constantinople se trouve dans l'Empire romain d'Orient, à l'est.", "Faux : en 395, Constantinople se trouve dans un royaume germanique.", "Faux : Constantinople se trouve dans l'Empire romain d'Orient, à l'ouest."],
      reponse: { vrai: false, correction: "Faux : Constantinople se trouve dans l'Empire romain d'Orient, à l'est." },
      explication: "En 395, Constantinople est dans la moitié est de l'empire, l'Empire romain d'Orient. Les royaumes germaniques n'arrivent qu'après 476.", source: S(1) },
    { id: "histoire-s01-1-q3", fiche: "histoire-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on d'un « partage » de l'Empire romain en 395 ?",
      choix: ["L'empire est divisé en deux moitiés, l'Occident et l'Orient", "L'empire perd son dernier empereur et laisse la place à des royaumes germaniques", "Justinien répartit ses conquêtes entre Rome et Constantinople", "Les Turcs et les Romains se partagent la ville de Constantinople"],
      reponse: "L'empire est divisé en deux moitiés, l'Occident et l'Orient",
      explication: "À la mort de Théodose, en 395, l'empire est coupé en deux moitiés. L'Occident est à l'ouest, l'Orient à l'est.", source: S(1) },
    { id: "histoire-s01-1-q4", fiche: "histoire-s01-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur le partage de 395.",
      texte: "À l'ouest, l'Empire romain d'___, avec Rome ; à l'est, l'Empire romain d'___, avec Constantinople.",
      banque: ["Occident", "Orient", "Afrique", "Italie"],
      reponse: [["Occident"], ["Orient"]],
      explication: "L'ouest, c'est l'Occident, avec Rome et Ravenne. L'est, c'est l'Orient, avec Constantinople.", source: S(1) },
    { id: "histoire-s01-1-q24", fiche: "histoire-s01-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "En 395, Rome et Ravenne se trouvent toutes les deux dans l'Empire romain d'Occident.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : ces deux villes sont dans la moitié ouest de l'empire. Constantinople, elle, est dans la moitié est.", source: S(1) },
    { id: "histoire-s01-1-q25", fiche: "histoire-s01-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "L'Empire romain est partagé en deux en 395, à la mort de Justinien.",
      corrections: ["Faux : il est partagé en 395, à la mort de Théodose.", "Faux : il est partagé en 476, à la mort de Justinien.", "Faux : il est partagé en 527, au début du règne de Justinien."],
      reponse: { vrai: false, correction: "Faux : il est partagé en 395, à la mort de Théodose." },
      explication: "Le partage de 395 suit la mort de Théodose. Justinien ne règne que bien plus tard, de 527 à 565.", source: S(1) },
    { id: "histoire-s01-1-q26", fiche: "histoire-s01-1-f1", type: "qcm", niveau: 3,
      enonce: "Combien d'années séparent l'édit de Thessalonique du partage de l'Empire romain ?",
      choix: ["15 ans", "25 ans", "81 ans", "115 ans"],
      reponse: "15 ans",
      explication: "L'édit date de 380 et le partage de 395. 395 moins 380 font 15 ans.",
      indice: "Fais la soustraction entre les deux dates.", source: S(1) },
    { id: "histoire-s01-1-q27", fiche: "histoire-s01-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles phrases sur le partage de 395 sont justes ? (plusieurs réponses)",
      choix: ["Il a lieu à la mort de Théodose", "Constantinople est dans la moitié est", "Les deux moitiés bordent la mer Méditerranée", "Rome est dans l'Empire romain d'Orient", "Il suit la chute du dernier empereur romain d'Occident"],
      reponse: ["Il a lieu à la mort de Théodose", "Constantinople est dans la moitié est", "Les deux moitiés bordent la mer Méditerranée"],
      explication: "En 395, à la mort de Théodose, Rome est à l'ouest et Constantinople à l'est, autour de la Méditerranée. La chute du dernier empereur d'Occident vient après, en 476.", source: S(1) },
    // f2 : 476 et 1453
    { id: "histoire-s01-1-q5", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 1,
      enonce: "Que se passe-t-il en 476 ?",
      choix: ["La chute du dernier empereur romain d'Occident", "La prise de Constantinople par les Turcs", "Le partage de l'Empire romain à la mort de Théodose", "Le début du règne de Justinien"],
      reponse: "La chute du dernier empereur romain d'Occident",
      explication: "En 476, l'Empire romain d'Occident perd son dernier empereur. Des royaumes germaniques prennent sa place.", source: S(1) },
    { id: "histoire-s01-1-q6", fiche: "histoire-s01-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'Empire romain d'Orient disparaît en 476, en même temps que celui d'Occident.",
      corrections: ["Faux : il dure jusqu'en 1453, quand les Turcs prennent Constantinople.", "Faux : il disparaît vers 800, à la fin des royaumes germaniques.", "Faux : il disparaît en 565, à la fin du règne de Justinien."],
      reponse: { vrai: false, correction: "Faux : il dure jusqu'en 1453, quand les Turcs prennent Constantinople." },
      explication: "Seul l'Occident tombe en 476. L'Orient continue jusqu'en 1453.", source: S(1) },
    { id: "histoire-s01-1-q7", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment l'Empire romain d'Orient prend-il fin ?",
      choix: ["Les Turcs prennent Constantinople en 1453", "Des royaumes germaniques le remplacent en 476", "Il est coupé en deux à la mort de Théodose", "Il perd sa capitale à la mort de Justinien"],
      reponse: "Les Turcs prennent Constantinople en 1453",
      explication: "En 1453, les Turcs s'emparent de Constantinople. C'est la fin de l'Empire romain d'Orient.", source: S(1) },
    { id: "histoire-s01-1-q8", fiche: "histoire-s01-1-f2", type: "ordre", niveau: 2,
      enonce: "Range ces événements du plus ancien au plus récent.",
      elements: ["Prise de Constantinople par les Turcs", "Édit de Thessalonique", "Partage de l'Empire romain", "Chute du dernier empereur romain d'Occident"],
      reponse: [1, 2, 3, 0],
      explication: "380 : édit de Thessalonique ; 395 : partage ; 476 : chute de l'Occident ; 1453 : prise de Constantinople.", source: S(1) },
    { id: "histoire-s01-1-q9", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "Combien de temps l'Empire romain d'Orient dure-t-il, de 395 à 1453 ?",
      choix: ["Plus de mille ans", "Environ cent ans", "Environ quatre-vingts ans", "Environ cinq cents ans"],
      reponse: "Plus de mille ans",
      explication: "De 395 à 1453, il s'écoule 1058 ans. C'est donc plus de mille ans.", indice: "Fais la soustraction 1453 moins 395.", source: S(1) },
    { id: "histoire-s01-1-q28", fiche: "histoire-s01-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Après 476, des royaumes germaniques prennent la place de l'Empire romain d'Occident.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en 476, l'Occident perd son dernier empereur. Les royaumes germaniques occupent ensuite sa place.", source: S(1) },
    { id: "histoire-s01-1-q29", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "Des deux empires nés du partage de 395, lequel dure le plus longtemps ?",
      choix: ["L'Empire romain d'Orient, jusqu'en 1453", "L'Empire romain d'Occident, jusqu'en 1453", "L'Empire romain d'Orient, jusqu'en 476", "Aucun : ils tombent ensemble en 476"],
      reponse: "L'Empire romain d'Orient, jusqu'en 1453",
      explication: "L'Occident tombe dès 476. L'Orient tient jusqu'en 1453, près de mille ans de plus.", source: S(1) },
    { id: "histoire-s01-1-q30", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "Combien de temps l'Empire romain d'Occident dure-t-il, du partage de 395 à 476 ?",
      choix: ["Environ 80 ans", "Environ 180 ans", "Environ 500 ans", "Plus de mille ans"],
      reponse: "Environ 80 ans",
      explication: "476 moins 395 font 81 ans. C'est bien moins qu'un siècle.", indice: "Fais la soustraction 476 moins 395.", source: S(1) },
    { id: "histoire-s01-1-q31", fiche: "histoire-s01-1-f2", type: "qcm_multiple", niveau: 3,
      enonce: "Quels événements ont lieu après la chute du dernier empereur romain d'Occident ? (plusieurs réponses)",
      choix: ["Le règne de Justinien", "La prise de Constantinople par les Turcs", "Le temps des royaumes germaniques", "Le partage de l'Empire romain", "L'édit de Thessalonique"],
      reponse: ["Le règne de Justinien", "La prise de Constantinople par les Turcs", "Le temps des royaumes germaniques"],
      explication: "La chute date de 476 : les royaumes germaniques, Justinien (527-565) et la prise de Constantinople (1453) viennent après. Le partage (395) et l'édit de Thessalonique (380) viennent avant.", source: S(1) },
    // f3 : Byzance, Constantinople, Istanbul
    { id: "histoire-s01-1-q10", fiche: "histoire-s01-1-f3", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les noms successifs de la ville.",
      elements: ["Istanbul", "Byzance", "Constantinople"],
      reponse: [1, 2, 0],
      explication: "La ville s'appelle d'abord Byzance, puis Constantinople. Aujourd'hui, c'est Istanbul.", source: S(3) },
    { id: "histoire-s01-1-q11", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Au IVe siècle, Byzance prend le nom de Constantinople. Que voulait en faire l'empereur Constantin ?",
      choix: ["Une sorte de Rome de l'Orient", "La capitale de l'Empire romain d'Occident", "Une nouvelle colonie grecque", "Une ville des royaumes germaniques"],
      reponse: "Une sorte de Rome de l'Orient",
      explication: "Le nom de Constantinople rappelle l'empereur Constantin. Il voulait faire de la ville une Rome de l'Orient.", source: S(3) },
    { id: "histoire-s01-1-q12", fiche: "histoire-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Byzance était à l'origine une colonie grecque.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Byzance naît comme colonie grecque, au VIe siècle avant Jésus-Christ.", source: S(3) },
    { id: "histoire-s01-1-q13", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on d'« Empire byzantin » pour l'Empire romain d'Orient ?",
      choix: ["En souvenir de Byzance, l'ancien nom de sa capitale", "Parce que Constantin voulait en faire une Rome de l'Orient", "Parce que sa capitale s'appelle encore Byzance aujourd'hui", "Parce qu'il remplace l'Empire romain d'Occident en 476"],
      reponse: "En souvenir de Byzance, l'ancien nom de sa capitale",
      explication: "Byzance est l'ancien nom de Constantinople. Le mot « byzantin » rappelle ce nom.", source: S(3) },
    { id: "histoire-s01-1-q14", fiche: "histoire-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Constantinople n'est la capitale de l'Empire romain d'Orient que de 395 à 476.",
      corrections: ["Faux : elle l'est de 395 à 1453.", "Faux : elle l'est de 380 à 1453, depuis l'édit de Thessalonique.", "Faux : elle l'est de 527 à 1453, à partir de Justinien."],
      reponse: { vrai: false, correction: "Faux : elle l'est de 395 à 1453." },
      explication: "476 marque la chute de l'Occident, pas celle de l'Orient. Constantinople reste la capitale jusqu'en 1453.", source: S(3) },
    { id: "histoire-s01-1-q15", fiche: "histoire-s01-1-f3", type: "trou", niveau: 3,
      enonce: "Écris le nom actuel de la ville.",
      texte: "Aujourd'hui, l'ancienne Byzance porte le nom d'___.",
      reponse: [["Istanbul"]],
      explication: "Byzance, puis Constantinople, s'appelle aujourd'hui Istanbul. La ville se trouve en Turquie.", source: S(3) },
    { id: "histoire-s01-1-q32", fiche: "histoire-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Byzance prend le nom de Constantinople au VIe siècle avant J.-C.",
      corrections: ["Faux : elle prend ce nom au IVe siècle après J.-C.", "Faux : elle prend ce nom en 1453, quand les Turcs s'en emparent.", "Faux : elle prend ce nom au VIe siècle après J.-C., sous Justinien."],
      reponse: { vrai: false, correction: "Faux : elle prend ce nom au IVe siècle après J.-C." },
      explication: "Au VIe siècle avant J.-C., Byzance naît comme colonie grecque. Elle ne devient Constantinople qu'au IVe siècle après J.-C.", source: S(3) },
    { id: "histoire-s01-1-q33", fiche: "histoire-s01-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque nom à ce qu'il désigne.",
      gauche: ["Byzance", "Constantinople", "Istanbul", "Empire byzantin"],
      droite: ["Autre nom de l'Empire romain d'Orient", "Nom de la ville aujourd'hui, en Turquie", "Colonie grecque du VIe siècle avant J.-C.", "Nom donné à la ville d'après l'empereur Constantin"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Byzance, la colonie grecque, devient Constantinople en l'honneur de Constantin, puis Istanbul. L'Empire byzantin tire son nom de Byzance.", source: S(3) },
    { id: "histoire-s01-1-q34", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 3,
      enonce: "En l'an 1000, sous quel nom connaît-on la capitale de l'Empire byzantin ?",
      choix: ["Constantinople", "Byzance", "Istanbul", "Ravenne"],
      reponse: "Constantinople",
      explication: "De 395 à 1453, la capitale de l'Empire romain d'Orient s'appelle Constantinople. Byzance est son ancien nom, Istanbul son nom actuel.", source: S(3) },
    // f4 : Justinien et ses conquêtes
    { id: "histoire-s01-1-q16", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 1,
      enonce: "Quand Justinien règne-t-il ?",
      choix: ["De 527 à 565", "De 395 à 476", "De 476 à 527", "De 380 à 395"],
      reponse: "De 527 à 565",
      explication: "Justinien règne de 527 à 565, à la tête de l'Empire byzantin. C'est bien après la chute de l'Occident, en 476.", source: S(1) },
    { id: "histoire-s01-1-q17", fiche: "histoire-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Les conquêtes de Justinien se font vers l'ouest de la Méditerranée.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : ses conquêtes s'étendent à l'ouest de l'empire de 527. Ravenne en fait partie.", source: S(2) },
    { id: "histoire-s01-1-q18", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment l'Empire byzantin change-t-il sous le règne de Justinien ?",
      choix: ["Il s'agrandit vers l'ouest grâce à des conquêtes", "Il s'agrandit vers l'est en prenant Constantinople", "Il perd ses terres de l'ouest au profit des royaumes germaniques", "Il est coupé en deux moitiés à la mort de l'empereur"],
      reponse: "Il s'agrandit vers l'ouest grâce à des conquêtes",
      explication: "Justinien conquiert des terres à l'ouest de la Méditerranée. Constantinople, elle, est déjà sa capitale.", source: S(2) },
    { id: "histoire-s01-1-q19", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 3,
      enonce: "En 395, Ravenne est dans l'Empire romain d'Occident. Après les conquêtes de Justinien, à quel empire appartient-elle ?",
      choix: ["À l'Empire byzantin, qui l'a conquise", "Toujours à l'Empire romain d'Occident", "À l'Empire carolingien", "À aucun empire, elle est indépendante"],
      reponse: "À l'Empire byzantin, qui l'a conquise",
      explication: "Ravenne fait partie des conquêtes de Justinien : elle passe à l'Empire byzantin. L'Empire romain d'Occident, lui, a disparu en 476.", source: S(2) },
    { id: "histoire-s01-1-q35", fiche: "histoire-s01-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "En 527, quand Justinien arrive au pouvoir, l'Empire byzantin occupe surtout l'ouest de la Méditerranée.",
      corrections: ["Faux : il occupe surtout l'est ; Justinien conquiert ensuite des terres à l'ouest.", "Faux : il entoure déjà toute la Méditerranée en 527.", "Faux : il n'existe pas encore en 527 ; il naît avec Justinien."],
      reponse: { vrai: false, correction: "Faux : il occupe surtout l'est ; Justinien conquiert ensuite des terres à l'ouest." },
      explication: "En 527, l'empire est surtout à l'est, autour de Constantinople. Les conquêtes de Justinien l'étendent ensuite vers l'ouest.", source: S(2) },
    { id: "histoire-s01-1-q36", fiche: "histoire-s01-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles phrases sur Justinien sont justes ? (plusieurs réponses)",
      choix: ["Il règne de 527 à 565", "Il conquiert des terres à l'ouest de la Méditerranée", "Ravenne fait partie de ses conquêtes", "Il règne avant le partage de 395", "Il perd Constantinople au profit des Turcs"],
      reponse: ["Il règne de 527 à 565", "Il conquiert des terres à l'ouest de la Méditerranée", "Ravenne fait partie de ses conquêtes"],
      explication: "Justinien règne de 527 à 565 et conquiert des terres à l'ouest, dont Ravenne. Constantinople ne tombe qu'en 1453, bien après lui.", source: S(2) },
    { id: "histoire-s01-1-q37", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 3,
      enonce: "Combien d'années dure le règne de Justinien ?",
      choix: ["38 ans", "48 ans", "28 ans", "62 ans"],
      reponse: "38 ans",
      explication: "Justinien règne de 527 à 565. 565 moins 527 font 38 ans.", indice: "Fais la soustraction 565 moins 527.", source: S(1) },
    { id: "histoire-s01-1-q38", fiche: "histoire-s01-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Justinien règne après la chute du dernier empereur romain d'Occident.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'Occident tombe en 476, et Justinien règne de 527 à 565. Ses conquêtes touchent donc d'anciennes terres de l'Occident.", source: S(1) },
    // f5 : la mosaïque de Saint-Vital
    { id: "histoire-s01-1-q20", fiche: "histoire-s01-1-f5", type: "qcm", niveau: 1,
      enonce: "Où se trouve la mosaïque qui représente l'empereur Justinien et sa cour ?",
      choix: ["Dans la basilique Saint-Vital de Ravenne", "Dans une basilique de Rome, ancienne ville de l'Occident", "Dans le palais impérial de Ravenne", "Dans une église de Thessalonique"],
      reponse: "Dans la basilique Saint-Vital de Ravenne",
      explication: "La mosaïque orne la basilique Saint-Vital. Elle se trouve à Ravenne, une ville conquise par Justinien.", source: S(2) },
    { id: "histoire-s01-1-q21", fiche: "histoire-s01-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "La mosaïque de Saint-Vital montre l'empereur Justinien entouré de sa cour.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est le sujet de cette mosaïque. Elle orne la basilique Saint-Vital, à Ravenne.", source: S(2) },
    { id: "histoire-s01-1-q22", fiche: "histoire-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "La basilique Saint-Vital, avec sa mosaïque de Justinien, se trouve à Rome.",
      corrections: ["Faux : elle se trouve à Ravenne, une ville conquise par Justinien.", "Faux : elle se trouve à Ravenne, une ville restée dans l'Empire romain d'Occident."],
      reponse: { vrai: false, correction: "Faux : elle se trouve à Ravenne, une ville conquise par Justinien." },
      explication: "Saint-Vital est à Ravenne. Cette ville fait partie des conquêtes de Justinien, bien après la chute de l'Occident.", source: S(2) },
    { id: "histoire-s01-1-q23", fiche: "histoire-s01-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi trouve-t-on une image de Justinien à Ravenne, loin de Constantinople ?",
      choix: ["Parce que Ravenne fait partie de ses conquêtes", "Parce que Ravenne est la capitale de l'Empire byzantin", "Parce que Ravenne est dans l'Orient depuis le partage de 395", "Parce que Ravenne est la capitale de l'Occident sous Justinien"],
      reponse: "Parce que Ravenne fait partie de ses conquêtes",
      explication: "Justinien a conquis Ravenne. La ville entre alors dans l'Empire byzantin.", source: S(2) },
    { id: "histoire-s01-1-q39", fiche: "histoire-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "La mosaïque de la basilique Saint-Vital montre l'empereur Théodose entouré de sa cour.",
      corrections: ["Faux : elle montre l'empereur Justinien et sa cour.", "Faux : elle montre Théodose seul, sans sa cour.", "Faux : elle montre le partage de l'Empire romain."],
      reponse: { vrai: false, correction: "Faux : elle montre l'empereur Justinien et sa cour." },
      explication: "La mosaïque de Saint-Vital représente Justinien avec sa cour. Théodose est l'empereur à la mort duquel l'empire est partagé, en 395.", source: S(2) },
    { id: "histoire-s01-1-q40", fiche: "histoire-s01-1-f5", type: "ordre", niveau: 3,
      enonce: "Range ces événements dans l'ordre du temps.",
      elements: ["Les Turcs prennent Constantinople", "Justinien conquiert Ravenne", "Au partage, Ravenne est dans l'Empire romain d'Occident", "L'Occident perd son dernier empereur"],
      reponse: [2, 3, 1, 0],
      explication: "395 : Ravenne est dans l'Occident ; 476 : l'Occident tombe ; entre 527 et 565 : Justinien la conquiert ; 1453 : Constantinople tombe.", source: S(2) },
    { id: "histoire-s01-1-q41", fiche: "histoire-s01-1-f5", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "La mosaïque de l'empereur ___ et de sa cour orne la basilique Saint-Vital de ___.",
      banque: ["Justinien", "Ravenne", "Théodose", "Rome"],
      reponse: [["Justinien"], ["Ravenne"]],
      explication: "Cette mosaïque montre Justinien et sa cour. Elle se trouve à Ravenne, conquise par Justinien.", source: S(2) }
  ],
  bonus: [
    {
      id: "histoire-s01-1-b1",
      fiche: "histoire-s01-1-f5",
      titre: "Théodora, face à Justinien",
      texte: "À Saint-Vital, deux grandes mosaïques se font face : Justinien avec sa cour, et son épouse, l'impératrice Théodora, entourée de ses dames d'honneur. Leur fond d'or est typique de l'art byzantin. Avec d'autres monuments de Ravenne, la basilique est inscrite au patrimoine mondial de l'UNESCO depuis 1996.",
      source: { titre: "Basilique Saint-Vital de Ravenne", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Basilique_Saint-Vital_de_Ravenne" }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre est laissé vide dans le support, la leçon est donnée dans la vidéo du cours.",
    "Ce qu'est l'édit de Thessalonique : la frise donne seulement son nom et sa date.",
    "Qui est Théodose : la carte dit seulement que le partage a lieu à sa mort.",
    "Les personnages et les objets de la mosaïque de Saint-Vital : la légende numérotée est à compléter pendant le cours.",
    "Le pouvoir de l'empereur byzantin, l'organisation de l'empire et la vie de ses habitants sous Justinien.",
    "Les raisons et le déroulement des conquêtes de Justinien : la carte en montre seulement l'étendue.",
    "La place de la religion chrétienne dans l'Empire byzantin : seul le titre de la frise parle d'empires chrétiens.",
    "Les Turcs et le déroulement de la prise de Constantinople : seule la date de 1453 est donnée."
  ]
};
