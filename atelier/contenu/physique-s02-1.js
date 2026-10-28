// Source en clair du cours physique-s02-1 « Séance 2 – Le cycle de l'eau ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js physique-s02-1.
// Seule source déposée : le corrigé du livret 1 (thème A, chapitre 1, séance 2, page 3) : changements d'état
// de l'eau, eau sous ses trois états, test au sulfate de cuivre anhydre, réserves d'eau de la Terre.
// Le livret de cours lui-même n'est pas déposé. Le corrigé définit la solidification et la fusion (page 6, séance 5) ;
// pour la vaporisation et la liquéfaction, il ne donne que des exemples (lac qui baisse par évaporation, brouillard
// en microgouttelettes) et le tableau des états de l'eau (vapeur = gaz, brouillard = liquide) : le sens des deux mots
// (liquide → gaz, gaz → liquide) est tiré de ces exemples.
// Anti-spoil (physique-d1) : rien sur les températures de changement d'état, le graphique de fusion ni l'eau de mer salée.
const F = "cours/physique-chimie/Cours Griffon 5eme Physique Chimie - Livret 1 - Corriges.pdf";
const P = p => ({ fichier: F, page: p });
// Audit des questions du 28/10/2026 appliqué : 8 doublons ou détails du TP supprimés (q30, q31, q38, q39, q41, q43, q44, q46) ;
// 7 questions de thème (q37, q21, q22, q45, q50, q47, q48 : nuages, eau et corps, réserves d'eau, cycle de l'eau) ; q20 retouchée.
const THEME = "Séance 2 – Le cycle de l’eau"; // intitulé du planning, pour les questions de thème (règle du 25/10/2026)
const T = (titre, page) => ({ theme: THEME, titre, editeur: "Wikipédia", url: "https://fr.wikipedia.org/wiki/" + page });

const ETATS = "<svg viewBox='0 0 490 200' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13' fill='#2e2419'>" +
  "<defs><marker id='ps02fl' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='8' markerHeight='8' orient='auto'><path d='M0 0L10 5L0 10z' fill='#2e2419'/></marker></defs>" +
  "<rect x='15' y='82' width='110' height='40' rx='6' fill='#e8e1d3' stroke='#2e2419' stroke-width='2'/>" +
  "<rect x='190' y='82' width='110' height='40' rx='6' fill='#cfe2f1' stroke='#2e2419' stroke-width='2'/>" +
  "<rect x='365' y='82' width='110' height='40' rx='6' fill='#f3efe6' stroke='#2e2419' stroke-width='2' stroke-dasharray='5 3'/>" +
  "<g text-anchor='middle' font-weight='bold'><text x='70' y='107'>SOLIDE</text><text x='245' y='107'>LIQUIDE</text><text x='420' y='107'>GAZ</text></g>" +
  "<g fill='none' stroke='#2e2419' stroke-width='2' marker-end='url(#ps02fl)'>" +
  "<path d='M80 80 Q157 40 235 80'/><path d='M255 80 Q332 40 410 80'/>" +
  "<path d='M235 124 Q157 164 80 124'/><path d='M410 124 Q332 164 255 124'/></g>" +
  "<g text-anchor='middle' fill='#6b2d5c'><text x='157' y='24'>fusion</text><text x='332' y='24'>vaporisation</text>" +
  "<text x='157' y='170'>solidification</text><text x='332' y='170'>liquéfaction</text></g>" +
  "<g text-anchor='middle' font-size='11' fill='#5b5044'><text x='157' y='41'>la neige fond</text><text x='332' y='41'>le lac baisse en été</text>" +
  "<text x='157' y='187'>l'eau gèle</text><text x='332' y='187'>le brouillard se forme</text></g>" +
  "</svg>";

