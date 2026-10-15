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
      indice: "C'est quinze ans après l'édit de Thessalonique.", source: S(1) },
    { id: "histoire-s01-1-q2", fiche: "histoire-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "En 395, Constantinople se trouve dans l'Empire romain d'Occident.",
      corrections: ["Faux : Constantinople est dans l'Empire romain d'Orient, à l'est.", "Faux : Constantinople est en dehors de l'Empire romain.", "Faux : Constantinople est la capitale de l'Occident."],
      reponse: { vrai: false, correction: "Faux : Constantinople est dans l'Empire romain d'Orient, à l'est." },
      explication: "Sur la carte du partage, Constantinople est dans la moitié est. C'est l'Empire romain d'Orient.", source: S(1) },
    { id: "histoire-s01-1-q3", fiche: "histoire-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on d'un « partage » de l'Empire romain en 395 ?",
      choix: ["Parce que l'empire est coupé en deux : l'Occident et l'Orient", "Parce que Justinien conquiert l'empire", "Parce que les Turcs prennent Constantinople", "Parce que Byzance change de nom"],
      reponse: "Parce que l'empire est coupé en deux : l'Occident et l'Orient",
      explication: "À la mort de Théodose, l'empire est divisé en deux moitiés. L'une est à l'ouest, l'autre à l'est.", source: S(1) },
    { id: "histoire-s01-1-q4", fiche: "histoire-s01-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur le partage de 395.",
      texte: "À l'ouest, l'Empire romain d'___, avec Rome ; à l'est, l'Empire romain d'___, avec Constantinople.",
      banque: ["Occident", "Orient", "Afrique", "Italie"],
      reponse: [["Occident"], ["Orient"]],
      explication: "L'ouest, c'est l'Occident, avec Rome et Ravenne. L'est, c'est l'Orient, avec Constantinople.", source: S(1) },
    // f2 : 476 et 1453
    { id: "histoire-s01-1-q5", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 1,
      enonce: "Que se passe-t-il en 476, d'après la frise ?",
      choix: ["La chute du dernier empereur romain d'Occident", "La prise de Constantinople par les Turcs", "Le début du règne de Justinien", "Le partage de l'Empire romain"],
      reponse: "La chute du dernier empereur romain d'Occident",
      explication: "En 476, l'Empire romain d'Occident perd son dernier empereur. Des royaumes germaniques prennent sa place.", source: S(1) },
    { id: "histoire-s01-1-q6", fiche: "histoire-s01-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "L'Empire romain d'Orient disparaît en 476, en même temps que celui d'Occident.",
      corrections: ["Faux : il dure jusqu'en 1453, quand les Turcs prennent Constantinople.", "Faux : il disparaît dès 395.", "Faux : il disparaît en 527, avec Justinien."],
      reponse: { vrai: false, correction: "Faux : il dure jusqu'en 1453, quand les Turcs prennent Constantinople." },
      explication: "Seul l'Occident tombe en 476. L'Orient continue jusqu'en 1453.", source: S(1) },
    { id: "histoire-s01-1-q7", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment l'Empire romain d'Orient prend-il fin ?",
      choix: ["Les Turcs prennent Constantinople en 1453", "Théodose meurt en 395", "Il perd son dernier empereur en 476", "Justinien meurt en 565"],
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
    // f3 : Byzance, Constantinople, Istanbul
    { id: "histoire-s01-1-q10", fiche: "histoire-s01-1-f3", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les noms successifs de la ville.",
      elements: ["Istanbul", "Byzance", "Constantinople"],
      reponse: [1, 2, 0],
      explication: "La ville s'appelle d'abord Byzance, puis Constantinople. Aujourd'hui, c'est Istanbul.", source: S(3) },
    { id: "histoire-s01-1-q11", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 1,
      enonce: "D'où vient le nom de Constantinople ?",
      choix: ["De l'empereur Constantin", "De l'empereur Justinien", "De Théodose", "Des Turcs"],
      reponse: "De l'empereur Constantin",
      explication: "Au IVe siècle, la ville prend le nom de l'empereur Constantin. Il voulait en faire une Rome de l'Orient.", source: S(3) },
    { id: "histoire-s01-1-q12", fiche: "histoire-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Byzance était à l'origine une colonie grecque.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Byzance naît comme colonie grecque, au VIe siècle avant Jésus-Christ.", source: S(3) },
    { id: "histoire-s01-1-q13", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on d'« Empire byzantin » pour l'Empire romain d'Orient ?",
      choix: ["En souvenir de Byzance, l'ancien nom de sa capitale", "Parce que son premier empereur s'appelait Byzantin", "Parce qu'il a été fondé par les Turcs", "Parce qu'il se trouve à l'ouest de Rome"],
      reponse: "En souvenir de Byzance, l'ancien nom de sa capitale",
      explication: "Byzance est l'ancien nom de Constantinople. Le mot « byzantin » rappelle ce nom.", source: S(3) },
    { id: "histoire-s01-1-q14", fiche: "histoire-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Constantinople n'est la capitale de l'Empire romain d'Orient que de 395 à 476.",
      corrections: ["Faux : elle l'est de 395 à 1453.", "Faux : elle ne l'est jamais.", "Faux : elle l'est seulement à partir de 1453."],
      reponse: { vrai: false, correction: "Faux : elle l'est de 395 à 1453." },
      explication: "476 marque la chute de l'Occident, pas celle de l'Orient. Constantinople reste la capitale jusqu'en 1453.", source: S(3) },
    { id: "histoire-s01-1-q15", fiche: "histoire-s01-1-f3", type: "trou", niveau: 3,
      enonce: "Écris le nom actuel de la ville.",
      texte: "Aujourd'hui, l'ancienne Byzance porte le nom d'___.",
      reponse: [["Istanbul"]],
      explication: "Byzance, puis Constantinople, s'appelle aujourd'hui Istanbul. La ville se trouve en Turquie.", source: S(3) },
    // f4 : Justinien et ses conquêtes
    { id: "histoire-s01-1-q16", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 1,
      enonce: "Quand Justinien règne-t-il ?",
      choix: ["De 527 à 565", "De 395 à 476", "De 768 à 814", "De 380 à 395"],
      reponse: "De 527 à 565",
      explication: "La frise place le règne de Justinien de 527 à 565. Il dirige alors l'Empire byzantin.", source: S(1) },
    { id: "histoire-s01-1-q17", fiche: "histoire-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Les conquêtes de Justinien se font vers l'ouest de la Méditerranée.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : sur la carte, ses conquêtes s'étendent à l'ouest de l'empire de 527. Ravenne en fait partie.", source: S(2) },
    { id: "histoire-s01-1-q18", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment l'Empire byzantin change-t-il sous le règne de Justinien ?",
      choix: ["Il s'agrandit vers l'ouest grâce à des conquêtes", "Il est coupé en deux", "Il perd Constantinople", "Il est remplacé par des royaumes germaniques"],
      reponse: "Il s'agrandit vers l'ouest grâce à des conquêtes",
      explication: "Justinien conquiert des terres à l'ouest de la Méditerranée. L'empire devient bien plus vaste.", source: S(2) },
    { id: "histoire-s01-1-q19", fiche: "histoire-s01-1-f4", type: "qcm", niveau: 3,
      enonce: "En 395, Ravenne est dans l'Empire romain d'Occident. Sous Justinien, à quel empire appartient-elle ?",
      choix: ["À l'Empire byzantin, qui l'a conquise", "Toujours à l'Empire romain d'Occident", "À l'Empire carolingien", "À aucun empire"],
      reponse: "À l'Empire byzantin, qui l'a conquise",
      explication: "La carte des conquêtes de Justinien inclut Ravenne. L'Empire byzantin reprend donc une ville de l'ancien Occident.", source: S(2) },
    // f5 : la mosaïque de Saint-Vital
    { id: "histoire-s01-1-q20", fiche: "histoire-s01-1-f5", type: "qcm", niveau: 1,
      enonce: "Où se trouve la mosaïque de l'empereur Justinien et de sa cour vue en cours ?",
      choix: ["Dans la basilique Saint-Vital de Ravenne", "Dans une église de Rome", "Dans un palais d'Aix-la-Chapelle", "Dans une église d'Istanbul"],
      reponse: "Dans la basilique Saint-Vital de Ravenne",
      explication: "La mosaïque orne la basilique Saint-Vital. Elle se trouve à Ravenne.", source: S(2) },
    { id: "histoire-s01-1-q21", fiche: "histoire-s01-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "La mosaïque de Saint-Vital montre l'empereur Justinien entouré de sa cour.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est le sujet de cette mosaïque. Elle orne la basilique Saint-Vital, à Ravenne.", source: S(2) },
    { id: "histoire-s01-1-q22", fiche: "histoire-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "La basilique Saint-Vital se trouve à Constantinople.",
      corrections: ["Faux : elle se trouve à Ravenne, une ville conquise par Justinien.", "Faux : elle se trouve à Rome.", "Faux : elle se trouve à Aix-la-Chapelle."],
      reponse: { vrai: false, correction: "Faux : elle se trouve à Ravenne, une ville conquise par Justinien." },
      explication: "Saint-Vital est à Ravenne. Cette ville fait partie des conquêtes de Justinien.", source: S(2) },
    { id: "histoire-s01-1-q23", fiche: "histoire-s01-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi trouve-t-on une image de Justinien à Ravenne, loin de Constantinople ?",
      choix: ["Parce que Ravenne fait partie de ses conquêtes", "Parce que Ravenne est la capitale de l'Empire byzantin", "Parce que la mosaïque date de 1453", "Parce que Ravenne n'appartient à aucun empire"],
      reponse: "Parce que Ravenne fait partie de ses conquêtes",
      explication: "Justinien a conquis Ravenne. La ville entre alors dans l'Empire byzantin.", source: S(2) }
  ],
  bonus: [],
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
