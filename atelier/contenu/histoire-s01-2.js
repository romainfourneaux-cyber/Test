// Source en clair du cours histoire-s01-2 « Cours 2 – Empire carolingien au temps de Charlemagne ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s01-2.
// Sources : le support de la séance 2 (frise, carte, texte d'Eginhard, enluminure, mots importants) pour les fiches
// f1 à f5 ; le programme officiel de 5e (règle du 28/10/2026) pour les fiches f6 (Clovis) et f7 (843), dont les faits
// ont été vérifiés sur les pages citées. La leçon est donnée en vidéo et n'est pas déposée : voir nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 2 - Support.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 2 – Empire carolingien au temps de Charlemagne", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel et page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "Byzance et l'Europe carolingienne", titre, editeur: "Wikipédia", url });
const U_CLOVIS = "https://fr.wikipedia.org/wiki/Clovis_Ier";
const U_VASE = "https://fr.wikipedia.org/wiki/Vase_de_Soissons";
const U_BAPT = "https://fr.wikipedia.org/wiki/Bapt%C3%AAme_de_Clovis";
const U_CHARLE = "https://fr.wikipedia.org/wiki/Charlemagne";
const U_VERDUN = "https://fr.wikipedia.org/wiki/Trait%C3%A9_de_Verdun";
const U_SERMENTS = "https://fr.wikipedia.org/wiki/Serments_de_Strasbourg";
const U_MISSI = "https://fr.wikipedia.org/wiki/Missi_dominici";
const U_ABUL = "https://fr.wikipedia.org/wiki/Abul-Abbas";

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 460, A1 = 840, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 540 214' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  // repères du haut
  s += "<line x1='" + x(476) + "' y1='24' x2='" + x(476) + "' y2='120' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<text x='" + (x(476) + 3) + "' y='20' fill='" + encre + "'>476 : chute du dernier empereur romain d'Occident</text>";
  s += "<line x1='" + x(800) + "' y1='48' x2='" + x(800) + "' y2='120' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<text x='" + (x(800) - 3) + "' y='44' text-anchor='end' fill='" + encre + "'>800 : Charlemagne, empereur d'Occident</text>";
  // périodes au-dessus de l'axe
  s += "<rect x='" + x(476) + "' y='92' width='" + (x(800) - x(476)) + "' height='18' fill='#d46a5c'/>";
  s += "<text x='" + ((x(476) + x(800)) / 2) + "' y='105' text-anchor='middle' font-size='10' fill='#fff'>Royaumes germaniques</text>";
  s += "<rect x='" + x(800) + "' y='92' width='" + (x(814) - x(800)) + "' height='18' fill='#c8742a'/>";
  // axe et graduations
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 500; a <= 800; a += 50) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  // règnes sous l'axe
  s += "<rect x='" + x(481) + "' y='144' width='" + (x(511) - x(481)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(481) + "' y='170' fill='" + encre + "'>481-511 : Clovis, roi des Francs</text>";
  s += "<rect x='" + x(768) + "' y='144' width='" + (x(814) - x(768)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(814) + "' y='170' text-anchor='end' fill='" + encre + "'>768-814 : Charlemagne, roi des Francs</text>";
  // légende
  s += "<rect x='30' y='194' width='12' height='10' fill='#c8742a'/><text x='48' y='203' fill='" + encre + "'>Empire carolingien (800-814)</text>";
  s += "<rect x='240' y='194' width='12' height='10' fill='#2f5e8e'/><text x='258' y='203' fill='" + encre + "'>règne d'un roi des Francs</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s01-2",
  fiches: [
    {
      id: "histoire-s01-2-f1", notion: "Des rois francs à l'empereur Charlemagne",
      titre: "Clovis, Charlemagne : rois des Francs",
      texte: "Après 476, l'Occident est partagé en royaumes germaniques. Pendant cette période, Clovis est roi des Francs de 481 à 511. Bien plus tard, en 768, Charlemagne devient à son tour roi des Francs. En 800, il devient empereur d'Occident : c'est l'Empire carolingien. Il règne jusqu'en 814.",
      pointsCles: ["481-511 : Clovis, roi des Francs", "768-814 : Charlemagne, roi des Francs", "800-814 : Charlemagne, empereur d'Occident (Empire carolingien)"],
      dates: [
        { annee: 481, evenement: "Clovis devient roi des Francs" },
        { annee: 768, evenement: "Charlemagne devient roi des Francs" },
        { annee: 800, evenement: "Charlemagne devient empereur d'Occident" },
        { annee: 814, evenement: "Fin du règne de Charlemagne" }
      ],
      lieux: [], personnages: ["Clovis", "Charlemagne"],
      vocabulaire: [
        { mot: "Empire carolingien", def: "l'empire de Charlemagne, en Occident, à partir de 800" }
      ],
      schema: "histoire-s01-2-s1", prerequis: ["histoire-s01-1-f2"], source: S(1)
    },
    {
      id: "histoire-s01-2-f2", notion: "Les conquêtes de Charlemagne",
      titre: "Un royaume franc qui s'agrandit",
      texte: "À la mort de Pépin le Bref, le royaume franc comprend déjà la Neustrie, l'Austrasie, la Bourgogne et l'Aquitaine. Charlemagne y ajoute de nombreuses conquêtes : la Saxe au nord, la Bavière à l'est, la Lombardie, autour de Pavie, et la Marche espagnole au sud. Plus loin au sud-ouest se trouve l'émirat de Cordoue.",
      pointsCles: ["Royaume franc à la mort de Pépin le Bref : Neustrie, Austrasie, Bourgogne, Aquitaine", "Conquêtes de Charlemagne : Saxe, Bavière, Lombardie, Marche espagnole", "Voisin au sud-ouest : l'émirat de Cordoue"],
      dates: [],
      lieux: ["Saxe", "Bavière", "Lombardie", "Marche espagnole", "Aquitaine", "Cordoue"], personnages: ["Pépin le Bref", "Charlemagne"],
      vocabulaire: [],
      schema: null, prerequis: ["histoire-s01-2-f1"], source: S(1)
    },
    {
      id: "histoire-s01-2-f3", notion: "Le couronnement de Charlemagne en 800",
      titre: "Noël 800 : Charlemagne couronné à Rome",
      texte: "En 800, à Rome, pendant la messe du jour où l'on fête la naissance du Seigneur, c'est-à-dire Noël, le pape Léon pose une couronne sur la tête de Charlemagne. Le peuple romain l'acclame alors comme empereur des Romains. On connaît cette scène par un texte d'Eginhard ; Jean Fouquet l'a peinte bien plus tard, au XVe siècle.",
      pointsCles: ["Où ? À Rome", "Quand ? En 800, le jour de Noël", "Par qui ? Le pape Léon", "Titre donné par le peuple : empereur des Romains", "Documents : un texte d'Eginhard, une enluminure de Jean Fouquet (XVe siècle)"],
      dates: [],
      lieux: ["Rome"], personnages: ["Charlemagne", "le pape Léon", "Eginhard", "Jean Fouquet"],
      vocabulaire: [
        { mot: "pape", def: "l'évêque de Rome, qui dirige l'Église catholique" }
      ],
      schema: null, prerequis: ["histoire-s01-2-f1"], source: S(2)
    },
    {
      id: "histoire-s01-2-f4", notion: "Gouverner l'empire : comtes, missi dominici, bénéfices",
      titre: "Les hommes du pouvoir carolingien",
      texte: "Le souverain carolingien gouverne avec l'aide de représentants. Le comte agit au nom du roi : il exerce un pouvoir ou remplit une mission militaire. Les missi dominici sont les envoyés spéciaux du souverain : ils vont vérifier sur place le travail de ses représentants. Contre des services militaires, le souverain peut donner une terre : c'est un bénéfice.",
      pointsCles: ["Comte : agit au nom du roi (pouvoir ou armée)", "Missi dominici : envoyés du souverain qui contrôlent ses représentants", "Bénéfice : une terre donnée contre des services militaires"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "comte", def: "un personnage important qui exerce un pouvoir ou une mission militaire au nom du roi" },
        { mot: "missi dominici", def: "des hommes envoyés par le souverain carolingien pour surveiller, dans les régions, ceux qui le représentent" },
        { mot: "bénéfice", def: "une terre que le souverain donne à ses représentants contre des services militaires" }
      ],
      schema: null, prerequis: [], source: S(3)
    },
    {
      id: "histoire-s01-2-f5", notion: "La renaissance carolingienne",
      titre: "Un renouveau de la culture",
      texte: "Le règne de Charlemagne n'est pas fait que de conquêtes. Il ouvre aussi une période de renouveau culturel, que l'on appelle la « renaissance carolingienne ». Elle commence sous son règne, qui va de 768 à 814.",
      pointsCles: ["Renaissance carolingienne : un renouveau de la culture", "Elle commence sous le règne de Charlemagne", "Le règne de Charlemagne : de 768 à 814"],
      dates: [],
      lieux: [], personnages: ["Charlemagne"],
      vocabulaire: [
        { mot: "renaissance carolingienne", def: "une période où la culture se renouvelle, qui débute sous le règne de Charlemagne" }
      ],
      schema: null, prerequis: ["histoire-s01-2-f1"], source: S(3)
    },
    {
      id: "histoire-s01-2-f6", notion: "Clovis, le roi qui fonde le royaume des Francs",
      titre: "Clovis : Soissons, Reims, Vouillé, Paris",
      texte: "Clovis devient roi des Francs vers 481. En 486, à Soissons, il bat Syagrius : tout le nord de la Gaule est à lui. Baptisé à Reims par l'évêque Remi, un jour de Noël, il gagne l'appui des évêques. En 507, à Vouillé, il bat les Wisigoths. Il fait de Paris sa capitale et meurt en 511.",
      pointsCles: ["Vers 481 : Clovis, roi des Francs, à quinze ans", "486 : victoire de Soissons sur Syagrius ; le nord de la Gaule", "Baptême à Reims par l'évêque Remi, un jour de Noël (date discutée, entre 496 et 511)", "507 : victoire de Vouillé sur les Wisigoths ; leur roi Alaric II est tué", "Paris capitale ; mort le 27 novembre 511 ; royaume partagé entre ses quatre fils"],
      astuce: "Trois dates qui finissent par 6, 7, 1 : 486 Soissons, 507 Vouillé, 511 la mort à Paris.",
      dates: [
        { annee: 481, evenement: "Clovis devient roi des Francs" },
        { annee: 486, evenement: "Victoire de Clovis à Soissons" },
        { annee: 507, evenement: "Victoire de Clovis à Vouillé" },
        { annee: 511, evenement: "Mort de Clovis à Paris" }
      ],
      lieux: ["Soissons", "Reims", "Vouillé", "Paris"], personnages: ["Clovis", "Syagrius", "Remi", "Clotilde", "Alaric II"],
      vocabulaire: [
        { mot: "Francs", def: "le peuple germanique installé dans le nord de la Gaule, dont Clovis est le roi" },
        { mot: "Wisigoths", def: "un peuple germanique installé dans le sud de la Gaule et en Espagne, battu par Clovis à Vouillé en 507" }
      ],
      schema: "histoire-s01-2-s1", prerequis: ["histoire-s01-1-f2", "histoire-s01-2-f1"], source: P("Clovis Ier", U_CLOVIS)
    },
    {
      id: "histoire-s01-2-f7", notion: "843 : l'empire partagé à Verdun",
      titre: "843 : trois frères, trois royaumes",
      texte: "Charlemagne meurt en 814 ; son fils Louis le Pieux lui succède. À la mort de Louis, en 840, ses trois fils se battent. Louis le Germanique et Charles le Chauve battent Lothaire à Fontenoy le 25 juin 841, puis se jurent aide à Strasbourg en 842. En août 843, le traité de Verdun coupe l'empire en trois royaumes.",
      pointsCles: ["814 : mort de Charlemagne ; 840 : mort de Louis le Pieux", "25 juin 841 : Louis le Germanique et Charles le Chauve battent Lothaire à Fontenoy", "842 : serments de Strasbourg, jurés par chacun dans la langue des soldats de l'autre", "Août 843, traité de Verdun : Charles le Chauve reçoit la Francie occidentale, Louis le Germanique la Francie orientale, Lothaire la Francie médiane et le titre d'empereur", "Des historiens y ont vu la naissance de la France et de l'Allemagne ; les gens de 843 ne le savaient pas"],
      astuce: "843 : trois frères, trois Francies. Charles à l'ouest, Louis à l'est, Lothaire au milieu avec la couronne.",
      dates: [
        { annee: 814, evenement: "Mort de Charlemagne ; Louis le Pieux empereur" },
        { annee: 841, evenement: "Bataille de Fontenoy" },
        { annee: 842, evenement: "Serments de Strasbourg" },
        { annee: 843, evenement: "Traité de Verdun : l'empire partagé en trois" }
      ],
      lieux: ["Fontenoy", "Strasbourg", "Verdun"], personnages: ["Louis le Pieux", "Charles le Chauve", "Louis le Germanique", "Lothaire"],
      vocabulaire: [
        { mot: "Francie occidentale", def: "la part de Charles le Chauve en 843, à l'ouest de l'Escaut, de la Meuse et du Rhône" },
        { mot: "traité", def: "un accord écrit entre des souverains, ici le partage de 843" }
      ],
      schema: null, prerequis: ["histoire-s01-2-f1"], source: P("Traité de Verdun", U_VERDUN)
    }
  ],
  schemas: [
    { id: "histoire-s01-2-s1", legende: "Des royaumes germaniques à l'Empire carolingien, de 476 à 814 (frise redessinée d'après le support).", svg: frise() }
  ],
  questions: [
    // f1 : rois des Francs et empereur
    { id: "histoire-s01-2-q1", fiche: "histoire-s01-2-f1", type: "qcm", niveau: 1,
      enonce: "Qui est roi des Francs de 481 à 511 ?",
      choix: ["Clovis", "Charlemagne", "Justinien", "Théodose"],
      reponse: "Clovis",
      explication: "Clovis règne sur les Francs de 481 à 511. Charlemagne ne devient roi des Francs qu'en 768.", source: S(1) },
    { id: "histoire-s01-2-q2", fiche: "histoire-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Charlemagne est roi des Francs avant de devenir empereur.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : il est roi des Francs dès 768. Il devient empereur en 800.", source: S(1) },
    { id: "histoire-s01-2-q3", fiche: "histoire-s01-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets ces étapes dans l'ordre du temps.",
      elements: ["Charlemagne devient empereur d'Occident", "Clovis devient roi des Francs", "Chute du dernier empereur romain d'Occident", "Charlemagne devient roi des Francs"],
      reponse: [2, 1, 3, 0],
      explication: "476 : chute de l'Occident ; 481 : Clovis ; 768 : Charlemagne roi ; 800 : Charlemagne empereur.", source: S(1) },
    { id: "histoire-s01-2-q4", fiche: "histoire-s01-2-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on l'empire de Charlemagne à partir de 800 ?",
      choix: ["L'Empire carolingien", "L'Empire byzantin", "L'Empire romain d'Occident", "Les royaumes germaniques"],
      reponse: "L'Empire carolingien",
      explication: "En 800, Charlemagne devient empereur d'Occident : c'est l'Empire carolingien. L'Empire romain d'Occident, lui, a disparu en 476.", source: S(1) },
    { id: "histoire-s01-2-q5", fiche: "histoire-s01-2-f1", type: "qcm", niveau: 1,
      enonce: "Qui est Pépin le Bref pour Charlemagne ?",
      choix: ["Son père, le premier roi de la famille des Carolingiens", "Son fils, qui lui succède en 814", "Le pape qui le couronne empereur à Rome, le jour de Noël", "Le roi des Lombards qu'il a vaincu"],
      reponse: "Son père, le premier roi de la famille des Carolingiens",
      explication: "Pépin le Bref devient roi des Francs en 751 : c'est le premier roi carolingien. Son fils Charlemagne lui succède en 768 et agrandit son royaume.",
      source: T("Pépin le Bref", "https://fr.wikipedia.org/wiki/P%C3%A9pin_le_Bref") },
    { id: "histoire-s01-2-q24", fiche: "histoire-s01-2-f1", type: "vrai_faux", niveau: 3,
      enonce: "Clovis et Charlemagne sont tous les deux rois des Francs, mais Clovis règne plus de deux siècles avant Charlemagne.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Clovis règne de 481 à 511 et Charlemagne devient roi en 768. Plus de deux cents ans les séparent.", source: S(1) },
    { id: "histoire-s01-2-q25", fiche: "histoire-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Charlemagne devient empereur d'Occident en 768.",
      corrections: ["Faux : en 768, il devient roi des Francs ; il est empereur à partir de 800.", "Faux : il devient empereur en 814, à la fin de son règne.", "Faux : il devient empereur en 481, juste après Clovis."],
      reponse: { vrai: false, correction: "Faux : en 768, il devient roi des Francs ; il est empereur à partir de 800." },
      explication: "En 768, Charlemagne devient roi des Francs. Il n'est couronné empereur qu'en 800.", source: S(1) },
    { id: "histoire-s01-2-q26", fiche: "histoire-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Dans quelle ville Charlemagne fait-il bâtir le palais où il vit à la fin de son règne ?",
      choix: ["Aix-la-Chapelle", "Rome", "Paris", "Constantinople, en Orient"],
      reponse: "Aix-la-Chapelle",
      explication: "Charlemagne fait construire un grand palais à Aix-la-Chapelle, avec une chapelle qui existe encore. Après 806, il ne quitte presque plus cette ville, qui devient le cœur de son empire.",
      indice: "La ville se trouve dans l'Allemagne actuelle, près de la frontière belge.",
      source: T("Palais d'Aix-la-Chapelle", "https://fr.wikipedia.org/wiki/Palais_d%27Aix-la-Chapelle") },
    // f2 : les conquêtes
    { id: "histoire-s01-2-q6", fiche: "histoire-s01-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels territoires sont des conquêtes de Charlemagne ? (plusieurs réponses)",
      choix: ["La Saxe", "La Bavière", "La Lombardie", "La Marche espagnole", "L'Aquitaine", "La Neustrie"],
      reponse: ["La Saxe", "La Bavière", "La Lombardie", "La Marche espagnole"],
      explication: "Saxe, Bavière, Lombardie et Marche espagnole sont des conquêtes de Charlemagne. L'Aquitaine et la Neustrie étaient déjà franques à la mort de Pépin le Bref.", source: S(1) },
    { id: "histoire-s01-2-q7", fiche: "histoire-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'Aquitaine est une conquête de Charlemagne.",
      corrections: ["Faux : l'Aquitaine était déjà dans le royaume franc à la mort de Pépin le Bref.", "Faux : l'Aquitaine appartient à l'émirat de Cordoue.", "Faux : l'Aquitaine fait partie de la Marche espagnole."],
      reponse: { vrai: false, correction: "Faux : l'Aquitaine était déjà dans le royaume franc à la mort de Pépin le Bref." },
      explication: "L'Aquitaine était franque avant Charlemagne. Elle faisait partie du royaume de Pépin le Bref.", source: S(1) },
    { id: "histoire-s01-2-q8", fiche: "histoire-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment le territoire franc change-t-il sous Charlemagne ?",
      choix: ["Il s'agrandit nettement grâce à ses conquêtes", "Il rétrécit au profit de l'émirat de Cordoue", "Il reste le même que sous Pépin le Bref", "Il est partagé en deux empires"],
      reponse: "Il s'agrandit nettement grâce à ses conquêtes",
      explication: "Charlemagne ajoute la Saxe, la Bavière, la Lombardie et la Marche espagnole. Son territoire devient bien plus vaste.", source: S(1) },
    { id: "histoire-s01-2-q9", fiche: "histoire-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Quel voisin se trouve au sud-ouest de l'empire de Charlemagne, au-delà de la Marche espagnole ?",
      choix: ["L'émirat de Cordoue", "L'Empire byzantin", "Le royaume des Avars", "Le duché du Bénévent"],
      reponse: "L'émirat de Cordoue",
      explication: "L'émirat de Cordoue est au sud-ouest de l'empire. La Marche espagnole, conquise par Charlemagne, le sépare du royaume franc.", source: S(1) },
    { id: "histoire-s01-2-q27", fiche: "histoire-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "La Marche espagnole fait partie des conquêtes de Charlemagne.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : elle est au sud, du côté de l'émirat de Cordoue. Charlemagne l'ajoute au royaume franc.", source: S(1) },
    { id: "histoire-s01-2-q28", fiche: "histoire-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "À la mort de Pépin le Bref, la Saxe fait déjà partie du royaume franc.",
      corrections: ["Faux : la Saxe est une conquête de Charlemagne, au nord.", "Faux : la Saxe est une conquête de Charlemagne, au sud.", "Faux : la Saxe appartient à l'émirat de Cordoue."],
      reponse: { vrai: false, correction: "Faux : la Saxe est une conquête de Charlemagne, au nord." },
      explication: "Le royaume de Pépin le Bref comprend la Neustrie, l'Austrasie, la Bourgogne et l'Aquitaine. La Saxe, au nord, est conquise par Charlemagne.", source: S(1) },
    { id: "histoire-s01-2-q29", fiche: "histoire-s01-2-f2", type: "association", niveau: 3,
      enonce: "Relie chaque territoire à sa situation.",
      gauche: ["Saxe", "Bavière", "Marche espagnole", "Neustrie"],
      droite: ["Déjà franc à la mort de Pépin le Bref", "Conquête au sud, vers l'émirat de Cordoue", "Conquête au nord", "Conquête à l'est"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Saxe au nord, Bavière à l'est, Marche espagnole au sud : ce sont des conquêtes de Charlemagne. La Neustrie, elle, était déjà franque.", source: S(1) },
    { id: "histoire-s01-2-q30", fiche: "histoire-s01-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels territoires forment déjà le royaume franc à la mort de Pépin le Bref ? (plusieurs réponses)",
      choix: ["La Neustrie", "L'Austrasie", "La Bourgogne", "L'Aquitaine", "La Saxe", "La Lombardie"],
      reponse: ["La Neustrie", "L'Austrasie", "La Bourgogne", "L'Aquitaine"],
      explication: "Neustrie, Austrasie, Bourgogne et Aquitaine forment le royaume de Pépin le Bref. La Saxe et la Lombardie sont des conquêtes de Charlemagne.", source: S(1) },
    { id: "histoire-s01-2-q43", fiche: "histoire-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Combien de temps dure la guerre de Charlemagne contre les Saxons, et comment finit-elle ?",
      choix: ["Plus de trente ans, de 772 à 804 ; les Saxons sont soumis et contraints au baptême", "Un seul été, en 774 : les Saxons deviennent aussitôt les meilleurs alliés des Francs", "Dix ans ; les Saxons gardent leur indépendance", "Cinq ans ; Charlemagne perd la Saxe pour toujours"],
      reponse: "Plus de trente ans, de 772 à 804 ; les Saxons sont soumis et contraints au baptême",
      explication: "La première expédition date de 772, la dernière de 804. Leur chef Widukind se soumet et reçoit le baptême en 785, mais la Saxe se révolte encore plusieurs fois.",
      source: T("Charlemagne", U_CHARLE) },
    { id: "histoire-s01-2-q44", fiche: "histoire-s01-2-f2", type: "vrai_faux", niveau: 3,
      enonce: "En 778, au retour d'une expédition en Espagne, l'armée de Charlemagne subit une défaite à Roncevaux.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en 778, l'armée franque est attaquée à Roncevaux, dans les Pyrénées. Charlemagne crée ensuite la Marche espagnole pour protéger le sud de son royaume.",
      source: T("Charlemagne", U_CHARLE) },
    // f3 : le couronnement
    { id: "histoire-s01-2-q10", fiche: "histoire-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Dans quelle ville Charlemagne est-il couronné empereur en 800 ?",
      choix: ["Rome", "Constantinople", "Ravenne", "Pavie"],
      reponse: "Rome",
      explication: "Le couronnement a lieu à Rome. Le pape, qui couronne Charlemagne, est l'évêque de cette ville.", source: S(2) },
    { id: "histoire-s01-2-q11", fiche: "histoire-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Qui pose la couronne sur la tête de Charlemagne ?",
      choix: ["Le pape Léon", "L'empereur Justinien", "Le peuple romain", "Eginhard"],
      reponse: "Le pape Léon",
      explication: "D'après Eginhard, c'est le pape Léon qui le couronne. Le peuple romain, lui, l'acclame.", source: S(2) },
    { id: "histoire-s01-2-q12", fiche: "histoire-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Charlemagne est couronné empereur un jour de Noël.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Eginhard parle du jour de la naissance du Seigneur. C'est le jour de Noël.", source: S(2) },
    { id: "histoire-s01-2-q13", fiche: "histoire-s01-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire que Charlemagne se place dans la suite des empereurs romains ?",
      choix: ["Il est couronné à Rome et acclamé « empereur des Romains »", "Il est couronné à Constantinople, capitale de l'Empire romain d'Orient", "Il devient roi des Francs à Rome, comme Clovis avant lui", "Il est couronné par le peuple romain lui-même, sans le pape"],
      reponse: "Il est couronné à Rome et acclamé « empereur des Romains »",
      explication: "Il reçoit le titre d'empereur des Romains, à Rome même. Il se présente donc comme l'héritier des empereurs de Rome.", source: S(2) },
    { id: "histoire-s01-2-q14", fiche: "histoire-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le pape est le chef de l'Église catholique et l'évêque de Constantinople.",
      corrections: ["Faux : le pape est l'évêque de Rome.", "Faux : le pape est un envoyé spécial du souverain carolingien.", "Faux : le pape est l'évêque de Ravenne."],
      reponse: { vrai: false, correction: "Faux : le pape est l'évêque de Rome." },
      explication: "Le pape est l'évêque de Rome. Il est à la tête de l'Église catholique.", source: S(3) },
    { id: "histoire-s01-2-q31", fiche: "histoire-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Selon Eginhard, c'est le peuple romain qui pose la couronne sur la tête de Charlemagne.",
      corrections: ["Faux : c'est le pape Léon ; le peuple romain l'acclame.", "Faux : c'est Charlemagne qui se couronne lui-même.", "Faux : c'est Eginhard qui le couronne."],
      reponse: { vrai: false, correction: "Faux : c'est le pape Léon ; le peuple romain l'acclame." },
      explication: "Le pape Léon pose la couronne sur la tête de Charlemagne. Le peuple romain, lui, l'acclame empereur.", source: S(2) },
    { id: "histoire-s01-2-q32", fiche: "histoire-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Qui est Jean Fouquet, dont l'œuvre montre le couronnement de Charlemagne ?",
      choix: ["L'auteur d'une enluminure du XVe siècle", "Le pape qui couronne Charlemagne en 800", "L'auteur des Annales du règne de Charlemagne", "Un envoyé spécial chargé de contrôler les comtes"],
      reponse: "L'auteur d'une enluminure du XVe siècle",
      explication: "Jean Fouquet peint la scène dans un manuscrit enluminé du XVe siècle. Le texte des Annales, lui, est d'Eginhard.", source: S(2) },
    { id: "histoire-s01-2-q33", fiche: "histoire-s01-2-f3", type: "qcm", niveau: 3,
      enonce: "Charlemagne est couronné en 800 ; Jean Fouquet peint la scène au XVe siècle. Que peut-on en déduire ?",
      choix: ["Fouquet peint la scène plus de six siècles après", "Fouquet assiste au couronnement et le peint sur place", "Fouquet peint la scène l'année même du couronnement", "Fouquet vit avant Charlemagne, au temps de Clovis"],
      reponse: "Fouquet peint la scène plus de six siècles après",
      explication: "Le XVe siècle correspond aux années 1401 à 1500, plus de six cents ans après 800. Fouquet n'a donc pas vu la scène qu'il peint.",
      indice: "Le XVe siècle, ce sont les années 1400.", source: S(2) },
    { id: "histoire-s01-2-q45", fiche: "histoire-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le pape qui couronne Charlemagne à Rome, en 800, est Léon III.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le pape Léon III couronne Charlemagne empereur à Rome, le 25 décembre 800. Charlemagne a alors plus de trente ans de règne derrière lui.",
      source: T("Charlemagne", U_CHARLE) },
    // f4 : gouverner
    { id: "histoire-s01-2-q15", fiche: "histoire-s01-2-f4", type: "qcm", niveau: 1,
      enonce: "Comment s'appellent les envoyés spéciaux qui contrôlent les représentants du souverain carolingien ?",
      choix: ["Les missi dominici", "Les comtes", "Les papes", "Les rois des Francs"],
      reponse: "Les missi dominici",
      explication: "Les missi dominici sont les envoyés du souverain. Ils vérifient sur place le travail de ses représentants.", source: S(3) },
    { id: "histoire-s01-2-q16", fiche: "histoire-s01-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Un bénéfice est une terre donnée par le souverain en échange de services militaires.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le souverain récompense ainsi ses représentants. En retour, ils le servent à la guerre.", source: S(3) },
    { id: "histoire-s01-2-q17", fiche: "histoire-s01-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Le comte est un envoyé spécial chargé de contrôler les missi dominici.",
      corrections: ["Faux : ce sont les missi dominici qui contrôlent les représentants du roi, comme les comtes.", "Faux : le comte est une terre donnée contre des services militaires.", "Faux : le comte est l'évêque de Rome."],
      reponse: { vrai: false, correction: "Faux : ce sont les missi dominici qui contrôlent les représentants du roi, comme les comtes." },
      explication: "C'est l'inverse : les missi dominici contrôlent les représentants du roi. Le comte, lui, agit au nom du roi.", source: S(3) },
    { id: "histoire-s01-2-q18", fiche: "histoire-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi le souverain carolingien accorde-t-il des bénéfices à ses représentants ?",
      choix: ["Pour obtenir en échange leurs services militaires", "Pour qu'ils contrôlent les missi dominici dans chaque région", "Pour les remercier de l'avoir couronné à Rome", "Pour qu'ils diffusent la renaissance carolingienne"],
      reponse: "Pour obtenir en échange leurs services militaires",
      explication: "Le bénéfice est une terre donnée contre des services militaires. Le souverain obtient ainsi l'aide de ses représentants à la guerre.", source: S(3) },
    { id: "histoire-s01-2-q19", fiche: "histoire-s01-2-f4", type: "association", niveau: 2,
      enonce: "Relie chaque mot à son rôle.",
      gauche: ["Comte", "Missi dominici", "Bénéfice", "Pape"],
      droite: ["Terre donnée contre des services militaires", "Évêque de Rome, à la tête de l'Église catholique", "Agit au nom du roi, pour le pouvoir ou l'armée", "Envoyés du souverain qui contrôlent ses représentants"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Comte : il agit pour le roi ; missi dominici : ils contrôlent ; bénéfice : une terre ; pape : l'évêque de Rome.", source: S(3) },
    { id: "histoire-s01-2-q35", fiche: "histoire-s01-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Les missi dominici sont des terres données par le souverain à ses représentants.",
      corrections: ["Faux : ce sont des envoyés du souverain, qui contrôlent ses représentants.", "Faux : ce sont des comtes, qui exercent un pouvoir pour le roi.", "Faux : ce sont des terres données par le pape."],
      reponse: { vrai: false, correction: "Faux : ce sont des envoyés du souverain, qui contrôlent ses représentants." },
      explication: "Une terre donnée contre des services militaires, c'est un bénéfice. Les missi dominici sont des envoyés qui contrôlent les représentants du souverain.", source: S(3) },
    { id: "histoire-s01-2-q36", fiche: "histoire-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Charlemagne envoie des hommes dans une région pour vérifier que le comte fait bien son travail. Qui sont ces hommes ?",
      choix: ["Des missi dominici", "D'autres comtes", "Des papes", "Des rois des Francs"],
      reponse: "Des missi dominici",
      explication: "Contrôler sur place les représentants du roi, c'est le rôle des missi dominici. Le comte, lui, agit au nom du roi.", source: S(3) },
    { id: "histoire-s01-2-q37", fiche: "histoire-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Un représentant du souverain reçoit une terre et, en échange, il le sert à la guerre. Comment s'appelle cette terre ?",
      choix: ["Un bénéfice", "Une marche", "Un émirat", "Une province"],
      reponse: "Un bénéfice",
      explication: "Une terre donnée par le souverain contre des services militaires s'appelle un bénéfice. C'est ainsi qu'il s'assure l'aide de ses représentants.", source: S(3) },
    { id: "histoire-s01-2-q38", fiche: "histoire-s01-2-f4", type: "trou", niveau: 1,
      enonce: "Complète avec les mots du pouvoir carolingien.",
      texte: "Le ___ agit au nom du roi. Les ___ dominici contrôlent son travail. Contre des services militaires, il peut recevoir une terre : un ___.",
      banque: ["comte", "missi", "bénéfice", "pape"],
      reponse: [["comte"], ["missi"], ["bénéfice"]],
      explication: "Le comte représente le roi, les missi dominici le contrôlent. La terre donnée contre des services militaires est un bénéfice.", source: S(3) },
    { id: "histoire-s01-2-q46", fiche: "histoire-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment les missi dominici voyagent-ils le plus souvent dans l'empire ?",
      choix: ["Par deux ou trois, dont un comte et un évêque", "Seuls et déguisés en marchands, pour ne pas être reconnus", "Avec toute l'armée de Charlemagne", "Avec le pape, qui les accompagne"],
      reponse: "Par deux ou trois, dont un comte et un évêque",
      explication: "Les missi partent par deux ou trois, en général un comte et un évêque, dans un district où ils ne sont pas chez eux. Ils rendent la justice, surveillent les comtes et reçoivent les serments de fidélité.",
      source: T("Missi dominici", U_MISSI) },
    // f5 : renaissance carolingienne
    { id: "histoire-s01-2-q20", fiche: "histoire-s01-2-f5", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on la période de renouveau culturel qui commence sous Charlemagne ?",
      choix: ["La renaissance carolingienne", "L'Empire carolingien", "Le couronnement de Charlemagne", "Les royaumes germaniques"],
      reponse: "La renaissance carolingienne",
      explication: "On parle de « renaissance carolingienne ». C'est un renouveau de la culture qui débute sous Charlemagne.", source: S(3) },
    { id: "histoire-s01-2-q21", fiche: "histoire-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "La renaissance carolingienne commence sous le règne de Clovis.",
      corrections: ["Faux : elle commence sous le règne de Charlemagne.", "Faux : elle commence sous le règne de Pépin le Bref.", "Faux : elle commence après la mort de Charlemagne, en 814."],
      reponse: { vrai: false, correction: "Faux : elle commence sous le règne de Charlemagne." },
      explication: "Clovis règne bien avant, de 481 à 511. Le renouveau culturel débute sous Charlemagne.", source: S(3) },
    { id: "histoire-s01-2-q22", fiche: "histoire-s01-2-f5", type: "qcm", niveau: 1,
      enonce: "La renaissance carolingienne est un renouveau dans quel domaine ?",
      choix: ["La culture", "L'armée", "Le commerce", "Les impôts"],
      reponse: "La culture",
      explication: "La renaissance carolingienne est un renouveau culturel. Elle débute sous Charlemagne.", source: S(3) },
    { id: "histoire-s01-2-q23", fiche: "histoire-s01-2-f5", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Sous le règne de ___ commence la renaissance ___, un renouveau de la culture.",
      banque: ["Charlemagne", "carolingienne", "Clovis", "byzantine"],
      reponse: [["Charlemagne"], ["carolingienne"]],
      explication: "Le renouveau culturel commence sous Charlemagne. On l'appelle renaissance carolingienne.", source: S(3) },
    { id: "histoire-s01-2-q39", fiche: "histoire-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "La renaissance carolingienne est une période de renouveau militaire, marquée par les conquêtes.",
      corrections: ["Faux : c'est une période de renouveau culturel, qui commence sous Charlemagne.", "Faux : c'est une période de renouveau du commerce, qui commence sous Charlemagne."],
      reponse: { vrai: false, correction: "Faux : c'est une période de renouveau culturel, qui commence sous Charlemagne." },
      explication: "La renaissance carolingienne est un renouveau de la culture. Les conquêtes de Charlemagne sont une autre partie de son règne.", source: S(3) },
    { id: "histoire-s01-2-q40", fiche: "histoire-s01-2-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on de renaissance « carolingienne » ?",
      choix: ["Elle commence sous le règne de Charlemagne", "Elle commence sous Clovis, roi des Francs de 481 à 511", "Elle a lieu dans l'Empire romain d'Orient, sous Justinien", "Elle commence après la mort de Charlemagne, en 814"],
      reponse: "Elle commence sous le règne de Charlemagne",
      explication: "Le mot « carolingien » renvoie à Charlemagne et à son empire. Ce renouveau de la culture commence sous son règne.", source: S(3) },
    { id: "histoire-s01-2-q41", fiche: "histoire-s01-2-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Qu'est-ce qui se développe grâce à la renaissance carolingienne ? (plusieurs réponses)",
      choix: ["Des écoles, dans les monastères et auprès des évêques", "La copie de livres par des moines", "Une nouvelle écriture, plus facile à lire", "De nouveaux châteaux forts en pierre", "Le commerce avec Bagdad", "L'élection du roi par les comtes"],
      reponse: ["Des écoles, dans les monastères et auprès des évêques", "La copie de livres par des moines", "Une nouvelle écriture, plus facile à lire"],
      explication: "Charlemagne demande en 789 que des écoles ouvrent dans les monastères et les évêchés, et des ateliers de moines copient des milliers de livres. Ils écrivent avec une nouvelle écriture, la minuscule caroline, ronde et lisible.",
      source: T("Renaissance carolingienne", "https://fr.wikipedia.org/wiki/Renaissance_carolingienne") },
    { id: "histoire-s01-2-q42", fiche: "histoire-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le règne de Charlemagne est marqué à la fois par des conquêtes et par un renouveau de la culture.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Charlemagne agrandit le royaume franc par ses conquêtes. Sous son règne commence aussi la renaissance carolingienne.", source: S(3) },
    { id: "histoire-s01-2-q47", fiche: "histoire-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Qui est Alcuin, et quel rôle joue-t-il auprès de Charlemagne ?",
      choix: ["Un savant venu d'Angleterre, qui conseille l'empereur et dirige l'école du palais d'Aix", "Le pape qui couronne Charlemagne à Rome en 800", "Le comte chargé de la Marche espagnole", "Le chef des Saxons, baptisé en 785"],
      reponse: "Un savant venu d'Angleterre, qui conseille l'empereur et dirige l'école du palais d'Aix",
      explication: "Alcuin arrive d'Angleterre en 782 et devient l'un des principaux conseillers de Charlemagne. Il anime l'école du palais à Aix-la-Chapelle, puis enseigne à Tours à partir de 796.",
      source: T("Renaissance carolingienne", "https://fr.wikipedia.org/wiki/Renaissance_carolingienne") },
    // f6 : Clovis
    { id: "histoire-s01-2-q48", fiche: "histoire-s01-2-f6", type: "qcm", niveau: 1,
      enonce: "Qui est Clovis ?",
      choix: ["Le roi des Francs de 481 à 511", "L'empereur d'Occident couronné en 800", "Le dernier chef romain de Gaule", "L'évêque de Reims"],
      reponse: "Le roi des Francs de 481 à 511",
      explication: "Clovis devient roi des Francs vers 481 et meurt à Paris en 511. Syagrius est le chef romain qu'il bat à Soissons, Remi l'évêque qui le baptise.", source: T("Clovis Ier", U_CLOVIS) },
    { id: "histoire-s01-2-q49", fiche: "histoire-s01-2-f6", type: "vrai_faux", niveau: 1,
      enonce: "En 486, Clovis bat Syagrius à Soissons.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la victoire de Soissons, en 486, donne à Clovis tout le nord de la Gaule. Il n'a alors qu'une vingtaine d'années.", source: T("Clovis Ier", U_CLOVIS) },
    { id: "histoire-s01-2-q50", fiche: "histoire-s01-2-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi le baptême de Clovis à Reims compte-t-il pour son pouvoir ?",
      choix: ["Il gagne l'appui des évêques et des Gallo-Romains", "Il devient aussitôt empereur des Romains, trois siècles avant Charlemagne", "Il reçoit l'Aquitaine en cadeau du pape de Rome", "Il peut enfin épouser Clotilde, la princesse burgonde"],
      reponse: "Il gagne l'appui des évêques et des Gallo-Romains",
      explication: "En se faisant baptiser, Clovis s'allie à l'Église et aux grandes familles gallo-romaines, qui tiennent les villes de Gaule. Les autres rois germaniques, wisigoths et burgondes, n'ont pas cet appui.", source: T("Baptême de Clovis", U_BAPT) },
    { id: "histoire-s01-2-q51", fiche: "histoire-s01-2-f6", type: "qcm", niveau: 2,
      enonce: "Que se passe-t-il à Vouillé en 507 ?",
      choix: ["Clovis bat les Wisigoths ; leur roi Alaric II est tué", "Clovis est baptisé par l'évêque Remi", "Clovis bat Syagrius et prend Soissons", "Clovis partage son royaume entre ses quatre fils, à Paris"],
      reponse: "Clovis bat les Wisigoths ; leur roi Alaric II est tué",
      explication: "Au printemps 507, les Francs marchent vers le sud et battent les Wisigoths à Vouillé. Alaric II est tué, et les Wisigoths se replient vers l'Espagne.", source: T("Clovis Ier", U_CLOVIS) },
    { id: "histoire-s01-2-q52", fiche: "histoire-s01-2-f6", type: "vrai_faux", niveau: 2,
      enonce: "Clovis choisit Reims comme capitale de son royaume.",
      corrections: ["Faux : il choisit Paris, après Tournai et Soissons.", "Faux : il choisit Rome, pour se rapprocher du pape.", "Faux : il choisit Aix-la-Chapelle, comme Charlemagne plus tard."],
      reponse: { vrai: false, correction: "Faux : il choisit Paris, après Tournai et Soissons." },
      explication: "Clovis fait de Paris sa résidence principale : l'ancienne Lutèce devient capitale pour la première fois. Reims est la ville de son baptême.", source: T("Clovis Ier", U_CLOVIS) },
    { id: "histoire-s01-2-q53", fiche: "histoire-s01-2-f6", type: "ordre", niveau: 2,
      enonce: "Range ces moments de la vie de Clovis du plus ancien au plus récent.",
      elements: ["Victoire de Vouillé sur les Wisigoths", "Clovis devient roi des Francs", "Mort de Clovis à Paris", "Victoire de Soissons sur Syagrius"],
      reponse: [1, 3, 0, 2],
      explication: "Vers 481 : Clovis devient roi ; 486 : Soissons ; 507 : Vouillé ; 511 : sa mort à Paris.", source: T("Clovis Ier", U_CLOVIS) },
    { id: "histoire-s01-2-q54", fiche: "histoire-s01-2-f6", type: "qcm", niveau: 3,
      enonce: "D'après Grégoire de Tours, que fait Clovis un an après l'affaire du vase de Soissons ?",
      choix: ["Il fend le crâne du guerrier qui avait frappé le vase", "Il rend solennellement le vase à l'évêque de Reims, devant toute l'armée", "Il offre un vase d'or à chacun de ses guerriers", "Il fait la paix avec Syagrius et lui rend Soissons"],
      reponse: "Il fend le crâne du guerrier qui avait frappé le vase",
      explication: "D'après Grégoire de Tours, qui écrit bien après les faits, Clovis reconnaît le guerrier lors d'une revue des troupes et lui fend le crâne de sa hache. Les historiens doutent du détail, mais le récit montre un roi qui refuse d'être traité comme un simple guerrier.", source: T("Vase de Soissons", U_VASE) },
    { id: "histoire-s01-2-q55", fiche: "histoire-s01-2-f6", type: "qcm", niveau: 3,
      enonce: "Comment le royaume de Clovis est-il gouverné après sa mort, en 511 ?",
      choix: ["Il est partagé entre ses quatre fils", "Il revient à l'empereur byzantin", "Il passe à Charlemagne", "Il est gouverné par l'évêque Remi"],
      reponse: "Il est partagé entre ses quatre fils",
      explication: "Thierry, Clodomir, Childebert et Clotaire se partagent le royaume, avec quatre capitales proches : Reims, Orléans, Paris et Soissons. Charlemagne ne naît que deux siècles plus tard.", source: T("Clovis Ier", U_CLOVIS) },
    { id: "histoire-s01-2-q56", fiche: "histoire-s01-2-f6", type: "trou", niveau: 1,
      enonce: "Complète avec les deux victoires de Clovis.",
      texte: "En 486, à ___, Clovis bat Syagrius ; en 507, à ___, il bat les Wisigoths.",
      banque: ["Soissons", "Vouillé", "Reims", "Paris"],
      reponse: [["Soissons"], ["Vouillé"]],
      explication: "Soissons en 486, contre Syagrius ; Vouillé en 507, contre les Wisigoths. Reims est la ville du baptême, Paris la capitale.", source: T("Clovis Ier", U_CLOVIS) },
    // f7 : le partage de 843
    { id: "histoire-s01-2-q57", fiche: "histoire-s01-2-f7", type: "qcm", niveau: 1,
      enonce: "Qui succède à Charlemagne à sa mort, en 814 ?",
      choix: ["Louis le Pieux", "Charles le Chauve", "Lothaire", "Pépin le Bref"],
      reponse: "Louis le Pieux",
      explication: "Louis le Pieux, fils de Charlemagne, devient empereur en 814. Charles le Chauve et Lothaire sont ses fils.", source: T("Charlemagne", U_CHARLE) },
    { id: "histoire-s01-2-q58", fiche: "histoire-s01-2-f7", type: "vrai_faux", niveau: 1,
      enonce: "En 843, le traité de Verdun partage l'empire de Charlemagne en trois royaumes.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en août 843, les trois petits-fils de Charlemagne se partagent l'empire à Verdun. Chacun reçoit un royaume.", source: T("Traité de Verdun", U_VERDUN) },
    { id: "histoire-s01-2-q59", fiche: "histoire-s01-2-f7", type: "qcm", niveau: 2,
      enonce: "Pourquoi les petits-fils de Charlemagne se font-ils la guerre après 840 ?",
      choix: ["Lothaire, l'aîné, veut s'imposer comme seul successeur ; ses frères refusent", "Ils veulent rendre l'empire au pape de Rome, qui avait couronné Charlemagne", "Ils se disputent la ville de Rome, prise par les Byzantins", "Ils veulent remettre un roi mérovingien sur le trône"],
      reponse: "Lothaire, l'aîné, veut s'imposer comme seul successeur ; ses frères refusent",
      explication: "À la mort de Louis le Pieux, le 29 juin 840, son fils aîné Lothaire veut tout l'empire. Louis le Germanique et Charles le Chauve s'allient contre lui.", source: T("Traité de Verdun", U_VERDUN) },
    { id: "histoire-s01-2-q60", fiche: "histoire-s01-2-f7", type: "qcm", niveau: 2,
      enonce: "Qui reçoit la Francie occidentale, à l'ouest, en 843 ?",
      choix: ["Charles le Chauve", "Louis le Germanique", "Lothaire", "Louis le Pieux"],
      reponse: "Charles le Chauve",
      explication: "Charles le Chauve reçoit la Francie occidentale, à l'ouest. Louis le Germanique a la Francie orientale et Lothaire la Francie médiane.", source: T("Traité de Verdun", U_VERDUN) },
    { id: "histoire-s01-2-q61", fiche: "histoire-s01-2-f7", type: "vrai_faux", niveau: 2,
      enonce: "En 843, Lothaire reçoit la Francie orientale et le titre d'empereur.",
      corrections: ["Faux : il reçoit la Francie médiane, de l'Italie à la Frise, avec le titre impérial ; la Francie orientale va à Louis le Germanique.", "Faux : il reçoit la Francie occidentale, avec Paris.", "Faux : il ne reçoit rien, parce qu'il a perdu la bataille de Fontenoy."],
      reponse: { vrai: false, correction: "Faux : il reçoit la Francie médiane, de l'Italie à la Frise, avec le titre impérial ; la Francie orientale va à Louis le Germanique." },
      explication: "Lothaire garde le titre d'empereur et reçoit la Francie médiane, une longue bande du centre de l'Italie à la mer du Nord. La Francie orientale revient à Louis le Germanique.", source: T("Traité de Verdun", U_VERDUN) },
    { id: "histoire-s01-2-q62", fiche: "histoire-s01-2-f7", type: "association", niveau: 2,
      enonce: "Relie chaque personnage à ce qu'il reçoit ou à ce qu'il est.",
      gauche: ["Charles le Chauve", "Louis le Germanique", "Lothaire", "Louis le Pieux"],
      droite: ["La Francie occidentale, à l'ouest", "La Francie orientale, à l'est", "La Francie médiane et le titre d'empereur", "Fils de Charlemagne, empereur de 814 à 840"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Louis le Pieux succède à Charlemagne. Ses trois fils se partagent l'empire en 843 : Charles à l'ouest, Louis à l'est, Lothaire au milieu avec la couronne.", source: T("Traité de Verdun", U_VERDUN) },
    { id: "histoire-s01-2-q63", fiche: "histoire-s01-2-f7", type: "qcm", niveau: 3,
      enonce: "En 842, à Strasbourg, Louis le Germanique jure en langue romane et Charles le Chauve en langue tudesque. Pourquoi ?",
      choix: ["Chacun parle la langue des soldats de l'autre, pour être compris de tous", "Ils ne connaissent pas le latin, la langue des clercs", "Le pape l'exige pour reconnaître leur alliance", "C'est une vieille tradition des rois francs, depuis le baptême de Clovis"],
      reponse: "Chacun parle la langue des soldats de l'autre, pour être compris de tous",
      explication: "Le 14 février 842, les deux frères jurent de s'aider contre Lothaire, chacun dans la langue de l'armée de l'autre. Le texte en langue romane est l'un des plus anciens ancêtres écrits du français.", source: T("Serments de Strasbourg", U_SERMENTS) },
    { id: "histoire-s01-2-q64", fiche: "histoire-s01-2-f7", type: "ordre", niveau: 2,
      enonce: "Range ces événements du plus ancien au plus récent.",
      elements: ["Traité de Verdun", "Mort de Charlemagne", "Bataille de Fontenoy", "Serments de Strasbourg"],
      reponse: [1, 2, 3, 0],
      explication: "814 : mort de Charlemagne ; 25 juin 841 : Fontenoy ; 842 : Strasbourg ; août 843 : Verdun.", source: T("Traité de Verdun", U_VERDUN) },
    { id: "histoire-s01-2-q65", fiche: "histoire-s01-2-f7", type: "qcm", niveau: 3,
      enonce: "Pourquoi des historiens ont-ils vu dans le traité de Verdun la naissance de la France et de l'Allemagne ?",
      choix: ["La Francie occidentale et la Francie orientale ont fini par devenir ces deux pays", "Les noms de France et d'Allemagne sont écrits en toutes lettres dans le texte du traité", "Charles le Chauve prend le titre de roi de France dès 843", "Lothaire fonde les villes de Paris et de Berlin"],
      reponse: "La Francie occidentale et la Francie orientale ont fini par devenir ces deux pays",
      explication: "Avec le temps, la Francie occidentale devient le royaume de France et la Francie orientale l'Allemagne. Mais les gens de 843 ne se sentaient ni Français ni Allemands : c'est une lecture faite bien plus tard.", source: T("Traité de Verdun", U_VERDUN) }
  ],
  bonus: [
    {
      id: "histoire-s01-2-b1",
      fiche: "histoire-s01-2-f5",
      titre: "Une écriture au nom de Charlemagne",
      texte: "Vers 770-780 naît une nouvelle écriture, la minuscule caroline, qui doit son nom à Charlemagne. Ses lettres rondes et régulières se lisent facilement, et les mots y sont séparés par des espaces. La police de caractères Times New Roman en descend directement.",
      source: { titre: "Minuscule caroline", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Minuscule_caroline" }
    },
    {
      id: "histoire-s01-2-b2",
      fiche: "histoire-s01-2-f1",
      titre: "Un éléphant à Aix-la-Chapelle",
      texte: "En 797, Charlemagne envoie une ambassade à Bagdad, auprès du calife Haroun al-Rachid. Isaac, un marchand qui parle l'arabe, en revient cinq ans plus tard avec un cadeau hors du commun : Abul-Abbas, un éléphant blanc d'Asie. Il arrive à Aix-la-Chapelle le 20 juillet 802 et vit à la cour jusqu'en 810.",
      source: { titre: "Abul-Abbas", editeur: "Wikipédia, l'encyclopédie libre", url: U_ABUL }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre est laissé vide dans le support, la leçon est donnée dans la vidéo du cours.",
    "Les raisons des guerres de Charlemagne contre les Lombards (774) et les Avars : seules la Saxe et Roncevaux sont racontées, en questions de thème.",
    "Les capitulaires et les plaids (assemblées), qui organisent le gouvernement de l'empire.",
    "Le palais d'Aix-la-Chapelle et sa chapelle : deux questions de thème seulement.",
    "La vie de Clovis entre Soissons et Vouillé (Tolbiac, le mariage avec Clotilde) : seules les grandes dates sont données.",
    "Le règne de Louis le Pieux (814-840) et les premiers raids vikings.",
    "Deux couleurs de la carte (les États de l'Église et les peuples autour de l'empire) n'ont pas de légende dans le support.",
    "Le commentaire de l'enluminure de Jean Fouquet et les réponses écrites aux questions sur le texte d'Eginhard, faites pendant la vidéo."
  ]
};
