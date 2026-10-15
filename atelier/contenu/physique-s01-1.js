// Source en clair du cours physique-s01-1 « Séance 1 – Les états de la matière (1) ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js physique-s01-1.
// Seule source déposée : le corrigé du livret 1 (thème A, chapitre 1, séance 1, pages 1 et 2) :
// tableau à simple entrée, fiche de mémorisation (photo de cahier, page 1) et exercices d'application (page 2).
// Le livret de cours lui-même n'est pas déposé. Le fil à plomb est déjà vu dans le savoir-faire methode-instruments :
// il n'est ici qu'un rappel (prérequis), sans le refaire.
const F = "cours/physique-chimie/Cours Griffon 5eme Physique Chimie - Livret 1 - Corriges.pdf";
const P = p => ({ fichier: F, page: p });

const SURFACE = "<svg viewBox='0 0 440 270' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13' fill='#2e2419'>" +
  "<rect x='20' y='220' width='400' height='8' fill='#b08d3a'/>" +
  // bécher
  "<rect x='41' y='140' width='98' height='80' fill='#7fb0d8' opacity='.7'/>" +
  "<path d='M34 84 L40 92 V220 H140 V90' fill='none' stroke='#2e2419' stroke-width='2'/>" +
  // fil à plomb
  "<line x1='210' y1='34' x2='210' y2='190' stroke='#2e2419' stroke-width='1.5'/>" +
  "<path d='M202 190 h16 v10 l-8 10 l-8 -10 z' fill='#5b5044'/>" +
  "<path d='M210 128 H222 V140' fill='none' stroke='#6b2d5c' stroke-width='2'/>" +
  "<text x='228' y='124' fill='#6b2d5c' font-size='12'>angle droit</text>" +
  // ballon
  "<path d='M281 140 A55 55 0 1 0 379 140 Z' fill='#7fb0d8' opacity='.7'/>" +
  "<path d='M320 111 A55 55 0 1 0 340 111' fill='none' stroke='#2e2419' stroke-width='2'/>" +
  "<path d='M320 111 V58 M340 111 V58' stroke='#2e2419' stroke-width='2'/>" +
  // surface libre commune
  "<line x1='20' y1='140' x2='420' y2='140' stroke='#2f5a8a' stroke-width='2' stroke-dasharray='7 5'/>" +
  "<g text-anchor='middle'><text x='90' y='246'>bécher</text><text x='210' y='246'>fil à plomb</text><text x='330' y='246'>ballon</text></g>" +
  "<text x='220' y='266' text-anchor='middle' fill='#2f5a8a' font-size='12'>surface libre : plane et horizontale, quel que soit le récipient</text>" +
  "</svg>";

