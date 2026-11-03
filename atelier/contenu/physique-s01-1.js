// Source en clair du cours physique-s01-1 « Séance 1 – Les états de la matière (1) ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js physique-s01-1.
// Seule source déposée : le corrigé du livret 1 (thème A, chapitre 1, séance 1, pages 1 et 2) :
// tableau à simple entrée, fiche de mémorisation (photo de cahier, page 1) et exercices d'application (page 2).
// Le livret de cours lui-même n'est pas déposé. Le fil à plomb est déjà vu dans le savoir-faire methode-instruments :
// il n'est ici qu'un rappel (prérequis), sans le refaire.
const F = "cours/physique-chimie/Cours Griffon 5eme Physique Chimie - Livret 1 - Corriges.pdf";
const P = p => ({ fichier: F, page: p });
// Audit des questions du 28/10/2026 appliqué : q4, q36, q45, q46 et q47 supprimées (consigne, doublons, protocole), q26 réécrite.

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
      enonce: "Quelle propriété toute matière possède-t-elle, quel que soit son état ?",
      choix: ["Elle a une forme propre", "Elle a une masse", "Elle se laisse comprimer", "Elle coule quand on la verse"],
      reponse: "Elle a une masse",
      explication: "La matière, c'est tout ce qui a une masse : on peut la peser. Avoir une forme propre, se comprimer ou couler dépend de l'état.", source: P(1) },
    { id: "physique-s01-1-q2", fiche: "physique-s01-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquels de ces exemples sont à l'état solide ?",
      choix: ["Le bois", "La fumée", "La peau", "Le verre", "Le jus de pomme", "Le sang"],
      reponse: ["La peau", "Le verre", "Le bois"],
      explication: "La peau, le verre et le bois sont rangés parmi les solides. Le sang et le jus de pomme sont liquides, la fumée est un gaz.", source: P(1) },
    { id: "physique-s01-1-q3", fiche: "physique-s01-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La fumée est à l'état liquide, comme le sang.",
      corrections: ["Faux : la fumée est à l'état gazeux, comme l'air.", "Faux : la fumée est à l'état solide, comme le bois.", "Faux : la fumée n'est pas de la matière, car elle n'a pas de masse."],
      reponse: { vrai: false, correction: "Faux : la fumée est à l'état gazeux, comme l'air." },
      explication: "La fumée est rangée avec l'air : ce sont deux gaz. Le sang, lui, est un liquide.", source: P(1) },
    { id: "physique-s01-1-q5", fiche: "physique-s01-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La matière peut se présenter sous trois états : solide, liquide ou gazeux.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : solide, liquide et gazeux sont les trois états de la matière. Chaque exemple se range dans l'un d'eux.", source: P(1) },
    { id: "physique-s01-1-q28", fiche: "physique-s01-1-f1", type: "association", niveau: 2,
      enonce: "Relie chaque exemple de matière à son état.",
      gauche: ["Le sang", "Le fer", "L'air"],
      droite: ["Gazeux", "Solide", "Liquide"],
      reponse: [[0, 2], [1, 1], [2, 0]],
      explication: "Le sang est liquide et le fer est solide. L'air, comme la fumée, est un gaz.", source: P(1) },
    { id: "physique-s01-1-q29", fiche: "physique-s01-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'air, qu'on ne voit pas, est-il quand même de la matière ?",
      choix: ["Parce qu'il a une masse", "Parce qu'il a une forme propre", "Parce qu'il est non compressible", "Parce qu'il coule comme un liquide"],
      reponse: "Parce qu'il a une masse",
      explication: "Tout ce qui a une masse est de la matière, qu'on le voie ou non. L'air est rangé parmi les gaz : il a donc une masse.", source: P(1) },
    { id: "physique-s01-1-q30", fiche: "physique-s01-1-f1", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur la matière.",
      texte: "La matière, c'est tout ce qui possède une ___ : on peut donc la ___.",
      banque: ["masse", "peser", "forme", "voir"],
      reponse: [["masse"], ["peser"]],
      explication: "Avoir une masse, c'est pouvoir être pesé. L'air ne se voit pas, et pourtant c'est de la matière.", source: P(1) },
    // f2 : l'état solide
    { id: "physique-s01-1-q6", fiche: "physique-s01-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelle propriété appartient à l'état solide ?",
      choix: ["Il prend la forme du récipient", "Il est expansible", "Il a une forme propre", "Il se laisse comprimer"],
      reponse: "Il a une forme propre",
      explication: "Un solide garde sa forme tout seul. C'est le liquide qui prend la forme du récipient, et le gaz qui se comprime et s'étend.", source: P(1) },
    { id: "physique-s01-1-q7", fiche: "physique-s01-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "En appuyant fort, on peut comprimer un morceau de fer pour qu'il prenne moins de place.",
      corrections: ["Faux : un solide comme le fer est non compressible.", "Faux : le fer se comprime, mais il reprend aussitôt sa place.", "Faux : seuls les solides mous, comme la peau, se laissent comprimer."],
      reponse: { vrai: false, correction: "Faux : un solide comme le fer est non compressible." },
      explication: "Un solide est non compressible, qu'il soit dur ou mou. Seuls les gaz se laissent comprimer.", source: P(1) },
    { id: "physique-s01-1-q8", fiche: "physique-s01-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les trois propriétés d'un solide.",
      choix: ["Il est compressible", "Il a une forme propre", "Il est non compressible", "On peut le prendre en main", "Il prend la forme du récipient", "Il coule"],
      reponse: ["Il a une forme propre", "On peut le prendre en main", "Il est non compressible"],
      explication: "Forme propre, se saisit, non compressible : ce sont les trois marques du solide. Couler et prendre la forme du récipient, c'est le liquide.", source: P(1) },
    { id: "physique-s01-1-q9", fiche: "physique-s01-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi un stylo posé dans un verre ne prend-il pas la forme du verre ?",
      choix: ["Parce qu'un solide est non compressible", "Parce qu'un stylo se saisit avec la main", "Parce qu'un solide a une forme propre", "Parce que le stylo est plus long que le verre"],
      reponse: "Parce qu'un solide a une forme propre",
      explication: "Le stylo est un solide : il garde sa forme où qu'on le pose. Être non compressible ne suffit pas, car un liquide l'est aussi et prend pourtant la forme du verre.", source: P(1) },
    { id: "physique-s01-1-q31", fiche: "physique-s01-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "La peau et une feuille d'arbre sont des solides.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : elles sont rangées avec le stylo, le bois et le fer. Ce sont des solides, même si elles sont souples.", source: P(1) },
    { id: "physique-s01-1-q32", fiche: "physique-s01-1-f2", type: "vrai_faux", niveau: 3,
      enonce: "Un solide a une forme propre, se saisit avec la main et se laisse comprimer.",
      corrections: ["Faux : il a une forme propre et se saisit, mais il est non compressible.", "Faux : il se laisse comprimer, mais il n'a pas de forme propre.", "Faux : il a une forme propre, mais il ne se saisit pas avec la main."],
      reponse: { vrai: false, correction: "Faux : il a une forme propre et se saisit, mais il est non compressible." },
      explication: "Les trois marques du solide sont : forme propre, se saisit, non compressible. C'est le gaz qui se laisse comprimer.", source: P(1) },
    { id: "physique-s01-1-q33", fiche: "physique-s01-1-f2", type: "qcm", niveau: 3,
      enonce: "Quelle propriété le solide a-t-il en commun avec le liquide ?",
      choix: ["Ils sont tous deux non compressibles", "Ils gardent tous deux leur forme propre", "Ils coulent tous les deux", "Ils sont tous deux expansibles"],
      reponse: "Ils sont tous deux non compressibles",
      explication: "Ni le solide ni le liquide ne se laissent comprimer. En revanche, seul le solide a une forme propre et seul le liquide coule.", source: P(1) },
    { id: "physique-s01-1-q34", fiche: "physique-s01-1-f2", type: "qcm", niveau: 2,
      enonce: "Un objet garde la même forme dans une boîte ou dans un bol, et on ne peut pas le comprimer. Dans quel état est-il ?",
      choix: ["Liquide", "Gazeux", "On ne peut pas le savoir", "Solide"],
      reponse: "Solide",
      explication: "Garder sa forme, c'est avoir une forme propre. Avec la non-compressibilité, c'est la marque du solide.", source: P(1) },
    // f3 : le sucre en poudre
    { id: "physique-s01-1-q10", fiche: "physique-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Quand on verse le paquet, le sucre en poudre semble couler. Dans quel état est-il ?",
      choix: ["Liquide", "Solide", "Gazeux", "Il change d'état en coulant"],
      reponse: "Solide",
      explication: "Le sucre en poudre est fait de minuscules cristaux solides. Il n'est donc pas liquide, même s'il a l'air de couler.", source: P(2) },
    { id: "physique-s01-1-q11", fiche: "physique-s01-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Chaque grain de sucre en poudre a sa propre forme.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : chaque grain est un petit cristal solide, avec sa forme propre.", source: P(2) },
    { id: "physique-s01-1-q12", fiche: "physique-s01-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi le sucre en poudre donne-t-il l'impression de couler ?",
      choix: ["Parce que ses grains fondent un peu quand on le verse", "Parce que ses grains roulent les uns sur les autres", "Parce que ses grains se compriment les uns contre les autres", "Parce qu'il contient un peu d'eau entre ses grains"],
      reponse: "Parce que ses grains roulent les uns sur les autres",
      explication: "Quand on verse le paquet, les minuscules cristaux roulent les uns sur les autres. Chaque grain, lui, reste solide et garde sa forme.", source: P(2) },
    { id: "physique-s01-1-q13", fiche: "physique-s01-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le sucre en poudre est un liquide, puisqu'il coule quand on le verse.",
      corrections: ["Faux : c'est un solide fait de minuscules cristaux qui roulent les uns sur les autres.", "Faux : c'est un solide, car chaque grain est compressible.", "Faux : c'est un mélange de solide et de liquide."],
      reponse: { vrai: false, correction: "Faux : c'est un solide fait de minuscules cristaux qui roulent les uns sur les autres." },
      explication: "Il ne faut pas se fier à l'apparence : chaque grain garde sa forme et ne se comprime pas. Le sucre en poudre est un solide.", source: P(2) },
    { id: "physique-s01-1-q35", fiche: "physique-s01-1-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Quels arguments prouvent que le sucre en poudre est un solide ?",
      choix: ["Il est fait de minuscules cristaux solides", "Il se verse comme du jus de pomme", "Chaque grain a une forme propre", "Il prend la forme du paquet", "Il coule quand on verse le paquet", "Chaque grain est non compressible"],
      reponse: ["Chaque grain a une forme propre", "Chaque grain est non compressible", "Il est fait de minuscules cristaux solides"],
      explication: "Forme propre, non compressible, cristaux solides : ce sont des preuves de l'état solide. Couler n'est qu'une impression, due aux grains qui roulent.", source: P(2) },
    { id: "physique-s01-1-q37", fiche: "physique-s01-1-f3", type: "qcm", niveau: 3,
      enonce: "Comment savoir dans quel état est le sucre en poudre ?",
      choix: ["En regardant le tas de sucre s'écouler comme un liquide quand on verse le paquet", "En comparant sa couleur à celle des autres solides", "En pesant le paquet avant et après l'avoir versé", "En observant un seul grain : il garde sa forme et ne se comprime pas"],
      reponse: "En observant un seul grain : il garde sa forme et ne se comprime pas",
      explication: "Il faut regarder un grain, pas le tas qui s'écoule : un grain garde sa forme et ne se laisse pas comprimer. C'est la marque d'un solide.", source: P(2) },
    { id: "physique-s01-1-q38", fiche: "physique-s01-1-f3", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur le sucre en poudre.",
      texte: "Le sucre en poudre est formé de minuscules ___ solides, qui ___ les uns sur les autres quand on verse le paquet.",
      banque: ["cristaux", "roulent", "gouttes", "fondent"],
      reponse: [["cristaux"], ["roulent"]],
      explication: "Ce sont des cristaux, donc des grains solides. Ils roulent entre eux, ce qui donne l'impression que le sucre coule.", source: P(2) },
    // f4 : l'état liquide
    { id: "physique-s01-1-q14", fiche: "physique-s01-1-f4", type: "qcm", niveau: 2,
      enonce: "Quelle forme prend un liquide ?",
      choix: ["La forme du récipient qui le contient", "Une forme propre, qu'il garde partout", "La forme du premier récipient où on l'a versé", "La forme qu'on lui donne en le comprimant"],
      reponse: "La forme du récipient qui le contient",
      explication: "Un liquide n'a pas de forme propre : il épouse la forme de son récipient. Et comme il est non compressible, on ne peut pas le façonner en le serrant.", source: P(2) },
    { id: "physique-s01-1-q15", fiche: "physique-s01-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "On peut comprimer un liquide pour qu'il prenne moins de place.",
      corrections: ["Faux : un liquide est non compressible, comme un solide.", "Faux : un liquide se laisse comprimer, mais il n'est pas expansible.", "Faux : un liquide se comprime seulement dans un récipient fermé."],
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
      choix: ["Elle garde sa forme et ne se comprime pas", "Elle n'a pas de forme et se laisse comprimer", "Elle coule et prend la forme de son récipient", "Elle coule, mais elle se laisse aussi comprimer"],
      reponse: "Elle coule et prend la forme de son récipient",
      explication: "Couler et prendre la forme du récipient, c'est la marque du liquide. Un solide garde sa forme, un gaz se comprime.", source: P(1) },
    { id: "physique-s01-1-q39", fiche: "physique-s01-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Un liquide coule, mais on ne peut pas le comprimer.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : couler et être non compressible sont deux propriétés du liquide. Il partage la seconde avec le solide.", source: P(1) },
    { id: "physique-s01-1-q40", fiche: "physique-s01-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "La surface libre d'un liquide, celle qui touche l'air, est plane et verticale.",
      corrections: ["Faux : elle est plane et horizontale.", "Faux : elle est arrondie et horizontale.", "Faux : elle prend la forme du récipient."],
      reponse: { vrai: false, correction: "Faux : elle est plane et horizontale." },
      explication: "La surface libre d'un liquide est plane et horizontale. C'est le fil à plomb qui donne la verticale.", source: P(1) },
    { id: "physique-s01-1-q41", fiche: "physique-s01-1-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Coche toutes les propriétés d'un liquide.",
      choix: ["Sa surface libre est plane et horizontale", "Il n'a pas de forme propre", "Il est expansible", "Il est non compressible", "Il a une forme propre", "Il coule"],
      reponse: ["Il n'a pas de forme propre", "Il coule", "Il est non compressible", "Sa surface libre est plane et horizontale"],
      explication: "Le liquide a quatre marques : pas de forme propre, il coule, il est non compressible, sa surface libre est plane et horizontale. Être expansible, c'est le gaz.", source: P(1) },
    { id: "physique-s01-1-q42", fiche: "physique-s01-1-f4", type: "qcm", niveau: 3,
      enonce: "Qu'est-ce qui distingue un liquide d'un gaz ?",
      choix: ["Le liquide a une forme propre, le gaz n'en a pas", "Le liquide est expansible, le gaz ne l'est pas", "Le liquide est non compressible, le gaz est compressible", "Le gaz a une surface libre horizontale, le liquide non"],
      reponse: "Le liquide est non compressible, le gaz est compressible",
      explication: "Ni le liquide ni le gaz n'ont de forme propre. Mais seul le gaz se laisse comprimer, et seul le liquide a une surface libre plane et horizontale.", source: P(1) },
    // f5 : la surface libre, repère d'horizontalité
    { id: "physique-s01-1-q18", fiche: "physique-s01-1-f5", type: "qcm", niveau: 1,
      enonce: "Quel outil, fait d'un tube de liquide coloré avec une bulle d'air, vérifie qu'une étagère est horizontale ?",
      choix: ["Le niveau du bricoleur", "La balance électronique", "Le fil à plomb", "Le réglet"],
      reponse: "Le niveau du bricoleur",
      explication: "La bulle du niveau est bordée par la surface libre du liquide, toujours horizontale. Posé sur l'étagère, il montre si elle est bien à plat.", source: P(2) },
    { id: "physique-s01-1-q19", fiche: "physique-s01-1-f5", type: "vrai_faux", niveau: 3,
      enonce: "Dans un ballon de verre arrondi, la surface libre de l'eau suit la forme arrondie du ballon.",
      corrections: ["Faux : elle reste plane et horizontale, quelle que soit la forme du récipient.", "Faux : elle reste horizontale, mais elle se creuse comme le fond du ballon.", "Faux : elle suit la forme du ballon seulement quand il est penché."],
      reponse: { vrai: false, correction: "Faux : elle reste plane et horizontale, quelle que soit la forme du récipient." },
      explication: "Dans un bécher comme dans un ballon, la surface libre est plane et horizontale. La forme du récipient n'y change rien.", source: P(2) },
    { id: "physique-s01-1-q20", fiche: "physique-s01-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi le niveau du bricoleur permet-il de tester si un objet est horizontal ?",
      choix: ["Le liquide coloré garde sa forme propre, même quand le tube penche", "Le liquide coloré se comprime du côté où le tube penche", "La bulle d'air est un solide qui reste toujours horizontal", "La surface libre qui borde la bulle reste toujours horizontale"],
      reponse: "La surface libre qui borde la bulle reste toujours horizontale",
      explication: "La surface libre du liquide reste horizontale, quelle que soit la position du tube. La bulle sert donc de repère pour savoir si l'objet est à plat.", source: P(2) },
    { id: "physique-s01-1-q21", fiche: "physique-s01-1-f5", type: "qcm", niveau: 2,
      enonce: "Le fil à plomb montre la verticale. Comment en déduire l'horizontale ?",
      choix: ["Elle est parallèle au fil, dans le même sens", "Elle forme un angle droit avec le fil", "Elle suit la direction où le poids tire le fil", "Elle forme avec le fil un angle plus petit qu'un angle droit"],
      reponse: "Elle forme un angle droit avec le fil",
      explication: "La verticale et l'horizontale se coupent à angle droit. Connaître l'une permet donc de trouver l'autre.", source: P(2) },
    { id: "physique-s01-1-q43", fiche: "physique-s01-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le tube du niveau du bricoleur contient un liquide coloré et une bulle d'air.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la bulle est bordée par la surface libre du liquide coloré. Cette surface reste horizontale.", source: P(2) },
    { id: "physique-s01-1-q44", fiche: "physique-s01-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le fil à plomb donne l'horizontale ; la verticale lui est perpendiculaire.",
      corrections: ["Faux : il donne la verticale ; l'horizontale lui est perpendiculaire.", "Faux : il donne la verticale ; l'horizontale lui est parallèle.", "Faux : il donne l'horizontale ; la verticale lui est parallèle."],
      reponse: { vrai: false, correction: "Faux : il donne la verticale ; l'horizontale lui est perpendiculaire." },
      explication: "Le fil à plomb pend à la verticale. L'horizontale forme avec lui un angle droit.", source: P(2) },
    // f6 : l'état gazeux
    { id: "physique-s01-1-q22", fiche: "physique-s01-1-f6", type: "qcm", niveau: 1,
      enonce: "Lequel de ces exemples est un gaz ?",
      choix: ["Le sang", "Le fer", "Le jus de pomme", "La fumée"],
      reponse: "La fumée",
      explication: "La fumée, comme l'air, est à l'état gazeux. Le sang et le jus de pomme sont liquides, le fer est solide.", source: P(1) },
    { id: "physique-s01-1-q23", fiche: "physique-s01-1-f6", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les trois propriétés d'un gaz.",
      choix: ["Il a une forme propre", "Il est compressible", "Sa surface libre est horizontale", "Il est expansible", "Il n'a pas de forme propre", "Il est non compressible"],
      reponse: ["Il n'a pas de forme propre", "Il est compressible", "Il est expansible"],
      explication: "Un gaz n'a pas de forme propre, se comprime et peut s'étendre. La surface libre horizontale, c'est le liquide.", source: P(1) },
    { id: "physique-s01-1-q24", fiche: "physique-s01-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Un gaz est compressible : on peut le serrer pour qu'il prenne moins de place.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est même ce qui distingue le gaz du solide et du liquide.", source: P(1) },
    { id: "physique-s01-1-q25", fiche: "physique-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "On enfonce bien droit dans un saladier d'eau un verre retourné, avec un mouchoir coincé au fond. Que fait l'air enfermé dans le verre ?",
      choix: ["Il résiste à la pression de l'eau", "Il devient liquide sous la pression de l'eau", "Il garde une forme propre, comme un solide", "Il n'oppose aucune résistance à l'eau"],
      reponse: "Il résiste à la pression de l'eau",
      explication: "L'eau pousse sur l'air enfermé, et l'air lui résiste en cherchant à s'étendre. Il reste un gaz, sans forme propre.", source: P(2) },
    { id: "physique-s01-1-q26", fiche: "physique-s01-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on comprimer l'air d'une pompe à vélo en bouchant la sortie, mais pas l'eau d'une seringue bouchée ?",
      choix: ["Parce que l'air est beaucoup plus léger que l'eau", "Parce qu'un gaz est compressible et qu'un liquide ne l'est pas", "Parce que l'eau garde une forme propre dans la seringue", "Parce que l'air s'échappe peu à peu à travers les parois de la pompe"],
      reponse: "Parce qu'un gaz est compressible et qu'un liquide ne l'est pas",
      explication: "L'air est un gaz : on peut le serrer pour qu'il prenne moins de place. L'eau est un liquide : elle coule, mais elle ne se comprime pas.", source: P(1) },
    { id: "physique-s01-1-q27", fiche: "physique-s01-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Un gaz est compressible et expansible, et il a une forme propre.",
      corrections: ["Faux : il est compressible et expansible, mais il n'a pas de forme propre.", "Faux : il a une forme propre, mais il n'est pas expansible.", "Faux : il est expansible et a une forme propre, mais il n'est pas compressible."],
      reponse: { vrai: false, correction: "Faux : il est compressible et expansible, mais il n'a pas de forme propre." },
      explication: "Un gaz se comprime et s'étend, mais n'a pas de forme propre. Seul le solide a une forme propre.", source: P(1) },
    { id: "physique-s01-1-q48", fiche: "physique-s01-1-f6", type: "qcm", niveau: 3,
      enonce: "Quel point commun le gaz a-t-il avec le liquide ?",
      choix: ["Il est non compressible", "Il a une surface libre horizontale", "Il n'a pas de forme propre", "Il est expansible"],
      reponse: "Il n'a pas de forme propre",
      explication: "Ni le gaz ni le liquide n'ont de forme propre. Mais le gaz se comprime et s'étend, alors que le liquide est non compressible.", source: P(1) },
    { id: "physique-s01-1-q49", fiche: "physique-s01-1-f6", type: "qcm", niveau: 3,
      enonce: "Quelle propriété des gaz l'expérience du verre retourné met-elle en évidence ?",
      choix: ["Ils sont expansibles", "Ils ont une forme propre", "Ils sont non compressibles", "Ils coulent comme les liquides"],
      reponse: "Ils sont expansibles",
      explication: "L'air enfermé résiste à la pression de l'eau par l'effet inverse : il cherche à s'étendre. Cette expansion montre que les gaz sont expansibles.", source: P(2) }
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
