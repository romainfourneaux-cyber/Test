// Source en clair du cours histoire-s01-2 « Cours 2 – Empire carolingien au temps de Charlemagne ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s01-2.
// Seule source : le support de la séance 2 (frise, carte, texte d'Eginhard, enluminure, mots importants).
// La leçon est donnée en vidéo et n'est pas déposée : ce qu'elle apporterait est listé dans nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 2 - Support.pdf";
const S = p => ({ fichier: F, page: p });

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
      pointsCles: ["Renaissance carolingienne : un renouveau de la culture", "Elle commence sous le règne de Charlemagne"],
      dates: [],
      lieux: [], personnages: ["Charlemagne"],
      vocabulaire: [
        { mot: "renaissance carolingienne", def: "une période où la culture se renouvelle, qui débute sous le règne de Charlemagne" }
      ],
      schema: null, prerequis: ["histoire-s01-2-f1"], source: S(3)
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
    { id: "histoire-s01-2-q5", fiche: "histoire-s01-2-f1", type: "qcm", niveau: 3,
      enonce: "Charlemagne est empereur de 800 à 814. Pendant combien d'années ?",
      choix: ["14 ans", "46 ans", "8 ans", "100 ans"],
      reponse: "14 ans",
      explication: "814 moins 800 font 14. Il est donc empereur pendant 14 ans.", indice: "Fais la soustraction.", source: S(1) },
    { id: "histoire-s01-2-q24", fiche: "histoire-s01-2-f1", type: "vrai_faux", niveau: 3,
      enonce: "Clovis et Charlemagne sont tous les deux rois des Francs, mais Clovis règne plus de deux siècles avant Charlemagne.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Clovis règne de 481 à 511 et Charlemagne devient roi en 768. Plus de deux cents ans les séparent.", source: S(1) },
    { id: "histoire-s01-2-q25", fiche: "histoire-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Charlemagne devient empereur d'Occident en 768.",
      corrections: ["Faux : en 768, il devient roi des Francs ; il est empereur à partir de 800.", "Faux : il devient empereur en 814, à la fin de son règne.", "Faux : il devient empereur en 481, juste après Clovis."],
      reponse: { vrai: false, correction: "Faux : en 768, il devient roi des Francs ; il est empereur à partir de 800." },
      explication: "En 768, Charlemagne devient roi des Francs. Il n'est couronné empereur qu'en 800.", source: S(1) },
    { id: "histoire-s01-2-q26", fiche: "histoire-s01-2-f1", type: "qcm", niveau: 3,
      enonce: "Pendant combien d'années Charlemagne est-il roi des Francs avant de devenir empereur ?",
      choix: ["32 ans", "14 ans", "46 ans", "22 ans"],
      reponse: "32 ans",
      explication: "Il est roi en 768 et empereur en 800. 800 moins 768 font 32 ans.", indice: "Fais la soustraction 800 moins 768.", source: S(1) },
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
    { id: "histoire-s01-2-q34", fiche: "histoire-s01-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels mots désignent Charlemagne dans le récit d'Eginhard ? (plusieurs réponses)",
      choix: ["le roi", "Charles Auguste", "empereur des Romains", "le pape Léon", "l'apôtre Pierre", "le peuple romain"],
      reponse: ["le roi", "Charles Auguste", "empereur des Romains"],
      explication: "Eginhard appelle Charlemagne « le roi », puis le peuple l'acclame « Charles Auguste » et « empereur des Romains ». Le pape Léon, l'apôtre Pierre et le peuple romain sont d'autres noms du texte.", source: S(2) },
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
    { id: "histoire-s01-2-q41", fiche: "histoire-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Laquelle de ces années tombe sous le règne où commence la renaissance carolingienne ?",
      choix: ["790", "500", "560", "900"],
      reponse: "790",
      explication: "La renaissance carolingienne commence sous Charlemagne, roi des Francs de 768 à 814. Seule l'année 790 se trouve dans ce règne.",
      indice: "Cherche d'abord les dates du règne de Charlemagne.", source: S(3) },
    { id: "histoire-s01-2-q42", fiche: "histoire-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le règne de Charlemagne est marqué à la fois par des conquêtes et par un renouveau de la culture.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Charlemagne agrandit le royaume franc par ses conquêtes. Sous son règne commence aussi la renaissance carolingienne.", source: S(3) }
  ],
  bonus: [
    {
      id: "histoire-s01-2-b1",
      fiche: "histoire-s01-2-f5",
      titre: "Une écriture au nom de Charlemagne",
      texte: "Vers 770-780 naît une nouvelle écriture, la minuscule caroline, qui doit son nom à Charlemagne. Ses lettres rondes et régulières se lisent facilement, et les mots y sont séparés par des espaces. La police de caractères Times New Roman en descend directement.",
      source: { titre: "Minuscule caroline", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Minuscule_caroline" }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre est laissé vide dans le support, la leçon est donnée dans la vidéo du cours.",
    "Qui est Pépin le Bref et son lien avec Charlemagne : la carte cite seulement son royaume à sa mort.",
    "La capitale de Charlemagne et le rôle d'Aix-la-Chapelle : la ville figure sur la carte, sans explication.",
    "Deux couleurs de la carte (les États de l'Église et les peuples autour de l'empire) n'ont pas de légende dans le support.",
    "Le déroulement et les raisons des guerres de conquête de Charlemagne.",
    "Ce que la renaissance carolingienne a produit concrètement : le support en donne seulement la définition.",
    "Le commentaire de l'enluminure de Jean Fouquet et les réponses écrites aux questions sur le texte d'Eginhard, faites pendant la vidéo.",
    "Ce que devient l'Empire carolingien après la mort de Charlemagne en 814."
  ]
};