module.exports = {
  id: "physique-s01-1",
  fiches: [
    {
      id: "physique-s01-1-f1", notion: "La matière et ses trois états",
      titre: "Tout ce qui a une masse",
      texte: "La matière, c'est tout ce qui possède une masse : on peut la peser. Elle se présente sous trois états : solide, liquide ou gazeux. Pour classer des exemples, on construit un tableau à simple entrée, avec une colonne par état : le fer et le bois sont solides, le sang est liquide, l'air est gazeux.",
      pointsCles: ["Matière = ce qui a une masse", "Trois états : solide, liquide, gazeux", "Tableau à simple entrée : une colonne par état"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "matière", def: "tout ce qui possède une masse et peut donc se peser" },
        { mot: "tableau à simple entrée", def: "un tableau où l'on range des exemples dans des colonnes, une colonne par catégorie" }
      ],
      schema: null, prerequis: [], source: P(1)
    },
    {
      id: "physique-s01-1-f2", notion: "L'état solide",
      titre: "Le solide garde sa forme",
      texte: "Un solide a une forme propre : il garde sa forme, sans prendre celle du récipient. On peut le prendre en main. On ne peut pas le comprimer : il est non compressible. Un stylo, du verre, du bois, du fer, la peau ou une feuille d'arbre sont des solides.",
      pointsCles: ["Forme propre", "Se saisit avec la main", "Non compressible"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "forme propre", def: "une forme que la matière garde d'elle-même, sans prendre celle du récipient" },
        { mot: "compressible", def: "qu'on peut comprimer, c'est-à-dire serrer pour qu'il prenne moins de place" }
      ],
      schema: null, prerequis: ["physique-s01-1-f1"], source: P(1)
    },
    {
      id: "physique-s01-1-f3", notion: "Le sucre en poudre, un solide qui semble couler",
      titre: "Le piège du sucre en poudre",
      texte: "Quand on verse un paquet de sucre en poudre, il a l'air de couler comme un liquide. Pourtant, c'est un solide : il est fait de minuscules cristaux solides. Chaque grain garde sa propre forme et ne se comprime pas. L'impression qu'il coule vient des grains qui roulent les uns sur les autres.",
      pointsCles: ["Sucre en poudre = solide", "Des grains minuscules, chacun avec sa forme propre", "Il semble couler car les grains roulent entre eux"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "cristal", def: "un grain de matière solide qui a sa propre forme, comme ceux du sucre en poudre" }
      ],
      schema: null, prerequis: ["physique-s01-1-f2"], source: P(2)
    },
    {
      id: "physique-s01-1-f4", notion: "L'état liquide",
      titre: "Le liquide prend la forme du récipient",
      texte: "Un liquide n'a pas de forme propre : il épouse la forme du récipient qui le contient. Il coule, mais on ne peut pas le comprimer. Sa surface libre, celle qui touche l'air, est plane et horizontale. Le jus de pomme et le sang sont des liquides.",
      pointsCles: ["Pas de forme propre", "Coule", "Non compressible", "Surface libre plane et horizontale"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "surface libre", def: "la surface d'un liquide qui est au contact de l'air" }
      ],
      schema: "physique-s01-1-s1", prerequis: ["physique-s01-1-f1"], source: P(1)
    },
    {
      id: "physique-s01-1-f5", notion: "La surface libre, un repère d'horizontalité",
      titre: "Le niveau du bricoleur",
      texte: "Dans un bécher comme dans un ballon arrondi, la surface libre d'un liquide reste horizontale. Le niveau du bricoleur s'en sert : son tube contient un liquide coloré et une bulle d'air, bordée par la surface libre. Posé sur un objet, il montre si celui-ci est horizontal. Le fil à plomb, lui, donne la verticale, perpendiculaire à l'horizontale.",
      pointsCles: ["Surface libre horizontale dans tout récipient", "Niveau : liquide coloré + bulle d'air", "Fil à plomb : verticale ; l'horizontale lui est perpendiculaire"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "niveau du bricoleur", def: "un tube rempli d'un liquide coloré avec une bulle d'air, qui vérifie qu'une surface est horizontale" }
      ],
      schema: "physique-s01-1-s1", prerequis: ["physique-s01-1-f4", "methode-instruments-f1"], source: P(2)
    },
    {
      id: "physique-s01-1-f6", notion: "L'état gazeux",
      titre: "Le gaz se comprime et s'étend",
      texte: "Un gaz, comme l'air ou la fumée, n'a pas de forme propre. On peut le comprimer : il est compressible. Il peut aussi s'étendre : il est expansible. Si l'on enfonce bien droit dans l'eau un verre retourné, avec un mouchoir coincé au fond, l'air enfermé dans le verre résiste à la pression de l'eau.",
      pointsCles: ["Pas de forme propre", "Compressible", "Expansible", "L'air enfermé dans un verre retourné résiste à l'eau"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "expansible", def: "qui peut s'étendre et reprendre de la place, l'inverse de se laisser comprimer" },
        { mot: "gaz", def: "la matière à l'état gazeux, comme l'air ou la fumée" }
      ],
      schema: null, prerequis: ["physique-s01-1-f1"], source: P(1)
    }
  ],
  schemas: [
    { id: "physique-s01-1-s1", legende: "Dans le bécher comme dans le ballon, la surface libre est sur la même ligne horizontale ; le fil à plomb donne la verticale, à angle droit.", svg: SURFACE }
  ],
  questions: [
    // f1 : la matière et ses trois états
    { id: "physique-s01-1-q1", fiche: "physique-s01-1-f1", type: "qcm", niveau: 1,
      enonce: "Quelle propriété toute matière possède-t-elle ?",
      choix: ["Elle coule toujours", "Elle a une masse", "Elle est toujours colorée", "Elle est toujours solide"],
      reponse: "Elle a une masse",
      explication: "La matière, c'est ce qui a une masse. On peut donc la peser, qu'elle soit solide, liquide ou gazeuse.", source: P(1) },
    { id: "physique-s01-1-q2", fiche: "physique-s01-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Dans le tableau à simple entrée, lesquels vont dans la colonne « solide » ?",
      choix: ["Le jus de pomme", "Le sang", "Un stylo", "Le fer", "La fumée", "Une feuille d'arbre"],
      reponse: ["Un stylo", "Une feuille d'arbre", "Le fer"],
      explication: "Le stylo, la feuille et le fer gardent leur forme : ce sont des solides. Le sang et le jus de pomme sont liquides, la fumée est un gaz.", source: P(1) },
    { id: "physique-s01-1-q3", fiche: "physique-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La fumée est un liquide.",
      corrections: ["Faux : la fumée est un gaz, comme l'air.", "Faux : la fumée est un solide, comme le bois.", "Faux : la fumée n'est pas de la matière."],
      reponse: { vrai: false, correction: "Faux : la fumée est un gaz, comme l'air." },
      explication: "Dans le tableau de la séance, la fumée est rangée avec l'air. Ce sont deux gaz.", source: P(1) },
    { id: "physique-s01-1-q4", fiche: "physique-s01-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment ranger des exemples de matière selon leur état ?",
      choix: ["Du plus lourd au plus léger", "Selon leur couleur", "Dans un tableau à simple entrée, avec une colonne par état", "Par ordre alphabétique"],
      reponse: "Dans un tableau à simple entrée, avec une colonne par état",
      explication: "On fait une colonne « solide », une « liquide » et une « gazeux ». Chaque exemple va dans la colonne de son état.", source: P(1) },
    { id: "physique-s01-1-q5", fiche: "physique-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La matière peut se présenter sous trois états : solide, liquide ou gazeux.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : ce sont les trois états de la matière vus dans cette séance.", source: P(1) },
    // f2 : l'état solide
    { id: "physique-s01-1-q6", fiche: "physique-s01-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelle propriété appartient à l'état solide ?",
      choix: ["Il a une forme propre", "Il prend la forme du récipient", "Il coule", "Il se comprime facilement"],
      reponse: "Il a une forme propre",
      explication: "Un solide garde sa forme tout seul. C'est le liquide qui prend la forme du récipient.", source: P(1) },
    { id: "physique-s01-1-q7", fiche: "physique-s01-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "En appuyant fort, on peut comprimer un morceau de fer pour qu'il prenne moins de place.",
      corrections: ["Faux : un solide comme le fer n'est pas compressible.", "Faux : le fer est un gaz, il s'échapperait.", "Faux : le fer est un liquide, il coulerait."],
      reponse: { vrai: false, correction: "Faux : un solide comme le fer n'est pas compressible." },
      explication: "Un solide est non compressible. Seuls les gaz se laissent comprimer.", source: P(1) },
    { id: "physique-s01-1-q8", fiche: "physique-s01-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les trois propriétés d'un solide.",
      choix: ["Il coule", "Il est compressible", "Il est non compressible", "On peut le prendre en main", "Il a une forme propre", "Il prend la forme du récipient"],
      reponse: ["Il a une forme propre", "On peut le prendre en main", "Il est non compressible"],
      explication: "Forme propre, se saisit, non compressible : ce sont les trois marques du solide. Couler et prendre la forme du récipient, c'est le liquide.", source: P(1) },
    { id: "physique-s01-1-q9", fiche: "physique-s01-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi un stylo posé dans un verre ne prend-il pas la forme du verre ?",
      choix: ["Parce que le verre est trop petit", "Parce qu'un solide a une forme propre", "Parce qu'un stylo est compressible", "Parce que le stylo est un liquide"],
      reponse: "Parce qu'un solide a une forme propre",
      explication: "Le stylo est un solide : il garde sa forme où qu'on le pose. Un liquide, lui, prendrait la forme du verre.", source: P(1) },
    // f3 : le sucre en poudre
    { id: "physique-s01-1-q10", fiche: "physique-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Quand on verse le paquet, le sucre en poudre semble couler. Dans quel état est-il ?",
      choix: ["Solide", "Il change d'état en coulant", "Liquide", "Gazeux"],
      reponse: "Solide",
      explication: "Le sucre en poudre est fait de minuscules cristaux solides. Il n'est donc pas liquide, même s'il a l'air de couler.", source: P(2) },
    { id: "physique-s01-1-q11", fiche: "physique-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Chaque grain de sucre en poudre a sa propre forme.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : chaque grain est un petit cristal solide, avec sa forme propre.", source: P(2) },
    { id: "physique-s01-1-q12", fiche: "physique-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi le sucre en poudre donne-t-il l'impression de couler ?",
      choix: ["Parce qu'il est compressible", "Parce qu'il fond dans le paquet", "Parce que ses minuscules grains roulent les uns sur les autres", "Parce qu'il contient de l'eau"],
      reponse: "Parce que ses minuscules grains roulent les uns sur les autres",
      explication: "Les grains glissent et roulent entre eux quand on verse. Chaque grain, lui, reste solide.", source: P(2) },
    { id: "physique-s01-1-q13", fiche: "physique-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le sucre en poudre est un liquide, puisqu'il coule quand on le verse.",
      corrections: ["Faux : c'est un solide fait de minuscules cristaux qui roulent les uns sur les autres.", "Faux : c'est un gaz, puisqu'il se comprime.", "Faux : le sucre en poudre n'est pas de la matière."],
      reponse: { vrai: false, correction: "Faux : c'est un solide fait de minuscules cristaux qui roulent les uns sur les autres." },
      explication: "Il ne faut pas se fier à l'apparence : chaque grain garde sa forme et ne se comprime pas. Le sucre en poudre est un solide.", source: P(2) },
    // f4 : l'état liquide
    { id: "physique-s01-1-q14", fiche: "physique-s01-1-f4", type: "qcm", niveau: 1,
      enonce: "Quelle forme prend un liquide ?",
      choix: ["La forme du récipient qui le contient", "Une forme propre qu'il garde partout", "Toujours une forme de boule", "Aucune, il disparaît"],
      reponse: "La forme du récipient qui le contient",
      explication: "Un liquide n'a pas de forme propre. Il épouse la forme de son récipient.", source: P(2) },
    { id: "physique-s01-1-q15", fiche: "physique-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "On peut comprimer un liquide pour qu'il prenne moins de place.",
      corrections: ["Faux : un liquide est non compressible, comme un solide.", "Faux : un liquide se comprime seulement s'il est coloré.", "Faux : un liquide n'occupe aucune place."],
      reponse: { vrai: false, correction: "Faux : un liquide est non compressible, comme un solide." },
      explication: "Un liquide coule, mais il ne se comprime pas. Seul le gaz est compressible.", source: P(1) },
    { id: "physique-s01-1-q16", fiche: "physique-s01-1-f4", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur les liquides.",
      texte: "Un liquide n'a pas de forme ___. Sa surface libre est plane et ___.",
      banque: ["propre", "horizontale", "verticale", "ronde"],
      reponse: [["propre"], ["horizontale"]],
      explication: "Un liquide prend la forme de son récipient. Sa surface libre est plane et horizontale.", source: P(1) },
    { id: "physique-s01-1-q17", fiche: "physique-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment reconnaître qu'une matière est à l'état liquide ?",
      choix: ["Elle garde sa forme partout", "Elle coule et prend la forme de son récipient", "Elle se laisse comprimer", "Elle est transparente"],
      reponse: "Elle coule et prend la forme de son récipient",
      explication: "Couler et prendre la forme du récipient, c'est la marque du liquide. Un solide garde sa forme, un gaz se comprime.", source: P(1) },
    // f5 : la surface libre, repère d'horizontalité
    { id: "physique-s01-1-q18", fiche: "physique-s01-1-f5", type: "qcm", niveau: 1,
      enonce: "Quel outil, fait d'un tube de liquide coloré avec une bulle d'air, vérifie qu'une étagère est horizontale ?",
      choix: ["Le niveau du bricoleur", "La balance électronique", "Le fil à plomb", "Le réglet"],
      reponse: "Le niveau du bricoleur",
      explication: "La bulle du niveau est bordée par la surface libre du liquide, toujours horizontale. Posé sur l'étagère, il montre si elle est bien à plat.", source: P(2) },
    { id: "physique-s01-1-q19", fiche: "physique-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Dans un ballon de verre arrondi, la surface libre de l'eau suit la forme arrondie du ballon.",
      corrections: ["Faux : elle reste plane et horizontale, quelle que soit la forme du récipient.", "Faux : dans un ballon, elle devient verticale.", "Faux : un ballon ne peut pas contenir d'eau."],
      reponse: { vrai: false, correction: "Faux : elle reste plane et horizontale, quelle que soit la forme du récipient." },
      explication: "Dans un bécher comme dans un ballon, la surface libre est plane et horizontale. La forme du récipient n'y change rien.", source: P(2) },
    { id: "physique-s01-1-q20", fiche: "physique-s01-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi le niveau du bricoleur permet-il de tester si un objet est horizontal ?",
      choix: ["Parce que son tube se plie à la forme de l'objet", "Parce que sa bulle d'air est un solide", "Parce que la surface libre du liquide qui borde la bulle reste horizontale, quelle que soit la position du tube", "Parce que son liquide coloré est compressible"],
      reponse: "Parce que la surface libre du liquide qui borde la bulle reste horizontale, quelle que soit la position du tube",
      explication: "La surface libre du liquide reste horizontale, même si le tube penche. La bulle sert donc de repère pour savoir si l'objet est à plat.", source: P(2) },
    { id: "physique-s01-1-q21", fiche: "physique-s01-1-f5", type: "qcm", niveau: 2,
      enonce: "Le fil à plomb montre la verticale. Comment en déduire l'horizontale ?",
      choix: ["L'horizontale est parallèle au fil : elle va dans le même sens que lui", "L'horizontale est perpendiculaire à la verticale : elle forme avec elle un angle droit", "On ne peut rien en déduire, il faut un autre outil", "On pèse le fil à plomb : son poids donne l'horizontale"],
      reponse: "L'horizontale est perpendiculaire à la verticale : elle forme avec elle un angle droit",
      explication: "La verticale et l'horizontale se coupent à angle droit. Connaître l'une permet donc de trouver l'autre.", source: P(2) },
    // f6 : l'état gazeux
    { id: "physique-s01-1-q22", fiche: "physique-s01-1-f6", type: "qcm", niveau: 1,
      enonce: "Lequel de ces exemples est un gaz ?",
      choix: ["La fumée", "Le sang", "Le fer", "Le verre"],
      reponse: "La fumée",
      explication: "La fumée, comme l'air, est à l'état gazeux. Le sang est liquide, le fer et le verre sont solides.", source: P(1) },
    { id: "physique-s01-1-q23", fiche: "physique-s01-1-f6", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les trois propriétés d'un gaz.",
      choix: ["Sa surface libre est horizontale", "Il est compressible", "Il n'a pas de forme propre", "Il est non compressible", "Il est expansible", "Il a une forme propre"],
      reponse: ["Il n'a pas de forme propre", "Il est compressible", "Il est expansible"],
      explication: "Un gaz n'a pas de forme propre, se comprime et peut s'étendre. La surface libre horizontale, c'est le liquide.", source: P(1) },
    { id: "physique-s01-1-q24", fiche: "physique-s01-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Un gaz est compressible : on peut le serrer pour qu'il prenne moins de place.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est même ce qui distingue le gaz du solide et du liquide.", source: P(1) },
    { id: "physique-s01-1-q25", fiche: "physique-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "On enfonce bien droit dans un saladier d'eau un verre retourné, avec un mouchoir coincé au fond. Que fait l'air enfermé dans le verre ?",
      choix: ["Il se transforme en eau", "Il résiste à la pression de l'eau", "Il traverse le verre", "Il disparaît aussitôt"],
      reponse: "Il résiste à la pression de l'eau",
      explication: "L'eau pousse sur l'air enfermé, et l'air lui résiste en cherchant à s'étendre. L'expérience montre que les gaz sont expansibles.", source: P(2) },
    { id: "physique-s01-1-q26", fiche: "physique-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi faut-il tenir fermement le verre retourné pendant qu'on l'enfonce dans l'eau ?",
      choix: ["Parce que l'eau repousse l'air enfermé et le verre risque de pencher", "Parce que l'air enfermé devient solide", "Parce que le verre devient brûlant", "Parce que l'eau se met à bouillir"],
      reponse: "Parce que l'eau repousse l'air enfermé et le verre risque de pencher",
      explication: "L'eau repousse l'air enfermé dans le verre, et l'air lui résiste. Sans le tenir, le verre risquerait de pencher et de couler au fond du saladier.", source: P(2) },
    { id: "physique-s01-1-q27", fiche: "physique-s01-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Un gaz a une forme propre, comme un solide.",
      corrections: ["Faux : un gaz n'a pas de forme propre, comme un liquide.", "Faux : un gaz a toujours la forme d'une bulle.", "Faux : un gaz n'a aucune propriété."],
      reponse: { vrai: false, correction: "Faux : un gaz n'a pas de forme propre, comme un liquide." },
      explication: "Seul le solide a une forme propre. Le liquide et le gaz n'en ont pas.", source: P(1) }
  ],
  bonus: [
    {
      id: "physique-s01-1-b1",
      fiche: "physique-s01-1-f5",
      titre: "L'invention du niveau à bulle",
      texte: "Le niveau à bulle aurait été inventé vers 1660 par le savant français Melchisédech Thévenot. Il a d'abord servi aux mesures de précision. Jusqu'à la fin du XVIIIe siècle au moins, maçons et charpentiers utilisaient encore un niveau en bois équipé d'un fil à plomb.",
      source: { titre: "Niveau à bulle", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Niveau_%C3%A0_bulle" }
    }
  ],
  nonCouvert: [
    "Le livret de cours de la séance n'est pas déposé : seules les réponses du corrigé et la fiche de mémorisation photographiée servent de source.",
    "Le résultat observé de l'expérience du verre retourné (le mouchoir est-il mouillé ?) : le corrigé donne la conclusion sur l'air, pas l'observation.",
    "La fiche de mémorisation photographiée ne montre que la partie I du chapitre (la matière et ses trois états) : la suite du chapitre n'apparaît pas pour cette séance."
  ]
};
