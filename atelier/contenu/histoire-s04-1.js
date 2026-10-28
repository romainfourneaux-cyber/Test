// Source en clair du cours histoire-s04-1 « Cours 5 – Empire abbasside et 2 études de document ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s04-1.
// Seule source : le support de la séance 5, pages 1 à 5 (frise, cartes, texte sur le ramadan, encadré sur le
// calendrier hégirien, cartes complétées des deux empires). Les pages 6 et 7 (devoir d'entraînement) servent
// seulement à délimiter le cours : rien n'en est tiré. La leçon est donnée en vidéo : voir nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 5 - Support et Devoir entrainement.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 5 – Empire abbasside et 2 études de document", titre, editeur: "Wikipédia", url });

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 560, A1 = 1300, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 30 540 190' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<text x='" + x(570) + "' y='48' fill='" + encre + "'>Mohamed (Mahomet), 570-632</text>";
  s += "<rect x='" + x(570) + "' y='54' width='" + (x(632) - x(570)) + "' height='10' fill='#a8848c'/>";
  s += "<line x1='" + x(622) + "' y1='64' x2='" + x(622) + "' y2='120' stroke='#8e2f4f' stroke-dasharray='3 2'/>";
  s += "<text x='" + (x(622) + 4) + "' y='80' fill='#8e2f4f'>622 : l'Hégire, an 1 du calendrier hégirien</text>";
  s += "<rect x='" + x(750) + "' y='96' width='" + (x(1258) - x(750)) + "' height='18' fill='#3f8a5a'/>";
  s += "<text x='" + ((x(750) + x(1258)) / 2) + "' y='109' text-anchor='middle' font-size='10' fill='#fff'>Empire abbasside, de Bagdad : 750-1258</text>";
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 600; a <= 1300; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  s += "<rect x='" + x(661) + "' y='142' width='" + (x(750) - x(661)) + "' height='14' fill='#9cc58a'/>";
  s += "<text x='" + x(661) + "' y='170' fill='" + encre + "'>Empire omeyyade, de Damas : 661-750</text>";
  s += "<line x1='" + x(929) + "' y1='120' x2='" + x(929) + "' y2='190' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(929) + "' cy='120' r='4' fill='#2f5e8e'/>";
  s += "<text x='" + (x(929) + 4) + "' y='202' fill='#2f5e8e'>929 : début du califat de Cordoue</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s04-1",
  fiches: [
    {
      id: "histoire-s04-1-f1", notion: "L'Empire abbasside (750-1258)",
      titre: "L'Empire abbasside, gouverné depuis Bagdad",
      texte: "La dynastie abbasside gouverne depuis Bagdad de 750 à 1258 : plus de cinq siècles. Sur la carte, son empire s'étend de l'Afrique du Nord jusqu'au-delà de la péninsule d'Arabie, vers l'est. Damas, Jérusalem, Médine et La Mecque s'y trouvent. Al Andalus, tout à l'ouest, n'en fait pas partie.",
      pointsCles: ["750-1258 : dynastie abbasside, à Bagdad", "Un empire immense, de l'Afrique du Nord à l'est de la péninsule d'Arabie et au-delà", "Dans l'empire : Damas, Jérusalem, Médine, La Mecque", "En dehors : Al Andalus, à l'ouest"],
      dates: [
        { annee: 750, evenement: "Début de la dynastie abbasside (Bagdad)" },
        { annee: 1258, evenement: "Fin de la dynastie abbasside" }
      ],
      lieux: ["Bagdad", "Damas", "Jérusalem", "Médine", "La Mecque", "Al Andalus"], personnages: [],
      vocabulaire: [
        { mot: "Al Andalus", def: "la région écrite tout à l'ouest de la carte, qui reste en dehors de l'Empire abbasside" }
      ],
      schema: "histoire-s04-1-s1", prerequis: ["histoire-s03-1-f2"], source: S(5)
    },
    {
      id: "histoire-s04-1-f2", notion: "L'Empire omeyyade comparé à l'Empire abbasside",
      titre: "Deux empires sur la carte : Omeyyades puis Abbassides",
      texte: "Avant les Abbassides, la dynastie omeyyade règne depuis Damas, de 661 à 750. Sur la carte, l'Empire omeyyade est encore plus vaste : il couvre toute l'Afrique du Nord et Al Andalus, à l'ouest. L'Empire abbasside, lui, ne comprend plus ni Al Andalus ni l'ouest de l'Afrique du Nord. En 929, d'ailleurs, commence le califat de Cordoue.",
      pointsCles: ["661-750 : Empire omeyyade, depuis Damas", "L'Empire omeyyade est plus étendu : il va jusqu'en Al Andalus", "L'Empire abbasside perd l'ouest : ni Al Andalus, ni l'ouest de l'Afrique du Nord", "929 : début du califat de Cordoue"],
      astuce: "Omeyyade = Ouest compris (jusqu'en Al Andalus) ; Abbasside = Bagdad, sans l'ouest.",
      dates: [
        { annee: 661, evenement: "Début de la dynastie omeyyade (Damas)" },
        { annee: 929, evenement: "Début du califat de Cordoue" }
      ],
      lieux: ["Damas", "Al Andalus", "Cordoue", "Afrique du Nord"], personnages: [],
      vocabulaire: [],
      schema: "histoire-s04-1-s1", prerequis: ["histoire-s04-1-f1", "histoire-s03-1-f3"], source: S(5)
    },
    {
      id: "histoire-s04-1-f3", notion: "Les lieux : La Mecque, Médine, Damas, Jérusalem, le Yarmouk",
      titre: "Quatre villes et une bataille sur la carte",
      texte: "La carte du cours place quatre villes. La Mecque et Médine se trouvent dans la péninsule d'Arabie. Damas et Jérusalem sont bien plus au nord, près de la Méditerranée, proches l'une de l'autre. La bataille du Yarmouk, étudiée comme document, est située juste au sud de Damas, non loin de Jérusalem.",
      pointsCles: ["Péninsule d'Arabie : La Mecque et Médine", "Plus au nord, près de la Méditerranée : Damas et Jérusalem, voisines", "Bataille du Yarmouk : entre Damas et Jérusalem"],
      dates: [],
      lieux: ["La Mecque", "Médine", "Damas", "Jérusalem", "Yarmouk"], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["histoire-s04-1-f1"], source: S(5)
    },
    {
      id: "histoire-s04-1-f4", notion: "Le calendrier hégirien",
      titre: "Un calendrier lunaire qui commence en 622",
      texte: "Le calendrier musulman est dit hégirien : son an 1 est l'année de l'Hégire, c'est-à-dire 622 dans notre calendrier. C'est un calendrier lunaire : ses 12 mois suivent la Lune et durent 29 ou 30 jours. Une année hégirienne compte donc 354 ou 355 jours, un peu moins qu'une année de notre calendrier.",
      pointsCles: ["An 1 = l'Hégire = 622", "Calendrier lunaire : 12 mois de 29 ou 30 jours", "354 ou 355 jours par an"],
      astuce: "Hégire, hégirien : le calendrier porte le nom de l'événement qui le commence.",
      dates: [
        { annee: 622, evenement: "L'Hégire, an 1 du calendrier hégirien" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "calendrier hégirien", def: "le calendrier musulman, dont l'an 1 est l'année de l'Hégire (622)" },
        { mot: "calendrier lunaire", def: "un calendrier dont les mois suivent la Lune : 12 mois de 29 ou 30 jours" }
      ],
      schema: null, prerequis: ["histoire-s03-1-f1"], source: S(3)
    },
    {
      id: "histoire-s04-1-f5", notion: "Un texte du Coran sur le jeûne du ramadan",
      titre: "Étude de document : le ramadan dans le Coran",
      texte: "Le texte étudié est un extrait du Coran, sourate 2, versets 183 à 185. Il traite du jeûne du mois de ramadan. Le jeûne y est prescrit aux croyants pour un nombre de jours fixé. Qui est malade ou en voyage jeûne plus tard. Le ramadan y est présenté comme le mois où le Coran a été révélé.",
      pointsCles: ["Un extrait du Coran : sourate 2, versets 183-185", "Sujet : le jeûne du mois de ramadan", "Malade ou en voyage : on jeûne plus tard", "Selon le texte, le Coran a été révélé pendant ce mois"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "sourate", def: "une des grandes parties numérotées du Coran ; le texte étudié vient de la sourate 2" },
        { mot: "verset", def: "une des phrases numérotées d'une sourate, comme les versets 183 à 185" },
        { mot: "jeûne", def: "le fait de se priver de nourriture pendant un temps donné" }
      ],
      schema: null, prerequis: [], source: S(2)
    }
  ],
  schemas: [
    { id: "histoire-s04-1-s1", legende: "Omeyyades, Abbassides et califat de Cordoue, de 570 à 1258 (frise redessinée d'après le support).", svg: frise() }
  ],
  questions: [
    // f1 : l'Empire abbasside
    { id: "histoire-s04-1-q1", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 1,
      enonce: "Depuis quelle ville la dynastie abbasside gouverne-t-elle son empire ?",
      choix: ["Bagdad", "Damas", "Cordoue", "La Mecque"],
      reponse: "Bagdad",
      explication: "La dynastie abbasside gouverne depuis Bagdad, de 750 à 1258. Damas était la ville de la dynastie omeyyade.", source: S(1) },
    { id: "histoire-s04-1-q2", fiche: "histoire-s04-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La dynastie abbasside règne de 750 à 1258.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : elle commence en 750, quand s'arrête la dynastie omeyyade, et dure jusqu'en 1258.", source: S(1) },
    { id: "histoire-s04-1-q3", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi Bagdad est-elle célèbre au temps des Abbassides ?",
      choix: ["Une ville immense et riche, où des savants traduisent et étudient les sciences", "C'est surtout une forteresse militaire, sans marchands ni savants, bâtie contre les Byzantins", "C'est la capitale de l'Empire byzantin, après Constantinople", "C'est un petit port de pêcheurs sur la Méditerranée"],
      reponse: "Une ville immense et riche, où des savants traduisent et étudient les sciences",
      explication: "Fondée en 762 par le calife Al-Mansur, Bagdad devient la capitale des Abbassides et compte peut-être un million d'habitants. Ses marchands commercent jusqu'en Inde et en Chine, et sa Maison de la sagesse traduit les livres des savants grecs.",
      source: T("Bagdad", "https://fr.wikipedia.org/wiki/Bagdad") },
    { id: "histoire-s04-1-q4", fiche: "histoire-s04-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles villes font partie de l'Empire abbasside ? (plusieurs réponses)",
      choix: ["Damas", "Jérusalem", "Médine", "La Mecque", "Cordoue", "Constantinople"],
      reponse: ["Damas", "Jérusalem", "Médine", "La Mecque"],
      explication: "Damas, Jérusalem, Médine et La Mecque sont dans l'empire. Cordoue est à l'ouest, hors de l'empire, et Constantinople reste la capitale de l'Empire byzantin.", source: S(5) },
    { id: "histoire-s04-1-q5", fiche: "histoire-s04-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Al Andalus, tout à l'ouest, fait partie de l'Empire abbasside.",
      corrections: ["Faux : Al Andalus, tout à l'ouest, reste en dehors de l'Empire abbasside.", "Faux : Al Andalus est la capitale de l'Empire abbasside.", "Faux : Al Andalus se trouve dans la péninsule d'Arabie, au cœur de l'empire."],
      reponse: { vrai: false, correction: "Faux : Al Andalus, tout à l'ouest, reste en dehors de l'Empire abbasside." },
      explication: "Al Andalus est tout à l'ouest, au-delà des terres des Abbassides. L'Empire abbasside ne l'englobe pas : en 929, un califat rival y commence même, à Cordoue.", source: S(5) },
    { id: "histoire-s04-1-q6", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 2,
      enonce: "Quelle est l'étendue de l'Empire abbasside ?",
      choix: ["Un vaste empire, de l'Afrique du Nord jusque loin vers l'est", "Un petit territoire qui entoure seulement la ville de Bagdad et ses environs", "Un empire limité à la péninsule d'Arabie", "Un empire qui couvre l'Europe de l'Ouest"],
      reponse: "Un vaste empire, de l'Afrique du Nord jusque loin vers l'est",
      explication: "L'empire part de l'Afrique du Nord, englobe la péninsule d'Arabie et continue loin vers l'est. Il est immense.", source: S(5) },
    { id: "histoire-s04-1-q7", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 3,
      enonce: "En l'an 1000, quelle dynastie règne à Bagdad ?",
      choix: ["La dynastie abbasside", "La dynastie omeyyade", "Le califat de Cordoue", "L'Empire carolingien"],
      reponse: "La dynastie abbasside",
      explication: "La dynastie abbasside règne à Bagdad de 750 à 1258 : l'an 1000 est dans cette période. La dynastie omeyyade s'est arrêtée en 750.", indice: "Regarde les dates de la dynastie abbasside sur la frise.", source: S(1) },
    { id: "histoire-s04-1-q8", fiche: "histoire-s04-1-f1", type: "vrai_faux", niveau: 3,
      enonce: "En 1300, la dynastie abbasside règne encore à Bagdad.",
      corrections: ["Faux : elle s'arrête en 1258, donc avant 1300.", "Faux : elle s'arrête en 750, quand commence la dynastie omeyyade.", "Faux : elle ne commence qu'en 1300."],
      reponse: { vrai: false, correction: "Faux : elle s'arrête en 1258, donc avant 1300." },
      explication: "La dynastie abbasside dure jusqu'en 1258. En 1300, elle a donc disparu depuis une quarantaine d'années.", source: S(1) },
    // f2 : Omeyyades et Abbassides
    { id: "histoire-s04-1-q9", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelle dynastie règne depuis Damas de 661 à 750 ?",
      choix: ["La dynastie omeyyade", "La dynastie abbasside", "La dynastie carolingienne", "La dynastie byzantine"],
      reponse: "La dynastie omeyyade",
      explication: "La dynastie omeyyade règne à Damas de 661 à 750. La dynastie abbasside lui succède à Bagdad.", source: S(1) },
    { id: "histoire-s04-1-q10", fiche: "histoire-s04-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "L'Empire omeyyade est plus vaste que l'Empire abbasside.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'Empire omeyyade s'étend en plus sur Al Andalus et sur tout l'ouest de l'Afrique du Nord.", source: S(5) },
    { id: "histoire-s04-1-q11", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 2,
      enonce: "Quel territoire appartient à l'Empire omeyyade mais pas à l'Empire abbasside ?",
      choix: ["Al Andalus", "La péninsule d'Arabie", "La région de Damas et de Jérusalem", "La région de Bagdad"],
      reponse: "Al Andalus",
      explication: "Al Andalus, à l'ouest, est dans l'Empire omeyyade et en dehors de l'Empire abbasside. L'Arabie et la région de Damas sont dans les deux.", source: S(5) },
    { id: "histoire-s04-1-q12", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelle ville est la capitale d'Al Andalus, l'Espagne musulmane ?",
      choix: ["Cordoue", "Damas", "Bagdad", "Jérusalem"],
      reponse: "Cordoue",
      explication: "Cordoue est la capitale de l'émirat d'Al Andalus à partir de 756, puis du califat de Cordoue à partir de 929. Damas et Bagdad sont les capitales des Omeyyades puis des Abbassides, bien plus à l'est.",
      source: T("Cordoue", "https://fr.wikipedia.org/wiki/Cordoue") },
    { id: "histoire-s04-1-q13", fiche: "histoire-s04-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets ces repères dans l'ordre du temps.",
      elements: ["Début de la dynastie abbasside à Bagdad", "L'Hégire", "Début de la dynastie omeyyade à Damas", "Début du califat de Cordoue"],
      reponse: [1, 2, 0, 3],
      explication: "622 : l'Hégire ; 661 : les Omeyyades à Damas ; 750 : les Abbassides à Bagdad ; 929 : le califat de Cordoue.", source: S(1) },
    { id: "histoire-s04-1-q14", fiche: "histoire-s04-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'Empire omeyyade et l'Empire abbasside existent en même temps, l'un à Damas et l'autre à Bagdad.",
      corrections: ["Faux : la dynastie abbasside succède à la dynastie omeyyade en 750.", "Faux : ils existent en même temps, mais tous les deux à Bagdad.", "Faux : la dynastie omeyyade succède à la dynastie abbasside en 1258."],
      reponse: { vrai: false, correction: "Faux : la dynastie abbasside succède à la dynastie omeyyade en 750." },
      explication: "Les deux dynasties se suivent : les Omeyyades jusqu'en 750, puis les Abbassides. Elles ne règnent pas en même temps.", source: S(1) },
    { id: "histoire-s04-1-q15", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que l'Empire omeyyade est plus étendu que l'Empire abbasside ?",
      choix: ["Il comprend en plus Al Andalus et l'ouest de l'Afrique du Nord", "Il comprend en plus toute la péninsule d'Arabie", "Il comprend en plus la ville de Damas", "Il comprend en plus Bagdad et Jérusalem"],
      reponse: "Il comprend en plus Al Andalus et l'ouest de l'Afrique du Nord",
      explication: "Les deux empires ont l'Arabie, Damas et Jérusalem. Seul l'Empire omeyyade va jusqu'en Al Andalus et à l'ouest de l'Afrique du Nord.", source: S(5) },
    { id: "histoire-s04-1-q16", fiche: "histoire-s04-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque repère à ce qui le caractérise.",
      gauche: ["Dynastie omeyyade", "Dynastie abbasside", "Califat de Cordoue", "Hégire"],
      droite: ["An 1 du calendrier hégirien, en 622", "Damas, de 661 à 750", "Bagdad, de 750 à 1258", "Commence en 929"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Omeyyades à Damas (661-750), Abbassides à Bagdad (750-1258), califat de Cordoue à partir de 929. L'Hégire, en 622, ouvre le calendrier hégirien.", source: S(1) },
    // f3 : les lieux
    { id: "histoire-s04-1-q17", fiche: "histoire-s04-1-f3", type: "qcm", niveau: 1,
      enonce: "Où se trouvent La Mecque et Médine ?",
      choix: ["Dans la péninsule d'Arabie", "Plus au nord, près de Damas", "En Afrique du Nord", "En Al Andalus"],
      reponse: "Dans la péninsule d'Arabie",
      explication: "La Mecque et Médine sont toutes les deux dans la péninsule d'Arabie. Damas et Jérusalem sont plus au nord.", source: S(5) },
    { id: "histoire-s04-1-q18", fiche: "histoire-s04-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Damas et Jérusalem sont deux villes voisines, au nord de la péninsule d'Arabie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les deux villes sont proches l'une de l'autre, près de la Méditerranée. La bataille du Yarmouk a lieu entre elles.", source: S(5) },
    { id: "histoire-s04-1-q19", fiche: "histoire-s04-1-f3", type: "qcm", niveau: 2,
      enonce: "Près de quelles villes la bataille du Yarmouk est-elle située ?",
      choix: ["Damas et Jérusalem", "La Mecque et Médine", "Bagdad et Cordoue", "Rome et Constantinople"],
      reponse: "Damas et Jérusalem",
      explication: "La carte place la bataille du Yarmouk juste au sud de Damas, non loin de Jérusalem. La Mecque et Médine sont bien plus au sud.", source: S(5) },
    { id: "histoire-s04-1-q20", fiche: "histoire-s04-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "La bataille du Yarmouk est située dans la péninsule d'Arabie, entre La Mecque et Médine.",
      corrections: ["Faux : elle est située plus au nord, entre Damas et Jérusalem.", "Faux : elle est située en Al Andalus, tout à l'ouest.", "Faux : elle est située à Bagdad."],
      reponse: { vrai: false, correction: "Faux : elle est située plus au nord, entre Damas et Jérusalem." },
      explication: "Le Yarmouk est bien plus au nord, entre Damas et Jérusalem. La Mecque et Médine sont dans la péninsule d'Arabie, au sud.", source: S(5) },
    { id: "histoire-s04-1-q22", fiche: "histoire-s04-1-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi la bataille du Yarmouk, en 636, est-elle importante ?",
      choix: ["L'armée du califat y bat les Byzantins : la Syrie passe sous domination musulmane", "L'Empire byzantin y reprend Damas et Jérusalem et chasse les armées du califat de toute la Syrie", "Elle marque la fin de la dynastie omeyyade et le début des Abbassides", "Charlemagne y arrête une armée venue d'Al Andalus"],
      reponse: "L'armée du califat y bat les Byzantins : la Syrie passe sous domination musulmane",
      explication: "En août 636, près de la rivière Yarmouk, l'armée du califat remporte une victoire décisive sur celle de l'Empire byzantin. Les Byzantins perdent alors pour de bon la Syrie et la Palestine, où se trouvent Damas et Jérusalem.",
      source: T("Bataille du Yarmouk", "https://fr.wikipedia.org/wiki/Bataille_du_Yarmouk") },
    { id: "histoire-s04-1-q23", fiche: "histoire-s04-1-f3", type: "qcm", niveau: 3,
      enonce: "Un voyageur part de La Mecque pour rejoindre Damas. Dans quelle direction va-t-il surtout ?",
      choix: ["Vers le nord", "Vers le sud", "Vers l'ouest", "Vers l'est"],
      reponse: "Vers le nord",
      explication: "La Mecque est dans la péninsule d'Arabie et Damas bien plus au nord. Le voyageur remonte donc vers le nord.", indice: "Repère les deux villes sur la carte : laquelle est en haut ?", source: S(5) },
    // f4 : le calendrier hégirien
    { id: "histoire-s04-1-q25", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 1,
      enonce: "Quel événement marque l'an 1 du calendrier hégirien ?",
      choix: ["L'Hégire", "La naissance de Mohamed", "Le début de la dynastie omeyyade", "Le début de la dynastie abbasside"],
      reponse: "L'Hégire",
      explication: "Le calendrier hégirien commence avec l'Hégire, en 622. C'est de là qu'il tire son nom.", source: S(3) },
    { id: "histoire-s04-1-q26", fiche: "histoire-s04-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le calendrier hégirien est un calendrier lunaire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : ses mois suivent la Lune. Ils durent 29 ou 30 jours.", source: S(3) },
    { id: "histoire-s04-1-q27", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 2,
      enonce: "Combien de jours compte une année hégirienne ?",
      choix: ["354 ou 355", "365 ou 366", "360 exactement", "300 exactement"],
      reponse: "354 ou 355",
      explication: "Une année hégirienne compte 354 ou 355 jours. C'est un peu moins qu'une année de notre calendrier.", source: S(3) },
    { id: "histoire-s04-1-q28", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi une année hégirienne est-elle plus courte qu'une année de notre calendrier ?",
      choix: ["Ses 12 mois suivent la Lune et durent 29 ou 30 jours", "Elle ne compte que 10 mois au lieu de 12", "Elle commence en 622 et non en l'an 1", "Ses mois durent tous exactement 31 jours"],
      reponse: "Ses 12 mois suivent la Lune et durent 29 ou 30 jours",
      explication: "Douze mois de 29 ou 30 jours font 354 ou 355 jours. C'est moins que nos douze mois, plus longs.", source: S(3) },
    { id: "histoire-s04-1-q29", fiche: "histoire-s04-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Une année hégirienne compte 12 mois de 31 jours.",
      corrections: ["Faux : 12 mois lunaires de 29 ou 30 jours.", "Faux : 10 mois lunaires de 35 jours.", "Faux : 13 mois de 28 jours."],
      reponse: { vrai: false, correction: "Faux : 12 mois lunaires de 29 ou 30 jours." },
      explication: "Les mois hégiriens suivent la Lune : ils durent 29 ou 30 jours. Il y en a bien douze.", source: S(3) },
    { id: "histoire-s04-1-q31", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 3,
      enonce: "Une année hégirienne a une dizaine de jours de moins que la nôtre. Que se passe-t-il, d'une année à l'autre, pour le début d'un même mois hégirien dans notre calendrier ?",
      choix: ["Il arrive une dizaine de jours plus tôt chaque année", "Il tombe toujours à la même date", "Il arrive une dizaine de jours plus tard chaque année", "Il change seulement tous les cent ans"],
      reponse: "Il arrive une dizaine de jours plus tôt chaque année",
      explication: "L'année hégirienne est plus courte, donc le mois suivant commence plus tôt que l'année d'avant. L'écart est d'environ dix jours par an.", indice: "Une année plus courte se termine plus tôt.", source: S(3) },
    { id: "histoire-s04-1-q32", fiche: "histoire-s04-1-f4", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Le calendrier hégirien est ___ : il compte ___ mois de 29 ou 30 jours.",
      banque: ["lunaire", "12", "solaire", "10"],
      reponse: [["lunaire"], ["12"]],
      explication: "C'est un calendrier lunaire de 12 mois. Chaque mois dure 29 ou 30 jours.", source: S(3) },
    // f5 : le texte du Coran
    { id: "histoire-s04-1-q33", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle le livre de l'islam, dont vient le texte sur le ramadan ?",
      choix: ["Le Coran", "Les Annales d'Eginhard", "Une chronique byzantine", "Le Rustican"],
      reponse: "Le Coran",
      explication: "Le livre de l'islam est le Coran ; le texte étudié en vient. Eginhard a écrit sur Charlemagne, et le Rustican décrit les travaux des paysans.", source: S(2) },
    { id: "histoire-s04-1-q34", fiche: "histoire-s04-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le ramadan est un mois du calendrier musulman pendant lequel les musulmans jeûnent le jour.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le ramadan est un mois du calendrier hégirien, et le texte étudié parle du jeûne de ce mois. Jeûner, c'est se priver de nourriture pendant un temps donné.", source: S(2) },
    { id: "histoire-s04-1-q35", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on une grande partie numérotée du Coran ?",
      choix: ["Une sourate", "Un verset", "Un chapitre des Annales", "Une chronique"],
      reponse: "Une sourate",
      explication: "Le Coran est divisé en sourates : le texte sur le ramadan vient de la sourate 2. Les versets sont les phrases numérotées à l'intérieur d'une sourate.", source: S(2) },
    { id: "histoire-s04-1-q36", fiche: "histoire-s04-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le minaret est la tour d'une mosquée.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le minaret est une tour qui domine la mosquée et les bâtiments autour. De là-haut, le muezzin lance l'appel à la prière.",
      source: T("Minaret", "https://fr.wikipedia.org/wiki/Minaret") },
    { id: "histoire-s04-1-q37", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "En quelle langue le Coran est-il écrit ?",
      choix: ["En arabe", "En grec", "En latin", "En persan"],
      reponse: "En arabe",
      explication: "Le Coran, le livre de l'islam, est écrit en arabe : son nom veut dire « la récitation ». Le grec est la langue de l'Empire byzantin et le latin celle de l'Église d'Occident.",
      source: T("Coran", "https://fr.wikipedia.org/wiki/Coran") },
    { id: "histoire-s04-1-q39", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "Que signifie « jeûner » ?",
      choix: ["Se priver de nourriture pendant un temps donné", "Voyager pendant tout un mois", "Donner de la nourriture à un pauvre", "Lire le Coran chaque jour"],
      reponse: "Se priver de nourriture pendant un temps donné",
      explication: "Jeûner, c'est se priver de nourriture pendant un temps donné. Le texte étudié parle du jeûne du mois de ramadan.", source: S(2) },
  ],
  bonus: [
    {
      id: "histoire-s04-1-b1",
      fiche: "histoire-s04-1-f1",
      titre: "Bagdad, la ville ronde",
      texte: "Bagdad est fondée en 762 par le calife abbasside Al-Mansur, qui la nomme « la cité de la paix ». On l'appelle aussi la ville ronde : une double muraille circulaire, percée de quatre portes, entourait le palais du calife au centre. Les travaux auraient mobilisé cent mille ouvriers pendant quatre ans.",
      source: { titre: "Bagdad", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Bagdad" }
    }
  ],
  nonCouvert: [
    "La leçon sur l'Empire abbasside (son organisation, le rôle de Bagdad, le commerce, les savants) : elle est donnée en vidéo, le support n'a que la frise et les cartes.",
    "Les mots importants des pages 1 et 4 (calife, califat, dynastie, émirat…) : les cadres sont vides.",
    "La bataille du Yarmouk : sa date, ses adversaires et son issue ne sont pas écrits ; seule sa place sur la carte est donnée.",
    "Les noms des régions des deux empires : les cartes n'ont ni légende ni nom de région, sauf Al Andalus et quatre villes.",
    "Les réponses écrites aux trois questions sur le texte du ramadan et les notes de la page 3, prises pendant la vidéo.",
    "Les croyances et les pratiques de l'islam en général : le support n'en traite qu'à travers l'extrait sur le jeûne.",
    "Le devoir d'entraînement des pages 6 et 7 (cinq piliers, « Serviteur », carte à compléter) sert seulement à délimiter le cours : rien n'en est tiré."
  ]
};