module.exports = {
  id: "physique-s02-1",
  fiches: [
    {
      id: "physique-s02-1-f1", notion: "Fusion et solidification",
      titre: "Entre solide et liquide",
      texte: "Quand la matière passe d'un état à un autre, on parle de changement d'état. Quand la neige fond, l'eau solide devient liquide : c'est une fusion. Quand l'eau gèle, l'eau liquide devient solide : c'est une solidification. Ces deux changements d'état vont en sens inverse l'un de l'autre.",
      pointsCles: ["Fusion : solide → liquide (la neige fond)", "Solidification : liquide → solide (l'eau gèle)"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "changement d'état", def: "le passage de la matière d'un état (solide, liquide, gazeux) à un autre" },
        { mot: "fusion", def: "le passage de l'état solide à l'état liquide" },
        { mot: "solidification", def: "le passage de l'état liquide à l'état solide" }
      ],
      schema: "physique-s02-1-s1", prerequis: ["physique-s01-1-f1"], source: P(3)
    },
    {
      id: "physique-s02-1-f2", notion: "Vaporisation et liquéfaction",
      titre: "Entre liquide et gaz",
      texte: "En été, le niveau des lacs baisse : leur eau s'évapore, elle passe de l'état liquide à l'état gazeux. C'est une vaporisation. À l'inverse, le brouillard est fait de minuscules gouttelettes d'eau : la vapeur d'eau y est devenue liquide. C'est une liquéfaction.",
      pointsCles: ["Vaporisation : liquide → gaz (l'eau des lacs s'évapore)", "Liquéfaction : gaz → liquide (le brouillard)"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "vaporisation", def: "le passage de l'état liquide à l'état gazeux" },
        { mot: "liquéfaction", def: "le passage de l'état gazeux à l'état liquide" },
        { mot: "évaporation", def: "la vaporisation de l'eau qui fait baisser le niveau des lacs en été" }
      ],
      schema: "physique-s02-1-s1", prerequis: ["physique-s02-1-f1"], source: P(3)
    },
    {
      id: "physique-s02-1-f3", notion: "L'eau dans la nature sous ses trois états",
      titre: "Givre, rosée, vapeur",
      texte: "Dans la nature, l'eau existe sous les trois états. Solide : le givre, la glace, la neige et la grêle. Liquide : la pluie, la rosée, la buée, mais aussi le brouillard et les nuages. Gazeux : la vapeur d'eau. Attention, brouillard et nuage ne sont pas du gaz.",
      pointsCles: ["Solide : givre, glace, neige, grêle", "Liquide : pluie, rosée, buée, brouillard, nuage", "Gazeux : vapeur d'eau"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "vapeur d'eau", def: "l'eau à l'état gazeux" },
        { mot: "givre", def: "de l'eau à l'état solide, comme la glace, la neige et la grêle" }
      ],
      schema: null, prerequis: ["physique-s01-1-f1"], source: P(3)
    },
    {
      id: "physique-s02-1-f4", notion: "Repérer l'eau avec le sulfate de cuivre anhydre",
      titre: "Le test de la poudre blanche",
      texte: "Le sulfate de cuivre anhydre est une poudre blanche qui devient bleue en présence d'eau. Avec le lait, le jus de fruits ou un soda au cola, il bleuit : ces liquides contiennent de l'eau. Avec le white-spirit, l'alcool ménager ou l'eau écarlate, il reste blanc. Tous les liquides ne contiennent donc pas d'eau.",
      pointsCles: ["Poudre blanche → bleue s'il y a de l'eau", "Bleuit : lait, jus de fruits, cola", "Reste blanc : white-spirit, alcool ménager, eau écarlate"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "sulfate de cuivre anhydre", def: "une poudre blanche qui devient bleue au contact de l'eau, et sert donc à la repérer" }
      ],
      schema: null, prerequis: [], source: P(3)
    },
    {
      id: "physique-s02-1-f5", notion: "L'eau, indispensable au corps",
      titre: "Ne boire que ce qui contient de l'eau",
      texte: "Notre corps a besoin d'eau pour vivre. Il ne faut jamais boire un liquide qui ne contient pas d'eau. Dans l'expérience du sulfate de cuivre, les liquides qui le laissent blanc, comme le white-spirit et l'alcool ménager, sont des poisons.",
      pointsCles: ["Le corps a besoin d'eau", "Ne jamais boire un liquide sans eau", "Dans l'expérience, les liquides sans eau sont des poisons"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "poison", def: "un produit dangereux pour le corps, qu'il ne faut pas avaler" }
      ],
      schema: null, prerequis: ["physique-s02-1-f4"], source: P(3)
    },
    {
      id: "physique-s02-1-f6", notion: "Les réserves d'eau de la Terre",
      titre: "Beaucoup d'eau, peu à boire",
      texte: "Le plus grand réservoir d'eau de la Terre, ce sont les océans et les mers, mais leur eau n'est pas potable. L'eau douce qu'on peut utiliser directement pour boire, cultiver et fabriquer se trouve dans les cours d'eau. Elle ne représente qu'environ 0,01 % de toute l'eau.",
      pointsCles: ["Plus grand réservoir : océans et mers, eau non potable", "Eau douce utilisable : les cours d'eau", "Environ 0,01 % de toute l'eau"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "potable", def: "qu'on peut boire sans danger" },
        { mot: "réservoir", def: "un endroit où l'eau est stockée en grande quantité, comme les océans" }
      ],
      schema: null, prerequis: [], source: P(3)
    }
  ],
  schemas: [
    { id: "physique-s02-1-s1", legende: "Les quatre changements d'état de l'eau vus dans la séance, avec un exemple pour chacun.", svg: ETATS }
  ],
  questions: [
    // f1 : fusion et solidification
    { id: "physique-s02-1-q1", fiche: "physique-s02-1-f1", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle le passage de l'état solide à l'état liquide, comme quand la neige fond ?",
      choix: ["La vaporisation", "La fusion", "La solidification", "La liquéfaction"],
      reponse: "La fusion",
      explication: "La neige solide devient de l'eau liquide. Ce changement d'état s'appelle la fusion.", source: P(3) },
    { id: "physique-s02-1-q2", fiche: "physique-s02-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Quand l'eau d'une flaque gèle, c'est une solidification.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'eau liquide devient de la glace, donc solide. C'est une solidification.", source: P(3) },
    { id: "physique-s02-1-q3", fiche: "physique-s02-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Quand la neige fond au soleil, c'est une solidification.",
      corrections: ["Faux : c'est une fusion, la neige solide devient liquide.", "Faux : c'est une liquéfaction, la neige solide devient liquide.", "Faux : c'est une vaporisation, la neige solide devient gazeuse."],
      reponse: { vrai: false, correction: "Faux : c'est une fusion, la neige solide devient liquide." },
      explication: "Fondre, c'est passer de solide à liquide : c'est la fusion. La solidification va dans l'autre sens.", source: P(3) },
    { id: "physique-s02-1-q4", fiche: "physique-s02-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que l'eau qui gèle se solidifie ?",
      choix: ["Parce qu'elle passe de l'état solide à l'état liquide", "Parce qu'elle passe de l'état gazeux à l'état solide", "Parce qu'elle passe de l'état liquide à l'état gazeux", "Parce qu'elle passe de l'état liquide à l'état solide"],
      reponse: "Parce qu'elle passe de l'état liquide à l'état solide",
      explication: "Geler, c'est devenir solide : l'eau liquide se change en glace. Le nom du changement d'état le dit : solidification.", source: P(3) },
    { id: "physique-s02-1-q27", fiche: "physique-s02-1-f1", type: "trou", niveau: 1,
      enonce: "Complète avec le nom des changements d'état.",
      texte: "Quand la neige fond, c'est une ___ ; quand l'eau gèle, c'est une ___.",
      banque: ["fusion", "solidification", "vaporisation", "liquéfaction"],
      reponse: [["fusion"], ["solidification"]],
      explication: "La neige passe de solide à liquide : fusion. L'eau qui gèle passe de liquide à solide : solidification.", source: P(3) },
    { id: "physique-s02-1-q28", fiche: "physique-s02-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La fusion et la solidification sont deux changements d'état qui vont en sens inverse.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la fusion va du solide au liquide, la solidification du liquide au solide. L'une défait ce que fait l'autre.", source: P(3) },
    { id: "physique-s02-1-q29", fiche: "physique-s02-1-f1", type: "qcm", niveau: 3,
      enonce: "Une flaque gèle pendant la nuit, puis la glace fond au soleil le lendemain. Quels changements d'état se succèdent ?",
      choix: ["Une solidification, puis une fusion", "Une fusion, puis une solidification", "Une liquéfaction, puis une vaporisation", "Une solidification, puis une liquéfaction"],
      reponse: "Une solidification, puis une fusion",
      explication: "La nuit, l'eau liquide devient solide : c'est une solidification. Le lendemain, la glace redevient liquide : c'est une fusion.", source: P(3) },
    // f2 : vaporisation et liquéfaction
    { id: "physique-s02-1-q5", fiche: "physique-s02-1-f2", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle le passage de l'état liquide à l'état gazeux ?",
      choix: ["La fusion", "La liquéfaction", "La vaporisation", "La solidification"],
      reponse: "La vaporisation",
      explication: "Le liquide devient vapeur : c'est la vaporisation. L'évaporation de l'eau d'un lac en est un exemple.", source: P(3) },
    { id: "physique-s02-1-q6", fiche: "physique-s02-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le brouillard, fait de minuscules gouttelettes d'eau, vient d'une liquéfaction.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la vapeur d'eau devient liquide en fines gouttelettes. C'est une liquéfaction.", source: P(3) },
    { id: "physique-s02-1-q7", fiche: "physique-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "En été, le niveau d'un lac baisse. Quel changement d'état de son eau en est la cause ?",
      choix: ["Une vaporisation", "Une fusion", "Une solidification", "Une liquéfaction"],
      reponse: "Une vaporisation",
      explication: "L'eau liquide du lac s'évapore : elle part sous forme de vapeur. L'évaporation est une vaporisation.", source: P(3) },
    { id: "physique-s02-1-q8", fiche: "physique-s02-1-f2", type: "association", niveau: 3,
      enonce: "Relie chaque phénomène au changement d'état qui lui correspond.",
      gauche: ["La neige fond", "L'eau gèle", "Le niveau d'un lac baisse en été", "Le brouillard se forme"],
      droite: ["Liquéfaction", "Fusion", "Vaporisation", "Solidification"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Fondre : fusion ; geler : solidification. S'évaporer : vaporisation ; former des gouttelettes : liquéfaction.", source: P(3) },
    { id: "physique-s02-1-q9", fiche: "physique-s02-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "La liquéfaction, c'est le passage de l'état liquide à l'état gazeux.",
      corrections: ["Faux : c'est le passage du gaz au liquide ; du liquide au gaz, c'est la vaporisation.", "Faux : c'est le passage du solide au liquide ; du liquide au gaz, c'est la fusion.", "Faux : c'est le passage du liquide au solide ; du liquide au gaz, c'est la vaporisation."],
      reponse: { vrai: false, correction: "Faux : c'est le passage du gaz au liquide ; du liquide au gaz, c'est la vaporisation." },
      explication: "Liquéfaction : on devient liquide. Le passage inverse, du liquide au gaz, est la vaporisation.", source: P(3) },
    { id: "physique-s02-1-q32", fiche: "physique-s02-1-f2", type: "qcm", niveau: 3,
      enonce: "Le brouillard est fait de minuscules gouttelettes d'eau. Dans quel état était cette eau juste avant de former les gouttelettes ?",
      choix: ["À l'état solide : c'était de la glace", "À l'état liquide : c'était déjà des gouttes de pluie", "Dans aucun état : ce n'était pas de la matière", "À l'état gazeux : c'était de la vapeur d'eau"],
      reponse: "À l'état gazeux : c'était de la vapeur d'eau",
      explication: "Le brouillard vient d'une liquéfaction : la vapeur d'eau, un gaz, devient liquide. Avant, l'eau était donc à l'état gazeux.", source: P(3) },
    { id: "physique-s02-1-q33", fiche: "physique-s02-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi l'évaporation de l'eau d'un lac est-elle une vaporisation ?",
      choix: ["Parce que l'eau gazeuse devient liquide", "Parce que l'eau liquide devient gazeuse", "Parce que l'eau solide devient liquide", "Parce que l'eau liquide devient solide"],
      reponse: "Parce que l'eau liquide devient gazeuse",
      explication: "Se vaporiser, c'est passer de l'état liquide à l'état de gaz, de vapeur. C'est ce qui arrive à l'eau d'un lac en été.", source: P(3) },
    { id: "physique-s02-1-q34", fiche: "physique-s02-1-f2", type: "qcm_multiple", niveau: 3,
      enonce: "Lesquels de ces changements d'état donnent de l'eau liquide ?",
      choix: ["La fusion", "La vaporisation", "La solidification", "La liquéfaction"],
      reponse: ["La fusion", "La liquéfaction"],
      explication: "La fusion part du solide et la liquéfaction part du gaz : toutes deux donnent un liquide. La solidification et la vaporisation, elles, partent du liquide.", source: P(3) },
    // f3 : l'eau dans la nature
    { id: "physique-s02-1-q10", fiche: "physique-s02-1-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les formes que prend l'eau à l'état solide.",
      choix: ["La neige", "La buée", "La rosée", "La vapeur d'eau", "Le givre", "La grêle"],
      reponse: ["Le givre", "La grêle", "La neige"],
      explication: "Givre, grêle, neige (et glace) sont de l'eau solide. La rosée et la buée sont liquides, la vapeur est un gaz.", source: P(3) },
    { id: "physique-s02-1-q11", fiche: "physique-s02-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Un nuage est fait d'eau à l'état gazeux.",
      corrections: ["Faux : le nuage est rangé avec l'eau liquide, comme le brouillard.", "Faux : le nuage est rangé avec l'eau solide, comme la grêle.", "Faux : le nuage est rangé à part, car il mélange les trois états."],
      reponse: { vrai: false, correction: "Faux : le nuage est rangé avec l'eau liquide, comme le brouillard." },
      explication: "Le nuage et le brouillard sont rangés avec l'eau liquide. Seule la vapeur d'eau est un gaz.", source: P(3) },
    { id: "physique-s02-1-q12", fiche: "physique-s02-1-f3", type: "qcm", niveau: 1,
      enonce: "Laquelle de ces formes de l'eau est à l'état gazeux ?",
      choix: ["La buée", "La vapeur d'eau", "Le brouillard", "La rosée du matin"],
      reponse: "La vapeur d'eau",
      explication: "La vapeur d'eau est la seule forme gazeuse de la liste. Buée, brouillard et rosée sont de l'eau liquide.", source: P(3) },
    { id: "physique-s02-1-q13", fiche: "physique-s02-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi le brouillard est-il rangé dans l'eau liquide, et non dans le gaz ?",
      choix: ["Parce qu'il est fait de minuscules cristaux de glace", "Parce qu'il est fait de vapeur d'eau qu'on voit", "Parce qu'il se forme par une vaporisation de l'eau", "Parce qu'il est fait de fines gouttelettes d'eau"],
      reponse: "Parce qu'il est fait de fines gouttelettes d'eau",
      explication: "Des gouttelettes, ce sont de toutes petites gouttes de liquide. Le brouillard est donc de l'eau liquide, même s'il flotte dans l'air.", source: P(3) },
    { id: "physique-s02-1-q14", fiche: "physique-s02-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque forme de l'eau à son état.",
      gauche: ["La grêle", "La rosée", "La vapeur d'eau"],
      droite: ["Liquide", "Gazeux", "Solide"],
      reponse: [[0, 2], [1, 0], [2, 1]],
      explication: "La grêle est solide, la rosée liquide. La vapeur d'eau est de l'eau gazeuse.", source: P(3) },
    { id: "physique-s02-1-q35", fiche: "physique-s02-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "La buée et la rosée sont de l'eau à l'état liquide.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : elles sont rangées avec la pluie, le brouillard et les nuages. Ce sont des formes d'eau liquide.", source: P(3) },
    { id: "physique-s02-1-q36", fiche: "physique-s02-1-f3", type: "vrai_faux", niveau: 3,
      enonce: "Le givre, la neige et la rosée sont trois formes d'eau solide.",
      corrections: ["Faux : le givre et la neige sont solides, mais la rosée est liquide.", "Faux : le givre et la rosée sont solides, mais la neige est liquide.", "Faux : la neige et la rosée sont solides, mais le givre est gazeux."],
      reponse: { vrai: false, correction: "Faux : le givre et la neige sont solides, mais la rosée est liquide." },
      explication: "Le givre et la neige sont de l'eau solide, comme la glace et la grêle. La rosée, elle, est de l'eau liquide.", source: P(3) },
    { id: "physique-s02-1-q37", fiche: "physique-s02-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment se forment les nuages ?",
      choix: ["La pluie remonte du sol vers le ciel dès que le soleil chauffe fort", "La vapeur d'eau de l'air se refroidit et forme des gouttelettes", "La neige des montagnes fond et flotte dans l'air en altitude", "Le vent soulève l'eau des lacs et la garde en l'air"],
      reponse: "La vapeur d'eau de l'air se refroidit et forme des gouttelettes",
      explication: "L'air humide monte et se refroidit : sa vapeur d'eau se change en minuscules gouttelettes d'eau liquide. Un nuage est donc fait d'eau liquide, comme le brouillard.", source: T("Nuage", "Nuage") },
    // f4 : le sulfate de cuivre anhydre
    { id: "physique-s02-1-q15", fiche: "physique-s02-1-f4", type: "qcm", niveau: 1,
      enonce: "Le sulfate de cuivre anhydre est une poudre blanche. Quelle couleur prend-il en présence d'eau ?",
      choix: ["Jaune", "Noir", "Bleu", "Rouge"],
      reponse: "Bleu",
      explication: "Blanc au départ, il devient bleu s'il y a de l'eau. C'est ce qui permet de la repérer.", source: P(3) },
    { id: "physique-s02-1-q16", fiche: "physique-s02-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Tous les liquides contiennent de l'eau.",
      corrections: ["Faux : avec le white-spirit, par exemple, le sulfate de cuivre anhydre reste blanc.", "Faux : avec l'alcool ménager, par exemple, le sulfate de cuivre anhydre devient bleu.", "Faux : seuls les liquides transparents contiennent de l'eau."],
      reponse: { vrai: false, correction: "Faux : avec le white-spirit, par exemple, le sulfate de cuivre anhydre reste blanc." },
      explication: "Certains liquides laissent la poudre blanche : ils ne contiennent pas d'eau. Le test le prouve.", source: P(3) },
    { id: "physique-s02-1-q17", fiche: "physique-s02-1-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Avec quels liquides le sulfate de cuivre anhydre devient-il bleu ?",
      choix: ["L'eau écarlate", "Le jus de fruits", "Un soda au cola", "Le lait", "L'alcool ménager", "Le white-spirit"],
      reponse: ["Le lait", "Le jus de fruits", "Un soda au cola"],
      explication: "Le lait, le jus de fruits et le cola contiennent de l'eau : la poudre bleuit. Avec les trois autres, elle reste blanche.", source: P(3) },
    { id: "physique-s02-1-q18", fiche: "physique-s02-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment savoir si un liquide contient de l'eau ?",
      choix: ["On regarde s'il est transparent et incolore, comme de l'eau", "On le chauffe et on regarde s'il fait de la vapeur", "On teste avec du sulfate de cuivre anhydre, qui bleuit", "On le verse et on regarde s'il coule comme de l'eau"],
      reponse: "On teste avec du sulfate de cuivre anhydre, qui bleuit",
      explication: "Le sulfate de cuivre anhydre, blanc, devient bleu au contact de l'eau. S'il reste blanc, le liquide ne contient pas d'eau.", source: P(3) },
    { id: "physique-s02-1-q40", fiche: "physique-s02-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Le sulfate de cuivre anhydre est une poudre bleue qui devient blanche en présence d'eau.",
      corrections: ["Faux : c'est une poudre blanche qui devient bleue en présence d'eau.", "Faux : c'est une poudre blanche qui devient rouge en présence d'eau.", "Faux : c'est une poudre bleue qui devient noire en présence d'eau."],
      reponse: { vrai: false, correction: "Faux : c'est une poudre blanche qui devient bleue en présence d'eau." },
      explication: "Au départ, la poudre est blanche. Elle bleuit quand elle touche de l'eau.", source: P(3) },
    { id: "physique-s02-1-q42", fiche: "physique-s02-1-f4", type: "qcm", niveau: 3,
      enonce: "Un liquide inconnu fait bleuir le sulfate de cuivre anhydre. Que peut-on en conclure ?",
      choix: ["C'est forcément de l'eau pure", "Il ne contient pas d'eau", "C'est forcément un poison", "Il contient de l'eau"],
      reponse: "Il contient de l'eau",
      explication: "Le bleu montre seulement qu'il y a de l'eau dans le liquide. Le lait ou le jus de fruits font aussi bleuir la poudre, sans être de l'eau pure.", source: P(3) },
    // f5 : l'eau et le corps
    { id: "physique-s02-1-q19", fiche: "physique-s02-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le corps a besoin d'eau pour vivre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est pourquoi on ne boit que des liquides qui contiennent de l'eau.", source: P(3) },
    { id: "physique-s02-1-q20", fiche: "physique-s02-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi ne faut-il surtout pas boire de white-spirit ni d'alcool ménager ?",
      choix: ["Parce qu'ils contiennent de l'eau de mer, non potable", "Parce que ce sont des liquides sans eau, et des poisons", "Parce qu'ils font bleuir le sulfate de cuivre anhydre blanc", "Parce qu'ils sont beaucoup trop sucrés"],
      reponse: "Parce que ce sont des liquides sans eau, et des poisons",
      explication: "Ils laissent le sulfate de cuivre blanc : ils ne contiennent pas d'eau. Ce sont des poisons.", source: P(3) },
    { id: "physique-s02-1-q21", fiche: "physique-s02-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Un être humain peut vivre plusieurs semaines sans boire.",
      corrections: ["Faux : sans boire, on ne tient que quelques jours.", "Faux : sans boire, on ne tient que quelques heures.", "Faux : on peut tenir plusieurs mois sans boire si l'on mange assez."],
      reponse: { vrai: false, correction: "Faux : sans boire, on ne tient que quelques jours." },
      explication: "Le corps perd de l'eau chaque jour, bien plus qu'il n'en produit : sans boire, la mort survient en quelques jours, deux à cinq environ. Sans manger, on tient bien plus longtemps.", source: T("Eau", "Eau") },
    { id: "physique-s02-1-q22", fiche: "physique-s02-1-f5", type: "qcm", niveau: 1,
      enonce: "Quelle part du corps d'un adulte est faite d'eau, environ ?",
      choix: ["Environ un dixième seulement", "Un peu moins d'un quart", "Près des deux tiers (65 %)", "Presque la totalité du corps"],
      reponse: "Près des deux tiers (65 %)",
      explication: "Le corps d'un adulte contient environ 65 % d'eau, et un bébé encore plus. C'est pour cela qu'il faut en boire chaque jour.", source: T("Eau", "Eau") },
    { id: "physique-s02-1-q45", fiche: "physique-s02-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment notre corps perd-il de l'eau chaque jour ?",
      choix: ["Seulement quand on pleure ou qu'on saigne", "Par l'urine, la sueur et la respiration", "Seulement en été, quand il fait chaud", "Il n'en perd jamais : il la garde toute"],
      reponse: "Par l'urine, la sueur et la respiration",
      explication: "Chaque jour, le corps rejette de l'eau dans l'urine, la sueur et même l'air qu'on expire. Il faut donc la remplacer en buvant et en mangeant.", source: T("Eau", "Eau") },
    { id: "physique-s02-1-q50", fiche: "physique-s02-1-f5", type: "qcm_multiple", niveau: 2,
      enonce: "D'où vient l'eau dont notre corps a besoin chaque jour ?",
      choix: ["Des boissons", "De l'air qu'on respire", "Des aliments, comme les fruits, les légumes ou la soupe", "De la lumière du soleil"],
      reponse: ["Des boissons", "Des aliments, comme les fruits, les légumes ou la soupe"],
      explication: "On boit la plus grande partie de l'eau qu'il nous faut, mais les aliments en apportent aussi. L'air et la lumière, eux, n'en apportent pas.", source: T("Eau", "Eau") },
    // f6 : les réserves d'eau
    { id: "physique-s02-1-q23", fiche: "physique-s02-1-f6", type: "qcm", niveau: 1,
      enonce: "Quel est le plus grand réservoir d'eau de la Terre ?",
      choix: ["Les cours d'eau", "Les nuages", "Les océans et les mers", "La vapeur d'eau de l'air"],
      reponse: "Les océans et les mers",
      explication: "Les océans et les mers contiennent le plus d'eau. Mais cette eau n'est pas potable.", source: P(3) },
    { id: "physique-s02-1-q24", fiche: "physique-s02-1-f6", type: "vrai_faux", niveau: 3,
      enonce: "Les océans et les mers sont le plus grand réservoir d'eau de la Terre, et leur eau est potable.",
      corrections: ["Faux : c'est bien le plus grand réservoir, mais leur eau n'est pas potable.", "Faux : leur eau est potable, mais ce n'est pas le plus grand réservoir.", "Faux : le plus grand réservoir, ce sont les cours d'eau, dont l'eau est potable."],
      reponse: { vrai: false, correction: "Faux : c'est bien le plus grand réservoir, mais leur eau n'est pas potable." },
      explication: "Les océans et les mers contiennent le plus d'eau, mais elle ne se boit pas. L'eau douce utilisable vient des cours d'eau.", source: P(3) },
    { id: "physique-s02-1-q25", fiche: "physique-s02-1-f6", type: "qcm", niveau: 2,
      enonce: "Quelle part de toute l'eau représente l'eau douce des cours d'eau, utilisable directement ?",
      choix: ["Environ 0,01 %", "Environ 25 %", "Environ la moitié", "Environ 75 %"],
      reponse: "Environ 0,01 %",
      explication: "L'eau douce utilisable directement est une toute petite part de l'eau. C'est environ 0,01 % du total.", source: P(3) },
    { id: "physique-s02-1-q26", fiche: "physique-s02-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi les cours d'eau sont-ils une réserve si importante, alors qu'ils contiennent très peu d'eau ?",
      choix: ["Ils contiennent la plus grande partie de l'eau de la Terre", "Leur eau ne s'évapore jamais, même en été", "Leur eau douce sert à boire, à cultiver et à fabriquer", "Leur eau est la seule qui ne gèle jamais en hiver"],
      reponse: "Leur eau douce sert à boire, à cultiver et à fabriquer",
      explication: "Les océans et les mers ont bien plus d'eau, mais elle n'est pas potable. L'eau douce des cours d'eau, environ 0,01 % du total, est celle qu'on utilise directement.", source: P(3) },
    { id: "physique-s02-1-q47", fiche: "physique-s02-1-f6", type: "vrai_faux", niveau: 3,
      enonce: "La plus grande partie de l'eau douce de la Terre est stockée sous forme de glace et de neige.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : environ 70 % de l'eau douce est gelée, dans les glaciers et aux pôles. L'eau des cours d'eau, celle qu'on utilise directement, n'en est qu'une toute petite part.", source: T("Eau douce", "Eau_douce") },
    { id: "physique-s02-1-q48", fiche: "physique-s02-1-f6", type: "qcm", niveau: 1,
      enonce: "Dans le cycle de l'eau, qu'est-ce qui fait passer l'eau des océans dans l'air ?",
      choix: ["Le vent, qui l'arrache aux vagues", "Les poissons, qui la rejettent en respirant", "La chaleur du Soleil, qui l'évapore", "Le sel, qui la fait monter dans le ciel"],
      reponse: "La chaleur du Soleil, qui l'évapore",
      explication: "Chauffée par le Soleil, l'eau de surface s'évapore et monte dans l'air sous forme de vapeur. C'est le moteur du cycle de l'eau.", source: T("Cycle de l'eau", "Cycle_de_l%27eau") },
    { id: "physique-s02-1-q49", fiche: "physique-s02-1-f6", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on une eau qu'on peut boire sans danger ?",
      choix: ["Une eau potable", "Une eau anhydre", "Une eau écarlate", "Une eau évaporée"],
      reponse: "Une eau potable",
      explication: "Potable veut dire qu'on peut la boire sans danger. L'eau des océans et des mers, elle, n'est pas potable.", source: P(3) }
  ],
  bonus: [
    {
      id: "physique-s02-1-b1",
      fiche: "physique-s02-1-f6",
      titre: "Un réservoir d'eau douce gelé",
      texte: "En Antarctique, l'inlandsis, une immense calotte de glace, couvre la plus grande partie du continent. Cette glace contient environ 61 % de l'eau douce de la Terre. Si elle fondait, le niveau des mers monterait d'environ 58 m.",
      source: { titre: "Inlandsis de l'Antarctique", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Inlandsis_de_l%27Antarctique" }
    }
  ],
  nonCouvert: [
    "Le livret de cours de la séance n'est pas déposé : seules les réponses du corrigé servent de source.",
    "Le cycle de l'eau lui-même (le trajet de l'eau entre océans, nuages, pluie et cours d'eau, et son schéma) : le corrigé de la séance ne le décrit pas.",
    "Les définitions écrites de la vaporisation et de la liquéfaction : le corrigé ne donne que des exemples ; le jeu en tire le sens (liquide → gaz, gaz → liquide) à vérifier sur le livret.",
    "Les autres réservoirs d'eau et leurs parts : le corrigé ne cite que les océans et les mers, et les cours d'eau.",
    "Les trois récipients de l'exercice 1 (dessin de l'état liquide, solide et gazeux) : le corrigé ne donne que les noms des états, sans explication."
  ]
};
