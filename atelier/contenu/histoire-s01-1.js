// Source en clair du cours histoire-s01-1 « Cours 1 – Empire byzantin au temps de Justinien ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s01-1.
// Sources : le support de la séance 1 (cartes, frise, mosaïque, mémento) pour les fiches f1, f2, f4 et f5 ;
// le programme officiel de 5e (règle du 28/10/2026) pour les fiches f3, f6, f7 et f8, dont les faits ont été
// vérifiés sur les pages citées. La leçon elle-même est donnée en vidéo et n'est pas déposée : voir nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 1 - Support.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 1 – Empire byzantin au temps de Justinien", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel et page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "Byzance et l'Europe carolingienne", titre, editeur: "Wikipédia", url });
const U_CONST = "https://fr.wikipedia.org/wiki/Constantinople";
const U_BYZ = "https://fr.wikipedia.org/wiki/Empire_byzantin";
const U_BASIL = "https://fr.wikipedia.org/wiki/Basileus";
const U_CORPUS = "https://fr.wikipedia.org/wiki/Corpus_juris_civilis";
const U_JUST = "https://fr.wikipedia.org/wiki/Justinien_Ier";
const U_SOPHIE = "https://fr.wikipedia.org/wiki/Sainte-Sophie_(Constantinople)";
const U_NIKA = "https://fr.wikipedia.org/wiki/S%C3%A9dition_Nika";
const U_VITAL = "https://fr.wikipedia.org/wiki/Basilique_Saint-Vital_de_Ravenne";

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
      id: "histoire-s01-1-f3", notion: "Constantinople, la capitale",
      titre: "Constantinople : une ville, trois noms",
      texte: "Sur le site de Byzance, une vieille colonie grecque, l'empereur Constantin fonde en 330 une « Nouvelle Rome » : Constantinople. Bâtie sur sept collines au bord du Bosphore, c'est la plus grande ville d'Europe pendant neuf siècles. Les croisés la pillent en 1204 ; les Ottomans de Mehmed II la prennent le 29 mai 1453. Aujourd'hui, elle s'appelle Istanbul.",
      pointsCles: ["330 : Constantin fonde Constantinople, la « Nouvelle Rome », à la place de Byzance", "De 395 à 1453 : capitale de l'Empire romain d'Orient, dit aussi Empire byzantin", "1204 : les croisés pillent la ville ; 29 mai 1453 : les Ottomans de Mehmed II la prennent", "Istanbul : son nom aujourd'hui, en Turquie"],
      astuce: "Trois noms dans l'ordre : Byzance, Constantinople, Istanbul. « Byzantin » vient de Byzance.",
      dates: [
        { annee: 330, evenement: "Constantin fonde Constantinople" },
        { annee: 1204, evenement: "Les croisés pillent Constantinople" },
        { annee: 1453, evenement: "Les Ottomans prennent Constantinople" }
      ],
      lieux: ["Byzance", "Constantinople", "Istanbul", "Bosphore"], personnages: ["Constantin", "Mehmed II"],
      vocabulaire: [
        { mot: "Empire byzantin", def: "un autre nom de l'Empire romain d'Orient, tiré de Byzance, l'ancien nom de sa capitale" },
        { mot: "Ottomans", def: "les Turcs dont le sultan Mehmed II prend Constantinople en 1453" }
      ],
      schema: null, prerequis: ["histoire-s01-1-f1"], source: P("Constantinople", U_CONST)
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
    },
    {
      id: "histoire-s01-1-f6", notion: "Le basileus, empereur byzantin",
      titre: "Le basileus : un empereur tout-puissant",
      texte: "À Constantinople, l'empereur s'appelle le basileus, « roi » en grec. Il commande l'armée, fait la loi et se présente comme le lieutenant de Dieu sur terre ; c'est le patriarche de Constantinople qui le couronne. Lui seul porte la pourpre, un rouge violet réservé au pouvoir. Jeter à terre une pièce frappée à son image est déjà une offense.",
      pointsCles: ["Basileus : « roi » en grec ; Héraclius adopte ce titre en 629", "Il commande l'armée, fait la loi et se dit lieutenant de Dieu", "Il est couronné par le patriarche de Constantinople", "La pourpre : la couleur que lui seul peut porter"],
      astuce: "Basileus, pourpre, patriarche : trois mots pour dire que l'empereur est au-dessus de tous.",
      dates: [{ annee: 629, evenement: "Héraclius prend le titre de basileus" }],
      lieux: ["Constantinople"], personnages: ["Héraclius", "Justinien"],
      vocabulaire: [
        { mot: "basileus", def: "« roi » en grec ; le titre de l'empereur byzantin" },
        { mot: "pourpre", def: "une couleur rouge violet réservée à l'empereur byzantin" },
        { mot: "patriarche de Constantinople", def: "le chef de l'Église à Constantinople ; c'est lui qui couronne le basileus" }
      ],
      schema: null, prerequis: ["histoire-s01-1-f4"], source: P("Basileus", U_BASIL)
    },
    {
      id: "histoire-s01-1-f7", notion: "Le Code de Justinien",
      titre: "Le Code de Justinien : les lois romaines mises en ordre",
      texte: "Les lois romaines s'étaient accumulées pendant des siècles et se contredisaient. Entre 529 et 534, Justinien charge le juriste Tribonien de les trier et de les classer. Le Code de Justinien rassemble les lois des empereurs, les avis des juristes et un manuel pour les étudiants. Redécouvert à Bologne au XIe siècle, il inspire le droit de l'Europe.",
      pointsCles: ["529-534 : Justinien fait rassembler et classer les lois romaines", "Le juriste Tribonien dirige le travail", "Trois parties principales : le Code (lois des empereurs), le Digeste (avis des juristes), les Institutes (manuel)", "Redécouvert à Bologne au XIe siècle, il inspire le droit de l'Europe"],
      dates: [
        { annee: 529, evenement: "Première publication du Code de Justinien" },
        { annee: 534, evenement: "Version définitive du Code de Justinien" }
      ],
      lieux: ["Constantinople", "Bologne"], personnages: ["Justinien", "Tribonien"],
      vocabulaire: [
        { mot: "juriste", def: "un spécialiste du droit, c'est-à-dire des lois" },
        { mot: "Code de Justinien", def: "le recueil des lois romaines triées et classées sur l'ordre de Justinien, entre 529 et 534" }
      ],
      schema: null, prerequis: ["histoire-s01-1-f4"], source: P("Corpus juris civilis", U_CORPUS)
    },
    {
      id: "histoire-s01-1-f8", notion: "Sainte-Sophie (532-537)",
      titre: "Sainte-Sophie, le chantier géant de Justinien",
      texte: "Janvier 532 : Constantinople brûle pendant la révolte Nika, la vieille Sainte-Sophie part en fumée. Justinien garde le trône et lance un chantier géant : plus de dix mille ouvriers, les architectes Anthémius de Tralles et Isidore de Milet. Le 27 décembre 537, la nouvelle Sainte-Sophie est inaugurée : sa coupole culmine à 55 mètres.",
      pointsCles: ["532 : l'ancienne Sainte-Sophie brûle pendant la révolte Nika", "Architectes : Anthémius de Tralles et Isidore de Milet ; plus de dix mille ouvriers", "27 décembre 537 : inauguration par Justinien ; coupole à 55,6 m", "558 : la coupole s'effondre lors d'un séisme ; elle est rebâtie plus haute", "1453 : mosquée ; 1934 : musée ; 2020 : mosquée"],
      astuce: "Les années 530, c'est la décennie des grands chantiers de Justinien : les lois (529-534), puis Sainte-Sophie (532-537).",
      dates: [
        { annee: 532, evenement: "Révolte Nika ; début du chantier de Sainte-Sophie" },
        { annee: 537, evenement: "Inauguration de Sainte-Sophie" },
        { annee: 558, evenement: "La coupole de Sainte-Sophie s'effondre" }
      ],
      lieux: ["Constantinople"], personnages: ["Justinien", "Théodora", "Anthémius de Tralles", "Isidore de Milet"],
      vocabulaire: [
        { mot: "coupole", def: "un toit en forme de demi-sphère" },
        { mot: "révolte Nika", def: "la révolte de janvier 532 à Constantinople, partie des courses de l'hippodrome ; « nika » veut dire « sois vainqueur »" }
      ],
      schema: null, prerequis: ["histoire-s01-1-f6"], source: P("Sainte-Sophie (Constantinople)", U_SOPHIE)
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
    { id: "histoire-s01-1-q26", fiche: "histoire-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Qui est Théodose, à la mort duquel l'Empire romain est partagé en 395 ?",
      choix: ["Le dernier empereur à régner sur tout l'Empire romain", "Le premier empereur de l'Empire byzantin, installé à Constantinople", "Le chef des royaumes germaniques qui prennent Rome en 476", "Le général de Justinien qui reconquiert Ravenne"],
      reponse: "Le dernier empereur à régner sur tout l'Empire romain",
      explication: "Théodose est le dernier empereur qui gouverne à la fois l'Orient et l'Occident. À sa mort, en 395, l'empire est partagé entre ses deux fils, et il ne sera plus jamais réuni.",
      source: T("Théodose Ier", "https://fr.wikipedia.org/wiki/Th%C3%A9odose_Ier") },
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
      enonce: "Pendant combien de temps environ l'Empire byzantin a-t-il existé ?",
      choix: ["Plus de mille ans", "Environ un siècle", "Environ deux siècles", "Environ cinq siècles"],
      reponse: "Plus de mille ans",
      explication: "L'Empire romain d'Orient naît au partage de 395 et tombe en 1453, avec la prise de Constantinople. Il a donc duré plus de mille ans, bien plus que l'Occident, disparu dès 476.",
      indice: "Compare la date du partage et celle de la prise de Constantinople.", source: S(1) },
    { id: "histoire-s01-1-q28", fiche: "histoire-s01-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Après 476, des royaumes germaniques prennent la place de l'Empire romain d'Occident.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en 476, l'Occident perd son dernier empereur. Les royaumes germaniques occupent ensuite sa place.", source: S(1) },
    { id: "histoire-s01-1-q29", fiche: "histoire-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "Des deux empires nés du partage de 395, lequel dure le plus longtemps ?",
      choix: ["L'Empire romain d'Orient, jusqu'en 1453", "L'Empire romain d'Occident, jusqu'en 1453", "L'Empire romain d'Orient, jusqu'en 476", "Aucun : ils tombent ensemble en 476"],
      reponse: "L'Empire romain d'Orient, jusqu'en 1453",
      explication: "L'Occident tombe dès 476. L'Orient tient jusqu'en 1453, près de mille ans de plus.", source: S(1) },
    { id: "histoire-s01-1-q31", fiche: "histoire-s01-1-f2", type: "qcm_multiple", niveau: 3,
      enonce: "Quels événements ont lieu après la chute du dernier empereur romain d'Occident ? (plusieurs réponses)",
      choix: ["Le règne de Justinien", "La prise de Constantinople par les Turcs", "Le temps des royaumes germaniques", "Le partage de l'Empire romain", "L'édit de Thessalonique"],
      reponse: ["Le règne de Justinien", "La prise de Constantinople par les Turcs", "Le temps des royaumes germaniques"],
      explication: "La chute date de 476 : les royaumes germaniques, Justinien (527-565) et la prise de Constantinople (1453) viennent après. Le partage (395) et l'édit de Thessalonique (380) viennent avant.", source: S(1) },
    // f3 : Constantinople, la capitale (les questions sur les trois noms viennent du mémento déposé, page 3)
    { id: "histoire-s01-1-q10", fiche: "histoire-s01-1-f3", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les noms successifs de la ville.",
      elements: ["Istanbul", "Byzance", "Constantinople"],
      reponse: [1, 2, 0],
      explication: "La ville s'appelle d'abord Byzance, puis Constantinople. Aujourd'hui, c'est Istanbul.", source: S(3) },
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
      explication: "Au VIe siècle avant Jésus-Christ, Byzance naît comme colonie grecque. Elle ne devient Constantinople qu'au IVe siècle après Jésus-Christ, en 330.", source: S(3) },
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
    { id: "histoire-s01-1-q42", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "En quelle année l'empereur Constantin fonde-t-il Constantinople ?",
      choix: ["330", "395", "476", "527"],
      reponse: "330",
      explication: "Constantin inaugure sa « Nouvelle Rome » en 330, sur le site de l'ancienne Byzance. Le partage de l'empire ne vient que plus tard, en 395.",
      indice: "C'est avant le partage de l'empire.", source: T("Constantinople", U_CONST) },
    { id: "histoire-s01-1-q43", fiche: "histoire-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "En 1204, ce sont les Ottomans qui prennent et pillent Constantinople.",
      corrections: ["Faux : en 1204, ce sont les croisés de la quatrième croisade ; les Ottomans ne la prennent qu'en 1453.", "Faux : en 1204, ce sont les Turcs seldjoukides, qui gardent la ville jusqu'en 1453.", "Faux : personne ne prend la ville avant 1453."],
      reponse: { vrai: false, correction: "Faux : en 1204, ce sont les croisés de la quatrième croisade ; les Ottomans ne la prennent qu'en 1453." },
      explication: "En 1204, la quatrième croisade est détournée vers Constantinople, et les croisés pillent la ville. Les Ottomans de Mehmed II la prennent le 29 mai 1453.", source: T("Constantinople", U_CONST) },
    { id: "histoire-s01-1-q44", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi Constantin appelle-t-il sa nouvelle capitale la « Nouvelle Rome » ?",
      choix: ["Il veut en faire une seconde Rome, pour gouverner l'est de l'empire", "Parce que tous les habitants de Rome déménagent avec lui à Constantinople", "Parce que la ville est bâtie en Italie, tout près de Rome", "Parce que le pape lui demande de reconstruire la ville de Rome"],
      reponse: "Il veut en faire une seconde Rome, pour gouverner l'est de l'empire",
      explication: "Constantin fonde en 330 une capitale à l'est, bâtie comme Rome sur sept collines. Il la nomme « Nouvelle Rome », mais elle prend vite son nom : Constantinople.", source: T("Constantinople", U_CONST) },
    { id: "histoire-s01-1-q45", fiche: "histoire-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment la ville de Constantinople se présente-t-elle au Moyen Âge, par rapport aux autres villes d'Europe ?",
      choix: ["C'est la plus grande ville d'Europe, du IVe au XIIIe siècle", "C'est une petite ville de pêcheurs sans grande importance", "C'est une ville moins peuplée que Rome et que Ravenne", "C'est une ville sans port, loin de la mer"],
      reponse: "C'est la plus grande ville d'Europe, du IVe au XIIIe siècle",
      explication: "Bâtie au bord du Bosphore, sur la Corne d'Or, Constantinople est la plus grande ville d'Europe du IVe au XIIIe siècle. Ses ports en font un carrefour du commerce, au bout de la route de la soie.", source: T("Constantinople", U_CONST) },
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
    { id: "histoire-s01-1-q38", fiche: "histoire-s01-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Justinien règne après la chute du dernier empereur romain d'Occident.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'Occident tombe en 476, et Justinien règne de 527 à 565. Ses conquêtes touchent donc d'anciennes terres de l'Occident.", source: S(1) },
    { id: "histoire-s01-1-q70", fiche: "histoire-s01-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles régions les armées de Justinien reprennent-elles à l'ouest ? (plusieurs réponses)",
      choix: ["L'Afrique du Nord, autour de Carthage, en 533", "L'Italie, avec Ravenne, prise en 540", "La Gaule des Francs, jusqu'à Paris", "L'Égypte, reprise aux Perses", "La Grande-Bretagne"],
      reponse: ["L'Afrique du Nord, autour de Carthage, en 533", "L'Italie, avec Ravenne, prise en 540"],
      explication: "Le général Bélisaire entre dans Carthage en 533, puis la guerre d'Italie dure de 535 à 553 ; Ravenne est prise en 540. La Gaule des Francs reste hors de portée, et l'Égypte appartenait déjà à l'empire.",
      source: T("Justinien Ier", U_JUST) },
    { id: "histoire-s01-1-q71", fiche: "histoire-s01-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Le général Bélisaire entre dans Carthage en 533, au nom de Justinien.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la flotte quitte Constantinople en juin 533, et Bélisaire entre dans Carthage en septembre. L'Afrique du Nord redevient une terre de l'empire.", source: T("Justinien Ier", U_JUST) },
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
      explication: "Cette mosaïque montre Justinien et sa cour. Elle se trouve à Ravenne, conquise par Justinien.", source: S(2) },
    { id: "histoire-s01-1-q72", fiche: "histoire-s01-1-f5", type: "qcm", niveau: 3,
      enonce: "Qui accompagne Justinien sur la mosaïque de Saint-Vital, et que porte l'empereur ?",
      choix: ["L'évêque Maximien, le général Bélisaire et des gardes ; il tient un plat d'or", "Le pape et des chevaliers francs ; il tient une épée", "Le patriarche de Constantinople et des sénateurs ; il tient le Code de Justinien", "Sa femme Théodora et ses enfants ; il tient une couronne"],
      reponse: "L'évêque Maximien, le général Bélisaire et des gardes ; il tient un plat d'or",
      explication: "Justinien avance entouré de l'évêque Maximien, de Bélisaire, de gardes et de clercs, et il porte un plat d'or offert en cadeau. En face, une autre mosaïque montre Théodora et ses dames.",
      source: T("Basilique Saint-Vital de Ravenne", U_VITAL) },
    // f6 : le basileus
    { id: "histoire-s01-1-q46", fiche: "histoire-s01-1-f6", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on l'empereur byzantin ?",
      choix: ["Le basileus", "Le calife", "Le pape", "Le comte"],
      reponse: "Le basileus",
      explication: "L'empereur byzantin porte le titre de basileus, « roi » en grec. Le calife dirige les musulmans, le pape l'Église d'Occident.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q47", fiche: "histoire-s01-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Le mot basileus veut dire « roi » en grec.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : basileus est le mot grec pour « roi ». Héraclius en fait le titre de l'empereur byzantin en 629.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q48", fiche: "histoire-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Quelle couleur est réservée au basileus ?",
      choix: ["La pourpre", "L'or", "Le bleu", "Le blanc"],
      reponse: "La pourpre",
      explication: "La pourpre, un rouge violet, est le symbole le plus important du pouvoir impérial. Lui seul peut porter des vêtements et des chaussures de cette couleur.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q49", fiche: "histoire-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que le basileus a tous les pouvoirs ?",
      choix: ["Il commande l'armée, fait la loi et se dit lieutenant de Dieu", "Il est élu par le peuple de Constantinople tous les cinq ans", "Il partage le pouvoir avec le pape de Rome, qui fait la loi", "Il ne gouverne que l'armée, et c'est le patriarche qui fait la loi"],
      reponse: "Il commande l'armée, fait la loi et se dit lieutenant de Dieu",
      explication: "Le basileus est le chef de l'armée et de l'État, et il se présente comme le lieutenant de Dieu sur terre. Personne, à Constantinople, ne partage son pouvoir.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q50", fiche: "histoire-s01-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "C'est le pape de Rome qui couronne le basileus à Constantinople.",
      corrections: ["Faux : c'est le patriarche de Constantinople qui le couronne.", "Faux : le basileus se couronne lui-même, sans personne.", "Faux : c'est le chef de l'armée qui le couronne."],
      reponse: { vrai: false, correction: "Faux : c'est le patriarche de Constantinople qui le couronne." },
      explication: "À Constantinople, l'empereur reçoit la couronne des mains du patriarche de la ville. Le pape, lui, est l'évêque de Rome, en Occident.", source: T("Empire byzantin", U_BYZ) },
    { id: "histoire-s01-1-q51", fiche: "histoire-s01-1-f6", type: "qcm", niveau: 3,
      enonce: "À partir de quel empereur le titre grec de basileus remplace-t-il officiellement le titre latin d'Auguste ?",
      choix: ["Héraclius, en 629", "Constantin, en 330", "Justinien, en 527", "Théodose, en 395"],
      reponse: "Héraclius, en 629",
      explication: "Héraclius adopte le titre de basileus en 629, à la place du latin Augustus. Le grec remplace alors peu à peu le latin dans tout l'empire.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q52", fiche: "histoire-s01-1-f6", type: "association", niveau: 2,
      enonce: "Relie chaque mot à ce qu'il désigne.",
      gauche: ["Basileus", "Pourpre", "Patriarche de Constantinople", "Pape"],
      droite: ["Évêque de Rome, chef de l'Église d'Occident", "Titre grec de l'empereur byzantin", "Couleur réservée à l'empereur", "Il couronne l'empereur byzantin"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Le basileus porte la pourpre et reçoit sa couronne du patriarche de Constantinople. Le pape est l'évêque de Rome, en Occident.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q53", fiche: "histoire-s01-1-f6", type: "qcm", niveau: 3,
      enonce: "Un marchand de Constantinople jette avec colère une pièce de monnaie à terre. Pourquoi risque-t-il d'être puni ?",
      choix: ["La pièce porte l'image du basileus : la jeter, c'est l'offenser", "La monnaie appartient au patriarche de Constantinople, qui la prête aux marchands", "Les pièces d'or sont interdites aux marchands de la ville", "Il est interdit de se mettre en colère dans les rues de Constantinople"],
      reponse: "La pièce porte l'image du basileus : la jeter, c'est l'offenser",
      explication: "Les pièces byzantines portent l'image de l'empereur et ont une valeur sacrée. Les jeter à terre, c'est offenser le basileus lui-même.", source: T("Basileus", U_BASIL) },
    { id: "histoire-s01-1-q54", fiche: "histoire-s01-1-f6", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur l'empereur byzantin.",
      texte: "L'empereur byzantin porte le titre de ___ ; lui seul s'habille de ___.",
      banque: ["basileus", "pourpre", "calife", "blanc"],
      reponse: [["basileus"], ["pourpre"]],
      explication: "Basileus est le titre grec de l'empereur. La pourpre est la couleur que lui seul peut porter.", source: T("Basileus", U_BASIL) },
    // f7 : le Code de Justinien
    { id: "histoire-s01-1-q37", fiche: "histoire-s01-1-f7", type: "qcm", niveau: 3,
      enonce: "En plus de ses conquêtes, que fait rassembler l'empereur Justinien dans un grand recueil ?",
      choix: ["Les lois romaines : c'est le Code de Justinien", "Les récits de ses batailles contre les royaumes germaniques", "Les noms de tous les habitants de Constantinople", "Les plans des mosaïques de Ravenne"],
      reponse: "Les lois romaines : c'est le Code de Justinien",
      explication: "Justinien fait trier et classer les lois romaines dans un grand recueil, le Code de Justinien. Ce travail, confié au juriste Tribonien, a servi de modèle au droit pendant des siècles.",
      source: T("Justinien Ier", U_JUST) },
    { id: "histoire-s01-1-q55", fiche: "histoire-s01-1-f7", type: "qcm", niveau: 1,
      enonce: "Qui dirige le classement des lois romaines sous Justinien ?",
      choix: ["Le juriste Tribonien", "Le général Bélisaire", "L'impératrice Théodora", "L'empereur Constantin"],
      reponse: "Le juriste Tribonien",
      explication: "Tribonien est le juriste qui dirige la commission chargée de trier les lois. Bélisaire, lui, commande les armées de Justinien.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q56", fiche: "histoire-s01-1-f7", type: "vrai_faux", niveau: 1,
      enonce: "Le Code de Justinien rassemble les lois romaines, triées et classées.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : entre 529 et 534, les lois des empereurs romains sont triées, classées et publiées. C'est le Code de Justinien.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q57", fiche: "histoire-s01-1-f7", type: "qcm", niveau: 2,
      enonce: "Pourquoi Justinien fait-il rassembler les lois romaines dans un recueil ?",
      choix: ["Elles s'étaient accumulées pendant des siècles et se contredisaient parfois", "Pour remplacer toutes les lois romaines par de nouvelles lois écrites en grec", "Pour les offrir au pape de Rome, qui les avait perdues", "Pour les faire disparaître et régner sans aucune loi"],
      reponse: "Elles s'étaient accumulées pendant des siècles et se contredisaient parfois",
      explication: "Depuis des siècles, les empereurs romains avaient produit des milliers de lois, parfois contradictoires. Justinien veut un recueil clair, en latin, que les juges puissent appliquer.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q58", fiche: "histoire-s01-1-f7", type: "qcm", niveau: 2,
      enonce: "Quand le Code de Justinien est-il rédigé ?",
      choix: ["Entre 529 et 534", "Entre 395 et 476", "Entre 532 et 537", "Entre 1204 et 1453"],
      reponse: "Entre 529 et 534",
      explication: "Le Code paraît en 529 et sa version définitive en 534. Les années 532 à 537, elles, sont celles du chantier de Sainte-Sophie.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q59", fiche: "histoire-s01-1-f7", type: "vrai_faux", niveau: 2,
      enonce: "Après la chute de l'Empire byzantin, le Code de Justinien est oublié pour toujours.",
      corrections: ["Faux : il est redécouvert à Bologne dès le XIe siècle et inspire le droit de l'Europe.", "Faux : il n'a jamais été oublié, car Charlemagne l'appliquait déjà dans tout son empire.", "Faux : il est redécouvert à Paris au XVe siècle, après la prise de Constantinople."],
      reponse: { vrai: false, correction: "Faux : il est redécouvert à Bologne dès le XIe siècle et inspire le droit de l'Europe." },
      explication: "À la fin du XIe siècle, l'université de Bologne redécouvre le Code et le droit romain renaît en Occident. Il devient l'ancêtre du droit civil, en France aussi.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q60", fiche: "histoire-s01-1-f7", type: "association", niveau: 2,
      enonce: "Relie chaque partie du travail de Justinien à son contenu.",
      gauche: ["Code", "Digeste", "Institutes", "Tribonien"],
      droite: ["Les lois des empereurs romains", "Les avis des grands juristes romains", "Un manuel pour les étudiants en droit", "Le juriste qui dirige le travail"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Le Code rassemble les lois des empereurs, le Digeste les écrits des juristes, les Institutes forment un manuel. Tribonien dirige l'ensemble.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q61", fiche: "histoire-s01-1-f7", type: "qcm", niveau: 3,
      enonce: "Au XIIe siècle, un étudiant de Bologne apprend le droit dans le Code de Justinien. Que montre cet exemple ?",
      choix: ["Les lois rassemblées par Justinien servent encore, des siècles plus tard, en Occident", "Bologne fait encore partie de l'Empire byzantin au XIIe siècle, comme Ravenne", "Justinien est encore vivant au XIIe siècle et enseigne lui-même", "Le Code de Justinien a été écrit en italien pour les étudiants"],
      reponse: "Les lois rassemblées par Justinien servent encore, des siècles plus tard, en Occident",
      explication: "Redécouvert à Bologne à la fin du XIe siècle, le Code est étudié dans toute l'Europe à partir du XIIe siècle. Le droit romain, écrit en latin, devient la base du droit civil.", source: T("Corpus juris civilis", U_CORPUS) },
    { id: "histoire-s01-1-q62", fiche: "histoire-s01-1-f7", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Entre 529 et 534, le juriste ___ rassemble les lois romaines : c'est le ___ de Justinien.",
      banque: ["Tribonien", "Code", "Bélisaire", "Palais"],
      reponse: [["Tribonien"], ["Code"]],
      explication: "Tribonien dirige le tri des lois romaines. Le recueil s'appelle le Code de Justinien.", source: T("Corpus juris civilis", U_CORPUS) },
    // f8 : Sainte-Sophie
    { id: "histoire-s01-1-q63", fiche: "histoire-s01-1-f8", type: "qcm", niveau: 1,
      enonce: "Quel monument Justinien fait-il rebâtir à Constantinople entre 532 et 537 ?",
      choix: ["Sainte-Sophie", "La basilique Saint-Vital", "La basilique Saint-Pierre de Rome", "La chapelle d'Aix-la-Chapelle"],
      reponse: "Sainte-Sophie",
      explication: "Sainte-Sophie est rebâtie de 532 à 537 sur l'ordre de Justinien. Saint-Vital, elle, est à Ravenne.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) },
    { id: "histoire-s01-1-q64", fiche: "histoire-s01-1-f8", type: "vrai_faux", niveau: 1,
      enonce: "Sainte-Sophie est inaugurée le 27 décembre 537.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Justinien inaugure la nouvelle Sainte-Sophie le 27 décembre 537. Le chantier a duré moins de six ans.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) },
    { id: "histoire-s01-1-q65", fiche: "histoire-s01-1-f8", type: "qcm", niveau: 2,
      enonce: "Pourquoi faut-il rebâtir Sainte-Sophie en 532 ?",
      choix: ["L'ancienne église a brûlé pendant la révolte Nika", "Un tremblement de terre l'a entièrement renversée au début de 532", "Les Ottomans l'ont détruite en prenant la ville", "Justinien la trouve trop grande et veut une église plus petite"],
      reponse: "L'ancienne église a brûlé pendant la révolte Nika",
      explication: "En janvier 532, la révolte Nika met le feu à Constantinople, et l'ancienne Sainte-Sophie brûle. Justinien décide la reconstruction dès le 23 février 532, cinq semaines plus tard.", source: T("Sédition Nika", U_NIKA) },
    { id: "histoire-s01-1-q66", fiche: "histoire-s01-1-f8", type: "qcm", niveau: 2,
      enonce: "Qui sont Anthémius de Tralles et Isidore de Milet ?",
      choix: ["Les deux architectes de Sainte-Sophie", "Les généraux qui reconquièrent l'Afrique et l'Italie", "Les juristes qui rédigent le Code de Justinien", "Les chefs de la révolte Nika"],
      reponse: "Les deux architectes de Sainte-Sophie",
      explication: "Anthémius est mathématicien, Isidore est physicien : Justinien leur confie les plans de Sainte-Sophie. Les généraux sont Bélisaire et Narsès, le juriste Tribonien.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) },
    { id: "histoire-s01-1-q67", fiche: "histoire-s01-1-f8", type: "vrai_faux", niveau: 2,
      enonce: "Depuis 537, la coupole de Sainte-Sophie n'a jamais bougé.",
      corrections: ["Faux : elle s'effondre lors d'un séisme en 558 et est rebâtie plus haute.", "Faux : elle s'effondre en 1453, quand les Ottomans prennent la ville.", "Faux : elle est démontée en 1934 pour transformer l'église en musée."],
      reponse: { vrai: false, correction: "Faux : elle s'effondre lors d'un séisme en 558 et est rebâtie plus haute." },
      explication: "Le 7 mai 558, un tremblement de terre fait tomber la coupole. Isidore le Jeune la rebâtit plus légère et plus haute de six mètres.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) },
    { id: "histoire-s01-1-q68", fiche: "histoire-s01-1-f8", type: "ordre", niveau: 2,
      enonce: "Range ces moments de l'histoire de Sainte-Sophie du plus ancien au plus récent.",
      elements: ["Sainte-Sophie devient un musée", "La révolte Nika détruit l'ancienne église", "Les Ottomans en font une mosquée", "Justinien inaugure la nouvelle Sainte-Sophie"],
      reponse: [1, 3, 2, 0],
      explication: "532 : l'ancienne église brûle ; 537 : inauguration ; 1453 : mosquée ; 1934 : musée. Depuis 2020, c'est de nouveau une mosquée.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) },
    { id: "histoire-s01-1-q69", fiche: "histoire-s01-1-f8", type: "qcm", niveau: 3,
      enonce: "Comment Justinien réussit-il à bâtir Sainte-Sophie en moins de six ans ?",
      choix: ["Il emploie plus de dix mille ouvriers et fait venir des matériaux de tout l'empire", "Il fait démonter une église de Rome et la remonter à Constantinople", "Il confie le chantier à l'armée de Bélisaire, revenue d'Italie", "Il laisse les habitants de la ville construire chacun un morceau"],
      reponse: "Il emploie plus de dix mille ouvriers et fait venir des matériaux de tout l'empire",
      explication: "Plus de dix mille ouvriers travaillent sous la direction de deux savants, Anthémius et Isidore. Les matériaux arrivent de tout l'empire, et le chantier dure cinq ans et dix mois.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) },
    { id: "histoire-s01-1-q73", fiche: "histoire-s01-1-f8", type: "qcm", niveau: 3,
      enonce: "Qu'est devenue Sainte-Sophie après la prise de Constantinople en 1453 ?",
      choix: ["Une mosquée, sur ordre de Mehmed II", "Le palais du sultan ottoman", "Une ruine abandonnée pendant des siècles", "Le siège du patriarche de Constantinople"],
      reponse: "Une mosquée, sur ordre de Mehmed II",
      explication: "Après 1453, Mehmed II transforme Sainte-Sophie en mosquée. Elle devient un musée en 1934, puis de nouveau une mosquée en 2020.", source: T("Sainte-Sophie (Constantinople)", U_SOPHIE) }
  ],
  bonus: [
    {
      id: "histoire-s01-1-b1",
      fiche: "histoire-s01-1-f5",
      titre: "Théodora, face à Justinien",
      texte: "À Saint-Vital, deux grandes mosaïques se font face : Justinien avec sa cour, et son épouse, l'impératrice Théodora, entourée de ses dames d'honneur. Leur fond d'or est typique de l'art byzantin. Avec d'autres monuments de Ravenne, la basilique est inscrite au patrimoine mondial de l'UNESCO depuis 1996.",
      source: { titre: "Basilique Saint-Vital de Ravenne", editeur: "Wikipédia, l'encyclopédie libre", url: U_VITAL }
    },
    {
      id: "histoire-s01-1-b2",
      fiche: "histoire-s01-1-f3",
      titre: "« Byzantin », un mot de 1857",
      texte: "Les habitants de l'empire ne se sont jamais appelés « Byzantins » : ils se disaient Romains, et leur État s'appelait l'Empire des Romains. L'expression « Empire byzantin » est diffusée en 1857 seulement, par l'historien George Finlay, d'après Byzance, l'ancien nom de la capitale.",
      source: { titre: "Empire byzantin", editeur: "Wikipédia, l'encyclopédie libre", url: U_BYZ }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre est laissé vide dans le support, la leçon est donnée dans la vidéo du cours.",
    "Ce qu'est l'édit de Thessalonique (380) : la frise donne seulement son nom et sa date.",
    "Les personnages et les objets de la mosaïque de Saint-Vital : la légende numérotée est à compléter pendant le cours (une seule question de thème les nomme).",
    "La peste de 541-544 et l'affaiblissement de l'empire après Justinien.",
    "L'organisation militaire de l'empire (les thèmes) et sa monnaie, le nomisma.",
    "La querelle des images (iconoclasme, VIIIe-IXe siècles), que le programme range parmi les facteurs de division.",
    "Les Turcs ottomans et le déroulement du siège de 1453 : seules la date et le nom de Mehmed II sont donnés."
  ]
};
